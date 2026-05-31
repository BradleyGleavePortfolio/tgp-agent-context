# AUDIT — Fix: composite (token,IP) throttle on GET /join/:token to close enumeration vector (#7) (PR #338)
VERDICT: NOT-CLEAN
Typecheck: fail — ran `cd /home/user/workspace/wt-h4-store && npx --no-install tsc --noEmit --pretty false`; process was killed by signal before completion.
Lint: pass — ran `cd /home/user/workspace/wt-h4-store && ./node_modules/.bin/eslint src/storefront/storefront-public.controller.ts`.
Tests: partial/fail — `test/rate-limit.spec.ts` passed 38/38; the H4-only `#7 composite` subset in `test/storefront-public.controller.spec.ts` passed 5/5; full `test/storefront-public.controller.spec.ts` was killed by signal, and the combined storefront-public + rate-limit run timed out.

## P0 findings
- None.

## P1 findings
- [src/throttler/user-throttler.guard.ts:115-144, src/storefront/storefront-public.controller.ts:123-139, test/storefront-public.controller.spec.ts:610-615] The change does not bound distinct-token GET enumeration from one IP. I independently verified the builder's narrow tracker claim is true: unauthenticated storefront join requests with a `:token` param return `storefront-join:<token>:<ip>`, and the GET decorator now matches POST at `{ ttl: 60_000, limit: 20 }`. But that composite key gives every guessed token a separate bucket; the new tests explicitly assert same IP + different token => different bucket. Therefore an attacker sending one GET per candidate token still never reaches the 20/min per-(token,IP) ceiling, so the brief's required behavior (“many distinct-token GETs from one IP hit the rate limit” / total distinct-token attempts per IP bounded) is not achieved. Fix by adding a storefront-local IP-wide limiter or dual-bucket guard for GET `join/:token` so distinct-token probes from one IP consume a shared budget, while retaining the existing per-(token,IP) bucket for legitimate same-link reload fairness.

## P2 findings
- [test/storefront-public.controller.spec.ts:1-620] Write-set violation: the H4 procedure required the write-set to be ONLY `src/storefront/storefront-public.controller.ts`, but commit `46faaef` also modifies `test/storefront-public.controller.spec.ts`. `test/roles-enforced.spec.ts` was not touched, and I found no guard/role weakening, but the extra modified test file violates the explicit audit gate. Fix by either reverting the out-of-write-set test changes or obtaining an updated write-set allowance.

## P3 (non-blocking)
- None.

## Verification of PR claims
- Pinned HEAD verified: `/home/user/workspace/wt-h4-store` is at `46faaef2976051874f65e17b810b4704c6158d1d`.
- Write-set claim FALSE: `git diff --name-only HEAD^ HEAD` lists both `src/storefront/storefront-public.controller.ts` and `test/storefront-public.controller.spec.ts`.
- `test/roles-enforced.spec.ts` untouched: no diff for that file in the H4 commit.
- No guard/role weakening found in the commit diff; the route remains `@Public()` and the only production behavior change is GET `@Throttle` limit `60` -> `20`.
- Composite tracker claim verified true: `UserThrottlerGuard.getTracker()` composes `storefront-join:<token>:<ip>` for paths matching `/v1/packages/public/join/` with `req.params.token`.
- GET/POST throttle parity verified true: GET `join/:token` and POST `join/:token/checkout` both carry `@Throttle({ default: { ttl: 60_000, limit: 20 } })`.
- Security-fix sufficiency verified false: per-(token,IP) parity alone still gives a fresh bucket to each distinct token, so it does not bound distinct-token probes from one IP.

VERDICT: NOT-CLEAN
