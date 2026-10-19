import type { Metadata } from "next";
import { Suspense } from "react";
import { TrustStrip } from "@/components/Bits";
import Shop, { ShopFallback } from "@/components/Shop";
import { SITE } from "@/lib/data";

export const metadata: Metadata = {
  description: "Shop handcrafted cotton sarees: handloom, festive zari and block print cotton, from Solapur.",
};

export default function ShopPage() {
  return (
    <>
      {/* Default title; <Shop> retitles the tab to match the filters ("New Arrivals", "Search results"...). */}
      <title>{"Cotton Sarees · " + SITE.name}</title>
      {/* Filters live in the URL (?weave=, ?new=1, ?q=...), which is only known in the browser. */}
      <Suspense fallback={<ShopFallback />}>
        <Shop />
      </Suspense>
      <TrustStrip />
    </>
  );
}
