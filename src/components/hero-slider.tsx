"use client";

import { ChevronLeft, ChevronRight, PlayCircle, ShieldCheck, Tag, Truck, Zap } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { tzs, whatsappLink } from "@/lib/format";
import type { Banner } from "@/lib/types";
import { WhatsAppIcon } from "./icons";

export function HeroSlider({ banners, whatsapp }: { banners: Banner[]; whatsapp: string | null }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = banners.length;
  const go = useCallback((next: number) => setIndex((next + count) % count), [count]);

  useEffect(() => {
    if (paused || count < 2) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % count), 6500);
    return () => clearInterval(timer);
  }, [paused, count]);

  if (count === 0) return null;
  const banner = banners[index];
  const product = banner.product;
  const href = banner.link ?? (product ? `/product/${product.slug}` : "/products");
  const chat = whatsappLink(whatsapp, `Habari, I want to order: ${banner.title}${product ? ` (${tzs(product.price)})` : ""}`);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured products"
      className="relative overflow-hidden rounded-3xl bg-navy text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="pointer-events-none absolute -top-32 -left-24 size-96 rounded-full bg-brand-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 -bottom-40 size-96 rounded-full bg-indigo-500/10 blur-3xl" />

      <div key={banner.id} className="relative grid items-center gap-8 px-6 pt-8 pb-14 sm:px-10 lg:grid-cols-[1.25fr_1fr] lg:px-12 lg:py-12">
        <div className="grid gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            {product?.discount_percent ? (
              <span className="flex items-center gap-1 rounded-full bg-brand-600 px-3 py-1">
                <Zap className="size-3.5 fill-current" /> SAVE {product.discount_percent}%
              </span>
            ) : null}
            {banner.badge && (
              <span className="flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1">
                {product?.has_video ? <PlayCircle className="size-3.5" /> : <Tag className="size-3.5" />} {banner.badge}
              </span>
            )}
            {product?.promotion?.badge && <span className="rounded-full bg-sale px-3 py-1">{product.promotion.badge}</span>}
          </div>

          <h2 className="line-clamp-3 text-3xl leading-[1.05] font-bold tracking-tight text-balance sm:text-4xl lg:text-[3.1rem]">
            {banner.title}
          </h2>

          {product && (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-3xl font-bold text-brand-500 tabular-nums sm:text-4xl">{tzs(product.price)}</span>
              {product.compare_at_price ? (
                <span className="text-lg text-white/50 line-through tabular-nums">{tzs(product.compare_at_price)}</span>
              ) : null}
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                  product.in_stock ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" : "border-white/20 text-white/60"
                }`}
              >
                {product.in_stock ? "In stock" : "Out of stock"}
              </span>
            </div>
          )}

          {banner.subtitle && <p className="max-w-xl text-white/75">{banner.subtitle}</p>}

          <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm font-medium">
            <span className="flex items-center gap-1.5 text-brand-500">
              <Truck className="size-4" /> Delivery to all 31 regions
            </span>
            <span className="flex items-center gap-1.5 text-emerald-300">
              <ShieldCheck className="size-4" /> Pay on delivery in Dar
            </span>
          </div>

          <div className="mt-2 flex flex-wrap gap-3">
            <Link
              href={href}
              className="flex h-12 items-center gap-2 rounded-xl bg-brand-600 px-6 font-semibold shadow-lg shadow-brand-600/30 transition hover:bg-brand-500"
            >
              <Zap className="size-4 fill-current" /> {banner.button_text || "Buy now"}
            </Link>
            {chat && (
              <a
                href={chat}
                target="_blank"
                rel="noreferrer"
                className="flex h-12 items-center gap-2 rounded-xl bg-whatsapp px-6 font-semibold transition hover:brightness-110"
              >
                <WhatsAppIcon className="size-5" /> WhatsApp
              </a>
            )}
            {product?.has_video && (
              <Link
                href={`/product/${product.slug}#video`}
                className="flex h-12 items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 text-sm font-semibold hover:bg-white/10"
              >
                <PlayCircle className="size-4" /> See how it works
              </Link>
            )}
          </div>
        </div>

        <Link href={href} className="order-first mx-auto w-full max-w-[240px] rounded-3xl border border-white/10 bg-white/5 p-2.5 sm:max-w-sm lg:order-none lg:max-w-md lg:p-3">
          {banner.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={banner.image} alt={banner.title} className="aspect-square w-full rounded-2xl object-cover" />
          )}
        </Link>
      </div>

      {count > 1 && (
        <>
          <div className="absolute bottom-5 left-6 flex gap-1.5 sm:left-10 lg:left-12">
            {banners.map((item, dot) => (
              <button
                key={item.id}
                type="button"
                onClick={() => go(dot)}
                className={`h-1.5 rounded-full transition-all ${dot === index ? "w-8 bg-brand-500" : "w-1.5 bg-white/40 hover:bg-white/70"}`}
                aria-label={`Show slide ${dot + 1}`}
                aria-current={dot === index}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(index - 1)}
            className="absolute right-16 bottom-4 hidden size-9 place-items-center rounded-full bg-white/10 hover:bg-white/20 lg:grid"
            aria-label="Previous slide"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            className="absolute right-5 bottom-4 hidden size-9 place-items-center rounded-full bg-white/10 hover:bg-white/20 lg:grid"
            aria-label="Next slide"
          >
            <ChevronRight className="size-5" />
          </button>
        </>
      )}
    </section>
  );
}
