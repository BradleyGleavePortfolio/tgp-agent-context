# TM-3 RE-AUDIT — LENS A (exhaustive) — gpt_5_5
SHA: 1f9778da | branch: feat/tm-3-public-browse | timestamp: 2026-06-18T07:52:00Z
PARENT AUDIT (at 1846b04a): 0 P0 / 0 P1 / 2 P2 / 3 P3

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
(none) — both parent Lens-A P2s are resolved:
- A-P2-1 (controller security contract unpinned) → fixed in 1f9778da: `public-listing.controller.spec.ts` pins `@Public` class metadata, absence of `@Roles`, empty controller-guard array, `@Throttle` default bucket = 60/60_000ms, `ParseUUIDPipe(v4)` 400 boundary, ValidationPipe limit/facet bounds, and 404-not-401/403 propagation.
- A-P2-2 (JSON-LD PII drop only true-by-construction) → fixed in 8da280b3: `job-posting-jsonld.spec.ts` "DROPS rogue PII keys" attaches real PII via `Object.assign` and asserts neither keys nor values survive.

### P3
(none material) — the three parent Lens-A P3s are addressed:
- A-P3-1 (sort-key rationale undocumented) → `created_at` (not `published_at`) choice documented in both `public-listing.cursor.ts` and `public-listing.service.ts` headers, with the nullable-published_at ambiguity reasoning; sort key + cursor secret now in `.env.example`.
- A-P3-2 (default-arm / unknown-facet fallback untested) → `asCompensationType` drops unknown comp_type (tested: "drops an unknown compensation_type facet"); switch `default` arm covered by "future enum growth" test.
- A-P3-3 (cta_listing_id propagation undocumented/untested) → documented as a binding contract field in `public-listing.dto.ts`; asserted present in card + detail exact-key-set locks.

OBSERVATIONS (sub-P3, non-blocking, no action required):
1. Cursor dev-secret fallback (`'tm3-public-cursor-dev'` when `PUBLIC_LISTING_CURSOR_SECRET` unset) is intentional and sound — the threat model (cursor is a pagination hint, not an authz token; a forged tuple can only reposition the window over the SAME `status='published'` set because the published filter is applied independently of the cursor) makes this a non-security integrity check. Contrast with `MWB_AUTOSAVE_LOCK_TOKEN_SECRET`, which has NO default by design because it mints authz tokens. The asymmetry is correct, not a regression.
2. `detail()` uses `findFirst` without `select`, so the full JobListing row (incl. hirer_id) is loaded into memory before the allow-list mapper runs. Not a leak (toDetail copies only allow-listed fields; specs lock the exact emitted key set), but a `select` clause would be marginally tighter defence-in-depth. Cosmetic; below P3 bar.

## VERIFICATION CHECKLIST (from previous Lens A + B findings)
[v] HMAC cursor signing & tamper rejection — `createHmac('sha256', cursorSecret())`, `timingSafeEqual` length-guarded compare, 96-bit truncated sig. Tamper/forge/cross-secret/unsigned-tuple all → null → page 1 (`public-listing.cursor.spec.ts` "HMAC tamper rejection" block, 5 cases incl. cross-env secret mismatch).
[v] Public controller @Public + throttle + UUID validation + 404-not-403 — all pinned in `public-listing.controller.spec.ts`; `@Public` opts out of global JwtAuthGuard (`auth.guard.ts` L72-76 `getAllAndOverride(IS_PUBLIC_KEY)`); RolesGuard returns true when no `@Roles` (`roles.guard.ts` L48); UserThrottlerGuard (APP_GUARD) honours `@Throttle` and IP-buckets anon traffic.
[v] PII drop in listing+detail+cursor decode — allow-list mappers `toCard`/`toDetail` never spread entity; cursor decodes only (created_at, id). Exact key-set locks (negative AND positive) on card + detail; JSON-LD rogue-PII drop test.
[v] Default arm fallback — unknown comp_type dropped to undefined (no zero-match), switch default → 'Compensation on application' (future-enum-growth test).
[v] cta_listing_id propagation — set in `toCard` (= row.id), inherited by detail, documented binding contract, asserted in both key-set locks.
[v] Banned-token grep empty in TM-3 src/test files — `grep -rn "@ts-ignore|as any|as unknown as|as never|.catch(()=>undefined)|Coming soon"` over all 9 lane files: 0 matches (exit 1). Specs use `@ts-expect-error`-free narrow structural doubles and one documented narrow `{compensation_type:string}` cast (not a banned blanket cast).
[v] Doctrine pins match — no TM-3 public-browse route appears in any FlagOff / roles-enforced / posthog-event-names / quietLuxury pin file; those pins are community-scoped. Nothing to violate; nothing regressed.
[v] JSON-LD PII assertions correct — field-name assertions (`applicantEmail`, `hirerName`, `hirer_id`, `owner_id`, `idempotency`, …) hold against the actual `JobPostingJsonLd` shape, which emits only `@context/@type/title/description/identifier` + optional `datePosted/occupationalCategory/jobLocationType/applicantLocationRequirements`. Optional fields OMITTED (not null) when source absent — asserted.

ADDITIONAL EXHAUSTIVE-LENS CHECKS:
[v] Covering index — `@@index([status, created_at, id])` exactly matches `where{status} + orderBy[created_at desc, id desc] + keyset boundary`. No table scan.
[v] No N+1 — browse = 1 findMany (over-fetch limit+1); detail = 1 findFirst; `.map(toCard)` pure in-memory.
[v] Global ValidationPipe — `whitelist:true, forbidNonWhitelisted:true, transform:true` (main.ts L117-120): unknown query params rejected (400), DTO coercion runs.
[v] UUID version match — `JobListing.id @default(uuid())` is v4 under Prisma 6.19.3 (bare `uuid()` = v4; v7 requires explicit `uuid(7)`), so `ParseUUIDPipe({version:'4'})` will not reject valid listing ids.
[v] Enum integrity — service `COMPENSATION_TYPES` == `CoachCompensationType`; statuses (`draft/published/closed`) match `JobListingStatus`.
[v] Error envelope — 404 throws `NotFoundException({kind:'job_listing_not_found'})` — structured, no stack/internal id; draft/closed/missing all 404 (never 403, never leak existence).

## SHA STABILITY CONFIRMATION
HEAD at start: 1f9778daa4b03a87629753291d40b744c1525589
HEAD at end:   1f9778daa4b03a87629753291d40b744c1525589
[v] STABLE
