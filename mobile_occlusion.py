"""Page-wide occlusion sweep (hit-testing based).

For every landmark section (and the footer), scroll it into view and verify that the
element actually painting at sample points inside it belongs to that landmark.

*** KNOWN BLIND SPOT — DO NOT RELY ON THIS ALONE ***
`document.elementFromPoint` skips any element with `pointer-events: none`. The hero's
fixed media layer (`.hero-media`) sets exactly that, so this sweep reported the footer
as clean while the hero photo was painting over 57.7% of the viewport and hiding the
footer's links. Hit-testing fundamentally cannot see this class of bug.

Use `mobile_layer_leak.py` for full-viewport overlays — it compares rendered pixels
with the layer neutralised, which is the only reliable detector. Keep this script for
the complementary case: a *hit-testable* element covering content (e.g. a sticky bar
or a mis-stacked sibling), which the pixel method would not attribute to a culprit.

Also note: an obscured section still reports a correct bounding box, opacity 1 and
visibility visible, so overflow/geometry checks never catch either case.

The footer is the usual victim, because it is typically a non-positioned sibling of a
section that establishes a stacking context — so the footer's background paints in
CSS painting-order step 3 and its text in step 5, both BELOW any positioned element
with z-index >= 0 (step 6).
"""
import sys

from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3200/"
UA = ("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 "
      "(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1")

PROBE = """(sel) => {
  const el = document.querySelector(sel);
  if (!el) return {err: 'not found: ' + sel};
  const r = el.getBoundingClientRect();
  if (r.height < 4 || r.width < 4) return {err: 'zero size: ' + sel};

  // The site header is deliberately `position: fixed` chrome that overlays
  // content as you scroll. Samples underneath it are expected to be covered, so
  // start sampling below it — otherwise every section reports a false positive.
  const hdr = document.querySelector('header');
  const chromeBottom = hdr ? Math.max(0, hdr.getBoundingClientRect().bottom) : 0;

  const cx = r.left + r.width / 2;
  let foreign = 0, total = 0, examples = [];
  for (let f = 0.08; f <= 0.95; f += 0.08) {
    const y = r.top + r.height * f;
    if (y < chromeBottom + 2 || y > window.innerHeight - 2) continue;
    const e = document.elementFromPoint(cx, y);
    total++;
    if (!e) continue;
    if (!(e === el || el.contains(e) || e.contains(el))) {
      foreign++;
      if (examples.length < 5) {
        examples.push((e.tagName || '').toLowerCase() +
          (typeof e.className === 'string' && e.className
            ? '.' + e.className.split(/\\s+/).filter(Boolean).slice(0, 2).join('.') : ''));
      }
    }
  }
  return {height: Math.round(r.height), sampled: total, foreign,
          examples: [...new Set(examples)]};
}"""

LANDMARKS = [
    "#pilot", "#selection", "#premise", "#partners", "#house",
    "#campus", "#hackathons", "#apply", "footer",
    "#mentors",  # not rendered today; reported as skipped, kept as a tripwire
]

WIDTHS = [(390, 844), (320, 568), (1440, 900)]

failures = []

with sync_playwright() as p:
    browser = p.chromium.launch()
    for w, h in WIDTHS:
        mob = w < 800
        c = browser.new_context(viewport={"width": w, "height": h}, is_mobile=mob,
                                has_touch=mob, user_agent=UA if mob else None)
        pg = c.new_page()
        pg.goto(URL, wait_until="load", timeout=60000)
        pg.wait_for_timeout(1600)
        # full scroll first so lazy content and reveals settle
        total = pg.evaluate("document.documentElement.scrollHeight")
        y = 0
        while y < total:
            pg.evaluate(f"window.scrollTo(0,{y})")
            pg.wait_for_timeout(90)
            y += 700
        print(f"\n=== {w}x{h} ===")
        for sel in LANDMARKS:
            # A tall section can't be sampled from one scroll position. Walk the
            # landmark through the viewport and sample at each step, so a layer
            # covering only its lower half is still caught.
            offsets = pg.evaluate(
                """(s) => { const el = document.querySelector(s);
                     if (!el) return null;
                     const r = el.getBoundingClientRect();
                     return {top: r.top + window.scrollY, height: r.height};
                }""", sel)
            if offsets is None:
                print(f"  skip  {sel:<14} not found")
                continue

            step = max(200, h * 0.5)
            positions = [offsets["top"] + o
                         for o in range(0, max(1, int(offsets["height"])), int(step))]
            worst = {"foreign": 0, "sampled": 0, "examples": [], "height": 0}
            for pos in positions:
                pg.evaluate(f"window.scrollTo(0, {pos})")
                pg.wait_for_timeout(320)
                r = pg.evaluate(PROBE, sel)
                if r.get("err"):
                    continue
                worst["height"] = r["height"]
                worst["sampled"] += r["sampled"]
                worst["foreign"] += r["foreign"]
                if r["examples"]:
                    worst["examples"] = list(dict.fromkeys(worst["examples"] + r["examples"]))[:3]

            ok = worst["foreign"] == 0 and worst["sampled"] > 0
            print(f"  {'PASS' if ok else 'FAIL'}  {sel:<14} h={worst['height']:>5} "
                  f"sampled={worst['sampled']:>3} occluded={worst['foreign']}"
                  + ("" if ok else f"  by {worst['examples']}"))
            if not ok:
                failures.append(f"{sel} at {w}x{h}: {worst['foreign']}/{worst['sampled']} "
                                f"sample points covered by {worst['examples']}")
        c.close()
    browser.close()

print("\n" + "=" * 68)
if failures:
    print(f"OCCLUSION FAILURES ({len(failures)}):")
    for f in failures:
        print("  - " + f)
else:
    print("NO OCCLUSION — every landmark paints at its own sample points")
sys.exit(1 if failures else 0)
