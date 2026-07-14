# PR #504 — Lens A (Adversarial) Live Audit

- **PR:** #504 `feat(contract): freeze tgp-importer OpenAPI slice + truthful error envelope`
- **Head audited:** `31add499ba04b98d40afc6c64aad64c8c58f4a54`
- **Base:** `main` `7b6a2438`
- **Lens:** A (adversarial dual-lens, R72) — AUDIT ONLY, no commits
- **Date:** 2026-07-14

## Verdict summary

**FAIL** — P0=0 **P1=2** P2=0 **P3=1**

The determinism/drift machinery is genuinely solid (48/48 tests pass, byte-identity
verified live). The failure is **contract truthfulness**: the PR's central, explicit,
repeated claim — *"every reachable importer 4xx/5xx references the shared schemas"*
and the error DTO's *"emitted by the global HttpExceptionFilter for every 4xx/5xx
except throttling"* — is **demonstrably false for 5 of the 7 frozen routes**. Because
this is a *frozen* public contract, the omissions are locked in.

---

## What was verified GOOD (no soft-pass; these genuinely hold)

- **DTO ↔ filter fidelity.** `ErrorEnvelope` (`src/common/errors/error-envelope.dto.ts:25`)
  matches `buildErrorEnvelope()` (`src/filters/not-found-envelope.ts:22`) key-for-key:
  `statusCode, message(string|string[]), error, timestamp, path` required; `code`,
  `request_id` optional. `RateLimitError` matches `ThrottlerExceptionFilter` body
  (`src/filters/throttler-exception.filter.ts:86-94`) exactly: `statusCode, error,
  message, retryAfter`, no timestamp/path. **Truthful.**
- **Dark-route 404 fidelity.** `featureFlagNotFoundMiddleware`
  (`src/common/feature-flag/feature-flag-not-found.middleware.ts:56`) emits
  `buildNotFoundEnvelope` → same `ErrorEnvelope` shape the 404 responses reference. **Truthful.**
- **Code enums match runtime throws.** `code_mint_failed` / `invalid` / `expired` /
  `already_used` / `locked` (`extension-pair.service.ts:102,132,138,141,145`) and
  `extension_refresh_invalid` (`auth.service.ts:291`) all match the pinned enums and
  their HTTP statuses (400 vs 410 split correct).
- **`allOf` composition** for status-specific `code` is correct; `required` vs
  optional (`envelopeWithCode`, `importer-error-responses.ts:30`) is applied correctly
  (401/410 required; init 400 / redeem 400 optional — matching the dual domain +
  ValidationPipe source).
- **429 reachability is real.** `UserThrottlerGuard` is a global `APP_GUARD`
  (`app.module.ts:407`) with a biting global `default` bucket, so init/status/scout
  genuinely emit 429. Claim is truthful.
- **Artifact structure:** 7 paths, 17 schemas, **no dangling `$ref`**, **no unused
  schema**, single `bearer` security scheme. Matches PR accounting exactly.
- **Determinism:** `npx jest test/contracts/*` → **48/48 pass**, incl. live byte-identity
  regeneration and cross-process determinism. Env-stubbing is CLI-only
  (`export-importer-contract.ts:34-47`); import side-effect-free. **Sound.**
- **LOC accounting:** `git diff --numstat` over the R100 gate scope = **net 1614**
  (477 src + 250 scripts + 887 test); density `887 / (521+250=771) = 1.15`. Matches
  the `[LOC-EXEMPT]/[TEST-EXEMPT]` title tags **exactly**. No discrepancy.
- **`any`-ban:** the two new specs and both new scripts are `any`-free (pre-existing
  `any` in unrelated `scripts/smoke.ts` etc. is out of scope).

---

## FINDINGS

### [P1-A] ValidationPipe `400` omitted on refresh / status / progress / complete — contract not truthful

The global pipe is `new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true,
transform: true })` (`src/main.ts:98-101`). Every route with a validated request DTO
can therefore emit a `400` (bad/missing field **or** any extra property). **Four** frozen
routes have validated DTOs but document **no 400**:

| Route | Request DTO w/ validators | 400 documented? |
|---|---|---|
| `POST /api/auth/extension/refresh` | `ExtensionRefreshDto.refresh_token` `@IsString @MinLength(1) @MaxLength(4096)` (`auth.dto.ts:264`) | **NO** (only 200/401/429) |
| `POST /api/extension/pair/status` | `PairStatusDto.code` `@IsString @Matches(/^[0-9]{6}$/)` (`extension-pair.dto.ts:42-50`) | **NO** (only 200/403/404/429) |
| `POST /api/scout/progress` | `ScoutProgressDto` (`@IsString/@MaxLength/@ValidateNested/@ArrayMaxSize`) | **NO** (only 204/401/403/404/429) |
| `POST /api/scout/ingest/complete` | `ScoutCompleteDto` (`@IsIn/@MaxLength/@IsObject`) | **NO** (only 200/401/403/404/429) |

This is **internally inconsistent**: `init`, `redeem`, and `scout/ingest` *do* document
the exact same ValidationPipe-400 (with an explicit "code-less ValidationPipe array"
rationale). The starkest case: **`pair/status` and `pair/redeem` carry the *identical*
`@Matches(SIX_DIGIT)` field** (`extension-pair.dto.ts:34` vs `:48`) — redeem documents the
400, status does not. `progress`'s own test even asserts it "advertises the **reachable**
403 (role) and 429 (throttle)" (`importer-contract.spec.ts:504`) while silently excluding
the equally-reachable 400.

**Impact:** falsifies the PR's headline invariant ("every reachable importer 4xx…") on
a **frozen** artifact. A generated client for these three routes has no 400 model; a
client doing strict response-schema validation will reject a legitimate 400 (empty
`refresh_token`, or any stray field under `forbidNonWhitelisted`). Blocking.

**Fix:** add a `400 → errorEnvelopeSchema()` response to refresh, status, progress, and
complete (matching how ingest already does it), regenerate, and extend the per-route test
matrix.

---

### [P1-B] JwtAuthGuard `401` omitted on pair `init` / `status` — authenticated routes missing their auth-failure status

`init` and `status` are **not** `@Public()` — only `redeem` is
(`extension-pair.controller.ts:87-89,123-125` vs `:172`). The global `JwtAuthGuard`
(`APP_GUARD`, registered first — `app.module.ts:395`) runs before `RolesGuard` and
rejects a missing/invalid bearer with `401` *before* any 403 role check. So with the
feature flag on (the enabled state the contract is meant to describe), `init`/`status`
genuinely emit `401`.

Yet the artifact documents **403/404/429 (+201/200) but no 401** for both routes —
while every scout route correctly documents the same JwtAuthGuard 401. Same guard,
inconsistent modeling.

**Impact:** the frozen contract tells an extension client that `init`/`status` cannot
return 401, so a client won't implement the re-auth path for those calls even though
the server will 401 them on an expired token. Blocking, same truthfulness class as P1-A.

**Fix:** add `401 → errorEnvelopeSchema()` to `init` and `status`; regenerate; assert
in the matrix.

---

### [P3-A] Reachable `5xx` not modeled despite explicit "4xx/5xx" claim

`ExtensionPairService.mintExtensionSessionForCoach` throws
`InternalServerErrorException('pair_redeem_session_mint_failed')`
(`extension-pair.service.ts:342`) on a Supabase mint failure — a reachable `500` on
`POST /api/extension/pair/redeem`. `extensionRefresh` similarly surfaces a generic 500
on an unexpected Supabase throw. The PR body and `error-envelope.dto.ts:11` both claim
coverage of "every reachable … **5xx**", but no route documents a 500.

Documenting catch-all 500s is conventionally optional, so this is **P3** — but the PR's
own wording asserts 5xx coverage, so the claim is overstated. Either model the 500
(`errorEnvelopeSchema()`) or narrow the prose to "4xx (+ throttling)".

---

## Notes / non-findings (checked, cleared)

- OpenAPI `3.1.0` override with 3.0-shaped output: `oneOf`/`format`/`additionalProperties`/
  singular `example` are all valid 3.1 — no drift.
- `redeem` correctly omits 401 (it is `@Public`) and `refresh` correctly omits 403.
- 400/410 code-enum split, `required` vs optional, and `allOf` narrowing all correct.
- Determinism, env-isolation, transitive-$ref, and cyclic-graph handling are sound.

---

## Root cause

The drift/determinism tests only assert **presence** of the statuses the decorators
declare; nothing asserts **completeness against runtime reachability**. So the suite is
green while the frozen contract under-describes 5/7 routes. The bytes are deterministic
and match the code — but the code's `@ApiResponse` set is incomplete.

VERDICT: FAIL with counts P0=0 P1=2 P2=0 P3=1
