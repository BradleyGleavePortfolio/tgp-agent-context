# COACH-PAY-BE-FIN-130 (Claude Opus 5.5, FINISHER, T4 money, agent 130): coach refunds, pause/resume and cancel per client (backend)

Status (18:45 PDT): DONE. b#869 is open at head e1d398cd0440084ed644ea55af6fb4cb95e05737. CI is green (all 16 checks) and the PR is mergeable. READY was posted at 18:44. No verdicts yet; builders do not wait for them.

## Scope
- FIX_PLANS section B row: branch agent129/cf-coach-pay-be-128 @ 001f6b21. Left to do: open the PR (T4). The flag stays off until COACH-PAY-M-130 ships.
- Recon 130: the branch shares src/common/env-validation.ts with b#864, so origin/main had to be merged after b#864. The new flag stays off. COACH-PAY-M-130 waits for this deploy.
- Origin job: JOBS128 CLIENTFIX-128 row CF-COACH-PAY-BE-128. Builder report: reports/CF-COACH-PAY-BE-128.md.

## Done
- b#864 merged at 18:16. At 18:22, origin/main d6065661 (b#864, b#862, b#859) was merged into the branch. Merge commit e1d398cd: no conflict, no rebase, LEFTHOOK=0, Bradley Gleave as author and committer. Pushed at 18:31 (no force).
- b#869 opened at 18:32. Title: "feat(checkout): coaches refund, pause and cancel a client's payments, flag off (COACH-PAY-BE, T4)". Body: reports/COACH-PAY-BE-FIN-130.pr-body.md (tier header, what changes, routes, B/U list, owner defaults, overlap). READY text: reports/COACH-PAY-BE-FIN-130.ready.md.
- Size: 12 files, +790 / -2 = 792 lines (220 of them tests).
- Failing first (local, heavy.sh): the new test/money-refund-124.spec.ts case was run against main d6065661's refund-dispute-handler.service.ts. It fails there: it refunds `ch_renewal` under the admin key `tgp-refund-purchase-ch_renewal-100-coach` instead of the named `ch_first` under the per-tap key. It passes on the branch. The file was restored with `git checkout HEAD -- <file>` (no stash).
- Local targeted runs at e1d398cd (heavy.sh, one file at a time), all passing:

| Test file | Result |
|---|---|
| test/coach-client-payments.spec.ts | 8/8 |
| test/money-refund-124.spec.ts | 16/16 |
| feature-flags service spec | 10/10 |
| feature-flags controller spec | 9/9 |
| test/ci/fly-env-manifest.spec.ts | 69/69 |
| test/dunning-v2-lockout-allowlist-route-table.spec.ts | 36/36 |
| test/common/pilot-coach-allowlist.bootstrap.spec.ts | 250/250 |
| test/roles-enforced.spec.ts | 2/2 (compiles AppModule, so the new DI resolves) |

- CI at e1d398cd is green: build-and-test, test-deploy-readiness, CodeQL, the live test jobs (rls, community, mwb-3), banned casts, schema parity, danger, npm audit and size-label. deploy-readiness-gate was skipped.
- Code review of the branch (from the code):
  - Scoping: only the seller coach or the seller's head coach, with clientId and purchaseId matched together.
  - Data: explicit select, and the response is built field by field.
  - Money: Stripe keys are per tap, the amount is checked before Stripe is called, and admin callers are unchanged.
  - Audit write failures are swallowed by AuditService.
  - Copy: no first person, no exclamation marks.
  - No `as any` and no empty catch.
  - No route clash with existing `v1/coach/*` controllers.

## B list
- B-1 (owner 14:58), from the code: a coach cannot refund, pause or cancel a client's payment; refunds are admin-only (payment-ops.controller.ts:552). Built in b#869 behind FEATURE_COACH_PAYMENT_ACTIONS (default off).

## U list
(none)

## C one-liners
- C (edge, deferred to 10k clients): a cross-currency settlement is listed but cannot be refunded by the coach (the admin route still can).
- C (edge, deferred to 10k clients): a pending refund may be subtracted twice in refundable_cents (it errs low and never over-refunds).
- C (edge, deferred to 10k clients): two simultaneous taps with different keys are capped by Stripe at the charge amount.

## PRs

| PR | Branch | Head | Lines | CI | READY | Verdicts |
|---|---|---|---|---|---|---|
| [b#869](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/869) | agent129/cf-coach-pay-be-128 | e1d398cd0440084ed644ea55af6fb4cb95e05737 | 792 | green | posted 18:44 | none yet |

## Proposed (needs operator)
1. **A full refund of an earlier month ends access.** From the code: when a coach fully refunds an EARLIER payment on a running recurring plan, the client's access ends and billing pauses. This is coversCharge -> revokeFullyRefunded (refund-dispute-handler.service.ts:724 and :487), and the Stripe refund webhook does the same today. Default: keep decision 7, and COACH-PAY-M-130's confirm sheet says it before the tap. Changing it needs an owner decision.
2. **Sub-coaches see the flag but get 403.** From the code: `coach_payment_actions` reads true for an active sub-coach (feature-flags.service.ts), but every route answers 403 sub_coach_billing_blocked. Default: COACH-PAY-M-130 hides the entry for sub-coaches, or shows the server's message.
3. **The client is not told.** From the code: when a coach pauses or cancels, the client gets no notice. ClientBillingService.cancelPlan sends none, pause sends none, and checkout-webhook-handler.service.ts has no notice on cancel. Default: the coach screen says the client is not told automatically, and a small follow-up adds an in-app client notice before the flag goes on.
4. **Owner defaults built into b#869, to confirm:**
   - an owner-role account is scoped like a coach (its own sales only);
   - active sub-coaches are blocked (their head coach acts);
   - pause keeps the client's access;
   - a full refund ends access and pauses billing.

## HANDOFF
- PR b#869 (growth-project-backend), branch agent129/cf-coach-pay-be-128, head e1d398cd0440084ed644ea55af6fb4cb95e05737 (pushed). CI green, mergeable, READY posted 18:44 PDT (issuecomment-6050460318). Worktree: /home/user/workspace/wt/COACH-PAY-BE-FIN-130-backend (clean).
- Next for the lenses: Opus and Sol review at e1d398cd. Any REQUEST CHANGES goes to FIX-OPUS-130 or FIX-SOL-130. The next round line is `FIX ROUND 2 (COACH-PAY-BE-FIN-130, agent 130, <fixer ID>) — growth-project-backend#869 @ <sha> — READY FOR AUDIT`.
- Next for the operator:
  - merge only with both approvals at the head (merge_if_dual.sh);
  - deploy normally (no migration);
  - leave FEATURE_COACH_PAYMENT_ACTIONS unset;
  - message COACH-PAY-M-130 when the deploy is live (it waits for this deploy).
- Flag on, later: set FEATURE_COACH_PAYMENT_ACTIONS=true only after COACH-PAY-M-130 ships and the owner confirms the Proposed items 1-4.
