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
      <div className="prose-sm max-w-none mb-5 space-y-3 text-sm text-[#1a1a1a] leading-relaxed">
        <p>
          This page lists every financial product our editors have reviewed — high-yield savings accounts, checking accounts, online brokerages, robo-advisors, crypto exchanges, prediction markets, and money apps. Each listing links to a full hands-on review with the current APY or fee schedule, our editorial grade, the specific saver or investor the product is best suited for, and the closest alternatives to consider.
        </p>
        <p>
          Filter the grid by category to narrow the view. Want bank-account detail? Pick <strong>Bank Accounts</strong>. Looking for investing coverage? Pick <strong>Investing</strong>. Need a budgeting app, credit monitor, or cash-advance tool? Pick <strong>Financial Apps</strong>. Inside each category, products are ranked by our weighted rubric — APY, fees, platform quality, asset selection, customer service, and trust and safety — with the weights published on each individual review page.
        </p>
        <p>
          Rates and promotional offers change often. We re-verify APYs and bonuses on a rolling weekly schedule, fee schedules monthly, and full reviews at least twice a year. Every review shows the date of the most recent check near the top. If you spot a number that looks stale, the <a href="/contact" className="underline text-[#0e4d45]">contact form</a> goes straight to an editor.
        </p>
      </div>
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
    </CategoryPage>
  );
}
