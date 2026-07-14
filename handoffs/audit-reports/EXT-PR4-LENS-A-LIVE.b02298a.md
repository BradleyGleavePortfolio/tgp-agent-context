# tgp-importer-extension PR #4 — Lens A Independent Live Re-Audit (R5) — FINAL

- **PR #4** `feat(replay): site-agnostic blueprint contract + bounded state machine [IMPORTER-C1]`
- **Head audited:** `b02298a42c16db4cb2906918b7b5ad0b239de0b4` (confirmed checked out)
- **Base / merge-base:** `main` @ `a856385` (PR #3 merge). AUDIT ONLY — no commit/merge/modify.
- **Standard:** angry adversarial FULL re-audit — hunt ANY P0–P3 across the whole PR.
- **Date:** 2026-07-14
- **Prior failure:** repository-clone infrastructure only (not product); re-fetched clean this round.

## VERDICT: CLEAN — P0=0 P1=0 P2=0 P3=0 (blocking_ids: [])

PR #4 adds the site-agnostic replay **blueprint contract** (`shared/replay/blueprint.js`, 300 prod
LOC) and a **bounded state machine** (`shared/replay/state.js`, 100 prod LOC) — data + a pure
transition table, **no engine, no fetch, no orchestration** in this unit. The head commit `b02298a`
closes the three P3 accuracy/hardening notes from the prior Lens B re-audit: it (1) machine-enforces
the canonical 400 prod-LOC cap on the PR review gate, and (2) drops the over-strict blanket
`includes("://")` template reject in favor of the authoritative sentinel same-origin proof. Both are
verified sound. Origin-confinement, method-safety, budget-bounding, and prototype-pollution defense
all hold under adversarial probing. No P0–P3 remains.

---

## Prior P3 notes — status at this head (all RESOLVED)

- **[P3-1] LOC cap only attested, not machine-enforced** → **FIXED.** `.github/workflows/ci.yml`
  now sets `PROD_LOC_CAP: ${{ github.event_name == 'pull_request' && '400' || '600' }}` on the
  Production-LOC-budget step. On the `pull_request` review gate the canonical R23/R76 cap of **400**
  is enforced mechanically; `push` keeps 600 because a stacked child branch's push diff is measured
  cumulatively against `main` and would otherwise be failed by the parent's lines. Reproduced:
  `PROD_LOC_CAP=400` → `prod_added=400 cap=400` → **OK** (boundary passes; 401 would fail). ✓
- **[P3-3] over-strict `includes("://")` template reject** → **FIXED at root.** The blanket
  substring test is removed; the reject now relies on (a) backslash/C0-control reject, (b)
  `startsWith("/")` && `!startsWith("//")`, and (c) a **mechanical sentinel proof**
  (`new URL(template, "https://blueprint.invalid/")` must keep `origin === SENTINEL` and
  `href.startsWith(SENTINEL + "/")`). A `://` inside a path/query stays on-origin under WHATWG join,
  so it is correctly no longer rejected. Behavioral tests added for benign `://` paths and a real
  `//evil` escape. ✓
- **[P3-2] (doc/LOC reconciliation from `866cd2e`)** → doc `DECISION_V03_AUTONOMOUS_CRAWL.md` states
  cap = 400, blueprint 300 + state 100 = 400; matches measured `prod_added=400`. ✓

---

## Adversarial verification of the origin-escape proof (crux of this round)

Probed `normalizeBlueprint` directly against the shipped module with tricky templates. Every
**accepted** template resolves to the apiBase origin; every escape vector is **rejected**:

| template | verdict | join origin |
|---|---|---|
| `/clients` | ACCEPT | api.truecoach.co ✓ |
| `/redirect?url=https://evil.com` | ACCEPT | api.truecoach.co ✓ (query, on-origin) |
| `/redirect://evil.test` | ACCEPT | api.truecoach.co ✓ (path, on-origin) |
| `/path#https://evil` | ACCEPT | api.truecoach.co ✓ (fragment) |
| `/..//evil`, `/%2f%2fevil.test`, `/@evil.test` | ACCEPT | api.truecoach.co ✓ (all stay on-origin) |
| `//evil.test/steal` | REJECT (root-relative) | would be evil.test |
| `https://evil.test/x` | REJECT (root-relative) | evil.test |
| `/\evil.test`, `/\\evil.test/x` | REJECT (backslash/control) | would be evil.test |
| `/⟨TAB⟩/evil` | REJECT (control char) | TAB-strip would yield //evil |

The control-char reject is load-bearing: `/⟨TAB⟩/evil` would, after mid-parse C0 stripping, collapse
to `//evil` (off-origin) — the reject fires **before** that can happen. Dropping `includes("://")`
does not open any escape: the sentinel proof + `//`-prefix reject + backslash/control reject are
jointly decisive. Confirmed the accepted-set is exactly the on-origin set.

Origin-allowlist capability also verified fail-closed: apiBase origin **not** in `allowedOrigins` →
REJECT; empty/absent `allowedOrigins` → REJECT; `http://` (or credentialed / IP-literal / loopback /
`.localhost`) allowlist entry → REJECT (shared `assertSafeUrl` guards both apiBase and every
allowlist entry). A parse-time gate cannot resolve DNS, so name-resolution confinement is correctly
delegated to the injected, non-empty allowlist — site-agnostic, never a hardcoded competitor map.

## State machine (`state.js`) — bounded and prototype-safe

Pure transition table, no IO/data. `transition()` type-checks both args and uses `Object.hasOwn` for
BOTH the state row and the event lookup, so an inherited prototype key (`__proto__`, `constructor`,
`toString`, …) derived from an untrusted message action returns `null` rather than a truthy member.
Terminal states (`complete`/`failed`/`cancelled`) re-arm only via explicit `RESET`. No illegal edge
(e.g. `importing → learning`) exists. Matches the documented invariant.

## Adversarial sweep — no new P0–P3

- **No network / no code-exec in this unit:** zero `fetch(` in `shared/replay/`; no `eval` /
  `new Function` / `child_process` / `require`. Blueprint is inert data + validation; nothing here
  issues a request (engine is a later PR-C1b, explicitly out of scope, per the DECISION doc).
- **Safe methods only:** `SAFE_METHODS = {GET, HEAD}`; anything else rejected at parse time.
- **Budgets bounded:** `DEFAULT_BUDGETS` frozen; `normalizeBudgets` only accepts positive integers,
  else falls back to defaults (`maxPages 2000`, `maxPagesPerStep 1000`, `maxEntities 200000`,
  `requestTimeoutMs 15000`). Cursor pagination requires a `nextPath` or it throws (no infinite loop).
- **Fan-out integrity:** every `forEach` must reference a set produced by an EARLIER step's
  `collectAs`, else throw — no reference to never-collected ids.
- **Auth core untouched:** PR #4 touches only `shared/replay/*`, `test/replay-*`, `ci.yml`,
  `docs/DECISION_*`, `package-lock.json`. `background.js` / `session.js` / `pairing.js` /
  `manifest.json` unchanged from the verified-sound PR #3 state.
- **Gates honest (reproduced live):** prod_added **400** / cap **400** (PR gate) → OK; test:src
  ratio **960/400 = 2.400** ≥ 2.0; banned-token net clean; flag discipline `PAIRING_ENABLED=true`.
  **375/375 vitest pass, 21 files.** All 5 PR commits authored + committed as
  Bradley Gleave <bradley@bradleytgpcoaching.com>; no AI/co-author tokens in messages.
- **CI wiring honest:** the `pull_request`-vs-`push` cap split is a legitimate stacked-branch
  accommodation (push measures cumulative parent+child vs main), not a cap-evasion — the review gate
  that actually governs the merge enforces 400.

## Notes / non-findings (checked, cleared)

- **apiBase path is discarded by root-relative templates.** `new URL("/clients", "https://h/api/v1")`
  → `https://h/clients` (the `/api/v1` prefix is dropped). This is a *functional* join nuance owned by
  the engine (PR-C1b), not a security issue — origin remains confined to the allowlisted host. The
  normalizer validates templates against a sentinel origin, and the guarantee holds iff the engine
  uses identical WHATWG join semantics; that cross-seam contract is documented and out of scope for
  this data-only PR. Not a finding.
- Two older specs (`ingest-timeout-bound`, `pair-ui-catch`) remain source-text assertions; brittle
  but supplementary. Not gamed.

blocking_ids: (none)

VERDICT: CLEAN
