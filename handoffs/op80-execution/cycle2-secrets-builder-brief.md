# Importer secret-scanning enforcement builder

## BUILD MATRIX
- backend HEAD: c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7
- ctxrepo HEAD: ad2259c0649e4e53a663a2600343da1a08ac8b35
- importer PR #21 head: fc7fdf6e50df08cccad86da37c8b0f15f4b72e81
- importer PR #21 base (origin/main): 0111be661922234d670bbf23e23d270eec1b4a4e
- mobile HEAD: a5933fd6de5616493de75f0db907098b149b955c
- timestamp (ISO 8601 UTC): 2026-09-17T20:09:07Z

## Goal and evidence

Implement a bounded, separately reviewable R110 secret-scanning slice on the exact repaired pagination head. The inherited repo has no gitleaks pre-commit/CI enforcement. Do not reimplement a regex secret scanner or repeat the pagination repair. Read the entire canonical `/tmp/tgp-op80-cycle2-inputs/context/AGENT_RULES.md` and its first-principles/autonomy addendum; read preserved `build-reports/pagination-fix-r3/BUILD_REPORT.md`. Canonical doctrine overrides generic templates. Requested model is Astra by inheritance; no independently verified runtime identity is claimed.

## Exclusive ownership

- Sole writable source clone `/tmp/tgp-op80-cycle2-inputs/importer`; evidence `operator80/execution/importer-supply-chain/`.
- Scope: .gitleaks.toml, secrets-scan.yml, existing lefthook/package hook plumbing, the minimum pinned scanner bootstrap/wrapper if needed, focused real positive/negative control tests and documentation. Inspect existing hook-config tests and extend rather than weaken them.
- Existing background/replay/network/pairing/session/popup/customer code, manifest permissions, flags and source tests are immutable except an explicitly owned hook/config test. No consumer implementation.
- Do NOT bundle SBOM, build provenance, typed-lint, diff-coverage or unrelated control changes into this slice. Record their remaining scope for the next cycle. Keep canonical production additions <=400, test/source ratio >=2 when source is added, banned-token net zero and actual enforced gates. No waivers, altered exclusions, suppressed findings or skipped tests.
- No commits, pushes, GitHub writes, API credential access, production/customer calls, DB/system installs, subdelegation or remote protection changes. Parent alone owns publication and required-status wiring.
- Public scanner release metadata/downloads allowed, pinned and checksum-verified into your evidence tooling only. Public npm installs allowed only in your isolated clone. No global install and no hardlinks to another clone's node_modules.
- Use apply_patch for manual edits. Do not print secrets or use real credentials as canaries. Scanner output must be redacted. If history contains a real secret, report only sanitized location/type and stop publication pending parent containment.

## Acceptance

Use the real pinned gitleaks binary. Pre-commit must fail closed when the tool is unavailable or a staged canary is detected; CI scans the actual PR commit range and does not silently pass shallow/missing bases or command failure. Make head checkout, permissions, fork safety, release checksum provenance and retention explicit. Do not run untrusted PR code with write tokens or pull_request_target.

Run a real redacted scan of the existing tracked repository/history and isolated scratch staged/diff canaries proving positive, negative, removed-secret commit/history and failure-path behavior. Do not commit a canary into product history. Narrow allowlists require evidence and parent review; do not broadly allow operator email patterns, test directories or entropy.

Resources: Node22, one worker. Backend builder owns heavy install/type/build slot. You may read, author and run bounded scanner/native tests now; ask parent before npm install, broad typecheck, full suite or expensive history scan. No repeated full tests for the already-frozen pagination tree.

## Delivery

Checkpoint plan early and before long runs; notify parent for archival. Freeze exact staged tree plus input-relative reconstructable patch and checksums. Deliver complete report with BUILD MATRIX, 55 R100 rows and all R109–R126 rows, measured gates and all test commands/exits, scan scope and limitations, expected exact check names and remaining external branch-protection gate. Do not claim a valid audit, actual protection change, secret rotation or readiness.

Final verdict exactly CLEAN | FINDINGS | REFUSAL | INFRA_DEATH. Expected FINDINGS while independent and remote controls remain. Explicitly release writer/tool/test resources on closeout.
