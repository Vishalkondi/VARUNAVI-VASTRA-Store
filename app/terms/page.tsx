import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage } from "@/components/Bits";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for shopping at Varunavi Vastra.",
};

export default function Terms() {
  return (
    <PolicyPage title="Terms & Conditions">
      <h2>About us</h2>
      <p>This website is run by Varunavi Vastra, 267/38, Raviwar Peth, Bhadrawati Chowk, Kuchan High School Road, Solapur, Maharashtra, India.</p>
      <h2>Products</h2>
      <p>Our sarees are handcrafted, so each piece may vary slightly in weave and colour. Photos are as accurate as possible, but colours can look different on different screens.</p>
      <h2>Prices and orders</h2>
      <p>Prices are in Indian Rupees. An order is confirmed only when we confirm it on WhatsApp and, unless you chose cash on delivery, receive payment. We may decline an order if an item is out of stock or a price was shown in error.</p>
      <h2>Shipping, cancellation and returns</h2>
      <p>See our <Link href="/shipping">Shipping &amp; Delivery</Link> and <Link href="/refund">Cancellation &amp; Refund</Link> pages.</p>
      <h2>Content</h2>
      <p>Photos, text and designs on this website belong to Varunavi Vastra and may not be copied without permission.</p>
      <h2>Governing law</h2>
      <p>These terms are governed by the laws of India, and disputes are subject to the courts of [Solapur].</p>
    </PolicyPage>
  );
}
