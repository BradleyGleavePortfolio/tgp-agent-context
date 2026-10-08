FIX ROUND 2 (ROMAN-GUARD-129, agent 129, FIX-OPUS-129) — growth-project-backend#861 @ c3f69a8ad87d55473611893963fc74ebacc359c0 — READY FOR AUDIT

Fixed:
- B-861-SOL-129-1 (Sol 6049691114): "Yesterday, you logged your usual 780 kcal" was accepted against today's 780. The time word closest to the number decided the day, and "your usual" ('either') sat closer than "Yesterday". The fix is in `src/roman/guardrails/roman-post-check.ts:497-502` (`dayClaimOf`):
  - A real day word in the number's clause now decides first (line 497).
  - If the clause also names an earlier day, it is judged against earlier days (line 501): "Yesterday you logged your usual 780 kcal".
  - If the client's normal is the only time word, the clause follows the last day named before it, as a clause with no time word already did. "Yesterday, you logged your usual 780 kcal" now follows "Yesterday".

  Failing first: `test/roman/roman-post-check-day-claim.spec.ts:77-79` adds three cases that the reply check must still rewrite (comma and one-clause kcal, plus "Yesterday you logged your usual 60 g protein"). With the cf1c4176 source, all three fail (3 of 21 fail); with the fix, the file passes 21/21. Two new accepted guards at lines 62-63 pass before and after: "Yesterday you logged 1,850 kcal, over your usual 1,500." and "Today you are under your usual 1,500 kcal."

On "honor preceding Yesterday/Today": I honoured Yesterday fully. For Today I kept 'either' on purpose, and the evidence is below.
- When the clause holds today's own word ("Today you are under your usual 1,500 kcal"), the number next to "your usual" is the usual figure, which is an earlier-day fact. Judging it against today alone would rewrite a true reply that main accepts.
- The same holds when "Today" is named in an earlier clause ("Today, you are at 60 g protein, under your usual 110 g"). That is the shape this PR exists to stop rewriting.
- The case "Today, you logged your usual 1,850 kcal" is still accepted, as it is on main (a local probe at c3f69a8a accepts "Today, you are at 60 g protein, under your usual 110 g." and "Today, you logged your usual 1,850 kcal.") (main's closest-word rule picks "your usual", which counts as an earlier day). This is not a regression. C (edge, deferred to 10k clients): telling "logged your usual N" from "under your usual N" needs the verb, not the day word.

Local targeted runs at c3f69a8a (heavy.sh, one file each):

| Spec | Result |
|---|---|
| roman-post-check-day-claim | 21/21 |
| r11-t3-fu-post-check | 16/16 |
| roman-c2-rmn3-fixes | 28/28 |
| roman-guardrails-rb121 | 117/117 |
| roman-guardrails-round2 | 36/36 |
| roman-guardrails-wiring | 11/11 |
| roman-guardrails | 25/25 |
| roman-launch-hardening | 58/58 |
| roman-rmn2-fixes | 6/6 |
| roman-round2 | 20/20 |
| eval/roman-golden.eval | 37/37 |

CI at this head: CI_STATE. Size: 2 files, +142/−23 = 165 lines. The merge with main is clean.

agent 129
