# AUDIT — PR-18 B3 custom-domain Host routing (PR #342) — R3

Pinned HEAD audited: `0e94a6b298be6f1dba10045eee1f7b1126da9de5`.

VERDICT: CLEAN
Typecheck: pass — `NODE_OPTIONS='--max-old-space-size=4096' npx tsc --noEmit --pretty false` exited 0 in the SHA-pinned worktree.
Lint: pass — `npx eslint src/main.ts src/landing-pages/public-route-prefix.ts src/landing-pages/landing-pages.public.controller.ts src/landing-pages/landing-pages.public.service.ts test/landing-pages.public.controller.spec.ts` exited 0 with no warnings.
Tests: pass — `NODE_OPTIONS='--max-old-space-size=4096' yarn --silent jest test/landing-pages --runInBand --logHeapUsage` reported 12 suites / 262 tests passed.

Commit metadata: author is `Dynasia G <dynasia@trygrowthproject.com>` and the audited commit body has no trailers.

## R3 write-set / stale-branch gate

P0 stale-branch resolution: PASS.

`git diff origin/main..0e94a6b2 --stat` shows only B3 files:

```text
.../landing-pages.public.controller.ts             | 368 ++++++++++++++--
src/landing-pages/landing-pages.public.service.ts  |  39 ++
src/landing-pages/public-route-prefix.ts           |  37 ++
src/main.ts                                        |  19 +-
test/landing-pages.public.controller.spec.ts       | 475 +++++++++++++++++++++
5 files changed, 890 insertions(+), 48 deletions(-)
```

`git diff origin/main..0e94a6b2 --name-status` is limited to:

```text
M	src/landing-pages/landing-pages.public.controller.ts
M	src/landing-pages/landing-pages.public.service.ts
A	src/landing-pages/public-route-prefix.ts
M	src/main.ts
A	test/landing-pages.public.controller.spec.ts
```

No B4/B2/H5/B1/H1/H2/H3/H4/M1 files appear in the diff. I explicitly checked the R2-stale files and they are unchanged from `origin/main`: `src/packages/drip-dispatcher.cron.ts`, `src/packages/package-contents.controller.ts`, `src/packages/package-contents.service.ts`, `src/real-meal-plans/real-meal-plans.controller.ts`, `test/drip-dispatcher.cron.spec.ts`, `test/package-contents.service.spec.ts`, and `test/real-meal-plans-guards.spec.ts`.

Protections preserved:

- B4 duplicate-alert dedup remains present: `dispatchBuyerAlert` claims the row with `updateMany({ where: { id, alert_dispatched_at: null }, data: { alert_dispatched_at: now } })` before send and documents no post-send stamp [src/packages/drip-dispatcher.cron.ts:438-517].
- B2 package-content scope/order protections remain present: the controller passes raw actor id plus resolved tenant coach id [src/packages/package-contents.controller.ts:70-88], attach re-checks actor scope and serializes display-order append under the per-package advisory lock [src/packages/package-contents.service.ts:90-157], patch/reorder/soft-delete preserve swap/compaction behavior under the lock [src/packages/package-contents.service.ts:236-421], and the advisory lock helper remains [src/packages/package-contents.service.ts:616-633].
- H5 real-meal-plan guard hoist remains present: coach controllers have class-level `@UseGuards(JwtAuthGuard, CoachGuard, SubscriptionGuard)` and the client controller has class-level `@UseGuards(JwtAuthGuard, ClientEntitlementGuard)` [src/real-meal-plans/real-meal-plans.controller.ts:31-123]; the guard contract test is present [test/real-meal-plans-guards.spec.ts:1-61].

## P0 findings

- None.

## P1 findings

- None.

## P2 findings

- None.

## P3 (non-blocking)

- None.

## Verification of R2 fixes

- R2 P0 stale-branch/write-set violation is fixed: the branch diff is limited to B3 landing-page routing files and `src/main.ts`, with no package, drip-dispatcher, or real-meal-plan regressions in the merge diff.
- R2 P2 observability gap is fixed: the controller defines bounded dispatch outcomes `custom_domain_match`, `canonical_host_skip`, `invalid_host_reject`, and `unknown_host_404` [src/landing-pages/landing-pages.public.controller.ts:98-106], emits low-cardinality structured debug logs without raw rejected Host values [src/landing-pages/landing-pages.public.controller.ts:127-160], and logs each decision branch in `resolvePageAddress` [src/landing-pages/landing-pages.public.controller.ts:392-416].
- R2 P2 copied prefix-exclude test gap is fixed: `LANDING_PUBLIC_PREFIX_EXCLUDE` is now the single source of truth [src/landing-pages/public-route-prefix.ts:24-37], production bootstrap imports/spreads it into `setGlobalPrefix` [src/main.ts:18, src/main.ts:170-214], and the route-registration test imports and boots with that same constant [test/landing-pages.public.controller.spec.ts:24, test/landing-pages.public.controller.spec.ts:153-156].
- R2 P3 unused `svc` warning is fixed: the throttle-preservation test now destructures only `{ ctrl }` [test/landing-pages.public.controller.spec.ts:420-432], and targeted lint exits clean with no warnings.

## Security-critical / 50-failures checklist

- Host-header poisoning / input validation (#8): the dispatcher reads only `Host`, not `X-Forwarded-Host` [src/landing-pages/landing-pages.public.controller.ts:389-394], normalizes trim/lowercase/port/trailing-dot and rejects comma chains, schemes, paths, userinfo, whitespace, backslash, empty, and over-length host values [src/landing-pages/landing-pages.public.controller.ts:72-87], with tests for malicious variants, absent Host, over-length Host, and ignored `X-Forwarded-Host` [test/landing-pages.public.controller.spec.ts:265-321].
- IDOR / tenant-scope (#5): custom-domain routing only occurs after `findPublishedByCustomDomain` returns a published page whose `custom_domain_verified_at` is not null [src/landing-pages/landing-pages.service.ts:681-691], and the public wrapper returns only the DB-backed coach invite code and page slug after defensive status/slug checks [src/landing-pages/landing-pages.public.service.ts:43-58].
- Routing / route-existence correctness: bare custom-domain routes exist for `GET /`, `GET /checkout`, `POST /leads`, and `POST /view` [src/landing-pages/landing-pages.public.controller.ts:180-252]; the global-prefix exclusions are method-scoped to those exact verbs [src/landing-pages/public-route-prefix.ts:24-37]; route-registration tests prove the apex routes are not mounted under `/api` and method-mismatched `POST /checkout` is not registered [test/landing-pages.public.controller.spec.ts:168-204].
- API shadowing / infra: `main.ts` spreads the shared exclude list under the existing public-prefix exclusions [src/main.ts:170-214]. A repo-wide controller/decorator review found no non-B3 controller declaring combined bare `GET /`, `GET /checkout`, `POST /leads`, or `POST /view`; existing authenticated APIs remain under their controller prefixes such as `v1/checkout`.
- Redirect safety: Host is used only as a verified lookup key in `resolvePageAddress` [src/landing-pages/landing-pages.public.controller.ts:392-416]; checkout redirects use the service-returned URL for the resolved coach/page/tier, never the raw Host header [src/landing-pages/landing-pages.public.controller.ts:454-468].
- Throttle preservation: custom-domain render/checkout/lead/view routes carry the same throttle limits as their slug-route counterparts [src/landing-pages/landing-pages.public.controller.ts:180-252, src/landing-pages/landing-pages.public.controller.ts:256-337], and the lead custom-domain test verifies the service 429 path is preserved [test/landing-pages.public.controller.spec.ts:420-432].
- Cache/error mapping: matched published pages keep the existing public cache header [src/landing-pages/landing-pages.public.controller.ts:431-436]; malformed/canonical/unknown Host HTML routes return the shared no-store 404 [src/landing-pages/landing-pages.public.controller.ts:471-475], while custom-domain lead/view non-matches preserve the existing silent `{ ok:false }` / no-write `{ ok:true }` shapes [src/landing-pages/landing-pages.public.controller.ts:217-241].
- Race/transaction/N+1/pagination/soft-delete gates: B3 adds no new list pagination path, no new mutable transaction, and no new soft-delete behavior. The only new DB read on bare custom-domain requests is one verified-domain lookup before reusing existing render/checkout/lead/view service paths [src/landing-pages/landing-pages.public.controller.ts:408-416, src/landing-pages/landing-pages.public.service.ts:63-257].

## Verification of PR claims

- Claim: verified custom-domain Host renders a page without `/p/...`. Verified: `GET /` resolves Host and renders only when `source === 'customDomain'` [src/landing-pages/landing-pages.public.controller.ts:180-192], and the test asserts a verified Host renders with the resolved coach/page slugs [test/landing-pages.public.controller.spec.ts:209-222].
- Claim: checkout/lead/view custom-domain routes map to the same page and keep throttled behavior. Verified: the bare routes resolve the same Host-derived address and delegate to checkout/lead/view service paths [src/landing-pages/landing-pages.public.controller.ts:194-252], with tests for checkout redirect, lead submission, throttle propagation, and view recording [test/landing-pages.public.controller.spec.ts:350-473].
- Claim: canonical `/p/...` routes stay backwards-compatible. Verified: slug routes remain declared under `/p/:coachSlug/:pageSlug[...]` and use explicit path params rather than Host resolution [src/landing-pages/landing-pages.public.controller.ts:254-355, src/landing-pages/landing-pages.public.controller.ts:376-387], and tests cover canonical path rendering and slug route registration [test/landing-pages.public.controller.spec.ts:188-197, test/landing-pages.public.controller.spec.ts:324-347].
- Claim: unknown/unverified Host falls through/degrades gracefully, not 500. Verified: unresolved hosts return source `path` with empty slugs and the bare HTML routes return no-store 404, while lead/view return their existing non-leaking shapes [src/landing-pages/landing-pages.public.controller.ts:408-416, src/landing-pages/landing-pages.public.controller.ts:187-241], with tests for unknown/canonical/malformed/absent Host behavior [test/landing-pages.public.controller.spec.ts:236-321, test/landing-pages.public.controller.spec.ts:378-388, test/landing-pages.public.controller.spec.ts:407-418, test/landing-pages.public.controller.spec.ts:465-473].

## Counts

P0: 0
P1: 0
P2: 0
P3: 0
