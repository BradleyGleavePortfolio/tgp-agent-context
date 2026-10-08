# JOBS130: job entries for operator agent 130's workers (2026-10-07 18:08 PDT)
Read /home/user/workspace/ops/lanes130/_COMMON_130.md fully first, then ONLY your entry here, plus (builders) your entry in
/home/user/workspace/tgp-agent-context/handoffs/op-129/FIX_PLANS_130_131.md and the JOBS128/JOBS129 entry it names
(/home/user/workspace/tgp-agent-context/handoffs/op-128/ops/JOBS128.md, /home/user/workspace/tgp-agent-context/handoffs/op-129/ops/JOBS129.md).
The last occurrence of a heading wins.

# ---- Standing lanes ----

## LN-OPUS-130 (Claude Opus 5.5, LENS, T1-T4): instances LN-OPUS-A-130 .. LN-OPUS-E-130
Your queue: open PRs on the board (head branch agent127/*, agent128/*, agent129/* or agent130/*) whose READY names the CURRENT head and that
have no "AUDIT Claude Opus 5.5" verdict at that head and no live OPUS LENS CLAIM at that head (under 40 minutes old).
Order: (1) group A when READY at its head: b#861 (after FIX ROUND 2), m#524, m#513, b#855; (2) the four iOS-build mobile PRs
(HEALTH-STRINGS-130, SESSION-KEEP-130, FOOD-GATE-RETRY-130, MONEY-INBOX-130); (3) everything else as it turns READY. Instances A, C, E take
the oldest READY first; B and D the newest first; within a group, T4/T3, money, consent, privacy and Roman PRs first.
Per PR: re-check the head on GitHub; post `OPUS LENS CLAIM (<your ID>) @ <full sha>`; re-read the comments: if an earlier live OPUS LENS CLAIM
for the same head exists, delete yours (`gh api -X DELETE repos/<owner>/<repo>/issues/comments/<id>`) and move on. Review: full review 30
minutes, delta re-review 20 minutes (when an Opus lens reviewed an earlier head: the delta plus whether its Bs are fixed; no new Bs in
unchanged code unless they meet SoT A2 override item 1). Never read a GPT-6.1 Sol verdict at that head before posting yours. Apply SoT A2
overrides 1-11 strictly. Size over 1,500 changed lines (lockfiles, generated files and snapshots excluded; tests count) = REQUEST CHANGES
"SIZE FAIL (over 1,500 lines)". Mobile UI PRs: the six redo rules in _COMMON are acceptance criteria (false copy is a B; dead buttons;
parity table and parity test; theme colours only). Backend T4: caller-scoped queries, consent gates, PII in logs and egress, money, flags keep
main inert. Re-check the head right before posting; if it moved, start over at the new head. Post ONE comment (format in _COMMON item 5).
Report: one line per verdict in /home/user/workspace/ops/reports/<your ID>.md. No code edits, no other comments.
Idle: sleep 180 and re-read the board. After 60 minutes in a row with an empty queue, write your report and finish (the operator relaunches).

## LN-SOL-130 (GPT-6.1 Sol, LENS, T1-T4): instances LN-SOL-A-130 .. LN-SOL-G-130
Exactly LN-OPUS-130, but you are the GPT-6.1 Sol lens: your queue is heads with no "AUDIT GPT-6.1 Sol" verdict; claim with
`SOL LENS CLAIM (<your ID>) @ <full sha>`; never read a Claude Opus 5.5 verdict at that head before posting yours; verdict first line
`AUDIT GPT-6.1 Sol (<your ID>) — growth-project-<repo>#<n> @ <full sha> — VERDICT: APPROVE` (or REQUEST CHANGES). Instances A, C, E, G take
the oldest READY first; B, D, F the newest first. Flag-manifest PRs (.github/fly-env-desired-state.json, e.g. b#855): check values against
src/common/env-validation.ts closed sets, scripts/fly-env/fly-env-manifest.js PRECONDITIONS and the gate text. Eight PRs waited for Sol on
10-07: keep moving; short verdicts.

## FIX-130 (fix lanes): FIX-OPUS-130 (Claude Opus 5.5) and FIX-SOL-130 (GPT-6.1 Sol)
A PR is in a fix queue when, at its CURRENT head: (a) a lens REQUEST CHANGES exists and no READY is newer than it; (b) both lenses APPROVE
but it conflicts with main; (c) the latest READY names the head but a required check failed; or (d) a push exists with no FIX ROUND / READY
comment. FIX-OPUS-130 takes Opus-built PRs and every T3/T4, money, consent, privacy or Roman PR; FIX-SOL-130 takes Sol-built T1/T2 PRs.
Group A at 18:06 (verified):
- FIX-OPUS-130: (1) b#861 @ c3f69a8a: FIX-OPUS-129 pushed a fix for B-861-SOL-129-1 at 17:43 but posted no READY. Verify the fix and its
  regression test against the Sol finding, CI green, then post `FIX ROUND 2 (ROMAN-GUARD-129, agent 130, FIX-OPUS-130) — ... @ c3f69a8a... —
  READY FOR AUDIT` naming B-861-SOL-129-1 fixed (fix again first if it is not). (2) m#513 @ 79e0760d (T3): fix B-513-SOL-129-1: remove or
  reword "only when something new was added" (AIBudgetTutorialModal.tsx:81-98) so it is true with PB-GAP-130's rule (at most one rebuild per
  coach every 6 hours, only when the coach's sources changed); keep the credit-spending disclosure; update both copy assertions. (3) b#855
  @ f92f6936 (T4 flag, never READY): ONLY after PB-GAP-130 has merged (the operator messages you when it is deployed) and m#513 has merged:
  merge origin/main (conflicts in .github/fly-env-desired-state.json and docs/runbooks/launch-flags.md: keep main's FEATURE_ROMAN_MEMORY
  "true" and its gate text; set only FEATURE_ROMAN_PLAYBOOK "true"), add the precondition evidence (PB-GAP-130 PR + deploy, m#513 merge) to the
  body, test/ci/fly-env-manifest.spec.ts and test/roman/r11-seams.spec.ts pass, CI green, post `FIX ROUND 1 (OPENING) (FLIP-PB-128, agent 130,
  FIX-OPUS-130) — ... — READY FOR AUDIT`. Never run fly-env-sync (the operator applies after merge).
- FIX-SOL-130: (1) m#524 @ 0eca5fc2 (T1, Sol-built): both lenses found the same B: add `initial: false` to the two Home navigate calls
  (HomeScreen.tsx:320-326 WorkoutTab/ActiveWorkout and :330-333 MoreTab/WorkoutAssignmentDetail), update the two test expectations, add the
  Resume -> Discard -> Train regression; delete the stale FIX CLAIM (FIX-SOL-129) only if the operator has not already.
Then new PRs as they hit (a)-(d). Claim with `FIX CLAIM (<your ID>) @ <full sha>`; re-read; if an earlier live FIX CLAIM (under 60 minutes)
exists for that head, delete yours and move on. Worktree per PR: `git -C /home/user/workspace/growth-project-<repo> fetch -q origin <headRefName>
&& git -C /home/user/workspace/growth-project-<repo> worktree add /home/user/workspace/wt/FIX-<n>-<repo> origin/<headRefName>` then
`git -C <wt> switch -c <headRefName>` if needed and push to that same branch; remove the worktree when done. Read the PR body, the job entry it
names, the builder's report in /home/user/workspace/ops/reports/ and BOTH verdicts in full. Fix ONLY the Bs (plus a U if it is one line),
each with a test where behaviour changes. Merge origin/main, run the touched tests via /home/user/workspace/ops/heavy.sh (or let CI prove
them), push ONCE, CI green (poll every 180 s), then post the FIX ROUND READY listing each finding fixed with file:line. A finding you judge
wrong: answer it in that comment with file:line evidence. Never merge. One line per PR in /home/user/workspace/ops/reports/<your ID>.md.
Idle: sleep 180, re-read the board. Run until the operator stops you.

# ---- Group B finishers (procedure for every *-FIN-130 entry) ----

## FINISH-130 (applies to MONEY-PLANS-FIN-130 ... ROMAN-COPY-B-FIN-130)
Your FIX_PLANS row (section B) names the branch or patch and what is left. Read the original builder's report
(/home/user/workspace/ops/reports/CF-<NAME>-128.md, the HANDOFF section first) and the CLIENTFIX-128 row in JOBS128.md it came from.
- Branch finishers: your worktree is on the branch at its verified head. `git merge origin/main` first (all nine merge cleanly at 18:06).
- Patch finishers: your worktree is on a fresh branch agent130/<id-lower> from origin/main; `git apply` the patch from
  /home/user/workspace/tgp-agent-context/handoffs/op-129/reports/<CF-...>.wip.patch (passes --check on main 028f2926), then finish it.
Finish exactly what the row lists (failing-first test proof, test updates, README row, parity table for screens), keep the diff to the
row's scope, open the PR (`gh pr create -R BradleyGleavePortfolio/growth-project-<repo> --base main --head <branch>`), body = tier header
(SoT A3 8.1) + "What changes for coaches and clients" + B/U list + any before/after table the row asks for. CI green, READY, HANDOFF, end.

# ---- Recon 130 adjustments (win over FIX_PLANS where they differ) ----
| ID | adjustment from recon (18:06) |
|---|---|
| MONEY-PLANS-FIN-130 | branch 96 commits behind main, merges clean; 486 lines; shares src/screens/client/README.md with m#524 (own row in place). |
| MONEY-MEMBER-FIN-130 | 81 behind, merges clean; 565 lines. |
| SETTINGS-FIN-130 | 96 behind, merges clean; 398 lines. GO FIRST AND FAST: FAST-CALM-FIN-130 (useSettings.ts) and SESSION-KEEP-130 (SettingsScreen.tsx) wait for or adapt to your merge. The Fasting alerts row is at SettingsScreen.tsx ~:336 on main; no cancelFastEndAlert call exists there yet. |
| COMM-THREAD-FIN-130 | b#862 merges at about 18:10 and deploys in deploy 29; open the PR and post READY when deploy 29 is live (operator messages you); prepare everything before. |
| LOGPLAN-FIN-130 | m#490 merged at 17:17: wire-in is unblocked. |
| TRAIN-TAB-FIN-130 | patch is about 1,070 changed lines (over the 800 target): trim to the row's scope; split into two PRs if it stays over 800 of non-test source. Do not touch ActiveWorkoutScreen.tsx. |
| FAST-CALM-FIN-130 | after SETTINGS-FIN-130 merges (useSettings.ts). Also touches ClientNavigator.tsx and WidgetsScreen.tsx. |
| SHARE-GATE-FIN-130 | the three extra reads live at src/coach/home/coach-home.service.ts:190-195, src/v1/v1-coach.service.ts:144-155 and src/coach/command-center/command-center.controller.ts:237 (paths differ from the plan). COACH-ROW-SCRUB-130 waits for you: go fast. |
| ALLERGY-FIN-130 | 797 lines, has a migration: make the migration timestamp newer than every migration on main, additive only, say so loudly in the body. ALLERGY-M-130 waits for your deploy. |
| COACH-PAY-BE-FIN-130 | 792 lines; shares src/common/env-validation.ts with b#864 (merging at about 18:10): merge origin/main after it. New flag stays off. COACH-PAY-M-130 waits for your deploy. |
| ROMAN-COPY-B-FIN-130 | shares src/roman/roman.prompts.ts surfaceFraming with COACH-ROMAN-SURFACE-130 (waits for you) and test/roman/r11-seams.spec.ts with b#855. Go fast. |
| SESSION-KEEP-130 | NEW overlap: SettingsScreen.tsx is also changed by SETTINGS-FIN-130. Keep your SettingsScreen hunk to the sign-out confirm only; merge origin/main after SETTINGS-FIN-130 merges, before READY. api.ts performRefresh :231, handleRefreshFailure :287. iOS build PR. |
| FOOD-GATE-RETRY-130 | files match main (PaywallSheet COACHLESS_* at :45-47). iOS build PR. |
| MONEY-INBOX-130 | normalizeNotification at notificationsApi.ts:310; pushTapRouter.ts has no UpdateCard route yet. iOS build PR. |
| MONEY-DUNNING-COPY-130 | the owner's yes on the locked copy is pending: build, READY, and say in the body "Owner decision pending: merge only after the owner's yes". Copy at dunning-v2.copy.ts:51-79, ROMAN_STEMS :221, dispatcher :220. |
| COACH-AI-GATE-130 | files match main; ConsentService.coachCanAccess is in src/consent/consent.service.ts. |
| COACH-ROW-SCRUB-130 | after SHARE-GATE-FIN-130 merges (coach.service.ts: archiveClient :325, unarchiveClient :359, getClientTimeline :402). |
| COACH-ROMAN-SURFACE-130 | NEW wait: after ROMAN-COPY-B-FIN-130 merges (same function surfaceFraming in roman.prompts.ts, adjacent lines). Default fix: reword (owner decision 2 default). |
| HEALTH-STRINGS-130 | NOT in any build yet (no 10-07 build has been cut): it must merge before the 23:00 cut. app.json:29-30 and :195-196; HealthKit client is src/services/health/healthkit/healthKitClient.ts. GO FIRST: READY within 45 minutes. |
| PB-GAP-130 | start now. Your rule must keep m#513's final copy true (FIX-OPUS-130 rewords it): at most one rebuild per coach every 6 hours, including the run 3 minutes after a restart. b#855 waits for your merge + deploy. |
| ALLERGY-M-130 | after ALLERGY-FIN-130 is deployed: read-only prep now (waiting rule). |
| FOOD-UNDO-M-130 | start now: b#858 is deployed (deploy 28, 17:50). |
| COACH-PAY-M-130 | after COACH-PAY-BE-FIN-130 is deployed: read-only prep now (waiting rule). JOBS129 entry COACH-PAY-M-129. |

# ---- New: owner order 2026-10-07 18:02 PDT ----

## CREDIT-REFILL-130 (Claude Opus 5.5, AUDIT THEN BUILD, T4 money; one PR per repo if fixes are needed, under 800 lines each)
Owner, verbatim: "make sure that coaches can ACTUALLY pay TGP for credit pool refills - and that the multiplier between the displayed value
of purchased credits and hard cost amount for TGP is correctly quoted and delivered!"
Prove, end to end on main and production (read-only), with file:line and "seen in a test" / "from the code" labels:
1. A coach can reach the refill in the app and pay: mobile src/components/coach/ai-budget/* (PackOptionsRow.tsx, AIBudgetMeter.tsx,
   AIBudgetHardPauseModal.tsx, AIBudgetBanner.tsx, AIBudgetMount.tsx), src/api/coachAiBudgetApi.ts, CoachNavigator.tsx -> backend
   src/ai-credits/coach-ai.controller.ts + credit-pack-checkout.dto.ts -> coach-ai-credit-pack.service.ts (mints a Stripe Checkout Session,
   metadata tgp_kind 'coach_ai_credit_pack' and tgp_ai_pack_purchase_id) on the PLATFORM Stripe account (TGP is paid, not a coach's
   connected account; no application fee or transfer) -> the webhook route that delivers checkout.session.completed / expired to
   handleStripeEvent (find the router in src/billing or src/stripe; is the event subscribed?) -> the credit grant. Every tier
   (1000/2500/9900 cents) and the custom amount ($10-$500).
2. The multiplier is quoted and delivered correctly: ai-credits.constants.ts COACH_AI_VALUE_MULTIPLIER_DEFAULT 3.125 ("displayed = actual x
   multiplier"), the production env values (env-validation.ts ~:2896-2901 require explicit values: confirm they are declared in
   .github/fly-env-desired-state.json without printing secrets), bankers-round.util.ts rounding. Check, with numbers: what the coach is shown
   before paying, what the receipt/checkout line says, what the pool is credited after payment, and how each AI call debits the pool (actual
   provider cost x the same multiplier everywhere; coach-ai-budget.service.ts). Displayed value must equal paid value x the multiplier rule the
   code states, and the debit must use the same rule. Any mismatch is a B (money wrong).
3. Production read-only: SELECT counts only (no rows printed with personal data) of credit pack purchases and pool rows; any stuck pending
   purchase.
4. Store rules: how the iOS app takes the payment (in-app Stripe sheet vs an external web checkout). Check the current App Store Review
   Guidelines 3.1.1 / 3.1.1(a) and 3.1.3 for digital credits bought by a business user; report a B with the smallest compliant fix if needed.
   Do not change store policy; propose with a default.
Then fix every B (money wrong, a refill that cannot be paid or is not delivered, a false quote) with failing-first tests: backend PR on branch
agent130/credit-refill-130 (worktree /home/user/workspace/wt/CREDIT-REFILL-130-backend); a mobile PR if needed in a second worktree
(`git -C /home/user/workspace/growth-project-mobile worktree add -b agent130/credit-refill-m-130 /home/user/workspace/wt/CREDIT-REFILL-130-mobile origin/main`).
Do not edit src/components/coach/ai-budget/AIBudgetTutorialModal.tsx until m#513 merges. No flag flips, no Stripe changes, no production
writes, spend nothing. If no B exists: no PR; the report proves each step with file:line and a passing test. READY per _COMMON, then end.

# ---- Added 19:00 PDT from CREDIT-REFILL-130's findings (owner order 18:02; ops/reports/CREDIT-REFILL-130.md) ----

## CREDIT-METER-130 (Claude Opus 5.5, BUILDER, T4 backend, additive migration, under 800 lines)
Owner order 18:02: the multiplier must be "correctly quoted and delivered". Fix B2 of /home/user/workspace/ops/reports/CREDIT-REFILL-130.md:
four debit paths round each AI call UP to a whole hard-cost cent (src/ai/ai.service.ts:185-190 aiGuideCostCents, src/ai/gateway/
ai-gateway.service.ts:714-715, src/roman/roman.service.ts:1658, src/roman/background/roman-background-spend.ts:212; coach meal plans round to
nearest at src/ai/adapters/anthropic.adapter.ts:236-240), so a 0.5-cent call debits 1 cent (6.25x instead of 3.125x). Smallest correct fix
(report Proposed 2): an additive migration adding an exact sub-cent usage total to CoachAIBudget (BigInt, default 0, name per schema
conventions); every debit path passes the exact cost; the whole-cent used figure becomes the ceiling of the period total (one round-up per
period, under one hard-cost cent per coach); canCharge / hard stop / displayed math keep their meaning; the monthly rollover resets the
sub-cent total. Failing-first tests with the report's numbers (1,500 in / 200 out = 0.5 cents; 6,000 / 400 = 1.6; 20,000 / 1,500 = 5.5).
U3 (flat 5-cent debit when no token counts, ai-gateway.service.ts:705-710): trace; fix only if one line, else report it.
Overlaps: b#870 (CREDIT-REFILL-130, READY) edits coach-ai-budget.service.ts rollover: build on origin/main, then `git merge origin/main`
after b#870 merges, before READY. CREDIT-PAY-130's backend PR edits the pool-empty strings in ai.service.ts, ai-gateway.service.ts and
roman.constants.ts (different lines): merge origin/main after it merges. Migration timestamp newer than every migration on main AND on
b#868 (ALLERGY-FIN-130, READY, adds a Recipe migration); additive only, with down.sql; say so loudly in the body (deploy needs
migrations=apply-migrations). Production: read-only aggregate SELECTs only. Worktree /home/user/workspace/wt/CREDIT-METER-130-backend
(branch agent130/credit-meter-130).

## CREDIT-PAY-130 (Claude Opus 5.5, BUILDER, T4 money; one mobile PR + one small backend PR, each under 800 lines)
Owner decision 10 is PENDING (refill pay path). Build now; both PR bodies start with "Owner decision 10 pending: merge only after the
owner's yes." Fix B3 of /home/user/workspace/ops/reports/CREDIT-REFILL-130.md with its Proposed 1 default (also the owner's recorded
09-30 fallback, SoT "Fallback if Apple disagrees: an external link to web checkout on the US storefront (3.1.1(a))"):
- Mobile (worktree /home/user/workspace/wt/CREDIT-PAY-130-mobile, branch agent130/credit-pay-m-130): on iOS, show the three packs and the
  custom amount in the existing AI budget surfaces (PackOptionsRow.tsx, AIBudgetHardPauseModal.tsx, the CreditPackCheckout route that
  withNonP2PPurchaseGate.tsx now blocks) and open the Stripe Checkout URL that POST /coach/ai/credit-packs/checkout mints in the SYSTEM
  browser (expo-web-browser or Linking; no new native dependency), not the in-app WebView. Keep everything else purchaseSurfaces.ts hides
  (group products, seat upgrades) hidden; coach 1:1 packages unchanged; Android release builds stay hidden. US storefront only: if the app
  cannot read the storefront with existing dependencies, gate with a build-time switch and say in the body that the app must be offered
  only on the US App Store (owner action in App Store Connect) and that the App Review notes must mention the US external link. Copy rules
  (no first person, no exclamation marks, no emojis, plain words; say the coach pays TGP and the price). Do not edit
  AIBudgetTutorialModal.tsx until m#513 merges (board). Aim: READY by 21:30 so the owner can include it in the 23:00 build.
- Backend (worktree /home/user/workspace/wt/CREDIT-PAY-130-backend, branch agent130/credit-pay-130): the pool-empty copy
  (src/roman/roman.constants.ts:221, src/ai/ai.service.ts:181, src/ai/gateway/ai-gateway.service.ts:288) tells the coach to add a credit
  pack only when the request's X-Client-Purchase-Policy header (sent by the app, mobile src/services/api.ts:159) allows it; otherwise it
  gives the date the pool renews. Return pages (U2): set non-secret COACH_AI_PACK_SUCCESS_URL / COACH_AI_PACK_CANCEL_URL in
  .github/fly-env-desired-state.json to a link that returns the coach to the app (check env-validation.ts closed sets and the deep-link
  scheme; never `fly secrets set`; the operator applies fly-env-sync after merge). Keep this PR small and fast: CREDIT-METER-130 merges
  main after it.
No Stripe changes, no production writes, spend nothing. READY per _COMMON for each PR, then end.

## COACH-ROMAN-ROW-130 (GPT-6.1 Sol, BUILDER, T2 mobile copy, under 100 lines) - added 19:3x from COACH-ROMAN-SURFACE-130 (b#873)
Mobile half of the delegated coach-Roman B2 (ops/reports/COACH-ROMAN-SURFACE-130.md, Needs operator 1): the coach Settings Roman row
still promises "Ask for a brief, a client read, or the next step." (CF-COACH-SETTINGS-AI-129), but coach Roman cannot see clients
(b#873). Change it to exactly "Ask about programming, nutrition or running your practice." Find every copy of the old line (rg the
mobile repo, including tests and snapshots) and change only those; failing-first test that pins the new line. No other copy changes.
Worktree /home/user/workspace/wt/COACH-ROMAN-ROW-130-mobile (branch agent130/coach-roman-row-130). Aim: READY by 21:00 for the 23:00 cut.
