# AUDIT — PR-8 Coach package CONTENTS endpoints + zod-per-cadence validation (PR #318)

VERDICT: NOT CLEAN
Typecheck: pass — `node_modules/.bin/tsc --noEmit -p tsconfig.json` (0 errors)
Lint: pass — `npm run lint` (0 errors, 17 pre-existing warnings in unrelated files; identical to `main`)
Build: pass — `npm run build` / `nest build` (clean)
Tests: pass — `node_modules/.bin/jest` → **282 suites, 3388/3388 active tests pass** (20 skipped + 5 todo unchanged from `main`, 6 snapshots pass). New `test/package-contents.service.spec.ts` adds 34 tests, all green; matches the build-report claim.

---

## P0 findings
*(none)*

## P1 findings
*(none)*

## P2 findings

### P2-a — `nextDisplayOrder` is a read-then-write race; concurrent attaches can produce duplicate `display_order`
- **Location:** `src/packages/package-contents.service.ts:82-83` (call site) and `:341-348` (`nextDisplayOrder` helper).
- **Evidence:**
  ```ts
  // attach()
  const display_order =
    input.display_order ?? (await this.nextDisplayOrder(packageId));

  return this.prisma.coachPackageContent.create({ data: { …, display_order, … } });

  // nextDisplayOrder()
  const tail = await this.prisma.coachPackageContent.findFirst({
    where: { package_id: packageId, removed_at: null },
    orderBy: { display_order: 'desc' },
    select: { display_order: true },
  });
  return tail ? tail.display_order + 1 : 0;
  ```
  The `findFirst` and the subsequent `create` are not serialised. Two concurrent `attach` calls on the same package both read `tail.display_order = N` and both INSERT a row with `display_order = N + 1`. There is no database-level uniqueness on `(package_id, display_order)` — `prisma/schema.prisma:4669-4670` only indexes the tuple, it does not enforce uniqueness. The duplicate is therefore allowed to land.
- **Why P2:** the brief is explicit ("`display_order` integrity: appends go to max+1; reorder is atomic; no duplicate orders that scramble the editor"). Two simultaneous attaches scramble the editor exactly as forbidden. Downstream impact is limited (PR-9 fan-out reads by `display_order asc` and would still snapshot both rows, just in a non-deterministic relative order), so this is correctness-degrades-quality rather than data loss — P2, not P1. Real-world likelihood is low because a single coach is typically editing a package, but the brief asks us to flag exactly this class of race.
- **Fix recommendation:** Either (a) wrap the read+write in `prisma.$transaction(async (tx) => …, { isolationLevel: Serializable })` and use `tx.coachPackageContent.findFirst` / `tx.coachPackageContent.create` (Postgres SERIALIZABLE will abort one of the two concurrent writers and the loser retries), OR (b) add an additive migration `@@unique([package_id, display_order])` partial-on-(removed_at IS NULL) (Prisma can't express partial uniques natively but raw-SQL migrations elsewhere in the repo do — e.g. `WorkoutPlanExercise` per the comment at `prisma/schema.prisma:2032-2034`) and catch P2002 with a retry. Option (a) is the lighter touch.

### P2-b — `reorder` has a TOCTOU race between the parity read and the transactional update; a concurrent `attach` can land a row with a colliding `display_order`
- **Location:** `src/packages/package-contents.service.ts:206-244`.
- **Evidence:**
  ```ts
  // line 206-209 — OUTSIDE the transaction
  const current = await this.prisma.coachPackageContent.findMany({
    where: { package_id: packageId, removed_at: null },
    select: { id: true },
  });
  …
  // line 237-244 — transaction begins HERE
  await this.prisma.$transaction(
    content_ids.map((id, idx) =>
      this.prisma.coachPackageContent.update({
        where: { id },
        data: { display_order: idx },
      }),
    ),
  );
  ```
  A concurrent `attach` (or another `reorder`) running between the `findMany` and the `$transaction` is invisible to the parity check. The attach-append uses `nextDisplayOrder` against the pre-reorder state and writes e.g. `display_order = N`. The reorder then rewrites the existing rows to `0..N-1`. The newly attached row's `display_order = N` is correct, BUT under different interleavings (attach completes after `findMany` but before any update; attach computed against the OLD max so its `display_order` collides with what reorder is about to assign to one of the existing rows) two rows end up sharing the same `display_order`. The brief warns about exactly this: "no duplicate orders that scramble the editor" / "atomic reorder".
- **Why P2:** as with P2-a, the integrity guarantee is violated under concurrency; behaviour is non-fatal (rows still exist, list still returns them, PR-9 snapshots still capture them) but the editor's invariant ("display_order is a contiguous permutation 0..k-1") is broken. P2.
- **Fix recommendation:** Move the `findMany` parity check inside an interactive (`async (tx) =>`) `$transaction` with at least `RepeatableRead` (better: `Serializable`) isolation, so a concurrent `attach`/`softDelete` either serialises before the reorder reads or aborts. Alternatively, gate package-content mutations on a per-package advisory lock (`SELECT pg_advisory_xact_lock(hashtext('pkg:' || packageId))`) at the top of `attach`, `reorder`, `softDelete`, and `patch`. The advisory-lock approach is simpler and fixes both P2-a and P2-b in one stroke.

---

## P3 (non-blocking)

### P3-a — `requireOwnedContent` does not filter `removed_at`; `patch` can mutate a soft-deleted row
- **Location:** `src/packages/package-contents.service.ts:325-339`.
- **Evidence:** `findFirst({ where: { id: contentId, package_id: packageId } })` returns the row regardless of `removed_at`. `patch()` then updates it. Functionally inert today: `list` already filters out removed rows, and PR-9's snapshot-by-id won't re-load it. But conceptually a removed row should be immutable except for the idempotent re-delete that `softDelete` already special-cases.
- **Why P3:** no user-visible defect at PR-8 scope, but a foot-gun for future maintainers (e.g. PR-17's "push to existing" should not touch removed authoring rows).
- **Fix recommendation:** Add `removed_at: null` to the `findFirst` in `requireOwnedContent` and let `softDelete` keep its own lookup that intentionally bypasses the filter. Or have `patch` short-circuit with `CONTENT_REMOVED` when `row.removed_at != null`.

### P3-b — `WorkoutPlan` ownership predicate adds `archived_at: null`, which `WorkoutBuilderService.assertPlanOwnership` does not enforce
- **Location:** `src/packages/package-contents.service.ts:379-385` vs `src/workout-builder/workout-builder.service.ts:763-767`.
- **Evidence:** `WorkoutBuilderService.assertPlanOwnership` only checks `plan.coach_id === coachId` — does not filter archived. PR-8 also filters `archived_at: null`. This is intentionally stricter (and matches the meal_plan/media predicates). Not a parity defect — refuse-early is correct.
- **Why P3:** the build report claims byte-parity with PR-7 for workout, which is slightly imprecise — PR-7's `WorkoutAssetResolver` delegates to `assignPlan` which uses the looser predicate. The PR-8 stricter predicate is the RIGHT call for authoring (you shouldn't be able to attach an archived plan to a new package), but the report should say "stricter than" rather than "byte-identical to" for workout.
- **Fix recommendation:** Documentation only — clarify the PR description.

### P3-c — PR-7 resolver `archived_at` semantics: media-asset.resolver.ts uses `findUnique` + `archived_at` boolean check, whereas PR-8 uses `findFirst({ archived_at: null })` — same semantic, different shape
- **Location:** `src/packages/asset-resolvers/media-asset.resolver.ts:61-76` vs `src/packages/package-contents.service.ts:414-428`.
- **Evidence:** PR-7 does `findUnique → if (!asset || asset.archived_at) throw NotFound`. PR-8 does `findFirst({ archived_at: null, kind: assetType })`. The `kind` pin is an extra safety check (good) but the surfaces aren't byte-identical despite the report's claim. Functionally equivalent.
- **Why P3:** doc-accuracy only.

---

## Verification of PR claims

| Claim from PR8_BUILD_REPORT.md | Verified |
|---|---|
| 5 endpoints (GET/POST/PATCH/DELETE/PUT reorder) wired with JwtAuthGuard + CoachOrOwnerGuard + SubscriptionGuard, role-gated to coach/owner | **TRUE** — `src/packages/package-contents.controller.ts:42-43, 50, 58, 71, 84, 99` |
| Body accepted as `unknown` and validated by zod in the service (not class-validator) | **TRUE** — controller handlers take `@Body() body: unknown`; service runs `CreateContentSchema.safeParse` etc. |
| zod discriminated union per cadence_kind with `.strict()` on every branch AND every nested payload | **TRUE** — `src/packages/package-contents.dto.ts:37-148`. Each branch `.strict()`, each payload schema `.strict()`. |
| Rejects unknown cadence_kind, mismatched payload, unknown top-level keys, unknown payload keys | **TRUE** — exercised by tests at `test/package-contents.service.spec.ts:317, 244, 328, 340` and verified by reading the schema. |
| Patch enforces cadence pair (kind+payload both or neither) | **TRUE** — `src/packages/package-contents.service.ts:117-124`. Test at `test/package-contents.service.spec.ts:391-402` covers both partial halves. |
| Asset-ownership predicates reuse the same coach-scoped lookups PR-7 resolvers use | **TRUE for meal_plan** (byte-identical to `MealPlanAssetResolver.assertPlanOwnedByTenant`). **TRUE-with-caveat for workout/media** — both are *stricter* than the PR-7 resolver (workout adds archived_at filter; media adds kind filter). Stricter is correct for authoring; the claim of "byte-identical" in the build report is slightly imprecise — see P3-b/P3-c. No security/correctness defect. |
| auto_message body contract matches PR-7's `AutoMessageAssetResolver` byte-for-byte (`(displayCaption ?? displayTitle ?? '').trim()`) | **TRUE** — `src/packages/package-contents.service.ts:311-323` mirrors `src/packages/asset-resolvers/auto-message.resolver.ts:66-69` exactly. Applied at attach AND patch (post-merge with existing row). |
| IDOR + sub-coach scope on EVERY endpoint via `resolveEffectiveCoachId` + `requireOwnedPackage` | **TRUE** — `package-contents.controller.ts:53, 65, 79, 92, 107` all call `resolveEffectiveCoachId`, and every service entry-point's first line is `await this.packages.requireOwnedPackage(coachUserId, packageId)`. |
| Soft-delete only; never hard-delete | **TRUE** — only `update({ data: { removed_at: new Date() } })`; no `delete()` or `deleteMany()` call exists in the new files. `softDelete` is idempotent (returns the existing row if `removed_at` is already set). |
| Reorder rejects extra/missing/duplicate ids | **TRUE** — `src/packages/package-contents.service.ts:200-233`. Tests at `test/package-contents.service.spec.ts:559-574`. **However:** reorder is NOT race-free against concurrent mutations — see **P2-b**. |
| display_order appends to max+1 | **TRUE per single-writer case** — `nextDisplayOrder` returns `tail.display_order + 1`. **NOT race-free under concurrent attach** — see **P2-a**. |
| 282 suites, 3388/3388 active tests pass; 34 new | **TRUE** — verified independently (`node_modules/.bin/jest` output): `Test Suites: 282 passed, 282 total; Tests: 20 skipped, 5 todo, 3388 passed, 3413 total`. |
| 0 ESLint errors; 17 pre-existing warnings unchanged | **TRUE** — verified independently. None of the 17 warnings are in PR-8 files. |
| No checkout/fan-out/cron/mobile/media-upload/push-to-existing changes | **TRUE** — `git diff --stat main..HEAD` shows only `src/packages/package-contents.controller.ts`, `src/packages/package-contents.service.ts`, `src/packages/package-contents.dto.ts`, `src/packages/packages.module.ts` (wiring only), and `test/package-contents.service.spec.ts`. No migrations. |
| No new asset-ownership predicates invented | **TRUE in intent** — each branch mirrors a PR-7 resolver's existing predicate. The workout/media branches are *stricter* (extra archived_at / kind filters) but do not invent a new lookup surface. |

---

VERDICT: NOT CLEAN
