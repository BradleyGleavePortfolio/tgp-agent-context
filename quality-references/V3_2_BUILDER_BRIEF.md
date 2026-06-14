# v3-2 Builder Brief — community classroom posts (media-backed lessons)

**Codified:** 2026-06-13 by Bradley Gleave. Follows `BUILDER_BRIEF_TEMPLATE_V2.md`.
**Spec source:** `COMMUNITY_EXECUTION_PLAN.md` PR v3-2 section.

## Repo + branch

- Backend repo: `BradleyGleavePortfolio/growth-project-backend`
- Mobile repo: `BradleyGleavePortfolio/growth-project-mobile`
- Branch (both): `feature/community-v3-classroom-posts`
- Base: `main` (fetch fresh at dispatch time)
- Final action: open NEW PR on each repo, do NOT merge

## Bradley R0 LAW (operator directive verbatim, 2026-06-13)

*"every single PR should say bradley@bradleytgpcoaching.com - no AI names - just bradley + my email"*

EVERY commit on EVERY repo uses inline `-c` flags. NEVER `git config --global`:
```bash
git -c user.name='Bradley Gleave' -c user.email='bradley@bradleytgpcoaching.com' commit -m "..."
```

- NO co-author trailers, NO `Generated-By`, NO assistant attribution
- NO "Coming soon" strings (case-insensitive) — including regex like `/coming soon/i`
- NO `@ts-ignore`, `@ts-nocheck`, `as any`, `as unknown as X`, `as never as X`, bare `as never`
- NO `.catch(()=>undefined)`, `.catch(()=>null)`, `.catch(()=>{})`, empty `catch(e){}`, console-only swallows
- `@ts-expect-error` with one-line justification IS allowed
- Push every 2 minutes minimum (R52)

## Mandatory training docs (read before code)

- `/tmp/tgp-agent-context/quality-references/50_FAILURES_OF_AI_GENERATED_CODE.md`
- `/tmp/tgp-agent-context/quality-references/MOBILE_APP_DESIGN_INTELLIGENCE.md` (mobile UI required)
- `/tmp/tgp-agent-context/quality-references/BUILDER_BRIEF_TEMPLATE_V2.md` (structural reference)
- `/tmp/tgp-agent-context/COMMUNITY_EXECUTION_PLAN.md` PR v3-2 section + schema-design section

## Plan doc + technical scope

### Feature in plain terms

Coaches publish **media-backed lessons** (video, audio, PDF, image) to their community classroom. Lessons can be **pinned** (sticky at top), **release-locked** (unlocked at a future date), and ordered by coach. Clients see a classroom tab inside their community, scroll lessons, tap to view media. Replays of past live events also surface as classroom cards.

### Backend (~900 LOC of the ~1500 total)

Files OWNED:

- `src/community/classroom/community-classroom.module.ts`
- `src/community/classroom/community-classroom.controller.ts`
- `src/community/classroom/community-classroom.service.ts`
- `src/community/classroom/community-classroom.repository.ts`
- `src/community/classroom/community-classroom.dto.ts`
- `src/community/classroom/community-classroom-flag.guard.ts`
- `src/community/classroom/community-classroom-release.feature.ts` (release-lock logic)
- `src/community/classroom/__tests__/community-classroom.service.spec.ts`
- `src/community/classroom/__tests__/community-classroom-release.spec.ts`
- `src/community/classroom/__tests__/pinned-ordering.spec.ts`
- `test/community/classroom/community-classroom.e2e.spec.ts`
- `test/rls/community-classroom-rls.spec.ts`
- `prisma/migrations/{YYYYMMDDHHMMSS}_community_classroom_posts/migration.sql` (NEW)
- `prisma/schema.prisma` (additive only: `CommunityClassroomPost`, `CommunityClassroomMediaAsset`)
- `src/community/community.module.ts` (ONE LINE: register `CommunityClassroomModule` in imports array)
- `src/community/community-events.ts` (additive: new event names for classroom telemetry)

### Mobile (~600 LOC of the ~1500 total)

Files OWNED:

- `src/screens/community/CommunityClassroomScreen.tsx`
- `src/screens/community/CommunityLessonDetailScreen.tsx`
- `src/components/community/LessonCard.tsx`
- `src/components/community/LessonReleaseLockBadge.tsx`
- `src/components/community/ClassroomEmptyState.tsx`
- `src/hooks/community/useClassroomFeed.ts`
- `src/api/community/classroom.api.ts`
- `__tests__/screens/CommunityClassroomScreen.spec.tsx`
- `__tests__/components/LessonCard.spec.tsx`
- `__tests__/hooks/useClassroomFeed.spec.ts`
- `src/navigation/CommunityStack.tsx` (additive: register 2 new screens)

### Prisma additions (additive only, no FK churn on existing tables)

```prisma
enum CommunityClassroomPostStatus {
  draft
  scheduled  // release-locked, not yet visible
  published
  archived
}

model CommunityClassroomPost {
  id              String                       @id @default(cuid())
  workspaceId     String
  cohortId        String?
  coachId         String
  title           String                       @db.VarChar(200)
  bodyMarkdown    String                       @db.Text
  status          CommunityClassroomPostStatus @default(draft)
  pinned          Boolean                      @default(false)
  pinnedOrder     Int?
  releaseAt       DateTime?
  publishedAt     DateTime?
  createdAt       DateTime                     @default(now())
  updatedAt       DateTime                     @updatedAt
  softDeletedAt   DateTime?
  mediaAssets     CommunityClassroomMediaAsset[]

  @@index([workspaceId, cohortId, status, releaseAt])
  @@index([workspaceId, cohortId, pinned, pinnedOrder])
}

model CommunityClassroomMediaAsset {
  id            String   @id @default(cuid())
  postId        String
  workspaceId   String
  kind          String   // 'video' | 'audio' | 'pdf' | 'image'
  storageKey    String
  durationSec   Int?
  bytes         BigInt?
  mimeType      String?
  width         Int?
  height        Int?
  createdAt     DateTime @default(now())
  post          CommunityClassroomPost @relation(fields: [postId], references: [id])

  @@index([workspaceId, postId])
  @@index([storageKey])
}
```

RLS on both tables in the SAME migration. Coach role can write to own workspace; student role can read where membership + (status='published' AND (releaseAt IS NULL OR releaseAt <= now())).

### Tests required (per spec)

1. **Signed upload** — uploader receives time-limited signed URL bound to workspaceId + postId. URL refuses cross-workspace use.
2. **Media access by membership** — non-member of cohort cannot fetch storageKey URL.
3. **Release time lock** — `status='scheduled' AND releaseAt > now()` returns 0 rows for student; transitions to visible at `releaseAt <= now()`.
4. **Pinned ordering** — `pinned=true ORDER BY pinnedOrder ASC` returns before non-pinned `ORDER BY publishedAt DESC`.
5. **Replay card access** — past community event surfaces in classroom feed when toggle is on; respects same RLS.
6. **RLS spec** — covers all 4 roles (coach, assistant, student, none) × 3 visibility states (draft, scheduled, published).

### Feature flags

- Backend: `FEATURE_COMMUNITY_CLASSROOM_POSTS` (default `false`) — guards controller routes via `community-classroom-flag.guard.ts`
- Mobile: `EXPO_PUBLIC_FF_COMMUNITY_CLASSROOM_POSTS` (default `false`) — guards screen registration + tab visibility

### Pre-computed thresholds

- WCAG AA contrast on `LessonCard`, `LessonReleaseLockBadge`, `ClassroomEmptyState`:
  - Normal text ≥ **4.5:1**
  - Large text (≥ 18pt or ≥ 14pt bold) ≥ **3.0:1**
  - UI components ≥ **3.0:1**
- Signed URL TTL: **900 seconds (15 min)** — must be configurable via `MEDIA_SIGNED_URL_TTL_SEC` env, default 900
- Max title length: **200 chars** (Prisma `@db.VarChar(200)`)
- Max bodyMarkdown length: **20000 chars** — validated in DTO
- Media size cap by kind: video 500 MB, audio 100 MB, pdf 50 MB, image 25 MB — enforced server-side before signing URL
- Multi-row writes: `prisma.$transaction([...])` or `prisma.$transaction(async (tx) => ...)`
- External fetch: `signal: AbortSignal.timeout(N)` mandatory

## OWNS (files you may modify)

Listed in "Backend" + "Mobile" sections above. The `community.module.ts` ONE-LINE edit is owned BUT must coordinate with v3-3 (see DO NOT TOUCH).

## DO NOT TOUCH

- **Other in-flight lanes:** L1 zod (`package.json`), L2 async-storage (`package.json`), L3 RNTL infra (test setup), L4 Roman notifications (`src/notifications/**`, `src/checkout/checkout-webhook-handler.service.ts`), L5 Roman mobile (`src/screens/Roman*`), L6 drip-fire-at (`src/packages/**`)
- **v3-3 voice notes** (parallel lane): `src/community/voice/**`, `src/screens/community/CommunityComposerScreen.tsx`, `src/components/community/VoiceNoteComposer.tsx`
- **Existing community modules:** `src/community/posts/**`, `src/community/messages/**`, `src/community/events/**` — DO NOT refactor, only consume
- **prisma/schema.prisma** existing models — only ADD new models, never modify existing

### Coordination on `community.module.ts` (collision file with v3-3)

v3-2 lands first. v3-2 edits `community.module.ts` to add `CommunityClassroomModule` to `imports`. v3-3 will REBASE on v3-2's landed main and add `CommunityVoiceModule` to the same imports array. Builder for v3-2 must:
1. Make the import + imports-array addition ATOMIC in one commit (so v3-3 rebase is a clean 3-way merge)
2. Add the new line at the bottom of the imports array (NOT alphabetical-insert in the middle) — minimizes future rebase conflict surface

## Workflow

1. Clone both repos to `/tmp/gpb-L7` and `/tmp/gpm-L7`
2. Create branches as named
3. Read `COMMUNITY_EXECUTION_PLAN.md` v3-2 section + schema design section
4. Read existing `src/community/posts/community-posts.controller.ts` as the architectural template (controllers + repositories + services + DTOs pattern is established)
5. Backend first: prisma migration → schema → DTO → repository → service → controller → guard → tests
6. Push backend every 2 min (R52)
7. Mobile next: api → hook → components → screens → tests
8. Push mobile every 2 min
9. Run gates (below)
10. Open both PRs

## 🚨 Self-audit gates — RUN ALL BEFORE DECLARING DONE

### Gate 1 — R0 ban scan (each repo)
```bash
git diff main...HEAD | grep -iE 'coming soon|@ts-ignore|@ts-nocheck|\bas any\b|as unknown as|as never as|\bas never\b|\.catch\(\(\)\s*=>\s*(undefined|null|\{\}|void)\)' || echo "CLEAN"
```

### Gate 2 — Build + lint + test (each repo)
Backend:
```bash
npm ci
npx tsc --noEmit
npm run lint
npm test -- --testPathPattern='classroom|community-classroom' --runInBand
npm run test:rls -- --testPathPattern='classroom'
```
Mobile:
```bash
npm ci
npx tsc --noEmit
npm run lint
npm test -- --testPathPattern='[Cc]lassroom|[Ll]esson' --runInBand
```

### Gate 3 — 50-Failures sweep (file:line OR N/A per category)
Focus categories for this lane:
- **Media URL signing** — bucket assertion, workspace binding, TTL enforcement, no shared signing secret across cohorts
- **Release-lock race** — concurrent publishedAt + releaseAt transitions must not double-publish
- **RLS gaps** — every new table has policies; tests prove non-member denial
- **N+1 query** — classroom feed must not loop per-post media fetches
- **Soft-delete blind spot** — `softDeletedAt IS NULL` predicate everywhere
- **Pinned ordering edge case** — when `pinnedOrder` is null + `pinned=true`, sort tie-break must be stable
- **Empty state** — `ClassroomEmptyState` must render real copy + CTA, no spinner-only path

### Gate 4 — UI contrast table (mobile)
Document contrast ratios for `LessonCard`, `LessonReleaseLockBadge`, `ClassroomEmptyState`:
| Element | FG hex | BG hex | Ratio | Pass/Fail (target) |
|---|---|---|---|---|
| LessonCard title | ... | ... | ... | ... (≥ 4.5:1) |

## Audit guarantees (per spec)

- Media asset access MUST check coach workspace AND cohort membership — proven by RLS spec
- Release-locked posts MUST NOT appear in student feed before releaseAt
- Coach cannot publish to a workspace they don't own

## Final report (saved to workspace as `/tmp/gpb-L7/V3_2_FINAL_REPORT.md` + `/tmp/gpm-L7/V3_2_FINAL_REPORT.md`)

- Files modified
- Files created
- Commits authored — `git log --format='%H %an <%ae> %s' main..HEAD`
- Gate 1-4 output
- PR URLs (one backend, one mobile)
- Final HEAD SHA per repo

## Auth

`api_credentials=["github"]` for git operations. Remote URL uses `git-agent-proxy.perplexity.ai`.

## Done criteria

- Backend PR opened on `growth-project-backend`, NOT merged
- Mobile PR opened on `growth-project-mobile`, NOT merged
- All gates pass with output saved
- All commits authored as `Bradley Gleave <bradley@bradleytgpcoaching.com>`
- Reports saved

## Dependencies

- v3-1 community foundation MUST be on main (verify: `grep -r 'CommunityModule' src/community/community.module.ts`)
- L6 #326 does NOT need to land first (different file scope)
- L1-L5 do NOT need to land first (different file scope)

## NOT in scope

- v3-3 voice notes (separate lane)
- v3-4 search + wearable (separate lane)
- Roman-related changes
- Wearables changes
- Existing community refactors
