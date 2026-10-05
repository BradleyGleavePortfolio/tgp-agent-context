# TGP Operator — Handoff for Agent 121 (current state, written by agent 120)

Version 1. Written 2026-10-05 09:33 PDT by agent 120. Agent 119 died at about 16:42 PDT 10-04 without a handoff for its last hour;
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

## 3. Per-PR state (round + stage)
Backend = b, mobile = m. "DA" = dual APPROVE (Claude Opus 5.5 + GPT-6.1 Sol) at that exact head.
| Stack | PRs @ head | Stage | Next |
|---|---|---|---|
| Fees | b#681-#686, #697 | LANDED 15:23 10-04, DEPLOYED 15:43 | done |
| Recurring | b#678 (+#679 #680 #696 #701) final 8c925944 | LANDED 16:32 10-04 (main ee55f814); DEPLOYED 09:33 10-05 | C-680-18/19 carried by dunning |
| #661 secrets | b#661 bc399edd (2,849, grandfathered), b#702 9ddda117 | conflict main refresh by B-661R-119 (no comment); operator RESTACK NOTE 09:27; CI green | lens pair 661D-120 running -> merge #702 into b-secrets-3, then #661 -> deploy |
| Sheet | m#342 e3226f3b, m#343 691e0cf0, m#344 88659e21 | DA all three | HOLD: lands as one with recurring deploy, D4 #690, native card-update composition, final-main Analyze; C-344-12 gates the #705 deploy |
| Trials | b#671 c75002c9 (DIRTY: schema.prisma), #672 62c2c066, #673 dcf095b8 (2,999), #706 3d95f96e: DA; b#707 ffed434e: RC both (B-707-1 drafts outside the cancel fence) | B-TR7-120 running (#707 FR, then #671 main refresh + restack) | lens pair -> land T1-T5 as one -> deploy; m#338 48b5e6b5 DA (BEHIND) after |
| Coach | b#674 9e8a3a6b (BEHIND), #676 296067fb, #677 921299fe, #703 b16021ab | B-CM6-119 pushed fixes with no comment; no lens at these heads | B-CM7-120 running -> lens pairs -> land -> deploy -> m#348-#351 |
| Dunning | b#687 f3c7fd37, #688 5003e7e6, #704 32d886bb, #705 279ec167 (DIRTY vs #704) | no lens ever on D1/D2a/D2b/D2c | B-DUNMR-120 running -> lens pairs -> B-DUNB (#689 bb992fed RC both; #690 06307883 Sol RC / Opus APPROVE) -> D5 #691 e0afe678 + #642 4fee3c02 (DA, BEHIND); FEATURE_DUNNING_V2 off until #705 lands |
| Lockout | m#352 ac244d22, m#353 05d84f27 RC both; m#354 f084cc0f | B-LOCK2-120 running (R-DISPUTE-PAUSE copy, 'dispute_paused') | lens pair after |
| Health Connect | m#359 e0f3d2a7, #360 fde1875e, #361 574b32a8, #363 5266d658, #364 1266038c: DA; #362 261e7d4c Opus APPROVE / Sol RC; #369 3252ec79 FR1 (Sol RC at old head) | lens pair H7-120 running; B-HC10-120 building H8 (late data C-360-1, resumable import C-360-2) | land H1-H7 as one -> flag flip FEATURE_WEARABLES_INGEST_POST -> owner device pass |
| Wizard | m#345 ed29833c (BEHIND), #346 26cf23b7 FR2; m#347 8437fb94 restack | lens pair W12D-120 running | W3 #347 full review/fix; money mobile m#348-#351 after coach deploy (#349/#350 red by design) |
| Programs | m#355 902c64a6, #356 40ee678a, #357 b364b9ea, #358 4dcf0aff | first reviews running (P12-120, P34-120) | fixes, land |
| Remainder | m#312 8016a79e (DA at f8375ca6 + main merge), m#335 641fe891 (DA, BEHIND), m#339 (DIRTY, Sol RC), m#340 (Sol RC) | not started | rule 12 refresh after critical stacks land |
| Fast-follow (decision 1) | b#692/#693 push, Roman b#667-#670 + m#331, S-SCHED-2 (b#634 #653, m#365-#367, m#336), annex (b#655 #657-#660, m#337), b#643/#650, m#341 | out of day-1 scope by default | after launch |
Full inventory of 142 open PRs: ops/op120/inv/inventory.json.

## 4. Launch path (target: store submission and clinic go-live Wed 10-07)
1. Privacy: DONE. 2. Money: fees DONE; recurring merged and DEPLOYED 09:33 10-05; #661, sheet, trials pending. 3. Coach: builder running.
4. Failed payments: builder running. 5. Health Connect: lenses running. 6. Remainder: programs lenses running. 7. Builds and review:
not started. Score 1/7.

## 5. Open owner decisions (recommended default first)
1. Day-1 scope = the fast-follow list above stays out. 2. Approve LAUNCH_ONE_PAGER.md. 3. #661 tests stay moved to #702.
4. Delete leftover ci/* branches from old jobs (35 backend, 3 mobile; 24 backend audit/*): yes. 5. Failed refund after access ended:
alert only. 6. Dispute inquiries also pause the plan: yes. 7. Full refund on a recurring plan pauses billing; the coach restarts.

## 6. Owner to-do
- Stripe: add refund.updated to webhook endpoint we_1UMt9WDUoC5CCVhShvAELVmI (no Stripe credential in the session; the owner can add
  the event in the Stripe dashboard or add a restricted key through the secure credential form).
- Supabase Pro on launch day 1. Play reviewer accounts on the next APK build. Health Connect device pass before the clinic build.
- Keys: FCM V1, Apple Sign-in, POSTHOG_KEY confirmation. Current credits number (last given: 9.4k/45k at 12:49 10-04).

## 7. Log (agent 120)
- 09:27 RESTACK NOTE on b#661 / b#702. 09:28 wave 1: 15 agents (ops/op120/FLEET.md). 09:29 recurring deploy run 37341231516;
  09:33 deployed and healthy, migrations applied.
