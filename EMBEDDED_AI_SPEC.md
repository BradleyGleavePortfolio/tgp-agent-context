# EMBEDDED_AI_SPEC — Wearables AI Insight Surface

> Standalone spec for the embedded AI insight surface shipped across the HealthKit / Wearables expansion (PR-HK-4 backend, PR-HK-5b mobile client panel, PR-HK-6a approve flow, PR-HK-6b coach-on-behalf preferences). Source of truth for behavior; code references point at `growth-project-backend` and `growth-project-mobile`.

---

## 1. Purpose & non-goals

**Purpose.** Surface a short, calibrated AI reading of a user's recent wearable data:

- **observation** — what the data shows (e.g. "Resting HR up ~6 bpm vs. your 14-day baseline").
- **suggested action** — a single, non-clinical next step.
- **(coach side only) draft message** — a ready-to-send message the coach can approve, edit, or reject before it ever reaches the client.
- **confidence** — one of five calibrated labels (`i_think` … the strongest), never a raw percentage in the model contract.

**Non-goals.**

- **NOT diagnostic.** The surface never asserts a medical condition or interprets data as a diagnosis.
- **NOT prescriptive.** No dosing, no medical directives, no "you must". Suggested actions are coaching nudges.
- No autonomous send: a coach draft is *never* delivered to a client without explicit human approval (see §7).
- No silent failure: "not enough data" is a typed state, not an empty string or a swallowed error (see §9).

---

## 2. Architecture (ASCII)

```
 ┌──────────────────────┐
 │  Mobile insight panel │  WearableInsightPanel.tsx (coach)
 │  (coach / client)     │  client AI panel (HK-5b)
 └──────────┬───────────┘
            │  React Query (useWearableInsight / useCoachWearableInsight)
            ▼
 ┌──────────────────────────────────────────────┐
 │  GET /v1/wearables/insights/{coach,client}     │  wearable-insights.controller.ts
 │  POST /v1/wearables/insights/approve  (HK-6a)  │  (@Roles-gated; @Throttle)
 └──────────┬─────────────────────────────────────┘
            ▼
 ┌──────────────────────┐      cache hit
 │ WearableInsights      │◀──────────────┐
 │ Service               │               │
 │ (norm comparison,     │   ┌───────────┴─────────────┐
 │  prompt selection,    │   │ WearableInsightCache      │  insight-cache.service.ts
 │  guardrails)          │──▶│ (Postgres, 6h TTL)        │  Prisma model WearableInsight
 └──────────┬───────────┘   └─────────────────────────┘
            │ cache miss
            ▼
 ┌──────────────────────┐      ┌───────────────┐
 │  AiGatewayService     │─────▶│      LLM       │
 │ (capability metering, │◀─────│  (provider)    │
 │  redaction, budget)   │      └───────────────┘
 └──────────┬───────────┘
            ▼
   Zod-validated CoachInsight / ClientInsight / EmptyInsight
            ▼
   write-through to WearableInsightCache → response to mobile
```

Read path: panel → React Query → controller → service → cache lookup → (miss) AiGateway → LLM → Zod-validate → write cache → respond. Cache hit short-circuits before the gateway/LLM call.

---

## 3. Cache policy

- **Store:** Postgres, Prisma model `WearableInsight` (modeled on `HolisticInsightCache`).
- **TTL:** 6 hours. `INSIGHT_TTL_MS = 6 * 60 * 60 * 1000` and `expires_at = now + INSIGHT_TTL_MS` (`src/wearables/insights/insight-cache.service.ts`). A row past `expires_at`, or an absent row, is a **miss**.
- **Invalidation:** invalidated on a new sync for the subject (fresh wearable data must not be read through a stale insight).
- **Scope / uniqueness:** compound-unique on `(user_id /* subject */, side, bucket, window_days)` — the Prisma selector `WearableInsight_subject_side_bucket_window_key`. `side ∈ {coach, client}`; `bucket ∈ {HEALTH_FITNESS, SLEEP_RECOVERY}`; `window_days = INSIGHT_WINDOW_DAYS (14)`. Coach and client insights for the same subject/bucket are distinct rows.
- **Side confidentiality:** `side='coach'` rows (hypotheses + draft messages) are NEVER readable by the client; `side='client'` rows are readable by the client and their coach.

---

## 4. Prompts

- **Location:** `src/wearables/insights/prompts/` — four pinned builders:
  - `coach-hf.prompt.ts` (`PROMPT_VERSION = 'coach-hf-v1'`)
  - `coach-sr.prompt.ts` (`PROMPT_VERSION = 'coach-sr-v1'`)
  - `client-hf.prompt.ts` (`PROMPT_VERSION = 'client-hf-v1'`)
  - `client-sr.prompt.ts` (`PROMPT_VERSION = 'client-sr-v1'`)
  - (`hf` = Health & Fitness bucket, `sr` = Sleep & Recovery bucket.)
- **Selection:** `WearableInsightsService` picks the builder by `(audience, bucket)` — coach vs. client × HF vs. SR (`wearable-insights.service.ts`).
- **Prompt-version pinning:** each prompt file exports an explicit `PROMPT_VERSION` string. The service imports them under aliases (`COACH_HF_VERSION`, `COACH_SR_VERSION`, `CLIENT_HF_VERSION`, `CLIENT_SR_VERSION`) and records the version used for each generation. Pinning means a prompt-copy change is a deliberate version bump, not a silent drift; cached payloads can be tied back to the exact prompt revision that produced them.

---

## 5. Schemas

Backend Zod contracts live in `src/wearables/insights/insight-output.schema.ts`; the mobile mirror lives in `src/api/wearableInsightsApi.ts` and is asserted to match `.strict()` field-for-field.

- **`CoachInsight`** (`CoachInsightSchema`, `.strict()`): `observation`, `hypothesis`, `suggested_action`, `suggested_message_draft` (≤1000 chars), `confidence_level`, `source_metrics[≥1]`.
- **`ClientInsight`** (`ClientInsightSchema`, `.strict()`): `observation`, `norm_comparison`, `intervention`, optional `cta { label, deep_link (tgp://…) }`, `confidence_level`, `source_metrics[≥1]`. No hypothesis, no draft message — the client never sees coach-only fields.
- **`EmptyInsight`** (`EmptyInsightSchema`): `observation = 'Not enough data yet — keep syncing.'`, `confidence_level = 'i_think'`, `source_metrics` length 0, `is_empty = true`.
- **Response unions:** `CoachInsightResponse = CoachInsight | EmptyInsight`; `ClientInsightResponse = ClientInsight | EmptyInsight`. `isEmptyInsight()` discriminates on `is_empty === true`.
- **Confidence:** five calibrated labels (`ConfidenceLevelSchema`); mobile maps them to display label + percentage (`CONFIDENCE_LABEL`, `CONFIDENCE_PCT`) for rendering only — the wire contract stays label-based.

The mobile schema is a deliberate exact mirror (documented in `wearableInsightsApi.ts`): same fields, same `.strict()`, with `z.enum(WEARABLE_METRIC_TYPES)` standing in for the backend `z.nativeEnum(WearableMetricType)` because the mobile enum is a plain const map.

---

## 6. Authorization

- **Endpoints:** `GET /v1/wearables/insights/coach?clientId=&bucket=` (`@Roles('coach','owner')`), `GET /v1/wearables/insights/client?bucket=` (`@Roles('student')`), `POST /v1/wearables/insights/approve` (`@Roles('coach','owner')`). Routes are `@Controller('v1/wearables/insights')`.
- **Coach ownership:** a coach may only read/approve for a client they own. `WearableInsightsService.assertCoachOwnsClient(coachId, clientId, role)` checks the direct `user.coach_id` FK (`user.findFirst({ id: clientId, coach_id: coachId, role: 'student', deleted_at: null })`); owner role bypasses. On miss it throws a stable 403. This is the IDOR boundary for the coach side.
- **Client self-only:** the `client` endpoint resolves the subject as the caller (`req.user.id`); a client can read only their own insights, never another user's.
- The role enum in code is `'student'` for what the product calls "client".

---

## 7. Approve flow (HK-6a)

`POST /v1/wearables/insights/approve` materializes a coach's AI draft into a real `CoachMessage`.

- **Body:** `{ clientId, bucket, draft_id (or equivalent), body, action: 'approve' | 'edit' | 'reject' }`, `.strict()` (rejects unknown keys; mirrors the mobile `approveDraft` payload).
- **Authorization:** `assertCoachOwnsClient` runs before any materialization (IDOR boundary #5). `requester_id` is intentionally left null so `AiApprovalService.decide()`'s human-in-the-loop guard (a decider cannot decide their own AI draft) holds.
- **Action dispatch:** `reject → decision 'rejected'` (no send, `materialised_at = null`); `approve | edit → decision 'approved'` → the coach-wearable-message materialiser sends, and `materialised_at` is the ISO materialization time. `materialised_at` is nullable by contract (HK-6a R2) to keep "decision time" and "materialization time" distinct.
- **Idempotency:** `AiApprovalService.decide()` owns the row-lock + status flip; a draft already decided is not re-materialized — re-POSTing the same decision is safe.
- **Throttling:** `@Throttle({ COACH_AI_GENERATION: { ttl: 3_600_000, limit: 60 } })` on approve (and `limit: 30` on coach insight generation) to bound LLM/messaging cost.
- **Audit:** `decide()` writes the decision audit; the controller also attaches a best-effort source/idempotency header (`source: 'wearable_insight_approve'`) — a missing header must never block an approve.
- **Capability:** approve consumes `COACH_WEARABLE_MESSAGE_CAPABILITY`.

---

## 8. Capability gates

- `COACH_INSIGHT_CAPABILITY = 'wearable_insight.coach'` — coach insight generation.
- `CLIENT_INSIGHT_CAPABILITY = 'wearable_insight.client'` — client insight generation.
- Both are registered in `COACH_AI_METERED_CAPABILITIES`, so generation is metered/budgeted through the AI gateway. Approve-time messaging consumes `COACH_WEARABLE_MESSAGE_CAPABILITY`.

---

## 9. Empty / error states

- **Not-enough-data:** typed `EmptyInsight` (`is_empty = true`, fixed observation copy), never an empty string and never a fabricated reading. The cache and the wire both carry it explicitly.
- **Errors propagate honestly.** No silent swallowing on the read or approve paths. On mobile, `approveDraft` re-throws (no coercion of a 404/500 into a fake "pending" state — the stale `not_implemented` 404 fallback was removed in HK-6b mobile #227), and the hook does not swallow `onError`. Failures surface as a sanitized, recoverable, retryable error state.

---

## 10. Mobile rendering

- **Clamp + progressive disclosure:** insight text is clamped with a "Read more" expander (overflow stale-state fixed in HK-5b R3 via always-assign + `useEffect` reset).
- **AA contrast, scheme-reactive (HK-5b R3):** `toneTokens(tone, colorScheme)` makes `onSurfaceInk` reactive — warm bucket light `gold[800]` / dark `gold[300]`; cool bucket light forest / dark `brand[300]`. `accentInk` stays static, CTA-fill only. Cool-dark `accent` branches to `brand[300]` for icon contrast; warm camel preserved. Dark-mode AA regression tests cover both buckets.
- **Reduce-motion compliance:** animated transitions honor the OS reduce-motion setting.

---

## 11. Future work

The four deferred provider integrations (Beddit, Peloton, Eight Sleep, MyFitnessPal — see `DEFERRAL_*.md`) are **not blocking** for this surface. The insight pipeline is provider-agnostic: it reads normalized samples, so any future provider that lands normalized data flows through the same prompt/cache/approve path with no spec change.

**Known carry-forward:** the coach `WearableInsightPanel.tsx` still calls `toneTokens` without the `colorScheme` argument (pre-R3 signature) and uses `accentInk` for Retry / Read more text — tracked under HK-5a (see `CLOSEOUT_HK_EXPANSION.md`).

---

### Code references

- Backend: `growth-project-backend` — `src/wearables/insights/` (`wearable-insights.controller.ts`, `wearable-insights.service.ts`, `insight-cache.service.ts`, `insight-output.schema.ts`, `guardrails.ts`, `prompts/`).
- Mobile: `growth-project-mobile` — `src/api/wearableInsightsApi.ts`, `src/screens/coach/client-detail/WearableInsightPanel.tsx`, the client AI panel + `useWearableInsight` / `useCoachWearableInsight` hooks (HK-5b / HK-6b).
- Repo (this doc): https://github.com/BradleyGleavePortfolio/tgp-agent-context
- Backend repo: https://github.com/BradleyGleavePortfolio/growth-project-backend
- Mobile repo: https://github.com/BradleyGleavePortfolio/growth-project-mobile
