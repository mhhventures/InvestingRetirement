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

// ---------- 2. Route meta definitions (title + description) ----------
function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function staticRouteMeta(path) {
  const map = {
    "/": {
      title: "Investing and Retirement — Compare the Best Financial Products",
      description:
        "Expert reviews and comparisons of the best high-yield savings accounts, checking accounts, investing apps, brokerages, and budgeting tools. Find the right financial product for your goals.",
      h1: "Compare the Best Financial Products",
    },
    "/bank-accounts": {
      title: "Best Bank Accounts 2026 — High-Yield Savings & Checking | Investing and Retirement",
      description:
        "Compare the best high-yield savings and checking accounts of 2026. Up-to-date APYs, fees, and bonuses — ranked by our editors after hands-on testing.",
      h1: "Best Bank Accounts",
    },
    "/investing": {
      title: "Best Investing Apps & Brokerages 2026 | Investing and Retirement",
      description:
        "The best brokerages, robo-advisors, and retirement accounts of 2026, ranked on fees, platform, research, and account options.",
      h1: "Best Investing Apps",
    },
    "/financial-apps": {
      title: "Best Financial Apps 2026 — Budgeting, Credit, Cash Advance | Investing and Retirement",
      description:
        "Budgeting tools, cash advance apps, and credit score trackers to take control of your money. Independent reviews of every app we cover.",
      h1: "Best Financial Apps",
    },
    "/reviews": {
      title: "All Financial Product Reviews | Investing and Retirement",
      description:
        "Complete reviews of every bank account, brokerage, and money app we cover. Ratings based on fees, features, and hands-on testing.",
      h1: "All Product Reviews",
    },
    "/guides": {
      title: "Financial Guides & Articles | Investing and Retirement",
      description:
        "Expert-written guides on saving, budgeting, investing, retirement, and credit. Clear, actionable advice to help you make smarter financial decisions.",
      h1: "Financial Guides & Articles",
    },
    "/calculators": {
      title: "Financial Calculators | Compound Interest, Retirement, Mortgage",
      description:
        "Free financial calculators to help you plan savings, investments, retirement, mortgages, and debt payoff. Run the numbers before you make a decision.",
      h1: "Financial Calculators",
    },
    "/about": {
      title: "About Investing and Retirement — Our Review Methodology",
      description:
        "Meet the team behind Investing and Retirement. Learn how we independently test every financial product before it is ranked.",
      h1: "About Investing and Retirement",
    },
    "/contact": {
      title: "Contact Us | Investing and Retirement",
      description: "Have a question about a product review? Get in touch with our editorial team.",
      h1: "Contact Investing and Retirement",
    },
    "/disclosure": {
      title: "Advertiser Disclosure | Investing and Retirement",
      description: "How Investing and Retirement is compensated, and how that affects our product reviews and rankings.",
      h1: "Advertiser Disclosure",
    },
    "/privacy": {
      title: "Privacy Policy | Investing and Retirement",
      description: "How we collect, use, and protect your information on Investing and Retirement.",
      h1: "Privacy Policy",
    },
    "/faq": {
      title: "Frequently Asked Questions | Investing and Retirement",
      description: "Answers to common questions about our reviews, methodology, and the products we cover.",
      h1: "Frequently Asked Questions",
    },
    "/newsletter": {
      title: "Newsletter | Investing and Retirement",
      description: "Weekly deals, rate updates, and expert picks delivered to your inbox.",
      h1: "Subscribe to Our Newsletter",
    },
  };
  return map[path];
}

function metaForUrl(url, data) {
  const path = new URL(url).pathname.replace(/\/+$/, "") || "/";
  const staticMeta = staticRouteMeta(path);
  if (staticMeta) return { path, ...staticMeta };

  // /product/:slug
  const prodMatch = path.match(/^\/product\/([^/]+)$/);
  if (prodMatch) {
    const p = data.products.find((x) => x.slug === prodMatch[1]);
    if (!p) return null;
    return {
      path,
      title: `${p.name} Review 2026 — Rates, Fees & Features | Investing and Retirement`,
      description: `${p.tagline} Read our expert review of ${p.name} by ${p.provider} — rated ${p.rating}/5 from ${p.reviews.toLocaleString()} reviews. Best for ${p.bestFor.toLowerCase()}.`,
      h1: `${p.name} Review`,
    };
  }

  // /guides/:slug
  const guideMatch = path.match(/^\/guides\/([^/]+)$/);
  if (guideMatch) {
    const g = data.guides.find((x) => x.slug === guideMatch[1]);
    if (!g) return null;
    return {
      path,
      title: `${g.title} | Investing and Retirement`,
      description: g.description,
      h1: g.title,
    };
  }

  // /calculators/:slug
  const calcMatch = path.match(/^\/calculators\/([^/]+)$/);
  if (calcMatch) {
    const c = data.calculators.find((x) => x.slug === calcMatch[1]);
    if (!c) return null;
    return {
      path,
      title: `${c.title} | Investing and Retirement`,
      description: c.description,
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

  return `<div id="seo-fallback" style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0">
      <h1>${esc(meta.h1 || meta.title)}</h1>
      <p>${esc(meta.description)}</p>
      <nav aria-label="Main">${nav}</nav>
      <nav aria-label="Related">${ctx}</nav>
    </div>`;
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
    return data.products.filter((p) => p.category === "bank").slice(0, 20).map((p) => [`/product/${p.slug}`, `${p.name} review`]);
  }
  if (path === "/investing") {
    return data.products.filter((p) => p.category === "investing").slice(0, 20).map((p) => [`/product/${p.slug}`, `${p.name} review`]);
  }
  if (path === "/financial-apps") {
    return data.products.filter((p) => p.category === "app").slice(0, 20).map((p) => [`/product/${p.slug}`, `${p.name} review`]);
  }
  if (path === "/reviews") {
    return data.products.slice(0, 30).map((p) => [`/product/${p.slug}`, `${p.name} review`]);
  }
  if (path === "/guides") {
    return data.guides.map((g) => [`/guides/${g.slug}`, g.title]);
  }
  if (path === "/calculators") {
    return data.calculators.map((c) => [`/calculators/${c.slug}`, c.title]);
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

  return [["/", "Home"]];
}

// ---------- 5. Emit files ----------
async function main() {
  if (!existsSync(join(distDir, "index.html"))) {
    console.error("[prerender] dist/index.html not found — run vite build first");
    process.exit(1);
  }
  const template = readFileSync(join(distDir, "index.html"), "utf8");
  const data = await loadData();
  const urls = readSitemapUrls();

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

  console.log(`[prerender] wrote ${written} html files (${skipped} sitemap URLs had no meta)`);
}

main().catch((err) => {
  console.error("[prerender] failed:", err);
  process.exit(1);
});
