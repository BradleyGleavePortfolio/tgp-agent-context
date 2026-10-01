# Lane B-QUIZ-OFF — switch off the legacy diagnostic quiz in the fitness backend (T2; builder GPT-6.1 Sol, one Sol audit unless the scan finds T3/T4)

Read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md first and follow it exactly.
Owner ruling 2026-10-01 15:25 PDT: the 40-question income/body/lifestyle quiz with the Perplexity "roadmap"
(src/diagnostic: GET /diagnostic/questions, POST /diagnostic/submit, GET /diagnostic/:id, AiRoadmapService) belongs to
a different, unrelated product and does not go with TGP Fitness. Production has 0 DiagnosticSubmission and 0 AiRoadmap
rows. The other product has its own backend and does not call these routes.
Deliver (one PR against backend main):
1. Remove DiagnosticModule from the app (routes return 404, AiRoadmapService never runs, no Perplexity call path from
   diagnostic). Remove the diagnostic-submit named throttler and DIAGNOSTIC_* env registrations only if nothing else
   uses them (keep env-validation/registry consistent; ENV REGISTRATION rules).
2. Do NOT drop tables or columns (no destructive migration). Keep schema.prisma models so schema parity stays green;
   add a schema comment that the tables are retired and empty. Leave account-deletion handling of these tables intact.
3. Tests: the three routes 404; app boots without the module; no remaining import of src/diagnostic from live modules.
   Delete or quarantine diagnostic specs accordingly.
4. Remove the diagnostic from docs/READMEs and public pages if referenced (#611 owns the privacy text; do not edit
   src/public-pages here unless a link to /diagnostic exists, then remove only the link).
Tier header with T3/T4 scan. Report /home/user/workspace/ops/reports/B-QUIZ-OFF.md + final answer (head, tests, CI).
