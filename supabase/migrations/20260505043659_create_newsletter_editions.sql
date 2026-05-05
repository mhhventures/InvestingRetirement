/*
  # Newsletter editions archive

  1. New Tables
    - `newsletter_editions`
      - `id` (uuid, primary key)
      - `week_start` (date) — Monday of the edition week
      - `category` (text) — e.g., "high-yield-savings", "checking", "brokerage"
      - `headline` (text) — subject-line / card headline
      - `intro` (text) — short editor's note above the table
      - `product_slugs` (text[]) — ordered list of product slugs featured
      - `rendered_html` (text) — full email-safe HTML block ready to paste into Beehiiv
      - `sent_at` (timestamptz, nullable) — set when the edition is marked as sent
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Indexes
    - Unique on (week_start, category) so each week/category has one canonical edition
    - Index on sent_at for history views

  3. Security
    - RLS enabled
    - No public policies: this table is written/read exclusively by edge functions
      using the service role (which bypasses RLS). Front-end clients have no access.
*/

CREATE TABLE IF NOT EXISTS newsletter_editions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start date NOT NULL,
  category text NOT NULL,
  headline text NOT NULL DEFAULT '',
  intro text NOT NULL DEFAULT '',
  product_slugs text[] NOT NULL DEFAULT '{}',
  rendered_html text NOT NULL DEFAULT '',
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS newsletter_editions_week_category_idx
  ON newsletter_editions (week_start, category);

CREATE INDEX IF NOT EXISTS newsletter_editions_sent_at_idx
  ON newsletter_editions (sent_at DESC);

ALTER TABLE newsletter_editions ENABLE ROW LEVEL SECURITY;
