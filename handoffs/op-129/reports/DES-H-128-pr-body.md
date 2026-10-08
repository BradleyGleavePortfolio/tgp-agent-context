Tier: T2 mobile presentation and bounded activity-goal selection
Why: Replace misleading rings and invented activity targets with dated actual values and owner-approved Starter goals.
T4 trigger scan: No auth, tenancy, data-sharing, health-data writes, money, credentials or destructive changes.
T3 trigger scan: No cross-system ownership, architecture or backend contract changes.
Bounded T1: Not claimed; goal selection and empty/loading states change rendering behavior.
Canonical builder: GPT-6.1 Sol (DES-H-128, agent 128).
Parent owner: Operator agent 128; owner Health decision 2026-10-07 11:26.
Acceptance evidence: Refreshed exact head 98358a9cf79f2922c12de7a095ed5026d4bae42a is CI/CodeQL-green and GitHub MERGEABLE; current main was merged and only the Health README entry relocated per operator direction. Product code is unchanged from the prior CI-green head. Post-merge local checks through heavy.sh pass: 11 screen/parity, 4 empty-state and the expanded doctrine/truthful-copy file.
Promotion triggers: A persistent target API, goal editor, permission change or backend change requires operator routing.

## What changes for coaches/clients
Activity rings are replaced with three QuietBar rows: Active energy, Exercise minutes and Steps. Real values carry their own sample date. No sample means an absent value, not a made-up zero. Fallbacks live in one file and are explicitly labelled Starter goal: 250 kcal, 20 minutes and 5,000 steps. Explicit coach/client target input overrides each fallback; no editor or persisted activity-target field exists in the current app/API, so no edit button is invented.

## B / U list
- B1: An ordinary client opens Health with older data and sees invented goals, undated progress and steps called Stand. Replace with correctly named dated values and clearly labelled owner-approved Starter goals.
- U1: Calm monochrome rows instead of three concentric rings; retain every existing metric and working action.

## Routes/actions before -> after
| Label / action | Before | After |
| --- | --- | --- |
| Heart | WearableMetricDetail: RESTING_HEART_RATE_BPM, SLEEP_RECOVERY | Same |
| Workouts | WearableMetricDetail: WORKOUT_DURATION_MIN, HEALTH_FITNESS | Same |
| Body | WearableMetricDetail: BODY_WEIGHT_KG, HEALTH_FITNESS | Same |
| Steps trend | WearableMetricDetail: STEPS, HEALTH_FITNESS | Same |
| Connect a tracker (empty client state) | Connections | Same |
| Try again (uncached error) | Refetch health query | Same |
| Pull to refresh | Refetch health query | Same |
| Coach embed | Metrics read-only; no Connections CTA | Same |
| AI panel slot | Parent-provided panel | Same |
| Activity rings | Noninteractive invented-goal display | QuietBar display; replacement under truthful-copy rule 1, no pathway removed |

## Truthful sweep and visual parity
- Missing samples display “No sample yet”; samples use their actual raw/bucket date, never today or query-window end.
- Starter targets are visibly distinguished from explicit real targets; no fake goal editor.
- Platform-specific connection copy names Apple Health on iOS or Health Connect on Android.
- Existing four cards remain, preserving their metrics and one-tap details; no navigation/tab changes.
- Match CATALOG and progress-details/luxury reference restraint: unboxed rows, generous spacing, monochrome progress, Inter metadata at 13 pt and tabular numerals. Deliberately preserve existing detail cards instead of removing information.
- README updates ship with the implementation; no dependency, lockfile or generated-file changes.

## Verification
- [Failing-first CI proof](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37680783157): 3 expected empty-state assertion failures; 678 other suites / 8,913 tests passed, guards/lint/typecheck green.
- Final head adds tests for Starter-goal constants, independently dated raw/aggregated values, real-target precedence and accessible fill, loading, no-data, coach-embed, AI-slot and route/action parity, refresh/retry and truthful cached-error copy.
- After dependencies became READY, ran one targeted file at a time through heavy.sh: HealthFitnessScreen.rhr (11/11), HealthFitnessEmptyState (4/4), quietLuxuryDoctrine (10/10). Baseline local proof independently reproduced the 3 expected failures.
- Fixed a test-only RNTL 14 incompatibility before the correction push; native RefreshControl's mock omits view props, so parity uses the existing parent ScrollView refreshControl handler pattern instead of a removed unsafe query.
- No full-project local check or dependency install. Final diff: 384 changed lines including tests/docs.
- [Prior-head green CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37683908910): 683 suites / 8,977 tests / 5 snapshots; [prior CodeQL green](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37683909008).
- [Current exact-head CI green](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37686066754) and [CodeQL green](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37686066491), confirmed at 14:11 PDT; GitHub MERGEABLE.
- Operator's README collision rule: Health documentation is inside Key files, alphabetically between AI Guide and Logging, not appended. Refreshed main merge was conflict-free; no product-code changes or C fixes in this refresh.
