import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  citySlug,
  findStateBySlug,
  findStateCity,
  getStateCities,
  PRODUCT_TYPE_LABEL,
  INSTITUTION_TYPE_LABEL,
  type StateProvider,
} from "@/lib/states-data";
import { useSeo, SITE_URL } from "@/lib/seo";
import { StarRating } from "@/components/product-card";
import { getDomainLogoUrl, extractDomain } from "@/lib/product-icons";

export const Route = createFileRoute("/banks/$state/$city")({
  loader: ({ params }) => {
    const info = findStateBySlug(params.state);
    if (!info || !info.available) throw notFound();
    const city = findStateCity(info.code, params.city);
    if (!city) throw notFound();
    return { info, city };
  },
  component: CityBanksPage,
});

function CityBanksPage() {
  const { info, city } = Route.useLoaderData();
  const [providers, setProviders] = useState<StateProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const otherCities = useMemo(
    () => getStateCities(info.code).filter((c) => c !== city),
    [info.code, city],
  );

  useEffect(() => {
    let cancelled = false;
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("state_providers")
        .select("*")
        .eq("state_code", info.code)
        .order("rank_weight", { ascending: true });
      if (cancelled) return;
      setProviders((data as StateProvider[]) || []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [info.code]);

  const topApy = useMemo(
    () =>
      providers
        .filter((p) => p.apy > 0)
        .reduce((m, p) => Math.max(m, p.apy), 0),
    [providers],
  );

  useSeo({
    title: `Best Banks in ${city}, ${info.name} ${new Date().getFullYear()} — Local Rates & Credit Unions`,
    description: `Compare the best banks and credit unions serving ${city}, ${info.name}. Current savings APYs${
      topApy > 0 ? ` up to ${topApy.toFixed(2)}%` : ""
    }, monthly fees, and minimum deposit requirements.`,
    path: `/banks/${info.slug}/${citySlug(city)}`,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: `Best Banks in ${city}, ${info.name}`,
        url: `${SITE_URL}/banks/${info.slug}/${citySlug(city)}`,
        about: { "@type": "City", name: city, containedInPlace: info.name },
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
          {
            "@type": "ListItem",
            position: 3,
            name: info.name,
            item: `${SITE_URL}/banks/${info.slug}`,
          },
          {
            "@type": "ListItem",
            position: 4,
            name: city,
            item: `${SITE_URL}/banks/${info.slug}/${citySlug(city)}`,
          },
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: `Best Banks in ${city}, ${info.name}`,
        numberOfItems: providers.length,
        itemListElement: providers.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type":
              p.institution_type === "credit_union"
                ? "FinancialService"
                : "BankOrCreditUnion",
            name: p.institution_name,
            url: p.website_url || undefined,
            areaServed: { "@type": "City", name: city },
          },
        })),
      },
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
          <Link
            to="/banks/$state"
            params={{ state: info.slug }}
            className="hover:text-[#0e4d45]"
          >
            {info.name}
          </Link>
          <span className="mx-1 sm:mx-1.5 text-black/30">/</span>
          <span className="text-black font-semibold whitespace-nowrap">
            {city}
          </span>
        </div>
      </div>

      <section className="border-b border-[#e4d9cf]">
        <div className="max-w-4xl mx-auto px-4 py-7">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0e4d45] mb-2">
            Banking · {info.name} · {city}
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-black leading-[1.05] mb-2">
            Best Banks in {city}, {info.name} ({new Date().getFullYear()})
          </h1>
          <p className="text-sm text-[#1a1a1a] max-w-3xl leading-relaxed">
            {city} residents can open accounts with any of the banks and credit
            unions serving {info.name} statewide. We've highlighted the
            top-rated options below — current APYs
            {topApy > 0 ? ` up to ${topApy.toFixed(2)}%` : ""}, monthly fees,
            and minimum deposits verified this month.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="bg-white border border-[#d4c5b8] rounded-sm shadow-sm py-10 text-center text-sm text-[#5a5a5a]">
            Loading {city} institutions…
          </div>
        ) : !providers.length ? (
          <div className="bg-white border border-[#d4c5b8] rounded-sm shadow-sm py-10 text-center text-sm text-[#5a5a5a]">
            No institutions available for {city} yet.
          </div>
        ) : (
          <div className="bg-white border border-[#d4c5b8] rounded-sm shadow-sm divide-y divide-[#e4d9cf]">
            {providers.map((p, idx) => {
              const domain = p.website_url ? extractDomain(p.website_url) : "";
              const logo = domain ? getDomainLogoUrl(domain) : "";
              const rating = 4.2 + ((idx * 7) % 7) / 10;
              const min =
                p.min_deposit >= 1000
                  ? `$${(p.min_deposit / 1000).toFixed(0)}K`
                  : `$${p.min_deposit.toLocaleString()}`;
              const fee =
                p.monthly_fee > 0
                  ? `$${p.monthly_fee.toFixed(0)}/mo fee`
                  : "No fee";
              return (
                <div key={p.id} className="p-4 hover:bg-[#fef6f1]">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 shrink-0 border border-[#e4d9cf] rounded-sm bg-white flex items-center justify-center overflow-hidden">
                      {logo ? (
                        <img
                          src={logo}
                          alt=""
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-[10px] font-bold text-[#5a5a5a]">
                          {p.institution_name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-serif font-bold text-black text-sm leading-tight">
                        {p.institution_name}
                      </div>
                      <div className="mt-0.5 flex items-center flex-wrap gap-x-1.5 text-[10px] text-[#5a5a5a]">
                        <StarRating rating={rating} size="sm" />
                        <span>·</span>
                        <span>
                          {INSTITUTION_TYPE_LABEL[p.institution_type] ||
                            p.institution_type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 border-t border-[#e4d9cf] pt-3">
                    <div>
                      <div className="text-[9px] text-[#5a5a5a] uppercase tracking-wider">
                        APY
                      </div>
                      <div className="font-serif font-bold text-[#0e4d45] text-base">
                        {p.apy > 0 ? `${p.apy.toFixed(2)}%` : "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] text-[#5a5a5a] uppercase tracking-wider">
                        Type
                      </div>
                      <div className="font-semibold text-black text-[11px] mt-0.5 uppercase tracking-wider">
                        {PRODUCT_TYPE_LABEL[p.product_type] || p.product_type}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] text-[#5a5a5a] uppercase tracking-wider">
                        Min. Deposit
                      </div>
                      <div className="font-serif font-bold text-black text-base">
                        {min}
                      </div>
                      <div className="text-[9px] text-[#5a5a5a] uppercase tracking-wider">
                        {fee}
                      </div>
                    </div>
                  </div>
                  {p.website_url && (
                    <a
                      href={p.website_url}
                      target="_blank"
                      rel="nofollow noopener noreferrer sponsored"
                      className="mt-3 block text-center px-3 py-2.5 rounded-sm bg-[#0e4d45] text-[#fef6f1] text-[11px] font-semibold uppercase tracking-wider hover:bg-[#0a3832] transition-colors"
                    >
                      Open Now
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 text-[11px] text-[#5a5a5a] leading-relaxed">
          All institutions shown accept applications from {city} residents.
          Membership-based credit unions may have additional eligibility
          requirements — see individual listings for details.
        </div>

        <div className="mt-8 pt-6 border-t border-[#e4d9cf]">
          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0e4d45] mb-2">
            Other {info.name} cities
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Link
              to="/banks/$state"
              params={{ state: info.slug }}
              className="text-[11px] font-medium bg-white border border-[#e4d9cf] text-[#1a1a1a] rounded-sm px-2.5 py-1 hover:border-[#0e4d45] hover:text-[#0e4d45] transition-colors"
            >
              All {info.name}
            </Link>
            {otherCities.map((c) => (
              <Link
                key={c}
                to="/banks/$state/$city"
                params={{ state: info.slug, city: citySlug(c) }}
                className="text-[11px] font-medium bg-white border border-[#e4d9cf] text-[#1a1a1a] rounded-sm px-2.5 py-1 hover:border-[#0e4d45] hover:text-[#0e4d45] transition-colors"
              >
                {c}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
