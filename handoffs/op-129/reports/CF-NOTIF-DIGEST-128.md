# CF-NOTIF-DIGEST-128 (client fix, agent 129) - digest emails tell the truth; client daily digest off by default

Builder CF-NOTIF-DIGEST-128 (Claude Opus 5.5), operator agent 129. Started 16:09 PDT 10-07.
Source: FW-NOTIF-128 job NOTIF-DIGEST-128 (U6 + U8) + owner default "client DAILY digest email off by default, weekly kept".
Branch agent129/cf-notif-digest-128, worktree /home/user/workspace/wt/CF-NOTIF-DIGEST-128-backend, based on backend main fd190078.

## Status (16:33 PDT)
- PR growth-project-backend#864 open, head 7f9409d73c98c3a0319e995fa23518087bc9c676, 12 files +443/-89 (532 lines).
- Local targeted tests green: test/cf-notif-digest-128.spec.ts 9/9, workout-reminder.policy.spec.ts 18/18,
  workout-reminder.service.spec.ts 33/33. eslint --max-warnings 0 on the 5 changed src .ts files: clean.
- Left: CI green at head, READY comment, notify line.

## Scope traced
- Open backend PRs at start: b#857 (merged into main as fd190078 during this job) and b#855 (agent128/flip-pb-128:
  .github/fly-env-desired-state.json, docs/runbooks/launch-flags.md, test/roman/r11-seams.spec.ts). No overlap.
- src/notifications/digest.service.ts: client daily send, weekly send, client inbox row, _buildClientDigestData,
  _countWorkouts/_weightDelta (removed, replaced by windowed queries). Templates digest-client.hbs, digest-client-weekly.hbs.
- src/engagement/workout-reminder.policy.ts reminderCopy + workout-reminder.service.ts call site.
- New src/notifications/digest-stats.ts (pure helpers: window, streaks, weight unit/format).
- Env: EMAIL_DIGEST_CLIENT_DAILY_ENABLED registered in src/common/env-validation.ts ENV_RULES (optional, default off),
  .env.example, src/notifications/README.md. Not a managed flag, so .github/fly-env-desired-state.json untouched.

## B list
None.

## U list
- U6: digest window was 8 days ("8 / 7", 114%); "current streak" was the 7-day count and "personal best" the same number;
  weight always lbs; weekly change used the first two weigh-ins; every client digest wrote an inbox row
  "has been sent to <email>". Fixed in b#864.
- U8: first session day with no plan workout said "Everything is laid out". Now
  "Your first session is today. Start one from the Train tab when you are ready." (deep link tgp://workouts). Fixed in b#864.
- Owner default: client daily digest off unless EMAIL_DIGEST_CLIENT_DAILY_ENABLED=on; weekly kept; coach digests unchanged.

## C one-liners
- C (edge, deferred to 10k clients): digest days are UTC calendar days, not the client's local day.
- C (edge, deferred to 10k clients): coach digest still writes its "has been sent to" inbox row (coach scope, not this row).

## PRs
- growth-project-backend#864 @ 7f9409d73c98c3a0319e995fa23518087bc9c676, +443/-89, CI: build-and-test FAIL (2m9s, cause not read; stopped by operator 16:41), other checks pass/pending, verdicts none. No READY posted.

## Incident (repaired)
- 16:29 shared `git stash` mix-up with CF-ROMAN-COPY-B-128 (both stashed/popped at once; refs/stash is shared by all
  worktrees). Both worktrees restored at 16:30. Details: /home/user/workspace/ops/reports/STASH-MIXUP-129.md.

## Not fixed (needs operator)
- Client Settings "Weekly Summary" switch (mobile SettingsScreen.tsx:155 -> weekly_summary_enabled) is not read by the
  weekly digest (src/notifications/digest.service.ts _activeClientsWithEmailDigest). Owned by CF-SETTINGS-128 (U2). Smallest
  fix: mobile maps the switch to digest_email, or backend adds weekly_summary_enabled: true to the weekly client filter.
- Per-client daily digest opt-in does not exist (needs an additive column + a mobile row). Recommended default: leave the
  daily digest off for launch; revisit after launch.

## HANDOFF
- Branch agent129/cf-notif-digest-128, PR growth-project-backend#864, head 7f9409d73c98c3a0319e995fa23518087bc9c676 (pushed, nothing unpushed); worktree /home/user/workspace/wt/CF-NOTIF-DIGEST-128-backend.
- Done: U6 digest numbers/units/no client inbox row, U8 first-day no-plan copy, client daily digest off unless EMAIL_DIGEST_CLIENT_DAILY_ENABLED=on (weekly kept); 3 targeted spec files green locally, failing-first on main recorded in the PR body.
- Left: build-and-test failed at 7f9409d7 after 2m9s (likely a type/compile error in a file my targeted specs did not compile, or a suite that reads the changed digest templates; read the job log first); fix, push, wait for green, post the READY comment, update notify.
- Stopped by operator at 16:41 PDT (credits). Stash incident 16:29 repaired; see /home/user/workspace/ops/reports/STASH-MIXUP-129.md.
