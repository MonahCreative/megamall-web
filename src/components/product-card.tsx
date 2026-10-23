import { PlayCircle } from "lucide-react";
import Link from "next/link";
import { tzs } from "@/lib/format";
import type { ProductCard as Product } from "@/lib/types";
import { QuickAdd } from "./quick-add";
import { Stars } from "./stars";
import { WishlistButton } from "./wishlist-button";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5">
      <Link href={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-canvas">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image} alt={product.name} loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-[1.04]" />
        ) : (
          <div className="size-full" />
        )}
        <span className="absolute top-2.5 left-2.5 flex flex-col items-start gap-1">
          {product.discount_percent ? (
            <span className="rounded-md bg-sale px-2 py-0.5 text-xs font-bold text-white">-{product.discount_percent}%</span>
          ) : null}
          {product.promotion?.badge ? (
            <span className="rounded-md bg-ink px-2 py-0.5 text-xs font-semibold text-white">{product.promotion.badge}</span>
          ) : null}
        </span>
        {product.has_video && product.in_stock && (
          <span className="absolute bottom-2.5 left-2.5 flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[0.7rem] font-semibold text-white">
            <PlayCircle className="size-3.5" /> Video
          </span>
        )}
        {!product.in_stock && (
          <span className="absolute inset-x-0 bottom-0 bg-black/60 py-1.5 text-center text-xs font-semibold text-white">Out of stock</span>
        )}
      </Link>
      <span className="absolute top-2 right-2">
        <WishlistButton productId={product.id} name={product.name} />
      </span>
      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-3.5">
        <Link href={`/product/${product.slug}`} className="line-clamp-2 min-h-[2.6em] text-[0.92rem] leading-snug font-medium text-ink hover:text-brand-700">
          {product.name}
        </Link>
        {product.rating ? (
          <span className="flex items-center gap-1.5 text-xs text-muted">
            <Stars rating={product.rating} /> ({product.review_count})
          </span>
        ) : null}
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2">
          <span className="text-[1.05rem] font-bold text-brand-600 tabular-nums">{tzs(product.price)}</span>
          {product.compare_at_price ? (
            <span className="text-xs text-muted line-through tabular-nums">{tzs(product.compare_at_price)}</span>
          ) : null}
        </div>
        <QuickAdd product={product} />
      </div>
    </article>
  );
}
