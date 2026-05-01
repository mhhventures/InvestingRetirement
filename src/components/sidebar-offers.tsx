import { Link } from "@tanstack/react-router";
import { products } from "@/data/products";
import { ProductLogo, StarRating } from "@/components/product-card";

const TRUSTED = products.filter((p) => p.editorsPick).slice(0, 4);

const TOP_OFFERS = [
  {
    slug: "sofi-checking-savings",
    headline: "Earn 4.00% APY",
    sub: "No monthly fees. FDIC insured.",
    cta: "Open Account",
  },
  {
    slug: "fidelity",
    headline: "$0 Commission Trades",
    sub: "Plus industry-best research.",
    cta: "Start Investing",
  },
  {
    slug: "chase-total-checking",
    headline: "$300 Welcome Bonus",
    sub: "With qualifying direct deposit.",
    cta: "See Offer",
  },
];

const CURRENT_RATES = [
  { label: "High-Yield Savings", value: "4.15%", up: true },
  { label: "12-Month CD", value: "3.75%", up: true },
  { label: "24-Month CD", value: "3.75%", up: false },
  { label: "30-Year Mortgage", value: "7.22%", up: false },
];

const SAVINGS_COMPARE = [
  { name: "SoFi Savings", apy: "4.00%", bonus: "$400" },
  { name: "Marcus", apy: "3.50%", bonus: "None" },
  { name: "Ally Savings", apy: "3.10%", bonus: "None" },
  { name: "Chase Savings", apy: "0.01%", bonus: "$300" },
];

const INVESTING_COMPARE = [
  { name: "Fidelity", fees: "$0", bonus: "None" },
  { name: "Robinhood", fees: "$0", bonus: "1% Match" },
  { name: "Betterment", fees: "0.25%", bonus: "None" },
  { name: "Schwab", fees: "$0", bonus: "None" },
];

// Editorial sidebar block: white card, green uppercase label at top, thin green rule, content below.
// Mirrors the clean Guides card aesthetic — no black/green header fills.
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
        <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] text-[#0e4d45]">
          {title}
        </div>
        {action && actionTo && (
          <Link
            to={actionTo}
            className="text-[9px] sm:text-[10px] text-[#5a5a5a] hover:text-[#0e4d45] transition-colors whitespace-nowrap uppercase tracking-wider font-semibold"
          >
            {action} &rarr;
          </Link>
        )}
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="space-y-3 lg:sticky lg:top-20 lg:self-start">
      {/* Current Rates */}
      <SidebarBlock title="Current Rates" action="Compare" actionTo="/bank-accounts">
        <div className="divide-y divide-[#e4d9cf]">
          {CURRENT_RATES.map((r) => (
            <div
              key={r.label}
              className="flex items-center justify-between text-[11px] sm:text-[12px] py-1.5 first:pt-0 last:pb-0"
            >
              <span className="text-[#1a1a1a] truncate pr-2">{r.label}</span>
              <span
                className={`font-serif font-bold whitespace-nowrap text-sm ${
                  r.up ? "text-[#0e4d45]" : "text-[#540f04]"
                }`}
              >
                <span className="text-[9px] mr-0.5">{r.up ? "\u25B2" : "\u25BC"}</span>
                {r.value}
              </span>
            </div>
          ))}
        </div>
      </SidebarBlock>

      {/* Featured Offers */}
      <SidebarBlock title="Featured Offers">
        <div className="space-y-2.5 sm:space-y-3">
          {TOP_OFFERS.map((o, idx) => {
            const p = products.find((x) => x.slug === o.slug);
            if (!p) return null;
            const sep = p.url.includes("?") ? "&" : "?";
            const affiliateUrl = `${p.url}${sep}utm_source=canyon&utm_medium=sidebar&utm_campaign=featured_offers&utm_content=${o.slug}`;
            return (
              <a
                key={o.slug}
                href={affiliateUrl}
                target="_blank"
                rel="noopener sponsored"
                className={`block group pl-2.5 border-l-[3px] border-[#0e4d45] ${
                  idx !== 0 ? "pt-2.5 border-t border-t-[#e4d9cf]" : ""
                }`}
              >
                <div className="flex items-start gap-2">
                  <ProductLogo p={p} size={30} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] sm:text-[10px] text-[#5a5a5a] uppercase tracking-wider">
                      {p.provider}
                    </div>
                    <div className="font-serif text-[13px] sm:text-sm font-bold text-black leading-tight group-hover:text-[#0e4d45] transition-colors">
                      {o.headline}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-[#5a5a5a] mt-0.5 leading-snug">
                      {o.sub}
                    </div>
                    <div className="mt-1.5">
                      <span className="inline-block text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-[#0e4d45] group-hover:underline">
                        {o.cta} &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </SidebarBlock>

      {/* Quick Compare: Savings — ivory-deep header instead of solid green fill */}
      <SidebarBlock title="Quick Compare: Savings" action="Full Table" actionTo="/bank-accounts">
        <div className="overflow-x-auto -mx-3">
          <table className="w-full text-[10px] sm:text-[11px] whitespace-nowrap">
            <thead>
              <tr className="bg-[#f7ebe2] border-b-2 border-[#0e4d45]">
                <th className="text-left font-bold py-1.5 pl-3 pr-1 uppercase tracking-wider text-[9px] text-[#0e4d45]">
                  Bank
                </th>
                <th className="text-right font-bold py-1.5 px-1 uppercase tracking-wider text-[9px] text-[#0e4d45]">
                  APY
                </th>
                <th className="text-right font-bold py-1.5 pl-1 pr-3 uppercase tracking-wider text-[9px] text-[#0e4d45]">
                  Bonus
                </th>
              </tr>
            </thead>
            <tbody>
              {SAVINGS_COMPARE.map((row) => (
                <tr key={row.name} className="bg-white border-b border-[#e4d9cf] last:border-b-0">
                  <td className="py-1.5 text-black font-medium pl-3 pr-1">{row.name}</td>
                  <td className="py-1.5 text-right font-serif font-bold text-[#0e4d45] px-1">
                    {row.apy}
                  </td>
                  <td className="py-1.5 text-right text-[#1a1a1a] pl-1 pr-3">{row.bonus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SidebarBlock>

      {/* Quick Compare: Investing */}
      <SidebarBlock title="Quick Compare: Investing" action="Full Table" actionTo="/investing">
        <div className="overflow-x-auto -mx-3">
          <table className="w-full text-[10px] sm:text-[11px] whitespace-nowrap">
            <thead>
              <tr className="bg-[#f7ebe2] border-b-2 border-[#0e4d45]">
                <th className="text-left font-bold py-1.5 pl-3 pr-1 uppercase tracking-wider text-[9px] text-[#0e4d45]">
                  Broker
                </th>
                <th className="text-right font-bold py-1.5 px-1 uppercase tracking-wider text-[9px] text-[#0e4d45]">
                  Fees
                </th>
                <th className="text-right font-bold py-1.5 pl-1 pr-3 uppercase tracking-wider text-[9px] text-[#0e4d45]">
                  Bonus
                </th>
              </tr>
            </thead>
            <tbody>
              {INVESTING_COMPARE.map((row) => (
                <tr key={row.name} className="bg-white border-b border-[#e4d9cf] last:border-b-0">
                  <td className="py-1.5 text-black font-medium pl-3 pr-1">{row.name}</td>
                  <td className="py-1.5 text-right font-serif font-bold text-[#0e4d45] px-1">
                    {row.fees}
                  </td>
                  <td className="py-1.5 text-right text-[#1a1a1a] pl-1 pr-3">{row.bonus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SidebarBlock>

      {/* Best Offers This Month — replace black promo block with editorial treatment */}
      <SidebarBlock title="Best Offers This Month" action="View All" actionTo="/guides/best-bank-bonuses-this-month">
        <div className="border-l-[3px] border-[#0e4d45] pl-3">
          <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-[#540f04] mb-1.5">
            &#9650; Limited Time
          </div>
          <div className="font-serif text-sm sm:text-base font-bold leading-tight mb-1.5 text-black">
            Get up to $300 when you open a SoFi account
          </div>
          <p className="text-[10px] sm:text-[11px] text-[#5a5a5a] leading-snug mb-2.5">
            Open a new SoFi Checking and Savings account with qualifying direct deposits.
          </p>
          {(() => {
            const sofi = products.find((x) => x.slug === "sofi-checking-savings");
            const base = sofi?.url || "#";
            const sep = base.includes("?") ? "&" : "?";
            const href = `${base}${sep}utm_source=canyon&utm_medium=sidebar&utm_campaign=best_offers_this_month&utm_content=sofi-checking-savings`;
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener sponsored"
                className="inline-block w-full text-center text-[10px] sm:text-[11px] font-semibold bg-[#0e4d45] hover:bg-[#0a3832] text-[#fef6f1] rounded-sm px-3 py-2 transition-colors uppercase tracking-wider"
              >
                See Offer
              </a>
            );
          })()}
        </div>
      </SidebarBlock>

      {/* Top Rated */}
      <SidebarBlock title="Top Rated" action="All Reviews" actionTo="/reviews">
        <ul className="divide-y divide-[#e4d9cf]">
          {TRUSTED.map((p, i) => (
            <li key={p.slug} className="py-2 first:pt-0 last:pb-0">
              <Link
                to="/product/$slug"
                params={{ slug: p.slug }}
                className="flex items-center gap-2 group"
              >
                <span className="font-serif text-sm sm:text-base font-bold text-[#0e4d45] w-5 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <ProductLogo p={p} size={26} />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] sm:text-xs font-semibold text-black truncate group-hover:text-[#0e4d45] transition-colors">
                    {p.name}
                  </div>
                  <StarRating rating={p.rating} size="sm" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </SidebarBlock>

      {/* Popular Guides */}
      <SidebarBlock title="Popular Guides" action="All Guides" actionTo="/guides">
        <ul className="divide-y divide-[#e4d9cf] text-[11px] sm:text-[12px]">
          {[
            { slug: "best-high-yield-savings-accounts-may-2026", title: "Best High-Yield Savings Accounts for May 2026" },
            { slug: "budget-basics-50-30-20", title: "Budget Basics: The 50/30/20 Rule Explained" },
            { slug: "retirement-investing", title: "Retirement Investing: The 20x Rule" },
            { slug: "roth-vs-traditional-ira", title: "Roth IRA vs. Traditional IRA: Which Is Right for You?" },
          ].map((g) => (
            <li key={g.slug} className="py-1.5 first:pt-0 last:pb-0">
              <Link to="/guides/$articleId" params={{ articleId: g.slug }} className="text-[#1a1a1a] hover:text-[#0e4d45] leading-snug block">
                {g.title}
              </Link>
            </li>
          ))}
        </ul>
      </SidebarBlock>

      <div className="text-[9px] sm:text-[10px] text-[#5a5a5a] leading-snug px-1 italic">
        Advertiser Disclosure: We may be compensated when you click on offer links. This does not
        influence our editorial rankings.
      </div>
    </aside>
  );
}
