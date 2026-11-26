import { ChevronRight, ShoppingBag } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { HeroSlider } from "@/components/hero-slider";
import { JsonLd } from "@/components/json-ld";
import { ProductGrid, ProductGridSkeleton } from "@/components/product-grid";
import { ProductRow } from "@/components/product-row";
import { RecentlyViewed } from "@/components/recently-viewed";
import { getBanners, getProducts, getSections, getStore } from "@/lib/api";
import { plural } from "@/lib/format";
import { SITE_URL, SOCIAL } from "@/lib/site";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function HomePage() {
  return (
    <div className="mx-auto grid max-w-7xl gap-12 px-4 pt-5">
      <Suspense fallback={<div className="h-[520px] animate-pulse rounded-3xl bg-navy lg:h-[440px]" />}>
        <Hero />
      </Suspense>
      <Suspense fallback={null}>
        <Sections />
      </Suspense>
      <Suspense fallback={<ProductGridSkeleton />}>
        <AllProducts />
      </Suspense>
      <RecentlyViewed />
      <Suspense fallback={null}>
        <StoreStructuredData />
      </Suspense>
    </div>
  );
}

/** Tells Google who runs the shop: name, logo, contact number and social profiles (shown in the business panel). */
async function StoreStructuredData() {
  const store = await getStore().catch(() => null);
  const phone = store?.whatsapp ?? store?.phone;
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "OnlineStore",
          name: store?.name ?? "Mega Mall Tanzania",
          url: `${SITE_URL}/`,
          logo: `${SITE_URL}/brand/logo.png`,
          description: store?.tagline ?? undefined,
          email: store?.email ?? undefined,
          telephone: phone ? `+${phone.replace(/\D/g, "").replace(/^0/, "255")}` : undefined,
          areaServed: { "@type": "Country", name: "Tanzania" },
          sameAs: [SOCIAL.facebook, SOCIAL.instagram],
          hasMerchantReturnPolicy: store?.return_window_days
            ? {
                "@type": "MerchantReturnPolicy",
                applicableCountry: "TZ",
                returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
                merchantReturnDays: store.return_window_days,
              }
            : undefined,
        }}
      />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebSite", name: store?.name ?? "Mega Mall Tanzania", alternateName: "Mega Mall", url: `${SITE_URL}/` }} />
    </>
  );
}

async function Hero() {
  const [banners, store] = await Promise.all([getBanners().catch(() => []), getStore().catch(() => null)]);
  return <HeroSlider banners={banners} whatsapp={store?.whatsapp ?? null} />;
}

async function Sections() {
  const sections = await getSections().catch(() => []);
  return sections.map((section) => <ProductRow key={section.id} section={section} />);
}

async function AllProducts() {
  const products = await getProducts({ per_page: 20 });
  return (
    <section className="grid gap-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <ShoppingBag className="size-6 text-brand-600" /> All products
          </h2>
          <p className="mt-0.5 text-sm text-muted">{plural(products.meta.total, "product")} found</p>
        </div>
        <Link href="/products" className="flex items-center gap-0.5 text-sm font-semibold text-brand-700 hover:underline">
          View all <ChevronRight className="size-4" />
        </Link>
      </div>
      <ProductGrid products={products.data} />
      {products.meta.last_page > 1 && (
        <Link
          href="/products?page=2"
          className="mx-auto flex h-11 items-center gap-1 rounded-full border border-line bg-white px-6 text-sm font-semibold hover:border-brand-500"
        >
          See more products <ChevronRight className="size-4" />
        </Link>
      )}
    </section>
  );
}
