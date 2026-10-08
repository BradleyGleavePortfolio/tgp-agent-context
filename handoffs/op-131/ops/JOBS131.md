# JOBS131: job entries for operator agent 131's workers (2026-10-07 20:40 PDT)
# Read /home/user/workspace/ops/lanes131/_COMMON_131.md first. Then ONLY your entry here (plus the entry it names).
# Verified on GitHub 20:21-20:40 PDT. GitHub wins: re-fetch heads before acting.

# ---- Standing lanes ----

## LN-OPUS-131 (Claude Opus 5.5, LENS, T1-T4): instances LN-OPUS-A-131 .. LN-OPUS-E-131
Your queue: open PRs on the board (head branch agent127/* .. agent131/*) whose READY names the CURRENT head and that have no
"AUDIT Claude Opus 5.5" verdict at that head and no live OPUS LENS CLAIM at that head (under 40 minutes old). Never review a ci/* branch.
Order: (1) READY now: m#537 @ abb29668 (a merge of mobile main into 6e4ca3c1, which both lenses approved: delta re-review of the merge),
b#855 @ 015b8d6c (Roman playbook flag, T4 flag manifest); (2) iOS build 7 mobile PRs as they turn READY: m#546, m#542, m#545;
(3) everything else as it turns READY (b#865, b#870, b#872 and b#874 after their fix rounds; new agent131/* PRs). Instances A, C, E take
the oldest READY first; B and D the newest first; within a group, T4/T3, money, consent, privacy and Roman PRs first.
Per PR: re-check the head on GitHub; post `OPUS LENS CLAIM (<your ID>) @ <full sha>`; re-read the comments: if an earlier live OPUS LENS CLAIM
for the same head exists, delete yours (`gh api -X DELETE repos/<owner>/<repo>/issues/comments/<id>`) and move on. Review: full review 30
minutes, delta re-review 20 minutes (when an Opus lens reviewed an earlier head: the delta plus whether its Bs are fixed; no new Bs in
unchanged code unless they meet SoT A2 override item 1). Never read a GPT-6.1 Sol verdict at that head before posting yours. Apply SoT A2
overrides 1-11 strictly. Size over 1,500 changed lines (lockfiles, generated files and snapshots excluded; tests count) = REQUEST CHANGES
"SIZE FAIL (over 1,500 lines)". Mobile UI PRs: the six redo rules in _COMMON are acceptance criteria (false copy is a B; dead buttons;
parity table and parity test; theme colours only). Backend T4: caller-scoped queries, consent gates, PII in logs and egress, money, flags keep
main inert. Re-check the head right before posting; if it moved, start over at the new head. Post ONE comment (format in _COMMON item 5).
Describe crisis, self-harm and eating-disorder copy by file:line; never quote it (_COMMON item 7).
Report: one line per verdict in /home/user/workspace/ops/reports/<your ID>.md. No code edits, no other comments.
Idle: sleep 180 and re-read the board. After 60 minutes in a row with an empty queue, write your report and finish (the operator relaunches).

## LN-SOL-131 (GPT-6.1 Sol, LENS, T1-T4): instances LN-SOL-A-131 .. LN-SOL-G-131
Exactly LN-OPUS-131, but you are the GPT-6.1 Sol lens: your queue is heads with no "AUDIT GPT-6.1 Sol" verdict; claim with
`SOL LENS CLAIM (<your ID>) @ <full sha>`; never read a Claude Opus 5.5 verdict at that head before posting yours; verdict first line
`AUDIT GPT-6.1 Sol (<your ID>) — growth-project-<repo>#<n> @ <full sha> — VERDICT: APPROVE` (or REQUEST CHANGES). Instances A, C, E, G take
the oldest READY first; B, D, F the newest first. Flag-manifest PRs (.github/fly-env-desired-state.json, e.g. b#855): check values against
src/common/env-validation.ts closed sets, scripts/fly-env/fly-env-manifest.js PRECONDITIONS and the gate text. If your safety check stops you
from posting: _COMMON item 7 (save the verdict file, say so in your notify line, move on). Short verdicts.

## FIX-131 (fix lanes): FIX-OPUS-131 (Claude Opus 5.5) and FIX-SOL-131 (GPT-6.1 Sol)
A PR is in a fix queue when, at its CURRENT head: (a) a lens REQUEST CHANGES exists and no READY is newer than it; (b) both lenses APPROVE
but it conflicts with main; (c) the latest READY names the head but a required check failed; or (d) a push exists with no FIX ROUND / READY
comment. FIX-OPUS-131 takes Opus-built PRs and every T3/T4, money, consent, privacy or Roman PR; FIX-SOL-131 takes Sol-built T1/T2 PRs.
Inherited queue at 20:40 (verified):
- FIX-OPUS-131, in this order (mobile first: iOS build 7 is cut at 23:00):
  (1) m#542 @ 1d45b2ea: both lenses REQUEST CHANGES: openInMoreTab needs `initial: false` (src/screens/client/WorkoutScreen.tsx:627-629 and
      :750-751). Read both verdicts in full; fix every B with a test.
  (2) m#545 @ 8eab7ee5 (T4 money copy, 1,115 lines): Opus APPROVE, Sol REQUEST CHANGES B-545-1: clientPaymentsCopy.ts:84-87, when billing is
      unknown a full refund promises access stays. Fix: handle the unknown case, warn that access ends, endsAccess true; failing-first test.
  (3) b#870 @ 7be96721: CI build-and-test fails (TypeScript implicit any at test/ai-credits-rollover-pack-carry.spec.ts:93 and :139). There
      is no READY at this head; the Sol REQUEST CHANGES at 5f89fb1d (19:03) must be checked against 7be96721 too. Fix CI, then post the
      FIX ROUND READY naming each Sol finding fixed with file:line. Delete FIX-OPUS-130's stale FIX CLAIM only if the operator has not.
  (4) b#865 @ 51a1766c (T4 privacy): Opus APPROVE, Sol REQUEST CHANGES B-865-SOL-130-2: v1-coach.service.ts:303-308 and :332-345 show thread
      risk from a hidden check-in date; churn-intervention.service.ts:325-348, :359-367 and :404-433 draft from hidden factors. Fix: gate
      threads with the roster grant plus checkInShared; require all four scopes before draft reads, idempotency and the AI call; tests.
  (5) b#872 @ 1509818e (on HOLD for this finding): B-872-SOL-130-1 in /home/user/workspace/ops/reports/LN-SOL-B-130-b872-verdict.txt (stored
      brief output keeps a client's weight alert after Weigh-ins sharing is turned off; coach-brief.service.ts:1724-1725, :2014,
      :2096-2109). b#865 and b#872 both edit churn-intervention.service.ts: fix b#865 first; b#872 merges main after b#865 merges.
  b#855 @ 015b8d6c is READY and needs only lenses; if a lens asks for changes, it goes to the front of your queue (Roman playbook).
- FIX-SOL-131: (1) the operator merged m#544 at 20:44. If m#537 now conflicts with main (both edit src/screens/client/README.md),
  merge origin/main into m#537 (keep both sides), CI green, post the next FIX ROUND READY with the original JOB name from m#537's
  first READY line. (2) Then Sol-built PRs as they hit (a)-(d).
Claim with `FIX CLAIM (<your ID>) @ <full sha>`; re-read; if an earlier live FIX CLAIM (under 60 minutes) exists for that head, delete yours
and move on. Worktree per PR: `git -C /home/user/workspace/growth-project-<repo> fetch -q origin <headRefName> && git -C
/home/user/workspace/growth-project-<repo> worktree add /home/user/workspace/wt/FIX-<n>-<repo> origin/<headRefName>` then
`git -C <wt> switch -c <headRefName>` if needed and push to that same branch; remove the worktree when done. Read the PR body, the job entry
it names, the builder's report in /home/user/workspace/ops/reports/ and BOTH verdicts in full. Fix ONLY the Bs (plus a U if it is one line),
each with a test where behaviour changes. Merge origin/main, run the touched tests via /home/user/workspace/ops/heavy.sh (or let CI prove
them), push ONCE, CI green (poll every 180 s), then post the FIX ROUND READY listing each finding fixed with file:line. A finding you judge
wrong: answer it in that comment with file:line evidence. Never merge. One line per PR in /home/user/workspace/ops/reports/<your ID>.md.
Idle: sleep 180, re-read the board. Run until the operator stops you.

# ---- Finishers (agent 130's unfinished work) ----

## FINISH-131 (applies to every *-FIN-131 entry and CREDIT-PAY-131)
Your worktree is already on the branch named below. Read the original entry it names and the builder's report (its HANDOFF) in
/home/user/workspace/ops/reports/. `git merge origin/main` first (never rebase), finish the work, failing-first tests, parity table and
README where a screen changes, CI green at your head, open the PR (or mark it ready with `gh pr ready <n> -R BradleyGleavePortfolio/<repo>`),
post READY (_COMMON item 5), HANDOFF, notify, end.

## COACH-ROMAN-ROW-FIN-131 (GPT-6.1 Sol, FINISHER, T2 mobile copy)
mobile#546 @ 0b1a6b43 (branch agent130/coach-roman-row-130, 38 lines, CI green, no comments yet). Original entry: COACH-ROMAN-ROW-130 in
/home/user/workspace/tgp-agent-context/handoffs/op-130/ops/JOBS130.md. Check that the old line is gone everywhere (rg the repo, tests and
snapshots included) and a test pins the new line; merge origin/main; CI green; post READY. It belongs in iOS build 7: READY within 30 minutes.

## CREDIT-METER-FIN-131 (Claude Opus 5.5, FINISHER, T4 backend, additive migration)
backend#874 @ 9216885a (branch agent130/credit-meter-130, 578 lines, no READY). Original entry: CREDIT-METER-130 in JOBS130.md; report
reports/CREDIT-METER-130.md. Finish it, including U3 (the flat 5-cent debit when no token counts, ai-gateway.service.ts:705-710): fix it if
it is one line, else show with file:line why it cannot be reached and say so in the body. Migration 20270405000000_coach_ai_budget_exact_usage
must stay newer than every migration on main (latest deployed: 20270404000000_recipe_declared_allergens); additive, with down.sql; say loudly
in the body that the deploy needs migrations=apply-migrations. Shared files: b#873 (roman.service.ts, merged at 20:44), b#870
(coach-ai-budget.service.ts), b#872 (coach-ai.service.ts) and CREDIT-PAY-131's backend PR (ai.service.ts, ai-gateway.service.ts). Merge
origin/main after b#873 merges; if CREDIT-PAY-131's backend PR has merged before you are ready, merge main again; otherwise post READY and
write in the body that this PR takes a merge-main round after it.

## CREDIT-PAY-131 (Claude Opus 5.5, BUILDER/FINISHER, T4 money; one mobile PR + one small backend PR, each under 800 lines)
Original entry: CREDIT-PAY-130 in JOBS130.md; report reports/CREDIT-PAY-130.md. Mobile: worktree /home/user/workspace/wt/CREDIT-PAY-131-mobile
on agent130/credit-pay-m-130 @ c1ead0ab (1 commit ahead, 18 behind main, 24 files, 751 lines): merge origin/main first. m#513 has merged, so
AIBudgetTutorialModal.tsx may now be edited. m#545 also edits src/navigation/CoachNavigator.tsx: keep your lines there minimal. Backend:
worktree /home/user/workspace/wt/CREDIT-PAY-131-backend on new branch agent131/credit-pay-131 from main; b#855 also edits
.github/fly-env-desired-state.json: keep your diff to the two COACH_AI_PACK_* keys. Both PR bodies start with
"Owner decision 10 pending: merge only after the owner's yes." No Stripe changes, no production writes, spend nothing.

## COACH-ROW-SCRUB-FIN-131 (Claude Opus 5.5, FINISHER, T4 backend privacy)
backend branch agent130/coach-row-scrub-130 @ 1d4cff1c (1 ahead, 17 behind, 159 lines, no PR). Original entry: FIX_PLANS C1 #6
COACH-ROW-SCRUB-130 in /home/user/workspace/tgp-agent-context/handoffs/op-129/FIX_PLANS_130_131.md; report reports/COACH-ROW-SCRUB-130.md
(its HANDOFF). WAITS FOR b#865 to merge (both edit src/coach/coach.service.ts: archiveClient :325, unarchiveClient :359, getClientTimeline
:402 on main). Until then: merge origin/main, re-run your spec, draft the PR body. When b#865 merges (FLEET131 / operator message): merge
main, tests, push, open the PR, CI green, READY. Waiting rule (_COMMON item 12).

## FAST-CALM-FIN-131 (Claude Opus 5.5, FINISHER, T2 mobile)
mobile branch agent130/fast-calm-fin-130 @ b7eb7a0f (4 ahead, 0 behind, 755 lines, no PR). Original entry: the FAST-CALM row in FIX_PLANS
section B and reports/FAST-CALM-FIN-130.md (plus reports/CF-FAST-CALM-128.md). WAITS FOR m#537 to merge: both touch src/hooks/useSettings.ts,
and both add src/utils/fastingAlert.ts (an add/add conflict: keep m#537's file as the base and fold your additions in). Until then: trace,
draft the body, prepare the merge resolution against m#537's head. When m#537 merges: merge main, tests, push, open the PR, CI green, READY.

# ---- Recon 131 adjustments (C2 rows in FIX_PLANS_130_131.md; line refs verified on main 80cebd11 / 4e9116b5) ----
| ID | model | verified on main | waits for |
|---|---|---|---|
| WORKOUT-CLAMP-131 | Sol | src/workout/workout.dto.ts:82-84 and :203-205 (@Min(0) @Max(1440)) as planned | none |
| WORKOUT-RESUME-131 | Opus | ActiveWorkoutScreen.tsx resume :319-334, elapsed from startedAtMs :264-279 as planned | none |
| HOME-FOOD-STORE-131 | Sol | src/store/clientStore.ts loadDayData :72; Math.round now at :216 (plan said :213); failure copy `${amountOz} oz` at :230 | none |
| HOME-FOOD-UI-131 | Sol | HomeScreen.tsx waterValue now at :236 (plan said :229); m#524 has merged, so it is unblocked | none |
| SESSION-REMINDER-COPY-131 | Sol | src/notifications/emitters/booking.emitter.ts reminder() :482, call-link line :505, 'Session tomorrow' :513 | none |
| HABIT-ADD-GUARD-131 | Sol | src/screens/client/habits/AddHabitSheet.tsx Add button :80-84 (plan said :82-83) | none |
None of these files is changed by an open PR or by a branch without a PR (checked 20:40).

# ---- Recon 131 adjustments, wave 1 continued (C3 rows in FIX_PLANS_130_131.md; verified on mobile main e1688b51) ----
| ID | model | verified on main | waits for |
|---|---|---|---|
| COACH-WEEKLY-131 | Sol | useClientDetailData.ts loadWeeklySummaries :237; food aggregation :290-299 has no quantity_multiplier (:296) and reads food_item?.protein (the field is protein_g, so protein reads 0 g, :297); per-day totals elsewhere use quantity_multiplier (:71-72, :150) | none (m#545 edits SummaryTab.tsx only, not your files) |
| QA-COACH-HOME-131 | Opus | all eight files exist: src/screens/coach/command-center/{OverviewScreen,AtRiskScreen,WinStreaksScreen,InboxScreen,ActionQueueScreen,CommandCenterScreen}.tsx, src/components/command-center/KpiTile.tsx, src/screens/coach/TeamManagementScreen.tsx | none (no open PR or branch touches them; TEAMPROFILE-131 comes later) |
| QA-COACH-STATES-131 | Opus | all five exist: src/screens/coach/{CoachBookingInboxScreen,CoachInvitesScreen,PendingAiDraftsScreen,RiskBoardScreen}.tsx, src/screens/coach/programs/ProgramUi.tsx | none |
| QA-EMPTY-131 | Opus | files exist: src/ui/empty-states/EmptyState.tsx, src/components/EmptyState.tsx (src/components/community/EmptyState.tsx is a different component: leave it), src/ui/empty-states/EmptyStateNoClients.tsx, src/screens/client/CheckoutReturnScreen.tsx, src/screens/client/PurchaseUnpackScreen.tsx | none (m#542 edits the sibling EmptyStateNoWorkouts.tsx only: do not touch that file) |

# ---- Restart 22:45 PDT (read _COMMON_131.md R1-R5 first; verified on backend main 21598a39 and mobile main 842eb059) ----

## Lenses LN-OPUS-F/G/H-131 (Claude Opus 5.5) and LN-SOL-H/I/J-131 (GPT-6.1 Sol)
Exactly the LN-OPUS-131 / LN-SOL-131 entries above, with this queue order: (1) READY now: b#878 @ 3ec27c47 (T4 privacy: coach replies no
longer carry a client's push token, deletion hash or sign-in id), b#872 @ b84193df (T4: FIX ROUND 2 for B-872-SOL-130-1; Sol lenses say
in the verdict whether that finding is fixed, described by file:line), m#556 @ 53f10d0a (coach calm error and loading states), m#549 @
371c555b (delta: FIX ROUND 2 for Sol's B-549-SOL-C-131-1, a failed first water read showing a false zero). (2) The fix rounds as they
turn READY: m#551 (iPhone credit packs, T4 money), b#877 (credit-pack checkout backend, T4 money), b#870 (credit refill rollover, T4
money), m#552 (calmer fasting). (3) New agent131/* PRs. F and H take the oldest READY first; G and I the newest first; J takes T4 first.
Idle rule: _COMMON R3.

## FIX-OPUS-B-131 and FIX-OPUS-C-131 (Claude Opus 5.5): the FIX-131 entry above, with these queues
- FIX-OPUS-B-131: (1) m#551 @ ae7e2a94 (branch agent130/credit-pay-m-130): Opus REQUEST CHANGES at this head (read it in full): two
  false-copy Bs (the tutorial says the Coach Home meter opens packs at any time, but the meter only shows at 60-79 percent; checkout and
  receipt copy say credit "shows on Coach Home") and two Us. Fix the Bs (and a one-line U), each with a test; merge origin/main (it
  conflicts now); CI green; post FIX ROUND 2 READY. (2) b#877 @ dc6149d7 (branch agent131/credit-pay-131): both lenses approved, but it
  conflicts with main since b#874 merged. Merge origin/main, keep both sides, CI green, post the next FIX ROUND READY (lenses re-review
  the delta).
- FIX-OPUS-C-131: (1) b#870 @ 87f7f275 (branch agent130/credit-refill-130): FIX ROUND 3 fixed B-870-SOL-F-131-1; it conflicts with main
  since b#874 merged (src/ai-credits/coach-ai-budget.service.ts and the credits tests): merge origin/main, keep both sides, CI green,
  post FIX ROUND 4 READY. (2) m#552 @ f41ea9b1 (branch agent130/fast-calm-fin-130): Opus APPROVE, Sol REQUEST CHANGES B=1 (a label says
  "all fasts" where only recent fasts are counted: it must say "recent fasts"; read the Sol verdict in full). Fix with a test, merge
  origin/main (it conflicts), CI green, post the FIX ROUND READY.
- Then, either lane: any PR on the board that meets FIX-131 (a)-(d) at its current head (Sol-built T1/T2 PRs included, since no
  FIX-SOL lane runs in this restart).

## Builders (worktrees already made, node_modules linked)
| ID | model | job(s) and verified refs | worktree / branch | waits for |
|---|---|---|---|---|
| BLD-SOL-1-131 | Sol | (1) ONB-N2-COPY-131 (FIX_PLANS C3 row): src/lib/consultation/definitions.ts:441 now reads 'So nothing suggested is something you avoid.' (promises food filtering that does not exist): change to "So your coach knows what you avoid." plus one test. (2) PACKAGE-ARCHIVE-COPY-131 (C3 row): src/screens/coach/payments/CoachPackageEditScreen.tsx: archive alert copy at :502 names a "Take off sale" button that does not exist; map PACKAGE_HAS_ACTIVE_SUBSCRIBERS in the archive catch to plain copy that does not tell the coach to cancel subscriptions; the "Open billing" button at :296 opens the hidden Billing screen: remove it or reroute it to CoachMoney (CoachNavigator.tsx:290); one test | wt/BLD-SOL-1-131-mobile, agent131/onb-n2-copy-131; second PR on agent131/package-archive-copy-131 from origin/main | none |
| BLD-SOL-2-131 | Sol | (1) BROADCAST-KEEP-131 (C3 row): src/screens/coach/broadcasts/BroadcastComposerScreen.tsx has no leave guard (goBack at :111): ask "Discard this message?" on Back or close when the text is not empty; test. (2) AI-DRAFT-KEEP-131 (C3 row): src/screens/coach/AIWorkoutDraftScreen.tsx: a "Discard edits?" guard on Back when the draft was edited; remove the footer at :443-445 that shows the model name, tokens and dollar cost (and the doc comment at :15); reword the reject prompt; test | wt/BLD-SOL-2-131-mobile, agent131/broadcast-keep-131; second PR on agent131/ai-draft-keep-131 | none |
| COACH-SETTINGS-131 | Opus | C3 row: src/screens/coach/SettingsScreen.tsx: clientCount starts at 0 (:59, set at :121) and "Active Clients" (:415-416) shows 0 while loading and after a failed load: show "—" until loaded and on failure; the NotificationPreferences link (:635): verify the route name exists in the coach navigator and fix it; add an AI credits row from src/hooks/useAIBudget.ts with the Roman sub-label and a low-credit note; tests. Do not touch src/components/coach/ai-budget/* (m#551 edits it) | wt/COACH-SETTINGS-131-mobile, agent131/coach-settings-131 | none (m#546 merged; m#551 does not touch SettingsScreen.tsx) |
| PB-FAIL-LIMIT-131 | Opus | Owner YES at 20:54 (D7): the playbook's 6-hour limit counts charged failed attempts. From the code: src/roman/playbook/playbook-builder.service.ts:176 checks only the active playbook's built_at (builtTooRecently :66, PLAYBOOK_REBUILD_MIN_INTERVAL_MS :58). A model call that is charged and then ends as model_error (:222-227), invalid_draft (:236) or empty_draft (:238) leaves nothing that the next run checks, so every 6-hourly cron run (playbook-builder.scheduler.ts:38, '0 */6 * * *' UTC) pays again for the same failing coach. Fix: before spend.reserve (:189), return 'too_recent' when this head coach had a charged playbook attempt in the last 6 hours. Prefer the existing AI spend or usage ledger rows for the playbook feature; if none records the attempt time, use an additive migration and say so in the PR body (the operator applies it). Attempts settled at 0 (no charge) do not count. Tests: a charged failure, then a run 1 hour later skips without reserving; after 6 hours it runs; the unchanged-digest path is unaffected; a 0-charge attempt does not block. T4 Roman: flag behaviour unchanged when FEATURE_ROMAN_PLAYBOOK is off | wt/PB-FAIL-LIMIT-131-backend, agent131/pb-fail-limit-131 | none |
