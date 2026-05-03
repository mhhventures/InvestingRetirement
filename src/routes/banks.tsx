import { createFileRoute, Outlet, useMatches, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, TrendingUp, MapPin, CircleCheck as CheckCircle2 } from "lucide-react";
import { US_STATES, type StateInfo } from "@/lib/states-data";
import { useSeo, SITE_URL } from "@/lib/seo";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getDomainLogoUrl, extractDomain } from "@/lib/product-icons";

export const Route = createFileRoute("/banks")({
  component: BanksLayout,
});

function BanksLayout() {
  const matches = useMatches();
  const isChildRoute = matches.some(
    (m) =>
      m.routeId === "/banks/$state" || m.routeId === "/banks/$state/$city",
  );
  if (isChildRoute) return <Outlet />;
  return <BanksIndex />;
}

type StateStat = {
  state_code: string;
  institution_count: number;
  top_savings_apy: number;
  top_apy_any: number;
  last_verified_at: string | null;
};

type TopRate = {
  id: string;
  state_code: string;
  state_name: string;
  institution_name: string;
  institution_type: string;
  product_type: string;
  apy: number;
  min_deposit: number;
  website_url: string | null;
};

const REGIONS: { id: string; label: string; codes: string[] }[] = [
  {
    id: "northeast",
    label: "Northeast",
    codes: ["CT", "ME", "MA", "NH", "NJ", "NY", "PA", "RI", "VT"],
  },
  {
    id: "midwest",
    label: "Midwest",
    codes: ["IL", "IN", "IA", "KS", "MI", "MN", "MO", "NE", "ND", "OH", "SD", "WI"],
  },
  {
    id: "south",
    label: "South",
    codes: [
      "AL", "AR", "DE", "FL", "GA", "KY", "LA", "MD", "MS", "NC", "OK", "SC",
      "TN", "TX", "VA", "WV",
    ],
  },
  {
    id: "west",
    label: "West",
    codes: [
      "AK", "AZ", "CA", "CO", "HI", "ID", "MT", "NV", "NM", "OR", "UT", "WA", "WY",
    ],
  },
];

const PRODUCT_LABEL: Record<string, string> = {
  savings: "Savings",
  checking: "Checking",
  cd: "CD",
  money_market: "Money Market",
};

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function BanksIndex() {
  const [stats, setStats] = useState<Record<string, StateStat>>({});
  const [topRates, setTopRates] = useState<TopRate[]>([]);
  const [query, setQuery] = useState("");
  const [activeRegion, setActiveRegion] = useState<string>("all");

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    (async () => {
      const [{ data: statRows }, { data: rateRows }] = await Promise.all([
        supabase.rpc("state_directory_stats"),
        supabase.rpc("top_rates_this_month", { p_limit: 6 }),
      ]);
      if (cancelled) return;
      const map: Record<string, StateStat> = {};
      for (const r of (statRows as StateStat[] | null) || []) {
        map[r.state_code] = r;
      }
      setStats(map);
      setTopRates((rateRows as TopRate[] | null) || []);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const available = useMemo(
    () => US_STATES.filter((s) => s.available),
    [],
  );
  const coming = useMemo(
    () => US_STATES.filter((s) => !s.available),
    [],
  );

  const topSavingsRange = useMemo(() => {
    const vals = Object.values(stats)
      .map((s) => Number(s.top_savings_apy))
      .filter((v) => v > 0);
    if (!vals.length) return { min: 0, max: 0 };
    return { min: Math.min(...vals), max: Math.max(...vals) };
  }, [stats]);

  const filteredStates = useMemo(() => {
    const q = query.trim().toLowerCase();
    const region = REGIONS.find((r) => r.id === activeRegion);
    const list: StateInfo[] = [...available, ...coming];
    return list.filter((s) => {
      if (q && !s.name.toLowerCase().includes(q) && !s.code.toLowerCase().includes(q))
        return false;
      if (region && !region.codes.includes(s.code)) return false;
      return true;
    });
  }, [query, activeRegion, available, coming]);

  const visibleAvailable = filteredStates.filter((s) => s.available);
  const visibleComing = filteredStates.filter((s) => !s.available);

  useSeo({
    title: `Best Banks & Credit Unions by State ${new Date().getFullYear()} — Local Rates Directory`,
    description:
      topSavingsRange.max > 0
        ? `Compare the best local credit unions and community banks in every state. Top savings APYs from ${topSavingsRange.min.toFixed(
            2,
          )}% to ${topSavingsRange.max.toFixed(
            2,
          )}%, verified monthly. Browse by state or region.`
        : "Find the best local credit unions, community banks, state banks, and regional providers near you. Browse by state for current APYs, fees, and membership details.",
    path: "/banks",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Best Banks by State",
        url: `${SITE_URL}/banks`,
        description:
          "State-by-state directory of credit unions, community banks, and regional providers with verified APYs, fees, and membership eligibility.",
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Banks",
            item: `${SITE_URL}/banks`,
          },
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Available State Directories",
        numberOfItems: available.length,
        itemListElement: available.map((s, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: `Best Banks in ${s.name}`,
          url: `${SITE_URL}/banks/${s.slug}`,
        })),
      },
    ],
  });

  const statsReady = Object.keys(stats).length > 0;

  return (
    <div className="bg-[#fef6f1]">
      <div className="border-b border-[#e4d9cf] bg-[#fef6f1]">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 text-[10px] sm:text-[11px] text-black/50 overflow-x-auto">
          <a href="/" className="hover:text-[#0e4d45]">Home</a>
          <span className="mx-1 sm:mx-1.5 text-black/30">/</span>
          <span className="text-black font-semibold">Banks</span>
        </div>
      </div>

      <section className="border-b border-[#e4d9cf]">
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-10">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0e4d45] mb-2">
            Local Banking Directory · {new Date().getFullYear()}
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-bold leading-[1.05] text-black mb-3 max-w-4xl">
            Best Banks & Credit Unions by State
          </h1>
          <p className="text-sm md:text-base text-[#1a1a1a] leading-relaxed max-w-2xl">
            A state-by-state directory of the strongest local credit unions,
            community banks, and regional providers. Compare verified APYs,
            minimums, fees, and membership rules before you open an account.
          </p>

          {statsReady && (
            <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl">
              <Stat
                label="States covered"
                value={available.length.toString()}
              />
              <Stat
                label="Institutions"
                value={Object.values(stats)
                  .reduce((n, s) => n + Number(s.institution_count), 0)
                  .toString()}
              />
              <Stat
                label="Top APY"
                value={`${topSavingsRange.max.toFixed(2)}%`}
              />
            </div>
          )}
        </div>
      </section>

      {topRates.length > 0 && (
        <section className="border-b border-[#e4d9cf] bg-white">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0e4d45] mb-1">
                  <TrendingUp className="w-3 h-3" />
                  Top rates this month
                </div>
                <h2 className="font-serif text-2xl font-bold text-black">
                  Best APYs across our directory
                </h2>
              </div>
              <div className="text-[10px] text-[#5a5a5a] font-medium">
                Verified {formatDate(new Date().toISOString())}
              </div>
            </div>
            <ol className="divide-y divide-[#e4d9cf] border border-[#e4d9cf] rounded-sm">
              {topRates.map((r, i) => {
                const domain = r.website_url ? extractDomain(r.website_url) : null;
                const logo = domain ? getDomainLogoUrl(domain) : "";
                const stateSlug = US_STATES.find(
                  (s) => s.code === r.state_code,
                )?.slug;
                const content = (
                  <>
                    <div className="w-6 text-center font-serif font-bold text-[#5a5a5a] text-sm">
                      {i + 1}
                    </div>
                    <div className="w-10 h-10 shrink-0 border border-[#e4d9cf] rounded-sm bg-white flex items-center justify-center overflow-hidden">
                      {logo ? (
                        <img
                          src={logo}
                          alt=""
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-[10px] font-bold text-[#5a5a5a]">
                          {r.institution_name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-serif font-bold text-black text-sm leading-tight truncate group-hover:text-[#0e4d45]">
                        {r.institution_name}
                      </div>
                      <div className="text-[10px] text-[#5a5a5a] uppercase tracking-wider">
                        {PRODUCT_LABEL[r.product_type] || r.product_type} ·{" "}
                        {r.state_name}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-serif font-bold text-[#0e4d45] text-lg leading-none">
                        {Number(r.apy).toFixed(2)}%
                      </div>
                      <div className="text-[9px] text-[#5a5a5a] uppercase tracking-wider">
                        APY
                      </div>
                    </div>
                    <div className="shrink-0 text-[#0e4d45] text-base group-hover:translate-x-0.5 transition-transform">
                      &rarr;
                    </div>
                  </>
                );
                return (
                  <li key={`${r.state_code}-${r.institution_name}`}>
                    {stateSlug ? (
                      <Link
                        to="/banks/$state"
                        params={{ state: stateSlug }}
                        hash={`institution-${r.id}`}
                        aria-label={`View ${r.institution_name} in ${r.state_name}`}
                        className="group flex items-center gap-3 p-3 hover:bg-[#fef6f1] focus:bg-[#fef6f1] outline-none"
                      >
                        {content}
                      </Link>
                    ) : (
                      <div className="group flex items-center gap-3 p-3">
                        {content}
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      )}

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-5 flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#5a5a5a] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search states (e.g. California, TX)"
              className="w-full bg-white border border-[#d4c5b8] rounded-sm pl-9 pr-3 py-2.5 text-sm text-black placeholder:text-[#8a8a8a] focus:outline-none focus:border-[#0e4d45] focus:ring-1 focus:ring-[#0e4d45]"
              aria-label="Search states"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <RegionChip
              active={activeRegion === "all"}
              onClick={() => setActiveRegion("all")}
              label="All regions"
            />
            {REGIONS.map((r) => (
              <RegionChip
                key={r.id}
                active={activeRegion === r.id}
                onClick={() => setActiveRegion(r.id)}
                label={r.label}
              />
            ))}
          </div>
        </div>

        {visibleAvailable.length > 0 && (
          <div className="mb-10">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="font-serif text-xl font-bold text-black">
                Available states
              </h2>
              <div className="text-[11px] text-[#5a5a5a] font-medium">
                {visibleAvailable.length} of {available.length}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {visibleAvailable.map((s) => {
                const stat = stats[s.code];
                return (
                  <Link
                    key={s.code}
                    to="/banks/$state"
                    params={{ state: s.slug }}
                    className="bg-white border border-[#e4d9cf] rounded-sm p-4 hover:border-[#0e4d45] hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#0e4d45]">
                          {s.code}
                        </div>
                        <div className="font-serif text-lg font-bold text-black leading-tight">
                          {s.name}
                        </div>
                      </div>
                      {stat && Number(stat.top_savings_apy) > 0 && (
                        <div className="text-right shrink-0 ml-2">
                          <div className="font-serif font-bold text-[#0e4d45] text-lg leading-none">
                            {Number(stat.top_savings_apy).toFixed(2)}%
                          </div>
                          <div className="text-[9px] text-[#5a5a5a] uppercase tracking-wider">
                            Top APY
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[#5a5a5a] uppercase tracking-wider">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {stat
                          ? `${stat.institution_count} institutions`
                          : "—"}
                      </span>
                      {stat?.last_verified_at && (
                        <span className="inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-[#0e4d45]" />
                          {formatDate(stat.last_verified_at)}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {visibleComing.length > 0 && (
          <div>
            <h2 className="font-serif text-xl font-bold text-black mb-3">
              Coming soon
            </h2>
            <div className="flex flex-wrap gap-2">
              {visibleComing.map((s) => (
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
        )}

        {!visibleAvailable.length && !visibleComing.length && (
          <div className="bg-white border border-[#d4c5b8] rounded-sm py-10 text-center text-sm text-[#5a5a5a]">
            No states match "{query}" in the selected region.
          </div>
        )}

        <section className="mt-12 grid md:grid-cols-3 gap-4">
          <MethodologyCard
            title="Verified monthly"
            body="Every state directory lists the advertised APY, monthly fee, and minimum opening deposit we confirmed on the institution's own rate page this month."
          />
          <MethodologyCard
            title="Local wins on rewards"
            body="National online banks often top raw savings APY, but local credit unions and community banks frequently win on checking rewards, CD specials, and in-branch service."
          />
          <MethodologyCard
            title="Membership made clear"
            body="Credit union eligibility varies. We call out who qualifies — residency, employer groups, or a small one-time association fee — so you can skip the ones you can't join."
          />
        </section>

        <p className="mt-8 text-xs text-[#5a5a5a] italic max-w-3xl">
          Rates and terms are subject to change. Confirm current figures
          directly with each institution before opening an account. FDIC or
          NCUA insurance applies to the institution, not the product tier.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-[#e4d9cf] rounded-sm px-3 py-2">
      <div className="font-serif text-xl md:text-2xl font-bold text-[#0e4d45] leading-tight">
        {value}
      </div>
      <div className="text-[9px] md:text-[10px] text-[#5a5a5a] uppercase tracking-wider font-bold">
        {label}
      </div>
    </div>
  );
}

function RegionChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1.5 rounded-sm text-[11px] font-semibold uppercase tracking-wider transition-colors ${
        active
          ? "bg-[#0e4d45] text-[#fef6f1]"
          : "bg-white border border-[#e4d9cf] text-black hover:border-[#0e4d45] hover:text-[#0e4d45]"
      }`}
    >
      {label}
    </button>
  );
}

function MethodologyCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-white border border-[#e4d9cf] rounded-sm p-4">
      <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0e4d45] mb-1">
        Methodology
      </div>
      <h3 className="font-serif font-bold text-black text-base mb-2">
        {title}
      </h3>
      <p className="text-[13px] text-[#1a1a1a] leading-relaxed">{body}</p>
    </div>
  );
}
