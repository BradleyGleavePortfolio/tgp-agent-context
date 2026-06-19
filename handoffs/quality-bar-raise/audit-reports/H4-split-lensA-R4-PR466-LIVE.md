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

_Pass 2 pending. STATUS commit to follow._
