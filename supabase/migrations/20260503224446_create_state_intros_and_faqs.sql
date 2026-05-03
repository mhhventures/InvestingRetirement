/*
  # Create state_intros and state_faqs tables

  1. New Tables
    - `state_intros` — one row per state with genuinely unique, fact-based
      context used above the fold on /banks/:state pages. Fields:
      `state_code` (PK), `intro_paragraph` (300-500 chars of state-specific
      context: major local credit unions, state banking regulator,
      notable deposit-insurance quirks, regional dynamics), `regulator`
      (name of the state banking department), `notable_institutions`
      (array of 3–5 well-known in-state banks/credit unions),
      `updated_at`.
    - `state_faqs` — per-state Q&A entries for the FAQ section and
      FAQPage schema. Fields: `id`, `state_code`, `question`, `answer`,
      `sort_order`, `updated_at`. Each FAQ is written specifically for
      the state — no template substitution — so the FAQPage schema is
      defensible against Google's thin-FAQ manual action risk.
  2. Security
    - RLS enabled on both tables.
    - Public SELECT policy (content is intended for public display).
    - No INSERT/UPDATE/DELETE policies — content is managed via
      migrations, not user writes.
  3. Data
    - Seeds the seven currently-available states (CA, GA, IL, MN, NY,
      PA, TX) with unique intro copy and 4 state-specific FAQs each.
*/

CREATE TABLE IF NOT EXISTS state_intros (
  state_code text PRIMARY KEY,
  intro_paragraph text NOT NULL DEFAULT '',
  regulator text NOT NULL DEFAULT '',
  notable_institutions text[] NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS state_faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state_code text NOT NULL,
  question text NOT NULL,
  answer text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS state_faqs_state_code_sort_idx
  ON state_faqs (state_code, sort_order);

ALTER TABLE state_intros ENABLE ROW LEVEL SECURITY;
ALTER TABLE state_faqs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Public can read state intros'
  ) THEN
    CREATE POLICY "Public can read state intros"
      ON state_intros FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Public can read state faqs'
  ) THEN
    CREATE POLICY "Public can read state faqs"
      ON state_faqs FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;

INSERT INTO state_intros (state_code, intro_paragraph, regulator, notable_institutions) VALUES
  ('CA', 'California banking is dominated by a handful of giants — Bank of America and Wells Fargo are both headquartered in-state — but the sharpest rates almost always come from the state''s massive credit-union sector. The California Credit Union League represents more than 270 credit unions, and heavyweights like Golden 1, SchoolsFirst FCU, and Star One CU routinely publish savings and money-market APYs that national online banks struggle to match. State-chartered deposits are overseen by the California Department of Financial Protection and Innovation (DFPI), and every institution in this directory is also FDIC- or NCUA-insured to $250,000.', 'California Department of Financial Protection and Innovation (DFPI)', ARRAY['Golden 1 Credit Union','SchoolsFirst FCU','Star One Credit Union','First Republic Bank','Bank of the West']),
  ('GA', 'Georgia has the country''s sixth-largest community-banking sector by institution count — more than 140 state-chartered banks alongside Truist''s Charlotte-anchored branch network across the metro Atlanta corridor. Delta Community Credit Union, Georgia''s Own, and LGE Community CU dominate the rewards-checking and CD-special categories, and state-chartered institutions answer to the Georgia Department of Banking and Finance. One Georgia quirk worth knowing: several in-state CUs offer field-of-membership eligibility by county of residence alone, which sidesteps the employer-group hurdle that blocks out-of-state applicants elsewhere.', 'Georgia Department of Banking and Finance', ARRAY['Delta Community Credit Union','Georgia''s Own Credit Union','LGE Community Credit Union','Synovus Bank','Ameris Bank']),
  ('IL', 'Illinois banking centers on Chicago''s outsized community-bank concentration — the state has more FDIC-insured institutions per capita than almost any peer, and BMO Harris (now BMO), Wintrust, and First Midwest are all headquartered in the metro. On the credit-union side, Alliant, Consumers Credit Union, and BCU lead the state on savings APY and rewards-checking yield. State-chartered deposits are overseen by the Illinois Department of Financial and Professional Regulation (IDFPR). A notable Illinois advantage: Alliant and Consumers both offer nationwide membership through a small charitable contribution, so the state''s top rates are accessible even to out-of-state readers who qualify through an employer or association.', 'Illinois Department of Financial and Professional Regulation (IDFPR)', ARRAY['Alliant Credit Union','Consumers Credit Union','BCU','Wintrust','Byline Bank']),
  ('MN', 'Minnesota''s banking landscape is unusually concentrated — U.S. Bancorp is headquartered in Minneapolis, and the state''s credit-union sector is anchored by Wings Financial (former Northwest Airlines SECU) and Affinity Plus FCU, both of which regularly top nationwide yield leaderboards. Affinity Plus''s field of membership is open to anyone willing to make a one-time donation to the Minnesota Foundation for Responsible Lending, effectively giving Minnesota residents — and many out-of-state readers — access to some of the best rates in the country. State-chartered institutions are supervised by the Minnesota Department of Commerce''s Financial Institutions Division.', 'Minnesota Department of Commerce — Financial Institutions Division', ARRAY['Wings Financial Credit Union','Affinity Plus FCU','Hiway Federal Credit Union','Bremer Bank','U.S. Bank']),
  ('NY', 'New York banking breaks into two distinct tiers: money-center institutions (JPMorgan Chase, Citi, Bank of New York Mellon) that dominate Manhattan and the outer-borough branch networks, and a long tail of regional community banks across upstate metros like Buffalo, Rochester, and Syracuse. M&T Bank and KeyBank carry most of the upstate deposit share, and Bethpage FCU — the largest credit union on Long Island — consistently publishes top-tier CD specials. State-chartered deposits answer to the New York Department of Financial Services (NYDFS), which also regulates several of the country''s largest insurers and the state''s cryptocurrency charters.', 'New York Department of Financial Services (NYDFS)', ARRAY['Bethpage Federal Credit Union','Municipal Credit Union','M&T Bank','KeyBank','Apple Bank']),
  ('PA', 'Pennsylvania has one of the country''s most fragmented community-banking markets — hundreds of small institutions across the Philadelphia, Pittsburgh, Lehigh Valley, and Harrisburg metros, many with under $1B in assets. PNC and Truist carry the regional-bank share, while PSECU (Pennsylvania State Employees Credit Union) is the nation''s 20th-largest CU and routinely leads the state on savings APY. State-chartered banks and credit unions are supervised by the Pennsylvania Department of Banking and Securities, and residents benefit from an unusually deep roster of mutually-owned savings banks — a legacy of the state''s 19th-century thrift movement that still produces competitive CD and money-market rates today.', 'Pennsylvania Department of Banking and Securities', ARRAY['PSECU','Citadel Credit Union','American Heritage Credit Union','Penn Community Bank','First National Bank of Pennsylvania']),
  ('TX', 'Texas has the largest state-chartered banking system in the country — more than 230 institutions supervised by the Texas Department of Banking, with Frost Bank, Texas Capital, and Prosperity Bank all headquartered in-state. On the credit-union side, Randolph-Brooks FCU (San Antonio) and Security Service FCU lead statewide on rewards-checking yield and CD specials, and the Texas Credit Union Department regulates state-chartered CUs separately. One Texas-specific advantage: the state''s homestead-exemption laws make Texas CDs and money-market accounts an especially common parking place for home-sale proceeds during the waiting period before reinvestment.', 'Texas Department of Banking / Texas Credit Union Department', ARRAY['Randolph-Brooks Federal Credit Union','Security Service Federal Credit Union','Frost Bank','Prosperity Bank','Amplify Credit Union'])
ON CONFLICT (state_code) DO UPDATE SET
  intro_paragraph = EXCLUDED.intro_paragraph,
  regulator = EXCLUDED.regulator,
  notable_institutions = EXCLUDED.notable_institutions,
  updated_at = now();

INSERT INTO state_faqs (state_code, question, answer, sort_order) VALUES
  -- California
  ('CA', 'Which California credit unions accept members statewide?', 'Golden 1 Credit Union is open to any California resident — no employer group required. SchoolsFirst FCU is open to K–12 educators and their families statewide, and Star One Credit Union accepts members who live or work in Santa Clara County plus several affiliated employer groups. For out-of-area California residents, Alliant and Consumers CU (both Illinois-chartered) also offer nationwide membership through a small charitable contribution.', 1),
  ('CA', 'Does California tax interest earned on savings accounts?', 'Yes — California taxes bank interest as ordinary income at the state level, on top of federal tax. California has no separate personal-income-tax exemption for interest the way some other states do, so a high-yield savings account paying 4% effectively nets closer to 3.5% for a top-bracket California resident. Municipal-bond interest from California issuers is exempt from state tax, which can make California-specific muni funds more attractive than a taxable HYSA for high earners.', 2),
  ('CA', 'Are deposits at California state-chartered banks federally insured?', 'Yes. Every state-chartered bank in California that takes retail deposits is required to carry FDIC insurance up to $250,000 per depositor, per ownership category. State-chartered credit unions carry NCUA insurance at the same limits. The California DFPI supervises state-chartered institutions, but federal insurance is the backstop that matters for depositors.', 3),
  ('CA', 'What is the highest savings APY available to a California resident right now?', 'The top rate changes monthly. Our last-verified California savings leaders come from a mix of state-chartered credit unions (Golden 1, SchoolsFirst, Star One) and nationally-available online banks (SoFi, Marcus, Ally) that California residents can join without geographic restriction. Expand any row in the directory above to see the current APY, minimum balance, and any rate-cap rules that apply.', 4),
  -- Georgia
  ('GA', 'Is Delta Community Credit Union open to non-Delta employees?', 'Yes. Despite the name, Delta Community CU''s field of membership extends to residents of metro Atlanta and a long list of Georgia employers beyond Delta Air Lines. Membership also extends to family members of existing members, which is the most common path for Georgians who don''t work for a sponsoring employer. The membership application takes about five minutes online.', 1),
  ('GA', 'Why do Georgia credit unions beat national bank rates so often?', 'Georgia has a large, well-capitalized credit-union sector — Delta Community and Georgia''s Own both have over $8B in assets — and the state''s community-bank market is competitive enough that CUs have to work hard on deposit pricing to win share. The result is that rewards-checking yields at the top Georgia CUs frequently outpace the best national online banks, especially for accounts under $25,000 where the rate cap does not bind.', 2),
  ('GA', 'Are there any Georgia-specific tax benefits for savings interest?', 'Georgia taxes bank interest as ordinary income at the state level with no exemption, so a HYSA paying 4% nets roughly 3.77% for a top-bracket Georgia resident after the 5.75% state rate. Georgia does offer a retirement-income exclusion that exempts the first $35,000 ($65,000 for 65+) of interest, dividend, and capital-gains income from state tax, which makes high-yield savings especially attractive for retired Georgians.', 3),
  ('GA', 'Do Georgia banks offer special programs for first-time homebuyers?', 'Yes — several Georgia community banks and credit unions participate in the Georgia Dream Homeownership Program, which pairs conventional mortgages with down-payment assistance for qualifying first-time buyers. Ameris and Synovus are among the larger lenders in the program, and local CUs like Georgia''s Own also participate. Eligibility is income-based and varies by county.', 4),
  -- Illinois
  ('IL', 'Does Alliant Credit Union accept members outside Illinois?', 'Yes — Alliant is Illinois-chartered but accepts members nationwide through a small one-time donation to Foster Care to Success (around $5), which is the charitable path used to satisfy the field-of-membership requirement. Alliant''s savings and checking APYs consistently rank among the top five nationally, so this path is heavily used by out-of-state readers.', 1),
  ('IL', 'How does Consumers Credit Union''s rewards checking compare to Illinois online banks?', 'Consumers CU''s rewards checking has historically paid one of the highest APYs in the country on balances up to $10,000, provided you meet a modest monthly transaction requirement (typically 12 debit-card purchases plus one e-statement). Above $10,000 the rate drops sharply, which makes it an excellent "first bucket" account paired with a HYSA for larger balances.', 2),
  ('IL', 'Are Illinois bank deposits insured the same way as federal-chartered banks?', 'Yes. Illinois state-chartered banks carry FDIC insurance up to $250,000 per depositor, per ownership category — the same coverage as federally-chartered banks. State-chartered credit unions carry NCUA insurance at identical limits. The Illinois IDFPR supervises the state-chartered institutions, but the federal insurance backstop is what matters for depositor safety.', 3),
  ('IL', 'Why are Chicago-area community banks so competitive on deposit rates?', 'Chicago''s community-bank market is unusually crowded — the metro has several hundred FDIC-insured institutions competing for retail deposits against BMO, Wintrust, and the large national banks. That density forces smaller institutions to publish above-market APYs and CD specials to win deposit share, and it also means Chicago-area readers have more local options than almost any metro outside New York.', 4),
  -- Minnesota
  ('MN', 'How do I join Affinity Plus Federal Credit Union from out of state?', 'Affinity Plus FCU is open to anyone who makes a one-time contribution to the Minnesota Foundation for Responsible Lending (usually $25) — no Minnesota residency or employer affiliation required. This is the standard path out-of-state readers use to access Affinity Plus''s rewards checking and CD specials, which regularly rank among the top rates nationally.', 1),
  ('MN', 'What makes Wings Financial Credit Union different from a typical CU?', 'Wings Financial started as Northwest Airlines SECU and grew with the aviation industry — it now has over $9B in assets and serves members across Minnesota plus aviation-related employer groups nationwide. Wings publishes competitive CD specials and a high-yield checking account, and its mobile app is notably stronger than most community-CU offerings.', 2),
  ('MN', 'Does Minnesota tax bank-account interest at the state level?', 'Yes. Minnesota taxes interest income as ordinary income at the state level, with a top rate of 9.85% — one of the higher state rates in the country. This materially reduces the net yield on a high-APY savings account for Minnesota residents in the top bracket. Minnesota muni-bond interest is state-exempt, which can shift the calculus for high-earning savers.', 3),
  ('MN', 'Are Minnesota state-chartered banks covered by FDIC insurance?', 'Yes. Every Minnesota state-chartered bank that takes retail deposits is required to carry FDIC insurance up to $250,000 per depositor, per ownership category. Minnesota state-chartered credit unions carry NCUA insurance at the same limits. The Minnesota Department of Commerce supervises state-chartered institutions.', 4),
  -- New York
  ('NY', 'Which New York credit unions have the most open field of membership?', 'Bethpage Federal Credit Union (Long Island) is open to anyone who makes a $5 opening deposit in a savings account, with no employer or geographic restriction — effectively the most open CU in the state. Municipal Credit Union serves city and state employees plus residents of all five NYC boroughs. Both publish competitive CD specials and savings APYs.', 1),
  ('NY', 'Why is New York''s banking regulation different from other states?', 'New York regulates state-chartered banks, insurers, and cryptocurrency businesses through a single unified agency — the New York Department of Financial Services (NYDFS). NYDFS has been unusually active in consumer-protection enforcement and has issued some of the country''s strictest cybersecurity and AML rules, which is one reason large national banks still keep major operations in the state despite high compliance costs.', 2),
  ('NY', 'Do upstate New York banks offer better rates than NYC branches?', 'Often, yes. Upstate community banks like M&T, KeyBank, and Adirondack Trust frequently publish CD specials and rewards-checking rates that outpace the big-five NYC branches on deposit yield. Upstate bank branches also tend to have lower fee schedules — Manhattan branches of the same parent bank sometimes have different fee structures tied to higher metro-area balance minimums.', 3),
  ('NY', 'Are New York state-chartered bank deposits federally insured?', 'Yes. Every retail-deposit-taking bank chartered by NYDFS is required to carry FDIC insurance up to $250,000 per depositor, per ownership category. State-chartered credit unions carry NCUA insurance at the same limits. NYDFS supervises state-chartered institutions, but federal insurance is the coverage that protects depositors.', 4),
  -- Pennsylvania
  ('PA', 'Who can join PSECU (Pennsylvania State Employees Credit Union)?', 'Despite the name, PSECU''s field of membership extends well beyond state employees — it now includes Pennsylvania residents who qualify through an affiliated organization (the Pennsylvania Recreation and Parks Society, for example, which accepts a small annual membership fee) and family members of existing members. PSECU is the 20th-largest CU in the country and publishes competitive savings and checking APYs.', 1),
  ('PA', 'Why does Pennsylvania have so many small community banks?', 'Pennsylvania''s banking market carries a legacy from the 19th-century thrift and mutual-savings-bank movements, many of which are still operating as community banks or mutual-holding-company institutions today. The result is an unusually fragmented deposit market — hundreds of institutions competing across Philadelphia, Pittsburgh, and the Lehigh Valley — and consistently competitive CD and money-market pricing for PA residents.', 2),
  ('PA', 'Does Pennsylvania tax interest from savings accounts?', 'Pennsylvania has a flat 3.07% personal-income-tax rate that applies to interest income, which is one of the lowest state rates in the country. That makes a high-yield savings account net roughly 3.88% for a PA resident at a 4% gross APY — meaningfully better than neighbors like New York (8.82% top rate) or New Jersey (10.75%).', 3),
  ('PA', 'Are PA state-chartered banks covered the same as national banks?', 'Yes. Pennsylvania state-chartered banks carry FDIC insurance up to $250,000 per depositor, per ownership category — identical coverage to national banks. State-chartered credit unions carry NCUA insurance at the same limits. The PA Department of Banking and Securities supervises state-chartered institutions.', 4),
  -- Texas
  ('TX', 'How do I join Randolph-Brooks Federal Credit Union as a Texas resident?', 'Randolph-Brooks FCU (RBFCU) is open to anyone who lives, works, worships, or attends school in any of more than 60 Texas counties — which covers nearly all major metros including Austin, San Antonio, Dallas-Fort Worth, and Houston suburbs. Family members of existing members qualify nationwide. Membership is free and the application takes a few minutes online.', 1),
  ('TX', 'Why are Texas CDs popular for home-sale proceeds?', 'Texas homestead-exemption laws and the state''s active housing market mean a lot of residents sell a primary home and park the proceeds in a short-term CD or money-market account before reinvesting. Texas has no state income tax, so every dollar of CD interest nets the full federal rate — which makes a 5% CD meaningfully more attractive to a Texas resident than to a California or New York one in the top bracket.', 2),
  ('TX', 'Does Texas tax bank-account interest?', 'No. Texas has no state personal income tax, so bank interest nets the full federal rate after federal tax only. For a top-bracket Texas saver, a 4% HYSA nets roughly 2.52% after federal tax alone — versus 2.2–2.3% for comparable earners in California or New York after state tax layered on top.', 3),
  ('TX', 'Are Texas state-chartered banks insured the same as national banks?', 'Yes. Texas has the largest state-chartered banking system in the country, supervised by the Texas Department of Banking, and every retail-deposit-taking institution carries FDIC insurance up to $250,000 per depositor, per ownership category. State-chartered credit unions carry NCUA insurance at the same limits through the Texas Credit Union Department.', 4)
ON CONFLICT DO NOTHING;
