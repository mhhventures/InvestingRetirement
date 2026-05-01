import type { Product } from "@/data/products";

// --- Clarity Research Commentary Block ---
// Hand-tuned commentary for flagship products. All other products get
// commentary generated dynamically from their actual data fields below.
const handTunedCommentary: Record<string, string> = {
  "sofi-checking-savings":
    "SoFi stands out as one of the few institutions pairing a high-yield savings account (up to 4.00% APY with qualifying direct deposit) with a genuinely competitive checking product that earns 0.50% APY. The $400 welcome bonus and FDIC insurance up to $3M via SoFi's insured deposit network make this our top pick for consumers consolidating their day-to-day banking.",
  "marcus-high-yield":
    "Marcus by Goldman Sachs delivers a no-frills 3.50% APY with zero fees and no minimum balance. There's no checking account or ATM access, but for savers who simply want a reliable, Wall Street-backed place to park cash, Marcus remains a default recommendation.",
  "ally-online-savings":
    "Ally's 3.10% APY is no longer category-leading, but its savings buckets, Surprise Savings automation, and 24/7 live customer service set it apart for goal-oriented savers. The mobile experience is among the best online banks offer.",
  "fidelity":
    "Fidelity is the gold standard for long-term investors. Exceptional research, $0 commissions, fractional shares, and a full retirement account suite make it the top pick for serious wealth builders.",
  "robinhood":
    "Robinhood pioneered commission-free trading and continues to attract younger investors with fractional shares and a clean UX. Research tools remain the main trade-off versus full-service brokers.",
  "betterment":
    "Betterment remains the benchmark robo-advisor. Tax-loss harvesting, goal-based planning, and automated rebalancing deliver real value for hands-off long-term savers.",
  "mint":
    "Mint's automatic transaction categorization and bill tracking give users a clear picture of their finances with minimal effort, making it the most widely adopted budgeting app for good reason.",
  "credit-karma":
    "Credit Karma remains the default free credit monitoring app for good reason: weekly VantageScore 3.0 updates from both TransUnion and Equifax, an Approval Odds engine that reduces wasted hard inquiries, and a credit score simulator that quantifies the impact of major financial decisions before you make them. The Intuit acquisition added free tax filing via Cash App Taxes and Credit Karma Money (a free checking and 3.00% APY savings account). The recommendation engine is aggressive — expect frequent credit card and personal loan suggestions — but the core monitoring product is genuinely free with no upsell to a paid tier. The main caveat is that VantageScore differs from FICO, which is what most lenders actually use; pair Credit Karma with a free FICO source like Experian or your card issuer's FICO benefit for the complete picture.",
  "experian":
    "Experian is the only mainstream app that delivers a free FICO Score 8 directly from a credit bureau — the same score used in 90% of lending decisions. Its standout feature is Experian Boost, which adds on-time utility, phone, streaming, and rent payments to your credit file; typical users see a 13-point lift, which is meaningful if you're on the qualification edge for a mortgage or auto loan. The free tier covers Experian data only, with weekly score refreshes and dark web surveillance. The $24.99/month IdentityWorks Premium tier unlocks 3-bureau FICO monitoring, $1 million in identity theft insurance, and lost wallet assistance — priced higher than Aura or IdentityGuard but tightly integrated with Boost and CreditLock. Experian is best paired with Credit Karma to get FICO + VantageScore visibility across all three bureaus for free.",
};

function buildDynamicCommentary(product: Product): string {
  const parts: string[] = [];

  // Credit & Loans-specific commentary path
  if (product.subcategory === "Credit & Loans") {
    const features = product.platformFeatures ?? [];
    const featureMentions = features.slice(0, 3).join(", ").toLowerCase();
    const featureLine = features.length > 0 ? ` Standout features include ${featureMentions}.` : "";
    const opener = `${product.name} brings together lending, credit-building, and money-management tools in one app, with a ${product.fees} fee structure.${featureLine}`;
    const topPro = product.pros[0];
    const topCon = product.cons[0];
    const middle = topPro ? ` Its strongest attribute is ${topPro.charAt(0).toLowerCase()}${topPro.slice(1)}.` : "";
    const closer = topCon
      ? ` It's best suited for ${product.bestFor.toLowerCase()}, though prospective borrowers should weigh that ${topCon.charAt(0).toLowerCase()}${topCon.slice(1)}.`
      : ` It's best suited for ${product.bestFor.toLowerCase()}.`;
    return opener + middle + closer;
  }

  // Brokerage-specific commentary path — reference assets, account types, and platform features
  if (product.subcategory === "Brokerage" && (product.accountTypes?.length || product.assetsAvailable?.length || product.platformFeatures?.length)) {
    const assets = product.assetsAvailable ?? [];
    const features = product.platformFeatures ?? [];
    const accountTypes = product.accountTypes ?? [];
    const assetsList = assets.slice(0, 5).join(", ").toLowerCase();
    const featureMentions = features.slice(0, 3).join(", ").toLowerCase();
    const retirementOptions = accountTypes.filter((a) => /ira|401|sep|simple|solo/i.test(a));
    const retirementLine = retirementOptions.length > 0 ? ` Retirement savers can choose from ${retirementOptions.slice(0, 4).join(", ")}.` : "";
    const opener = `${product.name} offers ${product.fees} pricing on a platform spanning ${assetsList}.${retirementLine}`;
    const featureLine = features.length > 0 ? ` Notable platform features include ${featureMentions}.` : "";
    const topPro = product.pros[0];
    const topCon = product.cons[0];
    const middle = topPro ? ` Its strongest attribute is ${topPro.charAt(0).toLowerCase()}${topPro.slice(1)}.` : "";
    const closer = topCon
      ? ` It's best suited for ${product.bestFor.toLowerCase()}, though prospective traders should weigh that ${topCon.charAt(0).toLowerCase()}${topCon.slice(1)}.`
      : ` It's best suited for ${product.bestFor.toLowerCase()}.`;
    return opener + featureLine + middle + closer;
  }

  // Crypto-specific commentary path — reference assets, account types, and platform features
  if (product.subcategory === "Crypto") {
    const coins = product.numCryptoAssets ? `${product.numCryptoAssets} cryptocurrencies` : "a deep coin selection";
    const otherAssets = (product.assetsAvailable ?? []).filter((a) => !/crypto|stablecoin/i.test(a));
    const multiAsset = otherAssets.length > 0 ? ` Beyond crypto, ${product.name} also supports ${otherAssets.join(", ").toLowerCase()}.` : "";
    const features = product.platformFeatures ?? [];
    const featureMentions = features.slice(0, 3).join(", ").toLowerCase();
    const featureLine = features.length > 0 ? ` Standout platform features include ${featureMentions}.` : "";
    const opener = `${product.name} offers ${coins} with a ${product.fees} fee structure on its main trading interface.${multiAsset}${featureLine}`;
    const topPro = product.pros[0];
    const topCon = product.cons[0];
    const middle = topPro ? ` Its strongest attribute is ${topPro.charAt(0).toLowerCase()}${topPro.slice(1)}.` : "";
    const closer = topCon
      ? ` It's best suited for ${product.bestFor.toLowerCase()}, though prospective users should weigh that ${topCon.charAt(0).toLowerCase()}${topCon.slice(1)}.`
      : ` It's best suited for ${product.bestFor.toLowerCase()}.`;
    return opener + middle + closer;
  }

  // Prediction-markets specific path
  if (product.subcategory === "Prediction Markets") {
    const opener = `${product.name} is a ${product.subcategory.toLowerCase()} platform with a ${product.fees} fee structure and a ${product.minDeposit} minimum to start trading.`;
    const topPro = product.pros[0];
    const topCon = product.cons[0];
    const middle = topPro ? ` What sets it apart is ${topPro.charAt(0).toLowerCase()}${topPro.slice(1)}.` : "";
    const closer = topCon
      ? ` It's best for ${product.bestFor.toLowerCase()}, though traders should note that ${topCon.charAt(0).toLowerCase()}${topCon.slice(1)}.`
      : ` It's best for ${product.bestFor.toLowerCase()}.`;
    return opener + middle + closer;
  }

  // Opening sentence — anchor on the headline number (APY or bonus) when available
  if (product.apy && product.bonus) {
    parts.push(
      `${product.name} pairs ${product.apy} APY with ${product.bonus}, positioning it as a competitive option in the ${product.subcategory.toLowerCase()} category.`
    );
  } else if (product.apy) {
    parts.push(
      `${product.name} offers ${product.apy} APY in the ${product.subcategory.toLowerCase()} category, backed by ${product.provider}.`
    );
  } else if (product.bonus) {
    parts.push(
      `${product.name} leads with a ${product.bonus} offer, making it a notable choice in the ${product.subcategory.toLowerCase()} space.`
    );
  } else {
    parts.push(
      `${product.name} from ${product.provider} is a ${product.subcategory.toLowerCase()} product built for ${product.bestFor.toLowerCase()}.`
    );
  }

  // Middle sentence — fees + minimum + top strength
  const feeMin: string[] = [];
  if (product.fees && product.fees !== "$0/month") {
    feeMin.push(`a ${product.fees} fee structure`);
  } else if (product.fees === "$0/month") {
    feeMin.push("no monthly fees");
  }
  if (product.minDeposit && product.minDeposit !== "$0") {
    feeMin.push(`a ${product.minDeposit} minimum to open`);
  } else if (product.minDeposit === "$0") {
    feeMin.push("no minimum to open");
  }
  const topPro = product.pros[0];
  if (feeMin.length && topPro) {
    parts.push(
      `With ${feeMin.join(" and ")}, the account stands out for ${topPro.charAt(0).toLowerCase()}${topPro.slice(1)}.`
    );
  } else if (topPro) {
    parts.push(`Its strongest attribute is ${topPro.charAt(0).toLowerCase()}${topPro.slice(1)}.`);
  }

  // Closing sentence — best-for + a measured caveat from cons
  const topCon = product.cons[0];
  if (topCon) {
    parts.push(
      `It's best suited for ${product.bestFor.toLowerCase()}, though prospective customers should weigh that ${topCon.charAt(0).toLowerCase()}${topCon.slice(1)}.`
    );
  } else {
    parts.push(`It's best suited for ${product.bestFor.toLowerCase()}.`);
  }

  return parts.join(" ");
}

export function ClarityResearch({ product }: { product: Product }) {
  const text = handTunedCommentary[product.slug] || buildDynamicCommentary(product);

  const date = "Apr 22, 2025";

  return (
    <div className="border border-[#0e4d45]/20 rounded mb-3 sm:mb-5 overflow-hidden">
      <div className="bg-[#0e4d45] px-3 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2">
        <div className="w-5 h-5 bg-[#fef6f1]/20 rounded-sm flex items-center justify-center">
          <span className="text-[#fef6f1] text-[10px] font-black">R</span>
        </div>
        <div>
          <div className="text-[10px] sm:text-[11px] font-bold text-[#fef6f1] uppercase tracking-widest">Research Commentary</div>
          <div className="text-[9px] sm:text-[10px] text-[#fef6f1]/60">I&R Editorial Research Desk</div>
        </div>
      </div>
      <div className="bg-white px-3 sm:px-4 py-2 sm:py-3">
        <p className="text-xs sm:text-sm text-black leading-relaxed">{text}</p>
        <div className="mt-2 sm:mt-3 pt-2 sm:pt-2.5 border-t border-[#e4d9cf] flex items-center justify-between text-[9px] sm:text-[10px]">
          <span className="italic text-[#0e4d45] font-medium">I&R Research</span>
          <span className="text-black/50">Updated {date}</span>
        </div>
      </div>
    </div>
  );
}

// --- Letter Grade Badge ---
function gradeFromRating(rating: number): string {
  if (rating >= 4.7) return "A+";
  if (rating >= 4.4) return "A";
  if (rating >= 4.1) return "A-";
  if (rating >= 3.8) return "B+";
  if (rating >= 3.5) return "B";
  if (rating >= 3.2) return "B-";
  return "C+";
}

export function GradeBadge({ rating, grade: gradeProp }: { rating: number; grade?: string }) {
  const grade = gradeProp ?? gradeFromRating(rating);
  const isA = grade.startsWith("A");
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-10 h-10 rounded border-2 flex items-center justify-center font-black text-lg leading-none ${
          isA
            ? "border-[#0e4d45] text-[#0e4d45]"
            : "border-[#540f04] text-[#540f04]"
        }`}
      >
        {grade}
      </div>
      <div className="text-[10px] text-black/50 mt-0.5 uppercase tracking-wide">Grade</div>
    </div>
  );
}

// --- Feature Cards Grid ---
interface FeatureCardProps {
  icon: string;
  title: string;
  items: { label: string; available: boolean }[];
  columns?: 1 | 2 | 3;
}

function FeatureCard({ icon, title, items, columns = 1 }: FeatureCardProps) {
  return (
    <div className="border border-[#e4d9cf] rounded p-2 sm:p-3.5 bg-white">
      <div className="flex items-center gap-1 sm:gap-1.5 mb-2 sm:mb-2.5">
        <span className="text-[#0e4d45] text-xs sm:text-sm font-bold">{icon}</span>
        <span className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest">{title}</span>
      </div>
      <div className={columns === 3 ? "grid grid-cols-2 sm:grid-cols-3 gap-1" : columns === 2 ? "grid grid-cols-2 gap-1" : "space-y-1"}>
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px]">
            <span className={item.available ? "text-[#0e4d45]" : "text-black/30"}>
              {item.available ? (
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M6 6l4 4M10 6l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
            </span>
            <span className={item.available ? "text-black" : "text-black/40"}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Strengths & Limitations ---
export function StrengthsLimitations({ pros, cons }: { pros: string[]; cons: string[] }) {
  return (
    <div className="grid md:grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-5">
      <div className="border border-[#e4d9cf] rounded p-2 sm:p-3.5 bg-white">
        <div className="flex items-center gap-1 sm:gap-1.5 mb-2 sm:mb-2.5">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="#0e4d45" strokeWidth="1.5" />
            <path d="M5 8l2 2 4-4" stroke="#0e4d45" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest">Strengths</span>
        </div>
        <ul className="space-y-1">
          {pros.map((item) => (
            <li key={item} className="flex items-start gap-1.5 text-[11px] sm:text-[12px] text-black">
              <span className="text-[#0e4d45] mt-0.5">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="border border-[#e4d9cf] rounded p-2 sm:p-3.5 bg-white">
        <div className="flex items-center gap-1 sm:gap-1.5 mb-2 sm:mb-2.5">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="#540f04" strokeWidth="1.5" />
            <path d="M8 5v4M8 11v.5" stroke="#540f04" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest">Limitations</span>
        </div>
        <ul className="space-y-1">
          {cons.map((item) => (
            <li key={item} className="flex items-start gap-1.5 text-[11px] sm:text-[12px] text-black">
              <span className="text-[#540f04] mt-0.5 font-bold text-[10px]">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// --- Investing-specific feature blocks ---
function getInvestingFeatures(product: Product) {
  const slug = product.slug;
  const isFidelity = slug === "fidelity";
  const isVanguard = slug === "vanguard";
  const isSchwab = slug === "charles-schwab";

  const accountTypes = [
    { label: "Individual", available: true },
    { label: "Joint", available: true },
    { label: "IRA", available: true },
    { label: "Roth IRA", available: true },
    { label: "Rollover IRA", available: true },
    { label: "SEP IRA", available: isFidelity || isVanguard || isSchwab },
    { label: "Simple IRA", available: isFidelity || isSchwab },
    { label: "Trust", available: isFidelity || isSchwab },
  ];

  const researchTools = [
    { label: "Advanced charting", available: isFidelity || isSchwab },
    { label: "Third-party research", available: isFidelity || isVanguard || isSchwab },
    { label: "Screeners and scanners", available: isFidelity || isSchwab },
    { label: "Market insights", available: true },
  ];

  const assets = [
    { label: "Stocks", available: true },
    { label: "ETFs", available: true },
    { label: "Options", available: slug !== "betterment" && slug !== "vanguard" },
    { label: "Bonds", available: isFidelity || isVanguard || isSchwab },
    { label: "Mutual Funds", available: isFidelity || isVanguard || isSchwab },
    { label: "Forex", available: isFidelity || isSchwab },
    { label: "Crypto", available: slug === "robinhood" || slug === "webull" },
    { label: "Futures", available: isSchwab },
    { label: "CDs", available: isFidelity || isSchwab },
  ];

  const platform = [
    { label: "Extended Hours Trading", available: isFidelity || slug === "robinhood" || isSchwab },
    { label: "Real-time Quotes", available: true },
    { label: "Auto DRIP", available: isFidelity || isVanguard || isSchwab },
    { label: "Portfolio Analysis", available: isFidelity || slug === "betterment" || isSchwab },
  ];

  return { accountTypes, researchTools, assets, platform };
}

function getBankingFeatures(product: Product) {
  const slug = product.slug;
  const isSofi = slug === "sofi-checking-savings";
  const isAlly = slug === "ally-savings" || slug === "ally-checking";
  const isChase = slug === "chase-total-checking";

  const accountTypes = [
    { label: "Savings", available: true },
    { label: "Checking", available: isSofi || isAlly || isChase },
    { label: "Money Market", available: isAlly || slug === "marcus-savings" },
    { label: "CDs", available: isAlly || slug === "marcus-savings" },
    { label: "Joint Account", available: true },
    { label: "Business Account", available: isChase },
  ];

  const features = [
    { label: "Mobile Check Deposit", available: true },
    { label: "Zelle / P2P Transfers", available: isSofi || isChase || isAlly },
    { label: "Early Direct Deposit", available: isSofi || isAlly },
    { label: "ATM Reimbursement", available: isSofi || isAlly },
    { label: "FDIC Insured", available: true },
    { label: "Overdraft Protection", available: isChase || isAlly },
  ];

  return { accountTypes, features };
}

// --- Crypto-specific feature blocks ---
function CryptoResearchBlocks({ product }: { product: Product }) {
  const accountTypes = (product.accountTypes ?? []).map((label) => ({ label, available: true }));
  const assets = (product.assetsAvailable ?? []).map((label) => ({ label, available: true }));
  const features = (product.platformFeatures ?? []).map((label) => ({ label, available: true }));

  return (
    <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-5">
      <div className="grid md:grid-cols-2 gap-2 sm:gap-3">
        {accountTypes.length > 0 && (
          <FeatureCard icon="[=]" title="Account Types" items={accountTypes} />
        )}
        {assets.length > 0 && (
          <FeatureCard icon="[A]" title="Assets Available" items={assets} />
        )}
      </div>
      {features.length > 0 && (
        <FeatureCard icon="[P]" title="Platform Features" items={features} columns={2} />
      )}
      <div className="border border-[#e4d9cf] rounded p-2 sm:p-3.5 bg-white">
        <div className="flex items-center gap-1 sm:gap-1.5 mb-2 sm:mb-2.5">
          <span className="text-[#0e4d45] text-xs sm:text-sm font-bold">$</span>
          <span className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest">Fee & Asset Snapshot</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-[10px] sm:text-[11px]">
          <div>
            <div className="text-black/50 mb-0.5">Trading Fees</div>
            <div className="font-bold text-black">{product.fees}</div>
          </div>
          <div>
            <div className="text-black/50 mb-0.5">Min Deposit</div>
            <div className="font-bold text-black">{product.minDeposit}</div>
          </div>
          {product.numCryptoAssets && (
            <div>
              <div className="text-black/50 mb-0.5">Coins Listed</div>
              <div className="font-bold text-[#0e4d45]">{product.numCryptoAssets}</div>
            </div>
          )}
          {product.bonus && (
            <div>
              <div className="text-black/50 mb-0.5">Bonus</div>
              <div className="font-bold text-black">{product.bonus}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Main Research Blocks Component ---
export function ResearchBlocks({ product }: { product: Product }) {
  const isInvesting = product.category === "investing";
  const isBanking = product.category === "bank";
  const isCrypto = product.subcategory === "Crypto";

  if (isCrypto) {
    return <CryptoResearchBlocks product={product} />;
  }

  if (isInvesting && (product.accountTypes?.length || product.assetsAvailable?.length || product.platformFeatures?.length)) {
    const accountTypes = (product.accountTypes ?? []).map((label) => ({ label, available: true }));
    const assets = (product.assetsAvailable ?? []).map((label) => ({ label, available: true }));
    const platform = (product.platformFeatures ?? []).map((label) => ({ label, available: true }));
    const marginRate = product.slug === "robinhood" ? "5.75% - 11.75% (Gold)" : product.slug === "fidelity" ? "5.83% - 12.58%" : product.slug === "interactive-brokers" ? "As low as 5.83%" : product.slug === "charles-schwab" ? "11.50% - 13.25%" : product.slug === "vanguard" ? "10.75% - 12.75%" : product.slug === "webull" || product.slug === "moomoo" ? "6.99% - 9.74%" : product.slug === "sofi-invest" ? "11.00%" : product.slug === "etrade-invest" ? "11.20% - 13.20%" : "varies";
    const feeStr = product.fees;

    return (
      <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-5">
        <div className="grid md:grid-cols-2 gap-2 sm:gap-3">
          {accountTypes.length > 0 && <FeatureCard icon="[=]" title="Account Types" items={accountTypes} columns={2} />}
          {assets.length > 0 && <FeatureCard icon="[A]" title="Assets Available" items={assets} columns={2} />}
        </div>
        {platform.length > 0 && <FeatureCard icon="[P]" title="Platform Features" items={platform} columns={2} />}
        <div className="border border-[#e4d9cf] rounded p-2 sm:p-3.5 bg-white">
          <div className="flex items-center gap-1 sm:gap-1.5 mb-2 sm:mb-2.5">
            <span className="text-[#0e4d45] text-xs sm:text-sm font-bold">$</span>
            <span className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest">Fee & Account Snapshot</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-[10px] sm:text-[11px]">
            <div><div className="text-black/50 mb-0.5">Trading Fees</div><div className="font-bold text-black">{feeStr}</div></div>
            <div><div className="text-black/50 mb-0.5">Margin Rate</div><div className="font-bold text-black">{marginRate}</div></div>
            <div><div className="text-black/50 mb-0.5">Account Min</div><div className="font-bold text-black">{product.minDeposit}</div></div>
            {product.bonus && <div><div className="text-black/50 mb-0.5">Bonus</div><div className="font-bold text-[#0e4d45]">{product.bonus}</div></div>}
          </div>
        </div>
      </div>
    );
  }

  if (isInvesting) {
    const { accountTypes, researchTools, assets, platform } = getInvestingFeatures(product);
    const marginRate = product.slug === "robinhood" ? "8.00% - 13.00%" : product.slug === "fidelity" ? "5.83% - 12.58%" : "varies";
    const feeStr = product.fees === "$0 commissions" || product.fees === "Commission-free" ? "Commission-Free" : product.fees;

    return (
      <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-5">
        {/* Account Types + Research & Tools */}
        <div className="grid md:grid-cols-2 gap-2 sm:gap-3">
          <FeatureCard icon="=" title="Account Types" items={accountTypes} />
          <FeatureCard icon="[R]" title="Research & Tools" items={researchTools} />
        </div>

        {/* Assets Available */}
        <FeatureCard icon="[A]" title="Assets Available" items={assets} columns={3} />

        {/* Mobile & Support + Platform Features */}
        <div className="grid md:grid-cols-2 gap-2 sm:gap-3">
          <div className="border border-[#e4d9cf] rounded p-2 sm:p-3.5 bg-white">
            <div className="flex items-center gap-1 sm:gap-1.5 mb-2 sm:mb-2.5">
              <span className="text-[#0e4d45] text-xs sm:text-sm font-bold">M</span>
              <span className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest">Mobile & Support</span>
            </div>
            <div className="flex items-center justify-between mb-2 text-[10px] sm:text-[11px]">
              <span className="text-black/60">App rating:</span>
              <span className="font-bold text-black">{product.rating}/5 ★</span>
            </div>
            <div className="flex gap-1.5 mb-2">
              <span className="text-[9px] sm:text-[10px] border border-[#e4d9cf] rounded px-2 py-0.5 text-black/70">iOS</span>
              <span className="text-[9px] sm:text-[10px] border border-[#e4d9cf] rounded px-2 py-0.5 text-black/70">Android</span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-black/70">24/7 Phone & Chat</div>
          </div>
          <FeatureCard icon="[P]" title="Platform Features" items={platform} />
        </div>

        {/* Security & Insurance */}
        <div className="border border-[#e4d9cf] rounded p-2 sm:p-3.5 bg-white">
          <div className="flex items-center gap-1 sm:gap-1.5 mb-2 sm:mb-2.5">
            <span className="text-[#0e4d45] text-xs sm:text-sm font-bold">S</span>
            <span className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest">Security & Insurance</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[10px] sm:text-[11px]">
            {[
              { label: "2FA Authentication", available: true },
              { label: "SIPC $500K Coverage", available: true },
              { label: "Biometric Login", available: true },
              { label: "Excess SIPC Insurance", available: product.slug === "fidelity" || product.slug === "charles-schwab" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span className={item.available ? "text-[#0e4d45]" : "text-black/30"}>
                  {item.available ? "✓" : "–"}
                </span>
                <span className={item.available ? "text-black" : "text-black/40"}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fee Structure */}
        <div className="border border-[#e4d9cf] rounded p-2 sm:p-3.5 bg-white">
          <div className="flex items-center gap-1 sm:gap-1.5 mb-2 sm:mb-2.5">
            <span className="text-[#0e4d45] text-xs sm:text-sm font-bold">$</span>
            <span className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest">Fee Structure</span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 text-[10px] sm:text-[11px]">
            <div>
              <div className="text-black/50 mb-0.5">Transfer Fee</div>
              <div className="font-bold text-black">{feeStr}</div>
            </div>
            <div>
              <div className="text-black/50 mb-0.5">Margin Rate</div>
              <div className="font-bold text-black">{marginRate}</div>
            </div>
            <div>
              <div className="text-black/50 mb-0.5">Account Min</div>
              <div className="font-bold text-black">{product.minDeposit}</div>
            </div>
            <div>
              <div className="text-black/50 mb-0.5">Accounts</div>
              <div className="font-bold text-black">
                {product.slug === "fidelity" ? "40M+" : product.slug === "robinhood" ? "23M+" : product.slug === "betterment" ? "800K+" : "10M+"}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isBanking) {
    const { accountTypes, features } = getBankingFeatures(product);
    return (
      <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-5">
        <div className="grid md:grid-cols-2 gap-2 sm:gap-3">
          <FeatureCard icon="A" title="Account Types" items={accountTypes} />
          <FeatureCard icon="[B]" title="Banking Features" items={features} />
        </div>
        <div className="border border-[#e4d9cf] rounded p-2 sm:p-3.5 bg-white">
          <div className="flex items-center gap-1 sm:gap-1.5 mb-2 sm:mb-2.5">
            <span className="text-[#0e4d45] text-xs sm:text-sm font-bold">S</span>
            <span className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest">Security & Insurance</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[10px] sm:text-[11px]">
            {[
              { label: "FDIC Insured", available: true },
              { label: "256-bit Encryption", available: true },
              { label: "Biometric Login", available: true },
              { label: "Fraud Monitoring", available: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span className="text-[#0e4d45]">✓</span>
                <span className="text-black">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="border border-[#e4d9cf] rounded p-2 sm:p-3.5 bg-white">
          <div className="flex items-center gap-1 sm:gap-1.5 mb-2 sm:mb-2.5">
            <span className="text-[#0e4d45] text-xs sm:text-sm font-bold">$</span>
            <span className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest">Fee Structure</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 text-[10px] sm:text-[11px]">
            <div>
              <div className="text-black/50 mb-0.5">Monthly Fee</div>
              <div className="font-bold text-black">{product.fees}</div>
            </div>
            <div>
              <div className="text-black/50 mb-0.5">Min Deposit</div>
              <div className="font-bold text-black">{product.minDeposit}</div>
            </div>
            {product.apy && (
              <div>
                <div className="text-black/50 mb-0.5">APY</div>
                <div className="font-bold text-[#0e4d45]">{product.apy}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Financial apps
  return (
    <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-5">
      <div className="grid md:grid-cols-2 gap-2 sm:gap-3">
        <FeatureCard
          icon="[P]"
          title="Platform Support"
          items={[
            { label: "iOS App", available: true },
            { label: "Android App", available: true },
            { label: "Web Browser", available: true },
            { label: "Apple Watch", available: product.slug === "mint" || product.slug === "ynab" },
          ]}
        />
        <FeatureCard
          icon="[F]"
          title="Key Features"
          items={[
            { label: "Bank Sync", available: true },
            { label: "Spending Alerts", available: true },
            { label: "Credit Monitoring", available: product.slug === "credit-karma" || product.slug === "mint" },
            { label: "Investment Tracking", available: product.slug === "mint" || product.slug === "personal-capital" },
          ]}
        />
      </div>
      <div className="border border-[#e4d9cf] rounded p-2 sm:p-3.5 bg-white">
        <div className="flex items-center gap-1 sm:gap-1.5 mb-2 sm:mb-2.5">
          <span className="text-[#0e4d45] text-xs sm:text-sm font-bold">$</span>
          <span className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest">Pricing</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 text-[10px] sm:text-[11px]">
          <div>
            <div className="text-black/50 mb-0.5">Cost</div>
            <div className="font-bold text-black">{product.fees}</div>
          </div>
          <div>
            <div className="text-black/50 mb-0.5">Rating</div>
            <div className="font-bold text-black">{product.rating}/5</div>
          </div>
          {product.bonus && (
            <div>
              <div className="text-black/50 mb-0.5">Bonus</div>
              <div className="font-bold text-black">{product.bonus}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}