"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

const ToastContext = createContext<(content: ReactNode) => void>(() => {});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<ReactNode>(null);
  const [on, setOn] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const toast = useCallback((c: ReactNode) => {
    setContent(c);
    setOn(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOn(false), 3200);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className={"toast" + (on ? " is-on" : "")} role="status">{content}</div>
    </ToastContext.Provider>
  );
}
