# Payouts-v2 Webhook @Public() Fix — Mini PR Brief

## Context (read once)

PR #268 CI fixer eliminated the OOM that was masking a long-latent defect:
- `test/roles-enforced.spec.ts` checks every controller route is gated with either `@Roles()` or `@Public()`.
- `PayoutsV2WebhookController.handle` has neither.
- Previously the suite OOM'd before reaching this assertion; with the heap bump, the spec now executes and correctly reports the ungated route.
- **Result: `main` itself is red**, which blocks PR #268, PR #377, and PR #378 from merging on `build-and-test`.

This is a Stripe Connect webhook — it is **legitimately public** (Stripe authenticates via signature, not session/JWT), so the correct annotation is `@Public()`.

## PR target

- **Repo:** `BradleyGleavePortfolio/growth-project-backend`
- **Base main:** `6c4f618c`
- **Branch:** `fix/payouts-v2-webhook-public-decorator`
- **Title:** `fix(payouts-v2): mark Stripe Connect webhook @Public() (signature-verified, no session)`

## The change

**File:** `src/payouts-v2/payouts-v2-webhook.controller.ts`

Add `@Public()` decorator to the `handle` method. Import path follows the convention used elsewhere in the codebase — search for `@Public()` usages (e.g., other webhook controllers, the auth allowlist) to find the right import.

**Verification:** Stripe webhook security comes from `Stripe-Signature` header verification via the webhook secret, NOT from session/JWT auth. This matches how `BillingWebhookController` (or equivalent Stripe webhook) is annotated in this repo — copy that pattern.

## Forbidden (anti-rebase R7C)

- Any file outside `src/payouts-v2/payouts-v2-webhook.controller.ts`
- No `prisma/**` changes
- No `package.json` / lockfile changes
- No `test/**` changes (the existing roles-enforced spec **is** the test; it goes from red→green automatically)

## Gates (must pass before push)

```bash
npm run tsc -- --noEmit              # or: npx tsc --noEmit
npx eslint src/payouts-v2
npx jest --runInBand test/roles-enforced.spec.ts   # MUST be green now
```

`roles-enforced.spec.ts` going green is the key signal — it directly proves the fix lands.

## Push & PR

```bash
git checkout -b fix/payouts-v2-webhook-public-decorator
# edit file
git -c user.email=dynasia@trygrowthproject.com -c user.name="Dynasia G" \
  commit -am "fix(payouts-v2): mark Stripe Connect webhook @Public() (signature-verified, no session)"
git push origin fix/payouts-v2-webhook-public-decorator

gh pr create \
  --repo BradleyGleavePortfolio/growth-project-backend \
  --base main \
  --head fix/payouts-v2-webhook-public-decorator \
  --title "fix(payouts-v2): mark Stripe Connect webhook @Public() (signature-verified, no session)" \
  --body "Latent defect surfaced by PR #268 CI heap-size fix.\n\n\`PayoutsV2WebhookController.handle\` is ungated; \`test/roles-enforced.spec.ts\` (re-)caught this once heap OOM stopped masking it.\n\nThis is a Stripe Connect webhook: security is provided by Stripe-Signature header verification, not session/JWT auth. \`@Public()\` is the correct annotation, matching the pattern used by the billing webhook controller.\n\nThis PR unblocks #268, #377, #378 from merging on \`build-and-test\`.\n\nGates: tsc/eslint clean. \`roles-enforced.spec.ts\`: green."
```

## Verification after merge

After this PR merges to main, immediately re-trigger CI on PR #268, PR #377, PR #378 by pushing an empty commit or rebasing — `build-and-test` should now go green on all three.

## Result file

Write `/home/user/workspace/PAYOUTS_V2_FIX_RESULT.md` with:
- PR number + URL
- final HEAD SHA
- file changed + line count (should be 1-3 lines + 1 import)
- roles-enforced.spec.ts output (green)
- file-surface overlap check (PASS — single file, isolated)

## Discipline

- Author: `Dynasia G <dynasia@trygrowthproject.com>`
- Title-only commit
- Comment via `gh api repos/.../issues/<N>/comments` (NOT `gh pr comment`)
