"use client";

/* "Order placed": the thank-you page after checkout. Reads the last order saved on this device. */

import Link from "next/link";
import { motion, MotionConfig } from "framer-motion";
import { SITE } from "@/lib/data";
import { payOption } from "@/lib/payments";
import { useHydrated, useLastOrder, type Order } from "@/lib/store";
import { addWorkingDays, byId, productUrl, rupees, shortDate, waLink } from "@/lib/utils";
import { IMAGE_SIZES, ProductImage } from "./Bits";

const CONFETTI = ["#D14C85", "#A3AD54", "#6C7632", "#e9b949", "#FBE9F1"];

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
});

export default function OrderPlaced() {
  const hydrated = useHydrated();
  const order = useLastOrder();
  if (!hydrated) return null;

  if (!order) {
    return (
      <div className="empty">
        <h2>No recent order on this device</h2>
        <p>Orders you place here will show up on this page.</p>
        <Link className="btn btn--pink" href="/shop">Shop sarees</Link>
      </div>
    );
  }

  const first = order.customer.name.trim().split(/\s+/)[0];
  const placedOn = new Date(order.date);

  return (
    <MotionConfig reducedMotion="user">
      <div className="placed">
        <div className="placed__hero">
          <Tick />
          <motion.p className="eyebrow" {...rise(0.55)}>Order placed</motion.p>
          <motion.h1 {...rise(0.65)}>Thank you{first ? ", " + first : ""}!</motion.h1>
          <motion.p className="placed__lead" {...rise(0.75)}>
            Your order <strong>{order.id}</strong> is with us. We have also sent it on WhatsApp and will confirm it with you there shortly.
          </motion.p>
          <motion.div className="placed__actions" {...rise(0.85)}>
            <a className="btn btn--whatsapp" href={waLink(order.message)} target="_blank" rel="noopener">WhatsApp didn&apos;t open? Send the order again</a>
          </motion.div>
        </div>

        <div className="placed__grid">
          <motion.section className="placed__card" {...rise(0.95)} aria-labelledby="placed-next">
            <h2 id="placed-next">What happens next</h2>
            <ol className="placed__steps">
              {nextSteps(order, placedOn).map((s, i) => (
                <motion.li key={s.title} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.05 + i * 0.12, duration: 0.4 }}>
                  <span className="placed__dot" aria-hidden="true">{i + 1}</span>
                  <div><strong>{s.title}</strong><p>{s.text}</p></div>
                </motion.li>
              ))}
            </ol>
          </motion.section>

          <motion.section className="placed__card" {...rise(1.05)} aria-labelledby="placed-summary">
            <h2 id="placed-summary">Order summary</h2>
            <p className="placed__meta">{order.id} · {placedOn.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
            <ul className="placed__lines">
              {order.lines.map((l) => {
                const p = byId(l.id);
                return (
                  <li key={l.id + (l.fp ? ":fp" : "")}>
                    {p ? <Link className="media" href={productUrl(p)}><ProductImage p={p} sizes={IMAGE_SIZES.thumb} /></Link> : <span className="media" />}
                    <div>
                      <strong>{l.name}</strong>
                      <small>{l.sku} · Qty {l.qty}{l.fp ? " · with fall and picot" : ""}</small>
                    </div>
                    <span>{rupees(l.price * l.qty)}</span>
                  </li>
                );
              })}
            </ul>
            <div className="summary__row"><span>Subtotal</span><span>{rupees(order.subtotal)}</span></div>
            {order.discount ? <div className="summary__row summary__row--discount"><span>Discount{order.coupon ? " (" + order.coupon + ")" : ""}</span><span>− {rupees(order.discount)}</span></div> : null}
            {order.fee ? <div className="summary__row"><span>Cash on delivery charge</span><span>{rupees(order.fee)}</span></div> : null}
            <div className="summary__row summary__row--total"><span>Total</span><span>{rupees(order.total)}</span></div>
            <dl className="placed__facts">
              <div><dt>Payment</dt><dd>{payOption(order.pay).label} · {order.paid ? "paid" + (order.ref ? " (ref " + order.ref + ")" : "") : order.pay === "cod" ? "pay on delivery" : "pay after we confirm"}</dd></div>
              <div><dt>Deliver to</dt><dd>{order.customer.name}<br />{order.customer.address}, {order.customer.city} {order.customer.pincode}<br />{order.customer.phone}</dd></div>
            </dl>
          </motion.section>
        </div>

        <motion.div className="placed__more" {...rise(1.2)}>
          <Link className="btn btn--pink" href="/shop">Continue shopping</Link>
          <Link className="btn btn--outline" href="/track-order">Track your order</Link>
        </motion.div>
      </div>
    </MotionConfig>
  );
}

function nextSteps(o: Order, placedOn: Date) {
  const ships = shortDate(addWorkingDays(placedOn, SITE.delivery.dispatch[1]));
  const pay = o.paid
    ? { title: "We check your payment", text: "We match your " + payOption(o.pay).label + " payment of " + rupees(o.total) + " and confirm it on WhatsApp." }
    : o.pay === "cod"
      ? { title: "Pay when it arrives", text: "Keep " + rupees(o.total) + " ready in cash for the courier." }
      : { title: "Payment", text: "Once we confirm, we send you the " + payOption(o.pay).label + " details for " + rupees(o.total) + "." };
  return [
    { title: "We confirm on WhatsApp", text: "We check your sarees are ready and reply on WhatsApp, " + SITE.hours + "." },
    pay,
    { title: "Packed and shipped", text: "Your sarees ship by " + ships + ". We send the tracking number on WhatsApp." },
    { title: "Delivered", text: "Usually " + SITE.delivery.india[0] + " to " + SITE.delivery.india[1] + " working days after dispatch." },
  ];
}

// A ring that draws itself, a tick inside it, and a small burst of confetti.
function Tick() {
  return (
    <div className="placed__tick" aria-hidden="true">
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2;
        const r = 70 + (i % 3) * 16;
        return (
          <motion.i
            key={i} style={{ background: CONFETTI[i % CONFETTI.length] }}
            initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
            animate={{ x: Math.cos(a) * r, y: Math.sin(a) * r, scale: [0, 1, 0.8], opacity: [1, 1, 0], rotate: 180 + i * 25 }}
            transition={{ delay: 0.45, duration: 1.1, ease: "easeOut" }}
          />
        );
      })}
      <motion.svg viewBox="0 0 80 80" initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 15 }}>
        <motion.circle cx="40" cy="40" r="36" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, ease: "easeOut" }} />
        <motion.path d="M25 41 L35 51 L56 30" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.35, duration: 0.35, ease: "easeOut" }} />
      </motion.svg>
    </div>
  );
}
