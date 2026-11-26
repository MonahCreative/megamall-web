import type { Metadata } from "next";
import { Suspense } from "react";
import { ListingSkeleton, ProductListing } from "@/components/product-listing";

type Search = Promise<Record<string, string | string[] | undefined>>;

const pick = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

/**
 * Search results are kept out of Google (endless near-copies of the shop); the plain list is indexed once,
 * with sorting ignored, so Google sees one address per page of products.
 */
export async function generateMetadata({ searchParams }: { searchParams: Search }): Promise<Metadata> {
  const raw = await searchParams;
  const q = pick(raw.q);
  const page = Math.max(1, Number(pick(raw.page)) || 1);
  if (q) return { title: `Results for "${q}"`, robots: { index: false, follow: true } };
  return {
    title: "Shop all products",
    description: "Every product at Mega Mall Tanzania. Free delivery and pay on delivery in Dar es Salaam; delivery to all 31 regions.",
    alternates: { canonical: page > 1 ? `/products?page=${page}` : "/products" },
  };
}

export default function ProductsPage({ searchParams }: { searchParams: Search }) {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-6">
      <Suspense fallback={<ListingSkeleton />}>
        <Listing searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Listing({ searchParams }: { searchParams: Search }) {
  const raw = await searchParams;
  const category = pick(raw.category);
  const q = pick(raw.q);
  const sort = pick(raw.sort);
  const page = Math.max(1, Number(pick(raw.page)) || 1);

  return (
    <ProductListing title={q ? `Results for "${q}"` : "All products"} query={{ category: category || undefined, q: q || undefined, sort: sort || undefined, page }} basePath="/products" />
  );
}
