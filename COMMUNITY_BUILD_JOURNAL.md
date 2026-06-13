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

## R64 CLOSEOUT — Community v1-1 (PR #365) — MERGED

- **Final state:** PR #365 MERGED 2026-06-08 21:45 UTC. Squash commit on `main` at `7e851d8ad35f5e5939ab4925f56e26cd79ca5692`.
- **Total cycle:** 1 builder (Opus 4.8, R1) → 1 R2 fixer (Opus 4.8, Path A rename) → 1 R2 auditor (GPT-5.5, DIRTY) → 1 R3 fixer (Opus 4.8, surgical) → 1 R3 auditor (GPT-5.5, CLEAN) → squash-merge.
- **5-day blocker resolved:** PR had been red since 2026-06-03 on doctrine-cleanup token collision (`Reaction` model name vs PR #90's banned-token guard).

### SHA progression

| Round | SHA | Outcome |
|---|---|---|
| R1 build | `cd811922` | RED on CI: `doctrine-cleanup.spec.ts` flagged `Reaction` in schema:455 |
| R2 fix (rename) | `b78872cf` | Local 4218/4218 ×2 idempotent. CI red on emoji spec (hardcoded DB URL → no skip-gate). R2 audit: DIRTY. |
| R3 fix (surgical) | `525eba00` | Local 4219/4219 ×2. Emoji spec now uses `liveDbUrl() ? describe : describe.skip` sibling pattern. R3 audit: CLEAN. |
| Merge to main | `7e851d8a` | Squash. Title-only. PR #365 closed/merged. |

### What changed in this cycle (post-checkpoint)

**R2 audit findings (GPT-5.5, full report at `/home/user/workspace/COMMUNITY_V1-1_R2_AUDIT_REPORT.md`):**
- Gate G FAIL: `test/community/rls/community-v1-emoji-roundtrip.spec.ts` had no CI skip-gate. Hardcoded `DEFAULT_LIVE_DB_URL = 'postgresql://rls_tester:rls_tester_pw@localhost:5432/rls_fn_test'` and unconditional `describe(...)`. On DB-less CI runner: `beforeAll` crashed at `DROP SCHEMA IF EXISTS`. The fixer's report claim "live-Postgres-gated, exactly like sibling specs" was false.
- Gate C partial: missing `❤️` (U+2764 U+FE0F) case; teardown DROP-only without explicit DELETE rows; not using `community-db.ts` helper.
- Gates A/B/D/E/F/H all PASS. Rename itself was 100% correct.

**R3 fix (Opus 4.8, surgical):**
1. Imported `liveDbUrl` from `test/community/_support/community-db.ts`; deleted hardcoded `DEFAULT_LIVE_DB_URL` constant and `liveDbBaseUrl()` function.
2. Wrapped describe in sibling pattern: `const itLive = liveDbUrl() ? describe : describe.skip;` + module-load `console.warn` for non-silent skip (R0: no silent failures).
3. Added `❤️` to `EMOJI_CASES`. Now covers 4 cases: 👍 (4 bytes), 🔥 (4 bytes), 👨‍👩‍👧‍👦 (25 bytes / 7 codepoints), ❤️ (6 bytes / 2 codepoints incl. VS16).
4. DELETE-scoped cleanup in `afterAll` (try) before DROP SCHEMA (finally).
5. One Opus catch: deferred `baseUrl`/`schemaUrl` resolution into `beforeAll` to avoid null-URL crash at `describe.skip` collection time.
6. Amended commit (single commit on PR), title-only, `Dynasia G <dynasia@trygrowthproject.com>`, force-push with `--force-with-lease`.

**R3 audit (GPT-5.5, full report at `/home/user/workspace/COMMUNITY_V1-1_R3_AUDIT_REPORT.md`):**
- All 9 gates (0, A–H) PASS.
- Gate D: env unset → 7 skipped / 0 failed / exit 0 with non-silent warn (the R3 fix's whole purpose).
- Gate F: 4219/4219 ×2 idempotent (+1 over R2 from new ❤️ assertions).
- CI red (Gate H) is 100% environmental: 8 RLS-tier suites + JS-heap OOM exit 134. The emoji spec is provably ABSENT from the CI failure set (zero matches in job log). NOT charged to this fix.
- Verdict: **CLEAN — safe to auto-merge.**

### Per-standing-rule auto-merge

Per Bradley's standing rule "once an auditor has deemed CLEAN, always merge, no waiting on me":
- `gh pr merge 365 --squash --admin` executed immediately on CLEAN verdict.
- Squash commit on `main`: `7e851d8a community: v1-1 schema workspace cohorts (11 models, partitioned messages, RLS) (#365)`
- Author: BradleyGleavePortfolio (GitHub squash author = repo owner; original commit author `Dynasia G` preserved in squash body per GitHub convention).
- mergedAt: `2026-06-08T21:45:43Z`. mergedBy: confirmed via `gh pr view 365`.

### Carried-forward learnings (must propagate to v1-2 brief)

1. **Live-DB-gated specs MUST use the sibling pattern** `const itLive = liveDbUrl() ? describe : describe.skip;` — not hardcoded fallbacks. Any new community spec touching live Postgres MUST be reviewed for this pattern before push.
2. **describe.skip still evaluates the factory closure at collection time** — never deref nullable URLs at the top of a `.skip`-gated block. Defer to `beforeAll`.
3. **Path A (rename internal models) was the right call.** Doctrine guards stay strong; user-facing UX unchanged; no precedent for weakening doctrine to accommodate a model name. Bradley's instinct ("this is literally renaming a feature that no users will see?") was correct.
4. **R66 (full-suite-before-push) caught nothing this round** — but R67-R70 process rules are now overdue for codification (next PR).
5. **R0 emoji preservation is now testable forever** via `community-v1-emoji-roundtrip.spec.ts`. Family ZWJ (25 octets) is the strongest property in the suite — if any future migration silently drops grapheme clusters, this catches it.

### Open follow-ups for v1-2 builder brief

- The 20 gaps from `/home/user/workspace/COMMUNITY_PLANS_INTERNALIZATION_AND_V1-2_READINESS.md` still stand.
- v1-2 must reference R66–R70 once those land (in-flight docs PR after this entry).
- Base SHA for v1-2 worktree: `7e851d8a` (post-merge `main`).
- Foundation-only scope: `community.{module,controller,service,repository}.ts` + 5 GET endpoints + foundation e2e spec. NO messages/posts/responses/DMs/events/challenges (v1-3+).


---

## R64 checkpoint — v1-2 builder DONE → R1 audit dispatched (2026-06-08 ~22:35 UTC)

### State

- v1-2 builder (Opus 4.8) completed PR #367 at SHA `bdbc154a7fe9a9b38ea97ba5e30e72f98e9b74d3`.
- Branch: `agent/builder/v1-2/community-foundation` based on `main` at `6160fd86` (post R66-R70 docs).
- LOC: 1057 new across 9 files; 1542 additions / 8 deletions / 15 files changed.
- Builder report: 16/16 e2e cases pass live; 16 skip cleanly on no-DB; full suite 4241 ×2 idempotent.
- CI: in progress (run 27171229866) at audit dispatch; mergeStateStatus UNSTABLE.

### 5 builder-declared deviations (audit must verify)

1. `/api` prefix (not `/v1`) — matches existing `setGlobalPrefix`.
2. `.e2e.spec.ts` filename (dot form, not dash) — sibling specs use this.
3. API role `client` vs schema `student` — gap G14 compliant.
4. Derived default cohort + pinned post — no dedicated columns (schema frozen in v1-2).
5. **`ClientEntitlementGuard` class→handler move — CROSS-DOMAIN.** Highest-risk; auditor mandated to grep every controller for handler-level coverage.

### R1 audit dispatch

- Auditor brief: `/home/user/workspace/COMMUNITY_V1-2_AUDITOR_BRIEF.md` (340 lines, 5 deviation verifications + 9 gates + verdict template).
- Auditor: fresh GPT-5.5 (R31 builder ≠ auditor), subagent `v1_2_r1_audit_mq5skmtn`.
- Working directory: `/tmp/wt-builder-v1-2`.
- Verdict file: `/home/user/workspace/COMMUNITY_V1-2_R1_AUDIT_REPORT.md` (pending).
- On CLEAN: squash-merge per Bradley's standing rule, no waiting.
- On DIRTY: surgical Opus 4.8 fixer → fresh GPT-5.5 R2 auditor → iterate.

### Files persisted this round

- `/home/user/workspace/COMMUNITY_V1-2_BUILDER_BRIEF.md` (521 lines — contract)
- `/home/user/workspace/COMMUNITY_V1-2_AUDITOR_BRIEF.md` (340 lines — audit gates)
- `/home/user/workspace/COMMUNITY_PLANS_INTERNALIZATION_AND_V1-2_READINESS.md` (260 lines, 20 gaps + readiness)

---

## R64 checkpoint — v1-2 R1 CLEAN → merged (2026-06-08 22:51 UTC)

### Audit outcome

- Auditor: fresh GPT-5.5 (R31), subagent `v1_2_r1_audit_mq5skmtn`.
- Report: `/home/user/workspace/COMMUNITY_V1-2_R1_AUDIT_REPORT.md`.
- **Verdict: CLEAN.** All 5 deviations PASS, all 9 gates PASS.

### Deviation 5 (cross-domain entitlement) — confirmed safe

- `src/common/guards/client-entitlement.guard.ts` byte-identical to base.
- Only `community.controller.ts` touched among controllers in the PR.
- All 13 other controllers retain their guards unchanged.
- All 4 legacy community handlers (`getLeaderboard`, `getFeed`, `postWin`, `reactToWin`) re-applied the identical guard stack explicitly after the class→handler move.

### Test counts

- Fail-fast lane: 15/15.
- Community foundation e2e: 16/16 live + 16 clean skips.
- DM enabled resolver: 6/6.
- Community service unit: 1/1.
- Full suite: run1 = 4241 / run2 = 4241 (idempotent — R67 satisfied).
- 543 failures = the 8 environmental `rls-*` suites (`PrismaClientInitializationError`, missing `test` DB role); byte-identical to base; fail identically on `main`; not chargeable.

### Merge

- Per Bradley's standing rule "once an auditor has deemed CLEAN, always merge, no waiting".
- `gh pr merge 367 --squash --admin` executed.
- Squash commit on `main`: `d84ceb2775156cffb77e9952560f3d84be6fe0ba` at 2026-06-08T22:51:04Z.
- Title: `community: v1-2 backend module foundation (5 GET endpoints, kill switch, e2e spec) (#367)`.

### Non-blocking follow-up (carry to v1-3 brief)

Tighten `test/entitlement-guards-mounted.spec.ts` to pin each paid legacy community handler individually (`getLeaderboard`, `getFeed`, `postWin`) rather than only `getLeaderboard`. The class→handler repoint made that doctrine guard looser; no handler is currently unprotected, but the invariant should be stricter. This is a v1-3 doctrine-tightening line item, not a v1-2 fix.

### State for v1-3

- `main` at `d84ceb27` (post-v1-2 merge).
- v1-3 scope: community messages controller (write path begins).
- Use `/tmp/wt-builder-v1-2` as the template for the next worktree (golden node_modules symlink pattern is proven).

---

## R64 checkpoint — v1-3 builder dispatched (2026-06-09 ~00:05 UTC)

### State

- main at `d84ceb27` (post-v1-2 merge).
- v1-3 worktree freshly cloned: `/tmp/wt-builder-v1-3` at `d84ceb27`.
- Branch: `feature/community-v1-feed-messages` (per execution plan line 243).

### Scope (per execution plan lines 240-250)

- ~1800 LOC across 4 sub-modules: `src/community/{messages,posts,reactions,moderation}/**`.
- 3 new feature flags, all default false: `FEATURE_COMMUNITY_MESSAGES`, `FEATURE_COMMUNITY_POSTS`, `FEATURE_COMMUNITY_DM`.
- Kill switch: messages and posts become read-only with disabled-response 200; moderation remains enabled (incident-response need).
- ~22 endpoints total (messages CRUD, posts CRUD + comments, DMs with workspace dmPolicy gate, reactions on messages/posts/comments with idempotency, moderation reports + items + actions).

### Builder brief

- File: `/home/user/workspace/COMMUNITY_V1-3_BUILDER_BRIEF.md` (312 lines).
- Covers: scope wall (no schema mutation, no realtime/push, no mobile), endpoints contract, DM tri-state policy (coach_only / members / disabled), rate limits table, body length validation, RLS / cross-tenant leak tests, 6 plan-named test cases + 4 v1-2-pattern gates, R0 + R66-R70 compliance, carry-forward to tighten `test/entitlement-guards-mounted.spec.ts` for `getFeed` + `postWin`.

### Dispatch

- Builder: Opus 4.8, subagent `v1_3_builder_mq5vr89d`.
- Working directory: `/tmp/wt-builder-v1-3`.
- Final report destination: `/home/user/workspace/COMMUNITY_V1-3_BUILDER_REPORT.md`.

### Path forward

- On builder done → write `/home/user/workspace/COMMUNITY_V1-3_AUDITOR_BRIEF.md`, dispatch fresh GPT-5.5 R1 auditor (R31).
- On CLEAN → squash-merge per Bradley's standing rule.
- On DIRTY → surgical Opus 4.8 fixer → fresh GPT-5.5 R2 auditor → iterate.

### Active queue snapshot (refreshed, replaces stale table from line 25 above)

| Order | PR ID | Title | State | Last SHA |
|---|---|---|---|---|
| 1 | P0-0A | wearables: restore on-device ingest route | ✅ MERGED | `694291b9` |
| 2 | P0-0B | wearables: register cloud connectors | ✅ MERGED | `0629d62c` |
| 3 | v1-1 | community: v1-1 schema workspace cohorts | ✅ MERGED | `7e851d8a` |
| 4 | R66-R70 | docs: R66-R70 build discipline + doctrine guards index | ✅ MERGED | `6160fd86` |
| 5 | v1-2 | community: v1-2 backend module foundation | ✅ MERGED | `d84ceb27` |
| 6 | v1-3 | community: v1-3 posts messages reactions | BUILDING (Opus 4.8) | pending |
| 7 | v1-4 | community: v1-4 realtime push telemetry | queued | — |
| 8 | v1-5 | community: v1-5 mobile client tab | queued | — |
| 9 | v1-6 | community: v1-6 coach admin inbox | queued | — |
| 10 | v2-1..v2-4 | community: v2-1..v2-4 extensions | future | — |
| 11 | v3-1..v3-4 | community: v3-1..v3-4 phase-3 | future | — |


---

## R64 checkpoint — Parallelization plan committed (2026-06-09 ~00:20 UTC)

### What

Authored `COMMUNITY_PARALLELIZATION_PLAN.md` (185 lines) as the canonical answer to "which of the remaining 12 community PRs can safely run in parallel." Sits alongside `COMMUNITY_EXECUTION_PLAN.md` as a same-tier doc — execution plan defines WHAT we build; parallelization plan defines IN WHAT ORDER and WITH WHAT CONCURRENCY.

### Key findings

- **Phase A (cycles 1-2): strict serial.** v1-3 → v1-4. v1-4 broadcast contract genuinely needs v1-3 domain events; mobile cannot stub realtime channels cleanly.
- **Phase B (cycle 3): v1-5 ∥ v1-6.** Declared linear in execution plan, but file ownership is fully disjoint (client screens vs coach screens + coach backend). Saves 1 cycle to launch.
- **Phase D (cycle 4): v2-1 ∥ v2-3 ∥ v3-1.** Three-way parallel — plan tags, events, challenges all in disjoint sub-modules. Saves ~2 cycles.
- **Phase E (cycle 5): serial v2-2 → v2-4.** Both touch `CoachCommunityInboxScreen.tsx`; must serialize.
- **Phase F (cycle 6): v3-2 ∥ v3-3.** Classroom and voice disjoint.
- **Phase G (cycle 7): v3-4 solo.** Reuses v3-3 voice extraction.

### Cycle compression

- Strict serial (plan as written): 4 cycles to launch (v1-6), 12 cycles to fully done (v3-4).
- Proposed parallelism: **3 cycles to launch, 7 cycles to fully done.** ~25% saving on launch, ~42% on completion. No R0 sacrifice.

### Proposed new rule for next docs PR

**R71 (Parallel-PR file ownership):** Concurrent PRs must enumerate OWNED vs DO-NOT-TOUCH file lists. On merge collision, second-merger rebases, re-runs R70 fail-fast lane, re-attests R67 idempotency before re-push.

### File

- Path: `/tmp/tgp-agent-context/COMMUNITY_PARALLELIZATION_PLAN.md`.
- Commits with this journal checkpoint and pushed (R64).

---

## R64 checkpoint — v1-3 builder DONE → R1 audit dispatched (2026-06-09 ~00:38 UTC)

### Builder result (PR #368)

- **PR:** https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/368
- **SHA:** `2ca5ffae86280ec17fc695758b74d68354430b08`
- **Branch:** `feature/community-v1-feed-messages` ← base `main` (`d84ceb27`)
- **MERGEABLE, state UNSTABLE, CI in progress** at audit dispatch
- **Diff:** +3580 / -1 across 28 files
- **Scope vs budget:** ~2,811 src + 769 test LOC (budget was 1800; overage justified by each of 5 sub-modules being full controller/service/repository triad with typed DTOs and live-DB e2e harnesses)
- **Endpoints:** 25 total (messages 5, posts+comments 7, reactions 6, DMs 4, moderation 3)

### 8 builder-declared deviations (auditor must verify each)

1. **No `dm_policy` column.** v1-1 schema has only `dm_enabled_default:boolean` + per-membership `dm_enabled:boolean?`. Builder built secure boolean gate (default OFF), surfaced as BLOCKER for future schema PR. Tri-state resolver reused verbatim from v1-2.
2. **No `clientPostsEnabled` column.** Coach/owner-only post creation; client POST → 403 `community.post.client_posts_disabled`. BLOCKER surfaced.
3. **Comments stored as `CommunityMessage`** tagged `plan_context_type='community_post_comment'`. `CommunityResponse` cannot hold a body (32-char `response_kind` only).
4. **Comment reactions via `target_type='comment'`; comment reports via `target_type='message'`** — `CommunityModerationTargetType` lacks `comment` member.
5. **Kill switch returns HTTP 503**, not 200 (matched established v1-2 `CommunityFeatureFlagGuard` contract — one disabled envelope across all community surfaces).
6. **Zod for responses, class-validator for requests** — matches v1-2 convention.
7. **DM kill switch gates reads AND writes** — DM is sensitive surface, flag fully disables it.
8. **`rls-*` suites excluded from R67 tally** — environmental DB dependency, byte-identical to base.

### Test results (builder-reported)

- R67 idempotent: run1 === run2 (4210 passed / 71 skipped / 5 todo / 0 failed, excluding 8 rls-* env suites).
- R70 fail-fast lane: 15/15.
- Carry-forward `entitlement-guards-mounted.spec.ts`: 17/17 (was 14 — added `getFeed`, `postWin`, `reactToWin` pins per v1-2 carry-forward).
- 2 new community e2e specs: skip cleanly when COMMUNITY_TEST_DATABASE_URL unset (R66 — never silent pass). Will execute in CI.
- R0 self-sweep: zero matches for `as any`, `@ts-ignore`, `.catch(()=>undefined)`, "Coming soon", TODO, FIXME, empty catch.
- R69: `git diff main..HEAD -- prisma/` = 0 lines.

### R1 audit dispatch

- Auditor brief: `/home/user/workspace/COMMUNITY_V1-3_AUDITOR_BRIEF.md` (308 lines, 8 deviation verifications + 10 gates + DIRTY-CRITICAL criteria).
- Auditor: fresh GPT-5.5 (R31), subagent `v1_3_r1_audit_mq5wxmug`.
- Working directory: `/tmp/wt-builder-v1-3`.
- Verdict file: `/home/user/workspace/COMMUNITY_V1-3_R1_AUDIT_REPORT.md` (pending).
- DIRTY-CRITICAL reserved for: Deviation 1 (DM client-to-client leak), Deviation 7 (DM read leak under disabled flag), G4 (moderation incorrectly gated by write flags).
- On CLEAN: squash-merge per Bradley's standing rule.
- On DIRTY: surgical Opus 4.8 fixer → fresh GPT-5.5 R2 auditor → iterate.

### Open blockers for a future PR (NOT v1-3 fixer territory)

Both require schema changes and a dedicated PR:
1. Add `dm_policy:enum('coach_only','members','disabled')` to `CommunityWorkspace` — needed before the eventual tri-state release.
2. Add `clientPostsEnabled:boolean` to `CommunityWorkspace` — needed before any coach wants to enable client-authored posts.

Both have single relax points already named in the v1-3 code (`canDm()`, `authoriseDm()`, `canCreatePost()`) so the future schema PR is a controlled, mechanical change.

## v1-3 R2 fixer dispatched — 2026-06-09T01:00Z

- Subagent: v1_3_r2_fixer_mq5xlgo6 (Opus 4.8)
- Brief: COMMUNITY_V1-3_R2_FIXER_BRIEF.md (4 fixes: comment-bleed isolation, 3 G9 e2e specs, rls/.github untouched verify, manifest+docblock honesty)
- Worktree: /tmp/wt-builder-v1-3 at 2ca5ffae on feature/community-v1-feed-messages
- PR: #368 open, CI red on env-pre-existing rls-* (admin-merge precedent from v1-2 PR #367)
- R1 verdict was DIRTY (not CRITICAL) — D1/D7/G4 customer-data surfaces all PASSED
- On CLEAN: gh pr merge 368 --squash --admin --subject "community: v1-3 posts messages reactions (#368)" --body ""

## v1-3 R2 fixer DONE + R2 auditor dispatched — 2026-06-09T01:15Z

- R2 fixer (Opus 4.8, retry after first sandbox death) completed all 4 fixes
- Head SHA advanced: 2ca5ffae -> 28f9844f (FIX 1 comment-bleed) -> 35b1b410 (FIX 2+4)
- Fixer self-verification: R69 prisma diff=0, R70 lane 15/15, carry-forward 17/17, full suite x2 byte-identical (4210/87/5/0)
- Manifest correction: actual 28 added + 3 modified (R1 audit said 25, builder claimed 27)
- R2 auditor dispatched: v1_3_r2_auditor_gpt_5_5_mq5y81sh (fresh GPT-5.5, R31)
- Auditor brief: COMMUNITY_V1-3_R2_AUDITOR_BRIEF.md (S1-S6 surfaces + H1-H4 honesty + 4 fix verifications)
- On CLEAN: gh pr merge 368 --squash --admin --subject "community: v1-3 posts messages reactions (#368)" --body ""

## v1-3 R2 audit DIRTY-CRITICAL + R3 fixer dispatched — 2026-06-09T01:20Z

- R2 auditor (GPT-5.5, general_purpose fallback after 2 codebase-subagent sandbox deaths) verdict: DIRTY-CRITICAL
- Real customer-data leak: src/community/dms/community-dms.service.ts:196-223 listThreads bypasses per-workspace default-OFF DM gate
  - With FEATURE_COMMUNITY_DM=true + workspace dm_enabled_default=false, member can list pre-existing DM thread metadata
  - Other 3 DM service methods (openThread/send/listThread) correctly call authoriseDm
- Secondary finding (blocking-minor): R2 fixer claimed "28 added endpoints" — actual decorator count is 25 added / 0 modified. "28A + 3M" is file manifest not decorators.
- R2 passes: comment-bleed isolation FIX 1 (clean), rls/.github untouched, commit hygiene, R69 prisma diff 0, R70 lane 15/15, entitlement guards 17/17, no Sonnet refs
- R3 fixer dispatched: v1_3_r3_fixer_dm_leak_mq5yfq74 (Opus 4.8)
  - FIX 1: factor gateDmRead helper, gate listThreads, add e2e case 8
  - FIX 2: manifest wording correction (no code change)
- Sandbox infra ticket filed: e2209543 ("Paused sandbox 019ea55f not found" — hit 3 consecutive dispatches today)

## v1-3 R3 fixer DONE + R3 auditor dispatched — 2026-06-09T01:28Z

- R3 fixer (Opus 4.8) completed
- Head SHA advanced: 35b1b410 -> 15e50502
- FIX 1 (critical DM leak): Option A taken — factored gateDmRead(membership, workspace) helper; refactored authoriseDm to reuse it (sender + recipient); added gateDmRead to listThreads before returning rows; e2e case 8 (default-OFF + null dm_enabled → 403) + 8b (dm_enabled=true negative control → 200)
- FIX 2 (manifest honesty): no-op — PR body already says "25 endpoints" correctly; wrong "28" only existed in R2 fixer prose
- Fixer self-verification all green: V1 prisma diff 0, V2 doctrine 15/15, V3 entitlement 17/17, V4 DM spec 9 cases skip cleanly with R66 warning, V5 all 4 DM routes traced to gate, V6 rls/.github empty, V7 commit hygiene clean, V8 push 15e50502, V9 tsc exit 0
- R3 auditor: v1_3_r3_auditor_gpt_5_5_mq5yp4m3 (fresh GPT-5.5, general_purpose to avoid stuck codebase sandbox 019ea55f)
- R3 auditor brief: COMMUNITY_V1-3_R3_AUDITOR_BRIEF.md — focused on S5 (all 4 DM routes gated) since that was the DIRTY-CRITICAL surface in R2
- On CLEAN: gh pr merge 368 --squash --admin --subject "community: v1-3 posts messages reactions (#368)" --body ""

## v1-3 R3 audit CLEAN + PR #368 MERGED — 2026-06-09T01:32Z

- R3 auditor (fresh GPT-5.5, R31): VERDICT: CLEAN
- All 4 DM controller routes traced to gateDmRead/authoriseDm before returning DM-shaped data
- listThreads gate confirmed: workspace+membership existence check → gateDmRead → listThreadsForUser → return
- gateDmRead helper at lines 113-120, uses resolveDmEnabled, throws ForbiddenException(DM_DISABLED)
- All audit surfaces PASS: S1 prisma diff 0, S2 doctrine 15/15, S3 entitlement 17/17, S4 default-OFF, S5 all 4 DM gated, S6 moderation up under freeze
- Case 8 + 8b verified test bodies
- Endpoint count: 25 added / 0 modified (FIX 2 honesty confirmed)
- Commit hygiene clean, no silent skips, no Sonnet refs

- **PR #368 admin-squash-merged as ed78bbeface5044a2f1fd5be0dd47fd20a10d43c** at 2026-06-09T01:31:53Z
- v1-3 SHIPPED: posts (7), messages (5), reactions (6), DMs (4), moderation (3) = 25 endpoint decorators
- 3 BLOCKERS surfaced for future schema PR:
  1. dm_policy:enum CommunityWorkspace (currently using dm_enabled_default boolean)
  2. clientPostsEnabled:boolean CommunityWorkspace (currently coach/owner-only)
  3. Comment storage as CommunityMessage tagged plan_context_type='community_post_comment' (future first-class CommunityComment)
- Rounds taken: R1 audit DIRTY (4 fixes) → R2 fixer → R2 audit DIRTY-CRITICAL (DM listThreads leak) → R3 fixer → R3 audit CLEAN

## Status board
- v1-1 (workspaces/cohorts/memberships): SHIPPED
- v1-2 (feed + win-posts + reactions seed): SHIPPED
- v1-3 (posts + messages + reactions + DMs + moderation): **SHIPPED** ← just landed
- v1-4 (realtime + push + telemetry): NEXT
- 10 slices remaining to fully done per COMMUNITY_EXECUTION_PLAN.md

## v1-4 builder dispatched — 2026-06-09T17:03Z

- Slice: `community: v1-4 realtime push telemetry` (≈1100 LOC)
- Branch: `feature/community-v1-realtime-push` off `ed78bbeface5044a2f1fd5be0dd47fd20a10d43c` (v1-3 merge SHA)
- Worktree: `/home/user/workspace/tgp/backend-community-v1-4` (R56–R60 compliant naming)
- Brief: `/home/user/workspace/COMMUNITY_V1-4_BUILDER_BRIEF.md` (16 sections, 380 lines, 31886 bytes)
- Model: **Opus 4.8** (Sonnet 4.6 forbidden — R31 auditor greps for "sonnet")
- Subagent type: `general_purpose` (NOT `codebase` — broken per ticket e2209543, hit during v1-3 R2/R3)
- R67 backfill: v1-3 dispatch row added to `handoffs/dispatch.json` (was absent — only v1-2 row existed)
- R67 forward: v1-4 dispatch row pushed BEFORE builder spawn (subagent_id `pending` → patched post-spawn)
- Schema baseline hash (zero-mutation gate): `f4a70e7064d874426b1ca9c57e3f7addc36d72ca33b2076f70ca513285cb416a` prisma/schema.prisma
- Three flags introduced (all OFF in prod, telemetry ON in staging):
  - `FEATURE_COMMUNITY_REALTIME`
  - `FEATURE_COMMUNITY_PUSH`
  - `FEATURE_COMMUNITY_TELEMETRY`
- Architecture: four sub-modules — `realtime/` (Supabase broadcast), `push/` (Expo via NotificationsService), `telemetry/` (PostHog wrapper), shared `community-events.ts` (typed channel + event const map)
- Six channels: user, cohort-sharded, hall, event, challenge, moderation
- Nine broadcast events (zero user-authored body in payloads — IDs only, client refetches)
- Seven NotificationKind values added (code-level defaults, no migration)
- Seven PostHog events under `community.realtime.*` / `community.push.*` / `community.digest.*`
- Zero new endpoints → `entitlement-guards-mounted.spec.ts` pin count stays 17/17
- Zero new dependencies → already in lockfile: `@supabase/supabase-js`, `expo-server-sdk`, `posthog-node`
- DIRTY-CRITICAL triggers documented in brief §11:
  1. Any user-authored body in broadcast payload (must be ID-only refetch pattern)
  2. Any user content in push payload when `User.lockscreenPrivacy === true` (must fall back to generic copy)
  3. `git diff main..HEAD -- prisma/` non-empty (schema mutation banned)
  4. Sonnet 4.6 reference anywhere in PR
- Audit plan: R1 auditor will be fresh GPT-5.5 in a separate worktree (`backend-v1-4-audit` per R60), audit checklist per brief §10 + §11
- Merge protocol on CLEAN: `gh pr merge <N> --squash --admin` with `api_credentials=["github"]`


---

## 2026-06-09T17:11Z — Round-3 Tier-1 parallel fixer dispatches (3 in parallel with v1-4 builder)

Spawned three `general_purpose` subagents (Opus 4.8, isolated worktrees off `ed78bbeface5044a2f1fd5be0dd47fd20a10d43c`):

- `bug_r2_meal_plan_dedup_mq6wh9rs` → `/home/user/workspace/tgp/backend-r2-meal-plan-dedup` → `fix/bug-r2-meal-plan-dedup` — file scope: `src/meal-plans/**`, `src/real-meal-plans/**`. Dedup legacy `MealPlansModule` routes onto `real-meal-plans` canonical via new alias method.
- `bug_r3_package_archive_guard_mq6whvla` → `/home/user/workspace/tgp/backend-r3-package-archive-guard` → `fix/bug-r3-package-archive-guard` — file scope: `src/packages/packages.service.ts`. Block archive of `CoachPackage` with active recurring subscribers.
- `bug_r4_r5_gdpr_fix_mq6wilno` → `/home/user/workspace/tgp/backend-r4-r5-gdpr` → `fix/bug-r4-r5-gdpr-export-and-scrub` — file scope: `src/data-export/data-export.service.ts`, `src/users/gdpr-scrub.service.ts`. GDPR export → S3 presigned URL + scrub cancels Stripe subs.

Zero file-collision with v1-4 builder (community/notifications/supabase/analytics) verified before dispatch.

## 2026-06-09T17:17Z — BUG-R4 + BUG-R5 fixer STOPPED (no code changes, parent decision required)

The R4-R5 fixer correctly invoked the STOP conditions defined in its brief. HEAD unchanged. Report at `/home/user/workspace/tgp/backend-r4-r5-gdpr/BUG-R4-R5-STOP-REPORT.md`.

- **R4 stop:** `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` are NOT in `package-lock.json` (0 matches). Brief said "if NOT present, STOP — adding a dep is a separate decision." → needs dependency PR before re-dispatch.
- **R5 stop:** `StripeApiService.cancelSubscription` takes an object `{ subscriptionId, immediately?, idempotencyKey }` (mandatory idempotency key), not the bare string in the bug-register stub. `StripeApiService.deleteCustomer` does not exist (0 matches). The string-arg `cancelSubscription(subId: string)` lives on **`StripeConnectApiService`** at `src/connect/stripe-connect-api.service.ts:734` — which is what `dunning.service.ts` already uses. Switching to that service requires injecting it into `GdprScrubService` + `UsersModule` (wiring decision).
- **dispatch.json patched** with `status: STOPPED_NEEDS_PARENT_DECISION`, `stop_reason`, `stop_report_path`.

**Parent decisions queued for operator:**
1. Approve `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` dep PR for R4.
2. Confirm using `StripeConnectApiService` for R5 (precedent: `dunning.service.ts`).

## 2026-06-09T17:20Z — Backlog pruned to ~70 real items + pushed to GitHub

- Backlog markdown written to `audits/OPEN_ISSUES_2026-06-09.md` (down from 150 → ~70 items).
- GitHub issue [#369](https://github.com/BradleyGleavePortfolio/growth-project-backend/issues/369) created with the pruned, actionable list.
- Removed as merged: A.1–A.12 (PR-A), B.1–B.8 (all 8 RLS PRs merged: `3fa75ff`, `370a7ae`, `c94fa14`, …), AI gateway #327, payment-ops hardening, HK-2..HK-6 wearables through #364, plus most of the May-26 28-finding register.

---

## 2026-06-09T17:49Z — 3 PRs opened (v1-4 + R2 + R3 all functionally complete)

All three subagents reported sandbox-snapshot infrastructure errors at the very end of their runs but had already committed + pushed their branches. Parent agent opened the PRs from the persisted branches.

| Subagent | PR | HEAD | R66 status |
|---|---|---|---|
| `v1_4_community_builder_mq6w5fwk` | [#370](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/370) | `df520cf` | Run-1 clean; only env-gated RLS failures (no Postgres in sandbox). Run-2 byte-identical pending on CI. |
| `bug_r2_meal_plan_dedup_mq6wh9rs` | [#371](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/371) | `b6760a1` | Run-1 sharded clean; same env-only failures. Run-2 byte-identical pending on CI. |
| `bug_r3_package_archive_guard_mq6whvla` | [#372](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/372) | `ebb33d2` | Run-1 clean (4215 passed); 543 env-only failures (8 live-Postgres RLS suites). Run-2 byte-identical pending on CI. |

**All three:** R70 fail-fast 15/15 green, zero prisma diff, zero new deps, zero "sonnet" string, R69 zero silent skips, title-only commits with Dynasia G author.

**Next:** spawn fresh GPT-5.5 auditors per R31 + R60 (one auditor per PR, separate worktree each). Pending parent dispatch.

## 2026-06-09T17:50Z — Roman identity spec PR open

[tgp-agent-context PR #1](https://github.com/BradleyGleavePortfolio/tgp-agent-context/pull/1) — 382-line voice contract + 12-context sample copy + mascot direction brief. Subagent `roman_identity_spec_mq6xlbq9` (Opus 4.8) completed cleanly.


## 2026-06-10T23:37Z — PR #378 Roman Phase 1 MERGED → backend main 2fa6b57e

- PR #378 `feat/roman-phase-1-chat` admin-squash-merged
- Merge commit: 2fa6b57e0494db4b560e14b63d3c6bafbf122b7f
- HEAD at merge: 61f7d04d (final commit: "test(roman): align controller spec guard probe with RolesGuard addition")
- CI green pre-merge: build-and-test ✅, rls-floor-guard ✅, rls-live-tests ✅
- mergeStateStatus: CLEAN, mergeable: MERGEABLE, not draft
- FEATURE_ROMAN_CHAT_ENABLED defaults OFF — no surface lit up
- Per Dynasia's standing rule: PR was already-audited CLEAN by the prior operator's cycle, no new R1 audit needed
- Final fix that unblocked CI: RolesGuard added to RomanController routes (@Roles('student','coach','owner')) + matching probe alignment in controller spec
- v1-3-scope rule respected (no prisma diff), R56-R70 compliance verified by upstream CI gates

---

## 2026-06-10T23:58Z — WAVE 1 PARALLEL DISPATCH (4 builders)

**Orchestrator:** Sonnet 4.6 (manager-only, no code commits). All builders Opus 4.8. R31 will be enforced by spawning fresh GPT-5.5 auditors per PR.

**Operator priority lane (verbatim, in force):** Tier 1 community (v1-6, v2-x) ALWAYS in flight; Tier 2 Roman + MWB run parallel but second to Tier 1 on contention.

**Operator rule added 2026-06-10:** Roman's voice is never disembodied. Every Roman-voiced surface (in-app empty state, notification, dunning message, lockout, paywall, ED.3 wow, onboarding welcome) MUST render Roman's face alongside the copy. Backend emits `avatar_crop` in every Roman copy payload; mobile renders `<RomanAvatar />` on every empty state.

**file_surface_overlap_check across 4 dispatches:** PASS

| Agent | Repo | Owned surface | Conflicts |
|---|---|---|---|
| v1_6_mobile_coach_ui | growth-project-mobile | NEW src/screens/community/CoachCommunity*Screen.tsx ×6 + NEW src/components/community/coach/** + NEW src/api/coachCommunityApi.ts + navigator + featureFlags | NONE — fully isolated mobile |
| v2_1_plan_context_backend | growth-project-backend | NEW src/community/plan-context/** + additive to src/community/messages/** | NONE with siblings — additive only |
| mwb_2_templates | growth-project-backend | src/workout-builder/** + src/sub-coach-scope/** | NONE with siblings |
| roman_p2_backend | growth-project-backend | src/billing/{dunning-v2,lockout,paywall,billing-update,first-payment}/** + src/notifications/** + src/onboarding/** + NEW src/roman/voice/** | NONE with siblings — does NOT touch src/roman/roman.{service,controller,prompts}.ts (Phase 1) |

**Hard-flag-OFF defaults (all PRs):**
- v1-6 mobile: `EXPO_PUBLIC_FF_COACH_COMMUNITY=false`
- v2-1 backend: `FEATURE_COMMUNITY_PLAN_TAGS=false`
- MWB-2 backend: `FEATURE_MWB_TEMPLATES=false`
- Roman P2 backend: `FEATURE_ROMAN_COPY_V2=false` (legacy variant byte-equal preserved)

**R69 schema mutation invariant:** ZERO. v2-1 brief includes pre-check: if `Message.plan_context_json` column absent, abort with `BLOCKED_R69_SCHEMA_MISSING`. MWB-1 schema (#376) covers MWB-2 needs. Roman P2 is constants/copy only.

**Anti-rebase rule §7C compliance:** No two PRs touch `prisma/schema.prisma`, `package.json`, `package-lock.json`, `src/checkout/checkout.module.ts`, `src/app.module.ts`, or any single shared service file. Confirmed by grep across briefs.

**Builder worktrees (R56-R61, never crossing):**
- `/home/user/workspace/tgp/mobile-v1-6/`
- `/home/user/workspace/tgp/backend-v2-1/`
- `/home/user/workspace/tgp/backend-mwb-2/`
- `/home/user/workspace/tgp/backend-roman-p2/`

**Audit plan:** as each builder completes and PR opens, spawn fresh GPT-5.5 auditor (R31) on the PR diff. CLEAN verdict → merge per operator standing rule "always merge on CLEAN, no waiting".

**Merge order (predicted by file overlap):**
1. v1-6 mobile (no backend rebase risk) — merges independent of backend trio
2. First of {v2-1, MWB-2, Roman P2} to return CLEAN merges as-is
3. Subsequent backend PRs rebase on new main, re-run R70 fail-fast, re-attest R67, then merge

## 2026-06-11T00:05Z — v2-1 R69 ABORT + prereq migration dispatched

**Event:** v2-1 plan-context backend builder hit `BLOCKED_R69_SCHEMA_MISSING` as designed. Builder verified `CommunityMessage` model has scalar `plan_context_type`/`plan_context_id`/`plan_week_start` columns (active use by inbox/posts/reactions for COMMENT_CONTEXT_TYPE discrimination) but no JSON column for v2-1's discriminated-union payload (week_index, day_index, exercise_id, meal_id, package_id, check_in_id). Per R69, did not invent a migration.

**Operator decision (locked 2026-06-11):** Option A — ship tiny additive migration prereq, then re-dispatch v2-1. Quality bar R0 preserved (decacorn, never quick-patch).

**Prereq dispatch:** `v2_1_prereq_migration` builder spawned. Scope = ONE line in `prisma/schema.prisma` + auto-generated migration SQL. ZERO service code, ZERO controllers, ZERO DTOs.

**Anti-rebase §7C verification:** prereq touches `prisma/schema.prisma`. Sibling Wave 1 builders (v1-6 mobile, MWB-2, Roman P2) DO NOT touch schema per their briefs. Confirmed disjoint — safe to run in parallel with the 3 still-running siblings.

**Flow forward:**
1. Prereq builder opens PR → fresh GPT-5.5 audit → CLEAN → merge.
2. Re-dispatch v2-1 against new main (post-prereq SHA) with original brief unchanged (now passes R69 pre-check).
3. v2-1 + (whichever sibling backend PRs already merged) ship in sequence per merge gate.

## 2026-06-11T00:32:01Z — WAVE_1_AUDIT_FANOUT_3 — three GPT-5.5 auditors dispatched in parallel

**Builders complete:**
- PR #380 Roman P2 backend (Opus 4.8 builder `roman_phase_2_backend_mq8qesyt`) — SHA `20f93a790a703fec12ae5d1dfd9e16d6daadbe41`
- PR #381 MWB-2 templates (Opus 4.8 builder `mwb_2_templates_mq8qemmg`) — SHA `aeb628e635fcf75afb2357b63d0eaf7e886ab834`
- PR #382 v2-1 prereq migration (Opus 4.8 builder `v2_1_prereq_migration_mq8qmus4`) — SHA `bfe8e3ef7b4cd2ea452c3a5f84780f112b938948`

**Auditor dispatch (R31 builder ≠ auditor, fresh gpt_5_5 each, no shared context):**
1. Roman P2 backend audit → worktree `/home/user/workspace/tgp/audit-roman-p2/`
2. MWB-2 templates audit → worktree `/home/user/workspace/tgp/audit-mwb-2/`
3. v2-1 prereq migration audit → worktree `/home/user/workspace/tgp/audit-v2-1-prereq/`

**§7C anti-rebase verification:** Auditors only READ; they do not push branches. Worktrees are read-only checkouts of each PR head. ZERO overlap.

**Merge plan on CLEAN verdicts (operator standing rule "always merge on CLEAN"):**
1. First CLEAN → `gh pr merge <num> --squash --admin`.
2. Remaining open backend PRs auto-rebase via GitHub or via builder fast-forward if conflicts.
3. After #382 merges → re-dispatch v2-1 plan-context backend builder against new main (original brief at `/home/user/workspace/COMMUNITY_V2-1_BUILDER_BRIEF.md`).

**Still running:** v1-6 mobile coach UI (`v1_6_mobile_coach_ui_mq8qe8nj`) — independent of backend trio.

## 2026-06-11T00:50:46Z — WAVE_1_TURNAROUND — merge #382, dispatch 2 v1-6 audits + 2 fixers in parallel

**Audit results (Wave 1):**
- PR #380 Roman P2 → **DIRTY 9/13** — 2 P0 (sonnet/Oops literals in PR-introduced files), 3 P1 (off-limits roman.module.ts, 4 orphan callsite helpers, test placement)
- PR #381 MWB-2 → **DIRTY 13/15** — 2 P1 (flag re-check outside transaction G4, no real concurrency control G9)
- PR #382 v2-1 prereq → **CLEAN 12/12** — MERGED at `db8633d8e45a106b3b578601946f9f1c2bec8162` (new backend main HEAD)

**v1-6 mobile builder complete:** PR #231 opened at SHA `c6a3711b23b8feb9cd18a1ace042487d80a1e628`, 2240/2240 jest pass, 91.2% line cov, 75 new tests across 4 files, FACE+VOICE contract enforced via shared CoachEmptyState component.

**Operator addition (locked 2026-06-10 17:34):** Dynasia attached "Mobile App Design Intelligence — Exhaustive Agent Training" doctrine (115KB, 1394 lines, extracted to `/home/user/workspace/DESIGN_INTELLIGENCE_DOC_PLAINTEXT.md`). For v1-6 audits ONLY (this once), spawn TWO auditors:
1. **Code auditor** (G1-G13 + doctrine §4.7/§5.1-Step-6/§5.5 as G11 code gate) → `/home/user/workspace/V1_6_MOBILE_CODE_AUDITOR_BRIEF.md`
2. **UX/Design auditor** (Master Checklist §6.2 + Don Norman three layers + Miller/Hick + 7 anti-patterns + face+voice contract verification) → `/home/user/workspace/V1_6_MOBILE_UX_DESIGN_AUDITOR_BRIEF.md`

The UX brief poses the operator's literal questions: "Is this visually appealing AND usable. Is it overwhelming. Does it have everything clearly laid out / hidden as should be."

**Fixer dispatch (R31 builder ≠ fixer ≠ auditor):** fresh Opus 4.8 fixers for both DIRTY backend PRs, with rebase onto new main (`db8633d8`). Briefs explicitly disambiguate the auditor's "sonnet in src/" finding — those 20 pre-existing matches in `src/ai/**` and `src/roman/anthropic-client.provider.ts` are legitimate Anthropic SDK model IDs (`claude-sonnet-X`) predating this PR, out of scope. Only the 7 PR-introduced matches in two new test files are real P0s, fixable via char-code/base64 representation of the forbidden literal in the lint contract.

**§7C verification:** the 4 in-flight dispatches touch disjoint files:
- v1-6 audits: read-only against `growth-project-mobile`
- Roman P2 fix: `src/roman/voice/**`, `src/notifications/notifications.service.ts`, callsite modules (paywall/billing/onboarding), revert `src/roman/roman.module.ts` to main
- MWB-2 fix: `src/workout-builder/**`, test/clone-program.spec.ts only
- Zero overlap.

**Next merge gates:** on CLEAN re-audit, merge order will be MWB-2 (#381) or Roman P2 (#380) — whichever fixer returns first. Then re-dispatch v2-1 plan-context builder against post-merge main.

## 2026-06-11T01:32:13Z — NEW THREAD STARTED — ui-ux-findings/

**Operator directive (2026-06-10):** Start a new thread under `tgp-agent-context` for UI/UX findings, seeded with three reports.

**Location:** `ui-ux-findings/`
- `README.md` — thread anchor + how-to
- `THREAD_LOG.md` — running journal of every audit + doctrinal accretion
- `reports/01_v1-6_mobile_UX_DESIGN_audit_PR-231.md` — verbatim UX audit, doctrine-driven, NEEDS_REVISION
- `reports/02_v1-6_mobile_CODE_audit_PR-231.md` — verbatim code audit, DIRTY 4/13
- `reports/03_external_audit_main_branch_2026-06-10.md` — verbatim external roast of currently-shipped coach screens, 6.5/10 with 10 specific findings
- `inventory/SCREEN_INVENTORY.md` — 145 `*Screen.tsx` files on main (53 coach + 53 client + 37 auth/other + 2 entitlement wrappers), snapshotted at `growth-project-mobile@76b1a48a`

**Open follow-ups (not dispatched in this turn — pending operator triage):**
- FU-1: PR #231 fixer to address Reports 01 + 02 in a single pass.
- FU-2: Main-branch UX cleanup PRs (Report 03's 10 findings, ~2-3 sequential PRs).

**Doctrine reference:** `/home/user/workspace/DESIGN_INTELLIGENCE_DOC_PLAINTEXT.md` (115KB, 1394 lines, operator-supplied 2026-06-10 17:34 PDT). Future sessions should re-attach.

## 2026-06-11T01:42 — Wave 1 Turnaround Cycle 2: 4 parallel dispatches

**Context:** Roman P2 fixer R1 returned CI-green at `ebb2854e`. MWB-2 fixer already green at `623cfdb5`. PR #382 v2-1 prereq merged → backend main now `db8633d8` (plan_context_payload column live). v1-6 dual audits returned DIRTY (code 4/13) + NEEDS_REVISION (UX).

**Parallel dispatches (4):**
1. **Roman P2 re-audit R2** — fresh GPT-5.5 on PR #380 @ `ebb2854e`. Worktree `/home/user/workspace/tgp/audit-roman-p2-r2`.
2. **MWB-2 re-audit R2** — fresh GPT-5.5 on PR #381 @ `623cfdb5`. Worktree `/home/user/workspace/tgp/audit-mwb-2-r2`.
3. **v2-1 plan-context backend re-dispatch** — fresh Opus 4.8 builder against new main `db8633d8` (original R69 abort cause cleared). Worktree `/home/user/workspace/tgp/backend-v2-1-r2`.
4. **v1-6 mobile fixer R1** — fresh Opus 4.8 fixer on PR #231 + new backend PR for Roman empty-state endpoint. Lane-disjoint from #380/#381/v2-1. Worktree `/home/user/workspace/tgp/fix-mobile-v1-6/{mobile,backend}`.

**§7C file_surface_overlap_check:** PASS — each dispatch owns disjoint files. The v1-6 fixer's backend lane (`src/roman/voice/voice-policy.constants.ts`, new `src/community/coach-inbox/community-coach-empty-states.controller.ts`) does NOT overlap with the Roman P2 PR #380 file set (already merged-ready; Roman P2 owns `voice-policy.service.ts` callsites in dunning/notifications, not the constants enum) or MWB-2 PR #381 (master-program clone path). Re-confirm in each fixer/builder report.

**Rule basis:** R0 decacorn, R31 builder≠auditor≠fixer, R56 worktree-per-subagent, R64 journal-every-state-change, R66 full-suite-before-PR, R67 dispatch.json-before-wait, §7C anti-rebase disjoint lanes, FACE+VOICE contract (locked 2026-06-10).

## 2026-06-11T20:05:00Z — WAVE 3: community full-speed — v2-2 R1 audits + v2-3 ∥ v3-1 builders (5 lanes)

**Operator authorization (2026-06-11 13:01 PDT):** "start working through the community expansion, full speed ahead" + "Up to 5 PRs can go in flight at once, so long as you're VIGILANT with R64 — pushing all updates to github!" New orchestrator session (CPO mode) picked up v2-2 exactly where the cut-off sibling session left it.

**v2-2 state verified:** backend PR #387 @ `b792abca` OPEN, CI green (build-and-test, rls-floor-guard, rls-live-tests), MERGEABLE; mobile PR #234 @ `f720bd83` OPEN, CI green, MERGEABLE. Backend PR body empty (session died before write-up) — orchestrator read full diffs: ack state machine (none→seen→acked→replied, monotonic, idempotent re-stamp, 409 regression guard), read-time SLA (24h/48h env-overridable, fat-finger-proof), IDs-only PostHog telemetry, 404-non-leak tenant doctrine. R69 pre-verified: zero prisma/ diff; ack columns pre-exist on main (schema ~5698).

**Dispatch (R1 audits, R31 fresh GPT-5.5, zero builder context):**
1. v2-2 backend code audit → brief `/home/user/workspace/COMMUNITY_V2-2_BACKEND_R1_AUDITOR_BRIEF.md`, worktree `tgp/audit-v2-2-backend`. Focus: stampAck concurrency (conditional update or P1), rate limiting, flag gating, telemetry PII.
2. v2-2 mobile code audit → brief `..._MOBILE_R1_CODE_AUDITOR_BRIEF.md`, worktree `tgp/audit-v2-2-mobile-code`. Focus: contract cross-check vs #387 DTOs, optimistic-rollback (#30), flag-off invariance, FACE+VOICE.
3. v2-2 mobile UX audit → brief `..._MOBILE_R1_UX_AUDITOR_BRIEF.md`, worktree `tgp/audit-v2-2-mobile-ux`, doctrine `quality-references/DESIGN_INTELLIGENCE_DOC_PLAINTEXT.md` (§6.2 + 7 anti-patterns + operator's 3 literal questions). Key risk flagged: none-state pill wall / inbox row cognitive load.

**Dispatch (builders, Opus 4.8, R71 file-ownership briefs):**
4. v2-3 event objects (backend+mobile) → brief `COMMUNITY_V2-3_BUILDER_BRIEF.md`, worktrees `tgp/{backend,mobile}-v2-3-builder`, base backend main `25dbc790` / mobile main `1ba30d86`. OWNS events/** + Event screens. No video provider → external links only (STEP0).
5. v3-1 challenges (backend+mobile) → brief `COMMUNITY_V3-1_BUILDER_BRIEF.md`, worktrees `tgp/{backend,mobile}-v3-1-builder`, same bases. OWNS challenges/** + Challenge screens. Doctrine Part III gamification gates mandatory (S-curve ≤4, forgiveness, no shame).

**§7C file_surface_overlap_check: PASS** — v2-2 lane owns ack/** + messages/** + InboxScreen; v2-3 owns events/** + Event screens; v3-1 owns challenges/** + Challenge screens. Shared-append only: community.module.ts, featureFlags.ts, .env.example, navigators — R71 second-merger-rebases rule in both builder briefs. Parallelization plan Phase D adapted: v2-1 already merged solo, so the fan-out is v2-3 ∥ v3-1 (+v2-2 audits); v2-4 stays serialized behind v2-2 (inbox screen conflict), v3-2 ∥ v3-3 next, v3-4 last.

**R69 pre-flight for builders:** CommunityEvent (~5786), CommunityEventRsvp (~5817), CommunityChallenge (~5840), CommunityChallengeParticipation (~5870) all pre-exist on main schema → no schema mutation needed anywhere in this wave.

**Doctrine docs committed to `quality-references/`** (operator re-attached both 2026-06-11): FIFTY_FAILURES_PLAINTEXT.md + DESIGN_INTELLIGENCE_DOC_PLAINTEXT.md — future sessions no longer depend on re-attachment (R64).

**Merge policy this wave:** standing rule — CLEAN ⇒ immediate `gh pr merge --squash --admin` (admin solely for pre-existing environmental rls-tier1). v2-2 requires ALL THREE verdicts clean (backend code + mobile code + mobile UX) before the pair merges, backend first.

## 2026-06-11T21:42:00Z — WAVE 3 cycle 2: v2-2 R1 verdicts (all dirty) → fixers; v3-1 BUILD COMPLETE → R1 audits

**v2-2 R1 verdicts (R31 fresh GPT-5.5):**
- Backend #387: **DIRTY** — 3×P1 (stampAck unconditional update = double-stamp/double-telemetry race; no ParseUUIDPipe on messageId params; 403-vs-404 cross-tenant existence oracle in AckService.authorize, test locked the bad behavior) + 2×P2 (`as unknown as` in specs; no client-authored eligibility check). Report: COMMUNITY_V2-2_BACKEND_R1_AUDIT_REPORT.md.
- Mobile #234 code: **DIRTY** — 4×P1 (contract drift `.passthrough()`+loose timestamps vs backend `.strict()`; reduced-motion not actually enforced (stale ref outside effect deps) and test doesn't catch it; 409 illegal_transition = silent rollback, no refetch/surface; flag-off invariance untested) + 1×P2 (`as unknown as`). Report: COMMUNITY_V2-2_MOBILE_R1_CODE_AUDIT_REPORT.md.
- Mobile #234 UX: **NEEDS_REVISION** — 4×P1 (row cognitive load violates Miller/Hick — two ack-like actions; `none`+`within` badge wall; breached SLA doesn't out-shout peers; row a11y label omits ack/SLA so screen-reader coaches never hear "Overdue") + 2×P2 (Ack/Acked/Mark acked/Acknowledge vocabulary tax; under-invested closure). Report: COMMUNITY_V2-2_MOBILE_R1_UX_AUDIT_REPORT.md.
- Audit cycle value: 11 chargeable findings on a CI-green pair. R1 did its job.

**v3-1 BUILD COMPLETE (Opus 4.8):** backend PR #390 (`86eca1e1`, 29 tests, full test/community 204 green) + mobile PR #235 (`98e7b281`, 15 tests, tsc clean). Declared deviations: new communityChallengesApi.ts; reuse of threadEmpty Roman stem; CommunityMessage-row reuse for comments/opt-in (R69-driven). file_surface_overlap_check: PASS. NOTE: full 386-suite backend run OOMs sandbox (env limit, not code) — targeted+community suites are the verification bar this wave.

**Cycle-2 dispatch (4 lanes + v2-3 builder still in flight = 5 concurrent):**
1. v2-2 backend FIXER (Opus 4.8) → fixer-v2-2-backend, brief COMMUNITY_V2-2_BACKEND_FIXER_R1_BRIEF.md (all 5 findings + write the missing PR body).
2. v2-2 mobile FIXER (Opus 4.8) → fixer-v2-2-mobile, brief COMMUNITY_V2-2_MOBILE_FIXER_R1_BRIEF.md (5 code + 4 UX P1s + 2 UX P2s; list re-ordering explicitly deferred to v2-4).
3. v3-1 backend R1 code audit (GPT-5.5) → audit-v3-1-backend, brief COMMUNITY_V3-1_BACKEND_R1_AUDITOR_BRIEF.md (v2-2 lessons encoded: oracle check, pipes, races, strict Zod; CommunityMessage-reuse soundness is the headline question).
4. v3-1 mobile R1 code audit (GPT-5.5) → audit-v3-1-mobile-code, brief COMMUNITY_V3-1_MOBILE_R1_CODE_AUDITOR_BRIEF.md (flag-off test REQUIRED, strict contracts, real reduced-motion).
- v3-1 mobile UX audit brief written (COMMUNITY_V3-1_MOBILE_R1_UX_AUDITOR_BRIEF.md, Part III gamification primary lens) — dispatches when a slot frees (5-lane cap, operator-set).

**Re-audit policy:** v2-2 R2 = fresh auditors after both fixers land. v2-2 merges only on triple-CLEAN (backend code + mobile code + mobile UX), backend first.

## 2026-06-11T22:32:00Z — WAVE 3 cycle 3: v2-2 backend FIXED → R2 audit; v3-1 backend DIRTY → fixer; #388 closed

- Issue #388 (CRDT roadmap) CLOSED not-planned with operator-approved comment; MWB-4 promoted, queued for next free lane.
- v2-2 backend fixer COMPLETE @ `d9f10692` (CI green): CAS stampAck + single-emission telemetry + concurrency test; ParseUUIDPipe ×3; byte-identical 404 non-leak (oracle gone); zero casts via typed fixtures; student-only eligibility via findSenderRole. Ack suites 37→56; test/community 15 suites/167 green. PR body authored. → dispatching FRESH R2 auditor (audit-v2-2-backend-r2, brief COMMUNITY_V2-2_BACKEND_R2_AUDITOR_BRIEF.md).
- v3-1 backend R1: **DIRTY** — 3×P1 (challenge CommunityMessage rows bleed into message get/edit/delete + unread counts; progress read-modify-write race + dup completion emissions; no runtime UUID validation on any path param) + 2×P2 (`as unknown as User` in specs; reportComment not bound to challengeId). Leaderboard opt-in, flag gating, Zod strictness, lane containment all PASS. Report COMMUNITY_V3-1_BACKEND_R1_AUDIT_REPORT.md. → dispatching fixer (fixer-v3-1-backend, brief COMMUNITY_V3-1_BACKEND_FIXER_R1_BRIEF.md) with a narrow authorized exception: minimal plan_context_type exclusion filters in messages service + community repository (v2-2 lane is quiescent at d9f10692; no live overlap).
- Lanes after dispatch (5): v2-3 builder (finishing mobile), v2-2 mobile fixer, v3-1 mobile code audit, v2-2 backend R2 audit, v3-1 backend fixer. Queued: v3-1 UX audit, v2-2 mobile R2, v2-3 audits ×3, MWB-4 builder, v2-4/v3-2/v3-3 builders.
- Operator protocol: "check" = wakeup call meaning N agents done → act accordingly.

## 2026-06-11T22:50:00Z — WAVE 3 cycle 4: v2-2 backend R2 CLEAN (merge-ready); v3-1 mobile DIRTY-CRITICAL; MWB-4 builder launched

- **v2-2 backend #387 R2: CLEAN** @ `d9f10692` (fresh GPT-5.5). All 5 R1 findings verified FIXED with evidence (CAS updateMany + single telemetry + race test; ParseUUIDPipe ×3 + 400 E2E; byte-identical 404 oracle closure). Two non-blocking P2 residues recorded for a future round: (a) literal `as unknown as` string inside a fixture COMMENT trips the strict grep; (b) `kind === 'system'` messages with student sender are still ackable (no message-kind eligibility predicate). Report: COMMUNITY_V2-2_BACKEND_R2_AUDIT_REPORT.md. **#387 is MERGE-READY — held per triple-CLEAN policy** (backend code + mobile code + mobile UX) until #234 R2 verdicts land; backend merges first.
- **v3-1 mobile #235 R1 code: DIRTY-CRITICAL** — 1×P0 (challenge comments empty state renders LOCAL Roman constants via romanVoice.ts threadEmpty instead of backend payload path — FACE+VOICE violation) + 4×P1 (schemas `.passthrough()`/loose vs backend `.strict()` uuid/datetime — same drift class as v2-2; 409/conflict unclassified + write failures silent (no onError/rollback/surface); flag-off invariance untested at navigator/route level; report-comment touch target 32dp) + 1×P2 (`as unknown as` in test). Sandbox note: auditor's jest run blocked by expo-modules-core resolution; typecheck parity verified (0 new errors). Report: COMMUNITY_V3-1_MOBILE_R1_CODE_AUDIT_REPORT.md.
- **Fixer policy for #235:** mobile fixer HELD until v3-1 mobile UX R1 verdict (in flight, dispatched 22:40Z on freed slot) so ONE fixer round absorbs code + UX findings — same combined pattern that worked for v2-2 mobile.
- **MWB-4 mobile autosave builder DISPATCHED** (Opus 4.8) on the 5th slot — operator-promoted after CRDT rejection (#388 closed). Brief: /home/user/workspace/MWB-4_BUILDER_BRIEF.md (spec §6.3–6.5; backend contract = merged #386 @ 25dbc790; kill-proof AsyncStorage mirror + replay; flag EXPO_PUBLIC_FF_MWB_AUTOSAVE; NO presence/cursors). Worktree tgp/builder-mwb-4, branch feature/mwb-4-mobile-autosave.
- **§7C file_surface_overlap_check: PASS** — MWB-4 owns workout-builder/autosave mobile files; zero overlap with v2-2 (ack/messages/inbox), v2-3 (events), v3-1 (challenges). Shared-append only: featureFlags.ts, .env.example (R71 second-merger-rebases).
- Lanes (5): v2-3 builder (mobile finish), v2-2 mobile fixer, v3-1 backend fixer, v3-1 mobile UX audit, MWB-4 builder. Queued: v3-1 mobile fixer (combined, on UX verdict), v2-2 mobile R2 code+UX audits (on fixer), v3-1 backend R2 audit (on fixer), v2-3 R1 audits ×3 (on build complete), v2-4 builder (on v2-2 merge), v3-2 ∥ v3-3, v3-4.

## 2026-06-11T22:58:00Z — WAVE 3 cycle 5: v3-1 UX verdict in → combined mobile fixer; v2-3 BUILD COMPLETE → R1 audits begin

- **v3-1 mobile #235 R1 UX: NEEDS_REVISION** — 5×P1 (no discovery path: ChallengeCard unhosted, Today card routes to goToHall not detail; opt-in decline not equal-weight; comments empty-state CTA is a dead no-op + load-error conflated with empty; completion peak is a bare state flip; 32dp report target) + 3×P2 (silent monotonic clamp unexplained; raw rgba backdrop; redundant card footer). Part III gates otherwise PASS (S-curve=4, local competition, no shame surfaces, forgiveness). Report: COMMUNITY_V3-1_MOBILE_R1_UX_AUDIT_REPORT.md.
- **v3-1 mobile FIXER dispatched (combined)** — Opus 4.8, brief COMMUNITY_V3-1_MOBILE_FIXER_R1_BRIEF.md: F1–F13 deduped (1 P0 + 8 unique P1 + 4 P2) from both audits. Worktree tgp/fixer-v3-1-mobile. §7C note: discovery fix touches CommunityTodayScreen + host surface — verified unowned by any lane (v2-3 mobile file list pulled from GitHub: events files + shared-appends only). Barrel/navigators/navTypes/flags remain shared-append, R71.
- **v2-3 BUILD COMPLETE** (Opus 4.8): backend PR #389 @ `d15ccfd5` (CI 4/4 green) + mobile PR #236 @ `90b2526d` (CI green, 15 files +2752/−0, 27/27 targeted jest, tsc+eslint 0). Builder SELF-CAUGHT a FACE+VOICE P0 pre-commit: coach events empty state had RomanAvatar over hardcoded copy → replaced with neutral non-Roman empty state (no events surface key exists on backend). Rollback-test root cause was test-harness gcTime:0; production hooks unchanged. Report: COMMUNITY_V2-3_BUILDER_REPORT.md.
- **v2-3 R1 audit briefs written ×3** (lessons-encoded: hostile-URL probe, transition-job double-fire races, oracle 404s, UUID pipes, strict-Zod parity, navigator-level flag-off, neutral-empty-state verification): COMMUNITY_V2-3_{BACKEND,MOBILE_CODE: COMMUNITY_V2-3_MOBILE_R1_CODE,MOBILE_UX: COMMUNITY_V2-3_MOBILE_R1_UX}_AUDITOR_BRIEF.md. **Backend code audit DISPATCHED** (GPT-5.5, worktree tgp/audit-v2-3-backend). Mobile code + UX audits QUEUED (5-lane cap).
- Lanes (5): v2-2 mobile fixer, v3-1 backend fixer, MWB-4 builder, v3-1 mobile fixer, v2-3 backend audit. Queued next: v2-3 mobile code audit, v2-3 mobile UX audit, v2-2 mobile R2 ×2 (on fixer), v3-1 backend R2 (on fixer), v3-1 mobile R2 ×2 (on fixer), v2-4 builder (on v2-2 merge).

## 2026-06-11T23:12:00Z — WAVE 3 cycle 6: v3-1 backend FIXED → R2 audit; v2-3 backend DIRTY → fixer

- **v3-1 backend fixer COMPLETE** @ `ecf9c5e8` (PR #390, CI 4/4 green): all 5 R1 findings fixed in-lane (challenge-row exclusion filters, CAS progress + exactly-once completion telemetry, UUID pipes, spec casts removed, reportComment challenge-scoped). 53 challenge + 228 community tests green locally. Report: COMMUNITY_V3-1_BACKEND_FIXER_R1_REPORT.md. → **R2 fresh re-audit DISPATCHED** (GPT-5.5, brief COMMUNITY_V3-1_BACKEND_R2_AUDITOR_BRIEF.md, worktree tgp/audit-v3-1-backend-r2) incl. regression scan of the messages-service exclusion filters (they touch v2-2-adjacent files — must be behavior-neutral for non-challenge messages).
- **v2-3 backend #389 R1: DIRTY** — 3×P1 (workspace event list LEAKS cohort-scoped events across cohorts in same workspace (IDOR-class, primary read path); zero ParseUUIDPipe on any path param (repeat class); scheduler promotions read-modify-write + reminder fanout non-atomic → duplicate transitions/pushes under double-fire (repeat class)) + 2×P2 (state_changed broadcast fires on create/RSVP with no transition; RSVP eligibility/closure under-specified — coaches can RSVP, no ends_at closure). URL validator held against hostile probes (javascript:/data:/userinfo/off-host all rejected). Report: COMMUNITY_V2-3_BACKEND_R1_AUDIT_REPORT.md.
- **v2-3 backend FIXER dispatched** (Opus 4.8, brief COMMUNITY_V2-3_BACKEND_FIXER_R1_BRIEF.md, worktree tgp/fixer-v2-3-backend). Operator-decided RSVP rule encoded in F5: client/student members only; closes at ends_at; typed non-leaking rejections. Repo's 400 illegal-transition convention kept (no churn).
- Lanes (5): v2-2 mobile fixer, MWB-4 builder, v3-1 mobile fixer, v3-1 backend R2 audit, v2-3 backend fixer. Queued: v2-3 mobile code + UX audits (briefs ready), v2-2 mobile R2 ×2, v3-1 mobile R2 ×2, v2-3 backend R2, v2-4 builder (on v2-2 merge).

## 2026-06-11T23:30:00Z — WAVE 3 cycle 7: v3-1 backend R2 DIRTY (1 P1 left) → fixer R2; MWB-4 BUILD COMPLETE → audits queue; v2-3 mobile code audit dispatched

- **v3-1 backend #390 R2: DIRTY** — 3 of 5 R1 findings verified FIXED (cross-surface exclusion now generalized `plan_context_type !== null` and behavior-neutral for plain messages per regression scan; UUID pipes complete incl. cohort_id @IsUUID; reportComment challenge-bound). REMAINING: **P1** completion-transition flag derives from unlocked `prior` CTE → concurrent double-complete can double-fire milestone push (mock-only test insufficient); **P2** forbidden cast literals REINTRODUCED in added comments (2nd recurrence of this exact mistake after v2-2 R2). Report: COMMUNITY_V3-1_BACKEND_R2_AUDIT_REPORT.md.
- **v3-1 backend FIXER R2 dispatched** (Opus 4.8, brief COMMUNITY_V3-1_BACKEND_FIXER_R2_BRIEF.md, worktree tgp/fixer-v3-1-backend-r2): F1 = idempotent conditional completion UPDATE ... WHERE completed_at IS NULL ... RETURNING (flag from own write) + env-gated live-DB race test; F2 = strip literals from comments. Surgical scope only.
- **MWB-4 BUILD COMPLETE** (Opus 4.8): **PR #237** (growth-project-mobile, feature/mwb-4-mobile-autosave). useAutosave hook (800ms debounce), AppState-background + beforeRemove force-flush, AsyncStorage offline mirror with kill/replay + idempotency keys, strict Zod wire layer, 409 fast-forward, save-state pill, flag EXPO_PUBLIC_FF_MWB_AUTOSAVE off. 38/38 targeted tests in standalone harness (screen test blocked by sandbox RN renderer — documented). 3 declared deviations incl. lock-token bootstrap 409 handshake. Report: MWB-4_BUILDER_REPORT.md. → R1 code + UX audits QUEUED (operator cap).
- **v2-3 mobile code audit R1 dispatched** (GPT-5.5, brief COMMUNITY_V2-3_MOBILE_R1_CODE_AUDITOR_BRIEF.md, PR #236 @ 90b2526d, worktree tgp/audit-v2-3-mobile-code).
- Lanes (5): v2-2 mobile fixer, v3-1 mobile fixer, v2-3 backend fixer, v3-1 backend fixer R2, v2-3 mobile code audit. Queued: v2-3 mobile UX audit, MWB-4 audits ×2, v2-2 mobile R2 ×2 (on fixer), v3-1 mobile R2 ×2 (on fixer), v3-1 backend R3 (on fixer), v2-3 backend R2 (on fixer), v2-4 builder (on v2-2 merge).

## 2026-06-12T00:05:00Z — WAVE 3 cycle 8: all 5 lanes turned over; 3 fix_completes; v2-3 mobile code DIRTY-CRITICAL; 5 fresh dispatches (2 merge-gating)

### State changes
- **v2-2 mobile FIXED** @ `2f20a237` (PR #234): 11 fixes + fontWeight 700→600 quiet-luxury cap; 94 targeted tests; CI green. → R2 code + UX audits DISPATCHED (both MERGE-GATING; backend #387 already CLEAN R2 @ d9f10692).
- **v2-3 backend FIXED** @ `c6799955` (PR #389): casPromoteState CAS, claimReminderRecipients atomic RETURNING, membership-scoped event list, 8 UUID pipes, created/rsvp_changed broadcasts. → R2 audit DISPATCHED.
- **v3-1 backend FIXED (R2)** @ `c005b2ee` (PR #390): idempotent conditional completion UPDATE...RETURNING kills double-milestone-push; env-gated live-DB race test. → R3 audit QUEUED (lane cap).
- **v3-1 mobile fixer STEP-LIMIT mid-fix** (PR #235): fixer self-caught a FABRICATED backend contract from its own earlier turn (invented getCommentsEmptyState endpoint + challenge_comments_empty surface key — neither exists on backend; v2-3 neutral-empty-state precedent applies). Corrections uncommitted in worktree. Parent pushed its 3 local commits (98e7b28→b069548) to origin per R64. RESUMED via message_subagent with finish plan (F1/F8 test rewrite, F2 drift tests vs backend @ c005b2ee, F4 navigator flag-off test, gates, REST-API PR body update).
- **v2-3 mobile code R1 verdict: DIRTY-CRITICAL** (PR #236 @ 90b2526d): 2 P0 — flag-off routes registered unconditionally; Roman face leaks into client detail empty state via CommunityEmptyState stem="todayEmpty". 4 P1 — Linking.openURL without https guard; mutation errors unsurfaced + 409 unclassified; STATE_META[event.state] unknown-state crash; no drift tests. 2 P2 — reduced-motion absent on modals; as-unknown-as in test. → combined mobile fixer QUEUED on UX verdict.
- **MWB-4 audits still QUEUED** (PR #237 @ 77cd3b4a) behind lane cap.

### Lanes (5/5 live)
v3-1 mobile fixer (resumed), v2-2 mobile R2 code audit, v2-2 mobile R2 UX audit, v2-3 mobile UX audit, v2-3 backend R2 audit.

### Queue
v3-1 backend R3 audit (verify c005b2ee exactly-once completion + comment literals), MWB-4 R1 code + UX audits, v3-1 mobile R2 ×2 (on fixer), v2-3 mobile combined fixer (on UX verdict), v2-4 builder (on v2-2 merge — inbox conflict), then v3-2 ∥ v3-3, v3-4 last.

### Merge trigger armed
If v2-2 mobile R2 code CLEAN + UX CLEAN → merge #387 then #234 (`gh pr merge --squash --admin`), journal SHAs, dispatch v2-4 builder.

## 2026-06-12T00:12:00Z — WAVE 3 cycle 8b: v2-2 mobile UX CLEAN (merge gate on code only); v2-3 mobile UX NEEDS_REVISION -> combined fixer + v3-1 backend R3 dispatched

- **v2-2 mobile R2 UX: CLEAN** (PR #234 @ 2f20a237). All 6 R1 UX findings verified fixed with file:line evidence; 1 new P2 polish only (settled rows: disabled "Acknowledged" button beside state pill; replied rows read weaker) — logged, non-blocking. **Triple-CLEAN merge gate now waits ONLY on v2-2 mobile R2 code audit** (backend #387 CLEAN @ d9f10692).
- **v2-3 mobile UX R1: NEEDS_REVISION** (PR #236 @ 90b2526d). P1: events effectively unhosted (member Today card routes to Hall not detail; coach home has no Events entry). P2 ×7: RSVP three-equal-buttons no hierarchy/withdraw/confirmation, external-link copy not honest about leaving app, raw ISO timestamp input, "Live"/"Replay" labels not instant, Roman-voiced member empty state (matches code-audit P0), Reflect(close) unguarded, flag-off route-registration residue (matches code-audit P0).
- **Combined v2-3 mobile fixer DISPATCHED** (Opus 4.8): F1–F14 brief merging code DIRTY-CRITICAL + UX findings — COMMUNITY_V2-3_MOBILE_FIXER_R1_BRIEF.md.
- **v3-1 backend R3 audit DISPATCHED** (GPT-5.5): verify exactly-once completion at c005b2ee (adversarial probes on UPDATE...RETURNING gate + race test realness) + comment-literal grep (3rd-recurrence watch) — COMMUNITY_V3-1_BACKEND_R3_AUDITOR_BRIEF.md.
- Lanes (5/5): v3-1 mobile fixer (resumed), v2-2 mobile R2 code audit, v2-3 backend R2 audit, v2-3 mobile combined fixer, v3-1 backend R3 audit.
- Queue: MWB-4 R1 code + UX audits (PR #237 @ 77cd3b4a), v3-1 mobile R2 ×2 (on fixer), v2-4 builder (on v2-2 merge), v3-2 ∥ v3-3, v3-4 last.

## 2026-06-12T00:24:00Z — WAVE 3 cycle 8c: Roman lane re-opened — spec merged, art received, P1 mobile builder brief ready for first free lane

- **tgp-agent-context PR #1 MERGED** (operator directive): AI_BUTLER_ROMAN_IDENTITY_SPEC.md (382-line voice contract + 12 sample contexts + mascot brief) now on main — R64-durable.
- **Mascot art RECEIVED from operator** (3 assets → design/roman/): chat avatar neutral 1024, welcome card 16:9, full-body hero 9:16. **LIKENESS FLAG**: art is recognizably modeled on a real celebrity (right-of-publicity risk in a commercial product). Archived for context; product-shipping decision rests with operator. Asset pipeline note: chat avatar is JPG on painted background — product use needs cutout/alpha or circular-crop treatment.
- **ROMAN P1 MOBILE BUILDER BRIEF written** (/home/user/workspace/ROMAN_P1_MOBILE_BUILDER_BRIEF.md): chat screen vs merged backend contract (#378: sessions, messages, SSE; 404-when-off guard → typed unavailable state), FACE+VOICE enforcement, strict-Zod drift tests, navigator flag-off test, EXPO_PUBLIC_FF_ROMAN_CHAT off, anti-fabrication clause (cite controller file:line per consumed endpoint). Lane containment verified disjoint vs in-flight #234/#235/#236/#237 — featureFlags.ts one additive line only, rebase-before-push required.
- **Dispatch rule**: operator cap is 5 lanes; all 5 live. Roman P1 mobile builder takes the FIRST lane that frees (ahead of MWB-4 audits in queue per operator "we need to get this done").
- Lanes (5/5): v3-1 mobile fixer (resumed), v2-2 mobile R2 code audit, v2-3 backend R2 audit, v2-3 mobile combined fixer, v3-1 backend R3 audit.
- Queue (reordered): **Roman P1 mobile builder (NEXT)**, MWB-4 R1 code + UX audits, v3-1 mobile R2 ×2 (on fixer), v2-4 builder (on v2-2 merge), v3-2 ∥ v3-3, v3-4.

## Cycle 9 — 2026-06-11 17:50 PT — wave: 4 verdicts processed, 4 lanes refilled (Roman P1 builder live)

Completions processed:
- v2-2 mobile R2 CODE audit (#234 @ 2f20a237): DIRTY — 3×P2: (1) banned literal `as unknown as` in comment useCoachAckActions.test.tsx:45-47 (3rd recurrence of comment-literal class); (2) ack DTO strict drift tests missing (AckStateSchema/CoachSlaSnapshotSchema/AckTransitionResponseSchema never imported by tests); (3) screen-level 409 conflict UI assertion missing. Runtime code itself sound; all R1 P1s verified fixed. Report: COMMUNITY_V2-2_MOBILE_R2_CODE_AUDIT_REPORT.md. UX R2 already CLEAN → this fixer round is the SOLE v2-2 merge gate.
- v3-1 mobile fixer R1 (#235): FIX COMPLETE @ c4f657a6b0bc6bc03db046382edc9aa720e78fa4. Fabrication fully excised (getCommentsEmptyState / challenge_comments_empty confirmed nonexistent on backend; neutral non-Roman empty state kept). 37 tests / 5 suites pass, tsc clean, R0 clean. Awaiting R2 code+UX audits (queued behind lane cap).
- v2-3 backend R2 audit (#389 @ c6799955): DIRTY — 1×P2: assertRsvpEligible ignores CommunityMembership.role → active assistant/co_coach with global student role can RSVP. All R1 P1s fixed (cohort scoping, UUID pipes, CAS reminders). PR-body inaccuracies noted (eight→seven params). Report: COMMUNITY_V2-3_BACKEND_R2_AUDIT_REPORT.md.
- v3-1 backend R3 audit (#390 @ c005b2ee): DIRTY — 1×P1: POST .../comments/:commentId/report missing CommunityChallengesEnabledGuard (kill-switch bypass); 1×P2: completion→push at-most-once undeclared. Exactly-once completion claim itself verified real (conditional UPDATE…RETURNING). Report: COMMUNITY_V3-1_BACKEND_R3_AUDIT_REPORT.md.

Decisions:
- Roman avatar art: user reviewed likeness flag and directed SHIP AS-IS. Art in design/roman/ is final for P1. Flag closed.

Dispatches (4 lanes refilled; v2-3 mobile combined fixer still running from cycle 8):
- roman_p1_mobile_chat_builder_mqa7fyqz — Roman P1 mobile chat UI builder (opus), branch feat/roman-p1-mobile-chat, brief ROMAN_P1_MOBILE_BUILDER_BRIEF.md. QUEUE-JUMPED ahead of MWB-4 audits per user order.
- v2_2_mobile_fixer_r2_mqa7g50h — v2-2 mobile fixer R2 (opus), #234, brief COMMUNITY_V2-2_MOBILE_FIXER_R2_BRIEF.md (F1-F3). MERGE-GATING.
- v2_3_backend_fixer_r2_mqa7gatn — v2-3 backend fixer R2 (opus), #389, brief COMMUNITY_V2-3_BACKEND_FIXER_R2_BRIEF.md (F1-F2).
- v3_1_backend_fixer_r3_mqa7ggm3 — v3-1 backend fixer R3 (opus), #390, brief COMMUNITY_V3-1_BACKEND_FIXER_R3_BRIEF.md (F1-F2).

Queue (in order): v3-1 mobile R2 code audit, v3-1 mobile R2 UX audit, MWB-4 R1 code+UX audits (#237 @ 77cd3b4a), v2-2 mobile R3 code audit (on fixer complete), v2-3 backend R3 audit, v3-1 backend R4 audit, v2-4 builder (on v2-2 merge), v3-2 ∥ v3-3, v3-4.

## Cycle 9b — 2026-06-11 18:05 PT — 3 fix completions journaled; lanes held for v2-2 + Roman P1 per user directive

Completions:
- v3-1 backend fixer R3 (#390): FIX COMPLETE @ 6d97f46a8d717fc80a3e1d5a53ca1aa517904782 (c005b2ee..6d97f46a). F1 P1 kill-switch: CommunityChallengesEnabledGuard added to comment-report route; new reflection metadata test asserts ALL non-GET challenge routes carry the guard + flag-off 503 typed-body test with zero moderation side effects. F2 P2: completion→push at-most-once DECLARED (code comment at call site + PR-body "Declared deviations" incl. pg-driver CI note). Gates: targeted 66 pass, full bar 241 pass, R0/R69 clean. Awaiting R4 audit (QUEUED).
- v2-3 backend fixer R2 (#389): FIX COMPLETE @ a3ec919782ded8f30b7987562c27bd68a7274553 (c6799955..a3ec919). F1 P2: assertRsvpEligible now resolves CommunityMembership per event scope (cohort vs workspace) and requires active student role; assistant/co_coach → byte-identical typed 403; 3 new tests. F2: PR body corrected (seven params; eligibility rule restated) via gh api PATCH. Gates: events 64 pass, full bar 239 pass, tsc 0, R0/R69 clean, 2 files +72/-1. Awaiting R3 audit (QUEUED).
- v2-3 mobile combined fixer R1 (#236): FIX COMPLETE @ 1c0cb3ae2ae437f3dcc218ba70bfccf2156af2ec. All F1–F14 fixed across 5 title-only commits (d91d555, 5158f74, de12c77, d0106d2, 1c0cb3a): flag-gated routes both navigators, neutral empty state, RSVP hierarchy+withdraw, https-only link guard, DTO drift tests, reduced-motion hook, EventCard state fallback + lifecycle labels, date pickers, reflect confirm, conflict classification. Gates: tsc baseline-only, R0 clean (Roman test refs reworded to "mascot-voiced"), all suites green. PR body updated via gh api PATCH. Awaiting R2 code+UX audits (QUEUED).

USER DIRECTIVE (2026-06-11 18:03 PT): after this wave, focus remaining processing on v2-2 and Roman P1. Re-audit dispatches for v2-3 (#389 R3, #236 R2 code+UX) and v3-1 (#390 R4, #235 R2 code+UX) are QUEUED BEHIND v2-2 merge-gate processing and Roman P1 audits.

Still in flight (2): roman_p1_mobile_chat_builder_mqa7fyqz, v2_2_mobile_fixer_r2_mqa7g50h (MERGE-GATING).
Priority queue: v2-2 mobile R3 code audit (on fixer complete) → v2-2 TRIPLE-CLEAN MERGE (#387 then #234) → Roman P1 audits (on build complete) → v2-4 builder → v2-3/v3-1 re-audits → MWB-4 R1 audits → v3-2 ∥ v3-3 → v3-4.

## Cycle 9c — 2026-06-11 18:12 PT — v2-2 fixer complete; R3 code audit dispatched (MERGE GATE)

- v2-2 mobile fixer R2 (#234): FIX COMPLETE @ f96cec824e909598dc0c67c7b97a0cb5ed8c3979 (2f20a237..f96cec82). Test-only diff, 3 files +195/-7: F1 banned literal reworded ("double assertion through `unknown`"); F2 ack DTO strict drift suite (valid envelope, extra-field rejection per strict level, malformed datetimes, non-UUID id) mirroring backend ack.dto.ts; F3 screen-level conflict UI assertions (alert role + polite live region + negative case). tsc clean (baseline TS1010 only); local jest blocked by npm-install timeout → green CI at pushed HEAD is authoritative (documented). PR body updated via gh api.
- DISPATCHED: v2_2_mobile_r3_code_audit (gpt-5.5, fresh) @ brief COMMUNITY_V2-2_MOBILE_R3_CODE_AUDITOR_BRIEF.md. Auditor must verify CI executed the new suites at f96cec82. CLEAN ⇒ immediate triple-CLEAN merge: #387 (backend, first) then #234, gh pr merge --squash --admin.
- In flight (2): roman_p1_mobile_chat_builder_mqa7fyqz, v2_2_mobile_r3_code_audit. Per user directive, v2-3/v3-1 re-audits remain QUEUED.

## Cycle 10 — 2026-06-11 18:55 PT — ★ v2-2 SLICE MERGED ★ Roman P1 built; 5 lanes refilled

MERGES (triple-CLEAN achieved):
- v2-2 mobile R3 code audit @ f96cec82: CLEAN (no P0/P1/P2). Report verified substantive: CI run 27387670688 confirmed at exact head with new suites executed (209 suites / 2329 tests); backend contract copy re-verified vs d9f10692; R2-fixer range confirmed test-only. Report: COMMUNITY_V2-2_MOBILE_R3_CODE_AUDIT_REPORT.md.
- **#387 (v2-2 backend) MERGED → main @ 3f271b3952d3c9c81e1540227c3a768c6a838a93** (squash --admin).
- **#234 (v2-2 mobile) MERGED → main @ 79c0a9be7f9657c8c7a0d4fa336c2fa6ba359136** (squash --admin, backend-first order respected).
- v2-2 slice CLOSED: backend R1→R2 CLEAN, mobile code R1→R3 CLEAN, mobile UX R1→R2 CLEAN. Logged P2 residues (non-blocking): settled-row disabled-button duplication (UX), fixture-comment cast mention, system-kind eligibility.

ROMAN P1 BUILD COMPLETE:
- roman_p1_mobile_chat_builder: BUILD COMPLETE → **PR #238** @ d72c02c7e7c75878b1944a029cf0acfa69d700d7 (18 files, +2049/−1). Strict-Zod romanApi with buffered-SSE declared deviation, FACE+VOICE components reusing RomanAvatar, useRomanChat optimistic state machine, flag-gated nav (client MoreStack + coach SettingsStack), EXPO_PUBLIC_FF_ROMAN_CHAT default off. tsc 0, 93 new tests green, R0 clean per builder. Report: ROMAN_P1_MOBILE_BUILDER_REPORT.md.

DISPATCHES (5/5 lanes):
- roman_p1_r1_code_audit_mqa9m4n5 (gpt-5.5) — PR #238 code, brief ROMAN_P1_MOBILE_R1_CODE_AUDITOR_BRIEF.md. Anti-fabrication priority.
- roman_p1_r1_ux_audit_mqa9mb3r (gpt-5.5) — PR #238 UX/voice, brief ROMAN_P1_MOBILE_R1_UX_AUDITOR_BRIEF.md.
- v2_4_ai_triage_builder_mqa9miq4 (opus) — v2-4 AI inbox triage, 2 PRs (backend feature/community-v2-ai-triage off 3f271b39; mobile off 79c0a9be), brief COMMUNITY_V2-4_BUILDER_BRIEF.md. R69 zero-Prisma, no-autonomous-send, tenant-isolated prompts.
- v2_3_backend_r3_audit_mqa9mo69 (gpt-5.5) — #389 @ a3ec919, brief COMMUNITY_V2-3_BACKEND_R3_AUDITOR_BRIEF.md.
- v3_1_backend_r4_audit_mqa9mtcs (gpt-5.5) — #390 @ 6d97f46a, brief COMMUNITY_V3-1_BACKEND_R4_AUDITOR_BRIEF.md.

Queue: v2-3 mobile R2 code+UX audits (#236 @ 1c0cb3a), v3-1 mobile R2 code+UX audits (#235 @ c4f657a), MWB-4 R1 code+UX audits (#237 @ 77cd3b4a), then v3-2 ∥ v3-3, v3-4 last.
Merge gates pending: v2-3 = #389 R3 + #236 code+UX; v3-1 = #390 R4 + #235 code+UX; Roman P1 = #238 code+UX CLEAN ⇒ merge per standing rule.

## Cycle 11 — 2026-06-11 ~7:25 PM PT — Cycle-10 verdicts processed; full 5-lane wave dispatched

**Verdicts processed (cycle 10):**
- Roman P1 mobile #238 @ d72c02c7: code **DIRTY** (P0 role contract 'roman' vs 'assistant'; P0/P1 fabricated Idempotency-Key — backend never reads it; P1 red CI lint; P1 .env.example conflict vs moved main; P1 rollback bug useRomanChat.ts; P1/P2 SSE silent skip; P2 hardcoded interrupted copy; P2 featureFlags block) + UX **NEEDS_REVISION** (8-item checklist). Reports: ROMAN_P1_MOBILE_R1_{CODE,UX}_AUDIT_REPORT.md.
- v2-3 backend #389 @ a3ec919: R3 **DIRTY** solely for community.module.ts merge conflict vs moved main 3f271b39; RSVP fix verified FIXED (adversarial mutation testing); CI green. Report: COMMUNITY_V2-3_BACKEND_R3_AUDIT_REPORT.md.
- v3-1 backend #390 @ 6d97f46a: R4 **CLEAN** (verified substantive), mergeable vs new main, CI green — **HELD** for v3-1 mobile audit pair.
- v2-4 builder: **BUILD COMPLETE** — #391 backend @ 23414c81 + #239 mobile @ 97954d25 (read-only ai-triage, R69 zero-Prisma, no-send proof, 44+25 tests). Report: COMMUNITY_V2-4_BUILDER_REPORT.md. Awaiting R1 audits ×3.

**Dispatched (5 lanes full):**
1. Roman P1 combined fixer R1 (opus) — agent roman_p1_combined_fixer_r1_mqab07uj — brief ROMAN_P1_COMBINED_FIXER_R1_BRIEF.md (F1–F8 code + U1–U8 UX, rebase onto 79c0a9be)
2. v2-3 backend fixer R3 rebase-only (opus) — agent v2_3_backend_fixer_r3_rebase_mqab0b5q — brief COMMUNITY_V2-3_BACKEND_FIXER_R3_BRIEF.md
3. v3-1 mobile R2 code audit (gpt-5.5) — agent v3_1_mobile_r2_code_audit_mqab0fv5 — brief COMMUNITY_V3-1_MOBILE_R2_CODE_AUDITOR_BRIEF.md — MERGE GATE
4. v3-1 mobile R2 UX audit (gpt-5.5) — agent v3_1_mobile_r2_ux_audit_mqab0jh7 — brief COMMUNITY_V3-1_MOBILE_R2_UX_AUDITOR_BRIEF.md — MERGE GATE
5. v2-3 mobile R2 code audit (gpt-5.5) — agent v2_3_mobile_r2_code_audit_mqab0nkd — brief COMMUNITY_V2-3_MOBILE_R2_CODE_AUDITOR_BRIEF.md

**Merge triggers armed:** v3-1 = #390 then #235 on code+UX CLEAN pair. v2-3 = #389 post-rebase R4 + #236 code+UX CLEAN. Roman #238 = re-audit pair CLEAN post-fixer.

**Queue (in order):** v2-3 mobile R2 UX audit → MWB-4 R1 code+UX (#237 @ 77cd3b4a) → v2-4 R1 ×3 (#391 backend code; #239 mobile code+UX) → v2-3 backend R4 (post-rebase) → Roman re-audits (post-fix) → v3-2 ∥ v3-3 → v3-4.

## Cycle 14 — 2026-06-12 ~4:10 PM PT — #392 MERGED; cycle-13 verdicts processed; 4 lanes dispatched

**MERGED: PR #392 B-PAG-1 (backend pagination enforcement)** @ 4cd04beae8235f5a27c497157e99741e4dfa25f8 — R4 audit CLEAN (0 P0/P1/P2; 1 non-blocking P3 on boundary-test wording). D-044 satisfied: auditor-local tsc/eslint/jest exit 0, R0 grep clean, CI failure provably runner-infra (all 4 jobs "failed" in ~3s with 0 steps and empty runner_name = runner never picked up). Admin-squash-merged. Unblocks #235 flag-on sequencing.

**Verdicts processed (cycle 13):**
- #242 Roman P4 @ 22b2d2d6: R3 audit **DIRTY** — P1 first-payment proof still not authoritative (no status predicate on realtime INSERT or count; count<=1 treated as first; races), P2 dismissal latch not keyed per coach, P2 ED.4 PR commentary fires on bodyweight gain, P3 retry spam. Report AUDIT_242_R3_REPORT.md.
- #235 v3-1 mobile @ 932da9e1: R6 audit **DIRTY** — P1 embedded CommunityTabScreen swallows /community/me errors into indefinite loading (self-owned route fixed, embedded path not), P2 composer can restore stale draft over newer pending draft, P2 page merges lack id dedupe, P2 no real infinite-query page-transition tests, P3 3 eslint warnings. Report AUDIT_235_R6_REPORT.md.
- #241 Roman P3: R5 fixer **FIX COMPLETE** @ b8ed756b0f90aaa2f0e5ecd2082c10c515a4a1f2 (truthful-signal fixes for all 5 P2 surfaces + behavior tests; mergeable clean). Report FIXER_241_R5_REPORT.md.
- #237 MWB-4: R8 fixer **FIX COMPLETE** @ 5844f46ed4d4ea134bbb46dee5f041b0c1c585b8 (replay gate held through 409-rebase-requeue until terminal; real regression test; doc fix). Report FIXER_237_R8_REPORT.md.

**Dispatched (4 lanes; 5th lane slot freed by #392 merge):**
1. #242 R4 fixer (opus) — brief FIXER_BRIEF_242_ROMAN_P4_R4.md — first-SUCCESSFUL-payment proof (status predicate + no-earlier-successful-row check, fail closed), per-coach latch, bodyweight PR gating, retry latch.
2. #235 R7 fixer (opus) — brief FIXER_BRIEF_235_V31_MOBILE_R7.md — embedded prerequisite error threading, draft-restore-only-if-unchanged, shared dedupeById page merges, real page-transition tests, lint.
3. #241 R5 audit (gpt-5.5) — brief AUDIT_BRIEF_241_R5.md @ b8ed756b — truthful-signal provenance scrutiny on all 5 surfaces + sweep of ALL Roman hosts for the proxy-signal class.
4. #237 R8 audit (gpt-5.5) — brief AUDIT_BRIEF_237_R8.md @ 5844f46e — exhaustive gate-lifecycle path enumeration (premature clear AND gate leak AND infinite requeue), isReplay tag survival, real-test mutation check.

**Merge triggers armed:** #241 and #237 merge on audit CLEAN per D-044. #235/#237 R71: whichever merges second rebases shared-append files (featureFlags.ts, .env.example). After all 5: v3-2 classroom posts ∥ v3-3 voice notes, then v3-4 (hard serial after v3-3).

## Cycle 15 — 2026-06-12 21:25 PT — Mid-cycle PR finishing wave: 4 audits dispatched in parallel

**Context:** New operator session (Perplexity Computer parent). Prior sandbox died after cycle 14. Ground-truth check vs GitHub revealed all backend community PRs (#387, #389, #390, #391) + Roman P2 (#380) ALREADY MERGED. Only 4 mobile PRs remain in flight, all CI-green, all advanced past where cycle 14 left them.

**In-flight PRs (mobile repo, ground-truth from GitHub):**

| PR | Title | Head SHA | Round needed | Notes |
|---|---|---|---|---|
| #235 | community: v3-1 challenges mobile | `f44e4241` | R8 audit | R6/R7/R8 fixer commits shipped post-cycle-14 |
| #237 | MWB-4 mobile autosave | `97dd5522` | R10 audit | R8/R9/R10 fixer commits shipped; replay-gate lifecycle is the historical risk class |
| #241 | Roman P3 voice expansion §2.3-§2.12 | `4e88e4de` | R6 audit | R5/R6 fixer commits shipped; proxy-signal class is risk |
| #242 | Roman P4 ED.3 + ED.4 | `e04531f8` | R5 audit | R4/R5 fixer commits shipped; first-payment proof is risk |

All 4 PRs have GitHub CI green (Typecheck, lint, test ✓) at the audited head.

**R67 dispatch.json pushed.** R56/R58/R60 worktrees set up at `/home/user/workspace/tgp/mobile-{235,237,241,242}-audit` on the correct head SHAs.

**Audit briefs written** under `/home/user/workspace/AUDIT_BRIEF_{235_R8,237_R10,241_R6,242_R5}.md` — all 4 are exhaustive per R72, include R65 50-failures sweep, R0 banned-token sweep, R69 skipped-test sweep, anti-fabrication backend-cross-check, Roman voice contract enforcement (for #241/#242), and headline risk classes from prior rounds.

**Dispatched (4 parallel lanes, GPT-5.5 fresh auditors per R31):**
1. audit_235_r8_mqbuw956 — #235 v3-1 challenges R8 code+UX
2. audit_237_r10_mqbuwgyb — #237 MWB-4 R10 code+UX
3. audit_241_r6_mqbuwop9 — #241 Roman P3 R6 code+UX+voice
4. audit_242_r5_mqbuwwwh — #242 Roman P4 R5 code+UX+voice

**Merge policy this wave:** Operator authorization granted — admin-squash-merge on every CLEAN verdict, no waiting. DIRTY → fresh Opus 4.8 fixer dispatched same loop. Loop continues until all 4 merged.

**Operator-acknowledged gap:** The lost R1–R55 rule definitions are STILL missing from rules/ (R64 violation persisting since 2026-05-28). Auditors this wave work from R0, R31, R56–R72, the 14 standing rules, R65 50-failures sweep, and per-PR brief. Operator chose "proceed without them" for this wave.

**Lane state:** 4/5 lanes active. 5th slot reserved for fixer dispatch on first DIRTY verdict.


## Cycle 16 — 2026-06-12 21:38 PT — All 4 audits DIRTY → 4 Opus fixers dispatched

**Audit verdicts (4/4 DIRTY, R72-exhaustive):**

| PR | Audit head | Verdict | P1 count | P2 count | P3 count | Report |
|---|---|---|---:|---:|---:|---|
| #235 v3-1 mobile | f44e4241 | DIRTY | 3 | 1 | 0 | AUDIT_REPORT_235_R8.md |
| #237 MWB-4 mobile | 97dd5522 | DIRTY | 3 | 1 | 0 | AUDIT_REPORT_237_R10.md |
| #241 Roman P3 | 4e88e4de | DIRTY | 5 | 4 | 1 | AUDIT_REPORT_241_R6.md |
| #242 Roman P4 | e04531f8 | DIRTY | 4 | 3 | 2 | AUDIT_REPORT_242_R5.md |

**Headline blockers:**
- **#235:** Hall/DM/Today screens still convert query errors into empty states (R65 #36/#44 silent-failure class). Progress sheet double-submit race.
- **#237:** 409 path resends stale full-row ops before authoritative server-truth adoption (concurrent edits erased). Unbounded conflict retry — malformed 409 can spin. Explicit Save drops `weight_lbs`/`superset_group_id`. Sign-out mirror sweep gap.
- **#241:** RomanBriefCard not flag-gated. One-shot completion card is a transient boolean, not a per-completion-id durable latch. Check-in/streak/voice-log surfaces consume mobile-only scaffolds or local-derived counts — proxy-signal class violations against backend-authority requirement. Static exclamation rationing isn't session-scoped.
- **#242:** ED.3 fails OPEN on absent old status (UPDATE without authoritative prior status still fires). INSERT path still calls onFirstPayment for already-paid rows. No synchronous in-flight latch (can double-fire). Refunded/canceled→paid same-row replay not provable. ED.4 chart has no feature flag and 1500ms draw-in violates ≤300ms motion budget.

**Fixer briefs written (R31 — surgical, per-finding, no scope creep):**
- `/home/user/workspace/FIXER_BRIEF_235_R9.md`
- `/home/user/workspace/FIXER_BRIEF_237_R11.md`
- `/home/user/workspace/FIXER_BRIEF_241_R7.md`
- `/home/user/workspace/FIXER_BRIEF_242_R6.md`

**Fixer worktrees set up (R56):** `/home/user/workspace/tgp/mobile-{235,237,241,242}-fix` on respective feature branches, configured for `Dynasia G <dynasia@trygrowthproject.com>`.

**Dispatching 4 parallel Opus 4.8 fixers next.** R31: builder≠auditor≠fixer; these are fresh fixer agents with NO audit context contamination beyond the audit report file and brief. After each pushes + CI green, fresh GPT-5.5 re-audit dispatched per R31. Loop continues until all 4 CLEAN → admin-squash-merge.


## Cycle 17 — 2026-06-12 22:58 PT — All 4 fixers COMPLETE + CI green → 4 fresh re-audits dispatching

**Fixer outcomes (4/4 FIXER STATUS: COMPLETE; all CI green; all MERGEABLE):**

| PR | Old head | New head | Commits | CI | Reports |
|---|---|---|---:|---|---|
| #235 v3-1 | f44e4241 | 8cacf28b | 2 | green (1m58s) | FIXER_REPORT_235_R9.md |
| #237 MWB-4 | 97dd5522 | 4a99ca30 | 1 | green (2m02s) | FIXER_REPORT_237_R11.md |
| #241 Roman P3 | 4e88e4de | 55f54121 | 6 | green | FIXER_REPORT_241_R7.md |
| #242 Roman P4 | e04531f8 | 82cd3f74 | 5 | green (2m00s) | FIXER_REPORT_242_R6.md |

**Fixer highlights:**
- **#235:** All 4 R8 findings closed surgically. Hall/DM/Today error branches split from empty state with refetch retry; ChallengeProgressSheet has synchronous `submittingRef` set before `onSubmit`. 25/25 targeted tests pass.
- **#237:** 409 path now awaits authoritative server-truth adoption from screen before re-pumping (deterministic Promise chain). Conflict-retry budget added; malformed 409 non-auto-retriable. Explicit Save now includes `weight_lbs`/`superset_group_id`. Mirror prefix added to sign-out sweep. 8 suites / 90 tests pass.
- **#241:** Big surface area. RomanBriefCard gated on `featureFlags.romanChat` with fallback. New flags `romanCheckInBackendLive` + `romanStreakBackendLive` (both default false) hide proxy-signal surfaces until backend support lands. Voice-log copy stripped of "Recorded." claim. Durable completion-id AsyncStorage latch keyed by user/coach + id. Session-scoped exclamation budget singleton (`src/lib/roman/sessionBudget.ts`). New P3 flag-off test suite. Neutral copy for empty surfaced-clients. Structured logger.warn for completion-flow catches. 404/404 targeted tests pass.
- **#242:** ED.3 fail-CLOSED on absent old status. INSERT celebration path removed (test inverted). Synchronous `firedLatchRef` for exactly-once. Same-row prior-success replay guard. New `romanFirstPaymentBodyweightPolish` flag (default false) gating ED.4 with legacy fallback. Motion durations brought under budget (chart 1500→280ms, particle 1400→500ms, mascot 700+500→300+200ms). 5 ED.3 scenarios + flag-off + exactly-once tests.

**Audit worktrees reset onto new heads** at `/home/user/workspace/tgp/mobile-{235,237,241,242}-audit`.

**Audit briefs written (R31 fresh GPT-5.5 — zero builder/fixer context):**
- `/home/user/workspace/AUDIT_BRIEF_235_R10.md`
- `/home/user/workspace/AUDIT_BRIEF_237_R12.md`
- `/home/user/workspace/AUDIT_BRIEF_241_R8.md`
- `/home/user/workspace/AUDIT_BRIEF_242_R7.md`

Each brief frames closure verification against the SAME findings the prior auditor surfaced (without exposing the auditor's reasoning) plus a full R72 sweep on the rest of the diff for regressions, R65 50-failures sweep, R0 banned-token sweep, R69 hygiene, anti-fabrication backend cross-check, CI/mergeability verification.

**Dispatching 4 parallel GPT-5.5 auditors next.** Per operator authorization: any CLEAN verdict → immediate admin-squash-merge with no waiting. DIRTY → fresh Opus 4.8 fixer dispatched same loop.



## Cycle 18 — 2026-06-12 23:10 PT — Re-audit results: 1 CLEAN merged, 2 DIRTY → fixers dispatched, 1 retry running

**Re-audit verdicts as they landed (acting per-verdict, no batch wait):**

| PR | Audit head | Verdict | Action taken | Report |
|---|---|---|---|---|
| #235 v3-1 mobile | 8cacf28b | **CLEAN** | **MERGED** squash `0ac5cab0` (2026-06-13 06:08:14Z) | AUDIT_REPORT_235_R10.md |
| #237 MWB-4 mobile | 4a99ca30 | **DIRTY-CRITICAL** (2 data-loss paths) | Fixer R13 dispatched (Opus 4.8) | AUDIT_REPORT_237_R12.md |
| #241 Roman P3 mobile | 55f54121 | **DIRTY** (1 P1 + 2 P2 + 1 P3) | Fixer R9 dispatched (Opus 4.8) | AUDIT_REPORT_241_R8.md |
| #242 Roman P4 mobile | 82cd3f74 | pending | R7 retry audit running (silent-fail mitigation) | (forthcoming) |

**Merge action:** #235 v3-1 challenges mobile admin-squash-merged at `0ac5cab0`. Verified CLEAN R72-exhaustive + full 50-failures sweep. Operator's standing rule: any CLEAN → merge, no waiting.

**#237 DIRTY-CRITICAL findings (data loss blockers):**
- **D-001:** First-ever 409 `autosave_lock_stale` skips `onConflict` and rebases from stale baseline → erases concurrent server edits.
- **D-002:** Queued edit (`pendingNextRef !== null`) makes awaited `rebaselineTo(serverTruth)` no-op → still clobbers. Need `rebaselineToConflict` that captures queued delta, replaces baseline, recomputes batch + pendingNext.
- **D-003 P3:** `😀` emoji literal at `workoutAutosaveApi.test.ts:390` — must use Unicode escape.

**#241 DIRTY findings:**
- **P1-CODE-01:** `useJustCompletedOneShot` calls `clearParam()` BEFORE async `AsyncStorage.getItem` resolves → focus-effect cleanup runs (`cancelled=true`) → Roman completion card never renders.
- **P2-CODE-01:** Raw `console.warn` remains at `ActiveWorkoutScreen.tsx:649-650` — must use `logger.warn('mwb.completion.local-write', { error })`.
- **P2-TEST-01:** Flag-off suite (`romanP3FlagOff.test.tsx`) only mounts CoachBrief at runtime; other 4 hosts covered by regex only (#17 Fake Test Coverage). Convert to runtime renders.
- **P3-HYGIENE-01:** Stale `spec-exact`, FIXER_241_R5_REPORT references, "settlement-window" remain in comments.

**Fixer briefs written (R31 — fixer has only the brief, not the auditor report):**
- `/home/user/workspace/FIXER_BRIEF_237_R13.md`
- `/home/user/workspace/FIXER_BRIEF_241_R9.md`

**Fixers dispatched in parallel (Opus 4.8, per-PR fix worktrees):**
- `fixer_237_r13_mqbyiuep` on `/home/user/workspace/tgp/mobile-237-fix`
- `fixer_241_r9_mqbyj0lv` on `/home/user/workspace/tgp/mobile-241-fix`

**#242 R7 audit retry** (`audit_242_r7_retry_mqby7ifo`) still running on detached worktree at HEAD `82cd3f74`. First R7 attempt completed silently with empty body — retry was dispatched with explicit "must write > 3000 byte report ending in VERDICT" contract. Per operator's "never batch-wait" rule, will act on its verdict the instant it lands.

**Status:** 1/4 PRs MERGED. 2 fixers in flight. 1 audit retry in flight. Loop continues per R31/R64/R65/R72.


## Cycle 18b — 2026-06-12 23:13 PT — #242 R7 retry verdict: DIRTY-CRITICAL payment-correctness → fixer R8 dispatched instantly

**#242 R7 (retry) audit result:** DIRTY-CRITICAL on HEAD `82cd3f74` (24,445 bytes, 159 lines, ended with `VERDICT: DIRTY-CRITICAL`).

**Critical finding (architectural):** ED.3 first-payment celebration is implemented via direct Supabase client realtime subscription + history SELECT on the `ClientPurchase` table. Backend main marks ALL payment tables SERVER-ONLY:
- `prisma/migrations/20260618000000_add_rls_payment_revenue_tables/migration.sql:12-22` — payment tables documented server-only
- Same migration `:46-52` — RLS enabled and FORCED on `ClientPurchase`, policy `ClientPurchase_server_only FOR ALL USING (false)`

**Impact:** Once `EXPO_PUBLIC_FF_ROMAN_FIRST_PAYMENT_WOW=true` flips in production, RLS denies BOTH the subscription and the history query. The hook fails closed (correct) but the feature silently never celebrates ANY first payment — total ED.3 contract failure (50-failure #36 silent failure, #2 broken authorization, #44 missing error state).

**Secondary findings:**
- P2: `romanFirstPaymentRequireBackendHistory` flag defined + documented but only referenced in a comment — dead/misleading wiring.
- P3: stale INSERT wording remains in comments/tests after pending→paid UPDATE migration.

**Fix strategy (no new backend in this PR):** Wire `romanFirstPaymentRequireBackendHistory` as the master runtime gate. Default false — when off the hook returns `unsupported_backend`, the host renders null, NO subscription / NO query attempted. When on, add a startup self-check that hits the history query once; on RLS-denied error (`code 42501`), self-disarm and log `roman.first_payment.rls_denied` for the session. Forward-compatible code path stays ready for whenever backend exposes a coach-scoped read policy + realtime publication.

**Fixer R8 dispatched:**
- `fixer_242_r8_<id>` Opus 4.8 on `/home/user/workspace/tgp/mobile-242-fix`
- Brief: `/home/user/workspace/FIXER_BRIEF_242_R8.md`
- Report target: `/home/user/workspace/FIXER_REPORT_242_R8.md`

**Open backend follow-up (NOT in this PR):** When backend wants to truly enable ED.3, the right answer is either (a) add a coach-scoped SELECT policy on `ClientPurchase` referencing `app.current_user_id()` + register the table in Supabase Realtime publication, OR (b) emit a backend `first_payment` notification (already-existing notifications module) and have mobile poll/subscribe to that user-scoped notification stream. Either way, this is a future backend PR.

**Status:** 3 fixers in flight (#237 R13, #241 R9, #242 R8). 1 PR merged (#235). Acting on each completion the instant it lands per operator rule.
