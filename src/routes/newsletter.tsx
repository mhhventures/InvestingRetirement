import { createFileRoute } from "@tanstack/react-router";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { useSeo, SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/newsletter")({
  component: NewsletterPage,
});

function NewsletterPage() {
  useSeo({
    title: "Investing and Retirement Weekly Newsletter",
    description:
      "Join the free weekly newsletter for rate alerts, account reviews, and plain-English money guides. Double opt-in. Unsubscribe anytime.",
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
      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
        <div className="text-center mb-8">
          <p className="text-[11px] font-semibold tracking-widest text-[#0e4d45] uppercase mb-3">
            Newsletter
          </p>
          <h1 className="text-3xl sm:text-5xl font-serif text-black mb-4">
            Investing and Retirement Weekly
          </h1>
          <p className="text-base sm:text-lg text-black/70 leading-relaxed">
            Get our best money insights, account reviews, and rate alerts delivered to your inbox every Sunday.
          </p>
        </div>

        <NewsletterSignup source="newsletter-page" variant="page" />

        <div className="grid sm:grid-cols-3 gap-4 mt-10">
          {[
            { title: "Weekly Picks", desc: "Top accounts and apps we're tracking." },
            { title: "Rate Alerts", desc: "APY changes and new bonuses as they happen." },
            { title: "Reader Q&A", desc: "Real questions answered each week." },
          ].map((item) => (
            <div key={item.title} className="bg-white border border-[#e4d9cf] rounded-lg p-5">
              <h3 className="font-serif text-lg text-black mb-1">{item.title}</h3>
              <p className="text-sm text-black/70 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
