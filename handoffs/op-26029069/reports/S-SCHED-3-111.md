# S-SCHED-3 (agent 111) — one-pass fix round on backend #634 and mobile #325

Never merged, dispatched workflows or touched production. Tiers unchanged (both T4). Migration id unchanged (20270222000000). package.json unchanged.

## Backend #634 — agent110/s-sched-lifecycle
- Head `2a07ab25`. Merges (merge commits): `77314ec7` = main b9ee8e0a; `2a07ab25` = main 97467678 (#632 landed during the round; merged cleanly).
- Commits: `a3fd0509` (transition fencing, provisioning fencing, compound cursor + status filter, welcome restore), `b89c83e2` (reminder claims, migration C-634-1/2 + NDL columns), `cb3753d6` (tests).
- Dispositions:
  - B-634-1 fixed: CAS on (status, start_at, end_at) + start boundary; SESSION_MOVED; optional expected_start_at on approve/decline/cancel/no-show; notices from committed row.
  - B-634-2 fixed: lease + claim token, P2002-only duplicate, per-channel settle (retry resends only the failed channel; push links first in-app row), expired-lease takeover, session_start_at revision, fence re-read + claim release, suppression settled, gave_up after 3.
  - B-634-3 fixed: fenced write-back; newer manual link kept; cancel/move wins; obsolete confirmation skipped; superseded event/meeting cancelled + audited (superseded_revision); cancel cleans provider artifacts.
  - B-634-4 fixed: keyset (start_at, id), before_id/after_id.
  - B-634-5 fixed: restore as regular type when another welcome is active; live test against the real index.
  - C-634-1 fixed (ownership comment + marker-checked drop); C-634-2 fixed (range preflight); C-634-3 fixed (status filter + upcoming cursor, INVALID_LIST_QUERY); C-634-4 disclosed on mobile (warning), hold-original = owner follow-up.
- Tests (heavy.sh): `env CI=false npx jest --runInBand --forceExit --runTestsByPath test/scheduling-lifecycle-integrity.spec.ts test/booking-reminder.job.spec.ts test/scheduling-reminder-delivery.spec.ts test/booking-emitter.spec.ts test/scheduling.service.spec.ts test/availability-overrides.spec.ts test/entitlement-guards-mounted.spec.ts test/roles-enforced.spec.ts test/slot-computer-bookable.spec.ts` -> 9 suites / 158 pass. After #632 merge: integrity + booking-reminder.job + seed-coach-session-types -> 3 / 90 pass.
- Failing-before: 22 new cases on dbc10b7b sources (src+prisma stashed, ts-jest diagnostics off) -> 19 fail, 3 guards pass. Log /tmp/sched3_failing_before.log.
- tsc (3584 MB) exit 0; eslint exit 0; check-r75 OK; prettier clean except pre-existing drift in test/booking-reminder.job.spec.ts (left to avoid #632 hunks).
- CI at 2a07ab25: build-and-test, mwb-3-live-tests (new live cases), forward migrations, reversibility, schema parity PASS; shellcheck FAIL also fails on main (SC2015 in existing scripts; no shell change here).

## Mobile #325 — agent110/s-sched-mobile
- Head `13b8a8f` (main e3986e89 merged as `d0873d3`; main unchanged since). Commits: `be539b1` (source), `ce2c837` (app.json), `6adc164` (tests), `13b8a8f` (test type narrowing for real expo-calendar types after CI typecheck).
- Dispositions: B-325-1 fixed (tel end to end incl. Call action, dialer refusal message, phone-calendar note/URL, coach entry); B-325-2 fixed (audience param + coach table, all four coach screens); pair fixed (expected_start_at on approve/decline/coach cancel; before_id); C-325-1..6 fixed.
- CI at 13b8a8f: Typecheck, lint, test PASS; Analyze (js-ts, actions) and CodeQL PASS. (6adc164 failed typecheck on phoneCalendar.test.ts because the real expo-calendar types allow an undefined call arg; fixed in 13b8a8f.)
- Tests (heavy.sh, `env CI=true npx jest --runInBand --forceExit ...`): 11 suites / 157 pass; neighbours 17 / 156 and 87 pass; failing-before 48 fail on pre-fix sources. tsc: only 2 pre-existing expo-calendar errors locally; eslint 0/0.

## Risks
- Reminder retries can send a second push if a worker dies after the push but before settling (lease expiry, at most 3 attempts); in-app rows are not duplicated once recorded.
- Transition start boundary uses the app clock in the UPDATE, not DB now().
- Prisma client regenerated in the worktree only.

## Operator decisions (recommended defaults)
1. BOOKING_REMINDERS_ENABLED=on via the prod-switch manifest after device QA (default: set it in the same deploy window as #634).
2. Run both preflight queries (overlap + inverted range) before deploying the migration (default: required, zero rows).
3. C-634-4 hold the original time while a moved approval-type session awaits approval (default: ship the warning now, product follow-up).
4. Canonical support address: SupportInboxScreen uses hello@thegrowthproject.app vs Bradley@Bradleytgpcoaching.com elsewhere (default: keep the calendar address; owner to confirm).

## Cleanup
- Worktrees wt/s-sched3-be and wt/s-sched3-mob removed (`git worktree remove --force`). PR bodies updated on both PRs (tier header kept T4; S-SCHED-3 fix-round tables added).
