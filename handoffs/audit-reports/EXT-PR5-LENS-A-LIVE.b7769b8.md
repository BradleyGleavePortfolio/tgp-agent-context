# EXT-PR5 — LENS A (adversarial, read-only) — LIVE

- **PR:** #5 — `feat(replay): bounded autonomous replay engine (PR-C1a)`
- **Head (resolved full SHA):** `b7769b870ba931390e2a74f05764bcb4f5285134` (short `b7769b8` — **matches**, no mismatch)
- **Base:** PR #4 head `16a03c5c184713e9fb6e993cdcf3cb1be4b68e89` (merge-base(PR5,PR4) == PR4 head → PR5 stacks directly on PR4)
- **Diff:** `shared/replay/engine.js` (+285), `test/replay-engine.spec.js` (+625), `test/replay-engine-edge.spec.js` (+334) — 3 files, +1244, −0
- **Scope:** read-only. No modify / no merge. Doctrine: `docs/AUTO_DISCOVERY.md` §2 Layer 3, §9; `docs/DESIGN.md` §7; PR #4 contract (`shared/replay/blueprint.js`, `shared/replay/state.js`, `shared/net.js`, `extractors/_interface.js`).

## VERDICT: **NOT CLEAN** — 1× P2, 3× P3 (0× P0, 0× P1)

The engine is well-built: it terminates on every input I threw at it, fails closed on auth loss, uses safe methods only, does no logging, contains no platform-specific logic, no `chrome.*`, and no control/NUL chars. All 373 tests pass. The findings below are real defects, not style nits, but none is a P0/P1.

---

## P0 — none
## P1 — none

---

## P2

### P2-1 — Run-global `visited` set silently drops entities from steps that share an endpoint URL, and reports `complete` (silent data loss + dishonest terminal status)

**Root cause.** `visited` is declared once at run scope (`engine.js:91`, `const visited = new Set(); // full request URLs already fetched (cycle guard)`) and is consulted/populated across **all** steps and **all** fan-out contexts (`engine.js:180-183`). This directly contradicts the module's own documented invariant:

> `engine.js:11` — `//   - Per-step visited-URL set -> cycles and duplicate pages cannot loop.`

The set is **not** per-step; it is per-run. The docstring is therefore untruthful, and the over-broad scope causes a correctness bug.

**Impact.** Two steps that legitimately hit the **same URL** to extract **different arrays** (e.g. a `/dashboard` endpoint returning `{clients:[…], programs:[…]}`, which is exactly the multi-shape-cluster case §2 Layer 2 auto-inference produces) collide: the second step hits `visited.has(url)` and `return`s before fetching, emitting **nothing**. Worse, it sets neither `degraded` nor `truncated`, so the run is reported as **`status:"complete"`** — masking the loss. This violates the honest-status doctrine the engine claims (`engine.js:270-283`, "only a whole, untruncated walk is complete") and the ≥98% recall success metric (`AUTO_DISCOVERY.md §8`).

**Live proof (PROBE E):**
```
steps: [ {clients  /dashboard itemsPath[clients]}, {programs /dashboard itemsPath[programs]} ]
server: /dashboard -> { clients:[c1], programs:[p1,p2] }
result: {"status":"complete","pages":1,"entities":1}
emitted: ["client:c1"]              // p1, p2 — a whole entity type — silently dropped, reported complete
```

**Why P2 (not P1/P3).** Silent whole-entity-type loss reported as success is serious. It is conditioned on a blueprint with two same-URL steps: the current hand-resolved flagship blueprint uses distinct endpoints so it will not trigger *today*, but this engine exists specifically to consume auto-inferred blueprints (PR-C2), where multi-array endpoints → same-template steps is realistic. Bounded blast radius (one coach's import, no security/integrity breach beyond under-extraction) keeps it below P1.

**Fix direction (advisory only — do not apply in this lens).** Scope the visited guard to the pagination context (per `runContext` invocation, matching the documented "per-step" wording), so cross-step / cross-parent URL reuse is allowed while intra-context cursor/page cycles are still broken. Idempotency across steps is already guaranteed independently by the `emitted` `(entityType, sourceId)` set (`engine.js:92,201-205`).

---

## P3

### P3-1 — `forEach` step with a static (no-`:param`) template fans out exactly once; remaining parent ids silently skipped, reported `complete`

Same root cause as P2-1. `normalizeStep` requires a `forEach` set *only* when the template has a `:param` (`blueprint.js:177-180`) but does **not** require a `:param` when `forEach` is set. A `forEach` step whose template is static therefore builds the identical URL for every parent id; the global `visited` set lets only the first parent's fetch through and drops the rest — again with `status:"complete"`.

**Live proof (PROBE F):** 3 parent ids `[a,b,c]`, child template `/all-kids` (static) → `calls=2` (one parents page + one child fetch), emitted `["parent:a","parent:b","parent:c","kid:k2"]` — kids for parents b and c never fetched; reported complete. P3 because a static-template fan-out is a degenerate/nonsensical blueprint, but it is admitted by the normalizer and fails silently rather than loudly.

### P3-2 — `allowedOrigins` SSRF allowlist cannot be threaded through `runReplay` (re-normalization drops `opts`)

`runReplay` calls `normalizeBlueprint(blueprint)` with **no second argument** (`engine.js:87`), so `allowedOrigins` is always `null` inside the engine and only the *intrinsic* host checks (https-only, no IP-literal / loopback / link-local, no embedded creds) run. `blueprint.js:32-37,60-80` documents an origin-allowlist capability "injected by the caller"; the engine provides no parameter to inject it, and re-normalizing discards any allowlist a caller applied upstream.

**Live proof (PROBE D):** a public, non-allowlisted origin `https://evil.example.com/api` is accepted by `runReplay` and crawled (`status:"complete"`). **Not currently exploitable**: (a) the intrinsic checks block the classic SSRF pivots (metadata IP, loopback), (b) correct callers validate origins before calling, and (c) untrusted auto-inference (PR-C2) is not yet wired. Recorded as forward-looking hardening: either accept `allowedOrigins`/`opts` on `runReplay` and forward it, or accept a pre-normalized blueprint and skip re-normalization, so the allowlist dimension is not silently lost.

### P3-3 — Self-referential `collectAs === forEach` produces live-array growth in the fan-out loop (budget-bounded)

A blueprint where step B has `forEach:"X"` **and** `collectAs:"X"` is admitted by the normalizer (the `forEach`-references-earlier-`collectAs` check passes because an earlier step produced "X", and B's own `collectAs` is added afterwards — `blueprint.js:231-239`). In the engine, the main fan-out loop iterates `idSets.get("X")` (`engine.js:250-251`) while `runContext` appends new ids into the **same** array (`collect = nextIdSet("X")`, `collect.push(...)` — `engine.js:156,209`). Because JS `for…of` over an array observes appended elements, each child page's new ids extend the iteration → a self-amplifying crawl.

**Live proof (PROBE A):** 1 seed id, each child inventing a new id → **terminates** at `maxPages=20` with `status:"partial", truncated:true`. P3 (not P0) because the page/entity **budgets always terminate it** — the safety net holds — but the crawl can far exceed the declared id set, which is surprising and unintended.

---

## Below-P3 / informational (recorded for completeness, not counted in verdict)

- **I-1 — per-page item count is unbounded.** `maxEntities`/`maxPages` are checked *between* pages (`engine.js:100,168`); a single response's `items` array is materialised, deduped into `batch`, and its keys added to `emitted` in one shot (`engine.js:191-211`). A hostile/huge single page can spike worker memory well past `maxEntities`. The docstring's "entities never buffer unbounded in memory" (`engine.js:12-13`) is true *across* pages (backpressure via awaited `emit`) but does not bound a single page. Low concern: blast radius is the coach's own worker; response size is de-facto limited by the platform.
- **I-2 — `fetchJson` resolving `null` is conflated with a skip.** A `null` resolution is treated as a skipped/degraded page (`engine.js:187-189`), not an empty body. `fetchJson`'s contract is "parsed body or throw", so a top-level JSON `null` is degenerate; the engine errs toward the honest `degraded` direction. Benign.

---

## Truthfulness / gate matrix (verified live at b7769b8)

| Claim | Result | Evidence |
|---|---|---|
| Head SHA == b7769b8 | ✅ | `git rev-parse origin/pr/5/head` = `b7769b870ba9…` |
| prod LOC ≤ 400 | ✅ | `check-prod-loc` base=PR4 → `prod_added=285` (cap 600; brief bar 400 — both met) |
| test:src ratio ≥ 2 | ✅ | `check-test-ratio` base=PR4 → `959/285 = 3.365` |
| tests present & green | ✅ | `npm test` → 23 files, **373 passed**; engine specs (959 test LOC) green |
| CI present | ✅ | `.github/workflows/ci.yml` runs tests + banned/prod-loc/flag/ratio gates |
| R3 commit identity | ✅ | single commit `b7769b8` authored+committed `Bradley Gleave <bradley@…>`, no AI/co-author tokens; `check-banned` clean |
| docs anchor | ✅ | engine cites `docs/AUTO_DISCOVERY.md §2 Layer 3` / §9 (file exists, anchors real) |
| 100x boundedness | ✅ | dedicated test green; PROBES A/E/F all terminate under budget |
| no platform logic | ✅ | grep for 10 competitor names → none |
| no `chrome.*` | ✅ | none (only the docstring says it makes none) |
| safe methods only | ✅ | `normalizeBlueprint` (re-run inside `runReplay`) rejects non-GET/HEAD at parse time |
| secret / logging | ✅ | engine performs **no** logging; auth handled entirely by injected `fetchJson` |
| NUL / control chars | ✅ | none in any of the 3 PR files |
| dead code | ✅ | every function (`fillTemplate`,`buildUrl`,`isRetryable`,`pace`,`fetchPage`,`nextIdSet`,`runContext`, predicates) is reached |
| docstring truthful | ❌ | `engine.js:11` "Per-step visited-URL set" — the set is run-global (see **P2-1**) |

### Merge-ordering caveat (not a PR5 defect)
`check-prod-loc` measured against **`main`** reports `prod_added=641 > cap 600 → FAIL`, because that spans PR4+PR5. Against PR5's real base (PR4 branch) it is `285 → OK`. In CI, `GITHUB_BASE_REF` resolves to PR5's target branch; the gate passes **iff PR5 targets the PR4 branch** (or PR4 is merged to main first). If PR5's GitHub base is set to `main` while PR4 is unmerged, the prod-LOC gate will red. Flagging for the merge queue, not scoring it against the engine.

---

## Attack coverage (what I tried that held)
Traversal termination ✅ · cursor cycle (visited guard) ✅ · page cycle ✅ · dedupe delimiter collision (JSON tuple) ✅ · budget off-by-one (pages == cap exactly) ✅ · maxPagesPerStep boundary ✅ · malformed → skip no-retry ✅ · retry exhaustion (timeout/5xx) bounded ✅ · non-auth 4xx no-retry ✅ · 401/403 fail-closed no-further-requests ✅ · abort pre-run / mid-emit / between-steps ✅ · fetcher throwing AbortError ✅ · backpressure (emit awaited before next fetch) ✅ · idempotency across pages/retries ✅ · template `:param` fill + `encodeURIComponent` (no path-traversal / no re-injection) ✅ · query-param encoding ✅ · non-object items skipped ✅ · missing idField synthesises distinct dedupe key ✅ · partial/degraded/failed status matrix ✅ · maxAttempts=0 (PROBE C, safe skip) ✅ · re-normalization idempotent ✅.

**Broke:** shared-endpoint steps (P2-1), static `forEach` (P3-1), origin-allowlist not threadable (P3-2), self-ref fan-out growth (P3-3).

---
*Lens A · read-only · no repo modification · b7769b8 · base 16a03c5*
