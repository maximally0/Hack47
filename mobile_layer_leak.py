"""Layer-leak gate: detect a full-viewport overlay that is invisible to hit-testing.

WHY THIS EXISTS
---------------
An overlay with `pointer-events: none` (the hero's fixed media layer is one) is
completely invisible to `document.elementFromPoint`, because hit-testing skips it.
An earlier occlusion sweep based on elementFromPoint reported the footer as fine
while the hero photo was in fact painting over 57.7% of the viewport and hiding the
footer's links outright. Pixel comparison is the only reliable detector.

WHAT IT CHECKS
--------------
Scroll to several positions past the hero. Screenshot. Then neutralise every
full-viewport fixed/absolute media layer (opacity 0). Screenshot again. If the two
frames differ, that layer was painting over content at that scroll position — a leak.

At scroll positions past the hero the difference must be ~0.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops
from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3200/"
OUT = Path("mobile_audit")
OUT.mkdir(exist_ok=True)
UA = ("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 "
      "(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1")

# Layers that must never be visible once the hero is scrolled past.
NEUTRALISE = """() => {
  const hidden = [];
  for (const el of document.querySelectorAll('[data-hero-media], .hero-media')) {
    el.dataset._prevOpacity = el.style.opacity;
    el.style.opacity = '0';
    hidden.push((el.className || '').split(/\\s+/)[0]);
  }
  return hidden;
}"""

RESTORE = """() => {
  for (const el of document.querySelectorAll('[data-hero-media], .hero-media')) {
    el.style.opacity = el.dataset._prevOpacity || '';
  }
}"""

TOLERANCE_PCT = 0.5   # % of pixels allowed to differ

WIDTHS = [(390, 844), (320, 568), (1440, 900)]
failures = []

with sync_playwright() as p:
    browser = p.chromium.launch()
    for w, h in WIDTHS:
        mob = w < 800
        c = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=1,
                                is_mobile=mob, has_touch=mob, user_agent=UA if mob else None)
        pg = c.new_page()
        pg.goto(URL, wait_until="load", timeout=60000)
        pg.wait_for_timeout(1800)
        doc_h = pg.evaluate("document.documentElement.scrollHeight")
        # warm lazy content
        y = 0
        while y < doc_h:
            pg.evaluate(f"window.scrollTo(0,{y})")
            pg.wait_for_timeout(90)
            y += 800

        positions = {
            "at the very bottom": doc_h,
            "one screen before the bottom": doc_h - h,
            "two screens before the bottom": doc_h - 2 * h,
            "mid page": doc_h // 2,
        }
        print(f"\n=== {w}x{h}  (page {doc_h}px) ===")
        for label, pos in positions.items():
            pg.evaluate(f"window.scrollTo(0, {pos})")
            pg.wait_for_timeout(900)
            with_p = OUT / f"leak-{w}-with.png"
            pg.screenshot(path=str(with_p))
            hidden = pg.evaluate(NEUTRALISE)
            pg.wait_for_timeout(450)
            without_p = OUT / f"leak-{w}-without.png"
            pg.screenshot(path=str(without_p))
            pg.evaluate(RESTORE)
            pg.wait_for_timeout(250)

            a = Image.open(with_p).convert("RGB")
            b = Image.open(without_p).convert("RGB")
            d = np.asarray(ImageChops.difference(a, b)).sum(axis=2)
            changed = int((d > 8).sum())
            pct = 100.0 * changed / d.size
            ok = pct <= TOLERANCE_PCT
            print(f"  {'PASS' if ok else 'FAIL'}  {label:<30} leak={pct:5.1f}% of pixels "
                  f"({changed} px)  layers={hidden}")
            if not ok:
                rows = np.where((d > 8).any(axis=1))[0]
                failures.append(f"{w}x{h} {label}: media layer visible, {pct:.1f}% of the "
                                f"viewport differs (rows {rows.min()}..{rows.max()})")
        c.close()
    browser.close()

print("\n" + "=" * 70)
if failures:
    print(f"LAYER LEAKS ({len(failures)}):")
    for f in failures:
        print("  - " + f)
else:
    print("NO LEAKS — the hero media layer is fully hidden past the hero at every width")
sys.exit(1 if failures else 0)
