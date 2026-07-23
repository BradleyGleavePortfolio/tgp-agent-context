# A3 · Re-engagement automations + Dunning consolidation

**Status:** PARTIAL — DEFAULT-OFF; lockout guard now MOUNTED (A3 P0-1 FIXED/LANDED via PR #520), remaining wiring still open (newest-wins, Op 74 · 2026-07-23) *(was: PARTIAL — substrate present but wiring broken (Op 73 · 2026-07-22); was: MOSTLY built)*
**Owner:** *(set by operator on agent dispatch)*
**v2 source:** [`TGP-MASTER-PLAN-v2.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/roadmap/TGP-MASTER-PLAN-v2.md) §1.A A3 *(promoted from old Bucket B1 on 2026-06-19 dissolution pass)*
**Tier/lane:** Tier 4 / T4.A3
**Rank rationale:** Operator: "important (higher)." Revenue-defense; gates retention math at launch. Folded into Bucket A as part of dissolution pass.

---

> **NEWEST-WINS SUPERSEDE (2026-07-23, Op 74 reconciliation — this block overrides the Op-73 `guard is NOT mounted` bullet below on conflict; all other Op-73 bullets stand; historical prose retained, not rewritten).**
> **A3 P0-1 is FIXED / LANDED.** Backend dunning-v2 **PR #520** landed backend `main` `07ff974 → 5076a07` (git-native tree-preserving plain fast-forward; audited head `dcb5812`), mounting **`DunningLockoutGuard`** globally as the final `APP_GUARD` after `JwtAuthGuard`. The persisted `DunningState` lockout is now **consumed on the request path**: the entitlement-gated student-assistant surface `/ai/*` **stays LOCKED** and `/roman/*` is the **sole AI-adjacent carve-out**; the 403 wire contract is **`code` + `message`**; unit + e2e specs and CI are green. **`FEATURE_DUNNING_V2` remains default-OFF** (the guard is a HARD no-op while OFF) — **not flipped**; no dispatcher wiring, no messages sent, no credentials, no migrations.
> **Still OPEN (the other Op-73 bullets are NOT superseded):** the V2 dispatcher/classifier has **no runtime caller** (Day-10 sweep that *sets* `locked_out_at`); **recovery tokens are not minted / no route** (recovery links); **mobile dunning API is hard-null**; **re-engagement UX is absent**; **email/transactional credentials are missing**; plus the newly-explicit gaps: **`lockout_copy` is dropped by the error envelope** (needs a whitelist/envelope change to reach the client) and a **real-DB integration test** is still owed (current coverage uses a structural Prisma stub). **A3 overall remains PARTIAL / default-OFF.** No completion claim. See `DECISION_LOG.md` (Op-74, 2026-07-23) and `current-state.json > reconciliation_op74_2026_07_23`.
>
> **NEWEST-WINS SUPERSEDE (2026-07-22, Op 73 reconciliation — this block overrides the older `MOSTLY built` framing above/below on conflict; historical prose retained, not rewritten).**
> The `MOSTLY built` status **overstates readiness and is superseded by newest evidence.** The substrate classes/modules listed under "State of build" do exist, but the **runtime wiring is broken/absent**, so the feature does not function end-to-end. Evidence-backed truth:
> - **Dunning V2 lockout state is written but the guard is NOT mounted** — `DunningState` lockout is persisted, but no request-path guard consumes it, so lockout does not actually gate access.
> - **The V2 dispatcher/classifier has NO runtime caller** — the dunning-v2 classification/dispatch code is unreferenced by any live scheduler/webhook path.
> - **Recovery tokens are not minted and have no route** — `PaymentRecoveryToken` exists as a model, but nothing mints one and no recovery endpoint/route serves it.
> - **Mobile dunning API is hard-null** — the mobile client's dunning surface returns null/stubbed data (no live binding).
> - **Re-engagement UX is absent** — no trigger-builder UI, no template library, no unified "Re-engagement" surface (matches the acceptance criteria still being unchecked).
> - **Email/transactional credentials are operationally missing** — no provisioned provider, so even wired paths could not send.
> **Default-OFF invariant holds; nothing is enabled.** This is a **PARTIAL with broken wiring**, not "mostly done." No completion claim. See `DECISION_LOG.md` (Op-73, 2026-07-22 · NEWEST-WINS RECONCILIATION) for the authoritative supersession map.

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
