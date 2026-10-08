# ROMAN-GUARD-129 — reply check keeps a correct today figure next to "usual" / "baseline" / "last month" (agent 129)

Status (16:39 PDT): STOPPED by owner/operator 16:35. PR growth-project-backend#861 open @ cf1c41765ea4b14a843b1987331999ffc3fb5088 (152 lines). CI: all checks green except build-and-test still running at 16:38. READY NOT posted.

## Scope traced
- Job: b#846 U1 (reports/LN-OPUS-A-128.md): an accurate today number in a sentence that also mentions "usual", "baseline" or
  "last month" gets Roman's whole reply replaced by the targets paragraph. Keep the guard for wrong numbers.
- Main c3324d4a already has b#849 (R11-T3-FU, merged 14:32): the closest time word inside the number's own clause decides. Left
  open by its own design: a clause with NO time word "follows the sentence (earlier days)" (src/roman/guardrails/roman-post-check.ts
  isPastClaim ~:474, used by kcalFacts ~:370 and macroFacts ~:412). So "You are at 60 g protein, under your usual.",
  "Today you have logged 780 kcal and 60 g protein, both under your usual." and "You burned 2500 kcal, more than your usual."
  are still rewritten on main.
- Fix (pure relaxation of main, never rejects what main accepts): dayClaimOf() returns today / past / either.
  "your normal/usual/typical/baseline" is a comparison, not a day: it never decides another clause, and a number it decides is
  'either'. A clause with no time word follows the last real day named before it (past stays strict: "Yesterday, you logged
  780 kcal" still rewritten); otherwise 'either'. 'either' = today's facts plus earlier days' facts; a figure in neither is
  still rewritten.

## Failing-first
- New spec test/roman/roman-post-check-day-claim.spec.ts on unchanged main c3324d4a: 9 failed / 7 passed (all 9 "accepted"
  shapes red; 7 guard shapes green). Log: ops/reports/ROMAN-GUARD-129-failing-first.log.

## B list
- None.

## U list
- U1 (b#846, this job): fixing.

## C one-liners
- "Compared with last month, you are at 780 kcal" / "Last month you averaged ..., and you're at 780 kcal now": a real day phrase
  before the number with no today word in its clause still decides earlier days. C (edge, deferred to 10k clients)

## Local green (heavy.sh, one file at a time, with the fix)
- new spec 16/16, r11-t3-fu-post-check 16/16, roman-guardrails-rb121 117/117, eval/roman-golden.eval 37/37, roman-c2-rmn3-fixes 28/28,
  roman-guardrails-round2 36/36, roman-launch-hardening 58/58, roman-guardrails 25/25, roman-rmn2-fixes 6/6,
  roman-guardrails-wiring 11/11, r11-tool-loop 6/6. eslint clean on both files.

## PRs
- growth-project-backend#861, branch agent129/roman-guard-129, head cf1c41765ea4b14a843b1987331999ffc3fb5088, 2 files, 152 changed
  lines (129+/23-). Based on c3324d4a; main now fd190078 (#857 email only), merge-tree clean, not re-merged. CI: pending.
  PR body: ops/reports/ROMAN-GUARD-129-pr-body.md.

## Not fixed (needs operator)
- None.

## HANDOFF
- Branch agent129/roman-guard-129, PR growth-project-backend#861, head cf1c41765ea4b14a843b1987331999ffc3fb5088 (pushed; nothing unpushed). 152 lines, 2 files.
- Done: U1 fix (dayClaimOf in src/roman/guardrails/roman-post-check.ts) + failing-first spec (9 red / 7 green on main c3324d4a, 16/16 with fix); 11 targeted suites green locally; eslint clean.
- Left: when build-and-test is green at cf1c4176, post the READY comment (first line `FIX ROUND 1 (OPENING) (ROMAN-GUARD-129, agent 129) — growth-project-backend#861 @ cf1c41765ea4b14a843b1987331999ffc3fb5088 — READY FOR AUDIT`). If it fails, fix in /home/user/workspace/wt/ROMAN-GUARD-129-backend with one push (LEFTHOOK=0).
- Main is fd190078 (#857 email only); merge-tree clean, no re-merge needed.
