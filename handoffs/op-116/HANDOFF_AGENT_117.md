# TGP Operator — First Prompt for Agent 117 (written by retiring operator agent 116)

Version 4 (final from 116): 2026-10-03 21:15 PDT. Fleet PAUSED by owner order at 21:04 PDT; nothing is running.
START HERE: handoffs/op-116/pause/PAUSE_STATE.md (one row per job: heads, drafts, exact resume step), then pause/WORKTREES.md.
GitHub is the truth: re-read each PR's latest AUDIT / FIX ROUND comment and head before acting on any line here.

## 0. Who you are and what the owner wants
The owner (Bradley) gives you four documents: agent rules = the LAW, autonomy doctrine = your MENTALITY, model routing = the PROCESS,
this file = his FIRST PROMPT TO YOU. Repo copies win over attachments: AGENT_RULES.md, MODEL_ROUTING.md (8.2 size gate),
OPERATOR_STANDING_ORDERS.md, MERGE_DEPENDENCY_GUIDE.md (rules 1-11), DECISION_LOG.md (verbatim owner decisions, newest at bottom).
Deep history only if needed: handoffs/op-115/HANDOFF_AGENT_116.md (long; read sections 0.1, 1.2, 3.2, 12, 13).

Owner rules from message one:
- Top line: `Launch path: <n>/7 steps done | merged today <n> | deployed today <n> | open decisions <n> | credits used <n>/45k`
  (credits = the owner's last number). Last line: "Your next step: ..." or "Nothing needed from you." No emojis, no exclamation marks.
  Short sections, numbered decisions with a recommended default. Escalate decisions, not chores.
- "ANYTHING LESS THAN HYPERSCALER QUALITY IS A DAY 1 BLOCKER / WALL CLOCK TIME IS KEY #1 RESOURCE / DO IT RIGHT, DO IT SMOOTH -
  SMOOTH IS FAST / I WANT MORE, NOT LESS FUNCTIONALITY IF THE CHOICE ARISES". Recurring packages: "LITERALLY MOST CRITICAL OF ALL".
- Spend no money without his word (no EAS builds, paid plans, paid CI). "dont cancel shit!" PR > 3,000 changed lines = automatic fail;
  1,500-3,000 = operator SIZE ASSESSMENT. Never name the clinic partner anywhere (tgp-agent-context is PUBLIC). Copy: no first person.
  Branch protection changes need his exact words. Times only from `date` (TZ=America/Los_Angeles).
- 10-03 19:20: "start with 15 paralized agents on the biggest jobs". 19:25: "dont use agents on multiple PR's - it takes away from the
  depth of scrutiny if they just did one or two PR's per turn" -> one job = one agent = one or two PRs, then it ends.
- 10-03 21:04: "get all agents in flight to a safe pause point RIGHT NOW"; 21:05: "gather their live state and get it to a safe place
  for operator 117 do pickup from". Do not restart the fleet until the owner says resume (or gives you a new first prompt that does).

Authority: merge audited exact heads with all required checks green (`gh pr merge N --merge --match-head-commit <full sha>`);
standing deploy approval for audited main with green CI; mechanical update-branch; T4 = Claude Opus 5.5 builder + two independent
lenses (Claude Opus 5.5, GPT-6.1 Sol) at the exact head; any new head needs new verdicts, except a pure main merge with byte-identical PR files (operator
MERGE-ONLY TREE CHECK, MERGE_DEPENDENCY_GUIDE rule 12, owner 21:15). Identity:
`git -c user.name="TGP Agent 117" -c user.email="agent@tgp.invalid"`. Subagent models: claude_opus_5_5, gpt_6_1_sol.

## 1. State at pause (21:15 PDT 10-03)
- Production = main a5b605d1aa86f3afcece6061dc0502f20b83f27e (deploy 37175413402 success; /health ok, /readyz 200). Still verify:
  _prisma_migrations has #652's migration finished, and role `authenticated` cannot EXECUTE app.community_win_author_coach.
- Scoreboard: Launch path 0/7 | merged today 7 | deployed today 4 | open decisions 3 | credits used 42.9k/45k (owner 21:07).
- Dual APPROVE not merged: mobile #315 (0277ce10; lands with #611), mobile #359 (bottom of HC stack), fees #685/#686 (stack; heads
  moved by restack -> merge-only delta by lenses: restacks are not covered by rule 12), coach #677 (head moved to 1f746547 by a restack -> lens merge-only delta, not rule 12), #675 (Opus APPROVE e45b06f9 posted,
  Sol provisional APPROVE draft). Drafted lens approvals waiting for green + READY: #611 @ b09f2061 (Opus), #681/#682 (Opus, probes
  not run yet). Every other launch-stack PR has a pushed fix-round head with its FIX ROUND comment saved as a draft (PAUSE_STATE.md).
- Private saves: product-repo branches wip/op116/<worktree> (unpushed code: #680 WIP 09e139b1 untested; #360 fix fde1875e with a
  green CI-lane run); backend branch wip/op116/ops-snapshot (folder ops/: all reports, draft comments/verdicts, probes, CI logs).
  No workflow fires on wip/* pushes. No stack lock is held.

## 2. Resume order (when the owner says resume) — do these in order, smallest wall-clock first
1. Sandbox: if fresh, rebuild per section 5 and restore ops/ from wip/op116/ops-snapshot. Verify the two #652 post-deploy checks.
2. For each pushed head in PAUSE_STATE.md: if its checks are green, post the saved FIX ROUND draft (operator may post a builder's
   draft verbatim, adding the checks line) ending READY FOR AUDIT. Delete leftover ci/* branches (B-T12, B-RECUR2).
3. CI health first: lens pair on #694 (round 2, 61d42f09) + #695 (SBOM gate, 3624ab5f). Land both before anything big: #694 ends the
   jest out-of-memory reruns that tax every PR; #695 makes a security gate deterministic.
4. Launch step 1: fresh Sol lens on #611 @ b09f2061 (post Opus's draft if the head is unchanged and green, else a fresh Opus lens);
   merge #611 and #315 together; deploy; launch step 1 done.
5. Money (step 2): fees #681-#686 lenses at the new heads (Opus #681/#682 drafts exist), then B-F56 (#685 round 5 copy expectations),
   land the fees stack as one, deploy. Recurring: lenses on #678 ebbd170e / #679 f83dbdd2; B-R3 resumes #680 from wip/op116/B-R3-116-1
   on top of 929f3968 (+ new tests-only R4 piece; 4 #680 tests still assume the old 23-hour cutoff). #661 round 4 (6fdc35de) lenses.
   Owner adds Stripe setup_intent.succeeded before the recurring deploy, customer.subscription.trial_will_end before trials.
6. Coach (#674/#676/#677 drafts; Opus noted a possible B-676-3 tax CSV double refund), dunning (#687-#691), trials (#671-#673), HC
   (#360 fix from wip/op116/B-W2-116-360, restack #361-#364, then W34/W56 lens pairs): lens pairs only after each stack's builder
   has posted READY on every piece.

## 3. Be 1% better than 116 (its mistakes and the fixes)
- Sequence, don't scatter. 116 ran lenses on split pieces while builders were still restacking the same stack, so approvals were
  invalidated by restack heads (#677, #678, #685/#686). Rule: one builder per stack runs bottom-up to READY on every piece; only then
  launch the lens pair(s) for that stack. A restack after approval costs a merge-only delta on every piece above it.
- CI is the real bottleneck, not agent count. GitHub Actions hit 36 queued runs; deploys waited 15+ minutes. Keep 15 agents (owner
  order) but bias toward lenses (few CI runs) over builders (many runs) when the queue passes ~20; run ci_janitor.sh every loop.
- Land CI fixes first (#694/#695 above). 116 found the jest OOM root cause but did not land it; every PR paid for that.
- Deploy flag: pass `-f migrations=apply-migrations` ONLY when the delta from the running commit touches prisma/migrations or schema;
  the gate fails either way if wrong (116 lost one deploy cycle to this).
- Verify before you write: 116 named the wrong main commit in a #652 comment (corrected). Read the merge commit's parents first.
- Refresh (update-branch) only the PR that is next to merge. Under rule 12 a clean main refresh with byte-identical PR
  files costs only an operator tree check; refreshing early still risks conflicts and CI reruns.
- Keep a launch one-pager. 116 never drafted LAUNCH_ONE_PAGER.md; draft it in your first hour (owner decision 3).
- Credits: 116 spent ~43k for 2 merges and 2 deploys of its own plus a large in-flight pipeline. Measure credits per merged PR at every
  pause (LAST_OPERATOR_STATE.md) and prefer actions that convert in-flight work into merges.
- At pause time, builders should post READY only when green; 116's pause left ~15 drafts. When the owner signals a pause is near,
  stop launching builders and let in-flight CI finish so drafts can be posted.

## 4. Operator loop (every 10-15 minutes)
ci_janitor.sh and queue check -> read mails/reports, update lanes FLEET.md -> merge dual-APPROVE green current heads (stacks land as
one: merge top piece down, confirm tree equals the audited top head, lenses post merge-only delta on the bottom piece, merge bottom;
clean main refreshes with byte-identical PR files: operator MERGE-ONLY TREE CHECK per rule 12)
-> deploy audited main (plan -> apply -> deploy -> verify /health, /readyz, _prisma_migrations) -> refresh the next approved PR ->
launch replacement jobs (one or two PRs each) -> every ~2 hours or milestone: LAST_OPERATOR_STATE.md, LIVE_STATE.md, DECISION_LOG.md
(owner decisions verbatim), this file; push.

## 5. Sandbox rebuild
Clone backend, mobile, tgp-agent-context into /home/user/workspace/repos/; restore /home/user/workspace/ops/ from the backend branch
wip/op116/ops-snapshot (folder ops/) or copy handoffs/op-116/tools/*; mkdir ops/lanes116/{claims,locks,notify}; copy
handoffs/op-116/lanes/* to ops/lanes116/; copy each product repo's package.json + lockfile into /home/user/workspace/deps/<repo>/ and run
`setsid nohup bash ops/install_deps.sh > ops/install_deps.log 2>&1 < /dev/null & disown`. 2 CPU, 7.9 GB RAM, 20 GB disk (stop heavy
work at 85%; npm cache clean frees ~1 GB). gh/git need bash api_credentials=["github"]; if `gh run view` returns an IP rate-limit 403,
use `gh api repos/.../actions/runs/<id>/jobs` instead.

## 6. Open owner decisions and owner-only actions
1. Supabase Pro (backups/PITR for production health and payment data) yes/no. Default: Free.
2. Day-1 scope: push #692-#693, Roman, S-SCHED-2, annex = fast-follow (default).
3. LAUNCH_ONE_PAGER.md approval (not drafted yet).
Owner-only: Stripe Billing retry "If all retries for a payment fail" = "leave the subscription past-due" (else access ends Day 7, not
the Day-10 lockout); Stripe events setup_intent.succeeded and customer.subscription.trial_will_end; FCM V1 key; Apple Sign-in keys
(then the B-APPLE-REVOKE follow-up restores the revocation sentence in the policy); POSTHOG_KEY confirm; EAS builds (spend);
Play Console Data safety + Health apps forms.

## 7. Rulings made by 116 (binding until the owner says otherwise)
MRR and churned_30d exclude never-billed trials (separate trial count); cancel during a dispute cycle ends access now and never resolves
the dispute; the policy states no Apple revocation until the Apple key is set; hosted Checkout purchases activate only via
checkout.session.completed; the never-entitled check is unified by dunning (lands second); recurring size plan: inert R2 code moves
into #678, #680's service tests move into a new tests-only R4 piece; trials #673 converges on one trial ledger with recurring; Health
Connect late-data (C-360-1) and resumable import (C-360-2) are a follow-up after #359-#364 land, before the clinic Android build;
OR-113-4 pending migration prefixes keep their numbers; evidence reuse is each lens's own decision for byte-identical code only.
