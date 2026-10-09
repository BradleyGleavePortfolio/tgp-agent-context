Follow-up to m#619 (B35 B36 B37). It fixes the two U findings from the m#619 lenses: **U1** from LN-OPUS-A-134 and **U-619-SOL-A2-1** from LN-SOL-A2-134. Job START-HANG-FOLLOW-134. agent 134

## What changes
1. **`src/hooks/useBiometricGate.ts` (U1).** The hook now remembers the opt-in from its last read (`lastKnownOptIn`, in module scope next to `lastForegroundedAt`; reset by `__resetForTests`; updated by `setBiometricOptIn`). When an opted-in person returns from the background after more than 5 minutes, the gate moves to 'checking' **at once**, which shows the plain bone cover, before the SecureStore read answers. So the app is never visible unlocked while that read is pending, even when Keystore is slow (up to the 2 s limit). People who have not opted in are unchanged: they never go to 'checking', so the app is not unmounted. Cold start is unchanged (the gate starts in 'checking').
2. **`src/services/PersistedQueryCacheGate.tsx` (U-619-SOL-A2-1).** If the bounded logged-out purge does not finish, it now logs `logger.warn('PersistedQueryCacheGate', 'logged-out cache purge did not finish', err)` instead of an empty catch. The fallback is still non-fatal: the logged-out state still commits.

## WHY / WHEN / WHO (from the code)
Both issues came from m#619 (commit d748aaf6, START-HANG-134, agent 134):
- m#619 moved the opt-in read ahead of 'checking' so that people who had not opted in were never unmounted. As a side effect, someone who had opted in saw the app content until the read answered.
- m#619 also wrapped the purge in `withStartupTimeout(...).catch(() => undefined)`.

## Parity
| Prototype screen | Today's file | What matches | What differs and why |
|---|---|---|---|
| (no screen: biometric cover) | src/components/BiometricUnlockGate.tsx 'checking' (unchanged file) | The same plain bone cover as m#619, nothing printed | It now appears at once on a return from the background for opted-in people, instead of after the storage read |

**Not seen on a device.** No Android or iOS run.

## Tests (seen in a test, run locally through heavy.sh, one file at a time)
- `src/hooks/__tests__/useBiometricGate.test.ts` (+1): opted in and unlocked, then background, then return after more than 5 minutes with a read that has not answered yet. The status is already 'checking'. After the read answers, the prompt runs and the gate unlocks. With the fix removed, this test fails.
- `src/services/__tests__/persistedQueryCache.identityGate.test.tsx` (+1): `getAllKeys` never answers. Nothing commits and nothing is logged before 4 s. At 4 s the warning is logged and the logged-out children render. With the empty catch restored, this test fails.
- `startupStates.test.tsx` still passes. eslint on the changed files: 0 errors. tsc: clean.

4 files, +55 / -1, tests included. Main merged in, no conflicts.

agent 134
