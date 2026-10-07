Tier: T4
Why: two new client routes hard-delete a row the caller owns (a water entry, a fast); a wrong owner check would let one client delete another client's health log.
T4 trigger scan: ownership enforcement on a destructive mutation (DELETE of one WaterLog or FastingWindow row, own rows only). Graded up from the job row's T3 under the max-tier rule; both lenses review either way.
T3 trigger scan: none (no shared abstraction, no contract another domain consumes, no migration; the mobile wiring is a later, separate PR).
Bounded T1: NO (privilege bounded fails: ownership + destructive delete).
Canonical builder: Claude Opus 5.5 (CF-FOOD-UNDO-BE-128, operator agent 129).
Parent owner: operator agent 129.
Acceptance evidence: `test/cf-food-undo-be-128-delete-own-rows.spec.ts`, 8 tests over real HTTP (real WaterController + WaterService, FastingController + FastingService, real RolesGuard and global HttpExceptionFilter, in-memory Prisma double). Failing first: on main c3324d4a all 8 fail, because neither route exists (404 "Cannot DELETE /nutrition/water/water-alice", "Cannot DELETE /fasting/fast-alice-ended"). With this change all 8 pass locally; CI runs the full suite at the head.
Promotion triggers: a soft-delete or audit-trail requirement; letting anyone other than the row's owner delete (for example a coach); the mobile Undo / Remove wiring (separate PR, after deploy).

## What changes for coaches and clients
Nothing visible yet. The backend gets two routes that the app can use once this is deployed:
- `DELETE /nutrition/water/:id` lets a client take back a water add they tapped by mistake (FW-FOOD-128 U6: until now a wrong "+16oz" tap stayed forever).
- `DELETE /fasting/:id` removes a fast logged by mistake, whether it has ended or is still running (U10: a mistaken 2-minute fast stayed in history and lowered "Avg hours").

A client can delete only their own rows. Another client's id, or an id that does not exist, gets the same 404 ("Water entry not found" / "Fast not found") and nothing is deleted. The caller is always the signed-in user from the JWT, so a coach cannot delete a client's rows.

## How
- The owner check is part of the delete: `deleteMany({ where: { id, user_id: caller } })`, and a count of 0 returns 404. That is one statement, so no gap opens between a read and the delete.
- The response is `{ id, deleted: true }`, the same shape `DELETE /community/wins/:id` returns.
- Removing a fast calls `ClientAIContextService.invalidateForUser`, the same call start and end make, because both the context cache and Roman's per-turn memo read fasts. Water has no cache to clear: neither cache holds water entries (only the water goal), and Roman's history tool reads WaterLog live. `logWater` does not clear the cache either.
- Guards are unchanged and come from the class: `/nutrition/water/*` uses JwtAuthGuard + RolesGuard (student); `/fasting/*` uses JwtAuthGuard + ClientEntitlementGuard + RolesGuard (student). `test/entitlement-guards-mounted.spec.ts` pins that paid gate.
- No migration: no foreign key points at either table, and both ids are TEXT, so an odd id is a plain 404. No flag: these are new routes only, and nothing calls them until the mobile PR. No new dependency and no schema change.

## Open PRs touching these files
None. I ran `git diff --name-only origin/main...origin/<branch>` for the backend PRs on the board (b#855, b#857) and scanned every agent127/128/129 branch: none touches `src/water`, `src/fasting` or the new spec. This PR is based on main and kept minimal: 4 source files (+42 / -4) and one new spec. Size: 250 changed lines (46 source, 204 test).

## B / U list
- U6 (FW-FOOD-128), backend half: fixed here. The mobile "Undo" follows after deploy.
- U10 (FW-FOOD-128), backend half: fixed here (delete only; editing a start time is NEW and out of scope). The mobile "Remove this fast" follows after deploy.
- B: none found.

## Note for the mobile follow-up
When the app removes the fast that is still running, it should also cancel the "Fasting window ended" alert it scheduled locally (`FastingScreen.tsx`); this backend change cannot reach that alert.
