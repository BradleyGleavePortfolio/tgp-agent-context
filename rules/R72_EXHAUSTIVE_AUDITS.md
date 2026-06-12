# R72 — AUDITS MUST BE EXHAUSTIVE

**User verbatim (2026-06-12):**

> "AUDITS MUST BE EXHAUSTIVE - FIND AS MANY PROBL;EMS AS POSSIBLE - THERE IS NO \"ENOUGH TO REPORT\""

## Operational meaning
- An auditor NEVER stops at the first blocking finding, never samples, never truncates. It sweeps the ENTIRE diff surface and reports every P0/P1/P2/P3 it can find in one round.
- "I found enough to mark it DIRTY" is forbidden — the goal is that the next fixer round clears EVERYTHING and the re-audit lands CLEAN, minimizing rounds.
- Applies on top of R65 (full 50-failures sweep in severity-pass order) and the general hunt.
- Every audit brief MUST quote this rule.

(Note: requested as "R71" by the user; R71 was already taken by the parallel-PR file-ownership rule, so this is filed as R72 with identical content and force.)
