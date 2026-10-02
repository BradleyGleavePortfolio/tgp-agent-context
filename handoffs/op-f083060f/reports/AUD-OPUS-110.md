# AUD-OPUS report (Claude Opus 5.5 lens, operator agent 110)

## backend#595 @ f2eecae54020854297210cd490971bf619385e12 — APPROVE (T4 DELTA; A0 B0 C5: C-595-1..3 carried, C-595-4/5 new)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/595#issuecomment-5945193417
- db7785dd is integration only:
  - patch-id of main..db7785dd equals the audited 7b496aca..e1dd4c39 (`1b0df9a0`, and the zero-context ids match);
  - merge-tree with base 7b496aca gives `bf3b1300`, the tree of db7785dd.
- f2eecae5: pure rename to 20270205000000_invite_grant_bindings plus a comment line in down.sql. It now sorts after #625 and #622, the prefix is unique, and the SQL is idempotent.
- #604 still carries the old directory name and must pick up the rename on its merge-forward.
- Fan-out on $0 grants confirmed (grant -> deliver -> onPurchaseEntitled with no amount/source branch -> WorkoutAssetResolver handles workout_program -> assignPlan).
  - C-595-3 (#607 double program) is now a real ops choice.
- C-595-4: coach alert says "New purchase ... just bought" for $0 grants (purchase-fanout.service.ts:642-646).
- C-595-5: no spec drives the real fan-out with a grant row.
- CI at head: 9/9 required SUCCESS, plus Schema parity (approved mode, 104/104), forward and reversible migrations.
- Local jest not run (backend deps not READY; delta is a rename plus a filesystem spec that CI ran).

## backend#626 @ 9551d2c8687c06d48d71abbb16966270ccee0152 — REQUEST CHANGES (T4 re-audit; A0 B1 C2)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/626#issuecomment-5945302627
- 4db7b9b0 is a pure merge of main (merge-tree 7ad2a2c5 equals its tree; patch-id 51646499 equals the audited range).
- Closed:
  - A-626-1: SDK retries off and forced per request; the gate owns retries and re-reads consent every attempt; real-SDK tests.
  - A-626-2: own-data-only client context; all other reads re-checked as caller-scoped.
  - B-626-1: copy carries support address and reference.
  - C-626-1: opaque handles, WeakMap, ESLint, guard.
  - C-626-3: one re-filter.
  - C-626-2: owner decision, not a finding.
- No new egress bypass:
  - all sends are in src/ai-egress;
  - MWB live create goes via the gateway pre-flight;
  - the Roman subject_context is never set from a request;
  - no transcription or other AI vendor.
- B-626-2: the SSE error frame now carries `requestId`. Mobile main's strict RomanStreamErrorSchema (src/api/romanApi.ts:173-178) throws RomanWireError on it, so ROMAN_UNAVAILABLE and refusals become wire drift.
  - Fix: keep the frame `{code,message}`; the X-Request-ID header already carries the reference.
- C-626-4: triage failure renders as an empty inbox (flag off).
- C-626-5: gate retries stack on caller loops (brief, churn).
- Release blocker, mobile (outside this PR): no mobile mapping for `ai_consent_required` or `ai_egress_blocked`. The AI Guide shows "I'm offline", and Roman shows "That request did not complete."
  - Needs a mobile PR in the clinic build before the ledger flag is ON.
- Local: 13 suites / 188 passed (12 PR suites plus an audit probe showing no stream events lost after the gate's withResponse). Log: ops/aud-opus-110/jest_626_9551.log.
- CI: 9/9 required SUCCESS plus Schema parity.

## backend#630 @ 5b8739886a7bc4c3239674e803340999796c07fb — APPROVE (full T4; A0 B0 C5)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/630#issuecomment-5945399120
- One predicate on every recipe read:
  - own rows, or the own coach's shared rows (creator coach/owner, not deleted);
  - no platform-wide branch;
  - prep guide filtered;
  - the same 404 for missing and hidden ids.
- Sharing is coach/owner only (403 for a client, before any write). `image_url` is refused on create and null on every read.
- Migration 20270204000000: transactional, bounded, moves rows only toward private, self-verifying; down never re-publishes.
- RLS posture unchanged. The seed needs an explicit coach id.
- Merge with main is clean (main +1 = #599, auth only).
- C-630-1 (Sol): `_count.saved_by` in client payloads.
- C-630-2: main's account deletion leaves recipes (delete order plus RESTRICT FK, swallowed). Fixed by the #608 manifest, which must land (OR-110-1).
- C-630-3: data export omits authored recipes.
- C-630-4: no unshare, delete or cursor (1.0.1).
- C-630-5: `$verify$` reads through FORCE RLS. Operator should re-run the read-only count after deploy and expect `recipes_public = 0`.
- CI: 9/9 required, Schema parity, forward migrations and reversible all SUCCESS.
- Local targeted jest: queued on the heavy lock (log ops/aud-opus-110/jest_630_5b87.log).
- Next: DELTA needed after update-branch.
- #630 local result at 5b873988 (heavy.sh, `prisma generate` then `env CI=false npx jest --runInBand --runTestsByPath ...`): 8 suites / 126 tests passed.
  - Suites: recipes-tenant-visibility, recipe-private-by-default-migration, restore-schema-declared-objects-migration, test/account-deletion.service, data-export.service, account.service, entitlement-guards-mounted, ci/schema-parity-gate.
  - src/account-deletion/account-deletion.service.spec.ts is outside the jest roots, so it is not collected (also not in CI).
  - No follow-up comment needed.

## backend#623 — SKIPPED (not updated)
- Live head is still 4cc366fca242a4be7e007fd7dddb66c5d4a946e5 (BEHIND), the dual-approved head. The operator has not run update-branch, so there is no DELTA to attest yet.
- When it moves, attest: zero-context patch-id and fresh merge tree equal, plus exact-head checks including Schema parity.

## backend#630 @ 442fdb86daf9d3b4322cd4cbe526e9b6e818a6b6 — APPROVE (T4 DELTA; A0 B0 C5 carried)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/630#issuecomment-5945478338 (prior APPROVE 5945399120 at 5b873988).
- Integration-only. Parents are 5b873988 and main 990d2f31.
  - Fresh `merge-tree` = f819cfec, which equals the head tree.
  - patch-id equal: full 2efe3ba1, zero-context 571fd339.
- Apply order: 0203 → 0204 (#630, Recipe only, own transaction with SET LOCAL) → 0205 (#595: InviteCode, CoachProfile, ClientPurchase, idempotent).
  - The two are disjoint and order-independent.
  - Prod has neither, so `migrate deploy` applies 0204 then 0205. The CI forward log shows exactly that order.
- Both placement specs compare relatively, so each holds with the other present.
- CI at the exact head: 9/9 required checks, Schema parity (approved, baseline at 990d2f31), forward migrations and reversible all SUCCESS. Merge state CLEAN.

## backend#623 @ 32bde1939c0610aa18270adb239f8f9aff3c4f4f — APPROVE (T4 DELTA; A0 B0 C3 carried)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/623#issuecomment-5945625605 (prior APPROVE 5940356014 at 4cc366fc).
- Integration-only. Parents are 4cc366fc and main ba79605b.
  - Fresh `merge-tree` = 503fccf7, which equals the head tree.
  - patch-id equal: full e9ee83d9, zero-context c43b3eaa.
  - No migration in this PR.
- Composition:
  - prod-switches.yml is the only shared file, with disjoint hunks (YAML parses, 231 switches, no duplicates).
  - #599's new `auth-signup-with-code` throttler is skipped automatically by the derived `WEARABLES_SKIP_THROTTLERS`. The isolation spec is green at head.
- Carried:
  - C-623-1: flip the flag only after #608 is deployed.
  - C-623-2: keep `wearable_insight.*` out of the gateway allow-list until #626 merges.
  - C-623-3: reconcile with #604 and #624.
- CI at the exact head: 9/9 required plus Schema parity, all SUCCESS. Merge state CLEAN.

## backend#627 @ 2c57cc41f28f6e281c9a2742aba40136d0e64a05 — REQUEST CHANGES (T4 round-3 re-audit; A0 B3 C2)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/627#issuecomment-5946175635
- Closed: B-627-1 (backfill by charge id with a cursor), C-627-1 (migration 20270210000000). B-627-2 normal concurrency closed (probe is now a test).
- Open B: B-627-2 residual (the 120 s lease has no renewal or fence; fix: renew-as-fence before each Stripe money call). B-627-5 (an ambiguous reversal result opens a second recovery; probe at head: effective 710 vs target 2670; fix: open a recovery only on a definitive 4xx, otherwise retry or GET the transfer, and re-converge on transfer.reversed). B-627-4 (a failed retrieveDispute falls back to the stale event's position and can undo a won dispute; fix: throw a retryable error).
- C: C-627-2 (#608 manifest columns, merge order). C-627-3 (no aged-recovery alert; reconciliation counts the receivable inside platform net).
- Owner decision: TGP CAN end net-negative (full refund −3.20 and lost dispute −18.20 per $100 until netted; Express accounts, so TGP is liable). Mitigations present: reversal plus PayeeRecovery netting. refund_application_fee is N/A. Options: alert plus cap / payout delay / debit_negative_balances / Account Debits.
- Local: 12 suites, 138 passed (probe logs: ops/aud-opus-110/jest_627_2c57.log, probe_627_ambig.log). CI all green at the head.
