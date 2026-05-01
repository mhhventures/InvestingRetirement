import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/disclosure")({
  component: Disclosure,
});

function Disclosure() {
  return (
    <div className="bg-[#fef6f1]">
      {/* Masthead */}
      <div className="border-b border-[#e4d9cf] bg-[#fef6f1]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-[#0e4d45] mb-3">
            Transparency &amp; Trust
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-black leading-[1.05] tracking-tight mb-4">
            Affiliate Disclosure
          </h1>
          <p className="text-[13px] sm:text-[15px] text-gray-700 leading-relaxed max-w-2xl">
            How Investing and Retirement Media LLC makes money, how that affects what you read, and the commitments we make to every reader who visits this site.
          </p>
          <div className="mt-5 text-[11px] uppercase tracking-widest text-gray-500">
            Last Updated: January 2026
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Summary callout */}
        <div className="bg-white border-l-4 border-[#0e4d45] p-5 sm:p-6 mb-10 shadow-sm">
          <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.18em] text-[#0e4d45] mb-2">
            The Short Version
          </div>
          <p className="text-[13px] sm:text-[15px] text-black leading-relaxed">
            Investing and Retirement Media LLC is a reader-supported publication. We earn affiliate commissions when you open accounts or sign up for products through links on our site. This support keeps our research free to readers and has <span className="font-semibold">no bearing on our editorial reviews, ratings, or rankings</span>.
          </p>
        </div>

        <div className="space-y-10 text-[13px] sm:text-[14px] text-gray-800 leading-relaxed">
          {/* Who we are */}
          <section>
            <h2 className="font-serif text-2xl font-bold text-black mb-3">Who We Are</h2>
            <p>
              Investing &amp; Retirement is operated by <span className="font-semibold">Investing and Retirement Media LLC</span>, an independent publisher of personal finance research, product reviews, and educational content. We are not a broker, bank, registered investment advisor, or financial planner. Nothing on this site constitutes financial, legal, or tax advice.
            </p>
            <p className="mt-3">
              Our mission is simple: help readers make better-informed financial decisions by testing products ourselves, verifying every fee and feature, and explaining the trade-offs in plain English.
            </p>
          </section>

          {/* How we make money */}
          <section>
            <h2 className="font-serif text-2xl font-bold text-black mb-3">How We Make Money</h2>
            <p>Partners we currently have affiliate relationships will be listed on the site in relevant placements, while not influencing any editorial rankings. 
                                  </p>
            <p className="mt-3">
              <span className="font-semibold">You pay nothing extra.</span> Affiliate compensation is paid by the partner company, not by you. In most cases, pricing and bonus offers are identical whether you click through our site or go directly to the partner.
            </p>
            <p className="mt-3">
              Partners we currently have affiliate relationships can be listed at times, across various locations on the site. This will change at times, while it does not influence any editorial rankings.
            </p>
          </section>

          {/* Editorial independence */}
          <section>
            <h2 className="font-serif text-2xl font-bold text-black mb-3">Editorial Independence</h2>
            <p>
              Editorial content on this site is produced independently of our advertising partners. Our reviews, ratings, rankings, &ldquo;best of&rdquo; lists, and recommendations are determined solely by our editorial judgment and are based on objective criteria including:
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-1.5">
              <li>Fees, pricing, and total cost of ownership</li>
              <li>Product features and available account types</li>
              <li>Security, regulation, and insurance protections</li>
              <li>Customer support quality and response times</li>
              <li>Mobile and web platform usability</li>
              <li>Promotional offers relative to industry benchmarks</li>
              <li>Real user feedback and long-term track record</li>
            </ul>
            <p className="mt-4">
              <span className="font-semibold">We do not accept payment for positive reviews.</span> A company cannot pay to be ranked higher, to be included in a &ldquo;best of&rdquo; list, or to have negative information removed. We review products from companies we have no affiliate relationship with, and we have excluded affiliate partners from lists when we believed a competing product better served the reader.
            </p>
          </section>

          {/* Compensation disclosures */}
          <section>
            <h2 className="font-serif text-2xl font-bold text-black mb-3">What Affects Compensation</h2>
            <p>
              Commission rates vary from partner to partner and can range from a few dollars per signup to several hundred dollars per funded account. These rates are negotiated between Investing and Retirement Media LLC and each partner company. Higher commissions do not translate to higher rankings or more favorable coverage.
            </p>
            <p className="mt-3">
              The order in which products appear on list pages is determined by editorial ranking, category relevance, and occasionally by whether a product is currently accepting new customers. It is <span className="font-semibold">not determined by commission rate</span>.
            </p>
          </section>

          {/* Product data accuracy */}
          <section>
            <h2 className="font-serif text-2xl font-bold text-black mb-3">Product Data &amp; Accuracy</h2>
            <p>
              We make reasonable efforts to verify all product data — APYs, fees, promotional offers, minimum deposits, and features — from official sources including partner disclosures, regulatory filings, and product documentation. Rates and offers change frequently, and while we refresh our data on a regular schedule, we cannot guarantee that every figure on the site is accurate at the exact moment you read it.
            </p>
            <p className="mt-3">
              <span className="font-semibold">Always confirm rates, fees, and terms directly with the product provider before opening an account or making a financial decision.</span> If you find a discrepancy, please email us at <span className="font-mono text-[12px]">Partners@mhhventures.com</span> and we will investigate and correct it.
            </p>
          </section>

          {/* Not advice */}
          <section>
            <h2 className="font-serif text-2xl font-bold text-black mb-3">This Is Not Financial Advice</h2>
            <p>
              Content on this site is provided for informational and educational purposes only. We are not your financial advisor, broker, or fiduciary. The products we review may not be appropriate for your personal situation, risk tolerance, or tax circumstances.
            </p>
            <p className="mt-3">
              Before making any financial decision — opening a brokerage account, buying a security, moving retirement funds, or signing up for a credit product — consult with a licensed financial professional who understands your full situation.
            </p>
          </section>

          {/* FTC compliance */}
          <section>
            <h2 className="font-serif text-2xl font-bold text-black mb-3">FTC Compliance</h2>
            <p>
              This disclosure is provided in accordance with the Federal Trade Commission&apos;s 16 CFR Part 255: &ldquo;Guides Concerning the Use of Endorsements and Testimonials in Advertising.&rdquo; By publishing this disclosure, we aim to fully and clearly communicate our relationship with the companies whose products we review.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="font-serif text-2xl font-bold text-black mb-3">Contact Us</h2>
            <p>
              If you have questions about this disclosure, a specific product review, or a correction request, please reach out:
            </p>
            <div className="mt-4 bg-white border border-[#e4d9cf] p-5">
              <div className="text-[11px] uppercase tracking-widest text-gray-500 mb-2">Publisher</div>
              <div className="font-semibold text-black mb-1">Investing and Retirement Media LLC</div>
              <div className="text-[13px] text-gray-700">
                Email: <span className="font-mono text-[12px]">Partners@mhhventures.com</span>
              </div>
            </div>
          </section>

          {/* Footer nav */}
          <section className="pt-6 border-t border-[#e4d9cf]">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-[12px]">
              <Link to="/privacy" className="text-[#0e4d45] font-semibold hover:underline uppercase tracking-wide">
                Privacy Policy
              </Link>
              <Link to="/about" className="text-[#0e4d45] font-semibold hover:underline uppercase tracking-wide">
                About Us
              </Link>
              <Link to="/contact" className="text-[#0e4d45] font-semibold hover:underline uppercase tracking-wide">
                Contact
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
