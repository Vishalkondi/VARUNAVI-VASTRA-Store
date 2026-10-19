import type { Metadata } from "next";
import { PolicyPage } from "@/components/Bits";

export const metadata: Metadata = {
  title: "Cancellation & Refund",
  description: "Cancellation, exchange and refund policy for Varunavi Vastra orders.",
};

export default function Refund() {
  return (
    <PolicyPage title="Cancellation & Refund">
      <h2>Cancellations</h2>
      <p>You can cancel an order before it ships by messaging us on WhatsApp. Once the saree has shipped, the order cannot be cancelled.</p>
      <h2>Exchanges and returns</h2>
      <ul>
        <li>Message us within [48 hours] of delivery with clear photos if your saree arrives damaged or is not what you ordered.</li>
        <li>The saree must be unused and unwashed, with its tags and original packaging.</li>
        <li>Custom orders, sarees on sale, and sarees with fall and picot done are not eligible for return or exchange.</li>
        <li>Small irregularities in weave and slight colour differences from photos are natural in handcrafted sarees and are not defects.</li>
      </ul>
      <h2>Refunds</h2>
      <p>Once we receive and check the returned saree, approved refunds are made to your original payment method or bank account within [7] working days.</p>
      <h2>Return shipping</h2>
      <p>[We cover return shipping for damaged or wrong items. For other returns, the customer pays return shipping.]</p>
    </PolicyPage>
  );
}
