"use client";

import { BellRing, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { ApiError, post } from "@/lib/api";
import { normalizePhone } from "@/lib/format";
import type { Variant } from "@/lib/types";

/**
 * "SMS me when it's back in stock". For a sold-out product, or (with soldOutVariants) for sizes that are sold out.
 */
export function NotifyMe({ slug, soldOutVariants = [], wholeProduct }: { slug: string; soldOutVariants?: Variant[]; wholeProduct: boolean }) {
  const [open, setOpen] = useState(wholeProduct);
  const [phone, setPhone] = useState("");
  const [variantId, setVariantId] = useState<string>(soldOutVariants[0] ? String(soldOutVariants[0].id) : "");
  const [state, setState] = useState<{ status: "idle" | "sending" | "done"; error: string }>({ status: "idle", error: "" });

  if (state.status === "done") {
    return (
      <p className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
        <CheckCircle2 className="size-5 shrink-0" /> Done! We will SMS {phone} as soon as it is back.
      </p>
    );
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="flex w-fit items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline">
        <BellRing className="size-4" /> Size you want sold out? Get an SMS when it is back
      </button>
    );
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!normalizePhone(phone)) {
      setState({ status: "idle", error: "Enter a valid mobile number, for example 0712 345 678." });
      return;
    }
    setState({ status: "sending", error: "" });
    try {
      await post(`/products/${encodeURIComponent(slug)}/notify`, { phone, variant_id: !wholeProduct && variantId ? Number(variantId) : null });
      setState({ status: "done", error: "" });
    } catch (error) {
      setState({ status: "idle", error: error instanceof ApiError ? error.firstMessage : "Something went wrong. Please try again." });
    }
  };

  return (
    <form onSubmit={submit} noValidate className="grid gap-3 rounded-2xl border border-line bg-white p-4">
      <p className="flex items-center gap-2 font-semibold">
        <BellRing className="size-5 text-brand-600" /> {wholeProduct ? "Sold out. Get an SMS when it is back" : "Get an SMS when a size is back"}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        {!wholeProduct && soldOutVariants.length > 0 && (
          <select
            value={variantId}
            onChange={(event) => setVariantId(event.target.value)}
            aria-label="Size or option"
            className="h-11 rounded-xl border border-line bg-white px-3 text-sm"
          >
            {soldOutVariants.map((item) => (
              <option key={item.id} value={item.id}>
                {item.options ? Object.values(item.options).join(" / ") : item.name}
              </option>
            ))}
          </select>
        )}
        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="0712 345 678"
          aria-label="Your mobile number"
          className="h-11 min-w-0 flex-1 rounded-xl border border-line px-3 text-sm"
        />
        <button
          type="submit"
          disabled={state.status === "sending"}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-ink px-5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {state.status === "sending" && <Loader2 className="size-4 animate-spin" />} Notify me
        </button>
      </div>
      {state.error && <p className="text-sm font-semibold text-sale">{state.error}</p>}
    </form>
  );
}
