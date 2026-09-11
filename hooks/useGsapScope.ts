"use client";

import { useEffect, useRef } from "react";
import { gsap, queueRefresh } from "@/lib/gsap";

type Setup<T extends HTMLElement> = (scope: T) => void;

/**
 * Runs a GSAP setup function once the scope element is mounted, inside a
 * `gsap.context` so every tween and ScrollTrigger created in it is reverted
 * on unmount. Animations are skipped when the user prefers reduced motion.
 */
export function useGsapScope<T extends HTMLElement = HTMLDivElement>(
  setup: Setup<T>,
) {
  const scopeRef = useRef<T | null>(null);
  const setupRef = useRef(setup);
  setupRef.current = setup;

  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => setupRef.current(scope), scope);

    // Coalesced, single refresh after this section lays out.
    queueRefresh();

    return () => ctx.revert();
  }, []);

  return scopeRef;
}

type RevealVars = {
  y?: number;
  opacity?: number;
  scaleY?: number;
  duration?: number;
  stagger?: number | gsap.StaggerVars;
  ease?: string;
  transformOrigin?: string;
  delay?: number;
};

type RevealOptions = {
  trigger: Element;
  start?: string;
  from: RevealVars;
};

/**
 * A scroll-in reveal that is hidden from the very first frame (no flicker) and
 * can never be stranded hidden (a `once`/`play` trigger plus ScrollTrigger's
 * own onRefresh reconciliation guarantee it lands in the visible state once
 * scrolled into view).
 *
 * Implementation notes:
 * - `gsap.set` applies the hidden state synchronously during the context run,
 *   before the browser paints, so the element never appears then jumps.
 * - We drive a `to` tween with the ScrollTrigger rather than `fromTo`, so the
 *   end state is always the element's natural CSS (no forced opacity:1 that
 *   would override a resting opacity like the dimmed logo wall).
 */
export function revealFrom(
  targets: gsap.TweenTarget,
  { trigger, start = "top 85%", from }: RevealOptions,
) {
  const {
    duration = 0.7,
    stagger,
    ease = "power2.out",
    delay = 0,
    transformOrigin,
    ...hidden
  } = from;

  if (transformOrigin) {
    gsap.set(targets, { transformOrigin });
  }
  // Hidden immediately, before first paint.
  gsap.set(targets, hidden);

  const to: gsap.TweenVars = {
    duration,
    ease,
    delay,
    overwrite: "auto",
    scrollTrigger: {
      trigger,
      start,
      toggleActions: "play none none none",
    },
  };

  if (hidden.y !== undefined) to.y = 0;
  if (hidden.opacity !== undefined) to.opacity = 1;
  if (hidden.scaleY !== undefined) to.scaleY = 1;
  if (stagger !== undefined) to.stagger = stagger;

  return gsap.to(targets, to);
}
