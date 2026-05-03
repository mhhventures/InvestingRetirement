/*
  # Widget events tracking

  1. New Tables
    - `widget_events` — logs DepositMatch (and future embedded-widget) impressions
      and CTA clicks fired from calculator/guide pages so we can measure RPM
      alongside `offer_clicks`.
      - `id` (uuid, primary key)
      - `widget` (text) — widget slug, e.g. `depositmatch-v2`
      - `event` (text) — `impression` | `mount` | `click` | `lead` | `error`
      - `page_path` (text) — the site path the widget was embedded on
      - `placement` (text) — location on the page (e.g. `calculator-body`)
      - `sub_id` (text) — the sub-id we pass into the widget for attribution
      - `referrer` (text)
      - `user_agent` (text)
      - `payload` (jsonb) — free-form metadata from the widget / client
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Allow anonymous and authenticated clients to INSERT events only
    - No SELECT/UPDATE/DELETE policies — reads happen via service role only
*/

CREATE TABLE IF NOT EXISTS widget_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  widget text NOT NULL DEFAULT '',
  event text NOT NULL DEFAULT 'impression',
  page_path text NOT NULL DEFAULT '',
  placement text NOT NULL DEFAULT '',
  sub_id text NOT NULL DEFAULT '',
  referrer text NOT NULL DEFAULT '',
  user_agent text NOT NULL DEFAULT '',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS widget_events_widget_created_idx
  ON widget_events (widget, created_at DESC);

CREATE INDEX IF NOT EXISTS widget_events_page_created_idx
  ON widget_events (page_path, created_at DESC);

ALTER TABLE widget_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert widget events"
  ON widget_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
