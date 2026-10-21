import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Crumbs, ProductCard, TrustStrip } from "@/components/Bits";
import { COLLECTIONS } from "@/lib/data";
import { collectionProducts, collectionUrl, waLink } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => COLLECTIONS.map((c) => ({ slug: c.slug }));

const find = (slug: string) => COLLECTIONS.find((c) => c.slug === slug);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = find((await params).slug);
  return c ? { title: c.name, description: c.description } : {};
}

export default async function CollectionPage({ params }: Props) {
  const c = find((await params).slug);
  if (!c) notFound();
  const items = collectionProducts(c);
  const others = COLLECTIONS.filter((x) => x.slug !== c.slug && collectionProducts(x).length);

  return (
    <>
      <Crumbs items={[["Collections", "/collections"], c.name]} />
      <section className="page-head collection-head">
        <div className="wrap">
          <p className="eyebrow">Collection</p>
          <h1>{c.name}</h1>
          <p>{c.description}</p>
        </div>
      </section>
      <section className="wrap section">
        {items.length ? (
          <div className="grid">{items.map((p) => <ProductCard p={p} key={p.id} />)}</div>
        ) : (
          <div className="empty">
            <h2>New pieces are on the loom</h2>
            <p>Message us and we will tell you when this collection is back.</p>
            <a className="btn btn--whatsapp" href={waLink("Hello Varunavi Vastra, please tell me when new sarees arrive in " + c.name + ".")} target="_blank" rel="noopener">Ask us on WhatsApp</a>
          </div>
        )}
        {others.length ? (
          <div className="collection-more">
            <span>More collections:</span>
            {others.map((x) => <Link className="chip" href={collectionUrl(x)} key={x.slug}>{x.name}</Link>)}
          </div>
        ) : null}
      </section>
      <TrustStrip />
    </>
  );
}
