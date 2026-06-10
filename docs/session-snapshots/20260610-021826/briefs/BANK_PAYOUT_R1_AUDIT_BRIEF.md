# R1 AUDIT — PR #374 Bank Payout / ACH Phase A

**You are the GPT-5.5 R1 auditor. You did NOT build this. You are a different agent in a different worktree per R31. Verify ONLY — do not modify source code.**

## Repo & worktree
- Worktree: `/home/user/workspace/tgp/backend-ach-payout-audit` (detached HEAD at `deb9d52`)
- Branch under review: `feature/bank-payout-ach` (PR #374, head `deb9d5292509f6d571d872c5803208a9ff5eb1e8`, base `9322eeb`)
- Repo: `BradleyGleavePortfolio/growth-project-backend`

## Output deliverable
1. Create a NEW branch off the audit worktree HEAD: `audit/r1-pr-374`.
2. Write a SINGLE file `AUDIT_R1_PR_374_REPORT.md` at the repo root with one section per gate below.
3. Commit (title only, author `Dynasia G <dynasia@trygrowthproject.com>`, message: `audit(r1): PR #374 bank payout ACH Phase A`).
4. Push and open a comment-only audit PR or just push the branch and report the final verdict in your return message.
5. End your return message with verdict: **CLEAN** / **DIRTY-MINOR** (cosmetic) / **DIRTY** (functional).

## The 10 gates — verify EACH

### Gate 1 — Commit hygiene
- All commits on branch have title-only messages (no body, no emoji, no `Co-Authored-By`, no `🤖`, no `Generated with` trailers).
- Author on every commit is `Dynasia G <dynasia@trygrowthproject.com>`.
- Run: `git log --format='%an <%ae>%n%B%n---' 9322eeb..HEAD`

### Gate 2 — Scope boundaries
- Diff vs `9322eeb` MUST touch ONLY:
  - `src/payouts-v2/**`
  - `prisma/migrations/<timestamp>_bank_payouts_v2/migration.sql` (single new additive migration)
  - `prisma/schema.prisma` (additive only)
  - `package.json` + `package-lock.json` (only the AWS-SDK add)
  - `.env.example` (only new `FEATURE_BANK_PAYOUTS_V2` + `FEATURE_STRIPE_TREASURY_PAYOUTS` flags + AWS keys)
  - Test files under `src/payouts-v2/**/*.spec.ts` or co-located.
- No edits to `src/community/**`, `src/dunning/**`, `src/entitlement/**`, `src/ai/**`, or any unrelated module.
- Run: `git diff --stat 9322eeb..HEAD` and `git diff --name-only 9322eeb..HEAD`

### Gate 3 — TypeScript clean
- `pnpm tsc --noEmit` (or `./node_modules/.bin/tsc --noEmit`) returns 0 errors.

### Gate 4 — Test lane pass
- `pnpm jest src/payouts-v2 --runInBand`: expect 37/37 new tests pass.
- `pnpm jest src/dunning --runInBand`: 26/26 must still pass (no regression).
- `pnpm jest src/entitlement --runInBand`: 17/17 must still pass.
- Report exact pass counts.

### Gate 5 — Fee §2.7 worked examples
Verify in source (`src/payouts-v2/fee-calculator.*` or equivalent) that the formula `platformFee = 2% × gross + 50% × (cardCost − stripeActualCost)` produces:
- $1,000 ACH → coach $962.85, platform $32.15 (cardCost = $33.00 hypothetical, actual ACH = $0.80, so platform = $20 + 0.5×($33 − $0.80) = $20 + $16.10 = **$36.10** — **VERIFY THE BRIEF'S NUMBERS AGAINST CODE**; if code disagrees with the $32.15 figure, report the discrepancy as DIRTY).
- Verify each worked example in spec §2.7 has a corresponding unit test asserting exact penny values.

### Gate 6 — Penny-absorb invariant
- Find the function that reconciles cardCost vs actual Stripe cost. Confirm: when the delta produces a sub-penny fraction, the PLATFORM absorbs the rounding (operator decision: Option A). Coach payout is always rounded UP to nearest cent in coach's favor; platform fee absorbs the rounding loss.
- Confirm a test exists asserting `coachPayout + platformFee === gross` to the cent under several adversarial inputs.

### Gate 7 — Webhook signature reject
- Find the Stripe Connect webhook handler. Confirm there is a test that:
  - Sends a payload with a missing or invalid `Stripe-Signature` header.
  - Asserts the response is 401 (or 400 — note which) and the handler does NOT mutate DB state.

### Gate 8 — Constructor-injection DI
- Confirm StripeConnect client and AWS S3 client are injected via constructor (Option A), NOT instantiated inline or via module-scope `new`.
- Confirm there is a unit test that injects a mock and verifies no real network call is made.

### Gate 9 — Feature flag OFF by default
- `.env.example` MUST have `FEATURE_BANK_PAYOUTS_V2=false` and `FEATURE_STRIPE_TREASURY_PAYOUTS=false`.
- Confirm the payout module's controller/service short-circuits (throws `ServiceUnavailableException` or returns 503) when the flag is off, AND that a test asserts this.

### Gate 10 — Dependency + migration
- `package.json` `dependencies` (NOT `devDependencies`) contains `"@aws-sdk/client-s3": "^3.1065.0"`.
- `prisma/migrations/<ts>_bank_payouts_v2/migration.sql` contains ONLY `ADD COLUMN` (nullable or with default), `CREATE TABLE`, `CREATE INDEX`, `ADD CONSTRAINT`. Run grep:
  ```
  grep -iE 'DROP |RENAME |ALTER COLUMN .* TYPE|TRUNCATE|DELETE FROM' prisma/migrations/*bank_payouts_v2*/migration.sql
  ```
  Expect: zero matches.
- Forbidden-token scan over diff: `git diff 9322eeb..HEAD -- 'src/**' | grep -iE 'sonnet|claude-3|TODO\(audit\)|FIXME|XXX'`. Pre-existing `sonnet` strings in unrelated files are NOT in scope; only flag if they appear in NEW added lines.

## Verdict rubric
- **CLEAN**: all 10 gates pass.
- **DIRTY-MINOR**: only cosmetic issues (comment typos, ordering) — list them.
- **DIRTY**: any functional/security/scope/test failure. Spawn fixer required.

## Hard rules
- Do NOT edit source files. ONLY write the audit report.
- Do NOT run `migrate dev` or `migrate deploy`. Use `migrate diff` only if you need to re-verify migration shape.
- Use `./node_modules/.bin/prisma` (v6), never `npx prisma`.
- Use `api_credentials=["github"]` for any `gh` CLI calls.
- Force-push: prefer `--force-with-lease`.
