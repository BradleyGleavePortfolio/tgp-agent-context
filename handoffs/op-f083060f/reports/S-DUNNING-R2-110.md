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

## Final state (23:00 PDT)

| Repo | PR | Branch | Head |
|---|---|---|---|
| backend | #628 | `agent/clinic/s-dunning-v2-live` | `ba1d9480cdd93e69504804c32117e83bc913c6ba` (main `4bcfb444` merged in). CI: all 16 green |
| mobile | #322 | `agent/clinic/s-dunning-lockout-screen` | `8991ddf37ddc5488fc1448d5cdb6f3b04dc1af26` (main `0b7f197` merged in). CI: all green |
| backend | #633 (flags workflow, own T4 PR) | `agent/clinic/s-dunning-flags-workflow` | `850ec148a23f69b1f7e5efd8fba43cd7972a7715`. CI: green except the pre-existing Infra Lint shellcheck |

PR bodies: reports/S-DUNNING-R2-backend-pr-body.md, reports/S-DUNNING-R2-mobile-pr-body.md and
reports/S-DUNNING-flags-workflow-pr-body.md.

### Fixes during the round
- Backend CI R75 failed at 6720410e (`as any` +3 in test/dunning-r2-surfaces.spec.ts). Fixed in 8be3a9ce: the spec now uses
  real HTTP and Nest DI. Local `check-r75.js --mode=range`: OK (as any -1). CI R75 passed at 5be90ef1.
- Mobile CI failed at de83aa6: main's new rootNavigatorOnboardingField test (#320) has a navigation-ref mock without
  getCurrentRoute. The mock was fixed in 8991ddf (test-only).
- #633 "Infra Lint" fails on `scripts/s10-core-diff-gate.sh` (SC2015, from main commit 384035ec). This is pre-existing and fails on every
  infra-touching PR (deletion-be, s-sched-backend, s-envtruth-backend). It is not caused by #633 and was not changed (not my lane).

### Portal decision
No client dunning surface opens the Stripe portal now. `POST /v1/checkout/billing-portal` stays for builds already in the stores,
whose Plans past-due button calls it (dormant). The mobile `createBillingPortalSession` and the webview `billing.stripe.com` host stay,
because the repo's "never shrink" rule and the C12 audit test pin them. The coach portal is separate.

### Decisions needed (recommended default first)
1. Stripe failed-payment and 3DS emails: OFF once the email transport is verified live (default). Until then leave them ON.
2. Apple Pay / Google Pay in the Update card sheet: not now (default). This needs a merchant id + config plugin, a package.json change.
3. Remove the portal route after the minimum app version includes #322: yes (default), as a follow-up.

### Tests (all targeted, `--runInBand`, via heavy.sh) and CI
- Backend local: tsc exit 0 (NODE_OPTIONS 4096, merged tree). eslint on the 33 changed files: exit 0. jest: 14 suites/208 (merged tree),
  4 suites/68 (+1 pre-existing skip) after the R75 fix, plus the pre-merge batches (7/125, 11/158, 13/294). R75 range: OK.
- Backend CI at ba1d9480: build-and-test 632 suites / 10767 tests passed. R75, schema parity, forward and reversible migrations,
  CodeQL and RLS live all passed.
- Mobile local: tsc exit 0. eslint 0 errors. jest 33 suites/387. vendor-name guard passed. validate-app-config OK.
- Mobile CI at 8991ddf: Typecheck, lint, test success (402 suites / 5433 tests). CodeQL passed.

### Cleanup
Worktrees wt/sdun2-mob, wt/sdun2-flags and wt/sdun2-be were removed (symlinks unlinked first). Shared deps were not touched.
