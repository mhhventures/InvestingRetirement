import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { products } from "@/data/products";
import { productPartnerLink } from "@/lib/affiliate";
import { useSeo } from "@/lib/seo";
import { toast } from "sonner";
import { Calendar, Copy, Lock, Sparkles, Check, Plus, X, Star, Link2, Building2, MapPin, ChartLine as LineChart, Smartphone, BookOpen } from "lucide-react";

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

const LINK_CARD_PRESETS = [
  { id: "bank-accounts", icon: Building2, eyebrow: "Browse all banks", title: "Top bank accounts this week", description: "Compare APYs, fees, and bonuses across every bank we track.", ctaLabel: "See all bank accounts", href: "/bank-accounts" },
  { id: "banks", icon: MapPin, eyebrow: "Banking by state", title: "Find a local bank near you", description: "State-by-state picks for regional banks and credit unions.", ctaLabel: "Explore local banks", href: "/banks" },
  { id: "investing", icon: LineChart, eyebrow: "Investing", title: "Best brokers and investing accounts", description: "Our ranked picks for brokerages, IRAs, and robo-advisors.", ctaLabel: "See investing picks", href: "/investing" },
  { id: "financial-apps", icon: Smartphone, eyebrow: "Financial apps", title: "Money apps worth downloading", description: "Budgeting, saving, and spending apps we actually use.", ctaLabel: "Browse apps", href: "/financial-apps" },
  { id: "guides", icon: BookOpen, eyebrow: "Guides", title: "Our latest money guides", description: "Deep dives on saving, investing, and retirement planning.", ctaLabel: "Read the guides", href: "/guides" },
] as const;

type LinkCardItem = {
  kind: "link";
  slug: string;
  presetId: string;
  title: string;
  eyebrow: string;
  description: string;
  ctaLabel: string;
  href: string;
};

function NewsletterBuilder() {
  useSeo({
    title: "Admin",
    description: "Private admin area.",
    path: "/admin/newsletter",
    noindex: true,
  });
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
  const [overrides, setOverrides] = useState<Record<string, { bonus?: string; promoNote?: string }>>({});
  const [linkCards, setLinkCards] = useState<Record<string, LinkCardItem>>({});
  const [editorsPickSlug, setEditorsPickSlug] = useState<string | null>(null);
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

  const addLinkCard = (preset: typeof LINK_CARD_PRESETS[number]) => {
    const slug = `link-${preset.id}-${Date.now().toString(36)}`;
    setLinkCards((prev) => ({
      ...prev,
      [slug]: {
        kind: "link",
        slug,
        presetId: preset.id,
        title: preset.title,
        eyebrow: preset.eyebrow,
        description: preset.description,
        ctaLabel: preset.ctaLabel,
        href: preset.href,
      },
    }));
    setSelected((prev) => [...prev, slug]);
  };

  const updateLinkCard = (slug: string, patch: Partial<LinkCardItem>) => {
    setLinkCards((prev) => ({ ...prev, [slug]: { ...prev[slug], ...patch } }));
  };

  const removeItem = (slug: string) => {
    setSelected((prev) => prev.filter((s) => s !== slug));
    if (editorsPickSlug === slug) setEditorsPickSlug(null);
    if (linkCards[slug]) {
      setLinkCards((prev) => {
        const next = { ...prev };
        delete next[slug];
        return next;
      });
    }
  };

  const build = async () => {
    if (selected.length === 0) {
      toast.error("Pick at least one card to feature.");
      return;
    }
    setLoading(true);
    try {
      const chosen = selected
        .map((s) => {
          if (linkCards[s]) {
            return { ...linkCards[s], editorsPick: editorsPickSlug === s };
          }
          const base = products.find((p) => p.slug === s);
          if (!base) return null;
          const ov = overrides[s] ?? {};
          const trackedUrl = productPartnerLink(base.slug, base.url, {
            placement: "newsletter",
            term: `${category}-${weekStart}`,
          });
          return {
            ...base,
            url: trackedUrl,
            logoSourceUrl: base.url,
            bonus: ov.bonus?.trim() ? ov.bonus.trim() : base.bonus,
            promoNote: ov.promoNote?.trim() ? ov.promoNote.trim() : undefined,
            editorsPick: editorsPickSlug === s,
          };
        })
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

  type SelectedItem =
    | { kind: "product"; slug: string; product: typeof products[number] }
    | { kind: "link"; slug: string; link: LinkCardItem };

  const selectedItems: SelectedItem[] = selected
    .map((s): SelectedItem | null => {
      if (linkCards[s]) return { kind: "link", slug: s, link: linkCards[s] };
      const prod = products.find((p) => p.slug === s);
      if (prod) return { kind: "product", slug: s, product: prod };
      return null;
    })
    .filter((x): x is SelectedItem => !!x);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="h-1 bg-gradient-to-r from-emerald-700 via-emerald-600 to-amber-400" />
      <header className="border-b border-slate-200 bg-[#faf7f2]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-800">Admin &middot; Newsletter</div>
              <h1 className="font-serif text-2xl font-semibold leading-tight text-slate-900">Edition Builder</h1>
            </div>
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
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setSelected((prev) => prev.filter((s) => !!linkCards[s]));
                    setOverrides({});
                    setEditorsPickSlug(null);
                  }}
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

            {selectedItems.length > 0 && (
              <div className="mb-4 rounded-md border border-dashed border-slate-300 bg-slate-50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Running order &amp; overrides</div>
                  {editorsPickSlug && (
                    <button
                      onClick={() => setEditorsPickSlug(null)}
                      className="text-xs text-slate-500 hover:text-slate-800"
                    >
                      Clear Editor&rsquo;s Pick
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {selectedItems.map((item, i) => {
                    const isPick = editorsPickSlug === item.slug;
                    const name = item.kind === "product" ? item.product.name : item.link.title;
                    return (
                      <div
                        key={item.slug}
                        className={`relative overflow-hidden rounded border bg-white p-3 pl-4 text-sm ${isPick ? "border-slate-900 ring-1 ring-slate-900" : "border-slate-200"}`}
                      >
                        <div className={`absolute inset-y-0 left-0 w-1 ${isPick ? "bg-slate-900" : "bg-slate-300"}`} />
                        <div className="flex items-center justify-between">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">{i + 1}</span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                {item.kind === "link" && (
                                  <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
                                    <Link2 className="h-3 w-3" /> Link
                                  </span>
                                )}
                                <span className="truncate font-medium text-slate-900">{name}</span>
                                {isPick && (
                                  <span className="inline-flex items-center gap-1 rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                                    <Star className="h-3 w-3" /> Pick
                                  </span>
                                )}
                              </div>
                              <div className="truncate text-xs text-slate-500">
                                {item.kind === "product"
                                  ? `Default bonus: ${item.product.bonus ?? "—"}`
                                  : item.link.href}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditorsPickSlug(isPick ? null : item.slug)}
                              className={`rounded p-1.5 ${isPick ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"}`}
                              aria-label="Set Editor's Pick"
                              title="Set Editor's Pick"
                            >
                              <Star className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => move(item.slug, -1)} disabled={i === 0} className="rounded p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30" aria-label="Move up">↑</button>
                            <button onClick={() => move(item.slug, 1)} disabled={i === selectedItems.length - 1} className="rounded p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30" aria-label="Move down">↓</button>
                            <button
                              onClick={() => removeItem(item.slug)}
                              className="rounded p-1.5 text-slate-500 hover:bg-slate-100"
                              aria-label="Remove"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {item.kind === "product" && (
                          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                            <div>
                              <label className="text-[11px] font-medium text-slate-600">Bonus override</label>
                              <input
                                value={overrides[item.slug]?.bonus ?? ""}
                                onChange={(e) =>
                                  setOverrides((prev) => ({
                                    ...prev,
                                    [item.slug]: { ...prev[item.slug], bonus: e.target.value },
                                  }))
                                }
                                placeholder={item.product.bonus ?? "e.g. $500 bonus"}
                                className="mt-1 h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-medium text-slate-600">Newsletter-exclusive note</label>
                              <input
                                value={overrides[item.slug]?.promoNote ?? ""}
                                onChange={(e) =>
                                  setOverrides((prev) => ({
                                    ...prev,
                                    [item.slug]: { ...prev[item.slug], promoNote: e.target.value },
                                  }))
                                }
                                placeholder="Use code NEWS100 for an extra $100"
                                className="mt-1 h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
                              />
                            </div>
                          </div>
                        )}

                        {item.kind === "link" && (
                          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                            <div>
                              <label className="text-[11px] font-medium text-slate-600">Title</label>
                              <input
                                value={item.link.title}
                                onChange={(e) => updateLinkCard(item.slug, { title: e.target.value })}
                                className="mt-1 h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-medium text-slate-600">CTA label</label>
                              <input
                                value={item.link.ctaLabel}
                                onChange={(e) => updateLinkCard(item.slug, { ctaLabel: e.target.value })}
                                className="mt-1 h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="text-[11px] font-medium text-slate-600">Description</label>
                              <textarea
                                value={item.link.description}
                                onChange={(e) => updateLinkCard(item.slug, { description: e.target.value })}
                                rows={2}
                                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="divide-y divide-slate-200 overflow-hidden rounded-md border border-slate-200">
              {categoryProducts.map((p) => {
                const on = selected.includes(p.slug);
                const rank = selected.indexOf(p.slug) + 1;
                const rate = p.apy ?? p.bonus ?? "—";
                return (
                  <button
                    key={p.slug}
                    onClick={() => toggle(p.slug)}
                    className={`relative flex w-full items-center justify-between px-4 py-2.5 pl-5 text-left transition-colors ${on ? "bg-slate-50" : "bg-white hover:bg-slate-50"}`}
                  >
                    <span className={`absolute inset-y-0 left-0 w-1 transition-colors ${on ? "bg-slate-900" : "bg-transparent"}`} />
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-slate-100 text-[10px] font-semibold text-slate-600">
                        {p.logoText.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {on && <span className="inline-flex h-5 shrink-0 items-center rounded bg-slate-900 px-1.5 text-[10px] font-semibold text-white">#{rank}</span>}
                          {p.grade && <span className="shrink-0 rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-700">{p.grade}</span>}
                          <span className="truncate text-sm font-medium text-slate-900">{p.name}</span>
                        </div>
                        <div className="truncate text-xs text-slate-500">
                          {p.fees} &middot; Min {p.minDeposit}
                        </div>
                      </div>
                    </div>
                    <div className="ml-3 flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-mono text-sm font-semibold tabular-nums text-slate-900">{rate}</div>
                        <div className="text-[10px] uppercase tracking-wide text-slate-500">{p.apy ? "APY" : p.bonus ? "Bonus" : ""}</div>
                      </div>
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors ${on ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-500"}`}>
                        {on ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="font-serif text-lg font-semibold text-slate-900">3. Add section links (optional)</h2>
              <p className="text-sm text-slate-500">Drop in a standalone card that points readers to a whole section of the site.</p>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {LINK_CARD_PRESETS.map((preset) => {
                const Icon = preset.icon;
                return (
                  <button
                    key={preset.id}
                    onClick={() => addLinkCard(preset)}
                    className="flex items-start gap-3 rounded-md border border-slate-200 bg-white p-3 text-left transition-all hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-sm"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-emerald-50 text-emerald-700">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-900">{preset.title}</div>
                      <div className="truncate text-xs text-slate-500">{preset.href}</div>
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
