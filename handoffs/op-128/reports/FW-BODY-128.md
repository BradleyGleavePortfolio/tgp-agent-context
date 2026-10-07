# FW-BODY-128 — first week: body and health (FW-AUD-128 instance, Claude Opus 5.5, read-only)
Status: DONE 14:46 PDT 10-07 (operator credit-emergency stop 14:46; trace was complete, nothing marked not checked except the B1 on-device confirmation). No code, no PRs, no comments. No Supabase reads (none needed).

## Scope traced
Read at mobile origin/main 4185b9b2 (newer than RO-mobile d0875d26; includes merged m#470 Progress/Report copy) and backend origin/main
c7caffff (read-only detached worktrees /home/user/workspace/wt/FW-BODY-128-{mobile,backend}).
- Weight log: More > Progress (ProgressScreen.tsx, progress/weightHistory.ts), Day-1 win "Log your starting weight" -> Progress,
  More > Progress > Report (ReportScreen.tsx); backend src/weight/* (POST /weight, GET /weight/history only), WeightLog model.
- Goals / body stats: useMacroTargets.ts (goalWeight/height/tdee), useCurrentUser profile fields, consultation target_weight_lbs/height_cm.
- Body measurements / progress photos: no such feature exists on mobile or backend (no model, no route, no screen). Nothing customer-facing
  claims it does (help/trust pages say "body measurements" = profile height/weight/body fat, true). Nothing to audit beyond that.
- Apple Health / Health Connect: More > Connected devices (ConnectionsScreen, ConnectProviderSheet, DisconnectConfirmDialog,
  disconnectCopy, onDeviceCopy), More > Health and sleep (WearablesShell, HealthFitnessScreen, BodyCard, MetricDetailScreen), sync on
  Health open (refreshOnDevice), FEATURE_WEARABLES_INGEST_POST=true in production. Coach side: ClientDetail Fitness/Recovery tabs ->
  GET /v1/wearables/samples?clientId (wearable-samples.service.ts assertCoachOwnsClient).
- Units: weight is lbs everywhere manual; Apple Health weight is kg everywhere; ClientSettings.unit has no UI and no reader.
- Both states: coachless client and coached client (Coach sharing scopes FITNESS_*). Memory on/off not relevant to this area.
- Open PRs touching these files: only mobile#483 DES-H-128 (HealthFitnessScreen, dual APPROVE at a0b75d12, not merged) — judged at its
  head; it fixes the rings, stale banner and colours. No open PR touches ProgressScreen, ReportScreen, weightHistory, useMacroTargets,
  ConnectProviderSheet, disconnectCopy, coachSharingCopy, api.ts or backend src/weight/*. Queued (not launched): DES-P-128 (Progress
  look), DES-AZ-127 (Connections, WearablesShell, MetricDetail look).

## (1) B list
B1. Log weight sheet is covered by the iPhone number pad (code read; confirm on one device).
- Story: a new client on an iPhone taps "Log your starting weight" (Day-1) or + on Progress; the decimal pad slides up over the bottom
  sheet, hiding the weight field and the Save button, and the decimal pad has no Done key and nothing dismisses it, so the first
  weigh-in cannot be saved.
- Where: mobile src/screens/client/ProgressScreen.tsx:771-812 (transparent Modal, sheet at flex-end, ~289 pt tall, autoFocus
  decimal-pad, no KeyboardAvoidingView / Keyboard.dismiss; styles 1133-1144). LogScreen/MessagesScreen use KeyboardAvoidingView; this
  sheet does not.
- Smallest fix: wrap the sheet in KeyboardAvoidingView (behavior "padding" on iOS), make the overlay a Pressable that calls
  Keyboard.dismiss, disable Save while the POST is in flight. Test: render, focus, assert Save reachable/press calls weightApi.log once.

B2. Coach sharing says "Choose what your coach sees", but Apple Health / Health Connect data ignores those switches (T4 privacy; Opus).
- Story: a coached client opens Settings > Privacy > Coach sharing, turns Weigh-ins and Workouts to "Not shared", and their coach still
  sees their Apple Health body weight, workouts, sleep and heart rate on the client's Fitness and Recovery tabs.
- Where: mobile src/components/coachSharing/coachSharingCopy.ts:5 (intro) + src/screens/settings/CoachSharingScreen.tsx:79; backend
  src/wearables/samples/wearable-samples.service.ts:257-260 and 326-348 (coach read checks coach_id only, no FITNESS_* consent; by
  design per src/consent/coach-sharing-notice.ts:19-20). The Connect sheet does disclose coach access (ConnectProviderSheet.tsx:689-699),
  so the operator may grade this U; I grade it B because the Coach sharing screen states a false control over health data.
- Smallest fix (T3 copy, now): add one line under the intro: "Apple Health and Health Connect data is shared with your coach while it is
  connected. Manage it in Connected devices." with a link to Connections. Larger fix = NEW N3 (backend gate), owner decision.

## (2) U list
U1. Goal weight never shows: Progress "Goal" is always "--" and the Goal progress card never renders, even though the consultation saved
  target_weight_lbs. ProgressScreen.tsx:396 reads macroTargets.goalWeight, which useMacroTargets.ts:100-110 only copies from a per-user
  cache nobody writes (writers use the legacy key 'macro_targets' that useMacroTargets.ts:66 deletes). Fix: read
  currentUser.profile.target_weight_lbs.
U2. "Body Stats" heading renders over an empty grid for everyone: BMI needs macroTargets.height (same dead cache, :405), TDEE the same
  (:721). GET /weight/history already returns height_cm (backend weight.service.ts) and the profile has height_cm. Fix: BMI from
  height_cm, shown as a number in monochrome (no Underweight/Obese colour coding, rule 3 "no red for over"); hide the heading when empty.
U3. Invented calorie target: CalorieRing shows "/ 2000 kcal" when no target exists (and while targets load). ProgressScreen.tsx:543.
  Fix: no target -> show eaten kcal and "No calorie target yet"; macro bars "0/0g" -> hide.
U4. Cannot delete or edit a weigh-in: typo "1800" or a second same-day entry stays forever in the chart, Start/Change, the coach's
  Progress tab and Roman's context. Backend has only POST/GET (src/weight/weight.controller.ts:17-25; weightLog.create is the only
  write in the codebase). Fix: job J2.
U5. kg clients forced into lbs: the sheet says "Weight (lbs)" (ProgressScreen.tsx:786), weightHistory.ts:41 hard-codes 'lbs', the
  consultation's metric choice is not used, Settings has no unit row (useSettings.ts:8 unit is never read). A metric client who types
  80 saves 80 lb. Meanwhile Apple Health weight shows only in kg (wearablesTheme.ts:263, BodyCard, MetricDetail). Two units for the same
  body on two adjacent screens. Fix: NEW N1.
U6. Raw validation error: a weight under 40 or over 1500 shows "Couldn't log weight / Bad Request" (class-validator message array falls
  through types/common.ts:58-62 to `error`). ProgressScreen.tsx:385. Fix: validate 40-1500 client-side with "Enter a weight between 40
  and 1,500 lb."; also "Please enter a valid number." -> "Enter your weight as a number."
U7. Report screen numbers: Start reads profile.current_weight (ReportScreen.tsx:82), which the server never sends (it sends
  current_weight_lbs), so Start is "--" and Change never shows; gain is coloured error red (:157). Fix: current_weight_lbs, monochrome.
U8. Change colour assumes weight loss (green down / amber up, ProgressScreen.tsx:591): a muscle-gain client sees progress as a warning.
  Fix: monochrome, say it in words ("+1.2 lb since first weigh-in").
U9. Dates in Recent entries are raw "2026-10-07" (ProgressScreen.tsx:741; Report :168). Fix: "Wed 7 Oct".
U10. Coachless copy says "your coach": Connect sheet "so your coach can personalize your training..." (ConnectProviderSheet.tsx:697)
  and Disconnect "your coach stops seeing..." (disconnectCopy.ts:41,46-47) for clients with no coach. Fix: coachless variant ("so your
  plan and Roman can use real signals" / drop the coach clause).
U11. Health error card on #483 head still reads "Couldn't reach health server / Your data is safe — try again." (HealthFitnessScreen.tsx
  ~195 at a0b75d12): jargon, em dash, unverifiable reassurance. Fix after #483 merges: "Health data did not load." + "Try again".
U12. Start/Change/Goal % on Progress are relative to the first entry inside the selected period (weightLogs is period-filtered,
  ProgressScreen.tsx:395), labelled "Start". Harmless in week one; fix with J1 by labelling or using all-time first entry.
Design-only (rule 3) items, already in the queued DES-P-128 brief, not re-reported: FAB, cream cards, coloured macro dots, BMI colours,
  uppercase 10 pt labels, shadow. Connections status badges in green/amber/red and legacy fixed palette (ConnectionsScreen.tsx:89-95,
  51) are DES-AZ-127's.

## (3) Dead-button table (every tappable element in the area)
| Screen | Element | Effect | Verdict |
|---|---|---|---|
| More | Progress / Health and sleep / Connected devices | Progress, Health (WearablesShell), Connections | works (wearable rows: iPhone always, Android in HC builds) |
| Progress | Share (run >= 3) | ShareCard with "days in a row with a weigh-in" | works |
| Progress | Report icon | Report | works |
| Progress | 7D/30D/90D/All | re-fetch history (All = 365 d) | works |
| Progress | + (FAB) | opens Log weight sheet | works |
| Log weight sheet | Close X / Save | close / POST /weight | Save unreachable on iPhone (B1) |
| Progress | chart Try again | reload | works |
| Progress | Recent entries rows | none | not tappable; no edit/delete (U4) |
| Report | Back | goBack | works |
| Health | metric cards | WearableMetricDetail | works (coach embed read-only) |
| Health | Connect a tracker / Try again | Connections / refetch | works |
| Connections | Connect, Reconnect, Disconnect, pull to refresh, Try again | sheet / confirm dialog / refetch | works |
| Connect sheet | Continue, Try again, Continue import, Open/Get Health Connect, Log in again, Cancel/Close | permission + import / resume / settings / store / sign-out / close | works |
| Disconnect dialog | Cancel / Disconnect | close / soft-disconnect | works |
| Metric detail | Connect CTA, toast Dismiss | Connections / hide | works |
No dead buttons found; one unreachable button (B1).

## C one-liners
- C (edge, deferred to 10k clients): double-tap Save can create two entries (fixed anyway by J1 busy state).
- C (edge, deferred to 10k clients): comma decimal ("82,5") parses as 82 on comma-locale keyboards.
- C (edge, deferred to 10k clients): stale banner time uses the query window end, not last sync.
- C: NSHealthUpdateUsageDescription says the app may write workouts; it requests no write types (harmless).
- C: profile current_weight_lbs never updates from weigh-ins, so targets do not follow body weight (product decision, not week one).

## (4) First-week polish (ranked)
1. FIX — Log weight sheet usable on iPhone (B1), with Save busy state and plain validation copy (U6). J1.
2. FIX — Delete and edit a weigh-in (U4). J2 (backend) + J2M (mobile row action).
3. FIX — Progress shows true numbers from the consultation: goal weight, BMI from height, no invented 2000 kcal, no empty Body Stats
   heading, real dates, monochrome change (U1-U3, U8, U9, U12). J1.
4. FIX — Coach sharing tells the truth about Apple Health / Health Connect; coachless Connect/Disconnect copy (B2, U10). J3.
5. NEW — kg/lb choice. Recommended default: YES — default from the consultation unit (metric -> kg), one "Units" row in Settings,
   storage stays lbs server-side, Progress/Report/Health all display in the chosen unit. (Overlaps FW-ACCOUNT "units".)
6. NEW — Smart-scale weigh-ins from Apple Health / Health Connect appear in the Progress trend (read-only, marked "From Apple Health").
   Recommended default: YES, after J1 and N1 (same chart, one unit).
7. FIX — Report screen Start/Current/Change truthful (U7). J4.
8. NEW — Before the first weigh-in, show the consultation weight as "At consultation" on Progress (no fake log row). Default: YES.
Not recommended for launch: progress photos and body measurements (no feature exists; nothing claims it). Default: NO, post-launch.
NEW N3 (owner): coach access to device health data follows Coach sharing switches (backend gate in wearable-samples.service.ts and
  wearable-insights.service.ts, T4). Recommended default: J3 copy now; N3 after launch.

## (5) Proposed fix jobs (file-disjoint from each other and from open PRs; each < 400 lines)
J1 FW-BODY-J1-128 — GPT-6.1 Sol, T1 mobile, ~200 lines. "Log weight works on iPhone and Progress tells the truth."
  Files: src/screens/client/ProgressScreen.tsx, src/screens/client/progress/weightHistory.ts,
  src/screens/client/__tests__/ProgressScreen.weighIn.test.tsx (new). Do: B1 fix; U1 (profile.target_weight_lbs), U2 (height_cm from
  /weight/history or profile, monochrome BMI, hide empty heading), U3, U6, U8, U9, U12. Failing-first tests for each. Mobile must work
  against current production (it does: no new endpoint). Sequencing: launch before DES-P-128 (same file); DES-P branches after J1 merges.
J2 FW-BODY-J2-128 — Claude Opus 5.5, T4 (destructive user data), backend, ~180 lines. Files: src/weight/weight.controller.ts,
  src/weight/weight.service.ts, src/weight/weight.dto.ts, test/weight.service.spec.ts (new). Do: DELETE /weight/:id and PATCH /weight/:id
  (weight_lbs, notes), both `where: { id, user_id: req.user.id }` -> 404 otherwise, student role only, aiContext.invalidateForUser after
  each. No migration.
J2M FW-BODY-J2M-128 — GPT-6.1 Sol, T2 mobile, ~150 lines, AFTER J1 merges and J2 is deployed. Files: src/services/api.ts (weightApi.remove/
  update), src/screens/client/ProgressScreen.tsx (Recent entries row -> sheet with Edit / Delete + confirm), test. Hide the action when
  the endpoint answers 404/405 (older production).
J3 FW-BODY-J3-128 — Claude Opus 5.5, T3 privacy copy, mobile, ~120 lines. Files: src/components/coachSharing/coachSharingCopy.ts,
  src/screens/settings/CoachSharingScreen.tsx, src/screens/client/wearables/ConnectProviderSheet.tsx (onDeviceDisclosure only),
  src/screens/client/wearables/disconnectCopy.ts, their tests. Do: B2 line + link to Connections; U10 coachless variants
  (useCurrentUser coach link). Coordinate with FW-COACH-128 if it proposes CoachSharingScreen changes.
J4 FW-BODY-J4-128 — GPT-6.1 Sol, T1 mobile, ~60 lines. Files: src/screens/client/ReportScreen.tsx + test. Do: U7, U9 (Report dates).
After #483 merges: U11 one-line copy to the FIX lane (HealthFitnessScreen.tsx is #483's file).

## Not fixed (needs operator)
- B1: device check on one iPhone recommended before/with J1 (code read is clear; 289 pt sheet vs ~290 pt number pad).
- B2 grading: B (my call) or U; and owner decision N3 (backend gate) — file:line above; smallest fix = J3 copy.
- N1, N2(6), N8 owner yes/no (defaults above).

## Cross-area (one line each, for the operator)
- FW-COACH: coach Progress tab says "No weight logs in the last 30 days" when Weigh-ins is not shared (only food has a shared state):
  mobile src/screens/coach/client-detail/ProgressTab.tsx:68 + useClientDetailData.ts:51.
- FW-ONB: Day-1 "Log your starting weight" lands on Progress, where B1 blocks the first weigh-in on iPhone.
- FW-ACCOUNT: ClientSettings.unit (src/hooks/useSettings.ts:8) has no Settings row and no reader.
- Workspace hygiene: /home/user/workspace/growth-project-mobile/wt/FW-ROMAN-128-mobile is a worktree created inside the shared clone
  (relative path); I made the same slip and moved mine to /home/user/workspace/wt/FW-BODY-128-mobile with `git worktree move`.

## HANDOFF
Audit complete; nothing in flight. Evidence paths: worktrees /home/user/workspace/wt/FW-BODY-128-mobile (4185b9b2) and
/home/user/workspace/wt/FW-BODY-128-backend (c7caffff), open-PR snapshots ops/reports/FW-BODY-128_prs_{mobile,backend}.json.
A fresh agent can launch J1 (Sol) and J2 (Opus) immediately; J3 (Opus) and J4 (Sol) are independent; J2M waits for J1 merge + J2 deploy.
Re-check line numbers on the then-current main before editing.
