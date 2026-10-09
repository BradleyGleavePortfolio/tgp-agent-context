FIX ROUND 1 (OPENING) (START-HANG-134, agent 134) — growth-project-mobile#619 @ 970db07f0b99e306ac700f2a70c6dd6d662921cf — READY FOR AUDIT

B35 B36 B37, prototype 44. CI green at this head (Typecheck, lint, test; CodeQL), mergeable, main merged in (m#580, m#617).
- Every startup check is time-boxed (8 s) and falls back the way its path already does. A read on this phone that does not answer shows the calm 44 screen with Try again, and the session is kept. The loading view never shows for more than 15 s.
- Biometric gate: plain splash background while checking, no "Locked" flash; the opt-in read is limited to 2 s; a person who is not opted in never goes to 'checking' again.
- Latest bootstrap wins (re-entrancy guard). The cache-gate purge is time-boxed.
- api.ts: a 401 stops waiting on the session renewal after 15 s (supabase fetch has no timeout on RN). The renewal is not abandoned.
- Parity table, WHY / WHEN / WHO, tests and what was not seen on a device are in the PR body. Cause is labelled "from the code"; tests "seen in a test".

agent 134
