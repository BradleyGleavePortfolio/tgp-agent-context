# Annex lane A5-COACH-BRIEF — Claude Opus 5.5 builder, T4 (AI over client data; box-2 gate)
Read /home/user/workspace/ops/lanes113/annex/_BUILD_COMMON.md and /home/user/workspace/ops/AGENT_BRIEF_COMMON.md fully first. Put "Builder: TGP annex lane A5-COACH-BRIEF" in every PR body. Report: /home/user/workspace/ops/reports/A5-COACH-BRIEF-annex.md and a line in tgp-agent-context handoffs/annex/STATUS.md.

Owner: coach daily brief — luxury, powered by Roman, runs once a day, turns scattered info into highlights ("Sir, we collected $x
last night. Sarah and 2 others messaged you. I have response drafts made. Good morning"); Roman triage + a reply draft for every unread
client message (box-2 consent gate: no client data to the model without that client's box-2 consent; contract CONSENT_D2_CONTRACT.md);
client detail completeness (billing status, the score in view, consultation answers — agent 113's lane S-REACH builds the
consultation-answers view; reuse it, do not duplicate); coach check-in review (queue of submitted check-ins with quick reply).
Verify COACH_BRIEF_ENABLED and the brief cron exist and work on main (read code; production probes = unauthenticated GET 401/404 only).
Backend + mobile, new branches from origin/main. Drafts are never sent without the coach's tap; edits allowed; every draft and send is
audited. Kill switch flag OFF by default until audit. Tests failing-before, including the consent gate.
