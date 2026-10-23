import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { api } from "@/lib/api";
import { SITE_URL } from "@/lib/site";

type SitemapData = Record<"products" | "categories" | "pages", { slug: string; updated_at: string | null }[]>;

/** /sitemap.xml: every product, category and info page, so Google can find them. Built fresh on each request. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const data = await api<SitemapData>("/sitemap").catch(() => null);

  const entry = (path: string, updated: string | null, priority: number): MetadataRoute.Sitemap[number] => ({
    url: `${SITE_URL}${path}`,
    lastModified: updated ? new Date(updated) : undefined,
    priority,
  });

  return [
    entry("/", null, 1),
    entry("/products", null, 0.9),
    ...(data?.categories ?? []).map((category) => entry(`/products?category=${encodeURIComponent(category.slug)}`, category.updated_at, 0.8)),
    ...(data?.products ?? []).map((product) => entry(`/product/${product.slug}`, product.updated_at, 0.7)),
    ...(data?.pages ?? []).map((page) => entry(`/pages/${page.slug}`, page.updated_at, 0.3)),
  ];
}
