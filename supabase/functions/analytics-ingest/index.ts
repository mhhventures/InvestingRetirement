import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

type IncomingEvent = {
  event?: string;
  session_id?: string;
  visitor_id?: string;
  page_path?: string;
  page_title?: string;
  referrer?: string;
  content_group?: string;
  partner?: string;
  offer?: string;
  item_id?: string;
  item_category?: string;
  placement?: string;
  value?: number;
  params?: Record<string, unknown>;
};

const PERSISTED_EVENTS = new Set([
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

function str(v: unknown, max = 500): string {
  if (v == null) return "";
  const s = String(v);
  return s.length > max ? s.slice(0, max) : s;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "method_not_allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json().catch(() => null)) as
      | { events?: IncomingEvent[] }
      | IncomingEvent
      | null;
    if (!body) {
      return new Response(JSON.stringify({ error: "bad_body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const incoming: IncomingEvent[] = Array.isArray((body as { events?: IncomingEvent[] }).events)
      ? (body as { events: IncomingEvent[] }).events
      : [body as IncomingEvent];

    const userAgent = str(req.headers.get("user-agent") ?? "", 500);

    const rows = incoming
      .filter((e) => e && e.event && PERSISTED_EVENTS.has(e.event))
      .slice(0, 50)
      .map((e) => ({
        event: str(e.event, 64),
        session_id: str(e.session_id, 64),
        visitor_id: str(e.visitor_id, 64),
        page_path: str(e.page_path, 500),
        page_title: str(e.page_title, 300),
        referrer: str(e.referrer, 500),
        content_group: str(e.content_group, 64),
        partner: str(e.partner, 64),
        offer: str(e.offer, 128),
        item_id: str(e.item_id, 128),
        item_category: str(e.item_category, 64),
        placement: str(e.placement, 64),
        value: typeof e.value === "number" && isFinite(e.value) ? e.value : null,
        params: e.params && typeof e.params === "object" ? e.params : {},
        user_agent: userAgent,
      }));

    if (rows.length === 0) {
      return new Response(JSON.stringify({ ok: true, written: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error } = await supabase.from("analytics_events").insert(rows);
    if (error) {
      console.error("[analytics-ingest] insert error", error);
      return new Response(JSON.stringify({ error: "insert_failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, written: rows.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[analytics-ingest] unexpected", err);
    return new Response(JSON.stringify({ error: "unexpected" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
