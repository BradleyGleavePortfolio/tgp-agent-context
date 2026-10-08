# FLIP-MEM-PB-128 (agent 128, Claude Opus 5.5, builder T4): FEATURE_ROMAN_MEMORY + FEATURE_ROMAN_PLAYBOOK flip PRs

Status (15:08 PDT 10-07): both PRs open (not draft), merged with main c500847b and pushed; first heads were all-green but conflicted after b#850/#851 merged. Second CI (build-and-test) still running at 15:08; READY comments NOT posted (operator 14:46 credit emergency: 20-minute limit reached, finishing).

## Scope traced
- Backend main 675242fd; production = deploy 24 0d179edb (deploy 25 not yet run). Mobile main 4185b9b2.
- b#844 merged (e6b4ea47), b#845 merged (1427f124); m#461 (62bc9c34) and m#463 (11d433bc) on mobile main.
- Since 14:50: b#850 (9d23137d), b#849 (c7caffff), b#851 TOOLS (c500847b) merged on main. PB-POOL-128 has no PR yet.
- R11-INT-AUD-128: TOOLS GO after deploy 25 + b#849; MEMORY GO after deploy 25; PLAYBOOK NO-GO (B1 b#850, B2 coach credits).
- Full file:line tables: /home/user/workspace/ops/reports/FLIP-MEM-128-pr-body.md and FLIP-PB-128-pr-body.md.

## B list
- MEMORY: none in the PR. Ordering: apply only after deploy 25 (prod lacks b#845, so memory off there deletes notes).
- PLAYBOOK B1: coach content to Anthropic without policy/terms text. Fix: b#850 merged + deployed.
- PLAYBOOK B2: builds debit the head coach's AI pool (playbook-builder.service.ts:171-177) undisclosed (mobile AIBudgetTutorialModal.tsx:94, :112). Fix: PB-POOL-128 (platform payer).

## U list
- MEMORY U2 (audit): memory augmenter reads a non-v5 client's notes before the scope drop (roman.service.ts:1031-1035); nothing sent. Fix ~5 lines (FIX lane).

## C one-liners
- Older app builds cannot grant v5. C (edge, deferred to 10k clients)
- Double playbook build on two machines; red lines prompt-only. C (edge, deferred to 10k clients)

## PRs
- growth-project-backend#854 FLIP-MEM, branch agent128/flip-mem-128, head f20a5246093d37ad289404c34e4075bbd3d13abf (merge of main c500847b; first head c4e2699a was CI green), 3 files +6/-5 (11 lines). MERGEABLE.
- growth-project-backend#855 FLIP-PB, branch agent128/flip-pb-128, head f92f693605b1b735937f07a11c87d918ee8ffc6f (merge of main c500847b; first head 2c136533 was CI green), 3 files +6/-5 (11 lines). MERGEABLE. Body line 1: "merge only after b#850 and PB-POOL-128 are merged and deployed".
- Local (heavy.sh), both: fly-env-manifest.spec.ts 69/69, r11-seams.spec.ts 21/21; MEM also fly-env-workflows 15/15, fly-env-sync-behavior 56/56.
- After merge, both worktrees: r11-seams + fly-env-manifest 90/90 (logs FLIP-*-128-merge-tests.log).
- CI at new heads: build-and-test in progress at 15:08, all other checks green. Verdicts: none requested yet.

## Not fixed (needs operator)
1. Apply order: deploy 25 (with #849) -> #851 TOOLS -> #854 MEMORY -> b#850 + PB-POOL-128 merged and deployed -> #855 PLAYBOOK.
2. #854 and #855 both edit r11-seams.spec.ts:484-486 (declaredOn list), manifest :52-53/:134-135 and runbook :206; whichever merges second needs a small merge (FIX lane: add both flags to declaredOn, keep both gates notes and both paragraph sentences).
3. PB-POOL-128 (T4 money, Opus): add payer {kind:'platform'} (roman-background-spend.ts:39-41), skip pool pre-check/debit (:110-120, :211-233), pass it at playbook-builder.service.ts:173.

## HANDOFF
- Worktrees /home/user/workspace/wt/FLIP-MEM-128-backend (head f20a5246) and /home/user/workspace/wt/FLIP-PB-128-backend (head f92f6936); nothing uncommitted.
- Next agent: when build-and-test is green at those exact heads (`gh pr view 854|855 -R BradleyGleavePortfolio/growth-project-backend --json statusCheckRollup,headRefOid,mergeable`), post the prepared comments verbatim: /home/user/workspace/ops/reports/FLIP-MEM-128-ready-comment.md on #854 and FLIP-PB-128-ready-comment.md on #855 (`gh pr comment N -R ... --body-file ...`). If a head moved or CI failed, fix and re-prepare.
- PR bodies: FLIP-MEM-128-pr-body.md / FLIP-PB-128-pr-body.md (PB line 1: "merge only after b#850 and PB-POOL-128 are merged and deployed").
