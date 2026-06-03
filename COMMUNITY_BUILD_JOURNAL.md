# Community Build Journal — R64 Live Log

**Purpose:** Live state of every Community Expansion PR. Pushed to `tgp-agent-context` at every state change (R64 protocol) so sandbox death does not lose work-in-flight.

**Authoritative plans:**
- `STEP0_COMMUNITY_INTEGRATIONS_AND_GAPS.md`
- `COMMUNITY_PRODUCT_PLAN.md`
- `COMMUNITY_EXECUTION_PLAN.md`

**Backend HEAD at plan time:** `659e0ccc74c47f9c985a26b582987253ec9fdb40`
**Mobile HEAD at plan time:**  `4b7587e47694d1640b1484d1a2a38d40f307afac`

**R0 reminder for every commit on every PR:**
- NO "Coming soon" strings anywhere (production, comments, test titles, docblocks, regex)
- NO `@ts-ignore`/`@ts-nocheck`/`as any`/`as unknown as`/`as never`/`as never as X`
- NO `.catch(()=>undefined)`, NO empty `catch(e){}`, NO spinner-only empty states
- `@ts-expect-error` with one-line justification IS allowed
- Commit author: `Dynasia G <dynasia@trygrowthproject.com>`, title-only, no Co-Authored-By / Generated-By

---

## Active queue

| Order | PR ID | Title | State | Builder | Auditor | Branch | Last SHA |
|---|---|---|---|---|---|---|---|
| 1 | P0-0A | wearables: restore on-device ingest route | R2 BUILT → R2 audit dispatching | Opus 4.8 (R2 fixer done) | GPT-5.5 (R1 done) | `fix/wearables-samples-ingest-route` | `94080ae8` |
| 2 | P0-0B | wearables: register cloud connectors | R2 BUILT → R2 audit dispatching | Opus 4.8 (R2 fixer done) | GPT-5.5 (R1 done) | `fix/wearables-cloud-connector-wiring` | `e696e122` |
| 3 | v1-1 | community: v1-1 schema workspace cohorts | queued | — | — | `feature/community-v1-schema` | — |
| 4 | v1-2 | community: v1-2 backend services REST | queued | — | — | `feature/community-v1-services` | — |
| 5 | v1-3 | community: v1-3 mobile community tab | queued | — | — | `feature/community-v1-mobile` | — |

---

## Event log (most recent first)

### 2026-06-02 21:30 PT — Both R2 fixers DONE; dispatching R2 audits

**P0-0A R2 — SHA `94080ae8e18b2e783d76826a1fc8f861d5b04556`** (PR #363):
- R0 sweep on R2 diff: clean (three `@ts-expect-error` directives w/ one-line justifications in test doubles — allowed).
- `test/wearables/samples-ingest.spec.ts`: 30/30 passed.
- Fix 1 (P0): Injected `PrismaService`; new `assertConnectionsOwnedByUser()` runs single user-scoped findMany, throws typed `ForbiddenException({ code: 'wearables_connection_forbidden' })` on missing/foreign/provider-mismatched/disconnected connections — enumeration-safe, `IngestionService` untouched.
- Fix 2 (P1): Real runtime guard tests — actual `JwtAuthGuard` (no/empty bearer → 401) + real `RolesGuard` against actual handler. Repo lacks supertest, used direct `canActivate` pattern matching existing specs (`sprint-b-workout-builder-guard.spec.ts`).
- Fix 3 (P2): Throttle now asserts exact metadata `limit: 20`, `ttl: 60000` via `THROTTLER:LIMITdefault` / `THROTTLER:TTLdefault` keys.
- **⚠️ DEVIATION FOR BRADLEY'S DECISION:** Brief expected coach/owner JWT → 403 on `@Roles('student')`, but repo's `RolesGuard` enforces a documented `owner > coach > student` hierarchy — owner total bypass, coach inherits student routes. So **coach AND owner are admitted, not rejected**. Tests assert the real behavior with an explanatory comment. If product intent is truly student-only on-device ingest, that needs a dedicated student-only guard — outside R2 patch scope. Flagged for R2 auditor + Bradley.

**P0-0B R2 — SHA `e696e1226493f4ee59a0d9e622841e595d14882b`** (PR #364):
- R0 sweep on R2 diff: clean. Prior `as unknown as PrismaService` hit was replaced with a 2-line-justified `@ts-expect-error`; compiles cleanly (no unused-directive warning confirms genuine type mismatch).
- Tests: `wearables-module.integration.spec.ts` 3/3, `connector-registry.spec.ts` + `module-graph.spec.ts` 51/51. Full suite (321 suites / 4106 tests) previously green; final edit only touched one spec.
- Fix 1 (R0 cleanup): Banned phrases removed from `cloud-connectors.feature.ts` and `connector-registry.spec.ts`; rephrased to neutral wording.
- Fix 2 (DI registration): New `@Global() WearablesCloudConnectorsGuardModule` (`src/wearables/cloud-connectors.module.ts`) provides+exports the guard, imported once in `wearables.module.ts` — covers all 8 connector modules + ConnectionsModule.
- Fix 3 (real-module test): New `test/wearables/wearables-module.integration.spec.ts` boots actual `WearablesModule` using Node `http` (supertest not in devDeps), asserts 8-connector registry + route-level flag-OFF 503 on `POST /v1/wearables/connections/oauth/start` and Oura webhook.
- Fix 4 (env hardening): Garmin + WHOOP OAuth URL builders now use fail-loud `requireEnv()` for `clientId`/`clientSecret`/`redirectUri`; missing-env tests added. Garmin `supportsPkce: false` confirmed correct via implementation review; comment corrected accordingly.
- **Extra fixes the fixer caught:** Added `@Optional()` to Strava webhook controller's `env?` param (was causing AppModule boot failure); registered two `KNOWN_FORWARDREF_CYCLES` entries (Garmin↔Wearables, Wearables↔Whoop); split synthetic "all 8" registry test into 8 separate contribution modules so DiscoveryService doesn't collapse them.

Next: dispatch GPT-5.5 R2 audits in parallel (fresh instances; R31/R32 enforced — R2 auditor != R1 auditor != fixer). Verify R2 fixes, sweep R0 again, walk 50-failures again. R64-push verdicts.

### 2026-06-02 20:59 PT — Both auditors returned NEEDS_R2 (R1 verdicts)

**P0-0A (PR #363, SHA `6fd951f5`) — NEEDS_R2** (4 findings):
- R0 sweep: zero matches (clean).
- Functional core (route, schema, flag, throttle metadata, roles metadata) correct.
- **Blocker:** body-controlled `connectionId` is not ownership/provider-validated before write side effects. Student can submit any UUID-shaped `connectionId`; `IngestionService` bumps that connection without filtering by `req.user.id` or provider match.
- Unauthenticated 401 and coach-rejection only metadata-tested, not exercised through Nest HTTP/runtime guard flow.
- Throttle test only asserts metadata key exists, not exact `ttl: 60000, limit: 20` or over-limit response.
- Fixer brief in `/home/user/workspace/audit_p0-0a_r1.md` § "NEEDS_R2 fixer brief".

**P0-0B (PR #364, SHA `8015d339`) — NEEDS_R2** (4 findings):
- **R0 sweep: FAIL.** Newly added comments/tests added banned `Coming soon` text (`src/wearables/cloud-connectors.feature.ts:23`, `test/wearables/connector-registry.spec.ts:68,366`) and banned `as any` phrase (`src/wearables/cloud-connectors.feature.ts:24`). Audit grep is literal — must not write banned phrase even inside "NO …" comments.
- **Blocker:** `WearablesCloudConnectorsGuard` is decorated on routes but NOT registered as a Nest provider in `ConnectionsModule` or any webhook module. Kill switch is not proven to run. Other feature-specific guards (e.g. `CoachBriefEnabledGuard`) are explicitly listed in their module providers.
- **Blocker:** acceptance test does NOT instantiate `WearablesModule`. It compiles synthetic `contributionModule(def)` modules instead. Does not validate the real Garmin/WHOOP forwardRef cycle, real connector module providers, or HTTP mounting of decorated controllers.
- Garmin/WHOOP fail open on missing OAuth env (use empty string defaults) while other six connectors `requireEnv` fail loud. Garmin registry metadata says `supportsPkce=false` but connector comments say modern Garmin Health API uses OAuth2+PKCE.
- Static module/import/token wiring is mostly correct (8 modules imported with forwardRef on Garmin/WHOOP, canonical string token aligned, all 8 bind `WEARABLE_CONNECTORS`).
- Fixer brief in `/home/user/workspace/audit_p0-0b_r1.md` § "Required R2 minimum".

Next: dispatch Opus 4.8 fixers in parallel in fresh isolated `/tmp/fix-p0-0a` and `/tmp/fix-p0-0b` worktrees. R31 enforced — fixers are NOT the auditors. Both will rebase onto their PR branch HEAD, apply R2 fixes from the briefs, commit as `Dynasia G`, push, and report new SHA. Then second-round audit per R32.

### 2026-06-02 20:35 PT — Wave 1 builders DISPATCHED in parallel (isolated worktrees)
- Bradley picked execution shape **A** (Recommended): P0-0A + P0-0B parallel preflight, then v1-1 alone, then v1-2 + v1-4 + v1-6 parallel.
- P0-0A builder (Opus 4.8) launched against `/tmp/build-p0-0a`, branch `fix/wearables-samples-ingest-route`, base `659e0cc`. Subagent id: `p0_0a_builder_hk_ingest_post_route_mpxikz9f`.
- P0-0B builder (Opus 4.8) launched against `/tmp/build-p0-0b`, branch `fix/wearables-cloud-connector-wiring`, base `659e0cc`. Subagent id: `p0_0b_builder_cloud_connector_wiring_mpxilim2`.
- Pre-dispatch collision audit: ZERO file overlap between the two PRs.
- Both PRs include explicit feature flags (`FEATURE_WEARABLES_INGEST_POST`, `FEATURE_WEARABLES_CLOUD_CONNECTORS`) defaulted false in production, with typed disabled-error responses (not 404, not "Coming soon", not spinner-only).
- Builders will commit, push, open PRs, then return SHA + PR# + R0 sweep + test results.

### 2026-06-02 19:44 PT — Journal created
- Approved by Bradley to start preflight + v1-1/2/3 with R64 pushes after every state change.
- Plans pushed at commit `8a3c665`.
- Next: dispatch P0-0A builder (Opus 4.8) against the planner's exact spec.

---

## P0-0A — wearables: restore on-device ingest route

- **Why:** Mobile HK / Health Connect / Samsung Health POST to `/v1/wearables/samples/ingest`; backend `src/wearables/samples/wearable-samples.controller.ts` only mounts `GET /v1/wearables/samples`. Mobile writes 404 silently in production.
- **Scope:** backend only, ~180 LOC.
- **Files:**
  - `src/wearables/samples/wearable-samples.controller.ts` — add `@Post('ingest')` handler
  - `src/wearables/samples/dto/ingest-samples.dto.ts` — new Zod schema (`IngestSampleSchema`, `IngestSamplesBodySchema`)
  - `test/wearables/samples-ingest.e2e-spec.ts` — e2e tests (auth, cross-user denial, batch caps)
- **Feature flag:** `FEATURE_WEARABLES_INGEST_POST`, default false in production.
- **State:** R2 built → R2 audit dispatching. SHA: `94080ae8e18b2e783d76826a1fc8f861d5b04556`. PR: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/363.
- **R1 findings:** see audit report; key blocker was missing connection ownership/provider validation.
- **R2 fixes:** ownership/provider gate via PrismaService findMany; real `JwtAuthGuard`/`RolesGuard` runtime tests; exact throttle metadata assertions.
- **⚠️ Open question for Bradley:** Repo `RolesGuard` admits coach + owner on `@Roles('student')` (documented `owner > coach > student` hierarchy). If on-device HK ingest should be student-only, a dedicated student-only guard is needed — outside R2 scope.

## P0-0B — wearables: register cloud connectors

- **Why:** 8 cloud connector modules (Oura/Fitbit/Garmin/WHOOP/Polar/Strava/Wahoo/Withings) exist in `src/wearables/connectors/*` but `WearablesModule` does not import them. Plus 3 sub-landmines the planner caught: circular imports on Garmin/WHOOP, registry token mismatch (local `WEARABLE_CONNECTORS` symbols), Strava doesn't bind to registry token.
- **Scope:** backend only, ~140 LOC.
- **Files (planner spec):**
  - `src/wearables/wearables.module.ts` — import 8 modules with `forwardRef` on Garmin & WHOOP
  - `src/wearables/connectors/{garmin,whoop}/*.module.ts` — `forwardRef(() => WearablesModule)`
  - All 8 connector modules — align to canonical `WEARABLE_CONNECTORS` token + add registry binding where missing
  - `test/wearables/connector-registry.spec.ts` — assert all 8 discoverable, OAuth metadata returned, webhooks mounted
- **Feature flag:** `FEATURE_WEARABLES_CLOUD_CONNECTORS`, default false.
- **State:** R2 built → R2 audit dispatching. SHA: `e696e1226493f4ee59a0d9e622841e595d14882b`. PR: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/364.
- **R1 findings:** R0 placeholder/broad-cast text added in comments/tests; cloud connectors guard decorated but not DI-registered; acceptance test did not boot `WearablesModule`.
- **R2 fixes:** R0 banned phrases removed; new `@Global() WearablesCloudConnectorsGuardModule` provides/exports the guard; new integration spec boots real `WearablesModule` and asserts 8-connector registry + route-level 503 when flag off; Garmin/WHOOP OAuth env now fail-loud via `requireEnv()`; bonus fixes (Strava `@Optional()`, KNOWN_FORWARDREF_CYCLES registry entries, split synthetic registry test).

## v1-1 — community: v1-1 schema workspace cohorts

- **Why:** Foundation for everything Community. 11 logical tables, partitioned messages table, full RLS plan.
- **Scope:** backend Prisma + migrations + RLS spec tests, ~900 LOC.
- **State:** queued behind P0-0B.

## v1-2 — community: v1-2 backend services REST

- **Why:** Service layer + 38 REST endpoints over the schema.
- **State:** queued behind v1-1.

## v1-3 — community: v1-3 mobile community tab

- **Why:** Mobile Community tab + The Lab + cohort feed + DM (18 screens).
- **State:** queued behind v1-2 (can develop against schema mocks earlier).
