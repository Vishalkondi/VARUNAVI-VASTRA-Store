"use client";

/* Small moving touches for the homepage banner: a rotating word, counting numbers and a scroll cue. */

import { useEffect, useRef, useState } from "react";

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
        {words.map((w, n) => <span key={w} className={n === i ? "is-on" : undefined}>{w}</span>)}
      </em>
    </>
  );
}

// Counts up from zero the first time the number scrolls into view.
export function CountUp({ value, decimals = 0, suffix = "" }: { value: number; decimals?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);
  useEffect(() => {
    const el = ref.current;
    if (!el || calm()) return;
    setShown(0);
    let frame = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / 1200);
        setShown(value * (1 - Math.pow(1 - p, 3)));
        if (p < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(frame); };
  }, [value]);
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
