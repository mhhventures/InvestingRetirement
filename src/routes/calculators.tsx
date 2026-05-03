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
            Free, no-signup calculators to run the numbers on your biggest financial decisions — compound interest, retirement, mortgages, debt payoff, and emergency-fund targets. Everything runs in your browser; nothing you type is saved or transmitted.
          </p>
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

        <section className="mt-12 max-w-3xl space-y-4 text-sm text-[#1a1a1a] leading-relaxed">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0e4d45] mb-1">About these tools</div>
            <h2 className="font-serif text-2xl font-bold text-black mb-2">What you can figure out here</h2>
            <p>
              Each calculator answers one specific question clearly, shows the formulas and assumptions driving the result, and lets you adjust the inputs in real time so you can see how small changes ripple across decades.
            </p>
          </div>
          <ul className="space-y-2 border border-[#e4d9cf] bg-white rounded-sm p-4 divide-y divide-[#e4d9cf]">
            <li className="pt-0 first:pt-0 pb-2">
              <strong>Compound interest calculator</strong> — how a lump sum plus monthly contributions grows over 10, 20, or 30 years at a given return.
            </li>
            <li className="pt-2 pb-2">
              <strong>Retirement calculator</strong> — whether your current savings rate is on track to replace the income you want after you stop working.
            </li>
            <li className="pt-2 pb-2">
              <strong>Mortgage calculator</strong> — the true monthly cost of a home loan across principal, interest, taxes, and insurance.
            </li>
            <li className="pt-2 pb-2">
              <strong>Debt payoff calculator</strong> — avalanche vs. snowball methods compared side-by-side on your actual balances.
            </li>
            <li className="pt-2">
              <strong>Emergency-fund calculator</strong> — a recommended target based on your monthly expenses and job stability.
            </li>
          </ul>
          <p className="text-xs text-[#5a5a5a] italic">
            These tools are for planning and education only. They are not personalized financial advice. Actual returns, rates, and outcomes will vary based on markets, fees, taxes, and your individual situation.
          </p>
        </section>
      </div>
    </div>
  );
}
