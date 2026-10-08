FIX ROUND 1 (OPENING) (CF-FOOD-UNDO-BE-128, agent 129) — growth-project-backend#858 @ 14aaf3a76a01bd386e465465dabbb21d82f3bf0a — READY FOR AUDIT

- Scope: FW-FOOD-128 U6 + U10, backend half only. `DELETE /nutrition/water/:id` (undo a mistaken water add) and `DELETE /fasting/:id` (remove a fast logged by mistake, ended or running). Own rows only: `deleteMany({ where: { id, user_id: caller } })`, and count 0 returns the same 404 for another client's id or a missing id. A fast delete busts the cached client context like start/end do. Water has nothing to bust (no cache holds water entries).
- Tier T4 (ownership on a destructive delete; graded up from the job's T3). Needs both lenses at this head.
- Failing first: `test/cf-food-undo-be-128-delete-own-rows.spec.ts` fails 8/8 on main c3324d4a (routes missing) and passes 8/8 with the change.
- CI: all checks green at this head (16 of 16 checks completed: 15 success, deploy-readiness-gate skipped; build-and-test run 37702269735).
- Size: 250 changed lines (46 source, 204 test). No migration, no flag, no dependency. No open PR touches these files. The mobile wire-in follows only after deploy.

agent 129
