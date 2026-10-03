# B-MOB-B (agent 115) — mobile #305 -> #317 -> #325 -> #335

State at 18:27 UTC (11:27 PDT, from `date`). Repo: BradleyGleavePortfolio/growth-project-mobile. Mobile main = 367e6c4 (#305 merged).
Evidence: /home/user/workspace/ops/bmobb115/ (PR bodies, comment drafts, local and CI logs).
Stopped under PAUSE (owner 11:25 PDT). No PR was mid-change. All ci/B-MOB-B-* branches are deleted, every node_modules symlink is
unlinked, and every B-MOB-B worktree is removed.

## Status by PR

| PR | Exact head | Verdicts | Checks | State | Next step (owner) |
|---|---|---|---|---|---|
| #305 expo-updates | 178f640155b464905e07bb0ea53f5688ba90afce | Opus APPROVE, Sol APPROVE 0/0/0 | 3/3 | MERGED (main 367e6c4) | none |
| #317 wearables | d0407b625e1d2bc63ebe9d063296bc85461842ed (operator update-branch, merge-only; my last head 82137c31 was dual APPROVE) | Opus APPROVE (merge-only); Sol pending at d0407b62 | 2 pass, 1 pending | OPEN, BLOCKED until Sol + checks | Sol merge-only verdict and green checks, then merge (operator) |
| #325 S-SCHED (draft) | 7566d38f4eb15a5f6bd8c3491bf17dbc6a8931e8 | Opus APPROVE 0/0/1 (C-325-8 optional), Sol APPROVE 0/0/0 | 3/3 | OPEN, draft, DIRTY: `app.json` conflict with main 367e6c4 (#305's expo-updates hunk next to #325's) | Merge main and keep both `app.json` hunks (OR-115-5: second to merge keeps both), merge-only FIX ROUND, lens merge-only check. Undraft and merge only after backend #634 merges AND deploys (OR-112-13) |
| #335 S-REACH | 641fe8914853cca6a2dab76ac90230bbcd525504 | Opus APPROVE 0/0/1 (C-335-4 optional), Sol APPROVE 0/0/0 | 3/3 | OPEN, BEHIND main | update-branch (merge-only), then merge (operator). Optional C-335-4: change the `none` copy so it also holds for the uniform no-access 404 |

## Work done
### #305 FIX ROUND 6 (https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/305#issuecomment-5971999657)
- B-305-12 / B-305-11 closed: removed the SDK `ExpoContext` integration; the app sets its own bounded `ota_updates` context, which
  also reaches native through `setContext`; `otaUpdateShape.ts` allowlists; `scrubEvent` keeps only closed OTA shapes; the canary
  runs on the real global with the real SDK. C-305-13 closed (JSDoc). OR-115-5 docs line fixed.
- Before: ci-lane run 37141910832 failed (11 tests failed; the SDK put a synthetic PII `emergency_launch_reason` into native
  `setContext`). After: CI 37142191032 and CodeQL 37142191056 green.

### #317 FIX ROUND 5 + 6 (…#issuecomment-5971833355, …#issuecomment-5972003820)
- B-317-11 closed: an attempt-epoch and auth-generation fence on import, resume and continue, plus per-attempt busy state.
  Also closed: C-317-a (late refresh fenced), C-317-b r2 (closed error class, nothing logged when stale), C-317-c and C-317-d.
- Before: runs 37141124980 (17 failed) and 37142129659 (4 failed). After: CI 37142172757 and CodeQL 37142172742 green at 82137c31.

### #335 FIX ROUND 1 (…/pull/335#issuecomment-5972010855); tier T3 -> T4
- A-335-1: `ph-no-capture` across every state of the screen and the Summary card. Tested with the installed PostHog
  `autocaptureFromTouchEvent` over every host element; session replay is off. B-335-2: every readiness question is shown, yes
  answers first. C-335-3: an invalid 2xx keeps its header or outbound request id, never one from the body, and the support
  subject carries the reference.
- Before: ci-lane run 37141927000 (11 failed). After: CI 37142228555 and CodeQL 37142228553 green.

### #325
- No code change from this lane. It was dual APPROVE at 7566d38f. Its merge was held because #634 was not deployed, and it is
  DIRTY now that #305 has merged.

## Operator decisions needed
- #325: who runs the `app.json` keep-both merge, and when (it is gated on #634 deploying).
- #335: whether to take the optional C-335-4 copy change before merge.
- OR-113-13 default stays: CoachEarnings needs #332 before release; otherwise hide the Settings row (#332 is OPEN with Opus RC).

## HANDOFF
- Every PR in this lane's scope reached dual APPROVE at a green head. #305 is merged. #317 waits on Sol's merge-only verdict at
  the operator's d0407b62. #335 needs update-branch and merge. #325 needs the `app.json` keep-both merge, then waits for #634.
- No ci/B-MOB-B-* branches, worktrees or node_modules links remain. No production, Expo or EAS action was taken. No lockfile or
  package.json was edited.
