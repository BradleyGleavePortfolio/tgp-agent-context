# Lane B-ENVTRUTH — fix round for S-ENVTRUTH: backend #624 + mobile #319 (T4: production secret workflows). Builder: Claude Opus 5.5

Read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md first and follow it exactly.

## PRs
- Backend #624 (branch agent/clinic/s-envtruth-backend) @ c82f2548 — Sol REQUEST CHANGES 0/2/0:
  B-624-1 successful staging fails its post-check, so the optional apply never runs;
  B-624-2 the fail-closed env-registration gate silently drops supported indirect reads (alias keys, exported-to-local
  helper bindings). Verdict with minimal fixes: /home/user/workspace/ops/reports/AUD-SOL-backend-624-verdict.md
  (PR comment 5940127416).
- Mobile #319 (branch agent/clinic/s-envtruth-mobile) @ 9080afad — Sol REQUEST CHANGES 0/1/0:
  B-319-1 comment stripping hides real runtime reads from the manifest guard (comment-shaped text inside strings).
  Verdict: /home/user/workspace/ops/reports/AUD-SOL-mobile-319-verdict.md (comment 5940200490).
- The Opus lens has not posted its verdict on these heads yet; if an Opus verdict appears on either PR while you work,
  fold its findings into the same round.

## Deliver
Fix each finding with the minimal fix the verdict describes, plus behavioral negative tests that fail on the old code
(structured `flyctl secrets list --json` names only, never values or digests in logs/artifacts; staged/partial/deployed
JSON fixtures proving the optional apply step is reachable after a successful stage; a syntax-aware scan in mobile with
fixtures for comment-shaped strings, fake read text in strings and real reads after them). Rebase each branch on its
origin/main first (backend main be667142; mobile main c4963f8). Do not dispatch any production workflow. Update each PR
body's tier header and Fix round table, post a fix-round comment, write /home/user/workspace/ops/reports/B-ENVTRUTH.md,
and give a final answer with heads, per-finding disposition, tests, CI, open risks.
