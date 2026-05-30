# WAVE-1 EFF — Coach-effectiveness fixes (issues EFF-1, EFF-2, EFF-3)

## Role
BUILDER (Opus 4.8). Worktree `/home/user/workspace/wt-eff` only. R4 identity `Dynasia G <dynasia@trygrowthproject.com>`, NO trailers. Push every ~2 min (R61). api_credentials=["github"] for git ops.

## Repo / base / branch
- Repo `growth-project-backend`. Base `origin/main` @ `9c191be`.
- Branch `issues/coach-effectiveness-fixes`.

## Scope — files you may edit (file-disjoint from all other Wave-1 units)
PRIMARY: `src/coach/coach-effectiveness.service.ts`. You MAY also touch `src/coach/coach-effectiveness.scheduler.ts` and add a route to the controller that exposes coach-effectiveness IF it lives in a coach-effectiveness-owned controller — but DO NOT edit `command-center.*` or `ltv-metrics.*` (other units own those). EFF-3 needs `SubCoachScopeService` (`src/sub-coach/sub-coach-scope.service.ts`) — you may IMPORT and CALL it (read-only dependency) but DO NOT edit that file. DO NOT touch `prisma/schema.prisma` (no migration needed). Confirm the route you add (EFF-2) doesn't require editing a shared controller owned by another unit; if `admin.controller.ts` is the only effectiveness surface, add the NEW coach-facing route in a coach-effectiveness controller/module you own, NOT in admin.controller.ts.

## The three issues
- **EFF-3 (📊)**: `coach-effectiveness.service.ts:207-218` — roster filter is `coach_id = coachId` only, so sub-coaches always score 0/"developing". Use `SubCoachScopeService` to resolve the authorized client roster for the coach (head coach → full roster; sub-coach → their assigned clients via SubCoachAssignment). Replace the naive `coach_id = coachId` filter with the scope service's resolved client-id set so sub-coaches score against THEIR roster. Inject SubCoachScopeService via the module (wire the import in the coach-effectiveness module you own).
- **EFF-1 (📊🧹)**: `coach-effectiveness.service.ts:307-326` — 2 sequential `ptmPrediction.findFirst` per client inside a loop (N×2 round-trips, N+1, 50-Failures #21). Refactor to a single batched query (e.g. one `findMany` over all client ids with the needed predictions, then group in memory; or a groupBy) so it's O(1) queries not O(N). Preserve the exact same per-client selection semantics (which prediction is picked — newest? specific type?). Verify the batched result reproduces the loop's choices exactly.
- **EFF-2 (📊)**: no `GET /coach/my-effectiveness` route — only owner/admin (`admin.controller.ts:302-307`). Add a coach-facing route returning the CALLING coach's own effectiveness score (scoped to req.user.id; guard with the coach role guard the repo uses). Add it in a controller in the coach-effectiveness module (NOT admin.controller.ts). Reuse the existing scoring service method; just expose it for the authenticated coach.

## Tests
Extend/add the coach-effectiveness spec: (a) sub-coach scores against assigned roster (EFF-3) — head vs sub produce different rosters; (b) batched predictions (EFF-1) — assert query count reduced AND same per-client result as before (you can assert the picked prediction equals the prior findFirst semantics on a fixture); (c) `GET /coach/my-effectiveness` returns the caller's score, is role-guarded, and does NOT leak other coaches. Keep existing tests green.

## Verify (run, report actual counts)
`npm ci` if needed. `npx tsc --noEmit` (0 errors); `npm run lint` (no NEW errors in touched files); `npx jest` on the effectiveness spec (counts); `npm run build` if quick.

## Deliverables
Push branch; open PR `Wave1 EFF: sub-coach roster scoping + batch predictions (N+1) + /coach/my-effectiveness` to main (gh, #). Build report `specs/WAVE1_EFF_BUILD_REPORT.md` (EFF-3 scope-service wiring, EFF-1 batch approach + equivalence proof, EFF-2 route + guard, test counts, final SHA), commit (R4) + push to docs main after rebase. Report final SHA, PR#, counts, and CONFIRM you did not edit command-center/ltv-metrics/sub-coach-scope source. Builder record — GPT-5.5 auditor re-checks at your SHA.
