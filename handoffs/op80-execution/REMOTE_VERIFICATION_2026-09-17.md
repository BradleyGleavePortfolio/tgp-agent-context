# Published Importer Prerequisites: Remote Verification

## Evidence boundary

This checkpoint records native remote results for two draft PRs on September17,2026. A passing job is not branch protection, independent review, deployment, landing or customer-journey acceptance; those obligations remain separate.

## Backend dependency PR524

[PR524](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/524) has product head `238f0f1f152ebbb1b4691f555e98c888473d8ee7`, base `c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7`, and tree `b2bb1666a91d60927d3ee1d6455ce687ce1c8739`. Remote CI used synthetic merge `0786a9f087d8dcec7dfb8d1271c78aeba5baabb3`, whose two parents are those pinned commits and whose tree equals the candidate, as recorded in the [native CI run](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/35279915048).

The native full result was531 passed suites,7,857 passed tests and six snapshots, with12 inherited skipped suites,159 skipped tests and five todos;31 RLS tests,52 MWB-default tests and seven MWB RLS/concurrency tests also passed in their separate jobs ([CI results](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/35279915048)). Thirteen checks succeeded and the conditional deployment-readiness gate was skipped, not passed or deployed ([PR checks](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/524)).

CodeQL exported and successfully uploaded analysis1796271510 for the synthetic merge, with201 rules, zero results and no analysis error ([CodeQL run](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/35279915067), [analysis record](https://api.github.com/repos/BradleyGleavePortfolio/growth-project-backend/code-scanning/analyses/1796271510)). This actual success does not cure the separately identified inherited fail-open workflow logic; independent review remains underway.

## Importer secret-scanning PR23

[PR23](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/pull/23) has head `15636ff2cc32ef68b2a3efd7dbd1e9f766bcafad`, base `fc7fdf6e50df08cccad86da37c8b0f15f4b72e81`, and tree `3db01451c6c4e1aa46c6637db80d852e2273bcf6`. It is stacked on the pagination branch rather than main, so it does not land either change.

Both CI triggers checked out the actual product head and passed51 files /1,534 tests, with zero reported npm vulnerabilities ([PR CI](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/actions/runs/35281552166/job/105404421525), [push CI](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/actions/runs/35281548571)). The dedicated scan checked out that head, installed checksum-verified Gitleaks8.30.0, passed37 native controls, and uploaded the redacted artifact ([secret scan](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/actions/runs/35281552280/job/105404421946)).

The retained artifact is `secrets-scan-redacted-15636ff2cc32ef68b2a3efd7dbd1e9f766bcafad`, ID10522653392, reported zipSHA256 `1437b79c26f6db1d575609cf2aa001ed2ab297fc6ea819fd15b7874f940e746f` ([artifact record](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/actions/runs/35281552280/artifacts/10522653392)). Its existence is not proof that the job is required by protection or that workflow policy cannot be changed.

CodeQL checked out synthetic merge `d7455fe7b284d9d709ca6813efd8098d38a44a88`, with the pinned base/head parents and identical candidate tree, exported one SARIF file and passed the native zero-findings gate ([CodeQL run](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/actions/runs/35281552207/job/105404421861)). This workflow sets `upload: never`; no uploaded GitHub analysis ID is claimed, and the initial analysis-API404 remains separately preserved rather than converted into a successful API result.

## Provenance and unresolved gates

Raw native logs are retained locally as separate compressed files with hashes, alongside PR-check responses, synthetic-tree identity records and the backend analysis response. Only sanitized summaries and identity facts are published here; raw scanner forensics, tool environments, canaries and dependency directories are excluded.

Backend and importer independent acceptance, required-check enforcement, protected policy review and other inherited controls remain open. R120 is still blocked by scanner qualification; no vulnerable scanner package, non-equivalent substitute, advisory exception, security-setting change, merge or import activation was approved.
