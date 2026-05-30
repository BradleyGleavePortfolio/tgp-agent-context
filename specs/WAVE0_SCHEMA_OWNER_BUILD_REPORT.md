# WAVE-0 SCHEMA-OWNER — BUILD REPORT

**Builder record (not a verdict).** An independent GPT-5.5 auditor re-checks at the final SHA before merge.

- **Repo:** `growth-project-backend`
- **Branch:** `issues/wave0-schema-ai-quota-ltv-peak`
- **Base:** `origin/main` @ `0b2fe65` (latest pre-existing migration `20261209000000_pr17_scheduled_drop_push_seq`)
- **Final branch HEAD SHA:** `cf86c4fb608a7b60b5bbe92cef3d6aedee315298`
- **PR:** **#331** → base `main`, title `Wave0: add UserAIQuota + coach_ltv_peak tables (A1, LTV-3 schema)`
- **Worktree:** `/home/user/workspace/wt-wave0-schema` (isolated; no other worktree or canonical checkout touched)

## Scope delivered
Schema + migration ONLY. No application logic. Two new models landed in ONE additive migration so the downstream A1-logic and LTV-3-logic agents can run in parallel without colliding on `prisma/schema.prisma` or migration ordering. Files changed: `prisma/schema.prisma` (+2 models, +2 inverse relations on `User`) and one new migration. `2 files changed, 129 insertions(+)`. No existing tables altered.

## Model 1 — `UserAIQuota` (issue A1)
Prisma model name `UserAIQuota`; table name `UserAIQuota` (no `@@map` — repo PascalCase models without snake-case tables keep their name, consistent with e.g. `WorkoutBuilderIdempotencyKey`). Purpose: per-user DAILY AI token quota (persisted daily token counter; today only a 20/hr per-IP throttle exists).

```prisma
model UserAIQuota {
  id            String   @id @default(uuid())
  user_id       String
  user          User     @relation("UserAIQuotaUser", fields: [user_id], references: [id], onDelete: Cascade)
  quota_date    DateTime @db.Date
  tokens_used   Int      @default(0)
  request_count Int      @default(0)
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt

  @@unique([user_id, quota_date], name: "UserAIQuota_user_id_quota_date_key")
  @@index([user_id])
  @@index([quota_date])
}
```

- ID convention: `String @id @default(uuid())` (matches repo).
- FK → `User` with `onDelete: Cascade` (matches per-user ledgers like `WorkoutBuilderIdempotencyKey`).
- `quota_date DateTime @db.Date` = UTC day bucket (repo DATE convention `@db.Date`).
- `@@unique([user_id, quota_date])` → exactly one row per user per day, enabling the A1-logic agent's atomic upsert-increment.
- FK indexed (`@@index([user_id])`), plus `@@index([quota_date])`.

## Model 2 — `CoachLtvPeak` (issue LTV-3)
Prisma model name `CoachLtvPeak`; mapped to table `coach_ltv_peak` via `@@map`. Purpose: persist `zero_churn_streak` + `all_time_peak_rpcm` per coach so they don't regress month-over-month (currently recomputed-not-persisted at `ltv-metrics.service.ts:279-294`, where inline TODOs explicitly ask for this table).

```prisma
model CoachLtvPeak {
  id                 String   @id @default(uuid())
  coach_id           String   @unique
  coach              User     @relation("CoachLtvPeakCoach", fields: [coach_id], references: [id], onDelete: Cascade)
  zero_churn_streak  Int      @default(0)
  all_time_peak_rpcm Decimal  @default(0) @db.Decimal(20, 6)
  updated_at         DateTime @updatedAt

  @@map("coach_ltv_peak")
}
```

- **Coach scoping:** `coach_id` is a `User.id` FK with `onDelete: Cascade` — IDENTICAL to how `CoachEffectivenessScore` (`schema.prisma:1636`) scopes its coach (`coach_id String` + `coach User @relation(..., references: [id], onDelete: Cascade)`), and matches how `LtvMetricsService.getMetrics(coachUserId)` identifies a coach by a `User` row (`ClientPurchase.coach_user_id` → `User.id`).
- **1:1 per coach:** `coach_id @unique`, mirroring the `CoachBriefPreferences` / `CoachOnboardingProgress` 1:1 metric-table pattern.
- **`all_time_peak_rpcm` type decision:** `Decimal @db.Decimal(20, 6)`. The repo's only Decimal money/measure columns use `@db.Decimal(20, 6)`, so this matches the repo Decimal convention as the brief directs. RPCM in the service is computed in integer **cents** (`rpcmCents`, `all_time_peak_rpcm_cents`); a `DECIMAL(20,6)` stores that cent value losslessly and leaves headroom for sub-cent precision. The LTV-3-logic agent reads/writes the cent value here.
- Inverse relation `User.ltv_peak` added.

## Inverse relations added on `User` (model at `schema.prisma:154`)
```prisma
ai_quotas UserAIQuota[] @relation("UserAIQuotaUser")
ltv_peak  CoachLtvPeak? @relation("CoachLtvPeakCoach")
```
Named relations + `onDelete` on the FK side match existing User-owned model conventions.

## Migration
- **Folder:** `prisma/migrations/20261210000000_pr_wave0_ai_quota_ltv_peak/migration.sql` — sorts AFTER `20261209000000_pr17_scheduled_drop_push_seq`.
- **Generation:** non-destructive, DB-free, via `prisma migrate diff --from-schema-datamodel <base schema @ HEAD> --to-schema-datamodel prisma/schema.prisma --script` (no DB reset). Verified PURELY ADDITIVE: 2 `CREATE TABLE` + 4 indexes (2 plain FK indexes, 2 unique) + 2 FKs. No `DROP`, no `ALTER` on any existing table, no data backfill.

### CREATE TABLE / index / FK SQL (verbatim)
```sql
-- CreateTable
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

-- CreateTable
CREATE TABLE "coach_ltv_peak" (
    "id" TEXT NOT NULL,
    "coach_id" TEXT NOT NULL,
    "zero_churn_streak" INTEGER NOT NULL DEFAULT 0,
    "all_time_peak_rpcm" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coach_ltv_peak_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserAIQuota_user_id_idx" ON "UserAIQuota"("user_id");

-- CreateIndex
CREATE INDEX "UserAIQuota_quota_date_idx" ON "UserAIQuota"("quota_date");

-- CreateIndex
CREATE UNIQUE INDEX "UserAIQuota_user_id_quota_date_key" ON "UserAIQuota"("user_id", "quota_date");

-- CreateIndex
CREATE UNIQUE INDEX "coach_ltv_peak_coach_id_key" ON "coach_ltv_peak"("coach_id");

-- AddForeignKey
ALTER TABLE "UserAIQuota" ADD CONSTRAINT "UserAIQuota_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_ltv_peak" ADD CONSTRAINT "coach_ltv_peak_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

## Verification (actual results)
| Check | Command | Result |
|---|---|---|
| Schema valid | `npx prisma validate` | ✅ valid |
| Client generates | `npx prisma generate` | ✅ exit 0 |
| Type-check | `npx tsc --noEmit` | ✅ 0 errors |
| Lint | `npm run lint` | ✅ exit 0 — 0 errors, 17 pre-existing warnings, **none in touched files** (touched only `schema.prisma`, not linted by `eslint "src/**/*.ts"`) |
| Build | `npm run build` (`nest build`) | ✅ exit 0 |

Notes:
- `npm ci --no-audit --no-fund` was run (node_modules was missing); `postinstall` ran `prisma generate` successfully.
- `prisma validate` requires `DATABASE_URL`/`DIRECT_URL` env to be set (placeholder values used; no connection made) — the only "validation error" before setting them was the missing-env P1012, not a schema error.
- No dedicated migration-drift / schema-snapshot test exists in the repo; CI (`.github/workflows/ci.yml`) runs generate + lint + tsc + build + test, all covered here. `npm test` not run separately (no schema-snapshot suite; tsc + build cover client-type compilation).

## Cadence / identity
- Commit author R4 STRICT: `Dynasia G <dynasia@trygrowthproject.com>`, NO trailers, NO co-author lines (committed via `git -c user.name=... -c user.email=... commit`). Verified author == committer == `Dynasia G <dynasia@trygrowthproject.com>`, no `Co-authored-by`/`Signed-off-by`.
- Branch pushed to origin; PR #331 opened.

## Summary for parent
- **Final branch HEAD SHA:** `cf86c4fb608a7b60b5bbe92cef3d6aedee315298`
- **PR number:** #331
- **Models / tables:** `UserAIQuota` → table `UserAIQuota` (no `@@map`); `CoachLtvPeak` → table `coach_ltv_peak` (`@@map`)
- **Migration folder:** `20261210000000_pr_wave0_ai_quota_ltv_peak`
- **Verification:** validate ✅ · generate ✅ exit 0 · tsc ✅ 0 errors · lint ✅ 0 errors (17 pre-existing warnings, none in touched files) · build ✅ exit 0
