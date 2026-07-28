# Op 75 — Pre-build / reconciliation review: `P0-AUDIT` discharge for backend `5076a07a`

## BUILD MATRIX
- backend HEAD: `5076a07a1e54b14e3db84d3aa128fb0bb44542d7`
- ctxrepo HEAD: `5c2f0057cd0ba4f5cba3b2dd2e6e718927549650`
- PR #28 head: `5c2f0057cd0ba4f5cba3b2dd2e6e718927549650`
- PR #28 base (origin/main): `b76d0962de53ce494fa8f869a706ff0c15aee0b6`
- timestamp (ISO 8601 UTC): `2026-07-27T21:30:00Z`

> **This matrix is a NON-CANONICAL MIRROR.** The single canonical R124 BUILD MATRIX for Op 75 is the
> six-line block reproduced **verbatim identically** at the top of both audit reports —
> [`P0-AUDIT-A-5076a07a.md`](../audit-reports/P0-AUDIT-A-5076a07a.md) and
> [`P0-AUDIT-B-5076a07a.md`](../audit-reports/P0-AUDIT-B-5076a07a.md). If this block ever disagrees
> with those, **the reports win** and this copy is the defect. `ctxrepo HEAD` / `PR #28 head`
> `5c2f0057` is the **audit-execution SHA** — the exact head both independent reviews examined and
> the parent lineage this remediation is authored against. It is **not** the SHA of the commit that
> carries this file, and no post-landing SHA is claimed here (see §9).

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
- **Preventive artifact:** [`R3_IDENTITY_PREPUSH_ASSERTION.md`](R3_IDENTITY_PREPUSH_ASSERTION.md) +
  the executable [`r3-identity-gate.sh`](r3-identity-gate.sh) (operator-invoked; no hook, no CI wiring)

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
| 2 | Reconstructed the missing **`R138 Decision Gate`** for `5076a07a`, against R138's four canonical questions | [Lens B §P1-2](../audit-reports/P0-AUDIT-B-5076a07a.md) |
| 3 | Pinned and both-ways-verified all four repo heads with tree, parent and identity | [`BASELINE_HEADS_OP75.json`](BASELINE_HEADS_OP75.json) |
| 4 | Measured the budgets an earlier pass had deferred as unmeasurable | **56** prod LOC · **6.05:1** test:src · **R75 net 0** across `src/` + `test/` |
| 5 | Corrected the PR-#520 / B2 evidence, preserving the stale wording (R5/R132) | Lens B §P1-2, [`BASELINE_HEADS_OP74.json`](../op74/BASELINE_HEADS_OP74.json) correction block |
| 6 | Reclassified **R3-INC-4** and filed a preventive identity gate | [`R3_IDENTITY_PREPUSH_ASSERTION.md`](R3_IDENTITY_PREPUSH_ASSERTION.md) |
| 7 | Re-routed the one finding that had been assigned to a rung that could not execute it | Lens A §P3-2 → ownership decision on `src/filters/**` |
| 8 | Mirrored all of the above machine-readably and narratively | [`current-state.json`](../importer-wave/current-state.json), [`DECISION_LOG.md`](../../DECISION_LOG.md) |

**What Op 75 did not do:** repair any finding, change any production file, flip any flag, rewrite
any history, or open a new rung.

---

## §2a — R138 Decision Gate

Duplicated here in full so this narrative is **self-contained** — a reader should not have to open a
70-key JSON file to find out whether the gate was answered. **Canonical machine-readable location:**
[`handoffs/importer-wave/current-state.json`](../importer-wave/current-state.json) →
`decision_record_op75_p0_audit_discharge_2026_07_27.r138_decision_gate`. If the two ever
disagree, **the JSON wins** and this copy is the defect.

The four questions below are **R138's canonical four**, quoted from
[`AGENT_RULES.md`](../../AGENT_RULES.md) §14 R138 (lines 1593–1602), followed by the decision and its
rollback / blast-radius note that the same rule's *"How to record the gate"* clause also requires.

**Q1 — "How can I improve my choices with Elon Musk's 5 key first principles?"**
Run in order. **(1) Question every requirement:** the requirement is Op-74 §3's `P0-AUDIT` rung, gating all backend work — name Bradley Gleave, date 2026-07-27, reason B2 asserts that `5076a07a` landed with no discoverable R14/R138 evidence. It survives questioning: the audit is the evidence, so deleting it deletes the gate's purpose. **(2) Delete the part:** the first draft carried a duplicated copy of Op-74's canonical ownership lists, ladder, stop conditions and blocker table. All of it was deleted — `OWNERSHIP_AND_LADDER_OP75.md` is now a pointer + delta only, because a second copy of canonical text guarantees drift. That is well over the ≥10% add-back threshold: nothing deleted was added back. **(3) Simplify what survived:** one rung, two audit reports, one baseline pin, one reconciliation review, one pointer, one preventive gate, two standing mirrors. **(4) Accelerate cycle time:** the dual-lens split lets both lenses be written against one frozen SHA without serialization on a backend write token (S3 not taken). **(5) Automate last — and deliberately not yet:** the identity gate ships as an operator-invoked script, *not* a hook or a required check, because automating it touches CI and needs its own gate (§4 of [`R3_IDENTITY_PREPUSH_ASSERTION.md`](R3_IDENTITY_PREPUSH_ASSERTION.md)). Automating before the manual step is proven is the mistake Musk's step 5 exists to prevent.

**Q2 — "What would hyperscalers do?"**
**Concrete practice cited: pipeline safety-gates in place of per-change human approval, and blast-radius containment (AWS/GCP).** Two applications. (a) The reason `5076a07a` reached `main` with a wrong committer is that R3 was enforced by an assert inside a copy-paste block — a human step with no artifact. The hyperscaler answer is a **gate that emits evidence**, which is what §2's `r3-identity-gate.sh` now does: one command, three machine-observable exit codes, a pasteable record. Absence of the record is now distinguishable from absence of the check, which was Lens B **P1-1**'s core complaint. (b) Blast-radius containment is why `FEATURE_DUNNING_V2` stays default-OFF and why this Op dispatches no rung: the audit's twelve findings are preconditions of **Gate B**, so none is live. A second practice, **automated rollback on alarm**, is the named gap — Lens B **P2-2** records that the guard has no declared p99, no error budget and no `AuditEvent` per transition, so today there is nothing for an alarm to fire on. Routed to **DUN-4**.

**Q3 — "How can I get the GOOD without the BAD?"**
**GOOD:** the R14/R138 evidence for `5076a07a` becomes discoverable in-repo, B2 can close, and `I1` unblocks — without touching backend code or reopening a landed commit. **BAD, four risks, each gated rather than accepted:** (a) a reader concluding **B2 is closed when it is not** — gated by making every B2 statement explicitly conditional on landing in all four surfaces; (b) a reader concluding the audit is **R14 CLEAN** — gated by stating the combined **0 P0 / 3 P1 / 5 P2 / 4 P3** and *"CLEAN not met, not claimed"* everywhere, and by `VERDICT: FINDINGS`; (c) **silently overwriting Op-74 history** — gated by R5/R132 preservation: every stale string is retained in place or under a `*_stale_op74` / `*_prior_op74` / `*_stale_op75_first_pass` key, and the historical Op-74 blocks are byte-for-byte intact; (d) a finding **routed to a rung that cannot execute it** — the `DUN-9` misrouting (a mobile rung asked to change a backend error envelope) was caught and corrected, and `src/filters/**` is recorded as **unowned and blocked** rather than given an invented owner. Nothing here required trading quality for speed, so no R2 escalation.

**Q4 — "Am I attacking the root cause / issue / idea?"**
**Yes for the two P1s, and the root causes are named rather than papered over.** For Lens B **P1-1**: the root cause of R3-INC-4 is *unasserted identity*, which is a **different incident class** from R3-INC-1/2/3 (*forbidden mechanism*). The existing remedy — ban the merge button — was already in force here **and was obeyed**, so it structurally could not have prevented this; attacking the symptom would have meant re-banning something that was not used. The remedy therefore targets the assertion gap, not the mechanism. For Lens A **P1-1**: the root cause is not the two leaking routes but the **test shape** — the suite asserts `ALLOWED_PREFIXES` against hand-picked example paths and never against the repo's real mounted controller table, which is exactly why an accidentally-matching route was unobservable (see the **Verification evidence** gap in [`P0-AUDIT-B-5076a07a.md`](../audit-reports/P0-AUDIT-B-5076a07a.md)'s reconstructed `R138 Decision Gate`). Fixing only the prefixes would leave the blind spot intact, so the **test-shape requirement is routed to `DUN-1`** alongside the fix. **Acknowledged workarounds, filed not hidden (R20):** the identity gate is local and cannot bind a push that skips it — closing that requires **B3** branch protection, which is recorded as an open blocker; and `src/filters/**` needs an Op-74 §1 ownership assignment before Lens A **P3-2** is executable at all.

### Decision, and its rollback / blast-radius note

**Decision:** execute and land the `P0-AUDIT` rung as governance evidence only — no rung dispatched, no finding repaired, no production file touched, no flag flipped, 0 production LOC.

**Blast radius:** nothing executable. Every changed path is a docs/JSON governance record. No migration, no schema, no workflow, no flag, no production code.

**Rollback:** `git revert` of the Op-75 landing commit, in one step. Note the asymmetry deliberately: reverting does **not** reopen a repaired defect, because nothing was repaired — it **removes evidence**, so **B2 returns to OPEN and `I1` re-blocks**. That is the correct consequence, not a bug. Backend history is untouched in both directions.

**Evidence the decision was executed as described** (this is verification, not one of the four questions — see the R5/R132 note below): starting head verified before editing, `git rev-parse HEAD` == `git ls-remote origin refs/heads/docs/op75-p0-audit-5076a07a` == `gh api .../pulls/28 --jq .head.sha` == `5c2f0057cd0ba4f5cba3b2dd2e6e718927549650`. Parentage verified on live `main`: `git rev-parse HEAD^` == `git ls-remote origin refs/heads/main` == `gh api .../pulls/28 --jq .base.sha` == `b76d0962de53ce494fa8f869a706ff0c15aee0b6`. All four repo heads verified **both ways** with tree, parent and identity; no drift, no INFRA_DEATH. Backend budgets recomputed from the commits API rather than the shallow worktree: **56** prod LOC, **6.05:1**, R75 net **0** across `src/`+`test/`. Test totals recounted case by case: **37 + 10 = 47**. Route names re-read from the `@Controller`/`@Get`/`@Post` decorators. PR #520 state fetched field by field. All three JSON artifacts parse. Every relative cross-link resolves. Every rule citation falls inside `R1`–`R126` / `R130`–`R138` with zero `R127`–`R129` citations. Exactly one `VERDICT:` line per audit report, on its true final line.

> **CORRECTED at the third remediation pass (2026-07-27) — R5/R132, prior wording preserved below.**
> This gate previously asked *"Q1 What is the smallest change that delivers the value? / Q2 What could
> this break? / Q3 Is it reversible? / Q4 What evidence proves it works?"*. **Those are not R138's four
> questions.** [`AGENT_RULES.md`](../../AGENT_RULES.md) §14 R138 defines them as *"the operator's four
> questions, verbatim in intent"*: Musk's 5 first principles → hyperscaler practice → GOOD without the
> BAD → root cause. The substitution was **Op-75-local and undisclosed**: `decision_record_op59_reconcile_2026_07_16.r138_gate`
> uses `musk_5` / `hyperscalers` / `good_without_bad` / `root_cause`, Op-63 uses
> `q1_first_principles_musk_algorithm` / `q2_hyperscaler_lens_evidence` / `q3_good_without_bad` /
> `q4_root_cause`, and [`DECISION_LOG.md`](../../DECISION_LOG.md) restates the canonical four verbatim.
> Because this gate is the **named evidence for blocker B2**, a gate answering the wrong questions is
> incomplete evidence for the blocker it is offered to close (`AGENT_RULES.md` line 874 grades a
> governed change with an absent Decision Record a **P1**; line 1592 confirms docs-only changes are
> **not** exempt).
>
> **No answer was discarded.** The prior four were a blast-radius / reversibility / verification note,
> which R138's *"How to record the gate"* clause **also** requires — so they are retained above under
> **Decision, and its rollback / blast-radius note**, which is where they belong. The heading is also
> renamed from *"R138 four-question decision gate"* to **`R138 Decision Gate`**, the exact heading
> `AGENT_RULES.md` line 1601 requires.

> **On the SHA evidence above.** The head equality (`… == 5c2f0057…`) was true **at
> audit-execution time**, which is what an R138 record captures: the state the decision was made
> against. It is **not** a claim about the current branch tip — the branch has since advanced by
> remediation commits, and no committed artifact can name the tip that carries it (see §9). The
> live tip is attested in the **PR #28 body**.

---

## §3 — Audit outcome and the R14 bar

| Lens | P0 | P1 | P2 | P3 |
|---|---|---|---|---|
| A — correctness / security / RLS | 0 | 1 | 3 | 2 |
| B — process / contract / ops / governance | 0 | 2 | 2 | 2 |
| **Combined** | **0** | **3** | **5** | **4** |

**R14 CLEAN is 0 P0–P3. That bar is NOT met and is NOT claimed.** Two of the three P1s *are*
blockers B1 and B2 — i.e. the audit's own subject matter, not new defects. The third (Lens A P1-1,
**two** unintended routes reachable while locked out — `/api/scheduling/auth/google/initiate` and
`/api/scheduling/auth/google/callback`) is routed to `DUN-1`. The two `coach/billing/*` routes are
also reachable under lockout but **by design**, via the intended `billing` recovery prefix; their
asymmetry with the LOCKED `v1/coach/me/billing` is **Lens A P2-1**, a P2. Earlier Op-75 wording
counted all four as the P1 and overstated the unintended blast radius twofold (R5/R132: prior
wording named here, not deleted).

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
| Every Op-75 file | `git revert` of the single landing commit. **Every** path in the exhaustive *"Files touched"* table of [`DECISION_LOG.md`](../../DECISION_LOG.md), whatever its current length, is a docs / JSON governance record, plus one operator-invoked shell script that no workflow references. Live count: `gh api repos/BradleyGleavePortfolio/tgp-agent-context/pulls/28 --jq .changed_files`. *(R5/R132 — superseded number named: this row previously said "All **ten** touched paths"; per the count-policy row in §9 it now carries no independent number.)* |
| Production behaviour | **None to roll back.** 0 production LOC; no code, schema, migration, workflow or flag touched. |
| `FEATURE_DUNNING_V2` | **Untouched, default-OFF.** Not flipped, not registered, not defaulted anywhere by this Op. |
| Backend history | **Untouched.** No force-push, no rebase, no amend. |

Reverting Op 75 does not reopen a repaired defect — it removes evidence. **B2 would revert to
OPEN**, and `I1` would re-block. That is the correct consequence, not a bug.

---

## §9 — Validation performed

| Check | Result |
|---|---|
| Starting head matched the assigned SHA **at audit-execution time** | ✅ `git rev-parse HEAD` = `5c2f0057cd0ba4f5cba3b2dd2e6e718927549650` — true when this review was written. **This row is historical and does NOT describe the current branch tip;** see the self-reference note below. |
| PR base still on live `main` | ✅ `b76d0962de53ce494fa8f869a706ff0c15aee0b6` = `git ls-remote origin refs/heads/main` = `gh api …/pulls/28 --jq .base.sha`, re-verified each pass. The **base** is stable across remediation passes; only the head advances. |
| All four repo heads verified **both ways** | ✅ `gh api` vs `git ls-remote` / `git rev-parse`; see [`BASELINE_HEADS_OP75.json`](BASELINE_HEADS_OP75.json) `build_matrix_r124.both_ways_evidence` |
| No drift on any pin | ✅ no INFRA_DEATH |
| JSON artifacts parse | ✅ `BASELINE_HEADS_OP75.json`, `BASELINE_HEADS_OP74.json`, `current-state.json` |
| Internal cross-references resolve | ✅ every relative link in the Op-75 artifacts |
| Rule numbering valid | ✅ all citations inside `R1–R126` / `R130–R138`; zero `R127`–`R129` citations |
| Exactly one `VERDICT:` line per audit report, on the true final line | ✅ both (R78/R16) |
| Commit identity — envelope, **every** commit | ✅ author == committer == `Bradley Gleave <bradley@bradleytgpcoaching.com>` on every commit returned by `git rev-list b76d0962de53ce494fa8f869a706ff0c15aee0b6..HEAD`. Unconditional; no override path exists for this check. Verify: `git log --format='%an <%ae> \| %cn <%ce>' b76d0962..HEAD \| sort -u` → exactly one line. |
| Commit identity — **token scan, head vs branch** | ✅ **head: clean.** The current head returns exit **0** `PASS`, so checks 2a and 2b are both clean **on that commit**. ⚠️ **Branch: not clean, by record.** Two ancestors match check 2b and return exit **3** `OVERRIDE_REQUIRED` — `2e5cd2dd` (line 37, `agent`) and `7331a0cf` (line 10, `Generated with`) — each carrying a §2.2 override record quoting the matched line verbatim with an empty-forbidden-trailer proof. **A head `PASS` is not a branch-wide token result and must never be reported as one.** *(R5/R132 — superseded wording named, not deleted: this row previously read "0 AI / agent / `Co-Authored-By` tokens" as an unqualified ✅, which contradicted the exit-code row two rows below it in this same table and would have told a reviewer the override records were unnecessary.)* |
| Diff is intentional | ✅ every path in the exhaustive *"Files touched"* table of [`DECISION_LOG.md`](../../DECISION_LOG.md) is governance/docs/evidence; **0 production LOC**. Scope verified against `git diff --name-only b76d0962de53ce494fa8f869a706ff0c15aee0b6..HEAD` rather than a restated count. *(R5/R132 — superseded number named: previously "✅ **ten** paths".)* |
| No flag activation | ✅ `FEATURE_DUNNING_V2` untouched and default-OFF |
| **Every internal `file:line` citation re-derived from the FINAL file** | ✅ **added at the third pass, and it is the check that was missing.** The second pass grew Lens A by **+31** lines (355 → 386) and left seven citations pointing at `:102` / `:152` / `:183`, correct only at the prior tip. Re-derive, never carry forward: `grep -n '^### P[0-9]-[0-9]' handoffs/audit-reports/P0-AUDIT-A-5076a07a.md` and confirm every citing surface — [`BASELINE_HEADS_OP75.json`](BASELINE_HEADS_OP75.json), [`current-state.json`](../importer-wave/current-state.json), [`DECISION_LOG.md`](../../DECISION_LOG.md) — matches. **Any edit above a finding re-breaks every pointer below it, so this row is mandatory on every future pass.** Each citation now also carries its heading text, so a stale number is self-evident rather than silently wrong. |
| `R138 Decision Gate` asks R138's four **canonical** questions | ✅ Musk 5 first principles · *"What would hyperscalers do?"* (concrete practice cited) · *"How can I get the GOOD without the BAD?"* · *"Am I attacking the root cause?"* — in **all four** surfaces: §2a above, `current-state.json` → `…r138_decision_gate`, the Lens B reconstructed gate, and the PR #28 body. Verify: `grep -ci 'musk\|hyperscaler\|good without' ` on each. Prior non-canonical set preserved at `…r138_four_question_gate_stale_op75_first_pass` (R5/R132). |
| Identity gate is **executable** and its doc copy has not drifted | ✅ [`r3-identity-gate.sh`](r3-identity-gate.sh) is canonical (mode `100755`); the fenced block in [`R3_IDENTITY_PREPUSH_ASSERTION.md`](R3_IDENTITY_PREPUSH_ASSERTION.md) §2 is a labelled mirror. Asserted byte-identical by extracting the fenced block from the shebang to its closing fence and diffing it against the script — the exact `awk` invocation is given in the mirror label in §2 of that file, and its output is **empty** at this SHA. |
| Gate exercised against **every** commit on this branch, **derived not enumerated** | ✅ run `for s in $(git rev-list --reverse b76d0962de53ce494fa8f869a706ff0c15aee0b6..HEAD); do handoffs/op75/r3-identity-gate.sh "$s"; echo "$s exit=$?"; done`. The asserted invariant is **not a list and not a count**: **every commit returns 0 or 3, never 1, and every 3 carries a §2.2 override record quoting its matched line verbatim with an empty-forbidden-trailer proof.** Exactly two commits return 3 and both are recorded. Hard-fail path verified separately against synthetic inputs — all eight trailer keys at line start, a bare `Generated with` opener, a ≤4-character decoration, and `Signed-off-by: …users.noreply` — all **exit 1**, no override path. Full matrix at §2.3 of [`R3_IDENTITY_PREPUSH_ASSERTION.md`](R3_IDENTITY_PREPUSH_ASSERTION.md). *(R5/R132 — superseded wording named, not deleted: this row previously hardcoded `5c2f0057 · 6871b5bf · 2e5cd2dd · 7331a0cf · "this pass's head"`, which was five entries against six commits under either reading of the last one — the fourth pass added rows to this table without refreshing it. Same class the fourth pass fixed in §4 of the assertion document; the remedy is now applied here too.)* |
| **Every claim about the gate is scoped to what the code proves** | ✅ **added at the fourth pass, and the fourth pass then failed it.** Its replacement invariant — *"no such string ever passes silently"* — was **false when written**: check 2a lists **eight** trailer keys but anchors them at line start, while the `BROAD_RE` the same pass froze *character-for-character* carried only `co-authored-by` of the eight, so `assisted-by`, `helped-by`, `on-behalf-of`, `reviewed-by`, `authored-by`, `generated-by` and `signed-off-by` reached **neither** check off line start and returned **exit 0, silently**. Measured on synthetic commits with correct envelope identity. **Fixed at the source at the fifth pass:** 2b is now a superset of 2a's key set, matched anywhere and case-insensitively, with the round-2 vocabulary retained verbatim — so the invariant is now true by measurement (§2.3 of [`R3_IDENTITY_PREPUSH_ASSERTION.md`](R3_IDENTITY_PREPUSH_ASSERTION.md), all eight keys mid-sentence → **3**, all eight at line start → **1**, neutral body → **0**). **Coupling rule, permanent: any key added to 2a must be added to 2b in the same change and §2.3 re-measured, or this row silently becomes false again.** Verify: `grep -rn 'weakened\|passes silently' DECISION_LOG.md handoffs/op75/` and check every hit names *which* check, then re-run §2.3. **A claim about a control must be falsifiable by running the control — and must actually be run, not reasoned about, because two consecutive passes reasoned about this one and were wrong both times.** |
| **No active prose carries an independent artifact count** | ✅ **added at the fourth pass, verify command repaired at the fifth.** Verify: `grep -rniE '\b(eight|nine|ten)\b[^.]{0,40}path' --include=*.md --include=*.json .` — every match at this SHA classifies, none is a defect. **Classify each hit, do not compare hit counts** (the count is itself a brittle number, and quoting a superseded string in a correction record legitimately creates a new hit). The three permitted classes are: **(a) authoritative** — the exhaustive *"Files touched"* table heading in `DECISION_LOG.md` and `current-state.json` → `files_touched_note` / `files_touched_count_policy_fourth_pass`; **(b) derived** — prose that points at that table or at the live `changed_files` query instead of restating a number; **(c) explicitly-stale-preserved** — a superseded number named as superseded inside an R5/R132 correction record, including the ones §8 and §9 of this file now carry. **A hit is not a failure — each must be classified as authoritative, derived-and-pointing-at-the-table, or explicitly-stale-preserved.** Any hit that is none of the three is the defect. *(R5/R132 — superseded command named, not deleted: the fourth pass wrote `grep -rniE '\b(eight\|nine\|ten)\b[^.]{0,40}path'`. Under `-E`, `\|` is an **escaped literal pipe**, so that pattern searched for the literal text `eight|nine|ten`, returned **zero hits** and exited 1 — the control added to prevent silent count drift was itself silent. The neighbouring `grep -ci 'musk\|hyperscaler\|good without'` row is correct because it is BRE; the escaping was carried into an ERE invocation without re-running it. **A verify command must be run before it is written down.**)* |

> **Self-reference constraint — why no row here pins the current head.** An immutable committed file
> cannot contain the SHA of the commit that contains it: the SHA is a hash over the tree that
> includes this file, so writing it in would change it. Every SHA above is therefore either the
> **base** (`b76d0962`, stable) or an **ancestor** of the tip after this pass — a commit already
> written, whose SHA is therefore stable and quotable. Derive that set rather than trusting a list
> here: `git rev-list --reverse b76d0962de53ce494fa8f869a706ff0c15aee0b6..HEAD`. **No SHA above is the
> tip after this pass.** *(R5/R132 — superseded wording named, not deleted: this sentence previously
> enumerated only `5076a07a`'s successors `5c2f0057` and `6871b5bf` as "prior tips", which omitted
> `2e5cd2dd`, `7331a0cf` and `f21b5412` even though the table above cites them. The remedy is the same
> one applied to the gate row: state the command, not the inventory.)*
> **The exact current head, its parent, and its tree are attested in the PR #28 body**, which is
> mutable metadata and does not alter any git SHA. Reviewers verify the live tip with
> `gh api repos/BradleyGleavePortfolio/tgp-agent-context/pulls/28 --jq '.head.sha'` cross-checked
> against `git rev-parse HEAD` / `git ls-remote origin refs/heads/docs/op75-p0-audit-5076a07a`.
> Any in-file claim to pin the current head would be false by construction, so none is made.
> *(Prior passes asserted `match: true` on rows quoting live API output; those assertions were true
> only at the moment of capture and are restated above as historical. R5/R132: superseded wording is
> marked, not deleted.)*

---

*Author: Bradley Gleave \<bradley@bradleytgpcoaching.com\> (R3). Governance and audit evidence
only; 0 production LOC.*

VERDICT: FINDINGS — `P0-AUDIT` evidence produced and routed; **B2 closes on landing, not before**; B1 recorded and reclassified, open by design; 0 P0 across both lenses, R14 CLEAN not met and not claimed.
