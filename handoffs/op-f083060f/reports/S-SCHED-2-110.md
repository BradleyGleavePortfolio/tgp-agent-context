# S-SCHED-2 — agent 110 (Claude Opus 5.5 builder): scheduling backend lifecycle

## 2026-10-01 22:40 PDT start checkpoint
- Read common brief (owner facts 20:38), lane objective, S-SCHED spec + S-SCHED report, AGENT_RULES, LIVE_STATE.
- Backend worktree `/home/user/workspace/wt/s-sched2-be`, new branch `agent110/s-sched-lifecycle` from main `4bcfb444`.
- Mobile worktree `/home/user/workspace/wt/s-sched2-mob` on #325 branch `agent110/s-sched-mobile` (head `bc1398c2`). I am now #325's builder.
- Grade: **T4** (changes who can read scheduling data: types/availability/open slots/sessions become assignment-gated; client reads drop coach-only notes; sub-coach booking). T3 parts: concurrency/state authority, cross-repo contracts, persistent schema (migration 20270212000000), shared notification primitive, CI live-test list (ci.yml one line = T4 trigger).
- Base: main (not stacked on #632). #632 touches only the reminder env switch lines + seed; this PR does not touch those lines. Follow-up after both land: #632 seed should set `is_welcome: true` on "Quick initialization" (coach can also set it in-app).

## 22:45 operator correction applied
- Migration renamed to `prisma/migrations/20270222000000_scheduling_lifecycle_integrity` (20270212000000 now #607, 20270213000000 #609). Base stays main (not stacked on #632 or #607).

## 23:10 backend build checkpoint (uncommitted, worktree s-sched2-be)
- Code: access service (assignment-gated reads/books), open-slots by session_type_id, authoritative lifecycle (advisory lock per coach + in-tx re-validation + exclusion-constraint floor), SessionView (client-safe fields, meeting_link_status, cancellable/reschedulable), my-coaches, scope=past, welcome marker + per-type default link, emitter rewritten (one in-app row + real push, tap routing), reminders incl. pending_provider + link-missing wording.
- Tests (heavy.sh jest --runInBand): scheduling-lifecycle-integrity, booking-emitter, scheduling-reminder-delivery, slot-computer-bookable, booking-reminder.job -> 5 suites / 92 tests pass; live spec skipped locally (no Postgres; runs in mwb-3-live-tests).
- ci.yml: one additive line (live spec into mwb-3 list) = T4 trigger.

## 23:14 backend PR opened
- PR #634 `agent110/s-sched-lifecycle` head `7284e079` onto main `7a6cfd82` (rebased; not stacked). Tier T4.
- Local: 22 targeted suites pass (5 new/rewritten + 17 neighbours, 328 + 92 + 60 tests across runs); live spec skips locally (no Postgres), runs in mwb-3-live-tests. tsc exit 0; eslint/prettier clean; check-r75 OK (as any -1, as unknown as -2, as never -1).
- merge-tree clean vs #632 0ae744b6, #607 e8feb0d2, #609 5fd61a1b (ci.yml line placed away from #607's insertion).
- Added my-coaches welcome.completed_at (persistent welcome-done signal).
- PR body: /home/user/workspace/ops/reports/S-SCHED-2-110-backend-pr-body.md
- Next: mobile #325 commits while CI runs.

## 23:30 checkpoint — backend CI + mobile build
- Backend #634 head 7284e079 CI: every required check green (build-and-test, rls-floor-guard, rls-live-tests, mwb-3-live-tests, npm audit, CodeQL, Banned cast tokens, build-sbom, danger, Schema parity, Forward migrations / reversible = migration-dry-run). `test/scheduling-booking-concurrency.live.spec.ts` ran for the first time in mwb-3-live-tests: PASS (lane total 60/60, none skipped).
- `shellcheck (scripts/*.sh)` fails on SC2015 in scripts/s10-core-diff-gate.sh only, which is pre-existing and outside my diff (brief: ignore).
- Mobile #325 (agent110/s-sched-mobile): client contracts are wired: my-coaches + welcome marker, session_type_id on open slots, include_archived, scope=past + before cursor, reschedulable/meeting_link_status. All 19 backend codes map to next-step copy. Live notification rows are normalised, and center taps use the role-aware push table. Coach types screen has the welcome toggle, default call link, and server-backed archive/restore. The coach agenda shows link status and client name.
- Found: legacy `ClientBookingRequest` route (pre-existing, no navigate callers, not in the push table) sends no session_type_id and would now get SESSION_TYPE_REQUIRED. It is unreachable; recommend deleting it in a follow-up. Not changed here.
- mobile tsc (shared deps): the only errors are the 2 pre-existing `expo-calendar/legacy` module-not-found errors (shared deps lack expo-calendar, which the branch's package.json from the prior builder adds; CI installs it).
