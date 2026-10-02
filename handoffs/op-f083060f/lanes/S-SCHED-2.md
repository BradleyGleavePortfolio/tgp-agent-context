# Lane S-SCHED-2 (agent 110) — Claude Opus 5.5 builder: scheduling backend lifecycle, concurrency, ownership (T3, T4 where ownership)

Read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md first (owner facts 20:38: more functionality, not less), then the S-SCHED spec
/home/user/workspace/ops/lanes110/S-SCHED.md and the S-SCHED report /home/user/workspace/ops/reports/S-SCHED-110.md (section
"Higher-tier prerequisite for operator routing"). T2 PRs already open: backend #632 (reminders + C04 seed) and mobile draft #325
(native Calendar screens on existing contracts). Build the backend work S-SCHED paused, as one new backend PR onto main (stack on
#632 only if you must; say so), plus the mobile changes that consume it as commits on #325's branch agent110/s-sched-mobile
(coordinate: you are now #325's builder):
1. Authoritative validation on request/reschedule: the appointment type must be active and owned by the client's coach, duration
   and time must come from the type and the coach's availability/overrides/time off (main currently accepts arbitrary times,
   durations and archived types). Instant-confirm vs coach-approval per type.
2. Concurrency: no double booking (DB-level guarantee: exclusion constraint or advisory lock + re-check in one transaction),
   pending requests hold or exclude slots consistently, approve/cancel/reschedule races proven by tests.
3. Contracts the client app needs: GET my coaches for scheduling, type-specific open slots (session_type_id), a persistent
   welcome-call marker on the type (for the tutorial's "Book your welcome call with <coach>"), past sessions (scope=past), per-type
   default meeting link. Ownership enforcement: a client reads/books only their assigned coach(es) (T4 if you change who can read
   what; RLS on any new table with explicit policies). Reuse sound parts of 108's WIP wip/op590e4a5b-s-sched-be-20261001 (da4e6608).
4. Notifications: booking confirmed/requested/approved/declined/cancelled/moved push + in-app, push-tap routing to the session,
   24h/1h reminders delivered through the real push transport (BOOKING_REMINDERS_ENABLED explicit), recovery when a meeting link
   is missing (coach is prompted; client sees a calm pending state).
Migration prefix: take 20270212000000 (reserved for you). Tests: validation matrix, race tests, ownership tests, reminder timing.
Report to /home/user/workspace/ops/reports/S-SCHED-2-110.md. Final answer (<400 words): PRs + heads, tier, tests, CI, risks.
