/*
  # Update SoFi credit-score offer destination to direct SoFi URL

  Points the `sofi-credit-score` offer at SoFi's credit-score monitoring
  landing page directly.

  1. Updates
    - offers.destination_url for (partner=sofi, slug=sofi-credit-score)
      -> https://www.sofi.com/financial-insights/credit-score-monitoring/
*/

UPDATE offers
SET destination_url = 'https://www.sofi.com/financial-insights/credit-score-monitoring/'
WHERE slug = 'sofi-credit-score'
  AND partner_id = (SELECT id FROM partners WHERE slug = 'sofi');
