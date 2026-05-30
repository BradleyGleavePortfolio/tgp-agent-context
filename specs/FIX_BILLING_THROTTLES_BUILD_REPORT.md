# FIX BILLING THROTTLES — BUILD REPORT

Repo: growth-project-backend. Branch: `fix/billing-throttles`. Base: `main`.
Head SHA: `0c88ce3a7ae84a3f38a8ba22706d02affb6187ba`.
PR title: `Fix: payout-failed webhook handling + Stripe-write throttles + start-subscription DTO`.
Commit identity: `Dynasia G <dynasia@trygrowthproject.com>`. No Co-Authored-By / Generated trailers.

## Summary

All six issues from `FIX_BILLING_THROTTLES_BRIEF.md` implemented. Disjoint from
`src/packages/*`, `prisma/schema.prisma`, migrations, and `ai*` (guardrails honored —
no such files touched). No money math changed; B7 only ADDS failure-event cases.

## Per-issue file:line

### B7 (🔴💰 swallowed payout failures) — `src/billing/billing.service.ts`
- **Stale-brief correction:** the brief cited `billing.service.ts:365-373` with "no
  transfer.failed/payout.failed cases." Verified against the real file: `transfer.failed`
  is ALREADY handled (case at `:478`, handler `applyTransferFailed` at `:1227`). The real
  remaining gap was PAYOUT events only.
- New switch cases: `case 'payout.failed':` / `case 'payout.canceled':` →
  `applyPayoutFailed(event, tx)` at **`src/billing/billing.service.ts:496-499`**, sitting
  before the unchanged `default:` "Ignoring unhandled Stripe event type" branch (`:500-501`).
- New handler `private async applyPayoutFailed(event, tx)` at
  **`src/billing/billing.service.ts:1363`**. It:
  - Resolves the connected account id from the event envelope (`event.account`) with a
    fallback to `payout.account`.
  - Finds the cached `PayoutSnapshot` row by `stripe_account_id` (existing model — NO
    schema change, satisfies the "do NOT touch prisma/schema.prisma" guardrail).
  - Records the failure: `last_payout_status = 'failed' | 'canceled'`,
    `last_payout_stripe_id`, `last_payout_amount_cents`, `last_payout_failure_message`
    (composed from `failure_code: failure_message`). This is a cached status mirror —
    NO ledger/money write, and the coach is never marked paid.
  - Emits a `NotificationKind.COACH_ALERT` (existing kind — no new kind invented) only when
    the update actually changed a row, deep-linking the existing
    `COACH_TRANSFER_FAILED_DEEP_LINK` payment-ops surface; notification failure is swallowed
    in a try/catch so the committed status mirror is never rolled back (mirrors
    `applyTransferFailed`).
- **Idempotency (proof):** two layers. (1) Outer `handleEvent()` `StripeProcessedEvent`
  dedup makes a SAME-event-id replay never re-enter the handler. (2) For a DIFFERENT-id
  replay of the same logical failure, the `payoutSnapshot.updateMany` is WHERE-guarded
  `NOT: { last_payout_stripe_id: payout.id, last_payout_status: terminalStatus }`, so the
  second write returns `count = 0` and the COACH_ALERT is skipped (no double-ping). Both
  paths are covered by tests (see below).

### B2 (🔴💰 portal-session not throttled)
- `src/billing/coach-billing.controller.ts:52` — `@Throttle({ default: { ttl: 60_000, limit: 10 } })` on `POST /v1/coach/me/billing/portal-session`.
- `src/billing/mobile-coach-billing.controller.ts:84` — same throttle on `POST /coach/billing/portal-session`.

### B3 (🔴💰 start-subscription not throttled)
- `src/billing/owner-billing.controller.ts:78` — `@Throttle({ default: { ttl: 60_000, limit: 10 } })` on `POST /v1/admin/coaches/:id/start-subscription`.

### B8 (🔴💰 single-use Connect links not throttled) — `src/connect/connect.controller.ts`
- `:67` — `@Throttle({ default: { ttl: 60_000, limit: 10 } })` on `POST onboarding-link`.
- `:83` — same throttle on `POST dashboard-link`.

### B1 (🧹 portal-session dedupe) — clean extraction
- New shared method `BillingService.createCoachPortalSession(coachId)` at
  **`src/billing/billing.service.ts:1499`** holds the single source of truth for the
  3-mode portal logic (SDK session → hosted login-link fallback → STRIPE_NOT_CONFIGURED),
  the customer-id resolution order (CoachSubscription → CoachProfile), and the
  StripeApiError→HttpException translation. Behavior is byte-for-byte preserved.
- Both controllers now delegate: `coach-billing.controller.ts:56` and
  `mobile-coach-billing.controller.ts:88` both call `this.billing.createCoachPortalSession(req.user.id)`.
- `StripeApiService` injected into `BillingService` as the LAST `@Optional()` constructor
  param (after `notifications`) so existing positional `new BillingService(...)` test
  constructions are unaffected; DI fills it in production (it is already a module provider).
- Both controllers' constructors slimmed to `constructor(private billing: BillingService)`
  (dropped now-unused `PrismaService` / `StripeApiService` injections and their imports).

### B4-remainder (🧹 start-subscription validation)
- New `src/billing/start-subscription.dto.ts` — `StartSubscriptionDto` with
  `@IsOptional @IsIn(['flat_300']) plan` and
  `@IsOptional @Type(() => Number) @IsInt @Min(0) @Max(90) trialDays`.
- Wired into the handler at `owner-billing.controller.ts` (`@Body() body: StartSubscriptionDto = {}`).
- Runs through the existing global `ValidationPipe` (`main.ts:115-121`,
  `whitelist + forbidNonWhitelisted + transform`). The controller's defensive trialDays
  clamp is retained (harmless redundancy, no behavior change).

## Throttle convention mirrored
`@Throttle({ default: { ttl: 60_000, limit: 10 } })` — matches the existing Stripe-write
link-minting convention (`src/coach-connect/coach-connect.controller.ts:89`). 10 req/min on
the `default` bucket; enforced by the globally-registered `UserThrottlerGuard`
(`app.module.ts` APP_GUARD).

## Tests (real)
New:
- `test/billing-payout-failed.spec.ts` (6 tests): failure recorded on PayoutSnapshot +
  COACH_ALERT emitted; default "ignoring unhandled" branch NOT hit; coach never marked
  paid (no subscription/invoice writes); `payout.canceled` → terminal `canceled`;
  same-id replay no-op; DIFFERENT-id replay no-op (WHERE-guard); missing-snapshot no-throw skip.
- `test/start-subscription.dto.spec.ts` (8 tests): accepts valid body / empty / boundaries
  0 and 90; rejects invalid plan, trialDays > 90, negative, non-integer, and unknown field.
- `test/billing-throttle-metadata.spec.ts` (5 tests): asserts each of the 5 targeted routes
  carries `THROTTLER:LIMITdefault = 10` and `THROTTLER:TTLdefault = 60000`.

Updated for B1 delegation:
- `test/coach-billing.controller.spec.ts` and `test/mobile-coach-billing.controller.spec.ts`
  rewired to construct a real `BillingService` over the stub prisma + a `TestStripeApi`
  (via a local `makeController` helper) so the controller tests still exercise the full
  portal-session behavior through the new delegation path. All original assertions retained.

## Actual counts
- `npx tsc --noEmit -p tsconfig.json` → **0 errors**.
- `npx eslint` on all 6 changed source files + 5 touched test files → **0 errors/0 warnings**.
- Targeted run (5 specs): **38 passed / 38**.
- `npx jest test/billing` (7 suites): **50 passed / 50**.
- Regression run (`connect-webhook stripe-webhook billing-audit billing-checkout
  billing-drip analytics-instrumentation pr14-guest connect-controller`, 9 suites):
  **95 passed / 95**.

## Deviations
1. **B7 brief line numbers were stale** and asserted `transfer.failed` was missing — it was
   already implemented. Scope reduced to the genuinely-missing `payout.failed` /
   `payout.canceled` (`payout.canceled` included as the brief permitted "if Stripe emits it").
2. **No new notification kind / no schema change** — reused the existing `PayoutSnapshot`
   model as the persisted failure marker and the existing `COACH_ALERT` kind, per the
   "trivial reuse" and "do NOT touch prisma/schema.prisma" guardrails.
3. **B1 done as the full clean extraction** (brief's preferred option), not the minimal
   "ensure both identical" fallback.
