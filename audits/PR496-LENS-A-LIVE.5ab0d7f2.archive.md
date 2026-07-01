# PR #496 — LENS A (Round 1) LIVE AUDIT

**Repo:** BradleyGleavePortfolio/growth-project-backend
**Branch:** feat/importer-auth-extension
**Head SHA (local):** `5ab0d7f25f37a5c795482becd4d5fb8a95ca629b`
**Head SHA (gh pr view 496 headRefOid):** `5ab0d7f25f37a5c795482becd4d5fb8a95ca629b`  ✅ MATCH
**Base:** origin/main `2ad6ae91c9fa1293d639824b5b4e969fae35f42e` (= merge-base; linear)
**Lens A focus:** Security (R24–R36), performance/concurrency, data/infra, auth-specific.

## R11 LENS ISOLATION — CONFIRMED
- Never opened `/home/user/workspace/pr496_lensb_*`. Never `grep -r` in `/home/user/workspace/audit_workspace/`.
- All greps scoped to `/tmp/pr496_lensa_r1`. Independent evidence only.

---

## Check 1 — POST /api/auth/extension/login  ✅ CLEAN
- `@Public()` present, no `JwtAuthGuard`. ✅
- `@Throttle({ AUTH_LOGIN_PER_MIN: 5/60s })` — named throttler valid (throttler.config.ts:45). R91 ✅
- Reuses `LoginDto` (builder claim confirmed). ✅
- Audit write on BOTH success (`AuditAction.AUTH_LOGIN`, `metadata.source='extension'`) and failure (`reason:'invalid_credentials'`, redacted). R107 ✅
- No password logged anywhere (grep of all logger calls clean). R30 ✅
- Side-channel: wrong-email and wrong-password BOTH throw identical `UnauthorizedException('Invalid email or password')`. No user-existence leak. ✅
- Delegates to shared `_passwordLogin(...,'extension')` — no drift with `login`. ✅
- NOTE (P3): `LoginDto.password` has `@IsString()` but NO `@MaxLength`. Task check 1 asked to verify `@MaxLength` bounds on the reused DTO. `email` is `@IsEmail()` (bounded); `password` is unbounded length. Pre-existing on `LoginDto` (not introduced by this PR). Low-severity DoS surface (very large password body) but the endpoint is IP-throttled 5/min and Supabase enforces its own bound. P3 observation.

## Check 2 — POST /api/auth/extension/refresh  ✅ CLEAN
- `@Public()`, `@Throttle({ AUTH_LOGIN_PER_MIN: 30/60s })`. R91 ✅
- `ExtensionRefreshDto.refresh_token`: `@IsString @MinLength(1) @MaxLength(4096)`. Matches spec. R31 ✅
- Structured 401: `throw new UnauthorizedException({ code:'extension_refresh_invalid', message:'refresh token invalid or expired' })`. Has code+message. ✅
- No refresh_token persisted to any backend store — pure proxy of Supabase `refreshSession`, returns rotated pair verbatim. R30 ✅
- Error log `logger.warn` logs `error?.message` only, NEVER the token. ✅
- NOTE (P3): refresh shares the SAME named throttler key `AUTH_LOGIN_PER_MIN` as login but with a different limit (30 vs 5). NestJS throttler keys the counter by (throttler-name + route path), so buckets do NOT collide across routes. Verified not a shared-counter bug. No finding.

## Check 3 — Signup `ref` field + migration  ✅ CLEAN
- `RegisterDto.ref` & `SignupWithCodeDto.ref`: `@IsOptional @IsString @MaxLength(64) @Matches(/^[a-z0-9_-]+$/)`. Matches spec exactly. R31 ✅
- `register()` persists `signup_ref: data.ref ?? null`. ✅
- `signupWithCode()` forwards `ref: data.ref` into `register()`. ✅
- `prisma/schema.prisma`: `signup_ref String?` (nullable). ✅
- Migration at `prisma/migrations/20261221010000_add_signup_ref_to_user/migration.sql` = `ALTER TABLE "User" ADD COLUMN "signup_ref" TEXT;` — additive, no rename/drop. R82 ✅
- `down.sql` present = `ALTER TABLE "User" DROP COLUMN IF EXISTS "signup_ref";`. R82/R106 ✅
- Migration timestamp (Dec 2026) sorts AFTER the latest existing migration `20261221000000_enable_pg_stat_statements` — consistent with the repo's (ahead-of-wallclock) migration timeline. Not a finding.

## Check 4 — Fixture bleed  ✅ CLEAN
- 5 touched files all TEST fixtures/specs (`src/**/__tests__/*`, `test/**/*`), no prod code.
- Each addition is exactly `signup_ref: null` for tsc satisfaction (User type now requires it). Remaining diff lines are Prettier reformatting only, no behavior change. ✅

## Check 5 — Banned casts  ✅ 0
- `git diff origin/main...HEAD -- 'src/**/*.ts' 'test/**/*.ts' | grep added | grep -Ec 'as any|as unknown as|as never|@ts-ignore|@ts-nocheck|<any>'` = **0**. R75 ✅

## Check 6 — LOC accounting  ✅ under cap
- Task-verbatim formula (src/ + prisma/schema): net_prod = **64**.
- TRUE prod LOC (excluding `__tests__`/`.spec`): **90** (schema +3, controller +23, dto +26, service +38).
- Builder claimed 103. Actual ≤103 either way. Well under R76 cap (400). ✅
- Test LOC: new `test/auth/extension-auth.spec.ts` +372; spec churn -23 net. Large test surface.

## Check 7 — R3 commit sweep  ✅ CLEAN
All 5 commits `origin/main..HEAD`:
- `5ab0d7f2` test(auth): extension auth + signup ref coverage
- `3bacea65` feat(auth): /auth/extension/login + /auth/extension/refresh routes
- `fc78dbb4` feat(auth): extension login/refresh proxying Supabase + signup_ref persistence
- `5d132c71` feat(auth): add ref field to signup DTOs + ExtensionRefreshDto
- `d50ead62` chore(schema): add User.signup_ref for signup attribution

Every commit: author = committer = `Bradley Gleave <bradley@bradleytgpcoaching.com>` (name + email both match). R3 ✅
Forbidden-token sweep of all commit messages/trailers: NONE (no claude/copilot/co-authored-by/agent/computer/assistant/generated-by). ✅

## Check 8 — Test execution  ✅ ALL GREEN
- `npm ci` completed; Prisma client generated and aware of `signup_ref` (663 refs). ✅
- `npx jest src/auth test/auth --runInBand --testTimeout=30000` → **Test Suites: 10 passed / 10; Tests: 91 passed / 91**. New `test/auth/extension-auth.spec.ts` PASS (17 new `it()` cases — matches builder claim). ✅
- `npx tsc --noEmit` → **exit 0**, no type errors. ✅
- Runtime log inspection during tests: `extension refresh rejected: token expired` / `no session returned` — confirms R30 redaction holds at runtime (no token/password in logs). ✅
- R109: no stubs / silent catches / "Coming soon" in added prod code. ✅

## Metrics reconciliation
- Head SHA verified BOTH ways = `5ab0d7f25f37a5c795482becd4d5fb8a95ca629b` ✅
- Net prod LOC: task-formula 64; true (excl tests) **90** — builder claimed 103; both ≤ R76 cap 400. ✅
- test:src ratio: builder's **3.30** reconciles as 372 new test LOC / ~113 prod-src added LOC (3.29). ✅ (R74 is Lens B's gate; recorded here.)
- Banned-cast net additions: **0** (R75). ✅
- 17 new tests confirmed; 91 total pass.

## Severity counts
- P0: 0
- P1: 0
- P2: 0
- P3: 2 (both pre-existing / low-risk observations, NOT introduced-defects):
  1. `LoginDto.password` lacks `@MaxLength` (unbounded length) — pre-existing on the reused DTO; mitigated by IP throttle + Supabase-side bound. Task check 1 flagged verifying `@MaxLength` bounds; email is bounded, password is not.
  2. Refresh endpoint reuses the `AUTH_LOGIN_PER_MIN` named throttler with a distinct 30/min limit — verified NestJS keys throttle counters per (name+route), so no cross-route bucket collision. Documented for clarity; not a defect.

## R11 LENS ISOLATION — FINAL CONFIRMATION
No Lens B file opened; no `pr496_lensb_*`; no `grep -r` in `audit_workspace/`. All evidence independent, scoped to `/tmp/pr496_lensa_r1`.

---
VERDICT: FINDINGS

(Two P3 observations only — no P0/P1/P2. Both are low-risk/pre-existing; per R31/R33 the auditor records them so a fixer closes P0–P3 inclusive. Core deliverables — public+throttled endpoints, structured 401, DTO validation, additive+reversible migration, no token/password leakage, R3 identity, 0 banned casts, 91 green tests, tsc 0 — all pass.)
