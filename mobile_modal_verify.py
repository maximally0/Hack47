"""Independently verify the mobile apply-modal work (pass 3 claims)."""
import json
from pathlib import Path

from playwright.sync_api import sync_playwright

UA = ("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 "
      "(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1")
OUT = Path("mobile_audit")
OUT.mkdir(exist_ok=True)
W, H = 390, 844

FIELD = """() => {
  const a = document.activeElement;
  if (!a) return {err: 'no active element'};
  const r = a.getBoundingClientRect();
  const cs = getComputedStyle(a);
  return {
    id: a.id, type: a.type,
    fontSize: cs.fontSize,
    rect: {top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height)},
    vh: window.innerHeight,
    hiddenBehindKeyboard: r.bottom > window.innerHeight * 0.55,
    autoComplete: a.getAttribute('autocomplete'),
    inputMode: a.getAttribute('inputmode'),
    enterKeyHint: a.getAttribute('enterkeyhint'),
    autoCapitalize: a.getAttribute('autocapitalize'),
    autoCorrect: a.getAttribute('autocorrect'),
    spellCheck: a.getAttribute('spellcheck'),
  };
}"""

DIALOG = """() => {
  const d = document.querySelector('[role=dialog]');
  if (!d) return {err: 'no dialog'};
  const cs = getComputedStyle(d);
  const inner = d.querySelector(':scope > div:not([aria-label])');
  const ics = inner ? getComputedStyle(inner) : null;
  return {
    backdropFilter: cs.backdropFilter,
    background: cs.backgroundColor,
    overscrollBehavior: cs.overscrollBehavior || cs.overscrollBehaviorY,
    bodyOverflow: getComputedStyle(document.body).overflow,
    bodyPosition: getComputedStyle(document.body).position,
    innerPadTop: ics ? ics.paddingTop : null,
    innerPadBottom: ics ? ics.paddingBottom : null,
  };
}"""

with sync_playwright() as p:
    b = p.chromium.launch()
    c = b.new_context(viewport={"width": W, "height": H}, device_scale_factor=2,
                      is_mobile=True, has_touch=True, user_agent=UA)
    pg = c.new_page()
    pg.goto("http://localhost:3200/", wait_until="load", timeout=60000)
    pg.wait_for_timeout(2000)

    # tap the real hero CTA
    g = pg.evaluate("""() => {
      const bar = document.querySelector('#pilot > div.z-10.border-t')
              || document.querySelector('#pilot').lastElementChild;
      const a = bar.querySelector('a[href="#apply"]');
      const r = a.getBoundingClientRect();
      return {x: r.left + r.width/2, y: r.top + r.height/2, w: Math.round(r.width), h: Math.round(r.height)};
    }""")
    print("hero CTA:", g)
    pg.touchscreen.tap(g["x"], g["y"])
    pg.wait_for_timeout(1600)
    opened = pg.evaluate("() => !!document.querySelector('[role=dialog]')")
    print("modal opened by tap:", opened)
    print("dialog:", json.dumps(pg.evaluate(DIALOG), indent=1))

    # walk the first 3 steps, checking field attributes at each
    seen = []
    for i in range(3):
        f = pg.evaluate(FIELD)
        seen.append(f)
        print(f"step {i+1} field:", json.dumps(f))
        # actually type something valid so validation passes
        if f.get("type") == "email":
            pg.keyboard.type("rishul@example.com")
        elif f.get("type") == "tel":
            pg.keyboard.type("9041260790")
        else:
            pg.keyboard.type("Rishul Chanana")
        pg.wait_for_timeout(400)
        pg.keyboard.press("Enter")
        pg.wait_for_timeout(900)

    # check the social-handle steps (instagram / linkedin / twitter) explicitly
    print("\n--- walking to the social handle steps ---")
    guard = 0
    while guard < 14:
        guard += 1
        f = pg.evaluate(FIELD)
        fid = f.get("id", "")
        if fid in ("q-instagram", "q-linkedin", "q-twitter"):
            print(f"{fid}: autoCapitalize={f.get('autoCapitalize')} "
                  f"autoCorrect={f.get('autoCorrect')} spellCheck={f.get('spellCheck')} "
                  f"enterKeyHint={f.get('enterKeyHint')} autoComplete={f.get('autoComplete')}")
            pg.keyboard.type("handle")
            pg.wait_for_timeout(300)
            pg.keyboard.press("Enter")
            pg.wait_for_timeout(800)
            if fid == "q-twitter":
                break
            continue
        if fid == "q-brag":
            pg.keyboard.type("I built a thing that does something useful for people, at length here.")
        elif fid == "q-icecream":
            pg.keyboard.type("pistachio")
        elif fid == "q-caffeine":
            pg.keyboard.type("black")
        else:
            pg.keyboard.type("test value here")
        pg.wait_for_timeout(300)
        pg.keyboard.press("Enter")
        pg.wait_for_timeout(800)

    pg.screenshot(path=str(OUT / "modal-verified.png"))
    b.close()

print("\n--- summary ---")
first = seen[0]
checks = {
    "modal opens by tap": opened,
    "input >=16px (no iOS zoom)": first.get("fontSize") and float(first["fontSize"].replace("px", "")) >= 16,
    "input padding reduced from 80px": None,
    "autoComplete present": all(s.get("autoComplete") for s in seen),
    "enterKeyHint present": all(s.get("enterKeyHint") for s in seen),
}
for k, v in checks.items():
    print(f"  {k}: {v}")
