import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: About,
});

const methodology = [
  {
    step: "01",
    title: "Independent Testing",
    description: "We open real accounts at every institution we review. Accounts are funded, trades are run, and customer service is tested firsthand, with no exceptions.",
  },
  {
    step: "02",
    title: "Data Verification",
    description: "Rates, fees, and features are verified directly with institutions and cross-referenced with regulatory filings. Our product database is refreshed regularly.",
  },
  {
    step: "03",
    title: "Transparent Scoring",
    description: "Each product is scored across 30+ criteria including fees, APY, features, security, and user experience. Scoring weights are published and consistent.",
  },
  {
    step: "04",
    title: "Quarterly Re-Review",
    description: "Every review is re-evaluated quarterly, or immediately whenever a product changes its fees, rates, or core features.",
  },
];

const stats = [
  { value: "50+", label: "Products Tested" },
  { value: "100K+", label: "Community Members" },
  { value: "2025", label: "Founded" },
  { value: "30+", label: "Scoring Criteria" },
];

function About() {
  return (
    <div className="bg-[#fef6f1]">
      {/* Masthead */}
      <section className="border-b border-[#e4d9cf] bg-[#fef6f1]">
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
          <div className="max-w-3xl">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0e4d45] mb-3">
              About &middot; Est. 2025
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-bold leading-[1.02] text-black mb-4">
              Financial research you can actually trust.
            </h1>
            <p className="text-base md:text-lg text-[#1a1a1a] leading-relaxed">
              Investing &amp; Retirement is an independent research publication covering bank accounts, brokerages, robo-advisors, and financial apps. We help over 100,000 monthly community members & viewers make smarter money decisions backed by hands-on testing and real industry experience.
            </p>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <div className="border-b border-[#e4d9cf] bg-[#f7ebe2]">
        <div className="max-w-6xl mx-auto px-4 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center md:text-left">
              <div className="font-serif font-bold text-[#0e4d45] text-2xl md:text-3xl leading-none">
                {s.value}
              </div>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-[#1a1a1a] mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main column */}
      <div className="max-w-4xl mx-auto px-4 py-10 md:py-14">
        {/* Mission */}
        <section className="mb-12">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0e4d45] mb-2">
            Mission
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-black mb-4 leading-tight">
            The financial industry is built to confuse. Our job is to make it clear.
          </h2>
          <div className="space-y-4 text-[15px] text-[#1a1a1a] leading-relaxed">
            <p>
              Every year, Americans pay billions in unnecessary fees, miss out on higher yields, and choose financial products that don't fit their needs, largely because comparison information is fragmented, biased, or buried behind marketing copy.
            </p>
            <p>
              We started Investing &amp; Retirement in 2025 to fix that. We open real accounts, test real products, and publish side-by-side comparisons that treat readers like adults.
            </p>
            <p className="font-medium text-black">
              If we wouldn't recommend a product to our own family, it doesn't make our lists.
            </p>
          </div>
        </section>

        {/* Team / experience note */}
        <section className="mb-12">
          <div className="bg-white border border-[#d4c5b8] rounded-sm p-6 md:p-7 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0e4d45] mb-2">
              A Note From The Editor
            </div>
            <h2 className="font-serif text-xl md:text-2xl font-bold text-black mb-4 leading-tight">
              Built by people who've worked inside the industry.
            </h2>
            <div className="space-y-3 text-[14px] text-[#1a1a1a] leading-relaxed">
              <p>
                Our team's experience comes from working at some of the largest, most recognized consumer finance apps in the space: shipping product, building features used by millions, and learning how the fee structures, incentives, and onboarding flows really work behind the scenes.
              </p>
              <p>
                That context is why our reviews go beyond marketing copy. We know which features get buried, which fees get quietly added, and which "rewards" aren't worth the fine print. Every review, rating, and article here is researched, written, and edited in-house. Nothing goes live until we've personally opened the account and used the product.
              </p>
              <p className="text-[13px] text-gray-600 italic">
                Have industry experience and want to contribute? <a href="mailto:Michael@mhhventures.com" className="text-[#0e4d45] font-semibold not-italic underline hover:no-underline">Get in touch</a>.
              </p>
            </div>
          </div>
        </section>

        {/* Methodology */}
        <section className="mb-12">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0e4d45] mb-2">
            Methodology
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-black mb-6 leading-tight">
            How we review products.
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {methodology.map((m) => (
              <div
                key={m.step}
                className="bg-white border border-[#d4c5b8] rounded-sm p-5 shadow-sm relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-0.5 bg-[#0e4d45]" />
                <div className="font-serif text-3xl font-bold text-[#0e4d45]/30 mb-2 leading-none">
                  {m.step}
                </div>
                <h3 className="font-bold text-black text-sm mb-2 uppercase tracking-wide">
                  {m.title}
                </h3>
                <p className="text-[13px] text-gray-700 leading-relaxed">
                  {m.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Independence */}
        <section className="mb-12 bg-white border-l-4 border-[#0e4d45] p-6 md:p-8 rounded-sm shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0e4d45] mb-2">
            Independence &amp; Funding
          </div>
          <h2 className="font-serif text-xl md:text-2xl font-bold text-black mb-4 leading-tight">
            How we make money (and why it doesn't affect our ratings).
          </h2>
          <div className="space-y-3 text-[14px] text-[#1a1a1a] leading-relaxed">
            <p>
              This site earns revenue through affiliate partnerships. When you click through to a partner and open an account, we may receive a commission. This keeps the content free for readers.
            </p>
            <p>
              <span className="font-semibold">Commission rates do not influence our rankings.</span> We score products using the same published methodology regardless of partnership status. Products are ranked on their merits, full stop.
            </p>
            <p>
              We review many products with no affiliate relationship at all. You can read the full{" "}
              <Link to="/disclosure" className="text-[#0e4d45] font-semibold underline hover:no-underline">
                Advertiser Disclosure
              </Link>
              .
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="mb-12">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0e4d45] mb-2">
            Editorial Standards
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-black mb-6 leading-tight">
            What we promise readers.
          </h2>
          <div className="space-y-3">
            {[
              {
                t: "We will never accept payment for a positive review.",
                d: "Ratings are based on methodology, not money. Full stop.",
              },
              {
                t: "We will disclose every material relationship.",
                d: "Affiliate links, partnerships, and any potential conflicts are disclosed clearly on every page.",
              },
              {
                t: "We will correct errors quickly and visibly.",
                d: "Mistakes happen. When they do, we update the article, add a correction note, and timestamp the change.",
              },
              {
                t: "We will keep the data fresh.",
                d: "Rates and fees are verified regularly. Product reviews are re-scored quarterly or whenever a product materially changes.",
              },
            ].map((v, i) => (
              <div
                key={i}
                className="bg-white border border-[#d4c5b8] rounded-sm p-4 flex gap-4"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#f7ebe2] text-[#0e4d45] flex items-center justify-center font-serif font-bold text-sm">
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-black text-sm mb-1">
                    {v.t}
                  </div>
                  <p className="text-[13px] text-gray-700 leading-relaxed">
                    {v.d}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-black text-[#fef6f1] rounded-sm p-6 md:p-8">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#fef6f1]/70 mb-2">
            Start Comparing
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-3 leading-tight">
            Put the research to work.
          </h2>
          <p className="text-[14px] text-[#fef6f1]/80 mb-5 leading-relaxed max-w-xl">
            Side-by-side comparisons, verified rates, and editor-reviewed picks across every major category of financial product.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/bank-accounts"
              className="px-4 py-2 bg-[#0e4d45] text-[#fef6f1] text-[11px] font-semibold rounded-sm hover:bg-[#0a3832] transition-colors uppercase tracking-wider"
            >
              Bank Accounts
            </Link>
            <Link
              to="/investing"
              className="px-4 py-2 bg-[#0e4d45] text-[#fef6f1] text-[11px] font-semibold rounded-sm hover:bg-[#0a3832] transition-colors uppercase tracking-wider"
            >
              Investing Apps
            </Link>
            <Link
              to="/financial-apps"
              className="px-4 py-2 bg-[#0e4d45] text-[#fef6f1] text-[11px] font-semibold rounded-sm hover:bg-[#0a3832] transition-colors uppercase tracking-wider"
            >
              Financial Apps
            </Link>
            <Link
              to="/contact"
              className="px-4 py-2 border border-[#fef6f1]/40 text-[#fef6f1] text-[11px] font-semibold rounded-sm hover:bg-[#fef6f1]/10 transition-colors uppercase tracking-wider"
            >
              Contact
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
