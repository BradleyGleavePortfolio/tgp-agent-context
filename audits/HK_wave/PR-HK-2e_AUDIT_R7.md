# PR-HK-2.e — Fitbit connector — R7 audit

**Verdict:** NOT CLEAN — the R5 ghost-dedup data-loss path is functionally resolved and all five required gates pass, but the Fitbit module's registry contribution is incompatible with the current PR-HK-1 `ConnectorRegistry`, so importing the module will not make Fitbit discoverable/activatable through the generic connect flow.

**Repo:** `growth-project-backend`  
**PR:** #353  
**Audited head SHA:** `41b7a3567aa75e38cc08972af01b738249d53c89`  
**Base:** `main` @ `8cfb44f6f8a8faed00c527c21481beb80e0ec761`  
**Build/fixer report reviewed:** `/home/user/workspace/fitbit_pr353_R6_fix_summary.json`  
**Prior audit reviewed:** `audits/HK_wave/PR-HK-2e_AUDIT_R5.md`  
**Auditor:** R7

## Scope / write-set verification

PASS. The audited diff is exactly 9 files, all under `src/wearables/connectors/fitbit/`:

```text
src/wearables/connectors/fitbit/fitbit-webhook.controller.spec.ts
src/wearables/connectors/fitbit/fitbit-webhook.controller.ts
src/wearables/connectors/fitbit/fitbit.connector.spec.ts
src/wearables/connectors/fitbit/fitbit.connector.ts
src/wearables/connectors/fitbit/fitbit.module.ts
src/wearables/connectors/fitbit/fitbit.normalizer.spec.ts
src/wearables/connectors/fitbit/fitbit.normalizer.ts
src/wearables/connectors/fitbit/fitbit.types.ts
src/wearables/connectors/fitbit/index.ts
```

Audit worktree was pinned to `41b7a3567aa75e38cc08972af01b738249d53c89` before inspection and gates.

## Required gates

| Gate | Result | Evidence |
|---|---:|---|
| `npx prisma validate` | PASS | `audits/HK_wave/logs/PR-HK-2e_R7_prisma_validate.log` |
| `npx tsc --noEmit` | PASS | `audits/HK_wave/logs/PR-HK-2e_R7_tsc_noEmit.log` |
| `npx eslint src/wearables/connectors/fitbit/` | PASS | `audits/HK_wave/logs/PR-HK-2e_R7_eslint_fitbit.log` |
| `npx jest --roots src/wearables --runInBand --no-cache` | PASS — 20 suites / 345 tests | `audits/HK_wave/logs/PR-HK-2e_R7_jest_wearables.log` |
| `npx nest build` | PASS | `audits/HK_wave/logs/PR-HK-2e_R7_nest_build.log` |

Summary log: `audits/HK_wave/logs/PR-HK-2e_R7_gate_summary.log`.

## R5 P1 verification — ghost-dedup data loss

PASS, functionally resolved.

### 1. Conditional `date` validation

PASS. `fitbit-webhook.controller.ts:330-360` defines a strict Zod notification envelope and uses `.superRefine` so every collection except `userRevokedAccess` must carry a non-empty `date`. Invalid payloads fail closed with `BadRequestException` before `findUnique`, fetch, ingest, or processed-event writes.

### 2. Empty-fetch dedup release

PASS, with implementation-note divergence from the R6 wording. `fitbit-webhook.controller.ts:190-215` fetches records before writing the processed-event row; if `raw.length === 0`, it logs structured `wearables.fitbit.empty_fetch` with provider, collection type, date, connection id, and user hash, then returns before `wearableProcessedEvent.create` at `fitbit-webhook.controller.ts:278-286`. The R6 summary described a `deleteMany` reservation release; the actual implementation has no pre-created reservation, so the release is achieved by not committing the row in the first place. This still resolves the R5 data-loss condition because the same provider event is not deduped and can be retried.

### 3. Regression tests and mutation verification

PASS. Four R5/R6 regression tests are present:

- Empty fetch returns `[]` => no ingest, no processed-event create, structured `wearables.fitbit.empty_fetch` warning (`fitbit-webhook.controller.spec.ts:251-279`).
- Data-bearing notification missing `date` => 400 before side effects (`fitbit-webhook.controller.spec.ts:348-362`).
- Data-bearing `activities` notification with empty `date` => 400 before side effects (`fitbit-webhook.controller.spec.ts:364-374`).
- `userRevokedAccess` without `date` remains accepted and recorded without fetch/ingest (`fitbit-webhook.controller.spec.ts:376-388`).

I mutation-verified the two bug-catching tests by copying the current controller spec onto the prior audited code at `00d031f4f9b4ec4ab94d8b1c25efdb0ddf91a1b4` and running the controller spec. The old code failed exactly the empty-fetch/no-dedup test and the missing-date fail-closed test, while the empty-date and `userRevokedAccess` positive controls passed. Evidence: `audits/HK_wave/logs/PR-HK-2e_R7_mutation_old_r5_tests.log`.

## R65 / Bradley Law sweep

PASS on the R5/R6 target area and fail-closed/silent-failure posture.

- **#8 Missing input validation:** strict Zod array envelope; conditional date requirement for data-bearing collection types; invalid payloads reject before side effects.
- **#17 Fake test coverage:** R5 regression coverage is meaningful and mutation-verified against the R5/R4-era implementation.
- **#28 Race conditions:** the processed-event row is committed only after fetch/ingest success; concurrent `P2002` remains a benign no-op.
- **#29 Idempotency:** empty fetch no longer burns the provider event id; completed deliveries still record one dedup row after successful handling.
- **#36 Silent failures:** no live `.catch(() => undefined)` or empty catch was found in the Fitbit diff; error-status write failures are structured-logged and the original provider error is rethrown.
- **Bradley Law literals/directives:** no live `Coming soon`, `TODO`, `XXX`, stub behavior, `@ts-ignore`, or `as any` was found in the Fitbit diff. Grep hits were comments/test prose only.

## Findings

### P2 — Fitbit's module registry contribution cannot be discovered or used by the current ConnectorRegistry

**Severity:** P2  
**Files:** `src/wearables/connectors/fitbit/index.ts`, `src/wearables/connectors/fitbit/fitbit.module.ts`  
**Failure patterns:** #17 fake integration coverage; #33 hardcoded integration assumptions / contract drift

The Fitbit public surface defines a local connector-registry token as `Symbol.for('WEARABLE_CONNECTORS')` (`index.ts:34-35`), but the current PR-HK-1 registry discovers providers using the string token `WEARABLE_CONNECTORS` from `src/wearables/connector-registry.ts:61` and filters wrappers where `w.token === WEARABLE_CONNECTORS` (`connector-registry.ts:152-156`). A provider registered under the local symbol token will not match that string token, so the registry will not see Fitbit after `FitbitModule` is imported.

Even if a future integration PR aliases the token, the module binds `useExisting: FitbitConnector` (`fitbit.module.ts:38-42`) rather than the `fitbitConnectorDef` value, and `ConnectorRegistry`'s structural guard requires `provider`, `authModel`, `buildAuthorizationUrl`, and `exchangeCode` functions (`connector-registry.ts:117-128`). `FitbitConnector` has `buildAuthUrl` / `buildAuthUrlPkce`, not `buildAuthorizationUrl`, while `fitbitConnectorDef` has only provider/authModel/webhookPath/create and also does not satisfy the current registry contract.

**Impact:** The connector builds and webhook tests pass in isolation, but the generic connection-management path will not discover Fitbit once the module is imported. Users would not be able to list/get/connect Fitbit through the PR-HK-1 registry without a follow-up adapter or special-case wiring. This is exactly the kind of integration seam that unit tests can miss because the PR tests exercise only the standalone connector/controller.

**Expected fix:** Import the canonical `WEARABLE_CONNECTORS` token and `ConnectorDefinition` from `src/wearables/connector-registry.ts`; bind a value that satisfies that interface, including `displayName`, `supportsPkce`, `buildAuthorizationUrl(redirectUri, state, pkceChallenge?)`, and `exchangeCode(code, pkceVerifier?)`; add a small registry/discovery regression test proving an imported Fitbit module is discoverable as `WearableProvider.FITBIT` through `ConnectorRegistry`.

## Positive observations

- HMAC validation occurs before JSON parsing side effects, and invalid signatures fail closed.
- Webhook payload validation reports field paths and issue counts, not raw PII-bearing payload values.
- Fetch/ingest failures mark the connection `status='error'` with a redacted message, log structured context, and rethrow for redelivery.
- Normalization maps the required Fitbit metrics: steps, resting heart rate, derived heart-rate BPM, sleep totals/stages/efficiency, body weight, respiratory rate, and SpO2.
- Commit hygiene check shows all five PR commits authored by `Dynasia G <dynasia@trygrowthproject.com>` with empty bodies and no trailers.

## Verdict

NOT CLEAN. R5's P1 ghost-dedup data-loss issue is resolved, and the five gates pass, but the connector still has one P2 activation/integration defect in its registry contribution.

Counts: P0 = 0, P1 = 0, P2 = 1, P3 = 0.
