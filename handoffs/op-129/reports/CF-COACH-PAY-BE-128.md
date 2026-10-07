# CF-COACH-PAY-BE-128 (Claude Opus, BUILDER, T4 money, agent 129) — coach payments per client: list, refund, pause/resume, cancel

Status: STOPPED by operator at 16:36 PDT (credits). Branch pushed, NO PR opened, CI not run, no verdicts.
Branch agent129/cf-coach-pay-be-128 @ 001f6b21dd3d0088f7805e52e606982241c19b94 (remote 001f6b21dd3d0088f7805e52e606982241c19b94), based on backend main fd190078. Diff:  12 files changed, 790 insertions(+), 2 deletions(-). Author/committer: Bradley Gleave <bradley@bradleytgpcoaching.com> / Bradley Gleave <bradley@bradleytgpcoaching.com>.

## Scope traced
- Admin refund POST /v1/admin/payments/purchases/:id/refund -> RefundDisputeHandlerService.createAdminRefund (refund-dispute-handler.service.ts:2427): platform-account refund, legacy destination charges reverse_transfer + refund_application_fee, S-FEE charges recovered under the charge lock, full refund of a recurring charge ends access and pauses billing (owner decision 7), coach alert.
- Client cancel ClientBillingService.cancelPlan (client-billing.service.ts:1454): option A period end, 2A in dunning (voids open invoices, ends now).
- Stripe pause/resume: pauseSubscriptionCollection / resumeSubscriptionCollection (pause_collection behavior=void; client keeps access, nothing charged while paused).
- Refund/dispute pause restart stays on the existing POST /v1/coach/purchases/:id/dispute-restart (seller coach only).
- Open PR b#855 files (fly-env-desired-state.json, launch-flags.md, r11-seams spec) not touched; b#857 merged into main fd190078.

## What the branch contains
- New: src/checkout/coach-payment-actions.feature.ts (FEATURE_COACH_PAYMENT_ACTIONS, only "true"; guard 404 when off), coach-client-payments.controller.ts, coach-client-payments.service.ts, test/coach-client-payments.spec.ts (8 tests).
- Routes /v1/coach/clients/:clientId/payments: GET (plans[] with payments[], refundable_cents, billing, actions{refund,pause,resume,cancel,restart}); POST :purchaseId/refund {idempotency_key uuid, amount_cents?, charge_id?, reason?, note?} -> {refund, plan}; POST :purchaseId/pause|resume|cancel {idempotency_key} -> {plan} (cancel adds outcome, access_ends_at, voided_invoice_count, voided_amount_cents, message). Guards: flag, JwtAuthGuard, CoachOrOwnerGuard, NoActiveSubCoachGuard, @Roles(coach, owner); scope = seller coach or the seller's head coach (FeePolicyService.resolveHeadCoachId), else 404 PLAN_NOT_FOUND. Stripe keys tgp-coach-refund|pause|resume-<purchase>-<key>. Audit rows coach_payments.refund_issued|billing_paused|billing_resumed|plan_canceled.
- Edited: createAdminRefund gains optional charge_id + idempotency_key (admin callers unchanged; failing-first case added to test/money-refund-124.spec.ts); checkout.module.ts registration; /me/feature-flags key coach_payment_actions (coach/owner only) + the two existing flag specs; ENV_RULES entry (no closed set, so not in the fly manifest).
- Local: test/coach-client-payments.spec.ts, test/money-refund-124.spec.ts, src/feature-flags specs = 43/43 pass via heavy.sh. Type-check NOT verified (ts-jest is transpile-only; a targeted tsc attempt failed on config, not on code).

## B list
- B-1: a coach cannot refund, pause, resume or cancel a client's payment (refunds were admin-only at payment-ops.controller.ts:552). Built on the branch, not yet in a PR.

## U list
(none)

## C one-liners
- C (edge, deferred to 10k clients): cross-currency settlements are shown but not coach-refundable (admin route remains).
- C (edge, deferred to 10k clients): ChargeRefund.currency defaults to usd on admin-created rows; the coach response uses the payment currency.

## PRs
(none; branch only)

## Not fixed (needs operator)
- Open the PR from agent129/cf-coach-pay-be-128 (body: tier header T4 money, endpoint/guard/shape docs above, minimal diff based on main, b#855 untouched), let CI prove tsc/lint, then READY. Owner defaults to confirm: owner role scoped like a coach; active sub-coaches blocked (head coach acts); pause keeps client access; a full refund ends access and pauses billing.

## HANDOFF
- Branch agent129/cf-coach-pay-be-128, head 001f6b21dd3d0088f7805e52e606982241c19b94 (pushed), worktree /home/user/workspace/wt/CF-COACH-PAY-BE-128-backend.
- Done: all code + tests for list/refund/pause/resume/cancel behind FEATURE_COACH_PAYMENT_ACTIONS (default off); targeted specs 43/43 green locally;  12 files changed, 790 insertions(+), 2 deletions(-) (under 800).
- Left: gh pr create with the documented body, CI (tsc unverified locally), READY comment, verdicts. No PR exists yet.
