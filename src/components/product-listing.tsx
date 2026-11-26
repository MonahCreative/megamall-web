import { Pagination } from "@/components/pagination";
import { ProductGrid, ProductGridSkeleton } from "@/components/product-grid";
import { SortSelect } from "@/components/sort-select";
import { getProducts } from "@/lib/api";
import { plural } from "@/lib/format";

/** The product grid with sorting and pages, used by "All products", search results and each category page. */
export async function ProductListing({
  title,
  intro,
  query,
  basePath,
}: {
  title: string;
  intro?: string;
  query: { category?: string; q?: string; sort?: string; page: number };
  basePath: string;
}) {
  const { page, ...filters } = query;
  const products = await getProducts({ ...filters, page, per_page: 24 }).catch(() => null);
  const keep = Object.fromEntries(Object.entries({ q: filters.q, sort: filters.sort }).filter(([, value]) => value)) as Record<string, string>;

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          <p className="mt-0.5 text-sm text-muted">
            {products ? `${plural(products.meta.total, "product")} found` : "We couldn't load products. Refresh to try again."}
            {intro && products ? ` · ${intro}` : null}
          </p>
        </div>
        <SortSelect current={filters.sort ?? ""} />
      </div>
      {products && (
        <>
          <ProductGrid products={products.data} />
          <Pagination page={products.meta.current_page} lastPage={products.meta.last_page} params={keep} basePath={basePath} />
        </>
      )}
    </div>
  );
}

export function ListingSkeleton() {
  return (
    <div className="grid gap-5">
      <div className="h-9 w-56 animate-pulse rounded-lg bg-white" />
      <ProductGridSkeleton />
    </div>
  );
}
