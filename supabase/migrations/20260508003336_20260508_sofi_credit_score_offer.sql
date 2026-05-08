/*
  # Add SoFi Free Credit Score offer

  Inserts a new offer row so SoFi's free credit-score reporting product can be
  linked via the standard `sofi.investingandretirement.com/sofi-credit-score`
  tracked URL, with clicks logged through the existing redirect edge function.

  1. New rows
    - `offers`: (partner=sofi, slug=sofi-credit-score, product_type=credit-score)
      destination = https://www.sofi.com/credit-score/

  2. Notes
    - Idempotent via ON CONFLICT (partner_id, slug).
    - No schema or RLS changes.
*/

INSERT INTO offers (partner_id, slug, product_type, name, destination_url, campaign, active)
SELECT p.id, 'sofi-credit-score', 'credit-score', 'SoFi Free Credit Score',
       'https://www.sofi.com/credit-score/', 'sofi-credit-score', true
FROM partners p
WHERE p.slug = 'sofi'
ON CONFLICT (partner_id, slug) DO NOTHING;
