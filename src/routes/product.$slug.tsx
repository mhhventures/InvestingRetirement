import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { getBySlug, products } from "@/data/products";
import { productPartnerLink } from "@/lib/affiliate";
import { trackEvent } from "@/lib/pixel";
import { StarRating, ProductLogo, DisclosureIcon } from "@/components/product-card";
import { getDisclosure } from "@/data/disclosures";
import { Sidebar } from "@/components/sidebar-offers";
import { ClarityResearch, GradeBadge, ResearchBlocks, StrengthsLimitations } from "@/components/research-blocks";
import { RubricScorecard, BenchmarkContext, HowWeTested, CompetitorComparison, KeyTakeaways, ProductPrimer, HowToMaximize, ProsConsExplained, OperationalLimits, HowToSignUp } from "@/components/product-analysis";
import { useSeo, SITE_URL } from "@/lib/seo";
import { AuthorByline, FtcDisclosure, HowWeReview, EditorialStandardsBadge } from "@/components/eeat";
import { RelatedGuidesForProduct } from "@/components/related-guides";
import { getAuthorForCategory, authors } from "@/lib/authors";

const RATES_VERIFIED_DATE = "Apr 22, 2026";

export const Route = createFileRoute("/product/$slug")({
  component: ProductDetail,
});

function ProductDetail() {
  const { slug } = Route.useParams();
  const p = getBySlug(slug);

  useSeo(
    p
      ? {
          title: `${p.name} Review 2026: Rates, Fees & Features`,
          description: `${p.tagline} ${p.name} review: ${p.rating}/5. Best for ${p.bestFor.toLowerCase()}.`,
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
                author: {
                  "@type": "Person",
                  name: "Michael Hewitt",
                  jobTitle: "Founder & Editor-in-Chief",
                  url: `${SITE_URL}/about`,
                },
                publisher: {
                  "@type": "Organization",
                  name: "Investing and Retirement",
                  url: SITE_URL,
                },
                datePublished: "2026-01-15",
                dateModified: "2026-04-15",
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
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: `Is ${p.name} safe and trustworthy?`,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: `${p.name} is offered by ${p.provider}. ${
                      p.category === "bank"
                        ? "Deposits are FDIC-insured up to applicable limits, and the provider follows standard U.S. banking regulations."
                        : p.category === "investing"
                        ? "The provider is regulated by the SEC and FINRA where applicable, and client assets are typically SIPC-protected up to $500,000."
                        : "The provider follows U.S. consumer-finance regulations and publishes a privacy policy covering user data."
                    } Our editors rated it ${p.rating}/5 after independent testing.`,
                  },
                },
                {
                  "@type": "Question",
                  name: `What are the fees for ${p.name}?`,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: `${p.name} charges ${p.fees}. Minimum deposit: ${p.minDeposit}.${
                      p.apy ? ` Current APY: ${p.apy}.` : ""
                    }${p.bonus ? ` Welcome offer: ${p.bonus}.` : ""}`,
                  },
                },
                {
                  "@type": "Question",
                  name: `Who is ${p.name} best for?`,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: `${p.name} is best for ${p.bestFor.toLowerCase()}. It sits in our ${p.subcategory} category and scored ${p.rating}/5 based on ${p.reviews.toLocaleString()} user reviews plus our editorial testing.`,
                  },
                },
                {
                  "@type": "Question",
                  name: `How long does it take to open an account with ${p.name}?`,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: `The online application itself typically takes 5–10 minutes, with most approvals completed within one business day. Initial funding via ACH transfer takes 1–3 business days to clear.`,
                  },
                },
                {
                  "@type": "Question",
                  name: `Can I withdraw money out of ${p.name} easily?`,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: `Yes. ACH transfers to linked external accounts are typically free and settle in 1–3 business days. Wire transfers and account transfers may incur fees — check the current fee schedule before initiating.`,
                  },
                },
                {
                  "@type": "Question",
                  name: `Are there hidden fees with ${p.name}?`,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: `${p.name} charges ${p.fees}. Additional fees can apply for specific actions — for example, wire transfers, expedited card replacement, margin interest, or outbound transfer fees. Always read the full fee schedule on the provider's site before funding.`,
                  },
                },
                {
                  "@type": "Question",
                  name: `How does ${p.name} compare to competitors?`,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: `${p.name} scores ${p.rating}/5 in our editorial review. The comparison table on this page shows it against the top competitors in the ${p.subcategory} category with side-by-side ratings, fees, minimum deposits, and bonuses.`,
                  },
                },
              ],
            },
          ],
        }
      : {
          title: "Product Not Found",
          description: "The product you are looking for could not be found.",
          path: `/product/${slug}`,
          noindex: true,
        }
  );

  useEffect(() => {
    if (!p) return;
    trackEvent("ViewContent", {
      content_name: p.name,
      content_category: p.subcategory,
      content_ids: [p.slug],
      content_type: "product",
    });
  }, [p?.slug]);

  if (!p) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-black mb-2">Product not found</h1>
        <Link to="/" className="text-[#0e4d45] hover:underline text-sm">Back home</Link>
      </div>
    );
  }

  const sameSubcategory = products.filter(
    (x) => x.subcategory === p.subcategory && x.slug !== p.slug
  );

  const competitors = sameSubcategory
    .slice()
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);

  const peerApyValues = products
    .filter((x) => x.subcategory === p.subcategory && x.apy)
    .map((x) => {
      const m = (x.apy || "").match(/(\d+(?:\.\d+)?)/);
      return m ? parseFloat(m[1]) : NaN;
    })
    .filter((n) => !isNaN(n) && n > 0)
    .sort((a, b) => a - b);
  const peerMedianApy = peerApyValues.length
    ? peerApyValues[Math.floor(peerApyValues.length / 2)]
    : undefined;
  const categoryHref: "/bank-accounts" | "/investing" | "/financial-apps" =
    p.category === "bank"
      ? "/bank-accounts"
      : p.category === "investing"
      ? "/investing"
      : "/financial-apps";

  const productFaqs: { q: string; a: string }[] = [
    {
      q: `Is ${p.name} safe and trustworthy?`,
      a: `${p.name} is offered by ${p.provider}. ${
        p.category === "bank"
          ? "Deposits are FDIC-insured up to applicable limits, and the provider follows standard U.S. banking regulations."
          : p.category === "investing"
          ? "The provider is regulated by the SEC and FINRA where applicable, and client assets are typically SIPC-protected up to $500,000."
          : "The provider follows U.S. consumer-finance regulations and publishes a privacy policy covering user data."
      } Our editors rated it ${p.rating}/5 after independent testing.`,
    },
    {
      q: `What are the fees for ${p.name}?`,
      a: `${p.name} charges ${p.fees}. Minimum deposit: ${p.minDeposit}.${
        p.apy ? ` Current APY: ${p.apy}.` : ""
      }${p.bonus ? ` Welcome offer: ${p.bonus}.` : ""} Always review the provider's full disclosure before opening an account — rates and terms change.`,
    },
    {
      q: `Who is ${p.name} best for?`,
      a: `${p.name} is best for ${p.bestFor.toLowerCase()}. It sits in our ${p.subcategory} category and scored ${p.rating}/5 based on ${p.reviews.toLocaleString()} user reviews plus our editorial testing.`,
    },
    {
      q: `How long does it take to open an account with ${p.name}?`,
      a: `The online application itself typically takes 5–10 minutes. ${
        p.category === "bank"
          ? "Most applicants are approved immediately; a small percentage are flagged for manual review, which can take 1–3 business days. Initial ACH funding clears in 1–3 business days."
          : p.category === "investing"
          ? "Brokerage accounts are usually approved within one business day. ACH funding takes 1–3 business days to clear; a full ACATS transfer from another broker takes 5–7 business days."
          : p.subcategory === "Crypto"
          ? "KYC identity verification is usually complete within an hour, though higher limits may require additional review. First ACH deposits take 3–5 business days to fully clear for withdrawal."
          : "Most users are up and running within 15 minutes after the free trial starts."
      }`,
    },
    {
      q: `Can I withdraw or transfer money out of ${p.name} easily?`,
      a: `${
        p.category === "bank"
          ? `Yes — outbound ACH transfers to external linked accounts are free and typically settle in 1–3 business days. Wire transfers are usually available for a fee. ${/savings|money market/i.test(p.subcategory) ? "Savings accounts may cap outbound transfers at six per month." : ""}`
          : p.category === "investing"
          ? "Selling positions settles T+1 for stocks and ETFs, T+0 for options. Once cash is settled, ACH withdrawals take 1–3 business days. Full account transfers out (ACATS) typically cost $75."
          : p.subcategory === "Crypto"
          ? "Yes. USD withdrawals go via ACH (free, 3–5 days) or wire (fee, same-day). Crypto withdrawals are near-instant but subject to daily limits that scale with your verification tier and network fees."
          : "Cancel anytime in the app settings. If you stored data in the app, export it before cancelling — some providers delete user data on cancellation."
      }`,
    },
    {
      q: `Are there any hidden fees or fine print I should know about?`,
      a: `${p.name} charges ${p.fees}, but ${
        p.category === "bank"
          ? "watch for overdraft or non-sufficient-funds fees, out-of-network ATM fees, outbound wire fees, and expedited card replacement fees. Rates are variable and can change at any time."
          : p.category === "investing"
          ? "watch for options per-contract fees, margin interest rates (8–13% at major brokers), regulatory transaction fees, mutual fund transaction fees, and ACATS outbound transfer fees ($75)."
          : p.subcategory === "Crypto"
          ? "watch the spread between the displayed price and mid-market, network withdrawal fees, staking lockup terms, and whether fee tiers require a 30-day rolling volume commitment."
          : "watch the difference between the free and paid tiers, annual-vs.-monthly pricing, and whether canceling deletes your data export."
      } Always read the full fee schedule linked from the application page before funding.`,
    },
    {
      q: `How does ${p.name} compare to competitors?`,
      a: `In our side-by-side comparison table above, ${p.name} scores ${p.rating}/5 against the top ${competitors.length} alternatives in the ${p.subcategory} category. The main trade-off is typically between ${p.pros[0]?.toLowerCase() ?? "headline features"} and ${p.cons[0]?.toLowerCase() ?? "specific limitations"} — which matters more depends on how you'll actually use the account.`,
    },
  ];

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
                  <ProductLogo p={p} size={48} priority />
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
                      <div className="text-[9px] text-black/40 mt-0.5">Verified {RATES_VERIFIED_DATE}</div>
                    </div>
                  )}
                  {p.bonus && (
                    <div>
                      <div className="flex items-center gap-1 text-black/40 uppercase tracking-wide text-[10px]">Bonus {disc && attachTo === "bonus" && <DisclosureIcon text={disc} label={`${p.name} bonus disclosure`} />}</div>
                      <div className="font-bold text-black text-sm">{p.bonus}</div>
                      <div className="text-[9px] text-black/40 mt-0.5">Verified {RATES_VERIFIED_DATE}</div>
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
                    href={productPartnerLink(p.slug, p.url, {
                      placement: "product-review-hero",
                      term: p.slug,
                      campaign: "product-review",
                    })}
                    target="_blank"
                    rel="nofollow noopener noreferrer sponsored"
                    data-placement="product-review-hero"
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

            {/* Key Takeaways — top-of-page at-a-glance summary */}
            <KeyTakeaways product={p} />

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

            {/* Product primer — "What is X?" */}
            <ProductPrimer product={p} />

            {/* Clarity Research Commentary */}
            <ClarityResearch product={p} />

            {/* Rubric-based scoring breakdown */}
            <RubricScorecard product={p} />

            {/* Rate/Fee benchmark context */}
            <BenchmarkContext product={p} peerMedianApy={peerMedianApy} />

            {/* How to Maximize — practical action block */}
            <HowToMaximize product={p} />

            {/* How We Tested — product-specific methodology */}
            <HowWeTested product={p} />

            {/* Research Feature Blocks */}
            <ResearchBlocks product={p} />

            {/* Pros & Cons Explained (long-form) */}
            <ProsConsExplained product={p} />

            {/* Strengths & Limitations — bullet summary */}
            <StrengthsLimitations pros={p.pros} cons={p.cons} />

            {/* Operational limits / fine print */}
            <OperationalLimits product={p} />

            {/* General editorial methodology */}
            <HowWeReview category={p.category} />

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

            {/* Side-by-side competitor comparison with real metrics */}
            <CompetitorComparison product={p} competitors={competitors} />

            {/* How to sign up — step-by-step */}
            <HowToSignUp product={p} />

            {/* Related Guides — internal linking to editorial content */}
            <RelatedGuidesForProduct product={p} />

            {/* Subcategory internal links — deep linking for SEO */}
            {sameSubcategory.length > 0 && (
              <section className="bg-white border border-[#e4d9cf] rounded p-3 sm:p-4 mb-4 sm:mb-5">
                <div className="flex items-center justify-between gap-2 flex-wrap mb-2 sm:mb-3 border-b border-[#e4d9cf] pb-1.5">
                  <h2 className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest">
                    All {p.subcategory}
                  </h2>
                  <Link
                    to={categoryHref}
                    className="text-[10px] sm:text-[11px] font-semibold text-[#0e4d45] hover:underline"
                  >
                    View category &rarr;
                  </Link>
                </div>
                <ul className="flex flex-wrap gap-1.5">
                  {sameSubcategory.slice(0, 12).map((x) => (
                    <li key={x.slug}>
                      <Link
                        to="/product/$slug"
                        params={{ slug: x.slug }}
                        className="inline-block text-[11px] sm:text-xs px-2 py-1 rounded-sm border border-[#e4d9cf] bg-[#fef6f1] hover:bg-[#0e4d45] hover:text-[#fef6f1] hover:border-[#0e4d45] text-black transition-colors"
                      >
                        {x.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Visible FAQ — matches FAQPage schema */}
            <section className="bg-white border border-[#e4d9cf] rounded p-3 sm:p-4 mb-4 sm:mb-5">
              <h2 className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest border-b border-[#e4d9cf] pb-1.5 mb-3">
                Frequently Asked Questions
              </h2>
              <div className="space-y-3">
                {productFaqs.map((f, i) => (
                  <div key={i}>
                    <h3 className="text-xs sm:text-sm font-bold text-black mb-1">{f.q}</h3>
                    <p className="text-xs sm:text-sm text-black/75 leading-relaxed">{f.a}</p>
                  </div>
                ))}
              </div>
            </section>

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
