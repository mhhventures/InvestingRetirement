// Post-build prerender: generates a per-route index.html in dist/ with
// route-specific <title>, meta description, canonical, and a static nav +
// H1 snippet so non-rendering crawlers (Ahrefs, etc.) see each page as a
// distinct, linked document. The React app still hydrates normally because
// we only inject markup OUTSIDE <div id="root">.

import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const distDir = join(root, "dist");
const srcDir = join(root, "src");

const SITE_URL = "https://www.investingandretirement.com";

// ---------- 1. Load route-content data (products, guides, calculators) ----------
async function loadData() {
  const entryContent = `
    export { products } from "./src/data/products.ts";
    export { guides } from "./src/lib/guides-data.ts";
    export { calculators } from "./src/lib/calculators-data.ts";
    export { US_STATES, STATE_CITIES, citySlug } from "./src/lib/states-data.ts";
  `;
  const result = await build({
    stdin: { contents: entryContent, resolveDir: root, loader: "ts" },
    bundle: true,
    format: "esm",
    platform: "node",
    target: "node18",
    write: false,
    logLevel: "silent",
  });
  const code = result.outputFiles[0].text;
  const tmp = join(distDir, ".__prerender_data.mjs");
  mkdirSync(distDir, { recursive: true });
  writeFileSync(tmp, code);
  const mod = await import(pathToFileURL(tmp).href);
  try { rmSync(tmp); } catch { /* ignore */ }
  return mod;
}

// Read Supabase credentials from the .env file so the prerender can hit the
// public state_providers table. The anon key has SELECT-only access.
function readEnvFile() {
  const envPath = resolve(root, ".env");
  if (!existsSync(envPath)) return {};
  const out = {};
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
  }
  return out;
}

async function loadStateProviders() {
  const env = readEnvFile();
  const url = env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn("[prerender] Supabase env missing — skipping state data fetch");
    return { providers: [], intros: [], faqs: [] };
  }
  const headers = { apikey: key, Authorization: `Bearer ${key}` };
  const [pr, ir, fr] = await Promise.all([
    fetch(
      `${url}/rest/v1/state_providers?select=state_code,state_name,institution_name,institution_type,product_type,apy,min_deposit,monthly_fee,membership_required,website_url,summary,rank_weight,last_verified_at&order=state_code.asc,rank_weight.asc`,
      { headers },
    ),
    fetch(
      `${url}/rest/v1/state_intros?select=state_code,intro_paragraph,regulator,notable_institutions`,
      { headers },
    ),
    fetch(
      `${url}/rest/v1/state_faqs?select=state_code,question,answer,sort_order&order=state_code.asc,sort_order.asc`,
      { headers },
    ),
  ]);
  const providers = pr.ok ? await pr.json() : [];
  const intros = ir.ok ? await ir.json() : [];
  const faqs = fr.ok ? await fr.json() : [];
  return { providers, intros, faqs };
}

// Group providers by state code and compute summary stats used for meta copy,
// JSON-LD, and the sitemap's per-URL lastmod.
function indexByState(providers) {
  const map = {};
  for (const p of providers) {
    const k = p.state_code;
    if (!map[k]) {
      map[k] = {
        code: k,
        name: p.state_name,
        providers: [],
        topSavings: 0,
        topCD: 0,
        lastVerified: null,
      };
    }
    const s = map[k];
    s.providers.push(p);
    const apy = Number(p.apy) || 0;
    if (p.product_type === "savings" && apy > s.topSavings) s.topSavings = apy;
    if (p.product_type === "cd" && apy > s.topCD) s.topCD = apy;
    const verified = p.last_verified_at ? new Date(p.last_verified_at) : null;
    if (verified && (!s.lastVerified || verified > s.lastVerified)) {
      s.lastVerified = verified;
    }
  }
  return map;
}

// ---------- 2. Route meta definitions (title + description) ----------
function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Curated phrase -> guide slug map used by the linkifier below. Keep aligned
// with src/components/inline-product-links.tsx.
const GUIDE_PHRASE_MAP = [
  ["emergency funds", "emergency-fund"],
  ["emergency fund", "emergency-fund"],
  ["50/30/20 rule", "budget-basics-50-30-20"],
  ["50/30/20 budget", "budget-basics-50-30-20"],
  ["Roth IRA", "roth-vs-traditional-ira"],
  ["Traditional IRA", "roth-vs-traditional-ira"],
  ["high-yield savings accounts", "best-high-yield-savings-accounts-may-2026"],
  ["high-yield savings account", "how-to-pick-high-yield-savings"],
  ["HYSA", "hysa-vs-money-market-vs-cds"],
  ["money market accounts", "hysa-vs-money-market-vs-cds"],
  ["money market account", "hysa-vs-money-market-vs-cds"],
  ["certificates of deposit", "hysa-vs-money-market-vs-cds"],
  ["index funds", "index-funds-vs-etfs-vs-mutual-funds"],
  ["mutual funds", "index-funds-vs-etfs-vs-mutual-funds"],
  ["ETFs", "index-funds-vs-etfs-vs-mutual-funds"],
  ["portfolio diversification", "portfolio-building"],
  ["asset allocation", "portfolio-building"],
  ["rebalancing", "portfolio-improvements"],
  ["retirement investing", "retirement-investing"],
  ["20x rule", "retirement-investing"],
  ["equities trading", "equities-trading"],
  ["covered calls", "options-strategies"],
  ["iron condors", "options-strategies"],
  ["budgeting apps", "best-budgeting-apps-2026"],
  ["cash advance apps", "best-cash-advance-loan-apps-may-2026"],
  ["stock picking services", "best-stock-picking-services-may-2026"],
  ["bank bonuses", "best-bank-bonuses-this-month"],
  ["investing apps", "5-best-investing-apps-may-2026"],
  ["crypto apps", "6-best-crypto-apps-2026"],
  ["stock picking", "best-stock-picking-services-may-2026"],
  ["subscription drain", "stop-subscription-drain"],
  ["credit score", "improve-credit-90-days"],
  ["Investing 101", "investing-101"],
  ["Options 101", "options-101"],
];

let LINKIFY_CATALOG = null;
function buildLinkifyCatalog(data) {
  if (LINKIFY_CATALOG) return LINKIFY_CATALOG;
  const guideSlugs = new Set((data.guides || []).map((g) => g.slug));
  const productNames = new Set((data.products || []).map((p) => p.name));
  const pairs = [];
  for (const p of data.products || []) {
    pairs.push({ phrase: p.name, href: `/product/${p.slug}` });
  }
  for (const [phrase, slug] of GUIDE_PHRASE_MAP) {
    if (guideSlugs.has(slug)) pairs.push({ phrase, href: `/guides/${slug}` });
  }
  pairs.sort((a, b) => b.phrase.length - a.phrase.length);
  const escaped = pairs.map((p) => p.phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`\\b(${escaped.join("|")})\\b`, "gi");
  const lookup = new Map(pairs.map((p) => [p.phrase.toLowerCase(), p.href]));
  LINKIFY_CATALOG = { regex, lookup, productNames };
  return LINKIFY_CATALOG;
}

// Linkify a plain text string: find product names and guide phrases, emit
// an HTML string with <a> anchors for the first occurrence of each target.
// Respects a per-page `seen` set to avoid repeat-linking the same target.
function linkifyText(text, data, seen, currentSlug) {
  const { regex, lookup } = buildLinkifyCatalog(data);
  regex.lastIndex = 0;
  let out = "";
  let last = 0;
  let m;
  while ((m = regex.exec(text)) !== null) {
    const matched = m[1];
    const href = lookup.get(matched.toLowerCase());
    if (!href) continue;
    // Don't link a guide to itself.
    if (currentSlug && href === `/guides/${currentSlug}`) continue;
    if (m.index > last) out += esc(text.slice(last, m.index));
    if (seen.has(href)) {
      out += esc(matched);
    } else {
      seen.add(href);
      out += `<a href="${href}" class="text-[#0e4d45] font-semibold underline decoration-[#0e4d45] decoration-2 underline-offset-2 hover:text-[#0a3832] hover:decoration-[#0a3832]">${esc(matched)}</a>`;
    }
    last = m.index + matched.length;
  }
  if (last < text.length) out += esc(text.slice(last));
  return out || esc(text);
}

// Clamp a meta description to under 155 chars at a word boundary so
// Google does not truncate it in search snippets.
function clampDescription(desc, max = 154) {
  const s = String(desc).replace(/\s+/g, " ").trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  const trimmed = (lastSpace > 80 ? cut.slice(0, lastSpace) : cut).replace(/[.,;:\-—\s]+$/, "");
  return trimmed;
}

function staticRouteMeta(path) {
  const map = {
    "/": {
      title: "Compare the Best Financial Products 2026",
      description:
        "Expert reviews of the best high-yield savings, checking, investing apps, and budgeting tools — ranked after hands-on testing.",
      h1: "Compare the Best Financial Products",
    },
    "/bank-accounts": {
      title: "Best Bank Accounts 2026 — High-Yield Savings & Checking",
      description:
        "Compare the best high-yield savings and checking accounts of 2026. Up-to-date APYs, fees, and bonuses — ranked by our editors after hands-on testing.",
      h1: "Best Bank Accounts",
    },
    "/banks": {
      title: "Best Banks & Credit Unions by State 2026 — Local Rates Directory",
      description:
        "Compare the best local credit unions and community banks in every state. Verified APYs, fees, and membership details — updated monthly.",
      h1: "Best Banks & Credit Unions by State",
    },
    "/investing": {
      title: "Best Investing Apps & Brokerages 2026",
      description:
        "The best brokerages, robo-advisors, and retirement accounts of 2026, ranked on fees, platform, research, and account options.",
      h1: "Best Investing Apps",
    },
    "/financial-apps": {
      title: "Best Financial Apps 2026 — Budgeting & Credit",
      description:
        "Budgeting tools, cash advance apps, and credit score trackers to take control of your money. Independent reviews of every app we cover.",
      h1: "Best Financial Apps",
    },
    "/reviews": {
      title: "All Financial Product Reviews 2026",
      description:
        "Complete reviews of every bank account, brokerage, and money app we cover. Ratings based on fees, features, and hands-on testing.",
      h1: "All Product Reviews",
    },
    "/guides": {
      title: "Financial Guides & Articles — Saving, Investing, Credit",
      description:
        "Expert-written guides on saving, budgeting, investing, retirement, and credit. Clear, actionable advice to help you make smarter financial decisions.",
      h1: "Financial Guides & Articles",
    },
    "/calculators": {
      title: "Financial Calculators — Interest, Retirement, Mortgage",
      description:
        "Free financial calculators to help you plan savings, investments, retirement, mortgages, and debt payoff. Run the numbers before you make a decision.",
      h1: "Financial Calculators",
    },
    "/about": {
      title: "About Us — Our Review Methodology",
      description:
        "Meet the team behind Investing and Retirement. Learn how we independently test every financial product before it is ranked.",
      h1: "About Investing and Retirement",
    },
    "/contact": {
      title: "Contact Us — Investing and Retirement Editorial Team",
      description: "Have a question about a product review? Get in touch with our editorial team.",
      h1: "Contact Investing and Retirement",
    },
    "/disclosure": {
      title: "Advertiser Disclosure — How We Make Money",
      description: "How Investing and Retirement is compensated, and how that affects our product reviews and rankings.",
      h1: "Advertiser Disclosure",
    },
    "/privacy": {
      title: "Privacy Policy — How We Handle Your Data",
      description: "How we collect, use, and protect your information on Investing and Retirement.",
      h1: "Privacy Policy",
    },
    "/faq": {
      title: "Frequently Asked Questions — Reviews & Methodology",
      description: "Answers to common questions about our reviews, methodology, and the products we cover.",
      h1: "Frequently Asked Questions",
    },
    "/authors/michael-hewitt": {
      title: "Michael Hewitt — Founder & Editor-in-Chief",
      description:
        "Meet Michael Hewitt, founder and editor-in-chief of Investing and Retirement. 10+ years covering banking, investing, and personal finance.",
      h1: "Michael Hewitt",
    },
    "/newsletter": {
      title: "Newsletter — Weekly Picks & Rate Updates",
      description: "Weekly deals, rate updates, and expert picks delivered to your inbox.",
      h1: "Subscribe to Our Newsletter",
    },
  };
  return map[path];
}

function metaForUrl(url, data) {
  const path = new URL(url).pathname.replace(/\/+$/, "") || "/";
  const staticMeta = staticRouteMeta(path);
  if (staticMeta) {
    return {
      path,
      ...staticMeta,
      description: clampDescription(staticMeta.description),
    };
  }

  // /product/:slug
  const prodMatch = path.match(/^\/product\/([^/]+)$/);
  if (prodMatch) {
    const p = data.products.find((x) => x.slug === prodMatch[1]);
    if (!p) return null;
    // Build title under 60 chars where possible; fall back to a shorter form
    // for products with long names.
    const longTitle = `${p.name} Review 2026: Rates, Fees & Features`;
    const shortTitle = `${p.name} Review 2026`;
    const title = longTitle.length <= 58 ? longTitle : shortTitle;
    // Compact description: rating + reviews + best-for. Drops the tagline
    // and provider string so we reliably stay under 155 characters.
    const bestFor = String(p.bestFor || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
    const rawDesc = `${p.name} review — rated ${p.rating}/5 from ${p.reviews.toLocaleString()} reviews. Best for ${bestFor}.`;
    const description = clampDescription(rawDesc);
    return { path, title, description, h1: `${p.name} Review` };
  }

  // /guides/:slug
  const guideMatch = path.match(/^\/guides\/([^/]+)$/);
  if (guideMatch) {
    const g = data.guides.find((x) => x.slug === guideMatch[1]);
    if (!g) return null;
    const titleOverrides = {
      "best-budgeting-apps-2026":
        "4 Best Budgeting Apps in 2026 — Ranked by Our Editors",
      "best-bank-bonuses-this-month":
        "Best Bank Account Bonuses This Month — Top Signup Offers",
      "savings-account-timeline":
        "Savings Account Timeline — Match Accounts to Your Goals",
      "investing-101":
        "Investing 101 — A Beginner's Guide to Stocks & Bonds",
      "shopping-hacks":
        "Smart Shopping Hacks to Cut Grocery & Everyday Costs",
      "big-purchase-guide":
        "Big Purchase Guide — Smart Ways to Buy Major Items",
      "budget-basics-50-30-20":
        "50/30/20 Budget Rule — A Simple Budgeting Framework",
      "stop-subscription-drain":
        "Stop Subscription Drain — Audit & Cancel Unused Services",
      "emergency-fund":
        "Emergency Fund Guide — How Much to Save & Where",
      "options-strategies":
        "4 Defined-Risk Options Strategies Retail Traders Use",
      "travel-on-budget":
        "Budget Travel Tips — Vacation Without Breaking the Bank",
      "how-to-invest-first-10k":
        "How to Invest Your First $10,000 — Step-by-Step",
      "6-best-crypto-apps-2026":
        "6 Best Crypto Apps & Wallets Ranked for 2026",
      "taxes-and-inheritance-for-investors":
        "Investor Tax & Inheritance Guide — Capital Gains to NIIT",
      "best-cash-advance-loan-apps-may-2026":
        "7 Best Cash Advance Apps — Ranked for May 2026",
      "equities-trading":
        "Equities Trading Guide — Strategy, Orders & Risk",
      "options-101":
        "Options 101 — Calls, Puts & How Contracts Work",
      "index-funds-vs-etfs-vs-mutual-funds":
        "Index Funds vs ETFs vs Mutual Funds — Which to Pick",
      "the-greeks-explained":
        "Options Greeks Explained — Delta, Gamma, Theta, Vega, Rho",
      "improve-credit-90-days":
        "Improve Your Credit Score in 90 Days — Step-by-Step Plan",
      "how-to-pick-high-yield-savings":
        "How to Choose a High-Yield Savings Account (HYSA Guide)",
      "5-best-investing-apps-may-2026":
        "5 Best Investing Apps Ranked for May 2026",
      "hysa-vs-money-market-vs-cds":
        "HYSA vs Money Market vs CDs — Best Place for Your Cash",
      "best-high-yield-savings-accounts-may-2026":
        "Best High-Yield Savings Accounts Ranked — May 2026",
      "roth-vs-traditional-ira":
        "Roth vs Traditional IRA — Which Retirement Account Wins?",
      "portfolio-improvements":
        "Improve Your Portfolio — Rebalancing & Alternatives",
      "retirement-investing":
        "Retirement Investing Guide — 20x Rule & Contributions",
      "invest-smart-goals":
        "Invest With SMART Goals — Set, Measure, Achieve",
      "best-stock-picking-services-may-2026":
        "5 Best Stock Picking Services Compared — May 2026",
      "portfolio-building":
        "Build an Investment Portfolio — Diversification Basics",
    };
    const seoTitle = titleOverrides[g.slug] || g.title;
    return {
      path,
      title: seoTitle,
      description: clampDescription(g.description),
      h1: g.title,
    };
  }

  // /banks/:state
  const stateMatch = path.match(/^\/banks\/([a-z-]+)$/);
  if (stateMatch) {
    const slug = stateMatch[1];
    const info = data.US_STATES.find((s) => s.slug === slug);
    if (!info) return null;
    const stateData = data.stateByCode[info.code];
    const apy = stateData?.topSavings > 0
      ? `up to ${stateData.topSavings.toFixed(2)}% APY`
      : "competitive APYs";
    return {
      path,
      title: `Best Banks in ${info.name} 2026 — Credit Unions & Local Rates`,
      description: clampDescription(
        `Compare the best banks and credit unions in ${info.name} — ${apy}, verified fees, minimums, and membership rules from ${
          stateData?.providers?.length || 8
        }+ local institutions.`,
      ),
      h1: `Best Banks & Credit Unions in ${info.name}`,
    };
  }

  // /banks/:state/:city
  const cityMatch = path.match(/^\/banks\/([a-z-]+)\/([a-z0-9-]+)$/);
  if (cityMatch) {
    const [, stateSlug, citySlug] = cityMatch;
    const info = data.US_STATES.find((s) => s.slug === stateSlug);
    if (!info) return null;
    const cities = data.STATE_CITIES[info.code] || [];
    const cityName = cities.find((c) => data.citySlug(c) === citySlug);
    if (!cityName) return null;
    const stateData = data.stateByCode[info.code];
    const apy = stateData?.topSavings > 0
      ? `up to ${stateData.topSavings.toFixed(2)}% APY`
      : "competitive APYs";
    return {
      path,
      title: `Best Banks in ${cityName}, ${info.code} 2026 — Local Rates`,
      description: clampDescription(
        `Banks and credit unions serving ${cityName}, ${info.name}. Compare ${apy}, monthly fees, minimums, and membership eligibility — verified this month.`,
      ),
      h1: `Best Banks & Credit Unions in ${cityName}, ${info.name}`,
    };
  }

  // /calculators/:slug
  const calcMatch = path.match(/^\/calculators\/([^/]+)$/);
  if (calcMatch) {
    const c = data.calculators.find((x) => x.slug === calcMatch[1]);
    if (!c) return null;
    const calcTitleOverrides = {
      "compound-interest":
        "Compound Interest Calculator — Grow Your Savings Over Time",
      "bank-deposit-matcher":
        "Bank Deposit Matcher — Compare HYSA & Checking Offers Instantly",
    };
    return {
      path,
      title: calcTitleOverrides[c.slug] || c.title,
      description: clampDescription(c.description),
      h1: c.title,
    };
  }

  return null;
}

// ---------- 3. Parse sitemap for URL list ----------
function readSitemapUrls() {
  const xml = readFileSync(join(distDir, "sitemap.xml"), "utf8");
  const urls = [];
  const re = /<loc>([^<]+)<\/loc>/g;
  let m;
  while ((m = re.exec(xml))) urls.push(m[1].trim());
  return urls;
}

// ---------- 4. HTML rewrite ----------
function setTagContent(html, regex, replacement) {
  if (regex.test(html)) return html.replace(regex, replacement);
  return html;
}

function rewriteHtml(template, meta, data) {
  const fullUrl = `${SITE_URL}${meta.path === "/" ? "" : meta.path}`;
  const title = meta.title;
  const desc = meta.description;
  const canonical = fullUrl;
  const ogImage = `${SITE_URL}/images/share-image.png`;

  let html = template;

  // Title
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);

  // Robots (noindex for error/internal pages)
  if (meta.noindex) {
    if (/<meta\s+name="robots"[^>]*>/.test(html)) {
      html = html.replace(
        /<meta\s+name="robots"[^>]*>/,
        `<meta name="robots" content="noindex,nofollow" />`
      );
    } else {
      html = html.replace(
        /<\/head>/,
        `    <meta name="robots" content="noindex,nofollow" />\n  </head>`
      );
    }
  }

  // Description
  html = setTagContent(
    html,
    /<meta\s+name="description"[^>]*>/,
    `<meta name="description" content="${esc(desc)}" />`
  );

  // Canonical
  html = setTagContent(
    html,
    /<link\s+rel="canonical"[^>]*>/,
    `<link rel="canonical" href="${esc(canonical)}" />`
  );

  // hreflang self-reference (US English) + x-default
  if (!/<link\s+rel="alternate"\s+hreflang=/.test(html)) {
    html = html.replace(
      /<\/head>/,
      `    <link rel="alternate" hreflang="en-us" href="${esc(canonical)}" />\n    <link rel="alternate" hreflang="x-default" href="${esc(canonical)}" />\n  </head>`
    );
  }

  // og:url
  html = setTagContent(
    html,
    /<meta\s+property="og:url"[^>]*>/,
    `<meta property="og:url" content="${esc(canonical)}" />`
  );

  // og:title (inject if not present)
  if (/<meta\s+property="og:title"[^>]*>/.test(html)) {
    html = html.replace(
      /<meta\s+property="og:title"[^>]*>/,
      `<meta property="og:title" content="${esc(title)}" />`
    );
  } else {
    html = html.replace(
      /<\/head>/,
      `    <meta property="og:title" content="${esc(title)}" />\n  </head>`
    );
  }

  // og:description
  if (/<meta\s+property="og:description"[^>]*>/.test(html)) {
    html = html.replace(
      /<meta\s+property="og:description"[^>]*>/,
      `<meta property="og:description" content="${esc(desc)}" />`
    );
  } else {
    html = html.replace(
      /<\/head>/,
      `    <meta property="og:description" content="${esc(desc)}" />\n  </head>`
    );
  }

  // twitter:title / twitter:description
  if (!/<meta\s+name="twitter:title"[^>]*>/.test(html)) {
    html = html.replace(
      /<\/head>/,
      `    <meta name="twitter:title" content="${esc(title)}" />\n    <meta name="twitter:description" content="${esc(desc)}" />\n    <meta name="twitter:image" content="${esc(ogImage)}" />\n  </head>`
    );
  }

  // Static nav + H1 snippet before #root — gives crawlers real outlinks
  // Hidden visually; React still owns the visible UI inside #root.
  const snippet = buildSeoSnippet(meta, data);
  html = html.replace(
    /<div id="root"><\/div>/,
    `${snippet}\n    <div id="root"></div>`
  );

  return html;
}

function buildBreadcrumb(meta, data) {
  const path = meta.path;
  const crumbs = [["/", "Home"]];

  const prodMatch = path.match(/^\/product\/([^/]+)$/);
  if (prodMatch) {
    const p = data.products.find((x) => x.slug === prodMatch[1]);
    if (p) {
      const catMap = { bank: "/bank-accounts", investing: "/investing", app: "/financial-apps" };
      const catHref = catMap[p.category] || "/reviews";
      const catLabel = p.subcategory || "Reviews";
      crumbs.push([catHref, catLabel]);
      crumbs.push([null, p.name]);
    }
  } else {
    const guideMatch = path.match(/^\/guides\/([^/]+)$/);
    if (guideMatch) {
      const g = data.guides.find((x) => x.slug === guideMatch[1]);
      if (g) {
        crumbs.push(["/guides", "Guides"]);
        crumbs.push([null, g.category]);
        crumbs.push([null, g.title]);
      }
    } else {
      const calcMatch = path.match(/^\/calculators\/([^/]+)$/);
      if (calcMatch) {
        const c = data.calculators.find((x) => x.slug === calcMatch[1]);
        if (c) {
          crumbs.push(["/calculators", "Calculators"]);
          crumbs.push([null, c.title]);
        }
      }
    }
  }

  if (crumbs.length <= 1) return "";

  const items = crumbs
    .map(([href, label], i) => {
      const sep = i > 0 ? '<span aria-hidden="true"> / </span>' : "";
      const el = href
        ? `<a href="${href}">${esc(label)}</a>`
        : `<span>${esc(label)}</span>`;
      return `${sep}${el}`;
    })
    .join("");

  return `<nav aria-label="Breadcrumb">${items}</nav>`;
}

function buildSeoSnippet(meta, data) {
  const navLinks = [
    ["/bank-accounts", "Bank Accounts"],
    ["/investing", "Investing"],
    ["/financial-apps", "Financial Apps"],
    ["/reviews", "Reviews"],
    ["/guides", "Guides"],
    ["/calculators", "Calculators"],
    ["/about", "About"],
    ["/contact", "Contact"],
    ["/disclosure", "Disclosure"],
    ["/privacy", "Privacy"],
    ["/faq", "FAQ"],
  ];

  const contextLinks = contextualLinks(meta, data);

  const nav = navLinks
    .filter(([href]) => href !== meta.path)
    .map(([href, label]) => `<a href="${href}">${esc(label)}</a>`)
    .join("");

  const ctx = contextLinks.map(([href, label]) => `<a href="${href}">${esc(label)}</a>`).join("");

  const body = bodyCopy(meta, data);

  const breadcrumb = buildBreadcrumb(meta, data);

  return `<div id="seo-fallback" style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0">
      ${breadcrumb}
      <h1>${esc(meta.h1 || meta.title)}</h1>
      <p>${esc(meta.description)}</p>
      ${body}
      <nav aria-label="Main">${nav}</nav>
      <nav aria-label="Related">${ctx}</nav>
    </div>`;
}

function bodyCopy(meta, data) {
  const path = meta.path;
  const prodMatch = path.match(/^\/product\/([^/]+)$/);
  if (prodMatch) {
    const p = data.products.find((x) => x.slug === prodMatch[1]);
    if (p) {
      const pros = (p.pros || []).slice(0, 4).map((x) => `<li>${esc(x)}</li>`).join("");
      const cons = (p.cons || []).slice(0, 3).map((x) => `<li>${esc(x)}</li>`).join("");
      const highlights = (p.highlights || []).slice(0, 4).map((x) => `<li>${esc(x)}</li>`).join("");
      const categoryBlurb = {
        bank:
          "Our bank-account reviews weight APY (30%), fees (20%), access and convenience (15%), account features (15%), trust and safety (10%), and customer support (10%). We open and fund every account to verify rates, check transfer speeds, and test the mobile app on both iOS and Android.",
        investing:
          "Our brokerage and robo-advisor reviews weight costs and fees (25%), platform and tools (20%), asset selection (15%), account types (10%), education and research (10%), customer support (10%), and trust and safety (10%). We place real trades, fund retirement accounts, and test research features before publishing a score.",
        app:
          "Our money-app reviews weight cost (25%), accuracy and reliability (25%), data security (20%), usefulness (20%), and customer support (10%). We install the app on a personal device, link real bank accounts, and track whether it measurably improves behavior over a 30-day window.",
      }[p.category] || "";
      const related = data.products
        .filter((x) => x.category === p.category && x.slug !== p.slug)
        .slice(0, 4)
        .map((x) => `<li><a href="/product/${x.slug}">${esc(x.name)} review</a></li>`)
        .join("");
      const grade = p.grade ? `<p>Editorial grade: <strong>${esc(p.grade)}</strong>${p.gradeScore ? ` (composite score ${p.gradeScore}/100)` : ""}.</p>` : "";
      return `
        <h2>About ${esc(p.name)}</h2>
        <p>${esc(p.tagline)} ${esc(p.name)} is offered by ${esc(p.provider)} and currently holds an average rating of ${p.rating} out of 5 across ${p.reviews.toLocaleString()} user reviews. It falls into the ${esc(p.subcategory)} category and tends to be the strongest fit for ${esc(p.bestFor).toLowerCase()}.</p>
        ${grade}
        ${highlights ? `<h3>Highlights</h3><ul>${highlights}</ul>` : ""}
        ${pros ? `<h3>What we like</h3><ul>${pros}</ul>` : ""}
        ${cons ? `<h3>Where it falls short</h3><ul>${cons}</ul>` : ""}
        <h3>Fees, minimums, and rates</h3>
        <p>Monthly fee: ${esc(p.fees || "See details")}. Minimum to open: ${esc(p.minDeposit || "See details")}.${p.apy ? ` Current APY: ${esc(p.apy)}.` : ""}${p.bonus ? ` New-customer bonus: ${esc(p.bonus)}.` : ""} Rates and promotional offers change often, so we re-verify every listed number on a rolling schedule and stamp the review with the date of the most recent check.</p>
        <h3>How we reviewed it</h3>
        <p>${categoryBlurb} For this review of ${esc(p.name)}, our editors funded an account, walked through the full onboarding flow, and compared the experience to the other products in the ${esc(p.subcategory)} shortlist. Scores are not influenced by affiliate relationships — partners cannot pay for better rankings, and our rubric is the same for every brand.</p>
        ${related ? `<h3>Similar products to compare</h3><ul>${related}</ul>` : ""}
        <p>Read our full <a href="/about">editorial methodology</a> and <a href="/disclosure">advertiser disclosure</a> for more on how we fund our testing and why that matters for the reviews you read here.</p>`;
    }
  }
  const guideMatch = path.match(/^\/guides\/([^/]+)$/);
  if (guideMatch) {
    const g = data.guides.find((x) => x.slug === guideMatch[1]);
    if (g) {
      const seen = new Set();
      const lx = (s) => linkifyText(s, data, seen, g.slug);
      const intro = g.intro ? `<p>${lx(g.intro)}</p>` : "";
      const takeaways = (g.keyTakeaways || []).map((x) => `<li>${lx(x)}</li>`).join("");
      const sections = (g.sections || [])
        .slice(0, 6)
        .map((s) => {
          const paras = (s.paragraphs || []).map((x) => `<p>${lx(x)}</p>`).join("");
          const bullets = (s.bullets || []).map((x) => `<li>${lx(x)}</li>`).join("");
          return `<h2>${esc(s.heading)}</h2>${paras}${bullets ? `<ul>${bullets}</ul>` : ""}`;
        })
        .join("");
      return `${intro}${sections}${takeaways ? `<h2>Key Takeaways</h2><ul>${takeaways}</ul>` : ""}`;
    }
  }

  if (path === "/") {
    return `
      <h2>What we review</h2>
      <p>Investing and Retirement publishes independent reviews of high-yield savings accounts, checking accounts, online brokerages, robo-advisors, crypto exchanges, prediction markets, budgeting apps, cash-advance apps, and credit tools. Every product is opened, funded, and tested by our editorial team before it is ranked — no paid placements, no shortcuts.</p>
      <h2>How we rank</h2>
      <p>Each category has its own weighted rubric covering fees, yield or returns, platform quality, account options, customer support, and trust & safety. Product pages show the exact score and letter grade we assigned, along with the pros and cons that drove the decision.</p>
      <h2>Popular categories</h2>
      <ul>
        <li>High-yield savings and checking accounts from SoFi, Ally, Marcus, Barclays, CIT, Bread, LendingClub, and Amex.</li>
        <li>Investing apps and brokerages including Fidelity, Vanguard, Schwab, Robinhood, E*TRADE, Webull, Interactive Brokers, and SoFi Invest.</li>
        <li>Robo-advisors and retirement platforms like Betterment, Wealthfront, M1 Finance, and Acorns.</li>
        <li>Crypto and prediction markets: Coinbase, Kraken, Gemini, Crypto.com, Kalshi, and Polymarket.</li>
        <li>Budgeting and money apps: YNAB, Monarch Money, Rocket Money, Empower, and Credit Karma.</li>
      </ul>`;
  }
  if (path === "/bank-accounts") {
    return `
      <h2>How we pick the best bank accounts</h2>
      <p>We rank high-yield savings and checking accounts on APY, monthly fees, minimum balance requirements, ATM access, FDIC coverage, mobile app quality, and customer service. Rates change quickly — our rankings are reviewed weekly, and we note exactly when each APY was verified.</p>
      <h2>What to look for</h2>
      <ul>
        <li>APY at or above the FDIC national average, with no promotional-only rates that collapse.</li>
        <li>No monthly maintenance fees, no minimum balance penalties, no excess-withdrawal fees.</li>
        <li>FDIC-insured deposits up to $250,000 per depositor, per bank, per ownership category.</li>
        <li>Strong mobile app, fast ACH transfers, and useful tools like automatic sub-savings goals.</li>
      </ul>`;
  }
  if (path === "/investing") {
    return `
      <h2>How we rank investing apps</h2>
      <p>Our brokerage and robo-advisor rubric weights costs and fees (25%), platform and tools (20%), asset selection (15%), account types (10%), education and research (10%), customer support (10%), and trust and safety (10%). We open real accounts and place real trades to evaluate each platform firsthand.</p>
      <h2>What to compare</h2>
      <ul>
        <li>Commission-free stock and ETF trading, options contract fees, and mutual fund access.</li>
        <li>Retirement account support (Traditional IRA, Roth IRA, SEP IRA, Solo 401(k)).</li>
        <li>Research quality, charting depth, and screener flexibility for active investors.</li>
        <li>Fractional shares, dividend reinvestment, and automated portfolio tools.</li>
      </ul>`;
  }
  if (path === "/financial-apps") {
    return `
      <h2>Budgeting, credit, and cash-advance apps</h2>
      <p>We review the money apps most Americans actually use: budget trackers, expense categorizers, subscription cancelers, credit-score monitors, and small-dollar cash-advance tools. Each app is evaluated on cost, accuracy, data security, and whether it actually changes financial behavior.</p>
      <h2>How we test every app</h2>
      <p>Our editors install each app on a personal device, link real bank and credit-card accounts, and run the product through a 30-day behavior window before writing a word. We check transaction-categorization accuracy, subscription-detection rate, alert reliability, and how quickly the support team responds when something breaks. Paid tiers are reviewed at the price everyone pays — no press comps or promotional access.</p>
      <h2>What to compare</h2>
      <ul>
        <li>Subscription cost, free-tier limits, and whether the paid tier actually unlocks anything meaningful.</li>
        <li>Bank-sync reliability across major issuers and how the app handles duplicate transactions.</li>
        <li>Data-security posture: encryption at rest, SOC 2 audits, and whether the company sells anonymized transaction data.</li>
        <li>Cash-advance caps, fee structure, and repayment flexibility for the apps that offer short-term loans.</li>
        <li>Credit-score source (VantageScore vs. FICO) and update frequency for monitoring tools.</li>
      </ul>`;
  }
  if (path === "/reviews") {
    return `
      <h2>All reviews</h2>
      <p>Browse every product we cover across bank accounts, investing apps, financial apps, and crypto platforms. Every listing on this page links to a full hands-on review with fees, rates, pros and cons, and an editorial grade.</p>
      <h2>How to use this page</h2>
      <p>Filter by category to narrow the list to the product type you care about, or scan the grades to find the top-rated options in each space. Reviews are updated on a rolling schedule — APYs and bonuses are re-verified weekly, fee schedules monthly, and the full review is refreshed at least twice a year or whenever a product meaningfully changes.</p>
      <h2>What our reviews cover</h2>
      <ul>
        <li>Current APY, monthly fees, minimum balance requirements, and any account bonuses.</li>
        <li>Hands-on notes from opening and funding the account, including transfer speeds and onboarding friction.</li>
        <li>Editorial pros, cons, and the specific customer profile the product is best suited for.</li>
        <li>Head-to-head comparisons with the closest alternatives in the same category.</li>
      </ul>`;
  }
  if (path === "/guides") {
    return `
      <h2>Financial education you can actually use</h2>
      <p>Our guides cover the topics most people get wrong: emergency funds, the 50/30/20 budget, Roth vs. Traditional IRAs, picking a high-yield savings account, portfolio construction, and improving credit. Every guide is written by our editorial team, reviewed for accuracy against primary sources (IRS publications, FDIC data, Federal Reserve surveys), and updated when the underlying rules or numbers change.</p>
      <h2>Who writes these</h2>
      <p>Guides are drafted by editors with a background in personal finance, then fact-checked against the current-year tax code, FDIC and SEC publications, and the rate environment at the time of publication. We do not repackage press releases or rewrite other publications' work. If we reference a study or a rate, we link to the primary source.</p>
      <h2>Popular topics</h2>
      <ul>
        <li>Saving and emergency funds — how much to hold, where to park it, and when to draw down.</li>
        <li>Investing basics — index funds, asset allocation, rebalancing, and tax-advantaged account order.</li>
        <li>Retirement — Roth vs. Traditional, 401(k) rollovers, contribution limits, and withdrawal strategies.</li>
        <li>Credit — how scores are calculated, disputing errors, and building credit from scratch.</li>
      </ul>`;
  }
  if (path === "/calculators") {
    return `
      <h2>Free financial calculators</h2>
      <p>Run the numbers on compound interest, retirement savings, mortgages, debt payoff, and emergency-fund targets. Every calculator is free, works in your browser, and never asks for personal information — nothing you type is saved, transmitted, or shared with advertisers.</p>
      <h2>What you can figure out here</h2>
      <ul>
        <li>How a lump sum plus monthly contributions grows over 10, 20, or 30 years at a given return.</li>
        <li>Whether your current retirement savings rate is on track to replace the income you want in retirement.</li>
        <li>The true monthly cost of a mortgage, including principal, interest, and amortization over the life of the loan.</li>
        <li>How long it will take to pay off credit-card debt under the avalanche vs. snowball method.</li>
        <li>The right emergency-fund target based on your monthly expenses and job stability.</li>
      </ul>
      <p>Each calculator shows the formulas and assumptions used. If you want to verify a result by hand, the inputs are all standard time-value-of-money math — no proprietary black boxes.</p>`;
  }
  if (path === "/about") {
    return `
      <h2>Who we are</h2>
      <p>Investing and Retirement is an independent editorial publisher owned by Investing and Retirement Media LLC. We open real accounts at every institution we review, fund them, run transactions, and test customer service firsthand. Our scoring rubrics are public, our methodology is consistent across products, and we publish quarterly re-reviews so rankings reflect current reality.</p>
      <h2>How we make money</h2>
      <p>We are compensated through affiliate relationships with some of the banks, brokerages, and app companies we cover. Partners cannot pay for better rankings, cannot preview or approve editorial content, and cannot remove negative findings. When a commission relationship exists, it is disclosed on the review itself and in our <a href="/disclosure">advertiser disclosure</a>. Our editorial independence is the product — without it, there is no reason for a reader to trust our ratings.</p>
      <h2>Editorial process</h2>
      <ul>
        <li>Every product page is assigned to an editor who funds a real account and tests the experience end-to-end.</li>
        <li>Scores are computed from a published, category-specific rubric — not a vibe check.</li>
        <li>APYs, fees, and bonus offers are re-verified on a rolling schedule and stamped with the date of the most recent check.</li>
        <li>Readers can flag inaccuracies at any time; we investigate within five business days and publish a correction when warranted.</li>
      </ul>`;
  }
  if (path === "/privacy") {
    return `
      <h2>What this policy covers</h2>
      <p>This page documents what Investing and Retirement Media LLC collects from visitors to this website, how we use it, and what rights you have to see, correct, or delete your data. It applies to everything on the investingandretirement.com domain — reviews, guides, calculators, the newsletter signup, and the contact form.</p>
      <h2>The short version</h2>
      <p>We collect the bare minimum: an email address if you subscribe to the newsletter, a name and message if you use the contact form, and the standard web-analytics metadata every modern site collects (IP, browser, pages viewed, referring URL). We do not sell any of it, we do not build advertising profiles, and we do not run retargeting pixels. Our business model is affiliate commissions on product referrals, not user data.</p>
      <h2>Your rights</h2>
      <ul>
        <li>Unsubscribe from the newsletter at any time using the link in any email — no explanation needed.</li>
        <li>Request a copy of everything we hold on you by emailing our privacy contact.</li>
        <li>Request deletion of your data, subject to limited legal-retention exceptions.</li>
        <li>California, EU, and UK residents have additional statutory rights under the CCPA and GDPR; see the full policy for details.</li>
      </ul>
      <p>The full policy on this page covers cookies, data retention, third-party processors, children's privacy, and changes to the policy. For questions, see our <a href="/contact">contact page</a>.</p>`;
  }
  if (path === "/contact") {
    return `
      <h2>How to reach the editorial team</h2>
      <p>Have a question about a review, a correction to flag, a rate change to report, or a press inquiry? The fastest way to reach us is email. A human reads every message — this is not a support queue staffed by bots or overseas contractors. Response time is typically one to three business days for reader questions and same-day for time-sensitive corrections.</p>
      <h2>What to include</h2>
      <ul>
        <li><strong>Review corrections</strong> — the product name, the specific fact you believe is wrong, and a link to the primary source if you have one. We update within 48 hours of verification.</li>
        <li><strong>Rate or bonus updates</strong> — the product and the new APY, fee, or bonus amount, plus a link to the bank's or broker's official page.</li>
        <li><strong>Reader questions</strong> — the question itself and any context that would help us answer it. We frequently turn common questions into guides.</li>
        <li><strong>Press or partnership inquiries</strong> — the publication or brand you represent and the specific ask. Please do not pitch guest posts or link-insertion requests; we do not publish sponsored editorial.</li>
      </ul>
      <h2>What we do not handle here</h2>
      <p>We are a publisher, not a bank or broker. If your issue is with an account at a specific institution, please contact that institution's customer service directly — we have no ability to access, modify, or close your accounts on any third-party platform.</p>`;
  }
  if (path === "/faq") {
    return `
      <h2>Answers to the questions we get most</h2>
      <p>This page covers the questions readers ask most often about how we operate: how we make money, who writes the reviews, how often ratings are updated, and why a specific product did or did not make a list. If your question is not answered here, send it to our editorial team via the <a href="/contact">contact page</a> and we will answer directly, usually within one to three business days.</p>
      <h2>Common categories of questions</h2>
      <ul>
        <li><strong>Editorial independence</strong> — how affiliate relationships work, what partners can and cannot influence, and why compensation does not move rankings. The short version: partners cannot preview content, cannot edit scores, and cannot pay for placement.</li>
        <li><strong>Methodology</strong> — the specific rubrics we use for bank accounts, investing apps, and money apps. Each rubric assigns percentage weights to fees, platform quality, features, support, and trust.</li>
        <li><strong>Review freshness</strong> — APYs and promotional bonuses are re-verified weekly, fee schedules monthly, and the full review is refreshed at least twice a year or whenever a product meaningfully changes its pricing or feature set.</li>
        <li><strong>Coverage gaps</strong> — why certain banks, brokers, or apps are not yet reviewed, how products get added to the queue, and how reader requests factor in.</li>
        <li><strong>Reader-submitted corrections</strong> — how to flag an error, what evidence we need to verify it, and how quickly corrections are published once confirmed.</li>
        <li><strong>Affiliate tracking</strong> — what data is shared with partners when you click through (a referral ID and conversion event, nothing more) and what is not (your email, name, or browsing history).</li>
      </ul>
      <p>For more on the business behind the site, see our <a href="/about">about page</a>, our full <a href="/disclosure">advertiser disclosure</a>, and our <a href="/privacy">privacy policy</a>.</p>`;
  }
  if (path === "/disclosure") {
    return `
      <h2>How we are compensated</h2>
      <p>Investing and Retirement Media LLC earns affiliate commissions when readers click links on this site and open accounts with some (not all) of the banks, brokerages, robo-advisors, and money apps we cover. When a commercial relationship exists, it is disclosed on the review page itself in addition to this blanket notice.</p>
      <h2>What commissions do and do not influence</h2>
      <p>Compensation does not influence which products we review, the rubric we use, the score we assign, or the editorial pros and cons. Partners cannot preview content, cannot request edits, cannot pay for better placement, and cannot have negative findings removed. The integrity of our rankings is the only thing that keeps readers clicking through — and without the clicks, the business does not exist.</p>
      <h2>Where you will see disclosures</h2>
      <ul>
        <li>At the top of every review page that includes affiliate links to the reviewed product.</li>
        <li>In the footer of every page on the site, linking back to this page.</li>
        <li>On the <a href="/about">about page</a>, which explains our editorial process in detail.</li>
        <li>In sponsored content, if we ever publish any — which, as of today, we do not.</li>
      </ul>
      <h2>Rate and fee accuracy</h2>
      <p>APYs, fees, and new-customer bonuses change frequently. We re-verify every rate on a rolling schedule and stamp reviews with the date of the most recent check. If you believe a number on this site is out of date, please flag it through the <a href="/contact">contact page</a> and we will verify and correct within 48 hours.</p>`;
  }
  if (path === "/newsletter") {
    return `
      <h2>What you get</h2>
      <p>The Investing and Retirement newsletter lands in your inbox once a week and covers the single most useful money decision you can make that week. That might be a new top-of-market APY, an account-opening bonus worth chasing, a tax deadline you need to hit, or a fresh review of a product worth considering. No daily blasts, no affiliate dumps, no padding.</p>
      <h2>A typical issue</h2>
      <ul>
        <li>One top pick — the rate, bonus, or product change that matters most this week, with the short version of why it is worth your attention.</li>
        <li>Rate roundup — the current leaders in high-yield savings, CDs, and money-market accounts, with the date each rate was verified.</li>
        <li>One guide or calculator we published or meaningfully updated that week.</li>
        <li>A reader question we answered, drawn from the contact inbox — useful because if one person asks, dozens are probably wondering.</li>
        <li>A short calendar note when a tax, contribution, or enrollment deadline is coming up in the next 30 days.</li>
      </ul>
      <h2>Who writes it</h2>
      <p>The newsletter is written by editor-in-chief Michael Hewitt and the Investing and Retirement editorial team. It is the same voice and the same standards you get from the reviews on the site — no ghostwriters, no ad-copy inserts dressed up as recommendations.</p>
      <h2>Privacy and unsubscribe</h2>
      <p>We only use your email address to send you the newsletter. We do not sell the list, rent it, or share it with advertisers. Every email has a one-click unsubscribe link at the bottom, and requests are honored immediately — no retention tricks. For the full policy, see <a href="/privacy">our privacy page</a>.</p>`;
  }
  if (path === "/authors/michael-hewitt") {
    return `
      <h2>About Michael</h2>
      <p>Michael Hewitt is the founder and editor-in-chief of Investing and Retirement. He has spent more than a decade writing about consumer banking, brokerage platforms, retirement accounts, and personal-finance tools, and he sets the editorial direction and scoring methodology for every product category on the site. His background is in independent editorial publishing — the business model only works if readers trust the rankings, and that trust is the only lever worth pulling.</p>
      <h2>Areas of expertise</h2>
      <ul>
        <li>High-yield savings accounts, CDs, and checking accounts — including fintech challengers like SoFi, Ally, and Marcus alongside traditional FDIC banks.</li>
        <li>Online brokerages and robo-advisors, with a particular focus on long-term, tax-advantaged investing at Fidelity, Vanguard, Schwab, Betterment, and Wealthfront.</li>
        <li>Retirement planning, IRA and 401(k) mechanics, Roth conversion strategy, and the withdrawal-stage sequencing that determines how long a portfolio lasts.</li>
        <li>Budgeting, credit-building, and cash-advance apps aimed at everyday users — the category where bad products cause the most harm, and careful review matters most.</li>
      </ul>
      <h2>Editorial role</h2>
      <p>Michael personally reviews every published rubric, signs off on ratings before they go live, and handles reader corrections submitted through the <a href="/contact">contact page</a>. He also writes the weekly <a href="/newsletter">newsletter</a>, hosts our quarterly methodology updates, and represents the site in press inquiries and industry coverage.</p>
      <h2>How to get in touch</h2>
      <p>Readers can email Michael directly through the <a href="/contact">contact page</a> with questions, corrections, or review requests. Press inquiries and partnership questions go through the same channel. He reads every message; responses typically go out within one to three business days.</p>`;
  }
  // /banks landing
  if (path === "/banks") {
    const available = data.US_STATES.filter((s) => s.available);
    const links = available
      .map((s) => `<li><a href="/banks/${s.slug}">Best banks in ${esc(s.name)}</a></li>`)
      .join("");
    return `
      <h2>What is a state banking directory?</h2>
      <p>A state banking directory lists the banks, credit unions, and regional providers licensed to serve residents of a specific state — plus the deposit products (savings, checking, money-market, CDs) each institution actually markets locally. Unlike a national best-of list, a state directory surfaces small community banks and state-chartered credit unions that often publish the highest APYs a single household can access, because their field-of-membership rules are limited to residents of that state or a set of affiliated employers.</p>
      <h2>Local credit unions vs. national online banks</h2>
      <p>National online banks (SoFi, Ally, Marcus, Capital One 360, Discover) typically win on raw savings APY at large balances, mobile-app polish, and 24/7 customer support. Local credit unions and community banks typically win on rewards-checking yield (often 3–5% on the first $10–25k in balances), CD specials, relationship pricing for members with a mortgage or auto loan at the same institution, and in-branch service. The right answer for most households is both — a national HYSA for the bulk of savings, plus a local rewards-checking account for everyday use.</p>
      <h2>How deposit insurance works across state lines</h2>
      <p>FDIC insurance (for banks) and NCUA insurance (for credit unions) both cover $250,000 per depositor, per ownership category, per institution — the protection is identical regardless of whether the charter is state or federal. What varies by state is the supervisory regulator (the California DFPI, the Texas Department of Banking, the New York DFS, and so on), the consumer-protection rules layered on top of federal law, and the state income-tax treatment of the interest you earn on those deposits.</p>
      <h2>States covered</h2>
      <ul>${links}</ul>
      <h2>How to use this directory</h2>
      <p>Pick your state from the list above. Each state page ranks local banks and credit unions by APY after fees, documents the field-of-membership rule for every CU, and calls out the institution's FDIC or NCUA ID. Every number is re-verified against the institution's own rate page at least monthly, and stamped with the date of the most recent check.</p>`;
  }

  // /banks/:state
  const bStateMatch = path.match(/^\/banks\/([a-z-]+)$/);
  if (bStateMatch) {
    const slug = bStateMatch[1];
    const info = data.US_STATES.find((s) => s.slug === slug);
    if (info) {
      const stateData = data.stateByCode[info.code];
      const providers = stateData?.providers || [];
      const cities = data.STATE_CITIES[info.code] || [];
      const top = providers
        .slice()
        .sort((a, b) => (a.rank_weight || 999) - (b.rank_weight || 999))
        .slice(0, 8);
      const rows = top
        .map((p) => {
          const apy = Number(p.apy) > 0 ? `${Number(p.apy).toFixed(2)}% APY` : "—";
          const min = Number(p.min_deposit) > 0 ? `$${Number(p.min_deposit).toLocaleString()} min` : "no minimum";
          const fee = Number(p.monthly_fee) > 0 ? `$${Number(p.monthly_fee).toFixed(0)}/mo fee` : "no monthly fee";
          const product =
            p.product_type === "savings" ? "Savings" :
            p.product_type === "checking" ? "Checking" :
            p.product_type === "cd" ? "CD" :
            p.product_type === "money_market" ? "Money Market" : p.product_type;
          const link = p.website_url
            ? `<a href="${esc(p.website_url)}" rel="nofollow sponsored">${esc(p.institution_name)}</a>`
            : esc(p.institution_name);
          return `<li><strong>${link}</strong> — ${esc(product)}: ${esc(apy)}, ${esc(min)}, ${esc(fee)}${p.summary ? `. ${esc(p.summary)}` : ""}</li>`;
        })
        .join("");
      const cityLinks = cities
        .slice(0, 10)
        .map((c) => `<li><a href="/banks/${info.slug}/${data.citySlug(c)}">Banks in ${esc(c)}, ${esc(info.code)}</a></li>`)
        .join("");
      const relatedGuides = `
        <li><a href="/guides/how-to-pick-high-yield-savings">How to Choose a High-Yield Savings Account</a></li>
        <li><a href="/guides/hysa-vs-money-market-vs-cds">HYSA vs Money Market vs CDs</a></li>
        <li><a href="/guides/best-high-yield-savings-accounts-may-2026">Best High-Yield Savings Accounts This Month</a></li>
        <li><a href="/guides/best-bank-bonuses-this-month">Best Bank Account Bonuses This Month</a></li>`;
      const verified = stateData?.lastVerified
        ? new Date(stateData.lastVerified).toLocaleDateString("en-US", { month: "long", year: "numeric" })
        : "this month";
      const intro = data.introByCode?.[info.code];
      const introP = intro?.intro_paragraph
        ? `<p>${esc(intro.intro_paragraph)}</p>${intro.regulator ? `<p>State regulator: <strong>${esc(intro.regulator)}</strong>. Every institution below is FDIC- or NCUA-insured to $250,000.</p>` : ""}`
        : `<p>${esc(info.name)} residents have access to a mix of state-chartered credit unions, regional community banks, and nationwide online banks. This page ranks the strongest options for savings APY, checking rewards, and CD specials — all verified against the institution's own rate page as of ${esc(verified)}.</p>`;
      const stateFaqs = data.faqsByCode?.[info.code] || [];
      const faqBlock = stateFaqs.length
        ? `<h2>${esc(info.name)} banking FAQ — credit unions, rates & insurance</h2>${stateFaqs
            .map(
              (f) => `<h3>${esc(f.question)}</h3><p>${esc(f.answer)}</p>`,
            )
            .join("")}`
        : "";
      return `
        ${introP}
        <h2>Best banks and credit unions in ${esc(info.name)} ${new Date().getFullYear()}</h2>
        <ul>${rows}</ul>
        <h2>What makes a ${esc(info.name)} bank account worth opening</h2>
        <p>Look at four things in order: the APY (does it beat the FDIC national average of about 0.60%?), the monthly fee (anything above $0 should come with a clear waiver path), the minimum opening deposit, and the membership rule for credit unions. ${esc(info.name)} residents typically qualify for at least one large state-chartered credit union on residency alone, and that credit union is often the highest-APY option available locally.</p>
        <h2>Is my money safe at a ${esc(info.name)} bank or credit union?</h2>
        <p>Yes, if the institution is federally insured. FDIC covers banks up to $250,000 per depositor, per ownership category; NCUA covers credit unions at the same limits. Every institution in this directory carries one of those insurances — the FDIC or NCUA ID is listed on the full provider row.</p>
        <h2>Best banks in ${esc(info.name)} cities</h2>
        <ul>${cityLinks}</ul>
        ${faqBlock}
        <h2>Related guides for ${esc(info.name)} savers</h2>
        <ul>${relatedGuides}</ul>
        <p>Rates and fees change frequently. Confirm current figures directly with each institution before applying, and see our <a href="/about">editorial methodology</a> for how this directory is built and maintained.</p>`;
    }
  }

  // /banks/:state/:city
  const bCityMatch = path.match(/^\/banks\/([a-z-]+)\/([a-z0-9-]+)$/);
  if (bCityMatch) {
    const [, stateSlug, citySlug] = bCityMatch;
    const info = data.US_STATES.find((s) => s.slug === stateSlug);
    if (info) {
      const cities = data.STATE_CITIES[info.code] || [];
      const cityName = cities.find((c) => data.citySlug(c) === citySlug);
      if (cityName) {
        const stateData = data.stateByCode[info.code];
        const providers = (stateData?.providers || []).slice(0, 6);
        const rows = providers
          .map((p) => {
            const apy = Number(p.apy) > 0 ? `${Number(p.apy).toFixed(2)}% APY` : "—";
            const link = p.website_url
              ? `<a href="${esc(p.website_url)}" rel="nofollow sponsored">${esc(p.institution_name)}</a>`
              : esc(p.institution_name);
            return `<li><strong>${link}</strong> — ${esc(apy)}${p.summary ? `. ${esc(p.summary)}` : ""}</li>`;
          })
          .join("");
        const otherCities = cities
          .filter((c) => data.citySlug(c) !== citySlug)
          .slice(0, 8)
          .map((c) => `<li><a href="/banks/${info.slug}/${data.citySlug(c)}">Banks in ${esc(c)}</a></li>`)
          .join("");
        return `
          <p>This page covers banks, credit unions, and local branches available to residents of ${esc(cityName)}, ${esc(info.name)}. All rankings inherit from the <a href="/banks/${info.slug}">${esc(info.name)} state directory</a> — every institution listed is licensed to serve ${esc(cityName)} residents and is either headquartered in ${esc(info.name)} or operates branches in the metro.</p>
          <h2>Top options in ${esc(cityName)}</h2>
          <ul>${rows}</ul>
          <h2>Other ${esc(info.name)} cities</h2>
          <ul>${otherCities}</ul>
          <p>See the full <a href="/banks/${info.slug}">${esc(info.name)} banks directory</a> for every institution we've verified in the state, plus the underlying methodology.</p>`;
      }
    }
  }

  const calcMatch2 = path.match(/^\/calculators\/([^/]+)$/);
  if (calcMatch2) {
    const c = data.calculators.find((x) => x.slug === calcMatch2[1]);
    if (c) {
      const blurbs = {
        "compound-interest": {
          uses: [
            "How a lump-sum deposit grows over a long time horizon at a given annual return.",
            "The additional upside from consistent monthly contributions on top of the initial balance.",
            "Why starting earlier beats contributing more — the time variable dominates the math.",
            "Side-by-side comparison of savings-account APYs vs. market-return assumptions.",
          ],
          detail:
            "The compound-interest calculator takes an initial deposit, a monthly contribution, an annual rate, and a number of years, then applies standard time-value-of-money math to show the ending balance. Returns compound monthly by default to match how most high-yield savings accounts pay interest. Adjust the rate to model different scenarios — a 4% high-yield savings rate, a 7% long-term stock-market average, or anything in between.",
        },
        retirement: {
          uses: [
            "Whether your current savings rate is on track to replace the income you want in retirement.",
            "The impact of delaying retirement by a few years vs. saving more aggressively now.",
            "How Social Security fits into the picture alongside 401(k) and IRA balances.",
            "A rough check on whether the 4% safe-withdrawal rate covers your projected expenses.",
          ],
          detail:
            "The retirement calculator takes your current age, target retirement age, current balance, annual contribution, expected return, and desired retirement income, then projects whether the plan is on track. It is a planning tool, not a financial-planning engagement — the output is a useful first look, not a substitute for a CFP who knows your full picture.",
        },
        mortgage: {
          uses: [
            "The monthly principal-and-interest payment on a fixed-rate mortgage.",
            "Total interest paid over the full life of the loan at current rates.",
            "The amortization schedule showing how each payment splits between principal and interest.",
            "How a larger down payment or shorter term changes the total cost.",
          ],
          detail:
            "The mortgage calculator takes loan amount, term in years, and annual interest rate, then produces a full amortization schedule. Property tax, homeowners insurance, PMI, and HOA dues are not included by default — add them separately when comparing the true monthly cost against your budget.",
        },
        "savings-goal": {
          uses: [
            "How much you need to save every month to hit a specific dollar goal by a target date.",
            "The impact of earning interest on savings vs. stuffing cash in a checking account.",
            "Whether a shorter timeline requires an unrealistic monthly contribution.",
            "The tradeoff between saving more now vs. extending the deadline.",
          ],
          detail:
            "The savings-goal calculator solves for the monthly contribution required to reach a target amount by a given date, given a starting balance and an expected interest rate. Useful for down-payment funds, weddings, travel, and any other mid-horizon goal where the end date matters.",
        },
        "debt-payoff": {
          uses: [
            "The payoff date for a set of credit-card balances at a given monthly payment.",
            "The total interest saved by paying an extra $100 or $200 per month.",
            "A head-to-head comparison of the avalanche (highest-rate first) and snowball (smallest-balance first) methods.",
            "Whether a balance-transfer card would meaningfully change the payoff timeline.",
          ],
          detail:
            "The debt-payoff calculator takes a list of balances, APRs, and minimum payments, plus any extra monthly amount you can contribute, and returns a full payoff schedule. It supports both the avalanche and snowball methods so you can compare total interest paid against how quickly the first balance clears — a tradeoff between math and motivation.",
        },
        "bank-deposit-matcher": {
          uses: [
            "See high-yield savings and checking offers matched to your deposit size and savings goals.",
            "Compare APY, minimum balance requirements, monthly fees, and sign-up bonuses side-by-side.",
            "Filter out accounts whose rate caps, direct-deposit rules, or eligibility would disqualify your deposit.",
            "Open an account directly with the issuer — the widget renders results inline, no redirect.",
          ],
          detail:
            "The bank deposit matcher is an embedded tool operated by a partner network. You answer a short set of questions (deposit size, savings horizon, account type) and it returns a ranked list of live offers from participating banks. Investing and Retirement Media LLC may be compensated when you open or fund an account through the widget; compensation does not influence the ranking. APYs, fees, and bonus terms are supplied by each issuer and can change without notice.",
        },
        "emergency-fund": {
          uses: [
            "The target size of your emergency fund based on essential monthly expenses.",
            "Whether three, six, or nine months of expenses is the right target given your job stability.",
            "How long your current emergency fund would last if your income stopped tomorrow.",
            "A savings-contribution plan to hit the target within a reasonable timeframe.",
          ],
          detail:
            "The emergency-fund calculator takes your essential monthly expenses (housing, utilities, groceries, insurance, minimum debt payments) and a risk-profile multiplier (three months for dual-income households with stable jobs, up to nine for single-income freelancers) and returns a target balance plus a monthly savings plan to get there.",
        },
      };
      const b = blurbs[c.slug];
      const intro = `<p>${esc(c.description)}</p>`;
      if (!b) {
        return `${intro}
          <h2>How it works</h2>
          <p>This calculator is a free, browser-based tool. Nothing you type is saved, transmitted, or shared. See the full list of financial tools on the <a href="/calculators">calculators page</a>.</p>`;
      }
      const uses = b.uses.map((x) => `<li>${esc(x)}</li>`).join("");
      const privacyNote = c.slug === "bank-deposit-matcher"
        ? `<h2>Privacy</h2>
        <p>The deposit matcher is an embedded third-party widget. Inputs you provide (deposit size, goals, contact details if you choose to open an offer) are processed by the widget operator and the banks you select. See <a href="/privacy">our privacy policy</a> and <a href="/disclosure">advertiser disclosure</a> for the full details on partner-link tracking.</p>`
        : `<h2>Privacy</h2>
        <p>This calculator runs entirely in your browser. Nothing you type is saved, transmitted, or shared with us or any third party. See <a href="/privacy">our privacy policy</a> for the full details, or browse more tools on the <a href="/calculators">calculators page</a>.</p>`;
      return `${intro}
        <h2>What you can figure out</h2>
        <ul>${uses}</ul>
        <h2>How it works</h2>
        <p>${esc(b.detail)}</p>
        ${privacyNote}`;
    }
  }
  return "";
}

function contextualLinks(meta, data) {
  const path = meta.path;
  const out = [];

  if (path === "/") {
    for (const p of data.products.slice(0, 12)) out.push([`/product/${p.slug}`, `${p.name} review`]);
    for (const g of data.guides.slice(0, 8)) out.push([`/guides/${g.slug}`, g.title]);
    return out;
  }

  if (path === "/bank-accounts") {
    return data.products.filter((p) => p.category === "bank").map((p) => [`/product/${p.slug}`, `${p.name} review`]);
  }
  if (path === "/investing") {
    return data.products.filter((p) => p.category === "investing").map((p) => [`/product/${p.slug}`, `${p.name} review`]);
  }
  if (path === "/financial-apps") {
    return data.products.filter((p) => p.category === "app").map((p) => [`/product/${p.slug}`, `${p.name} review`]);
  }
  if (path === "/reviews") {
    return data.products.map((p) => [`/product/${p.slug}`, `${p.name} review`]);
  }
  if (path === "/guides") {
    return data.guides.map((g) => [`/guides/${g.slug}`, g.title]);
  }
  if (path === "/calculators") {
    return data.calculators.filter((c) => c.available).map((c) => [`/calculators/${c.slug}`, c.title]);
  }

  const prodMatch = path.match(/^\/product\/([^/]+)$/);
  if (prodMatch) {
    const p = data.products.find((x) => x.slug === prodMatch[1]);
    if (p) {
      const related = data.products
        .filter((x) => x.category === p.category && x.slug !== p.slug)
        .slice(0, 6)
        .map((x) => [`/product/${x.slug}`, `${x.name} review`]);
      related.push(["/reviews", "All reviews"]);
      return related;
    }
  }

  const guideMatch = path.match(/^\/guides\/([^/]+)$/);
  if (guideMatch) {
    const g = data.guides.find((x) => x.slug === guideMatch[1]);
    if (g) {
      const related = data.guides
        .filter((x) => x.category === g.category && x.slug !== g.slug)
        .slice(0, 5)
        .map((x) => [`/guides/${x.slug}`, x.title]);
      related.push(["/guides", "All guides"]);
      return related;
    }
  }

  if (path === "/banks") {
    return data.US_STATES.filter((s) => s.available).map((s) => [
      `/banks/${s.slug}`,
      `Best banks in ${s.name}`,
    ]);
  }
  const bStateMatch = path.match(/^\/banks\/([a-z-]+)$/);
  if (bStateMatch) {
    const info = data.US_STATES.find((s) => s.slug === bStateMatch[1]);
    if (info) {
      const cities = data.STATE_CITIES[info.code] || [];
      const links = cities
        .slice(0, 8)
        .map((c) => [`/banks/${info.slug}/${data.citySlug(c)}`, `Banks in ${c}`]);
      links.push(["/banks", "All state directories"]);
      links.push(["/bank-accounts", "Online bank accounts"]);
      return links;
    }
  }
  const bCityMatch = path.match(/^\/banks\/([a-z-]+)\/([a-z0-9-]+)$/);
  if (bCityMatch) {
    const info = data.US_STATES.find((s) => s.slug === bCityMatch[1]);
    if (info) {
      return [
        [`/banks/${info.slug}`, `All ${info.name} banks`],
        ["/banks", "All state directories"],
      ];
    }
  }

  return [["/", "Home"]];
}

// Rebuild sitemap.xml completely from the live data sources so new products,
// guides, calculators, and state pages are discovered automatically.
function updateSitemapLastmod(data) {
  const sitemapPath = join(distDir, "sitemap.xml");
  const today = new Date().toISOString().slice(0, 10);

  const u = (path, { changefreq = "weekly", priority = "0.7", lastmod = today } = {}) =>
    `  <url><loc>${SITE_URL}${path}</loc><lastmod>${lastmod}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;

  const blocks = [];

  // Primary pages
  blocks.push(u("/", { changefreq: "daily", priority: "1.0" }));
  blocks.push(u("/bank-accounts", { changefreq: "weekly", priority: "0.9" }));
  blocks.push(u("/investing", { changefreq: "weekly", priority: "0.9" }));
  blocks.push(u("/financial-apps", { changefreq: "weekly", priority: "0.9" }));
  blocks.push(u("/reviews", { changefreq: "weekly", priority: "0.9" }));
  blocks.push(u("/guides", { changefreq: "weekly", priority: "0.9" }));
  blocks.push(u("/calculators", { changefreq: "weekly", priority: "0.8" }));
  blocks.push(u("/banks", { changefreq: "weekly", priority: "0.9" }));

  // State directory pages (only those flagged available)
  for (const s of data.US_STATES.filter((x) => x.available)) {
    const sd = data.stateByCode[s.code];
    const lastmod = sd?.lastVerified
      ? new Date(sd.lastVerified).toISOString().slice(0, 10)
      : today;
    blocks.push(
      u(`/banks/${s.slug}`, { changefreq: "weekly", priority: "0.8", lastmod }),
    );
  }

  // Product review pages
  for (const p of data.products) {
    blocks.push(u(`/product/${p.slug}`, { changefreq: "weekly", priority: "0.8" }));
  }

  // Guide pages
  for (const g of data.guides) {
    blocks.push(u(`/guides/${g.slug}`, { changefreq: "monthly", priority: "0.7" }));
  }

  // Calculator pages
  for (const c of data.calculators) {
    blocks.push(u(`/calculators/${c.slug}`, { changefreq: "monthly", priority: "0.7" }));
  }

  // Editorial + legal
  blocks.push(u("/about", { changefreq: "monthly", priority: "0.5" }));
  blocks.push(u("/authors/michael-hewitt", { changefreq: "monthly", priority: "0.5" }));
  blocks.push(u("/contact", { changefreq: "monthly", priority: "0.4" }));
  blocks.push(u("/disclosure", { changefreq: "monthly", priority: "0.4" }));
  blocks.push(u("/privacy", { changefreq: "monthly", priority: "0.3" }));
  blocks.push(u("/faq", { changefreq: "monthly", priority: "0.5" }));
  blocks.push(u("/newsletter", { changefreq: "monthly", priority: "0.4" }));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${blocks.join(
    "\n",
  )}\n</urlset>\n`;
  writeFileSync(sitemapPath, xml);
}

function emitSplitSitemaps() {
  const sitemapPath = join(distDir, "sitemap.xml");
  if (!existsSync(sitemapPath)) return;
  const xml = readFileSync(sitemapPath, "utf8");
  const today = new Date().toISOString().slice(0, 10);

  // Extract all <url>...</url> blocks
  const urlBlocks = [];
  const re = /<url>([\s\S]*?)<\/url>/g;
  let m;
  while ((m = re.exec(xml))) {
    const inner = m[1];
    const locMatch = /<loc>([^<]+)<\/loc>/.exec(inner);
    if (locMatch) urlBlocks.push({ loc: locMatch[1].trim(), block: `<url>${inner}</url>` });
  }

  const buckets = {
    products: [],
    guides: [],
    calculators: [],
    pages: [],
  };
  for (const u of urlBlocks) {
    if (/\/product\//.test(u.loc)) buckets.products.push(u.block);
    else if (/\/guides\//.test(u.loc)) buckets.guides.push(u.block);
    else if (/\/calculators\//.test(u.loc)) buckets.calculators.push(u.block);
    else buckets.pages.push(u.block);
  }

  const wrap = (items) =>
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items.join(
      "\n"
    )}\n</urlset>\n`;

  writeFileSync(join(distDir, "sitemap-pages.xml"), wrap(buckets.pages));
  writeFileSync(join(distDir, "sitemap-products.xml"), wrap(buckets.products));
  writeFileSync(join(distDir, "sitemap-guides.xml"), wrap(buckets.guides));
  writeFileSync(join(distDir, "sitemap-calculators.xml"), wrap(buckets.calculators));

  const indexItems = [
    "sitemap-pages.xml",
    "sitemap-products.xml",
    "sitemap-guides.xml",
    "sitemap-calculators.xml",
  ]
    .map(
      (f) =>
        `  <sitemap><loc>${SITE_URL}/${f}</loc><lastmod>${today}</lastmod></sitemap>`
    )
    .join("\n");
  const indexXml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexItems}\n</sitemapindex>\n`;
  writeFileSync(join(distDir, "sitemap-index.xml"), indexXml);
}

// ---------- 5. Emit files ----------
async function main() {
  if (!existsSync(join(distDir, "index.html"))) {
    console.error("[prerender] dist/index.html not found — run vite build first");
    process.exit(1);
  }
  const template = readFileSync(join(distDir, "index.html"), "utf8");
  const mod = await loadData();
  const { providers, intros, faqs } = await loadStateProviders();
  const introByCode = {};
  for (const i of intros) introByCode[i.state_code] = i;
  const faqsByCode = {};
  for (const f of faqs) {
    if (!faqsByCode[f.state_code]) faqsByCode[f.state_code] = [];
    faqsByCode[f.state_code].push(f);
  }
  const data = {
    products: mod.products,
    guides: mod.guides,
    calculators: mod.calculators,
    US_STATES: mod.US_STATES,
    STATE_CITIES: mod.STATE_CITIES,
    citySlug: mod.citySlug,
    stateByCode: indexByState(providers),
    introByCode,
    faqsByCode,
  };
  updateSitemapLastmod(data);
  emitSplitSitemaps();
  const urls = readSitemapUrls();

  // Also prerender city pages (not advertised in the sitemap, but reachable
  // via internal state-page links and direct visits). These emit HTML with
  // self-referential canonicals so the city URL is never served with a
  // canonical pointing up to the parent state URL.
  for (const s of data.US_STATES.filter((x) => x.available)) {
    const cities = data.STATE_CITIES[s.code] || [];
    for (const c of cities) {
      urls.push(`${SITE_URL}/banks/${s.slug}/${data.citySlug(c)}`);
    }
  }

  let written = 0;
  let skipped = 0;
  for (const url of urls) {
    const meta = metaForUrl(url, data);
    if (!meta) {
      skipped++;
      continue;
    }
    const html = rewriteHtml(template, meta, data);
    const outPath = meta.path === "/" ? join(distDir, "index.html") : join(distDir, meta.path, "index.html");
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, html);
    written++;
  }

  // Emit a static 404.html with a real <h1>Page not found</h1>
  const notFoundMeta = {
    path: "/404",
    title: "Page Not Found — Investing and Retirement",
    description:
      "The page you are looking for does not exist. Browse our expert reviews of bank accounts, brokerages, and money apps instead.",
    h1: "Page Not Found",
    noindex: true,
  };
  const notFoundHtml = rewriteHtml(template, notFoundMeta, data);
  writeFileSync(join(distDir, "404.html"), notFoundHtml);

  console.log(`[prerender] wrote ${written} html files (${skipped} sitemap URLs had no meta)`);
}

main().catch((err) => {
  console.error("[prerender] failed:", err);
  process.exit(1);
});
