"use client";

import { CheckCircle2, Clock, FileText, PartyPopper } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { use, useCallback, useEffect, useState } from "react";
import { useHydrated } from "@/lib/use-hydrated";
import { API_URL, ApiError, api } from "@/lib/api";
import { tzs } from "@/lib/format";
import type { Order } from "@/lib/types";
import { OrderSummary, OrderTimeline } from "./order-summary";
import { PaymentPanel } from "./payment-panel";

function savedToken(number: string): string {
  try {
    return JSON.parse(localStorage.getItem("megamall-orders") ?? "{}")[number] ?? "";
  } catch {
    return "";
  }
}

export function OrderView({ params }: { params: Promise<{ number: string }> }) {
  const { number } = use(params);
  const search = useSearchParams();
  const hydrated = useHydrated();
  const token = search.get("token") || (hydrated ? savedToken(number) : "");
  const [order, setOrder] = useState<Order | null>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!token) return;
    api<{ data: Order }>(`/orders/${number}?token=${encodeURIComponent(token)}`)
      .then((response) => setOrder(response.data))
      .catch((problem) => setLoadError(problem instanceof ApiError ? problem.message : "We couldn't load your order."));
  }, [number, token]);

  const update = useCallback((next: Order) => setOrder(next), []);
  const error = hydrated && !token ? "This link is missing its code. Use Track order with your order number and phone instead." : loadError;

  if (error) {
    return (
      <div className="grid gap-3 rounded-3xl bg-white p-8 text-center">
        <p className="font-semibold">{error}</p>
        <Link href="/track" className="mx-auto rounded-full bg-brand-600 px-6 py-3 font-semibold text-white">
          Track order
        </Link>
      </div>
    );
  }
  if (!order) return <div className="h-96 animate-pulse rounded-3xl bg-white" />;

  const justPaid = order.payment_mode === "prepaid" && order.payment_status === "paid";

  return (
    <div className="grid gap-5">
      <div className="grid gap-2 rounded-3xl bg-white p-6 text-center sm:p-8">
        {order.needs_payment ? (
          <Clock className="mx-auto size-11 text-sky-600" />
        ) : justPaid ? (
          <PartyPopper className="mx-auto size-11 text-brand-600" />
        ) : (
          <CheckCircle2 className="mx-auto size-11 text-whatsapp" />
        )}
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {order.needs_payment ? "Pay to confirm your order" : justPaid ? "Payment received. Asante!" : order.status === "cancelled" ? "Order cancelled" : "Order placed. Asante!"}
        </h1>
        <p className="text-muted">
          Order <strong className="text-ink">{order.order_number}</strong>
        </p>
        <p className="mx-auto max-w-md text-sm text-muted">
          {order.needs_payment
            ? `Your items are reserved. Pay ${tzs(order.total)} below to confirm, or the order is cancelled automatically.`
            : order.payment_mode === "cod" && order.status === "pending"
              ? `We will call ${order.phone} to confirm, then deliver. Have ${tzs(order.total)} ready when the rider arrives.`
              : justPaid && order.status === "confirmed"
                ? "We are packing your order and will send the bus parcel details to your phone."
                : `Status: ${order.status_label}.`}
        </p>
        <p className="text-xs text-muted">Save your order number. You can track this order any time with it and your phone number.</p>
      </div>

      {order.needs_payment && <PaymentPanel order={order} token={token} onUpdate={update} />}

      <div className="grid gap-6 rounded-3xl bg-white p-5 sm:p-7">
        <OrderTimeline order={order} />
        <OrderSummary order={order} />
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <a
          href={`${API_URL}/invoice/${encodeURIComponent(order.order_number)}?token=${encodeURIComponent(token)}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-full border border-line bg-white px-6 py-3 text-sm font-semibold hover:border-brand-500"
        >
          <FileText className="size-4" /> {order.payment_status === "paid" ? "Download receipt" : "Download invoice"}
        </a>
        <Link href="/products" className="rounded-full border border-line bg-white px-6 py-3 text-sm font-semibold hover:border-brand-500">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
