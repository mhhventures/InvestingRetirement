import { createFileRoute, Link, useParams, Navigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { calculators } from "@/lib/calculators-data";
import { useSeo } from "@/lib/seo";
import { products } from "@/data/products";
import { withUtm } from "@/lib/affiliate";
import { getProductLogoUrl } from "@/lib/product-icons";

export const Route = createFileRoute("/calculators/$calcId" as any)({
  component: CalculatorPage,
});

function CalculatorPage() {
  const { calcId } = useParams({ from: "/calculators/$calcId" as any }) as { calcId: string };
  const calc = calculators.find((c) => c.slug === calcId);

  if (!calc || !calc.available) {
    return <Navigate to={"/calculators" as any} />;
  }

  return (
    <div className="bg-[#fef6f1] min-h-screen overflow-x-hidden">
      <section className="border-b border-[#e4d9cf]">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
          <a
            href="/calculators"
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0e4d45] mb-3 inline-block hover:underline"
          >
            ← All Calculators
          </a>
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold leading-[1.05] text-black mb-2">
              {calc.title}
            </h1>
            <p className="text-sm text-[#1a1a1a] leading-relaxed max-w-2xl">
              {calc.description}
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
        {calc.slug === "compound-interest" && <CompoundInterestCalculator />}
      </div>
    </div>
  );
}

function formatCurrency(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

type RateMode = "hysa" | "investing" | "custom";

const RATE_PRESETS: Record<Exclude<RateMode, "custom">, { label: string; defaultRate: number; min: number; max: number; description: string }> = {
  hysa: {
    label: "HYSA",
    defaultRate: 4.0,
    min: 3.5,
    max: 5.0,
    description: "High-yield savings accounts currently offer 3.5%–5% APY. FDIC-insured, no market risk.",
  },
  investing: {
    label: "Investing",
    defaultRate: 9.0,
    min: 6.0,
    max: 12.0,
    description: "Long-term stock market average is ~8–10% annually. Higher potential returns with market risk and volatility.",
  },
};

function CompoundInterestCalculator() {
  useSeo({
    title: "Compound Interest Calculator | HYSA vs Investing Growth",
    description:
      "Calculate how your savings grow with compound interest. Compare HYSA and investing returns with compatible account offerings.",
    path: "/calculators/compound-interest",
  });

  const [initial, setInitial] = useState(10000);
  const [monthly, setMonthly] = useState(500);
  const [mode, setMode] = useState<RateMode>("hysa");
  const [rate, setRate] = useState(4.0);
  const [years, setYears] = useState(20);
  const [compounds, setCompounds] = useState(12);

  function selectMode(m: RateMode) {
    setMode(m);
    if (m !== "custom") {
      setRate(RATE_PRESETS[m].defaultRate);
    }
  }

  const { schedule, totalContributed, finalBalance, totalInterest } = useMemo(() => {
    const r = rate / 100;
    const n = compounds;
    const rows: { year: number; balance: number; contributed: number; interest: number }[] = [];
    let balance = initial;
    let contributed = initial;

    for (let y = 1; y <= years; y++) {
      for (let p = 0; p < n; p++) {
        balance = balance * (1 + r / n);
        const perPeriod = (monthly * 12) / n;
        balance += perPeriod;
        contributed += perPeriod;
      }
      rows.push({
        year: y,
        balance,
        contributed,
        interest: balance - contributed,
      });
    }

    return {
      schedule: rows,
      totalContributed: contributed,
      finalBalance: balance,
      totalInterest: balance - contributed,
    };
  }, [initial, monthly, rate, years, compounds]);

  return (
    <div className="grid md:grid-cols-[320px_1fr] gap-4 md:gap-6 min-w-0">
      {/* Inputs */}
      <div className="bg-white border border-[#e4d9cf] rounded p-3 sm:p-4 md:p-5 h-fit min-w-0">
        <h2 className="font-serif text-lg font-bold text-black mb-4">Inputs</h2>
        <div className="space-y-4">
          <NumberField
            label="Initial deposit"
            value={initial}
            onChange={setInitial}
            prefix="$"
            min={0}
            step={500}
          />
          <NumberField
            label="Monthly contribution"
            value={monthly}
            onChange={setMonthly}
            prefix="$"
            min={0}
            step={50}
          />

          {/* Rate mode toggle */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#0e4d45] mb-1.5">
              Return type
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-[#f3ece5] rounded">
              {(["hysa", "investing", "custom"] as RateMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => selectMode(m)}
                  className={`px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-colors ${
                    mode === m
                      ? "bg-[#0e4d45] text-white"
                      : "text-[#0e4d45] hover:bg-white"
                  }`}
                >
                  {m === "hysa" ? "HYSA" : m === "investing" ? "Investing" : "Custom"}
                </button>
              ))}
            </div>
            {mode !== "custom" && (
              <p className="text-[10px] text-gray-600 mt-1.5 leading-snug">
                {RATE_PRESETS[mode].description}
              </p>
            )}
          </div>

          <NumberField
            label="Annual interest rate"
            value={rate}
            onChange={(n) => {
              setRate(n);
              setMode("custom");
            }}
            suffix="%"
            min={0}
            step={0.1}
          />
          <NumberField
            label="Time horizon (years)"
            value={years}
            onChange={setYears}
            min={1}
            max={60}
            step={1}
          />
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#0e4d45] mb-1.5">
              Compounding frequency
            </label>
            <select
              value={compounds}
              onChange={(e) => setCompounds(Number(e.target.value))}
              className="w-full px-3 py-2 border border-[#e4d9cf] rounded text-sm bg-white focus:outline-none focus:border-[#0e4d45]"
            >
              <option value={1}>Annually</option>
              <option value={2}>Semi-annually</option>
              <option value={4}>Quarterly</option>
              <option value={12}>Monthly</option>
              <option value={365}>Daily</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4 min-w-0">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <StatCard label="Final balance" value={formatCurrency(finalBalance)} highlight />
          <StatCard label="Total contributed" value={formatCurrency(totalContributed)} />
          <StatCard label="Interest earned" value={formatCurrency(totalInterest)} />
        </div>

        {/* Compatible offerings */}
        {mode !== "custom" && <CompatibleOfferings mode={mode} />}

        {/* Table */}
        <div className="bg-white border border-[#e4d9cf] rounded p-3 sm:p-5 min-w-0">
          <h3 className="font-serif text-base font-bold text-black mb-3">Year-by-year breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#e4d9cf] text-left text-[10px] uppercase tracking-wider text-gray-600">
                  <th className="py-2 pr-3 font-bold">Year</th>
                  <th className="py-2 pr-3 font-bold">Contributed</th>
                  <th className="py-2 pr-3 font-bold">Interest</th>
                  <th className="py-2 pr-3 font-bold">Balance</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((row) => (
                  <tr key={row.year} className="border-b border-[#f3ece5] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.year}</td>
                    <td className="py-2 pr-3 text-gray-700">{formatCurrency(row.contributed)}</td>
                    <td className="py-2 pr-3 text-[#0e4d45] font-semibold">
                      {formatCurrency(row.interest)}
                    </td>
                    <td className="py-2 pr-3 font-bold text-black">
                      {formatCurrency(row.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-[10px] text-gray-500 leading-relaxed">
          This calculator provides estimates for educational purposes only. Actual investment returns vary and are not guaranteed. Past performance does not predict future results.
        </p>
      </div>
    </div>
  );
}

function CompatibleOfferings({ mode }: { mode: "hysa" | "investing" }) {
  const picks = useMemo(() => {
    if (mode === "hysa") {
      return products
        .filter((p) => p.category === "bank" && p.subcategory === "High-Yield Savings" && p.apy)
        .sort((a, b) => (b.gradeScore ?? 0) - (a.gradeScore ?? 0))
        .slice(0, 3);
    }
    return products
      .filter((p) => p.category === "investing" && (p.subcategory === "Brokerage" || p.subcategory === "Robo-Advisor"))
      .sort((a, b) => (b.gradeScore ?? 0) - (a.gradeScore ?? 0))
      .slice(0, 3);
  }, [mode]);

  const title = mode === "hysa" ? "Top HYSA offerings" : "Top investing offerings";
  const subtitle =
    mode === "hysa"
      ? "Park your money in one of these high-yield savings accounts to earn a rate like the one above."
      : "Invest through a brokerage or robo-advisor to target long-term market returns.";
  const listingLink = mode === "hysa" ? "/bank-accounts" : "/investing";
  const campaign = mode === "hysa" ? "calc-hysa" : "calc-investing";

  return (
    <div className="bg-white border border-[#d4c5b8] rounded p-3 sm:p-5 min-w-0">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0e4d45] mb-1">
            Compatible accounts
          </div>
          <h3 className="font-serif text-base font-bold text-black">{title}</h3>
          <p className="text-xs text-gray-600 mt-0.5">{subtitle}</p>
        </div>
        <Link
          to={listingLink}
          className="text-[10px] font-bold uppercase tracking-wider text-[#0e4d45] hover:underline whitespace-nowrap"
        >
          See all →
        </Link>
      </div>
      <div className="space-y-2">
        {picks.map((p) => (
          <div
            key={p.slug}
            className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 border border-[#e4d9cf] rounded p-2.5 sm:p-3 hover:border-[#0e4d45] transition-colors min-w-0"
          >
            <ProductLogo slug={p.slug} logoText={p.logoText} color={p.color} />
            <div className="flex-1 min-w-0">
              <div className="font-serif font-bold text-sm text-black truncate">{p.name}</div>
              <div className="text-[10px] text-gray-600 truncate">{p.tagline}</div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-[9px] text-gray-500 uppercase tracking-wider">
                {mode === "hysa" ? "APY" : "Fees"}
              </div>
              <div className="font-serif font-bold text-sm text-[#0e4d45]">
                {mode === "hysa" ? p.apy : p.fees}
              </div>
            </div>
            <div className="flex flex-row sm:flex-col gap-1 flex-shrink-0 w-full sm:w-auto">
              <Link
                to="/product/$slug"
                params={{ slug: p.slug }}
                className="text-center px-2.5 py-1 rounded bg-white border border-[#d4c5b8] text-black text-[9px] font-semibold uppercase tracking-wider hover:border-[#0e4d45] hover:text-[#0e4d45] transition-colors"
              >
                Review
              </Link>
              <a
                href={withUtm(p.url, { campaign, content: p.slug, term: "calculator" })}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="text-center px-2.5 py-1 rounded bg-[#0e4d45] text-white text-[9px] font-semibold uppercase tracking-wider hover:bg-[#0a3832] transition-colors"
              >
                Visit
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductLogo({ slug, logoText, color }: { slug: string; logoText: string; color: string }) {
  const [failed, setFailed] = useState(false);
  const url = getProductLogoUrl(slug, 128);
  if (!url || failed) {
    return (
      <div
        className="w-10 h-10 rounded flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0"
        style={{ backgroundColor: color }}
      >
        {logoText}
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded overflow-hidden bg-white border border-[#e4d9cf] flex items-center justify-center flex-shrink-0">
      <img src={url} alt={`${logoText} logo`} width={40} height={40} loading="lazy" decoding="async" className="w-full h-full object-contain" onError={() => setFailed(true)} />
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`border rounded p-2.5 sm:p-3 min-w-0 ${
        highlight ? "bg-[#0e4d45] border-[#0e4d45]" : "bg-white border-[#e4d9cf]"
      }`}
    >
      <div
        className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mb-1 truncate ${
          highlight ? "text-white/80" : "text-[#0e4d45]"
        }`}
      >
        {label}
      </div>
      <div
        className={`font-serif text-base sm:text-xl font-bold break-words ${highlight ? "text-white" : "text-black"}`}
      >
        {value}
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#0e4d45] mb-1.5">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className={`w-full py-2 border border-[#e4d9cf] rounded text-sm bg-white focus:outline-none focus:border-[#0e4d45] ${
            prefix ? "pl-7" : "pl-3"
          } ${suffix ? "pr-8" : "pr-3"}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
