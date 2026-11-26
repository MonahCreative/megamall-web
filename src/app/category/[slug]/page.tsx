import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { JsonLd } from "@/components/json-ld";
import { ListingSkeleton, ProductListing } from "@/components/product-listing";
import { getCategories } from "@/lib/api";
import { SITE_URL } from "@/lib/site";

type Params = Promise<{ slug: string }>;
type Search = Promise<Record<string, string | string[] | undefined>>;

const pick = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

async function findCategory(slug: string) {
  return (await getCategories().catch(() => [])).find((item) => item.slug === slug) ?? null;
}

/** Each category has its own address and title, e.g. "Electronics: shop online in Tanzania", so it can rank on its own. */
export async function generateMetadata({ params, searchParams }: { params: Params; searchParams: Search }): Promise<Metadata> {
  const { slug } = await params;
  const page = Math.max(1, Number(pick((await searchParams).page)) || 1);
  const category = await findCategory(slug);
  if (!category) return { title: "Category" };

  const title = `${category.name}: shop online in Tanzania`;
  const description = `Buy ${category.name.toLowerCase()} online at Mega Mall Tanzania. Free delivery and pay on delivery in Dar es Salaam; delivery to all 31 regions.`;
  const path = `/category/${category.slug}`;
  return {
    title,
    description,
    alternates: { canonical: page > 1 ? `${path}?page=${page}` : path },
    openGraph: { type: "website", url: path, title: `${category.name} · Mega Mall Tanzania`, description },
  };
}

export default function CategoryPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-6">
      <Suspense fallback={<ListingSkeleton />}>
        <Listing params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Listing({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { slug } = await params;
  const raw = await searchParams;
  const category = await findCategory(slug);
  if (!category) notFound();

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: category.name, item: `${SITE_URL}/category/${category.slug}` },
    ],
  };

  return (
    <div className="grid gap-3">
      <JsonLd data={breadcrumbs} />
      <nav className="text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-brand-700">Home</Link> / <Link href="/products" className="hover:text-brand-700">All products</Link> / {category.name}
      </nav>
      <ProductListing
        title={category.name}
        query={{ category: category.slug, sort: pick(raw.sort) || undefined, page: Math.max(1, Number(pick(raw.page)) || 1) }}
        basePath={`/category/${category.slug}`}
      />
    </div>
  );
}
