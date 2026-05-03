// Affiliate URL helpers.
// - `partnerLink` builds the tracked `{partner}.investingandretirement.com/{offer-slug}` URL
//   that the Supabase `redirect` edge function resolves and 302s to the destination.
// - `withUtm` is kept for any legacy direct-to-merchant links.

const ROOT_DOMAIN = "investingandretirement.com";

export function partnerLink(
  partnerSlug: string,
  offerSlug: string,
  opts: { placement?: string; term?: string } = {},
): string {
  const base = `https://${partnerSlug}.${ROOT_DOMAIN}/${offerSlug}`;
  const params = new URLSearchParams();
  if (opts.placement) params.set("p", opts.placement);
  if (opts.term) params.set("t", opts.term);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
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
