"use client";

import Link from "next/link";
import qrcode from "qrcode-generator";
import { useRef, useState, type FormEvent } from "react";
import { SITE, WEAVES } from "@/lib/data";
import { cart, findCoupon, lineKey, linePrice, read, setCoupon, useCart, useCoupon, useHydrated } from "@/lib/store";
import { byId, productUrl, rupees, waLink } from "@/lib/utils";
import { IMAGE_SIZES, ProductImage } from "./Bits";

const upi = !!SITE.upiId;

export default function CartView() {
  const { items, count, subtotal } = useCart();
  const { coupon, discount } = useCoupon(subtotal);
  const total = subtotal - discount;
  const checkout = useRef<HTMLFormElement>(null);
  const [couponMsg, setCouponMsg] = useState("");
  const [upiUrl, setUpiUrl] = useState(""); // set once the shopper chooses to pay by UPI
  const [upiRef, setUpiRef] = useState("");
  const [gift, setGift] = useState(false);
  const hydrated = useHydrated();

  if (!hydrated) return null;

  if (!items.length) {
    return (
      <div className="empty">
        <h2>Your cart is empty</h2>
        <p>Find a saree you love and it will wait for you here.</p>
        <Link className="btn btn--pink" href="/shop">Shop sarees</Link>
      </div>
    );
  }

  function orderMessage(payLine: string) {
    const f = new FormData(checkout.current!);
    const list = items.map((i, n) => (n + 1) + ". " + byId(i.id)!.name + " (" + byId(i.id)!.sku + ")" + (i.fp ? " + fall and picot" : "") + " x " + i.qty + " = " + rupees(linePrice(i) * i.qty));
    return "Hello Varunavi Vastra, I would like to place an order:\n\n" + list.join("\n") +
      "\n\nSubtotal: " + rupees(subtotal) +
      (discount && coupon ? "\nDiscount (" + coupon.code + "): - " + rupees(discount) : "") +
      "\nTotal: " + rupees(total) +
      "\n\nName: " + f.get("name") + "\nPhone: " + f.get("phone") +
      "\nAddress: " + f.get("address") + ", " + f.get("city") + " " + f.get("pincode") +
      (f.get("note") ? "\nNote: " + f.get("note") : "") +
      (gift ? "\n\nThis is a gift: please leave prices out of the parcel." + (f.get("giftNote") ? "\nGift message: " + f.get("giftNote") : "") : "") +
      "\n\nPayment: " + payLine;
  }

  function onCheckout(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const pay = upi ? new FormData(e.currentTarget).get("pay") : "later";
    if (pay !== "upi") {
      window.open(waLink(orderMessage("I will pay after you confirm")), "_blank", "noopener");
      return;
    }
    // UPI: a payment link for phones and a QR code for computers, then the order goes to WhatsApp with the reference.
    setUpiUrl("upi://pay?pa=" + encodeURIComponent(SITE.upiId) + "&pn=" + encodeURIComponent(SITE.upiName) +
      "&am=" + total.toFixed(2) + "&cu=INR&tn=" + encodeURIComponent("Varunavi order"));
  }

  function onCoupon(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const c = findCoupon(new FormData(e.currentTarget).get("code") as string);
    if (!c) { setCouponMsg("That code is not valid."); return; }
    setCouponMsg("");
    setCoupon(c.code);
  }

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
        <div className="summary__row"><span>Shipping</span><span>Confirmed on WhatsApp</span></div>
        <div className="summary__row summary__row--total"><span>Total</span><span>{rupees(total)}</span></div>

        {/* Kept mounted while the UPI step shows, so the details are still there after "Back". */}
        <form className="form" ref={checkout} style={{ marginTop: 20 }} hidden={!!upiUrl} onSubmit={onCheckout}>
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
          {upi ? (
            <fieldset className="pay">
              <legend>How would you like to pay?</legend>
              <label><input type="radio" name="pay" value="upi" defaultChecked /> <span><strong>Pay now with UPI</strong><small>GPay, PhonePe, Paytm or any UPI app</small></span></label>
              <label><input type="radio" name="pay" value="later" /> <span><strong>Confirm on WhatsApp first</strong><small>We check availability, then share payment details</small></span></label>
            </fieldset>
          ) : null}
          <button className="btn btn--pink btn--block" type="submit">{upi ? "Continue" : "Place order on WhatsApp"}</button>
        </form>

        {upiUrl ? (
          <div className="upi">
            <h3>Pay {rupees(total)} by UPI</h3>
            <a className="btn btn--pink btn--block" href={upiUrl}>Open UPI app</a>
            <p className="hint">On a computer? Scan this code with any UPI app.</p>
            <div className="upi__qr" dangerouslySetInnerHTML={{ __html: qrSvg }} />
            <p className="hint">UPI ID: <strong>{SITE.upiId}</strong></p>
            <div className="field">
              <label htmlFor="upi-ref">UPI transaction ID (after paying)</label>
              <input id="upi-ref" inputMode="numeric" placeholder="12-digit reference number" value={upiRef} onChange={(e) => setUpiRef(e.target.value)} />
            </div>
            <button
              className="btn btn--whatsapp btn--block" type="button"
              onClick={() => {
                const ref = upiRef.trim();
                window.open(waLink(orderMessage("Paid " + rupees(total) + " by UPI" + (ref ? " (ref " + ref + ")" : " (screenshot to follow)"))), "_blank", "noopener");
              }}
            >
              I have paid · send order on WhatsApp
            </button>
            <button className="link-btn" type="button" onClick={() => setUpiUrl("")}>Back</button>
          </div>
        ) : null}

        <p className="note">{upi ? "" : "Your order details open in WhatsApp. We will confirm availability and share payment details (UPI or bank transfer) there. "}{SITE.shippingNote}</p>
      </aside>
    </div>
  );
}
