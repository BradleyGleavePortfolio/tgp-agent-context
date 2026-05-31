# PR-HK-1-backend — Build Report

**PR:** [#349](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/349) — `feat(wearables): PR-HK-1-backend — generic OAuth + Connection management`
**Branch:** `hk/PR-HK-1-backend-oauth-connections`
**Base:** `main` @ `9c67444c2be6bb712509ef379e43f6f29a289570` (PR-HK-0 merged)
**Head SHA (remote):** `c239dba8afb5fe58facf8562ea05c272081d6ea5`
**Author (all commits):** `Dynasia G <dynasia@trygrowthproject.com>` — empty commit bodies, no trailers, no co-authors.

## Scope
Generic OAuth + Connection management backend. Backend-only; no mobile code (mobile is the follow-up PR-HK-1-mobile). Provides: PKCE util, OAuth state issue/consume service, a connector registry (ships empty — connectors register later in PR-HK-2.*), and the Connections module (controller + service + DTOs) exposing OAuth start/callback, list, and disconnect.

## Commits
1. `c535f00` — feat(wearables): PR-HK-1 — OAuth state service + PKCE util
2. `da16451` — feat(wearables): PR-HK-1 — connector registry
3. `654ec6f` — feat(wearables): PR-HK-1 — connections module (controller + service + DTOs)
4. `c239dba` — feat(wearables): PR-HK-1 — wire into wearables.module

## Write-Set (line counts)
| File | Lines | Kind |
|---|---|---|
| `src/wearables/oauth/pkce.util.ts` | 114 | new |
| `src/wearables/oauth/pkce.util.spec.ts` | 91 | new (test) |
| `src/wearables/oauth/oauth-state.service.ts` | 278 | new |
| `src/wearables/oauth/oauth-state.service.spec.ts` | 191 | new (test) |
| `src/wearables/oauth/oauth.module.ts` | 20 | new |
| `src/wearables/connector-registry.ts` | 228 | new |
| `src/wearables/connector-registry.spec.ts` | 166 | new (test) |
| `src/wearables/connections/types.ts` | 97 | new |
| `src/wearables/connections/dto/connect-provider.dto.ts` | 20 | new |
| `src/wearables/connections/dto/oauth-callback.dto.ts` | 34 | new |
| `src/wearables/connections/dto/disconnect-provider.dto.ts` | 20 | new |
| `src/wearables/connections/connections.service.ts` | 284 | new |
| `src/wearables/connections/connections.service.spec.ts` | 343 | new (test) |
| `src/wearables/connections/connections.controller.ts` | 113 | new |
| `src/wearables/connections/connections.controller.spec.ts` | 171 | new (test) |
| `src/wearables/connections/connections.module.ts` | 43 | new |
| `src/wearables/wearables.module.ts` | 52 | **edit** (additive wiring) |
| **Total** | **2265** | |

The diff against base contains exactly these 17 files and nothing else (Gate ⑤).

## KmsService Usage Location
Injected into `src/wearables/connections/connections.service.ts` (constructor param `private readonly kms: KmsService`). In `handleCallback()` the refresh token (`this.kms.encrypt(tokens.refreshToken)`) and access token (`this.kms.encrypt(tokens.accessToken)` when present) are wrapped before persistence. Plaintext tokens are never persisted or logged; the safe selection (`SAFE_CONNECTION_SELECT`) excludes all `encrypted_*` / `secret_ref` columns so they never leave the service layer.

## OAuth State Storage — Decision & Justification
**Decision: Redis** (via `ioredis`), with an in-memory fallback store when `REDIS_URL` is unset.

**Justification:**
- No `RedisService` class exists in the repo, but `ioredis` is already a project dependency, so adding Redis-backed state requires no new dependency.
- A Postgres-backed state table would require a `schema.prisma` migration, which collides with the PR-HK-0 schema mutex and expands the blast radius beyond this backend-only PR.
- Redis provides native TTL (`SET ... PX`) and atomic single-use consumption (`GETDEL`), which exactly matches OAuth state semantics (issue once, consume once, auto-expire).
- `OAUTH_STATE_TTL_MS = 10 min`. The store is abstracted behind `OauthStateService` with `InMemoryOauthStateStore` and `RedisOauthStateStore`; `ioredis` is lazily `require`d so unit tests run without Redis. The constructor accepts an optional store override for tests.

## Tests
- **Total: 120 passed / 120** across **8 suites** (`NODE_ENV=test npx jest --roots src/wearables --runInBand`).
- Baseline PR-HK-0 suites (52 tests) all still pass; PR-HK-1 adds 68 new tests across pkce util, oauth-state service, connector registry, connections service, and connections controller.
- Notable coverage: RFC 7636 Appendix B PKCE test vector; single-use state consume; IDOR-safe disconnect; KMS-encrypt-before-persist (with a real `KmsService` instance asserting plaintext is never stored); find-then-create vs. re-link UPDATE paths; throttle metadata assertions; rejection of on-device providers by connect/callback.

## Gates (all passing)
| Gate | Command | Result |
|---|---|---|
| ① prisma validate | `DATABASE_URL=… DIRECT_URL=… npx prisma validate` | valid |
| ② tsc | `npx prisma generate` → `NODE_OPTIONS=--max-old-space-size=4096 npx tsc --noEmit -p tsconfig.json` | 0 errors |
| ③ eslint | `npx eslint src/wearables/` | clean (exit 0) |
| ④ jest | `npx jest --roots src/wearables --runInBand` | 120/120 pass |
| ⑤ diff | diff vs base | write-set only (17 files) |

## Deviations & Justifications
1. **NestJS has no Angular-style `multi: true` provider flag** (the spec's "multi-injection" assumption). Verified via repro: registering the same token twice is last-wins, and the `ValueProvider`/`FactoryProvider` type unions have no `multi` field.
   **Solution:** `ConnectorRegistry` uses `DiscoveryService.getProviders()` (from `DiscoveryModule`) and filters by `token === WEARABLE_CONNECTORS` in `onModuleInit()`, aggregating connector definitions across all modules. Future connectors (PR-HK-2.*) still contribute via `{ provide: WEARABLE_CONNECTORS, useValue: <def> }` in their own modules — only without the non-existent `multi` flag. The registry remains edited only in this PR; new connectors do not touch it. A `registerForTest()` seam supports unit testing. Documented in registry code comments.
2. **`find-then-create/update` instead of Prisma `upsert`** in `connections.service.ts`. The compound unique key `WearableConnection_user_provider_account_key` includes `external_account_id`, which is **nullable**; Prisma's `upsert` `where` rejects a nullable component in the compound unique selector (tsc error). The find-then-create/update pattern handles the initial link and the re-link UPDATE path correctly with a nullable account id.
3. **`class-validator` (not zod)** for DTO validation — matches the existing repo convention (e.g. bloodwork DTOs).
4. **On-device providers** (`APPLE_HEALTHKIT`, `HEALTH_CONNECT`, `SAMSUNG_HEALTH`) are rejected by the connect/callback endpoints (they have no OAuth flow); ingestion is handled by the PR-HK-2.a ingest endpoint. Documented in the service.
5. **`callbackRedirectUri`** is derived from env `WEARABLES_OAUTH_REDIRECT_BASE_URL` rather than hardcoded, to keep the backend deployable across environments without code changes.

## Connectors
Registry **ships empty** in this PR. Connector definitions arrive in PR-HK-2.* and register via the `WEARABLE_CONNECTORS` token; `connector-registry.ts` is edited only here.
