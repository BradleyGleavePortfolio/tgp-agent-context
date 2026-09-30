# C1 commands and exits

Working directory for every product command: `/tmp/tgp-op80-c1-build`. Existing private dependencies only; Node `/usr/local/bin/node` reports v20.20.1. No install/audit/DB/full-suite command was run.

## Sanitized invocation environment
Final tools used `env -i PATH=/usr/local/bin:/usr/bin:/bin HOME=/tmp/tgp-op80-c1-build TMPDIR=/tmp/tgp-op80-c1-build/.tmp CI=true NODE_ENV=test`.

Typecheck also set `NODE_OPTIONS=--max-old-space-size=4096`. Contract generation and final focused checks set `NODE_OPTIONS='--max-old-space-size=4096 --require=/home/user/workspace/operator80/execution/c1/local-only-guard.cjs'`. This guard denies Node socket/fetch calls; it is evidence only and absent from the product patch. Earlier sanitized baseline checks used default temporary cache before TMPDIR was explicitly set. Private `.cache/`/`.tmp/` are deliberately not staged or deleted.

## Final commands (prefix each Node command with the sanitized environment above)

```text
node node_modules/typescript/bin/tsc --noEmit
node node_modules/eslint/bin/eslint.js --max-warnings=0 scripts/importer-contract.ts src/extension-pair/extension-pair.controller.ts src/extension-pair/extension-pair.dto.ts src/extension-pair/extension-pair.service.ts src/extension-pair/__tests__/extension-pair.service.spec.ts src/extension-pair/__tests__/durable-intent.spec.ts src/extension-pair/__tests__/durable-session.spec.ts test/contracts/importer-contract.spec.ts
node node_modules/ts-node/dist/bin.js scripts/export-importer-contract.ts
IMPORTER_CONTRACT_OUT=/home/user/workspace/operator80/execution/c1/importer-openapi-second.json node node_modules/ts-node/dist/bin.js scripts/export-importer-contract.ts
cmp docs/contracts/importer-openapi.json /home/user/workspace/operator80/execution/c1/importer-openapi-second.json
node node_modules/jest/bin/jest.js --runInBand --passWithNoTests=false --runTestsByPath test/contracts/importer-contract.spec.ts
node node_modules/jest/bin/jest.js --runInBand --passWithNoTests=false --testPathPatterns='src/extension-pair|test/contracts/importer-contract.spec.ts' --coverage --coverageProvider=v8 --collectCoverageFrom=src/extension-pair/extension-pair.service.ts --collectCoverageFrom=src/extension-pair/extension-pair.controller.ts --collectCoverageFrom=src/extension-pair/extension-pair.dto.ts --collectCoverageFrom=scripts/importer-contract.ts --coverageReporters=json --coverageReporters=text --coverageDirectory=/home/user/workspace/operator80/execution/c1/coverage-final
```

Every command above exited 0; final focused run is 10 suites / 175 tests, zero skipped. The complete importer contract suite is a focused 49-test suite, NOT the repository full suite. Its existing cold subprocess test invokes the generator again with a scratch output path. [Final test log](final-focused.log), [typecheck](typecheck.log), [scoped lint](scoped-lint.log), [generator first](contract-generation-1.log), [generator second](contract-generation-2.log), [determinism](contract-determinism.log), [contract suite](green-contract-complete.log).

Explicit private Prisma generation (once at baseline, once against candidate schema) used sanitized environment plus `PRISMA_HIDE_UPDATE_MESSAGE=1 CHECKPOINT_DISABLE=1`:

```text
node node_modules/prisma/build/index.js generate --schema=prisma/schema.prisma
```

Both exited 0; this generates a client, NOT a migration/database operation. [Baseline](baseline.log), [candidate generation](prisma-candidate.log).

## Iteration history (child exits, not outer log-capture shell status)

| Log | Command/test scope | Child exit | Outcome |
|---|---|---:|---|
| baseline.log | Explicit original-schema generation; 7 pre-existing pairing suites one-worker | 0 | 99 tests passed |
| red-issuance.log | New durable-intent spec against original production | 1 | 7 failures / 2 passes; missing persisted/echoed UUID and owner checks |
| red-session.log | New durable-session spec before implementation | 1 | TypeScript missing DTO/method failure; not counted as behavior failures |
| prisma-candidate.log | Explicit generation against changed schema | 0 | Prisma 6.19.3 generated |
| green-pairing-1.log | Pairing subtree one-worker | 1 | ACTIVE_COACH role-array type error; corrected with satisfies Prisma.UserWhereInput |
| green-pairing-2.log | Pairing subtree one-worker | 0 | 121 tests passed at intermediate candidate |
| red-no-store.log | Durable-session spec | 1 | 1 failed / 14 passed; expected missing response header |
| red-contract.log | Contract test filtered to durable session and intent echoes | 1 | 1 failed / 1 passed / 47 filtered; session UUID incorrectly optional |
| green-pairing-3.log | Pairing subtree one-worker | 0 | 126 tests passed |
| green-contract-targeted.log | Same two contract assertions | 1 | Inherited Swagger required:false still survived property override |
| green-contract-targeted-2.log | Same assertions after required:true metadata fix | 0 | 2 passed / 47 filtered; filtering is not a source skip |
| green-pairing-coverage.log | Pairing subtree with default Babel coverage | 1 | Inherited minimatch instrumentation TypeError; not a product assertion failure |
| green-pairing-coverage-v8.log | Same pairing scope with installed V8 coverage provider | 0 | 126 tests passed, 99.41% lines across pairing production files |
| typecheck.log | Strict tsc --noEmit | 0 | No diagnostics |
| scoped-lint.log | Exactly changed TS files, --max-warnings=0 | 0 | No diagnostics |
| contract-generation-1.log | Existing authoritative exporter | 0 | 12 paths / 29 schemas |
| contract-generation-2.log | Same exporter to evidence scratch | 0 | Byte-identical output |
| contract-determinism.log | cmp plus SHA256 | 0 | Exact matching bytes/hash |
| green-contract-complete.log | Entire focused importer-contract spec | 0 | 49 tests passed, including fresh subprocess |
| final-focused.log | Bounded pairing+contract scopes, V8 coverage | 0 | 175 tests passed; 98.95% total lines |
| diff-check-final.log | git diff --cached HEAD --check | 0 | No whitespace errors |
| unstaged-check.log | git diff --exit-code | 0 | No unstaged tracked changes |
| patch-reconstruction.log | Read base into alternate index; apply complete patch; write-tree | 0 | Exact final tree reproduced |

Historical focused Jest invocations used `node node_modules/jest/bin/jest.js --runInBand --passWithNoTests=false`, selecting the named spec/subtree; contract red/targeted runs used `--runTestsByPath test/contracts/importer-contract.spec.ts --testNamePattern='durable session|intent echoes'`. No `--forceExit`, source quarantine/skip addition, weakened assertion or dependency workaround was used. [All iteration logs](BUILD_REPORT.md).

## Exact patch/tree and final static checks

```text
git add -- src/extension-pair prisma/schema.prisma prisma/migrations/20270116000000_add_pair_import_intent scripts/importer-contract.ts test/contracts/importer-contract.spec.ts docs/decisions/2026-09-17-c1-durable-paired-intent.md docs/contracts/importer-openapi.json
git write-tree
git diff --cached --binary --full-index HEAD
git diff --cached --numstat HEAD
git diff --cached --name-only HEAD
git diff --cached HEAD --check
git diff --exit-code
GIT_INDEX_FILE=/home/user/workspace/operator80/execution/c1/reconstruction.index git read-tree HEAD
GIT_INDEX_FILE=/home/user/workspace/operator80/execution/c1/reconstruction.index git apply --cached /home/user/workspace/operator80/execution/c1/C1_FINAL.patch
GIT_INDEX_FILE=/home/user/workspace/operator80/execution/c1/reconstruction.index git write-tree
python /home/user/workspace/operator80/execution/c1/verify_final.py
```

Outputs and exact pathspec measurements are in [static-checks-final.json](static-checks-final.json), [unchanged-base-final.json](unchanged-base-final.json), [diff-coverage-final.json](diff-coverage-final.json), and [verify_final.py](verify_final.py). No commit is needed to reconstruct this tree, and no evidence/cache path is part of the product patch.
