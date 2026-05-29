# PR-12 BUILD BRIEF — CoachMediaAsset upload (Supabase PDF + Mux video)

**Repo:** growth-project-backend (NestJS). **Type: BUILD.**
**Branch:** `pr12/coach-media-upload` off latest default (will have PR-2/3/4/6/7/8/9/10/11).

## GOAL
Coaches need to UPLOAD the pdf + video deliverables that PR-8 lets them attach to a package and PR-7/PR-9/PR-10 materialise/grant. PR-8 already validates that a `CoachMediaAsset` row exists + is owned when a coach attaches a pdf/video content; PR-12 builds the actual upload pipeline that CREATES those rows. PDF -> Supabase Storage (decision #5, behind StorageProvider interface). Video -> Mux HLS (decision #6, dual-attach: workout demo OR package).

## CONTEXT TO READ FIRST (authoritative)
- /home/user/workspace/specs/PACKAGES_DRIP_FEED_MASTER_PLAN.md §1 (decisions #5 Supabase behind StorageProvider, #6 Mux HLS dual-attach) + §3 (CoachMediaAsset model — fields: coach_id, kind pdf|video, storage_provider, storage_key/path, mux_asset_id?, mux_playback_id?, status, title, mime, size_bytes, duration_s?, etc.).
- /home/user/workspace/specs/PR7_BUILD_REPORT.md — the MediaAssetResolver (how a CoachMediaAsset becomes a ClientAssetGrant at delivery) + the CoachMediaAsset.coach_id+kind ownership predicate PR-8 reuses. PR-12's created rows must satisfy what the resolver + PR-8 expect (kind, ownership, a resolvable storage/playback ref, status=ready before it can be delivered).
- /home/user/workspace/specs/PR8_BUILD_REPORT.md — exactly which CoachMediaAsset fields PR-8 validates on attach (so uploaded rows are attachable).
- The Supabase connector is available to the operator, but THIS is backend server code: find how the backend ALREADY talks to Supabase/storage + any existing StorageProvider abstraction or file-upload pattern in the repo (avatars, attachments, etc.) — REUSE it. Find any existing Mux integration; if none, build the minimal Mux client behind an interface.

## STORAGE PROVIDER INTERFACE (decision #5)
- Define/みreuse a `StorageProvider` interface (put/get/signedUrl/delete) with a Supabase implementation. If the repo already has a storage abstraction, EXTEND it; do NOT fork a parallel one. PDFs go through this.
- Secrets/config via the existing config pattern (no hardcoded keys). If Supabase storage creds aren't configured, follow the existing isNotConfigured/feature-flag pattern (like PR-1's checkout-not-configured) — fail clean, don't crash.

## PDF UPLOAD (Supabase)
- Endpoint(s) for a coach to upload a PDF: either direct multipart upload to the backend -> StorageProvider.put -> create CoachMediaAsset(kind='pdf', status='ready', storage_key, size, mime), OR issue a signed upload URL the client PUTs to then confirms. Pick the pattern consistent with how the repo handles existing uploads. Validate: mime=application/pdf, max size (document the cap), coach ownership/scope (SubCoachScopeService, same as PR-6/8).
- Delivery/read: a signed, time-limited download URL (do NOT expose a public permanent URL for paid content). The MediaAssetResolver/ClientAssetGrant path (PR-7) governs buyer access — make sure granted buyers can fetch via signed URL, non-buyers cannot.

## VIDEO UPLOAD (Mux, decision #6)
- Create a Mux direct-upload (or asset-from-URL) flow: backend creates a Mux upload -> coach uploads -> Mux webhook (video.asset.ready) updates CoachMediaAsset with mux_asset_id + mux_playback_id + duration + status='ready'. Handle the Mux webhook with signature verification + idempotency (same discipline as the Stripe webhook handling — verify signature, dedup by event id).
- status lifecycle: uploading -> processing -> ready (or errored). A package content referencing a video that isn't 'ready' yet must be handled (PR-8 validates the row exists; document what happens if attached-but-not-ready at purchase — likely the drop materialises to a grant that points at a not-yet-ready playback; SAFER: only allow attaching/publishing when ready, OR the resolver tolerates pending and the buyer sees "processing". Pick + document; do NOT silently deliver a broken video).
- Dual-attach (decision #6): the SAME video upload pipeline must support a video used as a WORKOUT DEMO (existing workout exercise demo) OR a PACKAGE deliverable — don't build two pipelines. Find the existing workout-demo video handling (if any) and unify, or ensure CoachMediaAsset(kind='video') is the single source both can reference. Document the dual-attach seam.

## ENDPOINTS (match controller conventions, guards, response shapes)
- POST create-upload (pdf: signed URL or multipart; video: Mux direct upload) — returns the CoachMediaAsset id + upload target.
- POST confirm / or rely on webhook (video) — finalize status=ready.
- GET list coach's media assets (for the attach picker), GET one (with signed playback/download for owner).
- DELETE / soft-delete a media asset (must not break existing ClientAssetGrants pointing at it — if buyers were granted it, soft-delete + keep the stored object, or block delete if referenced; document — same buyer-snapshot-safety principle as PR-8).
- Mux webhook endpoint (signature-verified, idempotent).

## CRITICAL CORRECTNESS (50-Failures gate)
- StorageProvider interface (decision #5) — Supabase behind it, no leaked SDK calls scattered; PDFs not publicly accessible (signed URLs only for paid content).
- Mux webhook: signature verified + idempotent (no double-processing; reuse the StripeProcessedEvent-style dedup pattern or equivalent).
- Ownership/scope on every endpoint (SubCoachScopeService) — a coach can't read/delete another coach's media or its signed URLs.
- The created CoachMediaAsset rows must be exactly what PR-8 attach-validation + PR-7 MediaAssetResolver expect (kind, ownership, status=ready gate, resolvable ref).
- not-ready video handling DOCUMENTED (no broken-video delivery).
- Config-not-set fails clean (don't crash the app if Supabase/Mux unconfigured).
- Size/mime validation; no path traversal in storage keys; signed-URL expiry sane.
- Idempotent uploads where reasonable; orphan cleanup story documented (an upload that never confirms).

## SCOPE GUARDRAILS
- Backend only. Upload pipeline + media CRUD + Mux webhook ONLY.
- Do NOT change PR-9 fan-out or PR-10 cron (they already consume CoachMediaAsset via the resolver). Do NOT build mobile upload UI (that's a separate mobile surface). Do NOT touch refund/cancel (PR-16) or push-to-existing (PR-17).

## VERIFICATION
1. nest build + tsc + eslint clean.
2. Tests:
   - PDF upload -> CoachMediaAsset(kind=pdf, status=ready, storage_key set); signed download URL works for owner + granted buyer, denied for non-owner/non-buyer.
   - Video: create Mux upload -> webhook video.asset.ready -> asset updated with playback id + status=ready; webhook signature verification rejects forged events; webhook idempotent (replay no double-update).
   - not-ready video attach/publish behavior per documented rule.
   - Ownership/scope: coach A cannot list/get/delete coach B's media or get its signed URL.
   - mime/size validation rejects oversized/non-pdf.
   - Config-not-set path returns clean error, no crash.
   - Soft-delete/referenced-asset safety.
3. Existing suite passes (3451+ / whatever PR-11 left).

## COMMIT / PR RULES (STRICT)
- `git -c user.name='Dynasia G' -c user.email='dynasia@trygrowthproject.com' commit ...`. NO Co-Authored-By / Generated trailers.
- Branch `pr12/coach-media-upload`, PR against default, report PR URL.
- PR description: StorageProvider interface + Supabase impl, PDF flow, Mux flow + webhook (sig + idempotency), dual-attach seam, not-ready handling, ownership/scope, signed-URL security, config-not-set handling, test results.

## DELIVERABLE
Report: (a) PR URL, (b) StorageProvider interface + Supabase impl (reused or new), (c) PDF upload flow, (d) Mux video flow + webhook sig/idempotency, (e) dual-attach (workout-demo vs package) seam, (f) not-ready-video decision, (g) ownership/scope + signed-URL security, (h) config-not-set handling, (i) test results. Copy to /home/user/workspace/specs/PR12_BUILD_REPORT.md.
