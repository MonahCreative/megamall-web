"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto grid max-w-lg place-items-center gap-3 px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-muted">We couldn&apos;t load this page. Check your connection and try again.</p>
      <button type="button" onClick={reset} className="mt-2 rounded-full bg-brand-600 px-6 py-3 font-semibold text-white">
        Try again
      </button>
    </div>
  );
}
