"use client";

/* Small moving touches for the homepage banner: a rotating word, counting numbers and a scroll cue. */

import { animate, AnimatePresence, motion, useInView } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { EASE } from "./Motion";

const calm = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Cycles through words in place of the last word of the heading. Screen readers hear only the first.
export function RotatingWord({ words }: { words: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (calm() || words.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % words.length), 2600);
    return () => clearInterval(t);
  }, [words.length]);
  return (
    <>
      <span className="sr-only">{words[0]}</span>
      <em className="hero__rotate" aria-hidden="true">
        {/* every word sits in the same grid cell, so the line keeps the width of the longest */}
        {words.map((w) => <span key={w} className="hero__rotate-size">{w}</span>)}
        <AnimatePresence initial={false}>
          <motion.span
            key={words[i]} className="is-on"
            initial={{ opacity: 0, y: "0.45em" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "-0.45em" }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            {words[i]}
          </motion.span>
        </AnimatePresence>
      </em>
    </>
  );
}

// Counts up from zero the first time the number scrolls into view.
export function CountUp({ value, decimals = 0, suffix = "" }: { value: number; decimals?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.4 });
  const [shown, setShown] = useState(value);
  useEffect(() => {
    if (calm()) return;
    if (!seen) { setShown(0); return; }
    const run = animate(0, value, { duration: 1.2, ease: EASE, onUpdate: setShown });
    return () => run.stop();
  }, [seen, value]);
  return <span ref={ref}>{shown.toFixed(decimals)}{suffix}</span>;
}

// "Scroll" cue that glides down to the next section.
export function ScrollCue({ target }: { target: string }) {
  return (
    <button
      type="button"
      className="hero__scroll"
      onClick={() => document.querySelector(target)?.scrollIntoView({ behavior: calm() ? "auto" : "smooth", block: "start" })}
    >
      <span>Scroll</span><i aria-hidden="true" />
    </button>
  );
}

// "Shop the look" pin on the photo: a pulsing dot that opens a small card on hover, focus or tap.
export function Hotspot({ x, y, label, title, href, children }: { x: number; y: number; label: string; title: string; href: string; children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={"hotspot" + (open ? " is-open" : "") + (x > 55 ? " hotspot--left" : "")} style={{ left: x + "%", top: y + "%" }} onMouseLeave={() => setOpen(false)}>
      <button type="button" className="hotspot__dot" aria-expanded={open} aria-label={"Shop the look: " + title} onClick={() => setOpen((o) => !o)} />
      <Link className="hotspot__card" href={href}>
        {children ? <span className="hotspot__img">{children}</span> : null}
        <span><small>{label}</small><strong>{title}</strong><em>Shop now →</em></span>
      </Link>
    </div>
  );
}

// Lets the banner photo drift a few pixels with the mouse, for a sense of depth. A spring keeps it smooth.
export function PhotoDrift() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const box = ref.current?.parentElement;
    const img = box?.querySelector<HTMLImageElement>(":scope > img");
    if (!box || !img || calm() || !window.matchMedia("(hover: hover)").matches) return;
    const spring = { type: "spring", stiffness: 90, damping: 18 } as const;
    const move = (e: PointerEvent) => {
      const r = box.getBoundingClientRect();
      const dx = (e.clientX - r.left) / r.width - 0.5, dy = (e.clientY - r.top) / r.height - 0.5;
      animate(img, { scale: 1.05, x: dx * -12, y: dy * -10 }, spring);
    };
    const leave = () => { animate(img, { scale: 1, x: 0, y: 0 }, spring); };
    box.addEventListener("pointermove", move);
    box.addEventListener("pointerleave", leave);
    return () => { box.removeEventListener("pointermove", move); box.removeEventListener("pointerleave", leave); };
  }, []);
  return <span ref={ref} hidden />;
}
