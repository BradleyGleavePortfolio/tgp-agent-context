# A4 · Team QA / manager ops layer

**Status:** MOSTLY built (substrate present, metric surfaces + audit + digest outstanding)
**Owner:** *(set by operator on agent dispatch)*
**v2 source:** [`TGP-MASTER-PLAN-v2.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/roadmap/TGP-MASTER-PLAN-v2.md) §1.A A4 *(promoted from old Bucket B2 on 2026-06-19 dissolution pass)*
**Tier/lane:** Tier 4 / T4.A4
**Rank rationale:** Operator: "head coach and managerial stuff to be elite/world-class, mark this as important." Folded into Bucket A as part of dissolution pass.

---

## State of build

**MOSTLY.** Substrate shipped:
- `sub-coaches/` (sub-coach-analytics.service, head-coach-only.guard, sub-coach-invite.service, controller, dto, types)
- `team/`, `team-mode/` (tier-resolver)
- `TeamSubCoachAssignment`, `TeamAuditEvent`, `TeamProfile`, `SubCoachInvite`, `SubCoachAssignment`, `SubCoachMutationIdempotency`
- Mobile: `TeamManagementScreen`, `TeamMembersScreen`, `SubCoachDetailScreen`, `SubCoachInviteModal`, `CoachTeamProfileScreen`

## What to build

- Per-sub-coach metrics: avg check-in response time, % clients with programs updated in 7d, client satisfaction proxy, churn-risk count
- Unanswered check-in flagging (>48h)
- Program audit (head coach can view any SC's client programs)
- Weekly ops digest: AI-generated team performance summary

## Acceptance criteria

- [ ] Per-SC dashboard renders 4 core metrics with 7d/30d/90d windows
- [ ] Unanswered check-in flag triggers at 48h, surfaces in inbox Team tab
- [ ] Program audit view: head coach can read-only access any SC client program
- [ ] Weekly ops digest: AI-generated, delivered to head coach inbox every Monday 9am local
- [ ] All PRs dual-CLEAN

## Doctrine flags

- **RLS tier:** **elevated** — head coach can read across sub-coach scope; verify `head-coach-only.guard` enforces correctly
- **Idempotency:** weekly digest cron must be retry-safe
- **Audit events:** head-coach reads of SC client data emit `TeamAuditEvent`
- **Voice/UI:** Maya voice on digest; calm and direct
- **AI cost gating:** weekly digest flows through Coach AI Budget

## Dependencies

- **Blocks:** A9 inbox Team tab depends on metrics shape from A4
- **Blocked by:** Tier 1–3 gates
- **Ties to:** A9 (Team tab is A4's surface inside A9's shell)

## Operator decisions (locked)

> "head coach and managerial stuff to be elite/world-class, mark this as important."
> *(Dissolution pass 2026-06-19: dissolved B → A.)*

## Previous-operator working notes

*First operator on this item appends here.*
