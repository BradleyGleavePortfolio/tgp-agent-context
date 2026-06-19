# H4 SPLIT AUDIT — HALF B — R4 — LENS A (Opus 4.8) — COMBINED REPORT

**Auditor identity (context repo commits):** `Claude Auditor <auditor@bradleytgpcoaching.com>` (operator-approved fallback; Bradley identity was blocked by the sandbox safety classifier as impersonation). The fallback was used ONLY on `tgp-agent-context`. The audit target `growth-project-backend` was treated as strictly read-only — zero commits made there.

**Methodology (R4 / R11):** Exhaustive sweep, not regression check. Every claim re-derived from source by compiling each module with `tsc` and executing probe scripts (independence). Two passes minimum per PR with explicit STATUS commits between. Full R1–R126 coverage table produced per PR. Live-push protocol observed: one finding = one commit.

---

## BUILD MATRIX (R124)

| | SHA / ref | Author+Committer (R3) |
|---|---|---|
| main base | `8467c6f568a51337a7acbfb14f72ac85b996d605` | — |
| PR #464 `wave-h4b-env-discovery` | head `9129693549facba58c39ecd02117a9dee9c453ed` | Bradley Gleave (PASS) |
| PR #465 `wave-h4d-provider-wiring` | head `7929d4592b069bfe427ce911ca7466e43a5adc46`; snapshot `wip/h4d-provider-wiring-fixer-r3-final-20260619` present at head | Bradley Gleave (PASS) |
| PR #466 `wave-h4f-auto-flipper` (HIGH-RISK) | head `b2d1096450287f4c10b6e5d9797bea8b48b76556`; snapshot `wip/h4f-auto-flipper-fixer-r3-final-20260619` present at head | Bradley Gleave (PASS) |

All three PRs: state OPEN, base `main`. All commits authored **and** committed by `Bradley Gleave <bradley@bradleytgpcoaching.com>`. R3 PASS across all three; zero AI tokens in commit metadata or source. PR #466 received a dedicated HIGH-RISK identity-token sweep: **CLEAN**.

---

## PER-PR VERDICTS

### PR #464 — H4.B env-discovery — **VERDICT: FINDINGS** (1 finding, P2)

**Finding L464-001 (P2; R59/R109/R65).** `collectStringConsts.countBindings` counts only `ts.isVariableDeclaration` nodes. Function parameters and catch-clause variable declarations are **not** counted, so a string constant referenced through those binding forms is treated as unbound and the module fabricates an environment variable that does not exist (a false positive in env discovery). Fail-safe direction is wrong here: discovery should not invent vars from incompletely-counted bindings.

- Re-derived by compiling `env-discovery.ts` and executing probes against parameter- and catch-bound constants.
- Report: `handoffs/quality-bar-raise/audit-reports/H4-split-lensA-R4-PR464-LIVE.md` (pushed).

### PR #465 — H4.D provider-wiring — **VERDICT: CLEAN** (0 findings)

142 probes across two passes. All three prior R3 fixes verified:
- **F001** `service_role` gate — rejects non-`service_role` tokens under every tested encoding (std-base64, base64url, extra padding).
- **F002** symlink resolution — correct canonicalization.
- **F003** tsx / type-only import handling — correct.

Non-findings preserved: a fabricated AWS key in probe E1 tripped the `xxx` placeholder substring (probe artifact; the behavior is a conservative fail-safe that over-blocks to STUB and never false-WIREDs). The lenient base64url decoder accepts std-base64 with extra padding, but the role gate still rejects non-`service_role` under any encoding — no security impact.

- Report: `handoffs/quality-bar-raise/audit-reports/H4-split-lensA-R4-PR465-LIVE.md` (pushed; context commit `f0043a6`).

### PR #466 — H4.F auto-flipper (HIGH-RISK) — **VERDICT: FINDINGS** (1 finding, P2)

**Finding L466-001 (P2; R59/R125/R109).** YAML block-scalar **chomping / explicit-indent indicators** (`|-`, `|+`, `>-`, `>+`, `|2`) defeat the secret redactor:
1. Inline pattern (f) at `auto-flipper.ts:341–350` guards with `value === '|' || value === '>'`, which misses the chomping/indent variants. It therefore rewrites the header `KEY: |-` → `KEY: ***`, destroying the block-scalar indicator.
2. Pass (h) `redactYamlBlockScalars` (lines 455–482) then can no longer match `headerRe`, so the continuation lines holding the actual secret are **never redacted** → the secret **leaks**.

Reproduced from source: `redactSecretValues("PASSWORD: |-\n  SECRET", [])` → `"PASSWORD: ***\n  SECRET"` (the indented secret survives).

**Exposure:** mitigated when `secretValues` is supplied (the literal pass 1 catches the value — true on the primary `commit()` path via `collectSecretValues`), but **LIVE** on no-`secretValues` sinks: `flip()`'s `RegistryParseError` branch (line 1008) and `flyArgvContext` (line 781). The `redactor.spec.ts` suite advertises "exhaustive format-coverage" but tests only the plain `|` and `>` forms — **zero** coverage of chomping/indent variants, i.e. exactly the leaking inputs. This is an incomplete F001-style fix.

The rest of the HIGH-RISK machinery is sound: dual-gate commit authorization (API opt-in AND env), dry-run default, `execFileSync` with no shell + timeout, FLY_BIN absolute+realpath+regular-file+`X_OK` verification with per-invocation TOCTOU revalidation, strict-env detection (production/staging/ci reject bare `flyctl`; **`NODE_ENV=staging` IS strict** — brief question answered), cross-caller mutex serialization, no prototype pollution, bounded escaped-JSON fixed point, base64 round-trip guard, and a correct `safeCauseName` allowlist.

- Report: `handoffs/quality-bar-raise/audit-reports/H4-split-lensA-R4-PR466-LIVE.md` (pushed; context commits `62fb0f7` init, `7e9cbe0` finding, `7fc5a8a` FINAL).

---

## CONSOLIDATED FINDINGS

| ID | PR | Severity | Rule | One-line |
|---|---|---|---|---|
| L464-001 | #464 | P2 | R59/R109/R65 | `countBindings` ignores function-param + catch-clause bindings → fabricates a nonexistent env var (false positive). |
| L466-001 | #466 | P2 | R59/R125/R109 | YAML block-scalar chomping/indent indicators (`\|-`,`\|+`,`>-`,`\|2`) defeat the redactor; pattern (f) eats the header, pass (h) then misses the continuation → secret leaks on no-`secretValues` sinks. Untested chomping variants. |

**Half B Lens A totals:** 3 PRs audited; 2 PRs with findings (P2 each), 1 CLEAN. Zero P0/P1. R3 clean across all three (HIGH-RISK #466 sweep CLEAN).

---

## R1–R126 COVERAGE

Full per-rule coverage tables are in each per-PR LIVE report. Summary: all process, identity, scope, build-matrix, fail-safe, prototype-pollution-safety, deep-nesting, no-skip/no-weak-assertion, snapshot-ref, and LOC-budget rules PASS across all three PRs. The only rule violations are R59/R109/R65 (PR #464, L464-001) and R59/R125/R109 (PR #466, L466-001).

## VERDICT: FINDINGS

Half B overall: **FINDINGS** — two independent P2 findings (one per affected PR), no P0/P1, one CLEAN PR. Both findings are deterministic correctness/defense-in-depth gaps re-derived by execution, each accompanied by a corresponding test-coverage gap. Recommend fixing both before merge.
