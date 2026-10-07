# DES-AK-127 — Community tab shell and Today

## Scope traced
- Builder agent 128. Own worktree: `/home/user/workspace/wt/DES-AK-127-mobile`; branch `agent128/des-ak-127`; base `d0875d26`.
- Read common brief, assigned final DES-AK entry, SoT A1/A2 owner overrides/A6, design (c)/(e), catalog, guide and doctrine.
- Only CommunityTabScreen, CommunityTodayScreen, their tests and corresponding module README will change.
- Existing routes: Today/Hall/Cohorts/Challenges/Messages segments, cohort, pinned thread, event/challenge detail with flag fallbacks, empty Hall/message action, safety and coach-gated leaderboard. Find/classroom remain registered outside these screens.

## B list
- FIXED B1: Opening a pinned community post called its author “your coach” although Today returns only an author ID. Replaced with neutral “Pinned post”. ([Changed Today](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/482/files))
- FIXED B2: On a true-empty Today with Hall disabled, “Visit the Hall” opened messages. The action names its real destination and is omitted for coachless clients without community DMs. ([Changed Today](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/482/files))
- FIXED B3: A coachless client with no membership was promised by inherited empty copy that a coach would place them in a cohort. Local empty copy now states facts about the response; shared voice helper unchanged. ([Changed Today](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/482/files))

## U list
- FIXED U1: Initial Today loading now has a named, accessible loading state. ([Changed Today](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/482/files))
- FIXED U2: Filled cards and pills replaced with text-first hairline rows and underlined segments; token typography and forest composer shortcut. ([Changed screens](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/482/files))

## C one-liners
- Today returns no post-author display name, body, timestamp or reaction/reply counts; omit unavailable facts rather than invent them.
- Existing coach-message suite's open-handle warning is deferred; its 5 assertions passed locally and the full CI passed.
- Lens C: event time's seconds could be shortened; repeated overlines could be quieter; existing server-disabled empty-state Hall action retained. No launch blocker; no follow-up edit in this approved round. ([Opus verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/482#issuecomment-6046544764))

## PRs
- [Mobile #482](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/482), implementation head `01ffe9146f9580fcba2f2ba2291f7eb7a41363fd`; **307 changed lines = 237 additions + 70 deletions**; [final CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37681554443) and all four checks GREEN.
- **Dual exact-head APPROVE**, verified 13:48:13 PDT: [Claude Opus 5.5](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/482#issuecomment-6046544764) / [GPT-6.1 Sol](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/482#issuecomment-6046560796). No outstanding B/U.
- [Opening READY comment](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/482#issuecomment-6046474343) posted; PR marked ready. Waiting began at 13:42:41 PDT; 75-minute cutoff 14:57:41 PDT.
- Full CI: **679/679 suites and 8,924/8,924 tests passed**; complete log `DES-AK-127-green-ci.log`.
- [Failing-first CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37680706319) at tests-only `5c0010ee` passed lint/typecheck and failed seven expected assertions in the two touched-screen suites (677 other suites passed). Full log saved to `ops/reports/DES-AK-127-failing-first-ci.log`.
- After deps became READY: local targeted Today 10/10, shell/leaderboard 5/5, coach-message 5/5 passed individually through heavy.sh. Logs: `DES-AK-127-today-local.log`, `DES-AK-127-shell-local.log`, `DES-AK-127-messages-local.log`.

## Not fixed (needs operator)
- None. Shared deps limitation resolved.

## HANDOFF
- COMPLETE: #482 has dual APPROVE at `01ffe9146f9580fcba2f2ba2291f7eb7a41363fd`, all checks green, 307 lines, local targeted 20/20 and full CI 8,924/8,924 tests. Operator may merge the exact approved head; this builder did not merge or deploy. No operator/owner decision needed.
- Branch `agent128/des-ak-127`; worktree `/home/user/workspace/wt/DES-AK-127-mobile`. Three B and two U items resolved; zero outstanding. Audit comments and opening comment are linked above; all evidence logs remain in this report directory.
