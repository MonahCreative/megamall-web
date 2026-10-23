import { Check, MapPin, Truck } from "lucide-react";
import { tzs } from "@/lib/format";
import type { Order } from "@/lib/types";

const steps = [
  { key: "placed", label: "Order received" },
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Being packed" },
  { key: "shipped", label: "On the way" },
  { key: "delivered", label: "Delivered" },
] as const;

const reached: Record<Order["status"], number> = {
  awaiting_payment: 0,
  pending: 0,
  confirmed: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
  cancelled: -1,
};

export function OrderTimeline({ order }: { order: Order }) {
  if (order.status === "cancelled") {
    return (
      <p className="rounded-2xl bg-sale/10 p-4 text-sm font-semibold text-sale">
        This order was cancelled{order.tracking_note ? `: ${order.tracking_note}` : "."}
      </p>
    );
  }
  const current = reached[order.status];

  return (
    <ol className="grid grid-cols-5 gap-1">
      {steps.map((step, index) => {
        const done = index <= current;
        return (
          <li key={step.key} className="grid justify-items-center gap-2 text-center">
            <span className="flex w-full items-center">
              <span className={`h-1 flex-1 rounded-full ${index === 0 ? "invisible" : done ? "bg-brand-600" : "bg-line"}`} />
              <span className={`grid size-8 shrink-0 place-items-center rounded-full ${done ? "bg-brand-600 text-white" : "bg-canvas text-muted"}`}>
                {done ? <Check className="size-4" /> : <span className="text-xs font-bold">{index + 1}</span>}
              </span>
              <span className={`h-1 flex-1 rounded-full ${index === steps.length - 1 ? "invisible" : index < current ? "bg-brand-600" : "bg-line"}`} />
            </span>
            <span className={`text-[0.72rem] leading-tight sm:text-xs ${index === current ? "font-bold text-ink" : "text-muted"}`}>
              {index === 0 && order.status === "awaiting_payment" ? "Awaiting payment" : step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function OrderSummary({ order }: { order: Order }) {
  return (
    <div className="grid gap-5">
      {order.tracking_note && order.status === "shipped" && (
        <p className="flex gap-3 rounded-2xl bg-brand-50 p-4 text-sm">
          <Truck className="size-5 shrink-0 text-brand-700" /> <span><strong>Delivery details:</strong> {order.tracking_note}</span>
        </p>
      )}
      <ul className="grid gap-3">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between gap-3 text-sm">
            <span>
              <span className="font-medium">{item.quantity} × {item.name}</span>
              {item.variant && <span className="block text-xs text-muted">{item.variant}</span>}
            </span>
            <span className="font-semibold tabular-nums">{tzs(item.line_total)}</span>
          </li>
        ))}
      </ul>
      <dl className="grid gap-2 border-t border-line pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">Subtotal</dt>
          <dd className="tabular-nums">{tzs(order.subtotal)}</dd>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between">
            <dt className="text-muted">Discount</dt>
            <dd className="tabular-nums">-{tzs(order.discount)}</dd>
          </div>
        )}
        {order.channel !== "pos" && (
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Delivery</dt>
            {/* Older orders may include a fee; new ones are paid to the rider or bus company directly. */}
            <dd className="text-right tabular-nums">{order.delivery_fee > 0 ? tzs(order.delivery_fee) : "Paid to the rider / bus directly"}</dd>
          </div>
        )}
        <div className="flex items-baseline justify-between">
          <dt className="font-semibold">Total</dt>
          <dd className="text-xl font-bold tabular-nums">{tzs(order.total)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Payment</dt>
          <dd className="font-medium">
            {order.payment_mode_label} · {order.payment_status === "paid" ? "Paid" : order.payment_status === "refunded" ? "Refunded" : "Not paid yet"}
          </dd>
        </div>
      </dl>
      {order.region && (
        <p className="flex gap-3 border-t border-line pt-4 text-sm">
          <MapPin className="size-5 shrink-0 text-muted" />
          <span>
            <strong>{order.customer_name}</strong>, {order.phone}
            <br />
            {[order.address, order.area, order.district, order.region].filter(Boolean).join(", ")}
          </span>
        </p>
      )}
    </div>
  );
}
