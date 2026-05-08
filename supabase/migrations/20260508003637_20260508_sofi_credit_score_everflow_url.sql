/*
  # Point SoFi credit-score offer at the Everflow affiliate URL

  Updates the `sofi-credit-score` offer destination to the real tracked
  Everflow link so clickouts from the new Financial Apps Credit Score pick
  route through the partner network.

  1. Updates
    - `offers.destination_url` for (partner=sofi, slug=sofi-credit-score)
      -> https://www.mzemndf8trk.com/63CFP/C4974T/

  2. Notes
    - No schema or RLS changes.
*/

UPDATE offers
SET destination_url = 'https://www.mzemndf8trk.com/63CFP/C4974T/'
WHERE slug = 'sofi-credit-score'
  AND partner_id = (SELECT id FROM partners WHERE slug = 'sofi');
