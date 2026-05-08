import { createFileRoute, Link } from "@tanstack/react-router";
import { getBySlug, products } from "@/data/products";
import { StarRating, ProductLogo } from "@/components/product-card";
import { ClarityResearch, GradeBadge, ResearchBlocks, StrengthsLimitations } from "@/components/research-blocks";

export const Route = createFileRoute("/shipper-draft")({
  validateSearch: (search: Record<string, unknown>) => ({
    v: Number(search?.v) || 1,
  }),
  component: ShipperDraft,
});

// Use a sample product for the variations
const sampleSlug = "sofi-checking-savings";

// ==========================================
// VERSION 1: Magazine Hero + Metric Bar
// Big editorial header with grade badge prominent,
// 4-column metric bar, verdict block, then sections
// ==========================================
function Variation1() {
  const p = getBySlug(sampleSlug) || products[0];
  const related = products.filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, 3);

  return (
    <div className="bg-[#fef6f1] min-h-[200px] p-3 sm:p-4">
      <div className="max-w-4xl mx-auto">
        {/* Magazine-style hero header */}
        <div className="bg-[#fef6f1] border-2 border-[#0e4d45] rounded mb-3 overflow-hidden">
          <div className="bg-[#0e4d45] px-3 sm:px-4 py-1.5 flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#fef6f1]">In-Depth Review</span>
            <span className="text-[9px] sm:text-[10px] text-[#fef6f1]/70">Updated Apr 22, 2025</span>
          </div>
          <div className="p-3 sm:p-5">
            <div className="flex items-start gap-3 sm:gap-4">
              <ProductLogo p={p} size={56} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                  {p.editorsPick && (
                    <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest border border-[#0e4d45] text-[#0e4d45] px-1.5 py-0.5 rounded-sm">
                      Editor's Pick
                    </span>
                  )}
                  <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-black/40">{p.subcategory}</span>
                </div>
                <h1 className="text-xl sm:text-3xl font-serif font-bold text-black leading-tight mb-1">{p.name}</h1>
                <div className="text-[11px] sm:text-xs text-black/50 mb-2">by {p.provider}</div>
                <div className="flex items-center gap-2 flex-wrap">
                  <StarRating rating={p.rating} size="sm" />
                  <span className="text-[10px] sm:text-xs font-semibold text-black">{p.rating}</span>
                  <span className="text-[10px] sm:text-xs text-black/50">({p.reviews.toLocaleString()} reviews)</span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded border-2 border-[#0e4d45] bg-[#fef6f1] flex flex-col items-center justify-center">
                  <span className="text-xl sm:text-3xl font-black text-[#0e4d45] leading-none">A+</span>
                  <span className="text-[7px] sm:text-[9px] text-black/50 uppercase tracking-wider mt-0.5 sm:mt-1">Grade</span>
                </div>
              </div>
            </div>
          </div>

          {/* Metric bar — 4 columns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-[#e4d9cf] divide-x divide-[#e4d9cf]">
            {p.apy && (
              <div className="p-2.5 sm:p-3 text-center">
                <div className="text-[8px] sm:text-[9px] font-bold text-black/40 uppercase tracking-widest mb-0.5">APY</div>
                <div className="text-sm sm:text-lg font-black text-[#0e4d45]">{p.apy}</div>
              </div>
            )}
            {p.bonus && (
              <div className="p-2.5 sm:p-3 text-center">
                <div className="text-[8px] sm:text-[9px] font-bold text-black/40 uppercase tracking-widest mb-0.5">Bonus</div>
                <div className="text-sm sm:text-lg font-black text-black">{p.bonus}</div>
              </div>
            )}
            <div className="p-2.5 sm:p-3 text-center">
              <div className="text-[8px] sm:text-[9px] font-bold text-black/40 uppercase tracking-widest mb-0.5">Monthly Fee</div>
              <div className="text-sm sm:text-lg font-black text-black">{p.fees}</div>
            </div>
            <div className="p-2.5 sm:p-3 text-center">
              <div className="text-[8px] sm:text-[9px] font-bold text-black/40 uppercase tracking-widest mb-0.5">Min. Deposit</div>
              <div className="text-sm sm:text-lg font-black text-black">{p.minDeposit}</div>
            </div>
          </div>

          <div className="p-3 sm:p-4 border-t border-[#e4d9cf] flex gap-2">
            <a href="#" onClick={(e) => e.preventDefault()} className="flex-1 text-center px-3 py-2.5 rounded-sm bg-[#0e4d45] hover:bg-[#0a3832] text-[#fef6f1] text-xs sm:text-sm font-bold transition-colors uppercase tracking-wider">
              Open Account
            </a>
            <button className="px-3 py-2.5 rounded-sm border border-[#e4d9cf] text-black text-xs font-semibold hover:bg-[#f7ebe2] transition-colors">Compare</button>
            <button className="px-3 py-2.5 rounded-sm border border-[#e4d9cf] text-black text-xs font-semibold hover:bg-[#f7ebe2] transition-colors">Save</button>
          </div>
        </div>

        {/* Editorial Verdict (pull quote style) */}
        <div className="bg-[#0e4d45] text-[#fef6f1] rounded p-4 sm:p-5 mb-3 relative overflow-hidden">
          <div className="absolute top-2 left-3 text-4xl sm:text-6xl font-serif leading-none opacity-20">"</div>
          <div className="relative pl-6 sm:pl-8">
            <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#fef6f1]/60 mb-1.5">Editorial Verdict</div>
            <p className="text-sm sm:text-base font-serif italic leading-relaxed mb-2">
              "One of the strongest all-in-one banking packages available today, a standout for consumers who want simplicity without sacrifice."
            </p>
            <div className="text-[10px] sm:text-[11px] text-[#fef6f1]/70">— I&R Editorial Team</div>
          </div>
        </div>

        <ClarityResearch product={p} />
        <ResearchBlocks product={p} />
        <StrengthsLimitations pros={p.pros} cons={p.cons} />

        {/* Key Highlights */}
        <section className="bg-[#fef6f1] border border-[#e4d9cf] rounded p-3 sm:p-4 mb-3">
          <h2 className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest border-b border-[#e4d9cf] pb-1.5 mb-2 sm:mb-3">Key Highlights</h2>
          <ul className="space-y-1">
            {p.highlights.map((h) => (
              <li key={h} className="flex items-start gap-1.5 text-xs sm:text-sm">
                <span className="text-[#0e4d45] font-bold mt-0.5">&#9679;</span>
                <span className="text-black">{h}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-[#fef6f1] border border-[#e4d9cf] rounded p-3 sm:p-4 mb-3">
          <h2 className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest border-b border-[#e4d9cf] pb-1.5 mb-2 sm:mb-3">Who It Is Best For</h2>
          <p className="text-xs sm:text-sm text-black leading-relaxed">
            {p.name} is ideal for <strong>{p.bestFor.toLowerCase()}</strong>. If you value{" "}
            {p.highlights[0]?.toLowerCase()} and want a trusted provider with strong customer reviews, this is a solid choice. Readers consistently rate it {p.rating}/5 stars based on ease of use, value, and customer support.
          </p>
        </section>

        {related.length > 0 && (
          <section>
            <h2 className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest border-b border-[#e4d9cf] pb-1.5 mb-2 sm:mb-3">Compare Similar Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              {related.map((r) => (
                <Link key={r.slug} to="/product/$slug" params={{ slug: r.slug }} className="bg-[#fef6f1] border border-[#e4d9cf] rounded p-2 sm:p-3 hover:border-[#0e4d45] transition-all group">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <ProductLogo p={r} size={28} />
                    <div className="min-w-0">
                      <div className="text-[11px] sm:text-xs font-semibold text-black truncate group-hover:text-[#0e4d45]">{r.name}</div>
                      <StarRating rating={r.rating} size="sm" />
                    </div>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-black/60 leading-snug">{r.tagline}</p>
                  <div className="mt-1.5 text-[9px] sm:text-[10px] font-semibold text-[#0e4d45] uppercase tracking-wider group-hover:underline">View Review →</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-4 text-[9px] sm:text-[10px] text-black/40 leading-snug border-t border-[#e4d9cf] pt-2">
          <strong>Advertiser Disclosure:</strong> We may be compensated when you click on links to partner products. This does not influence our editorial ratings or rankings.
        </section>
      </div>
    </div>
  );
}

// ==========================================
// VERSION 2: Feature Card Grid (matches screenshots)
// Prominent grade badge header + 2x2 feature cards
// (Account Types, Banking Features, Security, Fee Structure)
// Strengths/Limitations split grid + Key Highlights
// ==========================================
function Variation2() {
  const p = getBySlug(sampleSlug) || products[0];
  const related = products.filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, 3);

  const accountTypes = [
    { label: "Savings", available: true },
    { label: "Checking", available: true },
    { label: "Money Market", available: false },
    { label: "CDs", available: false },
    { label: "Joint Account", available: true },
    { label: "Business Account", available: false },
  ];
  const bankingFeatures = [
    { label: "Mobile Check Deposit", available: true },
    { label: "Zelle / P2P Transfers", available: true },
    { label: "Early Direct Deposit", available: true },
    { label: "ATM Reimbursement", available: true },
    { label: "FDIC Insured", available: true },
    { label: "Overdraft Protection", available: false },
  ];
  const securityFeatures = [
    "FDIC Insured",
    "256-bit Encryption",
    "Biometric Login",
    "Fraud Monitoring",
  ];

  return (
    <div className="bg-[#fef6f1] min-h-[200px] p-3 sm:p-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero with prominent grade */}
        <div className="bg-[#fef6f1] border border-[#e4d9cf] rounded mb-3 overflow-hidden">
          <div className="p-3 sm:p-5">
            <div className="flex items-start gap-3 sm:gap-4">
              <ProductLogo p={p} size={56} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                  <h1 className="text-base sm:text-2xl font-serif font-bold text-black leading-tight">{p.name}</h1>
                  {p.editorsPick && (
                    <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest border border-[#0e4d45] text-[#0e4d45] px-1.5 py-0.5 rounded-sm">Editor</span>
                  )}
                </div>
                <div className="text-[11px] sm:text-xs text-black/50 mb-1.5">by {p.provider}</div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <StarRating rating={p.rating} size="sm" />
                  <span className="text-[10px] sm:text-xs font-semibold text-black">{p.rating}</span>
                  <span className="text-[10px] sm:text-xs text-black/50">({p.reviews.toLocaleString()})</span>
                </div>
              </div>
              <div className="flex-shrink-0 flex flex-col items-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded border-2 border-[#0e4d45] bg-[#fef6f1] flex items-center justify-center">
                  <span className="text-2xl sm:text-3xl font-black text-[#0e4d45] leading-none">A+</span>
                </div>
                <span className="text-[8px] sm:text-[9px] text-black/50 uppercase tracking-wider mt-1">Grade</span>
              </div>
            </div>

            {/* 4-stat grid */}
            <div className="mt-3 sm:mt-4 pt-3 border-t border-[#e4d9cf] grid grid-cols-2 gap-2 sm:gap-3">
              {p.apy && (
                <div>
                  <div className="text-[9px] sm:text-[10px] font-bold text-black/40 uppercase tracking-widest mb-0.5">APY</div>
                  <div className="text-base sm:text-lg font-black text-[#0e4d45]">{p.apy}</div>
                </div>
              )}
              {p.bonus && (
                <div>
                  <div className="text-[9px] sm:text-[10px] font-bold text-black/40 uppercase tracking-widest mb-0.5">Bonus</div>
                  <div className="text-base sm:text-lg font-black text-black">{p.bonus}</div>
                </div>
              )}
              <div>
                <div className="text-[9px] sm:text-[10px] font-bold text-black/40 uppercase tracking-widest mb-0.5">Fees</div>
                <div className="text-sm sm:text-base font-bold text-black">{p.fees}</div>
              </div>
              <div>
                <div className="text-[9px] sm:text-[10px] font-bold text-black/40 uppercase tracking-widest mb-0.5">Min. Deposit</div>
                <div className="text-sm sm:text-base font-bold text-black">{p.minDeposit}</div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-3 sm:mt-4 flex gap-2">
              <a href="#" onClick={(e) => e.preventDefault()} className="flex-1 text-center px-3 py-2.5 rounded-sm bg-[#0e4d45] hover:bg-[#0a3832] text-[#fef6f1] text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors">Open Account</a>
              <button className="px-3 py-2.5 rounded-sm border border-[#e4d9cf] text-black text-xs font-semibold hover:bg-[#f7ebe2]">Compare</button>
              <button className="px-3 py-2.5 rounded-sm border border-[#e4d9cf] text-black text-xs font-semibold hover:bg-[#f7ebe2]">Save</button>
            </div>
          </div>
        </div>

        {/* Overview */}
        <section className="bg-[#fef6f1] border border-[#e4d9cf] rounded p-3 sm:p-4 mb-3">
          <h2 className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest border-b border-[#e4d9cf] pb-1.5 mb-2">Overview</h2>
          <p className="text-xs sm:text-sm text-black leading-relaxed">
            {p.tagline} Best for <strong>{p.bestFor.toLowerCase()}</strong>, this product stands out for its combination of features, fees, and user experience.
          </p>
        </section>

        <ClarityResearch product={p} />

        {/* Feature Cards Grid — 2 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-3">
          {/* Account Types */}
          <div className="bg-[#fef6f1] border border-[#e4d9cf] rounded p-3 sm:p-4">
            <div className="flex items-center gap-1.5 mb-2 sm:mb-3 pb-1.5 border-b border-[#e4d9cf]">
              <div className="w-5 h-5 rounded-sm bg-[#0e4d45]/10 flex items-center justify-center">
                <span className="text-[#0e4d45] text-[10px] font-black">AT</span>
              </div>
              <h3 className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest">Account Types</h3>
            </div>
            <ul className="space-y-1 sm:space-y-1.5">
              {accountTypes.map((a) => (
                <li key={a.label} className={`flex items-center gap-1.5 text-xs sm:text-sm ${a.available ? "text-black" : "text-black/35 line-through"}`}>
                  {a.available ? (
                    <span className="w-4 h-4 rounded-full border-2 border-[#0e4d45] flex items-center justify-center flex-shrink-0">
                      <span className="text-[#0e4d45] text-[8px] font-black">&#10003;</span>
                    </span>
                  ) : (
                    <span className="w-4 h-4 rounded-full border-2 border-black/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-black/30 text-[8px] font-black">&#10005;</span>
                    </span>
                  )}
                  <span>{a.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Banking Features */}
          <div className="bg-[#fef6f1] border border-[#e4d9cf] rounded p-3 sm:p-4">
            <div className="flex items-center gap-1.5 mb-2 sm:mb-3 pb-1.5 border-b border-[#e4d9cf]">
              <div className="w-5 h-5 rounded-sm bg-[#0e4d45]/10 flex items-center justify-center">
                <span className="text-[#0e4d45] text-[10px] font-black">$</span>
              </div>
              <h3 className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest">Banking Features</h3>
            </div>
            <ul className="space-y-1 sm:space-y-1.5">
              {bankingFeatures.map((a) => (
                <li key={a.label} className={`flex items-center gap-1.5 text-xs sm:text-sm ${a.available ? "text-black" : "text-black/35 line-through"}`}>
                  {a.available ? (
                    <span className="w-4 h-4 rounded-full border-2 border-[#0e4d45] flex items-center justify-center flex-shrink-0">
                      <span className="text-[#0e4d45] text-[8px] font-black">&#10003;</span>
                    </span>
                  ) : (
                    <span className="w-4 h-4 rounded-full border-2 border-black/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-black/30 text-[8px] font-black">&#10005;</span>
                    </span>
                  )}
                  <span>{a.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Security — full width */}
        <div className="bg-[#fef6f1] border border-[#e4d9cf] rounded p-3 sm:p-4 mb-3">
          <div className="flex items-center gap-1.5 mb-2 sm:mb-3 pb-1.5 border-b border-[#e4d9cf]">
            <div className="w-5 h-5 rounded-sm bg-[#0e4d45]/10 flex items-center justify-center">
              <span className="text-[#0e4d45] text-[10px] font-black">S</span>
            </div>
            <h3 className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest">Security &amp; Insurance</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-1.5">
            {securityFeatures.map((s) => (
              <div key={s} className="flex items-center gap-1.5 text-xs sm:text-sm text-black">
                <span className="text-[#0e4d45] font-bold">&#10003;</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fee Structure — table */}
        <div className="bg-[#fef6f1] border border-[#e4d9cf] rounded p-3 sm:p-4 mb-3">
          <div className="flex items-center gap-1.5 mb-2 sm:mb-3 pb-1.5 border-b border-[#e4d9cf]">
            <div className="w-5 h-5 rounded-sm bg-[#0e4d45]/10 flex items-center justify-center">
              <span className="text-[#0e4d45] text-[10px] font-black">F</span>
            </div>
            <h3 className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest">Fee Structure</h3>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div>
              <div className="text-[9px] sm:text-[10px] text-black/40 uppercase tracking-wide mb-0.5">Monthly Fee</div>
              <div className="text-sm sm:text-base font-bold text-black">{p.fees}</div>
            </div>
            <div>
              <div className="text-[9px] sm:text-[10px] text-black/40 uppercase tracking-wide mb-0.5">Min Deposit</div>
              <div className="text-sm sm:text-base font-bold text-black">{p.minDeposit}</div>
            </div>
            <div>
              <div className="text-[9px] sm:text-[10px] text-black/40 uppercase tracking-wide mb-0.5">APY</div>
              <div className="text-sm sm:text-base font-bold text-[#0e4d45]">{p.apy || "—"}</div>
            </div>
          </div>
        </div>

        {/* Strengths / Limitations split */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-3">
          <div className="bg-[#fef6f1] border border-[#e4d9cf] rounded p-3 sm:p-4">
            <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-[#e4d9cf]">
              <span className="w-4 h-4 rounded-full border-2 border-[#0e4d45] flex items-center justify-center">
                <span className="text-[#0e4d45] text-[8px] font-black">&#10003;</span>
              </span>
              <h3 className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest">Strengths</h3>
            </div>
            <ul className="space-y-1">
              {p.pros.map((pro) => (
                <li key={pro} className="flex items-start gap-1.5 text-xs sm:text-sm text-black">
                  <span className="text-[#0e4d45] font-bold mt-0.5">&#10003;</span>
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-[#fef6f1] border border-[#e4d9cf] rounded p-3 sm:p-4">
            <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-[#e4d9cf]">
              <span className="w-4 h-4 rounded-full border-2 border-[#540f04] flex items-center justify-center">
                <span className="text-[#540f04] text-[8px] font-black">!</span>
              </span>
              <h3 className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest">Limitations</h3>
            </div>
            <ul className="space-y-1">
              {p.cons.map((con) => (
                <li key={con} className="flex items-start gap-1.5 text-xs sm:text-sm text-black">
                  <span className="text-[#540f04] font-bold mt-0.5">&#9679;</span>
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Key Highlights */}
        <section className="bg-[#fef6f1] border border-[#e4d9cf] rounded p-3 sm:p-4 mb-3">
          <h2 className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest border-b border-[#e4d9cf] pb-1.5 mb-2">Key Highlights</h2>
          <ul className="space-y-1">
            {p.highlights.map((h) => (
              <li key={h} className="flex items-start gap-1.5 text-xs sm:text-sm">
                <span className="text-[#0e4d45] font-bold mt-0.5">&#9679;</span>
                <span className="text-black">{h}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-[#fef6f1] border border-[#e4d9cf] rounded p-3 sm:p-4 mb-3">
          <h2 className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest border-b border-[#e4d9cf] pb-1.5 mb-2">Who It Is Best For</h2>
          <p className="text-xs sm:text-sm text-black leading-relaxed">
            {p.name} is ideal for <strong>{p.bestFor.toLowerCase()}</strong>. If you value{" "}
            {p.highlights[0]?.toLowerCase()} and want a trusted provider with strong customer reviews, this is a solid choice. Readers consistently rate it {p.rating}/5 stars based on ease of use, value, and customer support.
          </p>
        </section>

        {related.length > 0 && (
          <section>
            <h2 className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest border-b border-[#e4d9cf] pb-1.5 mb-2">Compare Similar Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              {related.map((r) => (
                <Link key={r.slug} to="/product/$slug" params={{ slug: r.slug }} className="bg-[#fef6f1] border border-[#e4d9cf] rounded p-2 sm:p-3 hover:border-[#0e4d45] transition-all group">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <ProductLogo p={r} size={28} />
                    <div className="min-w-0">
                      <div className="text-[11px] sm:text-xs font-semibold text-black truncate group-hover:text-[#0e4d45]">{r.name}</div>
                      <StarRating rating={r.rating} size="sm" />
                    </div>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-black/60 leading-snug">{r.tagline}</p>
                  <div className="mt-1.5 text-[9px] sm:text-[10px] font-semibold text-[#0e4d45] uppercase tracking-wider group-hover:underline">View Review →</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-4 text-[9px] sm:text-[10px] text-black/40 leading-snug border-t border-[#e4d9cf] pt-2">
          <strong>Advertiser Disclosure:</strong> We may be compensated when you click on links to partner products. This does not influence our editorial ratings or rankings.
        </section>
      </div>
    </div>
  );
}

// ==========================================
// VERSION 3: At-A-Glance + Deep Dive Tabs Style
// Quick summary sidebar + scorecard with category scores
// Features table format + FAQ accordion-style
// ==========================================
function Variation3() {
  const p = getBySlug(sampleSlug) || products[0];
  const related = products.filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, 3);

  const scores = [
    { category: "APY / Rate", score: 5.0 },
    { category: "Fees", score: 5.0 },
    { category: "Mobile Experience", score: 4.8 },
    { category: "Customer Support", score: 4.5 },
    { category: "Account Options", score: 4.2 },
  ];

  const quickFacts = [
    { label: "Best For", value: p.bestFor },
    { label: "FDIC Insured", value: "Yes, up to $2M" },
    { label: "Mobile App", value: "iOS &amp; Android" },
    { label: "Customer Support", value: "24/7 chat &amp; phone" },
    { label: "Founded", value: "2011" },
  ];

  return (
    <div className="bg-[#fef6f1] min-h-[200px] p-3 sm:p-4">
      <div className="max-w-5xl mx-auto">
        {/* Compact header */}
        <div className="bg-[#fef6f1] border border-[#e4d9cf] rounded p-3 sm:p-4 mb-3">
          <div className="flex items-start gap-3">
            <ProductLogo p={p} size={52} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                <h1 className="text-base sm:text-xl font-serif font-bold text-black">{p.name}</h1>
                {p.editorsPick && (
                  <span className="text-[8px] font-bold uppercase tracking-widest border border-[#0e4d45] text-[#0e4d45] px-1.5 py-0.5 rounded-sm">Editor</span>
                )}
              </div>
              <div className="text-[11px] text-black/50 mb-1">by {p.provider}</div>
              <div className="flex items-center gap-1.5">
                <StarRating rating={p.rating} size="sm" />
                <span className="text-xs font-semibold text-black">{p.rating}</span>
                <span className="text-[10px] text-black/50">({p.reviews.toLocaleString()})</span>
              </div>
            </div>
            <GradeBadge rating={p.rating} />
          </div>
        </div>

        {/* Split: Scorecard + At-a-Glance */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-3 mb-3">
          {/* Editorial Scorecard */}
          <div className="bg-[#fef6f1] border border-[#e4d9cf] rounded p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2 sm:mb-3 pb-1.5 border-b border-[#e4d9cf]">
              <h3 className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest">Editorial Scorecard</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-black text-[#0e4d45]">{p.rating}</span>
                <span className="text-[10px] text-black/50">/ 5.0</span>
              </div>
            </div>
            <div className="space-y-2 sm:space-y-2.5">
              {scores.map((s) => (
                <div key={s.category}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs sm:text-sm text-black">{s.category}</span>
                    <span className="text-xs sm:text-sm font-bold text-black">{s.score.toFixed(1)}</span>
                  </div>
                  <div className="h-1.5 bg-[#e4d9cf] rounded-full overflow-hidden">
                    <div className="h-full bg-[#0e4d45]" style={{ width: `${(s.score / 5) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* At-a-Glance */}
          <div className="bg-[#0e4d45] text-[#fef6f1] rounded p-3 sm:p-4">
            <h3 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest mb-2 sm:mb-3 pb-1.5 border-b border-[#fef6f1]/20">At A Glance</h3>
            <dl className="space-y-1.5 sm:space-y-2 text-xs">
              {quickFacts.map((f) => (
                <div key={f.label} className="flex justify-between gap-2">
                  <dt className="text-[#fef6f1]/60 text-[10px] sm:text-[11px]">{f.label}</dt>
                  <dd className="text-[#fef6f1] font-semibold text-right text-[10px] sm:text-[11px]" dangerouslySetInnerHTML={{ __html: f.value }} />
                </div>
              ))}
            </dl>
            <a href="#" onClick={(e) => e.preventDefault()} className="mt-3 w-full block text-center px-3 py-2 rounded-sm bg-[#fef6f1] hover:bg-white text-[#0e4d45] text-xs font-bold uppercase tracking-wider transition-colors">
              Open Account
            </a>
          </div>
        </div>

        {/* Stats bar */}
        <div className="bg-[#fef6f1] border border-[#e4d9cf] rounded mb-3 grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#e4d9cf]">
          {p.apy && (
            <div className="p-2.5 sm:p-3 text-center">
              <div className="text-[9px] font-bold text-black/40 uppercase tracking-widest mb-0.5">APY</div>
              <div className="text-base sm:text-lg font-black text-[#0e4d45]">{p.apy}</div>
            </div>
          )}
          {p.bonus && (
            <div className="p-2.5 sm:p-3 text-center">
              <div className="text-[9px] font-bold text-black/40 uppercase tracking-widest mb-0.5">Bonus</div>
              <div className="text-base sm:text-lg font-black text-black">{p.bonus}</div>
            </div>
          )}
          <div className="p-2.5 sm:p-3 text-center">
            <div className="text-[9px] font-bold text-black/40 uppercase tracking-widest mb-0.5">Fees</div>
            <div className="text-sm sm:text-base font-bold text-black">{p.fees}</div>
          </div>
          <div className="p-2.5 sm:p-3 text-center">
            <div className="text-[9px] font-bold text-black/40 uppercase tracking-widest mb-0.5">Min</div>
            <div className="text-sm sm:text-base font-bold text-black">{p.minDeposit}</div>
          </div>
        </div>

        <ClarityResearch product={p} />

        {/* Features comparison table */}
        <div className="bg-[#fef6f1] border border-[#e4d9cf] rounded mb-3 overflow-hidden">
          <div className="bg-[#f7ebe2] px-3 sm:px-4 py-2 border-b border-[#e4d9cf]">
            <h3 className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest">Features &amp; Benefits</h3>
          </div>
          <div className="divide-y divide-[#e4d9cf]">
            {[
              { feat: "Annual Percentage Yield (APY)", val: p.apy || "—", pos: true },
              { feat: "Monthly Maintenance Fee", val: p.fees, pos: true },
              { feat: "Minimum Opening Deposit", val: p.minDeposit, pos: true },
              { feat: "Welcome Bonus", val: p.bonus || "None", pos: !!p.bonus },
              { feat: "ATM Reimbursement", val: "Yes, worldwide", pos: true },
              { feat: "Mobile Check Deposit", val: "Included", pos: true },
              { feat: "Early Direct Deposit", val: "Up to 2 days early", pos: true },
              { feat: "FDIC Insurance", val: "Up to $2M", pos: true },
              { feat: "Physical Branches", val: "None", pos: false },
            ].map((row) => (
              <div key={row.feat} className="px-3 sm:px-4 py-2 flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm text-black">{row.feat}</span>
                <span className={`text-xs sm:text-sm font-semibold ${row.pos ? "text-[#0e4d45]" : "text-black/50"}`}>{row.val}</span>
              </div>
            ))}
          </div>
        </div>

        <ResearchBlocks product={p} />
        <StrengthsLimitations pros={p.pros} cons={p.cons} />

        {/* FAQ Section */}
        <div className="bg-[#fef6f1] border border-[#e4d9cf] rounded p-3 sm:p-4 mb-3">
          <h2 className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest border-b border-[#e4d9cf] pb-1.5 mb-2 sm:mb-3">Frequently Asked Questions</h2>
          <div className="space-y-2 sm:space-y-3">
            {[
              { q: `Is ${p.name} FDIC insured?`, a: "Yes. Deposits are FDIC insured up to $2 million through partner banks, well above the standard $250,000 limit." },
              { q: "Are there any monthly fees?", a: `${p.name} charges ${p.fees.toLowerCase()}, with no hidden service charges or minimum balance requirements.` },
              { q: "How fast is account opening?", a: "Most applications complete in under 5 minutes. Initial funding and account access typically take 1-2 business days." },
            ].map((f) => (
              <div key={f.q} className="border-b border-[#e4d9cf] last:border-0 pb-2 sm:pb-3 last:pb-0">
                <div className="text-xs sm:text-sm font-bold text-black mb-1">{f.q}</div>
                <div className="text-xs sm:text-sm text-black/70 leading-relaxed">{f.a}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Highlights */}
        <section className="bg-[#fef6f1] border border-[#e4d9cf] rounded p-3 sm:p-4 mb-3">
          <h2 className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest border-b border-[#e4d9cf] pb-1.5 mb-2">Key Highlights</h2>
          <ul className="space-y-1">
            {p.highlights.map((h) => (
              <li key={h} className="flex items-start gap-1.5 text-xs sm:text-sm">
                <span className="text-[#0e4d45] font-bold mt-0.5">&#9679;</span>
                <span className="text-black">{h}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-[#fef6f1] border border-[#e4d9cf] rounded p-3 sm:p-4 mb-3">
          <h2 className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest border-b border-[#e4d9cf] pb-1.5 mb-2">Who It Is Best For</h2>
          <p className="text-xs sm:text-sm text-black leading-relaxed">
            {p.name} is ideal for <strong>{p.bestFor.toLowerCase()}</strong>. If you value{" "}
            {p.highlights[0]?.toLowerCase()} and want a trusted provider with strong customer reviews, this is a solid choice.
          </p>
        </section>

        {related.length > 0 && (
          <section>
            <h2 className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest border-b border-[#e4d9cf] pb-1.5 mb-2">Compare Similar Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              {related.map((r) => (
                <Link key={r.slug} to="/product/$slug" params={{ slug: r.slug }} className="bg-[#fef6f1] border border-[#e4d9cf] rounded p-2 sm:p-3 hover:border-[#0e4d45] transition-all group">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <ProductLogo p={r} size={28} />
                    <div className="min-w-0">
                      <div className="text-[11px] sm:text-xs font-semibold text-black truncate group-hover:text-[#0e4d45]">{r.name}</div>
                      <StarRating rating={r.rating} size="sm" />
                    </div>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-black/60 leading-snug">{r.tagline}</p>
                  <div className="mt-1.5 text-[9px] sm:text-[10px] font-semibold text-[#0e4d45] uppercase tracking-wider group-hover:underline">View Review →</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-4 text-[9px] sm:text-[10px] text-black/40 leading-snug border-t border-[#e4d9cf] pt-2">
          <strong>Advertiser Disclosure:</strong> We may be compensated when you click on links to partner products.
        </section>
      </div>
    </div>
  );
}

const variations = [Variation1, Variation2, Variation3];

function ShipperDraft() {
  const { v } = Route.useSearch();
  const index = Math.max(0, Math.min(v - 1, variations.length - 1));
  const ActiveVariation = variations[index];
  return <ActiveVariation />;
}
