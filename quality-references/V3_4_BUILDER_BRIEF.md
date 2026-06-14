# v3-4 Builder Brief — community search + wearable-aware prompts

**Codified:** 2026-06-13 by Bradley Gleave. Follows `BUILDER_BRIEF_TEMPLATE_V2.md`.
**Spec source:** `COMMUNITY_EXECUTION_PLAN.md` PR v3-4 section.
**Depends on:** v3-2 + v3-3 merged + P0-0A + P0-0B (verify before starting).

## Repo + branch

- Backend repo: `BradleyGleavePortfolio/growth-project-backend`
- Mobile repo: `BradleyGleavePortfolio/growth-project-mobile`
- Branch (both): `feature/community-v3-search-wearables`
- Base: `main` (fetch fresh AFTER v3-2 + v3-3 have merged)
- Final action: open NEW PR on each repo, do NOT merge

## Bradley R0 LAW (operator directive verbatim, 2026-06-13)

*"every single PR should say bradley@bradleytgpcoaching.com - no AI names - just bradley + my email"*

EVERY commit uses inline `-c` flags. NEVER `git config --global`:
```bash
git -c user.name='Bradley Gleave' -c user.email='bradley@bradleytgpcoaching.com' commit -m "..."
```

- NO co-author trailers, NO `Generated-By`, NO assistant attribution
- NO "Coming soon" strings (case-insensitive)
- NO `@ts-ignore`, `@ts-nocheck`, `as any`, `as unknown as X`, `as never as X`, bare `as never`
- NO `.catch(()=>undefined)`, `.catch(()=>null)`, `.catch(()=>{})`, empty `catch(e){}`, console-only swallows
- `@ts-expect-error` with one-line justification IS allowed
- Push every 2 minutes minimum (R52)

## Mandatory training docs

- `/tmp/tgp-agent-context/quality-references/50_FAILURES_OF_AI_GENERATED_CODE.md`
- `/tmp/tgp-agent-context/quality-references/MOBILE_APP_DESIGN_INTELLIGENCE.md`
- `/tmp/tgp-agent-context/quality-references/BUILDER_BRIEF_TEMPLATE_V2.md`
- `/tmp/tgp-agent-context/COMMUNITY_EXECUTION_PLAN.md` PR v3-4 section + schema design
- Existing `src/wearables/insights/wearable-insights.service.ts` (consumer pattern)

## Plan doc + technical scope

### Feature in plain terms

Two paired capabilities:

1. **Community search** — clients and coaches search posts, lessons, voice notes (transcript-only if present), events across their workspace. Results respect ALL existing RLS (membership, cohort, soft-delete).
2. **Wearable-aware prompts** — coaches receive AI-generated coaching prompts ("Sarah's HRV dropped 12% this week — consider checking in") sourced from already-opted-in wearable insights. Prompts are coach-facing only; never surface raw health data to other clients.

### Backend (~1000 LOC of the ~1800 total)

**Search subsystem files OWNED:**

- `src/community/search/community-search.module.ts`
- `src/community/search/community-search.controller.ts`
- `src/community/search/community-search.service.ts`
- `src/community/search/community-search.repository.ts`
- `src/community/search/community-search.dto.ts`
- `src/community/search/community-search-flag.guard.ts`
- `src/community/search/search-indexer.service.ts` (writes search rows on post/lesson/voice/event create)
- `src/community/search/search-indexer.listener.ts` (subscribes to community events)
- `src/community/search/__tests__/community-search.service.spec.ts`
- `src/community/search/__tests__/search-indexer.spec.ts`
- `test/community/search/community-search.e2e.spec.ts`
- `test/rls/community-search-rls.spec.ts`

**Wearable-prompts subsystem files OWNED:**

- `src/community/wearable-prompts/wearable-prompts.module.ts`
- `src/community/wearable-prompts/wearable-prompts.controller.ts`
- `src/community/wearable-prompts/wearable-prompts.service.ts`
- `src/community/wearable-prompts/wearable-prompts.repository.ts`
- `src/community/wearable-prompts/wearable-prompts.dto.ts`
- `src/community/wearable-prompts/wearable-prompts-flag.guard.ts`
- `src/community/wearable-prompts/prompt-generator.service.ts`
- `src/community/wearable-prompts/degraded-connector-fallback.service.ts` (was `disabled-connector-fallback.service.ts` in earlier draft — see `V3_4_PREFLIGHT_NOTES.md`; the actual lifecycle states are CONNECTED/EXPIRED/ERROR/DISCONNECTED, no `disabled`)
- `src/community/wearable-prompts/__tests__/wearable-prompts.service.spec.ts`
- `src/community/wearable-prompts/__tests__/prompt-generator.spec.ts`
- `src/community/wearable-prompts/__tests__/degraded-connector-fallback.spec.ts`
- `test/community/wearable-prompts/wearable-prompts.e2e.spec.ts`

**Shared:**

- `prisma/migrations/{TIMESTAMP_AFTER_V3_3}_community_search_index/migration.sql`
- `prisma/migrations/{TIMESTAMP_AFTER_SEARCH}_community_wearable_prompts/migration.sql`
- `prisma/schema.prisma` (additive: `CommunitySearchEntry`, `CommunityWearablePrompt`, `CommunityWearablePromptSource`)
- `src/community/community.module.ts` (add TWO modules, rebased from main post-v3-3)

### Mobile (~800 LOC of the ~1800 total)

Files OWNED:

- `src/screens/community/CommunityFindScreen.tsx`
- `src/screens/community/CommunityWearablePromptsScreen.tsx` (coach only)
- `src/components/community/SearchBar.tsx`
- `src/components/community/SearchResultRow.tsx`
- `src/components/community/SearchEmptyState.tsx`
- `src/components/community/WearablePromptCard.tsx`
- `src/components/community/WearablePromptSourcePill.tsx` (shows which metric drove the prompt)
- `src/hooks/community/useCommunitySearch.ts`
- `src/hooks/community/useWearablePrompts.ts`
- `src/api/community/search.api.ts`
- `src/api/community/wearable-prompts.api.ts`
- `__tests__/screens/CommunityFindScreen.spec.tsx`
- `__tests__/components/SearchResultRow.spec.tsx`
- `__tests__/components/WearablePromptCard.spec.tsx`
- `__tests__/hooks/useCommunitySearch.spec.ts`
- `__tests__/hooks/useWearablePrompts.spec.ts`

### Prisma additions

```prisma
enum CommunitySearchKind {
  post
  classroom_lesson
  voice_note_transcript
  event
}

model CommunitySearchEntry {
  id              String              @id @default(cuid())
  workspaceId     String
  cohortId        String?
  kind            CommunitySearchKind
  targetId        String              // refs CommunityPost.id, CommunityClassroomPost.id, CommunityVoiceNote.id, CommunityEvent.id
  authorId        String?
  excerpt         String              @db.Text  // first 500 chars + tsvector basis
  visibleToRoles  String[]            // ['coach','assistant','student']
  createdAt       DateTime            @default(now())
  softDeletedAt   DateTime?

  @@unique([workspaceId, kind, targetId])
  @@index([workspaceId, cohortId, kind, createdAt])
  // tsvector + GIN index added via raw SQL in migration
}

model CommunityWearablePrompt {
  id            String   @id @default(cuid())
  workspaceId   String
  coachId       String
  clientId      String
  metricKey     String   // 'hrv' | 'sleep_consistency' | 'recovery' | ...
  promptText    String   @db.Text
  sources       CommunityWearablePromptSource[]
  generatedAt   DateTime @default(now())
  dismissedAt   DateTime?
  actedOnAt     DateTime?

  @@index([workspaceId, coachId, generatedAt])
  @@index([workspaceId, coachId, dismissedAt])
}

model CommunityWearablePromptSource {
  id              String   @id @default(cuid())
  promptId        String
  sampleId        String   // refs WearableSample.id from existing wearables subsystem
  metricKey       String
  observedValue   Decimal
  prompt          CommunityWearablePrompt @relation(fields: [promptId], references: [id])

  @@index([promptId])
  @@index([sampleId])
}
```

RLS on all three. Search: row visible only if requester is member of `cohortId` (or `cohortId IS NULL` and requester is workspace member) AND role IN `visibleToRoles`. Wearable prompts: coach-only read, scoped to own clients via existing coach-client relationship.

### Tests required (per spec)

1. **Search RLS** — search MUST only return rows the caller can see. Test: client searches, gets no results from cohorts they're not in.
2. **Search soft-delete** — `softDeletedAt IS NULL` filter on every query
3. **Wearable prompt consent** — prompt generated ONLY for clients with `wearable_insights_consent=true`
4. **Sample source IDs recorded** — every `CommunityWearablePrompt` has ≥1 `CommunityWearablePromptSource` linking to real `WearableSample.id`
5. **Degraded connector fallback** — if client's wearable connector is in any non-CONNECTED state (`EXPIRED` / `ERROR` / `DISCONNECTED` per `WearableConnectionStatus` enum at `src/wearables/connections/types.ts`), prompt generator MUST skip (no stale data), fallback service emits telemetry. There is **no** `disabled` state in the actual enum — the brief's earlier wording was a defect caught by R76 pre-flight.
6. **No PHI leak** — search results MUST NOT include wearable metric values; wearable prompts MUST NOT be returned to clients
7. **Indexer idempotency** — re-indexing same target id is a no-op (use `@@unique([workspaceId, kind, targetId])`)

### Feature flags

- Backend: `FEATURE_COMMUNITY_SEARCH` (default `false`)
- Backend: `FEATURE_COMMUNITY_WEARABLE_PROMPTS` (default `false`)
- Mobile: `EXPO_PUBLIC_FF_COMMUNITY_SEARCH` (default `false`)
- Mobile: `EXPO_PUBLIC_FF_COMMUNITY_WEARABLE_PROMPTS` (default `false`)

### Pre-computed thresholds

- WCAG AA contrast on all UI:
  - Normal text ≥ **4.5:1**
  - Large text ≥ **3.0:1**
  - UI components ≥ **3.0:1**
- Search query max length: **200 chars**
- Search results page size: **20** rows, configurable via `COMMUNITY_SEARCH_PAGE_SIZE`, max 50
- Search query timeout: `signal: AbortSignal.timeout(5000)` server-side; mobile shows real loading state but bails after 5s with retry CTA
- Wearable prompt generation cooldown: **24 hours per (coachId, clientId, metricKey)** — enforced via index + unique constraint
- Wearable sample lookback window: **14 days** for metric trend computation
- Multi-row writes: `prisma.$transaction([...])`
- External HTTP (none expected — but if present): `signal: AbortSignal.timeout(N)`

## OWNS

Listed in Backend + Mobile sections. `community.module.ts` rebase from post-v3-3 main.

## DO NOT TOUCH

- **v3-2 + v3-3 files** (must already be merged): classroom and voice modules
- **`src/wearables/**`** — CONSUME only via the exported services: `WearableSamplesService` (from `samples/samples.module.ts`) and `WearableInsightsService` (from `insights/insights.module.ts`). The cached-insights Prisma model is `WearableInsightCache` (NOT `WearableInsight` — brief defect caught by R76 pre-flight). Do NOT modify wearable internals.
- **`src/community/posts/**`, `src/community/messages/**`, `src/community/events/**`** — CONSUME for search-indexer listener; do NOT modify
- **L1-L6 lanes** — all should be merged by the time v3-4 dispatches
- **Existing community RLS migrations** — only add NEW RLS for new tables

### R78 — Pinned telemetry table MUST update in same slice PR

If this slice adds ANY `community.*` PostHog telemetry event to
`src/community/community-events.ts` → `COMMUNITY_TELEMETRY_EVENTS`, you MUST
update the pinned event-name test in the SAME PR:

```
test/community/realtime/posthog-event-names.spec.ts
```

The pin uses `expect(COMMUNITY_TELEMETRY_EVENTS).toEqual({...})` plus a
`toHaveLength(N)` check. Both must be updated when events are added.

Baseline progression: 6 (v1-4) → 9 (after v3-2) → (v3-3 may bump). Confirm the
current count by reading the file on `main` before edits.

Run locally before opening PR:
```
npm test -- --testPathPattern=posthog-event-names
```

MUST be green. Skipping this step caused L7 v3-2 PR #396 build-and-test
failure (see R78 in `rules/`).

## Workflow

1. Verify dependencies on main:
   ```bash
   git log main --oneline | grep -E "v3-2|v3-3" | head -5
   # Both should show landed commits
   ```
2. Verify P0-0A + P0-0B per `COMMUNITY_EXECUTION_PLAN.md` (wearable insight consent + sample id durability)
3. Clone both repos to `/tmp/gpb-L9` and `/tmp/gpm-L9`
4. Create branches
5. Read existing wearable insights consumer pattern: `src/wearables/insights/wearable-insights.service.ts`
6. Backend: search migration → search schema → search-indexer → search service → search controller → tests
7. Push every 2 min (R52)
8. Backend: wearable-prompts migration → schema → generator → service → controller → tests
9. Push every 2 min
10. Mobile: search api/hook/components/screen/tests
11. Mobile: wearable-prompts api/hook/components/screen/tests
12. Run gates
13. Open both PRs

## 🚨 Self-audit gates

### Gate 1 — R0 ban scan
```bash
git diff main...HEAD | grep -iE 'coming soon|@ts-ignore|@ts-nocheck|\bas any\b|as unknown as|as never as|\bas never\b|\.catch\(\(\)\s*=>\s*(undefined|null|\{\}|void)\)' || echo "CLEAN"
```

### Gate 2 — Build + lint + test
Backend:
```bash
npm ci
npx tsc --noEmit
npm run lint
npm test -- --testPathPattern='search|wearable-prompts|indexer' --runInBand
npm run test:rls -- --testPathPattern='search|wearable-prompts'
```
Mobile:
```bash
npm ci
npx tsc --noEmit
npm run lint
npm test -- --testPathPattern='[Ss]earch|[Ww]earable' --runInBand
```

### Gate 3 — 50-Failures sweep (file:line OR N/A per category)
Critical categories for this lane:
- **PHI leakage** — search MUST NOT return wearable values; wearable prompts MUST NOT reach client UI
- **RLS gap on new tables** — every new table has policies + spec coverage
- **N+1 on search** — search indexer cannot loop per-target fetches
- **Stale data in prompts** — degraded-connector fallback (non-CONNECTED state) MUST short-circuit before generation
- **Prompt cooldown bypass** — 24h cooldown enforced via unique index, not application-level check alone
- **Consent re-check** — consent state checked AT PROMPT GENERATION TIME, not cached from prior insight
- **Sample id integrity** — every prompt source row references an existing `WearableSample.id` (FK or assert in test)
- **Indexer idempotency** — re-running indexer on same target is no-op
- **Search soft-delete** — `softDeletedAt IS NULL` predicate on every query path
- **Tsvector + GIN index** — verify migration creates the index (raw SQL needed for tsvector)

### Gate 4 — UI contrast table
Document ratios for `SearchBar`, `SearchResultRow`, `SearchEmptyState`, `WearablePromptCard`, `WearablePromptSourcePill`.

## Audit guarantees (per spec)

- ZERO health data leakage in cohort posts (search index excludes wearable values; transcripts only if explicit consent)
- Client consent + coach ownership checked BEFORE every prompt generation
- Prompt source `sampleId`s recorded — audit trail proves which wearable sample drove which prompt
- Disabled connector → no stale prompt, fallback emits telemetry
- Search query latency budget: p95 ≤ 800ms on 10k-row workspace (perf assert in e2e)

## Final report (`/tmp/gpb-L9/V3_4_FINAL_REPORT.md` + `/tmp/gpm-L9/V3_4_FINAL_REPORT.md`)

- Files modified
- Files created
- Commits — `git log --format='%H %an <%ae> %s' main..HEAD`
- Gate 1-4 output
- PR URLs
- Final HEAD SHA per repo
- Search p95 latency from e2e spec

## Auth

`api_credentials=["github"]`. Remote uses `git-agent-proxy.perplexity.ai`.

## Done criteria

- Backend + mobile PRs opened on both repos, NOT merged
- All 4 gates pass
- All commits as `Bradley Gleave <bradley@bradleytgpcoaching.com>`
- Reports saved
- Search RLS spec proves non-member denial across all 4 search kinds
- Wearable prompt spec proves consent gate + sample id recording

## Dependencies (verify BEFORE starting)

- v3-2 classroom posts merged
- v3-3 voice notes merged
- P0-0A wearable consent durability — verify per COMMUNITY_EXECUTION_PLAN.md
- P0-0B wearable sample id durability — verify per COMMUNITY_EXECUTION_PLAN.md
- L1-L6 ideally landed (zod, async-storage, RNTL, Roman, drip-fire-at) — but not strictly required by file scope

## NOT in scope

- v3-2 / v3-3 changes
- Refactor of wearables subsystem (consume only)
- Wearable consent flow itself (P0-0A)
- New wearable connectors
