# Lane B-FLAGS-2 (agent 111) — Claude Opus 5.5 builder: ONE audited path to set launch flags (T4 production ops) — DEPLOY BLOCKER

Why it is urgent: backend main e5a6044a carries #626 (single AI egress gate). Deploying it without
FEATURE_AI_CONSENT_LEDGER_ENABLED on in the same window blocks every client-data AI call (operator ruling OR-110-4), and no
audited workflow on main can set that flag today. So production is stuck on ba79605b until this lane's PR is dual-approved and
merged. Get the first PR up FAST and RIGHT (no audit ping-pong).

Read first: /home/user/workspace/ops/AGENT_BRIEF_COMMON.md; prompt v5 section 4.9 (day-1 flags) in /home/user/workspace/repos/tgp-agent-context/handoffs/op-f083060f/TGP-Operator-Prompt-v5-Agent-111.md (search "4.9");
/home/user/workspace/repos/tgp-agent-context/FLAGS_LAUNCH_LEDGER.md; agent 110's dead attempt
/home/user/workspace/ops/lanes110/B-FLAGS.md + /home/user/workspace/ops/reports/B-FLAGS-110.md (read-only findings:
MWB_AUTOSAVE_LOCK_TOKEN_SECRET absent in prod and FEATURE_MWB_AUTOSAVE_UNDO=true throws at boot without it -> precondition;
BOOKING_REMINDERS_ENABLED must be the literal "on" after #632/#634); 108's WIP branch wip/op590e4a5b-s-envtruth-be-20261001
@ 8bdb5997 (reuse closed-value validation against ENV_RULES, duplicate/excluded checks, Wave A/B inventory; NOT its
documentation-only pending_flags block or its awk post-check); main's .github/workflows/fly-env-sync.yml, fly-env-truth.yml,
fly-feature-flags-set.yml, prod-switches.yml, src/common/env-validation.ts, test/ci/fly-env-*.spec.ts; every AUDIT comment on
backend #624 (merged) and #633 (Sol + Opus REQUEST CHANGES, B-633-1 = naive awk parse of `fly secrets list`; C-633-1..3).

Build (PR 1, T4, onto main e5a6044a; branch agent/clinic/flags-manifest):
1. A checked-in desired-state launch-flag manifest + loader + manifest-driven plan/apply in the fly-env-sync path: every Wave A and
   Wave B flag with closed-choice values validated against ENV_RULES (including FEATURE_AI_CONSENT_LEDGER_ENABLED, the
   FEATURE_COMMUNITY_* core set mapped from the real guards, FEATURE_COMMUNITY_VOICE_NOTES (owner: ON at launch after audit +
   device pass), BOOKING_REMINDERS_ENABLED="on", SIGNUP_ROLE_CHOICE_ENABLED, FEATURE_WEARABLES_INGEST_POST, MWB flags with their
   secret precondition, FEATURE_DUNNING_V2, GOOGLE_CLIENT_IDS from the GitHub secret). Plan mode prints names + digests only (never
   values of secrets); apply is bound to the `production` environment; post-apply verification reads `fly secrets list --json`
   (never awk on the table) and proves each name is present/absent exactly as declared; unchanged values are not re-set (no
   needless rolling restarts); preconditions (e.g. MWB lock secret) fail the plan with a specific message.
2. Initial manifest values = current production state (nothing turns on by merging PR 1). Each flip is a separate
   one-line manifest PR the operator merges at the right moment (first one: FEATURE_AI_CONSENT_LEDGER_ENABLED on, same window as
   the #626 deploy). Prepare that one-line PR as a draft stacked on PR 1 so it is ready.
3. Fold #633's FEATURE_DUNNING_V2 into the manifest; post one comment on #633 recommending closure as superseded (do not close).
4. Runbook in the repo (docs/) for plan -> apply -> verify -> rollback.
PR 2 (separate, small): fix shellcheck SC2015 in scripts/s10-core-diff-gate.sh without changing the gate's decisions, with a test
proving identical decisions. Note: this file is a CI-gate file -> T4 per the brief.
Tests via heavy.sh (targeted jest --runInBand, actionlint/shellcheck if available). Keep the PR body tier header + evidence current.
Never dispatch workflows or touch Fly. Report: /home/user/workspace/ops/reports/B-FLAGS-2-111.md (append as you go).
Final answer (<400 words): PR numbers, heads, what each flag's manifest entry is, tests, CI status, risks/decisions.
