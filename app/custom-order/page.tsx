import type { Metadata } from "next";
import { Crumbs, PageHead, TrustStrip } from "@/components/Bits";
import { WhatsAppForm } from "@/components/Forms";

export const metadata: Metadata = {
  title: "Custom & Bulk Orders",
  description: "Tell us the colour, fabric or occasion you have in mind. Varunavi Vastra takes custom and bulk saree orders for weddings, festivals and events.",
};

export default function CustomOrder() {
  return (
    <>
      <Crumbs items={["Custom Order"]} />
      <PageHead title="Custom and bulk orders" sub="For weddings, festivals, events and gifting" />
      <section className="section">
        <div className="wrap narrow">
          <p className="lead" style={{ marginBottom: 36 }}>Tell us the colour, fabric or occasion you have in mind. We will reply on WhatsApp with options, prices and timelines.</p>
          <WhatsAppForm intro="Hello Varunavi Vastra, I would like to enquire about a custom order.">
            <div className="form-row">
              <div className="field"><label htmlFor="co-name">Your name</label><input id="co-name" name="name" data-label="Name" required autoComplete="name" /></div>
              <div className="field"><label htmlFor="co-phone">Phone number</label><input id="co-phone" name="phone" data-label="Phone" type="tel" required autoComplete="tel" /></div>
            </div>
            <div className="form-row">
              <div className="field">
                <label htmlFor="co-occasion">Occasion</label>
                <select id="co-occasion" name="occasion" data-label="Occasion">
                  <option value="">Choose one</option><option>Wedding</option><option>Festival</option><option>Corporate or event</option><option>Gifting</option><option>Other</option>
                </select>
              </div>
              <div className="field"><label htmlFor="co-qty">How many sarees?</label><input id="co-qty" name="quantity" data-label="Quantity" type="number" min="1" placeholder="e.g. 10" /></div>
            </div>
            <div className="form-row">
              <div className="field"><label htmlFor="co-colour">Colours you have in mind</label><input id="co-colour" name="colour" data-label="Colours" placeholder="e.g. maroon with gold border" /></div>
              <div className="field"><label htmlFor="co-date">Needed by</label><input id="co-date" name="date" data-label="Needed by" type="date" /></div>
            </div>
            <div className="field"><label htmlFor="co-budget">Budget per saree (optional)</label><input id="co-budget" name="budget" data-label="Budget per saree" placeholder="e.g. ₹ 2,500" /></div>
            <div className="field"><label htmlFor="co-msg">Anything else?</label><textarea id="co-msg" name="message" data-label="Details" placeholder="Fabric, weave, blouse, packaging, delivery city..." /></div>
            <div><button className="btn btn--pink" type="submit">Send enquiry on WhatsApp</button></div>
            <p className="hint">This opens WhatsApp with your details filled in, so you can review and send.</p>
          </WhatsAppForm>
        </div>
      </section>
      <TrustStrip />
    </>
  );
}
