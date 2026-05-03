/*
  # Banks directory aggregation RPCs

  1. New Functions
    - `state_directory_stats()` — returns per-state aggregate stats used
      by the /banks landing page cards: institution count, top savings
      APY, and most recent verification date.
      Returns: `state_code text`, `institution_count bigint`,
      `top_savings_apy numeric`, `top_apy_any numeric`,
      `last_verified_at timestamptz`.

    - `top_rates_this_month(p_limit int)` — returns the top
      savings/MM/CD APYs across all available states, powering the
      "Top rates this month" leaderboard.
      Returns: `state_code text`, `state_name text`, `institution_name
      text`, `product_type text`, `apy numeric`, `min_deposit numeric`,
      `website_url text`, `institution_type text`.

  2. Security
    - Both functions are `SECURITY DEFINER` with a pinned `search_path`
      and aggregate only from `state_providers`, which is already
      public-read. Results are capped to mitigate abuse.
    - EXECUTE granted to `anon` and `authenticated`.
*/

CREATE OR REPLACE FUNCTION public.state_directory_stats()
RETURNS TABLE(
  state_code text,
  institution_count bigint,
  top_savings_apy numeric,
  top_apy_any numeric,
  last_verified_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    sp.state_code,
    COUNT(*)::bigint AS institution_count,
    COALESCE(MAX(sp.apy) FILTER (WHERE sp.product_type = 'savings'), 0)::numeric
      AS top_savings_apy,
    COALESCE(MAX(sp.apy), 0)::numeric AS top_apy_any,
    MAX(sp.last_verified_at) AS last_verified_at
  FROM public.state_providers sp
  GROUP BY sp.state_code;
$$;

GRANT EXECUTE ON FUNCTION public.state_directory_stats() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.top_rates_this_month(p_limit int DEFAULT 6)
RETURNS TABLE(
  state_code text,
  state_name text,
  institution_name text,
  institution_type text,
  product_type text,
  apy numeric,
  min_deposit numeric,
  website_url text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    sp.state_code,
    sp.state_name,
    sp.institution_name,
    sp.institution_type,
    sp.product_type,
    sp.apy::numeric,
    sp.min_deposit::numeric,
    sp.website_url
  FROM public.state_providers sp
  WHERE sp.apy > 0
    AND sp.product_type IN ('savings', 'money_market', 'cd')
  ORDER BY sp.apy DESC, sp.state_code ASC, sp.institution_name ASC
  LIMIT LEAST(GREATEST(p_limit, 1), 20);
$$;

GRANT EXECUTE ON FUNCTION public.top_rates_this_month(int) TO anon, authenticated;
