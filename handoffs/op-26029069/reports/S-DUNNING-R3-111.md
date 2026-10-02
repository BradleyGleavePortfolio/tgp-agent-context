# S-DUNNING-R3 report (operator agent 111)

## PRs
- Backend #628, branch `agent/clinic/s-dunning-v2-live`, head **739e9a54** (merge of main `e5a6044a` as merge commit `7638f650`, then R3 commit). Migration name unchanged: `20270215000000_dunning_billing_actions`.
- Mobile #322, branch `agent/clinic/s-dunning-lockout-screen`, head **0b4813d** (merge of main `e3986e8` as merge commit `c6b0fe3`, `api.ts` conflict resolved, then R3 commit). #322 is no longer DIRTY locally; GitHub mergeability to be confirmed in CI.
- PR bodies updated with the T4 header, fix-round table and six worked money examples per path (`ops/sdr3-111/pr628-body.md`, `pr322-body.md`).

## Per-finding disposition (all closed in one pass)
| Finding | Disposition | Test |
|---|---|---|
| B-628-1 | Fixed: re-read Stripe inside the fenced cancel; paid first means option A (period end, `paid_period_kept`), idempotent | money-truth "B-628-1" x3 |
| B-628-2 | Fixed: per-plan, per-invoice integer cents; message leads with what was paid | money-truth "B-628-2/3" |
| B-628-3 | Fixed: quote route + `approved_invoices`; `approval_required` with fresh quote; currencies never summed | money-truth "B-628-2/3" x4 |
| B-628-4 | Fixed: limit 100, `has_more` pagination, fail on incomplete/malformed | surfaces pagination x3, money-truth 25 plans |
| B-628-5 / C-628-4 | Fixed: journal intent before void; reconciler finishes; stale live `subscription.updated` ignored | money-truth "B-628-5" |
| B-628-6 | Fixed: outbox in same tx, retry backoff, dead after 6, per-cycle keys | money-truth "B-628-6" x2 |
| B-628-7 | Fixed: shared effective-access helper (guard + `lock_waived`) | money-truth "B-628-7" |
| B-628-8 | Fixed: dispute cycles lock on schedule; cleared only by `charge.dispute.closed` (won) or manual | money-truth "B-628-8" |
| B-628-9 | Fixed: lease table with fencing token, CAS inside every money-write tx | money-truth "B-628-9" |
| B-628-10 | Fixed: phase carried by stable codes the production filter keeps | http-codes "B-628-10" (real HTTP + `HttpExceptionFilter`) |
| C-628-1 | Fixed: re-read before reporting requires_action | money-truth "C-628-1" |
| C-628-2 | Fixed: 503 `PAYMENTS_NOT_CONFIGURED` before any Stripe call | http-codes |
| C-628-3 | Fixed: `INVALID_BILLING_REQUEST` (names field), `INVALID_PLAN_ID` | http-codes x3 |
| B-322-1 | Fixed: per-currency paid/due copy; "active again" only when restored | nativeCardUpdate "B-322-1" |
| B-322-2 | Fixed: lost confirm re-asks same SI + approval, "Confirming", `RESULT_NOT_CONFIRMED`, "Check my payment again" | "B-322-2" x2 |
| B-322-3 | Fixed: `bank_pending` keeps SI + secret | bank cases |
| B-322-4 | Fixed: all native SDK calls guarded; screen actions cannot leak rejections | "B-322-4", autostart |
| B-322-5 | Fixed: strict fail-closed normalisers; provider keeps state; visible references | "B-322-5" x2, normaliser |
| B-322-6 | Fixed: quote before sheet, exact label, approval, re-approve flow | "B-322-6" x2 |
| C-322-1 | Fixed: conditional End my plan alert; `paid_period_kept` copy | "C-322-1" |

Failing-before: the R3 tests call APIs absent at the R2 heads (`ba1d9480`, `8991ddf`), so they fail there by construction. No separate red run was recorded.

## Test commands and results (all via `ops/heavy.sh`)
- Backend: `npx jest --runInBand test/dunning-r3-http-codes.spec.ts test/dunning-r3-money-truth-e2e.spec.ts` = 2 suites, 20 passed (final). Earlier this round: the r3 specs plus `dunning-r2-native-card-1a-2a-e2e`, `dunning-r2-surfaces`, `dunning-v2-service`, `dunning-v2-lockout-allowlist-route-table` = 6 suites, 113 passed. Also passed: deploy-readiness, dunning.service, checkout-webhook-handler, dunning-v2-e2e-lifecycle, env-registration, roles-enforced, lockout guard unit/e2e, cadence, openapi-spec, privacy-exact, route-doc-drift.
- Backend `npx tsc --noEmit -p tsconfig.json` (3800 MB heap): EXIT 0. It ran before two late test additions (C-628-1 and B-628-10); ts-jest compiled and passed both.
- Backend eslint on changed files: 0 errors (the 5 unused-var warnings in the new spec are fixed). Prettier applied. R75 `--mode=staged`: no positive token change.
- Mobile: `npx jest --ci --runInBand --runTestsByPath src/entitlements/dunning/__tests__/nativeCardUpdate.test.tsx src/entitlements/dunning/__tests__/dunningLockout.test.tsx` = 64 passed. `npx tsc --noEmit -p tsconfig.json`: EXIT 0. `eslint --max-warnings=0` on changed files: EXIT 0. Mobile has no prettier config, so I formatted the changed files only, in the existing style (single quotes, width 120). Mobile has no `check-r75.js`. A manual scan of the added lines found no banned tokens.

## CI
Last check, after the worktrees were removed: backend passed R75 cast gate, forward migrations, danger, npm audit, rls-floor-guard, build-sbom and size-label. Still pending: build-and-test, schema parity, migration reversibility, rls/mwb live tests, test-deploy-readiness and CodeQL. Mobile passed CodeQL and Analyze (actions). Still pending: "Typecheck, lint, test" and Analyze (javascript-typescript). The pending results are not confirmed.

Worktrees `wt/sdr3-be` and `wt/sdr3-mob` are removed (symlinks unlinked first). Disk use is now 75%.

## Risks
- The backend tsc result is from before the last two test edits (both are test files only, and ts-jest compiled them).
- The heavy lock is shared with other agents, so CI timing is unpredictable.
- The client-side reference on reported local failures is a fresh UUID. It is not a server request id, so support can match it in Sentry but not in server logs.

## Decisions needed (recommended default)
1. Subscribe the Stripe webhook endpoint to `charge.dispute.closed` (default: add it at deploy; without it, dispute cycles clear only manually).
2. A lost dispute is settled by support in v1.0 (default: yes).
3. A replayed confirm reports the amount the first confirm paid, and an invoice Stripe paid before our call reports 0 for that line but the plan as settled (default: accept).
