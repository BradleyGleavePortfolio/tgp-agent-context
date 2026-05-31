# PR-HK-1-backend R1 Audit
**SHA:** c239dba8afb5fe58facf8562ea05c272081d6ea5
**Auditor model:** GPT-5.5
**Date:** 2026-05-31
**Verdict:** NOT CLEAN

## Write-set verification
- Confirmed target checkout at `c239dba8afb5fe58facf8562ea05c272081d6ea5` against base `9c67444c`.
- Diff is exactly 17 files, all within the expected backend write-set: `src/wearables/connections/**`, `src/wearables/oauth/**`, `src/wearables/connector-registry.ts`, `src/wearables/connector-registry.spec.ts`, and the additive `src/wearables/wearables.module.ts` edit.
- Full diff read end-to-end and archived as `PR-HK-1-backend_R1_full_diff.txt` for traceability.
- Commit metadata verified for all 4 commits: author `Dynasia G <dynasia@trygrowthproject.com>`, empty bodies, no trailers/co-authors observed.

## Findings

### P0
- None.

### P1
1. **Token/secret material can be logged on OAuth exchange failure.** `ConnectionsService.handleCallback()` catches connector exchange failures and logs the raw provider exception message: ``OAuth code exchange failed for provider=${provider} user=${userId}: ${(err as Error).message}`` (`src/wearables/connections/connections.service.ts:121-126`). Connector/provider error messages are untrusted and can contain OAuth codes, access tokens, refresh tokens, or provider response bodies. The new test fixture proves the leak class by throwing `new Error('provider 500 with token=leak')` (`src/wearables/connections/connections.service.spec.ts:231-241`), and the required Jest run emitted `OAuth code exchange failed for provider=OURA user=user-1: provider 500 with token=leak` in the gate log. This violates the audit requirement that tokens are never logged and should be fixed by logging only a sanitized error class/status/provider/user context, never `err.message` from connector/token-exchange paths.

### P2
- None.

## Checklist notes
- OAuth state: Redis store uses `SET ... PX` with `OAUTH_STATE_TTL_MS = 600000` and `GETDEL`; in-memory fallback deletes before returning and checks expiry, so it is single-use and TTL-honoring.
- PKCE: verifier generation is base64url, length-bounded to 43-128 chars, S256 challenge is SHA-256 then base64url, and tests include RFC 7636 Appendix B.
- Callback state ordering: `handleCallback()` consumes state before `connector.exchangeCode()`.
- Token persistence: refresh/access token values are KMS-wrapped before DB create/update and excluded from list responses via `SAFE_CONNECTION_SELECT`.
- IDOR: list and disconnect are scoped by `user_id`; disconnect updates only the id returned by the user-scoped lookup.
- Rate limiting: `oauth/start` and `oauth/callback` have `@Throttle` decorators.
- Validation: DTOs use class-validator and the global ValidationPipe is configured with whitelist/forbid/transform; bad enum providers and oversized callback state are tested.
- Registry: implementation uses Nest `DiscoveryService` aggregation of `WEARABLE_CONNECTORS`; registry ships empty and exposes `get`, `list`, `getOauthConnectors`, and `getOnDeviceConnectors` tests.
- Tests: required isolated run reported 8 suites / 120 tests passing.

## Gate results
- `DATABASE_URL='postgresql://x:x@localhost:5432/x' DIRECT_URL='postgresql://x:x@localhost:5432/x' npx prisma validate` — PASS.
- `npx prisma generate` — PASS.
- `NODE_OPTIONS=--max-old-space-size=4096 npx tsc --noEmit -p tsconfig.json` — PASS.
- `npx eslint src/wearables/` — PASS.
- `NODE_ENV=test npx jest --roots src/wearables --runInBand` — PASS, 8 suites / 120 tests.

## Conclusion
NOT CLEAN. The implementation is otherwise close to spec, but the OAuth exchange error path logs raw connector exception messages, demonstrably leaking token-like material in the required gate run. Fix by sanitizing exchange-failure logs and adding a regression assertion that raw provider errors/tokens are not logged.
