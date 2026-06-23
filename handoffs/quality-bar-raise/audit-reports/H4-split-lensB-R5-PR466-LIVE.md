# H4 Split R5 — Lens B LIVE Audit — PR #466 (H4.F auto-flipper)

- Lens: B — breadth / tests / contracts / PR hygiene
- Repo: `BradleyGleavePortfolio/growth-project-backend`
- PR: `#466`
- Audited head: `c624492e8c24870f76ced2c82764e0c18ff13cd6`
- Base checked: `main = 8467c6f568a51337a7acbfb14f72ac85b996d605`
- Audit time: `2026-06-23T22:47:03Z`
- Verdict: CLEAN

## Build matrix / R124 pin

```bash
cd /home/user/workspace/growth-project-backend
git log -1 --format=%H pr466
# c624492e8c24870f76ced2c82764e0c18ff13cd6

git log -1 --format=%H main
# 8467c6f568a51337a7acbfb14f72ac85b996d605
```

Result: BUILD MATRIX PASS. The audited PR head exactly matches the recorded target SHA.

## Scope actually swept

The binding brief listed the H4.F files as `test/prod-readiness/auto-flipper.ts` and `test/prod-readiness/auto-flipper.spec.ts`. I still read the full `git diff main..pr466` line-by-line; because this branch is stacked, that full diff also contains prior H4.A file removals/replacements and the added `test/prod-readiness/redactor.spec.ts`. The H4.F-only stacked-base diff from `868000088fab1fc5929e02291bec4d4928e99aaf..pr466` is limited to:

```text
A test/prod-readiness/auto-flipper.spec.ts
A test/prod-readiness/auto-flipper.ts
A test/prod-readiness/redactor.spec.ts
```

No finding is filed on the stacked-diff shape; I audited both the actual `main..pr466` diff and the H4.F high-risk secret-mutating surfaces.

## Prior R4 finding closure

- R4 Lens B F001 / Lens A YAML block-scalar leak: CLOSED. The redactor now recognizes full YAML block scalar style/chomping/indent grammar via `YAML_BLOCK_SCALAR_VALUE_RE = /^([|>])(?:([+-])([1-9])?|([1-9])([+-])?)?$/`, preserves scalar headers through the inline YAML pass, and redacts continuation bodies in `redactYamlBlockScalars`.
- R4 Lens B F002 FLY_BIN stat-identity gap: CLOSED. `assertFlyBinUnchanged()` re-resolves the canonical binary before every `execFileSync`, recaptures `dev`, `ino`, `mtimeNs`, `size`, and `mode`, and fail-closes on any identity mismatch.

## Findings

None.

## Lens B breadth checks

### Exported symbols / contracts

`auto-flipper.ts` exports the public plan/commit/flip contract, the result/audit types, redaction helpers, and several explicitly named `__...ForTest` helpers for FLY_BIN cache/fs injection. I found no export that changes production reachability outside the `test/prod-readiness` package. The broader helper surface is test-support oriented and does not mutate the default filesystem adapter in production.

### Regex review

All load-bearing regexes reviewed for anchoring, backtracking shape, and newline behavior:

- Registry env names are anchored in `RegistryRowSchema` as `/^[A-Z][A-Z0-9_]*$/`, which excludes whitespace/newline names in the normal production path.
- YAML block scalar value/header regexes are anchored and bounded; chomping/indent variants in either YAML-legal order are handled.
- Secret-key hint and structured redaction regexes have no nested unbounded quantifier pattern that would create an obvious ReDoS issue in this context.
- Literal secret values are escaped before dynamic RegExp construction via `escapeRegExp(literal).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')` in the source implementation.

### Comparisons / conversions

- `autoFlipEnabled(env)` uses the exact string comparison `env.READINESS_AUTO_FLIP === 'true'`; `True`, `TRUE`, `1`, `yes`, and trailing-space variants are dry-run/refused rather than normalized.
- FLY_BIN identity comparison uses BigInt-normalized fields, avoiding Number-vs-BigInt mismatch at identity checks.
- Plan target comparisons use canonical string values `'true'` and `'false'`; non-canonical Fly values such as `'1'` are treated as stale.

### Secret leakage / error paths

Every secret-bearing path I found routes through a value-aware redactor before reaching logs/results:

- `runFlyctl()` uses `execFileSync(FLY_BIN, [...args], ...)` with no shell, a 60s timeout, and `SIGTERM` kill signal.
- `flyErrorMessage()` redacts stderr and Error.message, seeded with the literal value side of every `KEY=VALUE` argv pair.
- `commit()` seeds `collectSecretValues(plan)` with target and observed values, then wraps the single sink as `rawLog(redactSecretValues(line, allSecretValues))`.
- Recheck failures are caught, redacted, recorded per row, and do not abort the whole commit.
- Registry-load errors preserve only redacted `RegistryParseError` text or an allowlisted/safe cause name for unknown errors.

No path was found that JSON-stringifies or logs an object containing an unredacted secret value.

### jsonl audit trail

The successful set audit entry schema is stable: `operator`, `action`, `key`, `before`, `after`, `timestamp`. Skip/force rows use fixed `action`, `key`, `reason`, `timestamp` fields. Timestamps come from `Date.toISOString()` and therefore are UTC ISO-8601 with `Z`. Normal row names are newline-safe through `RegistryRowSchema`; a forged in-process `FlipPlan` is outside the validated registry path, noted below as a hardening consideration but not filed as a PR-blocking finding.

### KEY=*** logging convention

The human operator log uses `flyctl secrets set ${row.name}=*** --app <prod>` and all lines pass through the central redacting sink. No `console.log`, `console.error`, or `console.info` bypass exists in `auto-flipper.ts`; the only direct console use is the one-time `console.warn` default for an unset `FLY_BIN` in non-strict environments.

### child_process mock surface

`auto-flipper.ts` has a single `import { execFileSync } from 'node:child_process'` and a single call site. The spec uses `jest.mock('node:child_process', () => ({ execFileSync: jest.fn() }))` plus `jest.mocked(execFileSync)`. With the repo's ts-jest/CommonJS config, this covers the direct import; I found no alternate child_process import path or unmocked call site in the PR files.

### FlipPlan / FlipResult guards

The production path is `registry-loader` schema validation -> `plan()` -> `commit()` / `flip()`. `RegistryRowSchema` rejects malformed names, `validateRegistry()` rejects `MUST_SET + auto_flip_on_in_prod`, and `plan()` only adds rows to `to_set` when `targetValueFor(row)` returns `'true'` or `'false'`. A manually forged in-process `FlipPlan` can still bypass those compile-time types because `commit()` trusts its `CommitOptions.plan`; I did not file this as a finding because the audited production path constructs the plan from the validated registry, the module lives under `test/prod-readiness`, and no external/API boundary feeds `commit()` directly in this PR. It remains a reasonable future hardening target if this helper becomes a broader library surface.

### commit() precondition and dry-run safety

Direct `commit()` refuses unless `READINESS_AUTO_FLIP` is exactly `'true'`. `flip()` is stricter: it commits only when the env gate is exact and the API opts in with `commit === true` or `dryRun === false`; either control alone returns a dry run.

### FLY_BIN filesystem injection / defaults

The injectable `FlyBinFs` surface is used for tests. The default fs adapter is module-local and not exported. Explicit non-default `FLY_BIN` paths must be absolute, resolved, regular files, executable, and then identity-pinned. Strict environments reject the bare `flyctl` default; non-strict environments emit a one-time warning before using PATH.

### Spec quality sweep

Focused Jest execution after isolated dependency install:

```text
PASS test/prod-readiness/auto-flipper.spec.ts
PASS test/prod-readiness/redactor.spec.ts
Test Suites: 2 passed, 2 total
Tests:       185 passed, 185 total
```

The suite has real coverage for the R4 closures, redaction wiring, exact env gate, timeout behavior, flyctl mock, FLY_BIN identity checks, and dry-run/commit split. Three non-blocking test-strength notes I verified as real assertions, not vacuous tests:

1. `auto-flipper.spec.ts:315-324` checks that a failure does not emit `SECRET_Z=true`, but the injected error only includes the key name and never includes the value, so this individual case would pass even if value-based runner-error redaction were removed. Later tests with `FAKE_SECRET` cover the real value-leak case.
2. `auto-flipper.spec.ts:374-379` checks `auditEntry()` operator/action/after/timestamp but not `key` or `before`, so that one unit case would pass if those fields were accidentally omitted. The structured audit log integration test at `auto-flipper.spec.ts:329-343` covers the full object.
3. `auto-flipper.spec.ts:1148-1181` checks `maxInflight === 1` with a synchronous runner, so the overlap counter itself is weak. The subsequent order test at `auto-flipper.spec.ts:1184+` is the stronger serialization assertion and would catch a missing mutex.

These are not findings because stronger neighboring tests cover the corresponding contracts.

### R75 banned-token grep

Added-lines-only grep is clean for the R75 banned set:

```text
@ts-ignore: 0
as any: 0
as unknown as: 0
as never: 0
.catch(() => undefined/null/{}): 0
Coming soon: 0
lorem ipsum: 0
John Doe: 0
foo@bar.com: 0
```

Full `main..pr466` diff hits for `.catch(()=>undefined)`, `Coming soon`, `lorem ipsum`, `John Doe`, and `foo@bar.com` are removals from stacked/deleted files only; there are zero net additions.

### Cross-file imports

The only production import from this prod-readiness suite in the H4.F implementation is `./registry-loader` from `auto-flipper.ts`. Tests import the implementation and registry-loader for fixtures. I found no cross-import to deleted H4.A files or unrelated product code.

## Commands / artifacts saved locally

- Full diff saved at `/home/user/workspace/audit_briefs/H4_PR466_R5_full_diff.patch`.
- PR file snapshots saved under `/home/user/workspace/audit_briefs/pr466_files/`.
- Isolated PR worktree used for test execution at `/home/user/workspace/audit_briefs/pr466_worktree`.

CLEAN
