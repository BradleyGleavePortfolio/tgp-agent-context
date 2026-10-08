# Proposals from agent 131 workers (compiled 22:00 PDT; each has its default in the report)

## COACH-ROMAN-ROW-FIN-131
- None beyond the assigned entry.

## COACH-ROW-SCRUB-FIN-131
1. Token-file step (_COMMON_131 item 3, optional): skipped (the builder reported the platform refuses persisting the token to a shared
   file). Default: the operator refreshes the board token from its own session.
2. U (from the code, outside this entry): Client detail archive button shows the wrong state for an archived client.
   useClientDetailData.ts:36 starts isArchived=false and :53 sets it only from `data.client` of GET /coach/clients/:id/summary, which
   sends no `client` (coach.service.ts getClientSummary returns client_name + profile). A coach opening an archived client sees
   "Archive client"; tapping it reports "has been archived" and changes nothing; the next tap unarchives. Smallest fix: summary adds
   `client: { archived_at }` (or mobile reads archived_at from the roster row / the archive response). Default: route to a later
   small U job (CLIENT-ARCHIVE-COPY-131 is a candidate); not in this PR.
3. Roster minimisation (C above). Default: defer.

## COACH-WEEKLY-131
- None in assigned scope.

## CREDIT-METER-FIN-131
1. Deploy: b#874 must deploy with **migrations=apply-migrations** (said loudly in the body and READY). Default: operator deploys it that way, never with migrations skipped.
2. Merge-main round owed after b#870 (merge order b#870 before b#874): `git merge-tree` vs b#870 @ 58490669 (and 7be96721) = ONE textual conflict in src/ai-credits/coach-ai-budget.service.ts, both PRs add module-level helpers after `toSnapshot`; resolution: keep both (`exactUsedMicroCents` and `packSpentAtClose` / `packCreditLeft`); the rollover auto-merges with `actual_used_micro_cents: 0` and b#870's pinned `where`. Then re-run test/ai-credits-exact-metering.spec.ts and test/ai-credits-rollover-pack-carry.spec.ts. Same after CREDIT-PAY-131's backend PR if it merges first (pool-empty strings, other lines). b#872: merge-tree clean. Default: FIX-OPUS-131 does it after b#870 merges, then a FIX ROUND 2 READY.

## CREDIT-PAY-131
1. Owner decision 10: yes or no on the US external link. Default: hold both PRs (HOLD.txt).
2. If yes, before a clinic-profile iOS build ships: in App Store Connect, offer the app only on the US storefront, and say in the App Review notes that coaches buy AI credit packs through an external link to Stripe Checkout in Safari (Guideline 3.1.1(a), US). Default: owner action, none taken.
3. Stripe Dashboard (CREDIT-REFILL-130 U1): the live webhook endpoint must send `checkout.session.completed` and `checkout.session.expired`. Default: owner checks before the first live pack.
4. After #877 merges, the operator runs fly-env-sync to apply the two `COACH_AI_PACK_*` values. Default: operator.
5. Honour `preselect` on `CreditPackCheckoutScreen` (U above). Default: next mobile lane.
6. Switch the return link to a universal link (https://app.trygrowthproject.com/checkout/...) with an apple-app-site-association path. Default: later.
7. eas-update guard: also block OTA bundles that change `EXPO_PUBLIC_FF_IOS_US_CREDIT_PACK_LINK`. Default: later.
8. B2 per-call rounding stays with the CREDIT-METER lane.

## FAST-CALM-FIN-131
All pre-existing on main, not changed by m#552 (item 17: not built here). From the code.
- U: src/screens/client/WidgetsScreen.tsx:40 Quick log description "Open the food log from anywhere" overclaims (it is one button
  on the Shortcuts screen). Smallest fix: "Open the food log". A client reads a promise of a widget that does not exist.
  Default: SMALL-M-COPY-131 (or the FIX lane if a lens asks on m#552).
- U: src/screens/client/FastingScreen.tsx:203 and :228 (and WidgetsScreen.tsx:81) pass the raw error text through
  errorMessage(err, ...), so a server or network message can show in the alert. Smallest fix: fixed plain copy per failure
  ("The fast did not start. Check the connection and try again."). A client on a weak signal sees technical text.
  Default: SMALL-M-COPY-131.
- C: FastingScreen.tsx:313 first load shows a bare ActivityIndicator, not SkeletonScreen. Default: leave.

## FIX-OPUS-131
1. Sizes over the 800 target and under 1,500: m#545 1,132 and m#542 1,070. Default: accept as they are.
2. No FIX CLAIM went up on m#545 before its push. No other claim existed. Default: no action.
3. The FIX-131 entry says to remove worktrees when done, but the workspace rule says never delete. Default: leave wt/FIX-542-mobile, wt/FIX-545-mobile, wt/FIX-870-backend, wt/FIX-865-backend, wt/FIX-872-backend, wt/FIX-872-trial (a local-only trial merge, never pushed) and wt/FIX-874-backend.
4. Slip at 21:21: `git -C growth-project-backend worktree add wt/...` put the b#874 worktree inside the clone, and link_deps put a node_modules symlink at the workspace root. Within a minute both were moved (`git worktree move` and `mv`) to wt/FIX-874-backend. The clone's git status is clean, and an empty directory growth-project-backend/wt/ remains. Default: leave it, or the operator removes the empty directory.
5. Slip: at 21:22 one extra GitHub read on b#865 came 90 s after the previous one, against the once-per-3-minutes rule. Default: no action.
6. The b#874 narrow tsc shows 5 errors in coach-ai-budget.service.ts (`actual_used_micro_cents`). The shared deps' Prisma client is generated from main's schema, which does not have this PR's column yet, while CI generates from the branch schema. Default: rely on CI.
7. After the merge, the check-in gate that b#872 added to the churn draft (churn-intervention.service.ts, coachSharingCheck in generateChurnDraft) no longer blocks anything new, because the all-four gate in b#865 already refuses any client who does not share check-ins. Default: keep it (defensive, no behaviour change). A later cleanup can remove it.
8. Briefs and drafts in b#872 check grants under the sub-coach's own id, while b#865 reads under the head coach's grant (Opus C, teams not live). Default: one rule before teams go live (an existing promotion trigger).

## FIX-SOL-131
- None identified yet.

## HABIT-ADD-GUARD-131
- None within assigned scope.

## HOME-FOOD-STORE-131
- None currently.

## HOME-FOOD-UI-131
None currently.

## LN-OPUS-A-131
(none)

## LN-OPUS-B-131
(none)

## LN-OPUS-C-131
(none yet)

## LN-OPUS-D-131
- None that block. Lens-loop note for agent 132's lenses: five Opus instances racing on a 3-minute board meant most claims went to whoever read the board first. Default: give each Opus instance a disjoint slice (for example by repo, or by PR number parity) instead of oldest/newest ordering.

## LN-OPUS-E-131
1. b#855 merged 21:05 PDT, so FEATURE_ROMAN_PLAYBOOK "true" is now in the desired state on main: the next fly-env-sync apply of ANY
   flag turns the playbook on. Owner decision 6 (charged failed playbook attempts count toward the 6 h limit; default yes) is open and
   not built. Default: hold every fly-env-sync apply until decision 6 is answered; if yes, route the follow-up to Claude Opus 5.5
   (src/roman/playbook/playbook-builder.service.ts:176 checks only the last successful build; :229-238 charge, then discard on
   invalid_draft / empty_draft) and deploy it first; if no, apply as planned.
2. m#551 (US iOS credit-pack link), outside this lens entry. OTA is on, and scripts/eas-update-guard.js gives a clinic update the eas.json clinic
   env (the switch is "true" there). After m#551 merges, the first clinic OTA would bring the external link to installed clinic builds that
   share the runtime fingerprint, before build 7's submission sets US-only availability. Second point: the PR's owner action 3, a live Stripe
   webhook sending checkout.session.completed, cannot be checked from the code; without it a coach pays and gets no credit. Default: publish no
   clinic OTA after the merge until App Store Connect availability is US only, and do not let coaches buy packs on build 7 until someone has
   checked the live webhook in the Stripe Dashboard.

## LN-SOL-A-131
B1 and B2 at the original backend #872 head require a delta review of the T4 fix once READY; recommended default for agent 132: check both the PTM factor sinks and the cached/current/history brief authorization paths before clearing them ([original verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/872#issuecomment-6051820593)).
Backend #874 requires its additive migration applied before the new code runs and a merge-main/new-head review after the declared predecessor merges; do not reuse this head's verdict for that future head ([PR #874](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/874)).

## LN-SOL-B-131
- Route B-552-SOL-131-1 to the fix lane: `src/screens/client/FastingScreen.tsx:472`, related README and copy test; use “recent fasts” rather than a lifetime average claim. Default: small copy/test-only fix, then re-audit its new READY head. ([Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/552#issuecomment-6052203412))

## LN-SOL-C-131
None.

## LN-SOL-D-131
1. Backend #874 deployment must apply its additive migration; the operator fleet says deploy 35 was queued with `apply-migrations`, but this lens has not verified the completed deployment. The builder's earlier “refresh #874 after #870” order is superseded by the operator merging #874 first: future #870/main integration must retain both exact-usage and pack helpers. Default: operator/agent 132 checks that deployment and the shared-file integration, rather than reopening a merged PR. ([Migration and shared-file prerequisites](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/874))
2. Mobile #551 U1 is not fixed in this lens. Default: defer the small preselect fix to an agent 132 follow-up; it does not block this approval. ([Finding](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/551#issuecomment-6052374692))
3. Submission/operations for mobile #551: agent 132 must retain US-only App Store availability and external-link App Review notes, and confirm the declared live credit-pack webhook event subscriptions; this lens did not change or verify live Stripe configuration. Default: verify those prerequisites before shipping the switched-on build. ([Operator submission instructions](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/551#issuecomment-6052294493), [Declared webhook prerequisite](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/551))

## LN-SOL-E-131
None identified.

## LN-SOL-F-131
B-870-SOL-F-131-1: the verdict applies to audited head `58490669`; the later `87f7f275` fix round arrived after the cut and is now conflicted, so agent 132 must refresh and re-audit before this lane's finding can be closed. Recommended default is to keep #870 unmerged until both lenses approve the refreshed head. ([posted finding](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/870#issuecomment-6052231044), [late fix READY](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/870#issuecomment-6052519536), [final GitHub status](/home/user/workspace/ops/reports/LN-SOL-F-131-b870-wind-down-head.json))
Owner decision 10: recommended default is to retain #877's release HOLD until explicit approval; technical Sol approval does not authorize rollout or flag application. ([owner gate](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/dc6149d74ee69ba7778585fb5602b4cdff8acb7f/.github%2Ffly-env-desired-state.json))

## LN-SOL-G-131
- None.

## QA-COACH-HOME-131
- KpiTile keeps its cream fill on bone (Home and Money tiles). Default: leave.
- Team CapacityBar and ScoreBadge still colour-code red / gold; Team still loads with a spinner. Default: separate redo lane.
- CoachLtvDashboard keeps its own older error copy ("Unable to load LTV metrics. Check your connection."). Default: separate lane.
- A failed pull-to-refresh keeps the old numbers with no notice. Default: leave.
- command-center README API table still says MOCKED though `__USING_MOCK_DATA` is false. Default: docs fix in a later lane.
- LoadFailedNotice could become the shared calm error for QA-COACH-STATES-131 / QA-PRIM. Default: reuse after merge.

## QA-COACH-STATES-131
| # | Where | Smallest fix | Default |
|---|---|---|---|
| P1 | Booking inbox Confirm filled oxblood, Decline oxblood border: `CoachBookingInboxScreen.tsx:169`, `:324`, `:340`, `:343` | forest Confirm, ink-bordered Decline | follow-up QA job; not part of "error and loading looks" |
| P2 | Booking inbox action notices in red: `CoachBookingInboxScreen.tsx:265`, `:413` | ink text for error tone (message words already explain) | same follow-up job as P1 |
| P3 | `describeProgramFailure` copy says "Retry" while the button says "Try again": `src/utils/programErrors.ts:177`, `:341`, `:355` | replace "Retry" with "Try again" in the three strings | later QA copy job (tests pin these strings) |
| P4 | `CoachErrorState` red "Could not load" chip and filled button on client screens: `src/components/community/coach/CoachErrorState.tsx:53-58`, `:75` | render `QuietError` inside it | QA-PRIM-131 adopts `QuietError` |
| P5 | Risk board silent "load more" failure (C1): `RiskBoardScreen.tsx:239` | inline `QuietError` in the footer when `error && items.length` | follow-up; low traffic |
| P6 | Two calm-error primitives now exist: `src/components/coach/LoadFailedNotice.tsx` (QA-COACH-HOME-131, merged on main after this branch was cut; sentence plus forest Try again, `semanticColors`) and `src/ui/states/QuietStates.tsx` `QuietError` (adds extra actions, inline/block layout, `retrying`, plus `QuietLoading` and `loadFailureMessage`). Same look, from the code | make `LoadFailedNotice` render `QuietError` (about 30 lines, one PR) | keep both tonight; agent 132 or QA-PRIM picks one owner |

## QA-EMPTY-131
1. HapticPressable ignores the Haptics switch (DESIGN-QA-128 U1). src/components/HapticPressable.tsx calls expo-haptics directly.
   Default: route it through HapticService (src/ui/haptics/haptics.service.ts) in a QA-THEME job, with one test that has the switch off.
2. src/screens/coach/CoachBriefScreen.tsx:241: the copy "in development" breaks doctrine rule 2 (honest, neutral copy). Default: reword it to a neutral line the next time CoachBrief is touched.
3. src/screens/coach/AdminControlRoomScreen.tsx:60 ("Admin Control Room is preview-only"): the title is in Title Case, which breaks the sentence-case rule. Default: change it to sentence case in the next admin pass.
4. The CheckoutReturnScreen CTA is radius 10 and about 42 pt, and PurchaseUnpackScreen uses radius 10/12/14. Default: a later money-screen style pass (T1 style only, radius 4, 44 pt).

## SESSION-REMINDER-COPY-131
None.

## WORKOUT-CLAMP-131
- No technical blocker or extra decision remains; default is the usual exact-head dual audit and operator-only merge. ([READY comment](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/876#issuecomment-6051901301), [agent 131 builder rule](../lanes131/_COMMON_131.md))

## WORKOUT-RESUME-131
- P1. App kept suspended in memory for more than 12 hours (screen still mounted), then brought back: the foreground path (`ActiveWorkoutScreen.tsx:399-411`) does not go through the restore, so the gap still counts. Default: a follow-up of about 10 lines plus a test (note the time on background; on return after more than 12 hours add the gap to `pausedMs` and save). Not done here: no new work beyond the entry.
- P2. Gaps under 12 hours (for example a workout left open for 6 hours) still count in full; the 12-hour window is the existing boundary. Default: leave as is.
- P3. Unused import warning at `ActiveWorkoutScreen.tsx:38` (C3). Default: leave for a lint-cleanup lane.

