# H4 Split Audit — Lens A (Opus 4.8) — R4 — PR #466 (H4.F auto-flipper) — HIGH-RISK

**STATUS: IN PROGRESS**

## BUILD MATRIX (R124)
| Item | Value |
|---|---|
| PR | #466 — H4.F auto-flipper (HIGH-RISK: mutates prod Fly secrets) |
| Branch | `wave-h4f-auto-flipper` |
| Head SHA | `b2d1096450287f4c10b6e5d9797bea8b48b76556` |
| main base SHA | `8467c6f568a51337a7acbfb14f72ac85b996d605` |
| Snapshot ref | `refs/heads/wip/h4f-auto-flipper-fixer-r3-final-20260619` — PRESENT at head ✓ |
| PR state | OPEN, base `main` |
| Diff stat | +2855 / −3339 (replaces prior prod-readiness modules; net NEGATIVE LOC) |
| New source | `test/prod-readiness/auto-flipper.ts` (1028 LOC) |
| New tests | `auto-flipper.spec.ts` (1483 LOC), `redactor.spec.ts` (344 LOC) |

## HIGH-RISK IDENTITY TOKEN SWEEP (`git log main..HEAD`, ZERO TOLERANCE)
All 4 commits authored AND committed by `Bradley Gleave <bradley@bradleytgpcoaching.com>`. Commit-metadata token grep (claude/anthropic/gpt/codex/copilot/ai/agent/assistant/bot/automated/generated/co-authored): **ZERO hits**. Source-file authorship-token sweep across all added files: **ZERO hits**. R3 PASS.

## R4 EXHAUSTIVE SWEEP — Pass 1 (executed re-derivation, R11)
Method: copied source to `/tmp/probe/src/`, stubbed `registry-loader`, compiled with tsc, executed `require()`-based probes. 55 probes across redaction (prototype-pollution / deep-nesting / escaped-JSON fixed-point / base64 / YAML), safeCauseName allowlist, dual-gate commit/flip authorization, plan partitioning, FLY_BIN resolution, and flip() error wrapping.

| Group | Probes | Result |
|---|---|---|
| A. Recursive JSON walk | A1–A5 | nested-key redaction OK; **no prototype pollution** (`__proto__`/`constructor` keys do not pollute `Object.prototype`); deep 5000-level nesting does NOT crash (JSON.parse caps, redactor catches); array nesting OK |
| B. Escaped-JSON fixed point | B1–B4 | single-escaped redacted; double-escaped caught by literal pass; terminates quickly; no infinite loop on lone backslash-quotes |
| C. base64 | C1–C4 | encoded secret dropped to ***; random base64 NOT false-redacted (round-trip guard); no-literals short-circuit; non-secret run intact |
| **D. YAML block scalar chomping** | D1–D7 | **FINDING — see L466-001.** Plain `\|`/`>` OK (D1/D5/D7); but `\|-`,`\|+`,`>-`,`\|2` LEAK the secret |
| E. safeCauseName allowlist | E1–E9 | allowlist exact; attacker secret-named class → UnknownError; legit `FlyDeployError` → UnknownError (safe over-redaction); allowed name that is itself a secret value → *** |
| F. Dual-gate authorization | F1–F9 | `autoFlipEnabled` strict `=== 'true'`; `shouldCommit` requires API opt-in AND env gate (neither alone mutates) |
| G. commit refusal | G1 | commit throws without `READINESS_AUTO_FLIP=true` |
| H. targetValueFor | H1–H4 | ON→true, OFF→false, MUST_SET/STUB_ALLOWED→null |
| I. plan partitioning | I1–I4 | already_set / to_set / needs-human / not-auto-flip all correct |
| J. flip() error wrapping | J1–J6 | non-RPE error → AutoFlipperRegistryError, no secret value or class-name leak, causeName UnknownError; RPE rethrown with KEY=VAL secret pattern-redacted |

## NEW FINDINGS

### L466-001 — P2 — YAML block-scalar chomping/indent indicator defeats redaction → secret value leaks (R59/R125, F001 incomplete)
**Location:** `test/prod-readiness/auto-flipper.ts`, `redactSecretValues` pattern (f) lines 341–350, interacting with `redactYamlBlockScalars` pass (h) lines 455–482.

**Root cause:** Inline pattern (f) matches a YAML block-scalar HEADER line `KEY: |-` and its value-capture (`[^\s,}\]][^\n]*?`) captures the indicator `|-` (or `|+`, `>-`, `>+`, `|2`, …). The skip-guard at line 347 only excludes EXACTLY `value === '|' || value === '>'`. For any chomping/indent variant the guard does NOT fire, so pattern (f) rewrites the header to `KEY: ***`, **destroying the block-scalar indicator**. Pass (h)'s `headerRe` (`/…:\s*[|>][+-]?\s*$/`) then no longer matches the mutated header, so the more-indented continuation lines that actually hold the secret value are **never redacted** and leak verbatim.

**Independent reproduction (no secretValues supplied):**
```
redactSecretValues("PASSWORD: |-\n  SuperSecretValue_abc123XYZ", [])
  => "PASSWORD: ***\n  SuperSecretValue_abc123XYZ"   // SECRET LEAKS
```
Confirmed leaking for `|-`, `|+`, `>-`, `|2`. Plain `|` and `>` redact correctly (`KEY: |\n  ***`).

**Exposure:** The literal pass (pass 1) masks this when `secretValues` is supplied — which IS the case on the primary `commit()`/`doCommit` path (seeded via `collectSecretValues(plan)`). The leak is LIVE on sinks that call the redactor with NO `secretValues`:
- `flip()` `RegistryParseError` branch (line 1008): `redactSecretValues(err.message)` — a registry parse error whose message embeds a chomping block scalar leaks.
- `flyArgvContext` (line 781): `redactSecretValues(verbs.join(' '))` — argv verbs are non-secret, so low practical risk, but the same defective path.

**Why it matters / why it is a finding not a notable:** F001's stated scope explicitly added YAML block-scalar redaction (pass (h) exists precisely for this). The fix is INCOMPLETE: it handles only the bare `|`/`>` headers and is actively DEFEATED by the standard YAML chomping (`-`/`+`) and explicit-indent (digit) indicators, which are common in real config dumps. A defense-in-depth secret redactor that leaks on a documented-in-scope input shape is a real (P2) gap, not cosmetic.

**Suggested fix:** In pattern (f)'s guard, skip any value that STARTS WITH `|` or `>` (e.g. `/^[|>][+-]?\d*\s*$/` or simply `value.trimStart().startsWith('|') || startsWith('>')`), leaving ALL block-scalar headers intact for pass (h); OR broaden pass (h)'s `headerRe` to also re-detect an already-`***`'d header and still redact the indented continuation. Add chomping/indent fixtures (`|-`, `|+`, `>-`, `|2`) to `redactor.spec.ts`.

## R4 EXHAUSTIVE SWEEP — Pass 2 (FLY_BIN / TOCTOU / strict-env / deeper redaction)
36 additional probes, all confirm correct behavior:
| Group | Probes | Result |
|---|---|---|
| K. strict-env detection (F003) | K1–K8 | production/staging/ci/arbitrary NODE_ENV are STRICT (reject bare `flyctl`); development/test/unset permit it; `FLY_BIN_REQUIRE_ABSOLUTE=true` forces strict even in dev. **Brief Q answered: `NODE_ENV=staging` IS strict.** |
| L. absolute/symlink/exec verification | L1–L9 | relative override rejected; absolute regular+exec accepted (canonicalized); non-exec/dir/dangling/nonexistent rejected; symlink→exec resolves to canonical; `FLY_BIN=flyctl` treated as bare default (strict-rejected in prod) |
| M. assertFlyBinUnchanged TOCTOU | M1–M3 | post-load swap to non-file or non-exec rejected; unchanged valid bin passes |
| N. deeper redaction shapes | N1–N12 | multi-key JSON, UPPER_SNAKE non-hint key, benign `count=5` intact, Authorization Bearer, X-API-Key, quoted value, URL-encoded pair, longest-first literal ordering, regex-metachar literal, empty text, lowercase `apikey`, inline `password:` all correct |
| O. collectSecretValues | O1–O4 | gathers every target + was (to_set + already_set), de-duplicated Set |

**STATUS: PASS 1 COMPLETE / PASS 2 COMPLETE**

## TEST-QUALITY corroboration of L466-001
`redactor.spec.ts` (header: “exhaustive format-coverage suite … CRITICAL SECRET LEAK”) tests ONLY the plain `|` literal and `>` folded block-scalar forms (lines 267–283) — which pass — and has **zero** coverage of the chomping (`|-`,`|+`,`>-`,`>+`) or explicit-indent (`|2`) indicators that defeat the redactor. The missing fixtures are exactly the leaking inputs. Otherwise test quality is strong: auto-flipper.spec 240 expects/124 tests, redactor.spec 87/41 (~1.98 density); zero `.skip(`/`.only(`/`xit(`; the lone `toBeDefined()` (auto-flipper.spec:305) is a JSON.parse guard followed by two substantive assertions, not a weak assertion.

## DOCTRINE RULE COVERAGE R1–R126 (Lens A, PR #466)
| Rule(s) | Topic | Verdict |
|---|---|---|
| R1–R2 | Scope / target correctness | PASS — head SHA byte-matches brief |
| R3 | Strict Bradley identity, ZERO AI tokens (HIGH-RISK) | PASS — 4/4 commits Bradley author+committer; zero tokens in metadata or source |
| R4 | Exhaustive sweep, 2 passes | PASS — 91 probes, fresh pass-2 angles |
| R11 | Independence / re-derive | PASS — compiled & executed; leak reproduced from source |
| R16/R78 | Single canonical VERDICT token | PASS |
| R24/R58/R95/R110 | Secret-mutating path hardening (FLY_BIN) | PASS — absolute+realpath+regular+X_OK, TOCTOU revalidation, strict-env |
| R59 | No silent error swallow | **FINDING L466-001** — redactor leaks on YAML chomping via a no-secretValues sink (defense-in-depth gap), plus all FLY_BIN catches map to deterministic descriptive throws (those PASS) |
| R65 | Fail-safe direction | PASS — dual-gate commit (API opt-in AND env), dry-run default, execFileSync no-shell+timeout, mutex serialization |
| R109 | Static-analysis / parsing correctness | PARTIAL — redactor pattern (f) mis-handles block-scalar indicators (L466-001) |
| R124 | Build matrix | PASS |
| R125 | Defense-in-depth redaction | **FINDING L466-001** — incomplete YAML coverage |
| R5–R10, R12–R15, R17–R23, R25–R57, R60–R64, R66–R77, R79–R94, R96–R108, R111–R123, R126 | (process, prototype-pollution safety, deep-nesting, base64 round-trip, safeCauseName allowlist, plan/commit/flip gating, LOC budget, snapshot ref, no-skip/no-weak-assert) | PASS — no violation observed; net-negative LOC; snapshot ref present; no prototype pollution; deep nesting safe |

## NEW FINDINGS SUMMARY
| ID | Severity | Rule | One-line |
|---|---|---|---|
| L466-001 | P2 | R59/R125/R109 | YAML block-scalar chomping/indent indicators (`\|-`,`\|+`,`>-`,`\|2`) defeat the redactor — pattern (f) eats the header, pass (h) then misses the continuation → secret leaks on no-secretValues sinks (e.g. flip()'s RegistryParseError branch). Incomplete F001 fix; untested chomping variants. |

## VERDICT: FINDINGS

PR #466 (H4.F auto-flipper) — ONE finding (**L466-001, P2**). The HIGH-RISK secret-mutation machinery is otherwise sound: dual-gate authorization, no-shell execFileSync with timeout, FLY_BIN absolute/realpath/exec verification with per-invocation TOCTOU revalidation, strict-env detection (staging/ci/prod), cross-caller commit serialization, no prototype pollution, bounded escaped-JSON fixed point, base64 round-trip guard, safeCauseName allowlist. R3 strict-Bradley identity clean with zero AI tokens (HIGH-RISK sweep passed). The single gap is the redactor's incomplete YAML block-scalar handling, which leaks a secret value on the chomping/indent header shapes via sinks that do not supply `secretValues`. Recommend fixing pattern (f)'s guard and adding chomping fixtures before merge.
