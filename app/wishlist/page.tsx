import type { Metadata } from "next";
import { Crumbs, PageHead } from "@/components/Bits";
import WishlistView from "@/components/Wishlist";

export const metadata: Metadata = { title: "Wishlist", description: "Sarees you have saved at Varunavi Vastra." };

export default function Wishlist() {
  return (
    <>
      <Crumbs items={["Wishlist"]} />
      <PageHead title="Your wishlist" sub="Saved on this device" />
      <WishlistView />
    </>
  );
}
