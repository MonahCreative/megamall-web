import type { Metadata } from "next";
import { WishlistView } from "@/components/wishlist-view";

export const metadata: Metadata = { title: "Saved items", robots: { index: false } };

export default function WishlistPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-6">
      <h1 className="mb-1 text-3xl font-bold tracking-tight">Saved items</h1>
      <p className="mb-6 text-sm text-muted">Products you saved for later on this phone or computer.</p>
      <WishlistView />
    </div>
  );
}
