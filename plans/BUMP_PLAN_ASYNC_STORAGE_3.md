# BUMP PLAN — @react-native-async-storage/async-storage 2.2.0 → 3.1.1 (Mobile PR #200)

**Author:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Created:** 2026-06-13
**PR:** https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/200
**Branch:** `dependabot/npm_and_yarn/react-native-async-storage/async-storage-3.1.0`
**Audit lane:** mobile, OWNS `src/services/queryClient.ts`, `src/services/authActions.ts`, `src/storage/mmkv.ts`, `src/services/__tests__/queryClient.persister.test.ts`, `src/services/__tests__/queryClient.signout.test.ts`

## Summary

async-storage v3 is a **major rewrite** with scoped-storage architecture. The default export is still a **singleton** that uses v2/v1 storage for transitional compatibility — meaning existing `AsyncStorage.getItem(...)` / `AsyncStorage.setItem(...)` / `AsyncStorage.removeItem(...)` / `AsyncStorage.clear()` calls KEEP WORKING.

What breaks: **callback-based API removed** + **batch methods renamed** (`multi*` → `*Many`).

## Breaking changes that affect this repo

### Batch method renames (the only real break)

| v2 | v3 | Call sites in this repo |
|---|---|---|
| `AsyncStorage.multiRemove(keys)` | `AsyncStorage.removeMany(keys)` | 3 production + 2 test mock sites |
| `AsyncStorage.multiGet(keys)` | `AsyncStorage.getMany(keys)` | 0 production sites |
| `AsyncStorage.multiSet(pairs)` | `AsyncStorage.setMany(pairs)` | 0 production sites |
| `AsyncStorage.multiMerge(pairs)` | `AsyncStorage.mergeMany(pairs)` | 0 sites |

### Untouched (still work in v3 singleton)

`AsyncStorage.getItem`, `setItem`, `removeItem`, `clear`, `getAllKeys`. **No changes needed** to the 25+ call sites that use only these.

### `useAsyncStorage` hook removed

`grep -rE "useAsyncStorage" src/` returns 0 hits → not used in this repo.

### Android extra installation step

v3 docs reference an Android Gradle configuration step. Need to verify CI Android build still passes (project may not run Android in CI; check `.github/workflows/ci.yml` — only `Typecheck, lint, test` runs, no Android build → SAFE).

### iCloud backup default change

v3 disables iCloud backup by default (was opt-in via flag in v2). For this app, **none of the stored values are user-authored secrets that must survive device migration** (workout cache, query persistence, settings). Safe default — no opt-in needed.

## Exact migration sites

```
PRODUCTION:
  src/storage/mmkv.ts:79                AsyncStorage.multiRemove(ours)            → removeMany(ours)
  src/services/authActions.ts:176       AsyncStorage.multiRemove(matching)        → removeMany(matching)
  src/services/authActions.ts:296       AsyncStorage.multiRemove([...keys])       → removeMany([...keys])
  src/services/queryClient.ts:134       AsyncStorage.multiRemove(matching)        → removeMany(matching)

TESTS:
  src/services/__tests__/queryClient.persister.test.ts:13    multiRemove: jest.fn()              → removeMany: jest.fn()
  src/services/__tests__/queryClient.persister.test.ts:43    AsyncStorage.multiRemove as jest.Mock → AsyncStorage.removeMany as jest.Mock
  src/services/__tests__/queryClient.persister.test.ts:62    same                                  → same
  src/services/__tests__/queryClient.signout.test.ts:11      multiRemove: jest.fn()...             → removeMany: jest.fn()...

NON-MIGRATIONS (false-positive matches):
  src/services/authActions.ts:271       // comment "multiRemove below clears it"  → can update comment for clarity
```

## Risk register

| Risk | Mitigation |
|---|---|
| v3 singleton sub-namespace doesn't actually have `removeMany` on default export | Verify by reading `node_modules/@react-native-async-storage/async-storage/lib/typescript/index.d.ts` AFTER `npm install` on the rebased branch. If `removeMany` is only on the scoped Storage class, must `import { storage } from '...'` and use `storage.removeMany(...)` instead. |
| react-query persister API expects `multiRemove` on the storage object passed to it | `src/services/queryClient.persister.test.ts:55` asserts `multiRemove.mock.calls[0][0].sort() === sorted keys`. Need to check `@tanstack/query-async-storage-persister` peer compatibility with v3 — if persister still calls `multiRemove` internally, will need a shim. |
| Existing `npm install` (not `npm ci`) means peer-dep warnings pass silently | Run `npm ls @react-native-async-storage/async-storage` post-install to confirm a single resolved version with no duplicates. |
| react-test-renderer / RNTL v14 in flight on `migrate/rntl-v14` branch may conflict with the persister test mock shape | RNTL v14 PR not yet opened. Sequence: land async-storage v3 FIRST (smaller surface, no RNTL coupling), then RNTL v14 picks up the renamed mock. R52: plan before parallelize. |

## Pre-flight verification (builder MUST do this first)

```bash
cd growth-project-mobile
git fetch origin
git checkout dependabot/npm_and_yarn/react-native-async-storage/async-storage-3.1.0
git rebase origin/main   # Or comment "@dependabot rebase" and wait
npm install
# Verify v3 actually exposes removeMany on the default export:
node -e "const A = require('@react-native-async-storage/async-storage').default; console.log(typeof A.removeMany, typeof A.multiRemove)"
# Expected: "function" "undefined"
# If reversed: the type lib is lying — STOP and re-plan with scoped-storage migration.
```

## Lane safety (R71)

- **OWNS:** the 4 production files + 2 test files listed above.
- **MUST-NOT-TOUCH:** any other `AsyncStorage` call site (they use methods that survived v3).
- **No overlap with #246 dev-deps** (different files entirely).
- **Potential overlap with `migrate/rntl-v14` branch** — that branch hasn't opened a PR yet, but it touches `src/services/__tests__/queryClient.persister.test.ts` for the v14 test-harness rewrites. SEQUENCE: this PR MERGES FIRST, then RNTL v14 builder rebases. R52 explicit: plan before parallelize.

## Fixer dispatch (Opus 4.8, R31-fresh)

Builder brief skeleton:

> Branch: `dependabot/npm_and_yarn/react-native-async-storage/async-storage-3.1.0` (rebased onto current main).
> Goal: get CI green on async-storage 3.1.1.
> Required commits on top of the Dependabot bump:
>  1. `fix(async-storage-3): rename multi* → *Many in production code`
>  2. `test(async-storage-3): update jest mocks to use new method names`
> Gates (R66-R70 fail-fast):
>  - Pre-flight runtime check passes (see above)
>  - `npx tsc --noEmit` (0 errors)
>  - `npm run lint`
>  - `npm test` full suite green (baseline must hold)
>  - `@tanstack/query-async-storage-persister` peer-dep verification (`npm ls`)
> Push every 2 min (R61). Auditor will run R72-exhaustive + R65 50-failures sweep + EXTRA check: confirm no surviving `multiRemove`/`multiGet`/`multiSet` literal strings in any non-comment line.

## Audit cycle (R-rules)

PLANNER (this doc) → BUILDER (Opus 4.8, fresh) → AUDITOR R1 (GPT-5.5, fresh, R73 mobile gate) → CLEAN ⇒ merge OR DIRTY ⇒ FIXER → AUDITOR Rn+1.

## Parallelization

- **Safe to run parallel with #307 zod-4 fixer** (separate repos).
- **MUST run before** RNTL v14 PR opens (overlap on persister tests).
- **MUST run before or after #246 dev-deps decision** — if #246 is closed (recommended), no conflict. If #246 is held, it touches jest-preset which doesn't intersect.
- **DOES NOT** intersect with Roman #242, MWB-3 follow-ups, or any community PR.
