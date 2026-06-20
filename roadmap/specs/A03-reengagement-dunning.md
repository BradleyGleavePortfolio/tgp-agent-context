# A3 · Re-engagement automations + Dunning consolidation

**Status:** MOSTLY built (substrate present, trigger UI + consolidation outstanding)
**Owner:** *(set by operator on agent dispatch)*
**v2 source:** [`TGP-MASTER-PLAN-v2.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/roadmap/TGP-MASTER-PLAN-v2.md) §1.A A3 *(promoted from old Bucket B1 on 2026-06-19 dissolution pass)*
**Tier/lane:** Tier 4 / T4.A3
**Rank rationale:** Operator: "important (higher)." Revenue-defense; gates retention math at launch. Folded into Bucket A as part of dissolution pass.

---

## State of build

**MOSTLY.** Substrate shipped:
- `src/nudges/` (full module: coach-nudges, client-nudges, dto, service)
- `src/notifications/nudges/`
- `CoachNudge`, `NudgeLog`
- `ChurnIntervention` (full draft → edit → send workflow with idempotency, alert linkage, risk_score_at_draft)
- `ptm/` module (heuristic, weighted, scheduler — churn prediction PROD)
- `coach-alerts` controller + service
- Dunning: `checkout/dunning-v2/`, `DunningState`, `DunningAttempt`, `PaymentRecoveryToken`, `PaymentReminder`, MIG `20261214_dunning_v2_lockout_recovery`

## What to build

- Coach-configurable trigger UI ("if no login 5d, send Message A; if 10d send Message B")
- Message template library (coach-authored voice; AI-suggested drafts)
- **Verify dunning v2 has fully superseded v1** — if so, retire POST_H T3.C "Dunning v1" lane as redundant
- Consolidate `ChurnIntervention` (already shipped) + new trigger config into a single "Re-engagement" surface

## Acceptance criteria

- [ ] Trigger builder UI ships (drag-drop, no-code)
- [ ] Template library with 10+ pre-baked AI-drafted templates
- [ ] Dunning v1 retired in `current-state.json` if v2 supersession confirmed
- [ ] Single "Re-engagement" surface unifies churn intervention + nudges
- [ ] All PRs dual-CLEAN

## Doctrine flags

- **RLS tier:** standard
- **Idempotency:** triggers must not double-send on retry
- **Audit events:** every nudge/intervention emits `AuditEvent`
- **Voice/UI:** Maya voice on coach-side trigger config; client-side messages are coach-authored (passthrough)
- **AI cost gating:** AI-drafted templates flow through Coach AI Budget (§7 of DOCTRINE_INVARIANTS)

## Dependencies

- **Blocks:** nothing further in Tier 4
- **Blocked by:** Tier 1–3 gates

## Operator decisions (locked)

> "Re-engagement automations + dunning — important (higher)."
> *(Dissolution pass 2026-06-19: "Bucket B actually is 3/4 of the most important things to do — alongside import tooling. Dissolve Bucket B into Bucket A.")*

## Open operator questions

- Does dunning v2 fully supersede v1? (Audit task on dispatch.)

## Previous-operator working notes

*First operator on this item appends here.*
