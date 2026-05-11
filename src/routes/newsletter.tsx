import { createFileRoute } from "@tanstack/react-router";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { useSeo, SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/newsletter")({
  component: NewsletterPage,
});

const EDITIONS = [
  {
    day: "Tuesday",
    sub: "r/Trading",
    title: "The Trading Edition",
    desc: "Risk frameworks, post-mortems from the week's tape, and honest takes on tools the self-directed crowd actually uses. Pulled from the questions and debates driving r/Trading that week.",
  },
  {
    day: "Wednesday",
    sub: "r/SavingMoney",
    title: "The Saving Edition",
    desc: "The week's APY movers, CD specials, checking bonuses, and budget thinking, sourced from bank rate sheets and the real-world questions on r/SavingMoney.",
  },
  {
    day: "Thursday",
    sub: "r/InvestingForBeginners",
    title: "The Investing Edition",
    desc: "Plain-English answers on Roth vs. Traditional, index vs. active, and how to think about your first portfolio. Driven by the questions newer investors are asking on r/InvestingForBeginners.",
  },
];

const BLOCKS = [
  {
    n: "01",
    label: "Opening Insight",
    title: "Reddit Question Spotlight",
    desc: "Each edition leads with a real question pulled from that day's featured community (the kind thousands of readers are quietly Googling that week), answered in 150 to 200 words by the research desk.",
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
    desc: "A discovery of the finance apps, brokerages, and bank accounts the desk believes are worth using to build wealth faster, surfaced in a side-by-side table with fees, minimums, and the one or two details that usually get buried.",
  },
  {
    n: "04",
    label: "Headlines",
    title: "What to know in five bullets",
    desc: "The week in saving, investing, and retirement policy compressed into 75 to 100 words. Fed moves, tax updates, product launches, and industry shifts, all filtered for signal.",
  },
  {
    n: "05",
    label: "Community",
    title: "Join the conversation",
    desc: "Every edition closes with a direct callout to that day's featured subreddit: a specific thread, prompt, or question the desk wants reader input on. The newsletter and the communities feed each other.",
  },
];

const AUDIENCE = [
  {
    label: "Investing Beginners",
    desc: "Readers aged 25-45 building their first portfolios. Want plain answers on Roth vs. Traditional, index vs. active, and how much is enough.",
  },
  {
    label: "Active Traders",
    desc: "Self-directed investors managing their own positions. Want data, risk-management thinking, and honest takes on tools, not hot tips.",
  },
  {
    label: "Savers & Budgeters",
    desc: "Readers focused on emergency funds, HYSAs, CDs, and cash flow. Want the top APYs without wading through sponsored round-ups.",
  },
];

const PROMISES: { head: string; body: React.ReactNode }[] = [
  {
    head: "Factual and research-oriented.",
    body: "Every claim is traceable to a primary source: a bank's rate sheet, an issuer's disclosure, a federal agency, or a study we can link to. If we can't cite it, we don't print it.",
  },
  {
    head: "Educational, never advisory.",
    body: "Nothing we publish, including any stock, fund, or product we discuss, is personalized financial advice, a solicitation, or a guarantee of results. We share research, frameworks, and trade-offs so you can make informed decisions. Past performance is not indicative of future returns.",
  },
  {
    head: "Built around the value of the read.",
    body: "Every edition is written to be worth the two minutes it takes. If a block isn't useful that week, we cut it. Readers stay because the content earns it, not because we buried the unsubscribe link.",
  },
  {
    head: "Double opt-in, unsubscribe in one click.",
    body: "You confirm by email before the first edition ever sends. One click from any issue removes you from the list permanently.",
  },
];

function NewsletterPage() {
  useSeo({
    title: "The I&R Market Brief: Three Editions a Week from Reddit's Best Finance Conversations",
    description:
      "A free newsletter from the Investing & Retirement Research Desk. Tuesdays for r/Trading, Wednesdays for r/SavingMoney, Thursdays for r/InvestingForBeginners. Community questions answered, weekly market data, tool comparisons, and headlines.",
    path: "/newsletter",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "The I&R Market Brief",
      url: `${SITE_URL}/newsletter`,
    },
  });

  return (
    <div className="bg-[#fef6f1] min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
        <div className="mb-8">
          <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] text-[#0e4d45] uppercase mb-3">
            The I&amp;R Market Brief &middot; Tuesday, Wednesday, Thursday
          </p>
          <h1 className="font-serif text-3xl sm:text-5xl leading-[1.1] text-black mb-4">
            Where the best finance conversations on Reddit meet the work of a research desk.
          </h1>
          <p className="text-base sm:text-lg text-[#1a1a1a] leading-relaxed">
            Three editions a week from the Investing &amp; Retirement Research
            Desk. Tuesdays we cover r/Trading, Wednesdays r/SavingMoney, and
            Thursdays r/InvestingForBeginners. Each edition pulls the week&apos;s
            most useful question from its community, answers it with
            primary-source data, then hands you the market numbers, tool
            comparisons, and headlines that actually affect your money.
            Factual, bulleted, scannable. No stock tips, no hype.
          </p>
        </div>

        <NewsletterSignup source="newsletter-page" variant="page" />

        <section className="mt-12">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0e4d45] mb-2">
            Three editions, three communities
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-black mb-5">
            A day of the week for each kind of reader.
          </h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {EDITIONS.map((e) => (
              <div
                key={e.day}
                className="bg-white border border-[#e4d9cf] border-t-[3px] border-t-[#0e4d45] rounded-sm p-4 sm:p-5"
              >
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0e4d45] mb-1">
                  {e.day}
                </div>
                <div className="font-serif text-lg font-bold text-black leading-tight mb-1">
                  {e.title}
                </div>
                <div className="text-[12px] font-semibold text-[#1a1a1a] mb-2">
                  Featuring {e.sub}
                </div>
                <p className="text-[13px] text-[#1a1a1a] leading-relaxed">
                  {e.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0e4d45] mb-2">
            Inside every edition
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-black mb-5">
            Five blocks. Same structure, every edition.
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
            Fed releases so you don&apos;t have to. Most editions are signed
            by the desk collectively; roughly every sixth is a personal note
            from our founder, Michael Hewitt.
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
            Three kinds of reader. One for each edition.
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
            Three editions, three communities, one research desk.
          </h2>
          <p className="text-[14px] sm:text-[15px] leading-relaxed mb-4 text-[#fef6f1]/90">
            The I&amp;R Market Brief is the mid-week voice of a larger
            ecosystem: our investing site and three active subreddit
            communities where the questions, debates, and real experiences
            happen. Each edition pulls from its community and sends readers
            back to it.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 text-[13px]">
            <div className="bg-[#fef6f1]/10 rounded-sm p-3">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#fef6f1]/70 mb-1">
                Tuesday
              </div>
              <div className="font-serif font-bold mb-0.5">r/Trading</div>
              <div className="text-[#fef6f1]/70 text-[12px]">Risk, psychology, and real post-mortems.</div>
            </div>
            <div className="bg-[#fef6f1]/10 rounded-sm p-3">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#fef6f1]/70 mb-1">
                Wednesday
              </div>
              <div className="font-serif font-bold mb-0.5">r/SavingMoney</div>
              <div className="text-[#fef6f1]/70 text-[12px]">HYSAs, budgets, bills, and bonuses.</div>
            </div>
            <div className="bg-[#fef6f1]/10 rounded-sm p-3">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#fef6f1]/70 mb-1">
                Thursday
              </div>
              <div className="font-serif font-bold mb-0.5">r/InvestingForBeginners</div>
              <div className="text-[#fef6f1]/70 text-[12px]">First portfolios, IRAs, index basics.</div>
            </div>
          </div>
        </section>

        <div className="mt-12">
          <NewsletterSignup source="newsletter-page-footer" variant="page" />
        </div>

        <p className="text-[11px] text-[#3f3f3f] text-center mt-4">
          Already subscribed? Thank you. Forward any edition to a friend
          who&apos;d find it useful.
        </p>
      </div>
    </div>
  );
}
