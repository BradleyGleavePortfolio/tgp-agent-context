# Op 75 — Ownership & ladder: pointer + delta

- **Op:** 75 · **Date:** 2026-07-27 · **Operator:** Bradley Gleave \<bradley@bradleytgpcoaching.com\>
- **Status:** ACTIVE — governance only. **Authorizes no build, no landing, no flag flip, no
  completion claim.** 0 production LOC.

> **This document is a pointer, not a copy.** The **canonical** ownership lists, serialization
> rules, PR ladder, dependencies, stop conditions, acceptance evidence, activation gates and
> blocker table are in
> [`handoffs/op74/OWNERSHIP_AND_PR_LADDER.md`](../op74/OWNERSHIP_AND_PR_LADDER.md) and are
> **unchanged by Op 75**. Canonical **rule** text is in
> [`AGENT_RULES.md`](../../AGENT_RULES.md). Neither is reproduced here — duplicating them would
> create a second source of truth and guarantee drift. Op 75 records **deltas and gaps only**.

## §1 — Canonical sources

| Need | Go to |
|---|---|
| OWNS / MUST-NOT-TOUCH per workstream per repo | [Op-74 §1](../op74/OWNERSHIP_AND_PR_LADDER.md) |
| Shared-backend serialization (S1–S7), backend write token, `app.module.ts` | [Op-74 §2](../op74/OWNERSHIP_AND_PR_LADDER.md) |
| PR ladder: `P0-AUDIT`, `I1`–`I7`, `DUN-1`–`DUN-11` | [Op-74 §3](../op74/OWNERSHIP_AND_PR_LADDER.md) |
| Hard vs soft dependencies, external blockers | [Op-74 §4](../op74/OWNERSHIP_AND_PR_LADDER.md) |
| Stop conditions (universal, W-IMP, W-DUN) | [Op-74 §5](../op74/OWNERSHIP_AND_PR_LADDER.md) |
| Acceptance evidence per rung; E1–E9; DUN-E1–DUN-E10 | [Op-74 §6](../op74/OWNERSHIP_AND_PR_LADDER.md) |
| Activation gates A and B | [Op-74 §7](../op74/OWNERSHIP_AND_PR_LADDER.md) |
| Blockers B1–B6 | [Op-74 §8](../op74/OWNERSHIP_AND_PR_LADDER.md) |
| Landing mechanism for any `main` | [`R3_MERGE_RUNBOOK.md`](../importer-wave/R3_MERGE_RUNBOOK.md) |
| Rule text and the canonical enumeration | [`AGENT_RULES.md`](../../AGENT_RULES.md) |

## §2 — Op-75 ladder position

Op 75 executes exactly one rung: **`P0-AUDIT`**, the prerequisite that blocks all backend work.

| | |
|---|---|
| Repo | `growth-project-backend` (audited) · `tgp-agent-context` (evidence landed) |
| Subject | `5076a07a1e54b14e3db84d3aa128fb0bb44542d7` |
| Deliverables | [Lens A](../audit-reports/P0-AUDIT-A-5076a07a.md) · [Lens B](../audit-reports/P0-AUDIT-B-5076a07a.md) |
| Backend write token (S3) | **not taken** — Op 75 writes no backend code |
| `app.module.ts` (S2) | **not touched** |
| Next rung | **`I1`**, and **only after B2 actually closes** — see §4 |

**No rung is dispatched by this document.**

## §3 — Ownership gap found — `src/filters/**` is unowned

The **one** ownership delta Op 75 produces. Lens A **P3-2** concerns
`src/filters/not-found-envelope.ts` and `src/filters/http-exception.filter.ts`.

Checked against [Op-74 §1](../op74/OWNERSHIP_AND_PR_LADDER.md):

| List | Contains `src/filters/**`? |
|---|---|
| W-IMP OWNS | no |
| W-IMP MUST-NOT-TOUCH | no |
| W-DUN OWNS | no |
| W-DUN MUST-NOT-TOUCH | no |

`src/filters/**` is an **unowned cross-cutting backend surface**. The §1 overlap table therefore
does not cover it, and no rung can legitimately claim it.

**Consequence for the earlier routing.** The first draft of Lens A routed this finding to
**`DUN-9`**, which [Op-74 §3](../op74/OWNERSHIP_AND_PR_LADDER.md) defines as a **mobile** rung
(*"Re-engagement UX + Roman-voiced surfaces"*). A mobile rung cannot change a backend error
envelope, so the routing was **unexecutable**, not merely suboptimal. Corrected in Lens A P3-2.

**Required order — do not skip step 1:**

1. **Assign `src/filters/**` in Op-74 §1** — to a workstream, or as a declared shared surface with
   a named serialization point (the idiom §2 already uses for `app.module.ts`).
2. Route the fix to an **authorized backend rung** — candidate **`DUN-4`** if bundled with the
   observability work, otherwise a **fresh R138-gated rung**.
3. **`DUN-9` consumes** the envelope only; it never produces it.

Until step 1 lands, the finding is **recorded and blocked**, and Op 75 says so rather than
inventing an owner.

## §4 — Ladder gating: `I1` is not open yet

[Op-74 §3](../op74/OWNERSHIP_AND_PR_LADDER.md) gives the backend order
`P0-AUDIT → I1 → DUN-1 → …`, with **B2** as `I1`'s gate.

| PR #28 state | B2 | `I1` |
|---|---|---|
| open / this branch unlanded | **OPEN** | **BLOCKED** |
| landed on context `main`, R3-clean, plain fast-forward | **CLOSED** | permitted |

Drafting the audit is not discharging it: until the landing commit is reachable from `main`, the
R14/R138 evidence for `5076a07a` is not discoverable by anyone reading the repo, which is precisely
what B2 asserts. **Claiming B2 closed, or `I1` open, while this PR is unlanded is a status
assertion without evidence and is itself a P0 finding**
([`R-DUNNING-BAR-1`](../../roadmap/rulings/R-DUNNING-BAR-1_2026-07-27.md) §2).

## §5 — Findings routed to existing rungs

Recorded here as a routing index only; the findings themselves live in the audit reports and the
rung definitions live in Op-74 §3.

| Finding | Sev | Rung | Executable now? |
|---|---|---|---|
| A P1-1 — **two** unintended routes reachable while locked out (`scheduling/auth/google/initiate`, `scheduling/auth/google/callback`) | P1 | **DUN-1** | yes |
| A P2-1 — `billing` carve-out misses `v1/coach/me/billing`; the two `coach/billing/*` routes are reachable **by design** | P2 | **DUN-1** | yes |
| A P2-2 — `status: 'active'` narrows the lockout read; a free-text `status` silently un-locks (state machine) | P2 | **DUN-1** | yes |
| A P2-3 — `locked_out_at` unindexed on a hot path | P2 | **DUN-1** (index) / **DUN-4** (SLO) | yes |
| A P3-1 — two dead recovery prefixes | P3 | **DUN-3** | yes |
| A P3-2 — `lockout_copy` discarded by the error envelope | P3 | **§3 ownership decision first** | **no** |
| B P1-1 — R3-INC-4 identity (B1) | P1 | record only + [preventive gate](R3_IDENTITY_PREPUSH_ASSERTION.md) | N/A |
| B P1-2 — missing R14/R138 evidence (B2) | P1 | discharged **on landing**; test-shape req → **DUN-1** | yes |
| B P2-1 — `FEATURE_DUNNING_V2` in no registry | P2 | **DUN-1** (rows); blind-spot audit needs its **own R138 gate** | yes / no |
| B P2-2 — no SLO, no transition record | P2 | **DUN-4** | yes |
| B P3-1 — budgets now measured | P3 | no rung — measurement **is** the remedy | N/A |
| B P3-2 — branch protection absent (B3) | P3 | ops track | no |

**No finding blocks the W-IMP ladder.** All are preconditions of **Gate B**, not of `I1`.
`FEATURE_DUNNING_V2` remains default-OFF, so none is live.

> **Correction, second remediation pass (R5/R132 — prior wording preserved here, not deleted).**
> The `A P2-2` row previously read *"no durable lockout transition record | P2 | **DUN-4**"*. That
> is **Lens B P2-2**, listed on its own row above. Lens A P2-2 is the free-text `status` lockout-read
> defect and belongs to **`DUN-1`**, because `DUN-4` cannot change a Prisma predicate or add a
> schema constraint. The `A P1-1` row previously read *"four routes reachable while locked out"*;
> only **two** are unintended (see the canonical finding text in
> [`P0-AUDIT-A-5076a07a.md`](../audit-reports/P0-AUDIT-A-5076a07a.md)).
> This file is a **routing index, not canonical**: finding text is canonical in the two audit
> reports; rung definitions are canonical in [Op-74 §3](../op74/OWNERSHIP_AND_PR_LADDER.md).

## §6 — What Op 75 does not change

- Op-74 §1 OWNS lists (beyond **naming** the `src/filters/**` gap — it assigns nothing).
- Op-74 §2 serialization rules and the backend write token protocol.
- Op-74 §3 ladder: no rung added, removed, renumbered or reordered.
- The `DUN-*` / `DUN-E*` ID namespace, or the historical importer meanings of bare `D1` / `D2`
  (R5).
- Op-74 §5 stop conditions, §6 acceptance evidence, §7 activation gates.
- Any rule text, rule number, or the permanent `R127`–`R129` gap (**B6**, never renumbered).
- Any production code, schema, migration, workflow or flag.

---

*Author: Bradley Gleave \<bradley@bradleytgpcoaching.com\> (R3). Pointer + delta only; 0
production LOC. Canonical ownership and ladder text is unchanged and lives in
[Op 74](../op74/OWNERSHIP_AND_PR_LADDER.md).*
