# PR #496 — LENS A LIVE AUDIT (Round 2)

**Scope:** Security / Auth / Performance / Data-Infra (R24–R36 + auth-specific)
**PR:** `feat(auth): importer extension login + refresh + signup ref attribution [IMPORTER-A]`
**Repo:** `BradleyGleavePortfolio/growth-project-backend`  **Branch:** `feat/importer-auth-extension`

## SHA verification (R124 — both ways)

| source | value | match |
| --- | --- | --- |
| local `git rev-parse HEAD` | `e345cc488ab829ab702bfcebebab0e6bbddf25e6` | ✅ |
| `gh pr view 496 --json headRefOid` | `e345cc488ab829ab702bfcebebab0e6bbddf25e6` | ✅ |
| base `origin/main` | `2ad6ae91c9fa1293d639824b5b4e969fae35f42e` | ✅ (expected) |

Sandbox: fresh clone at `/tmp/pr496_lensa_r2/growth-project-backend` (no round-1 checkout reused).

## R11 lens-isolation log

Confirmed: did NOT open, read, list, or grep any Lens B workspace or file — no access to
`/home/user/workspace/pr496_lensb_*`, no access to `/home/user/workspace/audit_workspace/`,
no `LENS-B` files under the context clone. This audit was produced solely from the PR diff,
production source, migration, and test-run output on the current HEAD. No cross-lens material
was consulted.

## Round-2 delta reviewed

`5ab0d7f2 → e345cc48`: test-only. 4 new `it()` cases added to `test/auth/extension-auth.spec.ts`
(too-long `ref`, uppercase `ref`, invalid `ExtensionRefreshDto` → 400 via global ValidationPipe,
plus a valid-DTO positive control). Zero production-code changes this round. Full independent
re-audit of all Lens A gates on the current HEAD performed below — not limited to the delta.

---

## Check 1 — Security (R24–R36 + auth)

### 1a. `/api/auth/extension/login` (controller L94-112, service L174-275)
- `@Public()` present; no `JwtAuthGuard`. ✅
- `@Throttle({ AUTH_LOGIN_PER_MIN: { ttl 60000, limit 5 } })`, `@HttpCode(200)`. ✅
- Body typed `LoginDto` (email `@IsEmail`, password `@IsString`) → ValidationPipe enforced. ✅
- Delegates to shared `_passwordLogin(..., 'extension')`; `login` and `extensionLogin` cannot
  drift (single implementation). ✅
- **No user-existence leak:** every Supabase auth error maps to the single generic
  `UnauthorizedException('Invalid email or password')` (the only other branch is the
  email-not-confirmed message, reachable identically for any account). Wrong-email and
  wrong-password are indistinguishable to the caller. ✅
- **No password logged (R30):** failure audit metadata is `{ reason:'invalid_credentials', source:'extension' }`
  only; the password and full provider error string are never persisted or logged. Verified the
  fire-and-forget audit path (service L209-227). ✅
- Success audit written with `metadata.via='email_password', source='extension'`; failure audit
  written with `source='extension'`. ✅
- Controller does **NOT** call `resetLoginCounters` for the extension route (contrast `login`
  L90) — per-IP reset deliberately withheld. ✅

### 1b. `/api/auth/extension/refresh` (controller L114-130, service L282-300)
- `@Public()`, `@Throttle({ AUTH_LOGIN_PER_MIN: { ttl 60000, limit 30 } })`, `@HttpCode(200)`. ✅
- `ExtensionRefreshDto.refresh_token`: `@IsString @MinLength(1) @MaxLength(4096)`. ✅
- Pure Supabase proxy: `supabaseAdmin.auth.refreshSession({ refresh_token })`; returns rotated
  `access_token/refresh_token/expires_in/expires_at` verbatim. ✅
- **No refresh token persisted** anywhere on the backend — no Prisma write in the path. ✅
- **Token never logged (R30):** on failure logs only `error?.message ?? 'no session returned'`. ✅
- Structured 401 `{ code:'extension_refresh_invalid', message:'refresh token invalid or expired' }`
  on any error OR missing session (R109 — real, actionable, no silent failure). ✅

### 1c. Signup `ref` attribution
- `RegisterDto.ref` and `SignupWithCodeDto.ref`: `@IsOptional @IsString @MaxLength(64) @Matches(/^[a-z0-9_-]+$/)`. ✅
- Persisted as `signup_ref: data.ref ?? null` (service L138); `signupWithCode` forwards `ref`
  into `register` (L859). ✅
- The regex forbids uppercase, whitespace, and symbols; `@MaxLength(64)` caps length; a present
  empty string fails `@Matches` (`+` quantifier). No injection surface — value is a scalar
  attribution string, never interpolated into a query. ✅

**Check 1 result: PASS — no new findings.**

## Check 2 — Migration (R82)
- `prisma/migrations/20261221010000_add_signup_ref_to_user/migration.sql`: single
  `ALTER TABLE "User" ADD COLUMN "signup_ref" TEXT;` — additive, nullable, no default, no backfill. ✅
- Companion `down.sql`: `ALTER TABLE "User" DROP COLUMN IF EXISTS "signup_ref";` — reversible,
  idempotent. ✅
- No rename, no drop of existing columns, no data-loss risk; expand-phase / backwards-compatible. ✅
- `prisma/migrations/migration_lock.toml` unchanged. ✅
- `schema.prisma`: `signup_ref String?` added to `model User`, consistent with the migration. ✅

**Check 2 result: PASS.**

## Check 3 — Fixture bleed
All `signup_ref: null` fixture additions land only in test paths:
`src/community/voice/__tests__/test-user.factory.ts`,
`src/talent-marketplace/__tests__/applicant-tracking.controller.spec.ts`,
`src/talent-marketplace/__tests__/apply.controller.spec.ts`,
`test/community/challenges/test-user.factory.ts`,
`test/community/classroom/test-user.factory.ts`,
`test/auth/extension-auth.spec.ts`.
The only production `signup_ref` write is `data.ref ?? null` in `src/auth/auth.service.ts`.
No fixture value bled into a production path. ✅

**Check 3 result: PASS.**

## Check 4 — Banned casts (R75)
`git diff origin/main...HEAD` added lines scanned for
`as any | as unknown as | as never | @ts-ignore | @ts-nocheck | <any>` → **0 matches**
across all `src/**` and `test/**` files. Pre-existing `as any` occurrences in
`auth.service.ts` (e.g. `WS as any`, `coachSubscription.* as any`) appear only as unchanged
context lines, not additions. ✅

**Check 4 result: PASS — 0 banned casts added.**

## Check 5 — LOC (R76)
Net production LOC (`src/**/*.ts` excluding tests + `prisma/schema.prisma`):

| file | +add | -del |
| --- | --- | --- |
| prisma/schema.prisma | 3 | 0 |
| src/auth/auth.controller.ts | 48 | 25 |
| src/auth/auth.dto.ts | 27 | 1 |
| src/auth/auth.service.ts | 123 | 85 |
| **net prod** | **201** | **111** → **net 90** |

90 ≤ 400. ✅

**Check 5 result: PASS.**

## Check 6 — Commit identity + tokens (R3)
All 6 commits `origin/main..HEAD` have author == committer ==
`Bradley Gleave <bradley@bradleytgpcoaching.com>`. Commit subjects and bodies scanned for the
forbidden token list → **0 matches**. ✅

**Check 6 result: PASS.**

## Check 7 — Test execution + typecheck
- `npm ci` → exit 0; `npx prisma generate` → OK.
- `NODE_OPTIONS=--max-old-space-size=6144 npx jest test/auth --runInBand --testTimeout=30000`
  → **10 suites, 95 passed / 95 total** (matches expected 95). ✅
- `npx tsc --noEmit` → **exit 0**. ✅

**Check 7 result: PASS.**

## Check 8 — R109 (no stubs / silent catches / coming-soon)
Added production lines contain no stubs, no empty catch blocks, no "coming soon" / "not
implemented". Zero production lines added this round; the previously-added extension paths surface
real structured errors. Catch blocks in the auth service either rethrow or log an actionable
warning. ✅

**Check 8 result: PASS.**

## Check 9 — Round-1 pre-existing P3 observations (disposition)
1. **`LoginDto.password` lacks `@MaxLength`** — CONFIRMED UNCHANGED. This PR does not modify
   `LoginDto`. Pre-existing, out of this PR's scope, non-blocking (Supabase caps password length
   downstream). Not flagged as a new defect.
2. **`/auth/extension/refresh` reuses the `AUTH_LOGIN_PER_MIN` named throttler with a distinct
   30/min limit** — CONFIRMED. The per-route `@Throttle` decorator overrides the limit
   (30 vs login's 5); tracking keys are per-handler, so there is no cross-route counter bleed.
   Intentional design, pre-existing pattern (Google/Apple routes reuse the same names). Non-blocking.
   Not flagged as a new defect.

Both are acknowledged, unchanged, and explicitly non-blocking. No new defect introduced.

---

## Severity counts (NEW findings this audit)

| severity | count |
| --- | --- |
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| P3 | 0 |

(Two carried-over pre-existing P3 observations documented in Check 9 are non-blocking and out of
this PR's scope; per audit doctrine they are not counted as new findings.)

## Metrics reconciliation

| metric | value |
| --- | --- |
| audit HEAD | `e345cc488ab829ab702bfcebebab0e6bbddf25e6` |
| SHA verified both ways | yes |
| net prod LOC | 90 (≤400) |
| banned casts added | 0 |
| jest test/auth | 95 passed / 95 |
| tsc --noEmit | exit 0 (green) |
| commits R3-compliant | 6/6 |
| forbidden tokens in commits | 0 |
| fixture bleed into prod | none |
| migration reversible | yes (down.sql present) |
| migration_lock.toml changed | no |

## R11 final confirmation
No Lens B round-1 or round-2 material was accessed at any point during this audit. All conclusions
derive from the PR diff, production source, migration files, and local test/typecheck output on
HEAD `e345cc48`.

VERDICT: CLEAN
