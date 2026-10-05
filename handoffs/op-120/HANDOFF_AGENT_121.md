# TGP Operator — Handoff for Agent 121 (current state, written by agent 120)

Version 4. Written 2026-10-05 11:47 PDT by agent 120 (v1 09:33, v2 10:08, v3 11:31). Agent 120 stopped launching at 11:28 (owner: 37.7k/45k
credits); at 11:44 the owner asked for one restart (B-MSG2-120, running at 11:47). Agent 119 died at about 16:42 PDT 10-04 without a handoff for its last hour;
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

## 2. Production and mains (11:47 PDT 10-05)
- Production backend 5da537d6 (#661 + #702 card-secrets fix), deployed 11:44 (fly-deploy run 37357733219, no migrations; /health and
  /readyz ok). Previous: ee55f814 (recurring) 09:33. Fly app backend-spring-lake-3890. Production ClientPurchase has 0 rows, so the
  credential cleanup script has nothing to clear (not in the production image; runs from a checkout only).
- Backend main 5da537d6. Mobile main b79ca594 = Health Connect H1-H8 (#359-#364, #369, #370) landed as one 11:29 (merge-only tree check
  PASS, all checks incl. Analyze green at 8fc5409e). Next: manifest PR flipping FEATURE_WEARABLES_INGEST_POST, B-HC12-120 (C-370-2 burst
  vs 60/min, C-370-3 sleep double count) before the clinic Android build, then the owner device pass.
- Supabase rpyfdsgxxltzutgqeouk (free plan): CoachMessage RLS ON + FORCED with policy coach_message_participant_access (checked 10:38).
- Coach AI credit pool ALREADY EXISTS on backend main: src/ai-credits (CoachAIBudgetService, CoachAIBudget, CoachCreditPackPurchase,
  monthly period). Roman must debit it on every turn on top of the client daily cap (owner 11:40-11:41).

## 3. Per-PR state (round + stage) at 11:47 PDT 10-05
Backend = b, mobile = m. "DA" = dual APPROVE (Claude Opus 5.5 + GPT-6.1 Sol) at that exact head. RC = request changes.
| Stack | PRs @ head | Stage | Next |
|---|---|---|---|
| Fees, recurring, #661 secrets | b#681-#686 #697; b#678-#680 #696 #701; b#661 + #702 | DEPLOYED | done |
| Health Connect | m#359-#364, #369, #370 | MERGED 11:29 | flag flip PR; B-HC12-120; device pass |
| Push (day 1) | b#692 346cf4a8 (Sol APPROVE 6000373524), b#693 cc0a167f FIX ROUND 6 READY (6000796965, 2,965 lines) | READY | Opus PUSH3 on #692 + #693 and a Sol #693 delta -> merge #692 then #693 back to back -> deploy WITH migrations (20270307000000) -> Android device check |
| Coach | b#674 3a07a0de FIX ROUND 6 READY (6000796805; 2,995/3,000), #676 fadb2960 + #677 e3940bd0 merge-only READY, #703 ebde8b3b READY (11-case regression spec); B-674-1, B-674-15, B-674-16 fixed | READY (ops/reports/B-CM9-120.md) | delta lens pair at these heads -> main merge as its own merge-only round (main is 29 commits ahead) -> land -> deploy -> wizard + money mobile. #674 has 5 lines of room: move test/comment lines out for any further fix |
| Dunning | b#687 d86b31a6 FIX ROUND 4 READY (6000627026); #688 2662d01a + #704 764af2e1 RESTACK READY; #705 2a03d7dd IN PROGRESS (Sol B-705-2..5, Opus B-705-1..3 open) | partial | new D2d PR on #705 with the remaining fixes (rulings in JOBS120 wrap-up notes; plan in ops/reports/B-DUNR2-120.md) -> lens pair over #687/#688/#704 + #705/D2d -> B-DUNB-120 -> D5 #691 + #642 |
| Trials | b#671 ea7a9740, #672 b0654c80 READY; #673 14b7a7a2 FIX ROUND 12 (2,996), #706 9567f8bd, #707 81ec2756 pushed with ONE SHARED TRIAL RULE | NOT READY: PR bodies, T5 probe replay on #707, READY comments once CI is green (ops/reports/B-TR8-120.md) | finish -> lens pair over the whole train -> read-only count of native trials in production -> land -> deploy -> m#338 |
| Messaging (day 1) | b#708 5c9c6a0e, #709 87f0bfff, #710 47b528ce, #711 5a7c41e8 | B-MSG2-120 running since 11:45 | MSG3 lens pair -> M-MSG-120 mobile |
| Lockout | m#352 c89f719c, #353 9d47045b, #354 68c7f080 | FIX ROUND 2 READY; L3 lenses cancelled 11:28 with no verdicts | L3 lens pair |
| Sheet | m#342 e3226f3b, #343 691e0cf0, #344 88659e21 | DA | HOLD for D4 #690 + native card-update composition + final-main Analyze; C-344-12 gates the #705 deploy |
| Invite codes (day 1) | b#658 4de7a6dc FR1 READY | | INV3 lens pair -> M-INV-120 mobile |
| Coachless, broadcasts (day 1) | b#657, b#659 | | B-SPLIT-COACHLESS-120, B-SPLIT-BCAST-120 |
| Scheduling (day 1) | b#712-#720 (split of #634, tree == #634 + main) + #653 9a23e3b2; m#365-#367, #336; b#643, m#341 RC both | split READY | SCHA/SCHB lens pairs; mobile pairs; B-SCHED-FIX-120; S-AVAIL-120 (coach booking options only) |
| Roman (day 1) | b#667 -> #665 -> #666 -> #668 -> #669 -> #670; b#655 + m#337; m#331 (split) | never reviewed | Roman day-1 jobs incl. coach-pool debit check and M-ROMANCAP-120 (pop-up) |
| Wizard | m#345 DA; #346 (Opus APPROVE / Sol RC B-346-3); #347 restack DA | B-WIZ3-120 queued | after coach deploy |
| Programs | m#355-#358 RC both | B-MWB409-120, B-PROG2-120, B-PROG4-120 queued | then FEATURE_MWB_* flag PR |
| Remainder | m#312, #335, #339, #340 | | after critical stacks |
Every job entry with exact heads, verdict ids and rulings: ops/lanes120/JOBS120.md (backend branch wip/op120/ops-snapshot).

## 3a. First moves for agent 121 (in order)
1. Verify heads on GitHub; read the B-MSG2-120 report (running when agent 120 stopped). Launch B-SPLIT-ROMANCHATS-120 (m#331, 5,067
   lines, day 1) first (owner 11:52). Owner rule 11:48: any NOT-READY PR over 3,000 lines is split into pieces of 1,500 or less even if
   grandfathered (clean ones may stay); no open PR over 5k: b#605, #591, #592, #589 get split before anyone reviews them; b#659 and b#657
   splits are already queued. The 16 superseded originals (b#627 #654 #628 #634 #641 #648 #651 #656 #660; m#317 #322 #325 #328 #329
   #332 #334) were closed 11:52 with comments; branches kept.
2. Coach delta lens pair (B-CM9 READY) and push: Opus PUSH3 + Sol #693 delta -> land -> deploy with migrations (closest to production after coach).
3. Land coach, deploy; land push, deploy with migrations. 4. Trials: finish READY, lens pair, land. 5. Dunning: D2d builder, lens pair.
6. Lockout L3 pair; messaging MSG3 pair; INV3 pair; scheduling SCHA/SCHB pairs; Roman RA/RB pairs. 7. Remaining builders per JOBS120.
Size the fleet to your own credits (agent 120 burned about 17k credits an hour at 7-15 agents; check credits every 30 minutes).

## 4. Launch path (one-pager v2.1 APPROVED 10:40)
1. Privacy DONE. 2. Money: fees + recurring + #661 DEPLOYED; sheet held; trials building. 3. Coach: one fix round
left. 4. Failed payments: fix round running. 5. Health Connect: MERGED; flag + follow-up + device pass left. 6. Remainder: programs queued.
7. Builds and review: not started. Score 1/7 (2 and 5 close).

## 5. Open owner decisions
None open. Answered 10-05: day 1 = launch path + push + community (coachless, invite codes, broadcasts, inbox) + Roman upgrades + all
scheduling; coaches decide booking times (no onboarding gate); one shared trial rule; fleet size dynamic per operator (agent 120 capped at 7);
no risk sections; one-pager approved; Roman v1.1 decisions 1-9 (planning/ROMAN_V1_1_PLAN.md section 9); coaches see Roman's proposals
only. Coach AI pool + client daily cap layered (11:40-11:41). Credits: 37.7k/45k at 11:28 (owner).

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
- 11:40 #661 deploy dispatched; 11:44 DEPLOYED (production 5da537d6). B-PUSH3 done (#693 cc0a167f READY). B-DUNR2 partial (#705 open).
  B-TR8 pushed, not READY. 11:44 owner: restart the smallest stopped job -> B-MSG2-120 relaunched 11:45. Merged today 10, deployed today 2.
- 11:48 B-CM9 done: #674 3a07a0de, #676 fadb2960, #677 e3940bd0, #703 ebde8b3b, all READY with green checks.
- 11:52 closed the 16 superseded originals (owner approved); m#331 split left for agent 121; oversize rule recorded (DECISION_LOG 11:48-11:52).
