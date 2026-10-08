# EXPLORE-CLIENT-129 map — every client pathway from code (mobile main a1be6fb2, backend main c3324d4a)

Legend: FORGOTTEN = no PR merged on 10-07 touched the screen file AND no report in ops/reports names it. (r) = only a report names it,
no PR touched it. Flags are the store profile `clinic` in eas.json (CLIENT_CALENDAR, COMMUNITY_TAB/HALL/COHORTS, ROMAN_CHAT,
CONSULTATION_ONBOARDING, DELIVERABLES, MWB_* on; COMMUNITY_DM off; BLOODWORK, CLIENT_PATH_COPILOT off).
Break-point column: what happens on close-halfway / offline save / double tap / back mid-save / background-return, as traced.

## 0. Root (src/navigation/RootNavigator.tsx)
Auth states: loading -> unauthenticated | onboarding (consultation or standard, B-REV-1 decided per client at boot) | day1onboarding
| day1win | package_prompt | student (ClientNavigator) | coach | coach_wizard.
- Session: token 1 h, renewed only on a 401 (api.ts:428-475); a failed renewal of ANY kind signs out (api.ts:468, 287-330) and
  signOut wipes unsynced food queue, live workout, offline workout rows (authActions.ts:49-100, 365-373) -> B1.
- Offline sync triggers: NetInfo offline->online, foreground, auth change (RootNavigator.tsx:630-668; useFoodLogQueueSync).
- Entitlement re-check on every foreground (EntitlementProvider.tsx:130-139) unmounts protected screens (FW-TRAIN B1, m#521 open).

## 1. Unauthenticated (AuthNavigator)
Welcome, Login, CreateAccount (`join/:invite_code?`), RoleSelection, ForgotPassword, ResetPassword (`reset-password`, tgp://),
EmailVerified (`verified`), AcceptInvite (`invite/accept/:token`), AuthCallback (`auth/callback`), SupportInbox (r).
Signed-out links: reset/accept-invite force sign-out and replay (RootNavigator.tsx:461-627); join codes are stashed for the
PendingInviteBanner; package links `p/:shareToken`, `billing/update-card`, `checkout/:outcome` exist only under MoreTab and are
dropped while signed out (C4); push taps while signed out are dropped by design (pushTapRouter.ts:16,244; C3).
Universal links (GET 16:18): iOS AASA paths /join/*, /invite/*, /billing/update-card only; Android filters add /p, /reset-password.
https /p/<token>, /reset-password and /invite/accept/<x> return raw JSON 404 on the web (R2; dormant, see report).

## 2. Onboarding (signed in, before the tabs)
- Consultation (ConsultationFlow, QuestionScreen, RevealScreens): close halfway -> encrypted draft per user in SecureStore
  (lib/consultation/storage.ts:99; purged on sign-out). FW-ONB covered.
- Lean Q1-Q6 (LeanOnboardingNavigator): Q5/Q6 drafts in prefs per user. FW-ONB U1-U4, U12.
- Day-1 (Welcome, Goals, CoachPairing, CheckInTime, Notifications, Ready) + Day1Win: FW-ONB U5-U7, U10.
- package_prompt: PackageSelectionSheet -> usePackagePurchase (double tap guarded, idempotent keys; checked).

## 3. Client tabs (ClientNavigator.tsx:700-790): Home, Train, Food, Calendar, You, Community

### Home stack: HomeMain, Habits, Notifications (stub -> center), Messages, ContactView, NotificationCenter, NotificationPreferences
- Habits & check-in (m#489): check-in Save disabled while pending (HabitsScreen.tsx:421); Add habit double tap -> duplicate (C2).
- Messages (m#491): send guarded, offline -> persisted pending bubble + same-key resend (checked).
- Push targets (CLIENT_PUSH_ROUTES pushTapRouter.ts:64-91): Messages, NotificationCenter, Habits, Timeline, MoreIndex, Membership,
  Deliverables, WorkoutMain, Log, CalendarSession, CommunityEventDetail, Community.

### Train stack: WorkoutMain, ActiveWorkout, WorkoutHistoryEdit (r), RoutineBuilder (m#493), CoachGuidelines, ExerciseLibrary, ExerciseDetail
- ActiveWorkout: live session in AsyncStorage `@activeWorkoutSession/v1`; close halfway -> Resume prompt; Finish offline -> SQLite
  queue row 'pending' + "Workout not saved yet ... tap Finish again", auto-sync on reconnect/foreground, re-Finish dedupes by
  client key (ActiveWorkoutScreen.tsx:855-925, sync-engine.ts:198-217). Foreground teardown = FW-TRAIN B1 (m#521). Sign-out or a
  failed renewal deletes all of it (B1). Resume after more than 24 h -> duration over 1440 min -> 400 on every Finish (U1).

### Food (Log) tab: LogScreen + Add Food sheet (FoodSearchView, QuantityPickerModal, ManualFoodEntryForm), WaterTracker
- Log Food buttons disabled while saving (QuantityPickerModal.tsx:152, ManualFoodEntryForm.tsx:132); offline -> per-user queue
  `pending_food_logs_<uid>`, idempotent client_uuid, flush on reconnect (FW-FOOD). Wiped by sign-out / failed renewal (B1).

### Calendar stack (flag on): CalendarHome, CalendarBook, CalendarSession; ClientUpcomingSessions (More)
- Book: synchronous inFlight ref + uncertain-outcome "Check Calendar before booking again" (CalendarBookScreen.tsx:197-231). Checked.

### You (MoreTab) stack — 50 routes
MoreIndex, ProfileMain, EditProfile (save guarded + validated; checked), Recipes (r), RecipeDetail (r), GroceryList, ShoppingList,
PrepGuide, Fast (r; CF-FAST-CALM in flight), Community (Wins, r), CommunitySafety (r), Progress (Log weight: double tap -> two
weigh-ins, fixed in open m#520), Settings, Widgets (r), Report, Learn, Plan (r), TrustCenter, DeleteAccount, RomanAiConsent,
CoachSharing, RomanConversations (r), RomanConversation (r), Preferences, AIGuide (r), Membership, Timeline, Leaderboard,
LeaderboardSettings, Bloodwork (flag OFF, unreachable), Copilot (flag OFF), PrivateCommunityHub (flag isDev), RomanChat (flag on),
ShareCard (FORGOTTEN), NotificationPreferences, NotificationSettings, SupportInbox (r), ClientMacros, ClientDailyMealPlan (r),
ClientWorkoutViewer (r), WorkoutAssignmentDetail, ClientUpcomingSessions, DataExport, ClientPackages, UpdateCard (FORGOTTEN; dunning;
busy-state guarded, many B-322 fixes), CheckoutReturn, Deliverables, PurchaseUnpack, BrandedCheckoutWebView (FORGOTTEN; no screen
navigates to it — dead code), ContactView, BlockedUsers, Connections (r), Health = WearablesShell (r), WearableMetricDetail (r),
PackageCheckout (`p/:shareToken`).
- Sign Out (Settings / Profile): confirm "Are you sure you want to sign out?" only; no flush, no warning about unsynced logs (B1).

### Community tab (flag on): CommunityToday, CommunitySpace, CommunityThread, CommunityComposer, CommunityVoiceComposer,
CommunityVoiceNoteDetail, CommunityFind, CommunityClassroom, CommunityLessonDetail, CommunityChallenges, CommunityChallengeDetail,
CommunityEventDetail, CommunityDmList/DmThread (DM flag off), CommunitySafety, Leaderboard, LeaderboardSettings. FW-COMM covered.

## 4. States checked per break point
| Break point | Result |
|---|---|
| Close halfway | consultation draft kept; live workout resume; food sheet state lost (expected); purchase keys memory-only (C) |
| Wifi off before/during/after save | food + workout queue offline (good); messages pending bubble (good); weigh-in/habit/profile show an error and keep input; a failed session renewal signs out and wipes queues (B1) |
| Double tap | guarded: messages, check-in, food, booking, purchase, Roman send, profile; NOT guarded: Log weight (m#520 fixes), Add habit (C2) |
| Back gesture mid-save | goBack from an unmounted screen is ignored by the stack router (no double pop); workout leave guard in m#521 |
| Background and return | entitlement re-check teardown (FW-TRAIN B1, m#521); first call after 1 h renews the session (B1 path) |
| Push / email links signed out | pushes dropped by design; reset, accept-invite, verified, join work; billing/update-card and p/ dropped (C4) |
| Session expiry | renewal on 401 only; invalid refresh token -> sign-out (correct) but wipes unsynced logs (B1) |
| Delete then re-add | account deletion has a grace period with cancel (m#516); habit delete/re-add fine; weigh-in has no delete (CF-BODY-J2) |
| Very long names / large numbers | habit name maxLength 60; workout notes 2000; profile weights validated (EditProfileScreen.tsx:320-340); weight API rejects <40/>1500 with raw "Bad Request" (FW-BODY U6); workout body validated with nested rules (workout.dto.ts:67-100: sets <= 100, reps int, names <= 200, duration <= 1440 min) — a workout resumed more than 24 h after its start can never be saved (U1) |
