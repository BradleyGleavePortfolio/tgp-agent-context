# B-RECUR-BE (agent 114): backend #654, and mobile #334 since 19:11

## State (final)
### Backend #654
- Head: 795110b717b1554045d13bf596eeacb0c38f19c6 on branch agent/clinic/b-recur-subscriptions. The base was left as is.
- CI at the head: every check that runs is green. That covers:
  - build-and-test, rls-floor-guard, rls-live-tests, mwb-3-live-tests, community-live-tests;
  - Schema parity, forward migrations, reversibility;
  - npm audit (via main's #663), deploy readiness, size-label.
- Danger, CodeQL, Banned cast tokens and build-sbom run only after the retarget to main. The local R75 range check is OK.
- FIX ROUND comment (continued round 1), ending READY FOR AUDIT: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/654#issuecomment-5964942498
  - The earlier FIX ROUND 1 at 16cf4ca9 is issuecomment-5964340600.
- The PR body is updated: tier header, contract, trial design, idempotency, Stripe test-mode step 0, the Fix round table and the merge order with #656.

### Mobile #334
- Head: 0629d50601618af7a51d0f92c4bbf828001dba7a on branch fix/package-sheet-payment-intent.
- CI: Typecheck/lint/test, Analyze ×2 and CodeQL all pass.
- FIX ROUND 2 comment, ending READY FOR AUDIT: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/334#issuecomment-5964783068
- The body is updated with a "Fix round 2" table, and the Contract gaps section is marked closed.

## Backend commits this round
| Commit | Content |
|---|---|
| 82702341 | Merge #627 @ 7c29d981 |
| 16cf4ca9 | R1-1..R1-8 (trialing open attempt, PACKAGE_ALREADY_INCLUDED, $0 recurring -> PACKAGE_IS_FREE, combo one-time price check, replay codes, stale-trial retire, PI failure on a subscription = last_error only, unpaid deletion = expired) |
| 48616468 | R1-9 / C-654-4: allowlisted error extras through HttpExceptionFilter (`src/filters/error-details.ts`). R1-10: share-link refusal `PACKAGE_COACH_NOT_CONNECTED` + reason (only with the live share_token; otherwise the non-leaking 404) |
| d43633aa | B-654-1: `setup_intent.succeeded` sets the trial's default card (idempotent, out of the tx, redelivered on failure); every path reads the SetupIntent by id (`src/checkout/trial-card.ts`, `retrieveSetupIntent`); cleanup never cancels a trial with a saved card. C-654-2: reuse re-checks trial_days. C-654-3: a replay never returns a spent secret. |
| 9aa1eb63 | Merge #627 @ f47b0c6a |
| 795110b7 | Merge #627 FIX ROUND 8 final @ cd332bfa (B-627-9, C-627-2, main ec911328 with #608 and #663) |

On #608: this PR adds no user-id or email column (only `ClientPurchase.trial_days` and `trial_started_at`). The erasure-manifest-coverage, manifest-fk-order and roles-enforced specs pass.

## Mobile commit
0629d506 (B-334-1):
- `SUBSCRIPTION_ATTEMPT_EXPIRED`: the app retries once with a fresh key. After a second expiry it shows specific copy, and the next tap gets a new key.
- `PACKAGE_ALREADY_INCLUDED`: specific copy for each included_by value, plus Open your plan.
- `PACKAGE_COACH_NOT_CONNECTED`: specific copy for each reason. The share link sends share_token to subscription-intent only.
- `PACKAGE_IS_FREE` from subscription-intent: falls back to claim-free.

## Tests (failing-before logs in ops/brecurbe114/)
Backend:
- `b-recur-fix-round-1-trial-card`: 18/18 after. Before: 12 failed, 6 controls passed (`failing-before-trial-card.log`).
- `b-recur-fix-round-1-http`: 16/16 after. Before: 11 failed, 5 controls passed (`failing-before-http.log`).
- `b-recur-fix-round-1`: 24/24 after. Before: 18 failed (`failing-before.log`).
- Related suites all pass: `r1b.log`, `r1c.log`, `postmerge.log`, `post608.log`, `post608b.log`.

Mobile:
- `PackageSelectionSheet.subscription`: 35/35 after. Before: the 9 new cases failed (`mob_failing_before.log`).
- buyer, purchase and paymentsApi suites: 40/40.
- tsc and eslint are clean.

## Operator actions
1. Add `setup_intent.succeeded` to the platform Stripe webhook endpoint's events. This is pre-launch step 0 and is in docs/stripe-setup.md. Without it, trials still start through the plan-read backstop while the app polls, but the webhook is the primary path.
2. Retarget #654 to main after #627 merges. Danger, CodeQL, Banned cast tokens and build-sbom run then.

## CONTRACT (#654 <-> #334, both now in this lane)
New codes:
- PACKAGE_ALREADY_INCLUDED, carrying purchase_id, included_by and access_expires_at.
- SUBSCRIPTION_ATTEMPT_EXPIRED: start again with a new key.
- PACKAGE_COACH_NOT_CONNECTED, carrying reason (`no_coach` or `other_coach`).

Request fields:
- Optional `expected_one_time_cents`.
- Optional `share_token` (21 characters, nanoid alphabet).

Behaviour:
- PACKAGE_IS_FREE can now come from subscription-intent.
- The error extras now reach the wire for: PACKAGE_PRICE_CHANGED, SUBSCRIPTION_ALREADY_ACTIVE, PACKAGE_ALREADY_INCLUDED and PACKAGE_COACH_NOT_CONNECTED.
- #334 is backward compatible with the old envelope; it keeps its re-read fallbacks.
- Apple Pay and Google Pay need no backend change.

## Merge order
1. #627
2. #654 (retargeted to main)
3. #656 (B-TRIALS), which does the integration listed in #654's body.
4. Mobile #334 merges only after backend #654 (and #628 for End my plan) is deployed.

## HANDOFF
- #654 @ 795110b7 and #334 @ 0629d506 are both READY FOR AUDIT, and every check that runs on each is green.
- Re-audit asks:
  - Opus delta on B-654-1, C-654-2, C-654-3 and C-654-4 (#654);
  - Opus delta on B-334-1 (#334).
- Nothing is pending in this lane. The worktrees were removed: wt/B-RECUR-BE-114, and wt/B-RECUR-MOB-BE114 (local branch wip-b334-114).
