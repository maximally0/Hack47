"""Diagnose the end-of-page problem: console errors, failed requests, footer layout."""
import json
from pathlib import Path

from playwright.sync_api import sync_playwright

OUT = Path("mobile_audit")
OUT.mkdir(exist_ok=True)
UA = ("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 "
      "(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1")

with sync_playwright() as p:
    b = p.chromium.launch()
    c = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2,
                      is_mobile=True, has_touch=True, user_agent=UA)
    pg = c.new_page()

    console, errors, failed = [], [], []
    pg.on("console", lambda m: console.append(f"{m.type}: {m.text[:200]}") if m.type in ("error", "warning") else None)
    pg.on("pageerror", lambda e: errors.append(str(e)[:400]))
    pg.on("requestfailed", lambda r: failed.append(f"{r.method} {r.url[:140]} -> {r.failure}"))
    pg.on("response", lambda r: failed.append(f"HTTP {r.status} {r.url[:140]}") if r.status >= 400 else None)

    pg.goto("http://localhost:3200/", wait_until="load", timeout=60000)
    pg.wait_for_timeout(1500)
    t = pg.evaluate("document.documentElement.scrollHeight")
    y = 0
    while y < t:
        pg.evaluate(f"window.scrollTo(0,{y})")
        pg.wait_for_timeout(120)
        y += 700
    pg.evaluate("window.scrollTo(0, document.documentElement.scrollHeight)")
    pg.wait_for_timeout(2000)

    print("=== page errors ===")
    for e in errors[:12]:
        print("  ", e)
    print("=== console error/warn ===")
    for m in console[:15]:
        print("  ", m)
    print("=== failed requests / 4xx-5xx ===")
    for f in dict.fromkeys(failed):
        print("  ", f)

    # footer + apply section geometry
    print("\n=== end-of-page elements ===")
    info = pg.evaluate("""() => {
      const out = [];
      const foot = document.querySelector('footer');
      const apply = document.querySelector('#apply');
      const targets = [
        ['#apply', apply],
        ['footer', foot],
        ['footer wordmark', foot && foot.querySelector('div[style*="text-stroke"], div[style*="-webkit-text-stroke"]')],
        ['footer team grid', foot && foot.querySelector('#team-grid, [id*=team], .team-member')],
      ];
      for (const [name, el] of targets) {
        if (!el) { out.push({name, missing: true}); continue; }
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        out.push({name, h: Math.round(r.height), w: Math.round(r.width),
                  display: cs.display, opacity: cs.opacity, visibility: cs.visibility,
                  overflow: cs.overflow, text: (el.textContent||'').trim().slice(0,40)});
      }
      // any element at the very bottom with zero height or hidden that should have content
      const hidden = [];
      for (const el of document.querySelectorAll('footer *, #apply *')) {
        const cs = getComputedStyle(el);
        if (cs.display === 'none') hidden.push(el.tagName.toLowerCase() + '.' + String(el.className||'').split(/\\s+/)[0]);
        else if (cs.opacity === '0') hidden.push('OPACITY0 ' + el.tagName.toLowerCase() + '.' + String(el.className||'').split(/\\s+/)[0]);
      }
      return {targets: out, hiddenInFooter: [...new Set(hidden)].slice(0, 20), docH: document.documentElement.scrollHeight};
    }""")
    print(json.dumps(info, indent=1))

    # images in the footer: loaded?
    print("\n=== images at the end of the page ===")
    imgs = pg.evaluate("""() => Array.from(document.querySelectorAll('footer img, #apply img')).map(i => ({
      src: i.getAttribute('src'), complete: i.complete, nw: i.naturalWidth, nh: i.naturalHeight,
      w: Math.round(i.getBoundingClientRect().width), h: Math.round(i.getBoundingClientRect().height),
      alt: (i.getAttribute('alt')||'').slice(0,40)}))""")
    for i in imgs:
        flag = "OK" if i["complete"] and i["nw"] > 0 else "BROKEN"
        print(f"  [{flag}] {i['nw']}x{i['nh']} shown {i['w']}x{i['h']}  {i['src']}")
        print(f"          alt: {i['alt']}")

    pg.screenshot(path=str(OUT / "end-diagnose.png"), full_page=False)
    b.close()
print("\nscreenshot: mobile_audit/end-diagnose.png")
