# CLIENT-HOME-134 (agent 134) — B25 B26 B34
Started 19:40 PDT 10-08. Worktree /home/user/workspace/wt/CLIENT-HOME-134-mobile, branch agent134/client-home-134 off main 2acc228c.

## PR
- m#618 @ 35688e49e0dc08957a3e8dba164acbe531048671, 281 lines (210+/71-), CI green, FIX ROUND 2 READY 21:13 (round 1 READY 20:51 at 585b995b). Waiting for verdicts (entry: wait; poll every 180 s up to 90 min, until 22:21). Body: /home/user/workspace/ops/reports/CLIENT-HOME-134-pr-body.md

## Fixes (from the code; jest via CI — shared deps were not READY, so no local run)
- B25 src/components/home/HomeHeaderActions.tsx: coach entry only when coach_id set; coachless -> "Ask Roman" (RomanChat, single Roman entry) when featureFlags.romanChat, else empty slot + bell. Cause: 9c6d8bfa m#304.
- B26 src/navigation/ClientNavigator.tsx + src/theme/tokens.ts typography.tabLabel/tabLabelActive (Inter 11, -0.2), numberOfLines 1 + adjustsFontSizeToFit, tabBarItemStyle paddingHorizontal 0. "Community" 60.3 pt -> 58.5 pt in a 60 pt tab (font-file measurement). Cause: 0b4e065f m#467.
- B34 src/screens/client/homeDate.ts (new) + HomeScreen.tsx: Intl weekday/day/month in device locale, ordinal words removed. Cause: 4faec4a8 m#53.

## Overlap check
- m#603-606, m#612: no shared files. m#582 touches HomeScreen.tsx (imports, root SafeAreaView, CTA radii): I changed only the date block + date line. m#590/m#607 touch tokens.ts radius block only.

## C
- C (edge, deferred to 10k clients): DunningBanner "Message coach" only in billing states of a bought coach plan.

## Proposed (needs operator)
- none yet.
- 20:13 CI run 37878005634 failed ONLY at Typecheck on main's TS1117 (src/navigation/__tests__/imessageDmRoutes.test.tsx:77, from m#609; P14). Lint/test steps skipped. Waiting for m#617, then `git merge origin/main` + push.
- 20:25 deps linked. Local (heavy.sh, one file each): homeDate.test 3/3, HomeHeaderActions.test 11/11, clientTabLabels.test 2/2, HomeScreen.honestCopy127 17/17 after updating its coachless-actions case (it pressed home-message-coach for a coachless client: the B25 bug). Local commit, push waits for m#617.
- 20:46 m#617 merged; merged origin/main (m#582 is on main now; auto-merge clean), re-ran HomeScreen.honestCopy127 17/17, HomeHeaderActions 11/11, clientTabLabels 2/2. Pushed head 585b995b6539438afe60e97f5513cb762eb13644 (191+/71- vs main).
- 20:51 CI green at 585b995b; READY posted (issuecomment-6073902555). Polling for Opus + Sol verdicts.
- 21:05 verdicts at 585b995b: Opus RC (B body-only parity row; U1 Ask Roman flash while user loads), Sol RC (same body B). Fixed body row + U1 (HomeHeaderActions userKnown + test, 12/12 local). Pushed 35688e49e0dc08957a3e8dba164acbe531048671.
- 21:13 CI green at 35688e49; FIX ROUND 2 READY posted (issuecomment-6074122288). Polling for verdicts until 22:21.
- 21:23 DUAL APPROVED at 35688e49 (Opus LN-OPUS-A-134 APPROVE, Sol LN-SOL-A2-134 APPROVE). Ready for the operator merge loop.

## B / U found in my own work (all fixed)
- B (body only, both lenses): parity row overclaimed the tab bar match. Fixed in body.
- U1 (Opus): "Ask Roman" flashed for coached clients while useCurrentUser loaded. Fixed + test.

## HANDOFF
- PR: growth-project-mobile#618, branch agent134/client-home-134, head 35688e49e0dc08957a3e8dba164acbe531048671, 210+/71- (281), CI green, DUAL APPROVED 21:23. Nothing left for this job; operator merges (merge-tree vs main clean at 21:05).
- Files: src/components/home/HomeHeaderActions.tsx (B25), src/navigation/ClientNavigator.tsx + src/theme/tokens.ts typography.tabLabel/tabLabelActive (B26), src/screens/client/homeDate.ts (new) + HomeScreen.tsx date lines (B34); tests HomeHeaderActions.test, clientTabLabels.test, HomeScreen.honestCopy127.test, homeDate.test (new); READMEs components, navigation, theme.
- WHY/WHEN/WHO: B25 9c6d8bfa m#304; B26 0b4e065f m#467; B34 4faec4a8 m#53.
- Not seen on a device: coachless header, tab labels at 360 pt / large font scale, UK-locale date. Device check worth doing in build 8.
- C (edge, deferred to 10k clients): DunningBanner "Message coach" in billing states of a bought coach plan; at very large system text "Community" may shrink below the other labels.
- Proposed (needs operator): none. NEED: none.
