# H6C Builder Brief — withAuditLog call-site wraps + ESLint rule + sync-write doctrine

**Codified:** 2026-06-26 by operator (Bradley Gleave), Op 50.5 dispatch.
**Lineage:** Splits closed PR #492 (`wave-h6-audit-circuit`) into PR-α / PR-β / PR-γ (this brief) per operator split ruling (2026-06-26).
**Carries D-H6-3:** wrap 12 PII-touching services with `withAuditLog()`; ESLint rule `@tgp/audit-log-required` fails CI on unwrapped writes (ratcheted to ERROR on the services brought under wraps THIS PR). LOCKED.

## Repo + branch

- Repo: `BradleyGleavePortfolio/growth-project-backend`
- Branch: `wave-h6c-audit-log-wraps-and-eslint` (base: **`wave-h6b-circuit-breakers` after it merges to main**)
- Open as `[WIP]` at first push (R52).
- PR title: `feat(h6c): withAuditLog wraps on 8 PII services + @tgp/audit-log-required ESLint rule [LOC-EXEMPT: 8-service-PII-wrap]`
- The narrow `[LOC-EXEMPT: 8-service-PII-wrap]` marker is operator-approved scope-bounded justification for THIS slice; NOT a blanket exemption. Paired with per-rule R86 Exception Request below.

## Bradley R0 LAW

Standard R0 ban list. Every commit: `Bradley Gleave <bradley@bradleytgpcoaching.com>` via inline `-c` flags. NO co-author trailers.

## Mandatory training docs

- `/tmp/tgp-agent-context/quality-references/50_FAILURES_OF_AI_GENERATED_CODE.md`
- `/tmp/tgp-agent-context/quality-references/BUILDER_BRIEF_TEMPLATE_V2.md`
- The H6 ADR (merged via H6A): `docs/decisions/2026-06-26-h6-audit-log-and-circuit-breakers.md`

## Plan doc + technical scope

### What this slice ships

1. **ESLint rule `@tgp/audit-log-required`** (`eslint-rules/audit-log-required.js`, 142 LOC):
   - Syntactic AST rule (no type-checker; runs in existing lint job, zero overhead added)
   - Flags PII-write call sites that are NOT inside a `withAuditLog(...)` closure
   - Detected patterns: `prisma.{user|coach|messaging|...}.update(...)`, `.create(...)`, `.delete(...)` on the PII-classified Prisma models
   - Allow-list mechanism: `// audit-log-required: skip — <reason>` inline comment skips the rule for that line; auditor checks each skip has a reason

2. **ESLint plugin index** (`eslint-rules/index.js`, 13 LOC) — registers the rule under `@tgp/audit-log-required`.

3. **ESLint config update** (`eslint.config.js`, +55 LOC):
   - Register the local plugin
   - Set rule severity to `error` ONLY on the 8 services this PR brings fully under wraps (per D-H6-3 ratchet-doctrine; the remaining 577 pre-existing unwrapped writes elsewhere stay at `warn` to be ratcheted per BL-DATA-CAPTURE)

4. **`withAuditLog` call-site wraps on 8 PII services** (~636 net prod LOC across these files):
   - `src/account-deletion/account-deletion.service.ts` (+145/-? net) — 4 wrap sites (user erasure, audit redaction, package cascade, session purge)
   - `src/auth/auth.service.ts` (+200/-? net) — 3 wrap sites (login, password change, MFA enable)
   - `src/check-ins/check-ins.service.ts` (+70/-? net) — 2 wrap sites (create, update)
   - `src/coach/coach.service.ts` (+125/-? net) — 3 wrap sites (profile update, client add, client remove)
   - `src/coach/brief/coach-brief.service.ts` (+334/-? net — largest churn; carry forward the refactor in #492 as-is) — 2 wrap sites
   - `src/messaging/messaging.service.ts` (+125/-? net) — 4 wrap sites (every message saved; D-H6-3 verbatim: *"I want every message saved on our DataBase"*)
   - `src/packages/packages.service.ts` (+188/-? net) — 5 wrap sites (purchase, refund, upgrade, downgrade, gift)
   - `src/users/users.service.ts` (+29/-? net) — 1 wrap site (email change)

5. **Wrap pattern (canonical)** — every wrap follows this shape:
   ```typescript
   return prisma.$transaction(async (tx) => {
     return this.auditLog.withAuditLog(
       tx,
       {
         actorUserId: ctx.userId,
         actorRole: 'user',
         action: 'user.email_changed',
         entityType: 'User',
         entityId: ctx.userId,
         beforeState: { email: erasureToken(currentEmail) },
         afterState: { email: erasureToken(newEmail) },
         requestId: ctx.requestId,
       },
       () => tx.user.update({ where: { id: ctx.userId }, data: { email: newEmail } }),
     );
   });
   ```
   Key invariants:
   - The PII fields in `beforeState` / `afterState` MUST go through `erasureToken()` (R98)
   - The `tx` parameter must be the SAME transaction client used in the op (D-H6-5; compile-enforced by the wrapper signature)
   - When the wrapped client is ALSO breaker-wrapped (Stripe / Mux / SendGrid / AI services), nesting order is: `withAuditLog(tx, args, () => breakerWrapped(() => clientCall()))` — audit on the OUTSIDE, breaker on the INSIDE

6. **`package.json`** (+2 LOC) — register `eslint-plugin-tgp` local path (or relocate to `eslint-rules/`-as-plugin pattern already established).

### What this slice EXPLICITLY does NOT ship

- NO `audit_log` table or service — assumed already merged via H6A.
- NO circuit breakers — assumed already merged via H6B.
- NO wraps on the 4 OTHER PII services in the D-H6-3 candidate list (12 total, only 8 wrapped here). The remaining 4 ride BL-DATA-CAPTURE per the ratchet-doctrine.

### Numeric thresholds

- **Prod LOC (net):** ~460. **R76 cap 400 — OVER by ~60 LOC** — `[LOC-EXEMPT: 8-service-PII-wrap]` marker + R86 Exception Request justifies.
- **Test LOC (current from #492 carry-forward):** 153 (ESLint rule spec).
- **Test LOC after this PR's 2 new tests (~100 LOC):** ~253.
- **R74 ratio:** 253 / 460 = **0.55**. Below 2.0; covered by R86 Exception Request below per operator's anti-padding doctrine.

### R86 Exception Request — R76 (paste into PR body)

```
## R100 Exception Request — R76 (LOC <= 400)

**Marker:** [LOC-EXEMPT: 8-service-PII-wrap]
**Rule:** R76 / R100.A3 — 400 prod LOC max per PR
**Net prod LOC this slice:** ~460 (target: <= 400)

### Per-file no-waste justification

| File | LOC | Necessary? | Why not splittable further |
|---|---|---|---|
| `eslint-rules/audit-log-required.js` | 142 | YES | The ESLint rule is the doctrine enforcement mechanism (D-H6-3). Without it shipping in the same PR as the wraps, future PRs can silently regress unwrapped writes — the rule must land alongside the first batch of ratcheted services. |
| `eslint-rules/index.js` | 13 | YES | Plugin entry point; trivial. |
| `eslint.config.js` | +55 | YES | Per-file rule-severity ratchet config — must enumerate the 8 services so future ratchets (BL-DATA-CAPTURE) just append. |
| 8 wrapped service files | ~636 / -483 net ~150 added | YES | Each service is a single coherent PII boundary. Splitting into "wrap account-deletion + users" vs "wrap auth + check-ins" vs etc would create N PRs each fighting the same ESLint config + each individually under-tested. The wraps share the canonical pattern and review burden is dominated by the pattern, not the count. |
| `package.json` | +2 | YES | Plugin registration. |

### Split-feasibility evaluation

- Splitting wraps into "low-PII services" (users, check-ins) vs "high-PII services" (account-deletion, auth, messaging, packages) is feasible but creates an asymmetric trust window: the ESLint rule ratchets to error on a partial set, then we'd have N rounds of "add the rule severity + add the wraps" PR pairs. Single-PR ratchet (this slice) is cleaner.
- Pre-existing 577 unwrapped writes in other services (NOT in the 8 owned by this slice) intentionally stay at `warn`, not `error`, per the ratchet-doctrine codified in the H6 ADR.

### Operator sign-off

Marker `[LOC-EXEMPT: 8-service-PII-wrap]` pre-approved by operator on 2026-06-26 as the narrow scope-bounded justification for this slice of the H6 split.
```

### R74 — anti-padding doctrine (operator-locked for H6, 2026-06-26)

**Doctrine:** tests target real failure modes, never line-ratio targets. Padding is rejected even when it would clear R74.

**Tests this PR SHIPS (real failure modes, not padding):**

1. **`test/audit-log/eslint-rule.spec.ts`** (153 LOC, carried from #492 as-is) — catches: ESLint rule false-negatives (PII-write call site that should fail lint but passes) and false-positives (lawful non-PII write that gets flagged). Already exercises the AST patterns + the allow-list comment mechanism.

2. **`test/audit-log/scrub-flow.e2e.spec.ts`** (~80 LOC, NEW) — catches: order-of-operations regression in account deletion that silently breaks GDPR/CCPA compliance. **Single highest-value test in the whole H6 wave.**
   - Setup: create user with PII (email, phone, name) + populated audit history → trigger account deletion
   - Assert sequence under one transaction:
     1. `withAuditLog` wrote a sealed audit row for the deletion event BEFORE the scrub ran
     2. `erasureToken()` was applied to the audit row's `before_state` PII fields (no plaintext email/phone/name remains)
     3. Original user row deleted from `User` table
     4. Audit row still exists (archive-never-delete)
     5. Audit row's `before_state` PII fields are tokens (`tok_…`), NOT plaintext
     6. `entity_id`, `request_id`, `action`, `entity_type`, `created_at` PRESERVED (audit fact intact)
   - Failure mode it catches: any future refactor that breaks order-of-ops (scrub-before-audit; skipping the erasureToken apply; leaving raw PII in `before_state`). If this breaks, GDPR/CCPA compliance breaks silently — no other test detects it.

3. **`test/audit-log/audit-log.perf.spec.ts`** (~20 LOC, NEW) — catches: sync-write latency regression. D-H6-5 locked sync writes; this is the guardrail.
   - Wrap a no-op service method with `withAuditLog`, run 100 iterations, measure
   - Assert p95 added overhead < 5ms (compare wrapped vs unwrapped iterations on the same machine; subtract baseline)
   - Failure mode it catches: future regression where someone adds a sync DB call (e.g., a synchronous external lookup) inside `withAuditLog` and ships a 50ms-per-request latency hit invisible to unit tests
   - Note: this is a microbenchmark, not a load test. CI variance is expected; use `Math.percentile(samples, 0.95)` over 100 samples. If CI variance proves too noisy in practice, switch the assert from "<5ms" to "<3x unwrapped baseline" — still a real guardrail.

**Tests this PR DELIBERATELY DOES NOT SHIP (rejected as padding):**

- Per-service "withAuditLog is called on method X" specs — redundant with the ESLint rule (which fails CI on missing wraps)
- Per-service "wrap signature matches" tests — trivially asserted by tsc
- Per-PII-field "this field is tokenized" enumeration tests — covered by the e2e scrub spec via the no-plaintext sweep
- Mock-AuditLogService-and-verify-call-shape tests — asserts wiring, not behavior
- E2E "user can still log in after wraps applied" — that's regression testing of unaffected behavior; covered by existing auth.service tests

### R86 Exception Request — R74 (paste into PR body)

```
## R100 Exception Request — R74 (test:src >= 2.0)

**Rule:** R74 / R100.A1 — test:src line ratio >= 2.0
**Final ratio this PR:** 0.55 (target: >= 2.0)

**Why this PR does not chase 2.0:**

Operator ruled on 2026-06-26 (H6 dispatch, anti-padding doctrine): "tests target real failure modes, never line-ratio targets — padding is rejected even when it would clear R74." The shipped tests cover every regression path identified for this slice:

| Real failure mode | Test that catches it |
|---|---|
| ESLint rule false-negatives (unwrapped PII write passes lint) | `eslint-rule.spec.ts` (carried) |
| ESLint rule false-positives (lawful non-PII write blocked) | `eslint-rule.spec.ts` (carried) |
| Allow-list comment mechanism broken | `eslint-rule.spec.ts` (carried) |
| GDPR/CCPA compliance broken via order-of-ops regression in deletion (HIGHEST VALUE) | `scrub-flow.e2e.spec.ts` (new) |
| Plaintext PII leaks into audit_log.before_state post-erasure | `scrub-flow.e2e.spec.ts` (new) |
| Audit fact (entity_id, request_id, action) lost during scrub | `scrub-flow.e2e.spec.ts` (new) |
| Sync-write latency balloon (D-H6-5 guardrail) | `audit-log.perf.spec.ts` (new) |

**Tests explicitly rejected as padding** (would clear ratio, add no signal): per-service "the wrap is called" spy assertions (redundant with ESLint rule); per-field tokenization enumeration (covered by e2e sweep); tsc-redundant signature tests; mock-AuditLogService wiring tests; E2E regression tests of unaffected behavior.

**Operator sign-off:** anti-padding doctrine pre-approved for H6 on 2026-06-26.
```

## OWNS

```
eslint-rules/audit-log-required.js                          (NEW)
eslint-rules/index.js                                       (NEW)
eslint.config.js                                            (additive — register plugin + 8-service ratchet)
package.json                                                (+2 lines: plugin registration)
package-lock.json                                           (generated)
src/account-deletion/account-deletion.service.ts            (wraps)
src/auth/auth.service.ts                                    (wraps)
src/check-ins/check-ins.service.ts                          (wraps)
src/coach/coach.service.ts                                  (wraps)
src/coach/brief/coach-brief.service.ts                      (wraps + carried refactor)
src/messaging/messaging.service.ts                          (wraps — every message saved per D-H6-3)
src/packages/packages.service.ts                            (wraps)
src/users/users.service.ts                                  (wraps)
test/audit-log/eslint-rule.spec.ts                          (carry forward as-is)
test/audit-log/scrub-flow.e2e.spec.ts                       (NEW — order-of-ops + GDPR contract, ~80 LOC)
test/audit-log/audit-log.perf.spec.ts                       (NEW — sync-write p95 guardrail, ~20 LOC)
```

## DO NOT TOUCH

- `src/audit-log/**`, `prisma/migrations/2026122600000*`, `scripts/audit-log-retention-rotate.ts`, `docs/audit-log.md` — owned by H6A
- `src/circuit-breakers/**`, `src/main.ts` (filter registration), `src/billing/stripe-api.service.ts`, `src/video/mux.service.ts`, `src/email/email.service.ts`, `src/ai/**`, `src/first-win/**`, `src/diagnostic/**`, `docs/circuit-breakers.md` — owned by H6B. **EXCEPTION:** if a breaker-wrapped service ALSO needs a withAuditLog wrap (e.g., a Stripe call site that mutates billing PII), add the audit wrap at the OUTERMOST layer (`withAuditLog(tx, args, () => breakerWrapped(() => stripeCall()))`) and document the nesting in the PR description. The breaker config is NOT changed; only the audit wrap is added.

## Workflow

```bash
# 1. Wait for H6B to merge to main. Verify:
cd /tmp && rm -rf h6c-build
git clone https://git-agent-proxy.perplexity.ai/BradleyGleavePortfolio/growth-project-backend.git h6c-build
cd h6c-build
git log --oneline | head -10  # confirm H6A + H6B merge commits on main
test -f src/circuit-breakers/circuit-breaker.factory.ts || { echo "H6B NOT MERGED — abort"; exit 1; }
test -f src/audit-log/audit-log.service.ts || { echo "H6A NOT MERGED — abort"; exit 1; }

# 2. Branch off post-H6B main
git checkout -b wave-h6c-audit-log-wraps-and-eslint

# 3. Install + baseline
npm ci
npx tsc --noEmit 2>&1 | tee /tmp/h6c_baseline_tsc.txt
npm test 2>&1 | tee /tmp/h6c_baseline_tests.txt

# 4. STEP-0: copy forward H6C carried artifacts from PR #492
git fetch origin wave-h6-audit-circuit
git checkout origin/wave-h6-audit-circuit -- \
  eslint-rules/ \
  test/audit-log/eslint-rule.spec.ts
# Manually apply eslint.config.js delta + package.json +2 lines, then npm install
# Manually apply the 8 service-file wraps (NOT blanket-checkout — files may have changed on main post-H6A/B):
#   src/account-deletion/account-deletion.service.ts  — 4 wrap sites
#   src/auth/auth.service.ts                          — 3 wrap sites
#   src/check-ins/check-ins.service.ts                — 2 wrap sites
#   src/coach/coach.service.ts                        — 3 wrap sites
#   src/coach/brief/coach-brief.service.ts            — 2 wrap sites + carried refactor
#   src/messaging/messaging.service.ts                — 4 wrap sites
#   src/packages/packages.service.ts                  — 5 wrap sites
#   src/users/users.service.ts                        — 1 wrap site
# Then write the 2 new test files (scrub-flow.e2e.spec.ts + audit-log.perf.spec.ts)
```

### 🛟 PUSH-EARLY-WIP — MANDATORY (R52)

```bash
git -c user.name='Bradley Gleave' -c user.email='bradley@bradleytgpcoaching.com' \
  commit -m "feat(h6c): WIP scaffold — ESLint rule + plugin registration"
git push -u origin wave-h6c-audit-log-wraps-and-eslint
gh pr create --draft \
  --title "[WIP] feat(h6c): withAuditLog wraps on 8 PII services + @tgp/audit-log-required ESLint rule [LOC-EXEMPT: 8-service-PII-wrap]" \
  --body "Composes on H6A+H6B. Net prod LOC ~460 (R86 Exception inside). R74 ratio 0.55 (R86 Exception inside, anti-padding doctrine)."
```

## 🚨 Self-audit gates

### Gate 1 — R0 ban scan (EMPTY)

```bash
git fetch origin main
git diff origin/main..HEAD -- 'src/**' 'eslint-rules/**' | grep '^+' | grep -v '^+++' | \
  grep -niE 'coming soon|@ts-ignore|@ts-nocheck|as any|as unknown as|as\s+never\s+as|\bas\s+never\b|\.catch\(\s*\(\s*\)\s*=>\s*undefined\s*\)|\.catch\(\s*\(\s*\)\s*=>\s*null\s*\)|\.catch\(\s*\(\s*\)\s*=>\s*\{\s*\}\s*\)|catch\s*\([a-z_]*\)\s*\{\s*\}'
```

### Gate 2 — Build + lint + test

```bash
npx tsc --noEmit 2>&1 | tail -30                                                          # ZERO
npm run lint -- 'src/**' 2>&1 | tail -20                                                  # ZERO (the ratchet is now ERROR on the 8 services — they MUST all be wrapped or lint fails)
npm test -- --testPathPattern='audit-log|account-deletion|auth|check-ins|coach|messaging|packages|users' 2>&1 | tail -40  # ZERO failing
```

### Gate 3 — 50-Failures sweep

Most likely to apply:

- **#1 Hardcoded Secrets** — N/A: no new env reads in this slice.
- **#5 IDOR** — APPLIED: every wrap uses `actorUserId: ctx.userId` from auth context, NEVER from request body. Verify in every wrap site.
- **#8 Missing Input Validation** — APPLIED: existing Zod validation on each service entrypoint preserved; wraps are inside the validation boundary.
- **#12 Secrets in Error Messages** — APPLIED: `redactErrorMessage()` is called before any structured log of a failed wrap (the wrap rethrows; the catching layer redacts).
- **#28 Race Conditions** — APPLIED: every wrap is inside `prisma.$transaction(async (tx) => ...)`; the same `tx` flows into `withAuditLog` (D-H6-5).
- **#34 No Logging or Observability** — APPLIED: every wrap emits a structured audit row; that IS the observability primitive.
- **#36 Silent Failures** — APPLIED: wraps rethrow audit failure (with `AUDIT_LOG_FAIL_OPEN === '1'` break-glass); no silent swallow.
- **#44 No DB Transactions for Multi-Step** — APPLIED: every wrap inside `$transaction`. Compile-enforced by the wrapper signature.
- **#46 Missing DB Validation** — APPLIED: wraps DO NOT bypass any existing Prisma constraint; the underlying `tx.user.update(...)` etc. still honors `@unique`, `@@check`, `NOT NULL`.

For each, write `APPLIED — <how>` or `N/A — <reason>` in the final report.

### Gate 4 — N/A

## Final report (required)

Save to `/home/user/workspace/H6C_REPORT.md`:
- Files modified / created (`+N -M`)
- Commits authored (every one as Bradley Gleave)
- Gate 1 / 2 / 3 output (especially: full `npm run lint -- 'src/**'` tail showing ZERO errors with the ESLint rule at ERROR severity on the 8 services)
- R74 attestation: state final ratio + the 3 test files (1 carried + 2 new) + the failure modes each catches
- R86 Exception Request blocks (R76 + R74) as filed in PR body
- **Wrap-count audit:** for each of the 8 services, count the wrap sites in your diff and confirm it matches the brief (acc-del 4, auth 3, check-ins 2, coach 3, coach-brief 2, messaging 4, packages 5, users 1 = 24 total)
- PR URL + final HEAD SHA

## §10 MANDATORY pre-termination output rule

Your final output MUST include (in this order):

1. PR URL
2. Final HEAD SHA
3. R74 final ratio + total wrap-site count
4. Gate status line: `Gate 1: EMPTY ✅ | Gate 2: tsc=0,lint=0,test=N/N ✅ | Gate 3: see report | Gate 4: N/A`
5. VERDICT: `BUILDER-COMPLETE | BUILDER-BLOCKED | INFRA_DEATH` (per R78)

## Auth

`api_credentials=["github"]` for git network ops. `gh` is pre-authenticated.

## Done criteria

- PR opened off post-H6B-merge main
- CI green (incl. the ESLint rule at ERROR on the 8 services — if ANY of those services has an unwrapped PII write, CI fails)
- All gates passed and pasted into report
- Every NEW commit as `Bradley Gleave <bradley@bradleytgpcoaching.com>`
- R86 Exception Request for R76 in PR body (`[LOC-EXEMPT: 8-service-PII-wrap]`)
- R86 Exception Request for R74 in PR body
- All 24 wrap sites accounted for with the canonical pattern (PII via erasureToken, same `tx`, audit-outside-breaker when nested)
- 2 new test files shipped: `scrub-flow.e2e.spec.ts` + `audit-log.perf.spec.ts`

## Auditor will run ALL of this again, independently

Dual-auditor pass (Opus 4.8 + GPT-5.5 per R72) re-runs gates 1–3 from fresh worktree; sweeps 50-Failures; verifies every wrap site uses `erasureToken()` for PII fields and the same `tx` for the op + audit row; verifies `actorUserId` always comes from auth context not request body; runs the e2e scrub flow under a real Postgres + asserts the order-of-ops invariant; runs the perf spec under CI and confirms p95 < 5ms (or under the agreed 3x baseline fallback); rejects any test found to be padding per the operator's anti-padding doctrine.

The ESLint rule at ERROR on the 8 services is the doctrinal guardrail going forward — any future PR that adds an unwrapped PII write in those services will fail CI. The 4 remaining D-H6-3 services ride BL-DATA-CAPTURE per the ratchet-doctrine.

Auto-merge stays OFF (Q2 ruling): operator merges on dual-CLEAN of any P0-P3 findings.
