# Backend Recovery: Parent Verification Checkpoint

## Exact candidate

Current-main input is `c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7`. The complete recovered working-tree patch has SHA256 `e678a85a599b6dd81ab0f3881cc779378a9ab866d05f18b44120aa4d2452b6d4`, and its full candidate tree is `a8908132a9c4882dbe80f9fbc1052532c7e68c3b`.

The default Git index contains intent-to-add entries and yields a different incomplete tree (`842f17f78cb0f2ac2233a2bfd3728a9788b1cd06`). The builder's separate complete index yields the stated full candidate tree; the working-tree patch digest before and after parent testing matches exactly. These are different index states, not evidence that the tested product files drifted.

## Completed tests

| Check | Outcome | Limits |
|---|---|---|
| Parent default full suite | Exit 0; 534 suites passed, 12 skipped; 7,922 tests passed, 159 skipped, 5 todo; 6 snapshots passed | Node20, 4GB heap matching CI configuration; no application DB variables |
| Parent live scout migration/RLS suite | Exit 0; 21 passed, no skips | New disposable loopback PostgreSQL18.6, not exact CI PostgreSQL15 |
| Builder focused suite | 42 suites; 900 passed, 5 skipped | Overlaps full suite; counts must not be added as unique tests |
| Builder doctrine sweep | 15 passed | Bounded doctrine tests |
| Build / typecheck | Exit 0 / 0 | Not a security certificate |
| Lint | Exit 0, 21 warnings | Not warning-clean |
| Protected dunning paths | All three byte hashes unchanged | Rechecked by parent after the full suite |

The full run started at 2026-09-17T18:21:40Z and completed at 18:28:41Z. Saved result JSON and summary record exit 0 and identical before/after patch digests; the outer tool timeout was not a test failure. The earlier default-heap attempt aborted from memory pressure and remains preserved separately rather than erased.

The first disposable live test attempt failed setup because the fresh cluster lacked the `postgres` role expected by the test shim. Adding a NOLOGIN role only in the disposable cluster allowed the unchanged candidate's 21 tests to pass. No production database or customer data was accessed.

## Unresolved landing gates

The actual backend workflow counts test/infra code and measures 1,335 net lines against its 400 limit, although the canonical production-only calculation is 273 additions / 57 deletions. That actual gate remains failed; no test deletion, gate weakening or owner exception has been applied.

The unchanged locked dependency tree reports 14 high and 1 critical vulnerabilities. Exact-head remote CI, required protection alignment, independent dual audits, coverage and exact-CI-engine migration rehearsal remain unproved. Local green tests do not override these blockers.

The recovery candidate is frozen. A separate C1 builder may work on pairing against pinned current main, but parent must reconcile its shared schema/generated-contract changes with this recovery before landing either combined result.
