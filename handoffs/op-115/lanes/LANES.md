# Agent 115 SCALE 2 wave — 16 lanes (9 builders on Claude Opus 5.5, 7 lenses). All T4 unless stated.
Read /home/user/workspace/ops/lanes115/_COMMON_115.md first. Heads below verified 10:20 PDT 10-03. Queue items are in priority order:
finish item 1 to READY FOR AUDIT, then start item 2 while audits run, and come back to item 1 the moment a verdict lands.

## BUILDERS

### B-FEE-9 — backend #627 (coach payout = price - actual Stripe fee - 2%) -> mobile #321 -> backend #661
1. #627 @cd332bfa: FIX ROUND 9 for Sol RC 0/1/0 (comment 5964932906, B-627-9 narrowed): a sender paused after the claim commit and
   before the Stripe call executes after a new holder's empty listing -> markFailed + repay alert on a paid transfer. Direction: adopt
   the existing attempt with the SAME Stripe idempotency key; re-prove the lease right before the Stripe call; turn Sol's probe into the
   failing-before test. Close every open Opus/Sol C you can. First money merge of the wave: highest priority in the whole system.
2. mobile #321 @4f5b058d (dual APPROVE, BEHIND): after #627 merges the operator update-branches it; if DIRTY you resolve (merge-only).
3. backend #661 @91625c86 (never return or keep client Stripe PaymentSheet credentials; RC Opus 0/1/3 + Sol RC): full fix round.
Lenses: AUD-OPUS-MONEY + AUD-SOL-MONEY (backend); AUD-OPUS-MOB-PAY + AUD-SOL-MOB (#321).

### B-RECUR-3 — backend #654 (native Stripe subscriptions + free trials via PaymentSheet) + mobile #334 (renewing plans sheet)
1. #654 @795110b7 (base = #627 branch agent/clinic/s-fee-coach-net): fix round for Sol RC 0/4/0 + every Opus C from earlier rounds;
   needs a full Opus audit after. When #627 merges, the operator retargets #654 to main; you then merge origin/main and resolve.
   Compose with #656 (trials) in either order; if #628 merged first, unify the never-entitled check into one helper.
   Owner/operator pre-deploy note stays in the body: platform Stripe webhook must include setup_intent.succeeded.
2. mobile #334 @0629d506: Sol RC 0/2/1 (comment 5965000602): B-334-3 unknown native completion reported as "nothing was charged" ->
   read canonical server state first; B-334-4 displayed trial/renewal terms not reconciled with the returned intent before the sheet.
   OR-112-22: Day 1 sheet payment failure is a launch blocker. #334 merges only after #654 and #628 are deployed.
Lenses: AUD-*-MONEY (#654); AUD-OPUS-MOB-PAY + AUD-SOL-MOB (#334).

### B-DUNNING-7 — backend #628 (dunning v2: 10-day lockout + native card update) + mobile #322 -> backend #642
1. #628 @bba11793: fix round for Sol RC 0/1/1 + open Opus Cs; include the residual: Stripe idempotency keys expire after 24 h, so
   reconciliation must never read an unreconciled >24 h receipt as paid (in #628 if small, else a follow-up PR you own).
2. mobile #322 @23435ec2 (dual APPROVE, BEHIND): updates after #628 deploys; resolve conflicts; ClientPackagesScreen.tsx rule (second to
   merge keeps the native card-update screen).
3. backend #642 @85950984 (GOOGLE_CLIENT_IDS -> github-secret, Google sign-in flag; RC/RC at that head): full fix round. OR-112-1 says
   it flips only after #608 is deployed (it is). Never change production flags yourself.
Lenses: AUD-*-MONEY (#628, #642); AUD-OPUS-MOB-PAY + AUD-SOL-MOB (#322).

### B-TRIALS-3 — backend #656 (real free trials on recurring packages) + mobile #338 (coach trial-days input)
1. #656 @079e9e39: fix round for Sol RC 0/5/1 + open Opus Cs. Must compose with #654 in either merge order (state it in the body).
2. mobile #338 @0db17866 (Sol APPROVE; Opus pending): fix whatever Opus raises; resolve BEHIND conflicts if DIRTY.
3. Backlog in your lane: card removed mid-trial still shows "will charge" and sends no trial-ending notice -> store card state on the
   purchase and show the truth (in #656 if it fits the round, else one follow-up PR you own).
Lenses: AUD-*-MONEY (#656); AUD-OPUS-MOB-PAY + AUD-SOL-MOB (#338).

### B-COACH-5 — backend #641 (coach Money read model, truthful Connect status) + mobile #332 -> #329 (+ CSV follow-up)
1. #641 @0d3d04de: fix round for Sol RC 0/2/1 + open Opus Cs; add the operator alert (Sentry/ops alert, not a log line) + runbook line
   for head-coach reversals still owed after 23 h (ruling 20:44 10-02).
2. mobile #332 @6c193c80 (base = #329 branch; Sol APPROVE, Opus pending): fix whatever Opus raises. When dual-approved the operator
   merges it into #329's branch.
3. mobile #329 @3a90f28a (BLOCK/BLOCK; A-329-1 waited for #332): after #332 lands in its branch, merge main, close every open finding,
   READY FOR AUDIT. Follow #641's current contract (idempotent package create with the same Idempotency-Key).
4. OR-114-4: one follow-up mobile PR: #332 CSV export as a real .csv attachment (expo-file-system, SDK-matched version). Append it to
   q/AUD-OPUS-MOB-PAY.txt and q/AUD-SOL-MOB.txt.
Lenses: AUD-*-MONEY (#641); AUD-OPUS-MOB-PAY + AUD-SOL-MOB (#332, #329, CSV PR).

### B-NOTIF-6 — backend #648 (device push via Expo, PushOutbox, quiet hours) [+ #647 if Opus RC] -> mobile #312 -> mobile notif PR
1. #648 @16294f44: fix round for Sol RC 0/3/1 + open Opus Cs. Quiet hours 21:00-08:00 in the recipient's zone (OR-113-5). Check that
   coach messages (including the welcome) reach the lock screen; fix in #648 if in scope. No Android delivery claim without the FCM key.
   #647 @df4eb80b (Sol APPROVE, Opus pending) is yours too if Opus raises anything.
2. mobile #312 @2b54e151 (workout reminders toggle; dual APPROVE, DIRTY with main): resolve the conflict (merge-only round). Merges
   after #609 deploys.
3. One new mobile PR: send the device zone on sign-in and foreground (PUT /notifications/timezone); notification tap opens the session
   (C-648-3; backend sends sessionId); Quiet hours screen payload fix. Append it to q/AUD-OPUS-MOB-CORE.txt and q/AUD-SOL-MOB.txt.
Lenses: AUD-*-CORE (#648, #647); AUD-OPUS-MOB-PAY + AUD-SOL-MOB (#312); AUD-OPUS-MOB-CORE + AUD-SOL-MOB (new PR).

### B-MOB-A — mobile #326 -> #315 -> copy-sweep PR -> #331
1. #326 @4ae5210d (dual APPROVE, BEHIND main 4f1d74d8 which changed src/services/sentry.ts in #327): merge origin/main, resolve the
   sentry.ts seam keeping both behaviours, targeted tests, merge-only FIX ROUND -> deltas. First mobile merge of the wave.
2. #315 @0ef94ddf (dual APPROVE, BEHIND): same (sentry.ts seam). Never "180 days" anywhere. Merges with backend #611 (owner answers
   pending); squash with the PR title only.
3. New mobile PR (OR-115-4, T2+): copy sweep on main: "On our side" in RomanAiConsentScreen; retired-period comment in consentVersion.ts;
   shared SupportEmailFallback "write to us" (OR-112-21: impersonal copy); first-person error copy in src/lib/inviteAttachOutcome.ts,
   src/lib/intendedRole.ts, src/utils/authFailure.ts, src/utils/authErrorMessage.ts, src/components/invite/PasteInviteCodeButton.tsx,
   src/components/community/ChallengeProgressSheet.tsx; plus a repo-wide voice guard test (no we/us/our, no "!" in user-facing strings).
   Append to q/AUD-OPUS-MOB-CORE.txt and q/AUD-SOL-MOB.txt.
4. #331 @ec2857ba (your conversations with Roman; Opus RC, Sol BLOCK A-331-4, DIRTY): fix round after #326 merges (OR-112-8 order).
Lenses: AUD-OPUS-MOB-CORE + AUD-SOL-MOB.

### B-MOB-B — mobile #305 -> #317 -> #325 -> #335
1. #305 @4ac5980e (RC/RC on B-305-12): round 6: filter Sentry's ExpoContext integration (raw native emergencyLaunchReason must never
   reach Sentry, JS events or native crash scope), scrub contexts.ota_updates, promote the real-SDK probe to the canary; merge main.
2. #317 @cfa99ce3 (dual APPROVE, held): round 5 for builder finding B-317-11 (stale on-device import acts on the next sheet -> fence
   import completion by attempt epoch); merge main. OR-115-5: the second of #305/#317 to merge fixes the OTA_UPDATES.md clinic Health
   Connect line; app.json neighbours: second to merge keeps both.
3. #325 @7566d38f (draft; needs only Opus + Sol delta now): keep it current; it leaves draft and merges only after backend #634 merges
   AND deploys (operator tells you via your report path or a PR comment).
4. #335 @18f17460 (reachability map + wiring + coach consultation answers; Sol BLOCK, DIRTY): fix round (OR-113-13 rulings).
Lenses: AUD-OPUS-MOB-CORE + AUD-SOL-MOB.

### B-SCHED-ROMAN — backend #634 -> #651 -> #603 carry-over PR -> #653
1. #634 @9e6c62c9 (Opus APPROVE, Sol RC 0/1/0 B-634-10): round 5: closed error-class enum in safeLogDiagnostic (unknown -> OtherError),
   keep validated Prisma P-codes, drop or catalog non-ORM .code, logger-boundary canaries. Small; do it first (it unblocks mobile #325).
2. #651 @a8fa651c (Opus RC A0/B3/C4, Sol RC 0/10/3): LARGE round 2 closing both lenses' findings in one round (B-651-1..9 etc.), with
   OR-115-1 and OR-115-2 applied. Read the full Roman spec in the PR body and prior rounds first.
3. New backend PR (OR-115-3): #603 carry-overs: 2,000-character message cap and AI Guide calorie floor (1200 F / 1500 M). Append to
   q/AUD-OPUS-CORE.txt and q/AUD-SOL-CORE.txt.
4. #653 @17b2be25 (S-SCHED-5 booking request auto-expiry, stacked on #634's branch): after #634 merges, retarget is the operator's;
   merge main, close findings (OR-112-5 + OR-113-9: 48 h / 1 h before / 30-min minimum; quiet close > 24 h). Mobile #336 is out of
   scope this wave.
Lenses: AUD-OPUS-CORE + AUD-SOL-CORE.

## LENSES (queue files in /home/user/workspace/ops/lanes115/q/; model per MODEL_ROUTING T4)
- AUD-OPUS-MONEY (Claude Opus 5.5) and AUD-SOL-MONEY (GPT-6.1 Sol): backend #627 #654 #656 #628 #641 #661 #642. Opus owes a FULL audit on
  #654, #656, #628, #641 at their next READY heads.
- AUD-OPUS-CORE (Claude Opus 5.5) and AUD-SOL-CORE (GPT-6.1 Sol): backend #640 #647 #609 #652 #648 #664 #634 #651 #653 (+ the #603
  carry-over PR). Opus starts now on #640, #647, #609, #652 (Sol already APPROVE at those heads) and #664.
- AUD-OPUS-MOB-PAY (Claude Opus 5.5): mobile #338 #332 #329 #321 #334 #322 #328 #312 (+ CSV PR). Starts now on #338 and #332.
- AUD-OPUS-MOB-CORE (Claude Opus 5.5): mobile #325 #326 #315 #305 #317 #331 #335 (+ notif PR, copy-sweep PR). Starts now on #325 delta.
- AUD-SOL-MOB (GPT-6.1 Sol): every mobile PR above. Starts now on #325 delta.
