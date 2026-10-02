# Lane B-FLAGS (agent 110) — Claude Opus 5.5 builder: one audited path to set launch flags (T4 ops) + infra-lint fix

Read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md first, then v4 prompt section 4.9 (day-1 flags; copy at
/home/user/workspace/handoff111/TGP-Operator-Prompt-v4-Agent-110.md, search "### 4.9"), /home/user/workspace/ops/reports/B-FIX2-110.md
(108's WIP 8bdb5997 on backend: desired-state manifest + loader, manifest-driven sync steps, Wave A prod-switch entries, 6 tests,
runbook) and every AUDIT comment on backend #624 and #633. Rule (v4 4.9): a flag goes on only through the audited fly-env-sync
manifest. Today no workflow on main can set FEATURE_AI_CONSENT_LEDGER_ENABLED (needed with the #626 deploy, OR-110-4), the
FEATURE_COMMUNITY_* set, BOOKING_REMINDERS_ENABLED, voice flags, SIGNUP_ROLE_CHOICE_ENABLED, etc.
1. Build the desired-state prod-switch manifest + loader + manifest-driven plan/apply steps on top of #624 (fly-env-sync; stack on
   #624's branch until it merges, then rebase-free merge of main), covering every Wave A and Wave B flag with closed-choice values,
   plan mode that prints names + digests only, apply mode bound to the production environment, post-apply verification that each
   name is present/absent exactly as declared (fix the B-633-1 class of bug: never parse `fly secrets list` with naive awk; use JSON
   output), and a runbook. Flags default to their current production state; the manifest change that turns each on is a separate
   one-line PR the operator merges at the right time.
2. Fold #633's FEATURE_DUNNING_V2 into the manifest; recommend closing #633 as superseded (comment on it; do not close it yourself).
3. Separate small PR: fix shellcheck SC2015 in scripts/s10-core-diff-gate.sh (fails "Infra Lint"/shellcheck on main and every infra
   PR) without changing the gate's behaviour; test proving identical decisions.
Never dispatch workflows or touch Fly. Report to /home/user/workspace/ops/reports/B-FLAGS-110.md. Final answer (<400 words).
