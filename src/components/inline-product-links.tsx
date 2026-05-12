import { Fragment, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { products, type Product } from "@/data/products";
import { guidesIndex } from "@/lib/guides-index.generated";
import { ProductPreviewModal } from "@/components/product-card";
import { pushEvent } from "@/lib/gtm";

// Context tracks which product names / guide phrases have already been linked
// on the page, so we don't hyperlink "SoFi" or "emergency fund" a dozen times.
type LinkContext = { seen: Set<string> };

type Target =
  | { kind: "product"; slug: string }
  | { kind: "guide"; slug: string };

// Curated phrase map — short, natural phrases that commonly appear in prose
// and should cross-link to a guide article. Each phrase is matched
// case-insensitively as a whole word. Keep this conservative: only phrases
// where the destination guide is unambiguously relevant.
const GUIDE_PHRASES: Array<{ phrase: string; slug: string }> = [
  { phrase: "emergency fund", slug: "emergency-fund" },
  { phrase: "emergency funds", slug: "emergency-fund" },
  { phrase: "50/30/20 rule", slug: "budget-basics-50-30-20" },
  { phrase: "50/30/20 budget", slug: "budget-basics-50-30-20" },
  { phrase: "Roth IRA", slug: "roth-vs-traditional-ira" },
  { phrase: "Traditional IRA", slug: "roth-vs-traditional-ira" },
  { phrase: "high-yield savings account", slug: "how-to-pick-high-yield-savings" },
  { phrase: "high-yield savings accounts", slug: "best-high-yield-savings-accounts-may-2026" },
  { phrase: "HYSA", slug: "hysa-vs-money-market-vs-cds" },
  { phrase: "money market account", slug: "hysa-vs-money-market-vs-cds" },
  { phrase: "money market accounts", slug: "hysa-vs-money-market-vs-cds" },
  { phrase: "certificates of deposit", slug: "hysa-vs-money-market-vs-cds" },
  { phrase: "index funds", slug: "index-funds-vs-etfs-vs-mutual-funds" },
  { phrase: "mutual funds", slug: "index-funds-vs-etfs-vs-mutual-funds" },
  { phrase: "ETFs", slug: "index-funds-vs-etfs-vs-mutual-funds" },
  { phrase: "portfolio diversification", slug: "portfolio-building" },
  { phrase: "asset allocation", slug: "portfolio-building" },
  { phrase: "rebalancing", slug: "portfolio-improvements" },
  { phrase: "retirement investing", slug: "retirement-investing" },
  { phrase: "20x rule", slug: "retirement-investing" },
  { phrase: "equities trading", slug: "equities-trading" },
  { phrase: "covered calls", slug: "options-strategies" },
  { phrase: "iron condors", slug: "options-strategies" },
  { phrase: "budgeting apps", slug: "best-budgeting-apps-2026" },
  { phrase: "cash advance apps", slug: "best-cash-advance-loan-apps-may-2026" },
  { phrase: "stock picking services", slug: "best-stock-picking-services-may-2026" },
  { phrase: "bank bonuses", slug: "best-bank-bonuses-this-month" },
  { phrase: "investing apps", slug: "5-best-investing-apps-may-2026" },
  { phrase: "crypto apps", slug: "6-best-crypto-apps-2026" },
  { phrase: "stock picking", slug: "best-stock-picking-services-may-2026" },
  { phrase: "subscription drain", slug: "stop-subscription-drain" },
  { phrase: "credit score", slug: "improve-credit-90-days" },
  { phrase: "Investing 101", slug: "investing-101" },
  { phrase: "Options 101", slug: "options-101" },
];

// Product names that collide with common English words or first names.
// For these we require the match to use the exact canonical casing so we
// don't hyperlink "current" (the adjective) or "Albert" (a person's name).
const CASE_SENSITIVE_PRODUCT_NAMES = new Set<string>([
  "Current",
  "Albert",
  "Dave",
  "Possible Finance",
  "Gemini",
  "Kraken",
  "Chime Checking",
  "Chime High Yield Savings",
  "Chime MyPay",
  "Acorns",
  "Brigit",
]);

let cache: {
  pairs: Array<{ phrase: string; target: Target }>;
  regex: RegExp;
} | null = null;

function getCatalog() {
  if (cache) return cache;
  const pairs: Array<{ phrase: string; target: Target }> = [];
  for (const p of products) {
    pairs.push({ phrase: p.name, target: { kind: "product", slug: p.slug } });
  }
  const validGuideSlugs = new Set(guidesIndex.map((g) => g.slug));
  for (const g of GUIDE_PHRASES) {
    if (validGuideSlugs.has(g.slug)) {
      pairs.push({ phrase: g.phrase, target: { kind: "guide", slug: g.slug } });
    }
  }
  // Longest phrase first so multi-word matches beat single-word subsets.
  pairs.sort((a, b) => b.phrase.length - a.phrase.length);
  const escaped = pairs.map((p) =>
    p.phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  const regex = new RegExp(`\\b(${escaped.join("|")})\\b`, "gi");
  cache = { pairs, regex };
  return cache;
}

export function linkifyProductNames(
  text: string,
  context: LinkContext,
  opts?: { currentGuideSlug?: string },
): React.ReactNode {
  const { pairs, regex } = getCatalog();
  const currentGuideSlug = opts?.currentGuideSlug;
  // Match map is case-insensitive, keyed on lowercased phrase.
  const byPhrase = new Map(
    pairs.map((p) => [p.phrase.toLowerCase(), p.target]),
  );

  // Map from lowercase phrase to the canonical (original) phrase so we can
  // enforce case-sensitive matching for ambiguous product names.
  const canonicalByLower = new Map<string, string>();
  for (const p of pairs) canonicalByLower.set(p.phrase.toLowerCase(), p.phrase);

  regex.lastIndex = 0;
  const out: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const matchedText = match[1];
    const lower = matchedText.toLowerCase();
    const target = byPhrase.get(lower);
    if (!target) continue;

    const canonical = canonicalByLower.get(lower);
    if (
      canonical &&
      CASE_SENSITIVE_PRODUCT_NAMES.has(canonical) &&
      matchedText !== canonical
    ) {
      // Skip linking: the prose used a different casing (e.g. "current" the
      // adjective vs the Current banking app), so we leave it as plain text.
      continue;
    }

    // Heuristic: skip "Albert" (and similar single-word personal-name brands)
    // when the very next token is another capitalized word, which almost
    // always means it's a proper name like "Albert Einstein", not the app.
    if (
      target.kind === "product" &&
      canonical &&
      /^[A-Z][a-z]+$/.test(canonical) &&
      CASE_SENSITIVE_PRODUCT_NAMES.has(canonical)
    ) {
      const after = text.slice(match.index + matchedText.length);
      if (/^\s+[A-Z][a-z]/.test(after)) {
        continue;
      }
    }

    // Heuristic: skip "Current" when it's being used as an adjective,
    // e.g. "Current 12% / Future 22%", "Current yield", "Current APY".
    // When capitalized at the start of a bullet/sentence the canonical-case
    // guard isn't enough — look at what follows.
    if (target.kind === "product" && canonical === "Current") {
      const after = text.slice(match.index + matchedText.length);
      if (
        /^[\s,:;.]*(\d|[A-Z]{2,}|bracket|tax|yield|rate|APY|year|price|market|income|balance|trend|value|level)/.test(
          after,
        )
      ) {
        continue;
      }
    }

    // Don't link to the guide we're currently on.
    if (
      target.kind === "guide" &&
      currentGuideSlug &&
      target.slug === currentGuideSlug
    ) {
      continue;
    }

    const dedupeKey = `${target.kind}:${target.slug}`;

    if (match.index > lastIndex) {
      out.push(text.slice(lastIndex, match.index));
    }

    if (context.seen.has(dedupeKey)) {
      out.push(matchedText);
    } else {
      context.seen.add(dedupeKey);
      const className =
        "!text-[#0e4d45] font-semibold underline !decoration-[#0e4d45] decoration-2 underline-offset-[3px] hover:!text-[#0a3832]";
      if (target.kind === "product") {
        out.push(
          <ProductInlineLink
            key={`${dedupeKey}-${match.index}`}
            slug={target.slug}
            label={matchedText}
            className={className}
          />,
        );
      } else {
        out.push(
          <Link
            key={`${dedupeKey}-${match.index}`}
            to="/guides/$articleId"
            params={{ articleId: target.slug }}
            className={className}
          >
            {matchedText}
          </Link>,
        );
      }
    }
    lastIndex = match.index + matchedText.length;
  }
  if (lastIndex < text.length) {
    out.push(text.slice(lastIndex));
  }
  if (out.length === 0) return text;
  return (
    <>
      {out.map((node, i) => (
        <Fragment key={i}>{node}</Fragment>
      ))}
    </>
  );
}

export function useLinkContext(): LinkContext {
  return useMemo(() => ({ seen: new Set<string>() }), []);
}

// Inline product mention. Clicking opens a micro-review preview modal
// (same modal used by ProductCard). Keeps the link-like appearance so
// readers still perceive it as a jump-off point to learn more.
function ProductInlineLink({
  slug,
  label,
  className,
}: {
  slug: string;
  label: string;
  className: string;
}) {
  const [open, setOpen] = useState(false);
  const product = useMemo<Product | undefined>(
    () => products.find((p) => p.slug === slug),
    [slug],
  );

  if (!product) {
    return (
      <Link to="/product/$slug" params={{ slug }} className={className}>
        {label}
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
          pushEvent("select_item", {
            item_id: product.slug,
            item_name: product.name,
            item_category: product.category,
            item_list_name: "guide-inline-link",
            placement: "guide-inline-link",
            action: "inline-preview-open",
          });
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`${product.name} quick look`}
        className={`${className} bg-transparent border-0 p-0 m-0 cursor-pointer inline align-baseline`}
      >
        {label}
      </button>
      {open && (
        <ProductPreviewModal
          p={product}
          listName="guide-inline-link"
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
