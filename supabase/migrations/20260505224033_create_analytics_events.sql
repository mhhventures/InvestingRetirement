/*
  # Create analytics_events table

  1. New Tables
    - `analytics_events` - First-party event log mirrored from GTM dataLayer pushes.
      Captures lead clicks, impressions, and engagement events so we retain data
      independent of GA4 sampling.
      - `id` (uuid, primary key)
      - `event` (text) - GA4 event name (e.g. `generate_lead`, `view_item`)
      - `session_id` (text) - client-generated session identifier
      - `visitor_id` (text) - client-generated long-lived id (localStorage)
      - `page_path` (text) - path when event fired
      - `page_title` (text)
      - `referrer` (text)
      - `content_group` (text) - category, state, or 'guide' etc.
      - `partner` (text) - partner slug for lead events
      - `offer` (text) - offer slug for lead events
      - `item_id` (text) - product slug
      - `item_category` (text) - bank/investing/financial-apps
      - `placement` (text) - where in the UI
      - `value` (numeric) - optional monetary value
      - `params` (jsonb) - full event payload for anything not in columns above
      - `user_agent` (text)
      - `created_at` (timestamptz)
  2. Security
    - Enable RLS on `analytics_events`
    - No client-side policies: writes go through the `analytics-ingest` edge function
      using the service role key. No client reads allowed.
  3. Indexes
    - (event, created_at desc) for recent-event queries
    - (partner, created_at desc) for partner breakdowns
    - (session_id) for session stitching
*/

CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event text NOT NULL,
  session_id text DEFAULT '',
  visitor_id text DEFAULT '',
  page_path text DEFAULT '',
  page_title text DEFAULT '',
  referrer text DEFAULT '',
  content_group text DEFAULT '',
  partner text DEFAULT '',
  offer text DEFAULT '',
  item_id text DEFAULT '',
  item_category text DEFAULT '',
  placement text DEFAULT '',
  value numeric,
  params jsonb DEFAULT '{}'::jsonb,
  user_agent text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS analytics_events_event_created_idx
  ON analytics_events (event, created_at DESC);

CREATE INDEX IF NOT EXISTS analytics_events_partner_created_idx
  ON analytics_events (partner, created_at DESC)
  WHERE partner <> '';

CREATE INDEX IF NOT EXISTS analytics_events_session_idx
  ON analytics_events (session_id)
  WHERE session_id <> '';
