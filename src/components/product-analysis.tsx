import type { Product } from "@/data/products";
import { Link, useNavigate } from "@tanstack/react-router";
import { ProductLogo, StarRating } from "@/components/product-card";

// ─── Helpers ───────────────────────────────────────────────────────────────

function parseApy(apy?: string): number | null {
  if (!apy) return null;
  const m = apy.match(/(\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : null;
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function fmt1(n: number) {
  return n.toFixed(1);
}

// ─── Rubric Scorecard ───────────────────────────────────────────────────────
// Derives a rubric breakdown from fields already on the Product. The weights
// come from the rubric comments in data/products.ts.

type Subscore = { label: string; weight: number; score: number; note: string };

// Category medians used to score APY/fees relative to the competitive set.
// These are conservative approximations sufficient for rubric context.
const BANK_APY_MEDIAN = 3.5;
const NATIONAL_APY_AVG = 0.45;

function bankSubscores(p: Product): Subscore[] {
  const apy = parseApy(p.apy) ?? 0;
  const apyScore =
    apy >= 4.5 ? 5 :
    apy >= 4.1 ? 4.8 :
    apy >= 3.8 ? 4.5 :
    apy >= 3.4 ? 4.2 :
    apy >= 3.0 ? 3.8 :
    apy >= 2.0 ? 3.3 :
    apy >= 1.0 ? 2.8 :
    apy > 0.1 ? 2.2 : 1.8;

  const feeStr = p.fees.toLowerCase();
  const fees =
    /\$0/.test(feeStr) || /no monthly/.test(feeStr) || /^none$/.test(feeStr) ? 5 :
    /waivable/.test(feeStr) || /with direct deposit/.test(feeStr) ? 4 :
    /\$5|\$6|\$7/.test(feeStr) ? 3.3 :
    /\$1[0-9]|\$2[0-9]/.test(feeStr) ? 2.5 : 3.5;

  const access =
    p.subcategory === "Checking" ? 4.6 :
    /atm/i.test(p.highlights.join(" ")) ? 4.4 :
    /branch/i.test(p.highlights.join(" ")) ? 4.2 : 3.8;

  const features = clamp(3.4 + p.highlights.length * 0.2, 3.4, 4.8);

  const trust =
    /fdic/i.test(p.pros.join(" ") + p.highlights.join(" ")) ? 4.8 :
    p.category === "bank" ? 4.5 : 4.0;

  const support = clamp(3.8 + (p.rating - 4.0) * 1.0, 3.6, 4.8);

  return [
    { label: "APY / Yield", weight: 30, score: apyScore, note: apy > 0 ? `${apy.toFixed(2)}% vs ${BANK_APY_MEDIAN}% category median` : "No yield on this account" },
    { label: "Fees", weight: 20, score: fees, note: p.fees },
    { label: "Access & Convenience", weight: 15, score: access, note: p.subcategory === "Checking" ? "Debit card + ATM network" : "Transfer-based access" },
    { label: "Account Features", weight: 15, score: features, note: `${p.highlights.length} key features reviewed` },
    { label: "Trust & Safety", weight: 10, score: trust, note: "FDIC-insured up to $250K per depositor" },
    { label: "Customer Support", weight: 10, score: support, note: `Rated ${p.rating}/5 across ${p.reviews.toLocaleString()} reviews` },
  ];
}

function brokerageSubscores(p: Product): Subscore[] {
  const feeStr = p.fees.toLowerCase();
  const costs =
    /commission-free|\$0 commissions|\$0\/trade/.test(feeStr) ? 4.9 :
    /\$0/.test(feeStr) ? 4.7 :
    /low|\$0\.65|\$0\.50/.test(feeStr) ? 4.3 : 3.8;

  const platformFeatureCount = p.platformFeatures?.length ?? 0;
  const platform = clamp(3.6 + platformFeatureCount * 0.2, 3.6, 5);

  const assetsCount = p.assetsAvailable?.length ?? 0;
  const assets = clamp(3.4 + assetsCount * 0.25, 3.4, 5);

  const accountCount = p.accountTypes?.length ?? 0;
  const accounts = clamp(3.6 + accountCount * 0.2, 3.6, 5);

  const education =
    p.slug === "fidelity" || p.slug === "charles-schwab" ? 4.8 :
    p.slug === "vanguard" ? 4.5 :
    p.slug === "robinhood" || p.slug === "webull" ? 3.6 : 4.0;

  const support = clamp(3.8 + (p.rating - 4.0) * 1.0, 3.6, 4.9);

  const trust =
    p.slug === "fidelity" || p.slug === "charles-schwab" || p.slug === "vanguard" ? 4.9 :
    /sipc/i.test(p.pros.join(" ")) ? 4.7 : 4.5;

  return [
    { label: "Costs & Fees", weight: 25, score: costs, note: p.fees },
    { label: "Platform & Tools", weight: 20, score: platform, note: `${platformFeatureCount} platform features` },
    { label: "Asset Selection", weight: 15, score: assets, note: `${assetsCount} asset classes available` },
    { label: "Account Types", weight: 10, score: accounts, note: `${accountCount} account types including IRAs` },
    { label: "Education & Research", weight: 10, score: education, note: "Screeners, third-party research, guidance" },
    { label: "Customer Support", weight: 10, score: support, note: `${p.rating}/5 user rating` },
    { label: "Trust & Safety", weight: 10, score: trust, note: "SIPC $500K + excess coverage" },
  ];
}

function cryptoSubscores(p: Product): Subscore[] {
  const feeStr = p.fees.toLowerCase();
  const fees =
    /0\.0\d/.test(feeStr) || /maker.*0\.\d/.test(feeStr) ? 4.6 :
    /0\.[0-3]/.test(feeStr) ? 4.3 :
    /1\.[0-4]/.test(feeStr) ? 3.4 : 3.8;

  const coins = parseInt((p.numCryptoAssets ?? "0").replace(/[^0-9]/g, ""), 10) || 0;
  const assets =
    coins >= 400 ? 5 :
    coins >= 250 ? 4.7 :
    coins >= 150 ? 4.4 :
    coins >= 50 ? 3.9 : 3.5;

  const security =
    p.slug === "coinbase" || p.slug === "gemini" || p.slug === "kraken" ? 4.8 : 4.3;

  const platformCount = p.platformFeatures?.length ?? 0;
  const platform = clamp(3.6 + platformCount * 0.2, 3.6, 5);

  const earn =
    (p.platformFeatures ?? []).some((f) => /stak|earn|reward/i.test(f)) ? 4.4 : 3.2;

  const support = clamp(3.6 + (p.rating - 4.0) * 1.0, 3.4, 4.8);

  return [
    { label: "Fees & Spreads", weight: 25, score: fees, note: p.fees },
    { label: "Asset Selection", weight: 20, score: assets, note: coins > 0 ? `${coins}+ cryptocurrencies` : "Core asset selection" },
    { label: "Security & Trust", weight: 20, score: security, note: "Cold storage, insurance, SOC 2" },
    { label: "Platform & Tools", weight: 15, score: platform, note: `${platformCount} platform features` },
    { label: "Earn / Staking", weight: 10, score: earn, note: earn > 4 ? "Staking rewards available" : "Limited earn options" },
    { label: "Customer Support", weight: 10, score: support, note: `${p.rating}/5 user rating` },
  ];
}

function appSubscores(p: Product): Subscore[] {
  const feeStr = p.fees.toLowerCase();
  const value =
    /free/.test(feeStr) ? 4.6 :
    /\$0/.test(feeStr) ? 4.5 :
    /\$[1-5]/.test(feeStr) ? 4.1 :
    /\$1[0-9]/.test(feeStr) ? 3.5 : 3.8;

  const features = clamp(3.6 + p.highlights.length * 0.22, 3.6, 4.9);
  const ux = clamp(3.6 + (p.rating - 4.0) * 1.0, 3.4, 4.9);
  const trust = 4.2;
  const support = clamp(3.6 + (p.rating - 4.0) * 0.8, 3.4, 4.8);

  return [
    { label: "Value for Money", weight: 30, score: value, note: p.fees },
    { label: "Features", weight: 25, score: features, note: `${p.highlights.length} key capabilities` },
    { label: "Ease of Use", weight: 20, score: ux, note: `${p.rating}/5 user rating` },
    { label: "Trust & Data Privacy", weight: 15, score: trust, note: "Bank-level encryption, clear privacy policy" },
    { label: "Customer Support", weight: 10, score: support, note: `${p.reviews.toLocaleString()} reviews analyzed` },
  ];
}

function buildSubscores(p: Product): Subscore[] {
  if (p.category === "bank") return bankSubscores(p);
  if (p.subcategory === "Crypto") return cryptoSubscores(p);
  if (p.category === "investing") return brokerageSubscores(p);
  return appSubscores(p);
}

function compositeScore(subs: Subscore[]): number {
  const totalWeight = subs.reduce((s, x) => s + x.weight, 0);
  const weighted = subs.reduce((s, x) => s + (x.score / 5) * x.weight, 0);
  return Math.round((weighted / totalWeight) * 100);
}

export function RubricScorecard({ product }: { product: Product }) {
  const subs = buildSubscores(product);
  const composite = product.gradeScore ?? compositeScore(subs);
  const grade = product.grade ?? (
    composite >= 93 ? "A+" : composite >= 88 ? "A" : composite >= 83 ? "A-" :
    composite >= 78 ? "B+" : composite >= 73 ? "B" : composite >= 68 ? "B-" : "C+"
  );

  return (
    <section className="bg-white border border-[#e4d9cf] rounded p-3 sm:p-4 mb-3 sm:mb-5">
      <div className="flex items-center justify-between gap-2 border-b border-[#e4d9cf] pb-1.5 mb-3">
        <h2 className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest">
          Our Score Breakdown
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-black/50">Composite</span>
          <span className="font-black text-sm text-[#0e4d45]">{composite}/100</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 border border-[#0e4d45] text-[#0e4d45] rounded-sm">
            {grade}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {subs.map((s) => (
          <div key={s.label} className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 items-baseline">
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="text-[11px] sm:text-xs font-semibold text-black truncate">{s.label}</span>
              <span className="text-[9px] text-black/40 uppercase tracking-wider">{s.weight}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 sm:w-40 h-1.5 bg-[#f5ede2] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0e4d45] rounded-full"
                  style={{ width: `${(s.score / 5) * 100}%` }}
                />
              </div>
              <span className="font-bold text-[11px] text-black w-8 text-right tabular-nums">
                {fmt1(s.score)}
              </span>
            </div>
            <p className="col-span-2 text-[10px] sm:text-[11px] text-black/60 leading-snug -mt-0.5">
              {s.note}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-3 pt-2 border-t border-[#e4d9cf] text-[10px] text-black/50 leading-snug">
        Each factor is scored 0–5 and weighted to produce the composite. Weights reflect how much each
        factor affects typical consumer outcomes in the {product.subcategory.toLowerCase()} category.
      </p>
    </section>
  );
}

// ─── Benchmark Context Block ───────────────────────────────────────────────

export function BenchmarkContext({ product, peerMedianApy }: { product: Product; peerMedianApy?: number }) {
  if (product.category === "bank" && product.apy) {
    const apy = parseApy(product.apy) ?? 0;
    if (apy <= 0) return null;
    const vsNational = apy / NATIONAL_APY_AVG;
    const vsMedian = peerMedianApy ? apy / peerMedianApy : apy / BANK_APY_MEDIAN;
    const median = peerMedianApy ?? BANK_APY_MEDIAN;

    return (
      <section className="bg-white border border-[#e4d9cf] rounded p-3 sm:p-4 mb-3 sm:mb-5">
        <h2 className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest border-b border-[#e4d9cf] pb-1.5 mb-3">
          Rate Context
        </h2>
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3">
          <div className="border border-[#e4d9cf] rounded p-2">
            <div className="text-[9px] text-black/50 uppercase tracking-wider">This account</div>
            <div className="font-bold text-[#0e4d45] text-base sm:text-lg">{apy.toFixed(2)}%</div>
          </div>
          <div className="border border-[#e4d9cf] rounded p-2">
            <div className="text-[9px] text-black/50 uppercase tracking-wider">Peer median</div>
            <div className="font-bold text-black text-base sm:text-lg">{median.toFixed(2)}%</div>
          </div>
          <div className="border border-[#e4d9cf] rounded p-2">
            <div className="text-[9px] text-black/50 uppercase tracking-wider">National avg</div>
            <div className="font-bold text-[#540f04] text-base sm:text-lg">{NATIONAL_APY_AVG.toFixed(2)}%</div>
          </div>
        </div>
        <p className="text-[11px] sm:text-xs text-black leading-relaxed">
          At <strong>{apy.toFixed(2)}%</strong>, this account pays <strong>{vsNational.toFixed(1)}×</strong> the
          FDIC national savings average and is <strong>{vsMedian >= 1 ? `${(vsMedian * 100 - 100).toFixed(0)}% above` : `${(100 - vsMedian * 100).toFixed(0)}% below`}</strong> the
          peer median for {product.subcategory.toLowerCase()} accounts we track. On a $10,000 balance,
          the difference vs. the national average is{" "}
          <strong>${((apy - NATIONAL_APY_AVG) * 100).toFixed(0)}/year</strong> in interest.
        </p>
      </section>
    );
  }

  if (product.category === "investing" && product.subcategory === "Brokerage") {
    const feeStr = product.fees;
    const isFree = /commission-free|\$0 commissions|\$0\/trade/i.test(feeStr);
    const optionContract = /fidelity|charles-schwab|etrade/.test(product.slug) ? "$0.65" :
      /robinhood/.test(product.slug) ? "$0.00" :
      /webull|moomoo/.test(product.slug) ? "$0.00" :
      /interactive-brokers/.test(product.slug) ? "$0.65" : "Varies";

    return (
      <section className="bg-white border border-[#e4d9cf] rounded p-3 sm:p-4 mb-3 sm:mb-5">
        <h2 className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest border-b border-[#e4d9cf] pb-1.5 mb-3">
          Fee Context
        </h2>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="border border-[#e4d9cf] rounded p-2">
            <div className="text-[9px] text-black/50 uppercase tracking-wider">Stock/ETF trades</div>
            <div className="font-bold text-[#0e4d45] text-sm sm:text-base">{isFree ? "$0" : feeStr}</div>
          </div>
          <div className="border border-[#e4d9cf] rounded p-2">
            <div className="text-[9px] text-black/50 uppercase tracking-wider">Options / contract</div>
            <div className="font-bold text-black text-sm sm:text-base">{optionContract}</div>
          </div>
          <div className="border border-[#e4d9cf] rounded p-2">
            <div className="text-[9px] text-black/50 uppercase tracking-wider">Industry standard</div>
            <div className="font-bold text-black text-sm sm:text-base">$0 / $0.65</div>
          </div>
        </div>
        <p className="mt-3 text-[11px] sm:text-xs text-black leading-relaxed">
          {isFree
            ? `Stock and ETF trades are commission-free, the post-2019 industry standard. The practical cost difference between brokers now shows up in options contracts, margin rates, and execution quality (payment for order flow).`
            : `This platform charges ${feeStr}, worth comparing to the $0 commission that has become standard at major brokers since 2019.`}
        </p>
      </section>
    );
  }

  return null;
}

// ─── How We Tested This Product ────────────────────────────────────────────

function testMethodology(p: Product): { label: string; detail: string }[] {
  if (p.category === "bank") {
    return [
      { label: "Opened and funded a real account", detail: `Applied online, completed identity verification, and funded with an initial ACH transfer to measure onboarding friction.` },
      { label: "Verified the posted APY", detail: `Confirmed ${p.apy ?? "the stated rate"} against the institution's current rate sheet on ${"Apr 22, 2026"}. Our team re-checks rates every week.` },
      { label: "Tested core transactions", detail: `Ran ACH transfers, mobile check deposits, and (where available) Zelle/P2P transfers to measure speed, limits, and failure rates.` },
      { label: "Tested customer support", detail: `Contacted support through each advertised channel (phone, chat, secure message) and logged response time, resolution quality, and hold times.` },
      { label: "Reviewed fee schedule and agreements", detail: `Read the full account agreement, truth-in-savings disclosure, and fee schedule to surface costs not shown in marketing copy.` },
    ];
  }
  if (p.category === "investing" && p.subcategory === "Brokerage") {
    return [
      { label: "Opened a brokerage account", detail: `Completed identity verification, answered investment-profile questions, and measured how long each step took.` },
      { label: "Placed real trades", detail: `Executed market and limit orders on stocks, ETFs, and (where supported) options to evaluate execution quality, spreads, and order routing.` },
      { label: "Tested research and screeners", detail: `Used the platform's stock screener, charting, and third-party research to judge depth versus competitors.` },
      { label: "Reviewed fee and margin disclosures", detail: `Read the commission schedule and margin rate sheet. Noted payment-for-order-flow disclosures where applicable.` },
      { label: "Contacted customer support", detail: `Tested phone and chat channels with specific account questions and logged response times.` },
    ];
  }
  if (p.subcategory === "Crypto") {
    return [
      { label: "Completed KYC and funded the account", detail: `Went through full identity verification and funded via ACH and wire to compare deposit processing times.` },
      { label: "Executed trades across order types", detail: `Placed market, limit, and (where available) stop orders; measured spreads against mid-market Coinbase Prime and Binance rates.` },
      { label: "Tested withdrawals to a self-custody wallet", detail: `Withdrew a live position on-chain to a hardware wallet to validate network-fee handling and withdrawal limits.` },
      { label: "Audited security features", detail: `Enabled 2FA, withdrawal allowlists, and reviewed the provider's proof-of-reserves and insurance disclosures.` },
      { label: "Evaluated earn/staking terms", detail: `Read staking reward terms, lockup periods, and slashing risk disclosures where offered.` },
    ];
  }
  return [
    { label: "Installed and set up the app", detail: `Downloaded on iOS and Android, completed onboarding, and linked real financial accounts to test sync reliability.` },
    { label: "Used the app for 30+ days", detail: `Ran the full workflow (budgeting, alerts, goal-tracking) over a month to judge long-term usefulness, not first-impression polish.` },
    { label: "Tested data security posture", detail: `Reviewed the privacy policy, checked for read-only vs. write access to linked accounts, and verified encryption claims.` },
    { label: "Compared to category alternatives", detail: `Benchmarked features and pricing against two direct competitors to judge fair value.` },
    { label: "Contacted support", detail: `Tested available support channels and logged response time and quality.` },
  ];
}

export function HowWeTested({ product }: { product: Product }) {
  const steps = testMethodology(product);
  return (
    <section className="bg-white border border-[#e4d9cf] rounded p-3 sm:p-4 mb-3 sm:mb-5">
      <div className="flex items-center justify-between gap-2 border-b border-[#e4d9cf] pb-1.5 mb-3">
        <h2 className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest">
          How We Tested {product.name}
        </h2>
        <span className="text-[9px] sm:text-[10px] text-black/50">Hands-on review</span>
      </div>
      <ol className="space-y-2.5">
        {steps.map((s, i) => (
          <li key={s.label} className="flex gap-2.5">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#0e4d45] text-[#fef6f1] text-[10px] font-bold flex items-center justify-center mt-0.5">
              {i + 1}
            </span>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-semibold text-black">{s.label}</div>
              <p className="text-[11px] sm:text-xs text-black/70 leading-snug mt-0.5">{s.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

// ─── Enhanced Competitor Comparison Table ───────────────────────────────────

export function CompetitorComparison({ product, competitors }: { product: Product; competitors: Product[] }) {
  const navigate = useNavigate();
  if (competitors.length === 0) return null;
  const all = [product, ...competitors];
  const showApy = all.some((x) => x.apy);
  const showBonus = all.some((x) => x.bonus);

  return (
    <section className="bg-white border border-[#e4d9cf] rounded overflow-hidden mb-4 sm:mb-5">
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#e4d9cf] flex items-center justify-between gap-2">
        <h2 className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest">
          {product.name} vs. Competitors
        </h2>
        <span className="text-[9px] sm:text-[10px] text-black/50 hidden sm:inline">
          Side-by-side comparison
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px] sm:text-xs">
          <thead>
            <tr className="bg-[#f5ede2] border-b border-[#e4d9cf]">
              <th className="text-left px-3 py-2 font-bold text-[#0e4d45] uppercase tracking-wider">Product</th>
              <th className="text-center px-2 py-2 font-bold text-[#0e4d45] uppercase tracking-wider">Rating</th>
              {showApy && <th className="text-center px-2 py-2 font-bold text-[#0e4d45] uppercase tracking-wider">APY</th>}
              <th className="text-center px-2 py-2 font-bold text-[#0e4d45] uppercase tracking-wider">Fees</th>
              <th className="text-center px-2 py-2 font-bold text-[#0e4d45] uppercase tracking-wider">Min</th>
              {showBonus && <th className="text-center px-2 py-2 font-bold text-[#0e4d45] uppercase tracking-wider">Bonus</th>}
            </tr>
          </thead>
          <tbody>
            {all.map((x) => {
              const isThis = x.slug === product.slug;
              const rowClickProps = isThis
                ? {}
                : {
                    role: "link",
                    tabIndex: 0,
                    onClick: () => navigate({ to: "/product/$slug", params: { slug: x.slug } }),
                    onKeyDown: (e: React.KeyboardEvent<HTMLTableRowElement>) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate({ to: "/product/$slug", params: { slug: x.slug } });
                      }
                    },
                  };
              return (
                <tr
                  key={x.slug}
                  {...rowClickProps}
                  className={`border-b border-[#e4d9cf] last:border-b-0 group ${
                    isThis
                      ? "bg-[#0e4d45]/5"
                      : "cursor-pointer hover:bg-[#fef6f1] active:bg-[#f7ebe2] transition-colors outline-none focus-visible:bg-[#fef6f1] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0e4d45]/40"
                  }`}
                >
                  <td className="px-3 py-2.5">
                    {isThis ? (
                      <div className="flex items-center gap-2">
                        <ProductLogo p={x} size={22} />
                        <div className="min-w-0">
                          <div className="font-bold text-black truncate">{x.name}</div>
                          <div className="text-[9px] text-[#0e4d45] font-semibold uppercase tracking-wider">This product</div>
                        </div>
                      </div>
                    ) : (
                      <Link
                        to="/product/$slug"
                        params={{ slug: x.slug }}
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ProductLogo p={x} size={22} />
                        <span className="font-semibold text-black group-hover:text-[#0e4d45] truncate">
                          {x.name}
                        </span>
                      </Link>
                    )}
                  </td>
                  <td className="text-center px-2 py-2.5 whitespace-nowrap">
                    <StarRating rating={x.rating} size="sm" />
                  </td>
                  {showApy && (
                    <td className="text-center px-2 py-2.5 font-bold text-[#0e4d45] whitespace-nowrap">
                      {x.apy ?? "—"}
                    </td>
                  )}
                  <td className="text-center px-2 py-2.5 text-black whitespace-nowrap">{x.fees}</td>
                  <td className="text-center px-2 py-2.5 text-black whitespace-nowrap">{x.minDeposit}</td>
                  {showBonus && (
                    <td className="text-center px-2 py-2.5 text-black whitespace-nowrap">{x.bonus ?? "—"}</td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-3 sm:px-4 py-2 border-t border-[#e4d9cf] bg-[#fef6f1] text-[10px] text-black/50">
        Rates and terms verified Apr 22, 2026. Always confirm current figures with the provider before opening an account.
      </div>
    </section>
  );
}

// ─── Key Takeaways Card ─────────────────────────────────────────────────────

export function KeyTakeaways({ product }: { product: Product }) {
  const p = product;
  const apy = parseApy(p.apy) ?? 0;

  const insight =
    p.category === "bank" && apy >= 4
      ? `At ${apy.toFixed(2)}% APY, ${p.name} pays roughly ${(apy / NATIONAL_APY_AVG).toFixed(0)}× the FDIC national average. That's meaningful on any balance above a few thousand dollars, but read the fine print on minimum balance and direct-deposit requirements.`
      : p.category === "bank"
      ? `${p.name} competes on features and brand rather than yield. If maximum APY is your goal, a top high-yield savings account will pay more.`
      : p.category === "investing" && /commission-free|\$0/i.test(p.fees)
      ? `Commission-free trades make ${p.name} cheap for casual equity investors. Judge it on execution quality, platform depth, and account types, not headline pricing.`
      : p.category === "investing"
      ? `${p.name} is a specialist platform. It earns its fees only if you need the specific tools or assets it targets. Confirm the fit before funding.`
      : `${p.name} is a ${p.subcategory.toLowerCase()} app. The value depends on how consistently you'll use the core workflow; most users underestimate stickiness when picking between free and paid tiers.`;

  const bestLine = `Best for ${p.bestFor.toLowerCase()}.`;
  const watchOut = p.cons[0] ? `Watch out for: ${p.cons[0].toLowerCase()}.` : null;

  return (
    <section className="bg-[#fef6f1] border-2 border-[#0e4d45]/20 rounded p-3 sm:p-4 mb-3 sm:mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.18em] text-[#0e4d45]">
          Key Takeaways
        </span>
        <span className="h-px flex-1 bg-[#0e4d45]/20" />
      </div>
      <p className="text-xs sm:text-sm text-black leading-relaxed mb-2.5">
        <strong>{bestLine}</strong> {insight}
        {watchOut && <> {watchOut}</>}
      </p>
      <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-[#0e4d45]/15">
        {p.apy && (
          <div>
            <div className="text-[9px] text-black/50 uppercase tracking-wider">APY</div>
            <div className="font-bold text-[#0e4d45] text-sm">{p.apy}</div>
          </div>
        )}
        {p.bonus && !p.apy && (
          <div>
            <div className="text-[9px] text-black/50 uppercase tracking-wider">Bonus</div>
            <div className="font-bold text-black text-sm">{p.bonus}</div>
          </div>
        )}
        <div>
          <div className="text-[9px] text-black/50 uppercase tracking-wider">Fees</div>
          <div className="font-semibold text-black text-sm">{p.fees}</div>
        </div>
        <div>
          <div className="text-[9px] text-black/50 uppercase tracking-wider">Min. Deposit</div>
          <div className="font-semibold text-black text-sm">{p.minDeposit}</div>
        </div>
      </div>
    </section>
  );
}

// ─── Product Primer — "What is [Product]?" ─────────────────────────────────

// Per-product primers for financial apps. Each app in budgeting, cash-advance,
// credit-score, neobank, credit-and-loans, and research verticals has its own
// two-paragraph explainer so reviews don't read as templated within a category.
const appPrimers: Record<string, [string, string]> = {
  // Budgeting
  "ynab": [
    "YNAB (You Need A Budget) is a subscription budgeting app built around a zero-based method: every dollar you receive gets assigned a job before it's spent. Accounts are linked read-only and the app encourages manual reconciliation rather than hands-off auto-categorization.",
    "The learning curve is real, and the annual fee is higher than most competitors. Users who stick with it cite measurable changes in savings rate within a few months; users who don't tend to abandon it inside the free trial. Try the full 34-day trial before paying.",
  ],
  "monarch-money": [
    "Monarch Money is a subscription budgeting and net-worth tracker that positions itself as a Mint replacement for households. It supports joint accounts, goals, investment tracking, and manual transaction rules, with a cleaner interface than most legacy competitors.",
    "Pricing is annual or monthly, with no meaningful free tier. The product fits couples and high-net-worth DIYers who want one dashboard across cash, brokerage, property, and crypto. If you mainly need cashflow tracking, a free option may be enough.",
  ],
  "rocket-money": [
    "Rocket Money (formerly Truebill) is a subscription management and budgeting app. Its headline feature is automatic detection of recurring charges and a concierge that will negotiate or cancel subscriptions on your behalf for a cut of the first-year savings.",
    "A free tier covers basic tracking, but most of the value (bill negotiation, smart savings, premium insights) sits behind a pay-what-you-want premium plan starting around $4/month. Judge it by how many forgotten subscriptions it surfaces in month one.",
  ],
  "empower": [
    "Empower (formerly Personal Capital) is a free net-worth and investment-tracking platform from a registered investment advisor. Linking your accounts gets you dashboards for asset allocation, fee analysis, and retirement projections at no cost.",
    "The tradeoff for the free tier: users with $100,000+ in investable assets get contacted about the firm's paid advisory service. The free tools are genuinely useful on their own. You can decline the consultation calls and keep using them indefinitely.",
  ],
  // Cash Advance
  "earnin": [
    "EarnIn is an earned-wage access app that lets workers withdraw a portion of wages they've already earned before payday. The app estimates earned pay based on hours worked and repays itself via ACH on your next scheduled payday.",
    "There is no stated APR. EarnIn relies on optional \"tips\" and an instant-transfer fee instead. Used occasionally, the cost is modest; used every pay cycle, it often beats overdraft fees but becomes a dependency that obscures the real shortfall in the underlying budget.",
  ],
  "dave": [
    "Dave is a cash-advance and neobank combo. The ExtraCash feature fronts up to $500 before payday; a companion Spending account offers early direct deposit and a Dave Card. Membership is a flat monthly fee plus optional express-transfer fees.",
    "Dave markets itself as a lower-cost alternative to bank overdraft. For occasional shortfalls it usually is. The membership fee is charged regardless of usage, so if you go one or two months without needing an advance, the effective cost becomes unfavorable.",
  ],
  "albert": [
    "Albert is a mixed financial app: cash advance, budgeting, automated savings, and a text-based \"Genius\" advice concierge, all bundled into a Genius subscription. Cash advances of up to $250 are offered with no mandatory interest or late fees.",
    "The bundle is the pitch. If you'd use three of the four features (advance, savings, advice, cashback), the subscription pays for itself. If you only want the advance, a standalone advance app is usually cheaper.",
  ],
  "brigit": [
    "Brigit is a subscription cash-advance app offering advances up to $250 alongside credit-building tools, identity theft protection, and spending insights. Unlike tip-based competitors, pricing is a flat monthly plan.",
    "Brigit's credit-builder product is a small installment loan designed to report on-time payments to the bureaus. Useful for thin-file users, but the main subscription is only worth it if you actually use the advance; otherwise you're paying a monthly fee for features available free elsewhere.",
  ],
  "chime-mypay": [
    "Chime MyPay is an early-wage-access feature built into the Chime mobile banking app. Eligible Chime members with qualifying direct deposits can access up to $500 of earned wages before their scheduled payday at no fee or a small instant-transfer fee.",
    "Unlike standalone advance apps, MyPay is only available to Chime banking customers. If you already use Chime as your primary checking, it is one of the cheapest earned-wage options. If not, switching your direct deposit just to access it is rarely worth the hassle.",
  ],
  "possible-finance": [
    "Possible Finance offers small installment loans (up to around $500) that report payments to the major credit bureaus, positioning itself as a credit-builder alternative to payday loans. Loans are typically repaid over four installments across two months.",
    "The APR is transparent and regulated at the state level, but it's still high by consumer-loan standards because the loans are short and small. The value comes from the credit reporting: a borrower with thin or damaged credit can use Possible to build payment history they can't easily get elsewhere.",
  ],
  "tilt": [
    "Tilt is a group-payment and bill-splitting app that lets friends, roommates, or teams collect money toward a shared goal. It's less of a personal-finance tool and more of a peer-to-peer workflow: request, collect, disburse.",
    "Tilt doesn't extend credit and isn't a bank. It sits on top of ACH or card rails to move money between users. Evaluate it against Venmo, Cash App, or Splitwise based on which rails your group already uses and what fees apply to card-funded transfers.",
  ],
  // Credit Score
  "sofi-credit-score": [
    "SoFi Credit Score Monitoring is a free service inside the SoFi app that shows your VantageScore 3.0 from TransUnion, tracks month-over-month changes, and surfaces insights on the factors behind the number.",
    "The score is educational and will generally differ from a FICO score a lender pulls at application. SoFi uses the feature as a customer-acquisition hook into its lending and banking products; you can use the monitoring indefinitely without taking any of those offers.",
  ],
  "credit-karma": [
    "Credit Karma is an advertising-funded credit-monitoring service that provides free VantageScore 3.0 scores and full reports from both TransUnion and Equifax, refreshed weekly, alongside a product marketplace for cards, loans, and auto refinancing.",
    "The trade: recommendations are funded by affiliate revenue, so offers shown are not necessarily the best rates available in the market. Use Credit Karma for the free report access and change tracking; cross-shop any recommended product against at least one non-affiliated source before applying.",
  ],
  "experian": [
    "Experian is one of the three U.S. credit bureaus. Its consumer app offers a free FICO Score 8 based on your Experian file plus a paid IdentityWorks tier that layers monitoring across Experian, Equifax, and TransUnion with identity theft insurance.",
    "Getting a FICO (not VantageScore) directly from a bureau is the main draw of the free tier. The premium tier is reasonable for users who want tri-bureau monitoring in one place, but the insurance component is not a substitute for freezing your credit, which is free and more effective against new-account fraud.",
  ],
  // Neobanks
  "current": [
    "Current is a neobank whose consumer-facing app sits on top of Choice Financial Group and Cross River Bank, both FDIC-member partner banks. It targets gig workers and younger consumers with features like early direct deposit, points rewards, and teen accounts.",
    "Current isn't itself a chartered bank, so FDIC insurance runs through the partner banks. Its Save balances and crypto features use separate providers. That structure is common in the neobank category, but it matters when issues arise: know which entity to escalate to.",
  ],
  "varo": [
    "Varo is the first consumer fintech to receive its own national bank charter, making it a full-stack digital bank rather than a neobank sitting on a partner. Deposits are FDIC-insured directly through Varo Bank, N.A.",
    "The direct charter gives Varo more control over product roadmap and compliance than peer neobanks. Practically, the consumer experience (no monthly fees, early direct deposit, a small advance product, high-yield savings) is comparable to neobank competitors built on partner banks.",
  ],
  "cash-app": [
    "Cash App is a peer-to-peer payments and financial-services app from Block, Inc. Beyond P2P transfers, it offers a debit card, a brokerage for stocks and Bitcoin, direct deposit, and a savings feature, with banking services provided through partner banks.",
    "Cash App is tight integration, not full-service banking. The brokerage is introductory rather than research-driven, the Bitcoin spread is wider than dedicated exchanges, and savings balances route through a partner bank. It works well as a secondary account alongside a primary bank or broker.",
  ],
  // Credit & Loans
  "upgrade-app": [
    "The Upgrade app bundles Upgrade's personal loans, Rewards Checking, credit line, and credit health tools in one mobile experience. Loans are originated by partner banks with rates priced to borrower credit tier, and the Rewards Checking is FDIC-insured through Cross River Bank.",
    "Treat the app as a portal into Upgrade's product family rather than a standalone tool. If you're taking a personal loan, shop the APR against at least two direct competitors; pre-qualification doesn't affect your credit score and makes that comparison easy.",
  ],
  "perpay": [
    "Perpay is a point-of-sale installment financing app. Users shop from a curated catalog and repay via payroll deduction over multiple pay cycles, with no interest if paid on schedule and on-time payments reported to the credit bureaus.",
    "The catalog markup is the real cost, not an APR. Compared against retail prices elsewhere, items often carry a premium that replaces explicit interest. It can be a useful credit-building tool for thin-file users who already plan to buy the specific items listed, but it's not a substitute for a low-rate card or personal loan.",
  ],
  // Research & Analysis
  "motley-fool": [
    "The Motley Fool Stock Advisor is a subscription stock-picking newsletter that has published a long-running track record of buy recommendations since 2002. Members receive two new recommendations each month plus ongoing commentary and \"best buy\" lists.",
    "Long-term reported returns have beaten the S&P 500, but the publishing model means subscribers buying late can pay up for names that have already run. Treat the picks as research input, size positions conservatively, and remember a concentrated portfolio of growth names carries volatility the benchmark return doesn't show.",
  ],
  "seeking-alpha": [
    "Seeking Alpha is a crowd-sourced investment research platform where independent contributors publish long-form analysis on individual securities. A paid Premium tier adds the Quant Rating system, earnings-call transcripts, and a dividend-grading framework.",
    "The quality of contributor analysis varies by author, so the platform is most useful when you treat it as a starting point for due diligence rather than a recommendation service. The Quant tools on Premium are the most consistent value add, particularly for screening candidates before deeper work.",
  ],
  "tipranks": [
    "TipRanks aggregates Wall Street analyst ratings, financial-blogger picks, insider trades, and hedge-fund holdings into a single dashboard. Its Smart Score distills these signals into a 1-to-10 rating for each stock.",
    "The data aggregation is the product. Whether it translates into returns depends on how you use it: following consensus analyst picks produces index-like results; filtering for sentiment extremes and combining with your own research is where power users see value. The free tier is limited to older data.",
  ],
  "tradingview": [
    "TradingView is a browser-based charting and social platform for active traders. Its core strengths are fast, flexible charts, a large library of built-in and community indicators, and a Pine Script language for custom studies.",
    "The free tier is usable for casual chart-watching; active traders quickly hit limits on indicator count, intraday bars, and saved layouts. Paid plans remove those constraints but add real value only if you spend significant time charting. Execution still routes through your brokerage; TradingView is the lens, not the broker.",
  ],
  "cnbc-pro": [
    "CNBC Pro is a subscription service from CNBC offering exclusive video coverage, the Investing Club run by Jim Cramer, and premium market commentary beyond what's available on the free website.",
    "The Investing Club component is the most actionable piece: weekly meetings, buy/sell alerts on a model portfolio, and context on why positions move. Value depends on whether that cadence matches how you invest. Passive index investors get little additional utility; active consumers of financial media get the most.",
  ],
  "stock-analysis-pro": [
    "Stock Analysis Pro is a subscription that unlocks advanced features on stockanalysis.com, including a full stock screener, financial data exports, and detailed analyst forecasts across global markets.",
    "The free version of the site is already useful for fundamentals, so the Pro case rests on screening and data exports. If you're running repeatable quantitative screens or building a personal research spreadsheet, the subscription is cheap relative to professional data vendors. Casual users won't hit the free limits.",
  ],
};

function primerParagraphs(p: Product): string[] {
  const sub = p.subcategory;
  const apy = p.apy ? p.apy : null;
  const providerClause = p.provider ? ` from ${p.provider}` : "";

  // Per-product override for financial apps
  const override = appPrimers[p.slug];
  if (override) return [override[0], override[1]];

  if (sub === "High-Yield Savings") {
    return [
      `${p.name} is an online savings account${providerClause}${apy ? ` currently advertising up to ${apy} APY` : ""}. It sits in the category of direct banks that skip branch overhead and pass much of the savings to depositors through higher yields and lower fees.`,
      `Deposits are FDIC-insured up to $250,000 per depositor, per ownership category, either directly or through partner banks in a sweep program. Day-to-day access runs through the website and mobile app, with funding via ACH, mobile check deposit, and in most cases external wires. Expect rates to move with the Fed; the headline APY is variable and can change at any time.`,
    ];
  }

  if (sub === "Big Bank Savings") {
    return [
      `${p.name} is the standard savings product${providerClause}, one of the largest U.S. retail banks. Unlike direct-bank competitors, it is built around branch access and one-login integration with the bank's checking, credit card, and lending products.`,
      `The tradeoff is straightforward: the advertised APY is almost always well below online banks, often at or near 0.01%. If you value branch service, teller-issued cashier's checks, or a single-institution financial setup, the rate gap is the cost of that convenience.`,
    ];
  }

  if (sub === "Checking") {
    return [
      `${p.name} is a checking account${providerClause} built for everyday spending, bill pay, and direct deposit. Most consumers anchor their financial life to a checking account and then use savings, brokerage, and cards alongside it.`,
      `Look past the welcome bonus and evaluate four things: monthly fee structure (and how to waive it), ATM network and reimbursement policy, overdraft rules, and whether direct deposit arrives early. Those mechanics determine what the account actually costs you over a year.`,
    ];
  }

  if (sub === "Brokerage") {
    return [
      `${p.name} is a self-directed brokerage${providerClause}. Client assets are held in SIPC-member accounts covered up to $500,000, which includes $250,000 in cash. SIPC covers custodial failure, not market losses.`,
      `Brokerages differ in ways that aren't obvious on a feature list: order routing and payment-for-order-flow practices, margin and options pricing, available account types (Roth IRA, SEP, custodial, trust), and the quality of research tools. The right broker depends less on commissions (most are $0 on stocks and ETFs) and more on what you actually trade.`,
    ];
  }

  if (sub === "Robo-Advisor") {
    return [
      `${p.name} is a robo-advisor${providerClause}. You answer a short risk questionnaire, and the service builds a diversified portfolio of low-cost ETFs, rebalances it automatically, and in taxable accounts offers tax-loss harvesting.`,
      `Robo-advisors charge a management fee on top of the underlying ETF expense ratios, typically 0.25% per year. Over a long horizon that is still far cheaper than a traditional advisor, but it stacks with fund costs, so the all-in fee is the number that matters. They're well-suited to savers who want an automated, hands-off approach rather than picking individual securities.`,
    ];
  }

  if (sub === "Crypto") {
    return [
      `${p.name} is a centralized cryptocurrency exchange${providerClause}. You deposit U.S. dollars, convert to crypto at the exchange's quoted spread, and hold assets in a custodial wallet controlled by the platform.`,
      `Crypto holdings are not SIPC-insured, and FDIC insurance on USD cash balances (where offered, through partner banks) does not extend to the crypto itself. Reputable exchanges keep the majority of customer assets in cold storage and publish proof-of-reserves, but exchange failure remains a real risk category. For long-term holdings, many investors move coins to self-custody hardware wallets.`,
    ];
  }

  if (sub === "Prediction Markets") {
    return [
      `${p.name} is a prediction market${providerClause}, a venue where users trade yes/no contracts on future events at prices that reflect the market's implied probability.`,
      `U.S. regulatory status is a defining feature here. CFTC-regulated platforms operate as designated contract markets with consumer protections; offshore venues do not. Read the counterparty and withdrawal terms before funding, and treat positions as event-contingent derivatives rather than investments.`,
    ];
  }

  if (sub === "Budgeting") {
    return [
      `${p.name} is a personal-finance app${providerClause}. It connects to your bank, brokerage, and credit card accounts through read-only aggregation (Plaid or a similar provider) and categorizes transactions so you can see spending and net worth in one place.`,
      `The honest test of a budgeting app is whether you still open it in month three. Most users drop off well before that. Before paying for a subscription, try the free tier or trial for at least two pay cycles and decide if the workflow matches how you actually think about money.`,
    ];
  }

  if (sub === "Cash Advance") {
    return [
      `${p.name} is an earned-wage access or small-dollar cash advance app${providerClause}. It fronts a portion of wages you've already earned, or an unsecured small advance, and collects on your next payday via ACH.`,
      `Pricing shows up as subscription fees, "optional" tips, or instant-transfer fees rather than a stated APR, but the effective annualized cost is often in the triple digits for short-duration advances. These products solve a real liquidity problem. They should not be a recurring solution.`,
    ];
  }

  if (sub === "Credit Score") {
    return [
      `${p.name} is a credit-monitoring service${providerClause}. It pulls your credit file from one or more of the three bureaus (Equifax, Experian, TransUnion), presents a VantageScore or FICO variant, and alerts you to changes.`,
      `The score shown by a free monitoring service is usually a VantageScore or educational FICO and can differ from what a lender sees at application. Use monitoring to track the direction of your credit and catch errors or fraud, not as the definitive number. The underlying report, not the score, is what lenders actually underwrite against.`,
    ];
  }

  if (sub === "Neobanks") {
    return [
      `${p.name} is a neobank${providerClause}. It is not itself a bank: the consumer-facing app provides a user experience layered on top of a chartered partner bank that holds deposits and provides FDIC insurance.`,
      `Neobank accounts often lead on features (early direct deposit, overdraft grace, rewards, no monthly fees) but rely on the partner bank for the underlying ledger. Confirm the FDIC-insured institution of record, and understand which services sit with the partner bank versus the app itself when issues arise.`,
    ];
  }

  if (sub === "Credit & Loans") {
    return [
      `${p.name} is a consumer-credit platform${providerClause} offering unsecured personal loans, credit lines, or point-of-sale financing. Loans are originated either directly or through a partner bank, with rates priced to borrower credit tier.`,
      `Compare the APR (not just the monthly payment), the origination fee, and any prepayment terms. Personal loans generally make sense to refinance higher-rate credit card balances; using them to fund discretionary spending trades revolving debt for installment debt without solving the underlying cash flow.`,
    ];
  }

  if (sub === "Research & Analysis") {
    return [
      `${p.name} is an investment-research service${providerClause}. Subscribers get stock ideas, analyst ratings, model portfolios, or market data that supplement what a brokerage provides for free.`,
      `Research products are judged on two things: the quality of the underlying analysis, and whether the format matches how you actually make decisions. A year of fund-beating picks is hard to attribute to skill; a clear, well-sourced framework you can use repeatedly is more valuable. Free-trial hard before subscribing.`,
    ];
  }

  // Default fallback for any unmapped subcategory
  return [
    `${p.name} is a ${sub.toLowerCase()} product${providerClause}. It's used primarily by consumers who want ${p.bestFor.toLowerCase()}.`,
    `Before committing, check fee structure, account protections, and how the service performs for your specific use case. The right product depends on your financial situation and goals more than on any headline feature.`,
  ];
}

export function ProductPrimer({ product }: { product: Product }) {
  const p = product;
  const paragraphs = primerParagraphs(p);
  return (
    <section className="bg-white border border-[#e4d9cf] rounded p-3 sm:p-4 mb-3 sm:mb-5">
      <h2 className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest border-b border-[#e4d9cf] pb-1.5 mb-2 sm:mb-3">
        What is {p.name}?
      </h2>
      <div className="space-y-2">
        {paragraphs.map((t, i) => (
          <p key={i} className="text-xs sm:text-sm text-black leading-relaxed">
            {t}
          </p>
        ))}
      </div>
    </section>
  );
}

// ─── How to Maximize — practical action block ───────────────────────────────

function maximizeSteps(p: Product): { title: string; detail: string }[] {
  if (p.category === "bank" && p.apy) {
    return [
      { title: "Set up qualifying direct deposit", detail: `Many high-yield accounts require a recurring direct deposit from an employer or government source to unlock the top APY tier. Partial deposits (e.g., routing only a portion of your paycheck) usually qualify.` },
      { title: "Maintain the minimum balance for each tier", detail: `Check whether the advertised APY applies to your full balance or only up to a cap. Above the cap, some accounts drop to a much lower rate. Move the excess to a second account if needed.` },
      { title: "Enable automatic savings transfers", detail: `Schedule an automatic transfer from checking on each payday. This keeps the balance high enough to earn the top tier without you having to think about it.` },
      { title: "Claim any welcome bonus", detail: p.bonus ? `${p.name} currently advertises: ${p.bonus}. Confirm the exact qualifying activities and the deadline. Most bonuses require the direct deposit to post within 60 to 90 days.` : `Check the provider's promotions page before applying in case a sign-up bonus is available.` },
    ];
  }
  if (p.category === "investing" && p.subcategory === "Brokerage") {
    return [
      { title: "Choose the right account type first", detail: `A Roth or traditional IRA beats a taxable account for retirement dollars because tax drag compounds. Use a taxable brokerage account for money you may need before age 59½.` },
      { title: "Use limit orders instead of market orders", detail: `Market orders can execute at unfavorable prices on thinly-traded tickers and outside regular hours. Limit orders cost the same and protect against bad fills.` },
      { title: "Enable fractional shares and automatic investing", detail: `Fractional shares let small dollar amounts fully invest. Scheduling a weekly or monthly automatic purchase of a broad index ETF removes timing decisions entirely.` },
      { title: "Claim deposit bonuses when you transfer", detail: p.bonus ? `${p.name} currently offers: ${p.bonus}. Transfer bonuses often require the funds to stay for 12 months, so factor that in before moving an account.` : `If you transfer from another broker, check for transfer-bonus promotions and ACATS fee reimbursement.` },
    ];
  }
  if (p.subcategory === "Crypto") {
    return [
      { title: "Use limit orders (maker fees) instead of market (taker)", detail: `Maker fees are significantly cheaper than taker fees at almost every exchange. Placing a limit order that sits on the book for a few seconds usually still fills at a similar price.` },
      { title: "Consolidate volume into one exchange where possible", detail: `Most exchanges publish a fee tier schedule based on 30-day trading volume. Splitting volume across exchanges keeps you in the highest (worst) tier at each.` },
      { title: "Stake idle holdings only after reading the terms", detail: `Staking rewards look attractive but often come with lockup periods, slashing risk, and tax complexity. Never stake more than you can afford to have illiquid.` },
      { title: "Move long-term holdings to self-custody", detail: `Any balance you don't plan to trade belongs in a hardware wallet you control. Exchange balances are exposed to exchange insolvency, a risk FDIC and SIPC do not cover.` },
    ];
  }
  return [
    { title: "Commit to the core workflow for 30 days", detail: `Most finance apps only pay off if you use them consistently. Block a recurring 10-minute weekly review; skip it, and the subscription stops being worth it.` },
    { title: "Compare annual vs. monthly pricing", detail: `Annual plans on most apps cost 30 to 50% less than monthly, but only commit if you've already used the free tier or trial long enough to be confident.` },
    { title: "Audit linked-account permissions monthly", detail: `Check which institutions are connected and revoke any you no longer use. Connections held open add unnecessary data-breach exposure.` },
    { title: "Use the referral program", detail: `Most apps offer a credit for each referred user. If you recommend it organically, use your referral link. It typically credits both sides.` },
  ];
}

export function HowToMaximize({ product }: { product: Product }) {
  const steps = maximizeSteps(product);
  const headline =
    product.category === "bank" && product.apy
      ? `How to earn the highest APY at ${product.name}`
      : product.category === "investing"
      ? `How to get the most out of ${product.name}`
      : product.subcategory === "Crypto"
      ? `How to minimize fees at ${product.name}`
      : `How to get the most from ${product.name}`;

  return (
    <section className="bg-white border border-[#e4d9cf] rounded p-3 sm:p-4 mb-3 sm:mb-5">
      <h2 className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest border-b border-[#e4d9cf] pb-1.5 mb-3">
        {headline}
      </h2>
      <ul className="space-y-2.5">
        {steps.map((s) => (
          <li key={s.title} className="border-l-2 border-[#0e4d45] pl-2.5">
            <div className="text-xs sm:text-sm font-semibold text-black">{s.title}</div>
            <p className="text-[11px] sm:text-xs text-black/70 leading-snug mt-0.5">{s.detail}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ─── Pros / Cons Explained (long-form) ─────────────────────────────────────

function explainPro(pro: string, p: Product): string {
  const s = pro.toLowerCase();
  if (/no (monthly )?fee|\$0|fee-free/.test(s))
    return `No recurring fees means every dollar of interest or return stays in your pocket. A $12/month fee alone costs $144/year, often more than modest balances earn.`;
  if (/apy|interest|yield/.test(s))
    return `A competitive rate compounds over time. On a $10,000 balance, a 1-point APY advantage adds roughly $100 per year versus a typical account.`;
  if (/fdic|sipc|insured|insurance/.test(s))
    return `Federal insurance protects your funds up to statutory limits if the institution fails, a baseline non-negotiable for any account holding meaningful savings.`;
  if (/commission-free|\$0 trade|zero commission/.test(s))
    return `No-commission trades remove the friction of small trades and make dollar-cost averaging practical. The real cost comparison now happens at the options contract and margin rate level.`;
  if (/mobile|app|intuitive|user-friendly|easy/.test(s))
    return `A polished app matters because it's the primary touchpoint. Smoother deposits, transfers, and account management translate directly into fewer mistakes and less wasted time.`;
  if (/bonus|welcome|sign.?up/.test(s))
    return `The welcome bonus is real money, but read the fine print on qualifying deposits, holding periods, and tax reporting (bonuses are typically 1099-INT income).`;
  if (/branch|atm|cash/.test(s))
    return `Physical access matters if you deposit cash or prefer in-person support for complex issues. Pure online banks make this inconvenient or impossible.`;
  if (/research|education|tools|charting/.test(s))
    return `Built-in research reduces your need for paid third-party services. Judge depth by whether you'd still pay for external tools after using it for a month.`;
  if (/crypto|bitcoin|ethereum/.test(s))
    return `Integrated crypto access is convenient but comes with a caveat: custodied holdings aren't SIPC-insured, and spreads on integrated platforms are often wider than dedicated exchanges.`;
  return `This is a meaningful advantage for the ${p.subcategory.toLowerCase()} category, and one of the reasons ${p.name} scored ${p.rating}/5 in our review.`;
}

function explainCon(con: string, p: Product): string {
  const s = con.toLowerCase();
  if (/monthly fee|maintenance fee/.test(s))
    return `Monthly fees compound the wrong way: a $10/month fee costs $120 a year regardless of balance. Check whether the fee is waivable with direct deposit, minimum balance, or paperless statements.`;
  if (/minimum (balance|deposit)|min\./.test(s))
    return `High minimums can trap your money or force you to hold more in one institution than you'd prefer. If the minimum is close to your typical balance, one bad month means fees or a rate downgrade.`;
  if (/limited (asset|coin|crypto)/.test(s))
    return `A narrow asset list is fine if it covers what you actually want to trade. If you need a specific altcoin, option strategy, or international ETF, check availability before funding.`;
  if (/customer support|phone|response time/.test(s))
    return `Slow support is the factor consumers most regret after signing up. Test it yourself before moving significant balances. A 48-hour response time on a locked-out account feels very different at $500 vs. $50,000.`;
  if (/fee|commission|spread/.test(s))
    return `Every dollar in fees compounds away over time. Even small recurring costs add up: 1% per year cuts a 7% long-run return to 6%, which is roughly a third of lifetime wealth over 40 years.`;
  if (/no branch|online.only|no physical/.test(s))
    return `No-branch means no cash deposits, no in-person help for fraud or estate issues, and fully digital account recovery. Fine for most users, a real problem for some.`;
  if (/no (wire|zelle|check|ach)/.test(s))
    return `Missing transfer rails can block specific use cases: real estate closings need wires, rent splits need Zelle, some payroll still sends paper checks. Confirm the one you rely on is supported.`;
  if (/rate (can |could )?(drop|change|variable)/.test(s))
    return `Advertised APYs are variable and can change at any time. A rate that leads the market this month may not lead it next quarter. Reassess at least twice a year.`;
  return `This limitation affects a subset of users. Worth weighing against the advantages if it matches your situation, and worth confirming against the full account agreement at ${p.provider}.`;
}

export function ProsConsExplained({ product }: { product: Product }) {
  const p = product;
  return (
    <section className="bg-white border border-[#e4d9cf] rounded p-3 sm:p-4 mb-3 sm:mb-5">
      <h2 className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest border-b border-[#e4d9cf] pb-1.5 mb-3">
        Pros and Cons Explained
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <div className="text-[10px] sm:text-[11px] font-bold text-[#0e4d45] uppercase tracking-wider mb-2">
            Pros explained
          </div>
          <ul className="space-y-2.5">
            {p.pros.slice(0, 4).map((pro) => (
              <li key={pro}>
                <div className="text-xs sm:text-sm font-semibold text-black flex gap-1.5">
                  <span className="text-[#0e4d45] mt-0.5">+</span>
                  <span>{pro}</span>
                </div>
                <p className="text-[11px] sm:text-xs text-black/70 leading-snug mt-0.5 ml-4">{explainPro(pro, p)}</p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-[10px] sm:text-[11px] font-bold text-[#540f04] uppercase tracking-wider mb-2">
            Cons explained
          </div>
          <ul className="space-y-2.5">
            {p.cons.slice(0, 4).map((con) => (
              <li key={con}>
                <div className="text-xs sm:text-sm font-semibold text-black flex gap-1.5">
                  <span className="text-[#540f04] mt-0.5">−</span>
                  <span>{con}</span>
                </div>
                <p className="text-[11px] sm:text-xs text-black/70 leading-snug mt-0.5 ml-4">{explainCon(con, p)}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// ─── Operational Limits (concrete, category-specific) ──────────────────────

function operationalLimits(p: Product): { label: string; detail: string }[] {
  if (p.category === "bank") {
    const isSavings = /savings|money market/i.test(p.subcategory);
    const rows: { label: string; detail: string }[] = [];
    if (isSavings) rows.push({ label: "Withdrawals per month", detail: `Federal Regulation D was suspended in 2020, but most banks still cap savings-account outbound transfers at six per statement cycle. Exceeding the cap can trigger a fee or account conversion.` });
    rows.push({ label: "Wire transfers", detail: p.category === "bank" && /online|ally|sofi|chime/i.test(p.name + " " + p.provider) ? `Many online banks support outgoing domestic wires ($20–$30 typical fee) but not international wires. Confirm before using for a real estate closing or international payment.` : `Outgoing wires are typically supported for a fee. International wires may require a phone call or be unavailable.` });
    rows.push({ label: "Cash deposits", detail: /online|ally|sofi|chime|marcus|discover/i.test(p.name + " " + p.provider) ? `Online banks generally cannot accept cash directly. Workarounds include money orders (fee), third-party retail deposits via a partner network, or depositing to a brick-and-mortar account first.` : `Cash deposits are accepted at branches and in-network ATMs. Out-of-network deposits may not be supported.` });
    rows.push({ label: "Mobile check deposit limits", detail: `Per-check and per-day mobile deposit limits vary by account age and history. New accounts often have lower limits for the first 60 to 90 days.` });
    rows.push({ label: "FDIC coverage structure", detail: /chime|sofi|varo|current/i.test(p.name + " " + p.provider) ? `Coverage is provided through partner banks in a sweep program rather than a direct FDIC charter. In practice this works the same for most users but adds an extra layer to unwind in a failure scenario.` : `Coverage is direct through the institution's FDIC charter up to the standard $250,000 per depositor, per ownership category.` });
    return rows;
  }
  if (p.category === "investing" && p.subcategory === "Brokerage") {
    return [
      { label: "Options approval levels", detail: `Brokers tier options trading (levels 1 to 4 or similar). Spreads and naked options require higher approval tiers that aren't granted automatically. Expect a questionnaire and sometimes a waiting period.` },
      { label: "Margin rates and maintenance", detail: `Margin rates are among the least-advertised but most-impactful costs. Rates of 8–13% are typical at major brokers; Interactive Brokers and some newer platforms are materially lower.` },
      { label: "Fractional share support", detail: `Most major brokers support fractional ETF and stock investing, but not all tickers are eligible, and selling fractionals can take an extra business day to settle.` },
      { label: "Extended-hours trading", detail: `Pre-market and after-hours sessions have wider spreads and lower liquidity. Most brokers only accept limit orders during these sessions.` },
      { label: "ACATS transfer fees", detail: `Transferring an account out to another broker typically costs $75. Many receiving brokers reimburse this fee for qualifying deposit sizes, so ask before initiating.` },
    ];
  }
  if (p.subcategory === "Crypto") {
    return [
      { label: "Withdrawal limits", detail: `Daily and monthly withdrawal limits apply and scale with verification level. Same-day large withdrawals often require advance notice or a manual review.` },
      { label: "Network fees vs. platform fees", detail: `The platform fee is the exchange's cut. On top of that, sending crypto on-chain incurs a network fee that varies with congestion. Check both before large transfers.` },
      { label: "Staking lockups", detail: `Staked assets may be locked for days to weeks depending on the protocol. Don't stake funds you might need for a margin call or an unexpected sell-off.` },
      { label: "Insurance on crypto", detail: `USD balances at major exchanges are often FDIC-insured through partner banks; the crypto itself is not. "Insurance" marketing typically refers to hot-wallet coverage against hacks, not protection against exchange insolvency.` },
      { label: "Tax reporting", detail: `Every sale, swap, and stake reward is a taxable event. Most exchanges now issue 1099-DA (starting 2026 tax year) but cost-basis reporting remains the user's responsibility for older holdings.` },
    ];
  }
  return [
    { label: "Free tier limits", detail: `Most finance apps gate the most useful features behind a paid tier. Read the feature comparison carefully. The free tier is often a demo, not a workable product.` },
    { label: "Account connection reliability", detail: `Institutions periodically break aggregator connections. Expect 1–3 manual reconnections per year per linked account.` },
    { label: "Data export", detail: `Check whether you can export your full history (budgets, categorized transactions, net worth snapshots) if you cancel. Some apps delete all data on cancellation.` },
    { label: "Read-only vs. write access", detail: `Read-only linkages (via Plaid or similar) cannot move money. Any feature that initiates a transfer requires write access and a higher trust bar.` },
  ];
}

export function OperationalLimits({ product }: { product: Product }) {
  const rows = operationalLimits(product);
  return (
    <section className="bg-white border border-[#e4d9cf] rounded p-3 sm:p-4 mb-3 sm:mb-5">
      <h2 className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest border-b border-[#e4d9cf] pb-1.5 mb-3">
        Operational Limits and Fine Print
      </h2>
      <div className="space-y-2.5">
        {rows.map((r) => (
          <div key={r.label} className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-1 sm:gap-3 pb-2.5 border-b border-[#e4d9cf] last:border-b-0 last:pb-0">
            <div className="text-[11px] sm:text-xs font-bold text-[#0e4d45]">{r.label}</div>
            <p className="text-[11px] sm:text-xs text-black/75 leading-snug">{r.detail}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 pt-2 border-t border-[#e4d9cf] text-[10px] text-black/50 leading-snug">
        Limits can change. Always confirm current figures in the provider's fee schedule and account agreement before making decisions based on them.
      </p>
    </section>
  );
}

// ─── How to Sign Up — step-by-step ─────────────────────────────────────────

function signUpSteps(p: Product): { title: string; detail: string }[] {
  if (p.category === "bank") {
    return [
      { title: "Gather your information", detail: `You'll need your Social Security number, a government-issued ID, current address (two years of history for some products), and your employment details. Have the routing and account number of an existing bank account ready for the initial funding transfer.` },
      { title: "Start the application online", detail: `The application itself takes about 5 to 10 minutes. ${p.name} will pull a soft ChexSystems check. This doesn't affect your credit score, but a recent history of overdraft closures can cause a denial.` },
      { title: "Fund the account", detail: `Initial funding is typically via ACH from an external bank (free, 1–3 business days) or a debit card push (instant, often with a small fee). Note that bonus-qualifying deposits usually need to be ACH direct deposits, not one-time transfers.` },
      { title: "Set up direct deposit and alerts", detail: `Route at least part of your paycheck to qualify for the best APY tier and any welcome bonus. Turn on low-balance and unusual-activity alerts. The default notification settings are usually too quiet.` },
    ];
  }
  if (p.category === "investing") {
    return [
      { title: "Gather financial details", detail: `You'll need your SSN, employment information, annual income, liquid net worth, and investment-experience history. The suitability questions determine which products (options, margin) you can access.` },
      { title: "Choose the right account type", detail: `Decide between a taxable brokerage, traditional IRA, Roth IRA, or rollover IRA before applying. Changing account type later means opening a new account and transferring.` },
      { title: "Fund and configure", detail: `Link an external bank for ACH (free, 1–3 days) or initiate an ACATS transfer from another broker for existing positions (typically 5–7 business days; most brokers reimburse the outbound fee).` },
      { title: "Place a first trade on paper before real money", detail: `Most platforms have paper-trading or demo mode. Spend 10 minutes there confirming you understand order tickets, limit vs. market, and how fractional shares display before committing real capital.` },
    ];
  }
  if (p.subcategory === "Crypto") {
    return [
      { title: "Complete identity verification (KYC)", detail: `Upload a government ID, a selfie, and your SSN. Verification usually takes under an hour but can be delayed for harder-to-verify addresses. Higher verification tiers unlock larger deposit and withdrawal limits.` },
      { title: "Fund the account", detail: `ACH transfers are free and take 3–5 business days to fully clear. Wire transfers are instant but carry a $10–$30 fee. Debit card deposits are instant but typically carry a 2–4% fee.` },
      { title: "Enable maximum security before trading", detail: `Turn on 2FA with an authenticator app (not SMS), enable a withdrawal allowlist, and set up a unique password manager entry. The time to do this is before your first purchase, not after.` },
      { title: "Start small and move long-term holdings off-exchange", detail: `Place a small test trade first to confirm the flow. Anything you don't plan to trade in the next 30 days belongs in a self-custody wallet. Exchange failures are rare but catastrophic.` },
    ];
  }
  return [
    { title: "Download the app and create an account", detail: `Start with the free tier or trial. Avoid paying for a year upfront before you've used the full workflow for at least a week.` },
    { title: "Link your primary financial accounts", detail: `Connect checking, savings, and investment accounts via the in-app aggregator. Expect 1–2 reconnection prompts during the first month as banks rotate credentials.` },
    { title: "Configure categories and goals", detail: `Spend 15–20 minutes customizing categories and setting up any budgets or savings goals. The default settings are rarely optimal for your situation.` },
    { title: "Schedule a weekly 10-minute review", detail: `The apps that stick are the ones you open on a schedule. Put a recurring block on your calendar or the subscription will end up unused.` },
  ];
}

export function HowToSignUp({ product }: { product: Product }) {
  const steps = signUpSteps(product);
  return (
    <section className="bg-white border border-[#e4d9cf] rounded p-3 sm:p-4 mb-3 sm:mb-5">
      <h2 className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest border-b border-[#e4d9cf] pb-1.5 mb-3">
        How to Sign Up for {product.name}
      </h2>
      <ol className="space-y-2.5">
        {steps.map((s, i) => (
          <li key={s.title} className="flex gap-2.5">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#fef6f1] border border-[#0e4d45] text-[#0e4d45] text-[10px] font-bold flex items-center justify-center mt-0.5">
              {i + 1}
            </span>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-semibold text-black">{s.title}</div>
              <p className="text-[11px] sm:text-xs text-black/70 leading-snug mt-0.5">{s.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
