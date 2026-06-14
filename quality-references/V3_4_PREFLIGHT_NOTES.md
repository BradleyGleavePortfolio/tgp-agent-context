# v3-4 search + wearable prompts — empirical pre-flight notes (R76)

**Pre-flight by:** Operator, 2026-06-14 03:38 PDT
**Branch checked:** `main` @ HEAD (post L1+L6 merge; v3-2 + v3-3 NOT yet merged
at time of pre-flight — re-verify after both land).

The L9 brief makes several scope assumptions that need empirical correction
before dispatch.

## Empirical findings

### 1. Wearables subsystem exists and is fully built out

```
src/wearables/
  connections/  (controller, service, types.ts with WearableConnectionStatus enum)
  connectors/   (provider-specific)
  http/
  ingestion/    (sample ingest pipeline)
  insights/     (WearableInsightsService, InsightCacheService)
  normalization/
  oauth/
  preferences/
  samples/      (WearableSamplesService, controller, module)
  wearables.constants.ts
  wearables.module.ts
```

**Exports L9 will consume:**
- `WearableInsightsService` (from `insights/insights.module.ts` — also exports `InsightCacheService`)
- `WearableSamplesService` (from `samples/samples.module.ts`)

### 2. ⚠️ CORRECTION TO BRIEF — connector lifecycle states

**The brief says (line 172):**
> "Disabled connector fallback — if client's wearable connector is in `disabled` state, prompt generator MUST skip"

**Actual enum from `src/wearables/connections/types.ts`:**
```ts
export enum WearableConnectionStatus {
  CONNECTED = 'connected',
  EXPIRED = 'expired',
  ERROR = 'error',
  DISCONNECTED = 'disconnected',
}
```

**There is NO `disabled` state.** The L9 builder must:
- Treat **EXPIRED**, **ERROR**, and **DISCONNECTED** as the fallback triggers
  (not `disabled`).
- The fallback service (`disabled-connector-fallback.service.ts`) should
  rename to `degraded-connector-fallback.service.ts` OR keep "disabled-" in
  the filename but semantically mean "not CONNECTED" (preferred: use
  "degraded" or "non-connected" to avoid future confusion).
- The telemetry event the brief alludes to should fire on the actual real
  state, not on a phantom `disabled` value.

This is a brief defect that R76 (empirical verification) caught. When
dispatching L9, the operator should include a correction directive.

### 3. ⚠️ CORRECTION TO BRIEF — Prisma model name

**The brief says (Prisma additions section):**
> "`WearableInsight`"

**Actual model in `prisma/schema.prisma` (line 5446):**
```
model WearableInsightCache {
  ...
}
```

**There is no `WearableInsight` model — only `WearableInsightCache`.** L9's
prompt generator must consume `WearableInsightCache` (or accept the
`WearableInsightsService` Read API and treat it as opaque), NOT a non-
existent `WearableInsight` table.

### 4. WearableConnection model has no `disabled` field

The full lifecycle indicator on `WearableConnection` is the `status` column
populated from `WearableConnectionStatus` enum. There's no boolean flag like
`is_disabled`. Builder must filter by `status !== 'connected'`.

### 5. Community subsystem state

Existing `src/community/` subfolders (28 total) — NO `search/` and NO
`wearable-prompts/` folders. Both are clean OWNS for v3-4.

### 6. Latest migration timestamp on main

```
20261216000100_add_plan_context_payload
```

L9's two new migrations must have timestamps:
- `>= 20261217000000` (strictly greater) for `community_search_index`
- `>= timestamp_after_search` for `community_wearable_prompts`

After v3-2 (L7) and v3-3 (L8) land, the latest migration timestamp will be
higher — re-check immediately before authoring L9's migration filenames.

### 7. R78 telemetry events expected to be added

Plausible v3-4 events:
- `searchQueryIssued: 'community.search.query_issued'` (with PII-stripped term)
- `searchResultViewed: 'community.search.result_viewed'`
- `wearablePromptGenerated: 'community.wearable.prompt_generated'`
- `wearablePromptShipped: 'community.wearable.prompt_shipped'`
- `wearablePromptFallbackFired: 'community.wearable.prompt_fallback_fired'`

Pin update for `posthog-event-names.spec.ts` must bump from post-v3-3 baseline
to whatever the actual count is.

### 8. PII-strip protocol for search

The brief mentions "search results MUST NOT include wearable metric values".
L9's search indexer MUST also strip:
- Email addresses
- Phone numbers
- Token-shaped strings (JWT, UUID-paired with name)
- Free-text bodies of voice notes (v3-3) and DMs (v1-3)

The existing `classifyTelemetryError()` utility in `community-events.ts`
includes a BOUNDED ALLOWLIST pattern — L9's PII-stripper should use a similar
allowlist approach for search-indexer text payloads (extract titles + tags +
public metadata only, never bodies).

## Action for L9 builder

When dispatching L9, reference this pre-flight note. Specifically:

> "Empirical pre-flight at `quality-references/V3_4_PREFLIGHT_NOTES.md` flags
> two brief defects:
> (a) The `disabled` connector state does not exist — the actual enum is
>     CONNECTED/EXPIRED/ERROR/DISCONNECTED. Treat EXPIRED+ERROR+DISCONNECTED
>     as the fallback trigger.
> (b) The Prisma model is `WearableInsightCache`, not `WearableInsight`.
>     Consume via `WearableInsightsService` (already exported from
>     insights.module).
>
> Implement the wearable prompt generator + fallback in terms of the actual
> shapes. Do NOT introduce a new 'disabled' state — that would break the
> wearables module owns."

## Brief patch action

After v3-3 merges and before L9 dispatches, the operator should also edit
`V3_4_BUILDER_BRIEF.md` directly to replace:
- "`disabled` state" → "non-CONNECTED state (EXPIRED/ERROR/DISCONNECTED)"
- "`WearableInsight`" → "`WearableInsightCache`"
- "`disabled-connector-fallback.service.ts`" filename — rename to
  "`degraded-connector-fallback.service.ts`" (preferred) or keep the name
  but document the semantic.
