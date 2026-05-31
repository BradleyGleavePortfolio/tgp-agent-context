# PR-HK-4 R5 Audit — AI insights foundation (rebased)

- **Repo:** `growth-project-backend`
- **PR:** #348 — `feat(wearables): PR-HK-4 — embedded AI insights foundation`
- **Audited head SHA:** `e01018433e2e4bf09fcc5a3f15e5b916b77df7ca`
- **Prior clean R3 head:** `2563193466f22398e265eb1fa53ee89aef9722f5`
- **Base SHA:** `8cfb44f6f8a8faed00c527c21481beb80e0ec761` (`origin/main` at audit time)
- **Auditor:** R5 rebase auditor
- **Verdict:** **CLEAN — rebase-only conflict resolution verified; no new findings**

## Scope and method

Pinned review was performed against `e01018433e2e4bf09fcc5a3f15e5b916b77df7ca`. I first refreshed `hk/PR-HK-4-ai-insights-foundation` in `/home/user/workspace/repos/growth-project-backend` and verified the branch head, then used an isolated detached worktree at `/home/user/workspace/repos/growth-project-backend-pr-hk4-r5-e0101843` for authoritative reads and gates so shared worktree movement could not affect the result.

Commands/evidence captured:

- `git rev-parse HEAD`
- `git diff --name-status origin/main...HEAD`
- `git diff --stat origin/main...HEAD`
- `git diff 2563193466f22398e265eb1fa53ee89aef9722f5 e01018433e2e4bf09fcc5a3f15e5b916b77df7ca -- src/ai-credits/ai-credits.constants.ts src/wearables/insights src/wearables/wearables.module.ts`
- `git diff 2563193466f22398e265eb1fa53ee89aef9722f5:src/wearables/wearables.module.ts HEAD:src/wearables/wearables.module.ts`
- line-number read of `src/wearables/wearables.module.ts`
- commit identity/trailer scan across `origin/main..HEAD`
- 5 required gates; logs saved under `audits/HK_wave/artifacts/PR-HK-4_R5/`

Diff vs current `origin/main` remains limited to the PR-HK-4 write-set plus the justified budget-registry extension:

- `src/ai-credits/ai-credits.constants.ts` — modified, additive budget registry entries for PR-HK-4 capabilities
- `src/wearables/insights/guardrails.spec.ts`
- `src/wearables/insights/guardrails.ts`
- `src/wearables/insights/insight-cache.service.spec.ts`
- `src/wearables/insights/insight-cache.service.ts`
- `src/wearables/insights/insight-output.schema.spec.ts`
- `src/wearables/insights/insight-output.schema.ts`
- `src/wearables/insights/insights.module.ts`
- `src/wearables/insights/norm-comparison.util.spec.ts`
- `src/wearables/insights/norm-comparison.util.ts`
- `src/wearables/insights/prompts/client-hf.prompt.ts`
- `src/wearables/insights/prompts/client-sr.prompt.ts`
- `src/wearables/insights/prompts/coach-hf.prompt.ts`
- `src/wearables/insights/prompts/coach-sr.prompt.ts`
- `src/wearables/insights/wearable-insights.controller.spec.ts`
- `src/wearables/insights/wearable-insights.controller.ts`
- `src/wearables/insights/wearable-insights.service.spec.ts`
- `src/wearables/insights/wearable-insights.service.ts`
- `src/wearables/wearables.module.ts` — additive module import/export union only

No Prisma schema, `src/ai/`, or out-of-scope non-wearables files are changed in the rebased PR diff.

## Rebase verification

**Status:** **CLEAN**

Evidence:

- Target branch `hk/PR-HK-4-ai-insights-foundation` was force-refreshed from the remote and verified at `e01018433e2e4bf09fcc5a3f15e5b916b77df7ca`.
- `origin/main...HEAD` uses merge-base `8cfb44f6f8a8faed00c527c21481beb80e0ec761` and reports the same bounded 19-file PR-HK-4 write-set listed above.
- Drift check from prior clean R3 SHA to rebased R5 SHA across PR-HK-4 files reports only `M src/wearables/wearables.module.ts`; the non-module diffstat for `src/ai-credits/ai-credits.constants.ts` and `src/wearables/insights/` is empty.
- The module diff vs R3 preserves the R3 `InsightsModule` wiring while adding current-main `ConnectionsModule`, `OauthModule`, and `ConnectorRegistry` wiring from PR-HK-1. This is the expected union conflict resolution.

Conclusion: the rebase introduced only the expected `src/wearables/wearables.module.ts` union-resolution change relative to the previously clean R3 PR code.

## Module resolution verification

**Status:** **CLEAN**

Evidence from `src/wearables/wearables.module.ts` at `e01018433e2e4bf09fcc5a3f15e5b916b77df7ca`:

- Lines 4-7 import `ConnectionsModule`, `OauthModule`, `ConnectorRegistry`, and `InsightsModule`.
- Line 49 imports all three modules in Nest metadata: `[ConnectionsModule, OauthModule, InsightsModule]`.
- Lines 51-58 export `IngestionService`, `ProviderHttpClient`, `ConnectionsModule`, `OauthModule`, `ConnectorRegistry`, and `InsightsModule`.
- `npx tsc --noEmit` passed on the pinned worktree, so the rebased file parses and type-checks.

Conclusion: the rebased module imports and exports all required modules, preserves `ConnectorRegistry`, and parses correctly.

## R3 finding carry-forward

R3 already verified all R1 blocking findings as fixed at `2563193466f22398e265eb1fa53ee89aef9722f5`. Because R5 drift verification shows no changes to `src/ai-credits/ai-credits.constants.ts` or `src/wearables/insights/` relative to R3, the R3 clean finding status carries forward:

1. Budget enforcement for wearable insight capabilities — **FIXED**
2. Strict exact-field schemas — **FIXED**
3. Empty fallback violates `source_metrics` contract — **FIXED**
4. `toBeDefined` assertions — **FIXED**

## Regression checks

### Test count

`npx jest --roots src/wearables --runInBand` on the rebased branch reports:

- **23 test suites passed**
- **366 tests passed**
- **0 snapshots**

The count is higher than R3 because current `origin/main` now includes the sibling wearables connector work; all included wearables suites pass with PR-HK-4 rebased on top.

### Commit hygiene

Commits from `origin/main..e01018433e2e4bf09fcc5a3f15e5b916b77df7ca`:

1. `5754bb9` — `feat(wearables): PR-HK-4 — insight output schema + guardrails + norm comparison`
2. `e0013ff` — `feat(wearables): PR-HK-4 — prompt templates (coach/client × HF/SR)`
3. `2603530` — `feat(wearables): PR-HK-4 — insight cache service`
4. `ff00e8c` — `feat(wearables): PR-HK-4 — insights service + controller + module`
5. `19190b0` — `fix(wearables): PR-HK-4 — strict() on Coach/Client insight schemas`
6. `2e37e7b` — `fix(wearables): PR-HK-4 — EmptyInsight union for fallback (no schema violation)`
7. `e010184` — `fix(wearables): PR-HK-4 — budget enforcement for wearable_insight.coach/client`

All 7 commits have author and committer `Dynasia G <dynasia@trygrowthproject.com>`. Trailer/co-author scan returned no trailers or co-authors.

### Diff / file hygiene

`git diff --stat origin/main...HEAD` shows 19 files changed, 2817 insertions, 1 deletion. The diff is the expected PR-HK-4 `src/wearables/insights/` addition, additive registration in `src/wearables/wearables.module.ts`, and additive `src/ai-credits/ai-credits.constants.ts` budget-registry extension. I found no out-of-scope edits.

## Gates

All 5 required gates passed at `e01018433e2e4bf09fcc5a3f15e5b916b77df7ca`.

| Gate | Result | Log |
| --- | --- | --- |
| `DATABASE_URL=... DIRECT_URL=... npx prisma validate` | PASS — schema valid | `audits/HK_wave/artifacts/PR-HK-4_R5/prisma_validate.log` |
| `DATABASE_URL=... DIRECT_URL=... npx prisma generate` | PASS — Prisma Client v6.19.3 generated | `audits/HK_wave/artifacts/PR-HK-4_R5/prisma_generate.log` |
| `NODE_OPTIONS=--max-old-space-size=4096 npx tsc --noEmit` | PASS — exit 0, no output | `audits/HK_wave/artifacts/PR-HK-4_R5/tsc.log` |
| `npx eslint src/wearables/` | PASS — exit 0, no output | `audits/HK_wave/artifacts/PR-HK-4_R5/eslint_wearables.log` |
| `npx jest --roots src/wearables --runInBand` | PASS — 23 suites, 366 tests | `audits/HK_wave/artifacts/PR-HK-4_R5/jest_wearables.log` |

## New findings

None.

## Final verdict

**CLEAN — approve R5.** The rebased SHA `e01018433e2e4bf09fcc5a3f15e5b916b77df7ca` preserves the prior clean R3 PR code, introduces only the expected `src/wearables/wearables.module.ts` union-resolution change, keeps the branch diff bounded, passes all required gates, and preserves commit hygiene.
