# CF-SHARE-GATE-128 — the four Coach sharing switches gate every coach read (builder, agent 129, Claude Opus 5.5, T4 privacy)
Status: STOPPED by operator 16:35 PDT 10-07 (code and tests complete, branch pushed, no PR). Source: FW-COACH-128 U2 / job FWC-SHARE-GATE-128 (CLIENTFIX-128 row CF-SHARE-GATE-128).
Branch agent129/cf-share-gate-128 @ dc75b0e51f2d3d326a8987835325fd621c04f3d5 (pushed: yes; 501 changed lines vs c3324d4a), worktree /home/user/workspace/wt/CF-SHARE-GATE-128-backend, base backend main c3324d4a.
No PR (operator stop 16:35: no new PR).

## Open PRs checked for file overlap (16:09 PDT board)
- b#857 agent128/money-mail-128: dunning/email/trials/storefront + test/email-reply-to.spec.ts — no overlap.
- b#855 agent128/flip-pb-128: fly-env-desired-state.json, docs/runbooks/launch-flags.md, test/roman/r11-seams.spec.ts — no overlap.
- Job files unchanged between the audited main 0d179edb and c3324d4a (line refs hold).

## Scope traced (rule applied per read; owner account keeps its bypass)
| Coach read (route) | Switch | Before | After |
|---|---|---|---|
| GET /coach/clients/:id/check-ins (check-ins.service.ts listForClientByCoach) | Check-ins and habits | full rows (mood, energy, sleep, notes) always | [] when not shared (same as the timeline slice) |
| GET /coach/dashboard (coach.service.ts getDashboard) | Food logs | food totals for every client | only food-sharing clients; rate over them |
| GET /coach/alerts (getAlerts) | Weigh-ins / Workouts | weight + missed-workout alerts for every client | weight alert only with Weigh-ins; missed-workout only with Workouts |
| GET /coach/dashboard/summary (getDashboardSummary) | all four | every count/flag for every client | active_today/off_macros: Food; missed_workout: Workouts; weight_flag: Weigh-ins; pending_checkins/no_checkin: Check-ins |
| GET /coach/command-center/overview (live "Overview" tab) | Check-ins / all four | check-in tiles, streak count, at-risk count, alerts for every client | check-in tiles + streak count: Check-ins; at-risk count: all four; alerts per type |
| GET /coach/command-center/at-risk | all four (score reads all four logs) | every client | only clients sharing all four |
| GET /coach/command-center/win-streaks | Check-ins / Workouts | every client | check-in streaks: Check-ins; workout streaks: Workouts |
| GET /coach/command-center/action-queue | per alert type | every alert | consecutive_misses/streak_dropped: Check-ins; risk_red_transition: all four; finance/bloodwork unchanged |
| GET /coach/clients/risk-board (Clients list pill) | all four | every client | only clients sharing all four |
Command center consent is checked against ownerCoachId (head coach = caller; sub-coach reads under the head coach's grant, as alerts/messages already do). The owner role has no command-center roster (SubCoachScopeService.getAuthorizedClientIds is coach-only), so no owner path there.

## Files changed (commit dc75b0e5)
src/consent/consent.service.ts (COACH_FITNESS_SCOPES + grantedScopesByClient batch helper), src/check-ins/check-ins.service.ts,
src/check-ins/coach-check-ins.controller.ts, src/coach/coach.service.ts (getDashboard, getAlerts, getDashboardSummary, sharedClientIds,
riskBoardClientIds; rosterFitnessConsents untouched), src/coach/coach.controller.ts (risk-board passes clientIds),
src/coach/command-center/command-center.service.ts. ConsentService injected WITHOUT @Optional (DI-required; module-graph spec compiles AppModule).

## Left to do
1. test/coach-sharing-coach-reads.spec.ts (failing-first per surface) + adjust test/coach-ptm-risk-board.spec.ts (exact-args assertion now includes clientIds).
2. Run targeted tests via heavy.sh; commit LEFTHOOK=0 with owner identity; push; open PR; CI green; READY comment; notify line.

## B list
(none proven as B yet; FW-COACH-128 graded this U2, T4 privacy)

## C one-liners
- C (edge, deferred to 10k clients): CheckIn.weight_kg rides inside a shared check-in even with Weigh-ins off; the app never sends weight_kg (checkInPayload.ts).
- C (edge, deferred to 10k clients): POST /coach/clients/:id/check-ins/:id/reviewed returns the full row; needs a check-in id the coach can no longer list.

## Not fixed (needs operator)
- coach-home daily rings (src/coach/home/coach-home.service.ts:190-195) count today's check-ins for the roster regardless of the switch; route only used by the retired CoachHomeScreen. Smallest fix: count only habits-sharing clients.
- v1 roster GET /v1/coach/me/clients (src/v1/v1-coach.service.ts:144-155) last check-in / workout dates ungated; web console only, mobile never calls it. Smallest fix: rosterFitnessConsents-style filter.
- churn-at-risk (command-center.controller.ts:237, ChurnInterventionService) not called by mobile; same all-four rule if it ships.

## PRs
- none (operator stop). Branch head dc75b0e51f2d3d326a8987835325fd621c04f3d5, 501 lines, CI not run, verdicts none.

## HANDOFF
- Branch agent129/cf-share-gate-128, head dc75b0e51f2d3d326a8987835325fd621c04f3d5 (pushed: yes), based on main c3324d4a, 501 changed lines, one commit (Bradley Gleave identity, LEFTHOOK=0, no AI co-author).
- Done: all 9 coach reads in the Scope table gated (owner bypass kept, ConsentService DI-required). New test/coach-sharing-coach-reads.spec.ts passes 10/10 here and fails 10/10 on main fd190078 (behaviour, not types). Existing coach-ptm-risk-board (11), command-center.service (24), check-ins.service (20), coach.service (8) and coach-roster-activity (4) specs pass locally.
- Left: git merge origin/main (fd190078 touches none of these files); open the PR (title = commit subject; T4 tier header, the Scope table, "based on main, minimal diff, no open PR touches these files"); CI; READY `FIX ROUND 1 (OPENING) (CF-SHARE-GATE-128, agent 129) — growth-project-backend#<n> @ <sha> — READY FOR AUDIT`.
- Needs operator: the three "Not fixed" reads above (coach-home rings, v1 roster dates, churn-at-risk).
