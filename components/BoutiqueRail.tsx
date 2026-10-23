"use client";

/* "On the rail": sarees hang side-on along a curved rod, like a boutique rail.
 * The saree you point at (or tap) turns to face you; click it to lift it off the
 * rail into a full view where it can go straight into the cart. */

import Link from "next/link";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion, useScroll } from "framer-motion";
import { WEAVES, type Product } from "@/lib/data";
import { askPriceLink, hasPrice, priceText, productUrl, rupees } from "@/lib/utils";
import { IMAGE_SIZES, ProductImage } from "./Bits";
import { useAddToCart } from "./Forms";
import { CloseIcon } from "./Icons";
import WishButton from "./WishButton";

const SAG = 34; // how far the middle of the rod dips, in px (matches the drawn curve)
const SIZES = { wide: { open: 200, side: 76, h: 270 }, small: { open: 150, side: 56, h: 214 } };
const spring = { type: "spring", stiffness: 260, damping: 26 } as const;

// The swing tag shows the price, or the saree's code while its price is on request.
const tagText = (p: Product) => (p.soldOut ? "Sold" : hasPrice(p) ? rupees(p.price) : p.sku);

export default function BoutiqueRail({ items }: { items: Product[] }) {
  const [active, setActive] = useState<number | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [small, setSmall] = useState(false);
  const [touch, setTouch] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const pointer = useRef("mouse");
  const drag = useRef({ x: 0, left: 0, down: false, moved: false });
  const { scrollXProgress } = useScroll({ container: track });
  const size = small ? SIZES.small : SIZES.wide;

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 820px)");
    const update = () => { setSmall(mq.matches); setTouch(window.matchMedia("(hover: none)").matches); };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Each saree hangs at the height of the rod where it sits, so the row follows the curve as it scrolls.
  useEffect(() => {
    const s = stage.current, t = track.current;
    if (!s || !t) return;
    let frame = 0, running = false;
    const tick = () => {
      const box = s.getBoundingClientRect();
      for (const li of Array.from(t.children) as HTMLElement[]) {
        const r = li.getBoundingClientRect();
        const u = (r.left + r.width / 2 - box.left) / box.width * 2 - 1;
        li.style.setProperty("--sag", (SAG * (1 - Math.min(1, u * u))).toFixed(1) + "px");
      }
      if (running) frame = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      running = e.isIntersecting;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(tick);
    });
    io.observe(s);
    return () => { running = false; io.disconnect(); cancelAnimationFrame(frame); };
  }, []);

  // Click and drag the rail with a mouse, the way you would slide hangers along.
  const onDown = (e: ReactPointerEvent) => {
    pointer.current = e.pointerType;
    if (e.pointerType !== "mouse" || !track.current) return;
    drag.current = { x: e.clientX, left: track.current.scrollLeft, down: true, moved: false };
  };
  const onMove = (e: ReactPointerEvent) => {
    const d = drag.current, t = track.current;
    if (!d.down || !t) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 5) { d.moved = true; t.setPointerCapture(e.pointerId); t.classList.add("is-dragging"); }
    if (d.moved) t.scrollLeft = d.left - dx;
  };
  const onUp = () => { drag.current.down = false; track.current?.classList.remove("is-dragging"); };

  const pick = (i: number) => {
    if (drag.current.moved) return;
    // On touch screens the first tap turns the saree round, the second lifts it off.
    if (pointer.current !== "mouse" && active !== i) { setActive(i); return; }
    setActive(i);
    setOpen(i);
  };

  const step = (dir: number) => {
    if (open === null) return;
    const n = (open + dir + items.length) % items.length;
    setOpen(n);
    setActive(n);
    (track.current?.children[n] as HTMLElement | undefined)?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  };

  const shown = active !== null ? items[active] : null;

  return (
    <section className="rail" aria-labelledby="rail-title">
      <div className="rail__head wrap">
        <p className="rail__kicker"><span>On the rail</span><span>Handwoven cotton</span></p>
        <h2 id="rail-title">Pick one <em>off the rail.</em></h2>
      </div>

      <div className="rail__stage" ref={stage}>
        <svg className="rail__rod" viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true">
          <path d={`M0 10 Q500 ${10 + 2 * SAG} 1000 10`} className="rail__rod-body" vectorEffect="non-scaling-stroke" />
          <path d={`M0 8.6 Q500 ${8.6 + 2 * SAG} 1000 8.6`} className="rail__rod-shine" vectorEffect="non-scaling-stroke" />
        </svg>

        <ul
          className="rail__track" ref={track} aria-label="Sarees on the rail"
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
          onMouseLeave={() => { onUp(); if (open === null) setActive(null); }}
          onClickCapture={(e) => { if (drag.current.moved) { e.preventDefault(); e.stopPropagation(); setTimeout(() => { drag.current.moved = false; }); } }}
        >
          {items.map((p, i) => {
            const facing = active === i;
            const turn = active === null ? -72 : i < active ? 72 : i > active ? -72 : 0;
            return (
              <motion.li
                key={p.id} className={"rail__slot" + (facing ? " is-facing" : "")}
                initial={false} animate={{ width: facing ? size.open : size.side }} transition={spring}
                style={{ height: size.h + 70 }}
              >
                <motion.div
                  className="rail__piece" style={{ originY: 0 }}
                  animate={facing ? { rotate: 0, y: -4 } : { rotate: [0, 1.4, 0, -1.4, 0], y: 0 }}
                  transition={facing ? spring : { duration: 4.6 + (i % 4) * 0.7, repeat: Infinity, ease: "easeInOut", delay: (i % 5) * 0.3 }}
                >
                  <svg className="rail__hook" viewBox="0 0 24 34" aria-hidden="true">
                    <path d="M12 33 V16 C12 12 18 11 18 6 C18 2.5 15 1 12 1 C9 1 7 3 7 5.5" />
                  </svg>
                  <span className="rail__tag" aria-hidden="true">{tagText(p)}</span>
                  <motion.button
                    type="button" className="rail__garment"
                    style={{ width: size.open - 20, height: size.h }}
                    initial={false} animate={{ rotateY: turn }} transition={spring}
                    onPointerEnter={(e) => { if (e.pointerType === "mouse" && !drag.current.down) setActive(i); }}
                    onFocus={(e) => { if (e.currentTarget.matches(":focus-visible")) setActive(i); }}
                    onClick={() => pick(i)}
                    aria-label={`${p.name}, ${p.soldOut ? "sold out" : priceText(p)}. Look closer`}
                  >
                    <span className="rail__bar" />
                    {open === i ? <span className="rail__fabric rail__fabric--lifted" /> : (
                      <motion.span layoutId={"rail-" + p.id} className="rail__fabric">
                        <ProductImage p={p} sizes="200px" />
                      </motion.span>
                    )}
                  </motion.button>
                </motion.div>
              </motion.li>
            );
          })}
        </ul>
      </div>

      <div className="rail__foot wrap">
        <div className="rail__now" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            {shown ? (
              <motion.div key={shown.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                <strong>{shown.name}</strong>
                <span>{shown.soldOut ? "Sold out" : priceText(shown)}</span>
              </motion.div>
            ) : (
              <motion.p key="hint" className="rail__hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                {touch ? "Tap a saree to turn it, tap again to look closer" : "Hover a saree · click to look closer"}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        <div className="rail__progress" aria-hidden="true"><motion.i style={{ scaleX: scrollXProgress, originX: 0 }} /></div>
        <div className="rail__nav">
          <button type="button" aria-label="Slide the rail left" onClick={() => track.current?.scrollBy({ left: -track.current.clientWidth * 0.6, behavior: "smooth" })}>←</button>
          <button type="button" aria-label="Slide the rail right" onClick={() => track.current?.scrollBy({ left: track.current.clientWidth * 0.6, behavior: "smooth" })}>→</button>
          <Link className="rail__all" href="/shop">Shop all sarees <span aria-hidden="true">→</span></Link>
        </div>
      </div>

      <AnimatePresence>
        {open !== null ? <RailView key="view" p={items[open]} index={open} total={items.length} onClose={() => setOpen(null)} onStep={step} /> : null}
      </AnimatePresence>
    </section>
  );
}

// The saree lifted off the rail: a full view with its details and "Add to cart".
function RailView({ p, index, total, onClose, onStep }: { p: Product; index: number; total: number; onClose: () => void; onStep: (dir: number) => void }) {
  const addToCart = useAddToCart();
  const closeBtn = useRef<HTMLButtonElement>(null);
  const keys = useRef({ onClose, onStep });
  keys.current = { onClose, onStep };

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeBtn.current?.focus();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") keys.current.onClose();
      if (e.key === "ArrowRight") keys.current.onStep(1);
      if (e.key === "ArrowLeft") keys.current.onStep(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      opener?.focus({ preventScroll: true });
    };
  }, []);

  return (
    <motion.div className="rail-view" role="dialog" aria-modal="true" aria-labelledby="rail-view-title" initial={{ opacity: 1 }} exit={{ opacity: 1 }}>
      <motion.div className="rail-view__scrim" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} />
      <button type="button" className="rail-view__close" aria-label="Put it back on the rail" onClick={onClose} ref={closeBtn}><CloseIcon /></button>
      <div className="rail-view__body">
        <motion.div layoutId={"rail-" + p.id} className="rail-view__media" transition={{ type: "spring", stiffness: 200, damping: 28 }}>
          <ProductImage p={p} eager sizes={IMAGE_SIZES.large} />
        </motion.div>
        <motion.div
          key={p.id} className="rail-view__info"
          initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0, transition: { delay: 0.15, duration: 0.35 } }} exit={{ opacity: 0, x: 16, transition: { duration: 0.15 } }}
        >
          <p className="eyebrow">{WEAVES[p.weave].label} · {index + 1} of {total}</p>
          <h2 id="rail-view-title">{p.name}</h2>
          <span className={"price rail-view__price" + (hasPrice(p) ? "" : " price--ask")}>{p.soldOut ? "Sold out" : priceText(p)}</span>
          <p className="rail-view__desc">{p.description}</p>
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
          <div className="rail-view__links">
            <Link className="link-btn" href={productUrl(p)}>View full details</Link>
            <span>
              <button type="button" aria-label="Previous saree" onClick={() => onStep(-1)}>←</button>
              <button type="button" aria-label="Next saree" onClick={() => onStep(1)}>→</button>
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
