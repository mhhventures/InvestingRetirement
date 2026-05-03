/*
  # State page search logging

  1. New Tables
    - `state_page_searches` — logs search queries performed on /banks/:state
      pages so we can surface the most-searched local institutions and
      improve on-page search ranking over time.
      - `id` (uuid, primary key)
      - `state_code` (text) — e.g. `CA`, `TX`
      - `query` (text) — raw search string (lowercased, trimmed)
      - `product_filter` (text) — active product filter at search time
      - `results_count` (int) — number of rows matched
      - `clicked_institution` (text) — institution_name if user clicked a result
      - `referrer` (text)
      - `user_agent` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Allow anon + authenticated to INSERT only
    - No SELECT/UPDATE/DELETE — analytics read through service role
*/

CREATE TABLE IF NOT EXISTS state_page_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state_code text NOT NULL DEFAULT '',
  query text NOT NULL DEFAULT '',
  product_filter text NOT NULL DEFAULT 'all',
  results_count int NOT NULL DEFAULT 0,
  clicked_institution text NOT NULL DEFAULT '',
  referrer text NOT NULL DEFAULT '',
  user_agent text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS state_page_searches_state_created_idx
  ON state_page_searches (state_code, created_at DESC);

CREATE INDEX IF NOT EXISTS state_page_searches_query_idx
  ON state_page_searches (state_code, query);

ALTER TABLE state_page_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log a state page search"
  ON state_page_searches FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
