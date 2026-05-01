import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/newsletter")({
  component: NewsletterPage,
});

function NewsletterPage() {
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
            Get our best money insights, account reviews, and financial guides delivered to your inbox every week.
          </p>
        </div>

        <div className="bg-white border border-[#e4d9cf] rounded-lg p-6 sm:p-10 shadow-sm">
          <a
            href="https://investingretirement.substack.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-[#0e4d45] hover:bg-[#0a3832] text-[#fef6f1] font-semibold uppercase tracking-wide text-sm py-3 rounded-sm transition-colors"
          >
            Subscribe on Substack
          </a>
          <p className="text-xs text-black/60 text-center mt-4">
            Free. Unsubscribe anytime.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mt-10">
          {[
            { title: "Weekly Picks", desc: "Top accounts and apps we're tracking." },
            { title: "Market Notes", desc: "Plain-English takes on what matters." },
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
