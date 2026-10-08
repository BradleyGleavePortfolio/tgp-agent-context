FIX ROUND 1 (OPENING) (CF-ROMAN-NAV-128, agent 129) — growth-project-mobile#523 @ 7e909c35e8192a383f4b7b8e50272ccdf7062057 — READY FOR AUDIT

Finished [draft #523](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/523) on its existing assigned branch, merged current main without rebase or force-push, and retained both sides of the components-README conflict. Added only navigation documentation while finishing; no additional runtime changes and no changes to nearby #506's conversations/transcript screens ([PR diff and acceptance evidence](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/523)).

- U1: Home Roman entry preserves the You-menu root with `initial:false`; labelled theme-coloured 44 pt Back works across all five chat states and client/coach surfaces ([PR changes and parity proof](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/523)).
- U2: Returning empty daily chats select existing returning copy using the existing account-bound history metadata; failed history reads do not invent a first meeting or block chat ([PR changes and greeting proof](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/523)).
- Fresh failing-first proof on main `a1be6fb25538b02e961fd379a0d86d71d610ad7a`: Home 1 failed / 8 passed; navigation 7 failed; greetings 4 failed ([acceptance evidence](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/523)).
- Fresh exact-head tests: Home 9 passed, navigation 7 passed, greetings 4 passed (20 total), run one targeted file at a time through `ops/heavy.sh`; saved logs report the `--forceExit` notices ([acceptance evidence](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/523)).
- Routes/actions parity table, truthful sweep and matching READMEs are in the PR body/diff; 221 changed lines (208 additions + 13 deletions), 10 files ([#523](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/523)).
- Exact-head [Typecheck/lint/test](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37701040917/job/113064280530) and [CodeQL](https://github.com/BradleyGleavePortfolio/growth-project-mobile/runs/113064409865) are green; GitHub reports no conflict.

Both independent exact-head lens verdicts remain required. No merge, deployment or production changes.

agent 129
