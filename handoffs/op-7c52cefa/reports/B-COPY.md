# B-COPY report

## Backend #610 (two-way block) — pushed 2026-10-01 ~14:00 PT
- Head: d1e1732f0196490746ce9a09b7fc93685f29afdc (was b8ce8d35; rebased on main be667142; force-with-lease on own PR branch `agent/clinic/ugc-be/7c1d2e9b`).
- Commits: 68f7f3b7 (prettier format only), d1e1732f (logic; completes agent 108 WIP 1f4e158).
- Disposition:
  - Two-way block on every member read path: DONE. WIP was missing coach-authored lessons, events, challenges, Today event/challenge, reactions, event pushes; added. Coach messaging blocks share UserBlock, so a client who blocks the coach there stops seeing coach programme content in community too (documented).
  - Regression guard over all community GET routes (Nest metadata): DONE.
  - Report on every message/post: posts, comments, cohort messages, DMs, challenge comments reportable; DM report/react now participants only. GAP: voice notes not reportable (no enum member; migration needed). Recommend voice flag stays off (operator decision).
  - Client privacy: first names to other members on roster, block list, leaderboard, wins: DONE.
  - Owner rule 13:34: block/DM refusals carry code + message with next step: DONE.
- Tests (heavy.sh, --runInBand --ci): 15 suites/255 passed (+1 DB suite skipped); src roots search/voice/challenges + safety: 13 suites/188 passed; tsc clean; eslint/prettier clean on changed files; check-r75 range vs origin/main OK (net 0).
- CI: pending at push time (see final section).

## Mobile #314 (match #610 two-way block, no dead buttons, specific errors) — pushed ~14:35 PT
- Head: 2f7789e (was b4b931d8; rebased on main c4963f87; force-with-lease on `agent/clinic/ugc-mob/7c1d2e9d`).
- Disposition:
  - Two-way confirm/unblock copy: DONE.
  - No dead buttons: Block hidden on the viewer's coach's content (6 call sites pass `viewerCoachId`); Report on every post, comment, challenge comment, DM message: present. Voice notes: no report target on backend (same gap as #610).
  - Owner rule 13:34: new `src/api/communityErrors.ts`; every report/block/unblock/block-list/reply/DM/composer/moderation/challenge/space failure is specific or carries reference + support email + Sentry. Coach moderation actions were silent on failure; fixed.
- Tests: 21 suites / 257 passed (targeted); tsc clean; eslint clean on 12 changed files.
- Note: mobile repo has no prettier config; did not reformat (first attempt reformatted, reverted and re-applied edits by hand so the diff is logic only).

## Backend #611 B-611-1 (community-AI disclosure) — pushed ~14:50 PT
- Head: 3d008ffb (was ced10667; rebased on main be667142; force-with-lease on `agent/clinic/policies/p7q2k9xb`).
- Finding: policies said Anthropic "reviews community content that may break the rules / moderation". Code has no AI moderation. The only community AI is src/community/ai-triage: coach/owner-only, FEATURE_COMMUNITY_AI_TRIAGE default off, sorts a coach's unanswered posts/messages into 5 categories + summary; prompt = up to 240 chars of text, author account name, cohort name, age in hours; no box-2 check; read-only.
- Fix: rewrote privacy "Roman and AI" community paragraph + provider bullet, consumer-health recipients line; narrowed the box-2 sentence (:190 and :369 Consent) to "for Roman or AI drafts" with a pointer. Tests pin new text, ban old wording, and tie text to TRIAGE_CATEGORIES + prompt fields.
- Owner decisions: (1) re-approve the changed Consent clause (was byte-exact approved) — recommend approve; (2) keep FEATURE_COMMUNITY_AI_TRIAGE off at launch — recommended.
- Not fixed by copy (operator evidence): box-2 for Roman/coach AI drafts depends on R2b (#601) or recording coach-insight endpoint + brief/weekly crons off; deletion text depends on #608/#313.
- Mobile #315: not affected (paths unchanged; its copy stays accurate). Not touched.
- Tests: 4 suites / 81 passed; tsc clean; eslint/prettier clean; check-r75 OK.

## CI at final heads
- #610 d1e1732f: all required checks success (build-and-test, rls-floor-guard, rls-live-tests, mwb-3-live-tests, banned casts, CodeQL, npm audit, sbom, danger); deploy-readiness-gate skipped (expected).
- #314 2f7789e: Typecheck/lint/test, CodeQL success.
- #611 3d008ffb: all required checks success (build-and-test, rls-floor-guard, rls-live-tests, mwb-3-live-tests, banned casts, CodeQL, npm audit, sbom, danger); deploy-readiness-gate skipped (expected).

## Worktrees
- Removed /home/user/workspace/wt/b-copy-610 and /home/user/workspace/wt/b-copy-314; /home/user/workspace/wt/b-copy-611 removed after CI went green.
