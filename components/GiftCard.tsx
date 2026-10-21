"use client";

/* Gift card request: pick an amount, write a message, preview the card, then send the request on WhatsApp.
 * The shop confirms payment and sends the gift card by hand, so no payment system is needed. */

import { useState, type FormEvent } from "react";
import { SITE } from "@/lib/data";
import { rupees, waLink } from "@/lib/utils";
import { Logo } from "./Bits";

const AMOUNTS = [1000, 2000, 3000, 5000];
const MIN = 500;

export default function GiftCard() {
  const [amount, setAmount] = useState(2000);
  const [custom, setCustom] = useState("");
  const [to, setTo] = useState("");
  const [from, setFrom] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const value = custom ? parseInt(custom, 10) || 0 : amount;

  function send(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (value < MIN) { setError("Please choose an amount of " + rupees(MIN) + " or more."); return; }
    setError("");
    const f = new FormData(e.currentTarget);
    const lines = [
      "Hello Varunavi Vastra, I would like to buy a gift card.",
      "",
      "Amount: " + rupees(value),
      "For: " + to,
      f.get("toPhone") ? "Their WhatsApp: " + f.get("toPhone") : "",
      "From: " + from,
      note ? "Message: " + note : "",
      "Send it: " + f.get("delivery"),
    ].filter((l, i) => l || i === 1);
    window.open(waLink(lines.join("\n")), "_blank", "noopener");
  }

  return (
    <div className="gift">
      <div className="gift__preview" aria-hidden="true">
        <div className="gift__card">
          <span className="logo gift__logo"><Logo /></span>
          <span className="gift__label">Gift card</span>
          <strong className="gift__amount">{value >= MIN ? rupees(value) : "₹ —"}</strong>
          <span className="gift__to">{to ? "For " + to : "For someone special"}</span>
          {note ? <p className="gift__note">“{note}”</p> : null}
          <span className="gift__from">{from ? "With love, " + from : ""}</span>
        </div>
        <p className="hint">A preview of the card we will send.</p>
      </div>

      <form className="form gift__form" onSubmit={send}>
        <fieldset className="gift__amounts">
          <legend>Choose an amount</legend>
          <div className="chips">
            {AMOUNTS.map((a) => (
              <button type="button" key={a} className={"chip" + (!custom && amount === a ? " is-on" : "")} aria-pressed={!custom && amount === a}
                onClick={() => { setAmount(a); setCustom(""); }}>
                {rupees(a)}
              </button>
            ))}
          </div>
          <div className="field">
            <label htmlFor="gc-custom">Or enter an amount (minimum {rupees(MIN)})</label>
            <input id="gc-custom" inputMode="numeric" placeholder="e.g. 2500" value={custom} onChange={(e) => setCustom(e.target.value.replace(/\D/g, "").slice(0, 6))} />
          </div>
        </fieldset>
        <div className="form-row">
          <div className="field"><label htmlFor="gc-to">Who is it for?</label><input id="gc-to" required value={to} onChange={(e) => setTo(e.target.value)} maxLength={40} /></div>
          <div className="field"><label htmlFor="gc-from">Your name</label><input id="gc-from" required value={from} onChange={(e) => setFrom(e.target.value)} maxLength={40} autoComplete="name" /></div>
        </div>
        <div className="field"><label htmlFor="gc-note">Message (optional)</label><textarea id="gc-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={160} placeholder="Happy birthday! Choose a saree you love." style={{ minHeight: 80 }} /></div>
        <div className="field">
          <label htmlFor="gc-delivery">How should we send it?</label>
          <select id="gc-delivery" name="delivery">
            <option>To me on WhatsApp, I will pass it on</option>
            <option>Directly to them on WhatsApp</option>
          </select>
        </div>
        <div className="field"><label htmlFor="gc-phone">Their WhatsApp number (if we send it to them)</label><input id="gc-phone" name="toPhone" type="tel" autoComplete="off" /></div>
        {error ? <p className="form-msg gift__error" role="alert">{error}</p> : null}
        <button className="btn btn--pink btn--block" type="submit">Request gift card on WhatsApp</button>
        <p className="hint">We confirm the details and payment with you on WhatsApp, then send the gift card. It can be used on any saree on {SITE.name}.</p>
      </form>
    </div>
  );
}
