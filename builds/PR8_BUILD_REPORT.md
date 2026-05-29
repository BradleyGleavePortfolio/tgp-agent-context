# PR-8 BUILD REPORT — Coach package CONTENTS endpoints + zod-per-cadence validation

## (a) PR URL

https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/318

- Branch: `pr8/package-contents-endpoints` off latest `main` (PR-2/3/4/6/7 already merged).
- Three commits on the branch:
  - `cb34a71b` — initial build (5 files, 34 new tests).
  - `372eb025` — **R1 audit-fix** — addresses both P2 concurrency findings (P2-a `nextDisplayOrder` read-then-write race; P2-b `reorder` TOCTOU race) AND the P3-a `requireOwnedContent` soft-delete filter via a per-package `pg_advisory_xact_lock` inside an interactive `$transaction`. 6 new race + soft-delete tests added.
  - **R2 audit-fix commit** — addresses the new P2-c finding from round 2: `patch()` writes `display_order` WITHOUT the per-package lock, allowing patch-vs-attach and patch-vs-reorder TOCTOU races and concurrent-patch duplicates. Fix: `patch()` now takes the same `$transaction` + `acquirePackageOrderLock` when (and ONLY when) the body includes `display_order`, AND rejects targeting a `display_order` already held by another non-removed row with `DISPLAY_ORDER_TAKEN` (400). 8 new tests added (total 48 in the spec; full suite 3402/3402).
- Commit identity: `Dynasia G <dynasia@trygrowthproject.com>`. No `Co-Authored-By` / generated trailers.

## Audit-fix summary (P2-a, P2-b, P3-a)

### Lock-key strategy

```ts
// src/packages/package-contents.service.ts
const ADVISORY_LOCK_NAMESPACE_PKG_CONTENT_ORDER = 0x70_6b_67_63; // ASCII 'pkgc'

private async acquirePackageOrderLock(db: Tx, packageId: string): Promise<void> {
  await db.$executeRaw`SELECT pg_advisory_xact_lock(${ADVISORY_LOCK_NAMESPACE_PKG_CONTENT_ORDER}::int4, hashtext(${packageId}))`;
}
```

- **Two-int4 form** (`pg_advisory_xact_lock(int4, int4)`) — first arg is a stable namespace constant (`'pkgc'` interpreted as 32-bit ASCII), second arg is `hashtext(packageId)` resolved by Postgres. The namespace ensures these locks can never collide with any other advisory-lock user we add later in the codebase.
- **xact-scoped** — released automatically on commit OR rollback. There is no session-leak risk and we never call an explicit unlock. Verified by reading the Postgres docs: `pg_advisory_xact_lock` is the right call (not `pg_advisory_lock` which is session-scoped).
- **Parameter bound** — `packageId` is passed through the tag-template binding, never interpolated into raw SQL.
- **Collision cost** — two different packageIds whose `hashtext` happens to match the same int4 would briefly serialise; correctness is preserved, only a small performance cost on a vanishing chance. Acceptable.

### What changed in the service

1. **`attach` (P2-a fix, R1)** — wrapped in `prisma.$transaction(async (tx) => …)`. The first statement inside the tx is `acquirePackageOrderLock(tx, packageId)`. The `nextDisplayOrder` read AND the `coachPackageContent.create()` happen inside the same tx, so two concurrent attaches on the same package now serialise: caller B blocks on caller A's commit before reading `max(display_order)`, and therefore picks `A.display_order + 1`. Different packages still proceed in parallel.
2. **`reorder` (P2-b fix, R1)** — wrapped in `prisma.$transaction(async (tx) => …)`. The parity `findMany` (which was OUTSIDE the previous transaction) now runs INSIDE, after the per-package advisory lock. Any concurrent `attach` is serialised behind the reorder — the parity set the reorder validates against IS the set it writes against, so a row can no longer land between the read and the bulk update. The bulk update is still one-update-per-row inside the same tx.
3. **`nextDisplayOrder`** — signature changed from `(packageId)` to `(db: Tx, packageId)`. The helper is only callable from inside the lock now.
4. **P3-a — `requireOwnedContent` filters `removed_at: null`.** Patch can no longer mutate a soft-deleted row. `softDelete` no longer routes through `requireOwnedContent` (so the idempotent re-delete case still returns the already-removed row); it inlines its own lookup that ignores `removed_at`.
5. **P3-b/P3-c** — documentation only. Build report wording updated to "stricter superset, intentional" for the workout/media ownership predicates.
6. **`patch` (P2-c fix, R2)** — `patch()` previously did a bare `prisma.coachPackageContent.update()` outside any transaction, so a patch that set `display_order` raced against `attach`, `reorder`, and other patches on the same package. Fix:
   - When the patch body **does not** include `display_order`, the cheap path is kept (no tx, no lock). Title/caption/cadence/revision-only edits are not display_order mutators and don't need to serialise.
   - When the patch body **does** include `display_order`, the patch runs inside `prisma.$transaction(async (tx) => …)` with `acquirePackageOrderLock(tx, packageId)` as the first statement.
   - Inside the lock, we re-fetch the row with the same `removed_at: null` filter as `requireOwnedContent` (so soft-deleted rows still 404 on the locked path).
   - Inside the lock, we check whether the target `display_order` is already held by another non-removed row on the same package. If yes → reject with `400 DISPLAY_ORDER_TAKEN` and a hint that `/reorder` is the right endpoint for multi-row moves. Setting `display_order` to the row's CURRENT value is a no-op and skipped.
   - auto_message body contract is now also verified against the row we re-read INSIDE the lock, so a concurrent patch that already cleared the body can't slip through.

   Alternative considered: forbid `display_order` on `PATCH` entirely and force the editor to use `/reorder`. Rejected because single-row moves are a real authoring affordance and the brief explicitly allows display_order on PATCH ("or `display_order` on PATCH and skip [the reorder endpoint]"). Locking the single-row path is the simplest correct option.

### Verification (post-fix R2)

- `node_modules/.bin/tsc --noEmit -p tsconfig.json` — **clean** (0 errors).
- `npm run build` (`nest build`) — **clean**.
- `npm run lint` — **0 errors**, 17 pre-existing warnings unchanged from `main`.
- Full jest suite: **282 suites pass; 3402/3402 active tests pass** (+8 over R1's 3394 = +14 over the original 3388), 20 skipped + 5 todo unchanged, 6 snapshots pass.

### New tests for the R1 fix (6 total)

- **`attach` acquires the per-package lock inside a transaction** — asserts `$transaction` + `$executeRaw` are called and the `_lockLog` records `packageId='pkg-1'`.
- **`reorder` acquires the per-package lock inside a transaction** — same.
- **Concurrent attaches serialise into distinct display_order values** — `Promise.all` of three concurrent `attach` calls on the same package; orders sort to `[0, 1, 2]` with no collision. Lock acquired three times, all for the same packageId.
- **Reorder-vs-attach interleaving (P2-b)** — `Promise.all` of one `reorder` + one `attach` on the same package; after both complete, all rows have distinct display_orders and the reorder result itself has no duplicates.
- **Patch on a soft-deleted row 404s (P3-a)** — attaches, soft-deletes, then attempts to patch `display_title` AND cadence; both reject with `NotFoundException`.
- **softDelete remains idempotent after the requireOwnedContent fix** — double-delete returns the same `removed_at` timestamp without bumping it.

### New tests for the R2 fix (8 total)

- **patch without `display_order` skips the lock (cheap path preserved)** — title-only patch never calls `$executeRaw`; `_lockLog` stays empty.
- **patch with `display_order` acquires the per-package lock inside a transaction** — `_lockLog` records the packageId.
- **patch rejects `display_order` already held by another non-removed row** — `DISPLAY_ORDER_TAKEN` 400 with a hint pointing at `/reorder`.
- **patch allows setting `display_order` to the row's own current value (no-op)** — collision check is conditional on `input.display_order !== row.display_order`.
- **patch ignores soft-deleted rows when checking for collisions; patch on a soft-deleted target STILL 404s on the locked path** — soft-deleted rows are excluded from the collision predicate, so their orders are reusable; and the lock-path re-fetch also filters `removed_at: null`.
- **patch-vs-attach interleaving — serialised; never produces duplicate display_order** — `Promise.all` of one move-patch + one attach on the same package.
- **patch-vs-reorder interleaving — serialised; never produces duplicate display_order** — `Promise.all` of one move-patch + one reorder; either ordering is valid (`.catch` to tolerate the rejection path); final state has no duplicates.
- **Two concurrent patches targeting the SAME `display_order` — at most one wins** — locks serialise the writes; the second observes the first's commit and rejects with `DISPLAY_ORDER_TAKEN`; final state has exactly one row at that order.

The test stub for `$transaction` implements a per-`packageId` mutex chain that mirrors the xact-scoped lock semantic (lock acquired on `$executeRaw('pg_advisory_xact_lock…')`, released when the surrounding `$transaction` callback resolves OR rejects), so the concurrent-mutation tests exercise the real serialisation guarantee rather than a no-op.

## (b) Endpoints

All under `@Controller('v1/coach/packages/:id/contents')`, guarded by `JwtAuthGuard + CoachOrOwnerGuard + SubscriptionGuard`, role-gated to `coach`/`owner`. IDOR + sub-coach scope on EVERY endpoint via `PackagesService.resolveEffectiveCoachId` → `requireOwnedPackage` (same pattern PR-6 used).

| Verb | Path | Handler | Purpose |
|---|---|---|---|
| `GET` | `/v1/coach/packages/:id/contents` | `list` | List non-removed contents, ordered by `display_order asc`. |
| `POST` | `/v1/coach/packages/:id/contents` | `attach` | Attach a deliverable. Body: `asset_type, asset_id, asset_revision_id?, cadence_kind, cadence_payload, display_title?, display_caption?, display_order?` (append to max+1 if omitted). |
| `PATCH` | `/v1/coach/packages/:id/contents/:contentId` | `patch` | Edit titles, order, asset_revision_id, and/or cadence (cadence is all-or-nothing). |
| `DELETE` | `/v1/coach/packages/:id/contents/:contentId` | `remove` | Soft-delete (`removed_at = NOW()`); never hard-delete. Idempotent. |
| `PUT` | `/v1/coach/packages/:id/contents/reorder` | `reorder` | Atomic bulk reorder (`{ content_ids: string[] }` → `display_order = index`). Rejects extra / missing / duplicate ids. |

Body is intentionally accepted as `unknown` and validated with zod in the service — the global Nest `ValidationPipe` with `forbidNonWhitelisted` would strip unknown payload keys silently before the controller ever saw them, which is exactly the failure mode the brief asks us to prevent.

## (c) Zod schema per cadence kind

The HTTP body is validated by `CreateContentSchema`, a `z.discriminatedUnion('cadence_kind', […])` where each branch is a `.strict()` object carrying the base fields + the kind-specific `cadence_payload` schema. `discriminatedUnion` preserves branch strictness, so unknown TOP-LEVEL keys are rejected at the branch matching `cadence_kind`, and unknown PAYLOAD keys are rejected by the nested `.strict()` schema. Patches use a separate `PatchContentSchema` (all fields optional, strict) and the service enforces "cadence_kind and cadence_payload must come as a pair" by hand (zod can't express that cleanly).

```ts
// src/packages/package-contents.dto.ts
const ImmediatePayload           = z.object({}).strict();
const RelativeToPurchasePayload  = z.object({ offset_days:  z.number().int().min(0) }).strict();
const FixedCalendarPayload       = z.object({ release_at:   z.string().refine(v => !Number.isNaN(Date.parse(v))) }).strict();
const OnCompletionPayload        = z.object({ depends_on_content_id: z.string().min(1).optional() }).strict();
const OnMilestonePayload         = z.object({ milestone_key: z.string().min(1) }).strict();

const baseShape = {
  asset_type:        z.enum(ASSET_TYPES),
  asset_id:          z.string().min(1),
  asset_revision_id: z.string().min(1).nullable().optional(),
  display_order:     z.number().int().min(0).optional(),
  display_title:     z.string().max(200).nullable().optional(),
  display_caption:   z.string().max(2000).nullable().optional(),
};

export const CreateContentSchema = z.discriminatedUnion('cadence_kind', [
  z.object({ ...baseShape, cadence_kind: z.literal('immediate'),            cadence_payload: ImmediatePayload          }).strict(),
  z.object({ ...baseShape, cadence_kind: z.literal('relative_to_purchase'), cadence_payload: RelativeToPurchasePayload }).strict(),
  z.object({ ...baseShape, cadence_kind: z.literal('fixed_calendar'),       cadence_payload: FixedCalendarPayload      }).strict(),
  z.object({ ...baseShape, cadence_kind: z.literal('on_completion'),        cadence_payload: OnCompletionPayload       }).strict(),
  z.object({ ...baseShape, cadence_kind: z.literal('on_milestone'),         cadence_payload: OnMilestonePayload        }).strict(),
]);
```

| `cadence_kind` | Payload shape | PR-9 fan-out rule (documented; enforcement in PR-9) |
|---|---|---|
| `immediate` | `{}` (no fields) | Delivered inline at checkout. |
| `relative_to_purchase` | `{ offset_days: int >= 0 }` | Fire = `purchase_time + offset_days`. v1 is days-only (per brief). |
| `fixed_calendar` | `{ release_at: ISO 8601 datetime }` | Absolute date. If `release_at` is in the past at purchase, treat as immediate. |
| `on_completion` | `{ depends_on_content_id?: string }` or `{}` | Fires when the buyer completes the triggering asset. PR-11 wires the trigger. |
| `on_milestone` | `{ milestone_key: string }` | Fires on a named milestone emit (PR-11). |

Rejection behaviour (verified by tests):
- Unknown `cadence_kind` → 400 `CONTENT_INVALID`.
- Payload shape mismatched to the kind (e.g. `relative_to_purchase` with `release_at`) → 400 `CONTENT_INVALID`.
- Unknown top-level OR payload-level keys → 400 `CONTENT_INVALID`.
- Negative `offset_days` / non-ISO `release_at` / empty `milestone_key` → 400 `CONTENT_INVALID`.
- Patch with only one half of cadence (kind or payload) → 400 `CADENCE_PAIR_REQUIRED`.
- Reorder with extra / missing / duplicate ids → 400 `REORDER_INVALID`.

## (d) Asset-ownership validation — which existing checks were reused

The brief was emphatic: **REUSE the existing owned-asset lookups (the same ones AssignableAssetResolver / assignment services use — do NOT invent new ones)**. Each `assertAssetOwnedByCoach` branch mirrors the PR-7 resolver's predicate exactly:

| asset_type | PR-7 resolver predicate (file:line) | PR-8 reuse |
|---|---|---|
| `workout_program` + `workout_plan` | `WorkoutAssetResolver` delegates to `WorkoutBuilderService.assignPlan` which gates on `WorkoutPlan.coach_id === tenant`. The plan table is the source of truth (`src/workout-builder/workout-builder.service.ts:511`). | `prisma.workoutPlan.findFirst({ id, coach_id: tenant, archived_at: null })` — **stricter superset, intentional**: adds `archived_at: null` so the authoring path refuses an archived plan now rather than producing a row PR-9 would later fail on. |
| `meal_plan` | `MealPlanAssetResolver.assertPlanOwnedByTenant` (`src/packages/asset-resolvers/meal-plan.resolver.ts:172-186`) does `prisma.dailyMealPlan.findFirst({ id, coach_id: tenantCoachId, archived_at: null })`. | **Byte-identical** predicate. |
| `pdf` / `video` | `MediaAssetResolver` (`src/packages/asset-resolvers/media-asset.resolver.ts:61-76`) checks `coachMediaAsset.findUnique` then asserts `coach_id === tenantCoachId && !archived_at`. | `prisma.coachMediaAsset.findFirst({ id, coach_id: tenant, archived_at: null, kind })` — **stricter superset, intentional**: additionally pinned to the right `kind` so a `pdf` slot can't be filled with a `video` asset row. Tolerates the PR-12 upload pipeline not having shipped: clear `ASSET_NOT_FOUND` if no row exists. |
| `auto_message` | `AutoMessageAssetResolver` (`src/packages/asset-resolvers/auto-message.resolver.ts:66-69`) — no asset row; refuses on empty body. | No asset row lookup (matches resolver); body contract check instead — see (e). |

Tenant promotion: the controller calls `PackagesService.resolveEffectiveCoachId(req.user.id)` BEFORE the service, so for sub-coaches the `coachUserId` passed into `assertAssetOwnedByCoach` is the head coach id — which is exactly the tenant column the predicates query on. This matches the resolvers' `ResolverSubCoachScope.tenantCoachId` semantic.

## (e) auto_message contract alignment with PR-7

PR-7's `AutoMessageAssetResolver.materialise` defines the body source contract:

```ts
// src/packages/asset-resolvers/auto-message.resolver.ts:66-69
const body = (input.displayCaption ?? input.displayTitle ?? '').trim();
if (!body) {
  throw new AutoMessageBodyMissingError();
}
```

PR-8 mirrors this **rule-for-rule** at authoring time via a dedicated helper:

```ts
// src/packages/package-contents.service.ts
private assertAutoMessageBody(input: { display_title; display_caption }): void {
  const body = (input.display_caption ?? input.display_title ?? '').trim();
  if (!body) {
    throw new BadRequestException({
      error: 'AUTO_MESSAGE_BODY_REQUIRED',
      message: 'auto_message requires display_caption (preferred) or display_title to be non-empty (matches PR-7 AutoMessageAssetResolver body contract)',
    });
  }
}
```

Invoked from:
1. `parseCreate` (attach) — refuses new `auto_message` rows without a body.
2. `patch` — refuses any patch that, after merging the patch with the existing row, would leave both `display_title` AND `display_caption` empty/whitespace.

The `asset_id` field on `auto_message` is a free-form sentinel (PR-12 will introduce a `message-template` id format), and no asset row is queried — exactly mirroring PR-7's resolver which never touches a row.

## (f) Test results

### Verification commands
- `node_modules/.bin/tsc --noEmit -p tsconfig.json` → **clean** (0 errors)
- `npm run build` (`nest build`) → **clean**
- `npm run lint` (`eslint "src/**/*.ts"`) → **0 errors**, 17 pre-existing warnings unchanged from `main` (in unrelated files: `landing-pages.service.ts`, `lists.dto.ts`, `macros.service.ts`, `meal-plans.dto.ts`, `nudge-detector.service.ts`, `nudge-engine.service.ts`, `prep-guide.service.ts`, `real-meal-plans.service.ts`, `guest-checkout-pii-scrub.service.ts`).
- `node_modules/.bin/jest` → **282 suites pass; 3388/3388 active tests pass** (up from 3354 — 34 new), 20 skipped + 5 todo unchanged from `main`, 6 snapshots pass.

### New tests — `test/package-contents.service.spec.ts` (34 tests)

**Cadence validation (16 tests):**
- accepts `immediate` with `{}`; rejects `immediate` with extra keys
- accepts `relative_to_purchase` with `{ offset_days: int }`; rejects negative; rejects wrong shape (`release_at`); rejects extra payload keys
- accepts `fixed_calendar` with ISO `release_at`; rejects non-ISO string
- accepts `on_completion` with `{}` or `{ depends_on_content_id }`
- accepts `on_milestone` with `{ milestone_key }`; rejects without
- rejects unknown `cadence_kind`
- rejects unknown top-level keys

**Round-trip CRUD (5 tests):**
- list returns rows ordered by display_order; excludes soft-deleted
- patch updates cadence as a pair; rejects partial (only kind or only payload)
- patch rejects unknown keys (strict)
- softDelete is idempotent
- patch on a non-existent contentId 404s

**IDOR / cross-coach refusal (6 tests):**
- coach-1 cannot attach to coach-2's package (`NotFoundException`)
- coach-1 cannot list coach-2's package contents
- coach-1 cannot attach coach-2's workout asset to their own package
- coach-1 cannot attach coach-2's meal_plan
- coach-1 cannot attach coach-2's pdf media_asset
- pdf attach with missing CoachMediaAsset row (PR-12 not shipped) returns clear `ASSET_NOT_FOUND`

**display_order append + reorder (3 tests):**
- new rows append to max+1 across multiple attaches
- atomic reorder; rejects missing / extra / duplicate id sets
- reorder excludes soft-deleted rows from the expected set

**auto_message body contract (PR-7 alignment, 5 tests):**
- rejects attach without caption AND title
- rejects whitespace-only caption AND title
- accepts caption (preferred body source)
- accepts only title (fallback body source)
- rejects patch that would clear the auto_message body to empty

**Sub-coach scope (1 test):**
- sub-coach `resolveEffectiveCoachId` promotes to head coach; attach succeeds against head's package + head's asset

## Files added / changed

```
src/packages/package-contents.controller.ts        (new — 5 endpoints)
src/packages/package-contents.service.ts           (new — attach/list/patch/softDelete/reorder + asset ownership reuse)
src/packages/package-contents.dto.ts               (new — zod discriminated union + create/patch/reorder schemas)
src/packages/packages.module.ts                    (mod — wire controller + service)
test/package-contents.service.spec.ts              (new — 34 tests)
```

## Guardrails honoured

- Backend authoring **ONLY** — no checkout, fan-out, cron, mobile, media-upload, or "push to existing" code touched.
- No new asset-ownership predicates invented; each branch of `assertAssetOwnedByCoach` mirrors a PR-7 resolver's existing check.
- auto_message contract is byte-identical to PR-7's `AutoMessageAssetResolver` body source rule.
- Soft-delete only — `removed_at` set; rows never hard-deleted; PR-9 snapshots-by-id survive authoring edits.
- `display_order` integrity preserved: append-to-max+1 on attach; atomic reorder in a single transaction with strict id-set parity (extra/missing/duplicate rejected).
- IDOR + sub-coach scope enforced on every endpoint via the same `resolveEffectiveCoachId` + `requireOwnedPackage` pattern PR-6 used.
- No schema migrations. No changes to existing controllers / services beyond `packages.module.ts` wiring.
