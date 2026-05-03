import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

type ServiceAccount = {
  client_email: string;
  private_key: string;
  token_uri?: string;
};

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const body = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s+/g, "");
  const binary = atob(body);
  const buf = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < binary.length; i++) view[i] = binary.charCodeAt(i);
  return buf;
}

function base64url(input: string | Uint8Array): string {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  let str = "";
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function getAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/webmasters.readonly",
    aud: sa.token_uri ?? "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const signingInput = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;
  const keyBuf = pemToArrayBuffer(sa.private_key.replace(/\\n/g, "\n"));
  const key = await crypto.subtle.importKey(
    "pkcs8",
    keyBuf,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sigBuf = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(signingInput),
  );
  const jwt = `${signingInput}.${base64url(new Uint8Array(sigBuf))}`;

  const res = await fetch(sa.token_uri ?? "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google OAuth failed: ${res.status} ${text}`);
  }
  const body = await res.json();
  return body.access_token as string;
}

type SearchAnalyticsRow = {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

async function querySearchAnalytics(
  accessToken: string,
  siteUrl: string,
  startDate: string,
  endDate: string,
  dimensions: string[],
): Promise<SearchAnalyticsRow[]> {
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
  const rows: SearchAnalyticsRow[] = [];
  let startRow = 0;
  const rowLimit = 25000;

  while (true) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions,
        rowLimit,
        startRow,
        dataState: "final",
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`GSC API failed: ${res.status} ${text}`);
    }
    const body = await res.json();
    const batch: SearchAnalyticsRow[] = body.rows ?? [];
    rows.push(...batch);
    if (batch.length < rowLimit) break;
    startRow += rowLimit;
    if (startRow > 250000) break;
  }
  return rows;
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const runStarted = new Date().toISOString();
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: runRow } = await supabase
    .from("gsc_sync_runs")
    .insert({ started_at: runStarted, status: "running" })
    .select()
    .maybeSingle();
  const runId = runRow?.id;

  try {
    const saJson = Deno.env.get("GSC_SERVICE_ACCOUNT_JSON");
    const siteUrl = Deno.env.get("GSC_SITE_URL");
    if (!saJson || !siteUrl) {
      throw new Error("GSC_SERVICE_ACCOUNT_JSON and GSC_SITE_URL must be set");
    }
    const sa: ServiceAccount = JSON.parse(saJson);

    const url = new URL(req.url);
    const days = parseInt(url.searchParams.get("days") ?? "7", 10);
    const endDate = isoDaysAgo(2);
    const startDate = isoDaysAgo(2 + Math.max(1, Math.min(90, days)));

    const accessToken = await getAccessToken(sa);

    const byPageQuery = await querySearchAnalytics(accessToken, siteUrl, startDate, endDate, [
      "date",
      "page",
      "query",
    ]);
    const byPage = await querySearchAnalytics(accessToken, siteUrl, startDate, endDate, [
      "date",
      "page",
    ]);

    const rows: Array<{
      date: string;
      page: string;
      query: string;
      clicks: number;
      impressions: number;
      ctr: number;
      position: number;
    }> = [];

    for (const r of byPageQuery) {
      rows.push({
        date: r.keys[0],
        page: r.keys[1] ?? "",
        query: r.keys[2] ?? "",
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: r.ctr,
        position: r.position,
      });
    }
    for (const r of byPage) {
      rows.push({
        date: r.keys[0],
        page: r.keys[1] ?? "",
        query: "",
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: r.ctr,
        position: r.position,
      });
    }

    let written = 0;
    const batchSize = 500;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const { error } = await supabase
        .from("gsc_daily_metrics")
        .upsert(batch, { onConflict: "date,page,query" });
      if (error) throw new Error(`Supabase upsert: ${error.message}`);
      written += batch.length;
    }

    if (runId) {
      await supabase
        .from("gsc_sync_runs")
        .update({
          finished_at: new Date().toISOString(),
          rows_written: written,
          status: "success",
        })
        .eq("id", runId);
    }

    return new Response(
      JSON.stringify({ ok: true, startDate, endDate, rowsWritten: written }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (runId) {
      await supabase
        .from("gsc_sync_runs")
        .update({
          finished_at: new Date().toISOString(),
          status: "error",
          error: message,
        })
        .eq("id", runId);
    }
    return new Response(
      JSON.stringify({ ok: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
