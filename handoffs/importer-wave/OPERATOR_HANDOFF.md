# OPERATOR HANDOFF — Universal Importer Wave (v0.3 → v1.0)

> **Status:** Single authoritative operator entry point for the importer wave.
> **Doc kind:** Durable coordination/context documentation (audit-exempt per R14 scope).
> **Author identity:** Bradley Gleave <bradley@bradleytgpcoaching.com> (R3 — author AND committer on every commit; no AI/agent/co-author tokens).
> **Supersedes:** `handoffs/importer-wave/AGENT_HANDOFF_V03_2026-07-14.md` (now a superseded redirect stub). `handoffs/importer-wave/HANDOFF_WAVE2.md` is retained as a historical Op-52/Wave-2 artifact only.
> **Reconciled from:** three completed read-only live-repo audits (extension, backend, mobile) + the Op-55 state reconciliation session. This file plus `AGENT_RULES.md` and `handoffs/importer-wave/current-state.json` are the durable sources of truth. Nothing material remains only in a temporary source file.

---

## 0. MISSION (verbatim operator directives — do not paraphrase)

Two verbatim operator statements govern this wave. Both are preserved byte-for-byte per R5.

**Product mission (verbatim):**
> “a site-agnostic, browser-agnostic, ultra-easy migration system that autonomously learns competitor sites, captures all user-authorized accessible data, maps it into TGP's canonical model, reconstructs it deterministically, and presents honest progress in a restrained-luxury UI. TrueCoach is only the first proving adapter.”

**Original mission correction (verbatim, 2026-07-15, Op 54 — preserved per R5, including original spelling):**
> "WRONG - your building a site agnsotics, ultra easy to use, browser agnostic tool that can seamlessly and autonymously pull ALL data from any comeptitors site - send to TGP Database, and be reconstructed to our set values instantly with a luxury UI while doing so!"

**Autonomy directive (verbatim):**
> “Do not ask for approval for normal product, technical, sequencing, implementation, audit, or merge decisions. Research, decide, execute, verify, document, and continue.”

**Ask-only conditions (verbatim):**
> “Ask only when a decision would:
> - Move real money or enable mainnet
> - Create an irreversible external consequence
> - Expose secrets or materially weaken security
> - Change a constitutional rule or waiver
> - Replace the approved architecture rather than improve it
> - Require information that cannot be derived from evidence”

**Stop conditions (verbatim):**
> “Do not stop merely because one task completed. Stop only when:
> - The goal is fully proven,
> - A genuine stop condition is reached, or
> - Further work cannot improve the outcome.”

**The five distinctions.** MISSION (north star: site-agnostic + browser-agnostic + autonomous learning + deterministic reconstruction + honest luxury UI) ≠ FIRST PROOF (TrueCoach on Chrome MV3 — one site, one browser host proving the whole pipeline) ≠ CURRENT STATE (the integrated PRs below) ≠ v0.3 COMPLETION (full autonomous loop for the first proof, default-flagged, honestly reported — the launch bar) ≠ v1.0 ACCEPTANCE (mission made testable — see §8 certification).

---

## 1. Exact operator reading order

### 1.1 Canonical context (read first, in order)
1. `AGENT_RULES.md`
2. `handoffs/importer-wave/current-state.json`
3. This durable operator handoff (`handoffs/importer-wave/OPERATOR_HANDOFF.md`).
4. Any linked importer-wave architecture, decision, acceptance, and audit documents. Delete or mark stale contradictory state rather than preserving multiple truths.

### 1.2 Extension at `a8a6af6b1b3e4f327e19b823f5258a5e6f2335f1`
Repo: https://github.com/BradleyGleavePortfolio/tgp-importer-extension
1. `extractors/truecoach/net.js`
2. `background.js`
3. `shared/replay/engine.js`
4. `shared/replay/blueprint.js`
5. `extractors/truecoach/blueprint.js`
6. `shared/replay/resolve.js`
7. `shared/replay/_interface.js`
8. `content/main.js`
9. `popup/popup.js`
10. `test/start-import.spec.js`
11. `test/start-import-hardening.spec.js`
12. `test/fixtures/cdp-traces/truecoach-clients.json`
13. `manifest.json`
14. `.github/workflows/ci.yml`
15. `scripts/check-prod-loc.mjs`
16. `scripts/check-test-ratio.mjs`

### 1.3 Backend at `95e2c6378e0b1b734328a7fdf6b9a6e33465a663`
Repo: https://github.com/BradleyGleavePortfolio/growth-project-backend
1. `src/scout/scout.module.ts`
2. `src/common/feature-flag/feature-flag-not-found.middleware.ts`
3. `src/extension-pair/extension-pair.controller.ts`
4. `src/extension-pair/extension-pair.dto.ts`
5. `src/scout/scout-ingest.controller.ts`
6. `src/scout/scout-ingest.service.ts`
7. `src/scout/scout.controller.ts`
8. `src/scout/scout.service.ts`
9. `src/scout/scout-ingest.dto.ts`
10. `src/scout/scout.dto.ts`
11. `prisma/migrations/20261222000000_scout_ingest_entity/migration.sql`
12. `prisma/migrations/20261222000000_scout_progress_and_completion/migration.sql`
13. `prisma/migrations/20261223000100_scout_import_state/migration.sql`
14. `prisma/migrations/20261222000000_add_extension_pair_codes/migration.sql`
15. `docs/decisions/2026-07-15-importer-import-status-read.md`
16. `docs/contracts/importer-openapi.json`
17. `scripts/importer-contract.ts`
18. `AGENT_RULES.md`
19. `ENGINEERING_RULES.md`

### 1.4 Mobile at `b8165beaa3804fe8a145214b772f97a3ae9eab65`
Repo: https://github.com/BradleyGleavePortfolio/growth-project-mobile
1. `AGENT_RULES.md`
2. `ENGINEERING_RULES.md`
3. `docs/importer/MOBILE_IMPORT_DECISION.md`
4. `src/types/extensionImport.ts`
5. `src/api/extensionPairApi.ts`
6. `src/hooks/useExtensionPairing.ts`
7. `src/components/coach/ExtensionPairingPanel.tsx`
8. `src/screens/coach/ImportDataScreen.tsx`
9. `src/constants/importPlatforms.ts`
10. `src/utils/safeImportLoginUrl.ts`
11. `src/config/featureFlags.ts`
12. `src/navigation/CoachNavigator.tsx`
13. `src/screens/coach/SettingsScreen.tsx`
14. `src/navigation/__tests__/importDataFlagOff.test.ts`
15. `src/store/coachStore.ts`
16. `src/screens/coach/ClientsListScreen.tsx`
17. `src/components/coach/NewClientBanner.tsx`

---

## 2. Canonical coordinates, completed integrations, and rollback facts

**Context repo:** https://github.com/BradleyGleavePortfolio/tgp-agent-context
- Live main after state reconciliation: `c3aad5e3fcf08d3034fdf550aec4884a6e3f924d`
- Canonical JSON: `handoffs/importer-wave/current-state.json`

**Mobile:** https://github.com/BradleyGleavePortfolio/growth-project-mobile
- Live main: `b8165beaa3804fe8a145214b772f97a3ae9eab65`
- PR #285: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/285
- Approved head: `dce19c508320b2d7e2987aebbdb16983bf04cb63`
- Rollback parent: `169551777a95f9b1e89e4a8a5f75bf53ae23dcd8`
- Dual independent CLEAN, identity-safe squash-equivalent, post-main correctness CI green, feature flag default-off.

**Backend:** https://github.com/BradleyGleavePortfolio/growth-project-backend
- Live main: `95e2c6378e0b1b734328a7fdf6b9a6e33465a663`
- PR #508: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/508
- Approved head: `ab13f49c3d6631c0e922e46b0334770a73bd4b3a`
- Rollback parent: `e6c3082755c89e51c18db9562f84b7b8898ce102`
- Dual independent CLEAN, identity-safe squash-equivalent, feature flag default-off.

**Extension:** https://github.com/BradleyGleavePortfolio/tgp-importer-extension
- Live main: `a8a6af6b1b3e4f327e19b823f5258a5e6f2335f1`
- PR #6 (EXT-C1b): https://github.com/BradleyGleavePortfolio/tgp-importer-extension/pull/6
- Approved head: `55f24d57c625cbd2745ad3fc9226e6d41168d02a`
- Rollback parent: `5eabeec0ee53735753059f72581148052c9f2ac4`
- Baseline: 489/489 tests pass; `manifest.json` version `0.3.0`, `version_name` `0.3.0-rc.1`; `PAIRING_ENABLED=true`.

All final commits are authored AND committed as `Bradley Gleave <bradley@bradleytgpcoaching.com>`, no AI/co-author tokens, non-force fail-on-drift integration. **No production flag enablement or deploy has occurred.**

---

## 3. Current end-to-end truth (what is real vs. what is not)

**Ingestion is NOT reconstruction. No certified end-to-end proof exists yet.** The slice discovers and *stages* source data; it has not been proven to deterministically rebuild that data into canonical TGP entities and surface it to a coach.

**What is implemented:**
- **Extension:** pairing/redeem/refresh, TrueCoach detection, memory-only source-token collection, bounded site replay, ingest, progress, complete, retry, idempotent source envelopes, fail-closed source-auth loss.
- **Backend:** dark-by-default pairing, tenant-scoped ingest/progress/complete/status, idempotent staging writes, durable terminal evidence, uniform 404/no oracle, RLS.
- **Mobile:** dark-by-default START funnel through server-authoritative pairing.

**Why the slice is NOT complete (verified blockers):**
- Mobile `paired` is a dead end — no honest PROGRESS/REVIEW/COMPLETION experience.
- Backend status counts raw staged `ScoutIngestEntity` rows. It does **not** prove reconstruction into TGP canonical models.
- Backend has **no TrueCoach mapper**; `truecoach` is only a pairing slug.
- Extension generic replay omits the verified `Role: Trainer` and `Accept` headers used by the hand-mapped TrueCoach transport.
- Extension tests use synthetic shapes and mocked notifications; a missing `popup/icon-128.png` can fail real completion.
- No certified end-to-end run proves source discovery → canonical TGP reconstruction → review.

---

## 4. Architecture and invariants

- One canonical source of truth per state. **Staging evidence is not canonical reconstruction evidence.**
- TrueCoach-specific behavior must remain declarative adapter data, not engine coupling.
- Site and browser host must be variables, not architecture boundaries.
- User-authorized accessible data only. No bypass of source access controls.
- Secrets/tokens memory-only where possible; never in logs, analytics, broadcasts, ingest payloads, or handoff docs.
- Tenant identity derives from authenticated server context, never client-supplied `coach_id`.
- Idempotent writes and replay; deterministic source IDs; timestamps are values, not keys.
- Bounded concurrency, retries, timeouts, backpressure, and per-run fault isolation.
- Default-off flags; unsafe/unknown states fail closed; non-critical UI degrades honestly.
- Contract changes additive; generated OpenAPI byte-pinned and versioned.
- Durable terminal and reconciliation evidence. Completion must satisfy `staged = reconstructed + skipped + failed` by family, with reasons.
- Luxury UI is restrained, accessible, and truthful: no invented percentage, completion, or certainty.
- Every P0-P3 fixed; fresh dual independent CLEAN on exact SHA before routine integration; verify merged main.

---

## 5. Next dependency order (EXPLICIT — do not reorder)

**PR-C1c FIRST → then resolve backend D1/D2 and implement client reconstruction (IMPORTER-F) → then mobile review handoff (PR-M3) ONLY after authoritative roster materialization.**

### 5.1 Next PR 1 — Extension PR-C1c (first dependency, unblocked)
**Goal:** deterministic evidence that generic TrueCoach replay reproduces the verified request contract and completes a real fixture-shaped run.

**Root cause:**
- `extractors/truecoach/net.js#authHeaders` sends `Authorization`, `Role: Trainer`, `Accept: application/json, text/html`.
- `background.js#makeSourceFetch` sends only bearer authorization.
- `shared/replay/blueprint.js` and `shared/replay/engine.js` have no declarative header channel.
- Current e2e mocks ignore headers.
- `background.js#notifyComplete` points at missing `popup/icon-128.png`; tests mock notifications.

**Files:**
- `shared/replay/blueprint.js`: optional blueprint and per-step `headers: Record<string,string>`, normalized to `{}`. Reject non-plain objects, non-string or empty values.
- `shared/replay/engine.js`: effective headers `{...blueprint.headers, ...step.headers}` passed into `fetchJson`.
- `background.js#makeSourceFetch`: merge injected headers then add bearer last so blueprint data cannot spoof `Authorization`.
- `extractors/truecoach/blueprint.js`: `{Role:"Trainer", Accept:"application/json, text/html"}`.
- `manifest.json` and new tracked `popup/icon-128.png`: valid extension icons / default action icon.
- New `test/replay-truecoach-e2e.spec.js`.
- Extend `test/replay-blueprint.spec.js`.

**Acceptance:**
1. Real router `start_import`, real `test/fixtures/cdp-traces/truecoach-clients.json`, deterministic sleep/no-op and fixed `now`; exact client count, one notes fetch/client, exact entity total, terminal `ingest_succeeded`, complete once.
2. Every source request has bearer, Role, Accept.
3. Every entity preserves locked `{sourceId, sourcePlatform, capturedAt, payload}`.
4. Token absent from broadcasts/storage/notifications/tab messages/ingest.
5. Header validation, override, and absent-header regression tests.
6. Full 489+ suite, LOC ≤400, test:src ≥2, banned/flag gates.

**Hard stop:** icon must land in the same PR. If a real non-empty notes fixture contradicts `itemsPath:["notes"]`, reconcile the blueprint before asserting completeness. **Defer** discovery inference, extra entity families, logout, new backend contracts, and recall accounting.

### 5.2 Next PR 2 — Backend IMPORTER-F (blocked until PR-C1c fixture + target decision)
**Goal:** first deterministic client-only reconstruction with honest reconciliation.

**Proof of missing root:**
- `ScoutIngestEntity` has only a write in `src/scout/scout-ingest.service.ts` and a count in `src/scout/scout.service.ts`.
- No consumer maps staging to `User(role=student)`, `WorkoutProgram`, or other canonical TGP models.

**Blocking dependencies:**
- **D1:** commit a golden real TrueCoach client payload fixture from the extension.
- **D2:** decide canonical client target. **Default recommendation: invite-pending roster shell, not full auth `User`**, to avoid identity collision / provisioning risk.

**Proposed files:**
- `src/scout/scout-reconstruct.service.ts`
- optional `src/scout/scout-reconstruct.controller.ts`
- `src/scout/mappers/truecoach-clients.mapper.ts`
- additive `prisma/migrations/<ts>_scout_reconstruction/migration.sql` and `down.sql`
- `test/scout/reconstruct/**`
- `test/fixtures/truecoach/clients.golden.json`
- append-only `.env.example`, `src/analytics/events.ts`, frozen contract, ADR.

**Ledger:**
- `coach_id`, `intent_id`, `entity_type`, `source_id`
- status `reconstructed | skipped | failed`
- optional `target_id`
- required reason for non-reconstructed outcomes
- unique `(coach_id, intent_id, entity_type, source_id)`
- index `(coach_id, intent_id)`
- FORCE RLS / restrictive deny-all for anon/authenticated/service-role path consistent with existing scout tables.

**Behavior:**
- post-settle only, success/partial, behind `FEATURE_SCOUT_RECONSTRUCT=false`.
- pure total client mapper.
- per-row transaction; siblings survive a poison row.
- idempotent replay.
- status adds reconstruction/skipped/failed accounting and relabels current counts as staged/ingested.
- add missing `FEATURE_EXTENSION_PAIRING=false` to `.env.example`.

**Acceptance:**
1. Deterministic golden fixture.
2. Replay no-op.
3. `staged = reconstructed + skipped + failed` with reasons.
4. Poison-row isolation.
5. Tenant/RLS isolation and no oracle.
6. Default-off no behavior/shape change.
7. Reject running intent.
8. OpenAPI 1.1.0 → 1.2.0 byte-pinned drift test.

**Stop** if D1 or D2 is unresolved. Do not build a multi-family adapter, auth user provisioning, or a generic mapping DSL yet.

### 5.3 Next PR 3 — Mobile PR-M3 (blocked on authoritative roster materialization)
**Current dead-end:** `src/components/coach/ExtensionPairingPanel.tsx` paired card says progress/final result appear in the extension and provides no onward navigation. Mobile consumes only `/extension/pair/init` and `/extension/pair/status`.

**Precondition:** verify reconstructed TrueCoach clients materialize in the exact coach roster read by `/v1/coach/me/clients`, OR verify and intentionally consume a coach-scoped mobile status contract. If neither, **do not build.**

**Lowest-idiot-index proposal (after backend reconstruction):**
- Replace the paired dead-end with a typed CTA to the existing `ClientsListScreen`.
- Capture a user-scoped baseline roster count from `coachStore`.
- On foreground, refresh roster and derive delta.
- `delta>0`: exact “N new clients since you started this import”.
- `delta==0`: calm still-running copy.
- Never derive completion from extension estimates or show invented percentage/state.
- Add `IMPORT_REVIEW_OPENED` with platform slug only.
- Keep existing `EXPO_PUBLIC_FF_EXTENSION_IMPORT=false`.

**Acceptance:** flag-off containment; exact `3→5 = 2` and `3→3` strings; no imported/partial/complete/percentage claims; roster is the only source; typed reachable route; coach identity isolation; accessible live region and restrained-luxury doctrine; full type/lint/test/LOC/density gates.

**Deferrals:** progress mirror, per-client approval, persisted client TTL, extension-presence signal.

---

## 6. Flags and CI risk

- All importer flags are **default-off**. No production flag enablement or deploy has occurred.
- Extension: `PAIRING_ENABLED=true` is the sole-auth-path flag inside the extension baseline (not a production launch switch).
- **Backend CI operational risk (do NOT call the system fully green):** post-main correctness jobs are green, but `build-sbom` and `release-please` failed **identically on the prior main** due to pre-existing `lefthook: not found` automation debt. This is NOT an importer regression and is NOT a launch blocker, but it is an open operational risk to resolve separately.

---

## 7. Deliberate deferrals

- **PR-C1c:** discovery inference, extra entity families, logout, new backend contracts, recall accounting.
- **IMPORTER-F:** multi-family adapter, auth user provisioning, generic mapping DSL.
- **PR-M3:** progress mirror, per-client approval, persisted client TTL, extension-presence signal.

---

## 8. End goal and measurable certification

Fully solved means:
- A user pairs once, selects any supported platform, and the system learns/uses a bounded adapter without browser-specific product coupling.
- Every user-authorized accessible record is discovered or explicitly accounted as inaccessible/skipped/failed.
- Source payloads map deterministically into canonical TGP entities.
- Replay is idempotent and crash-safe.
- The operator and user can see staged, reconstructed, skipped, failed, and ambiguous counts without false completion.
- Rollback and default-off are tested.
- Runbooks tie alerts to exact recovery actions.
- Certification includes **at least three source sites across at least two browser hosts**, with TrueCoach only the first adapter, measured recall/fidelity targets, replay and partial-failure drills, and fresh dual audits on final SHAs.

---

## 9. Required decision-record shape

For each consequential decision, record:
- DECISION
- REAL GOAL
- ROOT CAUSE
- FIVE-STEP RESULT: Questioned, Deleted, Simplified, Accelerated, Automated last
- IDIOT-INDEX RESULT
- EXTREME TEST
- HYPERSCALER LENS
- GOOD WITHOUT BAD
- EVIDENCE REQUIRED
- ROLLBACK / STOP
- NEXT ACTION

### 9.1 Decision record — DR-PR-C1c (extension replay contract parity)
- **DECISION:** Add a declarative header channel to the generic replay engine and prove a real fixture-shaped TrueCoach run before any reconstruction work.
- **REAL GOAL:** deterministic evidence that site-agnostic replay reproduces the verified request contract (bearer + `Role: Trainer` + `Accept`).
- **ROOT CAUSE:** generic `makeSourceFetch` sends only bearer; verified transport needs Role/Accept; no declarative header channel; e2e mocks ignore headers; missing notification icon can fail real completion.
- **FIVE-STEP RESULT:** Questioned per-site fetch code → Deleted any engine-coupled TrueCoach logic (headers stay adapter data) → Simplified to `{...blueprint.headers, ...step.headers}` with bearer added last → Accelerated with a real CDP-trace fixture and deterministic clock → Automated last via header validation/override/absent regressions in CI gates.
- **IDIOT-INDEX RESULT:** one declarative header field + one adapter constant; no new service, no engine branch per site.
- **EXTREME TEST:** blueprint cannot spoof `Authorization` (bearer merged last); absent/empty/non-string headers rejected.
- **HYPERSCALER LENS:** bounded run, deterministic IDs, idempotent envelopes, complete-once.
- **GOOD WITHOUT BAD:** contract parity without broad permissions or engine coupling.
- **EVIDENCE REQUIRED:** full 489+ suite green, LOC ≤400, test:src ≥2, banned/flag gates, token-leak assertions, icon present.
- **ROLLBACK / STOP:** flag-off / revert PR; hard stop if the notes fixture contradicts `itemsPath:["notes"]`.
- **NEXT ACTION:** land PR-C1c with the icon in the same PR; produce the golden client fixture (D1) for IMPORTER-F.

### 9.2 Decision record — DR-IMPORTER-F (first client reconstruction)
- **DECISION:** Build a default-off, client-only reconstruction pass with a full reconciliation ledger, gated on D1 (golden fixture) and D2 (canonical target).
- **REAL GOAL:** prove ingestion→reconstruction into canonical TGP models with honest `staged = reconstructed + skipped + failed` accounting.
- **ROOT CAUSE:** `ScoutIngestEntity` is only written and counted; no consumer maps staging to canonical models.
- **FIVE-STEP RESULT:** Questioned whether to map to full `User` → Deleted auth-user provisioning risk (default to invite-pending roster shell) → Simplified to a pure total client mapper + per-row transaction → Accelerated with a deterministic golden fixture → Automated last via drift test on OpenAPI 1.1.0→1.2.0.
- **IDIOT-INDEX RESULT:** one mapper + one service + one additive migration; no generic DSL.
- **EXTREME TEST:** poison-row isolation (siblings survive); idempotent replay is a no-op; reject a running intent.
- **HYPERSCALER LENS:** per-row fault isolation, tenant RLS, no oracle, deterministic IDs.
- **GOOD WITHOUT BAD:** real reconstruction without identity collision or provisioning risk.
- **EVIDENCE REQUIRED:** acceptance tests 1–8 in §5.2; byte-pinned contract.
- **ROLLBACK / STOP:** `FEATURE_SCOUT_RECONSTRUCT=false`; STOP if D1 or D2 unresolved.
- **NEXT ACTION:** resolve D1/D2, then implement; do not start PR-M3 until roster materialization is authoritative.

### 9.3 Decision record — DR-PR-M3 (mobile honest review handoff)
- **DECISION:** Replace the mobile paired dead-end with a truthful, roster-derived review CTA — only after reconstruction materializes clients in the authoritative roster.
- **REAL GOAL:** an honest PROGRESS/REVIEW experience with no invented completion.
- **ROOT CAUSE:** paired card is terminal; mobile consumes only pair init/status; no reconstructed roster to read.
- **FIVE-STEP RESULT:** Questioned mirroring extension progress → Deleted any extension-derived completion/percentage → Simplified to a roster delta from `coachStore` → Accelerated with exact-string tests → Automated last via flag-off containment + gates.
- **IDIOT-INDEX RESULT:** one typed CTA + one baseline delta; no new transport unless a coach-scoped status contract is intentionally consumed.
- **EXTREME TEST:** `3→5 = 2` and `3→3` exact strings; no imported/partial/complete/percentage claims.
- **HYPERSCALER LENS:** coach identity isolation; roster is the only source of truth.
- **GOOD WITHOUT BAD:** truthful review without false certainty.
- **EVIDENCE REQUIRED:** §5.3 acceptance; full type/lint/test/LOC/density gates.
- **ROLLBACK / STOP:** `EXPO_PUBLIC_FF_EXTENSION_IMPORT=false`; do not build if the precondition is unmet.
- **NEXT ACTION:** ship after IMPORTER-F proves authoritative roster materialization.

---

## 10. 60-second operator recovery

1. Read context `AGENT_RULES.md`, canonical JSON (`handoffs/importer-wave/current-state.json`), then this durable handoff.
2. Verify the four live main SHAs with GitHub before any mutation (context `c3aad5e…`, mobile `b8165be…`, backend `95e2c63…`, extension `a8a6af6b…`).
3. Ensure production flags remain off.
4. Check the active PR head exactly matches its audited SHA and CI (R124 both-ways).
5. If drift or any P0-P3 exists, stop integration and resume the same fixer lane.
6. For importer runtime uncertainty, fail closed, preserve evidence, do not infer completion.
7. Rollback: mobile `b8165be` → parent `1695517`; backend `95e2c63` → parent `e6c3082`; extension current parent `5eabeec` (all recorded in canonical JSON).
8. Update canonical JSON immediately after every merge or stop-condition change.
