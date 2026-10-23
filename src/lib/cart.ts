"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CartItem = {
  key: string; // product id + variant id
  productId: number;
  variantId: number | null;
  slug: string;
  name: string;
  variantName: string | null;
  price: number; // shown in the cart; checkout recalculates on the server
  image: string | null;
  quantity: number;
  stock: number;
};

type CartState = {
  items: CartItem[];
  /** "Buy now": one item checked out on its own. The cart is left untouched. */
  buyNow: CartItem | null;
  isOpen: boolean;
  /** Goes up on every "Add to cart", so the cart button at the top can bump. Not saved. */
  addedCount: number;
  add: (item: Omit<CartItem, "key" | "quantity">, quantity?: number) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  startBuyNow: (item: Omit<CartItem, "key" | "quantity">, quantity?: number) => void;
  setBuyNowQuantity: (quantity: number) => void;
  clearBuyNow: () => void;
  open: () => void;
  close: () => void;
};

export const cartKey = (productId: number, variantId: number | null) => `${productId}-${variantId ?? 0}`;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      buyNow: null,
      isOpen: false,
      addedCount: 0,
      add: (item, quantity = 1) =>
        set((state) => {
          const key = cartKey(item.productId, item.variantId);
          const existing = state.items.find((line) => line.key === key);
          const items = existing
            ? state.items.map((line) =>
                line.key === key ? { ...line, ...item, quantity: Math.min(line.quantity + quantity, item.stock) } : line,
              )
            : [...state.items, { ...item, key, quantity: Math.min(quantity, item.stock) }];
          // Only the number on the cart button changes; the side cart opens when the customer clicks that button.
          return { items, addedCount: state.addedCount + 1 };
        }),
      setQuantity: (key, quantity) =>
        set((state) => ({
          items: state.items
            .map((line) => (line.key === key ? { ...line, quantity: Math.min(Math.max(quantity, 0), line.stock) } : line))
            .filter((line) => line.quantity > 0),
        })),
      remove: (key) => set((state) => ({ items: state.items.filter((line) => line.key !== key) })),
      clear: () => set({ items: [] }),
      startBuyNow: (item, quantity = 1) =>
        set({ buyNow: { ...item, key: cartKey(item.productId, item.variantId), quantity: Math.max(1, Math.min(quantity, item.stock)) } }),
      setBuyNowQuantity: (quantity) =>
        set((state) => (state.buyNow ? { buyNow: { ...state.buyNow, quantity: Math.max(1, Math.min(quantity, state.buyNow.stock)) } } : {})),
      clearBuyNow: () => set({ buyNow: null }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
    }),
    {
      name: "megamall-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, buyNow: state.buyNow }),
    },
  ),
);

export const cartCount = (items: CartItem[]) => items.reduce((sum, line) => sum + line.quantity, 0);
export const cartSubtotal = (items: CartItem[]) => items.reduce((sum, line) => sum + line.price * line.quantity, 0);

/** Order links carry a private token; keep them so customers can reopen their order page. */
export function rememberOrder(orderNumber: string, token: string) {
  try {
    const saved = JSON.parse(localStorage.getItem("megamall-orders") ?? "{}");
    saved[orderNumber] = token;
    localStorage.setItem("megamall-orders", JSON.stringify(saved));
  } catch {
    // private browsing: the link in the address bar still works
  }
}
