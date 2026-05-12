import { createFileRoute, Link, Outlet, useMatches, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { guidesIndex as guides } from "@/lib/guides-index.generated";
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
    title: "Financial Guides & Articles: Saving, Investing, Credit",
    description: "Expert-written guides on saving, budgeting, investing, retirement, and credit. Clear, actionable advice to help you make smarter financial decisions.",
    path: "/guides",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Financial Guides & Articles",
      url: `${SITE_URL}/guides`,
    },
  });

  const categories = useMemo(() => {
    const set = new Set<string>();
    guides.forEach((g) => set.add(g.category));
    return ["All", ...Array.from(set).sort()];
  }, []);

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const navigate = useNavigate();

  const filteredGuides = useMemo(() => {
    if (activeCategory === "All") return guides;
    return guides.filter((g) => g.category === activeCategory);
  }, [activeCategory]);

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
        <div className="mb-6">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0e4d45] mb-3">
            Filter by type
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isActive = cat === activeCategory;
              const count = cat === "All" ? guides.length : guides.filter((g) => g.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  aria-pressed={isActive}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-colors border ${
                    isActive
                      ? "bg-[#0e4d45] text-white border-[#0e4d45]"
                      : "bg-white text-black border-[#e4d9cf] hover:border-[#0e4d45] hover:text-[#0e4d45]"
                  }`}
                >
                  {cat}
                  <span className={`ml-1.5 text-[10px] ${isActive ? "text-white/80" : "text-gray-500"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {filteredGuides.length === 0 ? (
          <div className="bg-white border border-[#e4d9cf] rounded p-8 text-center">
            <p className="text-sm text-gray-700">No guides found in this category.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {filteredGuides.map((g) => {
              const goToGuide = () =>
                navigate({ to: "/guides/$articleId", params: { articleId: g.slug } });
              return (
                <div
                  key={g.slug}
                  role="link"
                  tabIndex={0}
                  onClick={goToGuide}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      goToGuide();
                    }
                  }}
                  className="group bg-white border border-[#e4d9cf] rounded p-5 hover:shadow-md hover:border-[#0e4d45] focus:outline-none focus:ring-2 focus:ring-[#0e4d45]/40 transition-all flex flex-col cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0e4d45]">
                      {g.category}
                    </span>
                    <span className="text-[10px] text-gray-500 flex-shrink-0">{g.readTime}</span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-black mb-2 group-hover:text-[#0e4d45] transition-colors">
                    {g.title}
                  </h3>
                  <p className="text-xs text-gray-700 leading-relaxed mb-4 flex-1">{g.description}</p>
                  <div className="flex gap-2">
                    <Link
                      to="/guides/$articleId"
                      params={{ articleId: g.slug }}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 px-3 py-1.5 rounded bg-[#0e4d45] text-white text-[11px] font-semibold hover:bg-[#0a3832] transition-colors uppercase tracking-wider text-center"
                    >
                      Read Guide
                    </Link>
                    <Link
                      to={g.relatedCategory as any}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 px-3 py-1.5 rounded border border-[#e4d9cf] bg-white text-black text-[11px] font-semibold hover:border-[#0e4d45] hover:text-[#0e4d45] transition-colors uppercase tracking-wider text-center"
                    >
                      See Products
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
