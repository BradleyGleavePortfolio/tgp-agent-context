# Audit Report — H4 #457 Lens A
**PR:** wave-h4: PROD_READINESS_BOARD — single test, whole-codebase truth (R100 R104 R108)  
**Head SHA (locked):** `0f3f1ffd4b8b97eafcbea3802138989f830c5395`  
**Branch:** `quality-bar-h4-prod-readiness` → `main`  
**Auditor lens:** Lens A (security R100.1–13, perf+concurrency R100.21–32, data+infra R100.44–50)  
**Audit date:** 2026-06-18  
**Auditor identity:** Adversarial auditor per AGENT_RULES R10 + R14  

---

## R3 Identity Check

All 6 commits on the branch verified:

| SHA | Author email | Committer email | AI/Agent tokens? |
|-----|-------------|-----------------|-----------------|
| `0f3f1ffd` | bradley@bradleytgpcoaching.com | bradley@bradleytgpcoaching.com | None |
| `22a32b06` | bradley@bradleytgpcoaching.com | bradley@bradleytgpcoaching.com | None |
| `c12de551` | bradley@bradleytgpcoaching.com | bradley@bradleytgpcoaching.com | None |
| `e309f7f5` | bradley@bradleytgpcoaching.com | bradley@bradleytgpcoaching.com | None |
| `6e12f720` | bradley@bradleytgpcoaching.com | bradley@bradleytgpcoaching.com | None |
| `cf440249` | bradley@bradleytgpcoaching.com | bradley@bradleytgpcoaching.com | None |

The word "Anthropic" in commit messages `c12de551` and `6e12f720` refers to the Anthropic API integration (a provider name), not an AI authorship token. **R3: PASS.**

---

## Test Run Observation

```
cd /tmp/backend && npx jest test/deploy-readiness.spec.ts --no-coverage
```

Result: **6/6 PASS in 8.8s**, verdict output `NEEDS_OPERATOR` (expected per brief).

```
R100 — Deploy readiness
  ✓ prod-switches.yml exists, parses, and has every entry valid
  ✓ R108 — every env var referenced in src/ is registered in prod-switches.yml
  ✓ no BLOCK_SHIP stub markers in src/ outside exempt zones
  ✓ learning ledger has no stale entries (fingerprints still match real lines)
  ✓ (prod-mode only) every MUST_SET switch has a non-placeholder value
  ✓ (prod-mode only) every imported provider has its required vars set with non-placeholder values
```

---

## Findings List

### F-01 — R100.A2 / R75 (BANNED CAST TOKEN): `Coming soon` NET +3 additions in PR diff — P0

**Severity:** P0  
**Files:**  
- `test/prod-readiness/__fixtures__/learning-ledger.json:40` — fingerprint string value `"src/public-pages/help-pages.html.ts:12:Coming soon"`  
- `test/prod-readiness/__fixtures__/learning-ledger.json:47` — fingerprint string value `"src/scheduling/scheduling.controller.ts:83:Coming soon"`  
- `test/prod-readiness/stub-scanner.ts:63` — pattern definition `{ token: 'Coming soon', ... }`  

**Evidence:**  
```bash
git diff origin/main..0f3f1ffd | grep "^+" | grep "Coming soon"
# +      "fingerprint": "src/public-pages/help-pages.html.ts:12:Coming soon",
# +      "fingerprint": "src/scheduling/scheduling.controller.ts:83:Coming soon",
# +  { token: 'Coming soon', defaultSeverity: 'BLOCK_SHIP', intent: 'User-facing placeholder string' },
```

**Why it's a problem:** AGENT_RULES R75 (= R100.A2) is syntactic: "banned in `src/`+`test/`" — "any positive net = P0." The rule does not carve out data/metadata uses. All three occurrences are in `test/` files. The rule text is unambiguous: NET count in diff, all files in scope. NET = +3.

**Auditor analysis of intent:** All three are arguably meta-uses (a JSON fingerprint string referencing a pre-existing src file, and a scanner pattern definition that auto-exempts itself from its own detection). None of the three instances creates an actual "Coming soon" user-facing string in production code. The pre-existing instances they reference (`src/public-pages/help-pages.html.ts:12` as a comment, `src/scheduling/scheduling.controller.ts:83` as a tracked-debt user-facing note) pre-date this PR. However, intent does not override the syntactic rule. The operator should either (a) add an R100 Exception Request block for these three meta-uses, or (b) encode the fingerprints without the literal token (e.g. `"help-pages.html.ts:12:BANNED_COPY_PATTERN"`).

**Recommended fix:** File an R100 Exception Request documenting these three meta-occurrences as data references (not shipped strings). Or rename the token in the ledger fingerprints and scanner pattern to avoid the literal string (e.g. split across concat: `'Coming' + ' soon'`). The fix in stub-scanner.ts must preserve the scanner's detection capability.

---

### F-02 — R108 FALSE-NEGATIVE GAP: env-discovery misses `process.env[CONSTANT]` access pattern — P1

**Severity:** P1  
**File:** `test/prod-readiness/env-discovery.ts:75`  
**Evidence:**  
```typescript
// env-discovery.ts:75 — only catches dot-notation
const re = /process\.env\.([A-Z][A-Z0-9_]*)/g;
```
This regex matches `process.env.FOO` but silently misses:
- `process.env[SOME_CONSTANT]` — constant-based computed access (29 instances in `src/`)
- `const { FOO } = process.env` — destructuring (0 instances found; no current risk, but unguarded)
- `process['env']['FOO']` — bracket notation (0 instances found; no current risk)

**Confirmed unregistered vars accessed via `process.env[CONST]` in `src/`:**

| Constant name | String value accessed | In registry? |
|---|---|---|
| `FEATURE_COMMUNITY_ACKS_ENV` | `FEATURE_COMMUNITY_ACKS` | **NO** |
| `FEATURE_COMMUNITY_AI_TRIAGE_ENV` | `FEATURE_COMMUNITY_AI_TRIAGE` | **NO** |
| `FEATURE_COMMUNITY_SCHEMA_ENV` | `FEATURE_COMMUNITY_SCHEMA` | **NO** |
| `FEATURE_COMMUNITY_CHALLENGES` | `FEATURE_COMMUNITY_CHALLENGES` | **NO** |
| `FEATURE_COMMUNITY_VOICE_NOTES` | `FEATURE_COMMUNITY_VOICE_NOTES` | **NO** |
| `FEATURE_WEARABLES_CLOUD_CONNECTORS_ENV` | `FEATURE_WEARABLES_CLOUD_CONNECTORS` | **NO** |

Sources: `src/community/ack/ack.feature.ts`, `src/community/ai-triage/ai-triage.feature.ts`, `src/community/community-schema.feature.ts`, `src/community/challenges/community-challenges-flag.guard.ts`, `src/community/voice/community-voice-flag.guard.ts`, `src/wearables/cloud-connectors.feature.ts`.

**Additional fully-dynamic case:**  
`src/community/community-write-flag.guard.ts:38` uses `process.env[envVar]` where `envVar` is a runtime parameter — impossible to resolve statically. This is a known limitation of static analysis that should be documented.

**Why it's a problem:** The R108 test reports "0 unregistered vars" — an incorrect clean bill when at least 6 feature-flag vars are not registered. If these vars change (rename, delete, new tier), R108 will not catch it. The PR claims R108 is enforced but the enforcement has a systematic false-negative class.

**Recommended fix:**  
1. In `env-discovery.ts`, add a second walk that resolves constant-to-string mappings: for each `const SOME_CONSTANT = 'SCREAMING_SNAKE_CASE_VALUE'` pattern in `src/`, extract the string value, then check for `process.env[SOME_CONSTANT]` usages, and add the resolved string value to the registry check.  
2. Register the 6 missing vars in `prod-switches.yml` immediately.  
3. Add a comment documenting the fully-dynamic `envVar` limitation at `community-write-flag.guard.ts:38`.

---

### F-03 — AUTO-FLIPPER AUDIT TRAIL: JSDoc claims flips are logged to OPERATOR_KEYS_NEEDED.md but code does NOT write there — P2

**Severity:** P2  
**File:** `test/prod-readiness/auto-flipper.ts:22`  
**Evidence:**  
```typescript
// auto-flipper.ts:22 (JSDoc claim):
// * - All flips are logged to `OPERATOR_KEYS_NEEDED.md` so the operator
// *   has a permanent record.
```
The `autoFlip()` function returns a `FlipResult` containing `applied: { name, ok, detail }[]`. However:
1. `auto-flipper.ts` imports no `fs` module and performs zero filesystem writes.
2. In `deploy-readiness.spec.ts`, `flipResult.applied` is **never consumed** — only `flipResult.plans` is assigned to `report.flips`.
3. `ReadinessReport` interface in `reporter.ts:26` contains `flips: FlipPlan[]` (the plan only), not the applied results.
4. `OPERATOR_KEYS_NEEDED.md` is written by `writeOperatorKeysMarkdown()` which does not include applied flip results.

**Why it's a problem:** When `READINESS_AUTO_FLIP=true` and `NODE_ENV=production`, secrets are silently set via `flyctl secrets set` and the result is discarded. The operator has no durable record of what was auto-flipped, which flip succeeded vs failed, or what the `stderr` was if a flip failed. A failed flip (e.g. wrong FLY_API_TOKEN, network error) is silently discarded — `applied[n].ok === false` is not tested anywhere.

**Recommended fix:** Append applied flip results to `OPERATOR_KEYS_NEEDED.md` when `mode === 'apply'`. Add a test assertion that `applied.every(r => r.ok)` when mode is apply. Include `applied` in `ReadinessReport` and render it in both console and markdown formats.

---

### F-04 — AUTO-FLIPPER: `--stage` is not a standard `fly secrets set` flag — P2

**Severity:** P2  
**File:** `test/prod-readiness/auto-flipper.ts:88`  
**Evidence:**  
```typescript
const res = await runFly(['secrets', 'set', `${plan.name}=${plan.proposed_value}`, '--stage']);
```
`--stage` is not a documented `fly secrets set` flag. The actual fly CLI flags for staging are `--app` (to specify the app) and `--stage` is not listed in Fly.io CLI reference for secrets. If `flyctl` ignores unknown flags it silently succeeds; if it rejects unknown flags, every apply-mode flip fails silently (see F-03: `applied[n].ok` is never checked).

**Why it's a problem:** Either the secrets are set to the wrong app (missing `--app`), or `--stage` causes flyctl to reject the command. Either way the operator's intended flip does not execute correctly.

**Recommended fix:** Replace `--stage` with the correct flag. Standard pattern: `flyctl secrets set ${plan.name}=${plan.proposed_value} --app $FLY_APP_NAME`. The app name should be injected via env (`FLY_APP_NAME`) and validated before applying.

---

### F-05 — CONCURRENCY: `beforeAll` is synchronous but launches unhandled async promise — P2

**Severity:** P2  
**File:** `test/deploy-readiness.spec.ts:52,118`  
**Evidence:**  
```typescript
beforeAll(() => {           // line 52: NOT async, does NOT return promise
  // ...
  const flipPromise = autoFlip(...); // line 101: async call
  (global as Record<string, unknown>).__readinessFlipPromise = flipPromise; // line 118: stash on global
});
```
Jest requires `beforeAll` to either be `async` (and `await` its work) or return a Promise explicitly. This `beforeAll` returns `undefined` — Jest considers it complete synchronously. The `flipPromise` floats unhandled until test 5 (line 157) awaits it.

**Why it's a problem:**  
1. If `autoFlip()` rejects before test 5 runs (e.g. `spawn` fails, unhandled rejection), Jest 30's default `unhandledRejection` policy may terminate the worker or emit a warning that counts as a test failure — but not in a clean, diagnosable way.
2. If `__readinessFlipPromise` is `undefined` (e.g. a previous test deletes it, or the spec runs in isolation after a Jest state reset), `afterAll` exits early at line 186 without writing `OPERATOR_KEYS_NEEDED.md` or rendering the report.

**Recommended fix:** Make `beforeAll` async and store `flipPromise` on a module-scoped variable, resolved inline:
```typescript
let flipResult: Awaited<ReturnType<typeof autoFlip>>;
beforeAll(async () => {
  // ... (sync setup) ...
  flipResult = await autoFlip(...);
});
```

---

### F-06 — OPERATOR_KEYS_NEEDED.md: no CI drift check — committed file vs runtime output can silently diverge — P2

**Severity:** P2  
**Files:** `test/deploy-readiness.spec.ts:191`, `.github/workflows/ci.yml`  
**Evidence:**  
The spec writes `OPERATOR_KEYS_NEEDED.md` unconditionally on every test run (`afterAll` line 191). The file is committed to git (SHA `0f3f1ffd`). CI runs `npm test` which runs this spec and silently overwrites the file. No CI step runs `git diff --exit-code OPERATOR_KEYS_NEEDED.md` to fail the build when the committed version drifts from the runtime-generated version.

**Why it's a problem:** A developer adds a new provider but does not regenerate and commit `OPERATOR_KEYS_NEEDED.md`. CI runs, overwrites the file in the worker, test passes, but the **committed** version in the repo remains stale. The operator reviewing the PR sees the stale committed version, not the current one. The PR comment block says "Do not edit by hand" but there is no enforcement.

**Recommended fix:** Add a CI step after `npm test`:
```yaml
- name: Check OPERATOR_KEYS_NEEDED.md is up to date
  run: |
    if ! git diff --exit-code OPERATOR_KEYS_NEEDED.md; then
      echo "OPERATOR_KEYS_NEEDED.md is stale. Run npm run readiness:check and commit the result."
      exit 1
    fi
```
Alternatively, strip the timestamp from the generated file (the `generated_at: ISO timestamp` line causes spurious diffs on every run) and then do the diff check.

---

### F-07 — LEARNING LEDGER: no integrity protection (hash/signature) — P2

**Severity:** P2  
**File:** `test/prod-readiness/__fixtures__/learning-ledger.json`, `test/prod-readiness/learning-ledger.ts`  
**Evidence:**  
The ledger file has `{ version: 1, entries: [...] }`. The loader at `learning-ledger.ts:54` validates structure but no hash or HMAC. Any developer (or a compromised CI environment) can add a `"classification": "false_positive"` entry with any `fingerprint` to silence a real finding without the test failing.

**Why it's a problem:** The learning ledger is the trust anchor for suppressing BLOCK_SHIP findings. If it can be tampered with, a real STUB in production code can be permanently silenced by adding one line to a JSON file — with no evidence of the suppression other than a git commit (which is already the case, but a hash would force an additional detectable tamper step).

**Note:** The current staleness check (comparing fingerprints against live scan output) provides partial protection — adding a fingerprint for a non-existent file:line would be caught. But adding a fingerprint that **matches a real line** (by copying an actual BLOCK_SHIP finding's fingerprint format) is the attack vector. The test would then silently suppress it.

**Recommended fix:** Add a `"hmac_sha256"` field to the ledger root signed with a key stored in CI secrets. Alternatively, require that new ledger entries include a `"added_by": "operator email"` AND a `"reviewed_at"` timestamp, and add a separate audit step that flags unsigned/unreviewed entries. The current `added_by` field is already present but not validated against any authority.

---

### F-08 — looksLikePlaceholder: `sk_test_` prefix (without `_replace`) is not caught — P3

**Severity:** P3  
**File:** `test/prod-readiness/provider-wiring.ts:205-210`  
**Evidence:**  
```typescript
const sentinels = [
  'changeme', 'change-me', 'your-key', 'your_key', 'yourkey',
  'placeholder', 'todo', 'tbd', 'xxx', 'fixme', 'fake', 'example',
  'insert_key_here', 'sk_test_replace', 'whsec_replace', 'redacted',
];
```
`looksLikePlaceholder('sk_test_123')` returns `false`. Only `sk_test_replace` is caught. A developer who sets `STRIPE_SECRET_KEY=sk_test_abc123` (a Stripe test mode key, not a live key) would pass the provider-wiring check, deploying with a test Stripe key to production.

Additionally, common sentinel values not covered: `'dummy'`, `'test'` (as full value), `'none'`, `'null'`, `'undefined'`, `'not_set'`, `'dev_key'`, `'local'`.

**Why it's a problem:** Stripe test keys (`sk_test_*`) are functional but charge to a test account. Deploying with `sk_test_` to production means payments appear to succeed client-side but no real charges occur. This is an operational correctness failure that the provider check is designed to prevent.

**Recommended fix:**  
```typescript
// Add to sentinels array:
'sk_test_',   // Stripe test key prefix (any test key)
'whsec_test', // Stripe webhook test secret
'rk_test_',   // Stripe restricted test key
```
Additionally, note the divergence between `looksLikePlaceholder` in `provider-wiring.ts` and the inline `placeholder()` function in `deploy-readiness.spec.ts:82-85` — they check different sentinel sets. Unify into a single exported function.

---

### F-09 — env-discovery: PLACEHOLDER detection mismatch between looksLikePlaceholder and spec inline function — P3

**Severity:** P3  
**Files:** `test/prod-readiness/provider-wiring.ts:202-211`, `test/deploy-readiness.spec.ts:82-85`  
**Evidence:**  
Two independent placeholder-detection functions in the same test suite with different sentinel sets:

`looksLikePlaceholder()` (provider-wiring.ts) catches:  
`changeme, change-me, your-key, your_key, yourkey, placeholder, todo, tbd, xxx, fixme, fake, example, insert_key_here, sk_test_replace, whsec_replace, redacted`

`placeholder()` inline (deploy-readiness.spec.ts:84) catches:  
`/(placeholder|todo|tbd|changeme|insert_key_here|your_key)/i`

The spec-inline function misses: `change-me`, `your-key`, `yourkey`, `xxx`, `fixme`, `fake`, `example`, `sk_test_replace`, `whsec_replace`, `redacted`.

**Why it's a problem:** The same MUST_SET switch with `STRIPE_SECRET_KEY=redacted` would be caught by `looksLikePlaceholder()` (provider check) but would pass the spec's MUST_SET check. Inconsistent verdicts depending on which check path runs.

**Recommended fix:** Export `looksLikePlaceholder` from `provider-wiring.ts` and import it in `deploy-readiness.spec.ts` to replace the inline function. Single source of truth.

---

### F-10 — prod-switches.yml: `owner` field accepts any non-empty string — P3

**Severity:** P3  
**File:** `test/prod-readiness/registry-loader.ts:113`  
**Evidence:**  
```typescript
if (typeof r.owner !== 'string' || r.owner.length === 0) {
  issues.push('owner must be a non-empty string');
}
```
The owner field is free-form text. The prod-switches.yml header comment says "rough domain group; refine as ownership crystallizes" but no enum is enforced. Current values include: `unowned`, `billing`, `coach`, `auth`, `platform`, `jobs`, `observability`, `email`, `ai`, `wearables`. A typo (`billings`, `Billing`) or novel value silently passes.

**Why it's a problem:** 161 of 212 entries (76%) are `owner: unowned` — this is expected for the initial seed. But without enum enforcement, the ownership cleanup can't be verified programmatically. Typos will contaminate the ownership data silently.

**Recommended fix:** Define an `OWNERS` constant set in `registry-loader.ts` (mirroring the documented list from the YAML header comment) and validate against it. Allow `unowned` as an explicit acknowledged-unclaimed value. Reject unknown owner strings.

---

### F-11 — prod-switches.yml: `description` can be empty string — P3

**Severity:** P3  
**File:** `test/prod-readiness/registry-loader.ts:116`  
**Evidence:**  
```typescript
if (typeof r.description !== 'string') {
  issues.push('description must be a string');
}
```
An empty `description: ""` passes validation. The schema comment says the field exists but does not mark it required or non-empty.

**Why it's a problem:** The 126 entries seeded from grep (not from ENV_RULES) use a generic `"Used in code but not in ENV_RULES yet. Owner please claim."` description. Future entries could ship with empty descriptions, making the operator-facing doc useless for those switches.

**Recommended fix:** Add `|| r.description.length === 0` to the check. Minimum meaningful description length: 10 characters.

---

### F-12 — auto-flipper: `prod_default: OFF` flip does NOT write to process.env in-process — P3

**Severity:** P3  
**File:** `test/prod-readiness/auto-flipper.ts:60-71`  
**Evidence:**  
```typescript
if (sw.prod_default === 'OFF') {
  const cur = env[sw.name];
  if (cur && cur !== 'false' && cur !== '0') {
    plans.push({ name: sw.name, reason: `...`, proposed_value: 'false' });
  }
  continue;
}
```
In apply mode, `fly secrets set ${name}=false` is called (F-04 aside). But the in-process `env` object (`process.env`) is NOT updated. The next scan within the same test run still sees the old value. This is inherently idempotent (the same flip would be planned again on the next real run), but the within-run state is stale if other checks in the same spec read from `process.env` after the flip.

**Why it's a problem:** If a future assertion reads `process.env[flippedVar]` after `autoFlip()` applies, it will see the old value, not the flipped one. This is a latent correctness hazard.

**Recommended fix:** After a successful `fly secrets set` apply, also mutate `env[plan.name] = plan.proposed_value` so the in-process state stays consistent. Note that `process.env` mutations are visible to the running process; this is the intended behavior in test-apply mode.

---

### F-13 — stub-scanner: binary `.ts` files would crash `readFileSync` with `utf8` encoding — P3

**Severity:** P3  
**File:** `test/prod-readiness/stub-scanner.ts:91`, `test/prod-readiness/env-discovery.ts:74`  
**Evidence:**  
```typescript
const text = fs.readFileSync(file, 'utf8');  // stub-scanner.ts:91
const text = fs.readFileSync(file, 'utf8');  // env-discovery.ts:74
```
Both walkers filter to `.ts` files only, which protects against `.png`, `.json`, etc. However, if a binary file with a `.ts` extension were placed in `src/` (e.g. a font file accidentally committed as `icon.ts`, or a generated binary with a wrong extension), `readFileSync` with `utf8` would succeed but produce garbled text, potentially triggering false pattern matches or causing unparseable content. In Node.js, `readFileSync` with `utf8` does not throw on non-UTF-8 bytes — it produces replacement characters — so this is a false-positive risk, not a crash risk. Nonetheless it could produce misleading scanner output.

**Why it's a problem:** Low probability but the walkers have no defense against this class of file. The current `src/` tree has no binary `.ts` files (verified).

**Recommended fix:** Add a binary-detection guard: check if the first 512 bytes contain null bytes (`\0`) before scanning for patterns. Standard binary-detection heuristic. Alternatively, use `fs.readFileSync(file)` as a Buffer and check the null-byte count before `toString('utf8')`.

---

### F-14 — symlink handling: walkers do not follow symlinks — directory symlinks silently skipped — P3

**Severity:** P3  
**File:** `test/prod-readiness/env-discovery.ts:96-98`, `test/prod-readiness/stub-scanner.ts:139-141`  
**Evidence:**  
```typescript
if (e.isDirectory()) {   // uses lstat semantics - symlinks to dirs return false
  walkTs(p, visit);
}
```
`fs.readdirSync(dir, { withFileTypes: true })` uses `lstat` semantics. A symlink to a directory has `isDirectory() === false` and `isSymbolicLink() === true`. Both walkers skip symlinks silently. Symlinked `.ts` files (not directories) would have `isFile() === false` and also be skipped.

**Why it's a problem:** If a developer creates a symlink into `src/` (e.g. for a monorepo shared module), env vars and stubs in the linked files would not be scanned. The R108 gap-check would pass while real process.env.X references exist in the codebase.

**Note:** Symlink loops are NOT a risk (since symlinks are not followed), but coverage gaps are. The current `src/` tree has no symlinks (verified).

**Recommended fix:** Decide policy: either (a) follow symlinks with cycle detection (use a `visitedInodes` Set), or (b) document explicitly that symlinks in `src/` are excluded from the scan.

---

### F-15 — npm audit: 9 high + 1 critical vulnerabilities pre-existing on main (not introduced by this PR) — P2

**Severity:** P2 (pre-existing, not introduced by this PR — flagging per R100.10)  
**Evidence:**  
```
npm audit --audit-level=high
34 vulnerabilities (1 low, 23 moderate, 9 high, 1 critical)
```
Identical count on `origin/main` and on `0f3f1ffd` — this PR does not introduce new vulnerabilities. The new `js-yaml@4.2.0` dependency is **outside** the vulnerable range `<=4.1.1` (the existing nested `@nestjs/swagger` dependency uses `js-yaml@4.1.1` and has the known moderate vuln). This PR is a marginal security improvement for `js-yaml`.

However, R100.10 requires `npm audit --audit-level=high` clean for a PR to pass. The pre-existing state is dirty, and this PR does not fix it.

**Recommended fix:** Address the 9 high + 1 critical findings in a dedicated security PR. This PR should not be blocked on pre-existing vulnerabilities, but the baseline must be cleaned.

---

### F-16 — OPERATOR_KEYS_NEEDED.md generated_at timestamp causes spurious CI diff on every run — P3

**Severity:** P3  
**File:** `test/prod-readiness/operator-keys-generator.ts:29`  
**Evidence:**  
```typescript
out.push(`> _Auto-generated by \`test/deploy-readiness.spec.ts\` on ${input.generated_at}._`);
```
`generated_at` is `new Date().toISOString()` — a new timestamp on every run. If a CI drift check is added (see F-06), the timestamp will cause a false diff on every run even when the actual content (providers, switches, unregistered vars) has not changed.

**Recommended fix:** Either remove `generated_at` from the committed file format, or add a `--strip-timestamps` mode that omits it for CI diff purposes. Alternatively, store only the date (not time) in the committed version.

---

### F-17 — auto-flipper: no idempotency guard for concurrent runs — P3

**Severity:** P3  
**File:** `test/prod-readiness/auto-flipper.ts:84-91`  
**Evidence:**  
```typescript
for (const plan of plans) {
  const res = await runFly(['secrets', 'set', ...]);  // sequential, no lock
}
```
If two `readiness:check:prod` runs execute concurrently (e.g. two CI jobs triggered simultaneously, or a human triggering while CI is running), each would plan the same flips and both would issue `fly secrets set` for the same variable. `fly secrets set` is itself idempotent (setting the same value twice is safe), but if one job is flipping OFF and another is flipping ON simultaneously, the last write wins with no alerting.

**Why it's a problem:** Low probability in practice (requires concurrent apply-mode runs), but the `--stage` flag issue (F-04) means the flip may not target the intended app in the first place.

**Recommended fix:** Add a Fly.io advisory lock (or a GitHub Actions concurrency group) around the apply step. The simplest fix is to ensure apply-mode runs never execute in parallel by setting `concurrency: group: readiness-apply` in the GitHub Action.

---

## R100.A2 Cast Token Count (Net, over entire PR diff)

| Token | Added | Removed | NET | Verdict |
|---|---|---|---|---|
| `@ts-ignore` | 0 | 0 | 0 | PASS |
| `as any` | 0 | 0 | 0 | PASS |
| `as unknown as` | 0 | 0 | 0 | PASS |
| `as never` | 0 | 0 | 0 | PASS |
| `.catch(()=>undefined)` | 0 | 0 | 0 | PASS |
| `.catch(()=>null)` | 0 | 0 | 0 | PASS |
| `.catch(()=>{})` | 0 | 0 | 0 | PASS |
| `Coming soon` | 3 | 0 | **+3** | **P0 FAIL** — see F-01 |

All 3 net additions of `Coming soon` are in `test/` files: two as JSON fingerprint string values in `learning-ledger.json`, one as a pattern definition token in `stub-scanner.ts`. None create a user-facing placeholder string in production code. R75 is syntactic: "any positive net = P0." The auditor flags this but notes the operator may elect an R100 Exception Request for these meta-uses.

---

## R100 Checklist (Lens A scope)

| Rule | Status | Evidence |
|------|--------|----------|
| R100.1 Zero secrets in source/history | PASS | Scanned all new files: `test/prod-readiness/*.ts`, `prod-switches.yml`, `OPERATOR_KEYS_NEEDED.md`. No API keys, tokens, or credentials committed. `prod-switches.yml` contains only metadata; OPERATOR_KEYS_NEEDED.md lists placeholder commands (`fly secrets set X=<value>`), not real values. |
| R100.2 RLS on every Supabase table | N/A | No migrations in this PR. No new Supabase tables. This PR is test-only infrastructure. |
| R100.3 No raw SQL with string concat | N/A | No SQL in this PR. Test-only code. |
| R100.4 No unsanitized output | N/A | Backend-only PR. No FE rendering. The `renderMarkdown()` function in `reporter.ts` renders internal data (env var names, switch descriptions) to markdown string — no user-supplied input is unsanitized in a security sense. |
| R100.5 IDOR-proof endpoints | N/A | No new endpoints in this PR. |
| R100.6 Rate limiting on auth/paid APIs | N/A | No new endpoints. |
| R100.7 JWT hygiene | N/A | No JWT handling in this PR. |
| R100.8 Runtime input validation | N/A | No request DTOs. `loadRegistry()` validates its YAML input (see F-10, F-11 for schema gaps). |
| R100.9 Role check at data layer | N/A | No data layer changes. |
| R100.10 npm audit clean | FAIL | 9 high + 1 critical pre-existing (not introduced by this PR; see F-15). `npm audit --audit-level=high` exits non-zero. |
| R100.11 CORS allowlist | N/A | No new routes. |
| R100.12 No internal info in prod errors | N/A | No new HTTP error responses. The `RegistryValidationError` is thrown inside test infra, never returned as an HTTP response. |
| R100.13 HTTPS + HSTS | N/A | Infra-level; no changes in this PR. |
| R100.21 No N+1 | PASS | `collectPathPresence()` in `provider-wiring.ts:163` iterates providers × hints × a stack-based walk for each hint without a DB call. Pure filesystem I/O; no query loop. |
| R100.22 Indexes on FKs + hot WHERE | N/A | No migrations, no new queries. |
| R100.23 Pagination on list endpoints | N/A | No new list endpoints. |
| R100.24 No event-loop blocking | FAIL (P3) | Multiple `fs.readFileSync` calls in hot loops inside `walkTs()` and `walkSource()` (997 `.ts` files in `src/`). These are synchronous blocking calls that run in `beforeAll()` on the Node.js main thread. In the test runner context this is acceptable (tests are not expected to be non-blocking). However, if these utilities are ever imported into a server context, the sync reads would be a hard perf regression. Current usage is test-only so severity is P3. Evidence: `env-discovery.ts:74`, `stub-scanner.ts:91`, `provider-wiring.ts:144`. |
| R100.25 Caching for stable data | FAIL (P3) | `discoverEnvVars()` and `scanForStubs()` both perform full filesystem walks with no caching. `prod-switches.yml` (1,296 lines) is parsed fresh on every `loadRegistry()` call. In test context (single run), no caching is needed. But if `readiness:check` were called multiple times in the same process, the full walk would repeat. No incremental or mtime-based cache. Evidence: `env-discovery.ts:34`, `registry-loader.ts:55`. |
| R100.26 Media compress + CDN | N/A | No media handling in this PR. |
| R100.27 No polling for real-time | PASS | No `setInterval` or polling loops in any new file. |
| R100.28 RMW under lock/transaction | N/A | No DB mutations. `writeOperatorKeysMarkdown()` writes a single file; concurrent writes would produce incomplete file content but this is a test output artifact, not a transactional concern. |
| R100.29 Idempotency on payments | N/A | No Stripe calls in new code. |
| R100.30 Optimistic update rollback | N/A | Frontend concern; N/A for this BE-only PR. |
| R100.31 Hook deps correct | N/A | Frontend concern; N/A. |
| R100.32 Cleanup on unmount | N/A | Frontend concern; N/A. |
| R100.44 Multi-table writes in transactions | N/A | No DB writes in this PR. `writeOperatorKeysMarkdown()` writes a single file, not a multi-table DB operation. |
| R100.45 Soft deletes on critical entities | N/A | No new DB models. |
| R100.46 DB-layer constraints | N/A | No migrations. |
| R100.47 PITR + recovery runbook | N/A | Operator-level concern; no regression introduced by this PR. |
| R100.48 CI/CD enforced | FAIL (P2) | The deploy-readiness test is included in `npm test` (which CI runs) — PASS on that front. However: (a) no `git diff --exit-code OPERATOR_KEYS_NEEDED.md` check to catch committed-vs-runtime drift (see F-06); (b) `npm audit --audit-level=high` is not gated in CI (see F-15). Evidence: `.github/workflows/ci.yml` — no drift check step. |
| R100.49 Dev-only excluded from prod bundle | PASS | All new files are under `test/` — they are devDependencies-only and will never reach the production bundle. `js-yaml` is added as a devDependency (`package.json:75`). |
| R100.50 Graceful degradation | FAIL (P2) | `loadRegistry()` throws `RegistryValidationError` (not caught) if `prod-switches.yml` is malformed. `loadLedger()` throws a plain `Error` if the JSON is malformed. `discoverEnvVars()` throws if `readFileSync` fails (permission denied, etc.). None of these are caught in `beforeAll()`, so a corrupt `prod-switches.yml` would make the test suite throw an uncaught exception from `beforeAll` — which Jest reports as a test suite failure (not individual test failures), making the error harder to diagnose. A try-catch with a clear error message per-file would improve degradation. |
| R100.A1 Test:src ratio ≥ 2.0 | N/A (Lens B) | This is Lens B scope. The PR adds 1,245 test LOC and 0 prod LOC. The ratio contribution from this PR is infinite (all test, no prod), which is favorable. |
| R100.A2 Banned-cast NET adds = 0 | FAIL | `Coming soon` NET +3 (all in `test/` files as meta/data references). See F-01. All other 7 tokens: NET 0. |
| R100.A3 ≤ 400 prod LOC | PASS | 0 new production LOC. All 1,245 new lines are in `test/`. Verified: `git diff --stat` shows no `.ts` changes outside `test/`. |
| R100.A4 CI pass rate ≥ 75% | N/A | Operator-level concern; not directly auditable from repo state. |
| R100.A5 Verdict line present | PASS | This report ends with `VERDICT: FINDINGS`. |

---

## Summary Table

| Finding | Severity | Rule | Title |
|---|---|---|---|
| F-01 | **P0** | R100.A2 / R75 | `Coming soon` NET +3 in PR diff |
| F-02 | **P1** | R108 / R100.1 | env-discovery misses `process.env[CONST]` — 6 unregistered vars |
| F-03 | P2 | R100.50 | Auto-flipper audit trail gap: applied flips not logged |
| F-04 | P2 | R100.50 | `--stage` is not a valid `fly secrets set` flag |
| F-05 | P2 | R100.21 | `beforeAll` launches unhandled async promise |
| F-06 | P2 | R100.48 | No CI drift check for OPERATOR_KEYS_NEEDED.md |
| F-07 | P2 | R100.1 | Learning ledger has no integrity protection |
| F-08 | P3 | R100.1 | `looksLikePlaceholder` misses `sk_test_*` (Stripe test keys) |
| F-09 | P3 | R100.8 | Placeholder sentinel mismatch between two functions |
| F-10 | P3 | R100.8 | `owner` field accepts any string, no enum enforcement |
| F-11 | P3 | R100.8 | `description` can be empty string |
| F-12 | P3 | R100.50 | `apply` mode does not update in-process `env` |
| F-13 | P3 | R100.1 | Binary `.ts` files produce false scanner matches |
| F-14 | P3 | R100.1 | Symlinks in `src/` are silently skipped (coverage gaps) |
| F-15 | P2 | R100.10 | Pre-existing 9 high + 1 critical npm audit findings |
| F-16 | P3 | R100.48 | `generated_at` timestamp causes spurious CI diffs |
| F-17 | P3 | R100.21 | No idempotency guard for concurrent apply-mode runs |

**Blocking findings (P0/P1):** 2  
**Important findings (P2):** 6  
**Minor findings (P3):** 9  

---

VERDICT: FINDINGS
