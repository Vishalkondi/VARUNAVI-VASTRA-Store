"use client";

import { AnimatePresence, motion } from "framer-motion";
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { POP } from "./Motion";

const ToastContext = createContext<(content: ReactNode) => void>(() => {});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ id: number; content: ReactNode } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback((content: ReactNode) => {
    setToast({ id: Date.now(), content });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {/* The live region stays on the page so screen readers hear each new message. */}
      <div role="status">
        <AnimatePresence mode="wait">
          {toast ? (
            <motion.div
              key={toast.id} className="toast"
              initial={{ opacity: 0, x: "-50%", y: 24, scale: 0.96 }}
              animate={{ opacity: 1, x: "-50%", y: 0, scale: 1 }}
              exit={{ opacity: 0, x: "-50%", y: 12, transition: { duration: 0.15 } }}
              transition={POP}
            >
              {toast.content}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
