import { PackageSearch } from "lucide-react";
import type { ProductCard as Product } from "@/lib/types";
import { ProductCard } from "./product-card";

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="grid place-items-center gap-2 rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center">
        <PackageSearch className="size-10 text-muted" />
        <p className="font-semibold">No products found</p>
        <p className="text-sm text-muted">Try another word or category.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export function ProductGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className="aspect-square animate-pulse bg-canvas" />
          <div className="grid gap-2 p-3.5">
            <div className="h-4 animate-pulse rounded bg-canvas" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-canvas" />
            <div className="h-9 animate-pulse rounded-xl bg-canvas" />
          </div>
        </div>
      ))}
    </div>
  );
}
