# Bank Payout / ACH / Stripe Connect — Phase A backend builder

**Builder model:** Opus 4.8
**Worktree:** `/home/user/workspace/tgp/backend-ach-payout`
**Branch:** `feature/bank-payout-ach`
**Base:** `origin/main` at `9322eeb`

## Operator-locked decisions (do NOT re-debate)
1. **AWS-SDK approach = Option A: CORE dep.** Add `@aws-sdk/client-s3` to top-level `dependencies` in `package.json` so every install gets it. No optional extras, no peer-dep gymnastics.
2. **StripeConnect injection = Option A: constructor injection.** Pass `StripeConnect` (or whatever the service-token name is) into `BankPayoutService` constructor via standard NestJS DI. NO service locator, NO global registry pattern. Tests can inject fakes cleanly.
3. **Fee-formula penny reconcile = Option A: platform absorbs the delta.** Coach's ledger shows the clean computed number; no "Adjustment: $0.01" line items appear on coach UI. Platform eats the 1¢ delta in internal reconciliation reports.

## Mission
Implement Phase A of `strategy/BANK_PAYOUT_AND_MILESTONE_SHAREABLES_SPEC.md` from `tgp-agent-context` branch `spec/bank-payout-spec`. The spec is your source of truth.

**Phase A scope (this PR):**
- Section §2 entire (Bank-Account Payouts backend module): module sketch, `PayoutMethod` Prisma model, migration, signup-flow extension, payout routing logic on `payout.paid` webhook, `PlatformFeeService.compute(...)`, fee-formula worked examples
- Section §1.2-§1.3 (architecture decision context)
- Section §5 KYC / 1099 posture wiring (read-only — note expectations into code comments where they affect schema/services)

**Anti-scope (LATER, NOT THIS PR):**
- §3 First-Payment Wow Screen (separate mobile PR)
- §4 Coach Milestone Shareables (separate PR)
- §6 Treasury upgrade path (deferred to v1.x)

## Read FIRST — ground truth (in order)
1. `/tmp/BANK_PAYOUT_SPEC.md` (already saved locally — sections 0, 1, 2, 5 are mandatory; sections 3, 4, 6 are for context)
2. Existing `src/checkout/*` — understand the current Stripe payment flow + how webhooks are received
3. Search backend for any existing `StripeConnect` integration: `grep -ri "StripeConnect\|stripe.*payout" src/ --include="*.ts" | head`
4. `prisma/schema.prisma` — existing `Purchase`, `Package`, `User`, any payout-related tables
5. Existing `src/notifications/notification-kind.ts` for adding any new kinds

## Hard constraints
- **Additive migration only.** New table `PayoutMethod` is fine. ZERO `DROP/RENAME/ALTER COLUMN TYPE/TRUNCATE/DELETE FROM` on existing tables.
- **Constructor injection only.** No `Reflect.metadata` shortcuts, no `forwardRef` chains unless strictly required and documented.
- **Penny delta absorbed in `PlatformFeeService`**: compute reports the user-visible figure; internal reconciliation uses the actual Stripe-charged figure. Write a unit test asserting the abstraction.
- **Add `@aws-sdk/client-s3` as a top-level dep** in `package.json`. Pin a current stable version. Run `npm ci` after change.
- **Feature flag**: `FEATURE_BANK_PAYOUTS_V2` defaults OFF. Service methods MUST no-op (and return safe defaults) when flag OFF.
- **Sonnet 4.6 FORBIDDEN as agent runtime.**
- **Webhook signature verification mandatory** — reject `payout.paid` webhook on unverified signature with 401.
- **No KYC enforcement in this PR** — §5 wiring is read/comments only; the actual 1099 generator is a later PR.

## Hard gates (R66 — full-suite-before-PR)
1. `npx tsc --noEmit` exits 0
2. Migration runs clean and is additive-only
3. Full non-RLS/non-OpenAPI Jest lane passes
4. v1 dunning 26/26 stays green
5. Entitlement pins 17/17 stays green
6. New tests cover:
   - `PayoutMethod` CRUD + idempotency on signup-flow bank link
   - Payout routing logic: card-paid purchase routes to card-fee tier; bank-paid routes to bank-fee tier
   - `PlatformFeeService.compute` matches each worked example in §2.7 exactly (including the $1k ACH example landing at ~$32.15 per the corrected formula `2% + 50% × (card_cost - stripe_actual_cost)`)
   - Penny-absorb behavior: a fee that computes to $32.15 vs actual Stripe charge of $32.16 — user-visible is $32.15, internal reconciliation field holds $32.16
   - Webhook signature: verified payload mutates state; unverified payload returns 401 and leaves state unchanged
   - Constructor injection: a unit test that constructs `BankPayoutService` with a mocked `StripeConnect` and verifies the service routes calls through the mock
   - Feature flag OFF: all service methods no-op
7. R70 fail-fast lane if present, SKIP-BECAUSE otherwise

## Workflow
1. Read spec sections 0/1/2/5 + existing checkout code first
2. Add AWS-SDK dep, run `npm ci`, confirm no breakage
3. Schema migration + `PayoutMethod` model
4. `src/payouts-v2/` module bootstrap: service + controller + webhook handler + provider abstraction (even if only one provider for now, mirror B5 pattern)
5. `PlatformFeeService` + tests with EVERY worked example from §2.7
6. Signup-flow extension (§2.4)
7. Webhook routing (§2.5)
8. Penny-absorb invariant test
9. Feature-flag invariant tests
10. Commit title-only format, push every commit (R64)
11. PR title: `feat(payouts): bank-account ACH payouts v2 (FEATURE_BANK_PAYOUTS_V2 off)`
12. Journal entry in `/tmp/tgp-agent-context/handoffs/dispatch.json`

## Deliverables (final message)
- Branch + final commit SHA(s)
- PR URL
- Test counts (+ which worked examples pass)
- TypeScript exit code
- Migration SQL path
- Confirmation feature flag defaults OFF
- Confirmation `@aws-sdk/client-s3` added as core dep + npm ci clean
- Token usage
