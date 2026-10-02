# Lane B-JOURNEY-2 (agent 112) — Claude Opus 5.5 builder: three small launch items (mobile #324; B-QUIZ-OFF; branch-protection script)

Read first: /home/user/workspace/ops/AGENT_BRIEF_COMMON.md; /home/user/workspace/ops/lanes111/B-JOURNEY.md items 3-5 (B-JOURNEY died
before reaching them; #609/#312 are under audit now — do NOT touch them). Owner 10-01 14:19: one support email everywhere,
Bradleyapple1031@gmail.com; 15:25: the diagnostic quiz belongs to TGP Finance -> off in the fitness backend (no table drops).
Do in order, each its own PR, pushing as soon as its targeted tests pass (Conventional Commits titles; tier headers):
1. mobile #324 @ 7f20255d (T2; Sol REQUEST CHANGES): close every Sol finding (a support email that fails to launch is never
   silent: visible failure, selectable/copyable address, Retry; tests) and consolidate every mobile support address to the single
   constant; merge mobile main 2c17c241 first (merge commit). Reuse the safety-email pattern from mobile #314 if sensible without
   depending on #314.
2. B-QUIZ-OFF (new backend PR off main 3bd6215b, T2 — re-grade up if it touches auth/PII): routes/flags off and unreachable, no table
   drops, tests proving the routes are closed; no public text or docs promise it.
3. scripts/setup-branch-protection.sh (new backend PR, T4 CI-gate file): list all 10 required checks exactly as live branch
   protection has them (read them with `gh api repos/BradleyGleavePortfolio/growth-project-backend/branches/main/protection`),
   adding "Schema parity (migrations match schema.prisma)", with a test that the script's list equals the expected list. Never run
   the script; never change settings.
Tests via heavy.sh (targeted jest --runInBand; CI does tsc + full suites). Never merge, dispatch workflows or touch production.
Report: /home/user/workspace/ops/reports/B-JOURNEY-2-112.md (append per item). Final answer (<400 words).
