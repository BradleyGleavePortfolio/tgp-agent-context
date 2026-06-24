# PR #427 — LENS A (Opus 4.8) Zero-Finding-Doctrine Audit

**PR:** feat(coach): custom-exercise storage layer — schema + RLS migration + media presign provider (FEATURE_CUSTOM_EXERCISE off)
**Chain:** B1 storage layer (#427) → B2 API layer (#428)
**Base:** main · **Head:** feat/coach-custom-exercise-data · **Feature commit:** `bafa2b25`
**Migration (actual):** `20261220000001_coach_custom_exercises`

---

## VERDICT: **DIRTY** (P3-only — non-blocking under R109)

No P0 or P1 findings. The security-critical surfaces (RLS, fail-closed flag guard, presign provider) are correct and mirror landed repo idioms verbatim. The DIRTY verdict is driven entirely by **P3 hygiene/documentation findings**: a wrong migration timestamp cited in the commit-message body, an off-convention commit author identity (R3), and minor documentation/parity nits. None are blocking; all are fix-forward.

---

## Findings Table

| # | Severity | File:Line | Finding | Recommended Fix |
|---|----------|-----------|---------|-----------------|
| F1 | **P3** | commit `bafa2b25` body | **Wrong migration timestamp in commit message.** The commit body states the migration is `20261220000000_coach_custom_exercises`, but the actual directory is `20261220000001_coach_custom_exercises`. `…000000` is already taken by the landed `20261220000000_talent_marketplace_rls` migration. The migration FILE itself correctly uses `…000001` and explains the ordering, so this is a stale message only — no functional collision exists on disk. (Note: the task brief also carries the same stale `…000000` label.) | Amend the commit-message body to cite `20261220000001`. No code change. |
| F2 | **P3** | commit `bafa2b25` author | **Off-convention author identity (R3).** Commit is authored AND committed as `Bradley Gleave <bradley@bradleytgpcoaching.com>`. Every landed PR commit on `main` (#451, #449, #470, #452, …) uses the canonical identity `BradleyGleavePortfolio <bradleyapple1031@gmail.com>` (committer `GitHub <noreply@github.com>`). | Re-author the commit under the canonical `BradleyGleavePortfolio <bradleyapple1031@gmail.com>` identity before merge (squash-merge via GitHub UI normalizes the committer to `GitHub`, but the author line should still match). |
| F3 | **P3** | `coach-exercise-upload.provider.ts:226` (`getPublicUrl`) | **Public-URL fallback can emit a bucket-public path for a private bucket.** When the SDK lacks `getPublicUrl`, the provider synthesizes `…/object/public/<bucket>/<path>`. For coach-authored media (potentially PII-adjacent), a private bucket is the safer default and this string would be a dead/incorrect URL. The render path (`createSignedDownload`) is the real read path, so `public_url` is advisory only — but the field name invites misuse by B2. | Document in B2 that `public_url` must NOT be persisted/served for private buckets; rely on `createSignedDownload`. Optionally rename to `candidate_public_url`. Mirrors the same latent issue already present in `voice-upload.provider.ts`, so this is precedented, not a regression. |
| F4 | **P3** | `migration.sql:52` / `schema.prisma:`media_kind` | **`media_kind` / `media_mime` have no DB-level CHECK / enum.** `media_kind VARCHAR(16)` accepts any string; the `'none'\|'image'\|'video'` contract lives only in comments/app layer. Consistent with the repo's free-text-column style (community uses enums for some, varchar for others), so not a defect — flagged for completeness. | Optional: add a `CHECK (media_kind IN ('none','image','video'))` or a Prisma enum in a future migration. Not required for B1. |
| F5 | **P3** | `coach-exercise.repository.ts:31` (`create`) | **Single-statement `$transaction([...])` wrapper is redundant.** Wrapping one `create` in `$transaction([…])` adds no atomicity benefit over a bare `create`. The doc comment ("call-site-consistent") acknowledges intent (B2 may extend it), so it is defensible as forward-consistency scaffolding. | Acceptable as-is for stacked-PR consistency; if B2 does not add sibling writes, simplify to a bare `create`. |

---

## Per-File Detailed Notes

### `prisma/migrations/20261220000001_coach_custom_exercises/migration.sql` — CLEAN (security), P3 nits
- **Ordering: CORRECT.** `…000001` is strictly after the latest landed migration `20261220000000_talent_marketplace_rls` (verified against `prisma/migrations/` on main). Append-only invariant (R76 §6) is respected — nothing back-dated behind the conv-review floor. The header comment's claim about ordering is accurate.
- **Additive-only: CORRECT.** Creates exactly ONE new table (`coach_exercises`). No existing table altered, no FK churn. `CREATE SCHEMA IF NOT EXISTS app` is the idempotent guard used by every prior RLS migration.
- **RLS: CORRECT and complete.** `ENABLE` + `FORCE ROW LEVEL SECURITY` both present. The `coach_exercises_owner_all` policy is `FOR ALL TO public USING (coach_id::text = app.current_user_id()) WITH CHECK (same)` — a **verbatim** match of the landed `community_workspaces_coach_all` idiom (`20261212000000_community_v1_1_schema:495-499`). `FOR ALL` in Postgres covers SELECT/INSERT/UPDATE/DELETE; the `USING` clause governs read/UPDATE-visible rows and DELETE, `WITH CHECK` governs INSERT/UPDATE writes — so all four verbs are owner-scoped. Defence-in-depth model is correct: runtime connects as `service_role` (BYPASSRLS), app-layer tenancy is primary, policy is the backstop.
- **`auth.uid()` correctly NOT used.** Repo doctrine (`community_v1_1_schema:17-22`) is explicit that `app.current_user_id()` is the canonical helper, not Supabase `auth.uid()`. The task's security-dimension prompt mentions `auth.uid()`, but following the in-repo helper is the correct call — and the migration comment flags this for the auditor. `app.current_user_id()` is search_path-hardened by `20261212000000_rls_helper_search_path`. **No finding.**
- **FK semantics: CORRECT.** `coach_id → User(id) ON DELETE RESTRICT ON UPDATE CASCADE`. RESTRICT prevents silently orphaning library history — matches the community **author** relation idiom (community_messages/posts/events use RESTRICT; community_workspaces uses CASCADE). The PR's choice of RESTRICT for an authored-library table is the defensible, history-preserving option and is documented.
- **Index: CORRECT.** `coach_exercises_coach_id_created_at_idx ON (coach_id, created_at)` directly supports the `listForCoach` query (`WHERE coach_id = … ORDER BY created_at DESC`). Naming matches Prisma's `<table>_<cols>_idx` convention.
- **UUID-vs-TEXT FK:** `coach_id UUID` references `User(id)` which is Prisma `String @default(uuid())` (TEXT in Postgres). This is the **established repo pattern** — `community_workspaces.coach_id` is identically `UUID` → `User(id)` TEXT, and that schema is landed and operational. The RLS comparison casts `coach_id::text`. Not a new defect; mirrors precedent. **No finding.**
- Transactional `BEGIN/COMMIT` wrapping + idempotent `DROP POLICY IF EXISTS` before `CREATE POLICY` — replay-safe. Good.

### `prisma/schema.prisma` — CLEAN
- `CoachExercise` model columns map 1:1 to the SQL table — full parity verified:
  - `id String @id @default(uuid()) @db.Uuid` ↔ `id UUID NOT NULL PRIMARY KEY` ✓
  - `coach_id String @db.Uuid` ↔ `coach_id UUID NOT NULL` ✓
  - `name String @db.VarChar(120)` ↔ `name VARCHAR(120) NOT NULL` ✓
  - `instructions String @db.Text` ↔ `instructions TEXT NOT NULL` ✓
  - `media_kind String @db.VarChar(16)` ↔ `media_kind VARCHAR(16) NOT NULL` ✓
  - `storage_key String? @db.Text` ↔ `storage_key TEXT` (nullable) ✓
  - `media_mime String? @db.VarChar(120)` ↔ `media_mime VARCHAR(120)` (nullable) ✓
  - `created_at DateTime @default(now()) @db.Timestamptz(6)` ↔ `created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP` ✓
  - `archived_at DateTime? @db.Timestamptz(6)` ↔ `archived_at TIMESTAMPTZ(6)` (nullable) ✓
- `@@index([coach_id, created_at])` ↔ SQL composite index ✓
- `@@map("coach_exercises")` ✓
- Relation `CoachExerciseCoach` correctly paired: `User.coach_exercises_as_coach CoachExercise[]` ↔ `CoachExercise.coach User @relation("CoachExerciseCoach", fields:[coach_id], references:[id], onDelete: Restrict)`. `onDelete: Restrict` matches the SQL `ON DELETE RESTRICT`. ✓
- Append-only on `schema.prisma` (R71): both edits are additions (User back-relation + new model), no existing field altered. ✓
- `npx tsc --noEmit` produced **zero** type errors in `src/coach-exercise/**`. `prisma validate` failed only on a missing `DIRECT_URL` env var (datasource config), not on schema syntax — not a finding.

### `src/coach-exercise/coach-exercise-flag.guard.ts` — CLEAN
- **Per-request read, no boot-cache: CORRECT.** `resolveCustomExerciseFlag()` reads `process.env.FEATURE_CUSTOM_EXERCISE === 'true'` and is called **inside** `canActivate()` on every request — never captured at module construction. A runtime kill takes effect without redeploy, as specified.
- **Default OFF + fail-closed: CORRECT.** Any value other than the literal `'true'` resolves to `false`; when off, throws `HttpException(DISABLED_BODY, 503)` with body `{ error: 'service_unavailable', code: 'coach_exercise.disabled' }`. Matches the required 503 `coach_exercise.disabled` contract exactly. Fails closed (throws) rather than open.
- Mirrors the community voice-notes `resolveVoiceNotesFlag()` convention as documented.
- `@Injectable()` + `implements CanActivate` correct. `_context` unused param correctly underscore-prefixed.

### `src/coach-exercise/coach-exercise-upload.provider.ts` — CLEAN (security), P3 (F3)
- **TTL: CORRECT and clamped.** Default `COACH_EXERCISE_UPLOAD_TTL_SEC = 600` (10 min). `ttlSeconds()` clamps env override to `[60, 86400]`, guarding against a misconfigured forever/dead URL. `Number.isFinite` guard handles non-numeric env. Matches voice provider clamp `{min:60, max:24h}` verbatim.
- **Owner-binding / no cross-principal replay: CORRECT.** `buildObjectPath(ownerId, …)` namespaces every object under `${ownerId}/`, so a signed URL minted for one coach cannot be replayed against another's key. `deriveStorageKey` asserts the `${ownerId}/` prefix and falls back to a namespaced key if the URL shape is unexpected — never returns a key outside the owner's namespace. This is the QA P0-V1 ownership-prefix idiom carried from the voice provider.
- **Content-type allow-list: present (extension mapping).** `contentTypeToExt` whitelists `image/jpeg|png|webp`, `video/mp4|quicktime`; unknown → `'bin'`. The comment correctly notes the **caller** (B2) performs the up-front size + content-type rejection. NOTE: B1 itself does NOT enforce max-size or reject disallowed content-types — that validation lands in B2 (see forward-reference inventory). This is by design for a storage-layer-only PR; not a B1 finding.
- **No PII in object paths: CORRECT.** Path is `${ownerId}/${Date.now()}-${randomToken(8)}.${ext}` — owner UUID + timestamp + crypto-random hex token. No name/email/free-text. `randomToken` uses `crypto.randomBytes` (CSPRNG), preventing key-guessing.
- **Signed-download fail-soft: CORRECT.** `createSignedDownload` returns `null` (not 500) when storage is unconfigured or signing fails, so one bad key never blanks an entire library list. Matches voice provider. This is intentional silent-fail-with-log on a non-critical render path (aligns with 50-Failures #36 guidance: non-critical service calls fail soft with logging).
- **No forbidden double-cast.** Uses the named structural interface `SupabaseStorageWithSignedUpload` + a deliberate `typeof fn !== 'function'` runtime version-skew guard — exactly the R0-ban-compliant pattern preserved from `voice-upload.provider.ts` and documented in V3_3_PREFLIGHT §4. Error path throws `NotImplementedException` with a structured `COACH_EXERCISE_STORAGE_UNAVAILABLE` body.
- **F3 (P3):** `getPublicUrl` fallback synthesizes a `…/object/public/…` URL even for private buckets — advisory field only; the real read path is `createSignedDownload`. Same latent shape as the voice provider, so precedented; flagged so B2 does not persist/serve it for a private bucket.

### `src/coach-exercise/coach-exercise.module.ts` — CLEAN
- Wires exactly the three storage-layer building blocks: `CoachExerciseRepository`, `CoachExerciseEnabledGuard`, `CoachExerciseUploadProvider`. Exports `CoachExerciseRepository` + `CoachExerciseUploadProvider` so B2's service/controller can inject them.
- Imports only `AuthModule` (JwtAuthGuard/RolesGuard) — the standard coach-surface import. `SupabaseService` (from `@Global SupabaseModule`) and `PrismaService` (from `@Global PrismaModule`) need no explicit import — correct.
- No controller/service registered — correct for a B1 storage-layer slice. Module is dark at runtime: it registers DI providers but exposes no routes, so nothing is reachable until B2 adds the controller behind the guard.

### `src/app.module.ts` (+7) — CLEAN
- `import { CoachExerciseModule }` + registration in `imports[]`, grouped with the coach-toolset modules (next to `CoachMediaModule`/`ExerciseCatalogModule`). Single-line registration as documented. Comment correctly states the surface stays dark (503) until the flag flips. No ordering/circular-dependency risk (additive import).

### `src/coach-exercise/coach-exercise.repository.ts` — CLEAN, P3 (F5)
- **Signatures/types correct.** `create(seed: CoachExerciseSeed): Promise<CoachExercise>` and `listForCoach(coachId: string): Promise<CoachExercise[]>` — both `async`, both return the Prisma-typed `CoachExercise` import. `CoachExerciseSeed` interface maps camelCase → snake_case columns on insert correctly.
- **Tenant scoping correct.** `listForCoach` filters `where: { coach_id, archived_at: null }` — owner-scoped AND excludes soft-archived rows (matches the `archived_at` soft-retire semantics). `orderBy: [{created_at:'desc'},{id:'desc'}]` gives a deterministic most-recent-first order with a stable tiebreaker on `id` (good — prevents unstable pagination if B2 adds keyset).
- **Async correctness:** awaits the transaction; destructures `[created]`. No floating promises.
- **F5 (P3):** the single-element `$transaction([create])` is redundant atomicity scaffolding (documented as "call-site-consistent"). Harmless; acceptable as forward-consistency for B2.

---

## Stacked-PR Forward-Reference Inventory (B1 → B2 #428)

All of the following are **defined in B1 but unreferenced anywhere outside `src/coach-exercise/`** (verified by grep across `src/`). They are the storage-layer API that B2's service/controller will consume. None are reachable at runtime on `main` (no controller exists; the module only registers DI providers), so this is **not "feature flag always false" dead code in the 50-Failures #261 sense** — it is the lower half of a deliberately stacked chain, and the kill-switch guard + absent routes guarantee zero reachability until B2 lands.

| Symbol | File | Consumed by B2 for |
|--------|------|--------------------|
| `CoachExerciseRepository.create(seed)` | repository.ts | Durable insert after upload confirmation |
| `CoachExerciseRepository.listForCoach(coachId)` | repository.ts | GET /coach-exercises library list |
| `CoachExerciseSeed` (interface) | repository.ts | Service → repository insert payload |
| `CoachExerciseUploadProvider.createSignedUpload(ownerId, req)` | provider.ts | POST presign endpoint |
| `CoachExerciseUploadProvider.createSignedDownload(key, ttl?)` | provider.ts | Library render: signed read URLs |
| `CoachExerciseUploadProvider.deriveStorageKey(url, ownerId)` | provider.ts | Persist storage_key after upload |
| `CoachExerciseUploadProvider.buildObjectPath / contentTypeToExt / bucket / ttlSeconds` | provider.ts | Presign internals |
| `CoachExerciseEnabledGuard` / `resolveCustomExerciseFlag` / `FEATURE_CUSTOM_EXERCISE` | flag.guard.ts | Guard on every B2 route |
| `SignedMediaUploadRequest` / `SignedMediaUploadResponse` | provider.ts | B2 DTO ↔ provider contract |

**Forward-validation gap B2 MUST close (not a B1 finding, but flagged for the chain):** B1's presign provider explicitly delegates **max-size enforcement and content-type rejection to the caller** (`createSignedUpload` comment: "The caller validates size + content_type up-front"). B2's service/controller is therefore responsible for the size clamp and the content-type allow-list rejection BEFORE calling `createSignedUpload`. If B2 omits this, an unbounded/disallowed upload could be presigned. This is the single most important thing B2's audit must verify.

---

## Audit Dimension Summary

- **Security — PASS.** RLS complete & owner-scoped (all four verbs via `FOR ALL`), correctly using the canonical `app.current_user_id()` helper (not `auth.uid()`); flag guard is per-request, default-OFF, fail-closed 503; presign provider has clamped TTL, owner-namespaced paths (no replay, no PII), CSPRNG tokens, content-type→ext allow-list, fail-soft download. F3 (public-url fallback) is P3/advisory.
- **Correctness — PASS.** Full schema↔migration parity (all 9 columns, types, defaults, nullability, index); FK RESTRICT is correct & documented; append-only ordering correct (`…000001` after `…000000`); UUID/TEXT FK matches landed community precedent.
- **Contract — PASS.** Repository signatures typed & async-correct; deterministic ordering; archived-row exclusion; no floating promises. F5 (redundant single-stmt transaction) is P3.
- **Hygiene — DIRTY (P3).** Module wiring clean; Conventional Commits subject valid (`feat(coach): …`). F1 (wrong migration ts in commit body) and F2 (off-convention R3 author identity) are the P3 hygiene findings driving the DIRTY verdict.
- **Stacked-PR readiness — PASS.** All forward-references are legitimate B2 building blocks; zero runtime reachability on main (no routes, kill-switch present); no main-reachable dead code.

**Blocking?** No. P0=0, P1=0. P3-only ⇒ DIRTY but non-blocking under R109.
