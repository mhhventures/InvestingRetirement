import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { type GuideProductRow, type GuideSection } from "@/lib/guides-data";
import { guidesIndex } from "@/lib/guides-index.generated";
import { Sidebar } from "@/components/sidebar-offers";
import { useSeo, SITE_URL } from "@/lib/seo";
import { FtcDisclosure, EditorialStandardsBadge, AuthorByline } from "@/components/eeat";
import { getAuthorForCategory, authors } from "@/lib/authors";
import { productPartnerLink } from "@/lib/affiliate";
import { useState } from "react";
import { getProductLogoUrl } from "@/lib/product-icons";
import {
  ReadingProgressBar,
  TableOfContents,
  BackToTop,
  GuideFeedback,
} from "@/components/guide-reading";
import { linkifyProductNames, useLinkContext } from "@/components/inline-product-links";

function slugifyHeading(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const Route = createFileRoute("/guides/$articleId")({
  loader: async ({ params }) => {
    const { getGuideBySlug, guideHowTos } = await import("@/lib/guides-data");
    const article = getGuideBySlug(params.articleId);
    if (!article) throw notFound();
    return { article, howTo: guideHowTos[article.slug] ?? null };
  },
  component: GuideArticlePage,
});

function GuideArticlePage() {
  const linkContext = useLinkContext();
  const { article, howTo } = Route.useLoaderData();
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
      ...(howTo
        ? [
            {
              "@context": "https://schema.org",
              "@type": "HowTo",
              name: howTo.name,
              description: article.description,
              ...(howTo.totalTime ? { totalTime: howTo.totalTime } : {}),
              step: howTo.steps.map((s, i) => ({
                "@type": "HowToStep",
                position: i + 1,
                name: s.name,
                text: s.text,
                url: `${SITE_URL}/guides/${article.slug}#step-${i + 1}`,
              })),
            },
          ]
        : []),
    ],
  });

  const author = articleAuthor;
  const reviewer = authors["editorial-team"];
  const related = guidesIndex.filter((g) => g.slug !== article.slug && g.category === article.category).slice(0, 4);

  const tocHeadings = [
    ...(howTo ? [{ id: "how-to", label: howTo.name }] : []),
    ...article.sections.map((s) => ({
      id: slugifyHeading(s.heading),
      label: s.heading,
    })),
    ...(article.faqs.length > 0 ? [{ id: "faqs", label: "Frequently Asked Questions" }] : []),
  ];

  return (
    <div>
      <ReadingProgressBar guideSlug={article.slug} />
      <BackToTop />
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
            <header className="bg-white border border-[#e4d9cf] rounded p-5 sm:p-6 mb-3">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0e4d45] mb-3">
                {article.category}
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.08] text-black mb-3 tracking-tight">
                {article.title}
              </h1>
              <p className="text-base sm:text-lg text-black/70 leading-[1.6] mb-4 font-serif">
                {article.description}
              </p>
              <div className="text-[10px] text-black/50 mb-3 uppercase tracking-wider">
                {article.readTime} read
              </div>
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

            <TableOfContents headings={tocHeadings} />

            <section className="bg-white border border-[#e4d9cf] rounded p-4 sm:p-6 mb-3">
              <p className="text-base sm:text-lg text-black leading-[1.75] font-serif first-letter:font-serif first-letter:font-bold first-letter:text-5xl sm:first-letter:text-6xl first-letter:leading-none first-letter:float-left first-letter:mr-2 first-letter:mt-1 first-letter:text-[#0e4d45]">
                {linkifyProductNames(article.intro, linkContext, { currentGuideSlug: article.slug })}
              </p>
            </section>

            <section className="bg-[#0e4d45]/5 border border-[#0e4d45]/20 rounded p-4 sm:p-5 mb-3">
              <h2 className="text-[10px] sm:text-[11px] font-bold text-[#0e4d45] uppercase tracking-widest mb-3">
                Key Takeaways
              </h2>
              <ul className="space-y-2.5">
                {article.keyTakeaways.map((k) => (
                  <li key={k} className="flex items-start gap-3 text-sm sm:text-base leading-[1.6]">
                    <span className="text-[#0e4d45] font-bold mt-0.5 shrink-0">&#10003;</span>
                    <span className="text-black">{k}</span>
                  </li>
                ))}
              </ul>
            </section>

            {howTo && (
              <section
                id="how-to"
                className="bg-white border border-[#e4d9cf] rounded p-4 sm:p-6 mb-3 scroll-mt-20"
              >
                <h2 className="font-serif font-bold text-xl sm:text-2xl text-black border-b border-[#e4d9cf] pb-2 mb-4 tracking-tight">
                  {howTo.name}
                </h2>
                <ol className="space-y-4">
                  {howTo.steps.map((s, i) => (
                    <li key={i} id={`step-${i + 1}`} className="flex items-start gap-3 sm:gap-4 scroll-mt-20">
                      <span className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#0e4d45] text-[#fef6f1] font-serif font-bold text-sm sm:text-base flex items-center justify-center">
                        {i + 1}
                      </span>
                      <div className="min-w-0 pt-0.5">
                        <h3 className="text-sm sm:text-base font-bold text-black mb-1">{s.name}</h3>
                        <p className="text-sm sm:text-base text-black/80 leading-[1.7]">{s.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {article.sections.map((s, i) => (
              <SectionBlock key={i} section={s} currentGuideSlug={article.slug} />
            ))}

            {article.faqs.length > 0 && (
              <section
                id="faqs"
                className="bg-white border border-[#e4d9cf] rounded p-4 sm:p-6 mb-3 scroll-mt-20"
              >
                <h2 className="font-serif font-bold text-xl sm:text-2xl text-black border-b border-[#e4d9cf] pb-2 mb-4 tracking-tight">
                  Frequently Asked Questions
                </h2>
                <div className="divide-y divide-[#e4d9cf]">
                  {article.faqs.map((f, i) => (
                    <div key={i} className="py-3 first:pt-0 last:pb-0">
                      <h3 className="text-base sm:text-lg font-bold text-black mb-1.5 font-serif tracking-tight">
                        {f.q}
                      </h3>
                      <p className="text-sm sm:text-base text-black/80 leading-[1.7]">{f.a}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <GuideFeedback guideSlug={article.slug} />

            <section className="bg-[#0e4d45] border border-[#0a3832] rounded p-4 sm:p-5 mb-3 flex items-center justify-between gap-3 flex-wrap shadow-md">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#f5c99b] mb-1">
                  Next Step
                </div>
                <div className="text-sm sm:text-base font-semibold text-[#fef6f1]">
                  Compare {article.relatedLabel}
                </div>
              </div>
              <Link
                to={article.relatedCategory as string}
                className="inline-block text-[11px] sm:text-xs font-bold px-4 py-2 rounded-sm bg-[#fef6f1] hover:bg-white text-[#0e4d45] uppercase tracking-wide transition-colors"
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

function SectionBlock({
  section,
  currentGuideSlug,
}: {
  section: GuideSection;
  currentGuideSlug?: string;
}) {
  // Each section gets its own link dedupe scope so every major section can
  // surface its own inline links rather than having them all consumed by the
  // first mention at the top of the article.
  const linkContext = useLinkContext();
  const opts = { currentGuideSlug };
  const id = section.heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return (
    <section
      id={id}
      className="bg-white border border-[#e4d9cf] rounded p-4 sm:p-6 mb-3 scroll-mt-20"
    >
      <h2 className="font-serif font-bold text-xl sm:text-2xl text-black mb-3 tracking-tight leading-snug">
        {section.heading}
      </h2>

      {section.paragraphs?.map((p, i) => (
        <p
          key={i}
          className="text-base sm:text-lg text-black leading-[1.75] mb-4 last:mb-0"
        >
          {linkifyProductNames(p, linkContext, opts)}
        </p>
      ))}

      {section.bullets && section.bullets.length > 0 && (
        <ul className="mt-3 space-y-2.5">
          {section.bullets.map((b, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-base sm:text-lg leading-[1.7]"
            >
              <span className="text-[#0e4d45] font-bold mt-1 shrink-0">&bull;</span>
              <span className="text-black">{linkifyProductNames(b, linkContext, opts)}</span>
            </li>
          ))}
        </ul>
      )}

      {section.callout && (
        <aside className="mt-5 border-l-4 border-[#0e4d45] bg-[#0e4d45]/5 pl-4 sm:pl-5 pr-3 py-3 sm:py-4 rounded-r">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#0e4d45] mb-1">
            {section.callout.title}
          </div>
          <div className="text-base sm:text-lg text-black leading-[1.7] font-serif italic">
            {linkifyProductNames(section.callout.body, linkContext, opts)}
          </div>
        </aside>
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

function RowLogo({ row }: { row: GuideProductRow }) {
  const logoUrl = row.slug ? getProductLogoUrl(row.slug, 96) : undefined;
  const logoUrl2x = row.slug ? getProductLogoUrl(row.slug, 192) : undefined;
  const [failed, setFailed] = useState(false);

  if (logoUrl && !failed) {
    const srcSet =
      logoUrl2x && logoUrl2x !== logoUrl ? `${logoUrl} 1x, ${logoUrl2x} 2x` : undefined;
    return (
      <div
        className="flex items-center justify-center rounded-sm bg-white border border-[#e4d9cf] overflow-hidden shrink-0"
        style={{ width: 48, height: 48 }}
      >
        <img
          src={logoUrl}
          srcSet={srcSet}
          sizes="48px"
          alt={`${row.name} logo`}
          width={48}
          height={48}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="w-full h-full object-contain p-1"
        />
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center rounded-sm text-[#fef6f1] font-bold text-[11px] shrink-0"
      style={{ background: row.color, width: 48, height: 48 }}
      aria-hidden="true"
    >
      {row.logoText}
    </div>
  );
}

function ProductRow({ row }: { row: GuideProductRow }) {
  const href = productPartnerLink(row.slug || "", row.ctaUrl, {
    placement: "guide-product-table",
    term: row.slug || row.name,
    campaign: "guide-product-table",
  });
  return (
    <li className="border-b border-[#e4d9cf] last:border-b-0">
      <a
        href={href}
        target="_blank"
        rel="nofollow noopener noreferrer sponsored"
        className="group block px-3 py-3 sm:flex sm:items-start sm:gap-3 hover:bg-[#fef6f1] focus-visible:bg-[#fef6f1] focus-visible:outline-2 focus-visible:outline-[#0e4d45] transition-colors cursor-pointer"
        aria-label={`${row.ctaLabel} - ${row.name}`}
      >
      <div className="flex items-start gap-3 mb-3 sm:mb-0 sm:flex-1 sm:min-w-0">
        <RowLogo row={row} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="text-[10px] font-bold text-black/40 uppercase tracking-widest">
              #{row.rank}
            </div>
            <div className="text-sm font-bold text-black">{row.name}</div>
            {row.editorsPick && (
              <span className="text-[8px] font-bold uppercase tracking-wide border border-[#0e4d45] text-[#0e4d45] px-1 py-0.5 rounded-sm">
                Editor
              </span>
            )}
          </div>
          <div className="text-[10px] text-black/50 mb-1">by {row.provider}</div>
          <div className="text-[11px] sm:text-xs text-black mb-2 sm:mb-1">{row.bestFor}</div>

          {/* Mobile: stat grid w/ labels above values. Desktop: inline row. */}
          <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 sm:flex sm:items-center sm:gap-3 sm:flex-wrap text-[11px] text-black/80">
            {row.apy && (
              <div className="sm:contents">
                <dt className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-[#0e4d45] sm:text-[#0e4d45] sm:normal-case sm:tracking-normal sm:font-bold">
                  <span className="sm:hidden">APY</span>
                  <span className="hidden sm:inline">APY:</span>
                </dt>
                <dd className="font-semibold text-black sm:font-normal sm:text-black/80">
                  {row.apy}
                  {row.apyNote ? (
                    <span className="block sm:inline text-[10px] text-black/50 sm:text-black/70">
                      <span className="sm:hidden">{row.apyNote}</span>
                      <span className="hidden sm:inline"> ({row.apyNote})</span>
                    </span>
                  ) : null}
                </dd>
              </div>
            )}
            <div className="sm:contents">
              <dt className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-black/50 sm:text-black sm:normal-case sm:tracking-normal">
                <span className="sm:hidden">Min deposit</span>
                <span className="hidden sm:inline">Min:</span>
              </dt>
              <dd className="font-semibold text-black sm:font-normal sm:text-black/80">
                {row.minDeposit}
              </dd>
            </div>
            <div className="sm:contents">
              <dt className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-black/50 sm:text-black sm:normal-case sm:tracking-normal">
                <span className="sm:hidden">Monthly fee</span>
                <span className="hidden sm:inline">Fee:</span>
              </dt>
              <dd className="font-semibold text-black sm:font-normal sm:text-black/80">
                {row.monthlyFee}
              </dd>
            </div>
            {row.bonus && (
              <div className="sm:contents">
                <dt className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-black/50 sm:text-black sm:normal-case sm:tracking-normal">
                  <span className="sm:hidden">Bonus</span>
                  <span className="hidden sm:inline">Bonus:</span>
                </dt>
                <dd className="font-semibold text-black sm:font-normal sm:text-black/80">
                  {row.bonus}
                </dd>
              </div>
            )}
            <div className="sm:contents">
              <dt className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-black/50 sm:text-black sm:normal-case sm:tracking-normal">
                <span className="sm:hidden">Rating</span>
                <span className="hidden sm:inline">Rating:</span>
              </dt>
              <dd className="font-semibold text-black sm:font-normal sm:text-black/80">
                {row.rating}/5
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <span
        className="block text-center w-full sm:w-auto px-3 py-2 sm:py-1.5 rounded-sm bg-[#0e4d45] group-hover:bg-[#0a3832] text-[#fef6f1] text-[12px] sm:text-[11px] font-semibold uppercase tracking-wide transition-colors shrink-0"
      >
        {row.ctaLabel}
      </span>
      </a>
    </li>
  );
}
