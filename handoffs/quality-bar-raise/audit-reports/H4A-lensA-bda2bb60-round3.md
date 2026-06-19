# H4.A LENS A RE-AUDIT REPORT — registry-loader (Round 3, final pass)

> Independent doctrine-adherence auditor (Lens A, stricter). Per R11, the fixer-R2
> report, the round-2 reports, and the PR description were treated as **hypotheses to
> verify, not evidence**. Every finding-closure, every BUILD MATRIX metric, every
> adversarial probe below was **re-derived from source** on a fresh blobless clone
> pinned at the target head SHA. CI green was confirmed but **not** trusted alone.

## BUILD MATRIX (R124)

- backend HEAD (origin/main): `ceaa759c103b27801a67a96601337342c3ab0e6c`
- PR: #458 "feat: H4.A registry-loader for prod-switches.yml (R100) [LOC-EXEMPT: …]"
- PR base.sha (in): `ceaa759c103b27801a67a96601337342c3ab0e6c` (== main HEAD; `git merge-base --is-ancestor origin/main HEAD` = yes → **NOT stale**)
- PR head.sha (out): `bda2bb608fecab53e5d455a071293261eb64cc53` (matches expected; verified by BOTH `git rev-parse HEAD` AND `gh pr view 458 --json headRefOid`; re-confirmed unchanged at end of audit → **no SHA drift**)
- PR commit lineage: `604ae7d7` (initial build) → `0253861f` (fixer R1) → `bda2bb60` (fixer R2, this head)
- Auditor lens: A (Opus 4.8 — Doctrine Adherence, stricter)
- Audit timestamp UTC: 2026-06-19T13:30:00Z
- Snapshot branches present (R6): `wip/h4a-init-snapshot` @ `ceaa759c…` (== main HEAD); `wip/h4a-fixer-snapshot-20260619T114514Z` @ `604ae7d7…`; `wip/h4a-fixer-r2-snapshot-20260619T124955Z` @ `0253861f…` (pre-fixer-R2 head, snapshotted BEFORE the R2 fix commit — R6 satisfied)

---

```
=== H4.A LENS A ROUND-3 VERDICT ===
SHA: bda2bb608fecab53e5d455a071293261eb64cc53
VERDICT: CLEAN
FINDINGS_COUNT: 0
CRITICAL: 0
MAJOR: 0
MINOR: 0
PRIOR FINDINGS CLOSED (cumulative): 5 / 5  (R1: Lens A F1 + Lens B MAJOR-1/MAJOR-2/MINOR-1; R2: Lens B F1 YAML-tag bypass)
REGRESSIONS: 0
```

---

## BUILD MATRIX — Doctrine checks re-derived at `bda2bb60` (R124)

| Rule | Status | Evidence (independently re-derived) |
| ---- | ------ | -------- |
| R3 (identity) | **PASS** | `git log --pretty='%H ｜ %an <%ae> ｜ %cn <%ce> ｜ %s' origin/main..HEAD` → **all 3 commits** authored AND committed by `Bradley Gleave <bradley@bradleytgpcoaching.com>`. Banned-token grep over commit messages (`claude/anthropic/openai/gpt/copilot/co-authored/generated with/🤖/perplexity/sonnet/opus/computer/agent/AI/assistant/cursor/llm`) → **zero hits**. Banned-token grep over ADDED loader/spec `.ts` diff lines → **zero hits**. (The only AI-vendor strings in the PR are legitimate env-var data rows inside `prod-switches.yml` — e.g. `ANTHROPIC_API_KEY`, `OPENAI_API_KEY` switch names — not authorship branding in code/comments; `prod-switches.yml` is byte-identical to R1/R2.) |
| R6 (durability) | **PASS** | `git ls-remote --heads origin 'wip/*'` shows three H4.A snapshots: init @ `ceaa759c`, fixer-R1 @ `604ae7d7`, fixer-R2 @ `0253861f` (each pre-work head snapshotted before its fix). |
| R23/R76 (LOC) | **PASS** | Re-derived via `git diff --numstat origin/main..HEAD`: `package.json` +3, `package-lock.json` +34/−3, `prod-switches.yml` +1373, loader `.ts` +239, spec `.ts` +512. Strict R23/R76 prod LOC (exclude `test/**`, lockfile, `*.yml` data, `*.md`, `package.json` manifest) = **0**. The entire loader lives under `test/prod-readiness/` (R76-excluded). `[LOC-EXEMPT]` marker present and **genuine** (assessment below). |
| R74 (test:src ≥ 2.0) | **PASS** | CI A1 returns "not applicable" (its SRC pathspec sees `src/**`=0 because the loader lives under `test/`). Conceptual ratio treating the loader as src: **512 spec / 239 loader = 2.14 ≥ 2.0** (note N1 carry-forward re: gate placement). |
| R75 (banned casts) | **PASS** | Added-line grep over `test/**/*.ts` + `package.json` (full PR and fixer-R2 delta `0253861f..HEAD`) for `@ts-ignore` / `@ts-expect-error` (no issue link) / `as any` / `as unknown as` / `as never` / empty-`.catch` swallows / placeholder literals → **zero hits**. Loader uses only `as const`; `loadRegistry` catch narrows via `err instanceof z.ZodError` / `instanceof Error` (no casts). |
| R100.A1/A2/A3 | **PASS** | All three gate jobs **SUCCESS** on `bda2bb60` (`gh ... check-runs`, confirmed `head_sha == bda2bb608fec`). A3 LOC budget green via the `[LOC-EXEMPT]` marker branch. A1/A2 formulas reproduced locally; match. |
| R102 (flipper shape) | **PASS** | Schema still types `tier` (enum hard/prod/feature/optional), `prod_default` (enum MUST_SET/ON/OFF/STUB_ALLOWED), `auto_flip_on_in_prod` (boolean); exposes `getAutoFlip()` + `getProdRequired()`. No regression from fixer R2. (R102 branch-protection enablement is the H2 PR's responsibility, out of scope here.) |
| R114 (no floating versions) | **PASS (PR-scope)** | PR adds exactly 3 `package.json` lines (`prod-readiness:registry` script, `js-yaml: 4.2.0`, `@types/js-yaml: 4.0.9`). Both PR-added deps are **exact-pinned** (`grep -E '"(js-yaml\|@types/js-yaml)"\s*:\s*"[\^~*]'` → empty). Lockfile coherent: root deps `js-yaml=4.2.0`, devDeps `@types/js-yaml=4.0.9`, and `node_modules/*` resolved entries all match. `package.json` + `package-lock.json` in the same diff (R114 danger rule satisfied). Pre-existing repo-wide `^/~` ranges (`zod ^4.4.3`, `openai ^6.39.0`, etc.) are untouched — out of scope per the R1 Lens B MAJOR-1 PR-scoping. |
| R124 (BUILD MATRIX) | **PASS** | This block; SHAs pinned, verified against `gh`, no drift. Every fixer-R2 claim independently verified (54 tests, +19/−5 loader & +54 spec delta, exact-pinned deps, tag-guard behavior). |
| TypeScript strict | **PASS** | `tsc --noEmit --strict` on the actual loader (with `@types/node`+`@types/js-yaml`) → **exit 0, zero errors, no `any`**. |
| Test suite | **PASS** | `jest registry-loader.spec.ts --runInBand` via ts-jest against the **actual loader** at the new SHA → **54/54 passed** (re-derived; not trusting the fixer's "54/54"). |
| Loader purity | **PASS** | Importing the compiled module produced **no side-effect output**. FS I/O confined to `loadRegistry()`; `console.*`/`process.exit` only inside the `if (require.main === module)` CLI guard. Public interface grew additively only. |
| Scope / data integrity | **PASS** | Fixer R2 changed ONLY `test/prod-readiness/registry-loader.ts` (+19/−5) and `…spec.ts` (+54). `prod-switches.yml` is **byte-identical** to both `0253861f` and `604ae7d7` (`git diff --quiet` = no change); still 223 rows. |
| CI rollup | **PASS** | **10/10 SUCCESS** at `bda2bb60`: build-and-test, danger, Banned cast tokens (A2), CodeQL JS/TS, size-label, rls-floor-guard, LOC budget (A3), rls-live-tests, Test density (A1), mwb-3-live-tests. All check-runs confirmed `head_sha = bda2bb608fec`. |

---

## CLOSURE-OF-PRIOR-FINDINGS MATRIX (R11 — independently re-derived)

| Finding (round) | Rule | Status | Re-derived evidence at `bda2bb60` |
| --- | --- | --- | --- |
| Lens A F1 (R1) — errors must cite filename | diff-reviewability | **CLOSED** | `loadRegistry()` wraps `parseRegistry` and re-throws `RegistryParseError` with the path prefixed for ALL failure classes. Probes: Zod type-error, missing-field, floor, empty, **and the new tag rejection** all emit `prod-switches registry "<path>" is invalid: …`. 4 F1 tests green. |
| Lens B MAJOR-1 (R1) — floating `js-yaml`/`@types/js-yaml` | R114 | **CLOSED** | Both exact-pinned; lockfile synced (see R114 row). |
| Lens B MAJOR-2 (R1) — empty/truncated registry accepted | guardrail | **CLOSED** | `MIN_SWITCHES = 200`. Probes: `[]`→reject, 1 row→reject, 199→reject, **200→accept** (boundary), real 223→accept. |
| Lens B MINOR-1 (R1) — anchors/aliases/merge keys accepted | diff-reviewability | **CLOSED** | Raw `<<:`, `&anchor`, `*alias` all rejected with line-numbered `RegistryParseError`; quoted/commented `&`/`*` do not false-positive. |
| **Lens B F1 (R2) — `!!merge "<<"` YAML-tag bypass** | diff-reviewability | **CLOSED** | The auditor's **exact** probe now throws `RegistryParseError`: `registry uses YAML tags at line 3 — switch rows must be self-contained JSON-compatible YAML for diff-reviewability` (and path-enriched via `loadRegistry`). Re-derived against the compiled loader — NOT trusting the fixer report. Detail below. |

### Lens B Round-2 F1 closure — exact-probe reproduction

The brief's exact YAML probe was written to a temp file and run through both `parseRegistry()` and `loadRegistry()`:

```yaml
switches:
  - name: TAG_MERGE
    !!merge "<<": { tier: optional, prod_default: STUB_ALLOWED }
    auto_flip_on_in_prod: false
    owner: platform
    description: "x"
```

- `parseRegistry()` → **THROWS** `RegistryParseError` (verified `err.constructor.name === 'RegistryParseError'`), message exactly:
  `registry uses YAML tags at line 3 — switch rows must be self-contained JSON-compatible YAML for diff-reviewability` ✅ matches the brief's required message form verbatim.
- `loadRegistry(path)` → **THROWS** (path-enriched):
  `prod-switches registry "<tmp>/…yml" is invalid: registry uses YAML tags at line 3 — switch rows must be self-contained JSON-compatible YAML for diff-reviewability`.

The bypass is closed at the pre-parse layer (the row can no longer inherit `tier`/`prod_default` through a tag), so the row stays self-contained for diff review.

---

## ADVERSARIAL-PROBE RESULTS (new tag-rejection guard — Lens A re-derivation)

Guard under test: `assertNoYamlIndirection()` tag scan, regex `/(^|\s)!{1,2}[A-Za-z]/` over comment/quoted-string-stripped lines (`registry-loader.ts:90-99`).

| Probe | Brief expectation | parseRegistry result | loadRegistry result | Verdict |
| --- | --- | --- | --- | --- |
| `!!merge "<<": {…}` (exact Lens B probe) | throw | THROWS `RegistryParseError` "uses YAML tags" @ line 3 | THROWS, path-enriched | **OK** |
| `description: "Some !! literal text"` (quoted) | pass | PASS (200 rows) | PASS | **OK** — no false positive |
| `# !! comment with tags` | pass | PASS (200 rows) | PASS | **OK** — no false positive |
| `description: !!str FOO` (value position) | throw | THROWS "uses YAML tags" @ line 7 | THROWS | **OK** |
| `tier: !custom-tag optional` (single-bang) | throw | THROWS "uses YAML tags" @ line 3 | THROWS | **OK** |
| `description: !` (lone `!` token) | pass **or** throw (verify intent) | THROWS — but via **Zod** (`!`→null→`expected string, received null`), NOT the tag guard | THROWS | **OK** — see note |
| Tag at column 0 (`!!python/object foo`) | throw | THROWS "uses YAML tags" @ line 1202 | THROWS | **OK** |
| Tag deeply indented (`              !!merge "<<"`) | throw | THROWS "uses YAML tags" @ line 7 | THROWS | **OK** |
| `description: "\u0021\u0021merge"` (unicode esc, **quoted**) | pass | PASS (200 rows) | PASS | **OK** — see note |
| `description: \u0021\u0021merge` (unicode esc, **unquoted**) | rejected by parse OR guard | PASS (200 rows) | PASS | **OK** — see note (no actual `!!` ever forms) |
| `<<: *base` (raw merge key) — regression | throw | THROWS "anchors/aliases" @ line 3 | THROWS | **OK** |
| `&base` (raw anchor) — regression | throw | THROWS "anchors/aliases" @ line 3 | THROWS | **OK** |
| `*ref` (raw alias) — regression | throw | THROWS "anchors/aliases" @ line 4 | THROWS | **OK** |
| 199 rows (just under floor) — regression | throw | THROWS Zod floor (`>200 … guardrail bypass`) | THROWS | **OK** |
| 200 rows (at floor) — regression | pass | PASS | PASS | **OK** (boundary correct) |
| `switches: []` — regression | throw | THROWS Zod floor | THROWS | **OK** |
| single row — regression | throw | THROWS Zod floor | THROWS | **OK** |
| Real `prod-switches.yml` (223 rows) | pass | PASS — 223 switches, `errorFindings=0`, `ok=true` (25 advisory `unowned` warns) | PASS | **OK** |

**Notes on the two "either/intent-verify" probes (both consistent with the guard's documented intent — no bypass):**

- **Lone `!` token (`description: !`).** The guard's documented intent (`registry-loader.ts:90-93`) is "reject YAML *tags*", where a tag token is `!`/`!!` *immediately followed by a tag-name letter*. A lone `!` with no following letter is correctly **not** a tag, so the guard does not fire; js-yaml resolves the bare `!` to `null`, which Zod then rejects (`expected string, received null`). The brief permits either outcome and asks that documented intent match behavior — it does: the guard scopes itself to named tags, and the malformed lone-`!` is still rejected downstream. No row materializes from it.
- **Unicode-escape `\u0021\u0021merge`.** Verified directly against js-yaml@4.2.0: in an **unquoted** plain scalar, `\u…` is **literal text** (backslash is not an escape in plain scalars), so the value parses as the harmless 12-char literal string `\u0021\u0021merge` — no `!!` ever forms, no tag, no indirection → correctly passes. In a **double-quoted** scalar js-yaml decodes the escapes to the string value `!!merge`, but (a) the quoted body is stripped by `stripCommentsAndStrings` before the guard runs and (b) `!!` inside a quoted scalar is a string value, not a YAML tag token, so no merge resolution occurs → correctly passes as the literal string `!!merge`. **Neither form is an actual indirection bypass**; the dangerous unquoted-`!!`-as-tag case is the one that throws. The guard's behavior matches its stated contract.

---

## LOC-EXEMPT MARKER — validity assessment (R23/R76)

PR title carries: `[LOC-EXEMPT: all net lines are test-utility + spec under test/** which R76 excludes from the prod cap; genuine prod LOC = 0; CI A3 pathspec counts test/** so floor trips on the negative tests required by audit findings]`.

**Verdict on the marker: GENUINE, not abused.**
1. **Rationale is true (re-derived).** Strict R23/R76 prod LOC = 0; every counted line lives under `test/**` (R76-excluded) plus a 3-line `package.json` manifest delta. The CI A3 gate's broad pathspec counts `test/**`, producing the net that trips its 400 floor — exactly the false positive the marker addresses.
2. **Cannot be split further without breaking a deliverable.** The lines over the floor are the negative tests that prior findings (MAJOR-2 / MINOR-1 / F1 / the R2 tag-merge bypass) *required*. The +6 fixer-R2 tests directly satisfy the round-2 finding. Removing them to satisfy the gate would re-open closed findings.
3. **Net prod LOC disclosed:** 0 (strict R23/R76).

---

## REGRESSION SWEEP (prior PASSes re-checked, R11)

No regression in any prior PASS: R3 identity, R6 snapshots, R23/R76 LOC, R74 ratio, R75 casts, R100 A1/A2/A3, R102 flipper-shape, fail-closed `.strict()` schema (row + top-level), six-field schema, loader purity, and the R1 anchor/alias/merge-key + floor + filename-enrichment fixes all still hold. Fixer R2's change is tightly scoped and additive (+19/−5 loader for the tag scan + docstring, +54 spec for 6 tests); data file untouched; 54/54 tests pass; strict compile clean. **Zero new findings.**

---

## DOCTRINE NOTES (informational — not findings)

- **N1 (carry-forward).** R74 gate-evasion-by-placement: because the loader lives under `test/`, the R100.A1 CI gate computes `SRC=0` and auto-passes without evaluating the ratio. Harmless for H4.A (conceptual ratio 2.14). Flagged for a future gate amendment. Out of scope here.
- **N2 (carry-forward).** Repo-wide R114 debt (pre-existing `^/~` ranges on unrelated deps) remains; not introduced or worsened by this PR. A dedicated dependency-pinning PR should address it.

---

## SUMMARY

Fixer R2 closed the sole remaining round-2 finding — Lens B's `!!merge "<<"` YAML-tag bypass — by extending `assertNoYamlIndirection()` with a pre-parse tag scan, plus 6 new tests (total 54). I independently re-derived the closure: the auditor's exact probe now throws `RegistryParseError` with the required message at both the `parseRegistry` and path-enriched `loadRegistry` layers. All five cumulative findings across rounds 1–2 are closed and effective. All eight brief-specified adversarial probes plus all regression probes resolve as required (the two "either" probes match the guard's documented intent — no bypass). Strict tsc is clean, 54/54 tests pass on a fresh run against the actual loader, the data file is byte-identical, the `[LOC-EXEMPT]` marker is genuine, all 3 commits carry Bradley's identity with zero banned tokens, all three R6 snapshots exist, and 10/10 CI checks are SUCCESS on the exact head SHA with no drift.

Per R14, this Lens A verdict is **CLEAN** and is necessary-but-not-sufficient: merge is authorized only on dual-CLEAN (Lens A + Lens B both CLEAN on `bda2bb60`) + all CI green + ≥5 min SHA stability + no admin bypass.

VERDICT: CLEAN
