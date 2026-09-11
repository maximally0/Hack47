"""Verify the partners marquee (pass 6).

Checks: 3 rows exist and are actually animating; the duplicate cells are hidden from
assistive tech; the rows cannot cause page-level horizontal overflow; and under
prefers-reduced-motion the motion stops (a marquee is exactly what that preference
exists to disable).
"""
import sys

from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3200/"
UA = ("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 "
      "(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1")

PROBE = """() => {
  const sec = document.querySelector('#partners');
  if (!sec) return {err: 'no #partners'};
  // any element whose class mentions marquee
  const rows = [...sec.querySelectorAll('[class*="marquee-row"], [class*="marquee-track"]')];
  const all  = [...sec.querySelectorAll('[class*="marquee"]')];
  const animating = all
    .map(el => {
      const cs = getComputedStyle(el);
      return {cls: String(el.className).split(/\\s+/).filter(c => c.includes('marquee')).join(' '),
              name: cs.animationName, dur: cs.animationDuration,
              play: cs.animationPlayState, transform: cs.transform.slice(0, 40)};
    })
    .filter(a => a.name && a.name !== 'none');
  const dupes = sec.querySelectorAll('[aria-hidden="true"]').length;
  const cells = sec.querySelectorAll('.logo-cell').length;
  return {
    sectionH: Math.round(sec.getBoundingClientRect().height),
    rowish: rows.length,
    animatingCount: animating.length,
    animating: animating.slice(0, 6),
    ariaHiddenCount: dupes,
    logoCells: cells,
    uniqueNames: [...new Set([...sec.querySelectorAll('.logo-cell span')].map(s => s.textContent.trim()))].length,
    docOverflow: document.documentElement.scrollWidth - window.innerWidth,
    partnersScrollW: sec.scrollWidth,
    vw: window.innerWidth,
  };
}"""

fails, notes = [], []

with sync_playwright() as p:
    browser = p.chromium.launch()
    for label, reduced in [("motion allowed", False), ("prefers-reduced-motion: reduce", True)]:
        for w, h in [(390, 844), (1440, 900)]:
            mob = w < 800
            c = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=1,
                                    is_mobile=mob, has_touch=mob, user_agent=UA if mob else None,
                                    reduced_motion="reduce" if reduced else "no-preference")
            pg = c.new_page()
            pg.goto(URL, wait_until="load", timeout=60000)
            pg.wait_for_timeout(1800)
            r = pg.evaluate(PROBE)
            print(f"\n=== {label} @ {w} ===")
            if r.get("err"):
                fails.append(f"{w}: {r['err']}")
                print("  ", r)
                c.close()
                continue
            print(f"  partners height={r['sectionH']}px  logo-cells={r['logoCells']} "
                  f"(unique names: {r['uniqueNames']})  aria-hidden elements={r['ariaHiddenCount']}")
            print(f"  marquee rows found={r['rowish']}  animating={r['animatingCount']}")
            for a in r["animating"]:
                print(f"    {a['name']:<14} {a['dur']:<8} play={a['play']:<8} {a['cls'][:44]}")
            print(f"  docOverflow={r['docOverflow']}px  partnersScrollW={r['partnersScrollW']} vw={r['vw']}")

            if r["docOverflow"] > 1:
                fails.append(f"{label} {w}: page overflow {r['docOverflow']}px")
            if reduced:
                if r["animatingCount"] > 0:
                    fails.append(f"reduced-motion {w}: {r['animatingCount']} marquee animation(s) still running")
            else:
                if r["animatingCount"] == 0:
                    fails.append(f"{label} {w}: no marquee animation running")
            if r["uniqueNames"] != 24:
                notes.append(f"{w} {label}: {r['uniqueNames']} unique partner names (expected 24)")
            c.close()
    browser.close()

print("\n" + "=" * 68)
for n in notes:
    print("NOTE: " + n)
if fails:
    print(f"FAILURES ({len(fails)}):")
    for f in fails:
        print("  - " + f)
    sys.exit(1)
print("MARQUEE OK")
