# TM-3 RE-AUDIT — LENS A (exhaustive, POST-REBASE) — claude_opus
SHA: 06649f9798d5af714030585aac6cd60858b9f5a2 | branch: feat/tm-3-public-browse | PR #434
BASE MAIN (post-TM-14 merge): 96d7f464f50ad0af19004c1c5e125ec80b395032
timestamp: 2026-06-18T (post-rebase re-audit)
PRIOR (pre-rebase 1f9778da): Lens A CLEAN_NO_FINDINGS; Lens B 0/0/1 P2 + 2 P3
R2 fixer commits: 8615945 (envelope→{error,message,code} + prod warn), 06649f97 (HTTP-envelope pin, cta pin)
REBASE: whole branch onto 96d7f464; 1-file conflict (talent-marketplace.module.ts), additive union with TM-14

## VERDICT
CLEAN_NO_FINDINGS

## COUNTS
P0: 0 / P1: 0 / P2: 0 / P3: 0

## FINDINGS

### P0
(none)

### P1
(none)

### P2
(none)

### P3
(none)

OBSERVATIONS (sub-P3, non-blocking, no action — carried from prior Lens A, still accurate):
1. Cursor dev-secret fallback (`'tm3-public-cursor-dev'` when env unset) is intentional and sound: the cursor is a pagination hint, not an authz token; a forged tuple can only reposition the window over the SAME `status='published'` set because the published filter is applied INDEPENDENTLY of the cursor. The boot-warn (B-CYCLE-P3-1 fix) now surfaces the prod-unset case to operators. Correct asymmetry vs `MWB_AUTOSAVE_LOCK_TOKEN_SECRET` (fatal, no fallback — it mints authz tokens).
2. `detail()` uses `findFirst` without an explicit `select`, loading the full row (incl. hirer_id) into memory before `toDetail` allow-lists. Not a leak (mapper copies only allow-listed fields; exact key-set locks pin both card + detail). A `select` clause would be marginally tighter defence-in-depth. Cosmetic; below P3 bar. Explicitly graded out-of-scope by the R2 fixer brief.

## SPECIFIC VERIFICATION — prior Lens B findings (each CONFIRMED FIXED)

### B-CYCLE-P2-1 — 404 wire envelope dropped `kind` — FIXED ✔
- Service now throws `NotFoundException({ error: 'Not Found', message: 'Job listing not found', code: 'job_listing_not_found' })` (public-listing.service.ts `detail()`). Option A chosen (match house `{error,message,code}` convention) — documented in the inline comment.
- `HttpExceptionFilter` (src/filters/http-exception.filter.ts) reads `body.code` and emits it additively; `kind` is NOT read, so it would be dropped — the new shape uses `code`, which DOES survive to the wire.
- **Wire-envelope pin test EXISTS and is real-Nest-HTTP**: `__tests__/public-listing.controller.http.spec.ts` boots a real `INestApplication`, registers the SAME global `HttpExceptionFilter` main.ts wires, issues a real GET over Node's `http` module (no supertest — mirrors repo e2e convention), and asserts: status 404; `body.code === 'job_listing_not_found'`; `error === 'Not Found'`; `message === 'Job listing not found'`; **negative key-set lock** `Object.keys(body) === [code,error,message,path,statusCode,timestamp]`; `'kind' in body === false`; no `stack`; no `hirer_id`. This is a wire pin, not service-level.
- Service-level body also pinned in public-listing.service.spec.ts ("404 body carries the house { error, message, code } shape").

### B-CYCLE-P3-1 — boot warn when PUBLIC_LISTING_CURSOR_SECRET unset in prod — FIXED ✔
- `cursorSecretBootWarning(env)` (public-listing.cursor.ts) returns the warning string iff `NODE_ENV==='production' && isUsingFallbackSecret` (env var unset OR blank/whitespace via `.trim()===''`), else null.
- `PublicListingService.onModuleInit()` calls it once and `logger.warn`s once.
- **Fires exactly once, only in prod+unset**: pinned two ways. (a) cursor.spec.ts matrix on the pure fn: prod+unset → warns; prod+blank → warns; prod+set → null; development/test/empty-env → null. (b) service.spec.ts `onModuleInit` matrix: prod+unset → `warnSpy` called EXACTLY once (`toHaveBeenCalledTimes(1)`); prod+set → not called; development → not called. The "exactly once" and "only prod+unset" requirement is fully covered.

### B-CYCLE-P3-2 — `cta_listing_id === id` pin on card AND detail — FIXED ✔
- service.spec.ts: "pins cta_listing_id === id byte-for-byte on the card" (`card.cta_listing_id === card.id === 'listing-cta-1'`) AND "pins cta_listing_id === id byte-for-byte on the detail" (`listing.cta_listing_id === listing.id === 'listing-cta-2'`). Both shapes pinned. A future refactor deriving cta from a different column fails the build.

## REBASE INTEGRITY (CONFIRMED — no functional change beyond conflict resolution)
- Full diff vs main `96d7f464` is EXACTLY 12 files: 5 TM-3 src + 5 TM-3 test + `.env.example` + `talent-marketplace.module.ts`. No stray TM-14 files. No prisma/migration/CI/infra/Dockerfile/fly.toml changes.
- `talent-marketplace.module.ts` is the ADDITIVE UNION of TM-3 + TM-14:
  - controllers: `JobListingController` (TM-2), `TalentConnectWebhookController` (TM-14), `PublicListingController` (TM-3).
  - providers: TM-2/TM-14 set (`JobListingService, PrismaService, JwtAuthGuard, JwksVerifierService, HirerVerifiedGuard, TalentConnectWebhookService`) + `PublicListingService` (TM-3).
  - imports: `TalentConnectAdapterModule` (TM-14/TM-10) preserved.
  - exports: `JobListingService` unchanged.
  - Diff vs main module = ONLY the added `PublicListingController`/`PublicListingService` + their import + a comment line. TM-14 surface byte-for-byte preserved.
- TM-14 webhook + connect-adapter files: NOT touched by the branch (grep over diff name-list = NONE).

## 12-ITEM CHECKLIST (re-verified)
[v] 1. Roles on every route — `@Public()` at class level on PublicListingController (opts out of global JwtAuthGuard via auth.guard.ts:72-76 `getAllAndOverride(IS_PUBLIC_KEY)→return true`); NO `@Roles` (roles.guard.ts:48 `return true` when none required); empty controller-guard array. All pinned in public-listing.controller.spec.ts (IS_PUBLIC_KEY===true, ROLES_KEY undefined on class+browse+detail, GUARDS_METADATA===[]).
[v] 2. PII / no raw-entity leak / no PII in logs — `toCard`/`toDetail` allow-list copy; entity NEVER spread. JobListing PII columns (hirer_id, idempotency_key, closed_at, updated_at) absent from both DTOs. No `console.*`/stdout in TM-3 src; service uses Nest `Logger` and the warn string contains no PII. JSON-LD builder reads only the allow-list DTO. Value-scan + exact key-set locks on card, detail, and JSON-LD (incl. rogue-PII Object.assign drop test).
[v] 3. Response shapes (allow-list DTOs) — card key set {id,title,specialty,location,modality,compensation_summary,published_at,cta_listing_id}; detail = card + {description,compensation_type,compensation_terms,expectations,created_at}. Exact-key-set locks for both. JSON-LD optional fields OMITTED (not null) when source absent.
[v] 4. Cursor pagination integrity — HMAC-SHA256 (`createHmac('sha256', cursorSecret())`), 96-bit (16 base64url char) truncated sig, length-guarded `timingSafeEqual` compare. Tamper/forge/unsigned/cross-secret/mutated-payload all → null → page 1. Round-trip preserves ms precision; id-with-pipes handled (first-sep iso / last-sep sig). Keyset (created_at DESC, id DESC), over-fetch limit+1, never offset (`skip` asserted undefined). 19 cursor cases pinned.
[v] 5. 404 vs 403 contract + HTTP envelope — draft/closed/missing all → 404 NotFoundException (never 401/403, never leaks existence). Wire envelope `{statusCode:404, code:'job_listing_not_found', message, error, timestamp, path}` pinned by real-Nest HTTP test with negative key-set lock (no kind/stack/hirer_id).
[v] 6. Throttle pins — `@Throttle({ default: { ttl: 60000, limit: 60 } })` at class level; pinned via THROTTLER:LIMITdefault===60 / THROTTLER:TTLdefault===60000. Global UserThrottlerGuard (APP_GUARD) honours it and IP-buckets anon. No decorator-order bug (class-level, global guard).
[v] 7. Migration date discipline — N/A: TM-3 ships ZERO migrations and ZERO prisma/schema changes. The `@@index([status, created_at, id])` it relies on already exists in main's schema (line 6545). No date-ordering concern.
[v] 8. RLS on listings (anon = published only) — TM-3 adds no RLS. Existing `p_joblisting_select` (migration 20261220000000, line 220) grants `public` (incl. anon, NULL current_user_id) SELECT only WHERE `status='published'` (owner/own-hirer additionally read draft/closed). TM-3's explicit `status:'published'` filter in browse + detail is correct defence-in-depth atop the RLS floor. Anon cannot reach unpublished rows by either path.
[v] 9. Banned-token grep — `@ts-ignore|as any|as unknown as|as never|.catch(()=>undefined)|Coming soon` over all 11 TM-3 lane files (5 src + 5 test + .controller.spec) at 06649f97: 0 matches (exit 1). Specs use narrow structural doubles assembled on real prototypes (`Object.create(PrismaService.prototype)` / `PublicListingService.prototype`) + one documented narrow `{compensation_type:string}` cast (future-enum-growth) + `Object.assign` for the rogue-PII test — none are banned blanket casts.
[v] 10. Doctrine pins — no TM-3 / public-listing reference in any FlagOff / roles-enforced / posthog-event-names / quietLuxuryDoctrine / pin file (grep = empty). Those pins are community/other-lane scoped; nothing to violate, nothing regressed.
[v] 11. PostHog events — TM-3 emits NONE (grep `posthog|capture|track(` over TM-3 src = empty). Nothing to pin against posthog-event-names.
[v] 12. Cross-lane integration — rebase resolution sane vs 96d7f464: module is additive TM-3∪TM-14 union; full diff is the intended TM-3 surface only; TM-14 webhook/adapter untouched; no CI/infra/migration drift.

## ADDITIONAL EXHAUSTIVE-LENS CHECKS
[v] Covering index — `@@index([status, created_at, id])` exactly matches `where{status} + orderBy[created_at desc, id desc] + keyset boundary`. No table scan.
[v] No N+1 — browse = 1 findMany (over-fetch limit+1); detail = 1 findFirst; `.map(toCard)` pure in-memory; no relation loads.
[v] Global ValidationPipe boundary — DTO: limit coerced+bounded 1..50 (toIntLimit drops '1.5'/'abc'/'0'), facets MaxLength-bounded, cursor MaxLength 512. Unknown params rejected by global whitelist/forbidNonWhitelisted. Pinned in controller.spec.
[v] UUID v4 match — `JobListing.id @default(uuid())` is v4 under Prisma 6.x; `ParseUUIDPipe({version:'4'})` will not reject valid ids; non-UUID → 400 before service/DB (pinned).
[v] Enum integrity — service `COMPENSATION_TYPES` (commission/rev_share/flat/hybrid) == `CoachCompensationType`; statuses (draft/published/closed) match `JobListingStatus`. Unknown comp_type facet dropped (no zero-match); switch default → neutral 'Compensation on application' (future-enum test).
[v] Error envelope hygiene — 404 body structured, no stack / internal id; published filter independent of cursor.
[v] Secret rotation safety — old-secret cursors degrade to page 1 (cross-env test); blank/whitespace secret treated as unset (`.trim()===''`).

## LIVE-RUN NOTE
node_modules absent and the worktree is a 2% sparse checkout; a live `npm test` would require a full install + tree population. Not run here. Justification: (a) all 4 required CI checks (build-and-test, rls-floor-guard, rls-live-tests, mwb-3-live-tests) are GREEN on 06649f97 per the brief; (b) Lens B ran the suite live at the pre-rebase SHA (53/53 across 4 files) and the rebase touched ONLY talent-marketplace.module.ts (additive union, no test/source logic change); (c) all source↔test contracts were verified statically and are internally consistent (filter reads `code`; tests assert `code`; mappers allow-list; key-set locks match the DTOs). No signal gap that a re-run would close.

## SHA STABILITY CONFIRMATION
HEAD at start: 06649f9798d5af714030585aac6cd60858b9f5a2
HEAD at end:   06649f9798d5af714030585aac6cd60858b9f5a2
[v] STABLE — read-only audit, no backend code written or modified.
