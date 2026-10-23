import { ChevronRight, Flame, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";
import type { Section } from "@/lib/types";
import { ProductCard } from "./product-card";

const icons = { discounted: Flame, best_selling: TrendingUp } as const;

export function ProductRow({ section }: { section: Section }) {
  const Icon = icons[section.source as keyof typeof icons] ?? Sparkles;

  return (
    <section className="grid gap-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Icon className="size-6 text-brand-600" /> {section.title}
          </h2>
          {section.subtitle && <p className="mt-0.5 text-sm text-muted">{section.subtitle}</p>}
        </div>
        {section.link && (
          <Link href={section.link} className="flex shrink-0 items-center gap-0.5 text-sm font-semibold text-brand-700 hover:underline">
            View all <ChevronRight className="size-4" />
          </Link>
        )}
      </div>
      <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:gap-4">
        {section.products.map((product) => (
          <div key={product.id} className="w-[46%] shrink-0 snap-start sm:w-56">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
