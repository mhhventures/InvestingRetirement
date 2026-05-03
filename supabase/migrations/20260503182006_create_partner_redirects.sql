/*
  # Partner subdomain redirect system

  Creates the data model that powers `{partner}.investingandretirement.com/{offer-slug}`
  affiliate redirects, with per-offer click tracking for analytics.

  1. New Tables
    - `partners`
      - `id` (uuid, pk)
      - `slug` (text, unique) - subdomain label, e.g. `sofi`, `ally`, `cryptocom`
      - `name` (text) - display name, e.g. "SoFi"
      - `network` (text) - affiliate network identifier (impact, cj, direct, etc.)
      - `status` (text) - active | paused
      - `default_destination_url` (text) - fallback when an unknown offer slug is hit
      - `created_at`, `updated_at` (timestamptz)

    - `offers`
      - `id` (uuid, pk)
      - `partner_id` (uuid, fk -> partners)
      - `slug` (text) - URL path segment, e.g. `sofi-checking-savings`
      - `product_type` (text) - rollup bucket: hysa | checking | brokerage | robo | crypto | prediction | budgeting | cash-advance | credit-score | neobank | credit-loans | research
      - `name` (text) - display name
      - `destination_url` (text) - where the 302 redirects to
      - `campaign` (text) - utm_campaign value
      - `content` (text) - utm_content default
      - `term` (text) - utm_term default
      - `active` (boolean, default true)
      - `starts_at`, `ends_at` (timestamptz, nullable)
      - `notes` (text)
      - `created_at`, `updated_at` (timestamptz)
      - UNIQUE (partner_id, slug)

    - `offer_clicks`
      - `id` (uuid, pk)
      - `partner_slug` (text) - denormalized for fast analytics
      - `offer_slug` (text) - denormalized
      - `offer_id` (uuid, nullable fk) - null if slug didn't resolve
      - `destination_url` (text)
      - `referrer` (text)
      - `user_agent` (text)
      - `ip_hash` (text) - sha256 of ip, never raw ip
      - `country` (text)
      - `placement` (text) - from ?p= query param (utm_content)
      - `term` (text) - from ?t= query param (utm_term)
      - `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` (text)
      - `created_at` (timestamptz, default now())

  2. Security
    - RLS enabled on all three tables
    - `partners` and `offers`: public SELECT restricted to active rows (the redirect
      edge function uses the service role and bypasses RLS, but public read of active
      offers is safe and lets the frontend render links without a server round-trip)
    - `offer_clicks`: no public read, no public write; service role only

  3. Indexes
    - partners(slug) unique
    - offers(partner_id, slug) unique
    - offers(active) for fast lookups
    - offer_clicks(partner_slug, offer_slug, created_at) for analytics queries
*/

CREATE TABLE IF NOT EXISTS partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  network text NOT NULL DEFAULT 'direct',
  status text NOT NULL DEFAULT 'active',
  default_destination_url text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  slug text NOT NULL,
  product_type text NOT NULL DEFAULT 'other',
  name text NOT NULL DEFAULT '',
  destination_url text NOT NULL,
  campaign text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  term text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  starts_at timestamptz,
  ends_at timestamptz,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (partner_id, slug)
);

CREATE INDEX IF NOT EXISTS offers_active_idx ON offers (active);
CREATE INDEX IF NOT EXISTS offers_product_type_idx ON offers (product_type);

CREATE TABLE IF NOT EXISTS offer_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_slug text NOT NULL DEFAULT '',
  offer_slug text NOT NULL DEFAULT '',
  offer_id uuid REFERENCES offers(id) ON DELETE SET NULL,
  destination_url text NOT NULL DEFAULT '',
  referrer text NOT NULL DEFAULT '',
  user_agent text NOT NULL DEFAULT '',
  ip_hash text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT '',
  placement text NOT NULL DEFAULT '',
  term text NOT NULL DEFAULT '',
  utm_source text NOT NULL DEFAULT '',
  utm_medium text NOT NULL DEFAULT '',
  utm_campaign text NOT NULL DEFAULT '',
  utm_content text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS offer_clicks_lookup_idx
  ON offer_clicks (partner_slug, offer_slug, created_at DESC);

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_clicks ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'partners' AND policyname = 'Public can read active partners'
  ) THEN
    CREATE POLICY "Public can read active partners"
      ON partners FOR SELECT
      TO anon, authenticated
      USING (status = 'active');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'offers' AND policyname = 'Public can read active offers'
  ) THEN
    CREATE POLICY "Public can read active offers"
      ON offers FOR SELECT
      TO anon, authenticated
      USING (
        active = true
        AND (starts_at IS NULL OR starts_at <= now())
        AND (ends_at IS NULL OR ends_at > now())
      );
  END IF;
END $$;
