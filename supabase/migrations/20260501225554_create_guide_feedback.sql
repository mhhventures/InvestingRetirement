/*
  # Guide feedback

  1. New Tables
    - `guide_feedback`
      - `id` (uuid, primary key)
      - `guide_slug` (text, which guide article)
      - `helpful` (boolean, true=yes, false=no)
      - `created_at` (timestamptz)
      - `user_agent` (text, optional)
  2. Security
    - Enable RLS
    - Allow anonymous inserts so readers can vote without signing up
    - Allow public reads so aggregate counts can be displayed
*/

CREATE TABLE IF NOT EXISTS guide_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_slug text NOT NULL,
  helpful boolean NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_agent text DEFAULT ''
);

CREATE INDEX IF NOT EXISTS guide_feedback_slug_idx ON guide_feedback (guide_slug);

ALTER TABLE guide_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit guide feedback"
  ON guide_feedback FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read guide feedback counts"
  ON guide_feedback FOR SELECT
  TO anon, authenticated
  USING (true);
