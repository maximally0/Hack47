"""Gate checks for the hack47 mobile rebuild.

Usage: python mobile_gates.py http://localhost:3200/
Prints PASS/FAIL per gate with the measured numbers. Exit code 0 only if all pass.
"""
import json
import sys

from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3200/"
UA = ("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 "
      "(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1")

H1_PROBE = """() => {
  const sec = document.querySelector('#pilot');
  const h1 = sec && sec.querySelector('h1');
  if (!h1) return {err: 'no h1'};
  const hr = h1.getBoundingClientRect();
  const cs = getComputedStyle(h1);
  const bar = sec.querySelector(':scope > div.absolute.inset-x-0.bottom-0');
  // what actually paints at the h1 centre?
  const cx = hr.left + hr.width / 2, cy = hr.top + hr.height / 2;
  const top = document.elementFromPoint(cx, cy);
  // sample a vertical strip through the h1 and count covered sample points
  let covered = 0, total = 0;
  for (let f = 0.1; f <= 0.9; f += 0.1) {
    const y = hr.top + hr.height * f;
    const e = document.elementFromPoint(cx, y);
    total++;
    if (!(e === h1 || h1.contains(e) || e === sec)) covered++;
  }
  return {
    h1H: Math.round(hr.height),
    h1Top: Math.round(hr.top),
    h1Bottom: Math.round(hr.bottom),
    h1Opacity: cs.opacity,
    topEl: top ? top.tagName.toLowerCase() + (typeof top.className === 'string' && top.className ? '.' + top.className.split(/\\s+/)[0] : '') : null,
    // NOTE: the hero copy wrapper is `pointer-events:none`, so elementFromPoint
    // legitimately returns the hero <section> and never the h1 itself. Correct
    // test for occlusion is therefore "is any FOREIGN element painted on top",
    // not "is the h1 the topmost node".
    sampleCovered: covered, sampleTotal: total,
    statBarH: bar ? Math.round(bar.getBoundingClientRect().height) : null,
  };
}"""

OVERFLOW_PROBE = """() => ({
  docW: document.documentElement.scrollWidth,
  vw: window.innerWidth,
  overflow: document.documentElement.scrollWidth - window.innerWidth,
})"""

HEADER_PROBE = """() => {
  const hdr = document.querySelector('header');
  const links = Array.from(hdr.querySelectorAll('a, button'));
  const apply = links.filter(a => /apply/i.test(a.textContent || ''));
  return apply.map(a => {
    const r = a.getBoundingClientRect();
    const cs = getComputedStyle(a);
    return {txt: (a.textContent||'').trim().slice(0,20), w: Math.round(r.width),
            h: Math.round(r.height), display: cs.display,
            visible: cs.display !== 'none' && r.width > 0 && r.height > 0};
  });
}"""

CANVAS_PROBE = """() => {
  const c = document.querySelector('canvas');
  if (!c) return {err: 'no canvas'};
  const r = c.getBoundingClientRect();
  return {w: c.width, h: c.height, top: Math.round(r.top), bottom: Math.round(r.bottom),
          onScreen: r.bottom > 0 && r.top < window.innerHeight};
}"""

TAP_PROBE = """() => {
  const vw = window.innerWidth, out = [];
  for (const el of document.querySelectorAll('a[href], button, input, select, textarea, [role=button]')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const inProse = el.closest('p, li') && el.tagName === 'A' && cs.display.includes('inline');
    if (inProse) continue;
    if (r.height < 44 || r.width < 44) {
      out.push({el: el.tagName.toLowerCase() + '.' + String(el.className||'').split(/\\s+/).slice(0,2).join('.'),
                txt: (el.textContent||'').trim().slice(0,26), w: Math.round(r.width), h: Math.round(r.height)});
    }
  }
  return out;
}"""

WIDTHS = [(320, 568), (360, 800), (390, 844), (430, 932), (768, 1024), (1440, 900)]
LANDSCAPE = (844, 390)

results = {}
failures = []

with sync_playwright() as p:
    browser = p.chromium.launch()

    def ctx_for(w, h, reduced=False):
        return browser.new_context(
            viewport={"width": w, "height": h}, is_mobile=w < 800, has_touch=w < 800,
            user_agent=UA if w < 800 else None,
            reduced_motion="reduce" if reduced else "no-preference",
        )

    # ---- hero h1 + overflow at every width ----
    for w, h in WIDTHS:
        c = ctx_for(w, h)
        pg = c.new_page()
        pg.goto(URL, wait_until="load", timeout=60000)
        pg.wait_for_timeout(2200)
        r = pg.evaluate(H1_PROBE)
        o = pg.evaluate(OVERFLOW_PROBE)
        key = f"{w}x{h}"
        results.setdefault(key, {})["h1"] = r
        results[key]["overflow"] = o
        covered_pct = round(r.get("sampleCovered", 0) / max(1, r.get("sampleTotal", 1)) * 100)
        ok_h1 = (r.get("sampleCovered", 99) == 0
                 and float(r.get("h1Opacity", "0")) > 0.9
                 and r.get("h1H", 0) > 0)
        ok_ov = o["overflow"] <= 1
        print(f"[{key}] h1: foreignOnTop={r.get('sampleCovered')}/{r.get('sampleTotal')} "
              f"({covered_pct}%) opacity={r.get('h1Opacity')} "
              f"statBarH={r.get('statBarH')} -> {'PASS' if ok_h1 else 'FAIL'}")
        print(f"[{key}] docOverflow={o['overflow']}px -> {'PASS' if ok_ov else 'FAIL'}")
        if not ok_h1:
            failures.append(f"hero h1 NOT fully visible at {key} (covered {covered_pct}%, top el {r.get('topEl')})")
        if not ok_ov:
            failures.append(f"horizontal overflow {o['overflow']}px at {key}")
        if w < 800:
            taps = pg.evaluate(TAP_PROBE)
            results[key]["taps"] = taps
            print(f"[{key}] tap targets <44px: {len(taps)}")
            for t in taps[:6]:
                print(f"        {t['w']}x{t['h']}  {t['txt'][:22]}")
            if len(taps) > 0:
                failures.append(f"{len(taps)} tap targets <44px at {key}")
        c.close()

    # ---- landscape ----
    w, h = LANDSCAPE
    c = ctx_for(w, h)
    pg = c.new_page(); pg.goto(URL, wait_until="load", timeout=60000); pg.wait_for_timeout(2200)
    r = pg.evaluate(H1_PROBE); o = pg.evaluate(OVERFLOW_PROBE)
    print(f"[{w}x{h} landscape] h1: foreignOnTop={r.get('sampleCovered')}/"
          f"{r.get('sampleTotal')} opacity={r.get('h1Opacity')} h1H={r.get('h1H')} "
          f"overflow={o['overflow']}px")
    if not (r.get("sampleCovered", 99) == 0
            and float(r.get("h1Opacity", "0")) > 0.9
            and r.get("h1H", 0) > 0):
        failures.append(f"hero h1 NOT visible in landscape {w}x{h}")
    if o["overflow"] > 1:
        failures.append(f"landscape overflow {o['overflow']}px")
    c.close()

    # ---- header apply CTA at phone width ----
    c = ctx_for(390, 844)
    pg = c.new_page(); pg.goto(URL, wait_until="load", timeout=60000); pg.wait_for_timeout(1500)
    ap = pg.evaluate(HEADER_PROBE)
    vis = [a for a in ap if a["visible"] and a["h"] >= 44]
    print(f"[header@390] apply controls: {ap}")
    print(f"[header@390] visible & >=44px tall: {len(vis)} -> {'PASS' if vis else 'FAIL'}")
    if not vis:
        failures.append("no visible header Apply control >=44px at 390px")
    c.close()

    # ---- canvas: idle off-screen, static under reduced motion ----
    def canvas_state(reduced):
        c = ctx_for(390, 844, reduced=reduced)
        pg = c.new_page(); pg.goto(URL, wait_until="load", timeout=60000); pg.wait_for_timeout(1500)
        pg.evaluate("document.querySelector('#selection').scrollIntoView()"); pg.wait_for_timeout(2500)
        pg.evaluate("window.scrollTo(0,0)"); pg.wait_for_timeout(1000)
        st = pg.evaluate(CANVAS_PROBE)
        h1 = pg.evaluate("()=>document.querySelector('canvas').toDataURL('image/png').slice(-64)")
        pg.wait_for_timeout(1400)
        h2 = pg.evaluate("()=>document.querySelector('canvas').toDataURL('image/png').slice(-64)")
        c.close()
        return st, (h1 != h2)

    st, anim = canvas_state(False)
    print(f"[canvas] offscreen={not st['onScreen']} top={st['top']} stillAnimatingOffscreen={anim} "
          f"-> {'PASS' if not anim else 'FAIL'}")
    if anim:
        failures.append("canvas still redraws while off-screen")
    st2, anim2 = canvas_state(True)
    print(f"[canvas reduced-motion] stillAnimating={anim2} -> {'PASS' if not anim2 else 'FAIL'}")
    if anim2:
        failures.append("canvas still animates under prefers-reduced-motion")

    browser.close()

print("\n" + "=" * 70)
if failures:
    print(f"FAILURES ({len(failures)}):")
    for f in failures:
        print("  - " + f)
else:
    print("ALL GATES PASS")

import pathlib
pathlib.Path("mobile_audit").mkdir(exist_ok=True)
pathlib.Path("mobile_audit/gates.json").write_text(json.dumps(results, indent=1), encoding="utf-8")
print("wrote mobile_audit/gates.json")
sys.exit(1 if failures else 0)
