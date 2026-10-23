"use client";

import { LayoutGrid } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { Category } from "@/lib/types";

export function CategoryChips({ categories }: { categories: Category[] }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const active = pathname === "/products" ? (params.get("category") ?? "all") : null;

  const chip = (selected: boolean) =>
    `shrink-0 rounded-full px-4 py-1.5 text-[0.86rem] font-semibold transition ${
      selected ? "bg-brand-600 text-white shadow-sm shadow-brand-600/30" : "bg-canvas text-ink/80 hover:bg-brand-50 hover:text-brand-700"
    }`;

  return (
    <nav aria-label="Categories" className="no-scrollbar flex gap-2 overflow-x-auto py-2.5">
      <Link href="/products" className={`${chip(active === "all")} flex items-center gap-1.5`}>
        <LayoutGrid className="size-4" /> All products
      </Link>
      {categories.map((category) => (
        <Link key={category.id} href={`/products?category=${category.slug}`} className={chip(active === category.slug)}>
          {category.name}
        </Link>
      ))}
    </nav>
  );
}
