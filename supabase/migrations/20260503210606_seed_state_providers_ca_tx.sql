/*
  # Seed state providers for CA and TX

  Seeds representative local institutions for California and Texas to
  validate the /banks/$state directory page shape.

  1. Data
    - 6 California providers (mix of credit unions + community banks)
    - 6 Texas providers (mix of credit unions + community banks)

  2. Notes
    1. APYs are illustrative launch values and should be refreshed monthly.
    2. No destructive operations - uses INSERT with ON CONFLICT DO NOTHING
       via a WHERE NOT EXISTS guard to stay re-runnable.
*/

INSERT INTO state_providers
  (state_code, state_name, institution_name, institution_type, product_type, apy, min_deposit, monthly_fee, membership_required, membership_notes, website_url, summary, rank_weight)
SELECT * FROM (VALUES
  ('CA','California','Golden 1 Credit Union','credit_union','savings',4.50,1,0,true,'Open to California residents and select employer groups','https://www.golden1.com','One of the largest state-chartered credit unions in California with statewide branch access and broad membership eligibility.',10),
  ('CA','California','SchoolsFirst Federal Credit Union','credit_union','savings',4.25,25,0,true,'Educators, school employees, and family members','https://www.schoolsfirstfcu.org','Top credit union for California school employees with strong savings ladders and checking rewards.',20),
  ('CA','California','First Republic Successor / City National Bank','regional_bank','checking',0.15,500,0,false,'','https://www.cnb.com','Relationship-focused regional bank serving California professionals and business owners.',30),
  ('CA','California','Bank of Marin','community_bank','savings',3.75,100,0,false,'','https://www.bankofmarin.com','Bay Area community bank focused on small business and personal deposits.',40),
  ('CA','California','Patelco Credit Union','credit_union','savings',4.35,1,0,true,'Anyone who lives, works, or worships in eligible California counties','https://www.patelco.org','Bay Area credit union with broad field of membership and competitive share rates.',25),
  ('CA','California','Mechanics Bank','community_bank','cd',4.60,1000,0,false,'12-month CD rate','https://www.mechanicsbank.com','California community bank offering competitive short-term CD specials.',50),
  ('TX','Texas','Randolph-Brooks Federal Credit Union','credit_union','savings',4.00,1,0,true,'Residents of eligible Texas counties and their families','https://www.rbfcu.org','One of Texas largest credit unions with wide membership and strong savings products.',10),
  ('TX','Texas','University Federal Credit Union','credit_union','savings',4.15,5,0,true,'Austin-area residents, UT affiliates, and select employer groups','https://www.ufcu.org','Austin-based credit union with competitive share rates and statewide ATM network.',20),
  ('TX','Texas','Frost Bank','regional_bank','checking',0.02,0,0,false,'','https://www.frostbank.com','Texas-only regional bank known for high-touch service and no-fee checking.',30),
  ('TX','Texas','Texas Capital Bank','regional_bank','money_market',4.40,25000,0,false,'Premier Money Market tier','https://www.texascapitalbank.com','Statewide regional bank with premium money market rates for higher balances.',35),
  ('TX','Texas','Amplify Credit Union','credit_union','savings',4.10,1,0,true,'Anyone can join via a small one-time fee','https://www.goamplify.com','Austin-based digital-first credit union with nationwide membership access.',25),
  ('TX','Texas','Prosperity Bank','community_bank','savings',3.50,100,5,false,'Fee waived with $1,500 balance','https://www.prosperitybankusa.com','Texas community bank with branches across the state and solid core savings products.',50)
) AS v(state_code, state_name, institution_name, institution_type, product_type, apy, min_deposit, monthly_fee, membership_required, membership_notes, website_url, summary, rank_weight)
WHERE NOT EXISTS (
  SELECT 1 FROM state_providers sp
  WHERE sp.state_code = v.state_code
    AND sp.institution_name = v.institution_name
);
