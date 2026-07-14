# EXT-PR4 — LENS B LIVE RE-AUDIT (independent, read-only)

- **PR:** #4 — *harden(replay): machine-enforce 400 cap + drop over-strict `://` reject*
- **Exact head audited:** `b02298a42c16db4cb2906918b7b5ad0b239de0b4` (confirmed checked out; = `refs/pull/4/head`)
- **Base (merge-base with main):** `a8563853758bc369b01d9f1f7e03a28db8a520ef`
- **Lens:** B — independent / read-only. Did **not** read Lens A output, did **not** modify source, did **not** merge.
- **Date:** 2026-07-14
- **Standard:** angry adversarial FULL re-audit — hunt ANY P0–P3 across the whole PR, verify prior fixes AND search for new defects. No soft-pass.

## VERDICT: CLEAN — P0=0 P1=0 P2=0 P3=0

The two code-level P3s from the prior Lens B round (`8972807`) are root-fixed and adversarially
re-verified: the 400 prod-LOC cap is now **machine-enforced** on `pull_request`, and the over-strict
`includes("://")` template reject is dropped with the sentinel-resolution proof left as the decisive
origin-confinement. No origin-escape, capability bypass, host-gate bypass, or state-table corruption
was found. Replay modules remain inert (no `chrome.*`/network, imported only by tests). All gates
reproduce truthfully and the full suite is green.

---

## Scope of change

Whole PR (`git diff --stat a8563853..b02298a`): `docs/DECISION_V03_AUTONOMOUS_CRAWL.md` (+205),
`shared/replay/blueprint.js` (300 prod), `shared/replay/state.js` (100 prod),
`test/replay-blueprint.spec.js` (675 test), `test/replay-state.spec.js` (285 test),
`.github/workflows/ci.yml`, `package-lock.json` (version bump).

Latest commit delta (`8972807..b02298a`): `ci.yml` (+7), `blueprint.js` (±, net-zero LOC),
`test/replay-blueprint.spec.js` (+18/−). `background.js`, `popup/*`, `content/*`, `manifest.json`,
`shared/session.js`, `shared/pairing.js` are **untouched** — no auth/wiring surface in this diff.

---

## Prior Lens B (R4 @ `8972807`) findings — status at this head

- **PR4-B-R4-P3-1 — `cap=400` doctrinal, not machine-enforced → RESOLVED.**
  `.github/workflows/ci.yml` now sets `env: PROD_LOC_CAP: ${{ github.event_name == 'pull_request' && '400' || '600' }}`
  on the Production-LOC step. Verified `scripts/check-prod-loc.mjs:12` reads `Number(process.env.PROD_LOC_CAP ?? 600)`,
  so on a PR the 400 cap is now mechanically enforced (not merely quoted). Reproduced:
  `PROD_LOC_CAP=400 node scripts/check-prod-loc.mjs` → `prod_added=400 cap=400 … OK`. The push-path
  600 fallback is honestly justified in-comment (a stacked-child push measures the cumulative
  parent+child diff vs `main`); `resolveBase()` confirms the PR base is `origin/$GITHUB_BASE_REF`. ✓
- **PR4-B-R4-P3-3 — `includes("://")` over-rejects benign on-origin paths → RESOLVED.**
  `normalizeStep` (`blueprint.js:178`) now rejects only `!startsWith("/")` or `startsWith("//")`
  (plus the pre-existing backslash/C0-control reject at `:175`); the `://` blanket-reject is gone.
  The origin-escape proof — resolve against `SENTINEL="https://blueprint.invalid/"` and require
  `probe.origin === SENTINEL && probe.href.startsWith(SENTINEL + "/")` (`:181-191`) — is now the sole
  and decisive confinement. Adversarially verified sound (below). ✓
- **PR4-B-R4-P3-2 — stale `Head:` line in the PR *body*.** Out of scope of the repo checkout (the PR
  description is not a shipped artifact and is not in the tree). Cosmetic, self-healing, non-security;
  not independently verifiable here and **not counted**. Noted for completeness only.

---

## Adversarial verification of the `://` drop (crux of this round)

Ran an independent harness against the **actual** `shared/replay/blueprint.js` at head (not the
shipped tests): `/tmp/attack_pr4_b02298a.mjs`.

- **Benign `://` now accepted (on-origin):** `/redirect?url=https://evil.com`, `/a/b://c`,
  `/https://x` all accepted; each, when joined onto the real `https://api.test/`, keeps
  `joined.origin === "https://api.test"`. The `://` lives in path/query, never the authority. ✓
- **Origin escapes still rejected:** `//evil.com` (→ "root-relative"), `/\evil.com`, `/\/evil.com`,
  tab-lead `\t/x`, embedded newline `/x\ny` (→ backslash/control reject), scheme-with-no-leading-slash
  `https://evil.com`, empty. ✓
- **Fuzz for a `://` template that escapes when joined:** `/x://y`, `/:@evil.com`, `/@evil.com`,
  `/%2f%2fevil`, `/..//evil`, `/./x`, `/redirect://evil`, `/a?b=c://d`, `/#https://e`, `/;https://f`,
  `/p q` — **all accepted stay on-origin**; `/\x` and `/x\y` rejected. **Zero escapes.** ✓
- **Why it holds:** a template must start with a single `/`, so WHATWG parsing can never enter
  scheme- or authority-parsing (authority requires `//` or `\\`, both rejected; a scheme requires a
  leading `[a-zA-Z]…:`, impossible behind a leading `/`). Any residual `://` is inert path/query text.
  The sentinel proof is a mechanical backstop that rejects anything whose resolved origin drifts.

## Whole-PR adversarial sweep — no new P0–P3

- **Required `allowedOrigins` capability (fail-closed):** absent/`{}`/`[]`/non-array/non-string/blank
  entry all throw before any network work (`normalizeAllowedOrigins:92-102`). Allowlist entries are
  re-validated through `assertSafeUrl` so the list cannot smuggle http/credentialed/loopback/IP-literal
  targets. apiBase must be an **exact origin** member (subdomain/port/trailing-dot confusion rejected).
- **Host gate:** `isForbiddenHost` lower-cases + strips ALL trailing dots; rejects `localhost`/
  `*.localhost`, any `[`-IPv6 literal, and any IPv4 literal. WHATWG IDNA-normalizes homoglyphs upstream.
- **Name-based SSRF model:** resolve-free parse-time gate correctly delegates name-resolution
  confinement to the caller-observed allowlist — honestly documented (`:30-38, 87-91`).
- **State machine (`state.js`, unchanged in this delta):** `transition` guards `typeof===string` +
  `Object.hasOwn` on both TABLE and row → `__proto__`/`constructor`/`toString`/`hasOwnProperty` as
  either arg returns null; terminal states re-arm only via explicit `RESET`. Prototype-safe.
- **Inertness / site-agnostic:** `grep` finds no `chrome.*`/`fetch(`/`import(`/`require(`/XHR in
  `shared/replay/*`; the modules are imported **only** by the two spec files, never by
  `background.js`/`popup` — cannot affect the auth/runtime path. No hardcoded competitor origin in core.
- **New tests are behavioral:** the 3 added/flipped cases call `normalizeBlueprint` with real inputs
  and assert throw/not-throw — accept `/redirect://evil.test` & `/redirect?url=https://ok.test/x`
  (on-origin), still reject `//evil.test/steal`. Consistent with the code change; would catch a regression.

## Gates & identity — reproduced truthfully at `b02298a`

- `check:banned` → OK; `check:flags` → `PAIRING_ENABLED=true` OK.
- `check:loc` default → `prod_added=400 cap=600 OK`; **PR-mode** `PROD_LOC_CAP=400` → `cap=400 OK`
  (prod_added=400 = 300 blueprint + 100 state, exactly at the machine-enforced cap).
- `check:ratio` → `prod_added=400 test_added=960 ratio=2.400 floor=2 OK` (test = 675 + 285).
- `npx vitest run` → **21 files / 375 tests passed.**
- Authorship: all 5 PR commits authored **and** committed as
  Bradley Gleave <bradley@bradleytgpcoaching.com>; no `co-authored`/`claude`/`anthropic`/`generated`
  tokens in any PR commit message.

---

## Bottom line

The security thesis — fail-closed required caller-injected `allowedOrigins` capability + resolve-free
host/scheme/credential confinement + a mechanical sentinel-resolution proof for template
origin-confinement, with name-resolution delegated to the caller-observed allowlist — holds under
independent adversarial probing at `b02298a`. Dropping the `includes("://")` reject removes an
over-restriction without weakening confinement (proven by fuzz: no accepted template escapes origin),
and the 400 cap is now genuinely machine-enforced on PRs. No P0–P3 remains in the shipped code, tests,
CI, or docs. Read-only audit — no approval given (agents are not authorized to approve PRs).

resolved_ids: PR4-B-R4-P3-1-cap-not-machine-enforced, PR4-B-R4-P3-3-over-strict-scheme-reject
blocking_ids: (none)

VERDICT: CLEAN
