# CF-ROMAN-COPY-B-128 — Roman backend copy (agent 129)

Status 16:37 PDT 10-07: STOPPED by operator mail (16:35). Branch agent129/cf-roman-copy-b-128 @ f772b8d743c5478922dd41e5b48f6009bb41f605 (pushed to my own branch, no PR); 11 files changed, 379 insertions(+), 49 deletions(-).

## Scope traced
- Row: FW-ROMAN-128:FW-ROMAN-COPY-B-128 (U3 backend + U5) + owner defaults: (a) a fixed eating-disorder reply when the AI cannot
  answer; (b) Roman does not reintroduce himself to a client he has spoken with before (backend side; mobile greeting is m#523).
- Open backend PRs at start (board 16:09): b#857 (merged since), b#855 (also edits test/roman/r11-seams.spec.ts, other hunk ~L481).
  The reply check src/roman/guardrails/roman-post-check.ts (ROMAN-GUARD-129) is NOT edited. PROMPT_VERSION not bumped (contract unchanged).
- 988 for eating-disorder distress: SAMHSA https://www.samhsa.gov/blog/breaking-silence-what-everyone-should-know-about-eating-disorders

## Done (in f772b8d7)
- safety-router.ts: the 911 template closes with "let someone you trust know what happened" (no coach assumed); the eating-disorder hint
  offers the coach only if client_data shows one; romanEatingDisorderFallback(hasCoach) + reason code eating_disorder_fallback.
- roman.controller.ts: an eating-disorder message refused by the turn limit (429), AI-help consent (403), daily cap (503) or coach pool
  gets the fixed fallback instead (no model call, no Retry-After); every other message keeps every check.
- roman.service.ts (shared file, minimal): streamEatingDisorderFallback (reads only user.coach_id; stored and audited like the 911/988
  templates through one shared fixedSafetyReply); a returning client (earlier live chat with messages) gets ROMAN_MET_BEFORE_LINE.
- roman.prompts.ts / roman-context.errors.ts: Home, Train and Food instead of the non-existent Today tab; client framing assumes no coach.
- Tests: new test/roman/roman-copy-b-128.spec.ts (7) + 5 cases in roman-streaming.spec.ts. Failing first on main: 7/7 and 5/36 fail
  (ops/reports/CF-ROMAN-COPY-B-128-*-before.log). After: copy 7/7, streaming 36/36, guardrails 25/25, r11-seams 22/22 (3 client
  hashes re-pinned, coach hash unchanged), controller 17/17, sse-error-contract 12/12.

## B list
None.

## U list
- U3 (backend part): coachless clients told about a coach (911 template, eating-disorder hint, client framing).
- U5: "Today tab" does not exist (prompt degraded notice, both context error messages).
- NEW-5 (owner yes): an eating-disorder message the AI could not answer got only the refusal.
- Owner default: Roman reintroduced himself to a returning client.

## C one-liners
- C (edge, deferred to 10k clients): an eating-disorder message hit by a provider failure mid-stream gets the ordinary error, not the fallback.
- C (edge, deferred to 10k clients): the "binge" pattern also matches "binge watching"; the fallback is worded conditionally so it stays true.

## PRs
None (stopped before the PR). CI not observed, verdicts none.

## Not fixed (needs operator)
1. src/roman/guardrails/roman-post-check.ts (after ROMAN-GUARD-129 merges): medicalReplyGap (~L727) demands a coach route on medical/
   injury turns and coachName() (~L306) falls back to "your coach"; templates ~L656-688 assume a coach and say "Today tab". Smallest
   fix: skip routesToCoach when ctx && !ctx.coach.has_coach, coachless template variants, "Today tab" -> "Home"; then make the
   medical_scope/injury_pain hints in safety-router.ts coach-conditional.
2. src/roman/guardrails/roman-guardrail.contract.ts L26/L37/L43/L46 static coach lines need a coachless clause after item 1 (bumps PROMPT_VERSION).
- Incident: git stash is shared by every worktree of a repo. At 16:29 my stash and CF-NOTIF-DIGEST-128's crossed (each popped the
  other's). It was swapped back by 16:30:48: my worktree matched my stash 95e3438b byte for byte, and their pushed 7f9409d7 holds only
  their own 12 files. Lanes should not use git stash; use a separate worktree for failing-first runs.

## HANDOFF
- Branch agent129/cf-roman-copy-b-128 @ f772b8d743c5478922dd41e5b48f6009bb41f605 (pushed to my own branch, no PR), based on main fd190078; 11 files changed, 379 insertions(+), 49 deletions(-).
- Done: all row code (U3 backend part, U5, eating-disorder fallback, no re-introduction) with failing-first tests; targeted specs green locally.
- Left: run roman-guardrails-wiring, eval/roman-golden.eval, roman-launch-hardening, roman-c2-pool, roman-round2; git merge origin/main; open
  the PR (T3 header; body notes in this report); CI green; READY line; notify. Operator items 1-2 above wait for ROMAN-GUARD-129.
