import type { Metadata } from "next";
import { PolicyPage } from "@/components/Bits";
import { SITE } from "@/lib/data";
import { waLink } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Shipping & Delivery",
  description: "Shipping and delivery information for Varunavi Vastra orders.",
};

export default function Shipping() {
  return (
    <PolicyPage title="Shipping & Delivery">
      <h2>Dispatch</h2>
      <p>Ready-to-ship sarees are dispatched within 1 to 2 working days after your payment is confirmed. Custom orders are dispatched within the time we agree with you on WhatsApp.</p>
      <h2>Delivery time</h2>
      <ul>
        <li>Within Maharashtra: [2 to 4] working days</li>
        <li>Rest of India: [3 to 7] working days</li>
        <li>International: [on request]</li>
      </ul>
      <h2>Shipping charges</h2>
      <p>[Free shipping across India on all orders / Shipping charges of ₹ X apply below ₹ Y.]</p>
      <h2>Tracking</h2>
      <p>Once your saree ships, we will send you the tracking number on WhatsApp.</p>
      <h2>Questions</h2>
      <p>Message us on WhatsApp at <a href={waLink()} target="_blank" rel="noopener">{SITE.phoneDisplay}</a> and we will help.</p>
    </PolicyPage>
  );
}
