import { Link } from "@tanstack/react-router";
import { US_STATES } from "@/lib/states-data";
import type { Product } from "@/data/products";

// Cross-links a bank product review into the state-level directories we
// actually cover. Boosts internal linking and gives readers a one-tap path
// to a local-alternative search without needing geolocation.
export function LocalAlternatives({ product: p }: { product: Product }) {
  if (p.category !== "bank") return null;

  const available = US_STATES.filter((s) => s.available);
  if (available.length === 0) return null;

  return (
    <section className="bg-white border border-[#e4d9cf] rounded p-3 sm:p-4 mb-3 sm:mb-4">
      <div className="flex items-center justify-between border-b border-[#e4d9cf] pb-1.5 mb-2 sm:mb-3">
        <h2 className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest">
          Local Alternatives
        </h2>
        <Link
          to="/banks"
          className="text-[9px] sm:text-[10px] font-semibold text-[#0e4d45] hover:underline uppercase tracking-wider"
        >
          All States &rarr;
        </Link>
      </div>
      <p className="text-xs text-[#1a1a1a] leading-relaxed mb-2">
        Prefer a local credit union or community bank near you? Compare rates and membership rules
        in our state directories:
      </p>
      <ul className="flex flex-wrap gap-1.5">
        {available.map((s) => (
          <li key={s.code}>
            <Link
              to="/banks/$state"
              params={{ state: s.slug }}
              className="inline-block text-[11px] sm:text-xs px-2 py-1 rounded-sm border border-[#e4d9cf] bg-[#fef6f1] hover:bg-[#0e4d45] hover:text-[#fef6f1] hover:border-[#0e4d45] text-black transition-colors"
            >
              Best Banks in {s.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
