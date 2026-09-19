# Importer Workflow Security: Bounded R120 Builder

## BUILD MATRIX
- backend HEAD: c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7
- ctxrepo HEAD: ad2259c0649e4e53a663a2600343da1a08ac8b35
- importer PR #21 head: fc7fdf6e50df08cccad86da37c8b0f15f4b72e81
- importer PR #21 base (origin/main): 0111be661922234d670bbf23e23d270eec1b4a4e
- mobile HEAD: a5933fd6de5616493de75f0db907098b149b955c
- importer local input tree: 3db01451c6c4e1aa46c6637db80d852e2273bcf6
- timestamp (ISO 8601 UTC): 2026-09-17T21:03:21Z

## Goal

Close the concrete R120 gap introduced by the frozen R110 workflow without expanding into unrelated repository controls. The native secret scanner and its 37 controls pass; the unchanged input tree passed 1,534 tests. Those results are input evidence, not validation of your future tree. The next security PR may include R110 plus this bounded prerequisite if cumulative production size and all gates pass.

Read all canonical rules and the first-principles addendum in immutable `/tmp/tgp-op80-cycle2-inputs/context/AGENT_RULES.md`. Read the complete R110 report at `operator80/execution/importer-supply-chain/BUILD_REPORT.md`; preserve its remaining findings, especially workflow trust and external enforcement. This is an implementation lane, not an independent audit. Requested Astra is inherited; do not claim verified runtime identity.

## Exclusive ownership

You alone may write `/tmp/tgp-op80-cycle3-importer-iac` and `operator80/execution/importer-iac/`. Your clone's HEAD stays at fc7fdf6; the staged input tree is 3db01451. Keep the original R110 clone, patch/archive, reports and all parent context inputs untouched.

Own only a minimal IaC security workflow, its necessary pinned native-tool invocation/configuration, narrowly scoped assertion-bearing controls, and documentation. Do not edit the nine R110 input files, application code, manifest permissions, token/session/network behavior, package.json/lockfile, or existing tests/gates merely to obtain green. If a necessary integration point conflicts with that boundary, report the exact need before editing.

No commits, GitHub calls, pushes, DB access, live accounts, app/customer network, root/global installs, external communications, feature activation, gate waivers or subdelegation. Public tool documentation/advisory/version research is allowed. Parent owns all remote actions.

## Design and verification requirements

Use a real established IaC scanner, not a regex substitute. Verify the actual CLI and GitHub Actions framework support rather than copying the rule's example blindly. In particular determine whether severity filtering needs an authenticated commercial service; do not introduce a credential dependency or silently accept an empty/no-op scan. A credential-free stricter all-applicable-checks gate is preferable to falsely claiming HIGH/CRITICAL filtering.

The workflow must scan the intended exact PR head on every relevant change, including its own gate/config changes. Use read-only permissions, immutable action/tool pins, bounded execution, failure on scanner/download/parser errors, and no customer secrets or `pull_request_target` execution. Do not weaken existing checks or add broad suppressions. Any inherited finding is preserved with its actual native rule and reproduction; report a scope mismatch rather than expanding indiscriminately.

Prove with the real native tool that a safe workflow passes, a representative unsafe workflow fails, a missing/failing scanner fails, the intended repository workflow files were actually scanned, and self-modification cannot silently skip the configured trigger. Cover configuration/invocation boundaries with meaningful tests. A workflow defined in a PR is not proof of branch-protection enforcement; parent still owns expected-producer required checks and protected review.

Measure R120-only and cumulative security deltas separately, both canonical and actual gates. Preserve the R110 baseline patch/tree unchanged; output an input-relative patch plus a cumulative candidate and reconstruction hashes. Do not relabel old 1,534-test evidence as your changed tree's full-suite pass.

## Resource allocation

You have source-edit, read-only research and report slots now. Backend owns the single heavy validation slot. Do not install packages/tools, run scanner controls, npm tests, broad scans, lint/type/build or a full suite until the parent explicitly grants a verification slot. Plan a private pinned installation and bounded native controls; avoid repeating R110's native or full-suite work. Return a checkpoint when ready for the slot rather than silently waiting in a file.

No shared writable node_modules, caches, installed binaries, generated output or logs. Do not read environment secrets or local PostgreSQL credentials.

## Required handoff

Return concrete implementation/root-cause decisions, preserved red/green evidence, exact commands and environment, input/output tree identities, patch/checksums, canonical and actual measurements, complete 55-row R100 and 18-row R109–R126 self-checks, and explicit unresolved findings. Finish with one verdict line and release every resource. This lane cannot authorize publication, merge or end-to-end importer readiness.
