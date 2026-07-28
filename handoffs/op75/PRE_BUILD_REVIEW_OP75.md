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
- **Preventive artifacts, both executable and both operator-invoked (no hook, no CI wiring):**
  [`R3_IDENTITY_PREPUSH_ASSERTION.md`](R3_IDENTITY_PREPUSH_ASSERTION.md) +
  [`r3-identity-gate.sh`](r3-identity-gate.sh) · [`verify-citations.sh`](verify-citations.sh)
  (added at the seventh pass and rewritten at the eighth, §9 — the citation control; it was first
  prose claiming a coverage its command did not have, then a script that only range-checked line
  numbers, which cannot see a line inserted above a citation. It now **content-pins** every anchored
  in-repo citation against [`CITATION_LEDGER.tsv`](CITATION_LEDGER.tsv) and reads the JSON mirrors
  through `jq`). Both use the same three exit states: **0** pass · **1** fail · **3** needs an
  operator decision recorded before proceeding.

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
   nowhere in the Op-75 artifacts. *(`R161` is a phantom and must be read as **R6** alone. It is
   carried as an authority at **more than one site** — including
   [`R3_MERGE_RUNBOOK.md`](../importer-wave/R3_MERGE_RUNBOOK.md), `DECISION_LOG.md` and
   `handoffs/importer-wave/current-state.json` — so do not treat any one of them as the inventory;
   re-derive the set with `git grep -n 'per R6/R161'`, which also returns the diagnostic quotations
   of the citation. Every live site is annotated in place as of the ninth pass. R5/R132 — superseded
   wording named, not deleted: this note previously read "cited at `R3_MERGE_RUNBOOK.md` line 6",
   naming one member of the set as if it were the whole of it, and contradicting the standing Op-74
   statement in `AGENT_RULES.md` §13 that named a different single site. Both are now superseded by
   re-derivation, and no R161 rule text is invented by either correction.)*
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
| Every Op-75 file | `git revert` of the single landing commit. **Every** path in the exhaustive *"Files touched"* table of [`DECISION_LOG.md`](../../DECISION_LOG.md), whatever its current length, is a governance record — markdown, JSON, a tab-separated ledger, or an operator-invoked shell script that no workflow references. **No path is executable by CI, and none is imported by product code.** Re-derive the composition rather than trusting this sentence: see [**V1**](#v1--changed-path-composition), which returns the file kinds present and proves this repository has no workflow directory. Live count: `gh api repos/BradleyGleavePortfolio/tgp-agent-context/pulls/28 --jq .changed_files`. *(R5/R132 — superseded wording named, not deleted: this row previously said "All **ten** touched paths", then "a docs / JSON governance record, plus **one** operator-invoked shell script". Both were cardinalities. The second survived the seventh pass — which added a second script — and was found by the eighth pass only because the path-label scan was widened before being run. It then carried its replacement command inline, with bare pipes, and **GitHub discarded the rest of this row**; the ninth pass moved it to §9.1. Per the count-policy row in §9 this row names file kinds and points at the command that enumerates them, with no number on either side.)* |
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
| Rule numbering valid | ✅ every rule cited in the Op-75 artifacts as an **authority** falls inside `R1–R126` / `R130–R138`. **A bare token scan is the wrong control here and will mislead you**: it returns many hits and every one is benign. Two classes account for all of them — **(a) gap discussion**, since B6 exists to record that these numbers are unallocated so the artifacts necessarily name them, and **(b) range endpoints** in pre-existing cross-repo doctrine that writes `R74–R127` as an inclusive span. Neither cites `R127`–`R129` as an authority. Run [**V2**](#v2--rule-number-citations) to verify by subtraction. **Its residue is not empty and this row does not claim it is** — the reviewer must classify each line rather than expect none, exactly as the path-label row below requires. All are the same two benign classes, surfacing only because the exclusion list matches *wording* and wording varies: gap assertions the alternation happens not to spell; gap assertions whose `do not exist` is **split across a line break**, which no single-line pattern can see; Op-74 recording that *renumbering the gap was cut*; and a `zion-preserve` brief outside the Op-75 artifact set. **The exclusion list was deliberately not widened to drive this to zero** — that would make the control pass by making it blinder, and each pass would restore the residue with fresh wording. A residue is a classification queue, not a failure count. *(R5/R132 — superseded form named, not deleted: both commands were published inline in this cell with their alternation separators and shell pipes escaped, a form that renders but does not run. Both commands and the diagnosis of what each of them actually returned in that form are in the §9.1 convention note above; they now live in [**V2**](#v2--rule-number-citations), unescaped and executable.)* *(Observed, not fixed, and deliberately so: the `R74–R127` spans sit in Op-65/Op-67 historical decision entries and roadmap rulings. Naming a nonexistent rule as an inclusive endpoint is imprecise, but those entries are immutable history — rewriting them to `R74–R126` would be exactly the silent revision R5/R132 forbids. Recorded here so the imprecision is known rather than rediscovered as a finding each pass.)* |
| Exactly one `VERDICT:` line per audit report, on the true final line | ✅ both (R78/R16) |
| Commit identity — envelope, **every** commit | ✅ author == committer == `Bradley Gleave <bradley@bradleytgpcoaching.com>` on every commit returned by `git rev-list b76d0962de53ce494fa8f869a706ff0c15aee0b6..HEAD`. Unconditional; no override path exists for this check. Run [**V4**](#v4--commit-identity-envelope); the invariant is one line with the author side identical to the committer side, and it is not a commit count. *(R5/R132 — superseded form named, not deleted: this cell published the command with both its `%an`-side separator and its shell pipe escaped, so the raw bytes emitted a literal backslash into the output and then failed to pipe at all.)* |
| Commit identity — **token scan, head vs branch** | ✅ **head: clean.** The current head returns exit **0** `PASS`, so checks 2a and 2b are both clean **on that commit**. ⚠️ **Branch: not clean, by record.** Two ancestors match check 2b and return exit **3** `OVERRIDE_REQUIRED` — `2e5cd2dd` (line 37, `agent`) and `7331a0cf` (line 10, `Generated with`) — each carrying a §2.2 override record quoting the matched line verbatim with an empty-forbidden-trailer proof. **A head `PASS` is not a branch-wide token result and must never be reported as one.** *(R5/R132 — superseded wording named, not deleted: this row previously read "0 AI / agent / `Co-Authored-By` tokens" as an unqualified ✅, which contradicted the exit-code row two rows below it in this same table and would have told a reviewer the override records were unnecessary.)* |
| Diff is intentional | ✅ every path in the exhaustive *"Files touched"* table of [`DECISION_LOG.md`](../../DECISION_LOG.md) is governance/docs/evidence; **0 production LOC**. Scope verified against `git diff --name-only b76d0962de53ce494fa8f869a706ff0c15aee0b6..HEAD` rather than a restated count. *(R5/R132 — superseded number named: previously "✅ **ten** paths".)* |
| No flag activation | ✅ `FEATURE_DUNNING_V2` untouched and default-OFF |
| **Citation integrity — executed by a script, not asserted by this row** | ✅ **prose at the third pass; replaced by a script at the seventh; the script rewritten at the eighth, because the seventh-pass version could not detect the defect it was written for.** Run `handoffs/op75/verify-citations.sh`; it is the control, and this row only names it. **History, kept because the failure repeated twice in different forms.** The third-pass row was titled *“every internal `file:line` citation re-derived”* while the command beside it greped only the Lens A finding headings — so when the sixth pass’s rename hunk shifted `BASELINE_HEADS_OP75.json` by one line and broke two `DECISION_LOG.md` pointers, this row read clean while the tree was not, and one of those pointers resolved to a **different blocker**, which is the failure mode worth designing against: a wrong-but-existing target reads as correct. The seventh pass replaced that prose with a script — which checked only that a cited line number fell **within the target file’s line count**. Insert one line above a citation and every pointer below it moves while every one of them stays comfortably in range: **a range check reports PASS on precisely the mutation that motivated it**, which is worse than no control, because it is a control a reviewer trusts. **What the eighth-pass script actually does, stated so it cannot drift back:** **(1) content pinning** — every anchored in-repo `path:line` is resolved, range-checked, and pinned by the SHA-1 of the text living at that span, recorded in [`CITATION_LEDGER.tsv`](CITATION_LEDGER.tsv) and re-compared on every run, so drift changes the digest and therefore fails; an **unpinned** citation is itself a failure, because “unverifiable” must not be laundered into “fine”. **(2) the two changed JSON mirrors are in scope** — `handoffs/importer-wave/current-state.json` and [`BASELINE_HEADS_OP75.json`](BASELINE_HEADS_OP75.json) both carry live citations and the seventh-pass version read neither; they are read through `jq` rather than `grep`, so a citation spelled with `\uXXXX` escapes cannot bypass extraction — a robustness property shown on a constructed input, since **neither mirror contains an escaped citation at this head**. **(3)** a line citation into a `.json` target is **rejected** outright in favour of a `jq` property path, since a JSON line number is verifiable for *existence* but never for *correctness*. **(4)** backend (`src/…`, `test/…`) targets are reported and never failed, as that repo is not checked out here. **(5)** unanchored `` `:N` `` refs are **adjudicated in the ledger against a digest of the citing text**, so editing that text voids the adjudication and reopens it as a failure — the property a line-keyed classification cannot have. **Three exit states, same idiom as [`r3-identity-gate.sh`](r3-identity-gate.sh): 0 PASS / 1 FAIL / 3 CLASSIFY_REQUIRED.** **Exit 3 is the terminal state here and is accepted only on evidence:** the script prints two different exit-3 texts, and the accepting one is emitted only when the unclassified tally in its own tail is zero — otherwise it prints `DO NOT ACCEPT THIS EXIT`. **The adjudication at this head, which is what licenses accepting exit 3:** every unanchored reference is recorded as either `BACKEND_EXCERPT` — quoting a file in the audited backend repo at the audited SHA `5076a07a`, not resolvable here by construction — or `FROZEN_CORRECTION` — R5/R132 prose quoting a line number an earlier pass saw, where renumbering would rewrite the very record the rule exists to preserve. **Not one unanchored reference is a live claim about this tree.** The single case that was (`AGENT_RULES.md` in the Op-74 scope row, found at the seventh pass) was given an anchored citation and is now content-pinned. Take every count from the script’s own tail, never from this row. **Any edit above a finding still moves every pointer below it, so running this script is mandatory on every future pass** — and unlike both of the controls it replaces, it now fails loudly when that happens. |
| `R138 Decision Gate` asks R138's four **canonical** questions | ✅ Musk 5 first principles · *"What would hyperscalers do?"* (concrete practice cited) · *"How can I get the GOOD without the BAD?"* · *"Am I attacking the root cause?"* — in **all four** surfaces: §2a above, `current-state.json` → `…r138_decision_gate`, the Lens B reconstructed gate, and the PR #28 body. Run [**V5**](#v5--r138-canonical-questions-per-surface), which covers the three in-repo surfaces and states why the PR body is checked separately. Prior non-canonical set preserved at `…r138_four_question_gate_stale_op75_first_pass` (R5/R132). *(R5/R132 — superseded form named, not deleted: this cell published a BRE alternation escaped for the Markdown table, which renders as a bare pipe that BRE reads as a literal character — correct in the bytes, wrong on the page.)* |
| Identity gate is **executable** and its doc copy has not drifted | ✅ [`r3-identity-gate.sh`](r3-identity-gate.sh) is canonical (mode `100755`); the fenced block in [`R3_IDENTITY_PREPUSH_ASSERTION.md`](R3_IDENTITY_PREPUSH_ASSERTION.md) §2 is a labelled mirror. Asserted byte-identical by extracting the fenced block from the shebang to its closing fence and diffing it against the script — the exact `awk` invocation is given in the mirror label in §2 of that file, and its output is **empty** at this SHA. |
| Gate exercised against **every** commit on this branch, **derived not enumerated** | ✅ run `for s in $(git rev-list --reverse b76d0962de53ce494fa8f869a706ff0c15aee0b6..HEAD); do handoffs/op75/r3-identity-gate.sh "$s"; echo "$s exit=$?"; done`. The asserted invariant is **not a list and not a count**: **every commit returns 0 or 3, never 1, and every 3 carries a §2.2 override record quoting its matched line verbatim with an empty-forbidden-trailer proof.** The commits that return 3 are named as a **set**, not tallied, and the set is re-derived rather than maintained: `for s in $(git rev-list --reverse b76d0962de53ce494fa8f869a706ff0c15aee0b6..HEAD); do handoffs/op75/r3-identity-gate.sh "$s" >/dev/null 2>&1; [ $? = 3 ] && echo "$s"; done` → `{2e5cd2dddb9d0e8cf656a27e25c96f37f93008d2, 7331a0cff14131c49c095c387c269b7a1569e63c}`, and every member of that output carries a §2.2 override record. *(R5/R132 — superseded wording named, not deleted: this row previously read "Exactly two commits return 3 and both are recorded", a cardinality stated one sentence after the row declares the invariant is "not a list and not a count". The evidence was correct; the sentence contradicted its own framing and would go stale the moment a third override landed.)* Hard-fail path verified separately against synthetic inputs — every key in 2a's set at line start (which includes the `Signed-off-by: …users.noreply` case, counted once), a bare `Generated with` opener, and a ≤4-character decoration — all **exit 1**, no override path. Full matrix, its case total, and the command that re-derives the key set are at §2.3 of [`R3_IDENTITY_PREPUSH_ASSERTION.md`](R3_IDENTITY_PREPUSH_ASSERTION.md); this row restates neither the key count nor the case count. *(R5/R132 — superseded wording named, not deleted: this row previously hardcoded `5c2f0057 · 6871b5bf · 2e5cd2dd · 7331a0cf · "this pass's head"`, which was five entries against six commits under either reading of the last one — the fourth pass added rows to this table without refreshing it. Same class the fourth pass fixed in §4 of the assertion document; the remedy is now applied here too.)* |
| **Every claim about the gate is scoped to what the code proves** | ✅ **added at the fourth pass, and the fourth pass then failed it.** Its replacement invariant — *"no such string ever passes silently"* — was **false when written**: check 2a lists **eight** trailer keys but anchors them at line start, while the `BROAD_RE` the same pass froze *character-for-character* carried only `co-authored-by` of the eight, so `assisted-by`, `helped-by`, `on-behalf-of`, `reviewed-by`, `authored-by`, `generated-by` and `signed-off-by` reached **neither** check off line start and returned **exit 0, silently**. Measured on synthetic commits with correct envelope identity. **Fixed at the source at the fifth pass:** 2b is now a superset of 2a's key set, matched anywhere and case-insensitively, with the round-2 vocabulary retained verbatim — so the invariant is now true by measurement (§2.3 of [`R3_IDENTITY_PREPUSH_ASSERTION.md`](R3_IDENTITY_PREPUSH_ASSERTION.md), all eight keys mid-sentence → **3**, all eight at line start → **1**, neutral body → **0**). **Coupling rule, permanent, and now executable rather than advisory:** the set of keys in 2a absent from 2b must be **empty**, and §2.3 gives the `comm -23` invocation that returns it — any output is this regression recurring. Run that first; it is a one-line answer where the prose above is a paragraph. Then verify the prose too with [**V6**](#v6--scoped-claim-prose-scan) — check that every hit names *which* check — and re-run §2.3. **A claim about a control must be falsifiable by running the control — and must actually be run, not reasoned about, because two consecutive passes reasoned about this one and were wrong both times.** |
| **Path-label wording scan** — narrow, and named for exactly what it reads | ✅ Run [**V3**](#v3--path-label-wording-scan). That block carries the pattern, its measured scope, the six labels it is known **not** to match, and the three permitted classification classes **(a) authoritative / (b) derived / (c) explicitly-stale-preserved** — any hit outside them is the defect. **Classify each hit; do not compare hit counts**, since quoting a superseded string inside a correction record legitimately creates a new one. The scan is enumerated and therefore blind to the live label until a pass widens it, which is a real limitation stated rather than hidden. *(R5/R132 — superseded framing named, not deleted: this row was titled **"No active prose carries an independent artifact count"** and was read as a general count-drift control. It never was one, in any pass. A scan that cannot see `four exit-0 commits` was standing in for a guarantee about arbitrary cardinalities, and the sixth review found exactly that class of defect — a hand-maintained commit count and a double-counted synthetic-case total — living in prose this row was assumed to cover. **A control’s title must describe what it reads, because the title is what reviewers trust.**)* *(R5/R132 — superseded publication named, not deleted: this row previously carried the pattern and all of the above inline, with unescaped alternation. GitHub cut the cell at its first bare pipe and **discarded the entire body** — scope, classes and correction record alike — so the published page showed a ✅ with no evidence behind it. The fourth-pass form of the pattern, which escaped the alternation separators, is diagnosed in the §9.1 convention note above; it renders but does not run.)* |
| **What the artifacts RENDER as, not only what their bytes say** | ✅ **new at the ninth pass, because eight passes verified these controls by running them and none looked at the published page.** Run [`verify-rendering.sh`](verify-rendering.sh); with `--render` it also POSTs each changed markdown file to GitHub's own `/markdown` API. **The defect it was written for:** in GFM a pipe character delimits a table cell **even inside a code span**, and any cell past the header's column count is **discarded silently** — no warning, no ellipsis, nothing in the diff. Two rows of this very table carried shell pipelines with bare pipes, so GitHub cut one mid-command and cut the other after `` ✅ Verify: `grep -rniE '\b(eight ``, destroying its **entire body** — measured scope, all three classification classes, and an R5/R132 correction record. **A reviewer on github.com saw a green tick with its evidence invisible**, which is this branch's own defining failure — *a control a reader trusts* — recurring one level up, in the **presentation** of the controls rather than in the controls. No amount of executing the commands can catch it, because the bytes were correct and only the rendering was not. **Two checks, and the reason for both:** **(A)** structural, always, offline — a row may not emit more cells than its header defines, which is decidable from the bytes and is the whole defect class; **(B)** rendered, with `--render` — the **tail** of every table row must survive GitHub's output, tails being checked because truncation always removes a suffix. Probes are **derived from each row**, never hand-listed, so they cannot go stale. **`--render` is not optional-by-default: if it is requested and unreachable, the script FAILS**, because an unavailable check is not a passing check. The remedy it prescribes is to move commands into fenced blocks (§9.1), never to escape the pipe — escaping renders but stops the bytes running, which is precisely how this table came to publish a command that died with `grep` reporting `No such file or directory` for a pipe it had been handed as a filename. *(Recorded because it happened during this pass: the first draft of this very row spelled those two pipes literally, and check A rejected it — the row announcing the control was itself discarded by the renderer. The control caught its own author, which is the only kind of evidence this branch accepts.)* |
| **`R161` phantom citation — inventory, not just reading** | ✅ Run [**V7**](#v7--r161-phantom-citation-inventory). `R161` **does not exist**; its substance is carried by **R6** alone and every citation is read as R6 — unchanged, and no R161 rule text is invented anywhere. The ninth pass corrected the **inventory**, which is a different claim from the reading: two standing records each named a *different* single site as the only one, so each read as complete while contradicting the other. Every live authority citation is now **annotated in place**, original wording retained verbatim (R5/R132), and the sites are identified by heading and JSON property path rather than by line number. `AGENT_RULES.md` takes one additive bullet and nothing else; that edit scope is recorded in `DECISION_LOG.md`. **This matters because the claim sits inside a STOP-condition block** — *a cited rule number outside `R1–R126` / `R130–R138` → STOP* — and a stop condition whose own worked example undercounts its instances is the failure class this branch exists to eliminate. Read V7's output and classify it; **do not count it**, since the derivation command matches itself and every correction record adds a hit. |
| **General rule — every active cardinality claim is command-derived at review time** | ✅ **added at the sixth pass, to cover what the scan above does not.** No grep can enumerate the cardinality claims in this branch, so this row states a rule instead of a pattern, and deliberately **introduces no number of its own**. The rule: **active prose may state a count only when it is accompanied by the command that returns it, so a reviewer can re-derive it at review time instead of trusting the digits.** A count without an adjacent command is a defect regardless of whether it is currently correct. Where a count is not needed at all, prefer a command plus an invariant with no cardinality on either side — as §2.3 table E of [`R3_IDENTITY_PREPUSH_ASSERTION.md`](R3_IDENTITY_PREPUSH_ASSERTION.md) now does for the branch-wide gate result, and as the *"Diff is intentional"* and *"Gate exercised against **every** commit"* rows above now do. **Applies to every noun, spelled or in digits: paths, commits, test cases, controls, findings, rules.** Superseded numbers preserved under R5/R132 are exempt, because they are quoted history and are named as such. |

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

### §9.1 — Verification commands, fenced so the renderer cannot discard them

**Why these are not written inside the table cells above.** In GitHub-Flavored Markdown a `|`
delimits a table cell **even inside a code span**, and every cell past the header's column count is
discarded silently — no warning, no ellipsis, nothing in the diff. **V1** and **V3** below used to sit
inline in §8 and §9. GitHub cut V3's row after `` ✅ Verify: `grep -rniE '\b(eight `` and threw away
everything after it: the measured-scope paragraph, all three permitted classification classes, and an
R5/R132 correction record. V1's row was cut mid-command, losing the composition derivation and the
no-workflow proof. **The commands were correct and were run; the published page did not contain
them.** Eight passes verified these controls by executing them from the raw bytes and none looked at
what the artifact renders as — so a reader on github.com saw a green tick with its evidence invisible,
which is this branch's own defining failure appearing one level up, in the presentation of the
controls rather than in the controls.

Fenced blocks have no cell semantics, so the shell text stays **copy-pasteable** and the prose beside
it stays **visible**. Enforced from now on by [`verify-rendering.sh`](verify-rendering.sh), which fails
on any row that emits more cells than its header defines and, with `--render`, re-checks the tails of
every table row against GitHub's own `/markdown` output.

*(R5/R132 — superseded convention named, not deleted: the previous remedy was to escape the pipe as
`\|` inside the cell. That renders correctly but makes the published bytes **unrunnable** — the
rule-numbering command below shipped for four passes as `grep -rnoE '\bR(127\|128\|129)\b'`, which
under `-E` searches for the literal text `R127|128|129` and returns **0 hits** in a row asserting it
"returns many hits", while its second command died with `grep: |: No such file or directory`. The
prior correction record blamed the shell and never named Markdown cell escaping as the cause, so the
two conventions were split across one table with the doctrine endorsing the broken side. **Neither
escaping nor unescaping is the fix; moving the command out of the cell is.**)*

#### V1 — changed-path composition

Used by §8's rollback row. Shows what **kinds** of file this PR touches, with no count on either side,
and that nothing in the set can be invoked by automation.

```sh
git diff --name-only b76d0962de53ce494fa8f869a706ff0c15aee0b6..HEAD | sed 's/.*\.//' | sort -u
git ls-files | grep -c '^\.github/'
```

Output at this head: `json md sh tsv`, then `0` — this repository has no workflow directory at all, so
the shell scripts in the set are operator-invoked and nothing runs them on push.

#### V2 — rule-number citations

Used by §9's *"Rule numbering valid"* row. A bare token scan is the **wrong** control here and will
mislead you: it returns many hits and every one is benign. Verify by **subtraction** instead.

```sh
# (a) the raw token scan — informational only
grep -rnoE '\bR(127|128|129)\b' --include=*.md --include=*.json .

# (b) the subtraction: strip gap-discussion and range-endpoint context; the residue is the queue
grep -rnoE '.{0,120}\bR(127|128|129)\b.{0,160}' --include=*.md --include=*.json . \
  | grep -viE 'gap|absent|do(es)? not exist|non-?exist|never (existed|assigned|allocated)|missing|B6|unallocated|reserved|R7[0-9]–R127|R74-R127|zero .R127'
```

Output at this head: **(a) 108 lines, (b) 10 lines.** Both figures come from the commands directly
above them; neither is maintained by hand. **Classify the residue; do not drive it to zero** — widening
the exclusion list until the count vanishes makes the control pass by making it blinder. Every line of
(b) at this head is one of three benign kinds:

- **the gap stated inside a record of this branch** — the ninth-pass block in `DECISION_LOG.md`, the
  R5/R132 note directly above in this file, **the bullet you are reading**,
  `R3_IDENTITY_PREPUSH_ASSERTION.md`'s enumeration sentence,
  `BASELINE_HEADS_OP75.json` → `.rule_enumeration.op75_artifacts_verified`, and the two
  `current-state.json` validation scalars asserting **zero** `R127`–`R129` citations. Each states or
  asserts the absence, and each phrases it in words the exclusion list does not carry;
- **the rule file recording its own skip** — `AGENT_RULES.md` §13's R5/R132 supersession note, which
  says §13 continues at **R130**;
- **records outside this Op** — Op-74's pre-build review discussing the renumber it declined, and a
  `projects/zion-preserve` brief describing a **different** repository's rule file.

**Not one is a citation of a nonexistent rule as authority, which is the only thing this control looks
for.** *(R5/R132 — superseded figures named, not deleted. This block read **(b) 7 lines** when it was
first written, earlier in this same pass. Writing the ninth-pass correction record into
`DECISION_LOG.md` and the R5/R132 note above into this file each created a hit, taking it to **9**;
then writing the classification bullet above — which necessarily names the tokens it classifies —
took it to **10**, and moved (a) from 106 to 108 at the same time. Both intermediate figures were
measured, and both are recorded here rather than overwritten, because the sequence is the point:
**a correction record that discusses a defect becomes a hit for the scan that finds it.** The count is
therefore re-derived at read time and is expected to move; the **classification by kind** is the
stable claim, and a fixed number in this position would be evidence of nothing.)*

#### V3 — path-label wording scan

Used by §9's *"Path-label wording scan"* row. Matches one shape only: the spelled words
`eight`/`nine`/`ten`/`eleven`/`twelve` within 40 non-period characters of the literal token `path`.

```sh
grep -rniE '\b(eight|nine|ten|eleven|twelve)\b[^.]{0,40}path' --include=*.md --include=*.json .
```

`twelve` was appended at the eighth pass and `eleven` at the seventh, each by the pass that landed the
path the word names — **and each widened the pattern before running it**, the only ordering under
which the scan can see the pass that moved the label. That the scan is enumerated, and therefore blind
to the live label until someone widens it, is a real limitation stated rather than hidden.

It returns **zero hits** for `10 paths changed`, `four exit-0 commits`, `23 synthetic gate cases`,
`five footer/decoration forms`, `seven commits` and `twenty-two distinct cases`. It therefore **detects
no commit count, no test-case count, no control count, and no digit-form count of anything, including
of paths.** Treat it as a spelling-specific scan over one label and nothing more.

**Classify each hit; do not compare hit counts** — a hit count is itself a brittle number, and quoting
a superseded string inside a correction record legitimately creates a new hit. Three permitted
classes:

- **(a) authoritative** — the exhaustive *"Files touched"* table heading in `DECISION_LOG.md`, and
  `current-state.json` → `files_touched_note` / `files_touched_count_policy_fourth_pass`;
- **(b) derived** — prose pointing at that table or at the live `changed_files` query instead of
  restating a number;
- **(c) explicitly-stale-preserved** — a superseded number named as superseded inside an R5/R132
  correction record.

Any hit that is none of the three is the defect. Widening this scan to `twelve` is what surfaced the
stale *"plus **one** operator-invoked shell script"* claim in §8, which had been false since the
seventh pass added a second script.

#### V4 — commit identity envelope

Used by §9's *"Commit identity — envelope"* row. Unconditional: no override path exists for this
check.

```sh
git log --format='%an <%ae> | %cn <%ce>' b76d0962de53ce494fa8f869a706ff0c15aee0b6..HEAD | sort -u
```

Output at this head is a **single line**,
`Bradley Gleave <bradley@bradleytgpcoaching.com> | Bradley Gleave <bradley@bradleytgpcoaching.com>`.
The invariant is *one line, author side identical to committer side* — not a commit count.

#### V5 — R138 canonical questions, per surface

Used by §9's *"`R138 Decision Gate`"* row. R138's four canonical questions must be present in every
surface that claims to run the gate. The invariant is **non-zero for every in-repo surface**; the
per-file totals are output, not targets, and will move as prose is edited.

```sh
for f in handoffs/op75/PRE_BUILD_REVIEW_OP75.md \
         handoffs/importer-wave/current-state.json \
         handoffs/audit-reports/P0-AUDIT-B-5076a07a.md; do
  printf '%s  %s\n' "$(grep -ciE 'musk|hyperscaler|good without' "$f")" "$f"
done
```

Output at this head: `12`, `21`, `3` respectively — every surface non-zero. **The invariant is
non-zero, not any of those three numbers**, and this file's own total rises whenever a correction
record below quotes the pattern — it did so twice during this pass. The **fourth** surface is
the PR #28 body, which is mutable API metadata and not reachable from a working tree; it is checked
against the live body, not by this loop, and this block does not pretend otherwise.

*(R5/R132 — superseded command named, not deleted, and this one was caught by running it. Inline in
the table cell this read `grep -ci 'musk\|hyperscaler\|good without'`. Lifting it into this block, the
escape was dropped but **`-E` was not added** — and in BRE an unescaped `|` is a **literal character**,
so the pattern searched for the one-line string `musk|hyperscaler|good without`. It matched exactly
one line: **this block, quoting itself.** The figures published here were then `9`, `0`, `0` and the
per-surface totals were wrong for two of the three surfaces. The escaped cell form and the unescaped
fenced form were **both** broken, in opposite dialects: in BRE the escape *is* the alternation and the
bare pipe is a literal; in ERE the bare pipe is the alternation and the escape is a literal. That is
the whole trap, and it is why the remedy is `-E` **plus** a fenced block — pick one dialect, then put
it somewhere the renderer cannot rewrite it. Neither escaping alone nor fencing alone is sufficient.)*

#### V6 — scoped-claim prose scan

Used by §9's *"Every claim about the gate is scoped to what the code proves"* row. Finds the prose
that makes claims about the identity gate so each hit can be checked for naming **which** check it
describes. This is a review aid, not a pass/fail gate: it has no correct count.

```sh
grep -rnE 'weakened|passes silently' DECISION_LOG.md handoffs/op75/
```

Output at this head: 18 hits across three files — `DECISION_LOG.md`,
`PRE_BUILD_REVIEW_OP75.md` and `R3_IDENTITY_PREPUSH_ASSERTION.md`. Read them; do not tally them.
*(R5/R132: this command was published without `-E` and therefore searched for the literal string
`weakened|passes silently`, matching only itself and reporting **1** where this block claimed 16 —
the same BRE/ERE trap described under V5 above, found the same way, by running it.)* Then re-run §2.3 of
[`R3_IDENTITY_PREPUSH_ASSERTION.md`](R3_IDENTITY_PREPUSH_ASSERTION.md), which is the executable half
of that row and the part that can actually fail.

#### V7 — R161 phantom-citation inventory

Used by §9's *"`R161` phantom citation"* row. **`R161` does not exist and never has**; its substance is
carried by **R6** alone, every citation of it is read as R6, and no R161 rule text is invented
anywhere. What the ninth pass fixed is not the reading — that was already right — but the **inventory**:
two standing statements each named a *different* single site as the only one.

```sh
git grep -n 'per R6/R161'
```

**Read the output, do not count it.** Hits fall into two kinds, and the distinction is not
mechanical — prose wraps, so a line-based classifier mislabels a citation whose diagnosis sits on the
next line:

- **live authority citation** — the prose leans on `R161` to justify something. Three at this head:
  `DECISION_LOG.md`'s Op-58 merge-runbook supersession paragraph; the **Refines (does not edit)**
  header line of [`R3_MERGE_RUNBOOK.md`](../importer-wave/R3_MERGE_RUNBOOK.md); and
  `handoffs/importer-wave/current-state.json` →
  `.decision_record_op58_reconcile_2026_07_16.supersession_note`. **Each is now annotated in place**,
  the original wording retained verbatim (R5/R132) — by the following paragraph, by the following
  blockquote line, and by the sibling key `…supersession_note_r161_annotation_op75_2026_07_28`
  respectively. They are named by heading and property path rather than by line number, so this list
  cannot rot the way a line citation does.
- **diagnostic quotation** — text that quotes the citation *in order to correct it*, including every
  annotation just listed. These are hits, not defects, and they multiply as corrections accumulate.

Two further properties, stated because both are easy to misread as errors: **this command matches
itself**, since the artifacts that print it contain the literal string; and the hit total rises on
every pass that adds a correction record, so a count here would mean nothing.

*(R5/R132 — superseded wording named, not deleted. Two claims are superseded by this re-derivation,
neither erased. **(1)** `AGENT_RULES.md` §13 and the Op-74 defect table in `DECISION_LOG.md` said the
phantom is *"cited once, in `DECISION_LOG.md`"*. **(2)** Six statements added by this PR said it is
*"cited at `R3_MERGE_RUNBOOK.md` line 6"*. Both named one member of a three-member set, and they named
**different** members — so the two standing records disagreed with each other while each read as
complete, inside a block whose stated function is that a cited rule number outside the canonical
enumeration is a **STOP** condition. `AGENT_RULES.md` receives one additive bullet and nothing else;
that edit scope is recorded in `DECISION_LOG.md`.)*

---

*Author: Bradley Gleave \<bradley@bradleytgpcoaching.com\> (R3). Governance and audit evidence
only; 0 production LOC.*

VERDICT: FINDINGS — `P0-AUDIT` evidence produced and routed; **B2 closes on landing, not before**; B1 recorded and reclassified, open by design; 0 P0 across both lenses, R14 CLEAN not met and not claimed.
