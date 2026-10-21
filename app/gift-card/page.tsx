import type { Metadata } from "next";
import { Crumbs, PageHead } from "@/components/Bits";
import GiftCard from "@/components/GiftCard";

export const metadata: Metadata = {
  title: "Gift Cards",
  description: "Give a Varunavi Vastra gift card and let them choose a handcrafted cotton saree they love.",
};

export default function GiftCardPage() {
  return (
    <>
      <Crumbs items={["Gift cards"]} />
      <PageHead title="Gift cards" sub="Let them choose a handcrafted saree they love" />
      <section className="wrap section">
        <GiftCard />
      </section>
    </>
  );
}
