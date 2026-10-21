import type { Metadata } from "next";
import { Crumbs, PageHead } from "@/components/Bits";
import { CompareTable } from "@/components/Compare";

export const metadata: Metadata = { title: "Compare sarees", description: "Compare Varunavi Vastra sarees side by side.", robots: { index: false } };

export default function ComparePage() {
  return (
    <>
      <Crumbs items={["Compare"]} />
      <PageHead title="Compare sarees" sub="See up to three sarees side by side" />
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap"><CompareTable /></div>
      </section>
    </>
  );
}
