import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { getByCategory } from "@/data/products";
import type { Product } from "@/data/products";
import { ProductCard, ProductLogo, StarRating, GradeBadge, DisclosureIcon } from "@/components/product-card";
import { getDisclosure } from "@/data/disclosures";
import { BankSidebar } from "@/components/bank-sidebar";
import { RelatedGuidesForCategory } from "@/components/related-guides";
import { withUtm } from "@/lib/affiliate";
import { useSeo, SITE_URL, buildItemListSchema } from "@/lib/seo";

const APY_LAST_UPDATED = "May 1, 2026";

export const Route = createFileRoute("/bank-accounts")({
  component: BankAccounts,
});

// ─── Hero Pick (full-width #1 card) ────────────────────────────────────────
function HeroPick({ p }: { p: Product }) {
  return (
    <div className="bg-white border border-[#d4c5b8] rounded-sm shadow-sm mb-5 overflow-hidden">
      <div className="border-b border-[#e4d9cf] px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-serif font-bold text-3xl text-[#0e4d45] leading-none">01</span>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0e4d45]">
              {p.subcategory}
            </div>
            {p.editorsPick && (
              <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#540f04]">
                Editor&apos;s Pick
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StarRating rating={p.rating} size="md" />
          {p.grade && <GradeBadge grade={p.grade} size="md" />}
          <span className="text-[10px] text-[#5a5a5a] hidden sm:inline">Ranked by APY, fees, minimums, and FDIC coverage.</span>
        </div>
      </div>
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex items-center gap-3 flex-shrink-0">
            <ProductLogo p={p} size={40} />
            <div className="min-w-0">
              <h2 className="font-serif font-bold text-base sm:text-xl text-black leading-tight truncate">{p.name}</h2>
              <div className="text-xs text-[#5a5a5a] mt-0.5 truncate">{p.provider}</div>
            </div>
          </div>
          <div className="sm:ml-auto grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-5 text-center w-full sm:w-auto">
            {p.apy && (
              <div className="flex-shrink-0">
                <div className="text-[9px] text-[#5a5a5a] uppercase tracking-wider flex items-center justify-center gap-1">
                  APY
                  <DisclosureIcon text={p.disclosure || getDisclosure(p.slug) || "Rates and terms subject to change. See provider site for full disclosures."} label={`${p.name} disclosure`} />
                </div>
                <div className="font-serif font-bold text-xl sm:text-2xl text-[#0e4d45]">{p.apy}</div>
              </div>
            )}
            {!p.apy && (
              <div className="flex-shrink-0">
                <div className="text-[9px] text-[#5a5a5a] uppercase tracking-wider flex items-center justify-center gap-1">
                  Details
                  <DisclosureIcon text={p.disclosure || getDisclosure(p.slug) || "Rates and terms subject to change. See provider site for full disclosures."} label={`${p.name} disclosure`} />
                </div>
                <div className="font-serif font-bold text-xl sm:text-2xl text-[#0e4d45]">—</div>
              </div>
            )}
            {p.bonus && (
              <div className="flex-shrink-0">
                <div className="text-[9px] text-[#5a5a5a] uppercase tracking-wider">Bonus</div>
                <div className="font-serif font-bold text-lg sm:text-2xl text-black">{p.bonus}</div>
              </div>
            )}
            <div className="flex-shrink-0">
              <div className="text-[9px] text-[#5a5a5a] uppercase tracking-wider">Fees</div>
              <div className="font-serif font-bold text-lg sm:text-2xl text-black">{p.fees}</div>
            </div>
            <div className="flex-shrink-0">
              <div className="text-[9px] text-[#5a5a5a] uppercase tracking-wider">Min</div>
              <div className="font-serif font-bold text-lg sm:text-2xl text-black">{p.minDeposit}</div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-[#1a1a1a] leading-relaxed border-l-[3px] border-[#0e4d45] pl-3 italic font-serif">
          &ldquo;{p.tagline}&rdquo;
        </p>

        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#0e4d45] mb-1.5">
              Why we picked it
            </div>
            <ul className="space-y-1">
              {p.highlights.map((h) => (
                <li key={h} className="flex items-start gap-1.5 text-xs text-[#1a1a1a]">
                  <span className="text-[#0e4d45] mt-0.5 shrink-0">✓</span>
                  {h}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#5a5a5a] mb-1.5">
              Things to know
            </div>
            <ul className="space-y-1">
              {p.cons.map((c) => (
                <li key={c} className="flex items-start gap-1.5 text-xs text-[#5a5a5a]">
                  <span className="text-[#5a5a5a] mt-0.5 shrink-0">–</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <Link
            to="/product/$slug"
            params={{ slug: p.slug }}
            className="text-center px-4 py-2.5 rounded-sm bg-[#0e4d45] text-[#fef6f1] text-[11px] font-semibold uppercase tracking-wider hover:bg-[#0a3832] transition-colors"
          >
            Read Full Review
          </Link>
          <a
            href={withUtm(p.url, { campaign: "bank-accounts", content: p.slug, term: "hero-pick" })}
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

// ─── APY Calculator ──────────────────────────────────────────────────────────
function ApyCalculator({ products }: { products: Product[] }) {
  const [deposit, setDeposit] = useState(10000);
  const [months, setMonths] = useState(12);
  const topThree = products.filter((p) => p.apy).slice(0, 3);

  function calcEarnings(apy: string, dep: number, mo: number) {
    const rate = parseFloat(apy.replace("%", "")) / 100;
    return dep * rate * (mo / 12);
  }

  return (
    <div className="bg-white border border-[#d4c5b8] rounded-sm shadow-sm mb-5">
      <div className="px-4 pt-4 pb-3 border-b border-[#0e4d45]/20">
        <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0e4d45]">APY Earnings Calculator</div>
        <p className="text-[11px] text-[#5a5a5a] mt-0.5">See how much you&apos;d earn at today&apos;s top rates.</p>
      </div>
      <div className="p-4">
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#5a5a5a] block mb-1">
              Deposit Amount
            </label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#5a5a5a] font-semibold">$</span>
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

        {topThree.length > 0 && (
          <div className="divide-y divide-[#e4d9cf] border border-[#e4d9cf] rounded-sm overflow-hidden">
            <div className="bg-[#f7ebe2] grid grid-cols-[minmax(0,1fr)_44px_60px_60px] sm:grid-cols-[minmax(0,1fr)_56px_72px_72px] gap-2 sm:gap-3 text-[9px] font-bold uppercase tracking-wider text-[#0e4d45] px-2 sm:px-3 py-1.5 items-center">
              <span>Account</span>
              <span className="text-center">APY</span>
              <span className="text-right">Earn</span>
              <span></span>
            </div>
            {topThree.map((p) => {
              const earned = calcEarnings(p.apy!, deposit, months);
              return (
                <div key={p.slug} className="grid grid-cols-[minmax(0,1fr)_44px_60px_60px] sm:grid-cols-[minmax(0,1fr)_56px_72px_72px] gap-2 sm:gap-3 items-center px-2 sm:px-3 py-2 bg-white hover:bg-[#fef6f1] transition-colors">
                  <Link
                    to="/product/$slug"
                    params={{ slug: p.slug }}
                    className="flex items-center gap-1.5 sm:gap-2 min-w-0 group"
                  >
                    <ProductLogo p={p} size={22} />
                    <span className="text-[11px] font-medium text-black truncate group-hover:text-[#0e4d45] group-hover:underline">{p.name.split(" ")[0]}</span>
                  </Link>
                  <div className="text-center font-serif font-bold text-[#0e4d45] text-xs sm:text-sm">{p.apy}</div>
                  <div className="text-right font-serif font-bold text-black text-xs sm:text-sm">
                    ${earned.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                  <a
                    href={withUtm(p.url, { campaign: "bank-accounts", content: p.slug, term: "apy-calculator" })}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="text-center px-1.5 sm:px-2 py-1 rounded-sm bg-[#0e4d45] text-[#fef6f1] text-[9px] font-semibold uppercase tracking-wider hover:bg-[#0a3832] transition-colors whitespace-nowrap"
                  >
                    Visit
                  </a>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-[9px] text-[#5a5a5a] mt-2 italic">
          Estimates based on stated APY. Actual earnings may vary. Does not include compounding.
        </p>
      </div>
    </div>
  );
}

// ─── Compare Floating Bar ────────────────────────────────────────────────────
function CompareBar({
  selected,
  products,
  onRemove,
  onClear,
  onCompare,
}: {
  selected: string[];
  products: Product[];
  onRemove: (slug: string) => void;
  onClear: () => void;
  onCompare: () => void;
}) {
  if (selected.length < 2) return null;
  const picks = selected.map((s) => products.find((p) => p.slug === s)).filter(Boolean) as Product[];
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#d4c5b8] bg-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[#0e4d45] shrink-0">
          Comparing {picks.length}
        </div>
        <div className="flex gap-2 flex-1 flex-wrap">
          {picks.map((p) => (
            <div key={p.slug} className="flex items-center gap-1.5 bg-[#fef6f1] border border-[#d4c5b8] rounded-sm px-2 py-1">
              <ProductLogo p={p} size={20} />
              <span className="text-[11px] font-medium text-black">{p.name.split(" ")[0]}</span>
              <button
                onClick={() => onRemove(p.slug)}
                className="text-[#5a5a5a] hover:text-black ml-1 text-xs leading-none"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={onClear}
          className="text-[10px] font-semibold uppercase tracking-wider px-3 py-1.5 border border-[#d4c5b8] text-[#5a5a5a] rounded-sm hover:border-[#0e4d45] hover:text-[#0e4d45] transition-colors shrink-0"
        >
          Clear
        </button>
        <button
          onClick={onCompare}
          className="text-[10px] font-semibold uppercase tracking-wider px-3 py-1.5 bg-[#0e4d45] text-[#fef6f1] rounded-sm hover:bg-[#0a3832] transition-colors shrink-0"
        >
          Compare Side-by-Side →
        </button>
      </div>
    </div>
  );
}

// ─── Compare Modal ───────────────────────────────────────────────────────────
function CompareModal({ products, onClose }: { products: Product[]; onClose: () => void }) {
  if (products.length < 2) return null;
  const fields: { label: string; key: keyof Product }[] = [
    { label: "APY", key: "apy" },
    { label: "Bonus", key: "bonus" },
    { label: "Fees", key: "fees" },
    { label: "Min. Deposit", key: "minDeposit" },
    { label: "Best For", key: "bestFor" },
  ];
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-3 sm:p-4" onClick={onClose}>
      <div className="bg-white border border-[#d4c5b8] rounded-sm shadow-xl w-full max-w-3xl max-h-[85vh] sm:max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-[#e4d9cf] shrink-0">
          <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-[#0e4d45]">Side-by-Side Comparison</div>
          <button onClick={onClose} className="text-[#5a5a5a] hover:text-black text-lg ml-3 shrink-0">✕</button>
        </div>
        <div className="overflow-y-auto flex-1">
          {isMobile ? (
            // Mobile: Stacked card layout
            <div className="p-3 space-y-3">
              {products.map((p) => (
                <div key={p.slug} className="bg-white border border-[#d4c5b8] rounded-sm overflow-hidden">
                  <div className="bg-[#f7ebe2] px-3 py-2.5 flex items-center gap-2">
                    <ProductLogo p={p} size={28} />
                    <div className="flex-1 min-w-0">
                      <div className="font-serif font-bold text-sm text-black truncate">{p.name}</div>
                      <div className="text-[9px] text-[#5a5a5a] mt-0.5"><StarRating rating={p.rating} size="sm" /></div>
                    </div>
                  </div>
                  <div className="divide-y divide-[#e4d9cf]">
                    {fields.map((f) => (
                      <div key={f.key} className="flex items-center justify-between px-3 py-2">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#5a5a5a]">{f.label}</span>
                        <span className="font-serif font-bold text-sm text-black text-right">{(p[f.key] as string) || "—"}</span>
                      </div>
                    ))}
                  </div>
                  <div className="px-3 py-2">
                    <Link
                      to="/product/$slug"
                      params={{ slug: p.slug }}
                      onClick={onClose}
                      className="block text-center text-[10px] font-semibold uppercase tracking-wider bg-[#0e4d45] text-[#fef6f1] rounded-sm px-3 py-2 hover:bg-[#0a3832] transition-colors"
                    >
                      Read Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Desktop: Table layout
            <div className="overflow-x-auto p-5">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left py-2 pr-4 text-[10px] font-bold uppercase tracking-wider text-[#5a5a5a] w-28"></th>
                    {products.map((p) => (
                      <th key={p.slug} className="text-center pb-3 px-3">
                        <div className="flex flex-col items-center gap-1.5">
                          <ProductLogo p={p} size={36} />
                          <div className="font-serif font-bold text-sm text-black leading-tight">{p.name}</div>
                          <StarRating rating={p.rating} size="sm" />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e4d9cf]">
                  {fields.map((f) => (
                    <tr key={f.key} className="hover:bg-[#fef6f1]">
                      <td className="py-2.5 pr-4 text-[10px] font-bold uppercase tracking-wider text-[#5a5a5a]">{f.label}</td>
                      {products.map((p) => (
                        <td key={p.slug} className="text-center py-2.5 px-3 font-serif font-bold text-sm text-black">
                          {(p[f.key] as string) || "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <td className="py-3 pr-4"></td>
                    {products.map((p) => (
                      <td key={p.slug} className="text-center py-3 px-3">
                        <Link
                          to="/product/$slug"
                          params={{ slug: p.slug }}
                          onClick={onClose}
                          className="inline-block text-[10px] font-semibold uppercase tracking-wider bg-[#0e4d45] text-[#fef6f1] rounded-sm px-3 py-1.5 hover:bg-[#0a3832] transition-colors"
                        >
                          Read Review
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Product Card with Compare Checkbox ─────────────────────────────────────
function ComparableCard({
  p,
  rank,
  isSelected,
  onToggle,
  compareDisabled,
}: {
  p: Product;
  rank: number;
  isSelected: boolean;
  onToggle: () => void;
  compareDisabled: boolean;
}) {
  return (
    <div className="relative min-w-0 w-full">
      <ProductCard p={p} rank={rank} />
      <div className="absolute top-2.5 right-2.5">
        <label className="flex items-center gap-1 cursor-pointer group">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggle}
            disabled={compareDisabled && !isSelected}
            className="sr-only"
          />
          <div
            className={`w-4 h-4 rounded-[2px] border flex items-center justify-center text-[8px] transition-colors ${
              isSelected
                ? "bg-[#0e4d45] border-[#0e4d45] text-white"
                : compareDisabled
                ? "border-[#d4c5b8] bg-[#f7ebe2] opacity-50"
                : "border-[#d4c5b8] bg-white group-hover:border-[#0e4d45]"
            }`}
          >
            {isSelected && "✓"}
          </div>
          <span className="text-[9px] text-[#5a5a5a] group-hover:text-[#0e4d45] font-medium uppercase tracking-wider">
            Compare
          </span>
        </label>
      </div>
    </div>
  );
}

// ─── Subcategory Section ─────────────────────────────────────────────────────
function SubcategorySection({
  title,
  description,
  products,
  startRank,
  compareSelected,
  onToggleCompare,
}: {
  title: string;
  description: string;
  products: Product[];
  startRank: number;
  compareSelected: string[];
  onToggleCompare: (slug: string) => void;
}) {
  if (products.length === 0) return null;
  return (
    <div className="mb-8">
      <div className="mb-3 pb-2 border-b border-[#e4d9cf]">
        <h2 className="font-serif font-bold text-xl text-black">{title}</h2>
        <p className="text-[11px] text-[#5a5a5a] mt-0.5">{description}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
        {products.map((p, i) => (
          <ComparableCard
            key={p.slug}
            p={p}
            rank={startRank + i}
            isSelected={compareSelected.includes(p.slug)}
            onToggle={() => onToggleCompare(p.slug)}
            compareDisabled={compareSelected.length >= 3 && !compareSelected.includes(p.slug)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Editorial Footer ────────────────────────────────────────────────────────
function EditorialFooter() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const methodology = [
    { step: "01", title: "Data Collection", desc: "We gather rate, fee, and feature data from bank websites, FDIC filings, and direct bank contacts." },
    { step: "02", title: "Scoring", desc: "Each account is scored across APY, fees, minimums, FDIC coverage, mobile app quality, and customer service." },
    { step: "03", title: "Editorial Review", desc: "Our finance editors weigh scores against real-world usability, bonus terms, and actual user reviews." },
    { step: "04", title: "Regular Updates", desc: "Rankings are reviewed weekly. Rates change — we track them so you don\u2019t have to." },
  ];

  const checklist = [
    { label: "APY", desc: "The higher the better. Look for accounts offering 4%+ today." },
    { label: "Fees", desc: "Monthly maintenance fees eat into earnings. Prioritize $0 fee accounts." },
    { label: "Minimum deposit", desc: "Some accounts require $500–$1,000 to open. Many top picks require $0." },
    { label: "FDIC insurance", desc: "All listed accounts are FDIC-insured. Look for extended coverage ($2M+) for large deposits." },
    { label: "Bonus terms", desc: "Bonuses often require direct deposit. Read the fine print on qualifying periods." },
    { label: "Mobile app", desc: "Mobile deposit, instant transfers, and round-up features vary widely." },
  ];

  const faqs = [
    {
      q: "Is my money safe in an online savings account?",
      a: "Yes — all accounts on this page are FDIC-insured up to $250,000 per depositor. Some, like SoFi, partner with multiple banks to provide up to $2M in coverage. Online banks follow the same federal regulations as traditional banks.",
    },
    {
      q: "Can I have multiple high-yield savings accounts?",
      a: "Absolutely. Many savers open 2–3 accounts to maximize FDIC coverage, chase the best rates, or organize savings by goal (emergency fund, vacation, down payment). There\u2019s no limit to the number of accounts you can hold.",
    },
    {
      q: "How does a high-yield savings account differ from a regular savings account?",
      a: "The primary difference is APY. The national average savings rate is around 0.45%, while top online banks offer 4%+. Online banks can offer higher rates because they have lower overhead costs than branch-based banks.",
    },
    {
      q: "Are bank signup bonuses worth it?",
      a: "Often yes, but read the terms carefully. Bonuses typically require a qualifying direct deposit within 60–90 days and maintaining a minimum balance. A $300 bonus with a $500 minimum balance for 90 days is usually worth pursuing.",
    },
    {
      q: "What is the difference between APY and APR?",
      a: "APY (Annual Percentage Yield) includes the effect of compounding interest, while APR (Annual Percentage Rate) does not. For savings accounts, APY is the more meaningful number — it tells you exactly what you\u2019ll earn over a year.",
    },
  ];

  const relatedGuides = [
    {
      slug: "how-to-pick-high-yield-savings",
      category: "BANKING",
      time: "6 min",
      title: "How to Choose a High-Yield Savings Account",
      desc: "Learn what makes a great savings account and how to compare APYs, minimums, and insurance coverage.",
    },
    {
      slug: "savings-account-timeline",
      category: "BANKING",
      time: "4 min",
      title: "Savings Account Timeline",
      desc: "A step-by-step plan for building your savings and choosing the right account at every stage.",
    },
    {
      slug: "best-bank-bonuses-this-month",
      category: "BANKING",
      time: "8 min",
      title: "Best Bank Bonuses This Month",
      desc: "A curated list of the highest bank account bonuses with clear terms and qualification requirements.",
    },
  ];

  return (
    <div className="mt-10 space-y-10 pb-12">
      {/* How We Rank */}
      <div>
        <div className="mb-1">
          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0e4d45] mb-1">Methodology</div>
          <h3 className="font-serif font-bold text-2xl text-black">How We Rank Bank Accounts</h3>
        </div>
        <p className="text-sm text-[#5a5a5a] mt-1 mb-5 leading-relaxed">
          Our rankings are independent and editorially driven. We never accept payment for rankings — only standard display advertising and affiliate partnerships disclosed in our footer.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {methodology.map((m) => (
            <div key={m.step} className="bg-white border border-[#d4c5b8] rounded-sm p-4 shadow-sm">
              <div className="font-serif text-2xl font-bold text-[#0e4d45] mb-1">{m.step}</div>
              <div className="font-semibold text-sm text-black mb-1">{m.title}</div>
              <p className="text-[11px] text-[#5a5a5a] leading-snug">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* What to Look For */}
      <div>
        <div className="mb-1">
          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0e4d45] mb-1">Checklist</div>
          <h3 className="font-serif font-bold text-2xl text-black">What to Look For in a High-Yield Account</h3>
        </div>
        <div className="mt-4 bg-white border border-[#d4c5b8] rounded-sm shadow-sm divide-y divide-[#e4d9cf]">
          {checklist.map((item) => (
            <div key={item.label} className="flex gap-3 px-4 py-3">
              <span className="text-[#0e4d45] shrink-0 mt-0.5 font-bold text-sm">✓</span>
              <div>
                <div className="text-sm font-semibold text-black">{item.label}</div>
                <div className="text-[11px] text-[#5a5a5a] mt-0.5 leading-snug">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div>
        <div className="mb-1">
          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0e4d45] mb-1">FAQ</div>
          <h3 className="font-serif font-bold text-2xl text-black">Common Questions</h3>
        </div>
        <div className="mt-4 bg-white border border-[#d4c5b8] rounded-sm shadow-sm divide-y divide-[#e4d9cf]">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full text-left px-4 py-3.5 flex items-center justify-between gap-3 hover:bg-[#fef6f1] transition-colors"
              >
                <span className="text-sm font-semibold text-black leading-snug">{faq.q}</span>
                <span className={`text-[#0e4d45] shrink-0 transition-transform text-sm ${openFaq === i ? "rotate-45" : ""}`}>+</span>
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 text-[11px] text-[#1a1a1a] leading-relaxed border-t border-[#e4d9cf] pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Related Guides */}
      <div>
        <div className="mb-1">
          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0e4d45] mb-1">Further Reading</div>
          <h3 className="font-serif font-bold text-2xl text-black">Related Guides</h3>
        </div>
        <div className="mt-4 grid sm:grid-cols-3 gap-3">
          {relatedGuides.map((g) => (
            <div key={g.slug} className="bg-white border border-[#d4c5b8] rounded-sm shadow-sm p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0e4d45]">{g.category}</div>
                <div className="text-[10px] text-[#5a5a5a]">{g.time}</div>
              </div>
              <h4 className="font-serif font-bold text-sm text-black leading-snug mb-2">{g.title}</h4>
              <p className="text-[11px] text-[#5a5a5a] leading-snug flex-1">{g.desc}</p>
              <div className="mt-4 grid grid-cols-2 gap-1.5">
                <Link
                  to="/guides/$articleId"
                  params={{ articleId: g.slug }}
                  className="text-center px-2 py-1.5 rounded-sm bg-[#0e4d45] text-[#fef6f1] text-[10px] font-semibold uppercase tracking-wider hover:bg-[#0a3832] transition-colors"
                >
                  Read Guide
                </Link>
                <Link
                  to="/bank-accounts"
                  className="text-center px-2 py-1.5 rounded-sm bg-white border border-[#d4c5b8] text-black text-[10px] font-semibold uppercase tracking-wider hover:border-[#0e4d45] hover:text-[#0e4d45] transition-colors"
                >
                  See Products
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
function BankAccounts() {
  const all = getByCategory("bank");
  useSeo({
    title: "Best Bank Accounts 2026 — High-Yield Savings & Checking",
    description: "Compare the best high-yield savings, checking accounts, and CDs. Top APYs, no-fee picks, expert reviews of SoFi, Ally, Marcus, and more.",
    path: "/bank-accounts",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Best Bank Accounts",
        url: `${SITE_URL}/bank-accounts`,
        description: "Curated list of high-yield savings and checking accounts reviewed by our editorial team.",
      },
      buildItemListSchema({
        name: "Best Bank Accounts 2026",
        url: `${SITE_URL}/bank-accounts`,
        description: "Ranked list of high-yield savings and checking accounts.",
        items: all.slice(0, 25).map((p) => ({
          name: p.name,
          url: `${SITE_URL}/product/${p.slug}`,
          description: p.tagline,
        })),
      }),
    ],
  });
  const [filter, setFilter] = useState<string>("All");
  const [sort, setSort] = useState<string>("default");
  const [noFees, setNoFees] = useState(false);
  const [noMin, setNoMin] = useState(false);
  const [compareSelected, setCompareSelected] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const subs = ["All", ...Array.from(new Set(all.map((p) => p.subcategory)))];

  const filtered = useMemo(() => {
    let list = filter === "All" ? all : all.filter((p) => p.subcategory === filter);
    if (noFees) list = list.filter((p) => p.fees === "$0/month" || p.fees === "$0");
    if (noMin) list = list.filter((p) => p.minDeposit === "$0");
    if (sort === "apy") list = [...list].sort((a, b) => parseFloat(b.apy || "0") - parseFloat(a.apy || "0"));
    if (sort === "bonus") list = [...list].sort((a, b) => (b.bonus ? 1 : 0) - (a.bonus ? 1 : 0));
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [all, filter, sort, noFees, noMin]);

  const hero = filtered[0];
  const rest = filtered.slice(1);

  // When "All" — group remaining by subcategory
  const subcategoryGroups = useMemo(() => {
    if (filter !== "All") return null;
    const groups: Record<string, Product[]> = {};
    rest.forEach((p) => {
      if (!groups[p.subcategory]) groups[p.subcategory] = [];
      groups[p.subcategory].push(p);
    });
    return groups;
  }, [filter, rest]);

  const subcategoryMeta: Record<string, string> = {
    "High-Yield Savings": "Top-rated savings accounts offering 4%+ APY with no monthly fees.",
    "Checking": "Best checking accounts for everyday spending, cash back, and signup bonuses.",
    "Money Market": "Higher-yield accounts with check-writing privileges and FDIC insurance.",
    "CD": "Lock in today\u2019s high rates with certificates of deposit from 3 to 60 months.",
  };

  function toggleCompare(slug: string) {
    setCompareSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : prev.length < 3 ? [...prev, slug] : prev
    );
  }

  const compareProducts = compareSelected
    .map((s) => all.find((p) => p.slug === s))
    .filter(Boolean) as Product[];

  return (
    <div className="bg-[#fef6f1] overflow-x-hidden">
      <div className="border-b border-[#e4d9cf] bg-[#fef6f1]">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 text-[10px] sm:text-[11px] text-black/50 overflow-x-auto">
          <Link to="/" className="hover:text-[#0e4d45]">Home</Link>
          <span className="mx-1 sm:mx-1.5 text-black/30">/</span>
          <span className="text-black font-semibold whitespace-nowrap">Bank Accounts</span>
        </div>
      </div>
      {/* Page Header */}
      <section className="border-b border-[#e4d9cf]">
        <div className="max-w-6xl mx-auto px-4 py-7">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0e4d45] mb-2">Banking</div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-black leading-[1.05] mb-2">
            Best Bank Accounts of 2026
          </h1>
          <p className="text-sm text-[#1a1a1a] max-w-3xl leading-relaxed">
            Compare high-yield savings, checking, and money market accounts from top online banks. Independent rankings updated weekly.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#5a5a5a]">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#0e4d45]"></span>
            Rates as of January 2026 · Refreshed quarterly
          </div>

          {/* Stats */}
          <div className="mt-5 grid grid-cols-3 gap-2 max-w-lg">
            {[
              { label: "Accounts reviewed", value: "29" },
              { label: "Top APY", value: "4.10%" },
              { label: "Avg. bonus", value: "$200" },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-[#e4d9cf] rounded-sm p-3">
                <div className="font-serif text-xl font-bold text-black">{s.value}</div>
                <div className="text-[10px] text-[#5a5a5a] uppercase tracking-wider mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Rate Context Banner */}
          <div className="mt-5 flex flex-wrap gap-x-3 gap-y-2 text-[11px] border border-[#e4d9cf] rounded-sm bg-white px-3 sm:px-4 py-2.5 max-w-2xl">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#5a5a5a]">Fed Rate</span>
              <span className="font-serif font-bold text-black">3.50%&ndash;3.75%</span>
            </div>
            <div className="w-px bg-[#e4d9cf]" />
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#5a5a5a]">Nat&apos;l Avg Savings</span>
              <span className="font-serif font-bold text-[#540f04]">0.45%</span>
            </div>
            <div className="w-px bg-[#e4d9cf]" />
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#5a5a5a]">Top Rate Here</span>
              <span className="font-serif font-bold text-[#0e4d45]">4.10%</span>
            </div>
            <div className="w-px bg-[#e4d9cf]" />
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-[#5a5a5a] italic">Updated April 2026</span>
            </div>
          </div>

          <p className="mt-2 text-[10px] text-[#5a5a5a] italic">
            Ranked by APY, fees, minimums, and FDIC coverage. Editorial independence guaranteed &mdash; we never accept payment for rankings.
          </p>
          <div className="mt-5 max-w-3xl space-y-3 text-sm text-[#1a1a1a] leading-relaxed">
            <p>
              We review high-yield savings accounts, checking accounts, money-market accounts, and certificates of deposit from the online banks and national institutions that serve the majority of U.S. depositors. Every account on this page is FDIC-insured, funded by our editors during testing, and ranked on a rubric that weights APY (30%), fees (20%), access and convenience (15%), account features (15%), trust and safety (10%), and customer support (10%).
            </p>
            <p>
              Top online banks like <strong>SoFi</strong>, <strong>Ally</strong>, <strong>Marcus by Goldman Sachs</strong>, <strong>Barclays</strong>, and <strong>CIT Bank</strong> consistently out-yield the national average — currently 0.45% — by five to ten times. If you value branch access, <strong>Chase</strong>, <strong>Capital One</strong>, and <strong>PNC</strong> still appear in our rankings despite lower APYs. Bonuses are real but always come with fine print: qualifying direct deposits, minimum balances, and 60-to-90-day holding periods. We publish the exact terms inside each review so you can decide whether a stated bonus is worth chasing.
            </p>
            <p className="text-xs text-[#5a5a5a]">
              Rates and promotional offers change often. This page is reviewed weekly and every APY is stamped with the date of its most recent verification. Use the <strong>APY calculator</strong> below to estimate earnings on your deposit, the <strong>filters</strong> to narrow by account type or feature, and the <strong>compare checkboxes</strong> on each card to line up to three accounts side-by-side.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          <div className="min-w-0">

            {/* Filter + Sort Row */}
            <div className="mb-5 space-y-2.5">
              {/* Subcategory pills */}
              <div className="flex flex-wrap gap-1.5">
                {subs.map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilter(s)}
                    className={`px-2.5 py-1 rounded-sm text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                      filter === s
                        ? "bg-[#0e4d45] text-[#fef6f1]"
                        : "bg-white border border-[#e4d9cf] text-black hover:border-[#0e4d45] hover:text-[#0e4d45]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Sort + Filters row */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#5a5a5a]">Sort</label>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="text-[11px] border border-[#d4c5b8] bg-white rounded-sm px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#0e4d45] text-black"
                  >
                    <option value="default">Our Ranking</option>
                    <option value="apy">Highest APY</option>
                    <option value="bonus">Has Bonus</option>
                    <option value="rating">Top Rated</option>
                  </select>
                </div>

                <div className="w-px h-4 bg-[#e4d9cf]" />

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <div
                    onClick={() => setNoFees(!noFees)}
                    className={`w-7 h-4 rounded-full transition-colors relative cursor-pointer ${noFees ? "bg-[#0e4d45]" : "bg-[#d4c5b8]"}`}
                  >
                    <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${noFees ? "translate-x-3.5" : "translate-x-0.5"}`} />
                  </div>
                  <span className="text-[11px] text-[#1a1a1a] font-medium">No fees</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <div
                    onClick={() => setNoMin(!noMin)}
                    className={`w-7 h-4 rounded-full transition-colors relative cursor-pointer ${noMin ? "bg-[#0e4d45]" : "bg-[#d4c5b8]"}`}
                  >
                    <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${noMin ? "translate-x-3.5" : "translate-x-0.5"}`} />
                  </div>
                  <span className="text-[11px] text-[#1a1a1a] font-medium">No minimum</span>
                </label>

                <div className="sm:ml-auto text-[10px] text-[#5a5a5a] font-medium">
                  Showing <span className="font-bold text-black">{filtered.length}</span> of {all.length} accounts
                </div>
              </div>
            </div>

            {/* APY Calculator */}
            <ApyCalculator products={filtered} />

            {/* Hero Pick */}
            {hero && <HeroPick p={hero} />}

            {/* Remaining Products */}
            {filter === "All" && subcategoryGroups ? (
              // Grouped by subcategory
              Object.entries(subcategoryGroups).map(([sub, items]) => (
                <SubcategorySection
                  key={sub}
                  title={`Best ${sub} Accounts`}
                  description={subcategoryMeta[sub] || `Top-rated ${sub.toLowerCase()} accounts.`}
                  products={items}
                  startRank={2 + rest.slice(0, rest.indexOf(items[0])).length}
                  compareSelected={compareSelected}
                  onToggleCompare={toggleCompare}
                />
              ))
            ) : (
              // Flat filtered list
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                {rest.map((p, i) => (
                  <ComparableCard
                    key={p.slug}
                    p={p}
                    rank={i + 2}
                    isSelected={compareSelected.includes(p.slug)}
                    onToggle={() => toggleCompare(p.slug)}
                    compareDisabled={compareSelected.length >= 3 && !compareSelected.includes(p.slug)}
                  />
                ))}
              </div>
            )}

            {/* Related Guides — cross-link into editorial content */}
            <div className="mt-8">
              <RelatedGuidesForCategory categoryPath="/bank-accounts" />
            </div>

            {/* Editorial Footer */}
            <EditorialFooter />
          </div>

          <BankSidebar />
        </div>
      </div>

      {/* Compare floating bar */}
      <CompareBar
        selected={compareSelected}
        products={all}
        onRemove={(slug) => setCompareSelected((prev) => prev.filter((s) => s !== slug))}
        onClear={() => setCompareSelected([])}
        onCompare={() => setShowCompareModal(true)}
      />

      {showCompareModal && (
        <CompareModal products={compareProducts} onClose={() => setShowCompareModal(false)} />
      )}
    </div>
  );
}
