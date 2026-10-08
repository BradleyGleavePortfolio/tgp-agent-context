Tier: T4
Why: new client-facing write paths that change and destroy a client's own health data (weigh-ins), so tenancy scoping must be exact.
T4 trigger scan: destructive user data (DELETE of a WeightLog row) and a tenancy-scoped write (PATCH). No auth, RLS, money, credentials or consent change.
T3 trigger scan: none (no copy, prompt or policy text).
Bounded T1: NO (destructive data path).
Canonical builder: Claude Opus 5.5 (CF-BODY-J2-128, agent 129 CLIENTFIX wave; job FW-BODY-128 J2).
Parent owner: operator agent 129.
Acceptance evidence: test/weight.service.spec.ts (new, 16 tests). Failing-first: on main c3324d4a with only this test file added, 15 of 16 fail (`updateWeight`/`deleteWeight` and `UpdateWeightDto` do not exist; the one pass is the "accepts" case, which a missing DTO cannot reject). With the change: 16/16 pass. Neighbours still pass locally: test/cross-tenant-isolation.spec.ts (5/5), test/ptm-signal-hooks.spec.ts (7/7). A targeted strict `tsc --noEmit` over the four files is clean; CI runs the full type check, lint and suite.
Promotion triggers: any change to the `where: { id, user_id }` scoping, to the guards on WeightController, a soft-delete or audit requirement, or a schema change.

## What changes for clients and coaches
- A client can fix a wrong weigh-in (new number, new note, or clear the note) or remove it. Today a typo stays forever in the Progress chart, Start/Change, the coach's Progress tab and Roman's context (FW-BODY-128 U4).
- Backend only. The app gains the Edit/Delete row action in the follow-up mobile job (FW-BODY-J2M), which waits for this to be deployed. Nothing changes in the app until then.
- Coaches: no new access. A coach still only reads the client's weigh-ins as before; edits and deletes show up there because those reads are live.

## What the API does
| Route | Before | After |
|---|---|---|
| POST /weight | log a weigh-in | unchanged |
| GET /weight/history?days | list weigh-ins + height_cm | unchanged |
| PATCH /weight/:id | (404, no route) | body `{ weight_lbs?, notes? }`; 200 with the saved row |
| DELETE /weight/:id | (404, no route) | 204 No Content |

- Both writes use `where: { id, user_id: req.user.id }` in the single write statement (`updateMany` / `deleteMany`); a weigh-in that is not the caller's, or does not exist, matches no row, answers 404 "Weigh-in not found." and is never read or changed. The user id comes only from the signed-in user, never from the path or body.
- Same guards as the existing routes (class-level `JwtAuthGuard` + `RolesGuard`, `@Roles('student')`, no per-route override; test pins it). The documented role hierarchy lets coach/owner accounts reach student routes, but they too can only touch weigh-ins whose `user_id` is their own id.
- `UpdateWeightDto` is an allow-list: `weight_lbs` 40-1,500 (same bounds as logging; never null because the column is required), `notes` up to 500 characters (null clears it). The global pipe's `forbidNonWhitelisted` answers 400 for `date`, `user_id` or any other field. An empty body answers 400 before any database call.
- After each successful write `ClientAIContextService.invalidateForUser` busts the AI Guide cache and Roman's per-turn memo, so Roman stops quoting the old number. No PTM signal is emitted for an edit or delete.
- Hard delete, the same as food-log delete (src/log/log.service.ts deleteEntry) and habit delete; no audit row, matching those. No migration, no schema change, no flag (additive routes; nothing calls them until J2M ships).

## Diff
4 files, 253 additions, 5 deletions = 258 changed lines (source 60 + 5; tests 193): src/weight/weight.controller.ts, src/weight/weight.service.ts, src/weight/weight.dto.ts, test/weight.service.spec.ts (new). Minimal diff based on main; no open PR touches these files (checked b#857 and b#855 on the board: neither touches src/weight/*). main merged in (b#857) before READY.

## B / U list
- B: none.
- U4 (FW-BODY-128): cannot delete or edit a weigh-in. Backend half fixed here; mobile half is FW-BODY-J2M.
- C (not fixed, internal only): the PTM `weight_logged` signal recorded when a since-deleted or edited weigh-in was logged stays in the internal trend factor until three newer weigh-ins replace it. Not customer-facing.
