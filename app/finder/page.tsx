import type { Metadata } from "next";
import { Crumbs, PageHead } from "@/components/Bits";
import Finder from "@/components/Finder";

export const metadata: Metadata = {
  title: "Help Me Choose a Saree",
  description: "Answer three quick questions and we will show you the handcrafted cotton sarees that suit you best.",
};

export default function FinderPage() {
  return (
    <>
      <Crumbs items={["Help me choose"]} />
      <PageHead title="Help me choose" sub="Three quick questions and we will find sarees that suit you" />
      <section className="wrap section">
        <Finder />
      </section>
    </>
  );
}
