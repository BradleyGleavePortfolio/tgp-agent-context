# FIX-OPUS-B-131 (Claude Opus 5.5, fix lane, operator agent 131, restart 22:45 PDT)

Started 22:45 PDT. Queue: (1) m#551 (CREDIT-PAY-131, T4 money copy), (2) b#877 (CREDIT-PAY-131 backend, merge main).
HOLD.txt read at 22:46: the CREDIT-PAY-131 hold (m#551, b#877) was lifted at 21:33 (owner decision 10 = YES at 20:54).

## One line per PR
- m#551: READY (FIX ROUND 2) posted 23:05 @ 1138ea71361c5a28262e8f4f0501526583e0e502 (827 lines, 25 files), CI green 4/4, mergeable clean (comment 6053512361). DUAL APPROVED at this head: Opus LN-OPUS-H-131 APPROVE 23:08 (6053555503), Sol LN-SOL-J-131 APPROVE 23:10 (6053588305). Operator merge. FIX CLAIM @ ae7e2a94 (22:47). Main 842eb059 merged (3cc79f2d; one README conflict, both sides kept). Opus B1 + B2 fixed, one-line U2 fixed, failing-first tests. PR body updated.
- b#877: READY (FIX ROUND 2) posted 23:08 @ 8851d67fe01a400fbad3aa44b666722f6dbc8a92 (386 lines, 12 files, unchanged vs main), CI green 15 passed + 1 skipped, mergeable clean (comment 6053562404). DUAL APPROVED at this head: Opus LN-OPUS-G-131 APPROVE 23:10 (6053586302), Sol LN-SOL-I-131 APPROVE 23:16 (6053671630). Operator merge, then fly-env-sync for the two COACH_AI_PACK_* values. FIX CLAIM @ dc6149d7 (22:48). Main 21598a39 merged (one test-file conflict, both sides kept).

- b#872 (either-lane pick; T4 privacy, HOLD until both lenses approve and Sol confirms B-872-SOL-130-1): FIX CLAIM @ b84193df (23:09, comment 6053574465; only FIX CLAIM at that head). Sol REQUEST CHANGES (LN-SOL-H-131) B-872-SOL-H-131-1 fixed; Opus (LN-OPUS-G-131) had approved b84193df. Pushed 23:16 @ 404b220f95d956315b21a177a6273c3d133c7d9c (649 lines vs main, 8 files; main ee4bf222 incl. b#870 merged, no conflict). CI green (15 success, 1 skipped; build-and-test success), mergeable clean. READY "FIX ROUND 3 (COACH-AI-GATE-130, agent 131, FIX-OPUS-B-131)" posted 23:27 (comment 6053845999). DUAL APPROVED at this head: Opus LN-OPUS-H-131 APPROVE 23:32 (6053918076), Sol LN-SOL-J-131 APPROVE 23:34 (6053957294; B=0 U=0, says B-872-SOL-H-131-1 fixed and B-872-SOL-130-1 remains fixed). The HOLD condition is met; the operator merges.
- b#878: not taken (FIX-OPUS-C-131 claimed it at 23:07).
- Fix-queue scan at 23:28 (local lens reports, no board calls): no other PR met FIX-131 (a)-(d). b#878 fixed by FIX-OPUS-C-131 (Sol APPROVE at 1221eab2); m#558, m#560 and b#879 approved; b#877 and m#551 still merge cleanly with main ee4bf222 / 5dbab278 (git merge-tree).
- Fix counts: m#551 B=2 U=1, b#877 B=0 (main merge only), b#872 B=1.

## b#872 details (Sol REQUEST CHANGES at b84193df, LN-SOL-H-131; Opus APPROVE at b84193df, LN-OPUS-G-131)
- B-872-SOL-H-131-1 fixed (from the code; seen in a test): src/ai/coach/coach-ai.service.ts:439-466 (getDraft -> shareSafe(loadDraft)), :484, :495, :513 (edit, reject, approve responses). An INSIGHT draft whose client turned off any of the four Coach sharing switches for this coach after it was made (revoked_at > createdAt) returns generatedPayload null; re-grant clears revoked_at; the owner account reads all. Internal reads use loadDraft (stored row). Controller unchanged (still strips inputContext).
- Tests: test/coach-ai-sharing-gate.spec.ts:182-256 (generate -> revoke -> read/edit/reject through the controller; approve; owner; revoked before creation; re-grant). 13/13 at the head (also after the main merge); failing-first on b84193df: 2 of 13 fail. Also green: coach-ai.controller 12/12, qa-p0-launch-blockers 17/17, mwb-program-library 34/34, coach-ai-consent 22/22, gdpr-scrub 9/9. ESLint clean.
- C (deferred): insights stored before b#872 deploys while a switch was already off were generated without the gate; this rule does not hide them (same limit as the brief fix). Workout program and meal plan drafts keep their payload (coach deliverables).

## m#551 details (Opus REQUEST CHANGES at ae7e2a94, LN-OPUS-E-131; Sol APPROVE at ae7e2a94)
- B1 fixed (from the code): src/components/coach/ai-budget/AIBudgetTutorialModal.tsx:134 last card ends "this guide appears once a month." (meter clause removed; the meter is not shown at 80-94%).
- B2 fixed (from the code): src/screens/coach/CreditPackCheckoutScreen.tsx:418-419 (browser phase) and :599-600 (receipt) say "It is added to your AI credits once Stripe confirms the payment." (no Coach Home claim).
- U2 fixed, one line (from the code): src/components/coach/ai-budget/AIBudgetMount.tsx:129 keeps the tappable chip after the pause sheet is closed, only where packs are sold.
- Not fixed: U1 (preselect ignored, CreditPackCheckoutScreen.tsx:144-153; Opus U1 = Sol U1): not one line.
- Tests (heavy.sh): at the head iosUsCreditPackLink 16/16, ExternalLink 6/6, SuccessReceipt 4/4, AIBudgetMount 4/4; failing-first on 3cc79f2d: iosUsCreditPackLink 2/16 fail, ExternalLink 2/6 fail. ESLint clean on 6 touched files.

## b#877 details (both lenses APPROVE at dc6149d7)
- Conflict test/ai/ai-guide-coach-pool.spec.ts:197-222: kept the PR's CREDIT-PAY-131 test and main's renamed exact-cost test (b#874).
- ai.service.ts, ai-gateway.service.ts, roman.service.ts auto-merged; all 12 files' -U0 hunks vs main equal dc6149d7's vs its base (b72e2c45).
- Tests (heavy.sh): ai-guide-coach-pool 7/7, ai-credits-gateway-402 3/3, ai-credits-caller-purchase-policy 16/16.

## Worktrees
- /home/user/workspace/wt/FIX-551-mobile on agent130/credit-pay-m-130
- /home/user/workspace/wt/FIX-877-backend on agent131/credit-pay-131
- /tmp/fix551-failfirst: detached at 3cc79f2d (merge without the fixes) + the two updated test files, for the failing-first proof only.
- /home/user/workspace/wt/FIX-872-backend on agent130/coach-ai-gate-130
- /tmp/fix872-failfirst: detached at b84193df + the updated test/coach-ai-sharing-gate.spec.ts, for the failing-first proof only.

## Logs
/home/user/workspace/ops/reports/FIX-OPUS-B-131-logs/

## Proposed (needs operator)
1. m#551 U1 (both lenses): CreditPackCheckoutScreen.tsx:144-153 ignores `preselect`, so a pack tap on the pause sheet or the guide lands on the pack list. Smallest fix: on mount, start checkout for a numeric `preselect`. Default: next mobile lane (not a one-line change).
2. m#551, from the code (on main already, hidden-pack builds): AIBudgetTutorialModal.tsx:111 says "The Coach Home meter shows how much you have used." That card shows at 80-94% use, when no meter is shown. This is the same kind of problem as B1. Default: a later mobile lane drops that sentence.
3. m#551 and b#877 PR bodies still start with "Owner decision 10 pending". The owner said yes at 20:54, and the operator comments record it. Default: the operator edits the first line or leaves it.
4. m#551 was dual approved at 23:10, after the 23:00 iOS build 7 cut. Default: the operator or owner decides whether it goes into build 7 (if the cut moved) or the next build. LN-OPUS-E-131's merge conditions still apply: US-only App Store availability before the first clinic build or OTA, and the Stripe webhook events.
5. b#872 C: insights stored before the deploy, for a client whose switch was already off, are not hidden. The rule only looks at withdrawals after the insight was made, which is the same limit as the brief fix. Default: accept as C (no mobile caller reopens insights). The stricter option hides every insight of a client who shares fewer than all four logs.
6. m#551 is at 827 lines, over the 800 target and under 1,500. Default: accept.
7. Worktrees are left in place, because workspace files are never deleted: wt/FIX-551-mobile, wt/FIX-877-backend, wt/FIX-872-backend. The failing-first trees /tmp/fix551-failfirst and /tmp/fix872-failfirst are also left (detached). Default: the operator removes them after the merges.

## HANDOFF
State at 23:35 PDT. Nothing is in progress: no WIP, no uncommitted edits, and no live FIX CLAIM at any current head. Claim 6053574465 on b#872 was at b84193df and is now superseded by the READY at 404b220f.
- m#551 @ 1138ea71: DUAL APPROVED. The operator merges, after the iOS build decision (Proposed 4). The owner actions from LN-OPUS-E-131 still apply.
- b#877 @ 8851d67f: DUAL APPROVED. The operator merges, then runs fly-env-sync for the two COACH_AI_PACK_* values.
- b#872 @ 404b220f: DUAL APPROVED. Opus LN-OPUS-H-131 approved at 23:32 and Sol LN-SOL-J-131 at 23:34. The Sol verdict says B-872-SOL-H-131-1 is fixed and B-872-SOL-130-1 remains fixed, so the HOLD condition is met and the operator merges. b#865 (the HOLD ordering "b#865 before b#872") is already on main. Sol recorded the pre-deploy legacy-insight limit as C (Proposed 5).
- Never done: merges, deploys, flag or fly-secret changes, production writes, rebases, force-pushes, git stash. No secrets in comments or reports. Commits are authored by Bradley Gleave, with LEFTHOOK=0 on backend.
- Worktrees are left in place (see Worktrees). Logs are in ops/reports/FIX-OPUS-B-131-logs/, and comment drafts in ops/scratch-FIX-OPUS-B-131/.
