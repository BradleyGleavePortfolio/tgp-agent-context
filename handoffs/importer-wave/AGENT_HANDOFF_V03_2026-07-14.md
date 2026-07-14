# AGENT HANDOFF — Importer Wave v0.3 (2026-07-14)

> **Audience.** The next autonomous CEO/CPO/CTO agent for Bradley Gleave's TGP project.
> **Purpose.** A durable, self-contained pickup document. If you read only this file plus `AGENT_RULES.md` and `handoffs/importer-wave/current-state.json`, you can continue the wave without asking the operator anything.
> **Doc kind.** Pure coordination/context documentation (audit-exempt per R14 scope).
> **Author identity.** Bradley Gleave &lt;bradley@bradleytgpcoaching.com&gt; (R3).
> **Repos referenced.** GitHub org `BradleyGleavePortfolio`. Web URL form used throughout: `https://github.com/BradleyGleavePortfolio/<repo>/blob/main/<path>`.

---

## 0. READ THIS FIRST — the one non-negotiable order

1. Read `AGENT_RULES.md` (the single canonical constitution — there is no other rules file). SACRED rules tied at the top: **R1** (decacorn quality), **R3** (operator identity on every commit), **R14** (no merge without a CLEAN dual-lens audit cycle). **R138** grants you full CEO/CPO/CTO autonomy *after* you run and record the four-question decision gate — it never waives R1/R3/R14.
2. Read `handoffs/importer-wave/current-state.json` (the machine snapshot; schema v1.1). This handoff is the human-readable narrative of that same checkpoint.
3. Run the **R8 zombie sweep** and **R7 subagent-liveness probe** before touching anything (details in §6 and §8).

**Three things that will bite you if you skip them:**
- **R3-INC-1 is OPEN and accepted.** Extension `main` tip `5eabeec` carries a GitHub-synthesized identity (author `BradleyGleavePortfolio`, committer `GitHub <noreply@github.com>`), NOT Bradley Gleave. It is grandfathered — **do NOT rewrite published history to fix it.** Never force-push a rewrite of shared `main`. See §9 and §11.
- **All future TGP merges use identity-safe manual squash**, never GitHub-generated squash. Mechanism in §9.
- **The product is SITE-AGNOSTIC.** Do not plan per-competitor mapped tooling as the core path. And do not conflate this with `roadmap/specs/A02-import-tooling.md` (Trainerize-CSV lane — a different initiative).

---

## 1. EXECUTIVE STATE (where the wave is, in one screen)

**Wave:** importer-wave — v0.3 site-agnostic autonomous client-data import. **Launch bar: v0.3 or no launch** (full autonomous multi-page crawl loop; no half-launch of a TrueCoach-only stub).

**Critical path is one PR from a major milestone.** Extension **PR #6 (EXT-C1b)** wires the merged bounded replay engine (#5) into the product runtime. It is the last piece that turns the shipped engine + capture + pairing foundation into a working end-to-end import. It is **OPEN, builder-complete, fixer-r1-complete, and NOT-yet-merge-ready (dual-lens r2 pending).** Dual-lens r1 (builder head `ab5dc61`) returned **FAIL/FAIL, convergent** on one blocking P2 (the Start Import CTA did not supply a source bearer) plus five P3s; **fixer r1 has now root-fixed all six findings at head `55f24d5`** (real ephemeral trusted-tab source-bearer handoff + the four other P3 fixes + adversarial tests) and awaits a fresh dual-lens r2 at that exact head.

**Second milestone now in flight.** Mobile **PR #285 (M2)** — live extension pairing (mint + poll), default-OFF — is **OPEN, builder-complete, dual-lens r1 in progress** at head `bd9a41a` (base mobile `main` `1695517`). It replaces the M1 `awaitingExtension` placeholder with a real pairing surface backed by the verified mobile-callable endpoints `POST /extension/pair/init` + `POST /extension/pair/status`; honest terminal is `paired` only (no fabricated progress, because no mobile-readable import-progress route exists yet).

**Status of each repo's `main` (as of this checkpoint):**

| Repo | main head | Note |
|---|---|---|
| `growth-project-backend` | `e6c3082` (`7b6a2438` short in older field) | #504 importer OpenAPI contract freeze merged 2026-07-14 |
| `tgp-importer-extension` | `5eabeec` | #5 replay engine; **R3-INC-1 open** (GitHub-synthesized identity, grandfathered) |
| `growth-project-mobile` | `1695517` | #284 (M1) default-off import entry merged; R3-conforming manual squash. M2 PR #285 open on top. |
| `tgp-agent-context` | `e3eea1c` (this repo, pre-this-commit) | coordination/state |

**Active build lanes right now (subagents):**
- `build_extension_c1b_runtime_mrkme1l6` — **EXT-C1b fixer r1: RECOVERED & PUSHED @`55f24d5`.** This subagent previously hit a step limit and returned an EMPTY response; per explicit operator direction it was resumed in the SAME sandbox/branch (no reset/reclone, no new branch, no duplicate lane) to inventory git state and push the legitimate fixer checkpoint. All six r1 findings are root-fixed with adversarial tests. Do NOT edit extension product source in parallel; coordinate, don't collide. Awaiting dual-lens r2.
- `build_mobile_m2_pairing_progress_mrknrpnb` — **Mobile M2 builder COMPLETE; PR #285 OPEN @`bd9a41a`, dual-lens r1 in progress.**

**Watchdog cron:** `bbd2c039` — hourly (foreground, conversation context), reads canonical doctrine each run, deletes itself when v0.3 E2E ship criteria are met.

**Dual-lens r1 verdict for PR #6 (builder head `ab5dc61`):** Lens A FAIL (P0=0 P1=0 P2=1 P3=2). Lens B FAIL (P0=0 P1=0 P2=1 P3=3 +1 advisory). **All mandatory security invariants independently re-verified and HOLD in both lenses (no P0/P1).** The blocker was functional completeness, not a security regression. **Fixer r1 @`55f24d5` resolved all six.** Full findings + resolution in §7.

**Bottom line for the next agent:** two PRs are live. (1) EXT-C1b PR #6 fixer r1 is pushed @`55f24d5` — re-dual-lens at that exact head; on CLEAN/CLEAN + CI green land via identity-safe manual squash. (2) Mobile M2 PR #285 dual-lens r1 is in progress @`bd9a41a` — carry it through its audit cycle to CLEAN/CLEAN, then manual-squash. Then packaging → staging E2E → postmortem. Do not restart either lane from scratch; probe first (R7).

---

## 2. END-TO-END PRODUCT (what we are building, plainly)

**One line:** a SITE-AGNOSTIC autonomous data bridge that lets a coach bring their entire client roster from a previous coaching platform into TGP by logging into that platform once and letting a browser extension crawl and capture the data for them.

**The full flow (canonical, from `current-state.json.product_model.flow`):**
1. Coach downloads TGP; the **browser extension ships with the app by default**.
2. After signup, coach taps **Import Data** (mobile M1, merged).
3. Coach selects their prior site/service (platform picker, or "custom").
4. TGP opens that site in the browser; **the coach logs in with their own session** (we never handle their source credentials server-side).
5. The TGP extension popup offers **"Start client Import?"** (the CTA in PR #6).
6. The extension **autonomously flips through many pages**, capturing JSON as it loads (the bounded replay engine, merged in #5).
7. Each entity is enveloped and posted to **`/api/scout/ingest`**; progress streams to mobile; a **`/complete`** call settles the import.

**Why site-agnostic (the product thesis):** competitors change often and are numerous. A per-platform hard-mapped scraper is a maintenance treadmill and a moat we don't want. Instead the engine is a **pure, declarative, bounded replay kernel** driven by a data-only `PlatformBlueprint`; any platform that persists a JWT-shaped bearer in its own web storage and exposes JSON endpoints can be supported with a small data adapter and **zero executable per-brand code**.

**What it is NOT (guard against scope drift):**
- Not a thin v0.1 TrueCoach-only stub. TrueCoach is the first *verification* adapter, not the product.
- Not per-site hard-mapped tooling as the core.
- Not server-side credential scraping — the coach's source session stays in the coach's browser; the source bearer is read on-demand, used in memory for one run, and never stored/logged/forwarded.
- Not the `A02-import-tooling.md` CSV lane (Trainerize CSV etc.) — that is a separate initiative; do not conflate.

**Feature flags (default OFF until v0.3 green):** `FEATURE_EXTENSION_PAIRING`, `FEATURE_SCOUT_INGEST`.

**Architecture in three layers (see `docs/AUTO_DISCOVERY.md` in the extension repo):**
- **Layer 1 — passive capture** (`shared/capture.js`): a debugger-based ring buffer that DELIBERATELY redacts `Authorization`/`Cookie` headers. It is intentionally NOT a token producer.
- **Layer 2 — the envelope contract** (`extractors/_interface.js`): the LOCKED entity envelope `{ sourceId, sourcePlatform, capturedAt, payload }` (camelCase). This is the source of truth (R80); backend DTOs must match it.
- **Layer 3 — bounded autonomous replay** (`shared/replay/engine.js`): the pure `runReplay(options)` kernel. Injected IO (fetch/emit/pace/clock), no `chrome.*` calls, fully testable. Enforced safety invariants: finite timeout + bounded retry, page/entity budgets, per-context visited-URL cycle-breaking, backpressure (emit awaited before next fetch), idempotent emits, fail-closed on 401/403 (`AuthLostError`), safe methods only (GET/HEAD), SSRF confinement via a REQUIRED `allowedOrigins` capability normalized before any fetch, prompt abort. Honest terminal status: `complete | partial | failed | cancelled`.

---

## 3. PRODUCT MENTALITY & DECISION FRAMEWORK (how to decide, not just what)

You are the autonomous **CEO + CPO + CTO** (R138 + Operator Constitution Addendum). You do NOT ask for approval on normal product/technical/sequencing/merge decisions. You research, decide, execute, verify, document, and continue. But every non-trivial or non-doc-merge decision MUST pass and record the **R138 four-question decision gate**:

1. **Musk's 5 principles (in order):** question every requirement (attach a name/date/reason); delete the part/process (if you don't add ≥10% back, you didn't delete enough); simplify/optimize only what survived; accelerate cycle time; automate last. Musk's warning: "the most common mistake of smart engineers is to optimize a thing that should not exist."
2. **What would hyperscalers do?** Cite at least one concrete practice. For change/merge decisions: canary/one-box rollout, automated rollback on alarm, blast-radius containment, pipeline safety gates instead of per-change human approval (AWS/GCP). For money/retry: Stripe idempotency keys + integer minor units.
3. **How do I get the GOOD without the BAD?** Name the GOOD unlocked and the BAD risked; find the structure (flag + canary + rollback + audit) that keeps the GOOD while gating out the BAD. If you can't separate them, escalate — don't trade quality for speed (R2).
4. **Am I attacking the root cause?** Not a symptom. If it's a workaround, say so and file the root-cause follow-up.

**Record the gate** in the PR body under an `R138 Decision Gate` heading, and for doctrine/architecture decisions add a `DECISION_LOG.md` entry. The record IS the delegated-approval artifact; a governed merge/pivot without it is a P1 finding.

**Standing quality bar (R1):** every decision must survive an Apple / Notion / Google design crit. R1 is a correctness mandate, never a "ship fast" excuse (R2). The seven canonical anti-patterns (permission-front onboarding; feature-dump first screen; unescapable streaks; empty confirmation; inconsistency tax; gamification mismatch; polish-as-afterthought) are P0 release blockers.

**Never-lose posture (R4/R5/R6):** push every ≤2 minutes and at named checkpoints; foreground pushes only (the background auto-push daemon is DEPRECATED — never reintroduce it). The moment the operator states a new rule/idea/landmine, upload it to GitHub in the same turn. Assume the sandbox dies within 24h.

**Decision record shape (from `current-state.json.operating_constitution.decision_record`):** DECISION / REAL GOAL / ROOT CAUSE / FIVE-STEP / IDIOT-INDEX / EXTREME / HYPERSCALER / GOOD-WITHOUT-BAD / EVIDENCE / ROLLBACK / NEXT.

---

## 4. CANONICAL BUILD PLANS & DOCTRINE (exact paths + URLs)

**Doctrine (this `tgp-agent-context` repo):**
- `AGENT_RULES.md` — the single canonical constitution (R1–R138 + Operator Constitution Addendum 2026-07-13). URL: `https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/AGENT_RULES.md`
- `DECISION_LOG.md` — doctrine/architecture decision record (R138 requires an entry for doctrine/architecture decisions). URL: `.../blob/main/DECISION_LOG.md`
- `roadmap/DOCTRINE_INVARIANTS.md` — invariants digest.
- `roadmap/rulings/R3-CLARIFY-1_2026-07-06.md` — R3 forbidden-token scan is word-boundary-anchored.
- `roadmap/rulings/R80-CLARIFY-1_2026-07-07.md` — envelope-source-of-truth clarification.

**Build plans / product docs (this `tgp-agent-context` repo):**
- `roadmap/M-IMPORTER-EXTENSION_v1.md` — the importer extension roadmap/build plan. URL: `.../blob/main/roadmap/M-IMPORTER-EXTENSION_v1.md`
- `handoffs/importer-wave/HANDOFF_WAVE2.md` — prior wave-2 handoff (foundation phase).
- `handoffs/importer-wave/product-ideas-importer-wave.md` — product idea ledger for this wave.
- `handoffs/importer-wave/current-state.json` — the live machine snapshot (READ THIS).
- `roadmap/specs/A02-import-tooling.md` — **DIFFERENT lane** (Trainerize CSV etc.); do NOT conflate with the extension capture bridge.
- `planning/M-NEW-LIVE-scout-proposal.md` — scout ingest proposal context.

**Product-repo design docs (`tgp-importer-extension/docs/`):**
- `docs/AUTO_DISCOVERY.md` — the 3-layer autonomous discovery/replay architecture (engine cites §2 Layer 3). URL: `https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/main/docs/AUTO_DISCOVERY.md`
- `docs/DECISION_V03_AUTONOMOUS_CRAWL.md` — the v0.3 autonomous-crawl decision.
- `docs/CAPTURE_MODEL.md` — Layer-1 capture model (redacts auth by design).
- `docs/DESIGN.md` — overall design. **STALE WARNING:** its backend-deps section claims ingest/progress/complete are not built; they ARE merged (backend #500/#501). Trust `current-state.json` over `DESIGN.md` on backend readiness.
- `docs/first-principles.md`, `docs/ROADMAP.md` — first-principles rationale and product roadmap.

**Audit reports for the live PR (this repo, `handoffs/audit-reports/`):**
- `handoffs/audit-reports/EXT-PR6-LENS-A-LIVE.ab5dc61.md`
- `handoffs/audit-reports/EXT-PR6-LENS-B-LIVE.ab5dc61.md`

---

## 5. ITEMIZED PRODUCT LEDGER (what exists, merged and open)

**Backend (`growth-project-backend`), merged since Op 52:**
- #500 scout progress+complete (2026-07-09)
- #501 scout ingest (2026-07-09)
- #502 extension pair endpoints (2026-07-09)
- #503 R-DARK-1 feature-flag middleware — dark-route fix Option A (2026-07-08); resolves the dark-route guard-ordering ruling
- #505 governance hardening (2026-07-11); #506 prettier dangerfile; #507 SC2086 fly
- #504 importer OpenAPI contract freeze (2026-07-14) `e6c3082`, dual-lens CLEAN @`c20651bb`

**Extension (`tgp-importer-extension`):**
- #1 capture ring buffer + sourcePlatform inference [IMPORTER-C1] (merged 2026-07-08)
- #2 DESIGN v0.3 mobile-app-initiated pairing (merged 2026-07-08)
- #3 pairing auth — merge commit `a856385`, merged 2026-07-14, dual-lens CLEAN/CLEAN + CI green, exact head `895c3ae`
- #4 contract — merge commit `a6e248a`, merged 2026-07-14, dual-lens CLEAN/CLEAN, exact head `b02298a` + CI green
- #5 **bounded site-agnostic replay engine** — merge commit `5eabeec`, merged 2026-07-14, dual-lens r3 CLEAN/CLEAN @`5d46a1b`. **R3-INC-1 OPEN** (GitHub-synthesized identity; grandfathered).
- **#6 EXT-C1b runtime wiring — OPEN, builder-complete, fixer-r1-complete @`55f24d5`, dual-lens r2 pending** (the live critical-path PR). Branch `feat/replay-c1b-wiring`, current head `55f24d5` (prior builder/audit head `ab5dc61`), base `5eabeec`. Fixer r1 root-fixed the convergent CTA source-bearer P2 + five P3s with adversarial tests; gates @`55f24d5` prod 398/400, ratio 2.781, 489 tests, banned clean, R3 clean. Recovered in the SAME sandbox after the fixer subagent hit a step limit with an empty response. URL: `https://github.com/BradleyGleavePortfolio/tgp-importer-extension/pull/6`

**Mobile (`growth-project-mobile`):**
- #284 (M1) default-off post-signup Import Data entry + platform/custom picker + safe browser open + honest awaiting-extension state — merged `1695517` (2026-07-14), R3-conforming identity-safe manual squash, tree `ae76a8d` byte-identical to audited head `306f3a0`. PR CLOSED (not via merge API) with explanatory comment; head branch preserved. **First use of the new merge procedure.**
- **#285 (M2) live extension pairing (mint+poll), default-OFF — OPEN, builder-complete, dual-lens r1 in progress.** Branch `feat/mobile-import-live-pairing`, head `bd9a41a`, base `main` `1695517`. Replaces the M1 `awaitingExtension` placeholder with a real pairing surface: auto-mints a code (`POST /api/extension/pair/init`), shows a server-authoritative countdown, and polls (`POST /api/extension/pair/status`) to `paired`/`expired`. Resilient bounded polling (backoff 2s→15s ×1.5, ≤5 consecutive transient errors → retryable `failed`), AppState pause/resume, single-flight mint with cancel-mid-mint abort, full timer teardown, fails closed (unknown/garbled/malformed never → `paired`; 401/403→`authExpired`; 404→`unavailable`). New files: `src/api/extensionPairApi.ts`, `src/hooks/useExtensionPairing.ts`, `src/components/coach/ExtensionPairingPanel.tsx`; mods to `src/analytics/events.ts` (6 PII-free events), `src/screens/coach/ImportDataScreen.tsx`, `docs/importer/MOBILE_IMPORT_DECISION.md`. Gates: prod 396/400, ratio 882/396=2.23, 295 suites/3562 tests, tsc/lint green, R3 clean. **Honesty guardrail:** no mobile-readable progress endpoint exists → truthful terminal is `paired` ("running in the extension"); never renders importing/partial/complete or any page/entity/percent. Cancel is a local abandon (no server cancel endpoint). URL: `https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/285`

**Gotcha:** mobile `CoachPairingScreen` is Day-1 client-invite pairing — NOT extension 6-digit import pairing. Do not confuse them.

**PR #6 files & behavior (audited head `ab5dc61`):**
- `shared/replay/resolve.js` — platform→blueprint resolver seam; `unknown_platform` fails closed for every unregistered id.
- `extractors/truecoach/blueprint.js` — data-only verification adapter (JSON-serializable; no executable extraction logic).
- `background.js` — `start_import` orchestration wiring the bounded replay engine into runtime.
- `popup/popup.js` + `popup/popup.html` — Start Import CTA + dependency-injected wiring (real-behavior tested).

**PR #6 security controls that independently HELD in both lenses:**
- `start_import` gated by `isTrustedExtensionPage` (full trusted-extension-page shape, not extension-id alone; rejects a content-script sender).
- Synchronous single-flight guard (`importInFlight`) rejects concurrent runs.
- Observed tab origin injected as `allowedOrigins` (SSRF confinement), enforced by `normalizeBlueprint` inside `runReplay` before any fetch; `apiBase` hardcoded so a look-alike host cannot swap origin.
- Source `401/403 → AuthLostError` fails closed WITHOUT clearing TGP tokens (source auth loss ≠ TGP logout; no forced re-pair).
- LOCKED camelCase envelope; data-only blueprint constructed fresh per resolve.

**PR #6 local gates at `ab5dc61`:** prod 303/400 LOC; test:src diff ratio 2.010 (floor 2.0); 467 tests pass; banned-token scan clean; R3 clean (author+committer both Bradley Gleave on `ab5dc61`).

---

## 6. CURRENT WORK LEDGER (live lanes + subagent IDs)

| Lane | Subagent ID | State | Scope / ownership |
|---|---|---|---|
| EXT-C1b fixer r1 | `build_extension_c1b_runtime_mrkme1l6` | RECOVERED & PUSHED @`55f24d5` | Owned ALL PR #6 product-source edits for the fixer round; resolved the convergent P2 + all five P3s + adversarial tests. Recovered in the SAME sandbox after a step-limit/empty-response (no duplicate lane). Awaiting dual-lens r2. Do NOT edit extension source in parallel. |
| Mobile M2 | `build_mobile_m2_pairing_progress_mrknrpnb` | PR #285 OPEN @`bd9a41a`; dual-lens r1 in progress | Live pairing (mint+poll) UX against mobile `main` `1695517`. Independent of the extension repo — no file overlap with C1b. |
| Watchdog | cron `bbd2c039` | ACTIVE | Hourly foreground heartbeat; reads canonical doctrine each run; self-deletes at v0.3 E2E green. |

**R7 obligation:** probe each lane ≥ every 15 min (branch, HEAD, `git log @{u}..HEAD` unpushed count, modified-file count). If unpushed commits exist, push on the subagent's behalf after verifying R3 identity. If a HEAD hasn't moved in 30+ min, escalate (sharper ping, or cancel+redispatch with the failure mode captured, or take the work synchronously). Never cancel a lane without first capturing `git status` + workspace state (R8).

**Prior-session over-budget tree — RESOLVED:** an earlier synchronous fixer attempt had produced uncommitted edits measuring prod_added=478 vs the 400 cap with no tests. The C1b fixer round resolved this: the committed head `55f24d5` lands at **prod 398/400** (under cap) with **ratio 2.781** (healthy margin, no test-trimming) — achieved by trimming ADDED comment lines and removing two genuinely redundant prod lines, not by cutting tests. No R76/R86 exception was needed. The recovery inventory confirmed local HEAD = origin PR-#6 head = `55f24d5`, clean working tree, correct R3 identity — nothing was lost.

---

## 7. FINDINGS & BLOCKERS (PR #6 dual-lens r1 at `ab5dc61`) — ALL RESOLVED by fixer r1 @`55f24d5`

> **Fixer r1 resolution status (head `55f24d5`, dual-lens r2 pending):** all six r1 findings root-fixed with adversarial tests. (1) Convergent CTA source-bearer P2 → real ephemeral non-persistent trusted-tab handoff: popup passes the active `tabId`; background `collectSourceToken(tabId, allowedOrigins)` validates `tabId`, `chrome.tabs.get` live-origin ∈ allowlist, and messages the trusted content script (`sender.id` + no-tab guard), accepting only `{ok:true, token:string}`; the token lives in memory for the single run and never enters the DOM/telemetry/storage/logs/PR/payload; fails closed. (2) A-02 → `completeIngest` throws on non-2xx (no success without backend ack). (3) A-03 → source 5xx preserved as status/category only via engine `lastSkipStatus` (no body/PII). (4) Lens-B partial → surfaced distinctly as `ingest_partial` (+ amber `.status-ingest_partial` popup style). (5) Lens-B TGP-authloss → unified to one terminal state via `tgpAuthLost()`/`isTgpAuthLost()`. (6) Lens-B single-flight → shared synchronous `importInFlight` across `start_import` AND legacy `start_ingest`, including races. Gates @`55f24d5`: prod 398/400, ratio 2.781 (healthy margin), 489 tests, banned clean, R3 clean. **The findings below are the ORIGINAL r1 report, retained verbatim for the r2 auditors to check against.**

**Convergent BLOCKING P2 (found independently by BOTH lenses):**
- **CTA omits the source bearer.** The sole production producer of `start_import` (`popup/popup.js` around line 74 at `ab5dc61`) sends `{ kind, url }` with **no `sourceToken`**, so `makeSourceFetch('')` emits no `Authorization` header. A real CTA click against the only registered platform (bearer-gated TrueCoach proxy API) 401s → `AuthLostError` → imports nothing. The background bearer plumbing is correct and e2e-tested *under injected token*, but the UI token producer is missing. Fails closed (honest), so P2 not P1. Lens A calls this **A-01**; Lens B calls it **PR6-B-P2-cta-omits-source-bearer**.
  - **Required fix (operator-directed, non-negotiable):** implement the real, safe, ephemeral, non-persistent, trusted-tab token handoff — do NOT merely soften the "bearer end-to-end" claim or ship a knowingly non-functional CTA, because v0.3 requires the real flow. Validate sender/tab/origin and fail closed. The source token must NEVER enter the popup DOM, telemetry, local storage, logs, the PR body, or the backend payload. The intended seam (designed last session, now the C1b subagent's to land): popup passes the active `tabId` → background `collectSourceToken(tabId, allowedOrigins)` re-validates the tab's live origin ∈ allowlist and asks that tab's content script → content script reads the coach's own JWT-shaped bearer from page session/local storage and returns it once → token lives in memory for the single run only.

**Lens A P3s:**
- **A-02:** `completeIngest` does not check `res.ok`, so a non-2xx `/complete` still broadcasts `ingest_succeeded` (pre-existing code, now inside the success-path blast radius). Fix: check non-2xx; never broadcast success without a backend ack.
- **A-03:** a source 5xx surfaces as a low-signal "import failed" (status dropped). Fix: preserve the diagnostic signal (status/category only — never a response body/PII).

**Lens B P3s:**
- **partial-reported-as-succeeded:** `handleStartImport` collapses `result.status` `complete||partial` both to `ingest_succeeded`, discarding the engine's honest `partial/degraded/truncated` signal (silent data loss shown as unqualified success). Fix: surface partial/degraded/truncated distinctly through completion → broadcast → popup (note `popup/popup.html` already has a `.status-ingest_partial` style hook).
- **tgp-authloss-status-muddle:** `makeSender` throws a plain `Error('auth_required')` not an `AuthLostError`, so a TGP-side auth loss lands in the catch as detail `auth_required` and overwrites the friendlier `onAuthLost` broadcast in an order-dependent way. Fix: unify TGP auth-loss classification so one consistent terminal state wins.
- **single-flight-only-start_import:** `importInFlight` guards `start_import` only, not the legacy `start_ingest` path, so `start_ingest` can run concurrently. Fix: share one synchronous single-flight guard across both entrypoints, including races.

**Lens B advisory (not scored):** ratio 2.010 sits only 3 lines above the R74 floor of 2.0. A fixer round must **maintain ratio ≥ 2 with healthy margin** and must NOT trim tests or add trivial prod to game it.

**Adversarial tests the fixer round must add (one per fix):** real CTA token-producer → background bearer e2e; unauthorized sender / token request rejected; no token persistence/leakage (DOM/storage/logs/payload); `completeIngest` non-2xx does not broadcast success; source 5xx classification (status/category, no body); partial UI/status fidelity; TGP auth-loss ordering; cross-entrypoint AND same-entrypoint single-flight races.

**Constraints the fix must simultaneously satisfy:** prod ≤ 400 net LOC; test:src ≥ 2.0 with margin; flags default-off; site-agnostic (no per-brand executable code); all security invariants + R3 preserved.

**No open P0 or P1 anywhere on PR #6.** All mandatory security controls independently re-verified and HOLD in both lenses.

---

## 8. ORDERED NEXT-AGENT RUNBOOK

1. **Zombie sweep (R8) + subagent probe (R7).** `git fetch` all four repos first. Reconcile open PRs, orphan branches, un-audited merges, unpushed worktrees. Probe both active lanes (§6) for unpushed commits; push on their behalf if needed (verify R3 first).
2. **EXT-C1b fixer r1 is DONE and pushed @`55f24d5`** (all six r1 findings root-fixed + adversarial tests; prod 398/400, ratio 2.781, 489 tests). No further fixer work is needed unless r2 surfaces new findings.
3. **Re-dual-lens PR #6 at the exact fixer head `55f24d5`** (R124: `gh api` head.sha MUST equal local `git rev-parse HEAD`). Two independent adversarial auditors (Lens A correctness+security, Lens B tests+contracts+architecture), full P0–P3 hunt. Cycle audit→fix→re-audit until **CLEAN/CLEAN**.
4. **Merge PR #6 via identity-safe manual squash** (§9), only when CLEAN/CLEAN + CI green. Record the R138 Decision Gate in the PR body. Update `current-state.json` (per the `live_state_update_rule`).
5. **Mobile M2 PR #285 (`bd9a41a`)** — dual-lens r1 is in progress; carry it through its audit cycle (Lens A + Lens B, full P0–P3) to CLEAN/CLEAN, fix any findings, then merge via identity-safe manual squash. Note the confirmed blocker: no mobile-readable import-progress route, so progress/partial/complete stay deferred behind `FEATURE_SCOUT_INGEST` to a backend/extension follow-up; the honest terminal is `paired`.
6. **Default extension packaging** with the app download path.
7. **Staging flags + full-loop E2E smoke + competitor dogfood** (flip `FEATURE_EXTENSION_PAIRING` / `FEATURE_SCOUT_INGEST` in staging).
8. **Pairing security §13 + install pack + R137 postmortem** at v0.3 green. The postmortem MUST capture R3-INC-1. When v0.3 E2E ship criteria are met, the watchdog cron `bbd2c039` deletes itself.

Update `current-state.json` after every dual-lens completion (per round), every fixer round, and every merge.

---

## 9. MERGE PROTOCOL (identity-safe, R3-conforming — READ BEFORE MERGING ANYTHING)

**Never use GitHub-generated squash for TGP repos.** It stamps a non-Bradley author/committer (the R3-INC-1 root cause), and correcting it post-publish would require a destructive force-push over shared `main`.

**The procedure (`merge_procedure_change_2026_07_14`), proven on mobile #284:**
1. Build a local/manual squash commit whose **tree is exactly the audited exact-head tree**, with BOTH author and committer set to `Bradley Gleave <bradley@bradleytgpcoaching.com>` (use inline `-c user.name=... -c user.email=...`, never `git config --global`).
2. **Lease-safe fast-forward** `main` to that commit (`--force-with-lease` pinned to the known base; aborts on divergence — fast-forward only, NO history rewrite). Example that worked: mobile push `09b6cac..1695517`, no force.
3. Verify tree equality: `git diff <new-main> <audited-head>` must be empty (byte-identical).
4. Verify R3 on the remote via `gh api` (author+committer both Bradley; forbidden-token scan clean, word-boundary anchored per R3-CLARIFY-1).
5. R124: `gh api` head.sha == local HEAD before declaring merged.
6. **Close the PR with `gh pr close`** (NOT the merge API) with an explanatory comment referencing the landed commit; preserve the head branch.

**Absolute rule:** NEVER force-push a rewrite of published shared `main` to fix identity. If identity is already wrong on a published tip (as with `5eabeec`/R3-INC-1), accept + grandfather + fix the procedure forward. Rollback for any PR = flag-off or revert PR; stop on any P0–P3 or contract mismatch.

---

## 10. FILES READ FOR CONTEXT (this session — literal enumeration)

**Read in full this session (via the Read tool, exact paths):**
- `tgp-agent-context/AGENT_RULES.md` — lines 36–215 (R1–R9 incl.), 317–366 (R14/R15), 1504–1623 (R138 + Constitution Addendum head); plus a grep index of R1/R3/R4/R5/R10/R14/R72/R74/R76/R80/R124/R138 locations. (NOT read end-to-end — 167 KB file; the cited rule bodies and the addendum head were read directly.)
- `tgp-agent-context/handoffs/importer-wave/current-state.json` — full (lines 1–605).
- `tgp-importer-extension/popup/popup.html` — full (lines 1–83).
- `tgp-importer-extension/popup/popup.js` — full (lines 1–120).
- `tgp-importer-extension/content/main.js` — full (lines 1–50).
- `tgp-importer-extension/shared/replay/engine.js` — full (lines 1–321).

**Inspected via directory/grep/git this session (not full reads):**
- `tgp-agent-context/` git status, branch, `git log -3` (confirmed R3-conforming recent commits `e3eea1c`, `beadb39`, `f7b33e4`).
- `tgp-agent-context/handoffs/importer-wave/` listing (`HANDOFF_WAVE2.md`, `current-state.json`, `product-ideas-importer-wave.md`).
- `tgp-agent-context/handoffs/audit-reports/` — confirmed `EXT-PR6-LENS-A-LIVE.ab5dc61.md`, `EXT-PR6-LENS-B-LIVE.ab5dc61.md` present.
- `tgp-agent-context/` top-level listing + `find` for plan/doctrine docs; confirmed `DECISION_LOG.md`, `roadmap/M-IMPORTER-EXTENSION_v1.md`, `roadmap/specs/A02-import-tooling.md`, `roadmap/DOCTRINE_INVARIANTS.md`, `roadmap/rulings/R3-CLARIFY-1_2026-07-06.md`, `roadmap/rulings/R80-CLARIFY-1_2026-07-07.md`.
- `tgp-importer-extension/docs/` listing — confirmed `AUTO_DISCOVERY.md`, `CAPTURE_MODEL.md`, `DECISION_V03_AUTONOMOUS_CRAWL.md`, `DESIGN.md`, `ROADMAP.md`, `first-principles.md`.

> Honesty note (R10): the file bodies of `EXT-PR6-LENS-A/B-LIVE.ab5dc61.md`, `background.js`, and the product/plan docs listed under §4 were NOT re-read in full this session — their contents here are drawn from `current-state.json` (which embeds the full lens findings verbatim) and from prior-session reads recorded below. Do not treat this §10 list as "all files in the repo."

---

## 10b. KNOWN PRIOR-SESSION CONTEXT ARTIFACTS (read before this session's compaction — provenance, not re-verified now)

These were read in earlier turns of the prior session and summarized into context; they are listed so the next agent knows what informed this handoff, but they were NOT re-read at this checkpoint:
- `tgp-importer-extension/background.js` — the message router + `start_import`/`start_ingest` orchestration, `makeSender`, `completeIngest`, `handleStartImport`. (Too large to include in context; re-Read it before editing.)
- `tgp-importer-extension/extractors/truecoach/net.js` — existing bearer pattern (`Bearer` + `Role:Trainer` + `credentials:include`).
- `tgp-importer-extension/shared/capture.js` — Layer-1 capture; redacts Authorization/Cookie (not a token producer by design).
- `tgp-importer-extension/manifest.json` — permissions `tabs, storage, activeTab, notifications, debugger`; **no `scripting`** permission; content scripts run only on allowlisted source hosts.
- `tgp-importer-extension/extractors/detect.js` — hostname-suffix platform detection.
- `tgp-importer-extension/extractors/_interface.js` — the LOCKED envelope contract.
- `tgp-importer-extension/shared/replay/blueprint.js` — `normalizeBlueprint`, `extractItems`, `readPath`, exported `PARAM_NAME_CHARS` (single source of truth for the `:param` grammar shared by normalizer + engine).
- `tgp-importer-extension/shared/net.js` — `isTimeout`, HttpError/MalformedResponseError shapes.
- `tgp-importer-extension/test/helpers/background-mock.js` — mock lacks `tabs.sendMessage`; `tabs.get` returns `{id}` without a URL (the C1b token-handoff tests need a harness extension).
- `tgp-importer-extension/test/popup-start-import.spec.js` — asserts the exact `{kind,url}` message (must be updated for the new `tabId` field).
- `tgp-importer-extension/test/ingest-auth.spec.js` — pre-run guards only.
- `tgp-importer-extension/scripts/check-prod-loc.mjs`, `scripts/check-test-ratio.mjs`, `scripts/lib/git-diff.mjs` — the LOC/ratio gate mechanics (gross insertions in `.js`/`.mjs` outside `test/`+`scripts/`; base via RATIO_BASE → GITHUB_BASE_REF → origin/main → main; `.html`/`.json` are gate-free).
- `handoffs/audit-reports/EXT-PR6-LENS-A-LIVE.ab5dc61.md` and `EXT-PR6-LENS-B-LIVE.ab5dc61.md` — full r1 reports (findings embedded verbatim in `current-state.json.audit_rounds[pr6/round1]`).

---

## 10c. FILES READ DURING THIS STATE-UPDATE SESSION (checkpoint update for PR #6 fixer r1 + Mobile M2 PR #285)

This section is appended for the checkpoint that recorded the EXT-C1b fixer-r1 recovery (`55f24d5`) and the Mobile M2 PR #285 open. Read with the Read tool during THIS update session (honest enumeration; no prior-authorship reads claimed):
- `handoffs/importer-wave/current-state.json` — full (edited this session).
- `handoffs/importer-wave/AGENT_HANDOFF_V03_2026-07-14.md` — full (this file; edited this session).
- `tgp-importer-extension/content/main.js` — full (the trusted-tab source-bearer content collector: `readSourceBearer`/`wireCollector`, `sender.id` + `kind:"collect_source_token"` guard).
- `tgp-importer-extension/shared/replay/engine.js` — full (the bounded replay kernel; confirmed `lastSkipStatus` diagnostic + `complete|partial|failed|cancelled` terminal used by the P3 partial/5xx fixes).
- `tgp-importer-extension/extractors/truecoach/blueprint.js` — full (data-only verification adapter).
- `/tmp/claude_code_output.md` — full (the extension fixer/recovery deliverable summary that sourced the PR #285 and PR #6 evidence recorded here).

> Provenance note: `tgp-importer-extension/background.js` was read in an earlier turn (before context compaction) and is too large to re-include; its behavior is summarized in §7 and §10b. The Mobile M2 PR #285 details recorded in §1/§5/§7 are drawn from the verified fixer/recovery deliverable and `gh` PR metadata (head `bd9a41a`, base `1695517`, state OPEN), not from a full read of the mobile source files this session.

---

## 11. DECISIONS / DECISION RECORD

**Standing decision (current, from `current-state.json.decision_record_current`):**
- **Decision:** land the generic replay core before inference/UI breadth.
- **Real goal:** prove safe bounded site-agnostic many-page traversal + orchestration.
- **Root cause addressed:** the product had capture + one mapped extractor but no generic deterministic replay kernel.
- **Five-step:** questioned platform maps; deleted DOM/SSR packs and multi-platform breadth; simplified to an injected pure engine; accelerated with fixtures/gates; automation limited to bounded replay.
- **Good-without-bad:** autonomy without broad permissions or destructive methods.
- **Rollback:** flag-off or revert PR; stop on any P0–P3 or contract mismatch. NEVER force-push a rewrite of published shared `main` to fix identity.

**R3-INC-1 (OPEN, ACCEPTED, NOT fixed):** PR #5 landed via GitHub-generated squash; GitHub synthesized author `BradleyGleavePortfolio <bradleyapple1031@gmail.com>` + committer `GitHub <noreply@github.com>` on `5eabeec`, violating R3. The audited tree (`5d46a1b`) is CLEAN/CLEAN; only the commit-envelope identity is non-conforming. A metadata-only rewrite candidate was built and verified locally but **deliberately NOT pushed** (force-pushing over published shared `main` is destructive). `origin/main` remains `5eabeec` unchanged; the candidate is unreferenced and will be GC'd. Recorded as an OPEN, visible landmine — not hidden, not silently fixed. **Prospective fix already in force:** `merge_procedure_change_2026_07_14` (identity-safe manual squash), which made mobile #284 land R3-conforming without any history rewrite. R3-INC-1 must be captured in the R137 postmortem.

**Merge-procedure change (2026-07-14):** GitHub squash → identity-safe manual squash + lease-safe fast-forward for extension, backend, and mobile going forward. Prior grandfathered history (incl. `5eabeec`) is NOT rewritten. This refines (does not waive) R138 autonomy.

**Resolved ruling:** dark-route guard ordering — Option A shipped via backend #503 (feature-flag middleware before auth), resolved 2026-07-08; no longer blocks merges.

---

## 12. HANDOFF ACCEPTANCE CHECKLIST (tick before you start executing)

- [ ] I read `AGENT_RULES.md` and internalized SACRED R1/R3/R14 + the R138 four-question gate.
- [ ] I read `handoffs/importer-wave/current-state.json` (schema v1.1) and treat it as the machine snapshot of this same checkpoint.
- [ ] I ran the R8 zombie sweep (`git fetch` first) across all four repos.
- [ ] I probed both active lanes (`build_extension_c1b_runtime_mrkme1l6`, `build_mobile_m2_pairing_progress_mrknrpnb`) per R7 and did NOT start parallel edits that collide with them.
- [ ] I understand PR #6 is builder-complete, NOT merge-ready, blocked on the convergent CTA source-bearer P2 + five P3s, with no open P0/P1.
- [ ] I will NOT rewrite published `main` history to fix R3-INC-1; I will merge only via identity-safe manual squash.
- [ ] I will NOT plan per-competitor mapped tooling as the core, and will NOT conflate this wave with the `A02-import-tooling.md` CSV lane.
- [ ] I will record an R138 Decision Gate in each governed PR body and update `current-state.json` after every audit round / fixer round / merge.
- [ ] Source tokens will never touch the popup DOM, telemetry, local storage, logs, the PR body, or the backend payload; sender/tab/origin validated; fail closed.
- [ ] At v0.3 E2E green: write `handoffs/importer-wave/postmortem.md` (R137) including R3-INC-1; let watchdog `bbd2c039` self-delete.

---

*Prepared as a coordination/context document (audit-exempt per R14 scope). Owner: Bradley Gleave &lt;bradley@bradleytgpcoaching.com&gt;. Checkpoint: 2026-07-14 — EXT-C1b PR #6 fixer r1 COMPLETE & pushed @`55f24d5` (all six r1 findings root-fixed, dual-lens r2 pending); Mobile M2 PR #285 OPEN @`bd9a41a`, dual-lens r1 in progress. R3-INC-1 remains OPEN/accepted.*
