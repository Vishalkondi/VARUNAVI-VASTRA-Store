import type { Metadata } from "next";
import Link from "next/link";
import { Crumbs, PageHead } from "@/components/Bits";
import { WhatsAppForm } from "@/components/Forms";
import { SITE } from "@/lib/data";

export const metadata: Metadata = {
  title: "Track Your Order",
  description: "Check on your Varunavi Vastra order. Send us your details on WhatsApp and we will reply with its status and tracking number.",
};

export default function TrackOrder() {
  return (
    <>
      <Crumbs items={["Track your order"]} />
      <PageHead title="Track your order" sub="We reply on WhatsApp with your order's status and tracking number" />
      <section className="wrap section track">
        <div>
          <h2>Where is my saree?</h2>
          <WhatsAppForm intro="Hello Varunavi Vastra, I would like to know the status of my order.">
            <div className="form-row">
              <div className="field"><label htmlFor="tr-name">Name on the order</label><input id="tr-name" name="name" data-label="Name" required autoComplete="name" /></div>
              <div className="field"><label htmlFor="tr-phone">Phone number</label><input id="tr-phone" name="phone" data-label="Phone" type="tel" required autoComplete="tel" /></div>
            </div>
            <div className="form-row">
              <div className="field"><label htmlFor="tr-date">Order date</label><input id="tr-date" name="date" data-label="Ordered on" type="date" /></div>
              <div className="field"><label htmlFor="tr-pin">Delivery pincode</label><input id="tr-pin" name="pincode" data-label="Pincode" inputMode="numeric" maxLength={6} autoComplete="postal-code" /></div>
            </div>
            <div className="field"><label htmlFor="tr-what">Which saree(s)? (optional)</label><input id="tr-what" name="items" data-label="Sarees" placeholder="e.g. Royal Blue Zari Polka" /></div>
            <div><button className="btn btn--pink" type="submit">Ask on WhatsApp</button></div>
            <p className="hint">This opens WhatsApp with your details filled in, so you can check and send.</p>
          </WhatsAppForm>
        </div>
        <aside className="track__info">
          <h2>Good to know</h2>
          <dl>
            <dt>When will it ship?</dt>
            <dd>Ready-to-ship sarees leave us within 1 to 2 working days of payment. Custom orders ship on the date we agree with you.</dd>
            <dt>How do I get the tracking number?</dt>
            <dd>We send it to you on WhatsApp as soon as your saree is handed to the courier.</dd>
            <dt>How long does delivery take?</dt>
            <dd>Usually 3 to 7 working days within India. You can check an estimate for your pincode on any saree page.</dd>
            <dt>Something wrong with your saree?</dt>
            <dd>Message us within 48 hours of delivery with photos. See our <Link href="/refund">Cancellation &amp; Refund</Link> policy.</dd>
          </dl>
          <p className="hint">Prefer to talk? WhatsApp us at {SITE.phoneDisplay}, {SITE.hours}.</p>
        </aside>
      </section>
    </>
  );
}
