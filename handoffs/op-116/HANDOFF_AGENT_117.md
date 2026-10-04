# TGP Operator Handoff — Agent 117 (takeover prompt, written by operator agent 116)

Version 3: 2026-10-03 21:09 PDT — FLEET PAUSED by owner order at 21:04 PDT. START HERE: handoffs/op-116/pause/PAUSE_STATE.md, then pause/WORKTREES.md.
The newest version on main wins. If the timestamp above is more than about two hours old, agent 116 may have stopped mid-run:
verify everything on GitHub before trusting a line here.

## 0. Your first prompt

The owner (Bradley) will give you four documents: the agent rules (the LAW), the autonomy doctrine (your MENTALITY), the model routing
document (the PROCESS) and this file (his FIRST PROMPT TO YOU). Repo copies win over attachments when they differ: AGENT_RULES.md
(EFFECTIVE 2026-09-18; the docx header "PROPOSED, NOT EFFECTIVE" is pre-adoption), MODEL_ROUTING.md (with 8.2 PR size gate),
OPERATOR_STANDING_ORDERS.md, MERGE_DEPENDENCY_GUIDE.md (rules 1-11). G05 identity is superseded (DECISION_LOG 2026-09-28): identity is
not a gate. Deep history: handoffs/op-115/HANDOFF_AGENT_116.md (sections 0.1 launch path, 1.2 owner rules, 3.2 rulings, 9 key facts,
12 split program, 13 operating lenses). Older product decisions: handoffs/op-114/LEDGER-72H.md.

### 0.1 Owner rules you must follow from your first message

- Top line of every owner message: `Launch path: <n>/7 steps done | merged today <n> | deployed today <n> | open decisions <n> | credits used <n>/45k`
  (the owner reports credits; use his last number). Last line: "Your next step: ..." or "Nothing needed from you."
- No emojis, no exclamation marks. Escalate decisions, not chores. Be brief and structured (he praised the 116 readback structure:
  scoreboard, short sections, numbered decisions with a recommended default).
- "ANYTHING LESS THAN HYPERSCALER QUALITY IS A DAY 1 BLOCKER / WALL CLOCK TIME IS KEY #1 RESOURCE / DO IT RIGHT, DO IT SMOOTH - SMOOTH
  IS FAST / I WANT MORE, NOT LESS FUNCTIONALITY IF THE CHOICE ARISES". Recurring packages are "LITERALLY MOST CRITICAL OF ALL".
- Spend no money without his word (no EAS builds, no paid plans, no paid CI). "dont cancel shit!" (do not cancel his scope).
- PR size: over 3,000 changed lines = automatic fail; 1,500-3,000 = operator SIZE ASSESSMENT at first READY FOR AUDIT.
- Never name the clinic partner in any repo (tgp-agent-context is PUBLIC). Copy: no first person. Branch-protection changes need his
  exact words. Take every time from `date` (TZ=America/Los_Angeles).
- NEW 2026-10-03 19:20 PDT (verbatim): "start with 15 paralized agents on the biggest jobs" and "Can you actively, confidently,
  correctly takeover for the now stopped and retired agent 115?" and "can you, periodically, create the takeover prompt for agent 117?"
- NEW 2026-10-03 19:25 PDT (verbatim): "dont use agents on multiple PR's - it takes away from the depth of scrutiny if they just did one
  or two PR's per turn". Every agent = one job = one or two PRs, then it ends; the operator launches a fresh agent for the next head.

### 0.2 Authority you inherit
Push and merge audited exact heads with all required checks green: `gh pr merge N --merge --match-head-commit <full sha>`. Standing
deploy approval for audited main with green CI (plan -> apply -> deploy -> verify). Mechanical update-branch is operator work. T4 =
Claude Opus 5.5 builder + two independent lenses (Claude Opus 5.5 and GPT-6.1 Sol) at the exact head; a new head (even a pure main
merge) needs new verdicts. Commit identity: `git -c user.name="TGP Agent 117" -c user.email="agent@tgp.invalid"`.

## 1. State at version 2 (20:37 PDT 10-03)

- Production backend = main d23fa31773f2e7f14781d243db35067d949f421a until the in-flight deploy run 37174286396 (release f57baba3, #664,
  no migrations) finishes; then deploy main a5b605d1aa86f3afcece6061dc0502f20b83f27e (#652, HAS a migration: migrations=apply-migrations;
  post-deploy check that `authenticated` can no longer execute app.community_win_author_coach, C-652-1). Mobile main 367e6c48.
- Merged today by 116: backend #664 (20:01, f57baba3) and #652 (20:31, a5b605d1). Scoreboard: Launch path 0/7 | merged today 7 |
  deployed today 2 (third in flight) | open decisions 3 | credits used: owner's last number.
- Launch step 1 privacy: #611 FIX ROUND 8 at 357c40fe audited by AUD-OPUS-PRIV2 / AUD-SOL-PRIV2; 20:31 update-branch -> #611 acf9ff0f
  and mobile #315 -> 0277ce10 (same lenses post merge-only deltas; #611 + #315 merge together).
- Step 2 money: fees #685/#686 dual APPROVE; #681-#684 in fix rounds (B-F12, B-F34; restack by stack lock "fees"); recurring #678/#679
  Opus APPROVE (Sol R12 auditing), #680 lenses auditing; #661 round 4 (B-661-R4). Trials #671/#672 round (B-T12).
- Step 3 coach: #677 dual APPROVE; #675 FIX ROUND 1 e45b06f9 (Opus CM3 auditing; Sol owed); #674/#676 round (B-CM1; ruling MRR excludes
  trialing subscriptions plus a separate trial count).
- Step 4 dunning: #687/#688 round (B-D12), #689/#690 round (B-D34; ruling: cancel during a dispute cycle ends access now).
- CI: #694 (jest OOM root cause: ts-jest type-checking against 24 MB Prisma typings) Opus APPROVE / Sol RC -> B-CI2 round 2 + new SBOM gate
  PR (scripts/ci/assert-prod-sbom.sh pipe check lets a banned tool through intermittently). Land #694 early: it ends the OOM reruns.
- Step 5 Health Connect: AUD-OPUS-W12 on mobile #359/#360; Sol W12 and W34/W56 pairs queued.

## 2. Fleet in flight (authoritative: handoffs/op-116/lanes/FLEET.md; jobs: handoffs/op-116/lanes/JOBS.md)

Fifteen agents in flight at all times, each on one or two PRs; FLEET.md lists every job id, model, PRs, subagent id, start time and
result. Queued order (JOBS.md "QUEUED JOBS" plus FLEET.md notes): Sol lens for #675/#676; B-F56 (#685 round 5 copy expectations) after the
fees restack; AUD T3 #673 and AUD D5 #691 after restacks; fresh lens pairs for every fix-round head; merge-only pair #642 + mobile #312;
B-335 + B-FLAG; B-ADMIN-GUARD (pre-existing admin guard pair makes owner admin routes unreachable); HC W12 Sol, W34, W56; lockout L12/L3;
Programs G12/G34; coach setup S12/S3; coach Money N12/N34; sheet P12/P3; B-339; B-T3 (#673 integrates with recurring #680's one-trial
check); mobile push route ClientPackages for the trial notice; C-679-1/C-679-2 follow-up; B-APPLE-REVOKE after the owner sets the Apple key.
Rules every agent follows: handoffs/op-116/lanes/_COMMON_116.md. Reports: /home/user/workspace/ops/reports/<JOB>-116.md and GitHub
AUDIT / FIX ROUND comments (GitHub is the truth if the sandbox is gone). If agent 116's session died, every subagent died with it.

## 3. Operator loop (what 116 does every 10-15 minutes)
1. `ci_janitor.sh` (cancel superseded runs); check the 20-job Actions cap.
2. Read finished agents' final answers and reports; update FLEET.md.
3. Merge every PR that has dual APPROVE at a green, current head (split stacks land as one: merge top piece down into the bottom piece,
   confirm the tree equals the audited top head, lenses post a merge-only delta on the bottom piece, merge the bottom into main).
4. After backend merges: deploy (`gh workflow run fly-deploy.yml -R BradleyGleavePortfolio/growth-project-backend --ref main -f
   release_sha=<full sha> -f confirm=deploy [-f migrations=apply-migrations ONLY if the delta from the running commit touches
   prisma/migrations or schema; the gate fails either way if wrong]`, then `approve_deploy.sh <run id>`), verify /health, /readyz and
   _prisma_migrations.
5. Refresh the next approved PR (one backend, one mobile at a time) with update-branch.
6. Launch replacement jobs from JOBS.md "QUEUED JOBS" in order, keeping 15 in flight, one or two PRs each.
7. Every ~2 hours or at a milestone: update LAST_OPERATOR_STATE.md and this file; push to tgp-agent-context main.

## 4. Sandbox rebuild (fresh sandbox)
Clone the three repos into /home/user/workspace/repos/; copy handoffs/op-116/tools/* to /home/user/workspace/ops/ (ci-lane/ and
split/ subfolders too); mkdir ops/{lanes116/{claims,locks,notify},reports,cache,aud-116}; copy handoffs/op-116/lanes/* to
ops/lanes116/; copy package.json + package-lock.json of each product repo main into /home/user/workspace/deps/<backend|mobile>/ and run
`setsid nohup bash ops/install_deps.sh > ops/install_deps.log 2>&1 < /dev/null & disown` (writes READY markers). Sandbox: 2 CPU,
7.9 GB RAM, 20 GB disk; all heavy commands through ops/heavy.sh. gh/git need bash api_credentials=["github"].

## 5. Open owner decisions (ask once, briefly)
1. Supabase Pro (backups/PITR for production health and payment data) yes/no. Default if unanswered: stay on Free, policy text is
   plan-agnostic (O-611-5).
2. Day-1 scope (push #692-#693, Roman, S-SCHED-2, annex): default fast-follow after launch steps 1-7.
3. LAUNCH_ONE_PAGER.md approval (agent 116 drafts it during this run).
Owner-only actions pending: Stripe webhook events `setup_intent.succeeded` (before recurring deploy) and
`customer.subscription.trial_will_end` (before trials deploy); FCM V1 key (push); Apple Sign-in keys (APPLE_AUDIENCES); POSTHOG_KEY
confirm; EAS build approval (spend); Play Console Data safety + Health apps forms (116 drafts answers); Stripe Billing retry setting
"If all retries for a payment fail" must stay "leave the subscription past-due" (otherwise access ends Day 7, not at the Day-10 lockout);
C-661-2 credential cleanup SQL on finished ClientPurchase rows (operator runs in a deploy window after #661 merges; check row count first).

## 6. Lessons so far (agent 116)
- One or two PRs per agent (owner 19:25). Split stacks: lens pairs per two pieces in parallel; builders fix bottom-up with a stack lock.
- Evidence reuse (G09) is the lens's own decision per piece: byte-identical code its model already approved may rest on that evidence;
  deltas, seams and never-approved code get full depth.
- Background processes started inside a bash call die when the call returns unless started with `setsid nohup ... & disown`.
- check-runs include stale first attempts: always use the latest run per check name before calling anything red.
- Deploy gate: migrations=apply-migrations only when the delta has migrations; run 37173413080 failed at the migration-delta gate for #664.
- Rulings 116 made: MRR excludes trials (+trial count); cancel in a dispute cycle ends access now; #611 must not claim Apple revocation
  until the owner sets the Apple key; hosted Checkout purchases activate only via checkout.session.completed (B-661-5).
- Update-branch an approved PR only when it is next to merge; a stale-but-audited head costs one merge-only delta, a refresh mid-queue costs two.
