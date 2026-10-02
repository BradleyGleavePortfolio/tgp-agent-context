# Lane B-FLAGS-3 (agent 112) — Claude Opus 5.5 builder: two launch-manifest flips (backend; T4 production ops)

Read first: /home/user/workspace/ops/AGENT_BRIEF_COMMON.md; the manifest header comments in
.github/fly-env-desired-state.json ("one entry per line, every flip is its own audited PR"); docs/runbooks referenced there;
test/ci/fly-env-manifest.spec.ts; scripts/fly-env/fly-env-manifest.js; /home/user/workspace/ops/lanes111/B-FLAGS-2.md.
Open TWO separate PRs against backend main 3bd6215b (one flip each; tier header T4 production ops; Why / trigger scans /
acceptance evidence / promotion triggers per the brief):
1. Branch agent/clinic/flip-google-client-ids: `"GOOGLE_CLIENT_IDS": "unset"` -> `"github-secret"` in secrets. Owner 10-01 10:01
   "Google sign-in on day 1". Facts for the PR body: the GitHub secret GOOGLE_CLIENT_IDS was set 10-01 17:38 UTC (Web client
   963513798354-...; Supabase Google provider updated; tgp://auth/callback allow-listed); live /api/auth/signup-policy today shows
   google_signin_enabled:false; mobile main already ships the Google button behind signup-policy (src/utils/googleAuth.ts,
   LoginScreen, CreateAccountScreen). Verify (read-only code reading) the backend reader (src/auth/google-verifier.service.ts,
   auth.service signup-policy) and the mobile flow agree on what turns the button on, and state what the installed builds will
   show after apply. Update that name's `gates` text only if it would become false.
2. Branch agent/clinic/flip-booking-reminders: `"BOOKING_REMINDERS_ENABLED": "unset"` -> `"on"` (literal on; 'true' disables).
   Operator ruling OR-110-5 (reminders ON at launch; #632 is deployed). Confirm from code that both 24 h / 1 h sweeps are safe
   with zero live bookings and that delivery failures (no FCM key on Android yet) are handled without errors or retries storms;
   say so in the body with file:line evidence.
For each: link deps in your own worktree (/home/user/workspace/ops/link_deps.sh backend <wt>), `heavy.sh npx prisma generate`,
then `heavy.sh npx jest --runInBand --forceExit test/ci/fly-env-manifest.spec.ts` (must pass: 67/67 baseline) and any spec that
pins these names. Push, open the PRs ready for review, wait for the 10 required checks to go green, then STOP.
Never merge, never dispatch fly-env-sync or any workflow, never touch production. The operator merges and applies.
Report: /home/user/workspace/ops/reports/B-FLAGS-3-112.md. Final answer (<300 words): PR numbers, heads, CI status, evidence.
