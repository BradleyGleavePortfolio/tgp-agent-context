# Op 74 — Importer & Dunning: Ownership, Serialization, PR Ladder, Gates

- **Op:** 74 · **Date:** 2026-07-27 · **Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
- **Status:** ACTIVE — governance only. **Authorizes no build, no landing, no flag flip, no completion claim.**
- **Baseline:** [`BASELINE_HEADS_OP74.json`](BASELINE_HEADS_OP74.json) — context `9c25a06`, backend `5076a07a`, mobile `a5933fd`, extension `95be0222`. Drift off any pin = INFRA_DEATH per R124.
- **Governing bars:** [`R-IMPORTER-AUTONOMY-1`](../../roadmap/rulings/R-IMPORTER-AUTONOMY-1_2026-07-27.md) · [`R-DUNNING-BAR-1`](../../roadmap/rulings/R-DUNNING-BAR-1_2026-07-27.md)
- **Review:** [`PRE_BUILD_REVIEW_OP74.md`](PRE_BUILD_REVIEW_OP74.md)

**Why this document exists.** R4 clause 1 is explicit: *"Before any parallel code-writing dispatch, run an OWNS-list overlap check across every in-flight AND queued brief. If two PRs touch the same file and merge order matters, serialize — do not parallelize."* Op 74 raises the bar on **two** workstreams that both land in `growth-project-backend`. Without a collision-free ownership split published in advance, the next parallel dispatch forces a rebase and burns an operator-paid cycle — the exact R4 failure mode.

---

## §1 — Ownership lists (collision-free)

Two workstreams. **W-IMP** (importer autonomy) and **W-DUN** (dunning bar). The lists below are **disjoint by construction**; §2 governs the one repo they share.

### W-IMP — Importer autonomy

| Repo | OWNS (exclusive write) |
|---|---|
| `growth-project-backend` | `src/scout/**` · `src/import/**` · importer contract `importer-openapi` (byte-pinned, R80) · importer migrations · importer flags (`FEATURE_SCOUT_*`) |
| `tgp-importer-extension` | entire repo — host injection, acquisition, blueprints, adapter fixtures, conformance suites |
| `growth-project-mobile` | importer/onboarding surfaces only: paired panel, import step, reconstruct review |
| context | `roadmap/M-IMPORTER-*` · `roadmap/specs/A02-import-tooling.md` · `handoffs/importer-wave/**` |

**MUST NOT TOUCH:** `src/checkout/**` · `src/billing/**` · `src/notifications/**` · `src/onboarding/**` (dunning-owned) · `app.module.ts` **except** via §2 · any billing entity, table, or flag.

### W-DUN — Dunning bar

| Repo | OWNS (exclusive write) |
|---|---|
| `growth-project-backend` | `src/checkout/dunning-v2/**` · `src/billing/**` · `src/notifications/**` · `src/onboarding/**` (dunning surfaces) · billing/entitlement migrations · dunning flags |
| `growth-project-mobile` | dunning surfaces only: lockout, paywall, billing-update, recovery, re-engagement UX |
| context | `roadmap/specs/A03-reengagement-dunning.md` · dunning rulings |
| `tgp-importer-extension` | **nothing** — W-DUN never touches the extension |

**MUST NOT TOUCH:** `src/scout/**` · `src/import/**` · importer contract or flags · extension repo · `app.module.ts` **except** via §2.

### Overlap check

| Surface | W-IMP | W-DUN | Resolution |
|---|---|---|---|
| `src/scout/**`, `src/import/**` | ✅ | ❌ | Disjoint |
| `src/checkout/**`, `src/billing/**`, `src/notifications/**` | ❌ | ✅ | Disjoint |
| `tgp-importer-extension` | ✅ | ❌ | Disjoint |
| Mobile surfaces | import/onboarding | dunning/paywall | Disjoint by screen |
| **`growth-project-backend/src/app.module.ts`** | ⚠️ | ⚠️ | **COLLISION → §2** |
| **Backend `main` linear history** | ⚠️ | ⚠️ | **COLLISION → §2** |
| **Backend CI budgets (LOC, test:src, banned-cast)** | ⚠️ | ⚠️ | **Shared → §2** |
| Context `DECISION_LOG.md`, `current-state.json` | ⚠️ | ⚠️ | **Serialized → §2** |

**Result: 2 code collisions + 2 process collisions. Everything else runs in parallel.**

---

## §2 — Shared-backend serialization

Both workstreams write to one backend with a **linear, plain fast-forward** history (`R3_MERGE_RUNBOOK.md`; server-side merges forbidden for production `main` since Op 58). Serialization rules:

- **S1 — One backend PR in flight at a time.** Backend `main` accepts one landing at a time. The second workstream rebases onto the new tip **before** its audit, because R14 audits the **exact head** and R124 requires both-ways SHA. Auditing a stale head is void.
- **S2 — `app.module.ts` is a serialization point.** Both workstreams mount providers/guards there (baseline `5076a07a` already modified it). Only **one** unlanded PR may touch it. A workstream needing a mount while the other holds the token **waits**; it does not branch around it.
- **S3 — Token protocol.** The backend write token is held by exactly one workstream, from branch creation to landed-and-reconciled. Recorded in `current-state.json`. No token → no backend branch.
- **S4 — Shared CI budgets are per-PR, never pooled.** Each PR independently meets R23/R76 ≤ 400 prod LOC, R74 test:src ≥ 2.0, R75 banned-cast net ≤ 0. Neither workstream may borrow the other's headroom, and an R109 split is never a way around the LOC cap.
- **S5 — Contract freeze respects the owner.** `importer-openapi` is byte-pinned (R80) and W-IMP-owned; a forced bump is a **core-contract change = STOP**. W-DUN never touches it.
- **S6 — Context reconciles serialize.** `DECISION_LOG.md` and `current-state.json` are single-writer. Land one Op entry at a time; never two concurrent reconciles.
- **S7 — Mobile and extension run fully parallel.** No serialization: mobile surfaces are screen-disjoint, and W-DUN never enters the extension. Mobile work still waits on its **upstream backend contract**, per the ladder.

---

## §3 — PR ladder

Dependency-ordered. Each rung is separately reviewable, independently revertible, and R14-gated at its exact head. **No rung is dispatched by this document.**

### Prerequisite rung — P0 (blocks all backend work)

| Rung | Repo | Scope | Why first |
|---|---|---|---|
| **P0-AUDIT** | backend | Retroactive adversarial R14 audit of baseline `5076a07a` (Day-10 lockout guard); record **R3-INC-4**; file findings as their own PR if any | Blockers **B1** + **B2**. A money-path change landed with a non-Bradley identity and no discoverable audit trail. R14's failure-mode clause requires exactly this. **Do not force-push** (R3-INC-1 precedent). |

### W-IMP ladder — importer autonomy

| Rung | Repo | Scope | Depends on | Token |
|---|---|---|---|---|
| **I1** | backend | **C1** — server-minted `intent_id`, durable paired import session, secure echo/retrieval; extension compatibility addressed in the contract | P0-AUDIT | backend |
| **I2** | extension | Consume **server-minted** `intent_id` instead of self-minting | I1 contract **frozen** | none |
| **I3** | mobile | **M5** — importer step between Payments and Ready, coach roles only; Skip/Do-later + resume; graceful unavailable-state; clients bypass; no self-promotion | I1 contract **frozen** | none |
| **I4** | ext + backend | Second structurally-different **real** adapter as data/blueprint; core diff == 0 | I2 | backend |
| **I5** | extension | Second **browser host** through the same kernel | I4 | none |
| **I6** | ext + backend | Third structurally-different adapter | I4 | backend |
| **I7** | — | **Real-account live pilot** | I4–I6 + §7 | — |

I1/I3 are the Op-73 R138 **BUILD-SMALLER** slices, carried forward **unchanged**. I4–I6 are the autonomy bar's evidence rungs (E2/E3). I2 and I3 are **parallel** once I1 is frozen.

### W-DUN ladder — dunning bar

> **ID namespace (Op 74 review fix).** Dunning rungs are **`DUN-1`–`DUN-11`** and dunning acceptance-evidence IDs are **`DUN-E1`–`DUN-E10`** ([`R-DUNNING-BAR-1`](../../roadmap/rulings/R-DUNNING-BAR-1_2026-07-27.md)). Both were originally written as bare `D1`–`D10`, which collided with each other **and** with the long-standing importer decision IDs `D1` (golden TrueCoach fixture, Op 57) and `D2` (canonical client target, Op 59). **Bare `D1`/`D2` anywhere in this repo continue to mean only those historical importer decisions** — they are unchanged and unrenamed (R5).

| Rung | Repo | Scope | Depends on | Token |
|---|---|---|---|---|
| **DUN-1** | backend | **P1** — explicit billing/entitlement state machine; entitlement as derived projection | P0-AUDIT | backend |
| **DUN-2** | backend | **P2** — idempotency keys + duplicate/out-of-order safety; wire V2 dispatcher/classifier caller *(closes gap 2)* | DUN-1 | backend |
| **DUN-3** | backend | **P3** — mint recovery tokens (single-use, expiring) + route *(closes gap 3)* | DUN-1, DUN-2 | backend |
| **DUN-4** | backend | **P5** — declared p99 + error budget, `AuditEvent` per transition, funnel metrics | DUN-1 | backend |
| **DUN-5** | backend | **P8** + **P9** — safe degradation, circuit breakers, webhook signature verification, RLS isolation | DUN-1 | backend |
| **DUN-6** | backend | **P6** — replay/backfill with provably side-effect-free dry-run | DUN-1, DUN-2, DUN-4 | backend |
| **DUN-7** | backend | **P7** — operator tooling: inspect state/reason/history, audited time-boxed exception | DUN-1, DUN-4 | backend |
| **DUN-8** | mobile | Bind mobile dunning API (currently hard-null) *(closes gap 4)* | DUN-1, DUN-3 | none |
| **DUN-9** | mobile | Re-engagement UX + Roman-voiced surfaces *(closes gap 5)* | DUN-8 | none |
| **DUN-10** | ops | **P4** — provision email/transactional credentials, suppression, cadence caps *(closes gap 6, blocker B5)* | — (ops track) | none |
| **DUN-11** | — | **P10** — cohort-canaried enablement with auto-rollback | DUN-1–DUN-10 + §7 | — |

### Interleaving

P0-AUDIT first, alone. Then W-IMP and W-DUN alternate on the backend token; mobile (I3, DUN-8, DUN-9), extension (I2, I5), and ops (DUN-10) run in parallel off-token. Suggested backend order: `P0-AUDIT → I1 → DUN-1 → DUN-2 → I4 → DUN-3 → DUN-4 → DUN-5 → I6 → DUN-6 → DUN-7`.

---

## §4 — Dependencies

**Hard (violating these breaks correctness):** P0-AUDIT → all backend · I1 frozen → I2, I3 · I4 → I5, I6 · DUN-1 → all dunning · DUN-2 → DUN-3, DUN-6 · DUN-3 → DUN-8 · D1–DUN-10 → DUN-11 · I4–I6 → I7.

**Soft (sequencing only):** DUN-4 before DUN-6 (replay needs observability to be verifiable) · DUN-8 before DUN-9.

**External / out-of-band:** email credentials (**B5**) block DUN-10 → P4 · branch protection + production secrets (**B3**) block DUN-11 and I7 · `build-sbom` / `release-please` (**B4**) stay quarantined and are never folded into a product PR.

---

## §5 — Stop conditions

**Universal — halt, write a scope-mismatch doc (R15), do not improvise.**

1. Any live SHA drifts off a `BASELINE_HEADS_OP74.json` pin → **INFRA_DEATH** (R124); re-verify before acting.
2. A rung needs a **new** migration, table, flag, queue, or workflow engine not named in its scope → fresh **R138** four-question gate first.
3. Any need for credentials, secrets, or live DB access from a build lane.
4. Contract `importer-openapi` forced off byte-identical (R80) → **core-contract change = STOP**.
5. A non-pre-existing CI regression (the two known infra reds do **not** count).
6. R14 cannot reach CLEAN 0 P0–P3 after **3** fixer rounds → escalate; do not lower the bar.
7. LOC cap breached and an honest split is unavailable → stop; **never** an R109 half-build.
8. A cited rule number does not exist in the canonical enumeration (R1–R126, R130–R138) → **STOP**, never invent (R-RULE-AUTHORITY-1 §4).
9. Both workstreams need the backend token simultaneously → serialize per §2; never branch around.

**W-IMP-specific.** Any adapter-specific code in the core (core diff ≠ 0) · any browser-specific branch in the kernel · **any billing data captured, staged, logged, or reconstructed** · a `Deleted`/tombstone state for erasure · any client-minted trust · any source credential reaching a TGP server · a fixture result reported as a live result.

**W-DUN-specific.** Entitlement set outside the P1 state machine · a non-idempotent money transition · a lockout on **absence** of evidence rather than positive delinquency · any path that could mass-lock on a TGP-side fault · a live backfill without a proven side-effect-free dry-run · a secret value committed · a dunning status asserted without §6 evidence (**P0**).

---

## §6 — Acceptance evidence

**Every rung, without exception:** R14 dual-lens CLEAN **0 P0–P3** at the exact head · R3 author == committer == `Bradley Gleave <bradley@bradleytgpcoaching.com>`, zero AI/co-author tokens · R74 test:src ≥ 2.0 · R75 banned-cast net ≤ 0 · R23/R76 ≤ 400 prod LOC · R79 sweep · R80 contract byte-pinned · R124 both-ways SHA · R138 Decision Record in the PR body · flag default-OFF · documented rollback · git-native plain fast-forward (`R3_MERGE_RUNBOOK.md`).

**W-IMP bar evidence:** E1–E9 in [`R-IMPORTER-AUTONOMY-1`](../../roadmap/rulings/R-IMPORTER-AUTONOMY-1_2026-07-27.md) — core-diff-zero, ≥3 structurally different sites, ≥2 browser hosts, byte-pinned contract, honest per-family accounting, autonomy-not-hand-mapping, isolation + erasure, idempotent replay, and real-account proof as its own separate deferred gate.

**W-DUN bar evidence:** DUN-E1–DUN-E10 in [`R-DUNNING-BAR-1`](../../roadmap/rulings/R-DUNNING-BAR-1_2026-07-27.md) — state machine, replay no-op, recovery round-trip, communications discipline, SLO + audit events, dry-run backfill, operator tooling, fault-injection no-mass-lockout, webhook + RLS security, audited rollout.

**Status is derived, never asserted.** A status claim without evidence at a named SHA is a **P0** finding (R-DUNNING-BAR-1 §2). This is the standing remedy for the five-week false "MOSTLY built" A03 status.

---

## §7 — Activation gates (independent)

**The two workstreams activate independently.** Neither may ride the other's enablement, and neither blocks the other's.

### Gate A — Importer activation
1. E1–E8 satisfied at a named SHA. 2. All W-IMP rungs R14-CLEAN and landed. 3. Consent, security, audit, rollback gates verified live. 4. Billing-capture exclusion verified per adapter. 5. Branch protection + secrets resolved (**B3**). 6. Fresh **R138** gate for the flip. 7. Cohort canary + auto-rollback. 8. **E9 real-account proof is its own gate** and remains **DEFERRED** — E1–E8 do not discharge it.

### Gate B — Dunning activation
1. DUN-E1–DUN-E10 satisfied at a named SHA. 2. All six A03 gaps closed (**1 of 6** closed at baseline). 3. Email credentials provisioned (**B5**). 4. Fault-injection proves no mass lockout. 5. Rollback proven, not asserted (R82/R106). 6. Branch protection + secrets resolved (**B3**). 7. Fresh **R138** gate for the flip. 8. Cohort canary + auto-rollback on alarm — never big-bang.

**Both gates:** flags stay **default-OFF** until the gate passes; enablement is operator-authorized; **nothing in Op 74 authorizes any flip.**

---

## §8 — Open blockers

| ID | Blocker | Sev | Blocks |
|---|---|---|---|
| **B1** | R3-INC-4 — backend `5076a07a` author/committer not Bradley Gleave; published on shared `main` | P1 | Record only; **no force-push** |
| **B2** | No discoverable R14 audit or R138 Decision Record for `5076a07a` (money path) | P1 | **P0-AUDIT**, then all backend rungs |
| **B3** | Backend branch protection absent (404); production secrets unwired | P1 | Gate A, Gate B, DUN-11, I7 |
| **B4** | `build-sbom` + `release-please` RED | P2 | Quarantined; never folded into a product PR |
| **B5** | Email/transactional credentials unprovisioned | P2 | DUN-10, P4, Gate B |
| **B6** | Rule gap R127–R129 permanent | P3 | Documented; never renumbered (R5) |

---

*Author: Bradley Gleave <bradley@bradleytgpcoaching.com> (R3). Governance only; 0 production LOC.*
