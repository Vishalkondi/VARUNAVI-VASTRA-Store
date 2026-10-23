"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import qrcode from "qrcode-generator";
import { useRef, useState, type FormEvent } from "react";
import { SITE, WEAVES } from "@/lib/data";
import { bankReady, payFee, payOption, payOptionsFor, type PayMethod } from "@/lib/payments";
import { cart, findCoupon, lineKey, linePrice, newOrderId, orders, read, setCoupon, useCart, useCoupon, useHydrated } from "@/lib/store";
import { byId, productUrl, rupees, waLink } from "@/lib/utils";
import { IMAGE_SIZES, ProductImage } from "./Bits";

const { bank, cardLink } = SITE.payments;

export default function CartView() {
  const { items, count, subtotal } = useCart();
  const { coupon, discount } = useCoupon(subtotal);
  const checkout = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [couponMsg, setCouponMsg] = useState("");
  const [pay, setPay] = useState<PayMethod>("upi");
  const [payStep, setPayStep] = useState<{ method: PayMethod; orderId: string } | null>(null); // for ways to pay before the order is sent
  const [payRef, setPayRef] = useState("");
  const [gift, setGift] = useState(false);
  const [placed, setPlaced] = useState(false);
  const hydrated = useHydrated();
  const options = payOptionsFor(subtotal - discount);
  const method = options.some((o) => o.id === pay) ? pay : options[0].id;
  const fee = payFee(method);
  const total = subtotal - discount + fee;

  if (!hydrated) return null;
  if (placed) return <p className="empty">Placing your order…</p>;

  if (!items.length) {
    return (
      <div className="empty">
        <h2>Your cart is empty</h2>
        <p>Find a saree you love and it will wait for you here.</p>
        <Link className="btn btn--pink" href="/shop">Shop sarees</Link>
      </div>
    );
  }

  function orderMessage(orderId: string, payLine: string) {
    const f = new FormData(checkout.current!);
    const list = items.map((i, n) => (n + 1) + ". " + byId(i.id)!.name + " (" + byId(i.id)!.sku + ")" + (i.fp ? " + fall and picot" : "") + " x " + i.qty + " = " + rupees(linePrice(i) * i.qty));
    return "Hello Varunavi Vastra, I would like to place an order.\nOrder no: " + orderId + "\n\n" + list.join("\n") +
      "\n\nSubtotal: " + rupees(subtotal) +
      (discount && coupon ? "\nDiscount (" + coupon.code + "): - " + rupees(discount) : "") +
      (fee ? "\nCash on delivery charge: " + rupees(fee) : "") +
      "\nTotal: " + rupees(total) +
      "\n\nName: " + f.get("name") + "\nPhone: " + f.get("phone") +
      "\nAddress: " + f.get("address") + ", " + f.get("city") + " " + f.get("pincode") +
      (f.get("note") ? "\nNote: " + f.get("note") : "") +
      (gift ? "\n\nThis is a gift: please leave prices out of the parcel." + (f.get("giftNote") ? "\nGift message: " + f.get("giftNote") : "") : "") +
      "\n\nPayment: " + payLine;
  }

  // Saves the order on this device, sends it to the shop on WhatsApp and shows the "Order placed" page.
  function placeOrder(orderId: string, paid: boolean) {
    const f = new FormData(checkout.current!);
    const ref = payRef.trim();
    const label = payOption(method).label;
    const payLine = paid
      ? "Paid " + rupees(total) + " by " + label + (ref ? " (ref " + ref + ")" : " (screenshot to follow)")
      : method === "cod" ? "Cash on delivery" : label + ", I will pay after you confirm";
    const message = orderMessage(orderId, payLine);
    orders.save({
      id: orderId, date: new Date().toISOString(),
      lines: items.map((i) => ({ id: i.id, name: byId(i.id)!.name, sku: byId(i.id)!.sku, qty: i.qty, fp: i.fp, price: linePrice(i) })),
      subtotal, discount, coupon: discount && coupon ? coupon.code : undefined, fee, total,
      pay: method, paid, ref: ref || undefined,
      customer: { name: String(f.get("name")), phone: String(f.get("phone")), address: String(f.get("address")), city: String(f.get("city")), pincode: String(f.get("pincode")) },
      message,
    });
    window.open(waLink(message), "_blank", "noopener");
    setPlaced(true);
    cart.clear();
    setCoupon("");
    router.push("/order-placed");
  }

  function onCheckout(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const orderId = newOrderId();
    if (payOption(method).payNow) { setPayRef(""); setPayStep({ method, orderId }); return; }
    placeOrder(orderId, false);
  }

  function onCoupon(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const c = findCoupon(new FormData(e.currentTarget).get("code") as string);
    if (!c) { setCouponMsg("That code is not valid."); return; }
    setCouponMsg("");
    setCoupon(c.code);
  }

  // UPI: a payment link for phones and a QR code for computers.
  const upiUrl = payStep?.method === "upi"
    ? "upi://pay?pa=" + encodeURIComponent(SITE.upiId) + "&pn=" + encodeURIComponent(SITE.upiName) + "&am=" + total.toFixed(2) + "&cu=INR&tn=" + encodeURIComponent("Varunavi order " + payStep.orderId)
    : "";
  const qrSvg = upiUrl ? (() => { const qr = qrcode(0, "M"); qr.addData(upiUrl); qr.make(); return qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true }); })() : "";

  return (
    <div className="cart">
      <div>
        {items.map((i) => {
          const p = byId(i.id)!;
          const key = lineKey(i);
          return (
            <div className="cart-line" key={key}>
              <Link className="media" href={productUrl(p)}><ProductImage p={p} sizes={IMAGE_SIZES.thumb} /></Link>
              <div>
                <h3><Link href={productUrl(p)}>{p.name}</Link></h3>
                <small>
                  {WEAVES[p.weave].label} · {rupees(p.price)}
                  {i.fp ? <><br />+ Fall and picot ({rupees(SITE.fallPicotPrice)})</> : null}
                </small>
                <div className="qty">
                  <button type="button" aria-label="Decrease quantity" onClick={() => cart.setQty(key, i.qty - 1)}>−</button>
                  <input type="number" min={1} max={20} value={i.qty} aria-label={"Quantity for " + p.name} onChange={(e) => cart.setQty(key, parseInt(e.target.value, 10) || 1)} />
                  <button type="button" aria-label="Increase quantity" onClick={() => cart.setQty(key, i.qty + 1)}>+</button>
                </div>
              </div>
              <div className="cart-line__end">
                <span className="price">{rupees(linePrice(i) * i.qty)}</span>
                <button className="link-btn" type="button" onClick={() => cart.remove(key)}>Remove</button>
              </div>
            </div>
          );
        })}
        <p style={{ marginTop: 20 }}><Link className="link-btn" href="/shop">Continue shopping</Link></p>
      </div>

      <aside className="summary">
        <h2>Order summary</h2>
        {SITE.coupons.length ? (
          coupon ? (
            <div className="coupon coupon--on">
              <span>
                Code <strong>{coupon.code}</strong> applied
                {discount ? null : <><br /><small>Add items worth {rupees((coupon.minOrder || 0) - subtotal)} more to use it.</small></>}
              </span>
              <button className="link-btn" type="button" onClick={() => setCoupon("")}>Remove</button>
            </div>
          ) : (
            <>
              <form className="inline-form coupon" onSubmit={onCoupon}>
                <label className="sr-only" htmlFor="coupon-code">Discount code</label>
                <input id="coupon-code" name="code" placeholder="Discount code" autoComplete="off" />
                <button className="btn btn--outline" type="submit">Apply</button>
              </form>
              <p className="form-msg" role="status">{couponMsg}</p>
            </>
          )
        ) : null}
        <div className="summary__row"><span>Subtotal ({count} item{count === 1 ? "" : "s"})</span><span>{rupees(subtotal)}</span></div>
        {discount && coupon ? <div className="summary__row summary__row--discount"><span>Discount ({coupon.code})</span><span>− {rupees(discount)}</span></div> : null}
        {fee ? <div className="summary__row"><span>Cash on delivery charge</span><span>{rupees(fee)}</span></div> : null}
        <div className="summary__row"><span>Shipping</span><span>Confirmed on WhatsApp</span></div>
        <div className="summary__row summary__row--total"><span>Total</span><span>{rupees(total)}</span></div>

        {/* Kept mounted while the UPI step shows, so the details are still there after "Back". */}
        <form className="form" ref={checkout} style={{ marginTop: 20 }} hidden={!!payStep} onSubmit={onCheckout}>
          <div className="field"><label htmlFor="c-name">Your name</label><input id="c-name" name="name" required autoComplete="name" /></div>
          <div className="field"><label htmlFor="c-phone">Phone number</label><input id="c-phone" name="phone" type="tel" required autoComplete="tel" /></div>
          <div className="field"><label htmlFor="c-address">Delivery address</label><textarea id="c-address" name="address" required autoComplete="street-address" style={{ minHeight: 80 }} /></div>
          <div className="form-row">
            <div className="field"><label htmlFor="c-city">City</label><input id="c-city" name="city" required autoComplete="address-level2" /></div>
            <div className="field"><label htmlFor="c-pin">Pincode</label><input id="c-pin" name="pincode" inputMode="numeric" pattern="[0-9]{6}" title="6-digit pincode" required autoComplete="postal-code" defaultValue={read("vv_pin", "")} /></div>
          </div>
          <label className="addon">
            <input type="checkbox" name="gift" checked={gift} onChange={(e) => setGift(e.target.checked)} />
            <span><strong>This is a gift</strong><small>We leave prices out of the parcel and add your message on a card.</small></span>
          </label>
          {gift ? (
            <div className="field">
              <label htmlFor="c-gift">Gift message (optional)</label>
              <textarea id="c-gift" name="giftNote" maxLength={200} placeholder="Happy Diwali, with love from..." style={{ minHeight: 70 }} />
            </div>
          ) : null}
          <div className="field"><label htmlFor="c-note">Note for us (optional)</label><input id="c-note" name="note" placeholder="Delivery date, anything else..." /></div>
          <fieldset className="pay">
            <legend>How would you like to pay?</legend>
            {options.map((o) => (
              <label key={o.id}>
                <input type="radio" name="pay" value={o.id} checked={method === o.id} onChange={() => setPay(o.id)} />
                <span><strong>{o.label}</strong><small>{o.detail}</small></span>
              </label>
            ))}
          </fieldset>
          <button className="btn btn--pink btn--block" type="submit">{payOption(method).payNow ? "Continue to payment" : "Place order"}</button>
        </form>

        {payStep ? (
          <div className="upi">
            <h3>Pay {rupees(total)} by {payOption(payStep.method).label}</h3>
            <p className="hint">Order no. <strong>{payStep.orderId}</strong></p>
            {payStep.method === "upi" ? (
              <>
                <a className="btn btn--pink btn--block" href={upiUrl}>Open UPI app</a>
                <p className="hint">On a computer? Scan this code with any UPI app.</p>
                <div className="upi__qr" dangerouslySetInnerHTML={{ __html: qrSvg }} />
                <p className="hint">UPI ID: <strong>{SITE.upiId}</strong></p>
              </>
            ) : payStep.method === "card" ? (
              <>
                <a className="btn btn--pink btn--block" href={cardLink} target="_blank" rel="noopener">Open secure payment page</a>
                <p className="hint">Enter {rupees(total)} and your order number there, then come back to this page.</p>
              </>
            ) : bankReady ? (
              <dl className="bank">
                {bank.accountName ? <div><dt>Account name</dt><dd>{bank.accountName}</dd></div> : null}
                <div><dt>Account number</dt><dd>{bank.accountNumber}</dd></div>
                <div><dt>IFSC</dt><dd>{bank.ifsc}</dd></div>
                {bank.bankName ? <div><dt>Bank</dt><dd>{bank.bankName}</dd></div> : null}
                <div><dt>Amount</dt><dd>{rupees(total)}</dd></div>
              </dl>
            ) : null}
            <div className="field">
              <label htmlFor="pay-ref">Payment reference (after paying)</label>
              <input id="pay-ref" placeholder="e.g. 12-digit UPI reference" value={payRef} onChange={(e) => setPayRef(e.target.value)} />
            </div>
            <button className="btn btn--pink btn--block" type="button" onClick={() => placeOrder(payStep.orderId, true)}>I have paid · place order</button>
            <button className="link-btn" type="button" onClick={() => setPayStep(null)}>Back</button>
          </div>
        ) : null}

        <p className="note">Your order is also sent to us on WhatsApp, so we can confirm it with you there. {SITE.shippingNote}</p>
      </aside>
    </div>
  );
}
