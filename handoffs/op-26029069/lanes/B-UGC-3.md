# Lane B-UGC-3 (agent 111) — Claude Opus 5.5 builder: community safety #610 (CI red) + mobile #314 (T4, App Review 1.2)

Read first: /home/user/workspace/ops/AGENT_BRIEF_COMMON.md; /home/user/workspace/ops/lanes110/B-UGC-2.md +
/home/user/workspace/ops/reports/B-UGC-2-110.md + B-UGC-110.md; /home/user/workspace/ops/reports/AUD-OPUS-2-110.md (the Opus
#610 BLOCK and the DRAFTED-NOT-POSTED Opus #314 findings B-314-2..6, C-314-4 — the draft file itself is lost; use the summary);
every AUDIT comment on backend #610 and mobile #314. Owner: "Voice notes should be reportable and ON at launch" (needs report
target, report action, moderation-queue handling, block parity, working native record + playback, erasure on delete/ban/account
deletion). Blocking hides content both ways. No generic errors; truthful copy.
1. backend #610 @ 304613e4: CI is RED on the new community-live-tests job (C-610-4): test/community/events/community-events.e2e
   .spec.ts fails with PrismaClientKnownRequestError on every case (run 36975979563). Find the real root cause (schema/migrations
   applied to the job's DB, missing fixtures/seed, env, or a genuine code defect) and fix it truthfully. Never weaken, skip or
   delete suites to get green; if a pre-existing suite was silently never run before and is wrong, fix the suite with evidence.
   Merge main e5a6044a first (merge commit, no rebase; register any new env names per #624). Keep migration 20270211000000.
2. mobile #314 @ 41d829d7 fix round: every Sol finding on #314 plus Opus B-314-2 (no recorder/playback adapter and no native audio
   module: voice cannot record or play, even in the coach queue -> wire a real native recorder + player), B-314-3 (rejected mailto
   on the safety email unhandled), B-314-4 (CommunitySafety reachable only in the flag-gated tab while wins are live in More),
   B-314-5 (refreshed signed URL never loaded), B-314-6 ("Warning sent." while backend only best-effort pushes -> truthful copy),
   C-314-4 (community.dm.blocked mapped but no longer emitted). If a native audio dependency is needed: check what main already
   ships first (expo-audio / expo-av); if none, add the Expo SDK 56-compatible package to package.json + package-lock.json only via
   `/home/user/workspace/ops/heavy.sh npm install --package-lock-only --ignore-scripts --legacy-peer-deps <pkg>@<ver>` in your
   worktree (never install node_modules; mock it in jest), and tell the operator in your report immediately (heading "DEP CHANGE").
   Merge main e3986e89 first (merge commit).
Tests via heavy.sh (targeted jest --runInBand; tsc once per round). Update PR bodies (fix-round tables). Never merge, dispatch
workflows or touch production. Report: /home/user/workspace/ops/reports/B-UGC-3-111.md. Final answer (<400 words).
