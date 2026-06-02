# HK-5a R2 Audit Brief

**Target PR:** #225 — `hk/PR-HK-5a-coach-ai-panel` (growth-project-mobile)
**HEAD SHA (R2):** `aad8931848c701720a6f1ca68436d2c66501e694`
**Diff base:** `origin/main` (`00f8e9574661e3f5d774882732559cdf3c5ae8ec`)
**Auditor role:** R31/R32 — auditor ≠ builder. You are a FRESH independent instance. The R2 fixer was Opus 4.8. The previous R1 audit (yours or another instance's) is at `/home/user/workspace/_audit_HK_5a_R1_{code_GPT55,visual_opus48}.md` — read it ONLY to know what to re-verify; do not rubber-stamp.

## Bradley R0 LAW (re-state, verify)

- NO "Coming soon" literal anywhere in the diff — production, tests, comments, **test titles**, **regex assertions**, docblocks.
- NO `@ts-ignore` / `@ts-nocheck` / `as any` / `as unknown as` / `.catch(() => undefined)` / empty-catch / spinner-only empty states.
- `@ts-expect-error` with justification IS allowed.

## Required gates (run all; report exit codes)

In your assigned worktree (code → `/tmp/wt-hk5a-audit-r2`, visual → `/tmp/wt-hk5a-audit-r2-visual`):

```bash
cd <your-worktree>
git rev-parse HEAD                                       # must be aad8931848c701720a6f1ca68436d2c66501e694
git log -1 --format='%an <%ae>%n%B'                      # must be Dynasia G <dynasia@trygrowthproject.com>, title-only

npx tsc --noEmit                                          # exit 0
npx eslint <touched files>                                # exit 0 (use git diff --name-only origin/main..HEAD to enumerate)
npx jest --testPathPattern='(WearableInsightPanel|useWearableInsight|HealthFitnessTab|SleepRecoveryTab|wearableInsightsApi)' --runInBand
   # exit 0; NO "Jest did not exit one second after the test run has completed" warning

# R0 added-line sweep (CRITICAL — full diff has false positives from removed lines):
git diff origin/main..HEAD -- '*.ts' '*.tsx' | grep '^+' | grep -v '^+++' \
  | grep -niE 'coming soon|@ts-ignore|@ts-nocheck|as any|as unknown as|\.catch\(\(\) => undefined\)|catch\s*\([a-z_]*\)\s*\{\s*\}'
   # MUST return empty (grep exit 1)
```

## What R2 changed vs R1 (verify each)

The R2 fixer claims:

- **F1**: deleted the entire `describe('R0 hygiene', ...)` block in `WearableInsightPanel.test.tsx`. Verify it's gone AND the file's other 11 tests still pass.
- **F2**: added `accentInk` field to `ToneTokens` in `wearablesTheme.ts` (`WARM.accentInk = gold[700]` ≈ `#8A6A2A`; `COOL.accentInk = colors.forest`). Verify the new field exists and is correctly threaded.
- **F3**: replaced `tone.accent` with `tone.accentInk` for **all on-light text/links** in `WearableInsightPanel.tsx` — `readMore`, error/sheet `Retry`, sheet `Edit then send` enabled label, primary CTA fill. Icons + chip-border alpha must STILL be `tone.accent`. Compute the contrast yourself for at least one warm-bucket text and one warm-bucket CTA fill — both must be ≥4.5:1 vs the surface they sit on.
- **F4**: review-sheet retry replays the EXACT last-attempted `{action, draftBody}` via a `useRef`. Verify in source AND that 3 new tests cover approve-after-edit, dismiss-error retry, and edit-error retry. Confirm a `!busy` race guard.
- **F5**: `useWearableInsight.test.tsx` cleans up the `QueryClient` (per-test `qc.clear()` + `qc.unmount()` in `afterEach`) and disables RQ v5 mutation `gcTime`. Confirm no `--forceExit` was added to any Jest config. Run the test in isolation and confirm clean exit (no "did not exit" warning).
- **F6**: `charCount` color is now `colors.charcoal` (not `colors.stone`). Verify.
- **F7**: `insightQueryKeys.coach/client` include a `'v1'` segment (via `INSIGHT_KEY_VERSION` constant). Verify hook tests still pass against the helper.

## Independent checks beyond F1–F7

- **Diff scope discipline:** `git diff --stat origin/main..HEAD` — only the expected files should appear (panel, theme, api, hook, panel tests, hook tests, two tab one-line mounts + their tests). No unrelated refactor, no node_modules pollution.
- **Backend contract parity:** mobile schemas (CoachInsight, ClientInsight, EmptyInsight, confidence enum, source-metric enum, `.strict()`, max lengths) still match backend `/tmp/gpb-clone/src/wearables/insights/insight-output.schema.ts`. Endpoints `/v1/wearables/insights/coach` and `/v1/wearables/insights/client` only.
- **No new R0 violations introduced by the F1–F7 patches.**
- **50-Failures sweep (R65):** actively walk through each of the 50 categories in `/tmp/tgp-agent-context/quality-references/50_FAILURES_OF_AI_GENERATED_CODE.md`. Pay special attention to #5 (IDOR — F4 must not weaken auth gating), #12 (error sanitization still wraps), #25/#19 (versioned key change doesn't bleed stale cache cross-version), #28 (race: ref-based retry must be guarded against re-entry while a mutation is in-flight), #32 (unmount cleanup), #48 (jest gate now exits cleanly).
- **MOBILE_APP_DESIGN_INTELLIGENCE sweep (visual auditor):** §1.2 Visceral/Behavioral, §2.2 CALM, §4.5 Progressive Disclosure, §4.7 Color semantics, §5.1 Step 6/7 forward hook, accessibility, **WCAG AA contrast** (this is the main R1→R2 fix; verify every text/CTA pair on both warm and cool buckets).

## Verdict

Report **CLEAN** only if:
- All gates exit 0 (jest must exit cleanly — no "did not exit" warning).
- R0 added-line sweep is empty.
- All F1–F7 fixes verified.
- 50-Failures sweep has no P1/P2 finding.
- (Visual only) every text/CTA pair on the warm bucket is ≥4.5:1 contrast vs its surface.

Otherwise report **NEEDS_FIX** with the specific findings labelled P1/P2/P3 and file/line evidence.

## Output

Write your audit to:
- **Code (GPT-5.5):** `/home/user/workspace/_audit_HK_5a_R2_code_GPT55.md`
- **Visual (Opus 4.8 fresh):** `/home/user/workspace/_audit_HK_5a_R2_visual_opus48.md`

Begin.
