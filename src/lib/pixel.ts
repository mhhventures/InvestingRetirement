// Meta Pixel event helpers. The base pixel + initial PageView are loaded in
// index.html; SPA PageView is fired from main.tsx on route change. Use the
// functions below from UI code to fire standard or custom events.

type FbqArgs =
  | ["track", string]
  | ["track", string, Record<string, unknown>]
  | ["track", string, Record<string, unknown>, { eventID: string }]
  | ["trackCustom", string]
  | ["trackCustom", string, Record<string, unknown>]
  | ["trackCustom", string, Record<string, unknown>, { eventID: string }];

type Fbq = (...args: FbqArgs) => void;

function getFbq(): Fbq | null {
  if (typeof window === "undefined") return null;
  const fbq = (window as unknown as { fbq?: Fbq }).fbq;
  return typeof fbq === "function" ? fbq : null;
}

function newEventId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export type PixelStandardEvent =
  | "Lead"
  | "Subscribe"
  | "ViewContent"
  | "Search"
  | "CustomizeProduct"
  | "CompleteRegistration"
  | "Contact";

export function trackEvent(
  name: PixelStandardEvent,
  params: Record<string, unknown> = {},
): string | null {
  const fbq = getFbq();
  if (!fbq) return null;
  const eventID = newEventId();
  fbq("track", name, params, { eventID });
  return eventID;
}

export function trackCustom(
  name: string,
  params: Record<string, unknown> = {},
): string | null {
  const fbq = getFbq();
  if (!fbq) return null;
  const eventID = newEventId();
  fbq("trackCustom", name, params, { eventID });
  return eventID;
}
