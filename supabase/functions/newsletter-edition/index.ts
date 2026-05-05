import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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
  editorsPick?: boolean;
  promoNote?: string;
};

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

const renderCard = (p: Product, rank: number, utm: string, logoToken: string | null) => {
  const headline = p.apy ? `${p.apy} APY` : p.bonus ? p.bonus : p.tagline;
  const href = `${p.url}${p.url.includes("?") ? "&" : "?"}${utm}`;
  const logo = logoUrl(p.url, logoToken);
  const logoCell = logo
    ? `<img src="${logo}" alt="${escapeHtml(p.name)}" width="32" height="32" style="display:block;width:32px;height:32px;border:0;outline:none;border-radius:4px;" />`
    : `<div style="width:32px;height:32px;background:#1e3a8a;color:#fff;font-family:Georgia,serif;font-weight:700;font-size:14px;line-height:32px;text-align:center;border-radius:4px;">${escapeHtml(p.logoText.slice(0, 2))}</div>`;

  const pickRibbon = p.editorsPick
    ? `<div style="background:#1a1a1a;color:#ffffff;font-family:Helvetica,Arial,sans-serif;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;padding:6px 12px;">Editor&rsquo;s Pick</div>`
    : "";

  const promoBanner = p.promoNote
    ? `<div style="margin-top:14px;padding:10px 12px;background:#fff8e6;border:1px solid #f2d98a;border-radius:4px;font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#6b4e00;line-height:1.5;"><strong style="color:#4a3600;">Newsletter exclusive:</strong> ${escapeHtml(p.promoNote)}</div>`
    : "";

  const borderColor = p.editorsPick ? "#1a1a1a" : "#e4d9cf";
  const borderWidth = p.editorsPick ? "2px" : "1px";

  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:0 0 16px 0;background:#ffffff;border:${borderWidth} solid ${borderColor};border-radius:4px;overflow:hidden;">
    ${pickRibbon ? `<tr><td>${pickRibbon}</td></tr>` : ""}
    <tr>
      <td style="padding:20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="48" valign="top">${logoCell}</td>
            <td valign="top" style="padding-left:12px;">
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:11px;color:#8a7a6b;text-transform:uppercase;letter-spacing:0.08em;">#${rank} &middot; ${escapeHtml(p.subcategory)}${p.grade ? ` &middot; ${escapeHtml(p.grade)}` : ""}</div>
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:20px;color:#1a1a1a;font-weight:700;line-height:1.2;margin-top:4px;">${escapeHtml(p.name)}</div>
              <div style="font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#5a5a5a;line-height:1.5;margin-top:4px;">${escapeHtml(p.tagline)}</div>
            </td>
          </tr>
        </table>
        ${promoBanner}

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;border-top:1px solid #f0e8de;border-bottom:1px solid #f0e8de;">
          <tr>
            <td width="50%" style="padding:12px 8px 12px 0;border-right:1px solid #f0e8de;">
              <div style="font-family:Helvetica,Arial,sans-serif;font-size:10px;color:#8a7a6b;text-transform:uppercase;letter-spacing:0.08em;">${p.apy ? "APY" : "Bonus"}</div>
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#1a1a1a;font-weight:700;line-height:1.2;margin-top:2px;">${escapeHtml(headline)}</div>
            </td>
            <td width="50%" style="padding:12px 0 12px 12px;">
              <div style="font-family:Helvetica,Arial,sans-serif;font-size:10px;color:#8a7a6b;text-transform:uppercase;letter-spacing:0.08em;">Fees / Min</div>
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#1a1a1a;font-weight:600;line-height:1.3;margin-top:4px;">${escapeHtml(p.fees)} &middot; ${escapeHtml(p.minDeposit)}</div>
            </td>
          </tr>
        </table>

        <div style="font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#5a5a5a;line-height:1.6;margin-top:14px;"><strong style="color:#1a1a1a;">Best for:</strong> ${escapeHtml(p.bestFor)}</div>

        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;">
          <tr>
            <td style="background:#1a1a1a;border-radius:2px;">
              <a href="${escapeHtml(href)}" style="display:inline-block;padding:10px 20px;font-family:Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.02em;">View Offer &rarr;</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
};

const renderEdition = (opts: {
  headline: string;
  intro: string;
  products: Product[];
  weekStart: string;
  category: string;
  logoToken: string | null;
}) => {
  const utm = `utm_source=newsletter&utm_medium=email&utm_campaign=${encodeURIComponent(opts.category)}-${opts.weekStart}`;
  const cards = opts.products.map((p, i) => renderCard(p, i + 1, utm, opts.logoToken)).join("");

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
    const products: Product[] = Array.isArray(body.products) ? body.products : [];
    if (products.length === 0) {
      return new Response(
        JSON.stringify({ error: "products array is required in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const category: string = body.category ?? products[0]?.subcategory ?? "Weekly Picks";
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
