# Lane S-SCHED-4 (agent 112) — Claude Opus 5.5 builder: scheduling fix round 4 (backend #634, mobile #325; T4)

Owner 10-01: TGP native scheduling IS the product (10:37); client Calendar section + Roman Calendar tutorial step (10:40);
"Add to my calendar" (10:41); tutorial ends "Book your welcome call with <coach>" (10:44); appointment types Quick
initialization 15 min, Quick Q/A Call 20 min, Tele-Health Dietary/Fitness Check-in 45 min. Every critical feature reachable.
Read first: /home/user/workspace/ops/AGENT_BRIEF_COMMON.md; /home/user/workspace/ops/lanes111/S-SCHED-3.md and
/home/user/workspace/ops/reports/S-SCHED-3-111.md (what round 3 did); EVERY AUDIT comment on backend #634 (Opus APPROVE, Sol
REQUEST CHANGES 0/1/0 at 2a07ab25) and mobile #325 (Opus REQUEST CHANGES, Sol REQUEST CHANGES 0/2/0 at 13b8a8fa).
Do (one pass, no ping-pong; each finding closed with a failing-before test, plus cheap Cs):
1. #634 @ 2a07ab25: close Sol's B; merge backend main 3bd6215b (merge commit, no rebase; register env names per #624). Migration
   stays 20270222000000 (sorts after main's latest 20270216000000). Operator ruling stands: two read-only zero-row queries run
   before its migration deploys — put the exact SQL in the PR body under "Pre-deploy checks" (the operator runs them).
2. #325 @ 13b8a8fa: close every A/B from both lenses; merge mobile main 2c17c241 (merge commit; main now has #310 onboarding —
   make sure the tutorial's "Book your welcome call" hand-off and the Calendar step agree with #310's flow). expo-calendar is a
   native dependency on this branch: shared deps do not contain it — mock in jest; never install node_modules; any further
   package.json change -> report "DEP CHANGE" to the operator at once.
3. Follow-ups if small (else list): seed is_welcome on Quick initialization; delete the unreachable ClientBookingRequest route.
Tests via heavy.sh (targeted jest --runInBand; tsc once per repo per round). PR bodies: fix-round tables. Never merge, dispatch
workflows or touch production. Report: /home/user/workspace/ops/reports/S-SCHED-4-112.md. Final answer (<400 words).
