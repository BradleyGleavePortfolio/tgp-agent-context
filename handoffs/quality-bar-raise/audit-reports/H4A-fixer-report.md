# H4.A FIXER REPORT — registry-loader (PR #458)

Fixer for the dual-audit findings on PR #458 (`wave-h4a-registry-loader`). Closes all four
findings (1 Lens A MINOR + 2 Lens B MAJOR + 1 Lens B MINOR) per R14 ("CLEAR OF ANY P0–P3S IN
ANY REGARD"). Every commit authored AND committed under R3 operator identity; R6 snapshot
pushed before any fix; R11-style re-verification performed on a clean clone.

## BUILD MATRIX (R124)

- backend HEAD (origin/main): `ceaa759c103b27801a67a96601337342c3ab0e6c`
- PR: #458 "feat: H4.A registry-loader for prod-switches.yml (R100)"
- PR base.sha (in): `ceaa759c103b27801a67a96601337342c3ab0e6c` (== main HEAD — NOT stale)
- PR head.sha BEFORE fix (audited SHA): `604ae7d746c6bff365f357161727556229a923ad`
- PR head.sha AFTER fix (out): `0253861ff42c660dcbdd1181058d6b8347c7657f`
- Fixer commit: `0253861ff42c660dcbdd1181058d6b8347c7657f` — author **and** committer
  `Bradley Gleave <bradley@bradleytgpcoaching.com>`
- Fixer model lens: Opus 4.8 (H4.A fixer)
- Fix timestamp UTC: 2026-06-19T12:23Z
- R6 snapshot branch pushed BEFORE fixes: `wip/h4a-fixer-snapshot-20260619T114514Z`
  @ `604ae7d746c6bff365f357161727556229a923ad`

## Doctrine compliance (R124 matrix)

| Rule | Status | Evidence |
| ---- | ------ | -------- |
| R3 (identity) | PASS | Fixer commit `0253861f`: author + committer `Bradley Gleave <bradley@bradleytgpcoaching.com>`. `git log ceaa759c..HEAD` banned-token grep (`claude/anthropic/openai/gpt/copilot/co-authored/perplexity/sonnet/opus/computer/🤖`) over commit messages AND added diff lines → zero hits. |
| R6 (durability) | PASS | `wip/h4a-fixer-snapshot-20260619T114514Z` pushed to origin at `604ae7d7` BEFORE any fix commit; confirmed via `git ls-remote`. Fixes pushed to the PR branch immediately after commit (no chained commits). |
| R11 (independence) | PASS | Re-verified on a FRESH `git clone` at head `0253861f`: all four fix artifacts present; `jest registry-loader.spec.ts` → 48/48 pass; `tsc --noEmit` registry-loader CLEAN after `prisma generate`. |
| R14 (merge gate) | ADDRESSED | All four P0–P3 findings closed (detail below). CI: 9/10 gates green; the only red is R100.A3 LOC budget — see "Open item: LOC-EXEMPT marker blocked". |
| R75 (banned casts) | PASS | Added-line grep for `@ts-ignore`, `@ts-expect-error` (no issue link), `as any`, `as unknown as`, `as never`, empty `.catch`, `"Coming soon"` → zero hits. The F1 tests use `.catch((e: unknown) => e)` (returns the error for assertion — NOT an empty swallow) and narrow `as Error` casts (allowed). CI "Banned cast tokens (R75/R100.A2)" = PASS. |
| R74 (test:src ≥ 2.0) | PASS | CI "Test density (R100.A1)" = PASS (src/** = 0 because the loader lives under test/, so the gate returns "not applicable"). Conceptual ratio treating the whole loader as src: 458 spec / 225 loader = **2.036 ≥ 2.0**. |
| R114 (no floating versions) | PASS (PR-scope) | The two deps THIS PR introduced are pinned exact: `"js-yaml": "4.2.0"`, `"@types/js-yaml": "4.0.9"` (`package.json:51,67`). Lockfile root entries match (`js-yaml: 4.2.0`, `@types/js-yaml: 4.0.9`); `package-lock.json` synced via `npm install --package-lock-only --ignore-scripts`. Pre-existing repo-wide `^/~` ranges on unrelated deps were left untouched (out of PR scope; touching them would balloon scope and risk the build). |
| R124 (BUILD MATRIX) | PASS | This block. |
| Scope | PASS | Changed files: `package.json`, `package-lock.json`, `test/prod-readiness/registry-loader.ts`, `test/prod-readiness/registry-loader.spec.ts`. `prod-switches.yml` deliberately UNCHANGED. Loader public interface unchanged except the additive `RegistryParseError`, `MIN_SWITCHES`, `assertNoYamlIndirection` exports. |

## Findings closed — per-finding evidence

### Lens A F1 (MINOR/P3) — validation errors now cite the source filename ✅ CLOSED
- **File:** `test/prod-readiness/registry-loader.ts` — `loadRegistry()` (lines ~113–139), `formatZodIssues()` (lines ~103–111).
- **Fix:** `loadRegistry(path)` now wraps `parseRegistry(raw)` in try/catch. A `ZodError` is re-thrown as `RegistryParseError` with the path prefixed and each zod issue formatted one-per-line as `  <field-path>: <expected/received>` (e.g. `  switches.0.auto_flip_on_in_prod: Invalid input: expected boolean, received string`). Non-zod `Error`s (empty-file guard, malformed YAML, anchor/alias rejection) are also re-thrown with the path prefixed. `parseRegistry(raw)` stays filename-agnostic.
- **Tests (4 added, ≥2 required):** "attaches the filename and the offending field path with expected/received types", "attaches the filename when a required field is missing", "attaches the filename to the truncated-registry (floor) failure", "attaches the filename to the empty-registry failure" — each asserts the thrown `.message` contains the temp-file path, the offending field path, and the expected/actual types.

### Lens B MAJOR-1 (R114) — floating deps pinned ✅ CLOSED
- **File:** `package.json:51,67` + `package-lock.json`.
- **Fix:** `"js-yaml": "^4.1.0"` → `"js-yaml": "4.2.0"` (matches resolved lockfile); `"@types/js-yaml": "^4.0.9"` → `"@types/js-yaml": "4.0.9"`. Lockfile re-synced; root `dependencies.js-yaml = 4.2.0`, `devDependencies.@types/js-yaml = 4.0.9`. Both `package.json` and `package-lock.json` are in the same diff (satisfies the R114 danger rule).
- **Note:** R114's repo-wide intent is broader, but this finding (Lens B MAJOR-1) is scoped to the deps THIS PR added; only those two were touched.

### Lens B MAJOR-2 — empty/truncated registry now rejected ✅ CLOSED
- **File:** `test/prod-readiness/registry-loader.ts` — `MIN_SWITCHES = 200` (line 39); `RegistrySchema.switches: z.array(RegistryRowSchema).min(MIN_SWITCHES, …)` (lines 40–49).
- **Fix:** The schema now enforces `.min(200)` with the message "production-readiness registry must list every prod-touching env switch (currently >200); an empty or truncated registry is a guardrail bypass". 200 is a safe floor below the current 223 rows.
- **Tests:** the previous "accepts an empty switches array" assertion was INVERTED to "rejects an empty switches array (truncation guardrail)"; added "rejects a single-row switches array as truncated", "rejects a switches array just under the 200-row floor", and "accepts a switches array at the 200-row floor". A test helper `pad()`/`parseRows()` was added so the small-fixture coherence/helper tests still satisfy the new floor without weakening their assertions.

### Lens B MINOR-1 — YAML anchors/aliases/merge keys now rejected ✅ CLOSED
- **File:** `test/prod-readiness/registry-loader.ts` — `assertNoYamlIndirection()` (lines 67–86), called from `parseRegistry()` (line 140), plus the `stripCommentsAndStrings()` helper (lines 88–101) and the `RegistryParseError` class (lines 52–58).
- **Fix:** Before `parseYaml`, the raw text is scanned line-by-line (with `#` comments and quoted-string bodies stripped) for merge keys (`^\s*<<\s*:`) and anchor/alias tokens (`(^|[\s\[\{:,])[&*][A-Za-z_][\w-]*`). A hit throws `RegistryParseError` with the line number and the message "… switch rows must be self-contained for diff-reviewability". The real `prod-switches.yml` was verified to produce zero false positives.
- **Tests (3 required, 7 added):** pure anchor, pure alias, merge-key (line-numbered + "self-contained" message), no-false-positive on `&`/`*` inside quoted strings, no-false-positive inside `#` comments, first-line reporting with multiple anchors, merge-key precedence over an earlier anchor, and a positive assertion that the real registry is anchor/alias/merge-free.

## CI status (head `0253861f`)

| Check | Result |
| ----- | ------ |
| build-and-test | **pass** (7m39s) — compiles + full test suite green in CI |
| Test density (R100.A1) | **pass** |
| Banned cast tokens (R75 / R100.A2) | **pass** |
| LOC budget (R100.A3) | **fail** — see open item below |
| CodeQL JS/TS | **pass** |
| danger | **pass** |
| rls-floor-guard | **pass** |
| rls-live-tests | **pass** |
| mwb-3-live-tests | **pass** |
| size-label | **pass** |

**Counts: 9 pass / 1 fail / 0 skip.** Forward-migration gate is not present on this PR (H4.A
touches no migrations — consistent with the H4 split plan).

## Net LOC delta vs `604ae7d7` (prod + test)

Per-file numstat, base `ceaa759c` → new head `0253861f`:

| File | +added | −removed | Class |
| ---- | -----: | -------: | ----- |
| `test/prod-readiness/registry-loader.ts` | 225 | 0 | test/** (R76-excluded from prod cap) |
| `test/prod-readiness/registry-loader.spec.ts` | 458 | 0 | test/** (R76-excluded) |
| `package.json` | 3 | 0 | manifest (not in CI A3 pathspec) |
| `package-lock.json` | 34 | 3 | lockfile (R76/CI-excluded) |
| `prod-switches.yml` | 1373 | 0 | data (R76-excluded; unchanged by this fixer) |

- **Genuine prod LOC under R23/R76 (excludes tests/lockfiles/data/manifest): 0.** The entire
  loader is a test-utility under `test/prod-readiness/`.
- **Fixer-commit-only delta (`604ae7d7`→`0253861f`):** loader +98/−2, spec +217/−27,
  package.json +2/−2, lockfile +2/−2.
- **CI R100.A3 formula** (counts `src/** test/** scripts/** dangerfile.js .github/workflows/** *.config.json`, minus lockfile): **683 net** — over the 400 cap because the gate counts `test/**`.

## OPEN ITEM — LOC-EXEMPT marker blocked (needs parent/operator action)

The CI R100.A3 gate counts `test/**`, so the net is 683 > 400. Under doctrine R23/R76, test
files are EXCLUDED from the prod cap, so the genuine prod LOC is 0 — the gate's broad pathspec
counts legitimate test code (the prior head was already 397, almost entirely test/** lines, so
adding the required negative tests was always going to trip the gate). The brief pre-authorized
adding `[LOC-EXEMPT: <reason>]` to the PR title for exactly this case.

**The PR-title edit was BLOCKED by the action-safety classifier** (reason: editing metadata on a
PR the agent did not create is an unauthorized External System Write). I did not force it. The
parent agent / operator should either:
1. Add `[LOC-EXEMPT: all net lines are test-utility + spec under test/** which R76 excludes from the prod cap; genuine prod LOC = 0; the CI A3 pathspec counts test/** so the floor trips on required negative tests]` to PR #458's title (this flips R100.A3 to green per the gate's own exempt branch), or
2. Accept the R100.A3 red as a known false-positive given genuine prod LOC = 0 under R76.

No code change can satisfy the gate without removing the very negative tests the findings
required (which would re-open MAJOR-2 / MINOR-1 / F1). This is a gate-pathspec / policy decision,
not a code defect.

## Summary

All four audit findings are closed with code + tests at head `0253861f`. R3 identity, R6
snapshot, R75 cast ban, R74 density, and R114 (PR-scope) all pass. The loader compiles and 48/48
tests pass both locally and in CI's `build-and-test`. The single CI red is the R100.A3 LOC gate,
which trips only because it counts `test/**` (R76-excluded) and the operator-pre-authorized
`[LOC-EXEMPT]` title marker could not be applied by the fixer (classifier block). Pending that
one-line title edit (or operator acceptance), the PR is clear of all P0–P3 findings.

VERDICT: FINDINGS_CLOSED (CI LOC-EXEMPT title edit pending operator/parent action)
