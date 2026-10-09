# START-HANG-134 — B35 B36 B37 (app never opens) — agent 134
Status (20:20 PDT): PR m#619 open @ 056e757b82f3cf0a4046ec614238672261d31cda (main merged in, incl. m#580). Waiting for CI, then READY.
Worktree /home/user/workspace/wt/START-HANG-134-mobile, branch agent134/start-hang-134. PR body: ops/reports/START-HANG-134-pr-body.md.
deps/mobile never became READY, so no local test run; relying on PR CI.

## Cause (from the code; not reproduced on a device)
- B36: BiometricUnlockGate printed "Locked / Verifying…" while checking (1c7bd638, m#73). evaluate() went to 'checking' before reading the opt-in, so the app unmounted on every foreground after 5 min even with Face ID off.
- B35/B37: bootstrapAuth awaited startup checks with no limit and no spinner ceiling. A 401 waits on the shared token renewal, and supabase-js fetch has no timeout on RN, so a stalled renewal leaves the spinner forever. Coachless clients have the B-REV-1 standard-path marker (c39d1fe1, m#395), so every start reads GET /me/first-win/status, their only network wait. If the token has expired, that read goes through the renewal.

## Fix (787 changed lines incl. tests)
startupTimebox.ts (8 s per check, latest-run guard). StartupErrorScreen.tsx (prototype 44 + a 15 s ceiling on the loading view). Gate: plain background while checking, 2 s limits. Cache-gate purge: 4 s limit. api.ts: a 401 stops waiting on the renewal after 15 s (fails as no answer, the renewal is not abandoned).

## 20:40 PDT
- First CI run on 056e757b: typecheck failed on startupStates.test.tsx (testing-library 14 has async render) and on main's TS1117 (P14). Fixed in local commit 2fe60ff5, not pushed yet; waiting for m#617 so one push gives green CI.
- deps were linked at 20:30. Passing locally via heavy.sh (seen in a test): startupTimebox, startupStates, rootNavigatorStartupHang, useBiometricGate, api.refreshNoSignal, plus the existing persistedQueryCache.identityGate, rootNavigatorPersistedCacheGate, rootNavigatorPackagePromptGate, api.refresh, rootNavigatorConsultationColdBoot, consultationTemplates. eslint on changed files: 0 errors. tsc: only main's TS1117.
- Guard check: with the latest-run guard disabled, the "latest bootstrap wins" test fails (seen in a test).

## 21:05 PDT
- m#617 merged, then `git merge origin/main`, one push: head 970db07f0b99e306ac700f2a70c6dd6d662921cf. CI green (Typecheck, lint, test; CodeQL). Mergeable.
- READY posted on m#619 (FIX ROUND 1 (OPENING)). Now waiting for verdicts (slice A: LN-OPUS-A-134 / LN-SOL-A-134), polling every 180 s, fixing any B.

## Verdicts (21:20 PDT)
- LN-OPUS-A-134: APPROVE @ 970db07f. B none. U1: useBiometricGate.ts:107-116 reads the opt-in before 'checking', so for an opted-in person coming back after more than 5 min, app content shows until SecureStore answers (normally a few frames, at most 2 s).
- LN-SOL-A2-134: APPROVE @ 970db07f. B none. U-619-SOL-A2-1: PersistedQueryCacheGate.tsx:128 has an empty catch on the boxed purge; it should log a specific warning.
- Board: DUAL APPROVED, operator merge. No push after the approvals (a push would reset them).

## HANDOFF
- PR: growth-project-mobile#619 @ 970db07f0b99e306ac700f2a70c6dd6d662921cf. CI green, mergeable, dual approved, not merged (operator merges).
- Bugs: B35 B36 B37, prototype 44. 784 changed lines incl. tests. api.ts edited because part of the cause is there (the renewal wait had no bound).
- Evidence: cause from the code; tests seen in a test (local heavy.sh runs + CI); not seen on a device.
- Proposed (needs operator): one small follow-up PR for both Us. (1) For opted-in users only, show 'checking' before reading the opt-in on a foreground recheck (cold start unchanged). (2) Replace the empty catch with logger.warn('PersistedQueryCacheGate', 'logged-out purge did not finish', err). Default: a follow-up after the merge, about 20 lines.
- C items (deferred to 10k clients): an opted-in person whose Keystore read takes more than 2 s gets in without biometrics (the brief's fallback); the overdue pending view uses the 'server' line for every start; a Day 1 Win setAuthStateNow can be overwritten by a later auth-event bootstrap.
- Worktree clean at 970db07f; nothing left uncommitted.

## START-HANG-FOLLOW-134 (operator YES 21:08)
- m#619 merged at 04:06Z (83bc334b). Follow-up m#628 @ 2fbdcacdd0370a5c28648afe9536c64fd664cc74, 4 files +55/-1: lastKnownOptIn covers opted-in users at once on return from the background (U1), and the purge timeout now does logger.warn instead of an empty catch (U-619-SOL-A2-1).
- Seen in a test: both new tests pass and both fail with their fix removed. useBiometricGate 8/8, identityGate 20/20, startupStates 5/5. eslint: 0 errors. tsc: clean. Waiting for CI, then READY.
- m#628 CI green; READY posted. LN-OPUS-E-134 APPROVE (B none, U none) and LN-SOL-E-134 APPROVE (B=0 U=0) @ 2fbdcacd. Merged by the merge loop at 04:26:55Z (8181e267).

## HANDOFF (final)
- Merged: growth-project-mobile#619 (B35 B36 B37, prototype 44; merge 83bc334b) and #628 (follow-up for both Us on #619; merge 8181e267). Both dual approved with no B.
- Open: none. Worktrees clean. Cause is from the code; tests seen in a test (locally and in CI); nothing seen on a device.
- C items deferred to 10k clients, from the lenses:
  - An opted-in person whose Keystore read takes more than 2 s gets in without biometrics (brief's fallback).
  - The overdue loading view uses the 'server' line for every start.
  - A Day 1 Win setAuthStateNow can be overwritten by a later auth-event bootstrap.
  - The iOS app-switcher snapshot is taken before any cover (pre-existing).
- Needs operator: nothing. A device check on Android and iOS of a cold start with a stalled network is still worth doing before build 8.
