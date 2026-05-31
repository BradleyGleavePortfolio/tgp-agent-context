# PR-18 / B3 — Backend landing-page custom-domain Host routing

**Repo:** growth-project-backend. **Off backend main `19e51b0`.** Builder = Opus 4.8.
**Source plan:** `specs/PR18_EXPANSION_PLAN.md` §2.4, §4(B3).

## Write-set (STRICT — touch ONLY these)
- `src/landing-pages/landing-pages.public.controller.ts`
- `src/landing-pages/landing-pages.public.service.ts` (only if adding wrapper methods)
- `src/landing-pages/landing-pages.service.ts` (only if existing custom-domain lookup needs a slug/address projection)
- `test/landing-pages.public.controller.spec.ts` (or a new focused custom-domain public-route spec if none exists)

Do NOT touch package services, storefront controllers (H4 owns `storefront-public.controller.ts`), or `webview-detect.middleware.ts` (READ as precedent only).

## Item — Resolve published storefront/landing page by Host header
TODO is at `landing-pages.public.controller.ts:22-27`. Verified-domain lookup ALREADY exists at `landing-pages.service.ts:673-713` (normalizes host `:681-684`, requires `custom_domain_verified_at NOT NULL` + `status:'published'` `:686-691`). The controller currently never reads Host and never rewrites `coachSlug/pageSlug`.
1. Add private helper `resolvePageAddress(req, params)` → `{ coachSlug, pageSlug, source: 'path' | 'customDomain' }`.
2. Custom-domain candidates:
   - Read a trusted host deliberately. Prefer `Host` unless deployment explicitly trusts a proxy header; if using `X-Forwarded-Host`, document + constrain. Strip port, trim, lower-case, remove trailing dot, reject comma chains unless intentionally taking one value.
   - Ignore canonical app/API hosts so normal `/p/:coachSlug/:pageSlug` is unchanged.
   - Call `LandingPagesService.findPublishedByCustomDomain(host)` (or a wrapper via `LandingPagePublicService`).
   - Only route if published AND `custom_domain_verified_at` set (service already enforces).
3. Custom-domain rendering (minimal PR-18 shape):
   - `GET /` on verified custom domain → that domain's published page.
   - `GET /checkout?tier=...`, `POST /leads`, `POST /view` on verified custom domain → same page's checkout/lead/view logic.
   - Existing `/p/:coachSlug/:pageSlug[...]` stays backwards-compatible.
4. NEVER redirect to an untrusted Host; render/resolve server-side only after DB verification.

## 50-Failures concerns
- Host-header poisoning: never trust arbitrary `X-Forwarded-Host`; never reflect host into redirects/HTML without verification.
- IDOR: only route verified domains to their own page. Normalize host consistently; reject empty/long/invalid hostnames.
- Preserve existing throttles for render/checkout/lead/view. Custom-domain 404s → `no-store`; published pages keep existing 60s + SWR cache.

## Tests
- Verified custom-domain Host renders page without `/p/...`. Unverified/unknown host → 404/no-store.
- Canonical app host still requires `/p/:coachSlug/:pageSlug`, not hijacked by custom-domain branch.
- Malicious comma/port/trailing-dot host variants normalize or reject as designed.
- Checkout/lead/view custom-domain routes map to the same page and keep throttled behavior.

## Doctrine
- Commit (R4 STRICT, NO trailers): `git -c user.name='Dynasia G' -c user.email='dynasia@trygrowthproject.com' commit -m "..."`.
- Push every ~2 min to `pr18/b3-custom-domain-host` (R61). `api_credentials=["github"]` for all git. Bar = CLEAN P0/P1/P2.
