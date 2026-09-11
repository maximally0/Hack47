# hack47 mobile rebuild — pass 2

Repo: C:\Users\rishh\workspace\Hack47   (you are already on branch `mobile-rebuild`)

Global rule for every change in this task: **all changes must be scoped below the `sm`
(640px) breakpoint unless the ticket explicitly says otherwise. Desktop at 1440px must be
visually unchanged after your change.** Do not alter the palette, the type system, the
square corners, or the mono/uppercase label identity. Do not round corners. Do not add a
mobile-only colour scheme or fonts. Do not remove content that exists on desktop.

Read `MOBILE-REBUILD-BRIEF.md` in the repo root for full rationale and the measured
baseline. But the values below were measured from the running site — treat them as
authoritative and do not re-derive them.

Work in this repo. When done, make no commit — the orchestrator will review your diff and
commit.

---

## TICKET 2 — body sections

Scope: `components/ui/ApertureGrid.tsx`, `components/sections/Premise.tsx`,
`Partners.tsx`, `ThirtyDays.tsx`, `Gallery.tsx`, `Campus.tsx`, `Hackathons.tsx`,
`SiteFooter.tsx`

### 2a. Premise — visible glitch
`Premise.tsx` renders `ApertureGrid columns={2} cellWidth={20} rowHeight={44} gap={7}`
with **no mobile gating**, inside a container that is `lg:grid-cols-[auto_1fr]`. Below
`lg` it stacks full-width, so the grid draws as a lone 47×408px vertical ladder of blue
rectangles at the top-left with a large empty gap beside it. It reads as a broken
element (confirmed in screenshots).
Fix: render a mobile-appropriate variant — a single horizontal row of 16 cells, e.g.
`columns={16} cellWidth={14} rowHeight={22} gap={5}` (≈299px wide, fits the 342px
content width) — using two `ApertureGrid` instances gated `sm:hidden` / `hidden sm:grid`.
Do not simply hide it; the sixteen-aperture motif is part of the identity.
`ApertureGrid` sets fixed px via inline styles, so it cannot be made responsive with CSS
alone — either the two-instance approach or add explicit mobile props.

### 2b. Partners — 12 rows of logos
`Partners.tsx`. The wall is
`grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-8` with
`PARTNERS` = 24 entries and `.logo-cell { height: 78px }` → **12 rows ≈ 1,260px**.
Below `sm`, make it compact: 3 columns, cell height ~54px, logo 18px, label 11px.
Target ≤8 rows / ~620px.
Also `components/../globals.css` `.logo-cell { opacity: .5 }` brightens only on hover, so
on a phone 24 brand logos sit permanently at 50% opacity and read as disabled. Raise the
mobile resting opacity (~0.78).
Risk: `.logo-cell span { white-space: nowrap }` at 3 columns on a 320px screen can push
the grid wide. Verify and allow shrinking/ellipsis rather than overflow.

### 2c. Thirty days — content missing on mobile
`ThirtyDays.tsx` line ~62: `<span className="hidden sm:block">day 15 · the cut</span>`.
Phones lose the midpoint of a section whose entire point is the thirty-day arc.
Three full labels will not fit at 320px ("DAY 01 · ARRIVAL" + "DAY 15 · THE CUT" +
"DAY 30 · SHIP" ≈ 373px against 342px available). Shorten the mobile wording to
`01 · arrival` / `15 · the cut` / `30 · ship` and show all three below `sm`.
The 30 ticks use `gap-[3px]`, leaving ~6px per tick at 320px — confirm they read as a
step chart, and if they smear, reduce the gap to 2px below `sm`.
Leave the rhythm rows as they are.

### 2d. Gallery — slivers and no affordance
`Gallery.tsx`. `<div className="h-[430px] overflow-hidden">` is fixed regardless of
viewport, so cards become tall narrow slivers (e.g. 241×430 at 430px wide) with the
photo cropped to an unreadable strip. Make it responsive: `h-[300px] sm:h-[430px]`.
Add swipe affordances: `scroll-snap-type: x mandatory` on the rail,
`scroll-snap-align: start` on the figures, `scroll-padding-inline`, and a visible
indication that it scrolls (edge fade, or tie the existing `01 — 04` indicator to scroll
position). The rail currently gives no hint at all beyond a clipped neighbour.
The GSAP parallax (`y: -7 → 7`, vertical `scrub`) fires inside a horizontally scrolling
container — restrict it to `lg`+.
Verify the last card clears the right edge and the first is not flush to the viewport.

### 2e. Campus — crushed 3-column grid
`Campus.tsx`. The stage roadmap is `grid grid-cols-3 gap-6`, which at 390px gives ~98px
per column: "being designed" wraps and truncates to "BEING" and the body copy is
crushed. Change to `grid-cols-1 sm:grid-cols-3` and, on mobile, render the progression
vertically (left rule + markers) instead of the horizontal `#campus-line`.
If the line becomes vertical on mobile, make sure the `#campus-line` ScrollTrigger scrub
is skipped there.
**Do not touch** the campus figure or its dashed 16:10 frame with the chalk corner
marks — it renders correctly on mobile as is.

### 2f. Hackathons — editions blur together
`Hackathons.tsx`. `ROW_GRID` is `md:grid-cols-[52px_1.1fr_1fr_1.4fr_132px]`, so below
`md` each row collapses to one column with `gap-4` (16px) between the five stacked
fields, while `py-7` (28px) separates one edition from the next. 16px vs 28px is too
close, so editions read as one continuous list.
Fix below `md`: group each edition clearly — e.g. `edition + window + status` on one
line, `city` as the heading, `format` beneath — with a stronger top border and more
space between editions. Keep the desktop table exactly as is.
Also `host an edition in your city` is an 18px-tall link; give it a 44px tap target.

### 2g. Footer
`SiteFooter.tsx`. Measured tap targets: `LINKEDIN ↗` 77×15px, **`X ↗` 24×15px**, legal
links 53×15px and 68×15px. All far below 44px. Give every one a ≥44px touch target using
padding with compensating negative margin so the visual layout does not shift.
`sept 15 — oct 15 · 30 days · delhi` is `hidden sm:block` — restore it below `sm`;
phones currently lose the dates entirely from the status strip.
The oversized outline `hack47` wordmark is clipped by `overflow-hidden` (8–18px
depending on width). Confirm the descender is not cut at mobile sizes and adjust
`line-height`/padding so the clipping is intentional.

### Ticket 2 gates
- Zero horizontal page overflow at 320/360/390/430/768.
- Zero tap targets under 44px.
- Page height at 390px materially below the 14,747px baseline — report the new number.
- No text still clipped by a fixed height.
- Desktop at 1440px unchanged.
