# Op 76 — Ownership & ladder: pointer + delta

- **Op:** 76 · **Date:** 2026-07-29 · **Operator:** Bradley Gleave \<bradley@bradleytgpcoaching.com\>
- **Status:** ACTIVE — governance only. **Authorises no build, no dispatch, no landing, no flag
  flip, no completion claim.** 0 production LOC.

> **This document is a pointer, not a copy.** The **canonical** ownership lists, serialization
> rules, PR ladder, dependencies, stop conditions, acceptance evidence, activation gates and
> blocker table are in
> [`handoffs/op74/OWNERSHIP_AND_PR_LADDER.md`](../op74/OWNERSHIP_AND_PR_LADDER.md) and are
> **unchanged by Op 76**. Canonical **rule** text is in [`AGENT_RULES.md`](../../AGENT_RULES.md).
> The Op-75 delta is in [`OWNERSHIP_AND_LADDER_OP75.md`](../op75/OWNERSHIP_AND_LADDER_OP75.md) and
> is likewise unchanged. None of the three is reproduced here — duplicating them would create a
> second source of truth and guarantee drift (R132). Op 76 records **one delta**.

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
| The unowned `src/filters/**` surface, and the finding-to-rung routing index | [Op-75 §3 and §5](../op75/OWNERSHIP_AND_LADDER_OP75.md) |
| Landing mechanism for any `main` | [`R3_MERGE_RUNBOOK.md`](../importer-wave/R3_MERGE_RUNBOOK.md) |
| Rule text and the canonical enumeration | [`AGENT_RULES.md`](../../AGENT_RULES.md) |

## §2 — The one delta: the Op-75 gate row fires

Op-75 §4 published the gate as a two-row table, **before** the event, so that the outcome could be
read off rather than argued. Its second row is now the live one:

| PR #28 state | B2 | `I1` |
|---|---|---|
| open / that branch unlanded — the Op-75 row | **OPEN** | **BLOCKED** |
| landed on context `main`, R3-clean, plain fast-forward — **the Op-76 row** | **CLOSED** | **permitted** |

The three conjuncts are verified one at a time, each from a source outside this repository, in
[`PRE_BUILD_REVIEW_OP76.md`](PRE_BUILD_REVIEW_OP76.md) §3, and pinned in
[`BASELINE_HEADS_OP76.json`](BASELINE_HEADS_OP76.json). **Op 76 reads the table Op 75 wrote; it does
not write a new one.** That is the whole of the delta.

**Permitted is not dispatched.** `I1` may now be opened by a future Op. Op 76 opens the gate and
sends nobody through it. No rung is dispatched by this document, and no rung is dispatched by the PR
that carries it.

## §3 — Ladder position

| | |
|---|---|
| Rung executed by Op 76 | **none.** Op 76 is a state reconciliation, not a ladder rung |
| Repos written | `tgp-agent-context` **only** |
| Backend write token (S3) | **not taken** |
| `app.module.ts` (S2) | **not touched** |
| Next rung, now unblocked | **`I1`** — permitted, undispatched, unassigned |
| Rung still blocked, by design | none newly blocked; `DUN-*` gating is unchanged from Op 74 |

## §4 — Blocker table after Op 76

Pointer to [Op-74 §8](../op74/OWNERSHIP_AND_PR_LADDER.md), which stays canonical. Only the **B2**
row's state changes; no blocker is added, removed or renumbered.

| Blocker | Before Op 76 | After Op 76 | Basis |
|---|---|---|---|
| **B1** — R3-INC-4, unasserted local identity on the backend commit | OPEN_ACCEPTED_NOT_FIXED | **unchanged, OPEN by design** | fixing it needs a rewrite of published shared history, forbidden by R5 and the R3-INC-1 precedent. Landing PR #28 could not close it and did not |
| **B2** — R14/R138 evidence for backend `5076a07a` not discoverable from `main` | OPEN | **CLOSED** | the branch is reachable from `main`; the pre-committed three-conjunct condition holds in full |
| **B3** — branch protection absent, ops track | OPEN | **unchanged** | not in Op-76 scope; no protection was added, disabled or touched |
| **B4** — quarantined `build-sbom` / `release-please` RED | OPEN | **unchanged** | backend CI; Op 76 writes no backend code |
| **B5** — email credentials unprovisioned | OPEN | **unchanged** | prerequisite of the dispatcher work, not of this reconciliation |
| **B6** — permanent `R127`–`R129` numbering gap | PERMANENT | **unchanged, permanent** | never renumbered, by rule |

**What B2 closing does not license.** It makes the evidence discoverable — which is the entirety of
what B2 asserted. Combined dual-lens findings against backend `5076a07a` stand at **0 P0 / 3 P1 /
5 P2 / 4 P3**, and the R14 CLEAN bar is zero across P0–P3. **R14 CLEAN for `5076a07a` is not met and
is not claimed here.** Activation Gate B is not reached.

## §5 — Branch ownership and serialisation for this Op

| | |
|---|---|
| Branch | `docs/op76-reconcile-pr28-landing` |
| Owner | Bradley Gleave \<bradley@bradleytgpcoaching.com\> (R3 — author **and** committer) |
| Base | `837a7f9991123c8b22ddfe57fce2c2777663744d`, the live `main` at branch-cut time |
| Overlap with PR #29 | **none.** #29 owns `product-doctrine/IPO_PRODUCT_DECISION_FILTER.md`; this branch neither creates nor imports it |
| Overlap with PR #26 | **by design**, resolved by supersession rather than by merge — see the pre-build review §4 |
| Frozen artifacts | `handoffs/op74/**` and `handoffs/op75/**` records are not edited, with the single pre-declared exception of the citation verifier's scope arrays |

## §6 — What Op 76 does not change

- Op-74 §1 OWNS lists. The `src/filters/**` gap Op 75 **named** is still **unassigned**; Op 76
  neither assigns it nor lets it drop.
- Op-74 §2 serialization rules and the backend write-token protocol.
- Op-74 §3 ladder: no rung added, removed, renumbered or reordered.
- Op-74 §5 stop conditions, §6 acceptance evidence, §7 activation gates.
- The Op-75 routing index, its findings, or their severities. None of the twelve findings is
  remediated by this Op.
- Any rule text, rule number, or the permanent `R127`–`R129` gap.
- Any production code, schema, migration, workflow or flag. `FEATURE_DUNNING_V2` stays default-OFF.

---

*Author: Bradley Gleave \<bradley@bradleytgpcoaching.com\> (R3). Pointer + delta only; 0 production
LOC. Canonical ownership and ladder text is unchanged and lives in
[Op 74](../op74/OWNERSHIP_AND_PR_LADDER.md).*
