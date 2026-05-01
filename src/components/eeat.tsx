import { Link } from "@tanstack/react-router";
import type { Author } from "@/lib/authors";

export function FtcDisclosure({ variant = "default" }: { variant?: "default" | "compact" }) {
  if (variant === "compact") {
    return (
      <div className="border-y border-[#e4d9cf] bg-[#f7ebe2] px-3 sm:px-4 py-2 text-[10px] sm:text-[11px] text-black/70 leading-snug">
        <strong className="text-black">Advertiser Disclosure:</strong> Some links on this page are from our advertising partners. We may earn a commission when you click or apply, but our editorial ratings and recommendations are independent and not influenced by compensation.{" "}
        <Link to="/disclosure" className="text-[#0e4d45] font-semibold hover:underline">
          Learn more
        </Link>
        .
      </div>
    );
  }
  return (
    <div className="border border-[#0e4d45]/20 bg-[#0e4d45]/5 rounded-sm px-3 sm:px-4 py-2.5 sm:py-3 mb-3 sm:mb-4">
      <div className="flex items-start gap-2">
        <div className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-full bg-[#0e4d45] text-[#fef6f1] flex items-center justify-center text-[9px] font-bold">
          i
        </div>
        <div className="text-[11px] sm:text-xs text-black/80 leading-relaxed">
          <strong className="text-black">Advertiser Disclosure:</strong> Investing and Retirement is an independent, advertising-supported publisher. Some offers on this page are from partners who compensate us, and that compensation may impact how and where offers appear. This never affects our editorial opinions, ratings, or reviews — which are based on our independent research and our editors' own testing.{" "}
          <Link to="/disclosure" className="text-[#0e4d45] font-semibold hover:underline whitespace-nowrap">
            Full disclosure &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

export function AuthorByline({
  author,
  publishedDate,
  updatedDate,
  readTime,
  reviewedBy,
}: {
  author: Author;
  publishedDate?: string;
  updatedDate?: string;
  readTime?: string;
  reviewedBy?: Author;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5 sm:py-3 border-y border-[#e4d9cf] text-[10px] sm:text-[11px]">
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-[11px] font-bold text-[#fef6f1] flex-shrink-0"
          style={{ backgroundColor: author.avatarColor }}
        >
          {author.avatarInitials}
        </div>
        <div className="leading-tight">
          <div className="font-semibold text-black text-[11px] sm:text-xs">
            By{" "}
            <Link
              to="/authors/$authorSlug"
              params={{ authorSlug: author.slug }}
              className="text-[#0e4d45] hover:underline"
            >
              {author.name}
            </Link>
          </div>
          <div className="text-black/50 text-[9px] sm:text-[10px] uppercase tracking-wider">
            {author.title}
          </div>
        </div>
      </div>

      {reviewedBy && reviewedBy.slug !== author.slug && (
        <>
          <span className="hidden sm:block h-4 w-px bg-[#d4c5b8]" />
          <div className="text-[10px] sm:text-[11px] text-black/60">
            Reviewed by{" "}
            <span className="font-semibold text-black">{reviewedBy.name}</span>
          </div>
        </>
      )}

      <div className="flex items-center gap-3 ml-auto text-[9px] sm:text-[10px] text-black/60 uppercase tracking-wider">
        {publishedDate && <span>Published {publishedDate}</span>}
        {updatedDate && (
          <span className="text-[#0e4d45] font-semibold">Updated {updatedDate}</span>
        )}
        {readTime && <span>{readTime} read</span>}
      </div>
    </div>
  );
}

export function EditorialStandardsBadge() {
  return (
    <Link
      to="/about"
      className="inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] text-black/60 hover:text-[#0e4d45] uppercase tracking-wider font-semibold border border-[#d4c5b8] hover:border-[#0e4d45] rounded-sm px-2 py-1 transition-colors"
    >
      <span className="text-[#0e4d45]">&#10003;</span>
      <span>Fact-Checked &middot; Independently Reviewed</span>
    </Link>
  );
}

export function HowWeReview({ category }: { category: "bank" | "investing" | "app" }) {
  const categoryLabel =
    category === "bank" ? "banks" : category === "investing" ? "brokerages" : "financial apps";
  return (
    <section className="bg-white border border-[#e4d9cf] rounded p-3 sm:p-4 mb-3 sm:mb-4">
      <div className="flex items-center justify-between border-b border-[#e4d9cf] pb-1.5 mb-2 sm:mb-3">
        <h2 className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest">
          How We Review {categoryLabel}
        </h2>
        <Link
          to="/about"
          className="text-[9px] sm:text-[10px] font-semibold text-[#0e4d45] hover:underline uppercase tracking-wider"
        >
          Methodology &rarr;
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-[11px] sm:text-xs">
        <div>
          <div className="text-[#0e4d45] font-serif text-lg font-bold leading-none mb-1">1.</div>
          <div className="font-semibold text-black mb-0.5">Hands-On Testing</div>
          <div className="text-black/60 text-[10px] sm:text-[11px] leading-snug">
            Our editors open and use every account they review — not just read the marketing pages.
          </div>
        </div>
        <div>
          <div className="text-[#0e4d45] font-serif text-lg font-bold leading-none mb-1">2.</div>
          <div className="font-semibold text-black mb-0.5">Data-Driven Scoring</div>
          <div className="text-black/60 text-[10px] sm:text-[11px] leading-snug">
            Each product is scored against 30+ criteria including fees, APY, features, and support.
          </div>
        </div>
        <div>
          <div className="text-[#0e4d45] font-serif text-lg font-bold leading-none mb-1">3.</div>
          <div className="font-semibold text-black mb-0.5">Independent of Ads</div>
          <div className="text-black/60 text-[10px] sm:text-[11px] leading-snug">
            Ratings are set by editors. Advertisers never see or influence scores before publication.
          </div>
        </div>
      </div>
    </section>
  );
}
