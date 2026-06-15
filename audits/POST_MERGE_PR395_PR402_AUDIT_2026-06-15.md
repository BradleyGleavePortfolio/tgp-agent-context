FOLLOW_UP_REQUIRED

# Post-Merge PR #395/#402 Audit — R81 Strict Re-Audit — 2026-06-15

**Repo:** `BradleyGleavePortfolio/growth-project-backend`  
**Current `main` HEAD audited:** `fea925a8032f42176fb38a46607f2abe5b8b110e`  
**PR #395 merge commit:** `adc066bd3f597c99c29cc4636dc206e62ef49608`  
**PR #402 merge commit / current HEAD:** `fea925a8032f42176fb38a46607f2abe5b8b110e`  
**Method:** hostile post-merge audit of current `main`; both merge commits' file lists and patches were pulled through `gh api repos/BradleyGleavePortfolio/growth-project-backend/commits/{sha}` and saved as evidence JSON/diff files. Current code was read from detached worktree `/tmp/post-merge-pr395-pr402-main` at `fea925a8`.

## Verdict

**FOLLOW_UP_REQUIRED** — the original PR #395 P0/P1 transaction escape is closed on `main`, and the PR #402 fixes for the original F1–F8 audit findings are present. However, the combined current `main` still has a new rollback/retry correctness bug in the same first-payment emit seam: `NotificationsService.createNotification()` mutates the module-level push throttle (`recentPushes`) before the ambient transaction commits. If the outer Stripe webhook transaction rolls back after `maybeEmitFirstPayment()` and Stripe redelivers within 60 seconds, the retry commits the in-app row but suppresses the push row. P0: 0 · P1: 1 · P2: 0 · P3: 0.

The feature flag remains default-OFF (`FEATURE_ROMAN_FIRST_PAYMENT !== 'true'` returns before any read/write), so production blast radius is currently gated. This is still a must-fix cleanup PR before any flag-on or R81 closure because the PR #402 tests explicitly asserted rollback → redelivery → exactly one row per channel, while masking the production throttle interaction with fake time.

## Merge commit inventories from GitHub API

| Commit | Parent | Files | Additions / deletions | Notes |
|---|---|---:|---:|---|
| `adc066bd` (#395) | `d982d1a2cfc5b9fb7c3836541e91328ba2f5f652` | 12 | +771 / −0 | Added first-payment ledger migration/model, FIRST_PAYMENT kind/emitter/service, webhook callsites, scoped Jest root, and initial specs. |
| `fea925a8` (#402) | `05af67e65d460ad9bf7c098afa79b78ccf44e403` | 13 | +903 / −61 | Threaded tx through notification emit path, added audit entry, docs/design decisions, rollback/refund/sub-coach tests, and OpenAPI timeout bump. |

Evidence saved:
- `/home/user/workspace/audit-work/outputs/POST_MERGE_PR395_commit_adc066bd.json`
- `/home/user/workspace/audit-work/outputs/POST_MERGE_PR402_commit_fea925a.json`
- `/home/user/workspace/audit-work/outputs/POST_MERGE_PR395_github_patches.diff`
- `/home/user/workspace/audit-work/outputs/POST_MERGE_PR402_github_patches.diff`

## Per-original-finding status table

| Source | ID | Original severity | Original finding | Status on current `main` | Evidence |
|---|---:|---:|---|---|---|
| PR #395 audit | F1 | P0 | Notification rows escaped the purchase transaction, so rollback + Stripe retry could duplicate first-payment notifications. | **RESOLVED_ON_MAIN** for autocommit escape; **NEW P1** remains for non-transactional push throttle state. | `tryEmitFirstPayment()` now calls `this.emitter.emit(..., tx)` (`src/notifications/coach-first-payment.service.ts:151-157`); `FirstPaymentEmitter.emit()` passes `tx` into both `createNotification()` calls (`src/notifications/emitters/first-payment.emitter.ts:79-109`); `createNotification()` writes through `const db = tx ?? this.prisma` (`src/notifications/notifications.service.ts:297-331`). New issue below covers `recentPushes` mutation at `src/notifications/notifications.service.ts:317-328`. |
| PR #395 audit | F2 | P1 | Emit-before-commit: celebration rows could persist before the purchase transaction committed. | **RESOLVED_ON_MAIN** for DB rows; **NEW P1** for pre-commit throttle mutation. | Notification rows ride the transaction (`src/notifications/notifications.service.ts:297-331`), and both webhook callsites pass the outer `tx` plus Stripe event id (`src/checkout/checkout-webhook-handler.service.ts:547-551`, `912-915`). |
| PR #395 audit | F3 | P2 | Spec/title mismatch: per-coach-forever implementation vs. per-coach×client wording. | **RESOLVED_ON_MAIN**. | Schema comment states “PER COACH, FOREVER — NOT per coach×client” and `coachId @unique` enforces the scope (`prisma/schema.prisma:6301-6317`); design note records the decision. |
| PR #395 audit | F4 | P2 | Missing test for two different coaches, same client → both emit. | **RESOLVED_ON_MAIN**. | Unit test asserts two distinct coaches with same client each insert/emit (`src/notifications/__tests__/coach-first-payment.service.spec.ts:220-258`). |
| PR #395 audit | F5 | P2 | Refund/chargeback behavior undefined and untested. | **RESOLVED_ON_MAIN**. | Refund handler comment documents retain-by-design (`src/checkout/refund-dispute-handler.service.ts:187-199`); source-level spec locks no ledger touch/delete (`src/notifications/__tests__/first-payment-refund-retention.spec.ts:35-60`). |
| PR #395 audit | F6 | P2 | Missing Stripe Connect/sub-coach attribution test. | **RESOLVED_ON_MAIN**. | Input JSDoc states selling coach attribution (`src/notifications/coach-first-payment.service.ts:29-42`); unit test asserts sub-coach recipient, not head coach (`src/notifications/__tests__/coach-first-payment.service.spec.ts:260-293`). |
| PR #395 audit | F7 | P3 | Test-only `as unknown as` casts in new specs. | **RESOLVED_ON_MAIN**. | New helper uses a single typed cast helper, and prior double-cast callsites were replaced (`src/notifications/__tests__/_first-payment-test-stubs.ts`; current specs no longer contain code-level `as unknown as` in first-payment files). |
| PR #395 audit | F8 | P3 | No audit-log write for once-ever financial-celebration event. | **RESOLVED_ON_MAIN**. | Winning insert writes `notification.first_payment_emitted` with bounded ids/amount/currency/correlation metadata before emit (`src/notifications/coach-first-payment.service.ts:129-149`), and tests assert write/no-write on winner/P2002 paths (`src/notifications/__tests__/coach-first-payment.service.spec.ts:295-344`). |
| PR #402 re-audit | New findings | — | PR #402 re-audit reported no new P0/P1/P2/P3 findings. | **NEW** issue found in this post-merge audit. | The PR #402 rollback specs neutralize the in-process push throttle by advancing `Date.now()` by 120s per read (`src/notifications/__tests__/first-payment-tx-rollback.integration.spec.ts:163-171`, `src/notifications/__tests__/first-payment-webhook.integration.spec.ts:248-254`), hiding the production same-60s retry behavior. |

## Required validation checklist

| Validation target | Result | Evidence / notes |
|---|---:|---|
| Tx escape | **Mostly PASS; NEW P1 at throttle seam** | Ledger row and notification DB rows now use the ambient `tx` (`src/notifications/coach-first-payment.service.ts:108-157`, `src/notifications/emitters/first-payment.emitter.ts:79-109`, `src/notifications/notifications.service.ts:297-331`). The in-memory push throttle remains outside the tx (`src/notifications/notifications.service.ts:317-328`). |
| Stripe webhook idempotency | **PASS** | `BillingService.handleEvent()` checks `stripeProcessedEvent` fast-path then inserts the dedup row inside the outer `$transaction` (`src/billing/billing.service.ts:171-180`, `247-256`), and the handler propagates thrown checkout/fanout failures so Stripe retries (`src/billing/billing.service.ts:258-270`). |
| FIRST_PAYMENT emit gate | **PASS** | `maybeEmitFirstPayment()` returns unless `FEATURE_ROMAN_FIRST_PAYMENT === 'true'`, service is wired, and `tx` exists (`src/checkout/checkout-webhook-handler.service.ts:158-165`). Both successful-payment callsites pass `event.id` and `tx` (`src/checkout/checkout-webhook-handler.service.ts:547-551`, `912-915`). |
| Telemetry registration vs emission | **PASS / no dead PostHog event** | No `COMMUNITY_TELEMETRY_EVENTS` entry was added for first-payment; grep shows first-payment only in notification/audit logs, not the community PostHog registry. Audit action is emitted at `src/notifications/coach-first-payment.service.ts:135-149`. |
| RLS on notification rows | **PASS** | Existing `Notification` table has RLS enabled/forced and per-user `FOR ALL` policy (`prisma/migrations/rls_fitness_backend.sql:63-66`, `161-166`). New `coach_first_payment_notification` ledger has RLS enabled/forced plus service-role all and coach self-read policies (`prisma/migrations/20260614065425_add_coach_first_payment_notification/migration.sql:63-72`). |
| Zod envelope strict | **PASS** | `firstPaymentPayloadSchema` is `.object({ amount, currency, clientId }).strict()` (`src/notifications/emitters/first-payment.emitter.ts:22-28`). |
| Throttle metadata pinned per R79 | **PASS for route metadata / N/A for no new route; NEW P1 for internal throttle interaction** | PR #395/#402 add no controller route needing route-level `@Throttle`; the existing Stripe webhook endpoint has `@Throttle({ default: { ttl: 60_000, limit: 500 } })` (`src/billing/stripe-webhook.controller.ts:50-52`). The new bug is not Nest route metadata; it is `NotificationsService`'s internal module-level push throttle mutating outside the tx. |
| Sibling-merge interactions | **No additional finding beyond NEW P1** | Current `main` includes sibling community/roman/package changes, but the first-payment source paths remain wired as PR #402 intended. No dead telemetry or missing module/controller registration interaction was found. |

## New findings

| ID | Sev | Area | Finding |
|---|---:|---|---|
| N1 | **P1** | Notifications / Stripe retry / transaction boundary | The in-process push throttle is mutated before the Stripe webhook transaction commits, so rollback + redelivery within 60s suppresses the retry's `FIRST_PAYMENT` push row. |

### N1 (P1) — `FIRST_PAYMENT` push can be lost after rollback + Stripe retry within 60s

**File:** `src/notifications/notifications.service.ts:317-328`  
**Related callsites:** `src/checkout/checkout-webhook-handler.service.ts:547-581`, `src/notifications/__tests__/first-payment-tx-rollback.integration.spec.ts:163-171`, `src/notifications/__tests__/first-payment-webhook.integration.spec.ts:248-254`

```ts
317    // Push rate limit: at most 1 push per user per kind per 60 seconds.
318    if (channel === 'push') {
319      const key = `${input.user_id}:${input.kind}`;
320      const last = recentPushes.get(key) ?? 0;
321      const now = Date.now();
322      if (now - last < 60_000) {
323        this.logger.debug(
324          `push rate-limited: user=${input.user_id} kind=${input.kind}`,
325        );
326        return null;
327      }
328      recentPushes.set(key, now);
329    }
331    return db.notification.create({
```

The PR #402 tx fix correctly moves the `Notification` row writes onto the ambient transaction, but the push throttle remains module-level process state (`recentPushes`) and is updated before the transaction commits. The checkout path still calls `maybeEmitFirstPayment(updated, tx, event.id)` before downstream fanout can throw and roll back the outer webhook transaction (`src/checkout/checkout-webhook-handler.service.ts:547-581`).

**Repro:**
1. Enable `FEATURE_ROMAN_FIRST_PAYMENT=true`.
2. Process a first `payment_intent.succeeded` / `checkout.session.completed` inside `BillingService`'s outer transaction.
3. `FirstPaymentEmitter` writes in-app then push via `createNotification(..., tx)`; the push path executes `recentPushes.set('coach_1:first_payment', now)` before `db.notification.create(...)` commits.
4. A downstream step after `maybeEmitFirstPayment()` throws (the code documents that fanout resolver failure rethrows and rolls back the event), so the transaction discards both notification rows and the first-payment ledger row.
5. Stripe redelivers the same event within 60 seconds. The ledger insert wins again, the in-app row is buffered, but the push call sees `now - last < 60_000` and returns `null`; the transaction commits with only the in-app notification.

The PR #402 regression tests do not catch this because both rollback suites explicitly fake `Date.now()` to advance 120 seconds on every read, making the push throttle impossible to hit (`src/notifications/__tests__/first-payment-tx-rollback.integration.spec.ts:163-171`, `src/notifications/__tests__/first-payment-webhook.integration.spec.ts:248-254`). That turns off the production condition that matters: Stripe's retry can arrive immediately, well inside the 60-second window.

**Severity rationale:** P1. This is a real correctness defect in the financial celebration path under a reachable rollback/retry condition. It does not duplicate notifications and the feature flag is still default-OFF, so it is not P0, but it violates the fixed contract that rollback followed by redelivery commits exactly one row per channel.

**Fix prescription:**
- Do not mutate `recentPushes` for transactional notification writes, or move push throttling to a transactional/durable mechanism.
- Minimal safe patch for this seam: in `createNotification()`, only apply the in-process push throttle when `tx` is absent; first-payment already has a DB-backed exactly-once ledger, so generic per-process push throttling is not needed for that transactional emit.
- Stronger patch: replace `recentPushes` with a DB-backed, transaction-aware rate-limit/delivery ledger keyed by `(user_id, kind, channel, window)` so rollback also rolls back throttle state.
- Add a regression test that does **not** advance fake time: simulate first delivery rollback, immediate redelivery, then assert exactly `['inapp', 'push']` commits. The current code should fail that test until the throttle mutation is made tx-safe.

## What's correctly implemented and should not regress

- Server-trusted inputs are preserved: `coachId`, `amount`, `currency`, and `clientId` come from the persisted `ClientPurchase`, not the Stripe webhook body (`src/checkout/checkout-webhook-handler.service.ts:169-175`).
- The first-payment ledger uses direct insert + `coachId @unique` rather than check-then-act (`src/notifications/coach-first-payment.service.ts:102-127`, `prisma/schema.prisma:6314-6323`).
- Non-P2002 errors still rethrow, allowing the outer webhook tx to roll back and Stripe to redeliver (`src/notifications/coach-first-payment.service.ts:111-127`).
- Feature flag posture is default-OFF and read per call (`src/checkout/checkout-webhook-handler.service.ts:163`).
- Payload validation is runtime Zod and strict (`src/notifications/emitters/first-payment.emitter.ts:22-28`).
- RLS coverage exists for both the first-payment ledger and the generic notification inbox rows (`prisma/migrations/20260614065425_add_coach_first_payment_notification/migration.sql:63-72`, `prisma/migrations/rls_fitness_backend.sql:63-66`, `161-166`).

## R0 / rules compliance summary

- **R0 prod-src banned patterns:** CLEAN for PR #395, PR #402, and the combined first-payment production diff. Added-line grep found no `Coming soon`, `@ts-ignore`, `.catch(() => undefined)`, `as unknown as`, or `as any` in changed production source.
- **R0 commit trailers:** Human `Co-authored-by: Bradley Gleave <bradley@bradleytgpcoaching.com>` trailers are present and permitted by the audit brief; no assistant/coauthor bot trailer was found.
- **R72 exhaustive posture:** Prior audits, both merge diffs, current production files, tests, schema/migration, notification RLS, Stripe idempotency, telemetry registry, and throttle surfaces were swept.
- **R77 read-only worktree:** Honored for `/tmp/post-merge-pr395-pr402-main`; evidence/report files only written under `/home/user/workspace/audit-work/outputs/`.
- **R79 pin sweep:** Route-level throttle metadata has no new PR #395/#402 route to pin; existing Stripe webhook throttle is present. Internal push-throttle regression needs a new focused pin as part of N1 fix.
- **R82 tracking discipline:** This is not out-of-lane tech debt; it is a direct P1 cleanup PR requirement before flag-on. No tracking-only deferral is appropriate.

## CI / local execution notes

- GitHub checks at `fea925a8`: `build-and-test`, `rls-floor-guard`, `rls-live-tests`, and `mwb-3-live-tests` are success; `Deploy app` is failure in the check-run list. The deploy failure was not diagnosed here because this audit target is the PR #395/#402 code seam.
- Focused local Jest execution could not run in the detached worktree because `node_modules/.bin/jest` is absent (`npm test -- --runInBand --testPathPattern='first-payment|coach-first-payment'` exited `jest: not found`). The finding above is from source-level execution reasoning and current test inspection.

## Recommendation

**Cleanup PR required before flag-on / R81 closure.** Fix N1 in the PR #402 seam, add the immediate-redelivery regression test without fake clock advancement, rerun the first-payment focused suite plus the backend doctrine-pin sweep, then re-audit. This should not be converted to an R82 tracking issue or accepted as tech debt because it directly undermines the rollback-safety guarantee the follow-up PR was created to close.

## Source evidence files saved

- `/home/user/workspace/audit-work/outputs/POST_MERGE_git_stats.txt`
- `/home/user/workspace/audit-work/outputs/POST_MERGE_r0_trailers.txt`
- `/home/user/workspace/audit-work/outputs/POST_MERGE_nl_coach_first_payment_service.txt`
- `/home/user/workspace/audit-work/outputs/POST_MERGE_nl_first_payment_emitter.txt`
- `/home/user/workspace/audit-work/outputs/POST_MERGE_nl_notifications_service.txt`
- `/home/user/workspace/audit-work/outputs/POST_MERGE_nl_checkout_webhook_handler.txt`
- `/home/user/workspace/audit-work/outputs/POST_MERGE_nl_first_payment_tx_rollback_spec.txt`
- `/home/user/workspace/audit-work/outputs/POST_MERGE_nl_first_payment_webhook_spec.txt`
- `/home/user/workspace/audit-work/outputs/POST_MERGE_schema_migration_evidence.txt`
- `/home/user/workspace/audit-work/outputs/POST_MERGE_telemetry_evidence.txt`
- `/home/user/workspace/audit-work/outputs/POST_MERGE_notification_rls_policy.txt`
- `/home/user/workspace/audit-work/outputs/POST_MERGE_check_runs.txt`
