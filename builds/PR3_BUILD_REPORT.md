# PR-3 Build Report — Packages & Drip-Feed schema foundation

## (a) PR URL
https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/314

Branch: `pr3/drip-schema-migration` (off latest `main`, which already includes the just-merged PR-2 `transfer.failed` fix #313).

## (b) Models + fields added (incl. back-relations)

### Modified
- `CoachPackage`
  - **NEW field:** `is_sellable Boolean @default(false)`
  - **NEW back-relation:** `contents CoachPackageContent[]`
- `ClientPurchase`
  - **NEW back-relations:** `scheduled_drops ScheduledDrop[]`, `fanout PurchaseFanout?`
- `User`
  - **NEW back-relation:** `media_assets CoachMediaAsset[] @relation("CoachMediaAssetCoach")`

### New models (verbatim per brief)

1. **`CoachPackageContent`** — authoring; what a coach attaches to a sellable package
   - `id String @id @default(uuid())`
   - `package_id String`, `package CoachPackage @relation(..., onDelete: Cascade)`
   - `asset_type String` (workout_program | workout_plan | meal_plan | pdf | video | auto_message)
   - `asset_id String`, `asset_revision_id String?`
   - `display_order Int @default(0)`
   - `cadence_kind String @default("immediate")`, `cadence_payload Json`
   - `display_title String?`, `display_caption String?`
   - `created_at DateTime @default(now())`, `updated_at DateTime @updatedAt`, `removed_at DateTime?`
   - `@@index([package_id, removed_at, display_order])`, `@@index([asset_type, asset_id])`

2. **`ScheduledDrop`** — runtime per-buyer schedule, snapshot-at-purchase
   - `id String @id @default(uuid())`
   - `client_purchase_id String`, `client_purchase ClientPurchase @relation(..., onDelete: Cascade)`
   - `content_id String` (snapshot ref, **NOT an FK**)
   - `asset_type String`, `asset_id String`, `asset_revision_id String?`
   - `cadence_kind String`, `cadence_payload Json`
   - `display_title String?`, `display_caption String?`
   - `fire_at DateTime?`, `fired_at DateTime?`
   - `status String @default("pending")` (pending|due|fired|skipped|failed|canceled)
   - `attempt_count Int @default(0)`, `materialised_ref String?`, `failure_reason String?`
   - `created_at`, `updated_at`
   - `@@unique([client_purchase_id, content_id])`, `@@index([status, fire_at])`, `@@index([client_purchase_id, status])`

3. **`PurchaseFanout`** — one row per purchase, bookkeeping
   - `id String @id @default(uuid())`
   - `purchase_id String @unique`, `purchase ClientPurchase @relation(..., onDelete: Cascade)`
   - `state String @default("pending")` (pending|in_progress|succeeded|failed)
   - `entrypoint String` (in_app_hosted | in_app_ps | storefront_guest)
   - `started_at DateTime?`, `finished_at DateTime?`
   - `retry_count Int @default(0)`, `last_error String?`
   - `created_at DateTime @default(now())`

4. **`CoachMediaAsset`** — coach-uploaded PDF/video
   - `id String @id @default(uuid())`
   - `coach_id String`, `coach User @relation("CoachMediaAssetCoach", ..., onDelete: Cascade)`
   - `kind String` (pdf|video), `title String`, `description String?`
   - `storage_key String`, `provider String` (supabase|mux)
   - `byte_size BigInt?`, `content_type String?`, `duration_sec Int?`, `page_count Int?`, `mux_playback_id String?`
   - `created_at`, `archived_at DateTime?`
   - `@@index([coach_id, archived_at, kind])`

5. **`ClientAssetGrant`** — per-(client, asset) entitlement for PDFs/videos
   - `id String @id @default(uuid())`
   - `client_id String`, `media_asset_id String`, `granted_via_drop_id String?`
   - `granted_at DateTime @default(now())`, `revoked_at DateTime?`
   - `@@unique([client_id, media_asset_id])`, `@@index([client_id, revoked_at])`
   - No relation FKs per brief — `media_asset_id` / `client_id` stay as soft refs so the grant survives if a media asset is hard-deleted.

(That's 5 models in the brief — the brief title says "6 new models" but the canonical list (§9, items 2–6) is 5 new + 1 modified `CoachPackage`. All 5 new tables created; the modified CoachPackage gets the new `is_sellable` column + back-relation. Total CREATE TABLE count in the migration: 5, which matches.)

## (c) Migration filename + additive-only confirmation

**Filename:** `prisma/migrations/20261202000000_pr3_drip_schema_foundation/migration.sql`

**Additive-only:** Verified by `grep -E "DROP|RENAME|ALTER COLUMN|DROP COLUMN"` — only matches a comment line in the file header; no actual destructive SQL. The only `ALTER TABLE` against an existing table is the single `ADD COLUMN` line below.

**Key SQL excerpts:**

```sql
-- AlterTable
ALTER TABLE "CoachPackage" ADD COLUMN     "is_sellable" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "CoachPackageContent" ( ... CONSTRAINT "CoachPackageContent_pkey" PRIMARY KEY ("id") );
CREATE TABLE "ScheduledDrop"       ( ... CONSTRAINT "ScheduledDrop_pkey"       PRIMARY KEY ("id") );
CREATE TABLE "PurchaseFanout"      ( ... CONSTRAINT "PurchaseFanout_pkey"      PRIMARY KEY ("id") );
CREATE TABLE "CoachMediaAsset"     ( ... CONSTRAINT "CoachMediaAsset_pkey"     PRIMARY KEY ("id") );
CREATE TABLE "ClientAssetGrant"    ( ... CONSTRAINT "ClientAssetGrant_pkey"    PRIMARY KEY ("id") );

-- AddForeignKey
ALTER TABLE "CoachPackageContent"  ADD CONSTRAINT "..._package_id_fkey"        FOREIGN KEY ("package_id")         REFERENCES "CoachPackage"("id")   ON DELETE CASCADE;
ALTER TABLE "ScheduledDrop"        ADD CONSTRAINT "..._client_purchase_id_fkey" FOREIGN KEY ("client_purchase_id") REFERENCES "ClientPurchase"("id") ON DELETE CASCADE;
ALTER TABLE "PurchaseFanout"       ADD CONSTRAINT "..._purchase_id_fkey"        FOREIGN KEY ("purchase_id")        REFERENCES "ClientPurchase"("id") ON DELETE CASCADE;
ALTER TABLE "CoachMediaAsset"      ADD CONSTRAINT "..._coach_id_fkey"           FOREIGN KEY ("coach_id")           REFERENCES "User"("id")           ON DELETE CASCADE;
```

No DROP, no RENAME, no ALTER-of-existing-column. The single `ADD COLUMN ... NOT NULL DEFAULT false` is safe on a live table — Postgres applies the default to existing rows in O(1) (metadata-only in PG 11+).

## (d) prisma validate / generate / build results

- **`prisma validate` (6.19.3)** → ✅ `The schema at prisma/schema.prisma is valid 🚀`
- **`prisma generate` (6.19.3)** → ✅ `Generated Prisma Client (v6.19.3) to ./node_modules/@prisma/client`
- **`npx tsc --noEmit`** → ✅ clean (no output, exit 0)
- **`npx nest build`** → ✅ clean (no output, exit 0, `dist/` populated with all modules)

## (e) Naming-convention deviations + why

**None.** Followed the repo's existing conventions:
- Pascal-cased model names directly (no `@@map`) — matches every table added since 2026-04 (e.g. `CoachNudge`, `MealPlan`, `CommunityWin`, `WorkoutPlan`, `CoachLandingPage`, `AICallLog`).
- snake_case field names without `@map` — matches the entire `CoachPackage` / `ClientPurchase` / `User` style.
- `@default(uuid())` for primary keys, `@default(now())` for timestamps, `@updatedAt` for `updated_at`, Cascade FKs — all match `CoachPackage` / `ClientPurchase` / `CoachNudge`.
- Named relations (`@relation("CoachMediaAssetCoach", ...)`) only where there's ambiguity — matches the User-relation pattern (`CoachPackageCoach`, `ClientPurchaseClient`, etc.).
- The four legacy `@@map`-using tables (`water_logs`, `data_export_request`, `secret_rotation_log`, `recent_auth_nonce`) are documented exceptions; new tables since then do NOT use `@@map`. Continued that convention.

The only field-name nudge worth flagging: the brief writes `package CoachPackage @relation(fields:[package_id], references:[id], onDelete: Cascade)` inline; this repo splits long Prisma relation declarations across the existing line-width budget without altering semantics. No deviation in field names, types, defaults, or onDelete behavior.

## Commit identity
`git -c user.name='Dynasia G' -c user.email='dynasia@trygrowthproject.com' commit ...` — no Co-Authored-By / Generated trailers (verified: `git log -1 --format='%an <%ae>%n%n%B' HEAD` shows clean trailer-free commit).
