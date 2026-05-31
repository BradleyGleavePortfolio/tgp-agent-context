# PR-HK-2.f — Strava connector — R1 audit

**Verdict:** FAIL — critical webhook hardening and delivery semantics do not meet the PR-HK-2.f checklist.

**Repo:** `growth-project-backend`  
**PR:** #347  
**Audited head SHA:** `fbd0f5e84ac731e575ef482002553f3026848b53`  
**Base:** `main` @ `9c67444c`  
**Build report reviewed:** `HK_PR-HK-2f-strava_BUILD.md` @ `f344e84`  
**Auditor:** R1

## Scope / write-set verification

PASS. The audited diff is exactly 9 files, all under `src/wearables/connectors/strava/`:

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

No module/registry edits were present in the diff.

## Gate results

| Gate | Command | Result |
| --- | --- | --- |
| Build | `npx nest build` | PASS, exit 0 |
| Types | `npx tsc --noEmit` | PASS, exit 0 |
| Lint | `npx eslint "src/wearables/connectors/strava/**/*.ts"` | PASS, exit 0 |
| Strava tests | `npx jest --roots src/wearables/connectors/strava --no-cache` | PASS, 3 suites / 44 tests |
| Wearables regression | `npx jest --roots src/wearables --no-cache` | PASS, 6 suites / 96 tests |

## Checklist assessment

| Area | Status | Notes |
| --- | --- | --- |
| Implements `WearableConnector` | PASS | `StravaConnector implements WearableConnector`; `provider = STRAVA`, `authModel = oauth2`. |
| OAuth URL/scopes/token URL | PASS | Auth URL is `https://www.strava.com/oauth/authorize`; scopes are `activity:read_all,profile:read_all`; token endpoint is `https://www.strava.com/oauth/token`. |
| Refresh-token rotation | PASS | `refreshAccessToken()` returns the response `refresh_token`; tests assert new token differs from old token. |
| Backfill pagination | PASS | Pages `/api/v3/athlete/activities?per_page=200&page=N&after=<unix>` with page cap and short-page stop. |
| Rate-limit headers | PASS | Reads `X-RateLimit-Limit` / `X-RateLimit-Usage` via `Headers.get()` and pauses at 90% of either window. |
| GET challenge | PASS | Echoes `{ "hub.challenge": challenge }` only when verify token matches and rejects others. It also requires `hub.mode=subscribe`, which is stricter than the checklist and consistent with Strava handshake behavior. |
| POST subscription validation | **FAIL** | See Finding 1: fails open when `STRAVA_WEBHOOK_SUBSCRIPTION_ID` is unset. |
| POST IP allow-list | PASS | Configurable allow-list exists, default IPs exist, `*` disables for trusted proxy setups. |
| POST dedup | PASS | Uses `WearableProcessedEvent` with `provider=STRAVA` and `provider_event_id = object_type:object_id:event_time`; `createMany(skipDuplicates)` dedups. |
| POST enqueue updated activity fetch | **FAIL** | See Finding 3: the production queue facade only logs and drops the activity fetch request. |
| POST throttling | PASS | `@Throttle` is present on GET and POST. |
| Strava no-HMAC deviation documented | PASS | Controller comments document no HMAC and mitigation strategy. |
| Normalizer mapping | PASS | Maps the required 5 H&F metrics from `moving_time`, `distance`, `calories`, `suffer_score`/`training_load`, and `average_heartrate` with UTC `start_date`. |
| HTTP discipline | PASS | Network I/O goes through `ProviderHttpClient`; timeout/backoff are inherited; Strava-specific header throttle is implemented. |
| Webhook validation | **FAIL** | See Finding 2: not Zod/class-validator and incomplete shape/enum checks. |
| Tests | PASS with coverage gap | 44 tests are present with the requested split and key assertions, but they do not cover the subscription-env fail-open case or production enqueue persistence. |
| File hygiene | PASS | Four commits by Dynasia G, empty bodies, no trailers observed. |

## Findings

### 1. CRITICAL — POST webhook subscription validation fails open when `STRAVA_WEBHOOK_SUBSCRIPTION_ID` is missing

**Code:** `src/wearables/connectors/strava/strava-webhook.controller.ts:173-180`

```ts
const expectedSub = this.getEnv(ENV.subscriptionId);
if (expectedSub && String(body.subscription_id) !== expectedSub) {
  ... throw new ForbiddenException('Unknown Strava subscription');
}
```

The checklist requires `subscription_id` be validated against the configured subscription. This implementation only rejects mismatches when the env var is set. If `STRAVA_WEBHOOK_SUBSCRIPTION_ID` is absent or empty, every syntactically valid event from an allowed IP, or from any IP when `STRAVA_WEBHOOK_ALLOWED_IPS='*'`, passes subscription validation.

**Impact:** The webhook does not fail closed under misconfiguration. Because Strava POSTs have no HMAC, subscription id validation is one of the core compensating controls; making it optional materially weakens the documented no-HMAC mitigation.

**Expected fix:** Require `STRAVA_WEBHOOK_SUBSCRIPTION_ID` for POST handling and return 403/500-style fail-closed behavior when it is not configured. Add a regression test proving missing subscription config rejects before dedup/enqueue.

### 2. HIGH — Webhook payload validation does not satisfy the required Zod/class-validator gate and is incomplete

**Code:** `src/wearables/connectors/strava/strava-webhook.controller.ts:161-170`

The checklist explicitly requires Zod or class-validator on the webhook payload. The controller uses ad hoc `typeof` checks instead. Those checks also omit important fields/constraints: `owner_id` is not required to be numeric before it is passed to `enqueueActivityFetch`, and `object_type` / `aspect_type` are only checked for truthiness rather than constrained to Strava's allowed enum values.

**Impact:** Malformed-but-truthy events can be recorded into `WearableProcessedEvent` and acknowledged as received, and an activity event with missing/non-numeric `owner_id` can reach the fetch queue call. This undercuts the validation requirement and makes future webhook worker behavior brittle.

**Expected fix:** Add a Zod schema or DTO with class-validator decorators for `aspect_type`, `object_type`, `object_id`, `owner_id`, `subscription_id`, `event_time`, and `updates`; parse/validate before IP/subscription/dedup side effects as appropriate. Add tests for invalid `owner_id`, invalid enum values, and missing required fields.

### 3. HIGH — `StravaActivityFetchQueue` does not actually enqueue the just-updated activity

**Code:** `src/wearables/connectors/strava/strava-webhook.controller.ts:85-95` and `:202-209`

`handleEvent()` calls `await this.fetchQueue.enqueueActivityFetch(body.owner_id, body.object_id)`, but the production `StravaActivityFetchQueue.enqueueActivityFetch()` only logs a debug message and persists nothing:

```ts
async enqueueActivityFetch(ownerId: number, activityId: number): Promise<void> {
  this.logger.debug(`strava.enqueueActivityFetch owner=${ownerId} activity=${activityId}`);
}
```

The build report describes a durable row + cron pattern, but there is no row write here and no pre-existing Strava activity-fetch work item is created by the webhook. Unlike the cited `LeadSyncQueue` pattern, where the pending lead row already exists before the no-op kick, this webhook receives only the activity reference and then drops it after logging.

**Impact:** Accepted first-time activity create/update webhooks can be deduped and acknowledged without any durable record of the activity that must be fetched. A crash, process restart, or simply the current no-op implementation means the updated Strava activity is never fetched or normalized.

**Expected fix:** Persist a durable fetch request/work item in the PR-HK-2.f write-set or explicitly store enough state in an existing model for PR-HK-3 to claim later. Add a test against the real queue implementation (not only a mocked queue) asserting that enqueue creates durable work.

## Positive observations

- The normalizer is clean and deterministic, with real-value assertions for all five required metrics and pinned Strava dedup-key vectors.
- The connector correctly uses `ProviderHttpClient` for all HTTP calls and implements Strava refresh-token rotation correctly.
- The diff respects the write-set mutex: no registry/module wiring changes were made outside `connectors/strava/`.

## Final verdict

FAIL. The connector is close on OAuth, backfill, rate-limit handling, normalizer behavior, and test counts, but the webhook cannot be accepted as production-ready until POST subscription validation fails closed, schema validation uses the required validation mechanism, and accepted activity events are durably enqueued for fetch.
