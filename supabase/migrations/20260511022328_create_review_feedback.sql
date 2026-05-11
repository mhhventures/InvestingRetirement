/*
  # Review feedback

  1. New Tables
    - `review_feedback`
      - `id` (uuid, primary key)
      - `product_slug` (text, which product review)
      - `helpful` (boolean, true=yes, false=no)
      - `created_at` (timestamptz)
      - `user_agent` (text, optional)
  2. Security
    - Enable RLS
    - Allow anonymous inserts so readers can vote without signing up
    - Allow public reads so aggregate counts can be displayed
*/

CREATE TABLE IF NOT EXISTS review_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_slug text NOT NULL,
  helpful boolean NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_agent text DEFAULT ''
);

CREATE INDEX IF NOT EXISTS review_feedback_slug_idx ON review_feedback (product_slug);

ALTER TABLE review_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit review feedback"
  ON review_feedback FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read review feedback counts"
  ON review_feedback FOR SELECT
  TO anon, authenticated
  USING (true);
