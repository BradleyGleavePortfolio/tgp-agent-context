# FIX BRIEF R2 — PR-17 B2 audit remediation (P0 resend-replay idempotency + P2 audience cap)

Repo: growth-project-backend. Branch: `pr17/b2-push-endpoint` (PR #330). Audited SHA `ee0432e` verdict NOT CLEAN.
Full audit: `audits/PR17_B2_AUDIT.md`. Everything else in B2 was VERIFIED CLEAN (frozen endpoints, guards/IDOR, resolver-key bypass, G4, no-Stripe, date handling, notify) — DO NOT change those.

## The two findings to fix

### P0 — `resend` replay is NOT idempotent (mints a second push_seq → double delivery)
`src/packages/package-push.service.ts:237-248` computes the resend target as `maxSeq + 1` from the CURRENT (mutable) latest-shipped state. The `Idempotency-Key` is only LOGGED (`:187-190`), never enforced. So a replayed identical resend request AFTER seq-1 has fired/delivered sees maxSeq=1 and creates seq-2 → a genuine second fresh delivery. `createMany skipDuplicates` cannot dedup it because (pair, seq-2) is a new unique key. This violates the frozen #8 contract (a replay must be a true no-op) and is a P0 double-action bug on the correctness core.

**Required fix — enforce the Idempotency-Key at the request layer by REUSING the repo's existing generic idempotency ledger (NO schema change):**
- The repo already has `WorkoutBuilderService.withIdempotency<T>(userId, routeKey, idempotencyKey, op)` (`src/workout-builder/workout-builder.service.ts:163`) backed by the GENERIC ledger model `WorkoutBuilderIdempotencyKey` (`prisma/schema.prisma:2092`, unique on `(user_id, route_key, idempotency_key)`). The model comment explicitly calls it a "Generic idempotency ledger." It claims the key via an atomic insert (P2002 → returns the cached `response_json` for a completed key, or 409 for an in-progress concurrent retry), runs `op()` exactly once, caches the response, and releases the claim on failure for safe retry. This is the established, audited pattern in this codebase.
- **Wrap the entire push mutation** (`pushContentToExistingBuyers`, the part that resolves audience + computes seq + seeds + materialises) in `withIdempotency(coachUserId, routeKey, idempotencyKey, () => <the existing push body>)`. Use a stable `routeKey` like `package-push:${packageId}:${contentId}` (so the same key for a DIFFERENT content is independent). Inject `WorkoutBuilderService` into `PackagePushService` via the module (it's already a provider; add it to `packages.module.ts` imports/providers wiring if not already reachable — check first, reuse, do NOT duplicate the helper).
  - Net effect: a replayed POST with the same `Idempotency-Key` returns the CACHED `{ scheduled, skipped, ... }` and NEVER re-runs the seq computation → no seq-2, no second delivery. A concurrent same-key retry gets a 409 (acceptable, matches repo convention). This closes the P0 for BOTH resend and push_existing replays and for the forward-dated-then-cron-delivered retry case.
- If, after inspection, injecting `WorkoutBuilderService` creates an awkward circular dependency, the ACCEPTABLE alternative (still NO schema change) is to factor the tiny `withIdempotency` claim/cache/release logic into a small shared helper that writes to the SAME existing `WorkoutBuilderIdempotencyKey` table (do NOT add a new table/column — that would collide with PR-17 migration territory). Prefer straight reuse of the existing method.
- **Validate the Idempotency-Key:** require it on the POST push route (it's a mutation, R19) — reject a missing/invalid (non-UUID) key with a 400, matching how other mutation endpoints treat their idempotency key. The GET preview is a pure read and needs no key.

### P2 — Large-audience pushes are unbounded inside one interactive transaction
`src/packages/package-push.service.ts:193-218, 263-347` keep all seed creation + re-read + due-now materialise in one `$transaction` with no audience cap; the plan §6.2 flagged 10k+ buyer `all`/`active` audiences as a statement/transaction-timeout risk needing a cap or operator decision. The test only proves 1,201 rows chunk, not production-scale safety.

**Required fix (mergeable, no background-job redesign — that's scope-creep):**
- Enforce a documented MAX synchronous audience size. After resolving the audience (`:193-218`), if `purchases.length > MAX_PUSH_AUDIENCE`, reject with a 400 (`error: 'AUDIENCE_TOO_LARGE'`, a clear message stating the cap and that very large pushes need an operator/async path). Pick a defensible constant (e.g. `MAX_PUSH_AUDIENCE = 2000`) as a named, commented constant; document the rationale (statement-timeout headroom for a single chunked interactive tx) in the service header and the build report. This bounds the synchronous endpoint and makes the tx safe.
- Add a test asserting an audience above the cap → 400, and one at/below the cap → proceeds.

## Guardrails (unchanged)
- Touch ONLY: `src/packages/package-push.service.ts`, `src/packages/package-contents.controller.ts` (Idempotency-Key validation), `src/packages/packages.module.ts` (wiring if needed), `test/package-push.service.spec.ts`. Do NOT touch `prisma/schema.prisma`, any migration, `drip-dispatcher.cron.ts`, `src/billing/*`, `src/connect/*`, `ai*`, or any mobile file. NO new table/column. Do NOT change the verified-CLEAN behavior (resolver-key bypass, G4, no-Stripe, date/notify).

## Tests (real)
- P0: replay a due-now `mode:'resend'` request with the SAME idempotency key AFTER seq-1 is `fired` → assert NO seq-2 row and NO second materialise call (returns the cached result). Replay `push_existing` with same key → no-op. Concurrent same-key (in_progress) → 409. Missing/invalid key → 400.
- P2: audience > MAX_PUSH_AUDIENCE → 400; at/below → proceeds.
- Keep all 23 existing cases green. Run REAL `npx tsc --noEmit`, lint, `npx jest test/package-push.service.spec.ts` AND `npx jest packages`. `npm ci`/`npx prisma generate` if needed. Report actual counts.

## Process
1. `cd /home/user/workspace/wt-pr17-b2`. `git fetch origin && git rebase origin/main` first (main moved: billing #329 merged). Your files are `src/packages/*` + test — disjoint from billing → expect clean rebase. If a real conflict appears, STOP and report.
2. Implement P0 + P2. Commit as `git -c user.name='Dynasia G' -c user.email='dynasia@trygrowthproject.com'` — NO trailers. Push every ~2 min (R61); after rebase `git push --force-with-lease`.
3. Append an R2 section to `specs/PR17_B2_BUILD_REPORT.md`: the withIdempotency reuse (file:line), the audience cap + rationale, the new tests, idempotency proof (replay no-op), actual tsc/lint/test counts, final HEAD SHA. Commit + push to docs repo main (rebase docs first).
4. Report the FINAL HEAD SHA in your return message for the SHA-pinned re-audit.

Fixer-only: your report is NOT a verdict (R1 §4). An independent gpt_5_5 auditor re-checks at the post-fix SHA.
