# HK-5b R2 Fixer Result

**Base SHA:** 8c7509eef16f569c197bd64414f7fa9b984c17be
**New HEAD SHA (40-char):** 13a77dd7fbd2916ac6a025bb392c997ee99fb938
**Branch:** hk/PR-HK-5b-client-ai-panel (PR #226) — pushed, NOT merged
**Remote ref verified:** `git ls-remote origin hk/PR-HK-5b-client-ai-panel` → 13a77dd7fbd2916ac6a025bb392c997ee99fb938
**Commit author:** Dynasia G <dynasia@trygrowthproject.com> (title-only body, no Co-Authored-By, no Generated-By)
**Commit title:** fix(wearables): HK-5b R2 — render source_metrics, clamp+Read more, a11y/CTA-test/dark-mode/latch fixes

**Files changed (vs base SHA):**
- src/screens/client/wearables/ClientWearableInsightPanel.tsx (+469 / −, source)
- src/screens/client/wearables/__tests__/ClientWearableInsightPanel.test.tsx (+254, tests)

**Total +/- lines:** 586 insertions, 137 deletions (2 files)
(NOTE: `git diff origin/main` shows additional WearablesShell files, but those are pre-existing PR content — diff vs base SHA confirms 0 changes to WearablesShell. No coach-side or shared-component files touched.)

## Fixes applied
- **P1-1 source_metrics:** Added `ProvenanceRow` component in `LoadedPanel`, rendered after the intervention section and before the CTA. Label "Source metrics"; joins first 3 metrics with `, ` and appends ` +N more` when there are more; `accessibilityLabel="Source metrics: <joined>"`, `testID="client-insight-source-metrics"`; row omitted entirely when metrics empty. Uses `provenanceValue` style (bodySmall / textMuted).
- **P1-2 chip a11y percentage:** `ConfidenceChip` accessibilityLabel changed to `Confidence: ${CONFIDENCE_LABEL[level]}, ${CONFIDENCE_PCT[level]} percent`. Existing test updated to assert `'Confidence: Fairly sure, 70 percent'`.
- **P1-3 CTA Linking.openURL test:** Added describe block "CTA production navigation" — (1) positive: no `onCtaPress` prop, asserts `Linking.openURL` called exactly once with `tgp://wearables/sleep-tips`; (2) negative: `javascript:alert(1)` deep_link → `Linking.openURL` NOT called; (3) latch-reset: 2 presses → 2 calls. Existing `onCtaPress` override test retained.
- **P1-4 clamp + Read more:** `observation` + `norm_comparison` get `numberOfLines={3}` when collapsed (`CLAMP_LINES=3`); `intervention` left unclamped. Per-field `onTextLayout` sets `observationOverflows` / `normOverflows` state; single "Read more"/"Show less" toggle (`testID="client-insight-readmore"`) shown only when either overflows. Section testIDs `client-insight-observation` / `-norm` / `-intervention`. Added 280×3-char overflow test + within-cap no-toggle test; test helper `overflowLayout(node, lineCount)` fires the `textLayout` event.
- **P2-5 dark mode:** APPLIED. Migrated to `useTheme().semanticColors`. StyleSheet → `makeStyles(t: SemanticTokens)` factory with `type PanelStyles = ReturnType<typeof makeStyles>`. Card bg→`t.bgSurface`, body→`t.textPrimary`, muted/eyebrow/chip→`t.textMuted`, CTA text/icon→`t.textOnAccent`, skeleton→`withAlpha(t.border, 0.6)`. Bucket `tone.accent`/`tone.accentInk` retained (AA-verified). `styles` and `semanticColors` threaded as props to all subcomponents (EmptyPanel, LoadedPanel, Section, ConfidenceChip, SkeletonBar, ProvenanceRow).
- **P2-6 CTA latch:** `setCtaOpening(false)` moved into `.finally()` after `Linking.openURL`; `.catch` only logs (no swallowed undefined). In-flight guard retained to prevent double-fire.
- **P2-7 jest warnings:** Mocked `useReduceMotion` in the test file (`jest.mock('../components/useReduceMotion', () => ({ useReduceMotion: () => true }))`) — cut act() warnings 15→1. Remaining 1 is vendor `Icon` (Ionicons) async font load, out of scope. The "Jest did not exit one second after..." open-handle warning is NOT attributable to HK-5b: running the HK-5b file in isolation does not emit it; the bulk act/Worklets warnings originate from out-of-scope `RecoveryRingHero`, `CalmSlowReveal`, `Icon`, and Worklets.
- **P3-a whitespace guard:** Added `hasAnyRenderableField(insight)` — if all fields are blank after trim, render EmptyPanel. Per-field `value.trim().length > 0` checks (`showObservation` / `showNorm` / `showIntervention`) skip blank sections.
- **P3-e pressed opacity:** CTA `style={({pressed}) => [..., pressed && !ctaOpening && styles.ctaPressed]}` with `ctaPressed: { opacity: 0.8 }`.

## Gates
- **tsc:** PASS — `npx tsc --noEmit` exit 0
- **eslint:** PASS — `npx eslint 'src/screens/client/wearables/**/*.{ts,tsx}'` exit 0
- **jest:** PASS — `npx jest --testPathPattern='src/screens/client/wearables' --no-coverage` → 17 suites / 131 tests passed. HK-5b file 9→16 tests (+7). No open-handle warning attributable to HK-5b (file in isolation does not emit "did not exit").

## R0 ban scan
Grep on added lines vs base SHA, pattern covering `Coming soon`, `@ts-ignore`, `@ts-nocheck`, `as any`, `as unknown as`, `as\s+never\s+as`, `\bas\s+never\b`, `.catch(()=>undefined)`, empty `catch(e){}`:

```
(empty output — clean)
```

(During development one `node as never` in the test was caught by this grep and removed; replaced with `import type { ReactTestInstance } from 'react-test-renderer'`. `@ts-expect-error` not used.)

## Deviations from brief
- None. All 9 fixes (P1-1..P1-4, P2-5..P2-7, P3-a, P3-e) applied; none deferred. No coach-side or shared-component files touched. Push only — not merged, per brief. `node_modules` (not gitignored in this worktree) was inadvertently staged by an earlier `git add -A` and reset before commit; the final commit contains only the 2 in-scope files.
