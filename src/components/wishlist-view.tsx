"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useSaved } from "@/lib/saved";
import { useHydrated } from "@/lib/use-hydrated";
import { useProductsByIds } from "@/lib/use-products-by-ids";
import { ProductCard } from "./product-card";

export function WishlistView() {
  const hydrated = useHydrated();
  const ids = useSaved((state) => state.wishlist);
  const remove = useSaved((state) => state.removeFromWishlist);
  const { products, loading, missing } = useProductsByIds(hydrated ? ids : []);

  // Products that were deleted or hidden in the admin drop off the list.
  const missingKey = missing.join(",");
  useEffect(() => {
    if (missingKey) remove(missingKey.split(",").map(Number));
  }, [missingKey, remove]);

  if (!hydrated || loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        {Array.from({ length: Math.min(Math.max(ids.length, 2), 5) }, (_, index) => (
          <div key={index} className="aspect-[3/4] animate-pulse rounded-2xl bg-white" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="grid place-items-center gap-3 rounded-3xl bg-white px-6 py-16 text-center">
        <Heart className="size-10 text-muted" />
        <p className="text-lg font-semibold">Nothing saved yet</p>
        <p className="max-w-sm text-sm text-muted">Tap the heart on any product to keep it here for later.</p>
        <Link href="/products" className="rounded-full bg-brand-600 px-6 py-3 font-semibold text-white">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
