# BUILD REPORT — H4 Storefront join-token throttle (#7)

**Unit:** H4 (storefront join throttle)
**Branch:** `hygiene/storefront-join-throttle` (off backend main `19e51b0`)
**Repo:** `BradleyGleavePortfolio/growth-project-backend`
**Author:** Dynasia G <dynasia@trygrowthproject.com> (R4 strict, no trailers)
**Type:** 🔴🧹 security (token enumeration)

## Issue (#7)
`GET /v1/packages/public/join/:token` (`storefront-public.controller.ts:123-124`)
was throttled by a plain `@Throttle({ default: { ttl: 60_000, limit: 60 } })`,
while the companion `POST .../join/:token/checkout` (`:147-148`) uses the
stricter `{ ttl: 60_000, limit: 20 }`. Per the brief this lets an attacker
enumerate `:token` values cheaply.

## Root-cause finding (how the POST achieves composite (token, IP))
The composite `(token, IP)` bucketing is NOT done with a per-route key
resolver on the controller. It is done globally by
`src/throttler/user-throttler.guard.ts → UserThrottlerGuard.getTracker()`,
which, for any request whose path matches `/v1/packages/public/join/` AND
carries a `:token` param, returns the COMPOSITE tracker
`storefront-join:<token>:<ip>` instead of the bare `ip:<addr>`. Both the POST
checkout route and the GET join route match that prefix, so **both already
route through the composite tracker**. The real divergence between GET and
POST was therefore only the per-bucket *limit* (60 vs 20): with a fresh
per-(token,IP) bucket per token, a 60/min ceiling let one IP probe many
distinct tokens at 60 attempts each before the cap bit.

## Fix (write-set: ONLY `src/storefront/storefront-public.controller.ts`)
Aligned the GET to the POST **exactly**: changed
`@Throttle({ default: { ttl: 60_000, limit: 60 } })` →
`@Throttle({ default: { ttl: 60_000, limit: 20 } })`, reusing the same
composite-(token, IP) tracker strategy the POST relies on (supplied by
`UserThrottlerGuard`). Added a route-level doc comment explaining the
composite key source and the enumeration rationale. No guard/role weakened;
the route remains `@Public()` (the storefront serves anonymous traffic, as
documented in the controller header). Shared throttler config untouched — no
change to `user-throttler.guard.ts`, `throttler.config.ts`, or the module
registration, so other modules are unaffected.

### Why valid traffic is unaffected
The composite key buckets per (token, IP). A real buyer hitting their single
join link reloads far below 20/min, and their bucket is isolated from traffic
to any other token (same IP + different token ⇒ different bucket). Only the
high-rate distinct-token enumeration sweep is tightened (was 60/min/token,
now 20/min/token, matching the POST).

## Tests (extended existing spec — `test/storefront-public.controller.spec.ts`)
Added a `#7` describe block (`test/roles-enforced.spec.ts` untouched):
- GET `join/:token` default `@Throttle` metadata equals `{ ttl: 60_000, limit: 20 }`
  AND equals the POST checkout handler's metadata (drift guard).
- GET limit is strictly `< 60` (tightened from the pre-fix ceiling).
- `UserThrottlerGuard.getTracker()` on a GET join request yields the composite
  `storefront-join:<token>:<ip>` key (NOT bare `ip:<addr>`).
- Same IP + different token ⇒ different bucket (single-token isolation).
- Same IP + same token ⇒ same bucket (legitimate repeated loads share a bucket).

## Verification (real tooling, deps symlinked from sibling worktree, not committed)
- **Typecheck:** `tsc --noEmit -p tsconfig.json` → PASS (exit 0).
- **Lint:** `eslint` on touched source + spec → PASS (exit 0).
- **Tests:**
  - `test/storefront-public.controller.spec.ts` → 25 passed / 25 (incl. 5 new).
  - `test/rate-limit.spec.ts` → 38 passed / 38 (UserThrottlerGuard + config intact).

## Auditor gate mapping
- GET key is genuinely composite (token, IP): yes — via `UserThrottlerGuard`
  tracker, asserted by new tracker tests.
- Limit meaningfully reduces enumeration vs old IP-only 60/min: yes — 60→20
  per (token,IP), and IP-only was never actually the bucket (it was already
  composite), so the per-token ceiling drop is the meaningful tightening.
- Matches the POST's mechanism (no divergent reimplementation): yes — same
  tracker, same `{ ttl: 60_000, limit: 20 }`, asserted GET==POST in tests.
- Legitimate single-token use not broken: yes — per-(token,IP) isolation test.
- No shared throttler config touched: confirmed (write-set = controller only).
- No out-of-write-set file changed: confirmed (only controller + its spec).

## Commits
- `46faaef` — hygiene(H4): composite (token,IP) throttle on GET join/:token
