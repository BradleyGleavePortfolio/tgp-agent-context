# H4.A LENS A AUDIT REPORT — registry-loader (Doctrine-Adherence Lens)

> Independent auditor (R11). Builder claims treated as hypotheses and re-derived from source. CI green was **not** trusted alone — every metric below was recomputed locally on the pinned head SHA.

## BUILD MATRIX (R124)

- backend HEAD (origin/main): `ceaa759c103b27801a67a96601337342c3ab0e6c`
- ctxrepo HEAD: `45c9c4f2cf570191c41ea0b07b34e220692f38ed`
- PR: #458 "feat: H4.A registry-loader for prod-switches.yml (R100)"
- PR base.sha (in): `ceaa759c103b27801a67a96601337342c3ab0e6c` (== main HEAD — NOT stale)
- PR head.sha (out): `604ae7d746c6bff365f357161727556229a923ad` (matches expected; verified `git rev-parse HEAD` and `gh pr view --json headRefOid`; no SHA drift during audit)
- Auditor lens: A (Opus 4.8 — Doctrine Adherence, stricter)
- Audit timestamp UTC: 2026-06-19T11:33:12Z
- Snapshot branches present: `wip/h4a-init-snapshot` @ `ceaa759c…` (== main HEAD; R6 satisfied)

---

```
=== H4.A LENS A AUDIT VERDICT ===
SHA: 604ae7d746c6bff365f357161727556229a923ad
VERDICT: FINDINGS
FINDINGS_COUNT: 1
CRITICAL: 0
MAJOR: 0
MINOR: 1
```

## BUILD MATRIX — Doctrine checks (R124)

| Rule | Status | Evidence |
| ---- | ------ | -------- |
| R3 (identity) | PASS | Single commit `604ae7d7`; author **and** committer `Bradley Gleave <bradley@bradleytgpcoaching.com>`. `git log origin/main..HEAD --pretty='%an <%ae>｜%cn <%ce>'` clean. Banned-token grep (`claude/anthropic/openai/gpt/copilot/co-authored/generated with/🤖/perplexity/sonnet/opus`) over commit messages **and** added diff lines → zero hits. `ai.txt`/`User-Agent` → none added. (`AI_GATEWAY_*` rows in the YAML are legitimate env-var **data**, not authorship tokens.) |
| R6 (durability) | PASS | `git ls-remote --heads origin 'wip/*'` shows `wip/h4a-init-snapshot` at main HEAD. |
| R23/R76 (LOC) | PASS | Re-derived two ways. CI-gate formula (`src/** test/** scripts/** dangerfile.js .github/workflows/** *.config.json`, minus lockfile) = **397 net ≤ 400**. Brief-strict formula (exclude tests `**/test/**`+`*.spec.*`, lockfile, `*.yml`, `*.md`) = **3 net** (only `package.json` +3). Both pass; no `[LOC-EXEMPT]` claimed or needed. The 1,373-line `prod-switches.yml` is data (R76 exclusion). |
| R74 (test:src ≥ 2.0) | PASS (with note) | CI gate returns "not applicable" because its SRC pathspec (`src/**/*.ts`, not `test/**`) sees SRC=0. Re-derived conceptual ratio treating the loader as src: **268 test / 129 loader = 2.078 ≥ 2.0**. No under-testing in fact. See Note N1 (gate-evasion-by-placement risk). |
| R75 (banned casts) | PASS | Added-line grep for `as any` / `as unknown as` / `as never` / `@ts-ignore` / `@ts-expect-error` (no issue link) / empty-catch swallows → **zero**. Loader: only `as const` (×2, allowed). Spec: 4× `as unknown` (single cast, **not** the banned `as unknown as`) used to feed deliberately-malformed literals to `.parse()` in negative tests — legitimate. No TODO/FIXME/placeholder literals in prod loader. |
| R100.A1/A2/A3 | PASS | All three gate jobs green on `604ae7d7` (`gh pr checks 458`). Independently reproduced A2 (cast scan) and A3 (LOC) formulas locally; results match. |
| R102 (flipper shape) | PASS | Loader schema types `tier` (enum hard｜prod｜feature｜optional), `prod_default` (enum MUST_SET｜ON｜OFF｜STUB_ALLOWED), `auto_flip_on_in_prod` (boolean) and exposes `getAutoFlip()` + `getProdRequired()`. Shape matches what the H4.F auto-flipper will consume. |
| R124 (BUILD MATRIX) | PASS | Builder report contains a BUILD MATRIX; every claim verified accurate: 223 switches, 129 loader LOC, 31 `it()` cases, zod `^4.4.3` present. |
| Schema correctness | PASS | All **six** fields validated (`name`/`tier`/`prod_default`/`auto_flip_on_in_prod`/`owner`/`description`). Both `RegistryRowSchema` and `RegistrySchema` are `.strict()` → unknown top-level **and** row fields rejected. Missing field → throws (fail closed). Typo'd field (`owners` for `owner`) → reports BOTH "Unrecognized key" AND missing-required. Real `prod-switches.yml` (223 rows) round-trips with zero schema problems; 0 error-severity coherence findings, 25 unowned (warn), 8 MUST_SET, 3 auto_flip. |
| Loader purity | PASS | I/O is guarded by `if (require.main === module)` — importing the module performs no FS read, no global mutation, no top-level mutable state. All helpers are pure array filters/maps. `tsconfig module: commonjs` so `require.main` + `import` resolve correctly. |
| Error messages | **FINDINGS** | Field path + expected-vs-actual present via zod; empty-file path has a clear message. BUT `loadRegistry(path)` does **not** attach the **filename** to validation failures — see Finding F1. |

---

## VERIFICATION PERFORMED (independent re-derivation, R11)

- **Cloned** `growth-project-backend`, `git checkout wave-h4a-registry-loader`, `git rev-parse HEAD` = `604ae7d746c6bff365f357161727556229a923ad` ✓ (matches expected; no drift; base == main HEAD so PR is not stale).
- **Installed deps** (`npm install --ignore-scripts`), then:
  - `tsc --noEmit --strict` on `registry-loader.ts` → **exit 0, zero errors, no `any`**.
  - `jest registry-loader.spec.ts` → **31 passed / 31 total**.
  - Parsed the real `prod-switches.yml` with `js-yaml` (resolved 4.2.0, satisfies `^4.1.0`) and re-implemented the six-field strict schema in plain JS: **223 rows conform**, 0 error findings, 0 unknown keys, 0 missing fields, 0 duplicate names.
  - Probed zod 4 error shapes for missing field / unknown top-level key / typo'd field → all fail closed with field path + expected/actual.
- **Re-computed** R23 LOC and R74 ratio both under the CI gate's pathspec and under the brief's stricter R23/R76 exclusion wording (results above).
- **Read** the `r100-quality-gate.yml` source to understand exactly what A1/A2/A3 measure (and confirmed the spec is excluded from the A2 cast scan, so its `as unknown` literals cannot trip the gate).

---

## FINDINGS DETAIL

### F1 — MINOR (P3): validation errors do not cite the source filename
**File:** `test/prod-readiness/registry-loader.ts:36-47` (`loadRegistry` / `parseRegistry`)
**Rule:** Brief Lens-A charter — *"Error messages: must be actionable (cite **filename** + offending field + expected vs actual)."*
**Evidence:** `loadRegistry(path)` reads the file then calls `RegistrySchema.parse(parsed)` and lets the raw `ZodError` propagate. The zod error carries the **offending field path** (e.g. `["switches", 0, "owner"]`) and **expected-vs-actual** ("expected string, received undefined"), but the **filename/path is never attached**. The empty-file guard (`'registry is empty: expected a top-level \`switches:\` array'`) likewise omits the path. A failure on the CLI or in H4.B/H4.F surfaces a field path with no indication of *which* registry file produced it.
**Why it matters (R1/R10):** Two of the three actionability components the brief enumerates are met; the third (filename) is not. With a single registry today the gap is small, but the loader is the shared foundation for H4.B/H4.F/H4.H, which may load fixtures and the real file in the same run — a path-less error degrades diagnosability exactly where the brief asked for it.
**Suggested remediation:** Wrap the `parseRegistry`/`RegistrySchema.parse` call in `loadRegistry` so a `ZodError` (and the empty-file error) is re-thrown with the `path` prefixed, e.g. `` `prod-switches registry "${path}" is invalid:\n${formatZodIssues(err)}` ``, formatting each issue as `<field-path>: expected <x>, received <y>`. Keep `parseRegistry(raw)` filename-agnostic (it has no path) but have `loadRegistry(path)` enrich. ~6-10 LOC; no schema change.

---

## DOCTRINE NOTES (informational — not findings for this PR)

- **N1 — R74 gate-evasion-by-placement (forward-looking).** Because the loader lives under `test/`, the R100.A1 test-density gate computes `SRC=0` and auto-passes *without ever evaluating the ratio* (`r100-quality-gate.yml:221-224`). For H4.A this is harmless — the conceptual ratio is 2.078. But a future H4 scanner placed under `test/` could ship with **zero** unit tests and still pass A1. Not an H4.A violation; flagged so the H4.H/orchestrator PR (or a gate amendment) can decide whether prod-logic-under-`test/` should count as SRC. Out of scope to fix here.
- **N2 — CC prefix divergence.** The PR **title** is `feat: H4.A registry-loader…` (added by the builder to clear the danger Conventional-Commits gate), but the single **commit subject** is `H4.A: registry-loader for prod-switches.yml (R100)` (no `feat:`). Squash-merge will use the PR title, so the merged commit will be CC-compliant. No rule violation; noted for accuracy since the builder report describes the title change.
- **N3 — zod version.** Builder correctly used the repo's existing `zod@^4.4.3` rather than the brief sample's `zod@^3`. Verified compatible: `tsc` strict + 31 tests pass; `.strict()`, `z.enum`, `.regex(msg)`, `z.infer` all behave as required under zod 4.

---

## SUMMARY

The H4.A registry-loader is a clean, pure, well-tested data-layer foundation. R3 identity, R6 snapshot, R23/R76 LOC budget, R75 cast ban, R100 A1/A2/A3, R102 flipper-shape alignment, R124 BUILD MATRIX, six-field strict schema (fail-closed on missing/typo'd, rejects unknown top-level + row fields), and loader purity all **PASS** on independent re-derivation. One genuine doctrine gap remains: validation errors omit the source filename that the brief's error-actionability charter requires (Finding F1, MINOR/P3). Per R14 ("CLEAR OF ANY P0–P3s IN ANY REGARD"), this single P3 must be closed by a fixer before merge; it is small (~6-10 LOC, no schema change) and the re-audit should land CLEAN.

VERDICT: FINDINGS
