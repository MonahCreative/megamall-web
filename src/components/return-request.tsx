"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError, api, post } from "@/lib/api";
import { tzs } from "@/lib/format";
import type { Order } from "@/lib/types";
import { Field, Select, TextArea, TextInput } from "./form";

export function ReturnRequestForm() {
  const search = useSearchParams();
  const [lookup, setLookup] = useState({ order_number: search.get("order") ?? "", phone: "" });
  const [order, setOrder] = useState<Order | null>(null);
  const [reasons, setReasons] = useState<{ key: string; label: string }[]>([]);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ number: string; amount: number; message: string } | null>(null);

  useEffect(() => {
    api<{ data: { key: string; label: string }[] }>("/returns/reasons").then((response) => setReasons(response.data)).catch(() => undefined);
  }, []);

  const find = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { data } = await post<{ data: Order }>("/orders/track", lookup);
      if (data.status !== "delivered") {
        setError(`This order is "${data.status_label}". Returns can be requested once it has been delivered.`);
        setOrder(null);
      } else {
        setOrder(data);
        setQuantities({});
      }
    } catch (problem) {
      setError(problem instanceof ApiError ? problem.firstMessage : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!order) return;
    const items = order.items.map((item) => ({ order_item_id: item.id, quantity: quantities[item.id] ?? 0 })).filter((item) => item.quantity > 0);
    if (items.length === 0) return setError("Choose how many of each item you are returning.");
    if (!reason) return setError("Choose a reason.");
    setBusy(true);
    setError("");
    try {
      const response = await post<{ data: { return_number: string; refund_amount: number }; message: string }>("/returns", {
        ...lookup,
        reason,
        details: details || null,
        items,
      });
      setDone({ number: response.data.return_number, amount: response.data.refund_amount, message: response.message });
    } catch (problem) {
      setError(problem instanceof ApiError ? problem.firstMessage : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="grid justify-items-center gap-2 rounded-3xl bg-white p-8 text-center">
        <CheckCircle2 className="size-11 text-whatsapp" />
        <h2 className="text-2xl font-bold">Return requested</h2>
        <p>
          Return number <strong>{done.number}</strong> · value {tzs(done.amount)}
        </p>
        <p className="max-w-md text-sm text-muted">{done.message}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <form onSubmit={find} className="grid gap-4 rounded-3xl bg-white p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:p-7">
        <Field label="Order number">
          <TextInput required value={lookup.order_number} onChange={(event) => setLookup({ ...lookup, order_number: event.target.value })} placeholder="MM261013-AB12C" />
        </Field>
        <Field label="Phone number">
          <TextInput required type="tel" value={lookup.phone} onChange={(event) => setLookup({ ...lookup, phone: event.target.value })} placeholder="0712 345 678" />
        </Field>
        <button type="submit" disabled={busy && !order} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-ink px-6 font-semibold text-white disabled:opacity-60">
          {busy && !order && <Loader2 className="size-4 animate-spin" />} Find order
        </button>
      </form>

      {error && <p className="rounded-xl bg-sale/10 p-3 text-sm font-semibold text-sale">{error}</p>}

      {order && (
        <form onSubmit={send} className="grid gap-5 rounded-3xl bg-white p-5 sm:p-7">
          <h2 className="text-lg font-bold">What are you returning?</h2>
          <ul className="grid gap-3">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-line p-3">
                <span className="min-w-0 text-sm">
                  <span className="font-medium">{item.name}</span>
                  {item.variant && <span className="block text-xs text-muted">{item.variant}</span>}
                  <span className="block text-xs text-muted">Bought {item.quantity} · {tzs(item.unit_price)} each</span>
                </span>
                <select
                  aria-label={`How many ${item.name} to return`}
                  value={quantities[item.id] ?? 0}
                  onChange={(event) => setQuantities({ ...quantities, [item.id]: Number(event.target.value) })}
                  className="h-10 rounded-xl border border-line bg-white px-3"
                >
                  {Array.from({ length: item.quantity + 1 }, (_, count) => (
                    <option key={count} value={count}>
                      {count}
                    </option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
          <Field label="Reason">
            <Select value={reason} onChange={(event) => setReason(event.target.value)}>
              <option value="">Choose a reason</option>
              {reasons.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Tell us more (optional)">
            <TextArea rows={3} maxLength={1000} value={details} onChange={(event) => setDetails(event.target.value)} />
          </Field>
          <button type="submit" disabled={busy} className="flex h-12 w-fit items-center gap-2 rounded-xl bg-brand-600 px-6 font-semibold text-white disabled:opacity-60">
            {busy && <Loader2 className="size-4 animate-spin" />} Send return request
          </button>
        </form>
      )}
    </div>
  );
}
