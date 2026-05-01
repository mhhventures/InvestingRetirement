// Affiliate URL helper — appends consistent UTM tracking parameters to outbound links.

export function withUtm(
  url: string,
  opts: { campaign: string; content?: string; term?: string }
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
