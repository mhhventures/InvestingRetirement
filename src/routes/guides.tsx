import { createFileRoute, Link, Outlet, useMatches } from "@tanstack/react-router";
import { guides } from "@/lib/guides-data";
import { useSeo, SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/guides")({
  component: GuidesLayout,
});

function GuidesLayout() {
  const matches = useMatches();
  const isChildRoute = matches.some((m) => m.routeId === "/guides/$articleId");

  if (isChildRoute) {
    return <Outlet />;
  }

  return <GuidesIndex />;
}

function GuidesIndex() {
  useSeo({
    title: "Financial Guides & Articles | Investing and Retirement",
    description: "Expert-written guides on saving, budgeting, investing, retirement, and credit. Clear, actionable advice to help you make smarter financial decisions.",
    path: "/guides",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Financial Guides & Articles",
      url: `${SITE_URL}/guides`,
    },
  });
  return (
    <div className="bg-[#fef6f1]">
      <section className="border-b border-[#e4d9cf]">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0e4d45] mb-2">
            Educational Content
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold leading-[1.05] text-black mb-3">
            Financial Guides & Articles
          </h1>
          <p className="text-sm text-[#1a1a1a] leading-relaxed max-w-2xl">
            Expert-written guides to help you make smarter financial decisions. From saving and budgeting basics to investing and trading strategies, we cover it all.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid sm:grid-cols-2 gap-4">
          {guides.map((g) => (
            <div
              key={g.slug}
              className="bg-white border border-[#e4d9cf] rounded p-5 hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0e4d45]">
                  {g.category}
                </span>
                <span className="text-[10px] text-gray-500 flex-shrink-0">{g.readTime}</span>
              </div>
              <h3 className="font-serif text-lg font-bold text-black mb-2">{g.title}</h3>
              <p className="text-xs text-gray-700 leading-relaxed mb-4 flex-1">{g.description}</p>
              <div className="flex gap-2">
                <Link
                  to="/guides/$articleId"
                  params={{ articleId: g.slug }}
                  className="flex-1 px-3 py-1.5 rounded bg-[#0e4d45] text-white text-[11px] font-semibold hover:bg-[#0a3832] transition-colors uppercase tracking-wider text-center"
                >
                  Read Guide
                </Link>
                <Link
                  to={g.relatedCategory as any}
                  className="flex-1 px-3 py-1.5 rounded border border-[#e4d9cf] text-black text-[11px] font-semibold hover:border-[#0e4d45] hover:text-[#0e4d45] transition-colors uppercase tracking-wider text-center"
                >
                  See Products
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
