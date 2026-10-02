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

## 23:45 — #632 merge-train resolution (operator mail 23:31)
- I merged main e5a6044a (#624 S-ENVTRUTH) into agent110/s-sched-backend without rebasing. The new head is **b859a1c6** (parents 0ae744b6 + e5a6044a), pushed fast-forward.
- The only conflict was prod-switches.yml, BOOKING_REMINDERS_ENABLED. I kept #624's owner `scheduling` and its launch-switch classification, and #632's explicit-on semantics. I also updated the auto-merged ENV_RULES entry so it states the real code default: `off (only "on" enables; unset/off/other disable)`. Its reason says it must be set to on at launch through the audited manifest. No test changed. env-registration's `launch === 'switch'` assertion still holds.
- Local checks via heavy.sh: `npx jest --runInBand --forceExit --runTestsByPath` across 11 suites (booking-reminder.job, seed-coach-session-types, env-validation, env-registration, env-discovery, registry-loader, operator-keys-artifact, fly-env-classifier, deploy-readiness, ci/fly-env-sync-behavior, ci/fly-env-workflows): 486 passed, 1 skipped. The skip is the pre-existing conditional strict deploy-readiness gate. `tsc --noEmit` exit 0. Prettier is clean on my hunk; the rest of env-validation.ts has pre-existing drift from main.
- I added a Fix round row and an operator-decision note to the #632 body.
- **Semantic conflict for the operator to decide:** #624 records "ships on; only off disables" (operator 2026-10-01). #632, Sol-approved and the lane's "explicit" mandate, makes unset mean off. As a result, deploying #632 or #634 turns reminders off unless the switch is set. Recommended default: set `BOOKING_REMINDERS_ENABLED=on` through the B-FLAGS manifest in the same deploy window.
- #634 also merged main (local 9a1f44bb) with byte-identical resolution lines, so either merge order stays clean. Verification is running before the push.

## 23:58 — pushes
- **#632** head b859a1c6: required CI all PASS (build-and-test, rls-floor-guard, rls-live-tests, mwb-3-live-tests, npm audit, CodeQL, Banned cast tokens, build-sbom, danger, Schema parity). shellcheck fails only on the pre-existing SC2015 in s10-core-diff-gate.sh. No migrations in #632, so the migration jobs do not apply. It is ready for the merge train.
- **#634** head **dbc10b7b**: two commits since the last entry.
  - 9a1f44bb merges main with the same resolution as #632. Local verify via heavy.sh: 13 suites, 495 passed, 1 skipped (pre-existing), tsc 0.
  - dbc10b7b gives open-slot INVALID_TIME plain next-step copy. The integrity spec passes 48/48, tsc 0, eslint 0, check-r75 OK (net: as any −1, as unknown as −2, as never −1).
  - CI is running.
- **Mobile #325** head **b0c02156** (one commit on top of bc1398c2, no rebase). CI all PASS: Typecheck/lint/test (full suite), Analyze js-ts, Analyze actions, CodeQL. Title and body are updated to T4 and say it depends on #634.
  - Local: 8 suites / 145 tests and 6 neighbour suites / 63 tests passed, with `--runInBand --forceExit`.
  - eslint: 0 errors, 1 pre-existing warning.
  - tsc: only the 2 pre-existing expo-calendar module errors.
  - merge-tree against mobile main e3986e8 is clean.
  - package.json/lock is unchanged by me; the expo-calendar addition came from the prior builder.

## 00:10 — done
- #634 head dbc10b7b: every required check PASS (build-and-test, rls-floor-guard, rls-live-tests, mwb-3-live-tests, npm audit, CodeQL, Banned cast tokens, build-sbom, danger, Schema parity, Forward migrations + reversible). shellcheck fails only on the pre-existing SC2015.
- merge-tree of #634 against #632 b859a1c6, #607 e8feb0d2 and #609 5fd61a1b: all clean.
- Worktrees s-sched2-be, s-sched2-632 and s-sched2-mob are removed.
- Operator/owner decisions, with recommended defaults:
  1. BOOKING_REMINDERS_ENABLED: set `on` through the B-FLAGS manifest in the #632/#634 deploy window. Unset now means off, which contradicts #624's "ships on" note.
  2. Run the #634 overlap preflight query (in the PR body) before the migration deploys.
  3. #632's seed sets is_welcome on "Quick initialization" once #634 lands. Until then the mobile app falls back to the seed name.
  4. Delete the unreachable legacy ClientBookingRequest route in a follow-up.
