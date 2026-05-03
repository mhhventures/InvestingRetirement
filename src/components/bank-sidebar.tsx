import { Link } from "@tanstack/react-router";
import { products } from "@/data/products";
import { ProductLogo, StarRating } from "@/components/product-card";
import { NewsletterSignup } from "@/components/newsletter-signup";

const TOP_OFFERS = [
  {
    slug: "sofi-checking-savings",
    headline: "Earn 4.00% APY",
    sub: "$400 welcome bonus. No monthly fees. FDIC insured up to $3M.",
    cta: "Open Account",
  },
  {
    slug: "cit-platinum-savings",
    headline: "Up to 4.10% APY",
    sub: "0.35% APY Boost on balances of $5,000+. FDIC insured.",
    cta: "See Offer",
  },
  {
    slug: "bread-savings",
    headline: "4.00% APY, No Fees",
    sub: "Strong rate with top-tier CD lineup alongside.",
    cta: "See Offer",
  },
];

const RATES_BY_TYPE = [
  { label: "High-Yield Savings", value: "4.10%", avg: "0.45%", up: true },
  { label: "Checking (rewards)", value: "4.00%", avg: "0.07%", up: true },
  { label: "Money Market", value: "4.25%", avg: "0.60%", up: false },
  { label: "12-Month CD", value: "3.75%", avg: "1.82%", up: true },
];

const SAVINGS_COMPARE = [
  { name: "CIT Platinum", apy: "4.10%", fees: "$0", min: "$100" },
  { name: "SoFi Savings", apy: "4.00%", fees: "$0", min: "$0" },
  { name: "Bread Savings", apy: "4.00%", fees: "$0", min: "$100" },
  { name: "Chase Savings", apy: "0.01%", fees: "$5", min: "$300" },
];

const BANK_GUIDES: { slug: string; title: string }[] = [
  { slug: "best-high-yield-savings-accounts-may-2026", title: "Best High-Yield Savings Accounts for May 2026" },
  { slug: "savings-account-timeline", title: "Savings Account Guide: Matching Accounts to Your Timeline" },
  { slug: "roth-vs-traditional-ira", title: "Roth IRA vs. Traditional IRA: Which Is Right for You?" },
  { slug: "budget-basics-50-30-20", title: "Budget Basics: The 50/30/20 Rule Explained" },
  { slug: "stop-subscription-drain", title: "Subscriptions & Bills: Stop the Silent Drain" },
];

const TOP_RATED = products.filter((p) => p.category === "bank").slice(0, 4);

function SidebarBlock({
  title,
  children,
  action,
  actionTo,
}: {
  title: string;
  children: React.ReactNode;
  action?: string;
  actionTo?: string;
}) {
  return (
    <div className="bg-white border border-[#d4c5b8] rounded-sm shadow-sm">
      <div className="px-3 pt-3 pb-2 flex items-center justify-between border-b border-[#0e4d45]/20">
        <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0e4d45]">
          {title}
        </div>
        {action && actionTo && (
          <Link
            to={actionTo}
            className="text-[9px] text-[#5a5a5a] hover:text-[#0e4d45] transition-colors whitespace-nowrap uppercase tracking-wider font-semibold"
          >
            {action} &rarr;
          </Link>
        )}
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

export function BankSidebar() {
  return (
    <aside className="space-y-3 lg:sticky lg:top-20 lg:self-start">

      {/* Newsletter */}
      <NewsletterSignup
        source="sidebar-banking"
        headline="Rate Alerts Weekly"
        sub="We email the top APYs, new bonus offers, and rate drops every Thursday. Free."
      />

      {/* Rates by Account Type */}
      <SidebarBlock title="Rates by Account Type">
        <div className="divide-y divide-[#e4d9cf]">
          {RATES_BY_TYPE.map((r) => (
            <div key={r.label} className="py-2 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[11px] text-[#1a1a1a] font-medium">{r.label}</span>
                <span className={`font-serif font-bold text-sm ${r.up ? "text-[#0e4d45]" : "text-[#540f04]"}`}>
                  <span className="text-[9px] mr-0.5">{r.up ? "▲" : "▼"}</span>
                  {r.value}
                </span>
              </div>
              <div className="text-[9px] text-[#5a5a5a] tracking-wide">
                Nat&apos;l avg: <span className="font-semibold">{r.avg}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 pt-2 border-t border-[#e4d9cf] text-[9px] text-[#5a5a5a] italic">
          Fed funds rate: 4.50% &mdash; Updated April 2025
        </div>
      </SidebarBlock>

      {/* FDIC Coverage */}
      <SidebarBlock title="FDIC Coverage">
        <div className="border-l-[3px] border-[#0e4d45] pl-3">
          <div className="font-serif font-bold text-xl text-black mb-0.5">$250,000</div>
          <div className="text-[10px] text-[#5a5a5a] uppercase tracking-wider mb-2">Per depositor, per bank</div>
          <p className="text-[11px] text-[#1a1a1a] leading-snug">
            All accounts on this page are FDIC-insured. Some, like SoFi, offer up to $2M through partner banks.
          </p>
        </div>
      </SidebarBlock>

      {/* Featured Offers */}
      <SidebarBlock title="Featured Accounts">
        <div className="space-y-3">
          {TOP_OFFERS.map((o, idx) => {
            const p = products.find((x) => x.slug === o.slug);
            if (!p) return null;
            return (
              <Link
                key={o.slug}
                to="/product/$slug"
                params={{ slug: o.slug }}
                className={`block group pl-2.5 border-l-[3px] border-[#0e4d45] ${idx !== 0 ? "pt-2.5 border-t border-t-[#e4d9cf]" : ""}`}
              >
                <div className="flex items-start gap-2">
                  <ProductLogo p={p} size={30} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] text-[#5a5a5a] uppercase tracking-wider">{p.provider}</div>
                    <div className="font-serif text-sm font-bold text-black leading-tight group-hover:text-[#0e4d45] transition-colors">
                      {o.headline}
                    </div>
                    <div className="text-[10px] text-[#5a5a5a] mt-0.5 leading-snug">{o.sub}</div>
                    <div className="mt-1.5">
                      <span className="inline-block text-[9px] font-semibold uppercase tracking-wider text-[#0e4d45] group-hover:underline">
                        {o.cta} &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </SidebarBlock>

      {/* Quick Compare */}
      <SidebarBlock title="Quick Compare: Savings" action="Full Rankings" actionTo="/bank-accounts">
        <div className="overflow-x-auto -mx-3">
          <table className="w-full text-[10px] whitespace-nowrap">
            <thead>
              <tr className="bg-[#f7ebe2] border-b-2 border-[#0e4d45]">
                <th className="text-left font-bold py-1.5 pl-3 pr-1 uppercase tracking-wider text-[9px] text-[#0e4d45]">Bank</th>
                <th className="text-right font-bold py-1.5 px-1 uppercase tracking-wider text-[9px] text-[#0e4d45]">APY</th>
                <th className="text-right font-bold py-1.5 pl-1 pr-3 uppercase tracking-wider text-[9px] text-[#0e4d45]">Fees</th>
              </tr>
            </thead>
            <tbody>
              {SAVINGS_COMPARE.map((row) => (
                <tr key={row.name} className="bg-white border-b border-[#e4d9cf] last:border-b-0">
                  <td className="py-1.5 text-black font-medium pl-3 pr-1">{row.name}</td>
                  <td className="py-1.5 text-right font-serif font-bold text-[#0e4d45] px-1">{row.apy}</td>
                  <td className="py-1.5 text-right text-[#1a1a1a] pl-1 pr-3">{row.fees}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SidebarBlock>

      {/* Top Rated Banks */}
      <SidebarBlock title="Top Rated Banks" action="All Reviews" actionTo="/reviews">
        <ul className="divide-y divide-[#e4d9cf]">
          {TOP_RATED.map((p, i) => (
            <li key={p.slug} className="py-2 first:pt-0 last:pb-0">
              <Link to="/product/$slug" params={{ slug: p.slug }} className="flex items-center gap-2 group">
                <span className="font-serif text-base font-bold text-[#0e4d45] w-5 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <ProductLogo p={p} size={26} />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold text-black truncate group-hover:text-[#0e4d45] transition-colors">
                    {p.name}
                  </div>
                  <StarRating rating={p.rating} size="sm" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </SidebarBlock>

      {/* Banking Guides */}
      <SidebarBlock title="Banking Guides" action="All Guides" actionTo="/guides">
        <ul className="divide-y divide-[#e4d9cf] text-[11px]">
          {BANK_GUIDES.map((g) => (
            <li key={g.slug} className="py-1.5 first:pt-0 last:pb-0">
              <Link to="/guides/$articleId" params={{ articleId: g.slug }} className="text-[#1a1a1a] hover:text-[#0e4d45] leading-snug block">
                {g.title}
              </Link>
            </li>
          ))}
        </ul>
      </SidebarBlock>

      <div className="text-[9px] text-[#5a5a5a] leading-snug px-1 italic">
        Advertiser Disclosure: We may be compensated when you click on offer links. This does not influence our editorial rankings.
      </div>
    </aside>
  );
}
