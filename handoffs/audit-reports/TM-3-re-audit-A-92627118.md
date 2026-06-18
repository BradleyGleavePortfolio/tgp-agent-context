# TM-3 RE-AUDIT — LENS A (EXHAUSTIVE) — gpt_5_5

- **SHA audited:** `92627118f9cbfb03ce34d0a11dfbfd1cc9688065`
- **Branch:** `feat/tm-3-public-browse`
- **PR:** #434 (public listing browse + SEO detail API)
- **Base main (post-TM-14):** `96d7f464f50ad0af19004c1c5e125ec80b395032`
- **Timestamp (UTC):** 2026-06-18T10:00:06Z
- **Lens:** A (EXHAUSTIVE, gpt_5_5)
- **Mode:** read-only

## FINAL VERDICT: `CLEAN_NO_FINDINGS`

| Severity | Count |
|----------|-------|
| P0       | 0     |
| P1       | 0     |
| P2       | 0     |
| P3       | 0     |
| **Total**| **0** |

No findings. This SHA is merge-ready from the Lens A (exhaustive) perspective.

---

## Scope of this re-audit

Full PR diff `96d7f464..92627118` re-read in its entirety (12 files,
+1582/−1 net). The delta since the last clean Lens-A audit at `06649f97` is a
single R3 cosmetic commit (`92627118`, +10/��5) to
`public-listing.controller.spec.ts`. Every source path, error branch, and test
invariant was re-examined against the 10-point exhaustive checklist below — not
just the R3 delta.

### PR file inventory (vs base main)
| File | Role |
|------|------|
| `.env.example` (+10) | documents optional `PUBLIC_LISTING_CURSOR_SECRET` |
| `src/talent-marketplace/public-listing.controller.ts` | anon `@Public` + `@Throttle` controller |
| `src/talent-marketplace/public-listing.service.ts` | browse/detail, published filter, allow-list mappers |
| `src/talent-marketplace/public-listing.cursor.ts` | HMAC keyset tuple cursor + boot-warn |
| `src/talent-marketplace/public-listing.dto.ts` | query DTO + public payload contracts |
| `src/talent-marketplace/job-posting-jsonld.ts` | schema.org JobPosting builder |
| `src/talent-marketplace/talent-marketplace.module.ts` | wires controller + service |
| `__tests__/public-listing.controller.http.spec.ts` | real-Nest wire-envelope pin |
| `__tests__/public-listing.controller.spec.ts` | metadata/delegation/bounds (R3 edit here) |
| `__tests__/public-listing.service.spec.ts` | published/PII/keyset/comp/boot-warn |
| `__tests__/public-listing.cursor.spec.ts` | round-trip/edge/tamper matrix |
| `__tests__/job-posting-jsonld.spec.ts` | JSON-LD shaping + PII-drop |

---

## Exhaustive checklist results

### 1. R0 — decacorn quality bar — PASS
Code is clear, well-commented at the WHY level, no dead code, no embarrassing
patterns. Threat model is documented inline (cursor.ts L10-17), the published
filter rationale and the created_at-vs-published_at sort-key choice are
explained (service.ts L19-28). Nothing here would embarrass a top-tier shop.

### 2. Banned tokens — PASS (0 P0)
Grepped the TM-3 lane and the 12 PR files for `@ts-ignore`, `as any`,
`as unknown as`, `as never`, `.catch(()=>undefined)`, `Coming soon`. **Zero
hits.** Every `as` cast in the PR files is a narrow concrete cast
(`as Record<string, unknown>`, `as { where: ... }`, `as PublicListingService`,
`as Partial<Row>`), none banned. The only `@ts-expect-error` occurrences in the
tree live in `anti-bot/__tests__/*` (NOT part of this PR's diff) and carry
reasons. The `compensation_type: string` cast in service.spec.ts L377 is the
documented narrow shape used to drive the unreachable enum-default arm — allowed.

### 3. Security surface — PASS
- `@Public()` opts the controller out of the global JwtAuthGuard; metadata pinned
  in the spec (`IS_PUBLIC_KEY === true`, guards array `[]`, no `@Roles`).
- `@Throttle({ default: { ttl: 60000, limit: 60 } })` bounds the anon surface;
  pinned (`THROTTLER:LIMITdefault === 60`, `:TTLdefault === 60000`).
- PII: payloads are built by explicit allow-list mappers (`toCard`/`toDetail`);
  the raw entity is NEVER spread. `hirer_id`/`idempotency_key` cannot leak — the
  service spec asserts both an exact closed key-set AND a JSON substring scan for
  the secret values on card and detail.
- Cursor carries only `(created_at, id)` of public published rows — no PII.

### 4. Envelope contract — PASS
`PublicListingService.detail` throws
`NotFoundException({ error:'Not Found', message:'Job listing not found', code:'job_listing_not_found' })`.
Verified against the global `HttpExceptionFilter` (pre-existing, NOT in this
PR's diff): it reads `body.message`/`body.error`/`body.code` and emits
`{ statusCode, code?, message, error, timestamp, path, request_id? }`. The
machine-readable id rides `code` and SURVIVES to the wire; a bare `kind` would be
silently dropped. The R2 migration is therefore correct. 404 (never 401/403) so
an anon caller cannot distinguish draft/closed from non-existent.

### 5. Keyset + index correctness — PASS
Sort key `(created_at DESC, id DESC)` backs `@@index([status, created_at, id])`.
created_at is NOT NULL (total order); published_at (nullable) is deliberately NOT
the key — documented. Over-fetch limit+1 to detect a further page; boundary uses
a tuple OR-predicate (`created_at < c` OR `created_at = c AND id < c.id`), never
offset (`skip` asserted undefined). A stale/forged/malformed cursor parses to
null → degrades to page 1. Deletion race is benign: a removed boundary row only
shifts which rows the keyset predicate matches, never widens visibility (the
`status:'published'` filter is independent of the cursor).

### 6. Cursor security — PASS
HMAC-SHA256 over `<iso>|<id>`, truncated to 96 bits (documented as ample for a
non-security integrity check). Constant-time compare via `timingSafeEqual` with a
length-guard fallback (timingSafeEqual throws on length mismatch). First/last
separator split correctly round-trips ids containing `|`. Tamper matrix covers
unsigned tuple, wrong sig, mutated-payload, and cross-secret rejection — all →
null. Boot-warn: `cursorSecretBootWarning` returns the warning string only when
`NODE_ENV==='production' && secret unset/blank`, emitted once via `Logger.warn`
in `onModuleInit`; non-fatal by design (distinct from the fatal
MWB_AUTOSAVE_LOCK_TOKEN_SECRET authz token). `.env.example` documents it.

### 7. DTO / validation — PASS
`:id` guarded by `ParseUUIDPipe({ version: '4' })` — a non-UUID is a 400 before
the service/DB (exercised against the real pipe in the spec). `limit` coerced
then `@IsInt @Min(1) @Max(50)`: `abc`/`1.5`/`0` rejected, missing → default 20.
`cursor` capped at 512 chars (oversized-blob guard); facets length-bounded and
trimmed. Unknown `compensation_type` is dropped (undefined) rather than matching
zero rows.

### 8. Test coverage — PASS
`public-listing.controller.http.spec.ts` boots a REAL Nest app
(`Test.createTestingModule` + `app.useGlobalFilters(new HttpExceptionFilter())` +
`app.listen(0)`) and issues a real GET over Node's built-in `http` module (no
supertest — absent from this repo). It asserts status 404, the positive fields
(`statusCode/error/message/code`), the exact closed key-set
`['code','error','message','path','statusCode','timestamp']`, and the ABSENCE of
`kind`, `stack`, and `hirer_id`, plus correct `path`. Doctrine sweep
(quietLuxuryDoctrine|FlagOff|doctrine|pin|posthog-event-names|roles-enforced) =
7 suites / 54 tests green. TM lane = 11 suites / 118 tests green. tsc exit 0.

### 9. JSON-LD generation — PASS
`buildJobPostingJsonLd` consumes ONLY the allow-listed `PublicListingDetailDto`,
never the raw entity — PII-free by construction. Optional fields are omitted (not
nulled) when absent. It returns a structured plain object (not a string), so
output escaping is the renderer's concern (TM-W2, out of scope); no injection
surface here. The jsonld spec asserts shaping + rogue-key/PII drop.

### 10. Re-audit-specific (R3 cleanup) — PASS
`git show 92627118` confirms a single-file change to
`public-listing.controller.spec.ts` (+10/−5), authored by
`bradley <bradley@bradleytgpcoaching.com>`. The diff updates ONLY (a) the
"DELEGATION + STATUS" doc comment and (b) the `getResponse()` fixture body from
`{ kind: ... }` to `{ error, message, code }`, plus a one-line pointer to the
wire pin. The assertions (`getStatus: () => 404`, `.rejects.toBe(notFound)`) are
UNCHANGED — the test still asserts only 404 status + error-identity propagation,
never the body, so there is **no functional drift**. The wire pin in
`public-listing.controller.http.spec.ts` is untouched by R3 and still asserts the
closed key-set with no `kind`/`stack`/internal-id leak. The stale fixture that
NEW-B-CYCLE-P3-1 flagged is fully resolved.

---

## Identity / hygiene
- R3 commit author: `bradley <bradley@bradleytgpcoaching.com>` — R74-clean, no AI
  names, no Co-Authored-By.
- Worktree clean at the audited SHA; local HEAD == audited SHA.

## Conclusion
TM-3 at `92627118` is `CLEAN_NO_FINDINGS` under the exhaustive Lens A. The
NEW-B-CYCLE-P3-1 cosmetic cleanup is correct and non-functional. All security,
envelope, keyset, cursor, validation, JSON-LD, and test-coverage invariants hold.
Recommend proceeding to dual-CLEAN merge per operator authorization.
