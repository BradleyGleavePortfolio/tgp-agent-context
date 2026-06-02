# HK-5a R3 — Independent Visual/Design Audit

**Auditor:** Opus 4.8 — FRESH instance (independent of any build/fix round, per R31/R32)
**Role:** R3 INDEPENDENT VISUAL/DESIGN AUDITOR
**Branch:** `hk/PR-HK-5a-coach-ai-panel`
**Diff base:** `origin/main`
**Worktree:** `/tmp/wt-hk5a-audit-r2-visual` (re-fetched to R3 SHA)

---

## VERDICT: ✅ CLEAN

Every contrast pair ≥ 4.5:1, all gates pass, R0 sweep empty, and the diff scope is exactly the single token-swap file. No P1/P2/P3 issues found.

---

## 1. Gate Results

| Gate | Expected | Actual | Result |
|------|----------|--------|--------|
| `git rev-parse HEAD` | `6293731bdc70fab3a2e6b0eb2119373d913712dd` | `6293731bdc70fab3a2e6b0eb2119373d913712dd` | ✅ |
| Commit author | Dynasia G, title-only | `Dynasia G <dynasia@trygrowthproject.com>` — `fix(wearables): HK-5a R3 — bump warm accentInk to gold[800] for AA contrast` | ✅ |
| R0 added-line sweep | empty | empty (grep exit 1) | ✅ |
| Diff scope (R2→R3) | only `wearablesTheme.ts` | `src/screens/client/wearables/wearablesTheme.ts` — 1 file, +5/-2 | ✅ |
| `tsc --noEmit` | exit 0 | exit 0 | ✅ |
| jest (5 suites) | exit 0, 5 suites / 37 tests, no "did not exit" | exit 0, **5 passed / 37 passed**, no exit warning | ✅ |

### R0 sweep command (verbatim, returned empty)
```
git diff origin/main..HEAD -- '*.ts' '*.tsx' | grep '^+' | grep -v '^+++' \
  | grep -niE 'coming soon|@ts-ignore|@ts-nocheck|as any|as unknown as|\.catch\(\(\) => undefined\)|catch\s*\([a-z_]*\)\s*\{\s*\}'
→ (no output; grep exit 1)
```

### R3 diff (verbatim, matches the task patch exactly)
```diff
--- a/src/screens/client/wearables/wearablesTheme.ts
+++ b/src/screens/client/wearables/wearablesTheme.ts
@@ -38,7 +38,8 @@ export interface ToneTokens {
-   * resolves to gold[700] (#8A6A2A ≈ 5.10:1 bone); cool to forest (8.57:1).
+   * resolves to gold[800] (#6B4F1A — 6.65:1 bone / 6.25:1 cream); cool to
+   * forest (8.57:1).
@@ -51,7 +52,9 @@ const WARM: ToneTokens = {
-  accentInk: gold[700], // #8A6A2A — bone-on-fill ≈ 5.10:1 (AA PASS)
+  // AA-safe (6.65:1 on bone / 6.25:1 on cream) — used as on-light text/link colour
+  // AND as filled-CTA background behind bone text.
+  accentInk: gold[800], // #6B4F1A
```

---

## 2. Independent Contrast Computation (WCAG 2.1)

Method: sRGB → linear (`c/12.92` if ≤0.04045 else `((c+0.055)/1.055)^2.4`), relative luminance `0.2126R + 0.7152G + 0.0722B`, ratio `(L1+0.05)/(L2+0.05)`. Computed from scratch in `/tmp/wt-hk5a-audit-r2-visual/contrast_audit.py`.

**Verified palette constants (read from source, not assumed):**
- `gold[800] = #6B4F1A` (`src/theme/tokens.ts:127`) — new `accentInk` for WARM
- `bone = #F5EFE4` (`tokens.ts:32`, `colors.ts:16`)
- `cream = #F1E8D5` (`tokens.ts:33`, `colors.ts:17`)
- `camel = #B08D57` (`tokens.ts`) — `tint = withAlpha(camel, 0.1)`
- `forest = #2C4A36` (`tokens.ts:39`) — WARM unchanged; COOL `accentInk`
- 10%-camel-on-bone card tint composited = **`#EEE5D6`** (L=0.79071)

### WARM bucket — accentInk = gold[800] #6B4F1A (R3)

| Pair | Usage site | Ratio | ≥4.5:1 |
|------|-----------|-------|--------|
| bone text on `#6B4F1A` CTA fill | `primaryBtnText` (color `bone`) over `backgroundColor: accentInk` — `WearableInsightPanel.tsx:516,528,748` | **6.65:1** | ✅ |
| `#6B4F1A` text on bone | Edit-then-send enabled `secondaryBtnText` (`:547`), sheet Retry | **6.65:1** | ✅ |
| `#6B4F1A` text on cream | readMore (`:286`), error Retry (`:508`) | **6.25:1** | ✅ |
| `#6B4F1A` text on 10%-camel card (`#EEE5D6`) | card body | **6.10:1** | ✅ |

### COOL bucket — accentInk = forest #2C4A36 (regression check)

| Pair | Ratio | ≥4.5:1 |
|------|-------|--------|
| forest on bone | **8.57:1** | ✅ |
| forest on cream | **8.06:1** | ✅ |
| bone on forest fill | **8.57:1** | ✅ |
| forest on 10%-camel card | **7.86:1** | ✅ |

Cool bucket still passes — matches the inline comment claim (8.57:1 bone / 8.06:1 cream).

### Comment-accuracy cross-check
The new inline comments claim **6.65:1 bone / 6.25:1 cream** — my independent math reproduces those numbers to the hundredth. The comments are accurate.

### Note on the prior R2 value (validates the fix was necessary)
My independent computation of the old `gold[700] #8A6A2A`:
- on bone: **4.39:1** — **FAIL** (the R2 comment claimed "≈5.10:1 AA PASS" — that claim was wrong)
- on cream: **4.13:1** — FAIL
- bone on fill: 4.39:1 — FAIL
- on 10% card: 4.03:1 — FAIL

So gold[700] was genuinely sub-AA on every warm surface; the R3 swap to gold[800] correctly resolves it. Good catch by the fix author; the old self-reported ratio was optimistic.

---

## 3. R2 Fixes Still In Place (untouched by R3)

The diff-scope gate proves R3 touched **only** `wearablesTheme.ts`, so every R2 fix is structurally intact. Confirmed by inspection:

| Fix | Evidence | Status |
|-----|----------|--------|
| F1 — coming-soon hygiene test dropped | No coming-soon hygiene *test* in wearables suite; doctrine test `quietLuxuryDoctrine.test.ts` is the standing one, unrelated | ✅ intact |
| F4 — retry tests | `WearableInsightPanel.test.tsx:113` ("renders sanitized error copy + Retry, and retry refetches"), `:235` (thrown-error retry); both pass | ✅ intact |
| F5 — jest exits cleanly | jest run produced **no "did not exit / force exit / open handle"** warning | ✅ intact |
| F6 — char count / maxLength | `maxLength` enforced on inputs (e.g. `AskAiActionSheet.tsx:255,275`) | ✅ intact |
| F7 — versioned query keys | `INSIGHT_KEY_VERSION = 'v1'` baked into every key (`wearableInsightsApi.ts:235,240,242`) | ✅ intact |

---

## 4. 50-Failures Relevant Subset

R3 moved a single constant value (no behaviour change). Confirmed unaffected:

- **#5 IDOR** — `clientId` still threaded through to `useCoachInsight` and server-authed endpoints (`WearableInsightPanel.tsx:116,309`; `wearableInsightsApi.ts` `/v1/.../coach`). Token swap doesn't touch auth. ✅
- **#12 sanitization** — `sanitizeError()` (`WearableInsightPanel.tsx:85`, `:206`) unchanged; error copy still sanitized. ✅
- **#28 race** — query-key/refetch logic in `wearableInsightsApi.ts` untouched; retry test passes. ✅
- **#32 unmount** — `cancelled` mounted-guard in `useReduceMotion.ts:24,28,36,42,47` intact. ✅
- **#48 CI** — no `.yml/.yaml/jest/workflow/package.json` in the R3 diff; CI config untouched. ✅

---

## 5. Test Run Detail

```
Test Suites: 5 passed, 5 total
Tests:       37 passed, 37 total
Snapshots:   0 total
JEST_EXIT=0
```
Suites: `WearableInsightPanel`, `useWearableInsight`, `HealthFitnessTab`, `SleepRecoveryTab`, `wearableInsightsApi`.

The only console output was pre-existing `act(...)` warnings from `useReduceMotion`'s async `AccessibilityInfo` probe — not test failures, unrelated to R3, and not the targeted contrast change.

---

## Conclusion

**CLEAN.** The R3 one-token swap (`accentInk` WARM: `gold[700]` → `gold[800]` = `#6B4F1A`) raises every warm on-light / CTA-fill pairing from sub-AA (≈4.0–4.4:1) to comfortably AA (6.10–6.65:1). Cool bucket regression-checked (7.86–8.57:1). Gates green, R0 empty, diff scope exactly one file, all R2 fixes preserved, and the security/race/CI failure modes are unaffected by a constant-value move.
