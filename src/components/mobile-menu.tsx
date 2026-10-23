"use client";

import { Heart, Menu, Package, RotateCcw, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { Category } from "@/lib/types";

export function MobileMenu({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="grid size-11 place-items-center rounded-xl border border-line text-ink hover:bg-canvas"
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-black/40" onClick={close} />
          <aside className="absolute inset-y-0 left-0 flex w-[min(320px,85vw)] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <span className="text-lg font-bold">Shop by category</span>
              <button type="button" onClick={close} className="grid size-9 place-items-center rounded-full hover:bg-canvas" aria-label="Close menu">
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-3">
              <Link href="/products" onClick={close} className="block rounded-lg px-3 py-2.5 font-semibold hover:bg-canvas">
                All products
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                  onClick={close}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-canvas"
                >
                  {category.name}
                  <span className="text-xs text-muted tabular-nums">{category.product_count}</span>
                </Link>
              ))}
            </nav>
            <div className="grid gap-1 border-t border-line px-3 py-3">
              <Link href="/wishlist" onClick={close} className="flex items-center gap-2 rounded-lg px-3 py-2.5 hover:bg-canvas">
                <Heart className="size-4.5" /> Saved items
              </Link>
              <Link href="/track" onClick={close} className="flex items-center gap-2 rounded-lg px-3 py-2.5 hover:bg-canvas">
                <Package className="size-4.5" /> Track order
              </Link>
              <Link href="/returns" onClick={close} className="flex items-center gap-2 rounded-lg px-3 py-2.5 hover:bg-canvas">
                <RotateCcw className="size-4.5" /> Return an item
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
