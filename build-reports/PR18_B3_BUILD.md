# PR-18 / B3 — BUILD REPORT: custom-domain Host-header routing for landing pages

**Repo:** growth-project-backend
**Branch:** `pr18/b3-custom-domain-host` (off backend main `19e51b0`)
**Builder:** Dynasia G (Opus 4.8)
**HEAD SHA:** `fba28026ba8e1597987af53fa868b45d027554c7`

## Summary

Implements the long-standing custom-domain Host-header TODO in the public
landing-page controller (`landing-pages.public.controller.ts:22-27`). A
request arriving on a **verified** custom domain now serves that coach's
published page directly at the domain apex, with no `/p/:coachSlug/:pageSlug`
in the URL, while the canonical `/p/...` routes remain fully
backwards-compatible.

## Write-set (STRICT — only these touched)

- `src/landing-pages/landing-pages.public.controller.ts` — host resolver,
  normalization/security helpers, four bare custom-domain routes, shared
  render/checkout helpers.
- `src/landing-pages/landing-pages.public.service.ts` — added
  `resolveCustomDomainAddress(host)` wrapper over the existing
  `findPublishedByCustomDomain`.
- `test/landing-pages.public.controller.spec.ts` — new focused spec (22 cases).

`landing-pages.service.ts` was **NOT** modified: the existing
`findPublishedByCustomDomain` (`:673-713`) already projects
`coach.coach_profile.invite_code` (the canonical coach slug) and the page
`slug`, which is exactly the address projection the resolver needs. No
storefront controllers, package services, or `webview-detect.middleware.ts`
were touched (read as precedent only).

## What was implemented (per brief)

1. **`resolvePageAddress(req, params)`** private resolver returns
   `{ coachSlug, pageSlug, source: 'path' | 'customDomain' }`. Explicit
   `/p/...` params always win (`source:'path'`) so the custom-domain branch
   can never hijack a canonical request.
2. **Trusted host read:** reads **only** the `Host` header — never
   `X-Forwarded-Host`. Express has no `trust proxy` and the Fly edge forwards
   client headers verbatim (same precondition the storefront webview
   interstitial documents at `storefront/webview-detect.middleware.ts:44-55`),
   so XFH is attacker-controlled and must not steer routing.
3. **Strict host normalization** (`normalizeHost`): trim, lowercase, strip a
   single `:port`, strip a single trailing dot; **reject** comma chains,
   scheme, path/query/fragment, userinfo (`@`), internal whitespace,
   backslash, empty, and over-length (>253). Mirrors
   `CustomDomainService.normaliseDomain` so a Host can only match a domain
   that was stored through the same normalization.
4. **Canonical-host ignore** (`isCanonicalHost`): `*.trygrowthproject.com`,
   `*.joingrowthproject.com`, and `localhost`/`127.0.0.1`/`0.0.0.0`
   short-circuit **before** any DB lookup, so normal `/p/...` traffic on the
   app host is never routed through the custom-domain branch.
5. **Verified-domain routing:** `resolveCustomDomainAddress` calls
   `findPublishedByCustomDomain`, which only matches rows with
   `custom_domain_verified_at NOT NULL` AND `status:'published'`
   (`landing-pages.service.ts:686-691`). IDOR-safe: a domain can only ever
   resolve to its own page.
6. **Routes (minimal PR-18 shape):**
   - `GET /` → verified domain's published page (SSR HTML, 60s + SWR cache).
   - `GET /checkout?tier=` → same page's checkout (302 to TGP storefront).
   - `POST /leads` → same page's lead submit (silent `{ok:false}` off-domain).
   - `POST /view` → same page's view analytics (fire-and-forget, always 200).
   - Each non-domain request 404s with `no-store` and does **not** fall
     through to `/p/...`.
7. **No untrusted redirect / reflection:** the resolved host is used only as a
   DB lookup key; it is never reflected into a redirect target or into HTML.

## Security / 50-Failures coverage

- **Host-header poisoning:** XFH ignored for routing; host never reflected
  into redirect/HTML; verified test asserts a forged `X-Forwarded-Host` cannot
  steer a canonical Host to a custom-domain page.
- **IDOR (#5):** only verified domains route, and only to their own page (DB
  enforces `custom_domain_verified_at NOT NULL`).
- **Input validation (#8):** comma/port/trailing-dot/scheme/path/userinfo/
  over-length/empty Host variants normalized or rejected with explicit tests.
- **Throttles preserved:** custom-domain routes carry the same per-route
  `@Throttle` limits as their `/p/...` counterparts (120 / 60 / 3 / 30 per
  minute).
- **Cache:** custom-domain 404s → `no-store, max-age=0`; published pages keep
  the existing `public, max-age=60, stale-while-revalidate=300`.

## Deployment note (for integration / route mounting — out of B3 write-set)

The bare custom-domain paths (`/`, `/checkout`, `/leads`, `/view`) sit under
the global `/api` prefix unless excluded in `main.ts`
(`setGlobalPrefix('api', { exclude: [...] })`, currently lists the `/p/...`
routes). On a verified custom domain the apex/sub-paths are what the edge
forwards, so these handlers must be reachable as bare paths there. `main.ts`
is outside the B3 write-set and is intentionally left to the integration /
route-mounting owner; the controller logic, host security, and DB wiring are
complete and fully tested here. Canonical-host traffic on these same paths
safely resolves to no custom domain and returns the no-store 404, so adding
the exclusions cannot shadow `/p/...`.

## Verification (run by builder in worktree)

- **Typecheck:** `npx tsc --noEmit -p tsconfig.json` → **pass** (exit 0).
- **Lint:** `npx eslint` on both touched source files → **pass** (exit 0).
- **Tests:** `npx jest test/landing-pages` → **12 suites, 256 tests, all
  pass**, including the new `landing-pages.public.controller.spec.ts`
  (22 cases) and the unchanged `landing-pages.public.service.spec.ts`.

## Tests added (test/landing-pages.public.controller.spec.ts)

- Verified custom-domain Host renders the page without `/p/...`.
- Host with port + trailing dot + uppercase normalizes correctly.
- Unknown/unverified host → no-store 404.
- Canonical app host → no-store 404 with **no** DB lookup (not hijacked).
- Malicious Host variants (comma chain, embedded path, scheme, userinfo,
  empty, over-length) → no-store 404, no lookup.
- `X-Forwarded-Host` is never trusted for routing.
- Absent Host → no-store 404.
- Canonical `/p/...` render still uses path params and 404s on over-length
  slugs without touching the custom-domain branch.
- Checkout custom-domain route maps to the same page (302), 400s on missing
  tier, 404 no-store off-domain.
- Lead custom-domain route submits against the resolved page, returns silent
  `{ok:false}` off-domain, preserves the service 429 throttle.
- View custom-domain route records against the resolved page (fire-and-forget),
  always 200 off-domain with no write.

## FIX NOTE — P0 resolved (custom-domain apex routing) — Dynasia G

The independent GPT-5.5 audit returned **NOT-CLEAN** with one P0: the bare
custom-domain routes (`GET /`, `GET /checkout`, `POST /leads`, `POST /view`)
were registered behind the global `/api` prefix, so a verified custom domain
hitting `/` never reached them — the feature was non-functional at the apex.
The deployment note above (left for the route-mounting owner) is now actioned.

**Files touched (exact write-set for this fix):**
- `src/main.ts` — global-prefix config (authorized one-off outside the original
  B3 write-set for this P0; confirmed no other in-flight unit modifies it).
- `src/landing-pages/landing-pages.public.controller.ts` — comment/doc only
  (routing-mechanism note updated; within original write-set).
- `test/landing-pages.public.controller.spec.ts` — added a route-registration
  test suite (within original write-set).

**How root routing now works (and why it shadows nothing):**
`main.ts` `setGlobalPrefix('api', { exclude: [...] })` now also excludes the
four bare custom-domain paths using **method-scoped** `RouteInfo` entries:
`{ path: '', method: GET }`, `{ path: 'checkout', method: GET }`,
`{ path: 'leads', method: POST }`, `{ path: 'view', method: POST }`.
These resolve at the bare host apex (`/`, `/checkout`, `/leads`, `/view`) —
exactly the URL shape a verified custom domain hits.
- **No `/api/...` route is shadowed:** an audit of every controller confirms
  none declares a bare `/`, `checkout`, `leads`, or `view` route (checkout
  lives at `v1/checkout`; leads/view otherwise exist only under
  `p/:coachSlug/:pageSlug/...`). The exclude entries only strip the prefix for
  the LandingPagePublicController's own root handlers.
- **`/p/:coachSlug/:pageSlug[...]` is unaffected:** those are distinct paths,
  still excluded and still served at the apex; they never gain or leak an
  `/api` prefix.
- **Canonical-host safety preserved:** canonical-host traffic to these bare
  paths resolves to no verified custom domain and returns the shared
  `no-store, max-age=0` 404 — it does not leak or hijack `/p/...`.

**Test added (closes the audit P2):** a Nest `Test.createTestingModule`
route-registration suite boots the app with the EXACT same prefix-exclude
shape and asserts via the live Express router stack that `GET /`,
`GET /checkout`, `POST /leads`, `POST /view` are registered at the apex (NOT
under `/api`), that `/p/...` routes are not leaked under `/api`, and that
method-mismatched paths (`POST /checkout`) are not registered.

**Verification (COMPLETED green in worktree, this fix):**
- **Typecheck:** `NODE_OPTIONS=--max-old-space-size=2048 npx tsc --noEmit --pretty false`
  → **COMPLETED, exit 0** (the prior auditor's tsc was killed; now runs to
  completion cleanly).
- **Lint:** `npx eslint` on `src/main.ts`,
  `landing-pages.public.controller.ts`, `landing-pages.public.service.ts`,
  `test/landing-pages.public.controller.spec.ts` → **exit 0** (0 errors; one
  pre-existing unused-var warning unrelated to this fix).
- **Tests:** `npx jest test/landing-pages --runInBand` → **12 suites / 262
  tests pass** (256 prior + 6 new route-registration cases).

**Commit on branch `pr18/b3-custom-domain-host`:** `683c952a5659d67692cca4bccc99d5643576b138` (author Dynasia G,
no trailers), pushed to origin.
