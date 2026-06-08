# Community Build Journal — R64 Live Log

**Purpose:** Live state of every Community Expansion PR. Pushed to `tgp-agent-context` at every state change (R64 protocol) so sandbox death does not lose work-in-flight.

**Authoritative plans:**
- `STEP0_COMMUNITY_INTEGRATIONS_AND_GAPS.md`
- `COMMUNITY_PRODUCT_PLAN.md`
- `COMMUNITY_EXECUTION_PLAN.md`

**Backend HEAD at plan time:** `659e0ccc74c47f9c985a26b582987253ec9fdb40`
**Backend HEAD after preflight merges:** `0629d62cc1281c59abbbe33616b133c1f2ca1107` (P0-0A `694291b9` → P0-0B `0629d62c`)
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
| 1 | P0-0A | wearables: restore on-device ingest route | ✅ **MERGED** at `694291b9` | Opus 4.8 | GPT-5.5 (R2 PASS) | merged | `694291b9` |
| 2 | P0-0B | wearables: register cloud connectors | ✅ **MERGED** at `0629d62c` | Opus 4.8 | GPT-5.5 (R2 NEEDS_R3 → R3 fix verified) | merged | `0629d62c` |
| 3 | v1-1 | community: v1-1 schema workspace cohorts | R1 BUILT → R1 audit dispatching | Opus 4.8 (builder done) | GPT-5.5 (dispatching) | `feature/community-v1-schema` | `cd811922` |
| 4 | v1-2 | community: v1-2 backend services REST | queued | — | — | `feature/community-v1-services` | — |
| 5 | v1-3 | community: v1-3 mobile community tab | queued | — | — | `feature/community-v1-mobile` | — |

---

## Event log (most recent first)

### 2026-06-02 23:03 PT — v1-1 builder DONE; dispatching R1 audit

**PR #365 opened** at SHA `cd811922d98107edecccbf6886870e180fe2a7a0` on `feature/community-v1-schema`. https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/365

**Builder report:**
- 11 Prisma models added (CommunityWorkspace, CommunityCohort, CommunityMembership, CommunityMessage, CommunityPost, CommunityReaction, CommunityEvent, CommunityEventRsvp, CommunityChallenge, CommunityChallengeParticipation, CommunityModerationAction).
- ~25 RLS policies (coach-ALL, member-SELECT, author-write, own-row, moderation).
- Monthly RANGE partitioning of `community_messages` by `created_at`.
- `prisma validate` + `prisma generate` pass.
- Schema spec: 17 passed / 6 skipped (live-gated, no Postgres in CI).
- RLS spec: 7 passed / 5 skipped (live-gated).
- Migration: `20261212000000_community_v1_1_schema`.
- Feature flag: `FEATURE_COMMUNITY_SCHEMA` (no controllers; v1-1 is schema-only).
- R0 sweep: **R0 clean on v1-1 diff** (also verified no empty catch blocks).
- Commit author: `Dynasia G <dynasia@trygrowthproject.com>` (title-only).
- The 86 "deletions" in `schema.prisma` are pure `prisma format` whitespace realignment (with `-w`: 460 insertions, 0 real deletions).

**⚠️ Builder-flagged deviation (auditor must verify):** RLS uses repo's existing **`app.current_user_id()`** TEXT-based convention (from `prisma/migrations/rls_fitness_backend.sql`, set via `SET LOCAL`/`set_config`), **not** Supabase `auth.uid()`. Reason: the repo has no `auth.uid()` harness and `User.id` is TEXT while community `*_id` columns are `uuid`, so policies cast `uuid::text = app.current_user_id()`. Documented in the migration header, both spec headers, and the PR body. This is internally consistent with existing patterns but worth auditor confirmation that the casting and the `set_config` flow are correct.

Next: dispatch fresh GPT-5.5 R1 auditor (R31 — not the builder, not the planner). Walk the 11 models, verify RLS coverage, partition strategy, FK cascade semantics, indexes, R0 sweep, and confirm the `app.current_user_id()` decision matches existing repo policy files.

### 2026-06-02 22:44 PT — Preflight COMPLETE; dispatching v1-1 community schema builder

- **PR #364 R3 done** at `28b0b8e796ee7bf0ccc1403d630588fa37d12036`: `git mv` of garmin/whoop connector specs into `test/wearables/connectors/{garmin,whoop}/`, 4 relative imports rewritten in each file to match repo convention. Jest now discovers both files in default config (`npx jest --listTests | grep` returns both paths). 41/41 tests pass. R0 clean on R3 diff.
- **PR #364 MERGED** (squash) at backend SHA `0629d62cc1281c59abbbe33616b133c1f2ca1107`. Branch `fix/wearables-cloud-connector-wiring` deleted.
- **🎯 Both preflights DONE.** Backend HEAD: `0629d62c`. The two HK landmines from Step 0 are closed: mobile HK ingest POST route is live, 8 cloud wearable connectors are registered.
- **v1-1 community schema builder** dispatching against fresh `/tmp/build-v1-1` worktree (base `0629d62c`, branch `feature/community-v1-schema`). Builder follows planner spec at `/home/user/workspace/_community_execution_plan.md` lines 216-226 (PR scope) + lines 492-770 (Prisma models) + ~785+ (partitioned messages SQL).

### 2026-06-02 22:41 PT — PR #363 MERGED + R3 micro-fixer dispatched for #364

- **PR #363 merged** (squash) at backend SHA `694291b9f9b957e83497bcdf7d56104f04fa6ffa` via `gh pr merge`. Branch `fix/wearables-samples-ingest-route` deleted. Backend HEAD advanced: `659e0ccc...` → `694291b9...`.
- Bradley parked the RolesGuard open question: "I really dont care about the weird coach could upload their own health data for now". Tracked for later; not blocking anything.
- **PR #364 R3 micro-fixer** dispatched (Opus 4.8) against fresh `/tmp/fix-p0-0b-r3` worktree. Sole task: `git mv src/wearables/connectors/{garmin,whoop}/<conn>.spec.ts → test/wearables/connectors/{garmin,whoop}/...` so `jest.config.js roots: ['<rootDir>/test']` discovers them in default CI. Fix relative imports, run targeted Jest, commit, push.
- Next after #364 merges: dispatch **v1-1 builder** (community schema — ~900 LOC, blocks everything else).

### 2026-06-02 21:35 PT — R2 audit verdicts in

**P0-0A → PASS.** R2 auditor (fresh GPT-5.5) confirmed:
- R0 clean on R2 diff.
- Ownership/provider gate works; `IngestionService` untouched.
- RolesGuard deviation **confirmed** — fixer was right that repo enforces `owner > coach > student` hierarchy. Logged as OPEN_PRODUCT_QUESTION (not a blocker). Bradley needs to decide whether on-device HK ingest should be student-only (requires dedicated guard, follow-up PR).
- Action: **merge PR #363** via GitHub connector with confirm_action.

**P0-0B → NEEDS_R3** (narrow scope, not a code bug). R2 auditor confirmed:
- R0 clean on R2 diff.
- Production fixes all PASS: guard DI via `@Global()` module, real `WearablesModule` boots in HTTP integration test, route-level 503 flag-off proven for OAuth-start + Oura webhook, Garmin/WHOOP env now fail-loud via `requireEnv()`.
- **One blocker:** new env-hardening tests live at `src/wearables/connectors/garmin/garmin.connector.spec.ts` + `src/wearables/connectors/whoop/whoop.connector.spec.ts`. `jest.config.js:4` sets `roots: ['<rootDir>/test']` — default `npm test` doesn't discover them. Forced `--roots src` runs pass, so code is correct; CI just won't catch regressions.
- Required R3: move both `.spec.ts` files into `test/wearables/connectors/{garmin,whoop}/` (or update Jest `roots`). Trivial — ~5 minute fix.

Next:
1. Merge PR #363.
2. R64-push merged SHA.
3. Dispatch Opus 4.8 R3 micro-fixer for PR #364 (just move 2 spec files, run tests, push). Skip R3 audit — issue is mechanically verifiable by running `npx jest --listTests | grep garmin\\|whoop` after the move.
4. Merge PR #364 once R3 verified.

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
- **State:** ✅ **MERGED** at backend SHA `694291b9f9b957e83497bcdf7d56104f04fa6ffa` (squash). PR: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/363. R2 audit report: `/home/user/workspace/audit_p0-0a_r2.md`.
- **R2 fixes:** ownership/provider gate via PrismaService findMany; real `JwtAuthGuard`/`RolesGuard` runtime tests; exact throttle metadata assertions. 30/30 tests pass.
- **⚠️ Open question for Bradley (NOT blocking merge):** Repo `RolesGuard` admits coach + owner on `@Roles('student')` (documented `owner > coach > student` hierarchy). If on-device HK ingest should be student-only, a dedicated student-only guard is needed — follow-up PR.

## P0-0B — wearables: register cloud connectors

- **Why:** 8 cloud connector modules (Oura/Fitbit/Garmin/WHOOP/Polar/Strava/Wahoo/Withings) exist in `src/wearables/connectors/*` but `WearablesModule` does not import them. Plus 3 sub-landmines the planner caught: circular imports on Garmin/WHOOP, registry token mismatch (local `WEARABLE_CONNECTORS` symbols), Strava doesn't bind to registry token.
- **Scope:** backend only, ~140 LOC.
- **Files (planner spec):**
  - `src/wearables/wearables.module.ts` — import 8 modules with `forwardRef` on Garmin & WHOOP
  - `src/wearables/connectors/{garmin,whoop}/*.module.ts` — `forwardRef(() => WearablesModule)`
  - All 8 connector modules — align to canonical `WEARABLE_CONNECTORS` token + add registry binding where missing
  - `test/wearables/connector-registry.spec.ts` — assert all 8 discoverable, OAuth metadata returned, webhooks mounted
- **Feature flag:** `FEATURE_WEARABLES_CLOUD_CONNECTORS`, default false.
- **State:** ✅ **MERGED** at backend SHA `0629d62cc1281c59abbbe33616b133c1f2ca1107` (squash). PR: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/364. R2 audit report: `/home/user/workspace/audit_p0-0b_r2.md`. R3 SHA: `28b0b8e7`.
- **R2 fixes (all PASS):** R0 banned phrases removed; new `@Global() WearablesCloudConnectorsGuardModule` provides/exports the guard; new integration spec boots real `WearablesModule` and asserts 8-connector registry + route-level 503 when flag off; Garmin/WHOOP OAuth env now fail-loud via `requireEnv()`; bonus fixes (Strava `@Optional()`, KNOWN_FORWARDREF_CYCLES registry entries, split synthetic registry test).
- **R3 scope (only blocker):** Move `src/wearables/connectors/garmin/garmin.connector.spec.ts` + `src/wearables/connectors/whoop/whoop.connector.spec.ts` to `test/wearables/connectors/garmin/` + `test/wearables/connectors/whoop/` (Jest roots are `['<rootDir>/test']`). Adjust imports if needed; re-run tests; push.

## v1-1 — community: v1-1 schema workspace cohorts

- **Why:** Foundation for everything Community. 11 logical tables, partitioned messages table, full RLS plan.
- **Scope:** backend Prisma + migrations + RLS spec tests, ~900 LOC.
- **State:** R1 built → R1 audit dispatching. SHA: `cd811922d98107edecccbf6886870e180fe2a7a0`. PR: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/365. Migration: `20261212000000_community_v1_1_schema`.
- **Spec source:** `/home/user/workspace/_community_execution_plan.md` PR v1-1 section (lines 216-226), Prisma models (lines 492-770), partitioned messages SQL (lines 785+).
- **Feature flag:** `FEATURE_COMMUNITY_SCHEMA` default true after staging migration; controllers stay hidden until `FEATURE_COMMUNITY_API` (v1-2).
- **⚠️ Auditor flag:** RLS uses repo's `app.current_user_id()` TEXT convention with `uuid::text = ...` casts — not Supabase `auth.uid()`. Internally consistent with `prisma/migrations/rls_fitness_backend.sql`.

## v1-2 — community: v1-2 backend services REST

- **Why:** Service layer + 38 REST endpoints over the schema.
- **State:** queued behind v1-1.

## v1-3 — community: v1-3 mobile community tab

- **Why:** Mobile Community tab + The Lab + cohort feed + DM (18 screens).
- **State:** queued behind v1-2 (can develop against schema mocks earlier).

## R64 CHECKPOINT — Community v1-1 R2 (Path A doctrine-rename) — FIXER COMPLETE

- Old SHA: cd811922 → New SHA: b78872cf2b313992e59036ba2fd1dd634ce968cf
- Force-pushed to feature/community-v1-schema; remote == local verified via `git ls-remote`.
- Renames applied: 40 across 5 files. Reaction-token count in prisma/schema.prisma post-rename: 0.
- Emoji-roundtrip regression test added: test/community/rls/community-v1-emoji-roundtrip.spec.ts. ZWJ family emoji 👨‍👩‍👧‍👦 roundtrips byte-perfect via Prisma AND raw SQL.
- Doctrine fail-fast: PASS. R0 grep: 0 matches. Full Jest: 4218/4218 PASS, 0 fail, 2 consecutive runs idempotent.
- API URLs unchanged. Mobile client unchanged. User-facing emoji UX identical.
- Test logs: /home/user/workspace/COMMUNITY_V1-1_R2_test_run1.log + _run2.log.
- Awaiting fresh GPT-5.5 R2 auditor.
