"use client";

import { Check, Copy, Loader2, Store as StoreIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { tzs } from "@/lib/format";
import type { LipaNumber, Order, Store } from "@/lib/types";
import { Countdown } from "./countdown";

export const channelColours: Record<string, string> = {
  mpesa: "#e4002b",
  mixx: "#1d4fd8",
  airtel: "#ed1c24",
  halopesa: "#f28c00",
};

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Older phones without clipboard access: the number is on screen to type.
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy ${label}`}
      className="flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-line bg-white px-3 text-xs font-semibold hover:border-brand-500"
    >
      {copied ? <Check className="size-3.5 text-whatsapp" /> : <Copy className="size-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function AccountCard({ account }: { account: LipaNumber }) {
  return (
    <div className="grid gap-1 rounded-2xl border-2 border-line bg-canvas p-4">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <span className="size-3 shrink-0 rounded-full" style={{ background: channelColours[account.channel] ?? "#64748b" }} />
        {account.label} Lipa Namba
      </p>
      <div className="flex items-center justify-between gap-3">
        <span className="text-2xl font-bold tracking-wider tabular-nums sm:text-3xl">{account.number}</span>
        <CopyButton value={account.number} label="Lipa Namba" />
      </div>
      {account.name && (
        <p className="text-sm text-muted">
          Name: <strong className="text-ink">{account.name}</strong>
        </p>
      )}
    </div>
  );
}

/**
 * Orders outside Dar es Salaam, paid to the shop's own till number. The customer pays on their phone;
 * staff see the payment on the business phone, call the customer and record it in the admin.
 */
export function LipaNambaPanel({ order, token, store, onUpdate }: { order: Order; token: string; store: Store; onUpdate: (order: Order) => void }) {
  const accounts = store.lipa_numbers ?? [];

  // Staff record the payment in the admin: look every 20 seconds (up to 90 minutes) so this page turns "paid" by itself.
  useEffect(() => {
    let tries = 0;
    const timer = setInterval(async () => {
      tries += 1;
      try {
        const { data } = await api<{ data: Order }>(`/orders/${order.order_number}?token=${encodeURIComponent(token)}`);
        if (!data.needs_payment || data.status === "cancelled") {
          clearInterval(timer);
          onUpdate(data);
        }
      } catch {
        // keep trying; a dropped request is normal on mobile data
      }
      if (tries >= 270) clearInterval(timer);
    }, 20000);
    return () => clearInterval(timer);
  }, [order.order_number, token, onUpdate]);

  if (accounts.length === 0) {
    return (
      <div className="grid gap-2 rounded-3xl border-2 border-sky-500 bg-white p-6 text-center">
        <p className="text-lg font-bold">Pay {tzs(order.total)} to confirm</p>
        <p className="text-sm text-muted">
          Please call us{store.phone ? ` on ${store.phone}` : ""} and we will tell you where to pay. Have your order number {order.order_number} ready.
        </p>
      </div>
    );
  }

  const single = accounts.length === 1 ? accounts[0] : null;

  return (
    <div className="grid gap-5 rounded-3xl border-2 border-sky-500 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <StoreIcon className="size-5 text-sky-700" /> Pay {tzs(order.total)} to our Lipa Namba
        </h2>
        {order.expires_at && <Countdown endsAt={order.expires_at} label="Pay within" />}
      </div>

      <div className={`grid gap-3 ${accounts.length > 1 ? "sm:grid-cols-2" : ""}`}>
        {accounts.map((account) => (
          <AccountCard key={`${account.channel}-${account.number}`} account={account} />
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 rounded-2xl bg-canvas px-4 py-3">
        <span className="text-sm">
          Amount to pay: <strong className="text-lg tabular-nums">{tzs(order.total)}</strong>
        </span>
        <CopyButton value={String(order.total)} label="amount" />
      </div>

      <ol className="grid list-decimal gap-1.5 pl-5 text-sm text-ink/80">
        <li>
          Open your {single ? single.label : "mobile money"} menu and choose <strong>Lipa kwa simu</strong> (Lipa Namba).
        </li>
        <li>
          Enter the Lipa Namba <strong>{single ? single.number : "for your network, shown above"}</strong>.
        </li>
        <li>
          Enter the amount <strong>{tzs(order.total)}</strong> exactly.
        </li>
        <li>{single?.name ? <>Check that the name shows <strong>{single.name}</strong>, then enter your PIN.</> : "Check the name, then enter your PIN."}</li>
        <li>Keep the confirmation SMS. We check the payment and call you on {order.phone} to confirm your order.</li>
      </ol>

      {store.lipa_note && <p className="flex gap-2 rounded-xl bg-sky-50 p-3 text-sm text-sky-900">{store.lipa_note}</p>}
      <p className="flex items-center gap-2 text-xs text-muted">
        <Loader2 className="size-3.5 animate-spin" /> This page updates by itself once your payment is confirmed.
      </p>
    </div>
  );
}
