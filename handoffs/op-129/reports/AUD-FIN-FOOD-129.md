# AUD-FIN-FOOD-129 (AUD-FIN-129 instance, auditor, agent 129): finishes FW-FOOD-128's "Not checked" list

Status: DONE 16:36 PDT 10-07 (started 16:05; stopped on operator order). B=2, U=8 (U split: 5 REPRODUCED, 3 CODE-ONLY). Needs operator: 4 grading decisions (HANDOFF).

Scope is FW-FOOD-128 HANDOFF / STOPPED_HALFWAY section A, "not checked": (1) Home food/water card, (2) the paywall copy on the Food
tab, (3) the coach's view of food logs, (4) Apple Health water. FW-FOOD-128 U1-U13 are not repeated here.
Code read: mobile main a1be6fb2 and origin/main e634d19e (none of the files below changed between them); backend main c3324d4a.
Open PRs checked from locally fetched head branches, without listing PRs on GitHub:
- m#521 TRAIN-GATE-128 (0b10156d) touches `src/entitlements/{EntitlementProvider,ProtectedScreen}.tsx` and `src/navigation/ClientNavigator.tsx`.
- m#523 touches `src/components/home/HomeHeaderActions.tsx`.
- No other open PR touches these files.

Proof kinds:
- REPRODUCED means a throwaway jest render test in my own worktree `/home/user/workspace/wt/AUD-FIN-FOOD-129-mobile`. It is on the local branch `agent129/aud-fin-food-129-scratch`, which is never pushed, and runs through ops/heavy.sh.
- CODE-ONLY means traced from code, with file:line, handler and API path.
- There were no production reads or writes, no sign-in, no PRs and no comments. The backend deps had no READY file, so the backend items are CODE-ONLY.

Evidence is in `/home/user/workspace/ops/reports/AUD-FIN-FOOD-129-evidence/`:
- `zzAudFinFood129.home.scratch.test.tsx.txt` and `zzAudFinFood129.gate.scratch.test.tsx.txt`.
- `jest_main_e634d19e.txt`: 8/8 pass on main, from one run of the two scratch files.
- `jest_gate_m521_0b10156d.txt`: 4/4 pass with m#521's two entitlement files swapped in, so m#521 does not fix B2.

## B (one plain sentence each)

B1 (CODE-ONLY, T4 privacy/credential, Claude Opus 5.5): every coach who opens a client's Food log review receives that client's phone
push token in the response, so a coach, or anyone they pass it to, can send that client notifications that look like The Growth Project's.
- Path:
  - Mobile: `src/screens/coach/client-detail/FoodLogReviewSection.tsx:48` calls `src/api/coachFoodReviewApi.ts:40-42`, which requests `GET /api/coach/clients/:id/timeline?days=7|14|30`. The Timeline tab also loads it, at `useClientDetailData.ts:137` and `:240`.
  - Backend: `src/coach/coach.controller.ts:158` `getClientTimeline` leads to `src/coach/coach.service.ts:402`, which runs `prisma.user.findFirst` at `:411` with no `select`. The whole row is returned at `:494` (`client,`).
- What the row contains:
  - The User row carries `expo_push_token`, `deletion_token_hash`, `deletion_token_expires_at`, `supabase_id`, `phone`, `signup_ref` and `default_payout_method_id`.
  - The roster strips the first three on purpose (`coach.service.ts:21` `RosterHiddenField`, `:255-262`, UX-COACHLOOKUP-124). This is a missed path, not a design choice.
- Why a token alone is enough: pushes go out through `new Expo()` with no access token (`src/notifications/notifications.service.ts:111`).
- Same leak elsewhere: archive and unarchive return the full row too (`coach.service.ts:325-356`, `:359-389`, `POST /coach/clients/:id/archive|unarchive`).
- Safe to trim: no mobile code reads `client` from the timeline. The only `data.client` read is on the summary, at `useClientDetailData.ts:53`.
- Exposure today: AUD-FIN-COACH-129 OPS-1 counts 0 stored push tokens in production. Nothing has leaked yet, but tokens start arriving with the iOS build.
- Smallest fix: give `client` a `select` of `{ id, name, archived_at }` in the timeline, and return the same trimmed shape from archive and unarchive. Add a spec asserting that the token, hash and `supabase_id` are absent. About 50 lines.

B2 (REPRODUCED, T4 access gate, Claude Opus 5.5; residual of FW-TRAIN-128 B1): a paying client who opens the app on weak gym signal and taps
Food is told "Your coach manages your access" (iOS) or "Choose a Plan / Select a coaching package to access this feature." (Android). There is no way
to retry, so no food can be logged, not even into the offline queue, until the app is backgrounded and reopened with signal.
- Proof:
  - The gate test G2 ran the real `EntitlementProvider` and `ProtectedScreen` with the first `getEntitlement` returning `{ ok:false, reason:'error' }`.
  - iOS and Android both show the copy above, the Food Log is not rendered, and there is no try-again, retry or refresh control. `getEntitlement` is called once.
  - Control: the same client with an answered check sees the Food Log.
  - It still reproduces with m#521's `EntitlementProvider.tsx` and `ProtectedScreen.tsx` (0b10156d). Its `confirmedActive` only covers a re-check after a confirmed "active".
- Code:
  - `EntitlementProvider.tsx:80-101`: a failed first fetch sets `unavailable`.
  - `ProtectedScreen.tsx:53` and `:84-118` render "unavailable" the same as "no package".
  - Re-checks happen only on foreground (`EntitlementProvider.tsx:129-140`) or a 402.
  - Food route: `ClientNavigator.tsx:167`.
- Smallest fix: when the status is `unavailable` and nothing is confirmed, show "Your access could not be checked. Check the connection, then try again." with a Try again button that calls `refreshEntitlement`. The gate stays fail-closed.
- Operator may grade this U. B is recommended, the same class as FW-TRAIN B1, which was accepted.

## U, REPRODUCED (jest, scratch files above)
| id | area | finding (normal-user story) | proof | smallest fix |
|---|---|---|---|---|
| H1 | Home food card | A client without a package (coachless sign-up, or joined a coach but not yet bought) opens Home and is told "Food and water data could not refresh. Check your connection and try again." every time. The connection is fine: the paid `GET /api/log/daily` answered 402, so Retry cannot work. FW-MONEY U-8 covers the paywall sheet that also pops on Home; this false error line is new. | H1: real `clientStore`. `getDaily` rejects with the 402 body `CLIENT_ENTITLEMENT_REQUIRED` and Home renders that exact sentence. Water (not paid: `src/water/water.controller.ts:12` has no ClientEntitlementGuard) loaded fine. Code: `clientStore.ts:151-158` sets one connection message for every error; `HomeScreen.tsx:284-289`; backend `log.controller.ts:13`. | Store: on a 402, set no `loadError` (the gate already explains). Home: skip the food read while `useEntitlement().status === 'inactive'`. Operator may grade B (false customer-facing claim). |
| H5 | Home food card | After the Food Log was moved to an earlier day, a failed reload on Home keeps that day's meals and numbers under today's date: "Three meals logged.", protein "140g", "64 oz". FW-FOOD U4 is the Food Log case. The CF-FOOD-LOAD-128 fix in `setSelectedDate` does not cover this, because Home calls `loadDayData(today)` directly. | H5: store left on 2026-10-06 with three meals, both reads fail, Home shows those numbers, and the store stays on 10-06. Code: `HomeScreen.tsx:285-298`; `clientStore.ts:60-62` and `:151-158`. | In `loadDayData`, when `d !== selectedDate`, clear foods, totals and water before the request (or on failure). About 10 lines. |
| H3 | Home water | A client who chose kg in Settings sees Home water in fl oz ("17 oz" for 500 ml). FW-FOOD U7 named only the Food Log's WaterTracker; Home has its own cell. | H3: settings `{ unit:'kg' }` and water 500 ml render "17 oz" with no "ml". Code: `HomeScreen.tsx:229` `${waterOz} oz`. | When `settings.unit === 'kg'`, show ml. |
| H4 | Home food card | On first open, Home states zero intake ("0 of 150g", "0 oz") until the day arrives. There is no loading state (same class as FW-FOOD U3, on another screen). | H4: with `getDaily` pending, "0 of 150g" and "0 oz" render. Code: `HomeScreen.tsx:243-264`; `isLoading` is used only for the retry. | Show an em-dash or a skeleton until the first load for today settles. |
| G1 | Food tab gate copy | A coachless client taps Food and reads "Join a coach to start logging. Enter the code your coach gave you." Joining alone unlocks logging only if the coach's code carries a package. After redeeming a plain code, or the featured code (which offers packages to buy), Food stays locked and now says "Your coach manages your access". The gate never says food logging comes with a coaching package, and it assumes the client already has a coach who gave a code. | G1: coachless and inactive shows exactly those lines plus "Enter a coach code", with no mention of a package. Code: `PaywallSheet.tsx:45-47`, `ProtectedScreen.tsx:53-81`. Entitlement is a ClientPurchase row only (`checkout.service.ts:1092-1111`, `invite-grant.service.ts:21-37`). | Copy: title "Food logging comes with coaching", body "Join a coach with their code, then choose one of their packages." Keep "Enter a coach code". |

## U, CODE-ONLY
| id | area | finding (normal-user story) | trace | smallest fix |
|---|---|---|---|---|
| C1 | Coach view of food | Every evening from 17:00 PDT (00:00 UTC), a coach opening a client's Summary sees today's calories and macros as 0, even though the client logged all day. The summary's "today" is the server's UTC date, while entries carry the client's local date. The cause is time zones, but it happens daily for every US coach; A2 item 8 lists time zones, so the operator may reclassify it as C. | Mobile `src/services/api.ts:785-786` `getClientSummary` sends no date (called from `useClientDetailData.ts:46-48`). Backend `coach.controller.ts:184` `GET /coach/clients/:id/summary` reaches `coach.service.ts:584` `today = date \|\| new Date().toISOString().split('T')[0]`, filtered at `:598`. Client entries use the local `getTodayString()` (`src/utils/date.ts:53-55`). | Mobile passes `?date=${getTodayString()}`; the backend already accepts it. About 10 lines plus a test. |
| HC1 | Home primary action | For a client with no package and no workouts, Home's one primary button "Log a meal →" opens the Food lock screen. The "—" macro cells ("Log a meal to see your protein") do the same. | `HomeScreen.tsx:412` and `:421`; macro cells at `:429-433`; gate as in G1. | While the entitlement is inactive: coachless clients get "Enter a coach code" (the existing code sheet) as the primary; coached clients get "Message your coach". |
| C2 | Coach food review copy | The coach's Food log review prints raw values: meal "breakfast" in lower case, day "2026-10-07", chips "7d/14d/30d". The numbers are right. | `FoodLogReviewSection.tsx:188` (`{meal.meal_type}`), `:172` (`{day}`), `:90` (`{d}d`). | Sentence-case meal names, "Wednesday 7 October", and "7 days" chips. Polish. |

## Checked, no finding
- **Apple Health / Health Connect water.** TGP never reads water:
  - `HEALTHKIT_READ_PERMISSIONS` has no DietaryWater (`src/services/health/healthkit/healthKitClient.ts:279-295`).
  - The Health Connect permissions have no READ_HYDRATION (`app.json:115-129`).
  - The backend has no hydration ingest.
  - TGP also never writes to Apple Health (write `[]` at `healthKitClient.ts:318`).
  - No screen claims water sync; the connect copy names sleep, heart rate and workouts.
  - Result: no B or U. NEW (owner yes): read DietaryWater / Hydration into the day's water. Recommended default: after launch.
- **Coach food numbers.** Entry and day totals use `calories * quantity_multiplier`, the same as `/log/daily` (`src/utils/coach/foodReview.ts`; backend `coach.service.ts:631`).
- **Consent off.** The review shows "Food logs are not shared with this coach." (`FoodLogReviewSection.tsx:135`; backend `coach.service.ts:437-455`).
- **Pagination.** It is exact, with an id tie-break (`coach.service.ts:452`).
- **Home targets.** They match the Food Log's (`useMacroTargets`).
- **Not repeated: coach Weekly tab.** Its food totals ignore servings; already reported as AUD-FIN-TRAIN-129 R3 (job COACH-WEEKLY-129).

## Dead-button table (these surfaces)
| Screen | Control | Result |
|---|---|---|
| Home (no package) | Retry on "Food and water data could not refresh..." | dead: the 402 repeats (H1) |
| Home (no package, no workouts) | "Log a meal →" and the "—" macro cells | lead to the Food lock screen (HC1) |
| Food tab, first check failed | none offered | no retry control; leaving needs a background/foreground (B2) |
| Food tab, coachless | "Enter a coach code" | works (code sheet); copy over-promises (G1) |
| Coach Food log review | 7d/14d/30d, Load older days, Retry | work |

## First-week polish
- The C2 labels.
- "N meals logged" counts meal slots, so a snack counts as a meal (`HomeScreen.tsx:168-171`).

## Proposed fix jobs
Every file on these surfaces is already claimed, so each job below is a fold-in with exact files, or runs after the claim merges.
| job | model / tier | files | covers | sequencing |
|---|---|---|---|---|
| COACH-ROW-BE-129 | Claude Opus 5.5, T4 privacy, backend | `src/coach/coach.service.ts` (getClientTimeline, archiveClient, unarchiveClient only), new `test/coach-client-row-redaction.spec.ts` | B1, about 50 lines | CF-SHARE-GATE-128 claims coach.service.ts (getDashboard and getDashboardSummary only). Fold in if its PR is not READY; otherwise launch after it merges, based on main. LEFTHOOK=0. |
| GATE-RETRY-129 | Claude Opus 5.5, T4 gate | `src/entitlements/EntitlementProvider.tsx`, `src/entitlements/ProtectedScreen.tsx`, `src/entitlements/PaywallSheet.tsx` (COACHLESS_* only), new `src/__tests__/foodGateRetry129.test.tsx` | B2, G1, about 120 lines | After m#521 merges (same files). Or fold into the unlaunched MONEY-GATE-128 (same three files). |
| HOME-FOOD-STORE-129 | GPT-6.1 Sol, T1 | `src/store/clientStore.ts` (loadDayData only) plus a test | H1 (store half), H5, about 40 lines | Add to CF-FOOD-LOAD-128 (claims clientStore.ts) if not READY; else run after it merges. |
| HOME-FOOD-UI-129 | GPT-6.1 Sol, T1 | `src/screens/client/HomeScreen.tsx` plus a test | H1 (skip the food read while inactive), H3, H4, HC1, about 90 lines | Add to CF-HOME-START-128 (claims HomeScreen.tsx) if not READY; else run after it merges. |
| COACH-FOOD-DAY-129 | GPT-6.1 Sol, T1 | `src/services/api.ts` (coachApi.getClientSummary only), `src/screens/coach/client-detail/useClientDetailData.ts` (loadSummary only), `src/screens/coach/client-detail/FoodLogReviewSection.tsx`, new test | C1, C2, about 60 lines | Fold into COACH-WEEKLY-129 (AUD-FIN-TRAIN-129, same hook file). api.ts is also edited by CF-GUIDE-READ-128 (getMyGuidelines only), so base on main and change one line. |

## C one-liners and cross-area
- **STORE-AUD-129, C:** `app.json:30` NSHealthUpdateUsageDescription says the app "may write workouts", but the app never requests write access.
- **FW-COACH / EXPLORE-COACH, not traced:** `useClientDetailData.ts:53` reads `data.client.archived_at` from the summary, which has no `client`. That is dead code, and the Archive/Unarchive state may come from elsewhere.

## HANDOFF
- Branch `agent129/aud-fin-food-129-scratch` is local only and never pushed. It has no commits: the head is origin/main e634d19e plus two untracked scratch tests, in worktree `/home/user/workspace/wt/AUD-FIN-FOOD-129-mobile`. Auditors open no PRs.
- Done: all four FW-FOOD-128 "not checked" items. B=2: B1 is the coach timeline push-token leak (CODE-ONLY); B2 is the Food gate on a failed first check with no retry (REPRODUCED, also on m#521 0b10156d). U=8. Evidence is in reports/AUD-FIN-FOOD-129-evidence/.
- Left:
  - Backend jest reproduction of B1 (deps/backend had no READY file).
  - Operator decisions: grade B1, B2 and H1, and decide whether C1 is U or C.
  - Owner sign-off on the G1 copy.
  - Launching the five fold-in jobs above.
- Signed: agent 129.
