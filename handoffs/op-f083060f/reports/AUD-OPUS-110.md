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

## backend#629 @ 858eb40b27a3ab9967e16a52e57423c717e9e41e — REQUEST CHANGES (full T4; A0 B2 C1)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/629#issuecomment-5946235935
- Closed: B-629-1, B-629-2 (normal path), C-629-1.
- B-629-3 (concur with Sol): the first_published_at backfill counts invite-grant ClientPurchases; fix: filter `source IS NULL AND amount_cents > 0`.
- B-629-4: the PACKAGE_FREE_MUST_BE_ONE_TIME copy says "switch to one-time", but PATCH to one_time with billing_interval null returns 400 "one_time packages cannot have an interval" (`??` merge at packages.service.ts:205-208; probe confirmed).
- C-629-2: DTO 400s have no code; currency is required in the DTO but defaulted in the service. Probe: every mobile create body (no currency) gets 400.
- Local: 6 suites, 174 passed. CI all green. Probe: ops/aud-opus-110/probe_629_mobile_bodies.spec.ts.

## mobile#321 @ a9b1f49d7417c2e40dc6405f79f15f3614076a20 — REQUEST CHANGES (full T3; A0 B2 C1)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/321#issuecomment-5946247630
- Closed: B-321-1 (coded save failures with reference, support and Sentry), C-321-1.
- B-321-2: toBackendCreate omits the required currency, so every app create gets 400 (backend probe). Fix: `currency ?? 'usd'` plus a contract test.
- B-321-3: an edit-mode billing change is dropped by toBackendUpdate while the app says "Changes saved"; the $0-on-recurring path loops. Fix: send the billing fields (needs B-629-4) or lock Billing in edit mode.
- C-321-2: DTO text passes through to the UI on a 400 with no code.
- RELEASE BLOCKER (outside the diff; route to a lane): the app has no publish UI. App-created packages stay drafts and checkout refuses them; drafts show as 'active'.
- CI green at the head.

## backend#624 @ 75a4e5633a44ea61be89279a6db84d1faf252a1a — APPROVE (T4 fix-round; A0 B0 C6)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/624#issuecomment-5946281034
- Sol B-624-3 closed: no flyctl output is ever printed (stdout to /dev/null or the jq name+status projection; stderr only grep -q classified; EXIT trap; 13 hostile regressions).
- Value-fragment trace: fly-env-sync has none. fly-env-truth's remote program never prints or throws value text. C-624-6: `cat ssh-stderr.txt` (fly-env-truth.yml:112) is the last raw relay (defense in depth).
- Carried C-624-1..5. BEHIND main 4bcfb444: fresh merge-tree clean (8144a849), no new env reads on main, so a delta is expected to be integration-only.
- Local: 6 suites, 218 passed, 1 skipped. Required CI green; shellcheck fails only on the existing s10-core-diff-gate.sh SC2015 (not required).

## backend#608 @ 2759e1a0520ac7bee6c23a7dcf45a551fef694d1 — APPROVE (T4 fix-round; A0 B0 C5)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/608#issuecomment-5946324411
- Sol B-608-11 closed: only ENOENT counts as deleted; a durable per-machine cleanup record plus Sentry, and the runner rejects; the nightly drain runs first. Migration 20270220000000 is additive, has no user id, and is service_role-only under FORCE RLS.
- Export on local /tmp (download_available=false): LAUNCH BLOCKER (B severity) for the export feature, owned by B-EXPORT. Pre-existing on main, so not counted against #608. I differ from Sol's B-608-12 only on where it is counted.
- C-608-2/7/8/9 carried. New C-608-10: on multi-machine expiry, the wrong machine's ENOENT clears file_url, and the owning machine's orphan sweep keeps files with any row (fix: keep only files a READY row owns). Merge-order note C-627-2.
- Local: 10 suites, 114 passed. Merged with main 4bcfb444 (tree 583fe70f): the manifest suites pass (4 suites, 33). Required CI green.

## backend#633 @ 850ec148a23f69b1f7e5efd8fba43cd7972a7715 — REQUEST CHANGES (full T4; A0 B2 C3)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/633#issuecomment-5946330390
- B-633-1 (concur with Sol): the awk '{print $1}' table parse misses staged or partial rows (`* ` / `! `), so the rollback is false-green, and there is no pipefail. Fix: the JSON+jq projection (as in #624), unset in any status, a strict post-check, and a fake-flyctl spec.
- B-633-2: the new failure lines have no next action (copy rule).
- C-633-1: two rolling restarts on unset. C-633-2: SCOUT/PAIRING default 'true' re-set on every run (add `unchanged`). C-633-3: digests echoed.
- Required CI green; shellcheck fails only on the existing SC2015.

## mobile#313 DELTA @ 1e80017bf9ce8a7ed4e4679e60214b7fe2b398b5 — APPROVE (from 4c6028d5; A0 B0 C2 carried)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/313#issuecomment-5946353738
- Single merge of main 0b7f197f (still tip). Per-file zero-context patch-ids equal for 14/15 files; the conflicted appleAuth.test.ts is a pure union (import plus the approved 4-case re-auth block; main's #306 tests kept); no main line removed. CI 4/4 green. C-313-8 closed.

## OPERATOR ACTION (22:58) — #624 @ e3e0a314: required `danger` FAILS at the exact head
- Cause: dangerfile.js:84-105 passes when the PR title OR the latest commit subject is Conventional Commits. At 75a4e563 the latest subject was conventional; at e3e0a314 it is "Merge branch 'main' into ..." and the title "S-ENVTRUTH: register every src/ env read, ..." is not conventional. So danger now fails (comment 5937803200).
- Fix (no code, head unchanged): retitle #624 to Conventional Commits, e.g. `ci(env): S-ENVTRUTH register every src/ env read, ENV REGISTRATION board invariant, fly env sync + read-only env-truth workflows (T4)`. Then re-run the failed danger job (`gh run rerun <run-id> --failed`). danger.yml triggers on pull_request with the default types (opened, synchronize, reopened), so a retitle alone does not re-trigger it. The re-run reads the new title from the API.
- The delta itself is clean: zero-context and full patch-id of main 7a6cfd82..e3e0a314 = 75a4e563's audited range (136efd7b); fresh merge-tree 4d64d692 = head tree. The Opus DELTA APPROVE posts as soon as danger plus the in-progress required checks are green at e3e0a314.

## backend#604 DELTA @ 12a4d423fc0704047b7f7d785ae911c42c6293cd — APPROVE (from 21ffc02c; supersedes the 87d09b1d request)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/604#issuecomment-5946437661
- main 7a6cfd82..12a4d423 has the same full patch-id (b744884a) and zero-context patch-id (7e4625a6) as the audited e1dd4c39..21ffc02c; same 18 files; fresh merge-tree 8651a300 = head tree.
- #597 adoption is intact inside _passwordLoginUnlocked; #599 attach paths are untouched. Required CI green at the head.

## backend#628 @ ba1d9480cdd93e69504804c32117e83bc913c6ba — REQUEST CHANGES (full T4; A0 B2 C4)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/628#issuecomment-5946454011
- B-628-1 (probe-confirmed, probe_628_2a_paid_before_list.spec.ts): a retry paid before listOpenInvoices, so 2A DELETEs the subscription and ends a just-paid period with no refund (expected option A). The reconciler out-of-band 2A has the same gap. Fix: re-read the subscription before the DELETE.
- B-628-2: on multi-plan confirm, a partial payment then a decline or error says "nothing was charged" / "nothing changed" (:910/:940/:992). Fix: per-purchase results; copy keyed on amount_paid_cents.
- C-628-1 requires_action does not check paid first; C-628-2 publishable_key '' fallback (fail closed 503); C-628-3 DTO 400s without code; C-628-4 the CANCEL_INCOMPLETE window re-entitles (extend the stale guard to client_canceled_at) plus the lock lands within 1 h of Day 10.
- Integer cents, webhook replay, retry race and Day 0/9/10 verified. Local 7 suites, 226 passed. Required CI green. BEHIND main 7a6cfd82; merge-tree clean.

## mobile#322 @ 8991ddf37ddc5488fc1448d5cdb6f3b04dc1af26 — REQUEST CHANGES (full T4; A0 B2 C1)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/322#issuecomment-5946462409
- B-322-1: declined/processing copy ignores amount_paid_cents ("nothing was charged" after a partial payment; mirrors B-628-2).
- B-322-2: a network error or timeout on confirm says "We could not reach the server, so nothing was charged" (dunningErrorCopy.ts:153-161), but 1A may have paid. Fix: "could not confirm whether your payment went through" plus a status refresh.
- C-322-1: the pre-confirm End my plan alert promises access ends now (conditional after the B-628-1 fix).
- The contract matches #628; CI 4/4 green; merge state clean.

## backend#624 DELTA @ e3e0a3140f289347006648acd7d6864a107cd0a1 — NOT POSTED (waiting on the required `danger` check)
- The delta is clean: patch-id 136efd7b equals the audited range; fresh merge-tree 4d64d692 = head tree; every other required check is green.
- `danger` fails only on the Conventional Commits title rule (the latest subject is a merge). Operator: retitle to e.g. `ci(env): S-ENVTRUTH ...` and re-run the danger job (pull_request default types do not include `edited`).
- The APPROVE text is ready at ops/aud-opus-110/624_delta_verdict_READY.md. Post it after danger is green at e3e0a314 (re-check the head first).

## backend#624 DELTA @ e3e0a3140f289347006648acd7d6864a107cd0a1 — APPROVE (POSTED 23:07, from 75a4e563; C-624-1..6 carried)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/624#issuecomment-5946499617
- Head re-checked before posting. All 10 required checks are success at e3e0a314: build-and-test, rls-floor-guard, rls-live-tests, mwb-3-live-tests, npm audit, CodeQL, Banned cast tokens, build-sbom, danger (06:05:22Z after the retitle and re-run) and Schema parity.
- Non-required checks: shellcheck fails on the existing SC2015 in scripts/s10-core-diff-gate.sh; danger dry-run was still running.
