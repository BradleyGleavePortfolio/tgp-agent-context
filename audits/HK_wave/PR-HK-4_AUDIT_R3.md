# PR-HK-4 R3 Audit — AI insights foundation

- **Repo:** `growth-project-backend`
- **PR:** #348 — `feat(wearables): PR-HK-4 — embedded AI insights foundation`
- **Audited head SHA:** `2563193466f22398e265eb1fa53ee89aef9722f5`
- **Previous R1 head:** `d21b999ffadddc6e6cbee2aec955f536825c544a`
- **Base SHA:** `9c67444c2be6bb712509ef379e43f6f29a289570`
- **Auditor:** R3 re-auditor
- **Verdict:** **PASS — all R1 blocking findings fixed; no new findings**

## Scope and method

Pinned review was performed against `2563193466f22398e265eb1fa53ee89aef9722f5`. Because the shared backend worktree was being moved by other HK review activity, I created and used an isolated detached worktree pinned to the target SHA for all file reads and gates.

Commands/evidence captured:

- `git diff 9c67444c..HEAD --stat`
- `git diff --name-status 9c67444c..HEAD`
- `git diff --name-status d21b999ffadddc6e6cbee2aec955f536825c544a..HEAD`
- `grep -R -n "COACH_AI_METERED_CAPABILITIES" src/ai/gateway/`
- line-number reads of the changed schema/service/controller/spec files
- 5 required gates; logs saved under `audits/HK_wave/artifacts/PR-HK-4_R3/`

Diff vs base is limited to the PR-HK-4 write-set plus the justified budget-registry extension:

- `src/ai-credits/ai-credits.constants.ts` — **modified**, additive budget registry entries for PR-HK-4 capabilities
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
- `src/wearables/wearables.module.ts` — additive module import/export only

No `src/ai/`, Prisma schema, PR-HK-1 connection files, or PR-HK-2 connector files are changed in this pinned PR diff.

## R1 finding verification

### R1 #1 — Budget enforcement for wearable insight capabilities

**Status:** **FIXED**

Evidence:

- `src/ai-credits/ai-credits.constants.ts:39-58` now includes both wearable insight capabilities in `COACH_AI_METERED_CAPABILITIES`:
  - `wearable_insight.coach` at line 56
  - `wearable_insight.client` at line 57
- The change to `src/ai-credits/ai-credits.constants.ts` is additive relative to both base and R1 head. The only code additions are the two new set entries; the remaining added lines are explanatory comments. No existing capability string was edited, removed, or reordered.
- `grep -R -n "COACH_AI_METERED_CAPABILITIES" src/ai/gateway/` shows the gateway gates on this exact set at:
  - `src/ai/gateway/ai-gateway.service.ts:192` — pre-call `canCharge` budget gate
  - `src/ai/gateway/ai-gateway.service.ts:289` — post-call `recordUsage` path
- `src/ai/gateway/ai-gateway.service.ts:185-200` resolves the budget coach id, requires `resolved.enabled`, and calls `this.budget.canCharge(...)` only when `COACH_AI_METERED_CAPABILITIES.has(req.capability)` is true.
- `src/ai/gateway/ai-gateway.service.ts:285-299` records usage only when budget exists, budget coach id resolved, the provider response was enabled, no provider error occurred, and `COACH_AI_METERED_CAPABILITIES.has(req.capability)` is true.
- `src/wearables/insights/wearable-insights.service.ts:102-140` passes `COACH_INSIGHT_CAPABILITY` / `CLIENT_INSIGHT_CAPABILITY` into the shared generator, and `src/wearables/insights/wearable-insights.service.ts:254-275` invokes `this.gateway.invoke(...)` with that capability, requester, subject user id, and tenant coach id. I found no direct provider, Anthropic, OpenAI, `AiService.chat`, or other LLM bypass in `src/wearables/insights/`.
- `src/wearables/insights/wearable-insights.service.spec.ts:317-336` adds the 3 metering tests described in the R2 build report: coach capability is metered, client capability is metered, and both exported service capability constants equal the exact gateway-metered strings.

Conclusion: the prior bypass is closed by activating the existing gateway budget predicate for both wearable capabilities, without duplicating budget behavior in the wearables service.

### R1 #2 — Strict exact-field schemas

**Status:** **FIXED**

Evidence:

- `src/wearables/insights/insight-output.schema.ts:53-62` defines `CoachInsightSchema` as a Zod object ending in `.strict()`.
- `src/wearables/insights/insight-output.schema.ts:73-87` defines `ClientInsightSchema` as a Zod object ending in `.strict()`.
- `src/wearables/insights/insight-output.schema.spec.ts:47-54` rejects an unknown coach key.
- `src/wearables/insights/insight-output.schema.spec.ts:56-64` rejects client-only fields (`norm_comparison`, `intervention`, `optional_cta`) smuggled onto a coach payload.
- `src/wearables/insights/insight-output.schema.spec.ts:77-84` rejects an unknown client key.
- `src/wearables/insights/insight-output.schema.spec.ts:86-94` rejects coach-only fields (`hypothesis`, `suggested_action`, `suggested_message_draft`) smuggled onto a client payload.

Conclusion: strict exact-field validation is now enforced and covered by negative tests for unknown keys and cross-audience smuggling.

### R1 #3 — Empty fallback violates `source_metrics` contract

**Status:** **FIXED**

Evidence:

- `src/wearables/insights/insight-output.schema.ts:148-155` defines `EmptyInsightSchema` as a strict schema with:
  - `observation: z.literal(EMPTY_OBSERVATION)`
  - `confidence_level: z.literal('i_think')`
  - `source_metrics: z.array(SourceMetricSchema).length(0)`
  - `is_empty: z.literal(true)`
  - `.strict()`
- `src/wearables/insights/insight-output.schema.ts:162-165` defines `CoachInsightResponseSchema = z.union([CoachInsightSchema, EmptyInsightSchema])`.
- `src/wearables/insights/insight-output.schema.ts:168-171` defines `ClientInsightResponseSchema = z.union([ClientInsightSchema, EmptyInsightSchema])`.
- `src/wearables/insights/insight-output.schema.ts:182-189` provides a single `emptyInsight()` factory returning the explicit empty branch.
- `src/wearables/insights/wearable-insights.service.ts:181-188` returns stale cache or `emptyInsight()` on initial gateway failure/timeout.
- `src/wearables/insights/wearable-insights.service.ts:198-203` returns stale cache or `emptyInsight()` when the repair call fails.
- `src/wearables/insights/wearable-insights.service.ts:205-211` returns stale cache or `emptyInsight()` when repaired output is still invalid.
- `src/wearables/insights/wearable-insights.service.ts:219-225` returns stale cache or `emptyInsight()` when guardrails reject model output.
- Search found no remaining `emptyCoachInsight`, `emptyClientInsight`, `as CoachInsight`, or `as ClientInsight` fallback casts in implementation code. The only implementation `source_metrics: []` is inside `emptyInsight()`.
- `src/wearables/insights/wearable-insights.controller.ts:73-77` validates coach responses through `CoachInsightResponseSchema.parse(payload)`.
- `src/wearables/insights/wearable-insights.controller.ts:91-94` validates client responses through `ClientInsightResponseSchema.parse(payload)`.
- `src/wearables/insights/insight-output.schema.spec.ts:97-157` covers the empty schema, length-0 `source_metrics`, strict unknown-key rejection, and union acceptance.
- `src/wearables/insights/wearable-insights.service.spec.ts:226-243`, `:257-275`, and `:303-314` assert degraded outputs validate as the strict empty state and do not leak audience-specific fields.
- `src/wearables/insights/wearable-insights.controller.spec.ts:174-186` asserts the controller accepts and passes through the strict empty-state branch.

Conclusion: fallback responses are now modeled as a separate strict empty response branch and validated at the controller boundary.

### R1 #4 / original P2 — `toBeDefined` assertions

**Status:** **FIXED**

Evidence:

- Search across all files changed by `git diff --name-only 9c67444c..HEAD` found **zero** `toBeDefined` occurrences.
- The former service assertions have been replaced with exact value/shape checks, e.g. `src/wearables/insights/wearable-insights.service.spec.ts:155-174` and `:184-194`.

Conclusion: the “NO `toBeDefined`” requirement is satisfied in the PR-HK-4 write-set.

## Regression checks

### Test count

`npx jest --roots src/wearables --runInBand` reports:

- **9 test suites passed**
- **146 tests passed**
- **0 snapshots**

This matches the R2 build report claim and is +25 tests over the R1 audit's 121-test baseline.

### Commit hygiene

Commits from `9c67444c..2563193466f22398e265eb1fa53ee89aef9722f5`:

1. `ac802b2` — `feat(wearables): PR-HK-4 — insight output schema + guardrails + norm comparison`
2. `032b8f3` — `feat(wearables): PR-HK-4 — prompt templates (coach/client × HF/SR)`
3. `97f46bc` — `feat(wearables): PR-HK-4 — insight cache service`
4. `d21b999` — `feat(wearables): PR-HK-4 — insights service + controller + module`
5. `a44a0f9` — `fix(wearables): PR-HK-4 — strict() on Coach/Client insight schemas`
6. `cf3546e` — `fix(wearables): PR-HK-4 — EmptyInsight union for fallback (no schema violation)`
7. `2563193` — `fix(wearables): PR-HK-4 — budget enforcement for wearable_insight.coach/client`

All 7 commits have author and committer `Dynasia G <dynasia@trygrowthproject.com>`. Commit bodies are empty (`%b`), and trailer scan returns no trailers.

### Diff / file hygiene

`git diff 9c67444c..HEAD --stat` shows 19 files changed, 2815 insertions, 1 deletion. The diff is the expected PR-HK-4 `src/wearables/insights/` addition, additive registration in `src/wearables/wearables.module.ts`, and the justified additive `src/ai-credits/ai-credits.constants.ts` budget-registry extension. I found no edits to `src/ai/`, `prisma/schema.prisma`, PR-HK-1 connection code, or PR-HK-2 connector code.

## Gates

All 5 required gates passed at `2563193466f22398e265eb1fa53ee89aef9722f5`.

| Gate | Result | Log |
| --- | --- | --- |
| `DATABASE_URL=... DIRECT_URL=... npx prisma validate` | PASS — schema valid | `audits/HK_wave/artifacts/PR-HK-4_R3/prisma_validate.log` |
| `DATABASE_URL=... DIRECT_URL=... npx prisma generate` | PASS — Prisma Client v6.19.3 generated | `audits/HK_wave/artifacts/PR-HK-4_R3/prisma_generate.log` |
| `NODE_OPTIONS=--max-old-space-size=4096 npx tsc --noEmit -p tsconfig.json` | PASS — exit 0, no output | `audits/HK_wave/artifacts/PR-HK-4_R3/tsc.log` |
| `npx eslint src/wearables/` | PASS — exit 0, no output | `audits/HK_wave/artifacts/PR-HK-4_R3/eslint_wearables.log` |
| `npx jest --roots src/wearables --runInBand` | PASS — 9 suites, 146 tests | `audits/HK_wave/artifacts/PR-HK-4_R3/jest_wearables.log` |

## New findings

None.

## Final verdict

**PASS — approve R3.** All R1 blocking findings are fixed at `2563193466f22398e265eb1fa53ee89aef9722f5`, the P2 `toBeDefined` issue is fixed, the regression gates pass, and I found no new findings.
