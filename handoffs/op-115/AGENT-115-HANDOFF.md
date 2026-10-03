# TGP Operator Handoff — Agent 115

Prepared by operator agent 114 on 2026-10-02 at 21:50 PDT. This document assumes you remember nothing. Read it top to bottom once, then use the file map in section 12.

## 0. The 60-second version

- You are the operator (orchestrator) for The Growth Project. You grade, decide, route, merge, deploy and record. Builders write all code. You never write product code yourself.
- STOP-AND-DRAIN is in force. The owner (Bradley) said at 19:05 PDT on 10-02: "stop-and-drain to zero agents rule - in effect until I say "SCALE 2" just to be sure all work gets DONE, not cutoff by credit shrotages!" Until he says exactly "SCALE 2", you launch no subagents and you do not re-task finished ones.
- Agent count is 0 in both sessions: agent 114 (this operator) and sub-manager 114-S (a second Computer session).
- Production backend runs ec911328 (deployed 20:06 PDT 10-02, verified). Backend main = ec911328. Mobile main = 4f1d74d8.
- Nothing is mergeable right now. Every open PR needs either a fix round, an Opus verdict, or a fresh dual verdict after a main update (section 4).
- Target: App Store live with the clinic QR flow by Tue 10-06, Wed 10-07 buffer. Everything built, tested and audited by 10-07 (owner 10-02 16:17).
- Your first message to the owner is a readback (section 1.4), then wait for "SCALE 2" or his decisions.

## 1. Who you are and the rules you live by

### 1.1 Documents and their weight

| Document | Where | Weight |
|---|---|---|
| Agent Rules (G01–G22) | AGENT_RULES.md in tgp-agent-context, and the owner's TGP-Agent-Rules.docx | The law. Above everything. |
| Autonomous Executive Operator Doctrine | owner's TGP_EXECUTE doctrine docx | Your mentality: act, do not ask for chores. |
| T0–T4 model routing | MODEL_ROUTING.md and the owner's T0–T4 routing docx | How PRs are executed and audited. |
| Operator prompt v6 (agent 113) | owner's docx; handoffs/op-f083060f | Stale but important background. |
| This handoff + handoffs/op-114/DRAIN_HANDOFF.md | tgp-agent-context | Current truth as of 21:50 PDT 10-02. |
| LAST_OPERATOR_STATE.md | tgp-agent-context root | Running log; newest sections at the top. |

### 1.2 Standing owner rules (verbatim where it matters)

- "ANYTHING LESS THAN HYPERSCALER QUALITY IS A DAY 1 BLOCKER / WALL CLOCK TIME IS KEY #1 RESOURCE / DO IT RIGHT, DO IT SMOOTH - SMOOTH IS FAST / I WANT MORE, NOT LESS FUNCTIONALITY IF THE CHOICE ARISES".
- "I WANT A PRISTINE USER EXPERIENCE, AMAZING AHA MOMENTS, AND APPLE LEVEL UI SIMPLICITY AND SCREEN FLOWS".
- Recurring packages are "LITERALLY MOST CRITICAL OF ALL"; never sell one-time-only.
- Spend no money (no EAS builds) without his word.
- Never write the clinic partner's name or the coach welcome text into any repo, PR, commit or state file. tgp-agent-context is PUBLIC. Say "the clinic partner".
- Copy: no emojis, no exclamation marks, no generic errors, no first person ("we", "our", "write to us").
- Every message to the owner ends with "Your next step: …" or "Nothing needed from you."
- Escalate decisions, not chores. Branch-protection changes need his exact words.
- T4 work: Opus builders; then two lenses (Claude Opus 5.5 and GPT-6.1 Sol) at the exact head. A new head needs new verdicts.
- Commit identity used by 114: git -c user.name="TGP Agent 114" -c user.email="agent@tgp.invalid". Use "TGP Agent 115" for yours.

### 1.3 Authority carried to you

- Push and merge: only audited exact heads, required checks green, branch current with main. Merge with gh pr merge N --merge --match-head-commit <sha>.
- Standing deploy approval (owner 10-01 20:32 and 10-02 12:10–12:11): audited main, main CI green, then plan, apply, deploy, verify. You approve the GitHub "production" environment on fly-deploy runs of audited main.
- Mechanical update-branch on a PR is yours (no agent needed), but the new head then needs new verdicts.
- Not yours: branch-protection changes, spending money, EAS builds, Stripe or Apple account settings, publishing the privacy policy before the owner's answers.

### 1.4 Your first move

1. Pull tgp-agent-context; read this file, handoffs/op-114/DRAIN_HANDOFF.md, the top of LAST_OPERATOR_STATE.md, and handoffs/op-114/OPERATOR_NOTES.md (train log, newest last).
2. Verify on GitHub that heads in section 4 still match (gh pr view N --json headRefOid). Anything moved means someone else acted; find out who before touching it.
3. Send the owner a short readback: rule in force, what is live, what is blocked, the six owner actions (section 6.1). End with "Your next step: …".

## 2. What happened on 10-02 (agent 113 → 114 → drain)

- 17:31 agent 113 stopped; its lanes died with the session; last pushes stayed on GitHub. Production then: 53b6d472.
- 18:15 agent 114 recon; 18:22 owner EXECUTE; the next 12 PR sets were split 6 operator / 6 sub-manager 114-S, with a zero-memory handoff for 114-S.
- 18:26 batch 1 (6 agents). 18:45 the npm-audit gate broke on a new advisory with no patch (ruling OR-114-2, one gate PR, builders never chase it).
- 18:58 owner "SCALE" → 19:02 wave 2 (8 builders + 2 lenses). 19:00 owner: add no more agents; 19:05 STOP-AND-DRAIN until "SCALE 2".
- 19:11–20:06 merged #663, #608, #327; deployed ec911328 (deletion + data export live).
- 20:15 114-S drain complete. 20:57 agent 114's last lens finished (QUEUE EMPTY). Count 0.

## 3. Progress made

### 3.1 Merged and deployed (agent 114)

| PR | What | Merge commit | When |
|---|---|---|---|
| mobile #314 | Community report, block, moderation (Apple 1.2) | 1f8981dd | 18:55 |
| backend #645 | Branch-protection setup script lists 11 checks (CI only) | 12e1b03b | 18:55 |
| backend #663 | npm-audit gate: time-boxed dev-only exception for GHSA-vfj7-8cjw-p6xm (braces, no patch), expires 2026-10-31 | 2e3094b9 | 19:11 |
| backend #608 | Account deletion (Apple 5.1.1(v)) with #636 data export composed | ec911328 | 19:41 |
| mobile #327 | Account deletion and data export screens | 4f1d74d8 | 19:41 |

Deploy: fly-deploy run 37091836055, release ec911328, migrations applied (20270220000000 data-export archive cleanup, 20270221000000 data-export storage bucket). Verified /health 200, /readyz db up, 0 unfinished migrations, private data-exports bucket with its policy, POST /api/me/delete-account and POST /api/account-deletion/receipt answer 401 without a token. The C-636-6 pre-deploy probe ran read-only first (Supabase role postgres, supautils policy grant on storage.objects).

### 3.2 Fix rounds completed (agent 114 lanes; all pushed, all green at the time)

| PR | Round | Result |
|---|---|---|
| backend #627 coach payout | R8 @cd332bfa | B-627-9 race fix (in-flight hold, CAS outcome writes, sweeper lock) + C-627-2 manifest classification. Sol RC narrowed (paused sender). |
| backend #654 recurring | R1 @795110b7 | Server-side default card on setup_intent.succeeded; trial cleanup never cancels a saved-card trial; allowlisted extra error fields; PACKAGE_COACH_NOT_CONNECTED. Sol RC 0/4/0. |
| mobile #334 recurring sheet | R1–R2 @0629d506 | Every package surface sells renewing plans through the native PaymentSheet; plan terms before paying; "Your plans" end/keep; per-code copy. Opus APPROVE, Sol RC 0/2/1. |
| backend #656 trials | R2–R3 @079e9e39 | Composes with #654 in either order; #608 manifest entries. Sol RC 0/5/1. |
| mobile #338 (new) | R1 @0db17866 | Coach trial-days input. Sol APPROVE. |
| backend #641 coach money | R3–R4 @0d3d04de | Idempotent package create, refunds booked at success, B-641-7 double reversal fixed, 15-minute reversal retry. Sol RC 0/2/1. |
| mobile #329 / #332 | R4 / R2 @3a90f28a / @6c193c80 | Setup wizard; Money page (period, cadence, malformed money, CSV, autocapture block). #332 Sol APPROVE. |
| backend #628 / mobile #322 | R6 @bba11793 / @23435ec2 | Dunning; never-entitled attempts are not dunning. #322 dual APPROVE; #628 Sol RC 0/1/1. |
| backend #640 / mobile #328 | R4 @176e4f0e / @dd347633 | Programs: autosave owner/visibility rule (OR-112-18). #640 Sol APPROVE; #328 dual APPROVE. |
| backend #647 / #648 | R3 / R2 @df4eb80b / @16294f44 | Reminders in the client's real zone; push outbox, quiet hours 21:00–08:00. #647 Sol APPROVE; #648 Sol RC 0/3/1. |
| backend #609 / mobile #312 | R3 / R2 @9e2f9237 / @2b54e151 | Coach welcome message job (text is runtime-only) + workout reminders; lease fence. #609 Sol APPROVE; #312 dual APPROVE. |
| backend #652 | R2 @a22761b5 | Five #610 community findings closed; #608 conflict resolved. Sol APPROVE. |
| backend #664 (new) | R0 @62f57edb | multer 2.3.0 → 2.4.0 (moderate advisory). Sol APPROVE. |
| backend #611 privacy | R6 @1af96efa | Restore runbook split to issue #662. Dual APPROVE; waits for owner answers. |

### 3.3 Sub-manager 114-S (its own session and sandbox; final state 20:15)

- Launched and finished 9 agents. Merged nothing (by design: the operator is the sole merger). Touched no production system.
- #326 and #315 reached dual APPROVE and READY FOR OPERATOR MERGE (19:14 and 19:25) but went BEHIND when #327 merged; both need a main merge and dual delta at the sentry.ts seam.
- #634 R4 + main merges (Opus APPROVE, Sol RC B-634-10). #651 R1 + main merges (Opus RC 0/3/4, Sol RC 0/10/3, large).
- Builder self-findings it posted, later confirmed by lenses: B-305-11 (= B-305-12, raw emergencyLaunchReason reaches Sentry via ExpoContext) and B-317-11 (import completion fence).
- Its full final state is in handoffs/op-114/114S-FINAL-STATE.md and handoffs/op-114/SUB_STATUS.md. Its lane reports (S-B1..S-B5, S-L-*) stayed in its sandbox; the substance is in those two files.

### 3.4 Rulings made by agent 114 (binding until changed)

- OR-114-1: #611 splits the operational restore runbook into issue #662; tier stays T4; no production restore until #662 is built.
- OR-114-2: npm-audit advisory handled by one T4 gate PR (#663); builders never chase it.
- OR-114-3: owner launch freeze (19:00) and STOP-AND-DRAIN (19:05) bind both sessions.
- OR-114-4: #332 CSV export ships as a real .csv file (follow-up adds expo-file-system).
- #650 community flags: hold until a clinic build carrying #314 is ready.
- #315 must not say "180 days" (AI chats kept until the client deletes them or the account).
- #648 migration prefix 20270307000000 confirmed; #609's 20270213000000 kept (out-of-order apply is proven safe, OR-113-4).
- #322/#334 overlap: second to merge keeps the native card-update screen. #628/#654 "never-entitled" checks: second to merge unifies them.
- #641 reversal still owed after 23 h: acceptable for v1 only if it raises an operator alert.

## 4. Open PR board (verdicts at the CURRENT head only; 21:00 PDT 10-02)

Both repos enforce strict up-to-date branches. Every merge pushes all other PRs BEHIND; updating a PR creates a new head that needs new verdicts.

| PR | Head | Opus | Sol | Needs next | Order |
|---|---|---|---|---|---|
| backend #627 coach payout | cd332bfa | – | RC 0/1/0 | Fix round 9: B-627-9 narrowed. Adopt the attempt with the same Stripe idempotency key; re-prove the lease right before the Stripe call; Sol's probe as failing-before test. Then dual. | First money merge |
| mobile #321 | 4f5b058d | APPROVE | APPROVE | Update after #627, dual merge-only delta | With #627 |
| backend #654 recurring | 795110b7 (base #627 branch) | – | RC 0/4/0 | Fix round; retarget to main after #627; Opus full | After #627 |
| mobile #334 recurring sheet | 0629d506 | APPROVE | RC 0/2/1 | Fix B-334-3 (unknown native outcome must read canonical state before "nothing was charged") and B-334-4 (reconcile terms with returned intent) | After #654 and #628 deployed |
| backend #656 trials | 079e9e39 | – | RC 0/5/1 | Fix round + Opus | After #654 |
| mobile #338 trial days | 0db17866 | – | APPROVE | Opus | With #656 |
| backend #628 dunning | bba11793 | – | RC 0/1/1 | Fix round + Opus | Before #322, #334 |
| mobile #322 | 23435ec2 | APPROVE | APPROVE | Update after #628 deploys + dual delta | After #628 |
| backend #640 programs | 176e4f0e | – | APPROVE | Opus delta only | Before #328 |
| mobile #328 | dd347633 | APPROVE | APPROVE | Update after #640 deploys + dual delta | After #640 |
| backend #641 coach money | 0d3d04de | – | RC 0/2/1 | Fix round + Opus | Before #329 |
| mobile #332 Money page | 6c193c80 (base #329 branch) | – | APPROVE | Opus; then operator merges it into #329's branch | Before #329 |
| mobile #329 setup wizard | 3a90f28a | BLOCK | BLOCK | After #332 lands in its branch: update + dual delta | After #641 |
| backend #647 reminders | df4eb80b | – | APPROVE | Opus | Before #648 |
| backend #648 push outbox | 16294f44 | – | RC 0/3/1 | Fix round + Opus | After #647 |
| backend #609 welcome + reminders | 9e2f9237 | – | APPROVE | Opus | Before #312 |
| mobile #312 | 2b54e151 | APPROVE | APPROVE | Conflict with mobile main + dual delta | After #609 deploys |
| backend #652 community UGC | a22761b5 | – | APPROVE | Opus | Any |
| backend #664 multer | 62f57edb | – | APPROVE | Update + verdict per tier | Any |
| backend #611 privacy | 1af96efa | APPROVE | APPROVE | Owner answers; update; dual delta | With mobile #315 |
| mobile #326 (114-S) | 4ae5210d | APPROVE | APPROVE | Update + dual delta (sentry.ts seam with #327) | First mobile merge on restart |
| mobile #315 (114-S) | 0ef94ddf | APPROVE | APPROVE | Update + dual delta; merges with #611 | With #611 |
| mobile #305 (114-S) | 4ac5980e | RC | RC | Round 6: filter Sentry ExpoContext, scrub contexts.ota_updates, real-SDK canary; main merge | After #326 |
| mobile #317 (114-S) | cfa99ce3 | APPROVE | APPROVE | Round 5 for B-317-11 (fence import completion by attempt epoch); main merge; dual delta | After #305 |
| backend #634 + mobile #325 (114-S) | 9e6c62c9 / 268ed81b | APPROVE / RC | RC / RC | #634 round 5 (B-634-10 finite error-class enum in safeLogDiagnostic); #325 B-325-4 copy "we" | #634 first |
| backend #651 Roman grounding (114-S) | a8fa651c | RC 0/3/4 | RC 0/10/3 | Large round 2; C-651-5 needs a privacy ruling | After #634 |
| backend #661 | 91625c86 | RC | RC | Fix round | Any |
| mobile #331 | ec2857ba | RC | BLOCK | Fix round + conflict | Any |
| mobile #335 | 18f17460 | – | BLOCK | Fix round + conflict | Any |
| backend #658, #659 (annex session) | 08534e17 / fa9a7cbd | RC | RC / BLOCK | Annex fix rounds; add their user tables to #608's manifest | Annex |

## 5. Restart plan when the owner says "SCALE 2"

1. Ask nothing; launch. Lenses first: one Claude Opus 5.5 lens and one GPT-6.1 Sol lens. Opus-only queue that needs no fix: #640, #647, #609, #652, #332, #338.
2. Builders (Claude Opus 5.5), most critical first: #627 (B-627-9 narrowed); #654 + #334 as one lane; #628; #641; #656; #648. Then 114-S's mobile chain (#326 → #315 → #305 → #317 → #325) and #634 → #651, either in a revived sub-manager session or as your lanes.
3. Merge train as verdicts land: #640 → deploy → update #328 → merge. #609 → deploy → fix #312 → merge. #647. #652. #627 + #321 → retarget #654 → #654 + #656 (+ #338) → deploy → #628 deploy → #322, #334. #641 → #332 into #329 → #329.
4. Each backend deploy: main required CI green → gh workflow run fly-deploy.yml -R BradleyGleavePortfolio/growth-project-backend --ref main -f release_sha=<main head> -f confirm=deploy -f migrations=apply-migrations → approve the pending "production" environment via the API → verify /health, /readyz, _prisma_migrations (0 unfinished), the PR's own routes. Run fly-env-sync plan/apply only when fly-env-desired-state.json changed.
5. Keep agent count within sandbox limits: pause launches at disk > 80%, available memory < 1.5 GB, heavy queue > 6 for 10 minutes.

## 6. To-do lists

### 6.1 Owner actions (ask once, clearly)

1. Supabase production project is on the FREE plan (no accessible daily backups). Upgrade to Pro: yes or no. Asked 18:50.
2. #611 privacy policy: answer the five questions or say "defaults" (handoffs/op-114/reports/B-PRIV-6-114.md).
3. Set Sign in with Apple keys via the fly-apple-signin-set.yml workflow (APPLE_SIGNIN_KEY_ID, APPLE_SIGNIN_PRIVATE_KEY) so deletion can revoke Apple tokens.
4. Upload the FCM V1 key in Expo (Android push).
5. Before #654 deploys: add setup_intent.succeeded to the platform Stripe webhook's events.
6. Later: Apple Pay merchant ID (EXPO_PUBLIC_STRIPE_MERCHANT_IDENTIFIER); Stripe live settings (retries, branding, charge.dispute.closed, pk_live on Fly and EAS); SENTRY_AUTH_TOKEN as a sensitive EAS variable; install the next build and sign up as coach (unlocks C04 setup: packages, programs seed, runtime welcome text, appointment types, QR).
7. Device pass of account deletion with disposable client and coach accounts before Apple submission.

### 6.2 Operator decisions waiting (from 114-S)

- #651 C-651-5 (OR-113-12 / health data law): crisis and health labels in audit action names, ledger metadata and info logs. Opus recommends keeping IDs and the audit row and disclosing it in #611.
- #651 FR1-651-7: crisis templates answered without box 2. Recommended: keep.
- #603 fixes not carried into #651 (2,000-character cap, calorie floor): recommended small separate PR.
- Copy on main: "On our side" in RomanAiConsentScreen; consentVersion.ts comment names the retired period. Recommended follow-up copy PR.
- docs/OTA_UPDATES.md clinic Health Connect line: whichever of #305/#317 merges second fixes it.
- #634: rollout gates; confirm migration 20270222 is not applied. #317 device checks and release order. #315 device check C-315-1.

### 6.3 Backlog (no lane yet)

- #332 real .csv attachment (OR-114-4; adds expo-file-system).
- #628 residual: Stripe idempotency keys expire after 24 h; reconciliation must never read an unreconciled >24 h receipt as paid.
- #641 alert + runbook line for reversals still owed after 23 h.
- #656 card removed mid-trial still shows "will charge"; store card state on the purchase.
- Mobile notifications: send device zone on sign-in and foreground; notification tap opens the session (C-648-3); Quiet hours screen payload.
- Coach messages including the welcome never reach the lock screen (check #648 coverage).
- Shared fallback copy from #324 says "write to us".
- Dedicated DELETION_RECEIPT_SECRET (today derived from RECENT_AUTH_SECRET; do not rotate that secret for 30 days without it).
- Issue #662 restore-without-resurrection (no production restore until built).
- Carried from the 72-hour ledger (handoffs/op-114/LEDGER-72H.md section D): #642 Google sign-in flip after #608 (now deployed), #643 booking reminders flip after #647/#648, #653/#336 auto-expiry, #655/#337 approve-to-adjust, annex #657–#660, Connect return URLs via manifest after #641, release-evidence-gate T4 follow-up, native client billing screens, deletion follow-ups, S-ERRORS slices, C11 App Store package, native build after #305/#330/#317/#314/#325, two TestFlight passes.
- Leftover branches safe to delete: wip/B-JOURNEY-5-c6094, wip/S-COACH-MOB-4-money.

## 7. How agent 114 operated (quick overview)

- Recon first (15 minutes): every open PR's head, merge state, CI and latest verdicts at the head; production health; main CI. Built the 72-hour ledger of owner decisions before acting.
- Split and delegate: 12 PR sets, 6 kept, 6 to a sub-manager in a separate Computer session with a zero-memory handoff (handoffs/op-114/TGP-SubManager-Handoff-114S.md).
- Lanes: each builder got a lane file (one writer per PR, exact head, findings by ID, done = FIX ROUND comment + READY FOR AUDIT + green required checks + report ending "## HANDOFF"). Shared kit: heavy.sh (serialises heavy jobs), link_deps.sh (shared node_modules per repo), prcheck.sh, sandbox_monitor.sh.
- Lenses: long-lived audit lanes with a queue; told never to finish at QUEUE EMPTY while builders were still pushing; one verdict per PR per head; post each verdict immediately.
- Operator loop on every agent mail: grade the report against GitHub (heads, checks, comments), route findings to a running writer, merge exact heads with --match-head-commit, deploy under standing approval, write the train log line, push state.
- GitHub CI did the heavy verification (type check, full test suites, live RLS jobs); builders ran only targeted suites locally through heavy.sh.
- Seams handled by assigning the second-to-merge PR's builder (C-627-2 manifest, #608 manifest coverage, #641/#656 overlap, #322/#334 screen).
- Under the freeze: fix rounds whose builder had finished went to builders still running (no new agent); anything left became a row in DRAIN_HANDOFF.md.

## 8. Managing a sub-orchestrator: practices and lessons

### 8.1 Practices that worked

- Disjoint ownership. The sub-manager got 6 named PR sets; everything else was on an explicit do-not-touch list. No PR ever had two writers.
- One merge authority. The sub-manager never merges. It posts "READY FOR OPERATOR MERGE — repo#N @ <full sha>" with both verdict links and a SUB_STATUS line; the operator merges. Quality gates stay identical across sessions.
- Durable, asynchronous channels in GitHub, not chat. OPERATOR_NOTES.md (operator → sub: rulings, merge log, directives; only the operator edits it) and SUB_STATUS.md (sub → operator: state table plus NEEDS OPERATOR lines). Both survive compaction, credit cutoffs and session restarts, and the owner can read them.
- A handoff written for a reader with no memory: where everything is, exact commands, gates, stages S1–S5, what done means, what to escalate.
- Distinct commit identities ("TGP Agent 114" vs "TGP Sub-Manager 114-S") plus writer_guard.sh, which scans every PR's commits for the wrong session's identity. 0 collisions all session.
- Owner rulings recorded verbatim and declared binding on both sessions (SCALE, freeze, STOP-AND-DRAIN). The operator cannot message the other session directly; the owner relays, so every directive was also written to OPERATOR_NOTES.md.
- Sub-manager escalates decisions, not chores; operator answers in OPERATOR_NOTES.md within one cycle.

### 8.2 Lessons (do these differently)

- Re-read SUB_STATUS.md on every operator cycle and merge READY pairs before merging anything that moves the same main. Mobile #326 was READY and CLEAN at 19:14; the operator merged #327 at 19:41 without merging #326 first, so #326 and #315 went BEHIND at the sentry.ts seam and lost their attestations. With strict branch protection, merge order across sessions is a shared resource; publish the merge queue in OPERATOR_NOTES.md and work it top-down.
- Publish the cross-session merge order up front (which PR set lands first in each repo) so neither session's READY work is invalidated by the other's merge.
- Keep the builder pre-push checklist mandatory: 114-S's builders found two defects both lenses had approved past (B-305-11, B-317-11).
- Lens step budgets run out (~175–200 steps). Size lens queues to about 10–12 verdicts each, or plan a second lens before the first is exhausted. Both Opus lenses finished before the train did, which left every T4 head without an Opus verdict.
- Detect shared-main breakage early: the npm-audit advisory turned main red before it was caught. Check main's required checks at every cycle, not only PR checks.

## 9. Why delegate sandbox space (a second Computer session)

### 9.1 Benefits

- Compute isolation. One sandbox here is 2 vCPU, about 7.7 GB RAM and 20 GB disk. With 12–15 agents in agent 114's sandbox, load peaked at 12.6, memory use at 4.7 GB (3.2 GB minimum available), disk at 77% (pause threshold 80%), the heavy queue at 5 (threshold 6) and 21 worktrees at once. Full type checks ran out of memory twice. A second session brings its own CPU, RAM, disk, worktrees and node_modules, so its 9 agents did not compete for these.
- Separate context and step budgets. The operator's context fills with lane traffic and gets compacted; delegating six PR sets keeps the operator's context on grading, merging and deploying, and the sub-manager carries its own lanes' detail.
- Parallel wall-clock throughput. Two orchestrators route, grade and re-queue at the same time; the operator is no longer the single queue for every fix round.
- Fault isolation. If one sandbox degrades, hits a credit or step cutoff, or compacts badly, the other session keeps working, and all state is in GitHub.
- Quality is unchanged. The operator remains the sole merger and deployer; the same lenses and gates apply to both sessions.

### 9.2 Costs and limits

- GitHub CI is shared. Backend Actions had about 80 queued runs at peak; a second sandbox does not add CI capacity, so CI is the next bottleneck after local compute.
- Cross-session merge coupling under strict branch protection (lesson 8.2).
- Credit burn grows with agent count; the owner may freeze launches (he did), so every lane must push progress at least every 20 minutes and keep its report current.
- Coordination overhead: the owner relays messages between sessions; directives must be written to the shared files to be reliable.

## 10. Mistakes by agent 114 (for the record)

- Mobile #326 not merged while READY (19:14–19:41); see 8.2.
- npm-audit advisory detected after main had already gone red.
- Under-scaled at first (the owner had to say "SCALE"); the handoff docx needed rework; the 72-hour ledger had to be rebuilt once.
- Both Opus lenses ran out of steps before the train finished; no Opus coverage remained under the freeze.

## 11. Key facts

- GitHub account BradleyGleavePortfolio; repos growth-project-backend, growth-project-mobile, tgp-agent-context (public). Use bash with api_credentials ["github"].
- Production backend https://backend-spring-lake-3890.fly.dev (Fly app backend-spring-lake-3890), global prefix /api (health and readyz excluded).
- Supabase production project rpyfdsgxxltzutgqeouk (FREE plan). Read-only checks through the Supabase connector only.
- Backend required checks (11, strict): build-and-test, rls-floor-guard, rls-live-tests, mwb-3-live-tests, npm audit (high+critical, whole graph), CodeQL JS/TS (javascript-typescript), Banned cast tokens (R75 / R100.A2), build-sbom, danger, Schema parity (migrations match schema.prisma), community-live-tests. release-please is red on main since before 53b6d472 and is not required.
- Mobile required checks (3, strict): Typecheck, lint, test; Analyze (javascript-typescript); Analyze (actions).
- Known flake: release-evidence-gate.spec.ts:367 (rerun once).
- Reserved migration prefixes: annex 20270301–20270306; #648 20270307000000.

## 12. File map (tgp-agent-context)

| Path | What |
|---|---|
| handoffs/op-115/AGENT-115-HANDOFF.md | This document |
| handoffs/op-114/DRAIN_HANDOFF.md | PR-by-PR drain state, restart order, owner actions |
| handoffs/op-114/OPERATOR_NOTES.md | Full train log and rulings (newest last) |
| handoffs/op-114/SUB_STATUS.md | 114-S state table and NEEDS OPERATOR lines |
| handoffs/op-114/114S-FINAL-STATE.md | 114-S final drain report |
| handoffs/op-114/LEDGER-72H.md | Owner decisions and to-dos, 72 hours to 18:28 10-02 |
| handoffs/op-114/TGP-SubManager-Handoff-114S.md | The zero-memory sub-manager handoff (template for the next one) |
| handoffs/op-114/lanes/ | Lane files used by agent 114 |
| handoffs/op-114/reports/ | Every agent-114 lane and lens report (each ends with "## HANDOFF") |
| handoffs/op-114/kit/ | heavy.sh, link_deps.sh, install_deps.sh, prcheck.sh, sandbox_monitor.sh, common builder and auditor briefs |
| handoffs/op-114/writer_guard.sh | Cross-session writer collision check |
| LAST_OPERATOR_STATE.md | Running state log, newest at top |
| AGENT_RULES.md, MODEL_ROUTING.md | Laws and routing |
