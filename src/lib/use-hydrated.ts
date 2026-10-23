"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** False during the server render and hydration, true afterwards (safe to read localStorage, the clock, the saved cart). */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
