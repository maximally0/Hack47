"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { gsap, queueRefresh } from "@/lib/gsap";

type CollapsibleProps = {
  /** The main label describing what expands, e.g. "the 30-day rhythm". */
  label: ReactNode;
  /** Secondary meta / count, e.g. "8 entries" or "5 cities". */
  meta?: ReactNode;
  /** Whether the panel starts open. Defaults to collapsed. */
  defaultOpen?: boolean;
  children: ReactNode;
  /** Extra classes on the toggle button (colour/border context per section). */
  buttonClassName?: string;
  /** Extra classes on the outer wrapper. */
  className?: string;
};

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * An accessible, animated show/hide region shared across the site.
 *
 * - The trigger is a real `<button>` (keyboard-operable for free) carrying
 *   `aria-expanded` and `aria-controls`; the panel carries the matching `id`.
 * - When collapsed the panel is removed from the accessibility tree and layout
 *   via the `hidden` attribute (display:none), not merely clipped — so screen
 *   readers and tab order skip it.
 * - Open/close is a height tween. Under `prefers-reduced-motion: reduce` the
 *   tween is skipped and the state flips instantly.
 * - Collapsing changes page height, which invalidates every ScrollTrigger
 *   below it. We call the coalesced `queueRefresh()` once the toggle settles so
 *   downstream reveals/scrubs recompute their start/end and never strand a
 *   section at opacity:0.
 */
export function Collapsible({
  label,
  meta,
  defaultOpen = false,
  children,
  buttonClassName = "",
  className = "",
}: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);
  // `rendered` controls the `hidden` attribute. It trails `open` on close so
  // the collapse animation can play before the panel leaves layout.
  const [rendered, setRendered] = useState(defaultOpen);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const rawId = useId();
  const panelId = `collapsible-${rawId.replace(/[:]/g, "")}`;

  const toggle = () => {
    const panel = panelRef.current;
    const next = !open;
    setOpen(next);

    if (!panel || prefersReducedMotion()) {
      // Instant flip: no tween, just show/hide and re-measure triggers.
      setRendered(next);
      queueRefresh();
      return;
    }

    gsap.killTweensOf(panel);

    if (next) {
      // OPENING: reveal, measure natural height, animate 0 -> auto.
      setRendered(true);
      gsap.set(panel, { height: "auto", overflow: "hidden" });
      const target = panel.offsetHeight;
      gsap.fromTo(
        panel,
        { height: 0 },
        {
          height: target,
          duration: 0.42,
          ease: "power2.out",
          onComplete: () => {
            // Release the fixed height so nested content can reflow freely.
            gsap.set(panel, { height: "auto", clearProps: "height,overflow" });
            queueRefresh();
          },
        },
      );
    } else {
      // CLOSING: animate current height -> 0, then drop from layout.
      gsap.set(panel, { height: panel.offsetHeight, overflow: "hidden" });
      gsap.to(panel, {
        height: 0,
        duration: 0.36,
        ease: "power2.inOut",
        onComplete: () => {
          setRendered(false);
          gsap.set(panel, { clearProps: "height,overflow" });
          queueRefresh();
        },
      });
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={panelId}
        className={`lbl flex min-h-[44px] w-full items-center justify-between gap-4 py-3 text-left ${buttonClassName}`}
      >
        <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span>{label}</span>
          {meta != null && (
            <span className="opacity-60" aria-hidden>
              — {meta}
            </span>
          )}
        </span>
        <span
          aria-hidden
          className="collapsible-chevron shrink-0 text-[1.1em] leading-none transition-transform duration-300"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ↓
        </span>
      </button>

      <div id={panelId} ref={panelRef} hidden={!rendered}>
        {children}
      </div>
    </div>
  );
}
