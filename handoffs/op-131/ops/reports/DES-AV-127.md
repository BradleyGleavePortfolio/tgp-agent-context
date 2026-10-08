# DES-AV-127 — create account, visual only

## Scope traced
- Own worktree: `/home/user/workspace/wt/DES-AV-127-mobile`, branch `agent128/des-av-127`, starting main `c00a2a5f`.
- Scope: CreateAccountScreen.tsx, its tests, and only its row in auth/README.md (README rule).
- Consent sentence, links, coach-sharing notice, role-choice logic, validation, error copy, and signup behaviour frozen.
- Inventory: invite input/paste/preview/request-access email + Copy/Try again fallback; name/email/password/phone; role choice and change role; terms/privacy links; email signup/Google/Apple; Sign in; issue Log in/Reset password/Back/support; verify/check/different email; coach withdrawal client/sign in/recheck/support.
- Truthful sweep: no unsupported new lines; existing policy-, preview-, role-, request-outcome- and signup-state-driven text retained verbatim, including frozen first-person verification label.

## B list
None found within visual-only scope.

## U list
1. Signup fields use filled cards, shadows and inconsistent default type; replace with semantic-theme hairlines, Inter and a calm Cormorant headline.

## C one-liners
None.

## PRs
[Mobile PR #503](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/503) open at `12717384069c4ace199ca8325fdd56aa2a51b2fc`: 222 changed lines (141 additions / 81 deletions), only the screen, its test file and its README row.
- Final exact-head CI green at 14:32 PDT: Typecheck/lint/test, Analyze (actions), Analyze (javascript-typescript) and CodeQL all SUCCESS.
- Merged current origin/main `f240af37f38d775ad4b47794e8978c8f31ad8dce` without conflict and pushed merge head `12717384`; own patch is unchanged. Fetched/merged again immediately before READY: already up to date, clean tree, GitHub MERGEABLE.
- Identity verified: Bradley Gleave <bradley@bradleytgpcoaching.com>, author and committer.
- [READY opening comment](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/503#issuecomment-6047271156) posted at 14:32:28 PDT.
- Opus/Sol verdicts: pending / pending at exact head; builder does not wait per owner override.

Acceptance evidence (2026-10-07 14:22 PDT):
- Failing-first log: `DES-AV-127-failing-first.log` (two semantic-theme failures on unchanged source; parity passed).
- `DES-AV-127-create-account.log`: 79 passed.
- `DES-AV-127-consent.log`: 2 passed, frozen coach-sharing sentence/payloads.
- `DES-AV-127-frozen-errors.log`: 24 passed, frozen signup/error/validation/recovery behaviour.
- `DES-AV-127-voice.log`: 8 passed.
- `DES-AV-127-doctrine.log`: 30 passed, includes existing state-driven truthful-copy/action guards.
- All runs through heavy.sh, one targeted file at a time; no local full typecheck/lint/suite.
- `DES-AV-127-pr-body.md` holds the full before/after action table and pre-style truthful sweep.

## Not fixed (needs operator)
None.

## HANDOFF
COMPLETE to READY. PR #503 at `12717384069c4ace199ca8325fdd56aa2a51b2fc`, 222 lines, all checks green, no conflict. READY posted; no merge, deploy, production action, lens waiting or second job.

Operator can route both exact-head lenses now. No B or decision needs operator intervention; one visual U fixed. Saved body/comment and all local test logs alongside this report. Notify written to `/home/user/workspace/ops/lanes128/notify/DES-AV-127.txt`.
