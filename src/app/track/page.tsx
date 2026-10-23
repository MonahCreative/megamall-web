import type { Metadata } from "next";
import { Suspense } from "react";
import { TrackOrder } from "@/components/track-order";

export const metadata: Metadata = { title: "Track your order" };

export default function TrackPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-6">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Track your order</h1>
      <p className="mb-6 text-muted">Enter the order number from your confirmation and the phone number you ordered with.</p>
      <Suspense fallback={null}>
        <TrackOrder />
      </Suspense>
    </div>
  );
}
