# H4.A Fixer Round 2 — close Lens B round-2 P3 (YAML merge-tag bypass)

Fixer pass that closes the sole remaining finding on PR #458: Lens B round-2 F1
(MINOR/P3) — the `assertNoYamlIndirection` guard rejected raw `<<:` merge keys,
`&anchor` defines, and `*alias` references, but did **not** reject the explicit
YAML tag form `!!merge "<<": { … }`. js-yaml honors that tag and materializes
inherited fields into the row before Zod sees it, keeping a production switch row
non-self-contained for diff review. Fix: reject ALL explicit YAML tags
(`!tag` / `!!tag`) before parsing, plus negative tests covering the auditor's
exact probe input.

## BUILD MATRIX (R124)

- main HEAD: `ceaa759c103b27801a67a96601337342c3ab0e6c`
- PR: #458 "feat: H4.A registry-loader for prod-switches.yml (R100) [LOC-EXEMPT: …]"
- PR base.sha (in): `ceaa759c103b27801a67a96601337342c3ab0e6c` (== main HEAD → NOT stale)
- PR head.sha BEFORE this fix: `0253861ff42c660dcbdd1181058d6b8347c7657f`
- PR head.sha AFTER this fix (out): `bda2bb608fecab53e5d455a071293261eb64cc53`
- Fixer lens: Opus 4.8 (H4.A fixer R2)
- Fix timestamp UTC: 2026-06-19T13:05Z
- Snapshot branches present (R6):
  - `wip/h4a-init-snapshot` @ `ceaa759c103b27801a67a96601337342c3ab0e6c`
  - `wip/h4a-fixer-snapshot-20260619T114514Z` @ `604ae7d746c6bff365f357161727556229a923ad`
  - `wip/h4a-fixer-r2-snapshot-20260619T124955Z` @ `0253861ff42c660dcbdd1181058d6b8347c7657f` (pre-fix head, snapshotted BEFORE this commit)

## Finding closed

### Lens B Round-2 F1 (MINOR/P3) — YAML merge-tag bypass → CLOSED

**File:** `test/prod-readiness/registry-loader.ts` — `assertNoYamlIndirection()`.

**Mechanism of fix:** After the existing merge-key and anchor/alias scans, a third
line-oriented scan rejects explicit YAML tag tokens. It runs on the same
comment-and-quoted-string-stripped lines (`stripCommentsAndStrings`), so `!!` in a
quoted description or a `#` comment is removed before the test and never trips.

```ts
const tagLine = code.findIndex((line) => /(^|\s)!{1,2}[A-Za-z]/.test(line));
if (tagLine !== -1) {
  throw new RegistryParseError(
    `registry uses YAML tags at line ${tagLine + 1} — switch rows must be self-contained JSON-compatible YAML for diff-reviewability`,
  );
}
```

**Pattern choice:** `(^|\s)!{1,2}[A-Za-z]` matches a `!` or `!!` tag token at a
line/whitespace boundary immediately followed by a tag-name letter. This is the
narrowed form recommended in the brief. Justification: the real `prod-switches.yml`
(223 rows) contains **zero** `!` characters of any kind (`grep -c '!' prod-switches.yml = 0`),
so even the strictest "reject any unquoted `!`" rule would have zero false
positives; the tag-letter form is chosen so the rule reads as "no YAML tags"
rather than "no exclamation marks", and matches all three probe forms
(`!!merge`, `!!str`, `!custom-tag`).

**Error message:** the inner guard throws
`registry uses YAML tags at line <N> — switch rows must be self-contained JSON-compatible YAML for diff-reviewability`;
`loadRegistry()` re-wraps it with the path prefix, yielding
`prod-switches registry "<path>" is invalid: registry uses YAML tags at line <N> — switch rows must be self-contained JSON-compatible YAML for diff-reviewability`.

## Closure evidence — probe-by-probe (re-derived against the compiled loader)

### Auditor's EXACT probe input

```yaml
switches:
  - name: TAG_MERGE
    !!merge "<<": { tier: optional, prod_default: STUB_ALLOWED }
    auto_flip_on_in_prod: false
    owner: platform
    description: "x"
```

- **Before fix:** parsed successfully; first row materialized `tier: "optional"` and
  `prod_default: "STUB_ALLOWED"` without those keys being row-local (the documented bypass).
- **After fix:** **REJECTED.**
  - `parseRegistry()` throws a `RegistryParseError` (`err instanceof RegistryParseError === true`, `err.name === 'RegistryParseError'`):
    `registry uses YAML tags at line 3 — switch rows must be self-contained JSON-compatible YAML for diff-reviewability`
  - `loadRegistry(path)` throws (path-enriched):
    `prod-switches registry "/tmp/probe-…/tag-merge.yml" is invalid: registry uses YAML tags at line 3 — switch rows must be self-contained JSON-compatible YAML for diff-reviewability`

### Additional negative/positive probes (all pass)

| Probe | Expectation | Result |
| --- | --- | --- |
| `!!merge "<<": { … }` (auditor probe) | throw | THROWS `RegistryParseError` / "uses YAML tags" at line 3 |
| `name: !!str FOO` (type-coercion tag) | throw | THROWS "uses YAML tags" |
| `tier: !custom-tag optional` (single bang) | throw | THROWS "uses YAML tags" |
| `description: "Some !! literal text in prose"` (quoted) | pass | PASSES — no false positive (`!!` stripped with quoted body) |
| `# !! looks like a tag in a comment` | pass | PASSES — no false positive (`!!` stripped with comment) |
| real `prod-switches.yml` (223 rows) | pass | PASSES — `loadRegistry` resolves, `switches.length === 223` |

## Regression / no-regress

- **Full spec:** `jest registry-loader.spec.ts --runInBand` → **54/54 passed** (was 48; +6 new tag-rejection tests). All prior MINOR-1 (anchor/alias/merge-key), MAJOR-2 (floor), and F1 (filename-enriched) tests still green.
- **Real registry still clean:** byte-identical `prod-switches.yml` (untouched by this fix), 223 rows, loads with 0 error findings.
- **New test count:** 6 added under `describe('parseRegistry — rejects explicit YAML tags (F1 tag-merge bypass)')`. Total **54** tests.

## Doctrine checks (re-derived at `bda2bb60`)

| Rule | Status | Evidence |
| --- | --- | --- |
| R3 identity | PASS | All 3 PR commits authored AND committed by `Bradley Gleave <bradley@bradleytgpcoaching.com>`; commit-message grep for AI/Claude/Anthropic/Perplexity/OpenAI/GPT/Copilot/Co-Authored/Computer/Agent → zero hits. New commit `bda2bb60` author+committer = Bradley. |
| R6 durability | PASS | Pre-fix snapshot `wip/h4a-fixer-r2-snapshot-20260619T124955Z` @ `0253861f` pushed BEFORE the fix commit; prior snapshots intact. |
| R75 banned casts | PASS | Added-line grep for `@ts-ignore` / `@ts-expect-error` / `as any` / `as unknown as` / `as never` / empty-`.catch` / placeholder literals → zero hits. New loader code uses no casts. |
| TypeScript strict | PASS | `tsc --noEmit --strict` on loader + spec → exit 0, zero errors, no `any`. |
| LOC (R23/R76) | PASS | Diff numstat: loader `+19/-5`, spec `+54/-0`; both under `test/**` (excluded from prod cap); strict prod LOC delta = 0. `[LOC-EXEMPT]` marker already on PR title. |
| CI | PASS | 10/10 checks SUCCESS on `bda2bb60` — build-and-test, danger, Banned cast tokens (R75/A2), CodeQL JS/TS, size-label, rls-floor-guard, LOC budget (A3), rls-live-tests, Test density (A1), mwb-3-live-tests. 0 fail / 0 skip. |
| Scope / data integrity | PASS | Only `test/prod-readiness/registry-loader.ts` + `…spec.ts` changed; `prod-switches.yml` byte-identical. |

## Diff summary

```
test/prod-readiness/registry-loader.spec.ts | +54 / -0  (6 new tag-rejection tests)
test/prod-readiness/registry-loader.ts      | +19 / -5  (tag scan in assertNoYamlIndirection + docstring)
```

## Return summary

- **New head SHA:** `bda2bb608fecab53e5d455a071293261eb64cc53`
- **CI status:** 10/10 SUCCESS, 0 fail, 0 skip.
- **Closure evidence:** auditor's exact `!!merge "<<"` probe now throws `RegistryParseError`:
  `registry uses YAML tags at line 3 — switch rows must be self-contained JSON-compatible YAML for diff-reviewability`
  (path-enriched via `loadRegistry`: `prod-switches registry "<path>" is invalid: …`).
- **Real registry:** still parses clean (223 switches, 0 error findings).
- **New test count:** 54 (was 48; +6).

Lens B round-2 F1 (the sole remaining P3) is closed. PR #458 is ready for the R14
re-audit cycle (fresh dual-lens pass on `bda2bb60`).
