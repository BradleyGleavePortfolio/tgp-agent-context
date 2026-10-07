# NUTR-BE-128 — Nutrition backend fixes

Status: DONE / READY at 15:01 PDT; builder finished immediately after READY per owner override; branch `agent128/nutr-be-128`; worktree `/home/user/workspace/wt/NUTR-BE-128-backend` ([READY comment](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/853#issuecomment-6047716175)).

## Scope traced
- Read the common brief fully, the last NUTR-BE-128 job entry, required SoT sections, and NUTR-AUD-128 findings.
- Baseline main: `675242fd`; targeted services retain the audited behavior ([backend baseline](https://github.com/BradleyGleavePortfolio/growth-project-backend/tree/675242fd)).
- Work is limited to prep-source/week honesty, canonical ingredient units, addItem merging, and ended canonical assignments.

## B list
- B1: A client opens Prep guide and receives library recipes as if they were planned for the selected week ([prep guide baseline](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/675242fd/src/prep-guide/prep-guide.service.ts)).

## U list
- U2: The canonical fallback has no end-date filter, so an ended assignment still appears ([meal-plan baseline](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/675242fd/src/meal-plans/meal-plans.service.ts)).
- U3: Adding the same grocery ingredient always creates another row ([lists baseline](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/675242fd/src/lists/lists.service.ts)).
- U4: Equivalent singular/plural units fail to aggregate together ([prep guide baseline](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/675242fd/src/prep-guide/prep-guide.service.ts)).

## C one-liners
- C (edge, deferred to 10k clients): simultaneous duplicate adds; no race-hardening work.

## PRs
- [PR #853](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/853): head `dae4234935cd3b90886d0f57332426cece0e1cd4`; 237 additions + 52 deletions = **289 changed lines**; MERGEABLE / CLEAN; all 15 executed checks SUCCESS and one conditional deploy-readiness gate SKIPPED; Opus/Sol verdicts pending ([READY comment](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/853#issuecomment-6047716175), [final CI build job](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37691706208/job/113033230861)).
- Local failing-first proof: all 15 initial regressions failed on the unchanged baseline; log `ops/lanes128/NUTR-BE-128-failing-first.log` ([PR acceptance record](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/853)).
- The final nutrition suite passes 16 tests, including sequential list-add coverage; log `ops/lanes128/NUTR-BE-128-targeted-pass.log` ([nutrition regressions](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/babc5005c0cc46e9def0daedf9219c4b232fc8f6/test/nutrition-services-128.spec.ts)).
- Existing targeted recipe visibility (33), canonical/legacy integration (6), and meal-plan CRUD (12) tests passed individually through `heavy.sh`; logs in `ops/lanes128/NUTR-BE-128-*-pass.log` ([PR verification record](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/853)).
- Backend metadata contract: `source: 'plan' | 'library'`, `week_filter_applied: false`, `week_start` retained as compatibility echo, no unsourced prep-day suggestions ([prep guide change](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/babc5005c0cc46e9def0daedf9219c4b232fc8f6/src/prep-guide/prep-guide.service.ts)).
- Shared canonical units match preexisting rows on list additions; distinct units remain separate; no schema, migration, lockfile, dependency, authorization, or production change ([PR diff](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/853/files)).
- Initial CI passes lint, type-check, build, schema parity, and live integration checks; CodeQL reports polynomial trailing-period stripping in the new unit helper, replaced by a linear suffix scan; the one targeted rerun passes 16/16 before the final push ([CodeQL check](https://github.com/BradleyGleavePortfolio/growth-project-backend/runs/113032632805), [CI build job](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37691096426/job/113031167135), [linear unit normalization](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/dae4234935cd3b90886d0f57332426cece0e1cd4/src/common/ingredient-unit.ts)).

## Not fixed (needs operator)
- No unresolved finding in the assigned backend scope; no owner decision needed ([READY scope record](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/853#issuecomment-6047716175)).
- Adjacent mobile copy/week arrows require the separate mobile lane; default: that lane consumes `source` and `week_filter_applied`, hides week claims/arrows, and labels library recipes honestly ([backend metadata](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/dae4234935cd3b90886d0f57332426cece0e1cd4/src/prep-guide/prep-guide.service.ts)).
- The explicitly assigned `addItem` fix does not include the distinct `ListsService.bulkAddItems` endpoint; default: route bulk deduplication separately if the mobile lane switches to it ([lists service](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/dae4234935cd3b90886d0f57332426cece0e1cd4/src/lists/lists.service.ts)).

## HANDOFF
READY posted at 15:01 PDT on exact head `dae4234935cd3b90886d0f57332426cece0e1cd4`; CI green, no conflict, 289 changed lines ([READY comment](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/853#issuecomment-6047716175)).

Operator next: route both lenses at this exact head; only the operator merges. Later requested changes/conflicts go to a fresh FIX lane. Builder does not wait for verdicts and starts no second job.

Saved report: `/home/user/workspace/ops/reports/NUTR-BE-128.md`; failing-first/passing logs, PR body, and READY payload: `/home/user/workspace/ops/lanes128/NUTR-BE-128-*`; notify: `/home/user/workspace/ops/lanes128/notify/NUTR-BE-128.txt`.

No merge, deploy, production data write, flag change, or spend performed.
