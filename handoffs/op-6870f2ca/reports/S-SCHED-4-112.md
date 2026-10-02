# S-SCHED-4 (agent 112) — fix round on backend #634 and mobile #325

Never merged, dispatched workflows or touched production. Tiers unchanged (T4).

## Backend #634 — agent110/s-sched-lifecycle
- Head `d1661ab8` (pushed 12:4x PDT). Merge `b5e6e62d` = main `3bd6215b` (tree equals `git merge-tree 2a07ab25 3bd6215b`, no hand edit). No new env reads.
- B-634-2 (Sol residual) FIXED: band-independent recovery of unfinished rows (retry / expired-lease sending), re-verifies status, start revision, recipient; only unfinished channels and recipients; retires never-sendable work as gave_up `retired:<reason>` keeping receipts; 24h retired once 1h band reached; taken-over claims fenced by cancel are closed, not deleted. Index NotificationDeliveryLog(kind, status) in the same unapplied migration 20270222000000 + schema.prisma + down.sql.
- Follow-up done: seed creates Quick initialization with is_welcome unless an active welcome type exists.
- Pre-deploy checks: both zero-row SQL queries are in the PR body under "Pre-deploy checks".
- Tests (heavy.sh): `env CI=false npx jest --runInBand --forceExit --runTestsByPath test/scheduling-lifecycle-integrity.spec.ts test/booking-reminder.job.spec.ts test/scheduling-reminder-delivery.spec.ts test/seed-coach-session-types.spec.ts test/booking-emitter.spec.ts` -> 5 suites / 131 pass. Failing-before: 8/8 new reminder cases fail on 2a07ab25 job; new seed case fails on old seed. eslint 0. Local tsc skipped (operator OFFLOAD TO CI).
- CI at d1661ab8: see final section.
- CI at d1661ab8: all checks PASS (build-and-test, rls-floor-guard, rls-live-tests, mwb-3-live-tests, npm audit, CodeQL, Banned cast tokens, build-sbom, danger, Schema parity, Forward migrations, Reversibility, shellcheck).

## Mobile #325 — agent110/s-sched-mobile
- Head `36f05bb`. Merge `ae55530` = main `2c17c241` (#310); one conflict in eas.json clinic env, resolved keeping both sides (CLIENT_CALENDAR + CONSULTATION_ONBOARDING + COMMUNITY_DM=false). No package.json change this round (expo-calendar pre-existing on branch, mocked in jest).
- B-325-2 (Sol) FIXED: coach intent-aware copy; Confirm on an expired request -> "time passed ... Tap Decline"; generic coach SESSION_STARTED -> "Refresh the inbox" (no complete/no-show suggestion). Mounted-inbox semantic test with backend's real 409 body.
- B-325-3 (Opus+Sol) FIXED: SUPPORT_EMAIL = Bradleyapple1031@gmail.com; #310 consultation copy re-exports it (one constant); test pins ruled literal + scans scheduling/deletion sources.
- #310 alignment: consultation finish -> startClientTutorial(result) -> Calendar step after coach_messages, ends "Book your welcome call with <coach>" -> CalendarBook {welcome:true}; guard test added.
- Follow-up done: unreachable ClientBookingRequest route + screen removed (test).
- Tests (heavy.sh, env CI=true jest --runInBand): 7 suites / 82 pass + neighbours 4 / 139 pass; failing-before 8 fail in 4 suites. eslint 0. Local tsc skipped (OFFLOAD TO CI).

## Risks / decisions
- SupportInboxScreen + CreateAccountScreen still use hello@thegrowthproject.app on main (owned by #327 / S-ERRORS). Whichever of #325/#327 lands second re-exports the other module (values agree now).
- Recovery read is bounded at 200 unfinished rows/tick (oldest first); index (kind,status) added to the unapplied migration.
- Expired requests disappear from the coach inbox after end_at (upcoming = end_at > now) and stay `requested`; an auto-expiry job is a possible follow-up.
- Reminder retry can still double-push if a worker dies after push and before settle (lease expiry, max 3 attempts) — unchanged from S-SCHED-3.
- Device QA for native expo-calendar build remains a release prerequisite.

## Cleanup
- Worktrees wt/s-sched4-be and wt/s-sched4-mob removed at the end.
- Mobile CI at 36f05bb: Typecheck/lint/test, Analyze (js-ts), Analyze (actions), CodeQL PASS.

## S-SCHED-5 round (13:18 priority interrupt) — new #634 head
- Backend #634 pushed: **4d987916da6e07aada029560fdf6645d77bd2909** on agent110/s-sched-lifecycle (from d1661ab8; main f04289f9 not merged, PR was MERGEABLE; migration 20270222000000 unchanged). Mobile #325 untouched at 36f05bba.
- Findings closed in 4d987916: B-634-2a (catch-up pass for first claims that were never written, bounded to 30 min below the band, late bookings excluded), B-634-2b (moved-later rows parked by compare-and-set, out of the recovery page, then re-armed in the band), B-634-6 (safeDiagnostic in every reminder log path, `recovery_failed` reported, sweep and recipient failures caught), C-634-5 (seed welcome marker: reported in the dry run, set on apply).
- Sol's 3 probes are now regression tests (`S-SCHED-5 B-634-2 / B-634-6` in test/scheduling-lifecycle-integrity.spec.ts). 7 of 8 fail before the fix; the 8th is the late-booking guard (ops/s-sched5-112/failing_before.log). Targeted jest: 139/139 pass. eslint and prettier are clean.
- One deliberate behaviour change: the S-SCHED-4 test now expects the moved-later row `x-later` to be `parked`, not left as `retry`.
- CI at 4d987916: 19 pass, 1 skipping (deploy-readiness-gate). PR body has the S-SCHED-5 fix-round table; fix-round comment is 5961064570.

## HANDOFF FOR AGENT 113
- **Backend #634** `agent110/s-sched-lifecycle` @ `4d987916da6e07aada029560fdf6645d77bd2909`. MERGEABLE, CI green (19 pass, 1 skipping). Sol's B-634-2, B-634-6 and C-634-5 are closed; no findings are known to be open. Next step: send it for Sol and Opus re-audit. Before deploying, the operator runs both read-only pre-deploy queries and needs zero rows from each.
- **Mobile #325** @ `36f05bba`. Dual-APPROVED and not touched. Next step: merge decision (operator).
- **NOT STARTED:** auto-expiry of unanswered past booking requests (v1.0 follow-up PR, to start only after #634 and #325 are approved).
- **S-DUNNING-R4:** stopped and partly done. See ops/reports/S-DUNNING-R4-112.md (WIP branches `wip/s-dunning-r4-backend` @ c8a1c95b and `wip/s-dunning-r4-mobile` @ 0b4813dc, which has no changes).
- **WIP branches from this lane:** none (everything is pushed to #634).
- **Worktrees:** wt/s-sched5-be, wt/sdr4-be and wt/sdr4-mob are removed; /home/user/workspace/deps is untouched.
