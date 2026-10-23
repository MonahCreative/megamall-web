"use client";

import { Loader2, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ApiError, post } from "@/lib/api";
import type { Order } from "@/lib/types";
import { Field, TextInput } from "./form";
import { OrderSummary, OrderTimeline } from "./order-summary";

export function TrackOrder() {
  const search = useSearchParams();
  const [form, setForm] = useState({ order_number: search.get("order") ?? "", phone: "" });
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { data } = await post<{ data: Order }>("/orders/track", form);
      setOrder(data);
    } catch (problem) {
      setOrder(null);
      setError(problem instanceof ApiError ? problem.firstMessage : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-5">
      <form onSubmit={submit} className="grid gap-4 rounded-3xl bg-white p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:p-7">
        <Field label="Order number">
          <TextInput required value={form.order_number} onChange={(event) => setForm({ ...form, order_number: event.target.value })} placeholder="MM261013-AB12C" />
        </Field>
        <Field label="Phone number">
          <TextInput required type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="0712 345 678" />
        </Field>
        <button type="submit" disabled={busy} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 font-semibold text-white disabled:opacity-60">
          {busy && <Loader2 className="size-4 animate-spin" />} Track
        </button>
        {error && <p className="text-sm font-semibold text-sale sm:col-span-3">{error}</p>}
      </form>

      {order && (
        <div className="grid gap-6 rounded-3xl bg-white p-5 sm:p-7">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-xl font-bold">Order {order.order_number}</h2>
            <span className="text-sm text-muted">
              Placed {new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
          <OrderTimeline order={order} />
          <OrderSummary order={order} />
          {order.returns.length > 0 && (
            <ul className="grid gap-2 border-t border-line pt-4 text-sm">
              {order.returns.map((item) => (
                <li key={item.return_number}>
                  Return <strong>{item.return_number}</strong>: {item.status_label}
                </li>
              ))}
            </ul>
          )}
          {order.status === "delivered" && (
            <Link
              href={`/returns?order=${encodeURIComponent(order.order_number)}`}
              className="flex w-fit items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-semibold hover:border-brand-500"
            >
              <RotateCcw className="size-4" /> Return an item
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
