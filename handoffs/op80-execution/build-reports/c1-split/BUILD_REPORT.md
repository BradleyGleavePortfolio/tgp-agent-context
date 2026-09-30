## BUILD MATRIX
- backend HEAD (unchanged): c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7
- ctxrepo HEAD (unchanged): 9b4f55d34b78dfe051b3ab5ca1366cc2bab078ab
- importer input HEAD: 093b6b01c29123361b043ddd0f36cd4c578cffe2
- importer input tree: 5a606a476b3e9010cdd277841f400aeed8d00fbf
- mobile input HEAD: a5933fd6de5616493de75f0db907098b149b955c
- frozen original C1 review / parent DB proof tree: 3c3d09cf95851fb91e66ed20fe770a1a8164845c
- separate recovery tree (not integrated): a8908132a9c4882dbe80f9fbc1052532c7e68c3b
- PR head: N/A (no PR/commit); combined C1a+C1b output tree: 660e436ecbf911b6984b40ed43d135e3dc308378
- PR base: N/A (no PR); exact local input base: c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7
- timestamp (ISO 8601 UTC): 2026-09-17T19:31:53.082195+00:00

# C1 sequential split — BUILD REPORT

## Frozen local results and custody
Both coherent slices pass their own actual workflow size/density/banned-token gates and focused verification; neither is landed, published, independently audited or consumer-frozen. No broad work remains in this lane. [C1a-gates.json](C1a-gates.json); [C1b-gates.json](C1b-gates.json); [C1a_REPORT.md](C1a_REPORT.md); [C1b_REPORT.md](C1b_REPORT.md)

| Slice | Exact input | Frozen output tree | Net workflow lines | Added tests/source | Density | Own focused tests | Contract |
|---|---|---|---:|---:|---:|---:|---|
| C1a | `c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7` | `404dd55d2fde7ab9fab46fb4ea1d27a9d79a7556` | 202 | 165/57 | 2.895 | 158 passed | 1.5.0; no session |
| C1b | `404dd55d2fde7ab9fab46fb4ea1d27a9d79a7556` | `660e436ecbf911b6984b40ed43d135e3dc308378` | 252 | 176/80 | 2.200 | 175 passed | 1.6.0; known-ID owner session |

These are independent runs, not transferred results from original tree3c3d09cf. Each used Node20, a private generated Prisma client, sanitized environment/network denial, one worker and installed V8 coverage provider; typecheck/lint/fresh generator determinism passed for both. Coverage lines A98.85%, B98.95%; added-instrumented lines A57/57 and B80/80 by disclosed line-range method. Full repository suite was NOT run. [C1a-focused.log](C1a-focused.log); [C1b-focused.log](C1b-focused.log); [C1a-diff-coverage.json](C1a-diff-coverage.json); [C1b-diff-coverage.json](C1b-diff-coverage.json); [command-ledger.jsonl](command-ledger.jsonl)

## Exact patches and reconstruction
| Deliverable | SHA256 |
|---|---|
| [C1a.patch](C1a.patch) — main-relative | `5b429e2ffb0dea0d7c75f7ef4ecd46a7ea89f0e60a0894e92f3a5e7eb729aed5` |
| [C1b-relative.patch](C1b-relative.patch) — C1a-tree-relative | `2f50e35aa547df6249ffd4426a627d22e5944870edb814891d5bc3ecef8e029b` |
| [C1-cumulative.patch](C1-cumulative.patch) — main-relative review/comparison only | `eae14ef30495cf0870847695b83178e5d5bcfefd4d5c3c6791d23af13f1e25b9` |

Main→A→B and main→cumulative independently reconstruct the same final B tree. B is NOT a main-relative patch. Cumulative delta remains454 workflow lines and is NOT one cap-compliant publishing slice; publish only the sequential measured slices after parent gates. No commits were created. [reconstruction-result.json](reconstruction-result.json); [sequential-reconstruction.log](sequential-reconstruction.log); [cumulative-reconstruction.log](cumulative-reconstruction.log)

## Preserved assertions and exact semantic delta
Every one of ten frozen pairing/contract spec files is byte-identical in final B. AST mapping hashes170 recognized test blocks/365 expect calls: A includes158 blocks, B introduces12 blocks/44 expect calls (17 extra executed cases after parameterization). The original 13-line init→status→redeem→session test returns at its original position only in B; no duplicated fixture, removed assertion, formatting squeeze or source skip. [ASSERTION_PRESERVATION.md](ASSERTION_PRESERVATION.md); [assertion-preservation.json](assertion-preservation.json)

Compared with immutable complete C1 tree3c3d09cf, the final whole tracked tree differs in exactly three files, +6/-3 lines: `scripts/importer-contract.ts` changes only1.5.0→1.6.0; generated JSON changes onlyinfo.version accordingly; decision doc updates the version heading and adds the sequential-slice note. All other runtime/schema/migration/tests/config/dependency files are byte-identical. No other semantic delta. [original-to-split-delta.json](original-to-split-delta.json); [mapping-verification.log](mapping-verification.log)

## Parent proof mapping and actual integration lock
Parent independently completed18 synthetic PostgreSQL18.6 checks on original tree3c3d09cf, using original pairing migration/minimal User fixture/10k legacy rows and actual service+Prisma. Schema and up/down migrations match both slices byte-for-byte and hash-match the proof; A's retained methods/helpers match original AST text hashes, while B's entire runtime service/controller/DTO matches original bytes. This supports scoped provenance mapping, not a new whole-tree DB run. Builder made no DB connection and did not rerun parent work. [parent original-tree DB result](file:///home/user/workspace/operator80/execution/c1-migration/RESULT.json); [parent-proof-mapping.json](parent-proof-mapping.json)

Limits remain: PostgreSQL18 differs from CI15; no full migration chain, HTTP guards/live auth vendor or full suite; writer lock deliberately hits200ms timeout, then small uncontended synthetic DDL~4ms—not production lock/latency proof. Down/up is structural only and destroys IDs; after issuance rollback code while retaining the column. No security/retention/idempotency waiver. [parent original-tree DB result](file:///home/user/workspace/operator80/execution/c1-migration/RESULT.json)

Actual parent patch-composition conflicts are **docs/contracts/importer-openapi.json** and **scripts/importer-contract.ts**, not schema. Parent owns both generator/version integration locks and must reconcile recovery+sequentialC1 in its separate integration lane and regenerate/revalidate there. Recovery treea890 remains untouched by this builder. [parent composition check](file:///home/user/workspace/operator80/execution/backend-composition/c1-over-recovery-check.log); [unchanged-inputs-after.json](unchanged-inputs-after.json)

## Remaining blockers / no consumer release
- Inherited audit14high/1critical, full-repo21lint warnings, hygiene/CI enforcement findings, auth timeout/idempotency/race concerns and missing full-suite/independent exact-tree audit remain; scoped green checks do not waive them. [C1a_REPORT.md](C1a_REPORT.md); [C1b_REPORT.md](C1b_REPORT.md)
- Init is still non-idempotent; retries create distinct IDs and lost responses can strand unknown IDs. Session lookup requires already-known ID; pairing means setup only, never accepted Start, import progress, native data or completion. Coach/owner restriction not widened to sub_coach/gym_owner. [slice-inputs/b/docs/decisions/2026-09-17-c1-durable-paired-intent.md](slice-inputs/b/docs/decisions/2026-09-17-c1-durable-paired-intent.md)
- Retained unique six-digit codes have one million values; no recycling/cleanup system. Deleting bound TTL-expired rows breaks durability; hard account deletion cascades. Parent must govern capacity/retention/unknown-ID/mobile owner-switch/role-policy blockers before consumers or activation. [slice-inputs/b/docs/decisions/2026-09-17-c1-durable-paired-intent.md](slice-inputs/b/docs/decisions/2026-09-17-c1-durable-paired-intent.md)

## Process and release
Full split brief read before edits; canonical inputs rechecked by hashes. Only /tmp/tgp-op80-c1-split and assigned c1-split evidence written. Original clone and four input HEADs/trees/status remained unchanged, dependencies unchanged; only private generation touched own node_modules. No installs/audit repeats, commits, pushes/remote calls, full suite, DB, server/browser, subdelegation, recovery/consumer edits or flags activated. Requested Astra inheritance is not runtime-model verification. [DESIGN_CHECKPOINT.md](DESIGN_CHECKPOINT.md); [unchanged-inputs-before.json](unchanged-inputs-before.json); [unchanged-inputs-after.json](unchanged-inputs-after.json)

TDD split checkpoints: A test-only red failed missing import_intent_id TypeScript result property on main (0 executed, not a behavior count); B's preserved generated-session assertion failed on A's absent route (1failed,48filtered). Then each exact slice passed its own full bounded scope with zero skips. [C1a-red.log](C1a-red.log); [C1b-red-contract.log](C1b-red-contract.log); [C1a-focused.log](C1a-focused.log); [C1b-focused.log](C1b-focused.log)

Complete per-slice 55-row R100 plus18-row R109–126 self-checks are in [C1a_REPORT.md](C1a_REPORT.md) and [C1b_REPORT.md](C1b_REPORT.md). Parent owns completed dispatch-ledger verdict/latency update. **Private builder writer/generator/test resources are released; no further writes or tests planned.**

VERDICT: FINDINGS
