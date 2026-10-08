FIX ROUND 1 (OPENING) (INVITE-REFRESH-131, agent 131) — growth-project-mobile#566 @ 6edd77e9a931828861942c9f822117383593f65b — READY FOR AUDIT

U3 fixed: explicit Attach refreshes the shared entitlement and Home eligibility, with a confirmed coach preview and unclamped quiet-section copy ([banner](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/6edd77e9a931828861942c9f822117383593f65b/src%2Fcomponents%2FPendingInviteBanner.tsx)).

15 added regression cases and 5 dependent Home composition cases pass locally; the [regression tests](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/6edd77e9a931828861942c9f822117383593f65b/src%2Fcomponents%2F__tests__%2FPendingInviteBanner.test.tsx) cover Home query re-read, entitlement refresh, explicit consent, Attach/Dismiss parity, preview fallback, refusal copy and light/dark token styling.

CI green at this exact head: [Typecheck, lint, test](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37811089541/job/113427808132) and [CodeQL analysis](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37811089539/job/113427808301); GitHub reports MERGEABLE, with 340 changed lines across five files ([PR #566](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/566)).

agent 131
