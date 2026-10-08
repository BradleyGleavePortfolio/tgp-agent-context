Tier: T1 — bounded package-editor copy and an existing-screen navigation correction.
Why: archive guidance must name real controls, avoid cancellation instructions, and never reopen retired coach-software Billing.
T4 trigger scan: no payment amounts, entitlement or subscription mutations, auth, tenancy, credentials, storage or destructive API changes. Existing archive/unpublish requests and server guards are untouched.
T3 trigger scan: no endpoint, DTO, state machine, navigator registration, route param or rollout change.
Bounded T1: one screen, its existing targeted test file and the coach README; 113 changed lines.
Canonical builder: BLD-SOL-1-131 / PACKAGE-ARCHIVE-COPY-131, agent 131.
Parent owner: operator agent 131.
Acceptance evidence: failing-first targeted file on mobile main 842eb059 — 6 failed, 34 passed; after the fix — 40 passed. Archive confirmation and refusal are exercised for on-sale/off-sale packages, and the actual suggested controls are pressed.
Promotion triggers: any change to archive eligibility, client access, cancellation, billing requirements, checkout, refunds, payments or backend mutations requires a separately routed plan.

## What changes for coaches/clients

- Archive confirmation names **Unpublish package**, and only while that button is visible.
- `PACKAGE_HAS_ACTIVE_SUBSCRIBERS`, read through the existing canonical machine-code helper, gets plain copy rather than the backend's cancellation instructions.
- On-sale refusal guidance points to Unpublish package; already-off-sale guidance points to View subscribers.
- The legacy billing-refusal dialog offers **Open Money** (`CoachMoney`) and **Contact support** (`SupportInbox`). Its copy does not claim ordinary coach tools need an active software plan.
- No client payment or access changes are introduced.

## B / U / C

- B: none.
- U: none outside this assigned plan.
- C3, assigned scope (seen in a test): nonexistent archive action label, raw cancellation instruction, and legacy Billing recovery destination.

## Routes/actions before -> after

| Label/control | Before | After |
| --- | --- | --- |
| Go back | `navigation.goBack()` | Unchanged |
| Name, description, price | Existing editable fields | Unchanged |
| One-time / Monthly / Quarterly / Yearly | Existing billing selection | Unchanged |
| Trial presets / trial length | Existing validation and save payload | Unchanged |
| Create package / Save changes | Existing durable create or update handler | Unchanged |
| Make package live | Existing publish request, save-first guard | Unchanged |
| Unpublish package | Existing unpublish request; current access unchanged | Unchanged; now named by archive guidance |
| Archive package / Cancel / Archive | Existing native confirmation and archive request | Same controls/request; honest, state-driven copy |
| Preview as buyer / Close preview | Existing preview modal, no checkout | Unchanged |
| Share link | Existing share-token-gated native share handler | Unchanged |
| Manage content | `CoachPackageContents`, same package params | Unchanged |
| View subscribers | `CoachPackageSubscribers`, same package/title params | Unchanged; now named for off-sale refusal guidance |
| Save failure: Try again / Sign in / Back to packages / Close | Existing handlers | Unchanged |
| Legacy failure: Open billing | Retired `Billing` screen | Open Money -> existing `CoachMoney` screen in the same stack |
| Contact support | Existing `SupportInbox` action on server failures | Retained; also offered on a legacy billing refusal |

## Truthful sweep

No unsupported cancellation action, nonexistent Take off sale control, automatic access change, numerical claim or coach-software-plan requirement is introduced. The on-sale check is the same `isLivePackage` helper used to render Unpublish package. The known archive code covers access grants or ongoing subscriptions without displaying an unverified count. No colour, layout, first-person string, exclamation mark or emoji is added.

The coach README documents the guidance and destination. The navigator already registers CoachMoney alongside CoachPackageEdit; no navigation configuration changes are needed.

## Checks

- One targeted file through `ops/heavy.sh`: `src/__tests__/CoachPackageEditScreen.lockPreview.test.tsx --runInBand --watch=false`.
- Failing first: 6 failed / 34 passed.
- Fixed: 40 passed, including existing create/edit, recurring terms, publish/unpublish, preview and failure-action coverage.
- Existing unrelated retry-handler act warnings remain; no full local suite, typecheck or lint was run.
- Required CI must be green at the exact head before READY.
- Agent 131 does not merge or deploy.
