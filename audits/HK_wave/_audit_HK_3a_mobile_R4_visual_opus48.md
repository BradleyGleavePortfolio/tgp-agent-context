# HK-3a Mobile — R4 Visual Audit (Opus 4.8 fresh-instance)

**PR:** BradleyGleavePortfolio/growth-project-mobile #224
**Branch:** hk/PR-HK-3a-fitness-bucket
**Pinned head SHA (R55):** `394b45b81af2666b2a945e953ed07b0f4ac0f3ee` (== PR #224 headRefOid, verified via `gh pr view`)
**Prior-audit base SHA (R3 head):** `8ce63aaff31ddbe83a1d2b6bdf8da6939294a42f`
**Auditor:** Opus 4.8 fresh-instance — VISUAL/UX layer ONLY (R31/R32: auditor ≠ builder; code correctness owned by parallel code auditor)
**Method:** STATIC. Could not run app. Read R4 delta diff (`compare 8ce63aa…394b45b`), full PR diff, component source, theme tokens, and the new hook test. Token embedding in git URLs was blocked by safety classifier; used `gh api`/`gh pr diff` to fetch the diff + file contents at the pinned SHA instead (no clone needed for a 3-file delta).

---

## VERDICT: CLEAN  (zero P0 + zero P1 + zero P2)

The R4 delta is exactly **3 files** (matches fixer result), and **none are visual components**:

| File | +/− | Visual surface? |
|---|---|---|
| `src/api/wearablesSamplesApi.ts` | +10/−0 | None — enum const + doc comment only |
| `src/hooks/useWearablePreference.ts` | +15/−0 | None — additive `isError`/`error` on bound return |
| `src/hooks/useWearablePreference.test.tsx` | +31/−2 | None — test title rename + 1 new test |

All visual components verified byte-identical to the R3 CLEAN head — no regression.

---

## R4 DELTA — VISUAL IMPACT ANALYSIS

### 1. Sleep enum keys (`wearablesSamplesApi.ts:79,87,88`)
Added `SLEEP_DURATION_MIN`, `SLEEP_ONSET_ISO`, `SLEEP_WAKE_ISO` to `WEARABLE_METRIC_TYPES`.
**Visual verdict: NO surface in this PR.** Grepped the entire PR #224 diff: these literals appear ONLY in the const map + the explanatory doc comment. No card (FitnessTrendCard, HeartCard, BodyCard, WorkoutsCard, ThreeRingHero, HrvTrendCard) and no screen in HK-3a renders them — they are consumed downstream by HK-3b (PR #223) `recoveryData`. Nothing in HK-3a's cards/screens changed shape, label set, or render branches as a result. No visual regression possible from this change in this PR.

### 2. `useWearablePreference` error surface (`useWearablePreference.ts:86-90,238-239`)
`BoundPreference` now declares `readonly isError: boolean` and `readonly error: Error | null`; the bound return computes `isError: mutation.isError || clearMutation.isError` and `error: clearMutation.error ?? mutation.error ?? null`.
**Visual verdict: PURELY ADDITIVE — no render path changed.** The change adds two observable fields; it does not alter `data`, `isPending`, or the `mutate` signature. Existing consumers are unaffected, and screens that opt in now have a real error flag to render against (not a forced spinner).

### 3. Consumer check — `ProviderOverlapChips.tsx` (the only HK-3a consumer of the bound hook)
- Subscribes to the optimistic preference cache (`:71-72`); active chip flips instantly on tap.
- Error UX is an **actionable toast** via the caller `onError` callback — `ROLLBACK_COPY = "Couldn't update preferred source — try again"` (`:54,:80`). This is proper **text + retry-prompt copy**, NEVER a generic "Error" and NEVER a spinner.
- The R4 hook change is backward-compatible with this consumer: `onError` still fires (now ADDITIVELY per the new test), so the existing actionable-toast path is intact. The new `isError`/`error` flags are available but not yet wired here — acceptable, because the error UI already exists via the toast (no spinner-only state, no dead-end).

---

## PER-COMPONENT VISUAL CHECK (regression sweep vs R3 head)

All confirmed unchanged at `394b45b` (not in the R4 delta):

- **HealthFitnessEmptyState** (`empty/HealthFitnessEmptyState.tsx`): Decacorn-quality, NOT spinner-only. Renders the real `ThreeRingHero` at 0% (`empty` prop) + value-first title "See your fitness in one place" + body + "Connect a tracker" CTA. Skeleton-of-real-layout per Bradley LAW §0.3. **Still passes.**
- **BucketSwitcher** (`components/BucketSwitcher.tsx`): segment `minHeight: 44` (`:120`) + symmetric `hitSlop 8` (`:66`) → ~60pt effective tap surface. Non-color active disambiguator preserved: absolute-positioned `activeUnderline` `height: 1.5` (`:134,:138`) + Medium→SemiBold weight bump (`:82`). Underline is `position: 'absolute'` so no layout jitter. **Still passes.**
- **FreshnessChip** (`components/FreshnessChip.tsx`): tier states use distinct icons (checkmark/sync/alert/add-circle), not color-only; `hitSlop 12`. **Still passes.**
- **ProviderOverlapChips**: chip `hitSlop 8` (`:110`) on sub-44pt chips; leading `checkmark-circle` non-color active signal (`:122-124`); `accessibilityRole="radiogroup"/"radio"` with `selected`/`disabled` state. **Still passes.**

---

## R0 LAW — SPINNER-ONLY EMPTY STATES
**ZERO in the R4 diff.** The delta touches only an enum const and a hook's return type; it introduces no UI. The hook change strictly *improves* the no-silent-failure posture (R65 #36) by exposing observable error state, and the test title's banned phrase "failing silently" was removed. No empty/loading/error state anywhere in the diff was reduced to a spinner.

---

## MOBILE DESIGN INTEL ALIGNMENT

- **Grid (4/8/12/16 units):** `theme/tokens.ts` spacing scale = 4/8/12/16/24/32/48/64 — a clean 4pt grid. All audited components consume `spacing.*` tokens; zero arbitrary pixel offsets in the R4 delta (the delta has no styles at all). ✓
- **Typography scale:** R4 delta adds no text or `fontSize`. Audited visual components spread `typography.*` tokens with only `fontFamily`/`color` overrides. ✓
- **Touch target ≥44pt:** No new interactive surface in R4. Existing controls remain compliant (BucketSwitcher 60pt, FreshnessChip ~50pt, ProviderOverlapChips ~28pt+hitSlop8 ≈ 44pt borderline-OK). ✓
- **Contrast ≥4.5:1:** No color/text changes in R4. Active states carry non-color signals (underline, weight, checkmark icons), so state legibility is hue-independent. ✓

---

## FINDINGS

- **P0:** none
- **P1:** none
- **P2:** none
- **P3 (non-blocking, CARRIED FORWARD from R3 — R4 did NOT touch these files, so unchanged):**
  1. `HealthFitnessEmptyState.tsx` CTA height ≈ 42pt (`paddingVertical: spacing.md`=12×2 + 18pt icon, `:102`) with no `hitSlop` — marginally under the 44pt HIG floor. Large full-width-ish CTA so practical tap reliability is fine; `minHeight: 44` or a `hitSlop` would make it strictly compliant. Same status as R3.
  2. `BucketSwitcher.tsx` Medium→SemiBold active weight has no letter-spacing/fixed-width compensation → potential ~1px label width shift (sub-pixel, visually imperceptible; underline is absolute-anchored so it never jitters). Same status as R3.
  - NEW P3 (optional, forward-looking): `ProviderOverlapChips` does not yet wire the newly-exposed `isError`/`error` into a rendered state — it relies on the actionable `onError` toast. This is acceptable today (error UI exists, not a spinner). If a future screen mounts the bound hook WITHOUT supplying `onError`, the new flags should be rendered to avoid a silent state. Not a defect in this PR.

---

## STATUS: VISUAL_READY — CLEAN
