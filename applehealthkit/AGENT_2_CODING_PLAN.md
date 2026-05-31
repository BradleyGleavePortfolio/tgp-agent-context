# AGENT 2 — HealthKit / Wearables Expansion Coding Plan

**Author:** Dynasia G <dynasia@trygrowthproject.com>
**Created:** 2026-05-31
**Role:** Existing-foundation audit + concrete PR-chunked coding plan with parallelization avoiding rebase collisions
**Companion:** `AGENT_1_UX_PLAN.md` (UX bible study), synthesized into `UNIFIED_BUILD_PLAN.md`
**Quality bar:** R0 decacorn. Every PR audited against `The-50-Failures-of-AI-Generated-Code-at-Enterprise-Scale.txt`.

> This plan is written to be picked up and executed by a builder with no further discovery. Every PR specifies its write-set (the files it owns), dependencies, parallelization lanes, effort, audit criteria, and the 50-Failures items it must guard against. All schema and code patterns are anchored to **existing** modules in `growth-project-backend` and `growth-project-mobile` so we reuse — never reinvent (guards #15, #40, #41).

---

## 0. Executive Summary

The backend (`growth-project-backend`, NestJS + Prisma + Supabase Postgres, 124 models, 34 enums) and mobile app (`growth-project-mobile`, React Native + Expo, React Query + axios) already contain **every architectural primitive** this expansion needs. We are not greenfielding; we are extending proven patterns:

| Need | Existing primitive to reuse | Location |
| --- | --- | --- |
| Per-user external OAuth connection w/ encrypted tokens, webhook channel tracking, last-sync, soft-disconnect | `CalendarConnection` model + `KmsService` | `prisma/schema.prisma`, `src/common/kms/` |
| Webhook ingestion w/ HMAC signature verify, raw-body, idempotency dedupe table | `StripeWebhookController` + `StripeProcessedEvent` | `src/billing/stripe-webhook.controller.ts`, `src/billing/stripe-signature.ts` |
| AI insight cache (per-user, TTL, expiry index) | `HolisticInsightCache` | `prisma/schema.prisma` |
| AI draft → approval → materialise (one-tap coach send, idempotent) | `AiActionDraft` + `AiRequestAudit` + materialiser gateway | `src/ai/gateway/`, `AiActionDraft` model |
| Coach-side AI panel + cron insight generation | `src/ai/coach/` (`coach-ai.service`, `weekly-insight.cron`) | `src/ai/coach/` |
| Coach message draft → send to existing messaging | `MessageDraft` → `CoachMessage` / `Message` | `src/messaging/`, `src/messages-safety/` |
| RLS doctrine: `app.current_user_id()`, `app.is_owner()`, `app.is_current_coach_of(clientId)` | RLS helper functions (SECURITY DEFINER) | `prisma/migrations/20260607000000_rls_remaining_gaps/` |
| Mobile per-provider connector API client + typed envelope | `holisticInsightsApi.ts`, `coachAiExecutionApi.ts`, `services/api.ts` (token-refresh contract) | `src/api/`, `src/services/api.ts` |
| Coach client-detail tabbed view (where coach AI panel lands) | `src/screens/coach/client-detail/` | `SummaryTab.tsx`, `useClientDetailData.ts` |

**Core architectural decision:** A single canonical normalization layer (`WearableSample` keyed by canonical `WearableMetric` + time bucket) ingested by provider-specific connector modules behind a shared `IngestionService`. Each provider connector is a **file-disjoint module folder** so 20 connector PRs run fully in parallel after the foundation lands. The two UX "buckets" (Health & Fitness, Sleep & Recovery) are a **per-metric taxonomy attribute**, NOT a per-provider or per-table split — devices report to both buckets (Apple Watch logs workouts AND sleep). UI filters by `bucket`; ingestion is bucket-agnostic.

**Critical 50-Failures defenses baked into the foundation (not bolted on later):**
- **#2 (RLS) — the CPO 50-table-RLS-hole lesson:** every new table ships with `ENABLE` + `FORCE ROW LEVEL SECURITY` and explicit per-operation policies **in the same migration as the table creation**. No table is ever created without RLS in the same PR. We do NOT extend the unaudited-table count.
- **#1/#infra token encryption:** OAuth refresh tokens stored only as KMS-wrapped ciphertext via existing `KmsService` (AES-256-GCM envelope), mirroring `CalendarConnection.encrypted_refresh_token`. Never plaintext, never in git.
- **#28/#29 (concurrency/replay):** provider webhooks deduped via a `WearableProcessedEvent` table (Stripe model) keyed on provider event id; sample upserts use a deterministic dedup key so retries/overlapping providers never double-count.
- **#8 (phantom validation):** Zod (or class-validator, matching repo convention) runtime schemas on every webhook payload and API boundary.
- **#35/#50 (timeouts / graceful degradation):** every provider HTTP call has an explicit timeout + exponential backoff; provider outage fails **explicit** (connection status → `error`, surfaced to coach) not silent.

---

## 1. Existing Foundation Audit

### 1.1 Backend modules we build on

Audit method: `grep -ri "healthkit|oura|whoop|wearable|garmin|fitbit|strava" src/ --include="*.ts" -l` returns only **3 incidental references** (`ai/client-ai-context.types.ts`, `ai/gateway/materialisers/send-notification.materialiser.ts`, `insights/holistic-insights.service.ts`) — i.e. **no existing wearable connector code**. This is a clean greenfield *feature* on a mature *platform*. Confirmed: no `oura`/`whoop`/`garmin` modules exist.

Reusable modules (verified present):

- **`src/billing/` — webhook ingestion model.** `StripeWebhookController` is the gold-standard pattern for provider webhooks: `@Public()` route, `@Throttle()` rate limit, raw-body HMAC signature verification (`verifyStripeSignature`), dual-secret rotation support (`STRIPE_WEBHOOK_SECRET` + `_NEXT`), reject-on-missing-secret (fail loud), idempotency via `StripeProcessedEvent`. **Every provider webhook controller copies this structure** with provider-specific signature schemes.
- **`src/common/kms/` — `KmsService`.** AES-256-GCM envelope encryption used today to wrap `CalendarConnection.encrypted_refresh_token`. Reused verbatim for all provider OAuth refresh tokens.
- **`src/secrets/` — `SecretsService`.** Pointer-based secret store (`credentials_secret_ref` pattern). Reused for provider client secrets / webhook secrets.
- **`src/ai/` — full AI stack.** `ai.service.ts`, `ai-guardrails.service.ts`, `gateway/` (with `materialisers/`), `context/client-context.service.ts`, `prompts/` (`client-insight.prompt.ts`), `coach/` (`coach-ai.service.ts`, `coach-ai-execution.controller.ts`, `weekly-insight.cron.ts`). The dual-role insight + draft + approval + materialise loop **already exists** for coach messaging — we extend it with wearable-bucket prompt templates and context providers.
- **`src/insights/` — `HolisticInsightsController/Service`.** Read-only cross-pillar insight envelope with server-side caching and status enum (`ok | insufficient_data | finance_unavailable`). The cache posture (24h success, force-refresh bypass) and envelope shape are the template for wearable insight endpoints.
- **`src/messaging/` + `src/messages-safety/` — messaging system.** Target for approved AI-drafted coach messages (the approval workflow links here, NOT a new messaging system).
- **`src/throttler/` — `ThrottlerModule`.** Already wired (`@Throttle({ default: { ttl, limit } })`). Reused for per-provider rate-limit middleware and ingestion endpoints.
- **`src/prisma.service.ts` + RLS context** — RLS uses `current_setting('app.current_user_id')` / `app.current_user_role` set per request. Helper functions live in migration `20260607000000_rls_remaining_gaps`.

### 1.2 Patterns we reuse (explicit mapping)

| New component | Modeled on | Why |
| --- | --- | --- |
| `WearableWebhookController` (per provider) | `StripeWebhookController` | raw-body, HMAC verify, throttle, public route, idempotency dedupe, fail-loud on missing secret |
| `WearableProcessedEvent` | `StripeProcessedEvent` | replay/dedupe by provider event id, TTL ≥ provider redelivery window |
| `WearableConnection` | `CalendarConnection` | OAuth tokens (KMS-wrapped), external account id, webhook channel tracking, last-sync, soft-disconnect, `@@unique([user_id, provider, external_account_id])` |
| `WearableInsightCache` | `HolisticInsightCache` | per-(user, side, bucket, window) cached AI payload, `expires_at` index |
| `WearableInsightDraft` / coach message draft | `AiActionDraft` + `MessageDraft` | draft → approve → materialise → existing messaging, idempotent via `materialised_at` |
| Insight audit | `AiRequestAudit` | provenance refs, redaction counts, approval status, token estimates |
| Mobile connector API clients | `holisticInsightsApi.ts` / `coachAiExecutionApi.ts` | typed envelope mirroring backend types, React Query cache keys |
| Mobile auth on connector calls | `services/api.ts` token-refresh contract | reuse axios instance — never a second http client (#40/#41) |

### 1.3 Prisma models to extend vs create

**Extend (additive only — no destructive column changes, guards #45/#47):**
- `User` — add back-relations for `WearableConnection[]`, `WearableSample[]`, `WearableInsightCache[]`, `WearableInsightDraft[]` (relation fields only; no column changes to `User`).

**Create (all new — §2 below):** `WearableProvider` (enum), `WearableConnection`, `WearableMetricDef`, `WearableSample`, `WearableProcessedEvent`, `WearableInsightCache`, `WearableInsightDraft` (→ reuses `AiActionDraft` for the coach-send approval, see §2.7).

### 1.4 Existing RLS posture & the 50-table RLS hole

The CPO Master Handoff (§NM-1, RLS table map) documents the doctrine learned the hard way:
- Tables were historically created **without** RLS, leaving a backlog of unaudited tables exposed to direct PostgREST/Supabase-client access (the "50-table RLS hole"). RLS-01/RLS-02 were remediation PRs closing those gaps after the fact.
- **Lesson applied here:** we never repeat the after-the-fact remediation. Every wearable table is created **with RLS enabled + forced + policies in the same migration** (PR-HK-0). The audit brief for PR-HK-0 fails the PR if any new table lacks `FORCE ROW LEVEL SECURITY` or an explicit policy for each of SELECT/INSERT/UPDATE/DELETE.
- Helper functions to reuse (already `GRANT`ed to `service_role, anon, authenticated`):
  - `app.current_user_id()` → text (NestJS-set per-request)
  - `app.current_user_role()` → text
  - `app.is_owner()` → boolean
  - `app.is_current_coach_of(client_user_id text)` → boolean (SECURITY DEFINER; true when caller is the client's current coach)
- **Ingestion writes** run under the Supabase `service_role` (RLS-exempt by Postgres `BYPASSRLS` on that role) — webhook/sync jobs are not user-authenticated, so client/coach policies do not block ingestion. Client/coach policies govern only **read** paths via the authenticated app.

This is the single most important defense in the whole plan: **no new table escapes RLS at birth.**

### 1.5 Mobile foundation

- **Navigation:** stack-per-tab (`ClientNavigator.tsx`, `CoachNavigator.tsx`). Client bottom tabs: Home / Workout / … / More. New bucket screens register as stack screens (and/or a new tab per Agent 1's IA).
- **Coach client-detail:** `src/screens/coach/client-detail/` is a tabbed view (`SummaryTab`, `ProgressTab`, `WorkoutsTab`, `TimelineTab`, `useClientDetailData.ts`). Coach-side AI panel + bucket data land as new tabs/sections here.
- **API client:** all calls flow through `src/services/api.ts` (axios instance with a hardened token-refresh concurrency contract — do NOT add a second http client). New per-feature API modules under `src/api/` mirror `holisticInsightsApi.ts`.
- **State:** React Query (versioned persister key — bump on cache-shape change, per CPO NM note), Zustand store, MMKV (encrypted-at-rest; never store provider tokens client-side — tokens live server-side only).
- **No existing health/wearable mobile code** — confirmed by grep. Clean feature surface.

---

## 2. Canonical Schema Design

All models live in `prisma/schema.prisma`; migration SQL (including RLS) ships in **one** migration directory owned by PR-HK-0. Naming follows repo convention (PascalCase models, snake_case columns on the newer tables, mirroring `CalendarConnection`).

### 2.1 Enum `WearableProvider`

```prisma
enum WearableProvider {
  APPLE_HEALTHKIT      // iOS native, on-device
  HEALTH_CONNECT       // Android (Health Connect / Google Fit)
  GARMIN               // Garmin Health API
  FITBIT               // Fitbit Web API
  STRAVA               // Strava API v3
  POLAR                // Polar AccessLink
  SAMSUNG_HEALTH       // Samsung Health SDK (on-device, Android)
  WAHOO                // Wahoo Cloud API
  WITHINGS             // Withings API
  PELOTON              // Peloton (partner/unofficial)
  MYFITNESSPAL         // optional v2 — nutrition
  OURA                 // Oura Cloud API v2
  WHOOP                // WHOOP API v2
  EIGHT_SLEEP          // Eight Sleep API
  BEDDIT               // via HealthKit (sub-source)
}
```

### 2.2 Enum `WearableMetricBucket` & `WearableMetricType`

```prisma
enum WearableMetricBucket {
  HEALTH_FITNESS       // Bucket A
  SLEEP_RECOVERY       // Bucket B
}

// Canonical metric taxonomy. The bucket lives on the metric definition,
// NOT on the provider or the connection — a device can feed both buckets.
enum WearableMetricType {
  // ── Health & Fitness ──
  STEPS
  ACTIVE_ENERGY_KCAL
  RESTING_HEART_RATE_BPM
  HEART_RATE_BPM
  VO2_MAX
  WORKOUT_DURATION_MIN
  WORKOUT_DISTANCE_M
  TRAINING_LOAD
  BODY_WEIGHT_KG
  BODY_FAT_PCT
  BLOOD_PRESSURE_SYS
  BLOOD_PRESSURE_DIA
  // ── Sleep & Recovery ──
  SLEEP_TOTAL_MIN
  SLEEP_REM_MIN
  SLEEP_DEEP_MIN
  SLEEP_LIGHT_MIN
  SLEEP_AWAKE_MIN
  SLEEP_EFFICIENCY_PCT
  HRV_MS
  RECOVERY_SCORE
  READINESS_SCORE
  STRAIN_SCORE
  BODY_BATTERY
  BODY_TEMP_DEVIATION_C
  RESPIRATORY_RATE_BRPM
  SPO2_PCT
}
```

### 2.3 `WearableConnection` (modeled on `CalendarConnection`)

```prisma
model WearableConnection {
  id                      String           @id @default(uuid())
  user_id                 String
  user                    User             @relation("WearableConnectionUser", fields: [user_id], references: [id], onDelete: Cascade)
  provider                WearableProvider
  // External provider account id (e.g. Oura user id, Whoop user id).
  // Deliberately NOT the raw token.
  external_account_id     String?
  // Pointer to secret-store entry for app-level provider secrets (optional).
  credentials_secret_ref  String?
  // KMS-wrapped OAuth refresh token (AES-256-GCM envelope via KmsService).
  // base64(JSON({v,iv,tag,ct})). Never plaintext; on-device providers
  // (HealthKit / Samsung) leave this null — they push samples, no server token.
  encrypted_refresh_token String?
  // KMS-wrapped short-lived access token (optional cache; refresh is source of truth).
  encrypted_access_token  String?
  access_token_expires_at DateTime?
  // Granted OAuth scopes (provider-native strings) for audit + re-consent.
  scopes                  String[]         @default([])
  // Webhook subscription tracking (Oura/Whoop/Strava/Fitbit/Withings/Garmin).
  webhook_subscription_id String?
  webhook_secret_ref      String?
  channel_expires_at      DateTime?
  // Connection lifecycle: connected | expired | error | disconnected.
  status                  String           @default("connected")
  last_error              String?
  last_synced_at          DateTime?
  // Backfill bookkeeping — earliest data we have pulled.
  backfilled_until        DateTime?
  disconnected_at         DateTime?        // soft-disconnect; audit survives re-link
  created_at              DateTime         @default(now())
  updated_at              DateTime         @default(now()) @updatedAt
  samples                 WearableSample[]

  @@unique([user_id, provider, external_account_id], name: "WearableConnection_user_provider_account_key")
  @@index([user_id])
  @@index([status])
  @@index([channel_expires_at])
}
```

### 2.4 `WearableMetricDef` (canonical metric → bucket → unit)

A small reference table (seeded in PR-HK-0) so UI and AI read bucket/unit/display metadata without hardcoding (guards #40 — single source of truth). Could be an in-code map; we choose a table so the UI bucket filter and AI norm-comparison both query one canonical source and so new metrics need no code deploy.

```prisma
model WearableMetricDef {
  metric        WearableMetricType   @id
  bucket        WearableMetricBucket
  unit          String               // "min", "bpm", "ms", "kg", "%", "kcal", "score"
  display_name  String
  // Aggregation semantics for time-bucketing: "sum" | "avg" | "last" | "max".
  aggregation   String
  // Scientific norm band as JSON for client-side AI norm comparison, e.g.
  // { "rem_pct": { "min": 20, "max": 25 } }. Nullable.
  norm_band     Json?
  sort_order    Int                  @default(0)
}
```

### 2.5 `WearableSample` (per-client, per-metric, time-bucketed observation)

The canonical normalized fact table. Provider-native payloads are mapped into rows here by each connector's normalizer.

```prisma
model WearableSample {
  id              String              @id @default(uuid())
  user_id         String
  user            User                @relation("WearableSampleUser", fields: [user_id], references: [id], onDelete: Cascade)
  connection_id   String
  connection      WearableConnection  @relation(fields: [connection_id], references: [id], onDelete: Cascade)
  provider        WearableProvider
  metric          WearableMetricType
  bucket          WearableMetricBucket // denormalized from metric def for fast bucket-filtered reads
  value           Float
  unit            String
  // The observation window. start==end for instantaneous; sleep spans a night.
  start_at        DateTime
  end_at          DateTime
  // Timezone the provider reported the sample in (IANA). Stored to avoid
  // off-by-one-day bucketing across DST / travel (#data-integrity timezone).
  source_tz       String?
  // Deterministic dedup key: hash(user_id|provider|metric|start_at|end_at).
  // Guarantees idempotent re-ingestion and cross-provider overlap handling.
  dedup_key       String              @unique
  // Provider-native id for the source record (for backfill reconciliation).
  source_record_id String?
  recorded_at     DateTime            @default(now()) // when WE ingested it
  raw_ref         String?             // optional pointer to raw payload archive

  @@index([user_id, bucket, start_at])
  @@index([user_id, metric, start_at])
  @@index([connection_id, start_at])
  @@index([provider, source_record_id])
}
```

**Dedup contract (guards #28/#29 concurrency/replay, #data-integrity dedup):** `dedup_key = sha256(user_id + '|' + provider + '|' + metric + '|' + start_at_iso + '|' + end_at_iso)`. Ingestion uses Prisma `upsert` on `dedup_key`. Two providers reporting the same metric for the same window create **distinct** rows (different provider segment in the key) — overlap resolution (e.g. Apple Watch + Garmin both reporting HR) is a **read-time** policy (prefer a per-user primary provider per metric), never a write-time silent overwrite. This keeps provenance intact (#45 soft-delete spirit: never destroy source data).

### 2.6 `WearableProcessedEvent` (webhook idempotency — modeled on `StripeProcessedEvent`)

```prisma
model WearableProcessedEvent {
  // Composite natural key: provider + provider-event-id (or channel+resource).
  provider             WearableProvider
  provider_event_id    String
  type                 String
  processed_at         DateTime  @default(now())
  handler_completed_at DateTime?

  @@id([provider, provider_event_id])
  @@index([processed_at])
  @@index([handler_completed_at])
}
```

TTL: a scheduled prune keeps rows ≥ the longest provider redelivery window (Strava/Fitbit redeliver for days; keep ≥ 14 days, per CPO Stripe-dedupe note "redelivery window + safety").

### 2.7 `WearableInsightCache` (modeled on `HolisticInsightCache`)

```prisma
model WearableInsightCache {
  id           String               @id @default(uuid())
  user_id      String               // subject client
  user         User                 @relation("WearableInsightUser", fields: [user_id], references: [id], onDelete: Cascade)
  // side: "coach" | "client" — different prompt, different output schema.
  side         String
  bucket       WearableMetricBucket
  window_days  Int
  payload      Json                 // { observation, hypothesis?, suggested_action, suggested_message_draft?, confidence_level, source_metrics[] }
  model_used   String
  prompt_version String
  generated_at DateTime             @default(now())
  expires_at   DateTime             // generated_at + 6h unless new sync arrives

  @@unique([user_id, side, bucket, window_days], name: "WearableInsight_subject_side_bucket_window_key")
  @@index([expires_at])
}
```

### 2.8 Coach AI-drafted message → approval

We **reuse `AiActionDraft`** (capability `"draft.coach_wearable_message"`) rather than inventing a parallel table. It already has: `status` (pending/approved/rejected/expired), `subject_user_id`, `tenant_coach_id`, `payload`, `rationale`, `provenance`, `decided_by_id`, `decided_at`, `materialised_at` (idempotency marker), `materialised_ref`. The existing materialiser gateway (`src/ai/gateway/materialisers/`) gets one new materialiser: `send-coach-wearable-message.materialiser.ts` that, on approval, creates a `CoachMessage`/`Message` in the existing messaging system. This is the cleanest possible link to existing messaging (Directive: "link to existing messaging system", guard #15/#40 reuse). The task spec's `CoachMessageDraft` requirement is **satisfied by `AiActionDraft` + the new materialiser** — no new draft table.

### 2.9 RLS policies for all new tables (ship in PR-HK-0 migration)

Pattern (mirrors `messagedraft_rls` and `rls_team_tables`). For **every** table below: `ALTER TABLE … ENABLE ROW LEVEL SECURITY; ALTER TABLE … FORCE ROW LEVEL SECURITY;` then policies.

**`WearableConnection`** — client owns; coach reads:
```sql
ALTER TABLE "WearableConnection" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WearableConnection" FORCE ROW LEVEL SECURITY;

CREATE POLICY "wc_client_all" ON "WearableConnection" FOR ALL TO public
  USING (app.current_user_id() IS NOT NULL AND "user_id" = app.current_user_id())
  WITH CHECK (app.current_user_id() IS NOT NULL AND "user_id" = app.current_user_id());

CREATE POLICY "wc_coach_select" ON "WearableConnection" FOR SELECT TO public
  USING (app.is_current_coach_of("user_id"));

CREATE POLICY "wc_owner_all" ON "WearableConnection" FOR ALL TO public
  USING (app.is_owner()) WITH CHECK (app.is_owner());
```
> Coach gets SELECT only (cannot mutate a client's connection). `service_role` bypasses RLS for ingestion. Note: coach SELECT exposes connection **status/last-sync** but the controller projects away token columns — defense in depth (#5 IDOR / #12 secret exposure): never serialize `encrypted_*` columns.

**`WearableSample`** — identical shape: `client_all` (own rows), `coach_select` (`app.is_current_coach_of(user_id)`), `owner_all`.

**`WearableInsightCache`** — `side='client'` rows: client reads own + coach reads via `is_current_coach_of`; `side='coach'` rows: only the owning coach (`app.is_current_coach_of(user_id)`) + owner. Client never reads coach-side insight (which contains hypotheses/draft messages). Enforced by combining `user_id`/`side` in the policy:
```sql
CREATE POLICY "wic_client_select" ON "WearableInsightCache" FOR SELECT TO public
  USING (app.current_user_id() = "user_id" AND "side" = 'client');
CREATE POLICY "wic_coach_select" ON "WearableInsightCache" FOR SELECT TO public
  USING (app.is_current_coach_of("user_id"));  -- coach sees both sides for their clients
```

**`WearableMetricDef`** — read-only reference: `SELECT TO public USING (true)` (no PII); writes only `service_role`/owner.

**`WearableProcessedEvent`** — no end-user access; `service_role` only (deny-all policy for `public` keeps PostgREST out):
```sql
ALTER TABLE "WearableProcessedEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WearableProcessedEvent" FORCE ROW LEVEL SECURITY;
-- No policies for public ⇒ public is denied; service_role bypasses RLS.
```

`AiActionDraft` already has RLS (added in `rls_remaining_gaps`); the new capability rows inherit it — **no schema/RLS change needed for the coach-draft path** (verify in PR-HK-6 audit).

---

## 3. Per-Provider Connector Inventory

Each connector lives in its own module folder `src/wearables/connectors/<provider>/` (file-disjoint → parallel PRs). Each implements the `WearableConnector` interface defined in PR-HK-0:

```ts
interface WearableConnector {
  provider: WearableProvider;
  authModel: 'oauth2' | 'sdk-native' | 'on-device';
  buildAuthUrl(userId: string, state: string): string | null; // null for on-device
  exchangeCode(code: string): Promise<TokenSet>;
  refresh(conn: WearableConnection): Promise<TokenSet>;
  backfill(conn: WearableConnection, since: Date): Promise<RawRecord[]>;
  normalize(raw: RawRecord[]): NormalizedSample[]; // → WearableSample upsert
  verifyWebhook?(req: RawReq): boolean;            // HMAC, provider-specific
  parseWebhook?(req: RawReq): ProviderEvent[];
}
```

> Verified against live provider docs (May 2026). Rate limits/scopes can change; connectors read limits from config, not hardcode (#18 env parity / #50). Backfill windows are TOS-bounded — connector enforces, never exceeds.

| Provider | Bucket(s) | Auth model | API base + version | Rate limit | Backoff | Webhooks | Backfill (TOS) | Key scopes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Apple HealthKit** | Both | on-device (iOS) | n/a (device → app → POST `/v1/wearables/ingest`) | n/a (device) | n/a | Push from app on background-delivery | device history (user-permitted) | HK read perms: steps, HR, HRV, sleepAnalysis, VO2Max, workouts |
| **Health Connect / Google Fit** | Both | on-device (Android) | n/a (device → app → ingest) | n/a | n/a | App background sync | device history | HealthPermission READ: Steps, HeartRate, SleepSession, etc. |
| **Garmin** | Both | OAuth1.0a / OAuth2 (Health API; partner) | `https://apis.garmin.com` (Health API) | partner-tiered | exp backoff on 429 | **Yes** (ping/push) | up to 90d on connect | activities, dailies, sleeps, hrv, bodyComp |
| **Fitbit** | Both | OAuth2 (PKCE) | `https://api.fitbit.com/1.2` | 150 req/hr/user | backoff to next hour | **Yes** (subscriptions) | up to ~30d; deeper via batch | activity, heartrate, sleep, weight, respiratory_rate, oxygen_saturation |
| **Strava** | H&F | OAuth2 | `https://www.strava.com/api/v3` | 200/15min, 2000/day | header-driven throttle | **Yes** (push subscription) | full history (paged) | activity:read_all, profile:read_all |
| **Polar** | Both | OAuth2 (AccessLink) | `https://www.polaraccesslink.com/v3` | per-tier | backoff on 429 | **Yes** (webhooks) | transactional (since last fetch) | accesslink.read_all (activity, sleep, recharge) |
| **Samsung Health** | Both | sdk-native / on-device (Android) | Samsung Health SDK (device) | device | n/a | app sync | device history | health data read perms (steps, sleep, HR, body comp) |
| **Wahoo** | H&F | OAuth2 | `https://api.wahooligan.com/v1` | per-tier | backoff on 429 | **Yes** (webhooks) | history (paged) | user_read, workouts_read |
| **Withings** | Both | OAuth2 | `https://wbsapi.withings.net` | per-tier | backoff on 429 | **Yes** (notify subscriptions) | full history (paged) | user.metrics, user.activity, user.sleepevents |
| **Peloton** | H&F | session/partner (unofficial) | `https://api.onepeloton.com/api` | conservative self-limit | exp backoff | No → **polling** | recent workouts (paged) | session cookie / partner token |
| **MyFitnessPal** (v2) | H&F (nutrition) | OAuth2 (partner) | partner API | partner-tiered | backoff | No → polling | recent diary | diary read |
| **Oura** | S&R (+ some H&F) | OAuth2 | `https://api.ouraring.com/v2` | 5000/5min | exp backoff on 429 | **Yes** (subscriptions; x-oura-signature HMAC) | ~30d on connect | daily, heartrate, workout, session, spo2, personal |
| **WHOOP** | S&R | OAuth2 (offline scope for refresh) | `https://api.prod.whoop.com` (v2; UUID ids) | per-tier | exp backoff on 429 | **Yes** (v2 webhooks, UUID; revoke stops them) | ~30d on connect | read:recovery, read:cycles, read:workout, read:sleep, read:profile, read:body_measurement, offline |
| **Eight Sleep** | S&R | OAuth2 / token (unofficial) | `https://client-api.8slp.net` | conservative self-limit | exp backoff | No → **polling** | recent sleep sessions | account token |
| **Beddit** | S&R | via HealthKit (sub-source) | n/a (flows through HealthKit) | n/a | n/a | via HealthKit push | via HealthKit | (HealthKit sleepAnalysis) |

**On-device providers (HealthKit, Health Connect, Samsung Health):** no server OAuth token, no server backfill, no webhook. The **mobile app** reads device data via native SDK and POSTs normalized samples to `POST /v1/wearables/ingest` (authenticated as the client). Server validates (Zod), dedups (`dedup_key`), and upserts. The `WearableConnection.encrypted_refresh_token` stays null; `status` reflects device-permission grant. This is a distinct ingestion lane (PR-HK-2.a/2.b) with native modules in the mobile repo.

**Cloud OAuth providers:** server-side OAuth, server backfill on connect, webhook subscription where supported, polling fallback (Peloton, Eight Sleep, MyFitnessPal). All cloud calls go through a shared `ProviderHttpClient` (PR-HK-0) with mandatory timeout + retry/backoff (#35/#50).

### 3.1 Per-provider normalizer mapping (canonical metric targets)

Each connector's `normalize()` maps provider-native fields to `WearableMetricType`. The builder implements exactly these mappings; anything not listed is dropped (no speculative ingestion, guard #42).

| Provider | Provider-native source → canonical metric (bucket) |
| --- | --- |
| Oura | `daily_sleep`→SLEEP_TOTAL_MIN/REM/DEEP/LIGHT/AWAKE/EFFICIENCY (S&R); `daily_readiness.score`→READINESS_SCORE (S&R); `daily_activity.steps`→STEPS (H&F); `heartrate`→HEART_RATE_BPM (H&F); `daily_sleep.hrv`→HRV_MS (S&R); `daily_spo2`→SPO2_PCT (S&R); `daily_readiness.temperature_deviation`→BODY_TEMP_DEVIATION_C (S&R) |
| WHOOP | `recovery.score.recovery_score`→RECOVERY_SCORE (S&R); `recovery.score.hrv_rmssd_milli`→HRV_MS (S&R); `recovery.score.resting_heart_rate`→RESTING_HEART_RATE_BPM (S&R); `cycle.score.strain`→STRAIN_SCORE (S&R); `sleep.score.stage_summary`→SLEEP_*_MIN (S&R); `workout`→WORKOUT_DURATION_MIN/DISTANCE_M (H&F) |
| Garmin | `dailies`→STEPS/ACTIVE_ENERGY_KCAL (H&F); `sleeps`→SLEEP_*_MIN + BODY_BATTERY (S&R); `hrv`→HRV_MS (S&R); `activities`→WORKOUT_* + TRAINING_LOAD (H&F); `bodyComps`→BODY_WEIGHT_KG/BODY_FAT_PCT (H&F) |
| Fitbit | `activities/steps`→STEPS (H&F); `activities/heart`→RESTING_HEART_RATE_BPM/HEART_RATE_BPM (H&F); `sleep`→SLEEP_*_MIN/EFFICIENCY (S&R); `body/weight`→BODY_WEIGHT_KG (H&F); `br`→RESPIRATORY_RATE_BRPM (S&R); `spo2`→SPO2_PCT (S&R) |
| Strava | `activities`→WORKOUT_DURATION_MIN/WORKOUT_DISTANCE_M/ACTIVE_ENERGY_KCAL/TRAINING_LOAD (H&F only) |
| Polar | `exercises`→WORKOUT_*/HEART_RATE_BPM (H&F); `sleep`→SLEEP_*_MIN (S&R); `nightly-recharge`→RECOVERY_SCORE/HRV_MS (S&R) |
| Withings | `measure`(type1)→BODY_WEIGHT_KG, (type6)→BODY_FAT_PCT, (type9/10)→BLOOD_PRESSURE_DIA/SYS (H&F); `sleep`→SLEEP_*_MIN + RESPIRATORY_RATE_BRPM (S&R) |
| Wahoo | `workouts`→WORKOUT_DURATION_MIN/DISTANCE_M/HEART_RATE_BPM (H&F) |
| Peloton | `workouts`→WORKOUT_DURATION_MIN/ACTIVE_ENERGY_KCAL/HEART_RATE_BPM (H&F) |
| Eight Sleep | `sessions`→SLEEP_*_MIN/HRV_MS/RESPIRATORY_RATE_BRPM (S&R) |
| HealthKit | quantity/category types → all canonical metrics (both buckets) mapped device-side, posted pre-normalized |
| Health Connect | record types → all canonical metrics (both buckets) mapped device-side |
| Samsung Health | data types → all canonical metrics (both buckets) mapped device-side |

### 3.2 Ingestion data flow (canonical lane)

```
  cloud webhook ──► WearableWebhookController (HMAC verify, raw body, throttle)
      │                    │
      │                    ▼
      │           WearableProcessedEvent.upsert(provider, event_id)  ── dup? ─► 200 no-op
      │                    │ (first time)
      ▼                    ▼
  poll/backfill ──► connector.backfill()/fetch (ProviderHttpClient: timeout+backoff)
                           │
                           ▼
                  connector.normalize(raw) ──► NormalizedSample[]
                           │  (metric, bucket, unit, start/end, source_tz)
                           ▼
                  IngestionService.ingest()
                     • compute dedup_key (shared util)
                     • batch upsert WearableSample on dedup_key   (no N+1, #21)
                     • update WearableConnection.last_synced_at
                     • invalidate WearableInsightCache for (user, affected buckets)
                           │
                           ▼
                  on error ► status='error' + last_error + structured log (#36/#50)

  on-device ──► mobile native read ──► POST /v1/wearables/ingest (client-auth)
                     ──► Zod validate ──► IngestionService.ingest() (same lane)
```

The ingestion lane is **identical** for cloud and on-device after the `NormalizedSample[]` boundary — one `IngestionService` (#15/#40 single implementation), differing only in the front edge (webhook/poll vs authenticated POST).

---

## 4. PR-Chunked Plan With Dependency Graph

Convention for each PR: **Name / Brief / Write-set (files owned) / Depends-on / Parallel-with / Effort / Audit criteria.**

Effort scale: S ≈ ½ day, M ≈ 1 day, L ≈ 2 days, XL ≈ 3+ days (single-builder units; many run concurrently).

### PR-HK-0 — Foundation (MUST MERGE FIRST)

- **Brief:** Prisma models (§2) + RLS migration (§2.9) + `WearableMetricDef` seed + canonical normalization layer + `IngestionService` base + `ProviderHttpClient` (timeout/backoff) + `WearableConnector` interface + module skeleton. **No provider logic, no UI.**
- **Write-set (owns):**
  - `prisma/schema.prisma` (additive: new models/enums + `User` back-relations) — **the only PR that touches schema.prisma** (mutex, §5)
  - `prisma/migrations/2026XXXX_wearables_foundation/migration.sql` (tables + RLS + seed)
  - `src/wearables/wearables.module.ts`
  - `src/wearables/ingestion/ingestion.service.ts` (+ `.spec.ts`)
  - `src/wearables/ingestion/dedup.util.ts` (+ `.spec.ts`)
  - `src/wearables/normalization/normalizer.types.ts`
  - `src/wearables/connectors/connector.interface.ts`
  - `src/wearables/http/provider-http-client.ts` (+ `.spec.ts`)
  - `src/wearables/wearables.constants.ts`
  - `src/app.module.ts` (register `WearablesModule` — see §5 collision note)
- **Depends-on:** none.
- **Parallel-with:** nothing (gate).
- **Effort:** L.
- **Audit criteria:** every new table has `ENABLE`+`FORCE` RLS and explicit SELECT/INSERT/UPDATE/DELETE policies; `dedup.util` produces stable sha256; `ProviderHttpClient` has non-optional timeout + capped exponential backoff with jitter; no token column is selectable by coach policy; migration is additive (no `DROP`/destructive `ALTER`); `npx prisma validate` + `migrate diff` clean; unit tests assert real values (#17).

### PR-HK-1 — Auth + Connection management (generic OAuth + UI)

- **Brief:** Provider-agnostic OAuth connect/callback/refresh/disconnect API + connection-status read API + mobile connection-management screens (list providers, connect, show status/last-sync, disconnect). Uses `KmsService` for token wrapping. No per-provider specifics beyond a registry lookup.
- **Write-set (backend):**
  - `src/wearables/connections/connections.controller.ts`
  - `src/wearables/connections/connections.service.ts` (+ `.spec.ts`)
  - `src/wearables/connections/dto/*.ts` (Zod/class-validator schemas)
  - `src/wearables/oauth/oauth-state.service.ts` (CSRF state, PKCE)
  - `src/wearables/connector-registry.ts`
- **Write-set (mobile):**
  - `src/api/wearablesConnectionsApi.ts`
  - `src/screens/client/wearables/ConnectionsScreen.tsx`
  - `src/screens/client/wearables/ConnectProviderSheet.tsx`
  - `src/hooks/useWearableConnections.ts`
  - navigation registration (additive screen entry in `ClientNavigator.tsx` — see §5)
- **Depends-on:** PR-HK-0.
- **Parallel-with:** PR-HK-2.* (connector PRs register into the registry but own disjoint folders), PR-HK-4.
- **Effort:** L.
- **Audit criteria:** OAuth `state` is CSRF-validated and single-use; PKCE for providers that support it; refresh tokens only KMS-wrapped (#1/infra); callback validates `state` before token exchange (#5); rate-limit on connect/callback (#6); no token in logs/errors (#12); IDOR — a user can only manage their own connection (#5); Zod on all inputs (#8).

### PR-HK-2.a … 2.t — Per-provider connectors (fully parallel after 0+1)

Each PR owns exactly one folder `src/wearables/connectors/<provider>/` plus its provider webhook controller and tests. File-disjoint by construction. Each registers itself via a side-effect-free export consumed by `connector-registry.ts` (registry edited only by PR-HK-1; connectors export a const the registry imports — **connectors do not edit the registry file**, see §5).

| PR | Provider | Lane | Effort | Notes |
| --- | --- | --- | --- | --- |
| 2.a | Apple HealthKit | on-device + mobile native | XL | mobile native module (`react-native-health` bridge) + ingest endpoint contract |
| 2.b | Health Connect / Google Fit | on-device + mobile native | XL | Android native module |
| 2.c | Samsung Health | on-device + mobile native | L | Android SDK |
| 2.d | Garmin | cloud OAuth + webhook | L | partner ping/push |
| 2.e | Fitbit | cloud OAuth + webhook | L | subscriptions |
| 2.f | Strava | cloud OAuth + webhook | M | H&F only |
| 2.g | Polar | cloud OAuth + webhook | M | AccessLink |
| 2.h | Wahoo | cloud OAuth + webhook | M | |
| 2.i | Withings | cloud OAuth + webhook | L | notify subscriptions |
| 2.j | Peloton | cloud polling | M | no webhook |
| 2.k | Oura | cloud OAuth + webhook | M | x-oura-signature HMAC |
| 2.l | WHOOP | cloud OAuth + webhook | M | v2 UUID, offline scope |
| 2.m | Eight Sleep | cloud polling | M | unofficial |
| 2.n | MyFitnessPal (v2) | cloud OAuth/polling | M | optional, can defer |
| (2.o–2.t reserved) | future providers | — | — | slots kept open |

- **Write-set per connector PR (example 2.k Oura):**
  - `src/wearables/connectors/oura/oura.connector.ts` (+ `.spec.ts`)
  - `src/wearables/connectors/oura/oura.normalizer.ts` (+ `.spec.ts`)
  - `src/wearables/connectors/oura/oura-webhook.controller.ts` (+ `.spec.ts`)
  - `src/wearables/connectors/oura/oura.types.ts`
  - `src/wearables/connectors/oura/index.ts` (exports the connector const)
- **On-device connector PRs additionally own** mobile native module folders (`src/services/health/<provider>/`) — disjoint from cloud connectors.
- **Depends-on:** PR-HK-0 + PR-HK-1 (registry + connection model).
- **Parallel-with:** all other 2.* PRs (file-disjoint), PR-HK-4.
- **Effort:** see table.
- **Audit criteria (per connector):** webhook HMAC verified against secret (#1/#5), raw-body, throttled (#6), idempotent via `WearableProcessedEvent` (#28/#29); every HTTP call has timeout + backoff (#35); backfill ≤ TOS window; normalizer produces correct units + bucket + tz-correct `start/end` (#data-integrity); upsert by `dedup_key` (no double-count); provider outage sets `status='error'` + logs (#36 no silent swallow, #50 graceful); Zod on webhook payloads (#8); no N+1 in backfill ingestion — batch upsert (#21).

### PR-HK-3a — Bucket UI: Health & Fitness (mobile)

- **Brief:** H&F bucket screens consuming canonical schema (`GET /v1/wearables/samples?bucket=HEALTH_FITNESS`). Revolut tactile-data treatment per Agent 1. Client + coach-view variants.
- **Write-set:**
  - `src/api/wearablesSamplesApi.ts` (shared read client — see §5 note: created here, imported by 3b)
  - `src/screens/client/wearables/HealthFitnessScreen.tsx` + sub-components folder `src/screens/client/wearables/hf/`
  - `src/screens/coach/client-detail/HealthFitnessTab.tsx`
  - `src/hooks/useWearableSamples.ts`
- **Depends-on:** PR-HK-0 + at least 2–3 connector PRs landed (so there is data) + PR-HK-1.
- **Parallel-with:** PR-HK-3b (S&R) — **note shared `wearablesSamplesApi.ts`**, see §5 mitigation.
- **Effort:** L.
- **Audit criteria:** pagination on sample lists (#23); React Query persister key versioned (CPO NM); error boundary around screen (#33); no PII leak in coach view beyond consented data; abort/cleanup on unmount (#32); optimistic refresh has rollback (#30).

### PR-HK-3b — Bucket UI: Sleep & Recovery (mobile)

- **Brief:** S&R bucket screens (`bucket=SLEEP_RECOVERY`). Phantom CALM treatment per Agent 1 (sleep data is anxiety-provoking). Client + coach-view variants.
- **Write-set:**
  - `src/screens/client/wearables/SleepRecoveryScreen.tsx` + `src/screens/client/wearables/sr/`
  - `src/screens/coach/client-detail/SleepRecoveryTab.tsx`
  - (imports `wearablesSamplesApi.ts` + `useWearableSamples.ts` from 3a — does **not** edit them)
- **Depends-on:** PR-HK-0 + connector PRs + PR-HK-1. **Soft-depends on 3a** for the shared sample API client (resolve by having 3a land the shared client first, or PR-HK-0 ship a stub `wearablesSamplesApi.ts` — see §5).
- **Parallel-with:** PR-HK-3a.
- **Effort:** L.
- **Audit criteria:** same as 3a + sleep-stage math correct (REM%/deep% sum sanity); no medicalization in copy.

### PR-HK-4 — Embedded AI foundation

- **Brief:** Insights service (LLM wrapper reusing `src/ai/`), bucket-specific prompt templates (coach-H&F, coach-S&R, client-H&F, client-S&R), `WearableInsightCache` read/write (6h TTL, invalidate on new sync), audit log via `AiRequestAudit`, output-schema validator + guardrails (confidence calibration, no-medicalize). **No UI** (panels land in 5a/5b).
- **Write-set:**
  - `src/wearables/insights/wearable-insights.service.ts` (+ `.spec.ts`)
  - `src/wearables/insights/wearable-insights.controller.ts`
  - `src/wearables/insights/prompts/coach-hf.prompt.ts`, `coach-sr.prompt.ts`, `client-hf.prompt.ts`, `client-sr.prompt.ts`
  - `src/wearables/insights/insight-output.schema.ts` (Zod)
  - `src/wearables/insights/insight-cache.service.ts`
  - `src/wearables/insights/norm-comparison.util.ts`
- **Depends-on:** PR-HK-0 (schema + samples). Reuses existing `src/ai/` (no edits to ai module files → no collision).
- **Parallel-with:** PR-HK-1, PR-HK-2.*, PR-HK-3a/b.
- **Effort:** L.
- **Audit criteria:** output strictly schema-validated (#8); per-user rate limit + cost cap on LLM calls (#6, reuse `CoachAIBudget`/`UserAIQuota`); cache keyed correctly, invalidated on sync; audit row written every call (#34); guardrails reject medicalizing/overclaiming language; coach-side payload never returned to client (RLS + controller projection #5); LLM call has timeout + graceful degradation to cached/empty (#35/#50); no prompt injection of raw provider strings without redaction.

### PR-HK-5a — Coach AI panel (mobile, coach side)

- **Brief:** Integrate coach-side insight panel into coach client-detail (bucket-aware): observation → hypothesis → suggested action + draft message (one-tap approve/edit). "Small part" of the page per directive.
- **Write-set:**
  - `src/screens/coach/client-detail/WearableInsightPanel.tsx`
  - `src/api/wearableInsightsApi.ts` (shared insight client — created here)
  - `src/hooks/useWearableInsights.ts`
  - wires into `HealthFitnessTab.tsx` / `SleepRecoveryTab.tsx` — **see §5: these files are owned by 3a/3b**, so 5a only adds a child component import; sequence 5a after 3a/3b.
- **Depends-on:** PR-HK-3a + PR-HK-3b + PR-HK-4.
- **Parallel-with:** PR-HK-5b.
- **Effort:** M.
- **Audit criteria:** approve action creates `AiActionDraft` (pending) → never auto-sends (#5/#29); confidence label rendered; error boundary (#33); optimistic approve has rollback (#30).

### PR-HK-5b — Client AI panel (mobile, client side)

- **Brief:** Client-side self-coaching insight panel on bucket screens: observation → norm comparison → concrete intervention + optional CTA. Progressive disclosure.
- **Write-set:**
  - `src/screens/client/wearables/ClientInsightPanel.tsx`
  - (imports `wearableInsightsApi.ts` + `useWearableInsights.ts` from 5a — does not edit)
  - wires into `HealthFitnessScreen.tsx` / `SleepRecoveryScreen.tsx` (owned by 3a/3b) → sequence after.
- **Depends-on:** PR-HK-3a + PR-HK-3b + PR-HK-4. Soft-depends on 5a for shared insight API client.
- **Parallel-with:** PR-HK-5a.
- **Effort:** M.
- **Audit criteria:** client never receives coach-side fields (verify response shape #5); no medicalization in rendered copy; CTA deep-links safe; error boundary (#33).

### PR-HK-6 — Approval workflow → existing messaging

- **Brief:** Coach approval of AI-drafted message → materialise into existing `CoachMessage`/`Message`. New materialiser in the existing gateway. Approve/reject/edit API + UI on the coach panel.
- **Write-set:**
  - `src/ai/gateway/materialisers/send-coach-wearable-message.materialiser.ts` (+ `.spec.ts`) — **new file in existing folder; does not edit sibling materialisers** (registry of materialisers imports it; if the registry is a single file, that registry edit is the only shared touch — coordinate as a one-line mutex, §5)
  - `src/wearables/insights/approval.controller.ts`
  - `src/wearables/insights/approval.service.ts` (+ `.spec.ts`)
  - mobile: `src/api/wearableApprovalApi.ts`, approve/edit affordance added to `WearableInsightPanel.tsx` (owned by 5a → sequence after 5a)
- **Depends-on:** PR-HK-5a (panel) + PR-HK-4 (drafts). Reuses `AiActionDraft` (no schema change).
- **Parallel-with:** PR-HK-5b (different files).
- **Effort:** M.
- **Audit criteria:** materialise is idempotent via `AiActionDraft.materialised_at` (#28/#29 — concurrent approvals cannot double-send); transaction wraps draft-status-update + message-create (#44); never auto-send (#5); approval authz — only the owning coach can approve their client's draft (IDOR #5); audit row updated (#34).

### 4.x Dependency Graph

```
                          ┌─────────────────────────┐
                          │  PR-HK-0  Foundation      │  (schema.prisma + RLS + ingestion base)
                          │  MUST MERGE FIRST  [gate] │
                          └────────────┬──────────────┘
                                       │
            ┌──────────────────────────┼───────────────────────────────┐
            │                          │                               │
   ┌────────▼─────────┐      ┌─────────▼──────────┐          ┌─────────▼──────────┐
   │ PR-HK-1           │      │ PR-HK-2.a … 2.t     │          │ PR-HK-4             │
   │ Auth+Connection   │◄─────┤ Per-provider conns  │          │ AI insights foundn  │
   │ (generic OAuth/UI)│ reg  │ (FULLY PARALLEL,    │          │ (no UI)             │
   └────────┬──────────┘      │  file-disjoint)     │          └─────────┬──────────┘
            │                 └─────────┬───────────┘                    │
            │                           │ (≥2-3 connectors landed = data) │
            │            ┌──────────────┴───────────────┐                │
            │            │                              │                │
   ┌────────▼────────────▼──┐                ┌──────────▼─────────┐      │
   │ PR-HK-3a  H&F bucket UI │  ║ parallel ║  │ PR-HK-3b  S&R UI    │      │
   │ (owns shared sampleApi) │◄─ soft-dep ──┤ (imports 3a's api)  │      │
   └────────────┬────────────┘                └──────────┬─────────┘      │
                │                                         │               │
                └───────────────┬─────────────────────────┘               │
                                │                                         │
                   ┌────────────▼──────────────┐         ┌────────────────▼───────────┐
                   │ PR-HK-5a Coach AI panel    │ ║par║   │ PR-HK-5b Client AI panel     │
                   │ (owns shared insightApi)   │◄─soft──┤ (imports 5a's api)           │
                   └────────────┬───────────────┘         └──────────────────────────────┘
                                │
                   ┌────────────▼───────────────┐
                   │ PR-HK-6 Approval → messaging │
                   │ (materialiser + approve UI)  │
                   └──────────────────────────────┘

Critical path:  PR-HK-0 → PR-HK-1 → PR-HK-3a → PR-HK-5a → PR-HK-6
Longest parallel arm (data): PR-HK-0 → PR-HK-2.a (HealthKit, XL) → PR-HK-3a/3b
AI arm (parallel from 0):     PR-HK-0 → PR-HK-4 → PR-HK-5a/5b → PR-HK-6
```

---

## 5. Parallelization & Rebase-Collision Avoidance

### 5.1 Fully file-disjoint (zero collision) — parallelize freely
- All **PR-HK-2.\*** connector PRs: each owns `src/wearables/connectors/<provider>/` + (on-device) `src/services/health/<provider>/`. No two connectors touch the same file.
- **PR-HK-4** (AI foundation) vs **PR-HK-1** vs **PR-HK-2.\***: disjoint folders (`src/wearables/insights/` vs `connections/` vs `connectors/`).
- **PR-HK-5a** vs **PR-HK-5b**: 5a owns the coach panel + shared `wearableInsightsApi.ts`; 5b owns the client panel and only imports.

### 5.2 Shared files (collision risk) — explicit mutex strategy

| Shared file | Touched by | Strategy |
| --- | --- | --- |
| `prisma/schema.prisma` | only **PR-HK-0** | **Hard lock:** no other PR edits schema. Connectors/insights add NO models — all wearable models exist in PR-HK-0. If a connector needs a new column, it queues a follow-up to a designated "schema-owner" PR; it never edits schema.prisma in a connector branch. This is the single biggest rebase-collision source and is eliminated by funneling all DDL through PR-HK-0. |
| `src/app.module.ts` | PR-HK-0 (registers `WearablesModule`) | Only PR-HK-0 edits it (one import + one module entry). All sub-features mount under `WearablesModule`, not `AppModule`, so no other PR touches `app.module.ts`. |
| `connector-registry.ts` | PR-HK-1 defines; connectors register | **Inversion to avoid edits:** registry imports a glob/array of connector consts. Connectors export `export const ouraConnector = …` from their own `index.ts`; the registry is written once (PR-HK-1) to import the known set. New connector → registry gets a one-line add. To avoid serializing all connector PRs on that one line, the registry uses a **directory-scan loader** (NestJS dynamic provider) so adding a folder auto-registers with **no registry edit**. |
| `wearablesSamplesApi.ts` (mobile) | created PR-HK-3a, imported 3b | 3a lands the shared read client first; 3b imports. Alternatively PR-HK-0 mobile-side ships a typed stub. Either way only one PR ever *writes* it. |
| `wearableInsightsApi.ts` (mobile) | created PR-HK-5a, imported 5b | same pattern: 5a writes, 5b imports. |
| `HealthFitnessTab.tsx` / `SleepRecoveryTab.tsx` | created 3a/3b; child-component import added by 5a | 5a adds a single `<WearableInsightPanel/>` child; sequence 5a **after** 3a/3b so the import target exists. One-line add, low conflict. |
| `materialisers` registry (existing) | PR-HK-6 adds one materialiser | If materialisers auto-register (folder scan), zero edit. If a manual registry array exists, PR-HK-6 owns that one-line add (coordinate as the only PR touching it during the wave). |
| `ClientNavigator.tsx` / `CoachNavigator.tsx` | PR-HK-1 adds connection screen; 3a/3b add bucket screens | Additive `<Stack.Screen>` lines. To avoid three PRs editing the same navigator, route all wearable screens through a **single `WearablesNavigator.tsx` registered once by PR-HK-1**; 3a/3b add screens inside that sub-navigator file (still a shared file — sequence 3a before 3b, or split into `WearablesHFNavigator`/`WearablesSRNavigator`). Recommended: one navigator file per bucket → fully disjoint. |

**Rule of thumb enforced in audits:** if two in-flight PRs' write-sets intersect on any file other than via the documented mutex, the later PR must be re-scoped before it starts. Per CPO NM-1: **a rebase that resolves a conflict invalidates the audit** — so we engineer for zero-conflict rebases (additive, disjoint) and only the documented single-line mutex files ever need conflict-free fast-forward.

### 5.3 Worktree isolation
- One git worktree per PR unit (`git worktree add ../wk-hk-2k-oura hk/PR-HK-2k-oura`), per build-process lock "Isolated worktrees per PR unit (file-disjoint by write-set)."
- Builder and auditor operate in the worktree at a pinned SHA. **R31/R32:** auditor ≠ builder; verdict is SHA-pinned. **R55:** a post-audit rebase carries the verdict only if conflict-resolution is literally zero lines; otherwise re-audit.
- Push every ~2 min (R61) from each worktree to its branch.

### 5.4 Branch-naming convention
```
hk/PR-HK-0-foundation
hk/PR-HK-1-connections
hk/PR-HK-2a-healthkit      hk/PR-HK-2k-oura      hk/PR-HK-2l-whoop   …
hk/PR-HK-3a-bucket-hf      hk/PR-HK-3b-bucket-sr
hk/PR-HK-4-ai-insights
hk/PR-HK-5a-coach-panel    hk/PR-HK-5b-client-panel
hk/PR-HK-6-approval
```
Merge order respects the dependency graph; within a parallel lane, merge order is arbitrary (disjoint). After each merge into `main`, in-flight branches `git pull --rebase origin main` — expected to be conflict-free by design; any conflict triggers re-audit (R55).

---

## 6. 50-Failures Defense Applied to Plan

Mapping each PR to the failure items it must actively guard (auditor checks these; numbers refer to the 50-Failures doc).

| PR | Primary guards | Detail |
| --- | --- | --- |
| **PR-HK-0** | #2, #8, #22, #44, #45, #46, #47 | RLS+FORCE on every table w/ explicit policies (the CPO 50-table-hole lesson); Zod on ingest; indexes on every FK + `(user_id,bucket,start_at)` + `(user_id,metric,start_at)` + `dedup_key unique`; multi-row ingest in a transaction; additive migration (no destructive ALTER); CHECK/NOT NULL constraints; PITR assumed at platform. |
| **PR-HK-1** | #1, #5, #6, #7, #8, #11, #12, #13 | KMS-wrapped refresh tokens only; OAuth `state` CSRF single-use + PKCE; rate-limit on connect/callback; no token in errors/logs; CORS allowlist; HTTPS enforced; IDOR — user manages only own connection; Zod DTOs. |
| **PR-HK-2.\*** | #5, #6, #8, #21, #28, #29, #35, #36, #50, #data-integrity | Webhook HMAC verify + raw body; throttle; Zod payloads; batch upsert (no N+1) on backfill; `WearableProcessedEvent` dedupe (replay); deterministic `dedup_key` (cross-provider overlap, no double-count); timeouts + capped exp-backoff+jitter on every call; outage → `status='error'` logged (no silent swallow), fail-explicit; tz-correct bucketing. |
| **PR-HK-3a/3b** | #23, #30, #32, #33, #34, #21 | Pagination/cursor on sample lists; optimistic refresh rollback; AbortController/unsubscribe cleanup; ErrorBoundary; structured logging; no per-row fetch loops (use included/batched reads). |
| **PR-HK-4** | #5, #6, #8, #34, #35, #50, #25 | Coach-side payload never leaks to client (RLS + projection); per-user LLM rate-limit + cost cap (reuse `CoachAIBudget`/`UserAIQuota`); strict output-schema validation; audit row per call; LLM timeout + graceful degrade to cache; 6h cache (no per-request LLM hammering). |
| **PR-HK-5a/5b** | #5, #30, #32, #33 | Coach vs client field segregation verified at response shape; optimistic approve rollback; unmount cleanup; error boundary. |
| **PR-HK-6** | #5, #28, #29, #44, #34 | Approve authz (owning coach only); idempotent materialise via `materialised_at`; transaction around status-update+message-create; never auto-send; audit updated. |

**Cross-cutting (all PRs):** #14 (layered — controllers orchestrate, services implement, repos query; no business logic in controllers or RN components); #15/#40/#41 (reuse `KmsService`, `StripeProcessedEvent` pattern, `services/api.ts`, `date-fns` — no reinvented date/crypto/http); #17 (tests assert real values, every webhook + materialise path has integration test); #18 (`.env.example` updated with every new provider var; no localhost/hardcode); #34 (structured logging via existing observability module); #43 (no dead code / reserved-but-empty connectors are not merged); #10 (`npm audit --audit-level=high` before any new dep; prefer zero new deps — providers are plain HTTP).

---

## 7. Concrete Audit Briefs (Skeleton)

Each brief is SHA-pinned and file-list-bounded. Auditor verifies ONLY the PR's write-set at the pinned SHA (R31/R32). Verdict: CLEAN | DIRTY(findings).

### PR-HK-0 audit checklist
- [ ] `git diff` touches only the declared write-set; `schema.prisma` is additive (no removed/renamed columns).
- [ ] Every new table: `ENABLE` **and** `FORCE ROW LEVEL SECURITY`.
- [ ] Every new table: explicit policy for each of SELECT/INSERT/UPDATE/DELETE (or documented service-role-only deny-all).
- [ ] Coach SELECT policies use `app.is_current_coach_of(user_id)`; client policies use `app.current_user_id() = user_id`.
- [ ] No coach/client policy can read `encrypted_*` columns through PostgREST (token columns; verify projection note).
- [ ] `dedup_key` is `@unique`; `dedup.util` sha256 deterministic (test vector asserted).
- [ ] Indexes: every FK indexed; `(user_id,bucket,start_at)`, `(user_id,metric,start_at)` present.
- [ ] `ProviderHttpClient`: timeout non-optional; backoff capped + jittered; unit test asserts retry count + cap.
- [ ] `prisma validate` + `migrate diff` clean; migration runs forward on a fresh DB.
- [ ] Tests assert specific values (not `toBeDefined`).

### PR-HK-1 audit checklist
- [ ] OAuth `state` generated server-side, single-use, validated before token exchange; PKCE where supported.
- [ ] Refresh token persisted only via `KmsService` wrap; plaintext never written/logged.
- [ ] Rate-limit decorator on connect + callback routes.
- [ ] Connection mutations scoped to `app.current_user_id()` (no IDOR); coach cannot mutate.
- [ ] Errors return generic messages; no stack/secret leak.
- [ ] Zod/class-validator on every DTO; types derived from schema.
- [ ] Mobile: tokens never stored client-side; calls go through `services/api.ts`.

### PR-HK-2.* audit checklist (per connector, e.g. Oura)
- [ ] Webhook controller: `@Public`, raw-body, HMAC verify against `webhook_secret_ref`, `@Throttle`, reject-on-missing-secret.
- [ ] Idempotency: `WearableProcessedEvent` upsert before handling; duplicate event → no-op.
- [ ] Every HTTP call uses `ProviderHttpClient` (timeout + backoff); 429 handled per provider headers.
- [ ] Backfill window ≤ provider TOS (Oura ≤30d); paged; batch upsert (no N+1).
- [ ] Normalizer: correct `metric`, `unit`, `bucket`; `start_at`/`end_at` tz-correct; `dedup_key` computed via shared util.
- [ ] Provider error → `WearableConnection.status='error'` + `last_error` + structured log; no silent catch.
- [ ] Zod on webhook payload; unknown fields ignored safely.
- [ ] Connector folder is self-contained; does not edit `schema.prisma`, `app.module.ts`, or sibling connectors.
- [ ] Integration test: sample webhook → sample rows with asserted values; replay → no duplicate.

### PR-HK-3a/3b audit checklist
- [ ] Sample list reads are paginated/cursored; server enforces max page size.
- [ ] React Query persister key versioned/bumped for new cache shape.
- [ ] ErrorBoundary wraps screen; AbortController/unsubscribe on unmount.
- [ ] Optimistic refresh has onError rollback.
- [ ] Bucket filter uses canonical `bucket` column (no client-side provider→bucket hardcode).
- [ ] Coach view shows only consented client data; no token/PII leak.

### PR-HK-4 audit checklist
- [ ] Output strictly validated against `insight-output.schema.ts`; invalid model output rejected.
- [ ] Coach-side payload (hypothesis, draft message) never returned on client endpoint (response-shape test).
- [ ] Per-user LLM rate-limit + cost cap enforced (reuse budget tables); audit row per call.
- [ ] Cache keyed `(user_id, side, bucket, window_days)`; invalidated on new sync; 6h TTL.
- [ ] LLM call timeout + graceful degrade (cached/empty) on provider failure.
- [ ] Guardrails reject medicalizing/diagnostic language; confidence label present.

### PR-HK-5a/5b audit checklist
- [ ] Coach approve creates pending `AiActionDraft`; never auto-sends.
- [ ] Client panel response contains no coach-only fields.
- [ ] Confidence label + "small part" progressive-disclosure layout per Agent 1.
- [ ] ErrorBoundary; optimistic-approve rollback.

### PR-HK-6 audit checklist
- [ ] Materialise idempotent via `AiActionDraft.materialised_at` (concurrent approve → single message).
- [ ] Transaction wraps draft-status-update + `CoachMessage`/`Message` create.
- [ ] Only owning coach can approve their client's draft (authz/IDOR).
- [ ] Approved message lands in existing messaging system (no parallel messaging path).
- [ ] Audit row updated on decision + materialise.

---

## 8. Open Questions for Synthesis

### 8.1 Architectural tradeoffs I cannot resolve alone
1. **`WearableMetricDef` as table vs in-code map.** I chose a seeded table (single source of truth for UI bucket + AI norms, no deploy to add metrics). Tradeoff: one more table + seed migration. If the parent prefers zero new reference tables, this collapses into a TS const map in PR-HK-0 (and norm bands move into the AI prompt layer). **Recommendation: keep the table** — it lets Agent 1's UI and PR-HK-4's norm comparison read identical metadata. Needs parent sign-off.
2. **Cross-provider overlap resolution policy.** When a client connects both Apple Watch and Garmin (both report HR/steps), we store distinct rows and resolve at read-time. The *policy* (per-user primary provider per metric? most-recent-wins? device-precedence list?) is a product decision. I default to a per-(user, metric) primary-provider preference with most-recent fallback. **Needs product ruling.**
3. **Provider outage posture.** I chose **fail-explicit** (connection → `error`, surfaced to coach) per the directive's "trust indicators." Confirm we never silently degrade a stale connection to "connected."
4. **Peloton / Eight Sleep / MyFitnessPal unofficial APIs.** These lack stable public OAuth. Legal/TOS risk. Recommend gating behind a feature flag and treating 2.j/2.m/2.n as **lower priority / optional v2** (MyFitnessPal already flagged optional v2 in scope). **Needs go/no-go.**
5. **On-device native modules (HealthKit/Health Connect/Samsung)** require Expo config plugins / dev-client (not pure JS). These are the highest-effort PRs (XL) and may need an EAS build config change — a potential shared-file touch in `app.json`/`eas.json`. Flag for the parent: these may need to serialize on a single config PR.

### 8.2 Dependencies on Agent 1's UX plan
- Exact screen/route names, tab vs nested-stack IA, and whether buckets are top-level tabs or sections — Agent 1 owns this; my PR-HK-3a/3b write-sets use placeholder names (`HealthFitnessScreen`, `SleepRecoveryScreen`) that should be reconciled to Agent 1's named paths in the unified plan.
- The "small part" sizing/placement of the AI panels (PR-HK-5a/5b) and the Phantom CALM (S&R) vs Revolut-tactile (H&F) visual treatments come from Agent 1.
- Coach per-client dual-pane vs toggle layout (affects whether `HealthFitnessTab`/`SleepRecoveryTab` are two tabs or one split view).
- Confidence-calibration label wording + mascot-presence at anxiety moments (S&R) — Agent 1's design language.

### 8.3 Recommended sequencing per resource constraints
- **Serial gate:** PR-HK-0 alone first (everything depends on it). Audit hard on RLS.
- **Then maximal parallel wave** (file-disjoint): PR-HK-1, PR-HK-4, and the cloud-OAuth connectors PR-HK-2.d–2.m. On-device connectors (2.a/2.b/2.c, XL + native build) start in parallel but expect longer cycles; if EAS config must serialize, do 2.a (HealthKit) first as the flagship, then 2.b/2.c.
- **Minimum viable demo path** (if time-boxed): PR-HK-0 → PR-HK-1 → PR-HK-2.k (Oura) + PR-HK-2.l (WHOOP) + PR-HK-2.f (Strava) + PR-HK-2.a (HealthKit) → PR-HK-3a/3b → PR-HK-4 → PR-HK-5a/5b → PR-HK-6. That demonstrates both buckets, real connectors across S&R + H&F + on-device, and dual-role AI with approval — the full directive — without waiting on all 14 connectors.
- **Defer to v2:** MyFitnessPal (nutrition), Peloton, Eight Sleep, Beddit (if HealthKit covers it). Reserved slots 2.o–2.t absorb later providers with zero replan (connector folders auto-register).
- Recommend the parent assign **one auditor per parallel lane** so R31/R32 (auditor≠builder) holds without serializing audits.

---

## Appendix A — File Tree (new backend surface)

```
src/wearables/
  wearables.module.ts                       [PR-HK-0]
  wearables.constants.ts                     [PR-HK-0]
  connector-registry.ts                      [PR-HK-1]  (dir-scan loader)
  http/provider-http-client.ts               [PR-HK-0]
  ingestion/ingestion.service.ts             [PR-HK-0]
  ingestion/dedup.util.ts                    [PR-HK-0]
  normalization/normalizer.types.ts          [PR-HK-0]
  connectors/connector.interface.ts          [PR-HK-0]
  connectors/<provider>/...                  [PR-HK-2.*]   one folder per provider
  connections/connections.controller.ts      [PR-HK-1]
  connections/connections.service.ts         [PR-HK-1]
  connections/dto/*.ts                        [PR-HK-1]
  oauth/oauth-state.service.ts               [PR-HK-1]
  insights/wearable-insights.service.ts      [PR-HK-4]
  insights/wearable-insights.controller.ts   [PR-HK-4]
  insights/insight-cache.service.ts          [PR-HK-4]
  insights/insight-output.schema.ts          [PR-HK-4]
  insights/norm-comparison.util.ts           [PR-HK-4]
  insights/prompts/*.prompt.ts               [PR-HK-4]
  insights/approval.controller.ts            [PR-HK-6]
  insights/approval.service.ts               [PR-HK-6]
src/ai/gateway/materialisers/
  send-coach-wearable-message.materialiser.ts [PR-HK-6]   (new file, existing folder)
prisma/
  schema.prisma                              [PR-HK-0 only]
  migrations/2026XXXX_wearables_foundation/  [PR-HK-0]
```

## Appendix B — File Tree (new mobile surface)

```
src/api/
  wearablesConnectionsApi.ts                 [PR-HK-1]
  wearablesSamplesApi.ts                     [PR-HK-3a]  (3b imports)
  wearableInsightsApi.ts                     [PR-HK-5a]  (5b imports)
  wearableApprovalApi.ts                     [PR-HK-6]
src/hooks/
  useWearableConnections.ts                  [PR-HK-1]
  useWearableSamples.ts                      [PR-HK-3a]
  useWearableInsights.ts                     [PR-HK-5a]
src/navigation/
  WearablesHFNavigator.tsx                   [PR-HK-3a]  (recommended split to stay disjoint)
  WearablesSRNavigator.tsx                   [PR-HK-3b]
src/screens/client/wearables/
  ConnectionsScreen.tsx                      [PR-HK-1]
  ConnectProviderSheet.tsx                   [PR-HK-1]
  HealthFitnessScreen.tsx + hf/              [PR-HK-3a]
  SleepRecoveryScreen.tsx + sr/              [PR-HK-3b]
  ClientInsightPanel.tsx                     [PR-HK-5b]
src/screens/coach/client-detail/
  HealthFitnessTab.tsx                       [PR-HK-3a]
  SleepRecoveryTab.tsx                       [PR-HK-3b]
  WearableInsightPanel.tsx                   [PR-HK-5a]
src/services/health/<provider>/             [PR-HK-2.a/2.b/2.c]  on-device native bridges
```

---

*Sources for provider API facts (verified May 2026): Oura Cloud API v2 ([api.ouraring.com/v2](https://api.ouraring.com/v2), 5000 req/5min, webhooks w/ x-oura-signature); WHOOP API v2 ([developer.whoop.com](https://developer.whoop.com/api/), OAuth2 w/ offline scope, v2 UUID webhooks); Strava API v3 ([developers.strava.com/docs/rate-limits](https://developers.strava.com/docs/rate-limits/), 200/15min + 2000/day, push subscriptions). Codebase facts verified directly against `growth-project-backend` (`prisma/schema.prisma`, `src/billing/stripe-webhook.controller.ts`, `src/ai/`, RLS migration `20260607000000_rls_remaining_gaps`) and `growth-project-mobile` (`src/services/api.ts`, `src/navigation/`, `src/api/holisticInsightsApi.ts`). CPO RLS doctrine per `CPO_MASTER_HANDOFF_PART_2-1.txt`. 50-Failures mapping per `The-50-Failures-of-AI-Generated-Code-at-Enterprise-Scale.txt`.*
