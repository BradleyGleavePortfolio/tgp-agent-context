# S-DUNNING — Smart Dunning v2 live-readiness (lane report)

Builder lane S-DUNNING. T4. The flag is NOT flipped. Nothing was merged, and production was not touched.

## Progress log

- 2026-10-01: Audited the v2 path end to end at backend `be667142` (main moved to `bab05f44` after #625 and #597 merged; this branch is rebased onto it).
- Backend PR opened: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/628 (branch `agent/clinic/s-dunning-v2-live`, first head `672c06b6`, final head `691528a0`).
- Mobile PR opened: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/322.
- Backend rebased onto #622 (`10dff85c`): carve-outs merged, #622 test fakes aligned (`691528a0`).
- Worktrees `wt/s-dunning-be` and `wt/s-dunning-mob` removed (dependency symlinks unlinked first; shared deps untouched).

## Audit findings (backend)

| ID | Sev | Finding | Fix |
|---|---|---|---|
| F1 | P0 | v2 was not wired. The dispatcher had no production caller, and the lockout sweep needed v1 `step_index===3`, which never happens (v1 tick/sweeper have no cron). The v1 sweeper, if run, cancels the subscription on Day 7. | The webhook claims and advances steps. The hourly v2 sweep sends Day 1/3/7 and locks on Day 10. v1 tick and cancel sweeper are no-ops under v2. |
| F2 | info | Who charges: Stripe retries only. Our code has no charge call, so there is no double charge. | Stripe settings below. |
| F3 | P0 | The recovery clear opened a second tx on the ClientPurchase row the outer webhook tx had locked, which deadlocked until timeout on every redelivery. | The clear joins the caller tx. |
| F4 | P0 | Blocker dismissal hit every user (cross-tenant). It had `as never` and swallowed catches in the tx, and always forced entitlement on. | Scoped to the client. No swallowed catches. Entitlement is restored only if the purchase was locked. |
| F5 | P1 | invoice.paid on the skipped-resync path skipped dunning resolution, so the client stayed locked after paying. | Resolution runs on that path too. |
| F6 | P1 | Any `customer.subscription.updated` on a past_due sub re-set entitlement and lifted the lock. | Lock authority is `locked_out_at`. Another live grant (comp / kept access) means no lock. |
| F7 | P1 | `ClientEntitlementGuard` gave 402 to past_due from Day 0. | Under v2, past_due with an active, unlocked cycle entitles. |
| F8 | P1 | Data export, account deletion and the coach thread were blocked while locked. | Allow-listed (exact paths for messages). |
| F9 | P2 | The sweep was not overlap-safe (double lock and double telemetry across machines). | CAS lock plus an in-process running flag. |
| F10 | P2 | Stale cycle anchor (v1 reopen keeps the old `entered_at`). | The anchor is the v2 claim. Unclaimed rows are never swept, which keeps the flip safe. |
| F11 | P1 | A refund opened a late-reversal cycle, so a coach refund would lock the client. | Disputes only. |
| F12 | P2 | Hard declines suppress Stripe retries and their webhooks. | Notices are time-driven by the sweep. |
| F13 | P2 | The app had no dunning status route, and `lockout_copy` is stripped by the error filter. | `GET /v1/checkout/dunning`. |
| F14 | P3 | Flag missing from the prod-switches registry and `.env.example`. | Registered, default OFF. |
| Cancel | ok | Voluntary cancel: `cancel_at_period_end` keeps access, then `subscription.deleted` ends it via the paywall. No dunning. | e2e C covers it. |
| Comp | ok | Comp / invite-code grants have no Stripe subscription, so they never map. | Defensive `isEligiblePurchase` added. Add the `source` check after C01's column lands. |
| TZ | ok | All cadence math is UTC instants. Copy dates use the client's NotificationPreferences.timezone (default America/Los_Angeles). | Unit test covers it. |

## Stripe dashboard settings the owner must have (live mode)

1. Revenue recovery > Retries: a custom schedule (not Smart Retries) with 3 retries at **1, 2 and 4 days after the previous attempt**, which gives Days 1, 3 and 7.
2. If all retries fail: **Leave the subscription past-due**. Do not cancel it or mark it unpaid.
3. Revenue recovery > Emails: turn "Send emails when card payments fail" **OFF**, but only after the transactional email provider is verified live in production.
4. Customer portal (live): update payment methods ON, invoice history ON, cancellation at end of billing period, no proration or refund.
5. Webhook endpoint events: invoice.payment_failed, invoice.paid, invoice.payment_succeeded, customer.subscription.created/updated/deleted, customer.updated, charge.dispute.created, charge.refunded, checkout.session.completed, payment_intent.succeeded, payment_intent.payment_failed.

Sources: https://docs.stripe.com/billing/revenue-recovery/smart-retries , https://docs.stripe.com/billing/subscriptions/overview , https://docs.stripe.com/billing/revenue-recovery/customer-emails , https://docs.stripe.com/customer-management

## Pull requests

| Repo | PR | Branch | Head | CI |
|---|---|---|---|---|
| backend | https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/628 | `agent/clinic/s-dunning-v2-live` | `691528a06c28e7f9394045ee2c76fd83d96d2826` (rebased on `10dff85c`, after #625 and #622 merged) | all green (build-and-test, R75, schema parity, CodeQL, rls, deploy-readiness) |
| mobile | https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/322 | `agent/clinic/s-dunning-lockout-screen` | `2d77399dcc8cdd1c1de91c1123b0ae1f5cba1c1d` (base `c4963f8`) | all green (Typecheck/lint/test, CodeQL) |

Both PRs are tier T4. Each body has the tier header and a fix-round table. Neither is merged.

## Additional finding found during the mobile work

| ID | Sev | Finding | Disposition |
|---|---|---|---|
| F15 | P1 | Updating the card in the Stripe portal does not charge the open invoice. Stripe retries "only execute after detecting a new payment method", and none remain after Day 7. A client locked on Day 10 who only updates the card stays locked. | Mobile copy tells the client to pay the open invoice under Invoice history, which needs the portal's invoice history ON. Owner decision needed for a backend auto-pay (`invoices.pay` on `customer.updated` during an active cycle). That would be our code charging, so it is not built here. |
| F16 | P2 | The existing ClientPackagesScreen update-card path opens the portal in BrandedCheckoutWebView. The portal's return URL (`com.growthproject.app://settings`) is not a `checkout/success` or `checkout/cancel` link, so the webview may show "Checkout link not allowed" on return. This is unverified on device. | Not changed (dead today: `getPaymentStatus().dunning` is always null). The new banner and lockout use `openAuthSessionAsync`, which closes on the scheme. |
| M1-M8 | | Mobile: there was no LOCKED_DUNNING handling, no lockout state, no reachable-screen routing, no Days 0-9 banner, and errors were generic. The paywall could stack on the lockout, and the status 404 during rollout would have been reported to Sentry. | Fixed in mobile #322 (see its fix-round table). |

## Tests run

Backend, targeted `--runInBand`: dunning-v2-e2e-lifecycle (four owner flows: A recover on Day 3, B lock on Day 10 then unlock on pay, C voluntary cancel, D comp grant, plus D2/F3/F5/F11/uncertainty/flag-OFF), dunning-v2-service, lockout-guard (unit, e2e, privacy-exact, allowlist route table), cadence, copy, feature-flag, dunning.service, checkout-webhook-handler, checkout-webhook-fee-split, cancel-pending-on-refund, refund-dispute-handler, first-payment-webhook.integration, voice-policy (3 suites), deploy-readiness, prod-readiness, entitlement-guards-mounted, roles-enforced, openapi-spec, pilot-coach-allowlist.bootstrap, purchase-fanout (2 suites), payment-ops.controller, ai-consent (all). All pass. `tsc --noEmit` is clean after the final rebase. eslint on changed src is clean. check-r75 range: net -1 `as any`, -2 `as never`, -2 empty catch. Vendor-name guard passes.

Mobile: all 374 jest suites, run in targeted `--runInBand` batches, pass. `useWearableInsight` flaked once in a long batch on a timing assertion and passed alone; that file is unrelated. `tsc --noEmit` is clean. eslint has 0 errors (the warnings are pre-existing). Vendor guard passes. CI is green.

## Flip plan (do NOT flip; operator-only)

Preconditions (all of them):
1. Backend #628 is merged and deployed. Mobile #322 has shipped in a build clients actually run. Older builds show per-screen 403 errors instead of the lockout screen.
2. The owner confirms Stripe settings 1-5 above in live mode, especially the 1/2/4-day retry schedule, "leave past-due", and portal invoice history ON.
3. Email transport is live. `flyctl secrets list -a backend-spring-lake-3890` (names only) shows `RESEND_API_KEY` and `EMAIL_TRANSPORT`. Only after that, turn Stripe's failed-payment emails off.
4. Read-only inventory of open v1 cycles. These are adopted only on their next `invoice.payment_failed`. A hard-declined cycle with no further retries is never adopted, so it is never locked. Handle those by hand.
   `SELECT ds.id, ds.purchase_id, ds.entered_at, ds.step_index, ds.attempt_count, cp.status FROM "DunningState" ds JOIN "ClientPurchase" cp ON cp.id = ds.purchase_id WHERE ds.status = 'active';`
5. Flag workflow: main's `fly-feature-flags-set.yml` cannot set `FEATURE_DUNNING_V2`. It also always re-sets FEATURE_SCOUT_INGEST and FEATURE_EXTENSION_PAIRING. Apply `ops/reports/S-DUNNING-flags-workflow.patch` (adds a closed `feature_dunning_v2` choice input: unchanged / true / unset) in its own PR. Preferably do this after #584 lands, which converts the other inputs to closed choices with "unchanged", and rebase the patch onto it.

Flip:
`gh workflow run "Fly Feature Flags Set (operator)" -f app=backend-spring-lake-3890 -f confirm=SET -f feature_scout_ingest=<current> -f feature_extension_pairing=<current> -f feature_dunning_v2=true`
This sets env `FEATURE_DUNNING_V2=true` (exactly the string `true`) on backend-spring-lake-3890.

Post-flip checks (read-only):
- `flyctl secrets list -a backend-spring-lake-3890` lists FEATURE_DUNNING_V2.
- Within an hour, `flyctl logs -a backend-spring-lake-3890` shows `dunning_v2.sweep_completed` at minute 07 UTC, with `locked: 0` for the first 10 days. Unclaimed rows are never swept.
- `GET /v1/checkout/dunning` for a test client returns `enabled: true, state: "none"`.
- `SELECT count(*) FROM "DunningState" WHERE status='active' AND step_index >= 0;` rises only as new failures arrive. `SELECT count(*) FROM "DunningState" WHERE locked_out_at IS NOT NULL AND status='active';` stays 0 until the first Day 10.
- No `dunning_v2.locked` event appears for any purchase with `amount_cents = 0` or no `stripe_subscription_id`.

Rollback: `flyctl secrets unset FEATURE_DUNNING_V2 -a backend-spring-lake-3890` (or the patched workflow with `feature_dunning_v2=unset`). Effect after the machines restart:
- The lockout guard, the v2 sweep and the status route's `enabled` all turn off at once.
- ClientEntitlementGuard returns to the v1 query, so past_due clients see the paywall again, as before.
- Rows already locked keep `locked_out_at` but are ignored. Their `entitlement_active=false` stays until `invoice.paid` resyncs the purchase.

## Open risks

1. F15 recovery: after Day 7, updating the card alone does not unlock. The client must pay the open invoice in the portal. Owner decision needed on auto-pay.
2. Hard declines on cycles open before the flip are never adopted by v2, so they are never locked or noticed. Use the inventory query at flip time.
3. The Day-0 notice is sent fire-and-forget after the claim. If the process dies between the claim and the send, that one notice is lost (later steps still send).
4. Client cancels while in dunning: dunning continues for the unpaid invoice. This is the default and is not confirmed by the owner.
5. B-FEE #627 also edits `checkout-webhook-handler.service.ts` (different functions). Whichever merges second rebases.
6. When v1 recovers a cycle, its recovery email still sends alongside v2's unlock. Duplicate copy is possible.
7. F16: the legacy ClientPackagesScreen webview portal return is unverified on device.
8. `ClientPurchase.source` (C01) is not on main yet. The comp-grant exclusion relies on `amount_cents > 0` and `stripe_subscription_id` until it lands.
