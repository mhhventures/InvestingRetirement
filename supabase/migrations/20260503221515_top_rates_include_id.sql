/*
  # Include institution id in top_rates_this_month

  1. Change
    - Replaces `public.top_rates_this_month` to also return the
      `id uuid` of the provider so the /banks leaderboard can deep-link
      directly to that row on the state page.

  2. Safety
    - Non-destructive: CREATE OR REPLACE only. No data is touched.
    - EXECUTE still granted to `anon` and `authenticated`.
*/

DROP FUNCTION IF EXISTS public.top_rates_this_month(int);

CREATE OR REPLACE FUNCTION public.top_rates_this_month(p_limit int DEFAULT 6)
RETURNS TABLE(
  id uuid,
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
    sp.id,
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
