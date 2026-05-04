import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ROOT_DOMAIN = "investingandretirement.com";
const SITE_URL = `https://${ROOT_DOMAIN}`;

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

type ResolvedOffer = {
  partner_id: string | null;
  partner_status: string | null;
  partner_default_url: string | null;
  offer_id: string | null;
  offer_destination_url: string | null;
  offer_campaign: string | null;
  offer_content: string | null;
  offer_term: string | null;
  offer_active: boolean;
};

// Per-isolate in-memory cache. Supabase edge functions reuse isolates for
// warm requests, so this avoids the DB round-trip on the hot path. TTL is
// short enough that partner/offer status changes propagate quickly.
const RESOLVE_TTL_MS = 60_000;
const resolveCache = new Map<string, { value: ResolvedOffer | null; expires: number }>();

async function resolvePartnerOffer(
  partnerSlug: string,
  offerSlug: string,
): Promise<ResolvedOffer | null> {
  const key = `${partnerSlug}::${offerSlug}`;
  const cached = resolveCache.get(key);
  const now = Date.now();
  if (cached && cached.expires > now) return cached.value;

  const { data, error } = await supabase.rpc("resolve_partner_offer", {
    p_partner_slug: partnerSlug,
    p_offer_slug: offerSlug,
  });

  if (error) {
    console.error("[redirect] resolve rpc error", error);
    return null;
  }

  const row = (Array.isArray(data) ? data[0] : data) as ResolvedOffer | undefined;
  const value = row ?? null;
  resolveCache.set(key, { value, expires: now + RESOLVE_TTL_MS });
  return value;
}

function parsePartnerFromHost(host: string): string | null {
  const h = host.toLowerCase().split(":")[0];
  if (!h.endsWith(ROOT_DOMAIN)) return null;
  const prefix = h.slice(0, h.length - ROOT_DOMAIN.length).replace(/\.$/, "");
  if (!prefix || prefix === "www") return null;
  const parts = prefix.split(".");
  return parts[parts.length - 1] || null;
}

function appendUtm(rawUrl: string, params: Record<string, string>): string {
  try {
    const u = new URL(rawUrl);
    for (const [k, v] of Object.entries(params)) {
      if (v && !u.searchParams.has(k)) u.searchParams.set(k, v);
    }
    return u.toString();
  } catch {
    return rawUrl;
  }
}

async function sha256(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function redirectWith(location: string): Response {
  return new Response(null, {
    status: 302,
    headers: {
      Location: location,
      "X-Robots-Tag": "noindex, nofollow",
      "Cache-Control": "private, no-store",
    },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);

    const rawPath = url.pathname
      .replace(/^\/functions\/v1\/redirect\/?/, "/")
      .replace(/^\/redirect\/?/, "/")
      .replace(/^\/+|\/+$/g, "");
    const segments = rawPath.split("/").filter(Boolean);

    const lastPathSegment = segments[segments.length - 1] || "";
    const robotsRequested =
      lastPathSegment === "robots.txt" || url.pathname.endsWith("/robots.txt");
    if (robotsRequested) {
      return new Response("User-agent: *\nDisallow: /\n", {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "public, max-age=86400",
          "X-Robots-Tag": "noindex, nofollow",
        },
      });
    }

    let partnerSlug: string | null = null;
    let offerSlug = "";
    if (segments[0] === "_p" && segments[1]) {
      partnerSlug = segments[1];
      offerSlug = segments[2] || "";
    } else {
      const host = req.headers.get("x-forwarded-host") ?? url.host;
      partnerSlug = parsePartnerFromHost(host);
      offerSlug = segments[0] || "";
    }

    if (!partnerSlug) {
      return redirectWith(SITE_URL);
    }

    const resolved = await resolvePartnerOffer(partnerSlug, offerSlug);

    if (!resolved || !resolved.partner_id || resolved.partner_status !== "active") {
      return redirectWith(SITE_URL);
    }

    let destination = resolved.partner_default_url || SITE_URL;
    let offerId: string | null = null;
    let offerCampaign = "";
    let offerContent = "";
    let offerTerm = "";

    if (resolved.offer_active && resolved.offer_destination_url) {
      destination = resolved.offer_destination_url;
      offerId = resolved.offer_id;
      offerCampaign = resolved.offer_campaign || "";
      offerContent = resolved.offer_content || "";
      offerTerm = resolved.offer_term || "";
    }

    const placement = url.searchParams.get("p") || offerContent;
    const term = url.searchParams.get("t") || offerTerm;
    const utmContent = placement || "";
    const utmCampaign = offerCampaign || offerSlug || partnerSlug;

    const finalUrl = appendUtm(destination, {
      utm_source: "investingandretirement",
      utm_medium: "affiliate",
      utm_campaign: utmCampaign,
      utm_content: utmContent,
      utm_term: term,
    });

    const response = redirectWith(finalUrl);

    // Background-log the click so the 302 is returned immediately. The
    // IP hash is computed inside the background task because SHA-256 adds
    // ~1ms that shouldn't block the redirect.
    const referrer = req.headers.get("referer") ?? "";
    const userAgent = req.headers.get("user-agent") ?? "";
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("cf-connecting-ip") ??
      "";
    const country =
      req.headers.get("x-vercel-ip-country") ?? req.headers.get("cf-ipcountry") ?? "";

    const logTask = (async () => {
      try {
        const ipHash = ip ? await sha256(ip) : "";
        await supabase.from("offer_clicks").insert({
          partner_slug: partnerSlug,
          offer_slug: offerSlug,
          offer_id: offerId,
          destination_url: finalUrl,
          referrer,
          user_agent: userAgent,
          ip_hash: ipHash,
          country,
          placement,
          term,
          utm_source: "investingandretirement",
          utm_medium: "affiliate",
          utm_campaign: utmCampaign,
          utm_content: utmContent,
        });
      } catch (e) {
        console.error("[redirect] click log error", e);
      }
    })();

    try {
      (globalThis as any).EdgeRuntime?.waitUntil?.(logTask);
    } catch {
      // background task API unavailable; the promise still runs
    }

    return response;
  } catch (err) {
    console.error("[redirect] error", err);
    return redirectWith(SITE_URL);
  }
});
