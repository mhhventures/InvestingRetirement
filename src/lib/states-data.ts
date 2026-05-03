export type StateInfo = {
  code: string;
  name: string;
  slug: string;
  available: boolean;
};

export const US_STATES: StateInfo[] = [
  { code: "AL", name: "Alabama", slug: "alabama", available: false },
  { code: "AK", name: "Alaska", slug: "alaska", available: false },
  { code: "AZ", name: "Arizona", slug: "arizona", available: false },
  { code: "AR", name: "Arkansas", slug: "arkansas", available: false },
  { code: "CA", name: "California", slug: "california", available: true },
  { code: "CO", name: "Colorado", slug: "colorado", available: false },
  { code: "CT", name: "Connecticut", slug: "connecticut", available: false },
  { code: "DE", name: "Delaware", slug: "delaware", available: false },
  { code: "FL", name: "Florida", slug: "florida", available: false },
  { code: "GA", name: "Georgia", slug: "georgia", available: true },
  { code: "HI", name: "Hawaii", slug: "hawaii", available: false },
  { code: "ID", name: "Idaho", slug: "idaho", available: false },
  { code: "IL", name: "Illinois", slug: "illinois", available: true },
  { code: "IN", name: "Indiana", slug: "indiana", available: false },
  { code: "IA", name: "Iowa", slug: "iowa", available: false },
  { code: "KS", name: "Kansas", slug: "kansas", available: false },
  { code: "KY", name: "Kentucky", slug: "kentucky", available: false },
  { code: "LA", name: "Louisiana", slug: "louisiana", available: false },
  { code: "ME", name: "Maine", slug: "maine", available: false },
  { code: "MD", name: "Maryland", slug: "maryland", available: false },
  { code: "MA", name: "Massachusetts", slug: "massachusetts", available: false },
  { code: "MI", name: "Michigan", slug: "michigan", available: false },
  { code: "MN", name: "Minnesota", slug: "minnesota", available: true },
  { code: "MS", name: "Mississippi", slug: "mississippi", available: false },
  { code: "MO", name: "Missouri", slug: "missouri", available: false },
  { code: "MT", name: "Montana", slug: "montana", available: false },
  { code: "NE", name: "Nebraska", slug: "nebraska", available: false },
  { code: "NV", name: "Nevada", slug: "nevada", available: false },
  { code: "NH", name: "New Hampshire", slug: "new-hampshire", available: false },
  { code: "NJ", name: "New Jersey", slug: "new-jersey", available: false },
  { code: "NM", name: "New Mexico", slug: "new-mexico", available: false },
  { code: "NY", name: "New York", slug: "new-york", available: true },
  { code: "NC", name: "North Carolina", slug: "north-carolina", available: false },
  { code: "ND", name: "North Dakota", slug: "north-dakota", available: false },
  { code: "OH", name: "Ohio", slug: "ohio", available: false },
  { code: "OK", name: "Oklahoma", slug: "oklahoma", available: false },
  { code: "OR", name: "Oregon", slug: "oregon", available: false },
  { code: "PA", name: "Pennsylvania", slug: "pennsylvania", available: true },
  { code: "RI", name: "Rhode Island", slug: "rhode-island", available: false },
  { code: "SC", name: "South Carolina", slug: "south-carolina", available: false },
  { code: "SD", name: "South Dakota", slug: "south-dakota", available: false },
  { code: "TN", name: "Tennessee", slug: "tennessee", available: false },
  { code: "TX", name: "Texas", slug: "texas", available: true },
  { code: "UT", name: "Utah", slug: "utah", available: false },
  { code: "VT", name: "Vermont", slug: "vermont", available: false },
  { code: "VA", name: "Virginia", slug: "virginia", available: false },
  { code: "WA", name: "Washington", slug: "washington", available: false },
  { code: "WV", name: "West Virginia", slug: "west-virginia", available: false },
  { code: "WI", name: "Wisconsin", slug: "wisconsin", available: false },
  { code: "WY", name: "Wyoming", slug: "wyoming", available: false },
];

export function findStateBySlug(slug: string): StateInfo | undefined {
  return US_STATES.find((s) => s.slug === slug.toLowerCase());
}

export const INSTITUTION_TYPE_LABEL: Record<string, string> = {
  credit_union: "Credit Union",
  community_bank: "Community Bank",
  state_bank: "State Bank",
  regional_bank: "Regional Bank",
};

export const PRODUCT_TYPE_LABEL: Record<string, string> = {
  savings: "Savings",
  checking: "Checking",
  cd: "CD",
  money_market: "Money Market",
};

// Popular cities per state — powers local SEO anchors and "banks near me in X"
// copy on the state pages.
export const STATE_CITIES: Record<string, string[]> = {
  CA: [
    "Los Angeles",
    "San Diego",
    "San Jose",
    "San Francisco",
    "Fresno",
    "Sacramento",
    "Long Beach",
    "Oakland",
    "Bakersfield",
    "Anaheim",
  ],
  TX: [
    "Houston",
    "San Antonio",
    "Dallas",
    "Austin",
    "Fort Worth",
    "El Paso",
    "Arlington",
    "Corpus Christi",
    "Plano",
    "Lubbock",
  ],
  IL: [
    "Chicago",
    "Aurora",
    "Naperville",
    "Joliet",
    "Rockford",
    "Springfield",
    "Elgin",
    "Peoria",
    "Champaign",
    "Waukegan",
  ],
  GA: [
    "Atlanta",
    "Augusta",
    "Columbus",
    "Savannah",
    "Athens",
    "Sandy Springs",
    "Macon",
    "Roswell",
    "Johns Creek",
    "Albany",
  ],
  PA: [
    "Philadelphia",
    "Pittsburgh",
    "Allentown",
    "Erie",
    "Reading",
    "Scranton",
    "Bethlehem",
    "Lancaster",
    "Harrisburg",
    "York",
  ],
  MN: [
    "Minneapolis",
    "Saint Paul",
    "Rochester",
    "Duluth",
    "Bloomington",
    "Brooklyn Park",
    "Plymouth",
    "Woodbury",
    "Maple Grove",
    "Eagan",
  ],
  NY: [
    "New York City",
    "Buffalo",
    "Rochester",
    "Yonkers",
    "Syracuse",
    "Albany",
    "New Rochelle",
    "Mount Vernon",
    "Schenectady",
    "Utica",
  ],
};

// Approximate population + household figures used in intro copy and schema.
// These do not need to be exact — they orient the reader and improve topical
// relevance for long-tail queries like "banks in california population".
export const STATE_FACTS: Record<
  string,
  { population: string; households: string; fdicBanks: string; creditUnions: string }
> = {
  CA: {
    population: "39 million",
    households: "13.2 million",
    fdicBanks: "120+",
    creditUnions: "270+",
  },
  TX: {
    population: "30 million",
    households: "10.5 million",
    fdicBanks: "380+",
    creditUnions: "440+",
  },
  IL: {
    population: "12.5 million",
    households: "4.9 million",
    fdicBanks: "370+",
    creditUnions: "220+",
  },
  GA: {
    population: "11 million",
    households: "4.0 million",
    fdicBanks: "150+",
    creditUnions: "110+",
  },
  PA: {
    population: "13 million",
    households: "5.2 million",
    fdicBanks: "140+",
    creditUnions: "340+",
  },
  MN: {
    population: "5.7 million",
    households: "2.3 million",
    fdicBanks: "260+",
    creditUnions: "100+",
  },
  NY: {
    population: "19.5 million",
    households: "7.4 million",
    fdicBanks: "120+",
    creditUnions: "340+",
  },
};

// Related states to cross-link for internal linking. Only include slugs of
// currently-available state pages.
export const RELATED_STATES: Record<string, string[]> = {
  CA: ["texas", "new-york", "illinois"],
  TX: ["california", "georgia", "illinois"],
  IL: ["new-york", "pennsylvania", "minnesota"],
  GA: ["texas", "pennsylvania", "new-york"],
  PA: ["new-york", "illinois", "georgia"],
  MN: ["illinois", "pennsylvania", "new-york"],
  NY: ["pennsylvania", "illinois", "california"],
};

export function getStateCities(code: string): string[] {
  return STATE_CITIES[code] || [];
}

export function citySlug(city: string): string {
  return city
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function findStateCity(
  stateCode: string,
  slug: string,
): string | undefined {
  const target = slug.toLowerCase();
  return (STATE_CITIES[stateCode] || []).find((c) => citySlug(c) === target);
}

export function getStateFacts(code: string) {
  return (
    STATE_FACTS[code] || {
      population: "",
      households: "",
      fdicBanks: "",
      creditUnions: "",
    }
  );
}

export function getRelatedStates(code: string): StateInfo[] {
  const slugs = RELATED_STATES[code] || [];
  return slugs
    .map((slug) => US_STATES.find((s) => s.slug === slug))
    .filter((s): s is StateInfo => !!s && s.available);
}

export type StateProvider = {
  id: string;
  state_code: string;
  state_name: string;
  institution_name: string;
  institution_type: string;
  product_type: string;
  apy: number;
  min_deposit: number;
  monthly_fee: number;
  membership_required: boolean;
  membership_notes: string;
  fdic_ncua_id: string;
  website_url: string;
  summary: string;
  rank_weight: number;
  last_verified_at: string;
};
