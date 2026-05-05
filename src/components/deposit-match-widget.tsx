import { useEffect, useRef, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { trackEvent } from "@/lib/pixel";

const WIDGET_SCRIPT = "https://caporax.com/embed-v2.js";
const WIDGET_ORIGIN = "https://caporax.com";
const SUPABASE_ORIGIN = "https://emegglrwulofcvoicwtk.supabase.co";
const PUBLISHER_ID = "77899ae6-2905-46ca-b77a-723839257134";

function logEvent(event: string, opts: {
  placement: string;
  pagePath: string;
  subId: string;
  payload?: Record<string, unknown>;
}) {
  if (!isSupabaseConfigured) return;
  void supabase.from("widget_events").insert({
    widget: "depositmatch-v2",
    event,
    page_path: opts.pagePath,
    placement: opts.placement,
    sub_id: opts.subId,
    referrer: typeof document !== "undefined" ? document.referrer : "",
    user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    payload: opts.payload ?? {},
  });
}

function ensureHeadLinks() {
  if (typeof document === "undefined") return;
  const existing = document.head.querySelector<HTMLLinkElement>(
    `link[rel="preconnect"][href="${SUPABASE_ORIGIN}"]`,
  );
  if (!existing) {
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = SUPABASE_ORIGIN;
    link.crossOrigin = "";
    document.head.appendChild(link);
  }
  const existingCap = document.head.querySelector<HTMLLinkElement>(
    `link[rel="preconnect"][href="${WIDGET_ORIGIN}"]`,
  );
  if (!existingCap) {
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = WIDGET_ORIGIN;
    document.head.appendChild(link);
  }
}

function loadScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (document.querySelector(`script[src="${WIDGET_SCRIPT}"]`)) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = WIDGET_SCRIPT;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load DepositMatch widget"));
    document.head.appendChild(s);
  });
}

export function DepositMatchWidget({
  subId,
  placement,
  pagePath,
}: {
  subId: string;
  placement: string;
  pagePath: string;
}) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    "idle",
  );

  useEffect(() => {
    let cancelled = false;
    ensureHeadLinks();
    setStatus("loading");
    logEvent("mount", { placement, pagePath, subId });

    loadScript()
      .then(() => {
        if (cancelled) return;
        setStatus("ready");
        logEvent("impression", { placement, pagePath, subId });
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
        logEvent("error", { placement, pagePath, subId });
      });

    const onMessage = (ev: MessageEvent) => {
      if (ev.origin !== WIDGET_ORIGIN) return;
      const data = ev.data as unknown;
      if (!data || typeof data !== "object") return;
      const type = (data as { type?: unknown }).type;
      if (typeof type !== "string") return;
      if (
        type.startsWith("depositmatch:") ||
        type.startsWith("caporax:") ||
        type === "widget:click" ||
        type === "widget:lead"
      ) {
        const isLead = type.includes("lead");
        logEvent(isLead ? "lead" : "click", {
          placement,
          pagePath,
          subId,
          payload: data as Record<string, unknown>,
        });
        if (isLead) {
          trackEvent("Lead", {
            content_name: "deposit-match",
            content_category: "banks",
            placement,
          });
        }
      }
    };
    window.addEventListener("message", onMessage);

    return () => {
      cancelled = true;
      window.removeEventListener("message", onMessage);
    };
  }, [subId, placement, pagePath]);

  return (
    <div className="w-full">
      {status === "loading" && (
        <div
          className="flex items-center justify-center text-[11px] text-[#5a5a5a]"
          style={{ minHeight: "clamp(420px, 70vw, 560px)" }}
          aria-live="polite"
        >
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border-2 border-[#0e4d45] border-t-transparent animate-spin" />
            Loading offers…
          </span>
        </div>
      )}
      {status === "error" && (
        <div className="text-[12px] text-[#7a1f1f] bg-[#fbe9e7] border border-[#f0b8b0] rounded px-3 py-3 leading-relaxed">
          The offer widget failed to load. Please disable ad blockers and
          refresh the page, or browse our{" "}
          <a href="/bank-accounts" className="underline font-semibold">
            bank accounts hub
          </a>{" "}
          directly.
        </div>
      )}
      <div
        ref={mountRef}
        id="depositmatch-widget-v2"
        data-publisher={PUBLISHER_ID}
        data-sub-id={subId}
        className="w-full mx-auto [&_iframe]:w-full [&_iframe]:max-w-full [&_iframe]:block"
        style={{
          display: status === "ready" ? "block" : "none",
          maxWidth: "100%",
        }}
      />
    </div>
  );
}
