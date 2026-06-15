PASS_WITH_FINDINGS — P0: 0 · P1: 0 · P2: 3 · P3: 1

# Post-Merge PR #397 Audit — R81 Re-Audit — 2026-06-15

## 1. Verdict

**PASS_WITH_FINDINGS**

PR #397 remains **not clean under R81** on current `main`. The original runtime/security posture is still mostly sound: voice-note upload signing is server-minted and namespaced, the new `community_voice_notes` table has ENABLE + FORCE RLS, write/upload routes are explicitly throttled, response schemas are Zod `.strict()`, telemetry names are registered and emitted, the voice-note authoring flag defaults OFF, MIME/size/duration are server-revalidated before upload signing and before durable create, and presigned URL TTLs are clamped.

However, both original findings are **STILL_PRESENT** on current `main`. The read routes that mint signed download URLs still have no explicit route throttle, and the `community-voice.e2e.spec.ts` suite is still reflection-only rather than a real HTTP integration test. Two additional process findings are also present: the PR #397 squash merge commit does not satisfy the canonical R74 author identity, and the unfixed P2/P3 follow-up work has no open GitHub tracking issue despite R82.

R81 impact: because findings remain, no flag-on / rollout expansion should happen until a follow-up fix PR closes all P2/P3 findings and receives a clean re-audit.

## 2. Scope

- Repo / PR: `BradleyGleavePortfolio/growth-project-backend#397`.
- Target merge audited: `592fc39ebb965c4fbfe995aecbc418433f88f1fe`.
- Merge parent: `b19fee89f6a32b22bc7a5a202e8ee058a7c8679e`.
- Current `main` audited: `fea925a8032f42176fb38a46607f2abe5b8b110e`.
- Merge diff swept: 22 files, +2972/−117.
- Current-main PR397 surface drift checked: `src/community/voice/**`, `test/community/voice/**`, and `test/rls/community-voice-rls.spec.ts` are unchanged since the PR397 merge; only shared files such as `community-events.ts`, `community.module.ts`, `schema.prisma`, `messaging.service.ts`, `jest.config.js`, and the telemetry pin changed later.
- Evidence saved:
  - `/home/user/workspace/audit-work/outputs/POST_MERGE_PR397_GIT_EVIDENCE_2026-06-15.txt`
  - `/home/user/workspace/audit-work/outputs/POST_MERGE_PR397_SOURCE_EVIDENCE_2026-06-15.txt`
  - `/home/user/workspace/audit-work/outputs/POST_MERGE_PR397_DB_EVIDENCE_2026-06-15.txt`
  - `/home/user/workspace/audit-work/outputs/POST_MERGE_PR397_TEST_EVIDENCE_2026-06-15.txt`
  - `/home/user/workspace/audit-work/outputs/POST_MERGE_PR397_LINE_EVIDENCE_2026-06-15.txt`
  - `/home/user/workspace/audit-work/outputs/POST_MERGE_PR397_MAIN_DELTA_EVIDENCE_2026-06-15.txt`
  - `/home/user/workspace/audit-work/outputs/POST_MERGE_PR397_MODULE_EVIDENCE_2026-06-15.txt`
  - `/home/user/workspace/audit-work/outputs/POST_MERGE_PR397_R0_EVIDENCE_2026-06-15.txt`
  - `/home/user/workspace/audit-work/outputs/POST_MERGE_PR397_R82_EVIDENCE_2026-06-15.txt`

## 3. Original-finding status

| Finding | Severity | Status on current `main` | Evidence |
|---|---:|---:|---|
| PR397 P2-1 — Read routes not explicitly throttled despite signed-URL signing-cost amplification | **P2** | **STILL_PRESENT** | `CommunityVoiceController.list` and `getOne` still have `@Get` + guards + roles but no `@Throttle`, while `issueUploadUrl` and `create` do have `@Throttle` (`POST_MERGE_PR397_LINE_EVIDENCE_2026-06-15.txt:1-92`, `:93-103`). `list` still maps every returned row through `noteView`, and `noteView` still calls `createSignedDownload` per row (`POST_MERGE_PR397_LINE_EVIDENCE_2026-06-15.txt:286-295`, `:432-447`). |
| PR397 P3-1 — `community-voice.e2e.spec.ts` is reflection-only, not a real HTTP integration test | **P3** | **STILL_PRESENT** | The current suite still describes itself as a controller-metadata guardrail, reflects routes via `Reflect.getMetadata`, and directly instantiates `CommunityVoiceEnabledGuard`; grep found no `supertest`, `INestApplication`, `app.init`, or HTTP request path in the voice test files (`POST_MERGE_PR397_TEST_EVIDENCE_2026-06-15.txt`, `POST_MERGE_PR397_TEST_DEPTH_EVIDENCE_2026-06-15.txt`). |

## 4. New findings

| ID | Sev | Area | Finding |
|---|---:|---|---|
| N1 | **P2** | R82 / tracking discipline | Unfixed PR397 P2/P3 follow-up work has no open GitHub tracking issue. |
| N2 | **P2** | R74 / merge identity | The PR397 squash merge commit author is not the canonical `Bradley Gleave <bradley@bradleytgpcoaching.com>` identity required by R74. |

### N1 (P2) — Unfixed PR397 follow-up work lacks an R82 tracking issue

**File / evidence:** `POST_MERGE_PR397_R82_EVIDENCE_2026-06-15.txt`

The original audit contains explicit unfixed P2/P3 follow-up work: add a read-route throttle and add/rename the reflection-only `e2e` coverage. R82 requires follow-up / deferred work to have a durable GitHub tracking issue, and specifically instructs re-auditors to flag missing tracking as a new P2.

The open-issue search for PR397 voice-note tracking returned `[]`, so there is no visible open tracking issue for the unfixed read-throttle/test-depth work.

**Recommended fix:** file a `growth-project-backend` tracking issue with labels `R81-backfill`, `tracking`, `community`, `backend`, and `pre-flag-flip`, then reference it from the follow-up fix PR and re-audit.

### N2 (P2) — PR397 merge commit violates canonical R74 author identity

**File / evidence:** `POST_MERGE_PR397_GIT_EVIDENCE_2026-06-15.txt`

The audited merge commit is authored as `BradleyGleavePortfolio <bradleyapple1031@gmail.com>`, while R74 requires every commit to be authored/committed as `Bradley Gleave <bradley@bradleytgpcoaching.com>`. The trailer itself is a human `Co-authored-by: Bradley Gleave <bradley@bradleytgpcoaching.com>` and does not violate the assistant-trailer ban, but it does not repair the commit author identity.

**Recommended fix:** do not rewrite already-shared `main`; instead, document this historical merge-identity defect in the follow-up PR / tracking issue and ensure all future fix commits and merges use the canonical R74 identity before merge completion.

## 5. Required validation points

| Check | Result | Evidence |
|---|---:|---|
| Voice-note upload signing | **PASS** | `issueUploadUrl` validates workspace access, entitlement, size/duration/MIME, then calls `VoiceUploadProvider.createSignedUpload`; the provider builds a server-side object path under `${ownerId}/...` and returns `expires_at` from the clamped TTL (`POST_MERGE_PR397_LINE_EVIDENCE_2026-06-15.txt:104-154`, `:336-408`). |
| RLS on `community_voice_notes` | **PASS** | Migration creates `community_voice_notes`, enables and forces RLS, defines `community_voice_notes_coach_all` with USING + WITH CHECK, and defines member SELECT with `soft_deleted_at IS NULL` plus membership/author constraints (`POST_MERGE_PR397_DB_EVIDENCE_2026-06-15.txt:40-119`). |
| Throttle on upload endpoint | **PASS for upload/write, FAIL for read amplification** | `issueUploadUrl` and `create` both have explicit `@Throttle({ default: { ttl: 60_000, limit: THROTTLER_ROUTE_LIMITS.COMMUNITY_POSTS_PER_MIN } })`; `list` and `getOne` still do not (`POST_MERGE_PR397_LINE_EVIDENCE_2026-06-15.txt:1-92`). |
| Zod strict response schemas | **PASS** | `VoiceUploadTargetSchema`, `VoiceNoteViewSchema`, `VoiceNoteResponseSchema`, and `VoiceNoteFeedResponseSchema` all terminate with `.strict()` (`POST_MERGE_PR397_LINE_EVIDENCE_2026-06-15.txt:236-279`). |
| Telemetry register + emit | **PASS** | `COMMUNITY_TELEMETRY_EVENTS` contains `voiceUploadIssued`, `voiceNotePublished`, and `voicePublishFailed`; service emit sites exist in `issueUploadUrl`, `create`, and the realtime-ping catch, and the pin spec includes those event names (`POST_MERGE_PR397_TEST_EVIDENCE_2026-06-15.txt`). |
| Flag-off pin | **PASS** | `resolveVoiceNotesFlag()` returns true only for literal `'true'`; the write routes carry `CommunityVoiceEnabledGuard`; the reflection guardrail tests both route metadata and flag-OFF typed 503 behavior (`POST_MERGE_PR397_LINE_EVIDENCE_2026-06-15.txt:50-103`, `POST_MERGE_PR397_TEST_EVIDENCE_2026-06-15.txt`). |
| Media MIME validation | **PASS for community voice notes** | DTOs and service use the exact four-value allowlist `audio/mp4`, `audio/aac`, `audio/webm`, `audio/wav`; service rechecks MIME before storage interaction and rejects outside values with `community.voice.mime_rejected` (`POST_MERGE_PR397_LINE_EVIDENCE_2026-06-15.txt:448-566`, `:104-154`). |
| Presigned URL expiry | **PASS** | `VoiceUploadProvider.ttlSeconds()` defaults to 600 seconds and clamps env override to `[60, 86400]`; `createSignedUpload` returns `expires_at`, and `createSignedDownload` uses that TTL unless explicitly overridden (`POST_MERGE_PR397_LINE_EVIDENCE_2026-06-15.txt:336-408`, `:409-431`). |

## 6. R0 / rules compliance summary

| Rule | Status | Evidence |
|---|---:|---|
| R0 banned patterns in PR397 changed prod files | **PASS** | Grep over current main versions of the PR397 changed prod files found no `Coming soon`, `@ts-ignore`, `.catch(()=>undefined)`, `as unknown as`, or `as any`; merge-diff grep also found no introduced prod hit (`POST_MERGE_PR397_R0_EVIDENCE_2026-06-15.txt`). |
| R0 assistant/co-author trailer ban | **PASS** | The merge commit contains a human `Co-authored-by: Bradley Gleave <bradley@bradleytgpcoaching.com>` trailer and no assistant-attribution trailer (`POST_MERGE_PR397_R0_EVIDENCE_2026-06-15.txt`). |
| R72 exhaustive audit | **PASS** | Merge inventory, current main file state, original findings, validation points, and current diffs across the PR397 surface were swept. |
| R74 identity | **FAIL / NEW P2** | Merge author is `BradleyGleavePortfolio <bradleyapple1031@gmail.com>` rather than canonical R74 identity (`POST_MERGE_PR397_GIT_EVIDENCE_2026-06-15.txt`). |
| R77 read-only | **PASS** | Inspection used detached `/tmp/postmerge-pr397-merge` and `/tmp/postmerge-pr397-main` worktrees; no source edits were made there. |
| R79 pins | **PASS on available evidence, not rerun** | The PR397 CI rollup was green for `build-and-test`, `rls-floor-guard`, `rls-live-tests`, and `mwb-3-live-tests`; local test execution was not rerun during this read-only post-merge audit (`POST_MERGE_PR397_GITHUB_EVIDENCE_2026-06-15.txt`). |
| R81 gate | **FAIL historically / still not clean** | PR397 merged with P2/P3 findings open. Current `main` still has P2/P3 findings, so the post-merge state is not clean. |
| R82 tracking | **FAIL / NEW P2** | No open tracking issue was found for the unfixed PR397 follow-up work (`POST_MERGE_PR397_R82_EVIDENCE_2026-06-15.txt`). |

## 7. Hectacorn bar

The core voice-note backend design remains shippable behind a default-OFF flag from a runtime safety perspective: server-authoritative validation, RLS defense-in-depth, owner-namespaced storage keys, strict response schemas, and registered+emitted telemetry are intact. Stripe/Linear/Apple would still block broader rollout on the read-route signing-cost throttle gap and the lack of true HTTP request-path coverage, and R81/R82 would block the process state until those items are fixed or durably tracked and then re-audited clean.

## 8. Recommended follow-up

1. **P2:** Add explicit `@Throttle` metadata to `GET /community/workspaces/:workspaceId/voice-notes` and `GET /community/voice-notes/:voiceNoteId`, or otherwise cap/memoize signed-download minting so a single authenticated caller cannot fan out to thousands of signing operations per minute.
2. **P3:** Add a thin `supertest`/Nest HTTP integration test for the voice-note request path, or rename `community-voice.e2e.spec.ts` to remove the false e2e signal and add a true e2e test in the follow-up.
3. **P2:** File the required R82 tracking issue for any work not fixed immediately, with owner, labels, and references.
4. **P2:** Record the R74 identity defect for this historical merge and enforce canonical Bradley identity on the follow-up PR commits and merge.

## 9. Source references

- Repo: https://github.com/BradleyGleavePortfolio/growth-project-backend
- PR #397: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/397
- Merge commit: https://github.com/BradleyGleavePortfolio/growth-project-backend/commit/592fc39ebb965c4fbfe995aecbc418433f88f1fe
- Current main audited: https://github.com/BradleyGleavePortfolio/growth-project-backend/commit/fea925a8032f42176fb38a46607f2abe5b8b110e
- Controller current lines: https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/fea925a8032f42176fb38a46607f2abe5b8b110e/src/community/voice/community-voice.controller.ts#L52-L135
- Service current lines: https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/fea925a8032f42176fb38a46607f2abe5b8b110e/src/community/voice/community-voice.service.ts#L120-L165
- Provider current lines: https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/fea925a8032f42176fb38a46607f2abe5b8b110e/src/community/voice/voice-upload.provider.ts#L93-L261
- DTO current lines: https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/fea925a8032f42176fb38a46607f2abe5b8b110e/src/community/voice/community-voice.dto.ts#L34-L186
- Migration current lines: https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/fea925a8032f42176fb38a46607f2abe5b8b110e/prisma/migrations/20261217000000_community_voice_notes/migration.sql#L41-L119
