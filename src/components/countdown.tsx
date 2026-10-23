"use client";

import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { useHydrated } from "@/lib/use-hydrated";

/** "Ends in 1d 04:12:09" for a running promotion. */
export function Countdown({ endsAt, label = "Offer ends in" }: { endsAt: string; label?: string }) {
  const hydrated = useHydrated();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!hydrated) return null;
  const left = Math.max(0, Date.parse(endsAt) - now);
  if (left === 0) return null;
  const days = Math.floor(left / 864e5);
  const pad = (value: number) => String(value).padStart(2, "0");
  const time = `${pad(Math.floor(left / 36e5) % 24)}:${pad(Math.floor(left / 6e4) % 60)}:${pad(Math.floor(left / 1e3) % 60)}`;

  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-sale tabular-nums">
      <Clock className="size-4" /> {label} {days > 0 ? `${days}d ` : ""}
      {time}
    </span>
  );
}
