"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { PRODUCTS, SITE, WEAVES, type Product } from "@/lib/data";
import { read, write } from "@/lib/store";
import { askPriceLink, asset, byId, hasPrice, productUrl, rupees, waLink } from "@/lib/utils";
import { Heading, IMAGE_SIZES, ProductCard, ProductImage } from "./Bits";
import { useAddToCart } from "./Forms";
import { ExpandIcon } from "./Icons";
import Lightbox, { type Slide } from "./Lightbox";
import WishButton from "./WishButton";

// Photos for the full-screen viewer: this saree first, then others from the same collection.
function viewerSlides(p: Product): Slide[] {
  const others = PRODUCTS.filter((x) => x.id !== p.id && x.weave === p.weave && x.images.length);
  return [
    ...p.images.map((src, i) => ({ src: asset(src), alt: p.name + " saree, photo " + (i + 1), title: p.name, sub: WEAVES[p.weave].label })),
    ...others.map((x) => ({ src: asset(x.images[0]), alt: x.name + " saree", title: x.name, sub: "More from " + WEAVES[x.weave].label, href: productUrl(x) })),
  ];
}

export function Gallery({ p }: { p: Product }) {
  const [slot, setSlot] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [viewer, setViewer] = useState<number | null>(null);
  // Real photos only; without photos, four illustrated views of the saree.
  const slots = p.images.length || 4;
  const hasPhoto = !!p.images[slot];
  return (
    <div className={"gallery" + (slots === 1 ? " gallery--single" : "")}>
      {slots > 1 ? (
        <div className="gallery__thumbs">
          {Array.from({ length: slots }, (_, i) => (
            <button type="button" key={i} className={"gallery__thumb" + (i === slot ? " is-active" : "")} aria-label={"Show photo " + (i + 1)} onClick={() => setSlot(i)}>
              <ProductImage p={p} index={i} sizes={IMAGE_SIZES.thumb} />
            </button>
          ))}
        </div>
      ) : null}
      {/* Hover over a photo to look closely at the weave (on computers). */}
      <div
        className={"gallery__main media" + (zoom ? " is-zoomed" : "")}
        style={zoom ? ({ "--zx": zoom.x + "%", "--zy": zoom.y + "%" } as CSSProperties) : undefined}
        onMouseMove={(e) => {
          if (!hasPhoto || !window.matchMedia("(hover: hover)").matches) return;
          const r = e.currentTarget.getBoundingClientRect();
          setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
        }}
        onMouseLeave={() => setZoom(null)}
        onClick={() => { if (hasPhoto) { setZoom(null); setViewer(slot); } }}
      >
        <ProductImage p={p} index={slot} eager sizes={IMAGE_SIZES.zoom} />
        {hasPhoto ? <span className="gallery__expand" aria-hidden="true"><ExpandIcon /> Tap to view full screen</span> : null}
      </div>
      {hasPhoto ? <button type="button" className="sr-only" onClick={() => setViewer(slot)}>Open photo full screen</button> : null}
      {viewer !== null ? <Lightbox slides={viewerSlides(p)} start={viewer} onClose={() => setViewer(null)} /> : null}
    </div>
  );
}

export function BuyBox({ p, pageUrl }: { p: Product; pageUrl: string }) {
  const addToCart = useAddToCart();
  const [qty, setQty] = useState(1);
  const [fp, setFp] = useState(false);
  const clamp = (n: number) => Math.max(1, Math.min(20, n || 1));
  // On phones, once the main buttons scroll out of view, a bar with "Add to cart" stays at the bottom.
  const buyRef = useRef<HTMLDivElement>(null);
  const [barOn, setBarOn] = useState(false);
  useEffect(() => {
    const el = buyRef.current;
    if (!el) return;
    const check = () => setBarOn(el.getBoundingClientRect().bottom < 0);
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, []);

  if (p.soldOut) {
    return (
      <>
        <p className="sold-out-note">This saree is sold out. Message us and we will tell you when it is back, or suggest something similar.</p>
        <div className="buy">
          <a className="btn btn--pink" href={waLink("Hello Varunavi Vastra, please let me know when " + p.name + " is back in stock.\n" + pageUrl)} target="_blank" rel="noopener">Notify me on WhatsApp</a>
          <WishButton id={p.id} className="wish-btn" label="Save to wishlist" />
        </div>
      </>
    );
  }

  // No price yet: customers ask for the price on WhatsApp instead of adding to cart.
  if (!hasPrice(p)) {
    return (
      <>
        <div className="buy" ref={buyRef}>
          <a className="btn btn--pink" href={askPriceLink(p)} target="_blank" rel="noopener">Ask price on WhatsApp</a>
          <WishButton id={p.id} className="wish-btn" label="Save to wishlist" />
        </div>
        <p className="hint">Message us and we will reply with the price, availability and delivery time.</p>
        <div className={"buy-bar" + (barOn ? " is-on" : "")} aria-hidden={!barOn}>
          <div className="buy-bar__text"><strong>{p.name}</strong><span>Ask for price</span></div>
          <a className="btn btn--pink" href={askPriceLink(p)} target="_blank" rel="noopener" tabIndex={barOn ? 0 : -1}>Ask price</a>
        </div>
      </>
    );
  }

  const waText = "Hello Varunavi Vastra, I would like to order or ask about:\n" + p.name + " (" + rupees(p.price) + ")\n" + pageUrl;
  return (
    <>
      {SITE.fallPicotPrice > 0 ? (
        <label className="addon">
          <input type="checkbox" checked={fp} onChange={(e) => setFp(e.target.checked)} />
          <span>
            <strong>Add fall and picot</strong> (+ {rupees(SITE.fallPicotPrice)})
            <small>We stitch the fall and finish the edges so your saree is ready to wear. Adds 2 to 3 days. Not eligible for return.</small>
          </span>
        </label>
      ) : null}
      <div className="buy" ref={buyRef}>
        <div className="qty">
          <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => clamp(q - 1))}>−</button>
          <input type="number" min={1} max={20} value={qty} aria-label="Quantity" onChange={(e) => setQty(clamp(parseInt(e.target.value, 10)))} />
          <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => clamp(q + 1))}>+</button>
        </div>
        <button className="btn btn--pink" type="button" onClick={() => addToCart(p.id, qty, fp)}>Add to cart</button>
        <WishButton id={p.id} className="wish-btn" label="Save to wishlist" />
      </div>
      <a className="btn btn--whatsapp btn--block" href={waLink(waText)} target="_blank" rel="noopener">Order or ask a question on WhatsApp</a>
      <div className={"buy-bar" + (barOn ? " is-on" : "")} aria-hidden={!barOn}>
        <div className="buy-bar__text"><strong>{p.name}</strong><span>{rupees(p.price + (fp ? SITE.fallPicotPrice : 0))}{qty > 1 ? " × " + qty : ""}</span></div>
        <button className="btn btn--pink" type="button" tabIndex={barOn ? 0 : -1} onClick={() => addToCart(p.id, qty, fp)}>Add to cart</button>
      </div>
    </>
  );
}

export function ShareButton({ p, pageUrl }: { p: Product; pageUrl: string }) {
  async function share() {
    const data = { title: p.name + " · " + SITE.name, text: p.name + " handcrafted cotton saree" + (hasPrice(p) ? ", " + rupees(p.price) : ""), url: pageUrl };
    if (navigator.share) {
      try { await navigator.share(data); } catch { /* cancelled */ }
    } else {
      window.open("https://wa.me/?text=" + encodeURIComponent(data.text + "\n" + data.url), "_blank", "noopener");
    }
  }
  return <button className="link-btn share-btn" type="button" onClick={share}>Share this saree</button>;
}

// Shows sarees viewed before this one, then records this visit.
export function RecentlyViewed({ id }: { id: string }) {
  const [recent, setRecent] = useState<string[]>([]);
  useEffect(() => {
    const prev = read<string[]>("vv_recent", []).filter((x) => x !== id && byId(x));
    write("vv_recent", [id, ...prev].slice(0, 8));
    setRecent(prev.slice(0, 4));
  }, [id]);
  if (!recent.length) return null;
  return (
    <section className="section">
      <div className="wrap">
        <Heading title="Recently viewed" />
        <div className="grid">{recent.map((x) => <ProductCard p={byId(x)!} key={x} />)}</div>
      </div>
    </section>
  );
}
