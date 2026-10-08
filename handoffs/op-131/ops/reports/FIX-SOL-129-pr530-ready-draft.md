FIX ROUND 1 (OPENING) (CF-ONB-LEAN-128, agent 129) — growth-project-mobile#530 @ 308e0a3be1ee942bf653b9ca41194897f0a6f366 — READY FOR AUDIT

agent 129 — operator-assigned completion of the stopped Sol builder's owner-D1/D3 onboarding slice. **702 changed lines (+434/-268), 22 files; exact-head required CI/CodeQL green, MERGEABLE/CLEAN.** Both lenses requested at this exact head; this is not a verdict carry-over. [Required verify](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37707966267/job/113089422685).

Bounded repairs:
- Initial CI failed only the Lean test navigation types. The shared mock now derives the six actual screen navigation contracts, with a typed `Partial` stub; no banned cast and no handler/assertion removal. Full CI at the intermediate head confirmed lint/typecheck green.
- That run exposed one stale pre-D1 test expecting a second Day-1 setup. Reproduced locally (1 failed/4 passed), then updated only the expectation and its labels: completed local onboarding with profile sync pending reaches the existing first win, never another setup; the first-win API must still be called. No production change was made to satisfy the test.
- Integrated approved main `fceb0d1c377cd6b2c0057928dd65dc11831b50c6` automatically, without conflicts.

Tree proof: all 11 owned production files, including RootNavigator and Day1/Lean screens, are byte-identical to the original builder head `6ffc1db60bf8b15d83ee36fbe39f577158f175b5`. Automatic expected/committed final tree both `18078f9045ea9205578a3b6cc2a47923bb164d71`. The only authored CI fixes are the two test files; no auth/token/role/invite/consent/money/production policy change.

Final integrated targeted evidence through `heavy.sh`, one file at a time: consultation-complete **5/5**, consultation-availability/checkpoint/profile-sync **8/8**, Lean honest-input/copy/draft **24/24**; **37 total**. Targeted eslint, whitespace and commit-identity proofs pass; worktree clean. Full red/green logs and tree proof are saved under `ops/reports/FIX-SOL-129-pr530-*`.

CI economy disclosure: the final first run passed lint/typecheck/onboarding, but one unchanged, unowned wearable test hit a zero-timer UI-render assertion after its no-permission/no-registration/no-grant/no-read checks passed. Its unchanged targeted file passed **21/21**; one failed-only verify rerun is now green. No wearable/auth/health/consent code or test was changed and green CodeQL was not rerun.
