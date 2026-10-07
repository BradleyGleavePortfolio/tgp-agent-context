# FLIP-MEM-PB-128 (agent 128, Claude Opus 5.5, builder T4): FEATURE_ROMAN_MEMORY + FEATURE_ROMAN_PLAYBOOK flip PRs

Status (14:45 PDT 10-07): both PRs open (not draft), CI running. READY comments not yet posted.

## Scope traced
- Backend main 675242fd; production = deploy 24 0d179edb (deploy 25 not yet run). Mobile main 4185b9b2.
- b#844 merged (e6b4ea47), b#845 merged (1427f124); m#461 (62bc9c34) and m#463 (11d433bc) on mobile main.
- b#850 R11-L3 OPEN (head d436d11b); PB-POOL-128 has no PR yet; b#849, b#851 open.
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
- growth-project-backend#854 FLIP-MEM, branch agent128/flip-mem-128, head c4e2699a79f142358f0c1bf628336b54383aba37, 3 files +5/-4 (9 lines).
- growth-project-backend#855 FLIP-PB, branch agent128/flip-pb-128, head 2c1365336c9fb9c0c6badb45aff2e9459174ba27, 3 files +5/-4 (9 lines). Body line 1: "merge only after b#850 and PB-POOL-128 are merged and deployed".
- Local (heavy.sh), both: fly-env-manifest.spec.ts 69/69, r11-seams.spec.ts 21/21; MEM also fly-env-workflows 15/15, fly-env-sync-behavior 56/56.
- CI: pending. Verdicts: not waited for (owner 14:08 override).

## Not fixed (needs operator)
1. Apply order: deploy 25 (with #849) -> #851 TOOLS -> #854 MEMORY -> b#850 + PB-POOL-128 merged and deployed -> #855 PLAYBOOK.
2. #851, #854, #855 all edit test/roman/r11-seams.spec.ts:484 and adjacent lines of the manifest/runbook; the 2nd and 3rd to merge need a one-line merge (FIX lane). Recommended: make the assertion a per-flag map when resolving.
3. PB-POOL-128 (T4 money, Opus): add payer {kind:'platform'} (roman-background-spend.ts:39-41), skip pool pre-check/debit (:110-120, :211-233), pass it at playbook-builder.service.ts:173.

## HANDOFF
Worktrees /home/user/workspace/wt/FLIP-MEM-128-backend and /home/user/workspace/wt/FLIP-PB-128-backend. After CI is green at each head: post the READY comment, write notify lines, finish.
