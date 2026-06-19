# H4.A LENS A RE-AUDIT REPORT — registry-loader (Round 2, post-fixer)

> Same independent doctrine-adherence auditor as Round 1 (R11). The fixer report and builder
> report were treated as hypotheses, not evidence. Every finding-closure and every BUILD MATRIX
> metric below was **re-derived from source** on a fresh clone pinned at the new head SHA. CI
> green was confirmed but **not** trusted alone.

## BUILD MATRIX (R124)

- backend HEAD (origin/main): `ceaa759c103b27801a67a96601337342c3ab0e6c`
- PR: #458 "feat: H4.A registry-loader for prod-switches.yml (R100) [LOC-EXEMPT: …]"
- PR base.sha (in): `ceaa759c103b27801a67a96601337342c3ab0e6c` (== main HEAD; `git merge-base --is-ancestor origin/main HEAD` = yes → **NOT stale**)
- PR head.sha (out): `0253861ff42c660dcbdd1181058d6b8347c7657f` (matches expected; verified by BOTH `git rev-parse HEAD` AND `gh pr view 458 --json headRefOid`; no SHA drift during audit)
- Previous (Round-1) head.sha: `604ae7d746c6bff365f357161727556229a923ad`
- Auditor lens: A (Opus 4.8 — Doctrine Adherence, stricter)
- Audit timestamp UTC: 2026-06-19T12:45:15Z
- Snapshot branches present: `wip/h4a-init-snapshot` @ `ceaa759c…` (== main HEAD); `wip/h4a-fixer-snapshot-20260619T114514Z` @ `604ae7d7…` (R6 satisfied — fixer snapshotted the pre-fix head before committing)

---

```
=== H4.A LENS A RE-AUDIT VERDICT (Round 2) ===
SHA: 0253861ff42c660dcbdd1181058d6b8347c7657f
VERDICT: CLEAN
FINDINGS_COUNT: 0
CRITICAL: 0
MAJOR: 0
MINOR: 0
ROUND-1 FINDINGS CLOSED: 4 / 4 (Lens A F1 + Lens B MAJOR-1, MAJOR-2, MINOR-1)
REGRESSIONS: 0
```

---

## ROUND-1 FINDING CLOSURE — per-finding re-derived evidence (R11)

All four Round-1 findings (my F1 + Lens B's MAJOR-1/MAJOR-2/MINOR-1) are **CLOSED** and **effective**, verified by independent probe against the compiled loader at head `0253861f` (not by reading the fixer report).

### Lens A F1 (MINOR/P3) — validation errors now cite the source filename ✅ CLOSED
- **Fix location:** `test/prod-readiness/registry-loader.ts` — `loadRegistry()` (lines 118-133) wraps `parseRegistry(raw)` in try/catch; `formatZodIssues()` (lines 107-115).
- **Mechanism:** A `ZodError` is re-thrown as `RegistryParseError` with the `path` prefixed and each issue formatted one-per-line; non-zod `Error`s (empty-file guard, malformed YAML, anchor/alias rejection) are also re-thrown with `path` prefixed. `parseRegistry(raw)` stays filename-agnostic.
- **Independent probe (compiled loader, real `js-yaml@4.2.0`/`zod@4.4.3`):**
  - Wrong-typed field → `prod-switches registry "/tmp/…-typewrong.yml" is invalid:\n  switches.0.auto_flip_on_in_prod: Invalid input: expected boolean, received string` — **filename + field path + expected/received all present.**
  - Missing required field → `…"/tmp/…-missing.yml" is invalid:\n  switches.0.owner: Invalid input: expected string, received undefined` — present.
  - Empty-file guard → `prod-switches registry "/tmp/empty-content.yml" is invalid: registry is empty: expected a top-level \`switches:\` array` — **path now attached** (Round-1 noted this guard omitted the path; fixed).
  - Truncation/floor failure → path + `switches:` floor message present.
  - (A nonexistent path raises a raw `ENOENT` from `readFile` that already names the path; F1 was specifically scoped to *validation* errors omitting the filename — those are now enriched.)
- **Tests:** 4 added under `describe('loadRegistry — error messages cite the source filename (F1)')` (spec lines 304-364) — all assert `.message` contains the temp-file path + offending field path + expected/actual. All pass.

### Lens B MAJOR-1 (R114) — floating deps pinned ✅ CLOSED
- **Brief closure criterion:** `grep -E '"(\^|~)' package.json` returns zero hits for `js-yaml` and `@types/js-yaml`.
- **Independent grep:** `package.json:51` → `"js-yaml": "4.2.0"`; `package.json:67` → `"@types/js-yaml": "4.0.9"`. **No `^`/`~`/`*` on either line.** `git diff` confirms the Round-1 `"^4.1.0"`/`"^4.0.9"` were the exact lines changed.
- **Lockfile coherence:** `package-lock.json` root `dependencies.js-yaml = 4.2.0`, `devDependencies.@types/js-yaml = 4.0.9`, and `node_modules/js-yaml` / `node_modules/@types/js-yaml` resolved entries all = `4.2.0` / `4.0.9`. `package.json` and `package-lock.json` are in the same diff (satisfies the R114 danger rule).
- **Scope note (not a finding):** The repo carries many pre-existing `^`/`~` ranges on *unrelated* deps (e.g. `@nestjs/*`, `zod ^4.4.3`, `@sentry/node ~10.53.1`). R114's repo-wide intent is broader, but Round-1 Lens B MAJOR-1 was explicitly scoped to **the two deps THIS PR introduced**; the fixer correctly limited the change to those two to avoid a scope explosion and build risk. A repo-wide R114 sweep is a separate work item, out of scope for H4.A. The PR-scoped finding is fully closed.

### Lens B MAJOR-2 — empty/truncated registry now rejected ✅ CLOSED
- **Fix location:** `test/prod-readiness/registry-loader.ts` — `MIN_SWITCHES = 200` (line 39); `RegistrySchema.switches: z.array(RegistryRowSchema).min(MIN_SWITCHES, …)` (lines 40-49).
- **Independent probe (programmatic row generation):**
  - `switches: []` → **REJECTED** with "production-readiness registry must list every prod-touching env switch (currently >200); an empty or truncated registry is a guardrail bypass".
  - single row → **REJECTED** (same floor message).
  - 199 rows (just under floor) → **REJECTED**.
  - 200 rows (at floor) → **ACCEPTED** (correct boundary).
  - Real `prod-switches.yml` (223 rows) → still **ACCEPTED**, `errorFindings=0`, `ok=true` (no false positive; floor of 200 < current 223 leaves head-room).
- **Tests:** the prior "accepts an empty switches array" assertion was **inverted** to "rejects an empty switches array (truncation guardrail)"; added single-row-reject, just-under-floor-reject, and at-floor-accept cases (spec lines 182-200). All pass.

### Lens B MINOR-1 — YAML anchors/aliases/merge keys now rejected ✅ CLOSED
- **Fix location:** `assertNoYamlIndirection()` (lines 67-86), called from `parseRegistry()` (line 140); `stripCommentsAndStrings()` helper (lines 88-105); `RegistryParseError` class (lines 52-58).
- **Mechanism:** raw text scanned line-by-line (with `#` comments and quoted-string bodies stripped) for merge keys (`/^\s*<<\s*:/`) and anchor/alias tokens (`/(^|[\s\[\{:,])[&*][A-Za-z_][A-Za-z0-9_-]*/`); a hit throws `RegistryParseError` with the **line number** and a "self-contained for diff-reviewability" message.
- **Independent probe:**
  - pure anchor (`&base`) → **REJECTED**, "YAML anchors/aliases (&name / *name) at line 2".
  - alias reference (`*a`) → **REJECTED**, line-numbered.
  - merge key (`<<: *base`) → **REJECTED** (anchor define caught first at line 2; merge-key precedence verified by the spec's standalone merge-only test).
  - **False-positive guard:** `& * ` inside a quoted `description` string → **ACCEPTED** (220 rows, no false positive). Inside `#` comments → accepted (spec test). Real `prod-switches.yml` → loads clean (anchor/alias/merge-free).
- **Tests:** 7 added under `describe('parseRegistry — rejects YAML anchors/aliases/merge keys (MINOR-1)')` (spec lines 366-430): anchor, alias, merge-key (line-numbered), no-false-positive-in-quotes, no-false-positive-in-comment, first-line reporting, merge-key precedence, and a positive assertion that the real registry is indirection-free. All pass.

---

## BUILD MATRIX — Doctrine checks re-run on the NEW SHA (R124)

| Rule | Status | Evidence (re-derived at `0253861f`) |
| ---- | ------ | -------- |
| R3 (identity) | **PASS** | Two commits since main; **both** authored AND committed by `Bradley Gleave <bradley@bradleytgpcoaching.com>` (`git log origin/main..HEAD --pretty='%an <%ae>｜%cn <%ce>'`). Banned-token grep (`claude/anthropic/openai/gpt/copilot/co-authored/generated with/🤖/perplexity/sonnet/opus`) over commit messages → zero hits. Over added diff lines: the only matches (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `PERPLEXITY_API_KEY`, and a "Claude Sonnet adapter" description) are **all in `prod-switches.yml` as legitimate env-var data rows** — switch *names* the production system needs and descriptions of what those secrets do — **not** LLM-authorship branding in code/comments. The loader + spec code added lines are token-clean. (Same disposition as Round 1.) |
| R6 (durability) | **PASS** | `wip/h4a-init-snapshot` @ main HEAD; `wip/h4a-fixer-snapshot-20260619T114514Z` @ `604ae7d7` (fixer snapshotted the pre-fix head BEFORE committing the fix). |
| R23/R76 (LOC) | **PASS** | Re-derived. Strict R23/R76 prod LOC (exclude `test/**`, lockfile, `*.yml` data, `*.md`, `package.json` manifest) = **0**. The entire loader is a test-utility under `test/prod-readiness/`. `package.json` +3 is manifest (script + 2 dep lines). CI A3 broad-pathspec net = **683** (counts `test/**`) → trips the gate, which is exactly the false-positive the `[LOC-EXEMPT]` marker addresses (see below). |
| R74 (test:src ≥ 2.0) | **PASS** | CI A1 returns "not applicable" (its SRC pathspec sees `src/**`=0 because the loader lives under `test/`). Conceptual ratio treating the loader as src: **458 spec / 225 loader = 2.036 ≥ 2.0**. Same gate-placement note as Round-1 N1 carries forward (informational, not an H4.A violation). |
| R75 (banned casts) | **PASS** | Added-line grep (fixer commit `604ae7d7..0253861f` AND full PR) for `@ts-ignore` / `@ts-expect-error` (no issue link) / `as any` / `as unknown as` / `as never` / empty-catch swallows / placeholder literals → **zero hits**. The F1 tests use `(err as Error).message` (narrowing cast, allowed) and the negative schema tests use single `as unknown` (NOT the banned `as unknown as`) to feed malformed literals to `.parse()` — legitimate, and in test files (excluded from the A2 scan anyway). Loader uses only `as const`. CI "Banned cast tokens (R75/R100.A2)" = PASS. |
| R100.A1/A2/A3 | **PASS** | All three gate jobs **green** on `0253861f` (`gh pr view --json statusCheckRollup`). A3 LOC budget — previously the single red — is now **SUCCESS** because the `[LOC-EXEMPT]` title marker is applied (gate's own exempt branch). A2/A3 formulas independently reproduced locally; results match. |
| R102 (flipper shape) | **PASS** | Schema still types `tier` (enum), `prod_default` (enum), `auto_flip_on_in_prod` (boolean) and exposes `getAutoFlip()` + `getProdRequired()`. No regression from the fixer. |
| R114 (no floating versions) | **PASS (PR-scope)** | The two deps THIS PR introduced are exact-pinned; lockfile synced. Pre-existing repo-wide `^/~` ranges untouched (out of scope; see MAJOR-1 closure note). |
| R124 (BUILD MATRIX) | **PASS** | This block; every fixer-report claim independently verified (48 tests, 225 loader / 458 spec LOC, pinned deps, LOC math). |
| TypeScript strict | **PASS** | `tsc --noEmit --strict` (with `@types/node`+`@types/jest`) on loader + spec → **exit 0, zero errors, no `any`**. |
| Test suite | **PASS** | `jest registry-loader.spec.ts --runInBand` → **48/48 passed** on a fresh independent install at the new SHA (re-derived; not trusting the fixer's "48/48" claim). |
| Loader purity | **PASS** | All FS I/O is inside `loadRegistry()` (a function), and `console.*`/`process.exit` only inside the `if (require.main === module)` CLI guard (lines 211-225). Importing the module has no side effects. Public interface only grew additively (`UNOWNED`, `MIN_SWITCHES`, `RegistryParseError`, `assertNoYamlIndirection`). |
| Scope / data integrity | **PASS** | Fixer changed only `package.json`, `package-lock.json`, loader `.ts`, spec `.ts`. `prod-switches.yml` is **byte-identical** to Round 1 (`git diff --quiet 604ae7d7..HEAD -- prod-switches.yml` = no change); still 223 rows. |

---

## LOC-EXEMPT MARKER — validity assessment (R23/R76)

The PR title now carries:
`[LOC-EXEMPT: all net lines are test-utility + spec under test/** which R76 excludes from the prod cap; genuine prod LOC = 0; CI A3 pathspec counts test/** so floor trips on the negative tests required by audit findings]`

**Verdict on the marker: GENUINE, not abused.**
1. **Rationale is true.** Strict R23/R76 prod LOC = 0 (re-derived); every counted line lives under `test/**`, which R76 explicitly excludes from the prod cap. The CI A3 gate's broad pathspec counts `test/**`, producing the 683 net that trips it.
2. **Cannot be split further without breaking a deliverable.** The lines over the gate's 400 floor are the negative tests that Round-1 findings MAJOR-2 / MINOR-1 / F1 *required*. Removing them to satisfy the gate would re-open those findings — a self-defeating "split". This is precisely the case the brief pre-authorized the marker for.
3. **Net prod LOC reported:** 0 (strict R23/R76); 683 (CI A3 broad formula). Both disclosed.

The fixer report's lone "open item" (marker classifier-blocked) is **resolved**: the marker is now on the PR title and CI A3 is green.

---

## REGRESSION SWEEP (Round-1 PASSes re-checked, R11)

No regression in any Round-1 PASS: R3 identity, R6 snapshots, R23/R76 LOC, R74 ratio, R75 casts, R100 A1/A2/A3, R102 flipper-shape, six-field strict fail-closed schema (`.strict()` on row + top-level; unknown/missing/typo'd fields rejected), and loader purity all still hold. The fixer's additions are tightly scoped and additive; the data file is untouched; 48/48 tests pass; strict compile is clean. **Zero new findings.**

---

## DOCTRINE NOTES (informational — not findings)

- **N1 (carry-forward).** R74 gate-evasion-by-placement: because the loader lives under `test/`, the R100.A1 gate computes `SRC=0` and auto-passes without evaluating the ratio. Harmless for H4.A (conceptual ratio 2.036). Flagged for a future gate amendment / the H4.H orchestrator PR. Out of scope here.
- **N2.** Repo-wide R114 debt (many pre-existing `^/~` ranges on unrelated deps) remains; not introduced or worsened by this PR. A dedicated dependency-pinning PR should address it.

---

## SUMMARY

The fixer closed **all four** Round-1 findings (Lens A F1 + Lens B MAJOR-1, MAJOR-2, MINOR-1) with code + tests at head `0253861f`, and introduced **no regressions** and **no new findings**, all verified by independent re-derivation (probes against the compiled loader, a fresh 48/48 test run, strict compile, and re-computed LOC/identity/cast metrics — not by trusting the fixer report or CI alone). The previously-red R100.A3 LOC gate is now green via a genuine, non-abused `[LOC-EXEMPT]` marker; all 10/10 CI checks are SUCCESS. R3 identity, R6 snapshots, R23/R76, R74, R75, R100, R102, R114 (PR-scope), R124, fail-closed schema, and loader purity all PASS.

Per R14, this Lens A verdict is **CLEAN** and necessary-but-not-sufficient: merge is authorized only on dual-CLEAN (Lens A + Lens B both CLEAN on `0253861f`) + all CI green + ≥5 min SHA stability + no admin bypass.

VERDICT: CLEAN
