import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { products } from "@/data/products";
import { ProductCard } from "@/components/product-card";
import { CategoryPage } from "@/components/category-page";
import { RelatedGuidesForCategory } from "@/components/related-guides";
import { useSeo, SITE_URL, buildItemListSchema } from "@/lib/seo";

export const Route = createFileRoute("/reviews")({
  component: Reviews,
});

function Reviews() {
  useSeo({
    title: "All Financial Product Reviews 2026",
    description:
      "Complete reviews of every bank account, brokerage, and money app we cover. Ratings based on fees, features, and hands-on testing.",
    path: "/reviews",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "All Product Reviews",
        url: `${SITE_URL}/reviews`,
        description: "Complete directory of every financial product we review.",
      },
      buildItemListSchema({
        name: "All Product Reviews",
        url: `${SITE_URL}/reviews`,
        items: products.slice(0, 50).map((p) => ({
          name: p.name,
          url: `${SITE_URL}/product/${p.slug}`,
          description: p.tagline,
        })),
      }),
    ],
  });
  const [filter, setFilter] = useState<string>("All");
  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];
  const categoryLabels: Record<string, string> = {
    All: "All Products",
    bank: "Bank Accounts",
    investing: "Investing",
    app: "Financial Apps",
  };

  const filtered =
    filter === "All" ? products : products.filter((p) => p.category === filter);

  return (
    <CategoryPage
      eyebrow="Reviews"
      title="All Product Reviews"
      subtitle="Complete reviews of all financial products and apps we cover, updated daily."
      stats={[
        { label: "Products reviewed", value: `${products.length}` },
        { label: "Updated daily", value: "2026" },
        { label: "Expert rating", value: "4.6★" },
      ]}
    >
      <p className="mb-5 text-sm text-[#1a1a1a] leading-relaxed">
        Every financial product our editors have tested — bank accounts, brokerages, robo-advisors, crypto exchanges, and money apps. Filter by category below, or scroll for how we rank.
      </p>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-2.5 py-1 rounded-sm text-[11px] font-semibold uppercase tracking-wider transition-colors ${
              filter === cat
                ? "bg-[#0e4d45] text-[#fef6f1]"
                : "bg-[#fef6f1] border border-[#e4d9cf] text-black hover:border-[#0e4d45] hover:text-[#0e4d45]"
            }`}
          >
            {categoryLabels[cat] || cat}
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {filtered.map((p, i) => (
          <ProductCard key={p.slug} p={p} rank={i + 1} />
        ))}
      </div>
      {filter !== "All" && (
        <div className="mt-6">
          <RelatedGuidesForCategory
            categoryPath={
              filter === "bank"
                ? "/bank-accounts"
                : filter === "investing"
                  ? "/investing"
                  : "/financial-apps"
            }
          />
        </div>
      )}

      <section className="mt-12 space-y-5 text-sm text-[#1a1a1a] leading-relaxed">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0e4d45] mb-1">Editorial Process</div>
          <h2 className="font-serif text-2xl font-bold text-black mb-2">How this page is built</h2>
          <p>
            This directory lists every product our editors have reviewed. Each listing links to a full hands-on review with the current APY or fee schedule, our editorial grade, the specific saver or investor the product is best suited for, and the closest alternatives to consider. Inside each category, products are ranked by a weighted rubric — APY, fees, platform quality, asset selection, customer service, and trust and safety — with the exact weights published on each review.
          </p>
        </div>
        <div>
          <h3 className="font-serif text-lg font-bold text-black mb-1.5">How to use this page</h3>
          <p>
            Use the filter pills above to narrow by product type. Choose <strong>Bank Accounts</strong> for high-yield savings, checking, money markets, and CDs. Choose <strong>Investing</strong> for brokerages, robo-advisors, and retirement platforms. Choose <strong>Financial Apps</strong> for budgeting tools, credit monitors, and cash-advance services. Each card shows our grade, headline rate, and a one-line summary so you can scan quickly before diving into a full review.
          </p>
        </div>
        <div>
          <h3 className="font-serif text-lg font-bold text-black mb-1.5">Update cadence</h3>
          <p>
            Rates and promotional offers change often. APYs and bonuses are re-verified weekly, fee schedules monthly, and full reviews at least twice a year — or immediately whenever a product meaningfully changes. Every review is stamped with the date of its most recent check. If you spot a number that looks stale, the <a href="/contact" className="underline text-[#0e4d45]">contact form</a> goes straight to an editor.
          </p>
        </div>
        <div>
          <h3 className="font-serif text-lg font-bold text-black mb-1.5">How to read a review on this site</h3>
          <p>
            Each product review opens with the headline number — APY for a bank account, expense ratio or commission structure for an investing app, monthly fee for a budgeting tool — and a one-paragraph editor&rsquo;s verdict that names the specific saver, investor, or borrower the product is best suited for. Below that, we publish the full fee schedule, minimums, bonus and promotional terms, account types supported, and any notable restrictions. The &ldquo;highlights&rdquo; list collects what the product genuinely does better than its peers, while &ldquo;things to know&rdquo; names the drawbacks an honest review has to disclose. We close every piece with a list of close alternatives and a short FAQ covering the questions readers ask us most often.
          </p>
        </div>
        <div>
          <h3 className="font-serif text-lg font-bold text-black mb-1.5">Editorial independence</h3>
          <p>
            Some reviews on this site include affiliate links, meaning we may earn a commission if you open an account through them. Partners do not see reviews before publication, cannot pay for a higher rating, and cannot pay to be added to a ranking. When a product gets worse — a rate is cut, a fee is added, a promotion is quietly removed — the review is updated to reflect it, even if the product is a paying partner. See our <a href="/disclosure" className="underline text-[#0e4d45]">advertiser disclosure</a> for the complete list of partners and our <a href="/about" className="underline text-[#0e4d45]">about page</a> for the editorial standards every review must meet before it goes live.
          </p>
        </div>
        <div>
          <h3 className="font-serif text-lg font-bold text-black mb-1.5">Who writes these reviews</h3>
          <p>
            Our team is made up of personal-finance editors with backgrounds in banking, investment research, and consumer journalism. Every review is written by a named author, fact-checked by a second editor, and signed off by the category lead before it publishes. When we cite a rate, fee, or policy, the source is either the provider&rsquo;s own disclosure, a regulatory filing, or a test account we funded ourselves. If you have a question about how a specific ranking was reached, the byline on each review links straight to the author&rsquo;s bio and contact information.
          </p>
        </div>
      </section>
    </CategoryPage>
  );
}
