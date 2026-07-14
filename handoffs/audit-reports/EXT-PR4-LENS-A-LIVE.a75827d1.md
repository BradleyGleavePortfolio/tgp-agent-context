# EXT PR #4 — LENS A (Correctness / Security / Data-Integrity) — LIVE ADVERSARIAL AUDIT

- **Repo:** BradleyGleavePortfolio/tgp-importer-extension
- **PR:** #4 — "feat(replay): site-agnostic bounded autonomous multi-page import engine"
- **Audited head (verified):** `a75827d1c0cf5452c1e924ddae4889c5b8b2f3f6` ✅ matches expected
- **Base:** `main` @ `a8563853758bc369b01d9f1f7e03a28db8a520ef` (squash-merge of PR #3)
- **Merge-base:** `a8563853758bc369b01d9f1f7e03a28db8a520ef` (branches cleanly off main; no divergence)
- **Lens:** A (security R24–R36, perf+concurrency R44–R55, data+infra R67–R73, SSRF/exfil/origin, product invariant)
- **Method:** full line-by-line read of all 17 changed files, gate re-computation, live CI status, doctrine sweep (R1/R2/R10/R14/R23/R74/R76/R109/R138 + §7/§9).

## YOUR JOB (R11)
Findings produced independently from evidence. Prior claims (the PR body's own "Evidence"/"Gates" block) were treated as **hypotheses to verify** — and several were **refuted** (see P1-1/P1-2/P1-3).

---

## HEADLINE

**The audited head has RED CI and a PR body whose evidence block is materially false.** The exact head `a75827d1` fails the required CI job at the **"Production LOC budget"** step. The real prod-LOC and test-ratio numbers are **not** what the PR body states. This alone violates the R14 pre-merge gate (CI green is a precondition) and R102 branch-protection intent. On top of that, the orchestration reports **partial/truncated imports as fully "complete"** and does **not** enforce the single-import invariant it claims. The pure engine, blueprint schema, and state machine are well-built and genuinely site-agnostic — the product invariant is respected — but the PR is **not mergeable** in its current state.

**VERDICT: FAIL** — P0=0, P1=3, P2=3, P3=2.

---

## VERIFICATION OF PR-BODY CLAIMS (refuted)

| PR body claim | Reality at `a75827d1` | Verdict |
|---|---|---|
| "LOC `prod_added=554` cap 600 OK" | `git diff --numstat` base…HEAD, prod JS (excl `test/`,`scripts/`,`node_modules`, non-`.js/.mjs`) = **817 added** | ❌ FALSE — gate FAILS (817 > 600) |
| "ratio `2.063` floor 2.0 OK" | test_added=1143 / prod_added=817 = **1.399** | ❌ FALSE — below the R74 floor of 2.0 |
| "CI: `npm test` (287 pass) + `npm run gates` (all green)" | CI job `test` = **failure**; "Production LOC budget" step failed; ratio+flags steps **skipped** | ❌ FALSE for gates ("all green") |
| "287 passed (26 files)" | CI "Run tests" step = success | ✅ TRUE |
| Decision doc: "lands within the LOC cap"; "engine + schema + state are ~230 prod LOC" | Total prod LOC added across the PR = 817 | ❌ misleading (engine core alone may be ~230, but the *PR* is 817 and over cap) |

Live CI (exact head): `gh api .../commits/a75827d1.../check-runs` → two `test` runs, both `conclusion: failure`. Failing step: **"Production LOC budget"** (`scripts/check-prod-loc.mjs`, cap 600, actual 817).

---

## FINDINGS

### P1-1 — Prod-LOC cap breached; CI is RED; no exception/sign-off (R76 / R23 / R14 / R102)
- **Evidence:** prod JS added = **817** (`background.js` +153, `shared/replay/blueprint.js` +194, `shared/replay/engine.js` +263, `shared/replay/state.js` +88, `shared/replay/resolve.js` +26, `extractors/truecoach/blueprint.js` +54, `popup/popup.js` +39). CI step "Production LOC budget" **fails** (817 > repo cap 600). Doctrine cap is stricter still: **R76/R23 = 400 prod LOC** → automatic **P1-LOC**.
- **Why it blocks:** R14 step 1 requires CI green before the cycle can even reach a CLEAN verdict; the head is red. R23/R76 require an `R86 EXCEPTION REQUESTED` block (item-by-item no-waste justification + split feasibility) + operator `r86-exception-approved` label for any PR >400 prod LOC. **Neither the exception block nor the label is present** in the PR body.
- **BLOAT | STRUCTURALLY NECESSARY | MIXED assessment:** **MIXED.** The generic engine (`engine.js` 263) + schema (`blueprint.js` 194) + state (`state.js` 88) are structurally necessary and cohesive. But the PR *bundles* the orchestration wiring (`background.js` +153) and popup CTA (`popup.js` +39, `popup.html` +20) with the core. The decision doc itself names **PR-C2** as a separate follow-up; the same logic argues the orchestration/CTA could be a chained PR, bringing the core under cap. Split feasibility is real.
- **Required to clear:** either split into chained ≤400-LOC PRs, or add a truthful `R86 EXCEPTION REQUESTED` block + obtain operator sign-off; then get CI green.
- **Note (pre-existing, not this PR's fault, flagged per R10):** `scripts/check-prod-loc.mjs` hardcodes `CAP = 600`, which is **looser than doctrine R76/R23's 400**. Stricter wording governs (R23 §"Where R23 and R76 overlap, the stricter wording governs"; R30 precedence). The 600 gate is inherited infra (not in this diff), but it means CI green would still not satisfy doctrine. Recommend a tracking issue to reconcile the gate to 400 (R20).

### P1-2 — R74 test:src ratio below floor (R74 / R100.A1)
- **Evidence:** test JS added = **1143**, prod JS added = **817** → ratio **1.399** < floor **2.0**. `scripts/check-test-ratio.mjs` would exit non-zero; it was **skipped** in CI only because the LOC step failed first (GitHub Actions skips subsequent steps after a failure).
- **Why:** the PR's "2.063" is computed against the false 554 denominator. With the real denominator the density gate fails. Needs ≥ `ceil(817 × 2.0) = 1634` added test lines (or a smaller prod diff via the P1-1 split), or an R74 exception label.
- **Required to clear:** reduce prod LOC (split) and/or add tests to restore ≥2.0; make the gate actually pass in CI.

### P1-3 — PR body & decision doc contain materially false gate evidence (R2 / R10 / R1)
- **Evidence:** the "Evidence"/"Gates" block asserts `prod_added=554`, `ratio 2.063`, and "gates all green"; the decision doc asserts the PR "lands within the LOC cap." All are false at this head (817 / 1.399 / CI red). R2 mandates "ship correctly, not fast" and forbids passing off unverified claims as evidence; R1 (decacorn) treats dishonest release evidence as a P0-class anti-pattern (polish-as-afterthought / overclaim).
- **Why it's its own finding (not merely P1-1):** a reviewer or the merge-authorizing agent reading "gates all green" could authorize a merge that CI actually blocks. False green is a process-integrity defect independent of the LOC overage itself.
- **Required to clear:** correct the PR body/decision-doc evidence to the true numbers and the true (red) gate state before any merge authorization.

### P2-1 — Truncated / partial imports are reported to coach AND backend as fully "complete" (R109 no-half-ass / R59 / data-integrity)
- **Evidence:** `shared/replay/engine.js` computes and returns `truncated` (set `true` on `!budgetLeft()` or `pagesThisStep >= maxPagesPerStep`). In `background.js handleStartImport`, the result is consumed as:
  ```js
  const result = await runReplay({...});
  if (result.status === "cancelled") { ...; return; }
  await completeIngest(intent);
  broadcastStatus({ ...currentSnapshot, intent: { ...intent, status: "complete" } });
  notifyComplete(platform);
  ```
  `result.truncated` is **never read.** A crawl that hit `maxPages`/`maxEntities`/`maxPagesPerStep` is finalized to the backend (`/ingest/complete`) and shown to the coach as "Import … complete" with a desktop notification — despite being partial.
- **Compounding:** `fetchPage` returns `null` on retry-exhaustion or a malformed page; for page-style pagination `items.length === 0 → return`, so a transient failure or shape-shift **silently ends** that step's traversal **without even setting `truncated`**. The run still returns `status:"complete"`. So multiple partial-data paths surface as full success.
- **Impact:** the backend marks the import complete and the coach believes all clients/workouts imported when they did not — silent data-completeness loss. Violates R109 ("nothing should … be blank/FAKE … half-assed is death") and the honest-terminal-state spirit of the state machine.
- **Required to clear:** propagate `truncated` (and page-skip) into a distinct terminal surface (e.g. `complete_partial` / a warning in the snapshot) and/or gate `completeIngest` on a non-truncated result; add a test.

### P2-2 — No single-flight guard: concurrent `start_import` orphans the first crawl; the "at most one import" claim is unenforced (R51-class state / R109 honesty)
- **Evidence:** `background.js`:
  ```js
  let activeImport = null;
  async function handleStartImport(message) {
      ...
      const controller = new AbortController();
      activeImport = { controller };   // unconditional overwrite
  ```
  The header comment claims *"At most one import runs per service worker."* There is **no guard**: a second `start_import` (from a double message, or a first-party content script — see P3-1) overwrites `activeImport`, leaving the first `AbortController` orphaned. The first crawl **keeps running in parallel and can no longer be cancelled** (`handleCancelImport` only aborts the latest `activeImport`), and both runs interleave `broadcastStatus` snapshots.
- **Impact:** duplicate concurrent ingest under the coach's session, an uncancellable runaway crawl, and corrupted popup state. The popup's disabled-button is UI-only and not the trust boundary.
- **Required to clear:** if `activeImport !== null`, either reject the new `start_import` (ack `{ok:false, busy:true}`) or abort-then-replace; add a concurrency test. (Note: `start_ingest` similarly does not register `activeImport`, so `cancel_import` cannot stop a legacy ingest run — flag for consistency.)

### P2-3 — Blueprint normalizer accepts any URL scheme and any host: latent SSRF / credential-exfil boundary gap (R24-class / SSRF / origin-confinement)
- **Evidence:** `shared/replay/blueprint.js normalizeBlueprint` validates `apiBase` only via `void new URL(bp.apiBase)` — this accepts `http:`, `file:`, `ftp:`, `data:`, `blob:`, cloud-metadata IPs (`http://169.254.169.254/...`), internal hosts, etc. There is **no `https:` enforcement and no host allowlist.** The engine's `makeSourceFetchJson` fetches every URL with **`credentials: "include"`** and forwards a bearer, then feeds the response into ingest.
- **Reachability caveat (honest):** **NOT reachable in this PR.** `resolveBlueprint` returns a blueprint only for `truecoach`, whose `apiBase` is the trusted constant `TRUECOACH_API_BASE` (`https://app.truecoach.co/proxy/api`). So no untrusted `apiBase` reaches `fetch` today.
- **Why still a P2 now:** the normalizer is explicitly documented as *"fail closed BEFORE any network call"* and the whole PR's stated invariant is **site-agnostic** with **PR-C2 feeding `resolveBlueprint` from auto-inferred blueprints derived from passive/untrusted capture.** The security boundary is being built in *this* PR; the moment an inferred (attacker-influenceable) blueprint reaches it, an `apiBase` of `http://169.254.169.254/…` or an arbitrary external origin runs under the coach's session — SSRF and a credentialed-fetch exfil/injection surface. Method safety **is** enforced at parse time (GET|HEAD) but scheme/host are not, so the "scheme/host/method safety" claim is only 1-of-3.
- **Required to clear (cheap, do it in the boundary now):** enforce `protocol === "https:"` and confine to an explicit host allowlist (or at minimum reject private/link-local/loopback hosts) inside `normalizeBlueprint`, with a test. This closes the hole before PR-C2 can open it.

### P3-1 — `start_import` / `cancel_import` gated only by extension-id, not by the trusted-extension-page check (least privilege / §13.4 parallel)
- **Evidence:** the router's top guard is `sender.id === chrome.runtime.id`. `session_established` (secret-bearing) additionally requires `isTrustedExtensionPage(sender)` (`sender.tab === undefined` + `chrome-extension://<id>/` URL). `start_import`/`cancel_import` do **not**. The manifest injects a content script into `https://*.truecoach.co/*` (`content/main.js`), which shares the extension id and would pass the weak guard. `start_import` forwards a `sourceToken` and initiates an authenticated crawl + backend ingest under the coach's **TGP** access token; `cancel_import` can abort a running crawl.
- **Severity rationale (P3):** the content script is first-party and this diff contains **no** web-page→content-script message bridge, so a hostile web page cannot directly reach it; it also matches the pre-existing `start_ingest` gating (not a regression). But least-privilege (and the codebase's own §13.4 stance that "ID-only trust is not enough") argues these action triggers should also require `isTrustedExtensionPage`.
- **Required to clear:** apply `isTrustedExtensionPage(sender)` to `start_import`/`cancel_import` (and `start_ingest`), or document why a content-script origin is intentionally trusted for these; add a router-auth test.

### P3-2 — Dedupe key uses a space delimiter → collision-prone for untrusted `entityType`/`sourceId` (R63-class / idempotency)
- **Evidence:** `engine.js` idempotency key = `` `${step.entityType} ${sourceId}` ``. `entityType` is validated non-empty but may contain spaces; `sourceId = String(rawId)` may too. `("client", "a b")` and `("client a", "b")` both key to `"client a b"` — a false-positive de-dupe that would silently drop a distinct entity.
- **Reachability caveat:** trusted TrueCoach entity types (`trainer`/`client`/`workout`) contain no spaces, so not reachable today; latent for PR-C2 inferred blueprints and for id values containing spaces.
- **Required to clear:** use a non-collidable composite key (e.g. `JSON.stringify([entityType, sourceId])` or a NUL/` ` delimiter); add a test.

---

## WHAT IS CORRECT (verified, no finding)

- **Product invariant upheld:** the core (`shared/replay/*`) contains **zero** competitor-specific logic; TrueCoach is a data-only adapter living in `extractors/`, injected via a registry seam (`resolve.js`). Unknown platforms return `null` → honest `unknown_platform`, engine never starts. This is genuinely site-agnostic; TrueCoach does not define the core. ✅
- **State machine:** pure transition table; illegal `(state,event)` → `null`; terminal states re-arm only via explicit `RESET`. No invalid transition can silently corrupt the surface. ✅
- **Method safety:** `SAFE_METHODS = {GET,HEAD}` enforced at parse time; unsafe methods throw before any network call. ✅
- **Boundedness:** `maxPages`/`maxEntities`/`maxPagesPerStep` + per-step `visited` URL set terminate on cycles, duplicate pages, cursor loops, and 100×-scale fan-out. Verified against `test/replay-engine*.spec.js`. ✅
- **`:param` injection:** `fillTemplate` uses `encodeURIComponent`, so response-derived ids cannot break out of a path segment. ✅
- **forEach integrity:** every `forEach` must reference a set produced by an *earlier* `collectAs`, validated in `normalizeBlueprint`. ✅
- **Auth-loss fail-closed (source):** `makeSourceFetchJson` throws `AuthLostError` on 401/403; `fetchPage` rethrows it (never continues); `handleStartImport` clears tokens + broadcasts `auth_required`. ✅
- **Auth-loss (backend ingest):** `makeSender` refreshes once, retries, then `clearTokens` + `onAuthLost` (aborts controller) on repeat 401. ✅
- **Timeouts/abort:** every fetch is bounded by `fetchWithTimeout`; caller signal composed; abort short-circuits at each loop head; `abortedNow()` covers the DOMException-not-instanceof-Error abort case. ✅
- **Backpressure:** `emit` is awaited before the next fetch. ✅
- **Secrets/redaction:** no `console.*`, `innerHTML`, `eval`, `localStorage`, or `document.cookie` in the diff; no token/cookie persisted or logged; error messages carry only status codes, never token material. ✅
- **Banned-cast/tokens:** CI "Banned-token net" step passed; manual grep confirms no `as any`/`as unknown as`/silent-catch in the diff. ✅
- **Char hygiene:** no control/binary chars; only em-dashes/`§`/`⇒` in comments. ✅
- **Tests are real (R40):** assertions check concrete values (`.toContain`, `.toEqual`, `.toHaveLength`, call counts), not `.toBeDefined()` theater. ✅
- **287 tests pass** (CI "Run tests" step green). ✅

---

## R100 CHECKLIST (Lens A scope; N/A = client-side MV3 extension, no server/DB/RLS in this PR)

| Rule | Status | Evidence |
|------|--------|----------|
| R100.1  Zero secrets | PASS | no secrets/high-entropy in diff; tokens memory/session only |
| R100.2  RLS every table | N/A | no Supabase tables in this PR |
| R100.3  No raw-SQL concat | N/A | no SQL |
| R100.4  No unsanitized output | PASS | popup uses `textContent`/`createElement`; no `innerHTML` |
| R100.5  IDOR-proof | N/A | no owned `:id` server endpoints added here |
| R100.6  Rate limiting auth/paid | PASS | engine paces via `rateLimitMs`; source fetch client-side |
| R100.7  JWT hygiene | N/A | token lifecycle owned by shared/session.js (PR #3) |
| R100.8  Runtime input validation | PASS | `normalizeBlueprint`/`normalizeStep` guard all fields; router `isRecord`/type guards |
| R100.9  Role check data layer | N/A | client-side |
| R100.10 npm audit clean | N/A (not run here) | only devDep vitest; lockfile delta 2 lines |
| R100.11 CORS allowlist | N/A | client-side fetch |
| R100.12 No internal info in errors | PASS | error messages are status codes only |
| R100.13 HTTPS+HSTS | **FAIL (latent)** | normalizer does not enforce `https:` on `apiBase` → **P2-3** |
| R100.20 No circular imports | PASS | engine→blueprint→net; resolve→adapter→protocol; acyclic |
| R100.21 No N+1 | PASS | traversal is the intended IO; bounded + paced |
| R100.23 Pagination | PASS | page + cursor styles, server-agnostic, bounded |
| R100.24 No event-loop block | PASS | no `*Sync`; all awaited async |
| R100.28 RMW lock/txn | N/A | client-side; ingest idempotent by sourceId |
| R100.29/52/90 Idempotency | PASS (with caveat) | de-dupe by (entityType,sourceId); delimiter collision **P3-2** |
| R100.33 Error boundary/filter | PASS | router try/catch → broadcast; run-level try/catch |
| R100.34 Structured logging | PASS | no `console.log` in diff |
| R100.35 Timeouts external | PASS | `fetchWithTimeout` on every call |
| R100.36 No swallowed errors | PASS (with caveat) | malformed/exhausted pages skipped **by design**, but not surfaced as partial → **P2-1** |
| R100.42 No impossible-edge defenses | PASS | guards map to real inputs |
| R100.43 Zero dead code | PASS | `start_ingest`/`TrueCoachExtractor` preserved intentionally; LEARN/CONFIRM states pre-wired for PR-C2 and tested |
| R100.A1 Test:src ≥ 2.0 | **FAIL** | 1143/817 = **1.399** → **P1-2** |
| R100.A2 Banned-cast net = 0 | PASS | CI banned-token step green |
| R100.A3 ≤ 400 prod LOC | **FAIL** | **817** added → **P1-1** (also > repo cap 600 → CI red) |
| R100.A4 CI pass-rate | INFO | this head's CI = **failure** |
| R100.A5 Verdict line present | PASS | see final line |

## Doctrine notes
- **R14/R102:** head CI is RED → merge gate not satisfiable until green; do not merge.
- **R138 (builder-stage):** PR is explicitly a builder PR ("not self-audited or merged"), so absence of an `R138 Decision Gate` block in the PR body is acceptable *now*, but a truthful four-question Decision Record MUST be added to the PR body before any merge authorization; the in-repo `docs/DECISION_V03_AUTONOMOUS_CRAWL.md` already covers root-cause/five-step/options well (aside from the false "within the LOC cap" claim called out in P1-3).
- **R20:** recommend tracking issues for (a) reconciling `check-prod-loc.mjs` cap 600 → doctrine 400, and (b) the SSRF/scheme-host confinement to land with/before PR-C2.

---

## FIXER PUNCH LIST (clear ALL before re-audit — R14 "P0–P3 in any regard")
1. **P1-1** Bring prod LOC under cap (split into chained PRs, or add truthful `R86 EXCEPTION REQUESTED` + operator sign-off) and get CI green.
2. **P1-2** Restore test:src ≥ 2.0 for the real prod-LOC denominator.
3. **P1-3** Correct PR body "Evidence"/"Gates" and decision-doc LOC claims to true values + true (red→green) gate state.
4. **P2-1** Surface truncated/partial crawls as a distinct non-"complete" terminal state; gate `completeIngest`; test it.
5. **P2-2** Enforce single-flight in `handleStartImport`; make `cancel_import` able to stop any active run; test it.
6. **P2-3** Enforce `https:` + host allowlist (reject private/loopback/link-local) in `normalizeBlueprint`; test it.
7. **P3-1** Apply `isTrustedExtensionPage` to `start_import`/`cancel_import` (and `start_ingest`), or document the trust decision; test it.
8. **P3-2** Replace the space-delimited de-dupe key with a collision-safe composite; test it.

---

VERDICT: FAIL
