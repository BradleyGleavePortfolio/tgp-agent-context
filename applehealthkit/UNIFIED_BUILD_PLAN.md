# UNIFIED BUILD PLAN — HealthKit / Wearables Expansion

**Author:** Dynasia G <dynasia@trygrowthproject.com>
**Date:** 2026-05-31
**Status:** READY FOR BUILDER PICKUP
**Synthesizes:** `AGENT_1_UX_PLAN.md` (UX bible study — 780 lines) + `AGENT_2_CODING_PLAN.md` (foundation audit + PR-chunked plan — 866 lines)
**Companion:** `HANDOFF_FOR_NEXT_OPERATOR.md` (scope source of truth)
**Quality bar:** R0 decacorn. Every PR audited against `The-50-Failures-of-AI-Generated-Code-at-Enterprise-Scale.txt`. R31/R32 (auditor ≠ builder, SHA-pinned), R55 (rebase invalidates audit), R61 (push every ~2 min).

> This plan is the single source of truth for execution. The two planning agents converged on architecture; this document resolves the open questions, hard-locks the contract between UX and code, and gives every builder a self-contained PR brief. No further discovery is required.

---

## 0. Quick-Reference Locks (Builders Must Honor)

These are the non-negotiable decisions both agents agreed on (or that this synthesis resolves). Any PR that violates one fails audit.

| Lock | Decision | Source |
| --- | --- | --- |
| **IA** | Two buckets via **segmented switcher inside ONE `Health` destination** (`Fitness | Recovery`). NOT two new tabs. | Agent 1 §1.4; resolves Open Q 10.1.1 |
| **Per-metric taxonomy** | Bucket is a property of the metric, NOT the provider. A device feeds both buckets. | Agent 1 §1.6; Agent 2 §2.2/§2.5 |
| **Primary bucket map** | HRV→S&R, steps→H&F, resting HR→S&R primary (chip in H&F Heart), workouts→H&F, recovery/readiness→S&R hero ring | Agent 1 §1.6 |
| **Visual identity** | H&F: warm amber→ember, ~280ms spring. S&R: cool indigo→slate, deep/dark bg, ~480ms breathing. Shared skeleton/type/spacing; differ only in accent/motion/luminance. | Agent 1 §1.3, §9 |
| **Brand** | NEVER cartoon, NEVER playful. NO mascot. Restrained luxury. Linear-grade density. | CPO Taste §3; Agent 1 §9.4 |
| **CALM-M adaptation** | No mascot — CALM "Mascot presence" routed to **calm recovery hero + human coach outreach**. | Agent 1 §7.3; resolves Open Q 10.1.2 |
| **Client gamification floor** | Rings + competence trend + forward-hook closure. NO points/badges/leaderboards for clients. | Agent 1 §8; resolves Open Q 10.1.3 |
| **Schema canonical** | One `WearableSample` keyed by `WearableMetricType` + time bucket + deterministic `dedup_key = sha256(user_id|provider|metric|start_iso|end_iso)`. Two providers → distinct rows; resolution at READ time. | Agent 2 §2.5 |
| **WearableMetricDef** | Ship as a **seeded reference table** (not in-code const) so UI + AI both read one source of truth for bucket/unit/norm. | Agent 2 §2.4; resolves Agent 2 Open Q 8.1.1 |
| **Dual-provider read precedence** | Per-(user, metric) **primary provider preference** with most-recent fallback. Advanced "preferred source" override behind progressive disclosure on Metric Detail. | Resolves Agent 1 10.1.4 + Agent 2 8.1.2 |
| **Provider outage posture** | **Fail-explicit**: connection → `status='error'` + `last_error` + structured log + surfaced to coach. NEVER silently degrade to "connected". | Agent 2 §0; Agent 1 §2.4; resolves Agent 2 8.1.3 |
| **Unofficial APIs** | Peloton, Eight Sleep, MyFitnessPal → **v2 / feature-flagged**. Not blockers for MVP. | Resolves Agent 2 8.1.4 |
| **On-device native modules** | HealthKit/Health Connect/Samsung Health each get their own PR + likely an `app.json`/`eas.json` touch — **serialize on a single config PR (PR-HK-CFG)** to avoid Expo config collisions. | Resolves Agent 2 8.1.5 |
| **RLS doctrine** | Every new table ships with `ENABLE + FORCE RLS + policies for SELECT/INSERT/UPDATE/DELETE` in the SAME migration as table creation (PR-HK-0). NO exceptions. | CPO NM-1; Agent 2 §1.4/§2.9 |
| **Token storage** | OAuth refresh tokens ONLY KMS-wrapped via existing `KmsService`. NEVER plaintext. NEVER in logs. NEVER serialized in coach-readable projections. | Agent 2 §0 |
| **AI dual-role schema (coach)** | `{observation, hypothesis, suggested_action, suggested_message_draft, confidence_level, source_metrics[]}` | HANDOFF; Agent 1 §6.1; Agent 2 §2.7 |
| **AI dual-role schema (client)** | `{observation, norm_comparison, intervention, optional_cta, confidence_level, source_metrics[]}` | HANDOFF; Agent 1 §6.2 |
| **NEVER auto-send** | Coach approves every AI-drafted message. Routes through existing `MessagesModule` via new materialiser. Reuses `AiActionDraft` — NO new draft table. | Agent 1 §4.5; Agent 2 §2.8 |
| **NEVER medicalize** | No diagnosis nouns (apnea, arrhythmia, insomnia, depression, disorder). No treatment verbs. Soft clinician-referral suffix on SpO2/HR-irregularity observations. | Agent 1 §6.4 |
| **Confidence calibration** | `I think` 50% / `Fairly sure` 70% / `Confident` 85% / `Certain` 95% / `Verified` 100`. Neutral chip color, never green-for-good. | CPO Comms §4; Agent 1 §6.3 |
| **One connection pattern** | Identical row pattern for all 20+ providers in Connections Hub. Provider mechanics (webhook vs poll) absorbed server-side per Testler's Law. | Agent 1 §3.6 / §2.2 |
| **Tab budget** | Hard cap 4 primary tabs. Wearable screens mount under existing tabs or via segmented switcher inside one destination. | CPO Taste §3 |
| **Test floor** | Every PR: tests assert real values (not `toBeDefined`); webhook + materialise have integration tests; no N+1 in backfill. | 50-Failures #17/#21 |
| **Worktree isolation** | One worktree per PR. Builder ≠ auditor. Verdict SHA-pinned. Push every ~2 min. | R31/R32/R55/R61 |
| **Author identity** | `Dynasia G <dynasia@trygrowthproject.com>` on every commit. NO trailers. NO co-authors. | Persistent rule |
| **api_credentials** | `["github"]` for ALL git network ops. | Persistent rule |

---

## 1. Resolved Open Questions

### From Agent 2 (§8.1)
1. **`WearableMetricDef` table vs in-code map** → **Table.** Single source of truth for UI bucket filter, AI norm-comparison, and future metric additions without redeploy. Ships seeded in PR-HK-0 migration.
2. **Cross-provider overlap resolution** → **Read-time policy.** Write distinct rows (provenance preserved). At read, apply per-(user, metric) primary-provider preference with most-recent fallback. Mobile Metric Detail exposes a progressive-disclosure "preferred source" override. Defaults are server-computed; user override persists in a new `WearableUserMetricPreference` mini-table (added to PR-HK-0 schema, see §3.1 amendment).
3. **Provider outage posture** → **Fail-explicit.** Already locked above. Never auto-degrade.
4. **Peloton / Eight Sleep / MyFitnessPal** → **Defer to v2 / feature-flag.** Not in MVP demo path. Slots 2.j / 2.m / 2.n stay in the plan but ship behind `WEARABLES_UNOFFICIAL_PROVIDERS_ENABLED` flag with red-bordered docstrings noting TOS risk.
5. **On-device EAS config** → **PR-HK-CFG.** Single PR owns `app.json` + `eas.json` + native deps install for HealthKit + Health Connect + Samsung Health simultaneously. Serializes the only mobile-config collision point. PR-HK-2.a/2.b/2.c depend on PR-HK-CFG landing first.

### From Agent 1 (§10.1)
1. **Tab vs switcher** → **Switcher inside one `Health` tab.** Honors 4-tab cap; "split the pages" reads as "two visually distinct pages reachable via switcher," not "two new tabs." Agent 1 confidence 85% accepted.
2. **CALM-M with no mascot** → **Accepted adaptation.** Calm recovery hero + human coach outreach fills the "presence" role. Documented in code comments at S&R panel sites.
3. **Client gamification floor** → **Minimal accepted.** Rings + competence trend + forward hook. Knowingly takes the S-curve "more mechanics = less engagement" tradeoff.
4. **Dual-provider dedup display** → **Auto best-source default + Metric Detail override.** See Agent 2 Q 8.1.2 resolution above.

### From Agent 1 (§10.2 dependencies)
- **Canonical schema** → defined in Agent 2 §2; ships PR-HK-0.
- **Freshness/webhook capability** → Agent 2 §3 PROVIDER_MATRIX. Freshness chip copy ("Synced 2h ago") MUST be driven by the actual `WearableConnection.last_synced_at`, computed relative to `now()` server-side. Mobile renders only what server says.
- **Insights endpoint shape** → defined in Agent 2 §2.7 + Agent 1 §6.1/§6.2 schemas; ships PR-HK-4.
- **MessagesModule integration** → reuses existing `CoachMessage`/`Message` via new materialiser `send-coach-wearable-message.materialiser.ts` (PR-HK-6). Audit confirms RLS/ownership-check on the message-create path (NM-2 IDOR hunch is closed in PR-HK-6 audit).
- **Server-authoritative time + RLS** → enforced PR-HK-0.

---

## 2. UX ↔ Code Contract (Hard Bindings)

These are the points where UX naming and code naming MUST match. Builders may not rename without a contract amendment.

| UX surface (Agent 1) | Code surface (Agent 2) | Binding |
| --- | --- | --- |
| `AppTabs/Health` shell with switcher | `WearablesNavigator.tsx` (one per bucket — `WearablesHFNavigator.tsx` + `WearablesSRNavigator.tsx`) or a single shell with route param | **One Health stack screen registered in `ClientNavigator.tsx`** (PR-HK-1, single edit) mounting both bucket screens via param `?bucket=fitness|recovery`. Switcher lives in the parent screen; bucket screens are children. Eliminates per-bucket navigator-file collision. |
| `AppTabs/Health?bucket=fitness` | `src/screens/client/wearables/HealthFitnessScreen.tsx` | PR-HK-3a |
| `AppTabs/Health?bucket=recovery` | `src/screens/client/wearables/SleepRecoveryScreen.tsx` | PR-HK-3b |
| `AppTabs/Health/metric/:metricId` | `src/screens/client/wearables/MetricDetailScreen.tsx` (route param) | PR-HK-3a owns shared component; PR-HK-3b imports |
| `AppTabs/Clients/:clientId` (Client Detail with switcher) | `src/screens/coach/client-detail/` existing tabbed view + new `WearableBucketSwitcher.tsx` mounted in `SummaryTab` | PR-HK-3a (H&F tab) + PR-HK-3b (S&R tab) add as child tabs |
| `Connections Hub` (`AppTabs/Settings/Connections`) | `src/screens/client/wearables/ConnectionsScreen.tsx` | PR-HK-1 |
| `Provider OAuth Sheet` | `src/screens/client/wearables/ConnectProviderSheet.tsx` | PR-HK-1 |
| `Coach AI panel` (small card) | `src/screens/coach/client-detail/WearableInsightPanel.tsx` | PR-HK-5a |
| `Client AI panel` | `src/screens/client/wearables/ClientInsightPanel.tsx` | PR-HK-5b |
| `Message Draft Approval` | `src/screens/coach/MessageDraftApprovalScreen.tsx` (new) → backed by `AiActionDraft` approve API | PR-HK-6 |
| Freshness chip states (Synced/Syncing/Stale/Reconnect/Error) | `WearableConnection.status` enum + `last_synced_at` + `last_error` | PR-HK-1 (status semantics) + per-connector PR-HK-2.* (state transitions) |
| Confidence label chip (`Fairly sure · 70%`) | `payload.confidence_level` ∈ {`i_think`, `fairly_sure`, `confident`, `certain`, `verified`} in `WearableInsightCache` payload | PR-HK-4 schema; PR-HK-5a/b renders |
| Per-bucket roll-up freshness chip (`All sources current` / `1 source needs attention`) | Derived client-side from `useWearableConnections()` over the bucket's providers | PR-HK-3a/b |
| Plain-language sleep stage labels (`light sleep`, NOT `N1/N2`) | `WearableMetricDef.display_name` seeded with plain-language strings | PR-HK-0 seed |

---

## 3. Schema Amendments (Additive to Agent 2 §2)

Add **one** model to PR-HK-0's schema (still in the same single PR; no additional schema-touching PR introduced):

### 3.1 `WearableUserMetricPreference` (read-time precedence override)

```prisma
model WearableUserMetricPreference {
  id                String              @id @default(uuid())
  user_id           String
  user              User                @relation("WearablePrefUser", fields: [user_id], references: [id], onDelete: Cascade)
  metric            WearableMetricType
  preferred_provider WearableProvider
  updated_at        DateTime            @default(now()) @updatedAt
  created_at        DateTime            @default(now())

  @@unique([user_id, metric], name: "WearablePref_user_metric_key")
  @@index([user_id])
}
```

**RLS (ships in PR-HK-0 migration):** identical pattern to `WearableConnection` — `client_all` on own rows, `coach_select` via `app.is_current_coach_of(user_id)` (coach can read to inform debugging but cannot mutate), `owner_all`.

**Read precedence algorithm** (implemented in `IngestionService.resolveBest()`, called by the sample-list controller in PR-HK-3a):
1. If `WearableUserMetricPreference` row exists for `(user, metric)` → return samples from that provider in the requested window.
2. Else → return the most-recently-recorded provider's samples for that `(user, metric)` window.
3. UI Metric Detail surfaces all overlapping providers as chips and a "Prefer this source" toggle that upserts the preference row.

---

## 4. PR Sequence (Unified, Annotated)

The unified merge order. UX-readiness ordering (Agent 1 §10.3) reconciled with code dependency graph (Agent 2 §4.x). PR numbers retained from Agent 2.

| # | PR | Brief | Depends on | Parallel with | Effort | UX surface |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | **PR-HK-0** | Foundation: Prisma models (§2) + `WearableUserMetricPreference` (§3.1) + RLS migration + `WearableMetricDef` seed + canonical normalization + `IngestionService` + `ProviderHttpClient` + connector interface. **Schema mutex.** | none | none (gate) | L | none (server-only) |
| 2 | **PR-HK-CFG** *(NEW)* | Expo native config: `app.json` + `eas.json` + `react-native-health` + Health Connect + Samsung Health SDK install + dev-client build. **Mobile config mutex.** | PR-HK-0 (only logically; touches no backend) | nothing (mobile config gate) | M | none (config) |
| 3 | **PR-HK-1** | Auth + Connection management: generic OAuth (state/PKCE/KMS), `connector-registry.ts` with directory-scan loader, Connections Hub + Add Source + OAuth Sheet + Connection Detail screens, freshness chip rendering. | PR-HK-0 | PR-HK-2.*, PR-HK-4 | L | Connections Hub, OAuth Sheet, Connection Detail (§3.1, §3.6, §A.3) |
| 4 | **PR-HK-2.k** (Oura) | Oura connector + webhook + normalizer. | PR-HK-0, PR-HK-1 | all other 2.* | M | freshness chip data |
| 5 | **PR-HK-2.l** (WHOOP) | WHOOP connector + webhook + normalizer. | same | parallel | M | same |
| 6 | **PR-HK-2.f** (Strava) | Strava connector + webhook. H&F only. | same | parallel | M | same |
| 7 | **PR-HK-2.d** (Garmin) | Garmin connector + ping/push webhook. | same | parallel | L | same |
| 8 | **PR-HK-2.e** (Fitbit) | Fitbit connector + subscription webhook. | same | parallel | L | same |
| 9 | **PR-HK-2.g** (Polar) | Polar AccessLink connector + webhook. | same | parallel | M | same |
| 10 | **PR-HK-2.h** (Wahoo) | Wahoo connector + webhook. | same | parallel | M | same |
| 11 | **PR-HK-2.i** (Withings) | Withings connector + notify webhook. | same | parallel | L | same |
| 12 | **PR-HK-2.a** (Apple HealthKit) | iOS native bridge + `POST /v1/wearables/ingest` contract + permission flow. | PR-HK-0, PR-HK-1, PR-HK-CFG | other on-device PRs (different native folders) | XL | OAuth Sheet variant (HK permission), §A.3 |
| 13 | **PR-HK-2.b** (Health Connect / Google Fit) | Android native bridge + ingest endpoint. | same as 2.a | parallel | XL | same |
| 14 | **PR-HK-2.c** (Samsung Health) | Samsung SDK Android bridge. | same | parallel | L | same |
| 15 | **PR-HK-4** | AI insights foundation: `wearable-insights.service`, prompts (coach-HF, coach-SR, client-HF, client-SR), `WearableInsightCache`, output Zod schema, guardrails (no-medicalize), audit log via `AiRequestAudit`. **No UI.** | PR-HK-0 | PR-HK-1, PR-HK-2.* | L | none |
| 16 | **PR-HK-3a** | H&F bucket UI (client + coach tab): Fitness Overview, Metric Detail shared, Heart/Workouts/Body/FitnessTrend cards, Revolut glow-drag charts, freshness roll-up, owns shared `wearablesSamplesApi.ts` + `useWearableSamples.ts`. | PR-HK-0 + ≥3 connectors landed + PR-HK-1 | PR-HK-3b | L | Fitness Overview (§3.2 / §3.3a), Metric Detail (App B), Coach H&F tab (§3.3 / §3.3a) |
| 17 | **PR-HK-3b** | S&R bucket UI (client + coach tab): Recovery Overview with single recovery ring hero, plain-language stage labels, CALM slow-reveal charts, Phantom CALM treatment everywhere. | PR-HK-0 + ≥2 connectors landed + PR-HK-1 + PR-HK-3a (shared api/hook) | PR-HK-3a | L | Recovery Overview, Coach S&R tab, App A.1 |
| 18 | **PR-HK-5a** | Coach AI panel (small, progressively-disclosed) inside Client Detail H&F + S&R tabs. Owns shared `wearableInsightsApi.ts` + `useWearableInsights.ts`. | PR-HK-3a, PR-HK-3b, PR-HK-4 | PR-HK-5b | M | Coach AI panel (§4.4 / §6.1) |
| 19 | **PR-HK-5b** | Client AI panel on Fitness Overview + Recovery Overview + Metric Detail. Imports from 5a. | PR-HK-3a, PR-HK-3b, PR-HK-4, PR-HK-5a (shared api) | PR-HK-5a | M | Client AI panel (§5.2 / §6.2) |
| 20 | **PR-HK-6** | Approval workflow → existing `MessagesModule`: new materialiser `send-coach-wearable-message.materialiser.ts`, `approval.controller`, `approval.service`, mobile `MessageDraftApprovalScreen.tsx`, approve/edit affordance on Coach AI panel. | PR-HK-5a, PR-HK-4 | PR-HK-5b | M | Message Draft Approval (§4.5 / App A.2) |

**Deferred to v2 (feature-flagged):** PR-HK-2.j (Peloton), PR-HK-2.m (Eight Sleep), PR-HK-2.n (MyFitnessPal). PRs are pre-stubbed with the same connector interface so they can land later with zero replan.

**Minimum Viable Demo (MVP) cut:** PRs 1-3 + 4 (Oura) + 5 (WHOOP) + 6 (Strava) + 12 (HealthKit) + 15 (AI) + 16 (3a) + 17 (3b) + 18 (5a) + 19 (5b) + 20 (6). Demonstrates both buckets, S&R + H&F + on-device coverage, full dual-role AI with approval loop.

### 4.1 Dependency Graph (unified)

```
                                ┌──────────────────────┐
                                │   PR-HK-0  Foundation │
                                │   (schema + RLS + IS) │
                                └──────────┬────────────┘
                                           │
                          ┌────────────────┼─────────────────────┐
                          │                │                     │
                ┌─────────▼─────┐  ┌──────▼──────────┐  ┌────────▼────────┐
                │  PR-HK-CFG    │  │   PR-HK-1       │  │   PR-HK-4       │
                │  (Expo cfg)   │  │   Connections   │  │   AI insights   │
                │   mobile gate │  │   + OAuth UI    │  │   (no UI)       │
                └──────┬────────┘  └──────┬──────────┘  └────────┬────────┘
                       │                  │                       │
                       │            ┌─────┴─────┐                 │
                       │            │ Cloud OAuth                 │
                       │            │ connectors                  │
                       │            │ (parallel,                  │
                       │            │  file-disjoint)             │
                       │            │  2.d 2.e 2.f                │
                       │            │  2.g 2.h 2.i                │
                       │            │  2.k 2.l                    │
                       │            └─────┬─────┘                 │
                       │                  │                       │
              ┌────────┴─────────┐        │                       │
              │ On-device        │        │                       │
              │ connectors        │        │                       │
              │ (parallel after  │        │                       │
              │  CFG)            │        │                       │
              │  2.a 2.b 2.c     │        │                       │
              └────────┬─────────┘        │                       │
                       │                  │                       │
                       └───────┬──────────┘                       │
                               │                                  │
                       ≥3 connectors landed                       │
                               │                                  │
                  ┌────────────┴─────────────┐                    │
                  │                          │                    │
            ┌─────▼─────┐              ┌─────▼─────┐              │
            │ PR-HK-3a  │ ◄─── par ───►│ PR-HK-3b  │              │
            │ H&F UI    │  (3b imports │ S&R UI    │              │
            │ owns API  │   3a's api)  │           │              │
            └─────┬─────┘              └─────┬─────┘              │
                  │                          │                    │
                  └──────────┬───────────────┘                    │
                             │                                    │
                  ┌──────────▼──────────┐         ┌───────────────▼─┐
                  │   PR-HK-5a  Coach   │ ◄─par─► │   PR-HK-5b      │
                  │   AI panel + api    │ (5b      │   Client panel  │
                  └──────────┬──────────┘  imports)└─────────────────┘
                             │
                  ┌──────────▼──────────────┐
                  │ PR-HK-6  Approval flow  │
                  │ → MessagesModule        │
                  └─────────────────────────┘
```

---

## 5. Per-PR Audit Briefs (Builders + Auditors)

Each PR's audit brief lives in `audits/HK_wave/<PR-ID>_AUDIT_R1.md` (created by the auditor at the pinned SHA). Audit checklists below are the **fixed criteria** the auditor adds to plus the 50-Failures specific items per PR. Format matches PR-18 audit briefs.

### PR-HK-0 audit
Inherit Agent 2 §7 PR-HK-0 checklist, **plus**:
- `WearableUserMetricPreference` table present with `@@unique([user_id, metric])`, RLS enabled+forced, policies for SELECT/INSERT/UPDATE/DELETE.
- `WearableMetricDef` seeded with at least all metrics in §1.6 Agent 1 table, including plain-language `display_name` strings ("light sleep" not "N1/N2").
- `dedup.util` produces a known sha256 for a fixed test vector (anchored to a doc in the PR description).
- `IngestionService.resolveBest()` honors `WearableUserMetricPreference` first, falls back to most-recent provider.
- Migration is one file under `prisma/migrations/2026XXXX_wearables_foundation/migration.sql`. No multi-migration split.

### PR-HK-CFG audit (NEW)
- Touches only `app.json`, `eas.json`, mobile `package.json`, `Podfile.lock`, and native config files. No JS/TS source code edits.
- iOS HealthKit usage description string present and matches Apple App Store guidelines language.
- Android `health.HEALTH_DATA_READ` permission group declared (Health Connect).
- Samsung Health SDK key configured via env var, not committed.
- EAS dev-client build target succeeds in CI; profile names match repo convention.

### PR-HK-1 audit
Inherit Agent 2 §7 PR-HK-1 checklist, **plus**:
- Connections Hub renders providers chunked by bucket (Fitness sources / Recovery sources) per Agent 1 §3.6.
- OAuth Sheet shows one-line plain-language data statement (no scope-list overwhelm on first screen).
- Freshness chip states map to backend (`status` + `last_synced_at` + `last_error`) — NO client-side time math against `now()`; computed relative time comes from server response field.
- Disconnect copy names the consequence and uses Apple "possible but never accidental" friction proportional to cost.
- `connector-registry.ts` uses directory-scan loader (no per-PR registry edit).

### PR-HK-2.* audit (per connector)
Inherit Agent 2 §7 PR-HK-2.* checklist, **plus**:
- Connector folder is fully self-contained; touches no shared file outside its own directory.
- `WearableConnection.status` transitions correctly to `error` + populates `last_error` on provider failure with structured log line (test asserts).
- Normalizer maps to exactly the canonical metrics listed in Agent 2 §3.1; no speculative ingestion.

### PR-HK-3a/3b audit
Inherit Agent 2 §7 PR-HK-3a/3b checklist, **plus** (UX-binding gates from Agent 1):
- H&F screen renders the three-ring Apple Watch hero; recovery screen renders a single recovery ring hero.
- Switcher cross-fade animates warm↔cool per §1.4; respects `prefers-reduced-motion`.
- Bucket cap: ≤5 primary chunks visible without scroll (rings/hero + 4 cards). AI panel progressively disclosed off the cap (collapsed by default).
- Plain-language sleep stage labels (`light sleep`, NOT `N1`).
- Empty state shows value-first prompt + skeleton-of-the-real-layout on first sync (NOT a spinner).
- Provider-overlap chips on Metric Detail expose preferred-source toggle (writes `WearableUserMetricPreference`).
- React Query persister key versioned (per CPO NM React Query note).
- Coach view shows anomaly band beneath bucket hero; cohort comparisons NEVER rendered on client side.

### PR-HK-4 audit
Inherit Agent 2 §7 PR-HK-4 checklist, **plus**:
- Output Zod schema includes `confidence_level` enum exactly: `i_think | fairly_sure | confident | certain | verified`.
- Coach-side payload includes `hypothesis` + `suggested_message_draft`; client-side endpoint response NEVER includes those fields (verified by response-shape integration test).
- Guardrails reject diagnosis nouns from Agent 1 §6.4 forbidden list (apnea, arrhythmia, insomnia, depression, disorder).
- SpO2 / heart-irregularity observations automatically append the soft clinician-referral suffix in prompt templates.
- Per-user LLM cost cap enforced via `CoachAIBudget`/`UserAIQuota` (reuse, not reinvent).
- Cache TTL 6h; invalidated on `WearableConnection.last_synced_at` update.

### PR-HK-5a/5b audit
Inherit Agent 2 §7 PR-HK-5a/5b checklist, **plus**:
- Panel collapsed by default to a one-line observation; expanded shows full field set.
- Bucket-tinted at low saturation; uses shared type ramp; NO mascot/badge/playful motion (visual grep test).
- Confidence chip is a small unobtrusive chip, NOT a loud badge; color is neutral, NEVER green-for-good.
- Client panel CTA completes the action in ≤3 taps from the panel (Fogg ability imperative).
- Client panel S&R variant uses CALM treatment: reassurance copy BEFORE the deficit number (`You're close — about 45 min under your sleep need`).
- Forward-hook closure renders after CTA completion (`We'll check your REM tomorrow morning`).

### PR-HK-6 audit
Inherit Agent 2 §7 PR-HK-6 checklist, **plus**:
- Approval screen renders the recipient name in the header (`Sent to Maria`-style closure on send, not "Action complete").
- Approve action creates pending `AiActionDraft` first, THEN materializes — never auto-sends.
- Materialise idempotency proven by concurrent-approve integration test (two parallel approves → exactly one `CoachMessage` row).
- Owning-coach-only authorization check on approve endpoint (IDOR test must fail for a different coach).
- Audit row written on both `decided_at` and `materialised_at`.

---

## 6. Mobile Navigation Mounting (Single Edit Point)

To eliminate the `ClientNavigator.tsx` collision risk:

- **PR-HK-1** is the ONE PR that edits `ClientNavigator.tsx`. It adds a single `<Stack.Screen name="Health" component={WearablesShell} />` and a single `<Stack.Screen name="Connections" component={ConnectionsScreen} />`.
- `WearablesShell.tsx` is the parent screen that owns the `Fitness | Recovery` switcher and renders `<HealthFitnessScreen/>` or `<SleepRecoveryScreen/>` based on the `bucket` URL param.
- PR-HK-3a creates `HealthFitnessScreen.tsx`; PR-HK-3b creates `SleepRecoveryScreen.tsx`. Neither touches `ClientNavigator.tsx` or `WearablesShell.tsx`.
- Coach-side: PR-HK-3a + PR-HK-3b each add ONE tab entry to the existing `client-detail/` tabbed view's tab registry. If the registry is a single shared file, one PR (3a) lands first, 3b extends it. Confirmed disjoint files in the tabbed-view system (existing pattern is one file per tab plus a tiny `tabs.ts` index — schedule 3a-then-3b on that index, expect one-line additive merge).

---

## 7. Parallelization Safety Re-Audit

| File | Owners (intended) | Risk | Mitigation |
| --- | --- | --- | --- |
| `prisma/schema.prisma` | PR-HK-0 only | High → none | Hard-locked mutex; later PRs adding columns queue a follow-up to PR-HK-0-rev-N (the synthesis decision is: there are NO planned follow-up schema changes — the `WearableUserMetricPreference` addition closes the only missing model) |
| `src/app.module.ts` | PR-HK-0 only | Low | One import + `WearablesModule` mount; sub-PRs hang off `WearablesModule`, not `AppModule` |
| `connector-registry.ts` | PR-HK-1 writes; auto-loads | None | Directory-scan loader; new connector folder = automatic registration |
| `wearablesSamplesApi.ts` (mobile) | PR-HK-3a writes, 3b imports | None | 3a lands first by schedule |
| `wearableInsightsApi.ts` (mobile) | PR-HK-5a writes, 5b imports | None | 5a lands first by schedule |
| `ClientNavigator.tsx` | PR-HK-1 only | Low | One mount of `<WearablesShell>`; bucket screens are children, not navigator entries |
| `coach client-detail tabs registry` (existing file) | PR-HK-3a adds H&F tab; 3b adds S&R tab | Low | Schedule 3a → 3b; one-line additive merge |
| `app.json` / `eas.json` | PR-HK-CFG only | None | Single config PR; on-device connector PRs depend on CFG landing |
| `materialisers` registry (existing) | PR-HK-6 adds one materialiser | Low | If auto-scan: zero edit. If manual array: one-line add by 6 |

**Outcome:** zero PRs require a non-trivial rebase. Every collision is either eliminated structurally or resolved by a single-line additive edit with a clear scheduled owner.

---

## 8. Builder Quickstart (Per-PR Template)

When you pick up a PR, you should be able to start in 5 minutes:

1. **Pull the latest:**
   ```bash
   cd /home/user/workspace/repos/growth-project-backend
   git fetch origin && git checkout main && git pull origin main
   ```
   (Use `growth-project-mobile` for any mobile-only PR.)
2. **Create worktree:**
   ```bash
   git worktree add /home/user/workspace/wk-hk-<id> -b hk/PR-HK-<id>-<slug>
   ```
3. **Implement** the PR per §5 brief. Touch only files in your declared write-set.
4. **Run quality gates** (locally, then in CI):
   - `npx prisma validate` + `npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma` (PR-HK-0 only)
   - `NODE_OPTIONS=--max-old-space-size=4096 npx tsc --noEmit -p tsconfig.json`
   - `npx eslint <touched files>`
   - `yarn jest <touched specs>`
   - For mobile PRs: `npm run lint`, `npx tsc --noEmit`, the relevant Jest suites under `__tests__/`
5. **Commit** with author identity `Dynasia G <dynasia@trygrowthproject.com>`, NO trailers, NO co-authors. Push to `hk/PR-HK-<id>-<slug>` (`api_credentials=["github"]`). Push every ~2 minutes (R61).
6. **Write build report** to `tgp-agent-context/build-reports/HK_<PR-ID>_BUILD.md` covering: problem, design, file diffs, test list, all green.
7. **Open PR** and request audit (R31: auditor ≠ builder).
8. **Clean up worktree** on merge: `git worktree remove /home/user/workspace/wk-hk-<id> --force`.

---

## 9. Cross-Cutting Quality Floor (Every PR)

Verified by every auditor regardless of PR:

- **Tests assert real values**, not `toBeDefined()` (50-Failures #17).
- **No N+1** in backfill or list endpoints; batch upserts / `groupBy` (50-Failures #21).
- **Layered architecture**: controllers orchestrate, services implement, repos query; no business logic in controllers or RN components (50-Failures #14).
- **Reuse, never reinvent** crypto/date/http (use `KmsService`, `date-fns`, `services/api.ts` — 50-Failures #15/#40/#41).
- **`.env.example` updated** with every new provider var; no localhost/hardcode (50-Failures #18).
- **Structured logging** via existing observability module (50-Failures #34); no silent `catch` (50-Failures #36).
- **`npm audit --audit-level=high`** before any new dep; prefer zero new deps (50-Failures #10).
- **No dead code**; reserved-but-empty connector slots are not merged (50-Failures #43).
- **Author identity correct** on every commit. NO trailers. NO co-authors.

---

## 10. Demo Path Checklist (MVP Definition of Done)

When the following are all true, the MVP demo is shippable:

- [ ] PR-HK-0 merged; new tables exist with RLS+FORCE; `WearableMetricDef` seeded.
- [ ] PR-HK-CFG merged; iOS + Android dev-clients build green.
- [ ] PR-HK-1 merged; user can navigate to Connections Hub.
- [ ] PR-HK-2.k (Oura) merged; user can connect Oura, see freshness chip, see backfill on first sync.
- [ ] PR-HK-2.l (WHOOP) merged; same.
- [ ] PR-HK-2.f (Strava) merged; same.
- [ ] PR-HK-2.a (HealthKit) merged; user can grant device permissions and see data flow.
- [ ] PR-HK-4 merged; `wearable-insights.service` returns side-correct payloads under cost cap.
- [ ] PR-HK-3a merged; Fitness Overview renders rings + 4 cards; switcher cross-fades to S&R.
- [ ] PR-HK-3b merged; Recovery Overview renders single recovery-ring hero + CALM treatment.
- [ ] PR-HK-5a + PR-HK-5b merged; Coach + Client AI panels render with confidence chips, never auto-send.
- [ ] PR-HK-6 merged; Coach can approve a draft → message lands in existing `MessagesModule`.
- [ ] No mascot anywhere; no medicalizing copy; no diagnosis nouns; confidence labels rendered.
- [ ] Sample-list reads paginated; no N+1; tests asserting real values.
- [ ] Every audit doc CLEAN at the merged SHA.

---

*End UNIFIED_BUILD_PLAN. Synthesis complete. Builders may proceed in dependency order without further coordination.*
