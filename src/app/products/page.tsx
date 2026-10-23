import type { Metadata } from "next";
import { Suspense } from "react";
import { Pagination } from "@/components/pagination";
import { ProductGrid, ProductGridSkeleton } from "@/components/product-grid";
import { SortSelect } from "@/components/sort-select";
import { getCategories, getProducts } from "@/lib/api";
import { plural } from "@/lib/format";

export const metadata: Metadata = { title: "Shop all products" };

type Search = Promise<Record<string, string | string[] | undefined>>;

const pick = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

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
  const params = { category: pick(raw.category), q: pick(raw.q), sort: pick(raw.sort) };
  const page = Math.max(1, Number(pick(raw.page)) || 1);

  const [categories, products] = await Promise.all([
    getCategories().catch(() => []),
    getProducts({ ...params, page, per_page: 24 }).catch(() => null),
  ]);
  const category = categories.find((item) => item.slug === params.category);
  const title = params.q ? `Results for "${params.q}"` : (category?.name ?? "All products");
  const keep = Object.fromEntries(Object.entries(params).filter(([, value]) => value));

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          <p className="mt-0.5 text-sm text-muted">{products ? `${plural(products.meta.total, "product")} found` : "We couldn't load products. Refresh to try again."}</p>
        </div>
        <SortSelect current={params.sort} />
      </div>
      {products && (
        <>
          <ProductGrid products={products.data} />
          <Pagination page={products.meta.current_page} lastPage={products.meta.last_page} params={keep} />
        </>
      )}
    </div>
  );
}

function ListingSkeleton() {
  return (
    <div className="grid gap-5">
      <div className="h-9 w-56 animate-pulse rounded-lg bg-white" />
      <ProductGridSkeleton />
    </div>
  );
}
