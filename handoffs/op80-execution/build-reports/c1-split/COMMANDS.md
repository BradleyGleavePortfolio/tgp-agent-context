# C1 split command and exit ledger

All product commands ran only in `/tmp/tgp-op80-c1-split`, with private existing dependencies. [command-ledger.jsonl](command-ledger.jsonl) records exact argv, working directory, sanitized non-secret environment, elapsed time, child exit and unique log per generator/typecheck/lint/test command. [run_step.py](run_step.py) is the evidence-only invocation wrapper. Existing V8 coverage provider was selected explicitly; no dependency/config changes or repeat audit.

The initial C1a test-only red preceded wrapper creation. Its exact invocation was the following under the same sanitized Node20 environment and network-denial preload; child exit1, missing import_intent_id type, 0 executed tests (not behavioral failures):

```text
node node_modules/jest/bin/jest.js --runInBand --passWithNoTests=false --runTestsByPath src/extension-pair/__tests__/durable-intent.spec.ts
```

[Initial red log](C1a-red.log). C1b red is in the command ledger: one missing-session contract failure,48 filtered, then175 passed with zero filtered in final B. [B red](C1b-red-contract.log), [A final](C1a-focused.log), [B final](C1b-focused.log).

## Deterministic local preparation and measurement

```text
python /home/user/workspace/operator80/execution/c1-split/prepare_slices.py a-tests
python /home/user/workspace/operator80/execution/c1-split/prepare_slices.py a-production
# Private generation/type/lint/export twice/focused coverage — exact commands in ledger.
git add -- src/extension-pair prisma/schema.prisma prisma/migrations/20270116000000_add_pair_import_intent scripts/importer-contract.ts test/contracts/importer-contract.spec.ts docs/decisions/2026-09-17-c1-durable-paired-intent.md docs/contracts/importer-openapi.json
git write-tree
git diff --cached --binary --full-index HEAD
python /home/user/workspace/operator80/execution/c1-split/measure_slice.py C1a c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7 404dd55d2fde7ab9fab46fb4ea1d27a9d79a7556
python /home/user/workspace/operator80/execution/c1-split/prepare_slices.py b-tests
python /home/user/workspace/operator80/execution/c1-split/prepare_slices.py b-production
# Independent B private generation/type/lint/export twice/focused coverage in ledger.
git add -- src/extension-pair prisma/schema.prisma prisma/migrations/20270116000000_add_pair_import_intent scripts/importer-contract.ts test/contracts/importer-contract.spec.ts docs/decisions/2026-09-17-c1-durable-paired-intent.md docs/contracts/importer-openapi.json
git write-tree
git diff --binary --full-index 404dd55d2fde7ab9fab46fb4ea1d27a9d79a7556 660e436ecbf911b6984b40ed43d135e3dc308378
git diff --binary --full-index HEAD 660e436ecbf911b6984b40ed43d135e3dc308378
python /home/user/workspace/operator80/execution/c1-split/measure_slice.py C1b 404dd55d2fde7ab9fab46fb4ea1d27a9d79a7556 660e436ecbf911b6984b40ed43d135e3dc308378
node /home/user/workspace/operator80/execution/c1-split/map_frozen_evidence.cjs
```

Measurement uses the exact workflow positive/exclusion pathspecs and added test/source integer gate, without changed definitions. [Measurement script](measure_slice.py), [A gates](C1a-gates.json), [B gates](C1b-gates.json). Mapping reads frozen source/tree objects only; it does not run parent DB work. The mapping log's expected missing durable-session file in A reflects the deliberate A boundary, not a failed final check. [Mapping log](mapping-verification.log).

## Patch reconstruction (no commits)

Alternate indexes `C1a-reconstruction.index`, `sequential.index`, and `cumulative.index` reside in this evidence directory. Each started with `git read-tree HEAD` under its own `GIT_INDEX_FILE`; `git apply --cached` applied A then B relative patch, or the cumulative patch independently; `git write-tree` returned exact recorded trees. No original-clone index or working tree was touched. [Reconstruction result](reconstruction-result.json), [sequential log](sequential-reconstruction.log), [cumulative log](cumulative-reconstruction.log).

Both `git diff --check <base> <tree>` commands exited0; `git diff --exit-code` exited0 at each slice freeze. [A whitespace check](C1a-diff-check.log), [B whitespace check](C1b-diff-check.log). Immutable inputs and dependency hashes were checked before/after without external calls. [Before](unchanged-inputs-before.json), [after](unchanged-inputs-after.json).

No full-suite, DB, install, audit repeat, server/browser, remote query/write, commit or subdelegation command was run. Parent owns independent DB result and recovery integration.
