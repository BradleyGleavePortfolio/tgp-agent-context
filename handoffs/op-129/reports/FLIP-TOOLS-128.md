# FLIP-TOOLS-128 (agent 128, Claude Opus 5.5, builder T4): FEATURE_ROMAN_TOOLS flip PR

Status (14:33 PDT 10-07): PR growth-project-backend#851 CI green at 36c7c454, READY posted 14:32 (issuecomment-6047272254), MERGEABLE CLEAN vs main c7caffff (#849 and #850 merged since). Finished per owner 14:08 override (no verdict wait).

## Scope traced
- Main 675242fd (includes #840 #838 #842 #843 #846 #844 #848). R11-T3-FU #849 is still in review; deploy 25 follows it.
- All preconditions hold, with file:line (full table in the PR body, /home/user/workspace/ops/reports/FLIP-TOOLS-128-pr-body.md):
  - student turns only: roman.service.ts:1018 and 1039, 1280-1281; roman-read-tools.ts:211
  - subject is the caller only: roman-tool-loop.ts:195; roman-read-tools.ts:228; strict zod :54-58
  - per-turn limits: roman-tool.types.ts:62-68
  - per-day reservation and coach pool: roman.service.ts:1060-1078 and 1597-1603
  - egress-gated and metered: ai-egress.service.ts:333-345; roman-tool-loop.ts:158-175
  - result clamp: roman-tool-loop.ts:198
  - reply check: roman.service.ts:1196-1201
  - policy text: trust-pages.html.ts:269 and :463
  - kill switch: roman-tools.feature.ts:14-16; roman.prompts.ts:165
  - toolbox provided: roman.module.ts:63-65
  - no mobile change needed: the reply is one buffered body (romanApi.ts:470-488), and the consent copy stays true (copy.ts:41-42)

## B list
(none)

## U list
(none)

## C one-liners
- A turn with 3 tool rounds and long thinking could come close to the mobile 60 s send timeout (romanApi.ts:488). The reply is still saved. C (edge, deferred to 10k clients)
- Stale comments say "Not provided on main" (roman.service.ts:236-237, roman-tool.types.ts:5), but the module does provide the toolbox. Comments only; no fix needed.

## PRs
- growth-project-backend#851, branch agent128/flip-tools-128, head 36c7c4541e875d0a74e4261c91aaf24c072f0237, 3 files, +5/-4 (9 lines).
  - Manifest flag unset -> true, plus its gates note.
  - Runbook paragraph. The kill-switch table row is generated from the code default and checked by a spec, so it stays unchanged on purpose (FEATURE_MWB_AI_LIVE_CREATE does the same).
  - r11-seams.spec.ts: one assertion now expects true for TOOLS, because it pinned 'unset'.
- Local (heavy.sh): test/ci/fly-env-manifest.spec.ts 69/69 and test/roman/r11-seams.spec.ts 21/21.
- CI: green (15 success, deploy-readiness-gate skipped). Verdicts: not waited for (owner 14:08 override); none at 14:33.

## Not fixed (needs operator)
- Apply order: merge and apply (fly-env-sync) only after deploy 25 is live. Deploy 25 carries #843, #844, #846, #848 and #849 (#849 merged 14:3x, main c7caffff). Production (deploy 23) has the policy text and the reply check from before these PRs.

## HANDOFF
- Worktree /home/user/workspace/wt/FLIP-TOOLS-128-backend. b#851 @ 36c7c4541e875d0a74e4261c91aaf24c072f0237 is READY (round 1). It needs both lenses ("AUDIT Claude Opus 5.5" and "AUDIT GPT-6.1 Sol") at this head. The FIX lane handles any findings. The operator merges, then applies after deploy 25.
