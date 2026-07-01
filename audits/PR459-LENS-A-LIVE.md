# PR #459 — Lens A (Round 4) LIVE Audit

**Repo:** BradleyGleavePortfolio/growth-project-backend
**Branch:** wave-h3-observability
**Head SHA (declared):** 777d3c4cd3055f6d947dafaf74a5d921d40f83f8
**Auditor:** Lens A (Security R24–R36, Perf/Concurrency R44–R55, Data/Infra R67–R73)
**Round 3 priors (to verify, not assume):** Lens A CLEAN; Lens B P1 R76 LOC breach (+544), P2 `$99` placeholder mask bug, P2 PG escape-string leak.

---

## Dispatch Header (R78 / R124)

- **Local `git rev-parse HEAD`:** `777d3c4cd3055f6d947dafaf74a5d921d40f83f8`
- **`gh pr view 459 --json headRefOid`:** `777d3c4cd3055f6d947dafaf74a5d921d40f83f8`
- **MATCH:** YES — head SHA verified BOTH ways. ✅
- Merge-base (`origin/main..HEAD`): `185444e4326e61fd964c18498a3805533bd85152`
- Labels on PR: `size/size/XL`, `r86-exception-requested`. NO `r86-exception-approved`.

## R11 — Lens Isolation CONFIRMATION

Lens A read NOTHING under `/home/user/workspace/audit_workspace/` and NO file whose
name contains `LENS-B`. The context clone at `/home/user/workspace/tgp_context_clone/`
contains `PR459-LENS-B-*.md` files — these were **NOT opened, grepped, or read**.
Only `AGENT_RULES.md` (doctrine) and Lens-A-own files were accessed. Prior Lens B
findings were treated ONLY as hypotheses to independently verify. ✅

## R3 — Commit Identity + Forbidden-Token Sweep (origin/main..HEAD)

20 commits in range. Every commit:
- **author** = `Bradley Gleave <bradley@bradleytgpcoaching.com>` ✅
- **committer** = `Bradley Gleave <bradley@bradleytgpcoaching.com>` ✅

Forbidden-token sweep across author/committer/subject/body of all 20 commits
(`claude|computer|agent|assistant|dynasia|co-authored|auto-merge|gpt|copilot|bot|anthropic|openai`):
**CLEAN — no forbidden tokens.** ✅

Round-4 fixer commits present: `a52291a9` ($n placeholder fix), `c7deb83e` (SQL-string-aware
redaction), `fbfd814b` (truncation test align), `777d3c4c` (trim LOC / delete barrel / condense docs). ✅

---

## Security Audit (R24–R36)

### 1. db-stats.service.ts — literal redactor (`redactLiterals`)
Pass ordering (masks each literal form fully before the next):
1. Dollar-quoted `$$body$$` / `$tag$body$tag$` via `/\$([A-Za-z0-9_]*)\$[\s\S]*?\$\1\$/g` — backref `\1` ties the closing tag; non-greedy body prevents merging adjacent literals. Masked FIRST. ✅
2. Escape-string `E'...'` via `/E'(?:[^'\\]|\\.)*'/gi` — honours `\'`/`\\` escapes so a backslash-quote can't terminate early and leak the tail. **This is the round-3 P2 PG-escape-string fix — VERIFIED FIXED.** ✅
3. Standard `'...'` with `''` doubled-quote escape `/'(?:[^']|'')*'/g`, then plain `/'[^']*'/g` fallback. ✅
4. Double-quoted identifiers `/"[^"]*"/g`. ✅
5. Numeric runs `/(?<!\$)\d{2,}/g` — negative lookbehind PRESERVES `$99` prepared-statement placeholders while masking numeric literals. **This is the round-3 P2 `$99` placeholder-mask bug fix — VERIFIED FIXED.** ✅

`redactStatement`: masks → collapses whitespace → truncates to 200 chars, and hashes the
FULL normalised text (sha256) not the truncated preview — fingerprint stable regardless of
truncation. No raw literal/PII in preview. R98 (PII redaction) satisfied for this surface. ✅
R35 (prod errors expose nothing): catch maps SQLSTATE 42P01/42704 → `available:false`; genuinely
unexpected errors rethrow (no silent swallow — R79/Failure#36 respected). ✅
R26 (no string-concat SQL): uses Prisma `$queryRaw` tagged template with `${limit}` parameterised;
`limit` is `Math.max(1, Math.min(100, Math.floor(topN)))` — clamped integer, not interpolated string. ✅

### 2. metrics-auth.guard.ts — bearer + ReDoS-hardened parser + constant-time compare
- Default-deny: token set → require matching Bearer else 401; unset + prod-like → 503 fail-closed;
  unset + dev → allow. ✅ (R28/R30 posture correct; fail-closed in prod.)
- `extractBearerToken`: **length cap (4096) applied to RAW value BEFORE `trim()`** — critical, since
  `trim()` scans the whole string; a huge whitespace-prefixed header is rejected pre-scan. No regex —
  prefix check + slice only. **No polynomial backtracking possible (ReDoS-hardened). VERIFIED.** ✅ (R47)
- `constantTimeEquals`: length fast-fail (length not secret), then XOR-accumulate over all chars — loop
  duration independent of first-difference position. Timing-safe. ✅

### 3. prom-metrics.ts — cardinality bounds
- Labels bounded to `method`/`route`/`status_code` — NO userId/email/PII. ✅ (R98)
- `normaliseRouteLabel`: prefers matched route pattern; else collapses UUIDs + `/\d+` path segments to
  `:id` — bounds `route`-label cardinality (prevents unbounded metric series / cardinality explosion). ✅

### 4. sentry-config.ts — PII stripping
- `stripSensitiveHeaders` deletes `authorization`/`Authorization`/`cookie`/`Cookie` in `beforeSend`. ✅ (R98)
- `resolveTracesSampleRate` clamps to [0,1] default 0.1; `resolveRelease` precedence
  SENTRY_RELEASE → GIT_SHA → RELEASE_VERSION → undefined. `initSentry` no-ops without DSN. ✅

---

## Performance / Concurrency (R44–R55)

- **Histogram buckets** (`HTTP_DURATION_BUCKETS_SECONDS`): 0.005→10s, standard prom-client web-latency
  spread — reasonable, no absurd bucket count. ✅
- **Cardinality bounds:** route normalisation (above) caps `route` label; status_code + method bounded. ✅
- **prom-client idempotent registration:** `registerDefaultMetrics` guards with module-level
  `defaultsRegistered` flag (only for the shared `promRegistry`); `buildHttpHistogram` reuses
  `getSingleMetric` if present. Safe under repeated AppModule bootstraps (test suites). ✅ (R47)
- **Middleware ordering:** `promHttpMiddleware()` mounted FIRST in `main.ts` (before helmet/auth); reads
  only `res.on('finish')`, never mutates req — measures full lifecycle incl. 401/403. Safe. ✅
- No queries-in-loops (R44); `topStatements` is a single parameterised query with `LIMIT`. ✅

---

## Data / Infra (R67–R73, R82)

- **Migration `20261221000000_enable_pg_stat_statements`:** `CREATE EXTENSION IF NOT EXISTS` (idempotent).
- **`down.sql` present** — `DROP EXTENSION IF EXISTS pg_stat_statements;` (idempotent reverse). **R82
  reversibility SATISFIED at the migration layer.** ✅
- **Rollback runbook** `docs/runbooks/pg-stat-statements-rollback.md` present (operator shared_preload_libraries + restart steps). ✅
- Adds NO tables / NO columns → **R125 (RLS Tier-1 for new tables) N/A** — nothing to RLS. ✅
- Graceful degradation (R73): `available:false` when extension absent. ✅

---

## R75 — Net Banned-Cast in Diff
Added lines (src+test): **0** banned tokens (`@ts-ignore`, `as any`, `as unknown as`, `as never`,
`.catch(()=>undefined|null|{})`, `Coming soon`). Removed: 0. **NET = 0.** ✅ (P0 gate passes.)

---

## R76 — LOC Status  [FINDING: P1-LOC]
- Net **prod** LOC (`src/**`, excl tests/docs/migrations/lockfile): **+471** (514 added − 43 deleted).
- Round-3 was +544; round-4 trimmed to +471 (deleted `src/observability/index.ts` dead barrel — confirmed
  gone, NO dangling importers in src/ or test/; condensed docstrings). Real reduction of 73 LOC. ✅
- Net test LOC: +1282. Test:src density = 1282/471 = **2.72** (≥ 2.0 R74 floor). ✅
- **471 > 400 → P1-LOC finding stands.** Per doctrine R76/R86-exception path, over-cap is P1 (NOT P0,
  NOT a CLEAN blocker) resolvable via `r86-exception-approved`.
- Per-file assessment (BLOAT / STRUCTURALLY NECESSARY / MIXED):
  - `db-stats.service.ts` (+140): STRUCTURALLY NECESSARY — redaction correctness (5-pass literal masking)
    is the security core; no dead code.
  - `prom-metrics.ts` (+104): STRUCTURALLY NECESSARY — histogram + route normalisation + idempotent registration.
  - `metrics-auth.guard.ts` (+93): STRUCTURALLY NECESSARY — ReDoS-hardened parser + constant-time compare.
  - `sentry-config.ts` (+88): STRUCTURALLY NECESSARY — testable extraction from instrument.ts (net instrument.ts −33).
  - controllers (+27, +23), module (+22 net), main.ts (+7): STRUCTURALLY NECESSARY wiring.
  - **No BLOAT identified.** Split-feasibility: could split into (a) prom-metrics + (b) db-stats + sentry
    lanes, each < 400 — feasible but three cohesive surfaces of one observability feature; splitting adds
    coordination overhead. Assessment = **MIXED-leaning-NECESSARY**; reasonable exception candidate.

### R86 EXCEPTION — FILING DEFECT  [FINDING: P2]
The `r86-exception-requested` LABEL is present, BUT the PR body does **NOT** contain a doctrine-conforming
`R86 EXCEPTION REQUESTED` block. The body instead has an ad-hoc `[LOC-EXEMPT:]` paragraph that is **stale
and internally contradictory** with the current head:
  - Body BUILD MATRIX declares **Head SHA `fec805cfa...`** (a round-2 SHA), not the current `777d3c4c`.
  - Body still lists `src/observability/index.ts` in OWNS files — that file was DELETED in round-4 (`777d3c4c`).
  - Body states prod LOC = **502** and test = 1059; actual current diff is prod **471** / test **1282**.
  - Body describes the migration as **"IRREVERSIBLE" / "not auto-rolled-back"** — but round-4 added `down.sql`
    + runbook and the migration files now self-classify **REVERSIBLE**. The body directly contradicts the shipped migration.
  - Body has no per-file BLOAT/STRUCTURALLY-NECESSARY/MIXED assessment and no split-feasibility statement
    (doctrine preamble requires both for a valid R86 exception).
**Impact:** the exception is claimed (label) but not properly filed (body). Operator cannot approve on a
body that misstates SHA, LOC, file list, and migration reversibility. This is a P2 process/documentation
finding, separate from the substantive P1-LOC.

---

## Targeted Test
(pending — see below)

---
