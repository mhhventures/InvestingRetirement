import { Link } from "@tanstack/react-router";
import { guides } from "@/lib/guides-data";
import type { Product } from "@/data/products";

/**
 * Cross-links product reviews to relevant guides.
 * Boosts internal linking and helps readers go deeper on topics related to the product.
 */
export function RelatedGuidesForProduct({ product }: { product: Product }) {
  // Match guides by topic overlap with product category/subcategory.
  const sub = product.subcategory.toLowerCase();
  const cat = product.category;

  const related = guides
    .filter((g) => {
      const gc = g.category.toLowerCase();
      const gt = g.title.toLowerCase();
      const gd = (g.description ?? "").toLowerCase();
      const hay = `${gc} ${gt} ${gd}`;

      if (cat === "bank") {
        return (
          hay.includes("savings") ||
          hay.includes("checking") ||
          hay.includes("cd") ||
          hay.includes("bank") ||
          hay.includes("apy")
        );
      }
      if (cat === "investing") {
        return (
          hay.includes("invest") ||
          hay.includes("broker") ||
          hay.includes("ira") ||
          hay.includes("roth") ||
          hay.includes("retirement") ||
          hay.includes("etf") ||
          hay.includes("stock")
        );
      }
      // apps
      return (
        hay.includes("budget") ||
        hay.includes("credit") ||
        hay.includes("cash") ||
        hay.includes("debt") ||
        hay.includes("app")
      );
    })
    // Prioritize matches that contain a subcategory keyword
    .sort((a, b) => {
      const ax = (a.title + " " + a.description).toLowerCase().includes(sub) ? 1 : 0;
      const bx = (b.title + " " + b.description).toLowerCase().includes(sub) ? 1 : 0;
      return bx - ax;
    })
    .slice(0, 3);

  if (related.length === 0) return null;

  return (
    <section className="bg-white border border-[#e4d9cf] rounded p-3 sm:p-4 mb-3 sm:mb-4">
      <div className="flex items-center justify-between border-b border-[#e4d9cf] pb-1.5 mb-2 sm:mb-3">
        <h2 className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest">
          Learn More
        </h2>
        <Link
          to="/guides"
          className="text-[9px] sm:text-[10px] font-semibold text-[#0e4d45] hover:underline uppercase tracking-wider"
        >
          All Guides &rarr;
        </Link>
      </div>
      <ul className="space-y-1.5">
        {related.map((g) => (
          <li key={g.slug}>
            <Link
              to="/guides/$articleId"
              params={{ articleId: g.slug }}
              className="group flex items-start justify-between gap-3 py-1.5 border-b border-[#e4d9cf] last:border-b-0"
            >
              <div className="min-w-0 flex-1">
                <div className="text-[10px] text-[#0e4d45] font-bold uppercase tracking-wider mb-0.5">
                  {g.category}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-black group-hover:text-[#0e4d45] leading-snug">
                  {g.title}
                </div>
              </div>
              <div className="flex-shrink-0 text-[9px] sm:text-[10px] text-black/50 uppercase tracking-wider whitespace-nowrap pt-1">
                {g.readTime}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
