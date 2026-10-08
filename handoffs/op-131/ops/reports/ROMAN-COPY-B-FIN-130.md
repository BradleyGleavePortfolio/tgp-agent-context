# ROMAN-COPY-B-FIN-130 — finish Roman backend copy (agent 130)

Status 18:53 PDT 10-07: DONE. b#866 READY posted at head 3555681cf3d9ee784b762a2aaa65ac34930cb505 (CI 17/17 green, CLEAN, MERGEABLE).

## Scope traced
- Row: FIX_PLANS_130_131 section B "ROMAN-COPY-B-FIN-130" (PR (T4), CI, READY) + FINISH-130 + Recon 130 row (shares roman.prompts.ts
  surfaceFraming with COACH-ROMAN-SURFACE-130, r11-seams.spec.ts with b#855; go fast). Source job: JOBS128 CLIENTFIX-128 row
  CF-ROMAN-COPY-B-128 = FW-ROMAN-128:FW-ROMAN-COPY-B-128 (U3 backend + U5 + NEW-5) + owner defaults (fixed eating-disorder reply; no
  re-introduction). Builder report: reports/CF-ROMAN-COPY-B-128.md (HANDOFF: run 5 specs, merge main, PR, CI, READY).
- Branch agent129/cf-roman-copy-b-128: verified head f772b8d7 on GitHub. `git merge origin/main` d6065661 (clean; main had changed no
  src/roman, test/roman, eval or schema file since the branch base fd190078) -> c80e2875. CI type-check then failed on one test-only
  line (below) -> 0bfcb857. Merged main 4c3df677 (b#861 ROMAN-GUARD-129, clean, no shared file) -> 3555681c. No force-push, no stash.
- Code re-read for T4: the controller still runs JwtAuthGuard/RolesGuard/RomanFeatureGuard and getOwnedSession before storing. The
  fallback reads only the caller's user.coach_id (students only). Audit metadata is the closed code only (tested). No model call, no
  spend. PROMPT_VERSION unchanged (it versions ROMAN_GUARDRAIL_CONTRACT, untouched). roman-post-check.ts not edited.
- Overlap: only test/roman/r11-seams.spec.ts with b#855 (different hunks: mine L69-95, b#855 ~L484; b#855's own conflict with main is
  its flags block ~L506).

## Tests (local, heavy.sh, one file at a time; logs reports/ROMAN-COPY-B-FIN-130-*.log)
- Failing first vs main d6065661 source (five src/roman files restored to main in my worktree, then restored from HEAD; no stash):
  roman-copy-b-128 7/7 fail; roman-streaming 5 fail / 31 pass; roman-guardrails 1 fail / 24 pass; r11-seams 1 fail / 21 pass.
- After merge d6065661 (all green): roman-copy-b-128 7, roman-streaming 36, r11-seams 22, roman-guardrails 25, roman.controller 17,
  roman-sse-error-contract 12, roman-guardrails-wiring 11, eval/roman-golden.eval 37, roman-launch-hardening 58, roman-c2-pool 4,
  roman-round2 20, roman.service 51, r11-tool-loop 6, r11-coach-method 11, roman-client-context-injection 4, roman-rmn2-fixes 6,
  memory/roman-client-memory.augmenter 6, roman-chats.controller 26, roman-erasure.sweep 14.
- After merge 4c3df677: roman-post-check-day-claim 21, roman-guardrails-wiring 11, golden eval 37, roman-streaming 36,
  roman-copy-b-128 7, roman-launch-hardening 58.
- CI type-check at c80e2875: `test/roman/roman-streaming.spec.ts(770,7) TS2345 'object' not assignable to 'AuditService'` (untyped
  `fakeOf(audit)`; ts-jest did not flag it). Fix: `fakeOf<AuditService>(audit)` + type import (0bfcb857). A targeted tsc (temp tsconfig in
  /tmp extending the project's, the 6 changed specs + their imports) is clean. CI at 3555681c: 17/17 green.

## B list
None.

## U list (all fixed in b#866)
- U3 backend part (FW-ROMAN-128): coachless clients told about a coach (911 template, eating-disorder hint, client framing).
- U5 (FW-ROMAN-128): "Today tab" does not exist (degraded notice, both context error messages).
- NEW-5 (owner default yes): an eating-disorder message Roman could not answer got only the refusal; now a fixed reply that points to people.
- Owner default: Roman reintroduced himself to a returning client (backend side; mobile m#523 merged).

## C one-liners
- C (edge, deferred to 10k clients): an eating-disorder message hit by a provider failure mid-stream gets the ordinary error, not the fallback.
- C (edge, deferred to 10k clients): the "binge" pattern also matches "binge watching"; the fallback is worded conditionally.
- C (edge, deferred to 10k clients): an eating-disorder-pattern message passes the turn limit like crisis messages already do (no spend; two stored rows + one audit row each).
- C (edge, deferred to 10k clients): on the coach surface a capped coach whose message matches the pattern gets the coachless fallback wording (true, slightly off-audience).

## PRs
- b#866 https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/866 — fix(roman): safety copy assumes no coach, a fixed
  eating-disorder reply when Roman cannot answer, no second introduction (CF-ROMAN-COPY-B, T4).
  Head 3555681cf3d9ee784b762a2aaa65ac34930cb505; 429 changed lines (380+/49-), 11 files (5 src, 6 test); no migration/deps/lockfile.
  CI 17/17 green; mergeStateStatus CLEAN. READY posted 18:53
  (https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/866#issuecomment-6050551679). Verdicts: none yet (not waited for).

## Proposed (needs operator)
1. src/roman/guardrails/roman-post-check.ts (b#861 has merged; lines on main 4c3df677): medicalReplyGap (L768) requires a coach route
   on medical/injury turns, coachName() (L306) falls back to "your coach", templates ~L690-722 assume a coach and say "Today tab" (L722).
   Smallest fix: skip the coach requirement when ctx && !ctx.coach.has_coach, coachless template variants, "Today tab" -> "Home"; then
   make the medical_scope/injury_pain hints in safety-router.ts coach-conditional. Default: one Opus T4 job after b#866 merges
   (safety-router.ts is shared).
2. src/roman/guardrails/roman-guardrail.contract.ts static coach lines: coachless clause after item 1 (bumps PROMPT_VERSION). Default:
   same job as item 1.

## HANDOFF
- PR b#866 open, READY at 3555681cf3d9ee784b762a2aaa65ac34930cb505 (CI green, CLEAN). Branch agent129/cf-roman-copy-b-128 pushed;
  worktree /home/user/workspace/wt/ROMAN-COPY-B-FIN-130-backend is clean at that head (node_modules symlinked to deps/backend).
- Next: the two lenses (Opus + Sol) at that head; any REQUEST CHANGES goes to FIX-OPUS-130 (T4 Roman). If main moves and conflicts,
  `git merge origin/main` on the branch (no rebase/force), re-run test/roman/roman-copy-b-128, roman-streaming and r11-seams.
- After b#866 merges: COACH-ROMAN-SURFACE-130 can start (same surfaceFraming in roman.prompts.ts); b#855 must keep its r11-seams hunk
  (~L484) and resolve its own flags-block conflict; the follow-up job in "Proposed" item 1-2.
- PR body: reports/ROMAN-COPY-B-FIN-130-pr-body.md; READY text: reports/ROMAN-COPY-B-FIN-130-ready-comment.md.
