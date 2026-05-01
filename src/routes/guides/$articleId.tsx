import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getGuideBySlug, guides, type GuideProductRow, type GuideSection } from "@/lib/guides-data";
import { Sidebar } from "@/components/sidebar-offers";
import { useSeo, SITE_URL } from "@/lib/seo";
import { FtcDisclosure, EditorialStandardsBadge, AuthorByline } from "@/components/eeat";
import { getAuthorForCategory, authors } from "@/lib/authors";
import { withUtm } from "@/lib/affiliate";

export const Route = createFileRoute("/guides/$articleId")({
  loader: async ({ params }) => {
    const article = getGuideBySlug(params.articleId);
    if (!article) throw notFound();
    return { article };
  },
  component: GuideArticlePage,
});

function GuideArticlePage() {
  const { article } = Route.useLoaderData();
  const articleAuthor = getAuthorForCategory(article.category);
  const GUIDE_PUBLISHED_ISO = "2026-01-15T00:00:00Z";
  const GUIDE_MODIFIED_ISO = "2026-04-15T00:00:00Z";

  useSeo({
    title: article.title,
    description: article.description,
    path: `/guides/${article.slug}`,
    type: "article",
    article: {
      publishedTime: GUIDE_PUBLISHED_ISO,
      modifiedTime: GUIDE_MODIFIED_ISO,
      author: articleAuthor.name,
      section: article.category,
    },
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: article.title,
        description: article.description,
        mainEntityOfPage: `${SITE_URL}/guides/${article.slug}`,
        articleSection: article.category,
        datePublished: GUIDE_PUBLISHED_ISO,
        dateModified: GUIDE_MODIFIED_ISO,
        image: `${SITE_URL}/images/share-image.png`,
        author: {
          "@type": "Person",
          name: articleAuthor.name,
          jobTitle: articleAuthor.title,
          url: `${SITE_URL}/about`,
          ...(articleAuthor.linkedin ? { sameAs: [articleAuthor.linkedin] } : {}),
        },
        publisher: {
          "@type": "Organization",
          name: "Investing and Retirement",
          url: SITE_URL,
          logo: {
            "@type": "ImageObject",
            url: `${SITE_URL}/favicon.png`,
          },
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides` },
          { "@type": "ListItem", position: 3, name: article.title, item: `${SITE_URL}/guides/${article.slug}` },
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: article.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  });

  const author = articleAuthor;
  const reviewer = authors["editorial-team"];
  const related = guides.filter((g) => g.slug !== article.slug && g.category === article.category).slice(0, 4);

  return (
    <div>
      <FtcDisclosure variant="compact" />

      <div className="border-b border-[#e4d9cf] bg-[#fef6f1]">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 text-[10px] sm:text-[11px] text-black/50 overflow-x-auto">
          <Link to="/" className="hover:text-[#0e4d45]">Home</Link>
          <span className="mx-1 sm:mx-1.5 text-black/30">/</span>
          <Link to="/guides" className="hover:text-[#0e4d45]">Guides</Link>
          <span className="mx-1 sm:mx-1.5 text-black/30">/</span>
          <span className="whitespace-nowrap">{article.category}</span>
          <span className="mx-1 sm:mx-1.5 text-black/30">/</span>
          <span className="text-black font-semibold truncate">{article.title}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 sm:gap-6">
          <article className="min-w-0">
            <header className="bg-white border border-[#e4d9cf] rounded p-4 sm:p-5 mb-3">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0e4d45] mb-2">
                {article.category}
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold leading-[1.1] text-black mb-2">
                {article.title}
              </h1>
              <p className="text-sm text-black/70 leading-relaxed mb-3">{article.description}</p>
              <div className="text-[10px] text-black/50 mb-3">{article.readTime} read</div>
              <AuthorByline
                author={author}
                reviewedBy={reviewer}
                publishedDate="January 2026"
                updatedDate="April 2026"
              />
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <EditorialStandardsBadge />
              </div>
            </header>

            <section className="bg-white border border-[#e4d9cf] rounded p-3 sm:p-4 mb-3">
              <p className="text-xs sm:text-sm text-black leading-relaxed">{article.intro}</p>
            </section>

            <section className="bg-[#0e4d45]/5 border border-[#0e4d45]/20 rounded p-3 sm:p-4 mb-3">
              <h2 className="text-[10px] sm:text-[11px] font-bold text-[#0e4d45] uppercase tracking-widest mb-2">
                Key Takeaways
              </h2>
              <ul className="space-y-1.5">
                {article.keyTakeaways.map((k) => (
                  <li key={k} className="flex items-start gap-2 text-xs sm:text-sm">
                    <span className="text-[#0e4d45] font-bold mt-0.5">&#10003;</span>
                    <span className="text-black">{k}</span>
                  </li>
                ))}
              </ul>
            </section>

            {article.sections.map((s, i) => (
              <SectionBlock key={i} section={s} />
            ))}

            {article.faqs.length > 0 && (
              <section className="bg-white border border-[#e4d9cf] rounded p-3 sm:p-4 mb-3">
                <h2 className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest border-b border-[#e4d9cf] pb-1.5 mb-3">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-3">
                  {article.faqs.map((f, i) => (
                    <div key={i}>
                      <h3 className="text-xs sm:text-sm font-bold text-black mb-1">{f.q}</h3>
                      <p className="text-xs sm:text-sm text-black/75 leading-relaxed">{f.a}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="bg-[#fef6f1] border border-[#e4d9cf] rounded p-3 sm:p-4 mb-3 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#0e4d45] mb-0.5">
                  Next Step
                </div>
                <div className="text-xs sm:text-sm font-semibold text-black">
                  Compare {article.relatedLabel}
                </div>
              </div>
              <Link
                to={article.relatedCategory as string}
                className="inline-block text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded-sm bg-[#0e4d45] hover:bg-[#0a3832] text-[#fef6f1] uppercase tracking-wide transition-colors"
              >
                See Top Picks
              </Link>
            </section>

            {related.length > 0 && (
              <section className="bg-white border border-[#e4d9cf] rounded overflow-hidden mb-3">
                <div className="px-3 sm:px-4 py-2.5 border-b border-[#e4d9cf]">
                  <h2 className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest">
                    More in {article.category}
                  </h2>
                </div>
                <ul>
                  {related.map((g) => (
                    <li key={g.slug} className="border-b border-[#e4d9cf] last:border-b-0">
                      <Link
                        to="/guides/$articleId"
                        params={{ articleId: g.slug }}
                        className="block px-3 sm:px-4 py-2.5 hover:bg-[#fef6f1] transition-colors"
                      >
                        <div className="text-[11px] sm:text-xs font-semibold text-black">
                          {g.title}
                        </div>
                        <div className="text-[10px] text-black/50 mt-0.5 line-clamp-1">
                          {g.description}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="mt-4 sm:mt-6 text-[9px] sm:text-[10px] text-black/40 leading-snug border-t border-[#e4d9cf] pt-2 sm:pt-3">
              <strong>Advertiser Disclosure:</strong> We may be compensated when you click on links to partner products. This does not influence our editorial ratings or rankings. See our full disclosure policy for details.
            </section>
          </article>

          <Sidebar />
        </div>
      </div>
    </div>
  );
}

function SectionBlock({ section }: { section: GuideSection }) {
  return (
    <section className="bg-white border border-[#e4d9cf] rounded p-3 sm:p-4 mb-3">
      <h2 className="text-sm sm:text-base font-bold text-black mb-2">{section.heading}</h2>

      {section.paragraphs?.map((p, i) => (
        <p key={i} className="text-xs sm:text-sm text-black leading-relaxed mb-2 last:mb-0">
          {p}
        </p>
      ))}

      {section.bullets && section.bullets.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {section.bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-xs sm:text-sm">
              <span className="text-[#0e4d45] font-bold mt-0.5">&bull;</span>
              <span className="text-black">{b}</span>
            </li>
          ))}
        </ul>
      )}

      {section.callout && (
        <div className="mt-3 border-l-2 border-[#0e4d45] bg-[#0e4d45]/5 px-3 py-2">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#0e4d45] mb-0.5">
            {section.callout.title}
          </div>
          <div className="text-xs sm:text-sm text-black leading-relaxed">
            {section.callout.body}
          </div>
        </div>
      )}

      {section.productTable && (
        <div className="mt-3 border border-[#e4d9cf] rounded overflow-hidden">
          <div className="px-3 py-2 bg-[#f5ede2] border-b border-[#e4d9cf]">
            <div className="text-xs sm:text-sm font-bold text-black">{section.productTable.title}</div>
            {section.productTable.subtitle && (
              <div className="text-[10px] sm:text-[11px] text-black/60 mt-0.5">
                {section.productTable.subtitle}
              </div>
            )}
          </div>
          <ul>
            {section.productTable.rows.map((row) => (
              <ProductRow key={row.rank} row={row} />
            ))}
          </ul>
        </div>
      )}

      {section.productSpotlight && (
        <div className="mt-3 border border-[#0e4d45]/30 rounded overflow-hidden">
          <div className="px-3 py-1.5 bg-[#0e4d45] text-[#fef6f1] text-[10px] font-bold uppercase tracking-widest">
            Editor's Spotlight
          </div>
          <ul>
            <ProductRow row={section.productSpotlight} />
          </ul>
        </div>
      )}
    </section>
  );
}

function ProductRow({ row }: { row: GuideProductRow }) {
  return (
    <li className="border-b border-[#e4d9cf] last:border-b-0 px-3 py-3 flex items-start gap-3 flex-wrap sm:flex-nowrap">
      <div
        className="flex items-center justify-center rounded-sm text-[#fef6f1] font-bold text-[11px] shrink-0"
        style={{ background: row.color, width: 48, height: 48 }}
        aria-hidden="true"
      >
        {row.logoText}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="text-[10px] font-bold text-black/40 uppercase tracking-widest">
            #{row.rank}
          </div>
          <div className="text-xs sm:text-sm font-bold text-black">{row.name}</div>
          {row.editorsPick && (
            <span className="text-[8px] font-bold uppercase tracking-wide border border-[#0e4d45] text-[#0e4d45] px-1 py-0.5 rounded-sm">
              Editor
            </span>
          )}
        </div>
        <div className="text-[10px] text-black/50 mb-1">by {row.provider}</div>
        <div className="text-[11px] sm:text-xs text-black mb-1">{row.bestFor}</div>
        <div className="flex items-center gap-3 text-[10px] sm:text-[11px] text-black/70 flex-wrap">
          {row.apy && (
            <span>
              <strong className="text-[#0e4d45]">APY:</strong> {row.apy}
              {row.apyNote ? ` (${row.apyNote})` : ""}
            </span>
          )}
          <span>
            <strong className="text-black">Min:</strong> {row.minDeposit}
          </span>
          <span>
            <strong className="text-black">Fee:</strong> {row.monthlyFee}
          </span>
          {row.bonus && (
            <span>
              <strong className="text-black">Bonus:</strong> {row.bonus}
            </span>
          )}
          <span>
            <strong className="text-black">Rating:</strong> {row.rating}/5
          </span>
        </div>
      </div>
      <a
        href={withUtm(row.ctaUrl, {
          campaign: "guide-product-table",
          content: "cta",
          term: row.slug || row.name,
        })}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="block text-center px-3 py-1.5 rounded-sm bg-[#0e4d45] hover:bg-[#0a3832] text-[#fef6f1] text-[11px] font-semibold uppercase tracking-wide transition-colors shrink-0"
      >
        {row.ctaLabel}
      </a>
    </li>
  );
}
