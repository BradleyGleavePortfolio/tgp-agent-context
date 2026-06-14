# v3-3 Builder Brief — community voice notes

**Codified:** 2026-06-13 by Bradley Gleave. Follows `BUILDER_BRIEF_TEMPLATE_V2.md`.
**Spec source:** `COMMUNITY_EXECUTION_PLAN.md` PR v3-3 section.
**Depends on:** v3-2 classroom posts (must be merged to main first — see Dependencies section).

## Repo + branch

- Backend repo: `BradleyGleavePortfolio/growth-project-backend`
- Mobile repo: `BradleyGleavePortfolio/growth-project-mobile`
- Branch (both): `feature/community-v3-voice-notes`
- Base: `main` (fetch fresh, AFTER v3-2 has merged)
- Final action: open NEW PR on each repo, do NOT merge

## Bradley R0 LAW (operator directive verbatim, 2026-06-13)

*"every single PR should say bradley@bradleytgpcoaching.com - no AI names - just bradley + my email"*

EVERY commit uses inline `-c` flags. NEVER `git config --global`:
```bash
git -c user.name='Bradley Gleave' -c user.email='bradley@bradleytgpcoaching.com' commit -m "..."
```

- NO co-author trailers, NO `Generated-By`, NO assistant attribution
- NO "Coming soon" strings (case-insensitive) — including regex like `/coming soon/i`
- NO `@ts-ignore`, `@ts-nocheck`, `as any`, `as unknown as X`, `as never as X`, bare `as never`
- NO `.catch(()=>undefined)`, `.catch(()=>null)`, `.catch(()=>{})`, empty `catch(e){}`, console-only swallows
- `@ts-expect-error` with one-line justification IS allowed
- Push every 2 minutes minimum (R52)

## Mandatory training docs

- `/tmp/tgp-agent-context/quality-references/50_FAILURES_OF_AI_GENERATED_CODE.md`
- `/tmp/tgp-agent-context/quality-references/MOBILE_APP_DESIGN_INTELLIGENCE.md`
- `/tmp/tgp-agent-context/quality-references/BUILDER_BRIEF_TEMPLATE_V2.md`
- `/tmp/tgp-agent-context/COMMUNITY_EXECUTION_PLAN.md` PR v3-3 section + schema design

## Plan doc + technical scope

### Feature in plain terms

Coaches and clients send **voice notes** inside community DMs and channels. Mobile composer captures audio (record → review → send). Backend stores audio asset, returns signed URL, fans out via existing realtime ping. Spec explicitly forbids the "forbidden double-cast" pattern present in messaging.service.ts (per audit history).

### Backend (~700 LOC of the ~1200 total)

Files OWNED:

- `src/community/voice/community-voice.module.ts`
- `src/community/voice/community-voice.controller.ts`
- `src/community/voice/community-voice.service.ts`
- `src/community/voice/community-voice.repository.ts`
- `src/community/voice/community-voice.dto.ts`
- `src/community/voice/community-voice-flag.guard.ts`
- `src/community/voice/voice-upload.provider.ts` (signed URL issuer — extracted, typed, no `as any`)
- `src/community/voice/__tests__/community-voice.service.spec.ts`
- `src/community/voice/__tests__/voice-upload-bucket-assertion.spec.ts`
- `src/community/voice/__tests__/voice-limits.spec.ts`
- `test/community/voice/community-voice.e2e.spec.ts`
- `test/rls/community-voice-rls.spec.ts`
- `prisma/migrations/{TIMESTAMP_AFTER_V3_2}_community_voice_notes/migration.sql` (NEW — timestamp must be AFTER v3-2's classroom migration)
- `prisma/schema.prisma` (additive: `CommunityVoiceNote` model)
- `src/community/community.module.ts` (ONE LINE: add `CommunityVoiceModule` to imports — rebase from v3-2's landed state)
- `src/messaging/messaging.service.ts` (TYPED EXTRACTION ONLY — extract the upload helper into `voice-upload.provider.ts`, REMOVE any `as any` / `as unknown as X` that was tolerated in messaging.service)

### Mobile (~500 LOC of the ~1200 total)

Files OWNED:

- `src/screens/community/CommunityComposerScreen.tsx`
- `src/components/community/VoiceNoteComposer.tsx`
- `src/components/community/VoiceNoteRecordButton.tsx`
- `src/components/community/VoiceNoteWaveform.tsx`
- `src/components/community/VoiceNotePlayer.tsx`
- `src/components/community/VoicePrivacyCopy.tsx` (audit requirement: explicit copy saying who can listen)
- `src/hooks/community/useVoiceRecorder.ts`
- `src/hooks/community/useVoiceUpload.ts`
- `src/api/community/voice.api.ts`
- `__tests__/components/VoiceNoteComposer.spec.tsx`
- `__tests__/components/VoicePrivacyCopy.spec.tsx`
- `__tests__/hooks/useVoiceRecorder.spec.ts`
- `__tests__/hooks/useVoiceUpload.spec.ts`

### Prisma additions

```prisma
model CommunityVoiceNote {
  id              String   @id @default(cuid())
  workspaceId     String
  cohortId        String?
  conversationId  String?  // null = channel; non-null = DM thread
  authorId        String
  storageKey      String
  durationMs      Int
  bytes           BigInt
  mimeType        String   // 'audio/mp4' | 'audio/aac' | 'audio/webm' | 'audio/wav'
  waveformPeaks   Bytes?   // optional pre-computed waveform for player UI
  createdAt       DateTime @default(now())
  softDeletedAt   DateTime?

  @@index([workspaceId, cohortId, createdAt])
  @@index([workspaceId, conversationId, createdAt])
  @@index([authorId, createdAt])
}
```

RLS in the same migration. Coach can read/write own workspace voice notes. Student can read where they have membership AND (cohort match OR direct conversation participant).

### Tests required (per spec)

1. **Signed upload URL** — issued with `{workspaceId, authorId, conversationId|cohortId, mimeType}` binding; TTL configurable
2. **Bucket assertion** — uploads MUST land in expected bucket name; integration test asserts the bucket
3. **Duration limit** — server rejects `durationMs > MAX_VOICE_DURATION_MS` (default 300000ms / 5 min)
4. **Size limit** — server rejects `bytes > MAX_VOICE_BYTES` (default 25_000_000 / 25MB)
5. **MIME limit** — only the 4 allowed mime types pass
6. **Entitlement gate** — if `FEATURE_COMMUNITY_VOICE_NOTES_REQUIRE_ENTITLEMENT=true`, non-entitled clients get 403
7. **Realtime ping** — after `POST /voice-notes`, subscriber on `community:{workspaceId}:{cohortId}` receives ping within 1s
8. **Forbidden cast scan** — repo-wide grep for `as any`/`as unknown as` in `messaging.service.ts` returns 0 hits after extraction
9. **RLS spec** — non-participant cannot read; non-member of cohort cannot read; coach of different workspace cannot read

### Feature flags

- Backend: `FEATURE_COMMUNITY_VOICE_NOTES` (default `false`)
- Backend optional: `FEATURE_COMMUNITY_VOICE_NOTES_REQUIRE_ENTITLEMENT` (default `false`)
- Mobile: `EXPO_PUBLIC_FF_COMMUNITY_VOICE_NOTES` (default `false`)

### Pre-computed thresholds

- WCAG AA contrast on all voice components:
  - Normal text ≥ **4.5:1**
  - Large text ≥ **3.0:1**
  - Record/stop button color vs background ≥ **3.0:1**
- Signed URL TTL: **600 seconds (10 min)** — `VOICE_SIGNED_URL_TTL_SEC` env, default 600
- Max voice duration: **300000 ms (5 min)**
- Max voice bytes: **25 MB**
- Allowed mime types: `audio/mp4`, `audio/aac`, `audio/webm`, `audio/wav`
- Multi-row writes: `prisma.$transaction([...])`
- External fetch: `signal: AbortSignal.timeout(N)`
- Realtime publish: must complete within 1s of voice note row insert; if publish fails, row stays — telemetry event emitted, no user-facing error

## OWNS

Listed in Backend + Mobile sections. `community.module.ts` edit must REBASE from v3-2's landed state.

## DO NOT TOUCH

- **v3-2 classroom files:** `src/community/classroom/**`, classroom-related mobile screens/components
- **L1 zod, L2 async-storage, L3 RNTL, L4 Roman backend, L5 Roman mobile, L6 drip-fire-at** — see those briefs for owned files
- **Existing community modules** beyond `messaging.service.ts` typed extraction
- **prisma/schema.prisma** existing models — only ADD `CommunityVoiceNote`
- **`src/community/posts/**`, `src/community/dms/**`, `src/community/events/**`** — do not refactor, only consume

### `community.module.ts` rebase protocol

v3-3 starts AFTER v3-2 has merged to main. Builder:
1. Fetch `main` after v3-2 lands — verify `CommunityClassroomModule` is in imports
2. Add `CommunityVoiceModule` to imports at the bottom of the array (NOT mid-array insert)
3. Single commit for the module registration; do not interleave with feature commits

## Workflow

1. Verify v3-2 is merged before starting (`git log main --oneline | grep "v3-2"` should show landed commit)
2. Clone both repos to `/tmp/gpb-L8` and `/tmp/gpm-L8`
3. Create branches as named
4. Read existing `src/messaging/messaging.service.ts` BEFORE extraction — document every `as any` site you'll eliminate
5. Backend: migration → schema → extracted provider → service → controller → guard → tests
6. Mobile: hooks → components → screen → tests
7. Push every 2 min (R52)
8. Run gates (below)
9. Open both PRs

## 🚨 Self-audit gates — RUN ALL BEFORE DECLARING DONE

### Gate 1 — R0 ban scan
```bash
git diff main...HEAD | grep -iE 'coming soon|@ts-ignore|@ts-nocheck|\bas any\b|as unknown as|as never as|\bas never\b|\.catch\(\(\)\s*=>\s*(undefined|null|\{\}|void)\)' || echo "CLEAN"
```
ALSO: full-file scan of post-extraction `messaging.service.ts`:
```bash
grep -nE '\bas any\b|as unknown as|as never as|\bas never\b' src/messaging/messaging.service.ts || echo "MESSAGING CLEAN"
```
If `messaging.service.ts` still has any of those, the extraction is incomplete — fix before declaring done.

### Gate 2 — Build + lint + test
Backend:
```bash
npm ci
npx tsc --noEmit
npm run lint
npm test -- --testPathPattern='voice|community-voice|messaging' --runInBand
npm run test:rls -- --testPathPattern='voice'
```
Mobile:
```bash
npm ci
npx tsc --noEmit
npm run lint
npm test -- --testPathPattern='[Vv]oice' --runInBand
```

### Gate 3 — 50-Failures sweep (file:line OR N/A per category)
Focus categories:
- **Signed URL bucket binding** — bucket name MUST be asserted server-side, not client-trusted
- **TTL enforcement** — expired URLs reject; clock-skew tolerance documented
- **MIME spoofing** — server MUST sniff magic bytes OR reject based on declared mime list
- **Duration spoofing** — server MUST not trust client-declared durationMs alone; reject if upload exceeds time-based size budget
- **Race on upload + insert** — voice note row only inserted after upload confirmation
- **Realtime publish failure** — must NOT block insert; telemetry event captures failure
- **Privacy copy presence** — `VoicePrivacyCopy` MUST render real audience description, not placeholder
- **Recorder permissions denial** — mobile must render a real recovery state if mic permission denied (no spinner-only)

### Gate 4 — UI contrast table
Document ratios for `VoiceNoteRecordButton`, `VoiceNoteWaveform`, `VoiceNotePlayer`, `VoicePrivacyCopy`.

## Audit guarantees (per spec)

- ZERO copied forbidden double-cast from `messaging.service.ts` — extraction MUST be cleanly typed
- Audio privacy copy MUST tell user who can listen (cohort members? coach only? everyone in workspace?)
- No voice note durable-stored before upload confirmed

## Final report (`/tmp/gpb-L8/V3_3_FINAL_REPORT.md` + `/tmp/gpm-L8/V3_3_FINAL_REPORT.md`)

- Files modified
- Files created
- Commits — `git log --format='%H %an <%ae> %s' main..HEAD`
- Gate 1-4 output
- PR URLs
- Final HEAD SHA per repo
- BEFORE/AFTER `messaging.service.ts` cast count (must drop to 0 forbidden casts)

## Auth

`api_credentials=["github"]`. Remote uses `git-agent-proxy.perplexity.ai`.

## Done criteria

- Backend + mobile PRs opened, NOT merged
- All gates pass
- `messaging.service.ts` post-extraction has 0 forbidden casts
- All commits authored as `Bradley Gleave <bradley@bradleytgpcoaching.com>`
- Reports saved

## Dependencies

- **v3-2 classroom MUST be merged to main first** — `community.module.ts` collision avoidance
- v3-1 foundation already on main
- L1-L6 do not need to land first

## NOT in scope

- v3-2 classroom (separate lane)
- v3-4 search + wearable (separate lane)
- Refactor of existing community modules beyond `messaging.service.ts` typed extraction
