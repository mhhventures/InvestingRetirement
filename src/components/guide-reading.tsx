import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    function onScroll() {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      const p = total > 0 ? (h.scrollTop / total) * 100 : 0;
      setProgress(p);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-40 h-[3px] bg-transparent pointer-events-none"
    >
      <div
        className="h-full bg-[#0e4d45] transition-[width] duration-75"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export function TableOfContents({
  headings,
}: {
  headings: { id: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const els = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => !!el);
    if (els.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="bg-white border border-[#e4d9cf] rounded mb-3"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 text-left"
      >
        <span className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest">
          In This Article
        </span>
        <span
          className="text-[#0e4d45] text-[11px] font-semibold uppercase tracking-wider"
          aria-hidden="true"
        >
          {open ? "Hide" : "Show"}
        </span>
      </button>
      {open && (
        <ol className="border-t border-[#e4d9cf] divide-y divide-[#e4d9cf]">
          {headings.map((h, i) => (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                onClick={() => setOpen(false)}
                className={`flex items-start gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm leading-snug transition-colors ${
                  active === h.id
                    ? "bg-[#0e4d45]/5 text-[#0e4d45] font-semibold"
                    : "text-black hover:bg-[#fef6f1]"
                }`}
              >
                <span className="text-[10px] font-bold text-black/40 tabular-nums pt-0.5 w-5 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0">{h.label}</span>
              </a>
            </li>
          ))}
        </ol>
      )}
    </nav>
  );
}

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 600);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!visible) return null;
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className="fixed bottom-5 right-4 z-40 w-10 h-10 rounded-full bg-[#0e4d45] text-[#fef6f1] shadow-lg hover:bg-[#0a3832] transition-colors flex items-center justify-center"
    >
      <span aria-hidden="true" className="text-base leading-none">&uarr;</span>
    </button>
  );
}

type Counts = { up: number; down: number };

export function GuideFeedback({ guideSlug }: { guideSlug: string }) {
  const [submitted, setSubmitted] = useState<"up" | "down" | null>(null);
  const [counts, setCounts] = useState<Counts>({ up: 0, down: 0 });
  const [loading, setLoading] = useState(false);
  const storageKey = `guide-feedback:${guideSlug}`;

  useEffect(() => {
    const prior = typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;
    if (prior === "up" || prior === "down") setSubmitted(prior);
  }, [storageKey]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("guide_feedback")
        .select("helpful")
        .eq("guide_slug", guideSlug);
      if (cancelled || !data) return;
      const up = data.filter((r) => r.helpful).length;
      const down = data.length - up;
      setCounts({ up, down });
    })();
    return () => {
      cancelled = true;
    };
  }, [guideSlug]);

  async function vote(helpful: boolean) {
    if (submitted || loading) return;
    setLoading(true);
    const ua = typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 200) : "";
    const { error } = await supabase
      .from("guide_feedback")
      .insert({ guide_slug: guideSlug, helpful, user_agent: ua });
    setLoading(false);
    if (error) return;
    const choice = helpful ? "up" : "down";
    setSubmitted(choice);
    setCounts((c) => ({
      up: c.up + (helpful ? 1 : 0),
      down: c.down + (helpful ? 0 : 1),
    }));
    try {
      localStorage.setItem(storageKey, choice);
    } catch {
      /* ignore */
    }
  }

  const total = counts.up + counts.down;
  const pct = total > 0 ? Math.round((counts.up / total) * 100) : null;

  return (
    <section className="bg-white border border-[#e4d9cf] rounded p-4 sm:p-5 mb-3 text-center">
      {submitted ? (
        <div>
          <div className="text-[10px] sm:text-[11px] font-bold text-[#0e4d45] uppercase tracking-widest mb-1">
            Thanks for the feedback
          </div>
          <p className="text-xs sm:text-sm text-black/70">
            We use reader input to decide which guides to update next.
          </p>
          {pct !== null && (
            <p className="text-[11px] text-black/50 mt-2">
              {pct}% of {total.toLocaleString()} readers found this helpful.
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest mb-2">
            Was this guide helpful?
          </div>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => vote(true)}
              disabled={loading}
              className="px-4 py-2 rounded-sm border border-[#0e4d45] text-[#0e4d45] text-xs font-semibold uppercase tracking-wide hover:bg-[#0e4d45] hover:text-[#fef6f1] transition-colors disabled:opacity-50"
            >
              Yes, helpful
            </button>
            <button
              type="button"
              onClick={() => vote(false)}
              disabled={loading}
              className="px-4 py-2 rounded-sm border border-[#d4c5b8] text-black text-xs font-semibold uppercase tracking-wide hover:border-[#540f04] hover:text-[#540f04] transition-colors disabled:opacity-50"
            >
              Not really
            </button>
          </div>
          {total > 0 && pct !== null && (
            <p className="text-[11px] text-black/50 mt-3">
              {pct}% of {total.toLocaleString()} readers found this helpful.
            </p>
          )}
        </>
      )}
    </section>
  );
}
