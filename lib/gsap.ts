"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

let registered = false;
let refreshQueued = false;

if (typeof window !== "undefined" && !registered) {
  registered = true;
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  // One global configuration. `ignoreMobileResize` stops the iOS/Android
  // address-bar show/hide from firing a refresh mid-scroll (a classic source
  // of "jumpy" scroll animations).
  ScrollTrigger.config({ ignoreMobileResize: true });

  // The layout height changes as web fonts (Archivo / DM Mono) swap in and as
  // lazy images decode. Each of those shifts every trigger's start/end. We
  // coalesce all of those into a single refresh once the document is fully
  // settled instead of refreshing repeatedly (repeated refreshes are what
  // make reveals re-fire and stutter).
  const refresh = () => ScrollTrigger.refresh();

  window.addEventListener("load", refresh);
  document.fonts?.ready.then(refresh);
}

/**
 * Ask for a single ScrollTrigger refresh on the next frame, collapsing many
 * callers in the same tick into one measurement pass.
 */
export function queueRefresh() {
  if (refreshQueued) return;
  refreshQueued = true;
  requestAnimationFrame(() => {
    refreshQueued = false;
    ScrollTrigger.refresh();
  });
}

export { gsap, ScrollTrigger, ScrollToPlugin };
