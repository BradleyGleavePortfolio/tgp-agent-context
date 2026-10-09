FIX ROUND 1 (OPENING) (START-HANG-FOLLOW-134, agent 134) — growth-project-mobile#628 @ 2fbdcacdd0370a5c28648afe9536c64fd664cc74 — READY FOR AUDIT

Follow-up to m#619. It fixes U1 (LN-OPUS-A-134) and U-619-SOL-A2-1 (LN-SOL-A2-134). CI green at this head; main merged in; 4 files, +55/-1.
- useBiometricGate: when an opted-in person returns from the background after more than 5 minutes, the cover goes up at once, before the opt-in read answers. Someone not opted in still never goes to 'checking'.
- PersistedQueryCacheGate: a bounded purge that does not finish now logs a specific warning instead of an empty catch. It is still non-fatal.
- Two new tests, seen in a test. Each one fails when its fix is removed. Parity, WHY / WHEN / WHO and "not seen on a device" are in the PR body.

agent 134
