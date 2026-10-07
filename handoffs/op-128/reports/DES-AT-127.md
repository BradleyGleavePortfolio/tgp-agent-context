# DES-AT-127 — purchased content redo (agent 128)

## Scope traced
- Read the complete `_COMMON_128.md`, including the finish-after-READY override; extracted only the last DES-AT-127 job entry; read SoT A1, A2 overrides and A6, design audit (c)/(e), matching doctrine and the existing deliverables tests.
- Worktree: `/home/user/workspace/wt/DES-AT-127-mobile`, branch `agent128/des-at-127`; baseline `9e6e6fc27be1fc2b09316304452e8ed4ea1e9928`.
- Owned implementation: `DeliverablesScreen.tsx`, `deliverables/dropRow.tsx`; `openPurchasedMedia.ts` behavior remains frozen. Tests and only the new screen-specific README row inside the existing Logging and planning table accompany these changes (never appended at the end).
- Existing actions: delivered workout program/plan opens assignment, meal plan opens assignment/date, message opens parent Home/Messages (standalone fallback retained), PDF/video opens signed media, retry and pull-to-refresh reload. Native navigator back remains untouched.

## B list
- B1: An ordinary buyer sees “Unlocks soon” for upcoming content without a date or trigger, falsely promising timing; replace with “Not unlocked yet.”
- B2: An ordinary buyer with no visible rows (or an unavailable endpoint) is told their coach has not added anything, although that is not established by the response; use state-specific neutral copy.
- B3: An ordinary buyer sees “Tap to open” on a delivered row without the reference required to open it; only invite taps when a working viewer exists.

## U list
- U1: Replace filled rounded boxes with theme-aware hairline rows, muted upcoming items, outline open affordance, and readable Inter details under a Cormorant heading.
- U2: The Deliverables route hides the native header and had no visible Back control; add a 44-point, non-animated haptic Back control in the owned screen with top safe-area handling, while retaining platform back gestures.

## C one-liners
- None identified; media grants, routing, sorting and unlock-date behavior are frozen.

## PRs
- [Mobile PR #501](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/501) final main-refresh head `63768bb81fd47c8513b4378a5717263602751492`, 232 changed lines (158 additions + 74 deletions); all four final-head checks green, no merge conflict, Opus/Sol verdicts pending.
- Failing-first targeted test run on baseline with new assertions failed for the unknown timing promise, non-tappable invitation, boxed/undersized styling, unsupported empty/unavailable copy and truncated coach captions; existing baseline parity tests continued exercising the frozen routes.
- Failing-first Back/light/dark checks: 2 failed as expected before adding the screen-owned control (`DES-AT-127-tests-back-before.log`).
- Targeted passing runs: deliverables 46/46; shared-row PurchaseUnpack 35/35; quiet-luxury doctrine 30/30. Logs: `DES-AT-127-tests-deliverables.log`, `DES-AT-127-tests-unpack.log`, `DES-AT-127-tests-doctrine.log`.
- Current delta: 232 lines (158 additions + 74 deletions) across four allowed files; no dependencies, lockfiles, backend, navigator or media module edits.
- Merged `origin/main` at `c00a2a5f4f056148af0158edbf6b71b145dc8bc2` before pushing; README merged without conflict and its complete PR delta is only the Deliverables row. Commit identity verified for author and committer. Post-main targeted deliverables rerun: 46 passed (`DES-AT-127-tests-deliverables-after-main.log`).
- Initial head `2bca69f31aaca9b2a529774c78f1a14697ce521d` passed all four checks, including [typecheck/lint/test](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37689031461/job/113024175915). Before READY, merged the newer `origin/main` `f240af37f38d775ad4b47794e8978c8f31ad8dce`; again no conflicts, author/committer verified, clean worktree, same 232-line delta, 46/46 targeted tests passed (`DES-AT-127-tests-final-main.log`). The additional push is main-refresh-only, not a rerun of the earlier green CI.
- Final head [typecheck/lint/test](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37689914129/job/113027136386), [CodeQL actions](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37689914145/job/113027136890), [CodeQL JavaScript/TypeScript](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37689914145/job/113027137160) and [CodeQL summary](https://github.com/BradleyGleavePortfolio/growth-project-mobile/runs/113027376545) all succeeded; GitHub reports MERGEABLE and the worktree is clean.
- [FIX ROUND 1 (OPENING) READY comment](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/501#issuecomment-6047350619) posted at the exact final head.

## Not fixed (needs operator)
- None identified.

## HANDOFF
- COMPLETE TO READY: [PR #501](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/501) remains open at `63768bb81fd47c8513b4378a5717263602751492`; 232 changed lines, all checks green, no conflicts, [READY posted](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/501#issuecomment-6047350619). Stop immediately under the owner 14:08 override; do not wait for verdicts or start another job.
- Operator next step: independent Opus and Sol audits at this exact head; route any findings/conflict resolution to a fresh FIX lane. No product or owner decision needed. No remote merge, deploy, production write or settings change was performed.
- Saved artifacts: this report, `DES-AT-127-pr-body.md`, `DES-AT-127-ready-comment.md`, targeted test logs and `ops/lanes128/notify/DES-AT-127.txt`. Worktree remains available at `/home/user/workspace/wt/DES-AT-127-mobile`.
