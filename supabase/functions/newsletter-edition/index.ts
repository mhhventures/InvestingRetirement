import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, x-admin-token",
};

const SITE_URL = "https://www.investingandretirement.com";

type Product = {
  slug: string;
  name: string;
  provider: string;
  subcategory: string;
  tagline: string;
  apy?: string;
  bonus?: string;
  fees: string;
  minDeposit: string;
  grade?: string;
  bestFor: string;
  url: string;
  logoText: string;
  rating?: number;
  reviews?: number;
  category?: string;
  editorsPick?: boolean;
  promoNote?: string;
};

type LinkCard = {
  kind: "link";
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  ctaLabel: string;
  href: string;
  editorsPick?: boolean;
};

type Item = Product | LinkCard;
const isLinkCard = (x: Item): x is LinkCard => (x as LinkCard).kind === "link";

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const domainFromUrl = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};

const logoUrl = (url: string, token: string | null) => {
  const domain = domainFromUrl(url);
  if (!domain) return "";
  if (token) {
    return `https://img.logo.dev/${domain}?token=${token}&size=128&format=png&fallback=monogram`;
  }
  return `https://logo.clearbit.com/${domain}?size=128`;
};

const gradeBg = (grade?: string) => {
  if (!grade) return "#1a1a1a";
  if (grade.startsWith("A")) return "#0e4d45";
  if (grade.startsWith("B")) return "#1a1a1a";
  return "#540f04";
};

const starRow = (rating?: number, reviews?: number) => {
  if (!rating) return "";
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const stars = "\u2605".repeat(full) + (half ? "\u2605" : "");
  const reviewsStr = reviews ? ` <span style="color:#5a5a5a;font-family:Helvetica,Arial,sans-serif;font-size:12px;">(${reviews.toLocaleString()})</span>` : "";
  return `<span style="color:#c9a882;font-family:Georgia,serif;font-size:14px;letter-spacing:0.05em;">${stars}</span> <span style="color:#5a5a5a;font-family:Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;">${rating.toFixed(1)}</span>${reviewsStr}`;
};

const renderCard = (p: Product, rank: number, utm: string, logoToken: string | null) => {
  const href = `${p.url}${p.url.includes("?") ? "&" : "?"}${utm}`;
  const reviewHref = `${SITE_URL}/product/${p.slug}?${utm}`;
  const logo = logoUrl(p.url, logoToken);
  const logoCell = logo
    ? `<img src="${logo}" alt="${escapeHtml(p.name)}" width="48" height="48" style="display:block;width:48px;height:48px;border:0;outline:none;border-radius:3px;background:#ffffff;border:1px solid #e4d9cf;padding:4px;box-sizing:border-box;" />`
    : `<div style="width:48px;height:48px;background:#0e4d45;color:#fef6f1;font-family:Georgia,serif;font-weight:700;font-size:14px;line-height:48px;text-align:center;border-radius:3px;">${escapeHtml(p.logoText.slice(0, 2))}</div>`;

  const gradeBadge = p.grade
    ? `<span style="display:inline-block;background:${gradeBg(p.grade)};color:#fef6f1;font-family:Georgia,serif;font-weight:700;font-size:11px;padding:2px 7px;border-radius:2px;letter-spacing:0.01em;">${escapeHtml(p.grade)}</span>`
    : "";

  const promoBanner = p.promoNote
    ? `<tr><td style="padding:0 20px 12px 20px;"><div style="padding:10px 12px;background:#fff8e6;border:1px solid #f2d98a;border-radius:3px;font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#6b4e00;line-height:1.5;"><strong style="color:#4a3600;text-transform:uppercase;letter-spacing:0.08em;font-size:10px;">Newsletter exclusive</strong><br/>${escapeHtml(p.promoNote)}</div></td></tr>`
    : "";

  const leftLabel = p.apy ? "APY" : "Bonus";
  const leftValue = p.apy ?? p.bonus ?? "—";
  const leftColor = p.apy ? "#0e4d45" : "#1a1a1a";
  const rightLabel = p.bonus && p.apy ? "Bonus" : "Min";
  const rightValue = p.bonus && p.apy ? p.bonus : p.minDeposit;

  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:0 0 18px 0;background:#ffffff;border:1px solid #d4c5b8;border-radius:3px;border-collapse:separate;">
    <tr>
      <td style="padding:18px 20px 0 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="font-family:Helvetica,Arial,sans-serif;font-size:11px;font-weight:700;color:#0e4d45;text-transform:uppercase;letter-spacing:0.15em;">${escapeHtml(p.subcategory)}</td>
            <td align="right" style="font-family:Helvetica,Arial,sans-serif;font-size:10px;font-weight:700;color:#540f04;text-transform:uppercase;letter-spacing:0.15em;">${p.editorsPick ? "Editor&rsquo;s Pick" : `#${String(rank).padStart(2, "0")}`}</td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:12px 20px 0 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="60" valign="top" style="padding-right:12px;">${logoCell}</td>
            <td valign="top">
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:700;color:#000000;line-height:1.2;">${escapeHtml(p.name)}</div>
              <div style="margin-top:6px;line-height:1;">
                ${starRow(p.rating, p.reviews)} ${gradeBadge ? `&nbsp; ${gradeBadge}` : ""}
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:14px 20px 0 20px;">
        <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#1a1a1a;line-height:1.55;">${escapeHtml(p.tagline)}</p>
      </td>
    </tr>
    ${promoBanner}
    <tr>
      <td style="padding:14px 20px 0 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #e4d9cf;">
          <tr>
            <td width="50%" valign="top" style="padding:14px 8px 14px 0;">
              <div style="font-family:Helvetica,Arial,sans-serif;font-size:10px;color:#5a5a5a;text-transform:uppercase;letter-spacing:0.12em;">${leftLabel}</div>
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:${leftColor};line-height:1.15;margin-top:4px;">${escapeHtml(leftValue)}</div>
            </td>
            <td width="50%" valign="top" style="padding:14px 0 14px 8px;">
              <div style="font-family:Helvetica,Arial,sans-serif;font-size:10px;color:#5a5a5a;text-transform:uppercase;letter-spacing:0.12em;">${rightLabel}</div>
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#000000;line-height:1.15;margin-top:4px;">${escapeHtml(rightValue)}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:4px 20px 20px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="50%" style="padding-right:6px;">
              <a href="${escapeHtml(reviewHref)}" style="display:block;background:#0e4d45;color:#fef6f1;font-family:Helvetica,Arial,sans-serif;font-size:12px;font-weight:700;text-align:center;text-decoration:none;text-transform:uppercase;letter-spacing:0.12em;padding:13px 10px;border-radius:2px;">Read Review</a>
            </td>
            <td width="50%" style="padding-left:6px;">
              <a href="${escapeHtml(href)}" style="display:block;background:#ffffff;color:#000000;font-family:Helvetica,Arial,sans-serif;font-size:12px;font-weight:700;text-align:center;text-decoration:none;text-transform:uppercase;letter-spacing:0.12em;padding:12px 10px;border:1px solid #d4c5b8;border-radius:2px;">Visit Site</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
};

const renderLinkCard = (c: LinkCard, rank: number, utm: string) => {
  const fullHref = c.href.startsWith("http") ? c.href : `${SITE_URL}${c.href}`;
  const href = `${fullHref}${fullHref.includes("?") ? "&" : "?"}${utm}`;

  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:0 0 18px 0;background:#ffffff;border:1px solid #d4c5b8;border-radius:3px;border-collapse:separate;">
    <tr>
      <td style="padding:18px 20px 0 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="font-family:Helvetica,Arial,sans-serif;font-size:11px;font-weight:700;color:#0e4d45;text-transform:uppercase;letter-spacing:0.15em;">${escapeHtml(c.eyebrow)}</td>
            <td align="right" style="font-family:Helvetica,Arial,sans-serif;font-size:10px;font-weight:700;color:#540f04;text-transform:uppercase;letter-spacing:0.15em;">${c.editorsPick ? "Editor&rsquo;s Pick" : `#${String(rank).padStart(2, "0")}`}</td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:12px 20px 0 20px;">
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#000000;line-height:1.25;">${escapeHtml(c.title)}</div>
        <p style="margin:10px 0 0 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#1a1a1a;line-height:1.55;">${escapeHtml(c.description)}</p>
      </td>
    </tr>
    <tr>
      <td style="padding:18px 20px 20px 20px;">
        <a href="${escapeHtml(href)}" style="display:block;background:#0e4d45;color:#fef6f1;font-family:Helvetica,Arial,sans-serif;font-size:12px;font-weight:700;text-align:center;text-decoration:none;text-transform:uppercase;letter-spacing:0.12em;padding:13px 10px;border-radius:2px;">${escapeHtml(c.ctaLabel)}</a>
      </td>
    </tr>
  </table>`;
};

const renderEdition = (opts: {
  headline: string;
  intro: string;
  products: Item[];
  weekStart: string;
  category: string;
  logoToken: string | null;
}) => {
  const utm = `utm_source=newsletter&utm_medium=email&utm_campaign=${encodeURIComponent(opts.category)}-${opts.weekStart}`;
  const cards = opts.products
    .map((item, i) =>
      isLinkCard(item)
        ? renderLinkCard(item, i + 1, utm)
        : renderCard(item, i + 1, utm, opts.logoToken),
    )
    .join("");

  return `<div style="background:#faf7f2;padding:24px 16px;font-family:Georgia,'Times New Roman',serif;">
  <div style="max-width:600px;margin:0 auto;">
    <div style="font-family:Georgia,'Times New Roman',serif;font-size:11px;color:#8a7a6b;text-transform:uppercase;letter-spacing:0.12em;">Week of ${escapeHtml(opts.weekStart)} &middot; ${escapeHtml(opts.category)}</div>
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:28px;color:#1a1a1a;font-weight:700;line-height:1.2;margin:8px 0 12px 0;">${escapeHtml(opts.headline)}</h1>
    <p style="font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#5a5a5a;line-height:1.6;margin:0 0 24px 0;">${escapeHtml(opts.intro)}</p>
    ${cards}
    <p style="font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#8a7a6b;line-height:1.5;margin:24px 0 0 0;">Rates and offers change frequently. Verify on the provider&rsquo;s site before applying. Some links are affiliate links that may earn us a commission at no cost to you.</p>
  </div>
</div>`;
};

const mondayOf = (d: Date) => {
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  const m = new Date(d);
  m.setUTCDate(d.getUTCDate() + diff);
  return m.toISOString().slice(0, 10);
};

const categoryKey = (c: string) =>
  c.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const adminToken = Deno.env.get("NEWSLETTER_ADMIN_TOKEN");
    if (adminToken) {
      const provided = req.headers.get("x-admin-token");
      if (provided !== adminToken) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const logoToken = Deno.env.get("LOGO_DEV_TOKEN") ?? null;

    if (req.method === "GET") {
      const url = new URL(req.url);
      const weekStart = url.searchParams.get("week");
      const category = url.searchParams.get("category");

      if (weekStart && category) {
        const { data, error } = await supabase
          .from("newsletter_editions")
          .select("*")
          .eq("week_start", weekStart)
          .eq("category", categoryKey(category))
          .maybeSingle();
        if (error) throw error;
        if (!data) {
          return new Response(JSON.stringify({ error: "Not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const format = url.searchParams.get("format") ?? "html";
        if (format === "json") {
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        return new Response(data.rendered_html, {
          headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
        });
      }

      const { data, error } = await supabase
        .from("newsletter_editions")
        .select("id, week_start, category, headline, product_slugs, sent_at, created_at")
        .order("week_start", { ascending: false })
        .limit(50);
      if (error) throw error;
      return new Response(JSON.stringify({ editions: data ?? [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const products: Item[] = Array.isArray(body.products) ? body.products : [];
    if (products.length === 0) {
      return new Response(
        JSON.stringify({ error: "products array is required in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const firstProduct = products.find((p): p is Product => !isLinkCard(p));
    const category: string = body.category ?? firstProduct?.subcategory ?? "Weekly Picks";
    const weekStart: string = body.week_start ?? mondayOf(new Date());
    const headline: string =
      body.headline ?? `This week's top ${category.toLowerCase()} picks`;
    const intro: string =
      body.intro ??
      `Our editors ranked this week's best ${category.toLowerCase()} by APY, fees, and account quality. Rates as of ${weekStart}.`;
    const catKey = categoryKey(category);

    const renderedHtml = renderEdition({
      headline,
      intro,
      products,
      weekStart,
      category,
      logoToken,
    });

    const { data: existing } = await supabase
      .from("newsletter_editions")
      .select("id")
      .eq("week_start", weekStart)
      .eq("category", catKey)
      .maybeSingle();

    const payload = {
      week_start: weekStart,
      category: catKey,
      headline,
      intro,
      product_slugs: products.map((p) => p.slug),
      rendered_html: renderedHtml,
      updated_at: new Date().toISOString(),
    };

    let editionId: string | null = null;
    if (existing?.id) {
      const { data, error } = await supabase
        .from("newsletter_editions")
        .update(payload)
        .eq("id", existing.id)
        .select("id")
        .maybeSingle();
      if (error) throw error;
      editionId = data?.id ?? existing.id;
    } else {
      const { data, error } = await supabase
        .from("newsletter_editions")
        .insert(payload)
        .select("id")
        .maybeSingle();
      if (error) throw error;
      editionId = data?.id ?? null;
    }

    return new Response(
      JSON.stringify({
        id: editionId,
        week_start: weekStart,
        category: catKey,
        headline,
        intro,
        product_slugs: products.map((p) => p.slug),
        rendered_html: renderedHtml,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
