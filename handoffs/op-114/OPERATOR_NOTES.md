# OPERATOR NOTES (agent 114 → sub-manager 114-S)

Only operator agent 114 edits this file. The sub-manager reads it every loop; it overrides the handoff document.
Handoff: [TGP-SubManager-Handoff-114S.md](TGP-SubManager-Handoff-114S.md) · Sub-manager status: [SUB_STATUS.md](SUB_STATUS.md)

Updated: 2026-10-02 18:25 PDT.

## The next 12 PR sets (verified 18:20 PDT; all T4)

Stages:

| Stage | Meaning |
|---|---|
| S1 | Builder work needed |
| S2 | Fix pushed, CI green, needs audits |
| S3 | Audits running |
| S4 | Merge-ready |
| S5 | Merged |

| # | Owner | PR set | Head | Round | Stage | Next action |
|---|---|---|---|---|---|---|
| 1 | Operator | backend #627 coach payout = price − actual Stripe fee − 2% (+ mobile #321, dual APPROVE @4f5b058d, BEHIND) | 7c29d981 | R7 pushed (B-FEE-R7: Sol RC 0/1/2 and Opus APPROVE at c1d69c7f) | S2 | Sol re-audit + Opus delta; then #321 main merge + delta |
| 2 | Operator | backend #654 recurring packages: native Stripe subscriptions and free trials via the PaymentSheet (stacked on #627) | c95ec9da | R0 (never audited) | S1 | Fix `test/coach-payments-field-select.spec.ts`; retarget to main after #627 merges; first dual audit |
| 3 | Operator | mobile #334 Day 1 package sheet pays through payment-intent; recurring half still to build (pairs with #654) | 5b6eb654 | R0 (never audited), BEHIND | S1 | Builder adds the recurring subscription path through the same PaymentSheet; first dual audit |
| 4 | Operator | backend #608 account deletion (+ #636 composed; + mobile #327, dual APPROVE @395c3312, now DIRTY) | 9650ce14 | R7 pushed (B-EXPORT-4, after Opus RC + Sol RC at bdadfcb4) | S1 | Fix CodeQL alerts (`test/data-export-storage.spec.ts` call-to-non-callable x4, `data-export.service.ts:1024`); dual audit; #327 conflict + delta; C-636-6 probe before deploy |
| 5 | Operator | backend #611 privacy policy + consumer health data policy (re-graded T4) | fda3afad | R5 (Opus APPROVE; Sol RC 0/2/0: unsafe restore procedure) | S1 | Fix round 6; publication hold until the owner answers four items |
| 6 | Operator | mobile #314 community report/block/moderation (Apple 1.2); follow-ups backend #650 (flags) + #652 | 47398f73 | R7 pushed (B-UGC-7 for Opus RC at 54c2535e) | S2 | Opus delta + Sol delta; merge; then #650/#652 and the community flag flip |
| 7 | 114-S | mobile #305 expo-updates OTA | 279dd8e3 | R4 + main merge | S2 | Full dual re-audit |
| 8 | 114-S | mobile #317 Apple Health / Health Connect | cf387e88 | S-WEAR-3 round | S2 | Sol re-audit + Opus delta |
| 9 | 114-S | mobile #326 AI-consent errors | 16e7e97c | R2 (Sol RC 0/1/0) | S1 | Round 3 (B-326-2 identity fence) + deltas |
| 10 | 114-S | mobile #315 trust-center policy links | d545f5b6 (DIRTY) | R3 (Sol RC 0/1/0) | S1 | Round 4 (conflict + B-315-1) + deltas |
| 11 | 114-S | backend #634 + mobile #325 booking lifecycle | bb6f3ea8 / 268ed81b | #634 R2; #325 main merge | S2 | Dual re-audit #634; #325 main merge + dual delta |
| 12 | 114-S | backend #651 live Roman grounding | 33a86da4 | R0 (CI red) | S1 | Fix 2 test type errors; first full dual audit |

## Merge train (operator merges; whoever reaches READY first goes first, except where a sequence applies)

Backend:
- #634 can go first (green, round 2).
- #627 → then #654 is retargeted to main.
- #608 needs the C-636-6 pre-deploy probe.
- #651 and #611 go whenever they're ready; #611 waits for owner answers.

Mobile:
- #314 → #305 → #317 → #326 in order of READY.
- #325 goes only after #634 is merged and deployed.
- #321 goes with #627; #327 with #608; #334 with #654.
- #315: the operator sets timing relative to #611.

**Bring a PR current only when it's next.** After each merge, the operator posts "MERGED <repo>#<n> → <sha>; next: <repo>#<n>" here.

## Rulings and answers for 114-S

- (none yet)

## Merged log

- (none yet)

## Train log (agent 114, newest last)
- 18:26 PDT batch 1 launched: AUD-SOL-114, AUD-OPUS-114, B-RECUR-BE (#654), B-RECUR-MOB (#334), B-EXPORT-5 (#608/#327), B-PRIV-6 (#611).
- 18:31 PDT AUD-SOL-114: APPROVE backend #627 @7c29d981 (0/0/1; B-627-8 closed), mobile #314 @47398f73 (0/0/0), backend #645 @f50de1b0 (0/0/0).
  Sol lane finished (QUEUE EMPTY); re-queued by message when #608/#327/#654/#334/#611 are ready. C-627-2 seam: whichever of #627/#608 lands
  second classifies ChargeSettlement.coach_user_id/head_coach_user_id, PayeeRecovery.payee_user_id, PayoutAdjustmentNotice.payee_user_id in
  #608's finance-retention manifest -> assigned to B-EXPORT-5 (expected order: #627 first).
- 18:45 PDT RULING OR-114-2 (all backend PRs, incl. 114-S): the required check "npm audit (high+critical, whole graph)" now fails on
  every backend PR because of GHSA-vfj7-8cjw-p6xm (braces <= 3.0.3, dev-only via micromatch, NO patched version). Builders must NOT
  chase it inside feature PRs and must not edit the lockfile for it. Lane B-AUDIT-GATE (operator) opens one T4 PR on main: time-boxed
  (expires 2026-10-31), dev-only-verified, self-expiring exception; the gate stays fail-closed for everything else. After it merges,
  each backend PR merges main when it is next in the merge train. Auditors judge PRs on their own content meanwhile.
- 18:44 PDT B-EXPORT-5: backend #608 FIX ROUND 8 @1cbecbdc (CodeQL 0 open alerts; 10/11 green, npm audit = OR-114-2); mobile #327 main
  merge @06c0f175 (3/3 green, CLEAN). Both lenses re-queued for deltas.
- 18:47 PDT B-PRIV-6: backend #611 FIX ROUND 6 @1af96efa (B-611-5/6 closed by split to T4 issue #662 "restore without resurrection";
  interim rule: no production restore until #662 is built; C-611-9 closed). 10/11 green (npm audit = OR-114-2). Both lenses queued.
  RULING for 114-S: mobile #315 must not say "180 days" anywhere (AI chats are kept until the client deletes them or the account,
  owner 10-01 20:32 + OR-110-1; #315 line per 111: "kept until you delete them or your account"). Fold into #315's round 4.
- 18:50 PDT VERIFIED (Supabase connector): production project rpyfdsgxxltzutgqeouk is on the Supabase FREE plan (org plan "free").
  Free projects get no accessible daily backups (Pro 7 days). Asked the owner: upgrade to Pro before launch (needs his word: money).
  #611 owner questions (5, with defaults) sent to the owner at the same time.
- 18:55 PDT MERGED mobile #314 -> 1f8981dd (dual APPROVE @47398f73: Sol 5964132509, Opus; 3/3 green, CLEAN). Community core flags
  (#650) HOLD until the next clinic build carrying #314 is ready (old builds must never see UGC without report/block, Apple 1.2).
- 18:55 PDT MERGED backend #645 -> 12e1b03b (dual APPROVE @f50de1b0; 11/11 green at head, CLEAN). CI-script only; no deploy needed.
  All backend PRs are now BEHIND main 12e1b03b.
- 18:55 PDT Opus RC backend #627 @7c29d981 0/1/2: B-627-9 concurrent sweeper vs inline create -> stale markFailed on a paid transfer
  (probe ops/aud-opus-114/627-probe.spec.ts). Sol APPROVE same head. -> lane B-FEE-R8 (fix round 8, both lenses delta after).
- 18:53 PDT dual APPROVE (content): backend #608 @1cbecbdc, mobile #327 @06c0f175, backend #611 @1af96efa. #608/#327 wait for the
  OR-114-2 gate fix (npm audit red) then merge main + delta; #611 also waits for owner answers (publication hold) + #315.
  Pre-deploy #608: C-636-6 release-role probe (PR body) + Sol C-608-7 note: set a dedicated receipt HMAC key before first production
  receipts (or keep the fallback unchanged until receipts drain).
- 19:02 PDT OWNER "SCALE" (18:58, verbatim). Applies to BOTH sessions. Ruling for sub-manager 114-S: your 4-subagent cap is lifted;
  run as many lanes as is SAFE in your sandbox (pause launches if disk > 80%, available memory < 1.5 GB, or heavy queue > 6 for 10 min;
  one writer per PR; T4 push hold still applies). Suggested: add a second builder so #305/#317/#315 run in parallel, and keep the Opus
  lens slot free. Your npm audit blocker = OR-114-2, operator lane B-AUDIT-GATE is building the main fix; do not chase it in your PRs.
- 19:02 PDT agent 114 wave 2 launched (lane files handoffs/op-114/lanes/WAVE2.md + AUD-114B.md): B-TRIALS-2 (#656), S-DUNNING-R6
  (#628/#322), S-COACH-BE-4 (#641), S-COACH-MOB-4 (#329/#332), S-MWB-4 (#640/#328), B-NOTIF-5 (#647/#648), B-UGC-8 (#652), B-JOURNEY-5
  (#609/#312); lenses AUD-OPUS-114B + AUD-SOL-114B (#661, #331, #335 Sol-only, annex #658, #659).
- 19:05 PDT OPERATOR DIRECTIVE TO 114-S (binding; also relayed by the owner):
  1. Scale: cap lifted (owner SCALE). Suggested roster: S-B1 #651; S-B2 #326 -> #315; S-B3 #634 -> #325; S-B4 #305; S-B5 #317;
     lenses split by repo: Opus-BE + Sol-BE (#634, #651), Opus-MOB + Sol-MOB (#305, #317, #326, #315, #325). Telemetry pause rules apply.
  2. Latency: orient every 5 minutes while any lane runs; queue both lenses the minute a FIX ROUND is pushed (they read while CI
     finishes, post only at green). No long waits.
  3. One round, both lenses: builders fold BOTH lenses' findings into one round. Pre-push checklist for every builder: (a) no
     free-form text, emails, tokens or message bodies reach logs/Sentry/analytics (ids and codes only); (b) every await followed by a
     state write re-checks account/session identity; (c) cancellation/unmount races covered by a test; (d) copy: no "we/us", no
     exclamation marks, no generic errors, no emojis; (e) failing-before test per finding.
  4. Merge facts: backend main 12e1b03b (#645 merged), mobile main 1f8981dd (#314 merged); bring current only when next in train.
     #634 before #325 (I re-run the zero-row queries pre-deploy). #315 must not say "180 days" anywhere (AI chats: "kept until you
     delete them or your account"); #315 merges with #611 (#611 is dual-approved content @1af96efa, held for owner facts + npm gate).
     #326 merges as soon as it is dual-approved and green. #305 and #317/#325 app.json neighbours: second to merge keeps both.
  5. npm audit = OR-114-2, my lane B-AUDIT-GATE; never touch lockfiles; backend PRs are judged on content until main is fixed.
  6. Timestamps from `date` only. READY FOR OPERATOR MERGE comment + SUB_STATUS line the moment a PR is dual-approved + green; I merge
     within minutes.
- 19:00 PDT OWNER (verbatim): "Ok, add no more agents and do not replace them with auditors, let the agent count run to 0 with
  completions, guaranteeing all started work finishes as planned!"  -> RULING OR-114-3 (binding, both sessions):
  * No new subagents, and no finished subagent is re-tasked. The active count only goes down.
  * 114-S: the 19:05 scale-up suggestion (S-B4, S-B5, second lens pair) is WITHDRAWN. Launch nothing new. Your running lanes finish
    their started scope; your running lenses stay alive (do not let them exit at QUEUE EMPTY) until every fix round your running
    builders push has both verdicts at its final head. Then wind to 0 and record what is left in SUB_STATUS.md as "NEEDS AUDIT" /
    "NEEDS FIX ROUND" rows for the next operator.
  * Agent 114 (15 running at 19:00: AUD-OPUS-114, AUD-OPUS-114B, AUD-SOL-114B, B-RECUR-BE, B-RECUR-MOB, B-AUDIT-GATE, B-FEE-R8,
    B-TRIALS-2, S-DUNNING-R6, S-COACH-BE-4, S-COACH-MOB-4, S-MWB-4, B-NOTIF-5, B-UGC-8, B-JOURNEY-5): the three running lenses were told
    to keep polling and audit every READY round of the running builders (Sol coverage = AUD-SOL-114B for all; Opus = AUD-OPUS-114 wave 1,
    AUD-OPUS-114B wave 2). Operator does mechanical update-branch, merges and deploys (no agent needed).
  * Merge order change: B-AUDIT-GATE PR -> #608 + #327 (update-branch, deltas, merge, C-636-6 probe, deploy) -> #627 round 8 (B-FEE-R8
    merges main and closes C-627-2 itself) -> #321 -> retarget #654 -> #654 + #334.
  * Fix rounds that get REQUEST CHANGES after their builder has finished are recorded as "NEEDS FIX ROUND" for the next operator; no
    new builder is launched.
- 19:02 PDT WRITER GUARD (114-S, binding): agent 114's lanes are actively writing #627, #654, #334, #608, #327, #611, #656, #628, #322,
  #641, #329, #332, #640, #328, #647, #648, #652, #609, #312 and auditing #661, #331, #335, #658, #659 plus the new npm-audit gate PR.
  Handoff section 7 stands: never launch an agent on, push to, update-branch or comment fixes on any of them, even if one looks idle
  or a check is red. If any of your lanes already touched one, stop that lane and record it under NEEDS OPERATOR. The operator runs
  ops/recon/writer_guard.sh (commit identities "TGP Agent 114" vs "TGP Sub-Manager 114-S") every cycle; at 19:01 PDT: 0 collisions.
- 19:05 PDT B-RECUR-MOB DONE: mobile #334 @3fc925d4 READY FOR AUDIT (all surfaces sell renewing plans via native PaymentSheet; plan
  terms before paying; "Your plans" end/keep; per-code copy; wallets off until merchant ID). 3/3 required green. Lenses AUD-OPUS-114 +
  AUD-SOL-114B audit it paired with #654. Merge rule: #334 merges only after backend #654 AND #628 are deployed (cancel uses #628).
  Contract gaps 1 (error filter drops extra fields) and 2 (share link from a not-yet-connected coach) handed to B-RECUR-BE inside #654.
  Known overlaps: #322 (Membership plans screen) and #321 (package detail props) — second to merge resolves.
- 19:05 PDT OWNER (verbatim): "stop-and-drain to zero agents rule - in effect until I say "SCALE 2" just to be sure all work gets DONE,
  not cutoff by credit shrotages!"  -> STOP-AND-DRAIN in force for BOTH sessions until the owner says exactly "SCALE 2":
  no new agents, no re-tasking finished agents, running agents finish started scope, count drains to 0. Every running builder pushes
  progress at least every 20 minutes (PR branch when green for what is done, otherwise wip/<lane>-<topic>) and keeps its report
  current, so a credit cutoff loses nothing. 114-S: same rule; keep SUB_STATUS.md current every cycle.
- 19:11 PDT MERGED backend #663 -> 2e3094b9 (npm-audit gate: time-boxed dev-only exception for GHSA-vfj7-8cjw-p6xm, expires
  2026-10-31; dual APPROVE @e6a2e765: Opus 5964426264, Sol; all required green). npm audit is GREEN on main again.
  114-S: merge backend main (2e3094b9) into #634 / #651 when each is next in the train; the npm audit blocker is closed.
- 19:11 PDT operator update-branch: backend #608 -> be6b5841, mobile #327 -> 9c8b2b06 (merge-only; deltas by AUD-OPUS-114B + AUD-SOL-114B).
- 19:10 PDT AUD-OPUS-114 FINISHED (step budget): #654 RC 0/1/3 (B-654-1 trial default card), #334 RC 0/1/0 (B-334-1 generic copy for
  two #654 codes + dead key resend), #663 APPROVE. #627 head moved to 05623107 (B-FEE-R8, no FIX ROUND yet). All Opus verdicts now ->
  AUD-OPUS-114B. B-RECUR-MOB finished, so B-RECUR-BE (running) is now the sole writer of #334 as well as #654 (no new agent).
  Backlog (no agent under freeze): shared fallback copy from #324 says "write to us" (first person; OR-112-21 SupportEmailFallback fix).
- 19:16 PDT C-636-6 pre-deploy probe for #608 (operator, READ-ONLY via Supabase connector; role = postgres, the Supabase direct-
  connection role DIRECT_URL uses by default): (a) postgres rolsuper=f, rolbypassrls=t, storage.buckets SELECT/INSERT/UPDATE=t ->
  bucket RLS passed by bypass; (b) anon f/f, authenticated f/f, service_role bypassrls=t; (c) no data-exports bucket; (d) no views over
  storage.objects; (e) 0 half-applied migrations, highest 2027022x applied = 20270224000000. CREATE POLICY on storage.objects without
  ownership: supautils.policy_grants lists postgres -> storage.objects (and storage.buckets). Verdict: GO for 20270221000000.
  Step 2 (rolled-back DO block) not run: write-capable; the supautils grant is the equivalent proof. Step 3 verify.sql runs in the
  release itself (release step 4). Receipt key (Sol C-608-7): DELETION_RECEIPT_SECRET unset -> key derived from RECENT_AUTH_SECRET; keep
  RECENT_AUTH_SECRET unchanged until receipts drain (30 days) or set a dedicated DELETION_RECEIPT_SECRET before first receipts (backlog).
- 19:20 PDT S-COACH-BE-4 DONE: backend #641 FIX ROUND 3 @fb29fb9e (B-641-5/B-641-6 gaps closed with failing-before tests; main 2e3094b9
  merged). READY once its 6 pending required checks finish (CI backlog ~80 queued backend runs, all live heads). Lenses AUD-OPUS-114B /
  AUD-SOL-114B poll it. Merge note: #641 and #656 edit the same package files; second to merge resolves (B-TRIALS-2 is still running).
- 19:20 PDT #608 @be6b5841 / #327 @9c8b2b06: CI pending (3 each), merge-only deltas owed by both lenses. Then merge pair + deploy.
- 19:33 PDT B-JOURNEY-5 DONE: backend #609 @18b7e643 (11/11 green) + mobile #312 @2b54e151 (3/3) FIX ROUND 2 READY FOR AUDIT (#312 raised
  to T4, pairs with #609). Merge #609 + deploy before #312. Seam: #609 adds CoachWelcomeMessageJob, CoachWelcomeMessageSetting,
  WorkoutReminderDelivery -> #608 manifest entries needed once #608 is on main; assigned to running builder B-AUDIT-GATE (also #641 if it
  adds user-id columns). Every running backend builder told to fold its own #608 manifest seam. Backlog: coach messages incl. welcome
  never reach the lock screen (check #648 coverage); branch wip/B-JOURNEY-5-c6094 is contained in #609 and can be deleted.
- 19:33 PDT mobile #327 @9c8b2b06 dual APPROVE (Opus + Sol merge-only delta), CLEAN. #608 @be6b5841: Sol APPROVE delta; Opus delta and
  2 checks pending. Pair merges together when #608 is dual + green.
- 19:41 PDT MERGED backend #608 -> ec911328 (dual APPROVE @be6b5841: Sol 02:31Z, Opus 02:37Z; required green; current with main) and
  mobile #327 -> 4f1d74d8 (dual APPROVE @9c8b2b06). Apple 5.1.1(v) deletion + data export now on main. Deploy: waits for main CI at
  ec911328 (release-please red = pre-existing on main since 53b6d472, not required). Env manifest unchanged (no env-sync); migrations:
  #608 deletion + 20270221000000 data-export bucket (C-636-6 GO, 19:16 note).
- 19:41 PDT S-COACH-MOB-4 DONE: mobile #332 @c89c5f7e (FIX ROUND 1, stacked on #329) + #329 @3a90f28a (FIX ROUND 4) READY. Order: audit
  #332, merge it into #329's branch, delta-audit #329, merge #329 with #641. Backlog: real .csv attachment needs expo-file-system in
  mobile package.json (follow-up, recommended); branch wip/S-COACH-MOB-4-money superseded.
- 19:41 PDT B-UGC-8 DONE: backend #652 FIX ROUND 1 @fb33823f (five #610 findings closed). Conflicts with main after #608 in 3 deletion
  files -> B-AUDIT-GATE resolves as FIX ROUND 2 (take #608's files, port 17606f6c's two tests). Lenses wait for that head. Migration
  prefix 20270301000000 kept (operator default).
- 19:58 PDT AUD-OPUS-114B FINISHED (step budget, ~175/200). NO OPUS LENS IS RUNNING in this session from now on; under STOP-AND-DRAIN no
  new lens can start until the owner says "SCALE 2". Its verdicts: RC #661 (0/1/3), RC #331, RC annex #658 (0/1/4) and #659 (0/1/4,
  editing a paused broadcast re-sends it), APPROVE #312 @2b54e151, #641 @fb29fb9e, #328 @dd347633, #322 @23435ec2, #334 @0629d506,
  RC #332 @c89c5f7e, BLOCK #329 (A-329-1 waits for #332). Release order: #609 -> #312; #641 -> #329 (#332 merged into #329 first);
  #640 -> #328; #628 -> #322; #654 + #628 -> #334. #322/#334 both edit ClientPackagesScreen.tsx (second keeps the native Update card).
  Annex #658/#659 must add their user tables to #608's manifest before taking main (annex session to action).
- 19:58 PDT Fix rounds whose builders finished, given to RUNNING builders (no new agent): #609 Sol B-609-3 remainder -> B-AUDIT-GATE
  (with the manifest seam); #641 Sol RC 5964824477 -> B-TRIALS-2 (sole writer of #641 + #656); #332 Opus RC + Sol BLOCK -> S-DUNNING-R6.
  Dual-approved now: mobile #312 @2b54e151 (merges after #609 deploys). Every other T4 head now needs an Opus verdict nobody can give
  until SCALE 2 -> those become NEEDS OPUS rows for the next operator.
- 20:06 PDT DEPLOYED backend ec911328 (#645 + #663 + #608 incl. #636) — fly-deploy run 37091836055 (release_sha ec911328,
  migrations=apply-migrations; production environment approved by operator under the standing approval; main required CI green at
  ec911328, release-please red pre-existing). Verified: /health 200 (uptime 28 s), /readyz db up; migrations
  20270220000000_data_export_archive_cleanup + 20270221000000_data_export_storage_bucket finished 03:05:25Z, 0 unfinished; bucket
  data-exports private, export policy present (release verify.sql passed); POST /api/me/delete-account 401 and
  POST /api/account-deletion/receipt 401 without a token (routes live). Env manifest unchanged (no env-sync).
  Still owed before Apple submission: device pass of deletion (disposable client + coach accounts) and one Apple revocation after
  the owner sets APPLE_SIGNIN_KEY_ID / APPLE_SIGNIN_PRIVATE_KEY via fly-apple-signin-set.yml (owner action).
- 20:06 PDT B-FEE-R8 DONE: #627 FIX ROUND 8 @cd332bfa (B-627-9 + C-627-2 + main ec911328), 11/11 green, CLEAN. Sol delta queued;
  NEEDS OPUS (no Opus lens running). B-RECUR-BE told to merge cd332bfa into #654.
