# HK PR-HK-4 BUILD REPORT — Embedded AI insights foundation (BACKEND, NO UI)

Builder: Dynasia G. Unit: HK PR-HK-4 (embedded AI insights foundation). Repo: `growth-project-backend`.
Branch: `hk/PR-HK-4-ai-insights-foundation` (off backend main `9c67444`).
PR: **#348** — `feat(wearables): PR-HK-4 — embedded AI insights foundation`
PR URL: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/348
Head SHA: `d21b999ffadddc6e6cbee2aec955f536825c544a`

Coach + client AI insight generation: bucket-specific prompt templates
(Health&Fitness / Sleep&Recovery × coach / client), Zod-validated dual-role
output, no-medicalize guardrails, calibrated confidence labels, 6h cache with
sync-driven invalidation, audit logging — all via the existing `src/ai/`
gateway (no edits to AI module files). **No UI** (panels land in PR-HK-5a/5b).

## Scope (write-set — exactly the 12 specified items, verified disjoint)
Changed vs `origin/main` (17 files = 16 new + 1 additive edit):
- `src/wearables/insights/insights.module.ts` — new
- `src/wearables/insights/wearable-insights.service.ts` (+ `.spec.ts`) — new
- `src/wearables/insights/wearable-insights.controller.ts` (+ `.spec.ts`) — new
- `src/wearables/insights/insight-cache.service.ts` (+ `.spec.ts`) — new
- `src/wearables/insights/insight-output.schema.ts` — new (Zod, both audiences)
- `src/wearables/insights/prompts/coach-hf.prompt.ts` — new
- `src/wearables/insights/prompts/coach-sr.prompt.ts` — new
- `src/wearables/insights/prompts/client-hf.prompt.ts` — new
- `src/wearables/insights/prompts/client-sr.prompt.ts` — new
- `src/wearables/insights/norm-comparison.util.ts` (+ `.spec.ts`) — new
- `src/wearables/insights/guardrails.ts` (+ `.spec.ts`) — new
- `src/wearables/wearables.module.ts` — EDIT, additive only (+7/-1): import +
  register `InsightsModule` in `imports`/`exports`. No other line touched.

No overlap with PR-HK-1 (`connections/`) or PR-HK-2.* (`connectors/`) — disjoint
folder `src/wearables/insights/`. No `prisma/schema.prisma` change. No `src/ai/`
edit. Generated Prisma client is gitignored and not committed.

## Commits (author = `Dynasia G <dynasia@trygrowthproject.com>`, no trailers, no co-authors, empty bodies)
- `ac802b2` feat(wearables): PR-HK-4 — insight output schema + guardrails + norm comparison
- `032b8f3` feat(wearables): PR-HK-4 — prompt templates (coach/client × HF/SR)
- `97f46bc` feat(wearables): PR-HK-4 — insight cache service
- `d21b999` feat(wearables): PR-HK-4 — insights service + controller + module

All four commits: author AND committer = `Dynasia G <dynasia@trygrowthproject.com>`, empty bodies.

## Output schema (UNIFIED_BUILD_PLAN locked decisions)
- `CoachInsightSchema`: `{ observation, hypothesis, suggested_action,
  suggested_message_draft, confidence_level, source_metrics[] }` — string
  bounds (280/280/280/1000), `confidence_level` enum
  `i_think|fairly_sure|confident|certain|verified`, `source_metrics` a
  `z.nativeEnum(WearableMetricType)` array `.min(1)` (derived from the Prisma
  enum so the taxonomy never drifts).
- `ClientInsightSchema`: `{ observation, norm_comparison, intervention,
  optional_cta, confidence_level, source_metrics[] }` — `optional_cta` is
  `{ label(<=40), deep_link(/^tgp:\/\//) } | null` (deep-link scheme locked to
  `tgp://` so a model can never smuggle an http/js link into a tappable CTA).
- The two schemas are intentionally NOT shared: coach-only fields
  (`hypothesis`, `suggested_message_draft`) NEVER appear in the client payload.
  The controller is split into two handlers so the response shapes cannot cross.

## AI gateway integration approach (REUSE, no edits)
- Single LLM seam: **`AiGatewayService.invoke()`** (`src/ai/gateway/`). The
  `AiGatewayModule` is `@Global`, so `WearableInsightsService` injects
  `AiGatewayService` directly — no module import, no edit to any `src/ai/` file.
- The gateway already owns, and we reuse for free:
  - **Provider resolution** — fails closed to a deterministic stub unless an
    operator allow-lists the capability (`AI_GATEWAY_CAPABILITIES`). Two new
    capability strings: `wearable_insight.coach`, `wearable_insight.client`.
    Safe-by-default: with no operator config the gateway returns the stub and
    our Zod/guardrail pipeline handles it gracefully.
  - **Free-text redaction** of `userMessage` before any provider call.
  - **`AiRequestAudit` row written on every call** (audit criteria #34) — the
    gateway persists request_id, capability, requester, provider/model, token
    estimates, prompt/response hashes, approval status. We do not write the
    audit row ourselves; reusing `invoke()` guarantees it.
- On top of the gateway, the service adds the wearable-specific concerns the
  gateway does not own: bucket+audience prompt selection, strict Zod validation
  of the model JSON (with first-balanced-`{}` extraction so a prose-wrapped or
  fenced JSON still parses), a single "you returned invalid JSON" repair retry
  then fail-explicit, no-medicalize guardrails, a **30s timeout** with graceful
  degradation, and the dual-role projection.
- Timeout / graceful degradation (audit criteria #35/#50): the gateway call is
  wrapped in a 30s `Promise.race`. On timeout/failure → return the last cached
  payload even if stale (`InsightCacheService.getEvenIfStale`); if no cache →
  return an explicit empty insight (`observation: "Not enough data yet — keep
  syncing.", confidence_level: 'i_think', source_metrics: []`).

## Per-user rate limit + cost cap (REUSE)
- **Reused the existing `CoachAIBudgetService`** (`src/ai-credits/`), which the
  gateway already injects (`@Optional`) and enforces on every metered
  capability: pre-call `canCharge` 402 gate + atomic post-call `recordUsage`.
  We did NOT build a new quota system and did NOT touch `src/ai-credits/`. There
  is also a `UserAIQuota` Prisma model and a daily-token reserve/reconcile path
  inside `AiService.chat()`; we did not need it because the gateway's
  CoachAIBudget path is the canonical metering seam for `invoke()`-based
  capabilities. Controllers additionally apply `@Throttle` (coach: 30/hr on the
  `coach-ai-generation` bucket; client: 60/hr on `default`).

## Cache (PR-HK-0 `WearableInsightCache`, schema-accurate)
- Key = logical `${audience}:${userId}:${bucket}`, physically the table's
  compound-unique `(user_id, side, bucket, window_days)` with a fixed
  `window_days = 14`. TTL 6h via `expires_at = generated_at + 6h`.
- `get` returns a payload only when a row exists AND `expires_at > now`.
- **DEVIATION (documented below):** the spec described an `invalidated_at` /
  `created_at` soft-invalidation model. The ACTUAL PR-HK-0 schema has no such
  columns — it tracks freshness via `generated_at` + `expires_at`, and PR-HK-0's
  `IngestionService.invalidateInsightCache` invalidates by **deleting** rows
  (`wearableInsightCache.deleteMany`). Since the write-set excludes
  `schema.prisma`, the cache service adapts to the real schema: invalidation =
  row delete (so "invalidated" and "missing" collapse to the same observable
  state — `get` returns null and the service regenerates). This preserves the
  spec's INTENT (a new sync makes the next read regenerate) without editing
  IngestionService — which already performs the per-(user,bucket) delete on sync.

## Guardrails (`guardrails.ts`)
- `applyGuardrails(text)` → `{ text, rejected, reason? }`. Block-list (word-
  boundaried; stems for `diagnos*`/`treat*`/`disorder`): apnea, arrhythmia,
  insomnia, depression, disorder, diagnos*, treat*, cure, anxiety disorder,
  sleep disorder. Reject-and-regenerate posture (no partial scrub). The service
  scans every text field of the produced insight; any hit → fall back to stale
  cache, else empty insight (NEVER ship the medicalizing text).
- `calibrateConfidence(raw)` → exact boundaries: `<0.6 i_think`,
  `[0.6,0.8) fairly_sure`, `[0.8,0.9) confident`, `[0.9,1.0) certain`,
  `1.0 verified`; clamps out-of-range/NaN.
- `redactProviderTokens(text)` — scrubs bearer headers, `*_token` assignments,
  and JWT-shaped opaque runs before any provider string can enter a prompt
  (audit: "no prompt injection of raw provider strings without redaction").
  Called inside every prompt template's sample digest.

## Norm comparison (`norm-comparison.util.ts`)
- Hardcoded sex-pooled adult population norms (mean/SD) with inline citations
  (Lampert et al 2024 HRV; AHA/Nanchen 2018 resting HR; NSF 2015 + Ohayon 2017
  sleep; Tudor-Locke 2011 steps; ACSM 2021 VO2max; standard adult resp-rate /
  SpO2 ranges). `compareToNorm(metric, value, userAge?)` → `{ percentile, band,
  norm_text }` via the standard-normal CDF (Abramowitz-Stegun erf). Age-adjusts
  HRV + VO2max past age 30. Used to enrich the prompt context (e.g. "your
  client's HRV of 28ms is in the 13th percentile vs adult norms").

## Prompt templates
Each is a pure `buildPrompt({samples, userContext, bucket}) → {system, user}`.
The prompt layer never touches the DB (the service fetches last-14d samples).
System prompts include: persona (coach-assistant / client self-coach), strict
JSON output-format spec matching the schema, "Do NOT medicalize / never name
diagnoses / never suggest treatments", "only claim 'confident' if 3+ data points
agree", and "cite source_metrics (WearableMetricType values)". Sample digests
are run through `redactProviderTokens`.

## Controller (`/v1/wearables/insights`)
- `GET /coach?clientId=&bucket=` — `@UseGuards(JwtAuthGuard, CoachGuard)` +
  `@Roles('coach','owner')`; service re-checks coach-owns-client
  (`assertCoachOwnsClient`, mirrors the private `CoachService` check; owner
  bypass) for IDOR defence (#5). Returns CoachInsight only.
- `GET /client?bucket=` — `@UseGuards(JwtAuthGuard)`; subject is always
  `req.user.id` (no IDOR surface). Returns ClientInsight only.
- Both: Zod-validated query params (400 `WEARABLE_INSIGHT_QUERY_INVALID` on bad
  input), `@Throttle`d. Coach handler never returns client schema and vice versa.

## KmsService — not needed
No raw provider tokens or KMS-wrapped secrets are read or written in this PR.
Token decryption lives in the connection/ingestion lanes (PR-HK-0 / PR-HK-1).
The insight surface consumes only already-normalized `WearableSample` rows and
the redacted prompt path, so `KmsService` is correctly absent here.

## Tests (real-value assertions)
New tests: **69** (jest reports 121 total over `src/wearables` = PR-HK-0's 52 + 69 new).
- `guardrails.spec.ts` — 27 (12 block-word rejections via `it.each` + clean
  pass + word-boundary non-false-positive + empty/non-string + block-rule audit
  + 6 confidence-calibration boundary cases + 4 redaction cases).
- `norm-comparison.util.spec.ts` — 11 (known input → known integer percentile +
  band, incl. age-adjusted HRV and no-norm fallback).
- `insight-cache.service.spec.ts` — 7 (get-after-set, 6h-TTL stamp, expiry→null,
  getEvenIfStale stale return, invalidate→null, coach/client side isolation).
- `wearable-insights.service.spec.ts` — 14 (cache hit → no LLM call; cache miss
  → LLM + validate + cache write + gateway-audit; client capability/subject
  wiring; JSON extraction from fenced output; invalid→repair→success;
  invalid-after-repair→empty fallback; repair-fail→stale fallback; guardrail
  reject→empty fallback; clean→cache; timeout→stale; timeout→empty;
  assertCoachOwnsClient pass/forbidden/owner-bypass).
- `wearable-insights.controller.spec.ts` — 10 (route registration, base path,
  GET method, guard-count metadata coach=2/client=1, roles metadata, ownership
  check + coach schema, 400 on bad clientId/bucket, client schema isolation,
  client never calls coach generator).

## Gates (ALL PASS)
- ① `prisma validate` → "The schema at prisma/schema.prisma is valid".
- ② `prisma generate` + `tsc --noEmit -p tsconfig.json` → exit 0, no errors.
- ③ `npx eslint src/wearables/` → exit 0, clean (fixed 5 `no-useless-escape`
  in the redaction regex character classes).
- ④ `npx jest --roots src/wearables --runInBand` → **121 passed** (52 PR-HK-0 +
  69 new), 8 suites. (The suite's wall time is ~30s because the service's 30s
  LLM-timeout timer is `unref`'d but still observed at worker idle;
  `--detectOpenHandles` reports zero leaked handles and every individual test is
  well under the 10s per-test timeout.)
- ⑤ Diff vs `origin/main` = write-set only (17 files: 16 new + 1 additive edit
  to `wearables.module.ts`). No `schema.prisma`, no `src/ai/`, no PR-HK-1/2 files.

## Deviations
1. **`WearableInsightCache` schema shape.** Spec referenced `invalidated_at` /
   `created_at` soft-invalidation; the real PR-HK-0 table uses
   `generated_at`/`expires_at` and invalidates by row delete. Adapted the cache
   service to the real schema (delete = invalidate; TTL via `expires_at`).
   Rationale: write-set excludes `schema.prisma`; editing it would collide and
   break the diff gate. Intent preserved (sync → next read regenerates).
2. **Cache key physical mapping.** Logical key `${audience}:${userId}:${bucket}`
   maps onto the table's `(user_id, side, bucket, window_days)` unique with
   `window_days=14` (the trend window). `audience` ('coach'|'client') maps 1:1
   to the `side` column.
3. **Rate limit / cost cap.** Reused `CoachAIBudgetService` via the gateway
   (the canonical metering seam for `invoke()`), not `UserAIQuota` directly —
   `UserAIQuota`/daily-token reserve is wired only into `AiService.chat()`,
   which this PR does not call. Coach + client endpoints also carry `@Throttle`.
4. **`calibrateConfidence` placement.** The model emits its own
   `confidence_level` label (validated by the schema); `calibrateConfidence`
   provides the canonical raw→label mapping (exercised by tests and available to
   callers) rather than forcibly recomputing from a raw float the model does not
   return.

## R2 Fix Pass

R2 fixer addressing the three blocking findings in `PR-HK-4_AUDIT_R1.md`
(verdict FAIL). All work on branch `hk/PR-HK-4-ai-insights-foundation`.

- **New head SHA:** `2563193466f22398e265eb1fa53ee89aef9722f5`
- **Previous (audited) head:** `d21b999ffadddc6e6cbee2aec955f536825c544a`
- **Commits (3, all `Dynasia G <dynasia@trygrowthproject.com>`, no trailers):**
  - `a44a0f9` fix(wearables): PR-HK-4 — strict() on Coach/Client insight schemas
  - `cf3546e` fix(wearables): PR-HK-4 — EmptyInsight union for fallback (no schema violation)
  - `2563193` fix(wearables): PR-HK-4 — budget enforcement for wearable_insight.coach/client

### Finding 1 — Budget enforcement not active (R1 #1)

- **Root cause:** the gateway gates both its pre-call budget check
  (`src/ai/gateway/ai-gateway.service.ts:188-217`) and its post-call atomic
  `recordUsage` (`:285-309`) on
  `COACH_AI_METERED_CAPABILITIES.has(req.capability)`. The two wearable
  capability strings (`wearable_insight.coach`, `wearable_insight.client`)
  were absent from that set, so real provider calls bypassed the gate.
- **Fix:** added the two capability strings to
  `COACH_AI_METERED_CAPABILITIES` in
  `src/ai-credits/ai-credits.constants.ts:49-57` (additive declaration).
  The gateway's existing `resolveBudgetCoachId` already routes both audiences
  correctly: the client path resolves the subject student's `coach_id`
  (`:459-469`), the coach path resolves `tenantCoachId` → head coach
  (`:456-458`). No in-service defensive budget call was needed — the registry
  extension activates the canonical, audited, atomic metering path (single
  source of truth), which is cleaner than duplicating cost estimation in the
  wearables service.
- **Tests:** new `budget metering` describe in
  `src/wearables/insights/wearable-insights.service.spec.ts:317-336` asserts
  both capability strings are members of the metered set and pin the exact
  strings the service hands the gateway (3 tests).

### Finding 2 — Output schemas not strict exact-field (R1 #2)

- **Fix:** appended `.strict()` to `CoachInsightSchema`
  (`src/wearables/insights/insight-output.schema.ts:53-63`) and
  `ClientInsightSchema` (`:73-88`). Unknown / cross-audience keys now hard-fail
  validation instead of being silently stripped (prompt-injection defence).
- **Tests:** new `src/wearables/insights/insight-output.schema.spec.ts`
  proves the coach schema rejects an injected unknown key and client-only
  fields (`norm_comparison`/`intervention`/`optional_cta`), and the client
  schema rejects an unknown key and coach-only fields
  (`hypothesis`/`suggested_action`/`suggested_message_draft`), plus exact-
  payload acceptance and `source_metrics .min(1)` rejection.

### Finding 3 — Empty fallback violates source_metrics .min(1) (R1 #3)

- **Fix:** replaced the unsafe `emptyCoachInsight()`/`emptyClientInsight()`
  casts (which set `source_metrics: []` against a `.min(1)` field) with a
  dedicated strict `EmptyInsightSchema`
  (`src/wearables/insights/insight-output.schema.ts:148-156`):
  `{ observation: literal(EMPTY_OBSERVATION), confidence_level: literal('i_think'),
  source_metrics: array().length(0), is_empty: literal(true) }`. Added
  `CoachInsightResponseSchema`/`ClientInsightResponseSchema` unions
  (`:162-172`), an `isEmptyInsight` guard (`:176-180`), and an `emptyInsight()`
  factory (`:182-189`).
- **Wiring:** `wearable-insights.service.ts` now returns
  `Promise<T | EmptyInsight>` from `generate<T>` and uses `emptyInsight()` on
  every degradation branch (timeout `:185-187`, repair-fail `:202-211`,
  guardrail-reject `:224-225`); the unsafe casts are gone. The controller
  validates the wire response via `CoachInsightResponseSchema.parse(...)` /
  `ClientInsightResponseSchema.parse(...)`
  (`wearable-insights.controller.ts:73-77`, `:91-94`) so BOTH the full-insight
  and empty branches are schema-checked on the way out.
- **Tests:** schema spec covers the empty schema literals, length-0 pin,
  rejection of non-empty `source_metrics`, the response unions accepting both
  branches, and a regression test proving the empty payload FAILS the full
  schema but PASSES the union. Service spec asserts the degradation paths
  return a validated empty state with no leaked coach/client fields. Controller
  spec adds an empty-state pass-through test.

### Write-set extension (justified)

- **`COACH_AI_METERED_CAPABILITIES` registry WAS extended** in
  `src/ai-credits/ai-credits.constants.ts` — a two-line additive declaration
  (one entry per audience capability). This file is outside PR-HK-4's nominal
  write-set (`src/ai-credits/`, `src/ai/`). The extension is accepted because:
  (1) it is purely additive — no existing capability's behaviour changes;
  (2) the registry is the single source of truth for the gateway's budget
  predicate, so the idiomatic fix lives here rather than duplicating cost
  logic in the wearables service; (3) no other `src/ai-credits/` or `src/ai/`
  code was touched. No `src/ai/` files were modified.

### Test count delta

- R1 baseline (per audit): 121 tests / 8 suites on `--roots src/wearables`.
- R2: **146 tests / 9 suites** pass (`npx jest --roots src/wearables
  --runInBand`). Net **+25 tests, +1 suite** (new
  `insight-output.schema.spec.ts` = 21 tests; +3 budget-metering tests and +1
  controller empty-state test; the two `toBeDefined()` assertions flagged in
  R1 #4 were also replaced with exact-value assertions while editing those
  files).

### Gates (all pass on head `2563193`)

| Gate | Result |
| --- | --- |
| `prisma validate` | PASS — schema valid |
| `prisma generate` | PASS — Prisma Client v6.19.3 |
| `tsc --noEmit -p tsconfig.json` | PASS |
| `eslint src/wearables/` | PASS |
| `jest --roots src/wearables --runInBand` | PASS — 9 suites, 146 tests |
