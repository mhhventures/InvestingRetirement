/*
  # Create state_providers directory

  Adds a directory table for state-focused bank / credit union / community bank listings
  used by the /banks/$state pages to target local search queries.

  1. New Tables
    - `state_providers`
      - `id` (uuid, primary key)
      - `state_code` (text, 2-char, e.g. "CA") - indexed
      - `state_name` (text, full name)
      - `institution_name` (text)
      - `institution_type` (text, enum-like: credit_union | community_bank | state_bank | regional_bank)
      - `product_type` (text: savings | checking | cd | money_market)
      - `apy` (numeric) - current advertised APY
      - `min_deposit` (numeric, default 0)
      - `monthly_fee` (numeric, default 0)
      - `membership_required` (boolean, default false)
      - `membership_notes` (text, default '')
      - `fdic_ncua_id` (text, default '')
      - `website_url` (text)
      - `summary` (text) - short editorial summary
      - `rank_weight` (int, default 100) - lower shows first
      - `last_verified_at` (timestamptz, default now())
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS
    - Public read for all (this is public directory content)
    - No public write policies (content managed server-side / via service role)

  3. Notes
    1. Index on state_code for fast lookup.
    2. Index on (state_code, rank_weight) for sorted retrieval.
*/

CREATE TABLE IF NOT EXISTS state_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state_code text NOT NULL,
  state_name text NOT NULL,
  institution_name text NOT NULL,
  institution_type text NOT NULL DEFAULT 'community_bank',
  product_type text NOT NULL DEFAULT 'savings',
  apy numeric NOT NULL DEFAULT 0,
  min_deposit numeric NOT NULL DEFAULT 0,
  monthly_fee numeric NOT NULL DEFAULT 0,
  membership_required boolean NOT NULL DEFAULT false,
  membership_notes text NOT NULL DEFAULT '',
  fdic_ncua_id text NOT NULL DEFAULT '',
  website_url text NOT NULL DEFAULT '',
  summary text NOT NULL DEFAULT '',
  rank_weight int NOT NULL DEFAULT 100,
  last_verified_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS state_providers_state_code_idx ON state_providers (state_code);
CREATE INDEX IF NOT EXISTS state_providers_state_rank_idx ON state_providers (state_code, rank_weight);

ALTER TABLE state_providers ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'state_providers' AND policyname = 'Public can read state providers'
  ) THEN
    CREATE POLICY "Public can read state providers"
      ON state_providers FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;
