# PR21 — Independent pagination audit, Lens B

## Scope and disposition

- **Repository:** [tgp-importer-extension](https://github.com/BradleyGleavePortfolio/tgp-importer-extension.git).
- **PR:** [21](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/pull/21).
- **Audited HEAD:** `fd588bf1db0781b8a8aaa1c241e30f20c96eb79d`.
- **Audited base/main:** `0111be661922234d670bbf23e23d270eec1b4a4e`.
- **Worktree:** `/home/user/workspace/tgp/extension-pagination-audit-b`.
- **Evidence date:** September 16, 2026 UTC.
- **Finding inventory:** P0: 0; P1: 0; P2: 4; P3: 0.

The new ordinary-value validation behaves as intended, but the exhaustive boundary review found three residual pagination correctness defects and one operational merge-control gap; **all three code defects were independently reproduced at BOTH the specified base and HEAD**, not attributed to this PR as newly introduced regressions. [Reproductions](#r1--finite-basehead-reproductions), [merge-control evidence](#b4--p2-operational-main-does-not-enforce-required-signature-and-code-owner-controls).

This is **not** a clean audit or authorization to merge; distinguishing pre-existing defects from new regressions does not erase the findings under the requested exhaustive P0–P3 review. [Canonical audit rules R10/R14/R19](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/32445a75c7ee6a0018c1f3979519b3e62ed67fc8/AGENT_RULES.md).

## Independence and coverage

I read the canonical [AGENT_RULES.md](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/32445a75c7ee6a0018c1f3979519b3e62ed67fc8/AGENT_RULES.md), its [50-failure reference](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/32445a75c7ee6a0018c1f3979519b3e62ed67fc8/quality-references/50_FAILURES_OF_AI_GENERATED_CODE.md), and the complete [REAL_GOAL_EXECUTION_PLAN.md](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/docs/REAL_GOAL_EXECUTION_PLAN.md).

I reviewed the entire two-file aggregate base-to-HEAD diff, the production changes across all four commits, the complete normalizer and engine, changed tests, and the caller chain: `background.js` → `resolveBlueprint` → the registered data-only TrueCoach blueprint → `runReplay` → `normalizeBlueprint`; I also examined the cursor conformance helper and relevant engine/integration tests. [Normalizer](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/shared/replay/blueprint.js), [engine](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/shared/replay/engine.js), [background](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/background.js), [resolver](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/shared/replay/resolve.js), [TrueCoach descriptor](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/extractors/truecoach/blueprint.js), [changed tests](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/test/replay-blueprint.spec.js).

I did not read sibling reports, use their conclusions, write product files, check out another revision, push, merge, or change repository settings. Baseline comparisons used `git show` and in-memory modules/compiler inputs, not a baseline checkout. The supplied untracked `node_modules` symlink remained the only worktree status entry; the HEAD stayed pinned. [Verification commands](#t1--identity-and-diff).

## Findings

### B1 — P2: Sparse cursor paths pass the strict gate, trigger a request, and produce false completion

**Location:** changed cursor-path predicate, `shared/replay/blueprint.js:245–255`; downstream `shared/replay/engine.js:342–345`. [Normalizer](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/shared/replay/blueprint.js), [engine](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/shared/replay/engine.js).

**Reproduction:** `{style: "cursor", nextPath: Array(1)}` is accepted because `Array.prototype.every` skips holes, while the length check sees one element; copying with spread produces an actual `undefined` element, so the returned normalized descriptor fails a second normalization. [Executable R1](#r1--finite-basehead-reproductions).

With a finite two-record source fixture, replay makes one request, emits only `first`, then returns `status: "complete", degraded: false, truncated: false` despite the malformed descriptor and available second page; the zero-request invariant is therefore not universal. [Executable R1, `sparse` row](#r1--finite-basehead-reproductions).

**Reachability and provenance:** this is a JavaScript-descriptor boundary, not a claim that a JSON parser directly produces sparse arrays; factories and the exported normalizer accept JavaScript objects, and the added tests explicitly exercise prototype-bearing/prototype-less descriptors. The defect exists at both base and HEAD and is not present in the currently registered literal TrueCoach descriptor. [Changed descriptor tests](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/test/replay-blueprint.spec.js), [TrueCoach descriptor](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/extractors/truecoach/blueprint.js), [base/HEAD probe](#r1--finite-basehead-reproductions).

**Required closure:** validate every effective path position, including holes, before network execution; preserve copying/non-mutation and add sparse-path rejection, zero-fetch, and normalization-idempotence regression tests. Do not impose unrelated string-key restrictions.

### B2 — P2: Valid `__proto__` pagination keys are silently dropped by the engine

**Location:** accepted parameter at `shared/replay/blueprint.js:226–239,254–255`; ordinary-object query construction at `shared/replay/engine.js:253–262` and `buildUrl` at `:102–110`. [Normalizer](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/shared/replay/blueprint.js), [engine](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/shared/replay/engine.js).

**Reproduction:** both `{style: "page", param: "__proto__"}` and `{style: "cursor", param: "__proto__", nextPath: ["next"]}` normalize successfully, but assigning their primitive page/cursor values to `query = {}` invokes the inherited prototype setter rather than creating an enumerable own query entry. The request URL consequently omits the key. [Executable R1, `proto-page` and `proto-cursor` rows](#r1--finite-basehead-reproductions).

On both finite fixtures, the next URL equals the already-visited first URL, replay stops before fetching the second record, and the result is nevertheless `complete` with neither degraded nor truncated set. [Executable R1](#r1--finite-basehead-reproductions).

**Reachability and provenance:** these descriptors are JSON-serializable, and `"__proto__"` is a valid non-empty string under the preserved parameter contract; both base and HEAD reproduce the failure. The current fixed TrueCoach descriptor uses `"page"` and is not affected by this input. This is query-key loss, **not** a demonstrated global prototype-pollution or cross-origin exploit. [Normalizer](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/shared/replay/blueprint.js), [TrueCoach descriptor](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/extractors/truecoach/blueprint.js), [probe](#r1--finite-basehead-reproductions).

**Required closure:** faithfully represent arbitrary accepted keys in query construction, for example with direct `URLSearchParams` operations or a prototype-free map; test both page and cursor traversal with this key through their real finite terminal condition. Rejecting all unusual but valid parameter strings would violate the requested compatibility objective.

### B3 — P2: Accepted large integer page starts cannot advance and are reported complete

**Location:** integer predicate at `shared/replay/blueprint.js:233–239`; page increment at `shared/replay/engine.js:334–339`; visited-URL early return at `:261–262`. [Normalizer](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/shared/replay/blueprint.js), [engine](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/shared/replay/engine.js).

**Reproduction:** `{style: "page", start: 2 ** 53}` is accepted by `Number.isInteger`; the first request is `?page=9007199254740992`, but adding one leaves the JavaScript number unchanged, so the visited guard suppresses the next request and reports `complete`. A second record available at the distinct decimal page `9007199254740993` is never fetched. [Executable R1, `unsafe-integer` row](#r1--finite-basehead-reproductions).

**Reachability and provenance:** this numeric input survives JSON serialization and reproduces at both base and HEAD; it is outside the current TrueCoach start value and is a latent generic-contract failure, not evidence of an ordinary live import currently reaching this page. An exploratory `Number.MAX_SAFE_INTEGER` start made two requests before the same loss of progress. [TrueCoach descriptor](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/extractors/truecoach/blueprint.js), [finite reproduction](#r1--finite-basehead-reproductions).

**Required closure:** reconcile the accepted integer contract with representable traversal and honest terminal status. At minimum, inability to advance must not be reported as complete; a bound/rejection policy requires an explicit compatibility decision, rather than silently changing valid negative/zero/integer descriptors to positive-only or silently defaulting to one.

### B4 — P2 operational: Main does not enforce required signature and code-owner controls

**Location:** GitHub main branch protection; this is an observed repository-control gap, not a modification introduced by the two-file product diff. [Main protection API](https://api.github.com/repos/BradleyGleavePortfolio/tgp-importer-extension/branches/main/protection).

At audit time, `required_signatures.enabled` was `false`, `require_code_owner_reviews` was `false`, and all four audited commits had Git signature status `N`; the author and committer identities themselves were correct. Canonical R102 requires signed commits, while R122 requires code-owner enforcement. [Protection API](https://api.github.com/repos/BradleyGleavePortfolio/tgp-importer-extension/branches/main/protection), [canonical R102/R122](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/32445a75c7ee6a0018c1f3979519b3e62ed67fc8/AGENT_RULES.md), [identity command](#t1--identity-and-diff).

The protection does require one approval, stale-review dismissal, strict `test` and `codeql` checks, administrator enforcement, and linear history, so this is **not** an allegation that main is entirely unprotected or that the current checks failed. [Protection API](https://api.github.com/repos/BradleyGleavePortfolio/tgp-importer-extension/branches/main/protection).

**Required closure:** the parent should resolve the protection/signing requirements or supply the applicable explicit governed exception/disposition; the auditor did not alter settings or assume that green CI waived canonical controls. No claim is made about when this configuration first arose.

## Contract, scope, and safety results

| Check | Result and evidence |
|---|---|
| Absent versus malformed | Undefined/null pagination remains `null`; empty descriptors and absent/null fields retain page defaults; explicit unknown style, empty/non-string parameter, non-integer start, and dense malformed/empty cursor paths reject. [Changed tests](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/test/replay-blueprint.spec.js), [independent probes](#t3--independent-inline-probes). |
| Compatibility | 4,851 ordinary combinations matched an independent predicate; all 1,330 accepted outputs were deeply equal to base outputs and stable under re-normalization. Valid zero, negative, custom-key, and null-default cases remain unchanged; B1 is the sparse-array exception outside that Cartesian matrix. [Probe accounting](#t3--independent-inline-probes). |
| Fail-before-request | 80 independent invalid-descriptor checks passed, including malformed second steps after an otherwise executable first step; B1 supplies a concrete remaining counterexample. [Probes](#t3--independent-inline-probes), [B1](#b1--p2-sparse-cursor-paths-pass-the-strict-gate-trigger-a-request-and-produce-false-completion). |
| Mutation | Normalization copies cursor paths, frozen positive controls succeed, and ordinary accepted descriptors remain stable; the PR adds no input writes. [Normalizer](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/shared/replay/blueprint.js), [probes](#t3--independent-inline-probes). |
| Attacker strings | Whitespace and query-reserved characters remain valid and are URL-encoded on the allowed origin; no reason was demonstrated to ban them. The special ordinary-object key is separately defective in B2. [Engine URL builder](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/shared/replay/engine.js), [probes](#t3--independent-inline-probes). |
| Source safety | No new source writes, new endpoint selection, credentials persistence, or handwritten site-specific extraction logic; mandatory allowed origins and GET/HEAD method normalization remain on the actual caller path. [Normalizer](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/shared/replay/blueprint.js), [background integration](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/background.js). |
| Activation/default-off | No new capability or flag is enabled by this diff; this is not a runtime auto-inference release. The existing pairing flag remains unchanged, and flag gate passes. [Execution plan](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/docs/REAL_GOAL_EXECUTION_PLAN.md), [gate commands](#t4--local-gates-and-environment-diagnosis). |
| Honest status | Existing budget/error status tests pass, but B1–B3 independently demonstrate premature `complete` at the descriptor/execution boundary. [Targeted tests](#t2--targeted-tests), [reproductions](#r1--finite-basehead-reproductions). |
| Production scope | Only `shared/replay/blueprint.js` changed in production: **35 added / 7 deleted LOC**, below 400. Tests: **173 added / 1 deleted LOC**; added-test:added-production ratio **173/35 = 4.943**, above 2.0. Aggregate +208/−8; canonical gates agree. [Diff and gate commands](#t1--identity-and-diff), [gates](#t4--local-gates-and-environment-diagnosis). |
| Identity | Every author and committer is `Bradley Gleave <bradley@bradleytgpcoaching.com>`; signature enforcement is separately B4. [Identity command](#t1--identity-and-diff). |
| Current-head CI | PR CI, push CI, and PR CodeQL succeeded at the audited head; the PR CI run API was checked for the actual head, not only a green badge. [PR CI](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/actions/runs/34503519985), [push CI](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/actions/runs/34503513515), [PR CodeQL](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/actions/runs/34503519995). |
| R138 | A mechanical PR-body query confirmed `R138 Decision Gate` and a rollback reference are present; the answers' substantive adequacy was not inferred from that boolean check, and no builder conclusion was adopted. [PR21](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/pull/21). |

## Commands and observed outcomes

### T1 — Identity and diff

All product commands ran in the assigned worktree. Inspection included:

```sh
cd /home/user/workspace/tgp/extension-pagination-audit-b
git rev-parse HEAD
git merge-base 0111be661922234d670bbf23e23d270eec1b4a4e HEAD
git status --short
git diff --stat 0111be661922234d670bbf23e23d270eec1b4a4e..HEAD
git diff --numstat 0111be661922234d670bbf23e23d270eec1b4a4e..HEAD
git diff 0111be661922234d670bbf23e23d270eec1b4a4e..HEAD
git log -p 0111be661922234d670bbf23e23d270eec1b4a4e..HEAD -- shared/replay/blueprint.js
git log --format='%H %an <%ae> | %cn <%ce> | signature=%G?' \
  0111be661922234d670bbf23e23d270eec1b4a4e..HEAD
```

Observed commit IDs were `a4d6dcee6e9c54dbf734746c4832c9283da37de2`, `c9c11e14ca6d71dd24a2224e872257fe4ff1abdf`, `a53af707559f3ffd4ab0a09afb99e9c1b4c6443b`, and `fd588bf1db0781b8a8aaa1c241e30f20c96eb79d`; merge-base equaled the specified base, and status was only `?? node_modules`. These are direct observations of the commands above.

### T2 — Targeted tests

```sh
npm exec vitest -- run \
  test/replay-blueprint.spec.js test/replay-engine.spec.js \
  test/replay-engine-edge.spec.js test/replay-backoff.spec.js \
  test/replay-lastskip.spec.js test/replay-empty-outcome.spec.js \
  test/replay-entity-counts.spec.js test/replay-truecoach-e2e.spec.js \
  test/replay-truecoach-blueprint.spec.js test/replay-resolve.spec.js \
  test/replay-state.spec.js test/conformance-alpha.spec.js --maxWorkers=1
```

**Observed: 12 files, 332 tests passed, zero failed/skipped**, including a final repeat at 03:58 UTC; these are unique tests in this command, not sums inflated by re-runs.

| File | Passed tests |
|---|---:|
| replay-blueprint | 159 |
| replay-engine | 38 |
| replay-engine-edge | 16 |
| replay-backoff | 20 |
| replay-lastskip | 4 |
| replay-empty-outcome | 10 |
| replay-entity-counts | 6 |
| replay-truecoach-e2e | 4 |
| replay-truecoach-blueprint | 11 |
| replay-resolve | 8 |
| replay-state | 42 |
| conformance-alpha | 14 |

An earlier command used `test/replay-blueprint.spec.js test/replay-engine.spec.js test/replay-conformance.spec.js --maxWorkers=1`: **2 files / 197 tests passed**, but the last filename was nonexistent and unmatched, so that invocation did not exercise conformance. The actual `test/conformance-alpha.spec.js` was subsequently included in the 332-test set above. The PR adds 13 tests to the blueprint file. [Changed tests](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/test/replay-blueprint.spec.js).

### T3 — Independent inline probes

All probes used `node --input-type=module` with injected fetch/emit/clock functions and no product edits.

1. **80/80 zero-fetch assertions:** 40 malformed descriptors tested as the first step and again as the second step after a valid first step; assertions required rejection and zero fetch calls. Categories covered pagination primitives/arrays, invalid style, invalid parameter in both unions, invalid page start, and missing/empty/dense malformed cursor paths.
2. **4,851/4,851 Cartesian checks:** 7 styles × 9 parameters × 11 starts × 7 paths; 1,330 accepted and 3,521 rejected. The independent predicate used explicit absence and style-dependent rules; accepted outputs were compared to the exact base module and re-normalized for idempotence.
3. **3/3 frozen positive controls:** no mutation required for absent/default, page, and cursor inputs.
4. **10 exploratory boundary rows:** sparse paths, prototype key in both unions, unsafe and maximal safe numeric starts, irrelevant union fields, whitespace key, reserved query characters, and lone-surrogate URL normalization. Findings are limited to demonstrated correctness failures, not all unusual inputs.
5. **8/8 finite base/HEAD defect reproductions:** four descriptors at each revision, reproduced again with the exact self-contained command below. Each confirms one-request, one-record false completion; sparse output also fails re-normalization.

The ordinary Cartesian inputs were:

```js
styles = [undefined, null, "page", "cursor", "offset", "", false];
params = [undefined, null, "page", "after", "", 0, " ", "__proto__", "p&x=#"];
starts = [undefined, null, -3, -0, 0, 1, 1.5, "1", false,
          Number.MAX_SAFE_INTEGER, 2 ** 53];
paths = [undefined, null, [], ["next"], ["meta", "0", "next"], [""], [null]];
```

The complete 40-case negative list used for the 80 checks consisted of: pagination `false,true,0,1,"","page",[],["page"]`; style `"","offset","Page",0,false,[],{}`; parameter `"",0,false,[],{}` in each style; page start `"1",1.5,false,NaN,Infinity,[],{}`; and cursor path `undefined,null,[],[""],[null],[0],"next",{}`.

### R1 — Finite base/HEAD reproductions

This command is read-only, uses no network, and prints eight result rows followed by the assertion count; the `net.js` import is unchanged between the revisions. [Engine](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/shared/replay/engine.js).

```sh
cd /home/user/workspace/tgp/extension-pagination-audit-b
node --input-type=module <<'JS'
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const base = '0111be661922234d670bbf23e23d270eec1b4a4e';
const head = 'fd588bf1db0781b8a8aaa1c241e30f20c96eb79d';
const data = s => 'data:text/javascript;base64,' +
  Buffer.from(s).toString('base64');
const api = 'https://api.test';
const bp = pagination => ({
  version: 1, platform: 'test', apiBase: api, rateLimitMs: 0,
  steps: [{id:'s', entityType:'t', template:'/t',
    itemsPath:['items'], idField:'id', pagination}]
});
for (const rev of [base, head]) {
  const text = f => execFileSync('git', ['show', `${rev}:${f}`],
    {encoding:'utf8'});
  const normURL = data(text('shared/replay/blueprint.js'));
  const { normalizeBlueprint } = await import(normURL);
  const engine = text('shared/replay/engine.js')
    .replace('"./blueprint.js"', JSON.stringify(normURL))
    .replace('"../net.js"', JSON.stringify(
      pathToFileURL(resolve('shared/net.js')).href));
  const { runReplay } = await import(data(engine));
  for (const [name, pagination, param, nextKey] of [
    ['sparse', {style:'cursor', nextPath:Array(1)}, 'cursor', 'C2'],
    ['proto-page', {style:'page', param:'__proto__'}, '__proto__', '2'],
    ['proto-cursor', {style:'cursor', param:'__proto__', nextPath:['next']},
      '__proto__', 'C2'],
    ['unsafe-integer', {style:'page', start:2**53},
      'page', '9007199254740993'],
  ]) {
    const urls = [], ids = [];
    const normalized = normalizeBlueprint(bp(pagination),
      {allowedOrigins:[api]});
    let renormalizes = true;
    try {
      normalizeBlueprint(normalized, {allowedOrigins:[api]});
    } catch { renormalizes = false; }
    const result = await runReplay({
      blueprint:bp(pagination), allowedOrigins:[api],
      now:()=>0, sleep:async()=>{},
      emit:async(_type,batch)=>ids.push(...batch.map(e=>e.sourceId)),
      fetchJson:async url=>{
        urls.push(url);
        const key = new URL(url).searchParams.get(param);
        if (key === nextKey)
          return {items:[{id:'second'}], next:null};
        if (key === null || key === '1' || key === '9007199254740992')
          return {items:[{id:'first'}], next:'C2'};
        return {items:[], next:null};
      }
    });
    assert.equal(urls.length, 1);
    assert.deepEqual(ids, ['first']);
    assert.equal(result.status, 'complete');
    assert.equal(result.degraded, false);
    assert.equal(result.truncated, false);
    console.log(JSON.stringify({
      revision:rev, name, normalized:normalized.steps[0].pagination,
      renormalizes, urls, ids, status:result.status,
      degraded:result.degraded, truncated:result.truncated
    }));
  }
}
console.log('8/8 base/head reproductions passed (each confirms a defect).');
JS
```

Observed rows at both revisions:

| Case | Requested URL | Emitted IDs | Re-normalizes | Terminal |
|---|---|---|---|---|
| sparse | `https://api.test/t` | `["first"]` | false | complete; degraded false; truncated false |
| proto-page | `https://api.test/t` | `["first"]` | true | complete; degraded false; truncated false |
| proto-cursor | `https://api.test/t` | `["first"]` | true | complete; degraded false; truncated false |
| unsafe-integer | `https://api.test/t?page=9007199254740992` | `["first"]` | true | complete; degraded false; truncated false |

The sparse normalized array contains `undefined`; `JSON.stringify` renders that array position as `null`, which is only an output-format artifact, not evidence that the normalizer returns a null element.

### T4 — Local gates and environment diagnosis

```sh
RATIO_BASE=0111be661922234d670bbf23e23d270eec1b4a4e \
GITHUB_BASE_REF=main GITHUB_EVENT_NAME=pull_request PROD_LOC_CAP=400 \
npm run gates

npm run lint
npm run type-check
npm run format:check
npm audit --audit-level=high
```

Observed local results:

| Command/gate | Outcome |
|---|---|
| check:banned | PASS, source and all PR commits |
| check:loc | PASS, +35/−7 production, cap 400 |
| check:flags | PASS |
| check:ratio | PASS, 173/35 |
| check:fixtures | PASS, 41 files scanned, 0 violations |
| check:production-preflight | PASS, 5 static checks |
| check:hooks | FAIL at its semantic TypeScript check |
| lint | PASS |
| type-check | FAIL, 13 diagnostics in external `/home/user/node_modules/string_decoder/lib/string_decoder.js` |
| format:check | PASS, 2 changed tracked files |
| npm audit --audit-level=high | PASS, 0 vulnerabilities |

The initial `npm run gates && npm audit ...` chain stopped at hooks, so audit was then run separately; this report does not mislabel the entire local gate chain as passing. [Gate scripts](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/package.json).

For empirical baseline verification without switching the worktree, I used the TypeScript compiler API with `getParsedCommandLineOfConfigFile(resolve("jsconfig.json"), {}, ts.sys)`, the actual compiler host, and an in-memory `readFile` override replacing the two changed files with `git show <base>:<path>` contents. HEAD and baseline-overlay each produced **13 identical diagnostics**, confined to the same external dependency file; the overlay did not fix or suppress checks. [Type-check configuration](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/jsconfig.json).

This makes the observed home-worktree failure an empirically pre-existing/environmental blocker to a local green type-check, not a new pagination regression or an assumed flake. Local Node was **20.20.1**, npm **10.8.2**, Vitest **4.1.11**, TypeScript **5.9.2**; repository CI uses Node 22 and the independently queried current-head checks succeeded. [CI workflow](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/.github/workflows/ci.yml), [PR CI run](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/actions/runs/34503519985).

### T5 — Read-only GitHub checks

```sh
gh pr view 21 --json number,url,baseRefOid,headRefOid,state,isDraft,statusCheckRollup,commits
gh api repos/BradleyGleavePortfolio/tgp-importer-extension/actions/runs/34503519985
gh api repos/BradleyGleavePortfolio/tgp-importer-extension/actions/runs/34503519995
gh api repos/BradleyGleavePortfolio/tgp-importer-extension/branches/main/protection
gh pr view 21 --json body --jq \
  '.body | {has_R138_Decision_Gate: contains("R138 Decision Gate"),
  has_rollback_word:(ascii_downcase|contains("rollback"))}'

SINCE=$(date -u -d '14 days ago' +%Y-%m-%dT%H:%M:%SZ)
gh api --method GET \
  repos/BradleyGleavePortfolio/tgp-importer-extension/actions/runs \
  -f created=">=$SINCE" -f per_page=100 --paginate \
  --jq '.workflow_runs[] | [.name,.status,.conclusion] | @tsv'
```

The final fully paginated 14-day query began at **2026-09-02T03:58:13Z** and returned **146 completed runs: 121 success, 25 failure = 82.88%**, above the 75% floor; CI alone was 87/103 = 84.47%, CodeQL 34/43 = 79.07%. An earlier narrower result set was superseded, not used for this calculation. [Repository Actions API](https://api.github.com/repos/BradleyGleavePortfolio/tgp-importer-extension/actions/runs).

## R100 checklist — all 50 failures plus A1–A5

PASS means no demonstrated defect for the reviewed diff and its relevant execution path, **not** certification of every unrelated subsystem; N/A identifies a subsystem not changed or exercised by this pagination-normalization slice. The governing categories are from the [canonical 50-failure checklist](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/32445a75c7ee6a0018c1f3979519b3e62ed67fc8/quality-references/50_FAILURES_OF_AI_GENERATED_CODE.md) and [R100 audit template](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/32445a75c7ee6a0018c1f3979519b3e62ed67fc8/AGENT_RULES.md).

| Rule | Status | Evidence / applicability |
|---|---|---|
| 1 Hardcoded secrets | PASS | Entire diff/history inspected; no secret additions; banned gate passes. |
| 2 Missing RLS | N/A | No database tables/policies changed. |
| 3 SQL injection | N/A | No SQL or database query construction. |
| 4 XSS | N/A | No rendering/DOM modification. |
| 5 IDOR | PASS | No new authorization endpoint/capability; allowed-origin gate preserved. |
| 6 Auth rate limiting | N/A | No auth endpoint changed; existing source pacing retained. |
| 7 JWT configuration | N/A | No JWT issuance/verification changes. |
| 8 Runtime input validation | **FAIL** | B1: sparse cursor path bypasses runtime validation; dense invalid cases reject. |
| 9 Privilege escalation | PASS | No new privileges; source method/origin constraints unchanged. |
| 10 Vulnerable dependencies | PASS | No dependency/lock changes; npm audit reports zero vulnerabilities. |
| 11 CORS | N/A | No server CORS policy change; source-origin capability separately checked. |
| 12 Secret-bearing errors | PASS | New validation messages describe fields and step ID, not rejected field values/tokens. |
| 13 HTTPS | PASS | Existing HTTPS/allowed-origin normalization unchanged. |
| 14 Monolithic architecture | PASS | Validation remains in shared normalizer; no new layering violation. |
| 15 Hyper-specific code | PASS | Generic union validation, no new source-specific extraction. |
| 16 Avoidance of refactors | PASS | Small focused shared-validator change; no abandoned implementation added. |
| 17 Fake tests | PASS | Actual value/error/zero-fetch assertions; 332 targeted tests pass; missing boundary cases explicitly reported. |
| 18 Environment parity | PASS with limitation | No new environment dependency; baseline-overlay proves identical external type-check failure; Node22 CI green. |
| 19 API versioning | PASS | No new endpoint/version; ordinary accepted descriptors retain exact normalized contract. |
| 20 Circular dependencies | PASS | No production imports added; normalizer/engine caller chain inspected. |
| 21 N+1 database queries | N/A | No database queries; bounded intentional source fan-out unchanged. |
| 22 Missing indexes | N/A | No database schema/query changes. |
| 23 Pagination | **FAIL** | B2/B3: accepted descriptors can stop before list exhaustion and report complete. |
| 24 Blocking operations | PASS | No new IO/await loops; synchronous validation remains bounded by descriptor input size. |
| 25 Caching | N/A | No cache or database read-path changes; session source data not newly persisted. |
| 26 Media optimization | N/A | No media processing. |
| 27 Polling | N/A | No new polling/realtime transport. |
| 28 Async races | PASS | Validation precedes IO and adds no async/shared mutable state. |
| 29 Payment idempotency | N/A | No payment flow. |
| 30 Optimistic rollback | N/A | No optimistic UI state changes. |
| 31 Stale closures | N/A | No React lifecycle or timer closure change. |
| 32 Unmount cleanup | N/A | No component lifecycle changes; engine abort tests retained. |
| 33 Error boundaries | N/A | No UI component changes. |
| 34 Observability | PASS | Existing replay progress/error integration preserved; no new raw payload logging. |
| 35 Timeouts | PASS | Actual background fetch path retains finite timeout; backoff/timeout targeted tests pass. |
| 36 Silent failure | **FAIL** | B1–B3 demonstrate false complete, even though new ordinary validation errors propagate. |
| 37 Health endpoints | N/A | Extension library slice, no server health endpoint change. |
| 38 Comment overload | PASS | New comments explain absent/malformed and untrusted-boundary rationale. |
| 39 Excess patterns | PASS | One small absence helper; no new framework or abstraction tower. |
| 40 Repeated bugs | PASS | Both pagination styles share parameter validation; all normalizer callers traced. |
| 41 Reimplementing libraries | PASS | Small language-level predicate change, no crypto/date/parser reinvention. |
| 42 Phantom edge cases | PASS | Findings use executable finite examples; current-oracle reachability limits explicitly stated. |
| 43 Dead code | PASS | New helper and engine test import used; lint passes. |
| 44 Transactions | N/A | No database writes. |
| 45 Soft deletes | N/A | No deletion path. |
| 46 Database validation | N/A | No database constraints/schema. |
| 47 Backups | N/A | No persistence/destructive migration changes. |
| 48 CI/CD | **FAIL (operational)** | Current-head CI/CodeQL pass, but B4 identifies canonical merge-control gaps. |
| 49 Development artifacts | PASS | No new production fixture/mock imports; fixture gate passes. |
| 50 Graceful degradation | PASS | Existing retry/skip/auth/abort behavior preserved and tested; false-complete issues separately B1–B3. |
| A1 Test:source ratio | PASS | 173/35 = 4.943 ≥ 2.0. |
| A2 Banned additions | PASS | Canonical banned source/history gate passes; zero violating additions. |
| A3 Production cap | PASS | 35 added production LOC ≤ 400. |
| A4 CI reliability | PASS | Final paginated 14-day sample 121/146 = 82.88%; CI alone 84.47%. |
| A5 Verdict | PASS | Exact verdict line ends this report. |

## Limitations and handoff

- The complete repository suite was left to the parent as requested; **this lens independently claims only the 332 targeted tests**, not the parent's full-suite or clean-environment counts.
- No authenticated live source, browser session, extension packaging/release, or production data collection was performed; generic descriptor probes are not claims of end-to-end product completion.
- The sparse-path finding concerns JavaScript objects; the two other descriptor defects also survive JSON input. Current fixed TrueCoach descriptor values do not exercise these three inputs. [TrueCoach descriptor](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/fd588bf1db0781b8a8aaa1c241e30f20c96eb79d/extractors/truecoach/blueprint.js).
- Home-worktree semantic type-check/hook gate is not independently green; the exact-baseline in-memory comparison and current-head CI separate that environment condition from new PR defects. No dependency repair or product configuration edit was performed. [Environment evidence](#t4--local-gates-and-environment-diagnosis).
- Diff line/branch coverage percentage was not measured; test-line ratio and passing tests are not asserted to prove R116's numerical coverage threshold. [Canonical R116](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/32445a75c7ee6a0018c1f3979519b3e62ed67fc8/AGENT_RULES.md).
- GitHub settings/runs are point-in-time observations. No merge-control exception was presumed, no tracking issue was created, and no remote operation changed state. Parent owns disposition and any follow-up audit cycle.
- During a final probe rewrite, an initial harness used a one-argument emitter instead of the actual `(entityType, batch)` callback and failed its own assertion; the corrected R1 above was then run successfully for all eight cases. One post-compaction inspection omitted the worktree prefix and failed its Git/relative-file reads; it was immediately repeated in the assigned directory. Neither attempt modified files or supplies finding evidence.

**Final disposition:** retain the distinction between an ordinary-input hardening change with no demonstrated new regression and the four independently evidenced residual/operational findings; this audit does not silently waive either class. [Findings and reproductions](#findings).

VERDICT: FINDINGS
