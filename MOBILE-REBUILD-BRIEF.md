# hack47.org — mobile rebuild brief

Repo: `C:\Users\rishh\workspace\Hack47` (branch `master`, deploys to Netlify site `hack47` → hack47.org)

Goal: the site is desktop-first and is broken or degraded on phones. Rebuild the mobile
experience properly — reconsider each element and animation for touch — without changing
the desktop design or the editorial identity (mono labels, volt accent, dashed frames,
coal/soot/chalk palette, section numbering).

## Ground rules

- **Desktop must not regress.** Every change is scoped below a breakpoint (`sm` = 640px
  unless stated). Verify desktop at 1440px after each pass.
- **Keep the identity.** Do not round corners, do not introduce new colours, do not swap
  the type system, do not turn it into a generic mobile card layout.
- **Mobile is the majority of traffic for a Delhi hackathon site.** Optimise for a real
  phone: 360–430px wide, dpr 2–3, mid-range Android and iPhone Safari.
- Every claim of "fixed" must be re-measured with the audit scripts (below). Do not
  report success without numbers.

## Measured evidence (baseline — re-run after changes to compare)

Audit scripts already in the repo root:
- `mobile_audit.py http://localhost:PORT/ --shots` → overflow, tiny text, tap targets,
  clipped content, per-section geometry, media sizes. Writes `mobile_audit/report.json`.
- `mobile_shots.py` → per-section screenshots at 390px into `mobile_audit/`.

Baseline at 390×844:

| Metric | Value |
|---|---|
| Page height | 14,747px |
| Elements with text < 12px | 114 (all 10px or 11px) |
| Tap targets < 44px | 14 |
| Hero `<h1>` visible | **NO — 96 of 96px covered by the stat bar** |
| Hero stat bar height | 225px (vs 128px assumed by the layout) |
| Header Apply CTA at phone width | **0×0px (display:none below sm)** |
| Partner logo wall | 12 rows, ~1,260px of scroll |
| Funnel canvas | redraws at 60fps while off-screen AND under `prefers-reduced-motion: reduce` |
| Safe-area insets | none anywhere (`env(safe-area-inset-*)` unused) |

## Workstreams

### 1. Global foundations
1. `app/layout.tsx` — `viewport`: add `viewportFit: "cover"` so `env(safe-area-inset-*)`
   resolves on iOS.
2. `app/globals.css` — add safe-area padding where content touches a screen edge:
   - `SiteHeader` top bar: `padding-top: env(safe-area-inset-top)`.
   - Hero stat bar + footer + modal: bottom inset.
3. `app/globals.css` — `.lbl` is `font-size:10px; letter-spacing:.16em`. Below `sm`,
   raise to **11px** and reduce tracking to **0.12em**. Implement with custom properties
   (`--lbl-size`, `--lbl-track`) so it is one change, not 114. Warn: +10% width on every
   label; re-run the audit for new overflow.
4. Add a `@media (hover: none)` block: any `:hover`-only affordance that carries meaning
   must have a touch resting state instead. Specifically these currently *only* reveal on
   hover and are therefore permanently dim on phones:
   - `.logo-cell` (`opacity:.5` → `1`)
   - `.mentor-card .mentor-image` (grayscale → colour)
   - `.team-member .team-image`
   - `.hk-row` hover background / `.hk-city` colour
   - `.clock-row .clock-key` colour
   Below `sm` give each a static "on" resting state (or an `:active` state for tap
   feedback). Do not leave brand logos at 50% opacity on a device with no hover.

### 2. Hero (`components/sections/Hero.tsx`) — HIGHEST PRIORITY
**Bug:** `<h1>` is fully covered at 320/360/390. `[data-hero-content]` uses
`bottom-[128px]`, which assumes a 128px stat bar. On phones the stat bar becomes
`flex-col` (3 stats wrapping + a full-width Apply button) and is **225px** tall, so it
paints over the headline. Verified with `document.elementFromPoint` on the h1 centre —
top element is the stat bar, `h1Visible: false` at every phone width.

Fix: stop positioning the stat bar absolutely over the copy.
- Make `#pilot` a flex column (`flex flex-col`), keep the media layer `absolute inset-0`.
- Hero copy becomes a normal flex child with `mt-auto` and mobile-appropriate bottom
  padding; the stat bar becomes the last flex child, **not** `absolute bottom-0`.
- This guarantees no overlap at any viewport height, including landscape phones.
- Compact the stat bar on mobile so it isn't 225px: stats stay on one line where they
  fit, and the Apply action becomes a compact full-width bar. Target ≤ 150px.
- Re-verify: the `<h1>` must be `100%` visible (0px covered) at 320/360/390/430 and in
  landscape (e.g. 844×390).

Also in Hero:
- **Image crop.** The fixed full-viewport layer with `object-cover` crops a 2000×1500
  landscape photo into a portrait sliver — the villa is unrecognisable. On mobile use a
  portrait-appropriate `object-position` (start with `object-[62%_45%]`) and verify
  visually. If the subject still reads as texture, art-direct: `<picture>` with a
  portrait crop of the same frame.
- **Image weight.** `w=2000&q=80` is served to a 390px viewport. Add `srcset`/`sizes`
  and serve ~800px on phones.
- **Drop the fixed-media parallax below `lg`.** The 4 scrub ScrollTriggers
  (scale/yPercent/shade/visibility) plus the copy fade are pure scroll-jank on a phone
  for a parallax nobody can perceive at 390px. Keep them at `lg`+.
- **Kill the wasted infinite tweens.** `gsap.utils.toArray(".aperture-glow")` creates 16
  infinite `repeat:-1, yoyo` tweens, but the hero aperture grid is `hidden md:grid` — on
  mobile GSAP still ticks all 16 every frame on `display:none` elements. Guard the tween
  creation behind a `matchMedia` check so it only runs when the grid is actually visible.
- Remove `min-h-[560px]` conflict: with the flex-column restructure the section should
  size to content and still fill the viewport.

### 3. Selection + funnel (`components/sections/Selection.tsx`, `SelectionFunnel.tsx`)
- **Canvas perf — measured:** it redraws every frame while scrolled fully off-screen
  (canvasTop 963 vs 844 viewport) and it **ignores `prefers-reduced-motion`**, unlike
  every other animation on the site which respects it via `useGsapScope`.
  Fix all three:
  - Pause the RAF loop with an `IntersectionObserver` when the canvas is out of view.
  - Scale particle count down on small screens (900 → ~320 below `sm`).
  - Under `prefers-reduced-motion: reduce`, draw **one** static frame and stop.
  - Cap `dpr` at 1.5 on mobile (currently 2).
- The four absolute `.lbl` labels around the canvas clear each other at 390 but have only
  ~13px of slack at 320. After the `.lbl` size bump, re-check at 320 and allow the
  top row to wrap or drop to a single centred pair if it collides.
- `40,000 → 16` countdown: fine, but it is `once:true` on a `top 82%` trigger — verify it
  still fires reliably on a short phone viewport where the element may already be past
  the trigger on load.

### 4. Premise (`components/sections/Premise.tsx`)
**Bug:** the `ApertureGrid` (columns=2, cellWidth=20, rowHeight=44, gap=7) is **not**
hidden on mobile, so it renders as a lone 47×408px vertical ladder of blue rectangles at
the top-left of a full-width mobile stack — it reads as a rendering glitch (confirmed in
screenshots). It is also `lg:grid-cols-[auto_1fr]`, so on mobile it stacks above the text
with a large empty gap to its right.
Fix: render a mobile-appropriate variant — a single horizontal row of 16 cells
(e.g. `columns={16} cellWidth={14} rowHeight={22} gap={5}` ≈ 299px wide, fits 342px) —
via two ApertureGrid instances gated `sm:hidden` / `hidden sm:grid`. Do not simply hide it;
the motif is part of the identity.

### 5. Partners (`components/sections/Partners.tsx`)
- **12 rows of logos (~1,260px) on mobile** dominates the page. Make the wall compact
  below `sm`: 3 columns, cell height ~54px (currently 78px), logo 18px, label 11px.
  Target ≤ 8 rows / ~620px. Or an auto-scrolling marquee that respects
  `prefers-reduced-motion`.
- Raise the logo resting `opacity` from 0.5 on mobile (no hover to brighten it) so the
  wall doesn't read as "disabled".
- The `white-space: nowrap` labels plus a 3-col layout at 320px is a real overflow risk —
  verify, and allow the label to shrink/ellipsis rather than push the grid wide.

### 6. Thirty days (`components/sections/ThirtyDays.tsx`)
- `day 15 · the cut` is `hidden sm:block`, so phones lose the midpoint of a section whose
  entire point is the thirty-day arc. Restore it: three labels at 10–11px uppercase will
  not fit at 320 ("DAY 01 · ARRIVAL" + "DAY 15 · THE CUT" + "DAY 30 · SHIP" ≈ 373px vs
  342px available). Shorten the mobile wording to `01 · arrival` / `15 · the cut` /
  `30 · ship`.
- The 30 ticks at `gap-[3px]` leave ~6px per tick at 320px. Confirm they read as a step
  chart and not a smear; if not, drop the gap to 2px below `sm` or reduce the tick count
  shown.
- The rhythm rows are fine — keep as is.

### 7. Gallery (`components/sections/Gallery.tsx`)
- `h-[430px]` is fixed regardless of viewport, so cards become very tall narrow slivers
  (e.g. 241×430 at 430px wide) with a heavily cropped photo. Make it responsive:
  `h-[300px] sm:h-[430px]` (or aspect-ratio driven).
- Add swipe affordances to the rail: `scroll-snap-type: x mandatory` +
  `scroll-snap-align: start` on the figures, `scroll-padding-inline`, and a visible hint
  that it scrolls (edge fade or a `01 — 04` progress indicator aligned to scroll
  position). The rail currently has no affordance at all beyond a clipped neighbour.
- The GSAP parallax (`y:-7 → 7` scrub) fires on a vertically-scrubbed trigger inside a
  horizontally scrolling container — it fights the rail and costs scroll work. Restrict it
  to `lg`+.
- Verify the last card clears the right edge and the first isn't flush to the viewport.

### 8. Campus (`components/sections/Campus.tsx`)
- The 3-stage roadmap is `grid grid-cols-3`, which at 390px gives ~98px per column —
  status labels wrap and truncate ("BEING DESIGNED" → "BEING") and the body copy is
  crushed. Stack to `grid-cols-1 sm:grid-cols-3`, and on mobile render the progress line
  vertically (left rule + markers) instead of the horizontal `#campus-line`.
- The campus image and its dashed 16:10 frame with chalk corner marks render correctly on
  mobile — leave it alone.
- Confirm the `#campus-line` ScrollTrigger scrub is skipped on mobile if the line is
  vertical there.

### 9. Hackathons (`components/sections/Hackathons.tsx`)
- Below `md` the row grid collapses to one column, so each edition stacks
  `edition / city / window / format / status` with `gap-4` (16px) while the gap *between*
  editions is `py-7` (28px). The two are too close, so editions blur into one list. Fix:
  open up the inter-row separation and tighten intra-row grouping — e.g. put
  `edition + window + status` on one line, `city` as the heading, body beneath, with a
  clear top border and more padding between editions. Keep the desktop table untouched.
- Ensure the status badge is visible without hunting for it.
- `see the next hackathon` button is a good target; `host an edition in your city` is an
  18px-tall link — give it a 44px tap target.

### 10. Apply modal (`components/ApplyForm.tsx`) — most important conversion surface
- **Wasted space:** `px-6 py-20` puts 80px of padding top *and* bottom on mobile. On a
  844px viewport the content occupies the top ~40% and ~450px (53%) is empty black.
  Reduce to ~24–32px vertical on mobile and centre the card vertically (or anchor it
  with a sensible top offset) so the question sits in the comfortable thumb zone.
- **Keyboard:** `inputRef.current?.focus()` fires on every step, which summons the soft
  keyboard immediately. Combined with the fixed dialog and no `visualViewport` handling,
  the focused field can end up behind the keyboard. Wire `window.visualViewport` resize
  to keep the focused field visible, or scroll it into view on focus.
- **Missing mobile input attributes** — all currently `null` on every field:
  - `autoComplete`: `name` / `email` / `tel` so phones can autofill.
  - `enterKeyHint`: `"next"` on steps 1–11, `"send"` on the last step, so the soft
    keyboard's return key says the right thing.
  - `inputMode`: `"tel"` on phone, `"email"` on email (already `type=tel/email` — verify).
  - The handle/URL fields (`instagram`, `linkedin`, `twitter`) are `type="text"`: add
    `autoCapitalize="none" autoCorrect="off" spellCheck={false}`, otherwise iOS
    capitalises the first letter of a handle and autocorrect mangles URLs.
- **Backdrop blur:** `backdrop-blur-sm` over a full-screen `fixed` layer is expensive on
  low-end Android. Drop it below `sm` (use a solid `bg-coal/97` instead).
- **12 sequential single-question steps** is high friction on a phone (12 taps minimum).
  Flag as a product decision, not an automatic change: consider merging the three social
  handle steps into one screen. Do not change the question set or order without sign-off.
- **Body scroll lock** uses `document.body.style.overflow = "hidden"`, which is
  unreliable on iOS Safari. Add `position: fixed` + scroll-position restore, or
  `overscroll-behavior: contain` on the dialog.
- Good already: inputs are `text-[19px]` (≥16px so iOS will not zoom), MCQ buttons are
  ~50px tall, close/back/submit are ≥44px. Keep these.

### 11. Footer (`components/sections/SiteFooter.tsx`)
- **Tap targets:** `LINKEDIN ↗` is 77×15px and `X ↗` is **24×15px** — both well below the
  44px floor. The footer legal links are 53×15 and 68×15. Give every one a ≥44px touch
  target (padding + negative margin so layout doesn't shift).
- Restore `sept 15 — oct 15 · 30 days · delhi` (currently `hidden sm:block`) — phones
  currently lose the dates entirely from the footer status strip.
- The oversized outline wordmark is clipped by 8–18px by `overflow-hidden`. Check the
  descender isn't cut off at mobile sizes; adjust `line-height`/padding so the wordmark
  is clipped intentionally (or not at all).

### 12. Header (`components/sections/SiteHeader.tsx`)
- **The `apply` CTA is `hidden sm:inline-flex`, so it is 0×0 below 640px.** A phone
  visitor's only path to the primary action is the hamburger. Show a compact Apply action
  in the mobile header bar (icon + short label, ≥44px tall). This is a conversion fix,
  not just polish.
- Logo `hack47` is 61×29 — raise to a 44px tap target.
- The mobile menu overlay is `fixed inset-0 top-16` and only non-interactive via
  `pointer-events-none`. Verify it is genuinely non-interactive when closed (it is) and
  add: Escape-to-close (the modal has it, the menu doesn't), a focus trap, and
  `inert`/`aria-hidden` on the rest of the page while open. It already locks body scroll.
- Oversized nav items (28px, `py-5`) are good — keep.

### 13. Dead code / content bug
- `components/sections/Mentors.tsx` (193 lines) is **not rendered** — `app/page.tsx`
  never imports it. Consequence: the visible section numbering runs
  **01 → 02 → 04 → 05 → 06 → 07 → 08**, skipping **03**, on all devices, because
  `Mentors` carried the `03 — who is in the room` label. Decide: restore Mentors, or
  renumber the sections and delete the file. Do not leave the gap. Flag to Rishul.

## Execution plan

Three Kiro passes, each ending in a verification gate. Do not start a pass until the
previous gate is green.

- **Pass 1 — foundations + above-the-fold.** Workstreams 1, 2, 3, 12.
  Gate: hero `<h1>` 100% visible at 320/360/390/430 + landscape; canvas idle off-screen
  and static under reduced motion; desktop 1440px unchanged.
- **Pass 2 — body sections.** Workstreams 4, 5, 6, 7, 8, 9, 11.
  Gate: no horizontal overflow at 320–430; page height reduced from 14,747px; zero tap
  targets under 44px; re-run `mobile_audit.py` and diff against baseline.
- **Pass 3 — the form + polish.** Workstream 10, 13.
  Gate: modal content fills the screen sensibly, all inputs carry correct
  `autoComplete`/`enterKeyHint`, modal opens and every step advances by tap on a 390px
  touch context.

## Definition of done

- `npx tsc --noEmit` clean, `npx next build` clean.
- `mobile_audit.py` at 320/360/390/430/768: 0 horizontal page overflow, 0 tap targets
  under 44px, no clipped text, no content hidden on mobile that exists on desktop.
- Desktop at 1440px visually unchanged (compare screenshots).
- Page height at 390px materially reduced from 14,747px.
- `prefers-reduced-motion: reduce` stops every animation including the canvas.
- Report the before/after numbers. Never claim a fix without the measurement.

## Do not

- Do not redesign the desktop layout.
- Do not add a mobile-only colour scheme, fonts, or rounded cards.
- Do not remove content on mobile — restore what's hidden or re-lay it out.
- Do not claim success from a build passing; measure the rendered page.
