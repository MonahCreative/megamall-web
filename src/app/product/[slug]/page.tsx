import { ChevronRight, PlayCircle, ShieldCheck, Truck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BuyBox } from "@/components/buy-box";
import { Countdown } from "@/components/countdown";
import { ProductGallery } from "@/components/product-gallery";
import { ProductRow } from "@/components/product-row";
import { RecentlyViewed, TrackView } from "@/components/recently-viewed";
import { ApiError, getProduct, getStore } from "@/lib/api";
import { tzs } from "@/lib/format";
import { SITE_URL } from "@/lib/site";
import type { ProductPage as ProductData } from "@/lib/types";

type Params = Promise<{ slug: string }>;

async function load(slug: string): Promise<ProductData> {
  try {
    return await getProduct(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}

/** What WhatsApp, Facebook and Google show for a product link: photo, name and price. */
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { data } = await getProduct(slug);
    const price = tzs(data.price) + (data.compare_at_price ? ` (was ${tzs(data.compare_at_price)})` : "");
    const description = [price, data.in_stock ? null : "Out of stock", data.short_description].filter(Boolean).join(" · ");
    const images = data.image ? [{ url: data.image, width: 1000, height: 1000, alt: data.name }] : [];

    return {
      title: data.name,
      description,
      alternates: { canonical: `/product/${data.slug}` },
      openGraph: { type: "website", url: `/product/${data.slug}`, title: `${data.name} · ${tzs(data.price)}`, description, images },
      twitter: { card: "summary_large_image", title: `${data.name} · ${tzs(data.price)}`, description, images: images.map((image) => image.url) },
      other: { "product:price:amount": String(data.price), "product:price:currency": "TZS" },
    };
  } catch {
    return { title: "Product" };
  }
}

/** Product details in Google's format, so search results can show price, stock and stars. */
function ProductStructuredData({ product }: { product: ProductData["data"] }) {
  const json = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.length ? product.images : product.image ? [product.image] : undefined,
    description: product.short_description ?? undefined,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    category: product.category?.name,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/product/${product.slug}`,
      priceCurrency: "TZS",
      price: product.price,
      availability: product.in_stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  // "<" is escaped so text from the admin can never close the script tag.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json).replace(/</g, "\\u003c") }} />;
}

export default function ProductPage({ params }: { params: Params }) {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-5">
      <Suspense fallback={<ProductSkeleton />}>
        <Product params={params} />
      </Suspense>
    </div>
  );
}

/** YouTube links become an embedded player; other links (TikTok, Instagram) open in a new tab. */
function videoEmbed(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  return match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : null;
}

async function Product({ params }: { params: Params }) {
  const { slug } = await params;
  const [{ data: product, related }, store] = await Promise.all([load(slug), getStore().catch(() => null)]);
  const embed = product.video_url ? videoEmbed(product.video_url) : null;
  const badge = product.discount_percent ? `-${product.discount_percent}%` : null;

  return (
    <div className="grid gap-14">
      <ProductStructuredData product={product} />
      <TrackView productId={product.id} />
      <div>
        <nav className="mb-4 flex flex-wrap items-center gap-1 text-sm text-muted" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-brand-700">Home</Link>
          <ChevronRight className="size-3.5" />
          {product.category && (
            <>
              <Link href={`/products?category=${product.category.slug}`} className="hover:text-brand-700">
                {product.category.name}
              </Link>
              <ChevronRight className="size-3.5" />
            </>
          )}
          <span className="line-clamp-1 text-ink">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <ProductGallery images={product.images.length ? product.images : product.image ? [product.image] : []} name={product.name} badge={badge} />

          <div className="grid content-start gap-5">
            <div className="grid gap-2">
              {product.brand && <span className="text-sm font-semibold tracking-wide text-brand-700 uppercase">{product.brand}</span>}
              <h1 className="text-3xl leading-tight font-bold tracking-tight text-balance sm:text-4xl">{product.name}</h1>
            </div>

            <div className="grid gap-2 rounded-2xl bg-white p-5">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-3xl font-bold text-brand-600 tabular-nums">{tzs(product.price)}</span>
                {product.compare_at_price ? (
                  <>
                    <span className="text-lg text-muted line-through tabular-nums">{tzs(product.compare_at_price)}</span>
                    <span className="rounded-md bg-sale/10 px-2 py-0.5 text-sm font-bold text-sale">
                      Save {tzs(product.compare_at_price - product.price)}
                    </span>
                  </>
                ) : null}
              </div>
              {product.promotion && (
                <div className="flex flex-wrap items-center gap-3">
                  {product.promotion.badge && <span className="rounded-md bg-ink px-2 py-0.5 text-xs font-semibold text-white">{product.promotion.badge}</span>}
                  <Countdown endsAt={product.promotion.ends_at} />
                </div>
              )}
              {product.short_description && <p className="text-muted">{product.short_description}</p>}
            </div>

            <BuyBox product={product} whatsapp={store?.whatsapp ?? null} />

            <ul className="grid gap-3 rounded-2xl border border-line bg-white p-5 text-sm">
              <li className="flex gap-3">
                <ShieldCheck className="size-5 shrink-0 text-whatsapp" />
                <span>
                  <strong>Dar es Salaam:</strong> pay on delivery, after you check the item. Usually delivered within 24 hours.
                </span>
              </li>
              <li className="flex gap-3">
                <Truck className="size-5 shrink-0 text-brand-600" />
                <span>
                  <strong>Other regions:</strong> pay first by mobile money, delivered by bus parcel in 2 to 5 days.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {product.video_url && (
        <section id="video" className="grid scroll-mt-40 gap-4">
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <PlayCircle className="size-6 text-brand-600" /> See it working
          </h2>
          {embed ? (
            <div className="aspect-video max-w-3xl overflow-hidden rounded-2xl bg-black">
              <iframe src={embed} title={`${product.name} video`} className="size-full" allow="encrypted-media; picture-in-picture" allowFullScreen />
            </div>
          ) : (
            <a href={product.video_url} target="_blank" rel="noreferrer" className="w-fit rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white">
              Watch the video
            </a>
          )}
        </section>
      )}

      {product.description && (
        <section className="grid gap-4">
          <h2 className="text-2xl font-bold tracking-tight">Product details</h2>
          {/* Written by staff in the admin panel's editor. */}
          <div className="prose-mm max-w-3xl rounded-2xl bg-white p-6 leading-relaxed" dangerouslySetInnerHTML={{ __html: product.description }} />
        </section>
      )}


      <RecentlyViewed excludeId={product.id} />
      {related.length > 0 && <ProductRow section={{ id: 0, title: "You may also like", subtitle: null, source: "related", link: product.category ? `/products?category=${product.category.slug}` : null, products: related }} />}
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      <div className="aspect-square animate-pulse rounded-3xl bg-white" />
      <div className="grid content-start gap-4">
        <div className="h-10 w-3/4 animate-pulse rounded-lg bg-white" />
        <div className="h-28 animate-pulse rounded-2xl bg-white" />
        <div className="h-13 animate-pulse rounded-xl bg-white" />
      </div>
    </div>
  );
}
