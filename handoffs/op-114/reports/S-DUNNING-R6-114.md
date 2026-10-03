# S-DUNNING-R6 (agent 114) — backend #628 + mobile #322

Status: IN PROGRESS (19:12 PDT) — both branches pushed, CI running

## State
- Worktrees: /home/user/workspace/wt/S-DUNNING-R6-be (branch sdr6-be from agent/clinic/s-dunning-v2-live @8bd6fcaf),
  /home/user/workspace/wt/S-DUNNING-R6-mob (branch sdr6-mob from agent/clinic/s-dunning-lockout-screen @2d808dc6).
- origin/main merged locally into both (backend 12e1b03b, mobile 1f8981dd), clean merges, not pushed yet.

## Findings at latest verdicts (Sol RC at 739e9a54 / 0b4813dc; Opus APPROVE)
- Backend: B-628-6 (notice delivery claim), B-628-8 (multi-dispute), B-628-11 (journal before Stripe). R5 (agent 113) commits
  c8a1c95b/fd800f00 implement claim CAS + fenced receipts, dispute obligation table + aggregate, paying/voiding intents. Verifying.
- Mobile: B-322-1, B-322-5, B-322-7, C-322-2: R5 commit 2d808dc claims all. Verifying.

## CI red causes found
- Backend build-and-test at 8bd6fcaf: one suite "Jest worker ran out of memory" (community-message-shape.live) — infra flake; rerun after push.
- Mobile at 2d808dc: (a) supportEmail.guard: dunningErrorCopy declared its own SUPPORT_EMAIL literal and the two dunning
  screens opened mailto directly; (b) rootNavigatorConsultation{ColdBoot,Complete} mocks lacked getCurrentRoute/addListener.
  Fix in progress (re-export constant, shared useSupportEmail + SupportEmailFallback with prefilled reference body, mock fix).

## Left
- #654 seam: invoice.payment_failed never-entitled guard (incomplete/payment_failed/trialing-without-access) — add.
- Push, CI green, FIX ROUND comments, PR body tables, READY FOR AUDIT.

## Progress 19:12 PDT
- Mobile #322 pushed: e12d40c0 (fix) + 23435ec2 (drop a node_modules symlink that my commit picked up; .gitignore only ignores
  the dir form). Head 23435ec2c099aa5e25c8c0737d92662b73c83855.
  - dunningErrorCopy re-exports SUPPORT_EMAIL from constants/support; both dunning screens use the shared useSupportEmail +
    SupportEmailFallback (address, Copy, Try again) and keep the reference (prefilled body + "Include reference X" note);
    supportMailto(subject, body) gained an optional body. Navigation mocks in rootNavigatorConsultation{ColdBoot,Complete}
    gained getCurrentRoute/addListener. Local: supportEmail.guard + dunningLockout + nativeCardUpdate 3/90 pass,
    rootNavigatorConsultation* 2 suites pass.
- Backend #628 pushed: fda828d0 (#654 seam) + d2d29c88 (merge origin/main 2e3094b9, npm-audit fix). Head d2d29c88.
  - isNeverEntitledPaymentAttempt(purchase, billing_reason): subscription_create, or never entitled and status in
    pending/incomplete/payment_failed/trialing -> last_error only, no past_due/cycle/notice. Entitled trial's first charge,
    past_due and locked (past_due + entitlement off) plans still dun. Tests in dunning-r3-money-truth-e2e "B-RECUR seam"
    (4 fail before / pass after). Local: money-truth, checkout-webhook-handler, r2 1a-2a e2e, v2 lifecycle, dunning.service
    5 suites / 133 pass.
- R5 claims verified in code + named tests: B-628-6 (claim CAS, fenced receipts, takeover reuses key_attempt, cycle recheck,
  due-only rows), B-628-8 (DunningDisputeObligation + ledger merge, aggregate under DunningState FOR UPDATE), B-628-11
  (paying/voiding intents journaled before Stripe; settledLine from canonical invoice state), B-322-1/5/7, C-322-2.
- Overlap: mobile #334 (B-RECUR mobile) conflicts with #322 in src/screens/client/ClientPackagesScreen.tsx (dunning banner
  region: #322 replaces the portal-URL Update button with the native UpdateCard screen). Second to merge resolves it.
- Residual (documented, not code): settledLine replays the pay call with the same idempotency key; Stripe keys last 24 h, so a
  same-SetupIntent retry later than 24 h after a lost receipt would report already_paid (0) for that line. The background
  reconciler settles intents within the hour, so the window is practically closed.

## Next
- Wait for CI on both heads; post FIX ROUND 6 comments + PR body table; READY FOR AUDIT.

## Progress 19:42 PDT
- Mobile #322 @ 23435ec2: all 3 required checks SUCCESS, mergeState CLEAN. FIX ROUND 6 comment posted
  (issuecomment-5964634707) + PR body R6 table; READY FOR AUDIT posted.
- Backend #628 @ d2d29c88: build-and-test failed again with "Jest worker ran out of memory" (regimes-roles-pin this time;
  community-message-shape at 8bd6fcaf). Main passes, so the branch's large new specs tip a long-lived worker over the 4 GB heap.
  Fix: jest.config.js `workerIdleMemoryLimit: '2GB'` (worker recycle; same suites). Pushed 1fd964f0. Waiting CI.
- #608 manifest seam: #608 still OPEN. #628's new tables (DunningNoticeDelivery, ClientBillingOperation, ClientBillingLease,
  DunningDisputeObligation) hold no user id / email columns (purchase-linked, ON DELETE CASCADE); note "#608 manifest seam
  pending" in READY.
- Next: `gh pr checks 628` until green; then post FIX ROUND 6 on #628 (draft in /tmp/sdr6-628-comment.md) + body table.

## Progress 20:00 PDT
- Backend 1fd964f0 run: OOM gone (workerIdleMemoryLimit worked); 1 real failure: dunning-v2-lockout-allowlist-route-table
  (CI's PR merge with newer main exposed main's new `me/data-export/download-link`). Merged origin/main ec911328 (#608 merged)
  as f5c29869; added the route to the reviewed reachable-while-locked table (bba11793). Pushed head bba11793.
- #608 seam: erasure-manifest-coverage + manifest-fk-order + route-table specs pass locally (3 suites / 53) at f5c29869+fix;
  no manifest entries needed (new tables hold no user id / email).
- Next: wait CI on bba11793; post FIX ROUND 6 (draft ops/sdr6-114/628-comment.md, replace HEADSHA/CISTATE) + body table.

## Progress 20:25 PDT
- Backend #628 @ bba11793: all 11 required checks green, mergeState CLEAN (main still ec911328). FIX ROUND 6 posted
  (issuecomment-5964924299) ending READY FOR AUDIT; PR body gained the R6 table, Builder-owner agent 114, merge list.
- Mobile #332 (operator mail 19:54, sole writer): worktree wt/S-DUNNING-R6-332 from origin/agent/clinic/s-coach-money-mob
  @ c89c5f7e. Pushed 64cd2292 to the PR branch: A-332-1 (ph-no-capture on every Money root: MoneyScreen loading + main,
  MoneyChargesScreen, MoneyChargeScreen loading + main, MoneyHomeCard both roots), B-332-2 (unknown count -> null, "Recurring"),
  B-332-3 (payout cents safe integer, <=2 decimals), Opus B-332-4 (parseJsonErrorBody on export.csv errors), Sol B-332-4
  (remembered currency list + selected chip), B-332-5 (signed head-coach / refunds / team rows; note says refunds booked in the
  period, including earlier sales), C-332-6 (Business stale label). money.test.tsx 61/61 after; 24 fail before
  (ops/sdr6-114/332-before.txt). eslint clean on the 7 files.
- Next: `gh pr checks 332` (repo growth-project-mobile) until Typecheck/lint/test green; post FIX ROUND 2 + body table + READY.

## Progress 20:40 PDT
- #332 CI at 64cd2292: Typecheck red (coachMoneyApi `res` typed unknown from `let res: Awaited<...>`). Fixed by chaining
  `.catch` (6c193c80). Also 337bb296: C-332-4 (Sol) export error copy says "CSV text", never "file" (test fails before).
  money.test.tsx 62/62. Note: one local `tsc --noEmit` was run by mistake while checking this (protocol says CI only).
- Next: `gh pr checks 332` at 6c193c80; then FIX ROUND 2 comment (table ops/sdr6-114/332-table.md) + body + READY.

## Progress 20:50 PDT
- #332 @ 6c193c80: Typecheck, lint, test SUCCESS. FIX ROUND 2 posted (issuecomment-5964995541) ending READY FOR AUDIT;
  PR body gained the Fix round 2 table and builder line. #329 untouched.

## Final state
| PR | Head | Required checks | Comment | State |
|---|---|---|---|---|
| backend #628 | bba11793a9565e0f4bee5c3a89e5ee02400259ea | 11/11 green, CLEAN | FIX ROUND 6 issuecomment-5964924299 | READY FOR AUDIT |
| mobile #322 | 23435ec2c099aa5e25c8c0737d92662b73c83855 | 3/3 green, CLEAN | FIX ROUND 6 issuecomment-5964634707 | READY FOR AUDIT |
| mobile #332 | 6c193c804be8757ae068d94a681b11c318420179 | Typecheck/lint/test green | FIX ROUND 2 issuecomment-5964995541 | READY FOR AUDIT |

Findings closed: #628 #654 seam (never-entitled attempt is not dunning), CI OOM, route-table, #608 seam (no entries needed);
#322 R6 support/fallback composition, CI; #332 A-332-1, B-332-2, B-332-3, B-332-4 (Opus), B-332-4 (Sol), B-332-5, C-332-6,
C-332-4 (Sol) copy.

## Operator decisions
1. #334 vs #322 conflict in src/screens/client/ClientPackagesScreen.tsx: second to merge resolves, keeping the native UpdateCard path.
2. #628 jest.config.js `workerIdleMemoryLimit: '2GB'` is repo-wide (worker recycling only; same suites).
3. #628 residual: Stripe idempotency keys last 24 h; a lost pay receipt unreconciled > 24 h could read already_paid.
4. #332: real CSV file attachment (adds expo-file-system) vs current text share (copy no longer says "file").
5. #654 and #628 each define a never-entitled predicate; the later merge resolves to one (seam test pins behaviour).

## HANDOFF
All three PRs are READY FOR AUDIT at the heads above; nothing pushed after those heads. Worktrees S-DUNNING-R6-be, -mob,
-332 removed. Next: auditors (Opus + Sol) on #628 @ bba11793, #322 @ 23435ec2, #332 @ 6c193c80. If main moves before merge,
merge origin/main into #628 and re-run CI. Never merge from an agent.
