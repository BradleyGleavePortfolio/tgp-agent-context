# TM-5 Re-Audit — Lens B (CYCLE adversarial auditor)

- **PR:** #435 — `feat/tm-5-apply-precoach`
- **SHA audited (POST-FIXER R1):** `746c0a09cba75898e4b3f1a3429d5c85f4988c0a`
- **Prior SHA audited:** `c7298ae101906e431cde248f5e1e7560b4b645a1` (Lens B → CLEAN, 3 non-blocking notes)
- **Base main:** `96d7f464f50ad0af19004c1c5e125ec80b395032`
- **HEAD verified:** `746c0a09` (detached at audited SHA; tree from git objects)
- **Lens:** B (CYCLE / drift / regression) — second of dual GPT-5.5 re-audit
- **Mode:** READ-ONLY. No backend code written or pushed.
- **Date:** 2026-06-18

---

## VERDICT: CLEAN_NO_FINDINGS

## COUNTS: P0=0  P1=0  P2=0  P3=0

The R1 fixer pass resolved all three actionable findings (P2-1 envelope, P2-2
composite-unique, P3-3 trim parity) with no drift, no regression, and full
cross-lane convergence with TM-3 R2. The two no-code-change items (Lens A P3-1
unsigned cursor, P3-2 unverified-email minting) were correctly left untouched
per the brief and remain owner-scoped / operator-sign-off concerns. The prior
CLEAN verdict holds and is strengthened: the lane now ships a DB-level
single-application backstop and a wire-level error contract that both lanes share.

---

## FIXER COMMITS AUDITED (3)

| SHA | Subject | Author/Committer |
|-----|---------|------------------|
| `2c6af1c0` | TM-5: surface machine-readable error code on apply HTTP envelope | Bradley Gleave (both) |
| `96bed50c` | TM-5: add (applicant_user_id, listing_id) unique backstop to Application | Bradley Gleave (both) |
| `746c0a09` | TM-5: pin distinct-key recovery + free-text trim parity | Bradley Gleave (both) |

R74 identity: all three commits authored AND committed by
`Bradley Gleave <bradley@bradleytgpcoaching.com>`. Commit-message grep for
`AI|Claude|Computer|Co-Authored|Agent` → EMPTY. PASS.

---

## DRIFT HOT-SPOT PROBES (per brief)

### HS-1 — Composite-unique migration (`96bed50c`) — PASS
- Migration file `prisma/migrations/20261220000031_application_applicant_listing_unique/migration.sql`.
- Statement: `CREATE UNIQUE INDEX IF NOT EXISTS "Application_applicant_user_id_listing_id_key" ON "Application"("applicant_user_id","listing_id");`
  - **Idempotent on re-apply:** `IF NOT EXISTS` → re-run is a no-op. PASS.
  - **Additive only:** no `ALTER`, no `DROP`, no RLS statements. Does not touch the
    pre-existing `Application_idempotency_key_key` index or any policy.
  - **Date ordering:** `…000031` > all shipped (`000000`/`000010`/`000020`). PASS.
  - **Prisma-name parity:** `@@unique([applicant_user_id, listing_id])` in
    `schema.prisma` (L6601) generates the exact index name
    `Application_applicant_user_id_listing_id_key` (Prisma `{Model}_{cols}_key`
    convention, matching the existing `Application_idempotency_key_key`). So
    `prisma migrate diff` against the schema is clean — **no schema/migration drift**.
- **RLS regime intact:** `Application` RLS `ENABLE`+`FORCE` and all SELECT/INSERT/
  UPDATE policies live in `20261220000000_talent_marketplace_rls` (L258-259, L185-194)
  and are untouched. A unique index does not interact with RLS predicates. The
  defense-in-depth owner-scope at the service `where` clause is unchanged. PASS.

### HS-2 — P2002 catch broadening (`2c6af1c0` / `apply.service.ts` L123-145) — PASS
- The catch tests `err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002'`
  and routes into `releaseClaim` + `recoverConfirmation`. It does **not** discriminate
  on `err.meta.target`, but this is **correct, not over-catching**, because:
  - The catch wraps only `runApply` (the interactive transaction). The only P2002
    source there is `tx.application.create` — which can fail on **either**
    `idempotency_key` OR the new `(applicant_user_id, listing_id)` composite. **Both
    constraint failures mean "an Application for this (applicant, listing) already
    exists,"** so idempotent recovery is the right outcome for both. (`tx.applicant.upsert`
    uses `update:{}` and cannot raise P2002; `resolveAccount`'s P2002 is caught locally
    *before* `runApply`, never reaching this catch.)
  - **No swallow of genuine `ConflictException`:** the `apply_conflict` /
    `apply_replay_corrupt` ConflictExceptions are thrown *inside* `recoverConfirmation`
    / `fromLedger` and are NOT `PrismaClientKnownRequestError`, so they bypass the
    P2002 branch and propagate to the client. The `apply_in_flight` Conflict is thrown
    *before* the try-block. No legitimate conflict is converted to a fake success.
  - The non-P2002 branch still `releaseClaim`s then re-throws — fail-loud preserved.
- Distinct-key recovery is pinned by spec (`apply.service.spec.ts` new test L353-419):
  P2002 with `meta.target:['applicant_user_id','listing_id']` → exactly one
  `create` attempt, one `releaseClaim`, owner-scoped read-back
  (`where:{applicant_user_id, listing_id}`), recovered `application_id` returned, no
  client-visible error. PASS.

### HS-3 — Trim helpers `trimOrNull` / `trimEntries` (`2c6af1c0`) — PASS
- `trimOrNull(v)`: `null`/`undefined → null`; else `v.trim()`. **Explicit-null
  (client clearing a field) preserved; absence → null at create.**
- `trimEntries(arr)`: per-entry `.trim()`, order + length preserved (pure map).
- **Pass-through on unsent fields preserved:** `updateOwnProfile` still guards every
  assignment with `if (dto.X !== undefined)`, so a field the caller didn't send is
  never written. Trim only applies to fields actually present.
- **No bounds break:** class-validator runs on RAW input *before* the service trims;
  trimming only shrinks length, so a post-trim value can never exceed `MaxLength`.
- **No pre-existing spec broken:** the only exact-`data` assertion on these fields is
  the `updateOwnProfile` "trimmed" test, which the fixer updated to send
  `'  Strength Coach  '` etc. and assert the trimmed result. All apply-path fixtures
  (`apply.service.spec.ts` L56-61) already use trimmed values, and the profile
  key-set test (L117-126) asserts key NAMES only — trimming is a no-op for them.
  `runApply`'s `trimEntries(dto.x ?? [])` / `trimOrNull(dto.x)` reproduce the prior
  `?? []`/`?? null` semantics. No regression. PASS.

### HS-4 — New HTTP-envelope spec (`apply.controller.http.spec.ts`) — PASS
- **Boots a real Nest app** (`Test.createTestingModule` → `createNestApplication`) and
  registers the SAME global filter main.ts wires (`app.useGlobalFilters(new HttpExceptionFilter())`).
- **Uses Node's native `http` module** (no supertest — documented as absent from the
  golden node_modules; mirrors TM-3's `public-listing.controller.http.spec.ts`).
- **Positive assert:** 409 + `body.code === 'apply_in_flight'` (the retryable
  discriminator survives serialization), `body.error === 'Conflict'`, exact message.
- **Negative assert:** exact key-set `['code','error','message','path','statusCode','timestamp']`,
  `'kind' in body === false`, no `stack`, no `hirer_id`. This is a true leak/regression
  fence: any reintroduction of the dropped `kind` field fails the build.
- Stub `ApplyService` throws the identical house-shape ConflictException; anti-bot +
  JWT guards overridden allow-all so the request reaches the controller (the abuse gate
  is pinned in `apply.controller.spec.ts`, not under test here). No DB / Prisma needed.
- The asserted key-set exactly matches `HttpExceptionFilter` output
  (`http-exception.filter.ts` L77-85): `request_id` absent because no RequestIdMiddleware
  in the minimal app — correctly accounted for in the spec comment. PASS.

### HS-5 — Envelope shape vs TM-3 R2 (`d488c60b` + `d2b3dd2f`) — IDENTICAL
- TM-3 throws `NotFoundException({ error:'Not Found', message:'Job listing not found',
  code:'job_listing_not_found' })`. TM-5's `job_listing_not_found` 404 throw site is
  **byte-identical**.
- Both lanes' HTTP specs assert the **same exact wire key-set**
  `['code','error','message','path','statusCode','timestamp']`, both positive
  (`code` survives) and negative (no `kind`/stack/internal id), both over Node's native
  `http`.
- **`error` follows the HTTP-reason-phrase convention** in both lanes: `'Not Found'`
  for 404, `'Conflict'` for 409 (per the fixer's deviation-#1 note). The `code` field
  carries the machine-readable discriminator (former `kind` value). Contract converged.
- **Cross-lane convergence: CONFIRMED YES.**

---

## 12-ITEM CYCLE CHECKLIST (reverify all)

1. **Cross-tenant / cross-applicant read leak — PASS (unchanged).** `getOwnProfile`/
   `updateOwnProfile`/`myApplications` all scope on `req.user.id`-derived `user_id`/
   `applicant_user_id`; owner scope applied independently of the cursor. No route accepts
   an id from path/body for a read. RLS defense-in-depth intact.

2. **Replay / double-submit idempotency — PASS (strengthened).** Two layers preserved
   (ledger fencing-nonce + DB unique). The fixer ADDED a third backstop: the
   `(applicant_user_id, listing_id)` composite unique closes the distinct-key
   duplicate-write gap Lens A flagged as P2-2. No layer weakened.

3. **Account takeover / pre-coach confusion — PASS (unchanged).** `resolveAccount` by
   normalized email; `precoach:<sha256>` placeholder identity; role hard-coded `student`;
   email-race P2002 → re-read winner. Trim of `email.trim().toLowerCase()` unchanged.

4. **Idempotency / race (CONTRACT CHANGED — extra scrutiny) — PASS.** The new composite
   unique extends the contract from "same-key dedup" to "one Application per (applicant,
   listing) regardless of key." The P2002 catch correctly routes BOTH constraints to
   idempotent recovery without over-catching genuine conflicts (see HS-2). Pinned by the
   new distinct-key recovery spec. The `apply_in_flight` retryable signal now reaches the
   wire (HS-4). Net: contract is tighter and better-tested — no regression.

5. **Anonymous confirmation contract — PASS (unchanged).** `toConfirmation`/`fromLedger`
   return the exact allow-list; replay validates ledger JSON field-by-field; corrupt
   ledger → loud `apply_replay_corrupt` 409 (now with `code` on the wire).

6. **Fit scoring — no protected attributes — PASS (unchanged).** `computeFitSignal`
   untouched by the fixer; pure, two explainable axes, no protected inputs.

7. **Migration (TM-5's FIRST migration — extra scrutiny) — PASS.** `20261220000031`
   is additive, idempotent (`IF NOT EXISTS`), correctly dated, Prisma-name-aligned, and
   leaves the `Application` RLS regime untouched (see HS-1). This is the only schema/DB
   change in the fixer pass.

8. **RLS defense-in-depth — PASS (unchanged).** `Application` ENABLE+FORCE + owner/hirer
   policies, `Applicant` self-scope, idempotency ledger RESTRICTIVE deny-all — all
   pre-existing and unmodified by the new index.

9. **PostHog / analytics PII — PASS (unchanged).** No analytics calls in the lane;
   fixer added none.

10. **PII in logs / abuse store — PASS (unchanged).** No `console.*`/logger emits email;
    PII-hygiene spec intact. New trim helpers and HTTP spec emit no PII (the HTTP spec's
    `jo@example.com` is a request input, never asserted into a log). The error envelope
    carries only `error`/`message`/`code` — no applicant identity.

11. **Banned-token grep — PASS (CLEAN).** Grep over the full TM-5 lane (src + test) for
    `@ts-ignore | as any | as unknown as | as never | .catch(()=>undefined) | "Coming soon"`
    → EMPTY. The new HTTP spec uses `as Record<string, unknown>` on parsed JSON — a single
    structural cast, NOT the banned double-cast `as unknown as`. Zero residual `kind:`
    references in the lane; exactly 6 `code:` throw sites (matches the 6 brief sites).

12. **Doctrine pins (roles-enforced + posthog-event-names) — PASS (unchanged).**
    Controller auth posture identical to the prior CLEAN audit: apply `@Public()` +
    `@AntiBotGate(Apply)` + `AntiBotGuard`; profile/applications `@Roles('student')` +
    `JwtAuthGuard`. No coach/owner gating. No posthog events ⇒ pin green.

---

## CONTINUITY vs PRIOR CLEAN (c7298ae1)

Every check Lens B verified at `c7298ae1` still passes at `746c0a09`. The fixer:
- **Resolved** the three non-blocking observations Lens B recorded last pass — note #3
  (missing `@@unique`) is now FIXED by the composite unique; the idempotency contract is
  strictly stronger.
- **Did not weaken** any owner-scope, RLS, PII-allow-list, or fit-purity property.
- **Left** the unsigned-cursor (note #2 / Lens A P3-1) untouched per brief — still
  owner-scoped, no IDOR. Correctly deferred to the TM-3-landing hoist.

No regression introduced by the R1 pass.

---

## NO-CODE-CHANGE ITEMS (per brief — acknowledged)

- **Lens A P3-1 (unsigned cursor):** correctly NOT changed. Owner-scoped, no IDOR;
  tracked for hoist-once-TM-3-lands. Verified `application-cursor.ts` unchanged in the
  fixer diff.
- **Lens A P3-2 (unverified-email pre-coach minting):** correctly NOT changed. Anti-bot
  is the agreed control; this is an operator PII sign-off concern, not a code defect.

---

## SHA STABILITY

- Audited at `746c0a09cba75898e4b3f1a3429d5c85f4988c0a` throughout; `git rev-parse HEAD`
  confirmed. Base main pinned `96d7f464f50ad0af19004c1c5e125ec80b395032`.
- Source read from git objects at the audited SHA (sparse worktree). Diffs of all three
  fixer commits inspected in full.
- READ-ONLY: no backend code written or pushed.

## BUILD/TEST GATE NOTE

This audit environment is a sparse, read-only checkout with no `node_modules`, so
`tsc --noEmit` / `jest` were not executed by the auditor (not the auditor's role; the
R1 fixer reported these gates green per the brief's formal-return contract). The audit
is a static contract/drift review against the source-of-truth git objects, which is the
appropriate scope for the cycle lens. The new specs are structurally sound and
methodologically equivalent to TM-3's green HTTP spec.

## FALSE-POSITIVE GUARD

No finding raised. The one item that *looks* like a defect — the un-targeted P2002 catch
— is verified correct (both constraints legitimately mean "duplicate (applicant,
listing)"; genuine ConflictExceptions are non-Prisma and propagate). Flagging it would be
a false positive.

---

## RECOMMENDATION

**CLEAN_NO_FINDINGS — clear to merge from Lens B.** R1 fixer pass is correct and
complete; cross-lane envelope converged with TM-3 R2; prior CLEAN verdict upheld with no
regression. Reconcile with Lens A's re-audit at this SHA.
