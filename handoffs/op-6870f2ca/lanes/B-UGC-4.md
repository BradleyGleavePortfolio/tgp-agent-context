# Lane B-UGC-4 (agent 112) — Claude Opus 5.5 builder: community safety (backend #610 + mobile #314; T4, App Review 1.2)

Read first: /home/user/workspace/ops/AGENT_BRIEF_COMMON.md; /home/user/workspace/ops/lanes111/B-UGC-3.md and
/home/user/workspace/ops/reports/B-UGC-3-111.md (+ B-UGC-2-110.md, B-UGC-110.md if present); EVERY AUDIT comment on backend #610
(Sol BLOCK 1/3/0 and Opus REQUEST CHANGES at c710b0dc) and mobile #314 (Sol + Opus REQUEST CHANGES at 4192ba9d).
Owner decisions: community guidelines (rules incl. 5 and 7) + 24-hour moderation commitment approved 10-01 09:07; safety contact =
SUPPORT_EMAIL (OR-109-1); "Voice notes should be reportable and ON at launch" (10-01 20:32: report target, report action,
moderation-queue handling, block parity, working native record + playback, erasure on delete/ban/account deletion); blocking hides
content both ways (13:00 messaging plan: block both ways + report); no generic errors; truthful copy (never claim a warning/push
was delivered when it was best-effort).
Do (one pass, no ping-pong; each finding closed with a failing-before test):
1. #610 @ c710b0dc: close every A/B from both lenses and cheap Cs; merge backend main 3bd6215b (merge commit; register env names per
   #624); migration stays 20270211000000 (sorts before main's latest — confirm the migration set still applies cleanly in CI's
   schema-parity / migration jobs; if the order is a problem, report to the operator before renaming).
2. #314 @ 4192ba9d: close every A/B from both lenses and cheap Cs; merge mobile main 2c17c241 (merge commit). #314 already adds a
   native audio dependency (expo-audio): the shared deps at /home/user/workspace/deps/mobile come from main and do NOT contain it —
   mock it in jest; never install node_modules. Any further package.json change -> report "DEP CHANGE" to the operator at once.
3. List the exact launch-manifest flips needed after deploy (Wave A community core: FEATURE_COMMUNITY_API/POSTS/MESSAGES/PUSH/
   REALTIME, FEATURE_COMMUNITY_VOICE_NOTES) and the clinic EAS EXPO_PUBLIC flags; do not edit the manifest.
Tests via heavy.sh (targeted jest --runInBand; tsc once per repo per round). Never weaken, skip or delete suites. Update PR bodies
(fix-round tables). Never merge, dispatch workflows or touch production. Report: /home/user/workspace/ops/reports/B-UGC-4-112.md.
Final answer (<400 words).
