"use client";

import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Smooth in-page anchor navigation, driven by GSAP instead of CSS
 * `scroll-behavior: smooth` (which conflicts with ScrollTrigger scrubbing).
 * Accounts for the fixed header height so sections aren't hidden underneath.
 */
export function SmoothAnchors() {
  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!anchor) return;

      const hash = anchor.getAttribute("href");
      if (!hash || hash === "#") return;
      // #apply is intercepted by ApplyProvider to open the form modal.
      if (hash === "#apply") return;

      const dest = document.querySelector<HTMLElement>(hash);
      if (!dest) return;

      event.preventDefault();

      if (reduced) {
        dest.scrollIntoView();
        return;
      }

      gsap.to(window, {
        duration: 0.9,
        ease: "power3.inOut",
        scrollTo: { y: dest, offsetY: 64, autoKill: true },
        onComplete: () => ScrollTrigger.refresh(),
      });
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
