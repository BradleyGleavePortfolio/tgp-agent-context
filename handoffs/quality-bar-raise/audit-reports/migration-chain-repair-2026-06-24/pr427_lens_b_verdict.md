# PR #427 Lens B audit — zero-finding doctrine

Verdict: **DIRTY**

Blocking status: **Blocking P1 present**. The storage layer is mostly well-scoped and the feature flag stays dark, but the migration timestamp is now stale relative to current `main` and must be re-dated before merge.

## Findings table

| Severity | File:line | Finding | Recommended fix |
|---|---:|---|---|
| P1 | `prisma/migrations/20261220000001_coach_custom_exercises/migration.sql`:5 | Migration ordering is stale against current `main`. The PR migration is named `20261220000001_coach_custom_exercises`, and its header says it is after `20261220000000_talent_marketplace_rls`; however current `main` already contains later migrations `20261220000010_marketplace_idempotency_claim_nonce`, `20261220000020_marketplace_abuse_signal_rls`, `20261220000030_marketplace_connect_event`, and `20261220000031_application_applicant_listing_unique`. This violates the repo’s append-only migration ordering doctrine and risks introducing a new migration lexically behind shipped migrations. | Rebase on current `main`, rename the migration to a timestamp strictly greater than the current latest landed migration (for example `20261220000032_coach_custom_exercises` or later), and update the header/commit body references accordingly. |
| P2 | `src/coach-exercise/coach-exercise-upload.provider.ts`:83 | `COACH_EXERCISE_SIGNED_URL_TTL_SEC` is advertised as the signed-upload TTL and used to compute `expires_at`, but the actual `createSignedUploadUrl` call at line 165 receives only the object path. In the installed Supabase Storage API, `createSignedUploadUrl(path, options?: { upsert })` has no TTL parameter, so the env clamp does not enforce the upload URL’s real lifetime. Clients may receive an `expires_at` that does not match the storage token’s actual expiry. | Do not claim configurable upload TTL unless it is actually enforced. Either derive `expires_at` from Supabase’s fixed signed-upload lifetime, or add a pending-upload/confirmation record with server-enforced expiry before durable create. Keep the configurable TTL only for signed downloads if upload expiry cannot be controlled. |
| P2 | `src/coach-exercise/coach-exercise-upload.provider.ts`:145 | The provider accepts `size_bytes` and `content_type` but does not enforce a max size or MIME allowlist before minting a signed upload URL; unknown MIME values fall through to `.bin` at lines 98-112. The comments rely on a future caller to validate, but this provider is exported as the storage-layer presign primitive and can mint URLs for payloads the product likely should reject. | Make the presign seam fail-closed: add an allowlist for `image/jpeg`, `image/png`, `image/webp`, `video/mp4`, and `video/quicktime`, enforce positive `size_bytes` and image/video max-byte caps before calling storage, and add unit tests proving invalid MIME/size rejects before URL minting. If validation intentionally belongs in B2 service, export a single authoritative validator/constants from this slice and require B2 to use it. |
| P3 | `prisma/migrations/20261220000001_coach_custom_exercises/migration.sql`:46 | The durable table does not enforce media-shape invariants at the database layer: `media_kind` is free text, `storage_key` is nullable, and `media_mime` is nullable. Rows such as `media_kind='image'` with `storage_key IS NULL`, or `media_kind='none'` with a media key, are representable despite the schema comments documenting only `none`/`image`/`video`. | Add CHECK constraints mirroring the intended shape: `media_kind IN ('none','image','video')`, `media_kind='none'` requires `storage_key IS NULL AND media_mime IS NULL`, and `media_kind IN ('image','video')` requires both media fields present with MIME compatible with the kind. |
| P3 | `src/coach-exercise/coach-exercise-upload.provider.ts`:207 | `deriveStorageKey()` silently manufactures an owner-prefixed fallback key when the URL does not contain the expected bucket marker. That prevents cross-owner keys, but it can also persist a key that was never minted/uploaded, making “upload confirmed before durable create” harder to prove in B2. | Prefer fail-closed parsing: return `null`/throw for unexpected URL shape and require the service to reject durable create unless the key matches the minted owner-prefixed object path. If fallback is retained for compatibility, do not use it on durable create paths. |

## Per-file detailed notes

### `prisma/migrations/20261220000001_coach_custom_exercises/migration.sql`

- **Dirty — P1 migration timestamp.** Current `main` has later `20261220000010`/`20`/`30`/`31` migrations, so this file must be re-dated after the current tail.
- RLS is present and forced (`ENABLE ROW LEVEL SECURITY`, `FORCE ROW LEVEL SECURITY`).
- Owner policy is correctly owner-scoped for SELECT/INSERT/UPDATE/DELETE via `USING` and `WITH CHECK` on `coach_id::text = app.current_user_id()`.
- Anonymous/no-current-user access fails closed because equality against NULL does not pass the policy.
- The policy follows the cited `community_workspaces_coach_all` idiom, though it intentionally does not add a role check; B2 must keep the coach-role guard in the API layer.
- FK uses `ON DELETE RESTRICT`, matching the “do not silently orphan library history” comment.
- Index `(coach_id, created_at)` supports the repository’s coach-scoped list path. The secondary `id DESC` sort is not indexed but is acceptable for a coach-local library unless the list becomes very large.
- Missing DB CHECK constraints for `media_kind` and storage/mime shape are a P3 data-integrity gap.

### `prisma/schema.prisma`

- Schema and migration are in parity for columns, nullability, index, FK relation, and table mapping.
- `CoachExercise.id @default(uuid())` is Prisma/client-generated rather than a DB default; this is consistent with several existing Prisma patterns and validated successfully after setting placeholder database URLs.
- `media_kind` is modeled as `String @db.VarChar(16)` rather than an enum. That matches the migration but leaves correctness to application code unless CHECK constraints are added.
- `User.coach_exercises_as_coach` relation is additive and does not disturb existing relations.

### `src/app.module.ts`

- Module import is grouped with coach toolset modules and adds no controller route by itself.
- Feature surface remains dark in this PR because no controller/service is registered here.

### `src/coach-exercise/coach-exercise-flag.guard.ts`

- Fail-closed semantics are correct: only literal `'true'` enables the feature; every other value, including unset, is 503 `coach_exercise.disabled`.
- The flag is read from `process.env` inside `canActivate()` each request, not cached at boot.
- Response shape is local rather than shared with community disabled DTOs; acceptable for a non-community slice.

### `src/coach-exercise/coach-exercise-upload.provider.ts`

- Owner binding is mostly correct: generated object paths are `<ownerId>/<timestamp>-<random>.<ext>` and contain no names/emails/free-text PII.
- Random token uses `crypto.randomBytes`, and the timestamp+random suffix is collision-resistant enough for this use.
- Signed download degrades to `null` instead of blanking the whole library list, consistent with sibling voice provider behavior.
- Presign safety is incomplete at the provider boundary: `size_bytes` is unused, MIME is not rejected at the provider, and configurable upload TTL is not actually passed to Supabase signed-upload creation.
- Error logging for signed-download includes `storageKey`, which includes the owner UUID. This is not direct PII, but logs should continue to avoid names/emails/free-text in keys.

### `src/coach-exercise/coach-exercise.module.ts`

- Minimal B1 module shape is appropriate: imports `AuthModule`, provides repository/guard/upload provider, exports repository/upload provider.
- Guard is provided but not exported. That is fine if B2 adds controllers inside this module; if B2 puts controllers/services in another module, it will need to export the guard or colocate the controller.
- SupabaseService and PrismaService are correctly assumed global per existing module conventions.

### `src/coach-exercise/coach-exercise.repository.ts`

- `listForCoach()` is properly tenant-scoped with `where: { coach_id: coachId, archived_at: null }`.
- `create()` writes `coach_id` from the server-supplied seed, not client-supplied ownership inside the repository. B2 must derive `coachId` from the authenticated user, not from request body.
- The single-operation `$transaction([...])` is harmless but unnecessary; it may be a consistency placeholder for B2.
- Repository does not expose update/delete/archive yet; no dark-route reachability in B1.

## Forward-reference inventory

| Location | Forward reference | Readiness note |
|---|---|---|
| `prisma/migrations/20261220000001_coach_custom_exercises/migration.sql`:21 | `CoachExerciseService` will enforce application-layer tenancy. | B2 must ensure every create/list/archive/read path derives coach identity from auth context and never accepts arbitrary `coachId`. |
| `src/coach-exercise/coach-exercise.module.ts`:13 | DTO + service + controller + `/coach-exercises` routes land in B2. | B2 must apply `CoachExerciseEnabledGuard`, JWT auth, coach-role guard, request validation, and size/MIME checks before calling the upload provider. |
| `src/coach-exercise/coach-exercise-upload.provider.ts`:140 | Caller validates size/content type before URL minting. | B2 must implement the authoritative validator or this provider should own it now. |
| `src/coach-exercise/coach-exercise-upload.provider.ts`:184 | Render path issues signed read URL for private buckets. | B2 read/list service must call `createSignedDownload()` from `storage_key` and not persist returned read URLs. |
| `src/coach-exercise/coach-exercise.repository.ts`:30 | “inside a transaction”/call-site consistency. | If B2 create includes upload confirmation + durable insert + telemetry, wrap only the DB writes that must commit atomically; do not pretend the external upload itself is transactional. |
| `src/app.module.ts`:332 | Surface stays dark until flag flips. | B2 must not add any ungated controller or background mutation path that bypasses `FEATURE_CUSTOM_EXERCISE`. |

## Validation performed

- Read the full PR diff.
- Read relevant quality references for RLS, feature flags, migration ordering, Supabase signed-upload provider conventions, and guard/module patterns.
- Compared sibling conventions in community voice notes, community search/wearable prompt guards, wearables modules, and talent marketplace RLS migrations.
- Ran `prisma validate` with placeholder `DATABASE_URL`/`DIRECT_URL`: passed.
- Ran `prisma generate`, then `tsc -p tsconfig.build.json --noEmit` with increased Node heap: passed for production `src/**/*` scope.
- Checked commit identity and last commit subject: author is `Bradley Gleave <bradley@bradleytgpcoaching.com>` and subject is Conventional Commit style.
