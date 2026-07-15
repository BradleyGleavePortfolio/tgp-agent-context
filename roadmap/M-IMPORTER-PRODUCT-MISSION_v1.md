# M-IMPORTER PRODUCT MISSION & ARCHITECTURE v1 — CANONICAL

**Status:** ACTIVE — canonical product-mission record for the importer wave. This document is the *mission* source of truth. `roadmap/M-IMPORTER-EXTENSION_v1.md` is now the *build-plan/roadmap* for the first vertical slice and is subordinate to this doc on any mission-framing question.
**Owner:** Bradley Gleave (R0/R3).
**Filed:** 2026-07-15 (Op 54 — product-mission correction under R5).
**Doc kind:** Pure coordination/product-vision documentation (audit-exempt per R14 scope; documentation-only context-repo commit).
**Read order:** `AGENT_RULES.md` → this file → `roadmap/M-IMPORTER-EXTENSION_v1.md` → `handoffs/importer-wave/current-state.json` → `handoffs/importer-wave/AGENT_HANDOFF_V03_2026-07-14.md`.

---

## 0. OPERATOR MISSION CORRECTION — VERBATIM (do not paraphrase)

**Canonical product-mission correction (operator, verbatim, 2026-07-15 — preserved per R5):**

> "WRONG - your building a site agnsotics, ultra easy to use, browser agnostic tool that can seamlessly and autonymously pull ALL data from any comeptitors site - send to TGP Database, and be reconstructed to our set values instantly with a luxury UI while doing so!"

This quote is the top of the durable record. Every importer doc, brief, and decision is subordinate to it. It is preserved byte-for-byte including the operator's original spelling; **do not "correct" or paraphrase the quote** (R5 — verbatim capture of operator intent).

**What the operator corrected.** Prior canonical wording (chiefly `roadmap/M-IMPORTER-EXTENSION_v1.md` as originally written) mistook **TrueCoach v0.3** — a single proving adapter — for the **overall product**. It also implied a Chrome-only extension and a per-competitor mapped-extractor treadmill. That framing is now explicitly **WRONG**. TrueCoach is the *first proving adapter / vertical slice only*.

---

## 1. THE MISSION (approved product goal)

A **site-agnostic, browser-agnostic** acquisition tool that, with the user's own authorization, **autonomously learns any competitor site**, pulls **all user-authorized accessible data**, sends it to the **TGP database**, and **reconstructs it instantly into TGP's defined entities/values** behind an **ultra-easy, restrained-luxury UI**.

Decomposed into its non-negotiable capabilities:

1. **Site-agnostic acquisition** — works against *any* competitor site, not a fixed list. No per-brand executable code is required to add a site.
2. **Browser-agnostic** — not tied to Chrome/MV3. The engine is a portable kernel; the browser host is a thin, swappable adapter (Chrome/Edge/Firefox/Safari, and a headless/driver host where a real browser is not present).
3. **Autonomous learning / blueprint induction** — the tool *observes* a site as the authorized user navigates it and *induces* a declarative `PlatformBlueprint` (endpoints, entity shapes, pagination, auth surface) rather than requiring a hand-written adapter per site.
4. **Extract ALL user-authorized accessible data** — completeness is the goal, not a curated subset. "ALL" means everything the authenticated user could themselves reach.
5. **Completeness / accounting** — every entity the tool *could* see is either imported or explicitly accounted for as skipped/failed/out-of-reach, with a reason. Omissions are never silent.
6. **Normalization into one canonical TGP import envelope** — a single locked envelope contract (`extractors/_interface.js`: `{ sourceId, sourcePlatform, capturedAt, payload }`, camelCase) is the source of truth (R80); backend DTOs match it.
7. **Deterministic reconstruction** — the envelope is mapped into TGP's defined entities/values ("reconstructed to our set values") deterministically: same input → same TGP rows, every time.
8. **Idempotent replay** — re-running an import produces no duplicates and no drift (idempotent by `intent_id` + entity identity).
9. **Honest progress / partial / failure reporting** — live progress, honest `complete | partial | failed | cancelled` terminals, and an explicit accounting of what did and did not come across. Never claim data was imported that was not.
10. **Ultra-easy, restrained-luxury UI** — one-sitting onboarding; a calm, Quiet-Luxury surface (R1 / R87); no feature-dump, no permission-front, no empty-confirmation anti-patterns.

**Product thesis (why site-agnostic and autonomous).** Competitors are numerous and change constantly. A per-platform hard-mapped scraper is a maintenance treadmill and a moat we do **not** want to own. A pure, declarative, bounded replay kernel driven by an *induced* data-only blueprint lets any site be supported with a small data adapter — ideally an *auto-learned* one — and **zero executable per-brand code**.

---

## 2. LEGAL / SECURITY INVARIANTS (hard constraints — R136)

These are hard constraints (TOS / regulation / security), not self-imposed policy. They bind every workstream and every PR. A violation is a P0 release blocker.

- **No credential storage on TGP servers.** TGP never stores or transmits the user's source-platform password or long-lived credential. No KMS/pgcrypto/DEK path exists for source creds because none are ever at rest.
- **User-authorized access only.** Every acquisition runs inside the *user's own authenticated session*, initiated by an explicit human action (a click). The user's click is the audit anchor — the same legal footing as them viewing/copy-pasting the data themselves.
- **No bypass of source access controls.** The tool reads only what the authenticated user can already reach. It never defeats auth, MFA, rate-limits-as-security, paywalls, or authorization boundaries. Safe methods only (GET/HEAD) on the source. It rides the session; it never breaks it.
- **Fail closed on ambiguous mappings.** If a captured field cannot be mapped to a TGP entity/value with confidence, the tool does **not** guess — it records the item as unmapped/needs-review and surfaces it, rather than writing a wrong value. `unknown_platform` and unresolved blueprints fail closed.
- **Never claim inaccessible data was imported.** Reporting is honest by construction: if the tool could not reach or could not map something, the accounting says so. No fabricated progress, no invented `complete`, no phantom entities.
- **Source bearer hygiene.** Where a session bearer is read on-demand from the user's own browser storage, it lives in memory for a single run only and never touches the DOM, telemetry, local storage, logs, the PR body, or the backend payload.
- **SSRF confinement.** Every fetch is constrained to an `allowedOrigins` capability derived from the observed authorized tab origin, normalized before any request.

---

## 3. THE FIVE DISTINCTIONS (mission vs. proof vs. state vs. v0.3 vs. v1.0)

This section exists precisely to stop the TrueCoach-is-the-product / Chrome-is-the-product conflation from recurring.

### 3.1 MISSION (the north star — §1)
Site-agnostic, browser-agnostic, autonomously-learning acquisition + deterministic TGP reconstruction + luxury UI. This never "ships" as a single PR; it is the acceptance frame for the whole wave and beyond.

### 3.2 FIRST PROOF (the vertical slice — what TrueCoach actually is)
**TrueCoach on a Chrome MV3 host is the FIRST end-to-end proving adapter** — one concrete site + one concrete browser host chosen to prove the whole pipeline (capture → envelope → bounded autonomous replay → ingest → reconstruction → honest reporting) end-to-end against a real target. It is a *vertical slice*, not the product boundary. Choosing it first constrains **nothing** about the mission: the engine that runs it is already the site-agnostic, host-injected kernel.

### 3.3 CURRENT STATE (live implementation truth, as of 2026-07-14 checkpoint — do not overwrite)
Authoritative live detail lives in `handoffs/importer-wave/current-state.json` and `handoffs/importer-wave/AGENT_HANDOFF_V03_2026-07-14.md`. Summary (preserved, not restated as mission):
- **Backend:** scout ingest/progress/complete (#500/#501), extension pair endpoints (#502), dark-route flag middleware (#503), importer OpenAPI contract freeze (#504) all merged; `main` `e6c3082`.
- **Extension (`tgp-importer-extension`):** capture ring buffer (#1), pairing DESIGN (#2), pairing auth (#3), contract (#4), **bounded site-agnostic replay engine (#5)** merged (`5eabeec`; R3-INC-1 open/accepted/grandfathered). **PR #6 (EXT-C1b)** — runtime wiring of the engine + Start Import CTA — OPEN, fixer-r1 complete @`55f24d5`, dual-lens r2 CLEAN/CLEAN, CI-green, MERGE-READY, identity-safe integration in progress.
- **Mobile (`growth-project-mobile`):** default-off Import Data entry (#284/M1) merged `1695517`; **PR #285 (M2)** live pairing — OPEN, fixer-r1 complete @`10414c4`, dual-lens r2 in progress.
- The **three-layer architecture already exists and is site-agnostic**: Layer 1 passive capture (redacts auth by design), Layer 2 locked envelope contract, Layer 3 bounded pure `runReplay` kernel (injected IO, no `chrome.*`, fully testable, fail-closed).

### 3.4 v0.3 COMPLETION (the current launch bar — "v0.3 or no launch")
v0.3 is done when the **full autonomous multi-page import loop works end-to-end for the first proof (TrueCoach on the Chrome host), default-flagged, honestly reported**:
- EXT-C1b PR #6 merged (engine wired into runtime; real ephemeral trusted-tab source-bearer handoff; single-flight; fail-closed).
- Mobile M2 PR #285 merged (live pairing, honest `paired` terminal).
- Extension packaged and shipped with the app download path.
- Staging flags flipped (`FEATURE_EXTENSION_PAIRING`, `FEATURE_SCOUT_INGEST`); full-loop E2E smoke + operator dogfood pass.
- R137 postmortem written (must capture R3-INC-1); watchdog cron self-deletes.
- **v0.3 explicitly does NOT require:** a second site, a second browser host, or autonomous blueprint induction. Those are v1.0 mission scope. v0.3 proves the pipeline; it does not complete the mission.

### 3.5 v1.0 ACCEPTANCE CRITERIA (the mission, made testable)
v1.0 is accepted when the product demonstrably satisfies the mission, not just the first proof:
1. **≥3 distinct competitor sites** import end-to-end, at least one added **without any new executable per-brand code** (data-only blueprint, ideally auto-induced).
2. **≥2 browser hosts** run the same engine kernel unchanged (e.g. Chromium-family + one of Firefox/Safari/headless-driver), proving browser-agnosticism via the host-adapter seam.
3. **Autonomous learning:** the tool induces a working `PlatformBlueprint` for a previously-unseen site from an authorized user's observed navigation, with human confirmation, and no hand-written extractor.
4. **Completeness accounting:** every import produces a reconciliation report — imported vs. skipped vs. failed vs. out-of-reach, each with a reason; zero silent omissions.
5. **Deterministic reconstruction + idempotent replay:** same source state → identical TGP entities; re-running an import creates zero duplicates and zero drift (verified by a replay test).
6. **Honest reporting:** progress/partial/failure UI never overstates; a forced partial (e.g. injected 5xx / auth-loss) renders as `partial`/`failed` with an accurate account, never `complete`.
7. **Luxury UI bar:** the entire flow passes an Apple/Notion/Google design crit (R1) with the seven canonical anti-patterns all absent; onboarding completes in one sitting.
8. **Legal/security invariants (§2) all hold** under adversarial audit, on every supported host and site.

---

## 4. FULL STANDARD DECISION RECORD (R138 four-question gate + decision-record shape)

**Governed decision:** how to reconcile the canonical docs and structure the wave so that v0.3 work is preserved as the first end-to-end proof **without** constraining the product to TrueCoach or Chrome.

### 4.1 R138 four-question gate

1. **Musk's 5 principles (in order).**
   - *Question every requirement:* "Must the product be TrueCoach + a 6-platform Chrome extractor set?" — **No.** That requirement was never the operator's; it was drift in one doc. The operator's actual requirement (owner: Bradley, 2026-07-15) is site-agnostic + browser-agnostic + autonomous.
   - *Delete the part:* delete the per-competitor mapped-extractor treadmill and the Chrome-only assumption from the *mission*. Delete the "6 named extractors" as a *product definition* (they survive only as optional specialization / test fixtures).
   - *Simplify what survives:* one induced, data-only blueprint + one pure replay kernel + one host-adapter seam + one canonical envelope + one deterministic reconstruction step.
   - *Accelerate cycle time:* keep the already-audited v0.3 slice (PR #6 / #285) moving to merge in parallel with mission-framing docs; do not block shipping the proof on building the whole mission.
   - *Automate last:* autonomous blueprint induction is the automation layer — sequenced *after* the manual-blueprint proof is green (v0.3), per "automate last."
2. **What would hyperscalers do?** Treat each site/browser as a *driver/adapter* behind a stable core — the pattern behind WebDriver/Selenium (one protocol, many browser drivers), Plaid (one Link core, many institution integrations, moving from hand-mapped to permissioned), and OpenTelemetry (one API, many exporters). Ship behind flags with canary/one-box rollout and rollback (AWS Builders' Library); idempotency keys for retry-safe ingest (Stripe). None hard-code one vendor as the product.
3. **How do I get the GOOD without the BAD?** GOOD: ship the proven v0.3 slice now (velocity, operator dogfood). BAD risked: freezing the mission to that slice. Structure that keeps GOOD while gating BAD: **separate the mission doc (this file) from the build-plan doc**, mark the build-plan as "first vertical slice," and add a browser-portability + autonomous-learning workstream to the PR graph so the mission is visibly in-flight while the slice ships. Flags stay default-off until v0.3 green.
4. **Am I attacking the root cause?** Yes. Root cause = one canonical doc *defined* the mission as TrueCoach-only, and downstream docs inherited the framing. Fix = correct the mission at the source (verbatim quote + this canonical doc), demote the build-plan to a slice, and reconcile the state/handoff wording. Not a symptom patch.

### 4.2 Decision-record shape (per `current-state.json.operating_constitution.decision_record`)

- **DECISION:** Split mission from build-plan. Create this canonical mission doc (verbatim quote at top); keep `M-IMPORTER-EXTENSION_v1.md` as the first-vertical-slice build-plan, subordinate on mission framing; reconcile state + handoff wording; add a mission-covering PR graph. **Documentation only — no product code changed.**
- **REAL GOAL:** A durable record that reads the mission correctly forever, so no future agent re-mistakes the first proof for the product, while the shipped v0.3 work is preserved intact as that first proof.
- **ROOT CAUSE:** Mission drift localized in one doc, inherited downstream. Addressed at the source.
- **FIVE-STEP:** questioned the TrueCoach/Chrome requirement → deleted it from the mission → simplified to kernel+blueprint+host-adapter+envelope+reconstruction → accelerated by shipping the audited slice in parallel → automation (auto-induction) sequenced last.
- **IDIOT-INDEX:** one new doc + surgical edits to four existing docs; zero new services, zero product-code churn.
- **EXTREME (delete-hard test):** if we deleted every per-platform extractor tomorrow, the engine + induced blueprint + host adapter would still import a site. That confirms the extractors are specialization, not the product.
- **HYPERSCALER:** driver/adapter-behind-a-stable-core (WebDriver, Plaid Link, OpenTelemetry); flags + canary + rollback; idempotency keys.
- **GOOD-WITHOUT-BAD:** ship the proof now (velocity) without freezing the mission to it (correctness), via the mission/build-plan split + portability & learning workstreams.
- **EVIDENCE:** `current-state.json` and `AGENT_HANDOFF_V03` already assert SITE-AGNOSTIC; the stale framing was concentrated in `M-IMPORTER-EXTENSION_v1.md` §0/§2/§5–§7. Engine (#5) is already `chrome.*`-free and host-injected — the mission architecture is already partly built.
- **ROLLBACK:** documentation-only; revert this commit to restore prior wording. No runtime/flag/data impact.
- **NEXT:** §6 revised critical path.

---

## 5. ARCHITECTURE OPTIONS CONSIDERED (≥3) + SELECTION

The governing question: **which architecture preserves the existing v0.3 work as the first end-to-end proof without constraining the product to TrueCoach or Chrome?**

### Option A — Keep the current build-plan as-is; expand later
Ship v0.3 on the existing TrueCoach/Chrome-flavored plan; defer site/browser generality to a future rewrite.
- **Pros:** zero doc churn now; fastest to v0.3.
- **Cons:** leaves the mission-defining wording WRONG in the canonical record (violates the operator correction and R5); invites the same conflation to recur; a "future rewrite" is exactly the treadmill Musk-delete warns against. **Rejected** — fails the operator correction at the doctrine layer.

### Option B — Rip out TrueCoach/Chrome now; build the general engine + auto-induction before shipping anything
Block v0.3 until the site-agnostic, browser-agnostic, auto-learning engine is fully general.
- **Pros:** purest mission alignment.
- **Cons:** discards the already-audited, CLEAN/CLEAN, merge-ready v0.3 slice (PR #6 / #285) as "the proof"; massive LOC and cycle-time cost; violates R4 (never lose operator work) and "accelerate/automate last." Big-bang with no proof point. **Rejected** — trades a green proof for speculative breadth.

### Option C — SELECTED — Mission/build-plan split with a portability + learning seam; slice ships as the first proof
Correct the *mission* at the source (this doc + verbatim quote), **demote** `M-IMPORTER-EXTENSION_v1.md` to the *first vertical slice* build-plan (subordinate on framing), and keep the already-site-agnostic engine as the kernel. Add two explicit mission workstreams — **browser portability (host-adapter seam)** and **autonomous learning (blueprint induction)** — to the PR graph, sequenced *after* the slice proves the pipeline (automate last). The v0.3 slice (TrueCoach on Chrome) ships unchanged as the first end-to-end proof.
- **Pros:** preserves 100% of the audited v0.3 work as the proof; corrects the mission durably; nothing in the code constrains the product (engine is already `chrome.*`-free and host-injected); matches hyperscaler driver/adapter-behind-a-core; documentation-only, fully reversible; honors "accelerate then automate last."
- **Cons:** requires disciplined doc hygiene so the slice/mission distinction stays legible (mitigated by §3's five explicit distinctions).
- **Why selected:** it is the only option that satisfies *both* halves of the operator's constraint — preserve the v0.3 proof **and** refuse to constrain the product to TrueCoach/Chrome — at minimum blast radius (no product code) and maximum reversibility.

---

## 6. PRIORITIZED PR GRAPH (maximize safe parallelism; non-overlapping ownership)

Six workstreams, each with a distinct owner and non-overlapping OWNS scope (R18). Parallelism is safe where OWNS sets do not intersect; a `→` denotes a hard sequencing dependency (merge-order matters, R4 clause 1). **This is a documentation plan; no product code is written by this commit.**

| WS | Workstream | OWNS (repo · paths) | Depends on | Parallel-safe with |
|----|-----------|----------------------|-----------|--------------------|
| **WS1** | **Extension core / runtime** | `tgp-importer-extension`: `background.js`, `popup/*`, `shared/replay/*`, `content/main.js` | — | WS5, WS6 (different repos) |
| **WS2** | **Browser portability** | `tgp-importer-extension`: NEW `host/` adapter layer (`host/chrome.js`, `host/firefox.js`, `host/driver.js`), `manifest.*` per host; must not edit `shared/replay/engine.js` internals | WS1 seam | WS3, WS4 (disjoint paths) |
| **WS3** | **Autonomous learning / blueprint induction** | `tgp-importer-extension`: NEW `shared/induction/*` + `extractors/_blueprint_schema.*`; consumes capture, emits data-only blueprints | WS1 (envelope + capture stable) | WS2, WS4 |
| **WS4** | **Canonical mapping / reconstruction** | `growth-project-backend`: `api/scout/reconstruct*`, entity mappers, idempotent upsert + reconciliation report; envelope→TGP-entity deterministic map | WS6 contract | WS2, WS3 |
| **WS5** | **Backend orchestration / progress** | `growth-project-backend`: `api/scout/ingest`, `/progress`, `/complete`, `event_log`, pair endpoints | — (mostly merged) | WS1, WS6 |
| **WS6** | **Luxury UI (mobile + extension surfaces)** | `growth-project-mobile`: import/pairing/progress/review screens; `tgp-importer-extension`: `popup/*.html`/CSS only (no `background.js` logic) | WS5 endpoints | WS1 (popup logic vs. popup style split by file) |

**Ownership de-collision notes (R18 / R4 clause 1):**
- WS1 owns `popup/*.js` *logic*; WS6 owns `popup/*.html` + CSS *presentation*. Split by file type to keep them parallel-safe; if a change needs both, serialize under WS1.
- WS2 must treat `shared/replay/engine.js` as read-only (inject a host via the existing IO seam), so it never collides with WS1's kernel edits.
- WS4 and WS5 both touch `growth-project-backend`; they own **disjoint path prefixes** (`reconstruct*` vs. `ingest`/`progress`/`complete`). Serialize only if a shared migration file is introduced.

**Priority / sequencing (critical path first):**

```
P0 (ship the first proof — v0.3):
  EXT-C1b PR #6 (WS1)  ── merge ──►  Mobile M2 PR #285 (WS6)  ── merge ──►  packaging (WS6) ──► staging E2E smoke
        [dual-lens r2 CLEAN/CLEAN, CI-green]        [dual-lens r2 in progress]

P1 (make the mission testable — post-v0.3, parallel where OWNS disjoint):
  WS4 reconstruction+reconciliation  ┐
  WS2 host-adapter (2nd browser)     ├─ parallel (disjoint OWNS)
  WS5 progress route for mobile      ┘   (unblocks honest mobile progress terminal)

P2 (automate last — after manual-blueprint proof green):
  WS3 autonomous blueprint induction (adds a 2nd site with zero executable per-brand code)

P3 (mission acceptance):
  v1.0 criteria §3.5 verified across ≥3 sites / ≥2 hosts under adversarial dual-lens audit.
```

Every code PR in this graph is subject to the full R14 dual-lens audit cycle, R76 LOC cap, R74 ratio floor, R3 identity, and identity-safe manual squash (`merge_procedure_change_2026_07_14`). This doc authorizes none of them to skip the gate.

---

## 7. REVISED CRITICAL PATH (one line)

**Merge EXT-C1b PR #6 (identity-safe squash) → dual-lens r2 + merge Mobile M2 PR #285 → package extension with the app → staging flags + full-loop E2E smoke + operator dogfood → R137 postmortem (capture R3-INC-1) → [mission P1] backend reconstruction/reconciliation + 2nd browser host-adapter + mobile progress route in parallel → [mission P2] autonomous blueprint induction adds a 2nd site with zero per-brand code → [mission P3] verify v1.0 acceptance (§3.5) across ≥3 sites / ≥2 hosts under adversarial audit.**

v0.3 remains the immediate launch bar ("v0.3 or no launch"); the mission (v1.0) is the acceptance frame that the PR graph in §6 drives toward without ever re-freezing the product to the first proof.

---

**R0/R3 footer:** All commits authored AND committed by `Bradley Gleave <bradley@bradleytgpcoaching.com>`. Zero AI/Claude/agent/Co-authored-by tokens. Ever.
