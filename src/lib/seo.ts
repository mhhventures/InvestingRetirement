/**
 * SEO helper — dynamically sets <title>, <meta>, canonical, OG tags, and JSON-LD.
 * Zero visual impact. Purely additive to document.head.
 */
import { useEffect } from "react";

const SITE_URL = "https://www.investingandretirement.com";
const SITE_NAME = "Investing and Retirement";
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/share-image.png`;

export type SeoConfig = {
  title: string;
  description: string;
  path?: string; // e.g. "/investing" — used for canonical + og:url
  image?: string;
  type?: "website" | "article" | "product";
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  noindex?: boolean;
  article?: {
    publishedTime?: string; // ISO 8601
    modifiedTime?: string;  // ISO 8601
    author?: string;
    section?: string;
    tags?: string[];
  };
};

function setMeta(attr: "name" | "property", key: string, value: string) {
  if (!value) return;
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", value);
}

function setLink(rel: string, href: string) {
  let tag = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", href);
}

const JSONLD_ID = "shipper-seo-jsonld";

function setJsonLd(data: Record<string, unknown> | Record<string, unknown>[] | undefined) {
  // Remove previous
  const existing = document.getElementById(JSONLD_ID);
  if (existing) existing.remove();
  if (!data) return;
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = JSONLD_ID;
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

export function useSeo(config: SeoConfig) {
  useEffect(() => {
    const fullUrl = config.path ? `${SITE_URL}${config.path}` : SITE_URL;
    const image = config.image || DEFAULT_OG_IMAGE;
    const type = config.type || "website";

    // Title
    document.title = config.title;

    // Standard meta
    setMeta("name", "description", config.description);
    setMeta("name", "robots", config.noindex ? "noindex,nofollow" : "index,follow");

    // Canonical
    setLink("canonical", fullUrl);

    // Open Graph
    setMeta("property", "og:title", config.title);
    setMeta("property", "og:description", config.description);
    setMeta("property", "og:url", fullUrl);
    setMeta("property", "og:type", type);
    setMeta("property", "og:image", image);
    setMeta("property", "og:image:alt", config.title);
    setMeta("property", "og:image:width", "1200");
    setMeta("property", "og:image:height", "630");
    setMeta("property", "og:locale", "en_US");
    setMeta("property", "og:site_name", SITE_NAME);

    // Twitter
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:site", "@investingretire");
    setMeta("name", "twitter:title", config.title);
    setMeta("name", "twitter:description", config.description);
    setMeta("name", "twitter:image", image);
    setMeta("name", "twitter:image:alt", config.title);

    // Article-specific OG tags (only when type=article)
    if (type === "article" && config.article) {
      if (config.article.publishedTime)
        setMeta("property", "article:published_time", config.article.publishedTime);
      if (config.article.modifiedTime)
        setMeta("property", "article:modified_time", config.article.modifiedTime);
      if (config.article.author)
        setMeta("property", "article:author", config.article.author);
      if (config.article.section)
        setMeta("property", "article:section", config.article.section);
      if (config.article.tags && config.article.tags.length) {
        // Remove stale article:tag meta tags first
        document.head
          .querySelectorAll('meta[property="article:tag"]')
          .forEach((el) => el.remove());
        config.article.tags.forEach((tag) => {
          const t = document.createElement("meta");
          t.setAttribute("property", "article:tag");
          t.setAttribute("content", tag);
          document.head.appendChild(t);
        });
      }
    } else {
      // Clean up article tags when not an article page
      document.head
        .querySelectorAll(
          'meta[property="article:published_time"], meta[property="article:modified_time"], meta[property="article:author"], meta[property="article:section"], meta[property="article:tag"]'
        )
        .forEach((el) => el.remove());
    }

    // JSON-LD structured data
    setJsonLd(config.jsonLd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    config.title,
    config.description,
    config.path,
    config.image,
    config.type,
    config.noindex,
    JSON.stringify(config.jsonLd || null),
    JSON.stringify(config.article || null),
  ]);
}

export { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE };
