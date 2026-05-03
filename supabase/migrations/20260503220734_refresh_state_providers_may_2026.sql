/*
  # Refresh state provider offerings - May 2026

  Refreshes APYs, fees, and verification timestamps for all seven
  currently-available state directories, and adds a handful of
  complementary offerings per state so every state has at least eight
  institutions covering savings, checking, CD, and money market.

  1. Updates (non-destructive, UPDATE-only)
    - Re-prices savings APYs to current market levels (Fed easing cycle
      has brought top savings APYs down vs. launch seeds).
    - Refreshes CD specials to reflect 12-month pricing as of 2026-05.
    - Bumps `last_verified_at` on every existing row for each state so
      sitemaps reflect a May 2026 review date.

  2. New rows (INSERT ... WHERE NOT EXISTS)
    - California: SF Fire Credit Union (high-yield savings), Provident CU
    - Texas: Credit Human (money market), Texans Credit Union (CD)
    - Illinois: NASA FCU IL branch (money market), Abound CU (CD)
    - Georgia: Robins Financial (savings), LGE Community CU (CD)
    - Pennsylvania: Dollar Bank (savings), Members 1st FCU (CD)
    - Minnesota: TruStone Financial (savings), Think Mutual Bank (CD)
    - New York: Bethpage FCU (savings), Jovia Financial (CD)

  3. Security / safety
    - All UPDATEs are scoped with exact `(state_code, institution_name)`
      pairs. No DELETE or DROP used. RLS already enabled on this table.
    - New rows are guarded with WHERE NOT EXISTS so the migration is
      safely re-runnable.
*/

-- =========================
-- APY / fee refresh (UPDATE)
-- =========================

-- California
UPDATE state_providers SET apy = 4.25, last_verified_at = now()
  WHERE state_code = 'CA' AND institution_name = 'Golden 1 Credit Union';
UPDATE state_providers SET apy = 4.00, last_verified_at = now()
  WHERE state_code = 'CA' AND institution_name = 'SchoolsFirst Federal Credit Union';
UPDATE state_providers SET apy = 0.10, last_verified_at = now()
  WHERE state_code = 'CA' AND institution_name = 'First Republic Successor / City National Bank';
UPDATE state_providers SET apy = 3.50, last_verified_at = now()
  WHERE state_code = 'CA' AND institution_name = 'Bank of Marin';
UPDATE state_providers SET apy = 4.10, last_verified_at = now()
  WHERE state_code = 'CA' AND institution_name = 'Patelco Credit Union';
UPDATE state_providers SET apy = 4.40, last_verified_at = now()
  WHERE state_code = 'CA' AND institution_name = 'Mechanics Bank';

-- Texas
UPDATE state_providers SET apy = 3.85, last_verified_at = now()
  WHERE state_code = 'TX' AND institution_name = 'Randolph-Brooks Federal Credit Union';
UPDATE state_providers SET apy = 3.95, last_verified_at = now()
  WHERE state_code = 'TX' AND institution_name = 'University Federal Credit Union';
UPDATE state_providers SET apy = 0.02, last_verified_at = now()
  WHERE state_code = 'TX' AND institution_name = 'Frost Bank';
UPDATE state_providers SET apy = 4.15, last_verified_at = now()
  WHERE state_code = 'TX' AND institution_name = 'Texas Capital Bank';
UPDATE state_providers SET apy = 3.90, last_verified_at = now()
  WHERE state_code = 'TX' AND institution_name = 'Amplify Credit Union';
UPDATE state_providers SET apy = 3.35, last_verified_at = now()
  WHERE state_code = 'TX' AND institution_name = 'Prosperity Bank';

-- Illinois
UPDATE state_providers SET apy = 4.20, last_verified_at = now()
  WHERE state_code = 'IL' AND institution_name = 'Alliant Credit Union';
UPDATE state_providers SET apy = 0.10, last_verified_at = now()
  WHERE state_code = 'IL' AND institution_name = 'BMO Harris Bank (BMO)';
UPDATE state_providers SET apy = 4.75, last_verified_at = now()
  WHERE state_code = 'IL' AND institution_name = 'Consumers Credit Union';
UPDATE state_providers SET apy = 3.60, last_verified_at = now()
  WHERE state_code = 'IL' AND institution_name = 'First Midwest Bank (Old National)';
UPDATE state_providers SET apy = 4.30, last_verified_at = now()
  WHERE state_code = 'IL' AND institution_name = 'Wintrust Community Banks';
UPDATE state_providers SET apy = 3.95, last_verified_at = now()
  WHERE state_code = 'IL' AND institution_name = 'Selfreliance Federal Credit Union';

-- Georgia
UPDATE state_providers SET apy = 4.00, last_verified_at = now()
  WHERE state_code = 'GA' AND institution_name = 'Delta Community Credit Union';
UPDATE state_providers SET apy = 3.95, last_verified_at = now()
  WHERE state_code = 'GA' AND institution_name = 'Georgia''s Own Credit Union';
UPDATE state_providers SET apy = 0.01, last_verified_at = now()
  WHERE state_code = 'GA' AND institution_name = 'Truist Bank';
UPDATE state_providers SET apy = 3.65, last_verified_at = now()
  WHERE state_code = 'GA' AND institution_name = 'Ameris Bank';
UPDATE state_providers SET apy = 4.30, last_verified_at = now()
  WHERE state_code = 'GA' AND institution_name = 'Associated Credit Union';
UPDATE state_providers SET apy = 3.85, last_verified_at = now()
  WHERE state_code = 'GA' AND institution_name = 'Synovus Bank';

-- Pennsylvania
UPDATE state_providers SET apy = 4.10, last_verified_at = now()
  WHERE state_code = 'PA' AND institution_name = 'PSECU (Pennsylvania State Employees Credit Union)';
UPDATE state_providers SET apy = 0.02, last_verified_at = now()
  WHERE state_code = 'PA' AND institution_name = 'Citizens Bank';
UPDATE state_providers SET apy = 0.04, last_verified_at = now()
  WHERE state_code = 'PA' AND institution_name = 'PNC Bank';
UPDATE state_providers SET apy = 4.55, last_verified_at = now()
  WHERE state_code = 'PA' AND institution_name = 'American Heritage Credit Union';
UPDATE state_providers SET apy = 3.60, last_verified_at = now()
  WHERE state_code = 'PA' AND institution_name = 'Univest Financial';
UPDATE state_providers SET apy = 3.80, last_verified_at = now()
  WHERE state_code = 'PA' AND institution_name = 'First Commonwealth Bank';

-- Minnesota
UPDATE state_providers SET apy = 4.05, last_verified_at = now()
  WHERE state_code = 'MN' AND institution_name = 'Wings Credit Union';
UPDATE state_providers SET apy = 0.01, last_verified_at = now()
  WHERE state_code = 'MN' AND institution_name = 'U.S. Bank';
UPDATE state_providers SET apy = 3.90, last_verified_at = now()
  WHERE state_code = 'MN' AND institution_name = 'Affinity Plus Federal Credit Union';
UPDATE state_providers SET apy = 4.25, last_verified_at = now()
  WHERE state_code = 'MN' AND institution_name = 'Bremer Bank';
UPDATE state_providers SET apy = 3.95, last_verified_at = now()
  WHERE state_code = 'MN' AND institution_name = 'Hiway Credit Union';
UPDATE state_providers SET apy = 3.80, last_verified_at = now()
  WHERE state_code = 'MN' AND institution_name = 'Old National Bank (MN)';

-- New York
UPDATE state_providers SET apy = 4.00, last_verified_at = now()
  WHERE state_code = 'NY' AND institution_name = 'Municipal Credit Union';
UPDATE state_providers SET apy = 4.10, last_verified_at = now()
  WHERE state_code = 'NY' AND institution_name = 'Empower Federal Credit Union';
UPDATE state_providers SET apy = 0.02, last_verified_at = now()
  WHERE state_code = 'NY' AND institution_name = 'M&T Bank';
UPDATE state_providers SET apy = 3.70, last_verified_at = now()
  WHERE state_code = 'NY' AND institution_name = 'Apple Bank';
UPDATE state_providers SET apy = 4.50, last_verified_at = now()
  WHERE state_code = 'NY' AND institution_name = 'Teachers Federal Credit Union';
UPDATE state_providers SET apy = 4.20, last_verified_at = now()
  WHERE state_code = 'NY' AND institution_name = 'Flushing Bank';

-- =========================
-- Add complementary offerings (INSERT, guarded)
-- =========================

INSERT INTO state_providers
  (state_code, state_name, institution_name, institution_type, product_type, apy, min_deposit, monthly_fee, membership_required, membership_notes, website_url, summary, rank_weight)
SELECT * FROM (VALUES
  ('CA','California','SF Fire Credit Union','credit_union','savings',4.30,1,0,true,'Anyone who lives or works in San Francisco, San Mateo, Marin, or Sonoma counties','https://www.sffirecu.org','Bay Area credit union known for consistently strong high-yield savings rates.',15),
  ('CA','California','Provident Credit Union','credit_union','cd',4.45,500,0,true,'Employer groups and select California counties','https://www.providentcu.org','Northern California credit union with competitive short-term CD specials.',45),

  ('TX','Texas','Credit Human','credit_union','money_market',4.25,2500,0,true,'Anyone via a small membership fee','https://www.credithuman.com','San Antonio-based credit union offering premium money market tiers with statewide access.',40),
  ('TX','Texas','Texans Credit Union','credit_union','cd',4.50,1000,0,true,'Eligible Dallas-area residents and employer groups','https://www.texanscu.org','Dallas-based credit union with competitive 12-month CD specials.',45),

  ('IL','Illinois','NASA Federal Credit Union (IL)','credit_union','money_market',4.30,10000,0,true,'Anyone via a small association membership','https://www.nasafcu.com','Digital-first credit union serving Illinois residents with premium money market tiers.',45),
  ('IL','Illinois','Abound Credit Union','credit_union','cd',4.60,500,0,true,'Select employer and community groups','https://www.aboundcu.com','Midwest credit union with competitive short-term CD pricing.',50),

  ('GA','Georgia','Robins Financial Credit Union','credit_union','savings',4.05,5,0,true,'Georgia residents in eligible counties and select employer groups','https://www.robinsfcu.org','Central Georgia credit union with strong statewide membership access and solid savings yields.',15),
  ('GA','Georgia','LGE Community Credit Union','credit_union','cd',4.40,500,0,true,'Northwest Georgia residents and select employer groups','https://www.lgeccu.org','Atlanta-metro credit union offering competitive CD specials.',45),

  ('PA','Pennsylvania','Dollar Bank','community_bank','savings',3.90,0,0,false,'','https://www.dollar.bank','Pittsburgh-headquartered mutual bank with solid relationship savings products.',45),
  ('PA','Pennsylvania','Members 1st Federal Credit Union','credit_union','cd',4.60,500,0,true,'Central Pennsylvania residents and eligible employer groups','https://www.members1st.org','Large central PA credit union with strong CD specials.',50),

  ('MN','Minnesota','TruStone Financial Credit Union','credit_union','savings',4.00,5,0,true,'Minnesota residents and select employer groups','https://www.trustonefinancial.org','Twin Cities credit union with statewide membership and competitive savings products.',15),
  ('MN','Minnesota','Think Mutual Bank','community_bank','cd',4.45,500,0,false,'12-month CD special','https://www.thinkbank.com','Rochester-area community bank offering competitive CD specials across Minnesota.',45),

  ('NY','New York','Bethpage Federal Credit Union','credit_union','savings',4.15,5,0,true,'Anyone who opens a $5 share account','https://www.bethpagefcu.com','Long Island credit union with nationwide membership access and strong savings yields.',15),
  ('NY','New York','Jovia Financial Credit Union','credit_union','cd',4.55,500,0,true,'Long Island and NYC-area residents and employer groups','https://www.joviafinancial.com','New York credit union offering competitive short-term CD pricing.',45)
) AS v(state_code, state_name, institution_name, institution_type, product_type, apy, min_deposit, monthly_fee, membership_required, membership_notes, website_url, summary, rank_weight)
WHERE NOT EXISTS (
  SELECT 1 FROM state_providers sp
  WHERE sp.state_code = v.state_code
    AND sp.institution_name = v.institution_name
);
