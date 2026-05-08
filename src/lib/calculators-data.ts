export type Calculator = {
  slug: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  available: boolean;
};

export const calculators: Calculator[] = [
  {
    slug: "bank-deposit-matcher",
    title: "Bank Deposit Matcher",
    description:
      "Answer a few quick questions and see high-yield savings and checking offers matched to your deposit size and location. No redirect, results render inline.",
    category: "Saving",
    icon: "🏦",
    available: true,
  },
  {
    slug: "compound-interest",
    title: "Compound Interest Calculator",
    description:
      "See how your money grows over time with compounding. Factor in initial deposit, monthly contributions, interest rate, and time horizon.",
    category: "Investing",
    icon: "📈",
    available: true,
  },
  {
    slug: "retirement",
    title: "Retirement Calculator",
    description:
      "Estimate how much you'll need to retire and whether you're on track based on your current savings and contributions.",
    category: "Retirement",
    icon: "🏖️",
    available: false,
  },
  {
    slug: "mortgage",
    title: "Mortgage Calculator",
    description:
      "Calculate your monthly mortgage payment, total interest paid, and amortization schedule.",
    category: "Home",
    icon: "🏠",
    available: false,
  },
  {
    slug: "savings-goal",
    title: "Savings Goal Calculator",
    description:
      "Find out how much you need to save each month to hit a specific financial goal by a target date.",
    category: "Saving",
    icon: "🎯",
    available: false,
  },
  {
    slug: "debt-payoff",
    title: "Debt Payoff Calculator",
    description:
      "Plan your path to debt-free. Compare avalanche vs snowball methods and see your payoff timeline.",
    category: "Credit",
    icon: "💳",
    available: false,
  },
  {
    slug: "emergency-fund",
    title: "Emergency Fund Calculator",
    description:
      "Determine the ideal size of your emergency fund based on your monthly expenses and risk profile.",
    category: "Saving",
    icon: "🛟",
    available: false,
  },
];
