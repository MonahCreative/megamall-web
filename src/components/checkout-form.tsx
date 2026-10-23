"use client";

import { Banknote, Loader2, Minus, Plus, ShieldCheck, ShoppingBag, Smartphone, Truck, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ApiError, api, post } from "@/lib/api";
import { cartCount, cartSubtotal, rememberOrder, useCart } from "@/lib/cart";
import { normalizePhone, tzs } from "@/lib/format";
import { useHydrated } from "@/lib/use-hydrated";
import type { Order, Quote, Region, Store } from "@/lib/types";
import { Field, Select, TextArea, TextInput } from "./form";

type Errors = Record<string, string>;

export function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items: cart, clear, buyNow, clearBuyNow, setBuyNowQuantity } = useCart();
  // "Buy now" checks out one item on its own; otherwise the whole cart.
  const buying = searchParams.get("buy") === "now" && buyNow !== null;
  const items = useMemo(() => (buying && buyNow ? [buyNow] : cart), [buying, buyNow, cart]);
  const hydrated = useHydrated();
  const [regions, setRegions] = useState<Region[]>([]);
  const [channels, setChannels] = useState<Store["payment_channels"]>([]);
  const [deliveryNote, setDeliveryNote] = useState("");
  const [form, setForm] = useState({ customer_name: "", phone: "", email: "", region_id: "", district_id: "", area: "", address: "", notes: "" });
  const [quoteState, setQuoteState] = useState<{ key: string; quote: Quote | null; error: string }>({ key: "", quote: null, error: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    Promise.all([api<{ data: Region[] }>("/regions"), api<Store>("/store")])
      .then(([regionList, store]) => {
        setRegions(regionList.data);
        setChannels(store.payment_channels);
        setDeliveryNote(store.delivery_note ?? "");
      })
      .catch((error) => setLoadError(error instanceof ApiError ? error.message : "We couldn't load delivery regions."));
  }, []);

  const region = regions.find((item) => String(item.id) === form.region_id) ?? null;
  const cartItems = useMemo(
    () => items.map((item) => ({ product_id: item.productId, variant_id: item.variantId, quantity: item.quantity })),
    [items],
  );

  // Ask the server for the real totals whenever the region, district or cart changes.
  const ready = region && cartItems.length > 0 && (region.districts.length === 0 || form.district_id);
  const quoteKey = ready ? JSON.stringify([region.id, form.district_id, cartItems]) : "";
  useEffect(() => {
    if (!quoteKey) return;
    const [regionId, districtId, lines] = JSON.parse(quoteKey);
    post<{ data: Quote }>("/checkout/quote", { region_id: regionId, district_id: districtId ? Number(districtId) : null, items: lines })
      .then((response) => setQuoteState({ key: quoteKey, quote: response.data, error: "" }))
      .catch((error) =>
        setQuoteState({ key: quoteKey, quote: null, error: error instanceof ApiError ? error.firstMessage : "We couldn't work out the total." }),
      );
  }, [quoteKey]);
  const quote = quoteKey && quoteState.key === quoteKey ? quoteState.quote : null;
  const quoteError = quoteKey && quoteState.key === quoteKey ? quoteState.error : "";

  const set = (key: keyof typeof form) => (event: { target: { value: string } }) => {
    setForm((previous) => ({ ...previous, [key]: event.target.value, ...(key === "region_id" ? { district_id: "" } : {}) }));
    setErrors((previous) => ({ ...previous, [key]: "" }));
  };

  if (!hydrated) return <div className="h-96 animate-pulse rounded-3xl bg-white" />;

  if (items.length === 0) {
    return (
      <div className="grid place-items-center gap-3 rounded-3xl bg-white px-6 py-16 text-center">
        <ShoppingBag className="size-10 text-muted" />
        <p className="text-lg font-semibold">Your cart is empty</p>
        <Link href="/products" className="rounded-full bg-brand-600 px-6 py-3 font-semibold text-white">
          Start shopping
        </Link>
      </div>
    );
  }

  const cod = region?.payment_mode === "cod";
  const total = quote?.total ?? cartSubtotal(items);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const found: Errors = {};
    if (form.customer_name.trim().length < 3) found.customer_name = "Enter your full name.";
    if (!normalizePhone(form.phone)) found.phone = "Enter a valid Tanzanian mobile number, for example 0712 345 678.";
    if (!region) found.region_id = "Choose your region.";
    if (region && region.districts.length > 0 && !form.district_id) found.district_id = "Choose your district.";
    if (!form.area.trim()) found.area = "Enter your area or town.";
    if (!form.address.trim()) found.address = "Add a street or landmark so the rider can find you.";
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    try {
      const response = await post<{ data: Order; next_step: "pay" | "done" }>("/orders", {
        ...form,
        email: form.email || null,
        notes: form.notes || null,
        region_id: Number(form.region_id),
        district_id: form.district_id ? Number(form.district_id) : null,
        items: cartItems,
      });
      const { order_number: number, access_token: token } = response.data;
      if (token) rememberOrder(number, token);
      if (buying) clearBuyNow();
      else clear();
      router.push(`/order/${number}?token=${token}`);
    } catch (error) {
      setSubmitting(false);
      if (error instanceof ApiError) {
        const fieldErrors: Errors = {};
        for (const [key, messages] of Object.entries(error.errors)) fieldErrors[key.startsWith("items") ? "items" : key] = messages[0];
        setErrors(Object.keys(fieldErrors).length ? fieldErrors : { items: error.message });
      } else {
        setErrors({ items: "Something went wrong. Please try again." });
      }
    }
  };

  return (
    <form onSubmit={submit} noValidate className="grid items-start gap-6 lg:grid-cols-[1fr_400px]">
      <div className="grid gap-6">
        <section className="grid gap-4 rounded-3xl bg-white p-5 sm:p-7">
          <h2 className="text-lg font-bold">1. Your details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" error={errors.customer_name}>
              <TextInput value={form.customer_name} onChange={set("customer_name")} autoComplete="name" placeholder="e.g. Neema Mushi" error={errors.customer_name} />
            </Field>
            <Field label="Phone number" error={errors.phone} hint="The rider calls this number.">
              <TextInput value={form.phone} onChange={set("phone")} type="tel" autoComplete="tel" placeholder="0712 345 678" error={errors.phone} />
            </Field>
            <Field label="Email (optional)" error={errors.email}>
              <TextInput value={form.email} onChange={set("email")} type="email" autoComplete="email" error={errors.email} />
            </Field>
          </div>
        </section>

        <section className="grid gap-4 rounded-3xl bg-white p-5 sm:p-7">
          <h2 className="text-lg font-bold">2. Delivery address</h2>
          {loadError && <p className="text-sm font-semibold text-sale">{loadError}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Region" error={errors.region_id}>
              <Select value={form.region_id} onChange={set("region_id")} error={errors.region_id}>
                <option value="">Choose your region</option>
                {regions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </Field>
            {region && region.districts.length > 0 ? (
              <Field label="District" error={errors.district_id}>
                <Select value={form.district_id} onChange={set("district_id")} error={errors.district_id}>
                  <option value="">Choose your district</option>
                  {region.districts.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </Select>
              </Field>
            ) : (
              <Field label="Town / area" error={errors.area}>
                <TextInput value={form.area} onChange={set("area")} placeholder="e.g. Nyamagana" error={errors.area} />
              </Field>
            )}
            {region && region.districts.length > 0 && (
              <Field label="Area" error={errors.area}>
                <TextInput value={form.area} onChange={set("area")} placeholder="e.g. Sinza Mori" error={errors.area} />
              </Field>
            )}
            <div className="sm:col-span-2">
              <Field label="Street and landmark" error={errors.address}>
                <TextInput value={form.address} onChange={set("address")} placeholder="e.g. Near Sinza Mori bus stop, blue gate" error={errors.address} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Note for the rider (optional)">
                <TextArea value={form.notes} onChange={set("notes")} rows={2} maxLength={500} />
              </Field>
            </div>
          </div>
        </section>

        <section className="grid gap-4 rounded-3xl bg-white p-5 sm:p-7">
          <h2 className="text-lg font-bold">3. Payment</h2>
          {!region ? (
            <p className="rounded-2xl bg-canvas p-4 text-sm text-muted">Choose your region to see how you pay.</p>
          ) : cod ? (
            <div className="flex gap-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50 p-4">
              <Banknote className="size-7 shrink-0 text-emerald-700" />
              <div className="grid gap-1 text-sm">
                <p className="text-base font-bold text-emerald-900">Pay on delivery</p>
                <p className="text-emerald-900/80">
                  Pay <strong>{tzs(total)}</strong> for your items when the rider arrives in Dar es Salaam, in cash or by mobile money, after you check
                  them. We call you first to confirm. The rider&apos;s delivery charge is paid to the rider directly.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex gap-4 rounded-2xl border-2 border-sky-500 bg-sky-50 p-4">
              <Smartphone className="size-7 shrink-0 text-sky-700" />
              <div className="grid gap-1 text-sm">
                <p className="text-base font-bold text-sky-900">Pay before delivery</p>
                <p className="text-sky-900/80">
                  Orders to {region.name} are paid in full before we dispatch. After you place the order you get a payment prompt on your phone
                  {channels.length ? ` (${channels.map((channel) => channel.label).join(", ")})` : ""}. Delivery takes {region.delivery_days[0]} to{" "}
                  {region.delivery_days[1]} days. The transport cost is paid to the bus company when you collect your parcel.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>

      <aside className="grid gap-4 rounded-3xl bg-white p-5 sm:p-7 lg:sticky lg:top-44">
        <h2 className="text-lg font-bold">Order summary</h2>
        {buying && (
          <p className="flex gap-2 rounded-xl bg-brand-50 p-3 text-sm text-brand-700">
            <Zap className="mt-0.5 size-4 shrink-0 fill-current" />
            <span>
              Buying just this item.
              {cart.length > 0 && ` Your cart (${cartCount(cart)} ${cartCount(cart) === 1 ? "item" : "items"}) is saved for later.`}
            </span>
          </p>
        )}
        <ul className="grid gap-3">
          {items.map((item) => (
            <li key={item.key} className="flex gap-3">
              <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-canvas">
                {item.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt="" className="size-full object-cover" />
                )}
                <span className="absolute top-0 right-0 grid size-5 place-items-center rounded-bl-lg bg-ink text-[0.7rem] font-bold text-white">{item.quantity}</span>
              </span>
              <span className="min-w-0 flex-1 text-sm">
                <span className="line-clamp-2 font-medium">{item.name}</span>
                {item.variantName && <span className="block text-xs text-muted">{item.variantName}</span>}
                {buying && (
                  <span className="mt-1.5 flex w-fit items-center rounded-lg border border-line">
                    <button
                      type="button"
                      onClick={() => setBuyNowQuantity(item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="grid size-7 place-items-center disabled:opacity-30"
                      aria-label="One less"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="min-w-6 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => setBuyNowQuantity(item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="grid size-7 place-items-center disabled:opacity-30"
                      aria-label="One more"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </span>
                )}
              </span>
              <span className="text-sm font-semibold tabular-nums">
                {tzs((quote?.lines.find((line) => line.product_id === item.productId && line.variant_id === item.variantId)?.unit_price ?? item.price) * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <dl className="grid gap-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd className="tabular-nums">{tzs(quote?.subtotal ?? cartSubtotal(items))}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Delivery</dt>
            <dd className="text-right">Paid to the rider / bus</dd>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <dt className="font-semibold">Total</dt>
            <dd className="text-2xl font-bold tabular-nums">{tzs(total)}</dd>
          </div>
        </dl>
        <p className="flex gap-2 rounded-xl bg-canvas p-3 text-xs text-muted">
          <Truck className="size-4 shrink-0 text-brand-600" />
          <span>{deliveryNote || "Delivery is not included in our prices. You pay the rider (Dar es Salaam) or the bus company (other regions) directly."}</span>
        </p>
        {(quoteError || errors.items) && <p className="rounded-xl bg-sale/10 p-3 text-sm font-semibold text-sale">{errors.items || quoteError}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="flex h-13 items-center justify-center gap-2 rounded-xl bg-brand-600 font-semibold text-white shadow-lg shadow-brand-600/25 hover:bg-brand-700 disabled:opacity-60"
        >
          {submitting && <Loader2 className="size-4 animate-spin" />}
          {submitting ? "Placing order..." : region && !cod ? `Place order and pay ${tzs(total)}` : "Place order"}
        </button>
        <p className="flex items-center gap-1.5 text-xs text-muted">
          <ShieldCheck className="size-4 text-whatsapp" /> Prices are confirmed by Mega Mall when you place the order.
        </p>
      </aside>
    </form>
  );
}
