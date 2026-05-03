/*
  # Newsletter Subscriptions Log

  1. New Tables
    - `newsletter_subscriptions`
      - `id` (uuid, primary key)
      - `email` (citext, unique) — the subscriber address
      - `status` (text) — pending | confirmed | failed
      - `source` (text) — where on the site they signed up (sidebar, footer, newsletter-page)
      - `ip_hash` (text) — SHA-256 of the requester IP for rate limiting (not the raw IP)
      - `user_agent` (text)
      - `beehiiv_id` (text) — the subscription id returned by beehiiv
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  2. Security
    - Enable RLS on `newsletter_subscriptions`
    - No client-side policies — the row is written exclusively by the
      `newsletter-subscribe` edge function using the service role key.
      Anonymous and authenticated users have no direct read/write access.
  3. Indexes
    - Unique on email (case-insensitive via citext)
    - ip_hash + created_at for rolling rate-limit queries
*/

CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email citext UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  source text NOT NULL DEFAULT 'unknown',
  ip_hash text NOT NULL DEFAULT '',
  user_agent text NOT NULL DEFAULT '',
  beehiiv_id text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS newsletter_subscriptions_ip_hash_created_at_idx
  ON newsletter_subscriptions (ip_hash, created_at DESC);

ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
