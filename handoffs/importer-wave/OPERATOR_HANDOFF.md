# OPERATOR HANDOFF — Universal Importer Wave (v0.3 → v1.0)

> **Status:** Single authoritative operator entry point for the importer wave.
> **Doc kind:** Durable coordination/context documentation (audit-exempt per R14 scope).
> **Author identity:** Bradley Gleave <bradley@bradleytgpcoaching.com> (R3 — author AND committer on every commit; no AI/agent/co-author tokens).
> **Supersedes:** `handoffs/importer-wave/AGENT_HANDOFF_V03_2026-07-14.md` (now a superseded redirect stub). `handoffs/importer-wave/HANDOFF_WAVE2.md` is retained as a historical Op-52/Wave-2 artifact only.
> **Reconciled from:** three completed read-only live-repo audits (extension, backend, mobile) + the Op-55 state reconciliation session + the Op-56 PR-C1c #7 merge reconciliation. This file plus `AGENT_RULES.md` and `handoffs/importer-wave/current-state.json` are the durable sources of truth. Nothing material remains only in a temporary source file.

---

## 0. MISSION (verbatim operator directives — do not paraphrase)

**Billing scope exclusion (verbatim operator directive, 2026-07-15 — preserved byte-for-byte per R5, including original spelling):**
> "Hmm - ok then forget it - we just need to grab workout, client history, messaging, ect. and leave JUST billing info behind."

**Binding effect (canonical, v0.3 and v1.0 importer capture).** Billing is an **explicit excluded data family**. The importer MUST NOT capture, stage, log, reconstruct, or claim completion for any billing data — including payment credentials, payment methods, card data, processor vault tokens, billing profiles, subscription payment instruments, and billing migration. This is a deliberate scope boundary, **not a failure, gap, or missing recall**. Authorized non-billing product data remains fully in scope — workouts, client history, messages, and every other explicitly authorized accessible record. Completeness accounting treats billing as `excluded` with this reason; it is never counted as `skipped`, `failed`, or an incomplete-recall defect. This directive does not change AGENT_RULES, architecture, build order, PR-C1c scope, or the D1/D2 → IMPORTER-F → PR-M3 order.

Two further verbatim operator statements govern this wave. Both are preserved byte-for-byte per R5.

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
4. `handoffs/importer-wave/R3_MERGE_RUNBOOK.md` — the ONLY permitted mechanism to land an importer-wave PR on any production `main` (git-native squash + PLAIN fast-forward; server-side merges forbidden). Read before any `main` landing.
5. Any linked importer-wave architecture, decision, acceptance, and audit documents. Delete or mark stale contradictory state rather than preserving multiple truths.

### 1.2 Extension at `4f116836ddb5449524dd51e995a7e4c012f79493` (post PR-C1c #7; parent `a8a6af6b1b3e4f327e19b823f5258a5e6f2335f1`)
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

### 1.3 Backend at `171829326c50778af25c38aa10ff09665e58b512` (post D1 PR #509; parent `95e2c6378e0b1b734328a7fdf6b9a6e33465a663`)
Repo: https://github.com/BradleyGleavePortfolio/growth-project-backend
> **NOTE (R3-INC-2):** backend main tip `1718293` is a GitHub-generated squash commit and is **NOT R3-compliant** (author `BradleyGleavePortfolio`, committer `GitHub`). Content is verified; identity metadata only is non-conforming. Do NOT claim it is R3-clean. See §2 and §6.
0. `test/fixtures/truecoach/clients.golden.json` (D1 golden fixture) and `test/truecoach-golden-fixture.spec.ts` (byte-pin spec)
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
> **NOTE (Op 62 — PR-M3 LANDED, R3-INC-3):** mobile `main` has since ADVANCED to **`e3a824f335ef75934fe860165ffc9c41a7b7956b`** (PR #287, honest roster-derived review CTA). That tip is **NOT R3-clean** — it landed via an **operator-authorized ONE-TIME BYPASS** using the FORBIDDEN server-side `gh pr merge --squash` path (author `BradleyGleavePortfolio`, committer `GitHub`/`web-flow`, `Co-authored-by: Bradley Gleave` trailer). Content is tree-byte-identical to the audited head `95c9aea`; identity metadata only is non-conforming. Do NOT claim it R3-clean; do NOT rewrite/force-push. See §2, §5.3, §6, and the DECISION_LOG Op-62 entry / `current-state.json` `r3_process_incidents` R3-INC-3. The file list below is the pre-PR-M3 reading snapshot at `b8165be`.
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
- Live main before the Op 57 reconcile: `f469e72807b9fc7f8277ef9c9bcbec07f23b9433` (the Op 56 PR-C1c reconcile commit); advanced by this Op 57 D1-complete + R3-INC-2 reconcile commit (see `repos.context` in the canonical JSON for the exact live head).
- Canonical JSON: `handoffs/importer-wave/current-state.json`

**Mobile:** https://github.com/BradleyGleavePortfolio/growth-project-mobile
- **Live main: `e3a824f335ef75934fe860165ffc9c41a7b7956b`** (PR #287 — PR-M3 honest roster-derived review CTA; parent/base `b8165beaa3804fe8a145214b772f97a3ae9eab65`; tree `91799bbc22aee2ee5608a925e16df2b61c6a84be`, byte-identical to audited head `95c9aea1b2905440a37cb9762e4486e45747165c`).
- **NOTE (R3-INC-3 — NOT R3-clean, honest):** `e3a824f` landed via an **operator-authorized ONE-TIME BYPASS** (verbatim: *"just merge it under whatever name - a one time bypass"*) using the FORBIDDEN server-side path `gh pr merge 287 --squash --delete-branch`. git author `BradleyGleavePortfolio <bradleyapple1031@gmail.com>`, committer `GitHub <noreply@github.com>` (login `web-flow`), squash body `Co-authored-by: Bradley Gleave <bradley@bradleytgpcoaching.com>`. This is the FIRST **deliberate** R3/runbook deviation (R3-INC-1/2 were accidental). Grandfathered, NOT rewritten, NOT normalized. Do NOT claim R3-clean. PR #287 state MERGED; source branch `feat/import-roster-review-pr-m3` deleted (404). Rollback parent `b8165beaa3804fe8a145214b772f97a3ae9eab65`.
- PR #287 (PR-M3): https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/287 · Landed commit: https://github.com/BradleyGleavePortfolio/growth-project-mobile/commit/e3a824f335ef75934fe860165ffc9c41a7b7956b
- Prior (PR #285, M-series): https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/285 · approved head `dce19c508320b2d7e2987aebbdb16983bf04cb63`, rollback parent `169551777a95f9b1e89e4a8a5f75bf53ae23dcd8`.

**Backend:** https://github.com/BradleyGleavePortfolio/growth-project-backend
- Live main: `171829326c50778af25c38aa10ff09665e58b512` (D1 PR #509 squash merge)
- **PR #509 (D1 — golden TrueCoach client fixture):** https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/509
  - Audited PR head: `81f0b70a54a512a454289dade7755b34902e3564` — **fresh Lens A CLEAN and Lens B CLEAN** after the PR-body fixer update; no drift.
  - Base: `95e2c6378e0b1b734328a7fdf6b9a6e33465a663`; rollback parent = same (single parent of the squash commit).
  - Squash-merged `2026-07-16T00:44:49Z`. **Test-only, zero production LOC**; fixture at `test/fixtures/truecoach/clients.golden.json`, spec `test/truecoach-golden-fixture.spec.ts`; source extension path `test/fixtures/cdp-traces/truecoach-clients.json` @ `4f116836ddb5449524dd51e995a7e4c012f79493`.
  - Provenance byte-pin: blob sha1 `826fc5124a1cb6d45c9fbb87b5d3437974b8c3c2`, 2668 bytes, sha256 `af0387fea53dac5a9622c7de6d142c53986b6f4995784eccd6c51f204557e71f`.
  - Merged-main verification: jest fixture spec **5/5 pass**, strict `tsc` exit 0, **15 pre-merge CI checks green**, billing excluded, no auth/PII/RLS/flags/mobile changes.
  - **R3-INC-2 — NOT R3-COMPLIANT MERGE COMMIT.** The source PR head `81f0b70` was R3-clean (author+committer both Bradley Gleave), but the GitHub server-created squash commit `1718293` is author `BradleyGleavePortfolio <bradleyapple1031@gmail.com>`, committer `GitHub`. This does **not** satisfy R3. It is recorded honestly as an OPEN operational/process finding (`handoffs/process-findings/2026-07-16-backend-pr509-r3-merge-identity.md`, canonical JSON `r3_process_incidents` R3-INC-2); backend main is **not** rewritten/force-pushed and this commit is **not** claimed R3-clean. Cause under investigation; blast radius is identity metadata only (code/test content verified).
- **Prior — PR #508 (progress-read):** https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/508 — approved head `ab13f49c3d6631c0e922e46b0334770a73bd4b3a`, integrated to `95e2c6378e0b1b734328a7fdf6b9a6e33465a663` (now the parent of the D1 tip), rollback parent `e6c3082755c89e51c18db9562f84b7b8898ce102`. Dual independent CLEAN, identity-safe squash-equivalent, feature flag default-off.
- **R3-INC-2 GATE — CLEARED / PROVEN FORWARD (Op 58).** The non-destructive R3-compliant merge path is now codified in `handoffs/importer-wave/R3_MERGE_RUNBOOK.md` (git-native squash via `git commit-tree` + **PLAIN fast-forward push**; **NO `--force`, NO `--force-with-lease` anywhere on `main`, NO admin bypass**; mandatory preflight + post-push identity checks) and is empirically proven by backend PR #508 / `95e2c63`. **Server-side squash / `gh pr merge` / REST-GraphQL merge endpoints / GitHub web edit-commit are FORBIDDEN for production `main`.** Reversible importer work has REOPENED; IMPORTER-F is now blocked **ONLY on D2**. The historical merge commit `1718293` is grandfathered (not rewritten, not claimed R3-clean).

**Extension:** https://github.com/BradleyGleavePortfolio/tgp-importer-extension
- Live main: `4f116836ddb5449524dd51e995a7e4c012f79493` (PR-C1c #7 squash merge)
- PR #7 (PR-C1c): https://github.com/BradleyGleavePortfolio/tgp-importer-extension/pull/7
- Audited PR head: `0ea894ec2fb16e6a08bb9b4556cbab4250a07e63` — **both Lens A and Lens B CLEAN** on this exact head
- Rollback parent: `a8a6af6b1b3e4f327e19b823f5258a5e6f2335f1` (prior tip, PR #6 EXT-C1b)
- Post-merge verification: **31 files / 514 tests PASS**; banned/LOC/flags/ratio gates PASS; flags default-off; **no release, publish, production flag, auth/PII, billing, or other PR changes**. PR-C1c produced the golden real TrueCoach client-payload fixture feeding backend D1.
- Prior integration — PR #6 (EXT-C1b): https://github.com/BradleyGleavePortfolio/tgp-importer-extension/pull/6 — approved head `55f24d57c625cbd2745ad3fc9226e6d41168d02a`, rollback parent `5eabeec0ee53735753059f72581148052c9f2ac4` (now the parent of the PR-C1c tip).
- Baseline: `manifest.json` version `0.3.0`, `version_name` `0.3.0-rc.1`; `PAIRING_ENABLED=true`.

Identity-safe integrations authored AND committed as `Bradley Gleave <bradley@bradleytgpcoaching.com>` use no AI/co-author tokens and non-force fail-on-drift integration. **Three known exceptions retain GitHub-synthesized identity and are NOT R3-clean, recorded honestly and not rewritten:** extension #5 tip `5eabeec` (R3-INC-1, accidental), backend D1 merge commit `1718293` (R3-INC-2, accidental), and mobile PR-M3 tip `e3a824f` (R3-INC-3 — the FIRST *deliberate* deviation, landed under an explicit operator-authorized ONE-TIME BYPASS; §5.3/§6). **No production flag enablement or deploy has occurred.**

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
- Durable terminal and reconciliation evidence. Completion must satisfy `staged = reconstructed + skipped + failed` by family, with reasons. **Billing is an explicit `excluded` family (see §0):** it is out of scope for v0.3 and v1.0 capture, never captured/staged/logged/reconstructed, and never counted as `skipped`, `failed`, or an incomplete-recall defect — it is accounted as `excluded` with reason.
- Luxury UI is restrained, accessible, and truthful: no invented percentage, completion, or certainty.
- Every P0-P3 fixed; fresh dual independent CLEAN on exact SHA before routine integration; verify merged main.

---

## 5. Next dependency order (EXPLICIT — do not reorder)

**PR-C1c FIRST → then resolve backend D1/D2 and implement client reconstruction (IMPORTER-F) → then mobile review handoff (PR-M3) ONLY after authoritative roster materialization.**

**Order status (2026-07-18, Op 61):** PR-C1c is **COMPLETE** (extension PR #7, audited head `0ea894e`, dual CLEAN, merged to extension main `4f116836ddb5449524dd51e995a7e4c012f79493`). **Backend D1 is COMPLETE** — the golden fixture is committed to the backend via PR #509 (audited head `81f0b70`, base `95e2c63`) squash-merged to backend main `171829326c50778af25c38aa10ff09665e58b512`; test-only, zero production LOC, dual CLEAN. ⚠️ The D1 merge commit `1718293` is **NOT R3-compliant** (R3-INC-2; content verified, identity-only defect) and is grandfathered. **D2 is DECIDED (Op 59): imported clients are invite-pending, non-login tenant-owned canonical `Person`/roster records (hardened Option 1)** — see §9.4 (DR-D2) and `DECISION_LOG.md` (Op 59). **IMPORTER-F is LANDED (Op 60):** backend PR #510 (audited head `c5f86c858a83bec1f46cfe71a52ef3fbb70a5acb`, base `1718293`) reconstructs settled crawl clients into the invite-pending roster and landed via the git-native `R3_MERGE_RUNBOOK.md` path as backend main **`1e6b3bf434cb58fbe65cea92a480755f0e414fb6`** — **R3-CLEAN**, tree `98589b7` byte-identical to the audited head. **IMPORTER-G is LANDED (Op 61):** backend PR #511 (audited head `aaf15b824251cd20968b3265cb9c7ef59f7e04eb`, base `1e6b3bf`) adds the coach-scoped, tenant-isolated reconstructed-roster READ (`GET /api/scout/reconstruct/roster`) — the bridge PR-M3 consumes — and landed via the git-native `R3_MERGE_RUNBOOK.md` path (git `commit-tree` + PLAIN fast-forward push; no force / no `--force-with-lease` / no admin bypass / no server-side merge) as backend main **`77bb4a04f6e087886e6f27c5129d17dc5162f356`** — **R3-CLEAN** (author == committer == `Bradley Gleave <bradley@bradleytgpcoaching.com>`), tree `b6f548f` byte-identical to the audited head, no AI tokens; PR #511 **closed** with a landed-SHA comment (`merged=false`, expected; branch `feat/importer-g-reconstructed-roster-read` retained, not a zombie). Third R3-CLEAN git-native backend-main landing (after #508 and #510). Dual exact-head audits CLEAN (two non-blocking P3 test-depth notes); R124 both-ways verified; read-only, no migration, no new flag (inherits both scout flags, default-off; route dark unless both `"true"`). R100 A1/A3 resolved via operator-signed `[LOC-EXEMPT:]` + `[TEST-EXEMPT:]` title markers (operator waiver, not a bypass, not an R109 split). Core CI GREEN; `build-sbom` + `release-please` remain **pre-existing** red on base and new main (automation debt, not a regression). Feature dark behind `FEATURE_SCOUT_INGEST` + `FEATURE_SCOUT_RECONSTRUCT` (both default-off; no flag enabled). IMPORTER-G was not in the originally documented order but is a legitimate dependency-safe bridge between IMPORTER-F and PR-M3. **Authoritative roster materialization is LANDED and now coach-readable → `Next active leg = PR-M3`** (next eligible ordered lane, REMAINS next; NOT dispatched, mobile untouched). **Operational finding (unchanged from Op 60):** backend `main` is **NOT branch-protected** (`branches/main/protection` → 404) despite the runbook's "protected `main`" framing; the drift guard held via git's own non-fast-forward rejection. The D2 decision, AGENT_RULES, immutable build order, R3 runbook mechanics, and the site-agnostic mission are UNCHANGED. Order UNCHANGED. **UPDATE (2026-07-19, Op 64):** the trailing "Next active leg = PR-M3" pointer above is SUPERSEDED — **PR-M3 LANDED (Op 62)** and the TrueCoach vertical proof is now ACTIVE and IN PROGRESS backend-first. **IMPORTER-H is LANDED (Op 64):** backend PR #512 (audited head `43c226366fd9e248f3a8d4a8ed26bdfd54b64805`, base `77bb4a04f6e087886e6f27c5129d17dc5162f356`) delivers site-agnostic MULTI-FAMILY reconstruction (clients + workouts + client history) and landed via the git-native `R3_MERGE_RUNBOOK.md` path as backend main **`f9b81cf73289bfe74087dfe6327e52e460fb44f6`** — **R3-CLEAN**, tree byte-identical to the audited head (see §5.2c). **`Next active leg = IMPORTER-I`** (backend mobile-readable per-family review/progress read contract); order preserved **IMPORTER-I → PR-M4 → V5**; NOT dispatched this Op.

### 5.1 Next PR 1 — Extension PR-C1c ✅ COMPLETE (merged as PR #7)
**Goal:** deterministic evidence that generic TrueCoach replay reproduces the verified request contract and completes a real fixture-shaped run.

**Status:** MERGED — extension main `4f116836ddb5449524dd51e995a7e4c012f79493` (audited head `0ea894ec2fb16e6a08bb9b4556cbab4250a07e63`, dual CLEAN; 31 files / 514 tests PASS; gates PASS; flags default-off; no release/publish/prod-flag/auth-PII/billing/other change). The golden real TrueCoach client-payload fixture required by D1 was produced by this PR. The spec below is retained for provenance.

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

### 5.2 Next PR 2 — Backend IMPORTER-F ✅ LANDED (Op 60, backend main `1e6b3bf`)
**Goal:** first deterministic client-only reconstruction with honest reconciliation.

**✅ LANDED (Op 60).** Backend PR #510 (audited head `c5f86c858a83bec1f46cfe71a52ef3fbb70a5acb`, base `171829326c50778af25c38aa10ff09665e58b512`) reconstructs settled crawl clients into invite-pending, non-login tenant-owned canonical `Person`/roster records per the DECIDED D2 model. Landed via the git-native `R3_MERGE_RUNBOOK.md` path (git `commit-tree` + PLAIN fast-forward push; no force / no `--force-with-lease` / no admin bypass / no server-side merge) as backend main `1e6b3bf434cb58fbe65cea92a480755f0e414fb6` — **R3-CLEAN** (author == committer == `Bradley Gleave <bradley@bradleytgpcoaching.com>`), tree `98589b74a354f7292e95386548523e3c796819d9` byte-identical to the audited head, no AI tokens; PR #510 **closed** with a landed-SHA comment (`merged=false`, expected). Both exact-head audits dual-lens CLEAN, **0 open P0–P3 after five P3 fixes**; landed by an independent R3 merge operator (separation of duties). Post-merge core CI GREEN (build-and-test, Deploy app, rls-live-tests, mwb-3-live-tests, CodeQL JS/TS, rls-floor-guard, actionlint, shellcheck); `build-sbom` + `release-please` pre-existing red on base and new main (automation debt, not a regression). Feature dark behind `FEATURE_SCOUT_INGEST` + `FEATURE_SCOUT_RECONSTRUCT` (both default-off; no flag enabled). Authoritative roster materialization is now LANDED. The build spec below is retained for provenance. **Next active leg = PR-M3 (§5.3).**

**Proof of missing root:**
- `ScoutIngestEntity` has only a write in `src/scout/scout-ingest.service.ts` and a count in `src/scout/scout.service.ts`.
- No consumer maps staging to `User(role=student)`, `WorkoutProgram`, or other canonical TGP models.

**Blocking dependencies (all satisfied — IMPORTER-F LANDED):**
- **D1: ✅ RESOLVED (Op 57).** The golden real TrueCoach client payload fixture is committed to the backend at `test/fixtures/truecoach/clients.golden.json` via PR #509 (merged to backend main `1718293`). Byte-pinned; jest 5/5; test-only; dual CLEAN. (Merge-commit identity non-conforming — R3-INC-2; content verified.)
- **D2: ✅ DECIDED (Op 59, under explicit operator authorization).** Canonical client target = **invite-pending, non-login tenant-owned canonical `Person`/roster record (hardened Option 1)**. No `AuthPrincipal`/credential at import; a `Person` is linked to an `AuthPrincipal` only after an explicit credential-verified claim + verified ownership via a unique `AccountLink`; email is unverified imported data (never a canonical id or automatic linking key); opaque `person_id`; tenant-scoped `external_ref {source_platform, source_person_id}` idempotency key; states `InvitePending/Invited/Claimed/Suspended/Deleted`; single-use, single-tenant, short-lived, unguessable claim tokens; atomic claim; rollback+erasure cascade; RLS deny-by-default/fail-closed (tenant-scoped pre-claim, subject+tenant post-claim, service creds server-only). Options 2 (full auth `User` at import) and 3 (separate staging identity as source of truth) are REJECTED. Full record in §9.4 (DR-D2) + `DECISION_LOG.md` (Op 59); evidence `/home/user/workspace/D2_universal_importer_identity_decision_report.md`.
- **R3 merge-path remediation: ✅ REMEDIATED / PROVEN FORWARD (Op 58) and now EXERCISED (Op 60).** The non-destructive R3-compliant merge path is codified in `handoffs/importer-wave/R3_MERGE_RUNBOOK.md` (git-native squash via `git commit-tree` + PLAIN fast-forward push; no `--force`/`--force-with-lease`/admin bypass; mandatory preflight + post-push identity checks) and was used to land IMPORTER-F PR #510 R3-CLEAN as `1e6b3bf` — the first R3-CLEAN backend-main product landing of the wave. Server-side squash / `gh pr merge` / REST-GraphQL merge endpoints / web edit-commit remain FORBIDDEN for production `main`.

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

**Build gate — SATISFIED / LANDED (Op 60):** D2 DECIDED (§9.4), D1 resolved, and the R3 merge-path remediated per `R3_MERGE_RUNBOOK.md` — IMPORTER-F was built to the DECIDED model (invite-pending, non-login canonical `Person`/roster keyed on an opaque `person_id` with a tenant-scoped `external_ref` idempotency key; no `AuthPrincipal`/auth `User`/credential minted at import; email never a canonical or linking key), reused the D1 golden fixture, and landed R3-CLEAN as backend main `1e6b3bf` via the git-native runbook path (never a server-side merge). Deferrals honored (no multi-family adapter, no generic mapping DSL).

### 5.2b Backend IMPORTER-G ✅ LANDED (Op 61, backend main `77bb4a0`) — coach-scoped reconstructed-roster READ bridge
**Goal:** expose the authoritative reconstructed roster to the coach via a read the mobile review handoff (PR-M3) can consume.

**✅ LANDED (Op 61).** Backend PR #511 (audited head `aaf15b824251cd20968b3265cb9c7ef59f7e04eb`, base `1e6b3bf434cb58fbe65cea92a480755f0e414fb6`) adds a coach-scoped, tenant-isolated read (`GET /api/scout/reconstruct/roster`) over the invite-pending `Person`/roster rows materialized by IMPORTER-F. Landed via the git-native `R3_MERGE_RUNBOOK.md` path (git `commit-tree` + PLAIN fast-forward push; no force / no `--force-with-lease` / no admin bypass / no server-side merge) as backend main `77bb4a04f6e087886e6f27c5129d17dc5162f356` — **R3-CLEAN** (author == committer == `Bradley Gleave <bradley@bradleytgpcoaching.com>`), tree `b6f548f9cdbd1cd70e5aafc091b28b1ab627d030` byte-identical to the audited head, no AI tokens; PR #511 **closed** with a landed-SHA comment (`merged=false`, expected); head branch `feat/importer-g-reconstructed-roster-read` retained (not a zombie). Third R3-CLEAN git-native backend-main landing (after #508 and IMPORTER-F #510). Dual exact-head audits CLEAN (two non-blocking P3 test-depth notes); R124 both-ways verified. Read-only, no migration, no new flag — inherits `FEATURE_SCOUT_INGEST` + `FEATURE_SCOUT_RECONSTRUCT` (both default-off; route dark unless both `"true"`); contract 1.3.0, R80 drift green (42 specs). **R100 A1/A3** (489 src / 783 test / 1.60 density; cohesive `service` 221 + `dto` 163) resolved via operator-signed `[LOC-EXEMPT:]` + `[TEST-EXEMPT:]` title markers (R100 escape hatch; operator waiver, not a gate bypass and not an R109 metric-gaming split). Post-merge core CI GREEN; `build-sbom` + `release-please` pre-existing red on base and new main (automation debt, not a regression); `danger dry-run` skipped. **Note:** IMPORTER-G was not in the originally documented immutable build order, but is a legitimate dependency-safe bridge between IMPORTER-F (roster materialization) and PR-M3 (mobile review handoff). ~~**Next active leg = PR-M3 (§5.3).**~~ *(Op-61 wording, superseded — PR-M3 LANDED at Op 62; see §5.3. Next active leg = TrueCoach end-to-end vertical proof.)*

### 5.2c Backend IMPORTER-H ✅ LANDED (Op 64, backend main `f9b81cf`) — site-agnostic MULTI-FAMILY reconstruction (first V-PR of the TrueCoach vertical proof)
**Goal:** parametrize the hardcoded clients-only reconstruct/roster path into site-agnostic multi-family reconstruction (clients + workouts + client history) into canonical TGP entities under D2 — the first V-PR executing the Op-63 "Defer messaging" scope.

**✅ LANDED (Op 64).** Backend PR #512 (audited head `43c226366fd9e248f3a8d4a8ed26bdfd54b64805`, base `77bb4a04f6e087886e6f27c5129d17dc5162f356`) parametrizes the hardcoded `RECONSTRUCT_ENTITY_TYPE='clients'` path into site-agnostic MULTI-FAMILY reconstruction — **clients + workouts + client history** — into canonical TGP entities under the D2 identity model, with honest per-family `staged = reconstructed + skipped + failed`. **Billing EXCLUDED; messaging DEFERRED** (per Op 63). Landed via the git-native `R3_MERGE_RUNBOOK.md` path (git `commit-tree` squash + PLAIN fast-forward push; no force / no `--force-with-lease` / no admin bypass / no server-side merge) as backend main `f9b81cf73289bfe74087dfe6327e52e460fb44f6` — **R3-CLEAN** (author == committer == `Bradley Gleave <bradley@bradleytgpcoaching.com>`), tree byte-identical to the audited head, no AI tokens; single parent `77bb4a0` (IMPORTER-G tip). PR #512 **closed** with a landed-SHA comment (NOT server-merged); feature branch **DELETED** (not a zombie). Fourth R3-CLEAN git-native backend-main landing (after #508, IMPORTER-F #510, IMPORTER-G #511). **Two dual independent exact-head audits CLEAN, zero P0–P3** at `43c2263`; the sole P3 (dead field) at earlier head `a1f7606` was fixed **DELETE-FIRST** at `43c2263` and re-audited **FRESH dual CLEAN**; R124 both-ways + drift guard verified; all exact-head PR checks green. **Gates:** R76 **[LOC-EXEMPT]** operator waiver (R100 escape hatch; not a bypass, not an R109 split), R74 ratio **2.12**, R75 banned-cast net **ZERO**. Feature dark behind `FEATURE_SCOUT_INGEST` + `FEATURE_SCOUT_RECONSTRUCT` (both default-off; **no new flag**). **CI (now TERMINAL/VERIFIED):** post-merge core CI on `f9b81cf` is **GREEN** (build-and-test, rls-live-tests, mwb-3-live-tests, rls-floor-guard, CodeQL JS/TS, Deploy app). The only red is two **PRE-EXISTING non-regression** automation jobs — `build-sbom` (lefthook devDependency absent under production-only install → npm `prepare` exit 127) and `release-please` (Actions lacks create/approve-PR permission) — both already red on prior main `77bb4a0`; IMPORTER-H changed no package/workflow/SBOM/release-config file. Per-job run URLs: `current-state.json` `decision_record_op64_importer_h_landed_2026_07_19.postmerge_ci_evidence`. **Next active leg = IMPORTER-I (§5.3 stack).**

### 5.3 PR-M3 — Mobile honest roster-derived review CTA ✅ LANDED (Op 62, mobile main `e3a824f`) — via an OPERATOR-AUTHORIZED ONE-TIME BYPASS (R3-INC-3, NOT R3-clean)
**Resolved dead-end:** `src/components/coach/ExtensionPairingPanel.tsx` previously said progress/final result appear in the extension and offered no onward navigation. PR-M3 replaces that with a typed, roster-derived review CTA.

**✅ LANDED (Op 62).** Mobile PR #287 (audited head `95c9aea1b2905440a37cb9762e4486e45747165c`, base `b8165beaa3804fe8a145214b772f97a3ae9eab65`) delivers the honest roster-derived review CTA on the paired panel (`useRosterReviewDelta`, typed CTA, analytics slug, flag default-off; Rule 18 baseline anchored only on a successful load with identity re-check and flag-off listener skip). It landed as mobile main **`e3a824f335ef75934fe860165ffc9c41a7b7956b`**, tree `91799bbc22aee2ee5608a925e16df2b61c6a84be` byte-identical to the audited head.

**⚠️ HOW IT LANDED — R3-INC-3 (deliberate, operator-authorized, NOT R3-clean).** Unlike the backend git-native landings, PR-M3 landed via the **FORBIDDEN** server-side path `gh pr merge 287 --squash --delete-branch` under an explicit **operator one-time bypass** (verbatim: *"just merge it under whatever name - a one time bypass"*). The merge executors declined to author+committer-force Bradley (treated the runbook's forced-identity `commit-tree` as provenance impersonation). Result: git author `BradleyGleavePortfolio <bradleyapple1031@gmail.com>`, committer `GitHub <noreply@github.com>` (`web-flow`), `Co-authored-by: Bradley Gleave` trailer. This is the **FIRST deliberate** R3/runbook deviation (R3-INC-1/2 were accidental). **NOT R3-clean, grandfathered, NOT rewritten/force-pushed, NOT to be normalized.** The `R3_MERGE_RUNBOOK.md` remains the sole default doctrine and `AGENT_RULES.md` is unchanged (one-time bypass, not a doctrine rewrite). PR #287 state MERGED; source branch `feat/import-roster-review-pr-m3` deleted (404). Post-merge CI GREEN (Analyze actions, Analyze js-ts, Typecheck+lint+test). Audit/test as reported: dual-lens CLEAN at `95c9aea`, 296 suites / 3577 tests green, R124 both-ways verified.

**Delivered behavior:** typed CTA to the existing `ClientsListScreen`; user-scoped baseline roster count from `coachStore`; foreground roster refresh + delta; `delta>0` → exact "N new clients since you started this import"; `delta==0` → calm still-running copy; no imported/partial/complete/percentage claims; `IMPORT_REVIEW_OPENED` analytics with platform slug only; behind `EXPO_PUBLIC_FF_EXTENSION_IMPORT=false` (default-off).

**Deferrals (unchanged):** progress mirror, per-client approval, persisted client TTL, extension-presence signal.

**Next active leg → TrueCoach end-to-end vertical proof** (scope DECIDED Op 63, see §9.5): operator ruled **"Defer messaging"** — v1 covers **clients + workouts + client history** (all already captured/staged); messaging is a later specialized lane, NOT a generic v1 entity. **BACKEND-FIRST** dependency-ordered V-PR stack: **IMPORTER-H** (multi-family reconstruct) → **IMPORTER-I** (mobile-readable per-family review read) → **PR-M4** (mobile minimal honest counts/reasons) → **V5** (staging full-loop dogfood; real-account validation deferred to V5). Build/audit on deterministic golden fixtures; blueprint induction a separate follow-on; branch controls unchanged; **no permanent R3 change**. TrueCoach is ONLY the first proving adapter; the core stays site-agnostic. Billing remains excluded. The immutable build order (PR-C1c → D1 → D2 → IMPORTER-F → IMPORTER-G → PR-M3) is now fully LANDED. **UPDATE (Op 64):** the first V-PR **IMPORTER-H is LANDED** as backend main `f9b81cf` (PR #512; see §5.2c). **`Next active leg = IMPORTER-I`** — order preserved IMPORTER-I → PR-M4 → V5; NOT dispatched this Op.

---

## 6. Flags and CI risk

- All importer flags are **default-off**. No production flag enablement or deploy has occurred.
- Extension: `PAIRING_ENABLED=true` is the sole-auth-path flag inside the extension baseline (not a production launch switch).
- **Backend CI operational risk (post-main correctness jobs green, two automation jobs red):** post-main correctness jobs are green (verified TERMINAL on the IMPORTER-H main `f9b81cf` — see §5.2c), but `build-sbom` and `release-please` failed **identically on prior mains, on the IMPORTER-G main `77bb4a0`, and again post-IMPORTER-H on `f9b81cf`**. Root causes: `build-sbom` — npm `prepare` runs `lefthook install` under a production-only install with no lefthook devDependency (exit 127); `release-please` — Actions lacks permission to create/approve PRs. NOT importer regressions and NOT launch blockers, but an open operational risk to resolve separately. Per-job run URLs (both failures with prior-main comparison, plus the green core jobs): `current-state.json` `decision_record_op64_importer_h_landed_2026_07_19.postmerge_ci_evidence`.
- **Operational finding (Op 60) — backend `main` is NOT branch-protected:** `repos/.../branches/main/protection` returns **404**, which contradicts the runbook's repeated "protected `main`" / R102 framing. This is **not** a runbook STOP trigger: the drift guard is git's own non-fast-forward rejection (verified: no drift on the Op-60 landing), not server-side protection. Operator should reconcile intent — either enable branch protection or update the runbook wording. Doctrine and merge mechanics are unchanged either way.
- **R3 merge-identity — R3-INC-2 (CONTAINED / remediation PROVEN FORWARD, Op 58; runbook EXERCISED CLEAN, Op 60, Op 61, and again Op 64):** IMPORTER-F PR #510 landed R3-CLEAN as backend main `1e6b3bf` (first R3-CLEAN backend-main product landing of the wave), IMPORTER-G PR #511 landed R3-CLEAN as backend main `77bb4a0`, and IMPORTER-H PR #512 landed R3-CLEAN as backend main `f9b81cf` (fourth R3-CLEAN git-native landing after #508, #510, #511) — all via the git-native runbook path, empirically confirming the remediation. The historical D1 commit `1718293` remains grandfathered and non-conforming (see below).
- **R3 merge-identity — R3-INC-2 (historical, backend D1):** backend D1 PR #509 was landed via a GitHub-generated squash, so backend main tip `1718293` carries a non-Bradley author/committer identity that R3 forbids (author `BradleyGleavePortfolio`, committer `GitHub`). The source head `81f0b70` was R3-clean; only the merge-commit envelope is non-conforming and the code/test content is verified. This was a repeat of R3-INC-1. **Forward fix (Op 58):** the git-native squash + PLAIN fast-forward path is now codified in `handoffs/importer-wave/R3_MERGE_RUNBOOK.md` and empirically proven by backend PR #508 / `95e2c63`; server-side squash / `gh pr merge` / REST-GraphQL merge endpoints / web edit-commit are FORBIDDEN for production `main`; `--force-with-lease` is used nowhere on `main`. The historical commit `1718293` is grandfathered — do NOT rewrite/force-push shared main and do NOT claim `1718293` is R3-clean. Full records: `handoffs/process-findings/2026-07-16-backend-pr509-r3-merge-identity.md` and the runbook.
- **R3 merge-identity — R3-INC-3 (mobile PR-M3, DELIBERATE operator-authorized ONE-TIME BYPASS, Op 62):** mobile main tip `e3a824f` (PR #287) landed via the FORBIDDEN server-side `gh pr merge --squash` path under an explicit operator one-time bypass (*"just merge it under whatever name - a one time bypass"*) because the executors declined to author+committer-force Bradley (provenance-impersonation objection). Author `BradleyGleavePortfolio`, committer `GitHub`/`web-flow`, `Co-authored-by: Bradley Gleave` trailer — **NOT R3-clean**. This is the FIRST *deliberate* deviation (R3-INC-1/2 were accidental). Content is tree-byte-identical to the audited head `95c9aea`; post-merge CI green. **Grandfathered — do NOT rewrite/force-push shared main and do NOT claim `e3a824f` is R3-clean; do NOT normalize.** `R3_MERGE_RUNBOOK.md` remains the sole default doctrine and `AGENT_RULES.md` is unchanged. Full record: DECISION_LOG Op-62 entry + `current-state.json` `r3_process_incidents` R3-INC-3 and `decision_record_op62_reconcile_2026_07_19`. Prospective fix (operator to weigh): provision an execution identity that legitimately maps to `bradley@bradleytgpcoaching.com` so the git-native path is honest, or the operator formally amends R3/the runbook — until then any further deviation needs fresh explicit authorization.

---

## 7. Deliberate deferrals

- **PR-C1c:** discovery inference, extra entity families, logout, new backend contracts, recall accounting.
- **IMPORTER-F:** multi-family adapter, auth user provisioning, generic mapping DSL.
- **PR-M3:** progress mirror, per-client approval, persisted client TTL, extension-presence signal.
- **TrueCoach vertical proof v1 (Op 63 "Defer messaging"):** **messaging** (a later specialized lane, own extractor/reconstruction contract — NOT a generic v1 entity); **autonomous blueprint induction / site learning** (separate follow-on); **full luxury review UX** (diff-by-family + suggested fixes + single commit — v1 ships minimal honest counts/reasons); **real-account end-to-end validation** (deferred to V5; build/audit uses deterministic golden fixtures). Billing remains excluded (not a deferral — permanently out of scope).

---

## 8. End goal and measurable certification

Fully solved means:
- A user pairs once, selects any supported platform, and the system learns/uses a bounded adapter without browser-specific product coupling.
- Every user-authorized accessible record is discovered or explicitly accounted as inaccessible/skipped/failed — except the deliberately `excluded` billing family (see §0), which is out of scope and accounted as `excluded` with reason, never as skipped/failed.
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
- **NEXT ACTION:** ✅ DONE — PR-C1c landed as extension PR #7 (merge `4f116836ddb5449524dd51e995a7e4c012f79493`, dual CLEAN @`0ea894e`, 31 files / 514 tests PASS) and produced the golden client fixture. ✅ D1 DONE (Op 57) — that golden fixture is now committed into the backend at `test/fixtures/truecoach/clients.golden.json` via PR #509 (merged to backend main `1718293`; test-only; dual CLEAN; ⚠️ merge commit not R3-clean — R3-INC-2). Remaining before IMPORTER-F: resolve D2 (canonical target) — the R3 merge-path is already remediated/proven forward (`R3_MERGE_RUNBOOK.md`).

### 9.2 Decision record — DR-IMPORTER-F (first client reconstruction) — ✅ LANDED (Op 60, backend main `1e6b3bf`)
- **LANDED:** Backend PR #510 (audited head `c5f86c8`, base `1718293`) landed R3-CLEAN via the git-native `R3_MERGE_RUNBOOK.md` path as backend main `1e6b3bf434cb58fbe65cea92a480755f0e414fb6` (author == committer == `Bradley Gleave`, tree `98589b7` byte-identical to audited head, no AI tokens, PLAIN fast-forward; PR #510 closed, `merged=false` expected). Both exact-head audits dual-lens CLEAN, 0 open P0–P3 after five P3 fixes; independent merge operator. Core CI green; `build-sbom`/`release-please` pre-existing red (automation debt). Feature dark (both flags default-off). Authoritative roster materialization LANDED.
- **DECISION:** Build a default-off, client-only reconstruction pass with a full reconciliation ledger, gated on D1 (golden fixture) and D2 (canonical target).
- **REAL GOAL:** prove ingestion→reconstruction into canonical TGP models with honest `staged = reconstructed + skipped + failed` accounting.
- **ROOT CAUSE:** `ScoutIngestEntity` is only written and counted; no consumer maps staging to canonical models.
- **FIVE-STEP RESULT:** Questioned whether to map to full `User` → Deleted auth-user provisioning risk (**DECIDED (D2, §9.4): invite-pending non-login `Person`/roster shell, no credential at import**) → Simplified to a pure total client mapper + per-row transaction → Accelerated with a deterministic golden fixture → Automated last via drift test on OpenAPI 1.1.0→1.2.0.
- **IDIOT-INDEX RESULT:** one mapper + one service + one additive migration; no generic DSL.
- **EXTREME TEST:** poison-row isolation (siblings survive); idempotent replay is a no-op; reject a running intent.
- **HYPERSCALER LENS:** per-row fault isolation, tenant RLS, no oracle, deterministic IDs.
- **GOOD WITHOUT BAD:** real reconstruction without identity collision or provisioning risk.
- **EVIDENCE REQUIRED:** acceptance tests 1–8 in §5.2; byte-pinned contract.
- **ROLLBACK / STOP:** `FEATURE_SCOUT_RECONSTRUCT=false`. D2 is DECIDED (§9.4: invite-pending non-login `Person`/roster), D1 is resolved via PR #509, and the R3 merge-path is remediated per `R3_MERGE_RUNBOOK.md` — no remaining blocker. Hard stop: never mint a credential/`AuthPrincipal` at import and never use email as a canonical/linking key (revisit *automation of claim* under load, never auto-created logins).
- **NEXT ACTION:** ✅ DONE — IMPORTER-F implemented against the DECIDED model and landed R3-CLEAN as backend main `1e6b3bf` via the git-native `R3_MERGE_RUNBOOK.md` path. Roster materialization is now authoritative; the coach-scoped reconstructed-roster READ bridge (IMPORTER-G, §5.2b) landed R3-CLEAN as backend main `77bb4a0` (Op 61); PR-M3 LANDED as mobile main `e3a824f` (Op 62, §5.3) via an operator-authorized one-time bypass (R3-INC-3, NOT R3-clean). Next active leg = TrueCoach end-to-end vertical proof (§9.2 header below / DECISION_LOG Op-62).

### 9.3 Decision record — DR-PR-M3 (mobile honest review handoff) ✅ LANDED (Op 62)
- **STATUS (Op 62):** ✅ LANDED as mobile main `e3a824f` (PR #287, audited head `95c9aea`, base `b8165be`, tree byte-identical). Landed via an **operator-authorized ONE-TIME BYPASS** (server-side `gh pr merge --squash`) — **R3-INC-3, NOT R3-clean, grandfathered, not rewritten/normalized** (see §5.3, §6, DECISION_LOG Op-62). The decision below is realized; the precondition was met by IMPORTER-F (roster materialization) + IMPORTER-G (coach-scoped read).
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
- **NEXT ACTION:** ✅ DONE — shipped at Op 62 (mobile main `e3a824f`) after IMPORTER-F/IMPORTER-G proved authoritative roster materialization + coach-scoped read. Landed non-R3-clean via the operator-authorized one-time bypass (R3-INC-3). Next active leg = TrueCoach end-to-end vertical proof.

### 9.4 Decision record — DR-D2 (canonical importer client target) — DECIDED (Op 59)
- **DECISION:** Imported clients live as **invite-pending, non-login tenant-owned canonical `Person`/roster records** (hardened Option 1). **No `AuthPrincipal` or credential is created during import.** A `Person` is linked to an `AuthPrincipal` only after an explicit **credential-verified claim** and **verified ownership**, through a **unique `AccountLink`**. Email is **unverified imported data** — never a canonical id and never an automatic linking key. Opaque server-issued `person_id`; tenant-scoped `external_ref {source_platform, source_person_id}` as the idempotency/dedup key; states `InvitePending → Invited → Claimed → Suspended → Deleted`; single-use, single-tenant, short-lived (≤5 min), unguessable claim tokens; atomic claim (create `AuthPrincipal` + `AccountLink` + flip `status→Claimed` in one transaction, or roll back all three); rollback and erasure cascade imported data and links. **Options 2 (full auth `User` at import) and 3 (separate staging identity as source of truth) are REJECTED.** Billing/payment credentials/methods/cards/vault tokens/profiles/subscription instruments remain an explicit **excluded** family.
- **REAL GOAL:** Immediate, deterministic, coach-visible import continuity with zero premature credentials and one canonical source of truth, while keeping tenant isolation, consent, deletion, and auditability intact.
- **ROOT CAUSE:** The placement choice fixes the authorization key (tenant vs subject uid), the dedup/idempotency key, the linking gate, and the deletion cascade — none of which can be designed until the record's relationship to a credential is fixed. That is why D2 blocked IMPORTER-F.
- **OPTIONS:** (1) invite-pending non-login roster shell (SELECTED, hardened); (2) create a full auth `User` at import (REJECTED — phantom credentialed accounts keyed on unverified imported email; account-takeover / auto-email-linking surface; email-uniqueness collisions; high blast radius); (3) separate staging identity as source of truth (REJECTED — two live PII stores, drift, multiplied tenant-isolation / deletion-failure surface, no offsetting benefit at TGP scale).
- **FIVE-STEP RESULT:** Questioned the false "login at import" requirement (records exist without credentials — Entra/SCIM) → Deleted premature credentials/temp passwords and any second identity store → Simplified to one `Person` + a `status` flag (SCIM `active` pattern) → Accelerated with instant deterministic import (verification deferred to claim) → Automated claim/link/verification last (automatic email-linking explicitly NOT automated).
- **IDIOT-INDEX RESULT:** Option 1 cost ≈ intrinsic cost of one person row; Options 2/3 pay full auth-principal / second-store overhead for the same contact — high idiot index for no functional gain.
- **EXTREME TEST:** 10× (10k clients/one import) stays O(1) per row via opaque id + `external_ref` upsert; Option 2 would provision 10k credential-less logins. 100× (same human across coaches): correctly two tenant-scoped `Person` rows (NIST single-subscriber binding); Option 2's email-keyed logins collide (`AliasExistsException`) and can leak across tenants. Worst case (hostile competitor export): no credentials minted → at most quarantined non-login roster rows in one tenant, contained by fail-closed RLS, reversible via rollback/erasure.
- **HYPERSCALER LENS:** Copy — credential-less pending record (Entra), prestaged profile linked before first sign-in (Cognito), stable opaque `id` + `externalId` dedup + `active` status + write-only password (SCIM 7643/7644), record-then-bind + no-email-identifiers + single-use short-lived link tokens (NIST 800-63C-4), fail-closed RLS + no exposed service key (Supabase), deny-by-default + opaque ids (OWASP). Do NOT copy — full IdP/federation stack, PPIs/FAL2, SCIM bulk protocol, temp-password issuance, enterprise directory ops.
- **RLS INTENT (vendor-neutral):** deny-by-default / fail-closed; RLS on every exposed table, nothing granted until a policy allows it; pre-claim roster rows are tenant/coach-scoped (no end-user `auth.uid()` yet — a subject-uid predicate would silently fail); post-claim rows are subject-uid + tenant scoped; importer runs a server-only path and service/`bypassrls` credentials are never customer-exposed; every request gets an object-level tenant check; opaque non-guessable ids.
- **GOOD WITHOUT BAD:** Keep deterministic import, roster continuity, no premature credential, single source of truth, credentialed explicit claim + deterministic link, tenant isolation + fail-closed authz, idempotent replay, rollback, audit, deletion. Exclude duplicate staging truth, automatic email-only linking, phantom logins, cross-tenant leakage, billing ingestion, heavy enterprise identity infra.
- **EVIDENCE REQUIRED (met):** primary-source research report `/home/user/workspace/D2_universal_importer_identity_decision_report.md` (every claim inline-cited): Microsoft Entra External ID, AWS Cognito, SCIM RFC 7643/7644, NIST SP 800-63-4 / 800-63C-4, Auth0, Firebase, Supabase RLS, OWASP Authorization Cheat Sheet, GDPR Art.5/17.
- **ROLLBACK / STOP:** If claim volume or fraud shows the manual invite→claim path can't scale, revisit *automation of claim* (step 5) — never revert to auto-creating logins. Stop condition: any design that mints a credential before verified ownership, or uses email as a canonical/linking key. Docs/state only — reversible by reverting the Op 59 commit.
- **NEXT ACTION:** ✅ DECIDED under explicit operator authorization (research cybersecurity + RLS, select the top D2 option, go). IMPORTER-F is now UNBLOCKED — build per §5.2 / §9.2 against this model and land ONLY via the git-native `R3_MERGE_RUNBOOK.md` path; PR-M3 stays blocked until authoritative roster materialization.

### 9.5 Decision record — DR-V0-DEFER-MESSAGING (TrueCoach vertical-proof v1 scope) — DECIDED (Op 63)
*(Full R138 four-question decision gate + rejected alternatives: DECISION_LOG.md Op-63; structured state: `current-state.json` `decision_record_op63_v0_defer_messaging_2026_07_19`. Summarized here in the §9 record shape — not duplicated.)*
- **DECISION:** Operator ruled **"Defer messaging."** The v1 TrueCoach end-to-end vertical proof covers **clients + workouts + client history** (all already captured/staged). Messaging is deferred to a **later specialized lane** (own extractor + reconstruction contract), NOT a generic v1 entity. Next step is **BACKEND-FIRST = IMPORTER-H** (multi-family reconstruct) → IMPORTER-I (mobile-readable per-family review read) → PR-M4 (mobile minimal honest counts/reasons) → V5 (staging full-loop dogfood). Build/audit on deterministic golden fixtures; real-account validation deferred to V5; minimal honest counts/reasons UX (not luxury diff); blueprint induction a separate follow-on; branch controls unchanged; **no permanent R3 change**.
- **REAL GOAL:** a faster, lower-risk end-to-end proof on data that already exists — the families a migrating coach cares about first (clients, workouts, history) — proving capture → stage → reconstruct → honest review.
- **ROOT CAUSE:** the lane was stalled on undecided scope; greenfield messaging (no extractor/bucket/downstream in any repo) forced extension-first and a longer path. Deciding scope removes the actual blocker.
- **FIVE-STEP RESULT:** Questioned "must include all families at once" → Deleted greenfield messaging + blueprint induction + luxury UX from v1 (longest pole removed) → Simplified to one parametrized reconstruct path over workouts + history → Accelerated with deterministic golden fixtures → Automated last (no new flags/automation).
- **IDIOT-INDEX RESULT:** parametrize the existing clients-only reconstruct/roster path; no per-family engines, no generic messaging entity, no new flags.
- **EXTREME TEST:** IMPORTER-H must genuinely reconstruct workouts + history with per-family `staged=reconstructed+skipped+failed` accounting (a clients-clone shortcut fails R109); poison-row isolation and idempotent replay per family.
- **HYPERSCALER LENS:** thinnest vertical slice behind flags, validated on deterministic fixtures before real data; real-account validation as a staging canary (V5) — AWS/GCP progressive-delivery/blast-radius containment.
- **GOOD WITHOUT BAD:** faster real-family proof (GOOD) without over-claiming (messaging recorded as deferred, not done; real-account validation deferred to V5; `truth_boundaries.no_e2e_proof_yet` holds), gated by default-off flags + honest accounting + R14 audit per V-PR + git-native R3 land.
- **EVIDENCE REQUIRED (downstream):** byte-pinned golden fixtures for workouts + client history; acceptance tests extending IMPORTER-F 1–8 per family; R74 ratio ≥2, R75 banned-cast +0, R23/R76 LOC (R86 hatch if cohesive), byte-pinned OpenAPI drift, dual-lens R14 CLEAN at exact head, R124 both-ways.
- **ROLLBACK / STOP:** docs/state only — revert the Op 63 commit. Downstream hard stops unchanged: never mint a credential before verified ownership; never use email as a canonical/linking key; billing never captured/staged/reconstructed.
- **NEXT ACTION:** ✅ **IMPORTER-H DISPATCHED + LANDED (Op 64)** as backend main `f9b81cf` (PR #512) — first V-PR, R3-CLEAN via the git-native path, dual CLEAN, R76 [LOC-EXEMPT]/R74 2.12/R75 net zero (see §5.2c + DECISION_LOG Op-64). **Next active leg = IMPORTER-I** (backend mobile-readable per-family review/progress read contract; OpenAPI bump + R80 byte-pinned drift), then PR-M4, then V5 — dispatch after its PR body carries the R138 evidence reference and its R14 cycle is CLEAN. **IMPORTER-I NOT dispatched this Op.**

---

## 10. 60-second operator recovery

1. Read context `AGENT_RULES.md`, canonical JSON (`handoffs/importer-wave/current-state.json`), then this durable handoff.
2. Verify the four live main SHAs with GitHub before any mutation (context — see `repos.context` in the canonical JSON, advanced by the Op 62 PR-M3-LANDED reconcile commit; mobile `e3a824f…` post PR-M3 PR #287 — **NOT R3-clean** (operator-authorized one-time bypass, R3-INC-3; parent/base `b8165be…`; grandfathered, do NOT rewrite/force-push, do NOT claim R3-clean); backend `77bb4a0…` post IMPORTER-G PR #511 — **R3-CLEAN** (parent `1e6b3bf…` IMPORTER-F PR #510, itself R3-CLEAN; grandparent `1718293…` D1 PR #509 remains NOT R3-clean per R3-INC-2, grandfathered), extension `4f11683…` post PR-C1c #7).
3. Ensure production flags remain off.
4. Check the active PR head exactly matches its audited SHA and CI (R124 both-ways).
5. If drift or any P0-P3 exists, stop integration and resume the same fixer lane.
6. For importer runtime uncertainty, fail closed, preserve evidence, do not infer completion.
7. Rollback: mobile `e3a824f` (PR-M3 PR #287) → forward-only `git revert e3a824f` via a normal reviewed PR (parent `b8165be`; NEVER history-rewrite/force-push shared main to "fix" the R3-INC-3 identity — grandfathered); backend `77bb4a0` (IMPORTER-G PR #511) → forward-only `git revert 77bb4a0` via a normal reviewed PR (no history rewrite/force-push over shared main); prior backend tip `1e6b3bf` (IMPORTER-F PR #510) → parent `1718293`; prior mobile tip `b8165be` → parent `1695517`; backend `1718293` (D1 PR #509) → parent `95e2c63`; prior backend tip `95e2c63` (PR #508) → parent `e6c3082`; extension `4f11683` → parent `a8a6af6b` (PR-C1c #7 rollback); prior extension tip `a8a6af6b` → parent `5eabeec` (all recorded in canonical JSON).
8. Update canonical JSON immediately after every merge or stop-condition change.
