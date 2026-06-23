# H4 Split Audit — Lens A (DEPTH, Opus) — R5 — PR #466 (H4.F auto-flipper) — HIGH-RISK

**STATUS: COMPLETE**

## BUILD MATRIX (R124)
| Item | Value |
|---|---|
| backend repo | BradleyGleavePortfolio/growth-project-backend |
| ctx repo | BradleyGleavePortfolio/tgp-agent-context |
| PR | #466 — H4.F auto-flipper (HIGH-RISK: secret-mutating execFileSync path) |
| PR head SHA (audited) | `c624492e8c24870f76ced2c82764e0c18ff13cd6` |
| Recorded head SHA (brief) | `c624492e8c24870f76ced2c82764e0c18ff13cd6` — **byte-match ✓** |
| main base SHA | `8467c6f568a51337a7acbfb14f72ac85b996d605` |
| Diff stat | +3265 / −3339 (replaces prior prod-readiness modules; net NEGATIVE LOC) |
| Files in scope | `test/prod-readiness/auto-flipper.ts` (new, 1213 LOC), `auto-flipper.spec.ts` (new, 1606 LOC), `redactor.spec.ts` (new, 446 LOC) |
| SHA recheck at verdict (R124 final) | `c624492e8c24870f76ced2c82764e0c18ff13cd6` — **no drift ✓** |
| Audit start (UTC ISO-8601) | 2026-06-23T22:46:00Z |
| Audit end (UTC ISO-8601) | 2026-06-23T22:50:41Z |

> Note: the brief listed only `auto-flipper.ts` + `.spec.ts` in the diff. The live diff also adds `redactor.spec.ts` and removes several sibling prod-readiness modules (`learning-ledger`, `operator-keys-generator`, `reporter`, `stub-scanner`, `OPERATOR_KEYS_NEEDED.md`). This matches the R4 build-matrix description (net-negative LOC, replacing prior modules) and is in-scope for the auto-flipper machinery audit. No anomaly.

## YOUR JOB (R11 verbatim)
Findings the operator does not already have are below. Where evidence contradicts a prior finding it is reported. The brief is not tainted (no pre-filled findings, no pressure framing); the one-time parallel-dispatch exception is explicitly operator-approved and does not affect my independence — I audited only, merged nothing.

## METHOD (R10 exhaustive, R11 independent re-derivation)
Extracted `auto-flipper.ts` at the recorded SHA, stubbed `registry-loader`, compiled with the repo's own TypeScript (`node_modules/typescript`), and executed runtime probes against the compiled module — I did NOT trust the source comments' claims about themselves. Probe families: (A) YAML block-scalar grammar regex counter-examples (`VALUE_RE` and `HEADER_RE`), (B) end-to-end `redactSecretValues` leak tests across every header variant + js-yaml cross-check, (C) FLY_BIN identity capture / prototype chain / mtimeNs-unavailable / same-path swap, (D) `FlyBinIdentityMismatch` swallow path through `doCommit`, (E) `execFileSync` argv/shell/env, (F) audit-JSON value absence, (G) commit mutex release on exception, (H) gate placement on exported helpers, (I) banned-cast / `jest.mocked` wiring.

## PRIOR-ROUND FINDING CLOSURE (verify R4 P1s are closed at this head)
- **R4 F001 (P1, YAML chomping/indent grammar)** — the full grammar regex `/^([|>])(?:([+-])([1-9])?|([1-9])([+-])?)?$/` is now present (line 394) and pass-f's guard + pass-h's `HEADER_RE` both honor it. I counter-exampled every chomping/indent edge: `|-`,`|+`,`>-`,`>+`,`|2`,`|2-`,`|-2`,`>1+`,`>+1` all redact the body correctly; malformed `|---`,`|2-2`,`>-+`,`|10`,`|0` are correctly rejected by `VALUE_RE` (so pass-f does not mistreat them as headers). **The chomping/indent half of R4 F001 is CLOSED.** BUT the two enforcers have diverged on a DIFFERENT axis — trailing comments — see R5-F001 below.
- **R4 F002 (P1, FLY_BIN same-path inode swap)** — the 5-field `{dev,ino,mtimeNs,size,mode}` bigint identity snapshot is captured at `captureIdentity` (line 147), compared field-by-field in `assertFlyBinUnchanged` (line 278-287), and a same-path inode swap is correctly REFUSED with `FlyBinIdentityMismatch` (reproduced via injected fs: `ino 2 -> 999` → throws). `FlyBinIdentityMismatch` inherits the prototype chain correctly (`instanceof FlyBinIdentityMismatch` and `instanceof Error` both true; `Object.setPrototypeOf` present). **The capture/compare half of R4 F002 is CLOSED.** BUT the refusal can be swallowed downstream — see R5-F002 below.

---

## Finding R5-F001 — YAML block-scalar header with a trailing comment (`KEY: |- # …`) defeats the redactor → secret value leaks

**Priority:** P2
**Rules triggered:** R24, R59, R109, R110, R125
**File:** `test/prod-readiness/auto-flipper.ts:394` (`YAML_BLOCK_SCALAR_VALUE_RE`, pass-f guard) interacting with `:629-630` (`YAML_BLOCK_SCALAR_HEADER_RE`, pass-h) and the pass-f rewrite at `:501-513`.

**Code:**
```ts
// pass-f guard grammar — does NOT permit a trailing comment or trailing space:
const YAML_BLOCK_SCALAR_VALUE_RE = /^([|>])(?:([+-])([1-9])?|([1-9])([+-])?)?$/;
// pass-h header grammar — DOES permit a trailing comment and trailing whitespace:
const YAML_BLOCK_SCALAR_HEADER_RE =
  /^(\s*)([A-Za-z][A-Za-z0-9_-]*)\s*:[ \t]+[|>](?:[+-][1-9]?|[1-9][+-]?)?[ \t]*(?:#.*)?$/;
```

**Why it's wrong:**
The two enforcers are required by the source's own R125 comment (line 626: *"Header grammar must match pass (f)'s YAML_BLOCK_SCALAR_VALUE_RE so the two enforcers cover the identical surface"*) to recognize the **identical** surface. They do not. Pass-h's `HEADER_RE` ends with `[ \t]*(?:#.*)?$` (accepts trailing whitespace and a `# comment`), but pass-f's `VALUE_RE` ends at `$` immediately after the indicator (no comment, no trailing whitespace). Because pass-f runs FIRST and rewrites any value its guard rejects to `***`, a real block-scalar header carrying a trailing comment (`PASSWORD: |- # ignore`) is mis-rewritten to `PASSWORD: ***`, destroying the `|-` indicator. Pass-h then no longer matches the (now-`***`) header line, so the more-indented continuation line that holds the secret value is **never redacted and leaks verbatim**. This is the exact same class of defect as R4 F001 — pass-f eats the header, pass-h misses the body — just on the comment/whitespace axis instead of the chomping/indent axis.

**Counter-example input** (reproduced against the compiled module; no `secretValues` supplied, as on the `flip()` RegistryParseError sink):
```
redactSecretValues("PASSWORD: |- # ignore\n  SuperSecretValue_abc")
  => "PASSWORD: ***\n  SuperSecretValue_abc"   // SECRET LEAKS
```
`js-yaml` (the repo's YAML parser) confirms this is **valid YAML** that parses to `{ PASSWORD: "SuperSecretValue_abc" }` — a trailing comment on a block-scalar header line is legal per YAML 1.2 §8.1.1. A bare `redactSecretValues("PASSWORD: |- # x")` (no body) also wrongly emits `PASSWORD: ***`, proving the header itself is mis-classified.

**Exposure (which sinks make this live):** Like R4 F001, the value-based pass masks this when `secretValues` is supplied (the primary `commit()`/`doCommit` path seeds `collectSecretValues(plan)`). The leak is LIVE on the no-`secretValues` sink: `flip()`'s `RegistryParseError` rethrow at line 1193 — `redactSecretValues(err.message)` with no values — where a registry parse error whose message embeds such a block-scalar dump leaks the continuation line. `flyArgvContext` (line 966) takes the same no-values path but its input is non-secret verbs (low practical risk, same defective path).

**Test gap corroboration:** `redactor.spec.ts` exhaustively covers the chomping/indent grammar (lines 350-414: `|-`,`|+`,`>-`,`>+`,`|2`,`|2-`,`|-2`,`>1+`) but has **zero** coverage of the trailing-comment header variant — the exact leaking input. Pass-h's `HEADER_RE` carries a `(?:#.*)?` group that is never exercised.

**Expected fix:** Make the two enforcers actually cover the identical surface (honor the R125 invariant the comment already claims). Extend pass-f's guard to recognize a trailing comment / trailing whitespace on a block-scalar header (e.g. strip an optional `\s*(#.*)?$` before testing `VALUE_RE`, or broaden `VALUE_RE` to `/^([|>])(?:[+-][1-9]?|[1-9][+-]?)?\s*(?:#.*)?$/`), so pass-f leaves the header intact for pass-h. Add `KEY: |- # comment` and `KEY: | # comment` fixtures (with and without `secretValues`) to `redactor.spec.ts`. Do not write the fix yourself.

---

## Finding R5-F002 — A `FlyBinIdentityMismatch` (binary-swap security refusal) is swallowed by the per-row catch in `doCommit` and the loop keeps invoking the swapped binary

**Priority:** P2
**Rules triggered:** R24, R58, R59, R65, R109, R125
**File:** `test/prod-readiness/auto-flipper.ts:1140-1150` (per-row `try/catch` in `doCommit`), in conjunction with `:901` (`assertFlyBinUnchanged()` in `runFlyctl`) and the class at `:138`.

**Code:**
```ts
log(`flyctl secrets set ${row.name}=*** --app <prod>`);
try {
  run(['secrets', 'set', `${row.name}=${target}`]);   // default run = runFlyctl, which calls assertFlyBinUnchanged()
  log(JSON.stringify(auditEntry(row, before, now)));
  succeeded.push(row);
} catch (err: unknown) {
  const raw = err instanceof Error ? err.message : String(err);
  failed.push({ row, error: redactSecretValues(raw, allSecretValues) });   // FlyBinIdentityMismatch lands here too
}
```

**Why it's wrong:**
`assertFlyBinUnchanged()` is (correctly) placed OUTSIDE `runFlyctl`'s own try block, so a `FlyBinIdentityMismatch` propagates out of `runFlyctl` as designed. But in `doCommit` the runner call is wrapped in a generic per-row `try/catch` that treats EVERY thrown error identically: it is redacted, pushed as an ordinary `failed` entry, and the `for` loop **continues to the next row** — which calls `run(...)` again, re-invoking the very binary the code just declared swapped/untrusted. A `FlyBinIdentityMismatch` is a fail-closed SECURITY signal ("a same-path binary swap was detected. Refusing to run flyctl. Restart the process") — it means the resolved flyctl may be an attacker's binary. Downgrading it to a benign per-key failure and then handing the next secret's `KEY=VALUE` to the same suspect binary defeats the entire point of the F002 identity gate: the gate refuses row 1, then the loop feeds row 2's secret to the swapped binary anyway. The refusal should abort the whole commit (and ideally be re-thrown), not be retried row-by-row.

**Counter-example input** (reproduced against the compiled module):
```
plan.to_set = [FEATURE_A, FEATURE_B]
run = () => { throw new FlyBinIdentityMismatch("FLY_BIN swapped: ino 2 -> 999, refusing"); }
commit({ plan, run, env:{READINESS_AUTO_FLIP:'true'} })
  => runCalls === 2   // row B's secret was offered to the swapped binary AFTER the swap was detected on row A
  => failed = [FEATURE_A: "...swapped...", FEATURE_B: "...swapped..."]
```

**Why it's a finding, not a notable:** The message contains no secret (so it is not itself a leak — R24 not breached on the message), but the CONTROL FLOW is wrong: a security "stop everything" condition is handled as a routine retryable failure (R59 swallow-by-downgrade; R65 fail-safe direction; R125 — the F002 defense is partially undone at the call site). On a real same-path swap, every remaining `to_set` row's secret value is passed via argv to a binary of unverified provenance.

**Expected fix:** In `doCommit`, treat `FlyBinIdentityMismatch` (and arguably `FlyctlTimeoutError` re: a hung host) as fatal: re-throw it (or break the loop and surface it on the result) so no further `run(...)` invocation occurs after a binary-identity refusal. Keep the per-row continue only for ordinary flyctl exec failures. Add a spec asserting that a runner throwing `FlyBinIdentityMismatch` aborts the commit and does not invoke the runner for subsequent rows. Do not write the fix yourself.

---

## Finding R5-F003 — `runFlyctl` is exported and performs no `READINESS_AUTO_FLIP` gate — a gate-free, public secret-mutation primitive

**Priority:** P3
**Rules triggered:** R65, R109, R125
**File:** `test/prod-readiness/auto-flipper.ts:894` (`export function runFlyctl`)

**Code:**
```ts
export function runFlyctl(args: readonly string[]): void {
  warnIfPathResolvedFlyBin();
  assertFlyBinUnchanged();
  execFileSync(FLY_BIN, [...args], { stdio: ['ignore','pipe','pipe'], timeout: FLY_TIMEOUT_MS, killSignal: 'SIGTERM' });
  // ...no autoFlipEnabled(env) check anywhere in this function
}
```

**Why it's wrong:**
The binding security invariant (and `commit()` at line 1048) gate real mutation behind `READINESS_AUTO_FLIP=true` so "a stray invocation cannot mutate prod." But `runFlyctl` — the default runner — is `export`ed and contains no such gate. Any importer can call `runFlyctl(['secrets','set','FEATURE_X=true'])` and mutate a prod secret with the env gate never consulted. The brief asks precisely this: "is the gate ONLY checked at `commit()`? What if someone calls a lower-level helper that bypasses commit?" — and the answer is yes, the gate is only at `commit()`, and `runFlyctl` bypasses it. Defense-in-depth (R125) wants the gate enforced at the primitive too, not only at the orchestrator.

**Counter-example input:**
```
import { runFlyctl } from './auto-flipper';
runFlyctl(['secrets', 'set', 'FEATURE_X=true']);   // mutates prod with NO READINESS_AUTO_FLIP check
```

**Why P3 (not higher):** It requires a deliberate, hand-constructed call from another module in the same test-tree — not a stray env var or an accidental `commit()` invocation. The realpath/identity/exec verification still applies, so it cannot run an arbitrary binary. But it is a genuine belt-and-suspenders gap on a HIGH-RISK secret-mutating path that R125 would have the gate cover.

**Expected fix:** Either (a) add an `autoFlipEnabled` guard inside `runFlyctl` (reading `process.env`) so the env gate is enforced at the exec primitive as defense-in-depth, or (b) stop exporting `runFlyctl` and expose only an injectable runner type for tests, so the only public mutation entry is the gated `commit()`. Do not write the fix yourself.

---

## ITEMS PROBED AND CLEARED (depth lens — no finding)
| Brief probe | Result |
|---|---|
| Grammar regex `|---` / `|2-2` / `>-+` / `|10` / `|0` | Correctly REJECTED by `VALUE_RE` and `HEADER_RE` — no leak; pass-f does not mis-treat them as headers (verified end-to-end) |
| Tabs around header `\t|` / `|\t` (as VALUE) | `VALUE_RE` rejects both; but pass-f's `(:[ \t]+)` + pass-h's `:[ \t]+` handle a real `KEY:\t|-` header correctly — `PASSWORD:\t|-\n  secret` redacts the body. No leak. |
| `mtimeNs` unavailable on FAT/network FS | Real `fs.statSync(p,{bigint:true})` always returns `mtimeNs` as `0n` at worst (never `undefined`) on Node, so `BigInt(stat.mtimeNs)` does not throw in production. `BigInt(undefined)` DOES throw, but only reachable via a malformed INJECTED test fs — not a prod path. Noted, not a finding. (Residual: on a no-ns FS where a swap preserves dev/ino/size/mode, `mtimeNs=0n` on both sides means identity collides and the swap is undetected — but that also requires inode reuse with identical size+mode; accepted as out of practical scope for this PR.) |
| `FlyBinIdentityMismatch` prototype chain | Correct: `instanceof` both subclass and `Error`; `name` set; `Object.setPrototypeOf` present |
| `assertFlyBinUnchanged` call timing | Called per-invocation in `runFlyctl`, BEFORE the exec try block (so the refusal propagates). First-fill branch adopts current identity and proceeds (defensive). |
| Two flips in-flight on same path (race) | `_commitChain` promise mutex serializes `commit()` across callers; `try/finally release()` releases even when `doCommit` throws (verified: c2 ran/completed after c1 threw) |
| `execFileSync` argv / shell / env / stdin | Value passed via argv only (`${row.name}=${target}`); no `shell` option (defaults `false`); no `env` override; `stdin` ignored. No quoting/injection surface. |
| Audit JSON `{operator,action,key,before,after,timestamp}` | Verified: NO value field; `before`/`after` are enum labels (`missing|stale` / `set`), never the secret. `force`/`skip` audit lines likewise key-only. |
| Value in any log line | `doCommit` routes EVERY log through `redactSecretValues(line, allSecretValues)`; operator log emits `KEY=***`. No value sink found. |
| ENOENT (flyctl missing) | Clear actionable error with install-docs URL; emits `FLY_BIN` path (the binary path, not a secret) — acceptable. |
| `jest.mocked(execFileSync)` wiring | `const execFileSyncMock = jest.mocked(execFileSync);` — correctly typed, no `as`/`as unknown as` cast |
| Banned casts (R75) | Zero `as any` / `as unknown as` / `as never` / `@ts-ignore` in source or spec |
| Prototype pollution / deep nesting / base64 round-trip | Re-confirmed safe (structural walk uses `Object.entries`, JSON.parse caps depth, base64 round-trip guard) — consistent with R4 |
| R3 identity | Out of Lens A depth scope this round; R4 confirmed 4/4 commits Bradley author+committer, zero AI tokens. Not re-litigated. |

## DOCTRINE RULE COVERAGE (Lens A depth, PR #466 @ c624492e)
| Rule(s) | Verdict |
|---|---|
| R10/R11 | PASS — exhaustive line-by-line + independent re-derivation (compiled & executed counter-examples) |
| R16/R78 | PASS — single verdict line below |
| R24/R110 | **FINDING R5-F001** — secret value leaks on comment-bearing block-scalar header via no-`secretValues` sink |
| R58 | PASS — 60s execFileSync timeout + SIGTERM; FlyctlTimeoutError |
| R59 | **FINDINGS R5-F001 (leak), R5-F002 (security refusal downgraded)** |
| R65 | **FINDINGS R5-F002, R5-F003** — fail-safe direction violated at call site / gate-free primitive |
| R95 | PASS — execFileSync no-shell, no `curl|sh`, no remote-exec |
| R109 | PARTIAL — R5-F001 (leaks real value), R5-F003 (gate-free entry point) |
| R124 | PASS — SHA byte-matches; rechecked at verdict, no drift |
| R125 | **FINDINGS R5-F001 (enforcer divergence on comments), R5-F002 (F002 defense undone at call site), R5-F003 (gate not at primitive)** |
| All others (R1-R9, R12-R57 except cited, R60-R108, R111-R123, R126) | PASS / N/A — no violation observed on this test-tree diff; net-negative LOC; no prod surface |

## NEW FINDINGS SUMMARY
| ID | Severity | Rules | One-line |
|---|---|---|---|
| R5-F001 | P2 | R24/R59/R109/R110/R125 | Block-scalar header with a trailing comment (`KEY: |- # …`, valid YAML) defeats redaction: pass-f's `VALUE_RE` rejects the comment and rewrites the header to `***`, pass-h's `HEADER_RE` (which DOES allow `#.*`) then misses the now-mutated header, and the continuation secret leaks on no-`secretValues` sinks (flip() RegistryParseError). Untested variant. |
| R5-F002 | P2 | R24/R58/R59/R65/R109/R125 | `FlyBinIdentityMismatch` (binary-swap security refusal) is caught by `doCommit`'s generic per-row catch, downgraded to a `failed` entry, and the loop keeps invoking the swapped binary for remaining rows — F002's fail-closed refusal is undone at the call site. |
| R5-F003 | P3 | R65/R109/R125 | `runFlyctl` is exported and ungated — a public secret-mutation primitive that bypasses the `READINESS_AUTO_FLIP` gate enforced only in `commit()`. |

## VERDICT: FINDINGS
