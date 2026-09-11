"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ApplyForm } from "@/components/ApplyForm";

type ApplyContextValue = { open: () => void; close: () => void };

const ApplyContext = createContext<ApplyContextValue | null>(null);

export function useApply() {
  const ctx = useContext(ApplyContext);
  if (!ctx) throw new Error("useApply must be used within <ApplyProvider>");
  return ctx;
}

export function ApplyProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const value = useMemo<ApplyContextValue>(
    () => ({ open: () => setOpen(true), close: () => setOpen(false) }),
    [],
  );

  // Any link pointing at #apply opens the form instead of jumping. This keeps
  // all existing "apply" CTAs working without touching each one.
  const openForm = useCallback(() => setOpen(true), []);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest<HTMLAnchorElement>('a[href="#apply"]');
      if (!anchor) return;
      e.preventDefault();
      openForm();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [openForm]);

  return (
    <ApplyContext.Provider value={value}>
      {children}
      {open && <ApplyForm onClose={() => setOpen(false)} />}
    </ApplyContext.Provider>
  );
}
