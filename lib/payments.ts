/* Ways to pay, built from the settings in data.ts (SITE.upiId and SITE.payments). */

import { SITE } from "./data";

export type PayMethod = "upi" | "card" | "bank" | "cod";

export type PayOption = {
  id: PayMethod;
  label: string;   // shown at checkout
  short: string;   // shown in the footer, FAQ and order summary
  detail: string;
  payNow: boolean; // true = the shopper pays before the order is sent
};

const P = SITE.payments;
export const bankReady = !!(P.bank.accountNumber && P.bank.ifsc);

// Every way to pay this shop offers, in the order shown at checkout.
export const PAY_OPTIONS: PayOption[] = [
  {
    id: "upi", label: "UPI", short: "UPI", payNow: !!SITE.upiId,
    detail: SITE.upiId ? "GPay, PhonePe, Paytm or any UPI app. Pay now by QR code." : "GPay, PhonePe, Paytm or any UPI app. We send our UPI ID once we confirm.",
  },
  ...(P.cardLink ? [{ id: "card" as const, label: "Card or net banking", short: "Cards", payNow: true, detail: "Debit card, credit card or net banking on our secure payment page." }] : []),
  {
    id: "bank", label: "Bank transfer", short: "Bank transfer", payNow: bankReady,
    detail: bankReady ? "NEFT, IMPS or RTGS to our bank account." : "NEFT, IMPS or RTGS. We send our account details once we confirm.",
  },
  ...(P.cod ? [{
    id: "cod" as const, label: "Cash on delivery", short: "Cash on delivery", payNow: false,
    detail: "Pay in cash when your saree arrives." + (P.codFee ? " A ₹ " + P.codFee + " handling charge applies." : ""),
  }] : []),
];

export const payOption = (id: PayMethod) => PAY_OPTIONS.find((o) => o.id === id)!;

// Cash on delivery is offered only up to SITE.payments.codMax.
export const payOptionsFor = (total: number) =>
  PAY_OPTIONS.filter((o) => o.id !== "cod" || !P.codMax || total <= P.codMax);

export const payFee = (id: PayMethod) => (id === "cod" ? P.codFee : 0);
