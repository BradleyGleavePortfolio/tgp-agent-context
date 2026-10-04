# TGP Operator — First Prompt for Agent 118

Version 8 (rewrite by retired agent 116 from agent 117's v7 of 2026-10-04 00:26 PDT). Written 2026-10-04 09:25 PDT.  
Agent 117's last recorded action was at 00:26 PDT. Treat it as STOPPED: if its session ended, every subagent it ran died with it.  
Every head and verdict below is as of 00:26 PDT or earlier. GitHub is the truth: verify before you act on any line.

## 0. Sixty-second summary

- Done: launch step 1 (privacy). #611 + mobile #315 were merged 21:41 PDT 10-03 and production was deployed at 643817b3 at 22:03.  
  CI fixes #694 (jest memory) and #695 (SBOM gate) merged; main = b644198b (CI-only changes since the deploy).

- Critical path now: land fees #681-#686 (+#697) as one -> deploy -> recurring #678-#680 (+#696, #701) -> deploy -> trials.  
  Recurring is stacked on fees, so every fees round forces a recurring restack. Landing fees stops that cascade. Fees is job one.

- Every other launch stack has pushed heads waiting for a builder round or lenses (section 3). Nothing is merged after 22:16 PDT 10-03.

- Owner actions gate the money deploys (section 4). Four decisions are open, each with a default (section 5).

## 1. Owner rules (binding; verbatim where it matters)

- Doc weights: agent rules = LAW, autonomy doctrine = MENTALITY, model routing = PROCESS, this file = his FIRST PROMPT TO YOU. Repo  
  copies on tgp-agent-context main win: AGENT_RULES.md, MODEL_ROUTING.md, OPERATOR_STANDING_ORDERS.md, MERGE_DEPENDENCY_GUIDE.md  
  (rules 1-12), DECISION_LOG.md (newest at the bottom).

- Every owner message starts with Launch path: <n>/7 steps done | merged today <n> | deployed today <n> | open decisions <n> | credits used <n>/45k. Use HIS last credits number; never write 0 unless he did. It ends with "Your next step: ..." or "Nothing needed from you."  
  No emojis, no exclamation marks. Short sections, numbered decisions with a recommended default. Escalate decisions, not chores.

- "ANYTHING LESS THAN HYPERSCALER QUALITY IS A DAY 1 BLOCKER / WALL CLOCK TIME IS KEY #1 RESOURCE / DO IT RIGHT, DO IT SMOOTH - SMOOTH  
  IS FAST / I WANT MORE, NOT LESS FUNCTIONALITY IF THE CHOICE ARISES." Recurring packages: "LITERALLY MOST CRITICAL OF ALL"; never  
  one-time-only. Don't cancel his scope.

- No spending without his word (EAS builds, paid plans, paid CI). Granted: Supabase Pro (21:31 10-03, he upgrades it in the dashboard).

- PR size: over 3,000 changed lines = automatic fail, with no grandfathering. 1,500-3,000 = operator SIZE ASSESSMENT.

- One job = one agent = one or two PRs, then it ends (19:25 10-03). Concurrency: ask him. 117's "15, then drain to 5" was a one-time  
  instruction for 117's waves.

- Never name the clinic partner anywhere (tgp-agent-context is PUBLIC). Copy: no first person. Branch protection changes need his  
  exact words. Times only from date (America/Los_Angeles).

- Merge only audited exact heads with every required check green: gh pr merge N --merge --match-head-commit <full sha>. Standing deploy  
  approval for audited main with green CI; -f migrations=apply-migrations ONLY when the release adds migrations or schema.

- Rule 12 (21:15 10-03): a pure main merge where every PR file stays byte-identical needs only the operator's MERGE-ONLY TREE CHECK  
  (tools/tree_check.sh + every required check green). Restacks onto another PR branch, conflict resolutions and fix rounds still need  
  both lenses at the exact head.

- Pause: stop launching, let in-flight CI finish so drafts can be posted, then snapshot (handoffs/op-116/pause/ is the model).

## 2. First 30 minutes (launch no agents until step 5)

1.  Rebuild the sandbox (section 8). Restore ops/ from backend branch wip/op117/ops-snapshot (23:03; newest), then wip/op116/ops-snapshot.

2.  Production: /health, /readyz on https://backend-spring-lake-3890.fly.dev; release = 643817b3; Supabase plan (still free at 23:5x).

3.  For 117's last five jobs (B-RECUR5B-117 #680/#696, B-TR2-117 #672/#673, B-661-R7-117 #661 + new tests PR, AUD-OPUS-F23-117 #682/#683,  
    B-CM3-117 #674/#676): read each PR's commits and comments since 00:00 PDT. A push with no FIX ROUND comment means unfinished work:  
    check CI and diff before trusting it. A verdict posted at a head that has since moved is void.

4.  Rebuild section 3 from GitHub (gh pr view N --json headRefOid,statusCheckRollup,comments) and overwrite it in your own handoff.

5.  Send the owner a readback: scoreboard, what you verified, what changed since 00:26, first wave (job -> PRs -> model), decisions.

## 3. State by stack (last known at 00:26 PDT 10-04; verify)

|  |  |  |  |  |
|----|----|----|----|----|
| stack | PRs (head) | verdicts at head | blocker | next action |
| Fees (step 2) | #681 e9650dc4, #682 a2051568 (r14), #683 33a9d83b, #684 7872a533, #697 b8b63e63 (F4b tests), #685 8dc2c2ed, #686 13c814f7 | #681 dual APPROVE; #682 Sol APPROVE (Opus F23 was running); #683 Sol RC 0/2/2 (B-683-1 cross-currency refund overstatement, B-683-5 notice-retry authority on timestamp collision); #684 RC earlier (pending refunds move the wrong money; re-check at head) | #683/#684 B findings; red by design: #682 4 tests, #683 3 suites/9 tests | one builder round on #683/#684, restack up, lens pairs, merge top-down as one, deploy |
| Recurring (step 2) | #678 b04ea692, #679 6760ee6a (r5A), #680 + #696 (B-RECUR5B running), #701 69afde25 (tests, base #696) | none at new heads; #679 had RC (abandoned trial checkout charged at trial end); #680 Opus approval withdrawn (late decline vs just-paid plan; delayed invoice.paid over a newer unpaid one) | lenses; fees landing; possible gap: clients with a saved card may be unable to start a trial (untested) | add a saved-card trial test to the round; lens pairs after the fees restack |
| #661 PaymentSheet | c7ee15f0, 3,121 lines | Sol RC 0/1/0 (B-661-3 list boundary: ten never-activated rows hide the activated owner) | OVER 3,000 (decision 3) | B-661-R7 was adding the fix plus a stacked tests-only PR: finish it so #661 is at most 3,000 lines, then both lenses |
| Trials (step 2) | #671 c75002c9, #672/#673 (B-TR2 running) | #671 dual APPROVE; #672 Sol RC 0/2/1 (superseded trial warnings; email retries across timeout) | round on #672/#673 | lenses; land after recurring; mobile #338 (dual APPROVE) lands with it; #673 uses the one trial ledger |
| Coach (step 3) | #675 MERGED; #674/#676 (B-CM3 round 3), #677 cdb627db | #674 Sol RC 0/2/2, #676 Sol RC 0/1/1 at round 2 heads; #677 Opus owed | round 3 | lenses; deploy; then mobile #345-#351 (S1-S3 RC by both lenses; N1-N4 none; #349/#350 red by design) |
| Dunning (step 4) | #687 f8e47bf4, #688 b17f514c, #689 bb992fed, #690 06307883, #691 e0afe678; #642 lands with this chain | none at heads; READY posted | lenses | lens pairs, land as one, deploy; then mobile #352-#354 (RC by both lenses) with the flag off |
| Health Connect (step 5) | mobile #359 e0f3d2a7, #360 fde1875e, #361 574b32a8, #362 439937c9, #363 38ea0f81, #364 a3206441 | #359 dual APPROVE; rest none | lenses | lens pairs (H2-H6); land as one; flag flip; late-data follow-up (C-360-1/2); fix the raw error log at useWearableConnections.ts:120 |
| Payment sheet | mobile #342-#344 | #342/#343 RC by both lenses ("nothing was charged" / "Payment received" before proof) | builder round (also map #661 reply codes) | lands with recurring |
| Follow-ups | backend #698 (export order + >500-row paging bug), #699 (SBOM fail-closed), #700 (no emails in logs; Apple steps iOS 18+); mobile #368 (DeleteAccountScreen copy) | none; READY | lenses | cheap pairs; #698 also ends a CI flake |
| Remainder (step 6) | Programs mobile #355-#358; mobile #335 (dual APPROVE, BEHIND), #312, #339, #340 | piece verdicts needed for #355-#358 | after the stacks above |  |

Fast-follow (owner day-1 default): push #692-#693 (FCM key), Roman (#667-#670, #331), S-SCHED-2 (#634, #653, mobile #365-#367, #336),  
annex (#655, #657-#660, mobile #337), #643/#650, mobile #341.

## 4. Critical path and owner-only actions

Fees -> [owner: Stripe webhook subscribes charge.refund.updated + refund.updated] -> deploy -> recurring + sheet -> [owner: setup_intent.succeeded; Billing retry "If all retries for a payment fail" = "leave the subscription past-due"] -> deploy -> trials -> [owner: customer.subscription.trial_will_end] -> deploy. Coach and dunning deploys can interleave once fees is on main.  
Other owner-only items: Supabase Pro upgrade (approved, plan still free), FCM V1 key, Apple Sign-in keys, POSTHOG_KEY confirm, EAS builds  
(spend), Play Console Data safety + Health apps forms. Ask for the Stripe items now: they gate step 2.

## 5. Open decisions (recommended default first)

1.  Day-1 scope: fast-follow as listed in section 3 (default).

2.  LAUNCH_ONE_PAGER.md: approve as drafted (default); update it with today's state.

3.  #661 at 3,121 lines (117 kept it with a size assessment): enforce the rule and move tests to the stacked tests-only PR (default).

4.  Delete leftover ci/* branches from 116 jobs (B-T12-116 x4, B-W2-116 x2) and wip/op116/B-W2-116-360 (its fix is on #360): yes  
    (default). A safety filter blocked 117; act only on his explicit word.

## 6. Backlog to ticket (no PR yet)

C-680-7 SetupIntent lookup index (migration); the first-payment notice duplicate key can abort the outer transaction; C-661-2  
credential backfill (deploy window, count rows first); C-661-10 index; dunning D1 email "your access stays on" vs the Day-10 lockout;  
B-APPLE-REVOKE (after the owner sets the Apple keys); saved-card trial gap (section 3).

## 7. Operating playbook (116 + 117 lessons, made rules)

- Keep this file a CURRENT-STATE document: overwrite section 3 at every milestone, and put history in LAST_OPERATOR_STATE.md. 117's v7  
  had three conflicting state sections (21:38 table, 23:05 agents, 00:26 log). Do not repeat that.

- Snapshot ops/ to wip/op<n>/ops-snapshot at every milestone, not only at pause. 117's last snapshot was 3.5 hours before it stopped.

- If credits or the session may end: stop launching, let CI finish, post drafts, snapshot, update this file. No silent stops.

- Sequence: one builder per stack runs bottom-up until every piece is READY; only then launch that stack's lens pair.

- Cut fix rounds: before READY, a builder replays every prior probe from both lenses and self-checks the money list: webhook order and  
  redelivery, concurrency, terminal states (refunded/disputed/canceled), list pagination and completeness, currency, copy truth.  
  Sol found new Bs in almost every money round.

- Freeze landed-next stacks: once a stack's lenses start, only A/B fixes go in; C items become follow-up PRs.

- CI is the bottleneck (20 shared Actions jobs). Past ~20 queued runs, favor lenses over builders; run ops/ci_janitor.sh every loop.

- Turn in-flight work into merges before starting new work; report merges per hour and credits per merged PR at each pause.

- Refresh only the PR next to merge. Read merge parents before you write about a commit. A dead lens's draft verdict is evidence  
  for a fresh lens of the same model, never something the operator publishes.  
  Loop (every 10-15 min): ci_janitor -> reports/mail -> post READY at green heads -> merge dual-APPROVE green current heads (stacks: rule 11) -> deploy (verify /health, /readyz, _prisma_migrations) -> refresh next -> launch replacements -> update this file and push.

## 8. Sandbox rebuild

Clone backend, mobile, tgp-agent-context into /home/user/workspace/repos/. In backend: git fetch origin 'refs/heads/wip/*:refs/remotes/origin/wip/*', then git -C repos/growth-project-backend archive origin/wip/op117/ops-snapshot ops | tar -x -C /home/user/workspace.  
cp -n handoffs/op-116/tools/* into ops/; lanes from handoffs/op-117/{JOBS117.md,_COMMON_117.md}. Copy each product repo's package.json  
and lockfile to /home/user/workspace/deps/<repo>/; run setsid nohup bash ops/install_deps.sh > ops/install_deps.log 2>&1 < /dev/null & disown. 2 CPU, 7.9 GB RAM, 20 GB disk (stop heavy work at 85%). gh/git need bash api_credentials=["github"]; if gh run view returns an IP rate-limit 403, use `gh api repos/<o>/<r>/actions/runs/<id>/jobs`. Supabase: connector, read-only execute_sql.

## 9. Binding rulings (consolidated)

MRR and churned_30d exclude never-billed trials (separate trial count). Cancel during a dispute cycle ends access now and never resolves  
the dispute. The policy makes no Sign in with Apple revocation claim until the keys are set. Hosted Checkout activates only via  
checkout.session.completed. The never-entitled check is unified by dunning (lands second). Recurring size plan: inert R2 code moves into  
#678, service tests go to tests-only pieces (#696, #701). Trials #673 converges on one trial ledger with recurring. Health Connect  
late-data and resumable import are a follow-up before the clinic Android build. Pending migration prefixes keep their numbers (OR-113-4).  
Evidence reuse: each lens decides, for byte-identical code only. Fees: fail closed on incomplete Stripe lists (round 14). #611 must be  
deployed before any mobile build containing #315 ships (done 22:03).  
Full detail: handoffs/op-116/HANDOFF_AGENT_117.md section 7, _COMMON_116.md section 10, handoffs/op-117/JOBS117.md.

History: 117's chronological log (v1-v7) stays in git history of handoffs/op-117/HANDOFF_AGENT_118.md and LAST_OPERATOR_STATE.md.
