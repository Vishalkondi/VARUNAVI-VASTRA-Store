import type { Metadata } from "next";
import { Crumbs, PageHead } from "@/components/Bits";
import { OpenStatus } from "@/components/Extras";
import { WhatsAppForm } from "@/components/Forms";
import { SITE } from "@/lib/data";
import { waLink } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact Varunavi Vastra in Solapur. Chat with us on WhatsApp " + SITE.phoneDisplay + ".",
};

export default function Contact() {
  return (
    <>
      <Crumbs items={["Contact"]} />
      <PageHead title="Contact us" sub="We would love to hear from you" />
      <section className="wrap contact">
        <div className="contact__info">
          <h2>Talk to a real person</h2>
          <p>The quickest way to reach us is WhatsApp. Ask about a saree, check availability or get draping help.</p>
          <a className="btn btn--whatsapp" href={waLink("Hello Varunavi Vastra!")} target="_blank" rel="noopener">Chat on WhatsApp</a>
          <dl>
            <dt>WhatsApp</dt><dd>{SITE.phoneDisplay}</dd>
            <dt>Visit us</dt><dd>{SITE.address}</dd>
            <dt>Hours</dt><dd>{SITE.hours}<OpenStatus /></dd>
          </dl>
          <a className="btn btn--outline directions-btn" target="_blank" rel="noopener"
            href={"https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(SITE.name + ", " + SITE.address)}>
            Get directions
          </a>
          <iframe
            className="map" title="Map to Varunavi Vastra" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps?q=Raviwar+Peth,+Bhadrawati+Chowk,+Solapur&output=embed"
          />
        </div>
        <div>
          <h2 style={{ fontSize: 24, marginBottom: 18 }}>Send us a message</h2>
          <WhatsAppForm intro="Hello Varunavi Vastra, I have a question.">
            <div className="form-row">
              <div className="field"><label htmlFor="ct-name">Your name</label><input id="ct-name" name="name" data-label="Name" required autoComplete="name" /></div>
              <div className="field"><label htmlFor="ct-phone">Phone number</label><input id="ct-phone" name="phone" data-label="Phone" type="tel" autoComplete="tel" /></div>
            </div>
            <div className="field">
              <label htmlFor="ct-topic">Topic</label>
              <select id="ct-topic" name="topic" data-label="Topic">
                <option>Question about a saree</option><option>My order</option><option>Exchange or return</option><option>Custom or bulk order</option><option>Something else</option>
              </select>
            </div>
            <div className="field"><label htmlFor="ct-msg">Message</label><textarea id="ct-msg" name="message" data-label="Message" required /></div>
            <div><button className="btn btn--pink" type="submit">Send on WhatsApp</button></div>
          </WhatsAppForm>
        </div>
      </section>
    </>
  );
}
