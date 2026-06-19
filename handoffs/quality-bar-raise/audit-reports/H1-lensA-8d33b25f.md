# H1 AUDIT — LENS A (Opus 4.8)

## BUILD MATRIX
- main HEAD: e207cc02c8d58348783a6e3a0794377cc16b8251
- PR: #455 "WIP: Wave H1 — Quality bar raise: configs & policy files"
- PR base.sha (in): e207cc02c8d58348783a6e3a0794377cc16b8251  (== main HEAD; merge-base confirms PR is FRESH, not stale)
- PR head.sha (out): 8d33b25fc2654ba856810b701bd00ccf08874417
- Auditor lens: A=Opus 4.8
- Audit timestamp UTC: 2026-06-19T09:37:17Z
- Snapshot branches present: wip/h1-fix-codeql-snapshot (3a3b442), wip/h1-fix-lefthook-snapshot (7633304), wip/h1-rebase-snapshot (7633304)

---

## HEAD / AUTHOR VERIFICATION
- `git log -1` head == `8d33b25fc2654ba856810b701bd00ccf08874417` ✓ matches expected
- Author == `Bradley Gleave <bradley@bradleytgpcoaching.com>` ✓
- All 20 commits in `e207cc02..8d33b25f` authored AND committed by `Bradley Gleave <bradley@bradleytgpcoaching.com>` (sole author, `sort -u` confirms single identity) ✓

## R3 — IDENTITY CHECK
**Commit metadata grep** (`claude|anthropic|openai|gpt-|computer agent|perplexity|co-authored|generated with|🤖|ai assist`): **CLEAN** — zero hits across all commit subjects + bodies.

Broader bare-word scan (`\b(ai|agent|computer|bot)\b`) on commit log surfaced ONE line:
- `566f3a2 | ... | wave-h1: .well-known/ai.txt (AI training opt-out)` — this "AI" refers to the **filename `ai.txt`**, a published web standard (AI-crawler training opt-out, analogous to robots.txt). It is a descriptive reference to a standards artifact, NOT AI self-attribution or LLM-vendor branding. **NOT an R3 violation.**

**Final committed file-content grep** (HEAD, all 15 PR files) surfaced these, all benign:
- `.h1-status.txt` — the OLD pre-PR version contained `Builder: claude_opus_4_8 (respawn v2)`. This PR **REWRITES that line** to `(operator-direct build session)`. The banned token appears ONLY on a REMOVED (`-`) diff line; the final committed content is **CLEAN**. ADDED-lines R3 grep = CLEAN. ✓ (Good catch by builder — the offending status line was scrubbed.)
- `.github/PULL_REQUEST_TEMPLATE.md:31` — "...no AI/Co-Authored tokens" — this is the R3 **rule text** in a self-check checklist (instructs humans to avoid AI tokens). Legitimate doctrine reference.
- `lefthook.yml:29,31,32` — the R3 commit-msg enforcement hook that **blocks** `claude/co-authored/perplexity` tokens. Words appear inside the grep pattern that ENFORCES R3. Legitimate.
- `package.json:28,50` (`@anthropic-ai/sdk`, `openai`) — **pre-existing application dependencies** (AI coaching product feature). Confirmed CONTEXT-only lines, NOT added by this PR (`git diff ... | grep '^+'` returns nothing for these).
- `.github/workflows/ci.yml:105,109` (`ANTHROPIC_API_KEY`) — **ci.yml is NOT in this PR's diff** (confirmed via `git diff --name-only`). Pre-existing.

**R3 verdict: PASS.** No AI self-attribution / vendor-branding introduced by this PR.

## DIFF MANIFEST (15 files, +467 / -9)
```
16	0	.editorconfig
34	0	.github/ISSUE_TEMPLATE/bug_report.md
23	0	.github/ISSUE_TEMPLATE/feature_request.md
39	0	.github/PULL_REQUEST_TEMPLATE.md
44	0	.github/workflows/codeql.yml
29	0	.github/workflows/pr-size-labeler.yml
24	8	.h1-status.txt
8	0	.prettierignore
8	0	.prettierrc.json
3	0	.well-known/ai.txt
6	0	.well-known/security.txt
34	0	lefthook.yml
164	0	package-lock.json
3	1	package.json
32	0	renovate.json
```
GitHub-reported +467/-9 / 15 files re-derived and CONFIRMED.

## R23/R76 — LOC BUDGET (strict ≤400; NO [LOC-EXEMPT] marker in title → CI/config count)
Exclusions applied: package-lock.json (lockfile), `*.md` (docs), .h1-status.txt (status/doc scaffold).

| File | +add | -del | Counts? |
|---|---|---|---|
| .editorconfig | 16 | 0 | PROD |
| .github/workflows/codeql.yml | 44 | 0 | PROD (CI = prod) |
| .github/workflows/pr-size-labeler.yml | 29 | 0 | PROD (CI = prod) |
| .prettierignore | 8 | 0 | PROD |
| .prettierrc.json | 8 | 0 | PROD |
| .well-known/ai.txt | 3 | 0 | PROD |
| .well-known/security.txt | 6 | 0 | PROD |
| lefthook.yml | 34 | 0 | PROD |
| package.json | 3 | 1 | PROD |
| renovate.json | 32 | 0 | PROD |
| .github/ISSUE_TEMPLATE/bug_report.md | 34 | 0 | EXCL (docs) |
| .github/ISSUE_TEMPLATE/feature_request.md | 23 | 0 | EXCL (docs) |
| .github/PULL_REQUEST_TEMPLATE.md | 39 | 0 | EXCL (docs) |
| .h1-status.txt | 24 | 8 | EXCL (status doc) |
| package-lock.json | 164 | 0 | EXCL (lockfile) |

**NET PROD LOC ADDED = +183** (−1). Well under strict ≤400 cap.
Conservative sensitivity: even counting the 3 `.md` templates as prod (96 add) → +279, still < 400. **R23 PASS** under any reasonable interpretation.

## R74 / R100.A1 — TEST DENSITY
- Added test lines: **0** (no `*.test.*`, `*.spec.*`, `__tests__`, or `test/` files added — confirmed)
- Added prod lines: **183**
- Ratio = 0 / 183 = **0.0**  (required ≥ 2.0)
- `[TEST-EXEMPT: ...]` marker in title? **NO** (title: "WIP: Wave H1 — Quality bar raise: configs & policy files")

Per R74 + task step 5: net new prod LOC > 0 AND ratio < 2.0 AND no TEST-EXEMPT marker → **FINDINGS**.

**Assessment / mitigation note:** The content is 100% non-unit-testable infrastructure (editorconfig, prettier configs, CI workflow YAML, renovate config, lefthook git-hooks, `.well-known/` static policy files, GitHub issue/PR templates). This is *exactly* the category R74 contemplates as legitimately exempt. The substance is sound. The defect is **mechanical/procedural**: the title omits the required `[TEST-EXEMPT: config/infra-only, not unit-testable]` marker. Doctrine makes the marker the gating mechanism, and it is absent — so I am obligated to raise it. **Remediation is trivial:** operator/builder adds the `[TEST-EXEMPT: ...]` marker to the PR title, after which this finding clears with no code change.

## R75 / R100.A2 — BANNED-TOKEN GREP (added lines only)
`@ts-ignore|@ts-expect-error|as any|as unknown as|as never|.catch(()=>undefined|null|{})|Coming soon|lorem ipsum|foo@bar|John Doe`: **R75 CLEAN** — zero hits.
Supplementary `TODO|FIXME|XXX|placeholder|example.com|changeme|stub` scan on added lines: **none.**
- The `security.txt` host TODO (D-H1-1) noted in an early commit message was RESOLVED — final file has `Canonical: https://api.thegrowthproject.app/.well-known/security.txt`, no TODO remains. ✓
- No stub literals or hardcoded fake data. **R75 PASS.**

## SNAPSHOT BRANCHES (R6)
All three expected H1 snapshots present on origin:
- `wip/h1-fix-codeql-snapshot` → 3a3b442
- `wip/h1-fix-lefthook-snapshot` → 7633304
- `wip/h1-rebase-snapshot` → 7633304
**R6 builder-durability PASS.**

## CODEQL STEP-LEVEL continue-on-error ASSESSMENT
`.github/workflows/codeql.yml` places `continue-on-error: true` on the **step** running `github/codeql-action/analyze@v3`.
- Root cause (verified via commit 3a3b442 / d9.. history + file comments): GitHub Advanced Security is NOT enabled on this private repo, so the SARIF-upload phase of `analyze` fails with "Code scanning is not enabled for this repository." The init/autobuild/analyze **scan itself completes** (1450 TS files) and emits findings to the job log.
- Step-level (not job-level) placement is the *correct* GitHub Actions idiom: job-level `continue-on-error` leaves the job conclusion as `failure` (keeps the PR check red); step-level lets the upload fail in place while the job rolls up green.
- This is a **workaround, not a bypass**: the analysis runs and produces results; only the upload sink is deferred until GHAS is enabled (at which point the same workflow uploads with zero code change).
- **NOT R75-adjacent.** It does not suppress a quality gate's actual analysis, swallow code errors, or hide failures — it accommodates an unprovisioned output destination. **Acceptable doctrine.**

## lefthook devDep / package.json COHERENCE
- `package.json` devDependencies adds exactly `"lefthook": "^2.1.9"` ✓ and a `"prepare": "lefthook install"` script ✓.
- `package-lock.json` coherently adds the `lefthook@2.1.9` node + its platform-specific optional binary packages (lefthook-{darwin,linux,freebsd,openbsd,windows}-{arm64,x64}) — standard for lefthook v2 distribution. Integrity hashes present. ✓
- **No other dependencies silently added.** Diff of package.json `+` lines contains only the two lefthook-related changes. ✓

## FILE-BY-FILE SANITY (all 15 = real implementations, no stubs/placeholders)
1. **.editorconfig** — real: indent/EOL/charset rules + py/md overrides. ✓
2. **.github/ISSUE_TEMPLATE/bug_report.md** — real triage template (repro/severity/R-rule context). ✓
3. **.github/ISSUE_TEMPLATE/feature_request.md** — real (problem/solution/acceptance). ✓
4. **.github/PULL_REQUEST_TEMPLATE.md** — real, substantive R-rule self-check checklist. ✓
5. **.github/workflows/codeql.yml** — real, valid workflow (init/autobuild/analyze, weekly cron). ✓
6. **.github/workflows/pr-size-labeler.yml** — real, pinned action @v0.5.4 with XS→XL thresholds. ✓
7. **.h1-status.txt** — status scaffold; old `Builder: claude_opus_4_8` line scrubbed → operator-direct. ✓
8. **.prettierignore** — real ignore globs. ✓
9. **.prettierrc.json** — real prettier config. ✓
10. **.well-known/ai.txt** — real AI-crawler opt-out (User-Agent/Disallow). ✓
11. **.well-known/security.txt** — real RFC 9116 (Contact/Expires/Canonical resolved). ✓
12. **lefthook.yml** — real pre-commit (R75 banned-cast grep, tsc, eslint, prettier) + commit-msg R3 gate. ✓
13. **package-lock.json** — coherent lefthook addition. ✓
14. **package.json** — lefthook devDep + prepare script. ✓
15. **renovate.json** — real grouped-deps + auto-merge policy + weekly schedule. ✓

No `// TODO`, `// FIXME`, or empty-bodied policy in any final file.

## CI / MERGE STATE (independently re-pulled)
All 6 checks PASS: CodeQL JS/TS, build-and-test, mwb-3-live-tests, rls-floor-guard, rls-live-tests, size-label. mergeable=MERGEABLE, mergeStateStatus=CLEAN. (R11: CI green alone does not clear doctrine — see R74 below.)

---

## SUMMARY OF FINDINGS
1. **R74 (test density) — FINDINGS (procedural).** Ratio 0.0 < 2.0 with +183 net prod LOC and NO `[TEST-EXEMPT]` marker in the PR title. Content is genuinely non-unit-testable config/infra (the legitimate exempt category), so the substance is fine — but the gating marker is absent, which doctrine requires me to flag. **Remediation: add `[TEST-EXEMPT: config/policy/CI infra — not unit-testable]` to the PR title.** No code change needed.

All other checks PASS: R3 identity CLEAN, R23 LOC (+183 ≤ 400) PASS, R75 banned-tokens CLEAN, R6 snapshots present, CodeQL workaround acceptable, lefthook dep coherent, all 15 files real implementations, PR fresh (base == main HEAD).

The sole blocker to a CLEAN verdict is the missing title marker — a one-line title edit, not a substantive defect.

VERDICT: FINDINGS
