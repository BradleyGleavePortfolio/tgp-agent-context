# Lane B-UGC-2 (agent 110) — Claude Opus 5.5 builder: UGC + voice fix round 2 (#610 backend, #314 mobile; T4)

Read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md first, then /home/user/workspace/ops/reports/B-UGC-110.md, then every AUDIT
comment on backend #610 and mobile #314 (Sol BLOCK at 9e4b3795: A-610-1, A-610-2, B-610-1..4; Sol RC at 41d829d: B-314-2..5; the
AUD-OPUS-2 verdicts may land while you work — re-read comments before you finish and fold them in). Owner (20:32): "Voice notes
should be reportable and ON at launch" and (20:38) more functionality, not less: build, never cut or keep voice dark.
- A-610-1: voice storage keys must be server-generated or strictly validated (no `..`, no foreign prefix) after the SAME
  normalization the storage SDK applies; signed URLs only for the caller's own key / visible notes. Regression with the real SDK
  path normalizer.
- A-610-2: wins RLS: no world-readable legacy public wins (tenancy-scoped reads), authors cannot clear a moderator hide (column-level
  guard or trigger), migration in 20270211000000 (unmerged, edit in place).
- B-610-1..4 exactly as written in the verdict (block from wins surfaces without shared cohort; coach-scoped ban that survives cohort
  changes and covers wins + re-admission; banned/removed authors can still delete their own note; warn only marks actioned when a
  durable in-app warning is stored — add the durable inbox item, push is best-effort).
- B-314-2: register a real native recorder + playback adapter (use the Expo audio module already in the lockfile if present; if a new
  package is required, update package.json + lock with `npm install --package-lock-only` only and say so — the operator updates
  shared deps); permission prompts with honest copy; B-314-3 working recovery when the mail intent fails (copy address, in-app
  report path); B-314-4 contact/unblock reachable for wins-only / CommunityTab-OFF users; B-314-5 refresh the player handle on a new
  signed URL.
Merge main (backend now 7a6cfd82) first (no rebase). Tests that fail on the old code for each finding. Update PR bodies (fix-round
table); if a body edit is refused by a safety check, do not work around it — put the text in your report.
Report to /home/user/workspace/ops/reports/B-UGC-2-110.md. Final answer (<400 words): heads, findings closed, tests, CI, risks.
