# Payouts-v2 Webhook @Public() Fix — Result

## PR
- **Number:** #379
- **URL:** https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/379
- **Branch:** `fix/payouts-v2-webhook-public-decorator`
- **Base:** `main` @ `6c4f618c`
- **Title:** `fix(payouts-v2): mark Stripe Connect webhook @Public() (signature-verified, no session)`

## Commit
- **HEAD SHA:** `a804a7a949047df6d41ac1484cec953548212a7d`
- **Author:** `Dynasia G <dynasia@trygrowthproject.com>`
- **Body:** empty (title-only commit) ✓

## File changed
- **Only file:** `src/payouts-v2/payouts-v2-webhook.controller.ts`
- **Lines:** 2 insertions (1 import + 1 decorator), 0 deletions

```diff
+import { Public } from '../common/decorators/public.decorator';
...
+  @Public()
   @Post('stripe-connect')
   @HttpCode(HttpStatus.OK)
   async handle(
```

Import path `../common/decorators/public.decorator` copied from the billing Stripe webhook
controller (`src/billing/stripe-webhook.controller.ts`), the canonical Stripe-webhook pattern.

## Gates (all green)
- `npx tsc --noEmit` → exit 0 ✓
- `npx eslint src/payouts-v2` → exit 0 (no warnings/errors) ✓
- `npx jest --runInBand test/roles-enforced.spec.ts` → exit 0 ✓

### roles-enforced.spec.ts output
```
Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Ran all test suites matching test/roles-enforced.spec.ts.
```
The ungated-route assertion now passes — directly proving the fix lands (red → green).

## File-surface overlap check
- **PASS** — single file touched (`src/payouts-v2/payouts-v2-webhook.controller.ts`), isolated.
- No `prisma/**`, no `test/**`, no `package.json`/lockfile changes. (`package-lock.json` /
  `node_modules` were used locally for `npm install` to run the gates but are not committed;
  `git diff --stat` shows only the single controller file.)

## Unblocks
PR #268, PR #377, PR #378 — all blocked by `main` being red on `build-and-test` because
`PayoutsV2WebhookController.handle` was ungated. Once #379 merges, re-trigger CI on those three
(empty commit or rebase) and `build-and-test` should go green.

## Notes
- Repo dependencies were not pre-installed; ran `npm install` (npm, per PR #268 fixer's
  discovery that this repo is npm-based) to provision `tsc`/`eslint`/`jest` for the gates.
- Stripe Connect webhook is legitimately public: trust anchor is the HMAC `Stripe-Signature`
  header verified against the webhook secret, not session/JWT auth.
