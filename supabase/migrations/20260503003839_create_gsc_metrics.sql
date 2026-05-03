/*
  # GSC Metrics Storage

  1. New Tables
    - `gsc_daily_metrics`
      - `id` (uuid, primary key)
      - `date` (date) - calendar day the metrics cover
      - `page` (text) - canonical URL
      - `query` (text) - search query (empty string when aggregated by page only)
      - `clicks` (integer) - clicks from Search
      - `impressions` (integer) - impressions in Search
      - `ctr` (numeric) - click-through rate (0-1)
      - `position` (numeric) - average position
      - `fetched_at` (timestamptz) - when this row was written
    - `gsc_sync_runs`
      - `id` (uuid, primary key)
      - `started_at` (timestamptz)
      - `finished_at` (timestamptz)
      - `rows_written` (integer)
      - `status` (text) - 'success' | 'error'
      - `error` (text)

  2. Security
    - RLS enabled on both tables
    - SELECT restricted to authenticated users (admin dashboard)
    - INSERT/UPDATE/DELETE: service role only (Edge Function), no end-user policies
*/

CREATE TABLE IF NOT EXISTS gsc_daily_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  page text NOT NULL DEFAULT '',
  query text NOT NULL DEFAULT '',
  clicks integer NOT NULL DEFAULT 0,
  impressions integer NOT NULL DEFAULT 0,
  ctr numeric NOT NULL DEFAULT 0,
  position numeric NOT NULL DEFAULT 0,
  fetched_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS gsc_daily_metrics_unique
  ON gsc_daily_metrics (date, page, query);

CREATE INDEX IF NOT EXISTS gsc_daily_metrics_date_idx ON gsc_daily_metrics (date DESC);
CREATE INDEX IF NOT EXISTS gsc_daily_metrics_page_idx ON gsc_daily_metrics (page);

ALTER TABLE gsc_daily_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read gsc metrics"
  ON gsc_daily_metrics FOR SELECT
  TO authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS gsc_sync_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  rows_written integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'running',
  error text
);

ALTER TABLE gsc_sync_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read gsc sync runs"
  ON gsc_sync_runs FOR SELECT
  TO authenticated
  USING (true);
