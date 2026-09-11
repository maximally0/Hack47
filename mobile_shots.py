"""Capture per-section mobile screenshots at 390px for the audit."""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = "http://localhost:3200/"
OUT = Path("mobile_audit")
OUT.mkdir(exist_ok=True)

W, H = 390, 844
SECTIONS = [
    ("01-hero", "#pilot"),
    ("02-selection", "#selection"),
    ("03-premise", "section:has(#premise-grid)"),
    ("04-mentors", "#mentors"),
    ("05-partners", "#partners"),
    ("06-thirtydays", "#house"),
    ("07-gallery", "section:has([data-gallery-image])"),
    ("08-campus", "#campus"),
    ("09-hackathons", "#hackathons"),
    ("10-apply", "#apply"),
    ("11-footer", "footer"),
]

with sync_playwright() as p:
    browser = p.chromium.launch()
    ctx = browser.new_context(
        viewport={"width": W, "height": H},
        device_scale_factor=2,
        is_mobile=True,
        has_touch=True,
        user_agent=("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) "
                    "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"),
    )
    page = ctx.new_page()
    page.goto(URL, wait_until="load", timeout=60000)
    page.wait_for_timeout(1000)

    # walk the page to fire lazy loads + reveals
    total = page.evaluate("document.documentElement.scrollHeight")
    y = 0
    while y < total:
        page.evaluate(f"window.scrollTo(0,{y})")
        page.wait_for_timeout(110)
        y += H
        total = page.evaluate("document.documentElement.scrollHeight")
    page.wait_for_timeout(800)

    page.evaluate("window.scrollTo(0,0)")
    page.wait_for_timeout(600)

    for name, sel in SECTIONS:
        el = page.query_selector(sel)
        if not el:
            print(f"MISS  {name}  ({sel})")
            continue
        # document-relative geometry (bounding_box is viewport-relative)
        geo = el.evaluate(
            "e => { const r = e.getBoundingClientRect();"
            " return { y: r.top + window.scrollY, h: r.height }; }"
        )
        if not geo or geo["h"] == 0:
            print(f"NOBOX {name}")
            continue
        slice_h = min(geo["h"], 2000)
        page.screenshot(path=str(OUT / f"{name}.png"),
                        full_page=True,
                        clip={"x": 0, "y": geo["y"], "width": W, "height": slice_h})
        print(f"OK    {name}  y={round(geo['y'])} h={round(geo['h'])}")

    # the apply modal — the single most important mobile surface
    page.evaluate("window.scrollTo(0,0)")
    page.wait_for_timeout(400)
    page.click('a[href="#apply"]')
    page.wait_for_timeout(1400)
    page.screenshot(path=str(OUT / "12-modal-keyboard.png"))
    print("OK    12-modal  (focused element below)")
    info = page.evaluate("""() => {
      const a = document.activeElement;
      const r = a ? a.getBoundingClientRect() : null;
      return {
        active: a ? a.tagName + (a.type ? ':'+a.type : '') : null,
        rect: r ? {top:Math.round(r.top), bottom:Math.round(r.bottom), h:Math.round(r.height)} : null,
        vh: window.innerHeight,
        keyboardWouldCoverBelow: r ? Math.round(window.innerHeight*0.55) : null,
        fontSize: a ? getComputedStyle(a).fontSize : null,
        autoComplete: a ? a.getAttribute('autocomplete') : null,
        inputMode: a ? a.getAttribute('inputmode') : null,
        enterKeyHint: a ? a.getAttribute('enterkeyhint') : null,
        autoCapitalize: a ? a.getAttribute('autocapitalize') : null,
      };
    }""")
    print("   modal focus:", info)

    browser.close()
print("done")
