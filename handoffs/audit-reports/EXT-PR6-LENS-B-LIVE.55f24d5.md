# EXT PR #6 (EXT-C1b) — Lens B LIVE Audit r2 (tests + contracts + architecture)

- **Repo:** tgp-importer-extension (BradleyGleavePortfolio)
- **PR:** #6 — "feat: replay C1b wiring (autonomous source-bearer import)"
- **Head (verified live):** `55f24d57c625cbd2745ad3fc9226e6d41168d02a`
- **Base main / merge-base:** `5eabeec0ee53735753059f72581148052c9f2ac4`
- **State / mergeable:** OPEN / MERGEABLE (GitHub); R124 both-ways == `55f24d5` ✓
- **Auditor:** Lens B (independent, adversarial), read-only (R13). No fixes, no approval, no merge.
- **Verdict:** **CLEAN** — 0 × P0–P3. Convergent with Lens A.

---

## VERDICT SUMMARY

| Severity | Count |
|---|---|
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| P3 | 0 |

Convergent CLEAN/CLEAN with Lens A. R14 axis met on both lenses; proceed to operator merge procedure (identity-safe manual squash + lease-safe fast-forward; never GitHub squash; never force-push published main).

---

## TEST-SUITE INTEGRITY (independently executed at `55f24d5`)

- **`npm test` (vitest run):** **30 files passed / 489 tests passed**, exit 0, 14.32s. No skipped/todo/only leakage observed in the summary.
- **r1-fix coverage — each fix carries adversarial tests exercised at this head:**
  - `test/start-import-hardening.spec.js` (217 added) — single-flight cross-entrypoint rejection, completeIngest non-2xx throw, TGP vs source auth-loss branching, unsafe-origin rejection.
  - `test/start-import.spec.js` (350 added) — end-to-end start_import happy + failure paths.
  - `test/content-collector.spec.js` (87 added) — `readSourceBearer` JWT scan + `wireCollector` sender-id gate (rejects foreign sender / non-collect messages).
  - `test/popup-start-import.spec.js` (127 added) — CTA drives the REAL send path, button disable/re-enable on settle, tabId passed through.
  - `test/replay-lastskip.spec.js` (81 added) — `lastSkipStatus` set to status number vs `malformed` vs error-name category on skip.
  - `test/replay-resolve.spec.js` (82 added) — fresh-blueprint-per-run factory, `UnknownPlatformError` fail-closed.
  - `test/replay-truecoach-blueprint.spec.js` (99 added) — blueprint shape/behavior.
  - `test/helpers/source-tab.js` + `test/helpers/background-mock.js` — drive the real message router / tab-collector seams (no over-mocking of the code under test).
- **Adversarial angle:** tests assert the *distinct* terminal states (`ingest_partial` ≠ `ingest_succeeded`), the token-less fail-closed path, and the trusted-sender rejection — i.e. they would fail if the fixes were reverted. No test trims assertions to pass; ratio floor is met by real coverage, not padding.

---

## GATES (independently executed)

- **check:banned** → OK (source patterns + R3 commit identity).
- **check:loc** → `prod_added=398 prod_removed=34 cap=600` → OK.
- **check:flags** → `PAIRING_ENABLED=true` sole auth path → OK.
- **check:ratio** → `398 prod / 1107 test = 2.781` (floor 2) → OK.
- **`npm run gates`** aggregate → exit 0.

---

## CONTRACT & ARCHITECTURE

- **Backend contract.** `makeSender` posts to `/api/scout/ingest` with the camelCase `makeScoutIngestBody` envelope, entities VERBATIM (ScoutEntityDto 1:1, R80-CLARIFY-1); `completeIngest` posts `{intent_id, platform}` to `/api/scout/ingest/complete` and requires a 2xx ack. No client-side re-mapping that would 400.
- **Site-agnostic seam.** `shared/replay/resolve.js` is the ONLY site-specific hook — a data-only blueprint registry consumed by the site-agnostic `runReplay`; competitor knowledge lives in blueprint data, not the engine. Fresh factory per run avoids cross-run mutable state.
- **MV3 lifecycle.** Capture lifecycle wired once at SW startup; bounded `fetchWithTimeout` prevents a hung complete/crawl from pinning the worker; `AbortController` threads cancel/auth-loss aborts through the engine.
- **Auth model.** Two independent bearer domains kept strictly separate: TGP session (stored, refreshable, cleared on double-401) and SOURCE bearer (memory-only, per-crawl, never cleared on loss, confined to allowedOrigins). Clean separation prevents a source failure from destroying the TGP session and vice-versa.
- **R3 identity.** `ab5dc61` + `55f24d5` both authored AND committed by Bradley Gleave — CLEAN. (Grandfathered R3-INC-1 on main tip `5eabeec` is untouched, accepted, not rewritten.)

---

## CLEAN — no P0–P3

All six r1 findings root-fixed with covering tests; gates green; contract intact; architecture coherent; no new defect on the tests/contracts/architecture axis.

---

VERDICT: CLEAN
