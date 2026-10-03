# B-TRIALS-2 (agent 114) — backend #656 real free trials

## Status (19:07 PDT)
- Worktree: /home/user/workspace/wt/B-TRIALS-2-656 (local branch b-trials-2-656 -> pushes to agent/clinic/b-trials-backend)
- #656 had no AUDIT comments (never audited). Open items = CI red + lane scope.
- Pushed 7ad5af6a to agent/clinic/b-trials-backend: merge of origin/main 12e1b03b (653afc22, clean) + CI fixes:
  - build-and-test tsc TS7022/TS7024 in test/b-trials-notice-and-webhook.spec.ts:109 and test/b-trials-package-rules.spec.ts:51 (explicit Promise<unknown> on the tx fake)
  - CodeQL alert #121 js/incomplete-multi-character-sanitization at test/b-trials-notice-and-webhook.spec.ts:248 (replace -> split)

## 19:16 pushed e9d5a6f9 to agent/clinic/b-trials-backend
- 0c656f81: TrialCheckoutCapability (trial_offer not_offered_yet until #654 registers) + TrialUsageService.hasStarted + purchase-aware trialing entitlement; tests added (failing-before log: ops/reports/B-TRIALS-2-114-failing-before.log)
- e9d5a6f9: merge origin/main 2e3094b9 (#663 npm-audit fix)
- Local: 5 suites 107/107 (b-trials x3, checkout-webhook-handler, checkout-webhook-fee-split)
- INCIDENT NOTE: `git stash` is shared across worktrees of one clone; my `stash pop` briefly applied B-RECUR-BE's stash into my worktree (conflicted, nothing committed). I reset my worktree and dropped only my own stash by SHA; B-RECUR-BE's stash was no longer in the list afterwards (they popped it). B-RECUR-BE should confirm their worktree state.

## In progress (older notes)
- TrialCheckoutCapability (src/packages/trials/trial-checkout-capability.ts): trial_offer stays available:false / reason not_offered_yet until the #654 subscription checkout registers -> #656 safe on main before or after #654.
- Purchase-aware trialing entitlement (a started trial keeps access to its end if the card is removed) to match #654's subscriptionGrantsAccess.
- Mobile: no open PR has a real trial-days input (#321 removes the fake one; #334 is client side). Plan: one small mobile PR.

## Next command
cd /home/user/workspace/wt/B-TRIALS-2-656 && gh pr checks 656

## 19:25 mobile PR opened
- growth-project-mobile #338 (agent/clinic/b-trials-mobile-editor @ ee3da7c, base main 1f8981dd): trial presets + 1..30 input, server codes mapped. Worktree /home/user/workspace/wt/B-TRIALS-2-mob.
- Next: watch backend #656 CI at e9d5a6f9 and mobile #338 CI; then PR body update + FIX ROUND comments.

## 19:36
- #656 @ e9d5a6f9: CodeQL, CodeQL JS/TS, R75, Schema parity, migrations forward, npm audit, danger, community-live pass; build-and-test / rls / mwb / sbom pending (runner queue). PR body updated (merge order, integration recipe, Fix round 2).
- mobile #338: paymentsApi.test.ts asserted the old contract (trial_days undefined) -> updated, pushed 0db1786.
- Watching #608 (erasure manifest) and #641 (same package files) per operator.

## 19:45 pushed c3f9c949: merged origin/main ec911328 (#608) + manifest entries (PackageTrialNotice.client_user_id, PackageTrialUsage.client_user_id/coach_user_id = delete). test/account-deletion/ + b-trials: 15 suites 191/191.

## 19:58 mobile #338 READY FOR AUDIT @ 0db17866 (all 3 required checks green), FIX ROUND 1 comment posted. Backend #656 @ c3f9c949: build-and-test + community-live pending.

## 20:00 #656 READY FOR AUDIT @ c3f9c949 (11/11 required green), FIX ROUND 2 comment posted (issuecomment-5964844103).
## Next: #641 (operator re-task) — read Sol issuecomment-5964824477 at fb29fb9e.

## 20:20 #641 (re-tasked by operator 19:54): B-641-7 fixed, commit 4eb0b1ff + merge main ec911328 = 0d3d04de pushed to agent/clinic/s-coach-money-be. New test test/refund-reversal-once.spec.ts 7 tests (failing-before 5/7: race 4802 vs 2401; log ops/reports/B-TRIALS-2-114-641-failing-before.log). Related suites 9/9, 193 tests. No schema change in #641 -> no #608 manifest entries. Next: CI watch, FIX ROUND 4 comment, #641/#656 overlap.

## 20:35 overlap #641/#656: #656 commit 34fe493d moves create-trial validation into assertValidPricing and moves trial_days lines away from #641 hunks -> git merge-tree #656 x #641 now CLEAN both directions. Combined tree d4c639c3 (local only, wt/B-TRIALS-2-combo): 9 suites 139/139 incl. ad-hoc combo spec (ops/reports/B-TRIALS-2-114-combo-641x656.spec.ts) proving Idempotency-Key create applies trial rules. #656 b-trials+packages suites 6/157 pass.

## 20:45 #641 body updated (tier header + Fix round 4 table). #656 body updated (overlap row). #656 head 079e9e39 CI running; #641 head 0d3d04de build-and-test pending. Next: when green post FIX ROUND 3 on #656 (overlap) and FIX ROUND 4 on #641, both READY FOR AUDIT; then remove worktrees B-TRIALS-2-656, -641, -combo, -mob.

## 20:55 #641 FIX ROUND 4 posted @ 0d3d04de (11/11 green), READY FOR AUDIT (issuecomment-5965012591). #627: SKIPPED for budget -> NEEDS FIX ROUND #627 B-627-9 narrowed. Waiting #656 build-and-test at 079e9e39.

## 21:05 #656 FIX ROUND 3 posted @ 079e9e39 (11/11 green), READY FOR AUDIT (issuecomment-5965042284).

## HANDOFF
- backend #656 (agent/clinic/b-trials-backend) @ 079e9e39119ba8ac875822979789c4b794310965 — READY FOR AUDIT (FIX ROUND 2 issuecomment-5964844103, FIX ROUND 3 issuecomment-5965042284). 11/11 required checks green, CodeQL fixed for real (alert at notice spec:248, not dismissed). #608 erasure manifest entries added (PackageTrialNotice.client_user_id, PackageTrialUsage.client_user_id/coach_user_id = delete). Merge order in body: #627 -> #654 -> #656 -> mobile #338; #654/#656 either order safe (TrialCheckoutCapability; recipe in body).
- backend #641 (agent/clinic/s-coach-money-be) @ 0d3d04de625f86cce0f1b5bb9059549323ebed51 — READY FOR AUDIT (FIX ROUND 4 issuecomment-5965012591). B-641-7 closed: claimed ledger reversal in one tx, refund-scoped head-coach reversal key + claimed local record, 15-min retry sweep (23 h window). 11/11 green.
- #641 x #656 overlap: resolved on #656; merge-tree clean either order; compose spec runs once both on main.
- mobile #338 (agent/clinic/b-trials-mobile-editor) @ 0db17866cab371552aa11139185d9c6f9b652239 — READY FOR AUDIT (FIX ROUND 1). 3/3 checks green. Merge after #656 deploys. Overlaps #321/#329 on CoachPackageEditScreen (text only).
- #627: NEEDS FIX ROUND #627 B-627-9 narrowed (not started; budget).
- Known C (documented, not closed): card removed mid-trial -> purchases[].trial.will_charge still true and no trial-ending notice (needs card state on ClientPurchase). Refund transfer reversal still owed after 23 h -> operator check in Stripe (logged).
- Incident: shared `git stash` across worktrees (see 19:xx entry); B-RECUR-BE should confirm its worktree.
- Evidence: ops/reports/B-TRIALS-2-114-failing-before.log, -mobile-failing-before.log, -641-failing-before.log, -641-before-variant.spec.ts, -combo-641x656.spec.ts.
- Worktrees removed: wt/B-TRIALS-2-656, -641, -combo, -mob.
