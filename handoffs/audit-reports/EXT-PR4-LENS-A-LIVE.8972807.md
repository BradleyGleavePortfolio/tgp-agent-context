# EXT-PR4 — Lens A LIVE re-audit (read-only)

- **PR:** #4 — `feat(replay): site-agnostic blueprint contract + bounded state machine`
- **Repo:** BradleyGleavePortfolio/tgp-importer-extension
- **Head audited:** `8972807a50d4996518ef9f9e5ee308ef4c30a04d` (matches requested `8972807`) — **resolved & confirmed, no mismatch**
- **Base / merge-base:** `main` @ `a8563853758bc369b01d9f1f7e03a28db8a520ef`
- **Lens:** A — angry FULL re-audit, ANY P0–P3
- **Mode:** read-only. Nothing modified, nothing merged. (Sparse checkout was expanded to materialize files for reading/running the suite; `git status` clean, detached HEAD at the audited SHA.)
- **VERDICT: CLEAN — zero P0/P1/P2/P3 defects.** Two sub-threshold P4 observations recorded (§7).

---

## 1. Head verification (mismatch = auto-fail; did not trigger)

`gh pr view 4 → headRefOid = 8972807a50d4996518ef9f9e5ee308ef4c30a04d`; `git rev-parse HEAD` after checkout of the OID = same. Requested `8972807` ⇒ **exact prefix match. Proceeding.**

## 2. Scope / diff truth

`git diff --numstat main...8972807`:

```
205  0  docs/DECISION_V03_AUTONOMOUS_CRAWL.md
  2  2  package-lock.json
300  0  shared/replay/blueprint.js
100  0  shared/replay/state.js
659  0  test/replay-blueprint.spec.js
285  0  test/replay-state.spec.js
```

- `background.js`, `popup/*`, `manifest.json`, `extractors/_interface.js`, `TrueCoachExtractor`, all `shared/*` except the two new `shared/replay/*` files — **untouched**. The wiring-layer findings the PR body defers to PR-C1b (source-`AuthLostError` scope, single-flight guard, `isTrustedExtensionPage` gate, real popup test, e2e bearer) **cannot exist in this diff** — confirmed by the file list. Deferral is structurally honest.
- `package-lock.json` change is a pure `version` string bump (`0.2.0-design` → `0.3.0-rc.1`) at both the root and the packages[""] node — **no** dependency/`resolved`/`integrity` edits ⇒ zero supply-chain surface.
- No runtime importer of the new modules anywhere outside `test/` (`grep` across repo): the contract + state machine are **inert by construction**, exactly as the ROLLBACK/STOP section claims.

## 3. Counts / caps / density (reproduced at head, via the shipped CI gates)

| Metric | Claimed | Reproduced | Result |
|---|---|---|---|
| prod added (blueprint 300 + state 100) | 400 | 400 (`check-prod-loc.mjs`) | ≤ 400 canonical cap **OK** (also ≤ CI-default 600) |
| prod removed | 0 | 0 | OK |
| test added (659 + 285) | 944 | 944 | OK |
| test:src ratio | 2.360 | 944/400 = 2.360 (`check-test-ratio.mjs`) | ≥ 2.0 floor **OK** |
| raw C0/DEL bytes in the 4 src/test files | 0 | 0 | OK |

`prod ≤ 400` and `ratio ≥ 2` both hold at the exact canonical thresholds. CI runs `check-prod-loc.mjs` with the 600 default; the stricter canonical 400 is met on the nose (400), so the value satisfies both without an exception request.

## 4. CI / gates / tests (all reproduced green at head)

- **Full suite:** `npm test` → **373 passed / 373**, 21 files, 0 failed.
- **Banned-token net + R3 identity** (`check-banned.mjs`): OK. All four branch commits authored **and** committed as `Bradley Gleave <bradley@bradleytgpcoaching.com>`; no `claude|anthropic|co-authored-by|copilot|openai|gpt|assistant|noreply@` token in any author/committer/message. No silent `.catch(()=>null)` / empty `catch {}` in prod.
- **Flag discipline** (`check-flag-discipline.mjs`): `PAIRING_ENABLED=true` — no dark-merged auth dead-end.
- Tests are behavioral (exercise `normalizeBlueprint`/`transition` directly), not source-greps.

## 5. Re-verification of every prior finding (run through the actual module at 8972807)

| Prior finding (head) | Status at 8972807 | Independent re-verification |
|---|---|---|
| **Template origin-escape** (`/\host`, `/<TAB\|LF\|CR>/host` collapse to `//host`) | HOLDS | Reject `[\\\x00-\x1F\x7F]`, reject `//`/`://`/non-`/`, then resolve vs `https://blueprint.invalid/` sentinel requiring unchanged origin + href prefix. `/\evil`, `/\/evil`, `/a/b\c`, raw `\t \n \r`, `//evil`, `https://evil`, `/redirect://evil` all throw. `.invalid` sentinel never resolves. |
| **Trailing-dot loopback** (`localhost.`, `svc.localhost.`) | HOLDS + **prior P4 now fixed** | Strip changed `/\.$/` → **`/\.+$/`** (ALL trailing dots). Verified: `localhost.`, `localhost..`, `localhost...`, `svc.localhost.`, `svc.localhost..`, `127.0.0.1.`, `127.0.0.1..`, and `localhost.%2e` (WHATWG decodes → `localhost..` → stripped) all rejected. The 866cd2e double-dot P4 is closed. |
| **Prototype-key transitions** | HOLDS | `Object.hasOwn` + `typeof===string` guards. `transition("__proto__"/"constructor"/"toString"/"hasOwnProperty"/"valueOf"/"isPrototypeOf", …)` and same-as-state → all `null`. `STATE`/`EVENT` frozen. |
| **Digit-led / underscore-led `:param`** | HOLDS | Regex `:[A-Za-z0-9_]`. `"/t/:1"` and `"/t/:_ref"` throw `no forEach`; each accepted when fed by an earlier `collectAs`. Value ENCODING explicitly deferred to the engine seam (PR-C1a) in-comment. |
| **Required non-empty allowedOrigins** | HOLDS + **hardened** | Now a REQUIRED capability: absent `opts`, `{}`, `[]`, non-array, or any non-string entry → throws `string[]` **before any network call**. Previously derivable; now fails closed. |
| **Exact origin membership** | HOLDS | `allowedOrigins.has(url.origin)`. Differing port (`:8443`), subdomain-vs-parent (`evil.api.test` vs `api.test`), trailing-dot origin (`api.test.` vs `api.test`) all rejected; trailing-slash allowlist entry normalized; multi-entry match accepted. |
| **Allowed-origin safety** (allowlist can't smuggle a forbidden target) | HOLDS | Each entry runs the same `assertSafeUrl`: loopback, IP-literal, `http`, credentialed, host-less `https://` entries all rejected. |
| **Site-agnostic / no competitor map** | HOLDS | `shared/replay/*` has zero competitor logic — only three doc-comment mentions of "truecoach" (the `platform` provenance-label example + two "never a hardcoded competitor map" cautions). Allowlist is caller-injected via `opts`, never hardcoded. No `chrome.*`, no `fetch`, no imports. |

## 6. Fresh attack surface swept (all rejected / safe at head)

- **Scheme:** `http/ftp/ws/gopher/file/data` rejected; `https` only — enforced on apiBase **and** every allowlist entry.
- **IP obfuscation (WHATWG canonicalizes → dotted-quad / bracketed → gate catches):** decimal `2130706433`→`127.0.0.1`, hex `0x7f.0.0.1`→`127.0.0.1` / `0xA9FEA9FE`→`169.254.169.254` (metadata), octal `0177.0.0.1`, short `1.1`→`1.0.0.1`, `0`→`0.0.0.0`, IPv4-mapped IPv6 `[::ffff:127.0.0.1]`→`[::ffff:7f00:1]` and `[::ffff:169.254.169.254]` — **all rejected end-to-end through `normalizeBlueprint`**.
- **IPv6:** `[::1]`, `[fe80::1]`, `[2001:db8::1]` — rejected (`[` prefix).
- **IDN / homoglyph:** fullwidth `ｌｏｃａｌｈｏｓｔ` → IDNA-normalized to `localhost` → rejected.
- **Name-based SSRF (the model's core):** `metadata.google.internal` passes every resolve-free literal check, so the ONLY thing that stops it is the caller not having observed it — verified: rejected when opts absent (`string[]`), rejected when a *different* origin is allowed (`allowlist`), accepted ONLY when explicitly on the allowlist. Correct fail-closed delegation of DNS-resolution confinement.
- **Credential smuggling:** `user:pass@h`, `user@h` rejected on both apiBase and allowlist entries.
- **State machine:** exhaustive 7×8 = 56-pair matrix — 15 legal edges land on their documented target; all 41 illegal pairs (incl. terminal-to-terminal, skip, RESET-on-non-terminal, non-string, prototype keys) → `null`. RESET re-arms only terminals. Pure/idempotent; constants frozen.

## 7. Sub-threshold observations (NOT P0–P3; recorded for completeness)

- **P4 (docs nit) — IDIOT-INDEX undercount.** §IDIOT-INDEX (line 104) says "engine + schema + state are ~230 prod LOC," which is numerically loose against the shipped schema(300)+state(100)=400 and includes an engine not in this PR. **Immaterial:** the authoritative Scope-Split (line 25) and Scope-Deliberately-Not-Built (line 197) sections state the shipped count correctly (blueprint 300 + state 100 = 400) and the reproduced numstat confirms it. Qualitative-section prose only; no shipped-count misrepresentation.
- **P4 (hardening) — `readPath` traverses inherited keys.** `readPath(body, path)` does `cur[key]` with no own-property guard, so a body-relative path of `["__proto__", …]`/`["constructor"]` reads a prototype member. **Not exploitable in this PR:** it is a pure READ (no assignment ⇒ no prototype pollution), `path` originates from the author-controlled blueprint (validated non-empty strings), `extractItems` discards any non-Array result, and nothing invokes `readPath` at runtime (engine ships in PR-C1a). Optional: guard traversal with `Object.hasOwn`/`isRecord`-own-key when the engine lands. Left to author discretion; does not block merge.

## 8. Conclusion

Head matches `8972807` exactly. Every prior template / backslash / C0-control / trailing-dot / prototype-key / digit-param / allowlist finding is present and independently proven at this head; the one prior P4 (double-trailing-dot) is now **fixed** by the `/\.+$/` all-dots strip, and the allowlist is **hardened** from optional to a required fail-closed capability. `prod=400 ≤ 400` and `ratio=2.360 ≥ 2` reproduced via the shipped gates; full 373-test suite, banned/R3-identity, and flag-discipline all green. Site-agnostic capability confirmed (no competitor endpoint map in core; allowlist caller-injected). Deferrals are structurally impossible to violate in this diff and truthfully scoped. No new SSRF, origin-escape, URL/IDN/IP-literal, credential, path, control-byte, state, count, density, CI, R3, or docs-truth defect found.

**Zero P0–P3 → CLEAN.**
