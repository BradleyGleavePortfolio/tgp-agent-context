# DES-K-128 — Home layout redo

## Scope traced
- Read the common brief, assigned DES-K-128 entry, its DES-K-127 base entry, SoT A1/A2 owner overrides/A6, Home and header on the read-only main and the DES-T branch.
- Layout only: date overline, DES-T truthful serif headline, one forest primary action, one hairline metric row, existing Home sections/actions retained, feature-gated 32 pt Roman header avatar.
- Dependency: [mobile#469](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/469) merged at 13:27:51 PDT on 2026-10-07; verified at 13:28:04 PDT. Created the assigned branch from new main `a8a4883ff680936e593fb09daeb922053492a27f`.
- Read both assigned target images, plan rubric, doctrine and design audit acceptance/picks.

## B list
- None identified in this layout-only scope.

## U list
- Implemented: date overline, DES-T verified serif headline, forest action in both Train/Log variants and one hairline metric row with all current values/targets/Log prompts retained.
- Implemented: 32 pt neutral Roman avatar in a 44 pt target, gated by chat flag, routing through the existing More stack; message/bell badges and actions remain.

## C one-liners
- None.

## PRs
- [mobile#492](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/492) current exact head `a0b1d97ae9484db6f1eb9c8fbcb86888be5b4799`: 139 additions + 83 deletions = **222 changed lines**, 7 files. No PR merge, deployment or production changes.
- Failing-first baseline validation in own worktree: header test 1 failed/8 passed (missing Roman avatar); Home test 2 failed/11 passed (missing hairline row) with source temporarily restored to HEAD via the saved reversible patch.
- Green after implementation: Header 9/9; Home truthful/parity/layout 13/13; macro mode 5/5; today targets 3/3; Home card copy 8/8; doctrine 10/10; copyVoice guard 8/8. Ran one file at a time through heavy.sh (56 tests).
- At 13:47:15 PDT: CI queued; CodeQL Actions succeeded, JS/TS queued; GitHub aggregate CodeQL neutral. No readiness comment yet.
- Initial head `525b4424` reached all-green CI. Operator's 13:51 README instruction then required updating the existing navigation paragraph in place and merging current main before readiness: docs commit `3f029c69`, conflict-free main refresh `a0b1d97a` (main `8e649d058bf5bb789a995799400bbce6ada83048`). Re-ran Header 9/9, Home 13/13 and updated doctrine 30/30; final targeted file counts total 76 tests. New head pushed at 13:56:54 PDT; await its CI, not stale initial-head success.
- At 14:04:24 PDT current head is MERGEABLE; CI queued, CodeQL Actions green and JS/TS running; no audits yet.
- **READY at 14:12:41 PDT:** [opening readiness comment](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/492#issuecomment-6046956183) names exact head `a0b1d97ae9484db6f1eb9c8fbcb86888be5b4799`; all CI/CodeQL checks green and MERGEABLE verified at 14:12:23 PDT. Both lens verdicts pending at this head. Worktree clean.
- Fetched current main at 13:42:18 PDT: incoming changes only touch Roman consent/settings files, no overlap with this PR.

## Not fixed (needs operator)
- Scope mismatch identified: Home owns the profile nudge and number row, but the remaining card chrome is encapsulated in separate components outside the entry's two assigned source files (e.g. `src/components/home/PushPermissionCard.tsx:86`, `src/components/home/CoachIntroductionBanner.tsx:160`, `src/components/home/HolisticInsightsTile.tsx:141`, `src/entitlements/dunning/DunningBanner.tsx:108`). These stay rendered with unchanged actions/order; this PR cannot honestly claim those internal boxes were removed. Recommended default: operator routes a small style-only follow-up with optional Home-section presentation props, keeping consent/payment logic untouched.
- Shared mobile dependencies became READY and were linked at 13:30:31 PDT; targeted regression validation next.

## HANDOFF
- Builder finished under the owner 14:08 override: no verdict waiting and no second job. The DES-BC-127 assignment was withdrawn before any work on it.
- [mobile#492](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/492), `agent128/des-k-128`, exact head **`a0b1d97ae9484db6f1eb9c8fbcb86888be5b4799`**, **222 changed lines** (139 additions + 83 deletions), CI/CodeQL green, GitHub MERGEABLE, lens verdicts **pending/pending**.
- Worktree `/home/user/workspace/wt/DES-K-128-mobile` is clean. Layout source patch backup `/home/user/workspace/ops/DES-K-128-source-layout.patch`; PR body `/home/user/workspace/ops/DES-K-128-pr-body.md`. All committed identities verified.
- [FIX ROUND 1 opening readiness](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/492#issuecomment-6046956183) is posted. Standing FIX lane owns any later audit findings or merge conflicts; operator alone owns merge.
- Core assigned-file layout is implemented and tested; **the complete child-card makeover is not**. Scope follow-up above is explicitly disclosed in the PR body/comment. Recommended default: a small separately scoped Home-section presentation pass for the encapsulated child components, without changing consent/payment logic.
- No PR merge, deploy, flags, production writes, dependencies, lockfiles or second workstream.
