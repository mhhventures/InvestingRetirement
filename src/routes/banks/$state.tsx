import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  findStateBySlug,
  INSTITUTION_TYPE_LABEL,
  PRODUCT_TYPE_LABEL,
  type StateProvider,
} from "@/lib/states-data";
import { useSeo, SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/banks/$state")({
  loader: ({ params }) => {
    const info = findStateBySlug(params.state);
    if (!info || !info.available) throw notFound();
    return { info };
  },
  component: StateBanksPage,
});

function StateBanksPage() {
  const { info } = Route.useLoaderData();
  const [providers, setProviders] = useState<StateProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useSeo({
    title: `Best Banks & Credit Unions in ${info.name} | Local Directory`,
    description: `Top local credit unions, community banks, and regional providers in ${info.name}. Compare advertised APYs, fees, minimums, and membership rules near you.`,
    path: `/banks/${info.slug}`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `Best Banks in ${info.name}`,
      url: `${SITE_URL}/banks/${info.slug}`,
      about: {
        "@type": "Place",
        name: info.name,
      },
    },
  });

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
      if (err) {
        setError(err.message);
      } else {
        setProviders((data as StateProvider[]) || []);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [info.code]);

  const byType = providers.reduce<Record<string, StateProvider[]>>((acc, p) => {
    (acc[p.institution_type] ||= []).push(p);
    return acc;
  }, {});

  const typeOrder = [
    "credit_union",
    "community_bank",
    "state_bank",
    "regional_bank",
  ];

  return (
    <div className="bg-[#fef6f1]">
      <section className="border-b border-[#e4d9cf]">
        <div className="max-w-4xl mx-auto px-4 pt-5 pb-5 sm:pt-8 sm:pb-6">
          <div className="flex items-center gap-3 mb-4">
            <a
              href="/banks"
              className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0e4d45] hover:underline"
            >
              &larr; All States
            </a>
            <span className="inline-flex items-center gap-1.5 bg-[#eaf1ef] text-[#0e4d45] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm">
              <span
                className="w-1.5 h-1.5 rounded-full bg-[#0e4d45]"
                aria-hidden
              />
              State Directory
            </span>
          </div>
          <h1 className="font-serif text-[26px] leading-[1.1] sm:text-4xl font-bold text-black mb-2">
            Best banks & credit unions in {info.name}
          </h1>
          <p className="text-[13px] sm:text-sm text-[#1a1a1a] leading-relaxed max-w-2xl">
            A curated shortlist of local credit unions, community banks, and
            regional providers in {info.name} worth comparing. Advertised APYs
            below are our last-verified figures &mdash; always confirm current
            rates on each institution&rsquo;s site before applying.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {loading && (
          <div className="text-sm text-[#5a5a5a] py-10 text-center">
            Loading providers&hellip;
          </div>
        )}
        {error && !loading && (
          <div className="text-sm text-[#7a1f1f] bg-[#fbe9e7] border border-[#f0b8b0] rounded px-4 py-3">
            We couldn&rsquo;t load the provider list for {info.name}. Please
            refresh the page or check back later.
          </div>
        )}
        {!loading && !error && providers.length === 0 && (
          <div className="text-sm text-[#5a5a5a]">
            No providers are listed for {info.name} yet.
          </div>
        )}

        {!loading && !error && providers.length > 0 && (
          <div className="space-y-10">
            {typeOrder
              .filter((t) => byType[t]?.length)
              .map((type) => (
                <section key={type}>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-black mb-4 border-b border-[#e4d9cf] pb-2">
                    {INSTITUTION_TYPE_LABEL[type] || type}s
                  </h2>
                  <div className="space-y-3">
                    {byType[type].map((p) => (
                      <ProviderCard key={p.id} p={p} />
                    ))}
                  </div>
                </section>
              ))}
          </div>
        )}

        <section className="mt-12 max-w-3xl text-sm text-[#1a1a1a] leading-relaxed space-y-3">
          <h2 className="font-serif text-xl font-bold text-black">
            How to choose a local institution in {info.name}
          </h2>
          <p>
            When comparing local options, weigh three things against any
            national online bank: the effective APY after fees, whether
            membership gates you out of the headline product, and how
            accessible the branch / ATM network is where you actually live
            and work.
          </p>
          <p className="text-xs text-[#5a5a5a] italic">
            Rates, fees, and membership rules are subject to change without
            notice. This page is for informational purposes only and is not
            financial advice.
          </p>
        </section>
      </div>
    </div>
  );
}

function ProviderCard({ p }: { p: StateProvider }) {
  const apyDisplay = p.apy > 0 ? `${p.apy.toFixed(2)}%` : "—";
  return (
    <div className="bg-white border border-[#e4d9cf] rounded-sm p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0e4d45]">
              {INSTITUTION_TYPE_LABEL[p.institution_type] || p.institution_type}
            </span>
            <span className="text-[10px] text-[#5a5a5a] uppercase tracking-wider">
              {PRODUCT_TYPE_LABEL[p.product_type] || p.product_type}
            </span>
            {p.membership_required && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#fef1e6] text-[#7a4a1f] px-1.5 py-0.5 rounded-sm">
                Membership
              </span>
            )}
          </div>
          <h3 className="font-serif text-lg font-bold text-black leading-tight">
            {p.institution_name}
          </h3>
          {p.summary && (
            <p className="text-xs text-[#1a1a1a] leading-relaxed mt-1.5">
              {p.summary}
            </p>
          )}
          {p.membership_required && p.membership_notes && (
            <p className="text-[11px] text-[#5a5a5a] mt-1.5">
              <strong>Membership:</strong> {p.membership_notes}
            </p>
          )}
        </div>
        <div className="flex sm:flex-col items-start sm:items-end gap-4 sm:gap-1 sm:text-right">
          <div>
            <div className="text-[9px] text-[#5a5a5a] uppercase tracking-wider">
              APY
            </div>
            <div className="font-serif font-bold text-xl text-[#0e4d45]">
              {apyDisplay}
            </div>
          </div>
          <div>
            <div className="text-[9px] text-[#5a5a5a] uppercase tracking-wider">
              Min
            </div>
            <div className="font-serif font-bold text-sm text-black">
              ${p.min_deposit.toLocaleString()}
            </div>
          </div>
          {p.monthly_fee > 0 && (
            <div>
              <div className="text-[9px] text-[#5a5a5a] uppercase tracking-wider">
                Monthly fee
              </div>
              <div className="font-serif font-bold text-sm text-black">
                ${p.monthly_fee.toFixed(2)}
              </div>
            </div>
          )}
        </div>
      </div>
      {p.website_url && (
        <div className="mt-3 pt-3 border-t border-[#f0e6dc] flex items-center justify-between gap-3">
          <span className="text-[10px] text-[#5a5a5a] uppercase tracking-wider">
            Last verified{" "}
            {new Date(p.last_verified_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
          <a
            href={p.website_url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="text-[11px] font-bold uppercase tracking-wider text-[#0e4d45] hover:underline"
          >
            Visit site &rarr;
          </a>
        </div>
      )}
    </div>
  );
}
