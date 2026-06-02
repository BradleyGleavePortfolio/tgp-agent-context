# HK-5b R2 Fixer Brief — Client AI Insight Panel

**Fixer model:** Opus 4.8 (R0 law — Sonnet 4.6 FORBIDDEN)
**Repo:** `growth-project-mobile`
**PR:** #226
**Base SHA to start from (R55):** `8c7509eef16f569c197bd64414f7fa9b984c17be`
**Worktree:** `/tmp/wt-hk5b` (the existing builder worktree — you ARE allowed to reuse for fixes; R31/R32 only require auditor ≠ builder)
**Round:** R2 (fixing R1 audit findings)
**Commit author EVERY commit:** `Dynasia G <dynasia@trygrowthproject.com>`

## Auditor verdicts being resolved

- **R1 code audit (GPT-5.5):** NEEDS_R2 — `/home/user/workspace/_audit_HK_5b_R1_code_GPT55.md`
- **R1 visual audit (Opus 4.8 fresh):** NEEDS_R2 — `/home/user/workspace/_audit_HK_5b_R1_visual_opus48.md`

Both audits agree no P0/blockers. Both agree the panel is well-built. Fixes are real but scoped.

## Bradley R0 LAW (re-read before coding)

- NO "Coming soon" strings ANYWHERE (production, comments, test titles, test regex assertions, docblocks). String must not appear in diff including negation references like `/coming soon/i`.
- NO `@ts-ignore`, NO `@ts-nocheck`, NO `as any`, NO `as unknown as`, **NO `as never`**, NO `as never as X`, NO `.catch(() => undefined)`, NO `catch(e){}`, NO spinner-only empty states.
- `@ts-expect-error <one-line justification>` IS allowed.
- HK-5b's HEAD diff is currently R0-clean (verified). Do not regress.

## Files in scope (do NOT touch others)

1. `src/screens/client/wearables/ClientWearableInsightPanel.tsx`
2. `src/screens/client/wearables/__tests__/ClientWearableInsightPanel.test.tsx`
3. `src/screens/client/wearables/WearablesShell.tsx` (only if needed — likely untouched)
4. `src/screens/client/wearables/__tests__/WearablesShell.test.tsx` (only if needed — likely untouched)

**Do NOT touch** any coach-side files (`src/screens/coach/**`) or any shared component (`components/SkeletonLoader.tsx`, `theme/tokens.ts`, etc.) — scope containment per the original builder rationale.

## Mandatory fixes (P1)

### 1. Render `source_metrics` provenance (P1-code)
**Finding:** The contract requires `source_metrics: min(1)` for a full `ClientInsight`. The panel renders observation/norm_comparison/intervention but never displays provenance.

**Fix:** In `LoadedPanel`, after the three content sections and before the CTA, render a labelled provenance row using `insight.source_metrics`.

Minimum acceptable implementation:
- Label `eyebrow` text: `Source metrics` (uppercase, 11pt, same eyebrow styling)
- Value: join the first 3 metrics with `, `; if more than 3, append ` +${rest.length} more`
- Wrap text, no `numberOfLines` (let it wrap)
- `accessibilityLabel="Source metrics: <joined values>"`
- Section spacing matches the other three (`spacing.md` between sections, `spacing.xs` label→value)
- Use a typography token that's slightly lighter than body (e.g. `bodySm` or `body` with `textMuted`) — provenance is supporting, not primary

Edge cases:
- `source_metrics` is empty/undefined → omit the row entirely (do not render an empty section)
- This only applies to the loaded path; empty/error/loading already correctly omit it

### 2. Confidence chip a11y label must include percentage (P2 → upgrading to P1 because trivial)
**Finding:** Visible text is `"Confident · 85%"`, screen-reader hears only `"Confident confidence"`. Calibration is the whole point.

**Fix:** Change the `accessibilityLabel` in `ConfidenceChip` to:
```ts
accessibilityLabel={`Confidence: ${CONFIDENCE_LABEL[level]}, ${CONFIDENCE_PCT[level]} percent`}
```
Update the existing a11y test to assert the full label including the percentage.

### 3. CTA production test must assert `Linking.openURL` (P2 → P1 because it's a coverage gap on the safety-critical path)
**Finding:** Tests use the test-only `onCtaPress` prop, not the production `Linking.openURL` branch. The deep-link safety story is untested in the production path.

**Fix:**
- Add a NEW test: mocks `Linking.openURL`, renders the panel WITHOUT the `onCtaPress` prop, presses `client-insight-cta`, asserts `Linking.openURL` was called exactly once with the exact `tgp://...` deep_link from the fixture.
- Add a NEW negative test: same setup but with a malformed deep_link (e.g. `javascript:alert(1)` or `https://evil.com`); asserts `Linking.openURL` is NOT called and the refusal is logged.
- KEEP the existing `onCtaPress` test — it covers the test-injection path.

### 4. State #5 — clamp + Read more (P1-visual)
**Finding:** 280-char × 3 fields wrap fully un-clamped → ~750–820px card. No progressive disclosure, diverges from coach sibling.

**Fix (preferred — consonant with coach):**
- Add a single `expanded` boolean state (default `false`)
- When `expanded === false`: `observation` and `norm_comparison` render with `numberOfLines={3}` and `ellipsizeMode="tail"`
- `intervention` is the emphasized action — render UNCLAMPED always
- When ANY clamped section actually overflows 3 lines, render a single "Read more" pressable below the last clamped section that toggles to "Show less" and removes the `numberOfLines` cap on both fields together (mirror coach's `draftPreviewExpanded` pattern lines 274–289)
- Use `onTextLayout` to detect overflow so the toggle only appears when needed (no orphaned "Read more" on short content)
- Touch target ≥44pt, `accessibilityRole="button"`, label `"Read more"` / `"Show less"`
- NO "Coming soon" — pressable label is exactly `"Read more"` / `"Show less"`

**MANDATORY new test:** a fixture with three exactly-280-char fields (+ a CTA). Asserts:
- All three sections render
- Observation + norm_comparison are initially clamped (test the `numberOfLines` prop = 3)
- Intervention is unclamped
- "Read more" pressable is present
- Pressing "Read more" removes the clamp on observation + norm_comparison and changes label to "Show less"
- Pressing again re-clamps and returns to "Read more"

## Recommended fixes (P2)

### 5. Dark-mode parity (P2-visual)
**Finding:** Panel hardcodes `colors.bone` / `colors.ink` / `colors.charcoal` / `colors.stone` instead of consuming `useTheme()`. S&R host is theme-aware so a bright light card lands on a dark background.

**Fix:** Migrate the panel's surface/text/skeleton tokens to `useTheme()` semantic tokens:
- Card bg: `theme.bgSurface` (or whatever the existing semantic token is for elevated card surfaces — read `theme/tokens.ts` and `ThemeProvider.tsx`)
- Body text: `theme.textPrimary`
- Eyebrow / muted text: `theme.textMuted`
- Skeleton bg: `theme.bgMuted` or equivalent
- CTA text-on-accentInk: keep `colors.bone` ONLY if it still clears AA on the dark variant of `tone.accentInk`; otherwise use `theme.textOnAccent`

**Keep `tone.accent` / `tone.accentInk` (bucket tones) as-is** — they're already AA-verified. Spot-check contrast on the dark-mode card surface; if any bucket tone falls below AA on dark, branch by `theme.colorScheme === 'dark'` to a dark-variant accent (defer to existing dark tones in `wearablesTheme.ts` if present).

**If `theme.bgSurface` / `theme.textPrimary` etc. do not yet exist** in the theme, abort this fix and instead add a single explanatory code comment at the top of `ClientWearableInsightPanel.tsx`:
```tsx
// Note: HK-5b ships with light-mode palette only. Dark-mode parity is deferred to HK-7
// pending semantic theme tokens (bgSurface/textPrimary/textMuted) which do not yet exist
// in theme/tokens.ts. See _fixer_brief_HK_5b_R2.md §5.
```
And add the deferral to `_fixer_result_HK_5b_R2.md`. This is acceptable per R0 (it's a documented deferral, not a hidden gap).

### 6. CTA latch reset on success (P2)
**Finding:** `ctaOpening` resets only in `.catch`, so after a successful `Linking.openURL`, the CTA is permanently disabled.

**Fix:** Move the reset to a `.finally(...)` after `Linking.openURL` (NOT `.catch(() => undefined)` — that's R0-banned). Keep the in-flight guard so double-tap is still blocked.

```tsx
setCtaOpening(true);
Linking.openURL(deep_link)
  .catch((err) => {
    log.warn('cta_open_failed', { err });
  })
  .finally(() => {
    setCtaOpening(false);
  });
```

Add a test for the resolved-promise path: mock `Linking.openURL` to resolve, press CTA, assert `ctaOpening` returns to false (CTA becomes pressable again) — verify via the disabled state or by pressing twice and seeing two `Linking.openURL` calls.

### 7. Jest open-handle / act warnings cleanup (P2)
**Finding:** Targeted gate emits `act(...)` and Reanimated Worklets warnings and `Jest did not exit one second after the test run has completed.`

**Fix scope:** ONLY clean warnings caused by HK-5b's own tests. Do NOT chase pre-existing warnings from other components (e.g. `CalmSlowReveal.tsx`) — those are out of scope.

For HK-5b's tests specifically:
- Wrap any state-mutating actions in `act(...)` if missing
- Use `jest.useFakeTimers()` + `act(() => jest.runAllTimers())` for the skeleton shimmer animation if it's causing the open-handle warning
- Ensure all `Animated.loop` / Reanimated worklets are cleaned up on unmount (verify the `useEffect` cleanup actually fires in tests)

If HK-5b is NOT the source of the warnings (e.g. they come from `CalmSlowReveal.tsx`), document this in `_fixer_result_HK_5b_R2.md` and leave them — out of scope.

## Polish (P3 — do if quick, otherwise document deferral)

- **P3-a:** Whitespace-only field guard. In `LoadedPanel`, before rendering each section, check `value.trim().length > 0`. If all three are blank after trim, fall back to `<EmptyPanel/>`. If only one is blank, omit just that section (but keep the others). Defensive — `min(1)` Zod validation passes whitespace strings.
- **P3-b:** (skip) — empty/error left-aligned is consonant with coach, leave it.
- **P3-c:** SkeletonBar local duplication — leave for now; deferred to a future cross-cut refactor.
- **P3-d:** Chip format `·` vs `()` — leave; the format difference is intentional (client uses middot, coach uses parens). Both audits noted it as cosmetic; not worth a coach-touch.
- **P3-e:** CTA pressed-opacity — add explicit `style={({pressed}) => [styles.cta, ctaDisabled && styles.ctaDisabled, pressed && !ctaDisabled && { opacity: 0.8 }]}`. Cheap, improves visceral feedback.

## Workflow

```bash
cd /tmp/wt-hk5b
git rev-parse HEAD  # MUST equal 8c7509eef16f569c197bd64414f7fa9b984c17be
# … make all changes …
# Gates BEFORE commit:
npx tsc --noEmit 2>&1 | tail -10
npx eslint 'src/screens/client/wearables/**/*.{ts,tsx}' 2>&1 | tail -10
npx jest --testPathPattern='src/screens/client/wearables' --no-coverage 2>&1 | tail -20
# R0 ban scan on ADDED lines (must be empty):
git diff origin/main..HEAD -- 'src/**' | grep '^+' | grep -v '^+++' | \
  grep -niE 'coming soon|@ts-ignore|@ts-nocheck|as any|as unknown as|as\s+never\s+as|\bas\s+never\b|\.catch\(\s*\(\s*\)\s*=>\s*undefined\s*\)|catch\s*\([a-z_]*\)\s*\{\s*\}'

# Commit (ONE commit, fixup style):
git -c user.name="Dynasia G" -c user.email="dynasia@trygrowthproject.com" \
  commit -am "fix(wearables): HK-5b R2 — render source_metrics, clamp+Read more, a11y/CTA-test/dark-mode/latch fixes"
# Push to PR branch
git push origin HEAD:hk/PR-HK-5b-client-ai-panel
```

## Deliverable

Write a result summary to `/home/user/workspace/_fixer_result_HK_5b_R2.md`:

```
# HK-5b R2 Fixer Result

**Base SHA:** 8c7509eef16f569c197bd64414f7fa9b984c17be
**New HEAD SHA (40-char):** <SHA>
**Files changed:** <list>
**Total +/- lines:** <stats>

## Fixes applied
- P1-1 source_metrics: <evidence>
- P1-2 chip a11y percentage: <evidence>
- P1-3 CTA Linking.openURL test: <evidence>
- P1-4 clamp + Read more: <evidence>
- P2-5 dark mode: <APPLIED | DEFERRED with reason>
- P2-6 CTA latch: <evidence>
- P2-7 jest warnings: <evidence | OUT-OF-SCOPE>
- P3-a whitespace guard: <evidence>
- P3-e pressed opacity: <evidence>

## Gates
- tsc: PASS
- eslint: PASS
- jest: PASS X/Y, no open-handle warning attributable to HK-5b

## R0 ban scan
<empty grep output>

## Deviations from brief
<any deltas + justification>
```

Do NOT merge. Push only. The next step is R2 audits (code + visual, fresh worktrees, R31/R32).
