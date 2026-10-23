import type { Metadata } from "next";
import { Suspense } from "react";
import { ReturnRequestForm } from "@/components/return-request";

export const metadata: Metadata = { title: "Return an item" };

export default function ReturnsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-6">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Return an item</h1>
      <p className="mb-6 text-muted">Find your delivered order, choose what you are sending back and tell us why. We call you to arrange collection.</p>
      <Suspense fallback={null}>
        <ReturnRequestForm />
      </Suspense>
    </div>
  );
}
