# PR-HK-2.l R1 Audit — WHOOP connector

- **Repo:** `growth-project-backend`
- **PR:** #350
- **Audited head SHA:** `35f66dd0f87270d5e187cd6732e20a4705b3a0e5`
- **Base:** `main` `9c67444c`
- **Build report reviewed:** `HK_PR-HK-2l-whoop_BUILD.md` at docs commit `edba9ff3`
- **Auditor:** R1
- **Verdict:** **REQUEST CHANGES**

> Note: the requested `git fetch origin hk/PR-HK-2l-whoop-connector` could not authenticate in this environment, but the local repository already contained `hk/PR-HK-2l-whoop-connector` and the exact target commit. I audited an isolated detached worktree pinned to `35f66dd0f87270d5e187cd6732e20a4705b3a0e5`.

## Scope / write-set verification

`git diff 9c67444c..35f66dd0f87270d5e187cd6732e20a4705b3a0e5 --stat` shows exactly 9 changed files, all under `src/wearables/connectors/whoop/`:

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

No module/registry edits were present outside the WHOOP folder.

## Top findings

### 1. **BLOCKER — `refresh()` / `backfill()` do not work with the real `WearableConnection` shape**

The connector implements the `WearableConnector` method signatures, but it reads token properties that are not present on the real Prisma `WearableConnection` model:

- `refresh()` reads `(conn as { refreshToken?: string }).refreshToken` and throws when absent (`whoop.connector.ts:159-166`).
- `backfill()` reads `(conn as { accessToken?: string }).accessToken` and throws when absent (`whoop.connector.ts:233-239`).
- The Prisma model stores `encrypted_refresh_token`, `encrypted_access_token`, and `access_token_expires_at`; it has no `refreshToken` or `accessToken` fields (`schema.prisma:5036-5059`).

Impact: a real `WearableConnection` loaded from Prisma cannot refresh or backfill through this connector as written; both paths fail before any WHOOP HTTP call. The unit tests mask this by casting test objects with synthetic `refreshToken` / `accessToken` fields (`whoop.connector.spec.ts:103`, `whoop.connector.spec.ts:124-130`). This fails the “real interface” intent for the connector’s core OAuth/backfill paths.

Recommended fix: align the connector with the agreed token handoff contract. Either accept a documented decrypted-token wrapper type used by the connection layer, or have the caller pass decrypted tokens explicitly; tests should include an integration-shape fixture that matches the actual handoff.

### 2. **HIGH — Webhook payload validation requirement is not met**

The checklist requires Zod or class-validator validation on webhook payloads. The controller only `JSON.parse`s the raw body, casts it to `WhoopWebhookPayload`, and checks truthiness of `payload.id` and `payload.type` (`whoop-webhook.controller.ts:91-100`). There is no Zod schema, class-validator DTO, enum validation for `type`, numeric validation for `user_id`, or UUID validation for `id`.

Impact: a correctly signed but malformed payload with arbitrary `type`, non-UUID `id`, or missing/invalid `user_id` can proceed into dedup/logging/revocation logic. The code returns `200` for verified malformed JSON or missing id/type, which avoids retries but does not satisfy the required runtime validation gate.

Recommended fix: add a strict runtime schema (e.g., Zod) for `id` UUID, `type` enum, and `user_id` number before dedup/revocation. Add negative tests for invalid UUID/type/user_id.

### 3. **MEDIUM — WHOOP user id is logged in raw structured logs**

The checklist requires no raw tokens or PII logged. Tokens are not logged, but the webhook controller logs `whoop_user_id: payload.user_id` for accepted data events and revocations (`whoop-webhook.controller.ts:136-141`, `whoop-webhook.controller.ts:168-171`). The schema comments identify external provider account ids such as Oura/Whoop user ids as external account identifiers, deliberately distinct from raw tokens but still user-identifying (`schema.prisma:5040-5043`).

Impact: production logs can contain provider-native user identifiers for health/wearable events. That is avoidable and conflicts with the no-PII logging requirement.

Recommended fix: remove `whoop_user_id` from logs or replace it with a non-reversible event-scoped correlation id. Keep `provider_event_id` only if that is approved as non-PII; otherwise hash/redact it too.

## Checklist results

| Area | Result | Notes |
| --- | --- | --- |
| Write-set | PASS | Exactly 9 files, all under `src/wearables/connectors/whoop/`; no registry/module shared edits. |
| Commit hygiene | PASS | 4 commits by Dynasia G, empty bodies, no trailers. |
| Interface surface | PARTIAL / FAIL | `provider === WHOOP`, `authModel === oauth2`, and required methods are present, but token reads do not match real `WearableConnection` shape. |
| Auth URL/scopes | PASS | Auth URL uses `https://api.prod.whoop.com/oauth/oauth2/auth`; scopes include `read:recovery read:cycles read:workout read:sleep read:profile read:body_measurement offline`. |
| Token URL / refresh rotation | PARTIAL | Token endpoint is correct and `refreshAccessToken()` returns the new refresh token, but `refresh(conn)` cannot obtain a real refresh token from `WearableConnection` as written. |
| Backfill endpoints/pagination | PARTIAL | Uses v2 recovery/cycle/sleep/workout endpoints and follows `next_token`; blocked operationally by the access-token handoff issue. |
| Webhook HMAC | PASS | Uses HMAC SHA256 over timestamp + raw body, base64 digest, length check + `timingSafeEqual`, fail-closed 401 on bad signature. |
| Webhook dedup/replay | PASS | Uses `WearableProcessedEvent.createMany(... skipDuplicates: true)` with provider `WHOOP`; replay returns 200 no-op. |
| Revocation | PASS | `user.deauthorized` sets matching connections to `status='disconnected'` and `disconnected_at`. |
| Normalizer | PASS | Required recovery, HRV, RHR, strain, sleep-stage ms→min, efficiency, duration, and distance mappings are implemented with UTC timestamps. |
| HTTP discipline | PASS | WHOOP OAuth/backfill requests route through `ProviderHttpClient`; pagination is batched per endpoint, not per record. |
| Runtime validation | FAIL | No Zod/class-validator validation on webhook payload. |
| Logging | PARTIAL / FAIL | No raw tokens found in logs; raw WHOOP `user_id` is logged. |
| Tests | PASS with coverage caveats | 34 WHOOP tests exist and pass; tests cover real-value mappings, bad signature, replay, revocation, refresh rotation, and pagination, but do not catch real connection token shape or strict webhook validation. |

## Gate results

Commands were run in the detached audit worktree pinned to `35f66dd0f87270d5e187cd6732e20a4705b3a0e5`.

| Gate | Result |
| --- | --- |
| `npx prisma validate` | Initial run failed because `DIRECT_URL` was unset in the environment; rerun with dummy `DATABASE_URL`/`DIRECT_URL` passed. |
| `npx prisma generate` | PASS. |
| `npx tsc --noEmit` | PASS, no output. |
| `npm run lint` | PASS with 0 errors and 15 pre-existing warnings outside the WHOOP write-set. |
| `npx jest --roots '<rootDir>/src/wearables' --runInBand` | PASS: 6 suites, 86 tests. WHOOP subset: 34 tests across 3 suites. Note: this did not reach the checklist’s “~129 total” expectation in this checked-out tree. |
| `npm run build` | PASS. |

Gate logs saved alongside this audit:

```text
PR-HK-2l_R1_gate_prisma_validate.log
PR-HK-2l_R1_gate_prisma_validate_env.log
PR-HK-2l_R1_gate_prisma_generate.log
PR-HK-2l_R1_gate_tsc.log
PR-HK-2l_R1_gate_eslint.log
PR-HK-2l_R1_gate_jest_wearables.log
PR-HK-2l_R1_gate_nest_build.log
```

## Final verdict

**REQUEST CHANGES.** The implementation is close on OAuth URL/scope construction, v2 endpoint coverage, normalizer mappings, HMAC verification, dedup, revocation, and tests, but it should not be accepted until the real connection-token handoff works, webhook payload validation is added, and raw WHOOP user id logging is removed/redacted.
