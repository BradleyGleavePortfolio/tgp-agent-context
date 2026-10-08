# SETTINGS-FIN-130 (operator agent 130): finish the Settings switches (CF-SETTINGS-128)

Started 18:16 PDT 10-07. Worktree /home/user/workspace/wt/SETTINGS-FIN-130-mobile, branch agent129/cf-settings-128 (from 658e5def).
Sources: FIX_PLANS_130_131.md section B row SETTINGS-FIN-130; JOBS130 FINISH-130 + Recon 130 row; reports/CF-SETTINGS-128.md
(HANDOFF); JOBS128 CLIENTFIX-128 row CF-SETTINGS-128.

## Scope traced
- 18:18 merged origin/main 9b37c5df into the branch (clean, 103 commits).
- New item from the FIX_PLANS row: switching Fasting alerts off cancels the current fast's alert. FastingScreen saves the alert
  id at `fasting:scheduled_notification_id:<userId>`. Added `src/utils/fastingAlert.ts` (`fastingNotifIdKey`, `cancelFastEndAlert`,
  the same text as the CF-FAST-CALM-128 patch file). SettingsScreen `handleFastingAlertsToggle` calls it on off.
  FastingScreen.tsx was not touched, so the FAST-CALM patch hunks there still apply.
- Three test updates from the HANDOFF: imessageDmRoutes.test.tsx (client 'Blocked users'), followUpDeadRows126.test.ts
  ('Meals per day', 'Water goal (fl oz)'), MoreScreen.reach.test.tsx ('Shortcuts', 'Quick log and start a fast').
- Gate tests (utils notifications.test.ts, through the real useSettings hook), fastingAlert.test.ts, supabaseAuth.test.ts.
  supabase-js is imported dynamically, which this Jest setup cannot load, so the provider paths are pinned by a source guard.
- README rows: client settings README, client README (Settings and Shortcuts rows), utils README.
- Backend facts re-checked on backend main d6065661 (includes b#864). The missed check-in nudge is gated by
  `nudge_missed_checkin_*` (2 to 7 days; NUDGE_ENABLED defaults on). The weekly client digest is gated by `digest_email`. The
  client daily digest is off by default after b#864. "Progress summaries sent to your email" holds before and after deploy.

## B list
None.

## U list (all from the code; the parity test reproduces each)
- U1/U2: Meal Reminders removed. Daily Check-in -> "Check-in reminders" (`nudge_missed_checkin_*`). Weekly Summary ->
  "Summary emails" (`digest_email`). Fasting alerts on by default and honoured; off cancels the running fast's alert (new).
- U9 (failed save reverts with plain line), U7 (password rules + plain copy), U10 sentence case, U11 Redo profile setup,
  U12 More "Shortcuts".

## C one-liners
- C (edge, deferred to 10k clients): Fasting alerts back on mid-fast does not re-schedule that fast's alert.
- C (edge, deferred to 10k clients): phones with the old stored default `fastingAlerts: false` show off and get no alert (consistent).

## PRs
- m#537 https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/537, T2, opened 18:36.
  - 9b457241: CI Typecheck failed at SettingsScreen.tsx:63 (WIP check-in payload: a conditional of two object literals is not a
    Record<string, boolean>). Fixed in 34413e9f (one typed record, same payloads; parity 8/8 and checkInTime 10/10 again).
  - Head 34413e9f91ba1269aaae5720970673c8325c82d0, 636 changed lines (+507/-129). CI green at the head 18:48 (Typecheck, lint,
    test; CodeQL), merge state CLEAN. READY posted 18:48:
    https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/537#issuecomment-6050503995
  - Verdicts: none yet (builders end after READY; findings go to FIX-OPUS-130 / FIX-SOL-130).
- Failing-first: parity "switching Fasting alerts off cancels..." failed 18:22 before the fix (0 cancel calls), passes after.
- Local (heavy.sh, one file each): parity 8/8, checkInTime 10/10, fastingAlert 4/4, supabaseAuth 9/9, notifications 4/4,
  imessageDmRoutes 2/2, followUpDeadRows126 7/7, MoreScreen.reach 21/21, truthfulCopy 20/20, quietLuxuryDoctrine 30/30,
  copyVoice 8/8, wave11Doctrine 8/8, declaredDependencies 32/32.

## Proposed (needs operator)
- 1 (U, from the code, not in this entry): ProfileScreen.tsx:176-186 still labels the same Shortcuts screen "Widgets", with the
  hint "Customize your dashboard widgets". A client sees two names for one screen, and the hint describes a feature that does
  not exist. Smallest fix: label "Shortcuts", hint "Opens shortcuts"; update ProfileScreen.savedValues.test.tsx:114 and
  quietLuxuryDoctrine.test.ts:310. Default: fold into QA-SETTINGS-131.
- 2 (U, from the code, not in this entry): NotificationPreferencesScreen.tsx:142-146 "Reminders / Meal reminder preference."
  writes `eat_enabled`, which no backend code reads (backend main d6065661). This is the same dead switch this PR removes from
  Settings, so a client who turns it on gets nothing. Smallest fix: remove the client_bot category (rule 2) and its
  BACKEND_FIELD_MAP entry (:90). Default: QA-SETTINGS-131.
- 3 (U, from the code, after the b#864 deploy): NotificationPreferencesScreen.tsx:166 "System / Daily and weekly summary email."
  After b#864 the client daily digest is off unless EMAIL_DIGEST_CLIENT_DAILY_ENABLED is 'on' (not in the fly env manifest),
  so "daily" becomes untrue. Smallest fix: "Weekly summary email." Default: a one-line follow-up after the backend deploy.

## HANDOFF
- Done: PR m#537 open, head 34413e9f91ba1269aaae5720970673c8325c82d0 on agent129/cf-settings-128, CI green, CLEAN against main
  9b37c5df, READY posted 18:48 (FIX ROUND 1 (OPENING)). PR body: reports/SETTINGS-FIN-130.prbody.md; READY text:
  reports/SETTINGS-FIN-130.ready.md.
- Next round (FIX-OPUS-130 / FIX-SOL-130): worktree /home/user/workspace/wt/SETTINGS-FIN-130-mobile (deps linked). Tests:
  src/screens/client/settings/__tests__/SettingsScreen.parity.test.tsx, src/screens/client/__tests__/SettingsScreen.checkInTime.test.tsx,
  src/utils/__tests__/{fastingAlert,supabaseAuth,notifications}.test.ts. The READY line for the next round is
  `FIX ROUND 2 (SETTINGS-FIN-130, agent 130, <ID>) — growth-project-mobile#537 @ <sha> — READY FOR AUDIT`.
- Dependents: FAST-CALM-FIN-130 starts after m#537 merges. Its patch's useSettings.ts hunk and new-file fastingAlert.ts will not
  apply as-is. Take this branch's fastingAlert.ts and add `scheduleFastEndAlert`. The fastingAlerts default is already true.
  Its FastingScreen.tsx hunks are untouched here. SESSION-KEEP-130 merges origin/main after m#537. The sign-out confirm here only
  changes 'Sign Out' -> 'Sign out'.
- Operator: 3 proposals above (ProfileScreen "Widgets" row; dead "Reminders" switch on Notification preferences; "Daily and
  weekly" copy after the b#864 deploy).
