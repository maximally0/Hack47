# Kiro tickets — hack47 mobile rebuild

Three ready-to-run tickets. Feed each to Kiro **verbatim**, in order, one per
`kiro-cli chat` invocation. Do not reparse or "improve" them — the file paths, current
values and target values were measured from the running site.

```
cd C:\Users\rishh\workspace\Hack47
"/c/Users/rishh/AppData/Local/Kiro-Cli/kiro-cli.exe" chat "$(cat docs/mobile-rebuild/ticket-1.md)" --no-interactive -a
```

After each ticket: `git diff --stat`, read the diff, start the dev server, re-run
`python mobile_audit.py http://localhost:3200/ --shots`, and check that pass's gates
before moving on. Kiro's self-report is not evidence — always re-measure.

Full context, rationale and the desktop no-regression rule: `MOBILE-REBUILD-BRIEF.md`.

**Global rule for every ticket:** all changes must be scoped below the `sm` (640px)
breakpoint unless the ticket says otherwise. Desktop at 1440px must be pixel-identical
after the change. Do not alter the palette, the type system, the square corners, or the
mono/uppercase label identity.

---

## TICKET 1 — foundations, hero, funnel canvas, header

Scope: `app/layout.tsx`, `app/globals.css`, `components/sections/Hero.tsx`,
`components/sections/Selection.tsx`, `components/sections/SelectionFunnel.tsx`,
`components/sections/SiteHeader.tsx`

### 1a. Safe areas
- `app/layout.tsx`: the exported `viewport` object currently has only `themeColor` and
  `colorScheme`. Add `viewportFit: "cover"`.
- `app/globals.css`: nothing uses `env(safe-area-inset-*)`. Add bottom/edge insets so
  content clears the iPhone home indicator and notch:
  - header bar: `padding-top: env(safe-area-inset-top)` below `sm`
  - hero stat bar, footer, and the apply dialog: bottom inset below `sm`

### 1b. Label type scale
- `.lbl` in `app/globals.css` is `font-size: 10px; letter-spacing: 0.16em`. This is the
  cause of 114 sub-12px text nodes on mobile. Introduce custom properties
  (`--lbl-size`, `--lbl-track`) and set them to `11px` / `0.12em` below `sm`, keeping
  10px / 0.16em at `sm` and above. One change, not 114.
- Adding ~10% width to every label can create new overflow. Flag any label that now
  wraps or overflows rather than shrinking the font back down.

### 1c. Hover-only affordances
Add a `@media (hover: none)` block giving a static resting "on" state to elements that
currently reveal meaning only on hover (on a phone they are permanently dim):
`.logo-cell` (currently `opacity: .5`), `.mentor-card .mentor-image`,
`.team-member .team-image`, `.hk-row`, `.hk-city`, `.clock-row .clock-key`.

### 1d. Hero — the critical fix
**Measured bug:** `[data-hero-content]` is positioned `bottom-[128px]`. That assumes a
128px stat bar. On phones the stat bar becomes `flex-col` (3 stat rows wrapping plus a
full-width Apply button) and measures **225px**, so it is painted over the `<h1>`.
`document.elementFromPoint` at the h1's centre returns the stat bar, not the h1.

| viewport | h1 height | covered |
|---|---|---|
| 320×568 | 96px | 96px (100%) |
| 360×800 | 96px | 96px (100%) |
| 390×844 | 96px | 96px (100%) |
| 430×932 | 96px | 21px |

Fix by removing the absolute positioning of the stat bar, not by retuning the 128px:
- `#pilot` becomes `flex flex-col`; keep the media layer `absolute inset-0`.
- Hero copy becomes a normal flex child with `mt-auto` and mobile bottom padding.
- The stat bar becomes the final flex child instead of
  `absolute inset-x-0 bottom-0 z-10`.
- Compact the stat bar below `sm` to ≤150px tall.
- Result must hold in landscape too (test 844×390).

Also in `Hero.tsx`:
- `<h1>` is `clamp(32px,7vw,78px)`; keep a 28px floor so it fits short viewports.
- **Image crop.** The media layer is `fixed inset-0` with `object-cover` on a 2000×1500
  landscape photo, cropped into a ~390px portrait viewport — the villa is
  unrecognisable. Below `sm`, set a portrait `object-position` (start at
  `object-[62%_45%]`) and verify visually that architecture reads, not texture.
- **Image weight.** `HERO_IMAGE.src` requests `w=2000&q=80` for a 390px viewport. Add
  `srcset`/`sizes` serving ~800px below `sm`.
- **Drop the fixed-media parallax below `lg`.** There are 4 scrub ScrollTriggers
  (image scale/yPercent, `[data-hero-shade]` opacity, the `--hero-media-visible`
  custom-property tween, and the copy fade). Below `lg` they cost real scroll work for
  an effect that is not perceptible at phone width. Gate them on `matchMedia("(min-width: 1024px)")`.
- **Remove 16 wasted infinite tweens.** `gsap.utils.toArray(".aperture-glow")` builds 16
  `repeat: -1, yoyo: true` tweens, but the hero `ApertureGrid` is `hidden md:grid` —
  below `md` GSAP keeps ticking all 16 every frame on `display:none` elements. Only
  create them when the grid is actually displayed.

### 1e. Funnel canvas
`SelectionFunnel.tsx`. Measured: the canvas redraws every frame while scrolled fully
off-screen (canvasTop 963 vs an 844px viewport) and it **ignores
`prefers-reduced-motion: reduce`** — it is the only animation on the site that does
(every GSAP animation correctly returns early via `useGsapScope`).
- Pause the `requestAnimationFrame` loop with an `IntersectionObserver` when off-screen.
- Reduce `PARTICLES` from 900 to ~320 below `sm`.
- Under `prefers-reduced-motion: reduce`, draw a single static frame and stop looping.
- Cap `dpr` at 1.5 below `sm` (currently `Math.min(2, devicePixelRatio)`).

In `Selection.tsx`: the `40,000 → 16` counter uses `once: true` on a `top 82%` trigger.
Verify it still fires on a short viewport where the element may already be past the
trigger at load.

### 1f. Header
`SiteHeader.tsx`. **The `apply` `ArrowLink` is `hidden ... sm:inline-flex`, so it is
0×0 below 640px.** A phone visitor's only route to the primary action is the hamburger.
Show a compact Apply action in the mobile header bar (≥44px tall).
Also: the `hack47` wordmark anchor is 61×29 — raise to a 44px minimum tap target.
Also: the mobile overlay menu has no Escape handler and no focus trap (the apply modal
has Escape). Add both, plus `inert` on the rest of the page while it is open.

### Ticket 1 gates
- `<h1>` 0px covered at 320/360/390/430 **and** at 844×390 landscape.
- Canvas: idle when scrolled off-screen; single static frame under reduced motion.
- Header has a visible Apply control ≥44px at 390px.
- No horizontal overflow at 320–430.
- Desktop at 1440px unchanged.

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

---

## TICKET 3 — apply modal, then report

Scope: `components/ApplyForm.tsx`

### 3a. Wasted screen
The dialog is `fixed inset-0 ... sm:p-6` with an inner `px-6 py-20`. That is 80px of
padding top *and* bottom on mobile: on an 844px viewport the content occupies roughly
the top 40% and ~450px (53%) is empty black (verified in screenshots). It is also the
wrong end of the screen for thumbs.
Below `sm`: cut vertical padding to ~24–32px and place the question in the comfortable
zone (vertically centred, or anchored with a deliberate top offset).

### 3b. Keyboard
`inputRef.current?.focus()` fires on every step, summoning the soft keyboard
immediately. With a fixed dialog and no viewport handling, the focused field can end up
behind the keyboard. Wire `window.visualViewport` resize/scroll to keep the focused
field visible, or scroll it into view on focus.

### 3c. Missing mobile input attributes — currently all absent
Every field has `null` for each of these. Add:
- `autoComplete`: `"name"` / `"email"` / `"tel"` so phones offer autofill.
- `enterKeyHint`: `"next"` on steps 1–11, `"send"` on the final step, so the soft
  keyboard's return key says the right thing.
- `inputMode`: `"tel"` on phone, `"email"` on email — verify `type` is already correct.
- **The `instagram`, `linkedin` and `twitter` questions are `type="text"` with no
  `autoCapitalize="none"`, `autoCorrect="off"` or `spellCheck={false}`.** On iOS,
  Auto-Capitalisation will upper-case the first letter of a handle and autocorrect will
  mangle URLs. These three must get all three attributes.

### 3d. Backdrop blur
The dialog uses `backdrop-blur-sm` over a full-screen fixed layer — expensive on
low-end Android. Drop it below `sm` in favour of a solid `bg-coal/97`.

### 3e. Body scroll lock
The lock sets `document.body.style.overflow = "hidden"`, which is unreliable on iOS
Safari. Use `position: fixed` plus scroll-position restore, or at minimum
`overscroll-behavior: contain` on the dialog.

### 3f. Leave alone
Inputs are `text-[19px]` — correct, ≥16px so iOS will not zoom on focus. The MCQ buttons
(~50px), close (44px), back (48px) and submit (~45px) targets are all fine. Keep them.
`Escape`-to-close already works. Keep it.

### 3g. Do NOT
Do not change the question set, order, wording or count. The 12 sequential
single-question steps are a real friction point on mobile (12 taps minimum) but that is
a product decision for Rishul, not an automatic change. Report the observation only.

### Ticket 3 gates
- Dialog content occupies the screen sensibly; no large dead zone.
- Every input carries the correct `autoComplete` / `enterKeyHint`; the three text-handle
  fields carry `autoCapitalize="none"`, `autoCorrect="off"`, `spellCheck={false}`.
- Every step advances by tap on a 390px touch context; the modal opens from a real tap.
- `npx tsc --noEmit` clean, `npx next build` clean.

---

## Do NOT do

- **Do not delete `components/sections/Mentors.tsx`** and **do not change any section
  number.** `Mentors.tsx` is 193 lines that `app/page.tsx` never imports, which is why
  the visible numbering runs 01 → 02 → 04 → 05 → 06 → 07 → 08 with **03 missing**. The
  fix depends on whether Rishul restores the section or drops it, so it is deliberately
  left for his decision. Report it; do not act on it.
- Do not redesign the desktop layout, add a mobile-only palette or fonts, round the
  corners, or remove content that exists on desktop.
- Do not claim a fix without re-running the measurement.
