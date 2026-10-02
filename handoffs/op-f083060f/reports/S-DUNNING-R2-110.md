# S-DUNNING-R2 (agent 110) — dunning 1A/2A + native card update

Builder: Claude Opus 5.5 (T4). Backend #628, mobile #322. Nothing merged, no Stripe settings, flags or deploys touched.

## Progress log

- 20:45 PDT: read brief (owner facts 20:38, decisions 20:32), lane objective, 109's lane + report.
- Worktrees: `wt/sdun2-be` (from `691528a0`), `wt/sdun2-mob` (from `2d77399d`). Merged current main into both
  (backend `53b625d2`, mobile `bb161a3`): clean merges, no conflicts.
- Migration prefix claimed: **20270215000000_dunning_billing_actions** (B-UGC has 20270211000000 in its worktree; I left
  20270212-14 free for S-SCHED / others). Operator: please record the reservation.
- 21:00-22:10 PDT: backend implemented and committed in the worktree (`319b1199`), then merged origin/main `4bcfb444`
  (#595, #630, #631, #623) into it as `397298d5` with no conflicts. Contents: ClientBillingService/Controller/Reconciler
  (native SetupIntent, 1A pay-now, 2A void+cancel, option A), migration 20270215000000, Stripe wrappers, v2 email
  templates (F17), the /billing/update-card landing page + AASA, and the stale subscription.updated guard.
- Backend targeted jest (all `--runInBand` via heavy.sh): new e2e 18/18; surfaces 13/13; dunning + checkout + guard +
  openapi + roles + route-table + email + public pages + well-known: 7 suites/125, 11 suites/158, 13 suites/294. All green.
- Flags workflow: own T4 PR **backend #633** (`agent/clinic/s-dunning-flags-workflow`, head `850ec148`, base main).
  It applies reports/S-DUNNING-flags-workflow.patch, adds fail-fast validation, a guarded unset and a present/absent
  post-check (updated patch: reports/S-DUNNING-flags-workflow-r2.patch). It is not dispatched.
- Mobile: native UpdateCard screen + PaymentSheet (TGP tokens) + 1A outcomes + 3DS + 2A "End my plan", deep links,
  Android intent filter, AASA template. First jest run 66/67, one test-timing fix (status mock), rerun queued.
- Support email: the backend uses SUPPORT_EMAIL from trust-pages (#631). Mobile dunning copy now uses the owner's single
  address, matching mobile #324's constant. It should re-export from `src/constants/support.ts` once #324 lands.
- reports/S-DUNNING.md Stripe settings list updated (7 items) and F15/F16 marked resolved.
