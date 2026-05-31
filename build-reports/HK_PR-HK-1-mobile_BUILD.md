# PR-HK-1-mobile — Build Report

**PR:** [#219](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/219) — `PR-HK-1-mobile: wearable connections hub UI`
**Branch:** `hk/PR-HK-1-mobile`
**Base:** `main` @ `90c033dfe74e8ce35e76398703b8a09dc8d42d0f` (PR-HK-CFG #218 merged)
**Head SHA (remote):** `f7b544e74ea7240bda0c7e7d854a3649bb68d15b`
**Author (all commits):** `Dynasia G <dynasia@trygrowthproject.com>` — empty commit bodies, no trailers, no co-authors.

## Scope
Mobile Connections Hub UI, the client-side follow-up to PR-HK-1-backend (#349, merged) and PR-HK-CFG (#218, merged, which installed `react-native-health` + `react-native-health-connect` and owns native config). Provides: a zod-validated wearables connections API client, a React Query hook layer, a flat Connections Hub screen listing all 15 providers with per-row status/freshness/action, a connect bottom-sheet that explains data shared and launches the OAuth web flow, and a single additive screen registration in the client navigator. No existing screen, existing API client, `app.json`, or `package.json` was touched.

## Commits
1. `915de22` — feat(wearables): PR-HK-1-mobile — connections API client + hook
2. `2ed8b0a` — feat(wearables): PR-HK-1-mobile — Connections Hub screen + connect sheet + nav registration
3. `f7b544e` — test(wearables): PR-HK-1-mobile — connections API + hook + screen tests

## Write-Set (line counts)
| File | Lines | Kind |
|---|---|---|
| `src/api/wearablesConnectionsApi.ts` | 359 | new |
| `src/api/wearablesConnectionsApi.test.ts` | 205 | new (test) |
| `src/hooks/useWearableConnections.ts` | 88 | new |
| `src/hooks/useWearableConnections.test.tsx` | 134 | new (test) |
| `src/screens/client/wearables/ConnectionsScreen.tsx` | 481 | new |
| `src/screens/client/wearables/ConnectProviderSheet.tsx` | 307 | new |
| `src/screens/client/wearables/__tests__/ConnectionsScreen.test.tsx` | 194 | new (test) |
| `src/navigation/ClientNavigator.tsx` | +8 | **edit** (additive screen registration) |
| **Total** | **1776** insertions | |

The diff against base contains exactly these 8 files and nothing else (Gate ⑤).

## Backend Contract Consumed (verified by reading backend source)
Read `connections.controller.ts`, `connections.service.ts`, `types.ts`, and the connect/callback DTOs in `growth-project-backend` to establish the binding contract:
- `GET /v1/wearables/connections` → `SafeWearableConnection[]` — snake_case fields (`id`, `user_id`, `provider`, `external_account_id`, `access_token_expires_at`, `scopes[]`, `webhook_subscription_id`, `channel_expires_at`, `status`, `last_error`, `last_synced_at`, `backfilled_until`, `disconnected_at`, `created_at`, `updated_at`). All date fields are ISO strings; no `encrypted_*` / `secret_ref` columns are ever present (the backend `SAFE_CONNECTION_SELECT` strips them).
- `POST /v1/wearables/connections/oauth/start` body `{ provider }` → `{ authorizationUrl, state }`. On-device providers (`APPLE_HEALTHKIT`, `HEALTH_CONNECT`, `SAMSUNG_HEALTH`) are rejected with **400** — there is no OAuth flow and no `requiresNativePermission` field on the contract (the task description's field was approximate; the client follows the real backend).
- `GET /v1/wearables/connections/oauth/callback?code&state` is **server-side** — the provider redirects there with the JWT carried in the web view. Mobile does **not** call it; it opens `authorizationUrl` via `expo-web-browser` and then re-fetches the list.
- `DELETE /v1/wearables/connections/:provider` → `{ success: true, provider }` (soft-disconnect).
- `WearableProvider` enum (15): APPLE_HEALTHKIT, HEALTH_CONNECT, GARMIN, FITBIT, STRAVA, POLAR, SAMSUNG_HEALTH, WAHOO, WITHINGS, PELOTON, MYFITNESSPAL, OURA, WHOOP, EIGHT_SLEEP, BEDDIT. Status enum: connected / expired / error / disconnected.

## Data Layer — Decisions & Justification
- **React Query** with cache key `['wearable-connections']` (`useQuery` for the list; mutations for start/disconnect). `useDisconnectProvider` invalidates the list on success; `useStartOauth` does not invalidate (the list re-fetch happens after the web flow returns). This matches the existing `useMealTemplates` mutation+invalidate convention in the repo.
- **zod** validation on every response. `SafeWearableConnection` is parsed with an array schema; parse failures surface as errors (covered by parse-failure tests). zod (^3.25.x) is present in `package-lock.json` and importable/tsc-clean even though it is not listed in `package.json` `dependencies`; per the collision rules PR-HK-CFG owns `package.json`, so this PR does not add it there.
- **`PROVIDER_CONFIG` map** in the API client holds per-provider `displayName`, `icon`, `dataDescription` (shown in the connect sheet), and metric `buckets`. `isOnDeviceProvider` / `providerAuthModel` helpers drive the on-device stub branch.

## On-Device Providers
`APPLE_HEALTHKIT`, `HEALTH_CONNECT`, `SAMSUNG_HEALTH` render as normal rows with working status badges, but their connect path is stubbed: the sheet shows an "On-device permissions required — coming soon" banner with a disabled Continue CTA and a `// TODO PR-HK-2.a/b/c` marker. The native permission flows arrive in PR-HK-2.a/b/c.

## Layout
The Connections Hub is a **flat** `FlatList` of all 15 providers (no segmented switcher — that lives only on the Health tabs and is PR-HK-3a/3b). Rows are tiered (connected first, then error/expired, then disconnected) and alphabetical within a tier for stable ordering.

## Accessibility
Every interactive element exposes `accessibilityLabel` + `accessibilityRole`. Each row carries a combined `"<Provider>, <status>[, last synced <relative>]"` label; the brand glyph is marked `importantForAccessibility="no"` (decorative, conveyed via the row label). Loading state is labelled `"Loading your connections"`; the error state exposes a `"Retry loading connections"` button.

## Tests
- **Total: 27 passed / 27** across **3 suites**.
- `wearablesConnectionsApi.test.ts` — **14**: mocks `../services/api`; every endpoint asserts URL + method + payload, plus zod parse-success and parse-failure.
- `useWearableConnections.test.tsx` — **4**: React Query wrapper; happy + error paths for the list query and the disconnect mutation.
- `ConnectionsScreen.test.tsx` — **9**: mocks the safe-area context, `../ConnectProviderSheet` (captures props), and the hook; renders a row for every catalog provider, asserts the correct badge per status (connected / expired / error / disconnected) and the matching action label, the relative sync chip, opens the sheet with the tapped provider on Connect, and calls the disconnect mutation on Disconnect; loading + error-with-retry states.

Jest is memory-heavy in this repo; `.tsx` suites are run individually with `node --max-old-space-size=4096 node_modules/.bin/jest <file> --runInBand --workerIdleMemoryLimit=1GB` (a multi-file `npx jest` invocation gets OOM-killed). The "worker failed to exit gracefully" notice is benign.

## Gates (all passing)
| Gate | Command | Result |
|---|---|---|
| ① tsc | `npx tsc --noEmit` | 0 errors |
| ② eslint | `npx eslint <write-set>` (8 files) | clean (exit 0) |
| ③ jest | per-file `jest` over the 3 test files | 27/27 pass |
| ④ snapshot review | manual review of rendered list / badges | OK |
| ⑤ diff | `git diff --stat origin/main..HEAD` | write-set only (8 files: 4 source + 1 additive nav edit + 3 tests) |

## Deviations & Justifications
1. **Bottom sheet uses React Native's `Modal`, not `@gorhom/bottom-sheet`.** That dependency is not installed and adding it would require editing `package.json` (owned by PR-HK-CFG). A `Modal`-based sheet meets the design bar (data-shared explanation + Continue) without a new dependency.
2. **OAuth launch via `expo-web-browser` `openAuthSessionAsync`** with return URL `tgp://wearables/connected` (the app's deep-link scheme). The backend callback is server-side, so the client only needs to open the authorization URL and re-fetch on return; it never calls the callback endpoint.
3. **`FlatList` rendered with `initialNumToRender`/`windowSize` set to the catalog size and `removeClippedSubviews={false}`.** The catalog is a small, fixed 15-item set, so eager rendering avoids virtualization windowing (which otherwise hid lower rows from the test render tree) at negligible cost.
4. **Contract differs from the task description** in two places — there is no `requiresNativePermission` field (on-device providers are rejected with 400) and the callback is server-side. The client follows the real backend source, verified by reading the controller/service.
5. **zod is consumed but not added to `package.json`** — see Data Layer note above; `package.json` is owned by PR-HK-CFG.

## Out of Scope
- Segmented Health/Connections switcher → PR-HK-3a / PR-HK-3b (Health tabs only).
- On-device permission flows → PR-HK-2.a (HealthKit) / PR-HK-2.b (Health Connect) / PR-HK-2.c (Samsung Health).
