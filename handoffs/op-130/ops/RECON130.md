# RECON130: operator agent 130 recon (2026-10-07, 17:53-18:07 PDT; GitHub verified, times from TZ=America/Los_Angeles date)

## Mains
- Backend main 272dc8ef9dd77255984dca6cb9fa2ac00900c987 (b#858 merged 17:35).
- Mobile main 028f2926eddced3f69099f4766681de38c203327 (m#502 merged 17:35).
- Merged since agent 129's 16:50 handoff:
  - Backend: b#858 (food undo backend), b#860 (coach guidelines readable), b#863 (leaderboard names filtered), all at 17:35.
  - Mobile: m#526, m#521 (16:58); m#528 (App Store submit profile + iOS build 7), m#527, m#490 (17:17); m#531, m#522 (17:22-17:23);
    m#532 (coach Billing crash fix), m#529 (self-harm 911/988), m#502 (17:35).
- Last 12 merged per repo: ops/RECON130.md was built from `gh pr list --state merged` sorted by mergedAt.

## Production
- /health ok (uptime 392 s at 17:57, the new machine) and /readyz db up.
- Last fly-deploy: deploy 28, run 37709600403, success 17:50:48 at backend main 272dc8ef (production = backend main).
  Previous: deploy 27 run 37702604355 at fd190078 (16:37).
- Prisma: nothing changed since 272dc8ef (main has not moved). The three PRs about to merge (b#864, b#862, b#859) touch no prisma files,
  so deploy 29 needs no migrations input.

## Flags (backend .github/fly-env-desired-state.json on main)
- FEATURE_ROMAN_MEMORY "true" (applied 15:57, fly-env-sync run 37699335256). FEATURE_ROMAN_PLAYBOOK "unset". FEATURE_ROMAN_TOOLS "true".
- Last fly-env-sync runs: 37699335256 (15:56, apply), 37696669686 (15:30 plan).

## iOS
- No iOS build has been cut yet: it is 18:0x and the owner's cut is 23:00 from mobile main. iOS builds run on Expo, not in GitHub Actions
  (mobile workflows: APK, screenshots, CI, CodeQL only). No ci/APK-129-* branch exists (APK-FINAL-129 never started).
- m#528 (submit profile, build 7) merged 17:17, so it is on mobile main and will be in the 23:00 build.
- HEALTH-STRINGS-130 has not merged; it must land before the build (app.json strings reach users only in a new build).

## Group A (open at 17:35; 8 PRs; all still open)
| PR | head | lines | CI | state at head | needs |
|---|---|---:|---|---|---|
| b#864 CF-NOTIF-DIGEST (T2) | fbf4d1a9 | 544 | green | READY 17:04; Opus APPROVE 17:14; Sol APPROVE 17:35 | operator merge (done at execute) |
| b#862 CF-COMM-BE (T3) | a3401139 | 467 | green | Opus APPROVE 17:12; Sol APPROVE 17:33 | operator merge |
| b#859 CF-BODY-J2 (T4) | b7f74c4e | 258 | green | Opus APPROVE 17:11; Sol APPROVE 17:34 | operator merge |
| m#530 CF-ONB-LEAN (T3) | 308e0a3b | 702 | green | CI fixed by FIX-SOL-129; READY 17:45; Opus + Sol APPROVE 17:49 | operator merge |
| b#861 ROMAN-GUARD (T4) | c3f69a8a | 165 | green | Opus APPROVE and Sol REQUEST CHANGES (B-861-SOL-129-1) at old head cf1c4176; FIX-OPUS-129 pushed c3f69a8a 17:43 with no FIX ROUND READY | FIX-OPUS-130: verify fix, post FIX ROUND 2 READY; both lenses delta |
| b#855 FLIP-PB (T4) | f92f6936 | 11 | green | never READY; conflicts with main in fly-env-desired-state.json and docs/runbooks/launch-flags.md | FIX-OPUS-130 merge main after PB-GAP-130 merged+deployed and m#513 merged; READY; both lenses |
| m#524 CF-HOME-START (T1, Sol-built) | 0eca5fc2 | 114 | green | Opus RC 16:58 and Sol RC 17:16, same root cause (add `initial: false` to the two Home navigate calls + a Resume-Discard-Train test); stale FIX CLAIM by FIX-SOL-129 (comment 6049824933) | FIX-SOL-130 |
| m#513 PB-POOL-A (T3, Opus-built) | 79e0760d | 33 | green | Opus APPROVE 15:24; Sol RC 16:11 (B-513-SOL-129-1: "only when something new was added" is untrue) | FIX-OPUS-130 (T3), copy consistent with PB-GAP-130 |

## Group B (all 9 branches at the stated head, each 1 commit ahead, clean merge with main, no PR yet)
| finisher | branch @ head | behind main | lines | files |
|---|---|---:|---:|---:|
| MONEY-PLANS-FIN-130 | mobile agent129/cf-money-plans-128 @ 331a3a58 | 96 | 486 | 7 |
| MONEY-MEMBER-FIN-130 | mobile agent129/cf-money-member-128 @ f4d1d169 | 81 | 565 | 3 |
| SETTINGS-FIN-130 | mobile agent129/cf-settings-128 @ 658e5def | 96 | 398 | 7 |
| COMM-THREAD-FIN-130 | mobile agent129/cf-comm-thread-128 @ d6e7900a | 96 | 530 | 5 |
| LOGPLAN-FIN-130 | mobile agent129/cf-logplan-128 @ 74b605e1 | 96 | 466 | 3 |
| SHARE-GATE-FIN-130 | backend agent129/cf-share-gate-128 @ dc75b0e5 | 9 | 501 | 8 |
| ALLERGY-FIN-130 | backend agent129/cf-allergy-128 @ be06333c | 9 | 797 | 13 |
| COACH-PAY-BE-FIN-130 | backend agent129/cf-coach-pay-be-128 @ 001f6b21 | 7 | 792 | 12 |
| ROMAN-COPY-B-FIN-130 | backend agent129/cf-roman-copy-b-128 @ f772b8d7 | 7 | 428 | 11 |
- Patches (tgp-agent-context handoffs/op-129/reports/): both exist and pass `git apply --check` on mobile main 028f2926.
  - CF-TRAIN-TAB-128.wip.patch: 2 files (WorkoutScreen.tsx + its test), about 1,070 changed lines: over the 800 target, under 1,500.
  - CF-FAST-CALM-128.wip.patch: 10 files, about 650 lines; shares src/hooks/useSettings.ts with cf-settings-128.

## Plan check (files on main, line references, overlaps)
- All named files exist on main. Path corrections: coach-home.service.ts is src/coach/home/coach-home.service.ts; v1-coach.service.ts is
  src/v1/v1-coach.service.ts; healthKitClient.ts is src/services/health/healthkit/healthKitClient.ts.
- Line references match main: app.json:29-30 and :195-196 (Health strings), SettingsScreen.tsx ~:336 (Fasting Alerts row; no
  cancelFastEndAlert call there yet), dunning-v2.copy.ts:51-79 ("I will try again tomorrow. You need do nothing") and ROMAN_STEMS :221,
  dunning-v2.dispatcher.ts:220 (pushToUser 'Payment'), roman.prompts.ts surfaceFraming :125-127, coach.service.ts archiveClient :325,
  unarchiveClient :359, getClientTimeline :402, api.ts performRefresh :231 and handleRefreshFailure :287, PaywallSheet COACHLESS_* :45-47,
  notificationsApi.ts normalizeNotification :310, ConsentService.coachCanAccess in src/consent/consent.service.ts.
- Overlaps found (file shared with another open PR, branch or patch):
  - NEW: SESSION-KEEP-130 x SETTINGS-FIN-130 on src/screens/client/SettingsScreen.tsx -> SESSION-KEEP adapts: merges origin/main after
    SETTINGS-FIN-130 merges, before READY; its SettingsScreen hunk is the sign-out confirm only.
  - NEW: COACH-ROMAN-SURFACE-130 x ROMAN-COPY-B-FIN-130 on src/roman/roman.prompts.ts (same function surfaceFraming, adjacent lines) ->
    COACH-ROMAN-SURFACE waits for ROMAN-COPY-B-FIN-130 to merge.
  - Known: COACH-ROW-SCRUB-130 x SHARE-GATE-FIN-130 (coach.service.ts); FAST-CALM-FIN-130 x SETTINGS-FIN-130 (useSettings.ts).
  - Minor (merge main handles it): b#864 x cf-coach-pay-be-128 (src/common/env-validation.ts); b#855 x cf-roman-copy-b-128
    (test/roman/r11-seams.spec.ts); m#524 x cf-money-plans-128 (src/screens/client/README.md, own row in place).
  - m#513 edits src/components/coach/ai-budget/AIBudgetTutorialModal.tsx: CREDIT-REFILL-130 must not edit that file until m#513 merges.

## Stale claims (fleetscan 18:06)
- m#524: FIX CLAIM (FIX-SOL-129) @ 0eca5fc2 (comment 6049824933): agent stopped at 17:49 with no push -> delete at execute.
- Lens claims on b#864, b#862, b#859, m#530, m#513 are followed by their verdicts (finished, not blocking). b#861 claims are at the old
  head cf1c4176 (not blocking).

## D1 starts
- PB-GAP-130: now (start prompt). Note A6.12 open decision 2 (owner yes needed before building PB-GAP); the owner's start prompt lists it
  to start now and the owner said EXECUTE at 18:02.
- FOOD-UNDO-M-130: now (b#858 deployed in deploy 28 at 17:50).
- ALLERGY-M-130 and COACH-PAY-M-130: read-only prep now; build after ALLERGY-FIN-130 / COACH-PAY-BE-FIN-130 are deployed.

## Owner order 18:02 (new, agent 38)
"make sure that coaches can ACTUALLY pay TGP for credit pool refills - and that the multiplier between the displayed value of purchased
credits and hard cost amount for TGP is correctly quoted and delivered! Add that as agent lane 38 once i say EXECUTE!"
-> CREDIT-REFILL-130 (Claude Opus 5.5, T4 money). Code map: backend src/ai-credits (coach-ai-credit-pack.service.ts mints Stripe Checkout
Sessions with metadata tgp_kind 'coach_ai_credit_pack', handles checkout.session.completed/expired; ai-credits.constants.ts
COACH_AI_VALUE_MULTIPLIER_DEFAULT 3.125 "displayed = actual x multiplier", pack tiers 1000/2500/9900 cents, custom $10-$500; production
requires explicit env values per env-validation.ts ~:2896-2901), src/billing (stripe-api.service.ts, billing.service.ts); mobile
src/components/coach/ai-budget/* (PackOptionsRow, AIBudgetMeter, AIBudgetHardPauseModal, AIBudgetBanner), src/api/coachAiBudgetApi.ts.
