CLIENT-POLISH-134 (agent 134), item 5 (operator 21:28): **B22 B24**. A client with no coach is never gated on their own logging.

### Trace (from the code)
- `GET /v1/checkout/entitlement` (`checkout.service.hasActiveEntitlement`) is true only with a paid purchase, so a coachless client is always `inactive` on mobile.
- On main that meant: every `withProtectedScreen` route (Log, Workout, Plan, Fasting, Macros, Roman guidance...) showed **"Logging comes with coaching"**; Home showed **"Food and water logging need active access."** with View access; Habits showed "Daily check-ins need active coaching access." plus the same gate. Reachable on every launch, online or offline.
- Server (b#888): `ClientEntitlementGuard` lets a coachless student through on routes marked `@OpenToCoachlessClient()`: ai, check-ins, fasting, insights, log, macros, meal-plans, real-meal-plans, workout-builder, workout. Water (`nutrition/water`) has no entitlement guard. Still package-only: community feed/wins/leaderboard, scheduling, coach guidelines, `ai/gateway`.

### Change
- `ProtectedScreen` / `withProtectedScreen`: new `openToCoachless` option; coachless + open screen renders the screen in every state (inactive, failed check, pending, after a stray 402). Clients with a coach: unchanged.
- `ClientNavigator`: `OWN` on Workout (5 routes), Plan, daily meal plan, Fasting, Log, Macros, AI guide. Community, upcoming sessions and Calendar keep the gate.
- `HomeScreen`: a coachless client loads today and never sees the access line; a coached client whose plan lapsed keeps it.
- `HabitsScreen`: check-in open to a coachless client; no access line for them.
- `PaywallSheet` coachless title: "Logging comes with coaching" -> "This part comes with a coach" (shown only on coach-only surfaces and the 1:1 coaching screen).

### Before -> after
| Screen (coachless client) | Before | After |
|---|---|---|
| Food log, Workout, Plan, Fasting, Macros, Roman guidance | "Logging comes with coaching" gate | the screen |
| Home | "Food and water logging need active access." + View access, no day data | today loads, Log a meal |
| Habits > Check-in | access line + gate | the check-in form |
| Community, sessions, Calendar, 1:1 coaching | "Logging comes with coaching" | "This part comes with a coach" + Enter a coach code |
| Any screen, coached client with a lapsed plan | today's gate and access line | unchanged |

### Parity table
| Prototype screen | Today's file | What matches | What differs and why |
|---|---|---|---|
| 63 LAND (Landing: Home) | src/screens/client/HomeScreen.tsx | a coachless client now lands on the ordinary Home with today's numbers and Log a meal, no access line (the prototype shows no lock on Home) | layout unchanged; only the access condition (`canLoadDay`) changed. A coached client whose plan lapsed keeps the access line (not in the prototype) |
| none (Habits > Check-in) | src/screens/client/HabitsScreen.tsx | the check-in form a coached client sees | coachless client: no access line, no gate (server route open, b#888) |
| none (no prototype lock page) | src/entitlements/ProtectedScreen.tsx, withProtectedScreen.tsx, src/navigation/ClientNavigator.tsx | no lock page in front of logging, training, plans, fasting, macros or Roman guidance for a coachless client, as the prototype assumes | the gate remains on Community, sessions and Calendar (package-only server-side) and for coached clients without access |
| none (coachless gate copy) | src/entitlements/PaywallSheet.tsx (also used by ClientPackagesScreen) | same sheet, body and Enter a coach code action | title "This part comes with a coach" instead of a logging line, because logging is open |

Not seen on a device: every row above is from the code and tests only.

### WHY / WHEN / WHO
The title came from FOOD-GATE-RETRY-130 (G1, AUD-FIN-FOOD-129) and the coachless gate (13da511a), written before b#888 opened the logging routes; the Home line from HomeScreen.foodUi131 (FOOD-UI-131). The mobile side never followed b#888.

### Tests (heavy.sh, one file at a time; seen in a test)
- new `src/__tests__/coachlessNeverGated134.test.tsx` 26/26: real EntitlementProvider + ProtectedScreen + PaywallSheet; coachless open screen in inactive / failed / pending / 402 (Android and iOS); lapsed coached client keeps the gate; coach-only screen shows the new title (no "log"); ClientNavigator wiring.
- `HomeScreen.foodUi131` 23/23 (+4: coachless inactive/unavailable/loading load today with no access line; lapsed coached keeps it). `HabitsCheckInGate` 13/13 (coachless case now expects the form). `foodGateRetry` 10/10, `coachlessGateVersionB` 19/19 (title string).
- kept green: protectedScreenFailClosed 6, entitlementProvider 3, paywallSheet 6, iosCoachManagedPaywall 6, entitlementGateKeepsWorkout 5, HomeScreen.honestCopy127 17, macroMode 5, todayTargets 3, HabitsFasting.launch 33, CoachlessEntitlement 1, clientNavigator 6. tsc clean, eslint 0 errors.

### Not seen on a device
Check on a phone as a client with no coach: Home, Food log, Train, Habits check-in open; Community shows "This part comes with a coach".

### Proposed (needs operator)
- Community feed/wins/leaderboard are package-only for coachless clients server-side; opening them needs `@OpenToCoachlessClient()` on those routes (backend). Default: leave.
- Day1Win shows only the weight card to a client without a package (Day1WinScreen); default: leave.

agent 134
