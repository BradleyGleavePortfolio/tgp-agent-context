# B-FEE-R6 (agent 112) report: backend #627 + mobile #321, fix round 6

I held both pushes until AUD-SOL-4 posted. Sol posted on #627 at 9d6351b0 (comment 5960082485, RC 0/3/1) and on #321 at 7322bbff (comment 5960679604, BLOCK 0/1/1). Findings from both lenses are in this one round.

## Heads
- Backend #627 `agent/clinic/s-fee-coach-net`: **c1d69c7f70533455e4f4d946e39e7809ca59e879**
  - Merge of main 3bd6215b: 92d494f3 (merge commit, clean)
  - Fix commit: c1d69c7f
  - Main has since moved to f04289f9 (#607). It merges cleanly with this head.
- Mobile #321 `agent/clinic/s-fee-min-price-mobile`: **1413edb7c81a7a4b9807dec79bb5c3838401d4cd**
  - Fix commit: 11ed094
  - Merge of main 2c17c241: 1413edb (clean)

## Per-finding disposition
| Finding | Disposition |
|---|---|
| B-627-5 (Sol) / C-627-4 (Opus) | Closed. The lookup now returns found, absent or unknown. It returns absent only after a full listing. A sent op whose lookup is unknown is never re-sent. The fake now keeps durable reversals separate from the key cache. |
| B-627-6 (Opus + Sol) | Closed. Each channel's status is saved as soon as it finishes, and a retry runs only the unfinished channels. Email attempt keys are `<key>:e<k>`, and each retry first checks the previous attempt's EmailSendLog row. A push that returns `{delivered:false}` is marked failed and retried. |
| C-627-7 (Opus) + Sol limiter part | Closed. Notices are delivered after the webhook commits. The push limiter is keyed per notice (`throttle_key`), and `channelGate()` tells a muted push (off) apart from a rate-limited one. |
| B-627-7 (Sol) / C-627-5 (Opus) | Closed. The copy uses `held_open_cents`. The email shows three amounts: total held, already taken, and still to be held. |
| C-627-6 (Opus) | Closed. The netting on a failed transfer still counts as collected. The alert says to repay `owed_cents` only. |
| C-627-2 | Carried (#608 erasure seam). Whichever PR lands second adds the four payee columns. |
| B-321-6 (Opus + Sol) | Closed. The symlink is no longer tracked, and `.gitignore` uses `node_modules` with no trailing slash. The vendor-name guard is unchanged and passes. |
| C-321-7 (Opus + Sol) | Closed. Recurring copy says "Recurring packages start at $19.99." and only one-time packages are offered $0. The backend packages service sends the same sentence. |

The #641 field is agreed in the #627 body. `held_from_next_sale_cents` (#641) equals `open_balance[].held_cents` (#627). Both are the sum of `amount - collected` over PayeeRecovery rows with status 'open', per payee and currency.

## Tests (heavy.sh, --runInBand)
- **Backend:**
  - Final batch: 127 tests pass (settlement suites, orchestrator, reconciliation).
  - Webhook, refund and payment-ops suites: 141/141.
  - Env registry (#624), fly-env manifest (#637), deploy-readiness and notification suites: pass.
  - Sol's probes: the 4 counted ones pass. The uncounted OR-111-2 closed-first probe still fails; Sol said it would not raise it.
  - Failing-before (src from 92d494f3): 13 of the 16 new tests fail, plus all 4 counted probes. The other 3 are controls.
  - tsc, eslint and check-r75: 0 errors / OK.
- **Mobile:**
  - 4 suites, 56/56.
  - Failing-before: 8 fail.
  - vendor-name guard passes. eslint: 0 errors.

## CI
- Mobile #321 at 1413edb: all 4 checks green (Typecheck/lint/test, CodeQL, both Analyze jobs).
- Backend #627 at c1d69c7f: all 16 checks green (build-and-test, schema parity, forward/reversible migrations, rls-live-tests, R75, CodeQL, etc.), 1 skipping (deploy-readiness-gate, normal on PR).

## Risks
- Notice delivery now runs after commit. If the process crashes between the commit and delivery, the notice waits for the 15-minute sweep. The rows are durable.
- A reversal whose outcome stays unknown remains pending until Stripe can be listed. The `SFEE_REVERSAL_UNCERTAIN` alert fires for it.
- The OR-111-2 closed-first lost dispute is still owner-managed.

## Decisions
- Whether to re-merge main f04289f9 before audit. Recommended default: no. It merges cleanly, and CI tests the merge ref.

## Bodies, comments, drafts
- #627 comment 5960921658; #321 comment 5960715703.
- Body drafts are in `ops/reports/bfee-r6-*-body-after.md`.

## HANDOFF FOR AGENT 113

- **PRs and heads:**
  - Backend #627 is at `c1d69c7f70533455e4f4d946e39e7809ca59e879`.
  - Mobile #321 is at `1413edb7c81a7a4b9807dec79bb5c3838401d4cd`.
- **CI:** green on both heads.
  - #627: 16 checks pass, 1 skipped (deploy-readiness-gate).
  - #321: 4 of 4 pass.
- **Findings closed in this round:**
  - #627: B-627-5, B-627-6, B-627-7, C-627-4, C-627-5, C-627-6 and C-627-7.
  - #321: B-321-6 and C-321-7.
- **Findings still open:**
  - C-627-2 (#608 erasure seam) is carried. Whichever of #608 or #627 lands second adds `ChargeSettlement.coach_user_id`, `ChargeSettlement.head_coach_user_id`, `PayeeRecovery.payee_user_id` and `PayoutAdjustmentNotice.payee_user_id` as retain/finance.
  - The OR-111-2 closed-first dispute probe still fails. Sol did not count it because that dispute path is owner-managed.
- **PR bodies and comments:**
  - Both PR bodies are updated with the tier header and the round-6 fix table. The #641 field agreement is recorded in the #627 body.
  - Fix-round comments are posted: #627 comment 5960921658 and #321 comment 5960715703.
- **NOT STARTED:** none. Everything in lane B-FEE-R6 is done.
- **WIP branches:** none.
- **Worktrees:** both removed (`wt/bfee-r6-627`, `wt/bfee-r6-321`). `deps/` was not touched.
- **Exact next steps:**
  1. Dispatch a re-audit of #627 at c1d69c7f and #321 at 1413edb by both lenses (Opus and Sol).
  2. Merge order stays: #595, then backend #629, then mobile #321.
  3. Main has moved to f04289f9 (#607) since my merge. It merges cleanly with #627, so re-merge main only if an auditor asks.
  4. S-COACH-BE-2 (#641) should read `held_from_next_sale_cents` with the agreed meaning: the sum of `amount_cents - collected_cents` over PayeeRecovery rows with status 'open', per payee and currency.
