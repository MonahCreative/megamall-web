"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function SearchBox({ className = "" }: { className?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [term, setTerm] = useState(params.get("q") ?? "");

  return (
    <form
      role="search"
      className={`relative ${className}`}
      onSubmit={(event) => {
        event.preventDefault();
        const query = term.trim();
        router.push(query ? `/products?q=${encodeURIComponent(query)}` : "/products");
      }}
    >
      <Search className="pointer-events-none absolute top-1/2 left-4 size-4.5 -translate-y-1/2 text-muted" />
      <input
        type="search"
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        placeholder="Search products, brands, categories..."
        aria-label="Search products"
        className="h-11 w-full rounded-full border border-line bg-canvas pr-4 pl-11 text-sm outline-none transition placeholder:text-muted/80 focus:border-brand-500 focus:bg-white"
      />
    </form>
  );
}
