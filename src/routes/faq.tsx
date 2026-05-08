import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

const FAQS = [
  {
    category: "About the Site",
    items: [
      {
        q: "What is Investing and Retirement?",
        a: "Investing and Retirement is an independent financial research and comparison publication. I review and compare bank accounts, investing apps, crypto exchanges, and personal finance tools to help readers make informed decisions about where to put their money. Every review is based on hands-on testing, verified data, and transparent scoring criteria, not marketing copy.",
      },
      {
        q: "Who runs Investing and Retirement?",
        a: "Currently, Investing and Retirement is a solo editorial operation run out of Investing and Retirement Media LLC. As the publication grows, additional writers and analysts will be added to the About page. If you're an experienced finance writer interested in contributing, reach out through the Contact page.",
      },
      {
        q: "When was Investing and Retirement founded?",
        a: "Investing and Retirement Media LLC was founded in 2025 to give readers clear, honest, and actionable financial product research, free from the noise and bias that dominates much of the personal finance space.",
      },
      {
        q: "What makes Investing and Retirement different from other comparison sites?",
        a: "Three things: (1) I actually open accounts and test the products I review, rather than summarizing press releases. (2) Partnership status with a brand has no effect on rankings. A partner product can and has been ranked below a non-partner. (3) Every piece of content is written and edited by a human, not AI-generated from scraped data.",
      },
    ],
  },
  {
    category: "How I Make Money",
    items: [
      {
        q: "How does Investing and Retirement make money?",
        a: "Investing and Retirement earns revenue through affiliate partnerships. When a reader clicks certain links on the site and opens an account, makes a deposit, or signs up for a service, the partner company may pay a referral fee. This is a standard model used across financial publishing (NerdWallet, Bankrate, Investopedia) and is how the site stays free for readers.",
      },
      {
        q: "Is Investing and Retirement free to use?",
        a: "Yes, completely free. Readers never pay to access any review, comparison, guide, or tool on this site. Revenue comes from affiliate partners, not readers.",
      },
      {
        q: "Does getting paid by partners affect your reviews?",
        a: "No. Editorial rankings are determined by a fixed scoring methodology applied before any partnership consideration. Affiliate rates don't change where a product lands on a list. You'll find partners ranked below non-partners throughout the site. That's by design. For the full policy, see the Disclosure page.",
      },
    ],
  },
  {
    category: "Editorial Process",
    items: [
      {
        q: "How does Investing and Retirement ensure unbiased reviews?",
        a: "Every product is scored against the same 30+ criteria before any commercial conversation happens. Reviews are based on account-level testing, fee-schedule verification, and published data from the institutions themselves, not from the partners' marketing teams. When facts change, reviews are updated and the change is logged at the top of the article.",
      },
      {
        q: "How often are comparisons and reviews updated?",
        a: "Rate-sensitive products (savings accounts, CDs, etc.) are reviewed at least monthly. Product features, fee structures, and rankings are reviewed quarterly at minimum. Any material change (a fee increase, a feature launch, a regulatory action) triggers an immediate update.",
      },
      {
        q: "What types of financial products do you compare?",
        a: "The site covers: bank accounts (checking, savings, CDs), investing apps and brokerages, crypto exchanges, budgeting and personal finance apps, and retirement-focused products (IRAs, robo-advisors). New categories are added as demand and expertise allow.",
      },
      {
        q: "Can I trust the information on Investing and Retirement?",
        a: "Every fact on the site is sourced from either the financial institution's official disclosures, regulatory filings, or direct account testing. If something turns out to be wrong, a correction is published openly, not silently edited. That's a core editorial standard, not a courtesy.",
      },
    ],
  },
  {
    category: "Using the Site",
    items: [
      {
        q: "How do I choose the right financial product for me?",
        a: "Start with the category guide (Bank Accounts, Investing, Financial Apps) that matches your need. Each guide explains what to look for, what to avoid, and how to match a product to your situation. The comparison tables then let you filter by the features that matter to you: fees, minimums, rates, platform, etc.",
      },
      {
        q: "Do you offer financial advice?",
        a: "No. Investing and Retirement is a publisher, not a financial advisor, broker, or registered investment advisor. The content is for informational and educational purposes only. For personalized advice about your specific situation, consult a licensed financial advisor, tax professional, or attorney.",
      },
      {
        q: "Is Investing and Retirement available outside the U.S.?",
        a: "The site is published from the United States and the products covered are primarily available to U.S. residents. International readers are welcome, but eligibility, rates, fees, and regulations vary significantly by country. Verify everything with the provider directly before opening an account abroad.",
      },
      {
        q: "How do I report an error or outdated information?",
        a: "Send a note to Partners@mhhventures.com with the URL and the issue. Corrections are typically published within 48 hours, and material corrections are flagged visibly at the top of the affected article.",
      },
    ],
  },
  {
    category: "Privacy & Data",
    items: [
      {
        q: "Does Investing and Retirement share my personal information?",
        a: "No. Personal information is never sold or rented. The site uses standard analytics (page views, session data) and affiliate tracking to measure performance, but that data is not shared with advertisers or third parties for marketing purposes. Full details are on the Privacy Policy page.",
      },
      {
        q: "Do I need to create an account to read articles?",
        a: "No account required. Every article, review, and comparison is open access. The only optional sign-up is the free newsletter, which you can unsubscribe from at any time.",
      },
      {
        q: "How do I unsubscribe from the newsletter?",
        a: "Click the unsubscribe link at the bottom of any newsletter email. You can also email Partners@mhhventures.com to be removed manually. Unsubscribe requests are processed within 24 hours.",
      },
    ],
  },
  {
    category: "Partnerships & Contact",
    items: [
      {
        q: "How do I pitch a product for review or partnership?",
        a: "Send a short pitch to Partners@mhhventures.com with the product name, category, and a link to your product page. Products are reviewed on editorial merit; a partnership conversation only happens after the product qualifies editorially, if at all.",
      },
      {
        q: "I'm a writer or analyst: can I contribute?",
        a: "The team is growing. If you have published financial writing, analyst experience, or deep expertise in a covered category (banking, investing, crypto, personal finance), send your background and writing samples to Partners@mhhventures.com.",
      },
      {
        q: "What's the best way to contact you?",
        a: "Email Partners@mhhventures.com for anything: reader questions, corrections, partnership inquiries, or writer applications. The Contact page has additional details and a form if you prefer.",
      },
    ],
  },
];

function FaqItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-[#e4d9cf]">
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-4 py-4 sm:py-5 text-left group"
      >
        <span className="text-[15px] sm:text-[16px] md:text-[17px] font-semibold text-black group-hover:text-[#0e4d45] transition-colors leading-snug pr-2">
          {q}
        </span>
        <span
          className={`text-[#0e4d45] text-lg shrink-0 transition-transform duration-200 mt-0.5 ${isOpen ? "rotate-45" : ""}`}
          aria-hidden="true"
        >
          +
        </span>
      </button>
      <div
        className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr] opacity-100 pb-5" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <p className="text-[13px] sm:text-[14px] leading-relaxed text-black/75 max-w-3xl">{a}</p>
        </div>
      </div>
    </div>
  );
}

function FaqPage() {
  const [openId, setOpenId] = useState<string | null>("About the Site-0");

  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <div className="bg-[#fef6f1]">
      {/* Masthead */}
      <section className="max-w-4xl mx-auto px-3 sm:px-4 pt-8 sm:pt-12 md:pt-16 pb-6 sm:pb-8 md:pb-10">
        <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0e4d45] mb-3 sm:mb-4">
          Frequently Asked Questions
        </div>
        <h1
          className="text-[32px] sm:text-[44px] md:text-[56px] lg:text-[64px] leading-[1.04] font-normal text-black mb-4 sm:mb-5"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        >
          Questions, answered plainly.
        </h1>
        <p className="text-[14px] sm:text-[15px] md:text-[16px] leading-relaxed text-black/70 max-w-2xl">
          Quick answers about who runs this site, how it makes money, how reviews are scored, and
          how to get in touch. If you have a question that isn&#39;t covered here, email{" "}
          <a
            href="mailto:Partners@mhhventures.com"
            className="text-[#0e4d45] font-semibold underline-offset-2 hover:underline"
          >
            Partners@mhhventures.com
          </a>
          .
        </p>
      </section>

      {/* Quick jump */}
      <section className="max-w-4xl mx-auto px-3 sm:px-4 pb-4 sm:pb-6">
        <div className="bg-white border border-[#e4d9cf] p-4 sm:p-5">
          <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-black/50 mb-2 sm:mb-3">
            Jump to a section
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {FAQS.map((section) => (
              <a
                key={section.category}
                href={`#${section.category.replace(/\s+/g, "-").toLowerCase()}`}
                className="text-[12px] sm:text-[13px] font-semibold text-[#0e4d45] hover:underline underline-offset-2"
              >
                {section.category}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="max-w-4xl mx-auto px-3 sm:px-4 pb-10 sm:pb-14">
        {FAQS.map((section) => (
          <div
            key={section.category}
            id={section.category.replace(/\s+/g, "-").toLowerCase()}
            className="mb-8 sm:mb-12 scroll-mt-20"
          >
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <div className="h-px flex-1 bg-[#0e4d45]/20" />
              <h2
                className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.2em] text-[#0e4d45] px-2"
              >
                {section.category}
              </h2>
              <div className="h-px flex-1 bg-[#0e4d45]/20" />
            </div>
            <div className="bg-white border border-[#e4d9cf] px-4 sm:px-6">
              {section.items.map((item, idx) => {
                const id = `${section.category}-${idx}`;
                return (
                  <FaqItem
                    key={id}
                    q={item.q}
                    a={item.a}
                    isOpen={openId === id}
                    onToggle={() => toggle(id)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {/* Still have questions */}
      <section className="max-w-4xl mx-auto px-3 sm:px-4 pb-12 sm:pb-16">
        <div className="bg-black text-[#fef6f1] p-6 sm:p-8 md:p-10">
          <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-[#fef6f1]/60 mb-3">
            Still have questions?
          </div>
          <h3
            className="text-[22px] sm:text-[28px] md:text-[32px] leading-tight font-normal mb-3 sm:mb-4"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            Send a note. I read every email.
          </h3>
          <p className="text-[13px] sm:text-[14px] leading-relaxed text-[#fef6f1]/75 max-w-2xl mb-5 sm:mb-6">
            Whether it&#39;s a question about a review, a correction, a partnership pitch, or a note
            from a reader who&#39;s trying to figure out the right account for their situation, it
            all comes to the same inbox.
          </p>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <a
              href="mailto:Partners@mhhventures.com"
              className="inline-flex items-center text-[11px] sm:text-[12px] font-semibold bg-[#fef6f1] text-black px-4 py-2.5 hover:bg-white transition-colors tracking-wide uppercase"
            >
              Email Partners@mhhventures.com
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center text-[11px] sm:text-[12px] font-semibold border border-[#fef6f1]/30 text-[#fef6f1] px-4 py-2.5 hover:bg-[#fef6f1]/10 transition-colors tracking-wide uppercase"
            >
              Contact Page
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center text-[11px] sm:text-[12px] font-semibold border border-[#fef6f1]/30 text-[#fef6f1] px-4 py-2.5 hover:bg-[#fef6f1]/10 transition-colors tracking-wide uppercase"
            >
              About
            </Link>
            <Link
              to="/disclosure"
              className="inline-flex items-center text-[11px] sm:text-[12px] font-semibold border border-[#fef6f1]/30 text-[#fef6f1] px-4 py-2.5 hover:bg-[#fef6f1]/10 transition-colors tracking-wide uppercase"
            >
              Disclosure
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export const Route = createFileRoute("/faq")({ component: FaqPage });
