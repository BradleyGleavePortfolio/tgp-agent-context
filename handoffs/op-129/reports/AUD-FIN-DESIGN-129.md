# AUD-FIN-DESIGN-129: finish the DESIGN-QA-128 audit (agent 129, Claude Opus 5.5 auditor, read-only)

Started 16:05 PDT 10-07. Last updated 16:31 PDT. Status: **done** (see HANDOFF).
Scope: the "Not checked" list of reports/DESIGN-QA-128.md (STOPPED_HALFWAY.md section A: "vertical spacing, coach empty/loading
states"; the report also lists titles / hairlines / error states at DES PR heads, the empty-state primitive visuals, and "no device
evidence"). DESIGN-QA-128's 17 drift rows are not repeated here.
Worktree: `/home/user/workspace/wt/AUD-FIN-DESIGN-129-mobile`, detached at mobile main **a1be6fb2** (no branch, nothing committed, never
pushed). Shared deps linked after deps/mobile/READY. No production access, no PR comments, no GitHub REST calls (git fetch only).

## B list
None. No finding loses money, shows private data to the wrong person, misses safety routing or dead-ends a core flow: every path that an
error state hides (Money, Stripe setup) is still reachable from the Settings tab.

## U list (one line each; details and evidence in the two tables)
- U1 (REPRODUCED R1/R2): coach Home hides the setup checklist and the Money card while its roster numbers load and whenever
  GET /coach/command-center/overview fails, so a new coach on a bad connection loses Home's only "Set up Stripe" and Money entry points.
- U2 (REPRODUCED R3): coach Home colours its numbers red (#B91C1C) and muted gold (#C5A253, 2.12:1 on bone, fails AA) by threshold.
  House rule: monochrome data, say it in words; gold is reserved for the founding badge (tokens.ts:18).
- U3 (REPRODUCED R7): coach Home's top tabs (Overview / At-Risk / Streaks / Inbox / Actions) are 12 pt, inactive labels in stone
  #B1A89F (2.05:1 on bone, fails AA), and 34 pt tall (under 44 pt).
- U4 (REPRODUCED R4): Team tab shows a red "Could not load team..." and "No sub-coaches yet. Tap Invite to add your first one." at the
  same time when GET /sub-coaches fails: the second line is false.
- U5 (REPRODUCED R6): coach Settings "Active Clients" reads 0 while GET /coach/clients loads, and stays 0 with no error when it fails.
- U6 (REPRODUCED R5, R8; CODE-ONLY C3): the empty-state primitives disagree with the doctrine and with each other: square (radius 0)
  12 pt CTA, system-font 18 pt titles, uppercase CTAs, cream boxes, fixed palette. Coach Clients and Messages show these to every new coach.
- U7 (CODE-ONLY C2): the coach app has nine "could not load" looks, including an oxblood-filled Retry (Booking inbox) and a pink alert
  box (Programs). DESIGN-QA-128 row 9 counted six on the client side; open PRs add four more (C5).
- U8 (CODE-ONLY C6): two money-flow titles render in the system font at weight 600: CheckoutReturnScreen.tsx:424 (the screen right
  after paying) and PurchaseUnpackScreen.tsx:569.
- U9 (CODE-ONLY C8, not from this audit's scope; still on main): coach Settings "Notification preferences" navigates to a route the
  coach Settings stack does not register (FW-NOTIF-128 cross-area note; no job owns it).

## Table 1: REPRODUCED (throwaway jest render tests in my worktree, run through ops/heavy.sh at main a1be6fb2: 10 of 10 passed)
Test files (never committed): `src/__tests__/zzAudFinDesign129.test.tsx`, `src/navigation/__tests__/zzAudFinDesign129CoachSettings.test.tsx`.
Copies and the run log: `ops/reports/AUD-FIN-DESIGN-129-evidence/` (`run6_final.log` holds every printed style).

| # | Screen (route) | file:line, handler, API | What the render shows | House rule |
|---|---|---|---|---|
| R1 | coach Home = CoachTabs `CommandCenter` > Overview | `command-center/OverviewScreen.tsx:51` (initial 'idle'), `:55-65` handler `load` -> `commandCenterApi.getOverview` = GET `/coach/command-center/overview` (`services/commandCenterApi.ts:279,297`); `:73-79` loading branch; header only in the data branch `:116` | While the GET is pending the whole tab is one ActivityIndicator; the header passed by `CommandCenterScreen.tsx:93` (`CoachHomeCards`: setup checklist, brief, Money card) is not rendered | All important info present (rule 4); SkeletonScreen (rule 3 reuse) |
| R2 | same | `OverviewScreen.tsx:81-95` error branch, styles `:280-296` (retryButton, retryText); same pattern in `AtRiskScreen.tsx:59-80`, `WinStreaksScreen.tsx:97-118`, `InboxScreen.tsx:64-85`, `ActionQueueScreen.tsx:84-105` (code-only for those four) | GET rejected: "Unable to load roster data. Check your connection and try again." plus "Retry"; the setup checklist and Money card are gone. Retry: forest fill, `borderRadius 0`, label Inter 12 pt caption | Radius 4, text >= 13 pt, calm error (DESIGN-QA-128 row 9) |
| R3 | same | `OverviewScreen.tsx:145-154` (check-in colour ladder forest / mutedGold / error), `:171` (at-risk > 0 -> error), `:220` (open alerts > 0 -> error); colours from static `theme/tokens` `colors` | check-in 60% renders #C5A253; "3" at risk and "2" open alerts render #B91C1C | Monochrome data, no red, say it in words (rule 3); contrast |
| R4 | coach `TeamStack` > TeamManagement (Scale head coach only) | `TeamManagementScreen.tsx:177-205` handler `load` -> `subCoachApi.listSubCoaches` = GET `/sub-coaches` (`api/subCoachApi.ts:97`); `:255-263` error line, `:271-277` ListEmptyComponent | Rejected GET: red (#B91C1C) "Could not load team. Please try again. Tap to retry." AND "No sub-coaches yet. Tap Invite to add your first one." | Honest copy (rule 1); no red |
| R5 | shared `src/ui/empty-states/EmptyState.tsx` (coach Clients, coach Messages v2 + legacy, client Train) | `:86-96` TouchableOpacity activeOpacity 0.8; styles `:120-137` (`radius.sm` = 0 per `theme/tokens.ts:242`, `typography.caption` 12 pt label, body `colors.textSecondary`) | CTA `borderRadius 0`, label 12 pt; headline Cormorant 24 (good); body charcoal #3D3D3A, not textMuted | Radius 4, >= 13 pt tappable text, HapticPressable, one grey level |
| R6 | coach `SettingsStack` > SettingsHome | `coach/SettingsScreen.tsx:59` (`useState(0)`), `:118-127` handler `loadSettings` -> `coachApi.getClients()` = GET `/coach/clients` (default status active, `RO-backend src/coach/coach.controller.ts:63-76`), `:414-416` row | R6a in flight: "Active Clients 0". R6b rejected: still 0, no error copy anywhere. R6c control: 3 clients -> "3" | Wrong number (U); nothing true to say = show nothing ("—") |
| R7 | coach Home top tabs | `command-center/CommandCenterScreen.tsx:39-45` labels, `:121-135` TouchableOpacity, styles `:152-179` (camel hairline, caption, `colors.stone`) | Inactive label Inter 12 pt #B1A89F (2.05:1 on bone #F5EFE4); tab height 8 + 18 + 8 = 34 pt; "At-Risk" Title Case | >= 13 pt, 44 pt targets, sentence case, contrast |
| R8 | second shared empty state `src/components/EmptyState.tsx` (8 users: Recipes, Fasting, Bloodwork entry, Private community hub, Path copilot, coach Brief, Admin control room, Bloodwork review queue) | styles `:36` (title), `:48` (cta), fixed `Colors` import | Title 18 pt weight 500 with no fontFamily (system font); CTA label 15 pt system font; CTA radius 2 | Cormorant titles / Inter body, theme tokens (rule 7), radius 4 |

## Table 2: CODE-ONLY (traced from code at main a1be6fb2 or at the named PR head)

| # | Area | file:line, handler, API | What differs | House rule |
|---|---|---|---|---|
| C1 | Coach loading looks (five) | Bare spinner: Overview family (R1), `TeamManagementScreen.tsx:223-229` (large), `CoachInvitesScreen.tsx` (`invitesApi.listInvites('all')` :140), `CoachCodesScreen.tsx`. Skeleton: `CoachBookingInboxScreen.tsx:238-240`, `CoachBillingScreen.tsx`, `RiskBoardScreen.tsx`. Spinner + label row: `programs/ProgramUi.tsx:184-186` (`LoadingRow`, used `ProgramsLibraryScreen.tsx:216/261`). Loading drawn as an empty state titled "Loading pending drafts…": `PendingAiDraftsScreen.tsx:161-167` (`coachAiExecutionApi.listPending`) | A coach sees a different "loading" on almost every screen | SkeletonScreen primitive (rule 3 reuse list) |
| C2 | Coach error looks (nine) | (a) Overview family (R2). (b) Programs: `ProgramUi.tsx:21-60` FailureBox (style `:213`, fill `:39`), pink fill #F2E0E0, red border #9A3030, red text #7A1F1F (`constants/colors.ts:82-84`), via `ProgramsLibraryScreen.tsx:176-184`. (c) Booking inbox: `CoachBookingInboxScreen.tsx:168,242-257` "Retry" button FILLED OXBLOOD (`colors.error`). (d) Invites: `CoachInvitesScreen.tsx:359-379` red cloud-offline icon + "Couldn't load invites" + "Retry" (copy `:147`). (e) Pending AI drafts `:168-174` "Could not load drafts / Pull down to retry." (no button). (f) Risk board `RiskBoardScreen.tsx:240-249` "Could not load risk data" + raw error string (`ptmApi.getMyRiskBoard` :89). (g) Messages v2 `CoachInboxV2.tsx:293-303` "Inbox did not load" + userMessage + "Try again" (the calmest; v2 is live: `FEATURE_MESSAGING_CORE_V2` true in backend `.github/fly-env-desired-state.json:31`). (h) Team (R4). (i) Booking agenda / past sessions red body text `CoachBookingInboxScreen.tsx:368-370,421-423` | Red fills, red boxes, red icons, text-only; "Retry" vs "Try again"; "Couldn't" vs "Could not"; "Check your connection" shown for server errors too | Calm error said in words, no red, one forest primary (DESIGN-QA-128 row 9) |
| C3 | Empty-state primitives | Three shared + eight local. `EmptyStateNoClients.tsx`: headline Cormorant 28 (style `:223`, not the primitive's 24), uppercase letter-spaced CTAs "GO TO SETTINGS" `:153` / "SHARE YOUR CODE" `:197` (style `:270`: 14 pt 600, letter-spacing 1.2), cream code box radius 2 with camel border (`:239`), `Haptics.impactAsync` direct `:133` (ignores the Haptics switch, DESIGN-QA-128 U1). Local copies: `PrepGuideScreen.tsx:23`, `CommunityScreen.tsx:326`, `TimelineScreen.tsx:223`, `GroceryListScreen.tsx:24`, `ClientMacrosScreen.tsx:216`, `ClientDailyMealPlanScreen.tsx:195`, `ShoppingListScreen.tsx:24`, `PendingAiDraftsScreen.tsx:292`. `EmptyStateOffline` (claims "Data will reload automatically") has no users: C | The empty screen a new coach sees first (Clients, Messages) is louder than every redone client screen | Sentence case, radius 4, no cream fills, HapticService |
| C4 | Vertical rhythm (section to section), not measured by DESIGN-QA-128 | Home: hairline sections, paddingVertical 18 + marginBottom 24 (`ui/sections/QuietSection.tsx:38`, `HomeScreen.tsx:429,467-469`). More 32 (`MoreScreen.tsx:382`, tokens `spacing['2xl']`). Calendar 32 (`calendarUi.tsx:212`). Settings 28 (`settings/SettingsSection.tsx:24`). Progress 16 / 24 (`ProgressScreen.tsx:862,967,1011,1047`). Profile 20 / 24 (`ProfileScreen.tsx:291,358`). Habits 24 / 8 / 12 (`habits/styles.ts:8,64,194`). Train 20 / 16 / 12 / 10 (`WorkoutScreen.tsx:1009,1042,1059,1068,1141,1156`). Log 8 / 20 (`LogScreen.tsx:759,772`). Community 12 (`CommunityTodayScreen.tsx:332`). Macros 16 (`ClientMacrosScreen.tsx:245`). coach Overview 12 between tiles, 24 before LTV (`OverviewScreen.tsx:264,286`). Overline-to-content gap: 6 (Home, QuietOverline), 8 (`calendarUi.tsx:213`), 12 (`ProgressScreen.tsx:1051`, `ProfileScreen.tsx:362`, `WorkoutScreen.tsx:1148`) | Ten different section gaps (8-42 pt) and three overline gaps; Home/More/Calendar breathe, Log/Train/Community are tight | One rhythm token (generous negative space); QuietSection already exists |
| C5 | Open DES PR heads: titles, hairlines, error states (git fetch, no REST) | Heads: m#506 caa91063, m#504 431f65b8, m#502 a83774e0, m#494 **7109690f** (board still shows 3950c6eb), m#490 e9da3274, m#485 6515839a. Titles: all Cormorant (h1 32 or h2 24): converged. Hairlines: m#506 (`AIGuideScreen.tsx:421-592`, `RomanConversation(s)Screen.tsx` card/row/quiet) and m#502 (`AcceptInviteScreen.tsx:331`, `EmailVerifiedScreen.tsx:148`, `RoleSelectionScreen.tsx:555,569`) read `useTheme().colors.border/divider` = camel; m#504, m#494, m#490, m#485 use semantic grey. Error states: m#494 `RecipesScreen.tsx:317-322` alert-icon EmptyState "Couldn't load recipes / Pull down to try again." (no button); `RecipeDetailScreen.tsx:119-137` text + two text links; m#490 `PlanScreen.tsx:280,352-355` and `ClientDailyMealPlanScreen.tsx:130-137` "...Pull to retry." plus a forest-filled "Try again"; m#485 `ClientWorkoutViewerScreen.tsx:86-88` "Could not load your workouts. Pull to retry."; m#506 quiet outline retry | Titles fine; camel vs grey continues; four more error looks | Rule 7; row 9 |
| C6 | Screens merged since f240af37 (78 non-test .tsx; list in evidence `changed_since_f240af37.txt`, scan in `hairline_title_main_a1be6fb2.tsv`) | Camel hairlines (useTheme `colors.border/divider`): TrustCenter, Login, AIGuide, CoachGuidelines, Education, Membership, Progress, RoutineBuilder, coach AIMealPlanDraft, BlockedUsers, DataExport, DeleteAccount, RomanConversation(s), ExtensionPairingPanel. System-font titles at weight 600: `CheckoutReturnScreen.tsx:424` (title 22), `PurchaseUnpackScreen.tsx:569` (celebrateText 22); `ExtensionPairingPanel.tsx:470-471` (17 and 34, extension import flag off: C) | Hairlines fixed at once by CF-QA-THEME-128 (ThemeProvider), no new job. Titles: U8 | Cormorant <= 500 for titles (rule 3) |
| C7 | coach Home first frame | `OverviewScreen.tsx:51` starts 'idle', which renders the full layout with "—" tiles and the header, then `:56` flips to the spinner, then data | Header flashes in, out, in on every open (seen while reproducing R7) | Calm motion; part of the U1 fix |
| C8 | coach Settings "Notification preferences" (outside this scope) | `coach/SettingsScreen.tsx:635` `navigation.navigate('NotificationPreferences')` from SettingsStack; route registered only in ClientsStack `CoachNavigator.tsx:493-499` | Likely a dead button (FW-NOTIF-128 cross-area note, unowned) | No dead buttons (rule 2) |

## C one-liners
- C: `CoachMealTemplatesScreen` has text-only loading/error states, but it has no entry point (NUTR-AUD-128 row): no user impact.
- C: Overview family keeps stale numbers with no notice when a pull-to-refresh fails (`state === 'error' && data`): edge, deferred to 10k clients.
- C: `EmptyStateOffline` promises automatic reload but is unused.

## Proposed fix jobs (all Claude Opus 5.5, T1 mobile presentation; file-disjoint from each other, from CLIENTFIX-128 rows, from the QA
wave-2 rows in DESIGN-QA-128 and from the six open DES PRs above; every route, handler and order stays; parity table + test; README rule)
| Job | Files (exact, + new tests) | Change | Est. lines |
|---|---|---|---|
| **QA-COACH-HOME-129** | `src/screens/coach/command-center/OverviewScreen.tsx`, `AtRiskScreen.tsx`, `WinStreaksScreen.tsx`, `InboxScreen.tsx`, `ActionQueueScreen.tsx`, `CommandCenterScreen.tsx`, `src/components/command-center/KpiTile.tsx`, `src/screens/coach/TeamManagementScreen.tsx` | U1-U4 + C7: the header (setup checklist, Money) renders in every state, with the skeleton or error below it; start in 'loading', not 'idle'; loading = SkeletonScreen; error = CoachErrorState (calm variant once QA-PRIM lands); KPI numbers in ink with words ("3 need attention"), no red/gold; top tabs Inter 13 pt textMuted / forest, minHeight 44, "At risk"; Team hides "No sub-coaches yet" when the load failed, error in words without red | ~300 |
| **QA-COACH-STATES-129** | `src/screens/coach/CoachBookingInboxScreen.tsx`, `src/screens/coach/CoachInvitesScreen.tsx`, `src/screens/coach/PendingAiDraftsScreen.tsx`, `src/screens/coach/RiskBoardScreen.tsx`, `src/screens/coach/programs/ProgramUi.tsx` (FailureBox + LoadingRow only) | C1/C2: one calm error (sentence + forest "Try again" text button, no red fill/box/icon), skeleton loading, "Could not" wording, "Check your connection" only for network errors | ~250 |
| **QA-EMPTY-129** | `src/ui/empty-states/EmptyState.tsx`, `src/components/EmptyState.tsx`, `src/ui/empty-states/EmptyStateNoClients.tsx`, `src/screens/client/CheckoutReturnScreen.tsx` (title style only), `src/screens/client/PurchaseUnpackScreen.tsx` (celebrateText style only) | U6/U8: CTA radius 4, bodyMd 16 pt sentence case, minHeight 44, HapticPressable; body textMuted; components/EmptyState title Cormorant h3 + theme colours; NoClients sentence-case CTAs, h2 24, HapticService, bone + sc.border code box; the two money titles to `typography.h2`. Not `EmptyStateNoWorkouts.tsx` (CF-TRAIN-TAB-128 owns it) | ~200 |
| **QA-COACH-SET-129** | `src/screens/coach/SettingsScreen.tsx` | U5: "—" until GET /coach/clients answers and on failure; U9: `navigate('ClientsStack', { screen: 'NotificationPreferences' })` with a parity test | ~60 |

Amendment to DESIGN-QA-128's QA-PRIM-128 row (wave 2): `src/ui/sections/QuietSection.tsx` (QuietSection + QuietOverline + quietActions)
merged with m#515 (DES-K2-128). QA-PRIM must extend it, not add `ui/layout/QuietSection.tsx` / `ui/text/Overline.tsx` duplicates; its
section gap (18 + 24) is the rhythm token to adopt for C4 (the alternative is DESIGN-QA-128's proposed `sectionGap 32`).

## PRs
None (auditor, read-only).

## Not fixed (needs operator)
1. Launch QA-COACH-HOME-129 first (coach Home is the first coach screen), then QA-EMPTY-129, QA-COACH-STATES-129, QA-COACH-SET-129 any
   time: none depends on QA-PRIM (they use CoachErrorState / SkeletonScreen as they are today).
2. Decision: section rhythm. Recommended default: QuietSection's 18 + 24 everywhere (already on Home); one line in QA-PRIM.
3. Hairlines at m#506 and m#502 and on 15 merged screens: no new job; they convert when CF-QA-THEME-128 merges. At 16:29 no
   `agent12*/cf-qa-theme-128` branch exists on the remote (`git ls-remote`): confirm CF-QA-THEME-128 is running; it alone fixes them all.
4. Sequencing of DESIGN-QA-128's own rows (checked by git fetch of every open mobile PR and the new agent129/* branches at 16:29; none
   touches the files of the four jobs above): QA-FOOD-128's files are now changed by `agent129/cf-food-load-128` (LogScreen,
   MealSectionCard, FoodSearchView, QuantityPickerModal, ManualFoodEntryForm) and `agent129/cf-food-water-128` (WaterTracker); QA-PRIM's
   one-line Home change (`HomeScreen.tsx:357`, DESIGN-QA-128 U2) collides with `agent129/cf-home-start-128`; `agent129/cf-one-list-128`
   touches MoreScreen. Launch QA-FOOD only after CF-FOOD-LOAD and CF-FOOD-WATER merge, and do the Home line after CF-HOME-START.

## HANDOFF
- State: done at 16:30 PDT on mobile main a1be6fb2. Nothing pushed or posted. The worktree is detached and holds two untracked throwaway
  tests; leave it or remove it with `git -C /home/user/workspace/growth-project-mobile worktree remove --force /home/user/workspace/wt/AUD-FIN-DESIGN-129-mobile`.
- Re-run the evidence: `cd /home/user/workspace/wt/AUD-FIN-DESIGN-129-mobile && /home/user/workspace/ops/heavy.sh npx jest src/__tests__/zzAudFinDesign129.test.tsx src/navigation/__tests__/zzAudFinDesign129CoachSettings.test.tsx --ci`
  (RNTL 14: `await render(...)`, use `within()`; no `findAll`/`UNSAFE_*`).
- Scanners: `ops/reports/AUD-FIN-DESIGN-129-evidence/styles.py` (modes title/border/vgap/err, accepts `REF:path`) and
  `hairline_title_scan.py` (camel vs grey hairline source, system-font titles).
- A fixer for any job above should copy the matching R-test as its failing-first test (inverted expectations).
- Not checked: coach Community tab states (flag `coachCommunity`), Money screen states beyond a read (they already say what failed in
  words), device screenshots (none possible here).
