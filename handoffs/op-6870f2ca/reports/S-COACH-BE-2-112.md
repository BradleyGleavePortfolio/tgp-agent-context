# S-COACH-BE-2 (agent 112) — report

Clean-stop order received 13:34 PDT. Both assigned PRs were started and are finished below. Nothing assigned is left NOT STARTED.

## PR #641 — feat(money): coach Money read model (fix round 1, T4)

- Branch `agent/clinic/s-coach-money-be`; head **bb17e19ac795bee103209fa8d95edc16c9471728** (fix commit) on top of merge commit 3bf53a33 (backend main 3bd6215b merged cleanly, no new env names).
- PUSH HOLD respected: pushed only after AUD-SOL-5 posted (comment 5960713012, 20:13Z) and the operator lifted the hold.
- PR body updated (tier header + Fix round 1 table); fix-round comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/641#issuecomment-5961055442

| Finding | Disposition | Test |
|---|---|---|
| B-641-1 | CLOSED: card-update link time = latest SENT DunningAttempt `sent_at` (PaymentReminder rows are never marked sent in production) | `test/coach-money-production-writes.spec.ts` via real DunningService recordFailure + tick; provider-failure case |
| B-641-2 | CLOSED: PAID_WHERE excludes chargeback_lost / refunded / lost-dispute purchases (paid filter, new clients, first payment); `charged_back` state | production-writes via real RefundDisputeHandlerService + SplitLedgerService; won case |
| B-641-3 (Sol) | CLOSED: one validated currency per summary (`currency`, `currencies`, `?currency=`, `400 MONEY_CURRENCY_INVALID`); query scope + in-memory guard; no FX | unit block + ported Sol probe |
| B-641-4 (Sol) | CLOSED: MRR at the real cadence (week x 52/12, month / count, year / 12 x count), combo recurring companion, billing statuses only, rounded once | unit block + ported Sol probe (quarterly 4,000, was 12,000) |
| C-641-1 | CLOSED: refunds / lost chargebacks land in the window they happened | production-writes refund-today case |
| C-641-2 | CLOSED in #646 | see below |
| C-641-3 | CLOSED: `held_from_next_sale_cents: number or null`, feature-detected #627 PayeeRecovery (open, amount - collected, by currency); no dependency on #627 merging | unit |
| C-641-4 | CLOSED: `GET /v1/coach/money/export.csv?from&to` (20,000-row cap, `MONEY_EXPORT_TOO_LARGE`) | unit + production-writes |

Tests (all via ops/heavy.sh):
- `npx jest --runInBand test/coach-money.service.spec.ts test/coach-money-production-writes.spec.ts` -> 2 suites, 50 passed.
- `npx jest --runInBand test/coach-connect.service.spec.ts test/roles-enforced.spec.ts test/openapi-spec.spec.ts test/route-doc-drift.spec.ts test/dunning-v2-lockout-allowlist-route-table.spec.ts test/dunning.service.spec.ts test/refund-dispute-handler.service.spec.ts test/coach-money-production-writes.spec.ts test/invite-grant-authorization.spec.ts` -> 9 suites, 138 passed.
- Failing-before: production-writes spec against the 563e3f80 service (config ops/logs-be2/jest-nodiag.config.cjs) -> 5/5 fail.
- r75 range 563e3f80..bb17e19a: OK. Prettier written on the new files; eslint on changed files: no output.
- Note: prettier was applied after the last local jest run (format-only); CI build-and-test at bb17e19a is the check of record.

## PR #646 — fix(payments): never send client Stripe secrets to coach routes (NEW, T4)

- Branch `agent/clinic/coach-payments-field-select` off main 3bd6215b; head **ea919f6b5785502f4dec1781f0fbbe4081aa8e0a**. CI: ALL checks pass (deploy-readiness-gate skipped, as usual).
- C-641-2 CLOSED: allow-list selects (`src/checkout/coach-payments.select.ts`) on `GET /v1/coach/payments/purchases`, `/purchases/:id` (purchase, ledger, transfers, dunning), `/failed`, `/earnings`, and `GET /v1/coach/packages/:id/subscribers` (the same leak, found by grep).
- Regression `test/coach-payments-field-select.spec.ts`: full-row Prisma double with planted secrets; recursive secret-key scan. Failing-before (route files stashed): 5/6 fail. After: with payment-ops.controller + packages.service specs -> 3 suites, 131 passed. r75 OK.
- Not changed (client surface): `GET /v1/checkout/purchases` returns the client's OWN cached client_secret to that client. Follow-up recommended.

## Env values the Money/Connect flow needs after deploy (manifest NOT edited)

Prod API host from fly.toml (`app = 'backend-spring-lake-3890'`):
- `STRIPE_CONNECT_RETURN_URL=https://backend-spring-lake-3890.fly.dev/api/v1/connect/onboarding/return`
- `STRIPE_CONNECT_REFRESH_URL=https://backend-spring-lake-3890.fly.dev/api/v1/connect/onboarding/refresh`
Both already in ENV_RULES. Until set, onboarding-link returns 503. If the custom domain (docs mention api.thegrowthproject.app) fronts this app in production, use that host instead — operator decision.

## Open risks / seams
- #628 seam: when #628 lands and FEATURE_DUNNING_V2 is on, Money should also read DunningNoticeDelivery `sent` rows for the card-update link time (v2 sends do not write DunningAttempt). Follow-up.
- #627 seam: held amount turns live automatically once the PayeeRecovery model exists; per-renewal ledger rows also start then (G-2).
- B-641-4: cadence comes from the package; the B1 pricing lock keeps it fixed while any subscriber is active. A purchase-level cadence snapshot (schema change) would make it independent of the lock — recommend default: no schema change now.
- Default currency rule (USD if any USD activity, else only/alphabetically first) is a product choice; mobile #329 needs to show `currency` and offer `currencies`.

## HANDOFF FOR AGENT 113

- **#641** head bb17e19a, fix round 1 pushed, body + fix-round comment posted. CI at bb17e19a: ALL required checks pass (build-and-test, Schema parity, R75, CodeQL, rls, mwb-3, npm audit, danger; deploy-readiness-gate skipped as usual). Findings: all Opus (B-641-1/2, C-641-1..4) and Sol (B-641-3/4) closed; C-641-2 via #646. Next step: request the re-audit (Opus + Sol lenses) at bb17e19a.
- **#646** head ea919f6b, all checks green. Next step: request audit (T4); merge is the owner's call.
- NOT STARTED items: none.
- WIP branches: none.
- Worktrees /home/user/workspace/wt/s-coach-be2-641 and /home/user/workspace/wt/s-coach-be2-leak removed (node_modules symlinks unlinked first). Logs/scripts kept in /home/user/workspace/ops/logs-be2/.
- Decisions needed: (1) prod host for the two Connect URLs (default: fly.dev host above); (2) whether to snapshot cadence on ClientPurchase (default: no, rely on the pricing lock); (3) narrow `GET /v1/checkout/purchases` in a follow-up (default: yes, small T4 PR).
