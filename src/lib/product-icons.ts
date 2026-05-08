// Maps product slugs to their brand domain for logo lookup.
// We use Clearbit's free Logo API (https://logo.clearbit.com/DOMAIN) which
// returns real brand logos for millions of companies. No API key required.
// Fallback to monogram badge if image fails to load.
//
// For brands where we have uploaded high-quality logos directly to our CDN,
// we prefer those via the `uploadedLogos` map below.

export const productDomains: Record<string, string> = {
  // Bank accounts: high-yield savings
  "sofi-checking-savings": "sofi.com",
  "ally-online-savings": "ally.com",
  "marcus-high-yield": "marcus.com",
  "barclays-online-savings": "barclaysus.com",
  "cit-platinum-savings": "cit.com",
  "bread-savings": "breadsavings.com",
  "lendingclub-high-yield": "lendingclub.com",
  "amex-high-yield-savings": "americanexpress.com",
  "forbright-growth-savings": "forbrightbank.com",
  "axos-high-yield-savings": "axosbank.com",
  "chime-high-yield-savings": "chime.com",
  "chase-savings": "chase.com",
  "wells-fargo-platinum-savings": "wellsfargo.com",
  "bofa-advantage-savings": "bankofamerica.com",
  "citi-savings": "citi.com",
  "us-bank-savings": "usbank.com",
  "truist-one-savings": "truist.com",

  // Bank accounts: checking
  "chase-total-checking": "chase.com",
  "discover-cashback-checking": "discover.com",
  "chime-checking": "chime.com",
  "sofi-checking": "sofi.com",
  "capital-one-360-checking": "capitalone.com",
  "nbkc-everything-account": "nbkc.com",
  "amex-rewards-checking": "americanexpress.com",
  "upgrade-rewards-checking": "upgrade.com",
  "pnc-virtual-wallet": "pnc.com",
  "ally-interest-checking": "ally.com",
  "etrade-checking": "etrade.com",
  "axos-rewards-checking": "axosbank.com",

  // Investing: brokerages
  "fidelity": "fidelity.com",
  "robinhood": "robinhood.com",
  "vanguard": "vanguard.com",
  "etrade-invest": "etrade.com",
  "webull": "webull.com",
  "sofi-invest": "sofi.com",
  "interactive-brokers": "interactivebrokers.com",
  "charles-schwab": "schwab.com",
  "moomoo": "moomoo.com",

  // Investing: robo-advisors
  "m1-finance": "m1.com",
  "betterment": "betterment.com",
  "acorns": "acorns.com",
  "wealthfront": "wealthfront.com",

  // Investing: crypto
  "coinbase": "coinbase.com",
  "kraken": "kraken.com",
  "gemini": "gemini.com",
  "crypto-com": "crypto.com",
  "uphold": "uphold.com",
  "okx": "okx.com",

  // Investing: prediction markets
  "kalshi": "kalshi.com",
  "polymarket": "polymarket.com",

  // Financial apps: budgeting
  "ynab": "ynab.com",
  "monarch-money": "monarchmoney.com",
  "rocket-money": "rocketmoney.com",
  "empower": "empower.com",

  // Financial apps: cash advance
  "earnin": "earnin.com",
  "dave": "dave.com",
  "albert": "albert.com",
  "brigit": "hellobrigit.com",
  "chime-mypay": "chime.com",
  "possible-finance": "possiblefinance.com",
  "tilt": "tilt.com",

  // Financial apps: credit score
  "sofi-credit-score": "sofi.com",
  "credit-karma": "creditkarma.com",
  "experian": "experian.com",

  // Financial apps: banking (neobank)
  "current": "current.com",
  "varo": "varomoney.com",
  "cash-app": "cash.app",

  // Financial apps: credit & loans
  "upgrade-app": "upgrade.com",
  "perpay": "perpay.com",

  // Financial apps: research & analysis
  "motley-fool": "fool.com",
  "seeking-alpha": "seekingalpha.com",
  "tipranks": "tipranks.com",
  "tradingview": "tradingview.com",
  "cnbc-pro": "cnbc.com",
  "stock-analysis-pro": "stockanalysis.com",
};

// Uploaded brand logos hosted on our CDN. When a slug matches here, we use
// the direct URL instead of Clearbit. One uploaded logo can be reused across
// multiple product slugs for the same brand (e.g., SoFi Checking & Savings,
// SoFi Invest, SoFi Checking all share the SoFi logo).
//
// Brand → CDN URL (keyed by brand for easy maintenance)
const brandLogoUrls: Record<string, string> = {
  marcus: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776994155476-gzdxnoo1oi-marcus.jpeg",
  kraken: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776994155437-4fxp8jei2ff-kraken.jpeg",
  gemini: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776994155237-iunqjbitwca-gemini.jpeg",
  sofi: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776994155218-v0daxjw8z3o-sofi.jpeg",
  ally: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776994155069-r22ookf7p1o-ally.jpeg",
  barclays: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776994383927-tzoh4fxktzn-barclays.jpeg",
  cit: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776994385557-kwl020ujtj-cit.jpeg",
  bread: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776994386975-m4d31f4oh4k-bread.jpeg",
  lendingclub: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776994388444-d8gfx33v1u-lendingclub.jpeg",
  chase: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776994390455-whbi999i6fo-chase.jpeg",
  amex: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776994392094-vj40ozvw8nf-americanexpress.jpeg",
  forbright: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776994518273-8hcmm8ls3ws-forbrightbank.jpeg",
  discover: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776994519867-56rtklb3gv6-discover.jpeg",
  chime: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776994521718-set0fg1ndji-chime.jpeg",
  capitalone: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776994523326-bshmu4bttem-capitalone.jpeg",
  nbkc: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776994524837-cfqimc8yyo-nbkc.jpeg",
  upgrade: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776994526552-p05dip7a19s-upgrade.jpeg",
  pnc: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776994528585-179704nogtn-pnc.jpeg",
  etrade: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776994529994-vjsvwjw2exr-etrade.jpeg",
  axos: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776994838797-pyo443ck32j-axos.jpeg",
  fidelity: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776994840740-ypvn2nip6ei-fidelity.jpeg",
  robinhood: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776994842381-1dc8ksw3yzc-robinhood.jpeg",
  vanguard: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776994843985-yshretdp8ii-vanguard.jpeg",
  webull: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776994845650-jqyawquruo-webull.jpeg",
  schwab: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776994847705-nvi2bmfw868-charlesschwab.jpeg",
  interactivebrokers: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776994849247-z89vnamlo5-interactivebrokers.jpeg",
  moomoo: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776994850670-y9l3oyzku9-moomoo.jpeg",
  m1: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776994852058-3xer484y2fo-m1.jpeg",
  betterment: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776994853794-tq0rxdgm56d-betterment.jpeg",
  acorns: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776994855420-dboivq25y05-acorns.jpeg",
  wealthfront: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776994857153-noios49yu6d-wealthfront.jpeg",
  coinbase: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776994858900-xupf0si6k3-coinbase.jpeg",
  cryptocom: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776994860491-l3o9ech7ilp-crypto.jpeg",
  uphold: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776994862886-rdydq64xkz-uphold.jpeg",
  okx: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776994864541-i1gfp0vrnf-okx.jpeg",
  seekingalpha: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776995191993-r9t5sds8i9-seekingalpha.jpeg",
  motleyfool: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776995193826-70cex3nyres-fool.jpeg",
  tipranks: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776995195304-ceu6hk9vsc-tipranks.jpeg",
  tradingview: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776995197096-yodtx810ov-tradingview.jpeg",
  cnbc: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776995199139-ke8fi125fq-cnbc.jpeg",
  stockanalysis: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776995200788-u8t4hbb6f5-stockanalysis.jpeg",
  kalshi: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776995340976-qzi9rfxwe4b-kalshi.jpeg",
  polymarket: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776995342892-9gymxt2sp9-polymarket.jpeg",
  monarch: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776995347515-o5j0oklne6l-monarch.jpeg",
  ynab: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776995357948-iktjpvyb5g-ynab.jpeg",
  rocketmoney: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776995359813-49ifmqm6svw-rocketmoney.jpeg",
  empower: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776995361305-ug00i8k0keq-empower.jpeg",
  earnin: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776995769085-r5wg9m6wonh-earnin.jpeg",
  dave: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776995771299-k5lcybunfi-dave.jpeg",
  albert: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776995772744-tytvoehbqmb-albert.jpeg",
  tilt: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776995774812-1l27o6irrxr-tilt.jpeg",
  brigit: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776995776230-gzs86x7i7um-brigit.jpeg",
  possiblefinance: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776995777815-ovdlr2dkbks-possiblefinance.jpeg",
  creditkarma: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776995900565-10ydr97aihvb-creditkarma.jpeg",
  experian: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776995902426-gyjqcscyroi-experian.jpeg",
  current: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776995903936-0633e840peb4-current.jpeg",
  varo: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776995905380-tqustzivjye-varobank.jpeg",
  cashapp: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776995907213-gkv5l39rx6t-cash.jpeg",
  perpay: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776995908985-gf71j5harq-perpay.jpeg",
  wellsfargo: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1777087001955-1znd8e3kd2l-wellsfargo.jpeg",
  bankofamerica: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1777087004586-ex8fkc0uqnq-bankofamerica.jpeg",
  citibank: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1777087006043-gt6l10telpv-citibank.jpeg",
  usbank: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1777087007799-hi1tn0n9rh-usbank.jpeg",
  truist: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1777087009239-xz4fgw807q-truist.jpeg",
  chasenew: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1777087010904-y5twdl662nl-chase__1_.jpeg",
};

// Map product slugs → brand key in `brandLogoUrls`.
const uploadedLogoSlugMap: Record<string, keyof typeof brandLogoUrls> = {
  // Marcus
  "marcus-high-yield": "marcus",

  // Kraken
  "kraken": "kraken",

  // Gemini
  "gemini": "gemini",

  // SoFi: all SoFi products share the same brand mark
  "sofi-checking-savings": "sofi",
  "sofi-checking": "sofi",
  "sofi-invest": "sofi",
  "sofi-credit-score": "sofi",

  // Ally: all Ally products share the same brand mark
  "ally-online-savings": "ally",
  "ally-interest-checking": "ally",

  // Barclays
  "barclays-online-savings": "barclays",

  // CIT Bank
  "cit-platinum-savings": "cit",

  // Bread Savings
  "bread-savings": "bread",

  // LendingClub
  "lendingclub-high-yield": "lendingclub",

  // Chase
  "chase-total-checking": "chase",

  // American Express: all Amex products share the same brand mark
  "amex-high-yield-savings": "amex",
  "amex-rewards-checking": "amex",

  // Forbright
  "forbright-growth-savings": "forbright",

  // Discover
  "discover-cashback-checking": "discover",

  // Chime: all Chime products share the same brand mark
  "chime-checking": "chime",
  "chime-mypay": "chime",

  // Capital One
  "capital-one-360-checking": "capitalone",

  // NBKC
  "nbkc-everything-account": "nbkc",

  // Upgrade: all Upgrade products share the same brand mark
  "upgrade-rewards-checking": "upgrade",
  "upgrade-app": "upgrade",

  // PNC
  "pnc-virtual-wallet": "pnc",

  // E*TRADE: checking + invest share the same brand mark
  "etrade-checking": "etrade",
  "etrade-invest": "etrade",

  // Axos: all Axos products share the same brand mark
  "axos-rewards-checking": "axos",
  "axos-high-yield-savings": "axos",

  // Chime HYSA: shares same brand mark
  "chime-high-yield-savings": "chime",

  // Big bank savings
  "chase-savings": "chasenew",
  "wells-fargo-platinum-savings": "wellsfargo",
  "bofa-advantage-savings": "bankofamerica",
  "citi-savings": "citibank",
  "us-bank-savings": "usbank",
  "truist-one-savings": "truist",

  // Fidelity
  "fidelity": "fidelity",

  // Robinhood
  "robinhood": "robinhood",

  // Vanguard
  "vanguard": "vanguard",

  // Webull
  "webull": "webull",

  // Charles Schwab
  "charles-schwab": "schwab",

  // Interactive Brokers
  "interactive-brokers": "interactivebrokers",

  // Moomoo
  "moomoo": "moomoo",

  // M1 Finance
  "m1-finance": "m1",

  // Betterment
  "betterment": "betterment",

  // Acorns
  "acorns": "acorns",

  // Wealthfront
  "wealthfront": "wealthfront",

  // Coinbase
  "coinbase": "coinbase",

  // Crypto.com
  "crypto-com": "cryptocom",

  // Uphold
  "uphold": "uphold",

  // OKX
  "okx": "okx",

  // Seeking Alpha
  "seeking-alpha": "seekingalpha",

  // Motley Fool
  "motley-fool": "motleyfool",

  // TipRanks
  "tipranks": "tipranks",

  // TradingView
  "tradingview": "tradingview",

  // CNBC
  "cnbc-pro": "cnbc",

  // Stock Analysis
  "stock-analysis-pro": "stockanalysis",

  // Kalshi
  "kalshi": "kalshi",

  // Polymarket
  "polymarket": "polymarket",

  // YNAB
  "ynab": "ynab",

  // Monarch Money
  "monarch-money": "monarch",

  // Rocket Money
  "rocket-money": "rocketmoney",

  // Empower
  "empower": "empower",

  // EarnIn
  "earnin": "earnin",

  // Dave
  "dave": "dave",

  // Albert
  "albert": "albert",

  // Tilt
  "tilt": "tilt",

  // Brigit
  "brigit": "brigit",

  // Possible Finance
  "possible-finance": "possiblefinance",

  // Credit Karma
  "credit-karma": "creditkarma",

  // Experian
  "experian": "experian",

  // Current
  "current": "current",

  // Varo
  "varo": "varo",

  // Cash App
  "cash-app": "cashapp",

  // Perpay
  "perpay": "perpay",
};

export function getProductDomain(slug: string): string | undefined {
  return productDomains[slug];
}

export function getProductLogoUrl(slug: string, size: number = 128): string | undefined {
  // 1. Prefer uploaded CDN logos when available
  const brandKey = uploadedLogoSlugMap[slug];
  if (brandKey && brandLogoUrls[brandKey]) {
    return brandLogoUrls[brandKey];
  }

  // 2. Fall back to logo.dev / Clearbit for all other brands
  const domain = productDomains[slug];
  if (!domain) return undefined;
  return getDomainLogoUrl(domain, size);
}

// Resolve a logo URL from a domain string. Uses logo.dev (with optional token
// from VITE_LOGO_DEV_TOKEN for branded/un-watermarked results) and falls back
// to Clearbit via onError in the consumer.
export function getDomainLogoUrl(domain: string, size: number = 128): string {
  const clean = domain.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  const token = (import.meta as { env?: Record<string, string | undefined> }).env
    ?.VITE_LOGO_DEV_TOKEN;
  if (token) {
    const qs = new URLSearchParams({
      size: String(size),
      format: "png",
      token,
    });
    return `https://img.logo.dev/${clean}?${qs.toString()}`;
  }
  // No logo.dev token configured: fall back to Google's favicon service,
  // which is keyless and returns a small real brand mark for most domains.
  // (Clearbit's free logo API was retired in 2023 and now 404s.)
  return `https://www.google.com/s2/favicons?sz=${Math.min(
    Math.max(size, 32),
    256,
  )}&domain=${clean}`;
}

export function extractDomain(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}
