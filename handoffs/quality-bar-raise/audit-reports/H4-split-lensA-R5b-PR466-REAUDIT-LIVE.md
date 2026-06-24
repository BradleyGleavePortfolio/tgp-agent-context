# H4 Split Re-Audit — Lens A (DEPTH) — R5b — PR #466 (H4.F auto-flipper) — HIGH-RISK

## VERDICT: **NOT CLEAN — 3 findings (1× P2, 2× P3)**

| | |
|---|---|
| SHA audited (PR head) | `d62a5cf9a9ae59e80093ebff79c2cd94b2f49c93` — **byte-match to brief ✓** |
| Branch | `wave-h4f-auto-flipper` |
| main base SHA | `8467c6f568a51337a7acbfb14f72ac85b996d605` (R5 PR-range base) |
| Lens / model | Lens A (depth) / Opus 4.8 |
| Mandate | Adversarial re-audit. Find ANY AND ALL problems, including NEW ones from the R5 delta. Do NOT merely confirm R5 closed. |
| Method | Force-synced to head; installed deps; compiled & **executed** the live module with runtime counter-examples (did not trust source comments). Mutation-tested every new spec assertion by reverting each fix and confirming red. Ran `pnpm tsc` + all `test/prod-readiness/` specs. |
| TSC | `npx tsc --noEmit` (with `--max-old-space-size=6144`) → **exit 0, clean** |
| Tests | `jest test/prod-readiness/` → **256 passed / 256 total, 3 suites** (matches fixer claim) |
| R75 (added lines) | `claude\|anthropic\|co-authored\|assistant\|ai-generated` over `8467c6f..HEAD` added lines → **empty (exit 1) ✓** |
| R3 (commit identity) | All 5 PR commits: author AND committer = `Bradley Gleave <bradley@bradleytgpcoaching.com>` ✓ |

---

## SUMMARY OF FINDINGS

| ID | Priority | File:line | One-line |
|---|---|---|---|
| R5b-F001-LensA | **P2** | `auto-flipper.ts:627` (`YAML_BLOCK_SCALAR_INDENT_DIGIT_RE`) + `:636-641` | **NEW leak exposed by the R5 F001 fix.** A block-scalar header's trailing comment containing a `\|N`/`>N` token (e.g. `PASSWORD: >- # see \|9`) poisons the indent-digit extractor, inflating `contentFloor` so the continuation secret is never redacted → leaks on no-`secretValues` sinks. The 7 new F001 spec cases all use token-free comments and miss it. |
| R5b-F002-LensA | P3 | `auto-flipper.ts:926` (`__runFlyctlForTest`) | F003 "closure" is a **rename, not a removal**. `__runFlyctlForTest` is exported and is `runFlyctl` verbatim with NO `READINESS_AUTO_FLIP` gate — the identical ungated secret-mutation capability the original F003 flagged, under a new name. Commit-message claim "Removes the entire class of 'caller forgot the gate' bugs" is overstated. |
| R5b-F003-LensA | P3 | `auto-flipper.ts:1147-1158` | Duplicated comment block: the 6-line `SECURITY (F002)` comment is pasted twice verbatim above the re-throw guard. Cosmetic, but a clear artifact of the R5 edit. |

---

## Finding R5b-F001-LensA — Trailing-comment token (`# … |N` / `# … >N`) poisons the indent-digit anchor → continuation secret leaks (NEW, introduced/exposed by the R5 F001 fix)

**Priority:** P2
**Rules triggered:** R24, R59, R65, R109, R110, R125
**File:** `test/prod-readiness/auto-flipper.ts:627` (`YAML_BLOCK_SCALAR_INDENT_DIGIT_RE`) consumed at `:636-641` inside `redactYamlBlockScalars`.

**Code:**
```ts
// :627 — scans the WHOLE header line, not just the indicator token:
const YAML_BLOCK_SCALAR_INDENT_DIGIT_RE = /[|>][+-]?([1-9])|[|>]([1-9])/;
...
// :633-641
const m = YAML_BLOCK_SCALAR_HEADER_RE.exec(lines[i]);
if (m && isSecretKey(m[2])) {
  const headerIndent = m[1].length;
  const digitMatch = YAML_BLOCK_SCALAR_INDENT_DIGIT_RE.exec(lines[i]); // <-- runs on lines[i] (header + comment)
  const explicitDigit = digitMatch ? Number(digitMatch[1] ?? digitMatch[2]) : 0;
  const contentFloor = Math.max(headerIndent, headerIndent + explicitDigit - 1);
```

**Why it's wrong (causal chain):**
The R5 F001 fix correctly broadened `YAML_BLOCK_SCALAR_VALUE_RE` so pass-f no longer rewrites a comment-bearing header (`PASSWORD: |- # x`) to `***`. **As a direct consequence, comment-bearing block-scalar headers now reach pass-h (`redactYamlBlockScalars`) for the first time** — on `main`/R4 they were eaten by pass-f and never seen by pass-h. Pass-h then computes the content-indent floor by extracting the *explicit indentation indicator digit* with `YAML_BLOCK_SCALAR_INDENT_DIGIT_RE` — but that regex is **not anchored to the header's own indicator**; it is run against the entire line, comment included. A comment that happens to contain `|9`, `>5`, `|8`, `>9`, etc. is mis-read as an explicit indentation indicator. `contentFloor` becomes `headerIndent + N - 1`; any continuation line indented `<= contentFloor` is treated as *outside* the block (`if (indent <= contentFloor) break;` at `:650`) and is **never redacted**. The real secret leaks.

This is the SAME leak class as R4-F001/R5-F001 (pass eats/misses the body), just on a third axis — and it is a regression newly *exposed* by the very change that closed R5-F001.

**Live counter-examples (reproduced against the compiled module, no `secretValues` — the leaking sink):**
```
redactSecretValues('PASSWORD: >- # see |9\n  SuperSecretValue_abc')
  => 'PASSWORD: >- # see |9\n  SuperSecretValue_abc'        // LEAK (digit 9 from comment → floor 8)
redactSecretValues('PASSWORD: | # ref >5 lines\n  SuperSecretValue_abc')
  => '...\n  SuperSecretValue_abc'                          // LEAK (digit 5)
redactSecretValues('PASSWORD: |- #>9\n  SuperSecretValue_abc')     // LEAK (digit 9)
redactSecretValues('PASSWORD: > # x |8 y\n  SuperSecretValue_abc') // LEAK (digit 8)
```
Confirmed digit extraction: `INDENT_DIGIT_RE.exec('PASSWORD: >- # see |9')` → digit **9**; `'PASSWORD: | # ref >5 lines'` → **5**. The real indicator (`>-`, `|`) carries no digit, so the regex skips it and matches the `|9`/`>5` inside the comment.

**Boundary / non-leaking controls (also reproduced — proves it's discriminating, not blanket):**
```
redactSecretValues('PASSWORD: |- # note |2 here\n  SuperSecretValue_abc') => '...\n  ***'  // OK (digit 2 → floor 1 < bodyIndent 2)
redactSecretValues('PASSWORD: |- # nothing special\n  SuperSecretValue_abc') => '...\n  ***' // OK (no token)
```
Leak condition: spurious digit `N` such that `headerIndent + N - 1 >= bodyIndent` (with `headerIndent=0`, `bodyIndent=2`: any `N>=3` leaks; `N<=2` is masked).

**Exposure (which sinks make this live):** Identical to R5-F001. Masked when `secretValues` is supplied (the `commit()`/`doCommit` path seeds `collectSecretValues`). **LIVE on the no-values sinks:** `flip()`'s `RegistryParseError` rethrow — `auto-flipper.ts:1210` `redactSecretValues(err.message)` with no values — where a registry parse error echoing a region of `prod-switches.yml` that contains a secret-named block-scalar key with an inline comment leaks the continuation line. `flyArgvContext` (`:968`) takes the same no-values path (lower practical risk: its input is non-secret verbs).

**Test-gap corroboration:** The 7 new `redactor.spec.ts` R5-F001 cases (`|- # ignore`, `| # comment`, `|+ # x`, `|-2 # x`, bare `|-`, `|- # comment`, + WITH-secretValues set) ALL use comments with **no `|`/`>` token**, so none exercises the digit-poisoning path. The leaking input is untested.

**Mutation discrimination check:** Reverting `YAML_BLOCK_SCALAR_VALUE_RE` to its pre-R5 form turned the 5 header-preservation F001 specs red (confirmed) — so the *primary* F001 fix is genuinely covered. But there is **no** spec that turns red on the digit-poisoning bug, because none was added for it.

**Recommended fix (do not implement here):** Anchor the indent-digit extraction to the header's own indicator, not the whole line. Either (a) capture the indent digit directly inside `YAML_BLOCK_SCALAR_HEADER_RE` (add a capture group on the indicator and use `m[...]`), or (b) strip the trailing `[ \t]*(?:#.*)?$` comment from the line before running `INDENT_DIGIT_RE`, or (c) run `INDENT_DIGIT_RE` only against the matched indicator substring. Add `redactor.spec.ts` cases: `PASSWORD: >- # see |9\n  <secret>`, `PASSWORD: | # ref >5\n  <secret>`, `PASSWORD: |- #>9\n  <secret>` — each asserting the continuation body is redacted (NO leak), both with and without `secretValues`.

---

## Finding R5b-F002-LensA — F003 "closure" is a rename: `__runFlyctlForTest` is an exported, ungated secret-mutation primitive (capability preserved)

**Priority:** P3
**Rules triggered:** R65, R109, R125
**File:** `test/prod-readiness/auto-flipper.ts:926` — `export const __runFlyctlForTest = runFlyctl;`

**Why it's (still) a finding:**
The R5 fixer demoted `runFlyctl` from `export function` to a module-private `function` (verified: `Object.keys(import * as ...)` does NOT contain `runFlyctl`; runtime probe returns `undefined`). Good. **But the same line re-exports the identical function** as `__runFlyctlForTest`, which performs `warnIfPathResolvedFlyBin()` + `assertFlyBinUnchanged()` + `execFileSync` and **contains no `autoFlipEnabled(env)` / `READINESS_AUTO_FLIP` check**. Therefore the exact capability the original F003 flagged is still externally reachable:
```ts
import { __runFlyctlForTest } from './auto-flipper';
__runFlyctlForTest(['secrets', 'set', 'FEATURE_X=true']); // mutates a prod secret, env gate NEVER consulted
```
The only thing that changed is the symbol name carries a `__…ForTest` prefix — a *naming convention*, which is strictly weaker than the runtime gate that the rejected Option (a) would have added. The R5 commit message asserts this "Removes the entire class of 'caller forgot the gate' bugs" — that is **overstated**: a caller importing `__runFlyctlForTest` reaches the ungated primitive identically to the old `runFlyctl`.

**Context / fairness:** The operator's own R5 fixer brief explicitly chose Option 2 (unexport + add `__runFlyctlForTest` seam), so this is a *known, accepted* tradeoff, and the module lives entirely under `test/prod-readiness/` (no production `src/` import exists — verified by grep: the only importer of `__runFlyctlForTest` is `auto-flipper.spec.ts`). That is why this remains **P3**, matching the original F003 severity. I report it because the mandate requires flagging any residual, and the closure is incomplete relative to its own claim.

**Recommended fix (do not implement here):** Keep the seam for tests but ALSO add the Option-(a) defense-in-depth: an `autoFlipEnabled(process.env)` guard inside `runFlyctl` itself (so even the seam refuses without the env gate), OR make `__runFlyctlForTest` a thin wrapper that requires an explicit test-only sentinel. Either makes the "ungated reachable primitive" class genuinely empty rather than renamed.

---

## Finding R5b-F003-LensA — Duplicated `SECURITY (F002)` comment block above the re-throw guard

**Priority:** P3 (cosmetic)
**File:** `test/prod-readiness/auto-flipper.ts:1147-1158`

**Code:** The 6-line `// SECURITY (F002): a binary-identity mismatch …` comment is present **twice, verbatim**, immediately before the `if (err instanceof FlyBinIdentityMismatch || err instanceof FlyctlTimeoutError) { throw err; }` guard (lines 1147-1152 then 1153-1158). No functional effect, but it is a copy-paste artifact of the R5 edit and should be de-duplicated. Flagged per the angry-pass mandate (any defect, including new sloppiness introduced by the delta).

**Recommended fix:** Delete one of the two identical comment blocks.

---

## R5 PRIOR-FINDING CLOSURE ASSESSMENT

### R5-F001 (YAML block-scalar trailing comment) — **PARTIALLY CLOSED**
- The specific defect is fixed: `YAML_BLOCK_SCALAR_VALUE_RE` now matches `[ \t]*(?:#.*)?$`, so pass-f leaves comment-bearing headers intact and pass-h redacts the body. Verified across 13 runtime variants (`|- # …`, `| # …`, `|+ # …`, `|-2 # …`, `> # …`, `>- # …`, `|2- # …`, `|-3 # …`, `>+ # …`, tab-before-comment, comment-with-comma, plus the two header-alone regressions) — all redact correctly or preserve the bare header. Mutation: reverting the grammar turns 5 spec cases red. The R125 "identical surface" invariant between `VALUE_RE` and `HEADER_RE` on the comment/whitespace axis is now genuinely true.
- **However**, the fix exposed a sibling leak in the same code region (`INDENT_DIGIT_RE` comment-poisoning) → **R5b-F001-LensA (P2)**. The broader goal — "a comment-bearing block-scalar header is safely handled" — is NOT fully achieved.

### R5-F002 (FlyBinIdentityMismatch swallowed) — **CLOSED ✓**
- `doCommit`'s per-row catch now re-throws `FlyBinIdentityMismatch` AND `FlyctlTimeoutError` (`:1159-1161`) before the redact-and-continue path. Verified end-to-end against the compiled module:
  - `FlyBinIdentityMismatch` on row A → `commit()` rejects with `FlyBinIdentityMismatch`; runner invoked **once** (row B's secret NOT offered to the suspect binary).
  - `FlyctlTimeoutError` on row A → same (abort, runner called once).
  - generic `Error` on row A → per-row continue intact (runner called **twice**, 2 failed entries).
  - **Mutex release on the re-throw path:** `commit()` wraps `doCommit` in `try { … } finally { release(); }` (`:1062-1067`); after a `FlyBinIdentityMismatch` abort a subsequent `commit()` proceeds (runner called, row succeeds) — **no mutex leak, no deadlock**.
- Caller trace: `flip()` (`:1229`) awaits `commit()` and does NOT catch — the re-thrown identity/timeout error propagates to the caller unchanged (not downgraded to a soft-fail). No silent upstream catch found.
- Mutation: reverting the re-throw turns **5** spec cases red (the 3 new R5-F002 cases + 2 re-purposed timeout cases). Specs are discriminating.

### R5-F003 (`runFlyctl` exported & ungated) — **CLOSED in letter; capability preserved via seam**
- `runFlyctl` is module-private (verified). The gated `commit()`/`flip()` remain the intended public mutation entries; the default runner path (`doCommit`: `run = opts.run ?? runFlyctl`, `:1072`) only executes under `commit()`'s `autoFlipEnabled` gate.
- **But** the ungated primitive is still externally reachable via the exported `__runFlyctlForTest` → **R5b-F002-LensA (P3)**. The unexport removed the `runFlyctl` name from the surface but not the capability.

---

## ITEMS PROBED AND CLEARED (depth lens — no NEW finding)

| Probe | Result |
|---|---|
| Grammar parity `VALUE_RE` vs `HEADER_RE` on comment/whitespace axis | Now identical surface — `[ \t]*(?:#.*)?$` on both. 13 runtime variants confirm. |
| Adversarial malformed headers `\|2- 3`, `\|--`, `\|2-2`, `\|-3`, `>+`, `\|3-#nospace` | Either correctly rejected by both enforcers (parity held → pass-f rewrites to `***`, safe) or valid+redacted. None defeats the redactor *except* via the digit-poisoning path (R5b-F001). |
| `FlyBinIdentityMismatch` re-throw + mutex `finally release()` | Verified clean abort, no zombie/partial state beyond rows already set before the swap was detected (expected fail-closed behavior). |
| `FlyctlTimeoutError` re-throw | Verified abort + redaction (message never echoes `KEY=VALUE`). |
| Per-row generic-error continue | Intact (row B attempted; redacted failed entry). |
| `runFlyctl` unexported | Confirmed (`undefined` on the namespace). |
| `__runFlyctlForTest` reachability | Only importer is `auto-flipper.spec.ts` (test/prod-readiness/). No production `src/` import. |
| `flip()` upstream catch of re-thrown error | None — error propagates to caller. |
| R75 banned tokens on added lines | Empty. |
| Banned casts (`as any` / `as unknown as` / `@ts-ignore`) in the R5 delta | None (`jest.fn<void,[readonly string[]]>` typed generics only). |
| R3 identity, all 5 PR commits | Bradley author+committer, zero AI tokens. |
| `tsc --noEmit` | Clean (exit 0). |
| 256/256 prod-readiness specs | Pass (re-run; matches fixer claim). |

## DOCTRINE RULE COVERAGE (Lens A depth, PR #466 @ d62a5cf9)
| Rule(s) | Verdict |
|---|---|
| R10/R11 | PASS — exhaustive line-by-line + independent re-derivation (compiled & executed counter-examples) |
| R16/R78 | PASS — single verdict line at top |
| R24/R110 | **FINDING R5b-F001-LensA** — real secret value leaks via comment-token-poisoned indent floor on no-`secretValues` sink |
| R58 | PASS — 60s timeout + SIGTERM; `FlyctlTimeoutError` now also aborts the commit |
| R59 | **FINDING R5b-F001-LensA** (leak by miss) |
| R65 | **FINDINGS R5b-F001-LensA (fail-open redaction), R5b-F002-LensA (gate-free reachable primitive)** |
| R95 | PASS — `execFileSync` no-shell, no `curl\|sh`, argv-only |
| R109 | **FINDINGS R5b-F001-LensA (leaks real value), R5b-F002-LensA (ungated entry)** |
| R124 | PASS — SHA byte-matches; rechecked, no drift |
| R125 | **FINDINGS R5b-F001-LensA (pass-h internal divergence newly exposed), R5b-F002-LensA (gate not at primitive — rename not removal), R5b-F003-LensA (duplicated invariant comment)** |
| All others | PASS / N/A — test-tree diff, net-negative LOC, no production surface |

---

## RETURN
- **Verdict:** NOT CLEAN — 3 findings (R5b-F001-LensA P2; R5b-F002-LensA P3; R5b-F003-LensA P3).
- **SHA audited:** `d62a5cf9a9ae59e80093ebff79c2cd94b2f49c93`.
- **TSC:** exit 0 (clean, `--max-old-space-size=6144`). **Tests:** 256/256 pass (3 suites).
- R5-F001 partially closed (sibling leak exposed); R5-F002 fully closed; R5-F003 closed in letter (capability preserved via seam).
