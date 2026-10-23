"use client";

import { Check, Minus, Plus, ShoppingBag, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { tzs, whatsappLink } from "@/lib/format";
import type { ProductDetail } from "@/lib/types";
import { WhatsAppIcon } from "./icons";
import { NotifyMe } from "./notify-me";
import { WishlistButton } from "./wishlist-button";

export function BuyBox({ product, whatsapp }: { product: ProductDetail; whatsapp: string | null }) {
  const router = useRouter();
  const add = useCart((state) => state.add);
  const startBuyNow = useCart((state) => state.startBuyNow);
  const hasVariants = product.variants.length > 0;
  const [variantId, setVariantId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [warning, setWarning] = useState("");
  const [added, setAdded] = useState(false);
  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 2000);
    return () => clearTimeout(timer);
  }, [added]);

  const variant = product.variants.find((item) => item.id === variantId) ?? null;
  const price = variant?.price ?? product.price;
  const stock = hasVariants ? (variant?.stock ?? 0) : product.stock;
  const soldOut = hasVariants ? product.variants.every((item) => item.stock < 1) : product.stock < 1;
  const soldOutVariants = product.variants.filter((item) => item.stock < 1);

  const chosen = () => {
    if (hasVariants && !variant) {
      setWarning("Choose an option first.");
      return null;
    }
    return {
      productId: product.id,
      variantId: variant?.id ?? null,
      slug: product.slug,
      name: product.name,
      variantName: variant?.name ?? null,
      price,
      image: product.image,
      stock,
    };
  };

  const addToCart = () => {
    const item = chosen();
    if (!item) return;
    add(item, quantity);
    setAdded(true);
  };

  // Checks out only this item; whatever is already in the cart stays there for later.
  const buyNow = () => {
    const item = chosen();
    if (!item) return;
    startBuyNow(item, quantity);
    router.push("/checkout?buy=now");
  };

  const chat = whatsappLink(whatsapp, `Habari, I want to order ${quantity} x ${product.name}${variant ? ` (${variant.name})` : ""} at ${tzs(price)}.`);

  return (
    <div className="grid gap-4">
      {hasVariants && (
        <fieldset className="grid gap-2">
          <legend className="mb-2 text-sm font-semibold">Choose an option</legend>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={item.stock < 1}
                onClick={() => {
                  setVariantId(item.id);
                  setQuantity(1);
                  setWarning("");
                }}
                className={`rounded-xl border-2 px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 disabled:line-through ${
                  item.id === variantId ? "border-brand-600 bg-brand-50 text-brand-700" : "border-line bg-white hover:border-brand-500"
                }`}
              >
                {item.options ? Object.values(item.options).join(" / ") : item.name}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center rounded-xl border border-line bg-white">
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            className="grid size-11 place-items-center"
            aria-label="One less"
          >
            <Minus className="size-4" />
          </button>
          <span className="min-w-8 text-center font-semibold tabular-nums">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.min(Math.max(stock, 1), value + 1))}
            disabled={quantity >= stock}
            className="grid size-11 place-items-center disabled:opacity-30"
            aria-label="One more"
          >
            <Plus className="size-4" />
          </button>
        </div>
        <span className="text-sm text-muted">
          {soldOut ? "Out of stock" : hasVariants && !variant ? "Choose an option to see stock" : stock <= 5 ? `Only ${stock} left` : "In stock"}
        </span>
      </div>

      <p className="sr-only" aria-live="polite">
        {added ? `${product.name} added to cart` : ""}
      </p>
      {warning && <p className="text-sm font-semibold text-sale">{warning}</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={soldOut}
          onClick={buyNow}
          className="flex h-13 items-center justify-center gap-2 rounded-xl bg-brand-600 font-semibold text-white shadow-lg shadow-brand-600/25 hover:bg-brand-700 disabled:opacity-40 disabled:shadow-none"
        >
          <Zap className="size-4 fill-current" /> Buy now
        </button>
        <button
          type="button"
          disabled={soldOut}
          onClick={addToCart}
          className="flex h-13 items-center justify-center gap-2 rounded-xl border-2 border-ink font-semibold hover:bg-ink hover:text-white disabled:opacity-40"
        >
          {added ? (
            <>
              <Check className="size-4" strokeWidth={3} /> Added to cart
            </>
          ) : (
            <>
              <ShoppingBag className="size-4" /> Add to cart
            </>
          )}
        </button>
        {chat && (
          <a
            href={chat}
            target="_blank"
            rel="noreferrer"
            className="flex h-13 items-center justify-center gap-2 rounded-xl bg-whatsapp font-semibold text-white hover:brightness-110 sm:col-span-2"
          >
            <WhatsAppIcon className="size-5" /> Order on WhatsApp
          </a>
        )}
        <div className="sm:col-span-2">
          <WishlistButton productId={product.id} name={product.name} variant="full" />
        </div>
      </div>

      {soldOut ? (
        <NotifyMe slug={product.slug} wholeProduct />
      ) : (
        hasVariants &&
        soldOutVariants.length > 0 && <NotifyMe key={product.id} slug={product.slug} soldOutVariants={soldOutVariants} wholeProduct={false} />
      )}
    </div>
  );
}
