/* Small presentational pieces shared across pages (server-safe). */

import Link from "next/link";
import { Fragment, type CSSProperties, type ReactNode } from "react";
import { POSTS, SITE, WEAVES, type Post, type Product } from "@/lib/data";
import PHOTOS from "@/lib/photos.json";
import { askPriceLink, asset, avgRating, formatDate, hasPrice, postUrl, priceText, productUrl } from "@/lib/utils";
import { ChatIcon, CheckIcon, LeafIcon, LoomIcon, LotusIcon } from "./Icons";
import SareeArt, { artKind, type ArtKind } from "./SareeArt";
import { QuickAdd } from "./Forms";
import QuickViewButton from "./QuickView";
import WishButton from "./WishButton";

export function Placeholder({ c1, c2, label }: { c1: string; c2: string; label?: string }) {
  return (
    <div className="ph" style={{ "--c1": c1, "--c2": c2 } as CSSProperties}>
      {label ? <span className="ph__label">{label}</span> : null}
    </div>
  );
}

// How wide a product image shows on screen, so the browser picks the right file size.
export const IMAGE_SIZES = {
  card: "(max-width: 820px) 50vw, 300px",
  large: "(max-width: 820px) 100vw, 600px",
  thumb: "120px",
  zoom: "(max-width: 820px) 100vw, 1200px", // product page photo: full size so hover-zoom stays sharp
};

// A product photo, or an illustration of the saree until photos are added.
// Gallery slots without a photo show different close-ups (pallu, border, weave).
// Photos made by scripts/optimize-photos.mjs also have a small version for cards (see lib/photos.json).
export function ProductImage({ p, index = 0, eager = false, sizes = IMAGE_SIZES.card }: { p: Product; index?: number; eager?: boolean; sizes?: string }) {
  const src = p.images[index];
  if (src) {
    const small = (PHOTOS as Record<string, string>)[src];
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={asset(src)} alt={p.name + " saree"} width={1200} height={1600} decoding="async"
        srcSet={small ? `${asset(small)} 600w, ${asset(src)} 1200w` : undefined} sizes={small ? sizes : undefined}
        loading={eager ? undefined : "lazy"} fetchPriority={eager ? "high" : undefined}
      />
    );
  }
  return <SareeArt c1={p.c1} c2={p.c2} kind={artKind(p.weaveType)} view={index} title={index === 0 ? p.name + " saree" : undefined} />;
}

// A site photo (see lib/site-photos.ts) with a small version for phones.
export function SitePhotoImg({ photo, alt, sizes = IMAGE_SIZES.large, eager }: { photo: { src: string; small: string }; alt: string; sizes?: string; eager?: boolean }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={photo.src} srcSet={`${photo.small} 600w, ${photo.src} 1200w`} sizes={sizes} alt={alt} width={1200} height={1600} loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : undefined} decoding="async" />;
}

export function Logo() {
  // eslint-disable-next-line @next/next/no-img-element
  if (SITE.logoImage) return <img src={asset(SITE.logoImage)} alt={SITE.name} />;
  return <><LotusIcon /><span className="logo__word">varunavi</span></>;
}

export function Badge({ p }: { p: Product }) {
  if (p.soldOut) return <span className="badge badge--muted">SOLD OUT</span>;
  if (p.isNew) return <span className="badge">NEW</span>;
  if (p.bestseller) return <span className="badge">BESTSELLER</span>;
  return null;
}

export function Stars({ rating }: { rating: number }) {
  const r = Math.round(rating);
  return (
    <span className="stars" aria-label={rating.toFixed(1) + " out of 5 stars"}>
      {"★★★★★".slice(0, r)}<span className="stars__off">{"★★★★★".slice(r)}</span>
    </span>
  );
}

export function ProductCard({ p }: { p: Product }) {
  const reviews = p.reviews || [];
  return (
    <article className="card">
      <div className="card__top">
        <Link className="card__media media" href={productUrl(p)} aria-label={p.name}>
          <Badge p={p} /><ProductImage p={p} />
        </Link>
        {p.soldOut ? null : hasPrice(p) ? <QuickAdd id={p.id} /> : (
          <a className="card__quick" href={askPriceLink(p)} target="_blank" rel="noopener">Ask price on WhatsApp</a>
        )}
      </div>
      <WishButton id={p.id} className="card__wish" label={"Save " + p.name + " to wishlist"} />
      <QuickViewButton p={p} />
      <div className="card__body">
        <h3 className="card__name"><Link href={productUrl(p)}>{p.name}</Link></h3>
        <div className="card__sub">{WEAVES[p.weave].label}</div>
        {reviews.length ? <div className="card__rating"><Stars rating={avgRating(p)} /> <span>({reviews.length})</span></div> : null}
        <div className={"price" + (hasPrice(p) ? "" : " price--ask")}>{priceText(p)}</div>
      </div>
    </article>
  );
}

const POST_KINDS: ArtKind[] = ["plain", "ikat", "stripes", "butti", "checks"];

// Illustration for a journal post without a photo.
export function PostArt({ post }: { post: Post }) {
  return <SareeArt c1={post.c1} c2={post.c2} kind={POST_KINDS[Math.max(0, POSTS.indexOf(post)) % POST_KINDS.length]} view={1} />;
}

export function PostCard({ post }: { post: Post }) {
  const href = postUrl(post.id);
  return (
    <article className="post-card">
      <Link className="media post-card__media" href={href}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {post.image ? <img src={asset(post.image)} alt="" loading="lazy" /> : <PostArt post={post} />}
      </Link>
      <time dateTime={post.date}>{formatDate(post.date)}</time>
      <h3><Link href={href}>{post.title}</Link></h3>
      <p>{post.excerpt}</p>
      <Link className="link-btn" href={href}>Read more</Link>
    </article>
  );
}

const TRUST = [
  { Icon: LoomIcon, title: "Handcrafted", text: "Made by skilled hands" },
  { Icon: LeafIcon, title: "Pure cotton", text: "Soft, breathable, honest" },
  { Icon: CheckIcon, title: "Quality checked", text: "Every saree, before it ships" },
  { Icon: ChatIcon, title: "WhatsApp support", text: "Talk to a real person" },
];

export function TrustStrip() {
  return (
    <section className="trust" aria-label="Why shop with us">
      <div className="wrap">
        <ul className="trust__list">
          {TRUST.map(({ Icon, title, text }) => (
            <li className="trust__item" key={title}>
              <span className="trust__icon"><Icon /></span>
              <div><strong>{title}</strong><span>{text}</span></div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Heading({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="heading">
      <h2>{title}</h2>
      <div className="divider"><span /></div>
      {sub ? <p>{sub}</p> : null}
    </div>
  );
}

// Breadcrumbs: pass [label, href] pairs; the last item is the current page.
export function Crumbs({ items }: { items: (string | [string, string])[] }) {
  return (
    <div className="crumbs">
      <div className="wrap">
        <Link href="/">Home</Link>
        {items.map((item, i) => (
          <Fragment key={i}>
            <span>/</span>
            {typeof item === "string" ? item : <Link href={item[1]}>{item[0]}</Link>}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export function PageHead({ title, sub }: { title: string; sub?: ReactNode }) {
  return (
    <section className="page-head">
      <div className="wrap"><h1>{title}</h1>{sub ? <p>{sub}</p> : null}</div>
    </section>
  );
}

// Policy pages share the same layout.
export function PolicyPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <Crumbs items={[title]} />
      <PageHead title={title} />
      <section className="section">
        <div className="wrap narrow prose">
          <p className="todo">Draft for review. Please check every detail in [brackets] before the site goes live.</p>
          {children}
        </div>
      </section>
    </>
  );
}
