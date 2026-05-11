import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { authors } from "@/lib/authors";
import { guidesIndex as guides } from "@/lib/guides-index.generated";
import { useSeo, SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/authors/$authorSlug")({
  loader: ({ params }) => {
    const author = authors[params.authorSlug];
    if (!author || author.slug !== params.authorSlug) throw notFound();
    return { author };
  },
  component: AuthorPage,
});

function AuthorPage() {
  const { author } = Route.useLoaderData();

  useSeo({
    title: `${author.name}, ${author.title} | Investing and Retirement`,
    description: `${author.name} is ${author.title} at Investing and Retirement, personally researching and writing every review and guide on the site.`,
    path: `/authors/${author.slug}`,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        mainEntity: {
          "@type": "Person",
          name: author.name,
          jobTitle: author.title,
          description: author.bio,
          url: `${SITE_URL}/authors/${author.slug}`,
          knowsAbout: author.expertise,
          worksFor: {
            "@type": "Organization",
            name: "Investing and Retirement",
            url: SITE_URL,
          },
          ...(author.linkedin ? { sameAs: [author.linkedin] } : {}),
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "About", item: `${SITE_URL}/about` },
          { "@type": "ListItem", position: 3, name: author.name, item: `${SITE_URL}/authors/${author.slug}` },
        ],
      },
    ],
  });

  const recentGuides = guides.slice(0, 8);

  return (
    <div>
      <div className="border-b border-[#e4d9cf] bg-[#fef6f1]">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 text-[10px] sm:text-[11px] text-black/50">
          <Link to="/" className="hover:text-[#0e4d45]">Home</Link>
          <span className="mx-1 sm:mx-1.5 text-black/30">/</span>
          <Link to="/about" className="hover:text-[#0e4d45]">About</Link>
          <span className="mx-1 sm:mx-1.5 text-black/30">/</span>
          <span className="text-black font-semibold">{author.name}</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
        <header className="bg-white border border-[#e4d9cf] rounded p-5 sm:p-7 mb-4">
          <div className="flex items-start gap-4">
            <div
              className="flex items-center justify-center rounded-full text-[#fef6f1] font-bold text-lg shrink-0"
              style={{ background: author.avatarColor, width: 72, height: 72 }}
              aria-hidden="true"
            >
              {author.avatarInitials}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0e4d45] mb-1">
                {author.credentials}
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-black leading-tight mb-1">
                {author.name}
              </h1>
              <div className="text-sm text-black/60">{author.title}</div>
              <div className="text-xs text-black/50 mt-1">
                {author.yearsExperience}+ years in personal finance
              </div>
              {author.linkedin && (
                <a
                  href={author.linkedin}
                  target="_blank"
                  rel="noopener noreferrer me"
                  className="inline-flex items-center gap-1.5 mt-3 text-[11px] font-semibold text-[#0e4d45] hover:text-[#0a3832] border border-[#0e4d45]/30 hover:border-[#0e4d45] rounded-sm px-2 py-1 uppercase tracking-wide transition-colors"
                  aria-label={`${author.name} on LinkedIn`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-3.5 h-3.5"
                    aria-hidden="true"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                </a>
              )}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#e4d9cf]">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-black/60 mb-2">
              About
            </h2>
            <p className="text-sm text-black leading-relaxed">{author.bio}</p>
          </div>

          <div className="mt-4 pt-4 border-t border-[#e4d9cf]">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-black/60 mb-2">
              Areas of Expertise
            </h2>
            <ul className="flex flex-wrap gap-1.5">
              {author.expertise.map((e) => (
                <li
                  key={e}
                  className="text-[11px] font-semibold px-2 py-1 rounded-sm border border-[#e4d9cf] bg-[#fef6f1] text-black"
                >
                  {e}
                </li>
              ))}
            </ul>
          </div>
        </header>

        <section className="bg-white border border-[#e4d9cf] rounded p-4 sm:p-5 mb-4">
          <h2 className="text-[11px] font-bold text-black uppercase tracking-widest border-b border-[#e4d9cf] pb-1.5 mb-3">
            Recent Writing
          </h2>
          <ul className="space-y-2">
            {recentGuides.map((g) => (
              <li key={g.slug}>
                <Link
                  to="/guides/$articleId"
                  params={{ articleId: g.slug }}
                  className="block p-2 -mx-2 rounded hover:bg-[#fef6f1] transition-colors"
                >
                  <div className="text-sm font-semibold text-black">{g.title}</div>
                  <div className="text-xs text-black/60 line-clamp-1 mt-0.5">{g.description}</div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="text-center">
          <Link
            to="/about"
            className="inline-block text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded-sm bg-[#0e4d45] hover:bg-[#0a3832] text-[#fef6f1] uppercase tracking-wide transition-colors"
          >
            Read Our Editorial Standards
          </Link>
        </section>
      </div>
    </div>
  );
}
