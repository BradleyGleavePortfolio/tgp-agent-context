# V5 Multi-Adapter Build Brief — site-agnostic core proof (≥2 structurally independent adapters, zero core change for #2)

- **Brief ID:** V5-MULTI-ADAPTER
- **Date:** 2026-07-20 (Op 68)
- **Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com> (R0/R3; R138 autonomy in force)
- **Status:** APPROVED — STACK LOCKED. Not yet dispatched — each PR runs its own R14 dual-lens cycle + git-native `R3_MERGE_RUNBOOK.md` landing.
- **Lane position:** last leg of the TrueCoach vertical proof — `IMPORTER-H (LANDED) → IMPORTER-I (LANDED) → PR-M4 (LANDED) → V5 (THIS)`. Do not reorder.
- **Governing decision:** Op-63 "Defer messaging" R138 directional gate (the vertical-proof scope). This brief tightens the *definition* of the already-planned V5 leg + records verified product-repo facts; it is not a new directional decision, so no fresh R138 gate is re-run. Full record: DECISION_LOG Op-68 + `current-state.json` `decision_record_op68_v5_stack_lock_2026_07_20`.
- **Rule authority:** context-repo `AGENT_RULES.md` is canonical for every leaf repo per [[R-RULE-AUTHORITY-1_2026-07-20]]. Doctrine framing per [[R-SITE-AGNOSTIC-1_2026-07-20]].
- **Pre-build authority:** the Op-67→68 read-only gate (extension + backend precondition validation). Verdict: **BUILD SMALLER, thin boundary first.**

---

## 0. One sentence

Prove the reconstruct core is genuinely site-agnostic by driving it end-to-end (capture/ingest → multi-family reconstruct → read contract 1.4.0 → mobile counts/reasons UX) through **at least two structurally independent adapters**, where the **second adapter lands with ZERO core changes** — the only permitted additions are one adapter-local mapper, one data-only blueprint, config, fixtures, tests, and exactly one registry registration.

## 1. Verified product-repo facts (recorded 2026-07-20; correct the stale truth-boundary)

- **BACKEND `growth-project-backend` main `f92a689`:** engine / ingest / RLS are source-neutral, **but `families.ts` hard-wires `mapTrueCoachClient` / `mapTrueCoachEntity`.** TrueCoach mappers **DO exist**. Therefore the canonical `truth_boundaries.no_truecoach_mapper` assertion ("backend has no TrueCoach mapper; 'truecoach' is only a pairing slug") is **STALE / FALSE as of this Op** and is corrected (see §7). The real remaining gap is not "no mapper" but "mapper is hard-wired, not dispatched by `source_platform`" — a thin registry seam, not a rewrite.
- **EXTENSION `tgp-importer-extension` main `4f11683`:** `runReplay` is IO-injected and source-neutral (no `chrome.*` coupling); blueprints are data-only; `capture.js` is passive (Network.enable only, Fetch domain deliberately NOT enabled) while the replay engine is the bounded navigator; deep discovery is **blueprint-authored, not automatic** (auto-induction = PR-C2, deferred). A TrueCoach blueprint exists. The existing boundary supports: **REST, GET/HEAD, `page|cursor` pagination, single `itemsPath`/`idField`, JWT-in-storage or cookie auth.** **No cross-run resume** (in-memory idempotency only).
- **MOBILE `growth-project-mobile` main `a5933fd`:** PR-M4 renders source-neutral per-family counts/reasons from contract 1.4.0 — expected **NO-OP** for V5 unless the end-to-end proof exposes a contract mismatch.

## 2. Locked stack + order (do not reorder)

1. **PR-1 (backend) — thin `source_platform → mapper` registry, TrueCoach-only, BEHAVIOR-IDENTICAL.** Replace the hard-wired `families.ts` dispatch with a registry keyed by `source_platform`; register only `truecoach` (wrapping the existing `mapTrueCoachClient` / `mapTrueCoachEntity` unchanged). **No behavior change, no new family, no new flag, no contract/DTO/schema/migration change** (contract stays 1.4.0, R80 byte-identical). This freezes the mapper interface and is the ONLY prerequisite that unblocks adapter #2. Its own R14 dual-lens + git-native R3 landing.
2. **PR-2a (backend) ∥ PR-2b (extension) — parallel after the interface is frozen (safe because they share only the frozen `source_platform` token + fixture descriptor):**
   - **PR-2a:** `conformance_alpha` backend mapper + deterministic golden fixture + **conformance/core-diff-zero test** (§4).
   - **PR-2b:** extension **data-only** `conformance_alpha` blueprint + recorded CDP fixture + blueprint/e2e specs. Engine untouched.
3. **PR-3 (cross-repo) — deterministic end-to-end proof.** Drive BOTH adapters (TrueCoach + `conformance_alpha`) on recorded fixtures through the same unchanged core: extension replay → ingest → reconstruct → contract 1.4.0 read → mobile render. Assert per-family counts reconcile and the poison rows are honestly `failed` with reasons.
4. **PR-4 (context) — reconcile Op** recording whether the two-adapter / no-core-change gate PASSED or FAILED (docs/state, R14-exempt, plain fast-forward).
5. **Mobile — NO-OP** unless PR-3 exposes a real source-neutral contract gap.

## 3. Adapter #2 specification (the pass-gate proof)

- **Shared `source_platform` token (exact, both repos):** **`conformance_alpha`**. Explicitly **non-production**: it is NOT a coach-selectable platform, MUST NOT be registered in any production platform list, and is only ever exercised by deterministic fixtures in test/staging. It is **not** a renamed TrueCoach fixture.
- **Why structurally independent (not a config variant):** it differs *materially* from TrueCoach across endpoint topology, identifier format, nesting, pagination, optional/missing fields, and poison-row behavior — so it exercises the mapper boundary, not a TrueCoach toggle. It nonetheless stays inside the existing extension boundary (REST, GET/HEAD, `page|cursor`, single key, JWT/cookie) so **no engine change is required**.

| Dimension | TrueCoach (adapter #1) | `conformance_alpha` (adapter #2) |
|---|---|---|
| Endpoint topology | flat list endpoints | nested resource envelope |
| `itemsPath` | flat (e.g. `data`) | nested `result.records` |
| Identifier format | numeric/string `id` | prefixed string at `uid`, e.g. `ca_cl_000001` |
| Field nesting | flat fields | fields under `record.attributes.*` |
| Pagination | `page` (page-number) | `cursor` (opaque `result.page.next`) |
| Optional/missing fields | email present | some rows omit email; null client_history notes |
| Poison-row behavior | n/a | one deliberately malformed row per family (missing `uid` / wrong-typed field) → MUST be counted `failed` with reason, never silently dropped (R59/R109) |

- **Families:** same three — `clients`, `workouts`, `client_history` (contract 1.4.0 allowlist; NO new family; messaging deferred; billing excluded).

### Shared fixture schema (so backend and extension cannot diverge)

A single versioned descriptor is the source of truth for both surfaces:

```
conformance_alpha.fixture.json
{
  "source_platform": "conformance_alpha",
  "fixture_schema_version": "1.0.0",
  "families": {
    "clients":        { "http": "GET", "items_path": "result.records", "id_field": "uid",
                        "field_root": "record.attributes", "pagination": {"style":"cursor","cursor_path":"result.page.next"},
                        "auth": "jwt_storage" },
    "workouts":       { "http": "GET", "items_path": "result.records", "id_field": "uid",
                        "field_root": "record.attributes", "pagination": {"style":"cursor","cursor_path":"result.page.next"},
                        "auth": "jwt_storage" },
    "client_history": { "http": "GET", "items_path": "result.records", "id_field": "uid",
                        "field_root": "record.attributes", "pagination": {"style":"cursor","cursor_path":"result.page.next"},
                        "auth": "jwt_storage" }
  },
  "records":        { "clients": [ ... ], "workouts": [ ... ], "client_history": [ ... ] },
  "expect_records": {
    "clients":        { "reconstructed": <N>, "skipped": [ {"uid":"...","reason":"..."} ], "failed": [ {"uid":null,"reason":"poison_row_missing_uid"} ] },
    "workouts":       { "reconstructed": <N>, "skipped": [ ... ], "failed": [ ... ] },
    "client_history": { "reconstructed": <N>, "skipped": [ ... ], "failed": [ ... ] }
  }
}
```

- The **extension** records a CDP trace whose network responses equal `records` (per family, paginated by `cursor_path`); the **backend** golden fixture asserts reconstructed canonical counts + reasons equal `expect_records`. Both pin `fixture_schema_version` — divergence is structurally impossible.

## 4. Core-diff-zero gate (enforced AFTER PR-1 registry lands)

Adapter #2 (PR-2a + PR-2b) may add ONLY: the `conformance_alpha` mapper, the data-only blueprint, config, fixtures, tests, and **exactly one** `source_platform → mapper` registry registration line.

**FORBIDDEN (any one = V5 NOT passed → STOP, redesign into adapter-local mapping):** any change to the replay engine (`runReplay`), any DTO, the OpenAPI schema/contract (must stay 1.4.0 byte-identical, R80), any migration, any RLS/storage change, any mobile UI change, any new flag/table/queue/workflow, any `if source == …` branch in the core.

**Proof of PASS:** (a) `git diff` over the core path-set (engine, DTOs, OpenAPI, migrations, RLS, mobile UI) is **empty** except the single registry line; (b) `grep` of the core (excluding the registry file + adapter-local dirs) for `conformance_alpha` returns **0**; (c) both adapters' conformance suites green on recorded fixtures.

## 5. Cross-run resume — KNOWN DEFERRED capability

The extension engine has **in-memory idempotency only; no cross-run / process-restart checkpoint.** V5 does **NOT** prove crash-safe cross-run resume. V5's idempotency claim is limited to (a) within-run replay convergence and (b) backend `external_ref` dedupe on re-ingest.

- **Evidence trigger:** only if a fault-injection drill requires resuming after a process kill/restart. If cross-run resume is wanted, it is a **separate pre-build-reviewed slice** (candidate PR-C-RESUME) with its own R14 cycle. Do NOT claim V5 proves it until that slice lands.

## 6. Acceptance matrix + per-PR gates + STOP

**Acceptance (per adapter × per family clients/workouts/client_history):** counts reconcile as `staged = reconstructed + skipped + failed` with reasons (billing accounted `excluded`, never skipped/failed); poison rows honestly `failed`; RLS coach-A cannot read coach-B; erased entities absent via cascade/RLS (NO `Deleted`/tombstone); within-run idempotent replay; cursor stable and bound to coach+family+intent; no-oracle 404; flags-off uniform 404; contract 1.4.0 byte-identical; **backend core diff for adapter #2 == 0.**

**Per-PR gates (each PR, at its exact head):** R14 dual-lens CLEAN, 0 P0–P3; R74 test:src ≥ 2.0; R75 banned-cast net ≤ 0; R76 ≤ 400 prod LOC (R86/R100 operator waiver only, never an R109 split); R79 50-failures sweep; R80 OpenAPI byte-pinned (a forced bump = core-contract change = STOP); R100 readiness board; R124 both-ways SHA + BUILD MATRIX (drift = INFRA_DEATH); R3 author == committer == Bradley Gleave, zero AI/co-author tokens, git-native plain fast-forward (no force/lease/bypass/server-side).

**STOP conditions:** single-adapter dogfood is NOT V5; landing adapter #2 requires any core change; any second progress system / totals-percentage-ETA surface / `Deleted`-tombstone erasure / adapter-specific core contract / billing capture; a new migration/table/flag/queue/workflow without a fresh R138 gate; adapter #2 is a TrueCoach clone/config-variant/output-round-trip (tautological); drift or any P0–P3 at an audited head; source-specific copy in the UI. Do NOT fold in the separate backend `build-sbom` / `release-please` infra failures.

## 7. Correction of `no_truecoach_mapper` (R5-preserving)

The canonical `truth_boundaries.no_truecoach_mapper` and OPERATOR_HANDOFF §3 assertions are corrected this Op: **backend TrueCoach mappers DO exist (`families.ts` `mapTrueCoachClient` / `mapTrueCoachEntity`); mobile `paired` is no longer a dead-end (PR-M3 CTA + PR-M4 counts/reasons landed).** The remaining true boundary is narrower: **no multi-adapter end-to-end proof yet, and mapping is hard-wired rather than `source_platform`-dispatched.** Historical assertions are preserved verbatim in git history and the prior decision records (R5/R132) — not rewritten; only the live truth surface is corrected with a dated note.

## 8. Idiot Index / DELETE verdict (binding for the V5 stack)

| Component | Verdict |
|---|---|
| Reuse source-neutral `runReplay`, ingest, RLS, D2 cascade, roster/entities READ, contract 1.4.0, dark flags, live-RLS + golden-fixture harnesses, mobile PR-M4 panel | **REUSE** |
| Thin `source_platform → mapper` registry (TrueCoach-only, behavior-identical) | **BUILD (thin, PR-1)** |
| `conformance_alpha` mapper + data-only blueprint + shared fixture + conformance test | **BUILD (minimal, PR-2)** |
| Cross-repo deterministic end-to-end proof over both adapters | **BUILD (PR-3, tests only)** |
| New progress/status system | **DELETE (∞)** |
| Totals / percentage / ETA / completion surface | **DELETE (∞)** |
| New migration / table / flag / queue / workflow | **DELETE (gate R138 first)** |
| Adapter registry / plugin SDK / dynamic loader | **DELETE (>6×; two static mappers suffice)** |
| Adapter-specific core branch (`if source==…`) | **DELETE (∞ — contradicts the proof)** |
| Cross-browser (≥2 host) matrix built now | **DEFER (v1.0 cert, not the V5 gate)** |
| Autonomous blueprint induction (PR-C2) | **DEFER** |
| Cross-run resume checkpoint | **DEFER (own pre-build slice; §5)** |
| Billing capture / messaging family | **DELETE (excluded / deferred)** |
| `Deleted` / tombstone erasure state | **DELETE (cascade/RLS proves absence)** |
| Mobile change for adapter #2 | **DELETE (source-neutral already; no-op unless PR-3 finds a gap)** |

## 9. Decision record — DR-V5-STACK (§9 shape)

- **DECISION:** Lock the V5 stack as PR-1 (thin backend `source_platform→mapper` registry, TrueCoach-only, behavior-identical) → PR-2a/2b (backend `conformance_alpha` mapper+fixture+conformance ∥ extension data-only blueprint+fixture) → PR-3 (cross-repo deterministic end-to-end proof) → PR-4 (context reconcile); mobile no-op. Enforce core-diff-zero for adapter #2.
- **REAL GOAL:** prove the core is genuinely site-agnostic (interchangeable adapters), not TrueCoach-shaped, without inventing new storage/flags/contracts.
- **ROOT CAUSE:** mapping is hard-wired in `families.ts`; a `source_platform` dispatch seam is missing, so a second adapter cannot be added without touching the core.
- **FIVE-STEP RESULT:** Questioned whether a registry is needed (yes — it is the single seam that makes #2 core-free) → Deleted registry/SDK/loader/new-flag/new-family/contract-bump/second-progress/tombstone → Simplified to one thin registry + one adapter-local mapper + data-only blueprint → Accelerated with deterministic recorded fixtures + a shared `expect_records` golden → Automated last (conformance + core-diff-zero test in CI; no new automation/flags).
- **IDIOT-INDEX RESULT:** one thin registry + one mapper + one blueprint + fixtures/tests; everything else REUSED or DELETED.
- **EXTREME TEST:** poison rows honestly `failed`; erased entity never surfaces (cascade/RLS); cross-tenant fail-closed; adapter #2 forces zero core diff or V5 fails.
- **HYPERSCALER LENS:** adapter-local mapping behind a stable registry (plugin-at-the-edge, core-neutral); deterministic golden fixtures before real accounts (progressive delivery); page-local counts, no totals.
- **GOOD WITHOUT BAD:** genuine multi-adapter proof without core coupling, flag sprawl, new storage, or dishonest completion.
- **EVIDENCE REQUIRED:** §6 gates; core-diff-zero proof (§4).
- **ROLLBACK / STOP:** all flags default-off (dark); forward-only `git revert`; §6 STOP conditions.
- **NEXT ACTION:** dispatch **PR-1** (backend thin registry) against this brief at live backend main `f92a689` (verify with GitHub before mutation); land via the git-native `R3_MERGE_RUNBOOK.md` path; then PR-2a ∥ PR-2b.

---

**R0/R3 footer:** All commits authored AND committed by `Bradley Gleave <bradley@bradleytgpcoaching.com>`. Zero AI/Claude/agent/Co-authored-by tokens. Ever.
