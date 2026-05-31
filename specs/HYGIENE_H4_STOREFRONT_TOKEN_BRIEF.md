# FIX BRIEF — H4 Storefront join-token throttle (#7)

Repo: `growth-project-backend`. Type: 🔴🧹 security (token enumeration). Base: origin/main `19e51b0`.
Branch: `hygiene/storefront-join-throttle`. PR title: `Fix: composite (token,IP) throttle on GET /join/:token to close enumeration vector (#7)`.

## WRITE-SET (disjoint)
- `src/storefront/storefront-public.controller.ts` (primary)
- A small custom throttler key resolver ONLY if needed — if you must add one, put it in a storefront-local file (e.g. `src/storefront/join-token-throttle.guard.ts`) and do NOT touch shared throttler config used by other modules. Prefer the framework's `@Throttle` + a per-route key if the repo already supports composite keys.
- A focused test `test/storefront-join-throttle.spec.ts` if useful.
- Do NOT touch `payment-ops.*`, `admin.*`, `coach-messaging.*`, `real-meal-plans.*`, `test/roles-enforced.spec.ts`.

## Issue (verified @ 19e51b0)
**#7 (🔴🧹 token enumeration)** — `storefront-public.controller.ts:123-124` `GET join/:token` is throttled by IP only: `@Throttle({ default: { ttl: 60_000, limit: 60 } })`. The companion POST at `:147-148` is already the stricter `{ttl:60_000, limit:20}`. IP-only on the GET lets an attacker enumerate `:token` values (60 distinct token probes/min/IP). FIX: throttle the GET by a COMPOSITE `(token, IP)` key (and/or a tighter limit) so a single IP cannot probe many distinct tokens cheaply. 
- Inspect how the project's ThrottlerGuard is configured (storage, default key generator). Implement a composite key = `${ip}:${tokenParam}` (or use NestJS Throttler's `getTracker`/`generateKey` override) so the bucket is per (IP, token), and consider lowering the per-(IP,token) limit. The goal: probing N different tokens from one IP consumes N buckets but each token-guess sequence is still rate-limited, AND total distinct-token attempts per IP are bounded. The cleanest fix per the issue text is to mirror the POST's composite-token throttling that "the POST already is" — find how the POST achieves it and apply the same to the GET. 
- Do NOT break legitimate single-token landing-page loads (a real buyer hitting their one join link must not be throttled on normal use).

## Constraints
- Match the POST route's existing composite-token throttle mechanism EXACTLY (the issue says the POST already does composite (token,IP)). Read `:147-148` and whatever guard/decorator/key-resolver it uses, and apply the same to the GET at `:123-124`.
- No behavior change for valid traffic; only the abuse path is tightened.
- Commit as Dynasia G, NO trailers, push every ~2min to `hygiene/storefront-join-throttle`.

## Test bullets
- Many distinct-token GETs from one IP hit the rate limit (429) where today they'd pass (60/min IP-only).
- A legitimate repeated load of ONE valid token within normal limits still succeeds.
- The GET now uses the same composite-key mechanism as the POST.

## Auditor gate (GPT-5.5, real tsc/lint/jest)
Security: confirm the GET key is genuinely composite (token,IP) and the limit meaningfully reduces enumeration vs the old IP-only 60/min. Verify the mechanism matches the POST's (not a divergent reimplementation that drifts). Confirm legitimate single-token use isn't broken. No shared throttler config touched that would affect other modules. No out-of-write-set file changed.
