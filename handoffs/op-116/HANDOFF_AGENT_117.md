# TGP Operator Handoff — Agent 117 (takeover prompt, written by operator agent 116)

Version 1: 2026-10-03 19:35 PDT. Agent 116 rewrites this file at every milestone, at least every two hours, and before any pause.
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

## 1. State at version 1 (19:35 PDT 10-03)

- Production backend = main d23fa31773f2e7f14781d243db35067d949f421a (deployed 11:57 PDT 10-03). Mobile main 367e6c48dac676151400d4d4b9959c4cc3c7586a.
  Supabase project rpyfdsgxxltzutgqeouk (org FREE plan): 188 migrations, latest 20270301000000; 20270307000000 (push) not applied.
- Scoreboard at 19:35: Launch path 0/7 | merged today 5 | deployed today 2 | open decisions 3 | credits used 0/45k (owner, 19:20).
- Agent 116 sent the readback at ~19:18 and the owner answered with the 15-agent go. Day-1 scope default stands (launch steps 1-7;
  push #692-#693, Roman, S-SCHED-2, annex = fast-follow) because he did not object; Supabase Pro yes/no still unanswered.
- 19:3x: operator 116 posted READY FOR AUDIT (+ SIZE ASSESSMENT over 1,500 lines) on all 41 split pieces in the launch stacks (fees,
  trials, coach backend, dunning backend, Health Connect, Programs, lockout, coach setup, coach Money, payment sheet). Recurring
  #678-#680 get theirs from B-RECUR-116's round. Log: handoffs/op-116/tools/post_ready.py (re-runnable, checks heads first).
- 19:28: update-branch on backend #664 and mobile #312 (merge-only refresh); they need a merge-only delta lens pair (queued job).

## 2. Fleet in flight (authoritative: handoffs/op-116/lanes/FLEET.md; jobs: handoffs/op-116/lanes/JOBS.md)

Fifteen agents launched 19:27 PDT, each on one or two PRs: privacy pair (#611, then #315 delta), fees three pairs (#681+#682,
#683+#684, #685+#686), coach Money pair (#674+#676), dunning pair (#687+#688), builders B-RECUR-116 (recurring #679/#680 round on the
Sol draft findings), B-661-116 (#661 round 3), B-CI-116 (new PR: jest out-of-memory fix in build-and-test). Rules every agent follows:
handoffs/op-116/lanes/_COMMON_116.md. Reports land in the operator sandbox at /home/user/workspace/ops/reports/<JOB>-116.md and on
GitHub as AUDIT / FIX ROUND comments (GitHub is the truth if the sandbox is gone).
If agent 116's session died, every subagent died with it: read each PR's latest AUDIT / FIX ROUND comment to see what finished.

## 3. Operator loop (what 116 does every 10-15 minutes)
1. `ci_janitor.sh` (cancel superseded runs); check the 20-job Actions cap.
2. Read finished agents' final answers and reports; update FLEET.md.
3. Merge every PR that has dual APPROVE at a green, current head (split stacks land as one: merge top piece down into the bottom piece,
   confirm the tree equals the audited top head, lenses post a merge-only delta on the bottom piece, merge the bottom into main).
4. After backend merges: deploy (`gh workflow run fly-deploy.yml -R BradleyGleavePortfolio/growth-project-backend --ref main -f
   release_sha=<full sha> -f confirm=deploy -f migrations=apply-migrations`, then `approve_deploy.sh <run id>`), verify /health,
   /readyz and _prisma_migrations.
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
confirm; EAS build approval (spend); Play Console Data safety + Health apps forms (116 drafts answers).

## 6. Lessons so far (agent 116)
- One or two PRs per agent (owner 19:25). Split stacks: lens pairs per two pieces in parallel; builders fix bottom-up with a stack lock.
- Evidence reuse (G09) is the lens's own decision per piece: byte-identical code its model already approved may rest on that evidence;
  deltas, seams and never-approved code get full depth.
- Background processes started inside a bash call die when the call returns unless started with `setsid nohup ... & disown`.
- check-runs include stale first attempts: always use the latest run per check name before calling anything red.
