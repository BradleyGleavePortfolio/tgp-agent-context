# S-COACH-MOB-2 (agent 112, Opus builder) — report

## PR #329 — coach setup wizard, fix round 2
- Head: `83ee0e46a81a1a24f8d8a5696cc3dfe92ce6ddfa` (pushed after the PUSH HOLD lifted; AUD-SOL-5 verdict 5960771086 posted first). Commits: `c57e380` (merge of main 2c17c241), `7ec0b2c`, `83ee0e4`.
- CI at head: Typecheck/lint/test pass, Analyze (actions) pass, Analyze (js-ts) pass, CodeQL pass; merge state CLEAN.
- Fix-round comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/329#issuecomment-5960887111 ; the PR body Fix round table is updated (copy at ops/reports/S-COACH-MOB-2-329-body.md).
- Tier: kept at T3 (never lowered). Operator decision: promote to T4 as part of the money set (#641/#332).

| Finding | Disposition | Commit |
|---|---|---|
| A-329-1 | Closed on #329 (checklist no longer opens the retired Earnings screen); the Money page ships in #332 | 7ec0b2c + #332 |
| B-329-1 | Closed: no duplicate package on retry (refs, server lookup, key rotation only on a definitive 4xx) | 7ec0b2c |
| B-329-2 | Closed: truthful CONNECT_NOT_CONFIGURED copy with support and a reference | 7ec0b2c |
| B-329-3 (Sol) | Closed: flat step blob; resume unwraps the legacy {data} blob | 83ee0e4 |
| B-329-4 (Sol) | Closed: active account with requirements due shows the due items, the deadline and "Update details with Stripe" | 83ee0e4 |
| C-329-1..4 | All closed (live packages only, server invite signal, step 5 status on mount, checklist error and retry) | 7ec0b2c |

Tests: `/home/user/workspace/ops/heavy.sh npx jest --runInBand src/components/coach/setup/__tests__` = 2 suites, 33 passed. Failing-before: 9 of 10 (7ec0b2c set) and 6 of 8 (83ee0e4 set) fail against the old code; the rest are regression guards.

## PR #332 — coach Money UI (stacked, T4)
- https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/332 , branch `agent/clinic/s-coach-money-mob`, base `agent/clinic/s-coach-wizard`, head `61eea1159aa68835ef2269a4cb9e9d46cd2533f6` (Money commit `5db9082` + merge of #329 at 83ee0e4).
- Status: ready for CI. Checks do not run while the base is not main.
- Contents: Home Money card, Money page (ranges, net + breakdown, the amount held from the next sale (feature-detected), needs attention, payouts, business numbers, charges and the charge breakdown), Payout settings (Stripe Express dashboard link), and Packages. Old Earnings and Business metrics routes redirect to Money. coachEarningsApi, CoachEarningsScreen and CoachBusinessMetricsScreen are deleted, so nothing calls the six 404 routes.
- Tests: `heavy.sh npx jest --runInBand src/screens/coach/money src/components/coach/setup src/__tests__/paymentsConnectPackages.test.ts src/__tests__/coachSaasBlockers.test.ts` = 5 suites, 112 passed. commandCenterNavigation, commandCenterScreens and imessageDmRoutes = 41 passed. quietLuxuryDoctrine and CrossPillarSurface = 18 passed. One `tsc --noEmit` via heavy.sh exit 0 (run because CI does not cover stacked PRs). eslint: 0 errors.
- Gaps: no CSV export, because no coach CSV route exists on backend main or #641. Multi-currency summary shape is pending #641's fix for B-641-3.

## Open risks
- #641 fix round (B-641-3 currency grouping, B-641-4 MRR cadence) may change the summary shape. The client reads `currency`, and the totals need a follow-up if they become per-currency.
- The held-from-next-sale row appears only when #627's field ships (the client detects these field names: held_from_next_sale_cents, held_cents, open_balance).
- Sol said a separate PR does not close A-329-1 on #329 by itself. Operator decision: merge #332 into #329 after #332 passes audit (recommended), or merge them in sequence.

Worktrees removed: wt/s-coach-mob-2, wt/s-coach-money-mob.

## Independent GPT-6.1 Sol audit — AUD-SOL-5

- #329 at `83ee0e46a81a1a24f8d8a5696cc3dfe92ce6ddfa`: **BLOCK, A/B/C 1/1/1**, comment **5960983148**. A-329-1 narrowed but remains pending #332 integration; B-329-1 still admits duplicate delayed creates because the backend ignores the idempotency key; B-329-2..4 and C-329-1..4 closed; new optional C-329-5 asks for the operator-assigned T4 tier metadata. [Exact-head verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/329#issuecomment-5960983148)
- #329 local targeted tests: **2 suites/33 passed**; all 3 required checks green; carried main merge independently proved pure. [Verification](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/329#issuecomment-5960983148)
- #332 at `61eea1159aa68835ef2269a4cb9e9d46cd2533f6`: **REQUEST CHANGES, A/B/C 0/3/1**, comment **5961043528**. B-332-1 wrong-period cached money after range-switch failure; B-332-2 all recurring charges labelled Monthly; B-332-3 invalid summary fields default to credible USD zeros; optional C-332-1 Home card hides refresh failures when cached data exists. [Exact-head verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/332#issuecomment-5961043528)
- #332 local targeted tests: **8 suites/153 passed**, plus **3 independent assertions failed as expected**; pure #329 integration merge; one exact-head Typecheck/lint/test CI check green, required analysis pair absent on stacked base. No main-base merge gate satisfied. [Verification and probes](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/332#issuecomment-5961043528)
- Coordinate #332 summary schema with backend #641's currency/cadence fix before approval/release; no invented currency conversion or numeric-zero fallback. Exact commands and probe paths are in the verdict comments and `ops/evidence/AUD-SOL-5-112/`.

## HANDOFF FOR AGENT 113

- **#329** — head `83ee0e46a81a1a24f8d8a5696cc3dfe92ce6ddfa`; **BLOCK 1/1/1**; comment **5960983148**. [Verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/329#issuecomment-5960983148)
- **#332** — head `61eea1159aa68835ef2269a4cb9e9d46cd2533f6`; **REQUEST CHANGES 0/3/1**; comment **5961043528**. [Verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/332#issuecomment-5961043528)
- **NOT AUDITED:** none in this two-PR queue. Already-assigned #317 is now completed separately in `S-WEAR-2-112.md`, at `58c2d53fa061071e193e5e3b5f981209425e9e0c`, **REQUEST CHANGES 0/3/2**, comment **5961170156**. [Wearables verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/317#issuecomment-5961170156)
- Recommended sequence: close durable package-create idempotency, fix Money cache/schema/cadence defects, obtain dual exact-head approval for #332, merge it into #329, then audit #329's resulting Money delta to close A-329-1. [Remaining #329 requirements](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/329#issuecomment-5960983148), [remaining #332 requirements](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/332#issuecomment-5961043528)
- No pushes, merges, dispatches, production changes, or candidate-source edits by this auditor; evidence and detached audit worktrees retained (workspace-preservation instruction).
