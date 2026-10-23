"use client";

import { useEffect } from "react";
import { useSaved } from "@/lib/saved";
import { useHydrated } from "@/lib/use-hydrated";
import { useProductsByIds } from "@/lib/use-products-by-ids";
import { ProductRow } from "./product-row";

/** Remembers that this product was viewed (put on product pages). */
export function TrackView({ productId }: { productId: number }) {
  const addViewed = useSaved((state) => state.addViewed);
  useEffect(() => addViewed(productId), [productId, addViewed]);
  return null;
}

/** "Recently viewed" row, from this browser's history. Hidden until there is something to show. */
export function RecentlyViewed({ excludeId }: { excludeId?: number }) {
  const hydrated = useHydrated();
  const viewed = useSaved((state) => state.viewed);
  const ids = hydrated ? viewed.filter((id) => id !== excludeId).slice(0, 10) : [];
  const { products } = useProductsByIds(ids);

  if (products.length === 0) return null;

  return (
    <ProductRow
      section={{ id: 0, title: "Recently viewed", subtitle: "Pick up where you left off", source: "recently_viewed", link: null, products }}
    />
  );
}
