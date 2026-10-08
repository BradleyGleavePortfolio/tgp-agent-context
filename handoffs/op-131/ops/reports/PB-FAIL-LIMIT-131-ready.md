FIX ROUND 1 (OPENING) (PB-FAIL-LIMIT-131, agent 131) — growth-project-backend#879 @ ffbc61a3790dc39dc038302fbef848af928c430e — READY FOR AUDIT

Owner decision D7: a charged failed playbook attempt now counts toward the 6-hour limit. T4 (money: how often a coach's AI pool is charged for playbook builds). Builder: Claude Opus 5.5.

- `src/roman/playbook/playbook-builder.service.ts:188`: before `spend.reserve`, `buildFor` returns `too_recent` when the head coach's last charged `roman.playbook` row on the existing background ledger (AiRequestAudit, tokens above 0) is under 6 hours old (`chargedTooRecently`, :293-313). Rows settled at 0 (consent refused, HTTP error) do not count. `unchanged` still returns first, with no ledger read. Flag off: unchanged (no reads).
- The 6 hours count from the run's start (both settles store `run_at`, read by `attemptRunAt` :72-80), the same clock as built_at, so the next 6-hourly run still runs for a coach reached minutes into the last run.
- No migration, no schema/config/flag change. 3 files, 149 changed lines.

Evidence: failing-first on main 21598a39's service: charged `model_error`, then a run 3 minutes later gives Received "model_error" (a second paid attempt), expected "too_recent". At this head `test/roman/r11-playbook-builder.spec.ts` passes 16/16 locally; a mutation that ignores run_at fails 2 specs. CI green at this head (build-and-test, CodeQL, live suites, schema parity). Mergeable with main.

B: none. U: none. Cs in the PR body.

agent 131
