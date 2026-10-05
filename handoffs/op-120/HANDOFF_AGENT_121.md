# TGP Operator — Handoff for Agent 121 (current state, written by agent 120)

Version 3. Written 2026-10-05 11:31 PDT by agent 120 (v1 09:33, v2 10:08). Agent 120 stopped launching at 11:28 (owner: 37.7k/45k credits). Agent 119 died at about 16:42 PDT 10-04 without a handoff for its last hour;
agent 120 reconstructed state from GitHub, Fly health, Supabase (read-only) and the 119 ops snapshot (wip/op119/ops-snapshot 86bae053).
GitHub is the truth: verify every head and verdict before acting on any line. A push with no FIX ROUND / RESTACK comment is unfinished
work. A verdict at a head that has since moved is void (rule 12 merge-only tree check excepted).
History goes to LAST_OPERATOR_STATE.md; this file is current state only. Operator ops files: backend branch wip/op120/ops-snapshot.

## 0. Fleet size
Dynamic per operator, sized to your own available credits (up to 15). Agent 120 ran at 7 by owner order; that is NOT your cap
(DECISION_LOG 10:39 10-05). No risk sections in owner-facing documents.

## 1. Read first
LAW: AGENT_RULES.md (repo copy on main wins over attachments). MENTALITY: the EXECUTE doctrine. PROCESS: MODEL_ROUTING.md (T0-T4).
MERGE_DEPENDENCY_GUIDE.md (rules 1-12), DECISION_LOG.md, ops/lanes120/_COMMON_120.md + JOBS120.md, ops/op120/FLEET.md.

## 2. Production and mains (11:31 PDT 10-05)
- Production backend ee55f814 (recurring, deployed 09:33 with migrations 20270225000000 + 20270311000000). Fly app backend-spring-lake-3890.
- Backend main 5da537d6 = #661 + #702 merged 11:28 (card-secrets fix; no migrations). DEPLOY PENDING: when main CI is green, run
  fly-deploy.yml with release_sha=5da537d6..., confirm=deploy, NO migrations flag, then bash ops/approve_deploy.sh <run> 60, check /health
  + /readyz. (If agent 120 deployed it, section 7 says so.) Production ClientPurchase has 0 rows: the credential cleanup script has nothing
  to clear (it is not in the production image; it runs from a checkout only).
- Mobile main b79ca594 = Health Connect H1-H8 (#359-#364, #369, #370) landed as one 11:29 (merge-only tree check PASS, all checks incl.
  Analyze green at 8fc5409e). Next: manifest PR flipping FEATURE_WEARABLES_INGEST_POST, B-HC12-120 (C-370-2 burst vs 60/min, C-370-3
  sleep double count) before the clinic Android build, then the owner device pass.
- Supabase rpyfdsgxxltzutgqeouk: CoachMessage RLS ON + FORCED with policy coach_message_participant_access (checked 10:38).

## 3. Per-PR state (round + stage) at 11:31 PDT 10-05
Backend = b, mobile = m. "DA" = dual APPROVE (Claude Opus 5.5 + GPT-6.1 Sol) at that exact head. RC = request changes.
| Stack | PRs @ head | Stage | Next |
|---|---|---|---|
| Fees, recurring | b#681-#686 #697; b#678-#680 #696 #701 | DEPLOYED | done |
| #661 secrets | b#661 + b#702 | MERGED 11:28 (main 5da537d6) | deploy (no migrations) |
| Health Connect | m#359-#364, #369, #370 | MERGED 11:29 (main b79ca594) | flag flip PR; B-HC12-120; device pass |
| Sheet | m#342 e3226f3b, #343 691e0cf0, #344 88659e21 | DA | HOLD for D4 #690 + native card-update composition + final-main Analyze; C-344-12 gates the #705 deploy |
| Coach | b#674 (RC both: Sol 5999606262 0/3/2, Opus 6000051266 B-674-15); #676 0ee4933d, #677 b17888ab, #703 88940c3f DA | B-CM9-120 was running at 11:31 (FIX ROUND 6: #674 source, #703 tests, merge-only restack) - read its report ops/reports/B-CM9-120.md and the PR comments | delta lens pair -> land -> deploy -> wizard/money mobile |
| Dunning | b#687 (Sol APPROVE / Opus RC B-687-8), #688 + #704 DA, #705 RC both (Sol 5999840529 0/5/1, Opus 6000206086 0/4/2) | B-DUNR2-120 was running (ops/reports/B-DUNR2-120.md) | lens pair -> B-DUNB-120 (#689/#690, decision-7 D2d) -> D5 #691 + #642 |
| Lockout | m#352 c89f719c, #353 9d47045b, #354 68c7f080 | FIX ROUND 2 READY; L3 lens pair was cancelled at 11:28 (no verdicts posted) | L3 lens pair |
| Trials | b#671 ea7a9740 (refresh READY), #672 b0654c80 (restack READY), #673 dcf095b8 (RESTACK STOPPED), #706, #707 8fc2660b FR2 READY | B-TR8-120 was running (one shared trial rule; ops/reports/B-TR8-120.md) | lens pair over the whole train -> land -> deploy -> m#338 |
| Push (day 1) | b#692 346cf4a8 (Sol APPROVE 6000373524; Opus approved the old head only), b#693 (Sol RC B-648-8 6000395449) | B-PUSH3-120 was running (#693 only) | Opus PUSH3 on #692 + new #693, Sol #693 delta -> merge back to back -> deploy with migrations -> Android device check |
| Messaging (day 1) | b#708 5c9c6a0e, #709 87f0bfff, #710 47b528ce, #711 5a7c41e8 (split of #660) | B-MSG2-120 cancelled before pushing | B-MSG2-120 (RLS block in #708) -> MSG3 lens pair -> M-MSG-120 mobile |
| Invite codes (day 1) | b#658 4de7a6dc FR1 READY | | INV3 lens pair -> M-INV-120 mobile |
| Coachless, broadcasts (day 1) | b#657, b#659 | | B-SPLIT-COACHLESS-120, B-SPLIT-BCAST-120 |
| Scheduling (day 1) | b#712-#720 (split of #634, tree == #634 + main) + #653 9a23e3b2; m#365-#367, #336; b#643, m#341 RC both | split READY | SCHA/SCHB lens pairs, scheduling mobile pairs, B-SCHED-FIX-120, S-AVAIL-120 (coach booking options only) |
| Roman (day 1) | b#667 -> #665 -> #666 -> #668 -> #669 -> #670; b#655 + m#337; m#331 | never reviewed | JOBS120 "Roman day-1 jobs" incl. M-ROMANCAP-120 (AI allotment pop-up) |
| Wizard | m#345 DA; #346 (Opus APPROVE / Sol RC B-346-3); #347 restack DA | B-WIZ3-120 queued | after coach deploy |
| Programs | m#355-#358 RC both | B-MWB409-120, B-PROG2-120, B-PROG4-120 queued | then FEATURE_MWB_* flag PR |
| Remainder | m#312, #335, #339, #340 | | after critical stacks |
Every job entry with exact heads, verdict ids and rulings: ops/lanes120/JOBS120.md (backend branch wip/op120/ops-snapshot).

## 4. Launch path (one-pager v2.1 APPROVED 10:40)
1. Privacy DONE. 2. Money: fees + recurring DEPLOYED, #661 MERGED (deploy pending); sheet held; trials building. 3. Coach: one fix round
left. 4. Failed payments: fix round running. 5. Health Connect: MERGED; flag + follow-up + device pass left. 6. Remainder: programs queued.
7. Builds and review: not started. Score 1/7 (2 and 5 close).

## 5. Open owner decisions
None open. Answered 10-05: day 1 = launch path + push + community (coachless, invite codes, broadcasts, inbox) + Roman upgrades + all
scheduling; coaches decide booking times (no onboarding gate); one shared trial rule; fleet size dynamic per operator (agent 120 capped at 7);
no risk sections; one-pager approved; Roman v1.1 decisions 1-9 (planning/ROMAN_V1_1_PLAN.md section 9); coaches see Roman's proposals
only. Credits: 37.7k/45k at 11:28 (owner).

## 6. Owner to-do
- Stripe: add refund.updated to webhook we_1UMt9WDUoC5CCVhShvAELVmI; confirm customer.subscription.trial_will_end before the trials deploy.
- Supabase Pro on launch day 1. Apple Sign-in key. Confirm POSTHOG_KEY. Play reviewer accounts on the next APK. Health Connect device
  pass. Android push device check after the push deploy. DONE: FCM V1 key (09:51); iOS push key already in Expo since May.

## 7. Log (agent 120)
- 09:27 RESTACK NOTE b#661/#702. 09:28 wave 1 (15 agents). 09:33 recurring DEPLOYED. 09:44 37 old ci/* branches deleted.
- 09:47 owner drain to 7 (reached ~10:06). 09:57 Roman day 1 + v1.1 plan. 10:31-10:33 scheduling day 1. 10:40 one-pager approved.
- 11:22 #661 branch ff to #702's audited head; 11:28 #661 MERGED (main 5da537d6). 11:23 H1-H8 candidate 8fc5409e; 11:29 MERGED (mobile
  main b79ca594). 11:28 owner: 37.7k/45k credits -> stopped launching; cancelled L3 lens pair and B-MSG2 (nothing pushed); asked the four
  running builders to finish fast.
