import { Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { Product } from "@/data/products";
import { productPartnerLink } from "@/lib/affiliate";
import { getProductLogoUrl } from "@/lib/product-icons";
import { getDisclosure } from "@/data/disclosures";

// Letter-grade badge. Color-coded by tier:
// A+/A = deep green (top), A- = green, B+/B = charcoal, B- = muted, C+ = deep red.
export function GradeBadge({ grade, size = "sm" }: { grade: string; size?: "sm" | "md" }) {
  const tier = grade.startsWith("A")
    ? "a"
    : grade.startsWith("B")
      ? "b"
      : "c";
  const bg = tier === "a" ? "#0e4d45" : tier === "b" ? "#1a1a1a" : "#540f04";
  const dims =
    size === "md"
      ? "px-2.5 py-1 text-[13px]"
      : "px-2 py-0.5 text-[11px]";
  return (
    <span
      className={`inline-flex items-center rounded-sm font-serif font-bold tracking-tight text-[#fef6f1] ${dims}`}
      style={{ backgroundColor: bg }}
      title={`Editor's Grade: ${grade}`}
      aria-label={`Editor's grade ${grade}`}
    >
      {grade}
    </span>
  );
}

export function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const textClass = size === "md" ? "text-sm" : "text-xs";
  return (
    <span className={`inline-flex items-center gap-1 ${textClass}`}>
      <span className="text-[#c9a882] tracking-tight">
        {"\u2605".repeat(Math.floor(rating))}
        {rating % 1 >= 0.5 ? "\u2605" : ""}
      </span>
      <span className="text-[#5a5a5a] font-medium">{rating.toFixed(1)}</span>
    </span>
  );
}

// Disclosure icon — small (?) button that reveals fine-print in a hover popover.
// Uses a portal + fixed positioning so the popover is never clipped by parent overflow.
export function DisclosureIcon({ text, label }: { text: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  function updateCoords() {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const popWidth = Math.min(320, window.innerWidth - 24);
    let left = rect.left + rect.width / 2 - popWidth / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - popWidth - 12));
    const top = rect.bottom + 6;
    setCoords({ top, left });
  }

  function show() {
    updateCoords();
    setOpen(true);
  }
  function hide() {
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    function onScroll() { updateCoords(); }
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const popWidth = typeof window !== "undefined" ? Math.min(320, window.innerWidth - 24) : 320;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); open ? hide() : show(); }}
        aria-label={label || "View disclosure"}
        aria-expanded={open}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-[#c9a882] text-[#5a5a5a] hover:text-[#0e4d45] hover:border-[#0e4d45] bg-white text-[9px] font-bold leading-none transition-colors cursor-help"
      >
        ?
      </button>
      {open && coords && typeof document !== "undefined" && createPortal(
        <div
          role="tooltip"
          style={{ position: "fixed", top: coords.top, left: coords.left, width: popWidth, zIndex: 9999 }}
          className="bg-white border border-[#d4c5b8] rounded-sm shadow-xl p-3 text-[10px] leading-snug text-[#1a1a1a] pointer-events-none"
        >
          <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#0e4d45] mb-1">
            Disclosure
          </div>
          <p className="font-serif italic">{text}</p>
        </div>,
        document.body
      )}
    </>
  );
}

// Normalize brand logos into a 3-color editorial palette: green, black, deep red.
function brandColor(p: Product): string {
  const palette = ["#0e4d45", "#000000", "#540f04"];
  const key = p.slug || p.name || "";
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return palette[hash % palette.length];
}

// Brand logo: tries real brand icon via Clearbit; falls back to editorial monogram badge
export function ProductLogo({ p, size = 40, priority = false }: { p: Product; size?: number; priority?: boolean }) {
  const size1x = Math.max(64, size * 2);
  const size2x = Math.max(128, size * 4);
  const logoUrl = getProductLogoUrl(p.slug, size1x);
  const logoUrl2x = getProductLogoUrl(p.slug, size2x);
  const [failed, setFailed] = useState(false);

  if (logoUrl && !failed) {
    const srcSet = logoUrl2x && logoUrl2x !== logoUrl ? `${logoUrl} 1x, ${logoUrl2x} 2x` : undefined;
    return (
      <div
        className="flex-shrink-0 rounded-sm overflow-hidden bg-white border border-[#e4d9cf] flex items-center justify-center"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <img
          src={logoUrl}
          srcSet={srcSet}
          sizes={`${size}px`}
          alt={`${p.name} logo — ${p.provider} ${p.subcategory.toLowerCase()}`}
          width={size}
          height={size}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          onError={() => setFailed(true)}
          className="w-full h-full object-contain p-1"
        />
      </div>
    );
  }

  return (
    <div
      className="flex-shrink-0 rounded-sm flex items-center justify-center font-bold text-[#fef6f1]"
      style={{
        backgroundColor: brandColor(p),
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${Math.max(10, size / 4)}px`,
      }}
    >
      {p.logoText}
    </div>
  );
}

export function ProductCard({ p, rank }: { p: Product; rank?: number }) {
  const disclosure = p.disclosure || getDisclosure(p.slug);
  return (
    <div className="bg-white border border-[#d4c5b8] rounded-sm shadow-sm hover:shadow-md hover:border-[#0e4d45] transition-all w-full min-w-0 overflow-hidden box-border" style={{ maxWidth: '100%', contain: 'layout' }}>
      <div className="p-3 sm:p-4">
        {/* Top row: category tag + editor's pick label (mirror Guides card) */}
        <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
          <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] text-[#0e4d45]">
            {p.subcategory}
          </div>
          <div className="flex items-center gap-2">
            {p.editorsPick && (
              <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-[#540f04] whitespace-nowrap">
                Editor&apos;s Pick
              </div>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2 sm:gap-3">
          {rank !== undefined && (
            <div className="flex-shrink-0 w-7 sm:w-8 text-center font-serif font-bold text-[#0e4d45] text-xl sm:text-2xl leading-none pt-0.5">
              {String(rank).padStart(2, "0")}
            </div>
          )}
          <ProductLogo p={p} size={40} />
          <div className="flex-1 min-w-0">
            <h3 className="font-serif font-bold text-black text-sm sm:text-base leading-tight truncate">{p.name}</h3>
            <div className="mt-1 flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <StarRating rating={p.rating} />
              {p.grade && <GradeBadge grade={p.grade} />}
              <span className="text-[9px] sm:text-[10px] text-[#5a5a5a]">({p.reviews.toLocaleString()})</span>
            </div>
          </div>
        </div>

        <p className="mt-2.5 sm:mt-3 text-[11px] sm:text-xs text-[#1a1a1a] leading-snug">{p.tagline}</p>

        <div className="mt-2.5 sm:mt-3 grid grid-cols-2 gap-2 text-[10px] sm:text-[11px] border-t border-[#e4d9cf] pt-2.5">
          {p.apy ? (
            <div>
              <div className="text-[#5a5a5a] uppercase tracking-wider text-[9px] sm:text-[10px] flex items-center gap-1">APY{disclosure && (<DisclosureIcon text={disclosure} label={`${p.name} APY disclosure`} />)}</div>
              <div className="font-serif font-bold text-[#0e4d45] text-sm sm:text-base">{p.apy}</div>
            </div>
          ) : (
            <div>
              <div className="text-[#5a5a5a] uppercase tracking-wider text-[9px] sm:text-[10px] flex items-center gap-1">Fees{disclosure && (<DisclosureIcon text={disclosure} label={`${p.name} disclosure`} />)}</div>
              <div className="font-serif font-bold text-black text-sm sm:text-base">{p.fees}</div>
            </div>
          )}
          {p.bonus ? (
            <div>
              <div className="text-[#5a5a5a] uppercase tracking-wider text-[9px] sm:text-[10px]">Bonus</div>
              <div className="font-serif font-bold text-black text-sm sm:text-base">{p.bonus}</div>
            </div>
          ) : (
            <div>
              <div className="text-[#5a5a5a] uppercase tracking-wider text-[9px] sm:text-[10px]">Min</div>
              <div className="font-serif font-bold text-black text-sm sm:text-base">{p.minDeposit}</div>
            </div>
          )}
        </div>

        {/* CTAs: mirror Guides card — primary filled green, secondary outlined */}
        <div className="mt-2.5 sm:mt-3 grid grid-cols-2 gap-1.5">
          <Link
            to="/product/$slug"
            params={{ slug: p.slug }}
            className="text-center px-2 py-1.5 sm:py-2 rounded-sm bg-[#0e4d45] text-[#fef6f1] text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider hover:bg-[#0a3832] transition-colors"
          >
            Read Review
          </Link>
          <a
            href={productPartnerLink(p.slug, p.url, { placement: "product-card", campaign: p.category === "bank" ? "bank-accounts" : p.category === "investing" ? "investing" : "financial-apps" })}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="text-center px-2 py-1.5 sm:py-2 rounded-sm bg-white border border-[#d4c5b8] text-black text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider hover:border-[#0e4d45] hover:text-[#0e4d45] transition-colors"
          >
            Visit Site
          </a>
        </div>
      </div>
    </div>
  );
}
