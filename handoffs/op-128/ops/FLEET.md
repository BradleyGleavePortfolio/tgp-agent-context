# Agent 128 fleet (launched 13:1x PDT 10-07, owner 13:02 "scale to 25 agents")
| agent_id | job | model |
|---|---|---|
| opus_reviewer_a_muyjlvl0 | LN-OPUS-A-128 | Claude Opus 5.5 |
| opus_reviewer_b_muyjlvlg | LN-OPUS-B-128 | Claude Opus 5.5 |
| opus_reviewer_c_muyjlvlv | LN-OPUS-C-128 | Claude Opus 5.5 |
| opus_reviewer_d_muyjlvmc | LN-OPUS-D-128 | Claude Opus 5.5 |
| sol_reviewer_a_muyjlvl9 | LN-SOL-A-128 | GPT-6.1 Sol |
| sol_reviewer_b_muyjlvln | LN-SOL-B-128 | GPT-6.1 Sol |
| sol_reviewer_c_muyjlvm3 | LN-SOL-C-128 | GPT-6.1 Sol |
| sol_reviewer_d_muyjlvmk | LN-SOL-D-128 | GPT-6.1 Sol |
| finish_roman_history_pr_muyjlvn1 | FIN-T1B-128 (b#843) then AIB-INJ-128 | Claude Opus 5.5 |
| finish_privacy_text_pr_muyjlvnj | FIN-L2-128 (b#844) then CI-APT-128 | Claude Opus 5.5 |
| finish_memory_keeps_notes_muyjlvo3 | FIN-C2C-128 (b#845, m#463) DONE 13:33, both merged | Claude Opus 5.5 |
| finish_roman_answer_checks_muyjlvon | FIN-T3-128 (b#846) | Claude Opus 5.5 |
| finish_honest_copy_prs_muyjlvpo | FIN-DESV-128 (m#470, m#473) | GPT-6.1 Sol |
| finish_coach_client_file_muyjlvqv | FIN-DESQ-128 (m#479) then DES-AC-127 | GPT-6.1 Sol |
| settings_in_seven_groups_muyjlvrn | DES-S2-128 | GPT-6.1 Sol |
| health_with_starter_goals_muyjlvsm | DES-H-128 | GPT-6.1 Sol |
| home_layout_redo_muyjlvtd | DES-K-128 (after m#469) | GPT-6.1 Sol |
| redo_client_messages_muyjlvu6 | DES-AA-127 | GPT-6.1 Sol |
| redo_meal_plan_muyjlvv7 | DES-AB-127 | GPT-6.1 Sol |
| redo_habits_and_mood_muyjlvw6 | DES-AD-127 | GPT-6.1 Sol |
| redo_assigned_workout_muyjlvwu | DES-AE-127 | GPT-6.1 Sol |
| redo_community_today_muyjlvxm | DES-AK-127 | GPT-6.1 Sol |
| redo_notification_center_muyjlvyb | DES-AM-127 | GPT-6.1 Sol |
| redo_more_menu_muyjlvyu | DES-AJ-127 | GPT-6.1 Sol |
| redo_calendar_and_session_muyjlvzg | DES-AF-127 | GPT-6.1 Sol |
| redo_booking_sessions_muykena3 | DES-AG-127 (13:34) | GPT-6.1 Sol |
Queue after these (fresh agents as slots free): DES-AG, AH, AI, AL, AN, AO, AS, AT, AR, AU, AV, AW, BA, BB (Opus), BC, BD; then AQ (after AA),
AP + AX (after m#470), AZ (after DES-H), AY (after m#463), DES-P-128 (after m#470 + m#473).

## Operator log
- 13:15 deploy 24 = 0d179edb (run 37680177041), /health ok, /readyz db up.
- 13:26 owner credits: 4.8k/45k used.
- 13:28 merged b#845 (R11-C2C memory off keeps notes), m#469 (DES-T Home honest copy), m#474 (DES-R rest alert + quiet finish). Merged today 48.
- Follow-up C for a later mobile builder: docs/HAPTICS.md save row heavyImpact() -> success() (from m#474).
- 13:33 merged m#463 (Roman memory switch, notes kept copy). 13:34 launched DES-AG-127. Deps READY 13:33.
- 13:39 owner credits 6k/45k. 13:42 heavy.sh -> 2 slots (CPU-bound: 12-15 agents were queued for one local test slot).
- 13:42 owner approved 30 agents ("yes, starting as soon as the test line stays under 5"). 13:44 line 0-2 waiting; launched:
| redo_exercise_library_muyksa3u | DES-AH-127 | GPT-6.1 Sol |
| redo_routine_builder_muyksa43 | DES-AI-127 | GPT-6.1 Sol |
| redo_community_space_muyksa4a | DES-AL-127 | GPT-6.1 Sol |
| redo_recipes_muyksa4h | DES-AN-127 | GPT-6.1 Sol |
| redo_grocery_and_prep_muyksa4n | DES-AO-127 | GPT-6.1 Sol |
- 13:44 merged b#846 (R11-T3) and m#470 (DES-V part 1). Merged today 51. Backend main a2dccecb.
- 13:47 FIN-T3-128 done. FLIP-PB-128 blocked: coach disclosure (privacy :285, terms :585) -> R11-L3-128 (FIN-L2 agent, after #844 merges).
  Playbook flips together with memory. Playbook stays in the coach's own export (code cites owner D5; legal access right).
  R11-T3-FU-128 (FIN-T3 agent): reply-check U1 (roman-post-check.ts:336); deploy 25 held for it (also waits on #843 / #844 if close).
- 13:49 merged m#482 (DES-AK community Today), b#844 (R11-L2 policy), m#484 (DES-AJ More menu). m#481 conflict (README only) -> DES-S2 agent fix round 2.
- 13:51 README rule broadcast to all mobile builders (edit own entry in place, never append; check mergeable before READY).
- 13:52 launched (replacing AK, AJ):
| redo_edit_profile_muyl1g47 | DES-AP-127 | GPT-6.1 Sol |
| redo_packages_and_checkout_muyl1g4f | DES-AS-127 | GPT-6.1 Sol |
- 14:01 owner credits 10.33k/45k. 14:04 cancelled 7 stale backend runs hung on apt (9 runner slots); mobile queue 19 -> 2. Watchdog idea blocked by safety check: manual sweeps. 14:07 merged b#847 CI-APT, b#843 R11-T1b, m#487 DES-AM.
- 14:10 owner 14:07 "Lets continue working through the 30 screens". Second screen per builder, started while the first PR waits for verdicts:
  AA agent -> AQ (after #491) | AF -> AR | AE -> AU | AB -> AV | AD -> AW | AH -> AX | AI -> AY | AN -> BA | DES-K -> BC | DES-H -> AZ (after #483)
  AM -> BD | FIN-DESV -> DES-P-128 (after #473) | AG -> AT | FIN-T3 (Opus) -> BB (after R11-T3-FU READY). All 30 tranche-3 screens now assigned.
- 14:11 merged b#848 AIB-INJ, m#488 DES-AF. 14:13 owner 14:08 override sent (builders finish at READY). 14:14 fix lane: fix_lane_sol_a_muylr8sl, fix_lane_sol_b_muylr8st, fix_lane_opus_muylr8t0. 14:16 FIN-T1B done; LEFTHOOK=0 rule.
- 14:17 DES-AD done (#489 READY). launched FLIP-TOOLS-128.
- 14:18 DES-AM done. launched DES-AR-127.
- 14:20 DES-K done (#492 READY; child-card follow-up DES-K2 queued). launched DES-AT-127.
- 14:21 DES-AB done (#490 READY). launched DES-AU-127.
- 14:14 merged m#489 DES-AD, m#486 DES-AC, m#481 DES-S2. 14:23 DES-H done (#483 Sol B unfixed -> FIX-SOL-A). launched DES-AV-127.
- 14:24 DES-AH done (#495 READY). launched DES-AW-127.
- 14:14 owner: "was romans increased intelligence completed in production? ... if not lets go up to 35 agents" + Opus agent on grocery/meal plan.
  14:27 fleet cap 35. Launched: roman_all_switches_audit_muylyz9k (R11-INT-AUD-128), meal_plan_and_grocery_audit_muylyz9v (NUTR-AUD-128),
  redo_day_1_onboarding_muylyza4 (DES-AX), redo_consultation_muylyzad (DES-AY), redo_preferences_muylyzak (DES-BA). DES-S2 done (merged).
- 14:31 DES-AN done (#494 READY; allergy B -> ALLERGY-128 fix_false_allergy_promise_muym0ah2). 14:33 FIN-DESQ done (#479 round 2 READY). launched DES-BB-127 (Opus).
- 14:36 FIN-T3 done (#849 READY 14:19; deploy 25 waits for it). m#495 dual APPROVE but CONFLICTING -> FIX-SOL-B. launched DES-BC-127.
- 14:38 FIN-DESV done (#473 READY). launched DES-BD-127.
- 14:40 FIN-L2 done (#850 R11-L3 READY 14:22). DES-AI done (#493 READY). launched lenses LN-OPUS-E-128, LN-SOL-E-128 (review backlog 8). Playbook credit-spend question -> R11-INT-AUD.
- 14:43 DES-AA done (#491 round 2 READY). Slot kept free for audit fix jobs.
- 14:46 DES-AP done (#496 READY).
- CORRECTION (14:25): FLEET entries stamped 14:31-14:46 actually happened ~14:17-14:25 (operator stamped guessed times). 14:25 merged m#492 DES-K, m#479 DES-Q. DES-AL done (#498 READY), DES-AS done (#499 READY; checkout offline-copy follow-up after #499).
- 14:31 owner 14:25: decision 1 YES (memory + playbook on once coach wording live); 16.9k/45k; "keep going at 30+ agents", top models for UI/UX,
  first-week audits, "no agent cap" while sandbox healthy. Done since: NUTR-AUD (8 fix jobs, 5 decisions), R11-INT-AUD (TOOLS/MEMORY GO after
  deploy 25; PLAYBOOK NO-GO: b#850 + B2 coach credits), DES-AG (#497 READY), FIX-SOL-A (#483 round 3 READY).
  Launched 20 (all Opus except NUTR-BE, NUTR-COPY Sol): FLIP-MEM-PB, R11-FIX, PB-POOL (owner decision pending), NUTR-BE, FIX-490/494/500,
  NUTR-COPY, DES-K2 (Opus), DESIGN-QA, FW-ONB/FOOD/TRAIN/BODY/COACH/MONEY/ROMAN/NOTIF/ACCOUNT/COMM.
- 14:33 OWNER 14:33 (verbatim): "LETS LET ALL 42 AGENTS FINISH SAFELY AND NOT INTERRUPT THEM, and then start stop-and-drain down back to 10
  agents. Basicall just dont launch any new work for now". DRAIN MODE: no new launches; running agents finish untouched; operator keeps
  merging dual-approved PRs, deploy 25, flag flips (owner-approved). CONFLICT-128 (resolve_merge_conflicts_muymjskq) launched 14:33 just
  before the message. Done since: DES-AE (#485 READY), DES-AV (#503 READY), FLIP-TOOLS (#851 READY, 14:32).
  Merged ~14:32: b#850, b#849, m#500, m#498, m#496, m#491. Conflicts (dual-approved): m#493, m#473 -> CONFLICT-128.
- 14:41 DEPLOY 25 started: c7caffff run 37691195804 (no prisma changes). Owner 14:39 decisions: PB keeps coach pool (PB-POOL redirected to option A copy); Log this meal YES; coach recipe writing tomorrow (iOS submission tonight); grocery+shopping -> ONE list; allergy filtering REQUIRED. Owner 14:40: 'only thing between us and IOS submission is a final build with all mobile UI updates + tester account creation'.
- 14:46 deploy 25 run 37691195804 FAILED at 'Record currently running machines': flyctl: command not found (setup-flyctl step green; same pinned action worked 13:15; fly-deploy.yml unchanged). Retried: run 37691740962.
- 14:54 DEPLOY 25 LIVE: c7caffff run 37691740962 success (retry); /health ok uptime 74s. Deployed today: 7. Operator README merges pushed: m#504 431f65b8, m#490 e9da3274, m#485 6515839a (re-review needed). Merged 14:51: m#508, m#493.
