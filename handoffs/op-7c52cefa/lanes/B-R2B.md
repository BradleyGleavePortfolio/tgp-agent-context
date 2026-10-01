# Lane B-R2B — AI consent enforcement in the AI gateway (R2b), backend, T4. Builder: Claude Opus 5.5

Read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md and /home/user/workspace/ops/CONSENT_D2_CONTRACT.md first.
Why: owner 12:51 made Roman data-aware in v1.0 (D1 superseded); the coach brief, AI drafts, MWB AI live-create (MWB-5
materialiser uses target_client_id) and any other AI call may send client data to Anthropic. Under D2 box 2 and Washington's
My Health My Data Act, no client data may reach the AI provider without the client's LIVE box-2 grant in the #622 ledger.
Base: backend #622 (R2a ledger) @ fcb984f2, branch agent/clinic/r2a-ai-consent-ledger. Create a stacked branch
`agent/clinic/r2b-ai-consent-gateway` from it and open a PR against that branch (the operator retargets to main after #622 lands).
1. Inventory (S07b): every server path that calls an AI provider (grep Anthropic SDK/HTTP use, env names like
   ANTHROPIC_API_KEY, CRON_COACH_AI_INSIGHT, DIAGNOSTIC_AI_ENABLED, coach brief, Roman chat, AI drafts, MWB materialiser,
   community AI triage). For each: does it carry client data, which client, current gating. Put the table in the PR body.
2. Single enforcement point: route every client-data AI call through one gateway check that reads the live box-2 grant
   (fail closed on errors, revocation effective immediately, no caching that outlives a revocation). Refusal returns a clear,
   calm coach-facing reason (e.g. "This client hasn't allowed AI help yet.") and never leaks other clients' data. Template
   authoring with no client data may proceed without consent; prove no client data flows in that path.
3. Tests: grant/no grant/revoked/ledger error for every inventoried path; a guard test that fails if a new AI call site
   bypasses the gateway (e.g. lint/grep test on SDK imports outside the gateway module).
Do not flip any flag. Tier header T4 in the PR body. Report: /home/user/workspace/ops/reports/B-R2B.md + final answer.
