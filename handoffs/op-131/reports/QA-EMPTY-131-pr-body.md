**Tier:** T1 (mobile, style and copy only)
**Why:** shared empty-state presentation and two title styles. No data, auth, payment logic, navigation, API or backend change.
**T4 trigger scan:** auth no; RLS/tenancy no; PII no; money no (CheckoutReturnScreen and PurchaseUnpackScreen each change one title style object: no payment logic, copy, route or handler changes); credentials no; destructive data no.
**T3 trigger scan:** no migration, no API contract change, no route or navigator change, no new dependency, no lockfile edit, no feature flag.
**Bounded T1:** 5 components (style), 3 strings in `EmptyStateNoClients`, 3 READMEs, tests. 11 files, 389 changed lines (304 added, 85 removed).
**Canonical builder:** QA-EMPTY-131 (agent 131)
**Parent owner:** FIX_PLANS_130_131 group C3, row QA-EMPTY-131. Source: AUD-FIN-DESIGN-129 row QA-EMPTY-129 (U6, U8).
**Acceptance evidence:** failing first on main `e1688b51`: 7 of 7 new look tests and both new title tests failed for the intended reasons (listed below). After the fix, all pass, and the related suites pass locally (listed below). CI green at the head.
**Promotion triggers:** none hit. This would promote if the work reached payment logic, auth, or `HapticService` / `HapticPressable` behaviour itself.

## What changes for coaches/clients
- **A new coach with no clients (Clients tab and Messages):** the invite card is calmer. The headline is in the brand serif, and the buttons read "Share your code" and "Open invite codes" in sentence case at 44 pt with radius 4. The button that said "GO TO SETTINGS" has always opened Invite codes, and now it says so. "Copy code" is a full 44 pt target and follows the Haptics switch in Settings. The code box sits on the bone page with a thin hairline instead of a cream fill.
- **Every shared empty state** (Messages search "No results", client Train, Recipes, Fasting history, Bloodwork, coach Brief and others) has the same button: forest, radius 4, at least 44 pt tall, Inter 16. `components/EmptyState` titles are now Cormorant, its colours follow the theme, and screen readers now announce its button as a button. Body lines use the one muted grey.
- **After paying:** the "Welcome to <package>" / "You're subscribed" title and the receipt's "You're in" use the Cormorant h2 token instead of the bold system font.

## B list
None.

## U list
- **U6** (from the code, now seen in a test): the shared empty-state CTAs were square (radius 0 or 2) with 12 to 15 pt labels. `components/EmptyState` had a system-font title and a fixed palette. The NoClients CTAs were uppercase, and its code box had a cream fill. Fixed: `emptyStateLook.test.tsx`.
- **U8** (from the code, now seen in a test): the CheckoutReturn and PurchaseUnpack titles used the system font at 22/600. Fixed: one test each in `CheckoutReturnScreen.success.test.tsx` and `purchaseUnpackScreen.test.tsx`.
- **U-new, mislabelled button** (from the code, now seen in a test): the NoClients "GO TO SETTINGS" button and its body line named Settings, but the button opens Invite codes (Clients: `navigate('InviteCodes')`; Messages: `ClientsStack > InviteCodes`). Fixed: the button now reads "Open invite codes" (with a matching accessibility label), and the body reads "Set up your invite code to get started."
- **U-new, unannounced button** (seen in a test): the `components/EmptyState` CTA had no `accessibilityRole`. Fixed: it now has role button with the label.
- **U-new, haptic ignored the switch** (from the code, now seen in a test): Copy code called `expo-haptics` directly, which ignored the Haptics switch. Fixed: it now goes through `HapticService.softImpact()`.

## Routes/actions before -> after
| Where | Label before | Label after | Destination / effect |
| --- | --- | --- | --- |
| `ui/empty-states/EmptyState` CTA | any `ctaLabel` (e.g. "Clear search", "Try again") | same | `onCta`, unchanged (now pressed through HapticPressable, light) |
| `components/EmptyState` CTA | any `ctaLabel` (e.g. coach Brief "Try again") | same | `onCta`, unchanged (HapticPressable, light) |
| NoClients, no code yet | GO TO SETTINGS | Open invite codes | `onGoToSettings ?? onInvite`, unchanged: Invite codes screen |
| NoClients, code loaded | SHARE YOUR CODE | Share your code | `Share.share` with the code and deep link, unchanged |
| NoClients, code loaded | Copy code | Copy code | `Clipboard.setStringAsync(code)`, unchanged; soft haptic now via `HapticService` |
| CheckoutReturnScreen | all CTAs | unchanged | unchanged (title style only) |
| PurchaseUnpackScreen | Done, Go to deliverables, Retry, item rows, refresh | unchanged | unchanged (title style only) |

Parity is proven in tests. `emptyStateLook.test.tsx` covers the base CTA handler, the components CTA handler and the NoClients invite handler. `ClientsListLookup124.test.tsx` (unchanged, passing) covers `navigate('InviteCodes')` plus the real Share message and Copy. `CoachInboxV2.test.tsx` and both money suites are unchanged and passing.

## Truthful sweep
These are the only copy lines touched, all in `EmptyStateNoClients`:
- "Open invite codes": true, because it opens the Invite codes screen.
- "Set up your invite code to get started.": true in this state, because the coach has no code yet. It is neutral and instructional.
- "Share your code": true, because it opens the share sheet with the code.

No title text changed. No counts, promises, praise or invented state were added. There are no first-person lines, no exclamation marks, and colours come from the theme only (`useTheme().colors` in the base, `semanticColors` elsewhere, and no new hex literals).

## README update (doctrine section 8)
- `src/ui/empty-states/README.md`: new "Look (QA-EMPTY-131)" section, and the Tests section now names `emptyStateLook.test.tsx`. Lines 18 to 20 are untouched; m#542 edits that block.
- `src/components/README.md`: the EmptyState row now describes the current look.
- `src/screens/client/README.md`: the CheckoutReturnScreen and PurchaseUnpackScreen rows note the h2 title token.
- `docs/QUIET_LUXURY_DOCTRINE.md`: not edited, because no rule changed.

## Tests
- Failing first on main `e1688b51` (run locally): `emptyStateLook.test.tsx` failed 7 of 7. The failures were radius 0 vs 4, body `#3D3D3A` vs textMuted, title fontFamily undefined, no button role, "GO TO SETTINGS" present, cream code box, and soft haptic not called. Both new title tests failed with fontFamily undefined vs `CormorantGaramond_400Regular`.
- After the fix (one file at a time): emptyStateLook 7/7, EmptyState 17/17, CheckoutReturnScreen.success 5/5, purchaseUnpackScreen 36/36, ClientsListLookup124 16/16, CoachInboxV2 10/10, CoachBriefScreenRoman 8/8, Recipes.quiet128 7/7, scopedTokenGate 59/59, quietLuxuryDoctrine 30/30. A targeted typecheck of the 8 changed source and test files was clean.

## Out of scope (in the lane report, with defaults)
- `HapticPressable` ignores the Haptics switch. Default: route it through `HapticService` in a QA-THEME job.
- The CheckoutReturn CTA is radius 10 and about 42 pt, and PurchaseUnpack uses radius 10/12/14. Default: a later money-screen style pass.
- `src/components/community/EmptyState.tsx` and `EmptyStateNoWorkouts.tsx` are not touched (the second is m#542).

agent 131
