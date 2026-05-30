# AUDIT — PR-17 M1: wire coach package contents + push API client (PR #212)

VERDICT: CLEAN

Audited repo: growth-project-mobile
Audited branch: pr17/m1-contents-api
Audited head SHA: acb7a91e044feb27d5f349aef9719eee04efd749 (worktree detached at this exact SHA; verdict is SHA-bound)
Diff: 2 files, +343 / -0 — `src/api/packageContentsApi.ts` (+186), `src/api/__tests__/packageContentsApi.test.ts` (+157). No other files touched.

Typecheck: PASS — `npx tsc --noEmit` (repo `typecheck` script) → 0 errors.
Lint: PASS — `npx eslint src/api/packageContentsApi.ts src/api/__tests__/packageContentsApi.test.ts --max-warnings=99999` → 0 errors / 0 warnings.
Tests: PASS — `npx jest src/api/__tests__/packageContentsApi.test.ts` → 1 suite, 10/10 passed.

## P0 findings
None.

## P1 findings
None.

## P2 findings
None.

## P3 (non-blocking)
- [src/api/packageContentsApi.ts:159-163] `remove` (DELETE) sends an `Idempotency-Key` header. The frozen brief lists `Idempotency-Key` only on attach/patch/push (decision #8); DELETE soft-delete is naturally idempotent so a key is neither required nor harmful (the backend DELETE handler reads no body/headers for dedup — `package-contents.controller.ts:100-109`). Extra, not wrong. Leave as-is or drop the `key?` param for contract-tidiness; no behavior impact.
- [src/api/packageContentsApi.ts:126-128] Local `idemHeaders` re-derivation duplicates `packagesApi.ts:203-205`. Verified byte-for-byte identical (`{ headers: { 'Idempotency-Key': key ?? generateIdempotencyKey() } }`, both delegate to the same `generateIdempotencyKey`). The stated rationale (keep the module import-independent of the package-level client) is reasonable, but it is a latent drift point if one copy changes. Non-blocking; could import the shared helper instead. Not a drift trap today.
- [src/api/packageContentsApi.ts:113-119] `PushResult` / `PushPreview` types are validated only against the frozen brief contract; the backend push routes are not yet merged to backend `main` (see claim verification). When backend B1 lands its push controller, re-confirm the response field names (`scheduled`/`skipped`/`already_delivered`) against the real DTO. Tracking note, not a defect of this PR.

## Verification of PR claims / audit-focus checklist

Every method checked against the frozen contract in PR17_M1_BRIEF.md §"Frozen endpoint contracts" AND, where the route exists, against the backend counterpart code.

- **list** → `GET /v1/coach/packages/:id/contents`, returns `{ contents }` — VERIFIED. Client `packageContentsApi.ts:136-137`. Backend route exists: `package-contents.controller.ts:51-56` (`@Get()` on `@Controller('v1/coach/packages/:id/contents')`, returns `{ contents: rows }`). Path + verb + response shape match.
- **attach** → `POST …/contents` + body + Idempotency-Key — VERIFIED. Client `:139-140`. Backend `@Post()` `:59-67`. Body `AttachContentBody` (`:69-78`) matches backend `CreateContentSchema` `.strict()` shape verbatim (`package-contents.dto.ts:103-148`): asset_type/asset_id/asset_revision_id?/display_order?/display_title?/display_caption?/cadence_kind/cadence_payload. Idempotency-Key sent via `idemHeaders(key)`, caller key honored (test `:71-81`).
- **patch** → `PATCH …/contents/:contentId` + body + Idempotency-Key — VERIFIED. Client `:142-152`. Backend `@Patch(':contentId')` `:85-94`. `PatchContentBody` (`:82-89`) matches `PatchContentSchema` `.strict()` (`package-contents.dto.ts:157-166`) field-for-field. `contentId` encoded via `encodeURIComponent`.
- **reorder** → `PUT …/contents/reorder` body `{ content_ids }`, returns `{ contents }` — VERIFIED (this is the highest-risk field-name check because the backend schema is `.strict()`). Client sends `{ content_ids: contentIds }` (`:154-157`); backend `ReorderContentSchema` requires exactly `content_ids` and rejects extras (`package-contents.dto.ts:175-179`). Field name matches; a wrong key would have been a P0. Backend `@Put('reorder')` `:72-82`. Static `/reorder` is declared before `:contentId` on both sides, so no route-shadowing.
- **remove** → `DELETE …/contents/:contentId` (soft-delete) — VERIFIED. Client `:159-163`. Backend `@Delete(':contentId')` → `softDelete` `:100-109`. See P3 re: extra Idempotency-Key.
- **pushPreview** → `GET …/:contentId/push/preview?audience=&mode=`, returns `{ count, audience, already_delivered }` — path/verb/query VERIFIED against frozen contract. Client `:165-173` passes axios `{ params: { audience, mode } }` → serializes to exactly `?audience=&mode=` (test asserts `config.params` `:113-122`). Response type `PushPreview` (`:106-110`) matches the brief. NOTE: backend route NOT yet present (see below).
- **push** → `POST …/:contentId/push` + full body + Idempotency-Key, returns `{ scheduled, skipped, fire_at, audience, notify }` — body/verb/path VERIFIED against frozen contract. Client `:175-185`. `PushRequest` (`:97-103`) matches the brief body verbatim: `audience:'all'|'active'|'cohort'`, `cohort_purchase_ids?:string[]`, `fire_at:string`, `mode:'push_existing'|'resend'`, `notify:boolean`. Caller key honored (test `:140-150`). NOTE: backend route NOT yet present (see below).

- **"send a UUID Idempotency-Key (decision #8) + accept caller key" on attach/patch/push** → VERIFIED. All three route through `idemHeaders(key)` → `generateIdempotencyKey()` (`idempotency.ts:36-55`), which is a crypto.getRandomValues v4 UUID with NO Math.random fallback (throws if polyfill missing). Tests assert both the auto-generated header truthiness and the caller-supplied override for attach and push.
- **path params encoded** → VERIFIED. `base()` encodes `packageId` (`:130-131`); `contentId` encoded at every interpolation (`:149,161,171,182`). Injection test passes (`a/b` → `a%2Fb`, test `:152-156`).
- **exported types mirror backend DTO shapes** → VERIFIED. `ContentAssetType` == backend `ASSET_TYPES` (`package-contents.dto.ts:23-30`); `CadenceKind` == backend `CADENCE_PAYLOAD_SCHEMAS` keys (`:80-88`). All brief-required types exported: PackageContent, CadenceKind, PushAudience, PushMode, PushRequest, PushPreview, PushResult (+ ContentAssetType, AttachContentBody, PatchContentBody extras — additive, fine).
- **reuses shared axios default instance** → VERIFIED. `import api from '../services/api'` (`:27`); no new client created.
- **scope guard (no screen/navigator/package.json/component touched)** → VERIFIED. `git diff --stat` shows ONLY the new `packageContentsApi.ts` + its test. `idempotency.ts` / `packagesApi.ts` are imported, not edited.
- **local idemHeaders re-derivation is behavior-identical, not a drift trap** → VERIFIED behavior-identical to `packagesApi.ts:203-205` (same body, same helper). Flagged P3 only as a latent maintenance note; no current defect.

### Backend-existence note (per AUDITOR_BRIEF_COMMON §3 "verify routes REALLY exist")
- Contents routes (list/attach/reorder/patch/remove) DO exist on the backend counterpart today: `growth-project-backend` `main` @ `3f7ab76` → `src/packages/package-contents.controller.ts` mounted at `v1/coach/packages/:id/contents`. Paths, verbs, and `.strict()` body field names all match the client. 
- The `push` and `push/preview` routes do NOT yet exist on backend `main` — there is no push controller under `v1/coach/packages/:id/contents/:contentId/...` (grep of `src/` finds only notification-channel `'push'` usages, no route handler). This is EXPECTED and NOT a mobile-side defect: PR17_M1_BRIEF.md states M1 is the "contract-frozen API wiring" that "runs in PARALLEL with backend B1 (different repo)" and instructs implementing against the frozen contract ("implement against THESE, do not invent"). The client matches the frozen contract exactly. When backend B1 (push-seq engine, currently open PR #328) merges, the push response field names should be re-confirmed (tracked as P3). No severity assigned to the mobile PR for this.

## Summary
All seven methods hit the exact frozen path + verb + body. The two routes whose backend counterpart is already merged (contents CRUD) match the live `.strict()` DTOs field-for-field, including the high-risk `content_ids` reorder key. Idempotency, caller-key override, path encoding, type coverage, and scope guard all hold. Repo's real tsc (0), eslint (0/0), and the new jest suite (10/10) pass. No P0/P1/P2. VERDICT: CLEAN.
