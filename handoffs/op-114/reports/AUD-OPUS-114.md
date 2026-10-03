# AUD-OPUS-114 report (Claude Opus 5.5 lens, operator agent 114)

## 1. backend #627 @ 7c29d98121d931af04d68038f97aec601589e6a2 — REQUEST CHANGES (A/B/C 0/1/2)
Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/627#issuecomment-5964167264
- Merge 29666ee4 is pure (merge-tree 82865284 = committed tree). Test-only commits are honest.
- B-627-8 (Sol) closed for the single-worker lost response / receipt + key expiry case. C-627-8 (Sol) closed (inbox row + receipt in one tx).
- NEW B-627-9: "absent" is not proof while a peer's create is in flight. The sweeper (no charge fence) and an inline settlement attempt can race. Worker B at the attempt budget calls markFailed(final) unconditionally while A's create executes, so the row ends failed with stripe_transfer_id set plus an SFEE_TRANSFER_FAILED repay alert. If the operator repays, the coach is paid twice. Probe: ops/aud-opus-114/627-probe.spec.ts (2/2 reproduce). Fix: an in-flight window on a fresh marker + a CAS on markFailed.
- Carried C: C-627-2 (#608 erasure seam), C-627-8 Opus (moved to B-SECRETS-3 by the operator).
- CI: 11/11 required checks green at head; branch current with main 53b6d472.

## 2. mobile #314 @ 47398f73e091e84a1771ed99d337e2519f35d090 — APPROVE (A/B/C 0/0/2 carried: C-314-9, C-314-10)
Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/314#issuecomment-5964178222
- B-314-11 closed (shared useSupportEmail/SupportEmailFallback, SUPPORT_EMAIL only). The merge of main aae30ac0 is pure (tree 8b66dd26). 3/3 required checks green.
- Outside the diff: #324's shared fallback copy says "write to us" (first person). This is the owner's call if the no-we/us rule applies to it.

## 3. backend #645 @ f50de1b03fb46269ed3e726961132660072bf0e5 — APPROVE (A/B/C 0/0/2)
Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/645#issuecomment-5964185917
- REQUIRED_CHECKS = the 11 live contexts in live order, all on app 15368. The payload equals live. The merge 71ff95d3 is pure (09692c3a). The job-level if: guard has a working negative control. C-645-1 closed.
- C-645-2 carried (snapshot drift). C-645-3 new (the guard does not follow needs:).

## 4. backend #608 — APPROVE @ 1cbecbdc5417dfac463df28ba331d07c579d7cfb — A0/B0/C3
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/608#issuecomment-5964247385 (body: ops/aud-opus-114/608-verdict.md)
- Delta from RC bdadfcb4 covering round 7 and round 8.
- Merges are pure:
  - 72e72bd4 has tree equal to #636.
  - 2d7c33e4 resolved to #608's finalizer; #610 is re-composed in 7f3d5cfa.
  - 255b560f differs only in ci.yml, with both sides kept.
- Closed: B-608-13 (admin step-up, RolesGuard first, nonce not consumed for a non-owner), C-608-7 (HMAC r2 receipts), C-608-8/10 (bucket store), Sol B-608-12, and the CodeQL items.
- The C-636-6 probe in the PR body is runnable: a read-only report, then a BEGIN..ROLLBACK dry run of the verbatim DO block, then verify.sql.
- Findings:
  - C-627-2 carried.
  - New C-608-14: PREVIOUS is used raw, so rotating RECENT_AUTH_SECRET, or setting DELETION_RECEIPT_SECRET for the first time, drops live receipts. Users then get 401 instead of 403; there is no privacy effect.
  - New C-608-15: the r1 read path is dead code, because r1 never shipped.
- CI: 10 of 11 green; npm audit red (repo-wide braces, OR-114-2).

## 5. mobile #327 — APPROVE @ 06c0f1754d7e0ba19176e8b24f2e832e8be3483c — A0/B0/C1
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/327#issuecomment-5964253848
- Main merge aae30ac0. Only sentry.ts and the new composition test differ from merge-tree, and #327's own files are byte-identical.
- The composition is correct on all three hooks.
- #608's contract is unchanged.
- C-327-3 carried (performance only).
- All 3 required checks are green.

## 8. backend #611 — APPROVE @ 1af96efa0ac3bcfc67b4685d96c71b779c1df365 — A0/B0/C0
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/611#issuecomment-5964262236
- f9cc9107 is a pure merge.
- 1af96efa splits restore out to issue #662 (OPEN), per OR-114-1.
- T4 header; Sol B-611-5/6 closed from this lens; my C-611-9 is closed by the id-only Sentry fix on mobile main.
- CI: 10 of 11 green; npm audit red (repo-wide).

## 7a. backend #654 — REQUEST CHANGES @ 16cf4ca9478bb6945b59f74f80a241392a118d4a — A0/B1/C2
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/654#issuecomment-5964353243 (body: ops/aud-opus-114/654-verdict.md; pre-read: 654-preread.md)
- B-654-1: a trial grants access only when `subscription.default_payment_method` is set.
  - Stripe does not document that confirming a `pending_setup_intent` sets it.
  - The `syncTrialCard` backstop is poll-only and needs `pending_setup_intent` to still be attached, as the fake models it.
  - `retireStaleTrialAttempts` cancels any trial attempt older than 23 h whose subscription has no default payment method. That can be a trial whose card was saved.
  - Fix: a `setup_intent.succeeded` handler (SetupIntent id from the stored `seti_` secret), a SetupIntent lookup by id in the backstop and in retire, and tests.
  - Dormant until #656.
- C-654-2: reuse ignores a changed package `trial_days`.
- C-654-3: a same-key replay can return a spent SetupIntent secret.
- CI: 8 of 11 green; npm audit red (repo-wide). Danger, CodeQL, Banned cast tokens and build-sbom run only after the retarget to main.
- Addendum (not a new verdict): C-654-4. The error extras in the body contract are dropped by HttpExceptionFilter. Counts are now 0/1/3.

## 7b. mobile #334 — REQUEST CHANGES @ 3fc925d432666eab17d5a51c3e88e3a68efcecb6 — A0/B1/C0
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/334#issuecomment-5964410119
- B-334-1: #654 round 1's PACKAGE_ALREADY_INCLUDED and SUBSCRIPTION_ATTEMPT_EXPIRED both fall to the generic support notice.
  - EXPIRED also strands the client: attemptRef is kept after a cancel or a notice, so every later tap resends the dead key until the screen remounts.
  - Fix: map both codes; on EXPIRED, clear the key and retry with a new one.
- 3/3 required checks green.

## 9. backend #663 (B-AUDIT-GATE, braces audit exception) — APPROVE @ e6a2e76555099238e03bbaa008958162ac98f416 — A0/B0/C2
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/663#issuecomment-5964426264.
- The gate is fail-closed throughout:
  - npm's exit code is captured and must be 0 or 1;
  - the report must be v2 and consistent with npm's exit;
  - every advisory in a finding's via closure must be excepted exactly;
  - every lockfile node involved must be dev-only;
  - the exception must be unexpired, at most 31 days out, at or below max_version, with no registry patch;
  - an unused exception fails, and no override arguments exist.
- Log at the head: 3 highs covered, PASS. The runtime image installs with --omit=dev. 11/11 required checks green.
- C-663-1: a stale exception turns every PR red at once (by design; owner and same-day action should be documented).
- C-663-2: an unreachable registry is treated as no patch, with a warning.

## HANDOFF (kept current; last update after #663)
Posted verdicts:
| PR | Head | Verdict | A/B/C |
|---|---|---|---|
| backend #627 | 7c29d981 | REQUEST CHANGES | 0/1/2 |
| mobile #314 | 47398f73 | APPROVE | 0/0/2 |
| backend #645 | f50de1b0 | APPROVE | 0/0/2 |
| backend #608 | 1cbecbdc | APPROVE | 0/0/3 |
| mobile #327 | 06c0f175 | APPROVE | 0/0/1 |
| backend #611 | 1af96efa | APPROVE | 0/0/0 |
| backend #654 | 16cf4ca9 | REQUEST CHANGES | 0/1/3 (with addendum) |
| mobile #334 | 3fc925d4 | REQUEST CHANGES | 0/1/0 |
| backend #663 | e6a2e765 | APPROVE | 0/0/2 |

Still owed, per the operator's 19:00 order:
- #627 FIX ROUND 8 (B-FEE-R8, closes B-627-9): delta from 7c29d981.
- #654 / #334: next rounds (B-654-1, B-334-1), and #654 re-merging #627 round 8.
- #321: delta from 4f5b058d after the operator updates it post-#627.
- #608 / #327 / #611: merge-only deltas after the operator brings them current post-#663.

Operator decisions:
- #627: Sol APPROVE vs Opus RC (B-627-9).
- The "write to us" first-person copy in #324's fallback.
- #663: name the owner and same-day action for exception removal (C-663-1).

Not QUEUE EMPTY: further rounds are pending, per the operator's 19:00 order.

### HANDOFF addendum (step budget reached, 02:12 UTC)
- backend #627 moved to 05623107ce7d79f76afbb4f9cfedab883a4e095b:
  - 49e8bddc is a main merge (#645).
  - 05623107 is the B-627-9 fix: "a peer transfer create in flight is never proven absent". It adds test/s-fee-r8-transfer-in-flight.spec.ts (533 lines).
  - No FIX ROUND 8 comment had been posted when I stopped, so it is not audited.
  - Next Opus lens: run the delta 7c29d981..05623107.
    - Confirm the in-flight window on a fresh marker, and the CAS on markFailed (transfer-orchestrator.service.ts, formerly :879).
    - Re-run ops/aud-opus-114/627-probe.spec.ts. It must now fail to reproduce (0/2).
- No other builder round was posted since my verdicts on #654 and #334.
- My session has reached its step budget. The operator should give the remaining deltas (#627 r8, #654/#334 next rounds, #321, and the merge-only deltas for #608/#327/#611 after #663) to a fresh Opus audit lane.
