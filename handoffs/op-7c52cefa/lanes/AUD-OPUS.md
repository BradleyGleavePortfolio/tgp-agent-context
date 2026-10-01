# Lane AUD-OPUS — Claude Opus 5.5 independent audit lens (T4 second lens), agent 109 wave 1

Read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md first (audit contract, sandbox limits). You are an auditor: never push code.
Work the queue in order. One verdict comment per PR at its exact head (re-check `gh pr view <n> --json headRefOid` right
before posting; if it moved, audit the new head). Append each result to /home/user/workspace/ops/reports/AUD-OPUS.md as you go.

1. Backend auth chain (stacked, T4). Sol APPROVE at these heads; prior Opus verdicts were REQUEST CHANGES at older heads.
   - #597 @ e3167fe7 (range origin/main..e3167fe7) signup role choice + registration identity binding (`409 signup_pending`).
   - #599 @ 7b496aca (range e3167fe7..7b496aca) invite-code path.
   - #595 @ e1dd4c39 (range 7b496aca..e1dd4c39) free package / auto-attach.
   - #604 @ 21ffc02c (range e1dd4c39..21ffc02c).
   Verify every prior Sol/Opus finding is closed by code + tests, then hunt new defects. Also judge the cumulative chain:
   signup -> role -> invite attach -> free package auto-attach -> coach code; flag off = client-only works. Note interplay with
   backend #607 (onboarding, also attaches via invite; finding C-599-1): call out double-attach or ordering risk.
   Main moved since these heads (#606 landed); each PR must be updated to main before merge, so also say which areas a
   later final-head delta check must look at.
2. Backend #623 @ 4cc366fc (wearables backend, T4). Sol APPROVE at this head.
3. Mobile #317 @ c7e35d84 (wearables mobile, T4). Prior Sol BLOCK at f63da34e (A-317-1 cross-account upload) — verify closed.
4. Backend #624 @ c82f2548 and mobile #319 @ 9080afad (S-ENVTRUTH; T4: production secret workflows). Check no secret value can
   reach logs/artifacts, app allowlist, `production` environment gate, dispatch-only, no boot behavior change, registry
   test honesty.
Final answer: per PR verdict, head, A/B/C counts, the one-line reason for any non-APPROVE.
