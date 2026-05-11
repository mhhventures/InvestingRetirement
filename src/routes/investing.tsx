import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { getByCategory } from "@/data/products";
import type { Product } from "@/data/products";
import { ProductCard, ProductLogo, StarRating, GradeBadge, DisclosureIcon, ProductPreviewModal } from "@/components/product-card";
import { pushEvent } from "@/lib/gtm";
import { getDisclosure } from "@/data/disclosures";
import { CategoryPage } from "@/components/category-page";
import { RelatedGuidesForCategory } from "@/components/related-guides";
import { useSeo, SITE_URL, buildItemListSchema } from "@/lib/seo";
import { productPartnerLink } from "@/lib/affiliate";

export const Route = createFileRoute("/investing")({
  component: Investing,
});

function HeroPick({ p }: { p: Product }) {
  const [previewOpen, setPreviewOpen] = useState(false);

  function handleClick(e: React.MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.closest("a, button, input, label")) return;
    setPreviewOpen(true);
    pushEvent("select_item", {
      item_id: p.slug,
      item_name: p.name,
      item_category: p.category,
      item_list_name: "investing-hero",
      placement: "investing-hero",
      action: "card-preview-open",
    });
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      const target = e.target as HTMLElement;
      if (target.closest("a, button, input, label")) return;
      e.preventDefault();
      setPreviewOpen(true);
    }
  }

  return (
    <div
      onClick={handleClick}
      onKeyDown={handleKey}
      role="button"
      tabIndex={0}
      aria-label={`Preview ${p.name}`}
      className="bg-white border border-[#d4c5b8] rounded-sm shadow-sm mb-5 overflow-hidden cursor-pointer hover:border-[#0e4d45] hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-[#0e4d45]/40"
    >
      {previewOpen && (
        <ProductPreviewModal p={p} listName="investing-hero" onClose={() => setPreviewOpen(false)} />
      )}
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
          <span className="text-[8px] sm:text-[10px] text-[#3f3f3f] hidden sm:inline">
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
              <div className="text-[11px] sm:text-xs text-[#3f3f3f] mt-0.5 truncate">{p.provider}</div>
            </div>
          </div>
          <div className="sm:ml-auto flex flex-wrap gap-2 sm:gap-5 text-center">
            <div className="flex-shrink-0">
              <div className="text-[8px] sm:text-[9px] text-[#3f3f3f] uppercase tracking-wider flex items-center justify-center gap-1">
                Commissions
                <DisclosureIcon text={p.disclosure || getDisclosure(p.slug) || "Commissions, fees, and promotional offers are subject to change. See provider site for full terms and disclosures."} label={`${p.name} disclosure`} />
              </div>
              <div className="font-serif font-bold text-base sm:text-2xl text-[#0e4d45]">{p.fees}</div>
            </div>
            {p.bonus && (
              <div className="flex-shrink-0">
                <div className="text-[8px] sm:text-[9px] text-[#3f3f3f] uppercase tracking-wider">Bonus</div>
                <div className="font-serif font-bold text-base sm:text-2xl text-black">{p.bonus}</div>
              </div>
            )}
            <div className="flex-shrink-0">
              <div className="text-[8px] sm:text-[9px] text-[#3f3f3f] uppercase tracking-wider">Min</div>
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
            <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.12em] text-[#3f3f3f] mb-1.5">
              Things to know
            </div>
            <ul className="space-y-1">
              {p.cons.map((c) => (
                <li key={c} className="flex items-start gap-1.5 text-[11px] sm:text-xs text-[#3f3f3f]">
                  <span className="text-[#3f3f3f] mt-0.5 shrink-0">–</span>
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
            href={productPartnerLink(p.slug, p.url, { placement: "investing-hero", term: "hero-pick", campaign: "investing" })}
            target="_blank"
            rel="nofollow noopener noreferrer sponsored"
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
        <p className="text-[10px] sm:text-[11px] text-[#3f3f3f] mt-0.5">
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
              <div className="text-[9px] sm:text-[10px] text-[#3f3f3f] mt-0.5 line-clamp-2">
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
  const all = getByCategory("investing");
  useSeo({
    title: "Best Investing Apps & Brokerages 2026",
    description: "Compare top investing apps, brokerages, and robo-advisors. Expert reviews of Fidelity, Vanguard, Robinhood, Schwab, and Webull.",
    path: "/investing",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Best Investing Apps & Brokerages",
        url: `${SITE_URL}/investing`,
        description: "Curated list of the best investing platforms reviewed by our editorial team.",
      },
      buildItemListSchema({
        name: "Best Investing Apps & Brokerages 2026",
        url: `${SITE_URL}/investing`,
        description: "Ranked list of brokerages and robo-advisors.",
        items: all.slice(0, 25).map((p) => ({
          name: p.name,
          url: `${SITE_URL}/product/${p.slug}`,
          description: p.tagline,
        })),
      }),
    ],
  });
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
      <p className="mb-5 text-sm text-[#1a1a1a] leading-relaxed">
        Compare the brokerages, robo-advisors, and retirement platforms most Americans actually use. Each ranking is based on a funded account and real trades, not a marketing-page read-through.
      </p>
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
      <div className="mt-6">
        <RelatedGuidesForCategory categoryPath="/investing" />
      </div>

      <section className="mt-12 space-y-5 text-sm text-[#1a1a1a] leading-relaxed">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0e4d45] mb-1">Methodology</div>
          <h2 className="font-serif text-2xl font-bold text-black mb-2">How we rank investing apps</h2>
          <p>
            Our rubric weights costs and fees (25%), platform and tools (20%), asset selection (15%), account types (10%), education and research (10%), customer support (10%), and trust and safety (10%). Editors open real accounts, place real trades, and fund IRAs before publishing a score. Partners cannot pay for better rankings or preview coverage before it goes live.
          </p>
        </div>
        <div>
          <h3 className="font-serif text-lg font-bold text-black mb-1.5">Which broker fits which investor</h3>
          <p>
            If you are new to investing, start with a broker that offers <strong>commission-free stock and ETF trades</strong>, <strong>fractional shares</strong>, and both <strong>Roth and Traditional IRAs</strong>. Charles Schwab and Fidelity score highest for all-around use. If you want hands-off investing, <strong>robo-advisors</strong> like Betterment and Wealthfront automate asset allocation, rebalancing, and tax-loss harvesting for a small annual fee. Active traders should compare platform depth, options-contract fees, and margin rates. Interactive Brokers, thinkorswim (via Schwab), and Webull lead that category.
          </p>
        </div>
        <div>
          <h3 className="font-serif text-lg font-bold text-black mb-1.5">What to compare</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Commission structure on stocks, ETFs, options contracts, and mutual funds.</li>
            <li>Retirement account support: Traditional IRA, Roth IRA, SEP IRA, Solo 401(k), rollover handling.</li>
            <li>Research quality, charting depth, and screener flexibility for active decision-making.</li>
            <li>Fractional shares, dividend reinvestment, tax-loss harvesting, and automated portfolio tools.</li>
          </ul>
          <p className="mt-2 text-xs text-[#3f3f3f]">
            Read our <a href="/about" className="underline text-[#0e4d45]">editorial methodology</a> and <a href="/disclosure" className="underline text-[#0e4d45]">advertiser disclosure</a> for more on how we test products and fund our independence.
          </p>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-3 border-b border-[#e4d9cf] pb-1.5">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0e4d45] mb-1">Getting Started</div>
          <h2 className="font-serif text-2xl font-bold text-black">Three models, one decision</h2>
          <p className="text-[12px] text-[#3f3f3f] mt-0.5">Which style of brokerage fits which kind of investor.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            {
              label: "Self-directed",
              cost: "$0 commissions",
              who: "Hands-on investors who want full control and the lowest fees.",
              desc: "Commission-free trades, no advisory fees, and a wide menu of stocks, ETFs, bonds, and options. You pick every investment yourself.",
            },
            {
              label: "Robo-advisor",
              cost: "~0.25% / yr",
              who: "Hands-off investors who want automation with modest cost.",
              desc: "Automatically builds and rebalances a diversified portfolio from your goals and risk tolerance. Tax-loss harvesting often offsets the fee.",
            },
            {
              label: "Full-service",
              cost: "~1% / yr",
              who: "Complex portfolios that need planning, tax, and estate guidance.",
              desc: "Human advisor for financial planning, tax guidance, and estate work. Worth it once portfolios are complex enough to justify the cost.",
            },
          ].map((m) => (
            <div key={m.label} className="bg-white border border-[#d4c5b8] rounded-sm shadow-sm p-4 flex flex-col">
              <div className="flex items-baseline justify-between">
                <div className="font-serif font-bold text-base text-black">{m.label}</div>
                <div className="font-serif font-bold text-[#0e4d45] text-sm">{m.cost}</div>
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#540f04] mt-1 mb-1.5">Best for</div>
              <div className="text-[12px] text-[#1a1a1a] mb-2 leading-snug">{m.who}</div>
              <p className="text-[11.5px] text-[#3f3f3f] leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 grid sm:grid-cols-2 gap-3">
        <div className="bg-white border border-[#d4c5b8] rounded-sm shadow-sm p-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0e4d45] mb-1">First account</div>
          <h3 className="font-serif font-bold text-base text-black mb-1">Opening a brokerage account</h3>
          <p className="text-[12.5px] text-[#1a1a1a] leading-relaxed">
            Takes about ten minutes online. You&rsquo;ll need your SSN, a government ID, your employer and address, and a bank account to fund it. Most brokers have a $0 minimum for taxable accounts and IRAs. Funds clear for trading in one to three business days via ACH.
          </p>
          <p className="text-[12.5px] text-[#1a1a1a] leading-relaxed mt-2">
            Before your first order, pick a simple allocation &mdash; a broad US stock index, a total international index, and a bond or cash position is enough for most long-term investors &mdash; and turn on automatic monthly contributions.
          </p>
        </div>
        <div className="bg-white border border-[#d4c5b8] rounded-sm shadow-sm p-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#540f04] mb-1">Pitfalls</div>
          <h3 className="font-serif font-bold text-base text-black mb-1">Common mistakes new investors make</h3>
          <ul className="text-[12.5px] text-[#1a1a1a] leading-relaxed space-y-1.5 mt-1">
            <li className="flex gap-2"><span className="text-[#540f04] font-bold mt-0.5">&ndash;</span><span>Chasing trending stocks or leveraged ETFs rarely beats a boring index fund after taxes and fees.</span></li>
            <li className="flex gap-2"><span className="text-[#540f04] font-bold mt-0.5">&ndash;</span><span>Timing the market &mdash; selling in a downturn or waiting for the &ldquo;right moment&rdquo; &mdash; consistently underperforms staying invested.</span></li>
            <li className="flex gap-2"><span className="text-[#540f04] font-bold mt-0.5">&ndash;</span><span>Skipping a 401(k) match or Roth IRA costs tens of thousands over a career &mdash; see our <a href="/guides/portfolio-building" className="underline text-[#0e4d45]">portfolio-building guide</a>.</span></li>
          </ul>
        </div>
      </section>
    </CategoryPage>
  );
}
