# PR-18 / B1 BUILD REPORT — Backend pricing lock + combo error copy

**Branch:** `pr18/b1-pricing-lock` (off backend main `19e51b0`)
**Builder:** Opus 4.8 (Dynasia G)
**Worktree:** `/home/user/workspace/wt-b1-pricing`
**Commit (impl):** `ab2a98bc3c5ab307375b76191a4bbb6b66d7f6d1`

## Write-set (STRICT — only these two files touched)
- `src/packages/packages.service.ts`
- `test/packages.service.spec.ts`

`git status --porcelain` shows exactly these two files modified. No other
files were touched (`package-contents.*`, `drip-dispatcher.cron.ts`,
`landing-pages.*` are other units and were left untouched).

## Item 1 — Lock pricing after an active recurring subscriber
`PackagesService.update()` previously cleared the cached Stripe Price id(s)
on a price-shaping edit and wrote the update unconditionally. It now refuses
a price-shaping edit while the package has at least one active recurring
subscriber.

### What counts as a "price-shaping" change (locks the edit)
The existing `priceChanged` (amount_cents, currency, billing_type, interval,
interval_count → clears `stripe_price_id`) and `recurringChanged`
(recurring_amount_cents, recurring_interval, recurring_interval_count,
currency → clears `recurring_stripe_price_id`) flags are preserved verbatim.
A new `durationChanged` flag was added for `duration_periods`, because it
changes the buyer's entitlement economics (how long access lasts for the same
amount). `duration_periods` is NOT a Stripe Price input, so it is tracked
separately from the stripe-id-clearing flag (it does not null a cached Price
id) but it DOES participate in the lock.

```ts
const priceShapingChanged = priceChanged || recurringChanged || durationChanged;
if (!priceShapingChanged) {
  return this.prisma.coachPackage.update({ where: { id: packageId }, data });
}
```

Pure name / description / status (`is_active`) / availability edits leave all
three flags false, take the early-return path, and **never open a transaction
or take the lock** (verified by a test asserting `$transaction` was not
called).

### The lock (race-safe, IDOR-safe, no Stripe HTTP in the tx)
```ts
return this.prisma.$transaction(async (tx) => {
  await tx.$queryRaw`SELECT id FROM "CoachPackage" WHERE id = ${packageId} FOR UPDATE`;
  const activeRecurringCount = await tx.clientPurchase.count({
    where: {
      package_id: packageId,
      entitlement_active: true,
      stripe_subscription_id: { not: null },
      status: { in: ACTIVE_RECURRING_STATUSES }, // ['active','trialing','past_due']
    },
  });
  if (activeRecurringCount > 0) {
    throw new ConflictException({
      error: 'PACKAGE_PRICING_LOCKED',
      message:
        'Pricing is locked because this package has active subscribers. Create a new package for new pricing.',
    });
  }
  return tx.coachPackage.update({ where: { id: packageId }, data });
});
```

- **IDOR guard preserved & ordered first:** `requireOwnedPackage()` runs at the
  very top of `update()`, BEFORE any subscriber count. A foreign coach 404s
  (`PACKAGE_NOT_FOUND`) and never reaches the count (verified by a test that
  asserts `clientPurchase.count` and `$transaction` are never called for a
  non-owned package).
- **Race (#28):** the price-change branch is wrapped in a Prisma
  `$transaction`, and a `SELECT ... FOR UPDATE` row lock on `"CoachPackage"`
  is taken BEFORE the count + update. A concurrent checkout flipping a
  purchase to `entitlement_active=true` serializes against this lock, so the
  count is consistent regardless of which tx wins. Mirrors the existing
  FOR-UPDATE pattern in `coach-media.service.ts`.
- **No Stripe HTTP inside the tx (#44):** the only writes are the price-id
  clears (to `null`) and the row update; the lazy Stripe Price mint happens
  later at checkout. The Postgres connection is never held across a network
  call.
- **Combo lock both legs:** a one-time primary + recurring companion combo
  locks BOTH the primary (`amount_cents` etc.) and the companion
  (`recurring_*`) fields once ANY active recurring buyer exists — because both
  flag sets feed `priceShapingChanged` and the same count gate applies
  (verified by a test editing each leg).
- **No N+1:** exactly one `count` query on the lock path (verified by a test
  asserting `count` is called exactly once).
- Existing buyer snapshots / Stripe subscriptions are never mutated.

### Active-recurring fingerprint
A buyer locks pricing iff their `ClientPurchase` has
`entitlement_active = true`, a non-null `stripe_subscription_id`, AND a status
in `ACTIVE_RECURRING_STATUSES = ['active', 'trialing', 'past_due']`. `past_due`
is included because the subscription is still live during dunning (entitlement
active, not yet canceled), so a price swap there would still hit a live
subscriber. Terminal/benign states (`canceled`, `payment_failed`, `expired`,
`pending`, and one-time `paid`) are excluded and do NOT lock.

## Item 2 — Combo min/max error copy (PR-14), code stays PACKAGE_INVALID
`assertValidPricing` computes `hasRecurringCompanion` (ANY `recurring_*` field
set, matching the existing half-set detection). The validation SEMANTICS are
unchanged; only the message text is disambiguated when a companion is present:

- **Primary minimum:** with a recurring companion present →
  `one-time amount_cents must be an integer ≥ 50 (Stripe minimum)`; otherwise
  the existing generic `amount_cents must be an integer ≥ 50 (Stripe minimum)`.
- **Recurring companion minimum:** →
  `recurring_amount_cents must be an integer ≥ 50 (Stripe minimum for the recurring companion)`.
- Error **code remains `PACKAGE_INVALID`** in every branch.

## Tests (`test/packages.service.spec.ts`)
The existing suite is preserved. The shared Prisma stub was extended with
`$transaction` (executes the callback with the stub as `tx`), `$queryRaw`
(no-op FOR UPDATE), and `clientPurchase.count` (filters on package_id +
entitlement_active + non-null subscription id + status IN set). New tests:

B1 pricing lock:
- ALLOWS name/description/status update with active recurring subscribers
  (and asserts `$transaction` is not opened).
- BLOCKS `amount_cents`, `currency`, `billing_type`, `interval`,
  `interval_count`, `duration_periods`, and recurring-companion changes when
  an active recurring subscriber exists (Conflict / `PACKAGE_PRICING_LOCKED`).
- Combo: editing EITHER the companion leg or the one-time primary leg is
  blocked once an active recurring buyer exists.
- Locks on `trialing` and `past_due` subscribers.
- ALLOWS pricing edits when the subscriber is `canceled`, when entitlement is
  inactive, when the buyer has no Stripe subscription, and when there are no
  buyers at all.
- IDOR guard runs before the count (foreign coach 404s, never counts).
- Exactly ONE count query on the lock path (no N+1).

B1 combo copy:
- Primary minimum copy is GENERIC when no companion is present.
- Primary minimum copy disambiguates the one-time leg when a companion is
  present.
- Recurring companion minimum copy names the recurring companion.
- All three assert the full response body, including `error: 'PACKAGE_INVALID'`.

## Verification (run in the worktree)
- **Typecheck:** `npx tsc --noEmit -p tsconfig.json` → PASS (exit 0).
- **Lint:** `npx eslint "src/packages/packages.service.ts"` → PASS (exit 0).
- **Tests:** `npx jest test/packages.service.spec.ts` → **52 passed, 52 total**
  (1 suite passed).

## 50-Failures concerns addressed
- **#5 IDOR:** `requireOwnedPackage()` runs before any subscriber count;
  foreign coach 404s and never reaches the lock/count.
- **#8 input validation:** combo copy disambiguated, semantics + code
  (`PACKAGE_INVALID`) unchanged.
- **#21 N+1:** single `count` query on the lock path.
- **#28 race conditions:** `SELECT ... FOR UPDATE` row lock taken inside a
  `$transaction` before count + update.
- **#44 transactions / no sync Stripe HTTP in a DB tx:** the tx performs only
  DB writes; the Stripe Price mint is deferred to checkout.

## Doctrine
- Commit authored as `Dynasia G <dynasia@trygrowthproject.com>` (R4 STRICT),
  **no trailers** (verified — no Co-Authored-By / Signed-off-by / Generated-with).
- Pushed to origin `pr18/b1-pricing-lock` (R61).

---

## FIX NOTE — audit P1 (Opus 4.8 FIXER, Dynasia G)
**Fix commit:** `5f652e6` on `pr18/b1-pricing-lock`.

### The P1 (from `audits/PR18_wave/B1_AUDIT.md`)
`PackagesService.update()` locks only the `CoachPackage` row (`SELECT id ...
FOR UPDATE`) and then counts active recurring `ClientPurchase` rows. But the
webhook activation paths that flip an existing `ClientPurchase` to
`entitlement_active=true` updated ONLY the `ClientPurchase` row and never took
the `CoachPackage` row lock. Because the two transactions touched **disjoint
rows**, the package `FOR UPDATE` did not serialize them: a concurrent
recurring activation could commit in a window the pricing-edit count's MVCC
snapshot did not include, so the count could read 0 active buyers and let a
price/duration edit slip past the guard.

### Expanded write-set (deliberate, parent-authorized)
The minimal correct fix requires the activation path to take the same package
lock, which lives OUTSIDE B1's strict write-set. Per the fixer task (parent
authorized fixing the audit P1), the write-set was expanded to add the
checkout-webhook-handler (NOT owned by any other in-flight unit) + its spec:

- `src/checkout/checkout-webhook-handler.service.ts` *(expanded — fix)*
- `test/checkout-webhook-handler.spec.ts` *(expanded — regression tests)*

The original B1 write-set (`src/packages/packages.service.ts`,
`test/packages.service.spec.ts`) was **not** re-touched by the fix. No
file-disjoint units were touched (no `package-contents.*`,
`drip-dispatcher.cron.ts`, `landing-pages.*`, `payment-ops.*`, `admin.*`,
`storefront-public.*`, `real-meal-plans.*`, `coach-messaging.*`).

### The fix
A new private helper `activateUnderPackageLock(tx, packageId, activate)` runs
the entitlement-activation write only AFTER taking the SAME
`SELECT id FROM "CoachPackage" WHERE id = ${packageId} FOR UPDATE` row lock,
inside the same transaction as the write:
- When BillingService threads its outer `$transaction` through
  `handle(event, tx)`, the lock + activation run on that outer `tx`.
- When there is no outer tx (the `customer.subscription.updated` and
  `invoice.paid` resync paths call `this.prisma` directly), the helper opens
  its own short `$transaction` so the row lock is held across the write.

Applied to every path that can set `entitlement_active=true`:
- `applyCheckoutCompleted` (recurring → active; also one_time → paid, harmless)
- `applySubscriptionUpdated` (active/trialing/past_due)
- `applyInvoicePaid` (renewal resync → active/trialing/past_due)

No Stripe HTTP runs inside the lock transaction (the `invoice.paid` Stripe
`retrieveSubscription` call happens BEFORE the locked write).

### Serialization argument (what locks what, in what order, no deadlock)
- Both the pricing-edit tx (`PackagesService.update`) and every activation tx
  acquire exactly ONE lock: the `CoachPackage` row keyed by `packageId`.
  Neither acquires a second lock while holding the first → no lock-ordering
  cycle → **no deadlock**.
- Whichever tx acquires the package-row lock first runs to completion; the
  other blocks on that row lock until the first commits, then proceeds against
  the committed state:
  - **Activation commits first:** the pricing-edit count (run under the same
    row lock, so it observes the committed activation) sees the now-active
    recurring buyer and throws `PACKAGE_PRICING_LOCKED`.
  - **Pricing edit commits first:** the activation observes the already-edited
    package row when it proceeds (price change fully committed before the
    buyer becomes active).
- Therefore the guard can **never** miss an entitlement activation that
  commits before the price update commits — the exact race the audit flagged
  is closed.

### Regression tests added (`test/checkout-webhook-handler.spec.ts`)
The shared prisma stub was extended with `$queryRaw` (records every locked
package id) and an interactive `$transaction`. New tests assert:
- `checkout.session.completed` (recurring) locks the package row, and the
  `FOR UPDATE` fires BEFORE the entitlement-flip update (invocation order).
- The same path locks on the OUTER tx when one is supplied (no nested
  `$transaction` opened).
- `customer.subscription.updated` locks the package row before flipping
  entitlement.
- `invoice.paid` locks the package row on renewal re-activation.

### Verification (run in the worktree, COMPLETED green)
- **Typecheck:** `NODE_OPTIONS=--max-old-space-size=2048 npx tsc --noEmit`
  → exit 0 (no diagnostics).
- **Lint:** `npx eslint` on all four changed files → exit 0 (only the 3
  pre-existing P3 `no-unused-vars` warnings in the untouched
  `packages.service.spec.ts` stub; none introduced by the fix).
- **Tests:**
  - `npx jest test/packages.service.spec.ts` → **52 passed, 52 total**.
  - `npx jest test/checkout-webhook-handler.spec.ts` → **20 passed, 20 total**
    (16 original + 4 new B1 serialization tests).

### Final fix write-set
- `src/checkout/checkout-webhook-handler.service.ts`
- `test/checkout-webhook-handler.spec.ts`
