# PR #489 — Lens A Audit @ 375f310a — claude_opus_4_8

## DISPATCH HEADER (R78 / R124)
- backend repo: BradleyGleavePortfolio/growth-project-backend
- PR #489 head SHA: 375f310a17bf03c709385acc4d6d0072919b9340
- PR #489 base: main @ 185444e4326e61fd964c18498a3805533bd85152
- Branch: wave-h4-orchestrator
- Title: test: add R100 deploy-readiness orchestrator board [LOC-EXEMPT]
- LOC-EXEMPT rationale: R100 flagship orchestrator, 0 prod LOC, all test plus CI infra
- Diff: 5 files, +1745 / 0. Zero prod LOC. Includes: `.github/workflows/h4-readiness.yml` (NEW, 171 LOC), `docs/runbooks/deploy-readiness.md` (NEW), `test/deploy-readiness.spec.ts` (NEW, 1320 LOC), `test/prod-readiness.config.ts` (NEW, 146 LOC), PR template tweak (+1).
- ctxrepo: BradleyGleavePortfolio/tgp-agent-context
- Auditor: Lens A, model claude_opus_4_8 (R11 independence honored — Lens B file NOT read)
- Audit-start UTC: 2026-06-30T23:00Z
- Live-push: every checklist item pushed the moment it's written (R-live-push / R52)

---

## ITEM 1 — CI workflow security: `.github/workflows/h4-readiness.yml` (R24-R29, R71, R100.48) — HIGHEST PRIORITY

Read line-by-line (171 LOC). Findings:

- **Pinned action versions** — PASS. Three `uses:`:
  - L68/L154 `actions/checkout@v4` — official `actions/` org, major-version pinned. Auditable.
  - L70/L156 `actions/setup-node@v4` — official org, major-version pinned.
  - L105 `actions/github-script@ed597411d8f924073f98dfc5c65a23a2325f34cd  # v8.0.0` — full 40-char SHA-pinned (best practice). No `@main`/`@master`/floating tags anywhere.
- **`permissions:` block — PASS / minimal.** Top-level L46-47 `contents: read`. Job `test-deploy-readiness` (L64-66) narrows to `contents: read` + `pull-requests: write` (justified: posts PR comment). Job `deploy-readiness-gate` (L149-153) declares no job-level perms → inherits top-level `contents: read`. **No `write-all`** anywhere (grep confirmed).
- **Secrets handling — PASS.** `grep secrets\.` → only L21 and L124, both inside comments/board text. No `${{ secrets.* }}` token consumed anywhere. Nothing echoed to logs.
- **`pull_request_target` — NOT PRESENT (PASS).** Triggers (L37-42) are `pull_request`, `workflow_dispatch`, `push: release/*`. The dangerous elevated-checkout injection vector is absent. PR job runs on standard `pull_request` (read-token by default; explicit `pull-requests: write` only).
- **Script injection via `${{ github.event.* }}` — PASS.** `github.event*` appears only in `if:` evaluation contexts (L61, L151) and `github.ref` in `concurrency.group` (L50) — never interpolated into a shell `run:` block. The github-script step (L107-143) reads PR number via `context.payload.pull_request.number` (typed JS API), and board text via `fs.readFileSync` from a file — no untrusted string is spliced into shell or eval. No P0 injection.
- **Third-party action allowlist — PASS.** All three actions are first-party `actions/` org; the one with most power (github-script) is SHA-pinned.

VERDICT ITEM 1: **CLEAN.** No P0/P1.

## ITEM 2 — Concurrency / cancel-in-progress (idempotency)

L49-51: `concurrency: group: h4-readiness-${{ github.ref }}` + `cancel-in-progress: true`. Per-ref grouping prevents stacked runs on the same branch; cancel-in-progress avoids overlapping/stale runs. Board run is read-only (test execution) + a single idempotent upsert PR comment (find-by-marker then update-or-create, L133-143) — parallel runs cannot corrupt persistent state. **PASS.**

## ITEM 3 — Self-hosted runner check

Both jobs `runs-on: ubuntu-latest` (L62, L152). No `self-hosted`. **PASS.**

## ITEM 18 (workflow slice) — R79 50-failures sweep on YAML

- **Failure #36 silent errors / `continue-on-error`:** L63 `continue-on-error: true` on `test-deploy-readiness`. This DOES mask failures — but by explicit, documented design: the PR check is INFORMATIONAL during pre-launch burn-down (L12-21, L54-58), and the real enforcement is `deploy-readiness-gate` which has NO continue-on-error (L23-28, L146-147) and sets `DEPLOY_READINESS_STRICT=1` (L170) to hard-block on `release/*` push + workflow_dispatch. The masking is scoped to a non-gating informational lane, not the prod gate. **P3 observation, not a defect:** an informational PR check that never blocks could let stub/prod-switch regressions slip into the PR view unnoticed by an inattentive operator; mitigated by the strict gate before any prod ship. Defensible.
- **Command injection in `run:` steps:** none. `run:` blocks (L76, L79, L85-87, L91-101, L162, L165, L171) use only static commands + file ops (`tee`, `grep`, `awk` over a local file). `set -o pipefail` (L86) correctly preserves the test exit code through the `tee` pipe. No `${{ }}` interpolation in any `run:`.
- **Secrets exposure via debug logging:** none — no secrets referenced.

VERDICT ITEM 18 (YAML): **CLEAN** aside from one P3 observation (informational-check masking, by design).

---

## ITEM 4 — Sample 10 `it()` blocks for real assertions (R40 anti-theater)

35 describe/it blocks, 103 `expect()` calls total. Sampled 10 across the file:

1. L803 `renders ALL CLEAR when every bucket is zero` — `expect(buildExitLine(counts)).toBe(EXIT_ALL_CLEAR)` + `sumCounts→0`. Real.
2. L816 `renders the itemised DO NOT DEPLOY line` — matches regex, executes capture, asserts the 6 captured numbers `.toEqual([2,1,6,3,4,5])` + `sumCounts→21`. Strong behavioural assertion.
3. L893 `happy-path fixture aggregates to zero` — loops strict∈{false,true}, asserts totalRed/strictTotalRed/exitLine/board contains 'SAFE TO DEPLOY'. Real.
4. L919 `env-dependent-only red gates under strict but not PR` — asserts strict gates (`>0`, DO_NOT_DEPLOY regex) AND PR does not (`totalRed===0`, strictTotalRed>0, ALL_CLEAR, board contains 'PROD-DEPLOY RED LINES (strict): 1'). Excellent dual-mode assertion.
5. L947 `stub section counts only BLOCK_SHIP as red` — `r.red===1`, `r.gating===true`, line contains `src/a.ts:1`. Real (filters WARN/INFO).
6. L959 `wiring section counts STUB providers, ignores NOT_USED/WIRED` — `r.red===1`, line contains 'Stripe'. Real.
7. L970 `operator-keys section` — `keyGaps===3`, `result.red===3`, contains 'STRIPE_LIVE_MODE'. Real arithmetic over gap sources.
8. L1244 `wrongly-set switch in red, correct in OK` — `wrong===1`, body contains 'WRONG] WRONG_FLAG' + 'actual=set expected=OFF', classifySwitch OK vs WRONG, then board gates with DO_NOT_DEPLOY. Real.
9. L1276 `unset MUST_SET/ON → WARN (strict-only)` — `wrong===0`, `warn>=2`, PR totalRed===0 but strict totalRed===warn. Real mode-sensitive gating.
10. L1194 `finds planted tokens in supabase/migrations + .env.example` — asserts non-src roots scanned, 6 specific tokens detected, every config hit BLOCK_SHIP, stub section red>0. Real.

VERDICT ITEM 4: **PASS.** Every sampled block carries ≥1 meaningful behavioural `expect()`. No `.toBeDefined()`/exists theater.

## ITEM 5 — R86 anti-padding (1320 LOC)

Tests are genuinely distinct, organized by behaviour class, not permutation padding:
- exit-line format (ALL CLEAR vs itemised DO NOT DEPLOY, regex non-overlap)
- aggregation correctness (full breakdown, PR-vs-strict mode gating, happy-path, env-dependent-only)
- section runners (stub / wiring / operator-keys / auto-flipper) — each a distinct sub-scanner with distinct assertion class
- config registry (render order, exactly-one-informational, H4.E+H4.F coverage, pattern exposure)
- mode resolution R104
- live-repo integration (quick/full/strict against REPO_ROOT)
- learning-ledger tracked-debt downgrade (unit + live)
- stub-scan scope across src/ + supabase/ + .env.example
- prod-switch render+gate per registry row
Each section exercises a unique behaviour; the table-driven cases (e.g. L1244/L1276) test *different* classification outcomes (WRONG vs WARN), not duplicate permutations. LOC is justified by the orchestrator's 7-section surface + dual-mode (PR/strict) matrix. No R86 padding finding.

VERDICT ITEM 5: **PASS.**

## ITEM 6 — R109 no half-ass (`.skip|.todo|xit|fit|fdescribe|"Coming soon"`)

grep hits:
- L1093 `const gateDescribe = resolveStrict(process.env) ? it : it.skip;` — **NOT a half-ass skip.** This is a deliberate environment-gated test: the STRICT prod-deploy gate test (L1094-1106) runs ONLY when `DEPLOY_READINESS_STRICT=1` (set by the YAML gate job L168-170); skipped in PR/local so it never false-fails. The test body has real assertions (`board.totalRed===0`, `board.exitLine===EXIT_ALL_CLEAR`). Legitimate conditional execution, documented L1083-1092. **P3 note** only: a conditionally-skipped gate test means the hard-gate assertion never runs in CI on the PR itself — but that is exactly the design (gate runs on release/* push + workflow_dispatch). Acceptable.
- `TODO_BEFORE_PROD` (L344 const, L1167 planted fixture, L1209 assertion) — **NOT R20 TODOs.** These are scanner *needle tokens* the orchestrator hunts for as deploy hazards; L344 is a data constant, L1167 is a planted test fixture, L1209 asserts detection. Correct fixture usage, not unfiled work.
No `.todo`, `xit`, `xtest`, `fit`, `fdescribe`, or "Coming soon". VERDICT ITEM 6: **PASS** (1 P3 note).

## ITEM 7 — R75 / R100.A2 banned casts

grep over added diff (`test/`, `docs/`, `.github/`) for `as any|as unknown as|as never|@ts-ignore|@ts-nocheck|<any>` → **ZERO** in added lines. (The only mentions are inside the PR template checklist text enumerating the banned tokens — not actual casts.) VERDICT ITEM 7: **PASS (0).**

## ITEM 9 — R117/R123 assertion-bearing / deterministic pass-fail

Every sampled path produces deterministic pass/fail against fixed fixtures or the live repo board (`runDeployReadiness({repoRoot, mode})`). No tautological/always-pass tests observed. The dual-mode assertions (PR vs strict) pin BOTH the gating verdict and the surfaced strict count, so a regression that silently flips gating would fail. No "passes when it shouldn't" pattern. VERDICT ITEM 9: **PASS.**

---

## ITEM 8 — `test/prod-readiness.config.ts`: config or hidden prod code? (147 LOC)

Read in full. It is **pure config/metadata**:
- `BOARD_SECTIONS` (L27-34): 6 `as const` string ids.
- `BoardSection`/`SectionMode` types + `ScannerRegistration` interface (L36-60).
- `SCANNER_REGISTRY` (L69-118): typed data table mapping each section → label/origin/mode/asserts.
- `REGISTRY_PATH`, `LEDGER_PATH` (L125, L132): string path constants.
- Two trivial PURE helpers: `gatingSections()` (filter, L135-137) and `registrationFor()` (find-or-throw, L140-146).
Module-level docstring (L13) states "imports NO scanner code and performs NO I/O" — confirmed: no `fs`, no imports, no business/runtime logic that belongs in `src/`. The find-or-throw is test-harness wiring, not prod behaviour. **Not hidden prod code.** Correctly lives under `test/`.

Minor: `BOARD_SECTIONS` has 6 ids but L22-23 docstring says "seven board sections … seven merged H4 sub-scanners (H4.A through H4.G)". The 7 H4 lanes map to 6 sections (H4.E+H4.F merge into WIRING per L89 and test L1006). Doc wording "seven board sections" is imprecise (it's seven *scanners* → six *sections*). **P3 nit** (cosmetic doc, no behavioural impact).

VERDICT ITEM 8: **PASS** (1 P3 doc nit).

## ITEM 10 — Runbook `docs/runbooks/deploy-readiness.md` (107 LOC)

Read in full. Actionable, not placeholder:
- "What the board is" — section table with the question each answers.
- Two exit-line formats documented (ALL CLEAR vs itemised DO NOT DEPLOY).
- "The two ways the board runs" — PR informational (gates STUB+PROD SWITCHES only; explains why env-dependent sections don't block on a PR runner) vs prod-deploy hard block (`DEPLOY_READINESS_STRICT=1`).
- "How to run it yourself" — three concrete `npm run test` invocations (full, quick, strict).
- "What to do when it says DO NOT DEPLOY" — numbered per-bucket remediation (STUB / PROD SWITCHES WRONG / WIRING GAPS / ENV GAPS / KEY GAPS) with exact file paths and fixes.
- "Operator setup after this lands" — two one-time post-merge actions (branch protection, promote informational→required), correctly flagged as out-of-PR operator work.
- "Where the pieces live" — path map.
No placeholder text. **R20: zero unfiled TODOs/FIXMEs** in the runbook (grep confirmed). Same harmless "seven" framing as item 8 (P3, already counted). VERDICT ITEM 10: **PASS.**

## ITEM 11 — PR template `.github/PULL_REQUEST_TEMPLATE.md` (+1)

The single added line (diff L+23):
`+ - [ ] **R100 deploy-readiness board: ALL CLEAR** (PR mode gating sections green; environment-dependent sections surfaced for the prod-deploy gate)`
Inserted into the existing "R-rule self-check" checklist, immediately after the prior R100 prod-readiness checkbox. Pure additive (+1/0), legitimate new-orchestrator checkbox, surrounding lines untouched. **No stealth edit.** VERDICT ITEM 11: **PASS.**
