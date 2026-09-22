## BUILD MATRIX

- backend HEAD: `238f0f1f152ebbb1b4691f555e98c888473d8ee7`
- ctxrepo HEAD: `2ead9b05e967713201c03619b564a3db4cadea35`
- PR #524 head: `238f0f1f152ebbb1b4691f555e98c888473d8ee7`
- PR #524 base (origin/main): `c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7`
- timestamp (ISO 8601 UTC): `2026-09-18T04:40:33Z`

# PR524 independent Lens A correctness/security audit

## Independence, scope and result

This is an independent read-only review of the complete three-file delta, every changed lockfile entry, affected consumers, and the expressly mandated repository/process controls—not a whole-product certification. The matrix above repeats the dispatch matrix; the candidate tree is `b2bb1666a91d60927d3ee1d6455ce687ce1c8739`. Source and canonical context were clean and stationary when inspected. [Measurements](measurements.json); [control observations](control-observations.json).

**The dependency repair has credible compatibility and vulnerability evidence, but the required release controls are not satisfied.** No new exploitable dependency regression is demonstrated by this review. Findings below distinguish inherited defects, newly exposed documentation/test weaknesses, and unavailable evidence; missing evidence is not represented as proof of a production failure. [Complete diff](complete.diff); [native evidence summary](native-summary.json).

Requested identity: Astra through inheritance. I cannot independently authenticate that model/runtime identity from available tool evidence and do not claim it as verified. I did not read the other auditor's work or the operator's prediction ledger, mutate source/context, install packages, borrow dependencies, execute product tests/compilers/scanners, access production, or perform remote writes. Lightweight Git/JSON/text analysis and read-only GitHub identity verification were used.

I read the complete re-establishment brief, canonical `AGENT_RULES.md` including Appendix A, the complete 50-failures reference, R100 mandate/checklist, and the original builder authorization after independently inventorying source. The present brief is neutral; the historical builder brief's outcome-shaped language was not adopted as an instruction or conclusion. Current canonical numbering governs: R100.1–50 map to R24–73, A1–A5 to R74–78; nonexistent R127–129 were not invented. [Brief](../PR524_REESTABLISHMENT_BRIEF.md); [canonical rules](../../op81-audit-context/AGENT_RULES.md); [failure reference](../../op81-audit-context/quality-references/50_FAILURES_OF_AI_GENERATED_CODE.md); [original authorization](../../op80-evidence/handoffs/op80-execution/cycle2-dependency-builder-brief.md).

The brief SHA256 was verified before substantive review and again at closure: `b4fac1c0d4c2283c30b55e74500691453421d7cd461d3a3dd42fef000c170ed0`. Closing verification at `2026-09-18T04:50:54.001489+00:00` confirms unchanged source/context HEADs, clean worktrees, expected candidate tree/base, and matching supplied hashes for the command ledger, full-suite JSON and lockfile. The canonical clone's unrelated `origin/main` is not substituted for its pinned detached HEAD. [Closing verification](closing-verification.json).

## Complete delta and independent measurements

| Changed file | Added | Removed | Net | Review |
|---|---:|---:|---:|---|
| `package.json` | 65 | 57 | 8 | Every direct pin and override reviewed |
| `package-lock.json` | 562 | 498 | 64 | Entire textual delta and all changed node metadata reviewed |
| `test/dependency-compatibility.spec.ts` | 158 | 0 | 158 | All eight tests, helper and child-process boundaries reviewed |
| **Total** | **785** | **555** | **230** | No application, migration, workflow or Docker source changed |

These counts are independently derived from the pinned base/head, not PR labels. Production application source additions/removals are **0/0**; test additions are **158**. The test:source numeric ratio is undefined because the denominator is zero, not “infinite” or a fabricated 2.0; the zero-production-change branch passes. Canonical production LOC is 0, or a conservative net 8 if the manifest is counted as production configuration; the existing workflow's broader pathspec counts 158 test lines, also below 400. [Measurements](measurements.json); [measurement script](measure.py); [complete diff](complete.diff).

All 55 direct dependencies—31 production, 24 development—are exact pins matching the lockfile. Only three direct **resolved** versions change: `js-yaml 4.2.0→4.3.2`, `ws 8.20.1→8.21.0`, and `danger 12.3.4→13.0.8`; most manifest version changes simply freeze already-locked versions. The global minimatch override is removed; `diff` is narrowed to exact `9.0.0`; `qs` becomes `6.16.0`; three consumer-scoped overrides select Prisma/deepmerge 8, Nest/Multer 2.3, and Swagger/YAML 4.3.2. [Manifest:31–101](../../op81-backend-audit-a/package.json#L31); [lock changes](lock-changes.json).

Lock entries including root go **1,151→1,150**: 20 added, 21 removed, 45 modified including root; thus **85 package nodes plus root** change. Every candidate package entry has integrity metadata and an HTTPS npm-registry resolution; no new package install-script flag appears. This verifies metadata consistency, not registry publisher authenticity or package-tarball contents. The exact, complete path/version/field inventory is retained—not sampled—in [lock-inventory.txt](lock-inventory.txt), with full before/after objects in [lock-changes.json](lock-changes.json).

### Lockfile families and consumer conclusions

| Family | Exhaustive change grouping | Correctness/security assessment |
|---|---|---|
| Prisma | `deepmerge-ts 7.1.5→8.0.0` | Cross-major override merits real consumer evidence; config-loading, missing-config, cyclic/nested/array/Map/Set paths are tested. True ESM conditional export is not established by the named test; F19. |
| Nest/HTTP | `body-parser 2.2.2→2.3.0`, `multer 2.1.1→2.3.0`, `type-is 2.0.1→2.1.0`, two nested `content-type 2.1.0` additions, `qs 6.15.2→6.16.0`, `side-channel 1.1.0→1.1.1` | Relevant to raw-body/bootstrap and parser semantics; Multer success/truncation/size-limit cases are real. No changed route/schema/authorization logic; a malformed HTTP/raw-body end-to-end probe would strengthen, not replace, existing evidence. |
| YAML | root `4.2.0→4.3.2`, NYC `3.14.2→3.15.2`, removed Swagger nested `4.1.1` | Consumer-local resolution preserves NYC `safeLoad` versus Swagger `load`; alias, round-trip and duplicate-key assertions are real. |
| WebSocket/network | `ws 8.20.1→8.21.0`, `undici 7.26.0→7.29.1`, `form-data 4.0.5→4.0.6`, `fast-uri 3.1.2→3.1.8`, `hasown 2.0.3→2.0.4` | Auth/Supabase use named `WebSocket` as transport; Receiver tests cover normal frame and two resource limits, not live Supabase/network behavior. No justified claim of new connection regression. |
| Danger/Octokit | Danger 13 plus all 12 changed Octokit nodes; agent-base/proxy agents, chalk/ansi styles, ini 5, supports-hyperlinks/colors/has-flag graph; obsolete git/config/helper nodes removed | Real Git-object probe and native successful Danger job support compatibility. Do not call this “dev-only production-irrelevant”: Docker retains dev dependencies, F11. |
| Glob/minimatch | Three new nested balanced-match/brace-expansion/minimatch triples under ESLint/config-array/typescript-estree; filelist minimatch 5; fork-ts-checker and test-exclude brace 1/minimatch 3 pairs; root/glob brace patches; concat-map addition | Removing the global major override restores consumer-compatible APIs; actual TestExclude inclusion/exclusion is asserted. Presence of older major numbers alone is not an advisory finding. |
| Babel/browser data | Babel core/helpers 7.29.7; baseline-browser-mapping, browserslist, caniuse-lite, electron-to-chromium, node-releases, update-browserslist-db | Build/test transitive updates, not application API changes; compiler/build/default suite succeed in supplied native records. |
| Shell quoting | `shell-quote 1.8.3→1.10.0` | Actual invalid-operator rejection and literal-argument round-trip asserted, not a version-string test. |

All family statements above derive from the [complete lock inventory](lock-inventory.txt), [full node metadata](lock-changes.json), and [compatibility tests:1–158](../../op81-backend-audit-a/test/dependency-compatibility.spec.ts#L1).

The unchanged production consumers inspected include Nest bootstrap/validation/CORS/error filters, Swagger setup, AuthService's Supabase clients, SupabaseService's broadcast lifecycle, health/readiness, production build inclusion, Docker installation/copying, and the CI/Danger/readiness/deployment workflows. Existing auth tests replace the Supabase client and Jest maps `jose` to a mock; those tests are not live authentication/transport proof. [Bootstrap](../../op81-backend-audit-a/src/main.ts); [Swagger](../../op81-backend-audit-a/src/common/openapi.ts); [Supabase service](../../op81-backend-audit-a/src/supabase/supabase.service.ts); [auth tests](../../op81-backend-audit-a/test/auth.service.spec.ts); [Jest:81–140](../../op81-backend-audit-a/jest.config.js#L81).

### Banned-token accounting

| Literal | Added | Removed | Net |
|---|---:|---:|---:|
| `@ts-ignore` | 0 | 0 | 0 |
| `as any` | 0 | 0 | 0 |
| `as unknown as` | 0 | 0 | 0 |
| `as never` | 0 | 0 | 0 |
| `.catch(()=>undefined)` | 0 | 0 | 0 |
| `.catch(()=>null)` | 0 | 0 | 0 |
| `.catch(()=>{})` | 0 | 0 | 0 |
| `Coming soon` | 0 | 0 | 0 |

The whole diff, including the test file, was counted independently; no added TODO/FIXME, user-visible stub, empty catch, hidden route, or silent failure is introduced. The child rejection handler logs and sets exit status; the parent verifies error, signal, status, stderr and the exact completion marker. An unresolved promise cannot silently pass because it cannot print that marker. [Measurements](measurements.json); [test helper:5–24](../../op81-backend-audit-a/test/dependency-compatibility.spec.ts#L5).

## Native evidence: supported claims and limits

| Evidence | Independently read result | Limit |
|---|---|---|
| Install | 1,117 packages installed; explicit Prisma client generation 6.19.3 | `--ignore-scripts`; not a complete production lifecycle/image validation |
| Dependency graph | 55 top-level dependencies; no reported root problems/error | Native npm output, not auditor-installed modules |
| Vulnerability audit | Zero critical/high/moderate/low/info; zero advisory entries | Current advisory snapshot, not proof of no unknown vulnerability |
| Typecheck / build | Native ledger exit 0; `nest build` completes | Typecheck log is empty; six-command ledger does not contain every argv/runtime version |
| Lint | Exit 0, **21 warnings, 0 errors** | Only `src/**/*.ts`; does not lint this new test file |
| Focused | **1 suite, 8 tests passed** | Package probes; no production deployment or live external-service test |
| Default suite | **543 total; 531 passed, 12 skipped; 8,021 tests: 7,857 passed, 159 skipped, 5 todo; 6 snapshots passed** | Root-limited default Jest suite, not every repository test; separate live lanes remain separate |
| GitHub checks | **15 records: 14 success, 1 skipped** | Includes duplicate size-label and CodeQL records; strict deploy-readiness is skipped |
| CodeQL analysis | Analysis `1796271510`, **201 rules, 0 results, empty error/warning** | Actual successful analysis exists; it does not repair fail-open workflow policy |

Counts come from [native summary](native-summary.json), [command ledger](../validation/command-ledger.jsonl), [install](../validation/install.log), [Prisma generation](../validation/prisma-generate.log), [lint](../validation/lint.log), [security](../validation/security.log), [focused results](../validation/focused-results.json), and [full results](../validation/full-suite-results.json).

The native full-suite ledger completes at `2026-09-18T04:38:32Z`, exit 0. The reported outer-wrapper timeout is not a failed Jest result; conversely, a successful Jest result is not proof of release readiness. No baseline “26 vulnerabilities” or local “1,117-component SBOM” assertion was independently re-established from a corresponding baseline/SBOM primary artifact in this evidence set. [Ledger](../validation/command-ledger.jsonl); [brief](../PR524_REESTABLISHMENT_BRIEF.md); [PR metadata](../pr524.json).

GitHub's CodeQL analysis checked synthetic merge `0786a9f087d8dcec7dfb8d1271c78aeba5baabb3`, not the product commit. A separate read-only GitHub Git-object lookup verifies its exact candidate tree and base/head parents; the object is not present in the auditor's source-only clone. Therefore this is historical exact-content CI evidence, not an invented local merge or production deployment. [CodeQL record](../backend-codeql-analysis.json); [verified merge object](synthetic-merge.json); [local object observation](control-observations.json).

For R100.A4, the 100 returned workflow runs are chronologically ordered and extend back to July 22, earlier than the entire September 4–18 window. Within the 14-day captured window there are **7/7 successful PR-triggered workflow runs**, **1/1 successful `CI` runs**, and one represented PR/head. The observed rate is **100%**, with a very small denominator; it is not 57/60 from the unfiltered multi-month result. The snapshot provides no seven-day below-floor sequence. [Native runs](../backend-runs.json); [window calculation](control-observations.json).

## Findings and closure conditions

Severity follows canonical P0–P3; no P0 is asserted. Inherited findings still require operator disposition under the supplied audit mandate, but this report does not authorize widening this builder's source ownership or changing security settings. Every repair needs an authorized slice and fresh evidence. [Canonical audit/closure rules](../../op81-audit-context/AGENT_RULES.md#L339).

### F01 — P1 — Main is not protected; green checks do not enforce review

**Inherited, native evidence.** The protection API explicitly returns “Branch not protected” (404), and repository rulesets are `[]`; this is not an inference from an inaccessible generic resource. There is no checked-in `branch-protection.yml`, while the setup script's required-check list omits the mandated security gates and is not reconciliation from that YAML. This permits bypassing review/checks regardless of this PR's green jobs. [Protection response](../backend-protection.json); [stderr](../backend-protection.stderr); [rulesets](../backend-rulesets.json); [control inventory](control-observations.json); [setup script](../../op81-backend-audit-a/scripts/setup-branch-protection.sh).

**Close:** operator-approved protection/ruleset reconciliation, genuine independent approval/code-owner controls, admin enforcement, linear history and all required checks; preserve before/after native API evidence. A second PAT for the same account, suggested by the setup script, does not create a separate reviewer identity.

### F02 — P1 — Automatic deployment is not downstream of strict readiness or CI

**Inherited, source-proven.** `fly-deploy.yml:5–14,74–84` deploys on a main push in its own workflow, with no dependency on CI or strict readiness. The strict job only runs on manual dispatch or `release/*` pushes; PR mode is informational. Therefore a main push can start deployment without the purported hard gate; the present PR's strict gate is actually skipped. [.github/workflows/fly-deploy.yml:5–84](../../op81-backend-audit-a/.github/workflows/fly-deploy.yml#L5); [h4-readiness.yml:204–228](../../op81-backend-audit-a/.github/workflows/h4-readiness.yml#L204); [checks](../backend-checks.json).

**Close:** bind deployment to successful exact-SHA build/security/readiness evidence and a protected environment; negatively test a red readiness board preventing deployment. No deployment was attempted here.

### F03 — P1 — Required secret-scanning defense is absent

**Inherited, source/native controls.** `.gitleaks.toml` and `secrets-scan.yml` are absent, the hook has no gitleaks step, and no required secret check exists on unprotected main. Manual changed-line inspection found no credential introduction, but it cannot establish the required source/history scan. [Control inventory](control-observations.json); [lefthook.yml](../../op81-backend-audit-a/lefthook.yml); [protection](../backend-protection.json).

**Close:** configured, tested pre-commit and fail-closed PR/history scanning, required check, and sanitized scan evidence. This is a control failure, not an allegation that a live secret was found.

### F04 — P1 — Zero current advisories are not backed by a required vulnerability gate

**Inherited.** The native audit is genuinely zero, but `ci.yml:38–61` has install/lint/typecheck/build/test and no `npm audit --audit-level=high` gate; the workflow inventory contains no alternative SCA gate and protection requires none. npm install warnings alone are not a severity-blocking audit. [Security output](../validation/security.log); [ci.yml:38–61](../../op81-backend-audit-a/.github/workflows/ci.yml#L38); [workflow inventory](control-observations.json).

**Close:** required high/critical audit gate over the locked graph, fail-closed handling of audit infrastructure errors, and owner/expiry validation if suppressions are introduced. No suppression file currently exists; that absence alone is not a defect.

### F05 — P1 — CodeQL failure can be converted to success; Semgrep absent

**Inherited, source-proven.** CodeQL analyze has `continue-on-error: true`; on any unsuccessful outcome its fallback treats a missing settings field or failed settings API call as “disabled” and exits 0. It does not distinguish upload-only failure from analysis failure. No Semgrep workflow exists. The actual successful 201-rule analysis contradicts any claim that this head had no CodeQL analysis, but does not eliminate the bypass. [codeql.yml:43–73](../../op81-backend-audit-a/.github/workflows/codeql.yml#L43); [analysis record](../backend-codeql-analysis.json); [workflow inventory](control-observations.json).

**Close:** fail closed on unknown/error outcomes, explicitly validate analysis and policy findings, and install the mandatory Semgrep ERROR gate with justified suppressions and required checks.

### F06 — P1 — SBOM is not a PR control, and its install path is unsound

**Inherited.** `sbom.yml:8–12` has no PR trigger; retention is correctly 90 days, but there is no release attachment. Its `npm ci --omit=dev` still executes the root `prepare: lefthook install` although lefthook is a dev dependency. This is a source-derived missing-tool failure risk, not a reproduced SBOM execution. The next `npm install --no-save @cyclonedx/cdxgen@10.11.0` also changes the analyzed dependency environment instead of using isolated tooling over the frozen graph. [sbom.yml:8–63](../../op81-backend-audit-a/.github/workflows/sbom.yml#L8); [package.json:29,83](../../op81-backend-audit-a/package.json#L29).

**Close:** PR-required SBOM with ≥30-day retention and release attachment; explicit safe lifecycle handling; isolate the generator and show that inventory describes the delivered runtime rather than generator dependencies. Prove success with native logs and artifact hash.

### F07 — P1 — Required typing and unused-code gates are disabled or warning-only

**Inherited, observed effect.** `tsconfig.json` lacks `noUnusedLocals`/`noUnusedParameters`; ESLint's explicit-any rule is off, unused-vars is warn, type-aware unsafe rules/custom cast rules are absent, and CI does not fail on warnings. The supplied lint run indeed passes with 21 warnings. Existing `WS as any` consumers demonstrate the type boundary still present, but this PR adds zero banned casts. [tsconfig](../../op81-backend-audit-a/tsconfig.json); [eslint.config.js:30–82](../../op81-backend-audit-a/eslint.config.js#L30); [lint output](../validation/lint.log); [Supabase:21](../../op81-backend-audit-a/src/supabase/supabase.service.ts#L21).

**Close:** required strict unused/type-aware rules and zero-warning CI over the intended source/test set; fix findings rather than adding new casts or silent disables.

### F08 — P1 — Banned-token gate excludes tests and nets different violations together

**Inherited, deterministic counterexample.** Workflow lines 71–72 exclude `*.spec.*`/`*.test.*`, despite the canonical rule applying to tests. Lines 105–128 print per-token deltas but fail only on the aggregate: deleting one `as any` and adding one `as never` yields total zero and passes even though a banned token has positive net addition. This candidate independently has zero additions, so its measured PASS is not rescinded. [r100-quality-gate.yml:64–135](../../op81-backend-audit-a/.github/workflows/r100-quality-gate.yml#L64); [lightweight counterexample](gate-counterexample.json); [candidate measurements](measurements.json).

**Close:** include tests, fail on each positive token delta, count occurrences rather than just matching lines where required, and regression-test substitution, multiple occurrences and scan-path boundaries.

### F09 — P2 — Assertion enforcement does not cover the new test

**Inherited control, directly applicable to changed file.** `npm run lint` only targets `src/**/*.ts`; ESLint has no `jest/expect-expect` error rule or registered `probe` helper. The eight new tests genuinely assert through `probe`, so this is not eight assertionless tests. The mandated automated assertion check and its registration are missing. [package.json:10](../../op81-backend-audit-a/package.json#L10); [eslint configuration](../../op81-backend-audit-a/eslint.config.js); [test:5–28](../../op81-backend-audit-a/test/dependency-compatibility.spec.ts#L5).

**Close:** lint the test tree, register the legitimate assertion helper, and prove an actually assertionless new test fails.

### F10 — P1 — IaC security scanning is absent

**Inherited.** There is no `iac-security.yml` or Checkov/tfsec job; infra-lint runs syntax/quality tools, not the required security scan. The delivered Dockerfile also has no non-root `USER`, so this is not a theoretical empty infrastructure scope. No infrastructure edit is introduced by PR524, but the brief explicitly requires verification of this repository control. [Workflow inventory](control-observations.json); [infra-lint.yml](../../op81-backend-audit-a/.github/workflows/infra-lint.yml); [Dockerfile:1–67](../../op81-backend-audit-a/Dockerfile#L1).

**Close:** enforce required IaC security scanning and resolve/justify its actual results; do not report a scanner pass until executed.

### F11 — P2 — Runtime image ships development dependencies and test/source assets

**Inherited, newly changed dev graph affected.** The single-stage image performs unrestricted `npm ci`, then `COPY . .`, without pruning or a production-only runtime stage. `.dockerignore` excludes node_modules/dist/env/logs but not test/source trees. Therefore Danger, its upgraded graph and the new test source are included in the image even though TypeScript excludes test emission. This is attack surface and artifact hygiene, not proof that mocks are imported by runtime code. [Dockerfile:13–31,67](../../op81-backend-audit-a/Dockerfile#L13); [.dockerignore](../../op81-backend-audit-a/.dockerignore); [tsconfig.build.json](../../op81-backend-audit-a/tsconfig.build.json).

**Close:** production runtime stage with only required generated Prisma/runtime packages and built assets; verify the image file/dependency inventory and startup.

### F12 — P2 — Artifact identity contract is incomplete

**Inherited.** Docker exposes optional `GIT_SHA`/`RELEASE_VERSION` and Sentry fallback, but has no OCI revision label or BUILD_TIME; no `/api/version` controller is present. Fly passes RELEASE_VERSION rather than GIT_SHA, so Sentry fallback helps but is not the required verifiable artifact/version contract. [Dockerfile:46–55](../../op81-backend-audit-a/Dockerfile#L46); [fly-deploy.yml:79–84](../../op81-backend-audit-a/.github/workflows/fly-deploy.yml#L79); [health controller](../../op81-backend-audit-a/src/health/health.controller.ts); [canonical R121](../../op81-audit-context/AGENT_RULES.md).

**Close:** validated build-time SHA/time, OCI revision label and version endpoint; verify they agree with the deployed artifact without revealing secrets.

### F13 — P2 — Required cryptography exceptions/enforcement are missing

**Inherited; no invented exploit.** `mailchimp.adapter.ts:49` uses MD5 for Mailchimp's subscriber identifier without the required same-line `crypto-allowed` explanation. `fitbit.connector.ts:366` uses protocol-mandated HMAC-SHA1, also without a canonical exception; this is authentication, so R119's checksum-only exception is insufficient by itself. MD5 identifiers and HMAC-SHA1 do not justify claiming broken password hashing or an observed forgery. [Mailchimp adapter:11–49](../../op81-backend-audit-a/src/landing-pages/crm/mailchimp.adapter.ts#L11); [Fitbit connector:348–366](../../op81-backend-audit-a/src/wearables/connectors/fitbit/fitbit.connector.ts#L348); [R119](../../op81-audit-context/AGENT_RULES.md#L1344).

**Close:** document/enforce the legitimate non-security checksum exception; obtain an explicit protocol/governance decision for Fitbit rather than silently changing its signature algorithm and breaking interoperability; add targeted lint/Semgrep enforcement.

### F14 — P2 — Mandatory diff-coverage infrastructure is absent

**Inherited control gap, not an invented low-coverage percentage.** CI runs bare Jest, and Jest specifies collection paths but no diff threshold; no workflow implements the mandatory changed-line coverage gate or uploads a diff-coverage report. This PR adds zero executable production lines, so its numerical coverage denominator is legitimately inapplicable, but the required repository-control verification cannot be marked satisfied. [ci.yml:54–61](../../op81-backend-audit-a/.github/workflows/ci.yml#L54); [jest.config.js:139–141](../../op81-backend-audit-a/jest.config.js#L139); [workflow inventory](control-observations.json); [R116](../../op81-audit-context/AGENT_RULES.md#L1296).

**Close:** implement required changed-production-line coverage with an explicit, tested zero-source branch and the canonical exception path; publish its artifact. Exact dependency pins, paired lock changes and Danger's clean `npm ci --ignore-scripts` are credited under R114; the rule is not misread as a universal ban on every subsequent authorized lifecycle step.

### F15 — P2 — Skip/quarantine and zero-test contracts remain incomplete

**Inherited.** The test script is bare `jest`; CI uses `npm test --if-present`, not the explicit `--passWithNoTests=false` contract, and `test/QUARANTINE.md` is absent while native results retain 12 skipped suites, 159 skipped tests and 5 todos. Jest's default already rejects no tests: absence of the explicit flag is a contractual gap, not proof of an actual zero-test false green. No new skip/todo is introduced by this delta. [package.json:11](../../op81-backend-audit-a/package.json#L11); [ci.yml:61](../../op81-backend-audit-a/.github/workflows/ci.yml#L61); [control inventory](control-observations.json); [full-suite results](../validation/full-suite-results.json).

**Close:** explicit non-optional test invocation and owned, expiring quarantine records with separate evidence for live lanes; do not simply unskip database tests without their infrastructure.

### F16 — P1 — Canonical unenforced-rule tracking is absent

**Inherited process defect.** The stationary canonical clone and product clone both lack `operator-meta/UNENFORCED_RULES.md`, while the June-19-binding controls above remain unenforced well beyond 30 days. No new R-rule is added here, but R125 explicitly requires tracking older unenforced rules, not only checking new-rule diffs. [Control observations](control-observations.json); [R125:1456–1468](../../op81-audit-context/AGENT_RULES.md#L1456); [binding addendum](../PR524_REESTABLISHMENT_BRIEF.md).

**Close:** operator-owned, dated tracking linked to actual enforcement work and accountable owners; do not backdate target dates or assert that creating a ledger alone closes the gates.

### F17 — P2 — Two operator-level evidence contracts remain unverified

**Evidence gap, not asserted absence.** The deployment runbook documents manual backup/rollback, but no current production PITR setting or successful restore-drill evidence is available in the supplied set. Separately, R126 prediction/actual ledger completeness cannot be attested without a prediction-free existence/schema attestation; the prediction ledger was expressly off limits, and this audit's actual result must be recorded after return. [Deploy runbook:278–309](../../op81-backend-audit-a/docs/deploy-runbook.md#L278); [R126:1473–1487](../../op81-audit-context/AGENT_RULES.md#L1473); [independence restriction](../PR524_REESTABLISHMENT_BRIEF.md).

**Close:** parent supplies sanitized PITR/restore evidence and a field-presence-only dispatch attestation, then records this result after return. Do not disclose predictions to auditors or interpret this gap as proof PITR/telemetry does not exist.

### F18 — P2 — Public readiness failure returns raw database error details

**Inherited, concrete security-boundary defect.** `HealthController` is `@Public()` and its `readyz` catch returns `err.message` or `String(err)` to callers. That bypasses the global filter's internal-error redaction and may expose connection hosts, database names or query/driver detail precisely during an outage. No real production error or secret was accessed. [health.controller.ts:21–23,59–77](../../op81-backend-audit-a/src/health/health.controller.ts#L21); [global filter:48–53](../../op81-backend-audit-a/src/filters/http-exception.filter.ts#L48).

**Close:** return a stable non-sensitive readiness code, log sanitized diagnostics internally, and test with an error containing a sentinel hostname/credential to ensure it never reaches the public body.

### F19 — P3 — Deepmerge “ESM” assertion selects the require-resolution target

**Introduced test limitation.** The new test calls `local.resolve('deepmerge-ts')` from `createRequire`, then imports that resolved file URL. This exercises dynamic import of the CommonJS-selected entry; it does not establish the package's separate `import` export condition or its ESM merge behavior. The real Prisma config test remains useful and passed. [dependency-compatibility.spec.ts:39–56,60–77](../../op81-backend-audit-a/test/dependency-compatibility.spec.ts#L39).

**Close:** either describe this assertion narrowly or exercise an actual package-specifier ESM resolution under the intended consumer and assert merge behavior, while retaining the Prisma integration probe.

### F20 — P3 — Pollution assertion has no adversarial input

**Introduced test weakness.** The Danger/ini test parses only an ordinary remote URL before asserting `Object.prototype` lacks `polluted`. The assertion would also pass for an unsafe parser given that harmless input; it supplies no regression protection for hostile INI keys. This is not evidence of a current ini vulnerability. [dependency-compatibility.spec.ts:103–113](../../op81-backend-audit-a/test/dependency-compatibility.spec.ts#L103).

**Close:** add controlled hostile-key input and assert safe parser/object outcomes, or remove the security implication and keep it explicitly a benign compatibility assertion.

### F21 — P3 — New Prisma probe retains a temporary fixture on every successful run

**Introduced, source-proven.** Each config probe creates and intentionally retains a `prisma-dependency-*` directory; there is no cleanup and the path is not reported on success. Long-lived developer/audit runners accumulate files, while the claimed reproducible diagnostics are not surfaced by the successful probe. [dependency-compatibility.spec.ts:64–77](../../op81-backend-audit-a/test/dependency-compatibility.spec.ts#L64).

**Close:** clean in `finally` on success and retain/log only on failure or explicit diagnostic opt-in.

### F22 — P3 — Danger version documentation is stale after the upgrade

**Introduced documentation drift.** Workflow line 36 still states Danger is pinned to 12.3.4, while the changed manifest pins 13.0.8. It does not change execution, but misstates the very supply-chain control under review. [danger.yml:36–38](../../op81-backend-audit-a/.github/workflows/danger.yml#L36); [package.json:78](../../op81-backend-audit-a/package.json#L78).

**Close:** update or remove the duplicated version claim in an authorized follow-up; verify the workflow uses the committed local binary.

## R100 Checklist

PASS below is scoped to this delta and cited consumer/control, not an assertion that every unchanged endpoint in the product has been re-certified. N/A means no relevant changed behavior, not waiver of a repository control. FAIL includes clearly marked evidence gaps, with a P-rated finding.

| Rule | Status | Evidence |
|---|---|---|
| R100.1 Zero secrets in source/history | FAIL | F03-P1: no credential introduction observed, but mandatory history/source scanning absent; [controls](control-observations.json), [hook](../../op81-backend-audit-a/lefthook.yml). |
| R100.2 RLS on every Supabase table | N/A | No table, migration or policy change; live RLS lanes are separate, not certified by default suite. [Diff](complete.diff). |
| R100.3 No raw SQL with string concat | PASS | No SQL introduced; inspected readiness uses tagged `SELECT 1`, not concatenation. [Health:64](../../op81-backend-audit-a/src/health/health.controller.ts#L64), [diff](complete.diff). |
| R100.4 No unsanitized output | N/A | No frontend/rendering/template change; Handlebars resolved version unchanged. [Lock delta](lock-changes.json). |
| R100.5 IDOR-proof endpoints | N/A | No new/changed endpoint, ID ownership or data-access predicate. No claim of whole-product IDOR clearance. [Diff](complete.diff). |
| R100.6 Rate limiting on auth/paid APIs | N/A | No auth/paid route or throttle policy change; throttler runtime version already locked. [Diff](complete.diff), [lock delta](lock-changes.json). |
| R100.7 JWT hygiene | N/A | No JWT logic/key/session change; mocked jose tests are not crypto verification. [Jest:127–131](../../op81-backend-audit-a/jest.config.js#L127). |
| R100.8 Runtime input validation | PASS | Global whitelist/forbid/transform remains; new Multer and WS probes assert bad-input rejection. [main.ts](../../op81-backend-audit-a/src/main.ts), [test:116–155](../../op81-backend-audit-a/test/dependency-compatibility.spec.ts#L116). |
| R100.9 Role check at data layer | N/A | No role, repository predicate or policy change. [Diff](complete.diff). |
| R100.10 npm audit clean | PASS | Native audit reports zero at every severity; recurring required-gate defect separately F04. [security.log](../validation/security.log). |
| R100.11 CORS allowlist | PASS | Inspected bootstrap uses computed allowlist, not wildcard credentials; no delta. [main.ts](../../op81-backend-audit-a/src/main.ts). |
| R100.12 No internal info in prod errors | FAIL | F18-P2: public readiness catch returns raw DB error; [health:70–77](../../op81-backend-audit-a/src/health/health.controller.ts#L70). |
| R100.13 HTTPS + HSTS | PASS | Helmet at bootstrap and Fly HTTPS configuration retained; no live TLS probe claimed. [main.ts](../../op81-backend-audit-a/src/main.ts), [fly.toml](../../op81-backend-audit-a/fly.toml). |
| R100.14 Layer discipline | N/A | No application layer changes; dependency test helper is test-only. [Diff](complete.diff). |
| R100.15 Reusable over hyper-specific | PASS | Shared `probe` avoids eight duplicated subprocess harnesses. [test:5–24](../../op81-backend-audit-a/test/dependency-compatibility.spec.ts#L5). |
| R100.16 No new TODO/FIXME | PASS | No added TODO/FIXME in complete three-file diff. [Diff](complete.diff). |
| R100.17 Real test assertions | PASS | Eight real API probes; helper verifies process failure and exact marker; F19/F20 narrow coverage claims. [test](../../op81-backend-audit-a/test/dependency-compatibility.spec.ts), [focused output](../validation/focused.log). |
| R100.18 Env parity | PASS | CI, Danger and Docker target Node 20; probes use `process.execPath`; exact fresh runtime patch not recorded, and image lifecycle not proved. [Docker:2](../../op81-backend-audit-a/Dockerfile#L2), [CI:35](../../op81-backend-audit-a/.github/workflows/ci.yml#L35), [test:7](../../op81-backend-audit-a/test/dependency-compatibility.spec.ts#L7). |
| R100.19 API versioning | N/A | No route/response contract changes; `/api` prefix preserved, not newly declared a semantic API version. [main.ts](../../op81-backend-audit-a/src/main.ts), [diff](complete.diff). |
| R100.20 No circular imports | PASS | New test imports only Node child_process; no production import edges added. No madge execution claimed. [test:1](../../op81-backend-audit-a/test/dependency-compatibility.spec.ts#L1). |
| R100.21 No N+1 | N/A | No new queries, loops over DB calls or application source. [Diff](complete.diff). |
| R100.22 Indexes on FKs + hot WHERE | N/A | No schema/query change. [Diff](complete.diff). |
| R100.23 Pagination on list endpoints | N/A | No list endpoint/query change. [Diff](complete.diff). |
| R100.24 No event-loop blocking | PASS | New sync subprocess/fixture I/O is bounded test-only work, not request-path code. [test:5–24,64–66](../../op81-backend-audit-a/test/dependency-compatibility.spec.ts#L5). |
| R100.25 Caching for stable data | N/A | No cacheable application read or cache policy change. [Diff](complete.diff). |
| R100.26 Media compress + CDN | N/A | Multer dependency changes, but no media storage/transform/CDN handler changes. [Diff](complete.diff). |
| R100.27 No polling for real-time | N/A | No new timer/polling path; existing Supabase broadcast fallback not changed by test. [Supabase](../../op81-backend-audit-a/src/supabase/supabase.service.ts), [diff](complete.diff). |
| R100.28 RMW under lock/transaction | N/A | No shared data read-modify-write added. [Diff](complete.diff). |
| R100.29 Idempotency on payments | N/A | No payment/mutation/idempotency path change. [Diff](complete.diff). |
| R100.30 Optimistic update rollback | N/A | Backend dependency/test-only PR; no frontend state. [Diff](complete.diff). |
| R100.31 Hook deps correct | N/A | No React/hooks. [Diff](complete.diff). |
| R100.32 Cleanup on unmount | N/A | No frontend mount lifecycle; test fixture cleanup separately F21. [Diff](complete.diff). |
| R100.33 Error boundaries/global filter | PASS | Global filter registered; unexpected exceptions redacted/logged. Readiness bypass is F18, not missing global filter. [filter:18–87](../../op81-backend-audit-a/src/filters/http-exception.filter.ts#L18), [main.ts](../../op81-backend-audit-a/src/main.ts). |
| R100.34 Structured logging | PASS | No new production console logging; child `console.error` is failure diagnostics captured by parent. [test:10–23](../../op81-backend-audit-a/test/dependency-compatibility.spec.ts#L10). |
| R100.35 Timeouts on external calls | PASS | New child execution bounded at 20s; Git probe local, no external-service call introduced. [test:16](../../op81-backend-audit-a/test/dependency-compatibility.spec.ts#L16). |
| R100.36 No swallowed errors | PASS | Rejection sets nonzero exit; parent checks error/signal/status/stderr/marker. No empty catch introduced. [test:10–24](../../op81-backend-audit-a/test/dependency-compatibility.spec.ts#L10). |
| R100.37 /health endpoint | PASS | Liveness exists; readiness performs actual tagged DB round trip and returns 503 on failure; exposure defect F18 remains. [health:37–79](../../op81-backend-audit-a/src/health/health.controller.ts#L37). |
| R100.38 Comments explain WHY | FAIL | F22-P3 stale Danger version; F19/F21 qualify ESM/diagnostic explanations. [Danger:36](../../op81-backend-audit-a/.github/workflows/danger.yml#L36), [test:3,55,65](../../op81-backend-audit-a/test/dependency-compatibility.spec.ts#L3). |
| R100.39 YAGNI patterns | PASS | One local harness, no new production abstractions. [test](../../op81-backend-audit-a/test/dependency-compatibility.spec.ts). |
| R100.40 Same-bug-everywhere | PASS | Full lock graph reviewed, including both YAML majors and all restored minimatch consumers; no partial global override retained. [Inventory](lock-inventory.txt). |
| R100.41 No reimplementing libraries | PASS | Real dependency APIs used; hand-built buffers are explicit test fixtures, not production parsers. [test:116–155](../../op81-backend-audit-a/test/dependency-compatibility.spec.ts#L116). |
| R100.42 No phantom-bug defenses | FAIL | F20-P3 pollution assertion has no hostile input and cannot test that failure mode. [test:108–113](../../op81-backend-audit-a/test/dependency-compatibility.spec.ts#L108). |
| R100.43 Zero dead code | FAIL | F07-P1: unused-code gate warning-only; native lint has 21 warnings. No new dead branch alleged. [eslint:55–67](../../op81-backend-audit-a/eslint.config.js#L55), [lint](../validation/lint.log). |
| R100.44 Multi-table writes in transactions | N/A | No data writes introduced. [Diff](complete.diff). |
| R100.45 Soft deletes on critical entities | N/A | No delete/model changes. [Diff](complete.diff). |
| R100.46 DB-layer constraints | N/A | No migration or schema changes. [Diff](complete.diff). |
| R100.47 PITR + recovery runbook | FAIL | F17-P2 evidence gap: manual rollback documented, current PITR/restore proof unavailable; not “PITR disabled.” [Runbook:278–309](../../op81-backend-audit-a/docs/deploy-runbook.md#L278). |
| R100.48 CI/CD enforced | FAIL | F01/F02-P1: unprotected main and deployment independent of strict gate. [Protection](../backend-protection.json), [deploy workflow](../../op81-backend-audit-a/.github/workflows/fly-deploy.yml). |
| R100.49 Dev-only excluded from prod bundle | FAIL | F11-P2: TypeScript excludes tests, Docker still includes test assets and all dev dependencies. [Docker:25–27](../../op81-backend-audit-a/Dockerfile#L25), [.dockerignore](../../op81-backend-audit-a/.dockerignore). |
| R100.50 Graceful degradation | PASS | Relevant Supabase broadcast is best-effort with warning logs and bounded subscription wait; no fallback logic changed. Not a whole-product outage certification. [Supabase:42–88](../../op81-backend-audit-a/src/supabase/supabase.service.ts#L42). |
| R100.A1 Test:src ≥2.0 | PASS | 158 added test lines / 0 production-source lines: denominator zero, zero-source branch, no invented ratio. [Measurements](measurements.json). |
| R100.A2 Banned-cast net additions zero | PASS | Each of all eight required tokens +0/-0/net0 across complete diff including tests; gate defects F08 separate. [Measurements](measurements.json). |
| R100.A3 ≤400 production LOC | PASS | 0 application-source net; conservative manifest-inclusive net8; workflow broad-scope test count158; all below400. [Measurements](measurements.json), [diff](complete.diff). |
| R100.A4 CI pass rate ≥75% | PASS | Captured 14d: 7/7 PR workflows, 1/1 CI, one PR/head; 100%, small denominator. [Window evidence](control-observations.json), [runs](../backend-runs.json). |
| R100.A5 Canonical verdict | PASS | This report ends with exactly one canonical verdict; no merge authorization. |

## R109–R126 Checklist

| Rule | Status | Evidence |
|---|---|---|
| R109 No stubs/silent failures/removed entry points | PASS | No production UI/routes changed; test failure handler is explicit and asserted, not silent. No newly imported production mock/fixture. [Diff](complete.diff), [test:10–24](../../op81-backend-audit-a/test/dependency-compatibility.spec.ts#L10). |
| R110 Secrets scanning | FAIL | F03-P1: config, workflow and hook missing; required check absent. [Controls](control-observations.json), [hook](../../op81-backend-audit-a/lefthook.yml). |
| R111 Unused code errors | FAIL | F07-P1: compiler flags absent, unused-vars warns, actual warnings pass. [tsconfig](../../op81-backend-audit-a/tsconfig.json), [eslint:55–67](../../op81-backend-audit-a/eslint.config.js#L55). |
| R112 Unsafe typing enforcement | FAIL | F07/F08-P1: explicit-any off, no type-aware unsafe/custom-cast gates, test exclusion and aggregate-net loophole. [eslint:30–82](../../op81-backend-audit-a/eslint.config.js#L30), [gate:64–135](../../op81-backend-audit-a/.github/workflows/r100-quality-gate.yml#L64). |
| R113 Required audit gate | FAIL | F04-P1: current audit zero but no recurring required severity gate. [security](../validation/security.log), [CI:38–61](../../op81-backend-audit-a/.github/workflows/ci.yml#L38). |
| R114 Pins/paired lock/reproducible installs | PASS | All55 direct versions exact and match lock; manifest/lock paired; Danger performs clean ignore-scripts install and dependency-lock hygiene. Job is named Danger, not lockfile-check; production lifecycle/image validation remains distinct. [manifest:31–101](../../op81-backend-audit-a/package.json#L31), [Danger:31–38](../../op81-backend-audit-a/.github/workflows/danger.yml#L31), [dangerfile](../../op81-backend-audit-a/dangerfile.js). |
| R115 SBOM | FAIL | F06-P1: no PR trigger/release attachment; 90d retention is compliant; install path risk remains. [SBOM:8–63](../../op81-backend-audit-a/.github/workflows/sbom.yml#L8). |
| R116 Diff coverage | FAIL | F14-P2 repository gate absent. Numeric threshold N/A for zero changed executable production lines; no 80% claim or invented exemption. [CI:61](../../op81-backend-audit-a/.github/workflows/ci.yml#L61), [Jest:139–141](../../op81-backend-audit-a/jest.config.js#L139), [measurements](measurements.json). |
| R117 Assertion-bearing tests/lint | FAIL | Real assertions PASS; F09-P2 missing mandatory matcher enforcement/registration, changed test excluded by lint script. [test:5–24](../../op81-backend-audit-a/test/dependency-compatibility.spec.ts#L5), [package:10](../../op81-backend-audit-a/package.json#L10). |
| R118 Semgrep + CodeQL | FAIL | F05-P1: Semgrep absent, CodeQL fail-open; actual native analysis did succeed and has zero results. [CodeQL:43–73](../../op81-backend-audit-a/.github/workflows/codeql.yml#L43), [analysis](../backend-codeql-analysis.json). |
| R119 Crypto enforcement | FAIL | F13-P2: unannotated MD5 identifier and protocol HMAC-SHA1; no mandated lint/Semgrep defense. No observed exploit claimed. [Mailchimp:49](../../op81-backend-audit-a/src/landing-pages/crm/mailchimp.adapter.ts#L49), [Fitbit:366](../../op81-backend-audit-a/src/wearables/connectors/fitbit/fitbit.connector.ts#L366). |
| R120 IaC scanning | FAIL | F10-P1: no security scanner workflow; syntax lint is not Checkov. [Controls](control-observations.json), [infra-lint](../../op81-backend-audit-a/.github/workflows/infra-lint.yml). |
| R121 Artifact identity | FAIL | F12-P2: optional SHA/Sentry fallback only; no OCI revision label, build-time stamp or version endpoint. [Docker:46–55](../../op81-backend-audit-a/Dockerfile#L46), [health](../../op81-backend-audit-a/src/health/health.controller.ts). |
| R122 Branch protection | FAIL | F01-P1: explicit unprotected response, no rulesets or YAML reconciliation. [Native protection](../backend-protection.json), [rulesets](../backend-rulesets.json), [setup script](../../op81-backend-audit-a/scripts/setup-branch-protection.sh). |
| R123 Zero-test/skip hygiene | FAIL | F15-P2: no explicit flag/quarantine; no new skip, and no false claim Jest's default passes zero tests. [package:11](../../op81-backend-audit-a/package.json#L11), [controls](control-observations.json). |
| R124 Reproducibility | PASS | Matrix pinned; fresh read-only PR head/base still match; historical merge tree/parents verified; closing hashes/checks recorded with this report. [PR recheck](pr-head-recheck.json), [merge](synthetic-merge.json), [measurements](measurements.json). |
| R125 Defense in depth | FAIL | F16-P1: canonical unenforced-rule ledger absent despite old mandatory controls remaining unenforced; no new R-rule in this PR. [Controls](control-observations.json), [rule:1456–1468](../../op81-audit-context/AGENT_RULES.md#L1456). |
| R126 Dispatch telemetry | FAIL | F17-P2, unverified rather than absent: prediction embargo respected; parent must provide presence-only attestation and populate actual after return. [Brief](../PR524_REESTABLISHMENT_BRIEF.md), [rule:1473–1487](../../op81-audit-context/AGENT_RULES.md#L1473). |

## Reproduction and publication handoff

No heavy execution is required to establish the source-proven findings. If the parent wants additional candidate execution before remediation, a bounded allocation should use a private runtime copy at the exact tree: Node 20, one worker, 4GB heap, no external-service credentials, no source edits, with focused compatibility tests and a separately authorized disposable `npm ci --omit=dev` SBOM-install reproduction. Stop on lock drift or unexpected network/lifecycle behavior; never borrow another worker's writable node_modules.

The parent should publish/track every inherited finding rather than silently treating it as out of lane, preserve this audit's independence, and request authorized fixes before a fresh dual audit. I have not authorized merge, changed draft state, changed branch protection, or deployed anything.

### Files written by this auditor

All written files are confined to `/home/user/workspace/tgp-study/op81-execution/audit-a/`:

1. `REPORT.md` — full checkpoint/final report.
2. `measure.py` — independent lightweight Git/lock/token measurement.
3. `complete.diff` — full pinned base/head diff.
4. `lock-changes.json` — complete before/after changed lock entries.
5. `lock-inventory.txt` — complete path/version/metadata-field inventory.
6. `measurements.json` — file counts, tokens, lock provenance.
7. `native-summary.json` — derived native validation/check/analysis summary.
8. `control-observations.json` — control-path presence, local identities, CI window.
9. `pr-head-recheck.json` — fresh read-only PR identity.
10. `synthetic-merge.json` — native GitHub merge object.
11. `gate-counterexample.json` — pure arithmetic counterexample, no product execution.
12. `closing-verification.json` — ending matrix, cleanliness, hashes and checklist validation.

**FAIL-row finding map:** R100.1→F03; .12→F18; .38→F19/F21/F22; .42→F20; .43→F07; .47→F17; .48→F01/F02; .49→F11; R110→F03; R111→F07; R112→F07/F08; R113→F04; R115→F06; R116→F14; R117→F09; R118→F05; R119→F13; R120→F10; R121→F12; R122→F01; R123→F15; R125→F16; R126→F17. Every mapped finding includes severity and file/native evidence above.

VERDICT: FINDINGS
