# Next Backend Slice: Safe Import Diagnostics

## Current split verification checkpoint

The formatter-compliant repair is frozen as two mandatory sequential slices, not one cap-exceeding PR. D1 tree `410ac3a7f7a8a62d7f00081c525b760786fd2eef` has348 actual workflow net lines,55 source additions and300 test additions (density5.455), with46 native diagnostics cases. D2 tree `ad166457d90b45c26a992881059ac98ce66accec` adds93 net lines and no production code, bringing the final diagnostics count to77. All original85 test lines and all70 authored cases remain; D2 is not optional.

As of22:30 UTC, all seven allocated D1 commands have exited0: diagnostics, seven adjacent suites, strict-owned types, repository types, scoped ESLint, doctrine and formatter check. D2 diagnostics passed77; its remaining serial sequence is underway. Final restoration/integrity and complete self-check remain pending, and no full suite or independent release review has yet been allocated to these split trees.

At22:31 UTC, D2's remaining commands also exited0 and the environment returned unchanged. Parent independently read the exact native counts: D1=46 diagnostics /115 adjacent /15 doctrine; D2=77 /115 /15, with no selected skips/todos, plus the four non-Jest gates on each tree. Both staged trees remain exact. Complete self-check/reporting and full-suite acceptance are still pending, and an upstream dependency audit counterexample is prioritized before a new downstream full run.

The reviewed evidence-only runner exclusively moves the parent's private dependency directory from publication to D1, then D2, then back. It checks original producer independence, full entry/hash/mode/link identity, source/index/ref pins and confined runtime outputs. The adjacent contract test performs its own cold-process generation; generated artifact invariance must be established. Any failure stops the sequence and restores the directory rather than permitting source repair or an automatic retry.

The earlier333-line unformatted repair became441 net lines after formatting. The previous332/490 figures below describe an earlier source-preparation state, not the final formatted split. Dependency158 plus final diagnostics441 is599 net lines cumulatively; stacking and reviewing ancestor-relative deltas does not erase that cumulative size.

## Historical preparation and reproduced repair

## Bounded verification allocated; full-suite and release gates remain closed

The dependency producer is source-frozen at `b2bb1666a91d60927d3ee1d6455ce687ce1c8739` and has completed its corrected full suite with 7,857 passed tests and disclosed inherited skips/todo. Its fresh audit reports zero vulnerabilities. Parent released its writer and execution ownership and created an independent clone with that exact staged tree. After importer acceptance stopped on scanner dependency vulnerabilities, diagnostics received the sole bounded regression slot with privately hash-verified dependencies and the vetted cooperative HTTP guard. Any dependency correction stops the downstream lane for explicit re-pinning.

Executed RED reproduced 21 public-text leaks with all three ordinary 4xx controls passing. A one-condition filter repair then passed all 24 public regression/control cases; the complete diagnostics run was 76 passed and one newly authored test-harness failure, not all-green. Parent authorized a narrow correction of the non-redefinable Sentry namespace spy target with every assertion preserved, followed by focused diagnostics, adjacent consumers and bounded gates. No full suite, independent review or release acceptance is authorized or claimed yet.

The prepared diagnostics slice is 332 workflow net lines and the dependency slice is 158; their 490-line combination fails the cap. Publish them as separate sequential PRs, not by dropping tests or changing exclusions.

Reuse the recovery's diagnostics work instead of rebuilding the full 27-file patch. The input is conditional and not release-accepted; full acceptance remains blocked until the exact dependency result and the diagnostics lane's own tests are complete. See `cycle3-diagnostics-builder-brief.md` for the complete matrix and ownership boundary.

Four recovered paths from tree `a8908132a9c4882dbe80f9fbc1052532c7e68c3b`, relative to backend base `c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7`:

- `src/filters/http-exception.filter.ts`
- `src/observability/orm-diagnostics.ts`
- `src/observability/sentry-config.ts`
- `test/scout/scout-diagnostics.integrity.spec.ts`

Existing grouping: 133 workflow net lines, 54 source additions and 85 test additions, density 1.574. It is not ready merely because it is small. Add meaningful missing behavior assertions; never pad the ratio or drop the original 85 test lines.

## Exact review and test obligations

Preserve ORM payload removal before logging/capture, independently sanitized Sentry envelopes, useful ordinary diagnostics, existing public error shape and request correlation. Cover all supported ORM error classes, allowed/disallowed Prisma error-code shapes, a nested ORM cause, cyclic non-ORM causes, and unchanged primitive/non-error inputs.

Exercise both Sentry detection paths: original exception causes and serialized exception type without an original exception. Assert the complete permitted output envelope and absence of request bodies, query arguments, user/context/extras, breadcrumbs and frame locals; verify ordinary events retain intended behavior while sensitive headers are removed.

Investigate a concrete static concern before accepting the recovered filter unchanged: it sanitizes `diagnostic`, but still reads the original `HttpException` response before building the client envelope. Reproduce whether an HTTP exception wrapping an ORM cause can carry ORM-derived text into its public message. Preserve legitimate 4xx messages, arrays and machine-readable codes; repair the actual unsafe case without blanking every useful client error.

Existing regression consumers include `test/http-exception.filter.spec.ts`, both Sentry configuration suites, dark-route/not-found envelope tests, and the real local HTTP public-listing envelope tests. Include the full doctrine sweep and one exact-final-tree suite only when allocated. Local synthetic HTTP listeners are not customer services; a network-isolation runner must support those test-owned listeners while still blocking databases and external calls.

## Exclusions and acceptance

No schema/migration, reconstruction writer, input validation, dependency, contract version, feature flag or mobile/extension edits belong in this slice. Preserve the three dunning files and every original recovery input. The future writer must prove both actual and canonical size/density, red/green behavior, source/input integrity and full self-checks before publication and independent review.

This queue record allocates the bounded verification described above. Passing individual public regressions is not a completed diagnostics acceptance result or audit approval.
