# TGP Operator — current state (agent 119 -> agent 120)

Updated: 14:02 PDT 10-04 (from `date`). CURRENT-STATE document: agent 119 overwrites sections 0, 3, 5 and 6 at every milestone;
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

- Status 14:02 PDT (agent 119; FLEET.md has every verdict). 119 merges 0, deploys 0 so far. Cap 5 concurrent since 13:25.
  Running: B-HC5-119 (finishing; m#362-#364 READY), B-FEES19-119 (#684 B-684-12 refund-status race + Sol B-684-3 final send boundary;
  tests #697; restack #685/#686; scratch top+main proof), AUD-SOL-R34D-119 (#680/#696/#701), AUD-OPUS-S123-119 + AUD-SOL-S123-119
  (m#342-#344). Landing tooling: ops/op119/land_fees.sh (A = fast-forward piece branches + candidate on #681; B = merge). The old
  candidate wip/op119/land-fees 0bc3696d is dead (contains #684 9fb9c48f); rebuild = merge origin/main into the new #686 top + apply
  ops/reports/B-FEES18-119-no-pii-baseline.patch as its own commit; lenses then verdict #681 at that exact head.
  Next on free slots: AUD-SOL-T23D-119 (entry in JOBS119), builder for #701 B-701-1 (5 `as any`) once Sol R34D posts, fees pair on
  B-FEES19's heads, HC delta pair (m#362 FR3 73dbefbc, m#363 f62f1bbe, m#364 b261f218), coach pair (#674/#676/#677/#703), dunning
  pairs (#687/#688/#704/#705), B-LOCK2, B-WIZ2, B-DUNB.

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

## 3. State by stack (from GitHub at 14:02 PDT 10-04, agent 119; `python3 ops/op118/state.py backend|mobile <n..>` rebuilds it)

| stack | PRs (head, size) | verdicts / state | next action |
|----|----|----|----|
| Fees (job one) | #681 e9650dc4 2,956; #682 70f879a2 2,999; #683 cc183e0a 2,959; #684 9fb9c48f 2,679; #697 c2585c97 2,276; #685 a61d50f4 2,958; #686 30a118dd 1,355 (top) | DUAL APPROVE all except #684 (RC both: B-684-12 refund-status race; Sol B-684-3 final send boundary). #682/#683 red by design (tests #684 carries) | B-FEES19-119 running; then pair on #684/#697 (+#685/#686 restack check) + rebuilt landing candidate; land_fees.sh; deploy WITH migrations (20270210000000_s_fee_charge_settlement); Stripe endpoint we_1UMt9WDUoC5CCVhShvAELVmI add refund.updated |
| Recurring (most critical) | #678 09e159d8 2,594; #679 23d2c04c 2,943; #680 f267417a 2,779; #696 13c9a6c8 2,197; #701 d624144c 615 | #678/#679 DUAL APPROVE; #680/#696 Opus APPROVE (FR7), Sol R34D auditing; #701 Opus RC B-701-1 (5 `as any` -> R75 +1 on fees top) | after Sol R34D: #701 builder (tests typing); after fees lands: retarget #678 to main, merge-only restack, short deltas; HARD obligations C-680-18/19 to dunning |
| #661 PaymentSheet | #661 f80f0088 2,843; #702 20d2eb4f 513 | dual APPROVE both | after fees deploy: refresh, short deltas, lands with recurring |
| Payment sheet (mobile) | m#342 e3226f3b 2,207; m#343 691e0cf0 2,935; m#344 7e17d142 2,866 | FR3/FR3/FR4 READY (B-SHEET4) | S123 pair running; lands with recurring |
| Trials | #671 c75002c9; #672 62c2c066 2,968; #673 904b9642 2,947; #706 a3f01163 423 (tests); m#338 48b5e6b5 | #671 dual APPROVE; #672/#673/#706 Opus APPROVE (T23D); Sol T23D queued; m#338 dual APPROVE | Sol T23D; land after recurring as one |
| Coach | #674 8cc17809 2,975; #676 ecaf75fd 2,984; #677 6340993b 2,918; #703 d60a6d58 460 | FR4 READY (B-CM5); no lens at these heads | coach pair |
| Dunning | #687 c260a849 2,822; #688 f29fc201 2,440 (D2a); #704 276a9f60 694 (D2b); #705 279ec167 1,287 (D2c = R-DISPUTE-PAUSE); #689 bb992fed; #690 06307883; #691 e0afe678; #642 4fee3c02 | D1/D2a/D2b/D2c READY, no lens; #689 RC both; #690 Sol RC; #642 dual APPROVE | dunning pairs; B-DUNB (retarget #689 onto #705; carry C-680-18/19, end access + mark disputed before pausing) |
| Health Connect (mobile) | m#359 e0f3d2a7; m#360 fde1875e; m#361 574b32a8; m#362 73dbefbc 2,913; m#363 f62f1bbe 1,385; m#364 b261f218 2,937 | #359-#361 dual APPROVE; #362 FR3 / #363 / #364 READY (B-HC5) | HC delta pair; land as one; owner device pass |
| Mobile lockout | m#352 ac244d22; m#353 05d84f27; m#354 f084cc0f | RC both on #352/#353 (dispute copy vs R-DISPUTE-PAUSE + Sol Bs) | B-LOCK2 (D2c contract reason 'dispute_paused') |
| Mobile coach setup | m#345 97c9005e; m#346 2baea5b8; m#347 3beab160 | #345/#346 Opus APPROVE, Sol RC (B-345-1, B-346-3) | B-WIZ2 |
| Remainder | programs m#355-#358; m#335 641fe891 (dual APPROVE, BEHIND; touches navigators); m#312; m#339 (DIRTY); m#340 | | after the stacks above |

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
4. Delete leftover ci/* branches from 116 jobs: yes (default). Only on his word.
5. Failed refund after access ended: alert only, coach decides, no automatic restore (default).
6. Dispute inquiries (Stripe early warnings) also pause the plan: yes (B-DUNSPLIT default).
7. Full refund on a recurring plan: pause billing like R-DISPUTE-PAUSE, coach restarts (default; C-680-16).
Operator defaults taken 10-04 (agent 119): recurring past_due exemption removed (any write after the decline read redelivers);
#701 casts typed by a builder; C-680-18 hard obligation on whichever of recurring/dunning lands second, FEATURE_DUNNING_V2 off until
then; C-680-19 into the R-DISPUTE-PAUSE build; C-673-6 with C-673-4 in the #680 integration round; one "no longer offered" wording.

## 6. Fleet and queue (cap 5 concurrent, owner 12:49 PDT 10-04)

Running (14:02): B-HC5-119, B-FEES19-119, AUD-SOL-R34D-119, AUD-OPUS-S123-119, AUD-SOL-S123-119 (ids in FLEET.md).
Queue: AUD-SOL-T23D-119; B-RECUR8-119 (#701 typing) after Sol R34D; fees pair (FL2) on B-FEES19 heads + new landing candidate; HC delta
pair; coach pair; dunning pairs; B-LOCK2-119; B-WIZ2-119; B-DUNB-119; programs; remainder.

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
