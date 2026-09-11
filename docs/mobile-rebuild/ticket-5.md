# hack47 mobile rebuild — pass 5

Repo: `C:\Users\rishh\workspace\Hack47` (branch `mobile-rebuild`)

These are Rishul's direct instructions after reviewing the mobile rebuild. Read
`MOBILE-REBUILD-BRIEF.md` in the repo root first for the design system.

Constraints: keep the desktop design language (mono/uppercase labels, volt accent, square
corners, coal/soot/chalk palette). No new colour, font, or rounded cards. Everything must
respect `prefers-reduced-motion: reduce`. `sm` = 640px.

Items 4a (hide the funnel on phones) and 4b (centre the selection stat panel) in
`ticket-4.md` are ALREADY DONE — do not redo them.

**IMPORTANT — a regression to avoid.** In the previous pass, a change gated on
`matchMedia("(min-width: 1024px)")` accidentally disabled a *correctness* mechanism (the
tween that hides the hero's fixed media layer), which then painted over the entire footer,
hiding it completely. Before gating anything on a breakpoint, ask whether it is decoration
or mechanism. Re-run `python mobile_layer_leak.py http://localhost:3200/` at the end — it
must stay at 0.0% leak.

**Make no commit — the orchestrator reviews the diff first.**

---

## 4g. Shared collapsible component — do NOT hand-roll four of them

Shared collapsible component — do not hand-roll four of them

Create `components/ui/Collapsible.tsx` and use it in 4d–4f.

Requirements:
- A real `<button>` with `aria-expanded`, `aria-controls` and a matching `id` on the panel.
  Keyboard operable (a button already is — just do not use a `<div onClick>`).
- Panel content must remain in the DOM but be hidden from assistive tech when collapsed
  (`hidden` attribute or `display: none`), not merely visually clipped.
- Animate open/close with height, and **skip the animation entirely under
  `prefers-reduced-motion: reduce`**.
- Accept `label`, `count`/`meta`, `defaultOpen`, and `children`.

### CRITICAL: refresh ScrollTrigger after every toggle
Collapsing a section changes the page height, which invalidates the `start`/`end` pixel
positions of every `ScrollTrigger` below it. The rest of the site's reveals and scrub
animations will then fire at the wrong scroll offsets — sections can be left stuck at
`opacity: 0` and appear missing.

After a toggle completes, call `ScrollTrigger.refresh()`. `lib/gsap.ts` already exports
`ScrollTrigger` and a coalesced `queueRefresh` helper — use it. Verify by toggling a
collapsible open, then scrolling to the bottom of the page and confirming every section
below is still revealed and visible.

Also re-check `mobile_layer_leak.py` behaviour after toggles, since page height changes.

---

## 4d. Make "thirty days, and how they are spent" collapsible

Make "thirty days, and how they are spent" collapsible

`components/sections/ThirtyDays.tsx`. Rishul: *"Make the entire 30 days and how they are
spent collapsible on the desktop as well as on mobile because it's too much shit."*

- Collapse the 8 `RHYTHM` rows behind a toggle, **on both desktop and mobile**.
- Keep visible: the section heading, the `04 — the operating rhythm` label, and the 30-day
  tick strip. Those are the visual hook; the eight long paragraphs are the bulk.
- Default state: **collapsed**.
- Toggle label must state what expands, e.g. `the 30-day rhythm — 8 entries` with a
  chevron that rotates when open.

---

## 4e. Make the hackathons list collapsible

Make the hackathons list collapsible

`components/sections/Hackathons.tsx`. Rishul: *"For the hackathons stuff, make that
collapsible as well."*

- Collapse the list of 5 `HACKATHONS` editions behind a toggle, desktop and mobile.
- Keep visible: the `06 — hackathons` label, the heading, the intro paragraph, the
  `HACKATHON_STATS` band, and the two action links at the bottom.
- Default state: **collapsed**.
- Toggle label e.g. `all editions — 5 cities`.

---

## 4f. Make the footer and the team block collapsible

Make the footer and the team block collapsible

`components/sections/SiteFooter.tsx`. Rishul: *"Make the footer and the team section
collapsible as well."*

Two separate collapsibles:
1. **The team block** ("the team behind this" + the member cards grid).
2. **The footer link columns** — the `THE HOUSE` / `GET INVOLVED` / `ELSEWHERE` three-column
   block.

Keep always visible: the volt status strip (`applications open · batch 01` / dates /
`16 places`), the "still deciding" CTA block with the sixteen-lights grid, the oversized
`hack47` wordmark, and the legal row (`© 2026 hack47 · built in delhi` + contact/instagram/
x/linkedin/privacy links). Those are the anchor points; everything else collapses.
Default state: **collapsed** for both.

---

## Gates for pass 5

Re-run the existing harness (all in the repo root) and report the real numbers:
- `python mobile_audit.py http://localhost:3200/` — 0 horizontal overflow at
  320/360/390/430/768; report the new page height at 390 (was 13,711px) — it should drop
  substantially since three sections now start collapsed.
- `python mobile_gates.py http://localhost:3200/` — hero `<h1>` still 0px covered, 0 tap
  targets under 44px at phone widths, canvas still idle off-screen / static under reduced
  motion.
- `python mobile_layer_leak.py http://localhost:3200/` — still 0.0% leak. This is a
  paint-order regression test; do not skip it.
- Every new toggle button must itself be a ≥44px tap target at phone widths.
- `npx tsc --noEmit` clean and `npx next build` clean.
- Desktop at 1440px: partners now slide and three sections are collapsed. Report the new
  desktop page height. Confirm nothing else on desktop regressed.

Report measured before/after numbers for each item. Do not claim a fix without the number.
