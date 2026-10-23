"use client";

import { Pause, Play } from "lucide-react";
import { useState } from "react";

export function Ticker({ messages }: { messages: string[] }) {
  const [paused, setPaused] = useState(false);
  if (messages.length === 0) return null;
  const run = [...messages, ...messages, ...messages];

  return (
    <div className={`relative bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 text-white ${paused ? "ticker-paused" : ""}`}>
      <div className="overflow-hidden py-2 pr-24" aria-label="Shop announcements">
        <div className="ticker-track flex w-max gap-10 whitespace-nowrap text-[0.82rem] font-semibold">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex gap-10" aria-hidden={copy === 1}>
              {run.map((message, index) => (
                <span key={index} className="flex items-center gap-10">
                  {message}
                  <span className="size-1.5 rounded-full bg-white/60" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setPaused((value) => !value)}
        className="absolute inset-y-0 right-0 flex items-center gap-1 bg-gradient-to-l from-brand-500 from-70% to-transparent pr-3 pl-8 text-xs font-semibold hover:text-white/80"
      >
        {paused ? <Play className="size-3" /> : <Pause className="size-3" />}
        {paused ? "Play" : "Pause"}
      </button>
    </div>
  );
}
