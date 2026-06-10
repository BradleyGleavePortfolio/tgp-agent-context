# R1 AUDIT — PR #375 B5 Digital Contracts + HelloSign Embedded

**You are the GPT-5.5 R1 auditor. You did NOT build this. R31: different agent, different worktree, verify ONLY — do not modify source code.**

## Repo & worktree
- Repo: `BradleyGleavePortfolio/growth-project-backend`
- Worktree: `/home/user/workspace/tgp/backend-b5-audit` (detached HEAD at `3f35447`)
- Branch under review: `feature/b5-digital-contracts` (PR #375, head `3f35447e54ecd56d66ae5209c8bd0b85a02c06e2`, base `main` @ `9322eeb`)

## Output deliverable
1. New branch off the audit worktree: `audit/r1-pr-375`.
2. Single file `AUDIT_R1_PR_375_REPORT.md` at repo root, one section per gate.
3. Commit (title-only, author `Dynasia G <dynasia@trygrowthproject.com>`, message: `audit(r1): PR #375 B5 digital contracts + HelloSign Embedded`).
4. Push the audit branch.
5. End return message with verdict: **CLEAN** / **DIRTY-MINOR** / **DIRTY**.

## The 10 gates

### Gate 1 — Commit hygiene
- `git log --format='%an <%ae>%n%B%n---' 9322eeb..HEAD`
- All commits title-only (no body/emoji/`Co-Authored-By`/`🤖`/`Generated with` trailers).
- Author `Dynasia G <dynasia@trygrowthproject.com>` on every commit.
- 8 commits expected.

### Gate 2 — Scope boundaries
- `git diff --name-only 9322eeb..HEAD` MUST stay inside:
  - `src/contracts/**` (new module)
  - `prisma/migrations/20261215000000_b5_digital_contracts/migration.sql`
  - `prisma/migrations/20261215000100_seed_b5_contract_templates/migration.sql`
  - `prisma/schema.prisma` (additive only — verify with grep diff)
  - `package.json` + `package-lock.json` (only `@dropbox/sign` add)
  - `.env.example` (only `FEATURE_CONTRACTS_ENABLED` + HelloSign keys)
  - `test/contracts/**` + co-located `*.spec.ts`
  - `src/app.module.ts` (module wiring only, additive imports — verify)
  - `src/checkout/**` ONLY if a single checkout gate hook was added (verify it is feature-flag-gated and no-op when flag off)
- NO edits to `src/community/**`, `src/dunning/**`, `src/entitlement/**`, `src/payouts-v2/**`, `src/ai/**`.

### Gate 3 — TypeScript clean
- `pnpm tsc --noEmit` (or `./node_modules/.bin/tsc --noEmit`) returns 0.

### Gate 4 — Test lanes pass
Report exact pass counts:
- `pnpm jest test/contracts --runInBand`: expect 31/31.
- `pnpm jest src/dunning --runInBand`: 26/26 no regression.
- `pnpm jest src/entitlement --runInBand`: 17/17 no regression.
- `pnpm jest src/checkout --runInBand`: expect 131/131 no regression.
- If OOM, use `--maxWorkers=2 --max-old-space-size=3072` (per builder note).

### Gate 5 — FEATURE_CONTRACTS_ENABLED hard-off invariant
This is the operator-mandated invariant: server-side code MUST throw/no-op when flag is off, regardless of client.
- `.env.example` must set `FEATURE_CONTRACTS_ENABLED=false`.
- Grep for the flag check in:
  - `createEnvelope` (must throw `ServiceUnavailableException` or equivalent when off)
  - `applyProviderEvent` (must not mutate DB when off)
  - HelloSign webhook handler (ack-only / no-op when off)
  - Checkout gate (no-op when off)
- Confirm test exists per location that asserts the no-op/throw behavior. Report each test name found.

### Gate 6 — HelloSign Embedded provider implementation
- `@dropbox/sign` in `dependencies` (not devDependencies).
- Provider abstraction exists with implementations: HelloSign Embedded (real), DocuSign (NotImplemented stub), native-canvas (NotImplemented stub).
- HelloSign webhook signature verification implemented (HMAC SHA-256 over payload with api_key). Confirm a test sends invalid signature → handler rejects without DB mutation.
- Embedded sign URL flow: confirm `createEmbeddedSignUrl` exists; sign URL is short-TTL and not logged.

### Gate 7 — Two-layer gate (TGP↔Client waiver + Coach↔Client per-package)
- Layer 1: TGP↔Client platform liability waiver is REQUIRED before any package purchase (verify checkout-gate test).
- Layer 2: Coach↔Client per-package opt-in (`CoachPackage.contract_required` flag); when on, purchase blocks until envelope is `COMPLETED`.
- Both layers test-covered. Report test names.

### Gate 8 — 4 contract drafts present + sourced
Files under `src/contracts/templates/seed/`:
- `platform-waiver-v1.md`
- `standard-coaching-v1.md`
- `group-program-v1.md`
- `course-purchase-v1.md`

For EACH: verify frontmatter declares ≥5 cited legal sources with URLs, AND the verbatim legal disclaimer is present in the seed migration header. Report source counts (expected: 8, 6, 6, 8).

### Gate 9 — Migration shape
- `prisma migrate diff` (base = `origin/main:prisma/schema.prisma`) must show only ADD COLUMN (nullable/default), CREATE TABLE, CREATE INDEX, ADD CONSTRAINT, CREATE TYPE (enum).
- Grep both migration files: `grep -iE 'DROP |RENAME |ALTER COLUMN .* TYPE|TRUNCATE|DELETE FROM' prisma/migrations/2026121500000*_b5*/migration.sql prisma/migrations/2026121500010*_seed_b5*/migration.sql` — expect zero matches.
- Seed migration must be idempotent (verify `ON CONFLICT DO NOTHING` or equivalent guards).

### Gate 10 — Forbidden tokens + sub-coach RLS readiness
- New-lines-only forbidden token scan: `git diff 9322eeb..HEAD -- 'src/**' 'test/**' | grep -iE '^\+.*\b(sonnet|claude-3|TODO\(audit\)|FIXME|XXX)\b'` — flag any matches.
- RLS: contracts tables should have RLS posture documented (either RLS ENABLE+FORCE policies in migration OR a noted Phase B follow-up). Verify either way and report which.

## Verdict rubric
- **CLEAN**: all 10 gates pass.
- **DIRTY-MINOR**: cosmetic only.
- **DIRTY**: any functional/security/scope/test failure → spawn fixer.

## Hard rules
- Do NOT edit source files. ONLY write the audit report.
- `./node_modules/.bin/prisma` v6 only; `migrate diff` only.
- `api_credentials=["github"]` for `gh` CLI.
- Force-push: `--force-with-lease`.
