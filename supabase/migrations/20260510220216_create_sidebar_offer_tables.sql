/*
  # Sidebar rates & offers (editorial-managed)

  Moves hardcoded sidebar data out of JavaScript and into Supabase so ops can
  update weekly rate snapshots, featured offers, and quick-compare tables
  without a code deploy.

  1. New Tables
    - `sidebar_rates` — current-rate ticker (High-Yield Savings, 12mo CD, etc.)
    - `sidebar_featured_offers` — top 3 bank/broker offers with headline + sub
    - `sidebar_compare_rows` — quick-compare tables, grouped by category key
  2. Security
    - RLS enabled on all three; anonymous + authenticated users get SELECT only
    - Writes go through dashboard / service role, so no INSERT/UPDATE/DELETE policies
  3. Seed
    - Mirrors the current hardcoded values so rollout is drop-in
*/

CREATE TABLE IF NOT EXISTS sidebar_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  value text NOT NULL,
  trend_up boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sidebar_featured_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_slug text NOT NULL,
  headline text NOT NULL,
  sub text NOT NULL DEFAULT '',
  cta text NOT NULL DEFAULT 'See Offer',
  display_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sidebar_compare_rows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  product_slug text NOT NULL,
  display_name text NOT NULL,
  primary_value text NOT NULL,
  bonus text NOT NULL DEFAULT 'None',
  display_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sidebar_rates_order_idx
  ON sidebar_rates (active, display_order);
CREATE INDEX IF NOT EXISTS sidebar_featured_offers_order_idx
  ON sidebar_featured_offers (active, display_order);
CREATE INDEX IF NOT EXISTS sidebar_compare_rows_category_order_idx
  ON sidebar_compare_rows (category, active, display_order);

ALTER TABLE sidebar_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sidebar_featured_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sidebar_compare_rows ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='sidebar_rates' AND policyname='Public can read active rates') THEN
    CREATE POLICY "Public can read active rates"
      ON sidebar_rates FOR SELECT
      TO anon, authenticated
      USING (active = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='sidebar_featured_offers' AND policyname='Public can read active featured offers') THEN
    CREATE POLICY "Public can read active featured offers"
      ON sidebar_featured_offers FOR SELECT
      TO anon, authenticated
      USING (active = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='sidebar_compare_rows' AND policyname='Public can read active compare rows') THEN
    CREATE POLICY "Public can read active compare rows"
      ON sidebar_compare_rows FOR SELECT
      TO anon, authenticated
      USING (active = true);
  END IF;
END $$;

-- Seed: current rates
INSERT INTO sidebar_rates (label, value, trend_up, display_order)
VALUES
  ('High-Yield Savings', '4.15%', true, 1),
  ('12-Month CD', '3.75%', true, 2),
  ('24-Month CD', '3.75%', false, 3),
  ('30-Year Mortgage', '7.22%', false, 4)
ON CONFLICT DO NOTHING;

-- Seed: featured offers
INSERT INTO sidebar_featured_offers (product_slug, headline, sub, cta, display_order)
VALUES
  ('sofi-checking-savings', 'Earn 4.00% APY', 'No monthly fees. FDIC insured.', 'Open Account', 1),
  ('fidelity', '$0 Commission Trades', 'Plus industry-best research.', 'Start Investing', 2),
  ('chase-total-checking', '$300 Welcome Bonus', 'With qualifying direct deposit.', 'See Offer', 3)
ON CONFLICT DO NOTHING;

-- Seed: savings compare
INSERT INTO sidebar_compare_rows (category, product_slug, display_name, primary_value, bonus, display_order)
VALUES
  ('savings', 'sofi-checking-savings', 'SoFi Savings', '4.00%', '$400', 1),
  ('savings', 'marcus-high-yield', 'Marcus', '3.50%', 'None', 2),
  ('savings', 'ally-online-savings', 'Ally Savings', '3.10%', 'None', 3),
  ('savings', 'chase-savings', 'Chase Savings', '0.01%', '$300', 4)
ON CONFLICT DO NOTHING;

-- Seed: investing compare
INSERT INTO sidebar_compare_rows (category, product_slug, display_name, primary_value, bonus, display_order)
VALUES
  ('investing', 'fidelity', 'Fidelity', '$0', 'None', 1),
  ('investing', 'robinhood', 'Robinhood', '$0', '1% Match', 2),
  ('investing', 'betterment', 'Betterment', '0.25%', 'None', 3),
  ('investing', 'charles-schwab', 'Schwab', '$0', 'None', 4)
ON CONFLICT DO NOTHING;
