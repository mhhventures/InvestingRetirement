import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, ChevronDown, Clock } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  findStateBySlug,
  INSTITUTION_TYPE_LABEL,
  PRODUCT_TYPE_LABEL,
  type StateProvider,
} from "@/lib/states-data";
import { useSeo, SITE_URL } from "@/lib/seo";
import { BankSidebar } from "@/components/bank-sidebar";

export const Route = createFileRoute("/banks/$state")({
  loader: ({ params }) => {
    const info = findStateBySlug(params.state);
    if (!info || !info.available) throw notFound();
    return { info };
  },
  component: StateBanksPage,
});

type ProductFilter = "all" | "savings" | "checking" | "cd" | "money_market";

const PRODUCT_FILTERS: { id: ProductFilter; label: string }[] = [
  { id: "all", label: "All Types" },
  { id: "savings", label: "SAV" },
  { id: "checking", label: "CHK" },
  { id: "cd", label: "CD" },
  { id: "money_market", label: "MM" },
];

const PRODUCT_BADGE: Record<string, string> = {
  savings: "SAV",
  checking: "CHK",
  cd: "CD",
  money_market: "MM",
};

function StateBanksPage() {
  const { info } = Route.useLoaderData();
  const [providers, setProviders] = useState<StateProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ProductFilter>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

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

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return providers
      .filter((p) => filter === "all" || p.product_type === filter)
      .filter(
        (p) =>
          !q ||
          p.institution_name.toLowerCase().includes(q) ||
          (INSTITUTION_TYPE_LABEL[p.institution_type] || "")
            .toLowerCase()
            .includes(q),
      )
      .sort((a, b) => b.apy - a.apy);
  }, [providers, filter, query]);

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
    <div className="bg-[#fef6f1]">
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-4">
        <nav
          className="flex items-center gap-2 text-[11px] text-[#5a5a5a]"
          aria-label="Breadcrumb"
        >
          <a href="/" className="hover:text-[#0e4d45]">
            Home
          </a>
          <span>/</span>
          <a href="/banks" className="hover:text-[#0e4d45]">
            Banks
          </a>
          <span>/</span>
          <span className="text-black">{info.name}</span>
        </nav>
      </div>

      <section className="max-w-6xl mx-auto px-4">
        <div className="max-w-3xl">
          <h1 className="font-serif text-3xl sm:text-5xl font-bold leading-[1.05] text-black mb-3">
            Best Banks in {info.name}
          </h1>
          <p className="text-sm sm:text-base text-[#1a1a1a] leading-relaxed">
            Compare local rates, credit unions, and banking institutions in{" "}
            {info.name} with independent research. Updated with our last-verified
            APYs for savings, checking, CDs, and money market accounts near you.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 mt-6 grid lg:grid-cols-[1fr_320px] gap-8">
        <div className="min-w-0">
          <StatsStrip stats={stats} />

          <section className="mt-8">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-black">
                Current Interest Rates
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-[#5a5a5a]">
                <Clock className="w-3.5 h-3.5" />
                Verified this month
              </span>
            </div>

            <div className="relative mb-3">
              <Search className="w-4 h-4 text-[#5a5a5a] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${info.name} institutions...`}
                className="w-full bg-white border border-[#d4c5b8] rounded-sm pl-9 pr-3 py-2.5 text-sm text-black placeholder:text-[#8a8a8a] focus:outline-none focus:border-[#0e4d45]"
              />
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {PRODUCT_FILTERS.map((f) => {
                const active = filter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={`text-[11px] font-bold uppercase tracking-wider px-3 py-2 rounded-sm border transition-colors ${
                      active
                        ? "bg-[#0e4d45] border-[#0e4d45] text-[#fef6f1]"
                        : "bg-white border-[#d4c5b8] text-black hover:border-[#0e4d45]"
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>

            <RatesTable
              rows={visible}
              loading={loading}
              error={error}
              expanded={expanded}
              onToggle={(id) => setExpanded((cur) => (cur === id ? null : id))}
            />
          </section>

          <section className="mt-12">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-black mb-4">
              Frequently asked: banks near me in {info.name}
            </h2>
            <div className="space-y-3">
              {faqs.map((f) => (
                <details
                  key={f.q}
                  className="bg-white border border-[#e4d9cf] rounded-sm group"
                >
                  <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between gap-3 text-sm font-semibold text-black">
                    <span>{f.q}</span>
                    <ChevronDown className="w-4 h-4 text-[#0e4d45] transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-4 pb-4 text-sm text-[#1a1a1a] leading-relaxed border-t border-[#f0e6dc] pt-3">
                    {f.a}
                  </div>
                </details>
              ))}
            </div>
          </section>

          <section className="mt-12 max-w-3xl space-y-3 text-sm text-[#1a1a1a] leading-relaxed">
            <h2 className="font-serif text-xl font-bold text-black">
              How we pick the best banks in {info.name}
            </h2>
            <p>
              Our {info.name} shortlist weighs effective APY after fees, the
              real cost of minimums and balance requirements, and the quality
              of the branch and ATM network in the state. Credit unions with
              open membership get equal footing with community banks and
              regional providers so residents see every competitive option.
            </p>
            <p className="text-xs text-[#5a5a5a] italic">
              Rates, fees, and membership rules change frequently. Always
              confirm figures directly with each institution before applying.
              This page is informational and is not personalized financial
              advice.
            </p>
          </section>
        </div>

        <aside className="min-w-0">
          <BankSidebar />
        </aside>
      </div>

      <div className="h-12" />
    </div>
  );
}

function StatsStrip({
  stats,
}: {
  stats: { topSavings: number; bestCD: number; count: number; avg: number };
}) {
  const items = [
    {
      value: stats.topSavings > 0 ? `${stats.topSavings.toFixed(2)}%` : "—",
      label: "Top Savings",
      accent: true,
    },
    {
      value: stats.bestCD > 0 ? `${stats.bestCD.toFixed(2)}%` : "—",
      label: "Best CD",
      accent: true,
    },
    {
      value: stats.count.toString(),
      label: "Institutions",
      accent: false,
    },
    {
      value: stats.avg > 0 ? `${stats.avg.toFixed(2)}%` : "—",
      label: "Avg Rate",
      accent: false,
    },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-0 sm:divide-x sm:divide-[#e4d9cf] bg-white border border-[#e4d9cf] rounded-sm p-4 sm:p-0">
      {items.map((it) => (
        <div
          key={it.label}
          className="sm:px-5 sm:py-5 text-left sm:text-center"
        >
          <div
            className={`font-serif font-bold text-2xl sm:text-3xl leading-none ${
              it.accent ? "text-[#0e4d45]" : "text-black"
            }`}
          >
            {it.value}
          </div>
          <div className="text-[11px] sm:text-xs text-[#5a5a5a] mt-1.5 uppercase tracking-wider">
            {it.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function RatesTable({
  rows,
  loading,
  error,
  expanded,
  onToggle,
}: {
  rows: StateProvider[];
  loading: boolean;
  error: string | null;
  expanded: string | null;
  onToggle: (id: string) => void;
}) {
  if (loading) {
    return (
      <div className="bg-white border border-[#e4d9cf] rounded-sm py-10 text-center text-sm text-[#5a5a5a]">
        Loading providers&hellip;
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-[#fbe9e7] border border-[#f0b8b0] rounded-sm px-4 py-3 text-sm text-[#7a1f1f]">
        We couldn&rsquo;t load the rate list. Please refresh the page.
      </div>
    );
  }
  if (!rows.length) {
    return (
      <div className="bg-white border border-[#e4d9cf] rounded-sm py-10 text-center text-sm text-[#5a5a5a]">
        No institutions match your filters.
      </div>
    );
  }
  return (
    <div className="bg-white border border-[#d4c5b8] rounded-sm overflow-hidden">
      <div className="hidden md:grid grid-cols-[2fr_80px_100px_90px_90px_100px_32px] bg-[#0e4d45] text-[#fef6f1] text-[10px] font-bold uppercase tracking-wider">
        <div className="px-4 py-3">Institution</div>
        <div className="px-2 py-3 text-center">Type</div>
        <div className="px-2 py-3 text-center">Rate</div>
        <div className="px-2 py-3 text-center">Term</div>
        <div className="px-2 py-3 text-center">Min</div>
        <div className="px-2 py-3 text-center">Class</div>
        <div className="px-2 py-3" />
      </div>
      <ul className="divide-y divide-[#e4d9cf]">
        {rows.map((p, idx) => {
          const isOpen = expanded === p.id;
          return (
            <li
              key={p.id}
              className={idx % 2 === 0 ? "bg-white" : "bg-[#fdf8f3]"}
            >
              <button
                type="button"
                onClick={() => onToggle(p.id)}
                className="w-full text-left md:grid md:grid-cols-[2fr_80px_100px_90px_90px_100px_32px] md:items-center flex flex-col gap-2 md:gap-0 px-4 md:px-0 py-3 hover:bg-[#f7ebe2]/40 transition-colors"
                aria-expanded={isOpen}
              >
                <div className="md:px-4 flex items-center gap-2 min-w-0">
                  <span className="font-semibold text-sm text-black truncate">
                    {p.institution_name}
                  </span>
                  {p.membership_required && (
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-[#fef1e6] text-[#7a4a1f] px-1.5 py-0.5 rounded-sm flex-shrink-0">
                      Member
                    </span>
                  )}
                </div>
                <div className="md:px-2 md:text-center">
                  <span className="inline-flex md:justify-center text-[10px] font-bold uppercase tracking-wider border border-[#0e4d45] text-[#0e4d45] px-1.5 py-0.5 rounded-sm">
                    {PRODUCT_BADGE[p.product_type] || p.product_type}
                  </span>
                </div>
                <div className="md:px-2 md:text-center font-serif font-bold text-[#0e4d45] text-lg">
                  {p.apy > 0 ? `${p.apy.toFixed(2)}%` : "—"}
                </div>
                <div className="md:px-2 md:text-center text-sm text-[#1a1a1a]">
                  {p.product_type === "cd" ? "12mo" : "N/A"}
                </div>
                <div className="md:px-2 md:text-center text-sm text-[#1a1a1a]">
                  {p.min_deposit >= 1000
                    ? `$${(p.min_deposit / 1000).toFixed(0)}K`
                    : `$${p.min_deposit.toLocaleString()}`}
                </div>
                <div className="md:px-2 md:text-center text-xs text-[#5a5a5a] capitalize">
                  {(INSTITUTION_TYPE_LABEL[p.institution_type] || "")
                    .split(" ")[0]
                    .toLowerCase()}
                </div>
                <div className="md:px-2 md:text-center flex md:justify-center">
                  <ChevronDown
                    className={`w-4 h-4 text-[#5a5a5a] transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 md:pl-4 text-sm text-[#1a1a1a] leading-relaxed border-t border-[#f0e6dc] pt-3 bg-white">
                  {p.summary && <p className="mb-2">{p.summary}</p>}
                  <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-[12px]">
                    <div>
                      <dt className="inline font-semibold text-[#0e4d45]">
                        Institution type:{" "}
                      </dt>
                      <dd className="inline text-[#1a1a1a]">
                        {INSTITUTION_TYPE_LABEL[p.institution_type] ||
                          p.institution_type}
                      </dd>
                    </div>
                    <div>
                      <dt className="inline font-semibold text-[#0e4d45]">
                        Product:{" "}
                      </dt>
                      <dd className="inline text-[#1a1a1a]">
                        {PRODUCT_TYPE_LABEL[p.product_type] || p.product_type}
                      </dd>
                    </div>
                    <div>
                      <dt className="inline font-semibold text-[#0e4d45]">
                        Monthly fee:{" "}
                      </dt>
                      <dd className="inline text-[#1a1a1a]">
                        {p.monthly_fee > 0
                          ? `$${p.monthly_fee.toFixed(2)}`
                          : "None"}
                      </dd>
                    </div>
                    {p.fdic_ncua_id && (
                      <div>
                        <dt className="inline font-semibold text-[#0e4d45]">
                          FDIC/NCUA ID:{" "}
                        </dt>
                        <dd className="inline text-[#1a1a1a]">
                          {p.fdic_ncua_id}
                        </dd>
                      </div>
                    )}
                    {p.membership_required && p.membership_notes && (
                      <div className="sm:col-span-2">
                        <dt className="inline font-semibold text-[#0e4d45]">
                          Membership:{" "}
                        </dt>
                        <dd className="inline text-[#1a1a1a]">
                          {p.membership_notes}
                        </dd>
                      </div>
                    )}
                  </dl>
                  {p.website_url && (
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-[10px] text-[#5a5a5a] uppercase tracking-wider">
                        Verified{" "}
                        {new Date(p.last_verified_at).toLocaleDateString(
                          undefined,
                          { year: "numeric", month: "short", day: "numeric" },
                        )}
                      </span>
                      <a
                        href={p.website_url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="text-[11px] font-bold uppercase tracking-wider bg-[#0e4d45] text-[#fef6f1] px-3 py-1.5 rounded-sm hover:bg-[#0a3832] transition-colors"
                      >
                        Visit site
                      </a>
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function buildFaqs(stateName: string, topSavings: number, bestCD: number) {
  const savings = topSavings > 0 ? `${topSavings.toFixed(2)}%` : "competitive";
  const cd = bestCD > 0 ? `${bestCD.toFixed(2)}%` : "competitive";
  return [
    {
      q: `What are the best banks near me in ${stateName}?`,
      a: `The best banks near you in ${stateName} depend on what you need: local credit unions typically offer the highest savings APYs (our top-verified rate is ${savings}), community banks often win on checking relationships, and regional banks deliver the widest branch and ATM network. Compare the rate table above to see current figures for each category.`,
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
      a: `Yes, if the institution is federally insured. Banks are covered by the FDIC up to $250,000 per depositor, per ownership category; credit unions by the NCUA at the same limits. Every institution in this directory carries one of those insurances — check the FDIC or NCUA ID shown in the expanded row to verify.`,
    },
    {
      q: `How do I open an account at one of these ${stateName} institutions?`,
      a: `Click "Visit site" on any row to go to the institution's official application page. You'll generally need a government ID, Social Security number, proof of ${stateName} address, and a funding source (another bank account, debit card, or check). Credit unions may also ask for membership eligibility documentation.`,
    },
  ];
}
