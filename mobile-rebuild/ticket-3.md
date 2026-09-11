# hack47 mobile rebuild — pass 3

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
