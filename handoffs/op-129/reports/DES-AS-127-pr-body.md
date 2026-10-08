Tier: T1 mobile presentation only.
Why: Reduce visual load while retaining every package, price, inclusion, term and purchase pathway.
T4 trigger scan: Purchase-adjacent files, but no money, Stripe, entitlement, identity, legal text, tenancy, credentials or destructive-data logic changed. Amounts, formatting, API calls, purchase states and checkout sequence are frozen.
T3 trigger scan: No route, navigator, dependency, data-contract or orchestration changes.
Bounded T1: Four owned surfaces, their existing tests, one existing package README paragraph.
Canonical builder: DES-AS-127, agent 128.
Parent owner: operator agent 128.
Acceptance evidence: Failing-first detail-style assertion; targeted screen/action tests and existing native purchase regressions pass. Scoped semantic-token and doctrine gates pass. Main sync is clean.
Promotion triggers: Any required purchase/price/state change goes to the operator; none implemented.

## What changes for coaches/clients
Package names and prices are easier to scan, with serif type, tabular figures, open bone-page sections and hairline dividers instead of cream boxes. Reading and action copy uses Inter. Payment detail is grouped under “How it works” and “What's included.” Purchase, back, retry and update-card controls have 44-point targets. The selected sheet row stays AA-readable in both modes. Preview checkout remains disabled.

No package is recommended or selected by the styling change. The list retains a purchase control for each package rather than inventing a preferred plan; rules 4/6 take priority over a single list-wide primary.

## B/U list and truthful sweep
- B introduced: 0. U: quiet hierarchy, token typography, readable fineprint and comfortable targets.
- Existing frozen-copy concern, reported to operator, not modified: `PackageCheckoutScreen.tsx:123-126` says “You are offline” / “because the phone is offline” on any no-response request. A response-less transport failure does not establish connectivity. Smallest recommended follow-up: neutral connection-failure wording, without changing error branching or checkout sequence.
- Every existing visible line is preserved word for word, including legal lines and purchase-state text. Names, descriptions, features, billing intervals, trial days, current-plan details and amounts still use the same actual fields and conditions.
- The only added copy is the neutral section heading “How it works,” above the existing actual price/interval/trial information. Existing “What's included” becomes an 11-point small-caps overline; all inclusions stay visible.
- Empty features/trial data and supplied trial/one-time variants are tested. No counters, claims, testimonials, promises or images added.

## Routes/actions before -> after
All destinations, effects, state guards and tap counts stay the same; no removals.

| Surface / label | Before -> after destination or effect | Evidence |
| --- | --- | --- |
| Packages / Back | `goBack()` -> same | Mounted action test |
| Packages / Enter a coach code | Parent Home → Messages `{openCoachCode:true}` -> same | Mounted coachless test |
| Packages / Message your coach (both empty-list variants) | Parent Home → Messages, fallback Messages -> same | Mounted empty-list test; unchanged handler |
| Packages / Update card | Native UpdateCard `{autostart:true}` -> same | Mounted dunning action test |
| Packages / View what's included | Deliverables `{purchaseId,packageName}` when enabled -> same | Mounted current-plan test |
| Packages / each Buy/Subscribe/Claim CTA | Shared `purchase.start(pkg.purchasable)` -> same | Native subscription purchase regression |
| Packages / Current plan CTA | Disabled -> disabled | Mounted current-plan test |
| Packages / Tap to retry | `load()` -> same | Mounted retry test |
| Packages / pull to refresh | `onRefresh` reload -> same | Unchanged RefreshControl and handler |
| Packages / Your plans: End my plan, confirmation Cancel/End, Keep my plan | Same cancel/resume API and confirmation -> same | Existing mounted cancellation + YourPlansPanel recovery regressions |
| Packages / Your plans: Update card, Try again, Email support, copy-address fallback | Same native card route/list reload/support email/copy -> same | Unchanged panel slot/callback; panel recovery regressions |
| Packages / SmartDunningBanner Update card, Message coach | Same component, same surface prop -> same | Unchanged component placement |
| Detail / Continue to payment | `onPay` -> same | Mounted buyer CTA test |
| Detail / preview checkout | Disabled, no handler -> same | Mounted preview tests |
| Checkout / Go back | `navigation.goBack()` -> same | Mounted action test |
| Checkout / Try again | Share-token reload -> same | Mounted retry test |
| Checkout / Continue to payment | Same shared native purchase flow -> same | Native subscription-intent regression |
| Checkout / Continue, Open your plan | Reset purchase → ClientPackages -> same | Mounted purchase success regression; unchanged leave callback |
| Sheet / package radio rows | Select package and clear notice -> same | Mounted selection and native payment regressions |
| Sheet / Select/Subscribe/Claim CTA | Shared `purchase.start(selected)` -> same | Existing one-time, recurring, trial, free and disabled-state tests |
| Sheet / Skip for now | Same suppression storage write and dismiss -> same | Mounted Skip test |
| Sheet / native close | Same skip / payment-success callback by phase -> same | Mounted native-close test; unchanged phase guard |
| Sheet / Continue | `onPaymentSuccess` -> same | Native payment success/pending tests |
| Sheet / Open your plan / Continue to the app | `onOpenPlan(id)` or `onDismiss()` -> same | Existing mounted open-plan variants |
| All purchase feedback / Check again | Shared purchase recheck -> same | Existing recurring slow-confirmation test |
| All purchase feedback / Confirm new price | Same purchase confirmation -> same | Existing price-change regression |
| All purchase feedback / Email support / copy-address fallback | Same support component and handlers -> same | Unchanged PurchaseFeedback slot; existing support regressions |

## Validation
- Detail preview/buyer presentation: 13 tests.
- Package list native purchase/actions: 5 tests.
- Share-link checkout native purchase/actions: 5 tests.
- Selection sheet styling/contrast/selection/skip/native close: 4 tests.
- Existing sheet one-time purchases: 24 tests.
- Existing sheet recurring/trial/free purchases: 37 tests.
- Existing YourPlansPanel recovery: 22 tests.
- Scoped semantic-token gate: 59 tests.
- Quiet-luxury doctrine: 30 tests.
- Repository voice guard: 8 tests.
- Targeted ESLint: all eight modified TS/TSX files clean.
- No full-project local test/typecheck/lint run; individual files run serially through `ops/heavy.sh`. CI supplies full checks.
- Existing package README paragraph edited in place; no appended shared-doc entry.
