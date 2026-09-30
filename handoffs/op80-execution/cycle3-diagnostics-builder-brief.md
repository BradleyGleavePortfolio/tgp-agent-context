# Backend diagnostics: isolated regression-first builder

## BUILD MATRIX

- backend HEAD: c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7
- backend dependency input tree: b2bb1666a91d60927d3ee1d6455ce687ce1c8739
- ctxrepo HEAD: ad2259c0649e4e53a663a2600343da1a08ac8b35
- importer PR #21 head: fc7fdf6e50df08cccad86da37c8b0f15f4b72e81
- importer PR #21 base (origin/main): 0111be661922234d670bbf23e23d270eec1b4a4e
- mobile HEAD: a5933fd6de5616493de75f0db907098b149b955c
- recovered diagnostics reference tree: a8908132a9c4882dbe80f9fbc1052532c7e68c3b
- timestamp (ISO 8601 UTC): 2026-09-17T21:35:03Z

## Goal and input status

Recover the smallest useful diagnostics slice, preventing ORM query/customer payloads from reaching logs, Sentry or public error text while preserving ordinary client errors and request correlation. The dependency producer is now source-frozen and verification-only in another clone. Its graph/SBOM, safety controls and 13 suites/151 tests passed; its corrected full suite remains pending. This is a conditional build basis, not an accepted release.

Read the complete canonical rules and first-principles addendum in immutable `/tmp/tgp-op80-cycle2-inputs/context/AGENT_RULES.md`. Read your exact `DISPATCH_MATRIX.json`, the preserved diagnostics delta and four source files before changes. Report actual model as inherited/unverified, not verified Astra. You are an implementer, never an independent auditor or release approver.

## Exclusive files and repositories

Your sole writable product clone is `/tmp/tgp-op80-cycle3-diagnostics`; your evidence directory is `/home/user/workspace/operator80/execution/diagnostics/`. Parent has staged the unchanged dependency input tree b2bb in this clone with HEAD c23. Parent-only publications remain outside your ownership.

Own only:

- `src/filters/http-exception.filter.ts`
- `src/observability/orm-diagnostics.ts`
- `src/observability/sentry-config.ts`
- `test/scout/scout-diagnostics.integrity.spec.ts`

Preserve all three dependency paths exactly, all three dunning files, and every unrelated input. Never write the producer clone, original recovery clone, bare composition objects, importer, mobile, context input or parent publication repo. No shared writable dependency tree, cache, test result, database, port or generated client exists for this lane.

No commits, ref movement, remote reads/writes, package/tool installs, SQL, credential access, source account, browser, feature flags, schema, input validation, reconstruction writer, generated contract, dependency changes or subdelegation. If the parent replaces the dependency basis, stop and preserve work rather than silently rebasing or accepting old proof.

## Current phase: source and red-test preparation only

No test, lint, typecheck, build, generator, install, scanner, database or heavy execution is allocated yet. The dependency verifier owns that slot. Read source and prepare meaningful failing regression tests first. Do not make a new production repair before executing and preserving its red proof after allocation.

The existing recovered four-path delta may be applied as a baseline reconstruction, not called a new verified fix. Preserve its 85 existing test lines/assertions and all behavior; add assertions rather than replace or weaken them. The reference grouping is 133 actual workflow net lines, 54 source additions and 85 test additions (density 1.574), so it needs real missing tests, not filler.

Prioritize the concrete static concern: the filter sanitizes the captured diagnostic but still reads an original `HttpException.getResponse()` even if its cause is an ORM error. Construct real Nest HTTP exceptions with real Prisma errors in `cause`, including string/object/array messages and a synthetic marker in message/error/code payloads. Prove the original inherited filter can expose ORM-derived public text, then repair only that unsafe branch. Preserve legitimate non-ORM 4xx strings, arrays, machine-readable codes, status and envelope keys.

Also cover actual supported Prisma error classes/name matching, allowed versus malformed code shapes, nested and cyclic causes, primitive/non-error inputs, useful ordinary errors, correlation tags, logging paths and both Sentry detection routes (original exception and serialized exception type). Assert complete permitted Sentry output and absence of original query arguments, bodies, headers, extra/context/user data, breadcrumbs and frame locals. Do not invent impossible threats or blank every ordinary error to make a marker disappear.

Source-only checkpoint must name exact test cases prepared, any required scope change, input integrity and readiness for a bounded red/green slot. Return that checkpoint promptly; do not wait silently or generate Office documents.

## Later verification, only after parent allocation

Use a private copied/hash-verified dependency environment, never a symlink/hardlink to the verifier's node_modules. Parent will allocate copying and a vetted evidence-only local HTTP guard. First run bounded red tests; only after reproduced failure make the minimal production fix, then run focused green and adjacent consumers.

Include existing HTTP filter, both Sentry configuration suites, dark/not-found envelope contracts and the actual local-HTTP public-listing consumer as relevant. Type/lint/format, full doctrine sweep, actual/canonical size and density, banned-token net zero and one exact-final-tree full suite require their own bounded allocation. Do not borrow original recovery or dependency test results as proof for your changed tree.

Actual backend size gate includes tests, migrations, scripts and CI and must stay within 400 net counted lines. R74 density denominator is added src TS/JS; calculate the actual workflow ratio separately. Preserve meaningful assertions if the cap fails; stop for a coherent split rather than hide lines, skip tests or change exclusions.

## Final handoff

After allocated execution, provide exact base/input/output matrix, input-relative and cumulative patches with reconstruction hashes, before/after integrity, full red/green command/environment/exit logs, all 55 R100 rows and 18 R109–R126 rows, inherited findings and new findings separately, and an honest final verdict. No CLEAN independent-audit, published-head or end-to-end importer claim is available to this worker.

## Parent R138 concurrency decision

Question and delete the unnecessary source-preparation wait, not the test or ownership gates. The prior worker has no remaining source-edit authority and its pinned clone is untouched; this lane owns four different paths in a separate clone and has no execution slot. This applies isolated-candidate/promotion discipline from the previously reviewed AWS continuous-delivery guidance. It gains useful preparation while containing the risk of a pending dependency result. Stop and re-pin if that basis changes; no production merge or activation follows from this amendment.
