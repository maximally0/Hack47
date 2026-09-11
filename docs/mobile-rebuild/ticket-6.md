# hack47 mobile rebuild — pass 6

Repo: `C:\Users\rishh\workspace\Hack47` (branch `mobile-rebuild`)

Constraints: keep the desktop design language (mono/uppercase labels, volt accent, square
corners, coal/soot/chalk palette). No new colour, font, or rounded cards. `sm` = 640px.
Everything must respect `prefers-reduced-motion: reduce`.

Scope: only `components/sections/Partners.tsx`, and `app/globals.css` if strictly needed.
Other passes are editing sibling files — do not touch them.

**Make no commit — the orchestrator reviews the diff first.**

---

## 4c. Partners — three sliding rows

Partners — three sliding rows

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

---

## Gates for pass 6

- `python mobile_audit.py http://localhost:3200/` — 0 horizontal page overflow at
  320/360/390/430/768. The marquee must not create page-level overflow.
- `python mobile_layer_leak.py http://localhost:3200/` — still 0.0%.
- Report the Partners section height at 390px before and after (before: ~1,538px).
  The marquee exists to cut that.
- `npx tsc --noEmit` clean, `npx next build` clean.
- Desktop 1440px: report whether the marquee runs and the new Partners height.
- Report the real measured numbers. Do not claim a fix without the number.
