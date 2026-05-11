import { Fragment, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { products } from "@/data/products";

// Context tracks which product names have already been linked on the page,
// so we don't hyperlink "SoFi" twelve times in a single article.
type LinkContext = { seen: Set<string> };

// Precomputed once: longest-name-first list of [slug, exact-name] pairs so
// "SoFi Checking & Savings" gets preferred over "SoFi".
let cache: { pairs: Array<[string, string]>; regex: RegExp } | null = null;

function getCatalog(): { pairs: Array<[string, string]>; regex: RegExp } {
  if (cache) return cache;
  const pairs: Array<[string, string]> = [];
  for (const p of products) {
    pairs.push([p.slug, p.name]);
  }
  pairs.sort((a, b) => b[1].length - a[1].length);
  const escaped = pairs.map(([, n]) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`\\b(${escaped.join("|")})\\b`, "g");
  cache = { pairs, regex };
  return cache;
}

// Split a text string into React nodes where known product names become
// links. Call once per top-level paragraph; shares a `context` across a
// render pass so the same name is only linked on first mention.
export function linkifyProductNames(
  text: string,
  context: LinkContext,
): React.ReactNode {
  const { pairs, regex } = getCatalog();
  const byName = new Map(pairs.map(([slug, name]) => [name, slug]));

  regex.lastIndex = 0;
  const out: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const name = match[1];
    const slug = byName.get(name);
    if (!slug) continue;

    if (match.index > lastIndex) {
      out.push(text.slice(lastIndex, match.index));
    }

    if (context.seen.has(slug)) {
      out.push(name);
    } else {
      context.seen.add(slug);
      out.push(
        <Link
          key={`${slug}-${match.index}`}
          to="/product/$slug"
          params={{ slug }}
          className="text-[#0e4d45] underline decoration-[#0e4d45]/40 hover:decoration-[#0e4d45] underline-offset-2"
        >
          {name}
        </Link>,
      );
    }
    lastIndex = match.index + name.length;
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
  // A stable ref-equivalent across the article render. We deliberately use
  // useMemo so the `seen` set persists between section renders during a
  // single pass but is fresh on each remount/page navigation.
  return useMemo(() => ({ seen: new Set<string>() }), []);
}
