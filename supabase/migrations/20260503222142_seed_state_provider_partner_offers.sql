/*
  # Seed partner + offer redirects for every state bank provider

  Wires each row in `state_providers` into the existing
  partners / offers redirect system so state-bank outbound links flow
  through the `{partner}.investingandretirement.com/{offer}` tracker
  just like our national product catalog.

  1. Partner slug derivation
    - Takes the host from `website_url`, strips `www.`, drops the TLD,
      and keeps only alphanumerics (e.g. `www.golden1.com` → `golden1`,
      `schoolsfirstfcu.org` → `schoolsfirstfcu`,
      `banking.us.barclays` → `barclays`).

  2. Offer slug
    - Deterministic kebab slug of the institution name, prefixed with
      state and product type:
      `{state_lower}-{product_type}-{kebab(institution_name)}`
      e.g. `ca-savings-golden-1-credit-union`.

  3. Inserts (idempotent via ON CONFLICT DO NOTHING)
    - Inserts one `partners` row per distinct derived partner slug using
      the provider's website as the default destination.
    - Inserts one `offers` row per provider under its partner, with
      campaign = `state-{state_lower}` and content = product_type.

  4. Safety
    - No UPDATE/DELETE; existing partners and offers (e.g. the national
      seeds) are preserved by ON CONFLICT DO NOTHING.
*/

-- Helper subquery builds (partner_slug, offer_slug, website_url,
-- state_code, product_type, institution_name) per state provider.
WITH derived AS (
  SELECT
    sp.id,
    sp.state_code,
    sp.product_type,
    sp.institution_name,
    sp.website_url,
    -- strip scheme/trailing slash
    regexp_replace(
      regexp_replace(lower(coalesce(sp.website_url, '')), '^https?://', ''),
      '/.*$', ''
    ) AS host_no_scheme
  FROM state_providers sp
  WHERE sp.website_url IS NOT NULL AND sp.website_url <> ''
), partner_keyed AS (
  SELECT
    d.*,
    -- drop leading www., keep registrable-ish label before the first dot
    regexp_replace(
      split_part(regexp_replace(d.host_no_scheme, '^www\.', ''), '.', 1),
      '[^a-z0-9]', '', 'g'
    ) AS partner_raw
  FROM derived d
), with_slugs AS (
  SELECT
    pk.*,
    -- Fallback to a kebab of institution_name if domain was empty.
    CASE
      WHEN pk.partner_raw = '' OR pk.partner_raw IS NULL THEN
        regexp_replace(
          regexp_replace(lower(pk.institution_name), '[^a-z0-9]+', '-', 'g'),
          '(^-|-$)', '', 'g'
        )
      ELSE pk.partner_raw
    END AS partner_slug,
    lower(pk.state_code) || '-' || pk.product_type || '-' || regexp_replace(
      regexp_replace(lower(pk.institution_name), '[^a-z0-9]+', '-', 'g'),
      '(^-|-$)', '', 'g'
    ) AS offer_slug
  FROM partner_keyed pk
)
-- 1) Insert partners (one per distinct partner_slug)
INSERT INTO partners (slug, name, default_destination_url, status)
SELECT DISTINCT ON (ws.partner_slug)
  ws.partner_slug,
  ws.institution_name,
  ws.website_url,
  'active'
FROM with_slugs ws
ON CONFLICT (slug) DO NOTHING;

-- 2) Insert offers (one per provider row)
WITH derived AS (
  SELECT
    sp.id,
    sp.state_code,
    sp.product_type,
    sp.institution_name,
    sp.website_url,
    regexp_replace(
      regexp_replace(lower(coalesce(sp.website_url, '')), '^https?://', ''),
      '/.*$', ''
    ) AS host_no_scheme
  FROM state_providers sp
  WHERE sp.website_url IS NOT NULL AND sp.website_url <> ''
), partner_keyed AS (
  SELECT
    d.*,
    regexp_replace(
      split_part(regexp_replace(d.host_no_scheme, '^www\.', ''), '.', 1),
      '[^a-z0-9]', '', 'g'
    ) AS partner_raw
  FROM derived d
), with_slugs AS (
  SELECT
    pk.*,
    CASE
      WHEN pk.partner_raw = '' OR pk.partner_raw IS NULL THEN
        regexp_replace(
          regexp_replace(lower(pk.institution_name), '[^a-z0-9]+', '-', 'g'),
          '(^-|-$)', '', 'g'
        )
      ELSE pk.partner_raw
    END AS partner_slug,
    lower(pk.state_code) || '-' || pk.product_type || '-' || regexp_replace(
      regexp_replace(lower(pk.institution_name), '[^a-z0-9]+', '-', 'g'),
      '(^-|-$)', '', 'g'
    ) AS offer_slug
  FROM partner_keyed pk
)
INSERT INTO offers
  (partner_id, slug, product_type, name, destination_url, campaign, content, active)
SELECT
  p.id,
  ws.offer_slug,
  ws.product_type,
  ws.institution_name || ' — ' || ws.state_code,
  ws.website_url,
  'state-' || lower(ws.state_code),
  ws.product_type,
  true
FROM with_slugs ws
JOIN partners p ON p.slug = ws.partner_slug
ON CONFLICT (partner_id, slug) DO NOTHING;
