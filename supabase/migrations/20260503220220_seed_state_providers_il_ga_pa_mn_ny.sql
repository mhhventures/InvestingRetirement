/*
  # Seed state providers for IL, GA, PA, MN, NY

  Adds representative local banks and credit unions for five new states
  newly available in the /banks/:state directory.

  1. Data
    - 6 Illinois providers (mix of credit unions + community/regional banks)
    - 6 Georgia providers
    - 6 Pennsylvania providers
    - 6 Minnesota providers
    - 6 New York providers

  2. Notes
    1. APYs are illustrative launch values and should be refreshed monthly.
    2. No destructive operations - uses INSERT ... WHERE NOT EXISTS so the
       migration is re-runnable and will never overwrite manually-edited
       rows.
*/

INSERT INTO state_providers
  (state_code, state_name, institution_name, institution_type, product_type, apy, min_deposit, monthly_fee, membership_required, membership_notes, website_url, summary, rank_weight)
SELECT * FROM (VALUES
  -- Illinois
  ('IL','Illinois','Alliant Credit Union','credit_union','savings',4.40,1,0,true,'Open to anyone via a small charitable contribution','https://www.alliantcreditunion.org','Chicago-based digital credit union with nationwide membership access and strong savings rates.',10),
  ('IL','Illinois','BMO Harris Bank (BMO)','regional_bank','checking',0.10,0,5,false,'Fee waived with qualifying activity','https://www.bmo.com','Large Midwest regional bank headquartered in Chicago with broad branch and ATM access across Illinois.',30),
  ('IL','Illinois','Consumers Credit Union','credit_union','checking',5.00,0,0,true,'Anyone via a one-time $5 membership','https://www.myconsumers.org','Illinois credit union known for high-yield rewards checking with qualifying debit activity.',15),
  ('IL','Illinois','First Midwest Bank (Old National)','regional_bank','savings',3.75,25,0,false,'','https://www.oldnational.com','Regional bank with Illinois roots offering relationship savings and checking products.',35),
  ('IL','Illinois','Wintrust Community Banks','community_bank','cd',4.55,500,0,false,'12-month CD special','https://www.wintrust.com','Network of Illinois community banks with competitive certificate specials.',40),
  ('IL','Illinois','Selfreliance Federal Credit Union','credit_union','savings',4.10,25,0,true,'Ukrainian community and select family groups','https://www.selfreliance.com','Chicago-area credit union with solid savings yields and community focus.',25),

  -- Georgia
  ('GA','Georgia','Delta Community Credit Union','credit_union','savings',4.20,5,0,true,'Delta employees, select employer groups, and eligible Georgia residents','https://www.deltacommunitycu.com','Largest credit union in Georgia with broad membership and competitive savings and CD rates.',10),
  ('GA','Georgia','Georgia''s Own Credit Union','credit_union','savings',4.15,1,0,true,'Anyone who lives, works, or worships in eligible Georgia counties','https://www.georgiasown.org','Atlanta-based credit union with statewide presence and member-focused deposit products.',20),
  ('GA','Georgia','Truist Bank','regional_bank','checking',0.01,0,12,false,'Fee waived with $500 direct deposit','https://www.truist.com','Major southeastern regional bank with extensive Georgia branch and ATM network.',30),
  ('GA','Georgia','Ameris Bank','community_bank','savings',3.85,100,0,false,'','https://www.amerisbank.com','Georgia-headquartered community bank with broad deposit products and local service.',40),
  ('GA','Georgia','Associated Credit Union','credit_union','cd',4.50,500,0,true,'Georgia residents and select employer groups','https://www.acuonline.org','Atlanta-area credit union offering strong short-term CD specials.',25),
  ('GA','Georgia','Synovus Bank','regional_bank','money_market',4.10,10000,0,false,'Premier Money Market tier','https://www.synovus.com','Georgia-based regional bank offering premium money market rates for higher balances.',35),

  -- Pennsylvania
  ('PA','Pennsylvania','PSECU (Pennsylvania State Employees Credit Union)','credit_union','savings',4.30,5,0,true,'State employees, family members, and select employer groups','https://www.psecu.com','Pennsylvania''s largest credit union with statewide digital access and strong yields.',10),
  ('PA','Pennsylvania','Citizens Bank','regional_bank','checking',0.02,0,10,false,'Fee waived with qualifying balance','https://www.citizensbank.com','Major regional bank with dense Pennsylvania branch coverage and relationship checking.',30),
  ('PA','Pennsylvania','PNC Bank','regional_bank','savings',0.04,0,5,false,'Fee waived with qualifying activity','https://www.pnc.com','Pittsburgh-headquartered national bank with deep Pennsylvania roots and Virtual Wallet product.',35),
  ('PA','Pennsylvania','American Heritage Credit Union','credit_union','cd',4.75,500,0,true,'Select employer and community groups across Pennsylvania','https://www.americanheritagecu.org','Philadelphia-area credit union known for top-tier CD specials.',20),
  ('PA','Pennsylvania','Univest Financial','community_bank','savings',3.80,50,0,false,'','https://www.univest.net','Pennsylvania community bank offering relationship deposit accounts and local service.',40),
  ('PA','Pennsylvania','First Commonwealth Bank','community_bank','money_market',4.00,10000,0,false,'Preferred Money Market tier','https://www.fcbanking.com','Western Pennsylvania community bank with competitive money market yields.',45),

  -- Minnesota
  ('MN','Minnesota','Wings Credit Union','credit_union','savings',4.25,5,0,true,'Anyone who lives or works in Minnesota and select counties','https://www.wingscu.com','Large Minnesota credit union with strong digital tools and broad membership.',10),
  ('MN','Minnesota','U.S. Bank','regional_bank','checking',0.01,0,6.95,false,'Fee waived with qualifying direct deposit','https://www.usbank.com','Minneapolis-headquartered national bank with unmatched Minnesota branch and ATM coverage.',30),
  ('MN','Minnesota','Affinity Plus Federal Credit Union','credit_union','savings',4.10,1,0,true,'Minnesota residents and family members','https://www.affinityplus.org','Minnesota-only credit union with competitive share and checking yields.',20),
  ('MN','Minnesota','Bremer Bank','community_bank','cd',4.50,1000,0,false,'12-month CD special','https://www.bremer.com','Upper Midwest community bank with strong Minnesota presence and CD specials.',35),
  ('MN','Minnesota','Hiway Credit Union','credit_union','savings',4.15,5,0,true,'MnDOT employees, eligible community groups, and family','https://www.hiway.org','Minnesota credit union offering competitive savings yields and relationship pricing.',25),
  ('MN','Minnesota','Old National Bank (MN)','regional_bank','money_market',4.05,10000,0,false,'Premier Money Market tier','https://www.oldnational.com','Regional bank with expanded Minnesota footprint and premium money market pricing.',40),

  -- New York
  ('NY','New York','Municipal Credit Union','credit_union','savings',4.20,1,0,true,'NYC municipal employees, NY State workers, and family','https://www.nymcu.org','Long-standing New York City credit union serving public-sector employees.',10),
  ('NY','New York','Empower Federal Credit Union','credit_union','savings',4.30,5,0,true,'Upstate New York residents and select employer groups','https://www.empowerfcu.com','Upstate New York credit union with broad membership and strong deposit yields.',20),
  ('NY','New York','M&T Bank','regional_bank','checking',0.02,0,7.95,false,'Fee waived with qualifying activity','https://www.mtb.com','Buffalo-headquartered regional bank with dense branch coverage across New York.',30),
  ('NY','New York','Apple Bank','community_bank','savings',3.90,100,0,false,'','https://www.applebank.com','New York community bank with competitive savings rates and metro-area branch presence.',35),
  ('NY','New York','Teachers Federal Credit Union','credit_union','cd',4.70,500,0,true,'Anyone who lives, works, or worships in eligible New York counties','https://www.teachersfcu.org','Long Island-based credit union offering top-tier CD specials.',25),
  ('NY','New York','Flushing Bank','community_bank','money_market',4.40,25000,0,false,'Maximum Money Market tier','https://www.flushingbank.com','New York City community bank with premium money market pricing for higher balances.',40)
) AS v(state_code, state_name, institution_name, institution_type, product_type, apy, min_deposit, monthly_fee, membership_required, membership_notes, website_url, summary, rank_weight)
WHERE NOT EXISTS (
  SELECT 1 FROM state_providers sp
  WHERE sp.state_code = v.state_code
    AND sp.institution_name = v.institution_name
);
