# EXT-PR4 — Lens A LIVE re-audit (read-only)

- **PR:** #4 — `feat(replay): site-agnostic blueprint contract + bounded state machine`
- **Repo:** BradleyGleavePortfolio/tgp-importer-extension
- **Head audited:** `866cd2ec3deb05f9b48ee8645ab291511a0e4f55` (matches requested `866cd2e`) — **resolved & confirmed**
- **Base / merge-base:** `main` @ `a8563853758bc369b01d9f1f7e03a28db8a520ef`
- **Lens:** A, angry full re-audit, ANY P0–P3
- **Mode:** read-only. Nothing modified, nothing merged. (Files were materialized into a scratch tree only to run the suite, then removed; `git status` clean.)
- **VERDICT: CLEAN — zero P0/P1/P2/P3 defects.** One sub-threshold P4 hardening observation recorded below.

---

## 1. Scope / diff truth

`git diff --name-status main 866cd2e`:

```
A docs/DECISION_V03_AUTONOMOUS_CRAWL.md   (+200)
M package-lock.json                        (+2/-2  version bump 0.2.0-design -> 0.3.0-rc.1)
A shared/replay/blueprint.js               (+296)
A shared/replay/state.js                   (+100)
A test/replay-blueprint.spec.js            (+561)
A test/replay-state.spec.js                (+285)
```

- `background.js`, `popup/*`, manifest, `_interface.js`, `TrueCoachExtractor` — **untouched**. The wiring-layer findings the PR body defers to PR-C1b (source-`AuthLostError` scope, single-flight guard, `isTrustedExtensionPage` gate, real popup test, e2e bearer) **cannot exist in this diff** — confirmed by name-status. Deferral is honest.
- package-lock change is a pure `version` string bump; no dependency/integrity/resolved-url changes → no supply-chain surface.

## 2. Counts / caps / density (reproduced at head)

| Metric | Claimed | Reproduced | Result |
|---|---|---|---|
| prod added (blueprint 296 + state 100) | 396 | 396 (`--numstat`) | ≤ 400 cap **OK** |
| prod removed | 0 | 0 | OK |
| test added (561 + 285) | 846 | 846 | OK |
| test:src ratio | 2.136 | 846/396 = 2.1363… | ≥ 2 floor **OK** |
| control bytes in tracked source | 0 | 0 raw C0/DEL bytes across all 4 src/test files | **OK** |

The 400 cap (canonical R23/R76, stricter than repo-CI 600) governs; no exception requested. Counts are line-accurate (all files UTF-8 text, no binary-blob measurement artifact).

## 3. CI / tests

- `npx vitest run test/replay-blueprint.spec.js test/replay-state.spec.js` → **143 passed** (101 blueprint + 42 state), 0 failed, at head.
- Full 21-file / 357-test suite claimed by the PR body could **not** be run in this environment (repo is a 10% sparse checkout; the other 19 spec files are not materialized). This is an environment limitation, **not a defect** — the two files this PR adds pass in full, and the untouched files are byte-identical to `main`.
- Tests are behavioral (exercise `normalizeBlueprint`/`transition` directly), not source-greps. Every rejection path, the SSRF matrix, template escapes (incl. raw TAB/LF/CR + backslash variants), digit-led `:param`, and all six prototype keys are pinned.

## 4. Re-verification of the four prior-head (16a03c5) fixes

Each re-checked by running attack inputs through the **actual** module at 866cd2e, not by reading tests.

| Prior finding | Fix at head | Independent re-verification |
|---|---|---|
| **P2-A / Lens B P1 — template origin-escape** (`/\host`, `/<TAB>/host` collapse to `//host`) | reject `[\\\x00-\x1F\x7F]`, reject `//`/`://`/non-`/`, then resolve vs `https://blueprint.invalid/` sentinel and require origin unchanged + href prefix | **HOLDS.** `"/\\evil.test"`, `"/\\/evil"`, `"/a/b\\c"`, raw `\t \n \r`, `\x00`, `\x7f`, `//evil`, `https://evil`, `/redirect://evil` all rejected. Every *accepted* template (`/..//evil`, `/@evil.com`, `/%2f%2fevil.com`, space variants) stays on the sentinel origin — mechanical proof is sound. Sentinel uses reserved `.invalid` TLD (never resolves). |
| **P3-A — trailing-dot loopback** (`localhost.`, `svc.localhost.`) | `.replace(/\.$/,"")` before localhost check | **HOLDS for the exploitable single-dot forms.** `https://localhost./`, `https://svc.localhost./`, `https://127.0.0.1./` all rejected. (Weaker double-dot variant → §6 observation.) |
| **P3-B — prototype-key transitions** | `Object.hasOwn` + `typeof===string` guards | **HOLDS.** `transition("__proto__"/"constructor"/"toString"/"hasOwnProperty"/"valueOf"/"isPrototypeOf", …)` and the same as state → all `null`. Non-string state/event → `null`. `STATE`/`EVENT` frozen. |
| **Lens B P3 — digit-led `:param`** | regex widened to `:[A-Za-z0-9_]` | **HOLDS.** `"/t/:1"` throws `no forEach`; `"/t/:1"` with an earlier `collectAs` set accepted. Underscore-led `:_ref` also recognized. Encoding invariant explicitly deferred to engine seam (PR-C1a) in-comment. |

## 5. Fresh attack surface swept (all rejected / safe at head)

- **Scheme:** `http/ftp/ws/gopher/file/data` rejected; `https` only.
- **IP obfuscation (WHATWG canonicalizes → dotted-quad → regex catches):** decimal `2130706433`, hex `0x7f000001` / `0xa9fea9fe` (metadata), octal `017700000001`, short `127.1`, `0` (→`0.0.0.0`) — **all rejected**. Metadata `169.254.169.254` rejected. Public literal `8.8.8.8` rejected (address-by-name-only invariant).
- **IPv6:** `[::1]`, `[fe80::1]`, `[2001:db8::1]`, `[::ffff:127.0.0.1]`, `[::ffff:7f00:1]` — all rejected (`[` prefix).
- **IDN / homoglyph:** `ⓛocalhost`, fullwidth `ｌocalhost`, `①②⑦.0.0.1`, `0177.0.0.1` — normalized by IDNA/URL then rejected.
- **Credential smuggling:** `user:pass@h`, `user@h`, `good.com@127.0.0.1` — rejected (credential check + host check).
- **allowlist capability:** off-list origin, differing port, subdomain-vs-parent (`evil.api.test` vs `api.test`), empty allowlist, `https://` host-less entry, non-array, malformed entry — all rejected; trailing-slash normalization + multi-entry match accepted. Intrinsic https/host checks still fire even when an allowlist is supplied. Allowlist is caller-injected (opts), never hardcoded → **site-agnostic invariant intact** (no competitor endpoint map in core; only doc-comment mentions of "truecoach").
- **State machine:** illegal/skip/terminal-to-terminal edges → `null`; RESET only re-arms terminals; pure/idempotent.

## 6. Sub-threshold observation (NOT a P0–P3; recorded for completeness)

- **P4 (hardening) — double-trailing-dot host accepted.** `isForbiddenHost` strips only a *single* terminal dot (`/\.$/`), so `https://localhost../` and `https://127.0.0.1../` are **accepted** by the parse gate. **Not exploitable:** WHATWG parses these as domain names (not IP literals), and they fail DNS resolution (`ENOTFOUND` — empty label), so no loopback/metadata target is reachable; the same WHATWG host parsing governs the real Chrome fetch path. The exploitable single-dot forms are correctly rejected. Optional strengthening: `.replace(/\.+$/,"")`. Left to author's discretion; does **not** block merge.

## 7. Conclusion

Every prior template / backslash / C0-control / trailing-dot / prototype-key / digit-param fix is present and independently proven at `866cd2e`. No new SSRF, origin-escape, URL-normalization, IDN, IP-literal, private-host, credential, path, control-byte, state, site-agnostic, count, density, or docs-truth defect was found. Deferrals are structurally impossible to violate in this diff and are truthfully scoped. PR body claims match reproduced reality.

**Zero P0–P3 → CLEAN.**
