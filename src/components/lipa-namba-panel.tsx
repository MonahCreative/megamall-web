"use client";

import { AlertCircle, Check, Copy, Loader2, SearchCheck, Store as StoreIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { ApiError, api, post } from "@/lib/api";
import { normalizePhone, tzs } from "@/lib/format";
import type { LipaNumber, Order, Store } from "@/lib/types";
import { Countdown } from "./countdown";
import { Field, TextInput } from "./form";

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
 * Orders outside Dar es Salaam, paid to the shop's own till number: the customer pays on their phone,
 * then types the transaction ID from the confirmation SMS. Staff check it and confirm.
 */
export function LipaNambaPanel({ order, token, store, onUpdate }: { order: Order; token: string; store: Store; onUpdate: (order: Order) => void }) {
  const accounts = store.lipa_numbers ?? [];
  const [channel, setChannel] = useState(accounts[0]?.channel ?? "mpesa");
  const [phone, setPhone] = useState(order.phone?.replace(/\s/g, "") ?? "");
  const [transactionId, setTransactionId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const payment = order.payment;
  const checking = payment?.status === "pending" && payment.method === "lipa_namba";
  const rejected = payment?.status === "failed" && payment.method === "lipa_namba";

  // While staff check the payment, look for their answer every 15 seconds for up to 30 minutes.
  useEffect(() => {
    if (!checking) return;
    let tries = 0;
    const timer = setInterval(async () => {
      tries += 1;
      try {
        const { data } = await api<{ data: Order }>(`/orders/${order.order_number}/payment-status?token=${encodeURIComponent(token)}`);
        onUpdate(data);
        if (data.payment?.status !== "pending" || tries > 120) clearInterval(timer);
      } catch {
        // keep trying; a dropped request is normal on mobile data
      }
    }, 15000);
    return () => clearInterval(timer);
  }, [checking, order.order_number, token, onUpdate]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const problems: Record<string, string> = {};
    if (!normalizePhone(phone)) problems.phone = "Enter the number you paid from, for example 0712 345 678.";
    if (transactionId.trim().length < 6) problems.transaction_id = "Enter the transaction ID from the confirmation SMS.";
    setErrors(problems);
    if (Object.keys(problems).length) return;

    setSending(true);
    try {
      const { data } = await post<{ data: Order }>(`/orders/${order.order_number}/lipa-namba`, { token, channel, phone, transaction_id: transactionId });
      setTransactionId("");
      onUpdate(data);
    } catch (problem) {
      if (problem instanceof ApiError && Object.keys(problem.errors).length) {
        setErrors(Object.fromEntries(Object.entries(problem.errors).map(([field, messages]) => [field, messages[0]])));
      } else {
        setErrors({
          form: problem instanceof ApiError ? problem.message : "We couldn't send it. Try again.",
        });
      }
    } finally {
      setSending(false);
    }
  };

  if (checking) {
    return (
      <div className="grid justify-items-center gap-3 rounded-3xl border-2 border-sky-500 bg-sky-50 p-6 text-center">
        <SearchCheck className="size-10 text-sky-700" />
        <p className="text-lg font-bold text-sky-900">We are checking your payment</p>
        <p className="text-sm text-sky-900/80">
          {payment.channel_label} transaction <strong className="font-mono">{payment.transaction_id}</strong> for <strong>{tzs(payment.amount)}</strong>
        </p>
        {store.lipa_note && <p className="max-w-md text-sm text-sky-900/80">{store.lipa_note}</p>}
        <p className="flex items-center gap-2 text-xs text-sky-900/70">
          <Loader2 className="size-3.5 animate-spin" /> This page updates by itself.
        </p>
      </div>
    );
  }

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
  const errorField = (name: string) => errors[name];

  return (
    <form onSubmit={submit} className="grid gap-5 rounded-3xl border-2 border-sky-500 bg-white p-5 sm:p-6" noValidate>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <StoreIcon className="size-5 text-sky-700" /> Pay {tzs(order.total)} to our Lipa Namba
        </h2>
        {order.expires_at && <Countdown endsAt={order.expires_at} label="Pay within" />}
      </div>

      {rejected && (
        <p className="flex gap-2 rounded-xl bg-sale/10 p-3 text-sm font-medium text-sale">
          <AlertCircle className="size-5 shrink-0" />
          <span>
            We could not find payment <strong className="font-mono">{payment.transaction_id}</strong>
            {payment.failure_reason ? ` (${payment.failure_reason})` : ""}. Check your SMS and send the correct transaction ID below.
          </span>
        </p>
      )}

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
        <li>
          {single?.name ? (
            <>
              Check that the name shows <strong>{single.name}</strong>, then enter your PIN.
            </>
          ) : (
            "Check the name, then enter your PIN."
          )}
        </li>
        <li>You get an SMS with a transaction ID. Type it below.</li>
      </ol>

      <div className="grid gap-4 border-t border-line pt-5">
        {accounts.length > 1 && (
          <fieldset className="grid gap-2">
            <legend className="mb-1.5 text-sm font-medium">Which Lipa Namba did you pay to?</legend>
            <div className="grid grid-cols-2 gap-2">
              {accounts.map((account) => (
                <label
                  key={account.channel}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 px-3 py-3 text-sm font-semibold ${channel === account.channel ? "border-sky-600 bg-sky-50" : "border-line"}`}
                >
                  <input
                    type="radio"
                    name="channel"
                    value={account.channel}
                    checked={channel === account.channel}
                    onChange={() => setChannel(account.channel)}
                    className="sr-only"
                  />
                  <span
                    className="size-3 shrink-0 rounded-full"
                    style={{
                      background: channelColours[account.channel] ?? "#64748b",
                    }}
                  />
                  {account.label}
                </label>
              ))}
            </div>
          </fieldset>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Transaction ID" error={errorField("transaction_id")} hint="From the confirmation SMS. You can paste the whole SMS.">
            <TextInput
              value={transactionId}
              onChange={(event) => setTransactionId(event.target.value)}
              placeholder="e.g. QJK3X7Y2AB"
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              error={errorField("transaction_id")}
            />
          </Field>
          <Field label="Number you paid from" error={errorField("phone")}>
            <TextInput type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="0712 345 678" error={errorField("phone")} />
          </Field>
        </div>
        {(errors.form || errors.order || errors.channel) && (
          <p className="flex gap-2 rounded-xl bg-sale/10 p-3 text-sm font-medium text-sale">
            <AlertCircle className="size-5 shrink-0" /> {errors.form || errors.order || errors.channel}
          </p>
        )}
        <button
          type="submit"
          disabled={sending}
          className="flex h-13 items-center justify-center gap-2 rounded-xl bg-sky-600 font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
        >
          {sending && <Loader2 className="size-4 animate-spin" />}I have paid · send for checking
        </button>
        <p className="text-xs text-muted">We confirm your order as soon as we see the payment, and send you an SMS.</p>
      </div>
    </form>
  );
}
