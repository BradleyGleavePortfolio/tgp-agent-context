## Purpose

Adds pinned native Gitleaks scanning to real commit hooks and a dedicated pull-request workflow. Scanner failure, unreadable history, missing tools and detected credentials fail closed with actionable errors.

This is a draft stacked on pagination PR #21. It changes nine tooling, policy, workflow, documentation and test paths; pagination and all other runtime files are unchanged from the base.

## Exact candidate

- Head: `15636ff2cc32ef68b2a3efd7dbd1e9f766bcafad`.
- Tree: `3db01451c6c4e1aa46c6637db80d852e2273bcf6`.
- Base branch: `c2b-0a-strict-pagination-boundary`.
- Base head: `fc7fdf6e50df08cccad86da37c8b0f15f4b72e81`.
- Author and committer: Bradley Gleave <bradley@bradleytgpcoaching.com>.

## Verification

- Original frozen-tree validation: 37 native scanner controls, real hook negative/positive integration and four scan scopes passed.
- Original corrected full suite: 1,534 tests across 51 files passed, zero skips, on this identical tree. The prior contaminated runner failure remains recorded separately; no tests were removed or assertions weakened.
- Publication: ordinary commit passed all six installed pre-commit commands. Exact committed-head gates, new-commit PR/history scans and a clean tracked-tree export scan passed.
- The tracked-tree scan requires `gitleaks dir .` from the export root. An incorrect absolute-path invocation reproduced seven known synthetic-fixture matches; the invocation-only correction passed without any policy or source change. Both outputs remain preserved.
- Canonical cumulative production additions: 180; canonical cumulative test additions: 1,551; ratio 8.617. This slice's conservative all-language source/test additions are 182/471, ratio 2.588. Raw cumulative non-test/non-doc additions of 449 are disclosed, not represented as a passing raw 400-line count.

No full suite was redundantly rerun for publication. Builder evidence is identified as builder evidence, not independent review.

## Security and release boundaries

The four rule-specific exceptions match only reviewed synthetic literals in exact fixture paths. Native controls detect changed canaries, those literals outside their approved paths and other credential types in approved files. There is no broad test-directory, JWT, history or fingerprint exclusion.

Independent audits, exact-head remote acceptance, required-check producer configuration, protected policy review and inherited repository controls remain open. R120 is applicable to this workflow and remains a release blocker: the separate Checkov candidate failed dependency security acceptance, and the proposed replacement is not qualified or included here. No scanner waiver or security-setting change is part of this PR.

This draft neither lands pagination nor activates imports. It is not merge or release approval.

## Recordkeeping

The complete historical builder report and selected sanitized evidence are being archived in the context repository under `handoffs/op80-execution/build-reports/importer-r110/`. Raw scanner forensics, canary worktrees, downloaded tools and dependency directories are intentionally excluded; report links to local-only evidence are not represented as published artifacts.
