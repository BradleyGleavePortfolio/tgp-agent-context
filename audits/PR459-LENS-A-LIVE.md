# PR #459 — LENS A — ROUND 5 — LIVE AUDIT

## BUILD MATRIX
- backend HEAD: f6122de1765f909e43d82ba6d6de6843eb596736
- ctxrepo HEAD: (tgp-agent-context main, cloned this session)
- PR #459 head: f6122de1765f909e43d82ba6d6de6843eb596736
- PR #459 base (origin/main / merge-base): 185444e4326e61fd964c18498a3805533bd85152
- timestamp (ISO 8601 UTC): 2026-07-01T01:50:00Z

## R124 — SHA verification (both ways)
- `git rev-parse HEAD` = `f6122de1765f909e43d82ba6d6de6843eb596736`
- `gh pr view 459 --json headRefOid` = `f6122de1765f909e43d82ba6d6de6843eb596736`
- MATCH ✅ — no SHA drift.

## R11 — LENS ISOLATION ATTESTATION
Lens A NEVER read, grepped, or opened any Lens B artifact. Never touched
`/home/user/workspace/audit_workspace/`, never opened `pr459_lensb_*` files,
never read anything containing "LENS-B". Independent audit. ✅

## R3 — Identity + forbidden-token sweep (origin/main..HEAD, 22 commits)
- ALL 22 commits authored AND committed as `Bradley Gleave <bradley@bradleytgpcoaching.com>`. ✅
- Forbidden-token sweep (claude/assistant/agent/computer/dynasia/bot/co-authored/
  openai/gpt/anthropic/copilot/auto-merge) across author, committer, subject, body:
  **NONE FOUND — CLEAN**. ✅

## R86 EXCEPTION BLOCK + LABEL
- PR body contains a conforming `## R86 EXCEPTION REQUESTED` block: ✅
  - Net prod LOC 471, test:src density 2.72, banned-cast delta 0, migration reversible YES.
  - Per-file breakdown present with BLOAT/STRUCTURAL assessments (all STRUCTURALLY NECESSARY).
  - Split-feasibility analysis present (guard + guarded-endpoints = single reviewed unit).
- Label `r86-exception-requested` present. ✅
- **P2 NOTE (non-blocking):** the exception block's `**Current head:**` line reads
  `777d3c4c...` (the round-4 trim commit) rather than the current head
  `f6122de1...`. The two round-5 commits (test-compile fix `9ebada67`, env-parity
  `f6122de1`) do not change prod LOC (test + docs only), so the 471 figure and
  per-file breakdown remain accurate. Cosmetic staleness only; recommend the
  parent refresh the head SHA in the block. Not a code-fix blocker.

## R75 — Banned-cast net delta
- Full diff `origin/main..HEAD` over `src/` + `test/`: **0 net-new banned tokens**. ✅
- Narrow concrete casts present (`as { code?: string }`, `as Histogram<...>`,
  `as Record<string, unknown>`) — all allowed under R75 (provable target types).

## R76 / R86 — LOC status
- Recomputed net prod LOC (`git diff --numstat origin/main..HEAD -- 'src/'`):
  added 514, deleted 43, **net = 471**. Matches R86 block exactly. ✅
- Per-file breakdown matches the PR-body table 1:1.
- **P1-LOC finding (exception-covered):** 471 > 400. Exception block + label
  properly filed → moves to operator-resolution bucket per §R86. Sole remaining
  item is operator R86 approval (label `r86-exception-approved`).

## Security audit — four surfaces (R24–R36, R44–R55, R67–R73)

### 1. db-stats.service.ts
- R26 SQL-injection: `Prisma.sql` tagged template, parameterized `${limit}`,
  limit clamped to [1,100]. Safe. ✅
- PII: multi-pass literal redactor (dollar-quoted, E-string, doubled-quote,
  plain, double-quoted, numeric-vs-`$n`), sha256 hash, bounded 200-char preview. ✅
- Error handling (Failure #36): re-throws unexpected errors; graceful degrade
  only on 42P01/42704 extension-absent. No swallowed errors. ✅
- R71 bigint→number coercion safe.

### 2. metrics-auth.guard.ts
- R24/R30: bearer token from env, default-deny; prod-like + unset → 503 fail-closed;
  dev + unset → allow local. ✅
- ReDoS (R44): no regex; raw length cap 4096 applied BEFORE trim scan; bounded
  non-backtracking string ops. ✅
- Timing: `constantTimeEquals` XOR-accumulates over equal-length strings; length
  fast-fail acknowledged as non-secret. Acceptable. ✅

### 3. prom-metrics.ts
- Cardinality (R44/R51): labels bounded to method/route/status_code; route
  normaliser collapses UUIDs + numeric ids to `:id`. No PII labels. ✅
- Idempotent default-metrics + histogram registration guards. ✅

### 4. sentry-config.ts
- PII: `stripSensitiveHeaders` deletes authorization/cookie before send. ✅
- Sample rate clamped [0,1]; no-op when DSN unset (fail-safe). Pure functions. ✅

### Migration (R67–R73, R82 reversibility)
- `CREATE EXTENSION IF NOT EXISTS pg_stat_statements` — idempotent, read-only
  diagnostic; adds no tables/columns (R25 N/A). Documented reversible `down.sql`
  (`DROP EXTENSION IF EXISTS`) + operator-attach runbook. Fully reversible. ✅

## Round-5 fix verification
### 9ebada67 — test compile fix
- Diff: `test/observability/db-stats.spec.ts`, +16/-1.
- Introduces `type QueryRawHost = Pick<PrismaService, '$queryRaw'>;` to narrow
  the spy target. No banned casts added. ✅
- Jest run: (pending below)

### f6122de1 — .env.example env parity (R41)
- Diff: `.env.example`, +18. All four vars PRESENT:
  METRICS_AUTH_TOKEN ✅ / SENTRY_RELEASE ✅ / GIT_SHA ✅ / RELEASE_VERSION ✅.

## Test runs
### db-stats.spec.ts (round-5 fix 9ebada67 verification)
- `node node_modules/jest/bin/jest.js test/observability/db-stats.spec.ts --runInBand --testTimeout=30000`
- **19/19 passed, exit 0.** ✅
- ENV NOTE: first run failed with TS2344 on `Pick<PrismaService,'$queryRaw'>` and
  then ENOSPC — both were sandbox artifacts, NOT code defects: (a) the interrupted
  `npm ci` had skipped the `postinstall: prisma generate` hook, so `@prisma/client`
  types lacked `$queryRaw`; after running `prisma generate` (v6.19.3) the type
  resolved cleanly; (b) the disk was 100% full — freed my own npm cache only
  (did NOT touch any Lens B / audit_workspace directory per R11). With a generated
  client + free disk, the spec compiles and passes. The `9ebada67` `Pick<...>`
  fix is CORRECT.

### Full observability suite
- `node node_modules/jest/bin/jest.js test/observability --runInBand --testTimeout=30000`
- **10 suites, 148/148 tests passed, exit 0.** ✅ Confirms the 148/148 claim.

## Severity counts
- P0: 0
- P1: 1 — P1-LOC (471 > 400), exception-covered, pending operator R86 approval.
- P2: 1 — R86 block `Current head` line stale (`777d3c4c` vs `f6122de1`); cosmetic,
  LOC figure still accurate. Non-blocking.
- P3: 0
- Round-4 P1s RESOLVED: TS-compile (9ebada67 ✅), .env.example parity (f6122de1 ✅),
  R86 exception body now conforming.
- No NEW security / performance / concurrency / data / infra findings.

## VERDICT
R86 exception block + `r86-exception-requested` label are properly filed; both
round-4 P1 code items (TS compile + env parity) are resolved; four security
surfaces + migration re-verified clean; 148/148 tests green; banned-cast delta 0;
R3 identity clean; SHA verified both ways. The ONLY remaining item is operator
R86 approval (label is `r86-exception-requested`, not yet `-approved`), so the
P1-LOC stays as a documented pending-approval item per §R86. Per the conservative
doctrine reading (FINDINGS until operator approves the exception), the sole
remaining item is operator R86 sign-off — not a code-fix blocker.

VERDICT: FINDINGS
