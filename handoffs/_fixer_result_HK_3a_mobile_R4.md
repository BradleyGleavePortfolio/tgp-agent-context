# HK-3a Mobile — R4 Fixer Result

**PR:** BradleyGleavePortfolio/growth-project-mobile #224
**Branch:** `hk/PR-HK-3a-fitness-bucket`
**Pin (from) SHA:** `8ce63aaff31ddbe83a1d2b6bdf8da6939294a42f`
**NEW head SHA:** `394b45b81af2666b2a945e953ed07b0f4ac0f3ee`
**Pushed:** yes, `--force-with-lease` (lease = pin SHA). Remote PR #224 head now `394b45b…`.
**Commit author/committer:** `Dynasia G <dynasia@trygrowthproject.com>` — title-only, NO Co-Authored-By, NO Generated-By, empty body. ✅
**Status:** **CLEAN** (both P1s fixed; all gates green; one documented nuance on HK-3b — see below).

---

## Files changed (1 commit, title-only)

`PR-HK-3a: sleep metric enum + clear-pref error surface`

| File | +/- |
|---|---|
| `src/api/wearablesSamplesApi.ts` | +10 / -0 |
| `src/hooks/useWearablePreference.ts` | +15 / -0 |
| `src/hooks/useWearablePreference.test.tsx` | +33 / -2 |
| **Total** | **+56 / -2 (3 files)** |

---

## P1 #1 — HK-3b GATING: sleep-bucket metric keys

**Canonical definition is NOT at the brief's stated path.** The repo's single
source of truth for `WEARABLE_METRIC_TYPES` (const) + `WearableMetricType`
(union) + the Zod `z.enum(...)` is **`src/api/wearablesSamplesApi.ts`** (lines
57–88). There is no `src/wearables/constants/metric-types.ts`. Adding the three
literals to the const map automatically updates all three surfaces at once:
- const map (`WEARABLE_METRIC_TYPES`)
- union type (`WearableMetricType = (typeof WEARABLE_METRIC_TYPES)[number]`)
- Zod schema (`metricSchema = z.enum(WEARABLE_METRIC_TYPES)`)

Added (placed in the Sleep & Recovery section):
```
'SLEEP_DURATION_MIN',
… (existing SLEEP_TOTAL_MIN … SLEEP_EFFICIENCY_PCT) …
'SLEEP_ONSET_ISO',
'SLEEP_WAKE_ISO',
```
Mobile union is now 29 members. The existing API spec's
`canonical enum coverage › the response schema accepts every declared metric
type` test iterates `WEARABLE_METRIC_TYPES` dynamically, so it covers the new
keys with no hardcoded count to update — no separate fixture mirror exists.

**Other `WearableMetricType` definitions (NOT updated — intentional):** three
platform-capability unions in `src/services/health/{healthkit,healthConnect,
samsungHealth}` describe what each *native* device SDK can emit. They are not
mirrors of the backend samples enum and HK-3b does not import them
(HK-3b imports `WearableMetricType` from `wearablesSamplesApi`). Adding
backend-derived ISO sleep metrics there would be incorrect; left untouched.

### ⚠️ Backend source-of-truth discrepancy (DEVIATION — documented)
The brief said to mirror backend file
`src/wearables/constants/wearable-metric-type.enum.ts` at backend SHA
`14aa1454c3dc4ec21260d2ea6025d177e8564184` and that the backend "already" has
these keys. Verified against the actual backend at that exact SHA:
- That file path **does not exist**. The backend `WearableMetricType` is a
  **Prisma enum** in `prisma/schema.prisma` (mirrored at runtime via
  `samples/metric-bucket.map.ts`).
- The pinned SHA is the **current head of backend PR #356** (`hk/PR-HK-3a-
  fitness-bucket`, open, not merged) and its diff does **not** touch the schema.
- The backend enum at that SHA contains `SLEEP_TOTAL_MIN … SLEEP_EFFICIENCY_PCT`
  but **NOT** `SLEEP_DURATION_MIN` / `SLEEP_ONSET_ISO` / `SLEEP_WAKE_ISO`.

**Resolution:** the functional requirement is unambiguous — HK-3b PR #223
(`recoveryData.ts` sleep deficit + consistency) imports/uses these three keys
through the mobile `WearableMetricType`, and the brief explicitly instructs
adding exactly these three. I added them and updated the doc-comment to note
that the backend enum add ships in the same PR-HK-3a coordination line. **There
is a forward enum drift vs the backend's *current* pinned SHA** (mobile leads
backend by these 3 keys); the backend must add the matching Prisma enum values
before these metrics flow on the wire. Flagging for the parent agent.

## P1 #2 — `useWearablePreference` clear-pref error surface

File: `src/hooks/useWearablePreference.ts` (note: actual path is `src/hooks/…`,
not `src/wearables/hooks/…`).

- `BoundPreference` interface now declares `readonly isError: boolean` and
  `readonly error: Error | null`.
- The bound return now exposes:
  - `isError: mutation.isError || clearMutation.isError`
  - `error: clearMutation.error ?? mutation.error ?? null`
  (covers BOTH the set and clear overloads; correctly typed `Error | null`,
  no `as any`).
- Default `onError` behavior unchanged: the clear factory's `onError` still
  `logger.error(...)`s, and because `opts.onError` is wired as a **per-call**
  React Query `onError` it runs **additively** — it never replaces the
  mutation-level handler nor consumes the observable `error`/`isError` state.

**Test added** (`useWearablePreference.test.tsx`), title:
`clear with a caller onError still reflects isError and error on the bound return`
- Mocks `clearPreference` to reject, passes a caller `onError` spy via
  `mutate(null, { onError })`.
- Asserts: spy called **once** with the error, **AND** `result.current.isError
  === true`, **AND** `result.current.error === boom` (and `.message`).
- Also cleaned the pre-existing sibling test title that contained the banned
  phrase "failing silently" → now "…so the caller is notified" (R0 ban applies
  to test titles; was in the touched file).

## P3 polish — DEFERRED
RingProgress (STROKE/GAP) and LinkUnderline are NOT among the scope files
(`metric-types`/hook/tests). The brief said normalize only if already in the
ring file for another reason; I was not, so deferred per instruction. No P3
edits made.

---

## Gates (run in `/tmp/wt-hk3a-mobile-r4`, node 20.20.1, reused node_modules)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | ✅ PASS (exit 0) |
| `npx eslint .` | ⚠️ 7 errors — ALL pre-existing `no-var-requires` in `metro.config.js` + `scripts/*.js` (untouched, outside `src/`); identical with my changes reverted. My 3 files: 0 problems. |
| `npm run lint` (CI lint = `eslint "src/**/*.{ts,tsx}" --max-warnings=99999`) | ✅ PASS (exit 0; 0 errors, 78 pre-existing warnings in untouched files) |
| `npx jest --runInBand` | ✅ PASS — 181 suites / **1995** tests / 4 snapshots (was 1994; +1 my new test) |
| `npx expo prebuild --platform ios --clean` | ✅ PASS (Finished prebuild) |
| `npx expo prebuild --platform android --clean` | ✅ PASS (Finished prebuild) |
| `rm -rf ios android` + `git checkout package.json` | ✅ done — worktree clean except the 3 intended files |

**ESLint `.` note:** the brief lists `npx eslint .`. The repo's CI gate is
`npm run lint`, which scopes to `src/` and passes cleanly. The 7 `eslint .`
errors are config/build-script `require()` statements that predate this PR and
are out of its scope; this matches the R3 fixer result's identical finding. Not
introduced by R4.

---

## HK-3b local TS verification (rebased onto new mobile head, then discarded)

Procedure: fresh throwaway worktree at HK-3b head `fb96d0d`, `git rebase
394b45b…` (new mobile head). One rebase conflict in
`src/screens/coach/client-detail/types.ts` — a `TabKey` union merge
(HK-3a added `'healthFitness'`, HK-3b added `'sleepRecovery'`); resolved to
include BOTH (the natural integration merge). Then `npx tsc --noEmit`.

**The 3 missing imports now resolve. ✅** Differential proof:
- **Before fix** (enum without the 3 keys): **49** TS errors, including **8
  sleep-key errors** — 3 in production `src/screens/client/wearables/
  recoveryData.ts` (lines 133/201/202: `latestValue(data,'SLEEP_DURATION_MIN')`,
  `seriesFor(data,'SLEEP_ONSET_ISO')`, `seriesFor(data,'SLEEP_WAKE_ISO')`) plus
  5 in HK-3b sleep test fixtures — e.g. `Type '"SLEEP_DURATION_MIN"' is not
  assignable to … WearableMetricType` (and a `TS2820` "Did you mean
  'SLEEP_AWAKE_MIN'?" near-miss on `SLEEP_WAKE_ISO`).
- **After fix:** all **8 sleep-key errors gone**; **zero errors in production
  `recoveryData.ts`**. The 3 imports the brief referenced (manifesting at 8
  sites) are fully resolved.

**Nuance — HK-3b does NOT fully `tsc`-clean (out of HK-3a scope):** 41 errors
remain, all confined to **HK-3b's own files** and unrelated to the enum:
- 40× `TS2322` in HK-3b spec fixtures (`recoveryData.test.ts`,
  `SleepRecoveryScreen.test.tsx`, `SleepRecoveryTab.test.tsx`): a HK-3b test
  helper builds samples with `provider: string`, which doesn't narrow to the
  `WearableProvider` union (a HK-3b test-typing bug).
- 2× in `cards/HrvTrendCard.tsx` + 1× `TS7006`: `GlowChartPoint.label` is
  required but a chart point omits it (HK-3b chart typing).

These are HK-3b PR #223's own pre-existing work items; HK-3a's job was to make
the sleep-metric imports resolve, which it does. **HK-3b was NOT pushed** — the
verification worktree was discarded and HK-3b's remote head is unchanged
(`fb96d0d6ae15e97760fe9d412cfbf7177d6afda9`). Recommend the parent route the
remaining HK-3b typing fixes to the HK-3b fixer.

---

## R65 50-Failures sweep

- **#36 silent failures (the P1 #2 fix):** clear-pref now surfaces `isError` +
  `error` on the bound return; `opts.onError` is additive and never suppresses
  state; default path still `logger.error`s. ✅
- **Other hooks eating errors:** reviewed the wearables surface —
  `wearablesSamplesApi.getSamples` re-throws typed `WearableSamplesError`
  (never swallows; preserves `cause`), Zod drift propagates verbatim. No hook in
  the touched area consumes errors without surfacing. ✅
- **Enum mirror drift vs backend:** zero drift among the **mobile** surfaces
  (const/union/Zod all derive from one const). NOTE: forward drift vs the
  backend's *current* pinned SHA — backend lacks these 3 keys (see P1 #1
  deviation). Documented, not a code defect in this PR. ⚠️ (flagged)
- **`as any` / `@ts-ignore` / `@ts-nocheck`:** none in added lines (the single
  `as any` substring is inside an explanatory doc comment that *forbids* it). ✅
- **`catch(e){}` / `.catch(()=>undefined)`:** none. ✅
- **"Coming soon" / "TODO: implement":** none. ✅
- **Banned phrases in test titles:** none; also fixed a pre-existing sibling
  title containing "failing silently". ✅
- **a11y labels / testIDs:** untouched by this change (type/hook only). Stable. ✅

---

## Deviations summary
1. **Path corrections:** enum lives in `src/api/wearablesSamplesApi.ts` (not
   `src/wearables/constants/metric-types.ts`); hook lives in
   `src/hooks/useWearablePreference.ts` (not `src/wearables/hooks/…`). Brief
   paths did not exist; fixed the real files.
2. **Backend source-of-truth:** brief's backend file path/enum-state does not
   match the backend at the pinned SHA (the 3 keys are absent there; it's a
   Prisma enum). Added the keys per the functional requirement; mobile now leads
   backend by 3 keys — backend Prisma enum add still required.
3. **HK-3b** does not fully `tsc`-clean after rebase due to its OWN pre-existing
   errors (provider-union test helpers + GlowChartPoint.label); the 3 sleep-key
   imports DO resolve. Not pushed; worktree discarded.
4. **`eslint .`** shows 7 pre-existing config/script errors outside `src/`; CI
   `npm run lint` passes. Not introduced here.
5. **P3 polish deferred** (not in scope files).
