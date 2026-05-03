import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "yopmail.com", "tempmail.com", "10minutemail.com",
  "guerrillamail.com", "sharklasers.com", "trashmail.com", "throwawaymail.com",
  "getnada.com", "temp-mail.org", "dispostable.com", "maildrop.cc",
  "fakeinbox.com", "mailnesia.com", "spamgourmet.com", "tempr.email",
]);

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const body = await req.json().catch(() => null) as {
      email?: string;
      source?: string;
      website?: string;          // honeypot — must be empty
      startedAt?: number;        // client timestamp when the form was shown
    } | null;

    if (!body) return json({ error: "Invalid request" }, 400);

    // Honeypot: real users never fill this hidden field.
    if (typeof body.website === "string" && body.website.trim() !== "") {
      return json({ ok: true, status: "pending" }, 200); // pretend success
    }

    // Timing guard: reject submissions faster than 1.5s (likely bots).
    if (typeof body.startedAt === "number") {
      const elapsed = Date.now() - body.startedAt;
      if (elapsed < 1500) {
        return json({ ok: true, status: "pending" }, 200);
      }
    }

    const emailRaw = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!emailRaw || emailRaw.length > 254 || !EMAIL_RE.test(emailRaw)) {
      return json({ error: "Please enter a valid email address." }, 400);
    }
    const domain = emailRaw.split("@")[1] || "";
    if (DISPOSABLE_DOMAINS.has(domain)) {
      return json({ error: "Please use a non-disposable email address." }, 400);
    }

    const source = (typeof body.source === "string" ? body.source : "unknown").slice(0, 40);
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "0.0.0.0";
    const userAgent = req.headers.get("user-agent")?.slice(0, 400) || "";
    const ipHash = await sha256(ip);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Rate limit: max 5 subscribe attempts per IP per hour.
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentCount } = await supabase
      .from("newsletter_subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", hourAgo);
    if ((recentCount ?? 0) >= 5) {
      return json({ error: "Too many attempts. Please try again later." }, 429);
    }

    // Already subscribed?
    const { data: existing } = await supabase
      .from("newsletter_subscriptions")
      .select("id, status")
      .eq("email", emailRaw)
      .maybeSingle();

    if (existing?.status === "confirmed") {
      return json({ ok: true, status: "already_subscribed" }, 200);
    }

    // Call Beehiiv. Double opt-in must be enabled on the publication
    // (Dashboard → Settings → Publication → Double opt-in).
    const apiKey = Deno.env.get("BEEHIIV_API_KEY");
    const pubId = Deno.env.get("BEEHIIV_PUBLICATION_ID");
    if (!apiKey || !pubId) {
      return json({ error: "Newsletter service not configured." }, 500);
    }

    const beehiivResp = await fetch(
      `https://api.beehiiv.com/v2/publications/${pubId}/subscriptions`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailRaw,
          reactivate_existing: false,
          send_welcome_email: false,
          double_opt_override: "on",
          utm_source: "investingandretirement.com",
          utm_medium: source,
          referring_site: "https://www.investingandretirement.com",
        }),
      },
    );

    const beehiivData = await beehiivResp.json().catch(() => ({}));
    if (!beehiivResp.ok) {
      await supabase.from("newsletter_subscriptions").upsert(
        {
          email: emailRaw,
          status: "failed",
          source,
          ip_hash: ipHash,
          user_agent: userAgent,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" },
      );
      return json({ error: "Subscription failed. Please try again." }, 502);
    }

    const beehiivId = beehiivData?.data?.id ?? "";

    await supabase.from("newsletter_subscriptions").upsert(
      {
        email: emailRaw,
        status: "pending",
        source,
        ip_hash: ipHash,
        user_agent: userAgent,
        beehiiv_id: beehiivId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email" },
    );

    return json({ ok: true, status: "pending" }, 200);
  } catch (err) {
    console.error("[newsletter-subscribe]", err);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
});
