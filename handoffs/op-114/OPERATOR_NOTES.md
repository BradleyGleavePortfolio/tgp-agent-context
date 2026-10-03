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
