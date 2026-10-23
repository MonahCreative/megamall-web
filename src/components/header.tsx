import { Package, Store as StoreIcon } from "lucide-react";
import Link from "next/link";
import { getCategories, getStore } from "@/lib/api";
import { whatsappLink } from "@/lib/format";
import { CartButton } from "./cart-button";
import { CategoryChips } from "./category-chips";
import { Logo, WhatsAppIcon } from "./icons";
import { MobileMenu } from "./mobile-menu";
import { SearchBox } from "./search-box";
import { Ticker } from "./ticker";
import { WishlistLink } from "./wishlist-link";

export async function Header() {
  const [store, categories] = await Promise.all([getStore().catch(() => null), getCategories().catch(() => [])]);
  const chat = whatsappLink(store?.whatsapp, "Habari Mega Mall, I need help with an order.");

  return (
    <header className="sticky top-0 z-40 bg-white shadow-[0_1px_0_var(--color-line)]">
      <Ticker messages={store?.ticker ?? []} />
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 lg:flex-nowrap lg:gap-4">
        <MobileMenu categories={categories} />
        <Link href="/" aria-label="Mega Mall home" className="mr-auto lg:mr-2">
          <Logo />
        </Link>
        <SearchBox className="order-last w-full lg:order-none lg:max-w-xl lg:flex-1" />
        <nav className="flex items-center gap-2">
          <Link
            href="/products"
            className="hidden h-11 items-center gap-1.5 rounded-full border border-line px-4 text-sm font-semibold hover:bg-canvas md:flex"
          >
            <StoreIcon className="size-4" /> Shop
          </Link>
          <Link
            href="/track"
            className="hidden h-11 items-center gap-1.5 rounded-full border border-line px-4 text-sm font-semibold hover:bg-canvas md:flex"
          >
            <Package className="size-4" /> Track order
          </Link>
          {chat && (
            <a
              href={chat}
              target="_blank"
              rel="noreferrer"
              className="hidden size-11 place-items-center rounded-full border border-line text-whatsapp hover:bg-green-50 sm:grid"
              aria-label="Chat on WhatsApp"
            >
              <WhatsAppIcon />
            </a>
          )}
          <WishlistLink />
          <CartButton />
        </nav>
      </div>
      <div className="border-t border-line/70">
        <div className="mx-auto max-w-7xl px-4">
          <CategoryChips categories={categories} />
        </div>
      </div>
    </header>
  );
}

/** Shown for a moment while the header's data loads. */
export function HeaderFallback() {
  return (
    <header className="sticky top-0 z-40 bg-white shadow-[0_1px_0_var(--color-line)]">
      <div className="h-9 bg-brand-600" />
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Logo />
        <div className="hidden h-11 flex-1 rounded-full bg-canvas lg:block" />
        <div className="ml-auto h-11 w-24 rounded-full bg-ink" />
      </div>
      <div className="h-12 border-t border-line/70" />
    </header>
  );
}
