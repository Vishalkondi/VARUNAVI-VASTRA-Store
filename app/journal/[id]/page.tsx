import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Crumbs, Heading, PostArt, PostCard } from "@/components/Bits";
import { POSTS } from "@/lib/data";
import { asset, formatDate } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => POSTS.map((post) => ({ id: post.id }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = POSTS.find((x) => x.id === id);
  return post ? { title: post.title, description: post.excerpt, openGraph: { type: "article", title: post.title, description: post.excerpt } } : {};
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const post = POSTS.find((x) => x.id === id);
  if (!post) notFound();
  const more = POSTS.filter((x) => x.id !== post.id).slice(0, 3);

  return (
    <>
      <Crumbs items={[["Journal", "/journal"], post.title]} />
      <article className="section">
        <div className="wrap narrow">
          <header className="post-head"><time dateTime={post.date}>{formatDate(post.date)}</time><h1>{post.title}</h1></header>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div className="media post-hero">{post.image ? <img src={asset(post.image)} alt="" /> : <PostArt post={post} />}</div>
          {/* body is site-owned HTML from lib/data.ts */}
          <div className="prose" dangerouslySetInnerHTML={{ __html: post.body }} />
        </div>
      </article>
      <section className="section section--cream">
        <div className="wrap">
          <Heading title="More from the journal" />
          <div className="posts">{more.map((p) => <PostCard post={p} key={p.id} />)}</div>
        </div>
      </section>
    </>
  );
}
