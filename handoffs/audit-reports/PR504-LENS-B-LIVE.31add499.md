# PR #504 — Lens B Adversarial Audit (LIVE)

- **Repo:** growth-project-backend
- **PR:** #504 — `feat(contract): freeze tgp-importer OpenAPI slice + truthful error envelope`
- **Head:** `31add499ba04b98d40afc6c64aad64c8c58f4a54`
- **Base:** `main`
- **Lens:** B (adversarial, R72 dual-lens). Written in isolation from Lens A.
- **Mode:** AUDIT ONLY — no commits, no merges.

## Scope & method

The PR checks in a frozen, drift-tested OpenAPI slice of the seven externally-callable
tgp-importer routes and claims to model **every** importer error response as the
**shared, truthful runtime envelope** the server actually emits. The freeze is enforced
by a byte-identity drift test, so any inaccuracy is locked in as the enforced source of
truth.

I verified the frozen artifact (`docs/contracts/importer-openapi.json`) against the
**actual runtime behavior**: global `ValidationPipe` config, global exception filters,
global guards, per-route decorators, and the services that throw the documented codes.

### What is correct (verified true)

- **`ErrorEnvelope` DTO** matches `buildErrorEnvelope()` / `HttpExceptionFilter`
  key-for-key: `statusCode`, optional `code`, `message` (`string | string[]`), `error`,
  `timestamp`, `path`, optional `request_id`. `code`/`request_id` correctly optional.
  (`src/common/errors/error-envelope.dto.ts` vs `src/filters/not-found-envelope.ts` +
  `src/filters/http-exception.filter.ts`.)
- **`RateLimitError` DTO** matches `ThrottlerExceptionFilter` exactly: `statusCode` 429,
  `error`, `message`, `retryAfter` (3600), no `timestamp`/`path`/`code`. Distinct schema
  is the right call. (`src/filters/throttler-exception.filter.ts`.)
- **Documented error `code` enums are truthful.** refresh `401 extension_refresh_invalid`
  (`AuthService.extensionRefresh` always sets it), init `400 code_mint_failed`,
  redeem `400 invalid`, redeem `410 {expired,already_used,locked}` — all match the actual
  `throw` sites in the services. `required:true`/`required:false` composition via
  `envelopeWithCode()` is sound.
- **429 parity is genuinely reachable.** `init`/`status` carry no `@Throttle` and fall
  under the `DEFAULT` catch-all (`UserThrottlerGuard`, 300/min authed); redeem/scout have
  explicit `@Throttle`. All globally emit the throttler 429. Documenting 429 on every
  route is truthful.
- **Global wiring confirmed** (`src/main.ts`, `src/app.module.ts`): `ValidationPipe`
  (`whitelist:true`, `forbidNonWhitelisted:true`), `HttpExceptionFilter` +
  `ThrottlerExceptionFilter`, and `APP_GUARD` = JwtAuthGuard → UserThrottlerGuard →
  RolesGuard.
- **Artifact integrity:** 7 paths, 17 schemas, **no dangling `$ref`s, no unused schemas**,
  `openapi: 3.1.0`, `securitySchemes` scoped to `bearer`.
- **Exempt-title numbers are HONEST.** Verified via `git diff --numstat main...HEAD`:
  `src` net **477** (+521 −44), `scripts` net **250**, `test` net **887** → A3 = **1614**
  (matches title). Density **887 / 771 = 1.15** (771 = 521 src + 250 scripts added; matches
  title). Test count **29 + 19 = 48** (matches). No dishonest exemption accounting.

The DTOs, code enums, 429 modeling, artifact integrity, and exempt accounting are clean.
The defects below are all in **error-surface completeness** — the one thing the PR most
loudly promises.

---

## Findings

### [P1] LENS-B-01 — Frozen contract omits the reachable ValidationPipe `400` on 4 of 7 routes (silent contract lie by omission)

The global `ValidationPipe` is configured `whitelist:true` + `forbidNonWhitelisted:true`
(`src/main.ts:97-100`). Every importer route with a validated DTO therefore emits a
`400` `ErrorEnvelope` (with `message` as the constraint-violation **array**) on malformed
input. The PR **explicitly models this dual-source 400** on three routes and brags about
it in the description ("`message` as a string ARRAY of constraint violations"), but
**omits it on the four routes whose DTOs are equally validated:**

| Route | Validated DTO (→ 400 reachable) | `400` documented? |
|---|---|---|
| `POST /api/auth/extension/refresh` | `ExtensionRefreshDto` (`@IsString @MinLength(1) @MaxLength(4096)`) | **NO** ❌ |
| `POST /api/extension/pair/init` | `PairInitDto` (`@Matches` slug) | yes ✓ |
| `POST /api/extension/pair/status` | `PairStatusDto` (`@Matches(/^[0-9]{6}$/)`) | **NO** ❌ |
| `POST /api/extension/pair/redeem` | `PairRedeemDto` (`@Matches(/^[0-9]{6}$/)`) | yes ✓ |
| `POST /api/scout/ingest` | `ScoutIngestDto` | yes ✓ |
| `POST /api/scout/progress` | `ScoutProgressDto` (`@Length`, `@IsInt`, `@ValidateNested`, …) | **NO** ❌ |
| `POST /api/scout/ingest/complete` | `ScoutCompleteDto` (`@IsIn`, `@MaxLength`, …) | **NO** ❌ |

The starkest proof of inconsistency: **`pair/status` and `pair/redeem` share the identical
`code: @Matches(SIX_DIGIT)` field** (`src/extension-pair/extension-pair.dto.ts:28-50`), yet
redeem documents `400` and status does not. `pair/status` even carries `ScoutProgressDto`'s
own DTO comment analogue: "ValidationPipe … rejects any unknown field with a 400"
(`src/scout/scout.dto.ts:20-22`) — the author knew the 400 exists.

**Why this is P1, not cosmetic:** the artifact is a *freeze* whose byte-identity is
enforced by `test/contracts/importer-contract.spec.ts`. The incomplete matrix is now the
enforced source of truth; a later truthful addition would have to *break* the freeze. A
client generated from this contract (the site-agnostic importer extension — which posts
bad/edge bodies to exactly these routes) will have **no typed `400` handler** on the
majority of the importer surface. This directly falsifies the PR's headline claim
("models **every** importer error response as the shared, truthful runtime envelope") and
the freeze mandate that it "must not lie." The tests do not catch it because they only
assert *presence* of specific statuses + byte-identity; there is no error-surface
completeness assertion.

**Fix:** add `@ApiResponse({ status: 400, schema: errorEnvelopeSchema() })` (or
`envelopeWithCode` where a domain code exists) to `refresh`, `pair/status`,
`scout/progress`, and `scout/ingest/complete`, then regenerate. Or, if 400 is deliberately
out of scope, say so explicitly in README §Scope and drop the truthful/"every response"
framing — the contract cannot both claim completeness and omit the majority-route 400.

---

### [P2] LENS-B-02 — Authenticated `pair/init` and `pair/status` omit the `401` ErrorEnvelope

`ExtensionPairController.init` and `.status` are **not** `@Public` (only `redeem` is —
`src/extension-pair/extension-pair.controller.ts:172`). They sit behind the global
`JwtAuthGuard` (`APP_GUARD`, `src/app.module.ts:395`), which runs before the route-level
`CoachGuard`/`RolesGuard`. A missing / expired / invalid bearer therefore yields a standard
`401` `ErrorEnvelope` on both routes.

The frozen artifact documents:

- `pair/init` → `400, 403, 404, 429` (**no 401**)
- `pair/status` → `403, 404, 429` (**no 401**, and no 400 — see LENS-B-01)

Every *other* authenticated importer route documents 401: `scout/ingest`,
`scout/progress`, `scout/ingest/complete` (class-level `@ApiResponse` 401 on
`ScoutController`), and `refresh` (service 401). Only the two pair routes miss it.

`401` (expired bearer) is the single most common runtime error the extension will hit on
the pairing bootstrap, and 403 (reached only *after* a valid token) is documented while
the 401 that precedes it is not. This is an internal inconsistency and a truthfulness gap
on a freeze whose own description added 429 "for parity and truthfulness" — the same parity
argument applies to 401 and was missed.

**Fix:** add `@ApiResponse({ status: 401, schema: errorEnvelopeSchema() })` to `init` and
`status` (or a class-level decorator mirroring `ScoutController`), then regenerate.

---

## Non-findings / considered and dismissed

- **6-digit code entropy / redeem race / mint-before-claim:** documented and accepted in
  prior rounds; not introduced or changed by this PR. Out of scope for a contract-modeling
  audit.
- **redeem omits 401:** correct — `redeem` is `@Public`, no JWT guard.
- **`openapi: 3.1.0` on a 3.0-emitted doc:** documented as a deliberate, safe subset bump
  (`src/common/openapi.ts:47-50`). Acceptable.
- **Rate-limit docs:** `RateLimitError.retryAfter` (3600) matches the filter's
  `RETRY_AFTER_SECONDS`; 429 reachable on all routes. Truthful.
- **Exempt title honesty:** LOC/density/test-count all reproduce exactly from
  `git diff --numstat`. No dishonest exemption.

## Blast-radius summary

No P0 / security regression. No runtime behavior change (the PR is decorators + schema
DTOs + tooling + tests). The defects are **contract-truthfulness/completeness**: the
frozen, drift-enforced artifact under-declares the error surface (`400` on 4/7 routes,
`401` on the 2 authenticated pair routes) while its title and body claim to model *every*
importer error response truthfully. Because the freeze is byte-identity-enforced, the
omissions are locked in.

blocking_ids: LENS-B-01 (P1), LENS-B-02 (P2)

VERDICT: FAIL with counts P0=0 P1=1 P2=1 P3=0
