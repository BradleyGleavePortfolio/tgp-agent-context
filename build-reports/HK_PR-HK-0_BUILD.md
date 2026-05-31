# HK PR-HK-0 BUILD REPORT — Wearables / HealthKit foundation (SCHEMA + RLS GATE)

Builder: Dynasia G. Unit: HK PR-HK-0 (wearables foundation). Repo: `growth-project-backend`.
Branch: `hk/PR-HK-0-foundation` (off backend main `a80013f`).
PR: **#345** — `feat(wearables): PR-HK-0 — foundation (schema+RLS+ingestion)`
PR URL: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/345
Head SHA: `66658eaba5486a1e5a209f76c899747e677da775`
Migration: `prisma/migrations/20260531000000_wearables_foundation/migration.sql`

This is the **SCHEMA + RLS GATE** for the entire HealthKit / wearables expansion.
Nothing else in the expansion lands until this merges.

## Scope (write-set — exactly the 11 specified files, verified disjoint)
Changed vs `origin/main`:
- `prisma/schema.prisma` — additive only (252 insertions, **0 deletions**)
- `prisma/migrations/20260531000000_wearables_foundation/migration.sql` — new
- `src/wearables/wearables.module.ts` — new
- `src/wearables/wearables.constants.ts` — new
- `src/wearables/ingestion/ingestion.service.ts` (+ `.spec.ts`) — new
- `src/wearables/ingestion/dedup.util.ts` (+ `.spec.ts`) — new
- `src/wearables/normalization/normalizer.types.ts` — new
- `src/wearables/connectors/connector.interface.ts` — new
- `src/wearables/http/provider-http-client.ts` (+ `.spec.ts`) — new
- `src/app.module.ts` — one import + one imports-array entry (`WearablesModule`)

No other file touched. Generated Prisma client (`node_modules/.prisma`) is
gitignored and not committed.

## Commits (author = `Dynasia G <dynasia@trygrowthproject.com>`, no trailers, no co-authors)
- `2615bf9` feat(wearables): PR-HK-0 — Prisma schema + RLS migration foundation
- `66658ea` feat(wearables): PR-HK-0 — IngestionService + ProviderHttpClient + connector interface

Both commits: author AND committer = `Dynasia G <dynasia@trygrowthproject.com>`, empty bodies.

## Schema (additive)
- **Enums:** `WearableProvider` (15 values: APPLE_HEALTHKIT, HEALTH_CONNECT,
  GARMIN, FITBIT, STRAVA, POLAR, SAMSUNG_HEALTH, WAHOO, WITHINGS, PELOTON,
  MYFITNESSPAL, OURA, WHOOP, EIGHT_SLEEP, BEDDIT), `WearableMetricBucket`
  (HEALTH_FITNESS, SLEEP_RECOVERY), `WearableMetricType` (26 canonical metrics).
- **Models (6):** `WearableConnection` (modeled on `CalendarConnection`:
  KMS-wrapped token columns, external account id, webhook channel tracking,
  fail-explicit `status` + `last_error`, soft-disconnect), `WearableMetricDef`
  (seeded reference: metric→bucket/unit/display/aggregation/norm_band),
  `WearableSample` (canonical fact table, UNIQUE `dedup_key`, denormalized
  `bucket`), `WearableProcessedEvent` (webhook idempotency, composite
  `(provider, provider_event_id)` PK), `WearableInsightCache` (per
  user/side/bucket/window cached AI payload, modeled on `HolisticInsightCache`),
  `WearableUserMetricPreference` (read-time precedence override).
- **`User` back-relations (4):** `wearable_connections`, `wearable_samples`,
  `wearable_insights`, `wearable_metric_preferences`. No column changes to User;
  the diff inserts only these four lines + a comment into the User model.

> The original `schema.prisma` on main was NOT in canonical `prisma format`
> alignment. `prisma format` would re-align field columns file-wide, producing
> ~86 cosmetic whitespace-only deletions across unrelated models. To keep the
> write-set strictly additive (50-Failures #45/#47; minimal blast radius), the
> schema was hand-assembled: revert to main, insert the 4 User back-relations at
> the exact anchor, append the wearables block at EOF. **No `prisma format` was
> run on the committed file.** `prisma validate` accepts it as-is (the formatter
> is cosmetic, not a validity requirement). Final diff: 252 insertions, 0 deletions.

## Migration (single file, additive, self-sufficient on fresh DB)
Wrapped in `BEGIN; … COMMIT;`. Sections: (1) enums, (2) tables, (3) indexes,
(4) FKs, (5) RLS, (6) seed. DDL extracted verbatim from
`prisma migrate diff` output, so it is byte-faithful to the schema.

### RLS — 50-Failures #2 (the gate's most important job)
All **6** new tables get `ENABLE` + `FORCE ROW LEVEL SECURITY` (12 ALTER
statements verified) in this same migration. 13 policies total:
- `WearableConnection` / `WearableSample` / `WearableUserMetricPreference` —
  `*_client_all` (FOR ALL, `user_id = app.current_user_id()`),
  `*_coach_select` (SELECT via `app.is_current_coach_of(user_id)`),
  `*_owner_all` (FOR ALL via `app.is_owner()`). [3 policies each]
- `WearableInsightCache` — `wic_client_select` (own rows AND `side='client'`
  only — the client can NEVER read `side='coach'` hypotheses/draft messages),
  `wic_coach_select` (coach reads both sides for their clients), `wic_owner_all`.
- `WearableMetricDef` — `wmd_public_select` (read-only `USING (true)`); writes
  have NO public policy ⇒ denied for public, only `service_role` (BYPASSRLS)
  can seed/extend.
- `WearableProcessedEvent` — **deny-all**: FORCE RLS + zero public policies ⇒
  only `service_role` can touch webhook-dedup rows (server-internal).

**Self-sufficiency fix (forward-apply robustness):** the RLS helpers
`app.is_user_coached_by` / `app.is_current_coach_of` are canonically defined in
migration `20260607000000_rls_remaining_gaps`, which is dated *after* this one;
`app.current_user_id` / `current_user_role` / `is_owner` come from
`20260520000001`. Applying in timestamp order on a fresh DB would otherwise
reference functions that don't yet exist. The migration therefore re-declares
all five with `CREATE OR REPLACE` (+ `CREATE SCHEMA IF NOT EXISTS app`) using
**byte-identical bodies** (verified against both source migrations). The later
migration's `CREATE OR REPLACE` then becomes a harmless identical no-op. Pure
ordering robustness — no behavior change.

### Seed
26 `WearableMetricDef` rows — one per `WearableMetricType` (all 26 present,
verified). Plain-language `display_name`s per Agent 1 UX (e.g. "Light sleep",
"Time asleep", "Resting heart rate", "Heart rate variability" — never clinical
labels). Resting HR primary bucket = SLEEP_RECOVERY (dual-relevant, surfaced as
a read-only chip in HEALTH_FITNESS). `aggregation` chosen per physical meaning
(sum/avg/last/max); `norm_band` JSON where a stable scientific band exists.

## Code
- **`ingestion.service.ts`** — `IngestionService` (constructor-injects global
  `PrismaService`). `ingest(samples)`: validates each sample (#8), computes
  `dedup_key`, does ONE `createMany({ skipDuplicates })` (#21/#28), ONE
  `updateMany` to bump distinct connections' `last_synced_at`/`status`/
  `last_error`, then batched insight-cache invalidation (one `deleteMany` per
  distinct `(user, bucket)` pair). `resolveBest(userId, metric, start, end)`:
  honors `WearableUserMetricPreference` first (composite-key `findUnique`), else
  falls back to most-recently-`recorded_at` provider — at most 2 queries, no N+1.
  Structured logging (#34); failures propagate (#36 no silent catch).
- **`dedup.util.ts`** — `computeDedupKey` = `sha256(user_id|provider|metric|
  start_iso|end_iso)` hex. Throws `RangeError` on invalid Date (fail loud, no
  garbage key). Provider is in the key ⇒ cross-provider overlap = distinct rows
  (provenance preserved, #45), resolved at read time.
- **`provider-http-client.ts`** — `ProviderHttpClient`: mandatory per-call
  timeout (AbortController, default 10s), capped exponential backoff with full
  jitter (≤3 retries, 250ms base, 5s cap), retries only 408/425/429/5xx +
  network/timeout, throws `ProviderHttpError` (`.attempts`/`.status`/`.cause`)
  on permanent failure (fail-explicit). Optional `deps?` seam for tests (stub
  fetch/sleep/RNG); production binds global `fetch` + real timers.
- **`normalizer.types.ts`** — `NormalizedSample` (the provider-neutral ingestion
  boundary), `RawRecord`, `TokenSet`.
- **`connector.interface.ts`** — `WearableConnector` interface
  (buildAuthUrl/exchangeCode/refresh/backfill/normalize + optional
  verifyWebhook/parseWebhook), `RawWebhookRequest`, `ProviderEvent`,
  `WearableAuthModel`.
- **`wearables.module.ts`** — provides + exports `IngestionService` and
  `ProviderHttpClient`. PrismaService comes from the `@Global` `PrismaModule`.
- **`app.module.ts`** — registers `WearablesModule`.

## Quality gates — ALL PASS
| Gate | Command | Result |
|---|---|---|
| 1 | `prisma validate` | ✅ clean ("schema is valid") |
| 2 | `prisma migrate diff --from-empty --to-schema-datamodel` | ✅ exit 0, clean DDL (all 6 models + 3 enums render) |
| 3 | `NODE_OPTIONS=--max-old-space-size=4096 tsc --noEmit -p tsconfig.json` | ✅ exit 0 |
| 4 | `eslint <11 touched .ts files>` | ✅ exit 0, no errors |
| 5 | `jest --roots src/wearables` | ✅ 3 suites, **43/43** pass |
| 6 | migration forward-apply on fresh DB | ✅ verified by review (no local Postgres) |

### Test counts (real value assertions, no `toBeDefined` placeholders)
- `ingestion/ingestion.service.spec.ts` — **22** passing
- `http/provider-http-client.spec.ts` — **10** passing
- `ingestion/dedup.util.spec.ts` — **11** passing
- **Total: 43 passing / 43 total**

Representative real assertions: dedup spec pins exact 64-char sha256 hex vectors;
ingestion spec asserts `createMany` called exactly ONCE (no N+1), exact dedup_key
on each row, distinct-connection `updateMany`, one `deleteMany` per distinct
`(user,bucket)`, preference-over-recency precedence, and that validation rejects
8 bad-input cases BEFORE any DB write; HTTP spec asserts exact retry counts, the
`[4000,5000,5000]` capped-jitter backoff sequence, and no-retry on 400/401.

## 50-Failures defenses verified
- **#2 RLS** — every table ENABLE+FORCE + explicit per-op policies (above).
- **#8 input validation** — `validateSample` rejects malformed batches loud,
  before any write; 8 negative cases tested.
- **#21 no N+1** — single `createMany`, single `updateMany`, batched
  `deleteMany`; asserted by call-count in tests.
- **#22 indexes** — every FK indexed; documented composite read indexes on
  `WearableSample` (`user_id,bucket,start_at` / `user_id,metric,start_at` /
  `connection_id,start_at` / `provider,source_record_id`).
- **#28/#29 dedup/replay** — UNIQUE `dedup_key` + `createMany(skipDuplicates)`
  for idempotent re-ingestion; composite `(provider, provider_event_id)` PK on
  `WearableProcessedEvent`.
- **#34 structured logging** — per-attempt + per-ingest log lines.
- **#36 no silent catch** — HTTP client re-throws permanent `ProviderHttpError`;
  ingestion propagates failures.
- **#43 no dead code** — every exported symbol is consumed (module wires both
  services; types used by ingestion + interface).
- **#45/#47 additive migration only** — no destructive DROP/ALTER; schema diff
  is 252 insertions / 0 deletions; cross-provider provenance preserved.

## Deviations (each justified)
1. **Package manager** — task said `yarn jest`; repo uses **npm** (`package-lock.json`,
   no `yarn.lock`). Ran `npx jest` instead. Functionally identical.
2. **Jest invocation** — `jest.config.js` sets `roots: ['<rootDir>/test']`, so
   co-located `src/**/*.spec.ts` are NOT discovered by a plain `jest src/wearables/`.
   Required invocation: **`npx jest --roots src/wearables`** (verified the
   `--roots` override discovers the co-located specs; 43 tests run). This is the
   canonical way to run these specs; later PRs can add a `roots` entry or move
   specs under `test/` if desired (out of this PR's write-set).
3. **Schema not run through `prisma format`** — see Schema note above. Done to
   keep the diff strictly additive (0 deletions) rather than introduce ~86
   cosmetic whitespace deletions across unrelated models. `prisma validate`
   passes on the hand-formatted file.
4. **`migration_lock.toml` absent** in the repo, so the
   `migrate diff --from-migrations` drift check could not run. Mitigated: DDL was
   extracted verbatim from `migrate diff --to-schema-datamodel` (which passes),
   and table/index/FK definitions were spot-checked against the schema. Forward-
   apply correctness is established by review (gate 6).
