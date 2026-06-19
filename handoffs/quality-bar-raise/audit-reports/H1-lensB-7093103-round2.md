## BUILD MATRIX
- main HEAD: e207cc02c8d58348783a6e3a0794377cc16b8251
- PR: #455 "H1: quality-bar configs & policy files [TEST-EXEMPT: config/policy/CI infra — not unit-testable]"
- PR base.sha (in): e207cc02c8d58348783a6e3a0794377cc16b8251
- PR head.sha (out): 7093103203894ca02db152618797db42ef06477b
- Auditor lens: B=GPT-5.5
- Audit timestamp UTC: 2026-06-19T10:11:41Z
- Snapshot branches present: wip/h1-fix-audit-findings-snapshot @ 8d33b25fc2654ba856810b701bd00ccf08874417; wip/h1-fix-codeql-snapshot @ 3a3b4421020a1277191a3f1bc3e48b664dbbe5b2; wip/h1-fix-lefthook-snapshot @ 763330486cf1d53d9e397a550a47d0a3a07bf53b; wip/h1-rebase-snapshot @ 763330486cf1d53d9e397a550a47d0a3a07bf53b

# H1 Lens B Round 2 Audit — PR #455 @ 7093103

## CI / merge status
- Re-polled PR metadata independently: mergeable=MERGEABLE, mergeStateStatus=CLEAN.
- Status rollup returned 7 SUCCESS check runs: CI/build-and-test; codeql/CodeQL JS/TS (javascript-typescript); pr-size-labeler/size-label twice (duplicate run after edit); CI/rls-floor-guard; CI/rls-live-tests; CI/mwb-3-live-tests.
- Base/main ancestry: origin/main is exactly e207cc02c8d58348783a6e3a0794377cc16b8251 and is an ancestor of the PR head. Not stale.
- Branch protection API returned 403: "Upgrade to GitHub Pro or make this repository public to enable this feature." Per doctrine, H1 is not blocked on branch-protection enablement.

## Identity / R3 commit-log survey
Command run:

```bash
git log --pretty='%H | %an <%ae> | %s%n%b' e207cc02c8d58348783a6e3a0794377cc16b8251..7093103203894ca02db152618797db42ef06477b > /tmp/h1r2B_log.txt
```

Authorship: all 20 PR commits are authored by `Bradley Gleave <bradley@bradleytgpcoaching.com>`.

Exact token hits and taxonomy:

| Location | Text / token | Classification | Rationale |
|---|---|---|---|
| Commit 7093103 body line 5 | `ai.txt`, `.well-known/ai` | LEGITIMATE_FILENAME_REFERENCE | Web-standard policy filename/path reference; not LLM self-attribution. |
| Commit 7093103 body line 5 | `User-Agent` | LEGITIMATE_STANDARD | HTTP header / ai.txt syntax reference; not LLM self-attribution. |
| Commit 566f3a2 subject | `.well-known/ai.txt` | LEGITIMATE_FILENAME_REFERENCE | Web-standard policy filename/path reference. |
| Commit 566f3a2 subject | `AI training opt-out` | LEGITIMATE_STANDARD | Describes the ai.txt policy purpose; not authorship, vendor branding, or generated-content claim. |

Result: no ACTUAL_VIOLATION in the commit log.

## R3 added-line content survey
Exact added-line R3 hits outside docs/lockfiles:

| File:line | Text / token | Classification | Rationale |
|---|---|---|---|
| `.h1-status.txt`:9 | `.well-known/ai.txt` | LEGITIMATE_FILENAME_REFERENCE | Status list naming a policy file. |
| `.well-known/ai.txt`:1 | `User-Agent` | LEGITIMATE_STANDARD | Required header syntax for the policy file. |
| `.well-known/ai.txt`:3 | `AI training` / `ai.txt` | LEGITIMATE_STANDARD / LEGITIMATE_FILENAME_REFERENCE | Policy purpose and filename convention. |
| `lefthook.yml`:28 | `no-ai-tokens` | LEGITIMATE_ENFORCEMENT_DATA | Hook name for enforcement. |
| `lefthook.yml`:31 | `ai.txt`, `.well-known/ai*`, `User-Agent` | LEGITIMATE_ENFORCEMENT_DATA | Scrub allowlist literals used before grep. |
| `lefthook.yml`:32 | `ai`, `agent` | LEGITIMATE_ENFORCEMENT_DATA | Comment explains enforcement regex semantics. |
| `lefthook.yml`:35 | `ai.txt`, `.well-known/ai`, `User-Agent` | LEGITIMATE_ENFORCEMENT_DATA | Scrub-before-grep implementation data. |
| `lefthook.yml`:36 | `claude`, `anthropic`, `openai`, `gpt`, `computer-agent`, `perplexity`, `ai`, `agent` | LEGITIMATE_ENFORCEMENT_DATA | Banned-token regex literals. |
| `lefthook.yml`:37 | `Claude/Anthropic/OpenAI/GPT/Computer/Agent/Perplexity/Co-Authored/AI/etc` | LEGITIMATE_ENFORCEMENT_DATA | Error-message literals for enforcement. |

Result: no ACTUAL_VIOLATION in added content. The intentionally retained hits are filename/standard/enforcement-data references.

## Round 1 findings status
1. R3 violation from commit subject/content tokens: NOT REWRITTEN, but reclassified on re-audit as no ACTUAL_VIOLATION under the operator/parent taxonomy. All remaining hits are legitimate filename, standard, or enforcement-data references.
2. R74 missing `[TEST-EXEMPT]` marker: CLEARED. The PR title exactly contains `[TEST-EXEMPT: config/policy/CI infra — not unit-testable]`.
3. CodeQL continue-on-error masked all analyze failures: PARTIALLY CLEARED / NEW CONCERN. Step-level `continue-on-error: true` plus the validation step correctly fails when analyze fails and GHAS state is read as `enabled`; however, the `gh api ... 2>/dev/null || echo "disabled"` fallback silently treats API errors as GHAS disabled, which can still mask a real analyze failure if the API call fails or lacks permission.
4. lefthook R3 grep underinclusive: CLEARED for coverage of listed doctrine/vendor tokens and scrub-before-grep for known-good strings. NEW CONCERN: `\b(agent)\b` can block legitimate generic module/file references such as `agent.ts`.

## R74 title/test-exempt validation
Exact title marker verified: `[TEST-EXEMPT: config/policy/CI infra — not unit-testable]`.

Changed files and testability judgment:

| File | Change type | Meaningful unit-test host? | Judgment |
|---|---:|---|---|
| `.editorconfig` | A | No | Editor formatting config; no app logic. |
| `.github/ISSUE_TEMPLATE/bug_report.md` | A | No | GitHub issue template/documentation. |
| `.github/ISSUE_TEMPLATE/feature_request.md` | A | No | GitHub issue template/documentation. |
| `.github/PULL_REQUEST_TEMPLATE.md` | A | No | PR checklist template/documentation. |
| `.github/workflows/codeql.yml` | A | Not app-unit-testable | CI workflow; can be scenario-reviewed, but not meaningful app unit-test code. |
| `.github/workflows/pr-size-labeler.yml` | A | Not app-unit-testable | CI workflow config. |
| `.h1-status.txt` | M | No | Status/reporting text. |
| `.prettierignore` | A | No | Formatting config. |
| `.prettierrc.json` | A | No | Formatting config. |
| `.well-known/ai.txt` | A | No | Policy file. |
| `.well-known/security.txt` | A | No | Policy file. |
| `lefthook.yml` | A | Not app-unit-testable | Hook config with shell/grep logic; manual scenario trace performed below. Could benefit from future shell fixture tests, but this PR is still genuinely config/policy/CI infra. |
| `package-lock.json` | M | No | Lockfile; excluded from LOC. |
| `package.json` | M | No | Adds prepare hook script and lefthook devDependency entry; config/package metadata. |
| `renovate.json` | A | No | Dependency policy config. |

Conclusion: TEST-EXEMPT justification is genuine; no non-trivial pure app logic lacking tests.

## R23/R76 LOC tally
Doctrine exclusions applied: lockfiles and docs excluded; CI workflows counted as prod because no LOC-EXEMPT marker is present.

Net production LOC:
- Prod added: 241
- Prod deleted: 9
- Net prod LOC: 232

Result: 232 <= 400, within budget.

## R75 added-line scan
Scan scope: added lines from `git diff --unified=0 e207cc02..70931032`, excluding docs and lockfiles.

Hits found:
- `lefthook.yml`:7 contains enforcement-data comment literals `@ts-ignore`, `as any`, `as unknown as`, `as never`.
- `lefthook.yml`:8 contains enforcement-data comment literals `.catch(()=>undefined)`, `.catch(()=>null)`, `.catch(()=>{})`, `"Coming soon"`.
- `lefthook.yml`:9 contains enforcement-data grep literals for `@ts-ignore`, `as any`, `as unknown as`, `as never`, `.catch(...)`, and `Coming soon`.

These are self-matches in the hook that enforces R75, not real cast/placeholder usage in product code. No R75 violation in real code. H1 does not introduce H2's `r100-quality-gate.yml`; therefore there is no H1 workflow gate to check for `.github/**` self-exclusion. The H1 lefthook R75 command scans only staged `*.ts`, `*.tsx`, `*.js`, and `*.jsx`, so it will not self-match its own YAML.

## CodeQL Option A failure-mode trace
File reviewed: `.github/workflows/codeql.yml` in full.

Relevant implementation:
- Analyze step: `id: codeql_analyze`, `uses: github/codeql-action/analyze@v3`, `continue-on-error: true`.
- Validation step: `if: always()`, `ANALYZE_OUTCOME: ${{ steps.codeql_analyze.outcome }}`, `GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}` present.
- GHAS probe: `GHAS_STATE=$(gh api "repos/${GITHUB_REPOSITORY}" --jq '.security_and_analysis.advanced_security.status // "disabled"' 2>/dev/null || echo "disabled")`.

Mode trace:
1. Analyze succeeds: `ANALYZE_OUTCOME=success`; validation prints success and exits 0. OK.
2. Analyze fails and GHAS enabled: outcome is not success; `gh api` returns `enabled`; validation exits 1. OK.
3. Analyze fails and GHAS disabled/null: outcome is not success; `gh api` returns `disabled` or jq defaults null to disabled; validation warns and exits 0. OK by stated Option A behavior.
4. Analyze fails and `gh api` itself fails (rate-limit, token scope, permissions, transient API issue): stderr is discarded and `|| echo "disabled"` converts the API failure into disabled; validation exits 0. CONCERN: this is still a silent fallback that can mask a real analyze failure.
5. Analyze step cancelled: outcome is not success; validation enters GHAS check path. If GHAS enabled, it exits 1; if disabled/API fallback, it warns/exits 0. Acceptable for GHAS-disabled tolerance; same API-failure concern applies.

Additional permission concern: even with `GH_TOKEN` present, reading `security_and_analysis` can require permissions unavailable to the workflow token in some repositories. A 403 would be swallowed and treated as disabled, preserving the Mode 4 masking risk.

## lefthook R3 scenario trace
File reviewed: `lefthook.yml` commit-msg `no-ai-tokens` block in full.

Scrub step: `sed -E 's|ai\.txt||gI; s|\.well-known/ai[^ ]*||gI; s|User-Agent||gI'`.

Scenario results:

| Commit message | Scrubbed text | Result | Judgment |
|---|---|---:|---|
| `feat: add user login` | unchanged | PASS | Correct. |
| `wave-h1: .well-known/ai.txt (AI training opt-out)` | `wave-h1: .well-known/ (AI training opt-out)` | BLOCK (`AI`) | Correct per strict future R3 gate, though the existing historical commit remains. |
| `Co-authored-by: Claude <noreply@anthropic.com>` | unchanged | BLOCK (`Co-authored-by`) | Correct. |
| `fix User-Agent parsing` | `fix  parsing` | PASS | Correct standard-header scrub. |
| `improve agent.ts file` | unchanged | BLOCK (`agent`) | CONCERN: possible false positive; `agent` is a generic English/codebase term and `agent.ts` is not scrubbed. |
| `🤖 auto-update deps` | unchanged | BLOCK (`🤖`) | Correct. |

## R6 snapshot verification
`git ls-remote --heads origin 'wip/*'` confirms `refs/heads/wip/h1-fix-audit-findings-snapshot` exists at `8d33b25fc2654ba856810b701bd00ccf08874417` (pre-fix snapshot requested for this audit). Additional H1 snapshot branches are listed in the build matrix.

## Final verdict
No blocking R3/R23/R74/R75 doctrine violation found in this PR. Two non-blocking concerns are recorded for follow-up: CodeQL validation silently defaults to GHAS disabled on `gh api` failure, and lefthook's `\b(agent)\b` commit-message token may be overly aggressive for legitimate `agent.*` references.

VERDICT: CLEAN
