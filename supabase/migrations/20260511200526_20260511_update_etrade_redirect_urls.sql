/*
  # Update E*TRADE partner offer destinations to verified landing pages

  1. Changes
    - `etrade-invest` destination → https://us.etrade.com/what-we-offer/our-accounts
      (the prior /promo/brokerage URL was not a valid landing page).
    - `etrade-max-rate-checking` destination → https://us.etrade.com/bank
      (the banking hub page, per partner guidance).
    - Bumps `updated_at` so the edge-function resolve cache refreshes.

  2. Security
    - No schema changes. RLS policies on `offers` are untouched.
*/

UPDATE offers
SET destination_url = 'https://us.etrade.com/what-we-offer/our-accounts',
    updated_at = now()
WHERE slug = 'etrade-invest'
  AND partner_id = (SELECT id FROM partners WHERE slug = 'etrade');

UPDATE offers
SET destination_url = 'https://us.etrade.com/bank',
    updated_at = now()
WHERE slug = 'etrade-max-rate-checking'
  AND partner_id = (SELECT id FROM partners WHERE slug = 'etrade');
