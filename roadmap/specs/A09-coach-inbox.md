# A9 · Unified coach inbox (role-gated split)

**Status:** MOSTLY → arguably PROD on data layer (UX polish + role gating outstanding)
**Owner:** *(set by operator on agent dispatch)*
**v2 source:** [`TGP-MASTER-PLAN-v2.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/roadmap/TGP-MASTER-PLAN-v2.md) §1.A A9
**Tier/lane:** Tier 4 / T4.A9

---

## State of build

**MOSTLY → PROD on data layer.**

**What's built:**
- `coach/command-center/` (28KB churn-intervention.service, 32KB command-center.service, 37KB ltv-metrics.service, 14KB controller)
- `community/inbox/` (community-coach-inbox controller+service+repository+dto)
- `community/ai-triage/` (15KB service, prompts, output schema, triage-cache — *the AI triage layer v1 calls for*)
- Mobile: `CoachHomeScreen`, `RiskBoardScreen`, `ClientRiskDetailScreen`, `coach/command-center/` directory, `services/commandCenterApi`, `useInboxTriage`

## Operator-expanded scope — role-gated split

- **Two tabs:** "Clients" tab (client communication, check-in responses, urgency triage) and "Team" tab (sub-coach ops, response-time metrics, unanswered check-in flags — basically A9 surfaces **A4 Team QA** inside the inbox shell).
- **Sub-coaches and solo coaches:** see Clients tab only. Team tab hidden.
- **Head coaches (with sub-coaches):** see both tabs.
- Role detection via existing `TeamProfile` + `SubCoachAssignment` + `User.role`.

## What to build

- Role-gated tab rendering (`User.role` + presence of `SubCoachAssignment` determines tab visibility)
- Three-panel layout UX polish
- Bulk approve-all-AI-changes button (surfaces A7 autopilot revisions)
- Read receipts, "coach last seen"
- Broadcast-to-segment

## Acceptance criteria

- [ ] Solo coach sees Clients tab only; no Team tab DOM node rendered
- [ ] Head coach with ≥1 SC sees both tabs
- [ ] Sub-coach sees Clients tab only
- [ ] Bulk approve-all-AI-changes flows through A7 approval queue
- [ ] Read receipts ship (coach-side + client-side)
- [ ] Broadcast-to-segment composer + delivery ships
- [ ] All PRs dual-CLEAN

## Doctrine flags

- **RLS tier:** standard
- **Idempotency:** broadcasts must be retry-safe (idempotency key per broadcast)
- **Audit events:** broadcasts emit `AuditEvent`
- **Voice/UI:** Maya voice. Three-panel layout at decacorn polish (R1).
- **AI cost gating:** AI triage already flows through ai-credits; verify on dispatch

## Dependencies

- **Blocks:** nothing further
- **Blocked by:** **A4** (Team tab metrics shape) — wait for A4 metric schema before building Team tab UI
- **Ties to:** A7 (bulk-approve action surfaces A7 revisions)

## Operator decisions (locked)

> "Unified coach inbox - yes, split by client shit and team shit - if subcoach or solo coach, just client shit"

## Open operator questions

- Verify on dispatch: does `coach/command-center` already render the three-panel inbox UX or only the data API? (Affects effort estimate. From v2 §5 auditor unknowns.)

## Previous-operator working notes

*First operator on this item appends here.*
