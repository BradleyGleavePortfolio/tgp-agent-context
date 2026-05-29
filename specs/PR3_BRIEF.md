# PR-3 BUILD BRIEF — Additive Schema Migration (Packages & Drip-Feed foundation)

**Repo:** growth-project-backend (NestJS + Prisma). **Pillar 3. Type: BUILD (schema only, NO behavior change).**
**Branch:** `pr3/drip-schema-migration` off the default branch (which now includes the just-merged PR-2 transfer.failed fix — pull latest default first).

## GOAL
Add the data model foundation for the content-agnostic Packages & Drip-Feed engine. This PR is **purely additive schema + generated migration**. No service logic, no endpoints, no behavior change. Every existing package must keep behaving exactly as today (paywall-only, zero content rows) until later PRs attach content. This is the foundation the rest of the engine builds on.

## EXACT MODELS TO ADD (canonical, reconciled — use these names/fields verbatim unless a real conflict with existing schema forces a documented deviation)

1. `CoachPackage` gains ONE field: `is_sellable Boolean @default(false)`. Add the back-relation field for `CoachPackageContent` (e.g. `contents CoachPackageContent[]`). Do NOT change existing CoachPackage fields/behavior.

2. `CoachPackageContent` (authoring — what a coach attaches to a sellable package):
```
id String @id @default(uuid())
package_id String
package CoachPackage @relation(fields:[package_id], references:[id], onDelete: Cascade)
asset_type String   // workout_program | workout_plan | meal_plan | pdf | video | auto_message
asset_id String
asset_revision_id String?
display_order Int @default(0)
cadence_kind String @default("immediate") // immediate | relative_to_purchase | fixed_calendar | on_completion | on_milestone
cadence_payload Json
display_title String?
display_caption String?
created_at DateTime @default(now())
updated_at DateTime @updatedAt
removed_at DateTime?
@@index([package_id, removed_at, display_order])
@@index([asset_type, asset_id])
```

3. `ScheduledDrop` (runtime per-buyer schedule, snapshot-at-purchase):
```
id String @id @default(uuid())
client_purchase_id String
client_purchase ClientPurchase @relation(fields:[client_purchase_id], references:[id], onDelete: Cascade)
content_id String   // snapshot ref, NOT an FK (content can be soft-removed)
asset_type String
asset_id String
asset_revision_id String?
cadence_kind String
cadence_payload Json
display_title String?
display_caption String?
fire_at DateTime?
fired_at DateTime?
status String @default("pending") // pending|due|fired|skipped|failed|canceled
attempt_count Int @default(0)
materialised_ref String?
failure_reason String?
created_at DateTime @default(now())
updated_at DateTime @updatedAt
@@index([status, fire_at])
@@index([client_purchase_id, status])
@@unique([client_purchase_id, content_id])
```

4. `PurchaseFanout` (one row per purchase, fan-out bookkeeping):
```
id String @id @default(uuid())
purchase_id String @unique
purchase ClientPurchase @relation(fields:[purchase_id], references:[id], onDelete: Cascade)
state String @default("pending") // pending|in_progress|succeeded|failed
entrypoint String // in_app_hosted | in_app_ps | storefront_guest
started_at DateTime?
finished_at DateTime?
retry_count Int @default(0)
last_error String?
created_at DateTime @default(now())
```

5. `CoachMediaAsset` (coach-uploaded PDF/video):
```
id String @id @default(uuid())
coach_id String
coach User @relation("CoachMediaAssetCoach", fields:[coach_id], references:[id], onDelete: Cascade)
kind String // pdf | video
title String
description String?
storage_key String
provider String // supabase | mux
byte_size BigInt?
content_type String?
duration_sec Int?
page_count Int?
mux_playback_id String?
created_at DateTime @default(now())
archived_at DateTime?
@@index([coach_id, archived_at, kind])
```

6. `ClientAssetGrant` (per-(client,asset) entitlement for PDFs/videos):
```
id String @id @default(uuid())
client_id String
media_asset_id String
granted_via_drop_id String?
granted_at DateTime @default(now())
revoked_at DateTime?
@@unique([client_id, media_asset_id])
@@index([client_id, revoked_at])
```

## CRITICAL EXECUTION NOTES
- You MUST add the required **back-relation fields** on the counterpart models (`ClientPurchase` gets `scheduled_drops ScheduledDrop[]`, `fanout PurchaseFanout?`; `User` gets `media_assets CoachMediaAsset[] @relation("CoachMediaAssetCoach")`). Prisma will refuse to generate otherwise. Match the EXACT existing names/casing/conventions of `ClientPurchase` and `User` in this schema (inspect them first — the repo may use a specific naming/mapping convention, @@map, snake_case @map on fields, etc. — FOLLOW the repo's existing convention even if it differs from the snippets above; the snippets define the shape, the repo defines the style).
- Generate the migration with the repo's standard command (e.g. `npx prisma migrate dev --name drip_schema_foundation` or whatever the repo's migration workflow is — check package.json scripts and existing migration folder). The migration MUST be additive only: all new tables + one nullable/defaulted column on CoachPackage. It must NOT drop, rename, or alter any existing column, and must NOT require backfill.
- Run `npx prisma validate` and `npx prisma generate` — both must succeed.
- Confirm the generated SQL is additive-only by reading it (CREATE TABLE + ALTER TABLE ADD COLUMN ... DEFAULT false). If it contains any DROP/RENAME/ALTER-of-existing-column, STOP and fix the schema.
- Run the repo's typecheck/build (`tsc --noEmit` / `nest build`) — must pass with the regenerated client.

## SCOPE GUARDRAILS
- Schema + migration ONLY. No services, no controllers, no DTOs, no cron, no logic.
- Do NOT touch mobile.
- Keep `cadence_payload`/`cadence_kind` as plain Json/String here — zod validation comes in a later PR.

## COMMIT / PR RULES (STRICT)
- Commit identity: `git -c user.name='Dynasia G' -c user.email='dynasia@trygrowthproject.com' commit ...`. NO Co-Authored-By / Generated trailers.
- Branch `pr3/drip-schema-migration`, PR against default, report PR URL.
- PR description: list every model/field added, the generated migration filename, confirmation the SQL is additive-only (paste the key CREATE/ALTER lines), and validate/generate/build results.

## DELIVERABLE
Report: (a) PR URL, (b) models+fields added incl. back-relations, (c) migration filename + additive-only confirmation, (d) prisma validate/generate + build results, (e) any naming-convention deviations from the snippets and why. Write a copy to /home/user/workspace/specs/PR3_BUILD_REPORT.md.
