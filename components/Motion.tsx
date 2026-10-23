"use client";

/* Shared Framer Motion settings, so every panel, pop-up and transition on the site moves the same way.
 * MotionProvider (in the root layout) switches movement off for visitors who ask their device for less motion. */

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

export const EASE = [0.22, 1, 0.36, 1] as const;              // quick start, soft landing
export const SPRING = { type: "spring", stiffness: 420, damping: 36 } as const; // panels and drawers
export const POP = { type: "spring", stiffness: 520, damping: 32 } as const;    // small things: toasts, trays

// A dimmed backdrop behind pop-ups and panels.
export const scrim = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.22 },
};

export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user" transition={{ duration: 0.3, ease: EASE }}>{children}</MotionConfig>;
}
