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

## HANDOFF (SAFE STOP, operator agent 134; refreshed at the stop)
Worktree /home/user/workspace/wt/CLIENT-POLISH-134-mobile. Identity Bradley Gleave <bradley@bradleytgpcoaching.com>; never rebase.

### Merged
- m#624 (items 1+2) and m#631 (items 3+4): APPROVE from LN-OPUS-E-134 + LN-SOL-E-134 at exact heads, B=0 U=0, merged.
- m#635 (item 5, B22 B24) @ 85605315: Sol B-635-SOL-E-1 (parity table) fixed in the body, FIX ROUND 2 READY; Sol APPROVE; merged 05:32Z.

### Open, pushed (leave for the lenses: LN-SOL-E-134 + LN-OPUS-D-134)
- m#639 agent134/client-polish-134-d @ 8f4b22a9ef3586de7381fb0906a5713a6181f9c8 (SHOTS-134B b, P0 tick line). CI green, READY posted
  (https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/639#issuecomment-6075049297). No verdict yet.
- m#640 agent134/client-polish-134-e @ 25305923838ec8f69290ecaaf9ed8db15c9a89c4 (SHOTS-134B c, underline inputs + Google case).
  CI was running at the stop; READY NOT posted. Next: when CI is green post
  `FIX ROUND 1 (OPENING) (CLIENT-POLISH-134, agent 134) — growth-project-mobile#640 @ 25305923838ec8f69290ecaaf9ed8db15c9a89c4 — READY FOR AUDIT`
  (body: /home/user/workspace/ops/reports/CLIENT-POLISH-134-prE-body.md). If CI fails only in an untouched file, rerun --failed.

### Work in progress (committed locally, NOT pushed)
- agent134/client-polish-134-f @ 2be8930562d7d4b5ce11dc2cc8104d81c42e76c6 off main 737f4e60 (SHOTS-134B d, tab labels). Done and tested
  locally: root cause (from the code) is bottom-tabs' own 5 pt padding on the tab BUTTON (BottomTabItem tabVerticalUiKit), not the
  item, so the label had 50 pt, not the 60 pt m#618 assumed; "Community" is 58.5 pt and clipped where text cannot shrink (web). Fix:
  label `marginHorizontal: -TAB_BUTTON_PADDING` (5) + `textAlign: 'center'` in ClientNavigator tabBarLabel; minimumFontScale kept at
  0.8 (0.85 would clip at the 1.3 text-size cap). clientTabLabels.test 2/2 (pins the library padding), tabBarPolish125 2/2,
  clientNavigator 6/6, coachlessNeverGated134 26/26, workoutSessionReachability124 1/1, eslint 0 errors, tsc clean.
  Next: `git merge origin/main`, push, open "[134] B26 — CLIENT-POLISH-134 F: tab labels get the full tab width, Community never
  clips" with Before -> after (360: label 50 pt -> 60 pt), parity (prototype tab bar | ClientNavigator.tsx), WHY/WHEN/WHO
  (m#618 0921c6e2 measured against the item, not the button), not seen on device; READY when green.

### Not started
- SHOTS-134B e (Home "Add Allergies and restrictions to set daily targets."): from the code the label comes from
  src/lib/profileCompletion.ts:163 (`diet_restrictions: 'Allergies and restrictions'`) interpolated into a Home line. Next: new
  branch off main; lower-case the label inside the sentence and show the line only when targets are missing, or say what adding
  allergies changes (food suggestions), with tests both ways; HomeScreen.tsx is free now (m#635 merged).

### Item a (coachless consent) needs a backend change: NOT built (tell the operator)
- From the code: the server accepts a P0 only when copy_version is in CONSULT_CONSENT_COPY_VERSIONS (v3, v4) AND text_sha256
  equals that version's pinned full-screen text (backend src/onboarding/consult-consent-copy.ts; env-validation: unknown names are
  ignored). A coachless variant needs a new server copy (e.g. consult-consent-v5-coachless / v6 for the memory paragraph) and,
  because box 2 hashes to the AI ledger copy, new ledger copies too (client-ai-v4 / v5 coachless). So: backend change required.
- Removal-only draft for legal review (no new claims; one grammar change "collect" -> "collects" flagged):
  P3: "To coach you, The Growth Project collects and uses what you share here: your profile, this consultation including the
  screening questions, your targets, food and workout logs, check-ins, any health, sleep or wearable data you choose to connect, and
  posts you write in the community. We use it only to provide your training. We never sell it. If you joined through a clinic, the
  clinic does not see it."  Box 1: "I agree to the training waiver, and to The Growth Project collecting and using my information to
  coach me."  P4 (v4): drop "and your coach can use AI drafts about your training", ", and never your coach's private notes",
  "are private from your coach and".  Box 2: "Optional: I allow Roman to use my information, processed by Anthropic."
- Risks for the operator: (1) the v5 memory paragraph's "information about your training may help with that without identifying
  you" is a data-use disclosure; removing it with the coach clause may drop a disclosure that still applies; (2) a coachless client
  who later joins a coach agreed to no coach collection, so joining would need a fresh P0 (or a join-time consent).
  Default: no change in build 8; backend copy versions + mobile variant in the next COACHLESS lane.

## Proposed (needs operator) — current list
1-7 as above (Settings redeem endpoint; CoachCodeSheet maxLength 40; Health back chevrons; keyboard footer band; Community
package-only for coachless server-side; Day1Win weight-only card; Workout "Coach guidelines" button for coachless).
8. Item a needs backend consent versions (above).
