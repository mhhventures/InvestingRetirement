import { createFileRoute, Outlet, useMatches } from "@tanstack/react-router";
import { US_STATES } from "@/lib/states-data";
import { useSeo, SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/banks")({
  component: BanksLayout,
});

function BanksLayout() {
  const matches = useMatches();
  const isChildRoute = matches.some((m) => m.routeId === "/banks/$state");
  if (isChildRoute) return <Outlet />;
  return <BanksIndex />;
}

function BanksIndex() {
  useSeo({
    title: "Best Banks & Credit Unions Near You by State | Local Directory",
    description:
      "Find the best local credit unions, community banks, state banks, and regional providers near you. Browse by state for current APYs, fees, and membership details.",
    path: "/banks",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Best Banks by State",
      url: `${SITE_URL}/banks`,
    },
  });

  const available = US_STATES.filter((s) => s.available);
  const coming = US_STATES.filter((s) => !s.available);

  return (
    <div className="bg-[#fef6f1]">
      <section className="border-b border-[#e4d9cf]">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0e4d45] mb-2">
            Local Banking Directory
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold leading-[1.05] text-black mb-3">
            Best Banks & Credit Unions by State
          </h1>
          <p className="text-sm text-[#1a1a1a] leading-relaxed max-w-2xl">
            A state-by-state directory of the strongest local credit unions,
            community banks, and regional providers. Compare advertised APYs,
            minimums, fees, and membership rules before you open an account.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h2 className="font-serif text-xl font-bold text-black mb-3">
            Available states
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {available.map((s) => (
              <a
                key={s.code}
                href={`/banks/${s.slug}`}
                className="bg-white border border-[#e4d9cf] rounded p-4 hover:shadow-md transition-shadow flex items-center justify-between group"
              >
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#0e4d45]">
                    {s.code}
                  </div>
                  <div className="font-serif text-lg font-bold text-black">
                    {s.name}
                  </div>
                </div>
                <span className="text-[#0e4d45] text-lg group-hover:translate-x-0.5 transition-transform">
                  &rarr;
                </span>
              </a>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-serif text-xl font-bold text-black mb-3">
            Coming soon
          </h2>
          <div className="flex flex-wrap gap-2">
            {coming.map((s) => (
              <span
                key={s.code}
                className="inline-flex items-center gap-1.5 bg-white border border-[#e4d9cf] text-[#5a5a5a] text-xs px-2.5 py-1 rounded-sm"
              >
                <span className="font-bold text-[10px] tracking-wider text-[#0e4d45]">
                  {s.code}
                </span>
                {s.name}
              </span>
            ))}
          </div>
        </div>

        <section className="mt-12 max-w-3xl space-y-4 text-sm text-[#1a1a1a] leading-relaxed">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0e4d45] mb-1">
              About this directory
            </div>
            <h2 className="font-serif text-2xl font-bold text-black mb-2">
              Why local matters
            </h2>
            <p>
              National online banks often win on raw APY, but local credit
              unions and community banks frequently beat them on checking
              rewards, CD specials, and branch-based service. This directory
              surfaces the institutions worth considering in each state
              alongside the advertised rates we last verified.
            </p>
          </div>
          <p className="text-xs text-[#5a5a5a] italic">
            Rates and terms are subject to change. Confirm current figures
            directly with each institution before opening an account.
          </p>
        </section>
      </div>
    </div>
  );
}
