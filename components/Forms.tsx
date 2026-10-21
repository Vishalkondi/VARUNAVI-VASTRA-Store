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

// Sign-up for new-arrival updates. Sends a WhatsApp message asking to be added to the updates list,
// so every sign-up reaches the shop (an email box would need a mailing service to store addresses).
const INTERESTS = ["All new arrivals", "Handloom cotton", "Festive zari", "Block prints"];

export function UpdatesForm() {
  const [msg, setMsg] = useState("");
  return (
    <>
      <form
        className="updates-form"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const name = String(f.get("name") || "").trim();
          window.open(waLink(
            "Hello Varunavi Vastra, please add me to your new arrivals updates on WhatsApp." +
            (name ? "\nName: " + name : "") + "\nInterested in: " + f.get("interest"),
          ), "_blank", "noopener");
          setMsg("Your message is ready in WhatsApp. Tap Send and we will add you.");
        }}
      >
        <label className="sr-only" htmlFor="up-name">Your name</label>
        <input id="up-name" name="name" placeholder="Your name (optional)" autoComplete="given-name" />
        <label className="sr-only" htmlFor="up-interest">Interested in</label>
        <select id="up-interest" name="interest" className="select">
          {INTERESTS.map((i) => <option key={i}>{i}</option>)}
        </select>
        <button className="btn btn--whatsapp" type="submit">Get updates on WhatsApp</button>
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
