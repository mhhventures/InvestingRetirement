import { createFileRoute, Link } from "@tanstack/react-router";
import { getBySlug, products } from "@/data/products";
import { withUtm } from "@/lib/affiliate";
import { StarRating, ProductLogo, DisclosureIcon } from "@/components/product-card";
import { getDisclosure } from "@/data/disclosures";
import { Sidebar } from "@/components/sidebar-offers";
import { ClarityResearch, GradeBadge, ResearchBlocks, StrengthsLimitations } from "@/components/research-blocks";
import { useSeo, SITE_URL } from "@/lib/seo";
import { AuthorByline, FtcDisclosure, HowWeReview, EditorialStandardsBadge } from "@/components/eeat";
import { RelatedGuidesForProduct } from "@/components/related-guides";
import { getAuthorForCategory, authors } from "@/lib/authors";

export const Route = createFileRoute("/product/$slug")({
  component: ProductDetail,
});

function ProductDetail() {
  const { slug } = Route.useParams();
  const p = getBySlug(slug);

  useSeo(
    p
      ? {
          title: `${p.name} Review 2026 — Rates, Fees & Features | Investing and Retirement`,
          description: `${p.tagline} Read our expert review of ${p.name} by ${p.provider} — rated ${p.rating}/5 from ${p.reviews.toLocaleString()} reviews. Best for ${p.bestFor.toLowerCase()}.`,
          path: `/product/${p.slug}`,
          type: "product",
          jsonLd: [
            {
              "@context": "https://schema.org",
              "@type": "Product",
              name: p.name,
              description: p.tagline,
              brand: { "@type": "Brand", name: p.provider },
              url: `${SITE_URL}/product/${p.slug}`,
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: p.rating,
                reviewCount: p.reviews,
                bestRating: 5,
                worstRating: 1,
              },
              review: {
                "@type": "Review",
                author: { "@type": "Organization", name: "Investing and Retirement" },
                reviewRating: {
                  "@type": "Rating",
                  ratingValue: p.rating,
                  bestRating: 5,
                },
                reviewBody: p.tagline,
              },
            },
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
                { "@type": "ListItem", position: 2, name: p.subcategory, item: `${SITE_URL}/reviews` },
                { "@type": "ListItem", position: 3, name: p.name, item: `${SITE_URL}/product/${p.slug}` },
              ],
            },
          ],
        }
      : {
          title: "Product Not Found | Investing and Retirement",
          description: "The product you are looking for could not be found.",
          path: `/product/${slug}`,
          noindex: true,
        }
  );

  if (!p) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-black mb-2">Product not found</h1>
        <Link to="/" className="text-[#0e4d45] hover:underline text-sm">Back home</Link>
      </div>
    );
  }

  const related = products
    .filter((x) => x.category === p.category && x.slug !== p.slug)
    .slice(0, 3);

  const author = getAuthorForCategory(p.subcategory);
  const reviewer = authors["editorial-team"];
  const publishedDate = "January 2026";
  const updatedDate = "April 2026";

  return (
    <div>
      {/* FTC Advertiser Disclosure — compact bar at the top, legally required */}
      <FtcDisclosure variant="compact" />

      {/* Breadcrumb */}
      <div className="border-b border-[#e4d9cf] bg-[#fef6f1]">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 text-[10px] sm:text-[11px] text-black/50 overflow-x-auto">
          <Link to="/" className="hover:text-[#0e4d45]">Home</Link>
          <span className="mx-1 sm:mx-1.5 text-black/30">/</span>
          <span className="whitespace-nowrap">{p.subcategory}</span>
          <span className="mx-1 sm:mx-1.5 text-black/30">/</span>
          <span className="text-black font-semibold truncate">{p.name}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 sm:gap-6">
          <div className="min-w-0">

            {/* Header Card */}
            <div className="bg-white border border-[#e4d9cf] rounded mb-3 overflow-hidden">
              <div className="p-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <ProductLogo p={p} size={48} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1.5 sm:gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-0.5">
                          <h1 className="text-sm sm:text-base font-bold text-black leading-tight">{p.name}</h1>
                          {p.editorsPick && (
                            <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wide border border-[#0e4d45] text-[#0e4d45] px-1 sm:px-1.5 py-0.5 rounded-sm">
                              Editor
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-black/50 mb-1">by {p.provider}</div>
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <StarRating rating={p.rating} size="sm" />
                          <span className="text-[9px] sm:text-[11px] text-black/50">({p.reviews.toLocaleString()})</span>
                        </div>
                      </div>
                      <GradeBadge rating={p.rating} grade={p.grade} />
                    </div>
                  </div>
                </div>

                {/* Author byline with E-E-A-T signals */}
                <div className="mt-2.5 sm:mt-3">
                  <AuthorByline
                    author={author}
                    reviewedBy={reviewer}
                    publishedDate={publishedDate}
                    updatedDate={updatedDate}
                  />
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <EditorialStandardsBadge />
                </div>

                {/* Key stats row */}
                <div className="mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-[#e4d9cf] grid grid-cols-2 gap-2 sm:gap-3 text-[10px] sm:text-[11px]">
                  {(() => { const disc = (p as any).disclosure || getDisclosure(p.slug); const attachTo = p.apy ? "apy" : p.bonus ? "bonus" : "fees"; return (<>
                  {p.apy && (
                    <div>
                      <div className="flex items-center gap-1 text-black/40 uppercase tracking-wide text-[10px]">APY {disc && attachTo === "apy" && <DisclosureIcon text={disc} label={`${p.name} APY disclosure`} />}</div>
                      <div className="font-bold text-[#0e4d45] text-sm">{p.apy}</div>
                    </div>
                  )}
                  {p.bonus && (
                    <div>
                      <div className="flex items-center gap-1 text-black/40 uppercase tracking-wide text-[10px]">Bonus {disc && attachTo === "bonus" && <DisclosureIcon text={disc} label={`${p.name} bonus disclosure`} />}</div>
                      <div className="font-bold text-black text-sm">{p.bonus}</div>
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1 text-black/40 uppercase tracking-wide text-[10px]">Fees {disc && attachTo === "fees" && <DisclosureIcon text={disc} label={`${p.name} fees disclosure`} />}</div>
                    <div className="font-semibold text-black text-sm">{p.fees}</div>
                  </div>
                  </>); })()}
                  <div>
                    <div className="text-black/40 uppercase tracking-wide text-[10px]">Min. Deposit</div>
                    <div className="font-semibold text-black text-sm">{p.minDeposit}</div>
                  </div>
                
                </div>

                {/* CTA row */}
                <div className="mt-2.5 sm:mt-3">
                  <a
                    href={withUtm(p.url, {
                      campaign: "product-review",
                      content: "open-account-cta",
                      term: p.slug,
                    })}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="block text-center px-3 py-2 rounded-sm bg-[#0e4d45] hover:bg-[#0a3832] text-[#fef6f1] text-xs font-semibold transition-colors uppercase tracking-wide"
                  >
                    Open {p.category === "investing" ? "Account" : p.category === "app" ? "App" : "Account"}
                  </a>
                </div>
              </div>

              {/* Zero-fees callout if applicable */}
              {(p.fees === "$0 commissions" || p.fees === "Commission-free" || p.fees === "No monthly fees") && (
                <div className="border-t border-[#e4d9cf] px-4 py-2 bg-[#0e4d45]/5 flex items-center gap-1.5 text-[11px] text-[#0e4d45] font-semibold">
                  <span>&#10003;</span>
                  <span>
                    {p.category === "investing" ? "Zero commission trades" : "No monthly fees"}
                  </span>
                </div>
              )}
            </div>

            {/* Overview */}
            <section className="bg-white border border-[#e4d9cf] rounded p-3 sm:p-4 mb-3">
              <h2 className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest border-b border-[#e4d9cf] pb-1.5 mb-2 sm:mb-3">
                Overview
              </h2>
              <p className="text-xs sm:text-sm text-black leading-relaxed">
                {p.tagline} Best for <strong>{p.bestFor.toLowerCase()}</strong>, this product stands out
                for its combination of features, fees, and user experience. Our editorial team
                independently reviewed {p.name} against competitors in the {p.subcategory.toLowerCase()}{" "}
                space and found it to be a strong contender for consumers who prioritize value and
                transparency.
              </p>
            </section>

            {/* How We Review — transparency for E-E-A-T */}
            <HowWeReview category={p.category} />

            {/* Clarity Research Commentary */}
            <ClarityResearch product={p} />

            {/* Research Feature Blocks */}
            <ResearchBlocks product={p} />

            {/* Strengths & Limitations */}
            <StrengthsLimitations pros={p.pros} cons={p.cons} />

            {/* Key Highlights */}
            <section className="bg-white border border-[#e4d9cf] rounded p-3 sm:p-4 mb-4 sm:mb-5">
              <h2 className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest border-b border-[#e4d9cf] pb-1.5 mb-2 sm:mb-3">
                Key Highlights
              </h2>
              <ul className="space-y-1">
                {p.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm">
                    <span className="text-[#0e4d45] font-bold mt-0.5">•</span>
                    <span className="text-black">{h}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Who it is best for */}
            <section className="bg-white border border-[#e4d9cf] rounded p-3 sm:p-4 mb-4 sm:mb-5">
              <h2 className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest border-b border-[#e4d9cf] pb-1.5 mb-2 sm:mb-3">
                Who It Is Best For
              </h2>
              <p className="text-xs sm:text-sm text-black leading-relaxed">
                {p.name} is ideal for <strong>{p.bestFor.toLowerCase()}</strong>. If you value{" "}
                {p.highlights[0]?.toLowerCase()} and want a trusted provider with strong customer
                reviews, this is a solid choice. Readers consistently rate it {p.rating}/5 stars based
                on ease of use, value, and customer support.
              </p>
            </section>

            {/* Related Guides — internal linking to editorial content */}
            <RelatedGuidesForProduct product={p} />

            {/* Related Products - Compare Table */}
            {related.length > 0 && (
              <section className="bg-white border border-[#e4d9cf] rounded overflow-hidden mb-4 sm:mb-5">
                <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#e4d9cf]">
                  <h2 className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest">Compare Similar Products</h2>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#f5ede2] border-b border-[#e4d9cf]">
                      <th className="text-left px-3 sm:px-4 py-2 text-[10px] sm:text-[11px] font-bold text-[#0e4d45] uppercase tracking-wider">Product</th>
                      <th className="text-right px-3 sm:px-4 py-2 text-[10px] sm:text-[11px] font-bold text-[#0e4d45] uppercase tracking-wider">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {related.map((r, idx) => (
                      <tr key={r.slug} className="border-b border-[#e4d9cf] last:border-b-0">
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3">
                          <Link
                            to="/product/$slug"
                            params={{ slug: r.slug }}
                            className="flex items-center gap-2 group hover:text-[#0e4d45] transition-colors"
                          >
                            <ProductLogo p={r} size={24} />
                            <div className="min-w-0">
                              <div className="text-[11px] sm:text-xs font-semibold text-black group-hover:text-[#0e4d45]">{r.name}</div>
                              <div className="text-[9px] text-black/50">{r.tagline}</div>
                            </div>
                          </Link>
                        </td>
                        <td className="text-right px-3 sm:px-4 py-2.5 sm:py-3">
                          <Link
                            to="/product/$slug"
                            params={{ slug: r.slug }}
                            className="inline-block text-[11px] sm:text-xs font-semibold text-[#0e4d45] hover:underline"
                          >
                            <StarRating rating={r.rating} size="sm" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            {/* Advertiser disclosure */}
            <section className="mt-4 sm:mt-6 text-[9px] sm:text-[10px] text-black/40 leading-snug border-t border-[#e4d9cf] pt-2 sm:pt-3">
              <strong>Advertiser Disclosure:</strong> We may be compensated when you click on links to partner products. This does not influence our editorial ratings or rankings. See our full disclosure policy for details.
            </section>
          </div>

          <Sidebar />
        </div>
      </div>
    </div>
  );
}
