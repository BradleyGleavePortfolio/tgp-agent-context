# TGP Operator — Handoff for Agent 121 (current state, written by agent 120)

Version 2. Written 2026-10-05 10:08 PDT by agent 120 (v1 09:33). Agent 119 died at about 16:42 PDT 10-04 without a handoff for its last hour;
agent 120 reconstructed state from GitHub, Fly health, Supabase (read-only) and the 119 ops snapshot (wip/op119/ops-snapshot 86bae053).
GitHub is the truth: verify every head and verdict before acting on any line. A push with no FIX ROUND / RESTACK comment is unfinished
work. A verdict at a head that has since moved is void (rule 12 merge-only tree check excepted).
History goes to LAST_OPERATOR_STATE.md; this file is current state only. Operator ops files: backend branch wip/op120/ops-snapshot.

## 1. Read first
LAW: AGENT_RULES.md (repo copy on main wins over attachments). MENTALITY: the EXECUTE doctrine. PROCESS: MODEL_ROUTING.md (T0-T4).
MERGE_DEPENDENCY_GUIDE.md (rules 1-12), DECISION_LOG.md, ops/lanes120/_COMMON_120.md + JOBS120.md, ops/op120/FLEET.md.

## 2. Production and mains (verified 09:13-09:33 PDT 10-05)
- Production before 120: backend f48267f9 (fees; fly-deploy 37240806383, 15:43 PDT 10-04). Fly app backend-spring-lake-3890.
- 09:29 PDT 10-05: agent 120 dispatched backend main ee55f814 (recurring R1-R5, migrations 20270225000000_native_subscription_trials
  and 20270311000000_subscription_checkout_terms; both additive) with -f migrations=apply-migrations: fly-deploy run 37341231516,
  production environment approved 09:29:49. DEPLOYED: run success 09:33; /health ok (uptime 34 s at 09:33:59), /readyz db up;
  both migrations applied 09:32:52 PDT (_prisma_migrations now 192 rows, 0 pending). Production = ee55f814.
- _prisma_migrations before the deploy: 190 rows (2 rolled-back April baseline rows), 0 pending. StripeProcessedEvent 0 rows.
  Supabase org plan: free (owner: Pro on launch day 1).
- Backend main ee55f814 (CI green; Release Please always fails, not a gate). Mobile main cc4ceeed.

## 3. Per-PR state (round + stage) at 10:08 PDT 10-05
Backend = b, mobile = m. "DA" = dual APPROVE (Claude Opus 5.5 + GPT-6.1 Sol) at that exact head. RC = request changes.
| Stack | PRs @ head | Stage | Next |
|---|---|---|---|
| Fees | b#681-#686, #697 | LANDED + DEPLOYED 10-04 | done |
| Recurring | b#678 (+#679 #680 #696 #701) | LANDED 16:32 10-04; DEPLOYED 09:33 10-05 (ee55f814) | C-680-18/19 carried by dunning |
| #661 secrets | b#661 bc399edd (2,849), b#702 9ddda117 | #661 RC both (Sol B-661-14 5998892091, Opus B-661-15 5999168270: same defect, spent client secret / ephemeral key kept on first subscription grant); #702 DA (5998892592, 5999168870) | B-661R2-120 (queued first): 2 source lines in #661, tests in #702, backfill (prod ClientPurchase 0 rows) -> lens pair -> merge #702 then #661 -> deploy |
| Sheet | m#342 e3226f3b, #343 691e0cf0, #344 88659e21 | DA all three | HOLD: lands with D4 #690 + native card-update composition + final-main Analyze; C-344-12 gates #705 deploy |
| Trials | b#671 c75002c9 (DIRTY), #672, #673, #706 DA; b#707 ffed434e RC both | B-TR7-120 running | lens pair -> land T1-T5 as one -> deploy; m#338 after |
| Coach | b#674 e35c37a1, #676 0ee4933d, #677 b17888ab, #703 88940c3f | FIX ROUND 5 READY (B-CM7-120, 5999161245..62145), CI green | lens pair CM8-120 (queued) -> land -> deploy -> wizard/money mobile |
| Dunning | b#687, #688, #704, #705 | B-DUNMR-120 running | lens pairs -> B-DUNB -> decision-7 piece -> D5 #691 + #642 |
| Lockout | m#352 c89f719c, #353 9d47045b, #354 68c7f080 | FIX ROUND 2 READY (B-LOCK2-120), checks green | lens pair L3-120 (queued) |
| Health Connect | m#359-#361, #363, #364 DA; #362 Opus APPROVE / Sol conditional APPROVE (H1-H7 composition); #369 3252ec79 Opus APPROVE (5999043389) / Sol RC B-369-2 (5998888199) | B-369-2 fix routed to running B-HC10-120 (then H8) | lens pair on new #369 -> land H1-H7 -> FEATURE_WEARABLES_INGEST_POST -> owner device pass |
| Wizard | m#345 ed29833c DA; #346 26cf23b7 Opus APPROVE / Sol RC B-346-3; #347 8437fb94 restack DA, own content unreviewed | B-WIZ3-120 queued (#346 + #347 known items) | full W3 review -> land #345-#351 after coach deploy |
| Programs | m#355 902c64a6, #356 40ee678a, #357 b364b9ea, #358 4dcf0aff: RC both on all | B-MWB409-120 (backend 409 details), B-PROG2-120, B-PROG4-120 queued | then flag PR FEATURE_MWB_TEMPLATES/AUTOSAVE_UNDO/NAMED_REGIMES |
| Push (day 1) | b#692 27156167, #693 13417e7b | Sol RC (5999124539, 5999124426); Opus lens running | B-PUSH2-120 queued; FCM key uploaded by owner 09:51; APNs key already in Expo since May |
| Annex (day 1) | b#657, #658, #659, #660 | B-SPLIT-MSG-120 (#660) and B-INV2-120 (#658) running; coachless/broadcast splits queued | lens pairs per piece |
| Scheduling | b#634 split by B-SPLIT-SCHED-120 (running); #653, m#365-#367, #336, b#643, m#341 | owner day-1 ruling open | |
| Roman (day 1, owner 09:57) | b#667 -> #665 -> #666 -> #668 -> #669 -> #670; b#655 + m#337; m#331 (5,067) | never reviewed at these heads | JOBS120 "Roman day-1 jobs"; v1.1 plan planning/ROMAN_V1_1_PLAN.md |
| Remainder | m#312, #335, #339, #340 | not started | after critical stacks |

## 4. Launch path (target was Wed 10-07; at cap 7 with the expanded day 1, Fri 10-09 is realistic; owner asked)
1. Privacy DONE. 2. Money: fees + recurring DEPLOYED; #661, sheet, trials pending. 3. Coach: READY for lenses. 4. Failed payments:
builder running. 5. Health Connect: one B left. 6. Remainder: programs fixes queued. 7. Builds and review: not started. Score 1/7.

## 5. Open owner decisions (recommended default first)
2. Approve LAUNCH_ONE_PAGER.md. 3. #661 tests stay in #702 (operator applied the default). Scheduling day 1: yes/no. Pace: cap 7 + Fri
or cap 15 + Thu. Roman v1.1 decisions 1-8 in planning/ROMAN_V1_1_PLAN.md section 9. Answered today: 1 (expanded: push, annex, Roman day 1;
#634 split), 4-7 yes, stop-and-drain to 7 (09:47).

## 6. Owner to-do
- Stripe: add refund.updated to webhook we_1UMt9WDUoC5CCVhShvAELVmI. Supabase Pro on launch day 1. Play reviewer accounts on the next
  APK. Health Connect device pass. Apple Sign-in key. Confirm POSTHOG_KEY. DONE: FCM V1 key uploaded to Expo (09:51 10-05).

## 7. Log (agent 120)
- 09:27 RESTACK NOTE b#661/#702. 09:28 wave 1 (15 agents). 09:33 recurring DEPLOYED. 09:44 37 old ci/* branches deleted.
- 09:47 owner: stop-and-drain to 7; reached 7 at about 10:06. 09:48-09:50 wave 2 (push lenses, #634/#660 splits, #658 fixes).
- 09:57 owner: Roman upgrades day 1; v1.1 plan written (414d4a5). Credits: 7.5k/45k at 09:43 (owner).
