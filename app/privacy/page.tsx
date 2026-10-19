import type { Metadata } from "next";
import { PolicyPage } from "@/components/Bits";
import { SITE } from "@/lib/data";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Varunavi Vastra collects and uses your information.",
};

export default function Privacy() {
  return (
    <PolicyPage title="Privacy Policy">
      <h2>What we collect</h2>
      <p>When you place an order or send an enquiry, you share your name, phone number and delivery address with us on WhatsApp. If you subscribe to updates, we keep your email address.</p>
      <h2>How we use it</h2>
      <p>We use your details only to process your order, deliver it, reply to your questions and, if you subscribed, tell you about new sarees. We do not sell your information.</p>
      <h2>Cart and wishlist</h2>
      <p>Your cart and wishlist are stored in your own browser on this device. We cannot see them until you send us an order.</p>
      <h2>Third parties</h2>
      <p>Orders and messages are sent through WhatsApp, and delivery partners receive your address to deliver your saree. The map on our contact page is provided by Google Maps.</p>
      <h2>Contact</h2>
      <p>To ask about or delete your information, message us on WhatsApp at {SITE.phoneDisplay}.</p>
    </PolicyPage>
  );
}
