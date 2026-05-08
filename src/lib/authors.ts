// Editorial author for E-E-A-T signals on reviews and guides.
// Used by Article / Review JSON-LD and visible bylines across the site.

export type Author = {
  slug: string;
  name: string;
  title: string;
  credentials: string;
  bio: string;
  avatarInitials: string;
  avatarColor: string;
  linkedin?: string;
  expertise: string[];
  yearsExperience: number;
};

// Single contributor: Michael Hewitt, Founder & Editor-in-Chief.
// All content on the site is written and edited by Michael.
const michael: Author = {
  slug: "michael-hewitt",
  name: "Michael Hewitt",
  title: "Founder & Editor-in-Chief",
  credentials: "Founder & Editor-in-Chief",
  bio: "Michael Hewitt is the founder and editor-in-chief of Investing and Retirement. He personally researches, tests, and writes every review and guide on the site, opening accounts, running numbers, and comparing disclosures so readers get a clear, honest, and independent take on the financial products they're considering.",
  avatarInitials: "MH",
  avatarColor: "#0e4d45",
  linkedin: "https://www.linkedin.com/in/michaelhhewitt/",
  expertise: ["Banking", "Investing", "Retirement", "Personal Finance"],
  yearsExperience: 10,
};

export const authors: Record<string, Author> = {
  "michael-hewitt": michael,
  // Legacy slugs kept as aliases so any existing references still resolve to Michael.
  "editorial-team": michael,
  "sarah-chen": michael,
  "marcus-reed": michael,
  "priya-patel": michael,
};

// Every category currently maps to Michael, the sole contributor.
export function getAuthorForCategory(_category: string): Author {
  return michael;
}
