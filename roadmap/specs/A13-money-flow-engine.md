# A13 · Coach money-flow engine (configurable, not a tracker)

**Status:** PARTIAL (payouts spine PROD, configurable-rule layer ZERO)
**Owner:** *(set by operator on agent dispatch)*
**v2 source:** [`TGP-MASTER-PLAN-v2.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/roadmap/TGP-MASTER-PLAN-v2.md) §1.A A13
**Tier/lane:** Tier 4 / T4.A13

---

## State of build

**PARTIAL** — payout/Connect spine shipped, configurable money flow is ZERO.

**What's built:**
- `payouts-v2/` (payout-method controller/service, payout-routing, platform-fee, stripe-connect provider, webhook controller)
- `connect/` (Stripe Connect adapter)
- `sub-coaches/sub-coach-analytics.service`
- `checkout/purchase-split-handler.service`
- DB: `SplitLedgerEntry`, `ConnectTransfer`, `PayoutSnapshot`, `PayoutMethod`, `FeePolicy`, `SubCoachAssignment`
- MIG: `20261215_payouts_v2_bank_payout_methods`

## Operator-expanded scope — configurable money-flow engine, NOT just a tracker

> "Subcoach A pays me 4% of all money, SC B only pays me 200/mo flat on the 1st"

Per head-coach ↔ sub-coach relationship, the head coach configures ONE of:

- **Percent-of-revenue rule:** X% of every sub-coach sale routes to head coach
- **Flat monthly rule:** $Y flat on the Zth of the month (auto-debit from sub-coach's Connect account)
- **Hybrid rule:** $Y flat + X% above a threshold
- **Custom billing date** per rule
- **Per-sub-coach override** (every SC can have a different rule)

## What to build

- **`MoneyFlowRule` model:**
  - `head_coach_id`, `sub_coach_id`, `type: percent | flat | hybrid`, `percent_bps`, `flat_cents`, `billing_day_of_month`, `threshold_cents`, `active`, `idempotency_key`, `audit_trail_id`
- **Per-sub-coach configuration UI** (head-coach side)
- **Monthly auto-execution scheduler** (cron creates `SplitLedgerEntry` rows + Stripe Connect transfers per active rule)
- **Sub-coach earnings dashboard:** revenue generated, rule applied, head-coach cut, net payout, payout history
- **Head-coach view:** per-SC rule status + monthly inflow projection + actual inflow + audit log
- **Idempotency:** re-run for same month + same rule = no-op

## Acceptance criteria

- [ ] `MoneyFlowRule` migrated with RLS tier-1 policy
- [ ] Configuration UI ships (head-coach side, per-SC)
- [ ] Monthly cron executes all active rules with idempotency
- [ ] Re-running scheduler for same month + rule produces zero new transfers (no-op)
- [ ] Sub-coach dashboard reflects net payout post-rule
- [ ] Head-coach dashboard shows projection + actuals + per-SC rule
- [ ] Cross-tenant read attempt denied (RLS test)
- [ ] Dispute traceability: given a `ConnectTransfer`, can reconstruct which `MoneyFlowRule` fired it
- [ ] All PRs dual-CLEAN

## Doctrine flags

- **RLS tier:** **TIER 1 (financial)** — see DOCTRINE_INVARIANTS §5
- **Idempotency:** **MANDATORY** — every transfer has idempotency key; scheduler retry-safe
- **Audit events:** every `MoneyFlowRule` mutation + every scheduler execution = `AuditEvent` row
- **Voice/UI:** Maya voice on configuration UI; numbers-forward, no marketing copy
- **Dispute traceability:** every `ConnectTransfer.id` traceable to originating `MoneyFlowRule.id` + execution timestamp + idempotency key
- **Doctrine:** "all money movements RLS-tier-1 (financial privacy), audit-event-emitting, idempotent, dispute-traceable" (verbatim v2 doctrine line)

## Dependencies

- **Blocks:** nothing further (terminal Tier 4 lane)
- **Blocked by:** Tier 1–3 gates; payouts-v2 spine (already PROD)

## Operator decisions (locked)

> "Coach staff commission tracking - this needs expanded - not just a tracker/ on off switch, but a fuul 'How do you want the money to flow?' feature set"
> "Subcoach A pays me 4% of all money, SC B only pays me 200/mo flat on the 1st"

## Open operator questions

- Auto-debit from sub-coach Connect account: requires SC pre-authorization. Operator-decide on UX flow (one-time auth at SC invite vs. per-rule confirmation).
- Cap on percent rules (e.g. max 50%)? Or operator allows any value?
- What happens if SC Connect balance < flat rule amount on billing day? (Partial transfer + dunning? Hold + retry?)

## Previous-operator working notes

*First operator on this item appends here.*
