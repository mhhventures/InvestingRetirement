import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type ProductOffer = {
  productSlug: string;
  headline: string;
  sub: string;
  ctaLabel: string;
  variant: string;
  verifiedAt: string | null;
};

type Row = {
  product_slug: string;
  headline: string;
  sub: string;
  cta_label: string;
  variant: string;
  verified_at: string | null;
};

function toOffer(row: Row): ProductOffer {
  return {
    productSlug: row.product_slug,
    headline: row.headline,
    sub: row.sub,
    ctaLabel: row.cta_label,
    variant: row.variant,
    verifiedAt: row.verified_at,
  };
}

// Module-level cache so multiple components (sticky CTA + sidebar) share
// a single network roundtrip per page load.
let cachePromise: Promise<Map<string, ProductOffer>> | null = null;

function loadAll(): Promise<Map<string, ProductOffer>> {
  if (cachePromise) return cachePromise;
  if (!isSupabaseConfigured) {
    cachePromise = Promise.resolve(new Map());
    return cachePromise;
  }
  cachePromise = (async () => {
    const { data } = await supabase
      .from("product_offers")
      .select("product_slug, headline, sub, cta_label, variant, verified_at")
      .eq("active", true);
    const map = new Map<string, ProductOffer>();
    for (const row of (data as Row[] | null) ?? []) {
      // First active row per slug wins; editorial can layer variants by
      // filtering on `variant` in the UI later.
      if (!map.has(row.product_slug)) map.set(row.product_slug, toOffer(row));
    }
    return map;
  })();
  return cachePromise;
}

export function useProductOffer(slug: string): ProductOffer | null {
  const [offer, setOffer] = useState<ProductOffer | null>(null);
  useEffect(() => {
    let cancelled = false;
    loadAll().then((map) => {
      if (!cancelled) setOffer(map.get(slug) ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);
  return offer;
}

export function useAllProductOffers(): Map<string, ProductOffer> | null {
  const [offers, setOffers] = useState<Map<string, ProductOffer> | null>(null);
  useEffect(() => {
    let cancelled = false;
    loadAll().then((map) => {
      if (!cancelled) setOffers(map);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return offers;
}

export function formatVerified(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
