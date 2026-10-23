"use client";

import { AlertCircle, Loader2, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { ApiError, api, post } from "@/lib/api";
import { normalizePhone, tzs } from "@/lib/format";
import type { Order, Store } from "@/lib/types";
import { Countdown } from "./countdown";
import { Field, TextInput } from "./form";

const colours: Record<string, string> = { mpesa: "#e4002b", mixx: "#1d4fd8", airtel: "#ed1c24", halopesa: "#f28c00" };

/** Mobile money for orders outside Dar es Salaam: send the PIN prompt, then wait for it to be approved. */
export function PaymentPanel({ order, token, onUpdate }: { order: Order; token: string; onUpdate: (order: Order) => void }) {
  const [channels, setChannels] = useState<Store["payment_channels"]>([]);
  const [channel, setChannel] = useState("mpesa");
  const [phone, setPhone] = useState(order.phone?.replace(/\s/g, "") ?? "");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const waiting = order.payment?.status === "pending";

  useEffect(() => {
    api<Store>("/store").then((store) => setChannels(store.payment_channels)).catch(() => undefined);
  }, []);

  // While the customer approves on their phone, check every 3 seconds for up to 3 minutes.
  useEffect(() => {
    if (!waiting) return;
    let tries = 0;
    const timer = setInterval(async () => {
      tries += 1;
      try {
        const { data } = await api<{ data: Order }>(`/orders/${order.order_number}/payment-status?token=${encodeURIComponent(token)}`);
        onUpdate(data);
        if (data.payment?.status !== "pending" || tries > 60) clearInterval(timer);
      } catch {
        // keep trying; a dropped request is normal on mobile data
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [waiting, order.order_number, token, onUpdate]);

  const pay = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!normalizePhone(phone)) {
      setError("Enter the mobile money number to charge, for example 0712 345 678.");
      return;
    }
    setError("");
    setSending(true);
    try {
      const { data } = await post<{ data: Order }>(`/orders/${order.order_number}/pay`, { token, channel, phone });
      onUpdate(data);
    } catch (problem) {
      setError(problem instanceof ApiError ? problem.firstMessage : "We couldn't send the payment request. Try again.");
    } finally {
      setSending(false);
    }
  };

  if (waiting) {
    return (
      <div className="grid justify-items-center gap-3 rounded-3xl border-2 border-sky-500 bg-sky-50 p-6 text-center">
        <Loader2 className="size-9 animate-spin text-sky-700" />
        <p className="text-lg font-bold text-sky-900">Check your phone</p>
        <p className="max-w-sm text-sm text-sky-900/80">
          We sent a payment request of <strong>{tzs(order.total)}</strong> to {order.payment?.channel_label ?? "your phone"}. Enter your PIN to approve it.
          This page updates by itself.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={pay} className="grid gap-4 rounded-3xl border-2 border-sky-500 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <Smartphone className="size-5 text-sky-700" /> Pay {tzs(order.total)} with mobile money
        </h2>
        {order.expires_at && <Countdown endsAt={order.expires_at} label="Pay within" />}
      </div>
      {order.payment?.status === "failed" && (
        <p className="flex gap-2 rounded-xl bg-sale/10 p-3 text-sm font-medium text-sale">
          <AlertCircle className="size-5 shrink-0" /> {order.payment.failure_reason ?? "The payment was not approved."} Try again below.
        </p>
      )}
      <fieldset className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <legend className="sr-only">Mobile money provider</legend>
        {channels.map((item) => (
          <label
            key={item.key}
            className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 px-3 py-3 text-sm font-semibold ${channel === item.key ? "border-sky-600 bg-sky-50" : "border-line"}`}
          >
            <input type="radio" name="channel" value={item.key} checked={channel === item.key} onChange={() => setChannel(item.key)} className="sr-only" />
            <span className="size-3 shrink-0 rounded-full" style={{ background: colours[item.key] ?? "#64748b" }} />
            {item.label}
          </label>
        ))}
      </fieldset>
      <Field label="Mobile money number to charge" error={error}>
        <TextInput type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="0712 345 678" error={error} />
      </Field>
      <button type="submit" disabled={sending} className="flex h-13 items-center justify-center gap-2 rounded-xl bg-sky-600 font-semibold text-white hover:bg-sky-700 disabled:opacity-60">
        {sending && <Loader2 className="size-4 animate-spin" />}
        Send payment request
      </button>
      <p className="text-xs text-muted">You will get a prompt on your phone. Your order is confirmed as soon as the payment goes through.</p>
    </form>
  );
}
