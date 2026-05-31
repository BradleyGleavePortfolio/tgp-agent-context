# AUDIT — PR-18 B3 custom-domain Host routing (PR #342)

Pinned HEAD audited: `fba28026ba8e1597987af53fa868b45d027554c7`.

Typecheck: NOT COMPLETED — `npx tsc --noEmit` was killed by the sandbox; retry with `NODE_OPTIONS='--max-old-space-size=3072' npx tsc --noEmit --pretty false` timed out after 600s.
Lint: pass — `npx eslint src/landing-pages/landing-pages.public.controller.ts src/landing-pages/landing-pages.public.service.ts` exited 0.
Tests: pass — `npx jest test/landing-pages --runInBand` reported 12 suites / 256 tests passed.

Write-set check: changed files are `src/landing-pages/landing-pages.public.controller.ts`, `src/landing-pages/landing-pages.public.service.ts`, and `test/landing-pages.public.controller.spec.ts`; `landing-pages.service.ts`, storefront controllers, and `webview-detect.middleware.ts` are not modified.

## P0 findings

- [src/main.ts:169-211, src/landing-pages/landing-pages.public.controller.ts:129-181] The bare custom-domain routes are still mounted behind the global `/api` prefix, so the required custom-domain URL shapes (`/`, `/checkout`, `/leads`, `/view`) are not reachable as bare paths in this PR. `main.ts` excludes only the existing `/p/:coachSlug/:pageSlug` routes from the global prefix and does not exclude the new root/checkout/leads/view routes, while the new controller routes are declared at controller root. The builder's note is correct: without `setGlobalPrefix('api', { exclude: [...] })` entries or equivalent mounting outside `/api`, the shipped feature is non-functional at the apex paths required by the brief. This is a P0 because the primary user-visible feature routes do not exist at their specified paths. Concrete fix: update the route mounting/global-prefix exclusions (or equivalent edge/backend routing) so the custom-domain host serves `GET /`, `GET /checkout`, `POST /leads`, and `POST /view` as bare paths, then cover that with an integration-style route registration test.

## P1 findings

- None.

## P2 findings

- [test/landing-pages.public.controller.spec.ts:5-7, src/main.ts:169-211] The new tests instantiate the controller directly and therefore cannot catch the global-prefix mounting failure above. This is a P2 independent of the P0 because the critical deployment contract for bare custom-domain paths is untested. Concrete fix: add a Nest/e2e route-registration test or bootstrap-level assertion that the custom-domain host path shape is reachable outside `/api`.

## P3 (non-blocking)

- None.

## Security-critical verification

- Host-header trust: verified clean. The resolver reads `req.headers['host']` and does not read `X-Forwarded-Host` for routing [src/landing-pages/landing-pages.public.controller.ts:338-343].
- Host normalization: verified clean for the brief's critical cases. The helper trims/lowercases, rejects comma chains and scheme/path/userinfo/whitespace/backslash, strips a port and trailing dot, and rejects empty/over-length hosts [src/landing-pages/landing-pages.public.controller.ts:71-86].
- Canonical-host short-circuit: verified clean. First-party suffixes/exact local hosts return before any custom-domain lookup, preventing canonical `/p/...` traffic from being hijacked [src/landing-pages/landing-pages.public.controller.ts:46-54, src/landing-pages/landing-pages.public.controller.ts:90-94, src/landing-pages/landing-pages.public.controller.ts:341-348].
- Verified-domain-only routing: verified clean. The wrapper delegates to the existing custom-domain lookup and requires a resolved coach invite code and page slug [src/landing-pages/landing-pages.public.service.ts:43-59]; the DB query requires `custom_domain_verified_at` not null and `status: 'published'` [src/landing-pages/landing-pages.service.ts:681-691].
- Host reflection/redirect risk: verified clean in the changed code. The normalized host is passed only to `resolveCustomDomainAddress` [src/landing-pages/landing-pages.public.controller.ts:348-352]; rendering and checkout then use the resolved slug identifiers [src/landing-pages/landing-pages.public.controller.ts:355-405].
- Throttles: verified preserved on new and existing render/checkout/lead/view routes [src/landing-pages/landing-pages.public.controller.ts:129-181, src/landing-pages/landing-pages.public.controller.ts:205-286].
- Custom-domain 404 cache: verified clean. The shared 404 response sets `Cache-Control: no-store, max-age=0` [src/landing-pages/landing-pages.public.controller.ts:407-411].

## Verification of PR claims

- Claim: verified custom-domain Host renders the page without `/p/...`. FALSE as shipped for the intended bare apex route because the new bare handlers remain under the global `/api` prefix unless `main.ts` excludes them [src/main.ts:169-211, src/landing-pages/landing-pages.public.controller.ts:129-181].
- Claim: only `Host` is trusted, not `X-Forwarded-Host`. Verified true [src/landing-pages/landing-pages.public.controller.ts:338-343].
- Claim: canonical hosts are not hijacked. Verified true in controller logic [src/landing-pages/landing-pages.public.controller.ts:90-94, src/landing-pages/landing-pages.public.controller.ts:341-348].
- Claim: routing requires a verified, published custom-domain row. Verified true [src/landing-pages/landing-pages.public.service.ts:43-59, src/landing-pages/landing-pages.service.ts:681-691].
- Claim: malicious Host variants normalize or reject as designed. Verified true for the implemented and tested critical variants [src/landing-pages/landing-pages.public.controller.ts:71-86, test/landing-pages.public.controller.spec.ts:117-186].
- Claim: checkout/lead/view custom-domain routes map to the same page and keep throttled behavior. Verified in controller logic, but false for intended bare paths until the global-prefix issue is fixed [src/landing-pages/landing-pages.public.controller.ts:143-181, src/main.ts:169-211].

VERDICT: NOT-CLEAN
