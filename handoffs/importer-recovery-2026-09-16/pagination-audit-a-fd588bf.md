# Pagination audit A — importer PR21

## BUILD MATRIX
- backend HEAD: N/A — importer-extension-only audit; no backend checkout inspected
- ctxrepo HEAD: `36d0eb6e2e037ad227c724200a9a7dd5eb5198a5`
- PR #21 head: `fd588bf1db0781b8a8aaa1c241e30f20c96eb79d`
- PR #21 base (origin/main): `0111be661922234d670bbf23e23d270eec1b4a4e`
- timestamp (ISO 8601 UTC): `2026-09-16T03:56:00Z`

The local checkout and live PR agreed on these product SHAs; the PR remained OPEN at the final live check. [PR21](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/pull/21)

## Scope, independence, and disposition

**Four findings: one P1 governance finding and three P2 product findings; zero P0/P3 findings. No merge authorization.** The three product defects were independently reproduced on BOTH the pinned base and head: they are residual boundary/consumer defects, **not newly introduced regressions**. They remain relevant to this brief's exhaustive pagination-contract, malformed-input, and truthful-completion requirements. The runnable evidence below distinguishes each mechanism and its actual reachability.

I reviewed the entire two-file cumulative diff, the intermediate production changes, both complete changed files, production callers, consumer behavior, and relevant tests. I did not read sibling audit reports or accept author/PR-body conclusions. The only PR-body inspection was the presence/content of the required R138 decision record, not reliance on its claimed correctness. All commands operated in `/home/user/workspace/tgp/extension-pagination-audit-a`; canonical instructions were read by absolute path. No product files were edited, no checkout was changed, no source service was contacted by the replay probes, and nothing was pushed or merged.

Canonical inputs read in full: [AGENT_RULES.md](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/32445a75c7ee6a0018c1f3979519b3e62ed67fc8/AGENT_RULES.md), its referenced [50-failure checklist](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/32445a75c7ee6a0018c1f3979519b3e62ed67fc8/quality-references/50_FAILURES_OF_AI_GENERATED_CODE.md), and [REAL_GOAL_EXECUTION_PLAN.md](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/docs/REAL_GOAL_EXECUTION_PLAN.md). The explicit auditor-only/read-only brief governs over generic push/checkpoint instructions.

## Findings

### A-01 — P2: sparse cursor paths survive the new malformed-input guard

**Locations:** `shared/replay/blueprint.js:245–255`; consumer `shared/replay/engine.js:342–345`; missing case in `test/replay-blueprint.spec.js:1337–1352`. [Normalizer](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/shared/replay/blueprint.js) · [Consumer](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/shared/replay/engine.js) · [Tests](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/test/replay-blueprint.spec.js)

`{style:"cursor", nextPath:Array(1)}` passes: the length is positive, but `Array.prototype.every` skips the hole. The subsequent spread produces `[undefined]`, which does not satisfy the promised non-empty string-array contract. Normalizing that already-normalized blueprint again rejects it. This is a concrete validation/copy mismatch, not merely a stylistic preference. [Normalizer, lines 245–255](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/shared/replay/blueprint.js)

**Observed:** the reproduction below makes one request to `https://api.test/t`, receives `{items:[{id:"1"}],next:"second"}`, and returns `complete`, one entity, `degraded:false`, `truncated:false`. Thus a malformed descriptor causes a request despite the explicit fail-before-network guarantee. The `[null]` shown by JSON serialization of the reproduction's normalized path is actually an `undefined` array element, which is separately asserted.

**Expected:** refuse this malformed path before any fetch. Validate the same dense snapshot that is returned, including every segment; add an engine-level zero-request case, preferably with a valid earlier step, plus a normalization-idempotence assertion.

**Reachability and classification:** this requires a programmatically constructed sparse array; ordinary JSON serialization turns holes into `null`, which this guard does reject. The public normalizer accepts JavaScript descriptors, including inherited and null-prototype records, and the PR specifically tests those forms. There is no evidence that the current known-site factory emits sparse paths. Both base and head reproduce the defect; this is a residual hole in the exact guard being hardened, not a claimed new remote exploit. [Descriptor tests](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/test/replay-blueprint.spec.js)

### A-02 — P2: accepted `param:"__proto__"` disappears and prematurely completes traversal

**Locations:** `shared/replay/blueprint.js:226–239,254–255`; `shared/replay/engine.js:253–262,412`. [Normalizer](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/shared/replay/blueprint.js) · [Engine](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/shared/replay/engine.js)

The contract permits any non-empty string parameter name, including the JSON-representable string `"__proto__"`. The engine constructs `query = {}` and assigns `query[pag.param] = pageParam` or `cursor`. For this name the inherited legacy setter does not create an own query property; `Object.entries(query)` therefore omits the parameter. The next iteration builds the same URL, and the visited-URL early return does not mark degradation/truncation. [Normalizer and query construction](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/shared/replay/engine.js)

**Observed:** both page `{style:"page",param:"__proto__",start:1}` and cursor `{style:"cursor",param:"__proto__",nextPath:["next"]}` request only `/t` with no query and return `complete` after one entity. In the cursor case the response explicitly contains the next token `"second"`, yet it is never requested. In the page case even the first requested page differs from the descriptor.

**Expected:** preserve arbitrary contract-valid parameter names when constructing query data, and do not turn an unadvanced traversal into success. A null-prototype dictionary or direct `URLSearchParams` construction can avoid the lost-key mechanism; the fixer should choose the minimal compatible implementation. Add page and cursor integration tests that inspect actual URLs and terminal outcomes.

**Impact and classification:** incomplete imports can be labeled successful for this accepted descriptor. This is not demonstrated prototype pollution or code execution: the assigned scalar is ignored. The defect exists at base and head; the current known-site factory does not use this name. It is a consumer-compatibility defect exposed by reviewing the full accepted input domain, not a reason to redefine all non-empty strings as malformed. [Factory](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/extractors/truecoach/blueprint.js)

### A-03 — P2: integer starts can be unadvanceable, producing false completion

**Locations:** `shared/replay/blueprint.js:233–239`; `shared/replay/engine.js:261–262,334–339,404–412`. [Normalizer](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/shared/replay/blueprint.js) · [Engine](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/shared/replay/engine.js)

`Number.isInteger(2**53)` is true, but adding one does not advance that Number value. The normalizer accepts it; after a populated page, the engine increments to the same value, treats the identical URL as a cycle, and returns without marking the run incomplete. Starting at `Number.MAX_SAFE_INTEGER` also reaches this condition after two populated pages. [Validation and advancement](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/shared/replay/engine.js)

**Observed:** `start:9007199254740992` fetches one populated page; `start:9007199254740991` fetches two. Both return `complete`, `truncated:false`, and `degraded:false`, although no empty end-of-list page was reached. These exact outputs reproduce on both revisions.

**Expected:** reconcile numeric representability with the existing integer-start contract and detect failure to advance. Merely validating that the initial start is safe is insufficient because a safe initial value can cross the boundary. Preserve valid existing behavior or make a deliberate documented compatibility decision; in all cases, an unadvanceable nonempty walk must not become successful completion.

**Impact and classification:** adversarial/extreme numeric boundary, not a normal page count and not a new regression. Zero, negative integers, and ordinary positive starts are intentionally accepted by the existing contract and are not findings. This issue is the consumer's inability to execute/settle some accepted values truthfully. [Compatibility tests](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/test/replay-blueprint.spec.js)

### A-04 — P1: live main protection does not enforce canonical ownership/signature requirements

**Location:** repository `main` protection; canonical `AGENT_RULES.md` R102 and R122. This is a live governance finding, not a change introduced by either diff file. [Protection API](https://api.github.com/repos/BradleyGleavePortfolio/tgp-importer-extension/branches/main/protection) · [Canonical requirements](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/32445a75c7ee6a0018c1f3979519b3e62ed67fc8/AGENT_RULES.md)

The live response has `require_code_owner_reviews:false` and `required_signatures.enabled:false`; `git ls-files '*CODEOWNERS*'` returns no tracked ownership file, and the branch rules endpoint returns `[]`, so no applicable ruleset compensation was observed. R122 expressly requires CODEOWNERS enforcement, and R102 requires signed commits. R122's signature wording is conditional on R3+GPG landing; that qualification does not waive its unconditional ownership requirement, and the stronger R102 requirement was not accompanied by an exception in this brief. [Protection API](https://api.github.com/repos/BradleyGleavePortfolio/tgp-importer-extension/branches/main/protection) · [Applicable branch rules](https://api.github.com/repos/BradleyGleavePortfolio/tgp-importer-extension/rules/branches/main) · [R102/R122](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/32445a75c7ee6a0018c1f3979519b3e62ed67fc8/AGENT_RULES.md)

**Positive controls:** one approving review is required, stale reviews are dismissed, `test` and `codeql` checks are required with strict freshness, admins are enforced, linear history is required, and force-push/deletion are disabled. These do not substitute for the missing ownership/signature controls. [Protection API](https://api.github.com/repos/BradleyGleavePortfolio/tgp-importer-extension/branches/main/protection)

**Expected:** the repository owner should reconcile protection/ownership with the canonical rules or supply a properly authorized, documented applicability/exception decision before treating governance as clean. No settings were changed by this auditor. The unsigned HEAD verification is corroborating evidence only; all four commits pass the separate author/committer identity check. [HEAD verification](https://api.github.com/repos/BradleyGleavePortfolio/tgp-importer-extension/commits/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d)

## Reproducible independent defect evidence

Run the following command from the assigned worktree. It reads base modules through `git show` and imports them from data URLs, without checkout, file writes, or actual network requests. The imported `shared/net.js` dependency is unchanged between the two revisions.

```bash
cd /home/user/workspace/tgp/extension-pagination-audit-a
node --input-type=module <<'JS'
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { normalizeBlueprint } from './shared/replay/blueprint.js';
import { runReplay } from './shared/replay/engine.js';
const BASE='0111be661922234d670bbf23e23d270eec1b4a4e';
const data=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const oldBlueprint=data(execFileSync('git',
  ['show',`${BASE}:shared/replay/blueprint.js`],{encoding:'utf8'}));
const oldEngine=data(execFileSync('git',
  ['show',`${BASE}:shared/replay/engine.js`],{encoding:'utf8'})
  .replace('"./blueprint.js"',JSON.stringify(oldBlueprint))
  .replace('"../net.js"',JSON.stringify(
    pathToFileURL(process.cwd()+'/shared/net.js').href)));
const oldNormalize=(await import(oldBlueprint)).normalizeBlueprint;
const oldRun=(await import(oldEngine)).runReplay;
const allowedOrigins=['https://api.test'];
const bp=p=>({
  platform:'test',apiBase:allowedOrigins[0],rateLimitMs:0,
  budgets:{maxPages:4,maxPagesPerStep:4,maxEntities:100},
  steps:[{id:'s',entityType:'t',template:'/t',itemsPath:['items'],
    idField:'id',pagination:p}]
});
const cases=[
  ['sparse',{style:'cursor',nextPath:Array(1)},1],
  ['proto-page',{style:'page',param:'__proto__',start:1},1],
  ['proto-cursor',{style:'cursor',param:'__proto__',nextPath:['next']},1],
  ['unsafe-start',{style:'page',start:2**53},1],
  ['safe-edge',{style:'page',start:Number.MAX_SAFE_INTEGER},2]
];
for(const [revision,normalize,run] of [
  ['HEAD',normalizeBlueprint,runReplay],['BASE',oldNormalize,oldRun]
]) {
  for(const [name,p,requests] of cases) {
    const normalized=normalize(bp(p),{allowedOrigins});
    if(name==='sparse') {
      assert.equal(normalized.steps[0].pagination.nextPath[0],undefined);
      assert.throws(()=>normalize(normalized,{allowedOrigins}));
    }
    const urls=[];
    const result=await run({
      blueprint:bp(p),allowedOrigins,
      fetchJson:async url=>{
        urls.push(url);
        return {items:[{id:String(urls.length)}],next:'second'};
      },
      emit:async()=>{},now:()=>0,sleep:async()=>{}
    });
    assert.equal(urls.length,requests);
    assert.equal(result.status,'complete');
    assert.equal(result.truncated,false);
    assert.equal(result.degraded,false);
    console.log(JSON.stringify({revision,name,
      normalizedPagination:normalized.steps[0].pagination,urls,result}));
  }
}
JS
```

**Execution result:** all ten asserted reproductions completed; these assertions deliberately confirm defective behavior, not that the implementation is correct.

| Case | Requested URLs, same on BASE and HEAD | Actual terminal result |
|---|---|---|
| sparse | `https://api.test/t` | complete; pages 1; entities 1; no degradation/truncation |
| proto-page | `https://api.test/t` | complete; pages 1; entities 1; parameter absent |
| proto-cursor | `https://api.test/t` | complete; pages 1; entities 1; next token not followed |
| unsafe-start | `https://api.test/t?page=9007199254740992` | complete; pages 1; entities 1 |
| safe-edge | `https://api.test/t?page=9007199254740991`, then `.../t?page=9007199254740992` | complete; pages 2; entities 2 |

Governance reproduction, read-only:

```bash
gh api repos/BradleyGleavePortfolio/tgp-importer-extension/branches/main/protection
gh api repos/BradleyGleavePortfolio/tgp-importer-extension/rules/branches/main
gh api repos/BradleyGleavePortfolio/tgp-importer-extension/commits/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d
git ls-files '*CODEOWNERS*'
```

## Contract, callers, and adversarial coverage

- **Absent versus malformed:** omitted/null pagination remains no pagination; `{}` remains `{style:"page",param:"page",start:1}`. Null/undefined individual fields retain defaults. Explicit unknown styles, invalid parameters, noninteger page starts, and dense malformed cursor paths now reject rather than silently default. The style-specific irrelevant fields remain ignored for compatibility: a page descriptor's `nextPath`, or a cursor descriptor's `start`, is not independently treated as malformed. [Full normalizer](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/shared/replay/blueprint.js)
- **Independent compatibility matrix:** 17 asserted HEAD-versus-BASE normalized-output comparisons passed, including omitted/null/empty, null/undefined fields, negative/zero/positive starts, nested cursor paths, null-prototype and inherited records, frozen descriptors/paths, and the irrelevant style-specific fields above. The earlier exploratory 12-case parity probe also passed; these overlapping matrices are not counted as extra Vitest tests.
- **Independent malformed matrix:** 62 asserted cases passed with a valid first step and malformed second step: six invalid descriptor shapes, 11 styles, 16 parameter cases across both styles, 13 starts, 14 cursor paths, and two inherited-invalid cases. Every case rejected and made **zero** fetch calls; examples included Symbol/BigInt primitives, NaN/infinities, false/zero, arrays/objects, empty strings, explicit null/undefined path segments, and wrong path types. This extends, rather than assumes, the PR's single engine-level invalid-style zero-request test. A-01 is the additional malformed case that does not reject.
- **Legal adversarial query names:** six independent cases (`constructor`, `toString`, `a&b`, `page#fragment`, a space, and a CR/LF-containing name) were correctly URL-encoded as exactly one key, with no path/origin/fragment change. These are not findings under the non-empty-string grammar; `"__proto__"` is distinct because the key disappears before encoding. [URL construction](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/shared/replay/engine.js)
- **Caller order:** `runReplay` is the production caller of `normalizeBlueprint` and normalizes the entire blueprint at line 127 before scheduling requests. The live background importer calls replay at line 624, uses trusted origin/auth capabilities, and settles thrown errors as failed. The complete/partial outcome distinction matters because replay success is propagated by this caller. [Engine](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/shared/replay/engine.js) · [Background caller](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/background.js)
- **Current reachability:** resolution still goes through the existing known factory; this patch neither introduces an inferred-descriptor runtime ingress nor adds another site-specific implementation. No new feature activation, endpoint, flag, permission, dependency, or source write method is added. The current `PAIRING_ENABLED` value is pre-existing and is not a newly enabled generic inference rollout. [Resolver](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/shared/replay/resolve.js) · [Factory](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/extractors/truecoach/blueprint.js) · [Execution plan](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/docs/REAL_GOAL_EXECUTION_PLAN.md)
- **Other reviewed invariants:** required HTTPS/safe-host/exact-origin capability, root-relative templates, GET/HEAD-only source requests, trusted auth override, bounded retries/timeouts/page/entity budgets, abort/auth-loss behavior, awaited emit/backpressure, per-context duplicate handling, fan-out, entity counts, empty/partial/failed outcomes, and absence of source-service mutations were checked through code and the targeted suites below. This does not claim DNS-resolution confinement beyond the trusted allowlist, real-service migration completeness, or safety for arbitrary executable getters/Proxies. [Normalizer](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/shared/replay/blueprint.js) · [Replay engine](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/shared/replay/engine.js) · [Background integration](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/background.js)

## Command record and results

### Targeted tests — independently executed, not parent-reported

```bash
npm exec vitest -- run test/replay-blueprint.spec.js test/replay-engine.spec.js test/replay-engine-edge.spec.js test/replay-truecoach-blueprint.spec.js test/conformance-alpha.spec.js test/replay-resolve.spec.js test/replay-lastskip.spec.js --maxWorkers=1

npm exec vitest -- run test/replay-backoff.spec.js test/replay-truecoach-e2e.spec.js test/replay-state.spec.js test/replay-empty-outcome.spec.js test/replay-entity-counts.spec.js --maxWorkers=1
```

| File | Passed |
|---|---:|
| replay-blueprint | 159 |
| replay-engine | 38 |
| replay-engine-edge | 16 |
| replay-truecoach-blueprint | 11 |
| conformance-alpha | 14 |
| replay-resolve | 8 |
| replay-lastskip | 4 |
| **First invocation** | **250 / 7 files** |
| replay-backoff | 20 |
| replay-truecoach-e2e | 4 |
| replay-state | 42 |
| replay-empty-outcome | 10 |
| replay-entity-counts | 6 |
| **Second invocation** | **82 / 5 files** |
| **Independent total** | **332 / 12 files; zero failed or skipped** |

### Gates and environment

Diff-scoped checks used the exact base with `RATIO_BASE=0111be661922234d670bbf23e23d270eec1b4a4e`, `GITHUB_EVENT_NAME=pull_request`, `GITHUB_BASE_REF=main`, and `PROD_LOC_CAP=400`.

| Command / measurement | Observed result |
|---|---|
| `git diff --check BASE..HEAD` | PASS; no whitespace errors |
| `git diff --numstat BASE..HEAD` | Production +35/−7; tests +173/−1; only two files |
| Inline `prettier.format` comparison on both changed files at both SHAs | All four blobs already canonically formatted |
| Independently computed LOC/ratio | 35 added production LOC ≤400; 173/35 = **4.943**, ≥2 |
| `npm run check:banned` | PASS, including four-commit identity scan |
| `npm run check:flags` | PASS |
| `npm run check:fixtures` | PASS; 41 scanned, zero violations |
| `npm run check:production-preflight` | PASS; five static checks, not deployment certification |
| `npm run check:hooks` | FAIL on local semantic type-check execution |
| `npm run lint` | PASS |
| `npm run type-check` | FAIL: 13 diagnostics in external `string_decoder` dependency |
| `npm run format:check` | PASS; two tracked diff files |
| `npm audit --audit-level=high` | PASS; zero vulnerabilities reported |
| Inline TypeScript compiler-host comparison of BASE and HEAD | Same 13 external diagnostics for `jsconfig.json`; zero for `jsconfig.scripts.json` on both |
| Inline positive/adversarial probes | 17 compatibility, 62 zero-request rejection, 6 safe encoding cases passed; 10 BASE/HEAD defect reproductions asserted |

**Local type-check limitation, not an attributed PR regression:** Node was `v20.20.1`, npm `10.8.2`, with the supplied node_modules symlink. The 13 errors are TS2300 duplicate `fillLast`/`write` and TS2339 `lastNeed`/`lastChar` diagnostics in `/home/user/workspace/node_modules/string_decoder/lib/string_decoder.js`. A CLI-equivalent read-only compiler-host probe using `ts.getParsedCommandLineOfConfigFile`, and an in-memory override of the two changed files with `git show BASE:<file>`, reproduced the same diagnostics at base and head. An initial simpler API parse using an absolute base directory returned zero diagnostics on both; that was not treated as proof of CLI success. The subsequent CLI-equivalent probe resolved the configuration-path discrepancy. No dependency/config/source edits were used to suppress the errors.

The raw `check:loc`/`check:ratio` helpers were not executed locally because their helper creates temporary normalized files; instead, their calculations were independently checked after proving both revisions already match canonical formatting. Their CI executions are covered by the required green `test` job. This distinction avoids falsely reporting commands as run. [Gate helpers](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/scripts/lib/git-diff.mjs) · [CI workflow](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/.github/workflows/ci.yml)

Read-only inspection commands included `git status --short`, `git rev-parse`, complete `git diff BASE..HEAD`, per-commit `git show`/`git log`, `rg` caller/pagination/banned-token searches, and `sed`/`nl`/`cat` on the canonical documents, changed files, replay modules, runtime caller, workflows and gate scripts. A few attempted path reads returned “not found” (`shared/flags.js`, a Vitest config glob, and `.github/CODEOWNERS`); these were inspection misses, not failed test cases. Subsequent reads completed the intended inspections, and tracked-file enumeration confirmed no CODEOWNERS file.

### Identity and actual CI state

All four commits have both author and committer `Bradley Gleave <bradley@bradleytgpcoaching.com>` and passed the banned-token identity scan:

```text
a4d6dcee6e9c54dbf734746c4832c9283da37de2
c9c11e14ca6d71dd24a2224e872257fe4ff1abdf
a53af707559f3ffd4ab0a09afb99e9c1b4c6443b
fd588bf1db0781b8a8aaa1c241e30f20c96eb79d
```

Exact-head PR CI, push CI, and CodeQL were successful; the workflow checks out the actual PR head, installs with `npm ci`, uses Node 22, runs tests and the quality gates, and enforces the PR production cap at 400 rather than the push-only 600 allowance. [PR CI](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/actions/runs/34503519985) · [Push CI](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/actions/runs/34503513515) · [CodeQL](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/actions/runs/34503519995) · [Workflow](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/.github/workflows/ci.yml)

The R100.A4 check used:

```bash
gh run list --repo BradleyGleavePortfolio/tgp-importer-extension \
  --event pull_request --created '>=2026-09-02T03:53:21Z' --limit 200 \
  --json conclusion \
  --jq '{completed:([.[]|select(.conclusion!="")]|length),
         success:([.[]|select(.conclusion=="success")]|length),
         failures:([.[]|select(.conclusion=="failure")]|length)}'
```

It returned 75 completed pull-request-event workflow runs: 61 successes and 14 failures, **81.33%**, above 75%. This is the workflow-run denominator across CI and CodeQL, not a deduplicated count of PRs; 75 is below the 200 result limit.

## R100 checklist — all 50 rules plus A1–A5

Statuses below apply to the audited change and traced replay path, not blanket certification of an unrelated backend or the entire organization. Evidence abbreviations: **N** = [normalizer](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/shared/replay/blueprint.js); **E** = [engine](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/shared/replay/engine.js); **B** = [background caller](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/background.js); **T** = [changed tests](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/test/replay-blueprint.spec.js); **G** = command record above.

| Rule | Status | Evidence / applicability |
|---|---|---|
| R100.1 Zero secrets | PASS | Full diff and banned scan; no credential/config additions |
| R100.2 RLS on every table | N/A | No database tables or migrations |
| R100.3 No raw-SQL concat | N/A | No SQL |
| R100.4 No unsanitized output | N/A | No DOM/display-output change; query encoding independently probed |
| R100.5 IDOR-proof endpoints | N/A | No server endpoint introduced; source capability/auth path unchanged |
| R100.6 Rate limiting auth/paid | PASS | E pacing and bounded retries unchanged; no new auth/paid endpoint |
| R100.7 JWT hygiene | N/A | No JWT issuance/verification change |
| R100.8 Runtime input validation | FAIL | A-01, N:245–255; sparse path bypasses validation before fetch |
| R100.9 Role check at data layer | N/A | No application role/data-layer mutation |
| R100.10 npm audit clean | PASS | G: zero vulnerabilities |
| R100.11 CORS allowlist | N/A | No server CORS configuration; N exact-origin capability reviewed separately |
| R100.12 No internal info in errors | PASS | New errors identify step/field, not response bodies or auth secrets |
| R100.13 HTTPS + HSTS | PASS | N HTTPS enforced for source requests; HSTS hosting configuration not changed |
| R100.14 Layer discipline | PASS | Normalization remains pure; E injects IO; B owns runtime integration |
| R100.15 Reusable over specific | PASS | Generic guard; no new competitor-specific branch |
| R100.16 No new TODO/FIXME | PASS | Complete two-file diff and banned scan |
| R100.17 Real test assertions | PASS | T asserts errors, exact outputs, copy semantics and zero fetches; G:332 tests |
| R100.18 Env parity | N/A | No environment configuration changed; local/CI runtime discrepancy disclosed |
| R100.19 API versioning | PASS | Valid tested descriptors retain outputs; intended malformed rejection is boundary tightening |
| R100.20 No circular imports | PASS | No new production import; added test imports do not create production cycle |
| R100.21 No N+1 | PASS | No new request loop/query; existing bounded pagination/fan-out unchanged |
| R100.22 Indexes on FK/hot WHERE | N/A | No database |
| R100.23 Pagination on lists | FAIL | A-02/A-03: accepted descriptors can fail to advance and falsely complete |
| R100.24 No event-loop blocking | PASS | No synchronous IO introduced in production; finite data validation |
| R100.25 Caching stable data | N/A | Mutable source-page traversal, no new stable-data lookup |
| R100.26 Media compress + CDN | N/A | No media handling change |
| R100.27 No polling for real-time | PASS | No new polling or timer; bounded replay is not real-time polling |
| R100.28 RMW under lock/transaction | N/A | No shared database mutation; normalized copies are run-local |
| R100.29 Idempotency on payments | N/A | No payments |
| R100.30 Optimistic rollback | N/A | No optimistic UI |
| R100.31 Hook deps correct | N/A | No React hooks |
| R100.32 Cleanup on unmount | N/A | No component lifecycle change; replay abort suite passed |
| R100.33 Error boundaries/filter | PASS | B catches replay rejection and settles failure; E separates abort/auth errors |
| R100.34 Structured logging | N/A | No new logging; no capture/response/credential output introduced |
| R100.35 Timeouts on external calls | PASS | E bounded request timeout passed to injected fetch; backoff/abort tests passed |
| R100.36 No swallowed errors | FAIL | A-02/A-03: nonadvance exits without incomplete outcome, E:261–262/412 |
| R100.37 /health endpoint | N/A | Browser-extension library change, no hosted health endpoint |
| R100.38 Comments explain WHY | PASS | N:203–208 explains absent versus malformed and fail-before-network |
| R100.39 YAGNI patterns | PASS | One small helper plus direct guards, no framework added |
| R100.40 Same-bug-everywhere | FAIL | A-02 occurs in both page and cursor assignments, E:255/258 |
| R100.41 No reimplementing libs | PASS | Standard Number/Array predicates, URLSearchParams consumer |
| R100.42 No phantom-bug defenses | PASS | Added rejection cases are real malformed data shapes |
| R100.43 Zero dead code | PASS | New helper/guards are invoked; lint passed |
| R100.44 Multi-table writes in txn | N/A | No database/source writes |
| R100.45 Soft deletes | N/A | No deletes or persistence model |
| R100.46 DB-layer constraints | N/A | No database |
| R100.47 PITR + recovery runbook | N/A | No database/storage infrastructure change |
| R100.48 CI/CD enforced | FAIL | A-04 live ownership/signature controls absent despite required green jobs |
| R100.49 Dev-only excluded prod | PASS | New fixtures remain in test file; fixture gate scanned41/zero violations |
| R100.50 Graceful degradation | FAIL | A-01/A-02/A-03 return complete for invalid/unadvanced walks |
| R100.A1 Test:src ≥2.0 | PASS | 173/35 = 4.943 added LOC, canonical-format parity checked |
| R100.A2 Banned-cast net =0 | PASS | check:banned passed, no added banned casts/silent catches/stub tokens |
| R100.A3 ≤400 production LOC | PASS | 35 added production LOC |
| R100.A4 CI pass rate ≥75% | PASS | 61/75 completed PR-event workflow runs =81.33%, defined window above |
| R100.A5 Verdict line present | PASS | Exact required line at end |

### Supplemental canonical/mission checks

- R3 identity, R23/R76 scope, R74 ratio, R75 banned tokens, R124 pinned SHA, and the R138 decision-record presence checks passed as specifically recorded above; R102/R122 protection did not. The R14 clean-audit merge condition is not satisfied by this report. [Canonical rules](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/32445a75c7ee6a0018c1f3979519b3e62ed67fc8/AGENT_RULES.md)
- R80–R89 applicability: no new feature activation, UI/accessibility/i18n surface, deploy path, or user-facing route/SLO is introduced by these two files; validation remains in the generic shared core. R93 compatibility was tested against base, while A-02/A-03 identify execution gaps without proposing a silent contract break. No claim is made that this narrow review certifies repository-wide telemetry or frontend performance policy. [Diff's production file](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/shared/replay/blueprint.js)
- R90–R99 applicability: no new mutation, database/tenant query, currency, timestamp storage, or PII store/logging path; no dependency change and npm audit is clean. Existing pacing, origin/auth confinement, and truthful-outcome requirements were traced; the latter have the explicit findings above. [Engine](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/shared/replay/engine.js) · [Background caller](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/background.js)
- The mission stays site-agnostic and source-read-only with no new rollout activation, but “no false completion” is not fully met across accepted/adversarial pagination descriptors. The report is an audit result, not a claim that the broader migration product is complete. [Execution plan](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/docs/REAL_GOAL_EXECUTION_PLAN.md)

## Limitations and handoff

The independently executed suite is the 332-test targeted set, not the full repository suite; the parent runs full-suite validation separately. I did not read the parent's or another auditor's reports/logs or use their conclusions for this verdict. All replay probes used injected deterministic data, with no live source-service account or destination-ingest writes. Sparse descriptors are a JavaScript-producer edge, and the extreme integer case is intentionally adversarial; neither is represented as an observed customer incident.

The local hook/type-check failure is disclosed and reproduced equally at base/head, while live exact-head CI is green. Repository-protection history and the existence of any separately authorized exception were not established; A-04 describes current verified configuration against the supplied canonical rules, not who changed it or when. No source-level regression introduced by PR21 was established, and none is implied by labeling the residual findings.

Final local HEAD remained `fd588bf1db0781b8a8aaa1c241e30f20c96eb79d`; the only worktree status entry was the pre-existing supplied `?? node_modules` symlink. This report is the sole intentional file deliverable. A fixer/owner must address or formally reconcile every finding and obtain a fresh audit on the resulting exact head; this auditor did not modify code, settings, or Git history.

VERDICT: FINDINGS
