import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderView } from "@/components/order-view";

export const metadata: Metadata = { title: "Your order", robots: { index: false } };

export default function OrderPage({ params }: { params: Promise<{ number: string }> }) {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-6">
      <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-white" />}>
        <OrderView params={params} />
      </Suspense>
    </div>
  );
}
