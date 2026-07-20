# IMPORTER-I Build Brief — coach-scoped, family-parameterized reconstructed-entity review READ

- **Brief ID:** IMPORTER-I
- **Date:** 2026-07-20 (Op 65)
- **Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com> (R0/R3)
- **Status:** APPROVED FOR BUILD (pre-build gate PASSED). Not yet dispatched — dispatch under its own R14 dual-lens audit cycle.
- **Lane position:** TrueCoach vertical proof V-PR stack, second leg — `IMPORTER-H (LANDED) → IMPORTER-I (THIS) → PR-M4 → V5`. Do not reorder.
- **Governing decision:** Op 63 "Defer messaging" (`decision_record_op63_v0_defer_messaging_2026_07_19` + DECISION_LOG Op-63). The R138 four-question decision gate for the whole vertical-proof scope was recorded there; this brief is the build spec for one V-PR within that decided scope, not a new directional decision.
- **Pre-build authority:** `/home/user/workspace/importer-i-pre-build-review.pplx.md` (VALIDATE FIRST, then BUILD SMALLER). Idiot-Index verdicts below are binding.
- **Rule authority:** context-repo `AGENT_RULES.md` is canonical for this backend leaf per [[R-RULE-AUTHORITY-1_2026-07-20]]. Doctrine framing per [[R-SITE-AGNOSTIC-1_2026-07-20]].

---

## 0. One sentence

Expose the **already-reconstructed canonical entities** (clients + workouts + client history) that IMPORTER-H writes, as a **coach-scoped, family-parameterized, cursor-paginated READ** the mobile/web review surface (PR-M4) can consume — canonical rows plus honest page metadata, nothing more.

## 1. Consumer and semantics (PINNED)

- **Named consumer:** PR-M4 (mobile minimal honest per-family counts/reasons review screen). IMPORTER-I exists to unblock PR-M4; it has no other consumer. A fixture-level consumer/contract test MUST exist so the surface is not dead API.
- **What it reads:** the canonical `ScoutReconstructedEntity` rows materialized by IMPORTER-H for the families **clients**, **workouts**, and **client_history**. These are **write-only-until-now** entities — reconstructed and stored, but not yet mobile-readable per family. IMPORTER-I is the missing read.
- **What "review" means here (NARROW):** family-scoped canonical rows + honest per-page metadata (`page_count`, `next_cursor`). It is **NOT** a second progress/status system. The existing POST reconstruction progress/accounting (`staged = reconstructed + skipped + failed`) remains the separate, authoritative job-progress surface and is untouched.
- **Erased entities (PINNED — no `Deleted` flag):** erased/rolled-back entities MUST be proven absent by the existing **cascade + RLS** behavior of the D2 model (rollback/erasure cascades imported data and links; fail-closed tenant RLS). IMPORTER-I MUST NOT add a `Deleted` state, tombstone, or soft-delete column to make erasure observable. A live-RLS/erasure test MUST prove an erased entity does not appear in the read.
- **Billing:** remains an explicit **excluded** family — never captured, staged, reconstructed, or exposed. It is not a family value IMPORTER-I accepts.
- **Messaging:** DEFERRED (Op 63). Not a valid family for v1. Do not add it.

## 2. Endpoint shape

```
GET /api/scout/reconstruct/entities?family=<allowed>&cursor=<opaque>&limit=<bounded>

authorize coach from the trusted principal (never from a cursor or request-supplied id)
require the existing importer dark flags (FEATURE_SCOUT_INGEST + FEATURE_SCOUT_RECONSTRUCT); uniform 404 when off (R-DARK-1)
require settled intent; otherwise uniform 404
validate family against the existing RECONSTRUCT_ENTITY_TYPES allowlist (clients | workouts | client_history)

within one repeatable-read transaction:
  decode + bind the opaque cursor to coach + intent + family + ordering (cursor is non-authorizing)
  read a bounded page of reconstruction-ledger rows for that family
  collect target IDs
  materialize the matching ScoutReconstructedEntity rows under RLS
  return { entities[], page_count, next_cursor }
```

## 3. Idiot Index — binding verdicts (from the pre-build review)

| Component | Verdict |
|---|---|
| Reuse roster controller/service structure, cursor codec, snapshot txn, coach scoping, uniform-404 | **REUSE** |
| Reuse `RECONSTRUCT_ENTITY_TYPES` allowlist (family neutrality) | **REUSE** |
| Reuse existing importer dark flags (`FEATURE_SCOUT_INGEST` + `FEATURE_SCOUT_RECONSTRUCT`) | **REUSE** |
| Reuse live-RLS / no-oracle test harness | **REUSE** |
| Generic entity materialization from ledger target IDs | **BUILD** |
| Opaque, non-authorizing cursor bound to all non-cursor params | **BUILD (thin)** |
| OpenAPI bump + R80 byte-pinned drift/contract tests | **BUILD** |
| Behavioral + live-RLS + erasure tests | **BUILD** |
| New table / migration | **DELETE (12x)** |
| New feature flag | **DELETE (8x)** |
| Cross-family join endpoint | **DELETE (10x)** |
| Full-collection totals scan | **DELETE (7x)** |
| Queue / workflow engine / schema registry / CDC / event sourcing | **DELETE (20x+)** |
| Source-specific (TrueCoach) response DTO | **DELETE (∞ — contradicts the product)** |
| Claim / credential / account-link / billing / messaging surface | **DELETE (15x)** |
| Second "progress" state machine | **DELETE** |
| `Deleted`/tombstone state to represent erasure | **DELETE (use cascade/RLS)** |

## 4. Hard constraints (R136 / pre-build STOP list)

**MUST NOT build:** new table, migration, feature flag, totals scan, cross-family join, source-specific DTO, credential/claim/account-link flow, billing capture, messaging, queue/workflow engine, schema registry, CDC, event sourcing, or a second progress system.

**MUST hold:** site-agnostic core (no adapter/TrueCoach semantics in the contract — validate contract fixtures from ≥2 structurally different adapters if available, otherwise a synthetic second shape); coach/tenant/RLS deny-by-default fail-closed on every page; every page independently re-authorizes tenant + coach + family + flag + settled-intent; one explicit repeatable-read snapshot per response (no cross-page snapshot promise without proof); no partial-error semantics (reconstruction jobs own failure reasons); `page_count` only, never a full-collection total; erasure proven by cascade/RLS, not a `Deleted` flag.

## 5. Evidence required to land (gates)

- Dual-lens R14 audit CLEAN at the exact head; **0 open P0–P3**.
- R74 test:src ratio **≥ 2.0**; R75 banned-cast net **≤ 0**; R23/R76 ≤ 400 prod LOC (R86/R100 operator-signed escape hatch only if cohesive and justified — not an R109 metric-gaming split).
- R80: OpenAPI is the source of truth; version bump + byte-pinned contract/drift test green; generated types not hand-written.
- Behavioral tests: bounded page + stable `next_cursor`; empty cursor ⇒ done; cursor bound to all non-cursor params (changing family/coach invalidates); coach-A cannot read coach-B rows (live RLS); erased entity absent via cascade/RLS; family not in allowlist ⇒ rejected/404; flags off ⇒ uniform 404; unsettled intent ⇒ uniform 404.
- R124 both-ways SHA verification; drift guard held.
- Feature stays dark (both flags default-off); no new flag; no migration.
- Landed R3-clean via the git-native `R3_MERGE_RUNBOOK.md` path (backend product `main`): `git commit-tree` squash + PLAIN fast-forward push; NO force / NO `--force-with-lease` / NO admin bypass / NO server-side merge; author == committer == `Bradley Gleave <bradley@bradleytgpcoaching.com>`; no AI/co-author tokens.

## 6. Decision record — DR-IMPORTER-I (§9 shape)

- **DECISION:** Add a coach-scoped, family-parameterized, cursor-paginated READ over the canonical entities IMPORTER-H already reconstructs, reusing the roster read path; no new storage, flag, join, totals, or DTO.
- **REAL GOAL:** make write-only reconstructed workouts + client_history (and clients) mobile-readable per family so PR-M4 can present honest review — without inventing a second progress system.
- **ROOT CAUSE:** IMPORTER-H writes canonical multi-family entities but only the clients roster has a coach-readable path; workouts/client_history have no per-family read, so PR-M4 has nothing to consume.
- **FIVE-STEP RESULT:** Questioned whether a new endpoint/consumer is needed (pinned PR-M4 + fixture consumer test) → Deleted table/migration/flag/join/totals/DTO/claim/second-progress/`Deleted`-state → Simplified to `materialize()` substitution over the existing roster read path + existing allowlist → Accelerated with deterministic golden fixtures reused from IMPORTER-F/H → Automated last (byte-pinned OpenAPI drift in CI; no new automation/flags).
- **IDIOT-INDEX RESULT:** one generic materialization + one thin cursor binding + OpenAPI/contract/behavioral/RLS tests; everything else REUSED; the 5x+ items are DELETED.
- **EXTREME TEST:** 10× page volume stays bounded (cursor page, no full scan); erased entity never surfaces (cascade/RLS); cross-tenant read fail-closed; adapter-neutral contract holds against a second structural shape.
- **HYPERSCALER LENS:** opaque non-authorizing cursors bound to all non-cursor params (Google AIP-158); every page re-authorizes (AWS IAM); one explicit snapshot per response (Spanner reads); page-local counts, no full totals (Azure REST); jobs own failure reasons, reads don't invent partial-error semantics (AIP-193).
- **GOOD WITHOUT BAD:** authoritative per-family review READ without new storage, flag sprawl, cross-family cursor instability, expensive totals, adapter coupling, or a duplicate progress state.
- **EVIDENCE REQUIRED:** §5 gates.
- **ROLLBACK / STOP:** `FEATURE_SCOUT_RECONSTRUCT=false` (route dark). Hard stops: any need for a new migration/table/flag/infra (requires a fresh pre-build gate); any adapter-specific core contract; any open P0–P3; base/head SHA drift; failure of RLS/no-oracle, settled-intent, snapshot, replay, erasure, or accounting tests; contradictory canonical rule text.
- **NEXT ACTION:** Dispatch the IMPORTER-I build against this brief on the backend at live main `f9b81cf` (verify with GitHub before mutation); land ONLY via the git-native `R3_MERGE_RUNBOOK.md` path; then unblock PR-M4.

---

**R0/R3 footer:** All commits authored AND committed by `Bradley Gleave <bradley@bradleytgpcoaching.com>`. Zero AI/Claude/agent/Co-authored-by tokens. Ever.
