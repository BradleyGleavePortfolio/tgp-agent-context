# Lane S-FEE (owner priority #1, 2026-10-01 11:29 PDT) — T4

Builder: read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md first and follow it exactly (own worktree from origin/main, heavy.sh only, PR tier header, never merge). Builder model: Claude Opus 5.5. Do PR 1 first; open PR 2 only after PR 1 is pushed and green.

## Problem (verified by operator 11:40 PDT)
- Owner ruling 09-30 17:53: client pays the listed price; coach payout = price - card processing - TGP 2%; no client surcharge; minimum paid price $19.99 or free.
- Live checkout (`src/checkout/checkout.service.ts` ~L255-345, `src/connect/stripe-connect-api.service.ts` ~L380-480) creates Stripe destination charges (`transfer_data[destination]`, `on_behalf_of`) with application fee from `src/connect/fees/fee-policy.service.ts` (PLATFORM_APPLICATION_FEE_BPS_DEFAULT = 200, + head-coach 500 bps when applicable). With destination charges Stripe debits processing from the PLATFORM balance → coach gets price - 2%, TGP pays ~2.9% + 30c → TGP loses ~0.9% + 30c per sale (worse for international cards, FX, refunds, disputes).
- `src/payouts-v2/platform-fee.service.ts` already implements the owner's formula (coach_net = amount - platform_fee - stripe_fee) but is only used by payouts-v2 (FEATURE_BANK_PAYOUTS_V2 off), not by checkout.
- Package minimum is 50c (`src/packages/packages.service.ts:543`).

## Deliver
PR 1 (backend, T4): checkout + renewals + guest checkout (`src/storefront/guest-checkout.service.ts`) produce coach net = price - ACTUAL Stripe fee - TGP 2% (- head-coach split where applicable), TGP never net-negative on any charge.
- Choose the Stripe mechanism with evidence from Stripe docs and our code (e.g. separate charges and transfers with `source_transaction`, transfer amount computed from the charge's `balance_transaction.fee` after success; subscriptions via `invoice.paid`; or fee-inclusive application fee + post-settlement reconciliation). Document the choice and trade-offs in the PR body.
- Single source of truth: route all fee math through one service (reuse/extend `PlatformFeeService`; keep head-coach split semantics); ledger rows record gross, stripe_fee, platform_fee, head_coach_split, coach_net per charge.
- Refunds: coach bears refunded principal and TGP is not out the original processing fee; disputes: dispute fee not borne by TGP (reverse from coach transfer or debit connected balance per Stripe mechanism). Document behavior.
- Existing reconciliation/earnings summaries (`/v1/coach/payments/earnings`, `/coach/connect/metrics`) report the same net.
- Free packages ($0, #595) untouched. No live Stripe calls in tests; use fixtures modeled on real Stripe objects.
- Tests: worked examples ($19.99, $50, $200, $1000 card; international card fee; recurring renewal; refund; dispute; head-coach split), invariant test "platform net >= 0 for every charge", reconciliation test.
PR 2 (backend + mobile, T3): minimum paid price $19.99 or exactly $0 (free) — backend validation on create/update (clear error code), mobile package editor inline validation + copy ("Paid packages start at $19.99, or make it free."). Existing packages below the minimum: list them in the PR body (prod has none expected), no silent edits.

## Report
Final answer + /home/user/workspace/ops/reports/B-FEE.md: PR URLs, heads, mechanism chosen and why, worked-example table, tests, CI, open risks, any owner fork (only if a real §13 fork remains).
