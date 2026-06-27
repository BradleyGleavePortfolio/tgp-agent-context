# H6B Builder Brief — per-client circuit breakers (Opossum factory + filter + 7 wrapped clients)

**Codified:** 2026-06-26 by operator (Bradley Gleave), Op 50.5 dispatch.
**Lineage:** Splits closed PR #492 (`wave-h6-audit-circuit`) into PR-α / PR-β (this brief) / PR-γ per operator split ruling (2026-06-26).
**Carries D-H6-2:** per-client Opossum config (Stripe 15s/50%, Mux 10s/50%, SendGrid 5s/30%, default 8s/50%, all 30s reset). LOCKED.

## Repo + branch

- Repo: `BradleyGleavePortfolio/growth-project-backend`
- Branch: `wave-h6b-circuit-breakers` (base: **`wave-h6a-audit-log-substrate` after it merges to main**)
- Open as `[WIP]` at first push (R52).
- PR title: `feat(h6b): per-client circuit breakers — Opossum factory + 7 wrapped clients`
- **No exemption marker** — this slice's net prod LOC is ~311, under R76's 400 cap.

## Bradley R0 LAW

Operator directive (2026-06-13): every commit authored as `Bradley Gleave <bradley@bradleytgpcoaching.com>` via inline `-c` flags. NO co-author trailers, NO assistant attribution. Standard R0 ban list applies (no `coming soon`, no `@ts-ignore`/`@ts-nocheck`, no `as any`/`as unknown as`/`as never`, no `.catch(()=>undefined|null|{})`, no `catch(e){}`).

## Mandatory training docs

- `/tmp/tgp-agent-context/quality-references/50_FAILURES_OF_AI_GENERATED_CODE.md`
- `/tmp/tgp-agent-context/quality-references/BUILDER_BRIEF_TEMPLATE_V2.md`
- The H6 ADR (now merged via H6A): `docs/decisions/2026-06-26-h6-audit-log-and-circuit-breakers.md`

## Plan doc + technical scope

### What this slice ships

1. **`src/circuit-breakers/circuit-breaker.constants.ts`** (43 LOC) — per-client config table. D-H6-2 LOCKED values:
   - Stripe: `timeout: 15_000`, `errorThresholdPercentage: 50`, `resetTimeout: 30_000`
   - Mux: `timeout: 10_000`, `errorThresholdPercentage: 50`, `resetTimeout: 30_000`
   - SendGrid: `timeout: 5_000`, `errorThresholdPercentage: 30`, `resetTimeout: 30_000`
   - default (OpenAI / Anthropic / first-win / ai-roadmap): `timeout: 8_000`, `errorThresholdPercentage: 50`, `resetTimeout: 30_000`
   - `VOLUME_THRESHOLD = 20` (factory minimum-sample guard — breakers do not trip on < 20 sampled calls; prevents thrashing on cold start)

2. **`src/circuit-breakers/circuit-breaker.factory.ts`** (114 LOC) — `createBreaker(name, opts, fn)`:
   - Wraps Opossum with constants merge + name registration
   - Emits structured logs on `open` / `halfOpen` / `close` state transitions (#34 observability)
   - Records breaker name in error.cause for the filter to map → 503
   - Returns a typed function with same arity as `fn`

3. **`src/circuit-breakers/circuit-open.filter.ts`** (48 LOC) — NestJS `ExceptionFilter`:
   - Catches `CircuitOpenError` (Opossum's open-circuit signal)
   - Maps to HTTP 503 with `Retry-After: 30` header
   - Structured log of breaker name + circuit state at filter time
   - Registered globally in `src/main.ts`

4. **`src/circuit-breakers/circuit-breakers.module.ts`** (20 LOC) — NestJS module exporting the factory.

5. **7 wrapped clients** — each existing client file gets a factory-wrapped call wrapper at the outermost HTTP boundary. NO mutation of business logic:
   - `src/billing/stripe-api.service.ts` (41 LOC delta) — wrap Stripe SDK call site
   - `src/video/mux.service.ts` (64 LOC delta) — wrap Mux SDK call site
   - `src/email/email.service.ts` (62 LOC delta) — wrap SendGrid send call site
   - `src/ai/ai.service.ts` (265 LOC delta — largest service; wrap is small, the file already had refactor churn in #492 that we carry forward) — wrap OpenAI client call sites
   - `src/ai/adapters/anthropic.adapter.ts` (135 LOC delta) — wrap Anthropic client call site
   - `src/first-win/first-win.service.ts` (33 LOC delta) — wrap OpenAI first-win flow
   - `src/diagnostic/ai-roadmap.service.ts` (50 LOC delta) — wrap OpenAI roadmap flow

6. **`src/main.ts`** (+2 LOC) — register `CircuitOpenFilter` globally.

7. **`docs/circuit-breakers.md`** (103 LOC) — operator-facing reference: per-client thresholds, state machine, observability, runbook for "Stripe breaker is open".

8. **`package.json` + `package-lock.json`** — add `opossum` dep (one line in package.json; lockfile generated, exempt from LOC count).

### What this slice EXPLICITLY does NOT ship

- NO `audit_log` table or `AuditLogService` — assumed already merged via H6A.
- NO call-site `withAuditLog` wraps on services — owned by H6C.
- NO ESLint `@tgp/audit-log-required` rule — owned by H6C.

### Numeric thresholds

- **Prod LOC (net):** ~311. **R76 cap 400 — PASSES.** No LOC-EXEMPT marker needed.
- **Test LOC (carried from #492):** 259 (`circuit-breaker.factory.spec.ts` 173 + `circuit-open.filter.spec.ts` 86).
- **R74 ratio:** 259 / 311 = **0.83**. Below 2.0 cap; covered by R86 Exception Request below per operator's anti-padding doctrine.

### R74 — anti-padding doctrine (operator-locked for H6, 2026-06-26)

**Doctrine:** tests target real failure modes, never line-ratio targets. Padding is rejected even when it would clear R74.

**Tests this PR SHIPS (carried from #492 as-is — already cover the right failure modes):**

| File | LOC | Failure mode it catches |
|---|---|---|
| `test/circuit-breakers/circuit-breaker.factory.spec.ts` | 173 | State transitions (closed → open → halfOpen → close); per-client config isolation (changing Stripe threshold does not affect Mux); `VOLUME_THRESHOLD` guard prevents cold-start thrashing |
| `test/circuit-breakers/circuit-open.filter.spec.ts` | 86 | `CircuitOpenError` correctly maps to HTTP 503; `Retry-After: 30` header present; structured log includes breaker name |

**Tests this PR DELIBERATELY DOES NOT SHIP (rejected as padding):**

- "Each wrapped service still returns its original type" — trivially asserted by tsc; runtime test adds no signal
- Per-wrapped-service "the breaker is invoked" mock-spy specs — duplicates the factory state-transition spec
- Mock-Opossum-and-verify-call-shape tests — asserts library wiring, not behavior
- E2E "Stripe call goes through" tests — that's integration territory, not unit coverage; the factory state-transition spec is the right abstraction

### R86 Exception Request — R74 (paste into PR body)

```
## R100 Exception Request — R74 (test:src >= 2.0)

**Rule:** R74 / R100.A1 — test:src line ratio >= 2.0
**Final ratio this PR:** 0.83 (target: >= 2.0)

**Why this PR does not chase 2.0:**

Operator ruled on 2026-06-26 (H6 dispatch, anti-padding doctrine): "tests target real failure modes, never line-ratio targets — padding is rejected even when it would clear R74." The 2 shipped tests cover every regression path identified for this slice:

| Real failure mode | Test that catches it |
|---|---|
| Breaker fails to transition closed → open under load | `circuit-breaker.factory.spec.ts` state-transition block |
| Stripe config change silently affects Mux (per-client isolation broken) | `circuit-breaker.factory.spec.ts` isolation block |
| Cold-start thrashing (breaker trips on first failed call) | `circuit-breaker.factory.spec.ts` VOLUME_THRESHOLD block |
| Open-circuit error returns 500 instead of 503 (loses retry signal to client) | `circuit-open.filter.spec.ts` |
| Filter loses `Retry-After` header → client retries immediately | `circuit-open.filter.spec.ts` |

**Tests explicitly rejected as padding** (would clear ratio, add no signal): per-wrapped-service "breaker is invoked" spy assertions; mock-Opossum library-wiring tests; tsc-redundant return-type tests; E2E call-through tests (wrong abstraction layer).

**Operator sign-off:** anti-padding doctrine pre-approved for H6 on 2026-06-26.
```

## OWNS

```
src/circuit-breakers/circuit-breaker.constants.ts    (NEW)
src/circuit-breakers/circuit-breaker.factory.ts      (NEW)
src/circuit-breakers/circuit-breakers.module.ts      (NEW)
src/circuit-breakers/circuit-open.filter.ts          (NEW)
src/main.ts                                          (additive — global filter registration)
src/billing/stripe-api.service.ts                    (additive — Stripe SDK call wrap)
src/video/mux.service.ts                             (additive — Mux SDK call wrap)
src/email/email.service.ts                           (additive — SendGrid send wrap)
src/ai/ai.service.ts                                 (additive + carried churn — OpenAI client wraps)
src/ai/adapters/anthropic.adapter.ts                 (additive — Anthropic client wrap)
src/first-win/first-win.service.ts                   (additive — OpenAI first-win wrap)
src/diagnostic/ai-roadmap.service.ts                 (additive — OpenAI roadmap wrap)
docs/circuit-breakers.md                             (NEW)
package.json                                         (+1 line: opossum dep)
package-lock.json                                    (generated)
test/circuit-breakers/circuit-breaker.factory.spec.ts (carry forward as-is)
test/circuit-breakers/circuit-open.filter.spec.ts     (carry forward as-is)
```

## DO NOT TOUCH

- `src/audit-log/**`, `prisma/migrations/2026122600000*` — owned by H6A (now merged)
- `eslint-rules/**`, `eslint.config.js`, any of the 8 PII-wrapped services (`account-deletion`, `auth`, `check-ins`, `coach`, `coach-brief`, `messaging`, `packages`, `users`) — owned by H6C
- Any breaker-wrapped service file MUST NOT receive a `withAuditLog` wrap in this PR (that's H6C). The breaker wrap and the audit wrap are SEPARATE PRs even when they would touch the same file. Wrap order in H6C is: `withAuditLog(tx, args, () => breakerWrapped(() => clientCall()))`.

## Workflow

```bash
# 1. Wait for H6A to merge to main. Verify:
cd /tmp && rm -rf h6b-build
git clone https://git-agent-proxy.perplexity.ai/BradleyGleavePortfolio/growth-project-backend.git h6b-build
cd h6b-build
git log --oneline | head -5  # confirm H6A merge commit is on main
test -f src/audit-log/audit-log.service.ts || { echo "H6A NOT MERGED — abort"; exit 1; }
test -f prisma/migrations/20261226000000_create_audit_log/migration.sql || { echo "H6A NOT MERGED — abort"; exit 1; }

# 2. Branch off post-H6A main
git checkout -b wave-h6b-circuit-breakers

# 3. Install + baseline
npm ci
npx tsc --noEmit 2>&1 | tee /tmp/h6b_baseline_tsc.txt
npm test 2>&1 | tee /tmp/h6b_baseline_tests.txt

# 4. STEP-0: copy forward H6B carried artifacts from PR #492
git fetch origin wave-h6-audit-circuit
git checkout origin/wave-h6-audit-circuit -- \
  src/circuit-breakers/ \
  test/circuit-breakers/ \
  docs/circuit-breakers.md
# Manually apply: src/main.ts +2 lines, package.json +1 line opossum dep, then npm install
# Manually re-apply the 7 service-file wraps (DO NOT blanket-checkout these — they may have changed on
# main post-H6A; cherry-pick the wrap-only hunks):
#   src/billing/stripe-api.service.ts
#   src/video/mux.service.ts
#   src/email/email.service.ts
#   src/ai/ai.service.ts          # largest churn; review carefully — keep only the breaker wrap, drop any audit-log wrap that snuck in
#   src/ai/adapters/anthropic.adapter.ts
#   src/first-win/first-win.service.ts
#   src/diagnostic/ai-roadmap.service.ts
```

### 🛟 PUSH-EARLY-WIP — MANDATORY (R52)

```bash
git -c user.name='Bradley Gleave' -c user.email='bradley@bradleytgpcoaching.com' \
  commit -m "feat(h6b): WIP scaffold — circuit-breaker factory + constants"
git push -u origin wave-h6b-circuit-breakers
gh pr create --draft \
  --title "[WIP] feat(h6b): per-client circuit breakers — Opossum factory + 7 wrapped clients" \
  --body "Composes on H6A. Net prod LOC ~311 (R76 PASSES). R74 ratio 0.83 (R86 Exception inside, anti-padding doctrine)."
```

## 🚨 Self-audit gates

### Gate 1 — R0 ban scan (EMPTY)

```bash
git fetch origin main
git diff origin/main..HEAD -- 'src/**' | grep '^+' | grep -v '^+++' | \
  grep -niE 'coming soon|@ts-ignore|@ts-nocheck|as any|as unknown as|as\s+never\s+as|\bas\s+never\b|\.catch\(\s*\(\s*\)\s*=>\s*undefined\s*\)|\.catch\(\s*\(\s*\)\s*=>\s*null\s*\)|\.catch\(\s*\(\s*\)\s*=>\s*\{\s*\}\s*\)|catch\s*\([a-z_]*\)\s*\{\s*\}'
```

### Gate 2 — Build + lint + test

```bash
npx tsc --noEmit 2>&1 | tail -30                                          # ZERO
npm run lint -- 'src/circuit-breakers/**' 'src/main.ts' 2>&1 | tail -20   # ZERO
npm test -- --testPathPattern='circuit-breakers' 2>&1 | tail -40           # ZERO failing
```

### Gate 3 — 50-Failures sweep

Most likely to apply:

- **#10 Vulnerable Deps** — APPLIED: `opossum` is the new dep. Run `npm audit --audit-level=high` after install; paste tail into report. If any HIGH or CRITICAL advisory exists against opossum at the pinned version, switch to a manually-implemented breaker (see ADR alternatives section); do not ship with a HIGH advisory.
- **#34 No Logging or Observability** — APPLIED: every breaker state transition (`open` / `halfOpen` / `close`) emits a structured log with the breaker name; tested.
- **#35 Missing API Timeout Handling** — APPLIED: every Opossum-wrapped call has the per-client `timeout` config; the breaker timeout serves as the per-call deadline. **AND** the underlying HTTP client MUST still have `signal: AbortSignal.timeout(N)` — Opossum timing out the wrapper does NOT abort an in-flight `fetch` socket. If any of the 7 services lacks `AbortSignal.timeout`, ADD it in this PR (under the LOC cap).
- **#36 Silent Failures** — APPLIED: `CircuitOpenError` is NOT silently swallowed; mapped to 503 via filter with structured log. Tested.
- **#50 No Graceful Degradation** — APPLIED: open circuit returns 503 + `Retry-After: 30`. Client can degrade gracefully.

For each, write `APPLIED — <how>` or `N/A — <reason>` in the final report.

### Gate 4 — N/A (no UI)

## Final report (required)

Save to `/home/user/workspace/H6B_REPORT.md`:
- Files modified / created (`+N -M`)
- Commits authored (every one as Bradley Gleave)
- Gate 1 / 2 / 3 output (incl. `npm audit` tail for opossum)
- R74 attestation: state final ratio + the 2 carried test files + the 5 failure modes they cover
- R86 Exception Request for R74 as filed in PR body
- PR URL + final HEAD SHA

## §10 MANDATORY pre-termination output rule

Your final output MUST include (in this order):

1. PR URL
2. Final HEAD SHA
3. R74 final ratio
4. Gate status line: `Gate 1: EMPTY ✅ | Gate 2: tsc=0,lint=0,test=N/N ✅ | Gate 3: see report | Gate 4: N/A`
5. VERDICT: `BUILDER-COMPLETE | BUILDER-BLOCKED | INFRA_DEATH` (per R78)

## Auth

`api_credentials=["github"]` for git network ops. `gh` is pre-authenticated.

## Done criteria

- PR opened off post-H6A-merge main
- CI green
- All gates passed and pasted into report
- Every NEW commit as `Bradley Gleave <bradley@bradleytgpcoaching.com>`
- R86 Exception Request for R74 in PR body
- No LOC-EXEMPT marker needed (verify final prod LOC under 400 in report)

## Auditor will run ALL of this again, independently

Dual-auditor pass (Opus 4.8 + GPT-5.5 per R72) re-runs gates 1–3 from fresh worktree; sweeps 50-Failures; verifies the per-client config values exactly match D-H6-2 (Stripe 15s/50%, Mux 10s/50%, SendGrid 5s/30%, default 8s/50%, all 30s reset); confirms `VOLUME_THRESHOLD=20`; rejects any test found to be padding per the operator's anti-padding doctrine.

Auto-merge stays OFF (Q2 ruling): operator merges on dual-CLEAN of any P0-P3 findings.
