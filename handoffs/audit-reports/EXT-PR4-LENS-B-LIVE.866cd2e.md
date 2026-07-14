# EXT-PR4 — LENS B LIVE RE-AUDIT (independent)

- **PR:** #4 — `feat(replay): site-agnostic blueprint contract + bounded state machine`
- **Head audited (exact):** `866cd2ec3deb05f9b48ee8645ab291511a0e4f55`
- **Base:** `main` (`a856385`)
- **Lens:** B, independent read-only. Lens A material not read; findings derived solely from the live tree at this head.
- **Verdict:** **PASS — non-blocking.** 0×P0, 0×P1, 0×P2, 2×P3. **NOT CLEAN** (two P3 hardening gaps below). No blocking findings.

---

## Scope of diff (verified truthful)

`git diff --numstat main..866cd2e`:

| file | +add | -del | class |
|---|---|---|---|
| `shared/replay/blueprint.js` | 296 | 0 | prod |
| `shared/replay/state.js` | 100 | 0 | prod |
| `test/replay-blueprint.spec.js` | 561 | 0 | test |
| `test/replay-state.spec.js` | 285 | 0 | test |
| `docs/DECISION_V03_AUTONOMOUS_CRAWL.md` | 200 | 0 | docs |
| `package-lock.json` | 2 | 2 | ignore (version bump 0.2.0-design → 0.3.0-rc.1) |

- **prod_added = 396** (blueprint 296 + state 100), removed 0. Under the canonical R23/R76 cap of **400** and the repo-CI default cap of **600**. OK.
- **test_added = 846**, ratio **846/396 = 2.136 ≥ 2.0**. OK.
- Line-count classification re-derived from `scripts/lib/git-diff.mjs::classify` — `.js`/`.mjs`, non-`test/`, non-`scripts/`, non-`node_modules` → prod. `shared/replay/*.js` correctly counts as prod; the lockfile (`.json`) is correctly ignored (not gamed). Counts are honest — no binary/`-` numstat artifact.
- **Bytes:** all four `.js` files are UTF-8, **0 NUL/control bytes** (`grep -P '[\x00-\x08\x0E-\x1F\x7F]'` = 0). Non-ASCII present is limited to typographic em-dash/§/→/⇒ in comments — benign.

## Mechanical gates (re-run at head, all green)

- `npx vitest run` → **21 files / 357 tests passed**.
- `check-banned.mjs` → OK (no `.catch(()=>null)` / empty `catch{}` in prod; R3 commit identity clean — no AI/agent/co-author tokens; authored+committed as Bradley Gleave).
- `check-prod-loc.mjs` → `prod_added=396 cap=600` OK.
- `check-flag-discipline.mjs` → `PAIRING_ENABLED=true` OK.
- `check-test-ratio.mjs` → `ratio=2.136 floor=2` OK.

## Inertness / dead-scope (verified)

- No `import`/reference to `shared/replay/*` from `background.js`, `popup/`, `content/`, or any non-test prod file (`grep` = NONE). Modules are unreachable at runtime; revert-to-disable holds.
- Neither module performs a network request or touches `chrome.*`.
- `background.js` and `popup/*` unmodified in the diff — the deferred wiring findings (source-`AuthLostError` scope, single-flight, `isTrustedExtensionPage` gate, real popup CTA test, e2e bearer) genuinely cannot exist here. Deferral to PR-C1b is truthful.

## Site-agnostic (verified)

- No competitor endpoint map hardcoded in prod. `truecoach` appears only as a comment example / provenance-label doc string. The `allowedOrigins` allowlist is caller-injected (`opts.allowedOrigins`), never static in core. Claim holds.

---

## Prior fixes — independently re-verified as GENUINELY FIXED

1. **Template origin-escape (backslash / control).** `normalizeStep` rejects `[\\\x00-\x1F\x7F]` outright, then resolves the template against sentinel `https://blueprint.invalid/` and requires `probe.origin === SENTINEL && probe.href.startsWith(SENTINEL+"/")`. Live-probed: `"/\\evil"`, `"/\\/evil"`, `"/a/b\\c"`, raw TAB/LF/CR, and `"/a\r\nHost: evil"` → all rejected. Fullwidth solidus `"/／evil"` and `"/%2f%2fevil"` are **accepted but stay on-origin** (percent-encoded path, mechanical resolve confirms origin unchanged) — correct, not an escape. **VERIFIED.**
2. **Trailing-dot loopback (single dot).** `isForbiddenHost` lowercases and strips one trailing dot; `localhost.`, `svc.localhost.`, `LOCALHOST.` → rejected. IDNA-normalized ideographic stop `localhost。` (U+3002) → `localhost.` → rejected. **VERIFIED for the single-dot case** (see P3-1 for the incomplete multi-dot case).
3. **Prototype-key state transitions.** `transition` guards `typeof state/event === "string"` then uses `Object.hasOwn(TABLE, …)` / `Object.hasOwn(row, …)`. Exhaustive matrix test + explicit `__proto__`/`constructor`/`toString`/`hasOwnProperty`/`valueOf`/`isPrototypeOf` cases return `null`. `STATE`/`EVENT` frozen. **VERIFIED.**
4. **Digit-led `:param`.** `hasParam = /:[A-Za-z0-9_]/`; `"/t/:1"` requires a `forEach` (throws without), accepted with one. **VERIFIED.**
5. **IPv4 canonicalization.** Live-probed decimal `2130706433`, hex `0x7f000001`, octal `0177.0.0.1`/`010.0.0.1`, trailing-dot `127.0.0.1.` — WHATWG canonicalizes all to dotted-decimal, caught by `IPV4_LITERAL`. IPv6 `[::1]`/`[fe80::1]` caught by `[`-prefix. **VERIFIED.**

---

## NEW FINDINGS

### P3-1 — Incomplete trailing-dot normalization (multi-dot loopback bypass); incomplete fix of a claimed-fixed finding
- **Where:** `shared/replay/blueprint.js:53` — `const host = hostname.toLowerCase().replace(/\.$/, "");`
- **What:** the strip removes only **one** terminal dot. Hostnames with ≥2 trailing dots survive the loopback rule:
  - Live-probed against `normalizeBlueprint`: `https://localhost../base`, `https://localhost.../base`, `https://svc.localhost../base` → **ACCEPTED**. `https://localhost.%2e/base` (WHATWG decodes to `localhost..`) → **ACCEPTED**.
  - WHATWG keeps the hostname as `localhost..`; after one-dot strip it is `localhost.`, which `!== "localhost"` and does not end with `.localhost`, so it passes.
- **Severity rationale (P3, non-blocking):** this is the *same class* the PR narrative claims closed ("trailing-dot loopback bypass"); the fix handles only the single-dot form. Practical exploitability is resolver-dependent — in this sandbox `dns.lookup` returns `ENOTFOUND` for both `localhost.` and `localhost..`, but the single-dot guard was added precisely because *some* resolvers resolve `localhost.` to loopback; the identical reasoning applies to the multi-dot form on other stacks. Module is inert, so there is no live exposure today.
- **Fix:** strip all trailing dots — `.replace(/\.+$/, "")` — and add `localhost..` / `svc.localhost..` reject tests.

### P3-2 — Name-based SSRF residual: link-local/private targets reachable by name when no allowlist is supplied
- **Where:** `shared/replay/blueprint.js:47-61` (`isForbiddenHost`) + `:82` (allowlist optional) + file comment `:32-33` ("no IP-literal / loopback / link-local / private hosts").
- **What:** the host gate is resolve-free and name-literal only. With `allowedOrigins` absent (`null`), any https host that is not an IP literal and not `*.localhost` is accepted — including `https://metadata.google.internal` (live-probed → **ACCEPTED**), which resolves to link-local `169.254.169.254`, and any RFC1918 host addressed by name. The file/doc claim "no … link-local / private hosts" is true only for **IP literals**; a **name** that resolves to those targets passes.
- **Severity rationale (P3 / informational, non-blocking):** explicitly documented as out of scope (`:44` "resolve-free check — DNS-rebinding defence is out of scope for a parse-time gate") and mitigated by the injected `allowedOrigins` capability. Module is inert. This is a known, documented tradeoff, not a defect in an inert contract PR.
- **Required follow-up (carry to PR-C1b):** the wiring layer MUST inject a concrete `allowedOrigins` for the data-only verification blueprint so the credentialed crawl cannot be steered to a name-addressed internal target. Recommend tightening the doc/comment wording to "no IP-literal loopback/link-local/private hosts; name-resolution confinement is delegated to the injected allowlist."

---

## Non-findings noted (no action required)
- `rateLimitMs: Infinity` (or NaN) → floored to `0` via `Number.isFinite` guard (`:268`) → no throttle. `rateLimitMs` is a politeness knob from a trusted blueprint, not a security boundary; input is nonsensical. Informational only.
- Placeholder value-encoding (`encodeURIComponent` of `:param` substitutions) is owned by the engine (PR-C1a) and documented at the seam (`:199-204`); this PR correctly fixes only placeholder *syntax*. Cross-module consistency of the detection regex vs the engine substitution regex cannot be verified here (engine not in this diff) — flag for PR-C1a review.

## Bottom line
The four prior Lens A/B findings are genuinely fixed with real behavioral tests. Counts, bytes, gates, R3 identity, inertness, and site-agnosticism all hold and are truthful. Two P3 hardening gaps remain (incomplete multi-dot trailing-dot strip; documented name-based SSRF residual). Both are non-blocking for an inert contract PR. **Not CLEAN, but no blocking issues — PASS.**
