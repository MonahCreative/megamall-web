import { Star } from "lucide-react";

export function Stars({ rating, size = "size-3.5" }: { rating: number; size?: string }) {
  return (
    <span className="flex items-center" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size} ${rating >= star - 0.25 ? "fill-amber-400 text-amber-400" : rating >= star - 0.75 ? "fill-amber-400/50 text-amber-400" : "fill-line text-line"}`}
        />
      ))}
    </span>
  );
}
