# B-RECUR-3 (agent 115) — backend#654 + mobile#334 paired fix round

Lane: native Stripe subscriptions + free trials through the PaymentSheet (backend#654) and the renewing-plans
sheet (mobile#334). Rulings applied: recurring via native PaymentSheet (default_incomplete, first-invoice PI),
trials 0–30 days coach-set with card up front, one per client per coach; OR-112-13 (#654/#334 merge together;
#334 after #654 and #628 deployed); OR-112-22 (Day 1 sheet payment failure = launch blocker).

## Backend #654 — fix round 2 (agent 115)

Start head: 795110b717b1554045d13bf596eeacb0c38f19c6 (Sol REQUEST_CHANGES comment 5965039762; Opus owes a FULL audit).

| Finding | Change | Commit | Test |
|---|---|---|---|
| B-654-1 (narrowed) transient lookup acked | `attachNativeTrialCard` lookup failure -> `{purchaseId:null, ok:false}` -> handle throws, outer tx rolls back, Stripe redelivers | 317301b5 | test/b-recur-3-fix-round-2.spec.ts "the lookup rejects once -> handle throws" |
| B-654-5 dropped reservation -> idempotency_error | `checkout_terms` snapshot pinned before create (migration 20270311000000, no user ids); retry resends identical request; bind before ephemeral key; uncertain -> retry marker, definitive -> expired; idempotency_error -> customer list by metadata.tgp_purchase_id; stale in-flight takeover (120 s) | 317301b5 | 5 "(failed before)" B-654-5 cases + controls |
| B-654-6 zero-due/no-PI first invoice canceled | `finishBound` classification: paid/processing/default-card trial -> kept, `mode:'none'`; ended -> expired; only stuck -> canceled | 317301b5 | 4 "(failed before)" B-654-6 cases + control |
| B-654-7 old intent relabelled with new terms | replay answers pinned terms; terms no longer offered -> retire (cancel unpaid only after a Stripe read; paid -> ALREADY_ACTIVE; unreadable -> retryable) -> `SUBSCRIPTION_ATTEMPT_EXPIRED` `reason: terms_changed` (allowlisted) | 317301b5 | 2 "(failed before)" B-654-7 cases + 4 controls |
| B-334-3 backend support | GET /subscriptions/:id `checkout_state` (awaiting_payment / awaiting_card / processing / paid / card_saved / ended / unknown / null) | 317301b5 | 3 cases in B-334-3 support block |

Failing-before: test-only commit 76f6f1c3 on `ci/B-RECUR-3-654-before`, one-job CI lane run
https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37141915116 — red, 22 failed / 35 passed
(the earlier full ci.yml dispatch 37141610481 was canceled per CI lane v2).
Checklist (a) hardening: c90c0d75 (test) on `ci/B-RECUR-3-654-before-log`, run
https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37142933011 — red; fix 02c48de7
(`errorLabel(err)`: four new log lines carried caught error messages; now code/type only).
PR head now 02c48de710f9f69bfc985336eb14249663bbb638. FIX ROUND 2 comment:
https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/654#issuecomment-5971989117 ; body updated
(tier header, pre-deploy setup_intent.succeeded, migration 20270311000000, #656 either order, #628 helper unification).
Local: `heavy.sh npx jest --runInBand --ci test/b-recur-3-fix-round-2.spec.ts` -> 28/28 pass at the fix (before the split
of the unit tests into test/b-recur-3-subscription-terms.spec.ts).

## Mobile #334 — fix round 3 (agent 115)

Start head 0629d50601618af7a51d0f92c4bbf828001dba7a. Commits: 37271f9 (merge main), d8360e0 (tests), b82a821 (fix),
04104c2e (merge main 47124a4d). Head 04104c2eb722e721101226e057a0701c84fe15ed.

| Finding | Change | Commit | Test |
|---|---|---|---|
| B-334-3 unclear sheet result reported as no charge | `uncertain` outcome; subscription `settleUncertain` reads `checkout_state`; one-time reads purchases; outcome-unknown copy + Check again + support; proven no-charge only on awaiting_* | b82a821 | recur3 spec, 8 "(failed before)" + decline control + unmount race |
| B-334-4 terms not reconciled before a chargeable sheet | `reconcileIntentTerms` -> terms review (same key), `expected_one_time_cents` sent, `resolvePriceChange` adopts all terms, 0 trial stays 0 | b82a821 | recur3 spec, 6 "(failed before)"; subscription spec body keys |
| #654 r2 contract | `mode:'none'`, `checkout_state`, `reason: terms_changed` | b82a821 | recur3 "mode none", "terms_changed twice" |
| C-334-2 | carried (#322 open): second to merge keeps #322's native Update card screen | — | — |

Failing-before: one-job CI lane run https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37142521981
— red, 18 failed / 35 passed. Local after: recur3 18/18, subscription 35/35, payment 22/22 (one spec per run).
FIX ROUND 3 comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/334#issuecomment-5972001618

## Log
- 10:44 PDT pushed 317301b5 to agent/clinic/b-recur-subscriptions; before-run 37141610481 dispatched.
- 10:57 canceled 37141610481 (CI lane v2); before-run via ci_lane.sh 37141915116 (red as expected).
- 11:05 mobile d8360e0 before-run 37142521981 (red); pushed b82a821, then merged main -> 04104c2e.
- 11:12 backend checklist (a) hardening: c90c0d75 + 02c48de7 pushed; canceled superseded PR run 37141640279.
- 11:15 FIX ROUND comments posted on both PRs; bodies updated (READY FOR AUDIT pending green).
- 11:17 mobile CI Typecheck red (test helper type only) -> 78ba9bc9; Sol APPROVE #334 @ 78ba9bc9 (A0/B0/C2: C-334-2 carried, C-334-3 optional).
- 11:20 C-334-3 (cheap C): test 0761ca4, before-run https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37143805691 (red), fix d466fd15 pushed; 3/3 checks green. FIX ROUND 4 comment NOT posted (operator PAUSE 11:25: "#334 waits").
- 11:28 #654 build-and-test: first attempt Jest worker heap crash in unrelated test/scout/induction/contract.spec.ts (720/721 suites, 12,430 tests passed); rerun --failed -> green. Heap check: --logHeapUsage fix-round-2 spec 1449 MB vs existing b-recur-subscription-checkout 1406 MB; only new import is type-only (erased). No memory limit changed.
- 11:30 #654 READY FOR AUDIT at 02c48de7 (FIX ROUND 2 comment edited + body). Opus APPROVE @ 02c48de7 (A0/B0/C3).
- 11:32 PAUSE: ended the lane; ci/* branches deleted; worktrees removed.

## HANDOFF

State at 11:32 PDT (operator PAUSE). Both PRs are pushed and clean; no local-only work.

| PR | Exact head | Checks | Verdicts | Next step |
|---|---|---|---|---|
| backend#654 (base `agent/clinic/s-fee-coach-net`, #627) | 02c48de710f9f69bfc985336eb14249663bbb638 | all 12 running checks green (build-and-test green on rerun); CodeQL / Banned cast tokens / danger / build-sbom run only after the retarget to main | Opus APPROVE @ 02c48de7 (A0/B0/C3); Sol lens now AUD-SOL-MONEY-2, verdict pending (operator: draft had 0/3/0 with 4 acceptance failures) | Next round (when un-paused), with failing-before tests: (1) **TTL resend** = Sol draft + Opus C-654-8: a retry-marked attempt older than ~23 h (Stripe idempotency window) must not resend the create; look up by `metadata.tgp_purchase_id`, bind if found, else expire. (2) **Error label** = Sol draft + Opus C-654-10: `errorLabel` must not log an arbitrary `name` or `code`; allowlist the Stripe `type` values or HTTP status, else a fixed `error`. (3) **Retire with unknown cancel** (Sol draft): if `cancelQuietly` fails in `retireAttempt` / `tryReuse`, keep the row `pending` and answer retryable; never mark it expired while Stripe may still hold a payable subscription. Sol's probe spec is `test/aud-sol-money-115-654-replay.spec.ts` @ 79bded6b (in the shared object store), run https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37143128666. C-654-9 (mobile must accept `mode:'none'`) is already closed by #334 round 3. After #627 merges and the operator retargets to main: merge origin/main (merge commit) and resolve. |
| mobile#334 | d466fd1522182f040c9b341e51947e57b62cdca8 | 3/3 green (Typecheck, lint, test / Analyze js-ts / Analyze actions); merge state BEHIND main (merge-only) | Sol APPROVE @ 78ba9bc9 (A0/B0/C2); Opus (AUD-OPUS-MOB-PAY) not yet audited round 3 | Post the **FIX ROUND 4** comment for C-334-3 (test 0761ca4, red run https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37143805691, fix d466fd15: `pollPlan` re-checks mount and attempt after each read) with READY FOR AUDIT at d466fd15. Sol: short delta check 78ba9bc9..d466fd15. Opus: full round-3 audit. C-334-2 is carried (#322 still open: whichever merges second keeps #322's native Update card screen). OR-112-13: merges only after #654 and #628 are deployed. |

Operator decisions needed:
- un-pause #654 for the 3-finding round (TTL resend, error label, retire with unknown cancel), or accept them as C;
- whether to post the #334 FIX ROUND 4 / READY now (the code is pushed and green);
- the #654 retarget to main after #627 merges (the required checks that run only on main then need a pass);
- the platform Stripe webhook must include `setup_intent.succeeded` before deploy (pre-deploy note in the #654 body).

Cleanup done: ci/B-RECUR-3-654-before, ci/B-RECUR-3-654-before-log, ci/B-RECUR-3-334-before, ci/B-RECUR-3-334-before-c3 deleted (run URLs stay valid); node_modules unlinked; worktrees /home/user/workspace/wt/B-RECUR-3-be and /home/user/workspace/wt/B-RECUR-3-mob removed. To resume: `git worktree add` the PR branches (`agent/clinic/b-recur-subscriptions`, `fix/package-sheet-payment-intent`) and run link_deps.sh. Inputs and drafts: /home/user/workspace/ops/brecur3-115/.

