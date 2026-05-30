# PR-17 M1 BUILD REPORT — mobile contents + push API client

- **Repo:** growth-project-mobile
- **Branch:** `pr17/m1-contents-api` (worktree `/home/user/workspace/wt-pr17-m1`, off `origin/main` @ 0b83c75)
- **PR:** #212 — https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/212 (base `main`)
- **Head SHA:** `acb7a91e044feb27d5f349aef9719eee04efd749`
- **Commit identity:** Dynasia G <dynasia@trygrowthproject.com> (no Co-Authored-By / Generated trailers)

## Scope delivered (exactly the brief)
API client + types ONLY. No screen, no `CoachNavigator.tsx`, no `package.json`, no component touched. `packagesApi.ts` and `idempotency.ts` were **imported from, not edited** (a local `idemHeaders` helper was re-derived inside the new module to keep it import-independent of the package-level client, per the brief's "prefer importing, not editing").

## Files

### `src/api/packageContentsApi.ts` (NEW)
`coachPackageContentsApi` block, all against the frozen contracts:

| Method | file:line | Verb + path | Idempotency-Key |
|--------|-----------|-------------|-----------------|
| `list(packageId)` | :139 | `GET /v1/coach/packages/:id/contents` | — |
| `attach(packageId, body, key?)` | :142 | `POST …/contents` | yes (`idemHeaders(key)`) |
| `patch(packageId, contentId, body, key?)` | :145 | `PATCH …/contents/:contentId` | yes |
| `reorder(packageId, contentIds)` | :157 | `PUT …/contents/reorder` (body `{ content_ids }`) | — |
| `remove(packageId, contentId, key?)` | :162 | `DELETE …/contents/:contentId` | yes |
| `pushPreview(packageId, contentId, {audience, mode})` | :167 | `GET …/:contentId/push/preview` (axios `params`) | — |
| `push(packageId, contentId, body, key?)` | :177 | `POST …/:contentId/push` | yes |

- **Idempotency wiring (decision #8):** local `idemHeaders(key?)` at :128 → `{ headers: { 'Idempotency-Key': key ?? generateIdempotencyKey() } }`, applied on `attach`/`patch`/`push`/`remove`. `generateIdempotencyKey` imported from `../utils/idempotency` (:24). Each mutation takes an optional `key?` defaulting to a generated UUID.
- **Reused axios instance:** `import api from '../services/api'` (:23) — the shared instance with the auth interceptor; no new client.
- **Path safety:** all dynamic segments wrapped in `encodeURIComponent` via the `base()` helper (:133) and per-method.

#### Exported types (mirror backend DTO shapes)
- `ContentAssetType` (:32) — `workout_program|workout_plan|meal_plan|pdf|video|auto_message`
- `CadenceKind` (:41) — `immediate|relative_to_purchase|fixed_calendar|on_completion|on_milestone`
- `PackageContent` (:52) — snake_case row verbatim (backend returns raw Prisma rows)
- `AttachContentBody` (:69), `PatchContentBody` (:85)
- `PushAudience` (:96) — `all|active|cohort`
- `PushMode` (:97) — `push_existing|resend`
- `PushRequest` (:100), `PushPreview` (:110), `PushResult` (:117)

> Naming note: the brief enumerated `PushAudience`, `PushMode`, `PushRequest`, `PushPreview`, `PushResult`, `PackageContent`, `CadenceKind` — all present. Added `ContentAssetType`, `AttachContentBody`, `PatchContentBody` as supporting types so the screens get fully-typed mutation bodies (additive, within scope).

### `src/api/__tests__/packageContentsApi.test.ts` (NEW)
10 tests, mirroring the `paymentsApi.test.ts` convention (mock `../../services/api` default instance with `{get,post,put,patch,delete: jest.fn()}`):
- path + verb + body for `list`, `attach`, `patch`, `reorder`, `remove`, `pushPreview`, `push`
- `Idempotency-Key` header present on `attach`/`patch`/`push`; caller-supplied key honored on `attach` + `push`
- `pushPreview` builds `params: { audience, mode }`
- path-segment encoding (`a/b` → `a%2Fb`)

## Verification (real runs in the worktree after `npm ci`)
- **typecheck** — `npx tsc --noEmit` → exit 0, clean.
- **lint** — `npx eslint src/api/packageContentsApi.ts src/api/__tests__/packageContentsApi.test.ts --max-warnings=99999` → exit 0, 0 warnings.
- **test (new file)** — 10 passed / 10.
- **test (full suite)** — `npx jest` → **140 suites passed, 1531 tests passed** (1521 baseline + 10 new), 4 snapshots passed, 0 failures.

## Deviations from the brief
None functional. Two minor, in-scope choices: (a) re-derived a local `idemHeaders` instead of importing the one exported from `packagesApi.ts`, to avoid coupling this sibling module to the package-level client (brief allowed import-or-reuse and preferred not editing `packagesApi.ts`); (b) added three supporting body/asset-type types beyond the named list (additive typing for the mutation bodies).
