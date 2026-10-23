import type { Metadata } from "next";
import OrderPlaced from "@/components/OrderPlaced";

export const metadata: Metadata = { title: "Order Placed", robots: { index: false } };

export default function OrderPlacedPage() {
  return (
    <section className="wrap section"><OrderPlaced /></section>
  );
}
