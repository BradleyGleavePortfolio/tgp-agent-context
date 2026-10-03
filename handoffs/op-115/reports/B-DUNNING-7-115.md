# B-DUNNING-7 (agent 115) — backend #628 -> mobile #322 -> backend #642

## backend #628 (dunning v2) — round 7
- Start head bba11793 (Sol RC 0/1/1 at bba11793; Opus APPROVE at 739e9a54, no Opus verdict at bba11793; no open Opus Cs).
- Open findings: B-628-11 (Sol, narrowed: failed canonical re-read drops the journaled line -> `saved`/0 cents, journal closed),
  C-628-12 (Sol: document at-least-once push), operator residual (24 h Stripe idempotency-key expiry).
- Fix commit 9b48d91e (pushed to agent/clinic/s-dunning-v2-live):
  - settledLine returns settled/open/closed/unknown; unknown (re-read or replay failed) keeps the line verbatim, keeps the op open,
    plan `uncertain`/PAYMENT_RESULT_UNKNOWN (also on list failure and the catch path); replayed (webhook-restored) plans report the
    unknown line as `uncertain`.
  - 24 h residual: lines carry `intent_at` (server-only, stripped from replies); `paying`/`uncertain` lines are re-asked with the same
    key only inside PAY_KEY_REPLAY_WINDOW_MS = 23 h (fallback: op.created_at); past it no pay call, `already_paid`/0 credited + Sentry
    warning (ids only). Strict replay: only a paid answer credits; 4xx (not 409/429/idempotency_error) = already_paid; else unknown.
  - C-628-12: per-transport delivery guarantee documented in dunning-v2.service.ts + dispatcher; pinning test.
- Failing-before CI run (tests only, branch ci/B-DUNNING-7-628-before @ ca1a915c): https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37141072085
- Local: heavy.sh jest test/dunning-r3-money-truth-e2e.spec.ts -> 58/58 pass with the fix.
- Failing-before result: run 37141072085 red: 7 failed in test/dunning-r3-money-truth-e2e.spec.ts (Sol probe 1, Sol probe 2, re-read+list both fail,
  409 replay, Stripe-retry attribution, past-24h window, C-628-12); controls (background reconcile, 23 h boundary, no-leak) pass both ways; 698 other suites pass.
- PR body updated (R7 section, builder-owner, residual closed). Main moved to d27cd3ec (#640) -> #628 BEHIND, merge-tree clean (operator update-branch).

## mobile #322
- Head 23435ec2 dual APPROVE, BEHIND main a7adabde by 8; `git merge-tree` against main is clean (no conflicts) -> no fix round needed;
  operator mechanical update-branch after #628 deploys (OR-112-13: merge together). R7 changes no response shape (no mobile change).

## backend #642 (Google sign-in flag) — fix round 1
- Start 85950984: Opus RC A0/B1/C0, Sol RC A0/B1/C0 (same B-642-1: merge must wait for #608 deployed; Google-only deletion dead end).
- 350616c0 merge main ec911328 (#608 deployed = production) -> diff vs main still the one manifest line; brings 11th check.
- 4fee3c02 pin test test/ci/google-signin-deletion-dependency.spec.ts (Google on => google_session re-auth passes production ValidationPipe + chain suite present; control strict pipe).
- PR body: Fix round table, Sequence step 0 (#608 deployed) + step 5 (owner device check: delete a Google-only account in-app after apply).
- Failing-before: full ci.yml run 37141277234 cancelled per operator CI lane v2; one-job lane run 37141897335 (branch ci/B-DUNNING-7-642-before on 85950984 + pin).
- 11/11 required checks pass at 4fee3c02.
- 11:01 FIX ROUND 7 posted on #628 @ 9b48d91e, 11/11 green, READY FOR AUDIT: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/628#issuecomment-5971952132
- 10:59 FIX ROUND 1 posted on #642 @ 4fee3c02, 11/11 green, READY FOR AUDIT: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/642#issuecomment-5971925848
  (failing-before ci-lane run 37141897335: 2 failed, 2 controls pass)
- #322 probe: local merge of mobile main 47124a4d into 23435ec2 is clean; ci-lane probe (tsc + dunning + ClientPackagesScreen tests) run 37142813835 on ci/B-DUNNING-7-322-mainmerge (not pushed to the PR).
- 11:05 Sol RC A0/B1/C0 @ 9b48d91e: C-628-12 closed; B-628-11 narrowed again: 401/403 (refused before execution) read as definitive -> already_paid.
  Opus no verdict yet at 9b48d91e.
- R8: 789ca84c replayPay definitive only for 402 or 400 invalid_request_error (answers produced by executing the pay); 401/403/404/409/429/5xx/
  idempotency_error/transport = unknown. 6 new tests (401/403/404 x foreground/background + later authorized recovery of 15000 cents).
  Local spec 64/64. Failing-before ci-lane run 37143230783 (ci/B-DUNNING-7-628-r8-before = 9b48d91e + tests).
  33e0696a merge main d27cd3ec (#640). Pushed; head 33e0696a.
- #642: dual APPROVE at 4fee3c02 (11/11 green) -> done for this lane; operator merges/applies (step 5 owner device check).
- #322 probe run 37142813835 (tsc + dunning + ClientPackagesScreen tests on 23435ec2 + mobile main 47124a4d): success.
- 11:20 verdicts @ 33e0696a: Sol RC 0/1/0 (B-628-11: any unreplayed 400 invalid_request_error read as definitive);
  Opus RC 0/1/2 (B-628-13 dispute marker erased by v1 recordFailure / dispute during payment cycle; C-628-14 first-call 429 credited; C-628-15 first-call 409 -> "nothing charged").
- R9 (11:40): 214bf975 + merge main d23fa317 (dc47e0ef, head):
  - B-628-11: StripeConnectApiError carries Stripe's Idempotent-Replayed header; replayPay settles already_paid only on a REPLAYED 402 / 400 invalid_request_error
    (the cached result of the key's first execution); everything else unknown. Fake marks cached errors as replayed.
  - B-628-13: v1 recordFailure never replaces the dispute marker on an active cycle; isDisputeCycleOpen + applyImmediateClear also honour an open recorded
    DunningDisputeObligation; invoice.paid with an open dispute keeps the cycle and sets the marker (keepAsDisputeCycle, CAS on active row; failure still keeps).
  - C-628-14: first-call 429 + invoice paid -> already_paid (0). C-628-15: first-call 409 -> uncertain.
  - Tests: 8 new/changed cases; local spec 70/70; dunning-v2-service 26/26. Failing-before ci-lane run 37144731263 (ci/B-DUNNING-7-628-r9-before).
- 11:58 FIX ROUND 8 posted on #628 @ dc47e0efe2270e21a00ab8d038a9e7dbb415efe9, 11/11 required checks green, READY FOR AUDIT:
  https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/628#issuecomment-5972389418
  failing-before ci-lane run 37144731263: 7 failed / 63 passed on 33e0696a sources. PR body has R8 section.
- Operator PAUSE (11:25): lane ends after this READY. Worktrees removed, ci/* branches deleted (run URLs stay valid).

## HANDOFF
| PR | Head | Verdicts at head | Checks | Next step |
|---|---|---|---|---|
| backend #628 (dunning v2) | dc47e0efe2270e21a00ab8d038a9e7dbb415efe9 | none yet (READY FOR AUDIT posted 11:58); prior: Sol RC 0/1/0 + Opus RC 0/1/2 @ 33e0696a, all folded | 11/11 pass | AUD-OPUS-MONEY-2 + AUD-SOL-MONEY-2 audit R8 (both queues already list backend#628). On RC: next builder folds findings with failing-before via ops/ci-lane/ci_lane.sh. Merges together with mobile #322 (OR-112-13). Flag FEATURE_DUNNING_V2 stays OFF. |
| backend #642 (GOOGLE_CLIENT_IDS -> github-secret) | 4fee3c0236eaa793f847a89e9393160b9f12a41c | Opus APPROVE, Sol APPROVE | 11/11 pass | Operator: merge (mechanical update-branch first; main moved, merge-tree clean), then Fly Env Sync plan/apply per PR body; owner device check step 5 (delete a Google-only account in-app). Builder never touches flags/production. |
| mobile #322 (dunning lockout + native card update) | 23435ec2c099aa5e25c8c0737d92662b73c83855 | Opus APPROVE, Sol APPROVE | 3/3 pass | BEHIND only: merge-tree with mobile main 47124a4d clean; ci-lane probe of that merge (tsc + dunning + ClientPackagesScreen tests) green (run 37142813835). Operator update-branch + merge together with #628 after #628 is approved/deployed. No contract change from #628 R7/R8. |

Operator decisions needed:
1. #628 R8 design choice (Sol may weigh in): "another collector paid" now settles one reconcile run later (needs Stripe's replayed refusal); before the 23 h window an unreplayed refusal stays `uncertain`.
2. #628 B-628-13: a payment cycle that gets a dispute stays open after the renewal is paid and becomes the dispute cycle (supersedes the PR-body residual "support handles it in v1.0").
3. Ordering: #642 merge/apply (owner device check), then #628 + #322 together.
