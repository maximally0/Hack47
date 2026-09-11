"""Mobile audit for hack47.org — measures real defects, not opinions.

Run: python mobile_audit.py [url] [--shots]
"""
import json
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith("--") else "http://localhost:3200/"
SHOTS = "--shots" in sys.argv
OUT = Path("mobile_audit")

DEVICES = [
    ("320-se", 320, 568),   # iPhone SE 1st gen / smallest android
    ("360-android", 360, 800),  # most common android
    ("390-iphone", 390, 844),   # iPhone 14/15
    ("430-promax", 430, 932),
    ("768-tablet", 768, 1024),
]

MEASURE = r"""
() => {
  const vw = window.innerWidth;
  const docW = document.documentElement.scrollWidth;

  const describe = (el) => {
    const cls = (el.className && typeof el.className === 'string')
      ? el.className.split(/\s+/).filter(Boolean).slice(0, 4).join('.') : '';
    const txt = (el.textContent || '').trim().slice(0, 42);
    return `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${cls ? '.' + cls : ''}` +
           (txt ? ` "${txt}"` : '');
  };

  const inViewportX = (r) => r.right > vw + 1 || r.left < -1;

  // ---- 1. horizontal overflow culprits ----
  const overflowers = [];
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    if (cs.position === 'fixed') continue;           // fixed chrome handled separately
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    if (inViewportX(r)) {
      // only report the widest ancestor chain head, skip if parent already reported
      overflowers.push({
        el: describe(el),
        left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width),
        overflowRight: Math.round(r.right - vw),
        scrollable: el.scrollWidth > el.clientWidth + 1,
        overflowX: cs.overflowX,
      });
    }
  }

  // ---- 2. text smaller than 12px ----
  const tinyText = [];
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const fs = parseFloat(cs.fontSize);
    if (fs >= 12) continue;
    // only direct text owners
    const own = Array.from(el.childNodes)
      .filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join('').trim();
    if (!own) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0) continue;
    tinyText.push({ el: describe(el), px: Math.round(fs * 10) / 10, text: own.slice(0, 40) });
  }

  // ---- 3. tap targets below 44px in either axis ----
  const small = [];
  for (const el of document.querySelectorAll('a[href], button, input, select, textarea, [role=button], summary')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    // inline links inside prose are allowed to be text-sized
    const inProse = el.closest('p, li') && el.tagName === 'A' && cs.display.includes('inline');
    if (inProse) continue;
    if (r.height < 44 || r.width < 44) {
      small.push({
        el: describe(el),
        w: Math.round(r.width), h: Math.round(r.height),
        type: el.tagName.toLowerCase() + (el.type ? ':' + el.type : ''),
      });
    }
  }

  // ---- 4. clipped content: fixed height containers hiding their children ----
  const clipped = [];
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none') continue;
    if (cs.overflowY !== 'hidden' && cs.overflow !== 'hidden') continue;
    if (el.scrollHeight > el.clientHeight + 4 && el.clientHeight > 0) {
      clipped.push({ el: describe(el), client: el.clientHeight, scroll: el.scrollHeight,
                     cut: el.scrollHeight - el.clientHeight });
    }
  }

  // ---- 5. per-section geometry ----
  const sections = [];
  for (const s of document.querySelectorAll('main > *, header, footer, main section')) {
    const r = s.getBoundingClientRect();
    if (r.height === 0) continue;
    sections.push({
      id: s.id || null,
      el: describe(s).slice(0, 60),
      h: Math.round(r.height),
      scrollH: s.scrollHeight,
      overflowing: s.scrollWidth > vw + 1,
      scrollW: s.scrollWidth,
    });
  }

  // ---- 6. media / canvas natural size vs displayed ----
  const media = [];
  for (const el of document.querySelectorAll('img, canvas, video')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0) continue;
    media.push({
      el: describe(el).slice(0, 52),
      shown: `${Math.round(r.width)}x${Math.round(r.height)}`,
      natural: el.tagName === 'CANVAS' ? `${el.width}x${el.height}` : `${el.naturalWidth || 0}x${el.naturalHeight || 0}`,
      ratio: r.height ? (r.width / r.height).toFixed(2) : '0',
    });
  }

  return {
    vw, docW, docOverflow: docW - vw,
    docScrollH: document.documentElement.scrollHeight,
    overflowers, tinyText, small, clipped, sections, media,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  };
}
"""


def run():
    OUT.mkdir(exist_ok=True)
    report = {}
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for name, w, h in DEVICES:
            ctx = browser.new_context(
                viewport={"width": w, "height": h},
                device_scale_factor=3 if w < 500 else 2,
                is_mobile=True,
                has_touch=True,
                user_agent=(
                    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) "
                    "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
                ),
            )
            page = ctx.new_page()
            page.goto(URL, wait_until="load", timeout=60000)
            page.wait_for_timeout(1200)
            # walk the page so lazy images + ScrollTriggers fire
            total = page.evaluate("document.documentElement.scrollHeight")
            y = 0
            while y < total:
                page.evaluate(f"window.scrollTo(0,{y})")
                page.wait_for_timeout(90)
                y += h
                total = page.evaluate("document.documentElement.scrollHeight")
            page.evaluate("window.scrollTo(0,0)")
            page.wait_for_timeout(700)

            data = page.evaluate(MEASURE)
            report[name] = data

            if SHOTS:
                page.screenshot(path=str(OUT / f"{name}-full.png"), full_page=True)
            ctx.close()

            print(f"\n{'='*72}\n{name}  ({w}x{h})  doc={data['docW']}px vw={data['vw']}px "
                  f"OVERFLOW={data['docOverflow']}px  pageHeight={data['docScrollH']}px")
            print(f"  horizontal overflow elements: {len(data['overflowers'])}")
            for o in data['overflowers'][:8]:
                print(f"    - {o['el'][:64]}")
                print(f"      left={o['left']} right={o['right']} w={o['w']} "
                      f"(+{o['overflowRight']}px past) overflowX={o['overflowX']} scrollable={o['scrollable']}")
            print(f"  text < 12px: {len(data['tinyText'])}")
            for t in data['tinyText'][:8]:
                print(f"    - {t['px']}px {t['el'][:52]}  \"{t['text']}\"")
            print(f"  tap targets < 44px: {len(data['small'])}")
            for s in data['small'][:10]:
                print(f"    - {s['w']}x{s['h']} {s['type']} {s['el'][:56]}")
            print(f"  clipped (fixed height cutting content): {len(data['clipped'])}")
            for c in data['clipped'][:6]:
                print(f"    - {c['el'][:60]} client={c['client']} scroll={c['scroll']} cut={c['cut']}px")
            print(f"  sections:")
            for s in data['sections']:
                flag = "  <-- OVERFLOWS" if s['overflowing'] else ""
                print(f"    {str(s['id']):>12} h={s['h']:>5} scrollH={s['scrollH']:>5} "
                      f"scrollW={s['scrollW']:>5} {s['el'][:44]}{flag}")
            print(f"  media/canvas:")
            for m in data['media']:
                print(f"    {m['shown']:>12} shown / {m['natural']:>12} natural  ar={m['ratio']}  {m['el'][:44]}")

        browser.close()

    (OUT / "report.json").write_text(json.dumps(report, indent=1), encoding="utf-8")
    print(f"\n\nwrote {OUT/'report.json'}")


if __name__ == "__main__":
    run()
