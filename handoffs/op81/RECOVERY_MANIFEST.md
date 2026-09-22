# Operator 81 recovery manifest

Updated 2026-09-18 04:44 UTC. Recovery identity is not acceptance, test execution or release authorization.

## Exact source recovered

| Material | Recovery method | Verified result |
|---|---|---|
| Published dependency candidate | Fetch backend PR524 | Head `238f0f1f152ebbb1b4691f555e98c888473d8ee7`; tree `b2bb1666a91d60927d3ee1d6455ce687ce1c8739` |
| Full backend reconstruction | Replay preserved integrity R2 branch delta onto current base using a separate index | Exact original tree `a8908132a9c4882dbe80f9fbc1052532c7e68c3b` |
| C1a pairing intent | Decompress archived patch, verify hash, apply to base in separate index | Exact tree `404dd55d2fde7ab9fab46fb4ea1d27a9d79a7556` |
| C1b pairing lifecycle | Apply hash-verified relative patch after C1a | Exact tree `660e436ecbf911b6984b40ed43d135e3dc308378` |

### Full reconstruction provenance

The preserved remote branch `fix/scout-ingest-integrity-r2` resolves to `6b263c2f342a561ca8a64e5efa077e6c90601a4a`. Its merge base with backend main is `5076a07a1e54b14e3db84d3aa128fb0bb44542d7`. Replaying that complete ancestor-relative binary diff onto `c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7` via `git apply --cached --3way` produced `a8908132a9c4882dbe80f9fbc1052532c7e68c3b`, exactly the predecessor's recorded full candidate.

This reconstructs every blob and path in that Git tree, including the original diagnostic and ingest assertions. It does not reconstruct later D1/D2 additions absent from the preserved branch. No audited or working product clone was changed; only a separate index and local object store were used.

`evidence/recovered-backend-candidate.patch.gz` is a newly generated base-to-tree patch. Its decompressed SHA256 is `5152c688c957c037f601fd9865345c7cb9377b9baf6bbeca95b82e8bb5d4abe1`. It is not the original working-tree patch whose historical SHA256 is `e678a85a599b6dd81ab0f3881cc779378a9ab866d05f18b44120aa4d2452b6d4`. Source-tree identity is verified; original patch-byte identity is not claimed.

The full reconstruction is oversized and has an obsolete atomic database-rollout assumption. Preserve it as source, then extract the planned expand/transition/backfill/readiness/writer/contraction slices. Do not land this combined tree or treat the old PostgreSQL 18.6 proof as a new PostgreSQL 15 rehearsal.

### C1 patch identity

The decompressed C1a patch SHA256 is `5b429e2ffb0dea0d7c75f7ef4ecd46a7ea89f0e60a0894e92f3a5e7eb729aed5`. The decompressed C1b-relative SHA256 is `2f50e35aa547df6249ffd4426a627d22e5944870edb814891d5bc3ecef8e029b`. Both match the archived manifest. Reconstruction ran against backend base `c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7`, without tests, generated-output edits or product publication.

C1's provisional 1.x contract and missing lost-init-response idempotence remain governed by the newer plan. Recovered code is not a frozen consumer contract.

## Still missing

- Final Op80 backend dependency Lens A/Lens B reports and later stopped-fixer packets.
- Exact D1 tree `410ac3a7f7a8a62d7f00081c525b760786fd2eef` and D2 tree `ad166457d90b45c26a992881059ac98ce66accec`, their added assertions and the later prepared validation test patch.
- The final downloadable transfer package described in the attached transcript.

The accessible artifact library contains only this session's study/plan artifacts and user attachments. The complete paginated backend branch inventory contains the preserved integrity and dependency branches but no later D1/D2 branch. Direct GitHub tree lookups for the reconstruction and both diagnostic hashes returned 404; reconstruction succeeded independently through the preserved ancestry, while D1/D2 remain unavailable.

Do not relabel newly authored replacement tests as preserved originals. If later D1/D2 must be re-established from the recovered baseline, record that as new work, preserve the original baseline assertions, derive the complete behavior matrix from the handoff, and reconcile any original transfer package when it becomes accessible.

## Execution boundary

The two independent PR524 reviews are active on unchanged source-only clones. Recovery work does not alter their matrix, brief or primary validation evidence. No product code has been merged and no production feature enabled.
