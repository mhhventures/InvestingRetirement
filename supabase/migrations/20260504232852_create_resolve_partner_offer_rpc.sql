/*
  # Add resolve_partner_offer RPC

  1. Purpose
     - Collapse the two sequential lookups the edge redirect function was
       making (partners row, then offers row) into a single round-trip so
       that partner subdomain click-throughs can resolve destinations in
       one DB call instead of two.

  2. New objects
     - Function `public.resolve_partner_offer(p_partner_slug text, p_offer_slug text)`
       Returns one row containing both the partner defaults and (when an
       offer slug is provided and currently active within its start/end
       window) the matching offer metadata used to build the final UTM URL.

  3. Security
     - Function is SECURITY INVOKER and marked STABLE. Access is granted
       to `authenticated` and `anon` so the edge runtime (which uses the
       service role) and any future client calls work without elevating
       privileges. Underlying tables keep their existing RLS policies.
*/

CREATE OR REPLACE FUNCTION public.resolve_partner_offer(
  p_partner_slug text,
  p_offer_slug text
)
RETURNS TABLE (
  partner_id uuid,
  partner_status text,
  partner_default_url text,
  offer_id uuid,
  offer_destination_url text,
  offer_campaign text,
  offer_content text,
  offer_term text,
  offer_active boolean
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.status,
    p.default_destination_url,
    o.id,
    o.destination_url,
    o.campaign,
    o.content,
    o.term,
    COALESCE(
      o.active
        AND (o.starts_at IS NULL OR o.starts_at <= now())
        AND (o.ends_at IS NULL OR o.ends_at > now()),
      false
    )
  FROM public.partners p
  LEFT JOIN public.offers o
    ON o.partner_id = p.id
   AND o.slug = p_offer_slug
   AND p_offer_slug <> ''
  WHERE p.slug = p_partner_slug
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.resolve_partner_offer(text, text) TO anon, authenticated, service_role;
