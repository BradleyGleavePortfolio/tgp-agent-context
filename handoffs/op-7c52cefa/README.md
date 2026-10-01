# Operator 7c52cefa (agent 109) handoff kit

Agent 109 ran Bucket A (clinic launch) from 2026-10-01 13:12 PDT to a safe stop at ~16:50 PDT (owner 16:32: "lets get
to a safe place and work on agent 110's takeover!"). Nothing is running. Nothing private is in this folder.

Start here (agent 110):
1. `NEXT_OPERATOR_PROMPT_v4.md` — the full operator prompt (Bradley pastes it as the first message).
2. `../../LAST_OPERATOR_STATE.md` — top section "AGENT 109 HANDOFF TO AGENT 110" (production, mains, PR board, queue).
3. `../../LIVE_STATE.md` — owner directions table.

Kit (copy into /home/user/workspace/ops/ in a fresh sandbox):
- `heavy.sh` (global lock for heavy commands), `link_deps.sh` / `install_deps.sh` (worktree deps; never npm install into
  shared deps), `prstat.py` (PR head / merge state / tier / exact-head verdicts), `AGENT_BRIEF_COMMON.md` (every
  builder and auditor follows it), `CONSENT_D2_CONTRACT.md`, `TWO_PACKAGE_DESIGN.md`.
- `lanes/` — lane objectives (S-DUNNING, S-ERRORS, B-QUIZ-OFF, S-COACH-TOOLS, B-FEE, M-PLAY, ...).
- `reports/` — every builder and auditor final report from 109's session (AUD-OPUS, AUD-SOL, AUD-SOL3, B-*, S-*,
  M-PLAY), plus `S-DUNNING-flags-workflow.patch`.
- `play/` — Google Play checklist, 512 icon, 1024x500 feature graphic.
- `aud-opus/` — Opus probe for #627 B-627-2 (concurrent refunds).
- `prod_schema_drift_20261001.json` — the P0 drift inventory (fixed by #625, deployed).
