import type { Metadata } from "next";
import { Crumbs, PageHead, PostCard } from "@/components/Bits";
import { POSTS } from "@/lib/data";

export const metadata: Metadata = {
  title: "Journal",
  description: "Saree care guides, draping tips and stories from the loom, from Varunavi Vastra.",
};

export default function Journal() {
  return (
    <>
      <Crumbs items={["Journal"]} />
      <PageHead title="Journal" sub="Care guides, draping tips and stories from the loom" />
      <section className="section">
        <div className="wrap"><div className="posts">{POSTS.map((post) => <PostCard post={post} key={post.id} />)}</div></div>
      </section>
    </>
  );
}
