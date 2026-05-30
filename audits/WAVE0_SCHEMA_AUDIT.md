# AUDIT — Wave-0 schema: UserAIQuota + coach_ltv_peak (PR #331)
VERDICT: CLEAN
Typecheck: pass (`npx tsc --noEmit`, exit 0)
Lint: pass (`npm run lint`, exit 0; 17 pre-existing warnings, 0 errors)
Tests: not run (no Wave-0-specific test found; schema-only PR, requested gates below)
Prisma validate: pass (`npx prisma validate`, exit 0 with `DATABASE_URL`/`DIRECT_URL` set; without env Prisma fails P1012 because `DIRECT_URL` is required by schema.prisma)
Prisma generate: pass (`npx prisma generate`, exit 0)
Build: pass (`npm run build`, exit 0)
Install: pass (`npm ci --no-audit --no-fund` in `/home/user/workspace/audit-wave0-schema`, installed 1011 packages and postinstall generated Prisma client)

## P0 findings
- None.

## P1 findings
- None.

## P2 findings
- None.

## P3 (non-blocking)
- [prisma/migrations/20261210000000_pr_wave0_ai_quota_ltv_peak/migration.sql:57] `git diff --check 0b2fe65` reports a new blank line at EOF. This is whitespace-only and does not affect migration behavior.

## Verification of PR claims
- Audited exact SHA `cf86c4fb608a7b60b5bbe92cef3d6aedee315298`.
- Additive-only scope verified: `git diff 0b2fe65 --stat` shows changes only in `prisma/schema.prisma` and one new migration folder/file, `prisma/migrations/20261210000000_pr_wave0_ai_quota_ltv_peak/migration.sql`.
- No service/controller/resolver logic was touched: `git diff --name-status 0b2fe65` shows only `A prisma/migrations/20261210000000_pr_wave0_ai_quota_ltv_peak/migration.sql` and `M prisma/schema.prisma`.
- Migration ordering verified: sorted migration folders end with `20261209000000_pr17_scheduled_drop_push_seq` followed by `20261210000000_pr_wave0_ai_quota_ltv_peak`, so the new migration sorts after the prior latest migration.
- Migration is additive-only: SQL contains exactly two `CREATE TABLE` statements, four `CREATE INDEX`/`CREATE UNIQUE INDEX` statements, and two FK `ALTER TABLE ... ADD CONSTRAINT` statements against the new tables only; no `DROP`, `TRUNCATE`, `DELETE`, `UPDATE`, `INSERT`, `ALTER COLUMN`, `RENAME`, or data backfill was present.
- `UserAIQuota` schema verified at `prisma/schema.prisma:4891-4904`: `user_id` FK to `User` with `onDelete: Cascade`, `quota_date DateTime @db.Date`, `tokens_used Int @default(0)`, `request_count Int @default(0)`, and `@@unique([user_id, quota_date], name: "UserAIQuota_user_id_quota_date_key")` for daily atomic upsert semantics.
- `CoachLtvPeak` schema verified at `prisma/schema.prisma:4925-4934`: `@@map("coach_ltv_peak")`, `coach_id String @unique`, FK to `User` with `onDelete: Cascade`, `zero_churn_streak Int @default(0)`, and `all_time_peak_rpcm Decimal @default(0) @db.Decimal(20, 6)`.
- Coach scoping is consistent: `CoachEffectivenessScore` uses `coach_id String` with `User` relation at `prisma/schema.prisma:1644-1654`, and `LtvMetricsService.getMetrics(coachUserId)` queries `ClientPurchase` by `coach_user_id: coachUserId` at `src/coach/command-center/ltv-metrics.service.ts:70-82`, so the persisted LTV peak key is the coach `User.id`, not a separate coach profile key.
- Inverse `User` relation names do not collide: `ai_quotas UserAIQuota[] @relation("UserAIQuotaUser")` and `ltv_peak CoachLtvPeak? @relation("CoachLtvPeakCoach")` were added at `prisma/schema.prisma:426-432`, and `npx prisma validate` passed.
- Migration SQL matches the new schema models: table names, FK column names, defaults, uniqueness, indexes, and decimal/date column types line up with the `UserAIQuota` and `CoachLtvPeak` Prisma definitions.

## CREATE TABLE SQL excerpt
```sql
CREATE TABLE "UserAIQuota" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "quota_date" DATE NOT NULL,
    "tokens_used" INTEGER NOT NULL DEFAULT 0,
    "request_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAIQuota_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "coach_ltv_peak" (
    "id" TEXT NOT NULL,
    "coach_id" TEXT NOT NULL,
    "zero_churn_streak" INTEGER NOT NULL DEFAULT 0,
    "all_time_peak_rpcm" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coach_ltv_peak_pkey" PRIMARY KEY ("id")
);
```

## Gate output summary
- `npx prisma validate`: exit 0, `The schema at prisma/schema.prisma is valid`.
- `npx prisma generate`: exit 0, generated Prisma Client v6.19.3 to `./node_modules/@prisma/client`.
- `npx tsc --noEmit`: exit 0.
- `npm run lint`: exit 0, 17 warnings / 0 errors, none in touched files.
- `npm run build`: exit 0.
