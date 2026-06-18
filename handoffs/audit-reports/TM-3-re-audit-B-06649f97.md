# TM-3 RE-AUDIT — LENS B (CYCLE / drift / regression) — claude_opus_4
SHA: `06649f9798d5af714030585aac6cd60858b9f5a2` | branch: `feat/tm-3-public-browse` | PR #434
BASE MAIN (post-TM-14): `96d7f464f50ad0af19004c1c5e125ec80b395032`
PRE-REBASE CLEAN BASELINE (prior Lens B): `1f9778daa4b03a87629753291d40b744c1525589`
TIMESTAMP: 2026-06-18 (UTC)
LENS: B — cycle continuity, R2-fixer drift, rebase safety, cross-lane convergence.

> Prior Lens B @ `1f9778da`: FINDINGS_PRESENT (0/0/1 P2 + 2 P3) — B-CYCLE-P2-1 (envelope drops `kind`), B-CYCLE-P3-1 (no prod cursor-secret boot warn), B-CYCLE-P3-2 (`cta_listing_id===id` unpinned). R2 fixer (now `8615945` + `06649f9` post-rebase) was tasked to clear all three to reach dual-CLEAN.

---

## FINAL VERDICT
**FINDINGS_PRESENT — 0 P0 / 0 P1 / 0 P2 / 1 P3**

The three prior Lens B findings are all FIXED and spec-pinned. The rebase onto main `96d7f464` is a clean additive-union with no functional drift. Cross-lane envelope convergence with TM-5 is byte-identical. One **new P3** (cosmetic) is raised: a stale `{kind:...}` fixture + comment left in `public-listing.controller.spec.ts` now contradicts the shipped `{error,message,code}` service contract. It is non-functional (the test asserts only error-identity propagation + 404 status, never body shape), so it does not block merge — but for cycle hygiene it should be reconciled to match the converged envelope.

## COUNTS
| Severity | Count |
|----------|-------|
| P0 (blocker) | 0 |
| P1 (must-fix) | 0 |
| P2 (should-fix) | 0 |
| P3 (polish) | 1 |

Cycle delta vs prior Lens B (`1f9778da`): P2 1→0, P3 2→0 (priors cleared); +1 NEW P3 (stale test fixture, fixer-introduced doc drift).

---

## PRIOR-FINDING DISPOSITION (cycle continuity)

### B-CYCLE-P2-1 — 404 envelope dropped `kind` → **FIXED**
`public-listing.service.ts` `detail()` now throws the house envelope the global filter actually serializes:
```ts
throw new NotFoundException({
  error: 'Not Found',
  message: 'Job listing not found',
  code: 'job_listing_not_found',
});
```
This is **Option A** from the R2 brief (match house convention; `kind`→`code`). Verified faithful end-to-end:
- `HttpExceptionFilter` (`src/filters/http-exception.filter.ts` L37–41, L67–75) reads `body.code` and emits it as a top-level `code` only when present; it never reads or emits `kind`. So the machine-readable id now survives normalization to the wire and the dropped-`kind` defect is closed at the filter boundary, not merely at the service body.
- **NEW pin** `__tests__/public-listing.controller.http.spec.ts` boots a **real Nest app** (`createNestApplication` + `app.listen(0)`), registers the **production global filter** (`app.useGlobalFilters(new HttpExceptionFilter())`), and issues a **real GET over Node's `http` module** (no supertest — mirrors TM-5's converged pattern). It asserts **positively** `status===404`, `statusCode===404`, `error==='Not Found'`, `message==='Job listing not found'`, `code==='job_listing_not_found'`; and **negatively** the exact closed wire key-set `['code','error','message','path','statusCode','timestamp']`, plus `'kind' in body === false`, `'stack' in body === false`, `'hirer_id' in body === false`, and `path` echo. Real-app + global-filter + positive + negative — exactly the brief's requirement.

### B-CYCLE-P3-1 — no prod boot-warn on unset cursor secret → **FIXED**
`public-listing.cursor.ts` adds `cursorSecretBootWarning(env)`: returns the warn string iff `NODE_ENV==='production'` AND the secret is unset/blank (`isUsingFallbackSecret` uses `(env[..] ?? '').trim()===''`, matching `cursorSecret()`'s falsy-empty fallback). `PublicListingService` now `implements OnModuleInit`; `onModuleInit()` calls it and `logger.warn`s once if non-null. Message text matches the brief verbatim (`[TM-3] PUBLIC_LISTING_CURSOR_SECRET is unset in production … rotate before public launch.`).
**Pins (two layers):**
- Unit matrix (`cursor.spec.ts` "cursorSecretBootWarning — prod misconfig signal"): prod+unset → warn; prod+blank/whitespace → warn; prod+set → null; dev/test/empty-env → null. Env injected (no real `process.env` mutation).
- Integration (`service.spec.ts` "onModuleInit — cursor-secret boot warning"): prod+unset → `warn` called **exactly once**; prod+set → silent; non-prod → silent. NODE_ENV + secret saved/restored in `afterEach` (no test pollution).

### B-CYCLE-P3-2 — `cta_listing_id===id` byte-for-byte unpinned → **FIXED**
`service.spec.ts` pins on **both** surfaces:
- Card: `expect(card.cta_listing_id).toBe(card.id)` + `.toBe('listing-cta-1')` (L138–139).
- Detail: `expect(listing.cta_listing_id).toBe(listing.id)` + `.toBe('listing-cta-2')` (L302–303).
Source: `toCard` sets `cta_listing_id: row.id`; `toDetail` spreads `...toCard(row)`, so detail inherits the same byte. Invariant locked; a future refactor deriving it from another column fails the build.

---

## NEW FINDING

### NEW-B-CYCLE-P3-1 (cosmetic) — stale `{kind:...}` fixture/comment in `public-listing.controller.spec.ts` contradicts the converged contract
The R2 envelope migration updated `service.ts` to throw `{error,message,code}` and added the wire-pin `http.spec.ts`, but left the controller-unit spec's legacy fixture and doc-comment referencing the OLD shape:
- L24–28 header comment: "...surfaces the service's NotFoundException (404, `{kind:'job_listing_not_found'}`)..."
- L140–145 test fixture: `getResponse: () => ({ kind: 'job_listing_not_found' })`.

**Why this is only P3 (non-functional):** that test asserts the controller is a pass-through — `await expect(controller.detail(id)).rejects.toBe(notFound)` checks error *identity* and the comment's `getStatus()===404`, **never** the response body shape. The fabricated `getResponse()` payload is never inspected, so the test passes regardless of whether it says `kind` or `code`; the real wire contract is owned by `http.spec.ts`, which is correct. No build risk, no contract risk.

**Why flag it anyway (cycle hygiene):** the brief's Option A deliberately retired `kind` from the TM-3 surface. Leaving a `{kind:...}` fixture + comment in a TM-3 spec is documentation drift that could mislead a future reader into thinking `kind` is still part of the contract, partially re-opening the very confusion B-CYCLE-P2-1 closed. **Suggested fix (1-line, optional):** update the fixture to `getResponse: () => ({ error:'Not Found', message:'Job listing not found', code:'job_listing_not_found' })` and the L28 comment to `{code:'job_listing_not_found'}`. Below the merge bar; record-and-defer is acceptable.

---

## REBASE SAFETY — no functional drift beyond conflict resolution

`1f9778da` (pre-rebase baseline) has **no merge-base** with main `96d7f464` (confirmed empty), so it predates the TM-14 merge. The audited `06649f97` has merge-base `96d7f464` → the branch was cleanly rebased onto post-TM-14 main.

**Isolated TM-3-lane delta `1f9778da..06649f97`** (stripping the TM-14/main content the rebase pulled in) touches exactly the three R2-mandated areas and nothing else:
- `public-listing.service.ts`: `kind`→`{error,message,code}`; `+OnModuleInit`/`logger`/`onModuleInit`; import of `cursorSecretBootWarning`. The `process.env.X`→`process.env[PUBLIC_LISTING_CURSOR_SECRET_ENV]` change is a pure name-constant refactor (identical runtime value). browse/keyset/mappers/filter — **untouched**.
- `public-listing.cursor.ts`: `+PUBLIC_LISTING_CURSOR_SECRET_ENV`, `+isUsingFallbackSecret`, `+cursorSecretBootWarning`. Signing/`cursorSecret()` fallback (`|| 'tm3-public-cursor-dev'`), HMAC, parse — **byte-identical**.
- Specs: `cursor.spec.ts` (+warn matrix, additive — all tamper/round-trip tests preserved), `service.spec.ts` (+cta pins, +onModuleInit warn block), new `controller.http.spec.ts`.
- **Baseline-identical (zero diff):** `public-listing.controller.ts`, `public-listing.dto.ts`, `job-posting-jsonld.ts`, `job-posting-jsonld.spec.ts`, `public-listing.controller.spec.ts`.

**Module conflict resolution** (`talent-marketplace.module.ts`) is a correct additive-union of BOTH lanes:
- imports: TM-2 `JobListing*` + TM-14 `TalentConnectWebhook*` + TM-3 `PublicListing*` (all present).
- controllers: `[JobListingController, TalentConnectWebhookController, PublicListingController]` (all three).
- providers: `JobListingService, PublicListingService, PrismaService, JwtAuthGuard, JwksVerifierService, HirerVerifiedGuard, TalentConnectWebhookService` (TM-3 + TM-14 + shared, none dropped).
- exports: `[JobListingService]` (unchanged from main).

**Verdict: NO functional drift beyond conflict resolution.** The rebase neither weakened TM-14's webhook surface nor altered any TM-3 runtime path.

---

## CROSS-LANE ENVELOPE CONVERGENCE (TM-5 R1 @ 746c0a09) — CONFIRMED IDENTICAL
TM-3 listing-not-found body: `{ error: 'Not Found', message: 'Job listing not found', code: 'job_listing_not_found' }`.
TM-5 listing-not-found body (per TM-5 Lens A re-audit @ `746c0a09`, throw-site table L70–74): `{ error: 'Not Found', message: 'Job listing not found', code: 'job_listing_not_found' }`.
**Byte-identical** — same key triplet, same `error`=HTTP-status-name convention, same machine-readable `code` discriminator, both consumed by the same global `HttpExceptionFilter` (reads `message`/`error`/`code`, emits `code`). Both lanes also adopt the same wire-pin testing idiom (real Nest app + global filter + Node `http`, positive on `code` survival + negative closed key-set asserting `kind`/`stack`/internal-id absent). The two PRs have converged on one house error envelope. **yes — identical.**

---

## CYCLE-LENS VERIFICATION CHECKLIST (12 items)
1. **Secret rotation safe** — PASS. Old/forged/cross-secret cursors fail HMAC `signaturesMatch` → null → page 1; published filter applied independently of cursor. Cross-env mismatch test retained.
2. **Throttle genuinely attached** — PASS. Class-level `@Throttle({default:{ttl:60000,limit:60}})` + global APP_GUARD; `controller.spec.ts` pins `THROTTLER:LIMITdefault`/`TTLdefault` metadata. Anon IP-bucketed.
3. **Covering index matches keyset** — PASS. `@@index([status, created_at, id])` exactly matches `where{status:'published'} + orderBy[created_at desc, id desc] + (lt,lt) keyset boundary`. No scan.
4. **cta_listing_id deletion race → clean 404** — PASS. `detail()` re-checks `status:'published'` on read; missing/unpublished → 404 (now `{error,message,code}`), window self-heals.
5. **PII drop — negative + positive on all surfaces** — PASS. card/detail exact `Object.keys` locks + JSON-string scans for `hirer_id`/`idempotency_key` (key AND value); JSON-LD rogue-PII drop via `Object.assign`; cursor decodes only `(created_at,id)`.
6. **Banned-token grep empty; doctrine pins intact** — PASS. 0 hits over all TM-3 lane files (`@ts-ignore|as any|as unknown as|as never|.catch(()=>undefined)|Coming soon`); 0 `@ts-expect-error`; no doctrine/posthog/FlagOff/roles-enforced pin file in the diff name-list.
7. **No N+1** — PASS. browse = 1 `findMany` (take limit+1); detail = 1 `findFirst`; `.map(toCard)` pure in-memory. No relation loads.
8. **Cursor forward-compatible** — PASS. HMAC versioning via env-secret rotation; `cursorSecret()` env-var name now a shared exported constant; truncated 96-bit sig documented as non-security integrity check.
9. **Default-arm fallback rationale** — PASS. `asCompensationType` drops unknown comp_type (undefined, no zero-match); `compensationSummary` switch `default` → 'Compensation on application' (fail-safe for future enum growth, documented + tested via narrow cast).
10. **Error-envelope shape contract** — PASS (was B-CYCLE-P2-1). 404 body `{error,message,code}` survives to wire; real-app HTTP pin asserts closed key-set + no `kind`/`stack`/internal-id leak.
11. **Boot-warn parity** — PASS (was B-CYCLE-P3-1). prod+unset → exactly one `logger.warn`; all other matrix rows silent; asymmetry vs the fatal `MWB_AUTOSAVE_LOCK_TOKEN_SECRET` correctly documented (cursor is a non-authz integrity hint).
12. **cta_listing_id byte-for-byte pin** — PASS (was B-CYCLE-P3-2). `toBe(id)` on card AND detail.

---

## EMPIRICAL CONFIRMATION
This audit ran against a sparse/mirror checkout with **no `node_modules`**, so `tsc --noEmit` / `npm test` were NOT re-executed locally; code/spec consistency was verified statically (filter↔service↔spec faithfulness traced line-by-line — the HTTP pin is not self-fulfilling: `HttpExceptionFilter` independently produces the asserted key-set). Per the brief, **all 4 required CI checks (`build-and-test`, `rls-floor-guard`, `rls-live-tests`, `mwb-3-live-tests`) are GREEN at `06649f97`** — empirical green is the operator/CI responsibility and is satisfied.

## SHA STABILITY CONFIRMATION
- Audited tree pinned at HEAD `06649f9798d5af714030585aac6cd60858b9f5a2`.
- Base main `96d7f464f50ad0af19004c1c5e125ec80b395032` is the merge-base of HEAD (clean rebase confirmed).
- Pre-rebase Lens B baseline `1f9778daa4b03a87629753291d40b744c1525589` (no merge-base with main — pre-TM-14, as expected).
- **READ-ONLY audit**: no backend code written or pushed. Only this report is committed/pushed to the context repo.
- R2 fixer commits (post-rebase): `8615945` (envelope + prod-warn), `06649f9` (HTTP wire pin + warn-once + cta pins). All R74-clean.
