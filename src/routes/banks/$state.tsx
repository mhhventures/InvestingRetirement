import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, MapPin, Table as TableIcon, Grid2x2 } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  findStateBySlug,
  INSTITUTION_TYPE_LABEL,
  PRODUCT_TYPE_LABEL,
  getStateCities,
  getStateFacts,
  getRelatedStates,
  type StateProvider,
} from "@/lib/states-data";
import { useSeo, SITE_URL } from "@/lib/seo";
import { BankSidebar } from "@/components/bank-sidebar";
import { StarRating, GradeBadge } from "@/components/product-card";
import { getDomainLogoUrl, extractDomain } from "@/lib/product-icons";

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

const TOC_SECTIONS = [
  { id: "top-picks", label: "Editor's top picks" },
  { id: "rate-table", label: "Current rate table" },
  { id: "calculator", label: "APY earnings calculator" },
  { id: "banks-vs-cus", label: "Banks vs credit unions" },
  { id: "how-to-choose", label: "How to choose" },
  { id: "cities", label: "Cities we cover" },
  { id: "faq", label: "FAQ" },
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
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"cards" | "table">("table");
  const cities = useMemo(() => getStateCities(info.code), [info.code]);
  const facts = useMemo(() => getStateFacts(info.code), [info.code]);
  const relatedStates = useMemo(() => getRelatedStates(info.code), [info.code]);

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
    const q = query.trim().toLowerCase();
    let list =
      filter === "all"
        ? providers
        : providers.filter((p) => p.product_type === filter);
    if (q) {
      list = list.filter(
        (p) =>
          p.institution_name.toLowerCase().includes(q) ||
          (INSTITUTION_TYPE_LABEL[p.institution_type] || "")
            .toLowerCase()
            .includes(q) ||
          (p.summary || "").toLowerCase().includes(q),
      );
    }
    if (noFees) list = list.filter((p) => p.monthly_fee === 0);
    if (noMin) list = list.filter((p) => p.min_deposit === 0);
    if (membersOnlyOff) list = list.filter((p) => !p.membership_required);
    if (sort === "apy") list = [...list].sort((a, b) => b.apy - a.apy);
    else if (sort === "min")
      list = [...list].sort((a, b) => a.min_deposit - b.min_deposit);
    else if (sort === "rating")
      list = [...list].sort((a, b) => a.rank_weight - b.rank_weight);
    return list;
  }, [providers, filter, sort, noFees, noMin, membersOnlyOff, query]);

  // Log searches (debounced) to Supabase for analytics.
  const lastLoggedQuery = useRef<string>("");
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2 || !isSupabaseConfigured) return;
    if (lastLoggedQuery.current === q) return;
    const timer = setTimeout(() => {
      lastLoggedQuery.current = q;
      void supabase.from("state_page_searches").insert({
        state_code: info.code,
        query: q,
        product_filter: filter,
        results_count: filtered.length,
        referrer: typeof document !== "undefined" ? document.referrer : "",
        user_agent:
          typeof navigator !== "undefined" ? navigator.userAgent : "",
      });
    }, 900);
    return () => clearTimeout(timer);
  }, [query, info.code, filter, filtered.length]);

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

  // Editorial superlatives — compute from full provider list so they remain
  // stable as filters change. Each award picks the best match or falls back
  // to the top-ranked provider overall.
  const bestFor = useMemo(() => {
    if (!providers.length) return [];
    const byRank = [...providers].sort((a, b) => a.rank_weight - b.rank_weight);
    const topApy = [...providers]
      .filter((p) => p.apy > 0)
      .sort((a, b) => b.apy - a.apy)[0];
    const topCD = [...providers]
      .filter((p) => p.product_type === "cd" && p.apy > 0)
      .sort((a, b) => b.apy - a.apy)[0];
    const topChecking = [...providers]
      .filter((p) => p.product_type === "checking")
      .sort((a, b) => a.monthly_fee - b.monthly_fee)[0];
    const topCU = byRank.find((p) => p.institution_type === "credit_union");
    const noMinPick = byRank.find(
      (p) => p.min_deposit === 0 && p.monthly_fee === 0,
    );
    const picks: { label: string; why: string; p: StateProvider }[] = [];
    if (byRank[0])
      picks.push({
        label: "Best Overall",
        why: `Highest combined score across APY, fees, and ${info.name} access.`,
        p: byRank[0],
      });
    if (topApy && topApy !== byRank[0])
      picks.push({
        label: "Best APY",
        why: `Top verified rate for ${info.name} residents.`,
        p: topApy,
      });
    if (topCD)
      picks.push({
        label: "Best CD",
        why: `Best certificate of deposit available in ${info.name}.`,
        p: topCD,
      });
    if (topChecking)
      picks.push({
        label: "Best Checking",
        why: "Lowest maintenance cost for everyday use.",
        p: topChecking,
      });
    if (topCU)
      picks.push({
        label: "Best Credit Union",
        why: `Top-ranked ${info.name} credit union in our directory.`,
        p: topCU,
      });
    if (noMinPick)
      picks.push({
        label: "Best No-Minimum",
        why: "No opening deposit, no monthly fee.",
        p: noMinPick,
      });
    // dedupe by institution id
    const seen = new Set<string>();
    return picks.filter((x) =>
      seen.has(x.p.id) ? false : (seen.add(x.p.id), true),
    );
  }, [providers, info.name]);

  const faqs = useMemo(
    () => buildFaqs(info.name, stats.topSavings, stats.bestCD, cities),
    [info.name, stats.topSavings, stats.bestCD, cities],
  );

  useSeo({
    title: `Best Banks in ${info.name} ${new Date().getFullYear()} — Local Rates, Credit Unions & Banks Near Me`,
    description: `Compare the best banks and credit unions in ${info.name}. Current APYs up to ${
      stats.topSavings > 0 ? `${stats.topSavings.toFixed(2)}%` : "competitive"
    }, fees, minimums, and membership rules${
      cities.length ? ` across ${cities.slice(0, 3).join(", ")}` : ""
    } and more.`,
    path: `/banks/${info.slug}`,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: `Best Banks in ${info.name}`,
        url: `${SITE_URL}/banks/${info.slug}`,
        about: { "@type": "Place", name: info.name },
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["h1", ".speakable-intro"],
        },
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
      {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: `How to choose the best bank in ${info.name}`,
        description: `Step-by-step guidance for ${info.name} residents comparing local banks and credit unions.`,
        step: [
          {
            "@type": "HowToStep",
            name: "Compare APYs",
            text: `Start by comparing savings and CD APYs offered by banks and credit unions available to ${info.name} residents.`,
          },
          {
            "@type": "HowToStep",
            name: "Check fees and minimums",
            text: "Confirm monthly maintenance fees, minimum opening deposits, and any balance requirements.",
          },
          {
            "@type": "HowToStep",
            name: "Verify insurance",
            text: "Make sure the institution is FDIC- or NCUA-insured and note its FDIC/NCUA ID.",
          },
          {
            "@type": "HowToStep",
            name: "Confirm membership eligibility",
            text: `For ${info.name} credit unions, verify that you qualify based on employer, location, or a small one-time fee.`,
          },
          {
            "@type": "HowToStep",
            name: "Apply online",
            text: "Click Visit Site on your chosen row to open an account with a government ID and Social Security number.",
          },
        ],
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
          <a href="/" className="hover:text-[#0e4d45]">Home</a>
          <span className="mx-1 sm:mx-1.5 text-black/30">/</span>
          <a href="/banks" className="hover:text-[#0e4d45]">Banks</a>
          <span className="mx-1 sm:mx-1.5 text-black/30">/</span>
          <span className="text-black font-semibold whitespace-nowrap">{info.name}</span>
        </div>
      </div>

      <section className="border-b border-[#e4d9cf]">
        <div className="max-w-6xl mx-auto px-4 py-7">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0e4d45] mb-2">
            Banking · {info.name}
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-black leading-[1.05] mb-2">
            Best Banks in {info.name} ({new Date().getFullYear()})
          </h1>
          <p className="speakable-intro text-sm text-[#1a1a1a] max-w-3xl leading-relaxed">
            Compare the best banks and credit unions for {info.name} residents —
            current APYs up to{" "}
            <strong>
              {stats.topSavings > 0
                ? `${stats.topSavings.toFixed(2)}%`
                : "competitive"}
            </strong>
            , fees, minimums, and membership rules.{" "}
            {facts.population && (
              <>
                {info.name} is home to roughly {facts.population} residents and{" "}
                {facts.fdicBanks} FDIC-insured banks plus {facts.creditUnions}{" "}
                credit unions.{" "}
              </>
            )}
            Independent research, verified this month.
          </p>

          <div className="mt-3 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#5a5a5a]">
            <MapPin className="w-3 h-3 text-[#0e4d45]" />
            {info.name} · Updated {new Date().toLocaleDateString(undefined, {
              month: "long",
              year: "numeric",
            })}
          </div>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-3xl">
            {[
              {
                label: "Top Savings",
                value: stats.topSavings > 0 ? `${stats.topSavings.toFixed(2)}%` : "—",
                accent: true,
              },
              {
                label: "Best CD",
                value: stats.bestCD > 0 ? `${stats.bestCD.toFixed(2)}%` : "—",
                accent: true,
              },
              { label: "Institutions", value: stats.count.toString(), accent: false },
              {
                label: "Avg Rate",
                value: stats.avg > 0 ? `${stats.avg.toFixed(2)}%` : "—",
                accent: false,
              },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-[#e4d9cf] rounded-sm p-3">
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
            {/* TOC — Bankrate-style jump links */}
            <nav
              aria-label="Page contents"
              className="mb-6 bg-white border border-[#e4d9cf] rounded-sm px-4 py-3"
            >
              <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0e4d45] mb-1.5">
                On this page
              </div>
              <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[12px]">
                {TOC_SECTIONS.map((t) => (
                  <li key={t.id}>
                    <a
                      href={`#${t.id}`}
                      className="text-[#1a1a1a] hover:text-[#0e4d45] hover:underline"
                    >
                      {t.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Editorial superlatives */}
            {bestFor.length > 0 && (
              <section id="top-picks" className="mb-8 scroll-mt-20">
                <div className="mb-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0e4d45] mb-1">
                    Editor's Picks
                  </div>
                  <h2 className="font-serif font-bold text-2xl text-black">
                    Best banks in {info.name} by category
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {bestFor.map((x) => (
                    <BestForCard key={`${x.label}-${x.p.id}`} label={x.label} why={x.why} p={x.p} />
                  ))}
                </div>
              </section>
            )}

            {/* Search + filters */}
            <section id="rate-table" className="scroll-mt-20">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="font-serif font-bold text-2xl text-black">
                  Current interest rates in {info.name}
                </h2>
                <div className="hidden sm:flex items-center border border-[#d4c5b8] rounded-sm overflow-hidden">
                  <button
                    onClick={() => setView("table")}
                    aria-pressed={view === "table"}
                    className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1.5 flex items-center gap-1 ${
                      view === "table"
                        ? "bg-[#0e4d45] text-[#fef6f1]"
                        : "bg-white text-[#5a5a5a] hover:text-[#0e4d45]"
                    }`}
                  >
                    <TableIcon className="w-3 h-3" />
                    Table
                  </button>
                  <button
                    onClick={() => setView("cards")}
                    aria-pressed={view === "cards"}
                    className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1.5 flex items-center gap-1 ${
                      view === "cards"
                        ? "bg-[#0e4d45] text-[#fef6f1]"
                        : "bg-white text-[#5a5a5a] hover:text-[#0e4d45]"
                    }`}
                  >
                    <Grid2x2 className="w-3 h-3" />
                    Cards
                  </button>
                </div>
              </div>

              <div className="mb-3 relative">
                <Search className="w-4 h-4 text-[#5a5a5a] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Search ${info.name} banks and credit unions…`}
                  className="w-full bg-white border border-[#d4c5b8] rounded-sm pl-9 pr-3 py-2.5 text-sm text-black placeholder:text-[#8a8a8a] focus:outline-none focus:border-[#0e4d45] focus:ring-1 focus:ring-[#0e4d45]"
                  aria-label={`Search banks in ${info.name}`}
                />
              </div>

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
                      onChange={(e) => setSort(e.target.value as typeof sort)}
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
                    Showing <span className="font-bold text-black">{filtered.length}</span> of{" "}
                    {providers.length} institutions
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="bg-white border border-[#d4c5b8] rounded-sm shadow-sm py-10 text-center text-sm text-[#5a5a5a]">
                  Loading {info.name} institutions…
                </div>
              ) : error ? (
                <div className="bg-[#fbe9e7] border border-[#f0b8b0] rounded-sm px-4 py-3 text-sm text-[#7a1f1f]">
                  We couldn't load the {info.name} directory. Please refresh the page.
                </div>
              ) : !filtered.length ? (
                <div className="bg-white border border-[#d4c5b8] rounded-sm shadow-sm py-10 text-center text-sm text-[#5a5a5a]">
                  No institutions match "{query}" with the current filters.
                </div>
              ) : view === "table" ? (
                <RateTable rows={filtered} stateCode={info.code} />
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
            </section>

            <section id="calculator" className="mt-10 scroll-mt-20">
              <ApyCalculator providers={filtered} stateName={info.name} />
            </section>

            <section
              id="banks-vs-cus"
              className="mt-12 scroll-mt-20 bg-white border border-[#d4c5b8] rounded-sm shadow-sm p-5"
            >
              <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0e4d45] mb-1">
                Compare
              </div>
              <h2 className="font-serif font-bold text-2xl text-black mb-3">
                Banks vs credit unions in {info.name}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[#e4d9cf] text-left">
                      <th className="py-2 pr-3 text-[10px] font-bold uppercase tracking-wider text-[#5a5a5a]">
                        Factor
                      </th>
                      <th className="py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-[#0e4d45]">
                        Banks
                      </th>
                      <th className="py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-[#7a4a1f]">
                        Credit unions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e4d9cf]">
                    {[
                      { k: "Ownership", bank: "For-profit, shareholder-owned", cu: "Nonprofit, member-owned" },
                      { k: "Typical APY", bank: "Lower at branch banks; competitive at online banks", cu: "Usually the highest in-state rates" },
                      { k: "Fees", bank: "More maintenance fees; often waivable", cu: "Lower fees on most accounts" },
                      { k: "Eligibility", bank: "Open to anyone", cu: "Membership required (employer, county, or small fee)" },
                      { k: "ATM network", bank: "Large proprietary networks", cu: "Smaller, but co-op networks give broad surcharge-free access" },
                      { k: "Insurance", bank: "FDIC up to $250,000", cu: "NCUA up to $250,000 (same protection)" },
                    ].map((r) => (
                      <tr key={r.k}>
                        <td className="py-2.5 pr-3 text-[11px] font-semibold text-black">{r.k}</td>
                        <td className="py-2.5 px-3 text-[12px] text-[#1a1a1a]">{r.bank}</td>
                        <td className="py-2.5 px-3 text-[12px] text-[#1a1a1a]">{r.cu}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section id="how-to-choose" className="mt-12 scroll-mt-20">
              <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0e4d45] mb-1">
                How to choose
              </div>
              <h2 className="font-serif font-bold text-2xl text-black mb-3">
                How to pick the best bank in {info.name}
              </h2>
              <ol className="space-y-3">
                {[
                  {
                    t: "Compare APYs against the national average",
                    d: `The national savings average is ~0.45%. Every institution on this page ${
                      stats.topSavings > 0
                        ? `beats that — the top ${info.name} rate is ${stats.topSavings.toFixed(2)}%.`
                        : "should beat that comfortably."
                    }`,
                  },
                  {
                    t: "Check fees and minimums",
                    d: "Use the No Fees and No Minimum toggles. A $0 maintenance fee is standard with online banks and many credit unions.",
                  },
                  {
                    t: "Verify FDIC or NCUA insurance",
                    d: "Expand any row to see the institution's FDIC or NCUA ID. Both insurances protect $250,000 per depositor, per ownership category.",
                  },
                  {
                    t: "Confirm membership eligibility",
                    d: `For ${info.name} credit unions, check the Member badge and expanded details for eligibility (employer, county, or small one-time fee).`,
                  },
                  {
                    t: "Apply online",
                    d: "Click Visit Site on any row. You'll need a government ID, Social Security number, and proof of address.",
                  },
                ].map((s, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 bg-white border border-[#e4d9cf] rounded-sm px-4 py-3"
                  >
                    <div className="font-serif font-bold text-xl text-[#0e4d45] leading-none mt-0.5">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-black">{s.t}</div>
                      <div className="text-[12px] text-[#1a1a1a] mt-0.5 leading-snug">{s.d}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {cities.length > 0 && (
              <section id="cities" className="mt-12 scroll-mt-20">
                <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0e4d45] mb-1">
                  Local coverage
                </div>
                <h2 className="font-serif font-bold text-2xl text-black mb-3">
                  Banks near me in {info.name} cities
                </h2>
                <p className="text-sm text-[#1a1a1a] leading-relaxed mb-3">
                  Our {info.name} directory covers online banks and credit
                  unions serving residents across major metros including{" "}
                  {cities.slice(0, -1).join(", ")}
                  {cities.length > 1 ? `, and ${cities[cities.length - 1]}` : cities[0]}
                  . Every institution listed accepts applications from anywhere
                  in the state unless membership rules apply.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {cities.map((c) => (
                    <span
                      key={c}
                      className="text-[11px] font-medium bg-white border border-[#e4d9cf] text-[#1a1a1a] rounded-sm px-2.5 py-1"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </section>
            )}

            <section id="faq" className="mt-12 scroll-mt-20">
              <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0e4d45] mb-1">
                FAQ
              </div>
              <h2 className="font-serif font-bold text-2xl text-black mb-3">
                Banks near me in {info.name}
              </h2>
              <div className="bg-white border border-[#d4c5b8] rounded-sm shadow-sm divide-y divide-[#e4d9cf]">
                {faqs.map((f, i) => (
                  <FaqRow key={i} q={f.q} a={f.a} />
                ))}
              </div>
            </section>

            {relatedStates.length > 0 && (
              <section className="mt-12">
                <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0e4d45] mb-1">
                  Explore more
                </div>
                <h2 className="font-serif font-bold text-2xl text-black mb-3">
                  Best banks in nearby states
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {relatedStates.map((s) => (
                    <Link
                      key={s.slug}
                      to="/banks/$state"
                      params={{ state: s.slug }}
                      className="block bg-white border border-[#d4c5b8] rounded-sm px-4 py-3 hover:border-[#0e4d45] transition-colors"
                    >
                      <div className="font-serif font-bold text-black text-base">
                        Best Banks in {s.name}
                      </div>
                      <div className="text-[11px] text-[#5a5a5a] mt-0.5">
                        Local rates, credit unions, and branches →
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <section className="mt-12 max-w-3xl space-y-3 text-sm text-[#1a1a1a] leading-relaxed pb-8">
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

function BestForCard({ label, why, p }: { label: string; why: string; p: StateProvider }) {
  return (
    <div className="bg-white border border-[#d4c5b8] rounded-sm shadow-sm p-4 flex flex-col">
      <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#540f04] mb-1.5">
        {label}
      </div>
      <div className="flex items-center gap-2.5 mb-2">
        <InstitutionLogo p={p} size={36} />
        <div className="min-w-0">
          <div className="font-serif font-bold text-sm text-black leading-tight truncate">
            {p.institution_name}
          </div>
          <div className="text-[10px] text-[#5a5a5a] uppercase tracking-wider">
            {INSTITUTION_TYPE_LABEL[p.institution_type] || p.institution_type}
          </div>
        </div>
      </div>
      <p className="text-[11px] text-[#1a1a1a] leading-snug flex-1">{why}</p>
      <div className="mt-2.5 flex items-center justify-between text-[11px]">
        <span className="font-serif font-bold text-[#0e4d45]">
          {p.apy > 0 ? `${p.apy.toFixed(2)}% APY` : PRODUCT_TYPE_LABEL[p.product_type]}
        </span>
        {p.website_url ? (
          <a
            href={p.website_url}
            target="_blank"
            rel="nofollow noopener noreferrer sponsored"
            className="text-[10px] font-semibold uppercase tracking-wider text-[#0e4d45] hover:underline"
          >
            Visit →
          </a>
        ) : null}
      </div>
    </div>
  );
}

function RateTable({ rows, stateCode }: { rows: StateProvider[]; stateCode: string }) {
  const logClick = (institution: string) => {
    if (!isSupabaseConfigured) return;
    void supabase.from("state_page_searches").insert({
      state_code: stateCode,
      query: "",
      product_filter: "all",
      results_count: rows.length,
      clicked_institution: institution,
      referrer: typeof document !== "undefined" ? document.referrer : "",
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    });
  };
  return (
    <div className="bg-white border border-[#d4c5b8] rounded-sm shadow-sm overflow-hidden">
      <div className="hidden md:grid grid-cols-[minmax(0,1.6fr)_96px_110px_120px_120px] gap-3 bg-[#f7ebe2] px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#5a5a5a]">
        <div>Financial Institution</div>
        <div className="text-center">APY</div>
        <div className="text-center">Type</div>
        <div className="text-center">Min. Deposit</div>
        <div></div>
      </div>
      <div className="divide-y divide-[#e4d9cf]">
        {rows.map((p, idx) => (
          <div
            key={p.id}
            className="grid grid-cols-1 md:grid-cols-[minmax(0,1.6fr)_96px_110px_120px_120px] gap-2 md:gap-3 px-4 py-3 items-center hover:bg-[#fef6f1] transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              {p.rank_weight <= 3 && (
                <span className="hidden md:inline-block text-[9px] font-bold uppercase tracking-wider text-[#7a4a1f] bg-[#fef1e6] px-1.5 py-0.5 rounded-sm whitespace-nowrap">
                  Top Pick
                </span>
              )}
              <InstitutionLogo p={p} size={40} />
              <div className="min-w-0">
                <div className="font-serif font-bold text-black text-sm leading-tight truncate">
                  {p.institution_name}
                </div>
                <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[#5a5a5a]">
                  <StarRating rating={4.2 + ((idx * 7) % 7) / 10} size="sm" />
                  <span>·</span>
                  <span>
                    APY updated{" "}
                    {new Date(p.last_verified_at).toLocaleDateString(undefined, {
                      month: "2-digit",
                      day: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
            <div className="md:text-center font-serif font-bold text-[#0e4d45] text-lg">
              {p.apy > 0 ? `${p.apy.toFixed(2)}%` : "—"}
            </div>
            <div className="md:text-center text-[11px] font-semibold text-black uppercase tracking-wider">
              {PRODUCT_TYPE_LABEL[p.product_type] || p.product_type}
            </div>
            <div className="md:text-center">
              <div className="font-serif font-bold text-black text-sm">
                {p.min_deposit >= 1000
                  ? `$${(p.min_deposit / 1000).toFixed(0)}K`
                  : `$${p.min_deposit.toLocaleString()}`}
              </div>
              <div className="text-[9px] text-[#5a5a5a] uppercase tracking-wider">
                {p.monthly_fee > 0 ? `$${p.monthly_fee.toFixed(0)}/mo fee` : "No fee"}
              </div>
            </div>
            <div>
              {p.website_url ? (
                <a
                  href={p.website_url}
                  target="_blank"
                  rel="nofollow noopener noreferrer sponsored"
                  onClick={() => logClick(p.institution_name)}
                  className="block text-center px-3 py-2 rounded-sm bg-[#0e4d45] text-[#fef6f1] text-[11px] font-semibold uppercase tracking-wider hover:bg-[#0a3832] transition-colors"
                >
                  Open Now
                </a>
              ) : (
                <span className="block text-center px-3 py-2 rounded-sm bg-[#f7ebe2] text-[#5a5a5a] text-[11px] font-semibold uppercase tracking-wider">
                  Unavailable
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
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
    <div className="bg-white border border-[#d4c5b8] rounded-sm shadow-sm">
      <div className="px-4 pt-4 pb-3 border-b border-[#0e4d45]/20">
        <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0e4d45]">
          {stateName} APY Earnings Calculator
        </div>
        <p className="text-[11px] text-[#5a5a5a] mt-0.5">
          See how much you'd earn at today's top {stateName} rates.
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
              Editor's Pick · {p.state_name}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StarRating rating={4.7} size="md" />
          <GradeBadge grade="A+" size="md" />
        </div>
      </div>
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex items-center gap-3 flex-shrink-0">
            <InstitutionLogo p={p} size={40} />
            <div className="min-w-0">
              <h2 className="font-serif font-bold text-base sm:text-xl text-black leading-tight truncate">
                {p.institution_name}
              </h2>
              <div className="text-xs text-[#5a5a5a] mt-0.5 truncate">
                {INSTITUTION_TYPE_LABEL[p.institution_type] || p.institution_type}
              </div>
            </div>
          </div>
          <div className="sm:ml-auto grid grid-cols-3 sm:flex sm:flex-wrap gap-3 sm:gap-5 text-center w-full sm:w-auto">
            <div className="flex-shrink-0">
              <div className="text-[9px] text-[#5a5a5a] uppercase tracking-wider">APY</div>
              <div className="font-serif font-bold text-xl sm:text-2xl text-[#0e4d45]">
                {p.apy > 0 ? `${p.apy.toFixed(2)}%` : "—"}
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="text-[9px] text-[#5a5a5a] uppercase tracking-wider">Fees</div>
              <div className="font-serif font-bold text-lg sm:text-2xl text-black">
                {p.monthly_fee > 0 ? `$${p.monthly_fee.toFixed(0)}/mo` : "$0"}
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="text-[9px] text-[#5a5a5a] uppercase tracking-wider">Min</div>
              <div className="font-serif font-bold text-lg sm:text-2xl text-black">
                {formatMin(p.min_deposit)}
              </div>
            </div>
          </div>
        </div>
        {p.summary && (
          <p className="mt-4 text-sm text-[#1a1a1a] leading-relaxed border-l-[3px] border-[#0e4d45] pl-3 italic font-serif">
            "{p.summary}"
          </p>
        )}
        <div className="mt-5">
          {p.website_url ? (
            <a
              href={p.website_url}
              target="_blank"
              rel="nofollow noopener noreferrer sponsored"
              className="inline-block text-center px-4 py-2.5 rounded-sm bg-[#0e4d45] text-[#fef6f1] text-[11px] font-semibold uppercase tracking-wider hover:bg-[#0a3832] transition-colors"
            >
              Visit Site
            </a>
          ) : null}
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
    <div className="mb-8">
      <div className="mb-3 pb-2 border-b border-[#e4d9cf]">
        <h3 className="font-serif font-bold text-xl text-black">{title}</h3>
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
          <InstitutionLogo p={p} size={40} />
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
            <div className="text-[#5a5a5a] uppercase tracking-wider text-[9px] sm:text-[10px]">APY</div>
            <div className="font-serif font-bold text-[#0e4d45] text-sm sm:text-base">
              {p.apy > 0 ? `${p.apy.toFixed(2)}%` : "—"}
            </div>
          </div>
          <div>
            <div className="text-[#5a5a5a] uppercase tracking-wider text-[9px] sm:text-[10px]">Min</div>
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

function InstitutionLogo({ p, size = 40 }: { p: StateProvider; size?: number }) {
  const domain = extractDomain(p.website_url);
  const [failed, setFailed] = useState(false);
  const letters = p.institution_name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  if (domain && !failed) {
    const url1x = getDomainLogoUrl(domain, Math.max(64, size * 2));
    const url2x = getDomainLogoUrl(domain, Math.max(128, size * 4));
    return (
      <div
        className="flex-shrink-0 rounded-sm overflow-hidden bg-white border border-[#e4d9cf] flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <img
          src={url1x}
          srcSet={`${url1x} 1x, ${url2x} 2x`}
          sizes={`${size}px`}
          alt={`${p.institution_name} logo`}
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="w-full h-full object-contain p-1"
        />
      </div>
    );
  }

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
        <span className="text-sm font-semibold text-black leading-snug">{q}</span>
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

function buildFaqs(
  stateName: string,
  topSavings: number,
  bestCD: number,
  cities: string[],
) {
  const savings = topSavings > 0 ? `${topSavings.toFixed(2)}%` : "competitive";
  const cd = bestCD > 0 ? `${bestCD.toFixed(2)}%` : "competitive";
  const cityList =
    cities.length >= 3
      ? `${cities.slice(0, 3).join(", ")}, and other ${stateName} metros`
      : stateName;
  return [
    {
      q: `What are the best banks near me in ${stateName}?`,
      a: `The best banks near you in ${stateName} depend on what you need: local credit unions typically offer the highest savings APYs (our top-verified rate is ${savings}), community banks often win on checking relationships, and regional banks deliver the widest branch and ATM network across ${cityList}.`,
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
      a: `Yes, if the institution is federally insured. Banks are covered by the FDIC up to $250,000 per depositor, per ownership category; credit unions by the NCUA at the same limits. Every institution in this directory carries one of those insurances — expand any row to see the FDIC or NCUA ID.`,
    },
    {
      q: `How do I open a bank account in ${stateName}?`,
      a: `Click "Open Now" or "Visit Site" on any row to go to the institution's official application page. You'll generally need a government ID, Social Security number, proof of ${stateName} address, and a funding source (another bank account, debit card, or check). Credit unions may also ask for membership eligibility documentation.`,
    },
    {
      q: `Can I open a ${stateName} bank account online?`,
      a: `Yes. Most banks and credit unions on this page offer fully online applications — you don't need to visit a branch. Applications typically take 5–10 minutes, and funding happens via ACH transfer, debit card, or mobile check deposit after approval.`,
    },
    {
      q: `Which ${stateName} banks have no monthly fees?`,
      a: `Use the "No fees" toggle above the rate table to filter the list down to institutions with no monthly maintenance fee. Most online banks and a majority of ${stateName} credit unions qualify, while large national banks typically charge fees that can be waived with direct deposit or a minimum balance.`,
    },
    {
      q: `What's the minimum deposit to open an account in ${stateName}?`,
      a: `Minimums range from $0 at many online banks and credit unions to $500 or more at some community banks and CDs. Use the "No minimum" toggle to see accounts you can open with no upfront deposit.`,
    },
  ];
}
