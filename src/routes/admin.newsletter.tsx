import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { products } from "@/data/products";
import { toast } from "sonner";
import { Calendar, Copy, Lock, Sparkles, Check, Plus, X } from "lucide-react";

export const Route = createFileRoute("/admin/newsletter")({
  component: NewsletterBuilder,
});

const TOKEN_KEY = "newsletter_admin_token";

function mondayOf(d = new Date()) {
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  const m = new Date(d);
  m.setUTCDate(d.getUTCDate() + diff);
  return m.toISOString().slice(0, 10);
}

const inputCls =
  "w-full h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900";

function NewsletterBuilder() {
  const [token, setToken] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (saved) setToken(saved);
  }, []);

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-serif text-lg font-semibold text-slate-900">Admin access</h1>
              <p className="text-xs text-slate-500">Enter the newsletter admin token to continue.</p>
            </div>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!tokenInput.trim()) return;
              localStorage.setItem(TOKEN_KEY, tokenInput.trim());
              setToken(tokenInput.trim());
            }}
            className="space-y-3"
          >
            <input
              type="password"
              autoFocus
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Admin token"
              className={inputCls}
            />
            <button
              type="submit"
              className="h-10 w-full rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <Builder token={token} onSignOut={() => { localStorage.removeItem(TOKEN_KEY); setToken(null); }} />;
}

function Builder({ token, onSignOut }: { token: string; onSignOut: () => void }) {
  const subcategories = useMemo(
    () => Array.from(new Set(products.map((p) => p.subcategory))).sort(),
    [],
  );
  const [category, setCategory] = useState(subcategories[0] ?? "High-Yield Savings");
  const [weekStart, setWeekStart] = useState(mondayOf());
  const [headline, setHeadline] = useState("");
  const [intro, setIntro] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [html, setHtml] = useState("");
  const [copied, setCopied] = useState(false);

  const categoryProducts = useMemo(
    () => products.filter((p) => p.subcategory === category),
    [category],
  );

  const toggle = (slug: string) => {
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  };

  const move = (slug: string, dir: -1 | 1) => {
    setSelected((prev) => {
      const i = prev.indexOf(slug);
      if (i < 0) return prev;
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const build = async () => {
    if (selected.length === 0) {
      toast.error("Pick at least one product to feature.");
      return;
    }
    setLoading(true);
    try {
      const chosen = selected
        .map((s) => products.find((p) => p.slug === s))
        .filter(Boolean);
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/newsletter-edition`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            "x-admin-token": token,
          },
          body: JSON.stringify({
            category,
            week_start: weekStart,
            headline: headline || undefined,
            intro: intro || undefined,
            products: chosen,
          }),
        },
      );
      const data = await res.json();
      if (res.status === 401) {
        toast.error("Invalid admin token.");
        onSignOut();
        return;
      }
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setHtml(data.rendered_html);
      toast.success("Edition built and archived.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to build edition");
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("HTML copied. Paste into Beehiiv's Custom HTML block.");
  };

  const selectedProducts = selected
    .map((s) => products.find((p) => p.slug === s))
    .filter((p): p is NonNullable<typeof p> => !!p);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-slate-500" />
              <span className="text-xs uppercase tracking-wider text-slate-500">Admin</span>
            </div>
            <h1 className="font-serif text-2xl font-semibold text-slate-900">Newsletter Edition Builder</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              <Lock className="h-3 w-3" />
              Protected
            </span>
            <button
              onClick={onSignOut}
              className="rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-8 lg:grid-cols-[minmax(0,1fr)_480px]">
        <div className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-1 font-serif text-lg font-semibold text-slate-900">1. Edition details</h2>
            <p className="mb-4 text-sm text-slate-500">Pick the week and category. Headline and intro are optional.</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-slate-700">Category</label>
                <select
                  value={category}
                  onChange={(e) => { setCategory(e.target.value); setSelected([]); }}
                  className={`mt-1.5 ${inputCls}`}
                >
                  {subcategories.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700">Week start</label>
                <div className="relative mt-1.5">
                  <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={weekStart}
                    onChange={(e) => setWeekStart(e.target.value)}
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-slate-700">Headline</label>
                <input
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder={`This week's top ${category.toLowerCase()} picks`}
                  className={`mt-1.5 ${inputCls}`}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-slate-700">Intro</label>
                <textarea
                  value={intro}
                  onChange={(e) => setIntro(e.target.value)}
                  placeholder="Short editor's note shown above the product cards..."
                  rows={2}
                  className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-lg font-semibold text-slate-900">2. Pick products</h2>
                <p className="text-sm text-slate-500">
                  {categoryProducts.length} available in {category}
                </p>
              </div>
              <span className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
                {selected.length} selected
              </span>
            </div>

            {selectedProducts.length > 0 && (
              <div className="mb-4 rounded-md border border-dashed border-slate-300 bg-slate-50 p-3">
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Running order</div>
                <div className="space-y-1.5">
                  {selectedProducts.map((p, i) => (
                    <div key={p.slug} className="flex items-center justify-between rounded border border-slate-200 bg-white px-3 py-2 text-sm">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">{i + 1}</span>
                        <span className="font-medium text-slate-900">{p.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => move(p.slug, -1)} disabled={i === 0} className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30" aria-label="Move up">↑</button>
                        <button onClick={() => move(p.slug, 1)} disabled={i === selectedProducts.length - 1} className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30" aria-label="Move down">↓</button>
                        <button onClick={() => toggle(p.slug)} className="rounded p-1 text-slate-500 hover:bg-slate-100" aria-label="Remove">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="divide-y divide-slate-200 overflow-hidden rounded-md border border-slate-200">
              {categoryProducts.map((p) => {
                const on = selected.includes(p.slug);
                const rank = selected.indexOf(p.slug) + 1;
                return (
                  <button
                    key={p.slug}
                    onClick={() => toggle(p.slug)}
                    className={`flex w-full items-center justify-between px-4 py-3 text-left transition-colors ${on ? "bg-slate-50" : "bg-white hover:bg-slate-50"}`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {on && <span className="inline-flex h-5 shrink-0 items-center rounded bg-slate-900 px-1.5 text-[10px] font-semibold text-white">#{rank}</span>}
                        {p.grade && <span className="shrink-0 rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-700">{p.grade}</span>}
                        <span className="truncate font-medium text-slate-900">{p.name}</span>
                      </div>
                      <div className="mt-0.5 truncate text-xs text-slate-500">
                        {p.apy ? `${p.apy} APY` : p.bonus ?? p.tagline} &middot; {p.fees} &middot; Min {p.minDeposit}
                      </div>
                    </div>
                    <div className={`ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors ${on ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-500"}`}>
                      {on ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <div className="flex justify-end">
            <button
              onClick={build}
              disabled={loading || selected.length === 0}
              className="rounded-md bg-slate-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {loading ? "Building..." : `Build edition (${selected.length})`}
            </button>
          </div>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Preview</div>
                <div className="text-sm font-medium text-slate-900">{html ? "Ready to send" : "Nothing built yet"}</div>
              </div>
              <button
                disabled={!html}
                onClick={copy}
                className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  !html
                    ? "border border-slate-200 bg-white text-slate-400"
                    : copied
                      ? "bg-emerald-600 text-white"
                      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {copied ? <><Check className="h-3.5 w-3.5" />Copied</> : <><Copy className="h-3.5 w-3.5" />Copy HTML</>}
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto bg-white">
              {html ? (
                <div dangerouslySetInnerHTML={{ __html: html }} />
              ) : (
                <div className="flex h-64 items-center justify-center p-10 text-center text-sm text-slate-500">
                  Pick products and click Build to see the rendered email here.
                </div>
              )}
            </div>
          </div>

          {html && (
            <details className="mt-3 rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-sm">
              <summary className="cursor-pointer font-medium text-slate-600">Raw HTML</summary>
              <pre className="mt-2 max-h-64 overflow-auto rounded bg-slate-900 p-3 text-[11px] leading-relaxed text-slate-100">{html}</pre>
            </details>
          )}
        </aside>
      </div>
    </div>
  );
}
