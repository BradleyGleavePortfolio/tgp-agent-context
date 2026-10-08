# SESSION-KEEP-130: Keep sign-in on weak signal (agent 130)

Status: READY posted 19:11 PDT on growth-project-mobile#543 @ d0285e7d (CI green). Builder finished. Updated 19:11 PDT.

## Scope traced

- `src/services/api.ts`: the 401 interceptor's single-flight `refreshPromise`, which runs `performRefresh` and then `handleRefreshFailure`. On main, every refresh failure except `AccountChangedError` called `handleRefreshFailure`, which signs out (fenced) and wipes everything. supabase-js returns `AuthRetryableFetchError` (status 0 for no signal or a timeout, 502-530 for a gateway) or `AuthApiError` 429/5xx when the sign-in service gave no answer.
- `src/services/authActions.ts` `signOutWhileHealthRetires`: sweeps `pending_food_logs_*` and `active_workout_session:*` and calls `deleteWorkoutLogsForUser`. Nothing was sent first and no confirm said what would be lost.
- Food queue `flush()` (`foodLogQueue.ts`) and workout `pushQueuedWorkouts()` (`sync-engine.ts`). Both classify an error with no `response` as transient (row kept). Food-queue write-backs are fenced on the owner, and `clearUserCache()` clears the owner synchronously before the keys are removed, so an abandoned send cannot write a queue back after the wipe.
- Client `SettingsScreen.tsx` and `ProfileScreen.tsx` `handleSignOut` (confirm only). Other sign-out callers (RootNavigator, wearables, consultation onboarding, Delete account, coach Settings) go through the same `signOut()`.

## B list

- B1, seen in a test: a session renewal with no signal signed the client out and deleted the unsynced workouts and offline foods. Fixed in m#543 (`api.ts`; `api.refreshNoSignal.test.ts` 5 failing first on main 1c733656).
- B2, seen in a test: Sign out deleted queued foods and workouts with no try to send and no warning. Fixed in m#543 (`authActions.ts` `sendUnsyncedLogs` / `prepareSignOutConfirm`, Settings and Profile confirm; `authActions.signOutUnsynced.test.ts` 5 failing first).

## U list

- U1, from the code: the sign-out after a refused renewal (`api.ts` `handleRefreshFailure` -> `signOut(undefined, { sessionFence })`) still removes waiting rows without asking. That session can no longer send them. Not changed.
- U2, from the code: with rows waiting and a weak signal, the confirm takes up to 4 s to appear and there is no pending indicator (`SettingsScreen.tsx` / `ProfileScreen.tsx` `handleSignOut`). A second tap opens no second confirm (fixed in m#543).

## C one-liners

- C1: the Settings confirm title is still "Sign Out" (title case), while Profile uses "Sign out". m#537 (SETTINGS-FIN-130) changes it; this PR leaves the wording alone.
- C2: two expected console warnings in the new test ("flush stopped on transient error") document the kept row.

## PRs

| PR | head | lines | CI | verdicts |
| --- | --- | ---: | --- | --- |
| growth-project-mobile#543 | d0285e7d7c4874c167fedab286ce3d455ff2c7e9 | 561 (170 src, 379 tests, 12 docs) | green (Typecheck, lint, test; CodeQL) | none yet; READY posted 19:11 PDT ([comment](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/543#issuecomment-6050750937)) |

Branch `agent130/session-keep-130`, worktree `/home/user/workspace/wt/SESSION-KEEP-130-mobile`. Merged main 1c733656 (clean). Body: `/home/user/workspace/ops/scratch-SESSION-KEEP-130/pr-body.md`.

## Not fixed / Proposed (needs operator)

1. U1, keeping rows across a forced sign-out. File: `src/services/authActions.ts` `signOutWhileHealthRetires` (the `opts.sessionFence` path). Smallest fix: on a refused-renewal sign-out, keep `pending_food_logs_<id>` and the unsynced workout rows for that account, and send them after the same account signs in again. The risk is privacy on a shared phone. Default: no change.
2. U2, a pending state on the Sign out row while the one send runs (at most 4 s, only when rows are waiting). Files: `src/screens/client/SettingsScreen.tsx` and `ProfileScreen.tsx` `handleSignOut`. Default: none.
3. Overlap with m#537 (SETTINGS-FIN-130, READY, not merged at 19:00): it changes the same Settings Alert line and the `SettingsScreen.checkInTime.test.tsx` sign-out press line. Resolution: keep m#537's "Sign out" wording plus this PR's `message` variable and `null` guard. Default: whichever merges second merges `origin/main` and resolves.

## HANDOFF

- State: growth-project-mobile#543 is open at d0285e7d7c4874c167fedab286ce3d455ff2c7e9. CI is green, it was mergeable at 19:11 PDT, and READY was posted at 19:11 PDT. No verdicts yet; the builder does not wait for them.
- Branch `agent130/session-keep-130`, worktree `/home/user/workspace/wt/SESSION-KEEP-130-mobile`. Commits: c8231cd8 (fix), c1f78544 (merge main 1c733656), d0285e7d (double-tap guard). All carry the Bradley Gleave identity.
- Code map: `src/services/api.ts`: `isNoAnswerRefreshFailure`, `RefreshNoAnswerError` and `asNoAnswer`, used in the refresh `catch` and in the waiter's `catch` of the 401 interceptor. `src/services/authActions.ts`: `sendUnsyncedLogs`, `unsyncedLogsMessage` and `prepareSignOutConfirm`, plus the call in `signOutWhileHealthRetires`, which is skipped when `opts.sessionFence` is set. Screens: `handleSignOut` in `src/screens/client/SettingsScreen.tsx` and `ProfileScreen.tsx`.
- Tests: `src/services/__tests__/api.refreshNoSignal.test.ts` and `authActions.signOutUnsynced.test.ts` (new). Mock and await updates: `ProfileScreen.savedValues`, `SettingsScreen.checkInTime`, `SettingsScreen.parity`, `quietLuxuryDoctrine`. Run with `/home/user/workspace/ops/heavy.sh npx jest <file>`, one file at a time.
- Next for a fix lane: on REQUEST CHANGES, fix only its Bs at this branch, push once, wait for green CI, and post `FIX ROUND 2 (SESSION-KEEP-130, agent 130, <ID>) — growth-project-mobile#543 @ <sha> — READY FOR AUDIT`. If m#537 merges first, `git merge origin/main`. Resolve the Settings Alert line as `Alert.alert('Sign out', message, [` and keep the `null` guard above it. In `SettingsScreen.checkInTime.test.tsx`, press `'Sign out'` and wait for `toHaveBeenLastCalledWith('Sign out', 'Are you sure you want to sign out?', expect.any(Array))`. Then rerun the Settings tests and post a new READY.
- PR body: `/home/user/workspace/ops/scratch-SESSION-KEEP-130/pr-body.md`. READY text: `ready-comment.md` in the same folder.
