# TGP Operator — Takeover Prompt for Agent 118 (written and kept current by operator agent 117)

Version 7: 2026-10-04 00:26 PDT. Agent 117 is ACTIVE (Perplexity Computer session d3ebac7a). Read this whole file before your first move.
GitHub is the truth: re-read every PR head and its latest AUDIT / FIX ROUND comment before acting on any line here.

## 0. Who you are and what the owner wants
The owner (Bradley) gives you four documents: agent rules = the LAW, autonomy doctrine = your MENTALITY, model routing = the PROCESS,
this file = his FIRST PROMPT TO YOU. Repo copies on tgp-agent-context main win over attachments: AGENT_RULES.md (G01-G22 + 21:15
amendment), MODEL_ROUTING.md (8.2 size gate), OPERATOR_STANDING_ORDERS.md, MERGE_DEPENDENCY_GUIDE.md (rules 1-12), DECISION_LOG.md
(verbatim owner decisions, newest at the bottom). Deeper history only when needed: handoffs/op-116/HANDOFF_AGENT_117.md,
handoffs/op-115/HANDOFF_AGENT_116.md (sections 0.1, 1.2, 3.2, 12, 13), handoffs/op-114/LEDGER-72H.md.

Owner rules (binding, from his first prompts):
- Every message to him starts with `Launch path: <n>/7 steps done | merged today <n> | deployed today <n> | open decisions <n> | credits
  used <n>/45k` (credits = his last number) and ends with "Your next step: ..." or "Nothing needed from you." No emojis, no exclamation
  marks. Short sections, numbered decisions with a recommended default. Escalate decisions, not chores.
- "ANYTHING LESS THAN HYPERSCALER QUALITY IS A DAY 1 BLOCKER / WALL CLOCK TIME IS KEY #1 RESOURCE / DO IT RIGHT, DO IT SMOOTH - SMOOTH IS
  FAST / I WANT MORE, NOT LESS FUNCTIONALITY IF THE CHOICE ARISES." Recurring packages are "LITERALLY MOST CRITICAL OF ALL"; never
  one-time-only. Don't cancel his scope.
- Spend no money without his word (no EAS builds, paid plans, paid CI). Exception granted 21:31: Supabase Pro ("upgrade me. sure.").
- PRs over 3,000 changed lines fail automatically; 1,500-3,000 need an operator SIZE ASSESSMENT. Never name the clinic partner anywhere
  (tgp-agent-context is PUBLIC). Branch protection changes need his exact words. Times only from `date` (America/Los_Angeles).
- One job = one agent = one or two PRs, then it ends (owner 10-03 19:25).
- Merge only audited exact heads with every required check green: `gh pr merge N --merge --match-head-commit <full sha>`. Deploy audited
  main with green CI under the standing approval; `-f migrations=apply-migrations` ONLY when the release adds migrations/schema.
- Rule 12 (owner 21:15): a pure main merge where every PR file stays byte-identical needs only the operator MERGE-ONLY TREE CHECK
  (ops/tree_check.sh + all required checks green). Anything else that moves a head needs both lenses at the exact head.
- Refresh (update-branch) only the PR that is next to merge.
- When the owner says pause: stop launching, let in-flight CI finish so drafts can be posted, then snapshot exactly as 116 did
  (handoffs/op-116/pause/PAUSE_STATE.md + WORKTREES.md + private wip/op116/* branches).
- Agent concurrency (ONE-TIME owner instruction 21:34 for agent 117's wave, not a standing pattern): 15 agents launched 21:31; as they
  end, drain down to 5 concurrent and never go under 5. If you take over mid-wave, keep 5 concurrent unless the owner says otherwise.
- Owner requirement 21:34: the operator maintains THIS file as it moves (here and in GitHub).

Identity for commits: `git -c user.name="TGP Agent 117" -c user.email="agent@tgp.invalid"` (use your own number; identity is not a
gate, owner 2026-09-28). Subagent models: claude_opus_5_5 (builders, Opus lens), gpt_6_1_sol (Sol lens).

## 1. State now (2026-10-03 21:38 PDT)
- Production = backend main a5b605d1aa86f3afcece6061dc0502f20b83f27e (deploy 37175413402). Verified by 117 at 21:22 PDT: /health ok,
  /readyz 200 db up; _prisma_migrations 189 rows, latest 20270301000000_community_win_coach_matcher finished 04:06:23 UTC (the only
  rows with null finished_at are two rolled-back April baseline attempts, not pending); app.community_win_author_coach(text) is
  SECURITY DEFINER with EXECUTE only for postgres and service_role (authenticated and anon cannot execute). Mobile main = 367e6c48.
- Supabase org "The Growth Project" (lpwroedsshsuxlhhhqil): plan free at 21:33. Owner approved Pro 21:31; the plan change is done in the
  dashboard billing page (https://supabase.com/dashboard/org/lpwroedsshsuxlhhhqil/billing); the connector cannot change plans.
  Production project = "FITNESS TGP" (rpyfdsgxxltzutgqeouk). Do not touch "tgp-finance" (another app). After upgrade: verify plan=pro.
- Scoreboard: Launch path 0/7 | merged today 7 | deployed today 4 | open decisions 2 (day-1 scope; LAUNCH_ONE_PAGER approval) |
  credits used 0/45k (owner's number at 21:20 for 117's session).
- Agent 117 actions so far: rebuilt sandbox; restored ops/ from backend wip/op116/ops-snapshot; posted READY FOR AUDIT drafts on
  #694, #611, #687, #674, #676, #677, #671, #672, #673, #683 (red by design, verified exact), #684; restack note on #691 (no READY);
  fixed #695's new CodeQL alert 123 (head e80cefad, test-only); reran known infra failures once (#690 SBOM race, #661/#679/#695 jest
  OOM); saved mobile #360 fix fde1875e to wip/op116/B-W2-116-360. Blocked by the safety classifier (do not retry without the owner's
  explicit word): deleting 116's leftover ci/* branches; publishing a 116 lens's drafted verdict (#611 Opus) — fresh lenses instead.

## 1a. Progress log (newest last; GitHub wins)
- 21:41 MERGED backend #611 (b09f2061 -> merge 0b0f5b820ab00bcff2ba4dda1d787d39598908a4) and mobile #315 (0277ce10 -> merge
  7fdb629a798d44e76475dbece1b14e68f360ab91) together after Opus APPROVE 0/0/2 and Sol APPROVE 0/0/0 at b09f2061, 11/11 and 3/3 green.
  Deploy of 0b0f5b82 waits for main CI: first CI run 37177734569 failed one test (data-export-storage.spec.ts "a failed retirement
  write answers a retryable 503 ...") = flake: rows ordered by created_at desc with no tiebreaker and the fake DB stamps two rows in the
  same millisecond. Same tree passed on the PR. Rerun once at 21:51. Follow-up F-EXPORT-TIE: deterministic order (tiebreaker or fake clock).
  #611 must be deployed before any mobile build containing #315 ships (/consumer-health-privacy and /help/delete-account 404 until then).
- 21:42 posted #661 FIX ROUND 4 (saved draft) and #690 FIX ROUND 1 (saved draft) at green heads.
- 21:44 #675 dual APPROVE (Opus e45b06f9 earlier, Sol 0/0/0). Refreshed (update-branch) -> a7b73e566c6ffc883743aa9c3a066120e0978291;
  rule-12 tree check PASS 1-3; merge when 11/11 green. #672 refreshes packages files second.
- 21:45 #677 Sol APPROVE 0/0/1 (C-677-2 test-strength, optional); operator SIZE ASSESSMENT KEEP posted. Opus #677 still owed.
- Verdicts in: #661 Opus APPROVE 0/0/5, Sol REQUEST CHANGES 0/2/0 (B-661-3 equal-timestamp settlement, B-661-8 id-only retry write can
  overwrite a terminal refund/cancel/dispute) -> builder round B-661-R5 then both lenses. #681 Sol RC 0/1/0 (B-681-2 duplicate legacy
  rows across reconnection snapshots) -> F1 builder, restack fees, affected-head reviews. #682 Sol APPROVE 0/0/0. #674 Sol RC 0/1/2
  (B-674-10 lost-dispute recovery reverses Stripe/transfer twice) and #676 Sol RC 0/2/1 (B-676-3 CSV refund duplication, B-676-4
  never-billed trials counted as churn) -> coach builder round. #695 Sol APPROVE.
- Follow-ups queued from #611 audit: C-611-18 Apple steps wording "iOS 18 or later"; mobile DeleteAccountScreen.tsx:88 old Apple path
  and "Apple ID" copy; C-611-17 email addresses written to logs in email.service.ts and digest.service.ts (privacy, G12) -> backend PR.
- 21:52 MERGED #675 at a7b73e56 (rule-12 tree check comment issuecomment-5976711268) -> main 643817b3586e27ad95cc3c519733fc14d0aaafde.
- 21:55-22:01 launched replacements as the wave drained below 5: B-661-R5-117 (b_661_r5_117_661_round_5_mutckhs2), B-DUN-117
  (b_dun_117_dunning_restack_687_691_mutco4mh), B-CM-117 (b_cm_117_coach_money_674_676_677_mutcosgu), B-FEES-117
  (b_fees_117_fees_stack_round_13_681_686_mutcpp71). Job entries with operator rulings: handoffs/op-117/JOBS117.md.
- Verdicts: #694 + #695 dual APPROVE (Opus 0/0/2 each, Sol 0/0/0). #681 Opus APPROVE 0/0/1 (C-681-7 = Sol B-681-2; ruled: fix).
  #682 Opus APPROVE 0/0/3. #683 Opus APPROVE 0/0/1, Sol RC 0/2/1. #684 Opus RC 0/1/2 (pending refunds move the wrong money), Sol RC
  0/2/1. #674 Opus RC 0/1/5 (B-674-5 lost Stripe response never recorded), #676 Opus RC 0/2/0. #685/#686 round 12 green, READY (B-F56).
- 22:03 DEPLOYED main 643817b3 (#611 + #675; no migrations) run 37178577858: /health ok, /readyz 200 db up; /privacy,
  /consumer-health-privacy, /help, /help/delete-account all 200 on the API host and app.trygrowthproject.com. LAUNCH STEP 1 DONE.
- 22:05 MERGED #694 at d5d22b22 (rule-12 comment issuecomment-5976795124) -> main 8aeed8e1f059fa96aaf1f6d3fa3f818d794e1aad.
  #695 refreshed -> 683df07e7fe73aa68456af8c90a3562f253997ab, tree check PASS 1-3; merge when 11/11 green.
- Scoreboard 22:07: Launch path 1/7 | merged today 11 | deployed today 5 | open decisions 2 | credits used 0/45k (owner's last number).
- 22:16 MERGED #695 at 683df07e (rule-12 comment issuecomment-5976862240) -> main b644198b90bb9ab1dc62a78794e12cf09f8ace7c.
  CI-only change: no deploy needed (production stays 643817b3). CI fixes #694 + #695 both landed.
- 22:17 owner: "scale to 15 again, then stop-and-drain back to 5". 22:22 launched wave 2 (10 jobs). Found while planning: trials #672
  and #673 conflict with main since #675 merged (builder B-TR-117 resolves); mobile split stacks (#342-#358) have NO verdicts at their
  current heads; mobile #335 and #338 have dual APPROVE (#338 lands with trials; #335 is remainder, BEHIND); backend #642 dual APPROVE
  at 4fee3c02, lands with dunning (B-DUNNING-7 chain #628 -> #322 -> #642).
- Scoreboard 22:24: Launch path 1/7 | merged today 12 | deployed today 5 | open decisions 2 | credits used 0/45k (owner's last number).
- 22:30-23:00 builders finished, every piece READY FOR AUDIT at green heads:
  recurring #678 2174eb7c, #679 0e1cfde0, #680 d1c62ee1 (operator SIZE ASSESSMENT KEEP issuecomment-5977034793), new R4 tests piece
  #696 48e690cd (operator READY note issuecomment-5977035583); all stacked on fees #686 e6893c97 (fees round 13 will restack them
  merge-only). #661 round 5 957e3677 (11/11). Coach #674 5bbcc92a, #676 54e61566, #677 cdb627db (FIX ROUND 2, all B closed).
  Dunning #687 f8e47bf4, #688 b17f514c, #689 bb992fed, #690 06307883, #691 e0afe678 (merge-only restack). Trials #671 c75002c9, #672
  6ce54002 (#675 conflict resolved + 10-test composed spec), #673 4ebf2a43. HC mobile #360 fde1875e (B-360-1 closed), #361 574b32a8,
  #362 439937c9, #363 38ea0f81, #364 a3206441.
- Mobile lens results (all need a builder round, one builder per stack):
  P (sheet): #342 Sol RC 0/2/1, Opus RC 0/1/3 (B-342-1 "nothing was charged" copy on unconfirmed codes); #343 Sol RC 0/5/0, Opus RC
  0/1/2 (B-343-1 "Payment received" before proof). Map #661's reply codes in the same round.
  L (dunning lockout): #352 Opus APPROVE 0/0/6, Sol RC 0/1/0 (cross-account lockout survives logout); #353 Opus RC 0/4/5, Sol RC
  0/3/3 (B-353-1 next account sees lockout; B-353-2 dispute copy vs backend 67096788 ending disputed plans now; first person; screen
  reader). Land #352-#354 together after backend dunning deploys, flag off.
  S (coach setup): #345 Opus RC 0/2/3, Sol RC 0/3/0 (B-345-1 cadence change dropped; B-329-5 create after unmount/account change);
  #346 Opus RC 0/2/3, Sol RC 0/2/1. Land #345-#351 together.
- Builder follow-ups noted (not yet ticketed): C-680-7 SetupIntent lookup index (migration); first-payment notice duplicate key can
  abort the outer transaction; C-661-2 credential backfill (deploy window); C-661-10 index; HC useWearableConnections.ts:120 logs a raw
  error object (G12); D1 email "your access stays on" vs Day-10 lockout (flagged to dunning lenses); leftover ci/ branches from 116
  jobs (B-T12-116 x4, B-W2-116 x2, wip/op116/B-W2-116-360) — deletion was safety-blocked for 117: ask the owner before deleting.
- 22:55 lens queue started at the 5-agent floor: AUD-SOL-661R5-117 (aud_sol_661r5_117_661_round_5_mutec7ji), AUD-OPUS-661R5-117
  (aud_opus_661r5_117_661_round_5_mutef226). Full ordered queue: JOBS117.md "LENS QUEUE".
- 23:03 ops snapshot pushed to backend branch wip/op117/ops-snapshot = d3642a8c (all reports, verdict drafts, probes; files < 2 MB).
  Restore with: git -C repos/growth-project-backend archive origin/wip/op117/ops-snapshot ops | tar -x -C /home/user/workspace
- Supabase plan still "free" at 22:57 (owner upgrade pending in the dashboard).
- Scoreboard 23:05: Launch path 1/7 | merged today 12 | deployed today 5 | open decisions 2 | credits used 0/45k (owner's last number).
- 23:00-23:31: fees round 13 done (B-FEES-117): #681 e9650dc4, #682 be26e289 (red by design 4), #683 536de5c2 (red by design 9),
  #684 d3e8ceb2, NEW #697 F4b tests 2ae0c3c9, #685 aaecdb8d, #686 a1747759 (main b644198b merged into #681). Owner action before the
  fees deploy: Stripe webhook must subscribe to charge.refund.updated and refund.updated. Operator restacked recurring merge-only onto
  #686 a1747759 via update-branch (identical patch-ids, restack comments + READY posted): #678 0c2191c0, #679 f48fa8f0, #680 8e05ad0e,
  #696 34a41818.
- Verdicts: #681 Sol APPROVE 0/0/0 (round 13); #682 Sol RC 0/1/0 (B-682-4 incomplete successful list responses falsely prove absence
  -> duplicate transfers/reversals); Opus F12R13 running. #678 dual APPROVE (Sol 0/0/0, Opus 0/0/1). #679 Sol RC 0/3/0 + Opus RC 0/2/1
  (abandoned trial checkout charged at trial end; failed-cancel retry says nothing charged while trial live). #680 Sol RC 0/3/1; Opus
  APPROVE then WITHDRAWN by lens note (late decline vs just-paid plan; delayed invoice.paid over newer unpaid). #696 dual APPROVE.
  #661 r5: Opus APPROVE 0/0/4, Sol RC 0/2/0 (B-661-3 subcase, new B-661-9) -> B-661-R6-117 running. #671 Sol APPROVE; #672 Sol RC 0/2/1
  (B-672-3 superseded trial warnings, B-672-4 email requests across timeout/retry); Opus T12 running.
- New PRs: backend #698 (data-export order + archive paging bug: >500 rows could repeat/miss), #699 (SBOM check fail-closed), #700
  (no emails/names in logs; Apple steps iOS 18+), mobile #368 (DeleteAccountScreen Apple Account copy). All READY, no verdicts yet.
- Running (5): B-661-R6-117 (b_661_r6_117_661_round_6_mutf65ga), AUD-OPUS-F12R13-117 (aud_opus_f12r13_117_fees_681_682_mutfbknb),
  AUD-OPUS-T12-117 (aud_opus_t12_117_trials_671_672_mutfv37t), AUD-SOL-CM1R2-117 (aud_sol_cm1r2_117_coach_674_676_mutfxcky),
  B-RECUR5A-117 (b_recur5a_117_recurring_678_679_round_5_mutg0lg6). Next: B-RECUR5B-117 (#680/#696), fees F2 builder after Opus
  F12R13, trials T2 builder after Opus T12, then lens queue (JOBS117.md).
- Scoreboard 23:31: Launch path 1/7 | merged today 12 | deployed today 5 | open decisions 2 | credits used 0/45k (owner's last number).
- 23:35-00:26: #661 round 6 c7ee15f0 (3,121 lines; operator SIZE ASSESSMENT KEEP, grandfathered, NO NET GROWTH from now:
  issuecomment-5977489245); Sol RC 0/1/0 at c7ee15f0 (B-661-3 list boundary: ten never-activated rows hide the activated owner) ->
  B-661-R7-117 running (fix in #661 + new tests-only PR stacked on #661). Fees F2 round 14 a2051568 (fail closed on incomplete Stripe
  lists) by B-F2-117; operator restacked F3-F6 merge-only (proofs ops/post117/fees-restack14.txt, restack READY notes posted): #683
  33a9d83b (red by design 3 suites/9 tests, verified), #684 7872a533, #697 b8b63e63, #685 8dc2c2ed, #686 13c814f7. Verdicts: #682 Sol
  APPROVE 0/0/0; #683 Sol RC 0/2/2 (B-683-1 cross-currency refund overstatement; B-683-5 notice-retry authority lost on timestamp
  collision); Opus F23 running. #681 dual APPROVE (unchanged). Recurring round 5 A done (B-RECUR5A-117): #678 b04ea692, #679 6760ee6a
  (on fees top 13c814f7), new tests-only PR #701 69afde25 (base #696); B-RECUR5B-117 running on #680/#696. Possible functionality gap
  to check: clients who already have a saved card may be unable to start a trial (B-RECUR5A note, untested). Trials: #671 dual APPROVE;
  B-TR2-117 running on #672/#673. Coach: Sol RC on #674 (0/2/2) and #676 (0/1/1) at FIX ROUND 2 heads -> B-CM3-117 running.
- Production read-only check 23:5x: _prisma_migrations has no 20270210000000_s_fee_charge_settlement row (189 rows total; latest
  20270301000000_notification_zone_provenance_reminder_generation). Supabase plan still free.
- Day rolled over at 00:00: 10-03 totals merged 12, deployed 5. Scoreboard 00:26: Launch path 1/7 | merged today 0 | deployed today 0 |
  open decisions 2 | credits used 0/45k (owner's last number).
- Running (5): B-RECUR5B-117 (b_recur5b_117_recurring_680_696_round_5_mutggz81), B-TR2-117 (b_tr2_117_trials_672_673_mutgoetv),
  B-661-R7-117 (b_661_r7_117_661_round_7_tests_pr_muthq005), AUD-OPUS-F23-117 (aud_opus_f23_117_fees_682_683_muths8b9), B-CM3-117
  (b_cm3_117_coach_674_676_round_3_muthz7ib).

## 2. Agents in flight (23:05 PDT; job board handoffs/op-117/JOBS117.md, common rules _COMMON_117.md)
Concurrency floor 5 (owner 22:17: drain back to 5 and keep 5). Running now (5):
| job | PRs | model | subagent id |
|---|---|---|---|
| B-FEES-117 | fees round 13 #681-#686 (+ main merged into #681 first, + tests piece above F4) | Opus builder | b_fees_117_fees_stack_round_13_681_686_mutcpp71 |
| B-PRIV-FU-117 | new backend PR (no emails in logs; Apple steps) + new mobile PR (DeleteAccountScreen copy) | Opus builder | b_priv_fu_117_611_follow_ups_mutdfoif |
| B-CIQ-117 | new backend PRs: data-export order tiebreak; SBOM check fail-closed | Opus builder | b_ciq_117_ci_quality_follow_ups_mutdfoir |
| AUD-SOL-661R5-117 | #661 @ 957e3677 | Sol | aud_sol_661r5_117_661_round_5_mutec7ji |
| AUD-OPUS-661R5-117 | #661 @ 957e3677 | Opus | aud_opus_661r5_117_661_round_5_mutef226 |
Ended this session (reports in ops/reports/): wave 1 lenses (CI, PRIV3, F12, F34, 661, CM1, CM2), B-F56, B-RECUR3, B-661-R5, B-DUN,
B-CM, B-W2, B-TR, P12/L12/S12 lens pairs.
Reports: /home/user/workspace/ops/reports/<JOB>.md (sandbox; copied into handoffs/op-117/reports/ at milestones). Concurrency: drain to
5, keep 5. Next launches in priority order: lens pairs on each stack its builder marks READY (fees F1-F4b, F5/F6 deltas; recurring
R1-R4; #661; coach M1/M3/M4; dunning D1-D5; trials T1-T3; HC H2-H6), then mobile P3 #344, L3 #354, S3 #347, Money N1-N4 #348-#351,
Programs #355-#358, mobile #340, #312 (+ backend push #692-#693 fast-follow).

## 3. Per-PR completeness (backend unless "mobile"; heads verified 21:23-21:38 PDT)
| PR | piece | head | verdicts at head | CI at head | next step |
|---|---|---|---|---|---|
| #694 | CI: jest worker memory + typecheck guard | 61d42f09 | in audit (CI pair) | 11/11 green, READY posted | lenses -> merge first |
| #695 | CI: SBOM gate determinism | e80cefad | in audit (CI pair) | OOM rerun pending | operator posts READY when green -> merge |
| #611 | privacy policy (step 1) | b09f2061 | in audit (PRIV3 pair); prior Opus RC at acf9ff0f closed by round 9 | 11/11, READY posted | dual APPROVE -> merge with mobile #315 -> deploy |
| mobile #315 | trust-center links | 0277ce10 | Opus+Sol APPROVE | 3/3 green, CLEAN | merges with #611 |
| #681 | fees F1 (base main) | 9de3135c | in audit (F12 pair) | green | stack lands as one (rule 11) |
| #682 | fees F2 | a5d6a434 | in audit (F12 pair) | red by design (4 tests, F4 fixes) | |
| #683 | fees F3 | 35a18539 | in audit (F34 pair) | red by design (3 suites/9 tests), READY posted | |
| #684 | fees F4 | e9ee033d | in audit (F34 pair) | green, READY posted | |
| #685 | fees F5 (tests) | 7425bb93 | was dual APPROVE pre-restack | red: 7 s-fee-r5 copy tests | B-F56-117 round 5 -> F56 lens pair |
| #686 | fees F6 (tests) | 6f1b94a9 | was dual APPROVE pre-restack | red (inherited + OOM) | B-F56-117 restack -> F56 pair |
| #678 | recurring R1 (base #686) | ebbd170e | none at head | red (inherited s-fee-r5) | B-RECUR3 restack; FIX ROUND 4 comment |
| #679 | recurring R2 | f83dbdd2 | none at head | OOM rerun pending | B-RECUR3 restack; FIX ROUND 4 comment |
| #680 | recurring R3 | 929f3968 | none at head | red: 4 tests on old 23-h cutoff | B-RECUR3 finishes B-680-2 + R4 split |
| #661 | PaymentSheet credentials | 6fdc35de | in audit (661 pair) | OOM rerun pending | operator posts FIX ROUND 4 draft (ops/b661-116/r4-comment-draft.md) when green |
| #674 | coach M1 (base main) | d9327546 | in audit (CM1 pair) | 11/11, READY posted, BEHIND | |
| #676 | coach M3 | cf5ef18b | in audit (CM1 pair) | green, READY posted | Opus pause note: possible tax CSV double refund |
| #677 | coach M4 (tests) | 1f746547 | Sol in audit (CM2); Opus owed | green, READY posted | launch AUD-OPUS-CM2-117 |
| #675 | coach M2 idempotent create (base main) | e45b06f9 | Opus APPROVE; Sol in audit (CM2) | 11/11, BEHIND | dual APPROVE -> refresh (rule 12 if byte-identical) -> merge; #672 refreshes second |
| #687 | dunning D1 (base main) | f8e47bf4 | none | 11/11, READY posted | dunning builder restacks f8e47bf4 up D2-D5 |
| #688 | dunning D2 | 6718d211 | none | green, READY (pre-restack) | restack |
| #689 | dunning D3 | 6cead7ec | none | green, READY (pre-restack) | restack |
| #690 | dunning D4 | 0681babd | none | SBOM-race rerun pending | post ops/reports/drafts/B-D34-116-690-fix-round-1.md when green; restack |
| #691 | dunning D5 (tests) | 0f24a8fa | none | green; restack note posted | restack, then READY |
| #671 | trials T1 (base main) | 1efac91e | none | 11/11, READY posted, BEHIND | lenses after recurring lands |
| #672 | trials T2 | 4fa2fe4a | none | green, READY posted | second of #672/#675 refreshes packages files |
| #673 | trials T3 | 9719cb88 | none | green, READY posted | composes with #680 one-trial check (C-656-1) |
| mobile #359 | HC H1 (base main) | e0f3d2a7 | Opus+Sol APPROVE | green | lands with the HC stack |
| mobile #360 | HC H2 | 4a508d8b | Opus APPROVE, Sol RC (B-360-1) | green | push fix fde1875e (wip/op116/B-W2-116-360), restack #361-#364 |
| mobile #361-#364 | HC H3-H6 | 85b2439b, 61cb0fac, 9ab951f6, 78ee52c0 | none | green | after restack: W34/W56 lens pairs; then backend flag flip |
| mobile #342-#344 | payment sheet P1-P3 | 72821495, af984441, f629e0f9 | see threads | | pairs with recurring #680 |
| mobile #345-#351 | coach setup S1-S3 + Money N1-N4 | see GitHub | see threads | #349/#350 red by design | after coach backend deploy |
| mobile #352-#354 | dunning lockout L1-L3 | 58b80914, e22acc84, 37ed3d56 | dual APPROVE on original #322 | | after dunning backend deploy |
| mobile #355-#358 | Programs G1-G4 | 902c64a6, 40ee678a, b364b9ea, 4dcf0aff | dual APPROVE on original #328 | | remainder |
| #642 / mobile #312, mobile #335, mobile #338/#339/#340 | remainder | see GitHub | | | after the stacks above |
Not now (owner day-1 scope default = fast-follow): push #692-#693 (needs FCM key), Roman (#667-#670, #331), S-SCHED-2 (#634, #653,
mobile #365-#367, #336), annex (#655, #657-#660, mobile #337), flag PRs #643/#650, mobile #341, Dependabot and importer PRs.

## 4. Resume order (owner, 21:20 PDT; do in order, smallest wall-clock first)
CI fixes #694 + #695 first -> launch step 1 (#611 round 9 + mobile #315 together, deploy) -> money (fees stack as one -> deploy ->
recurring #678-#680 + R4 -> deploy -> trials) and #661 -> coach -> dunning -> Health Connect -> remainder. Launch steps (LAUNCH_ONE_PAGER.md):
1 privacy, 2 money, 3 coach, 4 failed payments, 5 Health Connect, 6 remainder, 7 builds and store review.

## 5. How to be better (116's lessons + 117's)
- One builder per stack runs bottom-up until every piece is READY; only then launch that stack's lens pair. A restack after approval
  costs a merge-only delta on every piece above it.
- CI capacity is the bottleneck (20 shared Actions jobs). Past ~20 queued runs, lean toward lenses over builders; run ops/ci_janitor.sh
  every loop. Land #694 (jest OOM) and #695 (SBOM race) first: both cause most reruns.
- Turn in-flight work into merges before starting new work. Track merges per hour and credits per merged PR.
- Verify before you write (read merge parents first). Refresh only the PR next to merge.
- A lens's saved draft verdict is evidence for a fresh lens of the same model, not something the operator publishes.

## 6. Operator loop (every 10-15 minutes)
ci_janitor.sh + queue check -> read reports/mail -> post READY drafts at green heads -> merge dual-APPROVE green current heads (stacks
land as one: rule 11) -> deploy audited main (plan -> apply -> deploy -> verify /health, /readyz, _prisma_migrations) -> refresh the next
approved PR -> launch replacements (keep the concurrency rule) -> update THIS file at every milestone; every ~2 hours also
LAST_OPERATOR_STATE.md, LIVE_STATE.md, DECISION_LOG.md, LAUNCH_ONE_PAGER.md; push to tgp-agent-context main.

## 7. Sandbox rebuild
Clone backend, mobile, tgp-agent-context into /home/user/workspace/repos/; restore /home/user/workspace/ops/ with
`git -C repos/growth-project-backend archive origin/wip/op116/ops-snapshot ops | tar -x -C /home/user/workspace` (fetch
refs/heads/wip/op116/* first), then copy handoffs/op-116/tools/* into ops/ (cp -n); lanes: ops/lanes117/ (copy handoffs/op-117/*.md);
copy each product repo's package.json + lockfile to /home/user/workspace/deps/<backend|mobile>/ and run
`setsid nohup bash ops/install_deps.sh > ops/install_deps.log 2>&1 < /dev/null & disown`. Production URL:
https://backend-spring-lake-3890.fly.dev (/health, /readyz). Supabase via the connector (execute_sql read-only checks).
gh/git need bash api_credentials=["github"]; `gh run view --job <id> --log-failed` reads failing logs.

## 8. Open owner decisions and owner-only actions
1. Day-1 scope: push #692-#693, Roman, S-SCHED-2, annex = fast-follow (default).
2. LAUNCH_ONE_PAGER.md approval (default: approve as drafted).
Owner-only: Supabase Pro upgrade in the dashboard (approved 21:31); Stripe events setup_intent.succeeded (before the recurring deploy)
and customer.subscription.trial_will_end (before the trials deploy); Stripe Billing retry "If all retries for a payment fail" = "leave
the subscription past-due"; FCM V1 key; Apple Sign-in keys; POSTHOG_KEY confirm; EAS builds (spend); Play Console Data safety + Health
apps forms.

## 9. Binding rulings
116's rulings (handoffs/op-116/HANDOFF_AGENT_117.md section 7) and _COMMON_116.md section 10 remain binding.

## Change log of this file
- v1 2026-10-03 21:38 PDT: created by agent 117 after takeover and wave-1 launch.
- v2 21:52 PDT: #611 + #315 merged; verdict results; queued builder rounds.
- v3 22:07 PDT: launch step 1 deployed; #675 and #694 merged; four builders launched.
- v4 22:24 PDT: #695 merged; wave 2 launched (15 running); current agent table.
- v7 10-04 00:26 PDT: #661 r6/r7, fees r14 + restack, recurring r5A, coach r3, day rollover.
- v6 23:31 PDT: fees r13, recurring restack + verdicts, new follow-up PRs #697-#700/#368.
- v5 23:05 PDT: builders done (recurring, #661, coach, dunning, trials, HC READY); mobile P/L/S verdicts; lens queue; ops snapshot.
