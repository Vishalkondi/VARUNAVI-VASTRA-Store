"use client";

/* Smaller helpers: delivery date check, shop open/closed sign, wishlist actions and back-to-top. */

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { SITE, type Product } from "@/lib/data";
import { cart, read, useHydrated, write } from "@/lib/store";
import { hasPrice, productUrl, waLink } from "@/lib/utils";
import { useToast } from "./Toast";

/* ---------- Delivery date by pincode ---------- */

// The next date that is `n` working days (Monday to Saturday) after `from`.
function addWorkingDays(from: Date, n: number) {
  const d = new Date(from);
  while (n > 0) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0) n--;
  }
  return d;
}

const shortDate = (d: Date) => d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

// Courier time by pincode: 413 = Solapur district, 40 to 44 = Maharashtra (and Goa), anything else = rest of India.
function courierDays(pin: string): [number, number] {
  if (pin.startsWith("413")) return SITE.delivery.local;
  if (/^4[0-4]/.test(pin)) return SITE.delivery.state;
  return SITE.delivery.india;
}

export function DeliveryCheck() {
  const [pin, setPin] = useState("");
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  // Remember the pincode between pages (and for the checkout form).
  useEffect(() => { setPin(read("vv_pin", "")); }, []);

  function check(e: FormEvent) {
    e.preventDefault();
    const p = pin.trim();
    if (!/^[1-9]\d{5}$/.test(p)) { setResult({ ok: false, text: "Please enter a 6-digit pincode." }); return; }
    write("vv_pin", p);
    if (p.startsWith("9")) { setResult({ ok: false, text: "For Army Post Office addresses, message us on WhatsApp and we will check." }); return; }
    const [c1, c2] = courierDays(p);
    const [d1, d2] = SITE.delivery.dispatch;
    const today = new Date();
    setResult({ ok: true, text: "Estimated delivery " + shortDate(addWorkingDays(today, d1 + c1)) + " to " + shortDate(addWorkingDays(today, d2 + c2)) + "." });
  }

  return (
    <div className="deliv">
      <label className="deliv__label" htmlFor="deliv-pin">Check delivery date</label>
      <form className="inline-form deliv__form" onSubmit={check}>
        <input
          id="deliv-pin" inputMode="numeric" maxLength={6} placeholder="Enter your pincode" autoComplete="postal-code"
          value={pin} onChange={(e) => { setPin(e.target.value.replace(/\D/g, "")); setResult(null); }}
        />
        <button className="btn btn--outline" type="submit">Check</button>
      </form>
      {result ? (
        <p className={"deliv__result" + (result.ok ? "" : " deliv__result--warn")} role="status">
          {result.text}
          {result.ok ? <small>{SITE.shippingNote} Fall and picot adds 2 to 3 days.</small> : null}
        </p>
      ) : null}
    </div>
  );
}

/* ---------- Shop open / closed sign ---------- */

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const toMinutes = (hhmm: string) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
const timeLabel = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return (h % 12 || 12) + (m ? ":" + String(m).padStart(2, "0") : "") + (h < 12 ? " am" : " pm");
};

// Day of week and minutes past midnight in India, whatever the visitor's own time zone.
function indiaNow() {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23" }).formatToParts(new Date());
  const get = (t: string) => parts.find((x) => x.type === t)!.value;
  return { day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday")), minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

function openStatus() {
  const { day, minutes } = indiaNow();
  const open = toMinutes(SITE.openTime);
  const close = toMinutes(SITE.closeTime);
  if (SITE.openDays.includes(day) && minutes >= open && minutes < close) {
    return { open: true, text: "Open now · closes at " + timeLabel(SITE.closeTime) };
  }
  if (SITE.openDays.includes(day) && minutes < open) return { open: false, text: "Closed · opens today at " + timeLabel(SITE.openTime) };
  for (let i = 1; i <= 7; i++) {
    const next = (day + i) % 7;
    if (SITE.openDays.includes(next)) {
      return { open: false, text: "Closed · opens " + (i === 1 ? "tomorrow" : DAY_NAMES[next]) + " at " + timeLabel(SITE.openTime) };
    }
  }
  return { open: false, text: "Closed" };
}

export function OpenStatus() {
  const hydrated = useHydrated();
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 60_000);
    return () => clearInterval(t);
  }, []);
  if (!hydrated) return null; // depends on the current time, so only shown in the browser
  const s = openStatus();
  return <p className={"open-status" + (s.open ? " is-open" : "")}><span className="open-status__dot" />{s.text}</p>;
}

/* ---------- Wishlist actions ---------- */

export function WishlistActions({ list }: { list: Product[] }) {
  const toast = useToast();
  const buyable = list.filter((p) => hasPrice(p) && !p.soldOut);
  const lines = list.map((p, i) => (i + 1) + ". " + p.name + " · " + SITE.url + productUrl(p)).join("\n");

  async function share() {
    const text = "My favourite sarees from " + SITE.name + ":\n\n" + lines;
    if (navigator.share) {
      try { await navigator.share({ title: "My " + SITE.name + " wishlist", text }); } catch { /* cancelled */ }
    } else {
      window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank", "noopener");
    }
  }

  function addAll() {
    buyable.forEach((p) => cart.add(p.id));
    toast(<>{buyable.length === 1 ? "1 saree" : buyable.length + " sarees"} added to your cart. <Link href="/cart">View cart</Link></>);
  }

  return (
    <div className="wish-actions">
      <a className="btn btn--whatsapp" target="_blank" rel="noopener"
        href={waLink("Hello Varunavi Vastra, please share the price and availability of these sarees from my wishlist:\n\n" + lines)}>
        Ask about all {list.length} on WhatsApp
      </a>
      {buyable.length ? <button className="btn btn--pink" type="button" onClick={addAll}>Add {buyable.length === 1 ? "it" : "all " + buyable.length} to cart</button> : null}
      <button className="link-btn" type="button" onClick={share}>Share my wishlist</button>
    </div>
  );
}

/* ---------- Catalogue buttons ---------- */

export function CatalogueActions({ url }: { url: string }) {
  async function share() {
    const text = SITE.name + " catalogue of handcrafted cotton sarees:\n" + url;
    if (navigator.share) {
      try { await navigator.share({ title: SITE.name + " catalogue", text, url }); } catch { /* cancelled */ }
    } else {
      window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank", "noopener");
    }
  }
  return (
    <div className="catalogue__actions">
      {/* The browser's print window has "Save as PDF" as a destination. */}
      <button className="btn btn--pink" type="button" onClick={() => window.print()}>Save as PDF</button>
      <button className="btn btn--whatsapp" type="button" onClick={share}>Share on WhatsApp</button>
    </div>
  );
}

/* ---------- Back to top ---------- */

export function BackToTop() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const check = () => setOn(window.scrollY > 900);
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, []);
  const toTop = () => {
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
  };
  return (
    <button type="button" className={"to-top" + (on ? " is-on" : "")} aria-label="Back to top" tabIndex={on ? 0 : -1} aria-hidden={!on} onClick={toTop}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
    </button>
  );
}
