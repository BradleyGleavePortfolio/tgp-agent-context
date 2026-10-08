# CF-SETTINGS-128 (CLIENTFIX-128, operator agent 129) — Settings switches that tell the truth

Started 16:09 PDT 10-07. Branch `agent129/cf-settings-128`, worktree `/home/user/workspace/wt/CF-SETTINGS-128-mobile`,
base mobile main a1be6fb2. No commits yet (head = a1be6fb2). No PR yet.
Sources: FW-FOOD-128 SET-TRUTH-128 (U1, U12 labels), FW-NOTIF-128 NOTIF-SET-128 (U2), FW-ACCOUNT-128 FWA-SETTINGS-128 (U7, U9, U10, U11).

## Scope traced (16:09-16:25)
- Open PRs on the board touching my files (git diff --name-only origin/main...origin/<branch>): none touch SettingsScreen.tsx,
  useSettings.ts, FastingScreen.tsx, MoreScreen.tsx, utils/notifications.ts, utils/supabaseAuth.ts. m#504 (des-au-127) edits
  ResetPasswordScreen.tsx (its local checkPassword is not exported) -> not touched; the same four rules go in a small shared helper.
- Running in parallel (FLEET129 16:09): CF-FAST-CALM-128 (FastingScreen.tsx, useSettings.ts, WidgetsScreen.tsx) also lists U2. To avoid a
  conflict the Fasting alerts gate goes inside utils/notifications.ts scheduleFastingAlert (no FastingScreen edit); the useSettings default
  change (fastingAlerts true) is the same one-line change FAST-CALM makes (identical edits merge cleanly). CF-ONE-LIST-128 may edit
  MoreScreen.tsx / MoreScreen.reach.test.tsx (Shopping row) near my Widgets row change.
- Backend facts (origin/main fd190078 = production 87f4489b for src/notifications): `eat_enabled`, `daily_checkin_enabled`,
  `fasting_enabled`, `weekly_summary_enabled` are read by nothing. Daily + weekly client digest emails are gated by `muted` + `digest_email`
  (digest.service.ts:383-398). Missed-check-in nudges (2-7 days without a check-in) are gated by `nudge_missed_checkin_{push,inapp,email}`
  (nudge-engine.service.ts:61-71, schema defaults push/inapp true, email false). PATCH /notifications/preferences accepts all of these.

## Plan (one mobile PR)
- U1/U2: remove "Meal Reminders" (rule 2, no meal reminder exists). "Daily Check-in" -> "Check-in reminders" mapped to the missed-check-in
  nudges. "Weekly Summary" -> "Summary emails" mapped to digest_email (+ weekly_summary_enabled mirror). "Fasting alerts" default on and
  honoured by scheduleFastingAlert. One-line description under each switch saying exactly what it does.
- U9: server-backed switches read GET /notifications/preferences on mount; a failed save reverts and shows one plain line.
- U7: change password uses the sign-up/reset rules; Supabase errors mapped to plain copy (utils/supabaseAuth.ts).
- U10: sentence case on Settings. U11: "Redo profile setup" + one sentence that logs and coach plans are kept.
- U12: More row "Widgets" -> "Shortcuts", "Quick log and start a fast".

## B list
None.

## U list (all in the WIP commit 658e5def, no PR)
- U1/U2: Meal Reminders removed (rule 2). Daily Check-in -> "Check-in reminders" (nudge_missed_checkin_*), Weekly Summary -> "Summary emails"
  (digest_email), both read from GET /notifications/preferences; Fasting alerts default on, gate inside utils/notifications.ts scheduleFastingAlert.
- U9: failed save reverts the switch + preferenceSaveFailureOf line. U7: reset/sign-up password rules + utils/supabaseAuth.ts passwordChangeFailureCopy.
- U10 sentence case, U11 "Redo profile setup" + one sentence, U12 More "Widgets" -> "Shortcuts".

## C one-liners
- C (edge, deferred to 10k clients): switching Fasting alerts off mid-fast does not cancel that fast's scheduled alert.
- C (edge, deferred to 10k clients): phones that saved settings before have fastingAlerts false stored (old default); switch and behaviour agree.

## PRs
None (stopped by operator 16:36 before a PR). Branch pushed: agent129/cf-settings-128 @ 658e5def77b1261beebdfbecd76a58dc9f31eb42.
Failing-first: SettingsScreen.parity.test.tsx 4 failed on main code, 7/7 pass on the branch (16:33, heavy.sh).

## Not fixed (needs operator)
- 1: finish the branch (tests below) and open the PR; nothing else needs a decision.

## HANDOFF
Branch agent129/cf-settings-128 @ 658e5def77b1261beebdfbecd76a58dc9f31eb42 (pushed 16:37, WIP commit on main a1be6fb2, no PR), worktree /home/user/workspace/wt/CF-SETTINGS-128-mobile.
Done: SettingsScreen.tsx, useSettings.ts, utils/notifications.ts, utils/supabaseAuth.ts, MoreScreen.tsx; parity test updated and passing; checkInTime test edited, not run.
Left: update src/navigation/__tests__/imessageDmRoutes.test.tsx:144 ('Blocked users'), src/__tests__/followUpDeadRows126.test.ts:19-20 ('Meals per day', 'Water goal (fl oz)'),
MoreScreen.reach.test.tsx:204/255/263 ('Shortcuts', 'Quick log and start a fast'), add gate + supabaseAuth unit tests, settings/README.md Notifications row; run each via heavy.sh, merge origin/main, open PR, READY.
Overlap: CF-FAST-CALM-128 (useSettings default, same one-line change), CF-ONE-LIST-128 (MoreScreen.reach.test.tsx line 255).
