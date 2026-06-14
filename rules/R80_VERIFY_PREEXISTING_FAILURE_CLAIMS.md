# R80 — Always verify "pre-existing failure" claims

**Codified:** 2026-06-14 (operator + agent, post-L8 review)
**Trigger event:** L8 v3-3 voice notes subagent reported `firstPaymentGate.test.ts` failures as "pre-existing on base commit `ce14bbe768`, untouched by this branch — not L8's responsibility." This was **wrong on two counts:**

1. The failure was **introduced by L7 #242** (just merged into that base commit) — so it WAS L8's responsibility to fix as part of being a good citizen on the freshly-poisoned main, because L8's PR is the first thing trying to land on top of it.
2. The fix is a **one-line import change** (`require` → default ESM import), not a deep harness investigation. Easy to verify, easy to fix.

The agent's pattern was: see a failure, see a test file not in own diff, conclude "not mine." That pattern violates the hyperscaler quality bar — main being red is everyone's emergency until it isn't red.

## Rule

When a CI failure surfaces on a lane PR:

1. **First** assume it's the lane's fault (probability heavily weighted there because lanes usually break things).
2. If the test file isn't in the lane's diff, run the SAME test on the lane's base commit in a clean worktree to verify the pre-existing claim.
3. If pre-existing is confirmed on base:
   - **Fix it in this lane anyway** if the fix is small (under ~20 LOC). Main is red — clear it.
   - If the fix is non-trivial, file a separate handoff (`MAIN_REGRESSION_<date>.md`) flagging the regression to operator and document the pre-existing scope in the lane PR body so operator can decide whether to land the lane on red main or block.
   - **Never** ship a lane PR that papers over a base-commit failure with "not mine."
4. Telemetry: when CI fails, the report MUST distinguish (a) lane-introduced failure, (b) base-commit regression, (c) flake. Reports labeling everything as (c) without empirical evidence are rejected.

## R74 corollary

The fix commit MUST be authored by Bradley Gleave per inline `-c` flags — even when it's "not your code."

## Reference

- L8 mobile #249 `firstPaymentGate.test.ts` 5 failures + `useVoiceUpload.test.tsx` 1 failure, both fixed in `b25acf4` on `feature/community-v3-voice-notes`.
- Root cause of `firstPaymentGate`: CommonJS `require('@react-native-async-storage/async-storage')` bypasses the default-export jest mock applied by `jest.setup.js`. Use `import AsyncStorage from '@react-native-async-storage/async-storage'` like every other test in the repo.
- Root cause of `useVoiceUpload`: under RNTL v14 + TanStack Query v5, post-`mutateAsync` `result.current.data` lands on the NEXT microtask flush. Wrap the assertion in `waitFor`.
