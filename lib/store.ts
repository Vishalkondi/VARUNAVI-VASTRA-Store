"use client";

/* Cart, wishlist, coupon and recently viewed, saved in the shopper's browser (localStorage).
 * Components read them with hooks so every count and list stays in sync. */

import { useSyncExternalStore } from "react";
import { SITE } from "./data";
import { byId } from "./utils";

const listeners = new Set<() => void>();
const cache = new Map<string, { raw: string | null; value: unknown }>();

function subscribe(fn: () => void) {
  listeners.add(fn);
  const onStorage = () => fn(); // changes from other tabs
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(fn); window.removeEventListener("storage", onStorage); };
}

export function read<T>(key: string, fallback: T): T {
  let raw: string | null = null;
  try { raw = localStorage.getItem(key); } catch { /* storage unavailable */ }
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value as T;
  let value = fallback;
  try { value = raw ? (JSON.parse(raw) ?? fallback) : fallback; } catch { /* bad JSON */ }
  cache.set(key, { raw, value });
  return value;
}

export function write(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
  listeners.forEach((fn) => fn());
}

// Stable fallbacks so useSyncExternalStore sees the same value on every render.
const NO_LINES: CartLine[] = [];
const NO_IDS: string[] = [];

export function useStored<T>(key: string, fallback: T): T {
  return useSyncExternalStore(subscribe, () => read(key, fallback), () => fallback);
}

/* ---------- Cart ---------- */
// A cart line is { id, qty, fp } where fp = fall and picot added.
export type CartLine = { id: string; qty: number; fp: boolean };

export const lineKey = (i: { id: string; fp?: boolean }) => i.id + (i.fp ? ":fp" : "");
export const linePrice = (i: CartLine) => byId(i.id)!.price + (i.fp ? SITE.fallPicotPrice : 0);

const validLines = (lines: CartLine[]) => lines.filter((i) => byId(i.id) && !byId(i.id)!.soldOut && byId(i.id)!.price > 0);
const clampQty = (q: number) => Math.max(1, Math.min(q, 20));

export const cart = {
  items: () => validLines(read("vv_cart", NO_LINES)),
  add(id: string, qty = 1, fp = false) {
    const items = cart.items().map((i) => ({ ...i }));
    const line = items.find((i) => lineKey(i) === lineKey({ id, fp }));
    if (line) line.qty = Math.min(line.qty + qty, 20); else items.push({ id, qty, fp });
    write("vv_cart", items);
  },
  setQty(key: string, qty: number) {
    write("vv_cart", cart.items().map((i) => (lineKey(i) === key ? { ...i, qty: clampQty(qty) } : i)));
  },
  remove(key: string) { write("vv_cart", cart.items().filter((i) => lineKey(i) !== key)); },
};

export function useCart() {
  const items = validLines(useStored("vv_cart", NO_LINES));
  return {
    items,
    count: items.reduce((n, i) => n + i.qty, 0),
    subtotal: items.reduce((n, i) => n + linePrice(i) * i.qty, 0),
  };
}

/* ---------- Coupons ---------- */
export const findCoupon = (code: string) => {
  code = String(code || "").trim().toUpperCase();
  return SITE.coupons.find((c) => c.code.toUpperCase() === code);
};

export function useCoupon(subtotal: number) {
  const coupon = findCoupon(useStored("vv_coupon", ""));
  let discount = 0;
  if (coupon && subtotal >= (coupon.minOrder || 0)) {
    discount = Math.min(subtotal, coupon.percent ? Math.round(subtotal * coupon.percent / 100) : (coupon.amount || 0));
  }
  return { coupon, discount };
}

export const setCoupon = (code: string) => write("vv_coupon", code);

/* ---------- Wishlist ---------- */
export const wishlist = {
  ids: () => read("vv_wish", NO_IDS).filter((id) => byId(id)),
  toggle(id: string) {
    const ids = wishlist.ids();
    const on = !ids.includes(id);
    write("vv_wish", on ? ids.concat(id) : ids.filter((x) => x !== id));
    return on;
  },
};

export function useWishlist() {
  return useStored("vv_wish", NO_IDS).filter((id) => byId(id));
}

// False in the pre-rendered HTML, true once running in the browser. Lets pages that
// depend on saved data (cart, wishlist) skip a flash of "empty" before it loads.
const noop = () => () => {};
export const useHydrated = () => useSyncExternalStore(noop, () => true, () => false);

/* ---------- Compare (up to COMPARE_MAX sarees side by side) ---------- */
export const COMPARE_MAX = 3;
const compareIds = () => read("vv_compare", NO_IDS).filter((id) => byId(id));

export const compare = {
  // Returns "added", "removed", or "full" when the list already holds COMPARE_MAX sarees.
  toggle(id: string): "added" | "removed" | "full" {
    const ids = compareIds();
    if (ids.includes(id)) { write("vv_compare", ids.filter((x) => x !== id)); return "removed"; }
    if (ids.length >= COMPARE_MAX) return "full";
    write("vv_compare", ids.concat(id));
    return "added";
  },
  remove(id: string) { write("vv_compare", compareIds().filter((x) => x !== id)); },
  clear() { write("vv_compare", []); },
};

export function useCompare() {
  return useStored("vv_compare", NO_IDS).filter((id) => byId(id));
}
