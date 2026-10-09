Bugs: **B35** (logo, then "Locked", then an endless spinner; the app never opens), **B36** ("Locked" flashes every time), **B37** (no calm "try again" screen). Prototype screen **44 (ST-ERROR)**. Job START-HANG-134 (the START-HANG-132 brief, never started before). agent 134

## What changes
1. **One startup time limit** (`src/lib/startupTimebox.ts`, 8 s per check). Every check `bootstrapAuth` waits on goes through it, and each one falls back the way its path already does on a failure:
   - stored session + cached account + role flag (one box): no answer shows the calm startup error (new `startup_error` state). This is not a sign-out, and the session is left as it is.
   - `GET /coach/onboarding`, `POST /coach/onboarding/start`: no answer opens the coach dashboard (same as a network error).
   - `GET /me/first-win/status`, the day-1 skip marker, the lean marker: no answer skips the win screen and opens the app.
   - package-prompt dismissal + entitlement: no answer means no prompt.
   - `onboarding_complete` write-back: no longer fatal (before this PR, a throw there signed the person out of the UI).
2. **A calm startup error screen** (`src/components/StartupErrorScreen.tsx`, prototype 44). It uses the shared Screen + Headline + PrimaryButton, Roman's portrait, one forest "Try again", no red and no haptic. **StartupPending** replaces both bare spinners (RootNavigator `loading` and the persisted-cache `renderRestoring`). It never shows for more than 15 s: after that it turns into the error screen. If startup finishes in the meantime, the app opens by itself.
3. **Biometric gate** (B36): while it checks, it shows only the plain splash background, with no "Locked" and no spinner. The opt-in read and the hardware/enrolment checks have a 2 s limit. If they don't answer, the app opens. `evaluate()` now reads the opt-in **before** it shows 'checking'. Before, every return from the background after 5 minutes went to 'checking', which unmounted the whole app even with Face ID off. "Locked" now shows only to someone who opted in and whose unlock did not succeed. The Unlock button uses `radius.button` (it was the legacy `Radius.md`).
4. **Re-entrancy guard**: the latest bootstrap wins. A run that a newer one overtakes (an auth event during a cold start, or Try again) commits nothing. Token refresh emits no auth event, so refresh cannot cause a loop.
5. **Persisted query cache gate**: the logged-out purge has a 4 s limit. Like a failed purge (already non-fatal), the logged-out state still commits.
6. **src/services/api.ts: part of the cause is here.** A 401 waits on the shared session renewal. supabase-js renews over `fetch`, and on React Native `fetch` has no time limit. On a stalled connection the renewal can stay pending forever, and every 401'd request waits with it, including the request made at startup. A waiter now gives up after 15 s and fails as a request with no answer: the session is kept and nobody is signed out. The renewal itself keeps running and stores its tokens if it lands later, so a rotated refresh token is never lost.

## WHY / WHEN / WHO (from the code; not reproduced on a device)
- **B36**: `BiometricUnlockGate` rendered "Locked / Verifying…" for `status === 'checking'` on every cold start, and `useBiometricGate.evaluate()` set 'checking' before reading the opt-in. Introduced in 1c7bd638 (m#73, Apple Sign-In + biometric unlock).
- **B35/B37**: `bootstrapAuth` awaited each startup check in sequence with no limit of its own, and the spinner had no ceiling. Network reads were bounded only by axios's 30 s. A 401 waited on `refreshPromise`, whose Supabase `fetch` has no bound (refresh queue since 18ef039e m#4, later rewrites). Local SecureStore/AsyncStorage reads had no bound either, and neither did the logged-out purge of the persisted cache gate (bc7b4e96, merged in 716a606e).
- **Why coachless**: B-REV-1 (c39d1fe1, m#395) marked coachless clients for the standard path. So every start of theirs reads `GET /me/first-win/status` (8eaec1bd, m#110), the only network wait on a finished client's start. Clients who finished the consultation skip it. If the app is reopened more than about an hour later, the access token has expired, so that read goes through the unbounded renewal. Result: logo (AppSplash), then "Locked" (gate checking, under 0.1 s), then RootNavigator's `loading` spinner forever, which matches the owner's S9.

## Parity (prototype 44 ST-ERROR)
| Prototype screen | Today's file | What matches | What differs and why |
|---|---|---|---|
| 44 ST-ERROR | src/components/StartupErrorScreen.tsx | Roman portrait (40 pt), serif line "I couldn't reach the server. Your answers are safe.", vertically centred, one full-width forest "Try again" pinned above the gesture bar, no red, no error haptic | No back chevron (nothing to go back to at app start). Button corners use `radius.button` 12 (owner 17:07, rounded), not the prototype's square. A second line for a phone-storage stall: "I couldn't open your account on this phone. Nothing is lost." (the server line would be untrue there) |
| (no screen: native splash hand-off) | src/components/BiometricUnlockGate.tsx `checking` | Plain bone background, same as the splash, nothing printed | n/a |
| (no screen: loading) | StartupPending in RootNavigator `loading` + cache-gate restoring | Spinner on bone, as before | Turns into 44 after 15 s instead of spinning forever |

**Not seen on a device.** No Android or iOS run. Evidence comes from jest renders only. Run locally through heavy.sh, one file at a time (seen in a test): the 5 test files below, plus the existing persistedQueryCache.identityGate, rootNavigatorPersistedCacheGate, rootNavigatorPackagePromptGate, api.refresh, rootNavigatorConsultationColdBoot and consultationTemplates. eslint on the changed files: 0 errors. tsc: clean after m#617. With the latest-run guard disabled, the "latest bootstrap wins" test fails, so the test does catch the regression.

## Tests (each path, including promises that never settle)
- `src/lib/__tests__/startupTimebox.test.ts`: answer and failure pass through; a never-settling promise rejects at 8 s and not before; a late failure is absorbed; latest-run guard.
- `src/__tests__/rootNavigatorStartupHang.test.tsx`: real RootNavigator. A first-win read that never settles: the client app opens. A coach setup read that never settles: the coach dashboard opens. A stored-session read that never settles: the calm error with device copy, the token untouched, then Try again opens the app. Latest bootstrap wins: a slow first run's late "not completed" does not show the Day 1 Win.
- `src/components/__tests__/startupStates.test.tsx`: the 44 screen (one button, copy, no "!"); StartupPending turns into the error at the ceiling and Try again restarts the wait; the gate while checking shows no "Locked"/"Verifying"; locked shows "Locked" + one Unlock.
- `src/hooks/__tests__/useBiometricGate.test.ts`: an opt-in read that never answers unlocks at 2 s; not opted in, a re-check never goes to 'checking'.
- `src/services/__tests__/api.refreshNoSignal.test.ts`: a renewal that never answers fails the request as "no connection" at 15 s, with no sign-out and no replay.

Files: RootNavigator.tsx, BiometricUnlockGate.tsx, useBiometricGate.ts, PersistedQueryCacheGate.tsx (owned by this job per JOBS134), new startupTimebox.ts + StartupErrorScreen.tsx, and api.ts (cause, see 6). Main merged in (m#580, m#617 and later), no conflicts. About 787 changed lines, tests included.

agent 134
