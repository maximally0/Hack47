"""Verify the collapsible work (pass 5).

Checks, in order of what would actually hurt:
1. Every collapsible toggle is a real <button> with aria-expanded + aria-controls
   pointing at an element that exists, and the panel is genuinely display:none when
   collapsed (not merely clipped).
2. Toggles actually open and close.
3. THE BIG ONE: collapsing/expanding changes page height, which invalidates every
   ScrollTrigger below it. If they are not refreshed, sections can be left stranded at
   opacity 0 and look permanently missing. Expand everything, scroll the whole page, and
   assert no section is invisible.
4. Each toggle is itself a >=44px tap target.

NOTE for whoever edits this: `button[aria-expanded]` also matches the site header's
hamburger, which has no aria-controls and is `lg:hidden` (so 0x0 at desktop). Select
collapsibles via `button[aria-controls]` instead, or the header pollutes every result.
Also, clicking toggles by index is a trap: the live locator re-evaluates, so indices
shift after each successful click. Always re-query for the first collapsed toggle.
"""
import sys

from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3200/"
UA = ("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 "
      "(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1")

TOGGLES = """() => Array.from(document.querySelectorAll('button[aria-controls]')).map(b => {
  const id = b.getAttribute('aria-controls');
  const panel = id ? document.getElementById(id) : null;
  const cs = panel ? getComputedStyle(panel) : null;
  const r = b.getBoundingClientRect();
  return {
    label: (b.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 52),
    expanded: b.getAttribute('aria-expanded'),
    controls: id, panelExists: !!panel,
    panelDisplay: cs ? cs.display : null,
    btnW: Math.round(r.width), btnH: Math.round(r.height),
  };
})"""

# walk up from each landmark looking for anything that would hide it
SECTION_STATE = """() => {
  const out = [];
  const nodes = [...document.querySelectorAll('main > *, footer')];
  for (const el of nodes) {
    const r = el.getBoundingClientRect();
    let hiddenBy = null, n = el;
    while (n && n !== document.body) {
      const c = getComputedStyle(n);
      if (c.display === 'none') { hiddenBy = 'display:none on ' + n.tagName + '.' + String(n.className||'').split(/\\s+/)[0]; break; }
      if (parseFloat(c.opacity) < 0.05) { hiddenBy = 'opacity ' + c.opacity + ' on ' + n.tagName + '.' + String(n.className||'').split(/\\s+/)[0]; break; }
      if (c.visibility === 'hidden') { hiddenBy = 'visibility:hidden on ' + n.tagName; break; }
      n = n.parentElement;
    }
    out.push({id: el.id || el.tagName.toLowerCase(), h: Math.round(r.height), hiddenBy});
  }
  return out;
}"""

fails, notes = [], []

with sync_playwright() as p:
    browser = p.chromium.launch()
    for w, h in [(390, 844), (320, 568), (1440, 900)]:
        mob = w < 800
        c = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=1,
                                is_mobile=mob, has_touch=mob, user_agent=UA if mob else None)
        pg = c.new_page()
        pg.goto(URL, wait_until="load", timeout=60000)
        pg.wait_for_timeout(2000)
        print(f"\n{'='*72}\n=== {w}x{h} ===")

        collapsed = pg.evaluate("document.documentElement.scrollHeight")
        toggles = pg.evaluate(TOGGLES)
        print(f"collapsed page height: {collapsed}px    collapsible toggles: {len(toggles)}")
        if not toggles:
            fails.append(f"{w}x{h}: found no button[aria-controls] — collapsibles missing")
        for t in toggles:
            hard = []
            if not t["panelExists"]:
                hard.append("aria-controls -> missing element")
            if t["btnH"] < 44:
                hard.append(f"{t['btnW']}x{t['btnH']} under 44px")
            if t["expanded"] != "false":
                notes.append(f"{w}x{h}: '{t['label'][:34]}' not collapsed by default")
            state = "PASS" if not hard else "FAIL"
            print(f"  {state}  {t['label'][:52]:<52} exp={t['expanded']} "
                  f"panelDisplay={t['panelDisplay']} btn={t['btnW']}x{t['btnH']}"
                  + (f"  <- {', '.join(hard)}" if hard else ""))
            for hh in hard:
                fails.append(f"{w}x{h}: '{t['label'][:34]}' {hh}")

        # expand every collapsible, re-querying each time (indices shift)
        clicked = 0
        for _ in range(12):
            btn = pg.locator("button[aria-controls][aria-expanded='false']:visible").first
            if btn.count() == 0:
                break
            try:
                btn.scroll_into_view_if_needed(timeout=8000)
                btn.click(timeout=8000)
                pg.wait_for_timeout(900)
                clicked += 1
            except Exception as e:
                fails.append(f"{w}x{h}: could not click a collapsed toggle: {str(e)[:70]}")
                break
        expanded = pg.evaluate("document.documentElement.scrollHeight")
        print(f"expanded {clicked} toggle(s); page height now {expanded}px "
              f"({expanded - collapsed:+}px vs collapsed)")

        # scroll the whole page so every ScrollTrigger can fire
        y = 0
        while y < expanded:
            pg.evaluate(f"window.scrollTo(0,{y})")
            pg.wait_for_timeout(130)
            y += int(h * 0.55)
        pg.evaluate("window.scrollTo(0, document.documentElement.scrollHeight)")
        pg.wait_for_timeout(1400)

        states = pg.evaluate(SECTION_STATE)
        stranded = [s for s in states if s["hiddenBy"] or s["h"] == 0]
        print("  sections after expanding (ScrollTrigger refresh test):")
        for s in states:
            print(f"    {'STRANDED' if (s['hiddenBy'] or s['h'] == 0) else 'ok':>9}  "
                  f"{str(s['id']):<14} h={s['h']:>5} {s['hiddenBy'] or ''}")
        if stranded:
            fails.append(f"{w}x{h}: {[s['id'] for s in stranded]} invisible after expanding "
                         f"(ScrollTrigger not refreshed)")
        c.close()
    browser.close()

print("\n" + "=" * 72)
for n in notes:
    print("NOTE: " + n)
if fails:
    print(f"\nFAILURES ({len(fails)}):")
    for f in fails:
        print("  - " + f)
    sys.exit(1)
print("\nCOLLAPSIBLES OK")
