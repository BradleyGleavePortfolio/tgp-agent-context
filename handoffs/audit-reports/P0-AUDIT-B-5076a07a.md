# P0-AUDIT — Lens B (process / contract / ops / governance) — backend SHA `5076a07a`

## BUILD MATRIX
- backend HEAD: `5076a07a1e54b14e3db84d3aa128fb0bb44542d7`
- ctxrepo HEAD: `5c2f0057cd0ba4f5cba3b2dd2e6e718927549650`
- PR #28 head: `5c2f0057cd0ba4f5cba3b2dd2e6e718927549650`
- PR #28 base (origin/main): `b76d0962de53ce494fa8f869a706ff0c15aee0b6`
- timestamp (ISO 8601 UTC): `2026-07-27T21:30:00Z`

> **CANONICAL R124 MATRIX — this artifact family is the single source of truth.** The six-line block
> above, reproduced **verbatim identically** in [Lens A](P0-AUDIT-A-5076a07a.md) and
> [Lens B](P0-AUDIT-B-5076a07a.md), is the **only canonical** R124 BUILD MATRIX for Op 75. Every
> other surface that shows these values — [`BASELINE_HEADS_OP75.json`](../op75/BASELINE_HEADS_OP75.json)
> `build_matrix_r124`, [`PRE_BUILD_REVIEW_OP75.md`](../op75/PRE_BUILD_REVIEW_OP75.md),
> [`DECISION_LOG.md`](../../DECISION_LOG.md), [`current-state.json`](../importer-wave/current-state.json)
> — is an explicitly labelled **non-canonical mirror** carrying a forward pointer here. If a mirror
> disagrees, **these two reports win** and the mirror is the defect. No mirror may introduce an
> independent or contradictory value.
>
> **True role of each SHA** (labels matter, because two of these are prior tips, not current state):
>
> | SHA | Role |
> |---|---|
> | `5076a07a1e54b14e3db84d3aa128fb0bb44542d7` | **Audited backend target** — the subject of this rung. Immutable, and still live backend `main`. |
> | `5c2f0057cd0ba4f5cba3b2dd2e6e718927549650` | **Prior review input** — the exact ctxrepo head both independent reviews of these reports examined. A prior tip. |
> | `6871b5bfb059977ffb3ecaa54dfa7035436fd165` | **Remediated content input** — the first-remediation tip; parent of the second-remediation commit. Also a prior tip. |
> | `b76d0962de53ce494fa8f869a706ff0c15aee0b6` | **PR #28 base** — live default branch, stable across every remediation pass. |
> | *(current branch tip)* | **Not recorded in any committed artifact.** See the self-reference constraint below. |
>
> **Self-reference constraint.** An immutable committed file cannot contain the SHA of the commit that
> contains it: that SHA is a hash over a tree that includes this file, so writing the value in would
> change it. So the `ctxrepo HEAD` / `PR #28 head` lines above name a **prior tip**, never the tip
> that carries this document — and this document makes **no claim** to pin itself. The exact current
> head, its parent and its tree are attested in the **PR #28 body**, which is mutable metadata and
> does not alter any git SHA. Reviewers verify the live tip with
> `gh api repos/BradleyGleavePortfolio/tgp-agent-context/pulls/28 --jq '.head.sha'` cross-checked
> against `git rev-parse HEAD` and `git ls-remote origin refs/heads/docs/op75-p0-audit-5076a07a`.

**Rung:** `P0-AUDIT` ([`OWNERSHIP_AND_PR_LADDER.md` §3](../op74/OWNERSHIP_AND_PR_LADDER.md)) ·
**Subject:** `5076a07a1e54b14e3db84d3aa128fb0bb44542d7` — *"feat(dunning-v2): enforce Day-10 lockout via global guard mount, scoped to /roman/\*"* ·
**Companion:** [Lens A](P0-AUDIT-A-5076a07a.md) ·
**Op:** 75 · **Date:** 2026-07-27 · **Operator:** Bradley Gleave \<bradley@bradleytgpcoaching.com\>

---

## BUILD MATRIX — R124 evidence (both ways, full 40-char)

The block above is the R124 verbatim format ([`AGENT_RULES.md` R124 §Compliance.1](../../AGENT_RULES.md)),
repeated **identically** at the top of [Lens A](P0-AUDIT-A-5076a07a.md). Lens B records the same
evidence independently rather than deferring to Lens A — a single shared verification is one
verification, not two.

| Value | `gh api` | local `git rev-parse` / `git ls-remote` | Match |
|---|---|---|---|
| backend HEAD | `gh api repos/BradleyGleavePortfolio/growth-project-backend/commits/HEAD --jq .sha` → `5076a07a1e54b14e3db84d3aa128fb0bb44542d7` | `git ls-remote https://github.com/BradleyGleavePortfolio/growth-project-backend refs/heads/main` → `5076a07a1e54b14e3db84d3aa128fb0bb44542d7` | ✅ |
| ctxrepo **prior tip** (audit-execution SHA / prior review input) | `gh api repos/BradleyGleavePortfolio/tgp-agent-context/pulls/28 --jq .head.sha` → `5c2f0057cd0ba4f5cba3b2dd2e6e718927549650` **at capture, 2026-07-27T21:30:00Z** | `git rev-parse HEAD` → same **at capture**. Still verifiable now as an ancestor: `git merge-base --is-ancestor 5c2f0057 HEAD` | ✅ **at capture only** — re-running these commands today is *expected* to return the advanced tip. That is fix-forward, **not** drift. |
| PR #28 base (live `main`) | `gh api repos/BradleyGleavePortfolio/tgp-agent-context/pulls/28 --jq .base.sha` → `b76d0962de53ce494fa8f869a706ff0c15aee0b6` | `git ls-remote origin refs/heads/main` → `b76d0962de53ce494fa8f869a706ff0c15aee0b6`; base reached locally via `git merge-base HEAD origin/main` | ✅ **still true** — the base is stable; only the head advances. *(Prior wording cited `git rev-parse HEAD^`, true only while the branch had exactly one commit — R5/R132.)* |

Backend commit envelope at the audited SHA (`gh api …/commits/5076a07a1e54b14e3db84d3aa128fb0bb44542d7`):
tree `ba056fff8e760f3e1a12ed628c808c104ec5be0d` · **single** parent
`07ff974079eb1da02f1de4f5ecd18c1f223afeae` · committer date `2026-07-23T01:26:39Z` · author ==
committer == `BradleyGleavePortfolio <264851314+BradleyGleavePortfolio@users.noreply.github.com>`.

**No SHA moved during this audit. No INFRA_DEATH.**

> **`ctxrepo HEAD` semantics — deliberate.** `5c2f0057` is the **exact head both independent
> reviews examined** and the head this remediation is authored against. It is the **prior tip**,
> not the SHA of the commit that carries this file: an artifact cannot record the SHA of the
> commit that lands it (the constraint Op 74 recorded for the Op-73 context pin,
> [`BASELINE_HEADS_OP74.json`](../op74/BASELINE_HEADS_OP74.json) `repos.context.note`). **The
> post-landing context SHA is deliberately NOT claimed anywhere in this document.** Full
> reconciled pins: [`handoffs/op75/BASELINE_HEADS_OP75.json`](../op75/BASELINE_HEADS_OP75.json).

---

## Why Lens B exists

Lens B **executes** the `P0-AUDIT` rung that Op 74 framed **there** as discharging blockers **B1**
and **B2** ([`OWNERSHIP_AND_PR_LADDER.md` §8](../op74/OWNERSHIP_AND_PR_LADDER.md)). **This document
discharges neither on its own.** **B2** closes **on the landing of PR #28**, not on the drafting of
these two files — see the conditionality note directly below. **B1 does not close even then:** the
blocker table near the end of this document records B1 as **open by design** in its *After landing
of PR #28* column — a permanent historical marker, not a work item. Both are **recorded, not
repaired**: the commit is published on shared `main`, and the R3-INC-1 precedent plus R5 forbid
rewriting it. This document, together with [Lens A](P0-AUDIT-A-5076a07a.md), **is** the artifact
whose absence B2 names.

> *(R5/R132 — superseded wording named, not deleted: this passage previously opened "**Lens B
> discharges blockers B1 and B2**", unconditionally. That was false in two directions at once — it
> claimed for **B2** a closure that is conditional on landing, and for **B1** a closure that never
> occurs, contradicting this document's own blocker table. It is the same construction corrected in
> [`PRE_BUILD_REVIEW_OP75.md`](../op75/PRE_BUILD_REVIEW_OP75.md) §1; the Op-74 framing is quoted, not
> endorsed. No finding, severity, count, or item of evidence in this report changes.)*

> **Conditionality — read this before citing B2 as closed.** B2 closes **on the landing of PR #28**
> on context `main`, not on the drafting of these two files. Until the landing commit exists and is
> reachable from `main`, the R14/R138 evidence for `5076a07a` is **still not discoverable** by
> anyone reading the repo, which is exactly what B2 asserts. Every B2 statement below is scoped
> accordingly. See [§P1-2](#p1-2--the-r14--r138-evidence-for-a-money-path-change-was-missing-and-pr-520-did-not-supply-it-blocker-b2).

---

## Findings

### P1-1 — R3 identity violation on a money-path commit published to shared `main` (blocker B1)

```
author    = BradleyGleavePortfolio <264851314+BradleyGleavePortfolio@users.noreply.github.com>
committer = BradleyGleavePortfolio <264851314+BradleyGleavePortfolio@users.noreply.github.com>
```

R3 requires **both** author and committer to be `Bradley Gleave
<bradley@bradleytgpcoaching.com>`. Both are wrong here — this is not a committer-only slip.

Recorded as **R3-INC-4** in [`DECISION_LOG.md`](../../DECISION_LOG.md) with status
`OPEN_ACCEPTED_NOT_FIXED`. Lens B **confirms that disposition rather than reopening it**, and
**reclassifies the incident's mechanism**, which the first draft got wrong.

#### Reclassification (Op-75 remediation) — R3-INC-4 is *not* a server-side-merge incident

> **CORRECTED at the Op-75 remediation pass (2026-07-27).** The earlier wording of this finding
> read: *"Precedent R3-INC-1 (extension #5 `5eabeec`) and R3-INC-2 (backend #509 `1718293`) were
> both grandfathered on the same reasoning"*, and grouped R3-INC-4 with them as though it shared
> their cause. **That grouping is wrong and is superseded.** The *grandfathering* reasoning does
> carry across (see below); the **mechanism does not**. The stale wording is preserved here rather
> than erased (R5/R132).

| | R3-INC-1 / R3-INC-2 / R3-INC-3 | **R3-INC-4** (`5076a07a`) |
|---|---|---|
| Landing mechanism | GitHub **server-side** squash merge (UI button / `gh pr merge`) | **git-native** local squash + plain fast-forward — the **mandated** path |
| Evidence of mechanism | merge commit synthesized by GitHub; PR `merged=true` | **single parent** `07ff9740…` == PR #520 `baseRefOid`; PR #520 `merged=false`, GraphQL `mergeCommit: null`, and no PR-associated commit reachable from `main` |
| Committer produced | `GitHub <noreply@github.com>` (GitHub's GPG-signing identity — unsettable) | `BradleyGleavePortfolio <264851314+…@users.noreply.github.com>` (the **operator's own local git config**) |
| Root cause | forbidden mechanism was still reachable for `main` | correct mechanism run with an **unasserted local identity** |
| Forward fix | prohibit the mechanism ([`R3_MERGE_RUNBOOK.md` §1.1](../importer-wave/R3_MERGE_RUNBOOK.md)) | make the **pre-push identity assertion unskippable** — see below |

The distinction matters operationally: the R3-INC-1/2/3 fix (ban the server-side path) was already
in force at `5076a07a` and **was obeyed**. The mechanism is not the defect. The defect is that the
identity the mechanism *carried* was never checked, so **banning a merge button cannot prevent a
recurrence of R3-INC-4**. Treating the two as one incident class would have left the actual hole
open.

#### The existing runbook was insufficient — recorded

[`R3_MERGE_RUNBOOK.md` §1.4](../importer-wave/R3_MERGE_RUNBOOK.md) already declares both the
preflight and post-push identity checks **MANDATORY**, and §3.3 already contains the exact asserts
that would have caught this:

```bash
test "$(git show -s --format='%an <%ae>' "$NEW")" = 'Bradley Gleave <bradley@bradleytgpcoaching.com>'
test "$(git show -s --format='%cn <%ce>' "$NEW")" = 'Bradley Gleave <bradley@bradleytgpcoaching.com>'
```

`5076a07a` proves those asserts were **not run**. The runbook is therefore **insufficient as
written** — not incorrect, insufficient:

1. The assertion lives **inside a copy-paste block**, so skipping it is silent and leaves no trace.
2. It produces **no recorded artifact**, so "a landing without both recorded is a P1 finding"
   (§1.4) is unenforceable after the fact — absence of a record is indistinguishable from absence
   of a check.
3. It relies on the operator's **ambient** `user.email`; the `-c` / env belt-and-braces at §3.2
   only binds if that specific invocation is used, and nothing detects a bare `git commit`.
4. With backend branch protection absent (**B3**, [P3-2](#p3-2--branch-protection-absent-on-the-backend-repo-blocker-b3)),
   there is **no server-side backstop** at all.

**Preventive artifact:** [`handoffs/op75/R3_IDENTITY_PREPUSH_ASSERTION.md`](../op75/R3_IDENTITY_PREPUSH_ASSERTION.md)
— an independent, unskippable, evidence-recording pre-push gate, plus the runbook clarification
that distinguishes *mechanism* compliance from *identity* compliance. It is a **doctrine/process
artifact only**; it changes no production code and rewrites no history.

**Route to:** closed as recorded, with the reclassification and the preventive artifact.
**No force-push, no rebase, no amend on backend history.** The commit message itself is **clean** —
0 AI / agent / Claude / Anthropic / `Co-Authored-By` tokens; the violation is confined to the
identity trailers. **Blocker B1 stays open by design** — a permanent historical marker, not a work
item.

---

### P1-2 — The R14 / R138 evidence for a money-path change was missing, and PR #520 did not supply it (blocker B2)

`5076a07a` mounts a guard that can return `403` on **every** authenticated route in the product.
It is a money-path, blast-radius-maximal change. No R14 dual-lens report and no R138 Decision
Record existed for it anywhere in the context repo.

#### PR #520 evidence — corrected

> **CORRECTED at the Op-75 remediation pass (2026-07-27).** The earlier wording of this finding
> read: *"At the time of this audit no R14 dual-lens report and no R138 Decision Record were
> discoverable for it anywhere in the context repo"*, and
> [`BASELINE_HEADS_OP74.json`](../op74/BASELINE_HEADS_OP74.json) `repos.backend.open_blockers[1]`
> states: *"No associated pull request found via the GitHub commits/pulls API, so no R14 dual-lens
> audit trail and no R138 Decision Record are discoverable for this landing."* **The
> "no associated pull request" half is misleading and is corrected.** PR #520 exists and is
> trivially discoverable; what is empty is one specific endpoint. The *conclusion* — missing
> R14/R138 evidence — survives, for a different and more precise reason. Both stale strings are
> preserved in place (R5/R132); the JSON carries an additive correction rather than an
> edit-in-place.
>
> **Precisely what was and was not true.** `gh api repos/…/growth-project-backend/commits/5076a07a…/pulls`
> does return an **empty array** — that much of the original wording is literally correct, and it
> is *why* the first pass concluded no PR existed. But that endpoint lists PRs whose **head** is
> the given commit; `5076a07a` was never any PR's head, so emptiness there says nothing about
> whether a PR exists. Querying the PR directly finds #520 immediately. The original error was
> **inferring absence from one endpoint's silence**, not misreading the endpoint.

Live state (`gh api repos/BradleyGleavePortfolio/growth-project-backend/pulls/520`):

| Field | Value |
|---|---|
| `state` | **`CLOSED`** |
| `merged` | **`false`** |
| `mergeCommit` (GraphQL) | **`null`** |
| `merge_commit_sha` (REST) | `57b6d791c17296421cc31bfd3a1f4b75ed12cf45` — a GitHub-computed **test-merge**, **not** a landing: `compare/main...57b6d791…` → `status: "diverged"`, so it is **not reachable from `main`** |
| `mergedAt` / `mergedBy` | `null` / `null` |
| `headRefOid` | **`dcb5812668a8e3d8f659e60931a4c51502be7b53`** — **not** `5076a07a…` |
| `baseRefOid` | `07ff974079eb1da02f1de4f5ecd18c1f223afeae` — the audited commit's **single parent** |
| `createdAt` / `closedAt` | `2026-07-23T00:35:32Z` / `2026-07-23T01:27:15Z` (closed **36 s after** `5076a07a` landed at `01:26:39Z`) |
| reviews (`…/pulls/520/reviews`) | **zero** (array length 0) |
| `reviewDecision` | none |
| `…/commits/5076a07a…/pulls` | **empty array** — `5076a07a` was never any PR's head |
| title | *"feat(dunning-v2): enforce Day-10 lockout by mounting guard in global chain"* |

The correct reading: **the PR existed, and the landing bypassed it.** `5076a07a` was built
git-natively from `07ff9740` and fast-forwarded onto `main`; PR #520 was then closed unmerged, its
own head (`dcb5812…`) never becoming an ancestor of `main`. So:

- The PR **was** discoverable — the earlier "no associated pull request" claim is retracted.
- The PR carried **zero reviews**, so there was no R14 dual-lens audit **in** it either.
- The PR body is **not** the R138 Decision Record location for the landed commit, because the
  landed commit is not the PR's head.
- Consequently the R14/R138 evidence for the **landed** SHA was missing — B2's substance is
  intact. The defect is *bypass*, not *absence*.

This is also why R3-INC-4's mechanism is git-native (P1-1): the same evidence proves both.

#### What the missing evidence did and did not cost

The change was not bad. Lens A finds **0 P0**, and the two most dangerous properties — flag-OFF
hard no-op (`dunning-lockout.guard.ts:80`) and fail-open on lookup error (`:99-105`) — both hold.
The gap is that **nothing established that before it landed**, so the safety was accidental from a
reviewer's point of view. Lens A's **P1-1** (an unintended reachable route) is the concrete cost:
it survived because no review occurred.

#### Remedy and its condition

**Remedy:** Lens A + Lens B, produced against the exact head, each with its own R124 BUILD MATRIX
and both-ways evidence, plus the retroactive R138 gate below.

**Condition (do not elide):** these documents discharge B2 **only when PR #28 lands on context
`main`** via the git-native path in
[`R3_MERGE_RUNBOOK.md` §3](../importer-wave/R3_MERGE_RUNBOOK.md). Until then:

| State | B2 |
|---|---|
| PR #28 open / this branch unlanded | **OPEN** — evidence drafted but not discoverable from `main` |
| PR #28 landed on `main` (fast-forward, R3-clean) | **CLOSED** |

**`I1` is unblocked only in the second row.** Anything that reports B2 closed, or the backend
ladder open at `I1`, while PR #28 is unlanded is a **status assertion without evidence** and is a
**P0** finding under [`R-DUNNING-BAR-1`](../../roadmap/rulings/R-DUNNING-BAR-1_2026-07-27.md) §2
("status is derived, never asserted").

#### Retroactive `R138 Decision Gate` (reconstructed, `5076a07a`)

Reconstructed against **R138's four canonical questions** ([`AGENT_RULES.md`](../../AGENT_RULES.md)
§14, lines 1593–1602), because this table is the **R138 half of B2's closure evidence** and a gate
answering different questions could not discharge it.

| # | R138 question (canonical) | Reconstructed answer for `5076a07a` |
|---|---|---|
| 1 | **"How can I improve my choices with Elon Musk's 5 key first principles?"** | **(1) Question the requirement:** lock dunning-delinquent coaches out of paid surfaces — survives, it is the revenue-protection reason the guard exists. **(2) Delete the part:** the change is *almost* pure deletion of work — the `DunningLockoutGuard` was already written and already tested, so only the `APP_GUARD` mount was new. **56 production LOC** (Lens A, measured), genuinely minimal. **(3) Simplify what survived:** one terminal global guard rather than a decorator on every protected controller — fewer places to forget. **(4) Accelerate:** a global mount needs no per-controller follow-up PRs. **(5) Automate last:** correctly *not* reached — no alarm, no auto-rollback, which is finding **P2-2** below, not a step skipped in error. **Where the algorithm was not run:** step 1 was never applied to the *allow-list*. `ALLOWED_PREFIXES` carries two entries for prefixes that do not exist (Lens A **P3-1**) — requirements no one questioned, attached to no name, date or reason. |
| 2 | **"What would hyperscalers do?"** | **Practice cited: flag-gated progressive rollout with the flag as the live rollback (AWS/GCP), plus blast-radius containment.** Applied, and applied well: `FEATURE_DUNNING_V2` is **default-OFF**, and flag-OFF is a hard no-op at the top of the guard (`dunning-lockout.guard.ts:80`) — so the blast radius of the mount itself is zero until someone opts in. Containment is layered: unauthenticated passthrough (`:93-94`) and **fail-open** on lookup error (`:99-105`), so a database blip degrades to "not locked out" rather than bricking every authenticated route. All three verified in Lens A. **Where the hyperscaler answer was NOT applied:** *automated rollback on alarm* and *one-box/canary staging* are both absent. There is no declared p99, no error budget, and no `AuditEvent` per lockout transition, so no alarm can fire and no canary signal exists — the flag is a **manual** rollback only. That is finding **P2-2**, routed to **DUN-4**. |
| 3 | **"How can I get the GOOD without the BAD?"** | **GOOD:** delinquent accounts stop consuming paid compute, enforced in exactly one place that cannot be forgotten. **BAD:** a global guard sits in front of *every* authenticated route, so a defect brings down the product, and an over-broad lock traps a paying customer outside the very routes they need to pay. The separating structure is the four-layer carve-out — flag-OFF no-op, unauth passthrough, fail-open, and an allow-list keeping billing/auth/health reachable **while** locked out — which is the right shape: keep the GOOD, gate the BAD, do not "ship it anyway" and do not "block it entirely". **But the gating leaks in both directions, and that is the substance of this audit.** Too permissive: the second-segment clause (`:157-164`, tested at `:163`) makes `scheduling/auth/google/initiate` and `/callback` reachable while locked out, which the lockout message implies are locked — Lens A **P1-1**. Too restrictive: the carve-out misses `v1/coach/me/billing`, so a customer can be locked out of a route they need in order to cure the delinquency — Lens A **P2-1**. A GOOD-without-BAD answer that was *recorded* would have had to enumerate the allow-list against the real route table to make that claim, which is precisely the step that was never taken. |
| 4 | **"Am I attacking the root cause / issue / idea?"** | **Yes — mounting the guard attacks the actual root cause.** The guard's logic was already correct and tested; the reason delinquent accounts were still being served is that nothing *invoked* it. A terminal `APP_GUARD` mount fixes that at the source rather than adding per-route checks, and it is reversible two ways: delete one provider line, or leave `FEATURE_DUNNING_V2` unset. The flag is both the live rollback **and** the default. **No migration and no data write** — the guard is read-only, so no expand-contract or down-migration obligation (R82/R106). **Root cause NOT attacked, one level up:** the lockout **read** is `findFirst({ status: 'active' })` (`:127-140`) against a free-text `status` column with no enum and no CHECK constraint (`prisma/schema.prisma:3785`), so any unrecognised status value silently un-locks the account. Narrowing a predicate is a symptom fix; the root cause is an unconstrained state column — Lens A **P2-2**, routed to **DUN-1**. Filed, not papered over (R20). |

**Decision, and its rollback / blast-radius note.** Decision: mount the guard globally behind a
default-OFF flag. **Blast radius:** every authenticated route, bounded to zero while the flag is
unset. **Rollback:** unset `FEATURE_DUNNING_V2`, or remove the single `APP_GUARD` provider; no
migration to reverse, no data written.

**Verification evidence (`47` tests).** **37** unit cases in `test/dunning-v2-lockout-guard.spec.ts`
(1 `normalizePath` + 15 `it.each` ALLOWS + 12 `it.each` BLOCKS + 9 guard-behaviour) and **10**
over-the-wire cases in `test/dunning-v2-lockout-guard.e2e.spec.ts` — covering flag-OFF no-op, 403 on
protected routes, billing/auth/health not bricked, `/roman/*` reachable, `/ai/chat` still locked, and
envelope contents. Measured **test:src = 339 ÷ 56 = 6.05:1**, well over R74's 2.0. **Gap:** no case
asserts the allow-list against the repo's **real mounted controller table** — which is exactly how
Lens A **P1-1** survived.

> **CORRECTED at the third remediation pass (2026-07-27) — R5/R132, prior wording preserved.** This
> table previously asked *"What is the smallest change that delivers the value? / What could this
> break? / Is it reversible? / What evidence proves it works?"*. **Those are not R138's four
> questions**, and this gate is the one offered as **B2 closure evidence**, so the mismatch mattered
> most here. The four canonical questions are now asked verbatim in intent, and **every prior answer
> is retained**, remapped to where it belongs: *smallest change* → Q1 step 2 (delete) and Q4
> (reversibility); *what could this break* → Q3's BAD and the blast-radius note; *is it reversible* →
> Q4 and the rollback note; *what evidence proves it works* → the **Verification evidence** paragraph,
> which R138's recording clause requires alongside the four questions rather than as one of them. The
> heading is renamed to the **`R138 Decision Gate`** form required by `AGENT_RULES.md` line 1601.
> Reconstructing the gate does **not** retroactively satisfy it: `5076a07a` still landed with no such
> record, which is why **B2 stays open until PR #28 lands**.

> **CORRECTED at the Op-75 remediation pass (2026-07-27).** The verification-evidence figure — then
> carried as "Q4", now the **Verification evidence** paragraph above — previously read *"14 unit cases
> (`test/dunning-v2-lockout-guard.spec.ts`, 167 lines) + 10 over-the-wire e2e cases"*. The unit
> figure was a count of `it(` literals that missed both `it.each([…])` tables. Recounted at the
> exact head: **37 unit + 10 e2e = 47**. Retained per R5/R132.

The **Verification evidence** gap is the transferable lesson: the tests assert the allow-list against
**hand-picked example paths**, never against the mounted route table, so an accidentally-matching
route was unobservable. **That test shape is a requirement on `DUN-1`**, and the corrected mounted-route
table in Lens A **P2-1** is its fixture.

**Route to:** **B2 CLOSED on landing of PR #28** — not before. Test-shape requirement → **DUN-1**.

---

### P2-1 — `FEATURE_DUNNING_V2` is registered in no switch registry, and R108's CI gate structurally cannot catch it

`FEATURE_DUNNING_V2` is **absent from all three** registries:

| Source | Present? |
|---|---|
| `prod-switches.yml` (226 switches) | **no** |
| `.env.example` (892 lines) | **no** |
| `src/common/env-validation.ts` `ENV_RULES` | **no** |

R108 is enforced by `test/prod-readiness/env-discovery.ts`, which fails the build when discovery
exceeds the registry. It does not fire here because of *how the flag is read* — the token constant
at `src/checkout/dunning-v2/dunning-v2.feature.ts:25` and the reader at **`:32-36`**:

```ts
// CONDENSED QUOTE — :25 and :32-36 are NOT contiguous, and the signature is reflowed
// onto one line. Per-line provenance is in the trailing comments.
export const FEATURE_DUNNING_V2_ENV = 'FEATURE_DUNNING_V2';                          // :25
export function isDunningV2Enabled(env: NodeJS.ProcessEnv = process.env): boolean {  // :32-34
  return (env[FEATURE_DUNNING_V2_ENV] ?? '').toLowerCase() === 'true';               // :35
}                                                                                    // :36
```

> **Citation corrected (Op-75 second remediation pass).** This block was previously cited as
> `:34-36` while quoting the `:25` constant, presenting a condensed excerpt as a contiguous quote.
> The reader function spans **`:32-36`**; the constant is at **`:25`**. Substance unchanged.
> Prior citation recorded rather than silently replaced (R5/R132).

The discovery scanner is **node-scoped to `process.env.*` / `process['env'].*`**
(`env-discovery.ts:196` — *"Node-scoped: only `process.env.*` and `process['env'].*` are
recognised."*). Here the read is `env[…]` on a **function parameter**; `process.env` appears only
as a default-parameter value with no property access. The flag is invisible to discovery,
discovery never exceeds the registry, and CI stays green. This is not a scanner bug — it is a
legitimate blind spot of an injectable-env pattern the registry convention does not model.

That the pattern is known makes the omission sharper: the importer flags **are** registered, with
the read style spelled out in the description —

```yaml
- name: FEATURE_SCOUT_INGEST
  description: "Scout ingest feature flag (IMPORTER). Read via process.env[FEATURE_SCOUT_INGEST]; default OFF until rollout."
```

— while the master switch for a billing state machine has no row at all. No live risk today
(absent ⇒ OFF, the intended posture), but at **Gate B** the operator has no registry entry to
flip, no declared `prod_default`, and no owner.

**Route to:** **DUN-1** — add the `prod-switches.yml` row (`tier: feature`, `prod_default: OFF`,
`auto_flip_on_in_prod: false`, `owner: billing`) plus the `.env.example` entry. Separately, the
injectable-env blind spot is a **registry-convention** item so other `isXEnabled(env =
process.env)` flags get audited; it is **cross-cutting, not W-IMP or W-DUN property scope**, and
per [§5 stop condition 2](../op74/OWNERSHIP_AND_PR_LADDER.md) needs its own R138 gate.

---

### P2-2 — No declared SLO and no transition record for a guard on the universal request path

With the flag ON the guard adds a per-request DB round trip on the hot path against an unindexed
column (Lens A **P2-3**), and it declares **no p99 and no error budget**. A lockout `403` is
observable only in application logs: an operator cannot answer *"who was locked out, when, and
why"* from any durable record.

#### R107 citation withdrawn

> **CORRECTED at the Op-75 remediation pass (2026-07-27).** The earlier wording read: *"emits no
> `AuditEvent` on a lockout 403 … R107 wants the audit record"*. **The R107 citation is withdrawn**
> and the `AuditEvent` type name was wrong. Retained per R5/R132.

R107 governs the `audit_log` table for **PII-touching mutations**. Two reasons it does not apply:

1. **Not a mutation.** The guard is strictly read-only: one `findFirst` on `DunningState`
   (`dunning-lockout.guard.ts:127-140`) and no write on any path. R107's trigger is absent.
2. **The table already exists.** `model AuditLog` is defined at `prisma/schema.prisma:1499`, so
   R107's structural obligation is satisfied repo-wide and is not outstanding at this SHA.

Citing R107 here would have routed a real gap to a rule that cannot close it — the same failure
shape as routing Lens A's P3-2 to a mobile rung.

#### Correct citations

| Missing | Rule / clause |
|---|---|
| Declared p99 + error budget for a universal-path guard | **R86** (p99 / error budget declared per surface) |
| Behaviour when that budget is exhausted | **R99** (error-budget freeze) |
| Lockout `403` emitted as a contract-grade telemetry event, not a log line | **R126** (telemetry as contract) |
| Per-transition record + dunning funnel metrics | [`R-DUNNING-BAR-1`](../../roadmap/rulings/R-DUNNING-BAR-1_2026-07-27.md) **P5**, and **DUN-E5** as its acceptance evidence |

A dunning-state **transition** record is separately required by P5 and would, once transitions are
written by the `DUN-1` state machine, fall in R107's scope. It does not at this SHA, because this
commit writes nothing.

**Route to:** **DUN-4** ([`OWNERSHIP_AND_PR_LADDER.md` §3](../op74/OWNERSHIP_AND_PR_LADDER.md) —
*"P5 — declared p99 + error budget, `AuditEvent` per transition, funnel metrics"*). Precondition of
**Gate B**, not of `I1`.

---

### P3-1 — LOC and test:src are now measured at this head (earlier "not measurable" claim superseded)

> **CORRECTED at the Op-75 remediation pass (2026-07-27).** This finding previously read: *"The
> managed worktree is a depth-1 partial clone (`git rev-list --count HEAD` = 1), so the `5076a07a`
> parent tree is unavailable and the PR-#520 diff cannot be reconstructed locally. R23/R76 (≤ 400
> prod LOC) and R74 (test:src ≥ 2.0) therefore cannot be recomputed from the worktree, and no
> recorded measurement exists to fall back on"*, and offered a **≈2.77:1** whole-file proxy. **The
> premise was wrong** — the shallow worktree is not the only source; the GitHub commits API returns
> the full per-file patch for the commit. Both figures are now **measured**. The stale wording is
> retained per R5/R132 and the proxy is **withdrawn**: it was computed from whole-file line counts,
> not from the diff, and it silently ignored `src/app.module.ts`.

Measured from `gh api repos/BradleyGleavePortfolio/growth-project-backend/commits/5076a07a1e54b14e3db84d3aa128fb0bb44542d7`
(`.files[]`), full detail in [Lens A](P0-AUDIT-A-5076a07a.md#build-matrix--r124-evidence-both-ways-full-40-char):

| File | + | − | Counts as |
|---|---|---|---|
| `src/app.module.ts` | 29 | 0 | production |
| `src/checkout/dunning-v2/dunning-lockout.guard.ts` | 27 | 23 | production |
| `test/dunning-v2-lockout-guard.e2e.spec.ts` | 307 | 0 | test |
| `test/dunning-v2-lockout-guard.spec.ts` | 32 | 25 | test |
| **Total** | **395** | **48** | **551** raw unified-diff lines |

**On 395 + 48 ≠ 551.** The 551 figure is the **raw unified-diff line count** of the patch — added
lines, removed lines, **plus** hunk headers (`@@ … @@`) and unchanged context lines. It is the
surface the R75 banned-cast scan reads, which is why it is quoted beside the ± totals rather than
derived from them.

| Gate | Requirement | Measured | Verdict |
|---|---|---|---|
| R23 / R76 | ≤ 400 production LOC | **56** (29 + 27 added) | **PASS** — 14 % of cap |
| R74 | test:src ≥ 2.0 | **339 ÷ 56 = 6.05:1** | **PASS** |
| R75 | banned-cast net additions ≤ 0, across **`src/` + `test/`** | **net 0** over all **551** raw unified-diff lines (incl. headers + context), both trees | **PASS** |

The R75 scope note is deliberate: **R131** names *"R75 misread as src-only"* as this wave's
failure mode, so the count is stated across `src/` **and** `test/` rather than for the guard alone.

**Route to:** no rung — the measurement is the remedy. **Standing requirement:** every future
landing records measured production LOC, test:src and R75 net **in the PR body**, so the numbers
survive a shallow clone and no future audit repeats this deferral (R138 Decision Record content,
[§6](../op74/OWNERSHIP_AND_PR_LADDER.md)).

---

### P3-2 — Branch protection absent on the backend repo (blocker B3)

Recorded for completeness; unchanged by this rung. `gh api repos/BradleyGleavePortfolio/growth-project-backend/branches/main/protection`
→ **404**. This absence is the mechanism by which a non-R3 identity reached shared `main`
(**P1-1**) and by which a money-path commit landed with zero reviews (**P1-2**). Until B3 is
resolved, R3 compliance rests **entirely** on operator discipline, which `5076a07a` demonstrates is
not sufficient on its own — R3-INC-5 is a question of when, not whether. The preventive artifact in
P1-1 narrows the window; it does not close it, because a local gate cannot bind a push that skips
it.

**Route to:** ops track; gates **Gate A**, **Gate B**, `DUN-11`, `I7`.

---

## Checks passed

- **Commit message hygiene (R3)** — 0 AI / agent / Claude / Anthropic / `Co-Authored-By` tokens in
  subject or body. The message accurately describes the change, names the flag posture
  ("`FEATURE_DUNNING_V2` is NOT flipped"), states the `/roman/*` scoping decision and its
  rationale, and documents the `lockout_copy` envelope behaviour honestly rather than claiming
  delivery. It cites PR #520 — which, per **P1-2**, exists but was closed unmerged; the citation is
  accurate as a reference and misleading only if read as "landed via".
- **Landing mechanism (R3 / `R3_MERGE_RUNBOOK.md` §1.1)** — **compliant.** Single parent equal to
  the then-`main` tip, no GitHub-synthesized merge commit, `mergeCommit: null`. The forbidden
  server-side path was **not** used. Only the identity was wrong (**P1-1**).
- **Flag posture (R-DARK-1)** — `FEATURE_DUNNING_V2` default-OFF, enabled only on the exact string
  `'true'`. No auto-enable, no allowlist variant, no partial rollout. Correct for a billing state
  machine.
- **Rollback (R82 / R106)** — no migration in this commit, so no expand-contract or down-migration
  obligation. Rollback is unsetting one env var; the guard is read-only and writes no state.
- **Contract (R80)** — `docs/contracts/importer-openapi.json` untouched. This commit does not enter
  W-IMP territory. No contract drift.
- **Budgets (R23 / R76 / R74 / R75)** — measured and passing; see **P3-1**.
- **Ownership ([Op 74 §1](../op74/OWNERSHIP_AND_PR_LADDER.md))** — the commit predates Op 74 but is
  retro-consistent with W-DUN's OWNS list (`src/checkout/dunning-v2/**`) plus the `app.module.ts`
  §2 serialization point. It does not touch `src/scout/**` or `src/import/**`. *(One Lens A finding,
  P3-2, concerns `src/filters/**`, which the commit does **not** modify and which §1 assigns to
  **neither** workstream — routed there to an ownership decision, not to a rung.)*
- **Quarantine (B4)** — `build-sbom` and `release-please` remain RED on pre-existing,
  diff-independent grounds and were **not** folded into this product commit. All product checks at
  the SHA are green: `build-and-test`, `CodeQL JS/TS`, `Deploy app`, `mwb-3-live-tests`,
  `rls-floor-guard`, `rls-live-tests`.
- **Rule numbering (R-RULE-AUTHORITY-1 §4)** — every rule cited in this document falls inside the
  canonical enumeration **R1–R126 and R130–R138**. **R127–R129 do not exist** (blocker **B6**,
  permanent, never renumbered per R5) and are cited nowhere here.
- **No secrets** — no credential, key, or provider token in the diff surface, tests, or message.

---

## Rung disposition

**`P0-AUDIT` is discharged by this pair of documents — on their landing.**

| Blocker | Before | After **landing** of PR #28 |
|---|---|---|
| **B1** — R3-INC-4 identity | open, unrecorded audit, mechanism misclassified | **open by design**, permanently recorded, **reclassified** (git-native mechanism / local-identity defect), preventive gate filed, **no history rewrite** |
| **B2** — no R14 / R138 trail for `5076a07a` | open, **blocks all backend rungs**; PR #520 evidence misstated | **CLOSED** — dual-lens audit + retroactive R138 gate landed, PR-#520 bypass recorded. **Still OPEN while PR #28 is unlanded.** |
| **B3** — branch protection / secrets | open | unchanged (ops track) |
| **B4** — `build-sbom` / `release-please` RED | open | unchanged, quarantined |
| **B5** — email credentials | open | unchanged |
| **B6** — R127–R129 gap | permanent | unchanged, never renumbered |

**`I1` becomes the next permitted backend rung only once B2 is actually closed** — i.e. once this
PR is on `main` (§3's order `P0-AUDIT → I1 → DUN-1 → …`). The findings routed to `DUN-1` / `DUN-3` /
`DUN-4` and to the `src/filters/**` ownership decision are **preconditions of Gate B**, not of `I1`.

**Nothing in this rung authorizes a build, a merge, a flag flip, or a completion claim.**
`FEATURE_DUNNING_V2` remains default-OFF. No production code is changed by this document or its PR.

---

## Remediation record for this document (Op 75, newest-wins)

Corrections applied at the Op-75 remediation pass, after two independent exact-head reviews of
`5c2f0057`. Every prior wording is retained visibly in place above under R5/R132 — nothing was
silently rewritten.

| # | Corrected | Was | Now |
|---|---|---|---|
| 1 | R124 BUILD MATRIX | a pointer at Lens A ("Identical to Lens A"), short SHAs, no PR head/base, no timestamp | full **six-line** verbatim R124 block at the very top, full 40-char SHAs, PR #28 head + base, UTC timestamp, **independent** both-ways `gh api` vs local evidence |
| 2 | R3-INC-4 classification | grouped with R3-INC-1 / R3-INC-2 as a server-side-merge incident | **git-native mechanism (compliant), wrong local operator identity** — distinct class, with the mechanism evidence and a preventive pre-push gate |
| 3 | Runbook sufficiency | not assessed | recorded **insufficient as written** (assert buried in a copy-paste block, no artifact, ambient identity, no server backstop) → [`R3_IDENTITY_PREPUSH_ASSERTION.md`](../op75/R3_IDENTITY_PREPUSH_ASSERTION.md) |
| 4 | PR #520 | "No associated pull request found via the GitHub commits/pulls API" — absence inferred from one endpoint's silence | PR #520 **exists**, `CLOSED`, `merged=false`, GraphQL `mergeCommit=null`, REST `merge_commit_sha` is a **diverged test-merge**, head `dcb5812668a8e3d8f659e60931a4c51502be7b53`, **zero reviews**; the `commits/…/pulls` array is empty only because `5076a07a` was never a PR head — the landing **bypassed** the PR |
| 5 | B2 closure | asserted "**B2 CLOSED** on landing of this audit pair" and "the backend ladder is unblocked from `I1` onward" | **strictly conditional** on PR #28 landing on `main`; asserting otherwise is a **P0** under R-DUNNING-BAR-1 §2 |
| 6 | Test totals (R138 Q4) | "14 unit cases" | **37** unit (1 `normalizePath` + 15 ALLOWS + 12 BLOCKS + 9 guard) + **10** e2e = **47** |
| 7 | R107 in P2-2 | cited for a read-only 403 denial | **withdrawn** — R107 covers PII-touching mutations and `model AuditLog` already exists (`prisma/schema.prisma:1499`); replaced by **R86**, **R99**, **R126**, R-DUNNING-BAR-1 **P5** / **DUN-E5** |
| 8 | LOC / test:src (P3-1) | "not independently recomputable"; ≈**2.77:1** whole-file proxy | measured **56** production LOC and **6.05:1**; proxy withdrawn; **R75 net 0 across `src/` + `test/`** (R131) |
| 9 | Verdict line | `## VERDICT:` heading at line 8, above the findings | exactly one `VERDICT:` line, on the **true final line** (R78/R16) |

*Author: Bradley Gleave \<bradley@bradleytgpcoaching.com\> (R3). Audit evidence only; 0 production
LOC in this document's PR. Findings recorded and routed; nothing repaired here.*

VERDICT: FINDINGS — 0 P0 · 2 P1 · 2 P2 · 2 P3
