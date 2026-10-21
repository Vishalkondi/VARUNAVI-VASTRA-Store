import type { Metadata } from "next";
import Link from "next/link";
import { Crumbs, IMAGE_SIZES, PageHead, ProductImage } from "@/components/Bits";
import { COLLECTIONS } from "@/lib/data";
import { collectionProducts, collectionUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Collections",
  description: "Curated collections of handcrafted cotton sarees: temple borders, zari, hand block prints and easy office wear.",
};

export default function Collections() {
  const list = COLLECTIONS.map((c) => ({ c, items: collectionProducts(c) })).filter((x) => x.items.length);
  return (
    <>
      <Crumbs items={["Collections"]} />
      <PageHead title="Collections" sub="Sarees grouped by the stories they tell" />
      <section className="wrap section">
        <div className="collections">
          {list.map(({ c, items }) => (
            <Link className="collection-card" href={collectionUrl(c)} key={c.slug}>
              <span className="collection-card__media media"><ProductImage p={items[0]} sizes={IMAGE_SIZES.card} /></span>
              <span className="collection-card__text">
                <small>{items.length} {items.length === 1 ? "saree" : "sarees"}</small>
                <strong>{c.name}</strong>
                <span>{c.tagline}</span>
                <em>View collection →</em>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
