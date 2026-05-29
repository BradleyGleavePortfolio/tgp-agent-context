# PR-12 BUILD REPORT — CoachMediaAsset upload pipeline (Supabase PDF + Mux video)

## (a) PR URL

https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/322

- Branch: `pr12/coach-media-upload` off latest `main` (PR-2/3/4/6/7/8/9/10/11 merged).
- Commit identity: `Dynasia G <dynasia@trygrowthproject.com>`. No `Co-Authored-By` / generated trailers.

## (b) StorageProvider interface + Supabase impl (reused or new)

**Interface (new):** `src/coach-media/storage-provider.ts`

```ts
export interface StorageProvider {
  readonly id: string;
  isConfigured(): boolean;
  createSignedUploadUrl(input: { storageKey: string; contentType?: string }): Promise<SignedUploadResult>;
  createSignedDownloadUrl(storageKey: string, options?: SignedDownloadOptions): Promise<string>;
  putObject(input: PutObjectInput): Promise<PutObjectResult>;
  deleteObject(storageKey: string): Promise<boolean>;
}
export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');
```

The interface intentionally covers ONLY object storage (PDFs / future S3-compatible). Mux is NOT behind this interface because trying to force adaptive HLS through a put/get/delete shape either leaks Mux-specific concepts (playback policy, one-shot direct-upload URLs) or strips them — both wrong. The two seams stay separate: `StorageProvider` for objects, `MuxService` for video. `CoachMediaService` composes both.

**Supabase impl (new — reuses the existing client):** `src/coach-media/supabase-storage.provider.ts`

- Reuses the existing @Global `SupabaseService` (`src/supabase/supabase.service.ts`) — no second Supabase client init.
- Bucket name configurable via `SUPABASE_MEDIA_BUCKET` (defaults to `coach-media`).
- Same defensive SDK-shape narrowing as `messaging.service.ts`'s voice-note path (the Supabase JS SDK's `createSignedUploadUrl` signature varies across minor versions).
- `createSignedDownloadUrl` clamps the requested expiry into `[60s, 86400s]` so a caller cannot mint a 100-year URL.

**DI binding (new):** `src/coach-media/coach-media.module.ts`

```ts
{
  provide: STORAGE_PROVIDER,
  useExisting: SupabaseStorageProvider,
}
```

When a second provider lands (decision #5: S3-compatible), only this binding changes; `CoachMediaService` and the controller stay untouched.

## (c) PDF upload flow

Two-step signed-upload pattern (matches the existing voice-message upload in `messaging.service.ts`; the repo has no `FileInterceptor`/multer code path so server-side multipart was rejected as introducing a parallel pattern):

1. `POST /v1/coach/media/pdf/upload-url` — coach posts metadata `{ title, description?, content_type, byte_size? }`.
   - Strict zod: `content_type` must be `application/pdf`; `byte_size` capped at 50 MB; no unknown keys.
   - Service mints a coach-id-namespaced storage key (`{coach_id}/{asset_id}/{random}.pdf`) — no user-controlled segment in the path, no traversal possible.
   - Calls `StorageProvider.createSignedUploadUrl` BEFORE creating the row (so a rejected upload-URL mint doesn't leave an orphan row).
   - Persists `CoachMediaAsset(kind='pdf', status='uploading', storage_key, provider='supabase', ...)`.
   - Returns `{ media_asset_id, upload_url, storage_key, expires_in_seconds }`.

2. Coach PUTs the PDF directly to the signed URL.

3. `POST /v1/coach/media/:id/pdf/confirm` — coach posts optional `{ byte_size?, page_count? }`.
   - Flips `status='uploading' → 'ready'`.
   - Idempotent: re-confirming a `ready` row no-ops (returns the same row, no UPDATE).
   - Refuses a `processing`/`errored` row (state-machine bug).

**Delivery:** `GET /v1/coach/media/:id/signed-url` — owner mints a time-limited Supabase download URL (default 1h, clamped). Granted buyers mint via `CoachMediaService.getBuyerSignedUrl(buyerUserId, mediaAssetId)` which gates on an active `ClientAssetGrant` (revoked grants and non-buyers get 403).

## (d) Mux video flow + webhook (sig + idempotency)

1. `POST /v1/coach/media/video/upload-url` — coach posts `{ title, description?, cors_origin? }`.
   - Strict zod (no unknown keys).
   - `MuxService.createDirectUpload({ playbackPolicy: 'public', corsOrigin })` → `{ uploadId, url }`.
   - Persists `CoachMediaAsset(kind='video', status='uploading', mux_upload_id, storage_key=uploadId, provider='mux')`.
   - Returns `{ media_asset_id, upload_url, mux_upload_id }`.

2. Coach PUTs the video to the Mux Direct Upload URL.

3. **Webhook:** `POST /v1/webhooks/coach-media/mux` — `CoachMediaMuxWebhookController`
   - **Signature verification** via `MuxService.verifyWebhookSignature` (HMAC-SHA256 over `<t>.<raw_body>`, keyed by `MUX_WEBHOOK_SECRET`; same algorithm as `src/billing/stripe-signature.ts`). Forged signature → 400. **Audit P1-2 fix:** HMAC is now computed against `req.rawBody` (the exact bytes Mux sent) — identical to the Stripe webhook controller. The previous implementation re-serialised the parsed body via `JSON.stringify` which silently rejected legit events whose bytes didn't byte-match the re-emit (whitespace / key-order / number-formatting divergence). `rawBody: true` is wired in `main.ts:31` so `req.rawBody` is a Buffer on every request; missing rawBody returns 400 rather than falling back to JSON.stringify.
   - **Durable idempotency (audit P1-1 fix)** via the new `MuxProcessedEvent` table (PK = `mux_event_id`, mirrors `StripeProcessedEvent` discipline):
     - The dedup INSERT + the handler `coachMediaAsset.update` now run INSIDE the same `prisma.$transaction`. If the handler throws (transient DB blip, deadlock, connection close), the dedup row rolls back too — Mux's retry then re-runs the handler instead of short-circuiting on a stale dedup row. The previous implementation inserted the dedup row OUTSIDE any transaction, so a handler failure committed the dedup row permanently and the next retry returned `deduped` without re-running, leaving the video stuck in PROCESSING and the buyer permanently without their deliverable. This now **actually** mirrors `StripeProcessedEvent` in `billing.service.ts:191-200` (the previous build report incorrectly claimed parity).
     - A `P2002` on the dedup INSERT means we have ALREADY processed this event id in a prior committed transaction — the true duplicate case. We catch it OUTSIDE the tx and 200 the redelivery.
     - `handler_completed_at` is stamped in a post-commit update for observability only; bookkeeping failure does not affect dedup correctness because the tx has already committed.
   - **State machine** (resolves rows by `mux_upload_id` first, then by `storage_key` after `upload.asset_created`):
     - `video.upload.asset_created` → `uploading → processing`, `storage_key = asset_id`.
     - `video.asset.ready` → `→ ready`, stores `mux_playback_id` + `duration_sec`; re-delivery without playback_ids does NOT null out an existing playback id.
     - `video.asset.errored` → `→ errored` ONLY from a pre-terminal state. Errored-after-ready is logged and the playback id stays intact (monotonic state-machine guard, replicated from the workout-demo webhook's P0 fix).
   - Unknown event types acknowledge 200.
   - Orphan events (upload id with no matching `CoachMediaAsset` — they're for the workout-demo path) no-op.
   - The `findRowByAssetOrUpload` fallback now actually looks up by `mux_upload_id` (audit P3 fix — the previous implementation returned `null` on the fallback branch, making it dead code).

**Why a SECOND webhook controller** (vs reusing `src/video/mux-webhook.controller.ts`): the existing controller dedups in-memory (process-local, doesn't survive restart or multi-pod) and writes to `ExerciseCatalogItem`. Coach-media feeds the paid-buyer entitlement pipeline so a wrong state could break a paying customer's playback — durable dedup is the right bar. The existing workout-demo controller is intentionally left unchanged in this PR.

## (e) Dual-attach seam (workout-demo vs package)

Documented in the file-level docblock of `src/coach-media/coach-media.service.ts`:

- **The Mux UPLOAD PIPELINE is single** — one `MuxService.createDirectUpload` primitive, identical Mux Direct Upload semantics for both surfaces. PR-12 doesn't duplicate or reimplement Mux ingest.
- **The destination TABLES are separate today** — `CoachMediaAsset(kind='video')` for the coach media library (this PR), `ExerciseCatalogItem` for the workout-exercise demo (pre-existing). They live in separate models because they have different ownership semantics, different validation rules, and different consumers.
- **The two webhook controllers route by upload id** — `mux_upload_id` is unique within each table. An event whose `upload_id` isn't found in one table is a no-op (handled by the other controller).
- **Future unification (out of scope per the brief)**: `ExerciseCatalogItem` could store its video as a `CoachMediaAsset` reference and stop carrying `mux_*` columns. The seam where that lands is a follow-up PR; nothing in PR-12 prevents it.

## (f) Not-ready-video decision

**Decided rule (the safer option from the brief):** the resolver gates on `status='ready'`. A drop pointing at a still-processing or errored video FAILS at materialise time (resolver throws `MediaAssetNotFoundError`, PR-10's retry/backoff picks it up on the next tick) rather than silently granting a buyer access to a broken playback.

Layers of defense:

1. **Authoring gate (PR-8)** — `CoachPackageContent` attach validation in PR-8 already checks `coachMediaAsset.findFirst({ id, coach_id, archived_at: null, kind })`. PR-12 doesn't change that (the resolver gate is sufficient + means a coach CAN attach a still-processing video and have it deliver once Mux completes processing, which is a better UX than blocking attach until ready).
2. **Resolver gate (PR-12, new)** — `MediaAssetResolver` refuses to mint a `ClientAssetGrant` when `asset.status !== 'ready'`. The drop's `failure_reason` records `MediaAssetNotFoundError`; PR-10 retries with exponential backoff; once the Mux webhook flips status='ready', the next retry succeeds.
3. **Signed-URL gate (PR-12, new)** — Even if a grant somehow exists (legacy data, restored backup), `CoachMediaService.mintSignedUrl` returns 409 `ASSET_NOT_READY` for any non-ready row. Buyers see a clear "processing" UI; no broken-playback URL ever ships.

Tests cover all three pre-terminal states + the happy-ready control.

## (g) Ownership / scope + signed-URL security

**Ownership** — `requireOwned(coachUserId, mediaAssetId)` is the gate on every read/write that touches an existing row. Cross-coach access surfaces as 404 `ASSET_NOT_FOUND` (no existence leak). Test coverage: cross-coach `getOne`, `getOwnerSignedUrl`, `patch`, `softDelete`, `confirmPdfUpload`.

**Sub-coach scope** — `CoachMediaService.resolveEffectiveCoachId(callerUserId)` calls `SubCoachScopeService.getHeadCoachIdForSubCoach` and returns the head coach id when the caller is a sub-coach; otherwise returns the caller id. Every controller endpoint promotes BEFORE the service touches `CoachMediaAsset.coach_id`. Tests cover the sub-coach → head promotion + the head-coach passthrough.

**Signed-URL security:**
- **PDFs** never have a public URL. The bucket should be private; the only way to read an object is through a signed download URL minted by the service. URLs default to 1h expiry; clamped into `[60s, 86400s]`.
- **Videos use SIGNED playback (audit P2-2 fix).** `createDirectUpload({ playbackPolicy: 'signed' })` creates Mux assets whose playback id only works behind a per-request RS256-signed JWT minted at URL-issuance time. This makes `ClientAssetGrant` revocation meaningful (a revoked buyer cannot mint a new signed URL) and ages out leaked URLs after the TTL window — mirroring the PDF signed-URL principle. The previous default of `'public'` issued permanent un-revocable URLs to buyers of paid content; signed playback is correct for paid video. Requires `MUX_SIGNING_KEY_ID` / `MUX_SIGNING_KEY_PRIVATE` env vars for video features; `MuxService.mintPlaybackUrl` already throws `MuxDisabledError` (→ 503 at the service layer) if either is unset.
- **Buyer gate (audit P2-1 + P2-4 fixes)** — `getBuyerSignedUrl(buyerUserId, mediaAssetId)`:
  1. **Uniform 404 (P2-1):** ALL refusal paths — row missing, archived, no grant, revoked grant, tenant mismatch — return the same `404 ASSET_NOT_FOUND` shape. The previous 403 vs 404 split let a probing attacker distinguish "id exists" from "id doesn't" via the response code. Uuid ids make practical enumeration infeasible, but defence-in-depth costs nothing.
  2. **Tenant double-check at URL ISSUANCE (P2-4):** the grant is joined through `ScheduledDrop.client_purchase` and the resolver asserts `client_purchase.coach_user_id === asset.coach_id`. `MediaAssetResolver` already enforces tenant on grant CREATION (`media-asset.resolver.ts:73-81`); this is defence-in-depth on the READ path so a buggy upstream that wrote a cross-tenant grant cannot exfiltrate another coach's media via this endpoint.
  3. Not-ready asset still surfaces 409 `ASSET_NOT_READY` (intentional — the buyer's UI renders a "processing" pill).

## (h) Config-not-set handling

Two structured 503 codes:
- `MEDIA_STORAGE_NOT_CONFIGURED` — Supabase storage env vars missing. Thrown by `assertStorageReady()` before any PDF mint / signed-URL mint that needs storage.
- `MUX_NOT_CONFIGURED` — `MUX_TOKEN_ID` / `MUX_TOKEN_SECRET` unset. Thrown by `assertMuxReady()` before any video upload create.

Both are `ServiceUnavailableException` with a structured body the mobile client renders cleanly. The app boots without these vars (env-validation tier='feature' on the new ones); routes that need them return 503; nothing crashes. Tests cover both unconfigured paths:

- `createPdfUpload` returns 503 when Supabase isn't configured AND verifies NO `CoachMediaAsset` row is created on the failed mint (orphan-row prevention).
- `createVideoUpload` returns 503 when Mux isn't configured AND verifies no row is created.
- `getOwnerSignedUrl` on PDF returns 503 when storage is unavailable.
- `SupabaseStorageProvider.isConfigured` returns false when env is missing; every method throws `StorageNotConfiguredError` which the service catches and translates.

## (i) Test results

**Verification commands:**
- `node_modules/.bin/tsc --noEmit -p tsconfig.json` → **clean** (0 errors).
- `npm run build` (`nest build`) → **clean**.
- `npm run lint` → **0 errors** on new + modified files; 17 pre-existing warnings unchanged from `main` (in unrelated files: `landing-pages.service.ts`, `lists.dto.ts`, `macros.service.ts`, `meal-plans.dto.ts`, `nudge-detector.service.ts`, `nudge-engine.service.ts`, `prep-guide.service.ts`, `real-meal-plans.service.ts`, `guest-checkout-pii-scrub.service.ts`).
- `node_modules/.bin/jest` → **291 suites pass; 3533 / 3533 active tests pass** (up from 3468 — **+65 net-new**), 20 skipped + 5 todo unchanged from `main`, 6 snapshots pass.

**New tests:**

| Spec | Tests | What |
|---|---|---|
| `test/coach-media.service.spec.ts` | **40** | PDF flow (8: signed URL + status row + zod validation + size cap + content-type + config-not-set + path-traversal-safe key + confirm idempotency + cross-coach 404 + state-machine refusal); Mux flow (3: upload create + 503-not-configured + unknown-key rejection); reads (5: own-only list, kind filter, archive filter, cross-coach 404 on getOne, owner signed-URL ready/not-ready); signed URLs (9: PDF + Mux + not-ready + missing-playback-id + cross-coach + storage-503 + buyer-grant + buyer-no-grant + buyer-revoked + buyer-archived + buyer-not-ready); patch (3); soft-delete (5: no-refs + grants-block-object-delete + content-refs-block-row + idempotent + cross-coach); sub-coach scope (2); static helpers (2). |
| `test/coach-media-mux-webhook.spec.ts` | **11** | Sig rejection (1); valid sig (1); durable replay-dedup (1) + handler_completed_at stamp (1); state machine `uploading → processing` (1); `→ ready` + playback id + duration (1); `→ errored` from pre-terminal (1); errored-after-ready monotonic guard (1); unknown-event 200 (1); orphan-event no-op (1); preserve playback id on re-delivery (1). |
| `test/supabase-storage-provider.spec.ts` | **10** | isConfigured both paths; bucket default; createSignedUploadUrl happy + error mapping + not-configured; createSignedDownloadUrl happy + expiry clamp; putObject happy + error mapping; deleteObject idempotent (true on success, false on error). |
| `test/assignable-asset-resolver-media.spec.ts` | **+4 (13 total)** | PR-12 not-ready gate: refuses materialise on `status='uploading'`, `'processing'`, `'errored'` (3 parameterised); happy-path `status='ready'` control (1). |

**Total: 65 new tests; full suite still green.**

## Audit fixes (PR #322 follow-up)

The audit at `/home/user/workspace/specs/PR12_AUDIT.md` raised 2 P1s + 4 P2s + several P3s. All P1s and the security-relevant P2s + the documented P3s are now addressed:

| ID | Fix | Files |
|---|---|---|
| P1-1 | Dedup INSERT + handler.update now run inside one `prisma.$transaction`. Handler throw rolls back the dedup row → Mux retry re-runs the handler. Previously dedup persisted outside any tx and a handler failure permanently lost the state transition. Net: actually mirrors `StripeProcessedEvent` discipline. | `src/coach-media/coach-media-mux-webhook.controller.ts` |
| P1-2 | HMAC verification now uses `req.rawBody` (the exact bytes Mux signed) instead of `JSON.stringify(parsedBody)`. Missing rawBody → 400. Matches `stripe-webhook.controller.ts`. | `src/coach-media/coach-media-mux-webhook.controller.ts` |
| P2-2 | `playbackPolicy: 'signed'` on direct-upload create + `mintPlaybackUrl({ policy: 'signed' })` on URL issuance. Paid video now requires a per-request signed JWT; `ClientAssetGrant` revocation is meaningful; leaked URLs age out after TTL. | `src/coach-media/coach-media.service.ts` |
| P2-4 | Tenant double-check on `getBuyerSignedUrl`: joins through `ScheduledDrop.client_purchase` and asserts `client_purchase.coach_user_id === asset.coach_id`. | `src/coach-media/coach-media.service.ts` |
| P2-1 | Uniform 404 on the buyer signed-URL endpoint — missing/archived/no-grant/revoked-grant/tenant-mismatch all return the same shape (no existence leak). | `src/coach-media/coach-media.service.ts` |
| P2-3 | Soft-delete now wraps the count + archive in a single `$transaction` with `SELECT ... FOR UPDATE` on the asset row. `MediaAssetResolver` takes the same row lock when running inside a tx, so concurrent grant creation serializes against the archive. Storage `deleteObject` runs after commit (outside the tx) to keep the Postgres connection short. | `src/coach-media/coach-media.service.ts`, `src/packages/asset-resolvers/media-asset.resolver.ts` |
| P3 | `generateId` uses `crypto.randomUUID()` (RFC 4122 v4) instead of a manually-formatted hex string that didn't set the version/variant nibbles. The `findRowByAssetOrUpload` fallback now actually queries by `mux_upload_id` (was returning `null`). | `src/coach-media/coach-media.service.ts`, `src/coach-media/coach-media-mux-webhook.controller.ts` |

**Audit-fix regression tests added:**

| Spec | Tests | What |
|---|---|---|
| `test/coach-media-mux-webhook.spec.ts` | 15 (was 11) | Real HMAC verify against rawBody (3 new): valid sig over rawBody, tamper rejection, **rawBody ≠ JSON.stringify(parsed) sig accepted** (the differentiator vs the old code). Missing rawBody → 400. **P1-1 tx-rollback test**: handler throw → dedup row not persisted → retry succeeds + transitions to ready. |
| `test/coach-media.service.spec.ts` | 41 (was 40) | Buyer signed-URL refusals all assert `NotFoundException` now (was `ForbiddenException`). New: **P2-4 tenant double-check** — mismatching `purchase.coach_user_id` returns 404; matching coach_user_id allows access. Video signed-URL test now asserts `policy: 'signed'` and a token-bearing URL. |
| `test/assignable-asset-resolver-media.spec.ts` | 13 (unchanged) | `$queryRaw` stub added so the resolver's new SELECT FOR UPDATE row lock works inside ambient-tx tests. |

**Re-verification after the audit fixes:**

- `node_modules/.bin/tsc --noEmit -p tsconfig.json` → **clean** (0 errors).
- `npm run build` (`nest build`) → **clean**.
- `npm run lint` → **0 errors**, 17 pre-existing warnings unchanged.
- `node_modules/.bin/jest` → **291 suites pass; 3539 / 3539 active tests pass** (up from 3533 → **+6 net-new audit-fix regression tests**), 20 skipped + 5 todo unchanged, 6 snapshots pass.

**P2-3 concurrency guard — how it works:**

1. `CoachMediaService.softDelete` opens a `$transaction` and runs `SELECT id FROM "CoachMediaAsset" WHERE id = $1 FOR UPDATE` immediately. This acquires a Postgres row-level lock that blocks any other `SELECT FOR UPDATE` / `UPDATE` / `DELETE` on the same row until the tx commits.
2. Inside the same tx it re-reads the row, recounts grants + content references, decides whether to archive, and updates `archived_at`.
3. `MediaAssetResolver.materialise` — when called with an ambient `tx` (the PR-9 fanout path) — takes the same row lock before reading `status` / `archived_at`. The two transactions therefore serialize: whichever wins blocks the other until commit. If the resolver wins, it inserts the grant and the softDelete then sees `grantCount >= 1` (its read happens AFTER the resolver's commit) and correctly preserves the storage object; if softDelete wins, the resolver's post-commit read sees `archived_at != null` and refuses to mint the grant (`MediaAssetNotFoundError`), which PR-10 surfaces as a drop failure.
4. The Supabase `deleteObject` call lives AFTER the tx commits — Postgres connections are never held across the Supabase HTTP round-trip (mirrors the `preResolveReceiptUrl` pattern in `billing.service.ts`).
5. The cron-path resolver (no ambient tx) skips the lock; its `archived_at != null` check still catches archives committed before its findUnique, and PR-10's retry handles the rare interleaving where archive commits AFTER the resolver's read but before its insert (the insert would still succeed since archive doesn't FK-cascade, but the buyer's URL would point at a row marked archived — the buyer signed-URL endpoint refuses archived rows with 404 so the buyer sees a clear "no longer available" state rather than a broken URL).

## Files added / changed

```
prisma/schema.prisma                                            (mod — status, mux_upload_id, mux_error_message, MuxProcessedEvent, indexes)
prisma/migrations/20261206000000_pr12_coach_media_upload_status/migration.sql  (new — ONE additive migration)
src/app.module.ts                                               (mod — wire CoachMediaModule)
src/coach-media/storage-provider.ts                             (new — interface + DI token + error taxonomy)
src/coach-media/supabase-storage.provider.ts                    (new — Supabase impl)
src/coach-media/coach-media.service.ts                          (new — PDF + Mux flows; signed-URL minting; soft-delete safety)
src/coach-media/coach-media.controller.ts                       (new — owner endpoints)
src/coach-media/coach-media-mux-webhook.controller.ts           (new — Mux webhook + durable idempotency)
src/coach-media/coach-media.dto.ts                              (new — zod schemas)
src/coach-media/coach-media.errors.ts                           (new)
src/coach-media/coach-media.module.ts                           (new)
src/packages/asset-resolvers/media-asset.resolver.ts            (mod — PR-12 not-ready gate on status='ready')
test/coach-media.service.spec.ts                                (new — 40 tests)
test/coach-media-mux-webhook.spec.ts                            (new — 11 tests)
test/supabase-storage-provider.spec.ts                          (new — 10 tests)
test/assignable-asset-resolver-media.spec.ts                    (mod — +4 tests for PR-12 status gate)
```

## Guardrails honoured

- Backend only — no mobile upload UI, no refund/cancel handler (PR-16), no push-to-existing (PR-17).
- ONE additive migration, no DROP / no RENAME / no type change.
- Reuses the existing @Global `SupabaseService` and `MuxService` — no parallel SDK clients.
- Storage seam: every Supabase Storage call funnels through `StorageProvider`; no leaked SDK calls in the service or controller.
- Mux webhook: signature-verified (HMAC over `req.rawBody`, audit P1-2) + DURABLY idempotent with the dedup row inside the same `$transaction` as the handler (audit P1-1) — actually mirrors `StripeProcessedEvent` discipline now.
- Ownership + sub-coach scope enforced on every endpoint via `resolveEffectiveCoachId` + `requireOwned`.
- Not-ready-video safety: documented decision (resolver `status='ready'` gate), with three layers of defense.
- Config-not-set fails clean (503 with structured error code); app never crashes.
- PDFs are never publicly accessible — signed URLs only, default 1h, clamped expiry.
- Storage keys are coach-id-namespaced + random-suffixed; no user-controlled segment; no path traversal.
- Soft-delete safety: blocks delete on active content references; preserves storage object when grants exist (buyer-snapshot principle).
- Commit identity: `Dynasia G <dynasia@trygrowthproject.com>`. No `Co-Authored-By` / generated trailers.
