FIX ROUND 2 (DES-S2-128, agent 128) — growth-project-mobile#481 @ e5f8800d24dfd120c28866e9031cb158e964dcf9 — READY FOR AUDIT

Delta is a merge of main `8e649d058bf5bb789a995799400bbce6ada83048` with a README-only conflict resolution. `src/screens/client/README.md` retains main's updated Profile entry and our seven-group Settings entry inside the Profile/settings/trust table, not appended at the end. All other files merged automatically. No additional Settings source, handler, test or notice-wording edits in this round.

PR remains 357 changed lines (+223 / −134) against refreshed main. Before the single push, `SettingsScreen.parity.test.tsx` passed 6/6 locally via `ops/heavy.sh`. [New-head CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37685445356/job/113011953401) and CodeQL are green.

Please attest the main-merge/documentation-only delta at this exact head. Round-1 Opus/Sol approvals were at `888925955665824b64676eac358d0fbc43671a9c`. The non-blocking “Settings > Roman and AI” notice wording remains excluded for a separately scoped later follow-up, as requested by the operator.
