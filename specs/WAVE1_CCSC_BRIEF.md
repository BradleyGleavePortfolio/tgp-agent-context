# WAVE-1 CC+SC — Command-Center data integrity + sub-coach scoping (CC-1..5, SC-1, SC-2)

## Role
BUILDER (Opus 4.8). Worktree `/home/user/workspace/wt-ccsc` only. R4 identity `Dynasia G <dynasia@trygrowthproject.com>`, NO trailers. Push every ~2 min (R61). api_credentials=["github"] for git ops.

## Repo / base / branch
- Repo `growth-project-backend`. Base `origin/main` @ `9c191be`.
- Branch `issues/command-center-integrity-subcoach`.

## Scope — files you may edit (file-disjoint from all other Wave-1 units)
ONLY: `src/coach/command-center/command-center.service.ts` and `src/coach/command-center/command-center.controller.ts` (+ their spec/test). EFF-3/SC scoping uses `SubCoachScopeService` (`src/sub-coach/sub-coach-scope.service.ts`) — you may IMPORT/CALL it (read-only) but DO NOT edit it. DO NOT touch `ltv-metrics.*` (LTV unit owns it), `coach-effectiveness.*` (EFF unit owns it), `prisma/schema.prisma` (no migration), or any other module. `churn-intervention.service.ts` already has proven factor-label logic you may READ for reference (CC-3) but do NOT edit it.

## The issues (all in command-center.service.ts unless noted)
- **SC-1 (📊)**: `command-center.controller.ts:62` applies `NoActiveSubCoachGuard` at CLASS level — blocks sub-coaches from the ENTIRE Command Center (overview/at-risk/win-streaks/inbox/action-queue), not just financial surfaces. MOVE the guard from class-level to ONLY the financial/owner-only route handlers, so sub-coaches can access the non-financial surfaces. Identify which routes are financial (earnings/payouts/revenue) vs operational and guard only the financial ones.
- **SC-2 (📊)**: `command-center.service.ts` (lines 159,200,219,324,414,427,453,504,517) scope by `User.coach_id` (= head coach), so sub-coaches see head-coach data, not their assigned roster. Replace these roster scopings with `SubCoachScopeService`-resolved client ids (inject + import it via the command-center module you own). Head coach → full roster; sub-coach → assigned clients. Apply consistently at all listed sites.
- **CC-1 (📊)**: `:251,255` — `pending_actions: openAlerts` and `open_alerts: openAlerts` are the SAME variable → two KPI tiles show identical numbers. Compute `pending_actions` from the actual pending-action source (action-queue items) distinct from open alerts. If no separate source exists, define the correct semantic (read surrounding code) and compute it honestly.
- **CC-2 (📊)**: `:186-190,249` — `active_today` counts `ClientSignal` rows (PTM recalcs, streak updates), not real activity. Change to count `CheckIn` (actual client activity today) per the intended semantic.
- **CC-3 (📊)**: `:302-310` — `topFactorLabel()` returns hard-coded generic strings; never reads `PtmPrediction.factors`. Use the real factors (the logic is already proven in `churn-intervention.service.ts` — READ it, replicate/extract the approach into command-center without editing churn-intervention). Surface the actual top factor.
- **CC-4 (📊)**: `:425-448` — inbox built from `take: 1000` messages in-memory; threads past 1000 vanish though their unread still counts. Fix so the inbox/unread is consistent — either paginate properly or compute unread from a count query independent of the 1000-row in-memory slice, so the displayed threads and the unread count agree.
- **CC-5 (📊)**: `:242-245` — `check_in_rate_7day` is binary participation (any check-in in 7d / roster), so 10 clients × 1 check-in shows 100%. Change to an adherence-FREQUENCY measure (e.g. total check-ins over expected check-ins across the roster in 7d), per the intended KPI meaning. Document the formula you choose.

## Important
Read each site and its surrounding code carefully before editing — these are data-integrity correctness fixes, so the NEW computation must be demonstrably the intended semantic. Where the "correct" source is ambiguous, pick the most defensible interpretation and DOCUMENT it in a comment + the build report.

## Tests
Extend the command-center spec: SC-1 (sub-coach can hit operational routes, blocked only on financial); SC-2 (sub-coach roster scoping at the KPI computations — head vs sub differ); CC-1 (pending_actions ≠ open_alerts when sources differ); CC-2 (active_today counts check-ins not signals); CC-3 (top factor reflects PtmPrediction.factors); CC-4 (unread count agrees with displayed threads beyond 1000); CC-5 (rate is frequency, not binary). Keep existing tests green.

## Verify (run, report actual counts)
`npm ci` if needed. `npx tsc --noEmit` (0 errors); `npm run lint` (no NEW errors in touched files); `npx jest` on the command-center spec (counts); `npm run build` if quick.

## Deliverables
Push branch; open PR `Wave1 CC+SC: command-center data integrity + sub-coach scoping (CC-1..5, SC-1/2)` to main (gh, #). Build report `specs/WAVE1_CCSC_BUILD_REPORT.md` (per-issue what changed + chosen semantics for ambiguous ones, SubCoachScopeService wiring, test counts, final SHA), commit (R4) + push to docs main after rebase. Report final SHA, PR#, counts, and CONFIRM you only edited command-center.{service,controller}.ts (+ spec). Builder record — GPT-5.5 auditor re-checks at your SHA.
