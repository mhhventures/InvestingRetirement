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

    // Every path on a partner subdomain is a tracked redirect with no
    // canonical content. Serve a strict robots.txt + noindex header so
    // crawlers (Ahrefs, Googlebot) stop reporting these URLs as broken
    // links when the merchant destination bot-blocks them.
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

    // Vercel rewrites from partner subdomains using the `/_p/<partner>/<path*>`
    // prefix so the partner slug survives the external rewrite (Host header is
    // lost on external rewrites). Direct hits still fall back to the Host.
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

    const redirectWith = (location: string) =>
      new Response(null, {
        status: 302,
        headers: {
          Location: location,
          "X-Robots-Tag": "noindex, nofollow",
          "Cache-Control": "private, no-store",
        },
      });

    if (!partnerSlug) {
      return redirectWith(SITE_URL);
    }

    const { data: partner } = await supabase
      .from("partners")
      .select("id, slug, default_destination_url, status")
      .eq("slug", partnerSlug)
      .maybeSingle();

    if (!partner || partner.status !== "active") {
      return redirectWith(SITE_URL);
    }

    let destination = partner.default_destination_url || SITE_URL;
    let offerId: string | null = null;
    let offerCampaign = "";
    let offerContent = "";
    let offerTerm = "";

    if (offerSlug) {
      const { data: offer } = await supabase
        .from("offers")
        .select("id, destination_url, campaign, content, term, active, starts_at, ends_at")
        .eq("partner_id", partner.id)
        .eq("slug", offerSlug)
        .maybeSingle();

      if (offer && offer.active) {
        const now = Date.now();
        const startsOk = !offer.starts_at || new Date(offer.starts_at).getTime() <= now;
        const endsOk = !offer.ends_at || new Date(offer.ends_at).getTime() > now;
        if (startsOk && endsOk) {
          destination = offer.destination_url;
          offerId = offer.id;
          offerCampaign = offer.campaign || "";
          offerContent = offer.content || "";
          offerTerm = offer.term || "";
        }
      }
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

    const referrer = req.headers.get("referer") ?? "";
    const userAgent = req.headers.get("user-agent") ?? "";
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("cf-connecting-ip") ??
      "";
    const country = req.headers.get("x-vercel-ip-country") ?? req.headers.get("cf-ipcountry") ?? "";
    const ipHash = ip ? await sha256(ip) : "";

    const logPromise = supabase.from("offer_clicks").insert({
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

    try {
      (globalThis as any).EdgeRuntime?.waitUntil?.(logPromise);
    } catch {
      // background task API unavailable; fall through
    }

    return redirectWith(finalUrl);
  } catch (err) {
    console.error("[redirect] error", err);
    return new Response(null, {
      status: 302,
      headers: {
        Location: SITE_URL,
        "X-Robots-Tag": "noindex, nofollow",
        "Cache-Control": "private, no-store",
      },
    });
  }
});
