import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Crumbs, Heading, ProductCard, Stars, TrustStrip } from "@/components/Bits";
import { DeliveryCheck } from "@/components/Extras";
import { ChatIcon, CheckIcon, LoomIcon } from "@/components/Icons";
import { BuyBox, Gallery, RecentlyViewed, ShareButton } from "@/components/ProductParts";
import { COLLECTIONS, PRODUCT_DEFAULTS, PRODUCTS, SITE, WEAVES } from "@/lib/data";
import { asset, avgRating, byId, collectionProducts, collectionUrl, formatDate, hasPrice, priceText, productUrl, waLink } from "@/lib/utils";
import { CompareButton } from "@/components/Compare";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => PRODUCTS.map((p) => ({ id: p.id }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const p = byId(id);
  if (!p) return {};
  return {
    title: p.name,
    description: p.description,
    openGraph: { title: p.name + " · " + SITE.name, description: p.description, images: p.images.slice(0, 1).map(asset) },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const p = byId(id);
  if (!p) notFound();
  const d = { ...PRODUCT_DEFAULTS, ...p };
  const pageUrl = SITE.url + productUrl(p);
  const reviews = p.reviews || [];
  const rating = avgRating(p);
  const plural = (n: number) => n + " review" + (n === 1 ? "" : "s");

  const siblings = p.group ? PRODUCTS.filter((x) => x.group === p.group) : [];
  const inCollections = COLLECTIONS.filter((c) => collectionProducts(c).some((x) => x.id === p.id));
  // You may also like: same weave first, then the rest
  const related = PRODUCTS.filter((x) => x.id !== p.id)
    .sort((a, b) => Number(b.weave === p.weave) - Number(a.weave === p.weave) || b.added - a.added)
    .slice(0, 4);

  // Search engines: product structured data
  const ld = {
    "@context": "https://schema.org", "@type": "Product", name: p.name, description: p.description,
    brand: { "@type": "Brand", name: SITE.name }, sku: p.sku,
    image: p.images.map((src) => SITE.url + asset(src)),
    // Price details only once the saree has a price
    ...(hasPrice(p) ? { offers: {
      "@type": "Offer", priceCurrency: "INR", price: p.price, url: pageUrl,
      availability: "https://schema.org/" + (p.soldOut ? "OutOfStock" : "InStock"),
    } } : {}),
    ...(reviews.length ? { aggregateRating: { "@type": "AggregateRating", ratingValue: rating.toFixed(1), reviewCount: reviews.length } } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <Crumbs items={[["Cotton Sarees", "/shop"], p.name]} />
      <section className="wrap">
        <div className="pdp">
          <Gallery p={p} />
          <div className="pdp__info">
            {p.isNew ? <p className="eyebrow">New arrival</p> : null}
            <h1>{p.name}</h1>
            <div className="pdp__sub">{WEAVES[p.weave].label} saree <span className="pdp__sku">· Code {p.sku}</span></div>
            {reviews.length ? <a className="pdp__rating" href="#reviews"><Stars rating={rating} /> {plural(reviews.length)}</a> : null}
            <span className={"price pdp__price" + (hasPrice(p) ? "" : " price--ask")}>{priceText(p)}</span>
            <p className="pdp__desc">{p.description}</p>
            {inCollections.length ? (
              <p className="pdp__collections">
                Part of {inCollections.map((c, i) => (
                  <span key={c.slug}>{i ? ", " : ""}<Link href={collectionUrl(c)}>{c.name}</Link></span>
                ))}
              </p>
            ) : null}
            {siblings.length > 1 ? (
              <div className="swatches">
                <div className="swatches__label">COLOUR: {p.colourName.toUpperCase()}</div>
                <div className="swatches__list">
                  {siblings.map((s) => (
                    <Link key={s.id} className={"swatch" + (s.id === p.id ? " is-active" : "")} href={productUrl(s)} style={{ background: s.c1 }} title={s.name} aria-label={s.name} />
                  ))}
                </div>
              </div>
            ) : null}
            <BuyBox p={p} pageUrl={pageUrl} />
            {p.soldOut ? null : <DeliveryCheck />}
            <ul className="assure">
              <li><LoomIcon /> Handcrafted by skilled weavers</li>
              <li><CheckIcon /> Quality checked before it ships</li>
              <li><ChatIcon /> Exchange help within 48 hours of delivery</li>
            </ul>
            <div className="pdp__tools"><ShareButton p={p} pageUrl={pageUrl} /><CompareButton p={p} variant="text" /></div>
            <table className="specs">
              <tbody>
                <tr><th>Fabric</th><td>{d.fabric === PRODUCT_DEFAULTS.fabric ? WEAVES[p.weave].label : d.fabric}</td></tr>
                <tr><th>Weave</th><td>{p.weaveType}</td></tr>
                <tr><th>Colour</th><td>{p.colourName}</td></tr>
                <tr><th>Occasion</th><td>{p.occasion}</td></tr>
                <tr><th>Length</th><td>{d.length}</td></tr>
                <tr><th>Care</th><td>{d.care}</td></tr>
              </tbody>
            </table>
            <div className="accordion">
              <details><summary>Details and care</summary><div>{d.details}</div></details>
              <details><summary>Shipping and delivery</summary><div>{d.shipping}</div></details>
              <details><summary>Exchange and returns</summary><div>{d.returns}</div></details>
            </div>
          </div>
        </div>
      </section>

      <section className="wrap reviews" aria-labelledby="reviews-title">
        <div className="reviews__head">
          <h2 id="reviews-title">Customer reviews</h2>
          <a className="btn btn--outline" href={waLink("Hello Varunavi Vastra, I would like to share a review of " + p.name + ":\n\nRating (1 to 5): \nReview: ")} target="_blank" rel="noopener">Write a review</a>
        </div>
        <div id="reviews">
          {reviews.length ? (
            <>
              <div className="reviews__summary"><Stars rating={rating} /> <strong>{rating.toFixed(1)}</strong> from {plural(reviews.length)}</div>
              {reviews.map((r, i) => (
                <blockquote className="review" key={i}>
                  <Stars rating={r.rating} />
                  <p>{r.text}</p>
                  <footer>
                    {r.name}{r.city ? ", " + r.city : ""}
                    {r.date ? <> · <time dateTime={r.date}>{formatDate(r.date)}</time></> : null}
                  </footer>
                </blockquote>
              ))}
            </>
          ) : <p className="hint">No reviews yet.</p>}
        </div>
      </section>

      <section className="section section--cream">
        <div className="wrap">
          <Heading title="You may also like" />
          <div className="grid">{related.map((x) => <ProductCard p={x} key={x.id} />)}</div>
        </div>
      </section>

      <RecentlyViewed id={p.id} />
      <TrustStrip />
    </>
  );
}
