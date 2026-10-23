"use client";

/* "Quick view": a saree's key details in a pop-up, opened from its card without leaving the page. */

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { WEAVES, type Product } from "@/lib/data";
import { askPriceLink, hasPrice, priceText, productUrl } from "@/lib/utils";
import { IMAGE_SIZES, ProductImage } from "./Bits";
import { useAddToCart } from "./Forms";
import { CloseIcon, EyeIcon } from "./Icons";
import { scrim, SPRING } from "./Motion";
import WishButton from "./WishButton";

export default function QuickViewButton({ p }: { p: Product }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="card__qv" aria-label={"Quick view: " + p.name} onClick={() => setOpen(true)}>
        <EyeIcon />
      </button>
      <AnimatePresence>{open ? <QuickView p={p} onClose={() => setOpen(false)} /> : null}</AnimatePresence>
    </>
  );
}

function QuickView({ p, onClose }: { p: Product; onClose: () => void }) {
  const addToCart = useAddToCart();
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeBtn.current?.focus();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      opener?.focus(); // back to the card's button
    };
  }, [onClose]);

  return (
    <motion.div className="qv" exit={{ pointerEvents: "none" }}>
      <motion.div className="qv__scrim" onClick={onClose} {...scrim} />
      <motion.div
        className="qv__panel" role="dialog" aria-modal="true" aria-labelledby={"qv-" + p.id}
        initial={{ opacity: 0, y: 28, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98, transition: { duration: 0.18 } }}
        transition={SPRING}
      >
        <button type="button" className="icon-btn qv__close" aria-label="Close" onClick={onClose} ref={closeBtn}><CloseIcon /></button>
        <div className="qv__media media"><ProductImage p={p} eager sizes={IMAGE_SIZES.card} /></div>
        <div className="qv__info">
          <p className="eyebrow">{WEAVES[p.weave].label}</p>
          <h2 id={"qv-" + p.id}>{p.name}</h2>
          <span className={"price qv__price" + (hasPrice(p) ? "" : " price--ask")}>{p.soldOut ? "Sold out" : priceText(p)}</span>
          <p className="qv__desc">{p.description}</p>
          <dl className="qv__facts">
            <div><dt>Weave</dt><dd>{p.weaveType}</dd></div>
            <div><dt>Colour</dt><dd>{p.colourName}</dd></div>
            <div><dt>Occasion</dt><dd>{p.occasion}</dd></div>
          </dl>
          <div className="buy">
            {p.soldOut ? (
              <Link className="btn btn--pink" href={productUrl(p)}>See similar sarees</Link>
            ) : hasPrice(p) ? (
              <button className="btn btn--pink" type="button" onClick={() => { addToCart(p.id); onClose(); }}>Add to cart</button>
            ) : (
              <a className="btn btn--pink" href={askPriceLink(p)} target="_blank" rel="noopener">Ask price on WhatsApp</a>
            )}
            <WishButton id={p.id} className="wish-btn" label={"Save " + p.name + " to wishlist"} />
          </div>
          <Link className="link-btn" href={productUrl(p)}>View full details</Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
