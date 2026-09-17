# R13 Audit Report — Pagination Fable (Lens B) — importer candidate 093b6b0

Auditor: pagination-fable (subagent `pagination_fable_audit_mu5tuip2`, ledger brief_sha256 `9c1d4bbe06883532bf9daad3d74d88adb5a4a87053e9d971c2a4a05618ede72f` — verified equal to the on-disk brief).
Scope: independent read-only full-diff review, Lens B (tests, contracts, full-diff coverage, process controls). This is NOT a release authorization and NOT the final R14 premerge round.
Report checkpoint: `handoffs/op80-execution/audit-reports/in-progress/pagination-fable-093b6b0.md` (local file only; no commit, no push — publication blocked per brief; R4/R20 remote compliance NOT claimed).
Completed: 2026-09-17T18:06Z.

## BUILD MATRIX

| Repo | Ref | SHA |
|---|---|---|
| backend | HEAD | `c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7` (re-verified locally at report time) |
| context | HEAD at brief time | `d480cd3a9082a40229f1170c675d97e862baa0cc` |
| context | HEAD at report time | `0b1f882e472109b69cac956f01d96e7acb0ad7ba` — one new parent commit (`docs(op80): publish reconstruction plan…`, author/committer Bradley Gleave). `AGENT_RULES.md` diff d480cd3..0b1f882 = 0 lines; the brief file was added verbatim (sha256 unchanged). Disclosed concurrent parent work; not the audited target. |
| importer | main / diff base | `0111be661922234d670bbf23e23d270eec1b4a4e` (local main clean, unchanged throughout) |
| importer | **AUDIT TARGET candidate** | commit `093b6b01c29123361b043ddd0f36cd4c578cffe2`, tree `5a606a476b3e9010cdd277841f400aeed8d00fbf` |
| importer | PR #21 (predecessor evidence only, NOT audit target) | head `fd588bf1db0781b8a8aaa1c241e30f20c96eb79d` / base `0111be6` |
| mobile | HEAD | `a5933fd6de5616493de75f0db907098b149b955c` |
| brief timestamp | | 2026-09-17T17:52:07.708Z |

Drift check (R124): scratch clone `/tmp/tgp-op80-pagination-fable` HEAD/tree verified `093b6b01…` / `5a606a47…` with `git status --porcelain` empty at setup, after dependency install, after every gate/test run, and immediately before writing this report. No drift of the audited tree. Not INFRA_DEATH.

Commit chain base→candidate (7 commits): a4d6dce, c9c11e1, a53af70, fd588bf (PR21 head), cda79e4, 83aaf8f, 093b6b0. All author+committer `Bradley Gleave <bradley@bradleytgpcoaching.com>`; no AI/co-author tokens; none GPG-signed (`%G?` = N for all seven).

## Diff inventory (derived myself, `git diff --numstat 0111be6..093b6b0`)

| File | + | − | Class |
|---|---|---|---|
| background.js | 10 | 1 | prod |
| shared/replay/blueprint.js | 59 | 12 | prod |
| shared/replay/engine.js | 26 | 8 | prod |
| test/replay-array-boundary.spec.js (new) | 104 | 0 | test |
| test/replay-blueprint.spec.js | 340 | 10 | test |
| test/replay-engine.spec.js | 256 | 2 | test |
| test/replay-pagination-outcome.spec.js (new) | 156 | 0 | test |
| **Totals** | **951** | **33** | prod +95/−21 (net +74); test +856/−12 |

test:src added-line ratio = 856 / 95 = **9.011** (floor 2.0). Prod LOC added 95 ≤ 400 cap. No docs, CHANGELOG, types, lockfile, or workflow files changed.

## What the diff does (verified by reading full files at the candidate tree)

- `blueprint.js:203–266` — `isAbsent` helper; `normalizePagination` now throws on PRESENT-but-invalid `style` (not page/cursor), `param` (non-empty string), page `start` (`Number.isSafeInteger`), cursor `nextPath` (validated on the dense snapshot `[...p.nextPath]`, non-empty, every entry non-empty string). `blueprint.js:328–337` `itemsPath` densified and throws on non-array/non-string entries (previously coerced to `[]` = root). `blueprint.js:413` `[...bp.steps]` densifies sparse step arrays so holes hit "blueprint step must be an object" rather than a raw TypeError.
- `engine.js:136` `truncationReasons` Set replaces the `truncated` boolean; `engine.js:258` `query = Object.create(null)` so `__proto__`/`constructor` params survive to the URL; `engine.js:266–272` a repeated URL now adds `pagination_cycle` (previously a silent return that read as complete); `engine.js:346–351` `page_ceiling` when `pageParam+1` leaves the safe range; results (`complete/partial/empty/failed/cancelled`) now carry `truncated: size>0` and `truncationReasons: [...]`.
- `background.js:720–736` `partialDetail` maps each reason to coach-facing copy; `result.truncationReasons ?? ["budget"]` fallback.

## Findings

Severity scale: P0 block / P1 must-fix before merge / P2 should-fix / P3 note. No P0 or P1 found in the diff itself. All P2/P3 below are reproduced against the candidate tree with Node 22.23.2 (`npm exec --yes --package=node@22`) and locked deps (`npm ci --ignore-scripts`).

### F-1 (P2) — Cursor traversal still reports `complete` when the next-cursor token is PRESENT but non-string (numeric/object/empty) — the "stopped without proof of exhaustion" invariant the diff asserts is not closed at the runtime boundary
- File: `shared/replay/engine.js:357–361` (`if (typeof nextCursor !== "string" || nextCursor.length === 0) return; // no further cursor => end of list`). Identical logic exists at base (`0111be6` engine.js:344–346), so this is PRE-EXISTING, but it sits in the exact function whose comments (engine.js:267–269) now promise that halting without proof of exhaustion "must not read as complete", and the same diff rejects malformed `nextPath` DESCRIPTORS at normalization while leaving the malformed runtime TOKEN silently terminal.
- Reproduction (own script, `/tmp/fable-scratch/repro2.mjs`): cursor blueprint `nextPath:["next"]`, source returns `{items:[{id:"a1"}], next: 2, has_more:true}` → result `{status:"complete", pages:1, entities:1, truncationReasons:[]}`. Same for `next: {x:1}` and `next: ""`. Numeric cursors/offsets are a common real-world shape (auto-discovery even keys on `next_page`, docs/AUTO_DISCOVERY.md:54).
- Impact: a coach sees "Import complete" after one page of a multi-page list; the exact defect class (silent partial reported as complete) the commit message claims to "explain".
- Remedy: distinguish absent (`undefined`/`null` → genuine end) from present-but-unusable (`typeof !== "string"` or empty → `truncationReasons.add("cursor_unreadable")` or `degraded = true`), add copy in `partialDetail`, and add tests for numeric/object/empty tokens. Alternatively `String(nextCursor)` for finite numbers with a test pinning the URL.
- Test coverage: none of the four changed test files exercises a non-string present cursor.

### F-2 (P3) — Page-mode shape drift mid-walk reads as `complete`
- File: `shared/replay/blueprint.js:456–461` `extractItems` (non-array → `[]`) combined with `engine.js:339–341` (`items.length === 0 → end of list`). Pre-existing.
- Reproduction: page 1 `{items:[{id:"a"}]}`, page 2 `{items:{id:"b"}}` → `{status:"complete", pages:2, degraded:false, truncationReasons:[]}`. A schema change on page 2 is indistinguishable from an empty terminal page.
- Remedy: when `located !== undefined && !Array.isArray(located)` mark degraded (or a `shape_drift` reason) rather than treating it as the empty terminal page. Add a test.

### F-3 (P3) — Fail-closed doctrine stated in the diff is applied to 4 fields only; other present-but-invalid fields in the same normalizer are still silently coerced, including a WIDENING coercion on budgets
- File: `shared/replay/blueprint.js:203–208` (new doctrine comment: "absent defaults; present-but-invalid throws") versus:
  - `blueprint.js:382–385` `normalizeBudgets.pick`: `budgets:{maxPages:-5, maxEntities:"x"}` → `{maxPages:2000, maxEntities:200000}` (a present, malformed, RESTRICTIVE budget request is silently widened to the default). `maxPages:1e9` → 2000 (silent narrowing, safe direction).
  - `blueprint.js:338/339/355`: `idField:5` → `"id"`, `forEach:7` → `null`, `collectAs:{}` → `null` silently.
  - Cross-style fields silently dropped: `{style:"page", nextPath:5}` → accepted; `{style:"cursor", nextPath:["n"], start:1.5}` → accepted.
  - `param:" "` (whitespace-only) accepted → URL `?+=1` (`isNonEmptyString` does not trim).
- All pre-existing; flagged because the diff introduces the doctrine and the tests (replay-blueprint.spec.js "explicit malformed fails closed") pin it only for style/param/start/nextPath, so a reader would reasonably infer the whole descriptor is fail-closed.
- Remedy: either extend `isAbsent` fail-closed handling to budgets/idField/forEach/collectAs (with tests), or narrow the doctrine comment to "pagination fields". Budget widening is the most material of these.

### F-4 (P3) — `partialDetail` fallback `result.truncationReasons ?? ["budget"]` defends an impossible shape (R65 / R100.42) and is untested
- File: `background.js:725`. Every producer in the tree emits `truncationReasons` (engine.js:402–403, 437); the legacy extractor path (background.js:420–423) builds `{status, counts}` with status only `"empty"|"complete"` and never reaches `partialDetail`. No test exercises the fallback branch (grep of `test/` for a result lacking `truncationReasons` with `truncated:true`: none). The `"incomplete"` fallback at background.js:734 is a legitimate forward-compat guard for a reason string without copy; the `?? ["budget"]` is not.
- Remedy: delete the fallback (`const reasons = result.truncationReasons;`) or, if kept for a persisted/older-result path, add the test that proves the path exists.

### F-5 (P3) — Contract change without documentation update (behavioural break for previously-accepted blueprints; new result field)
- Previously accepted inputs now throw: `itemsPath:["a",2]` (test replay-blueprint.spec.js:98 flipped from `toEqual([])` to `toThrow`), `style:"offset"`, `start:1.5`, `nextPath:Array(1)`, sparse `steps`. Result shape gains `truncationReasons`. `docs/DECISION_V03_AUTONOMOUS_CRAWL.md:112,181–184` still describe the visited-URL set as "cycle/duplicate-page proof" with no mention that a cycle now yields `partial`; no CHANGELOG exists in the repo; `types.d.ts` has no replay result type (so nothing to update there, but nothing documents the field). The commit messages are the only record.
- Remedy: one paragraph in docs/DECISION_V03 (or the C2 doc the blueprint producer will read) stating the fail-closed pagination rules and the `truncationReasons` vocabulary (`budget|pagination_cycle|page_ceiling`), since the untrusted-capture producer (PR-C2) must know what it may emit.

### F-6 (P3, design observation) — Zero and negative page `start` are deliberately preserved and pinned by tests
- `blueprint.js:238–243` accepts any safe integer; tests pin `-3`, `0`, `-1`, `Number.MIN_SAFE_INTEGER` as "valid page descriptors preserved byte-exact" (replay-blueprint.spec.js new "valid descriptors preserved" / "unsafe page starts" blocks; replay-engine.spec.js `keeps start %i advancing by one` for 0 and −2). Reproduced: `start:0` → first request `https://api.test/t?page=0`. Under the diff's own fail-closed doctrine a present `start < 0` is at least as unexecutable as `start: 1.5` for any real API; the builder chose backwards compatibility. Not a defect per se; recorded so the operator can decide, and because the tests now make this a locked-in contract.

### F-7 (P3, test-quality note) — `replay-pagination-outcome.spec.js:129–137` uses `vi.waitFor` with a hard 3000 ms timeout around a real `background.js` import + real engine
- Measured: 168 ms warm, 2298 ms for the first case cold (transform-dominated, outside the waitFor window). Low flake risk on a loaded single-worker CI, not a failure. Consider `vi.waitFor` default with `{ timeout: 10_000 }` or explicit fake timers. No action required.

### No-finding checks performed (recorded so they are not mistaken for omissions)
- Banned-cast tokens (`@ts-ignore`, `as any`, `as unknown as`, `as never`, `.catch(()=>undefined)`, `.catch(()=>null)`, `.catch(()=>{})`, `Coming soon`): added lines matching = 0, removed = 0 → **net 0 per token**. No new `eslint-disable`, `@ts-expect-error`, `@ts-nocheck`. No `.skip/.only/.todo/xit/xdescribe/.fails` in the four test files. No `TODO/FIXME/XXX/HACK/console.log` added.
- Prototype safety: `Object.create(null)` query map verified; test `leaves Object.prototype unpolluted` asserts descriptor equality of `Object.prototype` before/after.
- Bounded diagnostics: `replay-pagination-outcome.spec.js:82,151–153` assert no response body/cursor/source token in `JSON.stringify(result)` or the settlement body.
- `pagination_cycle` A→B→A (not just self-loop) reproduced: `{pages:3, status:"partial", reasons:["pagination_cycle"], entities:3}` — correct.
- `budget` + would-be cycle: budget check precedes fetch so reasons = `["budget"]` only — correct, deterministic.
- `truncationReasons` is a fresh array per result (not the Set), not frozen (callers cannot corrupt engine state).
- Every `it`/`it.each` in the four changed test files carries at least one `expect` (R117/R123) — verified by reading all 856 added lines; `it.each` case tables are non-empty.
- Dedupe/ordering of emitted ids in `__proto__` tests asserts exact URL sequences, not just call counts (R100.17 real assertions).

## Tests and gates run (all under Node 22.23.2, locked deps, scratch clone, one worker)

| Check | Result |
|---|---|
| `npm ci --ignore-scripts` | 133 packages, lockfile honoured |
| `check:banned` | OK (source patterns + origin/main commit identity) |
| `check:loc` | prod_added=95 prod_removed=21 cap=600 (push mode) → OK; also ≤ PR-mode cap 400 |
| `check:ratio` | prod_added=95 test_added=856 ratio=9.011 floor=2 → OK |
| `check:flags` | PAIRING_ENABLED=true → OK |
| `check:fixtures` | scanned=41 violations=0 |
| `check:production-preflight` | STATIC PREFLIGHT CHECKS CLEAR |
| `check:hooks` | OK (98-file set) |
| `lint` (eslint --max-warnings=0) | clean |
| `type-check` (tsc ×2) | clean (in isolated clone; the parent's `pagination-verification.log` shows TYPE_EXIT=2 only because it ran inside the contaminated parent `node_modules` — `string_decoder` duplicate identifiers — not a code defect) |
| `format:check` | OK (7 tracked changed files) |
| `npm audit --audit-level=high` | found 0 vulnerabilities |
| `vitest run --maxWorkers=1` on the 4 changed files | 4 files / 307 tests passed (7.8 s) |
| `vitest run --maxWorkers=1` on consumers: `test/replay-*.spec.js`, `start-import*.spec.js`, `ingest-settlement.spec.js`, `ingest-legacy-settlement.spec.js`, `popup-start-import.spec.js`, `blueprint-*.spec.js` | 22 files / 738 tests passed (74.8 s) |
| Own reproductions `/tmp/fable-scratch/repro.mjs`, `repro2.mjs` | outputs quoted in F-1…F-6 |
| Full suite (49 files) | NOT re-run by me: another auditor's vitest processes were live on this sandbox and the brief forbids simultaneous redundant full suites. Parent evidence `evidence/pagination-verification.log`: 49 files / 1428 tests passed, 169 s — but the log does not print the SHA it ran at; I confirmed `operator80/verify-pagination` is currently at `093b6b0…`/tree `5a606a47…` and clean, which makes the log consistent with the exact head but does not prove it (see Uncertainties). `evidence/isolated-093b6b01….log` = gates only (ISOLATED_GATES_EXIT=0, cap=400 mode), no tests. |

## R100 Checklist (55 rows)

| Rule | Status | Evidence |
|------|--------|----------|
| R100.1  Zero secrets | PASS | diff grep for token/key/secret literals: none; tests use obvious fakes (`test-access`, `private-cursor`) and assert they never leak |
| R100.2  RLS on every table | N/A | browser extension, no DB |
| R100.3  No raw-SQL concat | N/A | no SQL |
| R100.4  No unsanitized output | PASS | popup renders `lastError` via `textContent` (popup/popup.js:54); new copy is static strings + integer count |
| R100.5  IDOR-proof endpoints | N/A | no server endpoints in diff |
| R100.6  Rate limiting auth/paid | N/A | not touched; engine rateLimitMs unchanged |
| R100.7  JWT hygiene | N/A | not touched |
| R100.8  Runtime input validation | PASS (with F-3 note) | `normalizePagination`/`itemsPath`/`steps` runtime-validated and INVOKED by `runReplay` before any fetch (tests assert `fetchJson` not called); doctrine gaps in F-3 |
| R100.9  Role check at data layer | N/A | no roles |
| R100.10 npm audit clean | PASS | `npm audit --audit-level=high` → 0 vulnerabilities |
| R100.11 CORS allowlist | N/A | extension; SSRF allowlist unchanged (`assertSafeApiBase`) |
| R100.12 No internal info in errors | PASS | errors carry step id + rule text only; result/settlement asserted free of body/cursor/token |
| R100.13 HTTPS + HSTS | PASS | `assertSafeApiBase` https-only unchanged |
| R100.14 Layer discipline | PASS | blueprint (contract) ← engine ← background; no reverse import added |
| R100.15 Reusable over specific | PASS | `isAbsent`/`isNonEmptyString` reused across fields; reason→copy mapping in one place |
| R100.16 No new TODO/FIXME | PASS | diff grep TODO/FIXME/XXX/HACK = 0 |
| R100.17 Real test assertions | PASS | every added `it` asserts on URLs/status/reasons/copy/settlement bodies; no existence-only tests |
| R100.18 Env parity | N/A | no env vars touched |
| R100.19 API versioning | N/A | no API routes |
| R100.20 No circular imports | PASS | engine imports blueprint; blueprint imports nothing from engine (verified `rg import shared/replay/blueprint.js`) |
| R100.21 No N+1 | N/A | no DB |
| R100.22 Indexes on FK/hot WHERE | N/A | no DB |
| R100.23 Pagination on lists | PASS | this diff hardens pagination bounds; budgets unchanged |
| R100.24 No event-loop blocking | PASS | no `*Sync` in prod diff |
| R100.25 Caching stable data | N/A | not applicable |
| R100.26 Media compress + CDN | N/A | none |
| R100.27 No polling for real-time | N/A | none added |
| R100.28 RMW under lock/transaction | N/A | in-memory single run; `importInFlight` single-flight unchanged |
| R100.29 Idempotency on payments | N/A | none |
| R100.30 Optimistic rollback | N/A | no FE state mutation added |
| R100.31 Hook deps correct | N/A | no React |
| R100.32 Cleanup on unmount | N/A | no React |
| R100.33 Error boundaries / filter | PASS | normalization throw propagates to `handleStartImport` catch → `settleFailed` + `ingest_failed` broadcast (background.js:684–698); asserted indirectly by existing start-import tests (738 passing) |
| R100.34 Structured logging | PASS | no `console.log` added; existing `logNetworkEvent` untouched |
| R100.35 Timeouts on external calls | PASS | `requestTimeoutMs` budget unchanged |
| R100.36 No swallowed errors | PASS | no new catch blocks; banned `.catch(()=>…)` net 0 |
| R100.37 /health endpoint | N/A | extension |
| R100.38 Comments explain WHY | PASS | new comments explain the `__proto__`, sparse-hole, and 2^53 mechanics; one over-broad doctrine comment (F-3) |
| R100.39 YAGNI patterns | PASS | no interfaces/abstractions added |
| R100.40 Same-bug-everywhere | FAIL (P2/P3) | F-1/F-2: the "halt ≠ complete" fix was applied to the visited-URL and page-ceiling halts but not to the non-string-cursor halt (engine.js:357–361) or the non-array-items halt (blueprint.js:459); F-3 same asymmetry in the normalizer |
| R100.41 No reimplementing libs | PASS | none |
| R100.42 No phantom-bug defenses | FAIL (P3) | F-4 `background.js:725` `?? ["budget"]` defends a result shape no producer emits |
| R100.43 Zero dead code | PASS (with F-4) | eslint `no-unused-vars` clean; `vi` import in replay-blueprint.spec.js is used (`vi.fn`); fallback branch in F-4 is unreachable but not "unused" to the linter |
| R100.44 Multi-table writes in txn | N/A | no DB |
| R100.45 Soft deletes | N/A | no DB |
| R100.46 DB-layer constraints | N/A | no DB |
| R100.47 PITR + recovery runbook | N/A | operator-level, out of scope |
| R100.48 CI/CD enforced | UNVERIFIED | `.github/workflows/ci.yml` + `codeql.yml` exist and cover the gates I ran; there is NO PR and no remote run for exact head `093b6b0`; branch protection cannot be read from this sandbox (no remote mutations/reads authorized beyond local clone) |
| R100.49 Dev-only excluded prod | PASS | `check:fixtures` scanned=41 violations=0 |
| R100.50 Graceful degradation | PASS | partial/degraded outcomes settle and broadcast with reason copy (tested end-to-end in replay-pagination-outcome.spec.js) |
| R100.A1 Test:src ≥ 2.0 | PASS | 856 / 95 = 9.011 (my numstat and `check:ratio` agree) |
| R100.A2 Banned-cast net = 0 | PASS | per token: `@ts-ignore` 0/0, `as any` 0/0, `as unknown as` 0/0, `as never` 0/0, `.catch(()=>undefined)` 0/0, `.catch(()=>null)` 0/0, `.catch(()=>{})` 0/0, `Coming soon` 0/0 → net 0 each |
| R100.A3 ≤ 400 prod LOC | PASS | prod added 95 (background 10, blueprint 59, engine 26); net +74 |
| R100.A4 CI pass rate ≥ 75% | UNVERIFIED | no remote CI history accessible from sandbox; no run exists for this head |
| R100.A5 Verdict line present | PASS | ends with `VERDICT: FINDINGS` |

## R109–R126 Checklist

| Rule | Status | Evidence |
|---|---|---|
| R109 No Half-Ass (outcome #3: every user-visible path yields real value or an actionable error) | PASS with F-1/F-2 | New malformed-descriptor paths throw a step-scoped actionable message before any request; cycle/ceiling produce coach-facing copy in popup (`lastError`), notification ("finished incomplete — check the popup."), and backend `error_summary` (asserted end-to-end). Residual silent-complete paths in F-1/F-2 are pre-existing |
| R110 Secrets scanning pre-commit + CI | FAIL (repo-wide, pre-existing, not introduced by diff) | no gitleaks/trufflehog/secretlint in `lefthook.yml`, `ci.yml`, `codeql.yml`, or package.json (`rg -i gitleaks|trufflehog|secretlint` → none) |
| R111 No unused imports/locals | PASS | eslint `--max-warnings=0` clean; tsc clean |
| R112 Strict typing teeth | PASS | JS with `tsc -p jsconfig.json` checkJs; no `any`/`unknown` escape tokens added (A2) |
| R113 CVE thresholds block CI | PASS | `npm audit --audit-level=high` step in ci.yml; local run 0 vulns |
| R114 No floating versions | PASS | all 8 devDependencies exact-pinned; `@types/chrome 0.2.9` documented exception; lockfile unchanged by diff |
| R115 SBOM per build | FAIL (repo-wide, pre-existing) | no SBOM/cyclonedx step in any workflow |
| R116 Minimum test coverage | PASS (diff-scoped) | every new prod branch has a behavioural test: style/param/start/nextPath rejection, sparse steps/itemsPath, `__proto__`/`constructor`/`toString`/`valueOf` params, cycle→partial, MAX_SAFE_INTEGER ceiling, background copy ×3 reasons. Uncovered: F-4 fallback branch (unreachable) |
| R117 Every test has explicit assertions | PASS | read all 856 added test lines; each `it`/`it.each` body contains `expect` |
| R118 SAST scanning required | PARTIAL/UNVERIFIED | `codeql.yml` with `security-and-quality` + local SARIF gate exists; no CodeQL run exists for exact head (no PR, no push of this SHA observed) |
| R119 Cryptographic standards | N/A | no crypto touched |
| R120 IaC security scanning | N/A | no IaC in repo |
| R121 Git SHA embedded in artifact | FAIL (repo-wide, pre-existing) | `manifest.json` carries `version 0.3.0` / `version_name 0.3.0-rc.1` only; no SHA embedding step |
| R122 Branch protection / peer review | UNVERIFIED | cannot read GitHub settings from sandbox; no PR exists for `093b6b0` (PR #21 head `fd588bf` is a predecessor only) |
| R123 Assertion-bearing tests only | PASS | no `.skip/.only/.todo`, no empty bodies |
| R124 Reproducibility: exact SHAs | PASS | BUILD MATRIX above; drift checks before/after; base/candidate/tree SHAs recorded |
| R125 Defense in depth (3 enforcers) | PARTIAL | banned/LOC/ratio/lint/type/format have pre-commit (lefthook) + CI + auditor; secrets/SBOM/SHA-embed have zero enforcers (R110/R115/R121) |
| R126 Telemetry as contract (ledger) | PASS (dispatch side) | `dispatch-ledger.jsonl` has `before_dispatch` and `launched` rows for `pagination-fable` with brief sha256 matching the on-disk brief; `actual_verdict: PENDING` — the parent must write the completion row; publication `blocked; local checkpoint only` honestly recorded |

## Outstanding machine/process gates (independent of code findings — NOT satisfied by this review)

1. No PR exists on candidate `093b6b0`; PR #21 (`fd588bf`) is predecessor evidence only.
2. No remote CI run, CodeQL run, or `npm audit` in CI observed for exact head `093b6b0`; local equivalents pass but are not the R48/R118 control.
3. Branch protection / peer-review enforcement (R122) unverifiable from this sandbox.
4. Repo-wide pre-existing enforcement gaps: no secrets scanner (R110), no SBOM (R115), no SHA embedding (R121). Not introduced by this diff; listed so a partial review is not mistaken for release-CLEAN.
5. Full-suite evidence is the parent's log only; SHA provenance of that log is inferred, not printed (see Uncertainties).
6. Dispatch ledger completion row for this audit not yet written (parent action).
7. This checkpoint is local only; no commit/push under any identity was made (R4/R20 remote compliance NOT claimed).

## Uncertainties

- `evidence/pagination-verification.log` (49 files / 1428 passed) does not print the commit it ran at; `operator80/verify-pagination` is at `093b6b0`/`5a606a47` and clean now, making it consistent with the exact head, but I could not prove the log was produced at that state. I did not re-run the full suite because another auditor's vitest workers were live and the brief forbids simultaneous redundant full suites; my 22-file/738-test consumer run plus the 4-file/307-test focused run cover every file that imports the changed modules.
- Context repo moved `d480cd3 → 0b1f882` during the audit (parent's disclosed concurrent docs commit). `AGENT_RULES.md` unchanged; brief unchanged. Treated as disclosed, not as R124 drift of the audited target.
- Seven candidate commits are unsigned (`%G?`=N); I did not find a rule in AGENT_RULES.md mandating signatures, so this is recorded as an observation only.
- F-1/F-2/F-3 are pre-existing behaviours. Severity is assigned on the basis that the diff's own stated invariant and commit message ("explain pagination truncation") make their omission a same-bug-everywhere (R100.40) gap rather than on their novelty.

## Verdict rationale

Code diff is small, bounded (95 prod LOC, ratio 9.0), banned-cast net 0, identity-clean, all local gates and 1,045 focused/consumer tests pass, and every newly added branch is behaviourally tested with real assertions. It is not CLEAN because (a) P2 F-1 leaves a silent-complete traversal path in the very function the change claims to make honest, (b) P3 F-2..F-5 (asymmetric doctrine, phantom fallback, undocumented contract break), and (c) machine/process gates for the exact head (PR, remote CI/CodeQL, branch protection, ledger completion) are outstanding and repo-wide R110/R115/R121 enforcers are absent. No P0/P1. Not a merge authorization.


## Appendix — repro evidence (preserved; scripts at /tmp/fable-scratch/repro.mjs and repro2.mjs, run with `npm exec --yes --package=node@22 -- node <file>` from the scratch clone)

Key outputs (verbatim):
```
start:-1 normalize => {"style":"page","param":"page","start":-1}
start:0 URLs => {"urls":["https://api.test/t?page=0"],"status":"empty"}
idField:5 coerce => "id"
forEach:7 => null
collectAs:{} => null
budgets maxPages:-5 => {"maxPages":2000,"maxPagesPerStep":1000,"maxEntities":200000,"requestTimeoutMs":15000}
budgets maxPages:1e9 => {"maxPages":2000,...}
page with nextPath => {"style":"page","param":"page","start":1}
cursor with start:1.5 => {"style":"cursor","param":"cursor","nextPath":["n"]}
param:' ' => {"style":"page","param":" ","start":1}
cursor next numeric => {"urls":["https://api.test/t"],"status":"complete","reasons":[]}
cursor next object => {"urls":["https://api.test/t"],"status":"complete","reasons":[]}
cursor next empty string => {"urls":["https://api.test/t"],"status":"complete","reasons":[]}
cursor cycle A->B->A => {"pages":3,"status":"partial","reasons":["pagination_cycle"],"entities":3}
budget+cycle => {"pages":2,"status":"partial","reasons":["budget"]}
result keys complete => ["status","pages","entities","counts","truncated","truncationReasons","degraded","lastSkipStatus"]
page shape-drift => {"status":"complete","pages":2,"degraded":false,"reasons":[]}
cursor numeric next => {"status":"complete","pages":1,"entities":1,"reasons":[]}
```
Final drift check at close: scratch HEAD 093b6b01c29123361b043ddd0f36cd4c578cffe2, tree 5a606a476b3e9010cdd277841f400aeed8d00fbf, worktree clean; importer main 0111be6 unchanged; context HEAD 0b1f882e (parent-published docs; d480cd3 still reachable, AGENT_RULES.md unchanged).

VERDICT: FINDINGS
