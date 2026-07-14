# EXT PR #5 — LENS A (independent, read-only, adversarial FULL P0–P3 re-audit)

- **Repo:** BradleyGleavePortfolio/tgp-importer-extension
- **PR:** #5 — "feat(replay): bounded autonomous replay engine (PR-C1a)"
- **Exact head audited:** `5f55abc44d8f7b798f0751a6d240774579679da6` (confirmed checked out; = `refs/pull/5/head`)
- **Base:** `main`. After a full `git fetch origin`, **PR #4 is now merged to main** as
  `a6e248aa20c724f4e1a2ca3eb81e98f9b8ab25cb`, which is the **merge-base** with HEAD. The branch is no
  longer stacked on an unmerged parent; the incremental diff is engine + its tests + one contract line.
- **Lens:** A — independent / read-only. Did **not** read Lens B output, did **not** modify source,
  did **not** merge.
- **Prior round:** earlier head `b7769b8` → FAIL (P2=3, P3=3). This head is the fixer + retarget-to-main.
- **Date:** 2026-07-14

## VERDICT: FAIL with counts P0=0 P1=0 P2=0 P3=1 — nothing merge-blocking (blocking_ids: [])

The fixer commit `5f55abc` **resolves every prior finding** (P2-1/2/3 + P3-1/2/3), each with
behavioral coverage, and the counts reconcile honestly against the now-merged main. The engine's
security posture (SSRF confinement, id-injection encoding, auth-loss fail-closed, bounded
termination) holds under independent adversarial probing. One **new, non-blocking P3** remains: a
digit-led `:param` is treated as a param by `blueprint.js` (and its tests) but is silently **not
substituted** by the engine's `fillTemplate` — a cross-module contract inconsistency this PR
introduces. Non-security. CLEAN requires all P0–P3 = 0, so the verdict is FAIL-with-counts, but the
PR is safe to merge on its merits.

---

## Branch-topology verification (the retarget claim)

An initial local `origin/main` was stale (`a8563853`), so the diff briefly showed the cumulative
PR#4+PR#5 lines (prod 716, cap-400 FAIL). After `git fetch origin`, `origin/main = a6e248a` and
`git merge-base --is-ancestor a6e248a origin/main` → **yes**: PR #4 is merged. PR #5 is a **single
commit** whose parent is exactly `a6e248a` — not stacked, no merge bubble. True diff vs main is 6
files, +1563/−7 (engine + tests + one contract tweak + docs), prod_added=317.

---

## Prior findings (`b7769b8`) — ALL RESOLVED (independently re-verified)

- **[P2-1] global `(entityType,sourceId)` dedupe dropped parent-scoped fan-out ids → FIXED.**
  Dedupe key is now `JSON.stringify([step.id, ctxLabel, sourceId])` with `ctxLabel` = fan-out parent
  id (`engine.js:224, 169`). Probe: two children both id `1` under different parents → both emit;
  a repeat within one context still dedupes. ✓
- **[P2-2] 2-field envelope + false docstring → FIXED.** Emits the full locked envelope
  `{ sourceId, sourcePlatform: bp.platform, capturedAt, payload }` (`:229`), `capturedAt` from
  injected `now()`; docstring (`:3-4`) names those four fields. Matches `_interface.js makeEntity`. ✓
- **[P2-3] stacked push CI failed Production-LOC (641>600) → RESOLVED by retarget.** Against merged
  main prod_added=317. `ci.yml` (inherited from PR #4, unchanged here) enforces
  `PROD_LOC_CAP = pull_request ? 400 : 600` on **both** triggers — reproduced `cap=400 OK` (PR) and
  `cap=600 OK` (push). The over-broad `dfd67be` gate-**skip** was correctly NOT carried. ✓
- **[P3-1] `progress.total` tautology → FIXED.** progress rows are `{ entityType, sent }` only
  (`:101, 238-239`). ✓
- **[P3-2] synthetic `sourceId` embedded the request URL/cursor token → FIXED.** URL-free
  `${step.id}#${ctxLabel}#${thisPage}#${index}` (`:217-218`). ✓
- **[P3-3] `maxPagesPerStep` enforced per-context → FIXED.** `stepPages[stepIndex]` is a true per-step
  aggregate across all fan-out contexts (`:102, 183, 200`); global `maxPages` is the outer ceiling. ✓

Bonus hardening: `blueprint.js:214-216` now rejects a self-referential `collectAs === forEach` step;
the engine also snapshots the parent id set (`:274`). Verified.

---

## NEW FINDING

### [PR5-A-P3] Digit-led `:param` is treated as a param by the contract but the engine never fills it

**Where:** `engine.js:68` `fillTemplate` uses `/:[A-Za-z_][A-Za-z0-9_]*/g` — the first char after `:`
must be a letter/underscore. But `blueprint.js:209` detects a param with `/:[A-Za-z0-9_]/` (a digit
counts), and `test/replay-blueprint.spec.js:566-577` locks that a digit-led placeholder is *"a real
param needing a forEach"* and *"accepts a digit-led `:param` when fed by an earlier forEach set"*
(`template: "/p/:1"`). The two modules therefore disagree on the `:param` grammar.

**Effect (reproduced):** a forEach step with `template: "/x/:1"` passes normalization, then the engine
leaves `:1` unsubstituted and fetches the literal `https://api.test/x/:1` for **every** parent id
(harness output: `[ 'https://api.test/x/:1' ]`) instead of `/x/<id>`. Consequences: wrong
(un-parameterized) requests, redundant identical fetches across contexts, incorrect data collection.
**No security impact** — the literal `:1` is an on-origin path segment; origin confinement is intact.

**Severity rationale:** this is the same class of non-security, minor-correctness/consistency defect
in (currently unwired) engine code that prior rounds counted as P3 (`progress.total`,
URL-in-`sourceId`, `maxPagesPerStep` naming). By that consistent bar it is a **P3**. It is
**non-blocking** — likelihood is low (authors use named params like `:id`) and the failure is benign
— but it should not be buried below threshold: the next builder wiring PR-C1b would trip on it.
**Fix:** unify the grammar — either widen `fillTemplate` to `/:[A-Za-z0-9_]+/g` or narrow the
normalizer + tests to forbid digit-led names. One canonical `:param` grammar shared by both files.

---

## Whole-PR adversarial sweep — no other P0–P3

- **SSRF / origin confinement (engine build path):** `buildUrl` concatenates the normalized,
  allowlist-confined `apiBase` with a root-relative path; `:params` filled via `encodeURIComponent`,
  query via `URLSearchParams.set`. Probe: fan-out ids `../../evil`, `https://evil.com/x`, `a/b?c#d`
  all encode to on-origin segments (`..%2F..%2Fevil`, …) — **zero escapes**.
- **Required `allowedOrigins` capability threaded + fail-closed:** `runReplay` forwards it into
  `normalizeBlueprint` (`:96`); `undefined`, `[]`, and off-allowlist origin each **throw before any
  fetch** (probe: 0 fetches).
- **Auth loss fails closed:** `AuthLostError` propagates out of `runReplay` (probe: stops after the
  auth-loss page, no further requests); abort → `{status:"cancelled"}`.
- **Bounded / terminates on any input:** global `maxPages`/`maxEntities` + per-step `maxPagesPerStep`
  + per-context `visited` URL set (page/cursor cycles broken); forEach iterates a snapshot; bounded
  retry (`maxAttempts=3`, 5xx/timeout retryable, 4xx/malformed skip). `maxEntities` may overshoot by
  ≤ one page (soft budget; next check stops) — by-design.
- **Honest terminal status:** `failed` (degraded & 0 emitted) / `partial` (degraded or truncated) /
  `complete` (whole untruncated walk). Backpressure: `emit` awaited before next fetch.
- **Inert / site-agnostic / no leakage:** no `console.*`/logging, no token/bearer/`Authorization`, no
  `chrome.*` in the engine; every side effect injected. Engine imported only by tests (unwired —
  acceptable chained-PR slice). No hardcoded competitor origin. Tests behavioral, not source-grep.

## Gates & identity — reproduced at `5f55abc`

- `check:banned` OK; `check:flags` `PAIRING_ENABLED=true` OK.
- `check:loc` PR-mode `prod_added=317 cap=400 OK`; push-mode `cap=600 OK`.
- `check:ratio` `prod_added=317 test_added=1198 ratio≈3.78 floor=2 OK`.
- `npx vitest run` → **23 files / 427 tests passed.**
- Single PR commit `5f55abc` authored **and** committed as
  Bradley Gleave <bradley@bradleytgpcoaching.com>; no AI/co-author tokens.

## Recommendation

**FAIL (not CLEAN) on one non-blocking P3.** The PR is safe to merge on its merits — every prior
P2/P3 is fixed with behavioral coverage, the retarget removed the stacked-CI defect, and no security
or data-integrity defect exists. Unifying the `:param` grammar between `blueprint.js` and `engine.js`
(and their tests) clears Lens A to CLEAN. Read-only audit — no approval given (agents are not
authorized to approve PRs).

resolved_ids: PR5-A-P2-1-global-dedupe, PR5-A-P2-2-partial-envelope, PR5-A-P2-3-push-loc-gate, PR5-A-P3-1-progress-total, PR5-A-P3-2-url-in-sourceid, PR5-A-P3-3-maxpagesperstep-per-context
new_ids: PR5-A-P3-digit-led-param-not-filled
blocking_ids: (none)

VERDICT: FAIL with counts P0=0 P1=0 P2=0 P3=1
