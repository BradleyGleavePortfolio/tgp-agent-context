# H6A Builder Brief — audit_log substrate (13-col table + erasure-token + migration + ADR)

**Codified:** 2026-06-26 by operator (Bradley Gleave), Op 50.5 dispatch.
**Lineage:** Splits closed PR #492 (`wave-h6-audit-circuit`) into PR-α (this brief) / PR-β / PR-γ per operator ruling: *"LOC budget (R100.A3) — needs operator-signed exemption marker on title — denied, split the PR into minimum 3 PR's"* (verbatim, 2026-06-26).
**Carries ADR:** `docs/decisions/2026-06-26-h6-audit-log-and-circuit-breakers.md` (operator decisions D-H6-1 through D-H6-5, LOCKED).

## Repo + branch

- Repo: `BradleyGleavePortfolio/growth-project-backend`
- Branch: `wave-h6a-audit-log-substrate` (base: `main` @ `185444e4326e61fd964c18498a3805533bd85152`)
- NEW PR — open as `[WIP]` at first push (per R52 PUSH-EARLY-WIP doctrine).
- PR title: `feat(h6a): audit_log substrate — 13-col table + erasure-token + 7y retention [LOC-EXEMPT: substrate-migration]`
- The narrow `[LOC-EXEMPT: substrate-migration]` marker is the operator-approved scope-bounded justification for THIS slice; it is NOT a blanket exemption. The marker is paired with a per-rule `R100 Exception Request` block in the PR body (see "R86 Exception Request" section below).

## Bradley R0 LAW (re-stated every brief — at all times)

Operator directive (verbatim, 2026-06-13): *"every single PR should say bradley@bradleytgpcoaching.com - no AI names - just bradley + my email"*

- Author EVERY new commit with inline `-c` flags. NEVER `git config --global`:
  ```bash
  git -c user.name='Bradley Gleave' -c user.email='bradley@bradleytgpcoaching.com' \
    commit -m "..."
  ```
- NO co-author trailers (`Co-Authored-By`), NO `Generated-By`, NO assistant attribution.
- NO "Coming soon" strings in production code, comments, test titles, regex assertions, or docblocks.
- NO `@ts-ignore`, NO `@ts-nocheck`, NO `as any`, NO `as unknown as X`, NO `as never as X`, NO bare `as never`.
- NO `.catch(()=>undefined)`, NO `.catch(()=>null)`, NO `.catch(()=>{})`, NO `catch(e){}`, NO `catch(e){ console.log(e) }`.
- `@ts-expect-error` with a one-line justification IS allowed.

## Mandatory training docs (read before any code is written)

- `/tmp/tgp-agent-context/quality-references/50_FAILURES_OF_AI_GENERATED_CODE.md` — the 50 failure modes. Sweep your additions diff before push (Gate 3).
- `/tmp/tgp-agent-context/quality-references/BUILDER_BRIEF_TEMPLATE_V2.md` — the canonical brief shape this brief instantiates.
- The H6 ADR (which YOU are carrying forward into this PR): `docs/decisions/2026-06-26-h6-audit-log-and-circuit-breakers.md`.

## Plan doc + technical scope

### What this slice ships (and ONLY this slice)

This PR creates the audit substrate that H6B (breakers) and H6C (wraps + ESLint) will compose against. It is independent of H6B/H6C — once this slice merges, H6B can rebase off it and H6C off H6B.

1. **The 13-column `audit_log` table** (D-H6-1, LOCKED):
   - `id` `uuid` PK default `gen_random_uuid()`
   - `created_at` `timestamptz` NOT NULL default `now()`
   - `actor_user_id` `uuid` nullable (system writes are nullable; user writes required)
   - `actor_role` `text` NOT NULL — one of `'user' | 'admin' | 'system' | 'cron'`
   - `action` `text` NOT NULL — verb + subject, e.g. `'user.email_changed'`, `'package.purchased'`
   - `entity_type` `text` NOT NULL — model name (`'User'`, `'Package'`, etc.)
   - `entity_id` `text` NOT NULL — the row's PK as text (uuid OR numeric serialized)
   - `before_state` `jsonb` nullable — pre-mutation snapshot. **NO raw PII** (per R98 + D-H6-1) — PII columns must be tokenized via `erasure-token.ts`.
   - `after_state` `jsonb` nullable — post-mutation snapshot, same PII-tokenization rule.
   - `request_id` `uuid` nullable — correlation id from request middleware
   - `ip_inet` `inet` nullable — client IP, captured at the API edge
   - `user_agent` `text` nullable
   - `reason` `text` nullable (D-H6-1: ships nullable — admin/erasure flows populate it)

2. **DB-level append-only enforcement** (D-H6-1, LOCKED):
   - Immediately after `CREATE TABLE`, the migration MUST issue:
     ```sql
     REVOKE UPDATE, DELETE ON audit_log FROM PUBLIC;
     REVOKE UPDATE, DELETE ON audit_log FROM app_runtime;
     ```
   - The `app_runtime` and `admin_role` roles are created defensively with `CREATE ROLE IF NOT EXISTS` (portable across local shadow DB and deployed Supabase env).

3. **RLS Tier 1** (R125): enable RLS on `audit_log`; admin policy allows SELECT for `admin_role`; user policy allows SELECT WHERE `actor_user_id = auth.uid()`; NO INSERT/UPDATE/DELETE policy (all writes go through the wrapper via `app_runtime` which retains INSERT via base grant).

4. **Indexes** (for forensic-query latency targets):
   - `(actor_user_id, created_at DESC)` — "what did user X do?"
   - `(entity_type, entity_id, created_at DESC)` — "what happened to entity Y?"
   - `(action, created_at DESC)` — "all `package.purchased` events"

5. **Forward migration + REVERSIBLE down.sql** (R82):
   - `prisma/migrations/20261226000000_create_audit_log/migration.sql` — forward
   - `prisma/migrations/20261226000000_create_audit_log/down.sql` — reverse (DROP TABLE; DROP POLICY; DO NOT drop roles — role lifecycle is ops, not migrations).

6. **Erasure-token utility** (`src/audit-log/erasure-token.ts`):
   - GDPR Art. 17 in-place redaction primitive (D-H6-4, LOCKED).
   - Deterministic HMAC-SHA256 token: `tok_${hmac(secret, plaintext)[:16]}` where `secret` = `AUDIT_LOG_ERASURE_HMAC_SECRET` env (REQUIRED — fail-fast at boot if missing).
   - One-way: token stable for same `(secret, plaintext)` (audit-log correlation across redactions) but does NOT reverse to plaintext.
   - Token format `tok_…` documented in `docs/audit-log.md` and asserted in tests.

7. **AuditLogService** (`src/audit-log/audit-log.service.ts`):
   - Single public method `withAuditLog<T>(tx: Prisma.TransactionClient, args: AuditLogArgs, op: () => Promise<T>): Promise<T>`.
   - Runs `op()` inside the caller-provided transaction `tx`; on success, INSERTs the audit row in the SAME tx (D-H6-5, LOCKED).
   - On audit INSERT failure: if `process.env.AUDIT_LOG_FAIL_OPEN === '1'` (EXACT string match — not truthy coercion), log structured + continue. Otherwise rethrow → transaction rolls back, mutation does NOT commit.
   - Exposes `redactPii(userId)`: in-place UPDATE of audit_log rows for that actor, replacing `before_state` / `after_state` PII fields with `erasureToken(plaintext)`. Used by account-deletion (consumed by H6C).

8. **Retention rotation script** (`scripts/audit-log-retention-rotate.ts`):
   - Cron-runnable; selects rows older than 7 years (D-H6-4, LOCKED); writes to S3 Object Lock bucket via AWS SDK v3; updates AWS Glue catalog table; **DOES NOT DELETE from `audit_log`** (archive-never-delete, D-H6-4).
   - Idempotent: re-runnable on the same window without double-archiving (S3 keys include rotation timestamp + row-id range hash).
   - In-script invariant: if any code path inside the script would issue a DELETE/TRUNCATE against `audit_log`, the script must throw at construction (compile- or boot-time guard, not a runtime test).

9. **Docs**:
   - `docs/audit-log.md` — operator-facing reference: schema, tokenization, retention, break-glass.
   - `docs/decisions/2026-06-26-h6-audit-log-and-circuit-breakers.md` — ALREADY DRAFTED in PR #492; carry it forward as-is.

### What this slice EXPLICITLY does NOT ship

- NO call-site wraps on services. Every existing service stays exactly as it is on main. (Those wraps live in H6C.)
- NO ESLint rule. The `eslint-rules/audit-log-required.js` and `eslint.config.js` changes live in H6C.
- NO circuit breakers. `src/circuit-breakers/` lives in H6B.

### Numeric thresholds (R74 / R76 / R82)

Pre-computed from the PR #492 diff (the source slice this brief carves out):

- **Prod LOC (net additions, incl. migration SQL + retention script + src/audit-log):** ~615 net.
- **R76 cap:** 400 prod LOC max. **OVER by ~215 LOC** — `[LOC-EXEMPT: substrate-migration]` marker + R86 Exception Request justifies (substrate is 1x and migration SQL drives the LOC).
- **Test LOC (carried from #492):** 431 (migration spec + service spec + prisma-test-double).
- **R74 cap:** test:src 2.0 minimum. Final ratio after this PR's 2 new tests (~80 LOC) = (431+80) / 615 = **~0.83**. **R74 NOT MET** — covered by R86 Exception Request below per operator's anti-padding doctrine (locked for H6, 2026-06-26).

### R86 Exception Request — R76 (LOC cap) — paste into PR body

```
## R100 Exception Request — R76 (LOC <= 400)

**Marker:** [LOC-EXEMPT: substrate-migration]
**Rule:** R76 / R100.A3 — 400 prod LOC max per PR
**Net prod LOC this slice:** ~615 (target: <= 400)

### Per-file no-waste justification

| File | LOC | Necessary? | Why not splittable further |
|---|---|---|---|
| `prisma/migrations/20261226000000_create_audit_log/migration.sql` | 107 | YES | CREATE TABLE + 3 indexes + 2 policies + REVOKE block + role creation. Atomic substrate; splitting the migration into two PRs would leave main in an intermediate-state schema between merges — directly violates R82 expand-contract atomicity. |
| `prisma/migrations/.../down.sql` | 24 | YES | R82 reversibility pair for the forward migration; must ship in the same PR. |
| `scripts/audit-log-retention-rotate.ts` | 167 | YES | D-H6-4 mandates archive-never-delete on 7y rotation; the rotation script must exist at substrate creation so retention is enforceable from day 1, not bolted on later. |
| `src/audit-log/audit-log.service.ts` | 61 | YES | `withAuditLog` wrapper is consumed by H6C; H6C cannot exist without it. |
| `src/audit-log/audit-log.types.ts` | 62 | YES | TS contract surface for `withAuditLog` + retention; consumed by H6B types and H6C call-site wraps. |
| `src/audit-log/audit-log.module.ts` | 16 | YES | NestJS module wiring; minimal. |
| `src/audit-log/erasure-token.ts` | 139 | YES | GDPR Art. 17 primitive + HMAC config + boot-time secret validation. Single-purpose file. Cannot split without leaving D-H6-4 unbacked. |
| `prisma/schema.prisma` | 37 | YES | Prisma model declaration — must match the migration in the same PR or `prisma generate` diverges. |
| `src/app.module.ts` | 8 | YES | Wires `AuditLogModule`; required for the service to be DI-resolvable at H6C merge. |
| `docs/audit-log.md` + ADR (190 LOC) | excluded | — | R76 explicitly excludes docs. |

### Split-feasibility evaluation

- Splitting the migration into "table + RLS" vs "indexes" leaves main with no index path during the merge window — P0 latency regression. Rejected.
- Splitting `erasure-token.ts` ahead of the table creates an orphaned utility for hours-to-days. Rejected for review-burden tradeoff.
- The retention script COULD ship in a follow-up. Justification for inclusion: D-H6-4 (LOCKED operator decision) says retention is part of the substrate.

### Operator sign-off

Marker `[LOC-EXEMPT: substrate-migration]` was pre-approved by operator on 2026-06-26 as the narrow scope-bounded justification for the H6 split.
```

### R74 — anti-padding doctrine (operator-locked for H6, 2026-06-26)

**Doctrine:** tests target real failure modes, never line-ratio targets. Padding is rejected even when it would clear R74. R74 gaps get honest R86 Exception Requests; do NOT write filler specs (per-method spy assertions, trivial getter tests, mock-everything-and-assert-spy-called) to hit a number.

**Tests this PR SHIPS (real failure modes, not padding):**

1. **`test/audit-log/erasure-token.spec.ts`** (~40 LOC) — catches: silent secret-misconfig at boot + nondeterministic tokens.
   - HMAC determinism: same `(secret, plaintext)` → same token across calls
   - Fail-fast on missing `AUDIT_LOG_ERASURE_HMAC_SECRET` at module import / boot (NOT lazy on first call)
   - Cross-secret non-equality: different secrets → different tokens for same plaintext
   - Token format invariant: matches `/^tok_[a-f0-9]{16}$/`

2. **`test/audit-log/audit-log.service.redact-pii.spec.ts`** (~40 LOC) — catches: GDPR Art. 17 contract regression (either lost audit fact OR leaked PII post-erasure).
   - After `redactPii(userId)`: `before_state` / `after_state` PII fields tokenized via `erasureToken()`
   - After `redactPii(userId)`: `entity_id`, `request_id`, `action`, `entity_type`, `created_at` PRESERVED (audit fact survives)
   - After `redactPii(userId)`: zero rows remain where any known-PII jsonb key has plaintext value (sweep via fixture)
   - Idempotent: second `redactPii` call is a no-op on already-redacted rows

**CONDITIONAL third test — verify before writing:**

Before declaring done, the builder MUST grep the carried-forward `test/audit-log/audit-log.migration.spec.ts` for explicit assertions on the post-`REVOKE UPDATE, DELETE` state. Specifically search for any test that opens a role-switched session and asserts `UPDATE audit_log` / `DELETE FROM audit_log` raise permission-denied.

- IF the carried migration spec ALREADY asserts those role-switched permission-denied paths → skip the third test. Invariant covered.
- IF the carried migration spec does NOT cover it → add `test/audit-log/audit-log.rls.spec.ts` (~50 LOC) covering:
  - `app_runtime` session → `UPDATE audit_log SET reason='x'` raises permission-denied
  - `app_runtime` session → `DELETE FROM audit_log` raises permission-denied
  - `app_runtime` session as user A → `SELECT *` returns ONLY rows where `actor_user_id = A` (RLS row-scoping)
  - `admin_role` session → `SELECT *` returns all rows
  - `app_runtime` INSERT still succeeds (writes are not blocked; only mutations are)

This test needs role-switching via `SET LOCAL ROLE app_runtime`. Use existing `prisma-test-double` patterns or open a raw `pg` client for the role-switched assertions.

**Tests this PR DELIBERATELY DOES NOT SHIP (rejected as padding):**

- Per-public-method-of-AuditLogService "the wrap is called" specs → redundant with ESLint rule `@tgp/audit-log-required` (lives in H6C, fails CI on missing wraps)
- `withAuditLog` shape tests ("returns the op result") → trivially asserted by tsc; runtime test adds no signal
- Migration up/down round-trip → covered by reversibility-gate CI workflow (once BL-CI-REVERSIBILITY-PSQL fix lands)
- Mock-Prisma-and-assert-spy-called tests for the service surface → asserts test wiring, not behavior
- Retention-rotation S3-mocked specs → high cost (mock plumbing), low marginal signal vs the in-script DELETE-rejection guard

### R86 Exception Request — R74 (paste into PR body)

```
## R100 Exception Request — R74 (test:src >= 2.0)

**Rule:** R74 / R100.A1 — test:src line ratio >= 2.0
**Final ratio this PR:** ~0.83 (target: >= 2.0)

**Why this PR does not chase 2.0:**

Operator ruled on 2026-06-26 (H6 dispatch, anti-padding doctrine): "tests target real failure modes, never line-ratio targets — padding is rejected even when it would clear R74." The shipped tests collectively cover every regression path identified for this slice via the 50-Failures + D-H6-* invariant sweep:

| Real failure mode | Test that catches it |
|---|---|
| Migration forward/reverse state divergence | `audit-log.migration.spec.ts` (carried from #492) |
| DB-level append-only invariant breaks via future grant | `audit-log.migration.spec.ts` REVOKE assertion (carried) — OR new `audit-log.rls.spec.ts` if carried spec is incomplete |
| Service contract regression on withAuditLog signature | `audit-log.service.spec.ts` (carried from #492) |
| Silent secret-misconfig at boot → random/nondeterministic tokens | `erasure-token.spec.ts` (new) |
| GDPR Art. 17 contract regression (PII leak OR lost audit fact) | `audit-log.service.redact-pii.spec.ts` (new) |

**Tests explicitly rejected as padding** (would clear ratio, add no signal): per-method spy assertions; trivial type-shape tests; mock-everything fixtures; migration round-trip duplicates of CI workflow coverage; retention-script S3-mock plumbing.

**Operator sign-off:** anti-padding doctrine pre-approved for H6 on 2026-06-26.
```

## OWNS (files you may modify)

```
prisma/migrations/20261226000000_create_audit_log/migration.sql   (NEW)
prisma/migrations/20261226000000_create_audit_log/down.sql        (NEW)
prisma/schema.prisma                                              (additive — audit_log model only)
src/audit-log/audit-log.module.ts                                 (NEW)
src/audit-log/audit-log.service.ts                                (NEW)
src/audit-log/audit-log.types.ts                                  (NEW)
src/audit-log/erasure-token.ts                                    (NEW)
src/app.module.ts                                                 (additive — register AuditLogModule)
scripts/audit-log-retention-rotate.ts                             (NEW)
docs/audit-log.md                                                 (NEW)
docs/decisions/2026-06-26-h6-audit-log-and-circuit-breakers.md    (carry forward as-is from #492)
test/audit-log/audit-log.migration.spec.ts                        (carry forward as-is)
test/audit-log/audit-log.service.spec.ts                          (carry forward as-is)
test/audit-log/prisma-test-double.ts                              (carry forward as-is)
test/audit-log/erasure-token.spec.ts                              (NEW — secret fail-fast + token determinism, ~40 LOC)
test/audit-log/audit-log.service.redact-pii.spec.ts               (NEW — GDPR Art. 17 contract, ~40 LOC)
test/audit-log/audit-log.rls.spec.ts                              (CONDITIONAL — only if carried migration spec lacks role-switched UPDATE/DELETE assertions; see R74 doctrine section)
```

## DO NOT TOUCH

- `src/circuit-breakers/**` — owned by H6B
- `eslint-rules/**`, `eslint.config.js`, any service file outside `src/audit-log/` — owned by H6C
- Any of the 8 wrapped service files (`account-deletion`, `auth`, `check-ins`, `coach`, `coach-brief`, `messaging`, `packages`, `users`) — owned by H6C
- `package.json`, `package-lock.json` (no new deps in this slice — `opossum` lives in H6B)

## Workflow

```bash
# 1. Fresh clone off main (not off PR #492)
cd /tmp && rm -rf h6a-build
git clone https://git-agent-proxy.perplexity.ai/BradleyGleavePortfolio/growth-project-backend.git h6a-build
cd h6a-build
git checkout -b wave-h6a-audit-log-substrate

# 2. Verify base SHA
test "$(git rev-parse HEAD)" = "185444e4326e61fd964c18498a3805533bd85152" || { echo "WRONG BASE — abort"; exit 1; }

# 3. Install + baseline
npm ci
npx tsc --noEmit 2>&1 | tee /tmp/h6a_baseline_tsc.txt
npm test 2>&1 | tee /tmp/h6a_baseline_tests.txt

# 4. STEP-0: copy forward the H6 carried artifacts from PR #492 (DO NOT cherry-pick the commit — it includes
#    files this slice does not own)
git fetch origin wave-h6-audit-circuit
git checkout origin/wave-h6-audit-circuit -- \
  docs/decisions/2026-06-26-h6-audit-log-and-circuit-breakers.md \
  prisma/migrations/20261226000000_create_audit_log/ \
  src/audit-log/ \
  docs/audit-log.md \
  scripts/audit-log-retention-rotate.ts \
  test/audit-log/audit-log.migration.spec.ts \
  test/audit-log/audit-log.service.spec.ts \
  test/audit-log/prisma-test-double.ts
# Re-add the prisma/schema.prisma audit_log model + src/app.module.ts wiring manually
# (don't blanket-checkout these files — they contain unrelated state we don't want to overwrite).
```

### 🛟 PUSH-EARLY-WIP — MANDATORY (R52)

The sandbox is EPHEMERAL. Push a `[WIP]` PR as soon as `tsc --noEmit` is clean against the substrate alone.

```bash
git -c user.name='Bradley Gleave' -c user.email='bradley@bradleytgpcoaching.com' \
  commit -m "feat(h6a): WIP scaffold — audit_log substrate skeleton"
git push -u origin wave-h6a-audit-log-substrate
gh pr create --draft \
  --title "[WIP] feat(h6a): audit_log substrate — 13-col table + erasure-token + 7y retention [LOC-EXEMPT: substrate-migration]" \
  --body "Carries forward H6 substrate from closed #492 per operator split ruling. Net prod LOC ~615 (R86 Exception Request inside)."
```

Continue pushing after each logical commit. Target: never hold more than ~20-30 min of un-pushed work.

## 🚨 Self-audit gates — RUN ALL THREE BEFORE DECLARING DONE

### Gate 1 — R0 ban scan (must return EMPTY)

```bash
git fetch origin main
git diff origin/main..HEAD -- 'src/**' 'scripts/**' 'prisma/**' | grep '^+' | grep -v '^+++' | \
  grep -niE 'coming soon|@ts-ignore|@ts-nocheck|as any|as unknown as|as\s+never\s+as|\bas\s+never\b|\.catch\(\s*\(\s*\)\s*=>\s*undefined\s*\)|\.catch\(\s*\(\s*\)\s*=>\s*null\s*\)|\.catch\(\s*\(\s*\)\s*=>\s*\{\s*\}\s*\)|catch\s*\([a-z_]*\)\s*\{\s*\}'
```

### Gate 2 — Build + lint + test

```bash
npx tsc --noEmit 2>&1 | tail -30                                   # ZERO errors
npm run lint -- 'src/audit-log/**' 'scripts/**' 2>&1 | tail -20    # ZERO errors
npm test -- --testPathPattern='audit-log' 2>&1 | tail -40           # ZERO failing suites
```

### Gate 3 — 50-Failures sweep on YOUR diff

Walk every CRITICAL + HIGH category. Most likely to apply HERE:

- **#1 Hardcoded Secrets** — `AUDIT_LOG_ERASURE_HMAC_SECRET` MUST come from env; fail-fast at boot if missing. Test asserts this.
- **#3 SQL Injection** — N/A: substrate uses Prisma + raw migration SQL only. No `$queryRawUnsafe` with interpolation.
- **#5 IDOR** — APPLIED: `redactPii(userId)` MUST scope by the passed `userId` ONLY, never trust caller; tested.
- **#8 Missing Input Validation** — Zod for `AuditLogArgs`; tested via existing service spec.
- **#28 Race Conditions** — APPLIED: audit row INSERT is same-tx; the unique constraint is `id` PK (uuid default), no race possible. Documented + tested.
- **#36 Silent Failures** — APPLIED: `AUDIT_LOG_FAIL_OPEN === '1'` (exact string) is the ONLY break-glass; any other audit-write error rethrows. Tested in the carried service spec.
- **#44 No DB Transactions for Multi-Step** — APPLIED: `withAuditLog` mandates a `tx` parameter; the wrapper signature does not accept a non-transactional client. Compile-enforced.
- **#46 Missing DB Validation** — APPLIED: `actor_role` is `NOT NULL` + DB-level `CHECK (actor_role IN ('user','admin','system','cron'))`. Schema-asserted.

For each, write `APPLIED — <how>` or `N/A — <reason>` in the final report.

### Gate 4 — (N/A — no UI work)

## Final report (required)

Save to `/home/user/workspace/H6A_REPORT.md`. Use the standard template:
- Files modified / created with `+N -M` per file
- Commits authored (every one as Bradley Gleave)
- Gate 1 / 2 / 3 output
- R74 attestation: state final test:src ratio + the 2 new test files (+ conditional 3rd if migration spec didn't cover REVOKE) + LOC per file + the failure mode each catches
- R86 Exception Request blocks (R76 + R74) as filed in PR body
- PR URL + final HEAD SHA

## §10 MANDATORY pre-termination output rule

Before terminating, your final output MUST include (in this exact order):

1. The PR URL (`https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/<N>`)
2. The final HEAD SHA on the branch
3. The R74 final ratio (test LOC / prod LOC) computed from `git diff --numstat origin/main..HEAD`
4. The status of all four self-audit gates: `Gate 1: EMPTY ✅ | Gate 2: tsc=0,lint=0,test=N/N ✅ | Gate 3: see report | Gate 4: N/A`
5. The VERDICT line: `VERDICT: BUILDER-COMPLETE | BUILDER-BLOCKED | INFRA_DEATH` (per R78)

If you terminate without all 5, the operator treats it as REFUSAL.

## Auth

All git network ops use `api_credentials=["github"]` in your `bash` tool calls. `gh` CLI is pre-authenticated.

## Done criteria

- PR opened (NOT merged — operator merges on dual-CLEAN audit per Q2 ruling)
- CI green on `wave-h6a-audit-log-substrate`
- All gates passed and pasted into `/home/user/workspace/H6A_REPORT.md`
- Every NEW commit authored as `Bradley Gleave <bradley@bradleytgpcoaching.com>`
- R86 Exception Request for R76 in PR body (text above)
- R86 Exception Request for R74 in PR body (text above) — 2 new test files (+ conditional 3rd) shipped against real failure modes

## Auditor will run ALL of this again, independently

Self-audit gates exist to catch what the builder forgot, NOT to replace the audit. The dual-auditor pass (Opus 4.8 Lens A + GPT-5.5 Lens B per R72) will:
- Re-run gates 1–3 from a fresh worktree
- Verify every claim in the final report against actual file:line evidence
- Sweep the full 50-Failures list independently
- Enforce R0 LAW (commit identity), R52 (push-early-wip evidence), R74/R76 (LOC math), R82 (down.sql round-trip), R98 (PII handling), R107 (audit-log doctrine), R125 (RLS Tier 1)
- Confirm the R86 Exception Requests are operator-form-compliant (per-file no-waste + split-feasibility evaluation)
- For the R74 exception specifically: verify each shipped test maps to a real failure mode in the table above; reject if any shipped test is found to be padding (per-method spy, trivial getter, mock-everything fixture)

Auto-merge stays OFF (operator Q2 ruling): operator merges on dual-CLEAN of any P0-P3 findings.
