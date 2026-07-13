<!--
RECOVERY NOTE (R5 / R8 — Zombie Agent Protocol).
Recovered 2026-07-13 by the operator picking up the audit cycle. This independent Lens B
audit report was found stranded in the previous operator's ephemeral scratch file
(/tmp/claude_code_output.md) and existed NOWHERE in the context repo — it would have been
lost forever the moment the scratch file was overwritten. Preserved here verbatim per R5
("NEVER. LOSE. ANYTHING.") and R8 (migrate stranded workspace artifacts to the context repo).

STATUS OF THE PR283 AUDIT CYCLE (for the next operator):
- Target: BradleyGleavePortfolio/growth-project-mobile PR #283 (pendingInviteCode dual-key
  orphan bug fix). PR head b874e32, base 09b6cac.
- Lens B verdict below: FINDINGS — 1 × P2 (P2-1) + 3 × P3 (P3-1/2/3). No P0/P1.
- Per R14 ("clear of any P0-P3 in ANY regard"), these MUST be closed by a fixer + re-audited
  to CLEAN before PR #283 may merge. That work is PRODUCT-CODE and was OUT OF SCOPE for the
  2026-07-13 doctrine session (authorized for context-repo docs only) — it is NOT done here.
- Lens A verdict for PR #283 was not found in scratch; confirm/recover it before merge.
- This is a preservation copy only; the authoritative next action is a product-repo fixer
  lane, which requires the appropriate product-repo authorization.
-->

# RECOVERED — INDEPENDENT AUDIT — Lens B (tests / contracts / cycle / PR-hygiene)

## BUILD MATRIX
- repo: BradleyGleavePortfolio/growth-project-mobile
- base (origin/main): 09b6cac809438b8e9e54494c6330f06415caca53
- PR #283 head: b874e327305acb32d2bb3bbcbd69dc4e31a68d6e
- context doctrine SHA: 6ac6ba0
- timestamp (ISO 8601 UTC): 2026-07-13T05:50:00Z
- SHA verification: PR head re-read via `gh pr view --json headRefOid` == `git rev-parse pr283` == b874e32. **UNCHANGED. No INFRA_DEATH.**

## SCOPE
Read AGENT_RULES-1.md in full (R1–R126 + appendices) sequentially. Audited the complete 3-file diff:
`src/lib/pendingInviteCode.ts` (+99/-4), `src/navigation/RootNavigator.tsx` (+7/-28), `src/__tests__/pendingInviteCode.test.ts` (+227/-8). Pure client-side AsyncStorage/MMKV bug fix — no backend/DB/RLS/SQL/Stripe/migration/telemetry surface.

## WHAT THE PR DOES (verified)
Collapses a dual-key orphan bug (writer wrote `pending_invite_code:<scope>`, reader read bare `pending_invite_code`) into one user-scoped source of truth. `resolveScope()` reads canonical identity MMKV-first (`prefsStorage` key `auth.user_data`), falls back to the transient AsyncStorage `user_data` login window, then `anonymous`. Reader + every writer derive the key through `keyForScope(resolveScope())`, so they are structurally symmetric. Legacy bare key migrated on read (guarded to a real id). `stashInviteCodeFromDeepLink` extracted from RootNavigator for unit-testability.

## CORRECTNESS VERIFICATION (independently traced)
- **Storage-instance consistency (root-fix validity):** `userCache.setUserCache` writes `prefsStorage.set('auth.user_data', …)` → physical `prefs:auth.user_data`. `resolveScope` reads `prefsStorage.getStringAsync('auth.user_data')` → same instance, same physical key in BOTH native MMKV and the Jest/Expo-Go AsyncStorage shim. Resolver reads exactly what `userCache` wrote. Root fix is real, not cosmetic.
- **Storage mock fidelity:** tests use real `userCache` + real `prefsStorage` shim + official `@react-native-async-storage/async-storage/jest` mock (per jest.setup.js). The mock's `setItem` mutates its backing store synchronously inside the Promise executor, so the un-awaited `prefsStorage.set` inside `setUserCache(...)` lands before the subsequent `await resolveScope()` — no test-race. Tests exercise the true production layout (`prefs:auth.user_data`; AsyncStorage `user_data` deleted post-migration), directly addressing the "fixture that cannot occur at runtime" risk. **High fidelity.**
- **Boot-migration race:** test runs the real `readUserCache()` migration (moves to MMKV, deletes AsyncStorage `user_data`); write pre-migration, read post-migration → same real scope. Verified against the actual `userCache` implementation. **Covered.**
- **Cross-user isolation / account switching:** tests prove user A's code invisible to user B (switch without signOut), restored for A, per-user physical keys, no shared anonymous slot. **Covered.**
- **signOut sweep (R15):** authActions.ts (unchanged) sweeps the `pending_invite_code:` prefix AND the bare legacy `pending_invite_code` — confirms the legacy-migration safety argument.
- **Claim flow:** reads via scoped `readPendingInviteCode`, clears via scoped `clearPendingInviteCode`. Symmetric. 4xx-clears / 5xx-retains tested with value assertions.
- **`removeMany`:** pre-existing established repo convention (authActions.ts, mmkv.ts on main). Not a PR-introduced risk.
- **RootNavigator dead-code (R66/R111):** `AsyncStorage` import retained but still used (needs_role_selection, onboarding_complete, day_one_completed). Not dead. Inline scope resolution correctly deleted.

## HARD GATES
- **R76/R23 LOC:** prod additions 99 + 7 = **106 ≤ 400. PASS.**
- **R74/R100.A1 test:src:** 227 / 106 = **2.14 ≥ 2.0. PASS.**
- **R75/R112/R100.A2 banned-cast net:** **0.** Only cast added: `as { id?: unknown }` (narrow concrete, allowed). No `as any|as unknown as|as never|@ts-ignore|Coming soon` in prod or test. **PASS.**
- **R40/R117/R123 test reality:** 20 new `it()`, 47 `expect()`, **0 weak assertions**, no `.skip`. Asserts exact physical keys + values → **strong mutation sensitivity** (resolver ordering, key derivation, migration guard, trim, isolation all pinned). **PASS.**
- **R21/R84/R82/R106/R25/R28/R92/R97/R98/R119/R108/R80:** **N/A** (no backend/contract/schema/telemetry/money/PII/env surface).
- **tsc/lint:** not runnable (sparse worktree, no node_modules); PR body asserts clean; no static red flags in diff.

## FINDINGS

### P2-1 — PR body falsely claims a non-existent consumer (R101 / R124 / R10)
PR #283 body → "Cross-consumer review (R25)" lists `src/screens/day-one/CoachPairingScreen.tsx — writePendingInviteCode retry stash`. `writePendingInviteCode` has **zero** production callers anywhere in `src/` (verified: 3 refs in `src/lib/pendingInviteCode.ts` = definition + the internal call from `stashInviteCodeFromDeepLink`; 12 in the test; **none** elsewhere). CoachPairingScreen.tsx (blob 542ed64) contains no pending-invite reference. The R25 blast-radius list a reviewer relies on is inaccurate. **Fix:** remove the CoachPairingScreen line (the only real external write path is RootNavigator → `stashInviteCodeFromDeepLink`) or wire the intended call. (HomeScreen-mounts-banner and authActions-sweep claims are accurate.)

### P3-1 — Silent-degrade catches without structured log (R59 / R109 Layer 2 / R100.36)
`src/lib/pendingInviteCode.ts`: `parseUserId` JSON.parse catch (~line 40) and `resolveScope` MMKV/AsyncStorage read catches (~lines 48, 56) swallow errors and fall through to a safe default (`anonymous`). Consistent with the module's pre-existing best-effort convention (R63); each degrades to a defined outcome. Strict R59/R109 wants a log. **Fix (optional):** add a `logger.debug/warn` in the storage-read catches.

### P3-2 — No direct RootNavigator-level test (R10 exhaustiveness)
The original bug lived in RootNavigator's `isInvite`/`authed` branch. It's now guarded at the unit level (`stashInviteCodeFromDeepLink` ↔ `readPendingInviteCode` symmetry) and made structurally impossible by the single-source-of-truth refactor, but the navigator's invoking branch is not itself exercised by a test. Acceptable tradeoff, noted for completeness.

### P3-3 — Latent anonymous→real-id non-migration asymmetry (R15, informational)
Bare legacy key migrates into the real-id scope, but `pending_invite_code:anonymous` is deliberately NOT migrated when identity later resolves. Not reachable today because RootNavigator gates the stash behind `authed` (a real id always resolves). Any future caller writing while truly anonymous would strand the code across login. **Fix (optional):** document the intentional asymmetry or handle it symmetrically.

## OBSERVATION (not charged against this PR)
CI (`.github/workflows/ci.yml`) runs only validate:config + lint(`--max-warnings=99999`) + tsc + jest; codeql.yml present. The §11 machine gates (R104/R105/R106/R108/R109/R110/R113/R116/R118/R120 + `r100-quality-gate`/`test:deploy-readiness`) are **not wired** — a pre-existing repo-wide condition, outside this bug-fix lane's scope (R18); an R125/UNENFORCED_RULES concern for the context repo, not a defect of this diff.

## R100 CHECKLIST (applicable rows)
| Rule | Status | Evidence |
|------|--------|----------|
| R100.16 No new TODO/FIXME | PASS | diff grep clean |
| R100.17 Real test assertions | PASS | 47 expects, 0 weak |
| R100.34 Structured logging | P3 | see P3-1 |
| R100.36 No swallowed errors | P3 | see P3-1 (safe-degrade, consistent) |
| R100.43 Zero dead code | PASS | AsyncStorage still used in RootNavigator |
| R100.A1 test:src ≥ 2.0 | PASS | 227/106 = 2.14 |
| R100.A2 banned-cast net = 0 | PASS | 0 |
| R100.A3 ≤ 400 prod LOC | PASS | 106 |
| R100.A5 Verdict line present | PASS | below |

## ASSESSMENT
The code change is correct, production-faithful, migration-safe, and cross-user isolated, with high-fidelity storage mocking and strong mutation-sensitive tests. No P0/P1. One P2 (PR-body accuracy — a claimed consumer that does not exist) and three P3s. Per R14 ("clear of any P0–P3 in any regard"), these must be closed before merge.

VERDICT: FINDINGS
