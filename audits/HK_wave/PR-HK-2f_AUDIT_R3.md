# PR-HK-2.f — Strava connector — R3 re-audit

**Verdict:** PASS — the three R1 findings are fixed at the new head, with no new findings.

**Repo:** `growth-project-backend`  
**PR:** #347  
**Audited head SHA:** `10a11ee764599f66eacded3bfee8af52e9830423`  
**Previous R1 head:** `fbd0f5e84ac731e575ef482002553f3026848b53`  
**Base:** `main` @ `9c67444c`  
**R1 audit:** `audits/HK_wave/PR-HK-2f_AUDIT_R1.md`  
**R2 build-report append reviewed:** `17415286` (`docs(HK): PR-HK-2.f R2 fix-pass notes`)  
**Auditor:** R3 re-auditor

> Execution note: the target commit was available locally after `git fetch` failed due repository auth in the sandbox. I checked out the exact target SHA and later used an isolated worktree at the same SHA for gates after the shared checkout was moved by another process.

## Scope / write-set verification

PASS. The diff from `9c67444c..10a11ee764599f66eacded3bfee8af52e9830423` contains exactly 9 files, all under `src/wearables/connectors/strava/`:

```text
src/wearables/connectors/strava/index.ts
src/wearables/connectors/strava/strava-webhook.controller.spec.ts
src/wearables/connectors/strava/strava-webhook.controller.ts
src/wearables/connectors/strava/strava.connector.spec.ts
src/wearables/connectors/strava/strava.connector.ts
src/wearables/connectors/strava/strava.module.ts
src/wearables/connectors/strava/strava.normalizer.spec.ts
src/wearables/connectors/strava/strava.normalizer.ts
src/wearables/connectors/strava/strava.types.ts
```

Stat:

```text
9 files changed, 1971 insertions(+)
```

No edits were made outside `src/wearables/connectors/strava/`.

## Gate results

All 5 gates PASS at `10a11ee7` in the isolated target checkout.

| Gate | Command | Result | Evidence |
| --- | --- | --- | --- |
| Build | `npx nest build` | PASS, exit 0 | `PR-HK-2f_R3_gate_nest_build.log` |
| Types | `npx tsc --noEmit` | PASS, exit 0 | `PR-HK-2f_R3_gate_tsc.log` |
| Lint | `npx eslint "src/wearables/connectors/strava/**/*.ts"` | PASS, exit 0 | `PR-HK-2f_R3_gate_eslint_strava.log` |
| Strava tests | `npx jest --roots src/wearables/connectors/strava --no-cache --runInBand` | PASS, 3 suites / 53 tests | `PR-HK-2f_R3_gate_jest_strava.log` |
| Wearables regression | `npx jest --roots src/wearables --no-cache --runInBand` | PASS, 6 suites / 105 tests | `PR-HK-2f_R3_gate_jest_wearables.log` |

Gate summary:

```text
build=0 tsc=0 eslint=0 strava_jest=0 wearables_jest=0
```

Regression count check PASS: full wearables is 105/105, up from 96/96; Strava subset is 53/53, up from 44/44.

## R1 finding re-checks

### R1 #1 — CRITICAL — Fail-closed subscription validation

**Status:** FIXED.

Evidence in `src/wearables/connectors/strava/strava-webhook.controller.ts`:

- `onModuleInit()` logs a startup warning when `STRAVA_WEBHOOK_SUBSCRIPTION_ID` is unset (`lines 181-188`).
- `handleEvent()` reads `configuredSubscriptionId` before any dedup DB write or enqueue (`line 249`).
- Env var unset throws `ServiceUnavailableException('strava_webhook_not_configured')` (`lines 250-258`), which maps to 503.
- Configured mismatch throws `ForbiddenException('subscription_id_mismatch')` (`lines 259-264`), which maps to 403.
- Exact match continues into the dedup `createMany(skipDuplicates)` path (`lines 266-278`) and then enqueue logic when applicable (`lines 286-293`).

No DB write / dedup / enqueue occurs on the subscription 503/403 paths because both exceptions are thrown before the first `wearableProcessedEvent.createMany()` call at line 269 and before `enqueueActivityFetch()` at line 292.

Tests in `src/wearables/connectors/strava/strava-webhook.controller.spec.ts` cover:

- Configured mismatch → `ForbiddenException`, with `createMany` not called (`lines 156-165`).
- Env unset → `ServiceUnavailableException`, with neither `createMany` nor `enqueueActivityFetch` called (`lines 167-179`).
- Startup warning via `onModuleInit()` when env is unset (`lines 181-198`).
- Match/continue path via the first-time activity create test (`lines 103-117`).

### R1 #2 — HIGH — Zod validation

**Status:** FIXED.

Evidence in `src/wearables/connectors/strava/strava.types.ts`:

- `StravaWebhookEventSchema` is a Zod schema with `.strict()` (`lines 127-137`).
- `aspect_type` is enum-constrained to `create | update | delete` (`line 129`).
- `object_type` is enum-constrained to `activity | athlete` (`line 132`).
- `event_time`, `object_id`, `owner_id`, and `subscription_id` are positive integers (`lines 130-134`).
- `updates` is an optional string-keyed record (`line 135`).

Evidence in `src/wearables/connectors/strava/strava-webhook.controller.ts`:

- The controller accepts `rawBody: unknown` and calls `parseEvent(rawBody)` before subscription validation, dedup, and enqueue (`lines 231-243`).
- `parseEvent()` uses `StravaWebhookEventSchema.safeParse()` (`line 305`).
- Parse failure logs the issues and throws `BadRequestException('Malformed Strava webhook event')` (`lines 306-312`), which maps to 400.
- Persistent side effects (dedup row write and fetch enqueue) only happen after successful parse (`lines 266-293`). The source-IP allow-list still runs before parsing as a non-persistent security gate (`lines 235-236`).

Tests in `src/wearables/connectors/strava/strava-webhook.controller.spec.ts` cover malformed payloads → `BadRequestException`, including non-numeric `object_id`, non-numeric `owner_id`, invalid `aspect_type`, invalid `object_type`, missing `subscription_id`, negative `object_id`, and unknown top-level keys (`lines 200-272`). The non-numeric `owner_id` test also asserts neither DB write nor enqueue is called (`lines 212-222`).

### R1 #3 — HIGH — Durable enqueue

**Status:** FIXED.

Evidence in `src/wearables/connectors/strava/strava-webhook.controller.ts`:

- `StravaActivityFetchQueue.enqueueActivityFetch()` now writes to `wearableProcessedEvent.createMany()` (`lines 136-148`).
- The durable work-row ID is `strava:fetch:activity:<activityId>:<ownerId>` (`line 137`).
- The row is written with `provider: WearableProvider.STRAVA`, `provider_event_id: workId`, and `type: StravaActivityFetchQueue.FETCH_WORK_TYPE` (`lines 141-143`).
- `FETCH_WORK_TYPE` is exactly `'strava.activity.fetch'` (`line 125`).
- `handler_completed_at` is intentionally omitted, leaving the nullable Prisma column as `NULL` / pending (`line 144` comment). The existing schema has `handler_completed_at DateTime?` with `@@index([handler_completed_at])`, so it is claimable by a later worker.
- The write is idempotent via `createMany(..., skipDuplicates: true)` (`lines 138-148`).
- The webhook awaits durable enqueue before returning the 200 ACK path (`line 292` before `line 295`).

Tests in `src/wearables/connectors/strava/strava-webhook.controller.spec.ts` cover:

- First-time activity event calls enqueue after dedup insert (`lines 103-117`).
- Durable pending work row persistence, including namespaced `provider_event_id`, `type = 'strava.activity.fetch'`, and unset `handler_completed_at` (`lines 310-325`).
- Idempotent duplicate enqueue via `skipDuplicates` no-op (`lines 327-331`).

The R2 justification is acceptable: the repo has no BullMQ queue, no schema migration is possible inside the connector-scoped mutex, and the webhook cannot fetch inline without an OAuth-bearing connection; using an existing durable row mirrors the existing durable-row queue pattern and gives PR-HK-3 a claim seam.

## Commit hygiene

PASS. All commits in `9c67444c..10a11ee7` are authored by Dynasia G `<dynasia@trygrowthproject.com>`, have empty bodies beyond the subject, and no trailers/co-authors were observed.

```text
22d76eb feat(wearables): PR-HK-2.f — Strava types + normalizer
94471d6 feat(wearables): PR-HK-2.f — Strava connector (OAuth + backfill + refresh rotation)
d9b13f4 feat(wearables): PR-HK-2.f — Strava webhook controller (challenge + events)
fbd0f5e feat(wearables): PR-HK-2.f — Strava module + connector definition export
7332a81 fix(wearables): PR-HK-2.f — fail-closed subscription validation
6426976 fix(wearables): PR-HK-2.f — Zod validation on webhook payload
10a11ee fix(wearables): PR-HK-2.f — durable fetch enqueue (or sync fetch fallback)
```

## New findings

None.

## Final verdict

PASS. R1 #1, R1 #2, and R1 #3 are fixed; all 5 gates pass; test counts match the expected 105/105 full wearables and 53/53 Strava subset; write-set and commit-hygiene checks pass.
