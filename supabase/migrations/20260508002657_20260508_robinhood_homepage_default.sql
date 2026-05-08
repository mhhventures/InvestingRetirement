/*
  # Route all Robinhood clickouts to the homepage Everflow variant

  Points the default `robinhood-invest` offer at the homepage-tagged Everflow
  link (uid=41) so every existing Robinhood clickout across the site now
  lands on the Robinhood homepage via the tracked URL. The `robinhood-homepage`
  and `robinhood-ira-match` offer rows are kept intact so we can route
  specific placements to them later if needed.

  1. Updates
    - `offers.destination_url` for (partner=robinhood, offer=robinhood-invest)
      -> https://www.mzemndf8trk.com/63CFP/C1HFMM/?uid=41

  2. Notes
    - No schema changes.
    - RLS unchanged.
*/

UPDATE offers
SET destination_url = 'https://www.mzemndf8trk.com/63CFP/C1HFMM/?uid=41'
WHERE slug = 'robinhood-invest'
  AND partner_id = (SELECT id FROM partners WHERE slug = 'robinhood');
