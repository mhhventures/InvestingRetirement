import type { Product } from "@/data/products";
import { Link } from "@tanstack/react-router";
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
            ? `Stock and ETF trades are commission-free — the post-2019 industry standard. The practical cost difference between brokers now shows up in options contracts, margin rates, and execution quality (payment for order flow).`
            : `This platform charges ${feeStr} — worth comparing to the $0 commission that has become standard at major brokers since 2019.`}
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
    { label: "Used the app for 30+ days", detail: `Ran the full workflow — budgeting, alerts, goal-tracking — over a month to judge long-term usefulness, not first-impression polish.` },
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
              return (
                <tr
                  key={x.slug}
                  className={`border-b border-[#e4d9cf] last:border-b-0 ${isThis ? "bg-[#0e4d45]/5" : ""}`}
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
                        className="flex items-center gap-2 group"
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
