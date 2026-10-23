import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutForm } from "@/components/checkout-form";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-6">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Checkout</h1>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-white" />}>
        <CheckoutForm />
      </Suspense>
    </div>
  );
}
