# REDO-AUDIT-133 — were the 48 redo PRs applied, and what still has to be applied (agent 133 lane, phase 1, read-only)

Auditor: REDO-AUDIT-133 (Claude Opus 5.5), agent 133. Phase 1 = read-only: no branch, no PR, no comment, no edit.
Read at: mobile main df7b8ae9384d2c11ea86a913dba2a3696bd4d1cc, backend main 051583adf983b5725e0bdace1c4d74ddd05e7f21 (both re-checked on GitHub 16:55).
Owner build used for reachability: EAS profile `clinic-apk` (extends `clinic`): consultationOnboarding, clientTutorial, clientCalendar,
communityTab, communityHall, communityCohorts, romanChat, deliverables, coachBrief ON; communityDm explicitly false; communityChallenges,
communitySearch, clientPathCopilot, privateCommunityHub, bloodwork OFF (eas.json @ df7b8ae9).
Labels: every finding is "from the code" unless marked otherwise. Nothing here was seen on a device.
Evidence files: `ops/reports/redo-audit-133/q5scan.py` (static scan), `ops/reports/redo-audit-133/q5scan_main_df7b8ae9.json` (131 files
touched by the 48 PRs), `ops/reports/redo-audit-133/proto_sheet_key.png` (prototype 00 01 02 37 39 40 63 67 69 74).

## 1. Verdict (5 lines)
1. Applied in code: all 48 PRs (47 DES + #552) are merged, every file they touched still exists on main, and no revert touched them.
2. The owner did not see them for three reasons. (a) Onboarding: none of the 48 touched the lean flow (src/screens/onboarding/Lean*), which is what every new client gets; the two onboarding redos are dead (#508, Day-1 stack not mounted) or dark (#509, consultation never reachable: 0 ClinicProgramSet rows, F1).
3. (b) Coachless clients get the lock page on every `withProtectedScreen` route (Food, Train, live workout, Meal plan, Macros, Fasting, Calendar, Guidance), so 14 of the redos cannot be seen without a coach (B22/B23; b#888 is agent 132's).
4. (c) The look stopped halfway. The redos agree on bone pages, hairlines, overlines and serif titles, but the shared primitives and the 10 DESIGN-QA-128 fix jobs never ran. Top spacing is still a fixed `paddingTop: 56/60` on 37 of the touched files, or `SafeAreaView` from 'react-native' on 5 live screens. The `typography.display` (44/46) and `h1` (32/35) tokens are below the 1.2x line height Q5 asks for, so serif titles can clip on Android (B15 at the token level, tokens.ts:148-161).
5. Seven redone screens have no route at all (wasted work): ShoppingList, the client NotificationsScreen, ClientUpcomingSessions, PreferencesScreen, settings/NotificationPreferencesScreen (client), the six Day-1 screens, Copilot, PrivateCommunityHub, and Challenges (flag off).
6. Owner 17:07 (Q10b, rounded corners) reverses the redo program's radius rule. The redos built square shapes: theme `Radius`/`radius` sm 0 / md 2 / lg 4 (theme/index.ts:137-142, tokens.ts:241-249). 71 of the files the 48 PRs touched hardcode a numeric radius (132 at 4, 47 at 2, 18 at 0), and 242 files do app-wide. So every KEEP row below now also needs "hardcoded radius -> DS-PRIMITIVES-133 radius tokens". Rows that use the tokens follow automatically once DS-PRIMITIVES-133 changes the values.

## 2. Per-PR table (one row per redo PR)
Reach key: **C** = coachless client, **K** = coached client with an active entitlement. **P** = the route is wrapped in `withProtectedScreen`
(ClientNavigator.tsx:160-185). A coachless client without an entitlement gets ProtectedScreen.tsx's coach-managed lock (B22/B23).
Q5 key: **top56/60** = fixed paddingTop with no insets. **RN-SAV** = SafeAreaView from 'react-native'. **h1** = uses a display/h1 token (line height under 1.2x).
**serif n/-** = a Cormorant style with font size n and no line height (or one too small).

| PR | Screen(s) | What it changed | Reach in the owner's build (route, flag) | Meets prototype and Q5 (look)? | Verdict |
|---|---|---|---|---|---|
| #465 DES-L | LogScreen, FoodSearchModal | Add several foods without reopening; "Added X." + Done | Food tab `Log` (P). C: locked. K: yes | No prototype screen (51-54 are tour). Q5: Log top60 (LogScreen.tsx:804); fixed `Colors` in FoodSearchModal (x6) | KEEP; look -> APPLY-FOOD-133 |
| #466 DES-M | RomanChatScreen, RomanComposer, RomanMessageBubble, RomanTypingIndicator | Serif Roman replies, hairlines, square forest send | More > Roman, Home header (romanChat ON). C: yes. K: yes | Prototype 69-73: no. The owner calls it "prehistoric" (B30). Static `lightTokens`/`colors.*` used 25 times (Chat 7, Composer 10, Bubble 7, Typing 1) | REDO TO PROTOTYPE -> ROMAN-ROOM-133 |
| #467 DES-A | ClientNavigator tabs, ThemeProvider, colors, Settings, MoodEnergyPicker, HomeHeaderActions | Legibility; a stored Dark choice renders light; six tab labels | Global. C: yes. K: yes | The Community label wraps at 360 pt (B26). Camel border still spread through ThemeProvider.tsx:59 from constants/colors.ts:27-28, against tokens border #DCD5CC | KEEP; label fit -> CLIENT-HOME-133 (B26); camel border -> DS-PRIMITIVES-133 |
| #468 DES-W | active-workout SetLogger, styles | Ghost previous values, Previous cell | Train > ActiveWorkout (P). C: locked. K: yes | No prototype screen. Q5: topBar uses a cream surface with paddingTop 56 and margin 20 (styles.ts:8-18) | KEEP; look -> APPLY-LIVE-133 |
| #469 DES-T | HomeScreen, CoachIntroductionBanner, HolisticInsightsTile, PushPermissionCard, romanVoice, TutorialHomeSlot | Truthful Home cards and greetings | Home tab. C: yes. K: yes | Prototype 63 LAND / 41 / 61: no. HomeScreen RN-SAV. Coachless header still says "Message your coach" (B25) | REDO TO PROTOTYPE -> CLIENT-HOME-133 (Home); TutorialHomeSlot + push card (41, 61) -> TOUR-133 |
| #470 DES-V train | WorkoutScreen, ProgressScreen, ProfileScreen, ReportScreen, EmptyStateNoWorkouts, onDeviceCopy, notifications util, day-one Notifications + i18n | Truthful training, progress and profile copy | Train (P): C locked, K yes. More > Progress / Profile / Report: C yes, K yes. Day-one part: no route | Copy is good. Q5: Workout/Progress/Profile top60; Progress still has the FAB and boxes (see DES-P) | KEEP (copy); Progress -> APPLY-PROGRESS-133; Profile -> APPLY-PROFILE-133; day-one part -> DELETE (LEAN-CUT-133) |
| #471 DES-F | DailySummaryBar, FoodSearchView, MealSectionCard, QuantityPickerModal, WaterTracker, DaySelector, new ui/progress/QuietBar | Calories-left hero, forest bars, quiet rows | Food tab (P). C: locked. K: yes | Q5: DailySummaryBar.tsx:70 is Cormorant 44 with no lineHeight (clip risk). Fixed `Colors` in QuantityPicker (x19) and DaySelector (x5). TouchableOpacity flash on food rows. kcal figures not tabular | KEEP; finish -> APPLY-FOOD-133 |
| #472 DES-O | coach ClientsListScreen | Coach landing, honest counts | Coach | Coach side | agent 134 (not audited here) |
| #473 DES-V pay | CheckoutReturn, Membership, PrivateCommunityHub, PurchaseUnpack; coach ExtensionPairingPanel, CoachPackageEdit/List | Removes false purchase promises | More > Membership: C yes, K yes. CheckoutReturn/PurchaseUnpack after an Android checkout: K. PrivateCommunityHub: flag OFF, no route | Membership RN-SAV. PurchaseUnpack top56 | KEEP (copy); PrivateCommunityHub UNREACHABLE (flag off); Membership insets -> APPLY-INSETS-133; coach files -> agent 134 |
| #474 DES-R | ActiveWorkoutScreen, WorkoutFinishSummary | Background rest alert; quiet finish summary | ActiveWorkout (P). C: locked. K: yes | Behaviour change; look covered by the QA-LIVE remainder | KEEP |
| #475 DES-J | theme tokens.ts | Forest for every primary action | Global | Matches the prototype (forest) | KEEP |
| #476 DES-X | ExerciseCard, styles | Quiet exercise card, actions kept | ActiveWorkout (P). C: locked. K: yes | "Add Set" Title Case still at ExerciseCard.tsx:132 | KEEP; -> APPLY-LIVE-133 |
| #477 DES-S | SettingsScreen, new SettingsSection | Serif title, flat sections | More > Settings. C: yes. K: yes | top56 (SettingsScreen.tsx:641). Overline is 13 pt, not the token (SettingsSection.tsx:25) | KEEP; -> APPLY-SETTINGS-133 |
| #479 DES-Q | coach ClientDetail WorkoutsTab | Coach client file | Coach | Coach side | agent 134 |
| #480 DES-Z | CoachWorkoutBuilderScreen | Coach builder visual pass | Coach | Coach side | agent 134 |
| #481 DES-S2 | SettingsScreen, ClientTutorialSetting | Seven groups, no drill-down | More > Settings (tutorial row needs clientTutorial, which is ON). C: yes. K: yes | Same as #477. Prototype 74 (Privacy > Roman) lives in RomanAiConsentScreen, not here | KEEP; -> APPLY-SETTINGS-133 |
| #482 DES-AK | CommunityTabScreen, CommunityTodayScreen | Serif date, hairline Today, one forest action | Community tab (communityTab ON). C: yes (empty). K: yes | Custom retry at CommunityTodayScreen.tsx:129-134 | KEEP; -> APPLY-HABITS-CAL-COMM-133 |
| #483 DES-H | HealthFitnessScreen, ActivityBars, starterGoals | Honest Starter goal bars | More > Health and sleep. C: yes. K: yes | OK by the scan | KEEP |
| #484 DES-AJ | MoreScreen | Six quiet groups | You tab. C: yes. K: yes | MoreScreen RN-SAV. Prototype 67 is the Guidance row | KEEP; insets -> APPLY-INSETS-133; Guidance row (67) -> ROMAN-ROOM-133 |
| #485 DES-AE | ClientWorkoutViewer, WorkoutHistoryEdit | Real dates, hairline rows | Train > All coach workouts / history (P). C: locked. K: yes | No insets on either | KEEP |
| #486 DES-AC | ClientMacrosScreen | Calorie hero, QuietBar macros | More > Macro targets (P). C: locked. K: yes | h1 | KEEP |
| #487 DES-AM | NotificationCenterScreen; client NotificationsScreen | Hairline notification rows | Home bell > NotificationCenter: C yes, K yes. Client `Notifications` route: no caller (the push router maps it to the center, pushTapRouter.ts:68) | Center: title h2 (:399), margin 20 (:394/:414/:428), 4 TouchableOpacity, pull-only error (:121/:187), top56 | KEEP the center -> APPLY-SETTINGS-133; NotificationsScreen UNREACHABLE -> DELETE |
| #488 DES-AF | CalendarHome, CalendarSession, calendarUi | Next session first, one booking action | Calendar tab (clientCalendar ON) (P). C: locked. K: yes | "See Calendar" Title Case (CalendarSessionScreen.tsx:108) | KEEP; -> APPLY-HABITS-CAL-COMM-133 |
| #489 DES-AD | HabitsScreen, habits/* | Hairline habits, one save action | Home > Habits, More > Habits and check-in. C: yes. K: yes | top60 sits under a native back header, giving a double gap (habits/styles.ts:8). 10 pt text (:91). 13 TouchableOpacity. ActivityIndicator + "Retry habits" (HabitsScreen.tsx:322/:329) | KEEP; -> APPLY-HABITS-CAL-COMM-133 |
| #490 DES-AB | PlanScreen, ClientDailyMealPlanScreen | Readable meal plan, real retry | More > Meal plan (P). C: locked. K: yes | PlanScreen RN-SAV | KEEP; insets -> APPLY-INSETS-133 |
| #491 DES-AA | MessagesScreen, MessageBubble, ThreadV2Parts, useThreadColors | One quiet thread, hairline composer | Home header > Messages. C: opens a thread with no coach (B25). K: yes | top56/60 | KEEP; coach threads use the same shared components (note for agent 134) |
| #492 DES-K | HomeScreen, HomeHeaderActions | Serif headline, one metric row | Home. C: yes. K: yes | Prototype 63: no. RN-SAV | REDO TO PROTOTYPE -> CLIENT-HOME-133 |
| #493 DES-AI | RoutineBuilderScreen | Quiet routine builder, one Save | Train > routines (entry is P). C: locked. K: yes | top56 | KEEP; insets -> APPLY-INSETS-133 |
| #494 DES-AN | RecipesScreen, RecipeDetailScreen | Hairline recipes, bookmark as the primary | More > Recipes. C: yes. K: yes | top60. Static count of forest fills is 8 and 7 (chips); not checked on screen | KEEP; insets -> APPLY-INSETS-133 |
| #495 DES-AH | ExerciseLibrary, ExerciseDetail | Hairline library, real equipment | More > Exercise library (the screen itself is not P). C: yes. K: yes | h1 | KEEP |
| #496 DES-AP | EditProfileScreen | Hairline form, one Save | Profile / Home > Edit profile. C: yes. K: yes | top60 | KEEP; insets -> APPLY-INSETS-133 |
| #497 DES-AG | CalendarBookScreen; ClientUpcomingSessionsScreen | Real slot grid; hairline upcoming list | Calendar > Book (P): C locked, K yes. ClientUpcomingSessions: no caller | h1 | KEEP Book; ClientUpcomingSessions UNREACHABLE -> DELETE |
| #498 DES-AL | CommunitySpace, CommunityThread, CommunityComposer | Serif space name, hairline posts | Community tab Hall/Cohorts (ON). K: yes. C: no workspace, so the empty state | h1 | KEEP |
| #499 DES-AS | PackageSelectionSheet, ClientPackages, PackageCheckout, PackageDetailSurface | Calm packages and checkout | Membership > packages, deep link p/:token (Android). K: yes. C: CoachlessHomeSlot > packages | Money surface: presentation only | KEEP |
| #500 DES-AO | GroceryList, PrepGuide; ShoppingListScreen | Hairline lists, numbered prep | More > Grocery list / Prep guide: C yes, K yes. ShoppingList: More row removed by CF-ONE-LIST-128 (f980a8e4), no caller | top60 | KEEP Grocery and Prep; ShoppingList UNREACHABLE -> DELETE |
| #501 DES-AT | DeliverablesScreen, dropRow | Hairline unlocked content | After a purchase or a push (deliverables ON). K with a purchase | h1 | KEEP |
| #502 DES-AW | AcceptInvite, EmailVerified, RoleSelection | Calm invite and verify; role cards | Auth stack. C: yes. K: yes | Prototype 01: list rows + radios, not cards with chevrons (B17). serif 32/35 (RoleSelectionScreen.tsx:528, EmailVerified:121) | RoleSelection: REDO TO PROTOTYPE -> AUTH-ENTRY-133; AcceptInvite/EmailVerified: KEEP (AUTH-ENTRY-133 owns the files) |
| #503 DES-AV | CreateAccountScreen | Hairline form, one forest primary | Auth. C: yes. K: yes | Prototype 02 starts with "Continue with Apple"; the create screen has no Apple/Google button (only LoginScreen does). B13 | REDO TO PROTOTYPE -> AUTH-ENTRY-133 |
| #504 DES-AU | WelcomeScreen, Login, ForgotPassword, ResetPassword | Welcome favours Sign in; calm sign-in and recovery | Auth. C: yes. K: yes | Prototype 00: no. "GP" box (WelcomeScreen.tsx:30, B11). "Sign in" filled + "Create account" (:48/:59) where the prototype has "Get started" filled + a "Log in" link. RN-SAV + paddingTop 80. Forgot/Reset serif 32/35 | REDO TO PROTOTYPE -> AUTH-ENTRY-133 |
| #506 DES-BC | AIGuideScreen, RomanConversation(s) | Guidance without bubbles, real dates | More > Guidance (AIGuide is P): C locked, K yes. Conversations: C yes, K yes | Prototype 67 / 69-73: no. AIGuide serif 32/35, 22/26; top60 | REDO TO PROTOTYPE -> ROMAN-ROOM-133 |
| #507 DES-BA | PreferencesScreen, notifications/NotificationPreferencesScreen, settings/NotificationPreferencesScreen | Calm preference screens, real server values | Settings > Notifications > notifications/NotificationPreferences: C yes, K yes. PreferencesScreen: its row was removed as dead (0f4e80da, AUDIT-12-125). settings/NotificationPreferences: no client caller | Serif with no lineHeight (Preferences:379 28/-, settings NotifPrefs:466 26/-) | KEEP the notifications prefs; PreferencesScreen + client settings/NotificationPreferences UNREACHABLE -> DELETE (or wire: needs operator) |
| #508 DES-AX | day-one Welcome, CoachPairing, Goals, Notifications, CheckInTime, Ready, StepHeader | Calm Day-1 | Day1OnboardingNavigator is mounted nowhere (navigation/README.md:20). No route | RN-SAV on all 6; serif 64/70, 44/50 | UNREACHABLE -> DELETE (LEAN-CUT-133). Keep `day-one/answers.ts` (SettingsScreen, authActions) and `day-one/i18n` (coach import-journey copy, lane 134) or move them first |
| #509 DES-AY | consultation components.tsx, RevealScreens.tsx | Hairline choices, truthful reveals | ConsultationOnboardingNavigator only when `consultation_available` (RootNavigator.tsx:342-351), and production has 0 ClinicProgramSet rows. Nobody reaches it today | Close to prototype 03-45 (F3), never seen. h1 x2 | UNREACHABLE today -> live via CONSULT-ALL-BE/M-133; 90% parity -> CONSULT-PARITY-133 |
| #510 DES-BD | Education, Timeline, CoachGuidelines, ClientPathCopilot | Monochrome learning, real dates | More > Learn / Timeline: C yes, K yes. Train > Guidelines (entry P). Copilot: flag OFF | Education serif 24/- (:447) and 32/35 | KEEP; Copilot UNREACHABLE (flag off) |
| #512 DES-AR | Leaderboard, LeaderboardSettings, CommunityChallenges, ChallengeDetail | Dated rows, computed rank | Leaderboard: Community header, coached only (CommunityTabScreen.tsx:117). Challenges: communityChallenges OFF (CommunityNavigator.tsx:88-99) | h1 | KEEP Leaderboard; Challenges UNREACHABLE (flag off) |
| #515 DES-K2 | Home child cards, new ui/sections/QuietSection, CoachlessHomeSlot, PendingInviteBanner, PushPermissionCard, MacroExplanationCard, DunningBanner, FeaturedCoachEditor | Hairline sections instead of filled cards | Home. C: yes. K: yes | Prototype 63 LAND (daily targets card): no | REDO TO PROTOTYPE -> CLIENT-HOME-133; MacroExplanationCard -> TOUR-133; DunningBanner = agent 132 file; FeaturedCoachEditor = agent 134 |
| #516 DES-BB | TrustCenter, BlockedUsers, DataExport, DeleteAccount | Hairline privacy screens, one forest action | Settings > Privacy and data. C: yes. K: yes (coach Settings opens the same screens) | top56 everywhere. Serif with no lineHeight: BlockedUsers:219, DataExport:890/:955/:960, DeleteAccount:808/:960 | KEEP; Q5 -> APPLY-SETTINGS-133 |
| #552 FAST-CALM | FastingScreen, WidgetsScreen, useSettings, fastingAlert | One time, one forest Start/End | More > Fasting (P): C locked, K yes. Shortcuts: C yes, K yes | h1 x2 | KEEP |

Totals. KEEP 32. REDO TO PROTOTYPE 10 (#466, #469, #492, #502 role, #503, #504, #506, #509, #515, plus #467 label fit). UNREACHABLE 1 whole (#508) plus 9 partial screens. DELETE proposals 7 screen sets. Coach side 4 (#472, #479, #480, #473 coach files).

## 3. Old screens and flows the consultation makes dead (lane 133), with the route that still reaches each
| Old screen / flow | Route that reaches it today | Who hits it | Action |
|---|---|---|---|
| Lean flow LeanQ1-LeanQ6 (src/screens/onboarding/Lean*.tsx, LeanOnboardingNavigator.tsx, lib/finalizeLeanOnboarding.ts, hooks/useLeanOnboardingReconcile.ts, utils/onboardingStore.ts) | RootNavigator.tsx:766-773 sets `onboarding`. RootNavigator.tsx:960-966 mounts LeanOnboardingNavigator whenever `consultationApplies()` is false, which is every client (0 ClinicProgramSet), and always in preview/production (flag off) | EVERY new client in every build | DELETE in LEAN-CUT-133 after CONSULT-ALL-M-133 merges. NEED RootNavigator.tsx (agent 132) for the branch |
| OnboardingStep1-10 + OnboardingResults (OnboardingNavigator.tsx) | Imported only (RootNavigator.tsx:17-21, "intentionally imported but not mounted") | nobody | DELETE (LEAN-CUT-133); the import line is in RootNavigator (agent 132) |
| Day-1 stack: day-one Welcome, CoachPairing, Goals, Notifications, CheckInTime, Ready, StepHeader, resume.ts, api.ts (Day1OnboardingNavigator.tsx) | Mounted nowhere | nobody | DELETE (LEAN-CUT-133); keep or move day-one/answers.ts and day-one/i18n first (see #508) |
| Day1WinScreen + lib/day1WinSkip + services/firstWinApi (src/screens/client/Day1WinScreen.tsx, RN-SAV) | RootNavigator.tsx:787-806 `day1win` when `standardPath` (flag off, or the standard marker set because the consultation was unavailable) and the first win is not done | every lean-flow client today | DELETE with the lean flow; the consultation replaces it (RootNavigator.tsx:782-786 comment). NEED RootNavigator (agent 132) |
| PackageSelectionSheet re-prompt (`package_prompt`) | RootNavigator.tsx:820-840, 24 h after a dismiss | K on Android | Not onboarding; keep (money UI, no change) |
| Old welcome variants: day-one/WelcomeScreen (dead); auth/WelcomeScreen "GP" box + "Sign in or create an account." (live); components/OnboardingLayout.tsx (no importer) and its StepTransitionView | Auth stack `Welcome` (live); the others have none | everyone (auth) | auth Welcome -> AUTH-ENTRY-133 (prototype 00); OnboardingLayout + day-one Welcome -> DELETE |
| `onboarding_complete` AsyncStorage + the profile field checks for the old 10-step flow | RootNavigator.tsx:756-781 | existing clients | Keep (the cold-boot gate); agent 132 file |

## 4. Coach-side items for agent 134 (not edited, not audited)
- #472 ClientsListScreen; #479 ClientDetailScreen + client-detail/WorkoutsTab; #480 CoachWorkoutBuilderScreen; #473 ExtensionPairingPanel,
  CoachPackageEditScreen, CoachPackagesListScreen; #515 FeaturedCoachEditorScreen (1 line).
- Never-run coach jobs: QA-COACH-128 (CoachNavigator tab icons, label 10/600 at CoachNavigator.tsx:707, ClientsList 13 pt overlines, builder
  pressed states, ProgramsLibrary radius 12), QA-SHEETS-128 coach part (radius above 4 still at AiBuilderSheet.tsx:197-203, WeekAiSheet.tsx:257-260,
  AdjustForClient.tsx:117-118, RevisionHistorySheet.tsx:106-107, ClientCopyBar.tsx:58-59), QA-COACH-SET-129. Coach tab bar decision (DESIGN-QA-128 item 4).
- Shared with coaches: #491 MessageBubble/ThreadV2Parts and #516 privacy screens are opened from coach Settings too. Any lane-133 change there shows on the coach side.
- Agent 132 files met here: entitlements ProtectedScreen.tsx (coachless lock, radius 8 at :192), PaywallSheet.tsx (radius at :416/:430), dunning/DunningBanner.tsx (#515), RootNavigator.tsx (lean/Day-1 branches, OnboardingNavigator import).

## 5. Q5 + Q10b cross-cutting findings (for DS-PRIMITIVES-133; from the code)
- Q10b radius: two radius token sets both encode squares: theme/index.ts:137-142 `Radius` (sm 0 "buttons, primary CTAs", md 2 inputs, lg/xl 4 cards) and tokens.ts:241-249 `radius` (the same values plus '2xl' 4). DS-PRIMITIVES-133 must change both, or retire one, or the token users will disagree. The doctrine test src/__tests__/quietLuxuryDoctrine.test.ts enforces the old rule. Hardcoded radii: 71 touched files (list from `grep -c "borderRadius: *[0-9]"`). The largest are habits/styles.ts 20, ProgressScreen 15, active-workout/styles.ts 10, EducationScreen 10, ReportScreen 7, PrepGuideScreen 7, Settings/Grocery/ShoppingList 6 each, Recipes/RecipeDetail/Plan/Messages/CoachGuidelines/AIGuide/DeleteAccount 5 each.
- Token line heights: `typography.display` 44/46 (1.05x) and `h1` 32/35 (1.09x) at src/theme/tokens.ts:148-161 are under the 1.2x rule. Every h1 title on the 36 touched files that use it can clip descenders on Android (B15 root cause). Fix once in tokens (display lineHeight 53, h1 39), plus the hand-rolled serif styles listed in the table.
- Top spacing: 37 touched files use a fixed `paddingTop` of 40-80 with no insets. Five live screens use SafeAreaView from 'react-native': auth/WelcomeScreen, client/HomeScreen, MoreScreen, PlanScreen, MembershipScreen. Day1WinScreen and the day-one screens also do, but they are being deleted. This is B13/B28/B39.
- Two spacing scales share key names: theme/index.ts:127 `Spacing.lg=24` and tokens.ts:229 `spacing.lg=16`. Camel border from constants/colors.ts:27-28 is spread by ThemeProvider.tsx:59 (DESIGN-QA row 1, still true).
- U1 (still true): the Haptics switch is ignored. HapticPressable.tsx:52-67 calls expo-haptics directly, and only HapticService reads `hapticsEnabled`.

## APPLY JOBS
All entries: claude_opus_5_5, T1 mobile presentation. Each starts AFTER DS-PRIMITIVES-133 merges and uses its button, overline, section, row and screen-wrapper API (never a home-made one).
Each obeys _COMMON_133 Q1-Q10, with a parity table per screen (no prototype screen for most: "no prototype; Q5 + doctrine"), every route and action kept, and under 400 lines.
Re-checked against df7b8ae9 on 10-08 17:05-17:20. Already fixed since 10-07 and dropped: WorkoutScreen title and boxes, Title Case in Workout/Log/Settings,
ClientMacros margin, "Start Fresh".
Q10b (owner 17:07) applies to every entry. DESIGN-QA-128's "radius to 4" items are reversed: every hardcoded `borderRadius: <n>` in an entry's files moves to the DS-PRIMITIVES-133 radius tokens (defaults: buttons/inputs 12, cards 16, sheet tops 24, chips pill). No 4 pt button or card ships. The `Radius.md`/`Radius.lg` users in the food sheets get rounded once the token values change.

### APPLY-FOOD-133 (from QA-FOOD-128) — Food tab, the most used client screen. ~280 lines. Order: 1st after DS-PRIMITIVES-133.
Files: src/screens/client/LogScreen.tsx, src/components/log/{MealSectionCard,FoodSearchView,QuantityPickerModal,ManualFoodEntryForm,FoodSearchModal,DailySummaryBar}.tsx,
src/components/{WaterTracker,DaySelector}.tsx.
Still wrong:
- LogScreen.tsx:804 `paddingTop: 60` with no insets.
- Fixed `Colors` instead of `useTheme().semanticColors`: QuantityPickerModal (19), ManualFoodEntryForm (20), FoodSearchModal (6), DaySelector (5), DailySummaryBar (1).
- TouchableOpacity with the 0.2 flash instead of HapticPressable: LogScreen (5), FoodSearchView (8), QuantityPickerModal (3), WaterTracker (1), DaySelector (3).
- kcal figures not tabular: MealSectionCard, FoodSearchView, QuantityPickerModal.
- Hand-rolled overline at LogScreen.tsx:866-874 (11 pt, letterSpacing 1) instead of the eyebrow token.
- DailySummaryBar.tsx:70 is Cormorant 44 with no lineHeight.
No change to logging, offline queue, portions or totals. Reach: K now; C after b#888 (agent 132).

### APPLY-LIVE-133 (from QA-LIVE-128) — live workout. ~170 lines. Order: after DS-PRIMITIVES-133, any time.
Files: src/screens/client/ActiveWorkoutScreen.tsx, src/screens/client/active-workout/{styles.ts,ExerciseCard.tsx}, src/screens/client/WorkoutAssignmentDetailScreen.tsx.
Still wrong:
- styles.ts:8-18 topBar: cream `colors.surface` fill, `paddingTop: 56` with no insets, margin 20. Also margin 20 at :141 and :164; the page margin is 24.
- styles.ts:24 finish button radius 0. Use the shared primary instead (rounded per Q10b).
- 10 hardcoded radii in styles.ts (including :236, the rest overlay at 12) -> tokens.
- WorkoutAssignmentDetailScreen.tsx:290 hardcoded 12 -> token, and :306-307 an uppercase label with letterSpacing 1.2.
- "Add Set" at ExerciseCard.tsx:132. "Add Exercise" at ActiveWorkoutScreen.tsx:636, :1276 and :1291.
Set logging, the rest alert (#474) and finish logic stay frozen.

### APPLY-PROGRESS-133 (DES-P-128, never started; WEIGH-KB-128 has merged, 690e8b05) — Progress. ~400 lines; split body/chart if over. Order: after DS-PRIMITIVES-133.
Files: src/screens/client/ProgressScreen.tsx (1,325 lines) + new presentational files under src/components/progress/.
Still wrong:
- The only FAB in the client app: ProgressScreen.tsx:807-812, style :1231-1240.
- Cream boxes (`colors.surface`) at :975, :1027, :1078, :1122 and :1174.
- Text under 13 pt at :179, :957, :999, :1015, :1043, :1067, :1115, :1193, :1201 and :1227.
- Uppercase labels at :181, :1046 and :1196.
- "Body Stats" (:759) and "Recent Entries" (:783).
- 15 hardcoded radii -> tokens (Q10b).
- Fixed top60.
- Serif line heights under 1.2x: :165 (26/30), :947 (32/35), :1033 (22/26).
Keep every action from the DES-P-127 job text: chart, 7D/30D/90D/All, goal, body stats, entries, Log weight (the FAB becomes an inline action), report link, weigh-in share.
Also WEIGH-KB-128 U2, U3 and U12. Reach: More > Progress, C and K.

### APPLY-SETTINGS-133 (from QA-SETTINGS-128 + the #516 Q5 gaps) — Settings, notifications, privacy. ~260 lines. Order: after DS-PRIMITIVES-133.
Files: src/screens/client/SettingsScreen.tsx, src/screens/client/settings/SettingsSection.tsx, src/screens/notifications/NotificationCenterScreen.tsx,
src/screens/TrustCenterScreen.tsx, src/screens/settings/{BlockedUsersScreen,DataExportScreen,DeleteAccountScreen}.tsx.
Still wrong:
- SettingsScreen.tsx:641 `paddingTop: 56`.
- SettingsSection.tsx:25 overline at 13 pt instead of the token.
- NotificationCenterScreen: title h2 at :399 (its sibling uses h1); margin 20 at :394, :414 and :428; 4 TouchableOpacity; the errors at :121 and :187 only say "Pull down to try again" and need a quiet retry; top56/80.
- Serif with no lineHeight: BlockedUsers:219, DataExport:890, :955 and :960, DeleteAccount:808 and :960. Also top56 on all four.
Delete-account, export and block logic stay frozen. These screens are shared with coach Settings, so tell agent 134.
Lane note: src/screens/settings/**, src/screens/notifications/** and TrustCenterScreen.tsx are not named in Q3 (needs operator; default lane 133).

### APPLY-HABITS-CAL-COMM-133 (from QA-HABITS-CAL-COMM-128) — Habits, Calendar session, Community Today. ~220 lines. Order: after DS-PRIMITIVES-133.
Files: src/screens/client/HabitsScreen.tsx, src/screens/client/habits/{styles.ts,AddHabitSheet.tsx,HabitCard.tsx,MoodEnergyPicker.tsx},
src/screens/client/calendar/CalendarSessionScreen.tsx, src/screens/community/CommunityTodayScreen.tsx.
Still wrong:
- habits/styles.ts:8 `paddingTop: 60` under the native back header (Habits uses backOnlyHeader), giving a double top gap.
- 10 pt text at habits/styles.ts:91.
- 13 TouchableOpacity (Habits 6, AddHabitSheet 2, HabitCard 1, MoodEnergyPicker 4).
- ActivityIndicator plus a custom "Retry habits" at HabitsScreen.tsx:322/:329. Replace them with the shared skeleton and calm error state.
- "See Calendar" at CalendarSessionScreen.tsx:108.
- A home-made retry at CommunityTodayScreen.tsx:129-134.
- 20 hardcoded radii in habits/styles.ts -> tokens (Q10b).
Lane note: src/screens/community/** is not named in Q3 (needs operator; default lane 133).

### APPLY-PROFILE-133 (Profile part of QA-ROMAN-PROFILE-128; the Roman part goes to ROMAN-ROOM-133) — Profile. ~140 lines. Order: after DS-PRIMITIVES-133.
File: src/screens/client/ProfileScreen.tsx.
Still wrong:
- 21 static `colorTokens.*` (:277-364) instead of the theme.
- Stone text at :318 and :329 (about 2.3:1 on bone, fails AA).
- Charcoal secondary text at :324 and :364 instead of textMuted.
- Cream fill at :347 instead of a hairline.
- top60.
- Serif at :304 is 28/32.
For ROMAN-ROOM-133: static tokens in RomanChatScreen (7), RomanComposer (10), RomanMessageBubble (7), RomanTypingIndicator (1).

### APPLY-INSETS-133 (Q5 point 3 sweep on redo screens that no other job owns) — ~200 lines. Order: after DS-PRIMITIVES-133 posts its screen wrapper. Drop this job if DS-PRIMITIVES-133's entry already adopts the wrapper on these screens (operator check).
Files: src/screens/client/{MoreScreen (RN-SAV), PlanScreen (RN-SAV), MembershipScreen (RN-SAV), WorkoutScreen (:1008 top60), EditProfileScreen, EducationScreen,
GroceryListScreen, PrepGuideScreen, RecipesScreen, ReportScreen, RoutineBuilderScreen, WidgetsScreen, ClientPackagesScreen, PackageCheckoutScreen,
PurchaseUnpackScreen, CoachGuidelinesScreen, MessagesScreen}.tsx.
Change: the inset-based top from the wrapper in place of the fixed 56/60 or RN SafeAreaView. Education serif 24/- at :447. Every hardcoded radius in these files -> DS tokens (Q10b): Education 10, Report 7, PrepGuide 7, Grocery 6, Recipes 5, RecipeDetail 5 (add it to the list), Plan 5, Messages 5, CoachGuidelines 5, PurchaseUnpack 4, Leaderboard 4 (add), Timeline 2 (add), and 1 each in the rest. Also add components/messaging/MessageBubble.tsx (3) and ThreadV2Parts.tsx (1); they are shared with coach threads, so tell agent 134. Presentation only. ~260 lines.
Not here: HomeScreen (CLIENT-HOME-133), auth (AUTH-ENTRY-133), AIGuide/Roman (ROMAN-ROOM-133).

### APPLY-DEVICES-133 (DES-AZ-127, never started) — connected devices and metric detail. ~180 lines. Order: last; lowest client impact.
Files: src/screens/client/wearables/{ConnectionsScreen,WearablesShell,MetricDetailScreen}.tsx. They already use safe-area-context.
Still wrong: cream `surface` fills (WearablesShell 1, MetricDetailScreen 3); real status and last-sync rows; dated metric values with the DES-H Starter goal label.
Reach: More > Connected devices and Health and sleep, C and K.

### APPLY-DEAD-133 (cleanup of redone screens with no route) — ~deletions only, plus tests and README rows. Order: with or after LEAN-CUT-133. Needs operator yes.
Delete: ShoppingListScreen (row removed f980a8e4), client NotificationsScreen (`Notifications` route; the push router already maps it to the center), ClientUpcomingSessionsScreen
(Calendar tab replaced it), PreferencesScreen (row removed as dead 0f4e80da), components/OnboardingLayout.tsx + onboarding/StepTransitionView (no importer).
Their routes in ClientNavigator.tsx go too (lane 133 file). Default: delete. The alternative for PreferencesScreen is to wire it from Settings, since units, week start and tone have no other entry (owner choice).

### Not launched (reasons)
- DES-AQ-127 (Community DMs + Find): communityDm is false in clinic and communitySearch is off, so no client can reach them. Park it until a flag is turned on.
- QA-THEME-128 and QA-PRIM-128 go to DS-PRIMITIVES-133. Still-true items for it are in section 5: token line heights, two spacing scales, the camel border, the haptics switch, and the spring release (HapticPressable).
- QA-TRAIN-128: done on main except the top inset (folded into APPLY-INSETS-133).
- QA-SHEETS-128: its "radius to 4" goal is reversed by Q10b. What remains is hardcoded radius -> tokens, plus TouchableOpacity -> HapticPressable. Coach sheets -> agent 134; PaywallSheet/ProtectedScreen -> agent 132. AiConsentSheet.tsx:509 (hardcoded 12, 8 TouchableOpacity) -> ROMAN-ROOM-133 / ROMAN-CONTEXT-133 (consent sheet; no copy change).
- Radius sweep for touched lane-133 files that no entry above owns: fold it into APPLY-INSETS-133 (same files), as one line per radius. Excluded: auth (AUTH-ENTRY-133), Home and its cards (CLIENT-HOME-133), Roman/AIGuide/RomanConversation(s) (ROMAN-ROOM-133), consultation (CONSULT-PARITY-133), tutorial (TOUR-133), coach (134) and entitlements (132).
- QA-COACH-128 and QA-COACH-SET-129 -> agent 134. DES-N stays cancelled (6 tabs).

## Findings count
B=0 new. Every ordinary-use harm found maps to an existing register ID, now with root-cause lines: B14/B33 (F1), B15 (tokens.ts:148-161), B22/B23 (ProtectedScreen), B25, B26, B28/B39 (insets), B30.
U=4 new:
- U1: the Haptics switch is ignored (HapticPressable.tsx:52-67).
- U2: Profile stone text fails AA (ProfileScreen.tsx:318/:329).
- U3: the Progress FAB (ProgressScreen.tsx:807).
- U4: 9 redone screens have no route (section 2), so that work is wasted.

## Needs operator (4)
1. Phase 2 go: which APPLY jobs launch. Default: FOOD, LIVE, PROGRESS, SETTINGS, HABITS-CAL-COMM, PROFILE after DS-PRIMITIVES-133; INSETS only if DS-PRIMITIVES-133 does not adopt the wrapper; DEVICES last; DEAD with LEAN-CUT-133.
2. Lane assignment for src/screens/settings/**, src/screens/notifications/**, src/screens/community/**, src/screens/TrustCenterScreen.tsx, src/screens/day-one/** and src/screens/onboarding/**. None is named in Q3, and none is a 132 or 134 file. Default: lane 133.
3. APPLY-DEAD-133 deletions (default delete). PreferencesScreen: delete or wire from Settings.
4. Confirm that DS-PRIMITIVES-133 fixes the display/h1 line heights in tokens.ts (one change fixes every h1 title), or add it to its entry.

## HANDOFF
- SAFE STOP (owner 18:57, operator 18:58): stopped cleanly at 18:59. Phase 2 was never started. I have no PR, no branch (no agent133/redo-audit* exists), no CLAIM to release and no verdict pending. Nothing is unfinished or half-pushed.
- PR state: none (read-only job).
- Main moved after the audit: mobile is now 2acc228c372537119739453d065673614134fb9c (the audit was at df7b8ae9), backend e261ce5e85ac9b7f0a5df5687ed81813aea96671 (the audit was at 051583ad). The per-PR table and the APPLY JOBS file:line rows are true at df7b8ae9 only.
- Next agent, first: run `git log --oneline df7b8ae9..origin/main --stat` in a read-only mobile clone. Re-run `ops/reports/redo-audit-133/q5scan.py` on the APPLY JOBS files, and re-check their file:line rows against the new main. Then read DS-PRIMITIVES-133's "## API" (radius tokens per Q10b, screen wrapper) before the operator launches any APPLY job. The 4 "Needs operator" items above are still open.
- State: phase 1 done, read-only. No branch, PR, comment or edit. Audited mains df7b8ae9 / 051583ad.
- Deliverables: this report; scan script and JSON + prototype contact sheet in ops/reports/redo-audit-133/; notify line ops/lanes133/notify/REDO-AUDIT-133.txt.
- Phase 2 (on the operator's go only): open the APPLY jobs above that the operator assigns to me, in the order given, each from a fresh agent133/<job-id-lower>
  branch after DS-PRIMITIVES-133 merges.
- Not checked: on-device rendering (nothing seen on a phone); the one-forest-button rule per state (static counts only); production entitlement state of the
  coachless client (decides whether the P routes lock for them after b#888).
