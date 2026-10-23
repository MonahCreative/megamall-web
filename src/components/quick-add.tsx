"use client";

import { Check, ShoppingBag, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import type { ProductCard } from "@/lib/types";

/**
 * Buttons on product cards: "Buy now" goes straight to checkout with just this item (the cart is not touched),
 * the bag icon adds it to the cart. Products with sizes or colours open the product page to choose one first.
 */
export function QuickAdd({ product }: { product: ProductCard }) {
  const router = useRouter();
  const add = useCart((state) => state.add);
  const startBuyNow = useCart((state) => state.startBuyNow);
  const [added, setAdded] = useState(false);
  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 1500);
    return () => clearTimeout(timer);
  }, [added]);
  const base = "flex h-9 items-center justify-center gap-1.5 rounded-xl text-sm font-semibold transition";

  if (!product.in_stock) {
    return <span className={`${base} mt-1.5 w-full cursor-not-allowed bg-canvas text-muted`}>Sold out</span>;
  }

  if (product.has_variants) {
    return (
      <Link href={`/product/${product.slug}`} className={`${base} mt-1.5 w-full bg-brand-50 text-brand-700 hover:bg-brand-600 hover:text-white`}>
        Choose an option
      </Link>
    );
  }

  const item = {
    productId: product.id,
    variantId: null,
    slug: product.slug,
    name: product.name,
    variantName: null,
    price: product.price,
    image: product.image,
    stock: product.stock,
  };

  return (
    <div className="mt-1.5 flex gap-1.5">
      <button
        type="button"
        className={`${base} flex-1 bg-brand-600 text-white hover:bg-brand-700`}
        onClick={() => {
          startBuyNow(item);
          router.push("/checkout?buy=now");
        }}
      >
        <Zap className="size-3.5 fill-current" /> Buy now
      </button>
      <button
        type="button"
        aria-label={added ? `${product.name} added to cart` : `Add ${product.name} to cart`}
        title={added ? "Added to cart" : "Add to cart"}
        className={`${base} w-10 shrink-0 ${added ? "bg-whatsapp text-white" : "bg-brand-50 text-brand-700 hover:bg-brand-100"}`}
        onClick={() => {
          add(item);
          setAdded(true);
        }}
      >
        {added ? <Check className="size-4" strokeWidth={3} /> : <ShoppingBag className="size-4" />}
      </button>
      <span className="sr-only" aria-live="polite">
        {added ? `${product.name} added to cart` : ""}
      </span>
    </div>
  );
}
