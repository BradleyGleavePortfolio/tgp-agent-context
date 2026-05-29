# AUDIT — PR-12 CoachMediaAsset upload pipeline (Supabase PDF + Mux video) (PR #322)

VERDICT: NOT CLEAN
Typecheck: PASS (`node_modules/.bin/tsc --noEmit -p tsconfig.json`)
Lint:      PASS (`npm run lint` — 0 errors, 17 pre-existing warnings unchanged)
Build:     PASS (`npm run build` — nest build clean)
Tests:     PASS (`node_modules/.bin/jest` — 291 suites, 3533/3533 active passing, 20 skipped, 5 todo, 6 snapshots — matches the +65 claim from PR-11's 3468)

---

## P0 findings

None.

---

## P1 findings

### P1-1. Mux webhook dedup row persists across a failing handler — state transition is permanently lost on transient error
**File:** `src/coach-media/coach-media-mux-webhook.controller.ts:131-147` and surrounding handler block at `:149-182`.

**Evidence:**
- Line 134 inserts `MuxProcessedEvent { mux_event_id }` BEFORE the switch dispatches to the handler.
- The insert is NOT wrapped in a `$transaction` with the handler's `coachMediaAsset.update`. The `prisma.muxProcessedEvent.create` commits autonomously.
- Line 150-169 dispatches to `handleAssetReady` / `handleUploadAssetCreated` etc.; each of those calls `prisma.coachMediaAsset.update(...)`.
- Line 170-181: the `finally` block stamps `handler_completed_at` on its way out — including when the handler threw (because `finally` always runs and the `.catch(() => {})` only swallows the update's own failure, not the original handler error).
- Net effect: if Mux retries `video.asset.ready` and the handler `prisma.coachMediaAsset.update` errors once (transient DB blip, deadlock, connection close), the dedup row is committed. Mux's next retry hits P2002 at line 140 → returns `{ received: true, deduped: ... }` at line 143 WITHOUT re-running the handler. The video row never flips to `status='ready'`. The resolver's not-ready gate then refuses to mint a grant forever. PR-10 keeps retrying that drop until MAX_ATTEMPTS and surfaces a `COACH_ALERT` — buyer never sees the video.

**Why this is a P1, not a P2:** this is the same idempotency contract the Stripe pipeline gets right (`src/billing/billing.service.ts:191-200` — the StripeProcessedEvent insert lives **inside the outer `$transaction`** so a handler failure rolls back the dedup row too). The build report at line 78-79 claims "mirrors `StripeProcessedEvent`" but it does NOT: it inserts outside any transaction, so re-delivery doesn't re-run the handler. This is a money-adjacent correctness gap — a paid buyer can be left without their video deliverable.

**Concrete fix:** wrap the insert + handler in a single `prisma.$transaction(async tx => { tx.muxProcessedEvent.create(...); switch (...) { ... } })`; catch the outer `P2002` outside the tx as today. The `handler_completed_at` stamp can stay in the `finally` for the success path; the inner work either all commits or all rolls back.

**Test coverage gap:** `test/coach-media-mux-webhook.spec.ts:161-205` exercises the happy "deduped on second receipt" path but never the "handler-throws-then-replay" scenario, so the bug is invisible to the suite.

### P1-2. Webhook signature is verified against a re-serialised JSON body, not the raw request bytes — fragile vs Mux's actual payload
**File:** `src/coach-media/coach-media-mux-webhook.controller.ts:110-125`. Same anti-pattern as the pre-existing `src/video/mux-webhook.controller.ts:92` (workout-demo path).

**Evidence:**
- Line 118: `const raw = JSON.stringify(body ?? {});` — Nest's body parser has already deserialised the bytes; the controller re-serialises a parsed-and-typed JS object back to a string.
- HMAC-SHA256 is byte-exact. Any divergence between Mux's transmitted bytes and `JSON.stringify(parsed)` — key ordering, whitespace, number formatting (e.g. Mux may send `30.5` vs JS re-emit `30.5` is fine but trailing `.0` is not), Unicode escapes, BigInt-as-string — causes legit signatures to fail. The `rawBody: true` flag is ALREADY wired in `src/main.ts:31` and the Stripe path uses it correctly (`src/billing/stripe-webhook.controller.ts:73-80`).
- Practical security: this does NOT lower the attacker bar (the attacker still needs `MUX_WEBHOOK_SECRET` to forge), so it is not a forged-acceptance bug — it is a reliability bug. Failure mode = Mux's signed events are silently rejected as forgeries.

**Concrete fix:** inject `@Req() req: Request` and read `req.rawBody.toString('utf8')`, identical to `stripe-webhook.controller.ts:73-80`. PR-12 is the right time to fix both this and the pre-existing workout-demo controller — they share the symptom.

**Test coverage gap:** the forged-signature test at `test/coach-media-mux-webhook.spec.ts:134-142` mocks `MuxService.verifyWebhookSignature` to return `false`, so the test never exercises the actual byte-comparison path. The test passes regardless of whether the byte source is raw or re-serialised.

---

## P2 findings

### P2-1. Buyer signed-URL endpoint distinguishes "asset doesn't exist" (404) from "asset exists but not granted" (403) — minor existence leak
**File:** `src/coach-media/coach-media.service.ts:359-389`.

**Evidence:**
- Line 368-372: archived OR missing asset → `NotFoundException('ASSET_NOT_FOUND')`.
- Line 382-386: row exists but no grant → `ForbiddenException('ASSET_NOT_GRANTED')`.
- An attacker probing `media_asset_id` values can distinguish "this id exists" (403) from "this id doesn't" (404). Asset ids are uuid v4 → enumeration is computationally infeasible, so practical impact is near zero — hence P2 not P1.

**Concrete fix:** return 404 with the same shape in both branches; surface the grant check as a 404 too. Mirrors the `requireOwned` choice on line 526-531 which deliberately does NOT distinguish.

### P2-2. Default Mux playback policy is `public` — permanent un-revocable URL for paid content
**File:** `src/coach-media/coach-media.service.ts:269` (`playbackPolicy: 'public'`); `src/video/mux.service.ts:151-152` (returns `https://stream.mux.com/<id>.m3u8` with no token).

**Evidence:**
- A buyer receives `https://stream.mux.com/{playback_id}.m3u8` — anyone with that URL can stream the video forever. Revoking a `ClientAssetGrant` does NOT revoke the playback URL.
- Build report (f) Layer 3 and §(g) acknowledge this and call it "acceptable for v1 per master plan §1 decision #6" with signed playback as a follow-up. The `mintPlaybackUrl` code path is already ready for `'signed'`.
- This is documented + accepted by the spec, so it is not a regression — but it IS a meaningful quality issue because PDFs are gated by short-lived signed URLs while videos are NOT, despite both being paid content. Worth flagging.

**Concrete fix:** flip the default to `signed` and require `MUX_SIGNING_KEY_ID` / `MUX_SIGNING_KEY_PRIVATE` env at boot for video features. The plumbing is in place.

### P2-3. Soft-delete grant check is racey vs concurrent `ClientAssetGrant` creation
**File:** `src/coach-media/coach-media.service.ts:446-490`.

**Evidence:**
- Line 446-457: `Promise.all` reads `grantCount + contentCount` OUTSIDE any transaction.
- Line 459-466: if any active CoachPackageContent exists, throws ASSET_REFERENCED.
- Line 468-490: if zero grants AND the asset is a PDF, calls `storage.deleteObject` THEN archives the row.
- A drip-fan-out running concurrently could mint a new ClientAssetGrant pointing at this asset between the read and the delete. Result: the buyer's grant points at a deleted Supabase object → broken download for the buyer.
- The mitigation today is that `softDelete` also blocks if `coachPackageContent.count > 0` — but ad-hoc grants created outside the package-attach flow (PR-13/future) wouldn't be blocked.

**Concrete fix:** wrap the count + update in a `$transaction` with a SELECT … FOR UPDATE on the asset row, or perform the count INSIDE a tx that holds the row lock until the archive completes. Alternatively: defer `storage.deleteObject` to an out-of-band GC sweep (the build report already mentions a future GC for Mux assets — extend to PDFs).

### P2-4. `getBuyerSignedUrl` lacks tenant cross-check beyond the grant
**File:** `src/coach-media/coach-media.service.ts:359-389`.

**Evidence:**
- The grant lookup is `(buyer_user_id, media_asset_id)`. It does not assert the asset's `coach_id` matches the coach who SOLD the buyer access. If a buggy upstream wrote a `ClientAssetGrant(client_id=buyer, media_asset_id=otherCoachAsset)` directly, the buyer could exfiltrate any coach's media via a signed URL.
- Today the only writer of `ClientAssetGrant` is `MediaAssetResolver` (`src/packages/asset-resolvers/media-asset.resolver.ts:73-81`) which DOES enforce tenant — so today this is dormant. But the service should defence-in-depth and not rely on the writer.

**Concrete fix:** also check `purchase.purchasing_coach_id === asset.coach_id` (or equivalent) on the grant lookup. Or join through the purchase row that minted the grant.

---

## P3 (non-blocking)

- `src/coach-media/coach-media.service.ts:608-614` — manually formats a UUID via `randomBytes(16).toString('hex').replace(...)`. The 4 in the version nibble and the 8-a-b in the variant nibble are NOT set, so the result is NOT a valid v4 UUID, just a hex string in UUID shape. Postgres `uuid` column will still accept it (it parses any 8-4-4-4-12 hex), but a downstream consumer that uses a real UUID validator (e.g. zod `.uuid()`) will reject these ids. Recommend `crypto.randomUUID()`.
- `src/coach-media/coach-media-mux-webhook.controller.ts:308-321` — `findRowByAssetOrUpload` is documented as having an upload-id fallback but the implementation returns `null` on the fallback (lines 314-320 just have a comment). Either implement the fallback or drop the dead branch + rename.
- `src/coach-media/supabase-storage.provider.ts:222-227` — when the SDK's `remove` is missing the provider returns `true` ("idempotent success"); on actual remove ERROR it returns `false`. The asymmetry is confusing — both paths log and return `false` would be cleaner.
- `src/coach-media/coach-media-mux-webhook.controller.ts:255-256` — only the FIRST `playback_ids[]` entry is recorded. If Mux returns multiple (e.g. public + signed) this drops one. PR-12 only uses `public` so this is fine today but documenting the choice would help future signing-key rotation.
- `src/coach-media/coach-media.controller.ts:88-98` — `list()` silently drops any non-`pdf`/`video` `kind` query-param value instead of erroring. Acceptable but a 400 would be more honest.
- The Supabase bucket privacy is asserted only in code-comment ("The bucket should be private" — `coach-media.service.ts:30-33`). The code path always issues signed URLs, so a public bucket would still work via signed URLs, but objects would ALSO be reachable via the bucket's public base URL. This is an operator-runbook concern, not a code defect — but worth pinning to the deploy checklist.

---

## Verification of PR claims

| Claim | Status | Notes |
|---|---|---|
| `node_modules/.bin/tsc --noEmit` clean | TRUE | confirmed |
| `npm run build` clean | TRUE | confirmed |
| `npm run lint` 0 errors | TRUE | 17 warnings, all pre-existing in unrelated files |
| `jest` 291 suites / 3533 passing / +65 net new | TRUE | confirmed |
| StorageProvider seam (decision #5) — Supabase behind interface, reuses existing `SupabaseService`, no parallel client | TRUE | `src/coach-media/supabase-storage.provider.ts:46-49` injects existing `SupabaseService` |
| PDFs never delivered via permanent public URL | TRUE | code only mints signed URLs (provider clamped to ≤24h); bucket privacy is an operator concern, see P3 |
| `MUX_WEBHOOK_SECRET` signature verification rejects forged events | TRUE in `MuxService.verifyWebhookSignature` (HMAC-SHA256 + timing-safe compare, `src/video/mux.service.ts:186-235`); FRAGILE in the controller because raw body is re-serialised (see P1-2) |
| Durable idempotency via MuxProcessedEvent — replay does NOT double-process | TRUE for the success path; FALSE for the handler-throws path (see P1-1) — replay returns deduped without re-running |
| MediaAssetResolver refuses to mint a grant when `status !== 'ready'` | TRUE — `src/packages/asset-resolvers/media-asset.resolver.ts:88-93` throws `MediaAssetNotFoundError`; PR-10 retry interaction relies on PR-10 surfacing this as a failure→backoff (not verified in this audit, but PR-10 was already gated for resolver errors) |
| `getBuyerSignedUrl` gates on active `ClientAssetGrant` | TRUE — `src/coach-media/coach-media.service.ts:374-387`; minor IDOR-distinguishable 403 vs 404 (P2-1) and no tenant-double-check (P2-4) |
| `resolveEffectiveCoachId` on every endpoint | TRUE — every method on `coach-media.controller.ts` calls it (`:58, :69, :81, :93, :106, :118, :140, :153`) |
| Cross-coach 404 with no existence leak (`requireOwned`) | TRUE — `coach-media.service.ts:519-534` returns `ASSET_NOT_FOUND` for both "missing" and "owned by another coach" |
| Storage key has no path traversal (coach-id-namespaced + random suffix) | TRUE — `coach-media.service.ts:596-603`; both segments are server-generated |
| Mime + size validation server-side (50 MB / `application/pdf`) | TRUE — zod schemas in `coach-media.dto.ts:24-36` |
| Config-not-set returns 503 cleanly + no orphan rows on a failed provider mint | TRUE — `coach-media.service.ts:144-203` mints the signed URL FIRST and only inserts the `CoachMediaAsset` row on success; `assertStorageReady()` / `assertMuxReady()` 503s when env missing |
| Migration additive (status default 'ready', mux_upload_id nullable, MuxProcessedEvent new table) | TRUE — `prisma/migrations/20261206000000.../migration.sql` — no DROP / RENAME / type change; existing rows default to ready |
| Soft-delete blocks on active content references; preserves object when grants exist | TRUE — `coach-media.service.ts:459-466` blocks on `coachPackageContent`; `:469-485` skips storage delete when grants present. (See P2-3 for the race.) |
| Dual-attach: same Mux primitive, separate tables; unification follow-up documented | TRUE — file docblock at `coach-media.service.ts:55-65` is explicit, and a SECOND webhook controller is intentionally introduced rather than reusing the workout-demo one |
| Scope discipline — no PR-9 fan-out / PR-10 cron changes (only resolver not-ready gate) | TRUE — diff shows only `media-asset.resolver.ts` modified outside coach-media; no purchase-fanout / drip-dispatcher changes |

---

## Summary

PR-12 is a solid build — interface seam is clean, sub-coach scoping is consistent, migrations are additive, the resolver not-ready gate is enforced, and the test suite is healthy. Two correctness issues block merge:

1. **P1-1 (idempotency)**: the `MuxProcessedEvent` insert runs outside the handler's transaction; a transient handler failure permanently loses the state transition because Mux's retry hits a dedup-shortcut. The build report claims parity with `StripeProcessedEvent`'s discipline, but the actual code differs — Stripe inserts INSIDE the outer `$transaction`.
2. **P1-2 (signature reliability)**: the webhook re-serialises the parsed body for HMAC instead of using `req.rawBody`. Pre-existing pattern in the workout-demo controller, but `rawBody: true` is already wired in `main.ts:31` and the Stripe controller does it right. This is a reliability hole (legit Mux events may fail verification), not an authentication hole — but it should be fixed in this PR rather than carried forward.

Resolving P1-1 and P1-2 (and the four P2s if time allows) would clear the merge bar.

VERDICT: NOT CLEAN
