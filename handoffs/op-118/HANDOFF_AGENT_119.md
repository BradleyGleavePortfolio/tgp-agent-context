# TGP Operator — current state (agent 118; becomes the first prompt for agent 119)

Updated: 09:48 PDT 10-04 (from `date`). CURRENT-STATE document: section 3 is overwritten at every milestone; history goes to
LAST_OPERATOR_STATE.md. GitHub is the truth: verify every head and verdict there before acting on any line here.

## 0. Summary

Scoreboard: Launch path 1/7 steps done | merged today 0 | deployed today 0 | open decisions 4 | credits used 0/45k (owner's last
number, 10-03 21:20; ask for the current one).
Agent 117 retired (last GitHub action 00:56 PDT 10-04; it did not pause cleanly; all its agents are dead). Agent 118 took over 09:31.
Production unchanged since 22:03 10-03 (backend 643817b3). Nothing merged since #695 (22:16 10-03). Wave 1 (section 6): 15 agents launched 09:47-09:52.

## 1. Owner rules

Section 1 of handoffs/op-117/HANDOFF_AGENT_118.md (v8) stays binding verbatim, plus the owner's 10-04 09:31 message:
- Agent rules = LAW; autonomy doctrine = MENTALITY; model routing = PROCESS. Repo copy on main wins over attachments.
- Every message to the owner starts with "Launch path: <n>/7 steps done | merged today <n> | deployed today <n> | open decisions <n> |
  credits used <n>/45k" (his last number; never 0 unless he said 0) and ends with "Your next step: ..." or "Nothing needed from you."
- Up to 15 agents in parallel; one job = one agent = one or two PRs, then it ends.
- Order of work: (1) fees #681-#686 + #697 as one stack (job one); (2) deploy, then recurring #678-#680 + #696 + #701 with mobile sheet
  #342-#344, and #661; (3) deploy, then trials #671-#673 + mobile #338; (4) coach, then dunning (+#642), then Health Connect, then the
  remainder. Cheap lens pairs on #698, #699, #700, mobile #368 whenever a slot is free. Recurring is most critical of all; never
  one-time-only.
- One builder per stack, bottom-up, until every piece is READY; only then that stack's lens pair. Builders replay every prior probe from
  both lenses and self-check the money list before READY. Under review: A/B fixes only; C items become follow-up PRs.
- Rule 12 (pure main merge, every PR file byte-identical): operator MERGE-ONLY TREE CHECK (ops/tree_check.sh + all required checks
  green). Restacks, conflict fixes, fix rounds: both lenses at the exact head. Deploy with -f migrations=apply-migrations ONLY when the
  release adds migrations or schema changes. Refresh only the PR next to merge.
- Snapshot ops/ to backend branch wip/op118/ops-snapshot at every milestone. If credits or the session may end: stop launching, let CI
  finish, post drafts, snapshot, update this file. Never stop silently. Report merges per hour and credits per merged PR.

## 2. Production (verified 09:33-09:45 PDT 10-04)

https://backend-spring-lake-3890.fly.dev: /health 200 ok, /readyz 200 db up. Release 643817b3586e27ad95cc3c519733fc14d0aaafde
(fly-deploy run 37178577858, success). _prisma_migrations 189 rows, 0 unfinished, latest
20270301000000_notification_zone_provenance_reminder_generation. Backend main b644198b (CI-only since the deploy: #694, #695). Mobile
main 7fdb629a. Supabase org plan: free (Pro approved; owner upgrades in the dashboard). CI queue empty at 09:45.

## 3. State by stack (rebuilt from GitHub 09:40-09:55 PDT 10-04)

Sizes are changed lines (additions + deletions). "old" = verdict at an earlier head (void for merging).

| stack | PRs (head, size) | verdicts at head | blocker | next action |
|----|----|----|----|----|
| Fees (job one) | #681 e9650dc4 2,956; #682 a2051568 2,997; #683 33a9d83b 2,526; #684 7872a533 2,435; #697 b8b63e63 1,837 (F4b tests); #685 8dc2c2ed 2,958; #686 13c814f7 1,355 | #681 dual APPROVE. #682 Sol APPROVE 0/0/0, Opus RC 0/1/3 (B-682-9 banned R75 tokens in the round-14 test). #683 Sol RC 0/2/2 (B-683-1 deferred-fee currency switch; B-683-5 retry flag cleared on same-instant notice failure), Opus RC 0/1/4 (concurs B-683-1; B-683-5 as C). #684/#697: none (round 13 unaudited). #685/#686: old dual APPROVE (restacked since) | B-682-9, B-683-1, B-683-5. Red by design: #682 4 tests, #683 3 suites/9 tests | B-FEES15-118 round, restack up, lens pairs, merge top-down as one (rule 11), owner Stripe refund events, deploy |
| Recurring (most critical) | #678 b04ea692 1,650; #679 6760ee6a 2,945; #680 9621457e 2,529; #696 5225e078 1,654 (tests); #701 67905b43 416 (tests, base #696) | #678 Sol APPROVE (Opus old APPROVE). #679 Sol RC 0/3/1 (B-679-7 deletion fence, B-679-8 rejected-bind exclusion, B-679-10 null SetupIntent = saved-card trial gap). #680, #696, #701: none at head | #679 Bs; dead-lens probes fail at head: Opus B-678-2, B-679-10; Sol B-680-2 residual, B-680-5 x2 | B-RECUR6A-118 (#678/#679), then B-RECUR6B-118 (#680/#696/#701), restack on fees, lens pairs |
| #661 PaymentSheet | #661 f80f0088 2,843; #702 20d2eb4f 513 (tests, base #661) | none at head (FIX ROUND 7 closes Sol B-661-3; operator FIX ROUND 8 moved one spec to #702 for size, integrated tree unchanged) | lenses | AUD-*-661-118 running; land as one (rule 11) with recurring |
| Trials | #671 c75002c9 2,291; #672 c5e7ed8e 2,977; #673 df76889f 2,627 | #671 dual APPROVE; #672/#673 none (FIX ROUND 8 READY) | lenses | AUD-*-T23-118; land after recurring with the C-656-1 #680 list; mobile #338 (dual APPROVE, BEHIND) |
| Coach | #674 39653f80 2,859; #676 fbd6402c 2,981; #677 ed1546b6 2,918 | none at head | B-CM3-117 pushed fixes, died before FIX ROUND comments (unfinished) | B-CM4-118 verifies and posts FIX ROUND 3, then lenses; mobile #345-#351 after deploy |
| Dunning | #687 f8e47bf4 2,717 (BEHIND); #688 b17f514c 2,926; #689 bb992fed 2,913; #690 06307883 2,913; #691 e0afe678 2,742; #642 4fee3c02 75 (dual APPROVE, BEHIND) | none at heads (old RCs answered by FIX ROUND 1-3). All CI green (old red runs are superseded) | lenses | AUD-*-D12-118 now; D34 and D5 queued; mobile #352-#354 after |
| Health Connect | mobile #359 e0f3d2a7 (dual APPROVE); #360 fde1875e 2,812; #361 574b32a8; #362 439937c9; #363 38ea0f81; #364 a3206441 2,882 | #360 old (Opus APPROVE, Sol RC); rest none; FIX ROUND 1 READY on all | lenses | pairs H2+H3, H4+H5, H6; land as one; flag flip |
| Payment sheet (mobile) | #342 72821495 1,685 (BEHIND); #343 af984441 2,438; #344 f629e0f9 2,079 | #342/#343 RC by both lenses | copy before proof; #661 reply codes | B-SHEET-118; lands with recurring |
| Mobile coach setup / money | #345 a4e49588; #346 4522eb8e; #347 ea2c72d1; #348 90501f84; #349 35aa8163, #350 6fb21216 (red by design); #351 352d768e | #345/#346 RC by both lenses; rest none | builder round | B-WIZ-118 (#345/#346) |
| Mobile lockout | #352 58b80914 (Opus APPROVE, Sol RC 0/1/0); #353 e22acc84 (RC both); #354 37ed3d56 | | builder round | B-LOCK queued (after dunning) |
| Follow-ups | #698 ecf8da57 467; #699 40ce1757 221; #700 66569a61 936; mobile #368 2216ad1d 112 | none; READY | lenses | AUD-*-FU1-118 (#698/#699), AUD-*-FU2-118 (#700/#368) |
| Remainder | mobile programs #355-#358 (none); #335 641fe891 (dual APPROVE, BEHIND); #312 8016a79e (approvals old at f8375ca6); #339 8165ca95 (DIRTY, Sol RC); #340 2e77dcb6 (Sol RC old) | | | after the stacks above |

Fast-follow (decision 1 default): push #692-#693 (FCM key), Roman (#667-#670, #331), S-SCHED-2 (#634, #653, mobile #365-#367, #336),
annex (#655, #657-#660, mobile #337), #643/#650, mobile #341.

## 4. Critical path and owner-only actions

Fees -> [owner: Stripe webhook subscribes charge.refund.updated + refund.updated] -> deploy -> recurring + sheet + #661 -> [owner:
setup_intent.succeeded; Billing retry "If all retries for a payment fail" = "leave the subscription past-due"] -> deploy -> trials ->
[owner: customer.subscription.trial_will_end] -> deploy. Coach and dunning deploys interleave once fees is on main.
Other owner-only items: Supabase Pro upgrade (plan still free), FCM V1 key, Apple Sign-in keys, POSTHOG_KEY confirm, EAS builds (spend),
Play Console Data safety + Health apps forms.

## 5. Open decisions (recommended default first)

1. Day-1 scope: fast-follow as listed in section 3 (default).
2. LAUNCH_ONE_PAGER.md: approve as drafted (default).
3. #661 at 3,121 lines: enforce and move tests to stacked tests-only PR #702 (default; proceeding on the default, reversible).
4. Delete leftover ci/* branches from 116 jobs (B-T12-116 x4, B-W2-116 x2) and wip/op116/B-W2-116-360 (its fix is on #360): yes
   (default). Only on the owner's explicit word.

## 6. Agents in flight (wave 1: 15 agents launched 09:47-09:52 PDT 10-04; ids in ops/op118/FLEET.md; jobs in ops/lanes118/JOBS118.md, snapshot wip/op118/ops-snapshot)

| job | model | PRs |
|----|----|----|
| B-FEES15-118 | Claude Opus 5.5 | #682, #683 (+ merge-only restack #684 -> #697 -> #685 -> #686) |
| B-RECUR6A-118 | Claude Opus 5.5 | #678, #679 |
| AUD-OPUS-T23-118 / AUD-SOL-T23-118 | Claude Opus 5.5 / GPT-6.1 Sol | #672, #673 |
| B-CM4-118 | Claude Opus 5.5 | #674, #676 (+ #677) |
| AUD-OPUS-FU1-118 / AUD-SOL-FU1-118 | Claude Opus 5.5 / GPT-6.1 Sol | #698, #699 |
| AUD-OPUS-FU2-118 / AUD-SOL-FU2-118 | Claude Opus 5.5 / GPT-6.1 Sol | #700, mobile #368 |
| B-SHEET-118 | Claude Opus 5.5 | mobile #342, #343 (+ #344) |
| AUD-OPUS-D12-118 / AUD-SOL-D12-118 | Claude Opus 5.5 / GPT-6.1 Sol | #687, #688 |
| B-WIZ-118 | Claude Opus 5.5 | mobile #345, #346 (+ #347) |
| AUD-OPUS-661-118 / AUD-SOL-661-118 | Claude Opus 5.5 / GPT-6.1 Sol | #661 f80f0088, #702 20d2eb4f |

Queued: B-RECUR6B-118; fees/recurring/coach/sheet lens pairs after their builders; D34, D5 (+#642); HC pairs;
B-LOCK; wizard pair; programs.

## 7. Backlog to ticket (no PR yet)

C-680-7 SetupIntent lookup index (migration); first-payment notice duplicate key can abort the outer transaction; C-661-2 credential
backfill (deploy window, count rows first); C-661-10 index; dunning D1 email "your access stays on" vs the Day-10 lockout;
B-APPLE-REVOKE (after Apple keys); #700 out-of-scope items (Prisma validation errors quoting arguments; macros/exercise names in logs).

## 8. Sandbox rebuild

As v8 section 8, but restore ops/ from backend branch wip/op118/ops-snapshot (fall back to wip/op117/ops-snapshot), lanes from
handoffs/op-118/{JOBS118.md,_COMMON_118.md}. Operator helpers: ops/op118/{state.py,prdump.sh}. Clone without --filter=blob:none
(agents need local blobs).

## 9. Binding rulings

Unchanged from v8 section 9 (handoffs/op-117/HANDOFF_AGENT_118.md).
