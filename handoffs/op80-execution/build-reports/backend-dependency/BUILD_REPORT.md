# Backend dependency remediation — final build findings

## BUILD MATRIX
- backend HEAD: c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7
- ctxrepo HEAD: ad2259c0649e4e53a663a2600343da1a08ac8b35
- importer PR #21 head: fc7fdf6e50df08cccad86da37c8b0f15f4b72e81
- importer PR #21 base (origin/main): 0111be661922234d670bbf23e23d270eec1b4a4e
- mobile HEAD: a5933fd6de5616493de75f0db907098b149b955c
- timestamp (ISO 8601 UTC): 2026-09-17T20:09:07Z

## Decision and exact deliverable

**Implemented and locally verified; final verdict FINDINGS.** Full audit improved from26 findings (14high/1critical/9moderate/2low) to0 at every severity, including dev dependencies. Corrected full suite on exact frozen candidate passed531 suites and7857 tests;159 pre-existing skips,5todos and12skipped suites remain disclosed. Independent/remote/legacy-control gates are not claimed repaired. [Before audit](before-audit.json), [final audit](frozen-audit.log), [corrected full suite](corrected-full-suite.log).

**Frozen tree:** `b2bb1666a91d60927d3ee1d6455ce687ce1c8739`
**Base:** `c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7`
**Full-index binary patch:** `corrected-candidate.patch`
**SHA256:** `ff504dfd7f87c8c1b1777f04a1e2b4faf9a420f3770b4df6f8b56f5f53a5645a`
Alternate-index replay from the pinned base reconstructs exactly that tree. Only package.json, package-lock.json and158-line test/dependency-compatibility.spec.ts differ; final index/working bytes match. [Freeze/reconstruction](corrected-freeze.json), [patch](corrected-candidate.patch), [final identity](FINAL_IDENTITY.json).

**All source-writer, install, generator, type/build, network-audit and test resources released.** No further product edits or verification runs planned; parent alone owns publication and subsequent diagnostics work. [Release resources](RELEASE_RESOURCES.json), [source-release checkpoint](CHECKPOINT-14-FULL-GREEN-SOURCE-RELEASED.md).

## Scope, rules and model disclosure

The entire pinned canonical AGENT_RULES, autonomy addendum, preserved backend recovery and C1 findings were read before edits. The brief's explicit exclusions control over generic engineering-skill examples: no production code, product schema/migrations, importer generator/JSON, CI/flags, feature activation, DB, remote writes, commits, GitHub calls or subdelegation. Public npm package/advisory/install operations were authorized; local synthetic HTTP fixtures were separately approved with narrow ownership controls. [Brief](file:///home/user/workspace/operator80/repos/context/handoffs/op80-execution/cycle2-dependency-builder-brief.md), [initial checkpoint](CHECKPOINT-01.md), [HTTP approval design](CHECKPOINT-08-HARNESS-PROPOSAL.md).

Requested Astra is inherited from parent at inherited performance; actual runtime model identity is not independently verified. This is a builder self-check, not independent review, release readiness, a C1 freeze or an operator waiver. [Brief model requirement](file:///home/user/workspace/operator80/repos/context/handoffs/op80-execution/cycle2-dependency-builder-brief.md).

## Smallest honest remediation selected

All55 direct dependency/devDependency versions are exact pins matching their locks; only three direct resolved versions change: js-yaml4.2.0→4.3.2, ws8.20.1→8.21.0 and Danger12.3.4→13.0.8. Other direct packages—including Prisma/client6.19.3, existing Nest11 versions, TypeScript5.9.3 and ts-node10.9.2—retain their original resolved versions; inherited0.x direct packages were not gratuitously major-upgraded. [All direct pins](direct-pins.json).

The lock contains85 differing nodes, including metadata-only changes, added/removed nested copies and compatible transitive security refreshes. This is not described as only3 changed packages or proven globally minimal graph churn; it is the bounded consumer-compatible repair found without force, audit suppression, omitted dev dependencies, library forks or production shims. Every changed physical path and field is enumerated below. [Complete lock delta](complete-lock-delta.json), [exact advisory paths](FINAL_ADVISORY_PATH_DELTA.json).

### Version and override decisions

1. **Danger13.0.8, not14:** minimum fixed command-injection release; removes unpatched parse-git-config and resolves patched Octokit transitives. Actual local Git-object retrieval works; installed source uses execFile argv, not a shell. Its unrelated nonexistent-path error branch can remain unresolved; no remote Danger-provider integration or comprehensive exploit claim. [Metadata](metadata-danger.log), [Danger advisory](https://github.com/advisories/GHSA-3x93-p86w-5jvh), [parse-git-config advisory](https://github.com/advisories/GHSA-8g77-54rh-46hx), [real probe](dependency-probes-2.log).
2. **Prisma/client6.19.3 unchanged; @prisma/config@6.19.3→deepmerge-ts8.0.0:** actual Prisma config loader imports named deepmerge and passes it to c12. Named API, object/array/map/set semantics and safe cyclic merges verified, plus real loadConfigFromFile through native dynamic import. No Prisma downgrade/major used to satisfy audit. [Metadata](metadata-deepmerge.log), [red](security-red.log), [real config probe](dependency-probes-2.log), [advisory](https://github.com/advisories/GHSA-ggr8-5vv4-36mx).
3. **Nest platform11.1.26 unchanged; scoped multer2.3.0:** inspected Nest11 releases still pin vulnerable multer2.2.0; unrelated platform major/patch churn would not fix the actual edge. Normal, truncated and oversized multipart cases run against real Nest-resolved Multer without DB/server activation in those probes. [Nest release metadata](metadata-nest11.log), [probe](dependency-probes-2.log), [Multer advisory](https://github.com/advisories/GHSA-wc9g-mqfw-jrwm).
4. **YAML4.3.2 runtime/Swagger;3.15.2 NYC:** preserve each consumer major/API, including actual NYC safeLoad. Final override is exact-parent `@nestjs/swagger@11.4.4: { js-yaml:4.3.2 }`. A version-selector intermediate removed stale4.1.1 but later npm graph/SBOM recognition failed; the parent-approved single scope correction succeeded without changing one installed byte or locked version. Details below retain both failures and recurrence proof. [YAML advisory](https://github.com/advisories/GHSA-2883-xcg3-v3hh), [probe](dependency-probes-2.log), [scope correction](corrected-freeze.json), [invariance](override-invariance.json).
5. **Remove global minimatch9 override:** it imposed object-export9 on test-exclude's callable3 API and caused the preserved default Babel coverage crash. Restore caller-major3/5/9/10 resolution with patched brace-expansion copies. Actual Babel instrumentation now runs, not merely the test-exclude API probe and not a V8 substitution. [Original failure](../c1/green-pairing-coverage.log), [metadata](metadata-minimatch.log), [Babel run](focused-babel.log).
6. **qs6.16.0 exact; existing diff9.0.0 made exact:** qs security thresholds require6.16.0; diff is not unnecessarily upgraded. Targeted within-range updates cover Babel/core/helpers, browser mapping/browserslist data, body-parser, brace-expansion, fast-uri, form-data, shell-quote and undici. [Targeted resolution](lock-transitive-update.log), [exact paths/versions](FINAL_ADVISORY_PATH_DELTA.json), [all lock changes](complete-lock-delta.json).
7. **shell-quote1.10.0** is compatible-range npm resolution;1.9.0 is the first available fixed line. Nonexistent1.8.5 pack failure is preserved. Real1.8.3 newline-operator rejection fails before remediation and passes on installed1.10.0 without executing a shell payload. [Metadata](metadata-shell.log), [failed pack](pack-probes.log), [red](security-red.log), [green](dependency-probes-2.log).
8. **ws8.21.0:** retain major8 with published fix; real normal/oversized/fragmented frame behavior verified. New optional limiters are not claimed configured in the application. Local Dependabot refs were inspected read-only; ws proposal was compatible, js-yaml5 unnecessary and platform11.1.27 insufficient for its Multer edge. [Refs](dependabot-refs.txt), [probe](dependency-probes-2.log), [ws advisory](https://github.com/advisories/GHSA-96hv-2xvq-fx4p).

## Verification chronology and preserved failures

### Real security negative checks

Two real old-package tests ran before lock remediation: shell-quote1.8.3 failed to reject a newline operator; deepmerge-ts7.1.5 exhausted the stack on cyclic input. They used private unpacked published tarballs, not npm-success mocks or a full baseline suite; no shell payload or customer request executed. [Negative script](negative-probes.cjs), [red log](security-red.log), [package evidence](pack-probes-valid.log).

Eight real installed-package tests exercise shell quoting, deepmerge, native Prisma/c12 config loading, instrumentation selection, Swagger/NYC YAML, Danger Git read, multipart parsing and WebSocket frames. Child Node results must have no spawn error/signal, exit0, empty stderr and explicit completion marker; silent early async exit cannot pass. All8 pass and are also included in the exact-final full suite. [Frozen test](frozen-files/test/dependency-compatibility.spec.ts), [eight-probe green](dependency-probes-2.log), [final full results](corrected-full-suite-results.json).

The first installed probe run had one authoring failure: expected ws error code WS_ERR_TOO_MANY_FRAGMENTS instead of actual WS_ERR_TOO_MANY_BUFFERED_PARTS. Only that assertion corrected; not counted as a security red or hidden. [First probe run](dependency-probes-1.log).

### Clean installation, Prisma and compilation

One clean private npm ci --ignore-scripts completed exit0 in353.192s, adding1117 packages. Outer tool timeout630s returned after completion; durable subprocess ledger/log establish success, no retry install. Lifecycle hooks were not implicitly trusted or installed. Deprecation warnings for inflight, old glob branches and jpeg-exif remain despite zero audit snapshot. [Install](clean-install.log), [commands](command-ledger.jsonl).

Runtime is Node20.20.1/npm10.8.2;749 declared engine constraints accept this actual Node patch. This does not certify all older Node20 patches/OS targets. Each command uses private home/cache/tmp/node_modules, maximum4096MB heap and UV_THREADPOOL_SIZE1; Jest one-worker runs use --runInBand. Environment is allowlisted, not inherited wholesale; no real DB credential/password is read. [Engines](engines.log), [harness](run_step.py), [ledger](command-ledger.jsonl).

Prisma validate first failed missing DIRECT_URL, then passed with synthetic invalid-host parse-only variables. Generation initially hit socket denial resolving engine assets; matching6.19.3 engines were copied privately with identical package metadata and SHA256, then explicit supported engine path variables allowed offline generate. No checksum-ignore flag, schema change, shared writable binary, actual DB operation or repeated generation after initial successful preparation. Engine provenance inherits the preserved matching tooling, not a fresh independent download attestation. [Validate failure](prisma-validate-1.log), [validate pass](prisma-validate-2.log), [generation denial](prisma-generate.log), [engine provenance](prisma-engine-provenance.json), [generation pass](prisma-generate-2.log).

tsc --noEmit and Nest build exit0. Lint exit0 with21 inherited warnings/0 errors, without config changes.14 focused suites/256 tests pass under actual Babel coverage, giving97.70% lines,86.04% branches and100% functions on existing pairing service/controller; controller branches remain50%. Those earlier gates ran on predecessor7e959c0; the final scope-only manifest correction leaves every executable/test/generated/installed byte unchanged, and final full tests run on b2bb directly. No stale gate is relabeled as a fresh final-tree execution. [Type](typecheck.log), [build](build.log), [lint](lint.log), [Babel](focused-babel.log), [coverage mapping](BABEL_COVERAGE_SUMMARY.json), [byte invariance](override-invariance.json).

### npm graph/SBOM recurrence failure and approved fix

Initial installed npm ls passed, but after a later no-op lock resolution it reported invalid js-yaml4.3.2 against Swagger's exact4.1.1; SBOM failed the same edge. The first final graph read was incorrectly overlapped with lock-only resolution; a single sequential diagnostic reproduced the same error, so it was not dismissed as a race. No more concurrent npm mutation/read operations occurred. Exact npm internal mechanism is not independently proven; observed override recognition instability is the bounded finding. [Initial graph](installed-tree.log), [overlapped failure](installed-tree-final.log), [sequential reproduction](installed-tree-post-resolution.log), [SBOM failure](sbom.log).

After parent approval, exactly one experiment replaced the version selector with explicit Swagger11.4.4 parent scope. Sequential lock-only→graph→SBOM all pass; a second no-op resolution followed by one graph recurrence read passes. All54181 installed regular-file SHA256s,67symlink targets,1149 locked versions and complete lock bytes remain invariant. No force/reinstall/node_modules metadata surgery. Local CycloneDX1.5 SBOM contains1117 components including dev packages. [First graph](scoped-graph.log), [SBOM](scoped-sbom.log), [recurrence resolution](scoped-lock-recurrence.log), [recurrence graph](scoped-graph-recurrence.log), [invariance](override-invariance.json), [SBOM file](sbom.cdx.json).

Lock SHA256 is `b7fed5ed611c004615022cf69375b83956e9a69604807123fbe0e7965aea9c55`, unchanged through clean ci, both corrected no-op resolutions and final acceptance. Final full audit on frozen candidate exits0 at every severity. Npm audit is a timestamped registry snapshot, not a guarantee of undisclosed/future vulnerabilities. [Lock identity](FINAL_IDENTITY.json), [final audit](frozen-audit.log).

### Full-suite harness failure and separately authorized correction

Original full run on7e959c0 with blanket socket denial failed13 suites/95 tests, while7762 tests passed;159 skips/5todos remained. It completed exit1 in508.343s despite the outer630-second tool timeout. Every failed suite used a synthetic same-process HTTP fixture: app.listen(0), then127.0.0.1 and its assigned ephemeral port. Original numeric ports were not logged; no invented reconstruction. [Original failed run](full-suite.log), [failure inventory](full-suite-failure-inventory.json), [fixture source-line mapping](CHECKPOINT-08-HARNESS-PROPOSAL.md).

Parent reviewed and authorized an evidence-only guard, preserving original guard/results. Only plain-HTTP same-process port0 listeners are rebound to127.0.0.1 and registered before callbacks; only currently registered literal destinations connect. Close revokes admission, including close-before-listening. DB/cache/fixed/nonregistered destinations, aliases/IPv6/Unix/raw/TLS listeners, TLS socket clients and global fetch remain denied. Child registries start empty. This is cooperative fixture isolation, not an OS sandbox against malicious code. [Guard](owned-http-guard.cjs), [control source](owned-http-guard-controls.cjs), [approval/control checkpoints](CHECKPOINT-10-HARNESS-SOURCE-READY.md).

Allocated guard controls pass, including true TLS-client-to-admitted-port, non-DB fixed-port and close-before-listening assertions. Then only the13 failed suites reran on frozen b2bb:13/13 suites,151/151 tests,0skips; all95 original failed identities pass. A separate parent allocation then permitted exactly one corrected full run. [Safety pass](owned-guard-controls.log), [targeted pass](targeted13-corrected.log), [identity mapping](corrected-targeted-integrity.json), [full allocation checkpoint](CHECKPOINT-13-BEFORE-CORRECTED-FULL.md).

**Corrected full run on b2bb:** exit0 in321.841s;531passed/12skipped suites,7857passed/159skipped/5todo tests,8021total,6snapshots passed. Exact environment/argv/runtime and before/after identity retained. The original failed run remains failed; no third full run.16fixture registrations,16allowed connections and16revocations recorded; every allowed destination was active owned127.0.0.1, none remain admitted afterward. [Full log](corrected-full-suite.log), [full JSON](corrected-full-suite-results.json), [before](corrected-full-before.json), [after/ports](FINAL_IDENTITY.json), [network events](corrected-full-suite-network.jsonl).

Default Jest config deliberately excludes dedicated RLS suites and some colocated suites; inherited159skips/5todos are listed individually and are not new quarantine approvals. Thus green default suite is not live DB/RLS, remote integrations, exhaustive package fuzzing or full production-proof coverage. [Skip/todo inventory](INHERITED_SKIPS_TODOS.json), [unchanged Jest config](file:///tmp/tgp-op80-cycle2-inputs/backend/jest.config.js).

## Preservation, LOC and assertion accounting

All pinned backend/context/importer head/base/mobile refs remain exactly the matrix values. Three dunning files, Prisma schema, importer contract generator and JSON retain matching before/frozen/working SHA256 hashes. Original recovery a8908132a9c4882dbe80f9fbc1052532c7e68c3b, C1a404dd55d2fde7ab9fab46fb4ea1d27a9d79a7556 and C1b660e436ecbf911b6984b40ed43d135e3dc308378 were not applied or modified. [Final identity](FINAL_IDENTITY.json), [brief boundaries](file:///home/user/workspace/operator80/repos/context/handoffs/op80-execution/cycle2-dependency-builder-brief.md).

Parent-reported separate R82 old-writer/new-schema recovery gap and897-line database/proof-kernel split are neither fixed nor independently verified here. This dependency candidate does not supersede recovery/C1 findings or certify their combination. [Recorded parent-provided context](CHECKPOINT-06-REPORT-ONLY.md), [prior recovery](../backend/BUILD_REPORT.md), [C1 findings](../c1-split/BUILD_REPORT.md).

Exact pinned-base→final-tree all-file diff is785added/555removed=230net. Canonical production net0; actual unchanged workflow scope net158 including tests, below400. Source additions0/test additions158 take the workflow's zero-source branch: ratio numerically undefined, not an invented2.0/infinite score. No waiver. [Final gates/literal pathspecs](FINAL_GATES.json), [workflow](file:///tmp/tgp-op80-cycle2-inputs/backend/.github/workflows/r100-quality-gate.yml).

Canonical8-token scan includes test additions: every token+0/-0/net0. Actual workflow12-token plus parametrized empty-catch scan excludes specs and is also0. No new TODO/FIXME, skip/only, cast suppression or issue exemption. Test assertions inspect real values/errors/completion; no production diff lines exist for a numeric coverage denominator. [Final measurement](FINAL_GATES.json), [frozen spec](frozen-files/test/dependency-compatibility.spec.ts).

## R100 checklist — all55 rows

PASS is bounded local-delta evidence, not wholesale product/remote certification. N/A identifies unchanged/inapplicable surfaces; inherited or unverified mandated controls remain FAIL with no waiver. Rule labels follow canonical55-row template. [Canonical rules](file:///tmp/tgp-op80-cycle2-inputs/context/AGENT_RULES.md#L878).

| Rule | Status | Evidence / limitation |
|---|---|---|
| R100.1 Zero secrets | PASS | Scoped manual diff review: only registry metadata, version strings and synthetic local test data; no credential or customer data added. This is not a history-wide secret-scan claim. [Frozen patch](corrected-candidate.patch). |
| R100.2 RLS on every table | N/A | No schema/table/policy changes; RLS and DB proof remain parent-owned. [Frozen delta](corrected-freeze.json), [protected mapping](FINAL_IDENTITY.json). |
| R100.3 No raw-SQL concat | N/A | No product SQL or query construction changed. [Frozen delta](corrected-freeze.json), [protected mapping](FINAL_IDENTITY.json). |
| R100.4 No unsanitized output | N/A | Backend-only dependency delta; no UI/output-rendering path added. [Frozen delta](corrected-freeze.json), [protected mapping](FINAL_IDENTITY.json). |
| R100.5 IDOR-proof endpoints | N/A | No authenticated endpoint or ownership query changed. [Frozen delta](corrected-freeze.json), [protected mapping](FINAL_IDENTITY.json). |
| R100.6 Rate limiting auth/paid | N/A | No auth/paid API endpoint or rate-limit configuration changed. [Frozen delta](corrected-freeze.json), [protected mapping](FINAL_IDENTITY.json). |
| R100.7 JWT hygiene | N/A | No JWT signing/verification/rotation logic changed. [Frozen delta](corrected-freeze.json), [protected mapping](FINAL_IDENTITY.json). |
| R100.8 Runtime input validation | N/A | No application API boundary/DTO changed; package parser behavior is separately tested. [Frozen delta](corrected-freeze.json), [protected mapping](FINAL_IDENTITY.json). |
| R100.9 Role check at data layer | N/A | No role or data-access logic changed. [Frozen delta](corrected-freeze.json), [protected mapping](FINAL_IDENTITY.json). |
| R100.10 npm audit clean | PASS | Final full audit exit0, all severities0 including dev dependencies; clean ci and corrected sequential npm ls/recurrence pass with unchanged lock/runtime bytes. Both manifests staged; commit/publication remains parent-owned. [Audit](frozen-audit.log), [graph](scoped-graph-recurrence.log), [invariance](override-invariance.json), [freeze](corrected-freeze.json). |
| R100.11 CORS allowlist | N/A | No CORS behavior/configuration changed. [Frozen delta](corrected-freeze.json), [protected mapping](FINAL_IDENTITY.json). |
| R100.12 No internal info in errors | N/A | No production error filter or response payload changed. [Frozen delta](corrected-freeze.json), [protected mapping](FINAL_IDENTITY.json). |
| R100.13 HTTPS + HSTS | N/A | No HTTPS/HSTS/deployment configuration changed. [Frozen delta](corrected-freeze.json), [protected mapping](FINAL_IDENTITY.json). |
| R100.14 Layer discipline | PASS | Only dependency manifests and a test fixture changed; production layering is byte-preserved. [Freeze](corrected-freeze.json), [preservation](FINAL_IDENTITY.json). |
| R100.15 Reusable over specific | PASS | Eight consumers reuse one subprocess assertion helper; no new production abstraction or duplicated service code. [Frozen test](file:///tmp/tgp-op80-cycle2-inputs/backend/test/dependency-compatibility.spec.ts). |
| R100.16 No new TODO/FIXME | PASS | No added TODO/FIXME markers in scoped executable diff; manifest files contain no such marker. [Measurement](FINAL_GATES.json), [patch](corrected-candidate.patch). |
| R100.17 Real test assertions | PASS | Two real old-package security failures preceded lock remediation; eight installed-package tests assert actual values, errors, config loading and Git content, not package-manager mocks. [Security red](security-red.log), [green](dependency-probes-2.log). |
| R100.18 Env parity | N/A | No product environment setting changed. Synthetic invalid-host schema variables exist only in the sanitized evidence harness, never production env files. [Command ledger](command-ledger.jsonl). |
| R100.19 API versioning | N/A | No API route/version/contract changed; importer JSON and generator preserved. [Frozen delta](corrected-freeze.json), [protected mapping](FINAL_IDENTITY.json). |
| R100.20 No circular imports | N/A | No production import edge added. The sole test imports node:child_process; child processes load real existing dependency boundaries. No whole-repo circular-import scan claimed. [Patch](corrected-candidate.patch). |
| R100.21 No N+1 | N/A | No database loop/query path changed. [Frozen delta](corrected-freeze.json), [protected mapping](FINAL_IDENTITY.json). |
| R100.22 Indexes on FK/hot WHERE | N/A | No migration, FK, index or query schema changed. [Frozen delta](corrected-freeze.json), [protected mapping](FINAL_IDENTITY.json). |
| R100.23 Pagination on lists | N/A | No list endpoint or pagination behavior changed. [Frozen delta](corrected-freeze.json), [protected mapping](FINAL_IDENTITY.json). |
| R100.24 No event-loop blocking | N/A | Synchronous subprocess and tiny fixture-file operations are test-only, bounded by a20-second child timeout; no event-loop-blocking production code added. [Test](file:///tmp/tgp-op80-cycle2-inputs/backend/test/dependency-compatibility.spec.ts). |
| R100.25 Caching stable data | N/A | No application cache or TTL added/changed. [Frozen delta](corrected-freeze.json), [protected mapping](FINAL_IDENTITY.json). |
| R100.26 Media compress + CDN | N/A | No media pipeline or CDN behavior changed; Multer parsing tested without app/server activation. [Frozen delta](corrected-freeze.json), [protected mapping](FINAL_IDENTITY.json). |
| R100.27 No polling for real-time | N/A | No polling/timer behavior added to application. [Frozen delta](corrected-freeze.json), [protected mapping](FINAL_IDENTITY.json). |
| R100.28 RMW under lock/transaction | N/A | No business read-modify-write path or transaction changed. [Frozen delta](corrected-freeze.json), [protected mapping](FINAL_IDENTITY.json). |
| R100.29 Idempotency on payments | N/A | No payment/external side-effect or idempotency implementation changed. [Frozen delta](corrected-freeze.json), [protected mapping](FINAL_IDENTITY.json). |
| R100.30 Optimistic rollback | N/A | No frontend optimistic UI path in scope. [Frozen delta](corrected-freeze.json), [protected mapping](FINAL_IDENTITY.json). |
| R100.31 Hook deps correct | N/A | No React hooks in scope. [Frozen delta](corrected-freeze.json), [protected mapping](FINAL_IDENTITY.json). |
| R100.32 Cleanup on unmount | N/A | No frontend lifecycle/unmount path in scope. [Frozen delta](corrected-freeze.json), [protected mapping](FINAL_IDENTITY.json). |
| R100.33 Error boundaries / filter | N/A | No UI error boundary or Nest global filter changed. [Frozen delta](corrected-freeze.json), [protected mapping](FINAL_IDENTITY.json). |
| R100.34 Structured logging | N/A | No application logging changed; child assertion errors go to stderr and force nonzero failure. No production console logger introduced. [Test](file:///tmp/tgp-op80-cycle2-inputs/backend/test/dependency-compatibility.spec.ts). |
| R100.35 Timeouts on external calls | PASS | No new external API call; real consumer probes are offline with20-second subprocess timeout, signal/status/stderr/marker checks. The npm install took353.192s and completed despite outer tool timeout. [Test](file:///tmp/tgp-op80-cycle2-inputs/backend/test/dependency-compatibility.spec.ts), [ledger](command-ledger.jsonl). |
| R100.36 No swallowed errors | PASS | New assertion-probe rejections write errors and fail process status; parent asserts no signal/error, exact0 exit, empty stderr and completion marker. No swallowed errors added. [Patch](corrected-candidate.patch). |
| R100.37 /health endpoint | N/A | No health-route change or live DB health probe authorized. [Frozen delta](corrected-freeze.json), [protected mapping](FINAL_IDENTITY.json). |
| R100.38 Comments explain WHY | PASS | Comments explain native Node module boundaries and retained diagnostic fixture rationale. [Test](file:///tmp/tgp-op80-cycle2-inputs/backend/test/dependency-compatibility.spec.ts). |
| R100.39 YAGNI patterns | PASS | No feature, service, general framework or production compatibility shim added; three directly required version bumps and scoped overrides solve observed findings. [Direct pins](direct-pins.json), [checkpoint02](CHECKPOINT-02.md). |
| R100.40 Same-bug-everywhere | PASS | All original26 vulnerability findings mapped to patched or removed physical paths, including nested YAML3/4 and brace-expansion branches; final full audit0. [Exact paths/advisories](FINAL_ADVISORY_PATH_DELTA.json), [audit](frozen-audit.log). |
| R100.41 No reimplementing libs | PASS | Uses published patched package implementations, not local library forks; compatibility tests invoke actual APIs. [Lock delta](complete-lock-delta.json), [green](dependency-probes-2.log). |
| R100.42 No phantom-bug defenses | PASS | Negative inputs target observed package advisories and a preserved coverage break; not speculative product defenses. The ws authoring error remains recorded separately from true old-version failures. [Security red](security-red.log), [probe first run](dependency-probes-1.log). |
| R100.43 Zero dead code | FAIL | No production dead code introduced; whole-repo zero-dead-code enforcement remains unproven because inherited unused-vars is warn and noUnused flags are absent. [ESLint](file:///tmp/tgp-op80-cycle2-inputs/backend/eslint.config.js), [tsconfig](file:///tmp/tgp-op80-cycle2-inputs/backend/tsconfig.json). |
| R100.44 Multi-table writes in txn | N/A | No multi-table writes in this delta. [Frozen delta](corrected-freeze.json), [protected mapping](FINAL_IDENTITY.json). |
| R100.45 Soft deletes | N/A | No business deletion behavior changed. [Frozen delta](corrected-freeze.json), [protected mapping](FINAL_IDENTITY.json). |
| R100.46 DB-layer constraints | N/A | No DB constraints or product validation contract changed. [Frozen delta](corrected-freeze.json), [protected mapping](FINAL_IDENTITY.json). |
| R100.47 PITR + recovery runbook | N/A | No database or backup work authorized. PITR/restore proof is operator-owned, not certified by dependency tests. [Brief](file:///home/user/workspace/operator80/repos/context/handoffs/op80-execution/cycle2-dependency-builder-brief.md). |
| R100.48 CI/CD enforced | FAIL | Local lint/type/build, actual Babel-focused tests and exact-candidate corrected full suite pass;21 inherited lint warnings remain. Remote required checks, review, merge/deploy enforcement not queried/certified. [Lint](lint.log), [type](typecheck.log), [build](build.log), [full](corrected-full-suite.log). |
| R100.49 Dev-only excluded prod | PASS | Danger remains devDependency; new spec is excluded by existing build include/exclude settings. No product test-helper import added; generated client remains private/untracked. [Manifest](direct-pins.json), [tsconfig.build](file:///tmp/tgp-op80-cycle2-inputs/backend/tsconfig.build.json). |
| R100.50 Graceful degradation | N/A | No optional application-service failure behavior changed; whole-product graceful degradation not certified. [Frozen delta](corrected-freeze.json), [protected mapping](FINAL_IDENTITY.json). |
| R100.A1 Test:src ≥ 2.0 | PASS | Actual workflow source additions0, test additions158: zero-denominator branch passes, numeric ratio is undefined, not an invented2.0/infinite score. [Exact pathspec measurements](FINAL_GATES.json). |
| R100.A2 Banned-cast net = 0 | PASS | Canonical eight-token scan includes tests: every token+0/-0/net0. Actual workflow12-token plus parametrized empty-catch scan excludes specs: all0. No issue exemption or waiver used. [Measurement](FINAL_GATES.json). |
| R100.A3 ≤ 400 prod LOC | PASS | Canonical production LOC net0; actual workflow LOC158 including tests, below400. All-file net230 includes manifests/lock. No LOC/test exemption. [Exact final gates](FINAL_GATES.json). |
| R100.A4 CI pass rate ≥ 75% | FAIL | Live last14-day PR CI pass rate >=75% not queried; local tests cannot substitute for the canonical remote metric. [Authority](file:///home/user/workspace/operator80/repos/context/handoffs/op80-execution/cycle2-dependency-builder-brief.md). |
| R100.A5 Verdict line present | PASS | One final FINDINGS verdict ends this self-check report; this is not an independent audit or release claim. |

## R109–R126 checklist — all18 rows

| Rule | Status | Evidence / limitation |
|---|---|---|
| R109 | PASS | No user-visible entry point added, hidden or stubbed. Actual package fixes plus real consumer assertions, not a placeholder remediation plan. [Patch](corrected-candidate.patch), [green](dependency-probes-2.log). |
| R110 | FAIL | No new secret found in scoped manual review; required gitleaks pre-commit/CI enforcement and remote branch requirements remain inherited/unverified. No hooks installed because lifecycle scripts were intentionally disabled. [Prior findings](../c1-split/C1a_REPORT.md), [install](clean-install.log). |
| R111 | FAIL | Inherited tsconfig lacks noUnusedLocals/noUnusedParameters; ESLint unused-vars remains warn. Existing typecheck passed without claiming stricter flags. [tsconfig](file:///tmp/tgp-op80-cycle2-inputs/backend/tsconfig.json), [ESLint](file:///tmp/tgp-op80-cycle2-inputs/backend/eslint.config.js), [type](typecheck.log). |
| R112 | FAIL | Inherited no-explicit-any is off and full unsafe-rule error enforcement absent. Delta has no banned cast or suppression; no config change was authorized. [ESLint](file:///tmp/tgp-op80-cycle2-inputs/backend/eslint.config.js), [measurements](FINAL_GATES.json). |
| R113 | FAIL | Local final audit0 without omitted dev dependencies, waivers or suppressions; canonical live required-status/age/alert/suppression governance remains unverified and out of scope. [Final audit](frozen-audit.log), [prior control findings](../c1-split/C1a_REPORT.md). |
| R114 | PASS | All55 direct pins exact and match lock. Both manifests staged; private clean ci succeeded, approved parent-scoped Swagger override survived sequential graph/SBOM and no-op recurrence. All54181 installed regular-file hashes,67symlinks and1149 locked versions unchanged by scope correction. Commit/live Danger enforcement parent-owned. [Pins](direct-pins.json), [invariance](override-invariance.json), [recurrence](scoped-graph-recurrence.log). |
| R115 | FAIL | Local CycloneDX1.5 SBOM with1117 components (including dev) generated successfully. Existing workflow still does not trigger on every PR; no PR/Release artifact upload performed. [SBOM](sbom.cdx.json), [workflow](file:///tmp/tgp-op80-cycle2-inputs/backend/.github/workflows/sbom.yml). |
| R116 | N/A | Zero production additions: no numeric diff-coverage claim. Actual Babel coverage on existing pairing consumers97.70% lines/86.04% branches/100% functions; controller branches50% disclosed. Same executable/runtime bytes in final tree; full exact-candidate suite passes. [Coverage](focused-babel.log), [mapping](BABEL_COVERAGE_SUMMARY.json), [final gates](FINAL_GATES.json). |
| R117 | FAIL | All8 new tests call the assertion-bearing probe and validate real values/errors, but inherited ESLint lacks required jest/expect-expect enforcement/registration. No assertionless or mocked npm-success test introduced. [Test](file:///tmp/tgp-op80-cycle2-inputs/backend/test/dependency-compatibility.spec.ts), [prior control findings](../c1-split/C1a_REPORT.md). |
| R118 | FAIL | CodeQL exists in pinned tree; mandated Semgrep/SAST details and blocking live status not verified. No new suppression or false remote-green claim. [CodeQL](file:///tmp/tgp-op80-cycle2-inputs/backend/.github/workflows/codeql.yml), [prior findings](../c1-split/C1a_REPORT.md). |
| R119 | N/A | No production cryptographic primitive changed; no whole-tree crypto audit claim. SHA256 evidence hashes are integrity identifiers, not new application cryptography. [Patch](corrected-candidate.patch). |
| R120 | FAIL | Inherited IaC security-scanning gap remains; no infrastructure file changed and no Checkov/remote run authorized. [Prior findings](../c1-split/C1a_REPORT.md). |
| R121 | FAIL | Local build is not a deploy artifact attestation; required embedded SHA/build time/version endpoint and Docker revision label proof incomplete. Base/tree/patch recorded as evidence, not substituted for runtime identity. [Dockerfile](file:///tmp/tgp-op80-cycle2-inputs/backend/Dockerfile), [freeze](corrected-freeze.json). |
| R122 | FAIL | No independent peer audit, branch-protection query, approved review or required-status validation. Parent alone owns publication; no commits/pushes. [Authority](file:///home/user/workspace/operator80/repos/context/handoffs/op80-execution/cycle2-dependency-builder-brief.md). |
| R123 | FAIL | Corrected full suite explicitly --passWithNoTests=false;7857 pass,159 inherited skips,5inherited todos,0fail. No new skips/quarantine waiver. Bare jest package script and inherited quarantine/enforcement gaps remain; first8-probe runs did not explicitly set the flag. [Full](corrected-full-suite.log), [skip/todo inventory](INHERITED_SKIPS_TODOS.json), [commands](command-ledger.jsonl). |
| R124 | PASS | Verbatim pinned matrix rechecked for all5 refs, no drift. Exact corrected tree/patch SHA256, protected hashes, before/after full identity and alternate-index replay match; no remote SHA/independent-review assertion. [Identity](FINAL_IDENTITY.json), [reconstruction](corrected-freeze.json), [before full](corrected-full-before.json). |
| R125 | N/A | No new canonical rule/enforcement scaffold proposed; existing governance gaps are findings, not waivers. R127–R129 do not exist and are not invented. [Canonical rules](file:///tmp/tgp-op80-cycle2-inputs/context/AGENT_RULES.md). |
| R126 | FAIL | Parent owns dispatch and completion telemetry; this worker records commands/checkpoints but cannot certify parent post-return ledger completion or unknown cost/runtime model. No subdelegation. [Command ledger](command-ledger.jsonl), [authority](file:///home/user/workspace/operator80/repos/context/handoffs/op80-execution/cycle2-dependency-builder-brief.md). |

## Exact commands, results and all failed attempts

[command-ledger.jsonl](command-ledger.jsonl) records full argv, cwd, allowlisted nonsecret environment, start time, duration, exit and log for every wrapped command. Initial benign missing-mobile-path lookup used the original read-only mobile clone instead; nonexistent shell-quote1.8.5, unsuccessful audit iterations, probe authoring failure, missing DIRECT_URL, blocked generate, failed original full run and graph/SBOM failures are retained rather than erased. Checkpoints record pauses/allocations and source-only work. [Initial checkpoint](CHECKPOINT-01.md), [pack failure](pack-probes.log), [chronology](command-ledger.jsonl).

| Step | Exit | Seconds | Exact argv | Evidence |
|---|---|---|---|---|
| metadata-danger | 0 | 0.452 | `["npm", "view", "danger@13.0.8", "version", "engines", "dependencies", "--json"]` | [metadata-danger.log](metadata-danger.log) |
| metadata-deepmerge | 0 | 0.381 | `["npm", "view", "deepmerge-ts@8.0.0", "version", "engines", "exports", "--json"]` | [metadata-deepmerge.log](metadata-deepmerge.log) |
| metadata-nest | 0 | 0.389 | `["npm", "view", "@nestjs/platform-express@11.1.28", "version", "engines", "dependencies", "peerDependencies", "--json"]` | [metadata-nest.log](metadata-nest.log) |
| metadata-swagger | 0 | 0.376 | `["npm", "view", "@nestjs/swagger@11.4.5", "version", "engines", "dependencies", "peerDependencies", "--json"]` | [metadata-swagger.log](metadata-swagger.log) |
| metadata-nest-releases | 0 | 0.516 | `["npm", "view", "@nestjs/platform-express", "dist-tags", "versions", "--json"]` | [metadata-nest-releases.log](metadata-nest-releases.log) |
| metadata-swagger-latest | 0 | 0.369 | `["npm", "view", "@nestjs/swagger@latest", "version", "dependencies", "--json"]` | [metadata-swagger-latest.log](metadata-swagger-latest.log) |
| metadata-minimatch | 0 | 0.37 | `["npm", "view", "minimatch@3", "version", "--json"]` | [metadata-minimatch.log](metadata-minimatch.log) |
| pack-probes | 1 | 0.425 | `["npm", "pack", "shell-quote@1.8.3", "shell-quote@1.8.5", "deepmerge-ts@7.1.5", "deepmerge-ts@8.0.0", "danger@13.0.8", "--ignore-scripts", "--pack-destination=/home/user/workspace/operator80/execution/backend-dependency-fix", "--json"]` | [pack-probes.log](pack-probes.log) |
| metadata-shell | 0 | 0.365 | `["npm", "view", "shell-quote", "versions", "--json"]` | [metadata-shell.log](metadata-shell.log) |
| metadata-nest11 | 0 | 0.412 | `["npm", "view", "@nestjs/platform-express@11", "version", "dependencies.multer", "--json"]` | [metadata-nest11.log](metadata-nest11.log) |
| pack-probes-valid | 0 | 0.657 | `["npm", "pack", "shell-quote@1.8.3", "deepmerge-ts@7.1.5", "deepmerge-ts@8.0.0", "danger@13.0.8", "--ignore-scripts", "--pack-destination=/home/user/workspace/operator80/execution/backend-dependency-fix", "--json"]` | [pack-probes-valid.log](pack-probes-valid.log) |
| pack-shell-fixed | 0 | 0.391 | `["npm", "pack", "shell-quote@1.9.0", "--ignore-scripts", "--pack-destination=/home/user/workspace/operator80/execution/backend-dependency-fix", "--json"]` | [pack-shell-fixed.log](pack-shell-fixed.log) |
| security-red | 1 | 0.151 | `["node", "--test", "--test-concurrency=1", "/home/user/workspace/operator80/execution/backend-dependency-fix/negative-probes.cjs"]` | [security-red.log](security-red.log) |
| lock-resolve-1 | 0 | 2.595 | `["npm", "install", "--package-lock-only", "--ignore-scripts", "--no-audit", "--no-fund"]` | [lock-resolve-1.log](lock-resolve-1.log) |
| audit-candidate-1 | 1 | 2.404 | `["npm", "audit", "--audit-level=high", "--json"]` | [audit-candidate-1.log](audit-candidate-1.log) |
| lock-transitive-update | 0 | 3.308 | `["npm", "update", "@babel/core", "baseline-browser-mapping", "body-parser", "brace-expansion", "browserslist", "fast-uri", "form-data", "js-yaml", "shell-quote", "undici", "--package-lock-only", "--ignore-scripts", "--no-audit", "--no-fund"]` | [lock-transitive-update.log](lock-transitive-update.log) |
| audit-candidate-2 | 1 | 1.111 | `["npm", "audit", "--audit-level=high", "--json"]` | [audit-candidate-2.log](audit-candidate-2.log) |
| metadata-swagger11 | 0 | 0.338 | `["npm", "view", "@nestjs/swagger@11.4.7", "dependencies", "--json"]` | [metadata-swagger11.log](metadata-swagger11.log) |
| lock-swagger-refresh | 0 | 2.197 | `["npm", "update", "@nestjs/swagger", "--package-lock-only", "--ignore-scripts", "--no-audit", "--no-fund"]` | [lock-swagger-refresh.log](lock-swagger-refresh.log) |
| audit-candidate-3 | 1 | 0.752 | `["npm", "audit", "--audit-level=high", "--json"]` | [audit-candidate-3.log](audit-candidate-3.log) |
| lock-yaml-version-scope | 0 | 1.086 | `["npm", "install", "--package-lock-only", "--ignore-scripts", "--no-audit", "--no-fund"]` | [lock-yaml-version-scope.log](lock-yaml-version-scope.log) |
| audit-candidate-4 | 0 | 0.68 | `["npm", "audit", "--audit-level=high", "--json"]` | [audit-candidate-4.log](audit-candidate-4.log) |
| clean-install | 0 | 353.192 | `["npm", "ci", "--ignore-scripts", "--no-audit", "--no-fund"]` | [clean-install.log](clean-install.log) |
| installed-tree | 0 | 0.829 | `["npm", "ls", "--all", "--json"]` | [installed-tree.log](installed-tree.log) |
| dependency-probes-1 | 1 | 9.1 | `["node", "node_modules/jest/bin/jest.js", "test/dependency-compatibility.spec.ts", "--runInBand", "--no-cache"]` | [dependency-probes-1.log](dependency-probes-1.log) |
| prisma-validate-1 | 1 | 1.089 | `["node", "node_modules/prisma/build/index.js", "validate"]` | [prisma-validate-1.log](prisma-validate-1.log) |
| engines | 0 | 0.068 | `["node", "-e", "const fs=require(\"fs\"),s=require(\"semver\"),p=require(\"./package-lock.json\").packages; const rows=Object.entries(p).filter(([k,v])=>v.engines?.node).map(([path,v])=>({path,version:v.version,node:v.engines.node,compatible:s.satisfies(process.version,v.engines.node)})); console.log(JSON.stringify({runtime:process.version,checked:rows.length,violations:rows.filter(r=>!r.compatible),rows},null,2));process.exitCode=rows.some(r=>!r.compatible)?1:0;"]` | [engines.log](engines.log) |
| prisma-validate-2 | 0 | 1.107 | `["node", "node_modules/prisma/build/index.js", "validate"]` | [prisma-validate-2.log](prisma-validate-2.log) |
| prisma-generate | 1 | 5.962 | `["node", "node_modules/prisma/build/index.js", "generate"]` | [prisma-generate.log](prisma-generate.log) |
| dependency-probes-2 | 0 | 7.913 | `["node", "node_modules/jest/bin/jest.js", "test/dependency-compatibility.spec.ts", "--runInBand", "--no-cache"]` | [dependency-probes-2.log](dependency-probes-2.log) |
| prisma-generate-2 | 0 | 4.293 | `["node", "node_modules/prisma/build/index.js", "generate"]` | [prisma-generate-2.log](prisma-generate-2.log) |
| typecheck | 0 | 46.881 | `["node", "node_modules/typescript/bin/tsc", "--noEmit"]` | [typecheck.log](typecheck.log) |
| build | 0 | 28.722 | `["npm", "run", "build"]` | [build.log](build.log) |
| lint | 0 | 13.497 | `["npm", "run", "lint"]` | [lint.log](lint.log) |
| focused-babel | 0 | 87.679 | `["node", "node_modules/jest/bin/jest.js", "--runInBand", "--passWithNoTests=false", "--testPathPatterns=(dependency-compatibility\|extension-pair\|contracts/importer-contract\|dunning-v2-lockout-(guard\\.spec\|allowlist)\|doctrine-cleanup\|diagnostic-prompt-doctrine)", "--coverage", "--coverageProvider=babel", "--collectCoverageFrom=src/extension-pair/extension-pair.service.ts", "--collectCoverageFrom=src/extension-pair/extension-pair.controller.ts", "--coverageDirectory=/home/user/workspace/operator80/execution/backend-dependency-fix/focused-babel-coverage", "--coverageReporters=json", "--coverageReporters=text", "--json", "--outputFile=/home/user/workspace/operator80/execution/backend-dependency-fix/focused-babel-results.json"]` | [focused-babel.log](focused-babel.log) |
| full-suite | 1 | 508.343 | `["node", "node_modules/jest/bin/jest.js", "--runInBand", "--passWithNoTests=false", "--json", "--outputFile=/home/user/workspace/operator80/execution/backend-dependency-fix/full-suite-results.json"]` | [full-suite.log](full-suite.log) |
| lock-determinism | 0 | 1.54 | `["npm", "install", "--package-lock-only", "--ignore-scripts", "--offline", "--no-audit", "--no-fund"]` | [lock-determinism.log](lock-determinism.log) |
| installed-tree-final | 1 | 2.062 | `["npm", "ls", "--all", "--json"]` | [installed-tree-final.log](installed-tree-final.log) |
| audit-final | 0 | 0.789 | `["npm", "audit", "--audit-level=high", "--json"]` | [audit-final.log](audit-final.log) |
| installed-tree-post-resolution | 1 | 1.054 | `["npm", "ls", "--all", "--json"]` | [installed-tree-post-resolution.log](installed-tree-post-resolution.log) |
| sbom | 1 | 1.049 | `["npm", "sbom", "--sbom-format=cyclonedx", "--sbom-type=application"]` | [sbom.log](sbom.log) |
| scoped-lock | 0 | 1.113 | `["npm", "install", "--package-lock-only", "--ignore-scripts", "--offline", "--no-audit", "--no-fund"]` | [scoped-lock.log](scoped-lock.log) |
| scoped-graph | 0 | 1.06 | `["npm", "ls", "--all", "--json"]` | [scoped-graph.log](scoped-graph.log) |
| scoped-sbom | 0 | 1.425 | `["npm", "sbom", "--sbom-format=cyclonedx", "--sbom-type=application"]` | [scoped-sbom.log](scoped-sbom.log) |
| scoped-lock-recurrence | 0 | 1.029 | `["npm", "install", "--package-lock-only", "--ignore-scripts", "--offline", "--no-audit", "--no-fund"]` | [scoped-lock-recurrence.log](scoped-lock-recurrence.log) |
| scoped-graph-recurrence | 0 | 1.135 | `["npm", "ls", "--all", "--json"]` | [scoped-graph-recurrence.log](scoped-graph-recurrence.log) |
| owned-guard-controls | 0 | 0.206 | `["timeout", "--signal=TERM", "30s", "node", "/home/user/workspace/operator80/execution/backend-dependency-fix/owned-http-guard-controls.cjs"]` | [owned-guard-controls.log](owned-guard-controls.log) |
| targeted13-corrected | 0 | 19.317 | `["node", "node_modules/jest/bin/jest.js", "--runInBand", "--passWithNoTests=false", "--runTestsByPath", "test/payouts-v2.spec.ts", "test/talent-connect-webhook.spec.ts", "test/community/ack/community-v2-2-ack.e2e.spec.ts", "test/common/feature-flag-not-found.bootstrap.spec.ts", "test/dunning-v2-lockout-guard.e2e.spec.ts", "test/wearables/wearables-module.integration.spec.ts", "test/community/community-v1-6-feature-flag.e2e.spec.ts", "test/scout/scout-ingest.validation.integration.spec.ts", "src/talent-marketplace/__tests__/apply.controller.http.spec.ts", "src/talent-marketplace/__tests__/admin-applications.controller.http.spec.ts", "test/coach-empty-states.e2e.spec.ts", "src/talent-marketplace/__tests__/admin-moderation.controller.http.spec.ts", "src/talent-marketplace/__tests__/public-listing.controller.http.spec.ts", "--json", "--outputFile=/home/user/workspace/operator80/execution/backend-dependency-fix/targeted13-results.json"]` | [targeted13-corrected.log](targeted13-corrected.log) |
| corrected-full-suite | 0 | 321.841 | `["node", "node_modules/jest/bin/jest.js", "--runInBand", "--passWithNoTests=false", "--json", "--outputFile=/home/user/workspace/operator80/execution/backend-dependency-fix/corrected-full-suite-results.json"]` | [corrected-full-suite.log](corrected-full-suite.log) |
| frozen-audit | 0 | 1.379 | `["npm", "audit", "--audit-level=high", "--json"]` | [frozen-audit.log](frozen-audit.log) |


Evidence-only assembly/reconstruction commands are captured by their complete local scripts and result records: prepare_readonly_report.py, snapshot_installed.py, finalize_evidence.py and write_final_report.py; git add/write-tree/full-index diff, alternate-index read-tree/apply/write-tree and final identity checks are described in the freeze/checkpoint records. No product commit object was created. [Measurement source](prepare_readonly_report.py), [snapshot source](snapshot_installed.py), [finalization source](finalize_evidence.py), [freeze/reconstruction](corrected-freeze.json).

## Complete before/after advisory, dependency path and version tables

### Complete advisory and dependency path comparison

Scope: original full audit → final frozen candidate full audit, including dev dependencies; every original finding is absent in final audit. Physical lock paths/versions are invariant through the corrected override. [Before](before-audit.json), [final](frozen-audit.log), [invariance](override-invariance.json).

Each table row retains all advisory ranges, physical lock paths and a representative shortest root chain; all immediate requiring parents and their declared ranges are in [machine-readable paths](FINAL_ADVISORY_PATH_DELTA.json). Parent-package findings are propagated findings, not additional independent advisories.

| Finding | Before exact nodes / representative chains | After exact nodes / representative chains | Advisory or propagated dependency |
|---|---|---|---|
| @babel/core (low) | `node_modules/@babel/core` **7.29.0** — babel-jest@30.4.1 → @jest/transform@30.4.1 → @babel/core@7.29.0 | `node_modules/@babel/core` **7.29.7** — babel-jest@30.4.1 → @jest/transform@30.4.1 → @babel/core@7.29.7 | [@babel/core: Arbitrary File Read via sourceMappingURL Comment](https://github.com/advisories/GHSA-4x5r-pxfx-6jf8) — `<=7.29.0` |
| @nestjs/platform-express (high) | `node_modules/@nestjs/platform-express` **11.1.26** — @nestjs/platform-express@11.1.26 | `node_modules/@nestjs/platform-express` **11.1.26** — @nestjs/platform-express@11.1.26 | Propagated through `multer` |
| @nestjs/swagger (moderate) | `node_modules/@nestjs/swagger` **11.4.4** — @nestjs/swagger@11.4.4 | `node_modules/@nestjs/swagger` **11.4.4** — @nestjs/swagger@11.4.4 | Propagated through `js-yaml` |
| @octokit/core (moderate) | `node_modules/@octokit/core` **3.6.0** — danger@12.3.4 → @octokit/rest@18.12.0 → @octokit/core@3.6.0 | `node_modules/@octokit/core` **5.2.2** — danger@13.0.8 → @octokit/rest@20.1.2 → @octokit/core@5.2.2 | Propagated through `@octokit/graphql`<br>Propagated through `@octokit/request`<br>Propagated through `@octokit/request-error` |
| @octokit/graphql (moderate) | `node_modules/@octokit/graphql` **4.8.0** — danger@12.3.4 → @octokit/rest@18.12.0 → @octokit/core@3.6.0 → @octokit/graphql@4.8.0 | `node_modules/@octokit/graphql` **7.1.1** — danger@13.0.8 → @octokit/rest@20.1.2 → @octokit/core@5.2.2 → @octokit/graphql@7.1.1 | Propagated through `@octokit/request` |
| @octokit/plugin-paginate-rest (moderate) | `node_modules/@octokit/plugin-paginate-rest` **2.21.3** — danger@12.3.4 → @octokit/rest@18.12.0 → @octokit/plugin-paginate-rest@2.21.3 | `node_modules/@octokit/plugin-paginate-rest` **11.4.4-cjs.2** — danger@13.0.8 → @octokit/rest@20.1.2 → @octokit/plugin-paginate-rest@11.4.4-cjs.2 | [@octokit/plugin-paginate-rest has a Regular Expression in iterator Leads to ReDoS Vulnerability Due to Catastrophic Backtracking](https://github.com/advisories/GHSA-h5c3-5r3r-rr8q) — `>=1.0.0 <9.2.2` |
| @octokit/request (moderate) | `node_modules/@octokit/request` **5.6.3** — danger@12.3.4 → @octokit/rest@18.12.0 → @octokit/core@3.6.0 → @octokit/request@5.6.3 | `node_modules/@octokit/request` **8.4.1** — danger@13.0.8 → @octokit/rest@20.1.2 → @octokit/core@5.2.2 → @octokit/request@8.4.1 | Propagated through `@octokit/request-error`<br>[@octokit/request has a Regular Expression in fetchWrapper that Leads to ReDoS Vulnerability Due to Catastrophic Backtracking](https://github.com/advisories/GHSA-rmvr-2pp2-xj38) — `>=1.0.0 <8.4.1` |
| @octokit/request-error (moderate) | `node_modules/@octokit/request-error` **2.1.0** — danger@12.3.4 → @octokit/rest@18.12.0 → @octokit/core@3.6.0 → @octokit/request-error@2.1.0 | `node_modules/@octokit/request-error` **5.1.1** — danger@13.0.8 → @octokit/rest@20.1.2 → @octokit/core@5.2.2 → @octokit/request-error@5.1.1 | [@octokit/request-error has a Regular Expression in index that Leads to ReDoS Vulnerability Due to Catastrophic Backtracking](https://github.com/advisories/GHSA-xx4v-prfh-6cgc) — `>=1.0.0 <5.1.1` |
| @octokit/rest (moderate) | `node_modules/@octokit/rest` **18.12.0** — danger@12.3.4 → @octokit/rest@18.12.0 | `node_modules/@octokit/rest` **20.1.2** — danger@13.0.8 → @octokit/rest@20.1.2 | Propagated through `@octokit/core`<br>Propagated through `@octokit/plugin-paginate-rest` |
| @prisma/config (high) | `node_modules/@prisma/config` **6.19.3** — prisma@6.19.3 → @prisma/config@6.19.3 | `node_modules/@prisma/config` **6.19.3** — prisma@6.19.3 → @prisma/config@6.19.3 | Propagated through `deepmerge-ts` |
| baseline-browser-mapping (moderate) | `node_modules/baseline-browser-mapping` **2.10.21** — @babel/preset-env@7.29.7 → @babel/helper-compilation-targets@7.29.7 → browserslist@4.28.2 → baseline-browser-mapping@2.10.21 | `node_modules/baseline-browser-mapping` **2.11.25** — @babel/preset-env@7.29.7 → @babel/helper-compilation-targets@7.29.7 → browserslist@4.29.0 → baseline-browser-mapping@2.11.25 | [baseline-browser-mapping process termination on invalid input causes denial of service](https://github.com/advisories/GHSA-w5vr-8v7q-w6rv) — `>=2.0.0 <2.11.0` |
| body-parser (low) | `node_modules/body-parser` **2.2.2** — @nestjs/platform-express@11.1.26 → express@5.2.1 → body-parser@2.2.2 | `node_modules/body-parser` **2.3.0** — @nestjs/platform-express@11.1.26 → express@5.2.1 → body-parser@2.3.0 | [body-parser vulnerable to denial of service when invalid limit value silently disables size enforcement](https://github.com/advisories/GHSA-v422-hmwv-36x6) — `>=2.0.0 <2.3.0` |
| brace-expansion (high) | `node_modules/brace-expansion` **2.1.0** — eslint@10.5.0 → minimatch@9.0.9 → brace-expansion@2.1.0<br>`node_modules/glob/node_modules/brace-expansion` **5.0.6** — @nestjs/cli@11.0.21 → glob@13.0.6 → minimatch@10.2.5 → brace-expansion@5.0.6 | `node_modules/@eslint/config-array/node_modules/brace-expansion` **5.0.12** — eslint@10.5.0 → @eslint/config-array@0.23.5 → minimatch@10.2.6 → brace-expansion@5.0.12<br>`node_modules/@typescript-eslint/typescript-estree/node_modules/brace-expansion` **5.0.12** — @typescript-eslint/parser@8.62.0 → @typescript-eslint/typescript-estree@8.62.0 → minimatch@10.2.6 → brace-expansion@5.0.12<br>`node_modules/brace-expansion` **2.1.7** — @flydotio/dockerfile@0.7.10 → ejs@3.1.10 → jake@10.9.4 → filelist@1.0.6 → minimatch@5.1.9 → brace-expansion@2.1.7<br>`node_modules/eslint/node_modules/brace-expansion` **5.0.12** — eslint@10.5.0 → minimatch@10.2.6 → brace-expansion@5.0.12<br>`node_modules/fork-ts-checker-webpack-plugin/node_modules/brace-expansion` **1.1.21** — @nestjs/cli@11.0.21 → fork-ts-checker-webpack-plugin@9.1.0 → minimatch@3.1.5 → brace-expansion@1.1.21<br>`node_modules/glob/node_modules/brace-expansion` **5.0.12** — @nestjs/cli@11.0.21 → glob@13.0.6 → minimatch@10.2.5 → brace-expansion@5.0.12<br>`node_modules/test-exclude/node_modules/brace-expansion` **1.1.21** — babel-jest@30.4.1 → babel-plugin-istanbul@7.0.1 → test-exclude@6.0.0 → minimatch@3.1.5 → brace-expansion@1.1.21 | [brace-expansion: DoS via exponential-time expansion of consecutive non-expanding {} groups](https://github.com/advisories/GHSA-3jxr-9vmj-r5cp) — `>=2.0.0 <2.1.2`<br>[brace-expansion: DoS via exponential-time expansion of consecutive non-expanding {} groups](https://github.com/advisories/GHSA-3jxr-9vmj-r5cp) — `>=3.0.0 <5.0.7`<br>[brace-expansion: DoS via unbounded expansion length causing an out-of-memory process crash](https://github.com/advisories/GHSA-mh99-v99m-4gvg) — `>=2.0.0 <2.1.3`<br>[brace-expansion: DoS via unbounded expansion length causing an out-of-memory process crash](https://github.com/advisories/GHSA-mh99-v99m-4gvg) — `>=4.0.0 <5.0.8`<br>[brace-expansion: DoS via unbounded intermediate arrays, bypassing the CVE-2026-14257 mitigation](https://github.com/advisories/GHSA-rgw5-rvv9-x895) — `>=4.0.0 <5.0.9`<br>[brace-expansion: DoS via unbounded intermediate arrays, bypassing the CVE-2026-14257 mitigation](https://github.com/advisories/GHSA-rgw5-rvv9-x895) — `>=2.0.0 <2.1.4` |
| browserslist (high) | `node_modules/browserslist` **4.28.2** — @babel/preset-env@7.29.7 → @babel/helper-compilation-targets@7.29.7 → browserslist@4.28.2 | `node_modules/browserslist` **4.29.0** — @babel/preset-env@7.29.7 → @babel/helper-compilation-targets@7.29.7 → browserslist@4.29.0 | [Browserslist: Unbounded memory growth (no cache eviction) via distinct query results, leading to eventual OOM](https://github.com/advisories/GHSA-c83g-rgw3-j3cx) — `<=4.28.6`<br>[Browserslist: Uncaught crash / prototype write via untrusted browserslist-stats.json custom stats (normalizeStats)](https://github.com/advisories/GHSA-73wf-gq98-2v4g) — `<=4.28.6` |
| danger (high) | `node_modules/danger` **12.3.4** — danger@12.3.4 | `node_modules/danger` **13.0.8** — danger@13.0.8 | Propagated through `@octokit/rest`<br>[danger allows local OS command injection through crafted file paths](https://github.com/advisories/GHSA-3x93-p86w-5jvh) — `<13.0.8`<br>Propagated through `parse-git-config` |
| deepmerge-ts (high) | `node_modules/deepmerge-ts` **7.1.5** — prisma@6.19.3 → @prisma/config@6.19.3 → deepmerge-ts@7.1.5 | `node_modules/deepmerge-ts` **8.0.0** — prisma@6.19.3 → @prisma/config@6.19.3 → deepmerge-ts@8.0.0 | [DeepmergeTS has stack exhaustion when merging recursive object graphs](https://github.com/advisories/GHSA-ggr8-5vv4-36mx) — `<8.0.0` |
| fast-uri (high) | `node_modules/fast-uri` **3.1.2** — @nestjs/cli@11.0.21 → @angular-devkit/core@19.2.24 → ajv@8.18.0 → fast-uri@3.1.2 | `node_modules/fast-uri` **3.1.8** — @nestjs/cli@11.0.21 → @angular-devkit/core@19.2.24 → ajv@8.18.0 → fast-uri@3.1.8 | [fast-uri vulnerable to host confusion via literal backslash authority delimiter](https://github.com/advisories/GHSA-v2hh-gcrm-f6hx) — `>=3.0.0 <=3.1.3`<br>[fast-uri vulnerable to host confusion via backslash authority introducer](https://github.com/advisories/GHSA-7p8r-x3mc-p8w7) — `>=3.0.0 <3.1.5`<br>[fast-uri vulnerable to server-side request forgery via malformed IPv6 normalization](https://github.com/advisories/GHSA-f65p-4m7j-42xc) — `>=3.0.0 <3.1.6`<br>[fast-uri vulnerable to server-side request forgery via repeated hostname percent-decoding](https://github.com/advisories/GHSA-fph4-wmhf-6fwf) — `>=3.1.2 <3.1.6`<br>[fast-uri vulnerable to host confusion via percent-encoded scheme normalization](https://github.com/advisories/GHSA-jqff-g426-hqxp) — `>=3.0.0 <3.1.6`<br>[fast-uri vulnerable to host confusion via failed IDN canonicalization](https://github.com/advisories/GHSA-4c8g-83qw-93j6) — `>=3.0.0 <3.1.3` |
| form-data (high) | `node_modules/form-data` **4.0.5** — @dropbox/sign@1.11.0 → form-data@4.0.5 | `node_modules/form-data` **4.0.6** — @dropbox/sign@1.11.0 → form-data@4.0.6 | [form-data: CRLF injection in form-data via unescaped multipart field names and filenames](https://github.com/advisories/GHSA-hmw2-7cc7-3qxx) — `>=4.0.0 <4.0.6` |
| js-yaml (high) | `node_modules/@istanbuljs/load-nyc-config/node_modules/js-yaml` **3.14.2** — babel-jest@30.4.1 → babel-plugin-istanbul@7.0.1 → @istanbuljs/load-nyc-config@1.1.0 → js-yaml@3.14.2<br>`node_modules/@nestjs/swagger/node_modules/js-yaml` **4.1.1** — @nestjs/swagger@11.4.4 → js-yaml@4.1.1<br>`node_modules/js-yaml` **4.2.0** — js-yaml@4.2.0 | `node_modules/@istanbuljs/load-nyc-config/node_modules/js-yaml` **3.15.2** — babel-jest@30.4.1 → babel-plugin-istanbul@7.0.1 → @istanbuljs/load-nyc-config@1.1.0 → js-yaml@3.15.2<br>`node_modules/js-yaml` **4.3.2** — js-yaml@4.3.2 | [JS-YAML: Quadratic-complexity DoS in merge key handling via repeated aliases](https://github.com/advisories/GHSA-h67p-54hq-rp68) — `<3.15.0`<br>[JS-YAML: Quadratic-complexity DoS in merge key handling via repeated aliases](https://github.com/advisories/GHSA-h67p-54hq-rp68) — `>=4.0.0 <=4.1.1`<br>[js-yaml: YAML merge-key chains can force quadratic CPU consumption](https://github.com/advisories/GHSA-52cp-r559-cp3m) — `>=4.0.0 <4.3.0`<br>[js-yaml: YAML merge-key chains can force quadratic CPU consumption](https://github.com/advisories/GHSA-52cp-r559-cp3m) — `>=3.0.0 <3.15.0`<br>[JS-YAML: Quadratic CPU consumption in !!omap resolution (3.x and 4.x) — CVE-2026-59870 fix not backported](https://github.com/advisories/GHSA-5p4m-2wfm-xmqj) — `>=3.0.0 <3.15.1`<br>[JS-YAML: Quadratic CPU consumption in !!omap resolution (3.x and 4.x) — CVE-2026-59870 fix not backported](https://github.com/advisories/GHSA-5p4m-2wfm-xmqj) — `>=4.0.0 <4.3.1`<br>[js-yaml: maxTotalMergeKeys does not limit CPU use for empty merge sources](https://github.com/advisories/GHSA-2883-xcg3-v3hh) — `>=3.0.0 <3.15.2`<br>[js-yaml: maxTotalMergeKeys does not limit CPU use for empty merge sources](https://github.com/advisories/GHSA-2883-xcg3-v3hh) — `>=4.0.0 <4.3.2` |
| multer (high) | `node_modules/multer` **2.1.1** — @nestjs/platform-express@11.1.26 → multer@2.1.1 | `node_modules/multer` **2.3.0** — @nestjs/platform-express@11.1.26 → multer@2.3.0 | [Multer vulnerable to Denial of Service via deeply nested field names](https://github.com/advisories/GHSA-72gw-mp4g-v24j) — `>=1.0.0 <2.2.0`<br>[Multer vulnerable to Denial of Service via incomplete cleanup of aborted uploads](https://github.com/advisories/GHSA-3p4h-7m6x-2hcm) — `>=2.0.0-alpha.1 <2.2.0`<br>[multer vulnerable to Denial of Service via crafted multipart field names](https://github.com/advisories/GHSA-wc9g-mqfw-jrwm) — `<2.3.0`<br>[multer vulnerable to file size limit bypass via async fileFilter race condition](https://github.com/advisories/GHSA-qvfw-j98x-7q72) — `<2.3.0`<br>[multer vulnerable to Denial of Service via oversized array index in field names](https://github.com/advisories/GHSA-535w-7cp7-47q4) — `<2.3.0` |
| parse-git-config (high) | `node_modules/parse-git-config` **2.0.3** — danger@12.3.4 → parse-git-config@2.0.3 | Removed | [Prototype Pollution Vulnerability in parse-git-config](https://github.com/advisories/GHSA-8g77-54rh-46hx) — `<=3.0.0` |
| prisma (high) | `node_modules/prisma` **6.19.3** — prisma@6.19.3 | `node_modules/prisma` **6.19.3** — prisma@6.19.3 | Propagated through `@prisma/config` |
| qs (moderate) | `node_modules/qs` **6.15.2** — @dropbox/sign@1.11.0 → qs@6.15.2 | `node_modules/qs` **6.16.0** — @dropbox/sign@1.11.0 → qs@6.16.0 | [qs array-limit bypass via bracket-key comma parsing](https://github.com/advisories/GHSA-x5fp-wj9c-mxmx) — `>=6.14.2 <=6.15.3`<br>[qs: Denial of Service via Attacker Controlled isBuffer](https://github.com/advisories/GHSA-4mjr-xmp4-gh2g) — `>=2.2.5 <6.16.0` |
| shell-quote (critical) | `node_modules/shell-quote` **1.8.3** — @flydotio/dockerfile@0.7.10 → shell-quote@1.8.3 | `node_modules/shell-quote` **1.10.0** — @flydotio/dockerfile@0.7.10 → shell-quote@1.10.0 | [shell-quote quote() does not escape newlines in object .op values](https://github.com/advisories/GHSA-w7jw-789q-3m8p) — `>=1.1.0 <=1.8.3`<br>[shell-quote: Quadratic-complexity Denial of Service in `parse()` (CWE-407)](https://github.com/advisories/GHSA-395f-4hp3-45gv) — `<=1.8.4` |
| undici (high) | `node_modules/undici` **7.26.0** — expo-server-sdk@6.1.0 → undici@7.26.0 | `node_modules/undici` **7.29.1** — expo-server-sdk@6.1.0 → undici@7.29.1 | [undici vulnerable to TLS certificate validation bypass via dropped requestTls in SOCKS5 ProxyAgent](https://github.com/advisories/GHSA-vmh5-mc38-953g) — `>=7.23.0 <7.28.0`<br>[undici vulnerable to HTTP header injection via Set-Cookie percent-decoding](https://github.com/advisories/GHSA-p88m-4jfj-68fv) — `>=7.0.0 <7.28.0`<br>[undici WebSocket client vulnerable to denial of service via fragment count bypass](https://github.com/advisories/GHSA-vxpw-j846-p89q) — `>=7.0.0 <7.28.0`<br>[undici vulnerable to cross-origin request routing via SOCKS5 proxy pool reuse](https://github.com/advisories/GHSA-hm92-r4w5-c3mj) — `>=7.23.0 <7.28.0`<br>[undici vulnerable to Set-Cookie SameSite attribute downgrade via permissive substring matching](https://github.com/advisories/GHSA-g8m3-5g58-fq7m) — `>=7.0.0 <7.28.0`<br>[undici vulnerable to cross-user information disclosure via shared cache whitespace bypass](https://github.com/advisories/GHSA-pr7r-676h-xcf6) — `>=7.0.0 <7.28.0`<br>[undici vulnerable to downstream response desynchronization via retry interceptor](https://github.com/advisories/GHSA-8xcm-r25x-g524) — `>=7.0.0 <7.29.0`<br>[undici vulnerable to cross-user information disclosure and parse-time crash via degenerate private cache directives](https://github.com/advisories/GHSA-4cwx-7wf7-3272) — `>=7.0.0 <7.29.0`<br>[undici vulnerable to CRLF Injection via blob-like body 'type' property](https://github.com/advisories/GHSA-m8rv-5g2x-5cg5) — `>=7.0.0 <7.29.0`<br>[undici vulnerable to cross-user information disclosure via whitespace around equals in Cache-Control directives](https://github.com/advisories/GHSA-jr45-8vmc-qm54) — `>=7.0.0 <7.29.0`<br>[undici vulnerable to cookie attribute injection via unsanitized domain and unparsed setCookie fields](https://github.com/advisories/GHSA-v3r7-h72x-cjcm) — `>=7.0.0 <7.29.0`<br>[undici vulnerable to HTTP response queue poisoning via keep-alive socket reuse](https://github.com/advisories/GHSA-35p6-xmwp-9g52) — `>=7.0.0 <7.28.0` |
| ws (high) | `node_modules/ws` **8.20.1** — ws@8.20.1 | `node_modules/ws` **8.21.0** — ws@8.21.0 | [ws: Memory exhaustion DoS from tiny fragments and data chunks](https://github.com/advisories/GHSA-96hv-2xvq-fx4p) — `>=8.0.0 <8.21.0` |

## Complete changed lock nodes

Includes unchanged-version metadata changes; no hidden bulk-upgrade summary. [Full machine-readable delta](complete-lock-delta.json).

| Physical path | Before | After | Changed fields |
|---|---|---|---|
| `node_modules/@babel/core` | 7.29.0 | 7.29.7 | dependencies, integrity, resolved, version |
| `node_modules/@babel/helpers` | 7.29.2 | 7.29.7 | dependencies, integrity, resolved, version |
| `node_modules/@eslint/config-array/node_modules/balanced-match` | Absent | 4.0.4 | dev, engines, integrity, license, resolved, version |
| `node_modules/@eslint/config-array/node_modules/brace-expansion` | Absent | 5.0.12 | dependencies, dev, engines, integrity, license, resolved, version |
| `node_modules/@eslint/config-array/node_modules/minimatch` | Absent | 10.2.6 | dependencies, dev, engines, funding, integrity, license, resolved, version |
| `node_modules/@istanbuljs/load-nyc-config/node_modules/js-yaml` | 3.14.2 | 3.15.2 | integrity, resolved, version |
| `node_modules/@nestjs/swagger/node_modules/js-yaml` | 4.1.1 | Removed | bin, dependencies, integrity, license, resolved, version |
| `node_modules/@octokit/auth-token` | 2.5.0 | 4.0.0 | dependencies, engines, integrity, resolved, version |
| `node_modules/@octokit/core` | 3.6.0 | 5.2.2 | dependencies, engines, integrity, resolved, version |
| `node_modules/@octokit/endpoint` | 6.0.12 | 9.0.6 | dependencies, engines, integrity, resolved, version |
| `node_modules/@octokit/graphql` | 4.8.0 | 7.1.1 | dependencies, engines, integrity, resolved, version |
| `node_modules/@octokit/openapi-types` | 12.11.0 | 24.2.0 | integrity, resolved, version |
| `node_modules/@octokit/plugin-paginate-rest` | 2.21.3 | 11.4.4-cjs.2 | dependencies, engines, integrity, peerDependencies, resolved, version |
| `node_modules/@octokit/plugin-request-log` | 1.0.4 | 4.0.1 | engines, integrity, peerDependencies, resolved, version |
| `node_modules/@octokit/plugin-rest-endpoint-methods` | 5.16.2 | 13.3.2-cjs.1 | dependencies, engines, integrity, peerDependencies, resolved, version |
| `node_modules/@octokit/request` | 5.6.3 | 8.4.1 | dependencies, engines, integrity, resolved, version |
| `node_modules/@octokit/request-error` | 2.1.0 | 5.1.1 | dependencies, engines, integrity, resolved, version |
| `node_modules/@octokit/rest` | 18.12.0 | 20.1.2 | dependencies, engines, integrity, resolved, version |
| `node_modules/@octokit/types` | 6.41.0 | 13.10.0 | dependencies, integrity, resolved, version |
| `node_modules/@tootallnate/once` | 2.0.1 | Removed | dev, engines, integrity, license, resolved, version |
| `node_modules/@typescript-eslint/typescript-estree/node_modules/balanced-match` | Absent | 4.0.4 | dev, engines, integrity, license, resolved, version |
| `node_modules/@typescript-eslint/typescript-estree/node_modules/brace-expansion` | Absent | 5.0.12 | dependencies, dev, engines, integrity, license, resolved, version |
| `node_modules/@typescript-eslint/typescript-estree/node_modules/minimatch` | Absent | 10.2.6 | dependencies, dev, engines, funding, integrity, license, resolved, version |
| `node_modules/baseline-browser-mapping` | 2.10.21 | 2.11.25 | integrity, resolved, version |
| `node_modules/body-parser` | 2.2.2 | 2.3.0 | dependencies, integrity, resolved, version |
| `node_modules/body-parser/node_modules/content-type` | Absent | 2.1.0 | engines, funding, integrity, license, resolved, version |
| `node_modules/brace-expansion` | 2.1.0 | 2.1.7 | integrity, resolved, version |
| `node_modules/browserslist` | 4.28.2 | 4.29.0 | dependencies, integrity, resolved, version |
| `node_modules/caniuse-lite` | 1.0.30001790 | 1.0.30001810 | integrity, resolved, version |
| `node_modules/concat-map` | Absent | 0.0.1 | dev, integrity, license, resolved, version |
| `node_modules/danger` | 12.3.4 | 13.0.8 | dependencies, integrity, resolved, version |
| `node_modules/danger/node_modules/agent-base` | Absent | 7.1.4 | dev, engines, integrity, license, resolved, version |
| `node_modules/danger/node_modules/ansi-styles` | 3.2.1 | 4.3.0 | dependencies, engines, funding, integrity, resolved, version |
| `node_modules/danger/node_modules/chalk` | 2.4.2 | 4.1.2 | dependencies, engines, funding, integrity, resolved, version |
| `node_modules/danger/node_modules/color-convert` | 1.9.3 | Removed | dependencies, dev, integrity, license, resolved, version |
| `node_modules/danger/node_modules/color-name` | 1.1.3 | Removed | dev, integrity, license, resolved, version |
| `node_modules/danger/node_modules/escape-string-regexp` | 1.0.5 | Removed | dev, engines, integrity, license, resolved, version |
| `node_modules/danger/node_modules/has-flag` | 3.0.0 | Removed | dev, engines, integrity, license, resolved, version |
| `node_modules/danger/node_modules/https-proxy-agent` | Absent | 7.0.6 | dependencies, dev, engines, integrity, license, resolved, version |
| `node_modules/danger/node_modules/p-limit` | 2.3.0 | Removed | dependencies, dev, engines, funding, integrity, license, resolved, version |
| `node_modules/danger/node_modules/supports-color` | 5.5.0 | Removed | dependencies, dev, engines, integrity, license, resolved, version |
| `node_modules/deepmerge-ts` | 7.1.5 | 8.0.0 | funding, integrity, resolved, version |
| `node_modules/electron-to-chromium` | 1.5.344 | 1.5.430 | integrity, resolved, version |
| `node_modules/eslint/node_modules/balanced-match` | Absent | 4.0.4 | dev, engines, integrity, license, resolved, version |
| `node_modules/eslint/node_modules/brace-expansion` | Absent | 5.0.12 | dependencies, dev, engines, integrity, license, resolved, version |
| `node_modules/eslint/node_modules/minimatch` | Absent | 10.2.6 | dependencies, dev, engines, funding, integrity, license, resolved, version |
| `node_modules/expand-tilde` | 2.0.2 | Removed | dependencies, dev, engines, integrity, license, resolved, version |
| `node_modules/extend-shallow` | 2.0.1 | Removed | dependencies, dev, engines, integrity, license, resolved, version |
| `node_modules/fast-uri` | 3.1.2 | 3.1.8 | integrity, resolved, version |
| `node_modules/filelist/node_modules/minimatch` | Absent | 5.1.9 | dependencies, dev, engines, integrity, license, resolved, version |
| `node_modules/fork-ts-checker-webpack-plugin/node_modules/brace-expansion` | Absent | 1.1.21 | dependencies, dev, integrity, license, resolved, version |
| `node_modules/fork-ts-checker-webpack-plugin/node_modules/minimatch` | Absent | 3.1.5 | dependencies, dev, engines, integrity, license, resolved, version |
| `node_modules/form-data` | 4.0.5 | 4.0.6 | dependencies, integrity, resolved, version |
| `node_modules/fs-exists-sync` | 0.1.0 | Removed | dev, engines, integrity, license, resolved, version |
| `node_modules/get-stdin` | 6.0.0 | Removed | dev, engines, integrity, license, resolved, version |
| `node_modules/git-config-path` | 1.0.1 | Removed | dependencies, dev, engines, integrity, license, resolved, version |
| `node_modules/glob/node_modules/brace-expansion` | 5.0.6 | 5.0.12 | engines, integrity, resolved, version |
| `node_modules/hasown` | 2.0.3 | 2.0.4 | integrity, resolved, version |
| `node_modules/homedir-polyfill` | 1.0.3 | Removed | dependencies, dev, engines, integrity, license, resolved, version |
| `node_modules/http-proxy-agent` | 5.0.0 | 7.0.2 | dependencies, engines, integrity, resolved, version |
| `node_modules/http-proxy-agent/node_modules/agent-base` | Absent | 7.1.4 | dev, engines, integrity, license, resolved, version |
| `node_modules/ini` | 1.3.8 | 5.0.0 | engines, integrity, resolved, version |
| `node_modules/is-extendable` | 0.1.1 | Removed | dev, engines, integrity, license, resolved, version |
| `node_modules/is-plain-object` | 5.0.0 | Removed | dev, engines, integrity, license, resolved, version |
| `node_modules/js-yaml` | 4.2.0 | 4.3.2 | integrity, resolved, version |
| `node_modules/lodash.find` | 4.6.0 | Removed | dev, integrity, license, resolved, version |
| `node_modules/lodash.keys` | 4.2.0 | Removed | dev, integrity, license, resolved, version |
| `node_modules/multer` | 2.1.1 | 2.3.0 | integrity, resolved, version |
| `node_modules/node-releases` | 2.0.38 | 2.0.56 | engines, integrity, resolved, version |
| `node_modules/parse-git-config` | 2.0.3 | Removed | dependencies, dev, engines, integrity, license, resolved, version |
| `node_modules/parse-passwd` | 1.0.0 | Removed | dev, engines, integrity, license, resolved, version |
| `node_modules/qs` | 6.15.2 | 6.16.0 | dependencies, integrity, resolved, version |
| `node_modules/shell-quote` | 1.8.3 | 1.10.0 | integrity, resolved, version |
| `node_modules/side-channel` | 1.1.0 | 1.1.1 | dependencies, integrity, resolved, version |
| `node_modules/supports-hyperlinks` | 1.0.1 | 4.5.0 | dependencies, engines, funding, integrity, resolved, version |
| `node_modules/supports-hyperlinks/node_modules/has-flag` | 2.0.0 | 5.0.1 | engines, funding, integrity, resolved, version |
| `node_modules/supports-hyperlinks/node_modules/supports-color` | 5.5.0 | 10.2.2 | dependencies, engines, funding, integrity, resolved, version |
| `node_modules/supports-hyperlinks/node_modules/supports-color/node_modules/has-flag` | 3.0.0 | Removed | dev, engines, integrity, license, resolved, version |
| `node_modules/test-exclude/node_modules/brace-expansion` | Absent | 1.1.21 | dependencies, dev, integrity, license, resolved, version |
| `node_modules/test-exclude/node_modules/minimatch` | Absent | 3.1.5 | dependencies, dev, engines, integrity, license, resolved, version |
| `node_modules/type-is` | 2.0.1 | 2.1.0 | dependencies, engines, funding, integrity, resolved, version |
| `node_modules/type-is/node_modules/content-type` | Absent | 2.1.0 | engines, funding, integrity, license, resolved, version |
| `node_modules/undici` | 7.26.0 | 7.29.1 | integrity, resolved, version |
| `node_modules/update-browserslist-db` | 1.2.3 | 1.3.3 | integrity, resolved, version |
| `node_modules/ws` | 8.20.1 | 8.21.0 | integrity, resolved, version |

## Every direct pin

| Category | Package | Old requested | Old lock | Exact pin / new lock |
|---|---|---|---|---|
| dependencies | @anthropic-ai/sdk | ^0.104.1 | 0.104.1 | 0.104.1 |
| dependencies | @aws-sdk/client-s3 | ^3.1071.0 | 3.1071.0 | 3.1071.0 |
| dependencies | @dropbox/sign | ^1.11.0 | 1.11.0 | 1.11.0 |
| dependencies | @nest-lab/throttler-storage-redis | ^1.2.0 | 1.2.0 | 1.2.0 |
| dependencies | @nestjs/common | ^11.1.26 | 11.1.26 | 11.1.26 |
| dependencies | @nestjs/config | ^4.0.0 | 4.0.4 | 4.0.4 |
| dependencies | @nestjs/core | ^11.1.27 | 11.1.27 | 11.1.27 |
| dependencies | @nestjs/platform-express | ^11.1.26 | 11.1.26 | 11.1.26 |
| dependencies | @nestjs/schedule | ^6.1.3 | 6.1.3 | 6.1.3 |
| dependencies | @nestjs/swagger | ^11.4.4 | 11.4.4 | 11.4.4 |
| dependencies | @nestjs/throttler | ^6.0.0 | 6.5.0 | 6.5.0 |
| dependencies | @prisma/client | ^6.19.3 | 6.19.3 | 6.19.3 |
| dependencies | @sentry/node | ~10.60.0 | 10.60.0 | 10.60.0 |
| dependencies | @supabase/supabase-js | ^2.108.1 | 2.108.1 | 2.108.1 |
| dependencies | axios | ^1.18.1 | 1.18.1 | 1.18.1 |
| dependencies | class-transformer | ^0.5.1 | 0.5.1 | 0.5.1 |
| dependencies | class-validator | ^0.15.1 | 0.15.1 | 0.15.1 |
| dependencies | expo-server-sdk | ^6.1.0 | 6.1.0 | 6.1.0 |
| dependencies | handlebars | ^4.7.8 | 4.7.9 | 4.7.9 |
| dependencies | helmet | ^8.2.0 | 8.2.0 | 8.2.0 |
| dependencies | ioredis | ^5.11.1 | 5.11.1 | 5.11.1 |
| dependencies | jose | ^6.2.3 | 6.2.3 | 6.2.3 |
| dependencies | js-yaml | 4.2.0 | 4.2.0 | 4.3.2 |
| dependencies | openai | ^6.39.0 | 6.39.0 | 6.39.0 |
| dependencies | pdfkit | ^0.15.2 | 0.15.2 | 0.15.2 |
| dependencies | posthog-node | ^5.36.8 | 5.36.8 | 5.36.8 |
| dependencies | prom-client | ^15.1.3 | 15.1.3 | 15.1.3 |
| dependencies | reflect-metadata | ^0.2.0 | 0.2.2 | 0.2.2 |
| dependencies | rxjs | ^7.8.1 | 7.8.2 | 7.8.2 |
| dependencies | ws | ^8.20.1 | 8.20.1 | 8.21.0 |
| dependencies | zod | ^4.4.3 | 4.4.3 | 4.4.3 |
| devDependencies | @babel/preset-env | ^7.29.7 | 7.29.7 | 7.29.7 |
| devDependencies | @eslint/js | ^10.0.1 | 10.0.1 | 10.0.1 |
| devDependencies | @flydotio/dockerfile | ^0.7.10 | 0.7.10 | 0.7.10 |
| devDependencies | @nestjs/cli | ^11.0.0 | 11.0.21 | 11.0.21 |
| devDependencies | @nestjs/testing | ^11.1.26 | 11.1.26 | 11.1.26 |
| devDependencies | @types/jest | ^30.0.0 | 30.0.0 | 30.0.0 |
| devDependencies | @types/js-yaml | 4.0.9 | 4.0.9 | 4.0.9 |
| devDependencies | @types/node | ^26.0.0 | 26.0.0 | 26.0.0 |
| devDependencies | @types/passport-jwt | ^4.0.0 | 4.0.1 | 4.0.1 |
| devDependencies | @types/ws | ^8.18.1 | 8.18.1 | 8.18.1 |
| devDependencies | @typescript-eslint/eslint-plugin | ^8.60.0 | 8.62.0 | 8.62.0 |
| devDependencies | @typescript-eslint/parser | ^8.60.0 | 8.62.0 | 8.62.0 |
| devDependencies | babel-jest | ^30.4.1 | 30.4.1 | 30.4.1 |
| devDependencies | danger | 12.3.4 | 12.3.4 | 13.0.8 |
| devDependencies | eslint | ^10.5.0 | 10.5.0 | 10.5.0 |
| devDependencies | fast-check | ^4.8.0 | 4.8.0 | 4.8.0 |
| devDependencies | globals | ^17.6.0 | 17.6.0 | 17.6.0 |
| devDependencies | jest | ^30.4.2 | 30.4.2 | 30.4.2 |
| devDependencies | lefthook | ^2.1.9 | 2.1.9 | 2.1.9 |
| devDependencies | prisma | ^6.19.3 | 6.19.3 | 6.19.3 |
| devDependencies | ts-jest | ^29.4.9 | 29.4.9 | 29.4.9 |
| devDependencies | ts-node | ^10.9.0 | 10.9.2 | 10.9.2 |
| devDependencies | typescript | ^5.0.0 | 5.9.3 | 5.9.3 |
| devDependencies | typescript-eslint | ^8.62.0 | 8.62.0 | 8.62.0 |

## Parent-owned findings and release handoff

The dependency audit/install/runtime-compatibility blocker is locally remediated with a reproducible patch and honest graph/SBOM proof. Remaining findings are independent peer review, actual required remote CI/branch controls/pass-rate, secrets/typing/enforcement gaps, PR/release SBOM publication, artifact runtime provenance, inherited skips/todos and separate recovery/C1 schema/DB compatibility proof. No silence, suppression or scope substitution converts those to green. [Checklists above](BUILD_REPORT.md), [release record](RELEASE_RESOURCES.json), [prior control baseline](../c1-split/C1a_REPORT.md).

Parent acceptance resources: corrected-candidate.patch + SHA256, corrected-freeze.json replay proof, frozen-files/, FINAL_IDENTITY.json, FINAL_GATES.json, FINAL_ADVISORY_PATH_DELTA.json, all direct/lock deltas, sbom.cdx.json, raw original/corrected full-suite results, guard/controls/runtime event logs and command-ledger.jsonl. Reconstruct from exact c23 base using the patch in a new isolated clone; parent owns any commit/push, remote checks and independent auditors. [Resource index](RELEASE_RESOURCES.json), [patch/replay](corrected-freeze.json).

All source and execution resources are released. Do not reuse this report for a different tree or merge it with recovery/C1 proof without fresh validation of that combination. Requested Astra remains inherited; actual runtime model verification and independent audit are not claimed. [Final identity](FINAL_IDENTITY.json), [release record](RELEASE_RESOURCES.json).

VERDICT: FINDINGS
