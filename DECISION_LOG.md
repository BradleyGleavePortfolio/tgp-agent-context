# DECISION LOG

Operator-signed decisions that changed doctrine, architecture, or process. Every AGENT_RULES.md change requires a corresponding entry here (per the AGENT_RULES.md footer).

Newest first.

---

## 2026-07-20 (Op 65) — IMPORTER-I PRE-BUILD GOVERNANCE SLICE: canonical build brief + rule-authority ruling + site-agnostic doctrine ruling; two stale repo heads reconciled (docs/state + doctrine only, R14-exempt, R3-clean fast-forward)

**Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Category:** Pre-build governance + documentation/doctrine reconciliation (no product code)
**Governing decision:** the Op-63 R138 four-question directional gate (**"Defer messaging"**; see the Op 63 entry below + `decision_record_op63_v0_defer_messaging_2026_07_19`). IMPORTER-I is the **second V-PR within that already-gated scope**; this Op **briefs and pre-build-gates** it — it is not a new directional decision, so no fresh R138 gate is re-run. Executed under the standing R138 autonomy grant (full CEO/CPO/CTO authority; no routine-approval round-trip).
**Files touched (context repo):** `handoffs/importer-wave/IMPORTER-I_BUILD_BRIEF.md` (NEW), `roadmap/rulings/R-RULE-AUTHORITY-1_2026-07-20.md` (NEW), `roadmap/rulings/R-SITE-AGNOSTIC-1_2026-07-20.md` (NEW), `roadmap/M-IMPORTER-PRODUCT-MISSION_v1.md` (surgical pointer), `handoffs/importer-wave/current-state.json`, `handoffs/importer-wave/OPERATOR_HANDOFF.md`, `DECISION_LOG.md`. **No product code changed; no AGENT_RULES.md edit. Documentation/state + doctrine only — audit-exempt per R14 scope; the IMPORTER-I *build* PR remains fully subject to R14 dual-lens audit + the git-native `R3_MERGE_RUNBOOK` path.**

**Decision — VALIDATE FIRST, then BUILD SMALLER.** Per the pre-build review (`/home/user/workspace/importer-i-pre-build-review.pplx.md`), the useful IMPORTER-I slice is a thin, adapter-neutral READ over canonical reconstructed entities; the repository already holds nearly every primitive, so new storage/flags/joins/totals/queues are waste. The only pre-code blockers were governance defects (no canonical brief; unresolved rule authority for R74–R127 in leaf repos). This Op resolves both.

**Deliverables.**
1. **IMPORTER-I build brief** — `handoffs/importer-wave/IMPORTER-I_BUILD_BRIEF.md`. A coach-scoped, family-parameterized reconstructed-entity review READ: `GET /api/scout/reconstruct/entities?family=<allowed>&cursor=<opaque>&limit=<bounded>`, returning canonical rows + honest page metadata (`page_count` + opaque `next_cursor`). Scope is canonical rows + honest page metadata, **NOT a second progress system** (the POST reconstruction `staged=reconstructed+skipped+failed` accounting stays separate/authoritative). **No new table, migration, flag, queue, workflow engine, totals scan, cross-family join, source DTO, credential/claim flow, billing, or messaging.** REUSE the roster read path + `RECONSTRUCT_ENTITY_TYPES` allowlist + existing dark flags + live-RLS harness; BUILD only generic entity materialization + a thin opaque non-authorizing cursor + OpenAPI/contract/behavioral/RLS/erasure tests.
2. **Site-agnostic doctrine reconciliation** — `roadmap/rulings/R-SITE-AGNOSTIC-1_2026-07-20.md` + a surgical forward-binding pointer in the canonical mission doc. TrueCoach is **one interchangeable validation adapter**, never an MVP, privileged first phase, architecture driver, or release-sequencing assumption; the product is site-agnostic **from inception**; "first" confers no privilege; no adapter-specific core contract. Prior decision records and handoff provenance are **preserved verbatim** (R5/R132) — only the live north-star mission surface carries the pointer; no unrelated history rewritten.
3. **Rule authority resolved** — `roadmap/rulings/R-RULE-AUTHORITY-1_2026-07-20.md`. The context-repo `AGENT_RULES.md` is the **single canonical rule authority** for every leaf repo; a leaf repo citing rules it does not define locally (e.g. R74–R127) is bound by the canonical text, **resolved by reference** (repo + path + `main`) — **no invented text, no ~167 KB duplication**. Basis: `AGENT_RULES.md` line 5 ("There is no other rules file"), line 9 ("single canonical constitution"), R15 ("GitHub is the only source of truth"), R4 line 363 (scope-resolution docs live in the context repo). A leaf local rules file is a non-authoritative mirror; where shorter/silent/conflicting, the canonical file wins.
4. **Consumer + semantics pinned** — IMPORTER-I enables source-neutral mobile/web review of write-only reconstructed **workouts + client_history** (and clients) through canonical family rows; named consumer = **PR-M4** (fixture-level consumer test required); the existing POST progress remains separate; **erased entities must be proven absent by cascade + fail-closed RLS behavior of the D2 model, NOT by adding a `Deleted` state.**
5. **Canonical state updated** — `current-state.json` op label/headline advanced to Op 65; `progress.IMPORTER-I` + the vertical-proof `v_pr_stack` now point at the brief; `decision_record_op65_importer_i_prebuild_2026_07_20` records the Idiot-Index/DELETE decisions and next dependency.
6. **Two stale repo heads reconciled (independently RE-VERIFIED against GitHub at Op 65):** `repos.backend.main_head` **`77bb4a0` → `f9b81cf`** (IMPORTER-H PR #512; author==committer==`Bradley Gleave`, single parent `77bb4a0`, committer date 2026-07-19T06:08:05Z — the rest of the doc already narrated IMPORTER-H LANDED, only this pinned field lagged) and `repos.context.main_head` **`bcbe409` → `d275b14`** (the Op-64 reconcile tip; the field was never advanced through Op-62/Op-64). No content drift in either repo — only pinned-head bookkeeping was stale.

**Backend-unblocked verdict.** IMPORTER-I backend implementation is now **LEGALLY UNBLOCKED to dispatch**: the pre-build STOP blockers (missing canonical brief; unresolved leaf-repo rule authority) are resolved. Remaining gates are the ordinary build/audit gates in the brief §5, cleared during the IMPORTER-I build PR's own R14 cycle — not pre-build blockers. **NOT dispatched this Op.**

**Rollback / stop.** Docs/state + doctrine only — reversible by reverting the Op-65 commit; no runtime/flag/data impact. Downstream hard stops for the IMPORTER-I build unchanged: any need for a new migration/table/flag/infra requires a fresh pre-build gate; never an adapter-specific core contract; never a `Deleted` state for erasure; billing never captured/staged/reconstructed.

**Invariants preserved.** `AGENT_RULES.md` not edited (the rulings clarify/reinforce, they do not amend); `R3_MERGE_RUNBOOK.md` mechanics unchanged and not weakened; D2 decision (Op 59) unchanged; billing exclusion preserved; messaging deferred (not dropped); production flags default-off (none enabled); no product-repo code touched, no mobile dispatch; historical decision records and handoff provenance preserved verbatim (R5/R132); mission remains site-agnostic/browser-agnostic (TrueCoach only a validation adapter); `truth_boundaries.no_e2e_proof_yet` and `no_truecoach_mapper` still hold; context reconcile landed R3-clean by plain fast-forward (author==committer==`Bradley Gleave <bradley@bradleytgpcoaching.com>`, no AI/co-author tokens), audit-exempt per R14 scope.

**Evidence URLs.** Backend IMPORTER-H landed commit (re-verified this Op): https://github.com/BradleyGleavePortfolio/growth-project-backend/commit/f9b81cf73289bfe74087dfe6327e52e460fb44f6 · Context main pre-Op-65 base: https://github.com/BradleyGleavePortfolio/tgp-agent-context/commit/d275b142fc155d3838ef164673a93684f0073ff6

---

## 2026-07-19 (Op 64) — IMPORTER-H LANDED: site-agnostic MULTI-FAMILY reconstruction (clients + workouts + client history) on backend `main` via the git-native `R3_MERGE_RUNBOOK` path (first V-PR of the TrueCoach vertical proof; executes the Op-63 "Defer messaging" scope)

**Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Category:** Milestone landing (importer product code, IMPORTER-H — backend multi-family reconstruct) + documentation reconciliation
**Governing decision:** the Op-63 R138 four-question directional gate (**"Defer messaging"**; see the Op 63 entry below + `decision_record_op63_v0_defer_messaging_2026_07_19`). This Op is a **reconcile of a completed landing that executes that decision**, NOT a new directional decision — so no fresh R138 gate is re-run; the Op-63 gate is the delegated-approval artifact for this lane.
**Files touched (context repo):** `DECISION_LOG.md`, `handoffs/importer-wave/current-state.json`, `handoffs/importer-wave/OPERATOR_HANDOFF.md`. **No product code changed here; no AGENT_RULES.md edit. `R3_MERGE_RUNBOOK.md` is UNCHANGED — its git-native doctrine/mechanics remain true and were followed verbatim; nothing there is stale to reconcile. Documentation/state only — audit-exempt per R14 scope.**

**LANDING.** Backend PR #512 (audited head `43c226366fd9e248f3a8d4a8ed26bdfd54b64805`, base `77bb4a04f6e087886e6f27c5129d17dc5162f356`) parametrizes the hardcoded clients-only `RECONSTRUCT_ENTITY_TYPE='clients'` reconstruct/roster path into site-agnostic **MULTI-FAMILY** reconstruction — **clients + workouts + client history** — into canonical TGP entities under the D2 identity model, with honest per-family `staged = reconstructed + skipped + failed`. **Billing EXCLUDED; messaging DEFERRED** (per Op 63). It landed via the git-native `R3_MERGE_RUNBOOK.md` path — git `commit-tree` squash + PLAIN fast-forward push, **no `--force`, no `--force-with-lease`, no admin bypass, no server-side merge** — as backend `main` **`f9b81cf73289bfe74087dfe6327e52e460fb44f6`**.

**Verified evidence (as reported by the backend lane / re-checkable via `gh`):**
- **Identity:** author == committer == `Bradley Gleave <bradley@bradleytgpcoaching.com>`; no AI/co-author tokens. **R3-CLEAN** — the fourth R3-CLEAN backend-`main` landing via the git-native path (after #508/`95e2c63`, IMPORTER-F #510/`1e6b3bf`, IMPORTER-G #511/`77bb4a0`).
- **Tree integrity:** landed tree byte-identical to the audited head (`43c2263`) tree.
- **Parent:** single parent `77bb4a0…` (IMPORTER-G tip) → linear/fast-forwardable; drift guard held (base == prior tip, no drift); R124 both-ways verified (live PR head == audited head).
- **PR state:** #512 **closed**, NOT server-merged (expected for the git-native path; matches the #508/#510/#511 precedent); closed with a landed-SHA comment. Feature branch **DELETED** (not a zombie).
- **Audit:** two dual independent exact-head audits at `43c2263` CLEAN, **zero P0–P3**. The sole P3 (a dead field) surfaced at an earlier head `a1f7606` and was fixed **DELETE-FIRST** at `43c2263`, then re-audited **FRESH dual CLEAN**. All exact-head PR checks green.
- **Quality gates:** **R76 [LOC-EXEMPT]** operator waiver (R100 escape hatch; an operator waiver, NOT a bypass and NOT an R109 metric-gaming split); **R74** test:src ratio **2.12** (≥ 2.0); **R75** banned-cast net **ZERO**.
- **Safety:** feature dark behind `FEATURE_SCOUT_INGEST` + `FEATURE_SCOUT_RECONSTRUCT` (both default-off; **no new flag**); the path is dark unless both are `"true"`. Billing remains an explicit excluded family; messaging deferred (not built as a v1 entity).

**Operational findings (recorded, non-blocking):**
1. **Post-merge `build-sbom` and `release-please` FAILED — PRE-EXISTING automation debt, NOT IMPORTER-H regressions.** `build-sbom`: npm `prepare` runs `lefthook install` under a production-only install where the lefthook devDependency is absent → exit 127. `release-please`: GitHub Actions lacks permission to create/approve PRs. Both were already red on prior main `77bb4a0`; IMPORTER-H changed no package/workflow/SBOM/release-config file. Inherited debt to fix separately; not gating.
2. **Post-merge CI on `f9b81cf` is now TERMINAL and VERIFIED** (supersedes the Op-64 "still running" tracked state). **Core CI GREEN** — build-and-test, rls-live-tests, mwb-3-live-tests, rls-floor-guard, CodeQL JS/TS, Deploy app. The only red is the two pre-existing non-regression automation jobs in finding 1 (`build-sbom`, `release-please`), both already red on prior main `77bb4a0`. Per-job run URLs (success + both failures with prior-main comparison) live in `current-state.json` `decision_record_op64_importer_h_landed_2026_07_19.postmerge_ci_evidence` — not duplicated here.
3. **Backend `main` remains NOT branch-protected** (as recorded since Op 60). The drift guard is git's own non-fast-forward rejection (verified: no drift), not server-side protection. Operator to reconcile intent. Unchanged this Op.

**Order / next.** IMPORTER-H is the first V-PR of the TrueCoach end-to-end vertical proof and is now LANDED. **NEXT dependency = IMPORTER-I** (backend coach-scoped mobile-readable per-family review/progress read contract; OpenAPI bump + R80 byte-pinned drift). Existing order **preserved: IMPORTER-I → PR-M4 → V5.** IMPORTER-I **NOT dispatched this Op** — awaits its own R14 dual-lens cycle on its build PR.

**Rollback / stop.** Forward-only, non-destructive: `git revert f9b81cf` via a normal reviewed PR. NO history rewrite / force-push over shared `main` (forbidden by runbook §5 / R4 / R102; reserved to the operator). This context reconcile is docs/state only and reverts by reverting the Op 64 commit.

**Invariants preserved.** AGENT_RULES.md not edited; R3_MERGE_RUNBOOK git-native mechanics unchanged and not weakened; D2 decision (Op 59) unchanged; billing exclusion preserved; messaging deferred within v1 (not dropped from the product); production flags default-off (none enabled); no mobile dispatch/modification; mission remains site-agnostic/browser-agnostic (TrueCoach is only the first proving adapter, not product scope); `truth_boundaries.no_e2e_proof_yet` still holds (no end-to-end completion claimed); context reconcile landed R3-clean by plain fast-forward, audit-exempt per R14 scope.

**Evidence URLs.** PR: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/512 · Landed commit: https://github.com/BradleyGleavePortfolio/growth-project-backend/commit/f9b81cf73289bfe74087dfe6327e52e460fb44f6

---

## 2026-07-19 (Op 63) — V0 SCOPE DECISION: **DEFER MESSAGING** — the TrueCoach end-to-end vertical proof v1 covers **clients + workouts + client history**; messaging becomes a later specialized lane, not a generic v1 entity (R138-governed directional decision)

**Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Category:** R138-governed directional/scope decision for the next lane (TrueCoach end-to-end vertical proof) — **docs/state only**
**Files touched (context repo):** `DECISION_LOG.md`, `handoffs/importer-wave/current-state.json`, `handoffs/importer-wave/OPERATOR_HANDOFF.md`. **No product code changed. `AGENT_RULES.md` UNCHANGED — an R138 directional decision needs only the four-question gate + this entry, not a protected-rule change. `R3_MERGE_RUNBOOK.md` UNCHANGED — sole default merge doctrine; NO permanent R3 change. Documentation/state only — audit-exempt per R14 scope (R138 explicitly keeps doctrine/directional docs audit-exempt).**

**DECISION.** Per the operator's explicit ruling (**verbatim: "Defer messaging"**), the v1 TrueCoach end-to-end vertical proof (IMPORT-VERT) covers three data families — **CLIENTS, WORKOUTS, and CLIENT HISTORY**, all already captured and staged today. **Messaging is DEFERRED to a later specialized lane** (its own extractor + reconstruction contract) rather than being built as a generic entity family in v1. Consequent operator-directed resolutions:
1. **Next step is BACKEND-FIRST = IMPORTER-H** — backend multi-family reconstruct: parametrize the hardcoded `RECONSTRUCT_ENTITY_TYPE='clients'` path to also reconstruct workouts + client history into canonical TGP entities under the D2 identity model. No extension messaging lane precedes v1, because these families need no new capture.
2. **Deterministic golden fixtures** gate build/audit; **real-account end-to-end validation is deferred to V5** (staging full-loop dogfood).
3. **Mobile review UX** for the proof is the **minimal honest per-family counts/reasons screen** (`staged = reconstructed + skipped + failed` with reasons; no invented completion/percentage) — **not** the full diff/suggested-fixes luxury surface (deferred enhancement).
4. **Blueprint induction / autonomous site learning** is a **separate follow-on lane**, not part of v1.
5. **Branch controls unchanged** — the git-native non-fast-forward drift guard remains the control on product mains; enabling server-side protection stays a separate operator-reconcile item.
6. **No permanent R3 change** — R3 and the runbook remain the sole default doctrine; every V-PR lands git-native; the standing executor-identity tension (R3-INC-3) is resolved separately before the first V-PR land.

The v1 stack is therefore a BACKEND-FIRST dependency-ordered V-PR chain: **IMPORTER-H → IMPORTER-I** (mobile-readable per-family review read contract) **→ PR-M4** (mobile minimal honest counts/reasons) **→ V5** (staging dogfood + real-account validation).

**R138 FOUR-QUESTION DECISION GATE (the delegated-approval artifact).**
1. **First principles (Musk algorithm).** *Question* the requirement that the proof must exercise every mission family at once — its real job is to de-risk the pipeline, which three already-captured families do. *Delete* the biggest part: greenfield messaging (and any generic-messaging-entity build), plus blueprint induction and luxury review UX, from v1 — removing the longest pole. *Simplify* what survives: reuse the existing clients-only reconstruct/roster path, parametrized for workouts + history (one path, not per-family engines). *Accelerate*: deterministic golden fixtures give fast, repeatable build/audit. *Automate last*: no new automation/flags. Musk's warning applied — don't optimize a generic messaging entity that should not exist in v1.
2. **Hyperscaler lens (evidence).** Ship the thinnest vertical slice that exercises the whole pipeline, behind flags, on deterministic fixtures before real data — the AWS/GCP progressive-delivery + canary pattern (small blast radius first, widen later). Deferring real-account validation to a staging dogfood (V5) mirrors canary/one-box rollout before production; keeping every family behind the existing default-off scout flags is blast-radius containment by feature gating, not added human latency ([AWS Builders' Library — continuous delivery](https://aws.amazon.com/builders-library/going-faster-with-continuous-delivery/); [Google Cloud — safe rollouts](https://docs.cloud.google.com/kubernetes-engine/config-sync/docs/tutorials/safe-rollouts-with-config-sync)). Multi-family reconstruct as one parametrized path over a single contract is the platform pattern of one generalized pipeline over per-type forks.
3. **GOOD without the BAD (customer value + risks/mitigations).** **Customer value:** a faster, lower-risk end-to-end proof on data that already exists — proving capture → stage → reconstruct → honest review for the families a migrating coach cares about first (their clients, workouts, and history), which is the actual go-to-market trust surface. **BAD gated out:** (a) messaging looking "done" when deferred → recorded as an explicit deferred specialized lane; `truth_boundaries.no_e2e_proof_yet` still holds. (b) a clients-only shortcut masquerading as multi-family → IMPORTER-H must genuinely reconstruct workouts + history with per-family accounting (R109 "No Half-Ass"), verified by dual-lens audit. (c) fixture-only proof mistaken for real-world validation → real-account validation explicitly deferred to V5; no e2e completion claimed. Structure keeping GOOD while gating BAD: default-off flags + deterministic fixtures + honest per-family accounting + R14 dual-lens audit per V-PR + git-native R3 land.
4. **Root cause.** Attacks the real blocker: the lane was stalled on an undecided scope (greenfield messaging forced extension-first and a longer path). Deciding scope — defer messaging, go backend-first with families that exist — removes the actual blocker, not a symptom, and papers over no quality gate (R14 audit, R3 identity, D2 model, billing exclusion, default-off posture all preserved).

**REJECTED ALTERNATIVES.**
- **Include messaging in v1** (extension-first EXT-MSG capture then downstream) — greenfield across all three repos, longest pole, delays proving the pipeline on data that already exists. Operator ruled defer.
- **Build messaging as a generic v1 entity family** — messaging's threaded/participant-scoped capture + reconstruction shape warrants its own specialized lane, not the generic clients/workouts path.
- **Full luxury review UX in v1** (diff-by-family + suggested fixes + single commit) — minimal honest counts/reasons proves the review leg; luxury surface is a later enhancement.
- **Bundle blueprint induction into this lane** — separate follow-on; bundling blows lane scope and LOC caps.
- **Real-account validation as an IMPORTER-H build/audit gate** — deterministic fixtures gate build/audit; real-account validation batched to V5.
- **Amend R3 / the runbook to ease the first V-PR land** — no permanent R3 change; git-native path stays mandatory; identity tension resolved separately.

**EVIDENCE REQUIRED (downstream, not this docs decision).** IMPORTER-H: deterministic byte-pinned golden fixtures for workouts + client history; acceptance tests extending IMPORTER-F 1–8 per family; honest `staged = reconstructed + skipped + failed` accounting; R74 test:src ≥ 2.0; R75 banned-cast net +0; R23/R76 ≤400 prod LOC (R86 escape hatch if cohesive); byte-pinned OpenAPI drift; dual-lens R14 CLEAN at exact head; R124 both-ways; git-native R3 land.

**ROLLBACK / STOP.** Docs/state only — reversible by reverting the Op 63 commit; no runtime/flag/data impact. Downstream STOP conditions (unchanged): any P0–P3 open; any HEAD/base drift; a fixture contradiction; any design that mints a credential before verified ownership or uses email as a canonical/linking key (D2 hard stop); billing data appearing in any capture/stage/reconstruct path.

**NEXT ACTION.** Dispatch **IMPORTER-H** (backend multi-family reconstruct) as the first V-PR, on deterministic golden fixtures, default-off, landed via the git-native `R3_MERGE_RUNBOOK.md` path — but only after the R138 four-question gate is carried in its PR body and its R14 dual-lens cycle is CLEAN. **NOT dispatched this Op.** Resolve the R3 executor-identity question before the first product-main land.

**Invariants preserved.** `AGENT_RULES.md` not edited (R138 directional decision); `R3_MERGE_RUNBOOK.md` not edited (no permanent R3 change; git-native path mandatory); D2 model, billing exclusion, and the fully-LANDED immutable build order unchanged; mission remains site-agnostic/browser-agnostic (messaging deferred within v1, not dropped from the product); branch controls unchanged; all importer flags default-off (none enabled); no product code changed; `truth_boundaries.no_e2e_proof_yet` still holds; context decision landed R3-clean by the normal context-repo commit convention, audit-exempt per R14 scope.

---

## 2026-07-19 (Op 62) — PR-M3 LANDED via an OPERATOR-AUTHORIZED ONE-TIME BYPASS of the R3 merge doctrine (recorded honestly as R3-INC-3 — NOT R3-clean, NOT rewritten, NOT normalized)

**Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Category:** Milestone landing (importer product code, mobile PR-M3 — honest roster-derived review CTA) + **deliberate one-time R3/runbook exception** + documentation reconciliation
**Files touched (context repo):** `DECISION_LOG.md`, `handoffs/importer-wave/current-state.json`, `handoffs/importer-wave/OPERATOR_HANDOFF.md`. **No product code changed here. `AGENT_RULES.md` is UNCHANGED — the operator authorized a one-time bypass, NOT a permanent doctrine rewrite. `R3_MERGE_RUNBOOK.md` is UNCHANGED — it remains the sole default merge doctrine; this landing is an explicitly-recorded exception TO it, not a relaxation OF it. Documentation/state only — audit-exempt per R14 scope.**

**LANDING.** Mobile PR #287 (audited head `95c9aea1b2905440a37cb9762e4486e45747165c`, base `b8165beaa3804fe8a145214b772f97a3ae9eab65`) delivers the honest roster-derived review CTA on the paired panel (`useRosterReviewDelta`, typed CTA, analytics slug, flag default-off; Rule 18 baseline guard anchoring only on a successful load). It landed as mobile `main` **`e3a824f335ef75934fe860165ffc9c41a7b7956b`**.

**THE BYPASS (honest, deliberate, authorized).** The merge executors **refused** to author-AND-committer-force `Bradley Gleave <bradley@bradleytgpcoaching.com>` as the git-native `R3_MERGE_RUNBOOK` requires — they declined the forced-identity `commit-tree` as **provenance impersonation** of a human. Rather than block PR-M3 indefinitely, the operator authorized a one-time bypass (**verbatim: "just merge it under whatever name - a one time bypass"**) and it landed via the **FORBIDDEN** server-side path `gh pr merge 287 --repo BradleyGleavePortfolio/growth-project-mobile --squash --delete-branch`. This is the **FIRST DELIBERATE** R3/runbook deviation — distinct from the ACCIDENTAL R3-INC-1 (extension #5/`5eabeec`) and R3-INC-2 (backend #509/`1718293`). It is recorded as **R3-INC-3**, is **NOT R3-clean**, is **NOT rewritten/force-pushed**, and is **NOT to be normalized**.

**Verified evidence (independently re-checked via `gh` this session):**
- **Identity (NON-R3-CLEAN, honest):** git author `BradleyGleavePortfolio <bradleyapple1031@gmail.com>`; git committer `GitHub <noreply@github.com>` (login `web-flow`); squash body carries a `Co-authored-by: Bradley Gleave <bradley@bradleytgpcoaching.com>` trailer. These are the standard `gh pr merge --squash` records — **not** forced to Bradley-as-committer, and nothing hidden or rewritten. Not claimed R3-clean anywhere.
- **Tree integrity:** landed tree `91799bbc22aee2ee5608a925e16df2b61c6a84be`, **byte-identical** to the audited head (`95c9aea`) tree.
- **Parent:** single parent `b8165be…` (clean single-parent squash onto the exact expected base; no drift).
- **PR state:** #287 **MERGED** (mergedBy `BradleyGleavePortfolio`, mergedAt `2026-07-19T02:04:36Z`, mergeCommit `e3a824f`) — contrast the git-native path where PRs close `merged=false`. Head branch `feat/import-roster-review-pr-m3` **deleted** by `--delete-branch` (`gh api` → 404; not a zombie).
- **Pre-merge gate (re-resolved immediately before mutation, clean/no drift):** live `main` == expected base `b8165be`; PR head == audited `95c9aea`; `mergeable` MERGEABLE, `mergeStateStatus` CLEAN; head checks green (Analyze actions/js-ts, CodeQL, Typecheck+lint+test).
- **Audit (as reported by the landing executor):** dual-lens exact-head CLEAN at `95c9aea`; behavioral tests added for the Rule 18 guard; suite 296 files / 3577 tests green (delta 3→5=2 / 3→3). R124 both-ways verified (live `gh` PR head.sha == audited `95c9aea`). Figures recorded faithfully; the mobile suite was not re-run by this context reconcile.
- **CI:** post-merge CI GREEN on `e3a824f` (Analyze actions, Analyze javascript-typescript, Typecheck+lint+test); CodeQL green on the audited head pre-merge.
- **Safety:** review CTA behind a default-off flag; no flag enabled; no migration; mobile-only presentation reading the already-authorized coach-scoped reconstructed roster. Billing remains an explicit excluded family.

**Operational findings (recorded, non-blocking):**
1. **R3-INC-3 is the first DELIBERATE R3/runbook deviation** (R3-INC-1/2 were accidental). It is authorized, transparent, and honestly non-R3-clean — explicitly NOT normalized into doctrine.
2. **Standing tension:** the executors' refusal to author+committer-force Bradley conflicts with the runbook's git-native identity requirement. Prospective fix (NOT decided here, operator to weigh): (a) provision an execution environment/signing identity that legitimately maps to `bradley@bradleytgpcoaching.com` so the git-native path is honest, or (b) operator formally amends R3/the runbook. Until then the runbook is the mandatory default and any further deviation requires fresh explicit operator authorization.
3. **Server-side landing specifics:** unlike the backend git-native landings (#508/#510/#511), #287 shows state MERGED and the source branch auto-deleted — expected for the authorized platform path.

**Order / next.** Immutable build order (PR-C1c → D1 → D2 → IMPORTER-F → IMPORTER-G → PR-M3) is now **fully LANDED**. Next lane: **TrueCoach end-to-end vertical proof** — prove one real coach's data (workout, client history, messaging) flows extension-crawl → backend reconstruct → mobile review, end-to-end. **TrueCoach is only the first proving adapter; the core stays site-agnostic/browser-agnostic.** Billing remains excluded. NOT dispatched this Op.

**Rollback / stop.** Forward-only, non-destructive: `git revert e3a824f` via a normal reviewed PR on mobile. **NEVER** history-rewrite / force-push over shared mobile `main` to "fix" the identity (forbidden by R4/R102/runbook §5; reserved to the operator). `e3a824f` is grandfathered exactly like R3-INC-1/2 — the non-R3-clean identity stands on the record, honestly. This context reconcile is docs/state only and reverts by reverting the Op 62 commit.

**Invariants preserved.** AGENT_RULES.md not edited (one-time bypass, not doctrine rewrite); R3_MERGE_RUNBOOK.md not edited (remains the sole default doctrine); R3-INC-1/2 dispositions unchanged (grandfathered, not rewritten), R3-INC-3 added honestly alongside; billing exclusion preserved; importer/review flags default-off (none enabled); mission remains site-agnostic/browser-agnostic; `e3a824f` not claimed R3-clean anywhere; context reconcile itself landed R3-clean by the normal context-repo commit convention, audit-exempt per R14 scope.

**Evidence URLs.** PR: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/287 · Landed commit: https://github.com/BradleyGleavePortfolio/growth-project-mobile/commit/e3a824f335ef75934fe860165ffc9c41a7b7956b

---

## 2026-07-18 (Op 61) — IMPORTER-G LANDED: coach-scoped reconstructed invite-pending roster READ on backend `main` via the git-native `R3_MERGE_RUNBOOK` path (backend bridge realizing the PR-M3 precondition)

**Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Category:** Milestone landing (importer product code, IMPORTER-G — backend bridge read) + documentation reconciliation
**Files touched (context repo):** `DECISION_LOG.md`, `handoffs/importer-wave/current-state.json`, `handoffs/importer-wave/OPERATOR_HANDOFF.md`. **No product code changed here; no AGENT_RULES.md edit. `R3_MERGE_RUNBOOK.md` is UNCHANGED this Op — its git-native doctrine/mechanics and §5 status remain true; nothing there is stale to reconcile (unlike Op 60, which had genuine Op-58 stale wording). Documentation/state only — audit-exempt per R14 scope.**

**LANDING.** Backend PR #511 (audited head `aaf15b824251cd20968b3265cb9c7ef59f7e04eb`, base `1e6b3bf434cb58fbe65cea92a480755f0e414fb6`) adds a coach-scoped, tenant-isolated read (`GET /api/scout/reconstruct/roster`) over the invite-pending `Person`/roster rows materialized by IMPORTER-F — the backend bridge that lets mobile PR-M3 consume an authoritative reconstructed roster. It landed via the git-native `R3_MERGE_RUNBOOK.md` path — git `commit-tree` + PLAIN fast-forward push, **no `--force`, no `--force-with-lease`, no admin bypass, no server-side merge** — as backend `main` **`77bb4a04f6e087886e6f27c5129d17dc5162f356`**.

**Verified evidence (independently re-checked via `gh` this session):**
- **Identity:** author == committer == `Bradley Gleave <bradley@bradleytgpcoaching.com>`; no AI/co-author tokens. **R3-CLEAN** — the third R3-CLEAN backend-`main` landing via the git-native path (after #508/`95e2c63` and IMPORTER-F #510/`1e6b3bf`).
- **Tree integrity:** landed tree `b6f548f9cdbd1cd70e5aafc091b28b1ab627d030`, byte-identical to the audited head (`aaf15b8`) tree.
- **Parent:** single parent `1e6b3bf…` (IMPORTER-F tip) → linear/fast-forwardable; drift guard held (base == prior tip, no drift).
- **PR state:** #511 **closed**, `merged=false` (expected for the git-native path; matches the #508/#510 precedent); closed with a landed-SHA comment recording tree byte-identity, single-parent fast-forward, R3 identity, and the operator R100 waiver — not a UI merge and not an approval review. Head branch `feat/importer-g-reconstructed-roster-read` retained (git-native landing performs no canonical branch delete; not a zombie).
- **Audit:** dual exact-head audits at `aaf15b8` CLEAN (body records two non-blocking P3 test-depth notes only); R124 both-ways verified (live `gh` PR head == audited head).
- **R100 A1/A3:** 489 src / 783 test / 1.60 density; cohesive `service` (221) + `dto` (163) each exceed the ~133 src/PR ceiling a 2:1 split would impose. Resolved via operator-signed title-marker exemptions (`[LOC-EXEMPT:]` + `[TEST-EXEMPT:]`) per the R100 escape hatch — an operator waiver recorded in the PR title and close comment, NOT a gate bypass and NOT an R109 metric-gaming split.
- **CI:** post-merge core CI GREEN on `77bb4a0` (build-and-test, Deploy app, rls-live-tests, mwb-3-live-tests, CodeQL JS/TS, rls-floor-guard, actionlint, shellcheck). `build-sbom` + `release-please` remain **pre-existing** red on BOTH base `1e6b3bf` and new main `77bb4a0` (`lefthook: not found` automation debt; NOT an importer regression). `danger dry-run` skipped.
- **Safety:** read-only endpoint; no migration; no new flag — inherits `FEATURE_SCOUT_INGEST` + `FEATURE_SCOUT_RECONSTRUCT` (both default-off); the route is dark unless both are `"true"`. Contract 1.3.0, R80 drift green (42 specs). Billing remains an explicit excluded family.

**Operational findings (recorded, non-blocking):**
1. **Backend `main` remains NOT branch-protected** (`branches/main/protection` → 404), as first recorded at Op 60. The drift guard is git's own non-fast-forward rejection (verified: no drift), not server-side protection. Operator to reconcile intent (enable protection or update the runbook wording). Unchanged this Op.
2. **Pre-existing main-only automation debt persists** (`build-sbom`, `release-please` red on base and new main); worth a separate fix, not introduced here.
3. **IMPORTER-G was not in the originally documented immutable build order** (PR-C1c → D1 → D2 → IMPORTER-F → PR-M3). It is a legitimate dependency-safe backend bridge between IMPORTER-F (roster materialization) and PR-M3 (mobile review handoff): PR-M3 needs an authoritative coach-scoped roster read to consume. Recorded so canonical state no longer marks PR-M3 "next" while omitting IMPORTER-G.

**Order / next.** Immutable build-order semantics unchanged; IMPORTER-G is the read-bridge realizing the PR-M3 precondition. **PR-M3 (mobile honest review handoff) remains the next eligible ordered lane** — NOT dispatched this Op; mobile untouched. Before building PR-M3, verify reconstructed clients materialize in the exact roster read mobile will consume (`/api/scout/reconstruct/roster` and/or `/v1/coach/me/clients`).

**Rollback / stop.** Forward-only, non-destructive: `git revert 77bb4a0` via a normal reviewed PR. NO history rewrite / force-push over shared `main` (forbidden by runbook §5 / R4 / R102; reserved to the operator). This context reconcile is docs/state only and reverts by reverting the Op 61 commit.

**Invariants preserved.** AGENT_RULES.md not edited; D2 decision (Op 59) unchanged; R3_MERGE_RUNBOOK git-native mechanics unchanged and not weakened; billing exclusion preserved; production flags default-off (none enabled); no mobile dispatch/modification; mission remains site-agnostic/browser-agnostic (TrueCoach is only the first proving adapter, not product scope); context reconcile landed R3-clean by plain fast-forward, audit-exempt per R14 scope.

**Evidence URLs.** PR: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/511 · Landed commit: https://github.com/BradleyGleavePortfolio/growth-project-backend/commit/77bb4a04f6e087886e6f27c5129d17dc5162f356 · Close comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/511#issuecomment-5013052025

---

## 2026-07-17 (Op 60) — IMPORTER-F LANDED: invite-pending roster reconstruction on backend `main` via the git-native `R3_MERGE_RUNBOOK` path (first R3-CLEAN backend product landing)

**Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Category:** Milestone landing (importer product code, IMPORTER-F) + documentation reconciliation
**Files touched (context repo):** `DECISION_LOG.md`, `handoffs/importer-wave/current-state.json`, `handoffs/importer-wave/OPERATOR_HANDOFF.md`, `handoffs/importer-wave/R3_MERGE_RUNBOOK.md` (§5 stale-wording reconcile only — doctrine/mechanics unchanged). **No product code changed here; no AGENT_RULES.md edit. Documentation/state only — audit-exempt per R14 scope.**

**LANDING.** Backend PR #510 (audited head `c5f86c858a83bec1f46cfe71a52ef3fbb70a5acb`, base `171829326c50778af25c38aa10ff09665e58b512`) reconstructs settled crawl clients into invite-pending, non-login tenant-owned canonical `Person`/roster records per the DECIDED D2 model (Op 59). It landed via the git-native `R3_MERGE_RUNBOOK.md` path — git `commit-tree` + PLAIN fast-forward push, **no `--force`, no `--force-with-lease`, no admin bypass, no server-side merge** — as backend `main` **`1e6b3bf434cb58fbe65cea92a480755f0e414fb6`**.

**Verified evidence (independently re-checked via `gh` this session):**
- **Identity:** author == committer == `Bradley Gleave <bradley@bradleytgpcoaching.com>`; no AI/co-author tokens. **R3-CLEAN** — the first R3-CLEAN backend-`main` product landing of the wave.
- **Tree integrity:** landed tree `98589b74a354f7292e95386548523e3c796819d9`, byte-identical to the audited head tree.
- **Parent:** single parent `1718293…` (prior tip) → linear/fast-forwardable; parent D1 commit `1718293` REMAINS NOT R3-compliant (R3-INC-2, grandfathered) — neither rewritten nor claimed clean.
- **PR state:** #510 **closed**, `merged=false` (expected for the git-native path; matches the PR #508 precedent); closed with a landed-SHA comment — not a UI merge and not an approval review.
- **Separation of duties:** landed by an independent R3 merge operator (not builder, not auditor); no approval review submitted.
- **Audit/fixes:** both exact-head dual-lens audits CLEAN, **0 open P0–P3 after all five P3 fixes**; R124 both-ways verified; drift guard PASS (base == prior tip, no drift).
- **CI:** post-merge core CI GREEN (build-and-test, Deploy app, rls-live-tests, mwb-3-live-tests, CodeQL JS/TS, rls-floor-guard, actionlint, shellcheck). `build-sbom` + `release-please` remain **pre-existing** red on BOTH base `1718293` and new main `1e6b3bf` (`lefthook: not found` automation debt; NOT an importer regression).
- **Safety:** feature is dark — the route returns a uniform 404 unless BOTH `FEATURE_SCOUT_INGEST` and `FEATURE_SCOUT_RECONSTRUCT` == `"true"`; both default-off, no flag enabled by this landing. Billing remains an explicit excluded family.

**Operational findings (recorded, non-blocking):**
1. **Backend `main` is NOT branch-protected** (`branches/main/protection` → 404) despite the runbook's "protected `main`" / R102 framing. Not a STOP trigger — the drift guard is git's own non-fast-forward rejection (verified no drift), not server-side protection. Operator should reconcile intent: enable protection or update the runbook wording. Mechanics unchanged either way.
2. **Pre-existing main-only automation debt persists** (`build-sbom`, `release-please`); worth a separate fix, not introduced here.
3. **Stale wording reconciled:** `R3_MERGE_RUNBOOK.md` §5 said "D2 remains OPEN/PROTECTED … IMPORTER-F remains BLOCKED on D2" (Op-58 wording), now superseded by Op 59 (D2 DECIDED) and Op 60 (IMPORTER-F LANDED). Updated in this Op **without weakening** the runbook's git-native merge doctrine or mechanics.

**Order / next.** Immutable build order unchanged (PR-C1c → D1 → D2 → IMPORTER-F → PR-M3). Authoritative roster materialization is now LANDED, so **PR-M3 (mobile honest review handoff) is the next eligible ordered lane** — NOT dispatched this Op; mobile untouched. Before building PR-M3, verify reconstructed clients materialize in the exact roster read by `/v1/coach/me/clients`.

**Rollback / stop.** Forward-only, non-destructive: `git revert 1e6b3bf` via a normal reviewed PR. NO history rewrite / force-push over shared `main` (forbidden by runbook §5 / R4 / R102; reserved to the operator). This context reconcile is docs/state only and reverts by reverting the Op 60 commit.

**Invariants preserved.** AGENT_RULES.md not edited; D2 decision (Op 59) unchanged; R3_MERGE_RUNBOOK git-native mechanics unchanged and not weakened; billing exclusion preserved; production flags default-off (none enabled); no mobile dispatch/modification; context reconcile landed R3-clean by plain fast-forward, audit-exempt per R14 scope.

**Evidence URLs.** PR: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/510 · Landed commit: https://github.com/BradleyGleavePortfolio/growth-project-backend/commit/1e6b3bf434cb58fbe65cea92a480755f0e414fb6 · Close comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/510#issuecomment-4997666736

---

## 2026-07-16 (Op 59) — D2 DECIDED: imported clients are invite-pending, non-login tenant-owned canonical `Person`/roster records (hardened Option 1); IMPORTER-F unblocked

**Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Category:** Architecture decision (importer canonical client target, D2) + documentation reconciliation
**Files touched:** `DECISION_LOG.md`, `handoffs/importer-wave/current-state.json`, `handoffs/importer-wave/OPERATOR_HANDOFF.md`. **No product code changed; no AGENT_RULES.md edit. Documentation/state only — audit-exempt per R14 scope.**

**Operator directive (this session).** Research cybersecurity and RLS, select the top D2 option, and go with it. This is an explicit operator authorization to close the previously OPEN/PROTECTED D2 node.

**DECISION.** Imported clients live as **invite-pending, non-login `Person`/roster records owned by the coach/tenant** (hardened Option 1). **No `AuthPrincipal` or credential is created during import.** A `Person` is linked to an `AuthPrincipal` only after an explicit, **credential-verified claim** and **verified ownership**, through a **unique `AccountLink`**. Email is **unverified imported data** — never a canonical id and never an automatic linking key. Canonical model: opaque server-issued `person_id`; tenant-scoped `external_ref {source_platform, source_person_id}` as the idempotency/dedup key; states `InvitePending → Invited → Claimed → Suspended → Deleted`. Claim tokens are single-use, single-tenant, short-lived (≤5 min), unguessable; claim is atomic (create `AuthPrincipal` + `AccountLink` + flip `status→Claimed` in one transaction, or roll back all three). Rollback and erasure cascade imported data and links. Billing/payment credentials/methods/cards/vault tokens/profiles/subscription instruments remain **explicitly excluded** (see `billing_scope_exclusion`).

**REAL GOAL.** Immediate, deterministic, coach-visible import continuity with **zero premature credentials** and **one canonical source of truth**, while keeping tenant isolation, consent, deletion, and auditability intact.

**ROOT CAUSE (why D2 blocked IMPORTER-F).** The placement choice fixes the authorization key (tenant vs subject uid), the dedup/idempotency key, the linking gate, and the deletion cascade. None of those can be designed until the record's relationship to a credential is fixed — so `ScoutIngestEntity`→canonical reconstruction cannot begin without D2.

**OPTIONS WEIGHED.**
- **Option 1 — invite-pending non-login roster shell (SELECTED, hardened).** One tenant-owned `Person` record, no credential; deterministic credential-verified link on claim.
- **Option 2 — create a full auth `User` at import (REJECTED).** Manufactures phantom credentialed accounts keyed on unverified imported email — the account-takeover / auto-email-linking pattern vendors warn against; email-uniqueness collisions; unverified recovery paths; high blast radius (a bug can create/claim real logins across tenants).
- **Option 3 — separate staging identity as source of truth (REJECTED).** Two live PII stores duplicate truth, invite drift, and multiply tenant-isolation and deletion-failure surface with no offsetting benefit at TGP scale.

**FIVE-STEP RESULT (Musk Algorithm).** (1) *Questioned the requirement* — import needs a person *record*, not a *login*; the "login at import" requirement is false (Entra/SCIM prove records exist without credentials). (2) *Deleted* — premature credentials, temp passwords, and any second identity store. (3) *Simplified* — one `Person` entity + a `status` flag (SCIM `active` pattern). (4) *Accelerated* — deterministic import completes instantly; coach sees the roster immediately; verification deferred to claim. (5) *Automated last* — automate claim/link/verification only after the manual invite→claim path is proven; automatic email-linking is explicitly **not** automated.

**IDIOT-INDEX RESULT.** Option 1's cost ≈ the intrinsic cost of storing one person row. Options 2 and 3 pay full auth-principal / second-store overhead for the same contact — a high idiot index for no functional gain.

**EXTREME TEST.** 10× (10k clients, one import): O(1) per row via opaque id + `external_ref` upsert; Option 2 would provision 10k credential-less logins (Cognito's "confirmed but no verified recovery" liability at scale). 100× (same human across coaches): correctly two independent tenant-scoped `Person` rows (NIST: identifiers bound to a single subscriber; no cross-association); Option 2's email-keyed logins collide (`AliasExistsException`) and can leak across tenants. Worst case (hostile competitor export): no credentials minted, so a poisoned import can at most create quarantined non-login roster rows inside one tenant, contained by fail-closed RLS and reversible via rollback/erasure.

**HYPERSCALER LENS.** *Copy (evidence-backed):* credential-less pending record (Microsoft Entra External ID), prestaged profile linked before first sign-in (AWS Cognito `AdminLinkProviderForUser`), stable opaque `id` + `externalId` dedup + `active` status + write-only password (SCIM RFC 7643/7644), record-then-bind + no-email-identifiers + single-use short-lived link tokens (NIST SP 800-63C-4), fail-closed RLS + no exposed service key (Supabase), deny-by-default + opaque ids + every-request object checks (OWASP). *Do NOT copy:* full IdP/federation stack, pairwise PPIs / FAL2 machinery, SCIM bulk protocol, temp-password issuance, enterprise directory ops.

**RLS INTENT (vendor-neutral).** Deny-by-default / fail-closed; RLS enabled on every exposed table with nothing granted until a policy allows it. Pre-claim roster rows are **tenant/coach-scoped** (no end-user `auth.uid()` exists yet — a subject-uid predicate would silently fail). Post-claim rows are **subject-uid + tenant scoped**. The importer runs a server-only controlled path; RLS-bypassing service/`bypassrls` credentials are never exposed to the browser or customers. Every request gets an object-level tenant check; ids are opaque and non-guessable.

**GOOD WITHOUT BAD.** Keep deterministic import, roster continuity, no premature credential, single source of truth, credentialed explicit claim + deterministic link, tenant isolation + fail-closed authz, idempotent replay, rollback, audit, deletion. Exclude duplicate staging truth, automatic email-only linking, phantom logins, cross-tenant leakage, billing ingestion, and heavy enterprise identity infra.

**EVIDENCE REQUIRED (met).** Primary-source research report (fetched this session, every claim inline-cited): `/home/user/workspace/D2_universal_importer_identity_decision_report.md`. Primary sources: [Microsoft Entra External ID — B2B guest properties](https://learn.microsoft.com/en-us/entra/external-id/user-properties); [AWS Cognito — federated linking / prestaging](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-identity-federation-consolidate-users.html); [AWS Cognito — email alias uniqueness](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-attributes.html); [AWS Cognito — sign-up/admin states](https://docs.aws.amazon.com/cognito/latest/developerguide/signing-up-users-in-your-app.html); [SCIM RFC 7643](https://www.rfc-editor.org/rfc/rfc7643); [SCIM RFC 7644](https://www.rfc-editor.org/rfc/pdfrfc/rfc7644.txt.pdf); [NIST SP 800-63-4](https://csrc.nist.gov/pubs/sp/800/63/4/final); [NIST SP 800-63C-4 federation](https://pages.nist.gov/800-63-4/sp800-63c.html); [Auth0 — account linking concept](https://auth0.com/docs/manage-users/user-accounts/user-account-linking); [Auth0 — link user accounts](https://auth0.com/docs/manage-users/user-accounts/user-account-linking/link-user-accounts); [Firebase — account linking](https://firebase.google.com/docs/auth/web/account-linking); [Supabase — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security); [OWASP — Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html); [GDPR Art. 5](https://gdpr-info.eu/art-5-gdpr/); [GDPR Art. 17](https://gdpr-info.eu/art-17-gdpr/).

**ROLLBACK / STOP.** If claim volume or fraud shows the manual invite→claim path cannot scale, revisit *automation of claim* (step 5) — never revert to auto-creating logins. **Stop condition:** any design that mints a credential before verified ownership, or that uses email as a canonical/linking key. Reversible by reverting this commit (docs/state only; no runtime/flag/data impact).

**NEXT ACTION.** IMPORTER-F is now **unblocked** (D1 COMPLETE; the R3 merge-path is remediated/proven-forward per `R3_MERGE_RUNBOOK.md`; D2 DECIDED here). Build the default-off client-only reconstruction pass with the §4 canonical model — `Person` (opaque id, `tenant_id`, `external_ref`, `status`, unverified emails), `AuthPrincipal`, `AccountLink`, single-use `ClaimToken`; fail-closed tenant RLS; idempotent `external_ref` upsert; cascade delete/rollback — and land it via the git-native `R3_MERGE_RUNBOOK.md` path only (never a server-side merge). PR-M3 stays blocked until authoritative roster materialization.

### R138 four-question decision gate
1. **Musk's 5 principles.** Applied above (FIVE-STEP RESULT): questioned the "login at import" requirement (false requirement), deleted premature credentials and any second store, simplified to one `Person` + status, accelerated with instant deterministic import, automated claim last. "Don't optimize a thing that should not exist" — a phantom credentialed account should not exist.
2. **What would hyperscalers do.** Entra, Cognito, SCIM, NIST 800-63C, Auth0, Firebase, Supabase, OWASP all structurally separate a record/profile from an authentication principal and gate linking on verified ownership + credential proof — copied above; heavy federation machinery deliberately not copied.
3. **GOOD without the BAD.** Roster continuity and instant import (GOOD) without phantom logins, auto-email-linking, cross-tenant leakage, or a duplicate store (BAD) — gated by credential-verified atomic claim, opaque ids, and fail-closed tenant RLS.
4. **Root cause.** Attacks the root cause: the record↔credential relationship is fixed (record exists credential-free; credential bound only on verified claim), which unblocks the authorization key, dedup key, linking gate, and deletion cascade that IMPORTER-F needs.

**Invariants preserved.** AGENT_RULES.md untouched; R3/R14/R15/R102 unchanged and unrelaxed. Immutable build order preserved: PR-C1c COMPLETE → D1 COMPLETE → **D2 DECIDED** → IMPORTER-F (unblocked; land via `R3_MERGE_RUNBOOK.md`) → PR-M3 (blocked until authoritative roster). Billing remains an explicit `excluded` family; auth/PII/RLS/flags doctrine unchanged; all importer flags default-off; no production flag enablement and no deploy; backend/mobile/extension product code untouched.

**Audit exemption.** Pure context/state documentation — exempt from the product audit cycle (R14 scope). The IMPORTER-F *implementation* PR that consumes this decision remains fully subject to R14 dual-lens audit + the R3 merge runbook.

**Companion doctrine.** Subject to R131 — revisitable. Re-verification date: 2026-10-16.

---

## 2026-07-16 (Op 58) — R3 merge-path remediation: git-native squash + PLAIN fast-forward runbook adopted; server-side merges forbidden for production `main`

**Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Category:** Operational/process remediation (R3 / R5 / R102) + documentation reconciliation
**Files touched:** `handoffs/importer-wave/R3_MERGE_RUNBOOK.md` (new), `handoffs/importer-wave/current-state.json`, `handoffs/importer-wave/OPERATOR_HANDOFF.md`, `DECISION_LOG.md`. **No product code changed; no AGENT_RULES.md verbatim edit. Documentation/state only — audit-exempt per R14 scope.**

**Summary.** Codified the fix for the R3-INC-1 / R3-INC-2 recurrence (GitHub server-side squash stamping a non-Bradley author/committer). A new canonical runbook, `handoffs/importer-wave/R3_MERGE_RUNBOOK.md`, makes the **git-native squash + PLAIN fast-forward push** the SOLE mandated mechanism for landing any importer-wave PR on any production `main`. Server-side merges are **FORBIDDEN for `main`**: the GitHub squash UI button, `gh pr merge` (any mode), the REST/GraphQL merge endpoints, and GitHub web edit/commit flows — each re-authors the commit and violates R3.

**Root cause (from the read-only investigation).** GitHub's server-side squash **cannot** set author AND committer to `Bradley Gleave <bradley@bradleytgpcoaching.com>` — it forces committer=`GitHub` (to sign) and author=account identity. The defect is **avoidable, not inherent**: backend **PR #508** landed `95e2c6378e0b1b734328a7fdf6b9a6e33465a663` on backend `main` with full R3 author AND committer via a git-native squash-and-push one commit before the defect. That is the empirical proof the R3-clean path exists.

**Mandated path (fail-safe by construction).** (1) verify exact audited head + base with R124 both-ways and confirm base == live remote `main` tip (drift guard); (2) `git commit-tree` with tree == audited-head tree, single parent == pinned base, BOTH author AND committer forced to Bradley Gleave via env + `-c`; (3) **mandatory preflight identity check** (author, committer, tree, parent) before any push; (4) **PLAIN fast-forward push** (`git push origin <sha>:main`) with **NO `--force`, NO `--force-with-lease` ANYWHERE on `main`, NO admin bypass** — git's own non-fast-forward rejection is the drift guard, and on rejection the response is STOP and re-audit, never force; (5) **mandatory post-push verification** of remote identity + tree + required checks; STOP if branch protection rejects (no unprotect, no bypass). The sequence contains no force flag and pins the commit's single parent to the audited base, so it **cannot force-push and cannot land a drifting SHA**.

**Supersession (no AGENT_RULES edit).** This runbook **refines** `merge_procedure_change_2026_07_14`: where that entry said "lease-safe fast-forward (`--force-with-lease` pinned to the known base)", on `main` we now use a **PLAIN fast-forward** and `--force-with-lease` is used **nowhere on `main`** (it remains permitted only for `wip/*` snapshot branches per R6/R161). AGENT_RULES.md is untouched; R3/R14/R15/R102 are unchanged and unrelaxed. (Per the footer rule, no AGENT_RULES change means no rule-change entry is owed; this is a process/runbook decision.)

**R3-INC-2 disposition.** Remediation **PROVEN FORWARD**; incident **CONTAINED**. The historical GitHub-synthesized merge commit `171829326c50778af25c38aa10ff09665e58b512` is **GRANDFATHERED — NOT rewritten, NOT force-pushed, and NOT claimed R3-clean** (the canonical-identity copy of the D1 work survives on `refs/pull/509/head` = `81f0b70`). Residual (non-blocking): close the cause investigation of why #509 used the GitHub squash path; optional operator-gated R3/R102 verbatim tightening to name the runbook.

**Scope preserved.** Reversible importer work **REOPENS** under the runbook. **D2 remains OPEN/PROTECTED — NOT decided here.** IMPORTER-F is now blocked **ONLY on D2** (the R3 merge-path gate is cleared; D1 is complete). PR-M3 remains blocked until authoritative roster materialization. Immutable build order, billing exclusion (`excluded` family), auth/PII/RLS/flags doctrine, and backend/mobile product code are all unchanged; no flag enablement or deploy.

**Audit exemption.** Pure context/state documentation reconciliation — exempt from the product audit cycle (R14 scope). Reversible by reverting the commit; no runtime/flag/data impact.

---

## 2026-07-16 — Backend D1 COMPLETE (golden TrueCoach fixture, PR #509) + R3-INC-2 merge-identity incident recorded

**Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Category:** Canonical state reconciliation (docs/state only) + operational/process finding (R3 / R5)
**Files touched:** `handoffs/importer-wave/current-state.json`, `handoffs/importer-wave/OPERATOR_HANDOFF.md`, `DECISION_LOG.md`, `handoffs/process-findings/2026-07-16-backend-pr509-r3-merge-identity.md` (new). **No product code changed; documentation/state only — audit-exempt per R14 scope.**

### Part 1 — Backend D1 marked COMPLETE

**Summary.** The golden real TrueCoach client-payload fixture produced by extension PR-C1c (#7) has been committed to the backend at `test/fixtures/truecoach/clients.golden.json` via **backend PR #509** and squash-merged to backend main. D1 (the golden-fixture prerequisite for IMPORTER-F) is now **COMPLETE**.

**Verified facts.**
- PR #509: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/509
- Base `95e2c6378e0b1b734328a7fdf6b9a6e33465a663`; audited PR head `81f0b70a54a512a454289dade7755b34902e3564`.
- Fresh **Lens A CLEAN** and **Lens B CLEAN** after the PR-body fixer update; no drift.
- Squash-merged `2026-07-16T00:44:49Z`; backend main now `171829326c50778af25c38aa10ff09665e58b512`.
- Fixture/spec: `test/fixtures/truecoach/clients.golden.json` + `test/truecoach-golden-fixture.spec.ts`; source extension path `test/fixtures/cdp-traces/truecoach-clients.json` @ `4f116836ddb5449524dd51e995a7e4c012f79493`.
- Provenance byte-pin: blob sha1 `826fc5124a1cb6d45c9fbb87b5d3437974b8c3c2`, 2668 bytes, sha256 `af0387fea53dac5a9622c7de6d142c53986b6f4995784eccd6c51f204557e71f`.
- Merged-main verification: jest fixture spec **5/5 pass**; strict `tsc` exit 0; **15 pre-merge CI checks green**; **zero production LOC**; **billing excluded**; no auth/PII/RLS/flags/mobile changes.

**Build-order effect.** Immutable order preserved: PR-C1c COMPLETE → **D1 COMPLETE** → **D2 OPEN/PROTECTED (NOT decided here)** → IMPORTER-F (blocked until D2 **and** R3 merge-path remediation) → PR-M3 (blocked until authoritative roster). D2, auth/PII/RLS/billing doctrine, and build order are unchanged by this reconcile.

### Part 2 — R3-INC-2 (merge-identity incident) recorded honestly

**Summary.** The source PR head `81f0b70` was **R3-clean** (author AND committer both Bradley Gleave <bradley@bradleytgpcoaching.com>). However, PR #509 was landed via a **GitHub server-created squash merge**, and the resulting merge commit `171829326c50778af25c38aa10ff09665e58b512` is **author `BradleyGleavePortfolio <bradleyapple1031@gmail.com>`, committer `GitHub <noreply@github.com>` — NOT R3-compliant.** This is a **repeat of R3-INC-1** (same GitHub-squash identity failure) despite `merge_procedure_change_2026_07_14`, which mandated identity-safe manual squash + lease-safe fast-forward for future TGP merges.

**Decision.**
- Record R3-INC-2 as an **OPEN operational/process finding** with the exact SHA, cause **under investigation**, and **bounded blast radius (identity metadata only; code/test content verified)**.
- **Do NOT rewrite or force-push shared backend main** (destructive provenance alteration; declined consistent with R3-INC-1). backend main remains `1718293`.
- **Do NOT mislabel the merge commit as R3-compliant** anywhere in canonical state.
- **HARD GATE:** no further production-main merges on ANY TGP repo (extension, backend, mobile) until a **non-destructive R3-compliant merge path is proven**. IMPORTER-F is additionally blocked on this gate.

**Prospective fix.** Prove and adopt the identity-safe manual squash + lease-safe fast-forward path on a real TGP merge before any further production-main merge; investigate why #509 bypassed it and close the gap so GitHub-generated squash cannot be used for TGP production merges.

**Audit exemption.** Pure context/state documentation reconciliation — exempt from the product audit cycle (R14 scope). Reversible by reverting the commit; no runtime/flag/data impact.

---

## 2026-07-15 — Importer product-mission correction (site-agnostic/browser-agnostic; TrueCoach = first proof, not the product)

**Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Category:** Product-mission correction (R5) + documentation reconciliation
**Files touched:** `roadmap/M-IMPORTER-PRODUCT-MISSION_v1.md` (new canonical mission doc), `roadmap/M-IMPORTER-EXTENSION_v1.md` (demoted to first-vertical-slice build-plan), `handoffs/importer-wave/AGENT_HANDOFF_V03_2026-07-14.md` (§0-MISSION preamble), `handoffs/importer-wave/current-state.json` (`product_mission_correction_2026_07_15` block), `DECISION_LOG.md`, `roadmap/OPERATOR_DECISIONS_LOG.md`. **No product code changed.**

**Operator quote (verbatim, 2026-07-15 — do not paraphrase; preserved per R5):**
> "WRONG - your building a site agnsotics, ultra easy to use, browser agnostic tool that can seamlessly and autonymously pull ALL data from any comeptitors site - send to TGP Database, and be reconstructed to our set values instantly with a luxury UI while doing so!"

**Summary.** The operator corrected the importer mission: the product is **site-agnostic, browser-agnostic, autonomously-learning acquisition of ALL user-authorized data → TGP database → deterministic reconstruction into TGP's set values → luxury UI, with honest completeness accounting.** Prior canonical wording (chiefly `M-IMPORTER-EXTENSION_v1.md`) mistook **TrueCoach v0.3** — one proving adapter — for the whole product, and implied Chrome-only + a per-competitor mapped-extractor treadmill. TrueCoach on Chrome is now recorded explicitly as the **first proving adapter / vertical slice only.**

**Decision (R138 gate recorded in `M-IMPORTER-PRODUCT-MISSION_v1.md` §4; three options weighed in §5).** Selected **Option C** — split the mission (new canonical doc, verbatim quote at top) from the build-plan (`M-IMPORTER-EXTENSION_v1.md`, demoted to the first vertical slice), reconcile the state + handoff wording, and add a six-workstream PR graph (extension core, browser portability, autonomous learning, canonical mapping/reconstruction, backend orchestration/progress, luxury UI) that carries the wave from the proof to v1.0. Rejected Option A (leave stale wording — fails the correction + R5) and Option B (rip out TrueCoach/Chrome and build full generality before shipping — discards the audited, merge-ready v0.3 proof; violates R4 + "automate last").

**What is preserved.** The live v0.3 implementation (EXT-C1b PR #6 @`55f24d5` merge-ready; Mobile M2 PR #285 @`10414c4` dual-lens r2 in progress) is unchanged and authoritative — it is the first end-to-end proof. The engine (#5) is already `chrome.*`-free and host-injected, so the mission architecture is already partly built.

**Legal/security invariants clarified (mission doc §2, hard constraints R136):** no source-credential storage on TGP servers; user-authorized access only; no bypass of source access controls; fail closed on ambiguous mappings; never claim inaccessible data was imported.

**Five distinctions made explicit (mission doc §3):** MISSION ≠ FIRST PROOF ≠ CURRENT STATE ≠ v0.3 COMPLETION (current launch bar) ≠ v1.0 ACCEPTANCE (mission made testable).

**Audit exemption.** Pure context/documentation reconciliation — exempt from the product audit cycle (R14 scope). Reversible by reverting the commit; no runtime/flag/data impact.

**Companion doctrine.** Subject to R131 — revisitable. Re-verification date: 2026-10-15.

---

## 2026-07-13 — Add R138 (Operator Autonomy Grant + Four-Question Decision Gate + 24/7 Layered Wake)

**Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Category:** Doctrine addition + governance supersession
**Files touched:** `AGENT_RULES.md` (new §14 / R138; supersession notes on R9 and R15; audit-lens line in Appendix A), `DECISION_LOG.md`.

**Summary.** The operator, acting as CEO/CPO/CTO, delegated full executive authority to the acting agent for Bradley Gleave's TGP project: no operator approval is required for any decision — merging, squash-merging, or directional choices — provided the agent FIRST runs and records a mandatory four-question decision gate. Added as **R138** (new §14), with the operator's words preserved verbatim (both the CEO/CPO/CTO grant and the "stay awake forever / wake up anytime something finishes" durability addendum) per R5.

**What R138 delegates.** The R9 "Agent MUST present an operator choice" boundaries (a)–(j) and R15's "No PR merges to production `main` without operator approval" are SUPERSEDED **for this operator/project only** — replaced by the four-question gate. Both rules remain canonical for any other operator/project and were not deleted (prior doctrine preserved per R5/R132).

**What R138 does NOT waive (GOOD without the BAD).** The R14 audit cycle stays mandatory for product code (delegated *approval*, never the *audit*); R1 (decacorn) and R3 (identity) are SACRED and untouched; irreversible external side effects still require flag + expand-contract migration + idempotency + monitoring + rollback (hyperscaler pattern), not a bypass. Precedence: R138 is subordinate to R1/R3/R14.

**The four-question gate (operator's questions, each with a researched standard).** (1) Musk's 5-step Algorithm in order — question → delete → simplify → accelerate → automate (§13 R130–R137; [Inc./Isaacson](https://www.inc.com/jeff-haden/elon-musks-algorithm-a-5-step-process-to-dramatically-improve-nearly-everything-is-both-simple-brilliant.html)); (2) What would hyperscalers do — canary/one-box rollouts, automated rollback, blast-radius containment, pipeline gates instead of per-change human approval ([AWS Builders' Library](https://aws.amazon.com/builders-library/going-faster-with-continuous-delivery/), [Google Cloud approach-to-change](https://docs.cloud.google.com/docs/cloud-approach-to-change), [Google safe rollouts](https://docs.cloud.google.com/kubernetes-engine/config-sync/docs/tutorials/safe-rollouts-with-config-sync)), plus [Stripe idempotency](https://docs.stripe.com/api/idempotent_requests) for retry-safe decisions; (3) GOOD without BAD — keep velocity, gate risk with flag+canary+rollback+audit; (4) root-cause check (composes with R131/R19). The gate is recorded as an `R138 Decision Gate` block in the PR body (+ a DECISION_LOG entry for doctrine/architecture decisions); a governed merge/pivot without the record is a P1 finding.

**24/7 layered wake / durability (reconciled with R6 no-daemon).** Layered: (1) survive death first — push ≤2 min + checkpoints (R4/R6); (2) event-driven wake on completion (primary); (3) foreground heartbeat/scheduled wake for external state only (NOT a background daemon — R6's deprecated auto-push daemon stays banned); (4) watch coverage must match failure states, not just success; (5) zombie sweep on every pickup + session end (R8); (6) subagent liveness probes ≥ every 15 min (R7).

**R125 enforcement.** (1) rule text — this PR; (2) gate/enforcement — the mandatory R138 Decision Record + this DECISION_LOG entry (the machine-checkable delegated-approval artifact); propagation into product-repo PR templates (R101) + a heading-presence CI check tracked as R125/R20 follow-up; (3) audit-lens — added to Appendix A. Enforcers (1) and (3) land in this PR; enforcer (2) lands as the Decision-Record convention with the CI-check propagation tracked as follow-up.

**Audit exemption.** Pure context/doctrine docs are exempt from the product audit cycle (R14 scope); this change required only the four-question gate + this DECISION_LOG entry, and was merged under the R138 grant once applicable checks were green.

**Companion doctrine.** Subject to R131 — R138 is revisitable. Re-verification date: 2027-01-13.

---

## 2026-06-30 — Add R130–R137 (First-Principles Doctrine)

**Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Category:** Doctrine addition
**File touched:** `AGENT_RULES.md` (new §13, +6.3 KB)

**Summary.** Added eight new rules encoding Elon Musk's "Algorithm" (question → delete → simplify → accelerate → automate) plus two supporting rules:
- **R130** — Idiot Index (actual vs. theoretical-minimum cost, flag ≥ 3× ratios).
- **R131** — Question every requirement (including these rules; last-verified date required if > 6 months).
- **R132** — Delete before optimizing (if you don't add back ≥ 10%, you didn't delete enough).
- **R133** — Simplify only after R131 + R132.
- **R134** — Accelerate cycle time only after R131–R133.
- **R135** — Automate last.
- **R136** — Constraint audit: separate hard constraints (physics, TOS, regulation) from self-imposed policy (self-imposed → subject to R131).
- **R137** — Cycle-time ledger: per-wave dispatch/round/merge log; > 3-round PRs get a root-cause; > 1 lens-disagreement PRs get a doctrine-gap note.

**Motivating evidence (this wave, W1.5).** Two lens-disagreements produced audit-round waste that R131 + R137 would have prevented:
1. **R82 IRREVERSIBLE misread.** Round-1 fixer marked the `pg_stat_statements` migration IRREVERSIBLE with a comment; Lens A accepted it, Lens B correctly rejected it in round 2 ("every migration has a `down`"). R131 would have forced re-verification of "IRREVERSIBLE" as a doctrine escape hatch.
2. **R75 misread as src-only.** Lens A originally missed 27 banned-cast hits in `test/observability/*` because the auditor read R75 as applying to `src/` alone. The rule verbatim covers `src/` AND `test/`. R131 (question the reading) + R137 (log the disagreement) would have caught this in round 1.

**R136 immediate application — extension redesign.** The concurrent importer-extension design work anchors on R136: the only hard constraints for the browser extension are Chrome MV3 sandboxing, per-site TOS rate limits, and the locked `_interface.js` contract. Everything else (TGP-initiated-only flow, absence of in-popup auth) is self-imposed and is being challenged in the redesign.

**Scope confirmation.** Operator (via ask_user_question 2026-06-30 17:03 PDT) selected "All eight (R130–R137)" and "Push now" (do not wait for wave close).

**Companion doctrine.** R131 obliges this rules addition itself to be revisitable. Re-verification date: 2026-12-30.

---

## 2026-07-13 — Adopt Autonomous CEO/CPO/CTO Operating Constitution

**Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Category:** Constitutional doctrine
**Canonical file:** `AGENT_RULES.md` — Operator Constitution Addendum

### Decision record

**DECISION:** Preserve the operator's constitution verbatim inside the single canonical `AGENT_RULES.md`; apply it proportionally to every importer decision and require concise decision records without exposing raw chain-of-thought.

**REAL GOAL:** Keep autonomous execution fast while making consequential choices evidence-based, reversible, root-cause-oriented, and operable at hyperscaler quality.

**ROOT CAUSE:** Prior doctrine contained the component principles, but the decision sequence, option-selection discipline, extreme tests, good-without-bad synthesis, and standard record were fragmented.

**FIVE-STEP RESULT:**
- **Questioned:** A second canonical rules file was rejected because `AGENT_RULES.md` is the sole source of truth.
- **Deleted:** No duplicate constitution file or approval ceremony was added.
- **Simplified:** One verbatim addendum and one standard decision-record shape.
- **Accelerated:** The recurring importer watchdog now loads the same canonical doctrine each run.
- **Automated last:** Automation only enforces the already-simplified decision record and execution loop.

**IDIOT-INDEX RESULT:** Added no new service, dependency, state machine, or approval handoff; one source of truth governs all roles.

**EXTREME TEST:** At 100× work volume or after agent/session failure, the canonical rules plus live state and pushed commits remain sufficient to resume safely.

**HYPERSCALER LENS:** Small reversible PRs, exact-head audits, CI gates, canonical state, bounded failure, rollback, and observable evidence remain mandatory.

**GOOD WITHOUT BAD:** Preserve autonomous velocity and broad executive ownership while retaining independent audits, security boundaries, irreversible-action gates, and project doctrine precedence.

**EVIDENCE REQUIRED:** Exact constitution text in `AGENT_RULES.md`; watchdog references that canonical section; dual-lens CLEAN and CI remain merge gates; live state updated after audit/fix/merge.

**ROLLBACK / STOP:** Constitutional changes require an explicit operator instruction and signed doctrine commit. Product execution stops only at proven v0.3 E2E completion or a genuine external blocker.

**NEXT ACTION:** Build the narrowest end-to-end autonomous crawl unit: Start Import CTA → site-agnostic discovery/replay → bounded ingest/progress, then independently audit it.
