# hack47 mobile rebuild — pass 1

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
