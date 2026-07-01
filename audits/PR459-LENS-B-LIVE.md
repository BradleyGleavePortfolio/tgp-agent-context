# PR #459 Round-4 Lens B Live Audit

Repo: BradleyGleavePortfolio/growth-project-backend
Branch: wave-h3-observability
Auditor: ROUND-4 LENS B
Workspace checkout: /tmp/pr459_lensb_r4
Live audit file: /home/user/workspace/pr459_lensb_r4_LIVE.md

## R11 isolation attestation
- I worked from `/tmp/pr459_lensb_r4` before repo grep/read operations.
- I did not read any file with `LENS-A` in the name.
- I did not read or search `/home/user/workspace/audit_workspace/`.
- I did not use `grep -r` or `grep -R` in the audit workspace.

## Head verification (R124)
- Local `git rev-parse HEAD`: `777d3c4cd3055f6d947dafaf74a5d921d40f83f8`.
- `gh pr view 459 --json headRefOid`: `777d3c4cd3055f6d947dafaf74a5d921d40f83f8`.
- PR labels observed: `size/size/XL`, `r86-exception-requested`.

## Doctrine/readiness checks
- R3 commit identity: all commits in `origin/main..HEAD` are authored and committed as `an <bradley@bradleytgpcoaching.com>` / `cn <bradley@bradleytgpcoaching.com>`; no forbidden commit-message/identity tokens found.
- R75 banned-cast diff sweep over `src` + `test`: additions=0, deletions=0, net=0.
- R76 production LOC: `git diff --numstat origin/main...HEAD | awk '$3 ~ /^src\//'` => added=514, deleted=43, net=471.
- R74 test density: src_added=514, test_added=1282, ratio=2.49.
- Modified-file TODO/FIXME sweep over changed `src` + `test`: no hits.
- R43 circular check: `madge` was not available in the incomplete local dependency install; no result claimed.

## Round-4 regression verification

### `$99` placeholder fix
- Implementation confirmed in `src/observability/db-stats.service.ts:51-52`: numeric-literal masking uses `/(?<!\$)\d{2,}/g`, preserving `$n` placeholders.
- Regression test located in `test/observability/db-stats.spec.ts:100-108`: it verifies `SELECT * FROM t WHERE id = $99 AND rank = $10 AND score = 12345` masks `12345`/`score = ?` while preserving `$99` and `$10`.
- Functional in-repo harness result: `placeholder = "SELECT * FROM t WHERE id = $99 AND rank = $10 AND score = ?"`.

### PG escape-string fix
- Implementation confirmed in `src/observability/db-stats.service.ts:41-49`: dollar-quoted literals are masked first, then `E'(?:[^'\\]|\\.)*'`, then doubled-single-quote form `'(?:[^']|'')*'`, then plain fallback.
- Regression test located in `test/observability/db-stats.spec.ts:85-92`: it verifies `SELECT E'secret\'@bar.com' FROM t` does not leak `@bar.com` or `secret` in `queryPreview`.
- Functional in-repo harness result: `escapeString = "SELECT '?' FROM t"`.

## Findings

### P1-LOC — R76 production LOC exceeds 400, and the required R86 PR-body exception block is missing
- Evidence: net production LOC is 471 (`src/` added=514, deleted=43), above the 400 soft cap.
- Per-file production breakdown:
  - `src/instrument.ts`: +7/-40 = -33
  - `src/main.ts`: +7/-0 = +7
  - `src/observability/db-stats.controller.ts`: +27/-0 = +27
  - `src/observability/db-stats.service.ts`: +140/-0 = +140
  - `src/observability/metrics-auth.guard.ts`: +93/-0 = +93
  - `src/observability/observability.module.ts`: +25/-3 = +22
  - `src/observability/prom-metrics.controller.ts`: +23/-0 = +23
  - `src/observability/prom-metrics.ts`: +104/-0 = +104
  - `src/observability/sentry-config.ts`: +88/-0 = +88
- Assessment: STRUCTURALLY NECESSARY overall for H3 observability (Prometheus metrics, auth guard, db-stats endpoint, Sentry extraction), with no obvious dead barrel after `src/observability/index.ts` removal.
- R86 exception status: label `r86-exception-requested` is present, but `gh pr view --json body` found no `R86 EXCEPTION REQUESTED` block in the PR body. The body still has a stale `LOC / test density` paragraph and stale build matrix (`Head SHA: fec805cfa...`, old prod/test LOC, and deleted `src/observability/index.ts` in OWNS).
- Required fix: add the explicit `R86 EXCEPTION REQUESTED` block to the PR body with item-by-item no-waste justification, per-file assessment, and split-feasibility evaluation; update stale R124/LOC body data.

### P1 — R40/R71 test reality: targeted Jest suite does not execute because the new db-stats spec fails TypeScript compilation
- Evidence command run in `/tmp/pr459_lensb_r4`: `node node_modules/jest/bin/jest.js test/observability/db-stats.spec.ts --runInBand --testNamePattern='escape-string|prepared-statement placeholders'`.
- Result: suite failed before running any tests with `TS2769` / `TS2339` at `test/observability/db-stats.spec.ts:35` on `jest.spyOn(prisma, '$queryRaw').mockImplementation(impl)`.
- Why this matters: the two new regression tests exist at lines 85-92 and 100-108, but the Jest file currently cannot execute under the repository Jest config because the helper constructs a real `PrismaService` and TypeScript does not see `$queryRaw` as a `keyof PrismaService` in the spy overload.
- Required fix: make the Prisma test double compile without introducing R75 banned-cast tokens, then rerun the targeted Jest command and the observability suite.

### P1 — R41 environment parity: new required observability env vars are missing from `.env.example`
- Evidence: `src/observability/metrics-auth.guard.ts:26-31` reads `process.env.METRICS_AUTH_TOKEN` and fails closed in prod-like environments when absent.
- Evidence: `src/observability/sentry-config.ts:19-32` reads `SENTRY_RELEASE`, `GIT_SHA`, `RELEASE_VERSION`, and `SENTRY_TRACES_SAMPLE_RATE` for release/sample-rate configuration.
- `.env.example:580-607` documents existing observability vars and includes `SENTRY_TRACES_SAMPLE_RATE`, but `grep` found no `METRICS_AUTH_TOKEN`, `SENTRY_RELEASE`, `GIT_SHA`, or `RELEASE_VERSION` entries.
- Required fix: add these new env vars to `.env.example` with safe defaults/comments, especially `METRICS_AUTH_TOKEN` because production observability endpoints fail closed without it.

## Non-findings / confirmations
- The two round-3 P2 redaction defects are fixed functionally and covered by explicit regression test cases.
- R75 banned-cast net additions remain zero.
- The PR has the `r86-exception-requested` label, but body contents are not yet doctrine-complete for R86.

## Severity counts
- P0: 0
- P1: 3
- P2: 0
- P3: 0

VERDICT: FINDINGS
