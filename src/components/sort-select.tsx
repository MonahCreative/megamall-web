"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const options = [
  ["", "Newest first"],
  ["popular", "Best selling"],
  ["discount", "Biggest discount"],
  ["price_asc", "Price: low to high"],
  ["price_desc", "Price: high to low"],
] as const;

export function SortSelect({ current }: { current: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted">Sort by</span>
      <select
        value={current}
        onChange={(event) => {
          const next = new URLSearchParams(params);
          if (event.target.value) next.set("sort", event.target.value);
          else next.delete("sort");
          next.delete("page");
          router.push(`${pathname}?${next}`);
        }}
        className="h-10 rounded-full border border-line bg-white px-4 font-medium outline-none focus:border-brand-500"
      >
        {options.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
