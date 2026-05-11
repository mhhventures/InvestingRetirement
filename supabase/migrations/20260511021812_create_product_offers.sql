/*
  # Product offers (editorial-managed CTA + headline copy)

  Decouples rotatable offer copy — headline, CTA label, A/B variant, and
  per-offer verified_at timestamp — from the static product catalog in
  src/data/products.ts. This is what the sticky CTA bar, featured-offers
  sidebar, and product-card CTAs read at runtime.

  1. New Table
    - `product_offers`
      - `product_slug` (FK-style text) — matches Product.slug
      - `headline` — short value prop shown near the CTA
      - `sub` — optional second line (fees, terms, "FDIC insured")
      - `cta_label` — button text ("Open Account", "Claim Bonus", etc.)
      - `variant` — optional A/B identifier; clients log this with placement
      - `verified_at` — per-offer last-verified timestamp, replacing the
        global RATES_VERIFIED_DATE constant
      - `active` — soft-disable without deleting
  2. Security
    - RLS enabled; public SELECT of active rows only
    - Writes via dashboard / service role (no client-facing policies)
  3. Seed
    - Three baseline rows that mirror the current sidebar_featured_offers
      so the rollout is drop-in and the sticky CTA can read from here once
      the consumer code is wired up.
*/

CREATE TABLE IF NOT EXISTS product_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_slug text NOT NULL,
  headline text NOT NULL,
  sub text NOT NULL DEFAULT '',
  cta_label text NOT NULL DEFAULT 'See Offer',
  variant text NOT NULL DEFAULT 'default',
  verified_at timestamptz NOT NULL DEFAULT now(),
  active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS product_offers_slug_active_idx
  ON product_offers (product_slug, active);

ALTER TABLE product_offers ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename='product_offers' AND policyname='Public can read active product offers'
  ) THEN
    CREATE POLICY "Public can read active product offers"
      ON product_offers FOR SELECT
      TO anon, authenticated
      USING (active = true);
  END IF;
END $$;

INSERT INTO product_offers (product_slug, headline, sub, cta_label, variant, verified_at)
VALUES
  ('sofi-checking-savings', 'Earn 4.00% APY', 'No monthly fees. FDIC insured.', 'Open Account', 'default', now()),
  ('fidelity', '$0 Commission Trades', 'Plus industry-best research.', 'Start Investing', 'default', now()),
  ('chase-total-checking', '$300 Welcome Bonus', 'With qualifying direct deposit.', 'See Offer', 'default', now())
ON CONFLICT DO NOTHING;
