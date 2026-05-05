import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { products } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/newsletter")({
  component: NewsletterBuilder,
});

function mondayOf(d = new Date()) {
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  const m = new Date(d);
  m.setUTCDate(d.getUTCDate() + diff);
  return m.toISOString().slice(0, 10);
}

function NewsletterBuilder() {
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

  const categoryProducts = useMemo(
    () => products.filter((p) => p.subcategory === category),
    [category],
  );

  const toggle = (slug: string) => {
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
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
    toast.success("HTML copied. Paste into Beehiiv's Custom HTML block.");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-1 font-serif text-3xl font-bold">Newsletter Edition Builder</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Pick products, generate email-safe HTML, and paste into Beehiiv. Each edition is archived in Supabase.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <Label>Category</Label>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setSelected([]);
            }}
            className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {subcategories.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Week start (Monday)</Label>
          <Input
            type="date"
            value={weekStart}
            onChange={(e) => setWeekStart(e.target.value)}
            className="mt-1"
          />
        </div>
        <div className="flex items-end">
          <Button onClick={build} disabled={loading} className="w-full">
            {loading ? "Building..." : "Build edition"}
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label>Headline (optional)</Label>
          <Input
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder={`This week's top ${category.toLowerCase()} picks`}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Intro (optional)</Label>
          <Textarea
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            placeholder="Short editor's note..."
            className="mt-1"
            rows={2}
          />
        </div>
      </div>

      <h2 className="mt-8 mb-2 font-serif text-lg font-semibold">
        Select products ({selected.length} selected)
      </h2>
      <div className="space-y-2">
        {categoryProducts.map((p) => {
          const on = selected.includes(p.slug);
          return (
            <button
              key={p.slug}
              onClick={() => toggle(p.slug)}
              className={`flex w-full items-center justify-between rounded-md border p-3 text-left transition-colors ${
                on ? "border-foreground bg-muted" : "border-border hover:bg-muted/50"
              }`}
            >
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-muted-foreground">
                  {p.apy ? `${p.apy} APY` : p.bonus ?? p.tagline} &middot; {p.fees}
                </div>
              </div>
              <div className="text-xs font-medium">
                {on ? `#${selected.indexOf(p.slug) + 1}` : "Add"}
              </div>
            </button>
          );
        })}
      </div>

      {html && (
        <div className="mt-10">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold">Rendered HTML</h2>
            <Button onClick={copy} variant="outline">
              Copy for Beehiiv
            </Button>
          </div>
          <div
            className="rounded-md border p-4"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-muted-foreground">
              View raw HTML
            </summary>
            <pre className="mt-2 max-h-96 overflow-auto rounded-md bg-muted p-3 text-xs">
              {html}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
