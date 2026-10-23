"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import { ApiError, post } from "@/lib/api";

/** Only customers whose order was delivered can review; the order number and phone prove it. */
export function ReviewForm({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [form, setForm] = useState({ order_number: "", phone: "", comment: "" });
  const [state, setState] = useState<{ busy: boolean; error: string; done: string }>({ busy: false, error: "", done: "" });

  if (state.done) return <p className="rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-800">{state.done}</p>;

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="w-fit rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold hover:border-brand-500">
        Write a review
      </button>
    );
  }

  const input = "h-11 w-full rounded-xl border border-line bg-white px-3.5 outline-none focus:border-brand-500";

  return (
    <form
      className="grid gap-3 rounded-2xl border border-line bg-white p-5"
      onSubmit={async (event) => {
        event.preventDefault();
        if (rating === 0) return setState({ ...state, error: "Tap the stars to choose a rating." });
        setState({ busy: true, error: "", done: "" });
        try {
          const response = await post<{ message: string }>(`/products/${slug}/reviews`, { ...form, rating });
          setState({ busy: false, error: "", done: response.message });
        } catch (error) {
          setState({ busy: false, error: error instanceof ApiError ? error.firstMessage : "Something went wrong.", done: "" });
        }
      }}
    >
      <p className="text-sm text-muted">Reviews are from verified buyers. Use the order number and phone from your delivered order.</p>
      <div className="flex gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} type="button" role="radio" aria-checked={rating === star} aria-label={`${star} star${star > 1 ? "s" : ""}`} onClick={() => setRating(star)}>
            <Star className={`size-8 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-line"}`} />
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium">
          Order number
          <input className={input} required value={form.order_number} onChange={(event) => setForm({ ...form, order_number: event.target.value })} placeholder="MM261013-AB12C" />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Phone used for the order
          <input className={input} required type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="0712 345 678" />
        </label>
      </div>
      <label className="grid gap-1 text-sm font-medium">
        Your review (optional)
        <textarea
          rows={3}
          maxLength={1000}
          value={form.comment}
          onChange={(event) => setForm({ ...form, comment: event.target.value })}
          className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 outline-none focus:border-brand-500"
        />
      </label>
      {state.error && <p className="text-sm font-semibold text-sale">{state.error}</p>}
      <button type="submit" disabled={state.busy} className="h-11 w-fit rounded-xl bg-ink px-6 font-semibold text-white disabled:opacity-50">
        {state.busy ? "Sending..." : "Send review"}
      </button>
    </form>
  );
}
