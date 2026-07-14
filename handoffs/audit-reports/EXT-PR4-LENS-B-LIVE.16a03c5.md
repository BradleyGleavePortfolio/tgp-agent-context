# EXT PR #4 — LENS B (independent, read-only) audit

- **Repo:** BradleyGleavePortfolio/tgp-importer-extension
- **PR:** #4 — `feat(replay): site-agnostic blueprint contract + bounded state machine`
- **Head (resolved full SHA):** `16a03c5c184713e9fb6e993cdcf3cb1be4b68e89` — matches requested `16a03c5` ✓ (no mismatch)
- **Base:** `main` (`a8563853758bc369b01d9f1f7e03a28db8a520ef`)
- **Lens:** B — independent; Lens A report NOT read; no source modified; no merge.
- **Scope:** pure blueprint validation + bounded state machine. Attack surface: origin/SSRF confinement incl. parsing edge cases, method/path/template safety, state semantics, future-inference trust boundary, site-agnostic invariant, dead code, control bytes, LOC/test-ratio truth, behavioral tests, docs/PR claims, CI/R3.

## VERDICT: **NOT CLEAN** — 1 × P1

Zero P0. One P1 (security-boundary bypass + false attested invariant + coverage gap). Two P3 / informational. All CI gates pass and all 332 tests pass, but the PR's central shipped guarantee — "step templates are root-relative, so **no step can redirect off-origin**" — is provably false.

---

## P1 — Template origin-escape: backslash defeats the root-relative gate

**Files:** `shared/replay/blueprint.js:159-164` (`normalizeStep` template check); attested at `blueprint.js:35`, PR body ("root-relative step templates only … so no step can redirect off-origin"), and `test/replay-blueprint.spec.js:265` (describe: *"no origin escape"*).

### The gate
```js
if (!step.template.startsWith("/") || step.template.startsWith("//") || step.template.includes("://")) {
    throw new Error(`… template must be a root-relative path ("/...") with no origin`);
}
```
It rejects `//host`, `://`, absolute URLs, and no-leading-slash. It does **not** reject a leading backslash.

### The bypass (verified at head)
A template of `"/\evil.test/steal"` (or `"/\/evil.test/steal"`):
- `startsWith("/")` → true, `startsWith("//")` → false, `includes("://")` → false ⇒ **ACCEPTED**.
- WHATWG URL treats `\` as equivalent to `/` for special schemes, so the documented join resolves off-origin:
  ```
  new URL("/\evil.test/steal", "https://api.test")  →  https://evil.test/steal
  ```
  (verified: `.host === "evil.test"`).

The gate's own design proves the exploitable semantics: it bothers to reject `//host` and `://`, which are only dangerous under `new URL(template, base)` resolution — and under that exact resolution `/\host` is identically dangerous and undefended.

### Why it matters
`normalizeBlueprint` is the PR's entire reason to exist: a **fail-closed SSRF/origin gate** for blueprints that (per the header and DECISION doc) "will be produced by auto-inference from UNTRUSTED passive capture (PR-C2)." The template check is the specific mechanism that is supposed to guarantee no per-step off-origin redirect of the coach's **credentialed** crawl. A malicious/inferred blueprint with `template: "/\attacker.example/collect"` passes the gate; the immediately-chained engine (PR-C1a, explicitly designed to consume these validated templates) will send the credentialed request off-origin — a classic SSRF / credential-leak primitive that the gate claims to prevent.

### Severity rationale (P1, not P0)
No runtime consumer ships in this PR (`grep` confirms nothing but tests imports `shared/replay/*`; no `chrome.*`/`fetch`/`eval` present), so there is no live exploit **in this merge**. But the boundary is shipped and attested as complete/correct, the invariant is false, the "no origin escape" test matrix omits exactly this vector, and PR-C1a inherits it. An inert-but-false security boundary attested as sound is a P1.

### Fix
Reject backslashes explicitly, or (stronger) validate by resolution rather than string prefixes:
```js
// reject any authority-introducing template regardless of separator
if (!step.template.startsWith("/") || /^\/[/\\]/.test(step.template) || step.template.includes("://")) { … }
// OR resolution-based, catches all separators/encodings in one shot:
const probe = new URL(step.template, "https://blueprint.invalid");
if (probe.origin !== "https://blueprint.invalid") throw new Error("template must not introduce an origin");
```
Add a behavioral test for `"/\evil.test"` and `"/\/evil.test"` to the existing "no origin escape" block.

---

## P3 — `:param` detection misses digit-led params

**File:** `shared/replay/blueprint.js:177` — `const hasParam = /:[A-Za-z_]/.test(step.template);`

A template like `/t/:1` is **not** recognized as parameterized (regex requires `[A-Za-z_]` after `:`), so it is accepted with no `forEach` requirement. Functional, not security: the future engine would either send the literal `/t/:1` (stays on-origin) or fail to substitute. Low impact; note for consistency. Consider `/:[A-Za-z0-9_]/` or documenting that params must be alpha/underscore-led.

## Informational — forward trust boundary for id-substitution (belongs to PR-C1a)

`idField` values are read from **untrusted response bodies** and will be substituted into `:param` templates by the engine (PR-C1a). This module cannot sanitize runtime values, but PR-C1a MUST URL-encode substituted ids and ensure a value cannot inject `/`, `\`, `?`, `#`, or `..` that alters the path/origin. Flagging so it is not lost across the seam; not a defect in this PR.

---

## Areas checked and found SOUND

- **IP-literal obfuscation (robust).** Decimal (`2130706433`), hex (`0x7f000001`), octal (`0177.0.0.1`), short (`127.1`), trailing-dot (`127.0.0.1.`), and `0` are all normalized by WHATWG URL to dotted-quad and then caught by `IPV4_LITERAL`. `[::ffff:127.0.0.1]` normalizes to `[::ffff:7f00:1]` and is caught by the `startsWith("[")` IPv6-literal rule. All rejected. No numeric bypass found.
- **Scheme confinement.** `http/ftp/ws/gopher/file/data` rejected; only `https:` accepted (protocol compared post-normalization). Sound.
- **Embedded credentials.** `user:pass@` and `user@` rejected via `url.username/password`. Sound.
- **allowedOrigins capability.** Injected (never a hardcoded competitor map → site-agnostic invariant holds); trailing-slash normalized; differing port and subdomain treated as distinct origins (rejected); empty allowlist rejects all; absent allowlist keeps intrinsic checks. Sound.
- **Method safety.** GET/HEAD only, upper-cased; POST/etc rejected at parse. Sound.
- **Fan-out ordering.** `forEach` must reference an EARLIER step's `collectAs`; later/ghost references rejected. Sound.
- **`readPath`/`extractItems`.** Read-only traversal (no writes) → no prototype-pollution; non-array locations yield `[]` (never throws). Sound.
- **State machine.** Pure transition table; `TABLE`/`STATE`/`EVENT` frozen; illegal `(state,event)` → `null`; terminals re-arm only via `RESET`; exhaustive 56-pair matrix (15 legal / 41 null) pinned and passing. No skip/self-loop/terminal-to-terminal edges. Site-agnostic (no competitor knowledge). Sound.
- **Inertness / dead code.** Nothing outside `test/` imports `shared/replay/*`; no `chrome.*`, `fetch`, `eval`, `new Function`, `innerHTML`. PR is unreachable at runtime as claimed. Exported `readPath`/`extractItems`/`DEFAULT_BUDGETS` are the contract consumed by PR-C1a and are tested — not orphaned dead code.
- **Deferred wiring findings.** `git diff --name-status main` touches only `docs/`, `shared/replay/{blueprint,state}.js`, `test/replay-{blueprint,state}.spec.js`, `package-lock.json`. `background.js` and `popup/*` unmodified → the five wiring-layer findings (source-only auth-loss clear, single-flight guard, `isTrustedExtensionPage` gate, real popup test, e2e bearer) are genuinely absent from this diff and correctly deferred to PR-C1b. No false attestation.

## Truthfulness of counts / CI / R3

- **Prod LOC:** `blueprint.js` 268 + `state.js` 88 = **356** (verified by `wc -l` and `git diff --numstat main HEAD`). Matches PR claim.
- **Test LOC:** 502 + 266 = **768**; test:src ratio **2.157** ≥ floor 2. Matches.
- **Control/NUL bytes:** 0 across all four files (verified). Counts are genuine text lines, no binary-blob artifact. Matches PR claim.
- **Tests:** `npx vitest run` → **21 files / 332 tests passed**. Matches PR claim.
- **CI gates (run locally):** `check-banned` OK, `check-prod-loc` OK (script cap **600**; PR voluntarily holds to canonical 400 — 356 < 400, honest and consistent), `check-flag-discipline` OK (`PAIRING_ENABLED=true`), `check-test-ratio` OK. CI checks out PR head SHA (R3 identity). All green.
- **Note (not a finding):** PR text says the 400 cap "governs" while the CI script enforces 600. This is disclosed, not hidden, and 356 is under both — no violation.

## Recheck of prior findings
Prior/known findings for this workstream are the wiring-layer items, which the doctrine and PR explicitly defer to PR-C1b. Diff confirms they cannot be present here (untouched files). No regression or silent re-introduction. Lens A report was not consulted (independence preserved).

---

## Bottom line
The state machine and the numeric-host/scheme/credential/allowlist confinement are solid, well-tested, and honestly measured. **But the template gate — the boundary the PR is built to provide — is bypassable via a leading backslash, its "no origin escape" test matrix omits that vector, and the invariant is attested as complete in both code comments and the PR body.** That is a genuine P1 security-boundary defect. **NOT CLEAN.** Fix the template check (backslash / resolution-based) and add the missing behavioral tests before merge; carry the id-substitution encoding requirement into PR-C1a.
