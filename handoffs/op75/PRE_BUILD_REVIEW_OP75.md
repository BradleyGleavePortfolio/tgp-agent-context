# Op 75 — Pre-build / reconciliation review: `P0-AUDIT` discharge for backend `5076a07a`

## BUILD MATRIX
- backend HEAD: `5076a07a1e54b14e3db84d3aa128fb0bb44542d7`
- ctxrepo HEAD: `5c2f0057cd0ba4f5cba3b2dd2e6e718927549650`
- PR #28 head: `5c2f0057cd0ba4f5cba3b2dd2e6e718927549650`
- PR #28 base (origin/main): `b76d0962de53ce494fa8f869a706ff0c15aee0b6`
- timestamp (ISO 8601 UTC): `2026-07-27T21:30:00Z`

- **Op:** 75 · **Date:** 2026-07-27 · **Operator:** Bradley Gleave \<bradley@bradleytgpcoaching.com\>
- **Status:** ACTIVE — governance / audit evidence only. **Authorizes no build, no landing, no flag
  flip, no completion claim.** 0 production LOC.
- **Rung:** `P0-AUDIT` — the prerequisite rung of the Op-74 ladder
  ([`OWNERSHIP_AND_PR_LADDER.md` §3](../op74/OWNERSHIP_AND_PR_LADDER.md))
- **Baseline pins:** [`BASELINE_HEADS_OP75.json`](BASELINE_HEADS_OP75.json) — context
  `b76d0962`, backend `5076a07a`, mobile `a5933fd`, extension `95be0222`. Drift off any pin =
  **INFRA_DEATH** per R124.
- **Deliverables:** [Lens A](../audit-reports/P0-AUDIT-A-5076a07a.md) ·
  [Lens B](../audit-reports/P0-AUDIT-B-5076a07a.md)
- **Ladder / ownership for this Op:** [`OWNERSHIP_AND_LADDER_OP75.md`](OWNERSHIP_AND_LADDER_OP75.md)
- **Preventive artifact:** [`R3_IDENTITY_PREPUSH_ASSERTION.md`](R3_IDENTITY_PREPUSH_ASSERTION.md)

---

## §1 — Why this document exists

Op 74 published the ladder and named `P0-AUDIT` as the single rung that blocks **all** backend
work: a retroactive adversarial R14 audit of baseline `5076a07a`, discharging blockers **B1** and
**B2**. Op 75 executes that rung and nothing else.

R124 requires that the pins an Op reconciles against be recorded before the work is trusted, and
Op 74's own review document is the precedent for a per-Op review surface. Without this file the
Op-75 audit reports would be the *only* record, and two audit reports are not a reconciliation:
they carry findings, not baseline state, closure conditions, or a rule-numbering check. This
document is the **third record surface** the Op needs — alongside the machine-readable mirror
([`current-state.json`](../importer-wave/current-state.json)) and the narrative log
([`DECISION_LOG.md`](../../DECISION_LOG.md)).

> **No canonical rule text is duplicated here.** Rules live in
> [`AGENT_RULES.md`](../../AGENT_RULES.md); ownership and ladder text lives in
> [`OWNERSHIP_AND_PR_LADDER.md`](../op74/OWNERSHIP_AND_PR_LADDER.md). This document **cites and
> points**; where Op 75 changes something it records the **delta only**.

---

## §2 — What Op 75 did

| # | Action | Artifact |
|---|---|---|
| 1 | Produced the retroactive dual-lens R14 audit of `5076a07a` at its exact head | [Lens A](../audit-reports/P0-AUDIT-A-5076a07a.md), [Lens B](../audit-reports/P0-AUDIT-B-5076a07a.md) |
| 2 | Reconstructed the missing R138 four-question gate for `5076a07a` | [Lens B §P1-2](../audit-reports/P0-AUDIT-B-5076a07a.md) |
| 3 | Pinned and both-ways-verified all four repo heads with tree, parent and identity | [`BASELINE_HEADS_OP75.json`](BASELINE_HEADS_OP75.json) |
| 4 | Measured the budgets an earlier pass had deferred as unmeasurable | **56** prod LOC · **6.05:1** test:src · **R75 net 0** across `src/` + `test/` |
| 5 | Corrected the PR-#520 / B2 evidence, preserving the stale wording (R5/R132) | Lens B §P1-2, [`BASELINE_HEADS_OP74.json`](../op74/BASELINE_HEADS_OP74.json) correction block |
| 6 | Reclassified **R3-INC-4** and filed a preventive identity gate | [`R3_IDENTITY_PREPUSH_ASSERTION.md`](R3_IDENTITY_PREPUSH_ASSERTION.md) |
| 7 | Re-routed the one finding that had been assigned to a rung that could not execute it | Lens A §P3-2 → ownership decision on `src/filters/**` |
| 8 | Mirrored all of the above machine-readably and narratively | [`current-state.json`](../importer-wave/current-state.json), [`DECISION_LOG.md`](../../DECISION_LOG.md) |

**What Op 75 did not do:** repair any finding, change any production file, flip any flag, rewrite
any history, or open a new rung.

---

## §3 — Audit outcome and the R14 bar

| Lens | P0 | P1 | P2 | P3 |
|---|---|---|---|---|
| A — correctness / security / RLS | 0 | 1 | 3 | 2 |
| B — process / contract / ops / governance | 0 | 2 | 2 | 2 |
| **Combined** | **0** | **3** | **5** | **4** |

**R14 CLEAN is 0 P0–P3. That bar is NOT met and is NOT claimed.** Two of the three P1s *are*
blockers B1 and B2 — i.e. the audit's own subject matter, not new defects. The third (Lens A P1-1,
four routes reachable while locked out) is routed to `DUN-1`.

The most dangerous properties of the audited commit **do** hold, and were verified rather than
assumed: flag-OFF hard no-op (`dunning-lockout.guard.ts:80`), unauthenticated passthrough
(`:93-94`), fail-open on lookup error (`:99-105`). `FEATURE_DUNNING_V2` is default-OFF, so no
finding is live.

---

## §4 — Blocker reconciliation

Canonical list: [`OWNERSHIP_AND_PR_LADDER.md` §8](../op74/OWNERSHIP_AND_PR_LADDER.md). Deltas only.

| ID | State at Op-74 close | State at Op-75 close | Delta |
|---|---|---|---|
| **B1** | open, unrecorded audit, mechanism implicitly grouped with the server-side incidents | **open by design**, permanently recorded, **reclassified**, preventive gate filed | classification corrected; no history touched |
| **B2** | open, blocks all backend rungs; evidence misstated as "no associated pull request" | **remedy drafted**; **closes on landing of PR #28**, not before | evidence corrected; closure made explicitly conditional |
| **B3** | open | open | none (ops track) |
| **B4** | open, quarantined | open, quarantined | none; confirmed not folded into the product commit |
| **B5** | open | open | none |
| **B6** | permanent | permanent | none; never renumbered (R5) |

### The B2 condition, stated once and plainly

| PR #28 state | B2 | `I1` |
|---|---|---|
| open / this branch unlanded | **OPEN** | **BLOCKED** |
| landed on context `main`, R3-clean, plain fast-forward | **CLOSED** | permitted |

Until the landing commit is reachable from `main`, the R14/R138 evidence for `5076a07a` is not
discoverable by anyone reading the repo — which is exactly what B2 asserts. **Reporting B2 closed,
or the ladder open at `I1`, while this PR is unlanded is a status assertion without evidence and is
itself a P0 finding** ([`R-DUNNING-BAR-1`](../../roadmap/rulings/R-DUNNING-BAR-1_2026-07-27.md) §2:
*status is derived, never asserted*).

---

## §5 — Required landing mechanism for PR #28

Non-negotiable, and the reason this section exists in a *pre*-build review: the Op-75 audit found
that the previous landing on this ladder got the mechanism right and the identity wrong, so the
mechanism alone is not the whole gate.

1. **Git-native manual squash + plain fast-forward only** —
   [`R3_MERGE_RUNBOOK.md` §3](../importer-wave/R3_MERGE_RUNBOOK.md).
2. **`gh pr merge` is FORBIDDEN**, in every variant (`--merge`, `--squash`, `--rebase`), as are the
   green UI button, the REST/GraphQL merge endpoints, and GitHub web edit/commit flows (§1.1). They
   re-author the commit and violate R3.
3. **No `--force`, no `-f`, no `--force-with-lease`, no `+refspec`, no admin bypass, no temporary
   unprotect** — anywhere on `main`. The only push is `git push origin <sha>:main`.
4. **Pre-push identity assertion is mandatory and must produce a recorded artifact** — see
   [`R3_IDENTITY_PREPUSH_ASSERTION.md`](R3_IDENTITY_PREPUSH_ASSERTION.md). Author **and** committer
   exactly `Bradley Gleave <bradley@bradleytgpcoaching.com>`; 0 AI / agent / `Co-Authored-By`
   tokens.
5. **Post-push verification is mandatory and must be recorded** — remote tip equals the pushed SHA;
   `gh api …/commits/<sha>` author **and** committer emails both `bradley@bradleytgpcoaching.com`.
6. **Base pinned to `b76d0962de53ce494fa8f869a706ff0c15aee0b6`.** If live `main` has moved, the
   plain push is a non-fast-forward and git rejects it — **that rejection is the drift guard**.
   Correct response: **STOP and re-audit at the new base.** Never force.
7. **Close PR #28 with a comment naming the landed SHA.** Do not click merge; `merged=false` is the
   expected end state, as with PR #510 / `1e6b3bf`.

---

## §6 — Stop conditions in force for this Op

Canonical list: [`OWNERSHIP_AND_PR_LADDER.md` §5](../op74/OWNERSHIP_AND_PR_LADDER.md). The ones
this Op actually touches:

1. **Drift off any [`BASELINE_HEADS_OP75.json`](BASELINE_HEADS_OP75.json) pin → INFRA_DEATH**
   (R124). Re-verify before acting. *(Checked: no drift at execution time, both ways.)*
2. **A cited rule number outside `R1–R126` / `R130–R138` → STOP, never invent**
   (R-RULE-AUTHORITY-1 §4). `R127`–`R129` **do not exist** (**B6**, permanent) and are cited
   nowhere in the Op-75 artifacts. *(`R161`, cited at
   [`R3_MERGE_RUNBOOK.md`](../importer-wave/R3_MERGE_RUNBOOK.md) line 6, is a phantom and must be
   read as **R6** alone.)*
3. **A finding routed to a rung that cannot execute it → re-route, do not improvise.** Triggered
   once, by Lens A P3-2; see §7.
4. **A status asserted without evidence at a named SHA → P0.** This is why every B2 statement in
   this Op is conditional.
5. **No credentials, secrets, or live DB access** were needed or used by this Op.
6. **No new migration, table, flag, queue or workflow engine** is introduced, so no fresh R138
   gate is required for the Op itself. The two cross-cutting items in §7 **do** each need their
   own R138 gate before anyone acts on them.

---

## §7 — Findings that need an ownership decision before a rung can take them

Two Op-75 findings cannot be routed to an existing rung, and saying so is the honest disposition.

### 7.1 — `src/filters/**` is unowned (Lens A **P3-2**)

The guard computes a `lockout_copy` envelope on every 403
(`dunning-lockout.guard.ts:112-119`) which is then discarded by the shared error envelope at
`src/filters/not-found-envelope.ts:12-38` (with `src/filters/http-exception.filter.ts` in the same
path).

`src/filters/**` appears on **neither** workstream's OWNS list **nor** either MUST-NOT-TOUCH list
in [`§1`](../op74/OWNERSHIP_AND_PR_LADDER.md). It is an **unowned cross-cutting backend surface**.
The first draft routed this to **`DUN-9`**, which is a **mobile** rung — it cannot change a backend
error envelope, so that routing was literally unexecutable.

**Correct disposition, in order:**

1. Assign `src/filters/**` in Op-74 §1 to a workstream (or declare it a shared surface with a
   named serialization point, as §2 does for `app.module.ts`).
2. Then route the fix to an **authorized backend rung** — candidate `DUN-4` if bundled with the
   observability work, otherwise a fresh **R138**-gated rung.
3. **`DUN-9` consumes the envelope only.** It does not produce it.

### 7.2 — The injectable-env registry blind spot (Lens B **P2-1**)

`FEATURE_DUNNING_V2` is invisible to the R108 discovery scanner because it is read as
`env[…]` on a function parameter, and `test/prod-readiness/env-discovery.ts:196` is node-scoped to
`process.env.*` / `process['env'].*`. Registering the one flag belongs to **`DUN-1`**. Auditing
**every** `isXEnabled(env = process.env)` flag, and deciding whether the registry convention should
model the pattern, is **cross-cutting** — neither W-IMP nor W-DUN property scope — and needs its
own **R138** gate per §5 stop condition 2.

---

## §8 — Rollback

| Artifact | Rollback |
|---|---|
| Every Op-75 file | `git revert` of the single landing commit. All eight touched paths are docs / JSON governance records. |
| Production behaviour | **None to roll back.** 0 production LOC; no code, schema, migration, workflow or flag touched. |
| `FEATURE_DUNNING_V2` | **Untouched, default-OFF.** Not flipped, not registered, not defaulted anywhere by this Op. |
| Backend history | **Untouched.** No force-push, no rebase, no amend. |

Reverting Op 75 does not reopen a repaired defect — it removes evidence. **B2 would revert to
OPEN**, and `I1` would re-block. That is the correct consequence, not a bug.

---

## §9 — Validation performed

| Check | Result |
|---|---|
| Starting head matches the assigned SHA | ✅ `git rev-parse HEAD` = `5c2f0057cd0ba4f5cba3b2dd2e6e718927549650`; `git ls-remote origin refs/heads/docs/op75-p0-audit-5076a07a` = same |
| PR parentage still on live `main` | ✅ `git rev-parse HEAD^` = `b76d0962de53ce494fa8f869a706ff0c15aee0b6` = `git ls-remote origin refs/heads/main` = `gh api …/pulls/28 --jq .base.sha` |
| All four repo heads verified **both ways** | ✅ `gh api` vs `git ls-remote` / `git rev-parse`; see [`BASELINE_HEADS_OP75.json`](BASELINE_HEADS_OP75.json) `build_matrix_r124.both_ways_evidence` |
| No drift on any pin | ✅ no INFRA_DEATH |
| JSON artifacts parse | ✅ `BASELINE_HEADS_OP75.json`, `BASELINE_HEADS_OP74.json`, `current-state.json` |
| Internal cross-references resolve | ✅ every relative link in the Op-75 artifacts |
| Rule numbering valid | ✅ all citations inside `R1–R126` / `R130–R138`; zero `R127`–`R129` citations |
| Exactly one `VERDICT:` line per audit report, on the true final line | ✅ both (R78/R16) |
| Commit identity | ✅ author == committer == `Bradley Gleave <bradley@bradleytgpcoaching.com>`; 0 AI / agent / `Co-Authored-By` tokens |
| Diff is intentional | ✅ eight paths, all governance/docs/evidence; **0 production LOC** |
| No flag activation | ✅ `FEATURE_DUNNING_V2` untouched and default-OFF |

---

*Author: Bradley Gleave \<bradley@bradleytgpcoaching.com\> (R3). Governance and audit evidence
only; 0 production LOC.*

VERDICT: RECONCILED — `P0-AUDIT` evidence produced and routed; **B2 closes on landing, not before**; B1 recorded and reclassified, open by design; 0 P0 across both lenses, R14 CLEAN not met and not claimed.
