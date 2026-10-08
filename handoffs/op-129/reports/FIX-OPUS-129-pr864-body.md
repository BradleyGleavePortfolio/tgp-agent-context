Tier: T2
Why: Changes what client emails and one push say and stops the client daily digest by default, inside the existing digest and reminder code.
T4 trigger scan: none (no money, auth, privilege, persisted-data shape or erasure change; no migration)
T3 trigger scan: none (no new module, no cross-domain contract; one new optional env var, not a managed flag)
Bounded T1: NO (runtime behaviour of a scheduled email changes)
Canonical builder: Claude Opus 5.5 (CF-NOTIF-DIGEST-128)
Parent owner: operator agent 129
Acceptance evidence: test/cf-notif-digest-128.spec.ts (9), test/engagement/workout-reminder.policy.spec.ts (18), test/engagement/workout-reminder.service.spec.ts (33), all green locally; failing-first on main shown below. FIX ROUND 1 (FIX-OPUS-129, fbf4d1a9): CI green, 15 of 16 checks (deploy-readiness-gate skipped). The tsc error at digest.service.ts:151 is fixed, and the privacy specs no-pii-in-logs (11) and no-pii-probe-replays (13) now set EMAIL_DIGEST_CLIENT_DAILY_ENABLED=on.
Promotion triggers: a per-client daily opt-in column, a mobile settings change, or flipping EMAIL_DIGEST_CLIENT_DAILY_ENABLED in production.

## What changes for coaches and clients
- Clients no longer get a summary email every morning. The client daily digest only goes out when `EMAIL_DIGEST_CLIENT_DAILY_ENABLED=on` (owner default: off). The Sunday weekly summary is kept. Coach digests are unchanged. `EMAIL_DIGEST_CLIENT_ENABLED=off` still stops every client digest.
- The weekly summary states true numbers: the seven complete days before the send day (never "8 / 7" or 114 %), a current streak of consecutive days, the longest streak on record (it was the 7-day count twice), workouts in the same seven days, and the weight change from the first to the last weigh-in of the week (it was the first two). The header reads "week ending" the last day counted.
- Weight is shown in the client's profile unit (kg or lbs). It was always lbs.
- No inbox row "Your weekly summary has been sent to <email>." after each client digest (the bell showed 1 for an email). Coach digest rows are unchanged.
- First session day with no plan workout on it: the reminder says "Your first session is today. Start one from the Train tab when you are ready." instead of "Everything is laid out", and opens the Train tab. With a plan workout the copy is unchanged.

## B / U list
- B: none.
- U6 (FW-NOTIF-128 NOTIF-DIGEST-128): wrong digest numbers, lbs only, client inbox row. Fixed.
- U8: first-day reminder promised a laid-out session that did not exist. Fixed.
- Owner default: client daily digest off by default, weekly kept. Done.
- C (edge, deferred to 10k clients): days are UTC calendar days, not the client's local day.

## Failing-first (main fd190078)
- test/cf-notif-digest-128.spec.ts: 5 of 9 fail on main (daily digest off by default; no inbox row; weekly 7 / 7, 100 %, workouts, streaks, change; kg; daily numbers). The 3 pure-helper tests cover new code.
- test/engagement/workout-reminder.policy.spec.ts: "C1 with no plan workout never says the session is laid out" fails on main.
- test/engagement/workout-reminder.service.spec.ts: "first session day with no plan workout gets the no-plan copy and the Train tab link" fails on main.

## Open-PR file check and diff size
Open PRs on the board at start: b#857 (merged during this job, now in main) and b#855 (`.github/fly-env-desired-state.json`, `docs/runbooks/launch-flags.md`, `test/roman/r11-seams.spec.ts`). No file overlap. Based on main, diff kept minimal: 12 files, +443 / -89. No migration, no new dependency, no lockfile change, no new casts.

agent 129

