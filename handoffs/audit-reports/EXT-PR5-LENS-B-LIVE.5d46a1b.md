# EXT PR #5 — LENS B (independent, read-only, adversarial FULL P0–P3 re-audit)

- **Repo:** BradleyGleavePortfolio/tgp-importer-extension
- **PR:** #5 — "feat(replay): bounded autonomous replay engine (PR-C1a)"
- **Exact head audited:** `5d46a1bb5c85f021a1e7c0167d51a8d1868988b0` (confirmed checked out; `refs/pull/5/head`)
- **Base:** `main` @ `a6e248aa20c724f4e1a2ca3eb81e98f9b8ab25cb` (merged PR #4). `git merge-base origin/main
  HEAD = a6e248a`, `origin/main = a6e248a` — not stale, not stacked.
- **Fixer commit:** `5d46a1b`, single commit whose parent is exactly the prior-audited head `5f55abc`.
- **Lens:** B — independent / read-only. Did **not** read Lens A output, did **not** modify source,
  did **not** merge, did **not** approve.
- **Prior round (`5f55abc`):** Lens A FAIL P3=1 and Lens B FAIL P3=1 — same finding: a digit-led
  `:param` was accepted by the normalizer but not substituted by the engine (`fillTemplate`).
- **Date:** 2026-07-14

## VERDICT: CLEAN — P0=0 P1=0 P2=0 P3=0 — blocking_ids: []

The fixer commit `5d46a1b` **root-fixes** the sole prior finding by introducing a single canonical
`:param` grammar (`PARAM_NAME_CHARS`) exported from `blueprint.js` and consumed by **both** the
normalizer's presence check and the engine's substitution regex — eliminating the drift rather than
patching one side. The fix is minimal (3 files, +37/−4), carries a behavioral test, and introduces
no new P0–P3 under independent adversarial probing. All security invariants (SSRF confinement,
id-injection encoding, auth-loss fail-closed, bounded termination) are preserved. Gates and identity
reproduce clean at the exact head.

---

## The fix — verified single source of truth

`blueprint.js` now exports the canonical class:
```
export const PARAM_NAME_CHARS = "A-Za-z0-9_";
```
- **Normalizer detection** (`blueprint.js:216`): `new RegExp(`:[${PARAM_NAME_CHARS}]`)` — unchanged
  behavior vs the prior `/:[A-Za-z0-9_]/` (digit-led counts).
- **Engine substitution** (`engine.js`): `const PARAM_TOKEN = new RegExp(`:[${PARAM_NAME_CHARS}]+`,
  "g")`, replacing the prior narrower `/:[A-Za-z_][A-Za-z0-9_]*/g` (which required a letter/underscore
  first char and so skipped `:1`).

**Parity proof (independent harness):** detection is `:` + one param-char; fill is `:` + one-or-more
param-char. Every position the normalizer detects is therefore a position the engine fills
(detection ⊆ fill). Probed across grammars — `/x/:1`, `/x/:name`, `/x/:1/y/:name`, `/x/:1abc`,
`/x:8080/y`, bare `/x/:` — **every accepted template is fully substituted; no literal `:param` ever
survives onto the wire** (`literalParamLeft=false` in all cases). Bare `:` (no following param char)
is uniformly treated as a non-param by both modules (static template, no throw, `:` left literal).

**Prior finding RESOLVED (behavioral):** a forEach step `template: "/x/:1"` now fetches
`https://api.test/x/7` (was `https://api.test/x/:1`). New test
`test/replay-engine-edge.spec.js:272-291` locks `/x/:1/y/:name` → `/x/42/y/42`.

---

## Adversarial sweep of the widened grammar — no new P0–P3

- **No `String.replace` special-pattern injection.** `fillTemplate` uses a **string** replacement
  computed as `encodeURIComponent(String(id))`. `encodeURIComponent` percent-escapes `$` (→`%24`) and
  `&` (→`%26`), so an id of `"$&EVIL"` or `"$1$2"` yields `/x/%24%26EVIL` and `/x/%241%242` — the
  `$&`/`$n` replacement metacharacters cannot expand. Confirmed by harness.
- **SSRF / origin confinement intact.** Fan-out ids `../../evil`, `https://evil.com/x`, `a/b?c#d`
  all encode to on-origin segments (`..%2F..%2Fevil`, …); zero origin escapes. `:params` via
  `encodeURIComponent`, query via `URLSearchParams.set`.
- **Capability fail-closed unchanged.** `allowedOrigins` undefined / off-allowlist each throw
  **before any fetch** (harness: 0 fetches). Threaded into `normalizeBlueprint`.
- **Auth-loss fails closed** (`AuthLostError` propagates, stops after the auth-loss page); abort →
  `{status:"cancelled"}`. Bounded: global `maxPages`/`maxEntities` + per-step `maxPagesPerStep` +
  per-context `visited` set + bounded retry (`maxAttempts=3`).
- **Note (not a finding):** `/x:8080/y` is treated as a param (`:8080` → substituted) — this is the
  *same* detection behavior that predates the fix; the fixer only made the engine agree with the
  normalizer. Uniform and by-contract; benign (blueprint authors control templates). Not scored.
- **Whole-PR scope unchanged & inert:** 6 files vs main (engine + blueprint + 3 test files + docs),
  +1597/−8. No `chrome.*`, no `console.*`, no `token`/`bearer`/`authorization` outside comments.
  Engine still imported only by tests (unwired — acceptable chained-PR slice).

All six earlier PR #5 findings (P2-1/2/3, P3-1/2/3 from `b7769b8`) remain resolved (verified in the
`5f55abc` round; untouched by this fixer).

## Gates & identity — reproduced at `5d46a1b`

- `check:banned` OK (source patterns + origin/main commit identity clean).
- `check:flags` `PAIRING_ENABLED=true` OK (sole auth path enabled).
- `check:ratio` base=a6e248a `prod_added=328 test_added=1221 ratio=3.723 floor=2 OK`.
- `check:loc` PR-mode `prod_added=328 prod_removed=2 cap=400 OK`; push-mode `cap=600 OK`.
- `npx vitest run` → **23 files / 428 tests passed** (+1 vs prior head: the digit-led param test).
- Both PR commits (`5d46a1b`, `5f55abc`) authored **and** committed as
  Bradley Gleave <bradley@bradleytgpcoaching.com>; no AI/co-author trailers (a loose-grep hit on
  substring "bot" was the word "both" in a commit body — word-boundary rescan confirmed clean).

## Recommendation

**CLEAN at `5d46a1b`.** The sole prior P3 is root-fixed with a single canonical `:param` grammar and
behavioral coverage; no new P0–P3 exists; all security and data-integrity invariants hold; gates and
R3 identity are green at the exact head. Read-only audit — no approval given (agents are not
authorized to approve PRs).

resolved_ids: PR5-B-P3-digit-led-param-not-filled
new_ids: (none)
blocking_ids: (none)

VERDICT: CLEAN
