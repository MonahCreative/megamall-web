import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto grid max-w-lg place-items-center gap-3 px-4 py-24 text-center">
      <p className="text-6xl font-bold text-brand-600">404</p>
      <h1 className="text-2xl font-bold">We can&apos;t find that page</h1>
      <p className="text-muted">The product may have been removed, or the link is wrong.</p>
      <Link href="/products" className="mt-2 rounded-full bg-brand-600 px-6 py-3 font-semibold text-white">
        Browse all products
      </Link>
    </div>
  );
}
