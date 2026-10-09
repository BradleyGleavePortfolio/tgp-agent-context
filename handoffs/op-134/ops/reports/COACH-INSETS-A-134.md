# COACH-INSETS-A-134 (agent 134 lane, builder claude_opus_5_5) — coach screens onto Screen + rounded tokens (B13 B28 B39 B16 B29)
Worktree /home/user/workspace/wt/COACH-INSETS-A-134-mobile, branch agent134/coach-insets-a-134 off origin/main 60097251 (m#617 merged).

## Status
- 20:5x started. Read P1-P15, Order, WAVE 1d shared rules, own entry, REDO-INSETS-133 report.
- Open PRs m#576 m#618-m#623 and the other open [133] PRs touch none of the 12 files (checked `gh pr diff --name-only`).
- All 12 screens sit in headerShown:false stacks inside the coach tab navigator (from the code): Screen edges ['top'];
  ClientReassign is a modal (presentation 'modal'): iOS page sheet edges [], Android ['top'] (same as PackageCheckout in #586).

## NEED (operator)
- NEED src/screens/coach/ClientDetailScreen.tsx — client-detail/styles.ts `container` has the fixed paddingTop 56; styles.ts is a static
  StyleSheet (makeStyles(colors)) and cannot read insets, so the 3 root branches of ClientDetailScreen must add
  `useScreenInsets().top + layout.statusBarGap` (about 6 lines; root wrapper only). No other builder lists it; no open PR touches it
  (checked every open mobile PR). Default if no answer by push time: proceed with those root lines only — COACH-INSETS-A-134.

## Unreachable (left as is, from the code)
- ClientRiskDetailScreen: registered in ClientsStack but nothing navigates to it (AUDIT-13-125 sent RiskBoard rows to ClientDetail).

## PR
- m#626 opened 21:2x @ fa70bbc19226d1253517a7dc8b416cffc87cf3dc (19 files, +314/-169; 1 code commit, merge of origin/main 5465d993,
  README row as the LAST commit). Waiting for CI, then READY, then verdicts (LN-OPUS-D-134 / LN-SOL-D-134).
- Local (heavy.sh, one file at a time): new coachInsetsA134 61/61 + 22 existing coach test files green; tsc clean; eslint 0 errors.
- ClientDetailScreen.tsx edited under the NEED default (root inset lines + retry radius only).
- 21:3x CI green at fa70bbc1 (Typecheck, lint, test run 37882287689; CodeQL pass); MERGEABLE CLEAN. READY posted (issuecomment-6074115334).
  Now polling every 180 s for verdicts (up to 90 min) and fixing any B at the head.
- 21:4x Opus D APPROVE @ fa70bbc1 (Bs none; Cs: no on-screen Back on 3 screens, ClientRiskDetail unreachable, avatars now circles).
  Sol D REQUEST CHANGES: B-626-SOL-D-134-1 (seen in the PR body, from the code) parity row over-claimed a uniform 24 pt gutter.
  Fixed body-only at the same head (parity row lists the retained 16/20 inner gutters; screen count 9 Screen + 2 hook; Risk board
  is a stack page). FIX ROUND 2 READY posted (issuecomment-6074221220). Waiting for Sol's new verdict.
- 21:3x Sol D APPROVE + Opus D APPROVE @ fa70bbc1 (both B=0 U=0). Then main moved (m#604 m#624 m#625 m#627 m#628 m#629) and
  m#626 went CONFLICTING (src/screens/coach/README.md: COACH-INSETS-B-134's paragraph next to mine). `git merge origin/main`,
  kept both paragraphs, no code change; coachInsetsA134 61/61 again. Pushed 6f35387b8537950cb6e0293c5a200d6f82cc2215; waiting for CI.
- 21:5x CI green at 6f35387b (Typecheck, lint, test run 37884466733; CodeQL pass). FIX ROUND 3 READY posted (main merge only,
  issuecomment-6074395217). Stopped here per the operator's credit notice (no new scope).

## HANDOFF
- PR: growth-project-mobile#626, branch agent134/coach-insets-a-134, head 6f35387b8537950cb6e0293c5a200d6f82cc2215, CI green.
  Both lenses APPROVED at fa70bbc1 (Opus D, Sol D; B=0 U=0). The only change since then is a `git merge origin/main` that fixed a
  README conflict, so both lenses need a fresh verdict at 6f35387b before the merge loop picks it up.
- Bugs: B13 B28 B39 B16 B29 on the 12 entry files (+ ClientDetailScreen root inset lines under the NEED default). Fixed: 1 B
  (B-626-SOL-D-134-1, parity-row claim, body only). U found: none.
- Tests (seen in a test): new src/screens/coach/__tests__/coachInsetsA134.test.tsx (61), renders at 360x800 and 390x844 plus a
  source guard. 22 existing coach test files green locally. tsc clean. Five theme mocks gained `semanticColors` (fixture only).
- Not seen on a device: everything. Check on a phone: reassign modal (iOS page sheet / Android), coach thread header band, client detail header.
- Left / proposed (needs operator): (1) on-screen Back on Risk board, SubCoachDetail and CoachTeamProfile (default: follow-up job);
  (2) uniform 24 pt inner gutters on the AI drafts, ClientInsight, threads, inbox lists and ClientDetail (default: follow-up);
  (3) ClientRiskDetailScreen is unreachable and was left as is.
- Next steps for agent 135: wait for both lens verdicts at 6f35387b. If main moves again and #626 conflicts, run
  `git merge origin/main` in /home/user/workspace/wt/COACH-INSETS-A-134-mobile (README paragraphs: keep both), push, and post a
  FIX ROUND 4 line. Never rebase.

## Follow-up (operator YES, after m#626 merges): Back + 24 pt gutters (B08 B29)
- Local branch agent134/coach-insets-a-134-back-gutter (on top of m#626 head 6f35387b), commit ready, NOT pushed until m#626 merges
  (then `git merge origin/main`, push, open "[134] B08 B29 ..." PR, SLICE D lenses).
- Back: arrow-back 24 in a 44x44 box, accessibilityLabel "Back", first under the Screen top, shown only when
  navigation.canGoBack() (no dead Back after a resume). Risk board (both branches; keeps the extra 12 only with no Back),
  SubCoachDetail (loaded page and the load error, now inside Screen), CoachTeamProfile (all three branches).
- Gutters: page-level paddingHorizontal = layout.gutter on AI drafts/ClientInsight (header, scroll, footer), inbox v2/legacy
  lists, thread header/list/composer/error banner, Risk board, client-detail header/tabs/scroll/plan modal, client detail
  skeleton rows, Business profile dialog.
- Tests (seen in a test): new coachBackGutter134 26/26 (360x800 + 390x844); coachInsetsA134 61, RiskBoardScreen 16,
  qaCoachStates131 13, TeamProfile132 11, coachSaasBlockers 29, coachTeamP0Blockers 19, aiWorkoutDraftKeep131 10,
  aiMealPlanDraftReview125 4, coachAi 16, CoachInboxV2 10, ClientMessagesScreenV2 7, ClientMessagesScreen.integration 3,
  coachClientWorkoutsMakeover127 8, clientArchiveCopy132 7, coachCheckInReviewFu126 9, commandCenterNavigation 11. tsc clean, eslint 0 errors.
  Fixtures: canGoBack added to 3 navigation mocks (RiskBoardScreen.test, qaCoachStates131, coachInsetsA134).
- 22:12 m#626 @ 6f35387b: Opus D APPROVE (04:51Z) + Sol D APPROVE (05:12Z), CI green, MERGEABLE. Waiting for the merge loop;
  the follow-up branch is pushed only after m#626 is on main.
- 22:2x m#626 MERGED (05:13Z, b8c8e8bf). Follow-up branch merged origin/main (clean; no open PR overlaps its 16 files),
  README row as the LAST commit, pushed ca3adbdbceba964590a841aea638df70fc4cd069 and opened **m#638**
  "[134] B08 B29 — ..." (387 lines). Waiting for CI, then READY, then SLICE D lenses.
