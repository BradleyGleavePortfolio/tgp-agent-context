# EXT PR #5 — LENS B (independent, read-only, adversarial FULL P0–P3 audit)

- **Repo:** BradleyGleavePortfolio/tgp-importer-extension
- **PR:** #5 — "feat(replay): bounded autonomous replay engine (PR-C1a)"
- **Expected head (pinned):** `b7769b870ba931390e2a74f05764bcb4f5285134`
- **Verified head (pinned):** `b7769b870ba931390e2a74f05764bcb4f5285134` ✅ (this audit is pinned here)
- **LIVE PR head (`gh pr view 5`):** `dfd67be7f3464b770c46bcbcd463b661081c34f2` ⚠️ **HEAD MISMATCH** — the
  live branch is **one commit ahead** of the pinned head. `dfd67be7` = child of `b7769b8`, a
  CI-only change ("ci: scope per-PR diff gates to pull_request events"), +10 LOC in `ci.yml`, no
  src/test change. See P2-3 — that commit *fixes* a CI defect present at the pinned head.
- **Base:** `feat/v03-autonomous-replay-engine` (PR #4), tip `16a03c5` — stacked/chained PR.
- **Merge-base with main:** `a8563853` (main = squash-merge of PR #3).
- **Branch commit (pinned, PR #4 base…head):** 1 — `b7769b8` authored+committed `Bradley Gleave <bradley@bradleytgpcoaching.com>` (R3 ✅, no AI/co-author tokens).
- **Constitution read:** `tgp-agent-context/AGENT_RULES.md` (severity legend L529; gates R23/R74/R75/R76/R109; R2/R14 honesty).
- **Auditor:** Lens B, independent. Did **not** read any Lens A output (`ext_pr5_a.json` / `EXT-PR5-LENS-A*` left unread). Did **not** modify code. Did **not** merge.

## VERDICT: FAIL — P0=0 · P1=0 · P2=3 · P3=3

CLEAN requires all P0–P3 = 0. The engine is well-built, honestly bounded, genuinely
site-agnostic, and its tests are behavioral (not grep-only). But three should-fix (P2) issues and
three minor (P3) issues remain, so it is **not CLEAN**. No P0/P1: no security breach, no reachable
data loss, no false green-gate attestation (the PR's counts reproduce at the declared base).

---

## Reproduction (pinned head `b7769b8`, deterministic)

```
$ git rev-parse HEAD → b7769b870ba931390e2a74f05764bcb4f5285134
$ npm install → ok
$ npx vitest run → Test Files 23 passed, Tests 373 passed            ✅ (matches PR body)

# Gates scoped to the DECLARED base (PR #4 branch 16a03c5) — the pull_request path:
$ RATIO_BASE=16a03c5 node scripts/check-banned.mjs        → OK        exit 0 ✅
$ RATIO_BASE=16a03c5 node scripts/check-prod-loc.mjs      → prod_added=285 cap=600 OK   exit 0 ✅
$ RATIO_BASE=16a03c5 node scripts/check-test-ratio.mjs    → ratio=3.365 floor=2 OK      exit 0 ✅
$ node scripts/check-flag-discipline.mjs                  → PAIRING_ENABLED=true OK      exit 0 ✅

# Gates as a raw PUSH build would run them at b7769b8 (no GITHUB_BASE_REF → base=origin/main):
$ node scripts/check-prod-loc.mjs   → prod_added=641 cap=600  FAIL   exit 1 ❌  (see P2-3)
```

Diff = `shared/replay/engine.js` (+285 prod) · `test/replay-engine.spec.js` (+625) ·
`test/replay-engine-edge.spec.js` (+334). No NUL/control bytes in any of the three files.
Purely additive; `engine.js` imports the base-PR contract (`blueprint.js`), never the reverse.

---

## P0 — none.
## P1 — none.

---

## P2 — STRONG (should-fix before merge)

### P2-1 · Global `(entityType, sourceId)` dedupe silently drops legitimately-distinct fan-out entities (latent data loss)
**Where:** `shared/replay/engine.js:186-199` — `emitted` is a single run-wide `Set` keyed by
`JSON.stringify([step.entityType, dedupeId])`; a key already present is `continue`d (dropped).
**Bug:** the key carries **no parent/fan-out context**. In a `forEach` step (a first-class,
tested feature of this very PR — `/clients/:id/workouts`), if a child id is unique only *within
its parent* (a very common API shape: workout `#1` under client A and a different workout `#1`
under client B), the second entity collides on `["workout","1"]` and is **silently swallowed**.
The run then reports `status:"complete"`, `degraded:false`, `truncated:false` — i.e. **data loss
presented as a whole, clean import.** The engine's own invariant ("idempotent … a retried or
replayed page never double-emits") is actually served by the `visited` URL set (which already
prevents any URL being fetched twice); the extra cross-step emitted-set dedupe over-reaches from
"same page twice" into "same identity across different contexts," which is not sound for
parent-scoped ids.
**Reachability today:** none — the engine is not wired into `background.js` and no fan-out
blueprint with parent-scoped ids exists yet (only the base normalizer ships; PR-C1b/PR-C2 supply
blueprints). Rated **P2** on reachability, consistent with the PR #4 Lens-B SSRF precedent, but
the *impact-if-reached is data loss* and the flagship "site-agnostic, walks MANY pages" claim
makes fan-out a primary use.
**No test covers it:** the suite tests parent-id dedupe and same-`(type,id)` repeat dedupe, but
never two distinct children sharing an id under different parents.
**Fix:** scope the dedupe key to the fan-out context (include the parent `id` / the request `url`
for `forEach` steps), or restrict the emitted-set to per-context and rely on `visited` for
cross-page idempotency. Add a regression test for the collision case.

### P2-2 · Engine emits `{sourceId, payload}`, not the LOCKED envelope; docstring overstates conformance
**Where:** `engine.js:3-4` docstring — *"emits the locked `_interface.js` envelopes"* — vs
`engine.js:196` `batch.push({ sourceId: …, payload: item })`.
**Bug:** the authoritative, LOCKED envelope (`extractors/_interface.js`, `makeEntity`, per
R80-CLARIFY-1) is `{ sourceId, sourcePlatform, capturedAt, payload }`. The engine emits only two
of the four fields — it never imports/calls `makeEntity`, never stamps `sourcePlatform` (trivially
available as `bp.platform`) or `capturedAt` (trivially available via the injected `now()`). The
docstring's claim that it "emits the locked envelopes" is therefore **false as written**.
**Impact:** if the PR-C1b wiring trusts that claim and forwards batches verbatim, entities reach
the backend `ScoutIngestDto` without provenance. Downstream *can* recover both fields (the adapter
knows the platform and can stamp a timestamp), so this is not reachable data corruption today —
hence P2, not P1 — but the misleading contract claim on the flagship file is a real trap for the
next builder.
**Fix:** either stamp the full `makeEntity` envelope in the engine (platform from `bp.platform`,
`capturedAt` from `now()`), or correct the docstring to "emits `{sourceId, payload}` pairs that
the injected `emit` stamps into locked envelopes."

### P2-3 · At the pinned head, the branch's own push-triggered CI fails the Production-LOC gate (641 > 600)
**Where:** `.github/workflows/ci.yml@b7769b8` runs `check-prod-loc.mjs` on **every** trigger
(`on: push: branches:["**"]` *and* `pull_request`). On a raw push there is no `GITHUB_BASE_REF`, so
`resolveBase()` falls back to `origin/main`; a **stacked** branch is then measured against main and
sums the whole stack: `prod_added=641 > cap 600 → exit 1`. Reproduced locally (see above).
**Effect:** the push-event CI run on commit `b7769b8` is **red** on "Production LOC budget", even
though the authoritative pull_request-scoped run is green (285 < 600). A red check sits on the
exact audited commit.
**Mitigation / status:** the *immediately following* commit `dfd67be7` (the current live PR head,
outside this pinned scope) fixes precisely this by gating the two per-PR diff gates with
`if: github.event_name == 'pull_request'`. So the defect exists **only** at the pinned head and is
already resolved on the live branch. Flagged for honesty because the audit is pinned to `b7769b8`
and "all CI green" is not true there. **Re-audit at `dfd67be7`** should clear this.

---

## P3 — MINOR

### P3-1 · `progress[i].total` is meaningless — always equals `sent`
**Where:** `engine.js:203-204` — `progress[stepIndex].total = progress[stepIndex].sent`. The
`total` field never holds a real total (unknown up-front for an autonomous crawl); it just mirrors
`sent`. A consumer wiring a progress bar to `sent/total` gets a constant 100%. Either drop the
field or document that `total` is unknowable and always tracks `sent`.

### P3-2 · Synthetic `sourceId` for id-less items embeds the full request URL (incl. cursor/query token)
**Where:** `engine.js:190` — when an item lacks `idField`, `dedupeId = \`${url}#${batch.length}\``
and this becomes the emitted `sourceId` (`engine.js:196`). `url` includes the query string, so an
opaque **cursor/pagination token** (potentially session-bearing) is written into the stored
`sourceId` of every id-less entity — a minor data-hygiene / secret-surface leak into persisted
data. Prefer a URL-free synthetic key (e.g. `${step.id}#${page}#${index}`) or the path without
query.

### P3-3 · `maxPagesPerStep` is enforced per fan-out *context*, not per step — name overstates the bound
**Where:** `engine.js:130` `pagesThisStep` is declared inside `runContext`, which runs **once per
parent id** for a `forEach` step. So a step fanned out over N parents may fetch up to
`N × maxPagesPerStep` pages; the only real ceiling is the global `maxPages`. Termination is still
guaranteed (global cap holds, honestly `truncated`), but the budget name misleads anyone tuning
per-step limits. Rename to `maxPagesPerContext` or enforce a true per-step accumulator.

---

## Observations (non-blocking — verified, not counted)

- **Engine is dead code at this head.** `runReplay` is exported but imported nowhere in production
  (`grep` confirms: only the tests import it). This is an acceptable chained-PR slice — the PR body
  scopes wiring to PR-C1b — but nothing in the engine is reachable in the shipped extension yet;
  all P2/P3 above are latent until wiring lands.
- **Page-pagination halts the *entire remaining walk* on one skipped mid-list page.** A malformed /
  retry-exhausted page yields `items=[]`, which the page-style loop treats as end-of-list
  (`engine.js:213-217`), so pages after the first failure are never fetched. This is **honest**
  (the run is marked `degraded → partial`, tested) and defensible (a null body is indistinguishable
  from a true empty page), but a single transient 5xx on page 2 loses pages 3…N. Worth a comment /
  future "continue past a skipped page" option; not a bug.
- **Security posture of the engine is clean:** `:params` filled with `encodeURIComponent` (path
  traversal / `?`/`#` injection blocked), query via `URLSearchParams.set` (encoded), origin/scheme
  confinement inherited from the base `blueprint.js` normalizer, safe methods only, no `chrome.*`,
  no logging of tokens, `AuthLostError` fails closed and propagates, abort returns `cancelled`.
- **Tests are genuinely behavioral** (injected fetch/emit/clock/signal; assert emitted ids, call
  counts, ordering, status matrix). Not grep-only. test:src = 3.365 (well above the 2.0 floor).
  R3 identity clean on the single pinned commit.

---

## R100 spot-checklist (relevant subset)
- R74 test:src ≥ 2.0 — **PASS** (3.365 at declared base)
- R75 banned-cast net +0 — **PASS** (no `as any`/`as unknown as`/`.catch(()=>null)`/empty catch)
- R76/R23 ≤ prod LOC cap — **PASS** at PR base (285 < 600); **FAIL** on push-event scoping (P2-3)
- R109 flag discipline — **PASS** (`PAIRING_ENABLED=true`)
- R3 commit identity — **PASS**
- R2/R14 honesty (PR body vs reality) — **PASS** (counts reproduce; no false green attestation)
- NUL/control-byte hygiene — **PASS** (0 in all three files)

## Recommendation
FAIL at pinned `b7769b8`. Before merge: fix **P2-1** (context-scope the dedupe key + regression
test) and **P2-2** (stamp provenance or correct the docstring); **P2-3** is already fixed on the
live head `dfd67be7` — re-audit there. P3-1/P3-2/P3-3 are quick, mechanical clean-ups. Reconcile
the **HEAD MISMATCH** (pinned `b7769b8` vs live `dfd67be7`) before any merge decision.
