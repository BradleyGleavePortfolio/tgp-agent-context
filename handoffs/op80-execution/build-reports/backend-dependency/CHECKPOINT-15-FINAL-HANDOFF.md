# Dependency checkpoint15 — completed report-only handoff

**All source-writer and execution/install/generation/type/build/test/network-audit slots remain RELEASED.** Final identity and frozen audit closure completed before report-only packaging; no additional backend verification is pending or requested. No product/index/dependency writes or commands after release. [Release record](RELEASE_RESOURCES.json), [final identity](FINAL_IDENTITY.json), [final audit](frozen-audit.log).

Frozen tree: `b2bb1666a91d60927d3ee1d6455ce687ce1c8739` on base `c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7`. Exact patch: `corrected-candidate.patch`; SHA256 `ff504dfd7f87c8c1b1777f04a1e2b4faf9a420f3770b4df6f8b56f5f53a5645a`. Alternate-index reconstruction matches; protected inputs and final before/after identity match. [Reconstruction](corrected-freeze.json), [identity](FINAL_IDENTITY.json).

Corrected full run: exit0, 321.841s, 531 passing suites, 7,857 passing tests, 6 passing snapshots. Inherited 12 skipped suites, 159 skipped tests and 5 todos remain. Original full run remains separately failed: 13 suites / 95 tests due the blanket socket guard. Corrected evidence-only owned-HTTP guard controls and targeted 13-suite/151-test run passed before the separately allocated final full run. [Corrected full](corrected-full-suite.log), [original full](full-suite.log), [controls](owned-guard-controls.log), [targeted run](targeted13-corrected.log).

Complete mandated report: [BUILD_REPORT.md](BUILD_REPORT.md), with editable [BUILD_REPORT.docx](BUILD_REPORT.docx). All 55 R100 rows and all 18 R109–R126 rows, full advisory/path/version tables, all command results and preserved failures, actual workflow LOC/density/banned accounting, limitations and parent-owned findings included. Report status is FINDINGS, not release readiness or independent review. [Completeness](REPORT_COMPLETENESS.json), [document QA](OFFICE_REPORT_QA.json).

Actual workflow LOC 158; canonical production net0; source additions0/test additions158 pass the workflow's zero-source branch with undefined numeric ratio. All canonical/actual banned-token deltas0; total all-file diff +785/-555/net230. [Final measurement](FINAL_GATES.json).

All 55 direct versions exactly pinned; full audit 26→0 including dev dependencies. Final scoped Swagger correction leaves 54,181 installed regular files, 67 symlinks, all 1,149 locked versions and the full lockfile unchanged. Both sequential lock resolutions/graph reads and SBOM succeeded; no reinstall or metadata surgery. [Invariance](override-invariance.json), [audit](frozen-audit.log), [SBOM](sbom.cdx.json).

No remaining local dependency acceptance command is unexecuted. Parent alone owns independent review, publication, remote/legacy controls and any combined recovery/C1 validation. Requested Astra is inherited; runtime model identity is not independently verified. [Final report](BUILD_REPORT.md).

VERDICT: FINDINGS
