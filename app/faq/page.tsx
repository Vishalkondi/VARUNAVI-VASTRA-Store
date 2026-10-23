import type { Metadata } from "next";
import Link from "next/link";
import { Crumbs, PageHead } from "@/components/Bits";
import { PAY_OPTIONS } from "@/lib/payments";
import { waLink } from "@/lib/utils";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about Varunavi Vastra sarees, orders, payment, delivery and care.",
};

export default function Faq() {
  return (
    <>
      <Crumbs items={["FAQ"]} />
      <PageHead title="Frequently asked questions" />
      <section className="section">
        <div className="wrap narrow">
          <div className="accordion prose">
            <details><summary>Are your sarees really handcrafted?</summary><div><p>Yes. Our sarees are made by skilled weavers, so small variations in the weave are a sign of handwork, not a defect.</p></div></details>
            <details><summary>Do the sarees come with a blouse piece?</summary><div><p>Most of our sarees come with an attached blouse piece. The product page shows the length and whether a blouse piece is included.</p></div></details>
            <details><summary>How do I place an order?</summary><div><p>Add sarees to your cart, fill in your delivery details, choose how to pay and tap &quot;Place order&quot;. You get an order number straight away, and your order is also sent to us on WhatsApp so we can confirm availability and shipping with you there. You can also message us directly about any saree.</p></div></details>
            <details><summary>How can I pay?</summary><div><p>We accept {PAY_OPTIONS.map((o) => o.label).join(", ").replace(/, ([^,]*)$/, " and $1")}.</p></div></details>
            <details><summary>How long does delivery take?</summary><div><p>Ready-to-ship sarees are dispatched within 1 to 2 working days and usually arrive in 3 to 7 working days within India. See our <Link href="/shipping">Shipping &amp; Delivery</Link> page.</p></div></details>
            <details><summary>Do you ship outside India?</summary><div><p>[Yes / Not yet.] Message us on WhatsApp and we will check for your country.</p></div></details>
            <details><summary>Can I exchange or return a saree?</summary><div><p>If something is not right, message us within 48 hours of delivery with photos. See our <Link href="/refund">Cancellation &amp; Refund</Link> policy for details.</p></div></details>
            <details><summary>How should I care for a cotton saree?</summary><div><p>Hand wash gently in cold water with a mild detergent, wash dark colours separately for the first few washes, and dry in shade. Starch and iron on medium heat for a crisp drape.</p></div></details>
            <details><summary>Do you take custom or bulk orders?</summary><div><p>Yes, for weddings, festivals, events and gifting. Share your requirements on our <Link href="/custom-order">Custom Order</Link> page.</p></div></details>
          </div>
          <p className="hint" style={{ marginTop: 28 }}>
            Still have a question? <a className="link-btn" href={waLink("Hello Varunavi Vastra, I have a question.")} target="_blank" rel="noopener">Ask us on WhatsApp</a>
          </p>
        </div>
      </section>
    </>
  );
}
