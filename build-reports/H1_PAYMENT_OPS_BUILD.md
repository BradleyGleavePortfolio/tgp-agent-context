# H1 Payment-Ops Build Report — query bounds + earnings cursor/export + Swagger (B5, B6, #1)

**Repo:** `growth-project-backend`
**Branch:** `hygiene/payment-ops-bounds` (off backend main `19e51b0`)
**Build HEAD SHA:** `bac3cc0db22e447f74a14811d55063306f5e16c1`
**Author:** Dynasia G `<dynasia@trygrowthproject.com>` (no trailers)

## Summary
Fixed two unbounded/incorrect query paths in the coach-facing payment-ops
surface and added Swagger coverage to the whole controller. No guard or
role was weakened; every handler stays read-only/idempotent (GETs).

## Write-set (disjoint — nothing outside the checkout module touched)
- `src/checkout/payment-ops.controller.ts` — primary fixes + `@ApiOperation`.
- `src/checkout/payment-ops.dto.ts` — **new** module-local DTO + CSV helper
  (`CursorPageQueryDto`, `csvEscape`, `rowsToCsv`, limit constants).
- `test/payment-ops.controller.spec.ts` — extended the existing module spec
  (stub + 8 new bounds tests). Per the brief's "extend tests in the SAME
  module if a spec exists" — no separate `payment-ops-bounds.spec.ts` was
  needed since the module already has a spec.

`SplitLedgerService` (`src/connect/fees/split-ledger.service.ts`) was
deliberately NOT modified — pagination + the full-ledger summary aggregate
were implemented in the controller against the already-injected
`PrismaService`, keeping the write-set inside the checkout module and
avoiding cross-module coupling.

## Changes by issue

### B5 — unbounded `findMany` in `listOwn` (was controller :534)
`CoachPaymentOpsController.listOwn` (now ~:580) previously did
`clientPurchase.findMany({ where:{coach_user_id}, orderBy })` with **no
`take`**. Now:
- Accepts `@Query() CursorPageQueryDto` (`limit` default 50, hard max 100,
  validated `@IsInt @Min(1) @Max(100)`; `cursor` validated `@IsUUID`).
- Bounded `take: limit + 1` with `cursor: { id }, skip: 1` cursor pagination
  (`orderBy: [{created_at:'desc'},{id:'desc'}]` for a stable tiebreak).
- Returns `{ purchases, next_cursor }` (cursor = id of last row, or `null`
  on the final page).
- `coach_user_id: req.user.id` scope kept intact (RLS/IDOR #2/#5).

### B6 — earnings hardcoded `limit:200` + wrong summary (was controller :590)
`CoachPaymentOpsController.earnings` (now ~:656) previously truncated to 200
rows AND computed the money summary inline over only those 200 rows. Now:
- **Listing** is cursor-paginated (same `CursorPageQueryDto`, default 50 /
  max 100, `take: limit+1`, `{ summary, entries, next_cursor }`).
- **Summary** is computed over the FULL payee ledger via a single grouped
  aggregate `splitLedgerEntry.groupBy({ by:['status'], _sum:{ amount_cents,
  reversed_cents } })` in a new private `computeEarningsSummary()` — no
  per-row scan / N+1 (#21). Math mirrors the original exactly:
  `posted = Σamount − Σreversed` (posted rows), `pending = Σamount`,
  `reversed = Σamount`. Correct now past 200 rows.
- **New endpoint** `GET /v1/coach/payments/earnings/export.csv`
  (`exportEarningsCsv`): streams the coach's full ledger scoped strictly to
  `payee_user_id = req.user.id`, drained in id-stable cursor batches of 500
  (bounded per round-trip, hard 100k ceiling) so no single unbounded query.
  Sets `Content-Type: text/csv; charset=utf-8`,
  `Content-Disposition: attachment; filename="earnings-<YYYYMMDD>.csv"`,
  `Cache-Control: no-store`. Uses `@Res({ passthrough:true })` per the repo's
  admin/reports CSV idiom; module-local `rowsToCsv` (RFC-4180 quoting).

### #1 — Swagger coverage
Added a concise `@ApiOperation({ summary })` to **every** handler in both
`AdminPaymentOpsController` and `CoachPaymentOpsController` (0 → all). Added
`@ApiResponse` on the cheap/obvious error paths (404 NOT_FOUND, 400
validation). No behavior change.

## Tests
`npx jest test/payment-ops.controller.spec.ts` → **36 passed** (8 new):
- B5: caps at limit + returns next_cursor; cursor returns next page; last
  page → `next_cursor=null`; scope filters by coach (stranger sees none).
- B6: summary aggregates the FULL ledger (250 rows → 25_000c, not the old
  20_000c@200); page bounded + cursor advances; summary scoped to payee
  (other coach's ledger excluded); export.csv returns full payee-scoped
  ledger as CSV (other coach's rows absent).
- Existing tests updated for the new `{ ..., next_cursor }` return shape and
  the new `@Query()` DTO arg; spec prisma stub gained `groupBy` + take/cursor
  honoring.

Regression checks (untouched): `roles-enforced.spec.ts` (8) and
`split-ledger.service.spec.ts` PASS.

## Build/lint/type
- `npx tsc --noEmit` → exit 0.
- `npx eslint src/checkout/payment-ops.controller.ts src/checkout/payment-ops.dto.ts` → exit 0.
- `npx nest build` → exit 0.

## Validation / edge cases
- `limit` over max (100) or non-integer → 400 via global ValidationPipe
  (`transform:true, whitelist:true`).
- `cursor` must be a UUID → malformed cursor → 400 (no silent top-scan).
- Cursor pagination uses `skip:1` so the cursor row itself isn't repeated.

## Caveats
- Backend `main` may have advanced past `19e51b0`; this branch is built off
  `19e51b0` per the brief. Rebase/merge resolution (if any) is trivial — the
  3 touched files are payment-ops-local.
- The CSV export caps at 100k rows defensively; no coach approaches this. If
  a true unbounded stream is later required, switch to a `StreamableFile`
  generator — out of scope here.

## Sources
- Fix brief: `specs/HYGIENE_H1_PAYMENT_OPS_BRIEF.md`
- Auditor bar: `specs/AUDITOR_BRIEF_COMMON.md`

---

## FIX NOTE — R2 (post-audit, GPT-5.5 NOT-CLEAN → addressed)

Audited HEAD `bac3cc0` returned NOT-CLEAN with two P2 findings; both fixed in
`72c54d9` on `hygiene/payment-ops-bounds`. Write-set unchanged (only
`src/checkout/payment-ops.controller.ts`, `src/checkout/payment-ops.dto.ts`,
`test/payment-ops.controller.spec.ts`). No guard/role weakened;
`test/roles-enforced.spec.ts` untouched.

**P2-1 — malformed partially-numeric `limit` silently coerced.**
`coerceInt` in `payment-ops.dto.ts` used `parseInt`, so `"50abc"→50`,
`"1.5"→1`, `"1e2"→1` passed validation. Replaced with strict base-10 coercion
(`/^[+-]?\d+$/` + `Number.isSafeInteger`): only a clean integer string is
converted to a number; anything else (decimal, exponent, hex, suffix,
embedded space) is preserved as the raw string so `@IsInt`/`@Min`/`@Max`
reject it with a clean 400 via the global `ValidationPipe`. Applied to the
shared `CursorPageQueryDto.limit` used by both `purchases` and `earnings`.

**P2-2 — `earnings/export.csv` silently truncated at 100,000 rows.**
Removed the `maxRows = 100_000` ceiling in `exportEarningsCsv`. The bounded
cursor-batch loop (500 rows/round-trip, id-stable `created_at`/`id` order)
now continues until the payee ledger is fully drained, so the export
genuinely covers the entire payee-scoped ledger. Per-query memory/DB pressure
stays bounded; payee scope (`payee_user_id: req.user.id`) intact.

**Tests added (36 → 51 passing).**
- `CursorPageQueryDto.limit strict validation` describe block: clean-int
  accepted+typed as number; `50abc`/`99x`/`100foo`/`1.5`/`1e2`/`0x10`/`abc`/
  `" 50 0"` rejected; explicit `"50abc" !== 50` regression guard; over-max,
  below-min, omitted-optional, malformed-UUID-cursor cases.
- `B6: export.csv drains MULTIPLE cursor batches…`: seeds 1,250 rows (>2
  batches), asserts header+1,250 rows present (first+last included) and that
  `findMany` was called >1× (proves real multi-batch drain, no cap).

**Verification (real tooling, completed green runs):**
- `npx tsc --noEmit` → exit 0.
- `npx eslint src/checkout/payment-ops.controller.ts src/checkout/payment-ops.dto.ts test/payment-ops.controller.spec.ts` → exit 0.
- `node --max-old-space-size=2048 ./node_modules/.bin/jest --runTestsByPath test/payment-ops.controller.spec.ts --runInBand --no-cache` → 51 passed / 51 total.

The earlier "Caveats" note about a defensive 100k cap no longer applies — the
cap was removed; the export is now genuinely full-ledger.
