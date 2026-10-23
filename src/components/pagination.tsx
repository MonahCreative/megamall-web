import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

/** Page links that keep the current filters. */
export function Pagination({ page, lastPage, params, basePath = "/products" }: { page: number; lastPage: number; params: Record<string, string>; basePath?: string }) {
  if (lastPage <= 1) return null;
  const href = (target: number) => {
    const query = new URLSearchParams({ ...params, page: String(target) });
    return `${basePath}?${query}`;
  };
  const button = "grid size-10 place-items-center rounded-full border border-line bg-white";

  return (
    <nav className="flex items-center justify-center gap-3" aria-label="Pages">
      {page > 1 ? (
        <Link href={href(page - 1)} className={`${button} hover:border-brand-500`} aria-label="Previous page">
          <ChevronLeft className="size-4" />
        </Link>
      ) : (
        <span className={`${button} opacity-40`}><ChevronLeft className="size-4" /></span>
      )}
      <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold tabular-nums">
        {page} / {lastPage}
      </span>
      {page < lastPage ? (
        <Link href={href(page + 1)} className={`${button} hover:border-brand-500`} aria-label="Next page">
          <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span className={`${button} opacity-40`}><ChevronRight className="size-4" /></span>
      )}
    </nav>
  );
}
