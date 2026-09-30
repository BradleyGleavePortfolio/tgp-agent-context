# Backend dependency remediation builder

## BUILD MATRIX
- backend HEAD: c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7
- ctxrepo HEAD: ad2259c0649e4e53a663a2600343da1a08ac8b35
- importer PR #21 head: fc7fdf6e50df08cccad86da37c8b0f15f4b72e81
- importer PR #21 base (origin/main): 0111be661922234d670bbf23e23d270eec1b4a4e
- mobile HEAD: a5933fd6de5616493de75f0db907098b149b955c
- timestamp (ISO 8601 UTC): 2026-09-17T20:09:07Z

## Goal and evidence

Close the reproducible locked backend dependency audit in one isolated candidate, preserving application behavior. Existing full audit is `operator80/execution/backend/npm-audit.json`: 26 total, 14 high and 1 critical. The critical shell-quote path, Danger/parse-git-config, Prisma/config/deepmerge-ts, Nest/multer, js-yaml, ws, and build-tool transitives require actual path/compatibility investigation, not blind `npm audit fix --force`. Open Dependabot PRs already propose individual updates; inspect their local remote refs where useful, but do not rewrite or publish them.

Read the entire canonical `/tmp/tgp-op80-cycle2-inputs/context/AGENT_RULES.md`, its first-principles/autonomy addendum, and the preserved backend and C1 findings before editing. Apply canonical rules over generic skill examples. Requested model is Astra by inheritance, highest available inherited performance; actual runtime identity is not independently verified.

## Exclusive ownership and prohibitions

- You alone may write `/tmp/tgp-op80-cycle2-inputs/backend` and `operator80/execution/backend-dependency-fix/`. Backend clone starts at the pinned main, not at the uncommitted recovery/C1 candidates.
- Scope: package.json, package-lock.json, narrowly necessary dependency compatibility tests and documentation. Freeze exact direct pins to installed/verified versions without gratuitous upgrades. Existing production code, schema, migrations, API contract generator/JSON, CI files and flags are OUT of scope unless an unavoidable compatibility need is first reported to parent.
- Original backend recovery tree a8908132a9c4882dbe80f9fbc1052532c7e68c3b, C1a 404dd55d2fde7ab9fab46fb4ea1d27a9d79a7556 and C1b 660e436ecbf911b6984b40ed43d135e3dc308378 remain untouched. Three dunning files must remain byte-identical.
- No commits, pushes, GitHub calls, external communications, production/customer network calls, DB access, root/system installs, feature activation, waivers or subdelegation. Parent owns publication. Public npm package/advisory lookups and installation into your private clone are explicitly authorized.
- No Prisma major upgrade or downgrade merely to satisfy an audit. Investigate the real required deepmerge API and compatibility before any narrowly scoped override. Preserve client/CLI compatibility, Node20 CI compatibility and an honest lockfile. Never suppress advisories, omit dev dependencies from the release claim or label a forceful resolution safe without evidence.
- Use apply_patch for manual edits. Preserve all failing runs. No shared writable node_modules, generated Prisma output, npm-global installs or logs.

## Verification resources

You own the backend install/generate/type/build slot now. Use Node20, one worker and at most 4GB Node heap. Inspect `execution/c1-split/COMMANDS.md` for prior sanitized private tooling. Do not print environment variables or credentials. Do not read the local PostgreSQL password.

Use lockfile-only resolution initially where useful, then one clean private installation. Verify lockfile determinism, full audit JSON, `npm ls`, package engines, Prisma validate/generate, build/typecheck and bounded dependency-sensitive tests. Add failing negative checks before remediation and make them meaningful, not mocks of package-manager success. Full-suite execution needs a parent slot grant; request it after lightweight gates are ready. Do not run heavy suites alongside the importer worker.

## Delivery

Checkpoint early and before long commands, notify parent with exact paths for archival. Deliver full BUILD_REPORT.md with BUILD MATRIX, complete 55 R100 rows plus all R109–R126 rows, before/after exact dependency paths and advisories, versions/rationale, all commands/results/limitations, source and actual workflow LOC/density/banned checks, frozen staged tree and reconstructable patch with SHA256. Do not claim independent review, release readiness, C1 freeze or that inherited controls are fixed.

One final verdict line: VERDICT: CLEAN | FINDINGS | REFUSAL | INFRA_DEATH. Expected outcome is FINDINGS because independent/remote/control gates remain parent-owned. Explicitly release writer and test resources when frozen.
