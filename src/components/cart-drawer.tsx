"use client";

import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { cartSubtotal, useCart } from "@/lib/cart";
import { tzs } from "@/lib/format";

export function CartDrawer() {
  const { items, isOpen, close, setQuantity, remove } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Your cart">
      <div className="absolute inset-0 bg-black/40" onClick={close} />
      <aside className="absolute inset-y-0 right-0 flex w-[min(420px,100vw)] flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-lg font-bold">Your cart</h2>
          <button type="button" onClick={close} className="grid size-9 place-items-center rounded-full hover:bg-canvas" aria-label="Close cart">
            <X className="size-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <ShoppingBag className="size-10 text-muted" />
            <p className="font-semibold">Your cart is empty</p>
            <p className="text-sm text-muted">Browse the shop and tap Add to cart on anything you like.</p>
            <Link href="/products" onClick={close} className="mt-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white">
              Start shopping
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {items.map((item) => (
                <li key={item.key} className="flex gap-3 py-4">
                  <Link href={`/product/${item.slug}`} onClick={close} className="size-20 shrink-0 overflow-hidden rounded-xl bg-canvas">
                    {item.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt="" className="size-full object-cover" />
                    )}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <Link href={`/product/${item.slug}`} onClick={close} className="line-clamp-2 text-sm font-medium hover:text-brand-700">
                      {item.name}
                    </Link>
                    {item.variantName && <span className="text-xs text-muted">{item.variantName}</span>}
                    <span className="text-sm font-bold text-brand-600 tabular-nums">{tzs(item.price)}</span>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-line">
                        <button
                          type="button"
                          onClick={() => setQuantity(item.key, item.quantity - 1)}
                          className="grid size-8 place-items-center"
                          aria-label="One less"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="min-w-6 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity(item.key, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="grid size-8 place-items-center disabled:opacity-30"
                          aria-label="One more"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <button type="button" onClick={() => remove(item.key)} className="text-muted hover:text-sale" aria-label={`Remove ${item.name}`}>
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="grid gap-3 border-t border-line px-5 py-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span className="text-lg font-bold tabular-nums">{tzs(cartSubtotal(items))}</span>
              </div>
              <p className="text-xs text-muted">Payment method depends on your region. Delivery is paid to the rider or bus company directly.</p>
              <Link
                href="/checkout"
                onClick={close}
                className="flex h-12 items-center justify-center rounded-xl bg-brand-600 font-semibold text-white hover:bg-brand-700"
              >
                Checkout
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
