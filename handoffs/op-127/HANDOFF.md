# Operator 127 to agent 128 handoff

Status of this file: LIVE DRAFT, refreshed by agent 127 until its credit handoff (owner: "no reason to slow down until 44k/45k").
Verify every head, run and verdict on GitHub before acting; GitHub main wins over this file.

## Owner orders today (verbatim quotes in TGP_SOURCE_OF_TRUTH.md C1 and A6.10)

- 09:24: finish all v1 blockers and Roman's increased intelligence; master workout builder + AI workout building done and ON;
  fresh APK; tester accounts prepped; App Store images. Coach sharing "sneak it in somewhere they already click accept".
- 09:31 standing approvals: production gate approvals (deploys and fly-env-sync) — yes; review accounts set and filled — yes (done);
  coachless copy Version B — merged (m#454); AI builder ON "as soon as it passes" — ON since 10:44.
- 10:09/10:18: Roman memory is ON BY DEFAULT for clients; off switch at the very bottom of Settings > Roman AI ("Roman needs all, every
  single bit, of data they ever produce or bring in"). Real purchase test approved (owner connects Stripe on his coach account, buys the
  cheapest package from the review client with a real card, refunds; operator watches read-only).
- 10:20-10:35: screen redo ASAP from the A23 targets + mobile design guide; six binding rules (HONEST COPY, NO DEAD BUTTONS, LUXURIOUS
  SIMPLE FEELING, ALL IMPORTANT INFO PRESENT, MENTALLY DELOADING, NO PATHWAY OR FUNCTION CUT) — in ops/_COMMON_127.md.
- 10:25: Roman portrait is original art; stays.
- 10:45: no slowdown until 44k/45k; fleet cap 20.

## Production

- Deploy 21 97c07437 (09:51), deploy 22 6664ced0 (10:38, run 37660243967), deploy 23 f73c6521 (11:22, run 37665898547): /health ok,
  /readyz db up.
- AI workout builder LIVE 10:44: manifest FEATURE_MWB_AI_LIVE_CREATE=true, AI_GATEWAY_ENABLED=true, AI_GATEWAY_PROVIDER=anthropic,
  AI_GATEWAY_CAPABILITIES=draft.create_workout_plan,draft.edit_workout_plan. Lesson: staged values showed "Deployed" but were absent in the
  machine after deploy 22; fly-env-sync apply with deploy_staged=true (run 37661054772) fixed it and verified. After any flag apply, run a
  plan and read the "In-machine value check" column, and check the behaviour endpoint
  (GET /api/ai/gateway/workout-builder/status as the review coach -> state "on").
- Roman flags NOT set: FEATURE_ROMAN_MEMORY, FEATURE_ROMAN_TOOLS, FEATURE_ROMAN_PLAYBOOK. Memory flip order: all of R11-M4 (#832),
  M5 (#834), L1 (#831), C2B (#835 backend, m#461 + m#463 mobile) merged AND deployed AND the mobile switch in a shipped build, then
  manifest + env-sync + behaviour check. Tools flip after T1 + T3 (+T2A #830, T2B #838 merged). Playbook flip after P3B-2 (#837) + P4 (#836).
- Digest emails: b#828 (working links + unsubscribe) live in deploy 22. After 23:00 PDT, SELECT NotificationDigestLog to verify sends.
- Money: no real payment has ever been processed; no coach has Stripe connected. The real purchase test is owner-approved and pending.

## Merged today (26 by 11:25)

b#809 b#813 b#815 m#453 b#823 b#825 b#826 b#828 m#455 b#829 m#457 b#824 b#827 b#830 b#832 b#836 m#454 m#459 m#460 b#833 b#834 b#838
b#835 b#831 m#458 m#461, then m#466 m#468 (11:27). Backend main after the 11:2x merges is NOT deployed yet (deploy 24 candidate:
#833 #834 #838 #835 #831 + whatever merges next; all flag-off or inert).

## Open PRs at 11:27 (check verdicts at exact heads)

- b#837 R11-P3B-2 playbook builder (retargeted to main + reopened; dual APPROVE at 89f5b398; waiting for main-base checks).
- b#839 B-SHARE-GUEST backend (retargeted + reopened; dual APPROVE at b70e5584; waiting for checks).
- m#456 V1-TRAIN-ENTRY (READY posted by operator, CI green after flaky rerun; needs both lenses).
- m#462 AIB job 6 adjust-for-client + assign (dual APPROVE 87c89dee; reopened to run main-base checks). DES-Q waits on it.
- m#463 R11-C2B memory switch (retargeted + reopened; dual APPROVE 7e67482a; waiting for checks).
- m#464 B-SHARE-GUEST mobile (retargeted + reopened; dual APPROVE 42cd11c0; checks may need another reopen).
- m#467 DES-A legibility + tab labels; m#472 DES-O coach landing: READY, need lenses.
- Close b#820 and m#451 as superseded (B-SHARE #827/#458 merged) with a comment.

## Fleet at 11:27 (agent ids under 4df35322-.../subagents/)

Lenses: opus_reviewer_for_new_prs_muybshg0, opus_reviewer_queue_2_muycv5g7, opus_reviewer_queue_3_muyeyqud, sol_reviewer_queue_2_muycu32t,
sol_reviewer_queue_3_muyeg8k7, sol_reviewer_queue_4_muyeyr0a. Builders: roman_read_tools_muycv50h (R11-T1), roman_personal_baselines_muyeg8ty
(R11-W1), ai_builder_exercise_names_muyeg8pi (AIB-NAMES), app_store_screenshot_pipeline_muybntgb (SHOTS), home_honest_copy_muyej6va (DES-T),
honest_copy_sweep_muyej6zr (DES-V), food_logging_makeover_muyej73y (DES-F), add_several_foods_in_a_row_muyej7c8 (DES-L),
rest_alert_and_quiet_finish_muyeyr4j (DES-R), coach_client_file_makeover_muyflh6c (DES-Q, blocked on m#462 — resume after it merges).

## Next, in order

1. Merge dual-approved PRs as checks go green (merge_if_dual.sh). Deploy 24 when backend main CI is green (exact SHA; approve_deploy.sh;
   /health, /readyz).
2. Launch DES wave 2 as prerequisites merge: DES-K (after DES-T + DES-A), DES-H (after DES-F), DES-P (after DES-V), DES-X (after DES-W,
   merged), DES-Z (after m#462). DES-N (five tabs), DES-S (Settings grouped), DES-J (one accent) only on an explicit owner yes.
3. Roman: R11-T3 toolbox after T1; then flips in the order above.
4. Final APK after the redo merges: throwaway branch ci/APK-127-<n> from mobile main, workflow copied from ci/APK-127-1
   (.github/workflows/apk-127.yml; set APP_SHA/APP_SHORT/branch); download via gh api .../actions/artifacts/<id>/zip, check sha256,
   deliver as "TGP Android test build — October 07" (interim build 1 = mobile b81f71c, sha256 6c5d0f96...413b2a, delivered 11:24).
5. App Store screenshots from SHOTS-127; real purchase test with the owner.

## Open owner decisions (asked 10:49 and 11:24, defaults recommended)

1. Tabs: keep six with labels. 2. Dark mode hidden for launch (DES-A already hides it). 3. Client Settings grouped (DES-S). 4. Forest green
for all primary buttons (DES-J). 5. Health rings: no fill until a goal is set (DES-H).
