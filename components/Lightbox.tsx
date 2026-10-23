"use client";

/* Full-screen photo viewer. Swipe (or arrow keys) between photos; pinch, double-tap
 * or click to zoom, then drag to look around. Escape or ✕ closes it. */

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { CloseIcon } from "./Icons";
import { EASE } from "./Motion";

// The next photo slides in from the side you swiped towards.
const photo = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 80 }),
  show: { opacity: 1, x: 0 },
  leave: (dir: number) => ({ opacity: 0, x: dir * -80 }),
};

export type Slide = { src: string; alt: string; title: string; sub?: string; href?: string };

const MAX_ZOOM = 4;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export default function Lightbox({ slides, start, onClose }: { slides: Slide[]; start: number; onClose: () => void }) {
  const [index, setIndex] = useState(start);
  const [dir, setDir] = useState(1);
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 });
  const [swipe, setSwipe] = useState(0); // horizontal drag offset while swiping between photos
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ dist: number; scale: number; startX: number; startY: number; moved: boolean; lastTap: number }>({
    dist: 0, scale: 1, startX: 0, startY: 0, moved: false, lastTap: 0,
  });
  const closeRef = useRef<HTMLButtonElement>(null);
  const count = slides.length;

  const go = useCallback((step: number) => {
    setDir(step);
    setIndex((i) => (i + step + count) % count);
    setView({ scale: 1, x: 0, y: 0 });
  }, [count]);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prevOverflow; document.removeEventListener("keydown", onKey); };
  }, [go, onClose]);

  const toggleZoom = (clientX: number, clientY: number, el: HTMLElement) => {
    if (view.scale > 1) { setView({ scale: 1, x: 0, y: 0 }); return; }
    // Zoom in towards the tapped point.
    const r = el.getBoundingClientRect();
    const s = 2.5;
    setView({ scale: s, x: (r.width / 2 - (clientX - r.left)) * (s - 1), y: (r.height / 2 - (clientY - r.top)) * (s - 1) });
  };

  function onDown(e: ReactPointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      g.dist = Math.hypot(a.x - b.x, a.y - b.y);
      g.scale = view.scale;
    } else {
      g.startX = e.clientX; g.startY = e.clientY; g.moved = false;
    }
  }

  function onMove(e: ReactPointerEvent<HTMLDivElement>) {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (Math.abs(e.clientX - g.startX) + Math.abs(e.clientY - g.startY) > 6) g.moved = true;

    if (pointers.current.size === 2) {
      // Pinch to zoom
      const [a, b] = [...pointers.current.values()];
      const scale = clamp((g.scale * Math.hypot(a.x - b.x, a.y - b.y)) / (g.dist || 1), 1, MAX_ZOOM);
      setView((v) => (scale === 1 ? { scale: 1, x: 0, y: 0 } : { ...v, scale }));
    } else if (view.scale > 1) {
      // Drag to look around a zoomed photo
      setView((v) => ({ ...v, x: v.x + e.clientX - prev.x, y: v.y + e.clientY - prev.y }));
    } else if (count > 1) {
      setSwipe(e.clientX - g.startX);
    }
  }

  function onUp(e: ReactPointerEvent<HTMLDivElement>) {
    const wasPinch = pointers.current.size > 1;
    pointers.current.delete(e.pointerId);
    const g = gesture.current;
    if (wasPinch) return;
    if (Math.abs(swipe) > 60) go(swipe < 0 ? 1 : -1);
    setSwipe(0);
    if (!g.moved) {
      // Double-tap on phones, single click with a mouse: zoom in or out.
      const now = Date.now();
      if (e.pointerType === "mouse" || now - g.lastTap < 300) toggleZoom(e.clientX, e.clientY, e.currentTarget);
      g.lastTap = now;
    }
  }

  const slide = slides[index];
  return (
    <motion.div
      className="lightbox" role="dialog" aria-modal="true" aria-label={"Photo viewer: " + slide.title}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}
    >
      <div className="lightbox__top">
        <span className="lightbox__count">{index + 1} / {count}</span>
        <button ref={closeRef} type="button" className="lightbox__close" aria-label="Close photo viewer" onClick={onClose}><CloseIcon /></button>
      </div>

      <div
        className={"lightbox__stage" + (view.scale > 1 ? " is-zoomed" : "")}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
      >
        <AnimatePresence initial={false} custom={dir}>
          <motion.div
            key={slide.src} className="lightbox__slide" custom={dir} variants={photo}
            initial="enter" animate="show" exit="leave" transition={{ duration: 0.32, ease: EASE }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.src} alt={slide.alt} draggable={false}
              style={{
                transform: `translate(${view.x + swipe}px, ${view.y}px) scale(${view.scale})`,
                transition: pointers.current.size ? "none" : undefined,
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {count > 1 ? (
        <>
          <button type="button" className="lightbox__nav lightbox__nav--prev" aria-label="Previous photo" onClick={() => go(-1)}>‹</button>
          <button type="button" className="lightbox__nav lightbox__nav--next" aria-label="Next photo" onClick={() => go(1)}>›</button>
        </>
      ) : null}

      <div className="lightbox__caption">
        <div>
          <strong>{slide.title}</strong>
          {slide.sub ? <span>{slide.sub}</span> : null}
        </div>
        {slide.href ? <Link className="btn btn--white" href={slide.href} onClick={onClose}>View saree</Link> : null}
      </div>
      <p className="lightbox__hint">{count > 1 ? "Swipe for more · " : ""}Pinch or double-tap to zoom</p>
    </motion.div>
  );
}
