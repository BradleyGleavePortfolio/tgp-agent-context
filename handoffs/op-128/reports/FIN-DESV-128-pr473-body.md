Tier: T2
Why: Removes false availability, coach-activity and notification claims while retaining all working payment/community/package/import actions.
T4 trigger scan: none; no charge, refund, entitlement, consent, authentication or access-control changes.
T3 trigger scan: none; no backend contract, persistence, dependency or cross-domain changes.
Bounded T1: NO; conditional placeholders and source guards change what is rendered.
Canonical builder: GPT-6.1 Sol
Parent owner: TGP operator agent 128
Acceptance evidence: failing-first truthfulCopy.guard.test.ts renders every touched surface and exercises working actions; existing purchaseUnpackScreen, CheckoutReturnScreen.success and CoachPackageEditScreen tests provide expanded parity; required CI.
Promotion triggers: any change to charging, entitlement, sharing permission, authentication, or production configuration.

## What changes for coaches/clients
Purchase unpack names only released items, not guessed coach activity or guaranteed pushes. Membership explains the invite condition. Checkout confirms only known payment/access state. Private community explains invitations and stops advertising unbuilt voice notes. Coach packages and imports use neutral availability copy; real share links stay.

The case-insensitive placeholder check and retired-copy guard prevent these invented lines from returning.

Minimal shared-test exceptions: purchaseUnpackScreen.test.tsx updates only the existing empty-state test name/assertion pinned to the retired coach-activity claim; wave11Screens.test.tsx replaces the source assertion requiring the removed voice-note placeholder with an assertion against advertising that unavailable feature. No other builder-owned implementation file is changed. The matching client, coach and components READMEs now describe the changed states and retained actions.

## Backend purchase-notification verification
Backend main `a2dccecb376000e96b1e397b69c18e1c430f5790` was inspected read-only again by agent 128. The checkout notification is a coach's **first-ever payment**, gated by FEATURE_ROMAN_FIRST_PAYMENT, not an unconditional notification for each buyer. Therefore checkout does not claim “has been notified,” including the entitlement-pending state. No backend changes.

[Checkout webhook gate](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/a2dccecb376000e96b1e397b69c18e1c430f5790/src/checkout/checkout-webhook-handler.service.ts#L600-L630) and [once-ever notification service](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/a2dccecb376000e96b1e397b69c18e1c430f5790/src/notifications/coach-first-payment.service.ts#L90-L165).

## B/U user stories
- B31: A buyer with no releases sees invented coach activity and a guaranteed notification; the empty state now names releases only.
- B32/33: A client sees a promise of coach activation, notification or quick contact after checkout; copy now states only the verified access/payment condition.
- B34–37: A client or coach sees unavailable tools advertised as imminent; unbuilt/dead placeholders are removed or replaced with neutral availability.
- U: Preserve every working action, keep both role surfaces readable, and pin the retired lines in CI.

## Routes/actions before -> after

| Surface / action before | After / destination or effect |
|---|---|
| Purchase unpack: Done in empty/error/unavailable/healthy states | Same -> Home |
| Purchase unpack: Retry; pull to refresh | Same drops/receipt reload |
| Purchase unpack: ready/upcoming workout, meal-plan, message drop | Same -> WorkoutAssignmentDetail, ClientDailyMealPlan, Messages; unsupported/unmaterialised assets stay non-tappable |
| Purchase unpack: See all deliverables | Same -> Deliverables with purchaseId and packageName |
| Purchase unpack: receipt and next charge | Same real amount/date/recurring facts |
| Membership: Back | Same -> previous screen |
| Membership: View coaching plans | Same -> ClientPackages; existing iOS purchase policy unchanged |
| Membership: Message your coach | Same -> Home / Messages (or existing fallback) |
| Membership: Contact support | Same help contact URL |
| Checkout: cancellation View plans; fallback Home | Same ClientPackages / Home handlers |
| Checkout: paid See what's included / Home | Same PurchaseUnpack handoff when enabled and purchaseId exists; Home otherwise |
| Checkout: secondary Home; pending Home | Same Home handler |
| Checkout: loading and verification-error state | Preserved; developer/manual-payment string replaced with a user instruction |
| Private community: pull to refresh; room and post rows | Same fetch and existing room/post content; rows are non-tappable today |
| Private community: voice-note coming-soon note/control | Removed under rules 1/2: unbuilt feature, no working handler |
| Coach packages list: Back; Create package; Create your first package | Same previous screen / CoachPackageEdit with packageId null |
| Coach packages list: each package row; refresh | Same CoachPackageEdit with full initialPackage / list reload |
| Coach package edit: Back; name; description; price; billing interval; free-trial presets and custom days | Same editor and validation |
| Coach package edit: Save changes / Create package | Same update/create and durable create-intent handling |
| Coach package edit: Make live / Take off sale; Archive / Cancel / confirm Archive | Same publish/unpublish/archive handlers and guard states |
| Coach package edit: Preview as buyer; Close preview | Same preview sheet and close |
| Coach package edit: Share package link with a real token | Same OS share payload |
| Coach package edit: disabled “Share links are coming soon” row | Removed under rules 1/2: no token and no handler; no working share pathway removed |
| Coach package edit: Manage content; View subscribers | Same PackageContentBuilder / PackageSubscribers with packageId |
| Extension pairing: auto-start; Copy code; Cancel | Same start/clipboard/cancel handlers |
| Extension pairing: Review import | Same ClientsStack / ClientsList |
| Extension pairing: Get a new code / Try again / Retry / Start again | Same retry handler for the corresponding recoverable states |
| Extension pairing: readiness/import-status journey | Same child, props and request flow; unsupported state now neutral |

## Ordering and guard dependency
This is PR 2 after #470. The app-wide retired-lines test intentionally requires the DES-T copy sweep and #470 to land; it must not be weakened with an allowlist. No shared tokens, navigation, App.tsx, dependencies or lockfiles are changed.

Upstream #469, #470 and [#478](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/478) are merged. Agent 128 began this finish only after #469 and #470 merged and merged `origin/main` without conflicts. All eight required retired phrases are absent in the app-wide guard; no allowlist, ownership exception or relaxed guard was added.

## Test stage
Implementation is complete. Corrected acceptance tests against unchanged main passed lint/typecheck and failed on retired copy ([failing-first run](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37664648432)); opening fixture issues were corrected. The latest tests retain real package helpers, exercise support-link and refresh handlers, and cover all four confirmed Profile sharing combinations plus an unavailable read. After the dependency merge, local failing-first validation reproduced exactly the four obsolete Profile expectations (15 other guard/parity tests passed). The fixtures now match #470's coach-scoped shared/not-shared wording and reject the retired exclusive-access phrase.

Local proof through the shared heavy-command lock: **150/150 tests across six individually run files** — truthfulCopy.guard (20), quietLuxuryDoctrine (30), purchaseUnpackScreen (35), CheckoutReturnScreen.success (4), CoachPackageEditScreen.lockPreview (35), wave11Screens (26). The new unavailable-coach variant first failed locally on the previous fallback; it now uses neutral release copy instead of inventing a coach. After a second fresh `origin/main` merge, guard (20) and doctrine (30) passed again.

Completed head `3a4024b50208b48eef02de79978c0936026ac11d` is **331 changed lines** (+269/-62). Initial refreshed head `964615aeb4cb637005b9aff47ffc374fe2d7c784` passed [all 684 suites / 9,027 tests and lint/typecheck](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37685953643/job/113013691069), plus CodeQL, but main then changed the adjacent Notifications README entry. Before READY, origin/main was merged again, preserving that updated entry and this PR's in-section alphabetical additions; only the README conflict required resolution. Guard (20) and doctrine (30) passed again at the new head.

Final [exact-head CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37687431676/job/113018753084) passed **685 suites / 9,044 tests**, lint and typecheck; all [CodeQL checks](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37687431675) passed. GitHub reports `MERGEABLE` at this head, verified immediately before READY.

## Truthful sweep: rows 31–37

- #31: Empty releases use the coach name if loaded; no invented activity or notification promise. Receipt, items, recurring charge and actions remain.
- #32: Membership states the invite condition, not future coach action.
- #33: Failed verification never claims a charge succeeded, pending access never claims notification or prompt contact; current backend notification evidence is above.
- #34: Invitation copy is neutral; unbuilt voice-note advertisement/control removed under rules 1/2; existing rooms/posts/refresh remain.
- #35: No-token share placeholder removed under rules 1/2; real-token sharing remains.
- #36: Unavailable package copy states current version availability.
- #37: Import copy states current account availability; copy/cancel/review/retry handlers remain.

No restyle, access-control, payment logic, consent write, dependency, lockfile, production, GitHub merge or deploy change by this builder.
