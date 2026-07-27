# A3 · Re-engagement automations + Dunning consolidation

**Status:** PARTIAL — SUBSTRATE PRESENT BUT WIRING BROKEN, DEFAULT-OFF (newest-wins, Op 73 · 2026-07-22) *(was: MOSTLY built (substrate present, trigger UI + consolidation outstanding))*
**Owner:** *(set by operator on agent dispatch)*
**v2 source:** [`TGP-MASTER-PLAN-v2.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/roadmap/TGP-MASTER-PLAN-v2.md) §1.A A3 *(promoted from old Bucket B1 on 2026-06-19 dissolution pass)*
**Tier/lane:** Tier 4 / T4.A3
**Rank rationale:** Operator: "important (higher)." Revenue-defense; gates retention math at launch. Folded into Bucket A as part of dissolution pass.

---

> **NEWEST-WINS SUPERSEDE (2026-07-22, Op 73 reconciliation — this block overrides the older `MOSTLY built` framing above/below on conflict; historical prose retained, not rewritten).**
> The `MOSTLY built` status **overstates readiness and is superseded by newest evidence.** The substrate classes/modules listed under "State of build" do exist, but the **runtime wiring is broken/absent**, so the feature does not function end-to-end. Evidence-backed truth:
> - **Dunning V2 lockout state is written but the guard is NOT mounted** — `DunningState` lockout is persisted, but no request-path guard consumes it, so lockout does not actually gate access.
> - **The V2 dispatcher/classifier has NO runtime caller** — the dunning-v2 classification/dispatch code is unreferenced by any live scheduler/webhook path.
> - **Recovery tokens are not minted and have no route** — `PaymentRecoveryToken` exists as a model, but nothing mints one and no recovery endpoint/route serves it.
> - **Mobile dunning API is hard-null** — the mobile client's dunning surface returns null/stubbed data (no live binding).
> - **Re-engagement UX is absent** — no trigger-builder UI, no template library, no unified "Re-engagement" surface (matches the acceptance criteria still being unchecked).
> - **Email/transactional credentials are operationally missing** — no provisioned provider, so even wired paths could not send.
> **Default-OFF invariant holds; nothing is enabled.** This is a **PARTIAL with broken wiring**, not "mostly done." No completion claim. See `DECISION_LOG.md` (Op-73, 2026-07-22 · NEWEST-WINS RECONCILIATION) for the authoritative supersession map.

> **NEWEST-WINS SUPERSEDE (2026-07-27, Op 74 — raises the BAR and updates the gap ledger; the Op-73 block above remains accurate and is reinforced, not replaced. Historical prose retained, not rewritten, per R5/R132).**
> Governing ruling: [`R-DUNNING-BAR-1`](../rulings/R-DUNNING-BAR-1_2026-07-27.md). Baseline: [`BASELINE_HEADS_OP74.json`](../../handoffs/op74/BASELINE_HEADS_OP74.json).
>
> **1. Hyperscaler-quality dunning is now the product bar.** Dunning is a **money-correctness surface** — it gates access based on payment state — and is held to R1 at full strength. Ten obligations are assigned to the **platform** (not to each feature), so none can be silently omitted: **P1** deterministic billing/entitlement state (entitlement is a *derived projection*, never hand-set) · **P2** idempotent, ordered events (at-least-once, out-of-order safe; replay is a no-op) · **P3** recovery (server-minted, single-use, expiring tokens with a real route) · **P4** communications (suppression, cadence caps, settled state stops sends) · **P5** observability (declared p99 + error budget before merge, `AuditEvent` per transition) · **P6** replay/backfill (provably side-effect-free dry-run first) · **P7** operator tooling (inspect state/reason/history; audited, time-boxed exceptions) · **P8** safe degradation (never mass-lock on a TGP-side fault; lockout requires *positive* evidence of delinquency) · **P9** security (webhook signatures, RLS isolation, no client-forgeable entitlement) · **P10** audited rollout (flag-gated, R14 dual-lens CLEAN, cohort canary, auto-rollback). Full text and the `DUN-E1`–`DUN-E10` acceptance evidence are in the ruling.
>
> **2. Status is DERIVED FROM EVIDENCE, never asserted.** No dunning surface may be called built, mostly built, done, or wired without acceptance evidence at a named SHA. **Asserting readiness without evidence is a P0 finding.** This is the direct remedy for the ~5 weeks (2026-06-19 → 2026-07-22) during which the `MOSTLY built` status below stood while the runtime wiring was broken.
>
> **3. Gap ledger — 1 of 6 closed at the Op-74 baseline.** Backend `5076a07a` (*"feat(dunning-v2): enforce Day-10 lockout via global guard mount, scoped to `/roman/*`"*, +395/−48, parent `07ff974`) **closes gap 1: the lockout guard is now mounted**, with unit and e2e tests. **Five gaps remain OPEN:** wire the V2 dispatcher/classifier caller · mint recovery tokens + route · bind the mobile dunning API (currently hard-null) · build re-engagement UX · provision email credentials.
>
> **4. That landing carries two open P1 blockers — recorded, not hidden.** **B1 / R3-INC-4:** `5076a07a` is authored *and* committed as `BradleyGleavePortfolio <264851314+…@users.noreply.github.com>`, **not** `Bradley Gleave <bradley@bradleytgpcoaching.com>` — a hard R3 violation on the commit envelope. Per the R3-INC-1 precedent, published shared history is **NOT force-pushed or rewritten**. **B2:** no associated PR is discoverable via the GitHub commits/pulls API, so **no R14 dual-lens audit trail and no R138 Decision Record can be found** for a money-path change. A retroactive adversarial audit (rung **P0-AUDIT**) blocks all further backend dunning work.
>
> **5. Scope boundary.** This bar governs TGP's **own** billing/entitlement state. It grants the **importer** no billing access whatsoever; the R5-protected importer billing-capture exclusion is untouched and reaffirmed (see `A02-import-tooling.md`).
>
> **No completion claim. A3 remains PARTIAL. All dunning flags remain default-OFF.** Op 74 authorizes **no build, no landing, and no flag flip** — sequencing, ownership, stop conditions, and activation gates are in [`OWNERSHIP_AND_PR_LADDER.md`](../../handoffs/op74/OWNERSHIP_AND_PR_LADDER.md).

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
