# PR-18 / B3 — FIX REPORT (R2 audit, wave 2)

**Repo:** growth-project-backend
**PR:** #342 — custom-domain Host-header routing for landing pages
**Branch:** `pr18/b3-custom-domain-host`
**Fixer:** Dynasia G
**Started from SHA:** `683c952a5659d67692cca4bccc99d5643576b138`
**New SHA:** `0e94a6b298be6f1dba10045eee1f7b1126da9de5`
**Merge target (origin/main):** `9a8e210bd00b4b224b050db2652766904b5b567e`

Addresses the R2 audit (`audits/PR18_wave/B3_AUDIT_R2.md`): 1×P0, 2×P2, 1×P3.
Verdict was NOT CLEAN. All findings fixed.

---

## P0 — Write-set violation / stale branch (RESOLVED)

**Finding:** B3 was built off backend main `19e51b0`. The required merge target
had advanced to `9a8e210b`, which now contains three already-landed PRs:

- `9a8e210` H5 — hoist meal-plans coach guard stacks to class-level (#337)
- `a84a69e` B2 — sub-coach attach guard + display-order compaction/swap (#344)
- `bedb2f4` B4 — atomic duplicate-alert dedup in drip dispatcher (#339)

Because the branch was based on the old `19e51b0`, its diff against `9a8e210b`
appeared to revert those PRs' files (drip-dispatcher, package-contents,
real-meal-plans + their tests). Merging the pinned SHA would have regressed
duplicate-alert dedup, sub-coach IDOR/ordering protection, and the guard-contract
test — exactly the P0 the auditor flagged.

### Resolution method: REBASE (not cherry-pick)

`git rebase origin/main` — chosen because the B3 write-set
(`landing-pages.public.controller.ts`, `landing-pages.public.service.ts`,
`main.ts`, `test/landing-pages.public.controller.spec.ts`) is **completely
disjoint** from the files touched by H5/B2/B4 (packages/drip-dispatcher/
real-meal-plans). `main.ts` is touched only by B3, not by the other PRs.

**The rebase was conflict-free.** B3's two commits replayed cleanly onto
`9a8e210b`. After rebase, the branch diff vs `origin/main` contains **ONLY**
the B3 files — the package/drip-dispatcher/real-meal-plan files no longer
appear in the diff at all, because they are now part of the branch's base.

### Protections preserved (verified in code + tests, all green)

- **B4 — atomic duplicate-alert dedup** (`drip-dispatcher.cron.ts`): claim-
  before-send via `updateMany({ where:{ id, alert_dispatched_at: null }, data:{
  alert_dispatched_at: now } })` at the TOP of `dispatchBuyerAlert`; no post-send
  snapshot stamping. Present and intact.
- **B2 — sub-coach attach guard + display-order swap/compaction**
  (`package-contents.service.ts` / `.controller.ts`): per-package advisory-lock
  serialized display_order, atomic reorder/swap. Present and intact.
- **H5 — meal-plans class-level guard hoist** (`real-meal-plans.controller.ts`
  + `test/real-meal-plans-guards.spec.ts`): guard contract test present (not
  deleted). Present and intact.

Final `git diff --stat origin/main HEAD`:
```
src/landing-pages/landing-pages.public.controller.ts | 368 ++++--
src/landing-pages/landing-pages.public.service.ts    |  39 +
src/landing-pages/public-route-prefix.ts             |  37 +   (new, P2 fix)
src/main.ts                                          |  19 +-
test/landing-pages.public.controller.spec.ts         | 475 ++++
```

---

## P2 #1 — No observability in the Host dispatcher (FIXED)

Added bounded, structured routing-decision telemetry in
`resolvePageAddress` (`landing-pages.public.controller.ts`). Four fixed,
low-cardinality outcome labels are emitted via a `logDispatch` helper:
`custom_domain_match`, `canonical_host_skip`, `invalid_host_reject`,
`unknown_host_404`. Reject/skip/unknown branches log only `host_len` (no raw,
attacker-controllable Host string — prevents log-injection and cardinality
blow-up); only the verified-match branch logs the (DB-backed) normalized host.

## P2 #2 — Route-registration test copied the exclude list (FIXED)

Extracted the landing-pages prefix exclusions into a new shared module
`src/landing-pages/public-route-prefix.ts` exporting
`LANDING_PUBLIC_PREFIX_EXCLUDE`. Both `main.ts` and the route-registration spec
now import this single source of truth, so the test boots against the EXACT
production exclude list and can no longer drift. Removed the now-unused
`RequestMethod` import from `main.ts`.

## P3 — Unused `svc` in throttle test (FIXED)

`test/landing-pages.public.controller.spec.ts` throttle-preservation test now
destructures only `{ ctrl }`. Lint is clean (0 errors, 0 warnings).

---

## Verification (run in worktree at new SHA `0e94a6b`)

- **Typecheck:** `NODE_OPTIONS='--max-old-space-size=3072' npx tsc --noEmit
  --pretty false` → **exit 0**.
- **Lint:** `npx eslint src/main.ts src/landing-pages/public-route-prefix.ts
  landing-pages.public.controller.ts landing-pages.public.service.ts
  test/landing-pages.public.controller.spec.ts` → **exit 0, 0 warnings** (the
  prior unused-var warning is gone).
- **Tests (B3):** `npx jest test/landing-pages --runInBand` → **12 suites /
  262 tests pass**.
- **Tests (preserved protections):** `npx jest test/drip-dispatcher.cron.spec.ts
  test/package-contents.service.spec.ts test/real-meal-plans-guards.spec.ts
  --runInBand` → **3 suites / 105 tests pass** (confirms B4/B2/H5 work is intact
  on the rebased branch).

## Push

Force-pushed with `--force-with-lease`: `683c952 → 0e94a6b` on
`origin/pr18/b3-custom-domain-host` (PR #342 head). Author `Dynasia G
<dynasia@trygrowthproject.com>`, no trailers.
