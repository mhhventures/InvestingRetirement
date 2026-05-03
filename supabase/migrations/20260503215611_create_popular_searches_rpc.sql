/*
  # Popular searches RPC + state page guides table

  1. New Functions
    - `popular_state_searches(p_state_code text, p_limit int)` — returns the
      top search queries logged on /banks/:state pages over the trailing 30
      days. Runs as SECURITY DEFINER so anon clients can read aggregated
      stats without broad SELECT access to `state_page_searches`.
      Returns: `query text`, `hits bigint`.

  2. New Tables
    - `state_page_guides` — optional per-state editorial intro copy keyed by
      `state_code`. Allows hand-written unique copy (CA vs TX) without
      redeploying the app.
      - `state_code` (text, primary key)
      - `intro_html` (text) — trusted HTML snippet for page intro
      - `reviewer_name` (text)
      - `reviewer_slug` (text) — ties to lib/authors.ts
      - `last_reviewed_at` (timestamptz)
      - `updated_at` (timestamptz)

  3. Security
    - `state_page_guides`: RLS enabled, public SELECT (guides are editorial
      content surfaced to all visitors).
    - No INSERT/UPDATE/DELETE policies — content managed via service role
      only.
    - RPC `popular_state_searches` is SECURITY DEFINER with a fixed
      search_path and LIMIT cap to mitigate abuse.
*/

-- Aggregation RPC for popular searches (safe, aggregated, capped)
CREATE OR REPLACE FUNCTION public.popular_state_searches(
  p_state_code text,
  p_limit int DEFAULT 8
)
RETURNS TABLE(query text, hits bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.query, COUNT(*)::bigint AS hits
  FROM public.state_page_searches s
  WHERE s.state_code = p_state_code
    AND s.query <> ''
    AND length(s.query) >= 2
    AND s.created_at > now() - interval '30 days'
  GROUP BY s.query
  ORDER BY hits DESC, s.query ASC
  LIMIT LEAST(GREATEST(p_limit, 1), 20);
$$;

GRANT EXECUTE ON FUNCTION public.popular_state_searches(text, int)
  TO anon, authenticated;

-- Editorial intro copy per state
CREATE TABLE IF NOT EXISTS state_page_guides (
  state_code text PRIMARY KEY,
  intro_html text NOT NULL DEFAULT '',
  reviewer_name text NOT NULL DEFAULT '',
  reviewer_slug text NOT NULL DEFAULT '',
  last_reviewed_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE state_page_guides ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'state_page_guides'
      AND policyname = 'Public can read state guides'
  ) THEN
    CREATE POLICY "Public can read state guides"
      ON state_page_guides FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;
