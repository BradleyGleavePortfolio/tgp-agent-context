# EXT-PR4 — LENS B LIVE RE-AUDIT (independent, read-only)

- **PR:** #4 — *harden(replay): strip all trailing dots + require allowedOrigins capability*
- **Exact head audited:** `8972807a50d4996518ef9f9e5ee308ef4c30a04d`
- **Base (merge-base with main):** `a8563853758bc369b01d9f1f7e03a28db8a520ef`
- **Lens:** B — independent / read-only. Did **not** read Lens A output, did **not** modify source, did **not** merge.
- **Date:** 2026-07-14
- **VERDICT: PASS (non-blocking).** Not CLEAN — three P3 accuracy/hardening notes. **No P0/P1/P2. No new P0–P2 found.**

---

## Scope of change (verified `git diff --name-status main 8972807`)

```
A docs/DECISION_V03_AUTONOMOUS_CRAWL.md   (205)
M package-lock.json                        (+2/-2 version bump)
A shared/replay/blueprint.js               (300 prod)
A shared/replay/state.js                   (100 prod)
A test/replay-blueprint.spec.js            (659 test)
A test/replay-state.spec.js                (285 test)
```

`background.js`, `popup/*`, `content/*`, `manifest.json` are **untouched** — the deferred wiring-layer findings (auth-loss scoping, single-flight, `isTrustedExtensionPage` gating, real popup test, e2e bearer) genuinely cannot exist in this diff. Confirmed.

---

## Truthfulness of the attested counts / CI / R3 / docs

| Claim in PR | Independently reproduced at `8972807` | Truthful |
|---|---|---|
| prod_added = 400 (blueprint 300 + state 100) | `git diff --numstat main`: 300 + 100 = **400** | ✅ |
| test_added = 944 | 659 + 285 = **944** | ✅ |
| test:src ratio = 2.36 (floor 2) | `check:ratio` → `ratio=2.360 floor=2 OK` | ✅ |
| tests: 21 files / 373 passed | `npx vitest run` → **21 passed, 373 passed** | ✅ |
| banned-token net clean | `check:banned` → OK | ✅ |
| flag discipline (PAIRING_ENABLED=true) | `check:flags` → OK | ✅ |
| inert / no `chrome.*` / no network / unreachable | no `chrome.`/`fetch`/`import()` in either module; imported **only** by the two spec files, never by `background.js`/`popup` | ✅ |
| docs decision record matches shipped scope | `DECISION_V03…` describes exactly contract+lifecycle, defers engine/resolver/orchestration/CTA | ✅ |

**One discrepancy (see P3-1):** the PR's fenced *"Honest counts + CI (real, reproducible at head)"* block prints `cap=400`, but the reproducible CI step (`check-prod-loc.mjs`, default `CAP = PROD_LOC_CAP ?? 600`, no env override in `ci.yml`) actually emits `cap=600`. `prod_added=400` is real and the canonical-400 doctrine is met exactly; the quoted `cap=400` line is not the literal CI output. CI (`ci.yml`) runs `npm test` + all four gates against the PR head sha — verified.

---

## Attack matrix — required `allowedOrigins` capability & SSRF boundary

Every vector below was exercised against the **actual** `shared/replay/blueprint.js` at head via an independent harness (`/tmp/attack*.mjs`), not by re-reading the shipped tests.

### Required-capability / missing-empty-type
- opts absent → `throws /string\[\]/` **before any apiBase/network work** (fail closed). ✅
- `opts={}` (no allowedOrigins) → throws. ✅
- `allowedOrigins: []` → throws. ✅
- `allowedOrigins: "https://api.test"` (non-array) → throws `/string\[\]/`. ✅
- `[123]` / `["   "]` / `["https://"]` → throws (`string[]` / `absolute URL`). ✅

### Allowlist entries re-validated (cannot smuggle the very targets the host gate refuses)
- `http://…`, `ftp/ws/file/data` entry → `/https/`. ✅
- `https://user:pass@host` entry → `/credentials/`. ✅
- `https://127.0.0.1`, `https://localhost`, IPv6 literal entry → `/not an allowed target/`. ✅

### apiBase exact origin membership
- origin on list → accepted; off-list (`evil.test`) → `/allowlist/`. ✅
- subdomain `evil.api.test` vs allowed `api.test` → **not** confused → rejected. ✅
- differing port `api.test:8443` vs `api.test` → distinct origin → rejected. ✅
- trailing-slash entry `https://api.test/` → normalizes to same origin → accepted. ✅
- allowlist entry with path+query `https://api.test/foo?x=1#h` → `.origin` collapses → accepted. ✅
- **trailing-dot origin matching is fail-closed BOTH directions:** dot-entry vs plain-apiBase and plain-entry vs dot-apiBase both **reject** (origins `https://api.test.` ≠ `https://api.test`). A trailing dot can never smuggle past membership. ✅

### Ports / trailing dots / IDN / IP / credentials on the host gate
- **IPv4 obfuscation** `127.1`, `0x7f000001`, `2130706433`, `0177.0.0.1`, `0`, `0x0` → WHATWG canonicalizes to dotted-decimal → `IPV4_LITERAL` rejects. ✅
- `127.0.0.1.` / `127.0.0.1..` → canonicalize to `127.0.0.1` → rejected. ✅
- **all-trailing-dots strip** `localhost..`, `localhost...`, `svc.localhost..`, encoded `localhost.%2e` → `.replace(/\.+$/,"")` → rejected (this is the P3-1 gap from the prior round, now closed). ✅
- **IDN/homoglyph** fullwidth `loｃalhost` → WHATWG IDNA → `localhost` → rejected. ✅
- IPv6 `[::1]`/`[fe80::1]`/`[2001:db8::1]` → `startsWith("[")` → rejected. ✅
- credentials `user@` / `user:pass@` on apiBase → `/credentials/`. ✅

### Name-based SSRF model (the design's crux)
- `metadata.google.internal` is a resolve-free-legal **name** → accepted **only** when the caller explicitly lists `https://metadata.google.internal`; rejected when absent or when a different origin is allowed. Delegating name-resolution confinement to a caller-observed allowlist is the correct and honestly-documented model for a parse-time gate with no DNS. ✅

### Templates / control / backslash (origin-escape)
- backslash `/\host`, `/\/host`, mid-string `/a/b\c`, and NUL/TAB/LF/CR control bytes → rejected. ✅
- protocol-relative `//host`, absolute-url, scheme-embedding `/redirect://` → rejected via the **resolution proof** (resolve against `https://blueprint.invalid/`; require `probe.origin` unchanged and `href` stays under the sentinel). ✅
- Fuzzed on-origin oddities (`/..//evil`, `/./x`, `/%2e%2e/x`, `/@evil.test/p`, `/#//evil`, `/;@evil`, `/x/../../y`) all resolve **on-origin** and are correctly accepted — none escape origin. ✅
- `:param` detection widened to `[A-Za-z0-9_]` incl. digit-led `:1`; a placeholder without a `forEach` set is rejected. Value **encoding** is explicitly the engine's job (PR-C1a) and documented at the seam. ✅

### State table
- `transition(state,event)` guards `typeof===string` + `Object.hasOwn` on both table and row; `__proto__`, `constructor`, `toString`, `hasOwnProperty`, `valueOf` as **either** argument → `null`. Terminal states re-arm only via explicit `RESET`. Exhaustively confirmed. ✅

### Site-agnostic
- The allowlist is **injected** (`opts.allowedOrigins`); `shared/replay/*` contains **zero** hardcoded competitor origins. "truecoach"/"app.truecoach.co" appear only as a provenance label and doc/test example. ✅

---

## Findings (all non-blocking, P3)

**PR4-B-R4-P3-1 — attested `cap=400` vs reproducible CI `cap=600` (truthfulness).**
The "Honest counts + CI (real, reproducible at head)" fenced block quotes `cap=400`, but `check-prod-loc.mjs` defaults to `600` and `ci.yml` sets no `PROD_LOC_CAP`, so CI literally prints `cap=600`. `prod_added=400` is accurate and the canonical-400 is met exactly, but the 400 cap is **doctrinal, not machine-enforced** — a later chained PR could reach ~500 prod LOC and pass CI while breaching the stated canonical cap. Recommend either setting `PROD_LOC_CAP=400` in `ci.yml` or quoting the real `cap=600` line and labelling 400 as the doctrinal target.

**PR4-B-R4-P3-2 — stale `Head: 866cd2e` in PR body header (documentation).**
The body top-line still names the prior re-audit head; the true audited head is `8972807`. All narrative below is correct for `8972807`. Cosmetic.

**PR4-B-R4-P3-3 — `includes("://")` over-rejects benign paths (over-restriction, fail-safe).**
A legitimate root-relative template carrying `://` inside a query/fragment (e.g. `/redirect?url=https://x`) is rejected even though it resolves on-origin and the sentinel-resolution proof already confines it. Over-strict (never under-strict) → not a security defect; flagged so the engine seam (PR-C1a) is aware of the constraint.

---

## Bottom line

The security thesis this PR exists to ship — a **fail-closed, required, caller-injected `allowedOrigins` capability** plus resolve-free host/scheme/credential/template confinement, with name-resolution confinement honestly delegated to the caller-observed allowlist — holds under independent adversarial probing. No bypass of the required-capability gate, the origin-membership check, the loopback/IP-literal/IDN host gate, the trailing-dot strip, the template origin-escape proof, or the prototype-safe state table was found. The attested boundary/ratio/tests/CI/inertness/docs claims are truthful at `8972807`, modulo the P3-1 `cap` wording. **PASS, non-blocking.**
