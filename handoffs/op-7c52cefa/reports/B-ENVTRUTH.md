# B-ENVTRUTH: fix round on backend #624 and mobile #319

Lane: B-ENVTRUTH (builder). Date: 2026-10-01. Nothing was merged and no workflow was dispatched. No Fly or GitHub secret was read or set, and nothing in production was touched.

---

## Backend #624: `agent/clinic/s-envtruth-backend`

- **PR:** https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/624
- **Old head:** c82f2548.
- **New head:** `1159da9bd4391aa50b13131cccb008623d06e17e`. It was rebased onto main `10dff85c`, because main moved past be667142 during the round (#625, #597 and #622 merged).
- **Fix-round commits:** 7654b3ad (the round) and 1159da9b (merge-order registration).
- **Tier:** T4, unchanged. The PR body's tier header and its Fix round table (columns: finding, what changed, commit, test) are updated.
- **Fix-round comment:** https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/624#issuecomment-5942060249

| Finding | Disposition | Commit | Test that proves it |
| --- | --- | --- | --- |
| Sol B-624-1: the post-check parsed the table output and failed on flyctl's `* ` staged prefix, so apply was unreachable | **Fixed.** Uses `flyctl secrets list --json`; jq keeps only name and status. Fixed error codes, fails closed with a fix, and every guard or failure prints what went wrong and how to fix it. Lines from `secrets set` stderr are printed with the value after `=` redacted | 7654b3ad | `test/ci/fly-env-sync-behavior.spec.ts` (real `run:` blocks against a fake flyctl; fixtures staged, partial, deployed, no-status, capitalized; apply is reached; no value or digest leaks). 16 of its 19 tests fail on old code |
| Sol B-624-2: alias-key reads and exported-to-local helper bindings were dropped | **Fixed.** Alias keys go through the names-or-dynamic path. Now handled: alias-keyed helpers, alias chains and copies, destructuring, renamed / namespace / default imports, export lists, re-exports and cross-file wrappers. This surfaced 4 real unregistered `DUNNING_*` reads, now registered as optional with code defaults | 7654b3ad | `env-registration.spec.ts`, "B-624-2" block. All 7 fail on old code |
| Opus B-624-1: malformed present names were printed verbatim | **Fixed.** Shown as `MALFORMED_<n>` plus a length bucket, sorted last, with fix text | 7654b3ad | `fly-env-classifier.spec.ts`, "malformed present names are redacted". 4 fail on old code |
| Owner rule: no vague errors | Board red lines, classifier CLI errors and fly-env-truth guards / ssh failure now carry "Fix:" text | 7654b3ad | Behavioural failure-path tests, `deploy-readiness.spec.ts`, classifier CLI tests (3 fail on old code) |
| Merge order: #622 added an unregistered read; #597 added rules without `default` | Registered `FEATURE_AI_CONSENT_LEDGER_ENABLED` (optional, off by default). Recorded the defaults for #597's two rules. Descriptive changes only; no boot change | 1159da9b | Repository invariant and full-mode board (these were the red build-and-test checks on the pre-rebase merge ref) |
| Opus C-624-1: calendar and wearable names are in the allowlist | Not changed; operator decision | none | none |
| Opus C-624-2: values on argv, silent overwrite | Not changed; follow-up. Table parsing is replaced by JSON | none | none |
| Opus C-624-3: the first operator run is the ssh proof | Unchanged | none | none |

### Tests run (backend)

All commands ran through `ops/heavy.sh` with `--runInBand`.

**Jest at the pre-rebase tree.** 6 suites passed: 202 tests passed, 1 skipped. Log: `wt/b-envtruth-scratch/jest-be-3.log`.

```
npx jest --runInBand test/ci/fly-env-sync-behavior.spec.ts test/ci/fly-env-workflows.spec.ts test/prod-readiness/env-registration.spec.ts test/prod-readiness/fly-env-classifier.spec.ts test/env-validation.spec.ts test/deploy-readiness.spec.ts
```

**After the rebase.** Before 1159da9b, the same set had 2 failures: the unregistered `FEATURE_AI_CONSENT_LEDGER_ENABLED` read and the board count. After 1159da9b, `env-registration`, `deploy-readiness` and `env-validation` passed: 3 suites, 115 tests passed, 1 skipped. Logs: `jest-be-4.log` and `jest-be-5.log`.

**Old-code run** (old implementation files with the new tests): 30 failed, 72 passed. Log: `jest-be-oldcode.log`.

**Other checks:**
- `npx tsc --noEmit -p tsconfig.json`: rc 0.
- actionlint 1.7.7 with shellcheck 0.10.0: clean on both workflows.
- `node scripts/check-r75.js --mode=range --base=origin/main --head=HEAD`: net 0.

### CI at 1159da9b

All required checks passed: **build-and-test**, **rls-floor-guard**, **rls-live-tests**, **mwb-3-live-tests**, **npm audit**, **CodeQL** (both checks), **Banned cast tokens**, **build-sbom** and **danger**. The rest also passed: schema parity, actionlint, test-deploy-readiness, comment-deploy-readiness, danger dry-run and size-label.

Two checks are not green, and neither blocks:
- `deploy-readiness-gate` was skipped.
- `shellcheck (scripts/*.sh)` failed only on the pre-existing SC2015 in `scripts/s10-core-diff-gate.sh` (lines 58, 77 and 132).

---

## Mobile #319: `agent/clinic/s-envtruth-mobile`

- **PR:** https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/319
- **Old head:** 9080afad.
- **New head:** `0a2709e04e4a017f7bcc3882388e74b12fb3ca0d`. It was rebased onto main c4963f8 (the round commit sits on rebased 09dbdf2) and pushed with `--force-with-lease`.
- **Tier:** T2, unchanged. The body's tier header and its Fix round table are updated.
- **Fix-round comment:** https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/319#issuecomment-5942066001
- **Opus verdict:** posted 21:51, APPROVE with three C findings. All three are folded in.

| Finding | Disposition | Commit | Test that proves it |
| --- | --- | --- | --- |
| Sol B-319-1: regex comment stripping hid real reads, and strings produced ghost keys | **Fixed.** The scan is syntax-aware (TypeScript parser; no package.json change). Unparseable files fail closed. All messages say what is wrong and give a fix | 0a2709e | `expectedEnv.test.js`, "syntax-aware (B-319-1)": Sol's fixtures, template / JSX / regex variants, ghost strings, real comments still ignored, and CLI exit 1 / exit 0 cases |
| Opus C-319-1: no denylist for secret-shaped names | **Fixed.** The guard fails on SECRET, PASSWORD, PASSWD, SERVICE_ROLE, PRIVATE_KEY or WEBHOOK segments, or a trailing `_SK`. It checks reads, the manifest and eas.json | 0a2709e | Opus's probe now exits 1 |
| Opus C-319-2: `required` is documentation only | **Partly fixed.** Opt-in `--release-env` mode (required names non-empty, Stripe key starts `pk_live_` / `pk_test_`, no secret-shaped names; values never printed). Not wired, because wiring needs a package.json `eas-build-pre-install` script (owner decision) | 0a2709e | `--release-env` tests (also check for value leaks) |
| Opus C-319-3: a stale legacy Stripe key can win | Operator action: delete `EXPO_PUBLIC_STRIPE_PK` and `EXPO_PUBLIC_COACH_SIGNUP_SECRET` from EAS | none | none |

### Tests run (mobile)

**Jest.** 3 suites, 51 tests passed. Log: `jest-mob-3.log`.

```
npx jest --runInBand scripts/__tests__/expectedEnv.test.js scripts/__tests__/expoModuleGradleGuard.test.js src/config/__tests__/stripePublishableKey.test.ts
```

**Old-code run.** 24 failed, 14 passed. The 3 behaviour-pinning cases also pass on old code. Log: `jest-mob-oldcode-2.log`.

**Other checks:**
- `node scripts/check-expected-env.js`: OK, 56 names. These are the same names and files the old scanner found.
- tsc: rc 0.
- eslint: clean.
- Sol's probe re-run against the fix (`wt/b-envtruth-scratch/sol-319-probe-against-fix.cjs`): the read is detected and there is no ghost key.

### CI at 0a2709e

All passed: **Typecheck/lint/test**, **Analyze (javascript-typescript)**, **Analyze (actions)** and **CodeQL**. The CI log shows `[expected-env] OK: 56` and `[expo-module-gradle] OK: 30`.

---

## Open risks

1. Open PRs on older bases (for example #607 and #608) that add env reads without rules will fail ENV REGISTRATION until they add a rule. The failure message tells them how to fix it.
2. `registeredUnread` is circular: `env[rule.name]` counts every rule as read. This is informational only.
3. Opus C-624-2 remains: `flyctl secrets set` takes values on argv, and it overwrites silently. Follow-up: use stdin `flyctl secrets import`.
4. The first `fly-env-truth` run is still the only ssh proof (Opus C-624-3).
5. The 1159da9b registrations describe code that other PRs (#597, #622) own. Their owners should confirm the default text.

## Owner / operator decisions (recommended default)

- **C-624-1, sync allowlist:** leave the calendar and wearable GitHub secrets unset for launch, and drop the 3 `GOOGLE_OAUTH_*` names in a follow-up.
- **C-319-2:** wire `node scripts/check-expected-env.js --release-env` as `eas-build-pre-install` in a separate T3 PR (it needs a package.json change).
- **C-319-3:** delete `EXPO_PUBLIC_STRIPE_PK` and `EXPO_PUBLIC_COACH_SIGNUP_SECRET` from every EAS environment.
