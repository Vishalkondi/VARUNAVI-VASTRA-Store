import type { Metadata } from "next";
import { Crumbs, PageHead, TrustStrip } from "@/components/Bits";
import CartView from "@/components/Cart";

export const metadata: Metadata = { title: "Your Cart", description: "Your shopping cart at Varunavi Vastra." };

export default function CartPage() {
  return (
    <>
      <Crumbs items={["Cart"]} />
      <PageHead title="Your cart" />
      <section className="wrap"><CartView /></section>
      <TrustStrip />
    </>
  );
}
