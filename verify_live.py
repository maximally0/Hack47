"""Verify the deployed production site at https://hack47.org against the local build.

Checks the response body for markers that only exist post-rebuild, then runs the
behavioural checks in a browser so we are testing rendered reality, not just HTML.
"""
import re
import sys
from urllib.request import Request, urlopen

LIVE = "https://hack47.org/"

MARKERS_PRESENT = [
    ("collapsible panel id", r"collapsible-"),
    ("marquee css/animation", r"marquee"),
    ("aria-controls wiring", r"aria-controls"),
    ("tap-link utility", r"tap-link"),
    ("funnel hidden on mobile", r"hidden[^\"']*min-h-\[400px\]"),
]
MARKERS_GONE = [
    ("old placeholder copy", r"drawing goes here"),
    ("old section number 08", r"08 — apply"),
]

req = Request(LIVE + "?cb=1", headers={"User-Agent": "Mozilla/5.0 (verification)"})
with urlopen(req, timeout=40) as r:
    html = r.read().decode("utf-8", "replace")
    status = r.status

print(f"HTTP {status}   {len(html)} bytes\n")
print("markers that should now be present:")
ok = True
for label, pat in MARKERS_PRESENT:
    n = len(re.findall(pat, html))
    flag = "OK " if n else "MISSING"
    if not n:
        ok = False
    print(f"  [{flag:>7}] {label:<26} {n} match(es)")

print("\nmarkers that should be gone:")
for label, pat in MARKERS_GONE:
    n = len(re.findall(pat, html))
    flag = "OK " if n == 0 else "STILL THERE"
    if n:
        ok = False
    print(f"  [{flag:>11}] {label:<26} {n} match(es)")

# section numbering should now run 01..07 contiguous
nums = re.findall(r"0(\d) — (selection|the premise|partners|the operating rhythm|what comes after|hackathons|apply)", html)
print(f"\nsection labels found in HTML: {[n for n, _ in nums]}")
expect = [str(i) for i in range(1, 8)]
got = [n for n, _ in nums]
print("  numbering contiguous 01-07:", "YES" if got == expect else f"NO -> {got}")

sys.exit(0 if ok else 1)
