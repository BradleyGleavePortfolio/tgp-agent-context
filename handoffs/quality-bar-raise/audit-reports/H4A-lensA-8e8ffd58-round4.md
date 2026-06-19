# H4.A LENS A RE-AUDIT REPORT — registry-loader (Round 4, final pass)

> Independent doctrine-adherence auditor (Lens A, stricter). Per **R11**, the fixer-R3
> report, the round-3 Lens A/B reports, and the PR description were treated as
> **hypotheses to verify, not evidence**. Every finding-closure, every BUILD MATRIX
> metric, and every probe below was **re-derived from source** on a fresh clone of
> `BradleyGleavePortfolio/growth-project-backend` pinned at the target head SHA
> `8e8ffd58`. CI green was confirmed but **not** trusted alone (R11).

## BUILD MATRIX (R124)

- main HEAD (origin/main): `ceaa759c103b27801a67a96601337342c3ab0e6c`
- PR: #458 "feat: H4.A registry-loader for prod-switches.yml (R100) [LOC-EXEMPT: …]"
- PR base.sha (in): `ceaa759c103b27801a67a96601337342c3ab0e6c` (== main HEAD; `git merge-base --is-ancestor origin/main HEAD` = yes → **NOT stale**)
- PR head.sha (out): `8e8ffd58f87f29f3a2389fb1d488e5950962413c` (matches expected; verified by BOTH `git rev-parse HEAD` AND `gh pr view 458 --json headRefOid`; re-confirmed unchanged at end of audit → **no SHA drift**)
- PR commit lineage: `604ae7d7` (initial build) → `0253861f` (fixer R1) → `bda2bb60` (fixer R2) → `8e8ffd58` (fixer R3, this head)
- Auditor lens: A (Opus 4.8 — Doctrine Adherence, stricter)
- Audit timestamp UTC: 2026-06-19T14:09:04Z
- Snapshot branches present (R6): `wip/h4a-init-snapshot` @ `ceaa759c…`; `wip/h4a-fixer-snapshot-20260619T114514Z` @ `604ae7d7…`; `wip/h4a-fixer-r2-snapshot-20260619T124955Z` @ `0253861f…`; `wip/h4a-fixer-r3-snapshot-20260619T134343Z` @ `bda2bb60…` (pre-fixer-R3 head, snapshotted BEFORE the R3 fix commit — R6 satisfied for all four rounds)

---

```
=== H4.A LENS A ROUND-4 VERDICT ===
SHA: 8e8ffd58f87f29f3a2389fb1d488e5950962413c
VERDICT: CLEAN
FINDINGS_COUNT: 0
CRITICAL: 0
MAJOR: 0
MINOR: 0
PRIOR FINDINGS CLOSED (cumulative R1–R3): 5 / 5
REGRESSIONS: 0
```

---

## BUILD MATRIX — Doctrine checks re-derived at `8e8ffd58` (R124)

| Rule | Status | Evidence (independently re-derived) |
| ---- | ------ | -------- |
| R3 (identity) | **PASS** | `git log --pretty='%H ｜ %an <%ae> ｜ %cn <%ce> ｜ %s' origin/main..HEAD` → **all 4 commits** authored AND committed by `Bradley Gleave <bradley@bradleytgpcoaching.com>`. Banned-token grep over commit author/committer/subject/body (`claude\|anthropic\|openai\|gpt\|copilot\|co-authored\|generated with\|🤖\|perplexity\|sonnet\|opus\|computer\|cursor\|llm\|assistant\|\bAI\b\|\bagent\b`) → **zero hits**. Banned-token grep over ADDED loader/spec `.ts` diff lines → none (the only AI-vendor strings in the PR are legitimate env-var data rows in `prod-switches.yml` such as `ANTHROPIC_API_KEY`/`OPENAI_API_KEY`, not authorship branding). |
| R6 (durability) | **PASS** | `git ls-remote --heads origin 'wip/*'` shows all four H4.A snapshots at the pre-work head of each round (init @ `ceaa759c`, fixer-R1 @ `604ae7d7`, fixer-R2 @ `0253861f`, fixer-R3 @ `bda2bb60`). |
| R23/R76 (LOC) | **PASS** | `git diff --numstat origin/main..HEAD`: `package.json` +3, `package-lock.json` +34/−3, `prod-switches.yml` +1373, loader `.ts` +243, spec `.ts` +560. Strict R23/R76 prod LOC (exclude `test/**`, lockfile, `*.yml` data, `*.md`, `package.json` manifest) = **0**. The entire loader lives under `test/prod-readiness/` (R76-excluded). `[LOC-EXEMPT]` marker present and **genuine** (assessment below). |
| R74 (test:src ≥ 2.0) | **PASS** | CI `Test density (R100.A1)` SUCCESS at head. Conceptual ratio treating the loader as src: full PR **560 spec / 243 loader = 2.31 ≥ 2.0**; fixer-R3 delta **48 spec / 4 net loader = 12.0**. (Carry-forward note N1 re: gate placement.) |
| R75 (banned casts) | **PASS** | Added-line grep over the full PR diff for `@ts-ignore` / `@ts-expect-error` (no issue link) / `as any` / `as unknown as` / `as never` / empty-`.catch` swallows / `Coming soon` / `lorem ipsum` / `John Doe` / `foo@bar.com` → **zero hits**. Loader uses only `as const` (TIERS/PROD_DEFAULTS); `loadRegistry` catch narrows via `instanceof z.ZodError` / `instanceof Error` (no casts). The `as unknown`/`as Record<string,unknown>` casts present are confined to the **spec** (negative-test type forcing), not prod code. CI `Banned cast tokens (R75/R100.A2)` SUCCESS. |
| R100.A1/A2/A3 | **PASS** | All three gate jobs **SUCCESS** at `8e8ffd58` (confirmed `head_sha == 8e8ffd58f87f`). |
| R102 (branch protection evidence) | **PASS** | `scripts/setup-branch-protection.sh` exists and sets `enforce_admins: true`, `required_pull_request_reviews` with `require_code_owner_reviews: true`, and `required_status_checks`. (Enablement is the H2 PR's responsibility; out of scope here.) |
| R114 (no floating versions) | **PASS** | PR adds exactly 3 `package.json` lines: the `prod-readiness:registry` script, `"js-yaml": "4.2.0"`, `"@types/js-yaml": "4.0.9"`. Both PR-added deps are **exact-pinned** (no `^`/`~`/`*`). Lockfile coherent: `node_modules/js-yaml` = 4.2.0 (dep), `node_modules/@types/js-yaml` = 4.0.9 (devDep) — both match `package.json`. Pre-existing repo-wide `^/~` ranges untouched (out of PR scope per R1 Lens B MAJOR-1 scoping). |
| R124 (BUILD MATRIX) | **PASS** | This block; SHAs pinned, head verified against `gh`, no drift. |
| Conventional Commits | **PASS** | PR title begins `feat:`. |
| TypeScript strict | **PASS** | `tsc --noEmit --strict` on the actual loader → **exit 0, zero errors**. |
| Test suite | **PASS** | `jest registry-loader.spec.ts --runInBand` via ts-jest against the **actual loader** at the new SHA → **58/58 passed** (re-derived; not trusting the fixer's "58/58"). |
| Scope / data integrity | **PASS** | Fixer R3 changed ONLY `registry-loader.ts` (+9/−5) and `…spec.ts` (+48). `prod-switches.yml` is **byte-identical** to prior rounds — 223 rows, **`grep -c '!'` = 0** (strict bang rule is a verified no-op on real data). |
| CI rollup | **PASS** | **10/10 SUCCESS** at `8e8ffd58`: build-and-test, danger, Banned cast tokens (A2), CodeQL JS/TS, size-label, rls-floor-guard, LOC budget (A3), rls-live-tests, Test density (A1), mwb-3-live-tests. All check-runs confirmed `head_sha = 8e8ffd58f87f`. |

---

## CLOSURE-OF-PRIOR-FINDINGS MATRIX (R11 — all 5 independently re-derived at `8e8ffd58`)

| # | Finding (round) | Rule | Status | Re-derived evidence at `8e8ffd58` |
| - | --- | --- | --- | --- |
| 1 | Lens A R1 F1 — errors must cite filename | diff-reviewability | **CLOSED** | Independent probe: a row with `auto_flip_on_in_prod: notabool` through `loadRegistry(path)` throws `RegistryParseError` whose message contains the file path AND `switches.0.auto_flip_on_in_prod` with expected/received types. `loadRegistry` wraps `parseRegistry` and re-throws path-enriched for ALL failure classes (Zod, floor, empty, tag). 4 F1 spec tests green. |
| 2 | Lens B R1 MAJOR-1 — floating `js-yaml`/`@types/js-yaml` | R114 | **CLOSED** | Both exact-pinned in `package.json` (`4.2.0` / `4.0.9`); lockfile entries match exactly (see R114 row). |
| 3 | Lens B R1 MAJOR-2 — empty/truncated registry accepted | guardrail | **CLOSED** | Independent probe: `switches: []` → REJECT, 1 row → REJECT, 199 → REJECT, **200 → ACCEPT** (boundary). `MIN_SWITCHES = 200`. Real 223 → accept. |
| 4 | Lens B R2 F1 — `!!merge "<<"` shorthand tag | diff-reviewability | **CLOSED** | Independent probe: the exact `!!merge "<<"` row throws `RegistryParseError: registry uses YAML tags at line 3 — …self-contained JSON-compatible YAML for diff-reviewability`. |
| 5 | Lens B R3 F1 — verbatim `!<...>` tag (+ percent-encoded) | diff-reviewability | **CLOSED** | Independent probe: both `!<tag:yaml.org,2002:merge> "<<"` and `!<tag%3Ayaml.org%2C2002%3Amerge> "<<"` throw `RegistryParseError … uses YAML tags`. Closed by the maximally-strict any-bang rule (`line.includes('!')` after comment/quoted-string stripping). |

**All 5 prior cumulative findings remain CLOSED.**

---

## ADVERSARIAL / REGRESSION PROBE RESULTS (Lens A independent re-derivation)

Guard under test: `assertNoYamlIndirection()` — merge-key scan (`/^\s*<<\s*:/`), anchor/alias scan (`/(^|[\s\[\{:,])[&*][A-Za-z_]…/`), and the strict tag scan `code.findIndex((line) => line.includes('!'))` over `stripCommentsAndStrings`-cleaned lines (`registry-loader.ts:98`).

| Probe | Expectation | parseRegistry/loadRegistry result | Verdict |
| --- | --- | --- | --- |
| `!!merge "<<": {…}` (R2 shorthand) | throw | THROWS `RegistryParseError` "uses YAML tags" @ line 3 | **OK** |
| `!<tag:yaml.org,2002:merge> "<<"` (R3 verbatim) | throw | THROWS "uses YAML tags" | **OK** |
| `!<tag%3Ayaml.org%2C2002%3Amerge> "<<"` (percent-encoded verbatim) | throw | THROWS "uses YAML tags" | **OK** |
| `auto_flip_on_in_prod: notabool` via `loadRegistry` | throw, path + field cited | THROWS path-enriched `RegistryParseError`, cites `switches.0.auto_flip_on_in_prod` | **OK** (F1) |
| `switches: []` / 1 row / 199 rows | throw (floor) | REJECT / REJECT / REJECT | **OK** (MAJOR-2) |
| 200 rows (at floor) | pass | ACCEPT | **OK** (boundary) |
| `description: "Some !! literal text"` (quoted bang) | pass | PASS — no false positive | **OK** (regression) |
| `# !! tag-like text` (comment bang) | pass | PASS — no false positive | **OK** (regression) |
| Real `prod-switches.yml` (223 rows) | pass | PASS — 223 switches, `errorFindings = 0` | **OK** |

> Note on the stripper bypass-surface (per brief §"Adversarial probes"): deep multi-line-quote / block-scalar stripper probing is **Lens B's** assigned remit. From the doctrine-adherence lens, I confirm the strict rule is implemented as documented (`registry-loader.ts:98`), runs on the same comment/quoted-string-stripped lines as the anchor/merge scans, reports a 1-indexed line number, and is a verified no-op on the 0-bang real data. The completeness of the line-by-line stripper against multi-line YAML constructs is deferred to Lens B's adversarial report.

---

## LOC-EXEMPT MARKER — validity assessment (R23/R76)

PR title carries `[LOC-EXEMPT: all net lines are test-utility + spec under test/** which R76 excludes from the prod cap; genuine prod LOC = 0; CI A3 pathspec counts test/** so floor trips on the negative tests required by audit findings]`.

**Verdict on the marker: GENUINE, not abused.**
1. **Rationale is true (re-derived).** Strict R23/R76 prod LOC = 0; every counted line lives under `test/**` (R76-excluded) plus a 3-line `package.json` manifest delta. The CI A3 gate's broad pathspec counts `test/**`, producing the net that trips its floor — exactly the false positive the marker addresses.
2. **Cannot be split further without breaking a deliverable.** The lines over the floor are the negative tests that prior findings (MAJOR-2 / R2 F1 / R3 F1) *required*; removing them re-opens closed findings.
3. **Net prod LOC disclosed:** 0 (strict R23/R76).

---

## REGRESSION SWEEP (prior PASSes re-checked, R11)

No regression in any prior PASS: R3 identity, R6 snapshots, R23/R76 LOC, R74 ratio, R75 casts, R100 A1/A2/A3, R102 branch-protection-script shape, R114 pinning, fail-closed `.strict()` schema (row + top-level), six-field schema, loader purity (FS/`console`/`process.exit` confined to the `require.main === module` CLI guard), and the R1 anchor/alias/merge-key + floor + filename-enrichment fixes, plus the R2 `!!merge` rejection, all still hold. Fixer R3's change is tightly scoped and additive (loader +9/−5 to broaden the tag scan + refresh the docstring; spec +48 for 4 new negative tests). Data file untouched (223 rows, 0 bangs); 58/58 tests pass; strict compile clean. **Zero new findings.**

---

## DOCTRINE NOTES (informational — not findings)

- **N1 (carry-forward).** R74 gate-evasion-by-placement: because the loader lives under `test/`, the R100.A1 CI gate may compute `SRC=0` for its pathspec. Harmless for H4.A (conceptual ratio 2.31). Flagged for a future gate amendment; out of scope here.
- **N2 (carry-forward).** Repo-wide R114 debt (pre-existing `^/~` ranges on unrelated deps) remains; not introduced or worsened by this PR.

---

## SUMMARY

Fixer R3 closed the sole remaining round-3 finding — Lens B's verbatim/percent-encoded YAML-tag bypass — by replacing the narrow letter-required tag regex with the maximally-strict "reject any unquoted/uncommented bang" rule (`line.includes('!')` after comment/quoted-string stripping), plus 4 new negative tests (54 → 58). I independently re-derived all five cumulative closures (Lens A R1 F1 filename; Lens B R1 MAJOR-1 pinned deps, MAJOR-2 floor; Lens B R2 F1 `!!merge`; Lens B R3 F1 verbatim/percent-encoded tag) against the actual compiled loader — every one CLOSED. The regression positives (quoted `!`, comment `!`) still pass; the real 223-row `prod-switches.yml` loads clean with 0 error findings and contains 0 bang characters (the strict rule is a verified no-op on legitimate data). Strict `tsc` is exit-0; 58/58 tests pass on a fresh run; the data file is byte-identical; the `[LOC-EXEMPT]` marker is genuine (strict prod LOC = 0); all 4 commits carry Bradley's identity with zero banned tokens; all four R6 snapshots exist; the R102 branch-protection script sets `enforce_admins: true`; PR title is Conventional (`feat:`); and 10/10 CI checks are SUCCESS on the exact head SHA with no drift between the start and end of this audit.

Per **R14**, this Lens A verdict is **CLEAN** and is necessary-but-not-sufficient: merge is authorized only on dual-CLEAN (Lens A + Lens B both CLEAN on `8e8ffd58`) + all CI green + ≥5 min SHA stability + no admin bypass.

VERDICT: CLEAN
