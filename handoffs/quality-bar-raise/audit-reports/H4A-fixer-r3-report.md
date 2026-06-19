# H4.A Fixer Round 3 — close Lens B round-3 P3 (verbatim YAML tag bypass)

Fixer pass that closes the sole remaining finding on PR #458: Lens B round-3 F1
(MINOR/P3) — the `assertNoYamlIndirection` guard rejected `!!merge`, `!!str`, and
`!custom-tag`, but its letter-required regex (`/(^|\s)!{1,2}[A-Za-z]/`) missed
YAML's **verbatim tag** notation `!<tag:yaml.org,2002:merge> "<<"` and its
**percent-encoded** variant `!<tag%3Ayaml.org%2C2002%3Amerge> "<<"`. Both forms
materialize hidden `tier`/`prod_default` fields through js-yaml tag resolution
before Zod validation, leaving a production switch row non-self-contained for
diff review — the same defect as the round-2 `!!merge "<<"` bypass through a
different explicit tag form. Fix: replace the narrow tag regex with the
maximally-strict rule Lens B suggested — reject **any** unquoted/uncommented `!`
character.

## BUILD MATRIX (R124)

- backend HEAD (origin/main): `ceaa759c103b27801a67a96601337342c3ab0e6c`
- PR: #458 "feat: H4.A registry-loader for prod-switches.yml (R100) [LOC-EXEMPT: …]"
- PR base.sha (in): `ceaa759c103b27801a67a96601337342c3ab0e6c` (== main HEAD → NOT stale)
- PR head.sha BEFORE this fix (in): `bda2bb608fecab53e5d455a071293261eb64cc53`
- PR head.sha AFTER this fix (out): `8e8ffd58f87f29f3a2389fb1d488e5950962413c`
- Fixer lens: Opus 4.8 (H4.A fixer R3)
- Fix timestamp UTC: 2026-06-19T13:55Z
- PR head verified against `gh pr view 458 --json headRefOid` = `8e8ffd58…` (no drift)
- Snapshot branches present (R6):
  - `wip/h4a-init-snapshot` @ `ceaa759c103b27801a67a96601337342c3ab0e6c`
  - `wip/h4a-fixer-snapshot-20260619T114514Z` @ `604ae7d746c6bff365f357161727556229a923ad`
  - `wip/h4a-fixer-r2-snapshot-20260619T124955Z` @ `0253861ff42c660dcbdd1181058d6b8347c7657f`
  - `wip/h4a-fixer-r3-snapshot-20260619T134343Z` @ `bda2bb608fecab53e5d455a071293261eb64cc53` (pre-fix head, snapshotted BEFORE this commit)

## Finding closed

### Lens B Round-3 F1 (MINOR/P3) — verbatim YAML tag bypass → CLOSED

**File:** `test/prod-readiness/registry-loader.ts` — `assertNoYamlIndirection()`.

**Root cause:** The previous guard located a tag with
`/(^|\s)!{1,2}[A-Za-z]/`, i.e. a bang (or double-bang) immediately followed by a
tag-name **letter**. YAML's verbatim tag form puts a `<` after the bang
(`!<tag:…>`), so the letter never follows the bang and the regex did not fire.
The percent-encoded verbatim form had the same shape. A lone unquoted bang
(`tier: ! optional`) likewise passed the guard (caught only downstream by Zod).

**Mechanism of fix (before → after):**

```ts
// BEFORE (narrow, letter-required — misses !<...> and lone !):
const tagLine = code.findIndex((line) => /(^|\s)!{1,2}[A-Za-z]/.test(line));

// AFTER (maximally strict — any remaining bang is a tag indicator):
const tagLine = code.findIndex((line) => line.includes('!'));
```

The scan still runs on the same `stripCommentsAndStrings`-cleaned lines, so a
`!!` inside a quoted description or a `#` comment is removed before the test and
never trips. The thrown error message and 1-indexed line-number reporting are
unchanged:

```
registry uses YAML tags at line <N> — switch rows must be self-contained JSON-compatible YAML for diff-reviewability
```

**Safety — the strict rule is a verified no-op on real data:** Both Lens A and
Lens B verified the real `prod-switches.yml` (223 rows) contains **zero** `!`
characters. Re-verified in this fixer pass: `grep -c '!' prod-switches.yml` → `0`.
If the rule ever fires on real registry data in the future, that means a YAML tag
was added — which is exactly what we want to block.

## Probe-by-probe closure (reproduced at output SHA `8e8ffd58`)

The fix was driven against the compiled loader (ts-node) using Lens B's exact
round-3 probe inputs:

| Probe input | Expected | Observed |
| --- | --- | --- |
| `!<tag:yaml.org,2002:merge> "<<": { tier: optional, prod_default: STUB_ALLOWED }` (verbatim merge — Lens B's exact F1 probe) | throw | **THROWS** `RegistryParseError: registry uses YAML tags at line 3 — switch rows must be self-contained JSON-compatible YAML for diff-reviewability` |
| `!<tag:yaml.org,2002:str> VALUE` (verbatim type tag) | throw | **THROWS** `RegistryParseError: …uses YAML tags…` |
| `!<tag%3Ayaml.org%2C2002%3Amerge> "<<"` (percent-encoded verbatim) | throw | **THROWS** `RegistryParseError: registry uses YAML tags at line 3 — switch rows must be self-contained JSON-compatible YAML for diff-reviewability` |
| `tier: ! optional` (lone unquoted bang) | throw (newly stricter) | **THROWS** `RegistryParseError: …uses YAML tags…` (was previously caught only by Zod; now caught at the guard) |
| `!!merge "<<"` (round-2 form — regression) | throw | **THROWS** (still caught — regression-safe) |
| `name: !!str FOO` (regression) | throw | **THROWS** |
| `tier: !custom-tag optional` (regression) | throw | **THROWS** |
| `description: "Some !! literal text in prose"` (quoted) | pass | **PASSES** — no false positive |
| `# !! looks like a tag in a comment` (comment) | pass | **PASSES** — no false positive |
| Raw `<<:` merge key / `&anchor` / `*alias` (regression) | throw | **THROWS** (separate scans unchanged) |
| Real `prod-switches.yml` (223 rows) | pass | **PASSES** — `switchCount=223`, `errorFindings=0`; `grep -c '!'` = 0 |

### Lens B's exact verbatim probe — input and observed rejection

Input (the indirection-bearing row):

```yaml
switches:
  - name: VERBATIM_MERGE
    !<tag:yaml.org,2002:merge> "<<": { tier: optional, prod_default: STUB_ALLOWED }
    auto_flip_on_in_prod: false
    owner: platform
    description: "x"
```

Observed (`parseRegistry`):

```
RegistryParseError: registry uses YAML tags at line 3 — switch rows must be self-contained JSON-compatible YAML for diff-reviewability
```

The percent-encoded variant (`!<tag%3Ayaml.org%2C2002%3Amerge> "<<"`) produces
the identical rejection at line 3. The row can no longer inherit `tier`/
`prod_default` through tag resolution — it stays self-contained for diff review.

## Test count delta

- **Before:** 54 tests (Lens A + Lens B both re-derived 54/54 at `bda2bb60`).
- **After:** **58 tests** (+4), all passing.
- **New negative tests added (all in the `rejects explicit YAML tags` block):**
  1. `rejects the verbatim merge tag (!<tag:yaml.org,2002:merge> "<<") bypass`
  2. `rejects a verbatim type tag (!<tag:yaml.org,2002:str> VALUE)`
  3. `rejects the percent-encoded verbatim merge tag bypass`
  4. `rejects a lone unquoted bang (tier: ! optional) under the strict rule`
- **Positive (no-false-positive) tests retained, still passing:** quoted-`!!`
  description; `# !!` comment; real `prod-switches.yml` clean load.

### Prior test updated/removed?

**None.** A search of `registry-loader.spec.ts` for any assertion that a
lone-bang (`tier: ! optional` / `! optional`) **passes** found zero such tests —
the only `not.toThrow()` cases are the row-schema, at-floor, quoted/comment
anchor positives, and quoted/comment tag positives, none of which involve an
unquoted bang. Lens A round-3 had noted the prior lone-bang behavior was a
*downstream Zod* rejection, not a guard-asserted "pass", so there was no positive
assertion to update. The new lone-bang test (#4) documents that the strict rule
now rejects it **at the guard** — strictly tighter, no contract regression.

## R124 BUILD MATRIX — doctrine self-check at output SHA `8e8ffd58`

| Rule | Status | Evidence |
| --- | --- | --- |
| R3 (identity) | **PASS** | Fix commit `8e8ffd58f87f29f3a2389fb1d488e5950962413c` authored AND committed by `Bradley Gleave <bradley@bradleytgpcoaching.com>` (verified via `git log -1 --pretty`). Commit message `H4.A fixer R3: reject any unquoted YAML tag (closes Lens B round-3 P3)` — zero AI/Claude/Computer/Agent/Anthropic/Perplexity/OpenAI/GPT/Co-Authored-by tokens. |
| R6 (durability) | **PASS** | Pre-fix R6 snapshot `wip/h4a-fixer-r3-snapshot-20260619T134343Z` @ `bda2bb60` pushed BEFORE the fix commit; three prior H4.A snapshots remain. |
| R23/R76 (LOC) | **PASS** | `git diff --numstat`: loader `+9/−5`, spec `+48/0`. All under `test/prod-readiness/**` (R76-excluded); strict prod LOC = 0. `[LOC-EXEMPT]` marker present in PR title. |
| R74 (test:src ≥ 2.0) | **PASS** | CI `Test density (R100.A1)` SUCCESS at head. Conceptual ratio remains > 2.0 (spec grew, loader nearly flat). |
| R75 (banned casts) | **PASS** | Added-line grep for `@ts-ignore` / `@ts-expect-error` / `as any` / `as unknown as` / `as never` / `TODO` / `FIXME` / `lorem ipsum` → zero hits. CI `Banned cast tokens (R75 / R100.A2)` SUCCESS. The fix uses only `String.prototype.includes` — no casts. |
| R100.A1/A2/A3 | **PASS** | All three gate jobs SUCCESS at `8e8ffd58`. |
| R124 (BUILD MATRIX) | **PASS** | This block; SHAs pinned, head verified against `gh pr view --json headRefOid`; no drift across the CI wait. |
| TypeScript strict | **PASS** | `tsc --noEmit --strict` on the loader → exit 0, zero errors. |
| Test suite | **PASS** | `jest registry-loader.spec.ts --runInBand` → **58/58 passed**. |
| Scope / data integrity | **PASS** | Only `registry-loader.ts` and `registry-loader.spec.ts` changed; `prod-switches.yml` byte-identical (223 rows, 0 bangs). |

## CI status (at output SHA `8e8ffd58`)

**10/10 checks PASS, 0 fail, 0 skip** (verified via `gh pr checks 458`):

| Check | Result |
| --- | --- |
| build-and-test | pass (7m53s) |
| danger | pass |
| Banned cast tokens (R75 / R100.A2) | pass |
| CodeQL JS/TS (javascript-typescript) | pass (6m18s) |
| size-label | pass |
| rls-floor-guard | pass |
| LOC budget (R100.A3) | pass |
| rls-live-tests | pass (2m5s) |
| Test density (R100.A1) | pass |
| mwb-3-live-tests | pass (2m55s) |

PR head re-confirmed `8e8ffd58f87f29f3a2389fb1d488e5950962413c` after CI completed — no SHA drift.

## Summary

Fixer R3 closes Lens B round-3 F1 by replacing the narrow letter-required tag
regex with the maximally-strict "reject any unquoted/uncommented bang" rule. The
rule catches the verbatim form `!<tag:yaml.org,2002:merge> "<<"`, the
percent-encoded variant, lone bangs, and every prior tag form (`!!merge`,
`!!str`, `!custom-tag`) — regression-safe — while remaining a verified no-op on
the real 223-row `prod-switches.yml` (0 bangs). Lens B's exact verbatim probe now
throws `RegistryParseError: registry uses YAML tags at line 3 — switch rows must
be self-contained JSON-compatible YAML for diff-reviewability` at both probe
layers; the percent-encoded variant rejects identically. Test count 54 → 58 (+4
negatives; no prior test removed or updated — no positive lone-bang assertion
existed). All 3 PR commits carry Bradley's identity with zero banned tokens; the
R6 pre-fix snapshot exists; strict tsc is clean; 58/58 tests pass; 10/10 CI checks
are SUCCESS at the new head `8e8ffd58` with no SHA drift.

New head SHA: `8e8ffd58f87f29f3a2389fb1d488e5950962413c`
