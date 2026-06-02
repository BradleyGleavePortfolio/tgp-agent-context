# HK-5b Builder Result — Client AI Insight Panel

**Status:** READY_FOR_AUDIT
**Branch:** `hk/PR-HK-5b-client-ai-panel`
**Base:** `b83616a419c6c28c4e15d23b35fe4de2bd110625` (post-HK-5a merge / origin/main)

## HEAD SHA (40-char)

```
8c7509eef16f569c197bd64414f7fa9b984c17be
```

## PR

- **Number:** #226
- **URL:** https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/226
- **Title:** `PR-HK-5b: client AI insight panel`
- **Commit title:** `feat(wearables): HK-5b — client AI insight panel with norm comparison + intervention + deep-link CTA`
- **Commit author:** `Dynasia G <dynasia@trygrowthproject.com>` — title-only, NO Co-Authored-By, NO Generated-By (verified via `git log -1 --format='%an <%ae>%n%B'`).

## Files

**Added**
- `src/screens/client/wearables/ClientWearableInsightPanel.tsx` — read-only client AI panel (loading / empty / error / loaded states).
- `src/screens/client/wearables/__tests__/ClientWearableInsightPanel.test.tsx` — full state-matrix tests.

**Edited**
- `src/screens/client/wearables/WearablesShell.tsx` — mounts `<ClientWearableInsightPanel bucket=… />` into each screen's `aiPanelSlot` (H&F + S&R; S&R keeps its `bucketParam` prop).
- `src/screens/client/wearables/__tests__/WearablesShell.test.tsx` — screen mocks now render `aiPanelSlot`; new test asserts the panel mounts per bucket.

Exactly 4 files in the commit (node_modules symlink is gitignored and excluded).

## Gate results (run from /tmp/wt-hk5b)

| Gate | Command | Result |
|---|---|---|
| 1. TypeScript | `npx tsc --noEmit` | **exit 0** |
| 2. ESLint | `npx eslint <4 touched files>` | **exit 0**, 0 warnings |
| 3. Jest | `npx jest --testPathPattern='(ClientWearableInsightPanel\|WearablesShell\|wearableInsightsApi\|useWearableInsight)' --runInBand` | **exit 0** — 4 suites passed, **30/30 tests passed** |
| 3a. Clean exit | grep for "did not exit one second after the test run" | **0 occurrences** (no dangling-handle warning) |
| 4. R0 added-line sweep | `git diff --cached origin/main … \| grep '^+' \| grep -niE '<banned>'` | **empty (grep exit 1)** |
| 5. Author check | `git log -1 --format='%an <%ae>%n%B'` | `Dynasia G <dynasia@trygrowthproject.com>`, title-only |

(Note: the only `act(...)` console warnings in the Jest run originate from `@expo/vector-icons` `Icon` async font state — a pre-existing benign warning shared with the HK-5a coach-panel suite, not a test failure and not a "did not exit" warning.)

## R0 result

**CLEAN — sweep returns empty.** No `coming soon` / `@ts-ignore` / `@ts-nocheck` / `as any` / `as unknown as` / `.catch(() => undefined)` / empty-catch / spinner-only states in any added line. One test-comment false-positive (the literal banned token appearing inside an explanatory comment) was reworded to "wildcard type-escape (R0-forbidden)" so the grep is genuinely empty. No `@ts-expect-error` was needed in HK-5b's new code (the one in `testSupport/accessibilityMocks.ts` is pre-existing HK-5a infra, unchanged).

## State-matrix test coverage (the 8 required cases)

1. **Loading → skeleton, not a spinner.** `renders a skeleton (not a spinner) while loading` — asserts `client-insight-loading` present, `client-insight-panel` absent, and `UNSAFE_queryAllByType(ActivityIndicator)` has length 0.
2. **Empty → literal copy + secondary line, NO chip, NO CTA.** `renders the literal empty copy + secondary line, NO chip, NO CTA` — asserts `"Not enough data yet — keep syncing."`, `"We'll add insights here as your devices report more."`, and absence of `client-insight-confidence` + `client-insight-cta`.
3. **Error → sanitized one-liner + Retry → refetch.** `renders sanitized error copy + Retry, and Retry refetches` — asserts raw `error.message` ("internal db path leak") is NOT rendered (#12), sanitized copy IS, and pressing Retry calls `refetch` once.
4. **Loaded, `optional_cta = null` → 3 sections, NO CTA.** `renders observation / norm / intervention but NO CTA when optional_cta is null` — asserts all three label/value pairs render and `client-insight-cta` is absent.
5. **Loaded, safe CTA → press fires `onCtaPress(deepLink)`.** `renders a safe CTA and fires onCtaPress with the deep link on press` — CTA label `'Open sleep tips'`, press calls `onCtaPress` once with `'tgp://wearables/sleep-tips'`.
6. **Loaded, UNSAFE deep_link → CTA refused.** `refuses to open an UNSAFE deep link — onCtaPress is NOT called` — builds a valid `ClientInsightResponse` then `Object.assign`s `deep_link: 'https://evil.com'` (no wildcard cast), presses CTA, asserts `onCtaPress` NOT called (component re-validates `^tgp://`).
7. **Confidence chip text for ≥2 levels.** `renders the confidence chip text for two confidence levels` — `'Confident · 85%'` and (after rerender) `'Verified · 100%'`, matching `{CONFIDENCE_LABEL} · {CONFIDENCE_PCT}%`.
8. **Accessibility labels on root + chip + CTA + Retry.** `exposes accessibility labels on the root, chip, CTA and Retry` (root `'AI insight, Health & Fitness'`, chip `'Fairly sure confidence'`, CTA `'Open recovery plan'`) + `exposes a Retry accessibility label in the error state` (`'Retry'`).

**Plus** the WearablesShell test `mounts the client AI insight panel into each bucket` — asserts the H&F-scoped panel mounts on Fitness and the S&R-scoped panel mounts after switching to Recovery (existing shell assertions left intact).

Per the brief: the empty-state assertion is a positive `getByText('Not enough data yet — keep syncing.')`; **no `not.toMatch` hygiene guard** was added (R0 enforcement is via the diff grep, not runtime negation).

## 50-Failures sweep (R65) notes

- **#2 strict union:** branches on `isEmptyInsight(insight)` (the discriminated-union guard), never on individual fields.
- **#5 IDOR / tenant boundary:** component consumes `useClientInsight({ bucket })` only — no `clientId`, JWT is the sole identity.
- **#8 / defence-in-depth:** CTA deep-link re-validated against `^tgp://` in-component before `Linking.openURL`, even though backend Zod already enforces it.
- **#12 error sanitization:** `sanitizeWearableError(err)` (duplicated locally to avoid touching the out-of-scope coach file) — never renders `error.message`.
- **#19/#25 cache hygiene:** reuses HK-5a's `v1`-versioned `insightQueryKeys.client(bucket)`; no override.
- **#28 race / double-tap:** CTA latches `disabled` via a local `ctaOpening` `useState` flipped in a `useCallback` once a navigation is in flight.
- **#32 unmount:** only `useState`/`useCallback`/skeleton `Animated.loop` (stopped in the effect cleanup); no fetch timers/subscriptions added.
- **#35/#36/#50 graceful degradation:** every branch renders real copy; loading is a skeleton, error has copy + Retry, empty is calm warmth; `Linking.openURL` rejection is logged + re-enables the CTA (never swallowed, never unhandled).
- **#48 clean exit:** hook is mocked in component tests (deterministic, no React Query timers) → no "did not exit" warning.

## Deviations

1. **`accessibilityRole="region"` → `"summary"`.** React Native's typed `AccessibilityRole` (the `.d.ts` tsc resolves) has **no** web-style `'region'` landmark, so `accessibilityRole="region"` fails `tsc` (`TS2769`). Used the constant `CARD_REGION_ROLE = 'summary'` (RN's blessed self-contained labelled-region role) on all three card states. The mandated `accessibilityLabel="AI insight, {bucket-human-label}"` is preserved verbatim and is what screen readers announce as the region. This is the only deviation from the brief's literal text and is forced by the RN type system, not a shortcut. No R0 escape was used for it.
2. **Component tests mock `useClientInsight`** (matching HK-5a's coach-panel `WearableInsightPanel.test.tsx` approach) rather than wrapping in a live `QueryClientProvider`. This is deterministic, exercises every render branch precisely, and guarantees the clean-exit requirement (no React Query gcTime timers). The brief offered the QueryClientProvider pattern as guidance; the hook-mock pattern satisfies the same intent (per-test isolation + clean exit) and mirrors the landed HK-5a suite.

No other deviations. Card surface = `colors.bone`, hairline border = `withAlpha(tone.accent, 0.3)`, radius `radius.lg`; chip border `withAlpha(accent,0.4)` + fill `withAlpha(accent,0.1)` + charcoal text; CTA fill `tone.accentInk` (AA-safe) + bone text + `minHeight: 44`; all sizing via `spacing`/`radius`/`typography`; no raw hex literals in component source.
