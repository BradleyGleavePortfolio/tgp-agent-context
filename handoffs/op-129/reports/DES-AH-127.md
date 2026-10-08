# DES-AH-127 — exercise library and detail

## Scope traced
- Read common 128 fully, the final DES-AH-127 entry, SoT A1/A2 owner overrides/A6, design audit (c)/(d)A/(d)0/(d)1/(e), catalog and named guide sections.
- Own worktree: `/home/user/workspace/wt/DES-AH-127-mobile`; branch `agent128/des-ah-127`; base `e252ef4e`.
- Exact owned source files: `ExerciseLibraryScreen.tsx`, `ExerciseDetailScreen.tsx`, plus their tests. Operator 13:51 mail authorizes own entries in the corresponding shared README; added two exercise entries alphabetically in Logging and planning. No navigator, backend, dependency, or production changes.
- Library actions: submit search; toggle all category/muscle/equipment facets; horizontal filter scrolling; open exercise detail with id; infinite pagination; retry.
- Detail actions: retry detail; native video playback/fullscreen/PiP; GIF fallback. No add-to-routine/workout action or history endpoint exists in these screens.
- Design: theme-backed bone, hairline search/rows, text filters with selected underline, serif headline, readable Inter metadata, MUSCLES/EQUIPMENT/HOW TO overlines. Preserve actual demonstrations; do not invent media or history.

## B list
- B1: A client whose demonstration fails on an exercise with no instructions is told to follow instructions below, but none exist. Make failure copy conditional on actual instructions.

## U list
- U1: Media absence says “not yet available”, implying future availability without evidence. Use neutral present-state copy.
- U2: Search/filter/retry surfaces use boxes, filled chips or undersized retry targets; replace with hairlines, selected underlines and 44-point targets.
- U3: Library metadata omits equipment. Add actual equipment while preserving muscle/category/difficulty.

## C one-liners
- None pursued.

## PRs
- [Mobile PR #495](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/495): current pushed head `593005f123dee9039febf9ca7b360e27806a845c`, 225 additions + 63 deletions = 288 changed lines.
- Origin/main merged cleanly after opening (required by operator); own parity rerun passed 8/8 at merge-only head. At 14:13 PDT all four checks are SUCCESS at exact head, GitHub mergeable=true / clean. [PR #495](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/495)
- Failing-first proof recorded in `DES-AH-127-failing-first.log`: actual equipment absent, untruthful no-instructions failure and future-availability copy fail on unchanged source; pagination assertion needed a testID because installed RNTL lacks UNSAFE_getByType.
- Local pass evidence, one file per heavy.sh run: redo 8, contrast 3, existing catalog 11, doctrine 30, copy guard 8 (60 tests total). Logs: `DES-AH-127-{redo,contrast,catalog,doctrine,copy}-test.log`.
- PR body: `DES-AH-127-pr-body.md`, with all actions, truthful sweep, documentation, design decisions and test evidence.
- [FIX ROUND 1 opening](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/495#issuecomment-6046977361) posted 14:14 PDT at exact green head. Both lens verdicts pending; owner 14:08 override says finish after READY and handoff, do not wait for verdicts.

## Not fixed (needs operator)
- None currently; operator's 13:51 mail resolved README scope.

## HANDOFF
- READY / builder complete: [PR #495](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/495) at `593005f123dee9039febf9ca7b360e27806a845c`, 288 lines, all CI/CodeQL checks green, GitHub clean/no conflict, opening comment posted.
- Both independent exact-head lens verdicts are pending; standing FIX lane owns any subsequent findings or conflicts. Operator merges only after both approvals. No merge or deploy performed.
- Worktree: `/home/user/workspace/wt/DES-AH-127-mobile`; branch `agent128/des-ah-127`, clean after push.
- B=1 U=3 fixed. No operator/owner decision or unbuilt in-scope fix remains.
- DES-AX-127 withdrawn; no entry read, worktree created or commits pushed for it.
- Evidence: PR body/opening comment and five test logs plus failing-first proof in `/home/user/workspace/ops/reports/DES-AH-127-*`.
