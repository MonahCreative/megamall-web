"use client";

import { ShoppingBag } from "lucide-react";
import { cartCount, useCart } from "@/lib/cart";
import { useHydrated } from "@/lib/use-hydrated";

export function CartButton() {
  const items = useCart((state) => state.items);
  const open = useCart((state) => state.open);
  const addedCount = useCart((state) => state.addedCount);
  const hydrated = useHydrated();
  const count = hydrated ? cartCount(items) : 0;

  return (
    <button
      type="button"
      onClick={open}
      className="flex h-11 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-white transition hover:bg-black sm:px-5"
      aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
    >
      <ShoppingBag className="size-4.5" />
      <span className="hidden sm:inline">Cart</span>
      {/* A new key after each "Add to cart" replays the bump animation. */}
      <span
        key={addedCount}
        className={`grid min-w-5 place-items-center rounded-full bg-brand-500 px-1.5 text-xs font-bold tabular-nums ${addedCount ? "cart-bump" : ""}`}
      >
        {count}
      </span>
    </button>
  );
}
