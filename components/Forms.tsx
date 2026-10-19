"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { cart } from "@/lib/store";
import { byId, waLink } from "@/lib/utils";
import { useToast } from "./Toast";

// A form whose filled-in fields are sent as a pre-filled WhatsApp message.
// Each field's `data-label` (or its name) becomes the line label.
export function WhatsAppForm({ intro, children }: { intro: string; children: ReactNode }) {
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fields = Array.from(e.currentTarget.querySelectorAll<HTMLInputElement>("[name]"));
    const lines = fields
      .filter((el) => el.value.trim())
      .map((el) => (el.dataset.label || el.name) + ": " + el.value.trim());
    window.open(waLink(intro + "\n\n" + lines.join("\n")), "_blank", "noopener");
  }
  return <form className="form" onSubmit={onSubmit}>{children}</form>;
}

export function NewsletterForm() {
  const [msg, setMsg] = useState("");
  return (
    <>
      <form
        className="inline-form"
        onSubmit={(e) => {
          e.preventDefault();
          // TODO: connect to an email service (e.g. Mailchimp, Brevo or Formspree) to actually save sign-ups.
          setMsg("Thank you! We will let you know when new weaves arrive.");
          e.currentTarget.reset();
        }}
      >
        <label className="sr-only" htmlFor="nl-email">Email address</label>
        <input id="nl-email" type="email" name="email" placeholder="Your email address" required autoComplete="email" />
        <button className="btn btn--pink" type="submit">Subscribe</button>
      </form>
      <p className="form-msg" role="status">{msg}</p>
    </>
  );
}

export function useAddToCart() {
  const toast = useToast();
  return (id: string, qty = 1, fp = false) => {
    cart.add(id, qty, fp);
    toast(<>{byId(id)!.name} added to your cart. <Link href="/cart">View cart</Link></>);
  };
}

export function AddToCartButton({ id }: { id: string }) {
  const addToCart = useAddToCart();
  return <button className="btn btn--pink" type="button" onClick={() => addToCart(id)}>Add to cart</button>;
}

// "Add to cart" that slides up over a product card's photo on hover.
export function QuickAdd({ id }: { id: string }) {
  const addToCart = useAddToCart();
  return <button className="card__quick" type="button" onClick={() => addToCart(id)}>Add to cart</button>;
}
