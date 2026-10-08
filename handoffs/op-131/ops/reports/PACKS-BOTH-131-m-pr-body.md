**Tier:** T4 (money: the coach AI credit-pack purchase surfaces). PACKS-BOTH-131, agent 131.
**Why:** owner 10-08 09:31: AI packs need to exist, be purchasable, and work on Android and iOS. Owner 10-07 20:54: packs for AI are non-refundable.
**T4 trigger scan:** money: yes (who may see the pack checkout, and its copy). Amounts, tiers, Stripe session creation, webhooks and the backend are unchanged. Auth, RLS/tenancy, PII, credentials, destructive data: none.
**T3 trigger scan:** build config: one new build-time switch, set only in the `eas.json` preview profile. No migration, no backend change, no new dependency, no lockfile edit, no navigator change.
**Bounded T1:** one copy line; reading an existing route param.
**Canonical builder:** Claude Opus 5.5 (PACKS-BOTH-131).
**Parent owner:** operator agent 131.
**Acceptance evidence:** the tests below. Failing first on main 868a629c (main source with these tests): `androidCreditPackLink.test.tsx` 8 of 20 fail, `CreditPackCheckoutScreen.ExternalLink.test.tsx` 10 of 17 fail, `iosUsCreditPackLink.test.tsx` 1 of 16 fails. At the head all 53 pass locally, as does `scripts/__tests__/easUpdateGuard.test.js` with the re-pinned lock. `node scripts/check-expected-env.js` passes. origin/main a5f9d5b5 is merged in, with no conflicts.
**Promotion triggers:** turning the Android switch on for a Google Play build (owner decision: Google charges a fee on linked purchases in the US); any change to the checkout endpoint, amounts or webhooks.

## What changes for coaches
- **Android test app (preview build, installed directly):** AI credit packs now show (meter chip, 95% banner, the guide's last card, the hard-pause card, and the checkout screen). A pack tap opens Stripe Checkout in the system browser with the same `tgp://checkout/success` / `tgp://checkout/cancel` return links the iOS US link uses. The success link shows the receipt with the new balance, the cancel link returns to the packs, and coming back to the app refetches the balance. Seat upgrades, subscriptions and everything else sold stay hidden on Android, as today.
- **Android production and clinic builds (Google Play):** unchanged, packs stay hidden. The switch is not set there.
- **iOS:** unchanged. A test now reads `eas.json` through the real flag reader: the clinic build is `external`, the production, preview and no-profile builds are `hidden`.
- **Tapped pack carries through:** tapping $10, $25 or $99 on the guide or hard-pause card now starts that pack's checkout on the checkout screen (before, it landed on the list and needed a second tap). `'custom'` (the Custom button, the meter chip and the banner pass it) opens the list with the amount field focused. Any other value shows the list.
- **"Credit packs are non-refundable."** now sits under the pack prices on every surface that shows them (`PackOptionsRow`: checkout screen, guide, hard pause) and on the "Finish paying in your browser" state.
- The API header `X-Client-Purchase-Policy` is now `p2p-and-ai-credits` from any build that sells packs through the browser link (iOS US link or the Android switch). Android builds without the switch still send `all`.

## Backend: no PR needed (checked from the code at backend main 55aa7729)
- `POST /coach/ai/credit-packs/checkout` has no platform check: `@Roles('coach', 'owner')` and the throttle only (`src/ai-credits/coach-ai.controller.ts:62-96`).
- The DTO already accepts inline `tgp://` return links (`src/ai-credits/credit-pack-checkout.dto.ts:44-50`).
- `X-Client-Purchase-Policy` / `X-Client-Platform` are copy only, and nothing is allowed or refused because of them (`src/ai-credits/client-purchase-policy.ts:5-15`). `creditPacksSoldInCallerApp` (`:48-54`) returns true for `p2p-and-ai-credits`, so an Android link build now gets the "add a credit pack" wording instead of the renewal date.

## B / U
- **B1 (owner 09:31):** a coach on Android could not buy AI credits at all, because every Android release build hid the packs (`purchaseSurfaces.ts` `creditPackCheckoutMode`). Fixed for the Android test app. A Play build is the owner's decision.
- **U1:** `CreditPackCheckoutScreen` ignored `route.params.preselect` (passed by `AIBudgetMount.tsx:118`), so a tapped pack landed on the list. Fixed.
- **U2:** no "Credit packs are non-refundable." line anywhere (owner 20:54). Fixed.

## Files
| File | Change |
| --- | --- |
| `src/config/featureFlags.ts` | `androidCreditPackLink` (env `EXPO_PUBLIC_FF_ANDROID_CREDIT_PACK_LINK`, literal read, default off) |
| `src/config/purchaseSurfaces.ts` | `creditPackCheckoutMode` returns `external` on Android with the switch; `purchasePolicyHeader`; `CREDIT_PACK_NON_REFUNDABLE` |
| `eas.json` | preview env sets the switch to `"true"` (production and clinic do not) |
| `config/expected-env.json` | manifest entry for the new name |
| `scripts/purchase-policy.sha256` | re-pinned to the new `purchaseSurfaces.ts` (the EAS update guard refuses an unreviewed policy edit; this PR is that review) |
| `src/components/coach/ai-budget/PackOptionsRow.tsx` | non-refundable line under the prices (theme `textSecondary`, 13 pt) |
| `src/screens/coach/CreditPackCheckoutScreen.tsx` | reads `route.params.preselect`; non-refundable line on the browser wait state |
| READMEs | `README.md`, `src/components/README.md`, `src/screens/coach/README.md` rows |
| Tests | new `src/__tests__/androidCreditPackLink.test.tsx`; `CreditPackCheckoutScreen.ExternalLink.test.tsx` now runs for iOS and Android plus preselect; `iosUsCreditPackLink.test.tsx` one assertion |

## Routes/actions before -> after (screens touched)
| Surface | Label / action | Before | After |
| --- | --- | --- | --- |
| CreditPackCheckout, select | $10 / $25 / $99 | start that pack's checkout | same |
| CreditPackCheckout, select | Custom | start checkout for the typed amount (or the bounds message) | same |
| CreditPackCheckout, select | Custom amount field | type an amount | same; focused on open when `preselect` is `'custom'` |
| CreditPackCheckout, opened with `preselect` = a listed pack | (no tap) | list shown | that pack's checkout starts once |
| CreditPackCheckout | Back | goBack | same |
| CreditPackCheckout, browser wait | Done / Open checkout again | goBack / reopen the browser | same |
| CreditPackCheckout, error | Try again | back to the packs | same |
| CreditPackCheckout, success | receipt | auto-dismiss, goBack | same |
| Meter chip, 95% banner, guide last card, hard pause | pack / Custom / Buy credits | navigate SettingsStack > CreditPackCheckout `{ preselect }` | same (now also shown on an Android link build) |
| Budget push `CreditPackCheckout` | tap | Android release: Settings | Android link build: CreditPackCheckout; other builds the same |

Parity is proven in the tests (navigate targets and params, the reopen/Done/cancel/success handlers, the push route per build).

## Truthful sweep
- New copy: "Credit packs are non-refundable." It states the owner's policy (10-07 20:54). Coaches have no refund action for packs in the app (backend `refundPack` in `coach-ai-budget.service.ts:473` is owner tooling only).
- No first person, no exclamation marks, no emojis, no generic errors. Theme colours only, no new hex. Text is 13 pt or larger.
- The Android copy reuses the existing iOS link copy ("You pay TGP the pack price through Stripe checkout, which opens in your browser."), which is true on Android too.

## C (one line each)
- C: Chrome on Android can block a custom-scheme redirect that has no fresh user gesture. The coach then returns by hand, and the existing return-to-app refetch shows the balance. An https App Link `success_url` would remove this (Stripe recommends one). Default: keep `tgp://` for this round.
- C: the backend comment `client-purchase-policy.ts:41` names only iOS for `p2p-and-ai-credits`. The logic is already right. Default: update it in a later backend PR.

agent 131
