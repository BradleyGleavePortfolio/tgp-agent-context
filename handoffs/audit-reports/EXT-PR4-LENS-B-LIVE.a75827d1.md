# EXT PR #4 — LENS B (independent, read-only, adversarial FULL P0–P3 audit)

- **Repo:** BradleyGleavePortfolio/tgp-importer-extension
- **PR:** #4 — "feat(replay): site-agnostic bounded autonomous multi-page import engine"
- **Expected head:** `a75827d1c0cf5452c1e924ddae4889c5b8b2f3f6`
- **Verified head:** `a75827d1c0cf5452c1e924ddae4889c5b8b2f3f6` ✅ (exact match)
- **Base / merge-base:** `a8563853758bc369b01d9f1f7e03a28db8a520ef` (main, squash-merge of PR #3) ✅
- **Branch commits:** 1 — `a75827d Bradley Gleave <bradley@bradleytgpcoaching.com>` (R3 identity ✅)
- **Constitution read:** `tgp-agent-context/AGENT_RULES.md` (R1→R107; gates R23/R74/R75/R109; precedence R1+R14).
- **Auditor:** Lens B, independent. Did NOT read Lens A output. Did NOT modify code. Did NOT merge.

## VERDICT: FAIL — P0=1 · P1=2 · P2=2 · P3=2

CLEAN requires all P0–P3 = 0. This PR is **objectively failing its own CI** at the exact
head and the PR body **falsely attests that all gates are green**.

---

## Reproduction (exact head, deterministic)

```
$ git rev-parse HEAD → a75827d1c0cf5452c1e924ddae4889c5b8b2f3f6
$ npm install → ok
$ npx vitest run → Test Files 26 passed, Tests 287 passed   ✅ (matches PR claim)

$ node scripts/check-banned.mjs → OK                                    exit 0 ✅
$ node scripts/check-flag-discipline.mjs → PAIRING_ENABLED=true OK      exit 0 ✅
$ node scripts/check-prod-loc.mjs
    prod LOC — prod_added=817 prod_removed=0 cap=600
    FAIL: added production JS 817 exceeds the per-PR cap of 600          exit 1 ❌
$ node scripts/check-test-ratio.mjs
    prod_added=817 test_added=1143 ratio=1.399 floor=2
    FAIL: PR diff test:src 1.399 is below the R74 floor of 2            exit 1 ❌
```

**Live CI at head (`gh api .../check-runs`):** `test: failure`. Job step board:
`Run tests: success` → `Banned-token net: success` → **`Production LOC budget: failure`**
→ `Flag discipline: skipped` → `Enforce R74 test:src: skipped`. CI is RED on the LOC gate.

**Per-file prod .js added (merge-base…HEAD), authoritative:**
```
background.js                       153
extractors/truecoach/blueprint.js    54
popup/popup.js                       39
shared/replay/blueprint.js          194
shared/replay/engine.js             263   ← single largest prod file
shared/replay/resolve.js             26
shared/replay/state.js               88
                             TOTAL  817
```
817 − 554 (the number the PR reports) = **263 = exactly `shared/replay/engine.js`** — the
engine, the flagship deliverable of this PR, is the file missing from the reported count.

---

## P0 — BLOCKING

### P0-1 · False green-gates / green-CI attestation in the PR body (R2 / R14 / R10)
**Where:** PR #4 description, "## Evidence" and "## Test plan".
**Claim:** *"Gates: banned OK · LOC `prod_added=554` cap 600 OK · flags OK · ratio `2.063`
floor 2.0 OK"* and *"CI: `npm test` (287 pass) + `npm run gates` (all green)"*.
**Reality at the exact head:**
- `npm run gates` **fails** — `check:loc` exits 1 (817 > 600) and `check:ratio` exits 1 (1.399 < 2.0).
- Live GitHub CI on `a75827d1` is **failing** (`Production LOC budget` step).
- The reported `prod_added=554` and `ratio=2.063` are **not reproducible**; they are the numbers
  you get only if you exclude `engine.js` (263 lines). `1143/554 = 2.063` — i.e. the ratio was
  computed against the undercounted 554, not the real 817 (`1143/817 = 1.399`).

A PR that attests "all gates green / CI passing" while CI is demonstrably red and two gates
exit non-zero is a **false attestation that would deceive the merge decision**. Under R2
("ship correctly, never ship-it-anyway") and R14 (merge gate), a fabricated green-evidence
block is a top-severity truthfulness violation regardless of the underlying code quality.
**Required:** correct the PR body to the true numbers AND bring the gates green (see P1-1/P1-2)
before this can be considered mergeable.

---

## P1 — BLOCKING

### P1-1 · Production LOC cap breach — 817 > 600 (R23 / R76; R9(g))
`scripts/check-prod-loc.mjs` exits 1: added production JS is **817**, 217 over the 600 cap.
CI fails here. R9(g) is explicit: *"going past the LOC cap, even by one line"* requires operator
approval — this is 217 lines over, unapproved. **Fix:** split into chained PRs (the constitution's
standing answer for "hyperscaler pattern vs LOC cap → split into chained PRs"), or obtain a
recorded operator LOC exception. The PR already names PR-C2 as a follow-up; the engine + adapter
+ wiring should be re-sliced so no single PR exceeds the cap.

### P1-2 · Test:src ratio below floor — 1.399 < 2.0 (R74 / R100.A1)
`scripts/check-test-ratio.mjs` exits 1: `1143 / 817 = 1.399`, below the 2.0 floor
(needs ≥ 1634 added test lines for 817 added prod lines; short by 491). CI would fail this step
too (it is currently `skipped` only because the LOC step aborts the job first). No
`r100-test-density` exception label is present. **Fix:** add real behavioral test lines (not more
source-grep assertions — see P3-1) or reduce prod LOC via the split above.

---

## P2 — STRONG (should-fix before merge)

### P2-1 · Source-platform auth loss wrongly destroys the TGP session (correctness)
**Where:** `background.js:296-298` (source 401/403 → `throw new AuthLostError()`) →
`background.js:380-385` catch: `if (isAuthLost(err)) { await clearTokens(); broadcastAuthRequired("session expired — please sign in again"); ... }`.
**Bug:** `makeSourceFetchJson` raises `AuthLostError` when the **source platform** (TrueCoach)
returns 401/403. The `handleStartImport` catch treats *any* `AuthLostError` as a **TGP** session
loss: it calls `clearTokens()` (wiping the coach's TGP pairing tokens) and tells the coach
*"session expired — please sign in again"*. But the TGP session was fine — only the TrueCoach tab
lost auth. Effect: the coach is forced to re-pair with TGP for no reason and is shown a
misleading error. The two auth domains (source bearer/cookies vs TGP token) must not be
conflated. TGP-side auth loss is already handled correctly and separately inside `makeSender`
(the ingest 401 path). **Fix:** map source `AuthLostError` to a source-auth-required surface
(e.g. "your TrueCoach session expired — re-open the tab"), and do NOT call `clearTokens()` on it.

### P2-2 · Blueprint validation does not confine scheme/origin — overstated "fail-closed" (SSRF/defense-in-depth, forward-compat)
**Where:** `shared/replay/blueprint.js:143-149` (`normalizeBlueprint`) validates only that
`apiBase` *parses* as a URL (`void new URL(bp.apiBase)`), with no scheme allowlist (https-only)
and no origin/host allowlist; `background.js:293` fetches with `credentials: "include"`.
**Risk:** the engine is explicitly designed to consume blueprints from auto-inference (PR-C2)
for arbitrary/unknown platforms. The moment an *untrusted* blueprint reaches `normalizeBlueprint`,
a malicious `apiBase` (e.g. `http://169.254.169.254/…`, `http://internal…`, or any attacker
origin) would direct the coach's **cookie-bearing, credentialed** fetches off-origin — an SSRF /
credential-scope hazard. Method confinement (GET/HEAD) and `:param` `encodeURIComponent` are
correctly done, but origin/scheme are not.
**Reachability today:** NOT reachable — `resolveBlueprint` returns only the hardcoded
`truecoachBlueprint()` (https, app.truecoach.co) and every other platform yields `null`. So this
is not exploitable in this PR. It is flagged because (a) the PR/blueprint docstrings claim the
normalizer "fails closed BEFORE any network call" — that guarantee is **overstated** (it does not
constrain *where* the call goes), and (b) PR-C2 will make this reachable. **Fix now or gate C2:**
enforce `url.protocol === "https:"` and an explicit origin allowlist in `normalizeBlueprint`
before any inferred blueprint is accepted.

---

## P3 — MINOR / OBSERVATIONS

### P3-1 · popup-start-import.spec.js is grep-only, not behavioral (test reality, R40)
**Where:** `test/popup-start-import.spec.js` — 6 "tests", 53 test lines, all `readFileSync` +
`.toMatch(/regex/)` against `popup/popup.js` / `popup.html` source text. They assert the source
*contains substrings* (`kind: "start_import"`, `startBtn.hidden = !sessionReady`, etc.), never
execute the popup, and would still pass if the wiring were logically broken as long as the
strings exist. The file is honest about this ("no jsdom … pinned via source assertions"), but
these 53 lines count toward the R74 ratio (P1-2) while proving no behavior. Prefer jsdom-driven
behavioral tests, or don't credit them as coverage.

### P3-2 · "Real end-to-end" Start Import may not authenticate against live TrueCoach (integration truthfulness)
**Where:** `popup/popup.js:86` sends `{ kind: "start_import", url }` with **no `sourceToken`**;
`background.js:362,367` → `makeSourceFetchJson("")` sends only `credentials: "include"` (no
`Authorization` bearer). The existing verification path (`TrueCoachExtractor`) is bearer-driven
(`extractors/truecoach/net.js`), and nothing in the tree ever sends a `sourceToken` (nor a
`start_ingest`, nor handles the content script's `platform_tab_live`). If TrueCoach's
`/proxy/api` requires the bearer the extractor uses, the "real multi-page crawl" 401s → fails
closed immediately. Cookie-only auth to the same-origin proxy *may* suffice, so this is
unverifiable without a live tab — hence P3 not P2 — but the PR's "drives a real multi-page crawl"
/ "no dead mock" framing is optimistic and should be caveated or the bearer capture wired.

---

## What is genuinely good (verified, not blocking)

- **Site-agnostic core is real:** `shared/replay/engine.js` makes zero `chrome.*` calls; all IO
  (`fetchJson`, `emit`, `sleep`, `now`, `signal`) is injected. TrueCoach lives only in
  `extractors/truecoach/blueprint.js` as data. Product shape matches the mandate.
- **Boundedness/safety invariants are implemented and tested (287 pass):** per-request timeout,
  bounded retry (`maxAttempts`, 5xx/timeout retryable, malformed→skip-no-retry), page/entity/
  per-step budgets, per-step `visited` URL cycle+duplicate guard, awaited-emit backpressure,
  `(entityType,sourceId)` idempotent de-dupe, GET/HEAD refused-at-parse otherwise, prompt abort.
- **`:param` templates use `encodeURIComponent`** (no path/template injection); cursor/page params
  go through `URLSearchParams` (encoded). Fan-out `forEach` must reference an earlier `collectAs`
  (validated), preventing dangling fan-out.
- **Message-router authz for secrets:** `session_established` requires `isTrustedExtensionPage`
  (extension-origin, no tab), not just id match — correctly rejects a compromised content script
  forging tokens. `onMessageExternal` is not registered.
- **R3 identity clean; banned-silent-catch gate clean; PAIRING_ENABLED=true flag gate clean.**
- **State table** (`shared/replay/state.js`) is a pure, illegal-transition→null machine covering
  ready/learning/confirming/importing/complete/failed/cancelled.

---

## Blocking IDs
`P0-1`, `P1-1`, `P1-2` (hard blockers). `P2-1`, `P2-2` strongly recommended before merge.

## VERDICT: FAIL — P0=1 · P1=2 · P2=2 · P3=2
