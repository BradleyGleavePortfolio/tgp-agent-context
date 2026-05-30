# PR-17 M1 BRIEF — mobile contents + push API client wiring

Repo: growth-project-mobile. Pillar: Packages & Drip-Feed (PR-17, unit M1). Type: FEATURE (additive). Branch: `pr17/m1-contents-api`.
PR title: `PR-17 M1: wire coach package contents + push API client`

## Why
The mobile app has NO API methods for the backend coach package-contents endpoints (`v1/coach/packages/:id/contents…`) and none for the new push endpoint. Every downstream PR-17 mobile screen (authoring UI, push prompt, confirm modal) depends on this client layer. M1 is the contract-frozen API wiring; it runs in PARALLEL with backend B1 (different repo). Full design: `/home/user/workspace/PR17_EXPANSION_PLAN.md` §3.1, §4.

## Frozen endpoint contracts (from PR17_EXPANSION_PLAN §2.1 — implement against THESE, do not invent)
- `GET    v1/coach/packages/:id/contents` → `{ contents: PackageContent[] }`
- `POST   v1/coach/packages/:id/contents` (attach) → content row; send `Idempotency-Key`
- `PUT    v1/coach/packages/:id/contents/reorder` → `{ contents }`
- `PATCH  v1/coach/packages/:id/contents/:contentId` → content row; send `Idempotency-Key`
- `DELETE v1/coach/packages/:id/contents/:contentId` → soft-deleted row
- `GET    v1/coach/packages/:id/contents/:contentId/push/preview?audience=&mode=` → `{ count, audience, already_delivered }`
- `POST   v1/coach/packages/:id/contents/:contentId/push` → `{ scheduled, skipped, fire_at, audience, notify }`; send `Idempotency-Key` (decision #8)
  - push body: `{ audience:'all'|'active'|'cohort', cohort_purchase_ids?:string[], fire_at:string(ISO), mode:'push_existing'|'resend', notify:boolean }`

## Scope — EXACTLY this
1. Add a `coachPackageContentsApi` block (new file `src/api/packageContentsApi.ts`, OR extend `src/api/packagesApi.ts` — prefer a NEW sibling file to avoid future merge contention with package-level methods). Methods: `list`, `attach`, `patch`, `reorder`, `remove`, `pushPreview`, `push`.
2. Reuse the existing axios `default api` instance + auth interceptor (`src/services/api.ts:93-108`) — do NOT create a new client.
3. Reuse `idemHeaders(key?)` (`src/api/packagesApi.ts:203`) and `generateIdempotencyKey()` (`src/utils/idempotency.ts:36`) on `attach`, `patch`, and `push` (decision #8). Each mutation accepts an optional `key?` arg and defaults to a generated UUID.
4. Export TS types mirroring the backend DTO shapes: `PackageContent`, `CadenceKind`, `PushAudience` (`'all'|'active'|'cohort'`), `PushMode` (`'push_existing'|'resend'`), `PushRequest`, `PushPreview`, `PushResult`. Mirror the existing typing style in `packagesApi.ts`.

## Out of scope (later mobile units own these — do NOT touch)
- Any screen file, `CoachNavigator.tsx`, `package.json`/datetimepicker dep, any component. M1 is API-client + types ONLY. Touch NO file other than the new `packageContentsApi.ts` and its test (and `idempotency.ts`/`packagesApi.ts` only if re-exporting a helper — prefer importing, not editing).

## Tests — `src/api/__tests__/packageContentsApi.test.ts`
- Follow the existing API-test convention: mock `../../services/api` default instance `{ get, post, patch, put, delete: jest.fn() }`.
- Assert each method hits the correct path + verb + body, and that `attach`/`patch`/`push` set an `Idempotency-Key` header (assert on `.post.mock.calls[0]` / `.patch.mock.calls[0]`).
- Assert `pushPreview` builds the correct query string for audience+mode.
- Assert types compile (tsc).

## Deliverables
- Branch + PR vs default. Pull latest default first.
- Push to GitHub every ~2 minutes (even mid-flight) — R61.
- `/home/user/workspace/specs/PR17_M1_BUILD_REPORT.md`: file:line of each method, the idempotency wiring, the exported types, actual tsc/lint/test counts.
- Commit identity: `git -c user.name='Dynasia G' -c user.email='dynasia@trygrowthproject.com'`. NO Co-Authored-By / Generated trailers.
