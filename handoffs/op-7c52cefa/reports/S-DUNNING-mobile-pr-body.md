## Summary

- A client whose payment has gone unpaid for 10 days (backend `403 { code: 'LOCKED_DUNNING' }`) now sees one calm full-screen state. It explains what happened, shows the amount, and gives a working way back: Update card, message the coach, download data, delete the account, email support with a request reference, or sign out. This replaces scattered per-screen errors.
- On Days 0-9 an inline (not floating) banner on Home and Plans shows the amount, the failure date and the lock date, with Update card and Message coach.
- Invisible while the backend flag `FEATURE_DUNNING_V2` is off: the status route returns `enabled: false`, and no 403 `LOCKED_DUNNING` is ever sent.

## Tier header

- **Tier:** T4
- **Why:** This decides what a locked, paying client can reach and how they pay. It changes the global axios response interceptor and the paywall sheet's visibility.
- **T4 trigger scan:** payments/access (Stripe portal path, lockout gate), global API interceptor — yes. No auth/refresh path change (the new branch returns before the 401 logic). No package.json or lockfile change.
- **T3 trigger scan:** new backend read `GET /v1/checkout/dunning` (backend PR #628). `RootNavigator` wraps `ClientNavigator` in a provider.
- **Bounded T1:** README updates, test-only mock additions in `rootNavigatorPackagePromptGate.test.tsx`.
- **Builder-owner:** S-DUNNING builder lane. Needs an independent T4 audit (builders never audit their own change).
- **Acceptance evidence:** `src/entitlements/dunning/__tests__/dunningLockout.test.tsx` (20 tests: one lockout state, reachable screens step aside and return, each action routes, Update card opens only a Stripe URL and unlocks after payment, non-Stripe URL refused and reported, banner Days 0-9, banner hidden with the flag off, copy has no exclamation mark, specific error copy per code with reference) and `src/services/__tests__/api.lockedDunning.test.ts` (interceptor).
- **Promotion triggers:** backend #628 merged and deployed first. Independent T4 audit, green CI, then on-device smoke on a test client locked in Stripe test mode before the backend flag flip.

## Fix round

| Finding | Change | Commit | Test |
|---|---|---|---|
| M1: no handling of 403 `LOCKED_DUNNING`; every screen showed its own raw error | Interceptor reports to `dunningLockoutStore` with the request id and sets a specific message | 7ad8a8f | api.lockedDunning.test.ts |
| M2: no lockout state | `DunningLockoutProvider` + `DunningLockoutScreen` around `ClientNavigator`. Android back is held while it shows | 7ad8a8f | "shows one full-screen lockout" |
| M3: reachable screens (data export, account deletion, coach thread) | Overlay steps aside on `DataExport`, `DeleteAccount`, `Messages`, the same set the backend allow-lists | 7ad8a8f | "steps aside ... and returns after", "routes to ..." |
| M4: Update card | `POST /v1/checkout/billing-portal` → `assertStripeUrl` → `WebBrowser.openAuthSessionAsync(url, 'com.growthproject.app://')` → status refresh. Unlocks when the backend reports clear | 7ad8a8f | "Update card opens the Stripe portal, then unlocks", "refuses a non-Stripe portal URL" |
| M5: Days 0-9 banner never rendered (`getPaymentStatus().dunning` hard-null) | New `DunningBanner` fed by `GET /v1/checkout/dunning` on Home and Plans | 7ad8a8f | banner tests |
| M6: paywall sheet could stack on the lockout | `PaywallSheet visible={paywallVisible && !dunningLocked}` | 7ad8a8f | rootNavigator gate suite |
| M7: generic errors | `describeDunningError`: offline / rate limited / no billing account / Stripe unavailable / link rejected / session ended. Unknown → reference + support address + Sentry | 7ad8a8f | "specific error copy" `it.each` |
| M8: status 404 before backend #628 deploys would page Sentry on every launch | 404 on the status read maps to `STATUS_NOT_AVAILABLE`, not reported | 2d77399 | "a 404 status read ... not reported" |

## Recovery caveat (owner decision)

Stripe does not charge the open invoice just because the card was updated in the portal. Retries "only execute after detecting a new payment method", and after the last retry (Day 7) none remain. The lockout copy therefore tells the client to pay the open invoice under Invoice history, which needs the portal's invoice history ON. A backend follow-up could pay the open invoice when `customer.updated` changes the default payment method during a cycle. That is our code charging, so it needs the owner's approval.

## Backend dependencies

- `GET /v1/checkout/dunning` (backend #628). Before #628 deploys it 404s. The provider maps that to STATUS_NOT_AVAILABLE (not reported to Sentry) and shows nothing (no banner, no lockout) unless a 403 `LOCKED_DUNNING` arrives, which cannot happen before #628 plus the flag flip.
- `POST /v1/checkout/billing-portal` (existing).

## Documentation

- New `src/entitlements/dunning/README.md`. Updated `src/navigation/README.md`, `src/services/README.md`, `src/screens/client/README.md`.
- No emoji, no exclamation marks, no TODO/FIXME, no "Coming soon". No floating widget: the banner is inline in the screen and the lockout is a full-screen state.

## Testing

- `npx tsc --noEmit`: clean.
- eslint on changed files: 0 errors. The only warnings are pre-existing ones in `RootNavigator.tsx` and `HomeScreen.tsx`.
- jest: all 374 suites run in targeted `--runInBand` batches and pass. `useWearableInsight.test.tsx` failed once inside a long batch on a timing assertion, then passed alone. That file is unrelated.
- vendor-name guard: passed.
- No package.json or lockfile change.
