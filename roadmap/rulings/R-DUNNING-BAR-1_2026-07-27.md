# R-DUNNING-BAR-1 — Hyperscaler-quality dunning is the product bar; ten obligations are assigned to the platform

- **Ruling ID:** R-DUNNING-BAR-1
- **Date:** 2026-07-27
- **Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
- **Autonomous delegate:** Op 74, executing under the standing R138 autonomy grant. The R138 four-question gate is recorded in [`PRE_BUILD_REVIEW_OP74.md`](../../handoffs/op74/PRE_BUILD_REVIEW_OP74.md) Part 5.
- **Status:** ACTIVE
- **Scope:** the product bar for A3 (re-engagement + dunning) and every billing-state, entitlement, payment-recovery, and lockout surface across backend, mobile, and any future client.
- **Baseline:** [`BASELINE_HEADS_OP74.json`](../../handoffs/op74/BASELINE_HEADS_OP74.json) (context `9c25a06`, backend `5076a07a`, mobile `a5933fd`, extension `95be0222`).
- **Does NOT amend:** any rule body in `AGENT_RULES.md`; any operator verbatim quote; any landed code; any historical Op record.
- **Supersedes:** the reading of dunning as a feature that is "mostly built" and merely needs wiring. Dunning is a **money-correctness surface** held to the hyperscaler bar.
- **Related:** [`R-IMPORTER-AUTONOMY-1_2026-07-27`](R-IMPORTER-AUTONOMY-1_2026-07-27.md) · [`R-DARK-1_2026-07-07`](R-DARK-1_2026-07-07.md) · `roadmap/specs/A03-reengagement-dunning.md`

---

## Background

The Op-73 newest-wins reconciliation corrected A3 from **"MOSTLY built"** to **"PARTIAL — broken/absent wiring, default-OFF"** and enumerated six evidence-backed gaps: the lockout guard was written but not mounted; the V2 dispatcher/classifier had no runtime caller; recovery tokens were modelled but never minted and had no route; the mobile dunning API was hard-null; re-engagement UX was absent; and email credentials were unprovisioned.

The false "MOSTLY built" status stood from the 2026-06-19 dissolution pass until 2026-07-22 — roughly five weeks — on a **revenue-defense** surface the operator ranked "important (higher)." That is the same assert-don't-derive failure quantified in the Op-74 Idiot Index, and on a money path it is materially more dangerous than on a docs path: a dunning defect either **locks out a paying customer** or **fails to collect from a delinquent one**, and both are silent.

At the Op-74 baseline, backend `5076a07a` (**"feat(dunning-v2): enforce Day-10 lockout via global guard mount, scoped to `/roman/*`"**, +395/−48, parent `07ff974`) **closes gap 1 of 6** — the guard is now mounted. Five gaps remain. That landing also carries two open blockers recorded in the Op-74 review: an **R3 identity violation (R3-INC-4)** and **no discoverable R14 audit trail** for a money-path change.

This ruling fixes the bar so the remaining work is built to it, and so status is never again asserted.

## The ruling

1. **Dunning is held to the hyperscaler bar, not the "it works on the happy path" bar.** Dunning is a correctness surface on money and access. R1 (decacorn) applies at full strength; R2 forbids trading correctness for speed on it.

2. **Status is derived from evidence, never asserted.** No dunning surface may be described as built, mostly built, done, or wired without the acceptance evidence in §"Acceptance evidence" at a named SHA. Asserting readiness without evidence is a **P0** finding. This is the direct, targeted remedy for the five-week false status.

3. **The ten obligations below are the platform's, not each feature's.** Each is assigned to the platform so that no individual feature re-implements — or silently omits — it. They invent no new rule; each grounds in a rule already in force, cited inline.

4. **Nothing here authorizes a build, a landing, a flag flip, or a completion claim.** Sequencing, ownership, and gates are governed by [`OWNERSHIP_AND_PR_LADDER.md`](../../handoffs/op74/OWNERSHIP_AND_PR_LADDER.md). All dunning flags remain **default-OFF**.

5. **Scope boundary — dunning is TGP's own billing, never imported billing.** This ruling governs TGP's **own** subscription/entitlement state. It does **not** authorize the importer to capture, stage, log, or reconstruct billing data from any source site. That exclusion is R5-protected operator-verbatim doctrine, is reaffirmed in [[R-IMPORTER-AUTONOMY-1_2026-07-27]], and is **entirely unaffected** by this ruling. Any doc conflating "we are building serious dunning" with "the importer may now touch billing" is **wrong on its face**; the two concern different subjects and must never be merged in reasoning or in code.

---

## The ten platform obligations

### P1 — Deterministic billing / entitlement state
Billing state is an **explicit state machine** with enumerated states and enumerated legal transitions. **Entitlement is a derived projection of billing state — never independently hand-set.** Given the same event history, the state is always the same; no state is reachable by a path not in the machine. Lockout, grace, and access are computed from state, never written ad hoc at a call site.
*Grounds:* R1, R97 (money as integer minor units). *Hyperscaler:* Stripe subscription lifecycle as an explicit state machine.

### P2 — Idempotent, ordered events
Every transition carries an **idempotency key**; replaying an event is a **no-op**, never a double-charge, double-lock, or double-send. Delivery is assumed **at-least-once and out-of-order**: consumers are commutative where possible and version/sequence-checked where not, and a late or duplicate event may **never resurrect a settled state**.
*Grounds:* R90 (idempotency), R52; A03's own doctrine flag "triggers must not double-send on retry". *Hyperscaler:* [Stripe idempotent requests](https://docs.stripe.com/api/idempotent_requests) — already the citation R138 uses for money decisions.

### P3 — Recovery
Payment recovery is a first-class, **server-minted** path: recovery tokens are minted by the server, **single-use**, **expiring**, non-enumerable, and non-forgeable, with a real route that serves them and a defined retry/escalation schedule. A recovered payment **provably** restores entitlement through P1's state machine — never by a manual unlock.
*Grounds:* R83 (flags), R98 (PII), P1. *Hyperscaler:* Stripe smart retries + hosted recovery links.

### P4 — Communications
Dunning communications are platform-owned: authenticated sending domain, **suppression list honored**, per-recipient **dedupe and cadence caps**, bounce/complaint handling, and a hard rule that a user in a settled state **stops receiving dunning immediately**. Roman-voiced surfaces render per the standing voice/avatar requirement.
*Grounds:* A03 doctrine flags (voice, idempotency); R1 (peak-end, error recovery). **Blocked by B5** — email/transactional credentials are unprovisioned; without them no dunning communication can send, and any claim otherwise is false.

### P5 — Observability
Every dunning path declares a **p99 latency budget and an error budget before it merges** (**R86**), emits an `AuditEvent` per state transition and per send (A03 doctrine flag; **R107** audit log), and exposes the funnel — entered dunning, retried, recovered, locked out, churned — as measurable numbers, not inferred ones. **Burning the error budget freezes feature work on that path until it is back in budget (R99).**
*Grounds:* R86, R99, R107, R85. *Hyperscaler:* Google SRE error budgets.

### P6 — Replay / backfill
The event history is **replayable**. Any replay or backfill must be provably **side-effect-free in dry-run** — no charges, no emails, no lockouts — before any live run, and dry-run output must be diffable against current state. A backfill is a **flag-gated, reversible operation** with a documented rollback, never an ad-hoc script against production.
*Grounds:* R82/R106 (expand-contract, reversibility proven not asserted), R83, P2. *Hyperscaler:* event-sourcing replay from an append-only log.

### P7 — Operator tooling
An operator can, without a database console: inspect any user's billing/entitlement state and the event history that produced it; see why a user is locked out; **grant a documented, audited, time-boxed exception**; and trigger a recovery. Every operator action is attributed and audit-logged (**R107**).
*Grounds:* R107, R1 (invisible UX for the operator surface too). *Hyperscaler:* first-class internal admin/support tooling as a product, not a scratch script.

### P8 — Safe degradation
When the payment processor or any dependency is degraded, dunning **fails safe, not harsh**. A TGP-side or processor-side fault must **never mass-lock users**: unknown state is treated as *not delinquent* for access purposes, decisions are deferred rather than guessed, and circuit breakers prevent cascade. Lockout requires **positive** evidence of delinquency, never absence of evidence to the contrary.
*Grounds:* R1, §12 INFRA-AS-DOCTRINE (circuit breakers on Stripe/external calls). *Hyperscaler:* circuit breaker + fail-safe defaults on access decisions.

### P9 — Security
Webhook signatures verified; no secret values in the repo (the Op-73 `readiness:keys` work established truthful env names including `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` **without committing values** — that discipline holds); RLS enforced so coach-A can never read coach-B billing state; payment data classified and handled per **R98**; recovery tokens unguessable; **no client-forgeable entitlement**, ever.
*Grounds:* R98, R107, R119 (crypto standards), R83.

### P10 — Audited rollout
Dunning ships **flag-gated (R83)**, behind **expand-contract migrations (R82/R106)**, through the **full R14 dual-lens audit cycle to CLEAN with 0 P0–P3** at the exact head, with a recorded **R138 Decision Record**, **R3-clean identity**, **R124 both-ways SHA**, and a documented rollback. Enablement is **cohort-canaried with automatic rollback on alarm** — never a big-bang flip. **R138 delegates the approval; it never waives the audit.**
*Grounds:* R14 (SACRED), R138, R83, R82/R106, R124, R3. *Hyperscaler:* AWS/GCP canary + one-box + auto-rollback — the exact references R138 cites.

---

## Acceptance evidence

Status is derived from these, at a named SHA. No item may be marked done by assertion.

| # | Evidence | Obligation |
|---|---|---|
| D1 | State-machine test proving every legal transition and rejecting every illegal one | P1 |
| D2 | Replay test proving duplicate + out-of-order events are no-ops | P2 |
| D3 | Recovery test: token minted → served → payment → entitlement restored via the state machine | P3 |
| D4 | Communications test: suppression honored, cadence capped, settled state stops sends | P4 |
| D5 | Declared p99 + error budget recorded before merge; `AuditEvent` per transition | P5 |
| D6 | Dry-run backfill produces a diff and provably zero side effects | P6 |
| D7 | Operator can read state, reason, and history, and grant an audited exception | P7 |
| D8 | Fault-injection test: processor down ⇒ no mass lockout | P8 |
| D9 | Webhook signature verification + RLS cross-coach isolation tests | P9 |
| D10 | R14 dual-lens CLEAN 0 P0–P3, R3-clean, flag default-OFF, rollback documented | P10 |

**Gap ledger at the Op-74 baseline** (from Op 73, updated by baseline evidence — 1 of 6 closed):

| Gap | Op-73 status | Op-74 status |
|---|---|---|
| Mount lockout guard | OPEN | **CLOSED** at backend `5076a07a` — guard mounted globally, scoped to `/roman/*`, with unit + e2e tests. Carries blockers **B1** (R3-INC-4) and **B2** (no discoverable R14 trail). |
| Wire V2 dispatcher/classifier caller | OPEN | OPEN |
| Mint recovery tokens + route | OPEN | OPEN |
| Bind mobile dunning API (hard-null) | OPEN | OPEN |
| Build re-engagement UX | OPEN | OPEN |
| Provision email credentials | OPEN | OPEN (**B5**) |

**No completion claim.** A3 is **PARTIAL**. All dunning flags remain **default-OFF**.

## Hyperscaler lens

Payment providers do not treat dunning as a notification feature; they treat it as a **state machine over money with at-least-once event delivery**, where the hard problems are idempotency, ordering, and safe degradation — not copywriting. Stripe's subscription lifecycle, idempotency keys, and smart retries are the reference implementation; Google SRE error budgets supply the reliability contract; AWS/GCP canary-with-auto-rollback supplies the activation pattern. P1–P10 are those practices assigned to the platform so no feature has to re-derive them and none can silently skip them.

## What this changes / does not change

- **Changes:** establishes hyperscaler-quality dunning as the product bar; assigns P1–P10 to the platform; makes dunning status evidence-derived with assertion a P0; records that baseline `5076a07a` closes gap 1 of 6.
- **Does not change:** any rule; any operator verbatim quote; the importer billing-capture exclusion (explicitly out of scope and reaffirmed); the default-OFF flag posture; any landed code; any historical Op record; the PARTIAL status of A3.

## Filing metadata

- **Filed under:** `roadmap/rulings/` (context repo), per the R4 path convention.
- **Author:** Bradley Gleave (R3).
- **Doctrine effect:** assigns existing rules (R1, R14, R82, R83, R86, R90, R97, R98, R99, R106, R107, R119, R124, R138) to the dunning surface; adds no rule; amends no rule.
- **Cross-refs:** `roadmap/specs/A03-reengagement-dunning.md` · [[R-IMPORTER-AUTONOMY-1_2026-07-27]] · [[R-DARK-1_2026-07-07]] · [`OWNERSHIP_AND_PR_LADDER.md`](../../handoffs/op74/OWNERSHIP_AND_PR_LADDER.md) · `DECISION_LOG.md` (Op 74).
