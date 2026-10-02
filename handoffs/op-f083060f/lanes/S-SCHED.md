# Lane S-SCHED (agent 110) — GPT-6.1 Sol builder: native scheduling (Calendar) for day 1

Read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md first. Builder: push only to your own new branches/PRs, never merge.
Spec (owner 10-01 10:37-10:44, binding): TGP's native scheduling replaces Google Calendar (Google Calendar/Meet/Zoom stay off).
- Client Calendar section: the client's coach(es), open slots, booking from each coach's approved appointment types.
- "Add to my calendar" writes to the device calendar (Apple/Google) with no account linking.
- Day-1 appointment types (seeded for the owner at C04, editable in the app): Quick initialization (welcome call) 15 min, confirms
  instantly; Quick Q/A Call 20 min, confirms instantly; Tele-Health Dietary/Fitness Check-in 45 min, coach approval.
- 24h and 1h reminders (BOOKING_REMINDERS_ENABLED explicit).
- Roman tutorial gets a Calendar step and ends with "Book your welcome call with <coach>" (tutorial is mobile #309, merged).
- The backend booking system already exists; client booking screens were orphaned. Every screen needs a real entry point.
Agent 108 left untested, unaudited WIP 10+ merges behind main: backend wip/op590e4a5b-s-sched-be-20261001 (da4e6608) and mobile
wip/op590e4a5b-s-sched-mob-20261001 (fa9959ab: Calendar screens, tutorial step, coach appointment types + time off, push-tap
routing, adds expo-calendar). Reuse what is sound; never merge the WIP as is. Open fresh PRs onto main (one backend, one mobile).
Adding expo-calendar changes package.json: update package.json/package-lock.json with `npm install --package-lock-only` (no
node_modules writes), mock the module in jest, add the iOS calendar usage string, and tell the operator so shared deps get it.
Grade honestly: mobile screens on existing contracts = T2; if you change booking state/concurrency semantics or cross-repo
contracts, re-grade to T3 and say so (the operator re-routes). Seeds are scripts for C04, never auto-run in production.
No vague errors; every empty/failed state has a next action. Report to /home/user/workspace/ops/reports/S-SCHED-110.md.
Final answer (<400 words): PRs + heads, tier headers, tests, CI, open risks, anything needing an owner decision.
