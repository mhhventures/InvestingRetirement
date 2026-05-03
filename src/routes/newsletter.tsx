import { createFileRoute, Link } from "@tanstack/react-router";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { useSeo, SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/newsletter")({
  component: NewsletterPage,
});

const PILLARS = [
  {
    label: "Weekly Rate Alerts",
    desc: "The APYs that actually moved — high-yield savings, CDs, money markets, and checking bonuses, with the fine print called out.",
  },
  {
    label: "Investing & Retirement",
    desc: "Roth vs. Traditional moves, 401(k) and IRA strategy, brokerage changes, and what to do about them — in plain English.",
  },
  {
    label: "Hands-On Reviews",
    desc: "New accounts our editors funded, tested, and either liked or didn't. No marketing-page round-ups.",
  },
  {
    label: "Reader Q&A",
    desc: "Real questions answered each Sunday. Send yours by replying to any issue.",
  },
];

const WHAT_YOU_GET = [
  "A curated list of the top rates, bonuses, and account offers updated for the week",
  "One deep-dive guide on a money decision most readers are actually facing",
  "Market and policy notes that affect savers and retirees — no day-trading noise",
  "Links to the week's newly published reviews and updated rankings",
];

function NewsletterPage() {
  useSeo({
    title: "Investing and Retirement Weekly Newsletter",
    description:
      "Free Sunday newsletter covering the week's top APYs, account bonuses, retirement moves, and hands-on reviews. Plain English, no spam, unsubscribe anytime.",
    path: "/newsletter",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Investing and Retirement Weekly",
      url: `${SITE_URL}/newsletter`,
    },
  });

  return (
    <div className="bg-[#fef6f1] min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
        <div className="mb-8">
          <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] text-[#0e4d45] uppercase mb-3">
            The I&amp;R Weekly Newsletter
          </p>
          <h1 className="font-serif text-3xl sm:text-5xl leading-[1.1] text-black mb-4">
            The money newsletter for savers and retirees who want a plain answer.
          </h1>
          <p className="text-base sm:text-lg text-[#1a1a1a] leading-relaxed">
            One email every Thursday. The rates worth moving your money for, the
            retirement decisions worth making this week, and the fine print
            nobody else bothers to read. Written by the same editors who grade
            every account on this site.
          </p>
        </div>

        <NewsletterSignup source="newsletter-page" variant="page" />

        <section className="mt-12">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0e4d45] mb-2">
            What you&apos;ll get each Thursday
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-black mb-4">
            Four things, every week.
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {PILLARS.map((p) => (
              <div
                key={p.label}
                className="bg-white border border-[#e4d9cf] rounded-sm p-4 border-l-[3px] border-l-[#0e4d45]"
              >
                <div className="font-serif text-base font-bold text-black mb-1">
                  {p.label}
                </div>
                <p className="text-[13px] text-[#1a1a1a] leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 bg-white border border-[#e4d9cf] rounded-sm p-5 sm:p-6">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0e4d45] mb-2">
            Inside the Thursday edition
          </div>
          <ul className="space-y-2">
            {WHAT_YOU_GET.map((line) => (
              <li key={line} className="flex gap-3 text-[14px] text-[#1a1a1a] leading-relaxed">
                <span className="text-[#0e4d45] font-bold mt-0.5">&rarr;</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0e4d45] mb-2">
            Who it&apos;s for
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-black mb-3">
            Readers who want the signal, not the pitch.
          </h2>
          <p className="text-[15px] text-[#1a1a1a] leading-relaxed mb-3">
            If you&apos;re trying to squeeze another half-point out of your
            savings, decide between a Roth and a Traditional IRA, figure out
            whether to chase a bank bonus, or simply make sense of the week&apos;s
            financial headlines — this is for you. We write for people who want
            a clear answer and the reasoning behind it, not a 2,000-word detour.
          </p>
          <p className="text-[15px] text-[#1a1a1a] leading-relaxed">
            It is not a hot-stock-tips newsletter. We don&apos;t send day-trading
            alerts, crypto calls, or anything that requires urgency to act on.
            Our bias is toward decisions you can make on a Sunday afternoon and
            forget about for months.
          </p>
        </section>

        <section className="mt-10 border-t border-[#e4d9cf] pt-8">
          <h2 className="font-serif text-xl font-bold text-black mb-3">
            A few promises.
          </h2>
          <div className="space-y-3 text-[14px] text-[#1a1a1a] leading-relaxed">
            <p>
              <strong>Free, always.</strong> No paywall, no premium tier, no
              upsell. If a link in the newsletter is sponsored or affiliate, it
              is labeled &mdash; and it never changes what we recommend. Read
              our <Link to="/disclosure" className="underline text-[#0e4d45]">advertiser disclosure</Link>.
            </p>
            <p>
              <strong>No spam, ever.</strong> One email on Sunday. Occasional
              breaking-rate notes if something truly changes. That&apos;s it.
            </p>
            <p>
              <strong>Double opt-in.</strong> We send a confirmation link to
              your inbox &mdash; you&apos;re not subscribed until you click it.
              Unsubscribe takes one click from any issue.
            </p>
          </div>
        </section>

        <NewsletterSignup source="newsletter-page-footer" variant="page" />

        <p className="text-[11px] text-[#5a5a5a] text-center mt-4">
          Already subscribed? Thank you. Forward any Sunday edition to a friend
          who&apos;d find it useful.
        </p>
      </div>
    </div>
  );
}
