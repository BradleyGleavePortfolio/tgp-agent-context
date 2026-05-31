# PR-18 / M1 FIX NOTE — R3 audit remediation (wave 3) — Dynasia G

**Repo:** `growth-project-mobile` (RN/Expo SDK 56, App Store id6765847915)
**Branch:** `pr18/m1-mobile-commerce-polish`
**PR:** #217
**Base SHA (audited, R3):** `ed1e4611df91d7d966f794183ca8b1e0e5d82857`
**New HEAD SHA:** `dab2dd67760d03d75fb248f7e367c7f4f4f217b6`
**Rebase base:** `origin/main` `6b6f8206cd3b9785e752530430c64ac10ccae9be` (branch
already sat directly on this commit — `git rebase origin/main` was a no-op,
verified `6b6f820` is an ancestor of HEAD).
**Author:** `Dynasia G <dynasia@trygrowthproject.com>` (no trailers)

The R3 audit (`audits/PR18_wave/M1_AUDIT_R3.md`) returned **NOT CLEAN** on three
P2 findings (zero P0/P1). All three are fixed on this branch within the M1
write-set, with real tooling green:

- **Typecheck:** `npx tsc --noEmit` → exit 0 (clean). The R3 auditor's tsc
  result was inconclusive purely for environmental reasons (`npm ci` was killed
  by the harness, leaving missing dependency type files); against a complete
  dependency tree there are no type errors.
- **Lint:** `npm run lint -- --quiet` → exit 0 (clean).
- **Tests:** the 12 M1-touched / audit-flagged suites pass (268/268). Full
  `npx jest --runInBand --silent` → **149 suites / 1688 tests pass, 1 suite / 1
  test fails**, down from the R3 baseline of 3 suites / 21 failing. The single
  remaining failure is a pre-existing, out-of-scope issue documented below.

## Findings addressed

### P2 (1/3) — lint gate red on an unconfigured `import/first` disable
`src/__tests__/rootNavigatorCheckoutLink.test.tsx:44`, `.eslintrc.js:25-33`

The checkout-link regression test placed its `import { linking }` after the
`jest.mock()` block (correct — jest hoists the mocks) and silenced the apparent
import-order with `// eslint-disable-line import/first`. But this repo does not
install or configure `eslint-plugin-import`, so ESLint emitted
`Definition for rule 'import/first' was not found` and `eslint --quiet` exited
non-zero, making the claimed lint gate red.

**Fix:** removed the unknown-rule disable directive and replaced it with a plain
explanatory comment. There is no installed rule that would flag the deliberate
post-mock import, so removal is safe and the directive was the sole cause of the
red gate. `npm run lint -- --quiet` now exits 0.

### P2 (2/3) — semantic-token migration left two legacy theme mocks stale
`src/__tests__/purchaseUnpackScreen.test.tsx:267-294`,
`src/__tests__/Day1WinScreen.test.tsx:88-108`

`PurchaseUnpackScreen` and `PackageSelectionSheet` were migrated to semantic
tokens and now destructure `semanticColors` and `tokens` from `useTheme()`. Two
legacy suites still mocked only `colors`: `purchaseUnpackScreen.test.tsx`
(mounts `PurchaseUnpackScreen`) and `Day1WinScreen.test.tsx` (mounts the
package-selection sheet path). With `semanticColors`/`tokens` undefined, both
suites threw on mount under the full `npx jest` run.

**Fix:** rewired both `useTheme` mocks to the repo's canonical real-tokens
pattern (mirrors `PackageDetailSurface.preview.test.tsx`):
`const realTokens = jest.requireActual('../theme/tokens').default;` then
`tokens: realTokens`, `semanticColors: realTokens.lightTokens`, plus
`colorScheme: 'light'`. Sourcing from the real token module guarantees a
complete theme surface and prevents this drift from recurring on future token
additions. The existing `colors` blocks (and the `streak` entry Day1Win relies
on) were preserved. Both suites now pass — `purchaseUnpackScreen.test.tsx` and
`Day1WinScreen.test.tsx` are green under the full suite.

### P2 (3/3) — checkout peak-end eyebrow used `fontWeight: '700'` (doctrine)
`src/screens/client/CheckoutReturnScreen.tsx:419`,
`src/__tests__/quietLuxuryDoctrine.test.ts:65-74`

The R2 peak-end success rework set `successEyebrow.fontWeight = '700'`, which
trips the repo's quiet-luxury doctrine gate (no `700`/`800` weights in shipped
screens/components) and is a heavier "shouting" treatment than the mobile design
bible's restrained-luxury bar — premium should read through hierarchy, timing,
and calm motion, not weight.

**Fix:** lowered the eyebrow to `fontWeight: '600'`. The eyebrow already carries
its hierarchy through `letterSpacing: 1.2`, `textTransform: 'uppercase'`, and
the forest accent color, so 600 keeps the label legible and premium without a
heavy weight. No allowlist entry was added — the doctrine module explicitly says
to fix the file rather than allowlist it. The doctrine `fontWeight 700/800`
assertion now passes.

## Out-of-M1-scope note — remaining doctrine failure (NOT introduced here)

After the fixes, `quietLuxuryDoctrine.test.ts` still fails on one assertion —
the TODO/FIXME/XXX scan flags
`src/screens/coach/payments/contents/ContentAttachForm.tsx:476`
(`TODO(M4): swap this for the rich date picker`). This is **not** an M1 finding:

- The file is **outside the M1 write-set** — it is not in
  `git diff 6b6f820..dab2dd6` and was not touched by this branch.
- The TODO is **pre-existing on the rebase base** `6b6f820` (verified via
  `git show 6b6f820:.../ContentAttachForm.tsx`), i.e. it lives on `main` and is
  owned by the M4 workstream.
- The R3 audit did not flag it; the audit attributed the doctrine-suite failure
  solely to the `700` eyebrow weight, which is now fixed.

Per `specs/AUDITOR_BRIEF_COMMON.md`, fixes are scoped narrowly to the M1
write-set. Touching an M4-owned file (or weakening the doctrine test) to clear a
pre-existing `main` failure would be an out-of-scope deviation, so it is left to
the M4 owner. It is called out here for visibility.

## Verification commands

```
git rebase origin/main                 # no-op; 6b6f820 already ancestor of HEAD
npx tsc --noEmit                        # exit 0
npm run lint -- --quiet                 # exit 0
npx jest <12 M1/flagged suites> --runInBand   # 12 suites / 268 tests pass
npx jest --runInBand --silent           # 149 suites / 1688 pass; 1 pre-existing
                                        #   out-of-scope doctrine TODO failure
```

(Dependencies were sourced from the verified-good main clone's `node_modules`,
which carries an identical `package.json`, so all three gates ran against a
complete tree.)

## Files changed (4, all within M1 write-set)

- `src/screens/client/CheckoutReturnScreen.tsx` — eyebrow weight 700 → 600
- `src/__tests__/rootNavigatorCheckoutLink.test.tsx` — drop unconfigured
  `import/first` disable
- `src/__tests__/purchaseUnpackScreen.test.tsx` — real-tokens theme mock
- `src/__tests__/Day1WinScreen.test.tsx` — real-tokens theme mock
