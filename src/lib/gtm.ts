// Google Tag Manager / GA4 dataLayer helper + first-party Supabase mirror.
//
// All site events route through `pushEvent(name, params)`. The push:
//   1. Appends to `window.dataLayer` so GTM + GA4 pick it up.
//   2. If the event name is in `PERSISTED_EVENTS`, queues it for the
//      `analytics-ingest` edge function so we keep first-party data.
//
// Events follow GA4 recommended naming where a match exists
// (`view_item`, `select_item`, `generate_lead`, `site_search`, `share`).

export type GtmEventName =
  | "page_view"
  | "click_outbound"
  | "site_search"
  | "view_item"
  | "view_item_list"
  | "select_item"
  | "select_promotion"
  | "generate_lead"
  | "calculator_start"
  | "calculator_complete"
  | "calculator_cta_click"
  | "deposit_match_submit"
  | "deposit_match_result_view"
  | "guide_read_milestone"
  | "guide_feedback"
  | "faq_expand"
  | "state_selector_change"
  | "rate_table_sort"
  | "bestfor_tab_click"
  | "related_click"
  | "newsletter_signup_attempt"
  | "newsletter_signup_success"
  | "newsletter_signup_error"
  | "share";

export type GtmParams = {
  content_group?: string;
  partner?: string;
  offer?: string;
  item_id?: string;
  item_name?: string;
  item_category?: string;
  item_list_name?: string;
  placement?: string;
  campaign?: string;
  term?: string;
  value?: number;
  currency?: string;
  page_path?: string;
  page_title?: string;
  referrer?: string;
  search_term?: string;
  milestone?: number;
  sort_key?: string;
  tab?: string;
  state?: string;
  city?: string;
  // Any additional custom params are allowed and forwarded verbatim.
  [key: string]: unknown;
};

const PERSISTED_EVENTS = new Set<GtmEventName>([
  "generate_lead",
  "select_item",
  "select_promotion",
  "view_item",
  "view_item_list",
  "site_search",
  "calculator_complete",
  "deposit_match_submit",
  "newsletter_signup_success",
  "guide_feedback",
  "share",
  "click_outbound",
]);

type DataLayerWindow = Window & {
  dataLayer?: Record<string, unknown>[];
};

function getWindow(): DataLayerWindow | null {
  return typeof window === "undefined" ? null : (window as DataLayerWindow);
}

function ensureDataLayer(): Record<string, unknown>[] | null {
  const w = getWindow();
  if (!w) return null;
  if (!w.dataLayer) w.dataLayer = [];
  return w.dataLayer;
}

const VISITOR_KEY = "iar_visitor_id";
const SESSION_KEY = "iar_session_id";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

function rid(): string {
  const c = (globalThis as unknown as { crypto?: Crypto }).crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getVisitorId(): string {
  const w = getWindow();
  if (!w) return "";
  try {
    let id = w.localStorage?.getItem(VISITOR_KEY) || "";
    if (!id) {
      id = rid();
      w.localStorage?.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

export function getSessionId(): string {
  const w = getWindow();
  if (!w) return "";
  try {
    const now = Date.now();
    const raw = w.sessionStorage?.getItem(SESSION_KEY);
    if (raw) {
      const [id, tsRaw] = raw.split("|");
      const ts = Number(tsRaw) || 0;
      if (id && now - ts < SESSION_TIMEOUT_MS) {
        w.sessionStorage?.setItem(SESSION_KEY, `${id}|${now}`);
        return id;
      }
    }
    const id = rid();
    w.sessionStorage?.setItem(SESSION_KEY, `${id}|${now}`);
    return id;
  } catch {
    return "";
  }
}

export function contentGroupFromPath(path: string): string {
  if (path === "/" || path === "") return "home";
  if (path.startsWith("/product/")) return "product";
  if (path.startsWith("/guides")) return "guides";
  if (path.startsWith("/calculators")) return "calculators";
  if (path.startsWith("/banks")) return "banks";
  if (path.startsWith("/bank-accounts")) return "bank-accounts";
  if (path.startsWith("/investing")) return "investing";
  if (path.startsWith("/financial-apps")) return "financial-apps";
  if (path.startsWith("/reviews")) return "reviews";
  if (path.startsWith("/authors")) return "authors";
  if (path.startsWith("/newsletter")) return "newsletter";
  if (path.startsWith("/faq")) return "faq";
  if (path.startsWith("/about")) return "about";
  if (path.startsWith("/contact")) return "contact";
  if (path.startsWith("/admin")) return "admin";
  return "other";
}

// ---- Supabase mirror (batched, sendBeacon-first) ----

type QueueRow = {
  event: GtmEventName;
  session_id: string;
  visitor_id: string;
  page_path: string;
  page_title: string;
  referrer: string;
  content_group: string;
  partner: string;
  offer: string;
  item_id: string;
  item_category: string;
  placement: string;
  value: number | null;
  params: Record<string, unknown>;
};

const queue: QueueRow[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
const FLUSH_DELAY_MS = 1500;

function ingestUrl(): string | null {
  const base = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  if (!base) return null;
  return `${base}/functions/v1/analytics-ingest`;
}

function ingestHeaders(): Record<string, string> {
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (anon) {
    h["Authorization"] = `Bearer ${anon}`;
    h["apikey"] = anon;
  }
  return h;
}

function flush(useBeacon = false) {
  if (queue.length === 0) return;
  const url = ingestUrl();
  if (!url) {
    queue.length = 0;
    return;
  }
  const events = queue.splice(0, queue.length);
  const body = JSON.stringify({ events });
  try {
    const w = getWindow();
    if (
      useBeacon &&
      w &&
      typeof navigator !== "undefined" &&
      typeof navigator.sendBeacon === "function"
    ) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(url, blob);
      return;
    }
    fetch(url, {
      method: "POST",
      headers: ingestHeaders(),
      body,
      keepalive: true,
    }).catch(() => {
      /* ignore - analytics is best-effort */
    });
  } catch {
    /* ignore */
  }
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flush(false);
  }, FLUSH_DELAY_MS);
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush(true);
  });
  window.addEventListener("pagehide", () => flush(true));
}

function persist(event: GtmEventName, params: GtmParams) {
  if (!PERSISTED_EVENTS.has(event)) return;
  const w = getWindow();
  if (!w) return;
  queue.push({
    event,
    session_id: getSessionId(),
    visitor_id: getVisitorId(),
    page_path: (params.page_path as string) || w.location.pathname + w.location.search,
    page_title: (params.page_title as string) || document.title,
    referrer: (params.referrer as string) || document.referrer || "",
    content_group:
      (params.content_group as string) ||
      contentGroupFromPath(w.location.pathname),
    partner: (params.partner as string) || "",
    offer: (params.offer as string) || "",
    item_id: (params.item_id as string) || "",
    item_category: (params.item_category as string) || "",
    placement: (params.placement as string) || "",
    value: typeof params.value === "number" ? params.value : null,
    params: { ...params },
  });
  if (queue.length >= 10) flush(false);
  else scheduleFlush();
}

// ---- Public API ----

export function pushEvent(event: GtmEventName, params: GtmParams = {}) {
  const dl = ensureDataLayer();
  const w = getWindow();
  const enriched: Record<string, unknown> = {
    event,
    page_path: w ? w.location.pathname + w.location.search : "",
    content_group: w ? contentGroupFromPath(w.location.pathname) : "",
    session_id: getSessionId(),
    visitor_id: getVisitorId(),
    ...params,
  };
  if (dl) dl.push(enriched);
  persist(event, params);
}

// Deduped impression push to avoid sending `view_item` hundreds of times on
// long product-card lists. Keyed by `event + (item_id|item_list_name|placement)`.
const impressionSeen = new Set<string>();
export function pushImpression(event: "view_item" | "view_item_list", params: GtmParams) {
  const key = `${event}|${params.item_id || ""}|${params.item_list_name || ""}|${params.placement || ""}|${params.page_path || (typeof window !== "undefined" ? window.location.pathname : "")}`;
  if (impressionSeen.has(key)) return;
  impressionSeen.add(key);
  pushEvent(event, params);
}
