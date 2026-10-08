# NUTR-COPY-128 — meal plan copy fixes

Status: DONE / READY posted at 14:45 PDT; all CI checks green and no conflicts. Scope: NUTR-AUD-128 U7, U8, U9 only. [READY comment](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/511#issuecomment-6047491000).

## Scope traced
- Assigned branch: agent128/nutr-copy-128; worktree: /home/user/workspace/wt/NUTR-COPY-128-mobile.
- Base: [mobile main f240af37](https://github.com/BradleyGleavePortfolio/growth-project-mobile/commit/f240af37).
- U7: coach empty-state text points clients to a nonexistent Plan tab.
- U8: AI approval omits initialTab; ClientDetail's client-change effect also overwrites the requested tab with Summary.
- U9: current main already uses neutral “View meal plans”; existing More tests cover this copy without assuming a coach or assigned plan. Preserve it rather than reintroduce an unsupported coach claim.
- No backend changes, dependencies, production actions, merges or deployments.

## B list
None.

## U list
- U7: replace incorrect tab directions with “The client sees it under Meal plan.”
- U8: approval passes initialTab: mealplan; honor the route-selected tab on mount and when returning to the same client.
- U9: already resolved on latest main; verify existing truthful-copy and reachability tests.

## C one-liners
None.

## PRs
- [mobile #511](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/511).
- Head: [d16ddfae22ecd5b04ed017453ff9af62ec830cf1](https://github.com/BradleyGleavePortfolio/growth-project-mobile/commit/d16ddfae22ecd5b04ed017453ff9af62ec830cf1).
- Diff: 63 additions + 7 deletions = 70 changed lines, under the assigned 120-line cap.
- CI: [Typecheck, lint, test](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37690791529/job/113030135878) SUCCESS, including lint, typecheck, tests and all guards; both [CodeQL analyses](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37690791300) and CodeQL aggregate SUCCESS.
- Mergeable: CLEAN / MERGEABLE; review verdicts pending/pending. Author and committer verified as Bradley Gleave.
- [FIX ROUND 1 (OPENING) READY](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/511#issuecomment-6047491000) posted at the exact head above. No merges, deployments or production changes.

Acceptance evidence complete:
- Failing-first AI/empty-state run: 2 failed, 2 passed; approval omitted initialTab and old directions remained.
- Failing-first ClientDetail run: requested Plan was overwritten by the Summary reset.
- Logs: NUTR-COPY-128-ai-red.log and NUTR-COPY-128-route-red.log in the report directory.
- Green: AI draft/MealPlanTab 4/4; ClientDetail 7/7; More 20/20. All local runs used heavy.sh, one targeted file at a time.
- More remains unchanged: its existing 20-test matrix verifies all menu destinations and coach/plan-neutral descriptions.
- Final rerun: AI/MealPlanTab 4/4 including create/edit/archive/retry callbacks; doctrine 30/30. Total 61 passing targeted tests.

## Not fixed (needs operator)
None identified.

## HANDOFF
- Builder FINISHED immediately after READY; no waiting for reviews or second job under the top-level owner override.
- Operator: route both audit lenses to [PR #511](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/511) at d16ddfae22ecd5b04ed017453ff9af62ec830cf1; only merge after the required exact-head verdicts.
- No unfinished implementation or owner decision. U7/U8 fixed here; U9 already fixed on main and verified. B=0, U=2 fixed.
- Clean worktree retained at /home/user/workspace/wt/NUTR-COPY-128-mobile on agent128/nutr-copy-128; all local red/green logs, PR body and READY body remain in /home/user/workspace/ops/reports/.
