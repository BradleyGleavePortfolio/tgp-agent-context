# PR-HK-4 R1 Audit — AI insights foundation

- **Repo:** `growth-project-backend`
- **PR:** #348 — `feat(wearables): PR-HK-4 — embedded AI insights foundation`
- **Audited head SHA:** `d21b999ffadddc6e6cbee2aec955f536825c544a`
- **Base SHA:** `9c67444c`
- **Auditor:** R1
- **Verdict:** **FAIL — request changes**

## Scope and method

Pinned checkout verified at `d21b999ffadddc6e6cbee2aec955f536825c544a`. I read the full PR write-set: all 16 files under `src/wearables/insights/` plus the additive edit to `src/wearables/wearables.module.ts`. I also checked the PR-HK-4 build report, the existing `WearableInsightCache` schema/invalidation path, and the AI gateway budget/audit implementation that the PR claims to reuse.

The diff is limited to the expected 17-file write-set:

- `src/wearables/insights/guardrails.spec.ts`
- `src/wearables/insights/guardrails.ts`
- `src/wearables/insights/insight-cache.service.spec.ts`
- `src/wearables/insights/insight-cache.service.ts`
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
- `src/wearables/wearables.module.ts`

## Blocking findings

### 1. Budget enforcement claim is false for the new wearable insight capabilities

**Severity:** High / blocking

The PR defines the two gateway capabilities as `wearable_insight.coach` and `wearable_insight.client` in `src/wearables/insights/wearable-insights.service.ts:53-54`, but neither capability is present in `COACH_AI_METERED_CAPABILITIES` in `src/ai-credits/ai-credits.constants.ts:39-49`.

The gateway only calls `CoachAIBudgetService.canCharge()` and `recordUsage()` when `COACH_AI_METERED_CAPABILITIES.has(req.capability)` is true (`src/ai/gateway/ai-gateway.service.ts:185-203` and `src/ai/gateway/ai-gateway.service.ts:285-299`). Therefore real provider calls for `wearable_insight.coach` and `wearable_insight.client` bypass the per-user/coach budget gate and usage recording entirely.

This directly fails the checklist item: “Per-user budget enforced via CoachAIBudgetService (build report claim — verify the import + call sites).” The build report says the gateway enforces budget for these calls, but the actual metered-capability set does not include them.

**Required fix:** Add the wearable insight capabilities to the metered capability set or otherwise make the gateway budget predicate include them, with tests proving both pre-call budget rejection and post-call usage recording for wearable insight calls.

### 2. Output schemas are not strict exact-field schemas

**Severity:** High / blocking

`CoachInsightSchema` and `ClientInsightSchema` are plain `z.object(...)` schemas in `src/wearables/insights/insight-output.schema.ts:48-55` and `src/wearables/insights/insight-output.schema.ts:63-75`. There is no `.strict()` on either schema, and the PR tests do not assert rejection of unknown client-only fields on coach payloads or coach-only fields on client payloads.

Zod object schemas without `.strict()` do not enforce an exact input field set; unknown keys are not treated as schema violations. That falls short of the locked checklist requirement: exact coach payload field set, exact client payload field set, strict Zod, and no cross-audience fields.

Controller/service paths do project to the intended audience schema in normal cases, but this is not the same as strict validation. A model response containing both coach and client fields should fail validation under the locked schema contract, not be accepted after unknown-key handling.

**Required fix:** Add `.strict()` to both `CoachInsightSchema` and `ClientInsightSchema`, and add negative tests proving coach schema rejects `norm_comparison` / `intervention` / `optional_cta`, while client schema rejects `hypothesis` / `suggested_action` / `suggested_message_draft`.

### 3. Empty fallback payloads violate the locked `source_metrics` contract

**Severity:** High / blocking

The schema requires `source_metrics` to be an array with `.min(1)` in `src/wearables/insights/insight-output.schema.ts:38-39`, and both output schemas include that field (`src/wearables/insights/insight-output.schema.ts:54` and `src/wearables/insights/insight-output.schema.ts:74`). However the timeout/failure fallback helpers return `source_metrics: []` and cast the result as the target insight type (`src/wearables/insights/insight-output.schema.ts:131-151`).

The service returns these fallback objects directly on timeout/failure/no-stale-cache paths (`src/wearables/insights/wearable-insights.service.ts:181-188`, `src/wearables/insights/wearable-insights.service.ts:203-212`, and `src/wearables/insights/wearable-insights.service.ts:225-226`) without schema validation. This means controller responses can violate the locked output schema despite normal LLM outputs being schema-validated.

This directly fails the checklist item: `source_metrics` min length 1. The “empty insight” graceful-degradation path still needs a schema-compatible contract, or the schema must explicitly model a separate empty-state response. The current cast hides the violation from TypeScript.

**Required fix:** Make fallback responses schema-valid under the same public contract, or introduce and document a separate strict empty-state schema that controllers/tests explicitly expect. Remove the unsafe casts that bypass the Zod contract.

## Additional findings

### 4. Tests violate the “NO toBeDefined” requirement

**Severity:** Medium

The new PR-HK-4 tests contain two `toBeDefined()` assertions in `src/wearables/insights/wearable-insights.service.spec.ts:149` and `src/wearables/insights/wearable-insights.service.spec.ts:174`. The audit checklist explicitly requires real-value assertions and no `toBeDefined`.

**Required fix:** Replace these with exact-value assertions or strict shape assertions.

### 5. “AiRequestAudit row written per call” is true via gateway, but not directly proven by this PR’s mock specs

**Severity:** Low / test coverage gap

The gateway implementation writes `aiRequestAudit.create(...)` on each invoke (`src/ai/gateway/ai-gateway.service.ts:381-410`), and the PR correctly uses `AiGatewayService.invoke()` rather than editing `src/ai/`. However the PR-HK-4 service spec only verifies that `gateway.invoke` was called and comments “audit via gateway”; it does not mock or assert an `AiRequestAudit` write for a wearable insight call.

**Required fix:** Add a focused test at the gateway seam or an integration-style mocked gateway test that proves a wearable insight invoke writes the audit row with the wearable capability, requester, subject, provider/model, and hashes.

## Checklist results

### Output schema

- Coach/client field names match the planned shapes in the code.
- Confidence enum matches `i_think | fairly_sure | confident | certain | verified`.
- `source_metrics` is declared `.min(1)` in the normal schemas.
- **Fail:** schemas are not `.strict()` exact-field validators.
- **Fail:** fallback responses bypass the schema and return empty `source_metrics` arrays.

### Guardrails

- Block list includes apnea, arrhythmia, insomnia, depression, disorder, `diagnos*`, `treat*`, cure, anxiety disorder, and sleep disorder.
- Tests assert each block-word/stem path is rejected.
- Confidence calibration implements and tests the required boundaries: `<0.6`, `[0.6,0.8)`, `[0.8,0.9)`, `[0.9,1.0)`, and `1.0`.

### Cache semantics

- Physical key maps to `(user_id, side, bucket, window_days)` with `window_days = 14`.
- TTL is 6h via `expires_at`.
- Invalidations are row deletes, matching the real PR-HK-0 schema and ingestion path.
- Cache tests cover cold miss, get-after-set, TTL expiry, stale read, invalidate-then-get-null, and coach/client side isolation.

### Service flow

- Cache miss fetches samples, builds prompt, calls `AiGatewayService.invoke()`, validates, guardrails, caches, and relies on gateway audit logging.
- LLM timeout/failure has stale-cache or empty fallback behavior.
- **Fail:** budget enforcement is not active for the new wearable capabilities because the capability strings are absent from the gateway’s metered set.
- Coach endpoint calls `assertCoachOwnsClient` before generation.

### Schema isolation

- Controller has separate coach and client handlers.
- Client endpoint never calls coach generator in tests.
- **Fail:** strict exact-field input rejection is not implemented/tested.

### Prompt safety

- Prompt templates include persona, JSON output spec, no-medicalize directive, confidence calibration rule, and source_metrics citation rule.
- Sample digests call `redactProviderTokens(...)` before inclusion in prompts.

### Tests

- Required gate run reports 121 passed tests across 8 suites.
- New PR test count by file review: guardrails 27, norm comparison 11, cache 7, service 14, controller 10 = 69 new tests.
- **Fail:** tests include two `toBeDefined()` assertions.
- **Gap:** no direct test proving wearable capabilities are budget-metered.
- **Gap:** no negative strict-schema tests for extra cross-audience fields.

### File hygiene

- 4 commits found between `9c67444c` and `d21b999ffadddc6e6cbee2aec955f536825c544a`.
- All commit authors are `Dynasia G <dynasia@trygrowthproject.com>`.
- Commit bodies are empty; no trailers observed.

## Gates

All required gates passed after using the repository-pinned dependency install (`prisma` 6.19.3). Logs are saved under `audits/HK_wave/artifacts/`.

| Gate | Result |
| --- | --- |
| `DATABASE_URL=... DIRECT_URL=... npx prisma validate` | PASS — schema valid |
| `DATABASE_URL=... DIRECT_URL=... npx prisma generate` | PASS — Prisma Client v6.19.3 generated |
| `NODE_OPTIONS=--max-old-space-size=4096 npx tsc --noEmit -p tsconfig.json` | PASS |
| `npx eslint src/wearables/` | PASS |
| `npx jest --roots src/wearables --runInBand` | PASS — 8 suites, 121 tests |

## Final verdict

**FAIL — request changes.** The implementation is close on guardrails, prompt structure, cache behavior, service orchestration, and controller isolation, and the gates pass. However, PR-HK-4 cannot be accepted at `d21b999ffadddc6e6cbee2aec955f536825c544a` because budget enforcement is not actually active for the new wearable insight capabilities, the output schemas are not strict exact-field validators, and the empty fallback path violates the locked `source_metrics` schema.
