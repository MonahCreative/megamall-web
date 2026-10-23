import Link from "next/link";
import { getCategories, getPages, getStore } from "@/lib/api";
import { Logo } from "./icons";

export async function Footer() {
  const [store, categories, pages] = await Promise.all([
    getStore().catch(() => null),
    getCategories().catch(() => []),
    getPages().catch(() => []),
  ]);

  return (
    <footer className="mt-16 bg-navy text-white/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="grid content-start gap-3">
          <span className="w-fit rounded-xl bg-white px-3 py-2">
            <Logo />
          </span>
          <p className="text-sm">{store?.tagline ?? "Everything you need, delivered across Tanzania."}</p>
          {store?.phone && (
            <p className="text-sm">
              Call or WhatsApp: <span className="font-semibold text-white">{store.phone}</span>
            </p>
          )}
          {store?.email && <p className="text-sm">{store.email}</p>}
        </div>
        <div>
          <h2 className="mb-3 font-semibold text-white">Shop</h2>
          <ul className="grid gap-2 text-sm">
            {categories.slice(0, 6).map((category) => (
              <li key={category.id}>
                <Link href={`/products?category=${category.slug}`} className="hover:text-white">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-3 font-semibold text-white">Help</h2>
          <ul className="grid gap-2 text-sm">
            <li>
              <Link href="/track" className="hover:text-white">Track your order</Link>
            </li>
            <li>
              <Link href="/returns" className="hover:text-white">Return an item</Link>
            </li>
            <li>
              <Link href="/products" className="hover:text-white">All products</Link>
            </li>
            {pages.map((page) => (
              <li key={page.slug}>
                <Link href={`/pages/${page.slug}`} className="hover:text-white">
                  {page.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-3 font-semibold text-white">How you pay</h2>
          <ul className="grid gap-2 text-sm">
            <li>
              <span className="font-semibold text-white">Dar es Salaam:</span> pay on delivery, after checking your item.
            </li>
            <li>
              <span className="font-semibold text-white">Other regions:</span> pay first with{" "}
              {store?.payment_channels.map((channel) => channel.label).join(", ") ?? "mobile money"}.
            </li>
            <li>Delivery is paid to the rider or bus company directly, not included in our prices.</li>
            <li>Returns accepted within {store?.return_window_days ?? 7} days of delivery.</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/50">© {store?.name ?? "Mega Mall Tanzania"}</div>
    </footer>
  );
}
