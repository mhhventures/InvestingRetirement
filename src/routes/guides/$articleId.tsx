import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getGuideBySlug, guides } from "@/lib/guides-data";
import { getProductLogoUrl } from "@/lib/product-icons";
import { useSeo, SITE_URL, SITE_NAME } from "@/lib/seo";
import { AuthorByline, FtcDisclosure } from "@/components/eeat";
import { getAuthorForCategory, authors } from "@/lib/authors";

export const Route = createFileRoute("/guides/$articleId")({
  component: ArticlePage,
  loader: ({ params }) => {
    const article = getGuideBySlug(params.articleId);
    if (!article) throw notFound();
    return { article };
  },
  notFoundComponent: NotFound,
});

function NotFound() {
  return (
    <div className="bg-[#fef6f1] min-h-[60vh]">
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-black mb-3">Article Not Found</h1>
        <p className="text-sm text-gray-700 mb-6">
          We could not find the guide you were looking for.
        </p>
        <Link
          to="/guides"
          className="inline-block px-5 py-2.5 rounded bg-[#0e4d45] text-white text-[11px] font-semibold uppercase tracking-wider hover:bg-[#0a3832] transition-colors"
        >
          Back to Guides
        </Link>
      </div>
    </div>
  );
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function useReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const total = h.scrollHeight - h.clientHeight;
      setProgress(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  return progress;
}

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(ids[0] ?? null);
  useEffect(() => {
    if (ids.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids.join("|")]);
  return active;
}

function ArticlePage() {
  const { article } = Route.useLoaderData();
  const progress = useReadingProgress();

  // SEO: Article + BreadcrumbList + FAQPage JSON-LD
  const author = getAuthorForCategory(article.category);
  const reviewer = authors["editorial-team"];
  const articleUrl = `${SITE_URL}/guides/${article.slug}`;
  const publishedISO = "2026-01-15T09:00:00-05:00";
  const modifiedISO = "2026-04-15T09:00:00-04:00";
  const articleJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
    url: articleUrl,
    datePublished: publishedISO,
    dateModified: modifiedISO,
    inLanguage: "en-US",
    articleSection: article.category,
    wordCount: article.sections.reduce(
      (n, s) =>
        n +
        (s.paragraphs?.join(" ").split(/\s+/).length || 0) +
        (s.bullets?.join(" ").split(/\s+/).length || 0),
      0
    ),
    keywords: [article.category, ...article.keyTakeaways.slice(0, 3)].join(", "),
    author: {
      "@type": "Person",
      name: author.name,
      jobTitle: author.title,
      url: `${SITE_URL}/about`,
    },
    reviewedBy: {
      "@type": "Organization",
      name: reviewer.name,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/share-image.png`,
      },
    },
    image: {
      "@type": "ImageObject",
      url: `${SITE_URL}/images/share-image.png`,
      width: 1200,
      height: 630,
    },
  };
  const breadcrumbJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides` },
      { "@type": "ListItem", position: 3, name: article.category, item: `${SITE_URL}/guides?category=${encodeURIComponent(article.category)}` },
      { "@type": "ListItem", position: 4, name: article.title, item: articleUrl },
    ],
  };
  const faqJsonLd: Record<string, unknown> | null =
    article.faqs && article.faqs.length
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: article.faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }
      : null;
  const seoTitle = `${article.title} | ${SITE_NAME}`;
  const seoDescription =
    article.description.length > 160
      ? article.description.slice(0, 157).replace(/[\s,;:.]+$/, "") + "..."
      : article.description;
  useSeo({
    title: seoTitle,
    description: seoDescription,
    path: `/guides/${article.slug}`,
    type: "article",
    jsonLd: faqJsonLd ? [articleJsonLd, breadcrumbJsonLd, faqJsonLd] : [articleJsonLd, breadcrumbJsonLd],
    article: {
      publishedTime: publishedISO,
      modifiedTime: modifiedISO,
      author: author.name,
      section: article.category,
      tags: article.keyTakeaways.slice(0, 5),
    },
  });

  // Build section IDs for TOC
  const sectionIds = article.sections.map((s, i) => `${slugify(s.heading)}-${i}`);
  const tocIds = [...sectionIds, "key-takeaways", "faqs"];
  const activeId = useActiveSection(tocIds);

  // Related articles: same category, excluding current
  const related = guides
    .filter((g) => g.category === article.category && g.slug !== article.slug)
    .slice(0, 3);

  // Prev / Next article (flat order across guides list)
  const currentIdx = guides.findIndex((g) => g.slug === article.slug);
  const prev = currentIdx > 0 ? guides[currentIdx - 1] : null;
  const next = currentIdx < guides.length - 1 ? guides[currentIdx + 1] : null;

  return (
    <div className="bg-[#fef6f1]">
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 h-[3px] z-50 bg-[#e4d9cf]/60">
        <div
          className="h-full bg-[#0e4d45] transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Breadcrumb */}
      <div className="border-b border-[#e4d9cf]">
        <div className="max-w-6xl mx-auto px-4 py-2.5 sm:py-3 text-[10px] sm:text-[11px] text-gray-600 flex items-center gap-1.5 sm:gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <Link to="/guides" className="hover:text-[#0e4d45] transition-colors flex-shrink-0">
            Guides
          </Link>
          <span className="text-gray-400 flex-shrink-0">/</span>
          <span className="text-gray-500 flex-shrink-0">{article.category}</span>
          <span className="text-gray-400 flex-shrink-0 hidden sm:inline">/</span>
          <span className="text-black font-medium truncate hidden sm:inline">{article.title}</span>
        </div>
      </div>

      {/* Hero */}
      <section className="border-b border-[#e4d9cf] bg-gradient-to-b from-[#fef6f1] to-[#f9eadf]">
        <div className="max-w-4xl mx-auto px-4 pt-8 pb-8 sm:pt-12 sm:pb-10">
          <Link
            to="/guides"
            className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#0e4d45] uppercase tracking-[0.2em] hover:underline mb-4 sm:mb-5"
          >
            <span>←</span> All Guides
          </Link>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <span className="inline-block px-2.5 py-1 rounded-full bg-[#0e4d45] text-white text-[10px] font-bold uppercase tracking-[0.15em]">
              {article.category}
            </span>
            <span className="text-[11px] text-gray-600 flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {article.readTime} read
            </span>
          </div>
          <h1 className="font-serif text-[28px] sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] sm:leading-[1.05] text-black mb-4 sm:mb-5 tracking-tight">
            {article.title}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-[#3a3a3a] leading-relaxed font-light max-w-3xl mb-5">
            {article.intro}
          </p>
          <div className="max-w-3xl">
            <AuthorByline
              author={getAuthorForCategory(article.category)}
              reviewedBy={authors["editorial-team"]}
              publishedDate="January 2026"
              updatedDate="April 2026"
              readTime={article.readTime}
            />
          </div>
        </div>
      </section>

      {/* FTC Disclosure — guides mention products, so disclose */}
      <div className="max-w-6xl mx-auto px-4 pt-4">
        <FtcDisclosure variant="compact" />
      </div>

      {/* Content + Sidebar */}
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 grid lg:grid-cols-[1fr_260px] gap-8 lg:gap-12">
        {/* Article body */}
        <article className="max-w-2xl min-w-0">
          {/* In-article TOC (mobile/tablet) - collapsible */}
          <details className="lg:hidden mb-6 bg-white border border-[#e4d9cf] rounded-lg overflow-hidden group">
            <summary className="flex items-center justify-between cursor-pointer list-none p-4 active:bg-[#f9eadf]/50">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0e4d45]">
                In This Guide · {article.sections.length} sections
              </span>
              <span className="flex-shrink-0 w-6 h-6 rounded-full border border-[#e4d9cf] flex items-center justify-center text-[#0e4d45] text-sm font-bold group-open:rotate-45 transition-transform">
                +
              </span>
            </summary>
            <ol className="px-4 pb-4 space-y-2 list-decimal list-inside border-t border-[#e4d9cf] pt-3">
              {article.sections.map((s, i) => (
                <li key={i} className="text-sm text-[#1a1a1a] leading-snug">
                  <a
                    href={`#${sectionIds[i]}`}
                    className="hover:text-[#0e4d45] transition-colors inline-block py-0.5"
                  >
                    {s.heading}
                  </a>
                </li>
              ))}
            </ol>
          </details>

          {article.sections.map((section, idx) => {
            const id = sectionIds[idx];
            const isFirst = idx === 0;
            return (
              <section
                key={idx}
                id={id}
                className="mb-10 sm:mb-12 scroll-mt-20 sm:scroll-mt-24"
              >
                <div className="flex items-baseline gap-3 mb-3 sm:mb-4">
                  <span className="font-serif text-sm font-bold text-[#0e4d45]">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1 h-px bg-[#e4d9cf]" />
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-black mb-4 sm:mb-5 leading-tight tracking-tight">
                  {section.heading}
                </h2>
                {section.paragraphs?.map((p, i) => (
                  <p
                    key={i}
                    className={`text-[15px] sm:text-[15px] text-[#1a1a1a] leading-[1.7] sm:leading-[1.75] mb-4 ${
                      isFirst && i === 0
                        ? "first-letter:font-serif first-letter:text-[44px] sm:first-letter:text-5xl first-letter:font-bold first-letter:text-[#0e4d45] first-letter:mr-2 first-letter:float-left first-letter:leading-[0.9] first-letter:mt-1"
                        : ""
                    }`}
                  >
                    {p}
                  </p>
                ))}
                {section.bullets && (
                  <ul className="space-y-2.5 mb-4 bg-white/60 border-l-2 border-[#0e4d45] pl-4 sm:pl-5 py-4 pr-4 rounded-r">
                    {section.bullets.map((b, i) => (
                      <li key={i} className="text-[15px] text-[#1a1a1a] leading-relaxed flex gap-2.5 sm:gap-3">
                        <span className="text-[#0e4d45] font-bold flex-shrink-0 mt-0.5">→</span>
                        <span className="min-w-0 break-words">{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {section.productSpotlight && (
                  <div className="mt-6 bg-white border-2 border-[#0e4d45] rounded-lg p-5 shadow-sm">
                    <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
                      {(() => {
                        const spot = section.productSpotlight!;
                        const logoUrl = spot.slug ? getProductLogoUrl(spot.slug) : null;
                        return logoUrl ? (
                          <div className="w-14 h-14 rounded overflow-hidden flex-shrink-0 bg-white border border-[#e4d9cf]">
                            <img
                              src={logoUrl}
                              alt={`${spot.name} logo — ${spot.provider || spot.name} brand mark`}
                              width={56}
                              height={56}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                const target = e.currentTarget;
                                target.style.display = 'none';
                                const fallback = target.nextElementSibling as HTMLElement | null;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                            <div
                              className="w-full h-full hidden items-center justify-center text-white font-bold text-sm"
                              style={{ backgroundColor: spot.color }}
                            >
                              {spot.logoText}
                            </div>
                          </div>
                        ) : (
                          <div
                            className="w-14 h-14 rounded flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
                            style={{ backgroundColor: spot.color }}
                          >
                            {spot.logoText}
                          </div>
                        );
                      })()}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {section.productSpotlight.editorsPick && (
                            <span className="inline-block px-2 py-0.5 rounded bg-[#d4b896] text-[#0e4d45] text-[9px] font-bold uppercase tracking-wider">
                              Editor's Pick
                            </span>
                          )}
                          <span className="text-[11px] text-gray-600">★ {section.productSpotlight.rating}</span>
                        </div>
                        <div className="font-serif text-base font-bold text-black leading-tight">{section.productSpotlight.name}</div>
                        <div className="text-xs text-gray-600 mt-0.5">{section.productSpotlight.provider}</div>
                        <div className="flex gap-4 mt-2 text-xs flex-wrap">
                          <div><span className="font-bold text-[#0e4d45]">{section.productSpotlight.apy}</span> <span className="text-gray-600">APY</span></div>
                          <div><span className="font-bold text-black">{section.productSpotlight.monthlyFee}</span> <span className="text-gray-600">fee</span></div>
                          {section.productSpotlight.bonus && <div><span className="font-bold text-black">{section.productSpotlight.bonus}</span></div>}
                        </div>
                      </div>
                      <a
                        href={section.productSpotlight.ctaUrl}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="w-full sm:w-auto mt-2 sm:mt-0 px-4 py-2.5 rounded bg-[#0e4d45] text-white text-[11px] font-bold uppercase tracking-wider text-center hover:bg-[#0a3832] transition-colors flex-shrink-0"
                      >
                        {section.productSpotlight.ctaLabel}
                      </a>
                    </div>
                  </div>
                )}
                {section.productTable && (
                  <div className="mt-4 mb-4">
                    <div className="bg-white border border-[#e4d9cf] rounded-lg overflow-hidden shadow-sm">
                      <div className="bg-[#0e4d45] text-white px-4 py-3">
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4b896] mb-0.5">Comparison Table</div>
                        <div className="font-serif text-base font-bold leading-tight">{section.productTable.title}</div>
                        {section.productTable.subtitle && <div className="text-[11px] text-white/70 mt-0.5">{section.productTable.subtitle}</div>}
                      </div>
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-[13px]">
                          <thead className="bg-[#f9eadf] border-b border-[#e4d9cf]">
                            <tr className="text-left">
                              <th className="px-3 py-2.5 font-bold text-[10px] uppercase tracking-wider text-black">#</th>
                              <th className="px-3 py-2.5 font-bold text-[10px] uppercase tracking-wider text-black">Account</th>
                              <th className="px-3 py-2.5 font-bold text-[10px] uppercase tracking-wider text-black">APY</th>
                              <th className="px-3 py-2.5 font-bold text-[10px] uppercase tracking-wider text-black">Min / Fee</th>
                              <th className="px-3 py-2.5 font-bold text-[10px] uppercase tracking-wider text-black">Bonus / Offer</th>
                              <th className="px-3 py-2.5 font-bold text-[10px] uppercase tracking-wider text-black">Best For</th>
                              <th className="px-3 py-2.5 font-bold text-[10px] uppercase tracking-wider text-black text-right">Apply</th>
                            </tr>
                          </thead>
                          <tbody>
                            {section.productTable.rows.map((row) => (
                              <tr key={row.rank} className="border-b border-[#e4d9cf] last:border-0 hover:bg-[#fef6f1]/50 transition-colors">
                                <td className="px-3 py-3 font-serif font-bold text-[#0e4d45]">{row.rank}</td>
                                <td className="px-3 py-3">
                                  <div className="flex items-center gap-2.5">
                                    {row.slug && getProductLogoUrl(row.slug) ? (
                                      <div className="w-9 h-9 rounded overflow-hidden flex-shrink-0 bg-white border border-[#e4d9cf] flex items-center justify-center">
                                        <img src={getProductLogoUrl(row.slug)} alt={`${row.name} logo`} width={36} height={36} loading="lazy" decoding="async" className="w-full h-full object-contain" onError={(e) => { (e.currentTarget.style as any).display = 'none'; const fallback = e.currentTarget.nextElementSibling as HTMLElement | null; if (fallback) fallback.style.display = 'flex'; }} />
                                        <div className="w-full h-full hidden items-center justify-center text-white font-bold text-[10px]" style={{ backgroundColor: row.color }}>{row.logoText}</div>
                                      </div>
                                    ) : (
                                      <div className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0 text-white font-bold text-[10px]" style={{ backgroundColor: row.color }}>{row.logoText}</div>
                                    )}
                                    <div className="min-w-0">
                                      <div className="font-bold text-black leading-tight flex items-center gap-1.5">
                                        {row.name}
                                        {row.editorsPick && <span className="inline-block px-1.5 py-0.5 rounded bg-[#d4b896] text-[#0e4d45] text-[8px] font-bold uppercase tracking-wider">Pick</span>}
                                      </div>
                                      <div className="text-[10px] text-gray-600">★ {row.rating}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-3 py-3">
                                  <div className="font-bold text-[#0e4d45]">{row.apy}</div>
                                  {row.apyNote && <div className="text-[10px] text-gray-600">{row.apyNote}</div>}
                                </td>
                                <td className="px-3 py-3 text-[12px]">
                                  <div>{row.minDeposit} min</div>
                                  <div className="text-gray-600">{row.monthlyFee} fee</div>
                                </td>
                                <td className="px-3 py-3 text-[12px] max-w-[200px]">{row.bonus ? <div className="font-bold text-[#0e4d45] leading-snug">{row.bonus}</div> : <div className="text-gray-500">—</div>}</td>
                                <td className="px-3 py-3 text-[12px] text-gray-800 max-w-[200px]">{row.bestFor}</td>
                                <td className="px-3 py-3 text-right">
                                  <a href={row.ctaUrl} target="_blank" rel="noopener noreferrer sponsored" className="inline-block px-3 py-2 rounded bg-[#0e4d45] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#0a3832] transition-colors whitespace-nowrap">Open →</a>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="md:hidden divide-y divide-[#e4d9cf]">
                        {section.productTable.rows.map((row) => (
                          <div key={row.rank} className="p-4">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="font-serif font-bold text-[#0e4d45] text-sm pt-0.5">#{row.rank}</div>
                              {row.slug && getProductLogoUrl(row.slug) ? (
                                <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-white border border-[#e4d9cf] flex items-center justify-center">
                                  <img src={getProductLogoUrl(row.slug)} alt={`${row.name} logo`} width={40} height={40} loading="lazy" decoding="async" className="w-full h-full object-contain" onError={(e) => { (e.currentTarget.style as any).display = 'none'; const fallback = e.currentTarget.nextElementSibling as HTMLElement | null; if (fallback) fallback.style.display = 'flex'; }} />
                                  <div className="w-full h-full hidden items-center justify-center text-white font-bold text-[10px]" style={{ backgroundColor: row.color }}>{row.logoText}</div>
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0 text-white font-bold text-[10px]" style={{ backgroundColor: row.color }}>{row.logoText}</div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {row.editorsPick && <span className="inline-block px-1.5 py-0.5 rounded bg-[#d4b896] text-[#0e4d45] text-[8px] font-bold uppercase tracking-wider">Pick</span>}
                                  <span className="text-[10px] text-gray-600">★ {row.rating}</span>
                                </div>
                                <div className="font-bold text-black leading-tight text-sm">{row.name}</div>
                                <div className="text-[11px] text-gray-600">{row.provider}</div>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mb-3 text-[12px]">
                              <div><div className="text-[10px] text-gray-500 uppercase tracking-wider">APY</div><div className="font-bold text-[#0e4d45]">{row.apy}</div>{row.apyNote && <div className="text-[10px] text-gray-600">{row.apyNote}</div>}</div>
                              <div><div className="text-[10px] text-gray-500 uppercase tracking-wider">Min / Fee</div><div>{row.minDeposit} / {row.monthlyFee}</div></div>
                            </div>
                            {row.bonus && (<div className="mb-3 p-2.5 rounded bg-[#f9eadf] border border-[#e4d9cf]"><div className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Bonus / Offer</div><div className="font-bold text-[#0e4d45] text-[12px] leading-snug">{row.bonus}</div></div>)}
                            <div className="text-[12px] text-gray-800 mb-3">{row.bestFor}</div>
                            <a href={row.ctaUrl} target="_blank" rel="noopener noreferrer sponsored" className="block w-full text-center px-3 py-2.5 rounded bg-[#0e4d45] text-white text-[11px] font-bold uppercase tracking-wider hover:bg-[#0a3832] transition-colors">{row.ctaLabel}</a>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {section.callout && (
                  <div className="mt-6 relative overflow-hidden bg-[#0e4d45] text-white rounded-lg p-5 sm:p-6 shadow-sm">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4b896]/10 rounded-full -translate-y-16 translate-x-16" />
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d4b896" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                        </svg>
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4b896]">
                          {section.callout.title}
                        </div>
                      </div>
                      <p className="text-[15px] leading-relaxed">{section.callout.body}</p>
                    </div>
                  </div>
                )}
              </section>
            );
          })}

          {/* Key Takeaways */}
          <section
            id="key-takeaways"
            className="mb-10 sm:mb-12 scroll-mt-20 sm:scroll-mt-24 bg-white border border-[#e4d9cf] rounded-lg p-5 sm:p-7 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#0e4d45] flex items-center justify-center flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-black">Key Takeaways</h2>
            </div>
            <ul className="space-y-3">
              {article.keyTakeaways.map((t, i) => (
                <li key={i} className="text-[15px] text-[#1a1a1a] leading-relaxed flex gap-2.5 sm:gap-3">
                  <span className="font-serif font-bold text-[#0e4d45] flex-shrink-0 w-5">{i + 1}.</span>
                  <span className="min-w-0 break-words">{t}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* FAQs */}
          <section id="faqs" className="mb-10 sm:mb-12 scroll-mt-20 sm:scroll-mt-24">
            <div className="flex items-center gap-2 mb-5 sm:mb-6">
              <div className="w-8 h-8 rounded-full bg-[#d4b896] flex items-center justify-center flex-shrink-0">
                <span className="font-serif font-bold text-[#0e4d45] text-base">?</span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-black">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="space-y-0 divide-y divide-[#e4d9cf] border-y border-[#e4d9cf]">
              {article.faqs.map((faq, i) => (
                <details key={i} className="group py-4 sm:py-5">
                  <summary className="flex items-start justify-between gap-3 sm:gap-4 cursor-pointer list-none active:opacity-70">
                    <h3 className="font-serif text-[15px] sm:text-base font-bold text-black group-hover:text-[#0e4d45] transition-colors leading-snug">
                      {faq.q}
                    </h3>
                    <span className="flex-shrink-0 w-7 h-7 sm:w-6 sm:h-6 rounded-full border border-[#e4d9cf] flex items-center justify-center text-[#0e4d45] text-base sm:text-sm font-bold group-open:rotate-45 transition-transform mt-0.5">
                      +
                    </span>
                  </summary>
                  <p className="text-[15px] text-[#1a1a1a] leading-relaxed mt-3 pr-2 sm:pr-10">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* Prev / Next navigation */}
          <nav className="grid sm:grid-cols-2 gap-3 pt-6 sm:pt-8 border-t border-[#e4d9cf]">
            {prev ? (
              <Link
                to="/guides/$articleId"
                params={{ articleId: prev.slug }}
                className="group block bg-white border border-[#e4d9cf] rounded-lg p-4 hover:border-[#0e4d45] active:bg-[#f9eadf]/50 transition-colors"
              >
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0e4d45] mb-1">
                  ← Previous
                </div>
                <div className="font-serif text-sm font-bold text-black group-hover:text-[#0e4d45] transition-colors leading-tight">
                  {prev.title}
                </div>
              </Link>
            ) : (
              <div className="hidden sm:block" />
            )}
            {next ? (
              <Link
                to="/guides/$articleId"
                params={{ articleId: next.slug }}
                className="group block bg-white border border-[#e4d9cf] rounded-lg p-4 hover:border-[#0e4d45] active:bg-[#f9eadf]/50 transition-colors sm:text-right"
              >
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0e4d45] mb-1">
                  Next →
                </div>
                <div className="font-serif text-sm font-bold text-black group-hover:text-[#0e4d45] transition-colors leading-tight">
                  {next.title}
                </div>
              </Link>
            ) : (
              <div className="hidden sm:block" />
            )}
          </nav>
        </article>

        {/* Sidebar */}
        <aside className="space-y-5">
          <div className="lg:sticky lg:top-6 space-y-5">
            {/* Table of contents - desktop only */}
            <div className="hidden lg:block bg-white border border-[#e4d9cf] rounded-lg p-5">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0e4d45] mb-3">
                On This Page
              </div>
              <nav>
                <ol className="space-y-1.5">
                  {article.sections.map((s, i) => {
                    const id = sectionIds[i];
                    const isActive = activeId === id;
                    return (
                      <li key={i} className="leading-snug">
                        <a
                          href={`#${id}`}
                          className={`flex gap-2 text-xs transition-colors py-1 border-l-2 pl-2.5 -ml-px ${
                            isActive
                              ? "border-[#0e4d45] text-[#0e4d45] font-semibold"
                              : "border-transparent text-gray-600 hover:text-[#0e4d45]"
                          }`}
                        >
                          <span className="font-mono text-[10px] text-gray-400 pt-0.5">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span>{s.heading}</span>
                        </a>
                      </li>
                    );
                  })}
                  <li className="leading-snug">
                    <a
                      href="#key-takeaways"
                      className={`flex gap-2 text-xs transition-colors py-1 border-l-2 pl-2.5 -ml-px ${
                        activeId === "key-takeaways"
                          ? "border-[#0e4d45] text-[#0e4d45] font-semibold"
                          : "border-transparent text-gray-600 hover:text-[#0e4d45]"
                      }`}
                    >
                      <span className="font-mono text-[10px] text-gray-400 pt-0.5">✓</span>
                      <span>Key Takeaways</span>
                    </a>
                  </li>
                  <li className="leading-snug">
                    <a
                      href="#faqs"
                      className={`flex gap-2 text-xs transition-colors py-1 border-l-2 pl-2.5 -ml-px ${
                        activeId === "faqs"
                          ? "border-[#0e4d45] text-[#0e4d45] font-semibold"
                          : "border-transparent text-gray-600 hover:text-[#0e4d45]"
                      }`}
                    >
                      <span className="font-mono text-[10px] text-gray-400 pt-0.5">?</span>
                      <span>FAQs</span>
                    </a>
                  </li>
                </ol>
              </nav>
            </div>

            {/* Related products CTA */}
            <div className="bg-[#0e4d45] text-white rounded-lg p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#d4b896]/10 rounded-full -translate-y-12 translate-x-12" />
              <div className="relative">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4b896] mb-2">
                  Take Action
                </div>
                <h3 className="font-serif text-lg font-bold mb-2 leading-tight">
                  Explore {article.relatedLabel}
                </h3>
                <p className="text-xs text-white/80 leading-relaxed mb-4">
                  Put this guide into action with our top-rated picks.
                </p>
                <Link
                  to={article.relatedCategory as any}
                  className="block text-center px-3 py-2.5 rounded bg-[#d4b896] text-[#0e4d45] text-[11px] font-bold uppercase tracking-wider hover:bg-white transition-colors"
                >
                  See Products
                </Link>
              </div>
            </div>

            {/* Related articles */}
            {related.length > 0 && (
              <div className="bg-white border border-[#e4d9cf] rounded-lg p-5">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0e4d45] mb-3">
                  More in {article.category}
                </div>
                <div className="space-y-3 divide-y divide-[#e4d9cf]">
                  {related.map((r, i) => (
                    <Link
                      key={r.slug}
                      to="/guides/$articleId"
                      params={{ articleId: r.slug }}
                      className={`block group active:opacity-70 ${i > 0 ? "pt-3" : ""}`}
                    >
                      <h4 className="font-serif text-sm font-bold text-black group-hover:text-[#0e4d45] transition-colors leading-tight mb-1">
                        {r.title}
                      </h4>
                      <span className="text-[10px] text-gray-500">{r.readTime} read</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
