import { createFileRoute } from "@tanstack/react-router";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { useSeo, SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/newsletter")({
  component: NewsletterPage,
});

const BLOCKS = [
  {
    n: "01",
    label: "Opening Insight",
    title: "Reddit Question Spotlight",
    desc: "Each issue leads with a real question pulled from r/InvestingForBeginners, r/Trading, or r/SavingMoney — the kind of question thousands of readers are quietly Googling that week — answered in 150-200 words by the research desk.",
  },
  {
    n: "02",
    label: "Market Snapshot",
    title: "The numbers that actually moved",
    desc: "A bulleted read on the week's APY changes, yield-curve shifts, CD specials, and retirement-account benchmarks. Data first, commentary second. No day-trading noise.",
  },
  {
    n: "03",
    label: "Tool & App Spotlight",
    title: "Finance apps worth your attention",
    desc: "A weekly discovery of the finance apps, brokerages, and bank accounts the desk believes are worth using to build wealth faster — surfaced in a side-by-side table with fees, minimums, and the one or two details that usually get buried.",
  },
  {
    n: "04",
    label: "Headlines",
    title: "What to know in five bullets",
    desc: "The week in saving, investing, and retirement policy compressed into 75-100 words. Fed moves, tax updates, product launches, and industry shifts — filtered for signal.",
  },
  {
    n: "05",
    label: "Community",
    title: "Join the conversation",
    desc: "Every issue closes with a direct callout to the week's featured subreddit — a specific thread, prompt, or question the desk wants reader input on. The newsletter and the communities feed each other.",
  },
];

const AUDIENCE = [
  {
    label: "Investing Beginners",
    desc: "Readers aged 25-45 building their first portfolios. Want plain answers on Roth vs. Traditional, index vs. active, and how much is enough.",
  },
  {
    label: "Active Traders",
    desc: "Self-directed investors managing their own positions. Want data, risk-management thinking, and honest takes on tools — not hot tips.",
  },
  {
    label: "Savers & Budgeters",
    desc: "Readers focused on emergency funds, HYSAs, CDs, and cash flow. Want the top APYs without wading through sponsored round-ups.",
  },
];

const PROMISES: { head: string; body: React.ReactNode }[] = [
  {
    head: "Factual and research-oriented.",
    body: "Every claim is traceable to a primary source — a bank's rate sheet, an issuer's disclosure, a federal agency, or a study we can link to. If we can't cite it, we don't print it.",
  },
  {
    head: "Educational, never advisory.",
    body: "Nothing we publish — including any stock, fund, or product we discuss — is personalized financial advice, a solicitation, or a guarantee of results. We share research, frameworks, and trade-offs so you can make informed decisions. Past performance is not indicative of future returns.",
  },
  {
    head: "Built around the value of the read.",
    body: "Every issue is written to be worth the two minutes it takes. If a block isn't useful that week, we cut it. Readers stay because the content earns it — not because we buried the unsubscribe link.",
  },
  {
    head: "Double opt-in, unsubscribe in one click.",
    body: "You confirm by email before the first issue ever sends. One click from any issue removes you from the list permanently.",
  },
];

function NewsletterPage() {
  useSeo({
    title: "The I&R Newsletter — Investing & Retirement Research Desk",
    description:
      "A free Thursday newsletter from the Investing & Retirement Research Desk. Reddit community questions answered, weekly market data, tool comparisons, and headlines for savers, traders, and retirement-account holders.",
    path: "/newsletter",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "The I&R Newsletter",
      url: `${SITE_URL}/newsletter`,
    },
  });

  return (
    <div className="bg-[#fef6f1] min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
        <div className="mb-8">
          <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] text-[#0e4d45] uppercase mb-3">
            The I&amp;R Newsletter &middot; Every Thursday
          </p>
          <h1 className="font-serif text-3xl sm:text-5xl leading-[1.1] text-black mb-4">
            Where the best finance conversations on Reddit meet the work of a research desk.
          </h1>
          <p className="text-base sm:text-lg text-[#1a1a1a] leading-relaxed">
            One email every Thursday from the Investing &amp; Retirement
            Research Desk. We pull the week&apos;s most useful question from
            our three communities &mdash; r/InvestingForBeginners, r/Trading,
            and r/SavingMoney &mdash; answer it with primary-source data, then
            hand you the market numbers, tool comparisons, and headlines that
            actually affect your money. Factual, bulleted, scannable. No stock
            tips, no hype.
          </p>
        </div>

        <NewsletterSignup source="newsletter-page" variant="page" />

        <section className="mt-12">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0e4d45] mb-2">
            Inside every Thursday edition
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-black mb-5">
            Five blocks. Same structure, every week.
          </h2>
          <div className="space-y-3">
            {BLOCKS.map((b) => (
              <div
                key={b.n}
                className="bg-white border border-[#e4d9cf] border-l-[3px] border-l-[#0e4d45] rounded-sm p-4 sm:p-5 flex gap-4"
              >
                <div className="font-serif text-2xl sm:text-3xl font-bold text-[#0e4d45] leading-none shrink-0 w-10">
                  {b.n}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0e4d45] mb-1">
                    {b.label}
                  </div>
                  <div className="font-serif text-lg font-bold text-black mb-1 leading-tight">
                    {b.title}
                  </div>
                  <p className="text-[13px] text-[#1a1a1a] leading-relaxed">
                    {b.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 bg-white border border-[#e4d9cf] rounded-sm p-5 sm:p-6">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0e4d45] mb-2">
            Who writes it
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-black mb-3">
            The Investing &amp; Retirement Research Desk.
          </h2>
          <p className="text-[14px] sm:text-[15px] text-[#1a1a1a] leading-relaxed mb-3">
            The I&amp;R Research Desk is the editorial team behind this site
            and the three investing communities owned by our parent company,
            MHH Ventures. We grade the accounts, test the apps, and read the
            Fed releases so you don&apos;t have to. Most issues are signed by
            the desk collectively; roughly every sixth is a personal note from
            our founder, Michael Hewitt.
          </p>
          <p className="text-[14px] sm:text-[15px] text-[#1a1a1a] leading-relaxed">
            The style is modeled on research publications &mdash; bulleted,
            sourced, and scannable &mdash; not the breathless commentary you
            see elsewhere in finance media. If you can find the answer in a
            two-minute read, we consider that a success.
          </p>
        </section>

        <section className="mt-12">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0e4d45] mb-2">
            Who it&apos;s for
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-black mb-5">
            Three kinds of reader.
          </h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {AUDIENCE.map((a) => (
              <div
                key={a.label}
                className="bg-white border border-[#e4d9cf] rounded-sm p-4 border-t-[3px] border-t-[#0e4d45]"
              >
                <div className="font-serif text-base font-bold text-black mb-1.5">
                  {a.label}
                </div>
                <p className="text-[12.5px] text-[#1a1a1a] leading-relaxed">
                  {a.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 border-t border-[#e4d9cf] pt-8">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0e4d45] mb-2">
            House rules
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-black mb-5">
            What we promise, and what we won&apos;t do.
          </h2>
          <div className="space-y-4">
            {PROMISES.map((p) => (
              <div key={p.head} className="border-l-[3px] border-[#0e4d45] pl-4">
                <div className="font-serif text-base font-bold text-black mb-1">
                  {p.head}
                </div>
                <p className="text-[13.5px] text-[#1a1a1a] leading-relaxed">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 bg-[#0e4d45] text-[#fef6f1] rounded-sm p-6 sm:p-8">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#fef6f1]/80 mb-2">
            The ecosystem
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-3">
            A newsletter, three communities, one research desk.
          </h2>
          <p className="text-[14px] sm:text-[15px] leading-relaxed mb-4 text-[#fef6f1]/90">
            The I&amp;R Newsletter is the Thursday voice of a larger
            ecosystem: our investing site and three active subreddit
            communities where the questions, debates, and real experiences
            happen. Every issue pulls from those communities and sends
            readers back to them.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 text-[13px]">
            <div className="bg-[#fef6f1]/10 rounded-sm p-3">
              <div className="font-serif font-bold mb-0.5">r/InvestingForBeginners</div>
              <div className="text-[#fef6f1]/70 text-[12px]">First portfolios, IRAs, index basics.</div>
            </div>
            <div className="bg-[#fef6f1]/10 rounded-sm p-3">
              <div className="font-serif font-bold mb-0.5">r/Trading</div>
              <div className="text-[#fef6f1]/70 text-[12px]">Risk, psychology, and real post-mortems.</div>
            </div>
            <div className="bg-[#fef6f1]/10 rounded-sm p-3">
              <div className="font-serif font-bold mb-0.5">r/SavingMoney</div>
              <div className="text-[#fef6f1]/70 text-[12px]">HYSAs, budgets, bills, and bonuses.</div>
            </div>
          </div>
        </section>

        <div className="mt-12">
          <NewsletterSignup source="newsletter-page-footer" variant="page" />
        </div>

        <p className="text-[11px] text-[#5a5a5a] text-center mt-4">
          Already subscribed? Thank you. Forward any Thursday edition to a
          friend who&apos;d find it useful.
        </p>
      </div>
    </div>
  );
}
