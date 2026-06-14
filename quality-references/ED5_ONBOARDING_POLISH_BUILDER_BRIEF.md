# L12 — Roman ED.5: Onboarding polish pass

**Lane:** mobile-only (zero backend changes expected)
**Base mains:** backend `1fb04fbf`, mobile `18764542`
**Branch:** `feature/roman-ed5-onboarding-polish` (mobile-only repo)
**Flag (default OFF):** `EXPO_PUBLIC_FF_ROMAN_ONBOARDING_POLISH`

---

## What this is

A pure-mobile polish pass over the existing 10-step onboarding + Stripe Connect setup. The functional flow ships today (`OnboardingStep1.tsx` … `OnboardingStep10.tsx`, `OnboardingResults.tsx`, `LeanQ2ExperienceScreen.tsx`, `LeanQ3IntentScreen.tsx`, `LeanQ5Screen.tsx`, Stripe Connect screens). What's missing is **the polish layer**:

1. **Step transitions** — cross-fade + 8-px upward slide between steps (replace any current hard-cut). 220 ms duration, ease-out cubic. Single shared transition primitive used across every Onboarding step screen.
2. **Stripe Connect card flip** — when the coach taps "Connect Stripe" and the deep-link returns successfully, the placeholder card flips 180° to reveal the connected state (last-4 + brand). Reanimated 4 `useSharedValue` + `interpolate` on `rotateY`; 360 ms duration, ease-in-out cubic.
3. **Package creation permanence markers** — once a coach creates a package and pricing during onboarding, a small Roman-voiced confirmation marker ("Saved. You can change the price any time.") slides in for 1.6 s under the input row, then fades, leaving a persistent calm checkmark next to the field label. The checkmark is the "permanence marker" — it's still there when the coach navigates back.

---

## Surfaces touched

Strictly the onboarding flow. **DO NOT modify any post-onboarding screens.**

### Files to add
- `src/components/onboarding/StepTransitionView.tsx` — Reanimated wrapper that all onboarding step screens nest their content inside. Single source of truth for the transition.
- `src/components/onboarding/StripeConnectCard.tsx` — the flip card. Two faces: placeholder (front) + connected (back). Owned by the Stripe Connect onboarding screen.
- `src/components/onboarding/PermanenceMarker.tsx` — the calm checkmark + transient Roman line. Reusable across package + pricing rows.

### Files to modify
- `src/screens/onboarding/OnboardingStep1.tsx` … `OnboardingStep10.tsx` — wrap content in `StepTransitionView`. NO functional changes to the step content itself.
- `src/screens/onboarding/OnboardingResults.tsx` — same wrap.
- `src/screens/onboarding/LeanQ2ExperienceScreen.tsx`, `LeanQ3IntentScreen.tsx`, `LeanQ5Screen.tsx` — same wrap.
- `src/screens/onboarding/StripeConnectScreen.tsx` (or whatever it's named — grep for the existing Stripe Connect screen first) — replace static placeholder + connected-state with `StripeConnectCard`.
- The package-creation screen during onboarding — drop a `PermanenceMarker` next to "Package created" and "Price set" affordances.
- `src/config/featureFlags.ts` — add `romanOnboardingPolish` env-backed flag.

### Roman voice copy (additive)
- `src/lib/roman/copy.ts` — add `romanPermanenceMarker.packageSaved` and `romanPermanenceMarker.priceSaved` stems. Straight register. Sample:
  - `"Saved. You can change the package any time."`
  - `"Saved. You can adjust the price any time."`
  - No exclamation marks. No emoji. No contractions.

---

## Flag gating

Every change must mount conditionally on `featureFlags.romanOnboardingPolish`. When OFF, the screens behave exactly as today (hard-cut transitions, static Stripe card, no permanence marker). The flag-off doctrine pin will assert this.

---

## Tests (required before PR open)

- `src/components/onboarding/__tests__/StepTransitionView.test.tsx` — renders children; respects `enabled` prop (no transition when disabled); fade + slide animation values reach final state in under 250 ms (use `jest.useFakeTimers()` + `act(() => jest.advanceTimersByTime(220))`).
- `src/components/onboarding/__tests__/StripeConnectCard.test.tsx` — both faces render; tap on front fires `onConnect`; transition from front → back animates `rotateY` from 0 → 180.
- `src/components/onboarding/__tests__/PermanenceMarker.test.tsx` — Roman line appears, fades after 1.6 s, checkmark stays mounted; Roman voice doctrine (no `!`, no emoji, no contractions, no "your coach" – this is Roman speaking to the coach during their own setup, so the stem stands alone).
- `src/screens/onboarding/__tests__/onboardingPolishFlagOff.test.tsx` — when flag is OFF, none of the new components mount inside the onboarding screens (R79 doctrine pin).
- Existing onboarding tests MUST still pass.

---

## Performance + accessibility

- Honor `reduceMotion` from `useAccessibilityInfo()` — when reduce-motion is ON, transitions become instant (no animation) but content still updates correctly. Permanence marker checkmark still appears; only the slide-in is skipped.
- All new components ship `accessibilityRole` and `accessibilityLabel` for the visible Roman copy.
- StripeConnectCard flip uses `BackHandler.exitApp = no` — flip animation must not block hardware back.

---

## Required rules (verbatim)

- **R0** ban-scan clean on diff.
- **R52** push every ~2 min, `-u` on first push.
- **R74** every commit `Bradley Gleave <bradley@bradleytgpcoaching.com>`; verify after each.
- **R77** lane scope: onboarding screens + new components only. Do NOT touch any post-onboarding code, do NOT touch Stripe Connect backend, do NOT touch the package-pricing service.
- **R78** no new telemetry events expected. If you add any, update the pinned table SAME PR.
- **R79** doctrine sweep green before PR open: `npx jest --testPathPattern='(quietLuxuryDoctrine|FlagOff|doctrine|pin)'`
- **R80** if a test fails on code you didn't touch, verify against `origin/main` first. Fix small main-red regressions in-lane.

## L8/L10 learnings
- RNTL v14: `await render(...)`.
- AsyncStorage import: default ES import only.
- `semanticColors.bgSurface` (not `surface`).
- TanStack Query v5: `await waitFor(...)` after `mutateAsync`.

## PR conventions
- Branch (mobile only): `feature/roman-ed5-onboarding-polish`
- PR title: `feat(roman): ED.5 onboarding polish — step transitions + Stripe Connect card flip + permanence markers (mobile) — EXPO_PUBLIC_FF_ROMAN_ONBOARDING_POLISH off`
- PR body lists scope, feature flag, tests added, R-rule compliance, and explicitly notes "**no backend changes**".

Do NOT merge. Parent handles the merge train.
