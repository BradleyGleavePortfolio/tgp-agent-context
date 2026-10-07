# Operator 127 to agent 128 handoff

Final draft written 2026-10-07 ~12:00 PDT during the owner-ordered wind-down (owner 11:49 at 39.5k; 41k at 11:57). Verify every head,
run and verdict on GitHub before acting; GitHub main wins over this file. Agent 127's subagents may still finish PRs after this file:
read their READY / AUDIT comments on GitHub and their reports (sanitized copies are not pushed; the PR comments are the record).

## Owner orders today (verbatim in TGP_SOURCE_OF_TRUTH.md C1; summary in A6.10)

- 09:24: finish v1 blockers and Roman's increased intelligence; master workout builder + AI workout building done and ON; fresh APK;
  tester accounts prepped; App Store images. Coach sharing on a button clients already tap.
- 09:31 standing approvals: production gate approvals (deploys + fly-env-sync) yes; review accounts set and seeded (done); coachless
  Version B (merged m#454); AI builder ON as soon as it passes (ON since 10:44).
- 10:18: Roman memory ON BY DEFAULT for clients; off switch at the very bottom of Settings > Roman AI. Real purchase test approved
  (owner connects Stripe on his coach account, buys the cheapest package from the review client with a real card, refunds; operator
  watches read-only) — NOT done yet; needs the owner.
- 10:20-10:35: screen redo from the A23 targets + mobile design guide; SIX BINDING RULES (honest copy, no dead buttons, luxurious simple
  feeling, all important info present, mentally deloading, no pathway or function cut) — ops/_COMMON_127.md.
- 10:25: Roman portrait is original art. 10:45: no slowdown until 44k (superseded by the 11:49 wind-down).
- 11:26: six tabs with labels; dark mode hidden for launch (redo code uses theme colours so dark later is a palette swap); client
  Settings grouped (DES-S); forest green primary buttons (DES-J); Health rings get STARTER goals for everyone (5,000 steps, 20 exercise
  minutes, 250 move kcal) labelled "Starter goal" (DES-H, not started).
- 11:44: owner wants ~30 more redo jobs -> TRANCHE 3 (DES-AA..DES-BD) written by the auditor: ops/DES-JOBS-PASTE.md, launch-order table at
  the top of "# TRANCHE 3", file lists per job, script-checked disjoint. Not launched. This is agent 128's starting plan for the redo.
- 11:46 RULING: Roman's notes are deleted ONLY on account deletion. Memory off / Roman withdrawal / chat deletion keep notes (unread while
  memory is off). No "Delete my notes" control. Implemented by b#845 (backend) + m#463 update (copy) + b#844 (policy text) — in review.

## Production

- Deploy 21 97c07437 (09:51); 22 6664ced0 (10:38, run 37660243967); 23 f73c6521 (11:22, run 37665898547). /health ok, /readyz db up.
- AI workout builder LIVE 10:44 (manifest FEATURE_MWB_AI_LIVE_CREATE, AI_GATEWAY_ENABLED, AI_GATEWAY_PROVIDER=anthropic,
  AI_GATEWAY_CAPABILITIES=draft.create_workout_plan,draft.edit_workout_plan). Lesson: after deploy 22 the staged values were "Deployed"
  but absent in the machine; fly-env-sync apply with deploy_staged=true fixed it. After any flag change read the plan's in-machine column
  and check behaviour (GET /api/ai/gateway/workout-builder/status as the review coach -> state "on").
- DEPLOY 24 PENDING: backend main c2c97612 (b#833 b#834 b#838 b#835 b#831 b#840 b#841 merged after deploy 23) — CI was queued at 11:57
  (GitHub runner backlog). When main CI + CodeQL + SBOM are green at the then-current main head, deploy it (all flag-off/inert except
  b#841 AI builder exercise names, which changes live AI builder behaviour for non-seed rows — reviewed, intended).
- Roman flags NOT set: FEATURE_ROMAN_MEMORY, FEATURE_ROMAN_TOOLS, FEATURE_ROMAN_PLAYBOOK. Memory flip only after b#845 + b#844 + m#463 are
  merged, deployed, and the m#463 switch is in a shipped store build. Tools flip after R11-T3 (roman_answer_contract_and_golden_cases
  builder; registers protein + all T1/W1 numeric facts with the reply check) + b#842 (W1) + b#843 (T1b). Playbook flip after b#837.
- Digest emails: b#828 live (links + unsubscribe). After 23:00 PDT SELECT NotificationDigestLog to verify sends.
- Money: no real payment ever processed; no coach has Stripe connected; the real purchase test is pending the owner.

## Merged today (40 by 11:58)

Backend: 809 813 815 823 825 826 828 829 824 827 830 832 836 833 834 838 835 831 840 841.
Mobile: 453 455 457 454 459 460 458 461 466 468 472 467 462 456 465 464 476 480.

## Open PRs at 11:58 (all agent 127; verify verdicts at exact heads; merge only via ops/merge_if_dual.sh)

Backend: b#837 P3B-2 playbook builder, b#839 share-link buyer sharing, b#842 W1 baselines — all dual APPROVE, BLOCKED only on queued
required checks (rls-floor-guard, rls-live-tests, community-live-tests, build-and-test); merge when green. b#843 R11-T1b read_history
(device health etc.), b#844 policy text for the 11:46 ruling, b#845 memory off keeps notes — need lenses.
Mobile: m#463 memory switch (HELD by operator comment until updated for the 11:46 ruling; new head + fresh dual lenses), m#469 DES-T Home
honest copy, m#470 DES-V copy sweep (Sol REQUEST CHANGES at 110f9f74 fixed at ec5dc175 — needs fresh lenses), m#473 DES-V part 2, m#471
DES-F food logging, m#474 DES-R rest alert (CI had a failure — check), m#475 DES-J forest buttons, m#477 DES-S Settings grouped, m#479
DES-Q coach client file, m#478 operator copy fix (Roman community Today-empty line; T1). Merge order notes: m#469 before DES-K;
m#475 is a token flip, merge after the other DES PRs to avoid churn in snapshots.
Closed today as superseded: b#820, m#451.

## Builds and screenshots

- Interim APK 1: mobile b81f71c, run 37661643888, arm64 sha256 6c5d0f962577b0c66fb91a4d08ee97fb74e6917d6e6f783eca015e6e06413b2a,
  delivered 11:24 as "TGP Android test build — October 07".
- APK 2: branch ci/APK-127-2 pushed ~11:59 from mobile main 82c80133 (redo wave 1 partly merged). Check the run on that branch; download
  with `gh api repos/BradleyGleavePortfolio/growth-project-mobile/actions/artifacts/<id>/zip` (gh run download fails through the proxy),
  extract with python zipfile, verify sha256 against the proof file, deliver as "TGP Android test build — October 07 (2)". Never merge
  ci/* branches.
- Final APK after the remaining DES PRs merge: copy .github/workflows/apk-127.yml from ci/APK-127-2, set APP_SHA/APP_SHORT/branch.
- App Store screenshots: workflow on ci/SHOTS-127-2 (refreshed onto mobile main a1762860); signed-in dry run 37666990861 was in progress at
  12:00 — inspect every image. Re-run on final mobile main before submission (new ci/SHOTS-127-<n> branch, one commit on top of main;
  the workflow checks HEAD^ == APP_SHA). Review account secrets REVIEW_CLIENT_*/REVIEW_COACH_* are set on the mobile repo.

## Next, in order

1. Merge the dual-approved backend PRs when checks finish; deploy 24 at the then-current main SHA; /health, /readyz.
2. Get lenses on the open PRs above (agent 127's lens agents stop at 12:50). Merge DES PRs; then launch DES-K (Home layout; after m#469),
   DES-H (Health starter goals; after m#471), DES-P (Progress; after m#470/#473), and TRANCHE 3 in the auditor's launch order, with the
   owner's authorization for a fleet.
3. Roman: finish R11-T3, then the tools flip; memory flip per the order above; playbook flip after b#837 deploys.
4. Final APK + App Store screenshots on final mobile main; real purchase test with the owner.
5. Small follow-up from AIB-NAMES-127 report decision 2: when an injury area is set, injury-risky built-in exercises are dropped from the
   list the AI sees, so a squat in the workout appears to the model only as an id (2-line fix, T3).

## Open owner decisions

None at 12:00.
