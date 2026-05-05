import { useEffect, useRef } from "react";

type Options = {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
};

export function useImpression<T extends Element = HTMLElement>(
  onVisible: () => void,
  { threshold = 0.5, rootMargin = "0px", once = true }: Options = {},
) {
  const ref = useRef<T | null>(null);
  const fired = useRef(false);
  const cb = useRef(onVisible);
  cb.current = onVisible;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      cb.current();
      fired.current = true;
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          if (once && fired.current) continue;
          fired.current = true;
          cb.current();
          if (once) io.disconnect();
        }
      },
      { threshold, rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, rootMargin, once]);

  return ref;
}
