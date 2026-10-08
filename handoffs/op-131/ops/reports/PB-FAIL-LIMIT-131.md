# PB-FAIL-LIMIT-131 (Claude Opus 5.5, builder, T4 Roman money; operator agent 131, restart 22:45 PDT)

Status: DONE. b#879 READY posted 23:11 PDT at ffbc61a3790dc39dc038302fbef848af928c430e, CI green, mergeable with main 21598a39.

## Scope traced
- Entry: JOBS131.md restart section, Builders row PB-FAIL-LIMIT-131. Owner decision D7 (YES at 20:54): the playbook's 6-hour limit counts charged failed attempts.
- `src/roman/playbook/playbook-builder.service.ts` on main 21598a39: the only time guard was `builtTooRecently(active.built_at)` at :176. A charged `model_error` (:222-227: an error without an HTTP status settles the worst case), `invalid_draft` (:236) or `empty_draft` (:238: both settled with real tokens as outcome 'ok' before validation) left no active row, so the next run (the boot run 3 min after each deploy, and the `0 */6 * * *` UTC cron) reserved and paid again from the coach's pool. FEATURE_ROMAN_PLAYBOOK is on in production since 21:18 PDT.
- Ledger: `RomanBackgroundSpendService.reserve` (`src/roman/background/roman-background-spend.ts:153-168`) already writes one AiRequestAudit row per playbook reservation (capability `roman.playbook`, `requester_id` = head coach, `created_at`, token counts); `settle` (:199-206) replaces the tokens (0 for consent refused / HTTP error). So no migration was needed.

## Fix (b#879)
- `buildFor` (:188): after the `unchanged` digest check and the built_at check, before `spend.reserve`, `chargedTooRecently(head, now)` returns `too_recent`.
- `chargedTooRecently` (:293-313): `aiRequestAudit.findFirst` where capability `roman.playbook`, `requester_id` = head, `created_at > now - 6h`, `prompt_token_estimate > 0 OR response_token_estimate > 0`, newest first (index `[requester_id, created_at]`).
- Anchor (`attemptRunAt` :72-80; both settles, :226 and :236, now store `run_at: now.toISOString()`): the 6 hours count from the start of the run that made the attempt, the same clock as built_at. Without it, a coach reached minutes into a run would be skipped by the next 6-hourly run (failing coaches and changed playbooks would wait 12 h, because the success row counts too). A row without run_at (never settled, or written before the deploy) counts from created_at.
- Scheduler comment updated (`playbook-builder.scheduler.ts:4-7`).

## Evidence
- Failing-first (tests at this head, service of main 21598a39, local heavy.sh): 4 failed / 12 passed. Key failure: charged `model_error`, then a run 3 min later: Expected "too_recent", Received "model_error" (a second paid attempt). The other 3: two settle expectations now include run_at, plus the unchanged-digest spec's ledger-read count.
- At head ffbc61a3: `test/roman/r11-playbook-builder.spec.ts` 16/16 pass locally; ESLint clean on the 3 files.
- Mutation: anchoring on created_at only (ignoring run_at) fails 2 specs (Expected "model_error"/"built", Received "too_recent" at the next 6-hourly run with a 3-minute in-run lag). Restored from the commit.
- Tests cover: charged failure x3 kinds (3 min / 1 h / 5 h 59 min -> too_recent, no reserve, no call; 6 h -> reserves again; exact query pinned); 0-charge (consent refused, HTTP 529) does not block a run 1 h later; unchanged digest stays `unchanged` with no ledger read; changed playbook still rebuilt at 6 h; flag off: buildFor reads nothing.
- CI at ffbc61a3 (run 37735327039 and the rest): all 16 checks SUCCESS (deploy-readiness-gate SKIPPED as usual): build-and-test, CodeQL, mwb-3-live-tests, rls-live-tests, community-live-tests, schema parity, banned casts, danger, npm audit, sbom, size-label, rls-floor-guard, test-deploy-readiness, comment-deploy-readiness.

## B list
- none open.

## U list
- none.

## C one-liners
- C (edge, deferred to 10k clients): pre-deploy ledger rows carry no run_at, so for the first 6 hours after the deploy they count from their reserve time (a coach reached minutes into a pre-deploy run may wait one extra run).
- C (edge, deferred to 10k clients): two machines on the same cron can both attempt one coach (unchanged from b#867; one machine in production; the 10 USD/day ceiling bounds it).
- C: a coach inside the 6 hours still has its sources read each run (reads only, as today).

## PRs
- growth-project-backend#879 https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/879, branch agent131/pb-fail-limit-131, head ffbc61a3790dc39dc038302fbef848af928c430e, 3 files, 136+/13- = 149 lines, CI green, mergeable. READY comment 6053603057 (23:11 PDT). Verdicts: none yet (builder ends after READY per _COMMON R4 / item 8).

## Proposed (needs operator)
- none.

## HANDOFF
- Done: b#879 open at ffbc61a3 with READY FOR AUDIT posted (first line exact format). CI green, no conflict with main 21598a39. Commit identity Bradley Gleave, LEFTHOOK=0, no AI trailer.
- Next (lenses, then operator): an Opus and a Sol lens at ffbc61a3. T4 money path, so dual approval at the exact head. No migration, no flag or env change, so after merge it needs only the normal deploy. FEATURE_ROMAN_PLAYBOOK is already on in production, so until this deploys, every boot run and 6-hourly run still pays again for a coach whose last charged attempt failed.
- Merge order: no open backend PR (b#870, b#871, b#872, b#877, b#878) touches src/roman/playbook, src/roman/background or the builder spec (checked 23:12 PDT).
- If a lens asks for changes: worktree /home/user/workspace/wt/PB-FAIL-LIMIT-131-backend (branch agent131/pb-fail-limit-131, node_modules linked). Local proof: `cd <worktree> && /home/user/workspace/ops/heavy.sh npx jest test/roman/r11-playbook-builder.spec.ts`. PR body source: /home/user/workspace/ops/reports/PB-FAIL-LIMIT-131-pr-body.md; READY text: /home/user/workspace/ops/reports/PB-FAIL-LIMIT-131-ready.md.
- Notify: /home/user/workspace/ops/lanes131/notify/PB-FAIL-LIMIT-131.txt.
