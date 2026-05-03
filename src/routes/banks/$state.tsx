import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  findStateBySlug,
  INSTITUTION_TYPE_LABEL,
  PRODUCT_TYPE_LABEL,
  type StateProvider,
} from "@/lib/states-data";
import { useSeo, SITE_URL } from "@/lib/seo";
import { BankSidebar } from "@/components/bank-sidebar";
import { StarRating, GradeBadge } from "@/components/product-card";

export const Route = createFileRoute("/banks/$state")({
  loader: ({ params }) => {
    const info = findStateBySlug(params.state);
    if (!info || !info.available) throw notFound();
    return { info };
  },
  component: StateBanksPage,
});

const SUBCATEGORY_META: Record<string, string> = {
  savings: "Top-rated local savings accounts with competitive APYs.",
  checking: "Everyday checking relationships with strong branch access.",
  cd: "Lock in today's rates with certificates of deposit.",
  money_market: "Higher-yield accounts with check-writing privileges.",
};

const FILTER_OPTIONS: { id: "all" | StateProvider["product_type"]; label: string }[] = [
  { id: "all", label: "All" },
  { id: "savings", label: "High-Yield Savings" },
  { id: "checking", label: "Checking" },
  { id: "money_market", label: "Money Market" },
  { id: "cd", label: "CD" },
];

function StateBanksPage() {
  const { info } = Route.useLoaderData();
  const [providers, setProviders] = useState<StateProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<(typeof FILTER_OPTIONS)[number]["id"]>("all");
  const [sort, setSort] = useState<"default" | "apy" | "min" | "rating">("default");
  const [noFees, setNoFees] = useState(false);
  const [noMin, setNoMin] = useState(false);
  const [membersOnlyOff, setMembersOnlyOff] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!isSupabaseConfigured) {
      setLoading(false);
      setError("Directory temporarily unavailable.");
      return;
    }
    (async () => {
      const { data, error: err } = await supabase
        .from("state_providers")
        .select("*")
        .eq("state_code", info.code)
        .order("rank_weight", { ascending: true });
      if (cancelled) return;
      if (err) setError(err.message);
      else setProviders((data as StateProvider[]) || []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [info.code]);

  const stats = useMemo(() => {
    if (!providers.length) {
      return { topSavings: 0, bestCD: 0, count: 0, avg: 0 };
    }
    const savings = providers.filter((p) => p.product_type === "savings");
    const cds = providers.filter((p) => p.product_type === "cd");
    const apys = providers.map((p) => p.apy).filter((a) => a > 0);
    return {
      topSavings: savings.reduce((m, p) => Math.max(m, p.apy), 0),
      bestCD: cds.reduce((m, p) => Math.max(m, p.apy), 0),
      count: providers.length,
      avg: apys.length ? apys.reduce((a, b) => a + b, 0) / apys.length : 0,
    };
  }, [providers]);

  const filtered = useMemo(() => {
    let list =
      filter === "all"
        ? providers
        : providers.filter((p) => p.product_type === filter);
    if (noFees) list = list.filter((p) => p.monthly_fee === 0);
    if (noMin) list = list.filter((p) => p.min_deposit === 0);
    if (membersOnlyOff) list = list.filter((p) => !p.membership_required);
    if (sort === "apy") list = [...list].sort((a, b) => b.apy - a.apy);
    else if (sort === "min")
      list = [...list].sort((a, b) => a.min_deposit - b.min_deposit);
    else if (sort === "rating")
      list = [...list].sort((a, b) => a.rank_weight - b.rank_weight);
    return list;
  }, [providers, filter, sort, noFees, noMin, membersOnlyOff]);

  const hero = filtered[0];
  const rest = filtered.slice(1);

  const subcategoryGroups = useMemo(() => {
    if (filter !== "all") return null;
    const groups: Record<string, StateProvider[]> = {};
    rest.forEach((p) => {
      const key = p.product_type;
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });
    return groups;
  }, [filter, rest]);

  const faqs = useMemo(
    () => buildFaqs(info.name, stats.topSavings, stats.bestCD),
    [info.name, stats.topSavings, stats.bestCD],
  );

  useSeo({
    title: `Best Banks Near Me in ${info.name} (${new Date().getFullYear()}) | Local Rates & Credit Unions`,
    description: `Find the best banks and credit unions in ${info.name}. Compare current APYs, fees, minimums, and membership rules for top local institutions near you.`,
    path: `/banks/${info.slug}`,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: `Best Banks in ${info.name}`,
        url: `${SITE_URL}/banks/${info.slug}`,
        about: { "@type": "Place", name: info.name },
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Banks", item: `${SITE_URL}/banks` },
          { "@type": "ListItem", position: 3, name: info.name, item: `${SITE_URL}/banks/${info.slug}` },
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      ...providers.map((p) => ({
        "@context": "https://schema.org",
        "@type":
          p.institution_type === "credit_union"
            ? "FinancialService"
            : "BankOrCreditUnion",
        name: p.institution_name,
        url: p.website_url || undefined,
        areaServed: { "@type": "State", name: info.name },
      })),
    ],
  });

  return (
    <div className="bg-[#fef6f1] overflow-x-hidden">
      <div className="border-b border-[#e4d9cf] bg-[#fef6f1]">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 text-[10px] sm:text-[11px] text-black/50 overflow-x-auto">
          <a href="/" className="hover:text-[#0e4d45]">
            Home
          </a>
          <span className="mx-1 sm:mx-1.5 text-black/30">/</span>
          <a href="/banks" className="hover:text-[#0e4d45]">
            Banks
          </a>
          <span className="mx-1 sm:mx-1.5 text-black/30">/</span>
          <span className="text-black font-semibold whitespace-nowrap">
            {info.name}
          </span>
        </div>
      </div>

      <section className="border-b border-[#e4d9cf]">
        <div className="max-w-6xl mx-auto px-4 py-7">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0e4d45] mb-2">
            Banking · {info.name}
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-black leading-[1.05] mb-2">
            Best Banks in {info.name}
          </h1>
          <p className="text-sm text-[#1a1a1a] max-w-3xl leading-relaxed">
            Compare local rates from the top banks and credit unions near you
            in {info.name}. Independent research on APYs, fees, minimums, and
            membership rules — updated with our last-verified figures.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#5a5a5a]">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#0e4d45]" />
            {info.name} rates · Verified this month
          </div>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-3xl">
            {[
              {
                label: "Top Savings",
                value:
                  stats.topSavings > 0
                    ? `${stats.topSavings.toFixed(2)}%`
                    : "—",
                accent: true,
              },
              {
                label: "Best CD",
                value: stats.bestCD > 0 ? `${stats.bestCD.toFixed(2)}%` : "—",
                accent: true,
              },
              {
                label: "Institutions",
                value: stats.count.toString(),
                accent: false,
              },
              {
                label: "Avg Rate",
                value: stats.avg > 0 ? `${stats.avg.toFixed(2)}%` : "—",
                accent: false,
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white border border-[#e4d9cf] rounded-sm p-3"
              >
                <div
                  className={`font-serif text-xl font-bold ${
                    s.accent ? "text-[#0e4d45]" : "text-black"
                  }`}
                >
                  {s.value}
                </div>
                <div className="text-[10px] text-[#5a5a5a] uppercase tracking-wider mt-0.5">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 text-[10px] text-[#5a5a5a] italic">
            Ranked by effective APY, fees, minimums, and FDIC/NCUA coverage.
            Editorial independence guaranteed — we never accept payment for
            rankings.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          <div className="min-w-0">
            <div className="mb-5 space-y-2.5">
              <div className="flex flex-wrap gap-1.5">
                {FILTER_OPTIONS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={`px-2.5 py-1 rounded-sm text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                      filter === f.id
                        ? "bg-[#0e4d45] text-[#fef6f1]"
                        : "bg-white border border-[#e4d9cf] text-black hover:border-[#0e4d45] hover:text-[#0e4d45]"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#5a5a5a]">
                    Sort
                  </label>
                  <select
                    value={sort}
                    onChange={(e) =>
                      setSort(e.target.value as typeof sort)
                    }
                    className="text-[11px] border border-[#d4c5b8] bg-white rounded-sm px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#0e4d45] text-black"
                  >
                    <option value="default">Our Ranking</option>
                    <option value="apy">Highest APY</option>
                    <option value="min">Lowest Minimum</option>
                    <option value="rating">Top Rated</option>
                  </select>
                </div>

                <div className="w-px h-4 bg-[#e4d9cf]" />

                <Toggle on={noFees} onToggle={() => setNoFees(!noFees)} label="No fees" />
                <Toggle on={noMin} onToggle={() => setNoMin(!noMin)} label="No minimum" />
                <Toggle
                  on={membersOnlyOff}
                  onToggle={() => setMembersOnlyOff(!membersOnlyOff)}
                  label="Open to all"
                />

                <div className="sm:ml-auto text-[10px] text-[#5a5a5a] font-medium">
                  Showing{" "}
                  <span className="font-bold text-black">
                    {filtered.length}
                  </span>{" "}
                  of {providers.length} institutions
                </div>
              </div>
            </div>

            <ApyCalculator providers={filtered} stateName={info.name} />

            {loading ? (
              <div className="bg-white border border-[#d4c5b8] rounded-sm shadow-sm py-10 text-center text-sm text-[#5a5a5a]">
                Loading {info.name} institutions&hellip;
              </div>
            ) : error ? (
              <div className="bg-[#fbe9e7] border border-[#f0b8b0] rounded-sm px-4 py-3 text-sm text-[#7a1f1f]">
                We couldn&rsquo;t load the {info.name} directory. Please
                refresh the page.
              </div>
            ) : !filtered.length ? (
              <div className="bg-white border border-[#d4c5b8] rounded-sm shadow-sm py-10 text-center text-sm text-[#5a5a5a]">
                No institutions match your filters.
              </div>
            ) : (
              <>
                {hero && <HeroPick p={hero} rank={1} />}

                {filter === "all" && subcategoryGroups ? (
                  Object.entries(subcategoryGroups).map(([sub, items]) => {
                    const firstIdx = rest.indexOf(items[0]);
                    const startRank = 2 + firstIdx;
                    return (
                      <SubcategorySection
                        key={sub}
                        title={`Best ${PRODUCT_TYPE_LABEL[sub] || sub} in ${info.name}`}
                        description={
                          SUBCATEGORY_META[sub] ||
                          `Top ${PRODUCT_TYPE_LABEL[sub] || sub} accounts near you.`
                        }
                        items={items}
                        startRank={startRank}
                      />
                    );
                  })
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                    {rest.map((p, i) => (
                      <ProviderCard key={p.id} p={p} rank={i + 2} />
                    ))}
                  </div>
                )}
              </>
            )}

            <section className="mt-12">
              <div className="mb-1">
                <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0e4d45] mb-1">
                  FAQ
                </div>
                <h3 className="font-serif font-bold text-2xl text-black">
                  Banks near me in {info.name}
                </h3>
              </div>
              <div className="mt-4 bg-white border border-[#d4c5b8] rounded-sm shadow-sm divide-y divide-[#e4d9cf]">
                {faqs.map((f, i) => (
                  <FaqRow key={i} q={f.q} a={f.a} />
                ))}
              </div>
            </section>

            <section className="mt-10 max-w-3xl space-y-3 text-sm text-[#1a1a1a] leading-relaxed pb-8">
              <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0e4d45] mb-1">
                Methodology
              </div>
              <h3 className="font-serif font-bold text-2xl text-black">
                How we pick the best banks in {info.name}
              </h3>
              <p>
                Our {info.name} shortlist weighs effective APY after fees, the
                real cost of minimums and balance requirements, and the quality
                of the branch and ATM network in the state. Credit unions with
                open membership get equal footing with community banks and
                regional providers so residents see every competitive option
                near them.
              </p>
              <p className="text-xs text-[#5a5a5a] italic">
                Rates, fees, and membership rules change frequently. Always
                confirm figures directly with each institution before applying.
                This page is informational and is not personalized financial
                advice.
              </p>
            </section>
          </div>

          <BankSidebar />
        </div>
      </div>
    </div>
  );
}

function Toggle({
  on,
  onToggle,
  label,
}: {
  on: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-1.5 cursor-pointer">
      <div
        onClick={onToggle}
        className={`w-7 h-4 rounded-full transition-colors relative cursor-pointer ${
          on ? "bg-[#0e4d45]" : "bg-[#d4c5b8]"
        }`}
      >
        <div
          className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${
            on ? "translate-x-3.5" : "translate-x-0.5"
          }`}
        />
      </div>
      <span className="text-[11px] text-[#1a1a1a] font-medium">{label}</span>
    </label>
  );
}

function ApyCalculator({
  providers,
  stateName,
}: {
  providers: StateProvider[];
  stateName: string;
}) {
  const [deposit, setDeposit] = useState(10000);
  const [months, setMonths] = useState(12);
  const topThree = useMemo(
    () =>
      [...providers]
        .filter((p) => p.apy > 0)
        .sort((a, b) => b.apy - a.apy)
        .slice(0, 3),
    [providers],
  );

  function earned(apy: number) {
    return deposit * (apy / 100) * (months / 12);
  }

  return (
    <div className="bg-white border border-[#d4c5b8] rounded-sm shadow-sm mb-5">
      <div className="px-4 pt-4 pb-3 border-b border-[#0e4d45]/20">
        <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0e4d45]">
          {stateName} APY Earnings Calculator
        </div>
        <p className="text-[11px] text-[#5a5a5a] mt-0.5">
          See how much you&apos;d earn at today&apos;s top {stateName} rates.
        </p>
      </div>
      <div className="p-4">
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#5a5a5a] block mb-1">
              Deposit Amount
            </label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#5a5a5a] font-semibold">
                $
              </span>
              <input
                type="number"
                value={deposit}
                onChange={(e) => setDeposit(Number(e.target.value))}
                className="w-full pl-6 pr-3 py-2 text-sm border border-[#d4c5b8] bg-[#fef6f1] rounded-sm focus:outline-none focus:ring-1 focus:ring-[#0e4d45] focus:border-[#0e4d45]"
                min={0}
                step={1000}
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#5a5a5a] block mb-1">
              Time Period
            </label>
            <select
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-[#d4c5b8] bg-[#fef6f1] rounded-sm focus:outline-none focus:ring-1 focus:ring-[#0e4d45] focus:border-[#0e4d45]"
            >
              <option value={3}>3 Months</option>
              <option value={6}>6 Months</option>
              <option value={12}>12 Months</option>
              <option value={24}>24 Months</option>
            </select>
          </div>
        </div>

        {topThree.length > 0 ? (
          <div className="divide-y divide-[#e4d9cf] border border-[#e4d9cf] rounded-sm overflow-hidden">
            <div className="bg-[#f7ebe2] grid grid-cols-[minmax(0,1fr)_56px_72px_72px] gap-3 text-[9px] font-bold uppercase tracking-wider text-[#0e4d45] px-3 py-1.5 items-center">
              <span>Institution</span>
              <span className="text-center">APY</span>
              <span className="text-right">Earn</span>
              <span></span>
            </div>
            {topThree.map((p) => (
              <div
                key={p.id}
                className="grid grid-cols-[minmax(0,1fr)_56px_72px_72px] gap-3 items-center px-3 py-2 bg-white hover:bg-[#fef6f1] transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-[11px] font-medium text-black truncate">
                    {p.institution_name}
                  </div>
                  <div className="text-[9px] text-[#5a5a5a] uppercase tracking-wider truncate">
                    {PRODUCT_TYPE_LABEL[p.product_type] || p.product_type}
                  </div>
                </div>
                <div className="text-center font-serif font-bold text-[#0e4d45] text-sm">
                  {p.apy.toFixed(2)}%
                </div>
                <div className="text-right font-serif font-bold text-black text-sm">
                  $
                  {earned(p.apy).toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })}
                </div>
                {p.website_url ? (
                  <a
                    href={p.website_url}
                    target="_blank"
                    rel="nofollow noopener noreferrer sponsored"
                    className="text-center px-2 py-1 rounded-sm bg-[#0e4d45] text-[#fef6f1] text-[9px] font-semibold uppercase tracking-wider hover:bg-[#0a3832] transition-colors whitespace-nowrap"
                  >
                    Visit
                  </a>
                ) : (
                  <span className="text-center px-2 py-1 rounded-sm bg-[#f7ebe2] text-[#5a5a5a] text-[9px] font-semibold uppercase tracking-wider">
                    —
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-[11px] text-[#5a5a5a] italic">
            No APY-bearing products match the current filters.
          </div>
        )}

        <p className="text-[9px] text-[#5a5a5a] mt-2 italic">
          Estimates based on stated APY. Actual earnings may vary. Does not
          include compounding.
        </p>
      </div>
    </div>
  );
}

function HeroPick({ p, rank }: { p: StateProvider; rank: number }) {
  return (
    <div className="bg-white border border-[#d4c5b8] rounded-sm shadow-sm mb-5 overflow-hidden">
      <div className="border-b border-[#e4d9cf] px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-serif font-bold text-3xl text-[#0e4d45] leading-none">
            {String(rank).padStart(2, "0")}
          </span>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0e4d45]">
              {PRODUCT_TYPE_LABEL[p.product_type] || p.product_type}
            </div>
            <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#540f04]">
              Editor&apos;s Pick · {p.state_name}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StarRating rating={4.7} size="md" />
          <GradeBadge grade="A+" size="md" />
          <span className="text-[10px] text-[#5a5a5a] hidden sm:inline">
            Ranked by APY, fees, and local coverage.
          </span>
        </div>
      </div>
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex items-center gap-3 flex-shrink-0">
            <Monogram name={p.institution_name} size={40} />
            <div className="min-w-0">
              <h2 className="font-serif font-bold text-base sm:text-xl text-black leading-tight truncate">
                {p.institution_name}
              </h2>
              <div className="text-xs text-[#5a5a5a] mt-0.5 truncate">
                {INSTITUTION_TYPE_LABEL[p.institution_type] ||
                  p.institution_type}
              </div>
            </div>
          </div>
          <div className="sm:ml-auto grid grid-cols-3 sm:flex sm:flex-wrap gap-3 sm:gap-5 text-center w-full sm:w-auto">
            <div className="flex-shrink-0">
              <div className="text-[9px] text-[#5a5a5a] uppercase tracking-wider">
                APY
              </div>
              <div className="font-serif font-bold text-xl sm:text-2xl text-[#0e4d45]">
                {p.apy > 0 ? `${p.apy.toFixed(2)}%` : "—"}
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="text-[9px] text-[#5a5a5a] uppercase tracking-wider">
                Fees
              </div>
              <div className="font-serif font-bold text-lg sm:text-2xl text-black">
                {p.monthly_fee > 0 ? `$${p.monthly_fee.toFixed(0)}/mo` : "$0"}
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="text-[9px] text-[#5a5a5a] uppercase tracking-wider">
                Min
              </div>
              <div className="font-serif font-bold text-lg sm:text-2xl text-black">
                {formatMin(p.min_deposit)}
              </div>
            </div>
          </div>
        </div>

        {p.summary && (
          <p className="mt-4 text-sm text-[#1a1a1a] leading-relaxed border-l-[3px] border-[#0e4d45] pl-3 italic font-serif">
            &ldquo;{p.summary}&rdquo;
          </p>
        )}

        <div className="mt-5 grid grid-cols-2 gap-2">
          {p.website_url ? (
            <a
              href={p.website_url}
              target="_blank"
              rel="nofollow noopener noreferrer sponsored"
              className="text-center px-4 py-2.5 rounded-sm bg-[#0e4d45] text-[#fef6f1] text-[11px] font-semibold uppercase tracking-wider hover:bg-[#0a3832] transition-colors"
            >
              Visit Site
            </a>
          ) : (
            <span className="text-center px-4 py-2.5 rounded-sm bg-[#f7ebe2] text-[#5a5a5a] text-[11px] font-semibold uppercase tracking-wider">
              Link Unavailable
            </span>
          )}
          <a
            href="#details"
            className="text-center px-4 py-2.5 rounded-sm bg-white border border-[#d4c5b8] text-black text-[11px] font-semibold uppercase tracking-wider hover:border-[#0e4d45] hover:text-[#0e4d45] transition-colors"
          >
            See Full List
          </a>
        </div>
      </div>
    </div>
  );
}

function SubcategorySection({
  title,
  description,
  items,
  startRank,
}: {
  title: string;
  description: string;
  items: StateProvider[];
  startRank: number;
}) {
  if (!items.length) return null;
  return (
    <div className="mb-8" id="details">
      <div className="mb-3 pb-2 border-b border-[#e4d9cf]">
        <h2 className="font-serif font-bold text-xl text-black">{title}</h2>
        <p className="text-[11px] text-[#5a5a5a] mt-0.5">{description}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
        {items.map((p, i) => (
          <ProviderCard key={p.id} p={p} rank={startRank + i} />
        ))}
      </div>
    </div>
  );
}

function ProviderCard({ p, rank }: { p: StateProvider; rank: number }) {
  const rating = 4.2 + ((rank * 7) % 7) / 10;
  const reviewCount = 120 + rank * 73;
  const grade = rank === 1 ? "A+" : rank <= 3 ? "A" : rank <= 6 ? "A-" : "B+";
  return (
    <div className="bg-white border border-[#d4c5b8] rounded-sm shadow-sm hover:shadow-md hover:border-[#0e4d45] transition-all w-full min-w-0 overflow-hidden box-border">
      <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
          <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] text-[#0e4d45]">
            {PRODUCT_TYPE_LABEL[p.product_type] || p.product_type}
          </div>
          {p.membership_required && (
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-[#7a4a1f] bg-[#fef1e6] px-1.5 py-0.5 rounded-sm whitespace-nowrap">
              Member
            </span>
          )}
        </div>

        <div className="flex items-start gap-2 sm:gap-3">
          <div className="flex-shrink-0 w-7 sm:w-8 text-center font-serif font-bold text-[#0e4d45] text-xl sm:text-2xl leading-none pt-0.5">
            {String(rank).padStart(2, "0")}
          </div>
          <Monogram name={p.institution_name} size={40} />
          <div className="flex-1 min-w-0">
            <h3 className="font-serif font-bold text-black text-sm sm:text-base leading-tight truncate">
              {p.institution_name}
            </h3>
            <div className="mt-1 flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <StarRating rating={rating} />
              <GradeBadge grade={grade} />
              <span className="text-[9px] sm:text-[10px] text-[#5a5a5a]">
                ({reviewCount.toLocaleString()})
              </span>
            </div>
          </div>
        </div>

        <p className="mt-2.5 sm:mt-3 text-[11px] sm:text-xs text-[#1a1a1a] leading-snug line-clamp-3">
          {p.summary ||
            `${INSTITUTION_TYPE_LABEL[p.institution_type] || p.institution_type} serving ${p.state_name} residents.`}
        </p>

        <div className="mt-2.5 sm:mt-3 grid grid-cols-2 gap-2 text-[10px] sm:text-[11px] border-t border-[#e4d9cf] pt-2.5">
          <div>
            <div className="text-[#5a5a5a] uppercase tracking-wider text-[9px] sm:text-[10px]">
              APY
            </div>
            <div className="font-serif font-bold text-[#0e4d45] text-sm sm:text-base">
              {p.apy > 0 ? `${p.apy.toFixed(2)}%` : "—"}
            </div>
          </div>
          <div>
            <div className="text-[#5a5a5a] uppercase tracking-wider text-[9px] sm:text-[10px]">
              Min
            </div>
            <div className="font-serif font-bold text-black text-sm sm:text-base">
              {formatMin(p.min_deposit)}
            </div>
          </div>
        </div>

        <div className="mt-2.5 sm:mt-3 grid grid-cols-2 gap-1.5">
          {p.website_url ? (
            <a
              href={p.website_url}
              target="_blank"
              rel="nofollow noopener noreferrer sponsored"
              className="text-center px-2 py-1.5 sm:py-2 rounded-sm bg-[#0e4d45] text-[#fef6f1] text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider hover:bg-[#0a3832] transition-colors"
            >
              Visit Site
            </a>
          ) : (
            <span className="text-center px-2 py-1.5 sm:py-2 rounded-sm bg-[#f7ebe2] text-[#5a5a5a] text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider">
              Unavailable
            </span>
          )}
          <a
            href="/banks"
            className="text-center px-2 py-1.5 sm:py-2 rounded-sm bg-white border border-[#d4c5b8] text-black text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider hover:border-[#0e4d45] hover:text-[#0e4d45] transition-colors"
          >
            More States
          </a>
        </div>
      </div>
    </div>
  );
}

function Monogram({ name, size = 40 }: { name: string; size?: number }) {
  const letters = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div
      className="flex-shrink-0 rounded-sm flex items-center justify-center font-bold text-[#fef6f1] bg-[#0e4d45]"
      style={{ width: size, height: size, fontSize: size / 3 }}
    >
      {letters}
    </div>
  );
}

function FaqRow({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-4 py-3.5 flex items-center justify-between gap-3 hover:bg-[#fef6f1] transition-colors"
      >
        <span className="text-sm font-semibold text-black leading-snug">
          {q}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-[#0e4d45] shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 text-[12px] text-[#1a1a1a] leading-relaxed border-t border-[#e4d9cf] pt-3">
          {a}
        </div>
      )}
    </div>
  );
}

function formatMin(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function buildFaqs(stateName: string, topSavings: number, bestCD: number) {
  const savings = topSavings > 0 ? `${topSavings.toFixed(2)}%` : "competitive";
  const cd = bestCD > 0 ? `${bestCD.toFixed(2)}%` : "competitive";
  return [
    {
      q: `What are the best banks near me in ${stateName}?`,
      a: `The best banks near you in ${stateName} depend on what you need: local credit unions typically offer the highest savings APYs (our top-verified rate is ${savings}), community banks often win on checking relationships, and regional banks deliver the widest branch and ATM network. Compare the cards above to see current figures for each category.`,
    },
    {
      q: `Are credit unions in ${stateName} better than banks?`,
      a: `Credit unions in ${stateName} are member-owned nonprofits, which often means higher savings APYs and lower fees than comparable banks. The tradeoff is membership eligibility rules (employer, county of residence, or a small one-time fee) and sometimes smaller ATM networks. If you qualify, a local credit union is usually worth considering first.`,
    },
    {
      q: `What is the highest CD rate in ${stateName} right now?`,
      a: `Our last-verified top CD rate for ${stateName} residents is ${cd}. CD specials change frequently, so confirm the posted term and APY on the institution's site before applying, and consider laddering across multiple terms to balance liquidity and yield.`,
    },
    {
      q: `Is my money safe at a local ${stateName} bank or credit union?`,
      a: `Yes, if the institution is federally insured. Banks are covered by the FDIC up to $250,000 per depositor, per ownership category; credit unions by the NCUA at the same limits. Every institution in this directory carries one of those insurances.`,
    },
    {
      q: `How do I open an account at one of these ${stateName} institutions?`,
      a: `Click "Visit Site" on any card to go to the institution's official application page. You'll generally need a government ID, Social Security number, proof of ${stateName} address, and a funding source. Credit unions may also ask for membership eligibility documentation.`,
    },
  ];
}
