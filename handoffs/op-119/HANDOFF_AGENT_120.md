# TGP Operator — current state (agent 119 -> agent 120)

Updated: 12:32 PDT 10-04 (from `date`). CURRENT-STATE document: agent 119 overwrites sections 0, 3, 5 and 6 at every milestone;
history goes to LAST_OPERATOR_STATE.md. Agent 120 copies it to handoffs/op-120/HANDOFF_AGENT_121.md on arrival.
GitHub is the truth: verify every head and verdict there before acting on any line here (section 2 has a script that does it).

## 0. Sixty-second summary

- Agent 119 took over 12:19 PDT 10-04 from agent 118 (stopped cleanly 12:03). Verified 12:20-12:27: verify_heads.sh 54/54 MATCH;
  backend main 3e9a9a75, mobile main cc4ceeed; production /health ok, /readyz db up, release 3e9a9a75 (run 37225983355);
  _prisma_migrations 189 rows, 0 pending (2 April baseline rows rolled back), latest 20270301000000; StripeProcessedEvent 0 rows;
  Supabase plan Free; CI queue empty.
- Merged 10-04: #698, #699, #700, mobile #368 (all by 118). Deployed 10-04: 2af682ca, 3e9a9a75. No migrations.
- Wave 1 (agent 119, 12:30): 15 agents, section 6. Entries: ops/lanes119/JOBS119.md (copy in handoffs/op-119/JOBS119.md); rules:
  _COMMON_119.md.
- R-DISPUTE-PAUSE (section 9) is binding; B-DUNSPLIT-119 builds it after the coach builder (owner order to 119: coach first).
- ops/ snapshot: backend branch wip/op119/ops-snapshot (tools/snapshot.sh in handoffs/op-119/tools).
- Agent cap: 15 concurrent (owner 12:28 PDT 10-04) until 13:22 PDT; at 13:22 stop-and-drain to 5 active, then 5 concurrent (owner
  12:49). Credits: 9.4k/45k at 12:49 (owner).

## Launch path (7 steps)

| # | Step | State at 12:13 10-04 | Owner action |
|---|---|---|---|
| 1 | Privacy | DONE (policy + trust-center links 10-03; privacy logging #700 and deletion copy mobile #368 merged and deployed 10-04) | none |
| 2 | Money | Fees F3-F6 READY for lenses -> merge as one -> deploy. Recurring R1-R5 READY -> restack on fees top -> lenses -> lands with mobile sheet #342-#344 (builder needed) and #661/#702 (dual APPROVE) -> deploy. Trials T2/T3 READY -> lenses -> deploy | none (Stripe destination, refund/setup/trial events and retry rule all done 10-04) |
| 3 | Coach | #674/#676 RC both, #677 unreviewed -> B-CM5 builder -> lenses -> deploy -> mobile #345-#351 | none |
| 4 | Failed payments | D1/D2 READY; split #688 for R-DISPUTE-PAUSE; D3/D4 builder (B-DUNB); D5 + #642; mobile lockout #352-#354 READY | none |
| 5 | Health Connect | #359-#361 dual APPROVE; #362-#364 READY -> lenses -> land as one -> flag flip | device pass before the clinic build; Play Health apps declaration filed 10-04 |
| 6 | Remainder | programs #355-#358, #312, #335, #339, #340 | none |
| 7 | Builds and review | not started | Supabase Pro on launch day 1; EAS stays on Free; Play reviewer accounts on the next APK build after steps 1-6; FCM V1 key, Apple Sign-in keys, POSTHOG_KEY confirm |

## 1. Owner rules (binding; verbatim where it matters)

- Doc weights: agent rules = LAW, autonomy doctrine = MENTALITY, model routing = PROCESS, his prompt + this file = FIRST PROMPT. Repo
  copies on tgp-agent-context main win over attachments, including this file: AGENT_RULES.md, MODEL_ROUTING.md,
  OPERATOR_STANDING_ORDERS.md, MERGE_DEPENDENCY_GUIDE.md (rules 1-12), DECISION_LOG.md (newest at the bottom).
- Every owner message starts with "Launch path: <n>/7 steps done | merged today <n> | deployed today <n> | open decisions <n> | credits
  used <n>/45k" (HIS last credits number; never 0 unless he said 0) and ends with "Your next step: ..." or "Nothing needed from you."
  No emojis, no exclamation marks. Short sections, plain words, numbered decisions with a recommended default. Escalate decisions,
  not chores.
- "ANYTHING LESS THAN HYPERSCALER QUALITY IS A DAY 1 BLOCKER / WALL CLOCK TIME IS KEY #1 RESOURCE / DO IT RIGHT, DO IT SMOOTH - SMOOTH
  IS FAST / I WANT MORE, NOT LESS FUNCTIONALITY IF THE CHOICE ARISES." Recurring packages: "LITERALLY MOST CRITICAL OF ALL"; never
  one-time-only. Don't cancel his scope.
- No spending without his word. Supabase Pro: he upgrades on launch day 1. EAS stays on Free (10-04 12:10).
- PR size (owner 12:33 PDT 10-04): any PR opened after 12:33:16 over 1,500 changed lines = automatic fail (replaces the 3,000 rule and
  the SIZE ASSESSMENT). Every PR open then is grandfathered (governance/PR_SIZE_GRANDFATHERED_2026-10-04.md) and keeps its 3,000
  ceiling (operator default). New split pieces (D2b/D2c, M5) must be under 1,500.
- One job = one agent = one or two PRs, then it ends. Concurrency is his call: 5 concurrent since 10:32 PDT 10-04.
- Never name the clinic partner anywhere (tgp-agent-context is PUBLIC). Copy: no first person. Branch protection changes need his
  exact words. Times only from `date` (America/Los_Angeles). Deleting leftover ci/* branches from old jobs: only on his word.
- Merge only audited exact heads with every required check green: gh pr merge N --merge --match-head-commit <full sha>. Standing deploy
  approval for audited main with green CI; -f migrations=apply-migrations ONLY when the release adds migrations or schema.
- Rule 12: a pure main merge where every PR file stays byte-identical needs only the operator MERGE-ONLY TREE CHECK (tree_check.sh +
  every required check green). Restacks onto another PR branch, conflict resolutions and fix rounds need both lenses at the exact head.
  Rule 11: a split stack lands as one.
- HOW HE WORKS (learned 10-04): he is on Windows. Never hand him terminal commands, and never ask him to paste a secret in chat: any
  API key goes through the secure credential form (request_credential). For dashboard work give the exact URL and the click path.
  Play Console: do not investigate the old app (deleted by Google 2026-09-30); he recreated it as com.growthproject.app.
- Pause/stop: stop launching, let in-flight CI finish, post drafts, snapshot, update this file, tell him. Never stop silently.

## 2. First 30 minutes (launch no agents until step 6)

For agent 120: same steps with handoffs/op-119/tools/{rebuild_sandbox.sh, verify_heads.sh, snapshot.sh}; ops/ restores from
wip/op119/ops-snapshot; lanes are ops/lanes119 (JOBS119.md, _COMMON_119.md). Steps as written for 119:


1. Sandbox (2 CPU, 7.9 GB RAM, 20 GB disk). In Computer bash with api_credentials=["github"]:
   `gh repo clone BradleyGleavePortfolio/tgp-agent-context /home/user/workspace/repos/tgp-agent-context && bash
   /home/user/workspace/repos/tgp-agent-context/handoffs/op-118/tools/rebuild_sandbox.sh`
   It clones backend and mobile (full blobs), restores ops/ from wip/op118/ops-snapshot, installs shared deps in the background.
2. `bash /home/user/workspace/ops/op118/verify_heads.sh`. Every MOVED row means a push after 118 stopped: read that PR's commits and
   comments since 12:00 PDT 10-04 before trusting section 3. A verdict at a head that has since moved is void.
3. Production: https://api.trygrowthproject.com/health and /readyz (Fly app backend-spring-lake-3890); latest fly-deploy run 37225983355
   released 3e9a9a75; _prisma_migrations unchanged since 10-03 (189 rows; read-only SQL via the Supabase connector, project
   rpyfdsgxxltzutgqeouk). Check whether StripeProcessedEvent has its first row yet (empty at 11:00 10-04).
4. Credentials: list_credentials. The owner kept his newest Stripe restricted key (user scope, host api.stripe.com; the exposed one is
   deleted). Use it only for Stripe configuration reads/writes; approve it only if it says requires_approval.
5. Make it yours: copy this file to handoffs/op-119/HANDOFF_AGENT_120.md; create ops/lanes119 (copy _COMMON_118.md to _COMMON_119.md,
   swap 118 -> 119 names); copy ops/op118/snapshot.sh to ops/op119/ with wip/op119/ops-snapshot; first snapshot.
6. Readback to the owner (scoreboard, what you verified, anything MOVED, first wave, decisions), then launch wave 1 (section 6)
   without waiting.

## 3. State by stack (rebuilt from GitHub 12:03 PDT 10-04; re-verified by agent 119 12:20-12:27: all heads and verdicts unchanged)

Sizes are changed lines. "RC" = REQUEST_CHANGES. Verdict comment ids are on the PRs; findings and Cs in ops/reports/<JOB>.md and
ops/op118/FOLLOWUPS.md.

| stack | PRs (head, size) | verdicts / state | next action |
|----|----|----|----|
| Fees (job one) | #681 e9650dc4 2,956; #682 70f879a2 2,999; #683 cc183e0a 2,959; #684 6b13af56 2,435; #697 88c72200 1,831; #685 c5e282fb 2,958; #686 8cb7b2d4 1,355 (top) | #681, #682 dual APPROVE. #683 FIX ROUND 16 READY (closes Sol B-683-7/B-683-8; Opus APPROVE was at the prior head); red by design: 9 tests in 3 suites that #684 carries. #684/#697/#685/#686 merge-only restacks READY (FR16/FR17). SIZE ASSESSMENT KEEP on #682, #683, #685: any further change moves tests up first | lens pairs (section 6), merge top-down as one, deploy |
| Recurring (most critical) | #678 77bce450 2,411; #679 8bbf4a41 2,932; #680 216489ff 2,766; #696 276610a3 1,910; #701 72eb096b 416 | All READY (B-RECUR6A #678/#679; B-RECUR6B #680 FR6, #696 FR6 with real test changes, #701 FR1). No lens at these heads | lens pairs can start now at these heads; after fees is final, operator restacks onto the fees top and both lenses run a short delta at the new heads; lands with sheet + #661 |
| #661 PaymentSheet | #661 f80f0088 2,843; #702 20d2eb4f 513 | dual APPROVE both | after fees deploy: refresh, short lens deltas, merge #702 into agent/clinic/b-secrets-3 first, update PR descriptions (C-661-13); conflict map vs recurring (2 files, 6 hunks) in ops/reports/B-RECUR6B-118.md |
| Payment sheet (mobile) | m#342 56f281ad 2,018; m#343 fd739d58 2,813; m#344 e7fcc5d2 2,086 | #342 Opus APPROVE, Sol RC (timeout claims no charge; zero-decimal amounts 100x too small); #343 RC both (Opus B-343-6 free-claim copy; Sol 3 B); #344 RC both (Sol B-344-1..4, Opus B-344-5/6) | B-SHEET2 (#342/#343), then B-SHEET3 (#344); entry text in JOBS118 "## B-SHEET2-118" |
| Trials | #671 c75002c9 2,291; #672 2690c07c 2,961; #673 5fdb5f5c 2,887; mobile #338 48b5e6b5 | #671 dual APPROVE; #672/#673 FIX ROUND 9 READY (Opus APPROVE at old heads); m#338 dual APPROVE (BEHIND) | lens pair T23; land after recurring with the C-656-1 #680 list |
| Coach | #674 f9e21a87 2,948; #676 ccd60bbc 2,981; #677 4799c6af 2,918 | #674, #676 RC both; #677 none | B-CM5 (JOBS118 QUEUED item 7), then lenses; mobile #345-#351 after deploy |
| Dunning | #687 38d9b3ab 2,974; #688 2368d5fa 2,976; #689 bb992fed 2,913; #690 06307883 2,913; #691 e0afe678 2,742; #642 4fee3c02 75 | #687 FR2 / #688 FR3 READY (B-DUNA). #689 RC both (B-689-5); #690 Sol RC, Opus APPROVE; #642 dual APPROVE (BEHIND) | B-DUNSPLIT: split #688 and build R-DISPUTE-PAUSE (section 9); then B-DUNB (D3/D4; pass the dispute event time as closedAt in D4); then lenses; FEATURE_DUNNING_V2 stays off until the pinned lockout-copy fix lands |
| Health Connect (mobile) | m#359 e0f3d2a7; m#360 fde1875e 2,812; m#361 574b32a8 1,793; m#362 b3bc0ce4 2,835; m#363 2858bac5 982; m#364 529ba345 2,937 | #359/#360/#361 dual APPROVE; #362 FR2, #363 restack, #364 FR2 READY (B-HC4) | lens pair #362+#364, then #363 delta; land as one; owner device pass; flag flip |
| Mobile lockout | m#352 ac244d22 2,341; m#353 05d84f27 2,520; m#354 f084cc0f 1,119 | READY | lens pair #352+#353, then #354 |
| Mobile coach setup / money | m#345 97c9005e 2,580; m#346 2baea5b8 2,609; m#347 3beab160 2,592; m#348 90501f84; m#349 35aa8163, m#350 6fb21216 (red by design); m#351 352d768e | #345/#346 READY; #347 needs a W3 fix round | lens pair #345+#346, then W3 builder |
| Remainder | programs m#355-#358 (no verdicts); m#335 641fe891 (dual APPROVE, BEHIND); m#312 8016a79e; m#339 8165ca95 (DIRTY); m#340 2e77dcb6 | | after the stacks above |

Fast-follow (decision 1 default): push #692-#693 (FCM key), Roman (#667-#670, #331), S-SCHED-2 (#634, #653, mobile #365-#367, #336),
annex (#655, #657-#660, mobile #337), #643/#650, mobile #341.

## 4. Critical path and owner to-do

Fees lenses -> merge fees as one -> deploy -> recurring restack + deltas, sheet builders, #661 refresh -> merge recurring + sheet +
#661 -> deploy -> trials -> deploy. Coach and dunning interleave once fees is on main. Health Connect lenses run in parallel (mobile,
no backend dependency).
Owner to-do (all critical-path items DONE 10-04: Stripe destination, Stripe retry rule = leave past-due, exposed key deleted, Play app
recreated, Health apps declaration, Data safety answers). Remaining, by his choice:
1. Launch day 1: upgrade Supabase to Pro (daily backups, no pausing).
2. Next APK build after steps 1-6: create the two Play reviewer accounts (play-review-coach@ / play-review-client@trygrowthproject.com,
   coach invites client, $0 package) and fill both App access sign-in sets.
3. Before the clinic build: HC device pass (privacy-link taps on Android 13 and 14+, Samsung flow).
4. Keys: FCM V1, Apple Sign-in, POSTHOG_KEY confirm.

## 5. Open decisions (recommended default first)

1. Day-1 scope: fast-follow as listed in section 3 (default).
2. LAUNCH_ONE_PAGER.md: approve as drafted (default).
3. #661 at 3,121 lines: enforced, tests moved to #702 (done on the default, reversible).
4. Delete leftover ci/* branches from 116 jobs (B-T12-116 x4, B-W2-116 x2) and wip/op116/B-W2-116-360: yes (default). Only on his word.
Closed 10-04: Stripe destination; credit cap 5A; R-DISPUTE-PAUSE (also closes the 118 FOLLOWUPS question on disputes on never-failed
recurring plans); agent cap 15 concurrent (12:28). Operator defaults taken and logged in ops/op118/FOLLOWUPS.md:
recurring narrower past_due exemption; deletion consumes only granted/own-card trials; HC Samsung row mirrors HC; privacy URL
https://app.trygrowthproject.com/privacy; Connect-destination webhook is a fast-follow.

## 6. Fleet and queue (cap 15 concurrent, owner 12:28 PDT 10-04)

Running since 12:30 PDT (handoffs/op-119/FLEET.md has the subagent ids; entries in handoffs/op-119/JOBS119.md):
fees lens pairs F3 (#683), F4 (#684 + #697), F56 (#685 + #686); recurring lens pairs R12 (#678 + #679), R34 (#680 + #696); trials
lens pair T23 (#672 + #673); builders B-SHEET2-119 (m#342/#343 + restack m#344), B-DUNSPLIT-119 (split #688 into D2a/D2b/D2c with
R-DISPUTE-PAUSE in D2c; #687 dispute copy), B-CM5-119 (#674/#676 + #677).
Queue as slots free: R5 pair (#701); HC pair (m#362/#364, then #363 delta); lockout pair; wizard pair; B-SHEET3-119 (m#344);
B-DUNB-119 (on the B-DUNSPLIT D2 top); coach M4 #677 pair; dunning D1-D4 + D5 (#691 + #642) pairs; programs; remainder.
Operator: as soon as fees has dual APPROVE at every head, land fees as one (rule 11) + deploy; merge-only restack recurring onto the
final fees top and ask the R12/R34 lenses (or fresh ones) for short deltas.

## 7. Operating playbook (116-118 lessons, made rules)

- One file of truth: this document, section 3 overwritten at every milestone; history in LAST_OPERATOR_STATE.md. Snapshot ops/ at
  every milestone (118 snapshotted about every 20 minutes; aim for the same).
- One builder per stack, bottom-up, until every piece is READY; then the stack's lens pair. Builders replay every prior probe from both
  lenses and self-check the money list (webhook order and redelivery, concurrency, terminal states, list pagination and completeness,
  currency, copy truth) before READY. Under review: A/B only; Cs go to FOLLOWUPS.
- Size headroom is the silent killer: #682 2,999, #688 2,976, #687 2,974, #683 2,959, #685 2,958, #672 2,961, #364 2,937. Before any fix
  round on these, tell the builder where tests move (the stacked tests-only PR) or split first.
- Builders hand the next builder their new top through ops/lanes118/notify/<stack>.txt; locks in ops/lanes118/locks/<stack>/.
- Cancel an agent only before its first push (check its report's HANDOFF section). A dead lens's draft is evidence for a fresh lens of
  the same model, never something the operator publishes.
- CI is the bottleneck (20 shared Actions jobs). Past about 20 queued runs, favor lenses over builders; run ops/ci_janitor.sh every loop.
- Credits: 14 agents used about 23k credits in 74 minutes (10:13-11:27 10-04); the owner then capped at 5. Ask him for the credits
  number at each milestone (only he sees it); report merges per hour and credits per merged PR in every status message.
- Deploy: gh workflow run fly-deploy.yml -R BradleyGleavePortfolio/growth-project-backend --ref main -f release_sha=<sha> -f confirm=deploy
  (+ -f migrations=apply-migrations only with migrations), then approve the pending `production` deployment via
  POST repos/.../actions/runs/<id>/pending_deployments (environment id from GET), then check /health. Never run fly-secrets-set.yml
  (it overwrites live config with April values).
- Loop every 10-15 minutes: ci_janitor -> mail/reports -> READY at green heads -> merge dual-APPROVE green exact heads (rule 11 for
  stacks) -> deploy -> refresh the next PR -> launch replacements (JOBS entry first) -> update this file, push, snapshot.

## 8. Sandbox facts

rebuild_sandbox.sh does the work (section 2). gh/git need bash api_credentials=["github"]; commit identity "Bradley Gleave"
<bradley@bradleytgpcoaching.com>. If gh run view hits an IP rate-limit 403, use gh api repos/<o>/<r>/actions/runs/<id>/jobs. Supabase:
connector, read-only execute_sql. Stop heavy work at 85% disk. Operator helpers: ops/op118/{verify_heads.sh, prdump.sh, state.py,
snapshot.sh}, ops/{tree_check.sh, ci_janitor.sh, heavy.sh}.

## 9. Binding rulings (consolidated)

From v8 (handoffs/op-117/HANDOFF_AGENT_118.md section 9): MRR and churned_30d exclude never-billed trials (separate trial count).
Cancel during a dispute cycle ends access now and never resolves the dispute. The policy makes no Sign in with Apple revocation claim
until the keys are set. Hosted Checkout activates only via checkout.session.completed. The never-entitled check is unified by dunning.
Recurring size plan: inert R2 code in #678, service tests in tests-only pieces (#696, #701). Trials #673 converges on one trial ledger
with recurring. Health Connect late-data and resumable import are a follow-up before the clinic Android build. Pending migration
prefixes keep their numbers (OR-113-4). Evidence reuse: each lens decides, for byte-identical code only. Fees fail closed on incomplete
Stripe lists. Full detail: handoffs/op-116/HANDOFF_AGENT_117.md section 7, _COMMON_116.md section 10, handoffs/op-117/JOBS117.md.

Added 10-04 (DECISION_LOG.md):
- Stop-and-drain to 5 concurrent agents (10:32).
- R-DISPUTE-PAUSE (12:01), verbatim: "If someone disputes one charge in a reccuring setup, they should have all billing paused and
  acess terminated - coaches should handle restarting access seperately - we need to get agent 119 to split that 3k PR into peices
  and get one of those to adress this directly".
  For the build: a dispute on any charge of a recurring plan (whether or not it ever failed a renewal) immediately pauses all billing
  for that plan and ends the client's access. No automatic restore when the dispute closes; the coach restarts access separately. This
  replaces the compressed dispute cycle (lock date) for recurring plans. One-time purchases are unchanged. OR-111-1 (coach alert with
  exact amounts, transfer reversal, forward-only netting) still applies. Dispute copy in #687 (client and coach) must match: access has
  ended, billing is paused, the coach decides on restarting. Work: split D2 #688 into pieces under 1,500 lines where possible, one
  piece building this rule with its own tests (webhook order and redelivery, concurrency, terminal states, won and lost disputes, the
  coach restart path); both lenses at the exact heads. The Stripe mechanism (pause_collection vs cancel) and the coach restart action
  are the builder's choice, recorded in the PR with the R138 gate.

## 10. Backlog to ticket (no PR yet)

C-680-7 SetupIntent lookup index (migration); first-payment notice duplicate key can abort the outer transaction; C-661-2 credential
backfill (deploy window, count rows first); C-661-10 index; dunning D1 email "your access stays on" vs the Day-10 lockout;
B-APPLE-REVOKE (after Apple keys); #700 legacy log baseline (306 sites) with the C-700-6 guard fix first; C-368-4 (backend column for
Apple confirmation); Connect-destination webhook (account.updated, capability.updated, payouts).

## 11. Production and accounts

Backend https://api.trygrowthproject.com (Fly app backend-spring-lake-3890), release 3e9a9a75 (10-04 11:55). Web
https://app.trygrowthproject.com (privacy, help/delete-account live). Supabase project rpyfdsgxxltzutgqeouk (Free plan). Stripe webhook
destination we_1UMt9WDUoC5CCVhShvAELVmI (https://api.trygrowthproject.com/api/v1/webhooks/stripe, 2024-09-30.acacia, 21 events +
transfer.canceled); old destinations we_1TQkBDDUoC5CCVhSzAXOsWyr and we_1TRduSDUoC5CCVhSBigPeCdt disabled. Play package
com.growthproject.app (mobile has Apple and Google sign-in through a web flow, so no signing-key registration is needed).
