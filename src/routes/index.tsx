import { createFileRoute, Link } from "@tanstack/react-router";
import { products } from "@/data/products";
import { ProductCard, ProductLogo } from "@/components/product-card";
import { Sidebar } from "@/components/sidebar-offers";
import { useSeo, SITE_URL, SITE_NAME } from "@/lib/seo";

export const Route = createFileRoute("/")({
  component: Home,
});

const categoryTiles = [
  {
    title: "Bank Accounts",
    description: "High-yield savings and checking with the best rates.",
    to: "/bank-accounts" as const,
    accent: "#0e4d45",
    topics: ["High-Yield Savings", "Checking", "CDs"],
  },
  {
    title: "Investing Apps",
    description: "Brokerages, robo-advisors, and retirement accounts.",
    to: "/investing" as const,
    accent: "#0e4d45",
    topics: ["Brokerages", "Robo-Advisors", "IRAs"],
  },
  {
    title: "Financial Apps",
    description: "Budgeting, cash advance, and credit score apps.",
    to: "/financial-apps" as const,
    accent: "#0e4d45",
    topics: ["Budgeting", "Cash Advance", "Credit Score"],
  },
];

const latestGuides = [
  { slug: "how-to-pick-high-yield-savings", title: "How to Pick a High-Yield Savings Account", cat: "Banking", read: "6 min" },
  { slug: "roth-vs-traditional-ira", title: "Roth IRA vs. Traditional IRA: Which Is Right for You?", cat: "Investing", read: "8 min" },
  { slug: "budget-basics-50-30-20", title: "Budget Basics: The 50/30/20 Rule Explained", cat: "Budgeting", read: "6 min" },
  { slug: "improve-credit-90-days", title: "Improve Your Credit in 90 Days", cat: "Credit", read: "7 min" },
];

function SectionHeader({ title, href, linkText }: { title: string; href?: string; linkText?: string }) {
  return (
    <div className="flex items-end justify-between mb-3 border-b-2 border-black pb-1.5">
      <h2 className="font-serif text-xl md:text-2xl font-bold text-black leading-none">
        {title}
      </h2>
      {href && linkText && (
        <Link to={href} className="text-[11px] font-semibold text-[#0e4d45] hover:text-[#0a3832] uppercase tracking-wider">
          {linkText} &rarr;
        </Link>
      )}
    </div>
  );
}

function Home() {
  useSeo({
    title: "Compare the Best Financial Products 2026",
    description: "Expert reviews of the best high-yield savings, checking accounts, investing apps, and budgeting tools to match your financial goals.",
    path: "/",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE_NAME,
        url: SITE_URL,
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/reviews?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
        logo: "https://cdn.shipper.now/image/users/cmo93re2q001fjo04arbwa90b/1776908612379-yjlz3q6frc-IandR_Horizontal_RGB_Transparent_Black_PNG.png",
        sameAs: [
          "https://www.instagram.com/investingandretirement/",
          `${SITE_URL}/newsletter`,
        ],
      },
    ],
  });
  const editorPicks = products.filter((p) => p.editorsPick);
  const topSavings = products.filter((p) => p.subcategory === "High-Yield Savings").slice(0, 3);
  const topBrokers = products.filter((p) => p.category === "investing").slice(0, 3);

  return (
    <div className="bg-[#fef6f1]">
      {/* Editorial masthead hero */}
      <section className="border-b border-[#e4d9cf]">
        <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="max-w-3xl">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0e4d45] mb-2">
                Independent Reviews &middot; Updated Daily
              </div>
              <h1 className="font-serif text-3xl md:text-5xl font-bold leading-[1.05] text-black mb-3">
                Compare the best financial products, side by side.
              </h1>
              <p className="text-sm md:text-base text-[#1a1a1a] leading-relaxed max-w-2xl">
                Independent, hands-on reviews of the best high-yield savings accounts, brokerages, and money apps for 2026. Every product personally tested.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 flex-shrink-0">
              <Link to="/bank-accounts" className="px-3.5 py-2 bg-[#0e4d45] hover:bg-[#0a3832] text-[#fef6f1] text-[11px] font-semibold tracking-wider uppercase rounded-sm transition-colors">
                Compare Rates
              </Link>
              <Link to="/investing" className="px-3.5 py-2 bg-white border border-black text-black hover:bg-black hover:text-[#fef6f1] text-[11px] font-semibold tracking-wider uppercase rounded-sm transition-colors">
                Compare Brokers
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <div className="border-b border-[#e4d9cf] bg-[#f7ebe2]">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex flex-wrap justify-center md:justify-between items-center gap-x-4 gap-y-1.5 text-[11px] text-[#1a1a1a]">
          <div className="flex items-baseline gap-1.5"><span className="font-serif font-bold text-[#0e4d45] text-base leading-none">50+</span><span className="uppercase tracking-wider text-[10px] font-semibold">Products Reviewed</span></div>
          <div className="hidden sm:block h-4 w-px bg-[#d4c5b8]" />
          <div className="flex items-baseline gap-1.5"><span className="font-serif font-bold text-[#0e4d45] text-base leading-none">100K+</span><span className="uppercase tracking-wider text-[10px] font-semibold">Global Viewers</span></div>
          <div className="hidden sm:block h-4 w-px bg-[#d4c5b8]" />
          <div className="flex items-baseline gap-1.5"><span className="uppercase tracking-wider font-semibold">Expert Editorial Team</span></div>
        </div>
      </div>

      {/* Main layout: content + sidebar */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          <div className="min-w-0 space-y-10">
            {/* Category tiles */}
            <section>
              <SectionHeader title="Start Comparing" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                {categoryTiles.map((t) => (
                  <Link
                    key={t.title}
                    to={t.to}
                    className="group bg-white border border-[#d4c5b8] rounded-sm p-3 sm:p-4 shadow-sm hover:shadow-md hover:border-black transition-all relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-[#0e4d45]" />
                    <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-[#0e4d45] mb-2">
                      {t.title}
                    </div>
                    <h3 className="font-serif text-sm sm:text-base font-bold text-black leading-snug mb-2">
                      {t.description}
                    </h3>
                    <div className="flex flex-wrap gap-1 mb-2 sm:mb-3">
                      {t.topics.map((topic) => (
                        <span key={topic} className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 bg-[#f7ebe2] text-[#1a1a1a] rounded-sm">
                          {topic}
                        </span>
                      ))}
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-semibold text-[#0e4d45] group-hover:underline uppercase tracking-wider">
                      Browse all &rarr;
                    </span>
                  </Link>
                ))}
              </div>
            </section>

            {/* Editor's picks */}
            <section>
              <SectionHeader title="Editor Picks" href="/reviews" linkText="See all reviews" />
              <div className="grid sm:grid-cols-2 gap-3">
                {editorPicks.map((p) => (
                  <ProductCard key={p.slug} p={p} />
                ))}
              </div>
            </section>

            {/* Best savings table */}
            <section>
              <SectionHeader title="Best High-Yield Savings" href="/bank-accounts" linkText="Compare all" />
              <div className="bg-white border border-[#d4c5b8] rounded-sm overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-[#f7ebe2] border-b-2 border-[#0e4d45]">
                      <tr>
                        <th className="text-left px-3 py-2.5 font-bold uppercase tracking-wider text-[10px] text-[#0e4d45]">#</th>
                        <th className="text-left px-3 py-2.5 font-bold uppercase tracking-wider text-[10px] text-[#0e4d45]">Bank</th>
                        <th className="text-left px-3 py-2.5 font-bold uppercase tracking-wider text-[10px] text-[#0e4d45]">APY</th>
                        <th className="text-left px-3 py-2.5 font-bold uppercase tracking-wider text-[10px] text-[#0e4d45]">Min Deposit</th>
                        <th className="text-left px-3 py-2.5 font-bold uppercase tracking-wider text-[10px] text-[#0e4d45]">Bonus</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e4d9cf]">
                      {topSavings.map((p, i) => (
                        <tr key={p.slug} className="hover:bg-[#fef6f1] transition-colors">
                          <td className="px-3 py-2.5 font-serif font-bold text-[#0e4d45]">{String(i + 1).padStart(2, '0')}</td>
                          <td className="px-3 py-2.5 font-semibold text-black">{p.name}</td>
                          <td className="px-3 py-2.5 font-serif font-bold text-[#0e4d45]">{p.apy}</td>
                          <td className="px-3 py-2.5 text-[#5a5a5a]">{p.minDeposit}</td>
                          <td className="px-3 py-2.5 font-semibold text-black">{p.bonus || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Top brokers */}
            <section>
              <SectionHeader title="Top Brokers" href="/investing" linkText="Compare all" />
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {topBrokers.map((p) => (
                  <ProductCard key={p.slug} p={p} />
                ))}
              </div>
            </section>

            {/* Latest guides */}
            <section>
              <SectionHeader title="Latest Guides" href="/guides" linkText="Read all" />
              <div className="space-y-2">
                {latestGuides.map((g) => (
                  <Link
                    key={g.slug}
                    to="/guides/$articleId"
                    params={{ articleId: g.slug }}
                    className="block p-3 sm:p-4 bg-white border border-[#d4c5b8] rounded-sm hover:border-[#0e4d45] hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-serif font-bold text-sm sm:text-base text-black group-hover:text-[#0e4d45] transition-colors leading-snug">
                          {g.title}
                        </h3>
                        <div className="text-[9px] sm:text-[10px] text-[#5a5a5a] mt-1.5">
                          <span className="font-semibold">{g.cat}</span> • <span>{g.read} read</span>
                        </div>
                      </div>
                      <span className="text-[#0e4d45] flex-shrink-0 mt-1">→</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
