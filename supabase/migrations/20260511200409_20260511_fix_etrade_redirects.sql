/*
  # Fix E*TRADE partner offer destinations

  1. Changes
    - Update `offers.destination_url` for the `etrade-invest` offer so it
      points to the E*TRADE brokerage promo landing page instead of the
      banking landing page (which was the bug — the invest redirect was
      dropping visitors on the bank page).
    - Re-affirm `etrade-max-rate-checking` destination to the current
      Max-Rate Checking product page on us.etrade.com.
    - Bump `updated_at` so downstream caches refresh.

  2. Security
    - No schema changes. RLS policies on `offers` are untouched.
*/

UPDATE offers
SET destination_url = 'https://us.etrade.com/promo/brokerage',
    updated_at = now()
WHERE slug = 'etrade-invest'
  AND partner_id = (SELECT id FROM partners WHERE slug = 'etrade');

UPDATE offers
SET destination_url = 'https://us.etrade.com/bank/max-rate-checking',
    updated_at = now()
WHERE slug = 'etrade-max-rate-checking'
  AND partner_id = (SELECT id FROM partners WHERE slug = 'etrade');
