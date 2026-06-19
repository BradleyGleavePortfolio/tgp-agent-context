# H4.F FIXER R1 — PR #466 (auto-flipper) — Lens B findings closed

## BUILD MATRIX
- main HEAD (rebase target): 8467c6f568a51337a7acbfb14f72ac85b996d605
- branch base pre-work (PR #466 head): 2a58c17990f0690fb4d176baee56772bb9474002
- branch: wave-h4f-auto-flipper
- final head SHA: de43a17bae9cfb49ae2029aece79a17709986421
- PR number: #466
- files changed: test/prod-readiness/auto-flipper.ts, test/prod-readiness/auto-flipper.spec.ts
- net prod LOC (excluding test/lockfile/data): 0  (both files live under `test/**` → R23/R76 LOC-EXEMPT)
- net test LOC: spec +392/-56, source(.ts) +161/-21
- test:src ratio (spec adds / source adds): 392 / 161 = 2.43  (R74 ≥ 2.0 ✓)
- snapshot branches pushed:
  - wip/h4f-fixer-snapshot-20260619T160202Z   (R6 pre-work)
  - wip/h4f-fixer-snapshot-prepush-20260619T164929Z   (R6 pre-push)
- CI status at exit: ALL GREEN — 10/10 checks pass (R100 ✓)
- mergeability: MERGEABLE / mergeStateStatus CLEAN (no rebase required)
- R3 identity check: PASS — author AND committer = Bradley Gleave <bradley@bradleytgpcoaching.com>; zero banned identity tokens (CI `no-ai-tokens` + `banned-cast-tokens` both pass)
- R75 banned-tokens check: PASS — no `@ts-ignore`/`as any`/`as unknown as`/`as never`/banned `.catch` in added lines (local sweep + CI A2 pass)
- timestamp UTC: 2026-06-19T17:05Z

### CI checks (10/10 pass)
| check | result |
|---|---|
| Banned cast tokens (R75 / R100.A2) | pass |
| Test density (R100.A1) | pass |
| LOC budget (R100.A3) | pass |
| build-and-test | pass |
| CodeQL JS/TS | pass |
| danger | pass |
| mwb-3-live-tests | pass |
| rls-floor-guard | pass |
| rls-live-tests | pass |
| size-label | pass |

## FINDINGS CLOSED

### Finding 1 — MAJOR (SECRET LEAK): `flyErrorMessage` returned raw stderr; values leaked via `result.failed[i].error`
- Added `redactSecretValues(text)` utility: replaces `\b([A-Z][A-Z0-9_]*)\s*=\s*[^\s'"]+` → `$1=***`, plus a quoted-form pass `(['"])([A-Z][A-Z0-9_]*)\s*=\s*[^'"]*\1` → `$1$2=***$1` (handles `'KEY=VALUE'`, `"KEY=VALUE"`, `--secret KEY=VALUE`, and spaces around `=`).
- **Design decision (deviation noted):** the value is collapsed **wholesale** to `***`. The brief's test note mentioned "truncated to length 8 then `***`"; I deliberately retain **zero** characters of the secret, since even a short prefix of a real secret is a leak. This is the more secure interpretation and is asserted by a probe ("drops the entire value (no prefix retained) even for long secrets").
- Applied redaction at every value-bearing path:
  - `flyErrorMessage` — both the stderr branch and the `err.message` branch run through `redactSecretValues` before returning.
  - `commit` catch block — `failed.push({ row, error: redactSecretValues(raw) })` (defence-in-depth so even a custom runner that echoes a `KEY=VALUE` cannot leak).
  - `runFlyctl` timeout error — built only from non-`KEY=VALUE` argv verbs, then redacted (`flyArgvContext`).
- Audit jsonl (`auditEntry`) re-confirmed: fields are operator/action/key/before/after/timestamp — **no value field**. Console: there is **no** `console.*` anywhere in the module; logging is via the injected `LogSink` and only emits `KEY=***`, the key-name-only audit/skip/force lines, and a static no-recheck warning.

### Finding 2 — MAJOR: `execFileSync` had no timeout (flyctl could hang forever)
- Added `{ timeout: 60_000, killSignal: 'SIGTERM' }` (exported `FLY_TIMEOUT_MS = 60_000`).
- New `FlyctlTimeoutError` (proper `instanceof Error`, `name = 'FlyctlTimeoutError'`).
- `isTimeout(err)` detects all shapes: `err.signal === 'SIGTERM'`, `err.killed === true`, `err.code === 'ETIMEDOUT'`.
- Timeout error message is built from secret-free subcommand verbs only (`flyArgvContext` filters out any `KEY=...` argv element and re-redacts) — verified by a probe.
- A timeout from the default runner is surfaced through `commit` as a redacted `failed` entry (not a thrown error) — probe asserts `res.failed[0].error` matches `/timed out/` and does NOT contain the value.

### Finding 3 — MAJOR: Plan/commit TOCTOU (commit didn't re-check Fly state before each set)
- `PlannedRow` now carries `was: string | undefined` (the current Fly value observed at plan time).
- `CommitOptions` gains optional `recheckCurrent(key) => Promise<string|undefined>` and `force?: boolean`.
- `commit` is now `async`; immediately before each set, if `recheckCurrent` is provided it re-reads the live value. If `live !== was`:
  - default → row is `skipped` with reason `"current state changed since plan"`, audit-logged as `action:"skip"` (key only, no value).
  - `force: true` → set proceeds, audit-logged as `action:"force"` (key only, no value).
- Backward compatible: when `recheckCurrent` is omitted, behaviour is unchanged but a single secret-free warning line is logged (`"no recheckCurrent configured …"`).
- `FlipResult` gains a `skipped: CommitSkippedFlip[]` array. `flip()` is now `async` and awaits `commit`.
- Probes cover: match→proceeds, drift→skipped, force→overrides, missing→missing match, appeared→skip, per-key independence in multi-row, and audit-log of skip/force decisions.

## Secret-hygiene sweep (every potential leak path, with redaction confirmation)
Source file `test/prod-readiness/auto-flipper.ts` — every line that logs, throws, or carries a value, traced:

| # | line | construct | secret risk → mitigation |
|---|---|---|---|
| 1 | `throw new Error(... not found on PATH ...)` | ENOENT | only `FLY_BIN` + docs URL constants — **no value** |
| 2 | `throw new FlyctlTimeoutError(... flyArgvContext(args) ...)` | timeout | `flyArgvContext` drops any `KEY=...` argv element AND re-redacts — **no value** (probe-verified) |
| 3 | `throw new Error(flyErrorMessage(err))` | flyctl failure | `flyErrorMessage` redacts stderr + message — **redacted** |
| 4 | `throw new Error(refusing to commit ...)` | gate | static + env-flag name — **no value** |
| 5 | `log('warning: no recheckCurrent configured ...')` | warning | static string — **no value** |
| 6 | `log(JSON.stringify({ ...key: row.name, reason ... }))` ×2 (skip/force) | TOCTOU audit | operator/action/**key**/reason/timestamp — **no value** (probe-verified) |
| 7 | `` log(`flyctl secrets set ${row.name}=*** --app <prod>`) `` | operator log | hardcoded `***`, key only — **no value** |
| 8 | `log(JSON.stringify(auditEntry(...)))` | success audit | `AuditEntry` has no value field — **no value** |
| 9 | `failed.push({ row, error: redactSecretValues(raw) })` | failure capture | **redacted** — closes the original `result.failed[i].error` leak |
| 10 | `throw new RegistryParseError(\`... ${err.message}\`)` | registry-load | registry-structure parse error, not a flyctl/secret path — **no value** |

Additional confirmations:
- `console.*` in source: **NONE**.
- The secret value (`target`) is interpolated into a string at exactly **one** place — `run(['secrets','set', \`${row.name}=${target}\`])` — i.e. passed to flyctl over **argv only**, never logged/thrown.
- `was` / `live` (current Fly values) are **never** interpolated into any string.
- The test file intentionally contains `FEATURE_SECRET=true` literals — these are inputs to redaction probes that assert the value is stripped; they are never emitted at runtime.
- R75 sweep on added lines: CLEAN. R3 sweep on added lines: CLEAN.

## STEPS TAKEN
- Cloned to /tmp/gpb-f-fix, set R3 identity, checked out wave-h4f-auto-flipper (head matched brief `2a58c179`), pushed R6 init snapshot.
- Applied all three fixes to auto-flipper.ts; rewrote/extended the spec (made existing commit/flip tests async; added 32 new probes → 82 tests total).
- Verified scoped `tsc` exit 0, eslint --max-warnings 0 clean, prettier clean, R75/R3 sweeps clean, 82/82 tests pass.
- Performed the hard secret-hygiene sweep (grep + manual trace of every value path) above.
- Committed (all lefthook gates incl. full `tsc`, banned-cast, no-ai-tokens passed), pushed R6 pre-push snapshot + branch.
- Waited and confirmed CI 10/10 green; PR is MERGEABLE / CLEAN — no rebase on main required.

## DECISIONS & DEVIATIONS
- Redaction collapses the value entirely to `***` (no 8-char prefix) — the more secure reading of the brief; documented and probe-asserted.
- Repo test framework is **Jest** (not Vitest as the generic common-doctrine states); specs written for Jest accordingly.
- `commit`/`flip` became `async` to honour the `Promise`-returning `recheckCurrent` contract; all call sites and tests updated. Public `FlipResult` gained a `skipped[]` field.
- Used a throwaway scoped tsconfig for local fast type-checking only (memory-constrained sandbox makes full-project `tsc` OOM); it was NOT committed. The committed code passed the full-project `tsc` lefthook gate and CI build-and-test.

## OPEN ITEMS
- None. All three findings closed, CI 10/10, branch mergeable.

VERDICT: FIXED
