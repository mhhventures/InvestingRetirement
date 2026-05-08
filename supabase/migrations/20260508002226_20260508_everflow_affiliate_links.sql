/*
  # Wire Everflow affiliate tracking for SoFi and Robinhood

  Updates existing offer rows to point `destination_url` at the live Everflow
  click URLs for three partner offers, and adds a `click_id` column to
  `offer_clicks` so we can store the per-click UUID sent as Everflow's `sub5`
  parameter. This lets Everflow postback conversions with the same sub5 and
  have us join them back to the originating session/page/placement in Supabase.

  1. Updates
    - `offers.destination_url`
      - `sofi` / `sofi-checking-savings` -> https://www.mzemndf8trk.com/63CFP/BWPN6F/
      - `sofi` / `sofi-invest`           -> https://www.mzemndf8trk.com/63CFP/C2WBD8/
      - `robinhood` / `robinhood-invest` -> https://www.mzemndf8trk.com/63CFP/C1HFMM/
        (the base Robinhood signup-flow link; Everflow uid variants below)

  2. New offers (Robinhood variants, kept as separate offer slugs so each
     variant has its own landing URL and reporting breakout)
    - `robinhood` / `robinhood-homepage`    -> ...C1HFMM/?uid=41
    - `robinhood` / `robinhood-ira-match`   -> ...C1HFMM/?uid=42

  3. Schema changes
    - `offer_clicks.click_id` (text) - UUID generated per click, also sent to
      Everflow as sub5. Indexed for conversion postback joins.

  4. Notes
    - All updates use explicit WHERE clauses on (partner_slug, offer_slug)
      via a subquery on `partners.id`, so no rows outside scope are touched.
    - New offer inserts are idempotent via ON CONFLICT (partner_id, slug).
    - RLS on `offers` / `offer_clicks` is unchanged (already enabled;
      service-role-only writes).
*/

-- 1. Update destination URLs for existing offers
UPDATE offers SET destination_url = 'https://www.mzemndf8trk.com/63CFP/BWPN6F/'
WHERE slug = 'sofi-checking-savings'
  AND partner_id = (SELECT id FROM partners WHERE slug = 'sofi');

UPDATE offers SET destination_url = 'https://www.mzemndf8trk.com/63CFP/C2WBD8/'
WHERE slug = 'sofi-invest'
  AND partner_id = (SELECT id FROM partners WHERE slug = 'sofi');

UPDATE offers SET destination_url = 'https://www.mzemndf8trk.com/63CFP/C1HFMM/'
WHERE slug = 'robinhood-invest'
  AND partner_id = (SELECT id FROM partners WHERE slug = 'robinhood');

-- 2. Insert Robinhood landing-page variants
INSERT INTO offers (partner_id, slug, product_type, name, destination_url, campaign, active)
SELECT p.id, v.offer_slug, v.product_type, v.name, v.destination_url, v.offer_slug, true
FROM partners p
JOIN (VALUES
  ('robinhood', 'robinhood-homepage',  'brokerage', 'Robinhood (Homepage)', 'https://www.mzemndf8trk.com/63CFP/C1HFMM/?uid=41'),
  ('robinhood', 'robinhood-ira-match', 'brokerage', 'Robinhood 3% IRA Match', 'https://www.mzemndf8trk.com/63CFP/C1HFMM/?uid=42')
) AS v(partner_slug, offer_slug, product_type, name, destination_url)
  ON v.partner_slug = p.slug
ON CONFLICT (partner_id, slug) DO NOTHING;

-- 3. Add click_id column to offer_clicks for Everflow sub5 join
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'offer_clicks' AND column_name = 'click_id'
  ) THEN
    ALTER TABLE offer_clicks ADD COLUMN click_id text NOT NULL DEFAULT '';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS offer_clicks_click_id_idx
  ON offer_clicks (click_id) WHERE click_id <> '';
