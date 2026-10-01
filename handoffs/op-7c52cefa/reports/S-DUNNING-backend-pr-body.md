## Tier header

- **Tier:** T4
- **Why:** Money and access. This changes when a paying client loses access (Day-10 lockout), when they get it back (payment), and what the webhook does inside BillingService's transaction. Everything stays behind `FEATURE_DUNNING_V2` (default OFF). The flag is not flipped here.
- **T4 trigger scan:** payments / Stripe webhook path (`checkout-webhook-handler.service.ts` invoice.paid, invoice.payment_failed, dispute probe) — yes. Access control (`DunningLockoutGuard`, `ClientEntitlementGuard`) — yes. Crons (v2 sweep moves from daily to hourly) — yes. No schema change, no migration, no package.json change.
- **T3 trigger scan:** new authenticated read route `GET /v1/checkout/dunning`, scoped to `req.user.id`. Registry rows: `prod-switches.yml` and `.env.example`.
- **Bounded T1:** test-only fixtures (`test/fixtures/stripe/dunning-v2/*.json`) and the in-memory test double (`test/support/dunning-v2-fake-prisma.ts`).
- **Builder-owner:** S-DUNNING builder lane. Builders never audit their own change, so an independent T4 audit is required before merge.
- **Acceptance evidence:** `test/dunning-v2-e2e-lifecycle.spec.ts` runs the four owner flows through the real webhook handler, v1 + v2 services, the sweep and both guards, using Stripe-shaped fixtures and a fake clock. Unit specs are rewritten or extended. Tests run are listed below.
- **Promotion triggers:** independent T4 audit, green CI, and the owner confirming the Stripe dashboard settings below. Only then does the operator follow the flip plan. Flipping is a separate, operator-only step.

## What was wrong (audit at be667142)

| ID | Severity | Finding |
|---|---|---|
| F1 | P0 | v2 was never wired. `DunningV2Dispatcher.dispatchStep` had no production caller, so no v2 notice ever went out. The lockout sweep needed `step_index === 3`, which only the v1 tick sets, and v1 tick/sweeper have no cron. Under v2 the lockout could never fire. If the v1 sweeper were run by hand, it would cancel the Stripe subscription on Day 7. |
| F3 | P0 | Deadlock on recovery. `applyImmediateClear` opened a second transaction to update the ClientPurchase row that BillingService's outer transaction had just locked. It waited until the outer transaction timed out, on every Stripe redelivery, so paying never unlocked the client. |
| F4 | P0 | Cross-tenant write. The blocker dismissal `where: { user_id: { not: undefined } }` dismissed every user's DUNNING_BLOCKER. It also used `as never` and `.catch(() => undefined)` inside a transaction, and always forced entitlement on. |
| F5 | P1 | invoice.paid returned early when the outer tx was held without a prefetched subscription. Dunning resolution was skipped and the event was marked processed, so the client stayed locked after paying. |
| F6 | P1 | The lock depended on `entitlement_active = false`, but every `customer.subscription.updated` for a past_due subscription sets it back to true. The lockout lifted silently. |
| F7 | P1 | `ClientEntitlementGuard` returned 402 for `past_due` from Day 0, which contradicts "access through Day 9". |
| F8 | P1 | While locked, data export, account deletion and the coach thread were blocked. |
| F9 | P2 | The sweep used `update where id`, so overlapping machines double-locked and double-emitted telemetry. |
| F10 | P2 | The cycle anchor was stale. v1 reopen keeps the old `entered_at`, and the lockout was anchored on the last failure. |
| F11 | P1 | `charge.refunded` opened a late-reversal cycle, so a refund issued by the coach would dun and lock the client. |
| F12 | P2 | Hard declines. Stripe does not execute a scheduled retry until a new payment method exists, so Day 1/3/7 webhooks may never arrive. Notices must be time-driven. |
| F13 | P2 | The client had no dunning status route (mobile has a hard-null TODO for it). |
| F14 | P3 | `FEATURE_DUNNING_V2` was missing from `prod-switches.yml` and `.env.example`. |

## Fix round

| Finding | Change | Commit | Test |
|---|---|---|---|
| F1, F12 | Webhook `invoice.payment_failed` calls `recordPaymentFailed` after v1. It claims Day 0 by CAS (`step_index -1 -> 0`, stamps `entered_at`) or advances by elapsed time. Notices are sent after the claim, fire-and-forget, so there is no push/email HTTP inside the tx. The hourly sweep (`7 * * * *` UTC) sends Day 1/3/7 when Stripe sends no webhook and locks on Day 10. v1 `tick()` and the cancel sweeper are no-ops under v2. | d94d54aa | e2e A, B; service "sends the due step from the sweep", "advances by elapsed time" |
| F3 | `applyImmediateClear(purchaseId, via, db?)` joins the caller's tx. New `resolveDunningOnPaid(purchaseId, tx)` in the handler. | d94d54aa | e2e F3 (no extra `$transaction`, every ClientPurchase write on the tx); service "joins the caller transaction" |
| F4 | Dismissal scoped to the client's `user_id`, `read_at: null`. No swallowed catches, no casts. Entitlement is restored only if the purchase was locked. | d94d54aa | e2e B (other tenant untouched); service "does NOT turn entitlement on when not locked" |
| F5 | The skipped-resync path still runs `resolveDunningOnPaid`. | d94d54aa | e2e F5 |
| F6 | Lock authority is `locked_out_at != null && status 'active'`. A client who also holds another live grant (comp / invite-code / kept access) is not locked. | d94d54aa | e2e B (subscription.updated after lock keeps the lock), D2; guard spec "lock authority" |
| F7 | Under v2, `past_due` with an active, unlocked cycle entitles. With the flag off the query is unchanged. | d94d54aa | e2e A (allowed on Day 0), flag-OFF test (402 as before) |
| F8 | Allow-list adds `me/data-export/*`, `me/delete-account*`, and exact `messages`, `messages/read`, `messages/unread-count`, `messages/report`. Voice upload and coach-review stay locked. | d94d54aa | route-table spec (exact reachable set), guard spec, e2e B |
| F9 | Lock CAS `updateMany where { id, status: 'active', locked_out_at: null }`. Step CAS on `step_index`. In-process `running` flag in the scheduler. | d94d54aa | e2e B (two parallel sweeps, one lock, one telemetry event); service "two racing claims" |
| F10 | Anchor on `entered_at`, stamped by the v2 claim. The sweep ignores unclaimed (`-1`) rows, so a stale anchor can never lock someone at flip time. | d94d54aa | service "never sweeps an UNCLAIMED cycle" |
| F11 | Late-reversal probe on `charge.dispute.created` only. A dispute cycle enters at Step 2 with `entered_at = now - 3d` (coach at +4d, lock at +7d). | d94d54aa | e2e F11 |
| P8 safety | Lock only on positive evidence: purchase `past_due`/`unpaid`, and Stripe subscription not active/trialing/canceled. A Stripe error skips the tick. | d94d54aa | e2e "never locks on uncertainty"; service `it.each` skips |
| Comp | `isEligiblePurchase`: recurring, `amount_cents > 0`, `stripe_subscription_id` set, and `source` null once C01's column exists. | d94d54aa | e2e D, D2; service eligibility |
| F13 | `GET /v1/checkout/dunning` returns `{ enabled, state none/past_due/locked, amount_cents, currency, failed_at, lockout_at, locked_at, day, coach_name, card_last4 }`. Reachable while locked. | d94d54aa | service getClientStatus; e2e A/B |
| F14 | `prod-switches.yml` row (tier feature, prod_default OFF, never auto-flipped) and `.env.example`. | d94d54aa | deploy-readiness + prod-readiness suites |
| Copy | Asserts no exclamation mark in any v2 copy string. | d94d54aa | service "no shipped dunning copy contains an exclamation mark" |
| Rebase on #622 | Kept #622's exact METHOD+PATH AI-consent carve-out next to the F8 allow-list. The consent lockout fakes now answer the other-live-grant read, and the route-table "/me stays locked" check excludes the account-rights prefixes | 691528a0 | ai-consent-dunning-lockout.e2e, dunning-v2-lockout-privacy-exact, allowlist route table |

## Who charges (no double charge)

Our code never charges. v2 makes no charge, invoice-pay or payment-intent call (the only Stripe call v2 adds is a read-only `retrieveSubscription` before locking). Every charge on Days 1/3/7 is Stripe's own retry, so the schedule must be set in Stripe (below). v1's cancel sweeper is disabled under v2, so the subscription is never cancelled by us.

## Stripe dashboard settings the owner must have (live mode)

1. Billing > Revenue recovery > Retries: **custom retry schedule**, not Smart Retries. Three retries: **1 day, 2 days, 4 days after the previous attempt**, which gives Days 1, 3 and 7.
2. After all retries fail: **Leave the subscription past-due**. Do not choose cancel (access would end on Day 7 via `customer.subscription.deleted`) or mark unpaid (access ends and the hosted invoice is invalidated).
3. Revenue recovery > Emails: **"Send emails when card payments fail" OFF**, so the client does not get two sequences. Only switch it off once the transactional email provider is confirmed live in production. Otherwise leave it on.
4. Customer portal (live): **update payment methods ON**, **invoice history ON**, cancellation **at end of billing period**, no proration or refund.
5. Webhook endpoint subscribed to: `invoice.payment_failed`, `invoice.paid`, `invoice.payment_succeeded`, `customer.subscription.created/updated/deleted`, `customer.updated`, `charge.dispute.created`, `charge.refunded`, `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`.

## Recovery caveat (F15, owner decision, not changed here)

Stripe does not charge the open invoice just because the card was updated in the portal. Retries "only execute after detecting a new payment method", and after the Day-7 retry none remain. A locked client must therefore pay the open invoice from the portal's Invoice history (the mobile copy says so, mobile PR #322). The alternative is a follow-up: on `customer.updated` with a changed default payment method during an active cycle, call `invoices.pay`. That means our code charging, so it needs the owner's approval.

## Owner rules honoured

- Voluntary cancel (`cancel_at_period_end`) keeps access through the paid period, then ends via `customer.subscription.deleted` (paywall). No invoice fails, so it is never routed into dunning (e2e C).
- Invite-code / free grants never enter dunning (e2e D, D2). After C01's `ClientPurchase.source` lands, the eligibility check also excludes any non-null `source`.
- Every 403 carries `code: LOCKED_DUNNING` and a message that gives the next action.

## Overlap

- **B-FEE (#627)** also edits `src/checkout/checkout-webhook-handler.service.ts`. This PR touches only: the dunning block at the end of `applyInvoicePaid` (now `resolveDunningOnPaid`), the skipped-resync early return, the tail of `applyInvoicePaymentFailed`, `fireLateReversalProbe`, and the `charge.*` case guard. No fee or split code is touched. Whichever lands second rebases.
- **#622 (R2a AI consent)** merged while this PR was open. This PR is rebased on it (`10dff85c`), and both carve-outs are kept.
- **#625** merged. This PR is rebased on it. It has no migration of its own.

## Flip plan (do NOT flip in this PR)

The full plan is in the lane report. In short: main's `fly-feature-flags-set.yml` cannot set `FEATURE_DUNNING_V2` today, so a small workflow change adding a closed `feature_dunning_v2` choice input (unchanged/true/false) is needed. #584 rewrites that file. Before the flip, the owner confirms the Stripe settings above. After the flip, run read-only checks: the sweep log `dunning_v2.sweep_completed` hourly, and `GET /v1/checkout/dunning` for a test client. Rollback is to unset the flag, which restores v1 behaviour at once (guard and sweep are hard no-ops when off).

## Tests run (targeted, `--runInBand`)

dunning-v2-e2e-lifecycle (10), dunning-v2-service, dunning-v2-lockout-guard, dunning-v2-lockout-guard.e2e, dunning-v2-lockout-allowlist-route-table, dunning-v2-cadence, dunning-v2-copy, dunning-v2-feature-flag, dunning.service, checkout-webhook-handler, checkout-webhook-fee-split, cancel-pending-on-refund, refund-dispute-handler, first-payment-webhook.integration, voice-policy-{integration,paywall.integration,lint-contract}, deploy-readiness, prod-readiness/*, entitlement-guards-mounted, roles-enforced, openapi-spec, pilot-coach-allowlist.bootstrap, purchase-fanout-{hooks,tx-plumbing}, payment-ops.controller. All green. Also clean: `tsc --noEmit`, eslint on changed src files, `check-r75 --mode=range` (net -1 `as any`, -2 `as never`, -2 empty catch), vendor-name guard.
