import { createFileRoute, Link, Outlet, useMatches } from "@tanstack/react-router";

import { calculators } from "@/lib/calculators-data";
import { useSeo, SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/calculators")({
  component: CalculatorsLayout,
});

function CalculatorsLayout() {
  const matches = useMatches();
  const isChildRoute = matches.some((m) => m.routeId === "/calculators/$calcId");
  if (isChildRoute) return <Outlet />;
  return <CalculatorsIndex />;
}

function CalculatorsIndex() {
  useSeo({
    title: "Financial Calculators | Compound Interest, Retirement, Mortgage",
    description:
      "Free financial calculators to help you plan savings, investments, retirement, mortgages, and debt payoff. Run the numbers before you make a decision.",
    path: "/calculators",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Financial Calculators",
      url: `${SITE_URL}/calculators`,
    },
  });

  return (
    <div className="bg-[#fef6f1]">
      <section className="border-b border-[#e4d9cf]">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0e4d45] mb-2">
            Interactive Tools
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold leading-[1.05] text-black mb-3">
            Financial Calculators
          </h1>
          <p className="text-sm text-[#1a1a1a] leading-relaxed max-w-2xl">
            Free, no-signup calculators to run the numbers on your biggest financial decisions. From compound interest to retirement planning.
          </p>
          <div className="mt-5 max-w-3xl space-y-3 text-sm text-[#1a1a1a] leading-relaxed">
            <p>
              Every calculator on this page works in your browser — nothing you type is saved, transmitted, or shared. We built each tool to answer one specific question clearly, show the formulas and assumptions driving the result, and let you adjust the inputs in real time so you can see how small changes ripple across decades.
            </p>
            <p>
              Use the <strong>compound interest calculator</strong> to see how a lump sum plus monthly contributions grows at a given rate. Use the <strong>retirement calculator</strong> to check whether your current savings rate is on track. The <strong>mortgage calculator</strong> shows the true monthly cost of a home loan across principal, interest, taxes, and insurance. A <strong>debt payoff calculator</strong> compares the avalanche and snowball methods side-by-side. Our <strong>emergency-fund calculator</strong> recommends a target based on your monthly expenses and job stability.
            </p>
            <p className="text-xs text-[#5a5a5a] italic">
              These tools are for planning and education only. They are not personalized advice. Actual returns, rates, and outcomes will vary based on markets, fees, taxes, and your individual situation.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid sm:grid-cols-2 gap-4">
          {calculators.map((c) => (
            <div
              key={c.slug}
              className="bg-white border border-[#e4d9cf] rounded p-5 hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0e4d45]">
                  {c.category}
                </span>
                <span className="text-[10px] text-gray-500 flex-shrink-0">
                  {c.available ? "Available" : "Coming Soon"}
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold text-black mb-2">{c.title}</h3>
              <p className="text-xs text-gray-700 leading-relaxed mb-4 flex-1">
                {c.description}
              </p>
              {c.available ? (
                <a
                  href={`/calculators/${c.slug}`}
                  className="px-3 py-1.5 rounded bg-[#0e4d45] text-white text-[11px] font-semibold hover:bg-[#0a3832] transition-colors uppercase tracking-wider text-center"
                >
                  Open Calculator
                </a>
              ) : (
                <button
                  disabled
                  className="px-3 py-1.5 rounded border border-[#e4d9cf] text-gray-400 text-[11px] font-semibold uppercase tracking-wider cursor-not-allowed"
                >
                  Coming Soon
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
