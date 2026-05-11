import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { pushEvent } from "@/lib/gtm";

type Counts = { up: number; down: number };

export function ReviewFeedback({ productSlug }: { productSlug: string }) {
  const [submitted, setSubmitted] = useState<"up" | "down" | null>(null);
  const [counts, setCounts] = useState<Counts>({ up: 0, down: 0 });
  const [loading, setLoading] = useState(false);
  const storageKey = `review-feedback:${productSlug}`;

  useEffect(() => {
    const prior = typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;
    if (prior === "up" || prior === "down") setSubmitted(prior);
  }, [storageKey]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("review_feedback")
        .select("helpful")
        .eq("product_slug", productSlug);
      if (cancelled || !data) return;
      const up = data.filter((r) => r.helpful).length;
      const down = data.length - up;
      setCounts({ up, down });
    })();
    return () => {
      cancelled = true;
    };
  }, [productSlug]);

  async function vote(helpful: boolean) {
    if (submitted || loading) return;
    setLoading(true);
    const ua = typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 200) : "";
    const { error } = await supabase
      .from("review_feedback")
      .insert({ product_slug: productSlug, helpful, user_agent: ua });
    setLoading(false);
    if (error) return;
    const choice = helpful ? "up" : "down";
    setSubmitted(choice);
    pushEvent("review_feedback", {
      item_id: productSlug,
      content_group: "reviews",
      feedback: choice,
      value: helpful ? 1 : 0,
    });
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
            We use reader input to decide which reviews to update next.
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
            Was this review helpful?
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
