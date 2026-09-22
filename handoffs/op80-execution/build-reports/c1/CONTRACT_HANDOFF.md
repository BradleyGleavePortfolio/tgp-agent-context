# C1 contract handoff — review only, consumers blocked

Exact local tree: `3c3d09cf95851fb91e66ed20fe770a1a8164845c`. Base HEAD remains `c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7`; no commit/PR exists. [Exact patch](C1_FINAL.patch), [reconstruction proof](patch-reconstruction.log).

Generated candidate importer contract is **1.5.0**, SHA256 `40b552207ed53c27bf2e83130bbb848dd664ba6424e872cccfb9e0cbd9ae45bb`; two fresh authoritative generator processes and the focused cold-process assertion agree. [Determinism](contract-determinism.log), [49-test contract check](green-contract-complete.log).

| Boundary | Request | Response / authority |
|---|---|---|
| POST init | Existing chosen_platform only | New server persists crypto UUID; code + expiry + import_intent_id. Not idempotent. |
| POST status | Existing code in body | Own active coach/owner only; pending/paired/expired plus stored ID when bound; foreign/unknown reads expired without ID. |
| POST redeem | Existing code in body; public throttled route | Single-use conditional claim; existing Supabase token authority, tokens/platform plus stored ID when bound; legacy rows omit ID. |
| POST session | UUIDv4 import_intent_id in body | Existing authenticated coach/owner only, owner+active role storage predicate, no-store; exact status/ID/platform; unknown/foreign/legacy/inactive row 404; no tokens/code. |

These shapes are defined by the [DTOs](file:///tmp/tgp-op80-c1-build/src/extension-pair/extension-pair.dto.ts), [service](file:///tmp/tgp-op80-c1-build/src/extension-pair/extension-pair.service.ts), and [generated contract](file:///tmp/tgp-op80-c1-build/docs/contracts/importer-openapi.json); no client-supplied intent becomes trusted.

**Important:** init retry creates a distinct ID; a lost response can strand an unknown persisted ID. Lookup requires a known saved ID; no list/discovery or crash-safe unknown-ID recovery exists. Retained row lifetime outlasts code TTL, but not account hard deletion. Paired means setup only—not accepted Start, importer alive, progress, native data or completion. Existing extension-minted ext-UUID runs remain legacy/unbound even with newly paired tokens until a separately landed consumer adopts binding. [Decision](file:///tmp/tgp-op80-c1-build/docs/decisions/2026-09-17-c1-durable-paired-intent.md).

Consumers remain blocked until C1a+C1b land/audit/freeze: complete candidate exceeds actual workflow cap (**454 net**); split plan retains all assertions. Parent alone integrates recovery schema/contract overlap and reruns generation/full validation, proves disposable migration/RLS, governs retained-code capacity (one million unique values), forbids TTL cleanup of bound rows, and resolves mobile owner/role/lost-response issues. This packet does not broaden roles to sub_coach/gym_owner. [Split checkpoint](SPLIT_CHECKPOINT.md), [build report](BUILD_REPORT.md).
