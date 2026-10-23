"use client";

import { useEffect, useState } from "react";
import { api } from "./api";
import type { Paginated, ProductCard } from "./types";

/** Current details (price, stock) for saved product ids, in the same order as the ids. */
export function useProductsByIds(ids: number[]): { products: ProductCard[]; loading: boolean; missing: number[] } {
  const key = ids.join(",");
  const [result, setResult] = useState<{ key: string; products: ProductCard[] }>({ key: "", products: [] });

  useEffect(() => {
    if (!key) return;
    api<Paginated<ProductCard>>(`/products?ids=${key}&per_page=60`)
      .then((response) => setResult({ key, products: response.data }))
      .catch(() => setResult({ key, products: [] }));
  }, [key]);

  if (!key) return { products: [], loading: false, missing: [] };
  const loaded = result.key === key;
  const byId = new Map(result.products.map((product) => [product.id, product]));

  return {
    products: ids.map((id) => byId.get(id)).filter((product): product is ProductCard => Boolean(product)),
    loading: !loaded,
    missing: loaded ? ids.filter((id) => !byId.has(id)) : [],
  };
}
