"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Order, Store } from "@/lib/types";
import { LipaNambaPanel } from "./lipa-namba-panel";

type Props = { order: Order; token: string; onUpdate: (order: Order) => void };

/** Payment for orders outside Dar es Salaam: pay to the shop's Lipa Namba, then send the transaction ID. */
export function PaymentPanel(props: Props) {
  const [store, setStore] = useState<Store | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    api<Store>("/store").then(setStore).catch(() => setFailed(true));
  }, []);

  if (!store) {
    return failed ? (
      <p className="rounded-3xl bg-white p-6 text-center text-sm text-muted">We couldn&apos;t load the payment details. Refresh the page to try again.</p>
    ) : (
      <div className="h-72 animate-pulse rounded-3xl bg-white" />
    );
  }

  return <LipaNambaPanel {...props} store={store} />;
}
