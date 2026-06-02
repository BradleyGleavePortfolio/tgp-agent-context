# HK-5b R2 Code Audit Brief

**Auditor model:** GPT-5.5
**Auditor identity:** Independent code auditor (NOT the R1 auditor — but identity-rotation between R1→R2 is acceptable since R31/R32 only require auditor ≠ builder). Builder/fixer was Opus 4.8.
**Repo:** `growth-project-mobile`
**PR:** #226
**Head SHA (R55):** `13a77dd7fbd2916ac6a025bb392c997ee99fb938`
**Base of fixes:** `8c7509eef16f569c197bd64414f7fa9b984c17be` (R1 build)
**Origin/main HEAD:** `b83616a419c6c28c4e15d23b35fe4de2bd110625` (HK-5a squash)
**Worktree:** `/tmp/wt-hk5b-audit-r2-code` (FRESH — distinct from builder's `/tmp/wt-hk5b` and from R1 audit worktrees)
**Round:** R2 (verify fixer addressed R1 findings)

## What this audit must verify

The R2 fixer applied 9 fixes to address the R1 NEEDS_R2 verdict. Your job is to confirm each fix is real, correct, and doesn't introduce new issues.

**R1 findings being resolved (cross-reference these reports):**
- `/home/user/workspace/_audit_HK_5b_R1_code_GPT55.md` — P1 source_metrics; P2 chip a11y, CTA test, CTA latch, jest warnings; P3 (multiple)
- `/home/user/workspace/_audit_HK_5b_R1_visual_opus48.md` — P1 280×3 unclamped; P2 dark mode; P3 (multiple)

**Fixer result claims (verify each):** `/home/user/workspace/_fixer_result_HK_5b_R2.md`

## Worktree setup

```bash
cd /tmp
(cd /tmp/mobile-clone && git fetch origin && git worktree add /tmp/wt-hk5b-audit-r2-code 13a77dd7fbd2916ac6a025bb392c997ee99fb938)
cd /tmp/wt-hk5b-audit-r2-code
git checkout 13a77dd7fbd2916ac6a025bb392c997ee99fb938
ln -sfn /tmp/mobile-clone/node_modules ./node_modules
git rev-parse HEAD  # MUST equal 13a77dd7fbd2916ac6a025bb392c997ee99fb938
```

## Mandatory training docs

1. `/tmp/tgp-agent-context/quality-references/50_FAILURES_OF_AI_GENERATED_CODE.md` (R65 sweep)
2. `/tmp/tgp-agent-context/quality-references/MOBILE_APP_DESIGN_INTELLIGENCE.md`

## R0 ban scan (FIRST — non-negotiable)

```bash
cd /tmp/wt-hk5b-audit-r2-code
git diff origin/main..HEAD -- 'src/**' | grep '^+' | grep -v '^+++' | \
  grep -niE 'coming soon|@ts-ignore|@ts-nocheck|as any|as unknown as|as\s+never\s+as|\bas\s+never\b|\.catch\(\s*\(\s*\)\s*=>\s*undefined\s*\)|catch\s*\([a-z_]*\)\s*\{\s*\}'
```

Builder claim: EMPTY. Verify.

Also scan the test for the new "Read more"/"Show less" toggle:
- Toggle label must be exactly `"Read more"` and `"Show less"` — NOT "Coming soon" or any banned phrase
- Test titles and regex assertions must not include any R0-banned strings

## Fix-by-fix verification

Verify each fix vs the result doc's claims. For each, mark PASS/FAIL with file:line evidence.

### P1-1 — `source_metrics` ProvenanceRow
- Renders after the three content sections and before the CTA in `LoadedPanel`
- Joins first 3 metrics with `, ` and appends ` +N more` for >3
- Section is omitted when `source_metrics` is empty/undefined
- `accessibilityLabel` includes the joined metrics
- Test covers: full list, 3-or-fewer-no-overflow, empty/undefined→omitted

### P1-2 — Confidence chip a11y percentage
- `accessibilityLabel` is `"Confidence: <Label>, <pct> percent"` (or equivalent that includes the calibration number)
- Existing a11y test updated to assert the full label including the percentage

### P1-3 — `Linking.openURL` production tests
- New POSITIVE test: mocks `Linking.openURL`, renders panel WITHOUT `onCtaPress`, presses CTA, asserts `Linking.openURL` called once with exact `tgp://...` deep_link
- New NEGATIVE test: malformed deep_link (e.g. `javascript:alert(1)` or `https://evil.com`); asserts `Linking.openURL` NOT called and refusal is logged
- Existing `onCtaPress` injection test kept

### P1-4 — Clamp + Read more/Show less
- `observation` and `norm_comparison` render with `numberOfLines={3}` initially
- `intervention` renders UNCLAMPED always
- `onTextLayout` used to detect overflow → toggle only appears when text actually wraps past 3 lines
- Toggle labels: exactly `"Read more"` and `"Show less"` (no banned strings)
- Pressing toggles state; both clamped fields un-clamp together
- Touch target ≥44pt; `accessibilityRole="button"`
- NEW test fixture with three exactly-280-char fields:
  - Asserts initial clamp state
  - Asserts toggle is present when overflow detected
  - Asserts toggle expands/collapses correctly
  - Asserts `intervention` is never clamped

### P2-5 — Dark mode (APPLIED claim)
- Panel consumes `useTheme().semanticColors` (or equivalent)
- `colors.bone` / `colors.ink` / `colors.charcoal` / `colors.stone` hardcoded references replaced with semantic tokens
- Bucket `tone.accent` / `tone.accentInk` retained (AA-verified)
- Verify semantic tokens actually exist in `theme/tokens.ts` or `ThemeProvider.tsx` — if the fixer invented tokens that don't exist, that's a P0 (TS would have caught it; verify tsc actually passed)
- Spot-check: is there any `colorScheme === 'dark'` branching for bucket tones that fall below AA on dark? Verify the contrast logic OR document the assumption that bucket tones clear AA on both surfaces

### P2-6 — CTA latch reset
- `Linking.openURL(...).finally(() => setCtaOpening(false))` (or equivalent)
- Catch path logs the failure but does NOT swallow via `.catch(() => undefined)` (R0 ban)
- Test asserts: after successful open, CTA is re-enabled (you can press again, second `Linking.openURL` call observed)

### P2-7 — Jest warnings (15→1 claim)
- Run the jest gate yourself and report the actual warning count
- The one remaining warning the fixer claims is a vendor Icon component — verify by looking at the warning text
- "Did not exit one second after" warning may persist — fixer says not attributable to HK-5b; verify by checking if it appears even on the empty-panel render path

### P3-a — Whitespace-only field guard
- If `value.trim().length === 0` for a section, that section is omitted
- If ALL THREE are blank-after-trim, falls back to `<EmptyPanel/>`
- Test covers both partial-blank and all-blank cases

### P3-e — Pressed opacity
- CTA `Pressable` style includes `({pressed}) => [..., pressed && !disabled && { opacity: 0.8 }]` or equivalent
- Verify the existing latched-disabled opacity is preserved

## Regression checks (50-Failures sweep — R65)

Walk every category. Focus on what could have regressed in R2:
- **#7** silent error swallowing — does the new `.finally()` path log errors, not swallow them?
- **#15** code reuse / duplication — did the fixer introduce a new local helper that could have used the shared theme/components?
- **#17** fake test coverage — does the new `Linking.openURL` test ACTUALLY mock and assert, or is it asserting on the wrapper hook only?
- **#22** missing edge cases — is the 280×3 fixture truly 280 chars per field? Spot-check the fixture data.
- **#32** unmount cleanup — does the clamp toggle state hold any refs that could leak?

## Gates (must all PASS)

```bash
cd /tmp/wt-hk5b-audit-r2-code
npx tsc --noEmit 2>&1 | tail -20
npx eslint 'src/screens/client/wearables/**/*.{ts,tsx}' 2>&1 | tail -20
npx jest --testPathPattern='src/screens/client/wearables' --no-coverage 2>&1 | tail -40
```

Fixer claims tsc PASS, eslint PASS, jest 131/131. Verify all three.

(`--testPathPattern` singular still works in this RN repo — different Jest version than backend.)

## Deliverable

Write to `/home/user/workspace/_audit_HK_5b_R2_code_GPT55.md`:

```
# HK-5b R2 Code Audit — GPT-5.5

**Head SHA verified:** 13a77dd7fbd2916ac6a025bb392c997ee99fb938
**Worktree:** /tmp/wt-hk5b-audit-r2-code
**Verdict:** CLEAN | NEEDS_R3 | BLOCKED

## R0 ban scan
<output>

## Fix verification (P1)
- P1-1 source_metrics: PASS/FAIL <evidence>
- P1-2 chip a11y %: PASS/FAIL
- P1-3 Linking.openURL tests: PASS/FAIL
- P1-4 clamp + Read more: PASS/FAIL

## Fix verification (P2/P3)
- P2-5 dark mode: PASS/FAIL/PARTIAL
- P2-6 CTA latch finally: PASS/FAIL
- P2-7 jest warnings: PASS/PARTIAL
- P3-a whitespace guard: PASS/FAIL
- P3-e pressed opacity: PASS/FAIL

## Regression (50-Failures spot-check)
<table>

## Gate results
<output>

## New findings (if any)
<P0/P1/P2/P3 — should be empty or near-empty after a good R2>

## Verdict rationale
```

Do NOT commit. Audit only.
