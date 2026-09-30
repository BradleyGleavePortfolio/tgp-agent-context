# C1 scope-cap checkpoint

The complete safe candidate currently measures **453 net workflow-counted lines** after initial readability formatting. This exceeds the actual 400-line all-code cap; no exemption, compressed code, or dropped tests is proposed. The canonical production-only cap is not the limiting gate.

Coherent sequential integration plan:
1. **C1a — durable issuance and legacy-safe echo:** nullable unique UUID migration, init ownership/current-role check and UUID issuance, status current-owner query and stored-ID echo, redeem stored-ID echo without auth changes, legacy omission and retry/concurrency tests, regenerated 1.5.0 echo contract. No session endpoint or mobile consumption yet. Useful independently as a persisted server correlation seam; does NOT make downstream extension-minted runs server-bound.
2. **C1b — owner-bound retained setup lookup:** POST session DTO/service/controller and no-store metadata, explicit coach/owner guard plus current database role/owner predicate, body UUID validation, known-ID-only semantics, credential-free response; durable-session tests plus end-to-end init/status/redeem/session unit chain; regenerate subsequent contract version. Depends on C1a. Only combined C1a+C1b after audited landing/freeze can release consumer planning to implementation.

The current complete tree is a review/integration candidate, **not one cap-compliant publishable PR**. Parent must either request exact sequential split artifacts or authorize a distinct owned pass to prepare/verify them; no cap waiver is implied. Keep full assertions in both slices, and measure each before integration. Remaining work in this bounded builder pass is focused verification and the exact complete tree/patch plus exhaustive findings. No full suite, DB proof, remote writes, or commits performed.

Final review packet: workflow net **454**, test density **341/135 = 2.526**, canonical source+SQL net118. Exact combined tree `3c3d09cf95851fb91e66ed20fe770a1a8164845c`; generated contract now complete/deterministic, 175 bounded tests pass. No exact C1a/C1b split patch is claimed. Parent must prepare and validate sequential slices before publishing.
