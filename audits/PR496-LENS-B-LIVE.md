# PR #496 — Lens B Round-2 LIVE Audit (Tests / Types / Build / Contract-Correctness)

- **Auditor lens:** B
- **Round:** 2
- **Timestamp:** 2026-07-01
- **Repo:** BradleyGleavePortfolio/growth-project-backend
- **Branch:** feat/importer-auth-extension

## SHA Verification (R124 — both ways)

| source | sha |
| --- | --- |
| local `git rev-parse HEAD` | `e345cc488ab829ab702bfcebebab0e6bbddf25e6` |
| `gh pr view 496 --json headRefOid` | `e345cc488ab829ab702bfcebebab0e6bbddf25e6` |
| base `origin/main` | `2ad6ae91c9fa1293d639824b5b4e969fae35f42e` |

Both HEAD sources match the expected SHA. Fresh sandbox clone at `/tmp/pr496_lensb_r2/growth-project-backend`.

## R11 Lens Isolation Log

Confirmed: did NOT open, read, cat, grep, or list any of the following at any point:
- `/home/user/workspace/pr496_lensa_*` (any file)
- `/home/user/workspace/audit_workspace/` (recursive)
- any `tgp_context_clone/audits/*LENS-A*` file
- any Lens A round-1 / round-2 findings.

All conclusions below are derived independently from the HEAD tree and git history only.

## Metrics

| metric | value |
| --- | --- |
| net prod LOC (`src/**/*.ts` excl tests + `prisma/schema.prisma`) | 90 |
| net test LOC (`test/**` + `**/__tests__/**` + `*.spec.ts`) | 416 |
| test:src ratio (net test / net prod) | 4.62 (≥ 2.0 under every methodology; round-1 was 3.94) |
| new test cases this round | 4 (`it()` blocks) |
| total tests, `test/auth` | 95 passed / 95 total, 10 suites |
| tests in `test/auth/extension-auth.spec.ts` | 21 passed / 21 |
| banned-cast additions (R75) | 0 |
| commits `origin/main..HEAD` (R3 checked) | 6 |
| tsc `--noEmit` | exit 0 |

Net-prod detail (add/del): auth.controller.ts 48/25 (+23), auth.dto.ts 27/1 (+26), auth.service.ts 123/85 (+38), schema.prisma 3/0 (+3) = **90**. Migration SQL (13 additive lines) excluded from TS prod count; including it yields 103 — still ≪ 400 (R76).

## Check 1 — Test Execution

- `NODE_OPTIONS=--max-old-space-size=6144 npx jest test/auth --runInBand --testTimeout=30000` → **95 passed / 95 total**, 10 suites, exit 0.
- `npx jest test/auth/extension-auth.spec.ts --runInBand --testTimeout=30000` → **21 passed / 21**, exit 0.
- No flakiness observed; the isolated spec run reproduced green. No retry needed.
- Per corrected-path note: `src/auth` is NOT a Jest root; the suite lives at `test/auth/extension-auth.spec.ts`. `git diff origin/main...HEAD -- jest.config.js` shows **no change** — config untouched, spec not moved. The round-1 "jest src/auth finds nothing" item is a prompt-path artifact, not a defect, and is not flagged.

## Check 2 — Test:src Ratio (R74)

Net test 416 / net prod 90 = **4.62** ≥ 2.0. Added-only methodology (471 test / 201 prod-src) = 2.34, also ≥ 2.0. Passes under both.

## Check 3 — TypeScript Compile

`NODE_OPTIONS=--max-old-space-size=6144 npx tsc --noEmit` → **exit 0**. No errors.

## Check 4 — Banned Casts (R75)

`git diff origin/main...HEAD -- 'src/**/*.ts' 'test/**/*.ts'` added lines scanned for `as any | as unknown as | as never | @ts-ignore | @ts-nocheck | <any>` → **0 matches**. (The new spec uses a narrow `as BadRequestException` on the caught error to read `.getStatus()`; this is not a banned wide-cast token and does not sidestep any DTO type.)

## Check 5 — New Test Correctness (`test/auth/extension-auth.spec.ts`)

1. **Too-long ref** (L378–391): `'a'.repeat(65)` — exactly 65 chars, lowercase (matches `^[a-z0-9_-]+$`), so only length can fail. Asserts `refError.constraints` has **`maxLength`**. Correct — isolates `@MaxLength(64)`, not 64/66.
2. **Uppercase ref** (L393–406): `'abc123DEF'` — letters + digits + uppercase, no spaces/symbols. Asserts `refError.constraints` has **`matches`** (not `maxLength`). Correct — proves the `@Matches` regex path fires, distinct from the pre-existing spaces/symbols case.
3. **Invalid `ExtensionRefreshDto` → 400** (L408–433): instantiates a REAL `new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })` — identical to `src/main.ts` L124–128 — with a real `ArgumentMetadata` (`metatype: ExtensionRefreshDto`). Loops three invalid bodies, each individually asserted: `{}` (missing → `@IsString`), `{ refresh_token: '' }` (empty → `@MinLength(1)`), `{ refresh_token: 'a'.repeat(4097) }` (oversized → `@MaxLength(4096)`). Each asserts `BadRequestException` AND `getStatus() === 400`. Not a stubbed pipe.
4. **Positive control** (L435–447): valid `{ refresh_token: 'abc.def.ghi' }` transforms past the same pipe and returns an `ExtensionRefreshDto` instance with the value preserved — confirms the 400 assertions are caused by invalidity, not a pipe that always throws.

No test disables validation; no `as any` sidesteps the DTO type.

## Check 6 — Contract Preservation

The ingest envelope contract (`{intent_id, entity_type, entities:[{source_id, payload}]}`) is NOT touched. `git diff origin/main...HEAD --name-only` contains no ingest/scout/envelope files — this PR is auth + `signup_ref` only. Confirmed no matches for `ingest|scout|envelope|intent_id|entity_type` in changed paths.

## Check 7 — R3 Identity

All 6 commits `origin/main..HEAD` have author == committer == `Bradley Gleave <bradley@bradleytgpcoaching.com>`. Subject + body + trailer scan for forbidden tokens → none.

## Check 8 — Fixture Bleed

All 6 added `signup_ref: null` fixtures land in test paths only:
- `src/community/voice/__tests__/test-user.factory.ts`
- `src/talent-marketplace/__tests__/applicant-tracking.controller.spec.ts`
- `src/talent-marketplace/__tests__/apply.controller.spec.ts`
- `test/auth/extension-auth.spec.ts`
- `test/community/challenges/test-user.factory.ts`
- `test/community/classroom/test-user.factory.ts`

The only production `signup_ref` write is `signup_ref: data.ref ?? null` in `src/auth/auth.service.ts` — the intended persistence, matching the DTO contract. No bleed into prod.

## Check 9 — Migration (R82)

`prisma/migrations/20261221010000_add_signup_ref_to_user/`:
- `migration.sql`: `ALTER TABLE "User" ADD COLUMN "signup_ref" TEXT;` — additive, nullable, no default, no backfill, no rename/drop. Expand-phase, backwards-compatible.
- `down.sql`: `ALTER TABLE "User" DROP COLUMN IF EXISTS "signup_ref";` — reversible, idempotent.
- `migration_lock.toml`: unchanged.

No data-loss risk.

## Check 10 — R109

New tests contain no `xit` / `it.skip` / `it.todo` / `describe.skip` / `TODO` / "coming soon" / `expect(true).toBe(true)` and no empty `catch {}`. No stubs.

## Non-Finding Checks Summary

- SHA both-ways ✓
- jest.config unchanged ✓
- Real ValidationPipe (not stub) ✓
- Migration reversible + lock unchanged ✓
- Ingest contract untouched ✓
- No fixture bleed ✓
- Zero banned casts ✓
- R3 identity clean ✓

## Execution Notes (for future runs)

- Correct suite path is `test/auth` (Jest roots = `test/` + selected `src` subtrees); `src/auth` yields "no tests". Not a defect.
- `npm ci` takes ~6 min in-sandbox; run `npx prisma generate` explicitly afterward (postinstall completes but generating again is harmless and guarantees the client).
- Full `test/auth` run took ~129 s under `--runInBand`; the isolated spec ~18 s.
- The pre-commit `tsc` hook OOMs at the default ~2 GB heap; a standalone `tsc --noEmit` with `--max-old-space-size=6144` compiles cleanly (exit 0). Auditor-side only; no bearing on the audited tree.

## Severity Counts

| severity | count |
| --- | --- |
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| P3 | 0 |

Round-1 P2 gaps (too-long ref, uppercase-ref, `ExtensionRefreshDto` → 400) are all closed by the four new cases, verified above. No new defects. Pre-existing P3 observations (e.g. `LoginDto.password` lacks `@MaxLength`; refresh shares the `AUTH_LOGIN_PER_MIN` named throttler) are unchanged by this round and not re-flagged as new defects.

VERDICT: CLEAN
