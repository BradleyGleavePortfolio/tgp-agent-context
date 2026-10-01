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

## Backend #611 round 2 (operator 15:10, 15:30; owner ruling 16:30) — pushed
- Head: e5777735 (was 3d008ffb; rebased on main 10dff85c; force-with-lease on the PR branch). Commits 2258f8cf, 15540441, e5777735.
- 15:10 (#626 conflict): owner-approved box-2 sentence restored byte-exact at both places (verified identical to ced10667; no re-approval needed). Inbox-sorting text now says sorting only includes members who ticked the optional AI box; round-1 "does not depend on the optional AI box" / "separate from this box" removed. Tests cite the #626 gate by path (ai-triage.service.ts consentedClients filter; ai-egress.service.ts consentedClients); no #626 import. Deployment note in the PR body: FEATURE_COMMUNITY_AI_TRIAGE off until #626 is live.
- 15:30 (Google Play): new public GET /help/delete-account (no login). App "TGP Fitness", developer "The Growth Project". In-app path from mobile #313 (client: profile tab > Settings > Data & Privacy > Delete my account; coach: Settings tab > Privacy & Data > Delete my account). Email route with subject "Delete my account", identity check by account address, never a password. Deleted vs kept and timings from #608/#313 code and the policies (14-day grace + 1 day; no grace on an emailed request; 30-day reply; 45 days for WA consumer health data; Roman 180 days; backups six months). Linked from Privacy Policy, /help nav and overview, shared footer. Ships with #608/#313 (Roman sweep with #601).
- 16:30 (diagnostic): removed every website diagnostic / roadmap mention plus the diagnostic-only collection category and the Perplexity health-data recipient line. Kept the first-milestone Perplexity sentence (src/first-win/first-win.service.ts still calls Perplexity on main). Test: no trust or help page mentions diagnostic/roadmap/quiz (except the crash-report "diagnostic data" category).
- Tests at e5777735: 6 suites / 96 passed (help-delete-account, trust-pages, help-pages, public-pages, invite-landing, roles-enforced); tsc clean; eslint clean on 7 touched files; check-r75 OK. R75 caught banned literals in my new spec's negative regex; moved those checks to help-pages.spec ALL_PAGES instead.
- Owner decisions: (1) the deletion mailbox given by the operator differs from the policies' general support mailbox; recommend keeping both monitored or naming one. (2) Confirm the Play developer name "The Growth Project" (not visible to me). (3) No new response-time commitment invented (existing 30/45 days used).
- Mobile #315: not affected; not touched.
- Fix-round comment posted on #611.
- CI at e5777735: all checks success (build-and-test, rls-floor-guard, rls-live-tests, mwb-3-live-tests, schema parity, banned casts, CodeQL, npm audit, sbom, danger, size-label, test-deploy-readiness); deploy-readiness-gate skipped (expected).
- Worktree /home/user/workspace/wt/b-copy-611 removed.
