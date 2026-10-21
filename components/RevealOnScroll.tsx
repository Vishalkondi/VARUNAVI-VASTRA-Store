"use client";

/* Gently fades sections and cards in as they scroll into view. Content is always
 * visible without JavaScript or for visitors who prefer reduced motion. */

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

const TARGETS = ".heading, .card, .tile, .occasion, .post-card, .spotlight > *, .split__text, .values > div, .founder, .trust__item, .band .wrap, .journey li, .weave-card, .story-intro > *, .story-visit";

function Reveal() {
  const path = usePathname();
  const query = useSearchParams().toString();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    document.documentElement.classList.add("reveal-on");
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
    }, { rootMargin: "0px 0px -8% 0px" });

    // Watch every target on the page, including ones added later (filters, "Load more").
    const watch = () => {
      document.querySelectorAll<HTMLElement>(TARGETS).forEach((el) => {
        if (el.dataset.reveal) return;
        el.dataset.reveal = "1";
        // Items in a row appear one after another.
        const i = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
        el.style.transitionDelay = Math.min(i % 4, 3) * 70 + "ms";
        io.observe(el);
      });
    };
    watch();
    const mo = new MutationObserver(watch);
    mo.observe(document.getElementById("main") || document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, [path, query]);

  return null;
}

export default function RevealOnScroll() {
  return <Suspense fallback={null}><Reveal /></Suspense>;
}
