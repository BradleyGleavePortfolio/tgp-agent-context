# PR-HK-2.l R3 Audit — WHOOP connector

- **Repo:** `growth-project-backend`
- **PR:** #350
- **Audited head SHA:** `bf175469358dc7c6864c59dfcab08ec83eb780d6`
- **Previous R1 head:** `35f66dd0f87270d5e187cd6732e20a4705b3a0e5`
- **Base:** `main` `9c67444c`
- **R1 audit reviewed:** `audits/HK_wave/PR-HK-2l_AUDIT_R1.md`
- **R2 build report append reviewed:** docs commit `120ac33`, `build-reports/HK_PR-HK-2l-whoop_BUILD.md`
- **Auditor:** R3 re-auditor
- **Verdict:** **APPROVE**

> Note: `git fetch origin hk/PR-HK-2l-whoop-connector` could not authenticate from this environment, but the target commit was present locally. I audited the exact requested SHA in an isolated detached worktree and reran the gates there.

## Scope / write-set verification

`git diff 9c67444c..bf175469358dc7c6864c59dfcab08ec83eb780d6 --stat` shows exactly 9 changed files, all under `src/wearables/connectors/whoop/`:

```text
src/wearables/connectors/whoop/index.ts
src/wearables/connectors/whoop/whoop-webhook.controller.spec.ts
src/wearables/connectors/whoop/whoop-webhook.controller.ts
src/wearables/connectors/whoop/whoop.connector.spec.ts
src/wearables/connectors/whoop/whoop.connector.ts
src/wearables/connectors/whoop/whoop.module.ts
src/wearables/connectors/whoop/whoop.normalizer.spec.ts
src/wearables/connectors/whoop/whoop.normalizer.ts
src/wearables/connectors/whoop/whoop.types.ts
```

No shared registry/module files are touched by this PR revision.

## R1 finding verification

### R1 #1 — BLOCKER: token decryption / real `WearableConnection` shape

**Status: FIXED.**

Evidence:

- `WhoopConnector` now imports `KmsService` and injects it as the second constructor dependency after `ProviderHttpClient` (`whoop.connector.ts:4`, `106-109`).
- `refresh(conn)` reads `conn.encrypted_refresh_token`, decrypts it with `kms.decrypt`, calls the WHOOP refresh endpoint with the plaintext refresh token, then returns `encryptTokenSet(rotated)` so rotated refresh/access tokens are KMS-wrapped before handoff (`whoop.connector.ts:175-187`, `196-204`).
- `backfill(conn, since)` calls `resolveAccessToken(conn)` before any data requests (`whoop.connector.ts:274-276`). `resolveAccessToken()` decrypts a fresh `encrypted_access_token` cache hit, or decrypts `encrypted_refresh_token` and refreshes to obtain a plaintext access token on the refresh path (`whoop.connector.ts:313-335`).
- Search found no references to synthetic plaintext `conn.refreshToken` or `conn.accessToken` in the WHOOP write-set. The remaining `refreshToken` / `accessToken` references are `TokenSet` fields, method parameters, or local variables.
- Tests include a `KmsService` double (`whoop.connector.spec.ts:17-43`) and assert: `refresh(conn)` decrypts the stored refresh token, WHOOP is called with plaintext, and the rotated refresh/access tokens are encrypted before return (`whoop.connector.spec.ts:153-183`); backfill decrypts a fresh access-token cache hit (`210-274`), decrypts refresh token on fallback (`283-320`), and refreshes when the cached access token is expired (`322-362`).

### R1 #2 — HIGH: webhook Zod validation

**Status: FIXED.**

Evidence:

- `whoop.types.ts` now defines `WhoopWebhookEventSchema` with `.strict()`, `id: z.string().uuid()`, `type: z.enum(WHOOP_WEBHOOK_TYPES)`, `user_id: z.number().int().positive()`, and optional `trace_id` (`whoop.types.ts:244-283`).
- `whoop-webhook.controller.ts` verifies HMAC first via `connector.verifyWebhook(...)` and returns 401 on failure before parsing (`whoop-webhook.controller.ts:83-91`). Only after successful verification does it `JSON.parse` and run `WhoopWebhookEventSchema.parse(json)` (`99-103`).
- Malformed verified payloads are caught and mapped to `BadRequestException` / HTTP 400, not 200 or 500 (`whoop-webhook.controller.ts:103-112`).
- Tests assert 400 and no dedup write for non-JSON payload, non-UUID id, unknown event type, and non-positive `user_id` (`whoop-webhook.controller.spec.ts:169-208`, `265-277`).

### R1 #3 — MEDIUM: raw WHOOP `user_id` in logs

**Status: FIXED.**

Evidence:

- Structured log calls no longer include `whoop_user_id` or numeric raw `payload.user_id` (`whoop-webhook.controller.ts:129-134`, `152-158`, `187-194`).
- Accepted and revocation log payloads include `user_hash: hashWhoopUserId(payload.user_id)` instead of the raw external account id (`whoop-webhook.controller.ts:152-158`, `187-194`).
- `hashWhoopUserId()` computes SHA-256 over `whoop:<user_id>:<salt>` and returns the first 16 hex characters; salt comes from `WHOOP_WEBHOOK_SALT`, then `WHOOP_WEBHOOK_SECRET`, then `WHOOP_CLIENT_SECRET` (`whoop-webhook.controller.ts:210-229`).
- Tests capture controller logger calls for accepted and revocation events and assert the raw numeric ids and `whoop_user_id` key are absent while `user_hash` is present (`whoop-webhook.controller.spec.ts:210-263`).

## Regression checks

| Check | Result | Notes |
| --- | --- | --- |
| Full wearables tests | PASS | `npx jest --roots '<rootDir>/src/wearables' --runInBand`: 6 suites, 95 tests passed. |
| WHOOP subset tests | PASS | `npx jest --roots '<rootDir>/src/wearables/connectors/whoop' --runInBand`: 3 suites, 43 tests passed. |
| Test growth | PASS | WHOOP subset is 43 tests, up from 34 at R1/R2 pre-fix (+9 tests). |
| Commit authors | PASS | All 7 commits in `9c67444c..bf175469` authored by Dynasia G `<dynasia@trygrowthproject.com>`. |
| Trailers | PASS | Commit bodies are empty; no trailers/co-authors found. |
| Write-set | PASS | Only `src/wearables/connectors/whoop/` files changed. |

## Gate results

All 5 gates passed in the detached audit worktree pinned to `bf175469358dc7c6864c59dfcab08ec83eb780d6`.

| Gate | Result |
| --- | --- |
| `DATABASE_URL=... DIRECT_URL=... npx prisma validate` | PASS — schema valid. |
| `npx tsc --noEmit -p tsconfig.json` | PASS — no output. |
| `npx eslint "src/wearables/connectors/whoop/**/*.ts"` | PASS — no output. |
| `npx jest --roots '<rootDir>/src/wearables' --runInBand` | PASS — 6 suites, 95 tests. |
| `npm run build` | PASS — `nest build` exit 0. |

Gate logs saved:

```text
audits/HK_wave/logs/PR-HK-2l_R3_prisma_validate.log
audits/HK_wave/logs/PR-HK-2l_R3_tsc.log
audits/HK_wave/logs/PR-HK-2l_R3_eslint_whoop.log
audits/HK_wave/logs/PR-HK-2l_R3_jest_whoop.log
audits/HK_wave/logs/PR-HK-2l_R3_jest_wearables.log
audits/HK_wave/logs/PR-HK-2l_R3_build.log
```

## New findings

None.

## Final verdict

**APPROVE.** All three R1 findings are fixed, no new findings were identified, write-set and commit hygiene are clean, the WHOOP subset is 43/43 passing, and the full wearables regression is 95/95 passing.
