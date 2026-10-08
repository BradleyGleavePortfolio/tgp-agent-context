# FOOD-GATE-RETRY-130 (Claude Opus 5.5, BUILDER, T4 mobile): paywall retry on weak signal

Status: DONE 18:57 PDT 10-07 (started 18:16). READY posted on growth-project-mobile#541 at the head below; builder ends here
(not waiting for verdicts, _COMMON_130 item 7). B=1, U=1, both fixed in the PR.
Operator: agent 130. Branch agent130/food-gate-retry-130, worktree /home/user/workspace/wt/FOOD-GATE-RETRY-130-mobile.
Sources: FIX_PLANS_130_131.md entry 2 (FOOD-GATE-RETRY-130); AUD-FIN-FOOD-129 B2 and G1; JOBS130 recon row ("files match main
(PaywallSheet COACHLESS_* at :45-47). iOS build PR.").

## PR
| PR | head | lines | CI | READY | verdicts |
|---|---|---:|---|---|---|
| growth-project-mobile#541 | c1066f16eb5d144bd3e5bca68e3946edcb4b6c79 | 328 (+309/-19; 244 tests, 64 code, 20 docs), 9 files | green (Typecheck, lint, test; CodeQL; Analyze x2) | posted 18:57 (comment 6050591932) | none yet |

- Title: "fix(entitlements): a failed access check says so and offers Try again (FOOD-GATE-RETRY-130, T4)".
- Base: mobile main 9b37c5df. At 18:56 GitHub reported mergeable/clean against main cbc0f463 (m#533 health strings and m#534
  money plans merged after my base). A local `merge --no-commit origin/main` (aborted afterwards) passed
  coachlessGateVersionB 19/19 and ClientPackagesScreen.purchase 7/7. No other open PR or agent130/* branch touches these files
  (checked 18:43).
- One commit, author/committer Bradley Gleave <bradley@bradleytgpcoaching.com>, no co-author trailer.
- PR body: reports/FOOD-GATE-RETRY-130-evidence/pr_body.md. READY text: reports/FOOD-GATE-RETRY-130-evidence/ready_comment.md.

## Scope traced
- `src/entitlements/EntitlementProvider.tsx:89-112`: a failed `getEntitlement` (`reason: 'error'` or `'not_configured'`) sets
  `unavailable`. Re-checks happen at sign-in, on app foreground (`:141-151`), and from CoachCodeSheet, ClientPackagesScreen,
  PackageCheckoutScreen and PackageSelectionSheet after a join or a purchase.
- `src/entitlements/ProtectedScreen.tsx` (main): `unavailable` fell through to the coach-managed/coachless gate (hidden iOS or
  coachless) or to "Choose a Plan" (Android). It had no retry control.
- The gate wraps 16 client routes (`src/navigation/ClientNavigator.tsx:160-185`): Workout, ActiveWorkout, WorkoutHistoryEdit,
  ClientWorkoutViewer, WorkoutAssignmentDetail, Plan, ClientDailyMealPlan, Fasting, Log (Food), ClientMacros, Community,
  AIGuide, ClientUpcomingSessions, CalendarHome, CalendarBook, CalendarSession. Messages is not wrapped.
- `COACHLESS_TITLE/BODY/CTA` (`PaywallSheet.tsx:45-47` on main) are shared by ProtectedScreen, the coachless PaywallSheet
  and the ClientPackagesScreen coachless gate.
- Constraints kept: `iosStorePackagePurchasePosture.test.tsx:73-76` pins the literal
  `entitlementActive !== true && (nonP2PPurchasesHidden() || noCoach)` and the `if (hidden) { return (<CoachManagedAccessSheet`
  shape. Both are unchanged.

## B list
- B1 (AUD-FIN-FOOD-129 B2, seen in a test): on weak signal, a paying client's first access check fails. Food then says
  "Choose a Plan" (Android) or "Your coach manages your access" (iOS) with no retry, so no food can be logged until the app is
  reopened.
  - FIXED in m#541: new `status === 'unavailable'` branch in `ProtectedScreen.tsx`, after the confirmed-active exception and
    the spinner. It shows "Your access could not be checked" / "Check the connection, then try again." with Try again
    (`refreshEntitlement`). Still fail-closed.
  - Failing-first: `src/__tests__/foodGateRetry.test.tsx` failed 10/10 on main 9b37c5df and passes 10/10 at c1066f16.
    Evidence: reports/FOOD-GATE-RETRY-130-evidence/jest_failfirst_main_9b37c5df.txt.

## U list
- U1 (AUD-FIN-FOOD-129 G1, seen in a test): the coachless gate said "Join a coach to start logging. Enter the code your coach
  gave you." Joining alone starts logging only when the code includes a plan, and a coachless client may have no coach or
  code yet.
  - FIXED in m#541: "Logging comes with coaching" / "Join a coach with their code. Each coach sets up what their coaching
    includes." The CTA "Enter a coach code" and the code sheet path are unchanged.

## C one-liners
- C (edge, deferred to 10k clients): a `not_configured` (501) check failure also says "Check the connection"; production
  payments are configured.
- C (edge, deferred to 10k clients): the API timeout is 30 s (`src/services/api.ts:123`), so on very weak signal the spinner
  can show for up to 30 s before Try again appears.
- C (edge, deferred to 10k clients): a very fast double tap on Try again can start two checks; the last answer wins.

## Decisions taken (defaults; operator may overrule)
1. "Nothing is confirmed" means no confirmed-active answer in this session (TRAIN-GATE-128 `confirmedActive`).
   - A failed check after an earlier "no plan" answer also says "could not be checked", not "Choose a Plan". The old answer
     may be stale, for example right after a purchase. This is tested.
   - Because of this, the `gateShown` helper in m#521's `entitlementGateKeepsWorkout.test.tsx` now counts the new state as
     closed.
2. Coachless copy vs the owner's Version B pick (10-07 09:31). Version B's structure is kept: the coachless gate, one action
   (Enter a coach code) and the same code sheet.
   - The title and body wording changed, per FIX_PLANS and the honest-copy rule (owner 10:35).
   - The wording avoids plan, package, price and purchase words, because the same lines show on all 16 gated routes and on
     hidden iOS builds (App Review 3.1.1).
   - Revert = 2 constants in PaywallSheet.tsx and 2 literals in coachlessGateVersionB.test.tsx.

## Proposed (needs operator)
- P1, owner-copy awareness (default: ship as is). The coachless gate wording is the owner's Version B text, reworded for
  truth. If the owner wants the exact Version B strings back, revert per decision 2. This is a one-line change and needs no
  other change.
- P2, C, from the code (default: leave for launch). The Android "Choose a Plan" / "View Plans" labels in
  `ProtectedScreen.tsx` are title case (sentence-case rule), and that button's radius is 8. Several tests and the posture
  regex pin these labels, so this was left untouched.

## Local runs (one file at a time through ops/heavy.sh, at the c1066f16 content)
foodGateRetry 10/10; protectedScreenFailClosed 6/6; entitlementGateKeepsWorkout 5/5; coachlessGateVersionB 19/19;
entitlementProvider 3/3; iosStorePackagePurchasePosture 10/10; iosCoachManagedPaywall 6/6; copyVoice.guard 8/8;
quietLuxuryDoctrine 30/30; CoachlessEntitlement 1/1; iosHideNonP2PPurchases 5/5; paywallSheet 6/6;
androidDigitalPurchases 11/11; truthfulCopy.guard 20/20. Targeted tsc (changed files and their import graph, temporary
config /tmp/tsconfig.fgr130.json outside the repo) and targeted eslint: clean.

## HANDOFF
- State: m#541 open at c1066f16eb5d144bd3e5bca68e3946edcb4b6c79. CI green. READY posted 18:57 PDT. No verdicts yet. It is
  one of the four iOS-build PRs (_COMMON_130 item 10), so lenses review it first.
- Files: `src/entitlements/ProtectedScreen.tsx` (new branch, policy comment), `PaywallSheet.tsx` (COACHLESS_TITLE/BODY only),
  `EntitlementProvider.tsx` (comment only), new `src/entitlements/README.md`, new `src/__tests__/foodGateRetry.test.tsx`.
  Existing tests updated: `protectedScreenFailClosed` (unavailable case), `entitlementGateKeepsWorkout` (gateShown helper),
  `coachlessGateVersionB` (2 literals), `entitlementProvider` (comment).
- A REQUEST CHANGES at this head goes to FIX-OPUS-130 (T4). Worktree /home/user/workspace/wt/FOOD-GATE-RETRY-130-mobile is
  clean at the head, with deps linked. Run tests through ops/heavy.sh, one file at a time.
- If main changes these files before the merge: `git merge origin/main` (no rebase), rerun foodGateRetry and
  coachlessGateVersionB, push once, and post FIX ROUND 2.
- Never merged, deployed or changed production. No GitHub calls beyond this PR, its checks and this branch.
