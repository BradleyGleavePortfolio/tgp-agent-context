**Tier:** T3 (privacy copy, mobile only)
**Why:** FW-ACCOUNT-128 row FWA-TRUST-128 (U2, U3, U4, the Trust Center part of U5 and U10) plus the FW-COACH note (FW-ACCOUNT-128.md:109). Trust & Privacy told clients with no coach, coaches, and clients who turned sharing off that their coach sees their logs. It also showed an invented "Last security update" date and an "Audit policy Version v1.0" row, had no Terms of Service link after sign-up, and pointed to a Settings row ("Privacy") that does not exist.
**T4 trigger scan:** none. No auth, tenancy/RLS, money, credentials or destructive data, and no change to who can read what. Adds one read-only `GET /consent/me` (already used by Coach sharing and Profile), for client accounts only. Removes the unauthenticated `GET /system/trust-meta`.
**T3 trigger scan:** privacy copy on a screen shared by clients and coaches. Every variant is unit-tested and rendered.
**Bounded T1:** n/a
**Canonical builder:** TRUST-COPY-131 (Claude Opus 5.5), agent 131
**Parent owner:** operator agent 131
**Acceptance evidence:** failing-first: the new `src/screens/__tests__/trustCenterTruth.test.tsx` run on main 868a629c gives 19 of 19 failed. The render tests fail on their assertions: "Last security update" is shown, there is no `trust-link-terms`, the alert says "Open Privacy in Settings", and the screen reads `GET /system/trust-meta` instead of `/consent/me`. On this head: 19 of 19 pass, `trustCenterPolicyLinks.test.tsx` 28 of 28, `privacyDataLook.test.tsx` 12 of 12, and eslint is clean on the changed files. CI runs the full suite.
**Promotion triggers:** none. A server change to who can read consultation answers, device data or the four logs would need this copy rewritten.

## What changes for clients and coaches
- **A client with a coach** sees one "Your coach" line built from their real Coach sharing switches. It says what the coach sees whatever the switches say (consultation answers, data from connected devices), then which logs are on (for example "workouts and food logs"), or that every switch is off. When `owner_access` is true, the line says the coach uses the TGP owner account, which sees the logs even when they are off. When the server does not report `owner_access`, or the switches fail to load, a conditional sentence says the same thing.
- **A client with no coach (the server answers 400) and every coach account** see no coach line, and the Roman line no longer says "Not your coach" to someone without a coach. Coach accounts never call `/consent`, which only accepts student accounts.
- **The "What you can do" info row** that told everyone "Your answers and logs are shared with your coach" is removed. Its facts now sit, by state, in the bullets.
- **Security status** keeps only the encryption line. The invented "Last security update" date (a fixed date in April 2026), "Audit policy Version v1.0", the canned offline values and the trust-meta read are all removed.
- **Terms of Service** is now linked in the footer (`TERMS_URL`, which returns 200).
- **The export alert** says "Open My data in Settings", the row name in both client and coach Settings.

What the copy rests on (backend main 652b07a8, production): `onboarding.service.ts` `canCoachRead` lets the coach read consultation answers on the coach link alone. `coachSharingCopy.devicesNote` says connected-device data is outside the switches. `consent.controller.ts` is `@Roles('student')` and returns 400 when there is no coach. `consent.service.ts` `myConsentView` returns `owner_access` when the coach is the owner account. Check-ins are covered by the "Check-ins and habits" switch (`check-ins.service.ts`).

## FW-ACCOUNT-128 items: main vs this PR
| Item | Main 868a629c | This PR |
|---|---|---|
| U2: the "Who can see your data" coach line ignores state | still wrong (`TrustCenterScreen.tsx:532` fixed text, `:475` info row) | fixed |
| FW-COACH: the coach line ignores Coach sharing | still wrong | fixed |
| U3: invented security facts | still wrong (`:445-459` rows, `:341-348` canned fallback) | fixed |
| U4: Terms of Service not reachable after sign-up | still wrong (`trustCenterLinks.ts` has 3 links) | fixed |
| U5 (Trust part): alert says "Open Privacy in Settings" | still wrong (`:360`) | fixed |
| U10 (Trust part): "Security Status" / "What You Can Do" / "Full Transparency" / "Export Requested" | **already fixed on main** (DES-BB-127, 865c1584): "Security status", "What you can do", "Full transparency", "Export requested" | no change |

## Routes/actions before -> after
| Label | Before | After |
|---|---|---|
| Go back | `goBack()` | unchanged |
| Request data export | `dataExportApi.requestExport()` + alert | unchanged (the alert names My data) |
| Delete account | `navigate('DeleteAccount')` | unchanged |
| Privacy Policy | opens `PRIVACY_POLICY_URL` | unchanged |
| Consumer Health Data Privacy Policy | opens `CONSUMER_HEALTH_POLICY_URL` | unchanged |
| Terms of Service | did not exist | **new**: opens `TERMS_URL` |
| Visit the help centre | opens `helpUrl()` | unchanged |
| Info row "Your answers and logs are shared with your coach..." | text, no action | removed under rule 1: untrue with no coach, for coaches and with sharing off. Facts kept in the bullets |
| "Last security update" / "Audit policy" rows | text, no action | removed under rule 1: invented |

Parity is proved in `privacyDataLook.test.tsx`: back, export, delete and the four links all stay reachable. `trustCenterPolicyLinks.test.tsx` opens all four URLs.

## Truthful sweep (every line on the screen)
- Hero "Your health data is sensitive. Here is exactly how it is protected.": neutral, unchanged.
- Encryption "Encrypted in transit; secure token storage": true (f55cc61b audit), unchanged.
- Export "Usually ready to download in about a minute" and Delete "A grace period to change your mind before permanent deletion": unchanged, pinned by earlier tests.
- "You — always": unchanged.
- Coach line: state-driven (above).
- Community/leaderboard line: unchanged.
- Roman line: "Not your coach — ..." only when a coach is linked; otherwise "Your Roman conversations are kept until you delete them or your account".
- Service providers, never sold, and the three "Security and storage" bullets: unchanged.

## Tests
- New: `src/screens/__tests__/trustCenterTruth.test.tsx` (19 tests). It covers every coach-line variant (some on, three on, all on, food and check-ins on, all off, owner account, owner not reported with one on and with all off, switches not loaded), no coach line while loading, with no coach or for a coach account, the copy rules, and renders for each state. It also covers U3 (no trust-meta read, no invented rows), U4 (the Terms link opens `TERMS_URL`) and U5 (the exact alert text).
- Updated: `trustCenterPolicyLinks.test.tsx` (four links, Terms included, alert path, and a signed-in client with a coach so the Roman line is pinned as before) and `privacyDataLook.test.tsx` (four links, alert path, no account read).
- README: `src/screens/client/README.md`, Trust Center paragraph.

Size: 7 files, +377 / -117 (494 lines). No new dependencies, no lockfile change, no new `as any` / `as unknown as` / `as never`. Colours come from the theme only.

agent 131
