# CF-MONEY-PLANS-128 (agent 129 CLIENTFIX, Claude Opus 5.5) — FW-MONEY-128:MONEY-PLANS-128

Status: IN PROGRESS (16:26 PDT 10-07). Branch agent129/cf-money-plans-128, worktree /home/user/workspace/wt/CF-MONEY-PLANS-128-mobile,
based on mobile main a1be6fb2. No push yet.
Job: B-1 (refund line + support action), U-3 (trial_offer), U-5 (plain error), U-7 (one plan, one place) on ClientPackagesScreen.

## Scope traced
- main ClientPackagesScreen.tsx (m#499 + m#517 merged), YourPlansPanel.tsx, clientPaymentsApi.ts, planTerms.ts; backend RO c3324d4a
  packages.controller.ts:248-289 (trial_offer per client), trial-usage.service.ts:69-83/377-386, subscription-checkout.service.ts:358 (Your
  plans = renewing subscriptions only), coach-money + payment-ops coach routes (read-only: no coach cancel or refund).
- Open PRs touching my files: none (only src/screens/client/README.md lines 17-60 by others; my README edit is after line 183).

## Plan (decided)
- B-1: m#517 already fixed the coach-refund claim; remaining: one-tap "Email support" (subject "Refund request") + fallback, and drop
  "or through your coach" (no coach tool ends a client's plan).
- U-3: purchasableFromCoachPackage honours trial_offer.available (rows without trial_offer unchanged).
- U-5: banner shows plain copy, never the transport text (API keeps raw text for logs, as getPurchaseDrops documents).
- U-7: YourPlansPanel reports shown purchase ids + renders "View what's included" on the matching card; Current plan card only when the plan
  is not in Your plans (one-time/comp, or Your plans failed); "Current" pill removed (disabled "Current plan" button stays).

## HANDOFF
Writing tests (src/__tests__/clientPlansOnePlace128.test.tsx) then code. Nothing pushed.

## Status at stop (16:37 PDT, operator STOP)
- Done: code + tests committed and pushed to agent129/cf-money-plans-128 @ 331a3a58e7379f156744fb1cb8cd722ef6ea6689 (base mobile main a1be6fb2, 7 files, about 490 changed lines incl. new 276-line test).
- Targeted tests passed locally (heavy.sh, one file each): clientPlansOnePlace128 10/10 (failing-first on main: 9 of 10 failed, list in ops/reports/CF-MONEY-PLANS-128-failing-first-on-main.txt), moneyClient124 10/10, ClientPackagesScreen.purchase 7/7, YourPlansPanel.recovery 22/22, deliverablesScreen 46/46, coachlessGateVersionB 19/19, truthfulCopy.guard 20/20, quietLuxuryDoctrine 30/30.
- B=1 (B-1 refund line + Email support) U=3 (U-3 trial_offer, U-5 plain error, U-7 one place). No PR opened, no CI, no READY, no verdicts.

## HANDOFF
- Branch agent129/cf-money-plans-128, exact head 331a3a58e7379f156744fb1cb8cd722ef6ea6689 (pushed, no PR).
- Done: B-1, U-3, U-5, U-7 with failing-first + parity test (src/__tests__/clientPlansOnePlace128.test.tsx); README paragraph after "Failed payments" in src/screens/client/README.md.
- Left: git merge origin/main (main moved), open PR (T3 tier header, parity table Routes/actions before -> after: Current pill removed, View what's included moved onto the Your plans card for renewing plans, Email support added; diff minimal, based on main), wait CI green, post READY comment.
- C (edge, deferred to 10k clients): if payment-status fails while packages load, the current package shows as buyable (backend refuses a second live plan).
