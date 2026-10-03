# AUD-OPUS-MONEY-2 (lens "Claude Opus 5.5") — operator 115 report

Queue: backend #628 (dunning v2), #641 (coach Money read model), #642 (Google sign-in flag). Tier T4.

## backend#642 @ 4fee3c0236eaa793f847a89e9393160b9f12a41c — APPROVE — A/B/C 0/0/1
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/642#issuecomment-5971958821
- **B-642-1 (own, from 85950984): CLOSED.**
  - #608 is live in production (main ec911328).
  - The DTO accepts google_session (auth.dto.ts:501-507), and auth.service.ts:1974 routes it.
  - Mobile sends google_session (DeleteAccountScreen.tsx:290).
  - The real-device deletion is operator step 5.
- **Delta checks:**
  - Merge 350616c0 is pure (tree 32143c44).
  - The own diff is the one manifest line plus one pin test.
  - The pin's ValidationPipe options match main.ts:98-101.
  - 11/11 required checks pass.
- **C-642-2:** the chain-suite pin asserts only that the file exists (test/ci/google-signin-deletion-dependency.spec.ts:59-66).
- Sol APPROVE at the same head (5971940347).

## backend#628 @ 33e0696a8e3de0f0d33066282f44ba1c502773bb — REQUEST CHANGES — A/B/C 0/1/2
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/628#issuecomment-5972127476
- **Scope:** full T4 audit at 9b48d91e, then the delta at 33e0696a (R8 789ca84c plus a pure main merge with tree b4f1dcd5). All seven main merges since 739e9a54 are pure.
- **Prior own findings:** none open (APPROVE at 739e9a54).
- **B-628-13:** the dispute cycle's identity is only the `last_failure_reason` marker.
  - v1 `recordFailure` (dunning.service.ts:252, fed by checkout-webhook-handler.service.ts:1293) overwrites the marker on the next renewal decline.
  - `invoice.paid` then resolves the dispute cycle and restores access while the dispute is still open. This breaks B-628-8.
  - The same thing happens in the other order: a dispute during a payment cycle returns `cycle_already_active` (dunning-v2.service.ts:1046-1048).
  - Probe red: https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37143152376 (probe628-dunning-r3-money-truth-e2e.spec.ts).
  - Fix: decide "dispute outstanding" from DunningDisputeObligation, or from a dedicated column.
- **C-628-14:** on a first-call 429 with the invoice paid at re-read, the payment is credited as this update's payment (client-billing.service.ts:1004-1016).
- **C-628-15:** a first-call 409 key-in-use is reported as `failed` with "nothing was charged" (:1037-1045).
- I concur with Sol's B-628-11 residual (a 400 invalid_request_error is not a receipt) and did not duplicate it. Sol RC at the same head is 5972111414.

## backend#641 @ 02cd3f88c381f7ccf24e84f821e96418bab66f37 — REQUEST CHANGES — A/B/C 0/1/1
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/641#issuecomment-5972121356
- **Prior findings decided:**
  - C-641-7 (own) and B-641-7 narrowed: closed (claims plus the shared 23 h admission, review, Sentry alert, runbook, owner reconcile).
  - B-641-8: the expired-row subcase is closed. I concur with Sol's cross-run residual.
  - C-641-2: carried.
- **B-641-12:** `recordReversal` (transfer-orchestrator.service.ts:251-280) and `SplitLedgerService.applyReversal` (split-ledger.service.ts:126-152) read the row, then write an absolute value with no row lock.
  - Two different refunds on one transfer lose one reversal locally, so the coach Money "kept" amount is overstated (coach-money.service.ts:313/339).
  - Probe red: https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37142381900 (audit-opm2-641-reversal-lost-update.spec.ts).
  - Fix: FOR UPDATE, or a single SQL `LEAST(amount, reversed + x)` update, plus a live-DB test.
- **C-641-13:** a failed payout's line shows Stripe's raw failure_message. Map failure_code to copy with an action instead.
- Posted before READY, alongside Sol's RC 0/4/1 (5972111823), so one fix round folds both.

## Queue state at END (11:26 PDT, operator PAUSE; LENSES_MAY_END exists)
- **backend#642 @ 4fee3c02:** dual APPROVE (Opus 5971958821, Sol 5971940347), 11/11 required checks green. Main has moved, so an update-branch head still needs green required checks before merge.
- **backend#628 @ 33e0696a:** Opus RC 0/1/2 (5972127476), Sol RC 0/1/0 (5972111414). Open Bs:
  - B-628-13 (Opus): dispute-cycle marker overwrite, probe-proven.
  - B-628-11 residual (Sol): a 400 invalid_request_error counted as `already_paid`.
- **backend#641:** Opus RC 0/1/1 at 02cd3f88 (5972121356), Sol RC 0/4/1 at 02cd3f88 (5972111823).
  - A builder head f60ed603 appeared at 11:25 (not READY, checks pending). It was not audited because the PAUSE says to start no new full audit.
  - Open Bs: B-641-12 (Opus, reversal lost update), plus Sol's B-641-8 narrowed, B-641-9, B-641-10 and B-641-11.
- Not in my queue, so not touched: backend #634, #647; mobile #328, #317.

## HANDOFF
- **Next Opus audit on #641 is f60ed603 or later.**
  - First decide B-641-12: it needs an atomic or locked reversal write in `recordReversal` and `SplitLedgerService.applyReversal`, plus a failing-before test. A live-DB test is preferred, because the stateful double serializes transactions.
  - Re-run probe `ops/aud-115/AUD-OPUS-MONEY-2/audit-opm2-641-reversal-lost-update.spec.ts` against the new head. It must go green once writes are atomic. If the fix uses SQL `FOR UPDATE` or `LEAST`, the double may need adapting; treat a live-DB proof as authoritative.
  - C-641-13 (payout failure_code copy) and C-641-2 are non-blocking.
- **Next Opus audit on #628 is any head after 33e0696a.**
  - Decide B-628-13. "Dispute outstanding" must come from DunningDisputeObligation or a durable column, not the overwritable `last_failure_reason`, and both orders need pinning: decline after dispute, and dispute during a payment cycle then paid.
  - The probe case is in `ops/aud-115/AUD-OPUS-MONEY-2/probe628-dunning-r3-money-truth-e2e.spec.ts`, the test "AUD-OPM2 probe".
  - C-628-14 (first-call 429 credit) and C-628-15 (first-call 409 copy) are non-blocking.
- **#642** needs only a merge-only delta check if the operator updates the branch.
- **Cleanup:**
  - Claims made: backend-642-4fee3c02-opus, backend-628-9b48d91e-opus, backend-628-33e0696a-opus, backend-641-02cd3f88-opus. 628@9b48d91e was claimed but its verdict was posted at 33e0696a, because the head moved before posting.
  - Worktrees wt/AUD-OPUS-MONEY-2-628 and -641 are removed. My audit branches are deleted from origin.
  - Post bodies are in `ops/aud-115/AUD-OPUS-MONEY-2/posts/`.
- No production, flag, secret, deploy, merge or PR-branch action was taken by this lens.
