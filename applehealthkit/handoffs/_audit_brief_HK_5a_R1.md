# HK-5a Mobile R1 Audit Brief (PR #225)

**Repo:** growth-project-mobile
**PR:** #225 — `hk/PR-HK-5a-coach-ai-panel`
**Head SHA:** `8b3f60a6c8e40043e7a38fdb9c909085db5f43f7`
**Worktree (code):** `/tmp/wt-hk5a-audit-r1`
**Worktree (visual):** `/tmp/wt-hk5a-audit-r1-visual`
**Base for diff:** `origin/main` (= `00f8e957...`, merged HK-3b)
**You are NOT the builder.** R31/R32 — independent audit.

## Bradley R0 LAW — every audit must enforce
- NO "Coming soon" strings anywhere in the diff (production code, comments, **test titles**, **test regex assertions**, docblocks). R0 bans apply to TEST OUTPUT too — a test that prints `'never renders the banned "Coming soon" string'` to the CI log is itself a violation.
- NO `as any`, NO `as unknown as`, NO `@ts-ignore`, NO `@ts-nocheck`.
- NO `.catch(()=>undefined)`, NO `catch(e){}`, NO empty catch blocks, NO silent failures.
- NO spinner-only loading/empty/error states.
- Author MUST be `Dynasia G <dynasia@trygrowthproject.com>` — title-only, NO Co-Authored-By, NO Generated-By.

## Mandatory documents (R65 — every audit)
- `/tmp/tgp-agent-context/quality-references/50_FAILURES_OF_AI_GENERATED_CODE.md` — sweep ALL 50 categories against the diff
- `/tmp/tgp-agent-context/quality-references/MOBILE_APP_DESIGN_INTELLIGENCE.md` — full intel sweep (visual audit only)
- `/tmp/tgp-agent-context/applehealthkit/AGENT_1_UX_PLAN.md` §4.4–4.5 — coach panel + approval flow design spec

## Builder's known deviations (verify each is acceptable)
The builder reported 3 deviations in `/home/user/workspace/_builder_result_HK_5a_coach_ai_panel.md`. Read that file. Verify each deviation:
1. Whether the test-mock additions to HK-3a/3b tab test files truly stay within scope (no behavioural change to those tabs)
2. Whether any deviation introduces an R0/R65 violation
3. Whether the "Coming soon" hygiene guard test (title + regex) violates R0 — **HINT: it does. Flag it.**

## Backend contract — verify mirroring is exact

Compare `src/api/wearableInsightsApi.ts` against backend `src/wearables/insights/insight-output.schema.ts` and `wearable-insights.controller.ts` at the current main of `growth-project-backend` (`/tmp/gpb-clone`):
- Endpoint paths
- Response Zod shapes (`.strict()`, field names, types, ranges)
- Empty branch (`is_empty: true`, exact `EMPTY_OBSERVATION` literal, length-0 source_metrics)
- Confidence enum values
- Approval endpoint contract (HK-5a stubs this — verify the 404→not_implemented coercion logic is sound and won't silently mask real errors)

## Gates to verify

```bash
cd /tmp/wt-hk5a-audit-r1
npx tsc --noEmit 2>&1 | tee /tmp/5a_r1_tsc.log; echo "EXIT $?"
npx eslint --no-error-on-unmatched-pattern \
  'src/api/wearableInsightsApi.ts' \
  'src/hooks/useWearableInsight.ts' \
  'src/screens/coach/client-detail/WearableInsightPanel.tsx' \
  'src/api/__tests__/wearableInsightsApi.test.ts' \
  'src/hooks/__tests__/useWearableInsight.test.tsx' \
  'src/screens/coach/client-detail/__tests__/WearableInsightPanel.test.tsx' \
  2>&1 | tail -10
npx jest --ci --testPathPattern='(wearableInsightsApi|useWearableInsight|WearableInsightPanel|HealthFitnessTab|SleepRecoveryTab)' 2>&1 | tail -25

# R0 ban scan on ADDED lines only
git diff origin/main..HEAD -- '*.ts' '*.tsx' | grep -E '^\+' | grep -v '^+++' | grep -niE 'coming soon|@ts-ignore|@ts-nocheck|as any|as unknown as|\.catch\(\(\) ?=> ?undefined\)|catch ?\(.\) ?\{\s*\}|catch ?\(\) ?\{\s*\}' && echo "R0 VIOLATIONS PRESENT" || echo "R0 BANS: CLEAN"

# Commit metadata scan
git log origin/main..HEAD --pretty=format:'%an <%ae>%n%B%n---'
```

## Audit-type-specific focus

### CODE audit (GPT-5.5)
- Zod schemas mirror backend exactly (especially `.strict()`, `min(1)`, `max(N)`, `nullable()` placement)
- API client error handling: every error path is surfaced to the user, not swallowed
- Mutation hook: `onError` does not silently swallow (and `onSuccess` invalidates only the right keys)
- React Query keys are versioned + bucket-scoped + clientId-scoped — no stale-cache bleed across clients
- The `MessageDraftReviewSheet` actions (Approve/Edit/Dismiss) all have proper error UI + no silent paths
- The 404→`not_implemented` coercion is type-safe (no `as any` / `as unknown as`)
- Test files use `@ts-expect-error` with justification (allowed) and never `as any`/`as unknown as`/`@ts-ignore`/`@ts-nocheck`
- The mock additions to HK-3a/3b tab test files do not weaken existing assertions
- 50-Failures sweep: catalogue which categories you actively defended against

### VISUAL audit (Opus 4.8)
- Bucket-tint accents at low saturation (cool indigo→slate for SLEEP_RECOVERY; warm for HEALTH_FITNESS)
- Progressive disclosure: collapsed state is one observation line + confidence chip; expanded state shows all four fields cleanly
- Confidence chip uses neutral pill, NOT green-for-good
- Loading: skeleton (3 lines + chip placeholder), NOT spinner-only
- Empty: literal copy + secondary guidance line, NO chip, NO spinner
- Error: sanitized copy per status code (403/5xx differentiation), retry button
- Review sheet: textarea editable, three actions visible, dismiss is ghost not destructive-red
- Sheet error states: 404-coerced "rolling out" copy, calm — not alarming
- Forward hook after success: "Sent to <name>" briefly, then auto-revert
- Accessibility: accessibilityLabel + accessibilityState expanded; reduceMotion honored
- Token usage: NO hex literals; reuses HK-3a/3b bucket tokens
- Diff scope: tight, no unrelated UI mass refactor

## Audit output

Write to `/home/user/workspace/_audit_HK_5a_R1_code_GPT55.md` (code) or `_audit_HK_5a_R1_visual_opus48.md` (visual). Use the format:

```
# HK-5a R1 Audit — <code GPT-5.5 | visual Opus 4.8>

**Head SHA:** 8b3f60a6c8e40043e7a38fdb9c909085db5f43f7
**Verdict:** CLEAN | NEEDS_FIX

## Gate results
...

## Findings
### P<1|2|3> — <Title>
- File: <path:line>
- Issue: <one sentence>
- Evidence: <quote or grep output>
- Fix: <one-line directive>

## 50-Failures sweep (R65)
[list categories actively checked]

## Mobile Design Intel sweep (visual only)
[list sections actively checked]
```

Verdict CLEAN only if zero P1/P2 issues.

## Constraints
- DO NOT modify code. Audit only.
- DO NOT push to the PR branch.
- Use `api_credentials=["github"]` for any git fetch. Do not print `$GITHUB_TOKEN`.
