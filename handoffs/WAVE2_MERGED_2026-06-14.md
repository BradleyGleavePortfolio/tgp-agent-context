# Wave-2 MERGED — 2026-06-14 (Sunday)

**Operator:** Bradley Gleave
**Merge window:** 16:32–16:34 UTC (09:32–09:34 PDT)
**Method:** squash merge via `gh pr merge --squash` (non-admin; branch protections allowed)

## Merged PRs

| Lane | PR | Repo | Squash SHA on main | Topic |
|---|---|---|---|---|
| L2 | [#200](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/200) | mobile | `a8d698bb96` | async-storage 2.2.0 → 3.1.1 |
| L4 | [#395](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/395) | backend | `adc066bd3f` | Roman P4 CoachFirstPaymentNotification (gated) |
| L5 | [#242](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/242) | mobile | `f2dde9b3f0` | Roman P4 ED.3/ED.4 animations |
| L7 backend | [#396](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/396) | backend | `b19fee89f6` | v3-2 classroom posts backend (flag off) |
| L7 mobile | [#248](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/248) | mobile | `ce14bbe768` | v3-2 classroom posts mobile (flag off) |

## Post-merge main HEADs

- **Backend main:** `b19fee89f6`
- **Mobile main:** `ce14bbe768`

## Gating now released

- **L8 v3-3 voice notes:** L7 collision on `community.module.ts` resolved — DISPATCH AUTHORIZED.
- **L9 v3-4 search + wearable:** still gated on L8 merging.

## Feature flags shipped OFF (default)

- `FEATURE_COMMUNITY_CLASSROOM_POSTS` (backend)
- `EXPO_PUBLIC_FF_COMMUNITY_CLASSROOM_POSTS` (mobile)

No behavior change in prod until Bradley flips both.

## Telemetry baseline update

Backend `test/community/realtime/posthog-event-names.spec.ts` pinned set now **9** (was 6). L8/L9 must check this baseline before bumping (per R78).
