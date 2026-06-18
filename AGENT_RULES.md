# AGENT RULES — TGP Master Doctrine

**Effective: 2026-06-18** · **Owner: bradley@bradleytgpcoaching.com**

> Every operator and agent reads this file as law. There is no other rules file.
> Old files under `rules/` and `operator-meta/R*.md` are 2-line redirect stubs.
> Changes require a signed commit by the operator and a DECISION_LOG entry.

This document is the single canonical constitution for every TGP operator, builder,
fixer, auditor, architect, and scheduler. It consolidates every prior R-rule, the
R100 Hyperscaler Quality Mandate (55 rules), and 20 new hyperscaler-grade rules into
one continuous, gap-free enumeration (R1 → R99). Navigate R1 to R99 in order; you will
never hit a missing number.

**Reading convention.** Each rule carries: a one-line **headline**; a verbatim
**operator quote** where the rule originated from an operator utterance (the operator's
words and intent are preserved; obvious typos are corrected silently — the meaning is
sacred, the spelling is not); a **Why**; a **How to comply** checklist; and a
**Failure mode**. Where a rule originated in a numbered prior file, its provenance is
noted (e.g. "was R74"). Operator-uttered text is sacred in *meaning*: it is quoted,
never paraphrased to change emphasis or scope.

**Precedence stack (highest first):**
1. **R1 (Decacorn Quality)** and **R14 (Merge Gate: Audit Cycle Verbatim)** — tied at the top. The operator declared R81 "above all else with R0."
2. **R3 (Operator Identity)**, **R4/R5 (Never Lose)** — sacred durability rules, equal weight.
3. **R10 (Audits Exhaustive)** and the rest of §3 — the audit doctrine.
4. Everything else, in section order.

If any rule appears to conflict with R1 or R14, R1 + R14 win. Where the R100 pack and an
earlier rule overlap (e.g. the LOC cap), the **stricter wording governs**.

---

## §0 — SACRED FOUNDATION

### R1 — DECACORN QUALITY (Apple / Notion / Google test)
*(verbatim R0; SACRED; tied for highest priority with R14)*

**Headline:** Every decision must survive a design crit at Apple, Notion, or Google — or it does not ship.

**Operator quote (verbatim, 2026-05-30 — do not paraphrase):**
> **"R0 — UPHOLD DECACORN QUALITY AT ALL TIMES. WHEN MAKING DECISIONS, ALWAYS ASK 'WHAT WOULD APPLE, NOTION, OR GOOGLE CHOOSE TO DO?' AND GO WITH THAT COURSE OF ACTION. NEVER, EVER BREAK R0 OR R64."**

**Why.** R1 is a decision-quality filter applied at every choice point — architecture, UX, copy, animation, error handling, defaults, naming, ordering, throttle values, audit verdicts, everything. It is not "make it pretty"; it is "make the next decision the way a decacorn would."

**How to comply.**
- Before locking any non-trivial decision, literally ask: *What would Apple do here?* (visceral polish, cognitive de-load, smart defaults, invisible UX, error recovery, accessibility, peak-end arc); *What would Notion do?* (information architecture, progressive disclosure, object model over screen model, empty states as onboarding, power-user surfaces behind clean novice surfaces); *What would Google do?* (data density at scale, search/predict/autocomplete, performance budgets, observability, A/B-tested copy, i18n readiness, error-rate engineering).
- Apply the R0 audit checklist (emotional design, behavioral gamification, cognitive simplicity, outcome-first) before any screen, copy, or interaction ships. The operational manual is `design/MOBILE_APP_DESIGN_INTELLIGENCE_2026-05-30.txt` (Part VI master checklist).
- Treat the seven canonical anti-patterns as P0 release blockers: permission-front onboarding; feature-dump first screen; unescapable streaks; empty confirmation; inconsistency tax; gamification mismatch (proxy behavior rewarded); polish-as-afterthought.
- R1 governs **the next decision**, not retroactive perfection. Do not gut-renovate a CLEAN-audited service to chase polish (see R4).

**Failure mode.** A build that demonstrates any canonical anti-pattern, or a decision made without explicit Apple/Notion/Google framing, ships mediocrity that a decacorn would block at release. Auditors MUST flag such items as P0.

**Evidence:** originally `rules/R0_DECACORN_QUALITY.md`.

---

### R2 — R0 IS NOT "SHIP FAST" — IT MEANS "SHIP CORRECTLY"

**Headline:** Decacorn quality is a correctness mandate, never a speed excuse.

**Why.** The R100 pack opens on this exact frame: "R0 means *ship correctly*. Every rule below answers 'what would Apple, Google, or Notion choose?' The answer is never 'ship it anyway.'" When velocity and correctness conflict, R1 chooses correctness. Apple, Google, and Notion do not have the regressions we measured (test:src ratio collapse, banned-cast doubling, LOC creep) because they refuse to trade correctness for speed.

**How to comply.**
- Never invoke "R0 quality" to justify shipping unfinished, unaudited, or untested work faster.
- Never invoke "speed" to skip the audit cycle (R14), the 50-failures sweep (R10/R79), or the R100 gates (§7).
- When a deadline pressures a shortcut, the decacorn answer is "ship correctly, later" — not "ship it anyway, now."
- A missing R100 check is itself a finding (see §7).

**Failure mode.** Treating R0 as "ship fast" inverts the constitution and produces exactly the regressions R100 was written to close.

**Evidence:** frame stated in `operator-meta/R100_HYPERSCALER_QUALITY_MANDATE.md` §Frame.

---

### R3 — OPERATOR IDENTITY ON EVERY COMMIT
*(was R74; verbatim; SACRED)*

**Headline:** Every commit on every TGP repo is authored AND committed as Bradley Gleave <bradley@bradleytgpcoaching.com> — no AI/agent tokens, ever.

**Operator quote (verbatim, 2026-06-13 — do not paraphrase):**
> **"every single PR should say bradley@bradleytgpcoaching.com - no AI names - just bradley + my email"**

**Why.** The git author trailer is the only durable record of who owns the work. Bradley owns every TGP artifact; the history must say so. This is also a durability rule (siblings R4/R5).

**How to comply.**
- Every `git commit` uses inline flags (never `git config --global`, which the sandbox resets):
  ```bash
  git -c user.name='Bradley Gleave' -c user.email='bradley@bradleytgpcoaching.com' commit -m "<message>"
  ```
- For amends: add `--amend --reset-author`.
- No agent names. No assistant names. No `Dynasia G`, no `claude-bot`, no `auto-merge`, no `Co-Authored-by` trailers, no AI/Claude/Computer/Agent tokens anywhere in author, committer, or message.
- The prior `Dynasia G <dynasia@trygrowthproject.com>` convention is **RETIRED**. Prior history is grandfathered — do not rewrite it; only new commits must carry Bradley's identity.
- For `gh pr merge`, verify the resulting commit's author trailer is Bradley Gleave before the push completes.

**Failure mode.** Any commit authored under a non-Bradley identity is a hard R3 violation and pollutes the only durable ownership record.

**Evidence:** originally `rules/R74_OPERATOR_IDENTITY.md`.

---

## §1 — NEVER LOSE

### R4 — NEVER LOSE OPERATOR WORK OR TIME
*(was R52; verbatim; SACRED)*

**Headline:** Operator work and time are sacred — plan before parallelizing, push every 2 minutes, work 24/7, journal mid-flight state.

**Operator quote (verbatim, 2026-06-13 — do not paraphrase):**
> **"Basically, I hate losing operators work OR time - Avoid rebasing by planning out how PR's affect one another before parallelization + Make sure code is pushed every 2 min/done in github live + try and keep yourself working 24/7 - minimal product questions (only when necessary)"**

**Why.** Rebasing wastes operator-paid cycles (re-run CI, re-sweep 50-failures, re-attest dispatch, re-fire audits). Uncommitted sandbox work is unrecoverable. Idle sessions waste credits. The prior operator was credit-exhausted mid-flight on RNTL v14 builder R3 and stranded work — R4 makes that survivable.

**How to comply.**
- **Clause 1 — Plan before parallelizing.** Before any parallel code-writing dispatch, run an OWNS-list overlap check across every in-flight AND queued brief. If two PRs touch the same file and merge order matters, **serialize** — do not parallelize.
- **Clause 2 — Push every 2 minutes.** Every active worktree with uncommitted/unpushed work is `git push`ed at minimum every 2 minutes. Litmus: if the sandbox dies right now, every line of operator-paid work is already on GitHub.
- **Clause 3 — 24/7 posture.** Minimize product questions. Ask only when the decision is architectural, creates an irreversible external side effect, or a required input genuinely cannot be derived from canonical docs. When in doubt about ask-vs-decide, decide and journal it.
- **Clause 4 — Capture mid-flight state.** On operator handoff, identify every in-flight subagent/PR/worktree, verify GitHub state, resume from the exact stopping point, and update dispatch state + journal for the next operator.

**Failure mode.** A dead sandbox takes uncommitted work to the grave; an unplanned parallel dispatch forces a rebase that wastes a full operator-paid cycle.

**Evidence:** originally `rules/R52_NEVER_LOSE_OPERATOR_WORK.md`.

---

### R5 — NEVER LOSE ANYTHING
*(was R64; verbatim; SACRED)*

**Headline:** The moment the operator says a new rule, idea, feature, or landmine, upload it to GitHub in the same turn — assume you die within 24 hours.

**Operator quote (verbatim, 2026-05-28 — do not paraphrase):**
> **"IF THE USER MENTIONS NEW RULES / ASKS YOU TO MAKE NEW RULES, INSTANTLY UPLOAD THEM TO A GITHUB SPACE. NEVER LET A SINGLE THING DIE WITH YOU. IF THE USER NOTES A NEW PRODUCT IDEA / FEATURE, OR A FEATURE CHANGE, MENTION IT IN A GITHUB SPACE. NEVER. LOSE. ANYTHING. ASSUME THAT WITHIN 24HRS YOU WILL BE DEAD AND LOST FOREVER."**

**Why.** Sandbox death, context-window eviction, and operator handoffs all silently destroy anything not pushed to GitHub. Memory tools are best-effort, not durable. GitHub is the only place that lives forever.

**How to comply.**
- R5 fires the moment the operator says — even casually, even mid-paragraph — any: new rule/amendment/retirement; new feature idea/change/removal; new screen/route/endpoint/flow; pricing concept; competitive insight; persona/segment; market/channel/partnership; roadmap shift; new metric/KPI; new risk/blocker; new landmine; new dependency/credential; debugging discovery.
- When a trigger fires, in the SAME turn: pause the current task, choose the destination directory, write the file with the operator's exact words quoted verbatim at top, commit + push with R3 identity, confirm the remote SHA, then tell the operator what landed where.
- When in doubt: **upload.** The cost of an extra file is trivial; the cost of a lost rule is irreplaceable.
- Anti-patterns that do NOT satisfy R5: session-summary-only, memory-tool-only, "I'll batch it later," PR-description-only, "I'll remember this."

**Lost-forever note (do NOT refabricate).** Per the operator's declaration "**Lost rules are truly forever lost**" (2026-06-13), the original `RULES.md`, `R36_TO_R45_OPERATOR_RULES.md`, `AUDIT_MANDATE.md`, `HOUSE_RULES.md`, `50_FAILURES.md` and ~15 other docs were lost when a prior sandbox died and are **unrecoverable**. **Mobile R36–R45 (operator rules block) are lost forever.** This master does **NOT** renumber to fake-fill that range and does **NOT** reconstruct lost rules from memory — hallucinated canonical rules are worse than missing ones. The clean R1–R99 numbering here is a *fresh* enumeration of surviving + new doctrine, not a claim to have recovered R36–R45. If an old brief cites a lost R-number ambiguously, an auditor flags it P2 (doctrine ambiguity) and asks the operator to re-codify.

**Failure mode.** A rule, idea, or landmine spoken but never pushed dies with the session; the project loses something irreplaceable.

**Evidence:** originally `rules/R64_NEVER_LOSE_ANYTHING.md`; lost-forever record `rules/LOST_FOREVER_2026-06-13.md`.

---

## §2 — DURABILITY & EXECUTION

### R6 — DURABILITY: CHECKPOINT-DRIVEN FOREGROUND PUSHES (NO DAEMONS)
*(was R85 v3; v2 background-daemon path DEPRECATED)*

**Headline:** Every builder, fixer, and auditor pushes at named checkpoints, foreground only — no daemon, no timer loop, no auto-push of unreviewed content.

**Why.** The v2 background daemon (`nohup … & disown` pushing to shared `main` every 90s) was correctly refused by three independent auditors: it was irreversible (commits pulled by every client), collision-prone (parallel rebases), unattended (ran after foreground crash), and identity-unsafe (signed as operator without inspection). It also solved the wrong problem — Wave 4 zombies died in minute 1, not at the 90s gap. **The daemon path (`tools/r85_background_pusher.sh`) is DEPRECATED — never invoke it.** Only the checkpoint-foreground-push doctrine survives.

**How to comply.**
- **Auditors push at:** (1) after clone+setup (≤3 min, empty stub); (2) after banned-token sweep; (3) after reading diff + measuring LOC; (4) BEFORE any long command (`tsc`, `npm test`, doctrine sweep, `npm install`) — pre-build snapshot; (5) after build/test; (6) final report to `handoffs/audit-reports/TM-<N>-<X>-<SHA8>.md`.
- **Builders/fixers push at:** (1) after scaffold (WIP + open PR); (2) after each file changed (or every 5 min); (3) BEFORE any long command; (4) before marking ready-for-audit. Use `git push --force-with-lease origin HEAD:wip/<lane>-snapshot`.
- Every commit signed per R3. `cat` your own report before pushing (mental review).
- DO NOT: launch any background pusher; run any timed push loop; push unreviewed content.

**Failure mode.** Without checkpoints, a mid-task sandbox death loses all work; with a daemon, you corrupt shared `main` and sign as the operator without review.

**Evidence:** originally `operator-meta/R85_DURABILITY_MANDATE.md` (v3).

---

### R7 — SUBAGENT PUSH MONITORING
*(was R75)*

**Headline:** Never assume a subagent honors the 2-minute push rule — the operator probes every lane and pushes on their behalf.

**Why.** Empirically (6-lane night, L1–L6), subagents commit locally but push inconsistently even when R4 is restated verbatim. Broad-scope builder lanes batch commits and skip pushes; mechanical lanes push proactively; fixer lanes respond to pings.

**How to comply.**
- Probe each lane workspace at least every 15 min: branch, HEAD, unpushed-commit count (`git log @{u}..HEAD`), modified-file count.
- If unpushed commits exist → push them on the subagent's behalf with `api_credentials=["github"]`, after verifying R3 identity.
- If uncommitted changes persist >15 min → send a targeted R4 ping naming the files.
- If branch HEAD has not moved in 30+ min → treat as stalled: sharper ping, or cancel+redispatch with the failure mode added as an anti-pattern, or take the work synchronously.
- Every builder/fixer brief must carry the R7 push-discipline clause: after every commit, the immediate next action is `git push`; do not chain commits.

**Failure mode.** A subagent silently batches work locally, the sandbox dies, and a night of lane work is lost.

**Evidence:** originally `rules/R75_SUBAGENT_PUSH_MONITORING.md`.

---

### R8 — ZOMBIE AGENT PROTOCOL
*(from `operator-meta/ZOMBIE_AGENT_PROTOCOL.md`)*

**Headline:** A dead subagent's living work is the highest-velocity failure mode — run the zombie-detection sweep at the start AND end of every operator session.

**Why.** R14's high parallelism (dual auditors, separate fixers, architect+builder splits) means every cancellation, credit-exhaustion, or compaction can strand work: uncommitted worktrees, pushed branches with no PR, open PRs with no audit, workspace files never migrated, audit docs never pushed, return summaries lost to compaction. "The agent is dead. The work is alive. The operator doesn't know."

**How to comply.**
- **Detection sweep (run FIRST on every pickup, and again at session end):** (1) GitHub-side — open PRs, recently-updated branches, recent `main` commits not tied to a known PR, audit-doc commits for unrecognized PRs; (2) workspace-side — `audit-work/` files not mirrored to the context repo, `cron_tracking/<id>/` dirs newer than the last handoff; (3) sandbox-side — `/tmp/*/.git` worktrees with `git status` output or unpushed commits (**always `git fetch` first** to avoid false positives from `--not --remotes`); (4) audit-doc reconciliation against the handoff PR ledger; (5) backfill-ledger reconciliation; (6) conversation-history sweep for evicted-turn subagent references.
- **Verification matrix** per candidate: committed to remote? → open PR? → audited per R14? → audit filed in context repo? → mentioned in handoff by SHA? Fill every gap.
- **Recovery** by class: commit+push uncommitted worktrees to `recovery/<wave>-<desc>`; open PRs for orphan branches or document in `ABANDONED_BRANCHES.md`; migrate workspace files to the context repo then delete locally; dispatch dual audit on un-audited open PRs.
- **Prevention habits:** never cancel without first capturing `git status` + workspace state; end every subagent objective with "push all commits, push all docs, list every file written"; every handoff has an Attribution table (operator + PR + SHA + branch); cron heartbeats include a "Zombie risk: NONE/LOW/MEDIUM/HIGH" line.

**Failure mode.** The next operator assumes a clean slate, misses a merged-but-unaudited PR or an unpushed worktree, and either loses the work or ships unaudited code.

**Evidence:** `operator-meta/ZOMBIE_AGENT_PROTOCOL.md` (kept in place for running crons).

---

### R9 — AUTONOMY CONTRACT
*(from `operator-meta/AUTONOMY_CONTRACT.md`; operationalizes §4 of the operating doctrine)*

**Headline:** A bright line between what an agent decides alone and what requires operator approval — when in doubt, ASK.

**Why.** "The cost of a 30-second operator confirmation is one message. The cost of an autonomous architectural pivot the operator didn't approve is a multi-hour rollback." Autonomy keeps the 24/7 posture (R4) productive without letting agents make irreversible or doctrine-level changes unilaterally.

**How to comply.**
- **Agent CAN do autonomously:** spawn builders/auditors/fixers per the R14 cycle; squash-merge to *integration* branches when both auditors return CLEAN_NO_FINDINGS; spawn next-in-chain PRs per the build order; cancel+respawn a stalled subagent (after capturing worktree state); push handoff/doctrine/audit/brief/report docs; halt and write a scope-mismatch doc; re-audit on CI status change; refine rule wording in *summaries only* (never the verbatim quote files); update the backfill ledger.
- **Agent MUST present an operator choice (and not proceed without approval):** (a) architectural pivots not in the build order, including scope re-interpretations; (b) merging to production `main`; (c) adding/removing/editing R-rule verbatim quotes (R5 reserves this to the operator); (d) changing the audit cycle, auditor models, or dual-auditor split; (e) cancelling a subagent with uncommitted work; (f) any change to user data, PII, RLS semantics, billing/Stripe, or auth/JWT — even if "obviously safe"; (g) going past the LOC cap, even by one line; (h) changing the build order or merging out of sequence; (i) touching a repo the brief did not authorize; (j) spending a high-cost run on speculative, un-briefed work.
- Operator choices use the locked format: 🏛️ Hyperscaler research → Options (a)/(b)/(c) with blast radius/tradeoff/LOC/dependency → 🏋️ Coach/client metaphor → 📐 Forward-compat check → My recommendation.

**Failure mode.** An agent self-authorizes an architectural pivot or a prod merge, and the operator inherits a multi-hour rollback.

**Evidence:** `operator-meta/AUTONOMY_CONTRACT.md` (kept in place); full context in the operating-doctrine substance folded into R15.

---

## §3 — AUDIT PROCESS

### R10 — AUDITS MUST BE EXHAUSTIVE
*(was `rules/R72_EXHAUSTIVE_AUDITS.md`; verbatim operator quote; one of the two reconciled R72 substances — see Appendix Reconciliation History)*

**Headline:** An auditor never stops at "enough to report" — it sweeps the entire diff and reports every P0–P3 it can find in one round.

**Operator quote (verbatim, 2026-06-12 — do not paraphrase):**
> **"AUDITS MUST BE EXHAUSTIVE - FIND AS MANY PROBLEMS AS POSSIBLE - THERE IS NO \"ENOUGH TO REPORT\""**

**Why.** Each fixer round is expensive. If the auditor stops at the first blocking finding, the next round leaves work undone and the cycle drags. Exhaustiveness minimizes rounds: the goal is that the next fixer clears EVERYTHING and the re-audit lands CLEAN.

**How to comply.**
- Never sample, never truncate, never stop at "I found enough to mark it DIRTY." Sweep the entire diff surface.
- Report every P0/P1/P2/P3 in one round, with file:line evidence.
- Apply on top of the full 50-failures sweep (R79) in severity-pass order, plus the general hunt and the R100 checklist (§7).
- Every audit brief MUST quote this rule.

**Failure mode.** A half-swept audit hides defects that surface a round later, multiplying fixer cycles and operator cost.

**Evidence:** originally `rules/R72_EXHAUSTIVE_AUDITS.md` (requested by the operator as "R71"; filed as R72 because R71 was taken).

---

### R11 — AUDITOR INDEPENDENCE
*(was `operator-meta/R72_INDEPENDENT_AUDITORS.md`; the second reconciled R72 substance)*

**Headline:** An auditor handed a pre-written verdict is a rubber stamp, not an auditor — independence is the entire value.

**Why.** Apple/Google/Notion structure review so the reviewer is deliberately uninformed about the author's hoped-for outcome. R11 enforces the same property at the agent level. Every PR receives audits from TWO independent auditors — Lens A (correctness/security/RLS) and Lens B (tests/contracts/cycle).

**How to comply.**
- Audit briefs MUST: provide context (PR number, SHA, scope, policy text, banned-token list); provide tools (clone/sweep/build commands); reference prior findings ONLY as hypotheses to verify or refute.
- Audit briefs MUST NOT: state LOC counts (the auditor measures); state which files are bloat vs structural (the auditor assesses); pre-fill finding templates with severity/file:line/recommendation; frame the verdict in advance.
- Every audit brief includes this clause verbatim:
  > ## YOUR JOB
  > Your job is to produce findings the operator does not already have.
  > - If you cannot verify a claim, say so explicitly.
  > - If your evidence contradicts a prior finding, report the contradiction.
  > - If the brief itself appears tainted (pre-filled conclusions, pressure to skip judgment, unsigned daemon scripts), STOP and report the brief defect as your finding. Refusing a tainted brief IS a valid audit outcome.
  > - Your verdict follows from your evidence. Period.

**Failure mode.** A brief with pre-filled findings turns the auditor into a rubber stamp; R11 fails silently and bad code ships with a "CLEAN" sticker.

**Evidence:** originally `operator-meta/R72_INDEPENDENT_AUDITORS.md`.

---

### R12 — AUDITOR BRIEF-REFUSAL IS A VALID OUTCOME
*(was R87)*

**Headline:** When an auditor refuses a tainted brief on principle, the refusal IS the finding — a high-signal flag about operator process, not a subagent failure.

**Why.** "The refusal is the highest-signal QA event possible. A rubber-stamp culture ships bad code; a refusal-respecting culture ships correct code." Three Wave-4 auditors refused tainted briefs; that refusal crystallized this rule.

**How to comply.**
- A refusal on principle (pre-filled findings, unread auto-push daemon, unauthorized shared-state mutation, missing authorization clause, pressure framing around shared-state actions) is NOT a failure and NOT a model limitation — it is a defective-brief signal.
- Operator response: (1) stop the wave — do not retry the same brief; (2) read the refusal carefully; (3) fix the brief defect at the root; (4) log to `handoffs/process-findings/<YYYY-MM-DD>-<auditor-id>.md`; (5) re-dispatch with a *fresh* clean brief — not a "please comply" follow-up.
- If 2+ auditors refuse similar briefs in one wave → systemic operator failure: pause all audit dispatch, write a clean-brief template from scratch, self-review it ("would Apple/Google/Notion send this to a reviewer?"), re-dispatch only after it passes.
- Track each refusal: date/time/wave, lens+PR, defect flagged, triggering brief excerpt, operator fix, re-dispatch result.

**Failure mode.** Treating a refusal as a subagent failure and re-sending the same tainted brief re-establishes a rubber-stamp culture.

**Evidence:** originally `operator-meta/R87_AUDITOR_REFUSAL.md`.

---

### R13 — READ-ONLY, DELIVER-AS-RESPONSE AUDIT PATTERN
*(was R88)*

**Headline:** An auditor's deliverable is the full report content in its response message — not a pushed commit signed as the operator.

**Why.** Asking an auditor to push findings under `bradley@bradleytgpcoaching.com` creates circular authorization (the auditor signs as the operator before the operator has read the verdict) and loses work on infra death (Wave 4 lost ~80% of audits this way in one afternoon). Apple/Google/Notion auditors deliver written reports; reviewers integrate. R13 mirrors that.

**How to comply.**
- Clone to scratch; read-only on the audited repo; read context repo for context.
- Write the full report to `handoffs/audit-reports/in-progress/<task>-<lens>-<sha>.md` as a checkpoint (durability per R6) — this is insurance, NOT the deliverable.
- **Deliver the full report body as the text of the final response message** — not a summary, not a link. The operator reads it and decides what to push.
- Any commits made during the audit (checkpoint pushes per R6) are signed per R3 with no AI/agent tokens.
- This does NOT relax R11 (independence) or R12 (refusal authority), and does NOT license skipping the in-progress checkpoint.

**Failure mode.** An auditor that pushes its own unreviewed verdict to trunk creates operator-by-proxy and loses everything if the sandbox dies mid-push.

**Evidence:** originally `operator-meta/R88_READ_ONLY_DELIVER_AS_RESPONSE.md`; proposed by the TM-9a Lens A auditor 2026-06-18.

---

### R14 — MERGE GATE: AUDIT CYCLE VERBATIM
*(was `rules/R81_AUDITOR_GATE.md`; verbatim operator quote; tied for highest priority with R1)*

**Headline:** No PR merges EVER without running the full audit cycle to a CLEAN verdict — cycled until clear of any P0–P3 in any regard.

**Operator quote (verbatim, 2026-06-14 8:39 PM PDT — do not paraphrase):**
> **"Rule (proposed R81 — auditor gate): No PR merges EVER without following the audit cycle verbatim - adversarial audits, fixes, readies, cycled until CLEAR OF ANY P0-P3S IN ANY REGARD"**

**Operator quote (verbatim, 2026-06-14 8:40 PM PDT):**
> **"RULE 81 stays above all else with R0"**
> **"MAKE IT ABOVE ALL WITH R0"**

**Why.** CI green is necessary but NOT sufficient: CI is regression coverage; the auditor is adversarial review that catches design defects, RLS leaks, contract drift, missing tests, security flaws, and the long tail of the 50 failures. The operator placed this rule at the top of the stack, tied with R1.

**How to comply (the cycle, in order, no shortcuts):**
1. Pre-merge gates pass — CI green on every check; local doctrine sweep clean (R22); R3 identity on every commit; R18 lane discipline upheld.
2. Dispatch independent adversarial auditor(s) — separate subagent (NEVER the author lane), no time budget, reading the FULL diff line-by-line, exhaustive per R10.
3. Auditor writes the audit report (delivered per R13).
4. If verdict is CLEAN_NO_FINDINGS → merge authorized.
5. If anything else (any non-empty findings, including P3) → DO NOT MERGE. Dispatch a fixer to close EVERY finding P0–P3 inclusive ("CLEAR OF ANY P0-P3S IN ANY REGARD"). Fixer commits per R3, pushes, CI re-greens.
6. Re-audit — fresh adversarial pass on the new head SHA, same exhaustiveness bar.
7. Cycle audit → fix → re-audit until CLEAN_NO_FINDINGS.
8. Only then: `gh pr merge --squash --delete-branch`.

**Severity inclusion.** "P0–P3s IN ANY REGARD" means P3 (style, comments, naming, missing docstrings) MUST be fixed before merge — stricter than the historical "P0–P2 must fix, P3 may defer."

**Scope.** Every PR after 2026-06-14 8:39 PM PDT, regardless of size/urgency/"obviously safe." Includes revert and hotfix PRs (audit the revert itself). Pure documentation-only context-repo commits do not require audit.

**Failure mode.** Merging without completing the cycle is a hard R14 violation: stop all work, run a retroactive adversarial audit on the merged commit, file a fully-audited follow-up PR for any findings, and disclose to the operator with full accounting.

**Evidence:** originally `rules/R81_AUDITOR_GATE.md`.

---

### R15 — AUDIT-CYCLE OPERATING DOCTRINE
*(folds in `operator-meta/R81_OPERATING_DOCTRINE.md` — the second reconciled R81 substance)*

**Headline:** The mechanical operator playbook that composes R1 + R14 into a follow-it-don't-improvise workflow.

**Why.** This doctrine adds nothing new; it composes and clarifies existing rules so no future agent has to reconstruct doctrine from a dying session log. If it contradicts R1/R14, R1/R14 win; if it contradicts another rule, that rule wins.

**How to comply.**
- **Dual-auditor intensification (mandatory):** dispatch TWO independent auditors in parallel — Auditor A (correctness + security), Auditor B (tests + contracts + PR hygiene). Both audit against (a) code correctness vs the diff, (b) the plan/brief that authorized the PR, (c) the hyperscaler standard (R1 banned patterns + R79 50-failures + R10 exhaustiveness). Both must return CLEAN_NO_FINDINGS independently. The fixer loop runs until BOTH are CLEAN in the same round — no "good enough," no "P3s can ship."
- **No PR merges to production `main` without operator approval** — only to integration branches (per R9).
- **Hyperscaler reference mandate:** when making a non-trivial architectural choice (policy shape, GUC namespace, event contract, role model, caching layer, rate-limit boundary), cite at least one hyperscaler reference (AWS/GCP IAM, LaunchDarkly/Statsig, Stripe/Adyen, Cloudflare, Datadog/OpenTelemetry, Kafka/EventBridge, Redis, etc.). "I designed it this way" is not acceptable.
- **Plan-doc precedence:** a newer addendum/rescope/architect-resolution doc supersedes the underlying plan on the specific point it addresses; the underlying plan stays canonical elsewhere. R-rules always supersede plan docs; R-rules never supersede each other unless the operator says so.
- **Path convention:** every brief, audit, fixer report, and scope-resolution doc lives in the context repo, committed within 2 minutes of creation (R4 cadence). Workspace-only artifacts that another agent might need are forbidden.
- **Standing answers (don't re-ask):** quality bar is decacorn (R1) always; hyperscaler pattern vs LOC cap → split into chained PRs; fixers/builders use Opus-class models, never Sonnet; auditors are dual + parallel; no co-author trailers; `gh` CLI only (never browser tasks on GitHub); commit identity always R3; push cadence within 2 min (R4); subagents need monitoring (R7).
- **Scope-mismatch protocol:** when a brief doesn't match repo reality, HALT, write a scope-mismatch doc with brief-vs-reality evidence + candidate resolutions, exit cleanly; the parent spawns an architect; the resolution goes to the operator if non-trivial; only then does a new builder spawn.

**Failure mode.** Improvising the cycle instead of following it mechanically reintroduces the exact gaps (skipped audits, lost docs, scope creep) the doctrine was written to close.

**Evidence:** originally `operator-meta/R81_OPERATING_DOCTRINE.md`.

---

### R16 — AUDITOR VERDICT LINE (STUCK CLASSIFIER)
*(from R100.A5)*

**Headline:** Every audit response MUST end with exactly one verdict line: `VERDICT: CLEAN` | `VERDICT: FINDINGS` | `VERDICT: REFUSAL` | `VERDICT: INFRA_DEATH`.

**Why.** This closes the silent-loop hole that almost cost Wave 4. A missing verdict line is the signal the overnight cron stuck-classifier uses to detect a hung or lost audit and notify the operator.

**How to comply.**
- End the audit with exactly one of: `VERDICT: CLEAN`; `VERDICT: FINDINGS` (followed by P-rated, file:line, evidence); `VERDICT: REFUSAL` (per R11/R12 with reason); `VERDICT: INFRA_DEATH` (sandbox died, retry once).
- No other final line is allowed. Anything else = STUCK → operator notification.

**Failure mode.** An audit that ends without a verdict line hangs the cycle silently; the operator never learns the lane stalled.

**Evidence:** `operator-meta/R100_HYPERSCALER_QUALITY_MANDATE.md` §R100.A5.

---

## §4 — PLAN / SCOPE / FACTUAL DISCIPLINE

### R17 — PLAN DOCS MUST BE EMPIRICALLY VERIFIED BEFORE LANE DISPATCH
*(was R76)*

**Headline:** Before dispatching a lane that depends on a plan doc, verify the plan's claims empirically against the real library/target — never against memory, intuition, or marketing copy.

**Why.** `BUMP_PLAN_ZOD_4.md` claimed `z.string().uuid()` was backward-compatible in zod 4; it was a hard breaking change (RFC-9562-strict variant nibble) that broke 108 tests / 18 suites. No dry-run had been performed. The lane stalled on a scope decision the plan should have surfaced upfront.

**How to comply.**
- For any dependency-bump/migration plan: pin the exact target version; read the official migration guide end-to-end; run a dry-run install in a scratch clone (`npm install <pkg>@<exact> --no-save`, then `npx tsc --noEmit` and `npm test`) and record the actual error/test counts in the plan; list EVERY breaking change the dry-run surfaced (not just expected ones); classify each as in-scope / mechanical-OOS / fan-out-OOS.
- The plan doc MUST contain the dry-run counts as evidence. Plans that say "should be backward-compat" without dry-run evidence are non-canon — lanes MUST NOT dispatch from them.

**Failure mode.** A lane dispatched on an unverified plan hits surprise breakage mid-flight, stalls, and burns an operator-paid cycle.

**Evidence:** originally `rules/R76_PLAN_DOC_EMPIRICAL_VERIFICATION.md`.

---

### R18 — LANE SCOPE DISCIPLINE
*(was R77)*

**Headline:** A lane subagent operates only inside its OWNS scope — "it would be nice to fix this while I'm here" is not authorization.

**Why.** L5 (#242) went beyond its OWNS to do async-render rewrites that were L3's lane, regressing two timing-sensitive test files that had been green on `main`. Recovery cost ~15 minutes plus a correction conversation. Over-extension causes self-inflicted regressions.

**How to comply.**
- Inside OWNS: anything goes. Outside OWNS, only three allowed patterns: (1) mechanical adaptation (touch ONLY the line consuming a renamed symbol); (2) repair when an origin/main intersection breaks YOUR tests (touch ONLY files your branch added/substantially modified — a pre-existing break on main is not your lane); (3) explicit operator-authorized scope expansion in plain text.
- Anything else: write a one-line note in your blocker doc and stop.
- Self-check before push: if `git diff origin/main..HEAD --stat` touches a wider file set than your OWNS list, challenge it.
- Briefs must carry the R18 clause verbatim; the banned encouragement "fix anything that's obviously wrong while you're in there" is removed.

**Failure mode.** A lane silently widens scope, regresses green tests, and turns a clean merge into a red-by-self-inflicted CI.

**Evidence:** originally `rules/R77_LANE_SCOPE_DISCIPLINE.md`.

---

### R19 — VERIFY "PRE-EXISTING FAILURE" CLAIMS
*(was R80)*

**Headline:** Main being red is everyone's emergency until it's green — never ship a lane that papers over a base-commit failure with "not mine."

**Why.** L8 reported `firstPaymentGate.test.ts` failures as "pre-existing, not my responsibility." Wrong twice: the failure was introduced by L7 #242 (just merged into that base), so the first PR landing on top owns clearing it; and the fix was a one-line import change. "See a failure, see a test not in my diff, conclude 'not mine'" violates the hyperscaler bar.

**How to comply.**
- First assume the failure is the lane's fault. If the failing test isn't in the lane's diff, run the SAME test on the lane's base commit in a clean worktree to verify the pre-existing claim.
- If pre-existing is confirmed: fix it in this lane anyway when the fix is small (<~20 LOC) — main is red, clear it. If non-trivial, file a `MAIN_REGRESSION_<date>.md` handoff and document the pre-existing scope in the PR body for an operator decision.
- Never label everything a "flake" without empirical evidence. Reports must distinguish (a) lane-introduced, (b) base-commit regression, (c) flake.
- The fix commit is authored per R3 even when it's "not your code."

**Failure mode.** A lane ships on top of a red main with a "not mine" excuse; the regression compounds across every subsequent lane.

**Evidence:** originally `rules/R80_VERIFY_PREEXISTING_FAILURE_CLAIMS.md`.

---

### R20 — TRACKING-ISSUE DISCIPLINE
*(was R82)*

**Headline:** Any out-of-lane, deferred, or follow-up work gets a GitHub tracking issue before the turn ends — never a code comment, never a chat-only mention, never a workspace-only note.

**Why.** Tracking issues are the seam between in-lane fixer work and follow-up product work. Without them, descoped items vanish into chat history, audit files become tombstones, and the next operator has no inventory of "what still needs to be built before flag-flip."

**How to comply.**
- Every tracking issue includes six sections in order: Why this matters; What's required (by surface); Already resolved; References (audit path, originating PR, operator decision id); Owner (default `Bradley Gleave`); Labels (in metadata: `tracking` + topical).
- Fires when: a fixer descopes a finding as out-of-lane; an auditor surfaces a correct-as-shipped P3 to track; an operator decision creates dependent work elsewhere; a re-audit uncovers a pre-dating defect; any "should be tracked / follow-up / next operator / post-flag-flip / TODO" appears in audit text.
- Banned: `// TODO`/`// FIXME` without an issue link; "handle in a follow-up" without an issue number; chat-only mentions; workspace-only notes; issues missing any of the six sections; issues without an owner; thin (<~400-word) issues on substantive work.
- Enforcement: operator greps own work at end-of-turn; re-auditor flags any descoped finding lacking a tracking issue as a NEW P2; handoffs cross-reference every open tracking issue.

**Failure mode.** A descoped item with no issue is lost; the next operator ships without it or rediscovers it the hard way.

**Evidence:** originally `rules/R82_TRACKING_ISSUE_DISCIPLINE.md`.

---

## §5 — TELEMETRY & PIN HYGIENE

### R21 — PINNED TELEMETRY TABLE MUST UPDATE IN THE SAME SLICE PR
*(was R78)*

**Headline:** When a slice adds/removes/renames a pinned telemetry event, the exhaustive pinned event-name test ships in the same PR.

**Why.** The pinned event-name test (`toEqual({...})` + `toHaveLength(N)`) is the firewall that catches silent renames, brief-vs-runtime drift, and review-bypassing additions. The L7 v3-2 classroom slice added 3 events without bumping the pin from 6→9 and tripped build-and-test on PR #396.

**How to comply.**
- Add the events to the constants file AND update the pin test: add each event to the `toEqual` shape (preserving documented ordering), bump `toHaveLength(N)`, refresh the header doc comment to reflect the new baseline + the slice that added events.
- Run the focused pin test locally (`--testPathPattern=posthog-event-names`) and confirm green BEFORE opening the PR.
- Same convention for any exhaustive-pin test: broadcast-event pins, channel-name pins, RLS-policy pins, feature-flag pins. When in doubt, grep `toHaveLength` on a constant import in `test/` before touching the constant.

**Failure mode.** New events without a pin update break analytics funnels silently downstream and red-light CI on the slice.

**Evidence:** originally `rules/R78_PINNED_TELEMETRY_TABLE_UPDATE.md`.

---

### R22 — RUN ALL REPO PIN / DOCTRINE TESTS BEFORE OPENING A PR
*(was R79)*

**Headline:** Before opening any PR, run the repo's exhaustive-pin/doctrine test sweep — slice-targeted `testPathPattern` runs do NOT cover repo-global doctrine pins.

**Why.** Doctrine pins scan the whole repo (e.g. banning `fontWeight: '700'/'800'` and "Coming Soon" copy in shipped screens). A slice-only test pattern skips them, but they run in CI and trip. The L7 v3-2 mobile slice tripped `quietLuxuryDoctrine.test.ts` on a lesson title.

**How to comply.**
- Run the doctrine-pin sweep first (mobile: `--testPathPattern='(quietLuxuryDoctrine|FlagOff|doctrine|pin)'`; backend: `--testPathPattern='(posthog-event-names|broadcast-event-names|rls.*pin|doctrine)'`), then slice-targeted tests, then a full-suite run when memory/time allow.
- If a doctrine pin trips, fix YOUR code, never the pin — the pin is the source of truth.
- Every builder brief carries the R22 sweep in its gates checklist.

**Failure mode.** A slice passes its own tests, skips the doctrine sweep, and reds CI on a repo-global invariant after the PR is already open.

**Evidence:** originally `rules/R79_PIN_SWEEP_BEFORE_PR.md`.

---

## §6 — LOC & STRUCTURE

### R23 — LOC SOFT CAP (P1 + EXCEPTION REVIEW)
*(was R86; supersedes the prior ≤400 hard-cap language)*

**Headline:** Any PR over 400 prod LOC (excluding tests) is an automatic P1 finding — reduce, or write a no-waste exception justification for operator sign-off.

**Why.** A hard 400 cap forced three arbitrary splits in one wave and risked chopping work that genuinely cannot be smaller. The cap exists to prevent **waste**, not to halve honest work. Apple/Google/Notion enforce "no waste," not a hard line count.

**How to comply.**
- Builders/fixers over 400 prod LOC: (1) self-assess for bloat — re-read every changed file asking "would Apple/Google/Notion accept this LOC for this scope?"; strip duplication/over-abstraction/premature scaffolding/dead code; (2) if still over, add an `R86 EXCEPTION REQUESTED` block to the PR body with item-by-item no-waste justification + split-feasibility evaluation; (3) tag `r86-exception-requested`.
- Auditors over 400 prod LOC: add the `P1-LOC` finding FIRST, with per-file breakdown, a `BLOAT | STRUCTURALLY NECESSARY | MIXED` assessment, bloat candidates, and the structural justification.
- Operator: approve (label `r86-exception-approved`) if auditor + justification agree it's structural; bounce to fixer if bloat; dispatch a third lens if borderline.
- Where this overlaps the R100 LOC rule (§7), the stricter wording governs.

**Failure mode.** Either silent LOC creep (bloat ships) or arbitrary splitting (quality harmed) — the soft-cap-plus-review prevents both.

**Evidence:** originally `operator-meta/R86_LOC_SOFT_CAP.md`.

---

## §7 — HYPERSCALER QUALITY (formerly R100 — 55 rules folded into clean numbering)

These rules fold in the R100 Hyperscaler Quality Mandate: the 50 industry failure modes (R24–R73, in R100's original 1→50 order) plus the 5 local regression rules A1–A5 (R74–R78). Each maps 1:1 to its R100 source number, noted in the headline. They are enforced by three gates on every PR: pre-push self-check (builder/fixer), the `r100-quality-gate` CI workflow, and the dual-auditor R100 checklist (a missing checklist = REFUSAL per R12). No silent exceptions — a legitimate deviation requires a per-rule R100 Exception Request with operator sign-off.

> **Severity legend:** P0 = data loss / financial exposure / security breach; P1 = production failure / data exposure / major perf hit; P2 = technical debt / scalability / maintainability; P3 = code quality / review burden.

### Category — Security (R24–R36; these end the company)

### R24 — Zero secrets in source or git history *(R100.1)*
**Headline:** No API keys, JWT/service-role secrets, or connection strings in source or history. **Why:** secrets in git history are permanent even after deletion. **How to comply:** flag any `(api[_-]?key|secret|token|password|jwt[_-]?secret|service[_-]?role|stripe[_-]?(sk|pk)|supabase[_-]?service)` string outside `.env*`; scan `git log -p` over the diff window, not just the tree; env vars only; `.env*` gitignored; rotate any historical leak. **Failure mode:** a leaked Stripe/Supabase key drains funds or exposes every user row.

### R25 — RLS enabled with explicit policies on every Supabase table *(R100.2)*
**Headline:** Every table has `ENABLE ROW LEVEL SECURITY` + a policy per role for SELECT/INSERT/UPDATE/DELETE. **Why:** ~10% of scanned AI apps had RLS gaps exposing user data to the public internet. **How to comply:** block any new-table migration lacking RLS + policies; deny-by-default; the live-RLS test lane must be green for new tables. **Failure mode:** any client can read/write any row via the SDK.

### R26 — No raw SQL with string concatenation/interpolation *(R100.3)*
**Headline:** Parameterized queries exclusively. **Why:** OWASP #1 in vibe-coded apps; `"... WHERE id = " + userId` reads the whole table. **How to comply:** ban `$queryRawUnsafe`/`$executeRawUnsafe`/template-literal SQL with `${userInput}` at lint level; allowed pattern is `Prisma.sql` tagged templates with parameterized inputs. **Failure mode:** SQL injection.

### R27 — No unsanitized output paths (XSS) *(R100.4)*
**Headline:** Never render user/external content unsanitized. **Why:** ~86% AI-code failure rate on XSS defenses. **How to comply:** ban `dangerouslySetInnerHTML` and raw `innerHTML` writes of non-constant content in frontend; sanitize any rendered string from user/external API (DOMPurify or framework escaping). **Failure mode:** script injection / account takeover.

### R28 — IDOR-proof: every authenticated endpoint joins to the requesting user/tenant *(R100.5)*
**Headline:** Ownership predicate in the data-access layer on every `:id` endpoint. **Why:** changing an ID in a request reads another user's data. **How to comply:** Lens A traces every `:id`-taking endpoint to its ownership check (missing = P0); enforce in the data layer, with RLS as belt-and-suspenders. **Failure mode:** cross-tenant data theft.

### R29 — Rate limiting on auth + paid-external-API endpoints *(R100.6)*
**Headline:** Throttle `/auth/*` and any Stripe/Mux/OpenAI-calling handler. **Why:** unlimited auth = brute force; unlimited paid APIs = $14k+ surprise bills. **How to comply:** `ThrottlerGuard`/`@Throttle()` coverage; ~5 auth attempts/min per IP; per-user budgets on paid APIs (P1 until covered). **Failure mode:** credential stuffing or runaway external spend.

### R30 — JWT hygiene *(R100.7)*
**Headline:** Strong secret, short expiry, refresh rotation, revocation. **Why:** a leaked token with no expiry is permanently valid. **How to comply (any one missing = P0):** 64+ char secret from env; `exp` claim; 15-min access tokens; refresh rotation with a revocation list; invalidation on logout/password-change. **Failure mode:** permanent session hijack.

### R31 — Runtime input validation at every API boundary *(R100.8)*
**Headline:** A runtime schema (Zod/class-validator) on every `@Body()`/`@Query()`/`@Param()`. **Why:** TypeScript types are compile-time only — "phantom validation" leaves runtime inputs unchecked. **How to comply:** every DTO has a runtime validator that is actually invoked (Lens B verifies invocation, not just declaration); derive TS types from the schema; `whitelist: true, forbidNonWhitelisted: true`. **Failure mode:** malformed/malicious data flows straight into business logic and the DB.

### R32 — Role checks at the data-access layer, not just the route guard *(R100.9)*
**Headline:** Repository/service-layer role enforcement parallel to any route guard. **Why:** a manipulated JWT role or bypassed middleware otherwise reaches the data. **How to comply (P0):** repository-layer predicate or server-side RLS, not middleware-only `@Roles()`. **Failure mode:** privilege escalation to admin functionality.

### R33 — Dependency hygiene: `npm audit --audit-level=high` clean + lockfile committed *(R100.10)*
**Headline:** No unreviewed deps; audit clean; lockfile committed. **Why:** AI auto-install has a zero-second verification window during active supply-chain attacks (84 TanStack + 416+ NPM packages compromised, May 2026). **How to comply:** no agent-added dependency without operator review; no `0.x` pins on external packages; CI fails red on any HIGH/CRITICAL; SCA scan (Socket/Snyk). **Failure mode:** supply-chain compromise ships to prod.

### R34 — CORS allowlist, never wildcard with credentials *(R100.11)*
**Headline:** Explicit origin allowlist on any auth-bearing endpoint. **Why:** `origin:'*'` + `credentials:true` lets any site make authenticated requests. **How to comply (P1):** explicit allowlist; credentials never with wildcard. **Failure mode:** cross-origin credential theft.

### R35 — Production errors expose nothing internal *(R100.12)*
**Headline:** Generic client messages; full detail server-side only. **Why:** stack traces, query text, file paths, and env names leak to clients. **How to comply:** the global exception filter must strip internals in `NODE_ENV=production` (auditor verifies behavior); structured server log with full detail. **Failure mode:** internal architecture handed to attackers.

### R36 — HTTPS enforced, HSTS set *(R100.13)*
**Headline:** Redirect HTTP→HTTPS; set `Strict-Transport-Security`. **Why:** plaintext auth tokens are interceptable. **How to comply:** force HTTPS at infra; long-max-age HSTS; auditor flags missing HSTS as P1 if the endpoint accepts tokens. **Failure mode:** session tokens sniffed in transit.

### Category — Architecture (R37–R43)

### R37 — Layer discipline: business logic in services, never in handlers/components *(R100.14)*
**Headline:** Controllers orchestrate; services implement. **Why:** intermixed layers make one change break unrelated features. **How to comply (P2):** no Prisma calls in controllers; controllers <30 lines/route; no business `if`-branches in routes. **Failure mode:** unmaintainable monolith.

### R38 — Reusable over hyper-specific: extract on 3rd repetition *(R100.15)*
**Headline:** Same pattern in 3+ places → extract. **Why:** 80–90% of AI code is hyper-specific single-use with duplicated bugs. **How to comply:** Lens B counts duplication (`jscpd`/grep); over threshold = P2 + extraction. **Failure mode:** the same bug, copied everywhere.

### R39 — No feature PR leaves a known TODO/FIXME in modified files *(R100.16)*
**Headline:** Fix it or file+link a follow-up issue (per R20). **Why:** AI never refactors; debt accretes forever. **How to comply (P2):** no new TODO/FIXME in a feature PR; no deprecated API alongside its replacement for the same op. **Failure mode:** permanent accumulating debt.

### R40 — Test reality: real assertions, no "exists" theater *(R100.17)*
**Headline:** Tests assert specific values; payment/auth/mutation paths have value-asserting integration tests. **Why:** coverage looks healthy while tests verify nothing. **How to comply (P0 for payment+auth):** flag files where >30% of `expect` are `.toBeDefined()/.toBeTruthy()/.not.toThrow()` without value assertions. **Failure mode:** green tests over broken critical paths.

### R41 — Environment parity: exhaustive `.env.example`, no hardcoded localhost *(R100.18)*
**Headline:** `.env.example` covers every `process.env.*`; no `localhost`/`127.0.0.1` in `src/`. **Why:** "worked on my machine" prod failures. **How to comply (P1):** keep `.env.example` fresh; abstract environment-specific values. **Failure mode:** code passes locally, fails in prod.

### R42 — API versioning from day one *(R100.19)*
**Headline:** Public routes carry a `/v1/` prefix; breaking changes get a migration window. **Why:** unversioned breaking changes break every client at once. **How to comply (P1):** version the route or document the deprecation window. **Failure mode:** simultaneous client breakage.

### R43 — No circular imports *(R100.20)*
**Headline:** Zero cycles (`madge --circular src/`). **Why:** cycles cause init failures, leaks, unpredictable startup. **How to comply:** CI runs madge; any cycle = red. **Failure mode:** subtle startup/runtime breakage.

### Category — Performance (R44–R50)

### R44 — No N+1: queries inside loops are banned *(R100.21)*
**Headline:** No DB call inside `forEach`/`for…of`/`map`/`.then()` over an array. **Why:** the most common ORM perf anti-pattern; query count grows linearly with data. **How to comply:** P0 on hot paths, P1 elsewhere; use `include`/`select`, `where:{id:{in:[...]}}`, DataLoader. **Failure mode:** 1,001 queries per page load at scale.

### R45 — Index every FK and hot WHERE/ORDER BY column *(R100.22)*
**Headline:** Indexes on FKs + commonly-queried columns on high-volume tables. **Why:** missing indexes = full table scans, catastrophic at 100k rows. **How to comply (P1):** add `@@index` in the same migration; verify with `EXPLAIN ANALYZE`. **Failure mode:** every query degrades as data grows.

### R46 — Pagination on every list endpoint, server-enforced max page size *(R100.23)*
**Headline:** `limit`/`offset` or cursor + a server-side ceiling (default 100). **Why:** unpaginated lists try to load millions of rows. **How to comply (P1):** pagination on every list endpoint. **Failure mode:** a single call attempts to load the whole table.

### R47 — Never block the event loop *(R100.24)*
**Headline:** No sync I/O or CPU-heavy work in the request path. **Why:** one blocking request blocks all requests. **How to comply (P1):** no `fs.*Sync` in handlers; `Promise.all()` for parallel async; worker threads for CPU work; no sequential `await` in `forEach`. **Failure mode:** server-wide stall.

### R48 — Cache stable data with explicit TTL *(R100.25)*
**Headline:** Cache rarely-changing data (gym config, templates, role lookups). **Why:** every request needlessly hits the DB. **How to comply (P2 w/ TTL recommendation):** Redis/in-mem cache or HTTP `Cache-Control` on hot, stable endpoints. **Failure mode:** DB hammered by identical queries.

### R49 — Media: compress/resize on upload; serve via CDN; WebP+fallback *(R100.26)*
**Headline:** No original-size, uncompressed media stored or served from the app server. **Why:** a 12MB photo bloats storage and every load. **How to comply (P1 for new upload paths):** `sharp` resize/compress; object storage + CDN; WebP with fallback. **Failure mode:** storage bloat + slow loads.

### R50 — No polling for real-time *(R100.27)*
**Headline:** Use WebSockets / Supabase Realtime / SSE, not `setInterval` polling. **Why:** sub-60s polling creates constant unnecessary load. **How to comply (P2):** flag `setInterval` hitting an API <60s or identical queries within 1s. **Failure mode:** wasted load + laggy "real-time."

### Category — Concurrency & State (R51–R55)

### R51 — Read-modify-write paths require optimistic locking or transactions *(R100.28)*
**Headline:** Version field + WHERE-version check, or wrap in `$transaction`. **Why:** concurrent RMW silently corrupts state with no error thrown. **How to comply:** P0 on financial paths, P1 otherwise, for counters/balances/status transitions/aggregates. **Failure mode:** silent data corruption under real concurrency.

### R52 — Idempotency keys on every payment + side-effecting external call *(R100.29)*
**Headline:** Every Stripe charge/subscription/payout passes an `idempotencyKey`. **Why:** retried requests double-charge with no visible error. **How to comply (P0):** generate/store keys client-side; pass to Stripe; check stored payment-intent IDs before creating new ones; idempotent webhook handlers. **Failure mode:** duplicate charges, lost money.

### R53 — Every optimistic UI update has a rollback path *(R100.30)*
**Headline:** State mutation before `await` must restore prior state on failure. **Why:** failed requests leave wrong UI until full reload. **How to comply (P1):** TanStack Query `onMutate`/`onError`/`onSettled`; rollback in the error handler. **Failure mode:** UI shows data the server rejected.

### R54 — React hooks: correct dependency arrays *(R100.31)*
**Headline:** No stale-closure deps. **Why:** empty/incorrect deps capture stale values; behavior depends on render timing. **How to comply:** `eslint-plugin-react-hooks` set to `error` (not `warn`); `useRef` for always-current values. **Failure mode:** timers/intervals act on outdated state.

### R55 — Cleanup on unmount: AbortController + unsubscribe *(R100.32)*
**Headline:** Every async/subscription `useEffect` returns a cleanup. **Why:** leaks + "state update on unmounted component" errors. **How to comply (P1):** AbortController for fetches; `.unsubscribe()` for Supabase; remove event listeners. **Failure mode:** memory leaks and RN warnings.

### Category — Error Handling & Observability (R56–R60)

### R56 — Error boundaries around every major UI section / global filter on services *(R100.33)*
**Headline:** ErrorBoundary parents on route trees; global exception filter on backend. **Why:** 82% of scanned projects had none — one uncaught error = blank white screen. **How to comply (P1):** wrap major sections with graceful fallback UI; verify the backend filter stays. **Failure mode:** whole-app crash with no recovery.

### R57 — Structured logging, not `console.log` *(R100.34)*
**Headline:** Structured logger (Pino) with user/request context; payment/auth/API-error events logged. **Why:** 76% of projects had only `console.log`, invisible in prod. **How to comply:** ban `console.log`/`console.error` in `src/` at lint level (except marked CLI/tests). **Failure mode:** production failures with no record of what happened.

### R58 — Timeouts on every external call *(R100.35)*
**Headline:** Explicit timeout on every axios/fetch/Stripe/Mux call. **Why:** 100% of scanned external calls lacked timeouts; a hung service freezes the request ~2 min. **How to comply (P0):** 10s default; document any exception; fail fast with an actionable error. **Failure mode:** resource exhaustion from frozen connections.

### R59 — No swallowed errors *(R100.36)*
**Headline:** No `catch(e){}`, `catch(e){console.log(e)}`, `.catch(()=>undefined/null/{})`. **Why:** silent failure — the user thinks it worked; the check-in/payment never fired. **How to comply (P0):** log with structured context AND surface to the user or retry with backoff; rethrow so the failure propagates. **Failure mode:** invisible data loss.

### R60 — `/health` endpoint checking DB + critical dependencies *(R100.37)*
**Headline:** `/health` probes DB and external deps, returns a 200 JSON status. **Why:** load balancers/orchestrators can't tell if the service is degraded. **How to comply (P1):** real connectivity probe, not a static 200. **Failure mode:** silent degradation undetected by infra.

### Category — Code Quality (R61–R66)

### R61 — Comments explain WHY, not WHAT *(R100.38)*
**Headline:** Delete line-narrating comments; keep business-context/why comments. **Why:** the most universal AI anti-pattern (90–100%); stale WHAT-comments mislead. **How to comply (P3):** flag comment:code >1:3 and paraphrase comments. **Failure mode:** cognitive load + incorrect stale comments.

### R62 — YAGNI: no patterns without a present problem *(R100.39)*
**Headline:** No factories/interfaces/repositories around trivial operations. **Why:** textbook patterns over simple needs add ceremony with no benefit. **How to comply (P3):** flag interface/impl pairs with one impl, abstract factories for one type, repository around 3 calls. **Failure mode:** over-abstracted, hard-to-read code.

### R63 — Same-bug-everywhere: extract on first repetition under audit *(R100.40)*
**Headline:** Identical logic in 2+ files in the same PR → fix all or extract. **Why:** a one-copy bug fix leaves the others broken. **How to comply (P2):** flag duplicate logic in the diff and inconsistent shared behavior. **Failure mode:** inconsistent behavior across features that should match.

### R64 — Don't reimplement libraries *(R100.41)*
**Headline:** Use `date-fns`/`dayjs`, library JWT decode, `lodash`/`radash` debounce, Zod validation. **Why:** hand-rolled utilities introduce new bugs + maintenance burden. **How to comply:** P2 if substantial, P3 if trivial. **Failure mode:** reinvented, buggier wheels.

### R65 — No defenses for impossible edge cases *(R100.42)*
**Headline:** Delete concurrency control on single-user paths, retries on sync code, overflow guards on domain-bounded counters. **Why:** over-engineering for cases the architecture makes impossible. **How to comply (P3):** delete; add back when the real edge case is observed. **Failure mode:** dead complexity obscuring real logic.

### R66 — Zero dead code *(R100.43)*
**Headline:** No unused imports/exports, no-caller files, always-false flags, commented-out blocks. **Why:** abandoned attempts accumulate and confuse. **How to comply:** ESLint `no-unused-vars`+`no-unreachable`=error; weekly `ts-prune`; delete, don't comment out. **Failure mode:** codebase rot.

### Category — Data Integrity (R67–R70)

### R67 — Multi-table writes in transactions *(R100.44)*
**Headline:** Any 2+-table write wraps in `$transaction`. **Why:** a mid-sequence failure leaves the DB partially updated. **How to comply:** P0 on financial/auth flows, P1 elsewhere. **Failure mode:** inconsistent partial state.

### R68 — Soft deletes on business-critical entities *(R100.45)*
**Headline:** `deletedAt` + filtered queries on User/Client/Coach/Workout/Payment/Plan/Application tables. **Why:** a hard delete destroys all associated history with no recovery. **How to comply (P1):** soft-delete column + recovery UI. **Failure mode:** accidental permanent data loss.

### R69 — DB-layer constraints mirror app validation *(R100.46)*
**Headline:** CHECK/NOT NULL/FK/UNIQUE mirror app rules. **Why:** a bug bypassing app validation writes invalid data (negative prices, orphan FKs). **How to comply (P2, same migration):** add constraints. **Failure mode:** corrupt data when app validation is bypassed.

### R70 — Point-in-time recovery enabled + restore tested monthly *(R100.47)*
**Headline:** Supabase PITR on; documented runbook; monthly restore test. **Why:** corruption/deletion otherwise = permanent loss. **How to comply:** operator-level concern flagged by audit (not blocking on a code PR); restore-test record in `operator-meta/runbooks/`. **Failure mode:** unrecoverable data loss event.

### Category — Infrastructure (R71–R73)

### R71 — CI/CD enforced: lint → typecheck → test → build → deploy *(R100.48)*
**Headline:** Branch protection requires all checks green; no bypassed/failed-but-merged commits. **Why:** 66% of projects had no pipeline; broken code ships undetected. **How to comply:** auditor verifies branch-protection state during the R100 audit; staging before prod. **Failure mode:** untested code reaches production.

### R72 — Dev-only code excluded from the production bundle *(R100.49)*
**Headline:** Build-time exclusion of mocks/fixtures/demo/screenshot modes, not runtime flags. **Why:** dev utilities bloat bundles and leak internals. **How to comply (P2):** bundler/EAS profile excludes non-prod modules at build time. **Failure mode:** dev code (and its info leak) ships to users.

### R73 — Graceful degradation: non-critical services can fail *(R100.50)*
**Headline:** A PostHog/Sentry/Mux outage must not crash the app. **Why:** assuming external services are always up makes any outage total. **How to comply (P1):** wrap non-critical calls in try/catch with silent failure; feature-flag integrations; payment-only impairment, not full crash, when Stripe is down. **Failure mode:** one vendor outage takes the whole product down.

### Local regression rules (R74–R78 — closing the regressions we measured)

### R74 — Test:src line ratio ≥ 2.0 per PR *(R100.A1)*
**Headline:** `(test lines added)/(src lines added)` ≥ 2.0 over the PR diff. **Why:** the ratio collapsed 4.13 → 1.11; this restores the floor. **How to comply:** computed over `.ts/.tsx/.js/.jsx` in `src/` vs `test/`+`__tests__/`+`*.spec.*`+`*.test.*`; <2.0 = P1 requiring an exception justification; the `r100-test-density` CI job fails below floor without the exception label. **Failure mode:** test-density collapse hides untested code behind a green build.

### R75 — Banned-cast substitution gate: net additions = 0 *(R100.A2)*
**Headline:** Zero net new banned-cast tokens in the diff. **Why:** closes the `as never` / `as unknown as` loophole (`as never` +119%, `as unknown as` +68%). **How to comply (P0):** banned in `src/`+`test/` — `@ts-ignore`, `as any`, `as unknown as`, `as never`, `.catch(()=>undefined)`, `.catch(()=>null)`, `.catch(()=>{})`, `Coming soon`; allowed — `@ts-expect-error <reason>` (single line, non-empty reason) and narrow concrete casts (`as User`, `as string`) where the type is provably the target; the `r100-banned-tokens` CI job greps the diff; any positive net = red and Lens A P0. **Failure mode:** type-safety erosion via cast substitution.

### R76 — LOC soft cap ≤ 400 prod LOC per PR *(R100.A3; reaffirms R23)*
**Headline:** ≤400 prod LOC excluding tests/lockfiles/generated/docs. **Why:** closes the 60%→72% over-cap regression. **How to comply:** over-cap = automatic P1 + R100/R86 Exception Request with item-by-item no-waste justification + operator sign-off; existing R86 LOC gate enforces in CI. **Failure mode:** unreviewed LOC creep. *(Where R23 and R76 overlap, the stricter wording governs.)*

### R77 — CI pass-rate floor ≥ 75% *(R100.A4)*
**Headline:** Running 14-day `pull_request` pass rate ≥ 75%. **Why:** closes the 67%→59% regression; flaky CI is a quality signal (non-deterministic tests or unstable infra). **How to comply:** below floor for 7 consecutive days = automatic process-finding logged + dispatch pause until root cause (infra vs code) is identified. **Failure mode:** flaky CI normalizes red and hides real failures.

### R78 — Auditor verdict line present *(R100.A5; see also R16)*
**Headline:** Every audit ends with exactly one `VERDICT:` line. **Why:** closes the silent-loop hole that almost cost Wave 4. **How to comply:** end with exactly `VERDICT: CLEAN` | `VERDICT: FINDINGS` | `VERDICT: REFUSAL` | `VERDICT: INFRA_DEATH`; anything else = STUCK → operator notification via the overnight cron stuck-classifier. **Failure mode:** a verdict-less audit hangs the cycle invisibly. *(R16 states the operational stuck-classifier; R78 is the R100-pack enforcement of the same line.)*

---

## §8 — 50 FAILURES SWEEP DOCTRINE

### R79 — THE 50-FAILURES SWEEP IS LAW ON EVERY AUDIT
*(was R65)*

**Headline:** Every auditor and fixer treats the "50 Failures of AI-Generated Code at Enterprise Scale" reference as a binding checklist against the PR diff.

**Operator quote (2026-06-01):**
> **R65 is LAW (Bradley directive).**

**Why.** The 50-failures catalogue (the source for the §7 R100 rules) encodes the highest-frequency, research-verified failure modes in AI-generated code. The most consequential pattern in early TGP audits was **Failure #36 — Silent Failures / Swallowed Errors** (`.catch(()=>undefined)`, `catch(e){}`, `catch(e){console.log(e)}`) — a P1 violation regardless of whether the swallowed call is a "best-effort" secondary write.

**How to comply.**
- Auditors scan every PR diff for all 50 failure categories (now codified as §7 R24–R73), file findings at P0/P1/P2/P3 per the severity tier, and sweep in severity-pass order (Pass 1 security → Pass 2 data integrity → Pass 3 concurrency → Pass 4 error handling → Pass 5 performance → Pass 6 architecture → Pass 7 code quality → Pass 8 infrastructure).
- Fixers sweep the diff for the same categories before pushing.
- For swallowed errors specifically: log with structured context (no PII) in the inner catch, and ALWAYS rethrow the outer error so the failure propagates / triggers redelivery.
- Permanent and applies to every wave, forever — it is the depth complement to R10 (exhaustiveness) and R14 (the gate).

**Failure mode.** Skipping the sweep lets a known, catalogued failure mode ship — the exact class of defect a decacorn has gated for years.

**Evidence:** originally `rules/R65_50_FAILURES_SWEEP.md`; source catalogue `quality-references/50_FAILURES_OF_AI_GENERATED_CODE.md`.

---

## §9 — NEW HYPERSCALER QUALITY (20 NEW RULES)

These 20 rules are table-stakes at Stripe, Datadog, Linear, Vercel, and Cloudflare and were not previously codified. They are codified 2026-06-18 as part of this consolidation. Each is enforced under the same three-gate model as §7 (pre-push self-check, CI gate, dual-auditor checklist) and carries the same severity legend. They extend — never relax — §7.

### R80 — API contract is the source of truth; types are generated, not hand-written
**Headline:** Every public/service API is defined by an OpenAPI / JSON Schema contract, and client/server types are generated from it. **Why:** hand-written types drift from the wire format, producing silent contract violations; Stripe and Linear treat the schema as canonical and generate SDKs from it. **How to comply (P1):** check in the schema; generate types in CI (fail if generated output is stale vs committed); no hand-edited generated files; the schema is reviewed like code. **Failure mode:** server and client disagree on the contract and break in production with no compile-time signal.

### R81 — Semantic versioning enforced on every package and public contract
**Headline:** Every package/public contract follows SemVer; the version bump matches the change class. **Why:** consumers rely on SemVer to upgrade safely; a breaking change shipped as a patch breaks every downstream consumer silently. **How to comply (P1):** CI diffs the public surface and fails if a breaking change lacks a major bump; changelog entry per release; pre-1.0 packages document their instability explicitly. **Failure mode:** a "patch" upgrade silently breaks consumers (exactly the zod-4 `.uuid()` class of incident — see R17).

### R82 — Migration safety: every DB migration is reversible AND backwards-compatible (expand-contract)
**Headline:** Migrations deploy in expand-then-contract phases and have a tested down-path. **Why:** a migration that isn't compatible with the previously-deployed code breaks during the rollout window; an irreversible migration has no escape hatch. **How to comply (P0 on shared tables):** add columns/tables nullable-or-defaulted first (expand), deploy code that reads both shapes, then remove the old shape in a later migration (contract); every migration has a `down`; never rename/drop in a single deploy. **Failure mode:** a deploy-time schema change crashes the still-running old code and cannot be rolled back.

### R83 — Feature-flag discipline: every risky path behind a flag with kill-switch + cleanup deadline
**Headline:** New risky code paths ship behind a flag that has an owner, a kill-switch, and a removal deadline. **Why:** flags de-risk rollout (LaunchDarkly/Statsig model), but un-owned permanent flags become dead branches (see R66). **How to comply (P1):** every new flag registered with owner + default + expiry date; a documented kill-switch; a tracking issue (R20) to remove the flag after rollout; no nested flags without justification. **Failure mode:** a stuck flag becomes permanent dead code or an un-killable bad rollout.

### R84 — Structured event taxonomy: every telemetry event has a registered name + schema
**Headline:** No ad-hoc property bags — every event name and its property schema is registered in a central taxonomy. **Why:** Datadog/analytics pipelines break when event shapes drift; the existing pinned event-name test (R21) is the local enforcement of this principle. **How to comply (P1):** every new event added to the registered taxonomy + the exhaustive pin test (R21); typed property schema; no inline string event names scattered in code. **Failure mode:** analytics funnels silently break and event data becomes un-queryable.

### R85 — Telemetry coverage floor: every new endpoint emits request count, latency histogram, error class
**Headline:** Instrumentation is not optional — every new endpoint emits the three core signals. **Why:** "you cannot improve what you do not instrument"; Datadog/Honeycomb treat RED metrics (Rate, Errors, Duration) as a hard floor. **How to comply (P1):** request-count counter, latency histogram, and error-class metric on every new user-facing endpoint; auditor verifies emission, not just declaration. **Failure mode:** a regression in a new endpoint is invisible until users complain.

### R86 — SLO defined for every user-facing path before merge
**Headline:** Every user-facing path declares a p99 latency budget and an error budget before it merges. **Why:** an SLO is the contract for "good enough"; without it, performance regressions have no objective gate. **How to comply (P1):** SLO documented in the PR (p99 target + error budget) for any new user-facing path; tied to the R85 telemetry so the SLO is measurable. **Failure mode:** silent latency/error creep with no threshold that triggers action.

### R87 — Accessibility: WCAG 2.2 AA on every user-facing surface
**Headline:** Keyboard nav, ARIA roles, focus management, and AA contrast on every shipped surface. **Why:** accessibility is a decacorn baseline (R1's Google/Apple frame) and a legal floor. **How to comply (P1 on user-facing PRs):** keyboard-operable controls; correct ARIA roles/labels; visible focus + managed focus order; AA color contrast; screen-reader labels on interactive elements. **Failure mode:** unusable surfaces for keyboard/AT users and compliance exposure.

### R88 — i18n: no hardcoded user-facing strings
**Headline:** Every user-facing string goes through the message catalog. **Why:** decacorns are i18n-ready from day one even when only English ships; hardcoded strings make localization a rewrite. **How to comply (P2):** no literal user-facing strings in components/handlers; all via the catalog with stable keys; flag any new hardcoded display string in the diff. **Failure mode:** localization requires touching every screen later.

### R89 — Performance budgets: bundle-size delta and LCP/TTI enforced
**Headline:** Each PR adds <+5KB gzip (or an explicit waiver) and meets LCP/TTI budgets. **Why:** Vercel-grade frontends enforce bundle budgets in CI because creep is invisible per-PR but fatal cumulatively. **How to comply (P1):** CI measures the gzip bundle-size delta and fails over +5KB without a waiver label; LCP/TTI budgets checked on key routes. **Failure mode:** the bundle bloats one PR at a time until the app is slow to load.

### R90 — Idempotency: every mutation endpoint accepts an idempotency key
**Headline:** All mutations (not just payments) accept and honor an idempotency key. **Why:** Stripe's model — extends R52 beyond payments so any retried mutation is safe. **How to comply (P0 on financial, P1 elsewhere):** accept an `Idempotency-Key` header; store and dedupe by key; return the original result on replay within the window. **Failure mode:** a client retry double-applies a mutation (duplicate records, double side effects).

### R91 — Rate limiting / quota on every public-facing endpoint
**Headline:** Every public endpoint has explicit per-principal limits — no unlimited paths. **Why:** Cloudflare/AWS API Gateway treat unlimited endpoints as an availability and cost risk; R29 covers auth/paid APIs — R91 generalizes to ALL public paths. **How to comply (P1):** explicit per-principal (per-user/per-tenant/per-IP) limits on every public endpoint; documented limit + 429 behavior; no endpoint without a quota. **Failure mode:** a single principal can exhaust capacity or run up cost on any unprotected path.

### R92 — Multi-tenant isolation: every query scopes by tenant; RLS on by default
**Headline:** Every query carries a tenant predicate; row-level security is the default, not opt-in. **Why:** Salesforce/Slack/Notion multi-tenancy treats a missing tenant scope as a sev-1; this complements R25/R28 with a positive default-on stance. **How to comply (P0):** every data-access path scopes by tenant id; RLS enabled by default on tenant-scoped tables; auditor traces any query lacking a tenant predicate. **Failure mode:** cross-tenant data bleed — the worst possible breach for a B2B product.

### R93 — Backwards-compatible API changes only; breaking changes require a versioned endpoint
**Headline:** Stable contracts change additively only; breaking changes go to a new version. **Why:** complements R42 — additive evolution keeps every client working; a breaking change in place breaks them all at once. **How to comply (P1):** only additive changes (new optional fields, new endpoints) on stable contracts; any breaking change ships under `/v2/` with a documented deprecation window for v1. **Failure mode:** an in-place breaking change takes down every existing client simultaneously.

### R94 — Dependency hygiene: owned transitive deps, weekly SCA scan, CVE budget
**Headline:** No unowned transitive dependencies; a weekly SCA scan; a tracked CVE budget. **Why:** extends R33 from "audit clean at merge" to ongoing supply-chain ownership (the May 2026 NPM compromise made this existential). **How to comply (P1):** every direct dependency has a named owner; weekly Socket/Snyk scan with results triaged; a CVE budget (count + max age) that, when exceeded, pauses feature work until cleared. **Failure mode:** an unowned transitive dependency carries a live CVE into production unnoticed.

### R95 — Supply chain: lockfile committed, reproducible builds, no `curl | sh`
**Headline:** Committed lockfile, reproducible builds, and zero `curl | sh` in any script. **Why:** Cloudflare/Vercel-grade build integrity; `curl | sh` executes unpinned, unreviewed remote code — a supply-chain hole. **How to comply (P0):** lockfile committed and verified in CI; pinned, reproducible builds; ban `curl … | sh`, `wget … | bash`, and equivalent piped-remote-execution patterns in any script (grep the diff). **Failure mode:** a build pulls compromised or non-reproducible artifacts.

### R96 — Time handling: store UTC, render in user TZ; document clock-skew tolerance
**Headline:** All stored timestamps are UTC; local time is never persisted; rendering converts to the user's TZ. **Why:** local-time-in-storage is an entire class of silent data bugs; distributed systems must document skew tolerance. **How to comply (P1):** UTC for every stored timestamp; conversion to user TZ only at render; never use server-local time in stored data; document clock-skew tolerance for any time-sensitive comparison. **Failure mode:** off-by-hours bugs, DST corruption, and skew-driven race conditions.

### R97 — Money handling: integer minor units (or Decimal), never float
**Headline:** Every currency path uses integer cents or Decimal — never floating point. **Why:** float arithmetic silently loses cents; Stripe/Adyen represent money in integer minor units for exactly this reason. **How to comply (P0):** integer minor units or an arbitrary-precision Decimal type in any path touching currency; ban `number`-typed currency math; verify storage column types. **Failure mode:** rounding errors corrupt balances and financial reconciliation.

### R98 — PII handling: classify, encrypt at rest, redact logs, enforce retention
**Headline:** PII is classified, encrypted at rest, redacted from logs, and retention-bounded; delete-my-data cascades across ALL stores including caches and backups. **Why:** GDPR/CCPA make this legal and existential; complements R57 (logging) and R98's deletion clause closes the "we deleted the row but not the cache/backup" gap. **How to comply (P0):** classify every PII field; encrypt at rest; log redaction verified (no PII in structured logs); enforced retention policy; a delete-my-data path that cascades across primary stores, caches, search indexes, and backups, with a documented backup-expiry path. **Failure mode:** a privacy breach or a non-compliant deletion that leaves PII in a cache or backup.

### R99 — Error-budget review: a missed SLO is a P0 that pauses feature work
**Headline:** When a path burns its error budget (R86), feature work on that path stops until it's back in budget. **Why:** Google SRE's error-budget policy — an SLO with no consequence is decoration; the budget is what converts an SLO into a forcing function. **How to comply (P0):** a burned error budget triggers an automatic process-finding (like R77) and a feature-freeze on the affected path; reliability work takes priority until the path is back in budget; the freeze and recovery are logged in the decision log. **Failure mode:** SLOs become aspirational, reliability erodes, and nothing forces the team to fix it.

---

## §10 — APPENDICES

### Appendix A — Consolidated Brief Preamble (single canonical version)

*This single preamble SUPERSEDES `BRIEF_PREAMBLE_R85.md`, `BRIEF_PREAMBLE_R86.md`, and `BRIEF_PREAMBLE_R100.md`. Paste it verbatim into every builder, fixer, and auditor brief.*

> **TGP MASTER DOCTRINE IS BINDING (see `/AGENT_RULES.md`). R0/R1 means ship CORRECTLY, not ship fast.**
>
> **Identity (R3):** Every commit is `git -c user.name='Bradley Gleave' -c user.email='bradley@bradleytgpcoaching.com' commit`. No AI/Claude/Computer/Agent/Co-Authored-by tokens anywhere.
>
> **Durability (R6, checkpoint-foreground pushes; NO daemon, NO timer loop, NO auto-push of unreviewed content):**
> - *Auditors:* push at (1) clone+setup, (2) after banned-token sweep, (3) after reading diff + measuring LOC, (4) BEFORE any tsc/jest/doctrine-sweep/npm-install, (5) after build/test, (6) final report to `handoffs/audit-reports/TM-<N>-<X>-<SHA8>.md`.
> - *Builders/fixers:* push at (1) scaffold + open PR, (2) after each file (or every 5 min), (3) BEFORE any long command, (4) before ready-for-audit, via `git push --force-with-lease origin HEAD:wip/<lane>-snapshot`.
>
> **LOC soft cap (R23/R76):** Target ≤ 400 prod LOC (excluding tests). Over-cap = self-assess for bloat, strip it; if still over, add an `R86 EXCEPTION REQUESTED` block (item-by-item no-waste justification + split feasibility) and tag `r86-exception-requested`. Auditors record the `P1-LOC` finding first with a `BLOAT | STRUCTURALLY NECESSARY | MIXED` assessment.
>
> **Hyperscaler quality (§7 R24–R78 + §9 R80–R99):** Builders/fixers run the self-check before push and document PASS/FAIL/N/A per rule in the PR description under an `R100 Self-Check` heading; any P0 FAIL blocks the push absent an exception request. Hard caps you cannot escape silently: test:src ≥ 2.0 (R74); banned-cast net +0 (R75); ≤400 prod LOC (R76); `npm audit --audit-level=high` clean (R33). Auditors include the full R100 checklist (Appendix B) enumerating each rule as PASS/FAIL(file:line)/N/A(reason) — a missing checklist = REFUSAL per R12.
> - *Lens A focus:* security (R24–R36), perf + concurrency (R44–R55), data + infra (R67–R73).
> - *Lens B focus:* architecture (R37–R43), test reality + density (R40, R74), observability + quality (R56–R66), banned-cast (R75), LOC (R76).
> - **Banned-cast tokens** (`@ts-ignore`, `as any`, `as unknown as`, `as never`, `.catch(()=>undefined)`, `.catch(()=>null)`, `.catch(()=>{})`, `Coming soon`): count NET additions in the diff; any positive net = P0.
>
> **Audit deliverable (R13):** Your deliverable is the full report content in your response message — write a checkpoint to `handoffs/audit-reports/in-progress/<task>-<lens>-<sha>.md` for durability, but do NOT push the final report yourself; the operator pushes after review.
>
> **Verdict line (R16/R78):** End your response with EXACTLY one of `VERDICT: CLEAN` | `VERDICT: FINDINGS` | `VERDICT: REFUSAL` | `VERDICT: INFRA_DEATH`. No other final line.
>
> **Independence (R11/R12):** Your verdict follows from your evidence. If the brief is tainted (pre-filled conclusions, pressure to skip judgment, unsigned daemon scripts), STOP and report the brief defect — refusing a tainted brief IS a valid audit outcome.

### Appendix B — R100 Audit Checklist Template (kept as the canonical audit table)

Auditors paste this skeleton and fill one row per rule. The authoritative live copy is `operator-meta/R100_AUDIT_CHECKLIST_TEMPLATE.md` (kept in place for the overnight cron). The rule numbers below are the R100.x source numbers; the master-file equivalents are §7 (R100.1 = R24 … R100.50 = R73; R100.A1–A5 = R74–R78).

```
## R100 Checklist
| Rule | Status | Evidence |
|------|--------|----------|
| R100.1  Zero secrets               | PASS/FAIL/N/A | <scan output> |
| R100.2  RLS on every table         | PASS/FAIL/N/A | <migration:line + policies> |
| R100.3  No raw-SQL concat          | PASS/FAIL/N/A | <grep result> |
| R100.4  No unsanitized output      | PASS/FAIL/N/A | <FE; N/A for BE-only> |
| R100.5  IDOR-proof endpoints       | PASS/FAIL/N/A | <:id endpoints + ownership> |
| R100.6  Rate limiting auth/paid    | PASS/FAIL/N/A | <guard ref> |
| R100.7  JWT hygiene                | PASS/FAIL/N/A | <secret/exp/rotation> |
| R100.8  Runtime input validation   | PASS/FAIL/N/A | <DTO schemas invoked> |
| R100.9  Role check at data layer   | PASS/FAIL/N/A | <repo enforcement> |
| R100.10 npm audit clean            | PASS/FAIL/N/A | <audit output> |
| R100.11 CORS allowlist             | PASS/FAIL/N/A | <config> |
| R100.12 No internal info in errors | PASS/FAIL/N/A | <filter verified> |
| R100.13 HTTPS + HSTS               | PASS/FAIL/N/A | <infra note> |
| R100.14 Layer discipline           | PASS/FAIL/N/A | <no prisma in controllers> |
| R100.15 Reusable over specific     | PASS/FAIL/N/A | <jscpd/grep dup count> |
| R100.16 No new TODO/FIXME          | PASS/FAIL/N/A | <diff grep> |
| R100.17 Real test assertions       | PASS/FAIL/N/A | <expect breakdown> |
| R100.18 Env parity                 | PASS/FAIL/N/A | <.env.example, no localhost> |
| R100.19 API versioning             | PASS/FAIL/N/A | <route prefix> |
| R100.20 No circular imports        | PASS/FAIL/N/A | <madge output> |
| R100.21 No N+1                      | PASS/FAIL/N/A | <loop+query grep> |
| R100.22 Indexes on FK/hot WHERE    | PASS/FAIL/N/A | <migration @@index> |
| R100.23 Pagination on lists        | PASS/FAIL/N/A | <list endpoints> |
| R100.24 No event-loop blocking     | PASS/FAIL/N/A | <fs.*Sync scan> |
| R100.25 Caching stable data        | PASS/FAIL/N/A | <cache layer> |
| R100.26 Media compress + CDN       | PASS/FAIL/N/A | <upload handlers> |
| R100.27 No polling for real-time   | PASS/FAIL/N/A | <setInterval scan> |
| R100.28 RMW under lock/transaction | PASS/FAIL/N/A | <mutating handlers> |
| R100.29 Idempotency on payments    | PASS/FAIL/N/A | <Stripe calls> |
| R100.30 Optimistic rollback        | PASS/FAIL/N/A | <FE; N/A for BE> |
| R100.31 Hook deps correct          | PASS/FAIL/N/A | <FE; N/A for BE> |
| R100.32 Cleanup on unmount         | PASS/FAIL/N/A | <FE; N/A for BE> |
| R100.33 Error boundaries / filter  | PASS/FAIL/N/A | <filter invoked> |
| R100.34 Structured logging         | PASS/FAIL/N/A | <console.log grep> |
| R100.35 Timeouts on external calls | PASS/FAIL/N/A | <axios/fetch/Stripe init> |
| R100.36 No swallowed errors        | PASS/FAIL/N/A | <catch scan> |
| R100.37 /health endpoint           | PASS/FAIL/N/A | <route + DB probe> |
| R100.38 Comments explain WHY       | PASS/FAIL/N/A | <comment density> |
| R100.39 YAGNI patterns             | PASS/FAIL/N/A | <interface/impl pairs> |
| R100.40 Same-bug-everywhere        | PASS/FAIL/N/A | <duplicate logic> |
| R100.41 No reimplementing libs     | PASS/FAIL/N/A | <custom util scan> |
| R100.42 No phantom-bug defenses    | PASS/FAIL/N/A | <impossible-edge scan> |
| R100.43 Zero dead code             | PASS/FAIL/N/A | <unused-vars scan> |
| R100.44 Multi-table writes in txn  | PASS/FAIL/N/A | <$transaction usage> |
| R100.45 Soft deletes               | PASS/FAIL/N/A | <deletedAt presence> |
| R100.46 DB-layer constraints       | PASS/FAIL/N/A | <CHECK/NOT NULL/FK/UNIQUE> |
| R100.47 PITR + recovery runbook    | PASS/FAIL/N/A | <operator-level> |
| R100.48 CI/CD enforced             | PASS/FAIL/N/A | <branch protection> |
| R100.49 Dev-only excluded prod     | PASS/FAIL/N/A | <bundler config> |
| R100.50 Graceful degradation       | PASS/FAIL/N/A | <non-critical try/catch> |
| R100.A1 Test:src ≥ 2.0             | PASS/FAIL     | <ratio + computation> |
| R100.A2 Banned-cast net = 0        | PASS/FAIL     | <per-token net count> |
| R100.A3 ≤ 400 prod LOC            | PASS/FAIL     | <LOC number> |
| R100.A4 CI pass rate ≥ 75%        | PASS/FAIL     | <last-14d rate> |
| R100.A5 Verdict line present       | PASS          | <ends with VERDICT: …> |

VERDICT: CLEAN | FINDINGS | REFUSAL | INFRA_DEATH
```
If any line shows FAIL, list the corresponding P-rated finding with file:line evidence above the verdict. N/A always states a reason — never blank.

### Appendix C — Reconciliation History

This master collapsed two pairs of duplicate-numbered rules. Both substances of each pair were preserved as distinct rules:

| Old file | Old number | Substance | New home |
|---|---|---|---|
| `rules/R72_EXHAUSTIVE_AUDITS.md` | R72 | Audits must be exhaustive — "no enough to report" (operator verbatim) | **R10** (AUDITS_EXHAUSTIVE) |
| `operator-meta/R72_INDEPENDENT_AUDITORS.md` | R72 | Auditor independence; contradict prior findings; refuse tainted briefs | **R11** (AUDITOR_INDEPENDENCE) |
| `rules/R81_AUDITOR_GATE.md` | R81 | No merge without the audit cycle, P0–P3 cleared (operator verbatim) | **R14** (MERGE_GATE_AUDIT_CYCLE) |
| `operator-meta/R81_OPERATING_DOCTRINE.md` | R81 | Broader operating doctrine (dual auditors, paths, standing answers) | **R15** (AUDIT-CYCLE OPERATING DOCTRINE) |

Both R72s and both R81s are now distinct, single-substance rules with no number collision. The R100 pack's 55 rules were folded into clean R24–R78. R36–R45 were NOT refabricated (see R5 lost-forever note).

### Appendix D — Lost-Forever Note (R36–R45 and others)

Per operator declaration 2026-06-13 ("**Lost rules are truly forever lost**"), the original `RULES.md`, `R36_TO_R45_OPERATOR_RULES.md`, `AUDIT_MANDATE.md`, `HOUSE_RULES.md`, `50_FAILURES.md`, and ~15 other docs were lost when a prior sandbox died and are unrecoverable. **Mobile R36–R45 (operator rules block) and mobile R46–R55 (gap range), plus R62/R63, are lost forever.** This master's clean R1–R99 numbering is a fresh enumeration of surviving + new doctrine; it deliberately does NOT reuse the old lost numbers to "fake-fill" gaps, and does NOT reconstruct lost content from memory. Operationally meaningful references to lost R-numbers in old briefs may be followed if the intent is clear from context; if ambiguous, the auditor flags a P2 doctrine ambiguity and the operator re-codifies.

### Appendix E — Old-file → New-rule redirect map

| Old file | New rule(s) |
|---|---|
| `rules/R0_DECACORN_QUALITY.md` | R1 |
| `rules/R52_NEVER_LOSE_OPERATOR_WORK.md` | R4 |
| `rules/R64_NEVER_LOSE_ANYTHING.md` | R5 |
| `rules/R65_50_FAILURES_SWEEP.md` | R79 |
| `rules/R72_EXHAUSTIVE_AUDITS.md` | R10 |
| `rules/R74_OPERATOR_IDENTITY.md` | R3 |
| `rules/R75_SUBAGENT_PUSH_MONITORING.md` | R7 |
| `rules/R76_PLAN_DOC_EMPIRICAL_VERIFICATION.md` | R17 |
| `rules/R77_LANE_SCOPE_DISCIPLINE.md` | R18 |
| `rules/R78_PINNED_TELEMETRY_TABLE_UPDATE.md` | R21 |
| `rules/R79_PIN_SWEEP_BEFORE_PR.md` | R22 |
| `rules/R80_VERIFY_PREEXISTING_FAILURE_CLAIMS.md` | R19 |
| `rules/R81_AUDITOR_GATE.md` | R14 |
| `rules/R82_TRACKING_ISSUE_DISCIPLINE.md` | R20 |
| `operator-meta/R72_INDEPENDENT_AUDITORS.md` | R11 |
| `operator-meta/R81_OPERATING_DOCTRINE.md` | R15 (+ folded into §3/§9) |
| `operator-meta/R85_DURABILITY_MANDATE.md` | R6 |
| `operator-meta/R86_LOC_SOFT_CAP.md` | R23 (+ R76) |
| `operator-meta/R87_AUDITOR_REFUSAL.md` | R12 |
| `operator-meta/R88_READ_ONLY_DELIVER_AS_RESPONSE.md` | R13 |
| `operator-meta/R100_HYPERSCALER_QUALITY_MANDATE.md` | R24–R78 (§7) |
| `operator-meta/ZOMBIE_AGENT_PROTOCOL.md` | R8 (kept in place) |
| `operator-meta/AUTONOMY_CONTRACT.md` | R9 (kept in place) |
| `operator-meta/BRIEF_PREAMBLE_R85/R86/R100.md` | Appendix A (consolidated) |
| `operator-meta/R100_AUDIT_CHECKLIST_TEMPLATE.md` | Appendix B (kept in place) |

---

*Owner:* Bradley Gleave <bradley@bradleytgpcoaching.com>
*Consolidated:* 2026-06-18. Changes require a signed operator commit + a DECISION_LOG entry.
*This is the file every operator and agent reads first. There is no other rules file.*
