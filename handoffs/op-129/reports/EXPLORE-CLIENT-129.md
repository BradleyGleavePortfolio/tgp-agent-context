# EXPLORE-CLIENT-129 — a paid client's first two weeks, trying to break it (agent 129, read-only)

Status: IN PROGRESS (16:05-, report current at 16:31 PDT 10-07). Persona: paid client of a coach with an ACTIVE package; coachless
free user compared where paths differ. Code: mobile main a1be6fb2, backend main c3324d4a (read-only worktrees; GitHub mains
re-fetched 16:12, unchanged). Throwaway worktree, never pushed: /home/user/workspace/wt/EXPLORE-CLIENT-129-mobile (local branch
agent129/explore-client-129; the two test files below are the only changes). No sign-in to production, no data created; one
read-only SELECT (count only) and unauthenticated GETs.
Method (owner 16:02): close the app halfway through every multi-step flow; wifi off before, during and after each save; double tap;
back gesture mid-save; background and return; push and email links while signed out; session expiry; delete then re-add; very long
names and large numbers. REPRODUCED = throwaway jest test or read-only GET/SELECT; CODE-ONLY = traced (file:line, handler, API path).

## Proven B (top)

**B1 (REPRODUCED) — Signal drops while the app renews the session: the client is signed out and every unsynced workout set and
offline meal on the phone is deleted.**
- Story: a client opens the app at the gym more than an hour after last using it (or mid-workout, coming back from another app),
  the first call goes through but the signal then drops for half a minute, and the app signs them out and deletes the live workout
  and any meals logged offline that had not synced yet.
- Why: the session token lives one hour and is renewed only after a 401 (api.ts:428-475). performRefresh (api.ts:251-270) throws on
  ANY refresh error, including supabase-js `AuthRetryableFetchError` (no network after its ~30 s of retries,
  @supabase/auth-js GoTrueClient.js:3742-3765, AUTO_REFRESH_TICK_DURATION_MS 30 s), and api.ts:468 sends every non-account-change
  error to handleRefreshFailure (api.ts:287-330) -> full signOut. signOut (authActions.ts:316-470) never flushes first and deletes
  `@activeWorkoutSession/v1` and `active_workout_session:*` (the live workout), `pending_food_logs_<uid>` (the offline food queue,
  ASYNC_SIGN_OUT_KEYS/PREFIXES authActions.ts:49-100) and calls deleteWorkoutLogsForUser (authActions.ts:365-373), which runs
  `DELETE FROM workout_logs WHERE user_id = ?` with no sync-status filter (offline/sync/sync-engine.ts:367-375), i.e. finished
  workouts still queued offline too. The same wipe follows a voluntary Sign Out: the confirm says only "Are you sure you want to
  sign out?" (SettingsScreen.tsx:116, ProfileScreen.tsx:100), nothing about unsynced logs.
- Proof (both PASS, 16:23-16:25 via heavy.sh):
  - `src/services/__tests__/explore129.refreshNetworkSignsOut.test.ts`: 401 + refresh returning AuthRetryableFetchError (status 0)
    -> signOut called once.
  - `src/services/__tests__/explore129.signOutDropsOffline.test.ts`: meal queued offline (foodLogQueue.enqueue) + live workout
    session -> signOut() -> `pending_food_logs_user-A` and `@activeWorkoutSession/v1` gone, logFood never called,
    deleteWorkoutLogsForUser('user-A') called.
- Grade call: B by the data-loss rule (train and log food are core; the owner's 16:02 method puts wifi loss during saves in normal
  use). If the operator counts "signal lost in the ~30 s right after the first 401" as a network-timing edge, the voluntary Sign
  Out wipe alone is still at least U (data lost offline).
- Smallest fix (T4 auth -> Claude Opus 5.5, about 80 lines with tests, mobile only, file-disjoint from every open PR):
  (1) api.ts performRefresh/handleRefreshFailure: a retryable/network refresh failure (name AuthRetryableFetchError, or status 0,
  or no response) rejects the request as a network error and does NOT sign out (the next 401 retries the refresh; an invalid
  refresh token still signs out); (2) authActions.signOut: before the wipe, try one bounded flush of the food queue and the workout
  sync (triggerSync) and, for a voluntary sign-out with rows still pending, say so in the confirm ("2 workouts and 1 meal have not
  synced yet and will be removed from this phone").

## Findings — REPRODUCED

| # | Grade | User story | Steps | Evidence |
|---|---|---|---|---|
| B1 | B | See above: signal drop during session renewal signs the client out and deletes unsynced workouts and meals. | Open app >1 h after last use with weak signal (or log offline, then Sign Out). | Two throwaway jest tests above (PASS); api.ts:251-330,468; authActions.ts:49-100,316-470; sync-engine.ts:367-375. |
| U1 | U | A client who starts a workout, closes the app halfway and comes back the next day to finish it can never save it: every Finish says "Bad Request ... Check the connection, then tap Finish again". | Start a workout, log sets, close the app; more than 24 h later open Train, "Resume earlier workout?" -> Resume -> Finish. | Backend part REPRODUCED: throwaway spec `test/explore129.workoutDuration.spec.ts` in /home/user/workspace/wt/EXPLORE-CLIENT-129-backend (c3324d4a, never pushed) PASS 16:41: same body valid at 60 min, refused at 1500 min with `{"max":"duration_minutes must not be greater than 1440"}` (workout.dto.ts:80-84 `@Max(1440)`, POST /workouts workout.controller.ts:24). Mobile part CODE-ONLY: the timer is wall clock from the original start (ActiveWorkoutScreen.tsx:261-264, 270-277), Finish sends `Math.round(timer / 60)` (:784, :835, :918); a session older than 12 h is still offered for Resume (activeWorkoutSession.ts:46, ActiveWorkoutScreen.tsx:322-370); on the 400 the queued row is parked as rejected (:1066-1072) and the alert reads "Workout not saved yet. Bad Request. The sets stay on this screen. Check the connection, then tap Finish again." (:1114-1119; the filter returns `message` as an array, so errorMessage falls back to `error` = "Bad Request", types/common.ts:58-62, http-exception.filter.ts:86-87). Retrying sends the same start, so it never saves; the only way out is Start Fresh and retyping. Offline variant: Finish offline says "Saved on this phone ... sent to your coach automatically" (:1060-1064), then the sync engine gets the 400, classes it permanent and drops it silently (sync-engine.ts:383-397) — a false claim. Between 12 and 24 h it saves with a 12-24 hour duration in history (C). |
| R2 | C (dormant) | A coach's package share link opened on an iPhone shows a raw JSON error page. | Tap https://app.trygrowthproject.com/p/<token> outside the app. | GET /.well-known/apple-app-site-association: paths only /join/*, /invite/*, /billing/update-card (no /p/*); GET /p/abcdefghijklmnop -> 404 JSON "Cannot GET /p/..."; app.json Android filter has /p. Dormant: read-only SELECT 16:20 = 1 package, 0 with share_token, and no mobile code mints one (POST /v1/coach/packages/:id/share-link is never called; CoachPackageEditScreen.tsx:906 hides "Share link" without a token). Also the server's own share_url is `${STOREFRONT_BASE_URL}/join/<token>` (share-link.service.ts:248) while the app builds `/p/<token>` (utils/packageShare.ts:9-13). C (edge, deferred) until share links are switched on; then align the app on the server's share_url. Overlaps EXPLORE-COACH-129. |

## Findings — CODE-ONLY

| # | Grade | User story | Steps | Evidence (file:line, handler, API path) |
|---|---|---|---|---|
| C1 | U (fixed by open m#520) | Double tap on Save in Log weight records two weigh-ins that cannot be deleted. | Progress > Log weight > Save twice fast. | ProgressScreen.tsx:368-391 handleLogWeight, :802-808 Save has no disabled/in-flight guard; POST /weight -> weight.service.ts:16-36 creates a row per call. m#520 head 29d3de2a adds savingWeightRef + disabled (checked). No new job. |
| C2 | U (minor) | Double tap on Add in the new-habit sheet creates the same habit twice. | Habits > Add habit > type name > Add twice fast. | AddHabitSheet.tsx:82-83 disabled only when the name is empty; HabitsScreen.tsx:209-230 createHabit.mutate with no isPending check; POST /habits -> habits.service.ts:16 creates with no duplicate check. The duplicate can be deleted, so small. Fix: pass createHabit.isPending to the sheet and disable Add while saving (about 10 lines). |
| C3 | C (by design) | A push tapped while signed out opens the app on Welcome, not the message. | Signed out, tap a message push. | pushTapRouter.ts:16,40,244 drops taps while signed out on purpose (no replay into the next account). C (edge, deferred to 10k clients). |
| C4 | C | The dunning email's "Update card" link opened while signed out lands on Welcome; after sign-in the lockout screen still offers Update card. | Signed out, tap the card-update link. | RootNavigator.tsx:461-553 replays only reset/accept/join links; UpdateCard lives under MoreTab (RootNavigator.tsx:278-281) which is not mounted signed out. Not a dead end. C (edge, deferred to 10k clients). |

## Checked, no finding (break points tried)
- Client message send: double tap guarded (MessagesScreen.tsx:276 `sending`), offline send keeps a pending bubble persisted in the
  thread cache and "Send again" replays the same client_message_id (MessagesScreen.tsx:346-390).
- Daily check-in save: disabled while pending (HabitsScreen.tsx:421).
- Package purchase: synchronous in-flight guard against double taps and one idempotency key per attempt kept across retries
  (usePackagePurchase.ts:1144-1177, 256-310); POST /v1/checkout/payment-intent dedupes by key (checkout.service.ts:568-600).
  Keys are memory-only, so a kill mid-sheet then a deliberate second purchase is a new attempt (C, edge).
- BrandedCheckoutWebView (FORGOTTEN, no audit today): no screen navigates to it (rg: only ClientNavigator.tsx:589 registers it);
  dead code, not reachable. C.
- Invite email links use /join/<code>, which has a real landing page (invite-codes.service.ts:1365-1367, invite-landing).
- Password reset uses tgp://reset-password (auth.service.ts:1512), so the missing https route is not hit.

## FORGOTTEN (no merged PR touched the screen file today and no report names it)
ShareCardScreen, BloodworkEntryScreen, UpdateCardScreen (dunning), BrandedCheckoutWebViewScreen (unreachable). Only touched by a
report, never by a PR: WidgetsScreen, SupportInboxScreen, CommunitySafetyScreen, Wearables (WearablesShell, MetricDetail,
Connections; DES-AZ not started), RomanConversations/RomanConversation, ClientDailyMealPlan, PlanScreen, Recipes/RecipeDetail,
FastingScreen (CF-FAST-CALM in flight), WorkoutHistoryEdit, ClientWorkoutViewer, AIGuide, CommunityScreen (Wins). Full list with
routes in reports/EXPLORE-CLIENT-129-map.md.

## Proposed fix jobs (file-disjoint, each under 400 lines)
1. SESSION-KEEP-129 (Claude Opus 5.5, T4 auth, mobile, about 80 lines): B1 fix (1) + (2) above. Files: src/services/api.ts,
   src/services/authActions.ts, src/screens/client/SettingsScreen.tsx + ProfileScreen.tsx (confirm copy only), two tests. Check
   open PRs first: m#522 edits ProfileScreen.tsx (copy line can go in a follow-up if it conflicts).
2. WORKOUT-STALE-DURATION-129 (GPT-6.1 Sol, T2, backend, about 30 lines): U1. Clamp instead of refusing: in
   src/workout/workout.dto.ts give `duration_minutes` a `@Transform` that caps at 1440 (keep `@Min(0)`), plus one spec. A backend
   clamp also rescues rows already queued on phones with the current build. Mobile follow-up after m#521 merges (it edits
   ActiveWorkoutScreen.tsx): on Resume of a stale session, base the duration on the session's last update, not on "now".
3. HABIT-ADD-GUARD-129 (GPT-6.1 Sol, T1, about 15 lines): C2.

## Progress log
- 16:21 map started; FORGOTTEN list drafted from today's merged PR file lists and reports/.
- 16:25 B1 proven by two throwaway jest tests (PASS); notify line written.
- 16:31 report rewritten per operator 16:24 (credits short): continuing only on booking, Roman send and the live-workout finish.
- 16:42 booking (inFlight ref + uncertain-outcome path), Roman send (sendingRef), food Log buttons (saving), EditProfile (saving +
  validation) checked: no finding. U1 proven (resume-next-day workout can never be saved); backend throwaway worktree created.

## HANDOFF
- Branches: mobile agent129/explore-client-129 @ a1be6fb2 and backend agent129/explore-client-129-be @ c3324d4a, both local only, no commits; they hold only uncommitted throwaway proof tests that must never be pushed. Nothing pushed, no PRs.
- Done: B1 REPRODUCED (a network failure during session renewal signs the client out, and sign-out deletes unsynced workouts and offline meals). U1 REPRODUCED on the backend, CODE-ONLY on mobile (a workout resumed more than 24 h after starting can never be saved; offline it is dead-lettered silently after "Saved on this phone"). C1 is fixed by m#520. C2, C3, C4 and R2 are minor or C. Map in reports/EXPLORE-CLIENT-129-map.md.
- Needs operator: grade call on B1 (default: B, run SESSION-KEEP-129 on Opus T4) and WORKOUT-STALE-DURATION-129 (Sol T2, backend clamp). Left: FORGOTTEN screens ShareCard, SupportInbox, Widgets, Wearables and Community Safety were not walked; the mobile side of U1 has no render test. Stopped 16:37 on the operator's order. agent 129
