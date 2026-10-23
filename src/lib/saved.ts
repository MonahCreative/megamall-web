"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/** Saved items ("save for later") and recently viewed products, kept in this browser. */
type SavedState = {
  wishlist: number[]; // product ids, newest first
  viewed: number[]; // product ids, most recent first
  toggleWishlist: (productId: number) => void;
  removeFromWishlist: (productIds: number[]) => void;
  addViewed: (productId: number) => void;
};

const MAX_WISHLIST = 60;
const MAX_VIEWED = 12;

export const useSaved = create<SavedState>()(
  persist(
    (set) => ({
      wishlist: [],
      viewed: [],
      toggleWishlist: (productId) =>
        set((state) => ({
          wishlist: state.wishlist.includes(productId)
            ? state.wishlist.filter((id) => id !== productId)
            : [productId, ...state.wishlist].slice(0, MAX_WISHLIST),
        })),
      removeFromWishlist: (productIds) => set((state) => ({ wishlist: state.wishlist.filter((id) => !productIds.includes(id)) })),
      addViewed: (productId) =>
        set((state) => (state.viewed[0] === productId ? state : { viewed: [productId, ...state.viewed.filter((id) => id !== productId)].slice(0, MAX_VIEWED) })),
    }),
    { name: "megamall-saved", storage: createJSONStorage(() => localStorage) },
  ),
);
