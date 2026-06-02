# HK-5b R3 Fixer Brief — Real Dark-Mode AA + Stale-State + Edge-Case Tests

**Role:** Fixer (Opus 4.8, `general_purpose` subagent type)
**Repo:** `BradleyGleavePortfolio/growth-project-mobile`
**Parent PR:** #226 — branch `hk/PR-HK-5b-client-ai-panel` (base `main`)
**Stack on:** PR #226 head `13a77dd7fbd2916ac6a025bb392c997ee99fb938` (R2 fixer head)
**Your branch:** `dynasia/pr-hk-5b-r3-dark-accent-ink` — branched FROM `13a77dd7`, push to same PR #226 (additional commit on top — DO NOT open a new PR)
**Audit verdict that triggered R3:** NEEDS_R3 from both code (GPT-5.5) and visual (Opus 4.8) auditors. R2 dark-mode migration moved the card surface to reactive `t.bgSurface` (#1C1A18 in dark) but left `tone.accentInk` a **static light-palette constant**, and that static ink is used as foreground TEXT and BORDER in three places — fails AA in dark mode.

---

## Bradley R0 LAW (re-stated — at all times)
- NO "Coming soon" strings in production, comments, test titles, regex assertions, or docblocks. The string MUST NOT appear in the diff in ANY form including negation references like `/coming soon/i`.
- NO `@ts-ignore`, `@ts-nocheck`, `as any`, `as unknown as`, `as never as X`, `as never`. NO `.catch(()=>undefined)`. NO `catch(e){}`. NO spinner-only empty/error states.
- `@ts-expect-error` with a one-line justification IS allowed.
- **Author EVERY commit:** `Dynasia G <dynasia@trygrowthproject.com>` — title-only, NO `Co-Authored-By`, NO `Generated-By` trailers. Commit BODY is allowed and encouraged for descriptive context, but trailers are forbidden.
- **R0 grep on the additions-only diff** must return empty:
  ```bash
  git diff origin/main..HEAD | grep -E "^\+" | grep -v "^+++" | grep -niE 'coming soon|@ts-ignore|@ts-nocheck|as any|as unknown as|as\s+never\s+as|\bas\s+never\b|\.catch\(\s*\(\s*\)\s*=>\s*undefined\s*\)|catch\s*\([a-z_]*\)\s*\{\s*\}'
  ```

## Training docs you MUST abide
- `/tmp/tgp-agent-context/quality-references/50_FAILURES_OF_AI_GENERATED_CODE.md`
- `/tmp/tgp-agent-context/quality-references/MOBILE_APP_DESIGN_INTELLIGENCE.md`

---

## The 5 R3 findings (all must be addressed)

### P1 — Dark-mode `tone.accentInk` as text/border fails AA (CONFIRMED by both auditors)
**File:** `src/screens/client/wearables/ClientWearableInsightPanel.tsx`
**Affected lines:**
- `:225` — Retry button TEXT `color: tone.accentInk` (on `styles.card.backgroundColor = t.bgSurface`)
- `:219` — Retry button BORDER `borderColor: tone.accentInk` (on dark card)
- `:409` — Read more / Show less TEXT `color: tone.accentInk` (on dark card)

**Measured contrast (dark `bgSurface = #1C1A18`, WCAG 2.1 relative luminance):**
| Pair | Value | AA threshold | Verdict |
|---|---:|---:|---|
| WARM accentInk `#6B4F1A` text on dark `#1C1A18` | **2.28:1** | 4.5 (normal text) | ✗ FAIL |
| COOL accentInk `#2C4A36` text on dark `#1C1A18` | **1.77:1** | 4.5 (normal text) | ✗ FAIL |
| WARM accentInk border on dark | 2.28:1 | 3.0 (UI component) | ✗ FAIL |
| COOL accentInk border on dark | 1.77:1 | 3.0 (UI component) | ✗ FAIL |

**Light mode still passes:** WARM 7.49:1, COOL 9.65:1.
**CTA fill usage (line 431 `backgroundColor: tone.accentInk`) PASSES both modes** because label uses `textOnAccent #FBF7F0`: WARM 7.13:1, COOL 9.19:1.

#### Required architectural fix: split the bucket-tone bucket

The root cause is that one token (`accentInk`) is doing two opposing jobs:
1. **CTA fill background** — needs the label-on-fill pairing (current dark values are fine).
2. **On-surface text/border** — needs the ink-on-surface pairing (current dark values fail).

The fix is to introduce a separate, **colorScheme-reactive** slot `onSurfaceInk` (or your preferred name) on `ToneTokens`, used for the on-surface text/border affordances, while `accentInk` continues to serve as CTA fill.

**Step-by-step:**

1. **Edit `src/screens/client/wearables/wearablesTheme.ts`** (currently exports `WARM`/`COOL` frozen constants at lines 53–69):
   - Change the export from two static constants to a **function** `toneTokens(tone: 'warm' | 'cool', colorScheme: 'light' | 'dark')` that returns the full ToneTokens for that bucket × scheme combination. (Or keep `WARM`/`COOL` as the light-mode base and add a `darkOverrides(tone)` function — your call, whichever is cleaner. The contract is: callers get a single object with the right values for the current scheme.)
   - Add a new `ToneTokens` field `onSurfaceInk: string` with scheme-reactive values:
     - WARM light: `gold[800] #6B4F1A` (preserves current text appearance in light)
     - WARM dark: **`gold[300] #D4B96B`** (verified contrast vs `#1C1A18` = **9.05:1** ✓, well above 4.5:1)
     - COOL light: `colors.forest #2C4A36` (preserves current)
     - COOL dark: **`brand[300] #6E9479`** (verified contrast vs `#1C1A18` = **5.10:1** ✓, above 4.5:1)
   - `accentInk` remains: WARM `#6B4F1A` / COOL `#2C4A36` (used only as CTA fill — passes both modes with `textOnAccent` label).
   - `accent` (the icon/chip-tint color) — also evaluate: in dark mode COOL `accent #2C4A36` icon on `#1C1A18` is 1.77:1 (below 3:1 UI threshold). Recommended dark variant: `brand[300] #6E9479` (5.10:1 ✓) for COOL `accent` in dark. WARM `accent #B08D57` on dark = 5.61:1 ✓ stays. **Either branch `accent` too OR leave a P3 follow-up note** — your judgment, but if you branch one you may as well branch the other for symmetry. If branched, also re-verify the chip-tint composite (accent @ 0.1 over bgSurface) still passes — it should since the tint is lighter on a dark bg.

2. **Edit `src/screens/client/wearables/ClientWearableInsightPanel.tsx`:**
   - At line ~128–130 where you call `useTheme()`, also extract `colorScheme` (it's already on the `useTheme()` return — verify by reading `src/theme/ThemeProvider.tsx:205`).
   - Resolve tone via the new function: `const tone = toneTokens(toneForBucket(bucket), colorScheme);` (or whichever signature you settled on).
   - At lines `:219` (Retry border), `:225` (Retry text), `:409` (Read more text): replace `tone.accentInk` with `tone.onSurfaceInk`.
   - At line `:431` (CTA `backgroundColor`): KEEP `tone.accentInk` — this is the CTA fill, it must remain dark.
   - Re-grep the file for any other `tone.accentInk` usages and decide on case-by-case basis (the audits identified only 4 usages: 219, 225, 409, 431).

3. **No coach-side changes.** The coach panel `WearableInsightPanel.tsx` uses a static light card and is OUT OF SCOPE for this PR. Do not touch it.

---

### P2 — No dark-mode contrast regression test
**File:** `src/screens/client/wearables/__tests__/ClientWearableInsightPanel.test.tsx`

Add a test that mounts the panel under dark mode and asserts that the resolved style for the Read more toggle and Retry button has a color whose contrast ratio with `bgSurface (#1C1A18)` is `≥ 4.5`. Two viable approaches:

**Option A (preferred, deterministic):** Mock `useColorScheme` from `react-native` to return `'dark'`. Render the panel with a long observation (to make Read more visible) and with an error state. Then `getByTestId('client-insight-readmore')` and `getByTestId('client-insight-retry')` (add this testID to the Retry Pressable if not present), pull `.props.style` (flattened), and assert the resolved `color` and `borderColor` clear `4.5` against `#1C1A18` using a small inline contrast helper colocated in the test file (do NOT depend on the workspace `_contrast_hk5b_r2.py` script — copy the lum/ratio formulas inline; ~10 lines).

**Option B:** Render both buckets (warm and cool) under dark mode and snapshot the resolved color values. Then assert each one has `lum(color) / lum('#1C1A18') ≥ 4.5` (with the +0.05 offsets, i.e. use the full WCAG formula).

Either approach: the test must FAIL on the pre-fix `tone.accentInk` values (`#6B4F1A` / `#2C4A36`) and PASS on the post-fix `onSurfaceInk` values. Include BOTH warm and cool buckets in the test parametrization — these have different inks.

---

### P2 — Read more overflow state can become stale on insight refetch
**File:** `src/screens/client/wearables/ClientWearableInsightPanel.tsx` (current code at lines 336–352)

Current bug: `observationOverflows` and `normOverflows` start false and are set to `true` when `onTextLayout` reports `lines.length > CLAMP_LINES`, but they are **never set back to false**. After a React Query refetch that replaces long content with short content, the booleans remain stuck `true` and `showToggle = observationOverflows || normOverflows` still shows the Read more toggle even though both texts now fit.

**Required fix:**
- Change each `onTextLayout` handler to **always** assign `e.nativeEvent.lines.length > CLAMP_LINES` (not just `true`), so the boolean tracks the current measurement.
- Add a `useEffect` keyed on `[insight?.observation, insight?.norm_comparison]` that resets `expanded` to `false` (and optionally resets the overflow booleans to `false` so the next layout pass freshly re-measures). Resetting `expanded` is the user-facing fix; resetting the booleans is a belt-and-suspenders defense.

**Required test:** Render with a long observation (triggers `observationOverflows = true` after layout simulation), then rerender with a short observation, simulate layout firing `lines.length = 2`, and assert `queryByTestId('client-insight-readmore')` is null. This guards #28 (race/stale state) per the 50-Failures sweep.

---

### P2 — Missing edge-case tests
**File:** `src/screens/client/wearables/__tests__/ClientWearableInsightPanel.test.tsx`

The R2 audit explicitly called for these and they were either not added or not covering the assertion below. Add all four:

1. **Empty `source_metrics` omission** — render with `source_metrics: []` and assert `queryByTestId('client-insight-source-metrics')` is `null`.
2. **Blank-after-trim section omission** — render with `observation: '   '` and `norm_comparison: ''` and `intervention: 'real content'`. Assert the observation/norm testIDs do NOT render, the intervention DOES render, and the EmptyPanel does NOT render (because at least one field is real).
3. **All-blank fallback to EmptyPanel** — render with all three text fields blank (whitespace-only or empty). Assert the `client-insight-empty` testID renders and no CTA/chip/Read more are present.
4. **`logger.warn` assertion for unsafe deep-link refusal** — the existing unsafe `javascript:alert(1)` test asserts `openURL` is not called but does NOT assert the warn log. Add a `jest.spyOn(logger, 'warn')` (or your project's logger — see how other tests in the file import it) and assert it was called with a message that references the rejected URL OR the unsafe-link refusal. Import path should match what the panel uses in production (`ClientWearableInsightPanel.tsx:167–174`).

---

### P3 (acceptable, do NOT change) — Skeleton omits ProvenanceRow bar
The visual auditor flagged this and explicitly marked it acceptable per the brief ("provenance is optional/supporting"). **Skip this finding** — do not add a skeleton bar for provenance.

---

## Implementation order & commits

You may use 1 or 2 commits — your call. Suggested split:

**Commit 1 (theme + panel):** `fix(wearables): HK-5b R3 — dark-mode AA via scheme-reactive onSurfaceInk + Read more stale-state reset`
- `wearablesTheme.ts` — add `onSurfaceInk` to ToneTokens, branch by colorScheme (and optionally branch `accent` for COOL dark)
- `ClientWearableInsightPanel.tsx` — wire colorScheme into tone resolution; replace `tone.accentInk` with `tone.onSurfaceInk` at lines 219/225/409; keep `tone.accentInk` at 431; add `useEffect` reset for `expanded` on insight text change; change `onTextLayout` to always assign current overflow boolean

**Commit 2 (tests):** `test(wearables): HK-5b R3 — dark-mode AA regression + stale-state + edge-case tests`
- Dark-mode AA contrast assertion for Read more + Retry (both buckets)
- Stale-state test (long→short rerender removes Read more toggle)
- Empty `source_metrics` omission
- Blank-after-trim section omission
- All-blank → EmptyPanel
- `logger.warn` assertion for unsafe deep-link

**Both commits author:** `Dynasia G <dynasia@trygrowthproject.com>` (no trailers).

---

## Mandatory verification before reporting back

Run from the repo root, capture full output:

```bash
# 1. R0 grep on additions only (must be empty)
git fetch origin main
git diff origin/main..HEAD | grep -E "^\+" | grep -v "^+++" | grep -niE 'coming soon|@ts-ignore|@ts-nocheck|as any|as unknown as|as\s+never\s+as|\bas\s+never\b|\.catch\(\s*\(\s*\)\s*=>\s*undefined\s*\)|catch\s*\([a-z_]*\)\s*\{\s*\}' || echo "R0_CLEAN"

# 2. tsc
npx tsc --noEmit 2>&1 | tail -20

# 3. eslint on touched files
npx eslint src/screens/client/wearables/ClientWearableInsightPanel.tsx src/screens/client/wearables/wearablesTheme.ts src/screens/client/wearables/__tests__/ClientWearableInsightPanel.test.tsx 2>&1 | tail -30

# 4. Jest — target the HK-5b file
npx jest --testPathPattern='ClientWearableInsightPanel' --silent 2>&1 | grep -E '^Tests:|^Test Suites:|FAIL|PASS|exit'

# 5. Jest — wearables directory level
npx jest --testPathPattern='src/screens/client/wearables' --silent 2>&1 | grep -E '^Tests:|^Test Suites:'

# 6. Confirm commit authorship & no banned trailers
git log origin/main..HEAD --format='AUTHOR=%an <%ae>%nTRAILERS=%(trailers:only=true,unfold=true)%n---'

# 7. Push
git push origin dynasia/pr-hk-5b-r3-dark-accent-ink:hk/PR-HK-5b-client-ai-panel
# (Push directly to the PR branch — this stacks on the existing PR #226)

# 8. Capture final head SHA
git rev-parse HEAD
```

## Report back format
A short report with:
- Final head SHA pushed.
- Commit titles + counts.
- R0 grep result (must be `R0_CLEAN` or empty).
- tsc / eslint / Jest counters.
- Brief description of how `onSurfaceInk` was wired (function vs constants), and whether `accent` was also branched for COOL dark.
- Confirmation of all 5 findings addressed (P1 dark-mode AA, P2 regression test, P2 stale-state, P2 missing edge tests — four sub-tests).

## Workspace context files (for reference)
- `/home/user/workspace/_audit_HK_5b_R2_code_GPT55_FRESH.md` — code audit (NEEDS_R3 verdict, P1/P2/P3 evidence)
- `/home/user/workspace/_audit_HK_5b_R2_visual_opus48_FRESH.md` — visual audit (NEEDS_R3, contrast tables)
- `/home/user/workspace/_contrast_hk5b_r3_candidates.py` — contrast script that validated `gold[300]` (9.05:1) and `brand[300]` (5.10:1) as dark-safe replacement inks

## R55 / R64 / R65 reminders
- **R55:** any reference to a SHA in commit bodies must be the full 40-char SHA.
- **R64:** commit this brief and any updates to `tgp-agent-context` within minutes of creation (already done by parent).
- **R65:** the 50-Failures sweep is required at audit time — your role is fixer, but write your commit bodies in a way that makes a 50-failures sweep easy to verify.
