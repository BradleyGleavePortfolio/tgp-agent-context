# CLIENT-POLISH-134 (agent 134, claude_opus_5_5)
Worktree /home/user/workspace/wt/CLIENT-POLISH-134-mobile, branch agent134/client-polish-134 off main 60097251.

## Log
- 21:0x read P1-P15, Order/deps, WAVE 1d rules, my entry; HANDOFFs REDO-INSETS/REDO-DEVICES/AUTH-ENTRY/REDO-SETTINGS/LN-OPUS-C-133.
- Open-PR files checked (m#576 m#579 m#581 m#592 m#604-607 m#614-616 m#618-623): none of my target files are in them.
  Avoided: src/screens/auth/README.md, src/screens/auth/__tests__/CreateAccountScreen.test.tsx (m#576), src/screens/client/README.md.
- Items 1+2 built: m#624 (agent134/client-polish-134) @ b0c08d7690d9a4d446fb86cee1971d91705f863a, 481 changed lines.
  Leaderboard + Leaderboard settings on Screen (mocks given SafeAreaInsetsContext), settings Save name 4 -> radius.button,
  Connected devices ScreenTopBar back chevron + dot radius.chip. No row chevrons (no row opens a detail screen; 18:33 rule).
  Tests local (seen in a test): leaderboardScreenInsets134 6/6, connectionsBackChevron134 6/6, 9 existing files green, tsc clean.
  Waiting for CI before READY.
- m#624: CI green at b0c08d76, CLEAN. READY posted: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/624#issuecomment-6074177381
- Items 3+4 built: m#631 (agent134/client-polish-134-b) @ 02a25beb0fad55dcc3c415045d6445c6e17a1428, ~490 changed lines (snapshot excluded).
  Create account: "or" only under a shown provider (AppleSignInButton onAvailable); keyboard open -> sentence + button + terms
  move inline at the end of the form (no remount), footer lines lose 16 pt margins. Add a coach code: pasted join link -> code;
  Settings now uses POST /coachless/coach-code/redeem like CoachCodeSheet (Idempotency-Key, featured pause, same refusal copy).
  Copy: no "your coach" on the coachless screen. Tests local: createAccountFooterKeyboard134 6/6, AddCoachCodeScreen 9/9, 15 files green.
  Waiting for CI before READY.
- Login (from the code): its "or" only renders with Google under it; no lone divider; unchanged.
- m#631 CI green at 02a25beb, READY posted: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/631#issuecomment-6074260529
- Item 5 (operator 21:28, B22 B24): m#635 (agent134/client-polish-134-c) @ 4a7929e2cbfd4f55fcef345de4ce92b2a7b3fd8a, 305 lines.
  Trace (from the code): coachless entitlement is always inactive (hasActiveEntitlement needs a purchase), so on main both lines
  were reachable on every launch. Fix: ProtectedScreen openToCoachless (mirrors @OpenToCoachlessClient routes), ClientNavigator OWN on
  Log/Workout x5/Plan/DailyMealPlan/Fasting/Macros/AIGuide, Home + Habits never gate coachless; coachless title -> "This part comes
  with a coach" (coach-only surfaces). Tests: coachlessNeverGated134 26/26 + 4 updated files + 11 kept green; tsc clean.

## Proposed (needs operator)
1. Settings "Add a coach code" now uses POST /coachless/coach-code/redeem (same as CoachCodeSheet) instead of attach-invite-code
   (overrides 133-14 for Settings). Default: keep (m#631 body has the reason).
2. CoachCodeSheet maxLength={40} cuts a pasted join link. Default: leave (sheet not touched).
3. Back chevrons on Health shell / metric detail (WearablesShell, MetricDetailScreen). Default: leave.
4. Empty ~44 pt footer padding band while the Create account keyboard is open (Screen.tsx shared). Default: leave.
5. Community feed/wins/leaderboard are package-only for coachless clients server-side (needs @OpenToCoachlessClient on the backend). Default: leave.
6. Day1Win shows only the weight card without a package. Default: leave.
7. Workout "Coach guidelines" button shows for a coachless client (opens a 402). Default: leave.

## HANDOFF
- PRs (all mine, worktree /home/user/workspace/wt/CLIENT-POLISH-134-mobile):
  - m#624 agent134/client-polish-134 @ b0c08d7690d9a4d446fb86cee1971d91705f863a: items 1+2. CI green, READY posted. Lenses SLICE E.
  - m#631 agent134/client-polish-134-b @ 02a25beb0fad55dcc3c415045d6445c6e17a1428: items 3+4. CI green, READY posted.
  - m#635 agent134/client-polish-134-c @ 856053155303f581be5e8e1d3f306141dbb3d122: item 5. CI green (after one rerun of an
    untouched flaky file), READY posted: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/635#issuecomment-6074681473
- Verdicts: m#624 and m#631 APPROVE from LN-OPUS-E-134 and LN-SOL-E-134 at their exact heads (B=0 U=0); both MERGED.
  m#635: review in progress (SLICE E; board /home/user/workspace/ops/board/board.md).
- Next steps for agent 135: poll each PR (180 s); fix any B at its current head in one push (merge origin/main, never rebase),
  CI green, then `FIX ROUND <k> (CLIENT-POLISH-134, agent 134, CLIENT-POLISH-134) — growth-project-mobile#<n> @ <sha> — READY FOR AUDIT`.
  Test commands: heavy.sh npx jest --ci <file> one at a time; tsc via heavy.sh.
- Bodies: CLIENT-POLISH-134-prA-body.md, -prB-body.md, -prC-body.md in this folder.
- m#635 CI run 37885785368: 1 failure in WorkoutScreen.calm130 (file not touched; passes locally 11/11; previous run failed useBiometricGate instead, also passes locally) -> rerun --failed.
- m#635 Sol REQUEST CHANGES B-635-SOL-E-1 (parity table missing in body) -> body fixed, FIX ROUND 2 READY at same head 85605315.
