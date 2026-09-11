# hack47 mobile rebuild — pass 4

Repo: `C:\Users\rishh\workspace\Hack47` (branch `mobile-rebuild`)

Read `MOBILE-REBUILD-BRIEF.md` in the repo root for the existing design system, then this
ticket. These are Rishul's direct instructions after reviewing the rebuild.

Constraints that still apply: keep the desktop design language (mono/uppercase labels,
volt accent, square corners, coal/soot/chalk palette). Do not introduce a new colour,
font, or rounded cards. Where a change is mobile-only it must be scoped below `sm`
(640px) unless stated. Everything must respect `prefers-reduced-motion: reduce`.

**Make no commit — the orchestrator reviews the diff first.**

---

## 4a. Hide the funnel animation on phones

`components/sections/Selection.tsx` renders `<SelectionFunnel />` — a canvas particle
funnel. Rishul: *"the funnel thingy that you have built (this animation thing): just hide
that on the phone because it looks weird."*

Add `hidden sm:block` to the `SelectionFunnel` wrapper (the `<div className="relative mt-10
mb-12 min-h-[400px] flex-1">` inside `SelectionFunnel.tsx`), or conditionally render it.

- Keep everything else in the `#selection` section: the `01 — selection` / `live intake ·
  funnel` labels, the `40,000 → 16` counter, the copy and the stat panel.
- Below `sm`, remove the `min-h-[400px]` dead space too, so the section does not keep a
  400px hole where the canvas used to be. Re-measure the section height afterwards.
- Do not delete `SelectionFunnel.tsx` — it still runs at `sm` and above.

## 4b. Centre the selection stat panel on phones

Rishul: *"Center the 'The Builders Reached' across it, whatever the numbers are that we
have placed."*

In `Selection.tsx`, the second column (`<div className="bg-ink text-chalk">`) renders
`SELECTION_STATS` — labels like `builders reached across india` with values like `40,000+`,
currently `<div className="tnum text-right font-medium ...">` i.e. right-aligned.

Below `sm`, centre this panel: the label and the value both centred, and the closing
paragraph and the `apply for one` link centred too so the whole block reads as one
centred unit. Above `sm`, leave the existing right-aligned layout untouched.

## 4c. Partners — three sliding rows

Rishul: *"For the partners, because we have too many partners, you can have three sliders
running where these partner slots slide in so we can see partners."*

`components/sections/Partners.tsx` currently renders all 24 `PARTNERS` as a static grid
(`grid-cols-2 / sm:grid-cols-3 / md:grid-cols-4 / xl:grid-cols-8`), which is 8-12 rows of
vertical space.

Replace the grid with **three continuously sliding rows** ("logo marquee"):
- Split the 24 partners into 3 rows of 8.
- Each row translates horizontally on a loop. Give the three rows different speeds and
  alternate the direction so they do not read as one block.
- Duplicate each row's contents once so the loop is seamless, and mark the duplicate
  `aria-hidden="true"` — otherwise a screen reader announces every partner twice.
- Implement with CSS `@keyframes` + `transform: translate3d`, not a JS RAF loop. Pause on
  hover for desktop.
- **`prefers-reduced-motion: reduce` must stop the motion** — there, fall back to the
  existing static grid (or a non-animated horizontally scrollable row). A marquee is
  exactly the kind of thing that preference exists to disable.
- Keep `.logo-cell` styling (logo + name, `invert(1)` on the svg) and the mobile resting
  opacity so marks are not dimmed.
- The rows must be clipped (`overflow: hidden`) so they can never create page-level
  horizontal overflow. Verify `documentElement.scrollWidth === innerWidth` afterwards.
- Keep the "Looking to partner?" block and the `PARTNER_MODES` row below the marquee
  exactly as they are.

## 4d. Make "thirty days, and how they are spent" collapsible

`components/sections/ThirtyDays.tsx`. Rishul: *"Make the entire 30 days and how they are
spent collapsible on the desktop as well as on mobile because it's too much shit."*

- Collapse the 8 `RHYTHM` rows behind a toggle, **on both desktop and mobile**.
- Keep visible: the section heading, the `04 — the operating rhythm` label, and the 30-day
  tick strip. Those are the visual hook; the eight long paragraphs are the bulk.
- Default state: **collapsed**.
- Toggle label must state what expands, e.g. `the 30-day rhythm — 8 entries` with a
  chevron that rotates when open.

## 4e. Make the hackathons list collapsible

`components/sections/Hackathons.tsx`. Rishul: *"For the hackathons stuff, make that
collapsible as well."*

- Collapse the list of 5 `HACKATHONS` editions behind a toggle, desktop and mobile.
- Keep visible: the `06 — hackathons` label, the heading, the intro paragraph, the
  `HACKATHON_STATS` band, and the two action links at the bottom.
- Default state: **collapsed**.
- Toggle label e.g. `all editions — 5 cities`.

## 4f. Make the footer and the team block collapsible

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

## 4g. Shared collapsible component — do not hand-roll four of them

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

## Gates for pass 4

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
