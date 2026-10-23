"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { useSaved } from "@/lib/saved";
import { useHydrated } from "@/lib/use-hydrated";

/** Heart in the header: opens saved items, with how many are saved. */
export function WishlistLink() {
  const hydrated = useHydrated();
  const count = useSaved((state) => (hydrated ? state.wishlist.length : 0));

  return (
    <Link
      href="/wishlist"
      aria-label={`Saved items, ${count}`}
      className="relative hidden size-11 place-items-center rounded-full border border-line hover:bg-canvas min-[400px]:grid"
    >
      <Heart className="size-[1.15rem]" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full bg-sale px-1 text-[0.7rem] font-bold text-white tabular-nums">
          {count}
        </span>
      )}
    </Link>
  );
}
