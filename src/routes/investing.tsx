import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { getByCategory } from "@/data/products";
import type { Product } from "@/data/products";
import { ProductCard, ProductLogo, StarRating, GradeBadge, DisclosureIcon } from "@/components/product-card";
import { getDisclosure } from "@/data/disclosures";
import { CategoryPage } from "@/components/category-page";
import { useSeo, SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/investing")({
  component: Investing,
});

function HeroPick({ p }: { p: Product }) {
  return (
    <div className="bg-white border border-[#d4c5b8] rounded-sm shadow-sm mb-5 overflow-hidden">
      <div className="border-b border-[#e4d9cf] px-3 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-serif font-bold text-2xl sm:text-3xl text-[#0e4d45] leading-none">01</span>
          <div className="min-w-0">
            <div className="min-w-0">
            <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-[#0e4d45] truncate">
              {p.subcategory}
            </div>
            {p.editorsPick && (
              <div className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.15em] text-[#540f04]">
                Editor&apos;s Pick
              </div>
            )}
          </div>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
          <StarRating rating={p.rating} size="md" />
          {p.grade && <GradeBadge grade={p.grade} size="md" />}
          <span className="text-[8px] sm:text-[10px] text-[#5a5a5a] hidden sm:inline">
            ({p.reviews.toLocaleString()} reviews)
          </span>
        </div>
      </div>
      <div className="p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <ProductLogo p={p} size={36} />
            <div className="min-w-0">
              <h2 className="font-serif font-bold text-sm sm:text-xl text-black leading-tight truncate">
                {p.name}
              </h2>
              <div className="text-[11px] sm:text-xs text-[#5a5a5a] mt-0.5 truncate">{p.provider}</div>
            </div>
          </div>
          <div className="sm:ml-auto flex flex-wrap gap-2 sm:gap-5 text-center">
            <div className="flex-shrink-0">
              <div className="text-[8px] sm:text-[9px] text-[#5a5a5a] uppercase tracking-wider flex items-center justify-center gap-1">
                Commissions
                <DisclosureIcon text={p.disclosure || getDisclosure(p.slug) || "Commissions, fees, and promotional offers are subject to change. See provider site for full terms and disclosures."} label={`${p.name} disclosure`} />
              </div>
              <div className="font-serif font-bold text-base sm:text-2xl text-[#0e4d45]">{p.fees}</div>
            </div>
            {p.bonus && (
              <div className="flex-shrink-0">
                <div className="text-[8px] sm:text-[9px] text-[#5a5a5a] uppercase tracking-wider">Bonus</div>
                <div className="font-serif font-bold text-base sm:text-2xl text-black">{p.bonus}</div>
              </div>
            )}
            <div className="flex-shrink-0">
              <div className="text-[8px] sm:text-[9px] text-[#5a5a5a] uppercase tracking-wider">Min</div>
              <div className="font-serif font-bold text-base sm:text-2xl text-black">{p.minDeposit}</div>
            </div>
          </div>
        </div>

        <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-[#1a1a1a] leading-relaxed border-l-[3px] border-[#0e4d45] pl-3 italic font-serif">
          &ldquo;{p.tagline}&rdquo;
        </p>

        <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.12em] text-[#0e4d45] mb-1.5">
              Why we picked it
            </div>
            <ul className="space-y-1">
              {p.highlights.map((h) => (
                <li key={h} className="flex items-start gap-1.5 text-[11px] sm:text-xs text-[#1a1a1a]">
                  <span className="text-[#0e4d45] mt-0.5 shrink-0">✓</span>
                  {h}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.12em] text-[#5a5a5a] mb-1.5">
              Things to know
            </div>
            <ul className="space-y-1">
              {p.cons.map((c) => (
                <li key={c} className="flex items-start gap-1.5 text-[11px] sm:text-xs text-[#5a5a5a]">
                  <span className="text-[#5a5a5a] mt-0.5 shrink-0">–</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-4 sm:mt-5 grid grid-cols-2 gap-2">
          <Link
            to="/product/$slug"
            params={{ slug: p.slug }}
            className="text-center px-4 py-2.5 rounded-sm bg-[#0e4d45] text-[#fef6f1] text-[11px] font-semibold uppercase tracking-wider hover:bg-[#0a3832] transition-colors"
          >
            Read Full Review
          </Link>
          <a
            href={p.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="text-center px-4 py-2.5 rounded-sm bg-white border border-[#d4c5b8] text-black text-[11px] font-semibold uppercase tracking-wider hover:border-[#0e4d45] hover:text-[#0e4d45] transition-colors"
          >
            Visit Site
          </a>
        </div>
      </div>
    </div>
  );
}

function BestForAwards({ products }: { products: Product[] }) {
  const awards = [
    { label: "Best Overall", badge: "01", match: (p: Product) => p.editorsPick },
    { label: "Best for Beginners", badge: "02", match: (p: Product) => p.bestFor.toLowerCase().includes("beginner") },
    { label: "Best Robo-Advisor", badge: "03", match: (p: Product) => p.subcategory === "Robo-Advisor" },
    { label: "Best for Retirement", badge: "04", match: (p: Product) => p.bestFor.toLowerCase().includes("retirement") },
  ];
  const picks = awards
    .map((a) => ({ ...a, product: products.find(a.match) }))
    .filter((a) => a.product);

  return (
    <div className="bg-white border border-[#d4c5b8] rounded-sm shadow-sm mb-5 overflow-hidden">
      <div className="border-b border-[#e4d9cf] px-3 sm:px-4 pt-3 sm:pt-4 pb-2.5 sm:pb-3">
        <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-[#0e4d45]">
          2025 Editor&apos;s Awards
        </div>
        <p className="text-[10px] sm:text-[11px] text-[#5a5a5a] mt-0.5">
          Our top pick in each category, chosen by our investing editors.
        </p>
      </div>
      <div className="divide-y divide-[#e4d9cf] grid grid-cols-1 sm:grid-cols-2 sm:divide-y-0 sm:divide-x">
        {picks.map((a) => (
          <div key={a.label} className="p-3 sm:p-4 flex items-start gap-2.5 sm:gap-3 hover:bg-[#fef6f1]/50 transition-colors">
            <span className="font-serif font-bold text-xl sm:text-2xl text-[#0e4d45] leading-none flex-shrink-0 mt-0.5">
              {a.badge}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.15em] text-[#540f04]">
                {a.label}
              </div>
              <div className="font-serif font-bold text-xs sm:text-sm text-black truncate mt-0.5">
                {a.product!.name}
              </div>
              <div className="text-[9px] sm:text-[10px] text-[#5a5a5a] mt-0.5 line-clamp-2">
                {a.product!.tagline}
              </div>
              <Link
                to="/product/$slug"
                params={{ slug: a.product!.slug }}
                className="inline-block mt-1.5 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-[#0e4d45] hover:text-[#0a3832]"
              >
                Read Review →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Investing() {
  useSeo({
    title: "Best Investing Apps & Brokerages 2026 | Investing and Retirement",
    description: "Compare the top investing apps, online brokerages, and robo-advisors. Expert reviews of Fidelity, Vanguard, Robinhood, Schwab, Webull and more — with fees, features, and ratings.",
    path: "/investing",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Best Investing Apps & Brokerages",
      url: `${SITE_URL}/investing`,
      description: "Curated list of the best investing platforms reviewed by our editorial team.",
    },
  });
  const all = getByCategory("investing");
  void HeroPick;
  void BestForAwards;
  const [filter, setFilter] = useState<string>("All");
  const subs = ["All", ...Array.from(new Set(all.map((p) => p.subcategory)))];
  const filtered = filter === "All" ? all : all.filter((p) => p.subcategory === filter);
  const hero = all.find((p) => p.editorsPick) ?? all[0];
  const rest = filtered.filter((p) => p.slug !== hero.slug);

  return (
    <CategoryPage
      eyebrow="Investing"
      title="Best Investing Apps and Brokerages"
      subtitle="Compare commission-free brokerages, robo-advisors, and retirement accounts from the biggest names in investing."
      stats={[
        { label: "Platforms reviewed", value: "21" },
        { label: "Avg. commission", value: "$0" },
        { label: "Top IRA match", value: "1%" },
      ]}
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#0e4d45]" />
        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-[#0e4d45]">
          Rates as of January 2026 · Refreshed Quarterly
        </span>
      </div>
      <BestForAwards products={all} />
      <HeroPick p={hero} />
      <div className="flex flex-wrap gap-1.5 mb-3 sm:mb-4">
        {subs.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-2 sm:px-2.5 py-1 rounded-sm text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider transition-colors ${
              filter === s
                ? "bg-[#0e4d45] text-[#fef6f1]"
                : "bg-[#fef6f1] border border-[#e4d9cf] text-black hover:border-[#0e4d45] hover:text-[#0e4d45]"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {rest.map((p, i) => (
          <ProductCard key={p.slug} p={p} rank={i + 2} />
        ))}
      </div>
    </CategoryPage>
  );
}
