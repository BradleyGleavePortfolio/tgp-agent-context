# WAVE-1 CC+SC — Build Report

**Unit:** Command-Center data integrity (CC-1..5) + sub-coach scoping (SC-1, SC-2)
**Builder:** Dynasia G `<dynasia@trygrowthproject.com>` (Opus)
**Repo:** `growth-project-backend` · base `origin/main` @ `9c191be`
**Branch:** `issues/command-center-integrity-subcoach`
**PR:** #335 — *Wave1 CC+SC: command-center data integrity + sub-coach scoping (CC-1..5, SC-1/2)* → `main`
**Final SHA:** `ef624d4ce4659fb19ad45e2f3d572f2564bceeb1` (`ef624d4`)

## Files touched (ONLY these — confirmed)
- `src/coach/command-center/command-center.service.ts`
- `src/coach/command-center/command-center.controller.ts`
- `test/command-center.service.spec.ts`
- `test/command-center.controller.spec.ts`

No edits to `sub-coach-scope.service.*` (IMPORT/CALL only), `ltv-metrics.*`, `coach-effectiveness.*`, `churn-intervention.*` (READ only for CC-3), `prisma/schema.prisma` (no migration), or any other module.

`git diff --name-only origin/main...HEAD` returns exactly the 4 files above.

---

## SubCoachScopeService wiring (SC-2 foundation)
`SubCoachScopeService` is provided/exported by the `@Global SubCoachModule`, so it is injectable into `CommandCenterService` **without editing any module** (`coach.module.ts` untouched). It is injected as `@Optional()` (4th constructor param) — matching the established pattern in `coach.service.ts` / `messaging.service.ts` — so the existing positional-construction unit tests (3 deps) still build the service. When present it drives all scoping; when absent it falls back to the legacy head-coach roster query (behaviour unchanged for head coaches).

Two private helpers centralise resolution:
- `resolveScope(coachId)` → `{ clientIds, ownerCoachId }`.
- `resolveScopeWithNames(coachId)` → adds a `nameMap`.

`ownerCoachId` is the **head coach id** under which `CoachAlert` / `CoachMessage` rows are stored. For a sub-coach we scope those tables by `(coach_id = ownerCoachId, client_id IN clientIds)` because a sub-coach's threads/alerts live under the head coach's id (`getHeadCoachIdForSubCoach`), with `sender_id` capturing the actual sub-coach. For a head coach `ownerCoachId === coachId`.

---

## Per-issue changes & chosen semantics

### SC-1 — guard moved off class level
`command-center.controller.ts:62` applied `NoActiveSubCoachGuard` at **class** level, blocking active sub-coaches from the **entire** Command Center (overview / at-risk / win-streaks / inbox / action-queue) — all of which are **operational, non-financial** surfaces.
**Fix:** removed the class-level guard; class stack is now `[JwtAuthGuard, CoachGuard]`.
**Chosen semantic (documented in code):** This controller has **no** financial/owner-only route handlers — the revenue dashboard is the separate `LtvMetricsController` (`GET /coach/command-center/ltv-metrics`), owned by the LTV unit, which is where the financial guard belongs. There was therefore nothing on this controller to re-apply the guard to. A code comment instructs future maintainers to decorate any new financial handler with `@UseGuards(NoActiveSubCoachGuard)`. The guard's blocking behaviour itself remains proven by the existing `NoActiveSubCoachGuard` unit tests (throws `ForbiddenException` for an active sub-coach).

### SC-2 — roster scoping via SubCoachScopeService
All 9 cited sites (159, 200, 219, 324, 414, 427, 453, 504, 517) now scope through `resolveScope` / `resolveScopeWithNames`:
- `getOverview` (159 roster; 200 alerts; 219 messages) → resolved `clientIds` + `ownerCoachId`.
- `getAtRisk` → intersects the admin risk board with resolved `clientIds` (board resolves by coachId = head's full roster, so a sub-coach is narrowed to assigned clients).
- `getWinStreaks` (324) → resolved roster + names.
- `getInbox` (414/427/453) → resolved roster; messages scoped by `(ownerCoachId, client_id IN clientIds)`.
- `getActionQueue` (504/517) → alerts scoped by `(ownerCoachId, client_id IN clientIds)` for both the page and the total count.

`dismissAlert` was intentionally left delegating to `alertsService.acknowledge(alertId, coachId)` (not in the cited site list); that service performs its own `(id, coach_id)` IDOR check, and rewriting it was out of the listed scope.

### CC-1 — pending_actions ≠ open_alerts
`:251/:255` set both tiles to the same `openAlerts` variable.
**Fix:** `open_alerts` = unacknowledged `CoachAlert` count; `pending_actions` = count of **unreviewed check-ins** (`CheckIn.reviewed_by_coach = false`) across the roster.
**Chosen semantic (ambiguous — documented in code + here):** there is no separate task-queue table in scope. `CoachAlert` already backs `open_alerts` and the action-queue endpoint, so reusing it would not make the tiles distinct. `CheckIn.reviewed_by_coach` is the schema's explicit per-item "coach still needs to act on this" flag (added for the coach dashboard summary), making it the most defensible independent "pending coach work" source. The two tiles now move independently.

### CC-2 — active_today counts CheckIns
`:186-190/:249` counted `ClientSignal` rows (PTM recalcs, streak updates, app-open pings = system telemetry).
**Fix:** `active_today` = distinct clients with a real `CheckIn` in the last 24h (`groupBy user_id`, rolling 24h preserved from the original window).

### CC-3 — real top factor from PtmPrediction.factors
`:302-310` `topFactorLabel()` returned hard-coded generic strings.
**Fix:** added `PtmFactor` / `isPtmFactor` / `parseFactors` (replicated from `churn-intervention.service.ts`, which was READ-only — the helpers there are file-private so could not be imported) plus a `loadTopFactors(userIds)` that reads the latest `PtmPrediction.factors` per displayed user and returns the highest-contribution `label`. `topFactorLabel(row, realTopFactor)` prefers the real label and falls back to the activity heuristic only when a user has no parseable factors (e.g. brand-new client). The Phase-1E risk board intentionally omits the factors blob, so the predictions are read directly (scoped to displayed users only).

### CC-4 — inbox/unread consistency beyond 1000
`:425-448` built threads from a `take: 1000` global slice while `total_unread` came from an independent `groupBy` over **all** messages — so a thread whose latest message sat past the 1000-row window vanished from the list yet still counted toward unread.
**Fix:** latest-message-per-thread now uses `distinct: ['client_id']` ordered by `created_at desc` (exactly one newest row per client, volume-independent). `total_unread` is the **sum of the displayed threads' unread counts**, so the visible list and the tile always describe the same set.

### CC-5 — check_in_rate_7day is a frequency
`:242-245` was binary participation: `distinct clients with ≥1 check-in in 7d / rosterSize`, so 10 clients × 1 check-in = 100%.
**Fix / formula (documented in code):**
```
check_in_rate_7day = min( totalCheckIns_7d / (rosterSize * 7), 1 )
```
expecting one check-in per client per day (7 per client per week), clamped to [0,1]. 10 clients × 1 check-in now ≈ 0.14; a fully adherent roster (1/client/day) = 1.0.

---

## Tests
Extended `test/command-center.service.spec.ts` (in-memory Prisma fakes) and `test/command-center.controller.spec.ts`.

New / updated coverage:
- **SC-1**: class guard stack is exactly `[JwtAuthGuard, CoachGuard]` and excludes `NoActiveSubCoachGuard`; a sub-coach reaches an operational handler (financial-block behaviour covered by the retained `NoActiveSubCoachGuard` unit tests).
- **SC-2**: head coach sees full roster (3) vs sub-coach sees only assigned (1) for overview + action-queue (uses a real `SubCoachScopeService` over the fake Prisma).
- **CC-1**: `pending_actions` (2 unreviewed check-ins) ≠ `open_alerts` (1).
- **CC-2**: 3 clients with signals but only 1 check-in → `active_today` = 1.
- **CC-3**: top factor = highest-contribution label regardless of array order; not the old generic string.
- **CC-4**: an "old" thread still appears alongside a 50-message flood; `total_unread` equals the sum of displayed threads (2).
- **CC-5**: 10×1 check-in ≈ 0.14 (< 1); fully adherent = 1.0.

Fake extensions: `user.findUnique` + `id.in`, `subCoachAssignment.findMany`, `checkIn.count` (incl. `reviewed_by_coach`), `coachAlert` `client_id.in` filter, `coachMessage.findMany` `distinct` emulation, `buildSubCoachScope`.

---

## Verification (actual results at SHA ef624d4)
| Check | Command | Result |
|---|---|---|
| Type-check | `npx tsc --noEmit` | **0 errors** |
| Lint (touched files) | `npx eslint <4 files>` | **0 errors** (also removed a pre-existing `Function[]` lint) |
| Command-center specs | `npx jest test/command-center.*.spec.ts` | **25 passed / 25**, 2 suites |
| No collateral breakage | `npx jest churn-intervention.service sub-coach-scope.service` | **24 passed / 24** |

## Cadence / identity
Commits authored `Dynasia G <dynasia@trygrowthproject.com>`, no trailers, pushed incrementally. `npm ci` run (deps installed, 0 vulnerabilities).

## Confirmation
I edited **only** `command-center.service.ts`, `command-center.controller.ts`, and their two specs. No other files were modified.
