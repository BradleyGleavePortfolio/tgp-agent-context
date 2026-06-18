---
audit: TM-5 — Apply funnel + pre-coach account + applicant profile
lens: A (exhaustive, read-only)
sha: 8e221964da18928355757ef277edf6911d4464f9
branch: feat/tm-5-apply-precoach
pr: "#435"
base_main: bdd709e85885c7f00c966078a60079a62a95c18b
diff_range: bdd709e8..8e221964
timestamp_utc: 2026-06-18T10:27:11Z
final_verdict: CLEAN_NO_FINDINGS
counts:
  P0: 0
  P1: 0
  P2: 0
  P3: 0
---

# TM-5 Lens A exhaustive re-audit @ 8e221964

**Verdict: CLEAN_NO_FINDINGS (P0 0 / P1 0 / P2 0 / P3 0)**

Read-only audit of the full PR diff `bdd709e8..8e221964` (13 files, +2034/−2),
post-rebase onto post-TM-3-merge main. Every line, every error branch, and every
spec was read. No backend code was modified; no fixer run; no CI triggered.

| Severity | Count |
| -------- | ----- |
| P0 (blocker)   | 0 |
| P1 (must-fix)  | 0 |
| P2 (should-fix)| 0 |
| P3 (polish)    | 0 |

## Scope verified (HEAD / merge-base)

- `git rev-parse HEAD` → `8e221964da18928355757ef277edf6911d4464f9` ✔
- `git merge-base HEAD origin/main` → `bdd709e85885c7f00c966078a60079a62a95c18b` ✔ (clean linear base on new main)
- Diff stat: 13 files / +2034 / −2 (entire TM-5 surface + the module.ts union delta).

## Files audited (all 13)

| File | Lines | Assessment |
| ---- | ----- | ---------- |
| `prisma/migrations/20261220000031_.../migration.sql` | +20 | Clean |
| `prisma/schema.prisma` | +6 | Clean |
| `src/talent-marketplace/apply.service.ts` | +550 | Clean |
| `src/talent-marketplace/apply.controller.ts` | +96 | Clean |
| `src/talent-marketplace/apply.dto.ts` | +217 | Clean |
| `src/talent-marketplace/apply-fit.ts` | +81 | Clean |
| `src/talent-marketplace/application-cursor.ts` | +39 | Clean |
| `src/talent-marketplace/talent-marketplace.module.ts` | +14/−2 | Clean (4-lane union) |
| `__tests__/apply.service.spec.ts` | +475 | Clean |
| `__tests__/apply.controller.spec.ts` | +185 | Clean |
| `__tests__/apply.controller.http.spec.ts` | +163 | Clean |
| `__tests__/apply-fit.spec.ts` | +121 | Clean |
| `__tests__/application-cursor.spec.ts` | +69 | Clean |

## Ten scrutiny points — findings

### 1. R0 decacorn quality
No half-finished code, no dead branches, no speculative abstraction. Every public
method is exercised by a spec. Doc comments explain *why* (PII boundary, luxury
payload contract, dedup intent), not *what*. **No finding.**

### 2. Banned tokens (P0 gate)
Grep across `src/talent-marketplace/` source + specs for
`@ts-ignore | as any | as unknown as | as never | .catch(()=>undefined) | Coming soon`
→ **empty**. All `as Record<string, unknown>` casts in the ledger-parse helpers are
narrow concrete shapes (allowed, not banned widening). **No finding.**

### 3. Anonymous-apply security surface
`POST listings/:id/apply` is `@Public()` + `@AntiBotGate(ANTI_BOT_SURFACES.Apply)` +
`@UseGuards(AntiBotGuard)` + `@HttpCode(201)` + `ParseUUIDPipe` (apply.controller.ts:56-66).
The anonymous surface is deliberately unauthenticated (it mints a pre-coach
account) but sits behind the TM-6 anti-bot gate — the abuse control for the
account-create + apply vector. Listing visibility is enforced server-side
(`status !== 'published'` → 404, apply.service.ts:63), mirroring RLS so drafts/closed
are invisible. The decorator posture is pinned by apply.controller.spec.ts:117-161
(apply is `@Public` + anti-bot, never `@Roles`; profile routes are `@Roles('student')`,
never `@Public`). **No finding.**

### 4. Idempotency + replay + race recovery
Three layers, each spec-covered:
- **Ledger claim** (`claimOrReplay`): `replay` → returns stored confirmation w/o
  re-mutating (spec:237-290, asserts `create` NOT called); `in_flight` → 409
  `apply_in_flight` retryable (spec:292-317); default key namespaced per
  `apply:<account>:<listing>` so there is no cross-user intent leak (spec:319-351).
- **markCompleted reclaim**: a reclaimed claim mid-flight routes to
  `recoverConfirmation` rather than surfacing a 500 (apply.service.ts:117-121).
- **Dual-P2002 recovery**: a P2002 on EITHER `Application.idempotency_key` (same-key
  race) OR the `(applicant_user_id, listing_id)` composite (distinct-key duplicate)
  releases the claim and replays the one existing application owner-scoped
  (apply.service.ts:123-141; spec:353-420 asserts exactly one create attempt, claim
  released, recovered id == original). **No finding.**

### 5. Pre-coach account model (unverified-email mint, PII flows)
`resolveAccount` looks up by lowercased email, else mints a lightweight `User`
(`supabase_id: precoach:<sha256(email)>`, role `student`, unverified) with a P2002
email-race recovery path. The `precoach:` namespace cleanly separates these stubs
from real Supabase identities so TM-12 auto-flip can link a verified identity at
conversion without colliding. Email is hashed into the supabase_id (not stored in
clear there). **No finding.**

### 6. PII drops / allow-list boundary
Every response crosses through an explicit allow-list mapper (`toProfile`,
`toCard`, `toConfirmation`) — no raw `Applicant`/`Application`/`User` entity is ever
spread. Identity (email, names) is echoed back ONLY to the owning applicant
(`getOwnProfile`). The anonymous apply confirmation is ids + status + one fit chip
+ closure copy only — spec:274-289 asserts the exact key set AND that the
applicant email and `hirer_id` do NOT appear anywhere in the serialized payload.
PII-hygiene spec:423-474 asserts the applicant email is never written to
console.log/error/warn on the happy path. **No finding.**

### 7. DB constraints (migration 20261220000031 + idempotent retry)
`@@unique([applicant_user_id, listing_id])` in schema.prisma is mirrored by raw
`CREATE UNIQUE INDEX IF NOT EXISTS "Application_applicant_user_id_listing_id_key"`
(Prisma-convention index name). Migration is additive DDL only, dated AFTER the
prior shipped `20261220000020` migration, idempotent (`IF NOT EXISTS`), and alters
no shipped migration. Safety note is correct: the index can only fail on
pre-existing duplicates, and this PR has not shipped, so none can exist. The
composite is the DB backstop for the distinct-key duplicate vector (the ledger
only dedups same-key); a P2002 on it is caught and routed to idempotent recovery
(point 4). **No finding.**

### 8. Error envelope on every throw site + TM-3 cross-lane convergence
**Six throw sites, all carrying the full house envelope `{ error, message, code }`:**

| Site | HTTP | error | code |
| ---- | ---- | ----- | ---- |
| apply.service.ts:70 | 404 | Not Found | `job_listing_not_found` |
| apply.service.ts:102 | 409 | Conflict | `apply_in_flight` |
| apply.service.ts:154 | 404 | Not Found | `applicant_not_found` |
| apply.service.ts:174 | 404 | Not Found | `applicant_not_found` |
| apply.service.ts:358 | 409 | Conflict | `apply_conflict` |
| apply.service.ts:374 | 409 | Conflict | `apply_replay_corrupt` |

**Convergence with TM-3 (now on main):** the global `HttpExceptionFilter`
(http-exception.filter.ts:45-47) reads ONLY `body.message` / `body.error` /
`body.code` and emits `{ statusCode, code?, message, error, timestamp, path,
request_id? }`. It never reads `kind`. TM-5's `job_listing_not_found` 404 is
byte-identical to the TM-3 public-detail 404 contract; both lanes converge at the
filter boundary. This is proven end-to-end by apply.controller.http.spec.ts, which
boots a real Nest app with the production filter, POSTs over Node's built-in `http`
(no supertest, mirroring TM-3's http spec), and asserts the 409 `apply_in_flight`
wire body keys are EXACTLY `{ code, error, message, path, statusCode, timestamp }`
— with `kind`, `stack`, and `hirer_id` explicitly absent. **No finding.**

### 9. DTO / validation
`ApplyDto` bounds all inputs: email `@IsEmail @MaxLength(254)`; first/last name
`@IsNotEmpty @MaxLength(80)`; bio/headline length-capped; specialties/certifications
`@ArrayMaxSize(20)` + per-entry `@MaxLength(120)`; years_experience `Min(0)/Max(80)`;
sample_program_url `@IsUrl({require_protocol:true})`; cover_note `MaxLength(4000)`;
idempotency_key `MaxLength(200)`. `MyApplicationsQueryDto` caps cursor `MaxLength(512)`
and limit `Min(1)/Max(50)`. Service trims every free-text field (names, headline,
bio, per-array-entry, url) for whitespace parity (apply.service.ts:181-189; pinned by
spec:140-171). Response interfaces are pure allow-lists. **No finding.**

### 10. Test coverage
161 TM-lane tests pass (per rebase gate). The five TM-5 specs cover: owner-scoped
reads + allow-list key sets; trim parity; keyset pagination (limit+1 over-fetch,
next_cursor only when more rows); listing-visibility 404; ledger replay (no
re-create); in-flight 409; default-key namespacing; dual-P2002 distinct-key
recovery; PII-no-log; the full auth-boundary decorator matrix; the HTTP wire
envelope; pure-fit determinism/clamping/levels; cursor roundtrip + 6 tamper→null
degradation cases. Coverage is thorough across the happy path and every error
branch. **No finding.**

## Cursor: unsigned base64url is NOT a finding

`application-cursor.ts` encodes the `(created_at, id)` boundary as a plain
base64url blob (unsigned — no HMAC). This is intentional and safe: the
`myApplications` query seeds `where: { applicant_user_id: <JWT subject> }` BEFORE
merging the cursor tuple (apply.service.ts:208-210), so the cursor only narrows a
page boundary WITHIN the caller's own rows. A forged or tampered cursor cannot
widen the owner scope (no IDOR) and degrades to "page 1" on any malformed input
(`parseTupleCursor` returns null; 6 spec cases). It matches TM-3's documented
same-surface helper. **No finding.**

## module.ts 4-lane union sanity

The rebase conflict resolution is a clean additive union of all four lanes —
nothing dropped, nothing duplicated, no drift:

- **imports:** `[AntiBotModule, TalentConnectAdapterModule]` (TM-5 anti-bot + TM-14 Connect adapter)
- **controllers:** `[JobListingController, ApplyController, TalentConnectWebhookController, PublicListingController]` (TM-2 + TM-5 + TM-14 + TM-3)
- **providers:** `JobListingService, ApplyService, MarketplaceIdempotencyService, PublicListingService, PrismaService, JwtAuthGuard, JwksVerifierService, HirerVerifiedGuard, TalentConnectWebhookService`
- **exports:** `[JobListingService, ApplyService]`
- **doc banners:** TM-2 / TM-3 / TM-5 / TM-14 all retained.

TM-3 lane code (now part of main) was preserved untouched — only the wiring was
unioned. **No finding.**

## R74 identity

`git log origin/main..HEAD` — all commits authored
`Bradley Gleave <bradley@bradleytgpcoaching.com>`. No AI / Claude / Computer /
Co-Authored / Agent strings. IDENTITY clean.

## Conclusion

TM-5 @ `8e221964` is **CLEAN_NO_FINDINGS**. The anonymous-apply surface is correctly
gated (anti-bot + server-side visibility), idempotency is triple-layered with
spec-proven dual-P2002 recovery, PII is allow-listed at every boundary and never
logged, the composite-unique DB backstop is additive and idempotent, all six error
throw sites carry the house envelope and converge byte-identically with TM-3 at the
filter (proven by a real-HTTP spec), and the rebase module union dropped/duplicated
nothing. No P0/P1/P2/P3 issues. Clear to proceed to the operator's merge pipeline
pending the 4 required CI checks.
