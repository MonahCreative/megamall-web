"use client";

import { useState } from "react";

export function ProductGallery({ images, name, badge }: { images: string[]; name: string; badge: string | null }) {
  const [active, setActive] = useState(0);
  const shown = images[active] ?? images[0];

  return (
    <div className="grid gap-3">
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-line bg-white">
        {shown && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shown} alt={name} className="size-full object-cover" />
        )}
        {badge && <span className="absolute top-4 left-4 rounded-lg bg-sale px-2.5 py-1 text-sm font-bold text-white">{badge}</span>}
      </div>
      {images.length > 1 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              className={`size-18 shrink-0 overflow-hidden rounded-xl border-2 bg-white ${index === active ? "border-brand-500" : "border-transparent opacity-75 hover:opacity-100"}`}
              aria-label={`Show photo ${index + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
