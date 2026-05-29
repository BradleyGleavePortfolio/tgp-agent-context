# AUDIT R2 — PR-12 CoachMediaAsset upload pipeline (PR #322)

VERDICT: CLEAN
Commit: 9ddcaa3ccb441d3e82405439298c45fde2c57c02
Typecheck: PASS (`node_modules/.bin/tsc --noEmit -p tsconfig.json` — silent / no diagnostics)
Lint:      PASS (`npm run lint` — 0 errors, 17 warnings, all pre-existing in unrelated files)
Tests:     PASS (`node_modules/.bin/jest` — 291 suites / 3539 active passing, 20 skipped, 5 todo, 6 snapshots; +6 vs the round-1 count of 3533)

Targeted spec runs (also PASS):
  - `test/coach-media-mux-webhook.spec.ts` + `test/coach-media.service.spec.ts` → 57 / 57 passed
  - `test/assignable-asset-resolver-media.spec.ts` → 13 / 13 passed

---

## P0 findings
None.

## P1 findings
None.

## P2 findings
None.

## P3 (non-blocking)

- `src/coach-media/coach-media.service.ts:412` — the tenant double-check at URL issuance (P2-4 fix) is conditional on `grant.granted_via_drop_id` being non-null. A grant minted by a future writer that leaves `granted_via_drop_id = null` would bypass the cross-coach check entirely. Today the only writer (`MediaAssetResolver`) always passes a drop id, so this is dormant — but the fix is one defence-in-depth rung shorter than the round-1 finding implied ("also check `purchase.purchasing_coach_id === asset.coach_id`"). A safer shape would be: if the grant has no drop ref, fall back to asserting `asset.coach_id === <some coach context>` derived from the asset row directly (since the grant key is just `(buyer, asset)`). Not a P2 because no writer code path can produce this state today; flagging for the next PR that adds an alternative grant writer (PR-13/PR-18 if those touch this surface).

- `src/coach-media/coach-media-mux-webhook.controller.ts:195-205` — `handler_completed_at` bookkeeping is a separate, post-commit `prisma.muxProcessedEvent.update` with a `.catch(() => {})`. If the bookkeeping update fails after the dedup row + handler tx committed, the dedup row stays without a `handler_completed_at`. Functionally fine (dedup still works on the next delivery — true duplicate hits P2002 and 200s), but observability of "completed but un-stamped" is silently lost. Adding a structured log on the catch would aid forensics. Not a behavior bug.

- `src/coach-media/coach-media-mux-webhook.controller.ts:174-189` — the P2002 attribution comment is correct that the only unique we touch in the tx is `MuxProcessedEvent.mux_event_id`. Verified against schema: `CoachMediaAsset.mux_upload_id` is the only other unique on a column touched in this file, but the handlers in this controller never WRITE to `mux_upload_id` (only read by `findUnique`), so a P2002 inside the tx is unambiguous. The comment is accurate.

- `src/coach-media/coach-media-mux-webhook.controller.ts:308-321` of the round-1 report — the prior P3 about `findRowByAssetOrUpload` returning null on the upload-id fallback is FIXED: lines 375-378 now actually `findFirst({ provider: 'mux', mux_upload_id: assetId })` and return it.

- `src/coach-media/coach-media.service.ts:719` — `randomUUID()` is in use (round-1 P3 about manually-formatted UUID resolved).

- Pre-existing in unrelated controller: `src/video/mux-webhook.controller.ts:92` still re-serialises the body for HMAC. Round-1 noted this as a sibling fix opportunity; PR-12 chose to scope the rawBody fix to the coach-media controller only. Acceptable scope discipline — the workout-demo path is out of PR-12's scope per the file docblock — but the same reliability hole remains in the workout-demo pipeline. Worth a follow-up.

---

## Verification of PR claims

| Claim | Status | Evidence |
|---|---|---|
| Dedup INSERT + `coachMediaAsset.update` inside SAME `$transaction` (mirroring StripeProcessedEvent) | TRUE | `src/coach-media/coach-media-mux-webhook.controller.ts:165-190` opens `prisma.$transaction(async (tx) => { tx.muxProcessedEvent.create(...); await this.dispatch(tx, ...); })`. All four handlers (`handleUploadAssetCreated`, `handleAssetCreated`, `handleAssetReady`, `handleAssetErrored`) take `tx: TxClient` as the first arg and call `tx.coachMediaAsset.update(...)`, never `this.prisma.*`. P2002 caught OUTSIDE the tx and mapped to the deduped return path (lines 174-188). Matches `src/billing/billing.service.ts:191-200` discipline. |
| Dedup row rolls back when the handler throws — Mux retry re-runs handler | TRUE | `test/coach-media-mux-webhook.spec.ts:402-456` is a real (non-mocked-verifier) test: it builds a controller with `failHandlerUpdate: true`, calls a signed event over real HMAC + real rawBody, asserts the call REJECTS, asserts `prisma._processed.has('evt-fail') === false` (dedup row NOT persisted), then constructs a fresh stub representing the retry and asserts the handler successfully advances the row to `STATUS_READY` with the playback id. The stub's `$transaction` accurately models Prisma rollback semantics by deleting any `muxProcessedEvent` rows inserted via the tx client when the callback throws. |
| HMAC verifies against `req.rawBody` (not `JSON.stringify(body)`) | TRUE | `src/coach-media/coach-media-mux-webhook.controller.ts:139-152`: reads `(req as Request & { rawBody?: Buffer }).rawBody`, fails with 400 if not a Buffer, decodes to utf8 and passes to `verifyWebhookSignature({ payload: raw, signatureHeader })`. No `JSON.stringify(body)` anywhere in the controller. |
| `rawBody: true` wired in main.ts | TRUE | `src/main.ts:31` — `rawBody: true` passed to `NestFactory.create(AppModule, { rawBody: true })`. Existing Stripe webhook (`src/billing/stripe-webhook.controller.ts`) already relies on this — no boot regression risk. |
| Real (non-mocked) signature test | TRUE | `test/coach-media-mux-webhook.spec.ts:196-199` constructs a real `MuxService` and uses it via `new MuxService(new ConfigService({ MUX_WEBHOOK_SECRET: secret }))`; the tests at 238-341 cover forged-sig rejection, valid-sig acceptance over rawBody bytes (including the differentiator at 300-329 where rawBody whitespace+key-order intentionally differs from `JSON.stringify(parsed)` — this test FAILS against the old re-serialising code), tampered-body rejection, and middleware-misconfig (rawBody missing) → 400. |
| Uniform 404 on buyer signed-URL endpoint (P2-1) | TRUE | `src/coach-media/coach-media.service.ts:380-384` defines a `notFound()` factory returning `NotFoundException({ error: 'ASSET_NOT_FOUND', message: ... })`; lines 389, 401, 422 all throw it for missing/archived row, missing/revoked grant, and tenant mismatch respectively. No ForbiddenException remains on this path (grep-confirmed). Tests at `test/coach-media.service.spec.ts:633-650` assert NotFoundException on the no-grant + revoked-grant branches. |
| Mux playback policy 'public' → 'signed' for paid video (P2-2) | TRUE | `src/coach-media/coach-media.service.ts:279` — `playbackPolicy: 'signed'` on the Mux Direct Upload creation. `:685-689` — `mintPlaybackUrl({ playbackId, policy: 'signed', ttlSeconds })`. `src/video/mux.service.ts:149-169` is the implementation: returns `${base}?token=${jwt}` where the JWT is RS256-signed by `MUX_SIGNING_KEY_PRIVATE` (createSign + sign(pem), lines 309-312). Test `test/coach-media.service.spec.ts:523-545` asserts policy='signed' is passed to mintPlaybackUrl and the returned URL embeds a token. |
| SELECT … FOR UPDATE on asset row in softDelete (P2-3) | TRUE | `src/coach-media/coach-media.service.ts:509-565` opens a `$transaction`, calls `tx.$queryRaw` with `SELECT id FROM "CoachMediaAsset" WHERE id = ${mediaAssetId} FOR UPDATE`, re-fetches under lock, recounts grants + contents under lock, applies the archive INSIDE the tx, then performs `storage.deleteObject` AFTER the tx commits (lines 575-592). |
| SELECT … FOR UPDATE on asset row in MediaAssetResolver | TRUE | `src/packages/asset-resolvers/media-asset.resolver.ts:68-72`. Conditional on `input.tx` (the immediate-at-checkout path always passes a tx; the cron path does not, but the resolver's `archived_at` and `status` checks (lines 86-109) are read-after-lock when in tx and stale-tolerant when not — a stale read on the cron path retries on next tick). |
| Tenant double-check at URL issuance (P2-4) | TRUE (with caveat — see P3) | `src/coach-media/coach-media.service.ts:412-424`. When `grant.granted_via_drop_id` is set, the service loads `scheduledDrop.client_purchase.coach_user_id` and refuses with the same `notFound()` 404 if it does not match `row.coach_id`. Test `test/coach-media.service.spec.ts:653-680` asserts cross-coach refusal; `:682-703` asserts same-coach allow. Caveat in P3 above: grants with `granted_via_drop_id = null` bypass this check; no writer produces that state today, but the safety net is one rung weaker than a coach-id-on-asset-direct check. |
| `crypto.randomUUID()` (P3 follow-up) | TRUE | `src/coach-media/coach-media.service.ts:719` — `return randomUUID();` (imported from `crypto`). Old manual hex formatter is gone. |
| `findRowByAssetOrUpload` actually queries the `mux_upload_id` fallback (P3) | TRUE | `src/coach-media/coach-media-mux-webhook.controller.ts:375-378` — `tx.coachMediaAsset.findFirst({ where: { provider: 'mux', mux_upload_id: assetId } })`. Previously this branch was just a comment returning null. |
| Test suite grows (no removed coverage) | TRUE | Round 1: 3533. Round 2: 3539. New tests at `coach-media-mux-webhook.spec.ts:402-456` (P1-1 rollback), `:253-329` (P1-2 real-HMAC over rawBody + key-order/whitespace differentiator), `coach-media.service.spec.ts:653-703` (P2-4 tenant double-check). |

---

## Summary

All four P1/P2 audit-blockers from round 1 are correctly fixed, with real (non-mocked) tests exercising the differentiator behaviour in each case:

- **P1-1**: dedup row INSERT is now inside the `$transaction` with the handler dispatch; `tx.muxProcessedEvent.create` and `tx.coachMediaAsset.update` commit or roll back together. The replay-after-throw test at `test/coach-media-mux-webhook.spec.ts:402-456` proves the rollback round-trips: first delivery throws → no dedup row → second delivery successfully runs the handler. The stub's `$transaction` models Prisma's actual rollback semantics, so this test would FAIL against the old (out-of-tx) implementation.
- **P1-2**: HMAC verification reads `req.rawBody` (a Buffer guaranteed by `rawBody: true` in main.ts:31), with a clean 400 if missing. The test at `:300-329` constructs a `rawBody` whose whitespace + key ordering deliberately does not match `JSON.stringify(parsed)` — this test would fail against the pre-fix code, so it is a true differentiator. The `MuxService` HMAC code path is exercised end-to-end (no `verifyWebhookSignature` mock).
- **P2-1**: All four branches of `getBuyerSignedUrl` (missing row, archived row, missing/revoked grant, tenant mismatch) throw a single `notFound()` factory returning the same `{ error: 'ASSET_NOT_FOUND', ... }` shape. ForbiddenException is gone from this path.
- **P2-2**: Mux Direct Uploads are created with `playbackPolicy: 'signed'`; `mintPlaybackUrl` mints an RS256-signed JWT and embeds it as `?token=`. Tests assert the URL shape includes the token.
- **P2-3**: Both writers (`softDelete` and `MediaAssetResolver.materialise` when in a tx) take a `SELECT … FOR UPDATE` on the asset row before reading grant/archived state, so the two paths serialize and the buyer-orphaning race is closed.
- **P2-4**: When the grant has a `granted_via_drop_id`, the service double-checks `scheduledDrop.client_purchase.coach_user_id === row.coach_id` and refuses with the same uniform 404 on mismatch.

No new regressions introduced by any of the fixes:
- Migration remains additive (no DROP / no RENAME / no type change).
- The new `$transaction` wrapping does not create a false-positive P2002 trap: `MuxProcessedEvent.mux_event_id` is the only unique-constraint write inside the tx (the handlers update by `id` and never touch `mux_upload_id`), so the P2002 attribution in the outer catch is unambiguous.
- The post-commit bookkeeping update (lines 195-205) remains best-effort and cannot corrupt dedup correctness.
- 6 additional tests landed (3533 → 3539); no tests removed.
- Typecheck silent; lint 0 errors / 17 pre-existing warnings unchanged; full suite green.

Three minor non-blocking notes (all P3) are recorded above — none affects merge.

VERDICT: CLEAN
