FIX ROUND 1 (OPENING) (SESSION-REMINDER-COPY-131, agent 131) — growth-project-backend#875 @ 118ae6a2594f6c6482d07d3e6979586ea0fe3ba9 — READY FOR AUDIT

- B1 — seen in a test, `src/notifications/emitters/booking.emitter.ts:513`: saved 24-hour reminders now use the date-neutral title `Session reminder`; a client or coach opening the reminder on the session day is no longer shown the wrong day in its title. ([PR #875](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/875))
- B2 — seen in a test, `src/notifications/emitters/booking.emitter.ts:505`: missing-link client copy states the current status for both reminder intervals; a client is no longer promised a coach action that has not happened. ([PR #875](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/875))
- Proof: all 3 selected failing-first tests failed before the emitter change; after the fix, 23 emitter + 8 local-time integration + 21 scheduling delivery tests passed, each file run separately through `heavy.sh`. ([PR #875](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/875))
- Size: 47 changed lines, four files; only two production string literals changed, with the coach prompt, scheduling, tap routing and separate lock-screen copy untouched. ([PR #875](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/875))
- CI passed at this head; GitHub reports no merge conflicts, with the head verified immediately before posting. ([CI build-and-test](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37724544539/job/113139619320), [PR #875](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/875))

agent 131
