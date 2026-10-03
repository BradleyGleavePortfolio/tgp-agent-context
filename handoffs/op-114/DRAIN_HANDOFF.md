# Agent 114 — Drain handoff (2026-10-02 20:58 PDT)

STOP-AND-DRAIN (owner 19:05 PDT, verbatim in LAST_OPERATOR_STATE.md) is in force until the owner says exactly "SCALE 2".
Both sessions are at 0 agents: agent 114 (last agent AUD-SOL-114B, QUEUE EMPTY 20:57) and sub-manager 114-S (drain complete 20:14).

## Production and main
- Backend production: ec911328 (fly-deploy run 37091836055, 20:06 PDT): #645, #663 npm-audit gate, #608 account deletion + #636 data export. Verified /health, /readyz, migrations 20270220000000 + 20270221000000, private data-exports bucket, deletion routes live (401 unauthenticated).
- Backend main = ec911328. Mobile main = 4f1d74d8 (#314, #327).
- Both repos require strict up-to-date branches. Any merge moves main, every other PR goes BEHIND, and an update-branch creates a new head that needs new verdicts (law: a new head needs new verdicts).

## Merged by agent 114
mobile #314 (1f8981dd), backend #645 (12e1b03b), backend #663 (2e3094b9), backend #608 (ec911328), mobile #327 (4f1d74d8).

## Open PRs — exact state at drain (verdicts AT the current head only)

| PR | Head | Opus @head | Sol @head | Merge state | What it needs next | Order |
|---|---|---|---|---|---|---|
| backend #627 coach payout | cd332bfa | – (Opus RC was at 7c29d981) | RC 0/1/0 (5964932906) | CLEAN | FIX ROUND 9: B-627-9 narrowed (paused sender after claim, before Stripe call). Direction: adopt the attempt with the same Stripe idempotency key; re-prove the lease immediately before the Stripe call; Sol's probe as a failing-before test. Then Opus + Sol | first money merge |
| mobile #321 | 4f5b058d | APPROVE | APPROVE | needs update after #627 | update-branch after #627 merges, dual merge-only delta | with/after #627 |
| backend #654 recurring | 795110b7 (base = #627 branch) | – (Opus RC at 16cf4ca9) | RC 0/4/0 (5965039762) | CLEAN on stack | Fix round for Sol's four Bs; retarget to main after #627; Opus full | after #627 |
| mobile #334 recurring sheet | 0629d506 | APPROVE | RC 0/2/1 (5965000602): B-334-3 unknown native completion claims "nothing was charged"; B-334-4 terms not reconciled with returned intent | BEHIND | Fix round + dual delta | after #654 AND #628 deployed |
| backend #656 trials | 079e9e39 | – | RC 0/5/1 (5965268813) | CLEAN | Fix round + Opus | after #654 |
| mobile #338 trial-days input | 0db17866 | – | APPROVE | BEHIND | Opus | with #656 |
| backend #628 dunning | bba11793 | – (Opus APPROVE was at 739e9a54) | RC 0/1/1 (5965086662) | CLEAN | Fix round + Opus | before #322, #334 |
| mobile #322 | 23435ec2 | APPROVE | APPROVE | BEHIND | update-branch after #628 deploys, dual delta (ClientPackagesScreen.tsx: second of #322/#334 keeps the native card-update screen) | after #628 |
| backend #640 programs | 176e4f0e | – (Opus RC was at 213a186d) | APPROVE (5964956825) | CLEAN | Opus delta only | before #328 |
| mobile #328 | dd347633 | APPROVE | APPROVE | BEHIND | update-branch after #640 deploys, dual delta | after #640 |
| backend #641 coach money | 0d3d04de | – (Opus APPROVE was at fb29fb9e) | RC 0/2/1 (5965207810) | CLEAN | Fix round + Opus | before #329 |
| mobile #332 Money page | 6c193c80 (base = #329 branch) | – (Opus RC at c89c5f7e) | APPROVE (5965141370) | CLEAN on stack | Opus; then operator merges #332 into #329's branch | before #329 |
| mobile #329 setup wizard | 3a90f28a | BLOCK (A-329-1 waits for #332) | BLOCK (same) | BEHIND | after #332 lands in its branch: update-branch + dual delta | after #641 |
| backend #647 reminders | df4eb80b | – | APPROVE (5965098015) | CLEAN | Opus | before #648 |
| backend #648 push outbox | 16294f44 | – | RC 0/3/1 (5965118899) | CLEAN | Fix round + Opus | after #647 |
| backend #609 welcome + reminders | 9e2f9237 | – | APPROVE (5965155220) | CLEAN | Opus | before #312 |
| mobile #312 | 2b54e151 | APPROVE | APPROVE | DIRTY (conflict with mobile main) | conflict fix + dual delta, after #609 deploys | after #609 |
| backend #652 community UGC | a22761b5 | – | APPROVE (5965182437) | CLEAN | Opus | any |
| backend #664 multer 2.4.0 | 62f57edb | – | APPROVE (5965294196) | BEHIND | update-branch + verdict(s) per tier (dependency PR) | any |
| backend #611 privacy | 1af96efa | APPROVE | APPROVE | 1 failing check (npm audit predates #663) | owner answers (5 questions, ops/reports/B-PRIV-6-114.md), update-branch, dual delta; merges with mobile #315 | owner |
| mobile #326 (114-S) | 4ae5210d | APPROVE | APPROVE | BEHIND (sentry.ts seam with #327) | update-branch + dual delta | first mobile merge on restart |
| mobile #315 (114-S) | 0ef94ddf | APPROVE | APPROVE | BEHIND (sentry.ts seam) | update-branch + dual delta; merges with #611 | with #611 |
| mobile #317 (114-S) | cfa99ce3 | APPROVE | APPROVE | BEHIND | builder self-finding open (see SUB_STATUS) | 114-S |
| mobile #305 (114-S) | 4ac5980e | RC 0/1/1 | RC 0/1/0 | BEHIND | round 6 for B-305-12 (Sentry ExpoContext) | 114-S |
| backend #634 + mobile #325 (114-S) | 9e6c62c9 / 268ed81b | APPROVE / RC | RC 0/1/0 B-634-10 / RC | CLEAN / BEHIND | fix round | 114-S |
| backend #651 (114-S) | a8fa651c | RC 0/3/4 | RC 0/10/3 | CLEAN | fix round | 114-S |
| backend #661 | 91625c86 | RC 0/1/3 | RC 0/2/0 | BEHIND | fix round (no lane) | any |
| mobile #331 | ec2857ba | RC 0/1/1 | BLOCK 1/1/0 | DIRTY | fix round (no lane) | any |
| mobile #335 | 18f17460 | – | BLOCK 1/1/1 | DIRTY | fix round (no lane) | any |
| backend #658, #659 (annex) | 08534e17 / fa9a7cbd | RC / RC | RC 0/3/2 / BLOCK 2/3/3 | – | annex session fix rounds; add their user tables to #608's manifest before taking main | annex |

## Minimum restart on "SCALE 2" (recommended, in this order)
1. One Opus lens + one Sol lens (both repos). Opus first pass, no fix needed: #640, #647, #609, #652, #332, #338 (Sol already approved these heads).
2. Builders: #627 (B-627-9 narrowed) first; then #654 (Sol 0/4/0) + #334 (Sol 0/2/1) as one lane; #628; #641; #656; #648.
3. Operator, as verdicts land: #640 -> deploy -> update #328 -> merge; #609 -> deploy -> fix #312 conflict -> merge; #647; #652; #326 -> #315 with #611.

## Owner actions open
1. Supabase: the project is on the FREE plan — upgrade to Pro yes/no (asked 18:50).
2. #611: answer the five questions or say "defaults" (ops/reports/B-PRIV-6-114.md).
3. Set Sign in with Apple keys via fly-apple-signin-set.yml (APPLE_SIGNIN_KEY_ID, APPLE_SIGNIN_PRIVATE_KEY) so deletion can revoke Apple tokens.
4. Upload the FCM V1 key in Expo (Android push delivery).
5. Before #654 deploys: add `setup_intent.succeeded` to the platform Stripe webhook's events.
6. Later: EXPO_PUBLIC_STRIPE_MERCHANT_IDENTIFIER for Apple Pay (wallets stay off until set and rebuilt).
7. Device pass of account deletion (disposable client + coach) before Apple submission.

## Backlog (no lane under freeze)
- OR-114-4: #332 CSV export as a real .csv file (adds expo-file-system).
- #628 residual: Stripe idempotency keys expire after 24 h; reconciliation must never read an unreconciled >24 h receipt as paid.
- #641: head-coach reversal still owed after 23 h must raise an operator alert + runbook line.
- #656: card removed mid-trial still shows "will charge"; store card state on the purchase.
- Mobile: send device zone on sign-in/foreground (PUT /notifications/timezone); notification tap opens the session (C-648-3); Quiet hours screen payload.
- Coach messages incl. welcome never reach the lock screen (check #648 coverage).
- Shared fallback copy from #324 says "write to us" (first person).
- Dedicated DELETION_RECEIPT_SECRET (today derived from RECENT_AUTH_SECRET; do not rotate that secret for 30 days without it).
- Leftover branches safe to delete: wip/B-JOURNEY-5-c6094, wip/S-COACH-MOB-4-money.
- #650 community flags: hold until a clinic build carrying #314.

## Operator misses this session (for the record)
- Mobile #326 was READY FOR OPERATOR MERGE at 19:14 PDT (dual APPROVE, CLEAN) and I did not merge it before #327 landed at 19:41; it is now BEHIND at the sentry.ts seam and needs a dual delta. Cause: SUB_STATUS.md not re-read between 19:02 and the drain.
- npm audit advisory detected late (after it had already turned main red).
