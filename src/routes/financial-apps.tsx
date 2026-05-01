import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { getByCategory } from "@/data/products";
import { ProductCard } from "@/components/product-card";
import { CategoryPage } from "@/components/category-page";

export const Route = createFileRoute("/financial-apps")({
  component: FinancialApps,
});

function FinancialApps() {
  const all = getByCategory("app");
  const [filter, setFilter] = useState<string>("All");
  const subs = ["All", ...Array.from(new Set(all.map((p) => p.subcategory)))];
  const filtered = filter === "All" ? all : all.filter((p) => p.subcategory === filter);

  return (
    <CategoryPage
      eyebrow="Financial Apps"
      title="Best Financial Apps"
      subtitle="Budgeting tools, cash advance apps, and credit score trackers to take control of your money."
      stats={[
        { label: "Apps reviewed", value: "24" },
        { label: "Free options", value: "14" },
        { label: "Avg. rating", value: "4.5" },
      ]}
    >
      <div className="flex flex-wrap gap-1.5 mb-4">
        {subs.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-2.5 py-1 rounded-sm text-[11px] font-semibold uppercase tracking-wider transition-colors ${
              filter === s
                ? "bg-[#0e4d45] text-[#fef6f1]"
                : "bg-[#fef6f1] border border-[#e4d9cf] text-black hover:border-[#0e4d45] hover:text-[#0e4d45]"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {filtered.map((p, i) => (
          <ProductCard key={p.slug} p={p} rank={i + 1} />
        ))}
      </div>
    </CategoryPage>
  );
}
