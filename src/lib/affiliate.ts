// Affiliate URL helpers.
// - `partnerLink` builds the tracked `{partner}.investingandretirement.com/{offer-slug}` URL
//   that the Supabase `redirect` edge function resolves and 302s to the destination.
// - `productPartnerLink` resolves a product slug (from src/data/products.ts) to its
//   tracked partner link via the map below. Falls back to `withUtm(p.url)` when a
//   product has no partner mapping yet.
// - `withUtm` is kept for any legacy direct-to-merchant links.

const ROOT_DOMAIN = "investingandretirement.com";

// product slug → [partner slug, offer slug]. Offer slugs must match rows seeded
// in supabase/migrations/20260503182057_seed_partner_offers.sql.
const PRODUCT_TO_PARTNER: Record<string, [string, string]> = {
  "sofi-checking-savings": ["sofi", "sofi-checking-savings"],
  "sofi-checking": ["sofi", "sofi-checking"],
  "sofi-invest": ["sofi", "sofi-invest"],
  "ally-online-savings": ["ally", "ally-online-savings"],
  "ally-interest-checking": ["ally", "ally-interest-checking"],
  "chase-savings": ["chase", "chase-savings"],
  "chase-total-checking": ["chase", "chase-total-checking"],
  "chime-high-yield-savings": ["chime", "chime-high-yield-savings"],
  "chime-checking": ["chime", "chime-checking"],
  "chime-mypay": ["chime", "chime-mypay"],
  "amex-high-yield-savings": ["amex", "amex-high-yield-savings"],
  "amex-rewards-checking": ["amex", "amex-rewards-checking"],
  "axos-high-yield-savings": ["axos", "axos-one-savings"],
  "axos-rewards-checking": ["axos", "axos-rewards-checking"],
  "etrade-checking": ["etrade", "etrade-max-rate-checking"],
  "etrade-invest": ["etrade", "etrade-invest"],
  "upgrade-rewards-checking": ["upgrade", "upgrade-rewards-checking"],
  "upgrade-app": ["upgrade", "upgrade-credit"],
  "marcus-high-yield": ["marcus", "marcus-high-yield-savings"],
  "barclays-online-savings": ["barclays", "barclays-online-savings"],
  "cit-platinum-savings": ["citbank", "cit-platinum-savings"],
  "bread-savings": ["bread", "bread-savings-high-yield"],
  "lendingclub-high-yield": ["lendingclub", "lendingclub-levelup-savings"],
  "forbright-growth-savings": ["forbright", "forbright-growth-savings"],
  "wells-fargo-platinum-savings": ["wellsfargo", "wellsfargo-platinum-savings"],
  "bofa-advantage-savings": ["bofa", "bofa-advantage-savings"],
  "citi-savings": ["citi", "citi-savings"],
  "us-bank-savings": ["usbank", "usbank-standard-savings"],
  "truist-one-savings": ["truist", "truist-one-savings"],
  "discover-cashback-checking": ["discover", "discover-cashback-debit"],
  "capital-one-360-checking": ["capitalone", "capitalone-360-checking"],
  "nbkc-everything-account": ["nbkc", "nbkc-everything-account"],
  "pnc-virtual-wallet": ["pnc", "pnc-virtual-wallet"],
  "fidelity": ["fidelity", "fidelity-investments"],
  "robinhood": ["robinhood", "robinhood-invest"],
  "vanguard": ["vanguard", "vanguard-invest"],
  "webull": ["webull", "webull-invest"],
  "interactive-brokers": ["interactivebrokers", "interactivebrokers-invest"],
  "charles-schwab": ["schwab", "schwab-invest"],
  "moomoo": ["moomoo", "moomoo-invest"],
  "m1-finance": ["m1finance", "m1-finance-invest"],
  "betterment": ["betterment", "betterment-robo"],
  "acorns": ["acorns", "acorns-invest"],
  "wealthfront": ["wealthfront", "wealthfront-robo"],
  "coinbase": ["coinbase", "coinbase-exchange"],
  "kraken": ["kraken", "kraken-exchange"],
  "gemini": ["gemini", "gemini-exchange"],
  "crypto-com": ["cryptocom", "cryptocom-exchange"],
  "uphold": ["uphold", "uphold-exchange"],
  "okx": ["okx", "okx-exchange"],
  "kalshi": ["kalshi", "kalshi-prediction-markets"],
  "polymarket": ["polymarket", "polymarket-prediction-markets"],
  "ynab": ["ynab", "ynab-budgeting"],
  "monarch-money": ["monarch", "monarch-money-budgeting"],
  "rocket-money": ["rocketmoney", "rocket-money-budgeting"],
  "empower": ["empower", "empower-personal-dashboard"],
  "earnin": ["earnin", "earnin-cash-advance"],
  "dave": ["dave", "dave-cash-advance"],
  "albert": ["albert", "albert-cash-advance"],
  "brigit": ["brigit", "brigit-cash-advance"],
  "possible-finance": ["possiblefinance", "possible-finance-cash-advance"],
  "tilt": ["tilt", "tilt-cash-advance"],
  "credit-karma": ["creditkarma", "credit-karma-credit-score"],
  "experian": ["experian", "experian-credit-score"],
  "current": ["current", "current-neobank"],
  "varo": ["varo", "varo-neobank"],
  "cash-app": ["cashapp", "cash-app-neobank"],
  "perpay": ["perpay", "perpay-credit"],
  "motley-fool": ["motleyfool", "motley-fool-stock-advisor"],
  "seeking-alpha": ["seekingalpha", "seeking-alpha-research"],
  "tipranks": ["tipranks", "tipranks-research"],
  "tradingview": ["tradingview", "tradingview-research"],
  "cnbc-pro": ["cnbc", "cnbc-pro-research"],
  "stock-analysis-pro": ["stockanalysis", "stock-analysis-pro-research"],
};

export function partnerLink(
  partnerSlug: string,
  offerSlug: string,
  opts: { placement?: string; term?: string; rank?: number | string; page?: string } = {},
): string {
  const base = `https://${partnerSlug}.${ROOT_DOMAIN}/${offerSlug}`;
  const params = new URLSearchParams();
  if (opts.placement) params.set("p", opts.placement);
  if (opts.term) params.set("t", opts.term);
  if (opts.rank !== undefined && opts.rank !== "") params.set("r", String(opts.rank));
  if (opts.page) params.set("pg", opts.page);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

// Resolves a product slug to its tracked partner URL. Falls back to a UTM-tagged
// direct merchant link when the product isn't in the partner map yet.
export function productPartnerLink(
  productSlug: string,
  fallbackUrl: string,
  opts: { placement?: string; term?: string; campaign?: string; rank?: number | string; page?: string } = {},
): string {
  const mapped = PRODUCT_TO_PARTNER[productSlug];
  if (mapped) {
    return partnerLink(mapped[0], mapped[1], {
      placement: opts.placement,
      term: opts.term,
      rank: opts.rank,
      page: opts.page,
    });
  }
  return withUtm(fallbackUrl, {
    campaign: opts.campaign ?? "direct",
    content: opts.placement ?? productSlug,
    term: opts.term,
  });
}

// Resolves a state_providers row to its tracked `{partner}.investingandretirement.com/{offer}`
// URL. Partner and offer slugs are derived with the same rules used in the
// `seed_state_provider_partner_offers` migration so client + server stay in sync.
export function stateProviderPartnerLink(
  p: {
    state_code: string;
    product_type: string;
    institution_name: string;
    website_url: string | null | undefined;
  },
  opts: { placement?: string; term?: string } = {},
): string {
  const fallback = p.website_url || "";
  const host = (p.website_url || "")
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/^www\./, "");
  const firstLabel = host.split(".")[0] || "";
  const kebab = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  const partnerSlug = firstLabel
    ? firstLabel.replace(/[^a-z0-9]/g, "")
    : kebab(p.institution_name);
  if (!partnerSlug) return fallback;
  const offerSlug = `${p.state_code.toLowerCase()}-${p.product_type}-${kebab(
    p.institution_name,
  )}`;
  return partnerLink(partnerSlug, offerSlug, opts);
}

export function withUtm(
  url: string,
  opts: { campaign: string; content?: string; term?: string },
): string {
  try {
    const u = new URL(url);
    u.searchParams.set("utm_source", "investingandretirement");
    u.searchParams.set("utm_medium", "affiliate");
    u.searchParams.set("utm_campaign", opts.campaign);
    if (opts.content) u.searchParams.set("utm_content", opts.content);
    if (opts.term) u.searchParams.set("utm_term", opts.term);
    return u.toString();
  } catch {
    return url;
  }
}
