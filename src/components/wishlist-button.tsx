"use client";

import { Heart } from "lucide-react";
import { useSaved } from "@/lib/saved";
import { useHydrated } from "@/lib/use-hydrated";

/** Heart that saves a product for later. "icon" sits on product photos, "full" is the button on the product page. */
export function WishlistButton({ productId, name, variant = "icon" }: { productId: number; name: string; variant?: "icon" | "full" }) {
  const hydrated = useHydrated();
  const saved = useSaved((state) => hydrated && state.wishlist.includes(productId));
  const toggle = useSaved((state) => state.toggleWishlist);
  const label = saved ? `Remove ${name} from saved items` : `Save ${name} for later`;

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={() => toggle(productId)}
        aria-pressed={saved}
        className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl border-2 px-4 text-sm font-semibold transition ${
          saved ? "border-sale/30 bg-sale/5 text-sale" : "border-line bg-white hover:border-ink"
        }`}
      >
        <Heart className={`size-4 ${saved ? "fill-current" : ""}`} /> {saved ? "Saved" : "Save for later"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault(); // the heart sits on top of the product link
        toggle(productId);
      }}
      aria-label={label}
      aria-pressed={saved}
      title={saved ? "Saved" : "Save for later"}
      className="grid size-9 place-items-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:scale-110"
    >
      <Heart className={`size-[1.15rem] ${saved ? "fill-sale text-sale" : "text-ink"}`} />
    </button>
  );
}
