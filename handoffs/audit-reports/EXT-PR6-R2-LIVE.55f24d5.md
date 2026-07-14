# EXT PR #6 — r2 dual-lens LIVE audit (post fixer-r1)

- **Repo:** tgp-importer-extension (BradleyGleavePortfolio)
- **PR:** #6 — "feat(replay): wire start_import orchestration + Start Import CTA (PR-C1b)"
- **Head (verified live, 3 ways):** `55f24d57c625cbd2745ad3fc9226e6d41168d02a`
  - `git rev-parse HEAD` = 55f24d5; `git fetch origin feat/replay-c1b-wiring` FETCH_HEAD = 55f24d5; `gh pr view 6` head = 55f24d5, state OPEN, base main.
- **Base main / merge-base:** `5eabeec0ee53735753059f72581148052c9f2ac4` (the R3-INC-1 grandfathered tip; unchanged).
- **Auditor:** dual-lens (A = correctness+security; B = tests+contracts+architecture), independent + adversarial, read-only (R13). No fixes, no approval, no merge.
- **Round:** r2 — re-audit after fixer r1 addressed all six r1 findings.
- **Verdict: PASS / PASS — CLEAN. No P0–P3 in either lens. R14 merge gate met.** (Not merged / not self-approved — recorded for the operator.)

---

## VERDICT SUMMARY

| Severity | Lens A | Lens B |
|---|---|---|
| P0 | 0 | 0 |
| P1 | 0 | 0 |
| P2 | 0 | 0 |
| P3 | 0 | 0 |

Convergent CLEAN. R14 ("clear of ANY P0–P3 in any regard") **met** in both lenses.

---

## GATES (independently executed at `55f24d5`, clean workspace)

| Gate | Result |
|---|---|
| `check:banned` | **PASS** — banned-token net clean (source patterns + origin/main commit identity) |
| `check:loc` (CI cap 400) | **PASS** — `prod_added=398 prod_removed=34 cap=400` (margin 2 — at ceiling, see obs) |
| `check:flags` | **PASS** — `PAIRING_ENABLED=true` sole auth path, no dark-merged dead-end |
| `check:ratio` (R74) | **PASS** — `prod_added=398 test_added=1107 ratio=2.781 floor=2` |
| `npm test` (vitest) | **PASS** — **30 files / 489 tests**, all green (14.6s) |
| R3 identity | **PASS** — both PR commits `55f24d5` + `ab5dc61` author AND committer = Bradley Gleave <bradley@bradleytgpcoaching.com>; adversarial AI/agent/co-author token scan = 0 |

Diff scope (`5eabeec..55f24d5`): 16 files, +1522 / −36. Prod: `background.js` (+233 net path), `content/main.js`, `popup/popup.{html,js}`, `shared/replay/engine.js`, new `shared/replay/resolve.js`, new `extractors/truecoach/blueprint.js`. 10 test files (+1107).

Manual word-bounded banned sweep on added code (`as unknown as|as any|as never|@ts-ignore|@ts-nocheck|.catch(()=>{})|Coming soon`): **net 0**. (One raw substring hit — "w**as never** claimed" in a comment — is a false positive, not a `as never` cast; the extension is JS with no TS casts.)

---

## SIX r1 FIXES — root-fix verification (all CONFIRMED, each with adversarial test)

1. **Real ephemeral trusted-tab source-bearer handoff, no leakage.** `collectSourceToken(tabId, allowedOrigins)` requires a numeric tabId, re-reads the tab's **live** URL and requires its origin in the allowlist (fails closed on a navigated tab), messages the tab's content script `collect_source_token`, and accepts only `{ok:true, token:string}` — memory only. Content-side `wireCollector` answers **only** when `sender.id === runtime.id` (own worker); `readSourceBearer` returns the first JWT-shaped store value or `""`. Token flows solely into `makeSourceFetch`'s `Authorization` header (`credentials:"include"`); it never reaches a broadcast, `chrome.storage`, log, telemetry, or ingest payload (verified by grep + the "never leaks to any surface" test). Popup only sends `{kind,url,tabId}` — never handles the token.
   - Tests: "carries the source bearer / authenticates every source request", "absent source token sends no Authorization header", "never leaks to any surface / keeps the token out of broadcasts", and `wireCollector` "IGNORES a request from a foreign extension id / with no sender id / unrelated kind".
2. **`completeIngest` throws on non-2xx.** Captures `res`; `if (!res.ok) throw new Error(\`complete ${res.status}\`)`. `ingest_succeeded` is broadcast only **after** `completeIngest` resolves; a non-2xx complete → `ingest_failed`, never dishonest success.
   - Test: "reports ingest_failed and never broadcasts success when complete returns 500".
3. **Source 5xx status/category preserved via `lastSkipStatus`.** engine records `err.status` (number), `"malformed"` for `MalformedResponseError`, else `err.name`; carried on all return paths (normal + cancelled). `failDetail` surfaces "source responded <status>" — never a response body.
   - Tests: "keeps the numeric status when a 5xx exhausts retries", "records 'malformed'… never its bytes", "reflects the MOST RECENT skip".
4. **partial / degraded / truncated surfaced distinctly.** `complete → ingest_succeeded`; `partial → ingest_partial` with `partialDetail` ("some pages were skipped" / "reached the import safety limit" + record count). `popup.html` adds a distinct `.status-ingest_partial` style. Partial is never conflated with success.
   - Test: "finalises but reports ingest_partial (not success) when a page is skipped".
5. **TGP auth-loss unified terminal state.** `tgpAuthLost()`/`isTgpAuthLost()` typed error; `makeSender` throws it on retry-401 after `clearTokens()`, and its `onAuthLost` broadcasts the friendly "session expired" state. Both `handleStartIngest` and `handleStartImport` catch blocks early-return on `isTgpAuthLost` so the raw error never overwrites the friendly state. Distinct from **source** `AuthLostError` (`isAuthLost`) → source re-login prompt, **without** clearing TGP tokens (fail-closed).
   - Tests: "keeps the 'session expired' state and does not overwrite it", "maps a source 401/403 … keeps the TGP tokens", "surfaces a source 500 as a generic ingest failure (NOT a sign-in prompt)".
6. **Single-flight shared across `start_import` + legacy `start_ingest`.** `importInFlight` set **synchronously** in the router (before the async handler, so a pre-await race cannot pass), shared by both entrypoints, cleared in `.finally()`; a second concurrent run is rejected `{ok:false,error:"import_in_progress"}`.
   - Tests: "rejects a start_ingest while a start_import is in flight" (and the reverse + double start_ingest), "clears the guard after a run settles".

---

## SECURITY (Lens A) — CLEAN

- **Trusted-page sender gate:** `isTrustedExtensionPage` requires `sender.id === chrome.runtime.id` **AND** `sender.tab === undefined` **AND** `sender.url` prefix `chrome-extension://<id>/`. This defeats a compromised content script (which would carry `sender.tab`) — id-match alone is insufficient by design. Tested: "drops a foreign extension id", "rejects a content-script-shaped sender (same id + a tab) as untrusted".
- **SSRF confinement:** crawl origin allowlist is derived from the **observed https tab origin** (`tabOriginAllowlist`, https-only, else fail closed) and re-validated against the blueprint `apiBase` in `normalizeBlueprint` before any fetch. No hardcoded competitor map — site-agnostic. Tested: "confines the crawl to the observed tab origin (never an off-origin host)".
- **Fail-closed everywhere:** unsupported site, non-https origin, unknown platform (`UnknownPlatformError`), absent TGP token, absent/navigated source tab, source 401/403 → the crawl either never starts or stops without leaking, and never fabricates success.
- **No PII/token in telemetry or terminal detail:** `partialDetail`/`failDetail` carry only counts + a numeric status/category.

---

## ARCHITECTURE / CONTRACTS (Lens B) — CLEAN

- **Site-agnostic engine preserved:** the only site-specific seam is `resolveBlueprint` (data-only registry of blueprint **factories** → fresh per run). `truecoachBlueprint` is pure data (endpoint roles, id fields, page-pagination descriptor, one `forEach` fan-out edge) — zero executable extraction logic; a declared subset of the hand-mapped `TrueCoachExtractor`, proving the generic engine performs list→paginate→fan-out under the coach's own session.
- **`runReplay` contract intact:** `{status, pages, entities, truncated, degraded, lastSkipStatus}`; `lastSkipStatus` additive (back-compatible); status ∈ complete/partial/failed/cancelled.
- **Test module hygiene:** prod modules (`content/main.js`, `popup/popup.js`) export their seams and guard live wiring behind `typeof chrome/document !== "undefined"`, so tests drive the **real** send/collect paths without load-time side effects.

---

## OBSERVATIONS (not findings)

- **LOC at ceiling:** `prod_added=398` vs the CI pull_request cap of **400** — margin of 2. Passes, but any follow-up prod line risks the R76 gate; a future PR should budget accordingly.
- **`readSourceBearer` heuristic:** returns the first JWT-shaped value across `[sessionStorage, localStorage]`. If a non-source JWT sits earlier in a store, the wrong token could be sent → the source responds 401 → the run fails closed (no leak, no false success). Acceptable by design; noted for future hardening (e.g. a key-name hint) if a platform stores multiple JWTs.

---

## GATE EXECUTION NOTE

All gates ran locally at the exact head `55f24d5` in the existing workspace (`node_modules` present; no re-clone needed — the reported managed-clone failure did not affect the already-materialized checkout, whose head was verified three ways). Unlike the mobile M2 audit, there was **no** concurrent npm-cache contention here; `npm run gates` and `npm test` completed cleanly and their results are asserted on the auditor's authority.

---

VERDICT: **PASS / PASS — CLEAN (0 × P0–P3).** Merge-ready per the audit. Auditor does not merge or self-approve (R13/R14); handed to the operator for the identity-safe manual-squash + lease-safe fast-forward merge procedure.
