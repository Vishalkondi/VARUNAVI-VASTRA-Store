"use client";

/* Page transition: each new page fades in. The first page a visitor lands on shows straight away,
 * so the pre-rendered HTML is never hidden while the site's code loads. */

import { motion } from "framer-motion";
import { useEffect, type ReactNode } from "react";
import { EASE } from "@/components/Motion";

let firstPage = true;

export default function Template({ children }: { children: ReactNode }) {
  const animate = !firstPage;
  useEffect(() => { firstPage = false; }, []);
  // Opacity only: a transform here would trap the pop-ups and sticky bars inside the page.
  return (
    <motion.div initial={animate ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ duration: 0.35, ease: EASE }}>
      {children}
    </motion.div>
  );
}
