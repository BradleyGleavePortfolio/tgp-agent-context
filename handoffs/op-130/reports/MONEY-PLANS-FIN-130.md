# MONEY-PLANS-FIN-130 (agent 130 FINISH-130, Claude Opus 5.5) — finish CF-MONEY-PLANS-128

Status: DONE, READY POSTED (18:35 PDT 10-07). PR growth-project-mobile#534
(https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/534), branch agent129/cf-money-plans-128,
head e61ad73597f6d27493c3747fffb8e34a473e45e7 (builder commit 331a3a58 + clean merge of main 9b37c5df). CI green at the head
(Typecheck, lint, test; CodeQL). Mergeable, merge state CLEAN at 18:34. No verdicts yet (builders do not wait).
Worktree /home/user/workspace/wt/MONEY-PLANS-FIN-130-mobile. PR body: ops/reports/MONEY-PLANS-FIN-130-pr-body.md; READY comment:
ops/reports/MONEY-PLANS-FIN-130-ready.md (posted as issuecomment-6050360601).
Size: 7 files, +407 / -79 = 486 changed lines (source 162, tests 322, docs 2).

## Scope
FIX_PLANS row (section B): refund line "or through your coach" (B), trial shown when none is offered (U), raw error text (U), a renewing
plan shown twice (U). Left: merge main, PR (T3) with a before/after table, CI, READY. Job CF-MONEY-PLANS-128 = FW-MONEY-128 B-1, U-3, U-5, U-7.

## Done by this finisher
- `git merge origin/main` (9b37c5df, clean; only src/screens/client/README.md changed on main among the PR's files) -> e61ad735, pushed.
- Re-verified the backend contract on backend main 272dc8ef (read-only): trial_offer = {trial_days, available, reason} on the client list and
  detail (packages.controller.ts:258-262, :288-289; trial-usage.service.ts:374-382); Your plans and payment-status both key on
  ClientPurchase.id (subscription-plan.ts planView purchase_id: row.id; clientPaymentsApi getPaymentStatus purchase_id: chosen.id); coaches
  have no refund or cancel route for a client's plan (coach payment-ops routes are GETs + acknowledge; coach/refunds is a flag-off drop
  decision, not a refund; refunds are admin-only at payment-ops.controller.ts:552).
- Failing-first on CURRENT main 9b37c5df: 9 of 10 new tests fail with main's three source files
  (ops/reports/MONEY-PLANS-FIN-130-failing-first-on-main-9b37c5df.txt).
- Local tests at e61ad735 (heavy.sh, one file each), all green: clientPlansOnePlace128 10/10, moneyClient124 10/10,
  ClientPackagesScreen.purchase 7/7, YourPlansPanel.recovery 22/22, deliverablesScreen 46/46, coachlessGateVersionB 19/19,
  truthfulCopy.guard 20/20, quietLuxuryDoctrine 30/30, iosStorePackagePurchasePosture 10/10, iosHideNonP2PPurchases 5/5,
  scopedTokenGate 59/59, androidDigitalPurchases 11/11, packagePayment.sheet2 19/19.
- PR body: tier header (T3), What changes for coaches and clients, B/U list, before/after table, routes/actions parity table, truthful sweep.

## B list
- B-1 (from the code, seen in a test): ClientPackagesScreen fine print said a plan can be ended "through your coach" and the refund line had
  no action; a client who wants to stop paying or get a refund asks the coach, who has no tool for either. Fixed in m#534.

## U list
- U-3 trial shown when not offered (planTerms.ts offeredTrialDays); U-5 raw error text (ClientPackagesScreen error banner); U-7 renewing plan
  shown in three places (YourPlansPanel onShownPlans/renderPlanExtra + Current plan card gating). All fixed in m#534, each seen in a test.

## C
- C (edge, deferred to 10k clients): if payment-status fails while packages load, the current package shows as buyable (backend refuses a
  second live plan).

## Proposed (needs operator)
1. When coach refunds / pause / cancel reach clients (COACH-PAY-BE-FIN-130 + COACH-PAY-M-130, flag off today), the plans fine print
   ("Refunds are issued by The Growth Project team; to ask for one, email support.") must be reworded in that PR. Default: COACH-PAY-M-130
   owns the reword when its flag turns on; no change now.

## HANDOFF
- PR: growth-project-mobile#534, head e61ad73597f6d27493c3747fffb8e34a473e45e7, CI green, READY posted 18:35 PDT
  (`FIX ROUND 1 (OPENING) (MONEY-PLANS-FIN-130, agent 130) — growth-project-mobile#534 @ e61ad735... — READY FOR AUDIT`).
- Next: Opus and Sol lenses at that head. Review findings or a conflict with main go to FIX-OPUS-130 / FIX-SOL-130 (branch
  agent129/cf-money-plans-128; bring in main with `git merge origin/main`, never rebase or force-push).
- Files: src/screens/client/ClientPackagesScreen.tsx, src/components/purchase/YourPlansPanel.tsx, src/lib/planTerms.ts,
  src/screens/client/README.md (last paragraph), tests src/__tests__/clientPlansOnePlace128.test.tsx (new), moneyClient124.test.tsx,
  ClientPackagesScreen.purchase.test.tsx. Shares README.md only with m#524 (different section).
- Not an iOS-build-first PR, but it is mobile: it should merge before the 23:00 cut if the lenses approve.
- The worktree is left in place (deps symlinked via link_deps.sh); nothing uncommitted.
