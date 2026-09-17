# Dependency checkpoint09 — slots released; two distinct blockers retained

**All backend heavy/network/install/test slots are released now for the IaC builder. No further test or package-manager command will start without parent allocation. Product writer remains paused; retained tree7e959c034fa8134f630a77784e733665d51352d5 is unchanged.**

## 1. HTTP fixture harness blocker — proposal ready

[Checkpoint08](CHECKPOINT-08-HARNESS-PROPOSAL.md) contains the exact13 fixture names/listen/request lines,95 failures, and a minimal harness-only proposal. Every fixture requests plain HTTP to127.0.0.1 at the runtime port assigned by its own app.listen(0). Original numeric ephemeral ports were not logged and cannot be honestly invented.

Proposal: privately register only same-process plain-HTTP ephemeral listeners, force binding to127.0.0.1, admit only literal127.0.0.1+currently registered fixture port, revoke on close, deny DB/cache ports/all other destinations/Unix paths/fetch/raw TCP/TLS. No product change, broad localhost allowance, or guard removal. Safety controls first, then parent-allocated13suite correction; no automatic second full suite.

Original full suite remains exit1:13failed/518passed/12skipped suites;95failed/7762passed/159skipped/5todo tests. [Inventory](full-suite-failure-inventory.json).

## 2. Newly reproduced npm graph/SBOM blocker — independent of HTTP harness

- Final full audit exit0, all severities0, including dev dependencies. [Final audit](audit-final.log).
- Offline lock-only repeat exit0 and lock bytes are identical to both preinstall and frozen lock: SHA256 b7fed5ed611c004615022cf69375b83956e9a69604807123fbe0e7965aea9c55; no unstaged product difference. [Determinism](lock-determinism.json).
- However final npm ls now exits1: **js-yaml4.3.2 is invalid against Swagger11.4.4's declared exact4.1.1**, despite the manifest's version-selector override and the initial post-ci npm ls having passed. [Initial pass](installed-tree.log), [later failure](installed-tree-final.log).
- The first final npm ls was mistakenly scheduled alongside offline lock-only resolution as if independent. A **single sequential diagnostic after resolution completed** reproduces the identical failure, so this is not dismissed as merely the overlap. No more repeated graph commands. [Sequential reproduction](installed-tree-post-resolution.log).
- npm sbom exits1 ESBOMPROBLEMS for exactly the same Swagger→YAML edge; no valid SBOM emitted and none fabricated. [SBOM failure](sbom.log).

### Root-cause evidence and minimal proposed package correction

Current manifest uses `js-yaml@4.1.1:4.3.2` while installed Swagger metadata still declares4.1.1; npm's later graph load reports the already-patched hoisted4.3.2 as not overridden. This is a version-selector override recognition/reproducibility problem, not evidence that vulnerable4.1.1 bytes returned. Actual Swagger/YAML parser tests and full audit remain passing. The exact npm internal cause is not independently proven; do not claim one.

Proposed next experiment, **requires parent product-write/package-slot permission**: replace that version-selector override with explicit direct-parent scoped `@nestjs/swagger@11.4.4: { "js-yaml": "4.3.2" }`, retaining all installed versions and YAML3 consumer. The earlier parent-scoped attempt preceded removal of stale nested4.1.1; now the physical lock already contains only patched copies, so explicit consumer-edge scope may validate persistently. No force, suppression, fabricated metadata or reinstall. Re-run sequential lock-only→npm ls→SBOM twice only if meaningful state change confirms stable recognition, plus final audit if graph changes. If this does not resolve, return findings rather than mutate npm package metadata or endlessly retry.

**No proposed manifest/index change has been applied.** The current candidate cannot honestly receive a fully valid installed dependency graph/SBOM claim, even though audit is zero and actual consumer/type/build gates pass.

## Available evidence

All original/failing logs preserved. [Draft report](BUILD_REPORT.DRAFT.md) is superseded for latest status by checkpoints07–09 until final assembly; its initial graph-pass statement describes the earlier gate only. Mandatory full report/checklist finalization and patch reconstruction remain pending while evidence-only harness/report preparation can continue.

Requested Astra inherited; runtime identity not independently verified. No independent audit, release readiness, C1 freeze or product activation.
